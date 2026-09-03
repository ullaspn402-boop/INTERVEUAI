import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { QuizAttemptQuerySchema } from '@/lib/validation'
import { getUserAttemptHistory } from '@/services/quiz-attempts'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawLimit = searchParams.get('limit') || '10'

    const parseResult = QuizAttemptQuerySchema.safeParse({ limit: rawLimit })
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const attempts = await getUserAttemptHistory(session.userId, parseResult.data.limit)
    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error fetching quiz attempt history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempt history' },
      { status: 500 }
    )
  }
}
