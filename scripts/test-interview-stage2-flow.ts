import { generateInterviewSummaryAI } from '../services/ai'
import { getInterviewResult } from '../services/interview'

async function testStage2InterviewFlow() {
  console.log('--- STAGE 2 AI INTERVIEW VERIFICATION ---')

  // 1. Test generateInterviewSummaryAI fallback and output structure
  console.log('\n[1] Testing generateInterviewSummaryAI() fallback structure...')
  const summaryRes = await generateInterviewSummaryAI({
    interviewType: 'TECHNICAL',
    targetRole: 'Senior Frontend Engineer',
    overallScore: 8.4,
    evaluations: [
      {
        questionText: 'Explain the Virtual DOM and reconciliation process in React.',
        answerText: 'Virtual DOM is a lightweight JS representation of the real DOM. React uses diffing algorithm to update minimal real DOM elements.',
        overallScore: 9,
        feedback: 'Excellent breakdown of Virtual DOM diffing.',
      },
      {
        questionText: 'How do you optimize Next.js app performance?',
        answerText: 'Use dynamic imports, image optimization, and server components.',
        overallScore: 8,
        feedback: 'Good overview of Core Web Vitals and SSR techniques.',
      },
    ],
  })

  if (!summaryRes.success) {
    console.error('❌ Summary generation failed:', summaryRes.message)
    process.exit(1)
  }

  const s = summaryRes.summary
  console.log('✅ Summary Data Generated Successfully:')
  console.log('   - Assessment:', s.interviewerAssessment)
  console.log('   - Strongest Index:', s.strongestAnswerIndex)
  console.log('   - Weakest Index:', s.weakestAnswerIndex)
  console.log('   - Feedback:', s.feedback.substring(0, 100) + '...')
  console.log('   - Comm Notes:', s.communicationNotes)

  if (!s.interviewerAssessment || !s.strongestAnswerIndex || !s.communicationNotes) {
    console.error('❌ Missing expected Stage 2 summary fields!')
    process.exit(1)
  }

  console.log('\n✅ All Stage 2 AI Interview summary assertions passed cleanly!')
}

testStage2InterviewFlow().catch((err) => {
  console.error('❌ Verification script crashed:', err)
  process.exit(1)
})
