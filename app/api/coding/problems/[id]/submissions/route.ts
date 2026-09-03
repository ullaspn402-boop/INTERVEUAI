import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { SubmitCodingSolutionSchema } from '@/lib/validation'
import { createCodingSubmission } from '@/services/coding-submissions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const parseResult = SubmitCodingSolutionSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid submission payload', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const result = await createCodingSubmission({
      userId: session.userId,
      problemId: id,
      language: parseResult.data.language,
      sourceCode: parseResult.data.sourceCode,
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json(result.submission, { status: 201 })
  } catch (error) {
    console.error('Error submitting coding solution:', error)
    return NextResponse.json(
      { error: 'Failed to record coding submission' },
      { status: 500 }
    )
  }
}
