import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { ActivityQuerySchema } from '@/lib/validation'
import { getUserActivities } from '@/services/activity'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawLimit = searchParams.get('limit') ?? '10'

    const validation = ActivityQuerySchema.safeParse({ limit: rawLimit })
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 })
    }

    const activities = await getUserActivities(session.userId, validation.data.limit)

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('[GET /api/activity]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching user activities.' },
      { status: 500 }
    )
  }
}
