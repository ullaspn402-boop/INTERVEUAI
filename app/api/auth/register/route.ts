/**
 * POST /api/auth/register
 *
 * Creates a new user account.
 *
 * Request body: { name, email, password, college?, degree?, graduationYear?,
 *                 targetRole?, targetCompanies? }
 *
 * Responses:
 *   201 — Created: { user: { id, name, email } }
 *   400 — Validation error: { error: string }
 *   409 — Email already registered: { error: string }
 *   429 — Rate limited: { error: string }
 *   500 — Server error: { error: string }
 *
 * Security:
 * - Password is hashed with bcrypt (cost factor 12) before storage
 * - passwordHash is never returned in any response
 * - Duplicate emails are detected before hashing to avoid timing oracles
 * - Error messages never reveal internal details
 * - Rate limited: 10 accounts per IP per hour (in-memory)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { registerRateLimiter, getClientIp } from '@/lib/auth-rate-limit'
import { RegisterSchema } from '@/lib/validation'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse request body ───────────────────────────────────────────
    const ip = getClientIp(request)
    const limitResult = registerRateLimiter.check(ip)
    if (!limitResult.allowed) {
      const retryAfterSec = Math.ceil((limitResult.retryAfterMs ?? 60000) / 1000)
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      )
    }

    // ── 2. Parse request body ─────────────────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // ── 2. Validate input ─────────────────────────────────────────────────
    const result = RegisterSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Invalid input'
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      )
    }

    const {
      name,
      email,
      password,
      college,
      degree,
      graduationYear,
      targetRole,
      targetCompanies,
    } = result.data

    // ── 3. Check for duplicate email ──────────────────────────────────────
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true }, // Minimal select — don't fetch passwordHash
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // ── 4. Hash password ──────────────────────────────────────────────────
    // bcrypt cost factor 12 — recommended minimum for production.
    // Higher values increase security but also CPU time per login.
    const passwordHash = await bcrypt.hash(password, 12)

    // ── 5. Create user + preference in a transaction ──────────────────────
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          college,
          degree,
          graduationYear,
          targetRole,
          targetCompanies,
        },
        select: {
          id: true,
          name: true,
          email: true,
          // passwordHash intentionally excluded
        },
      })

      await tx.userPreference.create({
        data: {
          userId: newUser.id,
          weeklyGoalSessions: 5,
          difficulty: 'medium',
        },
      })

      return newUser
    })

    // ── 6. Create email verification token & send email ───────────────────
    try {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await db.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      })

      await sendVerificationEmail(user.email, rawToken, request.url)
    } catch (err) {
      console.error('[POST /api/auth/register] Verification email sending error:', err)
      // Don't fail registration if email fails — user can click "Resend verification"
    }

    // ── 7. Create session cookie ──────────────────────────────────────────
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    // ── 8. Return safe user data ──────────────────────────────────────────
    return NextResponse.json(
      {
        user,
        message: 'Account created! Please check your email to verify your email address.',
      },
      { status: 201 }
    )
  } catch (error) {
    // Never expose internal errors to clients
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
