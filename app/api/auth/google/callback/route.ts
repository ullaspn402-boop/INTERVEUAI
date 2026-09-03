/**
 * GET /api/auth/google/callback
 *
 * Handles Google OAuth callback code exchange, verified email retrieval,
 * safe account linking, user creation, session issuing, and redirection.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { getGoogleTokens, getGoogleUserInfo } from '@/lib/google-auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    console.error('[Google Callback] OAuth error or missing code:', error)
    return NextResponse.redirect(new URL('/login?error=google_cancelled', baseUrl))
  }

  // Verify CSRF state token
  const cookieStore = await cookies()
  const savedState = cookieStore.get('oauth_state')?.value
  if (savedState && state && savedState !== state) {
    console.error('[Google Callback] State mismatch error')
    return NextResponse.redirect(new URL('/login?error=invalid_state', baseUrl))
  }

  // Clear oauth state cookie
  cookieStore.set('oauth_state', '', { maxAge: 0, path: '/' })

  // Exchange code for tokens
  const tokens = await getGoogleTokens(code)
  if (!tokens?.accessToken) {
    return NextResponse.redirect(new URL('/login?error=google_token_failed', baseUrl))
  }

  // Get user info
  const googleUser = await getGoogleUserInfo(tokens.accessToken)
  if (!googleUser || !googleUser.email || !googleUser.verified_email) {
    return NextResponse.redirect(new URL('/login?error=unverified_email', baseUrl))
  }

  try {
    // 1. Find existing user by googleId OR email
    let user = await db.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.id }, { email: googleUser.email }],
      },
    })

    if (user) {
      // Account exists — link googleId, avatarUrl & mark email verified if not set
      if (!user.googleId || !user.avatarUrl || !user.emailVerifiedAt) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId ?? googleUser.id,
            avatarUrl: user.avatarUrl ?? googleUser.picture ?? null,
            emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          },
        })
      }
    } else {
      // Account does NOT exist — create new user with optional password & verified email
      user = await db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: googleUser.name,
            email: googleUser.email,
            passwordHash: null,
            googleId: googleUser.id,
            avatarUrl: googleUser.picture ?? null,
            emailVerifiedAt: new Date(),
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
    }

    // 2. Create JWT Session
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    // 3. Log Activity
    await db.activity.create({
      data: {
        userId: user.id,
        type: 'SUBJECT_STARTED',
        title: 'Logged in with Google',
        description: `Authenticated as ${user.email}`,
      },
    }).catch(() => {})

    return NextResponse.redirect(new URL('/dashboard', baseUrl))
  } catch (err) {
    console.error('[Google Callback] Database or session error:', err)
    return NextResponse.redirect(new URL('/login?error=auth_failed', baseUrl))
  }
}
