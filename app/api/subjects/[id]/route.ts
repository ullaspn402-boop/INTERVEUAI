import { NextRequest, NextResponse } from 'next/server'
import { getSubjectBySlugOrId } from '@/services/subjects'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Subject ID or slug is required' }, { status: 400 })
    }

    const subject = await getSubjectBySlugOrId(id)

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json({ subject })
  } catch (error) {
    console.error('[GET /api/subjects/[id]]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching subject details.' },
      { status: 500 }
    )
  }
}
