/**
 * GET  /api/interviews — List authenticated user's interview sessions
 * POST /api/interviews — Create a new interview session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { CreateInterviewSchema, InterviewQuerySchema } from '@/lib/validation'
import { createInterviewSession, getUserInterviews } from '@/services/interview'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = InterviewQuerySchema.safeParse({
    status: searchParams.get('status') || undefined,
    interviewType: searchParams.get('interviewType') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    limit: searchParams.get('limit') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  const interviews = await getUserInterviews(session.userId, parsed.data)

  return NextResponse.json({
    interviews: interviews.map((i) => ({
      id: i.id,
      title: i.title,
      interviewType: i.interviewType,
      targetRole: i.targetRole,
      difficulty: i.difficulty,
      questionCount: i.questionCount,
      currentQuestionNumber: i.currentQuestionNumber,
      status: i.status,
      overallScore: i.overallScore,
      startedAt: i.startedAt.toISOString(),
      completedAt: i.completedAt?.toISOString(),
      createdAt: i.createdAt.toISOString(),
      subject: i.subject,
      topic: i.topic,
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

  const parsed = CreateInterviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const newSession = await createInterviewSession(session.userId, parsed.data)

    return NextResponse.json(
      {
        session: {
          id: newSession.id,
          title: newSession.title,
          interviewType: newSession.interviewType,
          targetRole: newSession.targetRole,
          difficulty: newSession.difficulty,
          questionCount: newSession.questionCount,
          currentQuestionNumber: newSession.currentQuestionNumber,
          status: newSession.status,
          createdAt: newSession.createdAt.toISOString(),
          subject: newSession.subject,
          topic: newSession.topic,
        },
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'SUBJECT_NOT_FOUND') {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
      }
      if (err.message === 'TOPIC_NOT_FOUND') {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
      }
      if (err.message === 'TOPIC_SUBJECT_MISMATCH') {
        return NextResponse.json(
          { error: 'Topic does not belong to the specified subject' },
          { status: 400 }
        )
      }
    }
    console.error('[POST /api/interviews] Error creating session', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
