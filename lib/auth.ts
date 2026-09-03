/**
 * Authentication Utilities — Server-only
 *
 * Handles JWT session creation, verification, and cookie management.
 * Uses the `jose` library (Web Crypto API based — works in Node.js + Edge).
 *
 * Session strategy:
 * - JWT signed with HS256 using AUTH_SECRET
 * - Stored in an httpOnly, SameSite=Lax cookie
 * - 7-day expiry
 * - Never stores password or passwordHash
 *
 * Cookie is marked Secure in production automatically.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'

// ─── Constants ───────────────────────────────────────────────────────────────

const COOKIE_NAME = 'intervue_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7 // 7 days

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
  name: string
}

// ─── Secret Key ──────────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is not set.')
  }
  return new TextEncoder().encode(secret)
}

// ─── Create Session ──────────────────────────────────────────────────────────

/**
 * Sign a JWT and set it as an httpOnly cookie.
 * Call this after a successful login or registration.
 */
export async function createSession(payload: {
  userId: string
  email: string
  name: string
}): Promise<void> {
  const secret = getSecret()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000)

  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

// ─── Verify Session ──────────────────────────────────────────────────────────

/**
 * Verify and decode the JWT from the session cookie.
 * Returns the payload if valid, null if missing or invalid.
 */
export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)

    return payload as SessionPayload
  } catch {
    // Token is expired, tampered, or missing AUTH_SECRET
    return null
  }
}

// ─── Get Session (throws on missing) ─────────────────────────────────────────

/**
 * Get the current session payload.
 * Use in API routes that require authentication.
 * Returns null (not throw) — callers decide how to respond.
 */
export async function getSession(): Promise<SessionPayload | null> {
  return verifySession()
}

// ─── Destroy Session ─────────────────────────────────────────────────────────

/**
 * Clear the session cookie (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// ─── Cookie Name (for Middleware) ─────────────────────────────────────────────

/**
 * Exported for use in middleware.ts where we only need to check cookie presence.
 */
export { COOKIE_NAME }
