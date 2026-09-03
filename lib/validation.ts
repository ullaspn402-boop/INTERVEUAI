/**
 * Zod validation schemas for authentication input.
 * Used server-side only in API route handlers.
 * Browser validation (type="email", required) is NOT relied upon server-side.
 *
 * Stage 10: Added IdSchema for URL parameter length bounding.
 */

import { z } from 'zod'

// ─── URL Parameter Safety ─────────────────────────────────────────────────────

/**
 * Used to validate ID/slug path parameters from URL segments.
 * Prevents unnecessary DB lookups from crafted oversized IDs.
 */
export const IdSchema = z.string().trim().min(1, 'ID is required').max(128, 'ID is too long')

export type IdInput = z.infer<typeof IdSchema>

// ─── Register ────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),

  // Optional profile fields collected at registration
  college: z.string().trim().max(200).optional(),
  degree: z.string().trim().max(200).optional(),
  graduationYear: z.number().int().min(2000).max(2040).optional(),
  targetRole: z.string().trim().max(200).optional(),
  targetCompanies: z.string().trim().max(500).optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

// ─── Login ───────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Invalid credentials'),
})

export type LoginInput = z.infer<typeof LoginSchema>

// ─── Profile Update ──────────────────────────────────────────────────────────

export const ProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    college: z.string().trim().max(200).optional(),
    degree: z.string().trim().max(200).optional(),
    graduationYear: z.number().int().min(2000).max(2040).optional(),
    targetRole: z.string().trim().max(200).optional(),
    targetCompanies: z.string().trim().max(500).optional(),
  })
  .partial()

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>

// ─── Topic Progress ──────────────────────────────────────────────────────────

export const UpdateTopicProgressSchema = z.object({
  topicId: z.string().trim().min(1, 'Topic ID is required'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
})

export type UpdateTopicProgressInput = z.infer<typeof UpdateTopicProgressSchema>

// ─── Activity Query ──────────────────────────────────────────────────────────

export const ActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type ActivityQueryInput = z.infer<typeof ActivityQuerySchema>

// ─── Quiz Validation ─────────────────────────────────────────────────────────

export const QuizQuerySchema = z.object({
  subjectId: z.string().trim().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
})

export type QuizQueryInput = z.infer<typeof QuizQuerySchema>

export const SubmitQuizAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().trim().min(1, 'Question ID is required'),
        selectedOptionId: z.string().trim().min(1, 'Selected Option ID is required'),
      })
    )
    .min(1, 'At least one answer must be submitted'),
})

export type SubmitQuizAttemptInput = z.infer<typeof SubmitQuizAttemptSchema>

export const QuizAttemptQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type QuizAttemptQueryInput = z.infer<typeof QuizAttemptQuerySchema>

// ─── Coding Validation ───────────────────────────────────────────────────────

export const CodingProblemQuerySchema = z.object({
  subjectId: z.string().trim().optional(),
  topicId: z.string().trim().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type CodingProblemQueryInput = z.infer<typeof CodingProblemQuerySchema>

export const SubmitCodingSolutionSchema = z.object({
  language: z.enum(['javascript', 'python', 'java', 'cpp'], {
    message: 'Language must be one of: javascript, python, java, cpp',
  }),
  sourceCode: z
    .string()
    .min(1, 'Source code cannot be empty')
    .max(65536, 'Source code exceeds maximum size limit of 64KB'),
})

export type SubmitCodingSolutionInput = z.infer<typeof SubmitCodingSolutionSchema>

export const SubmissionQuerySchema = z.object({
  problemId: z.string().trim().optional(),
  status: z
    .enum(['PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'COMPILE_ERROR', 'ERROR'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type SubmissionQueryInput = z.infer<typeof SubmissionQuerySchema>

// ─── Tutor Validation ─────────────────────────────────────────────────────────

export const CreateTutorSessionSchema = z.object({
  subjectId: z.string().trim().min(1).optional(),
  topicId: z.string().trim().min(1).optional(),
  title: z.string().trim().max(200).optional(),
})

export type CreateTutorSessionInput = z.infer<typeof CreateTutorSessionSchema>

export const SendTutorMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(8000, 'Message exceeds 8,000 character limit'),
})

export type SendTutorMessageInput = z.infer<typeof SendTutorMessageSchema>

export const TutorSessionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

export type TutorSessionQueryInput = z.infer<typeof TutorSessionQuerySchema>

// ─── Interview Validation ─────────────────────────────────────────────────────

export const CreateInterviewSchema = z.object({
  interviewType: z.enum(['GENERAL', 'TECHNICAL', 'BEHAVIORAL', 'MIXED']).default('TECHNICAL'),
  targetRole: z.string().trim().max(200).optional(),
  subjectId: z.string().trim().optional(),
  topicId: z.string().trim().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  questionCount: z.coerce.number().int().min(3).max(15).default(5),
  title: z.string().trim().max(200).optional(),
})

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>

export const SubmitInterviewAnswerSchema = z.object({
  answerText: z
    .string()
    .trim()
    .min(1, 'Answer text cannot be empty')
    .max(8000, 'Answer text exceeds 8,000 character limit'),
})

export type SubmitInterviewAnswerInput = z.infer<typeof SubmitInterviewAnswerSchema>

export const InterviewQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
  interviewType: z.enum(['GENERAL', 'TECHNICAL', 'BEHAVIORAL', 'MIXED']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type InterviewQueryInput = z.infer<typeof InterviewQuerySchema>

export const AIEvaluationResponseSchema = z.object({
  relevanceScore: z.number().min(0).max(10),
  correctnessScore: z.number().min(0).max(10),
  clarityScore: z.number().min(0).max(10),
  depthScore: z.number().min(0).max(10),
  overallScore: z.number().min(0).max(10),
  feedback: z.string().min(1),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
})

export type AIEvaluationResponse = z.infer<typeof AIEvaluationResponseSchema>

// ─── Forgot Password / Reset Password / Verification Validation ───────────────

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export const ResetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export const VerifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
})

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>

export const ResendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>


