/**
 * Interview Service — Server-only
 *
 * Manages text-based AI interview sessions, question generation, answer evaluations,
 * final scoring, and state transitions.
 *
 * Lifecycle:
 * ACTIVE -> (answers submitted & evaluated) -> COMPLETED
 * ACTIVE -> (abandoned by user) -> ABANDONED
 *
 * Security rules:
 * - userId comes exclusively from JWT session (never client payload)
 * - Every session operation enforces session.userId === userId
 * - COMPLETED and ABANDONED sessions reject answer submissions (403/409)
 * - Questions belong to a single session and are answered once (unique constraint)
 * - Scores are calculated server-side as arithmetic average of evaluated questions
 * - Activity logged upon completion with metadata (no raw answer/prompt secrets)
 */

import { db } from '@/lib/db'
import {
  generateInterviewQuestionAI,
  evaluateInterviewAnswerAI,
  generateInterviewSummaryAI,
} from '@/services/ai'
import {
  InterviewType,
  QuizDifficulty,
  InterviewSessionStatus,
  InterviewQuestionType,
} from '@prisma/client'

// ─── Interview AI Rate Limiter ────────────────────────────────────────────────

/**
 * In-memory per-user rate limiter for AI answer evaluations.
 *
 * Strategy: 30 AI evaluation requests per user per 1-hour sliding window.
 * Each interview question answer triggers one OpenAI evaluation call.
 * Limitation: State is per-process; does not persist across restarts
 * or multiple server instances. Sufficient for single-instance deployments.
 *
 * Stage 10: Added as production hardening — interview answer route was
 * previously unlimited, creating potential for costly OpenAI abuse.
 */
const INTERVIEW_RATE_LIMIT_MAX = 30
const INTERVIEW_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

interface InterviewRateLimitEntry {
  timestamps: number[]
}

const interviewRateLimitMap = new Map<string, InterviewRateLimitEntry>()

export function checkInterviewRateLimit(userId: string): {
  allowed: boolean
  retryAfterMs?: number
} {
  const now = Date.now()
  const windowStart = now - INTERVIEW_RATE_LIMIT_WINDOW_MS

  let entry = interviewRateLimitMap.get(userId)
  if (!entry) {
    entry = { timestamps: [] }
    interviewRateLimitMap.set(userId, entry)
  }

  // Prune timestamps outside the sliding window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

  if (entry.timestamps.length >= INTERVIEW_RATE_LIMIT_MAX) {
    const oldestTs = entry.timestamps[0]
    const retryAfterMs = oldestTs + INTERVIEW_RATE_LIMIT_WINDOW_MS - now
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) }
  }

  entry.timestamps.push(now)
  return { allowed: true }
}

// ─── Session Management ───────────────────────────────────────────────────────


export interface CreateSessionOpts {
  interviewType?: InterviewType
  targetRole?: string
  subjectId?: string
  topicId?: string
  difficulty?: QuizDifficulty
  questionCount?: number
  title?: string
}

export async function createInterviewSession(userId: string, opts: CreateSessionOpts) {
  const {
    interviewType = 'TECHNICAL',
    targetRole,
    subjectId,
    topicId,
    difficulty = 'MEDIUM',
    questionCount = 5,
    title,
  } = opts

  // Validate Subject if provided
  if (subjectId) {
    const subj = await db.subject.findUnique({ where: { id: subjectId } })
    if (!subj) throw new Error('SUBJECT_NOT_FOUND')
  }

  // Validate Topic if provided
  if (topicId) {
    const top = await db.topic.findUnique({ where: { id: topicId } })
    if (!top) throw new Error('TOPIC_NOT_FOUND')
    if (subjectId && top.subjectId !== subjectId) {
      throw new Error('TOPIC_SUBJECT_MISMATCH')
    }
  }

  const defaultTitle = title || `${difficulty} ${interviewType} Interview`

  const session = await db.interviewSession.create({
    data: {
      userId,
      title: defaultTitle,
      interviewType,
      targetRole: targetRole || null,
      subjectId: subjectId || null,
      topicId: topicId || null,
      difficulty,
      questionCount: Math.min(Math.max(questionCount, 3), 15),
      currentQuestionNumber: 1,
      status: 'ACTIVE',
    },
    include: {
      subject: { select: { id: true, name: true, shortTitle: true, slug: true } },
      topic: { select: { id: true, name: true, slug: true } },
    },
  })

  return session
}

export async function getUserInterviews(
  userId: string,
  opts?: {
    status?: InterviewSessionStatus
    interviewType?: InterviewType
    difficulty?: QuizDifficulty
    limit?: number
  }
) {
  const limit = Math.min(Math.max(opts?.limit || 10, 1), 50)

  return db.interviewSession.findMany({
    where: {
      userId,
      ...(opts?.status ? { status: opts.status } : {}),
      ...(opts?.interviewType ? { interviewType: opts.interviewType } : {}),
      ...(opts?.difficulty ? { difficulty: opts.difficulty } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      subject: { select: { id: true, name: true, shortTitle: true } },
      topic: { select: { id: true, name: true } },
      _count: { select: { questions: true, answers: true } },
    },
  })
}

export async function getInterviewSession(sessionId: string, userId: string) {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: { select: { id: true, name: true, shortTitle: true, slug: true } },
      topic: { select: { id: true, name: true, slug: true } },
      questions: {
        orderBy: { questionNumber: 'asc' },
        include: {
          answer: {
            include: {
              evaluation: true,
            },
          },
        },
      },
    },
  })

  if (!session || session.userId !== userId) {
    return null
  }

  return session
}

// ─── Start Interview & Question Generation ────────────────────────────────────

export async function startInterviewSession(sessionId: string, userId: string) {
  const session = await getInterviewSession(sessionId, userId)
  if (!session) {
    throw new Error('SESSION_NOT_FOUND')
  }

  if (session.status !== 'ACTIVE') {
    throw new Error('SESSION_NOT_ACTIVE')
  }

  // Check if Question 1 already exists (idempotent start)
  const existingQ1 = session.questions.find((q) => q.questionNumber === 1)
  if (existingQ1) {
    return { session, currentQuestion: existingQ1 }
  }

  // Generate Question 1 via OpenAI
  const aiRes = await generateInterviewQuestionAI({
    interviewType: session.interviewType,
    targetRole: session.targetRole || undefined,
    subjectName: session.subject?.name,
    topicName: session.topic?.name,
    difficulty: session.difficulty,
    questionNumber: 1,
    totalQuestions: session.questionCount,
  })

  if (!aiRes.success) {
    throw new Error(`AI_QUESTION_FAILED: ${aiRes.message}`)
  }

  const q1 = await db.interviewQuestion.create({
    data: {
      sessionId: session.id,
      questionNumber: 1,
      questionText: aiRes.content,
      questionType: session.interviewType === 'BEHAVIORAL' ? 'BEHAVIORAL' : 'TECHNICAL',
      subjectId: session.subjectId,
      topicId: session.topicId,
      difficulty: session.difficulty,
    },
  })

  return { session, currentQuestion: q1 }
}

// ─── Submit Answer & AI Evaluation ─────────────────────────────────────────────

export async function submitAnswerAndEvaluate(
  sessionId: string,
  questionId: string,
  userId: string,
  answerText: string
) {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: { select: { name: true } },
      questions: {
        orderBy: { questionNumber: 'asc' },
        include: { answer: { include: { evaluation: true } } },
      },
    },
  })

  if (!session || session.userId !== userId) {
    throw new Error('SESSION_NOT_FOUND')
  }

  if (session.status !== 'ACTIVE') {
    throw new Error('SESSION_NOT_ACTIVE')
  }

  const question = session.questions.find((q) => q.id === questionId)
  if (!question) {
    throw new Error('QUESTION_NOT_FOUND')
  }

  // Verify question belongs to this session
  if (question.sessionId !== sessionId) {
    throw new Error('QUESTION_SESSION_MISMATCH')
  }

  // Prevent duplicate answer submission
  if (question.answer) {
    throw new Error('QUESTION_ALREADY_ANSWERED')
  }

  // Verify question is the current sequential question
  if (question.questionNumber !== session.currentQuestionNumber) {
    throw new Error('INVALID_QUESTION_SEQUENCE')
  }

  // Call OpenAI for structured evaluation
  const aiEval = await evaluateInterviewAnswerAI({
    questionText: question.questionText,
    answerText,
    interviewType: session.interviewType,
    targetRole: session.targetRole || undefined,
    subjectName: session.subject?.name,
    difficulty: session.difficulty,
  })

  if (!aiEval.success) {
    throw new Error(`AI_EVALUATION_FAILED: ${aiEval.message}`)
  }

  const evalData = aiEval.evaluation

  // Transactionally save answer + evaluation and update session currentQuestionNumber
  const isLastQuestion = question.questionNumber >= session.questionCount
  const nextQuestionNum = isLastQuestion ? session.questionCount : question.questionNumber + 1

  const [savedAnswer, savedEval] = await db.$transaction(async (tx) => {
    const ans = await tx.interviewAnswer.create({
      data: {
        questionId: question.id,
        sessionId: session.id,
        userId,
        answerText,
      },
    })

    const ev = await tx.interviewEvaluation.create({
      data: {
        answerId: ans.id,
        relevanceScore: evalData.relevanceScore,
        correctnessScore: evalData.correctnessScore,
        clarityScore: evalData.clarityScore,
        depthScore: evalData.depthScore,
        overallScore: evalData.overallScore,
        feedback: evalData.feedback,
        strengths: evalData.strengths,
        improvements: evalData.improvements,
      },
    })

    await tx.interviewSession.update({
      where: { id: session.id },
      data: {
        currentQuestionNumber: nextQuestionNum,
        updatedAt: new Date(),
      },
    })

    return [ans, ev]
  })

  // Auto-generate next question if not last question
  let nextQuestion = null
  if (!isLastQuestion) {
    const existingNext = session.questions.find((q) => q.questionNumber === nextQuestionNum)
    if (existingNext) {
      nextQuestion = existingNext
    } else {
      const prevQTexts = session.questions.map((q) => q.questionText)

      const nextAiRes = await generateInterviewQuestionAI({
        interviewType: session.interviewType,
        targetRole: session.targetRole || undefined,
        subjectName: session.subject?.name,
        difficulty: session.difficulty,
        questionNumber: nextQuestionNum,
        totalQuestions: session.questionCount,
        previousQuestions: prevQTexts,
      })

      if (nextAiRes.success) {
        nextQuestion = await db.interviewQuestion.create({
          data: {
            sessionId: session.id,
            questionNumber: nextQuestionNum,
            questionText: nextAiRes.content,
            questionType: session.interviewType === 'BEHAVIORAL' ? 'BEHAVIORAL' : 'TECHNICAL',
            subjectId: session.subjectId,
            topicId: session.topicId,
            difficulty: session.difficulty,
          },
        })
      }
    }
  }

  return {
    answer: savedAnswer,
    evaluation: savedEval,
    isLastQuestion,
    nextQuestion,
  }
}

// ─── Complete Session & Server-Side Overall Scoring ───────────────────────────

export async function completeInterviewSession(sessionId: string, userId: string) {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        include: {
          answer: {
            include: { evaluation: true },
          },
        },
      },
    },
  })

  if (!session || session.userId !== userId) {
    throw new Error('SESSION_NOT_FOUND')
  }

  if (session.status === 'COMPLETED') {
    return session
  }

  if (session.status === 'ABANDONED') {
    throw new Error('SESSION_ABANDONED')
  }

  // Ensure all configured questions have answers with evaluations
  const answeredQuestions = session.questions.filter((q) => q.answer?.evaluation)
  if (answeredQuestions.length < session.questionCount) {
    throw new Error('INCOMPLETE_QUESTIONS')
  }

  // Calculate arithmetic mean of overallScores (0-10 scale -> scale to 0-100 for display or keep 0-10)
  // Standard scale: 0-100 percentage score stored as float
  const totalScore10 = answeredQuestions.reduce(
    (sum, q) => sum + (q.answer?.evaluation?.overallScore || 0),
    0
  )
  const avgScore10 = totalScore10 / answeredQuestions.length
  const overallScore100 = Math.round(avgScore10 * 10) // e.g. 7.8 -> 78

  // Generate overall AI summary feedback
  const summaryRes = await generateInterviewSummaryAI({
    interviewType: session.interviewType,
    targetRole: session.targetRole || undefined,
    overallScore: avgScore10,
    evaluations: answeredQuestions.map((q) => ({
      questionText: q.questionText,
      answerText: q.answer!.answerText,
      overallScore: q.answer!.evaluation!.overallScore,
      feedback: q.answer!.evaluation!.feedback,
    })),
  })

  const overallFeedback = summaryRes.success
    ? summaryRes.content
    : 'Completed interview session with all questions evaluated successfully.'

  const completedSession = await db.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      overallScore: overallScore100,
      overallFeedback,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      subject: { select: { id: true, name: true, shortTitle: true } },
      topic: { select: { id: true, name: true } },
    },
  })

  // Create INTERVIEW_COMPLETED activity record
  await db.activity.create({
    data: {
      userId,
      type: 'INTERVIEW_COMPLETED',
      title: `Completed ${session.interviewType} Interview`,
      description: `Scored ${overallScore100}/100 in ${session.difficulty} interview rehearsal`,
      metadata: {
        sessionId: session.id,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        overallScore: overallScore100,
      },
    },
  })

  return completedSession
}

// ─── Abandon Session ──────────────────────────────────────────────────────────

export async function abandonInterviewSession(sessionId: string, userId: string) {
  const session = await db.interviewSession.findUnique({ where: { id: sessionId } })
  if (!session || session.userId !== userId) {
    throw new Error('SESSION_NOT_FOUND')
  }

  if (session.status === 'COMPLETED') {
    throw new Error('CANNOT_ABANDON_COMPLETED')
  }

  if (session.status === 'ABANDONED') {
    return session
  }

  return db.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: 'ABANDONED',
      updatedAt: new Date(),
    },
  })
}

// ─── Result Retrieval ─────────────────────────────────────────────────────────

export async function getInterviewResult(sessionId: string, userId: string) {
  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: { select: { id: true, name: true, shortTitle: true } },
      topic: { select: { id: true, name: true } },
      questions: {
        orderBy: { questionNumber: 'asc' },
        include: {
          answer: {
            include: {
              evaluation: true,
            },
          },
        },
      },
    },
  })

  if (!session || session.userId !== userId) {
    return null
  }

  if (session.status !== 'COMPLETED') {
    return null
  }

  // Aggregate breakdown scores across all evaluated answers
  const evals = session.questions.map((q) => q.answer?.evaluation).filter(Boolean)
  const count = evals.length || 1

  const relevanceAvg = Math.round(
    (evals.reduce((sum, e) => sum + (e?.relevanceScore || 0), 0) / count) * 10
  )
  const correctnessAvg = Math.round(
    (evals.reduce((sum, e) => sum + (e?.correctnessScore || 0), 0) / count) * 10
  )
  const clarityAvg = Math.round(
    (evals.reduce((sum, e) => sum + (e?.clarityScore || 0), 0) / count) * 10
  )
  const depthAvg = Math.round(
    (evals.reduce((sum, e) => sum + (e?.depthScore || 0), 0) / count) * 10
  )

  // Collect all unique strengths and improvements
  const allStrengths = Array.from(
    new Set(evals.flatMap((e) => (Array.isArray(e?.strengths) ? (e.strengths as string[]) : [])))
  )
  const allImprovements = Array.from(
    new Set(evals.flatMap((e) => (Array.isArray(e?.improvements) ? (e.improvements as string[]) : [])))
  )

  return {
    session: {
      id: session.id,
      title: session.title,
      interviewType: session.interviewType,
      targetRole: session.targetRole,
      difficulty: session.difficulty,
      questionCount: session.questionCount,
      overallScore: session.overallScore,
      overallFeedback: session.overallFeedback,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString(),
      subject: session.subject,
      topic: session.topic,
    },
    metrics: {
      relevanceScore: relevanceAvg,
      correctnessScore: correctnessAvg,
      clarityScore: clarityAvg,
      depthScore: depthAvg,
    },
    strengths: allStrengths,
    improvements: allImprovements,
    questions: session.questions.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      answer: q.answer
        ? {
            id: q.answer.id,
            answerText: q.answer.answerText,
            submittedAt: q.answer.submittedAt.toISOString(),
            evaluation: q.answer.evaluation
              ? {
                  relevanceScore: q.answer.evaluation.relevanceScore,
                  correctnessScore: q.answer.evaluation.correctnessScore,
                  clarityScore: q.answer.evaluation.clarityScore,
                  depthScore: q.answer.evaluation.depthScore,
                  overallScore: q.answer.evaluation.overallScore,
                  feedback: q.answer.evaluation.feedback,
                  strengths: q.answer.evaluation.strengths,
                  improvements: q.answer.evaluation.improvements,
                }
              : null,
          }
        : null,
    })),
  }
}
