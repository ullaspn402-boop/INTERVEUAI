import { NextResponse } from 'next/server'
import { QuizQuerySchema } from '@/lib/validation'
import { getPublishedQuizzes } from '@/services/quizzes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = {
      subjectId: searchParams.get('subjectId') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
    }

    const parseResult = QuizQuerySchema.safeParse(rawParams)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const quizzes = await getPublishedQuizzes(parseResult.data)
    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
