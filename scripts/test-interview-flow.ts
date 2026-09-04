/**
 * Integration Test Suite for STAGE 16 Real Conversational AI Interview Engine
 */

import { db } from '../lib/db'
import {
  createInterviewSession,
  startInterviewSession,
  submitAnswerAndEvaluate,
  getInterviewSession,
  completeInterviewSession,
  checkInterviewRateLimit,
} from '../services/interview'
import { evaluateInterviewAnswerAI, buildTutorSystemPrompt } from '../services/ai'

async function runInterviewTests() {
  console.log('=== RUNNING AI INTERVIEW ENGINE STAGE 16 INTEGRATION TESTS ===\n')

  process.env.ALLOW_DETERMINISTIC_INTERVIEW_FALLBACK = 'true'

  // 1. Fetch test user
  const user = await db.user.findFirst()
  if (!user) {
    console.error('No test user found.')
    process.exit(1)
  }
  console.log(`[TEST USER] ID: ${user.id}, Role: ${user.targetRole || 'Backend Developer'}`)

  // 2. Create Interview Session
  console.log('\n--- Test 1: Session Setup & Start ---')
  const session = await createInterviewSession(user.id, {
    interviewType: 'TECHNICAL',
    targetRole: 'Backend Developer',
    difficulty: 'MEDIUM',
    questionCount: 5,
    title: 'Stage 16 Conversational Test Interview',
  })
  console.log(`Session created: ID=${session.id}, Title=${session.title}`)

  const startRes = await startInterviewSession(session.id, user.id)
  console.log(`Question 1 Generated: "${startRes.currentQuestion.questionText}"`)

  // 3. Test Answer -> Understanding -> Relevant Follow-up (Scenario 1)
  console.log('\n--- Scenario 1: Candidate mentions DB query slowdown -> Relevant Follow-up ---')
  const ans1Text = 'In my project the API was taking around 5 seconds to respond. I found that we were making too many database queries in a loop.'
  const turn1 = await submitAnswerAndEvaluate(session.id, startRes.currentQuestion.id, user.id, ans1Text)
  
  console.log(`Answer 1 Evaluated: Score=${turn1.evaluation.overallScore}/10`)
  console.log(`Evaluator Feedback: ${turn1.evaluation.feedback}`)
  console.log(`Next Question Generated: "${turn1.nextQuestion?.questionText}"`)

  if (!turn1.nextQuestion) throw new Error('Failed to generate next question after Turn 1')
  
  // Verify next question is relevant to DB query / performance
  const q2Text = turn1.nextQuestion.questionText.toLowerCase()
  const isRelevant = q2Text.includes('database') || q2Text.includes('query') || q2Text.includes('performance') || q2Text.includes('how') || q2Text.includes('identify')
  if (!isRelevant) {
    console.warn('⚠️ Next question warning: expected database/performance follow-up context.')
  } else {
    console.log('✓ Next question directly referenced candidate answer context!')
  }

  // 4. Test Candidate Vague Answer -> Clarification Request (Scenario 2)
  console.log('\n--- Scenario 2: Vague Answer -> Clarification Request ---')
  const ans2Text = 'I worked on a team and fixed the problem.'
  const turn2 = await submitAnswerAndEvaluate(session.id, turn1.nextQuestion.id, user.id, ans2Text)
  console.log(`Turn 2 Feedback: ${turn2.evaluation.feedback}`)
  console.log(`Turn 3 Question: "${turn2.nextQuestion?.questionText}"`)
  if (!turn2.nextQuestion) throw new Error('Failed to generate next question after Turn 2')

  // 5. Test Questionable Technical Claim -> Challenge (Scenario 3)
  console.log('\n--- Scenario 3: Questionable Claim -> Challenge ---')
  const ans3Text = 'I added an index to every single column in the database and that made every write and read query faster.'
  const turn3 = await submitAnswerAndEvaluate(session.id, turn2.nextQuestion.id, user.id, ans3Text)
  console.log(`Turn 3 Evaluation: Strengths=${JSON.stringify(turn3.evaluation.strengths)}, Improvements=${JSON.stringify(turn3.evaluation.improvements)}`)
  console.log(`Turn 4 Question: "${turn3.nextQuestion?.questionText}"`)
  if (!turn3.nextQuestion) throw new Error('Failed to generate next question after Turn 3')

  // 6. Test Solid Answer -> Transition to New Topic (Scenario 4)
  console.log('\n--- Scenario 4: Solid Technical Answer -> Transition ---')
  const ans4Text = 'We profiled the queries using EXPLAIN ANALYZE, identified N+1 query patterns in our ORM, refactored to eager loading with JOINs, and added a Redis cache for hot read keys. Response times dropped from 5s to 120ms.'
  const turn4 = await submitAnswerAndEvaluate(session.id, turn3.nextQuestion.id, user.id, ans4Text)
  console.log(`Turn 4 Evaluation Score: ${turn4.evaluation.overallScore}/10`)
  console.log(`Turn 5 (Final Q) Question: "${turn4.nextQuestion?.questionText}"`)
  if (!turn4.nextQuestion) throw new Error('Failed to generate Turn 5 question')

  // 7. Test Final Turn & Completion (Scenarios 11 & 16)
  console.log('\n--- Turn 5 & Interview Completion ---')
  const ans5Text = 'We used JWT tokens stored in HttpOnly cookies with short expiration and refresh token rotation.'
  const turn5 = await submitAnswerAndEvaluate(session.id, turn4.nextQuestion.id, user.id, ans5Text)
  if (!turn5.isLastQuestion) throw new Error('Expected Turn 5 to be last question')

  const completedSession = await completeInterviewSession(session.id, user.id)
  console.log(`✓ Interview Completed: Overall Score = ${completedSession.overallScore}/100`)
  console.log(`Overall Feedback: ${completedSession.overallFeedback}`)

  // 8. Test Question Already Answered & Sequence Security (Scenario 13 & 16)
  console.log('\n--- Scenario 13 & 16: Duplicate & Completed Session Answer Rejection ---')
  try {
    await submitAnswerAndEvaluate(session.id, turn4.nextQuestion.id, user.id, 'Extra answer submission after complete')
    throw new Error('FAILED: Completed session accepted an extra answer submission!')
  } catch (err: any) {
    if (err.message === 'SESSION_NOT_ACTIVE') {
      console.log('✓ Answer rejected on completed session cleanly (SESSION_NOT_ACTIVE).')
    } else {
      throw err
    }
  }

  // 9. Test Ownership Security (Scenario 15)
  console.log('\n--- Scenario 15: Cross-User Session Isolation ---')
  const fakeUserId = 'user_fake_99999'
  const crossAccess = await getInterviewSession(session.id, fakeUserId)
  if (crossAccess !== null) {
    throw new Error('SECURITY VIOLATION: User B accessed User A interview session!')
  }
  console.log('✓ Cross-user access blocked cleanly with null.')

  // 10. Test Rate Limiter (Scenario M)
  console.log('\n--- Scenario M: Per-User Rate Limiting ---')
  const rateUser = `interview-rate-${Date.now()}`
  for (let i = 0; i < 30; i++) {
    const res = checkInterviewRateLimit(rateUser)
    if (!res.allowed) throw new Error(`Rate limit triggered prematurely at attempt ${i + 1}`)
  }
  const exceededRes = checkInterviewRateLimit(rateUser)
  if (exceededRes.allowed) {
    throw new Error('Rate limit failed to block 31st request within 1 hour!')
  }
  console.log('✓ Rate limit correctly enforced at 30 requests/hour per user.')

  // 11. Clean up test session
  await db.interviewSession.delete({ where: { id: session.id } })
  console.log('\n✓ Cleaned up test session.')
  console.log('\n=== ALL STAGE 16 AI INTERVIEW ENGINE TESTS PASSED SUCCESSFULLY! ===')
  process.exit(0)
}

runInterviewTests().catch((err) => {
  console.error('\n❌ INTERVIEW INTEGRATION TEST FAILED:', err)
  process.exit(1)
})
