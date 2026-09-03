/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's safe profile.
 *
 * Responses:
 *   200 — Authenticated: { user: SafeUser }
 *   401 — Not authenticated: { error: string }
 *   404 — Session valid but user deleted: { error: string }
 *   500 — Server error: { error: string }
 *
 * Security:
 * - passwordHash is never included in the response
 * - Session is verified cryptographically (not just cookie presence)
 * - DB query confirms the user still exists (handles deleted accounts)
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // ── 1. Verify session ─────────────────────────────────────────────────
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // ── 2. Fetch user from database ───────────────────────────────────────
    // Confirm the user still exists — handles cases where the account was
    // deleted after the session was issued.
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        degree: true,
        graduationYear: true,
        targetRole: true,
        targetCompanies: true,
        emailVerifiedAt: true,
        createdAt: true,
        // passwordHash intentionally excluded
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ── 3. Compute initials ───────────────────────────────────────────────
    const initials = user.name
      .split(' ')
      .map((part) => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('')

    return NextResponse.json({
      user: {
        ...user,
        initials,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[GET /api/auth/me]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: any) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { ProfileUpdateSchema } = await import('@/lib/validation')
    const result = ProfileUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: result.data,
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        degree: true,
        graduationYear: true,
        targetRole: true,
        targetCompanies: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    })

    const initials = updated.name
      .split(' ')
      .map((part) => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('')

    return NextResponse.json({
      user: {
        ...updated,
        initials,
        createdAt: updated.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[PATCH /api/auth/me]', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}

