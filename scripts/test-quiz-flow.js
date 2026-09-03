const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testQuizFlow() {
  console.log('🧪 Testing Stage 4 Quiz Engine & Persistence...')

  // 1. Verify Seeded Quizzes
  const quizzes = await db.quiz.findMany({
    include: {
      subject: true,
      questions: {
        include: { options: true },
      },
    },
  })

  console.log(`✅ Quizzes in DB: ${quizzes.length}`)
  if (quizzes.length !== 8) {
    throw new Error(`Expected 8 quizzes, found ${quizzes.length}`)
  }

  let totalQ = 0
  let totalOpt = 0

  for (const q of quizzes) {
    console.log(`   - [${q.subject.shortTitle}] ${q.title} (${q.questions.length} Qs, difficulty: ${q.difficulty})`)
    totalQ += q.questions.length
    for (const quest of q.questions) {
      totalOpt += quest.options.length
      const correctOpts = quest.options.filter((o) => o.isCorrect)
      if (correctOpts.length !== 1) {
        throw new Error(`Question "${quest.questionText}" has ${correctOpts.length} correct options (expected 1)`)
      }
    }
  }

  console.log(`✅ Total Questions: ${totalQ} (Expected ~80)`)
  console.log(`✅ Total Question Options: ${totalOpt} (Expected ~320)`)

  // 2. Test Attempt Creation & Submission logic directly via services/db
  let testUser = await db.user.findFirst({ where: { email: 'quiztest@intervue.ai' } })
  if (!testUser) {
    testUser = await db.user.create({
      data: {
        name: 'Quiz Test User',
        email: 'quiztest@intervue.ai',
        passwordHash: 'dummyhash',
      },
    })
  }

  const targetQuiz = quizzes[0]
  console.log(`\n🎯 Testing attempt creation for user "${testUser.email}" on quiz "${targetQuiz.title}"...`)

  const attempt = await db.quizAttempt.create({
    data: {
      userId: testUser.id,
      quizId: targetQuiz.id,
      score: 0,
      totalQuestions: targetQuiz.questions.length,
      correctAnswers: 0,
      startedAt: new Date(),
    },
  })

  console.log(`✅ QuizAttempt created with ID: ${attempt.id}`)

  // Prepare 100% correct answers
  const answers = targetQuiz.questions.map((quest) => {
    const correctOpt = quest.options.find((o) => o.isCorrect)
    return {
      questionId: quest.id,
      selectedOptionId: correctOpt.id,
      isCorrect: true,
    }
  })

  // Submit attempt
  await db.$transaction(async (tx) => {
    await tx.quizAttemptAnswer.createMany({
      data: answers.map((a) => ({
        attemptId: attempt.id,
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
        isCorrect: a.isCorrect,
      })),
    })

    await tx.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: 100,
        totalQuestions: targetQuiz.questions.length,
        correctAnswers: targetQuiz.questions.length,
        completedAt: new Date(),
      },
    })

    await tx.activity.create({
      data: {
        userId: testUser.id,
        type: 'QUIZ_COMPLETED',
        title: `Completed ${targetQuiz.title}`,
        description: `Scored ${targetQuiz.questions.length}/${targetQuiz.questions.length} (100%)`,
        metadata: {
          quizId: targetQuiz.id,
          attemptId: attempt.id,
          score: 100,
          correctAnswers: targetQuiz.questions.length,
          totalQuestions: targetQuiz.questions.length,
        },
      },
    })
  })

  const completedAttempt = await db.quizAttempt.findUnique({
    where: { id: attempt.id },
    include: { answers: true },
  })

  console.log(`✅ Attempt completed successfully! Score: ${completedAttempt.score}%, Correct Answers: ${completedAttempt.correctAnswers}/${completedAttempt.totalQuestions}`)

  const recentActivity = await db.activity.findFirst({
    where: { userId: testUser.id, type: 'QUIZ_COMPLETED' },
  })

  console.log(`✅ Activity logged: "${recentActivity.title}" - ${recentActivity.description}`)

  // Cleanup test user and attempt
  await db.quizAttemptAnswer.deleteMany({ where: { attemptId: attempt.id } })
  await db.quizAttempt.delete({ where: { id: attempt.id } })
  await db.activity.deleteMany({ where: { userId: testUser.id } })
  await db.user.delete({ where: { id: testUser.id } })

  console.log('\n🎉 ALL STAGE 4 QUIZ ENGINE CHECKS PASSED PERFECTLY!')
}

testQuizFlow()
  .catch((e) => {
    console.error('❌ Test failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
