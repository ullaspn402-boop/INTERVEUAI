/**
 * GET /api/gd/[sessionId] — Get a GD session with full contribution history
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { IdSchema } from '@/lib/validation'
import { getGDSession } from '@/services/gd'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params
  const parsed = IdSchema.safeParse(sessionId)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
  }

  const gdSession = await getGDSession(session.userId, parsed.data)
  if (!gdSession) {
    return NextResponse.json({ error: 'GD session not found' }, { status: 404 })
  }

  return NextResponse.json({
    session: {
      id: gdSession.id,
      topic: gdSession.topic,
      topicContext: gdSession.topicContext,
      targetRole: gdSession.targetRole,
      totalRounds: gdSession.totalRounds,
      currentRound: gdSession.currentRound,
      status: gdSession.status,
      overallScore: gdSession.overallScore,
      overallFeedback: gdSession.overallFeedback,
      startedAt: gdSession.startedAt.toISOString(),
      completedAt: gdSession.completedAt?.toISOString(),
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
        evaluation: c.evaluation
          ? {
              communicationScore: c.evaluation.communicationScore,
              relevanceScore: c.evaluation.relevanceScore,
              depthScore: c.evaluation.depthScore,
              leadershipScore: c.evaluation.leadershipScore,
              originalityScore: c.evaluation.originalityScore,
              overallScore: c.evaluation.overallScore,
              feedback: c.evaluation.feedback,
              strengths: (c.evaluation.strengths as string[]) || [],
              improvements: (c.evaluation.improvements as string[]) || [],
            }
          : null,
      })),
    },
  })
}
