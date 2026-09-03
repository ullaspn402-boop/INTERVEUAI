/**
 * GET  /api/tutor/sessions   — List authenticated user's tutor sessions
 * POST /api/tutor/sessions   — Create a new tutor session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { CreateTutorSessionSchema, TutorSessionQuerySchema } from '@/lib/validation'
import { createTutorSession, getUserTutorSessions } from '@/services/tutor'

// ─── GET /api/tutor/sessions ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = TutorSessionQuerySchema.safeParse({
    limit: searchParams.get('limit'),
  })
  const limit = parsed.success ? parsed.data.limit : 10

  const sessions = await getUserTutorSessions(session.userId, limit)

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      subject: s.subject,
      topic: s.topic,
      messageCount: s._count.messages,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  })
}

// ─── POST /api/tutor/sessions ─────────────────────────────────────────────────

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

  const parsed = CreateTutorSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const tutorSession = await createTutorSession(session.userId, parsed.data)

    return NextResponse.json(
      {
        session: {
          id: tutorSession.id,
          title: tutorSession.title,
          status: tutorSession.status,
          subject: tutorSession.subject,
          topic: tutorSession.topic,
          createdAt: tutorSession.createdAt.toISOString(),
          updatedAt: tutorSession.updatedAt.toISOString(),
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

    console.error('[POST /api/tutor/sessions] Unexpected error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
