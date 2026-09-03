/**
 * GET /api/analytics/dashboard
 *
 * Protected API endpoint returning comprehensive, server-calculated analytics,
 * performance breakdowns across modules, and deterministic recommendations for the owner.
 *
 * Security:
 * - Authenticated users only (JWT cookie)
 * - User identity derived exclusively from session.userId
 * - User isolation strictly enforced
 * - 100% server-side deterministic calculations
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserAnalytics } from '@/services/analytics'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analyticsData = await getUserAnalytics(session.userId)
    return NextResponse.json(analyticsData)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('[GET /api/analytics/dashboard] Unexpected error', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating analytics.' },
      { status: 500 }
    )
  }
}
