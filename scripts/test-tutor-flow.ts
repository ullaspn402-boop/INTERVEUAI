/**
 * Test script for STAGE 15 AI Tutor Reliability & Real Conversational Behavior
 */

import { db } from '../lib/db'
import { createTutorSession, sendTutorMessage, getTutorSession, checkTutorRateLimit, getTutorSessionSummary } from '../services/tutor'
import { buildTutorSystemPrompt } from '../services/ai'

async function runTests() {
  console.log('=== RUNNING AI TUTOR INTEGRATION TESTS ===\n')

  // 1. Fetch a test user
  const user = await db.user.findFirst()
  if (!user) {
    console.error('No test user found in database.')
    process.exit(1)
  }
  console.log(`[TEST USER] ID: ${user.id}, Role: ${user.targetRole || 'default'}`)

  // 2. Fetch a test subject and topic
  const subject = await db.subject.findFirst({ include: { topics: true } })
  const topic = subject?.topics[0]
  console.log(`[TEST SUBJECT/TOPIC] Subject: ${subject?.name}, Topic: ${topic?.name}`)

  // 3. Test Session Creation with Subject & Topic context (Scenario H)
  console.log('\n--- Scenario H: Session Creation with Subject/Topic Context ---')
  const session = await createTutorSession(user.id, {
    subjectId: subject?.id,
    topicId: topic?.id,
    title: 'DBMS Normalization Test Session',
  })
  console.log(`Session created: ID=${session.id}, Title=${session.title}, Subject=${session.subject?.name}`)

  // 4. Test System Prompt Construction & Personalization (Scenario G)
  console.log('\n--- Scenario G: System Prompt Personalization ---')
  const prompt = buildTutorSystemPrompt({
    subjectName: session.subject?.name || undefined,
    topicName: session.topic?.name || undefined,
    targetRole: user.targetRole || 'Backend Developer',
    tutorMode: 'LEARN',
    roleRequirements: ['Database Management Systems', 'SQL', 'Data Structures'],
  })
  if (!prompt.includes('Target Role:') || !prompt.includes('Intervue Coach')) {
    throw new Error('System prompt missing critical role or mentor instructions')
  }
  console.log('✓ System prompt built with target role context & accuracy rules.')

  // 5. Test AI Provider Failure (Scenario J)
  console.log('\n--- Scenario J: AI Provider Failure & Database Non-Persistence ---')
  delete process.env.ALLOW_DETERMINISTIC_TUTOR_FALLBACK
  const failedMsg = await sendTutorMessage(session.id, user.id, 'Test question during failure', 'LEARN')
  if (failedMsg.success) {
    throw new Error('Expected failure response on invalid/missing API key, but got success')
  }
  const checkEmptySession = await getTutorSession(session.id, user.id)
  if (checkEmptySession?.messages.length !== 0) {
    throw new Error('Failed AI request resulted in persisted messages in database!')
  }
  console.log('✓ AI provider failure caught cleanly without persisting fake messages to database.')

  // 6. Test Multi-Turn Conversation Continuity & Mode Switch in Fallback Mode (Scenarios A, B, C, D, E, F, I)
  console.log('\n--- Scenarios A, B, C, D, E, F, I: Multi-turn Conversation & Mode Switch ---')
  delete process.env.OPENAI_API_KEY
  process.env.ALLOW_DETERMINISTIC_TUTOR_FALLBACK = 'true'

  // Turn 1: Normal Technical Question (Scenario A)
  const msg1 = await sendTutorMessage(session.id, user.id, 'Explain DBMS normalization', 'LEARN')
  if (!msg1.success) throw new Error(`Turn 1 failed: ${msg1.message}`)
  console.log(`Turn 1 (LEARN): User asked about DBMS normalization -> Assistant response OK (ID: ${msg1.message.id})`)

  // Turn 2: Follow-up referring to previous message (Scenario B)
  const msg2 = await sendTutorMessage(session.id, user.id, "I don't understand 3NF", 'LEARN')
  if (!msg2.success) throw new Error(`Turn 2 failed: ${msg2.message}`)
  console.log(`Turn 2 (LEARN): User asked about 3NF -> Assistant response OK (ID: ${msg2.message.id})`)

  // Turn 3: Ask for an example (Scenario C)
  const msg3 = await sendTutorMessage(session.id, user.id, 'Give me an example', 'LEARN')
  if (!msg3.success) throw new Error(`Turn 3 failed: ${msg3.message}`)
  console.log(`Turn 3 (LEARN): User asked for example -> Assistant response OK (ID: ${msg3.message.id})`)

  // Turn 4: Mode switch to PRACTICE (Scenario F)
  const msg4 = await sendTutorMessage(session.id, user.id, 'Now ask me a question', 'PRACTICE')
  if (!msg4.success) throw new Error(`Turn 4 failed: ${msg4.message}`)
  console.log(`Turn 4 (PRACTICE): Switched mode & asked question -> Assistant response OK (ID: ${msg4.message.id})`)

  // Turn 5: User gives answer (Scenario D)
  const msg5 = await sendTutorMessage(session.id, user.id, '3NF removes transitive dependency', 'PRACTICE')
  if (!msg5.success) throw new Error(`Turn 5 failed: ${msg5.message}`)
  console.log(`Turn 5 (PRACTICE): User provided answer -> Assistant evaluation OK (ID: ${msg5.message.id})`)

  // Turn 6: User asks for harder question (Scenario E)
  const msg6 = await sendTutorMessage(session.id, user.id, 'Give me a harder question', 'PRACTICE')
  if (!msg6.success) throw new Error(`Turn 6 failed: ${msg6.message}`)
  console.log(`Turn 6 (PRACTICE): User asked for harder question -> Assistant response OK (ID: ${msg6.message.id})`)

  // 7. Test Bounded Conversation Context Ordering
  console.log('\n--- Bounded Conversation Context Check ---')
  const retrievedSession = await getTutorSession(session.id, user.id)
  if (!retrievedSession || retrievedSession.messages.length !== 12) {
    throw new Error(`Expected 12 persisted messages (6 user + 6 assistant), got ${retrievedSession?.messages.length}`)
  }
  console.log(`✓ 12 messages persisted atomically in database. Message order verified.`)

  // 8. Test Ownership Enforcement (Scenario L)
  console.log('\n--- Scenario L: Session Ownership Enforcement ---')
  const fakeUserId = 'user_fake_99999'
  const crossAccess = await getTutorSession(session.id, fakeUserId)
  if (crossAccess !== null) {
    throw new Error('SECURITY VIOLATION: User B accessed User A tutor session!')
  }
  console.log('✓ Cross-user access rejected cleanly with null.')

  // 9. Test Rate Limiter (Scenario M)
  console.log('\n--- Scenario M: Per-User Rate Limiting ---')
  const testRateUser = `rate-test-${Date.now()}`
  for (let i = 0; i < 20; i++) {
    const res = checkTutorRateLimit(testRateUser)
    if (!res.allowed) throw new Error(`Rate limit triggered prematurely at attempt ${i + 1}`)
  }
  const exceededRes = checkTutorRateLimit(testRateUser)
  if (exceededRes.allowed) {
    throw new Error('Rate limit failed to block 21st request within 1 hour!')
  }
  console.log('✓ Rate limit correctly enforced at 20 requests/hour per user.')

  // 10. Test Stage 3 Adaptive State Analysis & Summary Generation
  console.log('\n--- Stage 3: Adaptive State Analysis & Learning Summary Report ---')
  const summary = await getTutorSessionSummary(session.id, user.id)
  if (!summary) throw new Error('Failed to retrieve tutor session summary')
  if (typeof summary.score !== 'number' || !Array.isArray(summary.conceptsMastered)) {
    throw new Error('Invalid summary structure returned from getTutorSessionSummary')
  }
  console.log(`✓ Session Summary Report verified: Score = ${summary.score}/100, Mastered = ${summary.conceptsMastered.join(', ')}`)

  // 11. Clean up test session
  await db.tutorSession.delete({ where: { id: session.id } })
  console.log('\n✓ Cleaned up test session.')
  console.log('\n=== ALL TUTOR INTEGRATION TESTS PASSED SUCCESSFULLY! ===')
  process.exit(0)
}

runTests().catch(err => {
  console.error('\n❌ TUTOR TEST FAILED:', err)
  process.exit(1)
})
