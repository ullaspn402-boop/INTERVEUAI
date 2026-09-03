import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { CodingProblemQuerySchema } from '@/lib/validation'
import { getPublishedCodingProblems } from '@/services/coding-problems'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawParams = {
      subjectId: searchParams.get('subjectId') || undefined,
      topicId: searchParams.get('topicId') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const parseResult = CodingProblemQuerySchema.safeParse(rawParams)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const problems = await getPublishedCodingProblems(parseResult.data)
    return NextResponse.json({ problems })
  } catch (error) {
    console.error('Error fetching coding problems:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coding problems' },
      { status: 500 }
    )
  }
}
