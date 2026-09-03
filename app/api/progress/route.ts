import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserSubjectProgress } from '@/services/progress'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const progress = await getUserSubjectProgress(session.userId)
    return NextResponse.json({ progress })
  } catch (error) {
    console.error('[GET /api/progress]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching user progress.' },
      { status: 500 }
    )
  }
}
