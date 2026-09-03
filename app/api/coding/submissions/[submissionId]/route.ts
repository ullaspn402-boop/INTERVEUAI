import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSubmissionById } from '@/services/coding-submissions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId } = await params
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const result = await getSubmissionById(submissionId, session.userId)

    if (!result) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if ('error' in result && result.error === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Access denied to submission' }, { status: 403 })
    }

    return NextResponse.json(result.submission)
  } catch (error) {
    console.error('Error fetching submission detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission detail' },
      { status: 500 }
    )
  }
}
