/**
 * POST /api/interviews/[sessionId]/complete
 *
 * Finalizes a completed interview session once all configured questions are evaluated.
 * Calculates overall arithmetic average score server-side, generates AI overall summary feedback,
 * sets status to COMPLETED, and logs an INTERVIEW_COMPLETED Activity.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { completeInterviewSession } from '@/services/interview'

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
    const completedSession = await completeInterviewSession(sessionId, session.userId)

    return NextResponse.json({
      session: {
        id: completedSession.id,
        status: completedSession.status,
        overallScore: completedSession.overallScore,
        overallFeedback: completedSession.overallFeedback,
        completedAt: completedSession.completedAt?.toISOString(),
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SESSION_NOT_FOUND') {
        return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
      }
      if (err.message === 'SESSION_ABANDONED') {
        return NextResponse.json(
          { error: 'Cannot complete an abandoned interview session' },
          { status: 409 }
        )
      }
      if (err.message === 'INCOMPLETE_QUESTIONS') {
        return NextResponse.json(
          { error: 'Cannot complete interview until all questions are answered and evaluated' },
          { status: 400 }
        )
      }
    }
    console.error('[POST /api/interviews/complete] Unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
