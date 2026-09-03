/**
 * Authentication Rate Limiting — Server-only
 *
 * Provides in-memory sliding-window rate limiting for the login and
 * registration endpoints, protecting against brute-force and credential
 * stuffing attacks.
 *
 * Strategy:
 *   - Login:    10 failed attempts per IP per 15-minute window → 429
 *   - Register: 10 account creations per IP per hour → 429
 *
 * Keys are the normalized client IP address.
 * We NEVER trust a client-supplied userId for rate-limit tracking.
 *
 * ⚠️ Limitation: state is per-process and does not survive restarts or
 * multi-instance deployments. For distributed environments, replace with
 * an Upstash Redis counter (env vars already documented in .env.example).
 */

interface RateLimitEntry {
  timestamps: number[]
}

function makeRateLimiter(maxAttempts: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>()

  return {
    /**
     * Record an attempt for `key`.
     * Returns { allowed: true } when within limits, or
     * { allowed: false, retryAfterMs } when the limit is exceeded.
     */
    check(key: string): { allowed: boolean; retryAfterMs?: number } {
      const now = Date.now()
      const windowStart = now - windowMs
      const entry = store.get(key) ?? { timestamps: [] }

      // Drop timestamps outside the current window
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

      if (entry.timestamps.length >= maxAttempts) {
        const oldest = entry.timestamps[0]
        const retryAfterMs = oldest + windowMs - now
        store.set(key, entry)
        return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) }
      }

      // Record this attempt
      entry.timestamps.push(now)
      store.set(key, entry)
      return { allowed: true }
    },

    /** Clear the record for a key (e.g. on successful login). */
    reset(key: string) {
      store.delete(key)
    },
  }
}

// ─── Login rate limiter: 10 failed attempts / 15 minutes per IP ──────────────

const LOGIN_MAX = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export const loginRateLimiter = makeRateLimiter(LOGIN_MAX, LOGIN_WINDOW_MS)

// ─── Register rate limiter: 10 new accounts / hour per IP ────────────────────

const REGISTER_MAX = 10
const REGISTER_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export const registerRateLimiter = makeRateLimiter(REGISTER_MAX, REGISTER_WINDOW_MS)

// ─── Forgot Password rate limiter: 5 requests / 15 min per IP ────────────────

export const passwordResetRateLimiter = makeRateLimiter(5, 15 * 60 * 1000)

// ─── Resend Verification rate limiter: 3 requests / hour per IP ──────────────

export const resendVerificationRateLimiter = makeRateLimiter(3, 60 * 60 * 1000)

// ─── Email Account rate limiter: 3 emails / hour per email ───────────────────

export const emailAccountRateLimiter = makeRateLimiter(3, 60 * 60 * 1000)

// ─── IP Helper ────────────────────────────────────────────────────────────────

/**
 * Extract a best-effort IP address from Next.js request headers.
 * Falls back to a safe placeholder when the IP cannot be determined
 * (e.g. local development without a proxy).
 */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  // Standard forwarded headers from Vercel, Cloudflare, etc.
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; take the first
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
