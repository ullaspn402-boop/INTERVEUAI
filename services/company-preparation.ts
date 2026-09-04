/**
 * Server-Only Service: Company Preparation Engine — Stage 18
 *
 * Provides personalized company & role preparation paths combining:
 * - Base TargetRole requirements
 * - Company specific requirement overlays (with explicit confidence labels)
 * - Candidate experience level adjustments
 * - Candidate resume claims (labeled RESUME_EVIDENCE / NEEDS_VERIFICATION)
 * - Actual candidate performance (Quizzes, Coding, Interviews, GD, Tutor)
 * - Honest, evidence-based readiness calculation
 *
 * Rules:
 * - Server-side userId from JWT session only
 * - Cross-user isolation strictly enforced
 * - Cautious disclaimers for unverified company facts
 */

import { db } from '@/lib/db'
import { TARGET_ROLES, RoleDefinition } from '@/lib/roles-data'
import { STARTER_COMPANIES, seedCompanyCatalog } from '@/lib/company-catalog'
import { CreateCompanyPlanInput, UpdateCompanyPlanInput, CompanyQueryInput } from '@/lib/validation'
import { ActivityType } from '@prisma/client'

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface StageDefinition {
  stageNumber: number
  title: string
  category: string
  description: string
  recommendedActions: string[]
  relatedSubjectSlug?: string
  confidenceLabel: 'VERIFIED' | 'COMMONLY_REPORTED' | 'GENERAL_GUIDANCE' | 'USER_PROVIDED'
  isCompleted: boolean
}

export interface PlanMetrics {
  totalStages: number
  completedStages: number
  hasResume: boolean
  verifiedResumeSkills: string[]
  unverifiedResumeSkills: string[]
  quizAccuracyAvg: number
  codingAcceptanceCount: number
  interviewAverageScore: number | null
  gdAverageScore: number | null
  missingEvidence: string[]
  weakAreas: string[]
  confidenceDisclaimer: string
}

// ─── Company Catalog Retrieval ────────────────────────────────────────────────

export async function getCompanyCatalog(query: CompanyQueryInput) {
  let count = await db.company.count({ where: { active: true } })
  if (count === 0) {
    await seedCompanyCatalog()
  }

  const whereClause: any = { active: true }
  if (query.search) {
    whereClause.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { shortName: { contains: query.search, mode: 'insensitive' } },
      { industry: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  if (query.industry) {
    whereClause.industry = { contains: query.industry, mode: 'insensitive' }
  }

  const companies = await db.company.findMany({
    where: whereClause,
    take: query.limit,
    orderBy: { name: 'asc' },
    include: {
      requirements: {
        where: { active: true },
        take: 10,
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  return companies.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    industry: c.industry,
    description: c.description,
    dataSourceType: c.dataSourceType as 'VERIFIED' | 'COMMONLY_REPORTED' | 'GENERAL_GUIDANCE',
    dataLastVerifiedAt: c.dataLastVerifiedAt ? c.dataLastVerifiedAt.toISOString() : null,
    disclaimer: getCompanyDisclaimer(c.dataSourceType, c.name),
    requirements: c.requirements.map((r) => ({
      skillName: r.skillName,
      category: r.category,
      importance: r.importance,
      confidence: r.confidence,
    })),
  }))
}

export async function getCompanyBySlug(slug: string) {
  const company = await db.company.findUnique({
    where: { slug },
    include: {
      requirements: {
        where: { active: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  if (!company) return null

  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    shortName: company.shortName,
    industry: company.industry,
    description: company.description,
    dataSourceType: company.dataSourceType as 'VERIFIED' | 'COMMONLY_REPORTED' | 'GENERAL_GUIDANCE',
    dataLastVerifiedAt: company.dataLastVerifiedAt ? company.dataLastVerifiedAt.toISOString() : null,
    disclaimer: getCompanyDisclaimer(company.dataSourceType, company.name),
    requirements: company.requirements.map((r) => ({
      skillName: r.skillName,
      category: r.category,
      importance: r.importance,
      confidence: r.confidence,
    })),
  }
}

function getCompanyDisclaimer(dataSourceType: string, companyName: string): string {
  if (dataSourceType === 'VERIFIED') {
    return `Verified preparation requirements for ${companyName}. Hiring formats may evolve.`
  }
  if (dataSourceType === 'COMMONLY_REPORTED') {
    return `General preparation guidance for ${companyName}. Actual hiring processes vary by role, drive, and location.`
  }
  return `General practice guidance. No official claims for ${companyName}.`
}

// ─── Plan Creation & Personalized Generation ─────────────────────────────────

export async function createCompanyPlan(userId: string, input: CreateCompanyPlanInput) {
  // Validate TargetRole
  const roleDef = TARGET_ROLES.find((r) => r.slug === input.targetRoleSlug) || TARGET_ROLES[0]

  // Resolve Company
  let dbCompany = null
  let companyName = input.customCompanyName || 'General Company'
  let dataSourceType: 'VERIFIED' | 'COMMONLY_REPORTED' | 'GENERAL_GUIDANCE' | 'USER_PROVIDED' = 'GENERAL_GUIDANCE'

  if (input.companyId) {
    dbCompany = await db.company.findUnique({
      where: { id: input.companyId },
      include: { requirements: { where: { active: true } } },
    })
    if (dbCompany) {
      companyName = dbCompany.name
      dataSourceType = dbCompany.dataSourceType as any
    }
  } else if (input.customCompanyName) {
    dataSourceType = 'USER_PROVIDED'
  }

  // Check if active plan already exists for same user + targetRole + company
  const existingPlan = await db.companyPreparationPlan.findFirst({
    where: {
      userId,
      targetRoleSlug: input.targetRoleSlug,
      companyId: dbCompany?.id || null,
      customCompanyName: input.customCompanyName || null,
      status: 'ACTIVE',
    },
  })

  if (existingPlan) {
    return existingPlan
  }

  // Fetch candidate evidence
  const [userResume, quizAttempts, codingSubmissions, interviewSessions, gdSessions] = await Promise.all([
    db.userResume.findUnique({ where: { userId } }),
    db.quizAttempt.findMany({ where: { userId }, include: { quiz: true } }),
    db.codingSubmission.findMany({ where: { userId } }),
    db.interviewSession.findMany({ where: { userId, status: 'COMPLETED' } }),
    db.gDSession.findMany({ where: { userId, status: 'COMPLETED' } }),
  ])

  // Extract resume evidence
  const rawSkills: string[] = userResume?.rawSkills ? (userResume.rawSkills as string[]) : []
  const hasResume = !!userResume

  // Analyze performance
  const totalQuizScore = quizAttempts.reduce((acc, q) => acc + (q.score || 0), 0)
  const quizAccuracyAvg = quizAttempts.length > 0 ? Math.round(totalQuizScore / quizAttempts.length) : 0
  const acceptedCodingCount = codingSubmissions.filter((s) => s.status === 'ACCEPTED').length

  const interviewScores = interviewSessions.map((s) => s.overallScore).filter((s): s is number => typeof s === 'number')
  const interviewAverageScore = interviewScores.length > 0 ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length) : null

  const gdScores = gdSessions.map((s) => s.overallScore).filter((s): s is number => typeof s === 'number')
  const gdAverageScore = gdScores.length > 0 ? Math.round(gdScores.reduce((a, b) => a + b, 0) / gdScores.length) : null

  // Resume verification check
  const verifiedResumeSkills: string[] = []
  const unverifiedResumeSkills: string[] = []
  rawSkills.forEach((skill) => {
    const sLower = skill.toLowerCase()
    if (sLower.includes('dsa') || sLower.includes('algorithm') || sLower.includes('structure')) {
      if (acceptedCodingCount >= 3 || quizAccuracyAvg >= 60) verifiedResumeSkills.push(skill)
      else unverifiedResumeSkills.push(skill)
    } else if (sLower.includes('sql') || sLower.includes('database') || sLower.includes('dbms')) {
      const sqlAttempt = quizAttempts.some((q) => q.quiz?.slug?.includes('sql') || q.quiz?.slug?.includes('dbms'))
      if (sqlAttempt) verifiedResumeSkills.push(skill)
      else unverifiedResumeSkills.push(skill)
    } else {
      unverifiedResumeSkills.push(skill)
    }
  })

  // Determine Missing Evidence & Weak Areas
  const missingEvidence: string[] = []
  if (quizAttempts.length === 0) missingEvidence.push('No subject quiz attempts completed yet')
  if (codingSubmissions.length === 0) missingEvidence.push('No coding problems submitted yet')
  if (interviewAverageScore === null) missingEvidence.push('No AI Technical/HR mock interview completed yet')
  if (gdAverageScore === null) missingEvidence.push('No AI Group Discussion session completed yet')

  const weakAreas: string[] = []
  if (quizAccuracyAvg > 0 && quizAccuracyAvg < 60) weakAreas.push('Subject Quiz Fundamentals')
  if (codingSubmissions.length > 0 && acceptedCodingCount / codingSubmissions.length < 0.5) weakAreas.push('Coding Accuracy & Edge Cases')
  if (interviewAverageScore !== null && interviewAverageScore < 65) weakAreas.push('Interview Communication & Depth')
  if (gdAverageScore !== null && gdAverageScore < 65) weakAreas.push('Group Discussion Articulation')

  // Calculate Honest Readiness Score
  let readinessScore: number | null = null
  if (missingEvidence.length <= 2) {
    const quizWeight = (quizAccuracyAvg / 100) * 30
    const codingWeight = Math.min(30, acceptedCodingCount * 6)
    const interviewWeight = interviewAverageScore !== null ? (interviewAverageScore / 100) * 25 : 12.5
    const gdWeight = gdAverageScore !== null ? (gdAverageScore / 100) * 15 : 7.5
    readinessScore = Math.round(quizWeight + codingWeight + interviewWeight + gdWeight)
  }

  // Construct 12-Stage Personalized Preparation Roadmap
  const stages: StageDefinition[] = [
    {
      stageNumber: 1,
      title: 'Baseline Assessment & Target Alignment',
      category: 'ASSESSMENT',
      description: `Align candidate background for ${companyName} (${roleDef.name}).`,
      recommendedActions: [
        `Review role requirements for ${roleDef.name}`,
        `Verify baseline skill readiness for ${companyName}`,
      ],
      confidenceLabel: dataSourceType,
      isCompleted: true,
    },
    {
      stageNumber: 2,
      title: 'Aptitude & Logical Reasoning',
      category: 'APTITUDE',
      description: 'Quantitative aptitude, logical reasoning, and verbal comprehension practice.',
      recommendedActions: ['Take Aptitude & Reasoning Quizzes', 'Practice quantitative problem speed'],
      confidenceLabel: dataSourceType,
      isCompleted: quizAccuracyAvg >= 70,
    },
    {
      stageNumber: 3,
      title: 'Core CS Fundamentals (DBMS, OS, CN, OOP)',
      category: 'CORE_CS',
      description: 'Master computer science fundamentals essential for technical evaluations.',
      recommendedActions: ['Complete DBMS & SQL Quizzes', 'Review OS Concurrency & Networking'],
      relatedSubjectSlug: 'dbms',
      confidenceLabel: dataSourceType,
      isCompleted: false,
    },
    {
      stageNumber: 4,
      title: 'Data Structures & Algorithmic Problem Solving',
      category: 'CODING',
      description: `Solve algorithmic problem sets tailored to ${roleDef.name}.`,
      recommendedActions: ['Solve Array, String & Hash Table problems', 'Practice Tree & Graph traversals'],
      relatedSubjectSlug: 'dsa',
      confidenceLabel: dataSourceType,
      isCompleted: acceptedCodingCount >= 5,
    },
    {
      stageNumber: 5,
      title: 'SQL & Database Querying Practice',
      category: 'CORE_CS',
      description: 'Formulate, join, and optimize complex relational SQL queries.',
      recommendedActions: ['Practice SQL joins & aggregation', 'Review indexing & query execution plans'],
      relatedSubjectSlug: 'sql',
      confidenceLabel: dataSourceType,
      isCompleted: false,
    },
    {
      stageNumber: 6,
      title: 'Role-Specific Technical Focus Areas',
      category: 'ROLE_SKILLS',
      description: `Focus on specific technical skill priorities for ${companyName} (${roleDef.name}).`,
      recommendedActions: roleDef.requirements.slice(0, 3).map((r) => `Master ${r.skillName}`),
      confidenceLabel: dataSourceType,
      isCompleted: false,
    },
    {
      stageNumber: 7,
      title: 'Resume Claims & Project Defense',
      category: 'RESUME',
      description: hasResume ? 'Verify resume skills and practice project explanation.' : 'Upload resume to verify technical project claims.',
      recommendedActions: hasResume
        ? [`Defend project claims (${unverifiedResumeSkills.slice(0, 2).join(', ') || 'Projects'})`, 'Practice STAR method project explanation']
        : ['Upload resume in User Settings for analysis'],
      confidenceLabel: 'USER_PROVIDED',
      isCompleted: hasResume && unverifiedResumeSkills.length === 0,
    },
    {
      stageNumber: 8,
      title: 'AI Tutor Interactive Concept Revision',
      category: 'TUTOR',
      description: 'Use the AI Tutor to clarify doubts, review weak areas, and practice concept defense.',
      recommendedActions: [`Launch AI Tutor with ${companyName} context`, 'Practice oral explanation of weak technical concepts'],
      confidenceLabel: 'GENERAL_GUIDANCE',
      isCompleted: false,
    },
    {
      stageNumber: 9,
      title: 'Company-Oriented Technical Mock Interview',
      category: 'INTERVIEW',
      description: `Simulate a full technical interview tailored for ${companyName} (${roleDef.name}).`,
      recommendedActions: ['Complete a 5-question AI Technical Interview', 'Review feedback on depth and correctness'],
      confidenceLabel: dataSourceType,
      isCompleted: interviewAverageScore !== null && interviewAverageScore >= 70,
    },
    {
      stageNumber: 10,
      title: 'HR & Behavioral Communication Interview',
      category: 'INTERVIEW',
      description: 'Practice behavioral scenarios, leadership principles, and conversational confidence.',
      recommendedActions: ['Complete a Behavioral AI Interview round', 'Practice articulating past challenges'],
      confidenceLabel: dataSourceType,
      isCompleted: false,
    },
    {
      stageNumber: 11,
      title: 'Group Discussion (GD) Practice',
      category: 'GD',
      description: 'Engage in a multi-participant GD session with AI personas on company/tech topics.',
      recommendedActions: ['Participate in a GD session', 'Practice structured argument & synthesis'],
      confidenceLabel: 'GENERAL_GUIDANCE',
      isCompleted: gdAverageScore !== null && gdAverageScore >= 70,
    },
    {
      stageNumber: 12,
      title: 'Final Company Readiness & Verification',
      category: 'READINESS',
      description: `Comprehensive readiness evaluation for ${companyName}.`,
      recommendedActions: ['Review final readiness metrics', 'Address remaining weak areas'],
      confidenceLabel: dataSourceType,
      isCompleted: readinessScore !== null && readinessScore >= 80,
    },
  ]

  const metrics: PlanMetrics = {
    totalStages: 12,
    completedStages: stages.filter((s) => s.isCompleted).length,
    hasResume,
    verifiedResumeSkills,
    unverifiedResumeSkills,
    quizAccuracyAvg,
    codingAcceptanceCount: acceptedCodingCount,
    interviewAverageScore,
    gdAverageScore,
    missingEvidence,
    weakAreas,
    confidenceDisclaimer: getCompanyDisclaimer(dataSourceType, companyName),
  }

  const planData = {
    companyName,
    dataSourceType,
    roleName: roleDef.name,
    experienceLevel: input.experienceLevel,
    preparationGoal: input.preparationGoal || `Preparation path for ${companyName} - ${roleDef.name}`,
    stages,
    companyFocusAreas: dbCompany
      ? dbCompany.requirements.map((r) => ({ skillName: r.skillName, importance: r.importance, confidence: r.confidence }))
      : [
          { skillName: 'Aptitude & Problem Solving', importance: 1.3, confidence: 'GENERAL_GUIDANCE' },
          { skillName: 'Data Structures & Algorithms', importance: 1.5, confidence: 'GENERAL_GUIDANCE' },
          { skillName: 'CS Fundamentals & Communication', importance: 1.2, confidence: 'GENERAL_GUIDANCE' },
        ],
  }

  // Create plan record
  const newPlan = await db.companyPreparationPlan.create({
    data: {
      userId,
      companyId: dbCompany?.id || null,
      customCompanyName: input.customCompanyName || null,
      targetRoleSlug: input.targetRoleSlug,
      experienceLevel: input.experienceLevel,
      preparationGoal: input.preparationGoal || null,
      status: 'ACTIVE',
      currentStage: 1,
      readinessScore,
      metrics: metrics as any,
      planData: planData as any,
    },
    include: {
      company: true,
    },
  })

  // Log activity
  await db.activity.create({
    data: {
      userId,
      type: ActivityType.COMPANY_PLAN_CREATED,
      title: `Created Preparation Plan for ${companyName}`,
      description: `Targeting ${roleDef.name} (${input.experienceLevel})`,
      metadata: { planId: newPlan.id, companyName, roleSlug: input.targetRoleSlug },
    },
  })

  return newPlan
}

// ─── Fetching User Plans ──────────────────────────────────────────────────────

export async function getUserCompanyPlans(userId: string) {
  return db.companyPreparationPlan.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      company: true,
    },
  })
}

export async function getCompanyPlanById(userId: string, planId: string) {
  const plan = await db.companyPreparationPlan.findUnique({
    where: { id: planId },
    include: {
      company: {
        include: {
          requirements: { where: { active: true }, orderBy: { displayOrder: 'asc' } },
        },
      },
    },
  })

  if (!plan) return null
  // Enforce cross-user isolation
  if (plan.userId !== userId) return null

  return plan
}

// ─── Plan State Advancement ───────────────────────────────────────────────────

export async function updateCompanyPlan(userId: string, planId: string, input: UpdateCompanyPlanInput) {
  const existing = await getCompanyPlanById(userId, planId)
  if (!existing) return null

  const updateData: any = {}
  if (input.status) updateData.status = input.status
  if (input.currentStage !== undefined) {
    updateData.currentStage = input.currentStage
    if (input.currentStage >= 12 && existing.status === 'ACTIVE') {
      updateData.status = 'COMPLETED'
    }
  }

  const updated = await db.companyPreparationPlan.update({
    where: { id: planId },
    data: updateData,
    include: { company: true },
  })

  if (updateData.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
    await db.activity.create({
      data: {
        userId,
        type: ActivityType.COMPANY_PLAN_COMPLETED,
        title: `Completed Preparation Plan for ${existing.customCompanyName || existing.company?.name || 'Company'}`,
        description: `Achieved stage ${updated.currentStage}`,
        metadata: { planId: updated.id },
      },
    })
  }

  return updated
}
