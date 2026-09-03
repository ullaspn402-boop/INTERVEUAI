/**
 * POST /api/auth/logout
 *
 * Destroys the user's session by clearing the session cookie.
 *
 * Responses:
 *   200 — Success: { success: true }
 *   500 — Server error: { error: string }
 *
 * Notes:
 * - Works even if no session exists (idempotent)
 * - Cookie is cleared by setting maxAge=0
 */

import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/logout]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
