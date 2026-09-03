import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDashboardData } from '@/services/dashboard'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const data = await getDashboardData(session.userId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading dashboard data.' },
      { status: 500 }
    )
  }
}
