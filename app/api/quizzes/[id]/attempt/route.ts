import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { startQuizAttempt } from '@/services/quiz-attempts'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Quiz ID or slug required' }, { status: 400 })
    }

    const attempt = await startQuizAttempt(session.userId, id)
    return NextResponse.json(attempt, { status: 201 })
  } catch (error: any) {
    console.error('Error starting quiz attempt:', error)
    if (error.message?.includes('not found') || error.message?.includes('unpublished')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to start quiz attempt' },
      { status: 500 }
    )
  }
}
