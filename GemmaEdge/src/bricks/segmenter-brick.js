/**
 * 864zeros Feature-Brick: segmenter-brick.js
 * 
 * On-Edge Behavioral Segment Classifier (Local CJA).
 * Matches user trajectory intent vectors against Segment Prototypes in real time.
 */

import { cosineSimilarity } from './slm-adapter-brick.js';

export class IntentSegmenter {
  /**
   * @param {Object} options
   * @param {import('./slm-adapter-brick.js').SlmAdapter} options.slmAdapter
   * @param {number} [options.threshold=0.35] Qualification confidence threshold
   * @param {Function} [options.onSegmentChange] Callback when top segment qualifies
   */
  constructor(options = {}) {
    this.slmAdapter = options.slmAdapter;
    this.threshold = options.threshold || 0.35;
    this.onSegmentChange = options.onSegmentChange || null;

    this.activeSegment = null;
    this.prototypes = [
      {
        id: 'technical-evaluator',
        name: 'Technical / Developer Evaluator',
        description: 'Developer exploring REST API endpoints, webhooks, JSON schemas, authentication tokens, and SDK code samples.',
        variantKey: 'dev-focus',
        vector: null
      },
      {
        id: 'enterprise-buyer',
        name: 'Enterprise Decision Maker',
        description: 'Executive reviewing enterprise SLA guarantees, SOC2 security compliance, dedicated hosting, and procurement contracts.',
        variantKey: 'enterprise-focus',
        vector: null
      },
      {
        id: 'price-sensitive-trialist',
        name: 'Price-Sensitive Explorer',
        description: 'Prospect comparing cheap monthly plans, discount coupon codes, free tier limits, and billing savings.',
        variantKey: 'value-focus',
        vector: null
      },
      {
        id: 'urgent-support-seeker',
        name: 'Urgent Support / Crisis Seeker',
        description: 'User encountering unexpected errors, broken workflows, system down issues, and seeking immediate emergency support.',
        variantKey: 'support-focus',
        vector: null
      }
    ];
  }

  /**
   * Pre-compute prototype vectors on initialization
   */
  async initialize() {
    for (const proto of this.prototypes) {
      proto.vector = await this.slmAdapter.embed(proto.description);
    }
    return this;
  }

  /**
   * Add a custom segment prototype dynamically
   * @param {Object} proto { id, name, description, variantKey }
   */
  async addPrototype(proto) {
    proto.vector = await this.slmAdapter.embed(proto.description);
    this.prototypes.push(proto);
  }

  /**
   * Classify a behavioral trajectory string
   * @param {string} trajectoryNarrative 
   * @returns {Promise<Object>} Evaluation results with cosine similarity rankings
   */
  async classifyTrajectory(trajectoryNarrative) {
    const startTime = performance.now();

    // 1. Embed user trajectory into dense intent vector
    const intentVector = await this.slmAdapter.embed(trajectoryNarrative);

    // 2. Score against all segment prototypes
    const scores = this.prototypes.map(proto => {
      const similarity = proto.vector ? cosineSimilarity(intentVector, proto.vector) : 0;
      return {
        id: proto.id,
        name: proto.name,
        variantKey: proto.variantKey,
        score: Math.max(0, similarity),
        qualified: similarity >= this.threshold
      };
    });

    // 3. Sort descending by similarity
    scores.sort((a, b) => b.score - a.score);

    const topCandidate = scores[0];
    const evaluationTimeMs = performance.now() - startTime;

    const result = {
      topSegment: topCandidate,
      scores,
      intentVector,
      evaluationTimeMs,
      timestamp: new Date().toISOString()
    };

    // Trigger state change if top segment qualified and changed
    if (topCandidate && topCandidate.qualified) {
      if (!this.activeSegment || this.activeSegment.id !== topCandidate.id) {
        this.activeSegment = topCandidate;
        if (typeof this.onSegmentChange === 'function') {
          this.onSegmentChange(topCandidate, result);
        }
      }
    }

    return result;
  }

  /**
   * Get the current qualified active segment
   */
  getActiveSegment() {
    return this.activeSegment;
  }
}
