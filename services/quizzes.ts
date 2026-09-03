import { db } from '@/lib/db'
import { QuizDifficulty } from '@prisma/client'

export interface GetQuizzesFilters {
  subjectId?: string
  difficulty?: QuizDifficulty
}

export async function getPublishedQuizzes(filters?: GetQuizzesFilters) {
  const whereClause: {
    isPublished: boolean
    subjectId?: string
    difficulty?: QuizDifficulty
  } = {
    isPublished: true,
  }

  if (filters?.subjectId) {
    whereClause.subjectId = filters.subjectId
  }

  if (filters?.difficulty) {
    whereClause.difficulty = filters.difficulty
  }

  const quizzes = await db.quiz.findMany({
    where: whereClause,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      questionCount: true,
      durationMinutes: true,
      displayOrder: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          name: true,
          shortTitle: true,
          slug: true,
        },
      },
    },
  })

  return quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    slug: q.slug,
    description: q.description,
    difficulty: q.difficulty,
    questionCount: q.questionCount,
    durationMinutes: q.durationMinutes,
    displayOrder: q.displayOrder,
    createdAt: q.createdAt.toISOString(),
    subject: q.subject,
  }))
}

export async function getQuizByIdOrSlug(idOrSlug: string) {
  const quiz = await db.quiz.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      questionCount: true,
      durationMinutes: true,
      displayOrder: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          name: true,
          shortTitle: true,
          slug: true,
        },
      },
      questions: {
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          questionText: true,
          difficulty: true,
          displayOrder: true,
          options: {
            orderBy: { displayOrder: 'asc' },
            select: {
              id: true,
              optionKey: true,
              optionText: true,
              displayOrder: true,
            },
          },
        },
      },
    },
  })

  if (!quiz) return null

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description,
    difficulty: quiz.difficulty,
    questionCount: quiz.questions.length,
    durationMinutes: quiz.durationMinutes,
    displayOrder: quiz.displayOrder,
    createdAt: quiz.createdAt.toISOString(),
    subject: quiz.subject,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      difficulty: q.difficulty,
      displayOrder: q.displayOrder,
      options: q.options,
    })),
  }
}
