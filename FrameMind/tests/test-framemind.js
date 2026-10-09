/**
 * FrameMind — Automated Verification Suite
 * Tests all 4 Feature Bricks, LoRA hot-swapping, and boundary invariants.
 */

import { AudioCollectorBrick } from '../src/bricks/collector-audio-brick.js';
import { SlmCinematographyBrick } from '../src/bricks/slm-cinematography-brick.js';
import { DirectorBrick } from '../src/bricks/director-brick.js';
import { FramingMutatorBrick } from '../src/bricks/framing-mutator-brick.js';
import { FrameMindInspectorBrick } from '../src/bricks/inspector-brick.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('\n========================================');
console.log('🧪 RUNNING FRAMEMIND FEATURE BRICKS TEST');
console.log('========================================\n');

// 1. AudioCollectorBrick
console.log('--- 1. Testing AudioCollectorBrick ---');
const collector = new AudioCollectorBrick({ maxWindowSeconds: 5 });
collector.ingest({ timestampMs: 1000, word: 'welcome', speaker: 'speaker_1', dbLevel: -20 });
collector.ingest({ timestampMs: 2000, word: 'to', speaker: 'speaker_1', dbLevel: -18 });
collector.ingest({ timestampMs: 3000, word: 'the', speaker: 'speaker_1', dbLevel: -15 });
collector.ingest({ timestampMs: 4000, word: 'show', speaker: 'speaker_1', dbLevel: -10, tag: '[punchline]' });

const trajectory = collector.synthesizeTrajectory();
assert(trajectory.includes('speakers:[speaker_1]'), 'Includes detected speakers');
assert(trajectory.includes('tags:[[punchline]]'), 'Includes detected acoustic tag');
assert(trajectory.includes('recent_words:"welcome to the show"'), 'Synthesizes word sequence');

// Test window pruning
collector.ingest({ timestampMs: 10000, word: 'late_event', speaker: 'speaker_2', dbLevel: -22 });
const prunedTrajectory = collector.synthesizeTrajectory();
assert(!prunedTrajectory.includes('welcome'), 'Events older than maxWindowSeconds are correctly pruned');

// 2. SlmCinematographyBrick & LoRA Hot-Swap
console.log('\n--- 2. Testing SlmCinematographyBrick & LoRA Swapping ---');
const slm = new SlmCinematographyBrick();
assert(slm.getAvailableLoras().length === 3, 'Pre-loaded 3 domain LoRA adapters');

const vec1 = slm.embed('hilarious punchline laugh banter');
assert(vec1.length === 256, 'Generates 256-dimensional vector');

// Measure LoRA hot-swap latency
const swapStart = performance.now();
const swapResult = slm.swapLora('fitness_coach');
const swapDuration = performance.now() - swapStart;
assert(swapResult.swappedTo === 'fitness_coach', 'Hot-swaps LoRA adapter to fitness_coach');
assert(swapDuration < 2.0, `LoRA hot-swap executed in sub-2ms (${swapDuration.toFixed(3)}ms)`);

// 3. DirectorBrick & Intent Decisioning
console.log('\n--- 3. Testing DirectorBrick Intent Decisioning ---');
const director = new DirectorBrick(slm);

// Scenario A: Fitness LoRA active -> Test rep count
const fitnessDecision = director.directShot('rep_count 1 2 3 push strong workout posture', { speaker: 'trainer' });
assert(
  fitnessDecision.shotKey === 'FORM_CHECK_WIDE' || fitnessDecision.shotKey === 'MOTIVATIONAL_PULSE',
  `Fitness LoRA correctly classifies workout intent (Got: ${fitnessDecision.shotKey})`
);
assert(fitnessDecision.latencyMs < 5.0, `Shot directed in ${fitnessDecision.latencyMs}ms (<5ms SLA)`);

// Scenario B: Hot-swap to Podcast LoRA -> Test punchline
slm.swapLora('podcast_editor');
const podcastDecision = director.directShot('that is hilarious punchline reaction laugh joke', { speaker: 'host' });
assert(
  podcastDecision.shotKey === 'PUNCHLINE_PUSH',
  `Podcast LoRA correctly directs PUNCHLINE_PUSH on humor (Got: ${podcastDecision.shotKey})`
);
assert(podcastDecision.cameraParams.zoom === 1.35, 'PUNCHLINE_PUSH applies tight 1.35x zoom');

// Scenario C: Banter Speaker Pan
const banterDecision = director.directShot('banter dialogue question reply conversation', { speaker: 'guest' });
assert(banterDecision.shotKey === 'BANTER_PING_PONG', 'Banter triggers BANTER_PING_PONG');
assert(banterDecision.cameraParams.panX === 0.7, 'Pans right (panX = 0.7) when guest speaks');

// 4. FramingMutatorBrick & Safe Crop Boundaries
console.log('\n--- 4. Testing FramingMutatorBrick & Boundary Safety ---');
const mutator = new FramingMutatorBrick();

// Apply extreme pan/zoom and verify no boundary violation
mutator.applyDecision({
  cameraParams: { zoom: 2.0, panX: 0.95, panY: 0.95, durationMs: 100 }
});

// Advance clock to completion
const finalCoords = mutator.tick(performance.now() + 500);
assert(finalCoords.x >= 0, `Crop X is within bounds (x=${finalCoords.x})`);
assert(finalCoords.y >= 0, `Crop Y is within bounds (y=${finalCoords.y})`);
assert(finalCoords.x + finalCoords.width <= 1.0001, `Crop X+W <= 1.0 (x+w=${finalCoords.x + finalCoords.width})`);
assert(finalCoords.y + finalCoords.height <= 1.0001, `Crop Y+H <= 1.0 (y+h=${finalCoords.y + finalCoords.height})`);

// 5. Inspector & Zero Egress
console.log('\n--- 5. Testing Inspector & Zero Egress Invariant ---');
const inspector = new FrameMindInspectorBrick();
inspector.logToken({ word: 'test', speaker: 'speaker_1', dbLevel: -20 });
inspector.logDecision(podcastDecision);
const metrics = inspector.getMetrics();
assert(metrics.networkEgressBytes === 0, 'Guarantees strictly 0 bytes network egress');
assert(metrics.totalDecisions === 1, 'Records decision history');

console.log('\n========================================');
console.log('🎉 ALL FRAMEMIND BRICK TESTS PASSED!');
console.log('========================================\n');
