/**
 * POST /api/interviews/[sessionId]/start
 *
 * Starts an ACTIVE session and generates the 1st question if not generated yet.
 * Idempotent: returns existing Q1 if already started.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { startInterviewSession } from '@/services/interview'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params
  if (!sessionId?.trim()) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  try {
    const result = await startInterviewSession(sessionId, session.userId)

    return NextResponse.json({
      session: {
        id: result.session.id,
        status: result.session.status,
        currentQuestionNumber: result.session.currentQuestionNumber,
        questionCount: result.session.questionCount,
      },
      currentQuestion: {
        id: result.currentQuestion.id,
        questionNumber: result.currentQuestion.questionNumber,
        questionText: result.currentQuestion.questionText,
        questionType: result.currentQuestion.questionType,
        difficulty: result.currentQuestion.difficulty,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SESSION_NOT_FOUND') {
        return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
      }
      if (err.message === 'SESSION_NOT_ACTIVE') {
        return NextResponse.json(
          { error: 'Session is not active and cannot be started' },
          { status: 409 }
        )
      }
      if (err.message.startsWith('AI_QUESTION_FAILED')) {
        return NextResponse.json(
          { error: 'AI service failed to generate initial question. Please try again.' },
          { status: 503 }
        )
      }
    }
    console.error('[POST /api/interviews/start] Unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
