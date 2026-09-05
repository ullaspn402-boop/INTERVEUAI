/**
 * GET /api/tutor/sessions/[sessionId]/summary
 *
 * Generates and returns a structured end-of-session learning summary report.
 *
 * Security:
 * - Authentication required (JWT session cookie)
 * - Session ownership enforced server-side
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTutorSessionSummary } from '@/services/tutor'

export async function GET(
  request: NextRequest,
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

  const summary = await getTutorSessionSummary(sessionId, session.userId)
  if (!summary) {
    return NextResponse.json({ error: 'Session not found or access denied.' }, { status: 404 })
  }

  return NextResponse.json({ summary })
}
