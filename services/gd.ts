/**
 * Group Discussion (GD) Service — Server-only
 *
 * Manages AI-powered Group Discussion sessions where the user participates
 * alongside AI participants with distinct personas.
 *
 * Lifecycle:
 * WAITING → INTRO → IN_PROGRESS → CLOSING → COMPLETED
 * WAITING/INTRO/IN_PROGRESS → ABANDONED
 *
 * Security rules:
 * - userId comes exclusively from JWT session (never client payload)
 * - Every session operation enforces session.userId === userId
 * - COMPLETED and ABANDONED sessions reject further contributions
 * - Scores are calculated server-side; clients cannot override them
 * - Activity logged upon completion
 */

import { db } from '@/lib/db'
import {
  generateGDTopicAI,
  generateGDOpeningAI,
  evaluateGDContributionAI,
  generateGDAIParticipantTurnAI,
  generateGDClosingAI,
} from '@/services/ai'
import { GDContributionType, GDParticipantType, GDSessionStatus, ActivityType } from '@prisma/client'
import type { CreateGDSessionInput, GDSessionQueryInput } from '@/lib/validation'

// ─── GD AI Rate Limiter ────────────────────────────────────────────────────────

const GD_RATE_LIMIT_MAX = 20
const GD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

const gdRateLimitMap = new Map<string, { timestamps: number[] }>()

export function checkGDRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const windowStart = now - GD_RATE_LIMIT_WINDOW_MS

  let entry = gdRateLimitMap.get(userId)
  if (!entry) {
    entry = { timestamps: [] }
    gdRateLimitMap.set(userId, entry)
  }

  entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

  if (entry.timestamps.length >= GD_RATE_LIMIT_MAX) {
    const oldest = entry.timestamps[0]
    return { allowed: false, retryAfterMs: Math.max(0, oldest + GD_RATE_LIMIT_WINDOW_MS - now) }
  }

  entry.timestamps.push(now)
  return { allowed: true }
}

// ─── AI Participant Personas ──────────────────────────────────────────────────

const AI_PERSONAS = [
  { name: 'Arjun', persona: 'Analyst', avatarSeed: 'analyst-arjun' },
  { name: 'Priya', persona: "Devil's Advocate", avatarSeed: 'devil-priya' },
  { name: 'Rahul', persona: 'Synthesizer', avatarSeed: 'synth-rahul' },
  { name: 'Anika', persona: 'Pragmatist', avatarSeed: 'prag-anika' },
]

// ─── Create GD Session ────────────────────────────────────────────────────────

export async function createGDSession(
  userId: string,
  opts: CreateGDSessionInput & { userName: string }
) {
  // Fetch user's target role if not provided
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetRole: true },
  })

  const targetRole = opts.targetRole || user?.targetRole || undefined

  // Get recent GD session topics to avoid repetition
  const recentSessions = await db.gDSession.findMany({
    where: { userId },
    select: { topic: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  const existingTopics = recentSessions.map((s) => s.topic)

  // Generate AI topic if not provided
  let topic: string
  let topicContext: string

  if (opts.topic && opts.topic.trim().length > 5) {
    topic = opts.topic.trim()
    topicContext = `This is a group discussion on the topic: "${topic}". Participants should explore multiple perspectives and engage with each other's points.`
  } else {
    const topicResult = await generateGDTopicAI({ targetRole, existingTopics })
    if (!topicResult.success) {
      throw new Error('GD_TOPIC_GENERATION_FAILED')
    }
    topic = topicResult.data.topic
    topicContext = topicResult.data.topicContext
  }

  const participantCount = Math.min(4, Math.max(2, opts.participantCount ?? 3))
  const totalRounds = Math.min(8, Math.max(3, opts.totalRounds ?? 5))

  // Select AI personas (shuffle for variety)
  const shuffled = [...AI_PERSONAS].sort(() => Math.random() - 0.5)
  const selectedPersonas = shuffled.slice(0, participantCount - 1) // minus 1 for the user

  // Generate moderator opening
  const allParticipantNames = [opts.userName, ...selectedPersonas.map((p) => p.name)]
  const openingResult = await generateGDOpeningAI({
    topic,
    topicContext,
    participantNames: allParticipantNames,
    totalRounds,
  })
  const openingContent = openingResult.success ? openingResult.content : `Welcome to today's GD on "${topic}". Let's begin.`

  // Create session with participants in a transaction
  const session = await db.$transaction(async (tx) => {
    const newSession = await tx.gDSession.create({
      data: {
        userId,
        topic,
        topicContext,
        targetRole,
        totalRounds,
        currentRound: 0,
        status: GDSessionStatus.INTRO,
      },
    })

    // Create moderator participant
    const moderator = await tx.gDParticipant.create({
      data: {
        sessionId: newSession.id,
        type: GDParticipantType.MODERATOR,
        name: 'Moderator',
        persona: 'Moderator',
        avatarSeed: 'moderator',
      },
    })

    // Create user participant
    await tx.gDParticipant.create({
      data: {
        sessionId: newSession.id,
        type: GDParticipantType.USER,
        name: opts.userName,
        persona: 'Candidate',
        avatarSeed: `user-${userId.slice(-6)}`,
      },
    })

    // Create AI participants
    for (const persona of selectedPersonas) {
      await tx.gDParticipant.create({
        data: {
          sessionId: newSession.id,
          type: GDParticipantType.AI,
          name: persona.name,
          persona: persona.persona,
          avatarSeed: persona.avatarSeed,
        },
      })
    }

    // Save moderator opening contribution
    await tx.gDContribution.create({
      data: {
        sessionId: newSession.id,
        participantId: moderator.id,
        round: 0,
        type: GDContributionType.OPENING,
        content: openingContent,
      },
    })

    return newSession
  })

  return getGDSession(userId, session.id)
}

// ─── Get GD Session ───────────────────────────────────────────────────────────

export async function getGDSession(userId: string, sessionId: string) {
  const session = await db.gDSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      participants: {
        orderBy: { createdAt: 'asc' },
      },
      contributions: {
        include: {
          participant: true,
          evaluation: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return session
}

// ─── List User GD Sessions ────────────────────────────────────────────────────

export async function getUserGDSessions(userId: string, opts: GDSessionQueryInput) {
  const sessions = await db.gDSession.findMany({
    where: {
      userId,
      ...(opts.status ? { status: opts.status as GDSessionStatus } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: opts.limit,
    include: {
      participants: {
        where: { type: { not: GDParticipantType.MODERATOR } },
        select: { id: true, name: true, type: true, persona: true, avatarSeed: true },
      },
      _count: {
        select: { contributions: true },
      },
    },
  })

  return sessions
}

// ─── Submit GD Contribution ───────────────────────────────────────────────────

export interface GDContributionResult {
  newContributions: Array<{
    id: string
    participantId: string
    participantName: string
    participantType: string
    participantPersona: string
    round: number
    type: string
    content: string
    createdAt: string
    evaluation?: {
      communicationScore: number
      relevanceScore: number
      depthScore: number
      leadershipScore: number
      originalityScore: number
      overallScore: number
      feedback: string
      strengths: string[]
      improvements: string[]
    } | null
  }>
  sessionStatus: GDSessionStatus
  currentRound: number
  overallScore?: number
  overallFeedback?: string
}

export async function submitGDContribution(
  userId: string,
  sessionId: string,
  contributionText: string
): Promise<GDContributionResult> {
  // Fetch session with participants
  const session = await db.gDSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      participants: true,
      contributions: {
        include: { participant: true, evaluation: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!session) throw new Error('SESSION_NOT_FOUND')
  if (session.status === GDSessionStatus.COMPLETED) throw new Error('SESSION_COMPLETED')
  if (session.status === GDSessionStatus.ABANDONED) throw new Error('SESSION_ABANDONED')

  const userParticipant = session.participants.find((p) => p.type === GDParticipantType.USER)
  const moderatorParticipant = session.participants.find((p) => p.type === GDParticipantType.MODERATOR)
  const aiParticipants = session.participants.filter((p) => p.type === GDParticipantType.AI)

  if (!userParticipant || !moderatorParticipant) throw new Error('INVALID_SESSION_STATE')

  const newRound = session.currentRound + 1
  const isLastRound = newRound >= session.totalRounds
  const newContributions: GDContributionResult['newContributions'] = []

  // Build contribution history for AI context
  const contributionHistory = session.contributions.map((c) => ({
    participantName: c.participant.name,
    participantType: c.participant.type as 'USER' | 'AI' | 'MODERATOR',
    content: c.content,
    round: c.round,
  }))

  const priorContributionsForEval = session.contributions
    .filter((c) => c.participant.type !== GDParticipantType.MODERATOR)
    .map((c) => ({ participantName: c.participant.name, content: c.content }))

  // 1. Save user contribution
  const userContribution = await db.gDContribution.create({
    data: {
      sessionId,
      participantId: userParticipant.id,
      round: newRound,
      type: isLastRound ? GDContributionType.CLOSING : GDContributionType.ARGUMENT,
      content: contributionText,
    },
  })

  // 2. Evaluate user contribution
  const evalResult = await evaluateGDContributionAI({
    topic: session.topic,
    topicContext: session.topicContext,
    contributionText,
    round: newRound,
    totalRounds: session.totalRounds,
    priorContributions: priorContributionsForEval,
    targetRole: session.targetRole || undefined,
  })

  let savedEvaluation: {
    communicationScore: number
    relevanceScore: number
    depthScore: number
    leadershipScore: number
    originalityScore: number
    overallScore: number
    feedback: string
    strengths: string[]
    improvements: string[]
  } | null = null

  if (evalResult.success) {
    const evalData = evalResult.data
    const dbEval = await db.gDEvaluation.create({
      data: {
        contributionId: userContribution.id,
        communicationScore: evalData.communicationScore,
        relevanceScore: evalData.relevanceScore,
        depthScore: evalData.depthScore,
        leadershipScore: evalData.leadershipScore,
        originalityScore: evalData.originalityScore,
        overallScore: evalData.overallScore,
        feedback: evalData.feedback,
        strengths: evalData.strengths,
        improvements: evalData.improvements,
      },
    })
    savedEvaluation = {
      communicationScore: dbEval.communicationScore,
      relevanceScore: dbEval.relevanceScore,
      depthScore: dbEval.depthScore,
      leadershipScore: dbEval.leadershipScore,
      originalityScore: dbEval.originalityScore,
      overallScore: dbEval.overallScore,
      feedback: dbEval.feedback,
      strengths: (dbEval.strengths as string[]) || [],
      improvements: (dbEval.improvements as string[]) || [],
    }
  }

  newContributions.push({
    id: userContribution.id,
    participantId: userParticipant.id,
    participantName: userParticipant.name,
    participantType: 'USER',
    participantPersona: 'Candidate',
    round: newRound,
    type: userContribution.type,
    content: contributionText,
    createdAt: userContribution.createdAt.toISOString(),
    evaluation: savedEvaluation,
  })

  // Update history for AI turns
  contributionHistory.push({
    participantName: userParticipant.name,
    participantType: 'USER',
    content: contributionText,
    round: newRound,
  })

  // 3. Generate AI participant turns
  for (const aiParticipant of aiParticipants) {
    const aiTurnResult = await generateGDAIParticipantTurnAI({
      topic: session.topic,
      topicContext: session.topicContext,
      participantName: aiParticipant.name,
      participantPersona: aiParticipant.persona || 'Analyst',
      targetRole: session.targetRole || undefined,
      contributionHistory,
      round: newRound,
      totalRounds: session.totalRounds,
      userLastContribution: contributionText,
    })

    if (aiTurnResult.success && aiTurnResult.content) {
      const aiContribution = await db.gDContribution.create({
        data: {
          sessionId,
          participantId: aiParticipant.id,
          round: newRound,
          type: isLastRound ? GDContributionType.CLOSING : GDContributionType.ARGUMENT,
          content: aiTurnResult.content,
        },
      })

      contributionHistory.push({
        participantName: aiParticipant.name,
        participantType: 'AI',
        content: aiTurnResult.content,
        round: newRound,
      })

      newContributions.push({
        id: aiContribution.id,
        participantId: aiParticipant.id,
        participantName: aiParticipant.name,
        participantType: 'AI',
        participantPersona: aiParticipant.persona || 'AI',
        round: newRound,
        type: aiContribution.type,
        content: aiTurnResult.content,
        createdAt: aiContribution.createdAt.toISOString(),
        evaluation: null,
      })
    }
  }

  // 4. Handle session completion or update round
  let finalStatus: GDSessionStatus = isLastRound ? GDSessionStatus.CLOSING : GDSessionStatus.IN_PROGRESS
  let overallScore: number | undefined
  let overallFeedback: string | undefined

  if (isLastRound) {
    // Aggregate all user evaluations
    const allUserContribIds = [userContribution.id]
    const previousUserContribs = session.contributions.filter(
      (c) => c.participant.type === GDParticipantType.USER
    )
    for (const c of previousUserContribs) {
      allUserContribIds.push(c.id)
    }

    const allEvals = await db.gDEvaluation.findMany({
      where: { contributionId: { in: allUserContribIds } },
    })

    if (allEvals.length > 0) {
      overallScore = allEvals.reduce((sum, e) => sum + e.overallScore, 0) / allEvals.length
      overallScore = Math.round(overallScore * 10) / 10
    }

    // Generate closing statement
    const userContribsForClosing = [
      ...previousUserContribs.map((c) => ({
        content: c.content,
        round: c.round,
        overallScore: c.evaluation?.overallScore ?? 0,
      })),
      {
        content: contributionText,
        round: newRound,
        overallScore: savedEvaluation?.overallScore ?? 0,
      },
    ]

    const closingResult = await generateGDClosingAI({
      topic: session.topic,
      targetRole: session.targetRole || undefined,
      userContributions: userContribsForClosing,
      allContributions: contributionHistory.map((c) => ({
        participantName: c.participantName,
        content: c.content,
      })),
      averageUserScore: overallScore ?? 0,
    })

    const closingContent = closingResult.success
      ? closingResult.content
      : `Thank you all for the discussion on "${session.topic}". Well done to all participants.`

    overallFeedback = closingContent

    // Save closing moderator contribution
    const closingContrib = await db.gDContribution.create({
      data: {
        sessionId,
        participantId: moderatorParticipant.id,
        round: newRound,
        type: GDContributionType.CLOSING,
        content: closingContent,
      },
    })

    newContributions.push({
      id: closingContrib.id,
      participantId: moderatorParticipant.id,
      participantName: 'Moderator',
      participantType: 'MODERATOR',
      participantPersona: 'Moderator',
      round: newRound,
      type: 'CLOSING',
      content: closingContent,
      createdAt: closingContrib.createdAt.toISOString(),
      evaluation: null,
    })

    finalStatus = GDSessionStatus.COMPLETED

    // Log activity
    await db.activity.create({
      data: {
        userId,
        type: ActivityType.GD_COMPLETED,
        title: 'Completed Group Discussion',
        description: `Topic: "${session.topic}"${overallScore != null ? ` — Score: ${overallScore.toFixed(0)}/100` : ''}`,
        metadata: {
          sessionId,
          topic: session.topic,
          overallScore,
          totalRounds: session.totalRounds,
        },
      },
    })
  }

  // Update session state
  await db.gDSession.update({
    where: { id: sessionId },
    data: {
      currentRound: newRound,
      status: finalStatus,
      ...(overallScore != null ? { overallScore } : {}),
      ...(overallFeedback ? { overallFeedback } : {}),
      ...(finalStatus === GDSessionStatus.COMPLETED ? { completedAt: new Date() } : {}),
    },
  })

  return {
    newContributions,
    sessionStatus: finalStatus,
    currentRound: newRound,
    overallScore,
    overallFeedback,
  }
}

// ─── Abandon GD Session ───────────────────────────────────────────────────────

export async function abandonGDSession(userId: string, sessionId: string) {
  const session = await db.gDSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true, status: true },
  })

  if (!session) throw new Error('SESSION_NOT_FOUND')
  if (session.status === GDSessionStatus.COMPLETED) throw new Error('SESSION_ALREADY_COMPLETED')
  if (session.status === GDSessionStatus.ABANDONED) throw new Error('SESSION_ALREADY_ABANDONED')

  await db.gDSession.update({
    where: { id: sessionId },
    data: { status: GDSessionStatus.ABANDONED },
  })

  return { success: true }
}
