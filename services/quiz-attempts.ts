import { db } from '@/lib/db'
import { ActivityType, TopicProgressStatus } from '@prisma/client'

export async function startQuizAttempt(userId: string, quizIdOrSlug: string) {
  // Find published quiz
  const quiz = await db.quiz.findFirst({
    where: {
      OR: [{ id: quizIdOrSlug }, { slug: quizIdOrSlug }],
      isPublished: true,
    },
    select: {
      id: true,
      questionCount: true,
      isPublished: true,
    },
  })

  if (!quiz) {
    throw new Error('Quiz not found or unpublished')
  }

  // Count actual questions in DB
  const actualQuestionCount = await db.question.count({
    where: { quizId: quiz.id },
  })

  const attempt = await db.quizAttempt.create({
    data: {
      userId,
      quizId: quiz.id,
      score: 0,
      totalQuestions: actualQuestionCount || quiz.questionCount,
      correctAnswers: 0,
      startedAt: new Date(),
    },
  })

  return {
    attemptId: attempt.id,
    quizId: quiz.id,
    startedAt: attempt.startedAt.toISOString(),
    questionCount: attempt.totalQuestions,
  }
}

export interface SubmittedAnswerInput {
  questionId: string
  selectedOptionId: string
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  attemptId: string,
  answers: SubmittedAnswerInput[]
) {
  // Fetch attempt
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          subject: true,
        },
      },
    },
  })

  if (!attempt) {
    throw new Error('Quiz attempt not found')
  }

  if (attempt.userId !== userId) {
    throw new Error('Forbidden: Attempt belongs to another user')
  }

  if (attempt.quizId !== quizId) {
    throw new Error('Attempt does not belong to the specified quiz')
  }

  if (attempt.completedAt !== null) {
    throw new Error('Conflict: Quiz attempt is already completed')
  }

  // Fetch all questions and options for this quiz (including internal isCorrect flag)
  const questions = await db.question.findMany({
    where: { quizId: attempt.quizId },
    include: {
      options: true,
    },
  })

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const optionMap = new Map(
    questions.flatMap((q) => q.options.map((opt) => [opt.id, opt]))
  )

  let correctCount = 0
  const evaluatedAnswers: Array<{
    questionId: string
    selectedOptionId: string
    isCorrect: boolean
    topicId: string | null
  }> = []

  for (const ans of answers) {
    const q = questionMap.get(ans.questionId)
    if (!q) {
      throw new Error(`Invalid questionId "${ans.questionId}" for this quiz`)
    }

    const opt = optionMap.get(ans.selectedOptionId)
    if (!opt || opt.questionId !== ans.questionId) {
      throw new Error(
        `Invalid selectedOptionId "${ans.selectedOptionId}" for question "${ans.questionId}"`
      )
    }

    const isCorrect = opt.isCorrect === true
    if (isCorrect) {
      correctCount++
    }

    evaluatedAnswers.push({
      questionId: q.id,
      selectedOptionId: opt.id,
      isCorrect,
      topicId: q.topicId,
    })
  }

  const totalQuestions = questions.length
  const score =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const completedAt = new Date()

  // Transaction: persist answers, update attempt, log activity, update user progress
  const result = await db.$transaction(async (tx) => {
    // 1. Create QuizAttemptAnswer records
    await tx.quizAttemptAnswer.createMany({
      data: evaluatedAnswers.map((ea) => ({
        attemptId: attempt.id,
        questionId: ea.questionId,
        selectedOptionId: ea.selectedOptionId,
        isCorrect: ea.isCorrect,
      })),
    })

    // 2. Mark QuizAttempt completed
    const updatedAttempt = await tx.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score,
        totalQuestions,
        correctAnswers: correctCount,
        completedAt,
      },
    })

    // 3. Create Activity record
    await tx.activity.create({
      data: {
        userId,
        type: ActivityType.QUIZ_COMPLETED,
        title: `Completed ${attempt.quiz.title}`,
        description: `Scored ${correctCount}/${totalQuestions} (${score}%)`,
        metadata: {
          quizId: attempt.quiz.id,
          attemptId: attempt.id,
          score,
          correctAnswers: correctCount,
          totalQuestions,
          subjectSlug: attempt.quiz.subject.slug,
        },
      },
    })

    // 4. Safely update UserProgress for subject lastActivityAt
    const totalSubjectTopics = await tx.topic.count({
      where: { subjectId: attempt.quiz.subjectId },
    })

    const completedSubjectTopics = await tx.topicProgress.count({
      where: {
        userId,
        status: TopicProgressStatus.COMPLETED,
        topic: { subjectId: attempt.quiz.subjectId },
      },
    })

    const subjectProgressPercent =
      totalSubjectTopics > 0
        ? (completedSubjectTopics / totalSubjectTopics) * 100
        : 0

    await tx.userProgress.upsert({
      where: {
        userId_subjectId: {
          userId,
          subjectId: attempt.quiz.subjectId,
        },
      },
      update: {
        lastActivityAt: completedAt,
      },
      create: {
        userId,
        subjectId: attempt.quiz.subjectId,
        progress: subjectProgressPercent,
        completedTopics: completedSubjectTopics,
        totalTopics: totalSubjectTopics,
        lastActivityAt: completedAt,
      },
    })

    return updatedAttempt
  })

  return {
    attemptId: result.id,
    quizId: attempt.quizId,
    score: result.score,
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    completedAt: result.completedAt?.toISOString(),
  }
}

export async function getQuizAttemptResult(
  userId: string,
  quizId: string,
  attemptId: string
) {
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              shortTitle: true,
              slug: true,
            },
          },
          questions: {
            orderBy: { displayOrder: 'asc' },
            include: {
              options: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
      },
      answers: true,
    },
  })

  if (!attempt) return null

  if (attempt.userId !== userId) {
    throw new Error('Forbidden: Attempt belongs to another user')
  }

  if (attempt.quizId !== quizId) {
    throw new Error('Attempt does not belong to the specified quiz')
  }

  const isCompleted = attempt.completedAt !== null
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]))

  const questions = attempt.quiz.questions.map((q) => {
    const userAnswer = answerMap.get(q.id)
    const correctOption = q.options.find((opt) => opt.isCorrect)

    return {
      id: q.id,
      questionText: q.questionText,
      difficulty: q.difficulty,
      displayOrder: q.displayOrder,
      options: q.options.map((opt) => ({
        id: opt.id,
        optionKey: opt.optionKey,
        optionText: opt.optionText,
        displayOrder: opt.displayOrder,
        ...(isCompleted ? { isCorrect: opt.isCorrect } : {}),
      })),
      userAnswer: userAnswer
        ? {
            selectedOptionId: userAnswer.selectedOptionId,
            isCorrect: isCompleted ? userAnswer.isCorrect : undefined,
          }
        : null,
      explanation: isCompleted ? q.explanation : null,
      correctOptionId: isCompleted ? correctOption?.id : null,
    }
  })

  return {
    id: attempt.id,
    quizId: attempt.quizId,
    quizTitle: attempt.quiz.title,
    quizSlug: attempt.quiz.slug,
    difficulty: attempt.quiz.difficulty,
    subject: attempt.quiz.subject,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    correctAnswers: attempt.correctAnswers,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt ? attempt.completedAt.toISOString() : null,
    isCompleted,
    questions,
  }
}

export async function getUserAttemptHistory(userId: string, limit: number = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 50)

  const attempts = await db.quizAttempt.findMany({
    where: {
      userId,
      completedAt: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          subject: {
            select: {
              name: true,
              shortTitle: true,
              slug: true,
            },
          },
        },
      },
    },
  })

  return attempts.map((att) => ({
    id: att.id,
    quizId: att.quizId,
    quizTitle: att.quiz.title,
    quizSlug: att.quiz.slug,
    subject: att.quiz.subject,
    difficulty: att.quiz.difficulty,
    score: att.score,
    totalQuestions: att.totalQuestions,
    correctAnswers: att.correctAnswers,
    startedAt: att.startedAt.toISOString(),
    completedAt: att.completedAt ? att.completedAt.toISOString() : null,
  }))
}
