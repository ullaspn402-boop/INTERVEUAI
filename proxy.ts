/**
 * Next.js Edge Middleware (Proxy) — Route Protection
 *
 * Next.js 16 convention: proxy.ts with `export function proxy(request)`
 *
 * Runs before every request to check authentication state.
 * Uses only the cookie value (no DB call) for performance.
 * Full JWT verification happens inside API route handlers.
 *
 * Routing logic:
 * - Public paths (/, /login, /register) → always accessible
 * - API auth routes (/api/auth/*) → always accessible
 * - Static files (_next/*, favicon, public assets) → always accessible
 * - All other paths → requires valid session cookie
 *   → If no cookie: redirect to /login
 *   → If has cookie: allow (JWT validity verified inside the route handler)
 */

import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

// Paths that never require authentication
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/privacy',
  '/terms',
  '/robots.txt',
  '/sitemap.xml',
])

// Prefixes that are always allowed through (API routes handle their own auth & 401 JSON responses)
const ALWAYS_ALLOW_PREFIXES = [
  '/api/',        // All API endpoints (handled server-side with JSON errors)
  '/_next/',      // Next.js internals
  '/favicon',     // Favicon variants
  '/share/',      // Public shared result badges
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Allow static/Next.js internal paths ──────────────────────────────────
  for (const prefix of ALWAYS_ALLOW_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next()
    }
  }

  // ── Allow explicitly public paths ─────────────────────────────────────────
  if (PUBLIC_PATHS.has(pathname)) {
    // If already authenticated, redirect away from login/register
    if (pathname === '/login' || pathname === '/register') {
      const sessionCookie = request.cookies.get(COOKIE_NAME)
      if (sessionCookie?.value) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // ── Allow public asset files (images, icons, etc.) ────────────────────────
  const staticExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.css', '.js']
  if (staticExtensions.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next()
  }

  // ── Protect all other routes ──────────────────────────────────────────────
  const sessionCookie = request.cookies.get(COOKIE_NAME)

  if (!sessionCookie?.value) {
    // No session cookie — redirect to login, preserving the intended URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Cookie present — allow through (API routes do full JWT verification)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
