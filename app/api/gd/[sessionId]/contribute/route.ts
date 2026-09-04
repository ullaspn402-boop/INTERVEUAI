/**
 * POST /api/gd/[sessionId]/contribute — Submit user GD contribution
 *
 * Returns the full sequence of new contributions (user + AI participants + moderator)
 * so the client can animate them one by one.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { IdSchema, SubmitGDContributionSchema } from '@/lib/validation'
import { submitGDContribution, checkGDRateLimit } from '@/services/gd'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateCheck = checkGDRateLimit(session.userId)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please wait before submitting more contributions.',
        retryAfterMs: rateCheck.retryAfterMs,
      },
      { status: 429 }
    )
  }

  const { sessionId } = await params
  const parsedId = IdSchema.safeParse(sessionId)
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SubmitGDContributionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const result = await submitGDContribution(
      session.userId,
      parsedId.data,
      parsed.data.contributionText
    )

    return NextResponse.json({
      newContributions: result.newContributions,
      sessionStatus: result.sessionStatus,
      currentRound: result.currentRound,
      overallScore: result.overallScore ?? null,
      overallFeedback: result.overallFeedback ?? null,
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SESSION_NOT_FOUND') {
        return NextResponse.json({ error: 'GD session not found' }, { status: 404 })
      }
      if (err.message === 'SESSION_COMPLETED') {
        return NextResponse.json({ error: 'This GD session has already been completed' }, { status: 409 })
      }
      if (err.message === 'SESSION_ABANDONED') {
        return NextResponse.json({ error: 'This GD session was abandoned' }, { status: 409 })
      }
    }
    console.error('[POST /api/gd/[sessionId]/contribute] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
