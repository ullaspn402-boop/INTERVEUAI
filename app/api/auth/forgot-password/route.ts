/**
 * POST /api/auth/forgot-password
 *
 * Requests a password reset link.
 *
 * Security:
 * - Does NOT reveal whether the email address exists in the database
 * - Rate limited by IP (5 attempts per 15 min) and email (3 attempts per hour)
 * - Only stores sha256 hash of token in the database
 * - Raw token is only sent in the email link
 * - Expiration: 1 hour
 * - Single-use token (older un-used tokens invalidated)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import {
  passwordResetRateLimiter,
  emailAccountRateLimiter,
  getClientIp,
} from '@/lib/auth-rate-limit'
import { ForgotPasswordSchema } from '@/lib/validation'
import { sendPasswordResetEmail } from '@/lib/email'

const GENERIC_RESPONSE_MESSAGE =
  'If an account exists for this email, a password reset link has been sent.'

export async function POST(request: NextRequest) {
  try {
    // ── 1. Rate limiting by IP ─────────────────────────────────────────────
    const ip = getClientIp(request)
    const ipLimit = passwordResetRateLimiter.check(ip)
    if (!ipLimit.allowed) {
      const retryAfterSec = Math.ceil((ipLimit.retryAfterMs ?? 60000) / 1000)
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      )
    }

    // ── 2. Parse & Validate request body ──────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const result = ForgotPasswordSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Invalid email address'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email } = result.data

    // ── 3. Rate limiting by email address ─────────────────────────────────
    const emailLimit = emailAccountRateLimiter.check(email)
    if (!emailLimit.allowed) {
      // Even when rate limited by email, return generic 200 to prevent enumeration
      return NextResponse.json({ message: GENERIC_RESPONSE_MESSAGE })
    }

    // ── 4. Find user by email ──────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    })

    // If user doesn't exist or is a Google-only account (no passwordHash), return generic response
    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: GENERIC_RESPONSE_MESSAGE })
    }

    // ── 5. Generate secure random token & hash ─────────────────────────────
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // ── 6. Invalidate old tokens & save new token hash ────────────────────
    await db.$transaction([
      db.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ])

    // ── 7. Send email ──────────────────────────────────────────────────────
    await sendPasswordResetEmail(user.email, rawToken, request.url)

    return NextResponse.json({ message: GENERIC_RESPONSE_MESSAGE })
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
