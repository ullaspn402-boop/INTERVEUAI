/**
 * GET /api/role-preparation
 *
 * Primary endpoint for Stage 14 Role-Based Preparation.
 * Delivers:
 * - Current Target Role details
 * - Three-Source Skill Model analysis
 * - 5 Gap Analysis Buckets (Already Have, Learning, Need to Learn, Needs Improvement, Needs Verification)
 * - 4 Preparation Modes (PLAN, PREPARATION, LEARNING, READY)
 * - Role Readiness calculation & breakdown
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculateRoleReadiness, getRoleBySlug } from '@/services/roles'
import { getUserResume } from '@/services/resume'

export async function GET() {
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
    const roleDetails = await getRoleBySlug(roleSlug)
    if (!roleDetails) {
      return NextResponse.json({ error: 'Target role not found' }, { status: 404 })
    }

    const resume = await getUserResume(session.userId)
    const readiness = await calculateRoleReadiness(session.userId, roleSlug)

    // Build 4 Mode Views
    const modes = {
      plan: {
        targetRole: roleDetails.name,
        readinessScore: readiness.readinessScore,
        isSufficientData: readiness.isSufficientData,
        majorGapsCount: readiness.gapAnalysis.needToLearn.length + readiness.gapAnalysis.needsVerification.length,
        priorities: readiness.personalizedPlan,
      },
      preparation: {
        recommendedQuizzes: roleDetails.requirements
          .filter((r) => r.subjectSlug)
          .map((r) => ({
            subjectSlug: r.subjectSlug,
            title: `${r.skillName} Practice Quiz`,
            href: `/quizzes`,
          })),
        recommendedCoding: [
          { title: 'Data Structures & Algorithmic Problem Solving', href: '/coding' },
          { title: 'Database SQL Query Practice', href: '/coding' },
        ],
        recommendedInterview: {
          roleName: roleDetails.name,
          href: '/interview',
        },
      },
      learning: {
        coveredSubjects: roleDetails.requirements.filter((r) => r.subjectSlug),
        tutorPrompt: `I am preparing for a ${roleDetails.name} role. Help me study ${roleDetails.requirements[0]?.skillName || 'core fundamentals'}.`,
      },
      ready: {
        readinessScore: readiness.readinessScore,
        isSufficientData: readiness.isSufficientData,
        metrics: readiness.metrics,
        strengths: readiness.gapAnalysis.alreadyHave.map((s) => s.skillName),
        missingRequirements: readiness.gapAnalysis.needToLearn.map((s) => s.skillName),
        needsVerification: readiness.gapAnalysis.needsVerification.map((s) => s.skillName),
      },
    }

    return NextResponse.json({
      targetRole: roleSlug,
      role: roleDetails,
      resume,
      readiness,
      modes,
    }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/role-preparation]', error)
    return NextResponse.json({ error: 'Failed to generate role preparation profile' }, { status: 500 })
  }
}
