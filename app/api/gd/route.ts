/**
 * GET  /api/gd — List authenticated user's GD sessions
 * POST /api/gd — Create a new GD session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { CreateGDSessionSchema, GDSessionQuerySchema } from '@/lib/validation'
import { createGDSession, getUserGDSessions } from '@/services/gd'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = GDSessionQuerySchema.safeParse({
    status: searchParams.get('status') || undefined,
    limit: searchParams.get('limit') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  const sessions = await getUserGDSessions(session.userId, parsed.data)

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      topic: s.topic,
      topicContext: s.topicContext,
      targetRole: s.targetRole,
      totalRounds: s.totalRounds,
      currentRound: s.currentRound,
      status: s.status,
      overallScore: s.overallScore,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      participants: s.participants,
      contributionCount: s._count.contributions,
    })),
  })
}

export async function POST(request: NextRequest) {
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

  const parsed = CreateGDSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const gdSession = await createGDSession(session.userId, {
      ...parsed.data,
      userName: session.name,
    })

    if (!gdSession) {
      return NextResponse.json({ error: 'Failed to create GD session' }, { status: 500 })
    }

    return NextResponse.json(
      {
        session: {
          id: gdSession.id,
          topic: gdSession.topic,
          topicContext: gdSession.topicContext,
          targetRole: gdSession.targetRole,
          totalRounds: gdSession.totalRounds,
          currentRound: gdSession.currentRound,
          status: gdSession.status,
          startedAt: gdSession.startedAt.toISOString(),
          createdAt: gdSession.createdAt.toISOString(),
          participants: gdSession.participants,
          contributions: gdSession.contributions.map((c) => ({
            id: c.id,
            participantId: c.participantId,
            participantName: c.participant.name,
            participantType: c.participant.type,
            participantPersona: c.participant.persona,
            round: c.round,
            type: c.type,
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            evaluation: null,
          })),
        },
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'GD_TOPIC_GENERATION_FAILED') {
      return NextResponse.json({ error: 'Failed to generate GD topic. Please try again.' }, { status: 503 })
    }
    console.error('[POST /api/gd] Error creating GD session:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
