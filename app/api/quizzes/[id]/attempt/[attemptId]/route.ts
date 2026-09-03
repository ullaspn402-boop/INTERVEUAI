import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getQuizAttemptResult } from '@/services/quiz-attempts'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, attemptId } = await params
    if (!id || !attemptId) {
      return NextResponse.json(
        { error: 'Quiz ID and attempt ID are required' },
        { status: 400 }
      )
    }

    const result = await getQuizAttemptResult(session.userId, id, attemptId)
    if (!result) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching quiz attempt result:', error)
    const msg = error.message || ''

    if (msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 })
    }
    if (msg.includes('belong')) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch quiz attempt result' },
      { status: 500 }
    )
  }
}
