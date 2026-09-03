/**
 * GET /api/auth/google/url
 *
 * Generates and returns a Google OAuth authorization URL.
 * Also checks if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured.
 */

import { NextResponse } from 'next/server'
import { getGoogleAuthUrl, isGoogleAuthConfigured } from '@/lib/google-auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const configured = isGoogleAuthConfigured()
    if (!configured) {
      return NextResponse.json({
        configured: false,
        error: 'Google Sign-In is not configured in this environment.',
      })
    }

    // Generate random state token for CSRF protection
    const stateToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

    // Store state in short-lived httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    const url = getGoogleAuthUrl(stateToken)

    return NextResponse.json({ configured: true, url })
  } catch (error) {
    console.error('[GET /api/auth/google/url] Error generating auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate Google Sign-In URL' },
      { status: 500 }
    )
  }
}
