/**
 * Role Service — Server-only
 *
 * Implements persistent target role operations, role requirement gap analysis,
 * the Three-Source Skill Model (Resume + Progress + Actual Performance),
 * and transparent role readiness calculation.
 */

import { db } from '@/lib/db'
import { seedRolesData } from '@/lib/roles-data'

export interface SkillStateItem {
  skillName: string
  category: string
  importance: 'REQUIRED' | 'RECOMMENDED'
  subjectSlug?: string
  state: 'NOT_STARTED' | 'NEEDS_TO_LEARN' | 'LEARNING' | 'DEVELOPING' | 'STRONG' | 'NEEDS_VERIFICATION'
  resumeEvidence: 'FOUND' | 'NEEDS_VERIFICATION' | 'NOT_FOUND'
  progressPct: number
  performanceScorePct: number
  note: string
}

export interface RoleGapAnalysis {
  alreadyHave: SkillStateItem[]
  learning: SkillStateItem[]
  needToLearn: SkillStateItem[]
  needsImprovement: SkillStateItem[]
  needsVerification: SkillStateItem[]
}

export async function getTargetRoles() {
  let roles = await db.targetRole.findMany({
    where: { active: true },
    include: {
      requirements: {
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Auto-seed if database doesn't have roles yet
  if (roles.length === 0) {
    await seedRolesData()
    roles = await db.targetRole.findMany({
      where: { active: true },
      include: {
        requirements: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  return roles
}

export async function getRoleBySlug(slug: string) {
  let role = await db.targetRole.findUnique({
    where: { slug },
    include: {
      requirements: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  if (!role) {
    await seedRolesData()
    role = await db.targetRole.findUnique({
      where: { slug },
      include: {
        requirements: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    })
  }

  return role
}

export async function setUserTargetRole(userId: string, roleSlug: string) {
  const role = await getRoleBySlug(roleSlug)
  if (!role) {
    throw new Error('ROLE_NOT_FOUND')
  }

  // Update user's targetRole string without affecting existing progress
  await db.user.update({
    where: { id: userId },
    data: { targetRole: role.slug },
  })

  return role
}

export async function calculateRoleReadiness(userId: string, roleSlug: string) {
  const role = await getRoleBySlug(roleSlug)
  if (!role) throw new Error('ROLE_NOT_FOUND')

  // Load User's Resume (if uploaded)
  const resume = await db.userResume.findUnique({ where: { userId } })
  const resumeSkills: string[] = Array.isArray(resume?.rawSkills)
    ? (resume.rawSkills as string[]).map((s) => s.toLowerCase())
    : []

  // Load User's Progress across all topics
  const topicProgresses = await db.topicProgress.findMany({
    where: { userId },
    include: { topic: { include: { subject: true } } },
  })

  // Load User's Quiz Attempts (score is 0-1 Float in schema)
  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId },
    select: { score: true, totalQuestions: true, correctAnswers: true, completedAt: true, quiz: { select: { subjectId: true } } },
  })

  // Load User's Coding Submissions
  const codingSubmissions = await db.codingSubmission.findMany({
    where: { userId },
    select: { status: true, createdAt: true },
  })

  // Load User's AI Interviews (overallScore is 0-10 Float range per evaluations)
  const interviewSessions = await db.interviewSession.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { overallScore: true },
  })

  // Calculate actual aggregate performance metrics
  // QuizAttempt.score is 0-1 Float, convert to percentage
  const completedQuizAttempts = quizAttempts.filter((q) => q.completedAt)
  const completedQuizCount = completedQuizAttempts.length
  const avgQuizPct = completedQuizCount > 0
    ? Math.round((completedQuizAttempts.reduce((sum, q) => sum + (q.score || 0), 0) / completedQuizCount) * 100)
    : 0

  const totalCodingSubs = codingSubmissions.length
  const acceptedCodingSubs = codingSubmissions.filter((c) => c.status === 'ACCEPTED').length
  const codingRatePct = totalCodingSubs > 0
    ? Math.round((acceptedCodingSubs / totalCodingSubs) * 100)
    : 0

  const interviewCount = interviewSessions.length
  // overallScore stored as 0-10 Float — convert to 0-100 percentage
  const avgInterviewScorePct = interviewCount > 0
    ? Math.round((interviewSessions.reduce((sum, i) => sum + (i.overallScore || 0), 0) / interviewCount) * 10)
    : 0

  // Total activity count threshold for sufficient data
  const totalDataPoints = completedQuizCount + totalCodingSubs + interviewCount
  const isSufficientData = totalDataPoints >= 3

  // Map each requirement using the Three-Source Skill Model
  const evaluatedSkills: SkillStateItem[] = role.requirements.map((req) => {
    const sNameLower = req.skillName.toLowerCase()

    // 1. Resume Evidence check
    let resumeEvidence: 'FOUND' | 'NEEDS_VERIFICATION' | 'NOT_FOUND' = 'NOT_FOUND'
    const foundInResume = resumeSkills.some(
      (rs) => sNameLower.includes(rs) || rs.includes(sNameLower.split(' ')[0])
    )
    if (foundInResume) {
      resumeEvidence = 'FOUND'
    }

    // 2. Topic Progress check
    let progressPct = 0
    if (req.subjectSlug) {
      const matchingProg = topicProgresses.filter((tp) => tp.topic.subject.slug === req.subjectSlug)
      if (matchingProg.length > 0) {
        const completed = matchingProg.filter((tp) => tp.status === 'COMPLETED').length
        progressPct = Math.round((completed / matchingProg.length) * 100)
      }
    }

    // 3. Performance Score check
    let perfScore = 0
    if (req.subjectSlug === 'dsa' || req.subjectSlug === 'sql') {
      perfScore = codingRatePct > 0 ? codingRatePct : avgQuizPct
    } else {
      perfScore = avgQuizPct
    }

    // Classify Skill State according to Three-Source Model
    let state: SkillStateItem['state'] = 'NOT_STARTED'
    let note = ''

    if (resumeEvidence === 'FOUND' && perfScore < 50 && isSufficientData) {
      state = 'NEEDS_VERIFICATION'
      note = 'Listed on resume, but assessment score is below 50% threshold.'
    } else if (progressPct >= 70 && perfScore >= 70) {
      state = 'STRONG'
      note = 'High topic progress and strong assessment performance.'
    } else if (progressPct > 0 || completedQuizCount > 0) {
      if (perfScore >= 50) {
        state = 'DEVELOPING'
        note = 'Active preparation with steady accuracy.'
      } else {
        state = 'LEARNING'
        note = 'In progress. Needs more practice to build accuracy.'
      }
    } else if (resumeEvidence === 'FOUND') {
      state = 'NEEDS_VERIFICATION'
      note = 'Present on resume. Take a quiz or interview to verify mastery.'
    } else {
      state = req.importance === 'REQUIRED' ? 'NEEDS_TO_LEARN' : 'NOT_STARTED'
      note = 'Key requirement for target role. Not started yet.'
    }

    return {
      skillName: req.skillName,
      category: req.category,
      importance: req.importance as 'REQUIRED' | 'RECOMMENDED',
      subjectSlug: req.subjectSlug || undefined,
      state,
      resumeEvidence,
      progressPct,
      performanceScorePct: perfScore,
      note,
    }
  })

  // Organize 5 Gap Analysis Buckets
  const gapAnalysis: RoleGapAnalysis = {
    alreadyHave: evaluatedSkills.filter((s) => s.state === 'STRONG'),
    learning: evaluatedSkills.filter((s) => s.state === 'LEARNING' || s.state === 'DEVELOPING'),
    needToLearn: evaluatedSkills.filter((s) => s.state === 'NEEDS_TO_LEARN' || s.state === 'NOT_STARTED'),
    needsImprovement: evaluatedSkills.filter((s) => s.state === 'DEVELOPING' || (s.performanceScorePct > 0 && s.performanceScorePct < 60)),
    needsVerification: evaluatedSkills.filter((s) => s.state === 'NEEDS_VERIFICATION'),
  }

  // Calculate overall arithmetic role readiness score (0-100)
  const totalReqs = evaluatedSkills.length || 1
  const strongCount = gapAnalysis.alreadyHave.length
  const devCount = evaluatedSkills.filter((s) => s.state === 'DEVELOPING').length
  const learningCount = gapAnalysis.learning.length

  const skillCoveragePct = Math.round(((strongCount * 1.0 + devCount * 0.6 + learningCount * 0.3) / totalReqs) * 100)

  let readinessScore = 0
  if (isSufficientData) {
    readinessScore = Math.round(
      skillCoveragePct * 0.4 +
      avgQuizPct * 0.25 +
      (totalCodingSubs > 0 ? codingRatePct : avgQuizPct) * 0.2 +
      (interviewCount > 0 ? avgInterviewScorePct : avgQuizPct) * 0.15
    )
  } else {
    readinessScore = Math.round(skillCoveragePct * 0.5)
  }

  // Build Personalized Plan (Prioritized recommendations)
  const prioritizedPlan = [
    ...gapAnalysis.needsVerification.map((s) => ({
      title: `Verify ${s.skillName} Mastery`,
      description: `Resume lists ${s.skillName}. Take a focused quiz or coding challenge to verify proficiency.`,
      actionText: s.subjectSlug === 'dsa' || s.subjectSlug === 'sql' ? 'Practice Coding' : 'Take Quiz',
      actionHref: s.subjectSlug === 'dsa' || s.subjectSlug === 'sql' ? '/coding' : '/quizzes',
      priority: 'high',
    })),
    ...gapAnalysis.needToLearn.map((s) => ({
      title: `Study ${s.skillName}`,
      description: `Required for ${role.name}. Build foundational understanding and complete core topics.`,
      actionText: 'Ask AI Tutor',
      actionHref: '/tutor',
      priority: 'high',
    })),
    ...gapAnalysis.learning.map((s) => ({
      title: `Practice ${s.skillName}`,
      description: `Continue improving performance in ${s.skillName} to achieve strong role readiness.`,
      actionText: 'Start Quiz',
      actionHref: '/quizzes',
      priority: 'medium',
    })),
  ]

  // Persist analysis summary in database
  const analysisRecord = await db.userRoleAnalysis.upsert({
    where: { userId_roleSlug: { userId, roleSlug } },
    update: {
      readinessScore,
      hasResume: Boolean(resume),
      metrics: {
        skillCoveragePct,
        avgQuizPct,
        codingRatePct,
        avgInterviewScorePct,
        isSufficientData,
        dataPointsCount: totalDataPoints,
      },
      gapAnalysis: JSON.parse(JSON.stringify(gapAnalysis)),
      personalizedPlan: JSON.parse(JSON.stringify(prioritizedPlan)),
      updatedAt: new Date(),
    },
    create: {
      userId,
      roleSlug,
      readinessScore,
      hasResume: Boolean(resume),
      metrics: {
        skillCoveragePct,
        avgQuizPct,
        codingRatePct,
        avgInterviewScorePct,
        isSufficientData,
        dataPointsCount: totalDataPoints,
      },
      gapAnalysis: JSON.parse(JSON.stringify(gapAnalysis)),
      personalizedPlan: JSON.parse(JSON.stringify(prioritizedPlan)),
    },
  })

  return {
    role: {
      id: role.id,
      slug: role.slug,
      name: role.name,
      category: role.category,
      description: role.description,
    },
    readinessScore,
    isSufficientData,
    hasResume: Boolean(resume),
    metrics: {
      skillCoveragePct,
      avgQuizPct,
      codingRatePct,
      avgInterviewScorePct,
      dataPointsCount: totalDataPoints,
    },
    gapAnalysis,
    personalizedPlan: prioritizedPlan,
    analyzedAt: analysisRecord.updatedAt.toISOString(),
  }
}
