import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { UpdateTopicProgressSchema } from '@/lib/validation'
import { updateTopicProgress } from '@/services/progress'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const validation = UpdateTopicProgressSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? 'Invalid request parameters'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { topicId, status } = validation.data

    const result = await updateTopicProgress(session.userId, topicId, status)

    return NextResponse.json({
      success: true,
      updated: {
        topicId,
        status: result.topicProgress.status,
        subjectProgress: Math.round(result.userProgress.progress),
        completedTopics: result.userProgress.completedTopics,
        totalTopics: result.userProgress.totalTopics,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Topic not found') {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    console.error('[POST /api/progress/topic]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating topic progress.' },
      { status: 500 }
    )
  }
}
