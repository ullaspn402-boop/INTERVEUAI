/**
 * POST /api/resume/analyze
 *
 * Analyzes the user's uploaded resume against their current target role.
 * Triggers re-calculation of the Three-Source Skill Model and role gap analysis.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { analyzeResumeForRoleAI } from '@/services/resume'
import { calculateRoleReadiness } from '@/services/roles'

export async function POST(_request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { targetRole: true },
    })

    const roleSlug = user?.targetRole || 'software-engineer'

    // Perform AI or deterministic resume analysis
    const analysis = await analyzeResumeForRoleAI(session.userId, roleSlug)

    // Re-calculate Role Readiness and Gap Analysis
    const readiness = await calculateRoleReadiness(session.userId, roleSlug)

    return NextResponse.json({
      success: true,
      analysis,
      readiness,
    }, { status: 200 })
  } catch (error: any) {
    if (error.message === 'NO_RESUME_FOUND') {
      return NextResponse.json({ error: 'No uploaded resume found. Please upload a resume first.' }, { status: 404 })
    }
    console.error('[POST /api/resume/analyze]', error)
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 })
  }
}
