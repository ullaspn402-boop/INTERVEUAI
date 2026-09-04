/**
 * Personalization Service — Server-only
 *
 * Builds a personalized preparation profile from real persisted user data.
 * Reuses getUserAnalytics() from Stage 8 to avoid duplicate expensive queries.
 *
 * Rules:
 * - 100% deterministic, server-side logic only
 * - Zero OpenAI calls
 * - Zero hardcoded or fabricated data
 * - "No data" and "weak" are distinct states — never conflated
 * - User identity derived exclusively from authenticated userId
 */

import { db } from '@/lib/db'
import { getUserAnalytics, type UserAnalyticsOverview } from '@/services/analytics'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PreparationLevelCode =
  | 'not_started'
  | 'getting_started'
  | 'building'
  | 'developing'
  | 'interview_ready'

export type MomentumState = 'increasing' | 'steady' | 'decreasing' | 'insufficient_data'

export type CoverageState = 'covered' | 'partially_covered' | 'not_covered' | 'insufficient_data'

export interface SubjectInsight {
  subjectId: string
  slug: string
  title: string
  full: string
  progressPct: number
  quizScorePct: number | null
  codingSolvedCount: number
  strength: 'strong' | 'developing' | 'weak' | 'no_data'
  reason: string
}

export interface SubjectPriority {
  subjectId: string
  slug: string
  title: string
  full: string
  progressPct: number
  quizScorePct: number | null
  priorityScore: number
  priority: 'high' | 'medium' | 'low'
  reasons: string[]
  recommendedAction: string
  actionHref: string
}

export interface TopicPriority {
  topicId: string
  name: string
  subjectTitle: string
  subjectSlug: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  progressPct: number
  priority: 'high' | 'medium' | 'low'
  reason: string
  recommendedAction: string
  actionHref: string
}

export interface LearningPathItem {
  order: number
  type: 'subject_study' | 'quiz' | 'coding' | 'interview' | 'review'
  title: string
  description: string
  subjectSlug?: string
  topicName?: string
  effort: 'low' | 'medium' | 'high'
  priority: 'high' | 'medium' | 'low'
  actionText: string
  actionHref: string
}

export interface AdaptiveRecommendation {
  id: string
  category: 'quiz' | 'coding' | 'interview' | 'subject' | 'general' | 'tutor'
  dimension?: string
  title: string
  description: string
  evidence: string
  actionText: string
  actionHref: string
  priority: 'high' | 'medium' | 'low'
}

export interface CoverageDetail {
  state: CoverageState
  covered: number
  total: number
  pct: number
}

export interface UserPersonalizationProfile {
  preparationLevel: {
    code: PreparationLevelCode
    label: string
    description: string
  }
  readinessScore: number
  strongestSubjects: SubjectInsight[]
  weakestSubjects: SubjectInsight[]
  subjectPriority: SubjectPriority[]
  topicPriority: TopicPriority[]
  learningPath: LearningPathItem[]
  adaptiveRecommendations: AdaptiveRecommendation[]
  momentum: {
    state: MomentumState
    evidence: string
    recentActivityCount: number
  }
  coverage: {
    subjects: CoverageDetail
    topics: CoverageDetail
    quizzes: CoverageDetail
    coding: CoverageDetail
  }
  insufficientDataAreas: string[]
}

// ─── Preparation Level Thresholds ─────────────────────────────────────────────

function computePreparationLevel(
  analytics: UserAnalyticsOverview,
  activeModules: number
): { code: PreparationLevelCode; label: string; description: string } {
  const { readiness, quizzes, coding, interviews } = analytics
  const score = readiness.score

  const hasInterviewCompleted = interviews.completedInterviews > 0
  const hasCodeSolved = coding.solvedProblemsCount >= 5
  const hasQuizActivity = quizzes.completedAttempts > 0

  // not_started: absolutely zero cross-module activity
  if (activeModules === 0) {
    return {
      code: 'not_started',
      label: 'Not Started',
      description: 'You have not begun any placement preparation. Start with a subject quiz to establish your baseline.',
    }
  }

  // interview_ready: readiness ≥75 AND completed interview AND 5+ problems AND quizzes done
  if (score >= 75 && hasInterviewCompleted && hasCodeSolved && hasQuizActivity) {
    return {
      code: 'interview_ready',
      label: 'Interview Ready',
      description: 'Strong across quizzes, coding, and interviews. Continue practicing to maintain your edge.',
    }
  }

  // developing: readiness 50–74 or 3+ active modules
  if (score >= 50 || activeModules >= 3) {
    return {
      code: 'developing',
      label: 'Developing',
      description: 'Good progress across multiple areas. Focus on your weakest subjects and attempt an AI interview.',
    }
  }

  // building: readiness 25–49 or 2+ modules with activity
  if (score >= 25 || activeModules >= 2) {
    return {
      code: 'building',
      label: 'Building',
      description: 'You have started across some areas. Keep completing topics and taking quizzes consistently.',
    }
  }

  // getting_started: some minimal activity but still very early
  return {
    code: 'getting_started',
    label: 'Getting Started',
    description: 'You have taken your first steps. Try a quiz, solve a coding problem, and explore the AI tutor.',
  }
}

// ─── Strength / Weakness Engine ───────────────────────────────────────────────

function classifySubjectStrength(
  progressPct: number,
  quizScorePct: number | null,
  codingSolvedCount: number
): { strength: SubjectInsight['strength']; reason: string } {
  // No data at all for this subject
  if (progressPct === 0 && quizScorePct === null && codingSolvedCount === 0) {
    return {
      strength: 'no_data',
      reason: 'No quiz attempts, topic progress, or coding submissions for this subject.',
    }
  }

  // Strong: progress ≥ 60% AND (quiz ≥ 70% or no quiz data)
  const quizOk = quizScorePct === null || quizScorePct >= 70
  if (progressPct >= 60 && quizOk) {
    return {
      strength: 'strong',
      reason: `${progressPct}% topic completion${quizScorePct !== null ? ` · ${quizScorePct}% quiz avg` : ''}.`,
    }
  }

  // Weak: progress < 30% AND there is some evidence of activity
  const hasAnyActivity = progressPct > 0 || quizScorePct !== null || codingSolvedCount > 0
  if (progressPct < 30 && hasAnyActivity) {
    return {
      strength: 'weak',
      reason: `Only ${progressPct}% topic completion${quizScorePct !== null ? ` · ${quizScorePct}% quiz avg` : ''}.`,
    }
  }

  // Developing otherwise
  return {
    strength: 'developing',
    reason: `${progressPct}% topic completion — making progress.`,
  }
}

// ─── Subject Prioritization ───────────────────────────────────────────────────

function computeSubjectPriority(sp: UserAnalyticsOverview['subjectProgress'][number]): {
  priorityScore: number
  priority: 'high' | 'medium' | 'low'
  reasons: string[]
  recommendedAction: string
  actionHref: string
} {
  const reasons: string[] = []
  let score = 0

  // Topic progress gap (weight: 0.5)
  const progressGap = 100 - sp.value
  score += progressGap * 0.5
  if (progressGap > 70) reasons.push(`Only ${sp.value}% topics completed`)

  // Quiz gap (weight: 0.3)
  if (sp.quizScorePct !== null) {
    const quizGap = 100 - sp.quizScorePct
    score += quizGap * 0.3
    if (sp.quizScorePct < 60) reasons.push(`Quiz avg: ${sp.quizScorePct}% (below 60%)`)
  } else {
    // No quiz data: add a medium penalty for unknown state
    score += 15
    reasons.push('No quiz attempts yet for this subject')
  }

  // No coding coverage (weight: 0.2)
  if (sp.codingSolvedCount === 0) {
    score += 20
    reasons.push('No coding problems solved')
  }

  const priority: 'high' | 'medium' | 'low' =
    score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low'

  let recommendedAction = 'Continue studying topics'
  let actionHref = '/preparation'
  if (sp.value < 30) {
    recommendedAction = 'Start with fundamentals'
    actionHref = '/preparation'
  } else if (sp.quizScorePct === null || sp.quizScorePct < 60) {
    recommendedAction = 'Take a subject quiz'
    actionHref = '/quizzes'
  } else if (sp.codingSolvedCount === 0) {
    recommendedAction = 'Attempt a coding problem'
    actionHref = '/coding'
  }

  return { priorityScore: Math.round(score), priority, reasons, recommendedAction, actionHref }
}

// ─── Momentum Calculation ─────────────────────────────────────────────────────

async function computeMomentum(userId: string): Promise<{
  state: MomentumState
  evidence: string
  recentActivityCount: number
}> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [last7, prev7, totalCount] = await Promise.all([
    db.activity.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
    db.activity.count({ where: { userId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    db.activity.count({ where: { userId } }),
  ])

  if (totalCount < 3) {
    return {
      state: 'insufficient_data',
      evidence: 'Not enough activity history to determine momentum.',
      recentActivityCount: last7,
    }
  }

  if (last7 > prev7) {
    return {
      state: 'increasing',
      evidence: `${last7} activities this week vs. ${prev7} the week before.`,
      recentActivityCount: last7,
    }
  }

  if (last7 === prev7) {
    return {
      state: 'steady',
      evidence: `${last7} activities this week, consistent with last week.`,
      recentActivityCount: last7,
    }
  }

  return {
    state: 'decreasing',
    evidence: `${last7} activities this week, down from ${prev7} last week.`,
    recentActivityCount: last7,
  }
}

// ─── Coverage Calculation ─────────────────────────────────────────────────────

async function computeCoverage(
  userId: string,
  analytics: UserAnalyticsOverview
): Promise<UserPersonalizationProfile['coverage']> {
  const [totalTopics, touchedTopics, totalQuizzes, totalProblems] = await Promise.all([
    db.topic.count(),
    db.topicProgress.count({ where: { userId } }),
    db.quiz.count({ where: { isPublished: true } }),
    db.codingProblem.count({ where: { isPublished: true } }),
  ])

  const totalSubjects = analytics.subjectProgress.length
  const coveredSubjects = analytics.subjectProgress.filter((s) => s.value > 0).length
  const quizzesAttempted = analytics.quizzes.completedAttempts
  const problemsAttempted = analytics.coding.totalSubmissions > 0
    ? (await db.codingSubmission.groupBy({ by: ['problemId'], where: { userId } })).length
    : 0

  const makeCoverage = (covered: number, total: number): CoverageDetail => {
    if (total === 0) return { state: 'insufficient_data', covered: 0, total: 0, pct: 0 }
    const pct = Math.round((covered / total) * 100)
    const state: CoverageState =
      pct >= 70 ? 'covered' : pct > 0 ? 'partially_covered' : 'not_covered'
    return { state, covered, total, pct }
  }

  return {
    subjects: makeCoverage(coveredSubjects, totalSubjects),
    topics: makeCoverage(touchedTopics, totalTopics),
    quizzes: makeCoverage(quizzesAttempted, totalQuizzes),
    coding: makeCoverage(problemsAttempted, totalProblems),
  }
}

// ─── Topic Prioritization ─────────────────────────────────────────────────────

async function computeTopicPriority(
  userId: string,
  subjectPriorityList: SubjectPriority[]
): Promise<TopicPriority[]> {
  // Build high-priority subject IDs to focus topic retrieval
  const highPrioritySubjectIds = subjectPriorityList
    .filter((s) => s.priority === 'high' || s.priority === 'medium')
    .map((s) => s.subjectId)

  if (highPrioritySubjectIds.length === 0) return []

  const topics = await db.topic.findMany({
    where: { subjectId: { in: highPrioritySubjectIds } },
    include: {
      subject: { select: { id: true, shortTitle: true, slug: true } },
      topicProgresses: {
        where: { userId },
        select: { status: true, progress: true },
      },
    },
    orderBy: [{ subject: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
    take: 30,
  })

  const results: TopicPriority[] = []

  for (const topic of topics) {
    const tp = topic.topicProgresses[0]
    const status = tp?.status ?? 'NOT_STARTED'
    const progressPct = tp ? Math.round(tp.progress) : 0

    if (status === 'COMPLETED') continue // skip completed topics

    const subPriority = subjectPriorityList.find((s) => s.subjectId === topic.subjectId)
    const priority: 'high' | 'medium' | 'low' =
      status === 'IN_PROGRESS' ? 'high'
      : subPriority?.priority === 'high' ? 'high'
      : subPriority?.priority === 'medium' ? 'medium'
      : 'low'

    const reason =
      status === 'IN_PROGRESS'
        ? `In progress — ${progressPct}% complete. Resume to build momentum.`
        : `Not started in ${subPriority?.full ?? topic.subject.shortTitle} — a high-priority subject.`

    const recommendedAction =
      status === 'IN_PROGRESS' ? 'Continue this topic' : 'Start this topic'

    results.push({
      topicId: topic.id,
      name: topic.name,
      subjectTitle: topic.subject.shortTitle,
      subjectSlug: topic.subject.slug,
      status: status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
      progressPct,
      priority,
      reason,
      recommendedAction,
      actionHref: '/preparation',
    })
  }

  // Sort: IN_PROGRESS first, then NOT_STARTED by subject priority
  return results
    .sort((a, b) => {
      if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1
      if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1
      const pa = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2
      const pb = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2
      return pa - pb
    })
    .slice(0, 10)
}

// ─── Learning Path Generation ─────────────────────────────────────────────────

function buildLearningPath(
  analytics: UserAnalyticsOverview,
  subjectPriority: SubjectPriority[],
  topicPriority: TopicPriority[]
): LearningPathItem[] {
  const path: LearningPathItem[] = []
  let order = 1

  // Step 1: Resume in-progress topics first
  const inProgressTopics = topicPriority.filter((t) => t.status === 'IN_PROGRESS').slice(0, 2)
  for (const topic of inProgressTopics) {
    path.push({
      order: order++,
      type: 'subject_study',
      title: `Resume: ${topic.name}`,
      description: `Continue studying ${topic.name} in ${topic.subjectTitle}.`,
      subjectSlug: topic.subjectSlug,
      topicName: topic.name,
      effort: 'low',
      priority: 'high',
      actionText: 'Continue topic',
      actionHref: '/preparation',
    })
  }

  // Step 2: High-priority subjects — take quiz if quiz score is weak
  const highPrioritySubjects = subjectPriority.filter((s) => s.priority === 'high').slice(0, 3)
  for (const sub of highPrioritySubjects) {
    if (sub.progressPct < 30) {
      path.push({
        order: order++,
        type: 'subject_study',
        title: `Study ${sub.full} fundamentals`,
        description: `${sub.progressPct}% complete. Build a stronger foundation before quizzes.`,
        subjectSlug: sub.slug,
        effort: 'high',
        priority: 'high',
        actionText: `Study ${sub.title}`,
        actionHref: '/preparation',
      })
    } else if (sub.progressPct >= 30) {
      path.push({
        order: order++,
        type: 'quiz',
        title: `Take a ${sub.full} quiz`,
        description: sub.quizScorePct !== null
          ? `Your quiz avg is ${sub.quizScorePct}% — aim to hit 70%+.`
          : `Test your ${sub.full} knowledge with a timed quiz.`,
        subjectSlug: sub.slug,
        effort: 'medium',
        priority: 'high',
        actionText: 'Take quiz',
        actionHref: '/quizzes',
      })
    }
  }

  // Step 3: Coding practice if acceptance is low or no submissions
  if (analytics.coding.solvedProblemsCount < 5) {
    const effort: 'low' | 'medium' | 'high' =
      analytics.coding.solvedProblemsCount === 0 ? 'medium' : 'low'
    path.push({
      order: order++,
      type: 'coding',
      title: analytics.coding.acceptanceRatePct < 40 && analytics.coding.totalSubmissions > 0
        ? 'Practice easier coding problems first'
        : 'Solve foundational coding problems',
      description: analytics.coding.acceptanceRatePct < 40 && analytics.coding.totalSubmissions > 0
        ? `Current acceptance rate: ${analytics.coding.acceptanceRatePct}%. Start with Easy-level DSA problems.`
        : `${analytics.coding.solvedProblemsCount} problems solved so far. Aim for 10+ to build confidence.`,
      effort,
      priority: analytics.coding.solvedProblemsCount === 0 ? 'high' : 'medium',
      actionText: 'Open coding engine',
      actionHref: '/coding',
    })
  }

  // Step 4: Interview practice
  if (analytics.interviews.completedInterviews === 0) {
    path.push({
      order: order++,
      type: 'interview',
      title: 'Complete your first AI Interview',
      description: 'Simulate a real placement interview with instant AI evaluation across 4 dimensions.',
      effort: 'high',
      priority: 'high',
      actionText: 'Start interview',
      actionHref: '/interview',
    })
  } else if (analytics.interviews.averageScorePct < 60) {
    path.push({
      order: order++,
      type: 'interview',
      title: 'Attempt another AI Interview to improve',
      description: `Your current avg interview score is ${analytics.interviews.averageScorePct}%. Practice again with a Technical or Behavioral session.`,
      effort: 'high',
      priority: 'medium',
      actionText: 'Practice interview',
      actionHref: '/interview',
    })
  }

  // Step 5: Medium-priority subjects
  const mediumSubjects = subjectPriority.filter((s) => s.priority === 'medium').slice(0, 2)
  for (const sub of mediumSubjects) {
    path.push({
      order: order++,
      type: 'subject_study',
      title: `Improve ${sub.full} coverage`,
      description: `Currently at ${sub.progressPct}%. Complete more topics to raise your readiness.`,
      subjectSlug: sub.slug,
      effort: 'medium',
      priority: 'medium',
      actionText: `Study ${sub.title}`,
      actionHref: '/preparation',
    })
  }

  return path.slice(0, 10)
}

// ─── Adaptive Recommendations ─────────────────────────────────────────────────

function buildAdaptiveRecommendations(
  analytics: UserAnalyticsOverview
): AdaptiveRecommendation[] {
  const recs: AdaptiveRecommendation[] = []
  const { quizzes, coding, interviews, tutor, subjectProgress } = analytics

  // No interview at all
  if (interviews.completedInterviews === 0) {
    recs.push({
      id: 'rec-p9-interview-start',
      category: 'interview',
      title: 'Practice your first AI mock interview',
      description: 'Experience realistic interview questions with instant AI scoring across relevance, correctness, clarity, and depth.',
      evidence: 'No interview sessions completed.',
      actionText: 'Start AI Interview',
      actionHref: '/interview',
      priority: 'high',
    })
  }

  // Low quiz accuracy
  if (quizzes.completedAttempts > 0 && quizzes.accuracyPct < 60) {
    const weakSubj = [...subjectProgress].sort((a, b) => (a.quizScorePct ?? 50) - (b.quizScorePct ?? 50))[0]
    recs.push({
      id: 'rec-p9-quiz-accuracy',
      category: 'quiz',
      title: `Review ${weakSubj?.full ?? 'subject'} fundamentals`,
      description: `Your quiz accuracy is ${quizzes.accuracyPct}%. Revisiting core concepts before retaking quizzes will improve your score.`,
      evidence: `${quizzes.accuracyPct}% quiz accuracy across ${quizzes.completedAttempts} completed attempts.`,
      actionText: 'Study topics',
      actionHref: '/preparation',
      priority: 'high',
    })
  }

  // Low coding acceptance rate (but has submissions)
  if (coding.totalSubmissions > 0 && coding.acceptanceRatePct < 40) {
    recs.push({
      id: 'rec-p9-coding-acceptance',
      category: 'coding',
      title: 'Focus on Easy problems to build acceptance rate',
      description: `With a ${coding.acceptanceRatePct}% acceptance rate, solving easier problems and reviewing solutions will build fluency.`,
      evidence: `${coding.acceptedSubmissions} of ${coding.totalSubmissions} submissions accepted.`,
      actionText: 'Practice easy problems',
      actionHref: '/coding',
      priority: 'high',
    })
  } else if (coding.solvedProblemsCount < 3) {
    recs.push({
      id: 'rec-p9-coding-start',
      category: 'coding',
      title: 'Solve core Data Structure problems',
      description: 'Build foundational coding confidence by solving array, string, and linked list problems.',
      evidence: `${coding.solvedProblemsCount} problems solved so far.`,
      actionText: 'Open coding engine',
      actionHref: '/coding',
      priority: coding.solvedProblemsCount === 0 ? 'high' : 'medium',
    })
  }

  // Weak interview evaluation dimension
  if (interviews.completedInterviews > 0) {
    const mb = interviews.metricsBreakdown
    const lowest = Math.min(mb.relevanceScorePct, mb.correctnessScorePct, mb.clarityScorePct, mb.depthScorePct)
    const lowestDimension =
      lowest === mb.clarityScorePct ? 'Clarity'
      : lowest === mb.depthScorePct ? 'Depth'
      : lowest === mb.correctnessScorePct ? 'Correctness'
      : 'Relevance'

    if (lowest < 60) {
      recs.push({
        id: 'rec-p9-interview-dimension',
        category: 'interview',
        dimension: lowestDimension,
        title: `Improve interview ${lowestDimension.toLowerCase()} in your next session`,
        description: `${lowestDimension} is your lowest-scoring evaluation dimension at ${lowest}%. Structure your answers using the STAR method and add specific technical details.`,
        evidence: `${lowestDimension}: ${lowest}% — lowest across all interview evaluation metrics.`,
        actionText: 'Practice interview',
        actionHref: '/interview',
        priority: 'medium',
      })
    }
  }

  // No quiz attempts at all
  if (quizzes.completedAttempts === 0) {
    recs.push({
      id: 'rec-p9-quiz-start',
      category: 'quiz',
      title: 'Take your first subject quiz',
      description: 'Timed quizzes across core subjects help identify knowledge gaps and guide your preparation.',
      evidence: 'No quiz attempts on record.',
      actionText: 'Take a quiz',
      actionHref: '/quizzes',
      priority: 'medium',
    })
  }

  // Company preparation recommendation
  recs.push({
    id: 'rec-p18-company-prep',
    category: 'general',
    title: 'Create a Company-Wise Preparation Path',
    description: 'Target specific companies like TCS, Infosys, Amazon, or custom target companies with tailored aptitude, DSA, interview, and GD practice stages.',
    evidence: 'Company-wise preparation engine available.',
    actionText: 'Explore Company Prep',
    actionHref: '/company-prep',
    priority: 'medium',
  })

  // No tutor usage
  if (tutor.totalSessions === 0) {
    recs.push({
      id: 'rec-p9-tutor-start',
      category: 'tutor',
      title: 'Use the AI Tutor for concept clarification',
      description: 'Ask the AI Tutor about any topic you find difficult to understand or explain.',
      evidence: 'No AI Tutor sessions started yet.',
      actionText: 'Open AI Tutor',
      actionHref: '/tutor',
      priority: 'low',
    })
  }

  // Advanced: already strong — challenge recommendation
  if (
    interviews.completedInterviews >= 2 &&
    coding.solvedProblemsCount >= 10 &&
    quizzes.accuracyPct >= 70
  ) {
    recs.push({
      id: 'rec-p9-advanced-challenge',
      category: 'general',
      title: 'Challenge yourself with Hard-level practice',
      description: 'You are performing well overall. Attempt Hard-level coding problems and a Mixed interview to maximize your readiness score.',
      evidence: `${coding.solvedProblemsCount} problems solved · ${quizzes.accuracyPct}% quiz accuracy · ${interviews.completedInterviews} interviews done.`,
      actionText: 'Start hard interview',
      actionHref: '/interview',
      priority: 'low',
    })
  }

  // Sort by priority: high → medium → low, then return top 5
  const sortOrder = { high: 0, medium: 1, low: 2 }
  return recs
    .sort((a, b) => sortOrder[a.priority] - sortOrder[b.priority])
    .slice(0, 5)
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function getUserPersonalization(userId: string): Promise<UserPersonalizationProfile> {
  // Reuse Stage 8 analytics — avoids duplicate expensive queries
  const analytics = await getUserAnalytics(userId)

  // Count how many modules have any activity
  const activeModules = [
    analytics.quizzes.totalAttempts > 0,
    analytics.coding.totalSubmissions > 0,
    analytics.interviews.totalSessions > 0,
    analytics.tutor.totalSessions > 0,
  ].filter(Boolean).length

  // ─── Preparation Level ─────────────────────────────────────────────────────
  const preparationLevel = computePreparationLevel(analytics, activeModules)

  // ─── Subject Insights ──────────────────────────────────────────────────────
  const subjectInsights: SubjectInsight[] = analytics.subjectProgress.map((sp) => {
    const { strength, reason } = classifySubjectStrength(sp.value, sp.quizScorePct, sp.codingSolvedCount)
    return {
      subjectId: sp.subjectId,
      slug: sp.slug,
      title: sp.title,
      full: sp.full,
      progressPct: sp.value,
      quizScorePct: sp.quizScorePct,
      codingSolvedCount: sp.codingSolvedCount,
      strength,
      reason,
    }
  })

  const strongestSubjects = subjectInsights
    .filter((s) => s.strength === 'strong')
    .sort((a, b) => b.progressPct - a.progressPct)

  const weakestSubjects = subjectInsights
    .filter((s) => s.strength === 'weak')
    .sort((a, b) => a.progressPct - b.progressPct)

  const insufficientDataAreas: string[] = []
  subjectInsights.filter((s) => s.strength === 'no_data').forEach((s) => {
    insufficientDataAreas.push(`${s.full} (no quiz/topic/coding data)`)
  })
  if (analytics.quizzes.totalAttempts === 0) insufficientDataAreas.push('Quiz performance (no attempts)')
  if (analytics.interviews.totalSessions === 0) insufficientDataAreas.push('Interview performance (no sessions)')

  // ─── Subject Prioritization ────────────────────────────────────────────────
  const subjectPriority: SubjectPriority[] = analytics.subjectProgress
    .map((sp) => {
      const computed = computeSubjectPriority(sp)
      return {
        subjectId: sp.subjectId,
        slug: sp.slug,
        title: sp.title,
        full: sp.full,
        progressPct: sp.value,
        quizScorePct: sp.quizScorePct,
        ...computed,
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)

  // ─── Topic Prioritization ──────────────────────────────────────────────────
  const topicPriority = await computeTopicPriority(userId, subjectPriority)

  // ─── Learning Path ─────────────────────────────────────────────────────────
  const learningPath = buildLearningPath(analytics, subjectPriority, topicPriority)

  // ─── Adaptive Recommendations ──────────────────────────────────────────────
  const adaptiveRecommendations = buildAdaptiveRecommendations(analytics)

  // ─── Momentum ─────────────────────────────────────────────────────────────
  const momentum = await computeMomentum(userId)

  // ─── Coverage ─────────────────────────────────────────────────────────────
  const coverage = await computeCoverage(userId, analytics)

  return {
    preparationLevel,
    readinessScore: analytics.readiness.score,
    strongestSubjects,
    weakestSubjects,
    subjectPriority,
    topicPriority,
    learningPath,
    adaptiveRecommendations,
    momentum,
    coverage,
    insufficientDataAreas,
  }
}
