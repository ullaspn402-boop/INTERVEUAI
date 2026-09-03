/**
 * GET /api/interviews/[sessionId]
 *
 * Returns session metadata, current question, and past Q&A history for the session owner.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getInterviewSession } from '@/services/interview'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params
  if (!sessionId?.trim()) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
  }

  const interviewSession = await getInterviewSession(sessionId, session.userId)
  if (!interviewSession) {
    return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
  }

  // Find active / current question
  const currentQuestion = interviewSession.questions.find(
    (q) => q.questionNumber === interviewSession.currentQuestionNumber
  )

  return NextResponse.json({
    session: {
      id: interviewSession.id,
      title: interviewSession.title,
      interviewType: interviewSession.interviewType,
      targetRole: interviewSession.targetRole,
      difficulty: interviewSession.difficulty,
      questionCount: interviewSession.questionCount,
      currentQuestionNumber: interviewSession.currentQuestionNumber,
      status: interviewSession.status,
      overallScore: interviewSession.overallScore,
      overallFeedback: interviewSession.overallFeedback,
      startedAt: interviewSession.startedAt.toISOString(),
      completedAt: interviewSession.completedAt?.toISOString(),
      createdAt: interviewSession.createdAt.toISOString(),
      subject: interviewSession.subject,
      topic: interviewSession.topic,
    },
    currentQuestion: currentQuestion
      ? {
          id: currentQuestion.id,
          questionNumber: currentQuestion.questionNumber,
          questionText: currentQuestion.questionText,
          questionType: currentQuestion.questionType,
          difficulty: currentQuestion.difficulty,
        }
      : null,
    questions: interviewSession.questions.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionType: q.questionType,
      difficulty: q.difficulty,
      answer: q.answer
        ? {
            id: q.answer.id,
            answerText: q.answer.answerText,
            submittedAt: q.answer.submittedAt.toISOString(),
            evaluation: q.answer.evaluation
              ? {
                  relevanceScore: q.answer.evaluation.relevanceScore,
                  correctnessScore: q.answer.evaluation.correctnessScore,
                  clarityScore: q.answer.evaluation.clarityScore,
                  depthScore: q.answer.evaluation.depthScore,
                  overallScore: q.answer.evaluation.overallScore,
                  feedback: q.answer.evaluation.feedback,
                  strengths: q.answer.evaluation.strengths,
                  improvements: q.answer.evaluation.improvements,
                }
              : null,
          }
        : null,
    })),
  })
}
