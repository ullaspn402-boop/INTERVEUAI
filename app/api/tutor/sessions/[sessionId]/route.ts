/**
 * GET /api/tutor/sessions/[sessionId]
 *
 * Returns a tutor session with its messages for the authenticated owner.
 * Returns 404 for both "not found" and "not owner" cases to avoid resource leaking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTutorSession } from '@/services/tutor'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params

  if (!sessionId?.trim()) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  const tutorSession = await getTutorSession(sessionId, session.userId)

  if (!tutorSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json({
    session: {
      id: tutorSession.id,
      title: tutorSession.title,
      status: tutorSession.status,
      subject: tutorSession.subject,
      topic: tutorSession.topic,
      createdAt: tutorSession.createdAt.toISOString(),
      updatedAt: tutorSession.updatedAt.toISOString(),
      messages: tutorSession.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  })
}
