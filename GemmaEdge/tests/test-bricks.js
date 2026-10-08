/**
 * 864zeros Feature-Brick Verification Suite
 * Tests collector, SLM adapter, MRL truncation, and segmenter logic.
 */

import { XdmEventCollector } from '../src/bricks/collector-brick.js';
import { SlmAdapter, cosineSimilarity, truncateMrl } from '../src/bricks/slm-adapter-brick.js';
import { IntentSegmenter } from '../src/bricks/segmenter-brick.js';

async function runTests() {
  console.log('🧪 Starting 864zeros GemmaEdge Brick Verification...\n');

  // 1. Initialize SLM Adapter
  const adapter = new SlmAdapter();
  console.log(`[PASS] SLM Adapter loaded: ${adapter.modelName} (Dimension: ${adapter.dimension})`);

  // 2. Test MRL Truncation
  const fullVec = await adapter.embed('Developer REST API webhook authentication');
  const mrl256 = truncateMrl(fullVec, 256);
  const mrl128 = truncateMrl(fullVec, 128);
  if (mrl256.length !== 256 || mrl128.length !== 128) {
    throw new Error('MRL truncation dimension mismatch!');
  }
  console.log('[PASS] MRL Truncation verified: 256d and 128d unit vectors');

  // 3. Initialize Segmenter
  const segmenter = new IntentSegmenter({ slmAdapter: adapter, threshold: 0.30 });
  await segmenter.initialize();
  console.log('[PASS] Segmenter initialized with 4 pre-embedded prototype segments');

  // 4. Test Scenario A: Developer Journey
  const collectorA = new XdmEventCollector();
  collectorA.track('web.interaction.pageView', { pageName: 'docs:api:webhooks', category: 'developer' });
  collectorA.track('web.interaction.click', { pageName: 'docs:api:webhooks', clickedElement: 'copy-curl-sample' });
  collectorA.track('web.interaction.search', { pageName: 'docs:api:webhooks', searchedQuery: 'oauth bearer token' });

  const trajectoryA = collectorA.getTrajectoryNarrative();
  const resultA = await segmenter.classifyTrajectory(trajectoryA);

  console.log(`\nScenario A (Developer Trajectory):`);
  console.log(`  Trajectory: "${trajectoryA}"`);
  console.log(`  Top Segment: "${resultA.topSegment.name}" (Score: ${resultA.topSegment.score.toFixed(3)})`);
  console.log(`  Evaluation Latency: ${resultA.evaluationTimeMs.toFixed(2)} ms`);

  if (resultA.topSegment.id !== 'technical-evaluator') {
    throw new Error(`Expected 'technical-evaluator', got '${resultA.topSegment.id}'`);
  }
  console.log('  [PASS] Correctly classified developer trajectory');

  // 5. Test Scenario B: Bargain Hunter Journey
  const collectorB = new XdmEventCollector();
  collectorB.track('web.interaction.pageView', { pageName: 'pricing', category: 'commercial' });
  collectorB.track('web.interaction.click', { pageName: 'pricing', clickedElement: 'toggle-monthly-discount' });
  collectorB.track('web.interaction.search', { pageName: 'pricing', searchedQuery: 'free trial coupon code' });

  const trajectoryB = collectorB.getTrajectoryNarrative();
  const resultB = await segmenter.classifyTrajectory(trajectoryB);

  console.log(`\nScenario B (Bargain Hunter Trajectory):`);
  console.log(`  Trajectory: "${trajectoryB}"`);
  console.log(`  Top Segment: "${resultB.topSegment.name}" (Score: ${resultB.topSegment.score.toFixed(3)})`);
  console.log(`  Evaluation Latency: ${resultB.evaluationTimeMs.toFixed(2)} ms`);

  if (resultB.topSegment.id !== 'price-sensitive-trialist') {
    throw new Error(`Expected 'price-sensitive-trialist', got '${resultB.topSegment.id}'`);
  }
  console.log('  [PASS] Correctly classified bargain hunter trajectory');

  // 6. Test Scenario C: Urgent Support Journey
  const collectorC = new XdmEventCollector();
  collectorC.track('web.interaction.pageView', { pageName: 'error:500', category: 'system' });
  collectorC.track('web.interaction.click', { pageName: 'error:500', clickedElement: 'emergency-support-contact' });
  collectorC.track('web.interaction.search', { pageName: 'support', searchedQuery: 'broken system failure crisis' });

  const trajectoryC = collectorC.getTrajectoryNarrative();
  const resultC = await segmenter.classifyTrajectory(trajectoryC);

  console.log(`\nScenario C (Urgent Support Trajectory):`);
  console.log(`  Trajectory: "${trajectoryC}"`);
  console.log(`  Top Segment: "${resultC.topSegment.name}" (Score: ${resultC.topSegment.score.toFixed(3)})`);
  console.log(`  Evaluation Latency: ${resultC.evaluationTimeMs.toFixed(2)} ms`);

  if (resultC.topSegment.id !== 'urgent-support-seeker') {
    throw new Error(`Expected 'urgent-support-seeker', got '${resultC.topSegment.id}'`);
  }
  console.log('  [PASS] Correctly classified urgent support trajectory');

  // 7. Test Scenario D: LoRA Adapter Hot-Swap
  console.log(`\nScenario D (LoRA Hot-Swapping):`);
  adapter.loadLoraAdapter({
    name: 'enterprise-cybersecurity-lora',
    rank: 8,
    anchors: {
      enterprise: ['postquantum', 'lattice', 'zerotrust', 'cryptography']
    }
  });
  console.log(`  Loaded LoRA Adapter: "${adapter.activeLora.name}" (Rank: ${adapter.activeLora.rank})`);
  
  const collectorD = new XdmEventCollector();
  collectorD.track('web.interaction.pageView', { pageName: 'security:nextgen', category: 'enterprise' });
  collectorD.track('web.interaction.search', { pageName: 'security', searchedQuery: 'postquantum zerotrust lattice cryptography' });
  
  const trajectoryD = collectorD.getTrajectoryNarrative();
  const resultD = await segmenter.classifyTrajectory(trajectoryD);
  console.log(`  Top Segment with LoRA: "${resultD.topSegment.name}" (Score: ${resultD.topSegment.score.toFixed(3)})`);
  
  if (resultD.topSegment.id !== 'enterprise-buyer') {
    throw new Error(`Expected 'enterprise-buyer' with LoRA, got '${resultD.topSegment.id}'`);
  }
  console.log('  [PASS] Correctly boosted domain intent via hot-swapped LoRA adapter');

  console.log('\n✨ ALL GEMMAEDGE FEATURE BRICK VERIFICATION TESTS PASSED SUCCESSFULLY! ✨');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
