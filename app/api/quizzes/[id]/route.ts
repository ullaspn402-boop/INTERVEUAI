import { NextResponse } from 'next/server'
import { getQuizByIdOrSlug } from '@/services/quizzes'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Quiz ID or slug required' }, { status: 400 })
    }

    const quiz = await getQuizByIdOrSlug(id)
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz detail' },
      { status: 500 }
    )
  }
}
