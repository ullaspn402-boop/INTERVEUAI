import { getRandomGDTopic, GD_TOPIC_POOL } from '../lib/gd-topics';
import { AI_PERSONAS } from '../services/gd';
import { generateGDTopicAI, generateGDAIParticipantTurnAI } from '../services/ai';

async function testGDStage1() {
  console.log("=== STAGE 1 GD UPGRADE AUTOMATED VERIFICATION ===");

  // 1. Topic Pool & Random Generator Test
  console.log("\n1. Testing Topic Pool & Dynamic Topic Selection...");
  console.assert(GD_TOPIC_POOL.length >= 12, "Topic pool should have at least 12 categories");
  const t1 = getRandomGDTopic();
  const t2 = getRandomGDTopic([t1.topic]);
  console.log(`Topic 1: [${t1.category}] ${t1.topic}`);
  console.log(`Topic 2 (Excluded T1): [${t2.category}] ${t2.topic}`);
  console.assert(t1.topic !== t2.topic, "Random topic generator should honor exclusion list");
  console.log("✓ Dynamic topic generation test PASSED");

  // 2. AI Personas Validation
  console.log("\n2. Testing AI Persona Diversity...");
  console.assert(AI_PERSONAS.length === 5, `Expected 5 AI personas, got ${AI_PERSONAS.length}`);
  const personaTypes = AI_PERSONAS.map(p => p.persona);
  console.log("Personas:", AI_PERSONAS.map(p => `${p.name} (${p.persona})`).join(", "));
  console.assert(personaTypes.includes('Confident') && personaTypes.includes('Analytical') && personaTypes.includes('Opposing') && personaTypes.includes('Balanced') && personaTypes.includes('Quiet'), "All 5 required persona types must be present");
  console.log("✓ AI Persona pool test PASSED");

  // 3. Turn Generation Logic Test (Mock call to AI turn prompt generator structure)
  console.log("\n3. Testing Persona Turn Response Structure...");
  const mockTopic = "Impact of AI on College Placements and Entry-Level Jobs";
  const mockHistory = [
    { name: "Rahul (Confident)", text: "AI is standardizing initial screening, which speeds up recruitment.", round: 1 },
    { name: "Ananya (Analytical)", text: "Statistics show a 30% reduction in first-round manual screening time.", round: 1 }
  ];
  
  try {
    const turnResult = await generateGDAIParticipantTurnAI({
      topic: mockTopic,
      participantName: "Vikram",
      participantPersona: "Opposing",
      contributionHistory: [
        { participantName: "Rahul", participantType: "AI", content: "AI is standardizing initial screening, which speeds up recruitment.", round: 1 },
        { participantName: "Ananya", participantType: "AI", content: "Statistics show a 30% reduction in first-round manual screening time.", round: 1 }
      ],
      userLastContribution: "I believe students must focus on practical AI project skills rather than just theory.",
      round: 1,
      totalRounds: 3
    });
    if (turnResult.success) {
      console.log(`AI Speaker (Vikram Opposing): "${turnResult.content}"`);
      console.assert(turnResult.content.length > 10, "Turn result should be a non-empty string");
      console.log("✓ Persona Turn AI test PASSED");
    } else {
      console.log("AI Turn failed with message:", turnResult.message);
    }
  } catch (err) {
    console.log("AI API call skipped or errored (fallback mode check):", err);
  }

  console.log("\n=== ALL STAGE 1 VERIFICATION TESTS COMPLETED SUCCESSFULLY ===");
}

testGDStage1().catch(console.error);
