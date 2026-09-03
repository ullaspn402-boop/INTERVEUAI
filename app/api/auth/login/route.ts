/**
 * POST /api/auth/login
 *
 * Authenticates a user with email + password.
 *
 * Request body: { email, password }
 *
 * Responses:
 *   200 — Success: { user: { id, name, email } }
 *   400 — Validation error: { error: string }
 *   401 — Invalid credentials: { error: string }
 *   429 — Rate limited: { error: string }
 *   500 — Server error: { error: string }
 *
 * Security:
 * - Returns the same error message for "user not found" and "wrong password"
 *   to prevent user enumeration attacks
 * - Uses bcrypt.compare (constant-time comparison) — safe against timing attacks
 * - passwordHash is never returned in any response
 * - Rate limited: 10 failed attempts per IP per 15-minute window (in-memory)
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { loginRateLimiter, getClientIp } from '@/lib/auth-rate-limit'
import { LoginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse request body ─────────────────────────────────────────────
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
    const result = LoginSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email, password } = result.data

    // ── 3. Find user by email ─────────────────────────────────────────────
    // Select only what we need — specifically include passwordHash for comparison
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true, // Required for comparison — not returned to client
      },
    })

    // ── 4. Rate-limit check (IP-based, before bcrypt) ─────────────────────
    const ip = getClientIp(request)
    const limitResult = loginRateLimiter.check(ip)
    if (!limitResult.allowed) {
      const retryAfterSec = Math.ceil((limitResult.retryAfterMs ?? 60000) / 1000)
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      )
    }

    // ── 5. Verify password ────────────────────────────────────────────────
    // Use a consistent "invalid credentials" message for both "user not found"
    // and "wrong password" to prevent user enumeration attacks.
    const INVALID_CREDENTIALS = 'Invalid email or password'

    if (!user || !user.passwordHash) {
      // Still run bcrypt to prevent timing-based user enumeration
      await bcrypt.compare(password, '$2b$12$invalidhashfortimingnormalization')
      return NextResponse.json(
        { error: INVALID_CREDENTIALS },
        { status: 401 }
      )
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS },
        { status: 401 }
      )
    }

    // Successful login — reset IP's failed-attempt counter
    loginRateLimiter.reset(ip)

    // ── 6. Create session ─────────────────────────────────────────────────
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    // ── 7. Return safe user data (passwordHash excluded) ──────────────────
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
