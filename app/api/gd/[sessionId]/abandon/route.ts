/**
 * POST /api/gd/[sessionId]/abandon — Abandon an active GD session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { IdSchema } from '@/lib/validation'
import { abandonGDSession } from '@/services/gd'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params
  const parsed = IdSchema.safeParse(sessionId)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
  }

  try {
    await abandonGDSession(session.userId, parsed.data)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SESSION_NOT_FOUND') {
        return NextResponse.json({ error: 'GD session not found' }, { status: 404 })
      }
      if (err.message === 'SESSION_ALREADY_COMPLETED') {
        return NextResponse.json({ error: 'Session already completed' }, { status: 409 })
      }
      if (err.message === 'SESSION_ALREADY_ABANDONED') {
        return NextResponse.json({ error: 'Session already abandoned' }, { status: 409 })
      }
    }
    console.error('[POST /api/gd/[sessionId]/abandon]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
