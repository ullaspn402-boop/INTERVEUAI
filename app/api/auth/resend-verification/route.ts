/**
 * POST /api/auth/resend-verification
 *
 * Resends the email verification link to an unverified user.
 *
 * Security:
 * - Rate limited by IP (3 per hour) and email (3 per hour)
 * - Returns generic response to prevent email enumeration
 * - Invalidates old unverified tokens for the user
 * - Expiration: 24 hours
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  resendVerificationRateLimiter,
  emailAccountRateLimiter,
  getClientIp,
} from '@/lib/auth-rate-limit'
import { ResendVerificationSchema } from '@/lib/validation'
import { sendVerificationEmail } from '@/lib/email'

const GENERIC_RESPONSE_MESSAGE =
  'If an unverified account exists for this email address, a verification link has been sent.'

export async function POST(request: NextRequest) {
  try {
    // ── 1. Rate limiting by IP ─────────────────────────────────────────────
    const ip = getClientIp(request)
    const ipLimit = resendVerificationRateLimiter.check(ip)
    if (!ipLimit.allowed) {
      const retryAfterSec = Math.ceil((ipLimit.retryAfterMs ?? 60000) / 1000)
      return NextResponse.json(
        { error: 'Too many resend requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      )
    }

    // ── 2. Determine target email ──────────────────────────────────────────
    let email: string | undefined
    let body: unknown

    try {
      body = await request.json()
    } catch {
      // Body may be empty if called by an authenticated user
    }

    if (body) {
      const result = ResendVerificationSchema.safeParse(body)
      if (result.success) {
        email = result.data.email
      }
    }

    // Fallback to session user email if not provided in body
    if (!email) {
      const session = await getSession()
      if (session?.email) {
        email = session.email
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      )
    }

    // ── 3. Rate limit by email ─────────────────────────────────────────────
    const emailLimit = emailAccountRateLimiter.check(email)
    if (!emailLimit.allowed) {
      return NextResponse.json({ message: GENERIC_RESPONSE_MESSAGE })
    }

    // ── 4. Find user by email ──────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    })

    if (!user || user.emailVerifiedAt) {
      // User doesn't exist or is already verified — return generic message
      return NextResponse.json({ message: GENERIC_RESPONSE_MESSAGE })
    }

    // ── 5. Generate token & invalidate older tokens ─────────────────────────
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.$transaction([
      db.emailVerificationToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      db.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ])

    // ── 6. Send verification email ─────────────────────────────────────────
    await sendVerificationEmail(user.email, rawToken, request.url)

    return NextResponse.json({ message: GENERIC_RESPONSE_MESSAGE })
  } catch (error) {
    console.error('[POST /api/auth/resend-verification]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
