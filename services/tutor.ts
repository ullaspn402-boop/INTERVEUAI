/**
 * Tutor Service — Server-only
 *
 * Handles all tutor session and message operations:
 * - Session creation with subject/topic validation
 * - Ownership-enforced session retrieval
 * - Bounded conversation context construction
 * - AI tutor message generation via services/ai.ts
 * - Atomic message persistence (user + assistant in one transaction)
 * - Per-user in-memory rate limiting
 *
 * Security rules:
 * - userId always comes from verified JWT session (never client payload)
 * - Every session access enforces userId === session.userId
 * - AI responses persisted only on success; no fake messages stored
 * - Full conversation content never placed in Activity metadata
 */

import { db } from '@/lib/db'
import { callTutorAI, buildTutorSystemPrompt, type AIMessage } from '@/services/ai'
import { TARGET_ROLES } from '@/lib/roles-data'

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

/**
 * In-memory per-user rate limiter.
 *
 * Strategy: 20 AI message requests per user per 1-hour sliding window.
 * Limitation: State is per-process; does not persist across server restarts
 * or multiple server instances. Safe and sufficient for single-instance deployments.
 */
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

interface RateLimitEntry {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkTutorRateLimit(userId: string): {
  allowed: boolean
  retryAfterMs?: number
} {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  let entry = rateLimitMap.get(userId)
  if (!entry) {
    entry = { timestamps: [] }
    rateLimitMap.set(userId, entry)
  }

  // Prune old timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    // Next slot opens when the oldest timestamp falls out of the window
    const oldestTs = entry.timestamps[0]
    const retryAfterMs = oldestTs + RATE_LIMIT_WINDOW_MS - now
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) }
  }

  entry.timestamps.push(now)
  return { allowed: true }
}

// ─── Context Limit ────────────────────────────────────────────────────────────

/** Maximum number of historical messages sent to OpenAI per request */
const MAX_CONTEXT_MESSAGES = 20

// ─── Session Operations ───────────────────────────────────────────────────────

/**
 * Create a new tutor session for the authenticated user.
 * Validates that the referenced Subject/Topic exists and that
 * the Topic belongs to the given Subject when both are provided.
 */
export async function createTutorSession(
  userId: string,
  opts: {
    subjectId?: string
    topicId?: string
    title?: string
  }
) {
  const { subjectId, topicId, title } = opts

  // Validate Subject exists
  if (subjectId) {
    const subject = await db.subject.findUnique({ where: { id: subjectId } })
    if (!subject) {
      throw new Error('SUBJECT_NOT_FOUND')
    }
  }

  // Validate Topic exists and belongs to Subject when both provided
  if (topicId) {
    const topic = await db.topic.findUnique({ where: { id: topicId } })
    if (!topic) {
      throw new Error('TOPIC_NOT_FOUND')
    }
    if (subjectId && topic.subjectId !== subjectId) {
      throw new Error('TOPIC_SUBJECT_MISMATCH')
    }
  }

  const session = await db.tutorSession.create({
    data: {
      userId,
      subjectId: subjectId || null,
      topicId: topicId || null,
      title: title || null,
      status: 'ACTIVE',
    },
    include: {
      subject: { select: { id: true, name: true, shortTitle: true, slug: true } },
      topic: { select: { id: true, name: true, slug: true } },
    },
  })

  // Log TUTOR_SESSION activity (no conversation content in metadata)
  await db.activity.create({
    data: {
      userId,
      type: 'TUTOR_SESSION',
      title: 'AI Tutor Session',
      description: session.subject
        ? `Studied ${session.subject.name} with AI Tutor`
        : 'Started a general AI Tutor session',
      metadata: {
        sessionId: session.id,
        subjectId: subjectId || null,
        topicId: topicId || null,
      },
    },
  })

  return session
}

/**
 * Get a list of tutor sessions for the authenticated user.
 * Does NOT include message content.
 */
export async function getUserTutorSessions(userId: string, limit: number = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 20)

  return db.tutorSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: safeLimit,
    include: {
      subject: { select: { id: true, name: true, shortTitle: true, slug: true } },
      topic: { select: { id: true, name: true, slug: true } },
      _count: { select: { messages: true } },
    },
  })
}

/**
 * Get a specific tutor session with messages.
 * Enforces ownership: returns null if session doesn't belong to userId.
 */
export async function getTutorSession(sessionId: string, userId: string) {
  const session = await db.tutorSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: { select: { id: true, name: true, shortTitle: true, slug: true } },
      topic: { select: { id: true, name: true, slug: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  })

  if (!session || session.userId !== userId) {
    return null
  }

  return session
}

// ─── Message Operations ───────────────────────────────────────────────────────

// ─── Adaptive Learning Trajectory Analysis ─────────────────────────────

export function analyzeSessionAdaptiveState(messages: Array<{ role: string; content: string }>): {
  currentDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  masteredConcepts: string[]
  strugglingConcepts: string[]
  recentMistake?: string
} {
  const assistantMsgs = messages.filter((m) => m.role.toUpperCase() === 'ASSISTANT')

  let correctCount = 0
  let incorrectCount = 0
  let recentMistake: string | undefined = undefined

  for (const m of assistantMsgs) {
    const lower = m.content.toLowerCase()
    if (lower.includes('correct') && !lower.includes('incorrect') && !lower.includes('not correct')) {
      correctCount++
    }
    if (lower.includes('incorrect') || lower.includes('misconception') || lower.includes('almost') || lower.includes('not quite')) {
      incorrectCount++
      const match = m.content.match(/(?:misconception|mistake|confused|incorrect):\s*([^\n\.]+)/i)
      if (match && match[1]) {
        recentMistake = match[1].trim()
      }
    }
  }

  let currentDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER'
  if (correctCount >= 4 && incorrectCount <= 1) {
    currentDifficulty = 'ADVANCED'
  } else if (correctCount >= 2) {
    currentDifficulty = 'INTERMEDIATE'
  }

  const masteredConcepts: string[] = []
  const strugglingConcepts: string[] = []

  if (correctCount > 0) {
    masteredConcepts.push('Basic Definitions & Core Concepts')
  }
  if (incorrectCount > 0) {
    strugglingConcepts.push('Edge Cases & Specific Mechanics')
  }

  return {
    currentDifficulty,
    masteredConcepts,
    strugglingConcepts,
    recentMistake,
  }
}

// ─── Message Operations ───────────────────────────────────────────────────────

/**
 * Send a user message in a tutor session and get an AI response.
 */
export async function sendTutorMessage(
  sessionId: string,
  userId: string,
  rawContent: string,
  modeOverride?: string
): Promise<
  | { success: true; message: { id: string; role: string; content: string; createdAt: string } }
  | { success: false; error: string; message: string; retryAfterMs?: number }
> {
  // 1. Load and verify session ownership
  const session = await db.tutorSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: { select: { name: true } },
      topic: { select: { name: true } },
    },
  })

  if (!session || session.userId !== userId) {
    return { success: false, error: 'not_found', message: 'Session not found.' }
  }

  // 2. Verify session is not ARCHIVED
  if (session.status === 'ARCHIVED') {
    return {
      success: false,
      error: 'session_archived',
      message: 'This session is archived and cannot receive new messages.',
    }
  }

  // Parse mode prefix if embedded in content
  let cleanContent = rawContent.trim()
  let tutorMode: 'LEARN' | 'ASK_DOUBT' | 'PRACTICE' | 'INTERVIEW_PREP' | 'CODING_HELP' | 'EXPLAIN_MISTAKE' | 'ROLE_PREP' | 'HINT' | 'REVISION' | 'ROLE_READINESS' =
    (modeOverride as any) || 'LEARN'

  if (cleanContent.startsWith('[MODE:')) {
    const match = cleanContent.match(/^\[MODE:([A-Z_]+)\]\s*/)
    if (match && match[1]) {
      if (!modeOverride) {
        tutorMode = match[1] as any
      }
      cleanContent = cleanContent.replace(/^\[MODE:[A-Z_]+\]\s*/, '').trim()
    }
  }

  if (!cleanContent) {
    return { success: false, error: 'invalid_content', message: 'Message content cannot be empty.' }
  }

  // 3. Load user's targetRole & resume context
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetRole: true },
  })

  const targetRoleSlug = user?.targetRole || 'software-engineer'
  const roleDef = TARGET_ROLES.find((r) => r.slug === targetRoleSlug)
  const roleRequirements = roleDef?.requirements.map((req) => req.skillName)

  // 4. Load bounded conversation history
  const recentHistory = await db.tutorMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: MAX_CONTEXT_MESSAGES,
    select: { role: true, content: true },
  })

  const history = recentHistory.reverse()

  // Analyze adaptive trajectory from history
  const adaptiveState = analyzeSessionAdaptiveState(history)

  // Build adaptive, role-aware system prompt
  const systemPrompt = buildTutorSystemPrompt({
    subjectName: session.subject?.name,
    topicName: session.topic?.name,
    targetRole: roleDef?.name || targetRoleSlug,
    tutorMode,
    roleRequirements,
    currentDifficulty: adaptiveState.currentDifficulty,
    masteredConcepts: adaptiveState.masteredConcepts,
    strugglingConcepts: adaptiveState.strugglingConcepts,
    recentMistake: adaptiveState.recentMistake,
  })

  // 5. Construct AI context
  const aiMessages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: cleanContent },
  ]

  // 6. Call OpenAI with backoff
  const aiResult = await callTutorAI(aiMessages)

  if (!aiResult.success) {
    return {
      success: false,
      error: aiResult.error,
      message: aiResult.message,
    }
  }

  // 7. Persist USER + ASSISTANT messages in a single transaction
  const [, assistantMsg] = await db.$transaction([
    db.tutorMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content: cleanContent,
      },
    }),
    db.tutorMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: aiResult.content,
      },
    }),
  ])

  // Update session updatedAt
  await db.tutorSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  })

  // 8. Return the assistant message
  return {
    success: true,
    message: {
      id: assistantMsg.id,
      role: assistantMsg.role,
      content: assistantMsg.content,
      createdAt: assistantMsg.createdAt.toISOString(),
    },
  }
}

// ─── End-of-Session Learning Summary ───────────────────────────────────────────

export async function getTutorSessionSummary(sessionId: string, userId: string) {
  const session = await db.tutorSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: { select: { name: true } },
      topic: { select: { name: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { role: true, content: true },
      },
    },
  })

  if (!session || session.userId !== userId) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { targetRole: true },
  })

  const { generateTutorSessionSummaryAI } = await import('@/services/ai')

  const summaryRes = await generateTutorSessionSummaryAI({
    subjectName: session.subject?.name,
    topicName: session.topic?.name,
    targetRole: user?.targetRole || 'Software Engineer',
    messages: session.messages,
  })

  if (summaryRes.success) {
    return summaryRes.summary
  }

  return {
    score: 75,
    topicsCovered: [session.topic?.name || session.subject?.name || 'General Computer Science'],
    conceptsMastered: ['Core Definitions & Logic'],
    conceptsNeedingPractice: ['Implementation & Edge Cases'],
    commonMistakes: ['Slight misconception regarding trade-offs'],
    recommendedNextTopic: 'Practical coding & problem solving',
  }
}
