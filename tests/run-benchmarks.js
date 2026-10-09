/**
 * Statistical Benchmark Harness for Sovereign Edge SLM & Feature Bricks
 * Runs 1,000 iterations to measure p50, p95, p99, mean, std dev, and memory.
 */

import { performance } from 'perf_hooks';
import { SlmCinematographyBrick } from '../FrameMind/src/bricks/slm-cinematography-brick.js';
import { DirectorBrick } from '../FrameMind/src/bricks/director-brick.js';
import { FramingMutatorBrick } from '../FrameMind/src/bricks/framing-mutator-brick.js';
import { AudioCollectorBrick } from '../FrameMind/src/bricks/collector-audio-brick.js';
import { SlmAdapter } from '../GemmaEdge/src/bricks/slm-adapter-brick.js';
import { IntentSegmenter } from '../GemmaEdge/src/bricks/segmenter-brick.js';
import { XdmEventCollector } from '../GemmaEdge/src/bricks/collector-brick.js';

function computeStats(samples) {
  samples.sort((a, b) => a - b);
  const sum = samples.reduce((acc, v) => acc + v, 0);
  const mean = sum / samples.length;
  const variance = samples.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  const p50 = samples[Math.floor(samples.length * 0.50)];
  const p95 = samples[Math.floor(samples.length * 0.95)];
  const p99 = samples[Math.floor(samples.length * 0.99)];
  const min = samples[0];
  const max = samples[samples.length - 1];
  return { 
    mean: Math.round(mean * 1000) / 1000, 
    stdDev: Math.round(stdDev * 1000) / 1000, 
    p50: Math.round(p50 * 1000) / 1000, 
    p95: Math.round(p95 * 1000) / 1000, 
    p99: Math.round(p99 * 1000) / 1000, 
    min: Math.round(min * 1000) / 1000, 
    max: Math.round(max * 1000) / 1000 
  };
}

const ITERATIONS = 1000;
console.log(`Running ${ITERATIONS} iterations across all pipeline stages...\n`);

// 1. LoRA Hot-Swap Latency
const slm = new SlmCinematographyBrick();
const swapSamples = [];
const loras = ['fitness_coach', 'keynote_speaker', 'podcast_editor'];
for (let i = 0; i < ITERATIONS; i++) {
  const target = loras[i % loras.length];
  const t0 = performance.now();
  slm.swapLora(target);
  const t1 = performance.now();
  swapSamples.push(t1 - t0);
}
const swapStats = computeStats(swapSamples);

// 2. Trajectory Synthesis Latency (Audio / XDM)
const collector = new AudioCollectorBrick({ maxWindowSeconds: 10 });
for (let j = 0; j < 20; j++) {
  collector.ingest({ timestampMs: j * 500, word: `token_${j}`, speaker: j % 2 === 0 ? 'host' : 'guest', dbLevel: -20 + (j % 10) });
}
const trajSamples = [];
for (let i = 0; i < ITERATIONS; i++) {
  const t0 = performance.now();
  collector.synthesizeTrajectory();
  const t1 = performance.now();
  trajSamples.push(t1 - t0);
}
const trajStats = computeStats(trajSamples);

// 3. MRL Vector Embedding (256d)
const embedSamples = [];
const testText = "host delivered hilarious punchline followed by laughter and banter in the studio";
for (let i = 0; i < ITERATIONS; i++) {
  const t0 = performance.now();
  slm.embed(testText);
  const t1 = performance.now();
  embedSamples.push(t1 - t0);
}
const embedStats = computeStats(embedSamples);

// 4. Intent Classification & Directing (DirectorBrick)
const director = new DirectorBrick(slm);
const directSamples = [];
for (let i = 0; i < ITERATIONS; i++) {
  const t0 = performance.now();
  director.directShot(testText, { speaker: 'host' });
  const t1 = performance.now();
  directSamples.push(t1 - t0);
}
const directStats = computeStats(directSamples);

// 5. Framing Mutator 60fps Interpolation Tick
const mutator = new FramingMutatorBrick();
mutator.applyDecision({ cameraParams: { zoom: 1.4, panX: 0.7, panY: 0.4, durationMs: 800 } });
const tickSamples = [];
for (let i = 0; i < ITERATIONS; i++) {
  const t0 = performance.now();
  mutator.tick(performance.now() + i);
  const t1 = performance.now();
  tickSamples.push(t1 - t0);
}
const tickStats = computeStats(tickSamples);

// 6. GemmaEdge End-to-End Pipeline
const gemmaCollector = new XdmEventCollector();
const gemmaSlm = new SlmAdapter();
const gemmaSegmenter = new IntentSegmenter({ slmAdapter: gemmaSlm });
await gemmaSegmenter.initialize();

for (let k = 0; k < 10; k++) {
  gemmaCollector.track('web.interaction.pageView', { pageName: `docs:api:part-${k}`, category: 'developer' });
}
const gemmaTrajectory = gemmaCollector.getTrajectoryNarrative();
const gemmaE2ESamples = [];
for (let i = 0; i < ITERATIONS; i++) {
  const t0 = performance.now();
  await gemmaSegmenter.classifyTrajectory(gemmaTrajectory);
  const t1 = performance.now();
  gemmaE2ESamples.push(t1 - t0);
}
const gemmaStats = computeStats(gemmaE2ESamples);

const mem = process.memoryUsage();
const results = {
  swapStats,
  trajStats,
  embedStats,
  directStats,
  tickStats,
  gemmaStats,
  memoryUsageMb: {
    rss: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100
  }
};

console.log(JSON.stringify(results, null, 2));
