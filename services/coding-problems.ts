import { db } from '@/lib/db'
import { QuizDifficulty } from '@prisma/client'

export interface GetCodingProblemsFilters {
  subjectId?: string
  topicId?: string
  difficulty?: QuizDifficulty
  limit?: number
}

export async function getPublishedCodingProblems(filters?: GetCodingProblemsFilters) {
  const limit = Math.min(Math.max(filters?.limit || 20, 1), 50)

  const whereClause: {
    isPublished: boolean
    subjectId?: string
    topicId?: string
    difficulty?: QuizDifficulty
  } = {
    isPublished: true,
  }

  if (filters?.subjectId) {
    whereClause.subjectId = filters.subjectId
  }

  if (filters?.topicId) {
    whereClause.topicId = filters.topicId
  }

  if (filters?.difficulty) {
    whereClause.difficulty = filters.difficulty
  }

  const problems = await db.codingProblem.findMany({
    where: whereClause,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      constraints: true,
      inputFormat: true,
      outputFormat: true,
      tags: true,
      isPublished: true,
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
      topic: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return problems.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    difficulty: p.difficulty,
    constraints: p.constraints,
    inputFormat: p.inputFormat,
    outputFormat: p.outputFormat,
    tags: p.tags,
    isPublished: p.isPublished,
    displayOrder: p.displayOrder,
    createdAt: p.createdAt.toISOString(),
    subject: p.subject,
    topic: p.topic,
  }))
}

export async function getCodingProblemByIdOrSlug(idOrSlug: string) {
  const problem = await db.codingProblem.findFirst({
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
      constraints: true,
      inputFormat: true,
      outputFormat: true,
      examples: true,
      starterCode: true,
      tags: true,
      isPublished: true,
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
      topic: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!problem) return null

  return {
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    description: problem.description,
    difficulty: problem.difficulty,
    constraints: problem.constraints,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    examples: problem.examples,
    starterCode: problem.starterCode,
    tags: problem.tags,
    isPublished: problem.isPublished,
    displayOrder: problem.displayOrder,
    createdAt: problem.createdAt.toISOString(),
    subject: problem.subject,
    topic: problem.topic,
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
  }
}
