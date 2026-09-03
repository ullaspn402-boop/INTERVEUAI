/**
 * GET /api/personalization
 *
 * Protected API endpoint returning structured personalization profile,
 * preparation level, learning path, adaptive recommendations, momentum, and coverage.
 *
 * Security:
 * - Authenticated users only (JWT cookie)
 * - User identity derived exclusively from session.userId
 * - User isolation strictly enforced
 * - 100% server-side deterministic calculations
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserPersonalization } from '@/services/personalization'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserPersonalization(session.userId)
    return NextResponse.json(profile)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('[GET /api/personalization] Unexpected error', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading personalization profile.' },
      { status: 500 }
    )
  }
}
