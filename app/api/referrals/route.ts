/**
 * GET /api/referrals — Fetch user's referral code and referral stats
 * POST /api/referrals — Apply a referral code for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserReferralInfo, applyReferralCode } from '@/services/referrals'
import { z } from 'zod'

const ApplyReferralSchema = z.object({
  code: z.string().trim().min(3).max(32),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const info = await getUserReferralInfo(session.userId)
    return NextResponse.json(info)
  } catch (error) {
    console.error('[GET /api/referrals]', error)
    return NextResponse.json({ error: 'Failed to load referral details' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = ApplyReferralSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 })
    }

    const result = await applyReferralCode(session.userId, parsed.data.code)

    if (!result.success) {
      if (result.reason === 'SELF_REFERRAL') {
        return NextResponse.json({ error: 'You cannot use your own referral code.' }, { status: 400 })
      }
      if (result.reason === 'ALREADY_REFERRED') {
        return NextResponse.json({ error: 'You have already redeemed a referral code.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Invalid referral code.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Referral code applied successfully!' })
  } catch (error) {
    console.error('[POST /api/referrals]', error)
    return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 })
  }
}
