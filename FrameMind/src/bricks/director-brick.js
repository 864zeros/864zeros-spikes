/**
 * FrameMind — director-brick.js
 * 
 * Feature Brick: Cinematography Director & Intent Engine
 * Evaluates semantic audio trajectory vectors against editorial shot prototypes.
 * Generates non-destructive Edit Decision List (EDL) keyframes and camera crop parameters.
 * 
 * Zero external runtime dependencies. Runs in Browser and Node.js.
 */

export class DirectorBrick {
  constructor(slmAdapter, options = {}) {
    if (!slmAdapter) {
      throw new Error('DirectorBrick requires an SlmCinematographyBrick instance.');
    }
    this.slm = slmAdapter;
    this.threshold = options.threshold || 0.45;
    this.prototypes = new Map();
    this._initShotPrototypes();
  }

  _initShotPrototypes() {
    this.prototypes.set('PUNCHLINE_PUSH', {
      name: 'Punchline Push-In',
      description: 'Tight dramatic push on speaker delivering punchline or rhetorical climax',
      prototypeText: 'punchline laughter reaction funny joke hilarious peak energy punch volume spike',
      cameraParams: {
        zoom: 1.35,
        panX: 0.5,
        panY: 0.45,
        durationMs: 1200,
        easing: 'easeInOutCubic',
        holdMs: 2500
      }
    });

    this.prototypes.set('BANTER_PING_PONG', {
      name: 'Banter Speaker Pan',
      description: 'Fast cross-speaker transition during dialogue or interruptive banter',
      prototypeText: 'banter dialogue speakers argument conversation reply back and forth question answer',
      cameraParams: {
        zoom: 1.15,
        panX: 0.3, // Shifts dynamically based on active speaker
        panY: 0.5,
        durationMs: 700,
        easing: 'easeInOutCubic',
        holdMs: 3000
      }
    });

    this.prototypes.set('FORM_CHECK_WIDE', {
      name: 'Form Check Wide-Angle',
      description: 'Stabilized wide angle capturing full body posture and movement arc',
      prototypeText: 'rep_count form_check posture workout exercise squat bench deadlift full body wide',
      cameraParams: {
        zoom: 1.0,
        panX: 0.5,
        panY: 0.5,
        durationMs: 900,
        easing: 'easeInOutCubic',
        holdMs: 4000
      }
    });

    this.prototypes.set('MOTIVATIONAL_PULSE', {
      name: 'Motivational Cadence Pulse',
      description: 'Rhythmic zoom pulse synchronized with rep count pacing or peak push',
      prototypeText: 'motivational_pulse push reps cadence tempo keep going strong finish last set',
      cameraParams: {
        zoom: 1.22,
        panX: 0.5,
        panY: 0.48,
        durationMs: 500,
        easing: 'easeOutQuad',
        holdMs: 1500
      }
    });

    this.prototypes.set('KEYNOTE_SLOW_PUSH', {
      name: 'Keynote Cinematic Slow-Push',
      description: 'Slow, steady creeping zoom building gravitas and audience focus',
      prototypeText: 'slow_push topic_shift keynote presentation vision strategy audience applause rhetoric',
      cameraParams: {
        zoom: 1.25,
        panX: 0.5,
        panY: 0.46,
        durationMs: 4000,
        easing: 'easeInOutCubic',
        holdMs: 5000
      }
    });

    this.prototypes.set('NEUTRAL_ANCHOR', {
      name: 'Neutral Medium Shot',
      description: 'Balanced medium framing during steady conversational exposition',
      prototypeText: 'neutral conversational normal explanation steady cadence standard',
      cameraParams: {
        zoom: 1.1,
        panX: 0.5,
        panY: 0.5,
        durationMs: 1000,
        easing: 'easeInOutCubic',
        holdMs: 3000
      }
    });

    // Precompute prototype vectors
    for (const [key, proto] of this.prototypes.entries()) {
      proto.vector = this.slm.embed(proto.prototypeText);
    }
  }

  /**
   * Classify audio trajectory and return editorial shot decision
   */
  directShot(trajectoryText, context = {}) {
    const startTime = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const inputVec = this.slm.embed(trajectoryText);

    let bestShotKey = 'NEUTRAL_ANCHOR';
    let highestSim = -1;
    const scores = {};

    for (const [key, proto] of this.prototypes.entries()) {
      const sim = this.slm.cosineSimilarity(inputVec, proto.vector);
      scores[key] = Math.round(sim * 1000) / 1000;
      if (sim > highestSim) {
        highestSim = sim;
        bestShotKey = key;
      }
    }

    const decisionProto = this.prototypes.get(bestShotKey);
    const cameraParams = { ...decisionProto.cameraParams };

    // Dynamic speaker spatial pan adjustment for Banter Ping-Pong
    if (bestShotKey === 'BANTER_PING_PONG' && context.speaker) {
      if (context.speaker === 'speaker_2' || context.speaker === 'guest') {
        cameraParams.panX = 0.7; // Pan right
      } else {
        cameraParams.panX = 0.3; // Pan left
      }
    }

    const endTime = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const latencyMs = Math.round((endTime - startTime) * 100) / 100;

    return {
      shotKey: bestShotKey,
      shotName: decisionProto.name,
      confidence: Math.max(0, Math.min(1, (highestSim + 1) / 2)),
      rawSimilarity: highestSim,
      scores,
      cameraParams,
      latencyMs,
      activeLora: this.slm.activeLoraId,
      timestampMs: context.timestampMs || Date.now()
    };
  }
}
