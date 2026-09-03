/**
 * GET & POST /api/auth/verify-email
 *
 * Verifies a user's email address using a verification token.
 *
 * Accepts ?token=... as query parameter (GET navigation from email link)
 * or { token } in JSON body (POST API call).
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { getAppBaseUrl } from '@/lib/email'

async function processVerification(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } },
  })

  if (!record) {
    return { success: false, error: 'Invalid verification token.', status: 400 }
  }

  if (record.usedAt || record.user.emailVerifiedAt) {
    return { success: false, error: 'This email address has already been verified.', status: 400 }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: 'This verification link has expired. Please request a new one.', status: 400 }
  }

  // Update user.emailVerifiedAt and mark token used
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { success: true, message: 'Your email address has been verified successfully!' }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const baseUrl = getAppBaseUrl(request.url)

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl))
  }

  const result = await processVerification(token)

  if (result.success) {
    return NextResponse.redirect(new URL('/dashboard?verified=1', baseUrl))
  } else {
    const errorParam = encodeURIComponent(result.error ?? 'Verification failed')
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, baseUrl))
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { token } = (body as { token?: string }) || {}
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    const result = await processVerification(token)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('[POST /api/auth/verify-email]', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
