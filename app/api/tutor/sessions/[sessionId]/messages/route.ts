/**
 * POST /api/tutor/sessions/[sessionId]/messages
 *
 * Send a user message to a tutor session and receive an AI response.
 *
 * Security:
 * - Authentication required (JWT session cookie)
 * - Session ownership enforced server-side
 * - ARCHIVED sessions reject new messages (403)
 * - Per-user rate limit: 20 messages/hour (429 on exceeded)
 * - Message content validated (1–8,000 chars)
 * - OPENAI_API_KEY never returned or logged
 * - Messages persisted only on successful AI response
 * - AI output rendered as plain text by clients (no HTML execution)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { SendTutorMessageSchema } from '@/lib/validation'
import { checkTutorRateLimit, sendTutorMessage } from '@/services/tutor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // 1. Authenticate
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params

  if (!sessionId?.trim()) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  // 2. Check rate limit
  const rateCheck = checkTutorRateLimit(session.userId)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. You can send up to 20 messages per hour.',
        retryAfterMs: rateCheck.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateCheck.retryAfterMs ?? 0) / 1000)),
        },
      }
    )
  }

  // 3. Validate message body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SendTutorMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // 4. Send message and get AI response
  const result = await sendTutorMessage(sessionId, session.userId, parsed.data.content, parsed.data.mode)

  if (!result.success) {
    // Map internal error types to appropriate HTTP status codes
    if (result.error === 'not_found') {
      return NextResponse.json({ error: result.message }, { status: 404 })
    }
    if (result.error === 'session_archived') {
      return NextResponse.json({ error: result.message }, { status: 403 })
    }
    if (result.error === 'configuration_error') {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 503 }
      )
    }
    if (result.error === 'rate_limit') {
      return NextResponse.json(
        { error: 'AI service is temporarily rate-limited. Please try again in a moment.' },
        { status: 503 }
      )
    }

    // service_unavailable / unknown
    return NextResponse.json(
      { error: result.message || 'AI service is temporarily unavailable.' },
      { status: 503 }
    )
  }

  return NextResponse.json({ message: result.message }, { status: 200 })
}
