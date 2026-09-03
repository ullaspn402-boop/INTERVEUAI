/**
 * POST /api/auth/reset-password
 *
 * Resets a user's password using a valid reset token.
 *
 * Security:
 * - Computes sha256 hash of submitted token to match stored tokenHash
 * - Enforces single-use (usedAt) and expiration (expiresAt)
 * - Updates password with bcrypt cost factor 12
 * - Invalidates existing token immediately
 * - Destroys current session cookie
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { destroySession } from '@/lib/auth'
import { ResetPasswordSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse & Validate request body ──────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const result = ResetPasswordSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Invalid request data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { token, password } = result.data

    // ── 2. Compute token hash ──────────────────────────────────────────────
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    // ── 3. Find token in DB ────────────────────────────────────────────────
    const resetTokenRecord = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true } } },
    })

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token.' },
        { status: 400 }
      )
    }

    if (resetTokenRecord.usedAt) {
      return NextResponse.json(
        { error: 'This password reset link has already been used.' },
        { status: 400 }
      )
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // ── 4. Hash new password with bcrypt (cost factor 12) ──────────────────
    const newPasswordHash = await bcrypt.hash(password, 12)

    // ── 5. Update user password & mark token as used ───────────────────────
    await db.$transaction([
      db.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      db.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ])

    // Destroy session cookie if user is currently logged in on this browser
    await destroySession()

    return NextResponse.json({
      message: 'Password updated successfully. Please sign in with your new password.',
    })
  } catch (error) {
    console.error('[POST /api/auth/reset-password]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
