/**
 * Referral Service — Server-only
 *
 * Handles referral code generation, referral link tracking, and friend invitations.
 *
 * Rules:
 * - Safe & deterministic — no fake rewards or cryptocurrency
 * - Prevents self-referrals and duplicate referral credit
 * - User isolation strictly enforced
 */

import { db } from '@/lib/db'

/**
 * Generate a unique 8-character uppercase referral code.
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get or create referral code for an authenticated user.
 */
export async function getUserReferralInfo(userId: string) {
  let user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, referralCode: true },
  })

  if (!user) throw new Error('USER_NOT_FOUND')

  if (!user.referralCode) {
    const newCode = generateReferralCode()
    user = await db.user.update({
      where: { id: userId },
      data: { referralCode: newCode },
      select: { id: true, referralCode: true },
    })
  }

  const referralCount = await db.referral.count({
    where: { referrerId: userId },
  })

  const referrals = await db.referral.findMany({
    where: { referrerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      referred: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
    },
  })

  return {
    referralCode: user.referralCode,
    referralCount,
    referrals: referrals.map((r) => ({
      id: r.id,
      name: r.referred.name.split(' ')[0] + ' ***',
      joinedAt: r.createdAt.toISOString(),
      status: r.status,
    })),
  }
}

/**
 * Apply a referral code during registration or post-signup.
 */
export async function applyReferralCode(newUserId: string, referralCode: string) {
  const cleanCode = referralCode.trim().toUpperCase()
  if (!cleanCode) return { success: false, reason: 'INVALID_CODE' }

  // Find referrer by referralCode
  const referrer = await db.user.findUnique({
    where: { referralCode: cleanCode },
    select: { id: true },
  })

  if (!referrer) return { success: false, reason: 'CODE_NOT_FOUND' }

  // Prevent self-referral
  if (referrer.id === newUserId) return { success: false, reason: 'SELF_REFERRAL' }

  // Check if referral already exists
  const existing = await db.referral.findUnique({
    where: { referredId: newUserId },
  })

  if (existing) return { success: false, reason: 'ALREADY_REFERRED' }

  // Record referral in database
  await db.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: newUserId,
      code: cleanCode,
      status: 'COMPLETED',
    },
  })

  // Update referredById on User
  await db.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  })

  return { success: true }
}
