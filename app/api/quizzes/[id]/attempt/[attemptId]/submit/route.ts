import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { SubmitQuizAttemptSchema } from '@/lib/validation'
import { submitQuizAttempt } from '@/services/quiz-attempts'

export async function POST(
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

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parseResult = SubmitQuizAttemptSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid submission payload', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const result = await submitQuizAttempt(
      session.userId,
      id,
      attemptId,
      parseResult.data.answers
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error submitting quiz attempt:', error)
    const msg = error.message || ''

    if (msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 })
    }
    if (msg.includes('Conflict') || msg.includes('already completed')) {
      return NextResponse.json({ error: msg }, { status: 409 })
    }
    if (msg.includes('not found')) {
      return NextResponse.json({ error: msg }, { status: 404 })
    }
    if (msg.includes('Invalid') || msg.includes('belong')) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    )
  }
}
