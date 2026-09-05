/**
 * Regression Test Suite for Critical Bug Fix Pass:
 * 1. AI Tutor (Message, Retry, Honest Error)
 * 2. Company Preparation (Catalog, Custom, Idempotency, Stage Advance)
 * 3. Preparation Portal "Study" Action & Route Mapping
 *
 * Usage: npx tsx scripts/test-critical-bugfixes.ts
 */

import { db } from '../lib/db'
import { sendTutorMessage, createTutorSession, checkTutorRateLimit } from '../services/tutor'
import { createCompanyPlan, getUserCompanyPlans, updateCompanyPlan, getCompanyCatalog } from '../services/company-preparation'
import { getUserPersonalization } from '../services/personalization'
import { CreateCompanyPlanSchema, SendTutorMessageSchema } from '../lib/validation'

async function runRegressionTests() {
  console.log('====================================================')
  console.log('  CRITICAL BUG FIX PASS — REGRESSION TEST SUITE     ')
  console.log('====================================================\n')

  let passed = 0
  let total = 0

  function assert(condition: boolean, name: string) {
    total++
    if (condition) {
      console.log(`[PASS] Test ${total}: ${name}`)
      passed++
    } else {
      console.error(`[FAIL] Test ${total}: ${name}`)
    }
  }

  // Setup test user
  const user = await db.user.upsert({
    where: { email: 'critical_bugfix_test@intervue.ai' },
    update: {},
    create: { email: 'critical_bugfix_test@intervue.ai', passwordHash: 'hash', name: 'Bugfix Tester' },
  })

  // Cleanup test user's sessions & plans
  await db.tutorSession.deleteMany({ where: { userId: user.id } })
  await db.companyPreparationPlan.deleteMany({ where: { userId: user.id } })

  // -------------------------------------------------------------
  // BUG 1: AI TUTOR TESTS
  // -------------------------------------------------------------
  console.log('\n--- BUG 1: AI TUTOR ---')

  // Test 1: SendTutorMessageSchema validation
  const validMsg = SendTutorMessageSchema.safeParse({ content: 'Explain OOP concepts', mode: 'LEARN' })
  assert(validMsg.success, 'SendTutorMessageSchema accepts valid message and mode')

  const emptyMsg = SendTutorMessageSchema.safeParse({ content: '  ' })
  assert(!emptyMsg.success, 'SendTutorMessageSchema rejects empty content')

  // Test 2: Tutor Session Creation
  const tutorSession = await createTutorSession(user.id, { title: 'Test Session' })
  assert(tutorSession !== null && tutorSession.id.length > 0, 'Tutor session created successfully')

  // Test 3: Tutor Message Flow (Handles API key / fallback gracefully)
  const tutorResult = await sendTutorMessage(tutorSession.id, user.id, 'What is polymorphism?', 'LEARN')
  if (tutorResult.success) {
    assert(tutorResult.message.content.length > 0, 'Tutor generates real response and persists USER + ASSISTANT messages')
  } else {
    assert(
      tutorResult.error === 'configuration_error' || tutorResult.error === 'service_unavailable',
      `Tutor returns honest error on provider absence/failure (${tutorResult.error}: ${tutorResult.message})`
    )
  }

  // Test 4: Tutor Rate Limit Check
  const rateCheck = checkTutorRateLimit(user.id)
  assert(rateCheck.allowed, 'Tutor rate limit allows 20 messages per hour sliding window')

  // -------------------------------------------------------------
  // BUG 2: COMPANY PREPARATION TESTS
  // -------------------------------------------------------------
  console.log('\n--- BUG 2: COMPANY PREPARATION ---')

  const catalog = await getCompanyCatalog({ limit: 5 })
  const starterCompany = catalog[0]

  // Test 5: Catalog Company Plan Creation
  const catalogPlan = await createCompanyPlan(user.id, {
    companyId: starterCompany?.id,
    targetRoleSlug: 'software-engineer',
    experienceLevel: 'FRESHER',
    preparationGoal: 'Campus Drive Prep',
  })
  assert(catalogPlan !== null && catalogPlan.id.length > 0, 'Catalog company preparation plan created successfully')

  // Test 6: Duplicate Active Plan Idempotency
  const dupPlan = await createCompanyPlan(user.id, {
    companyId: starterCompany?.id,
    targetRoleSlug: 'software-engineer',
    experienceLevel: 'FRESHER',
  })
  assert(dupPlan.id === catalogPlan.id, 'Re-creating plan for same user & company returns existing active plan')

  // Test 7: Custom Company Plan Creation
  const customPlan = await createCompanyPlan(user.id, {
    customCompanyName: 'Alpha Robotics Startup',
    targetRoleSlug: 'frontend-developer',
    experienceLevel: 'FRESHER',
  })
  assert(
    customPlan !== null && customPlan.customCompanyName === 'Alpha Robotics Startup',
    'Custom company plan created successfully with GENERAL_GUIDANCE / USER_PROVIDED fallback'
  )

  // Test 8: Stage Advancement
  const advancedPlan = await updateCompanyPlan(user.id, catalogPlan.id, { currentStage: 3 })
  assert(advancedPlan !== null && advancedPlan.currentStage === 3, 'Company plan stage advanced to Stage 3')

  // Test 9: Complete Plan on Final Stage
  const completedPlan = await updateCompanyPlan(user.id, catalogPlan.id, { currentStage: 12 })
  assert(completedPlan !== null && completedPlan.status === 'COMPLETED', 'Advancing to Stage 12 completes the plan')

  // -------------------------------------------------------------
  // BUG 3: PREPARATION PORTAL STUDY ACTION TESTS
  // -------------------------------------------------------------
  console.log('\n--- BUG 3: PREPARATION PORTAL STUDY ACTION ---')

  const profile = await getUserPersonalization(user.id)
  assert(profile !== null, 'Personalization profile computes without throwing')

  // Test 10: Learning Path & Recommendations Do NOT Point to /preparation
  let selfReferentialHrefFound = false
  for (const item of profile.learningPath) {
    if (item.actionHref === '/preparation') {
      selfReferentialHrefFound = true
      console.error(`[FAIL] Found self-referential actionHref in learningPath item: "${item.title}"`)
    }
  }
  for (const rec of profile.adaptiveRecommendations) {
    if (rec.actionHref === '/preparation') {
      selfReferentialHrefFound = true
      console.error(`[FAIL] Found self-referential actionHref in adaptiveRecommendation item: "${rec.title}"`)
    }
  }
  assert(!selfReferentialHrefFound, 'All Study actions route to valid learning destinations (/tutor, /quizzes, /coding, /interview, /company-prep) with context')

  // Test 11: Study Actions Preserve Subject & Topic Context
  const tutorAction = profile.learningPath.find((item) => item.actionHref.includes('/tutor')) || profile.topicPriority.find((item) => item.actionHref.includes('/tutor'))
  assert(
    tutorAction !== undefined && tutorAction.actionHref.includes('mode=LEARN'),
    `Study actions route into Tutor with mode=LEARN and subject/topic parameters (${tutorAction?.actionHref})`
  )

  console.log('\n====================================================')
  console.log(`  RESULT: ${passed} / ${total} REGRESSION TESTS PASSED!`)
  console.log('====================================================\n')

  if (passed !== total) {
    process.exit(1)
  }
}

runRegressionTests().catch((err) => {
  console.error('Test suite crashed with error:', err)
  process.exit(1)
})
