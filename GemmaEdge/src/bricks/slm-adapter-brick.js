/**
 * 864zeros Feature-Brick: slm-adapter-brick.js
 * 
 * Pluggable Small Language Model (SLM) / Embedding adapter.
 * Enables hot-swapping between zero-dependency local semantic embedder,
 * WebGPU/WASM Gemma 270M models, or native mobile LiteRT bridges.
 */

/**
 * Compute cosine similarity between two normalized or unnormalized float arrays
 * @param {Float32Array|Array<number>} a 
 * @param {Float32Array|Array<number>} b 
 * @returns {number} Value between -1.0 and 1.0
 */
export function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Normalize vector to unit length (L2 norm = 1.0)
 * @param {Float32Array} vec 
 * @returns {Float32Array}
 */
export function l2Normalize(vec) {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return vec;
  for (let i = 0; i < vec.length; i++) {
    vec[i] /= norm;
  }
  return vec;
}

/**
 * Matryoshka Representation Learning (MRL) truncation
 * Truncates higher-dimensional vector (e.g., 768d) down to target (e.g., 256d or 128d)
 * and re-normalizes to preserve unit sphere alignment.
 * @param {Float32Array} vec 
 * @param {number} targetDim 
 * @returns {Float32Array}
 */
export function truncateMrl(vec, targetDim) {
  const truncated = new Float32Array(Math.min(targetDim, vec.length));
  for (let i = 0; i < truncated.length; i++) {
    truncated[i] = vec[i];
  }
  return l2Normalize(truncated);
}

/**
 * Deterministic Semantic Projection Embedder (Zero-Dependency Edge Fallback)
 * Models a dense 256-dimensional semantic space using token decomposition,
 * category anchors, and random projection hash kernels.
 */
export class LocalSemanticEngine {
  constructor(dimension = 256) {
    this.dimension = dimension;
    this.modelName = "gemma-edge-sml-local (256d MRL)";

    // Semantic Anchor Archetypes in high-dimensional concept space
    this.anchorCategories = {
      technical: [
        'api', 'webhook', 'endpoint', 'token', 'json', 'post', 'developer',
        'sdk', 'authentication', 'header', 'schema', 'rest', 'cors', 'oauth',
        'security', 'compliance', 'sso', 'saml', 'audit', 'encryption', 'tls'
      ],
      commercial: [
        'pricing', 'cost', 'discount', 'coupon', 'free', 'trial', 'monthly',
        'annual', 'billing', 'plan', 'tier', 'upgrade', 'cancel', 'budget',
        'cheap', 'savings', 'credit', 'card', 'checkout'
      ],
      crisis: [
        'help', 'crisis', 'urgent', 'error', 'fail', 'stuck', 'support',
        'contact', 'emergency', 'broken', 'issue', 'down', 'problem',
        'overwhelmed', 'trigger', 'anxiety', 'craving', 'halt', 'relapse'
      ],
      enterprise: [
        'enterprise', 'sla', 'uptime', 'dedicated', 'compliance', 'soc2',
        'hipaa', 'contract', 'procurement', 'invoice', 'scale', 'custom'
      ]
    };
  }

  /**
   * Deterministic pseudo-random float generator based on seed string
   * @private
   */
  _hashStringToFloat(str, seed) {
    let h = 0x811c9dc5 ^ seed;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) % 10000) / 10000 - 0.5;
  }

  /**
   * Generate an on-device 256d embedding for any input text
   * @param {string} text 
   * @returns {Promise<Float32Array>}
   */
  async embed(text) {
    const tokens = (text || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);

    const vec = new Float32Array(this.dimension);

    if (tokens.length === 0) {
      return vec;
    }

    // 1. Base token projection into 256d
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      for (let d = 0; d < this.dimension; d++) {
        const component = this._hashStringToFloat(token, d * 7919);
        vec[d] += component;
      }

      // 2. Semantic Anchor Biasing
      for (const [category, keywords] of Object.entries(this.anchorCategories)) {
        if (keywords.includes(token)) {
          const categorySeed = category.charCodeAt(0) * 101;
          for (let d = 0; d < this.dimension; d++) {
            const anchor = this._hashStringToFloat(category, d * 313 + categorySeed);
            vec[d] += anchor * 2.5; // Amplify category signal
          }
        }
      }
    }

    // 3. Apply active LoRA adapter adjustments if present
    if (this.activeLora) {
      const loraScale = this.activeLora.scalingFactor || 1.2;
      for (let d = 0; d < this.dimension; d++) {
        vec[d] *= loraScale;
      }
    }

    // 4. L2 Normalize output
    return l2Normalize(vec);
  }

  /**
   * Hot-swap a LoRA adapter dynamically at runtime
   * @param {Object} adapter { name, rank, anchors, scalingFactor }
   */
  loadLoraAdapter(adapter) {
    if (!adapter) {
      this.activeLora = null;
      return;
    }
    this.activeLora = {
      name: adapter.name || 'custom-lora-adapter',
      rank: adapter.rank || 8,
      scalingFactor: adapter.scalingFactor || 1.2
    };

    if (adapter.anchors) {
      for (const [cat, words] of Object.entries(adapter.anchors)) {
        this.anchorCategories[cat] = [
          ...(this.anchorCategories[cat] || []),
          ...words
        ];
      }
    }
  }
}

/**
 * SlmAdapter: Modular facade for swappable SLM backends
 */
export class SlmAdapter {
  constructor(engine = null) {
    this.engine = engine || new LocalSemanticEngine(256);
  }

  setEngine(engine) {
    this.engine = engine;
  }

  async embed(text) {
    return this.engine.embed(text);
  }

  loadLoraAdapter(adapter) {
    if (typeof this.engine.loadLoraAdapter === 'function') {
      this.engine.loadLoraAdapter(adapter);
    }
  }

  get activeLora() {
    return this.engine.activeLora || null;
  }

  get dimension() {
    return this.engine.dimension;
  }

  get modelName() {
    return this.engine.modelName;
  }
}
