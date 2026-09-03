import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { SubmissionQuerySchema } from '@/lib/validation'
import { getUserSubmissions } from '@/services/coding-submissions'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawParams = {
      problemId: searchParams.get('problemId') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const parseResult = SubmissionQuerySchema.safeParse(rawParams)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const submissions = await getUserSubmissions(session.userId, parseResult.data)
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching submission history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission history' },
      { status: 500 }
    )
  }
}
