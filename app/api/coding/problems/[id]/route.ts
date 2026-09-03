import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCodingProblemByIdOrSlug } from '@/services/coding-problems'

export async function GET(
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

    const problem = await getCodingProblemByIdOrSlug(id)
    if (!problem) {
      return NextResponse.json(
        { error: 'Coding problem not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(problem)
  } catch (error) {
    console.error('Error fetching coding problem:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coding problem' },
      { status: 500 }
    )
  }
}
