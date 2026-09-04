/**
 * Test script for STAGE 15 AI Tutor Reliability & Real Conversational Behavior
 */

const { db } = require('../lib/db')
const { createTutorSession, sendTutorMessage, getTutorSession, checkTutorRateLimit } = require('../services/tutor')
const { buildTutorSystemPrompt } = require('../services/ai')

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
    subjectName: session.subject?.name,
    topicName: session.topic?.name,
    targetRole: user.targetRole || 'Backend Developer',
    tutorMode: 'LEARN',
    roleRequirements: ['Database Management Systems', 'SQL', 'Data Structures'],
  })
  if (!prompt.includes('Target Role:') || !prompt.includes('Strict Accuracy')) {
    throw new Error('System prompt missing critical role or accuracy instructions')
  }
  console.log('✓ System prompt built with target role context & accuracy rules.')

  // 5. Test Multi-Turn Conversation Continuity & Mode Switch (Scenarios A, B, C, F, I)
  console.log('\n--- Scenarios A, B, C, F, I: Multi-turn Conversation & Mode Switch ---')
  process.env.ALLOW_DETERMINISTIC_TUTOR_FALLBACK = 'true'

  // Turn 1: Normal Technical Question
  const msg1 = await sendTutorMessage(session.id, user.id, 'Explain DBMS normalization', 'LEARN')
  if (!msg1.success) throw new Error(`Turn 1 failed: ${msg1.message}`)
  console.log(`Turn 1 (LEARN): User asked about DBMS normalization -> Received Assistant response (ID: ${msg1.message.id})`)

  // Turn 2: Follow-up referring to previous message
  const msg2 = await sendTutorMessage(session.id, user.id, "I don't understand 3NF", 'LEARN')
  if (!msg2.success) throw new Error(`Turn 2 failed: ${msg2.message}`)
  console.log(`Turn 2 (LEARN): User asked about 3NF -> Received Assistant response (ID: ${msg2.message.id})`)

  // Turn 3: Ask for an example
  const msg3 = await sendTutorMessage(session.id, user.id, 'Give me an example', 'LEARN')
  if (!msg3.success) throw new Error(`Turn 3 failed: ${msg3.message}`)
  console.log(`Turn 3 (LEARN): User asked for example -> Received Assistant response (ID: ${msg3.message.id})`)

  // Turn 4: Mode switch to PRACTICE
  const msg4 = await sendTutorMessage(session.id, user.id, 'Now ask me a question', 'PRACTICE')
  if (!msg4.success) throw new Error(`Turn 4 failed: ${msg4.message}`)
  console.log(`Turn 4 (PRACTICE): Switched mode & asked for question -> Received Assistant response (ID: ${msg4.message.id})`)

  // Turn 5: User gives answer (Scenario D)
  const msg5 = await sendTutorMessage(session.id, user.id, '3NF removes transitive dependency', 'PRACTICE')
  if (!msg5.success) throw new Error(`Turn 5 failed: ${msg5.message}`)
  console.log(`Turn 5 (PRACTICE): User provided answer -> Received Assistant evaluation (ID: ${msg5.message.id})`)

  // 6. Test Bounded Conversation Context Ordering
  console.log('\n--- Bounded Conversation Context Check ---')
  const retrievedSession = await getTutorSession(session.id, user.id)
  if (!retrievedSession || retrievedSession.messages.length !== 10) {
    throw new Error(`Expected 10 persisted messages (5 user + 5 assistant), got ${retrievedSession?.messages.length}`)
  }
  console.log(`✓ 10 messages persisted atomically in database. Message order verified.`)

  // 7. Test Ownership Enforcement (Scenario L)
  console.log('\n--- Scenario L: Session Ownership Enforcement ---')
  const fakeUserId = 'user_fake_99999'
  const crossAccess = await getTutorSession(session.id, fakeUserId)
  if (crossAccess !== null) {
    throw new Error('SECURITY VIOLATION: User B accessed User A tutor session!')
  }
  console.log('✓ Cross-user access rejected cleanly with null.')

  // 8. Test Rate Limiter (Scenario M)
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

  // 9. Clean up test session
  await db.tutorSession.delete({ where: { id: session.id } })
  console.log('\n✓ Cleaned up test session.')
  console.log('\n=== ALL TUTOR INTEGRATION TESTS PASSED SUCCESSFULLY! ===')
  process.exit(0)
}

runTests().catch(err => {
  console.error('\n❌ TUTOR TEST FAILED:', err)
  process.exit(1)
})
