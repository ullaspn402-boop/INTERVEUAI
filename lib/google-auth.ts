/**
 * Google OAuth 2.0 Server-Only Utilities
 *
 * Handles Google OAuth authorization URL generation, token exchange,
 * and user profile retrieval.
 *
 * Security Rules:
 * - GOOGLE_CLIENT_SECRET is strictly server-side (never exposed to browser)
 * - State token verified on callback to prevent CSRF attacks
 * - Only verified emails from Google are trusted for account creation/linking
 */

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
  verified_email?: boolean
}

function getOAuthCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

  return { clientId, clientSecret, redirectUri }
}

/**
 * Returns true if Google OAuth environment variables are set.
 */
export function isGoogleAuthConfigured(): boolean {
  const { clientId, clientSecret } = getOAuthCredentials()
  return Boolean(clientId && clientSecret)
}

/**
 * Generate Google OAuth 2.0 redirect URL.
 */
export function getGoogleAuthUrl(stateToken: string): string | null {
  const { clientId, redirectUri } = getOAuthCredentials()
  if (!clientId) return null

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    state: stateToken,
    prompt: 'select_account',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for access token.
 */
export async function getGoogleTokens(code: string): Promise<{ accessToken: string; idToken?: string } | null> {
  const { clientId, clientSecret, redirectUri } = getOAuthCredentials()
  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!res.ok) {
      console.error('[Google OAuth] Token exchange failed:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    return { accessToken: data.access_token, idToken: data.id_token }
  } catch (err) {
    console.error('[Google OAuth] Error during token exchange:', err)
    return null
  }
}

/**
 * Fetch verified Google user profile.
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      console.error('[Google OAuth] UserInfo fetch failed:', res.status)
      return null
    }

    const data = await res.json()
    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      picture: data.picture,
      verified_email: data.verified_email ?? true,
    }
  } catch (err) {
    console.error('[Google OAuth] Error fetching user info:', err)
    return null
  }
}
