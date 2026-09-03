/**
 * POST /api/interviews/[sessionId]/questions/[questionId]/answer
 *
 * Submits a candidate's answer for evaluation via OpenAI.
 * Evaluates answer (relevance, correctness, clarity, depth, overall score),
 * persists answer + evaluation, and auto-generates next question if questionNumber < questionCount.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { SubmitInterviewAnswerSchema } from '@/lib/validation'
import { submitAnswerAndEvaluate, checkInterviewRateLimit } from '@/services/interview'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; questionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 30 AI answer evaluations per user per hour
  const rateCheck = checkInterviewRateLimit(session.userId)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. You can submit up to 30 interview answers per hour.',
        retryAfterMs: rateCheck.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateCheck.retryAfterMs ?? 0) / 1000)),
        },
      }
    )
  }

  const { sessionId, questionId } = await params

  if (!sessionId?.trim() || !questionId?.trim()) {
    return NextResponse.json(
      { error: 'Session ID and Question ID are required' },
      { status: 400 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SubmitInterviewAnswerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const result = await submitAnswerAndEvaluate(
      sessionId,
      questionId,
      session.userId,
      parsed.data.answerText
    )

    return NextResponse.json({
      answer: {
        id: result.answer.id,
        questionId: result.answer.questionId,
        submittedAt: result.answer.submittedAt.toISOString(),
      },
      evaluation: {
        id: result.evaluation.id,
        relevanceScore: result.evaluation.relevanceScore,
        correctnessScore: result.evaluation.correctnessScore,
        clarityScore: result.evaluation.clarityScore,
        depthScore: result.evaluation.depthScore,
        overallScore: result.evaluation.overallScore,
        feedback: result.evaluation.feedback,
        strengths: result.evaluation.strengths,
        improvements: result.evaluation.improvements,
      },
      isLastQuestion: result.isLastQuestion,
      nextQuestion: result.nextQuestion
        ? {
            id: result.nextQuestion.id,
            questionNumber: result.nextQuestion.questionNumber,
            questionText: result.nextQuestion.questionText,
            questionType: result.nextQuestion.questionType,
            difficulty: result.nextQuestion.difficulty,
          }
        : null,
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SESSION_NOT_FOUND') {
        return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
      }
      if (err.message === 'QUESTION_NOT_FOUND') {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      }
      if (err.message === 'SESSION_NOT_ACTIVE') {
        return NextResponse.json(
          { error: 'Interview session is no longer active' },
          { status: 409 }
        )
      }
      if (err.message === 'QUESTION_SESSION_MISMATCH') {
        return NextResponse.json(
          { error: 'Question does not belong to this interview session' },
          { status: 400 }
        )
      }
      if (err.message === 'QUESTION_ALREADY_ANSWERED') {
        return NextResponse.json(
          { error: 'Question has already been answered' },
          { status: 409 }
        )
      }
      if (err.message === 'INVALID_QUESTION_SEQUENCE') {
        return NextResponse.json(
          { error: 'Cannot answer a future or previous question out of sequence' },
          { status: 400 }
        )
      }
      if (err.message.startsWith('AI_EVALUATION_FAILED')) {
        return NextResponse.json(
          { error: 'AI service failed to evaluate answer. Please try again.' },
          { status: 503 }
        )
      }
    }
    console.error('[POST answer] Unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
