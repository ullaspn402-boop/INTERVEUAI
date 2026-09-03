/**
 * GET /api/interviews/[sessionId]/result
 *
 * Returns the final interview result (overall score out of 100, category metrics breakdown,
 * aggregated strengths and improvements, and full question-by-question evaluations) for the owner.
 * Returns 404 if not found or session is not COMPLETED.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getInterviewResult } from '@/services/interview'

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

  const result = await getInterviewResult(sessionId, session.userId)
  if (!result) {
    return NextResponse.json(
      { error: 'Interview result not found or session is not completed' },
      { status: 404 }
    )
  }

  return NextResponse.json(result)
}
