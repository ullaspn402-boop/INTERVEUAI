import { db } from '@/lib/db'
import { CodingSubmissionStatus } from '@prisma/client'

export interface CreateCodingSubmissionParams {
  userId: string
  problemId: string
  language: string
  sourceCode: string
}

export async function createCodingSubmission({
  userId,
  problemId,
  language,
  sourceCode,
}: CreateCodingSubmissionParams) {
  // Verify problem exists and is published
  const problem = await db.codingProblem.findFirst({
    where: { id: problemId, isPublished: true },
    select: { id: true, title: true, slug: true },
  })

  if (!problem) {
    return { error: 'Coding problem not found or not published' }
  }

  // Create submission with PENDING status (server controls execution/eval status)
  const submission = await db.codingSubmission.create({
    data: {
      userId,
      problemId: problem.id,
      language: language.toLowerCase(),
      sourceCode,
      status: CodingSubmissionStatus.PENDING,
      score: null,
      executionTimeMs: null,
      memoryUsedKb: null,
      testCasesPassed: null,
      testCasesTotal: null,
      errorMessage: null,
    },
    select: {
      id: true,
      userId: true,
      problemId: true,
      language: true,
      status: true,
      score: true,
      executionTimeMs: true,
      memoryUsedKb: true,
      testCasesPassed: true,
      testCasesTotal: true,
      errorMessage: true,
      submittedAt: true,
      createdAt: true,
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
        },
      },
    },
  })

  // Record Activity log for the submission
  await db.activity.create({
    data: {
      userId,
      type: 'CODING_SUBMITTED',
      title: `Submitted ${problem.title}`,
      description: `Submitted a ${language} solution`,
      metadata: {
        problemId: problem.id,
        submissionId: submission.id,
        language: submission.language,
        status: submission.status,
      },
    },
  })

  return {
    submission: {
      id: submission.id,
      userId: submission.userId,
      problemId: submission.problemId,
      problem: submission.problem,
      language: submission.language,
      status: submission.status,
      score: submission.score,
      executionTimeMs: submission.executionTimeMs,
      memoryUsedKb: submission.memoryUsedKb,
      testCasesPassed: submission.testCasesPassed,
      testCasesTotal: submission.testCasesTotal,
      errorMessage: submission.errorMessage,
      submittedAt: submission.submittedAt.toISOString(),
      createdAt: submission.createdAt.toISOString(),
    },
  }
}

export interface GetUserSubmissionsFilters {
  problemId?: string
  status?: CodingSubmissionStatus
  limit?: number
}

export async function getUserSubmissions(
  userId: string,
  filters?: GetUserSubmissionsFilters
) {
  const limit = Math.min(Math.max(filters?.limit || 20, 1), 50)

  const whereClause: {
    userId: string
    problemId?: string
    status?: CodingSubmissionStatus
  } = {
    userId,
  }

  if (filters?.problemId) {
    whereClause.problemId = filters.problemId
  }

  if (filters?.status) {
    whereClause.status = filters.status
  }

  const submissions = await db.codingSubmission.findMany({
    where: whereClause,
    orderBy: { submittedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      problemId: true,
      language: true,
      status: true,
      score: true,
      testCasesPassed: true,
      testCasesTotal: true,
      submittedAt: true,
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
        },
      },
    },
  })

  return submissions.map((s) => ({
    id: s.id,
    problemId: s.problemId,
    problem: s.problem,
    language: s.language,
    status: s.status,
    score: s.score,
    testCasesPassed: s.testCasesPassed,
    testCasesTotal: s.testCasesTotal,
    submittedAt: s.submittedAt.toISOString(),
  }))
}

export async function getSubmissionById(submissionId: string, userId: string) {
  const submission = await db.codingSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      problemId: true,
      language: true,
      sourceCode: true,
      status: true,
      score: true,
      executionTimeMs: true,
      memoryUsedKb: true,
      testCasesPassed: true,
      testCasesTotal: true,
      errorMessage: true,
      submittedAt: true,
      createdAt: true,
      problem: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
        },
      },
    },
  })

  if (!submission) return null

  // Security check: Only the submission owner can access full submission detail
  if (submission.userId !== userId) {
    return { error: 'FORBIDDEN' as const }
  }

  return {
    submission: {
      id: submission.id,
      userId: submission.userId,
      problemId: submission.problemId,
      problem: submission.problem,
      language: submission.language,
      sourceCode: submission.sourceCode,
      status: submission.status,
      score: submission.score,
      executionTimeMs: submission.executionTimeMs,
      memoryUsedKb: submission.memoryUsedKb,
      testCasesPassed: submission.testCasesPassed,
      testCasesTotal: submission.testCasesTotal,
      errorMessage: submission.errorMessage,
      submittedAt: submission.submittedAt.toISOString(),
      createdAt: submission.createdAt.toISOString(),
    },
  }
}
