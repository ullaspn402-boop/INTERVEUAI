/**
 * POST /api/interviews/[sessionId]/abandon
 *
 * Marks an ACTIVE interview session as ABANDONED.
 * Idempotent: returns existing ABANDONED session if already abandoned.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { abandonInterviewSession } from '@/services/interview'

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
    const abandonedSession = await abandonInterviewSession(sessionId, session.userId)

    return NextResponse.json({
      session: {
        id: abandonedSession.id,
        status: abandonedSession.status,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SESSION_NOT_FOUND') {
        return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
      }
      if (err.message === 'CANNOT_ABANDON_COMPLETED') {
        return NextResponse.json(
          { error: 'Cannot abandon a completed interview session' },
          { status: 409 }
        )
      }
    }
    console.error('[POST /api/interviews/abandon] Unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
