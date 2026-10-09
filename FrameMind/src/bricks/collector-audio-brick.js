/**
 * FrameMind — collector-audio-brick.js
 * 
 * Feature Brick: Audio & Transcript Telemetry Collector
 * Ingests timestamped speech tokens, acoustic energy (RMS dB), silence intervals,
 * and acoustic cue markers (laughter, applause, cadence shifts).
 * Synthesizes a rolling temporal trajectory for SLM intent classification.
 * 
 * Zero external runtime dependencies. Runs in Browser and Node.js.
 */

export class AudioCollectorBrick {
  constructor(options = {}) {
    this.maxWindowSeconds = options.maxWindowSeconds || 12; // Rolling 12s context
    this.events = [];
    this.subscribers = new Set();
    this.activeSpeaker = options.defaultSpeaker || 'speaker_1';
  }

  /**
   * Ingest a timestamped word or acoustic token
   * @param {Object} event { timestampMs, word, speaker, dbLevel, tag }
   */
  ingest(event) {
    const entry = {
      timestampMs: event.timestampMs || Date.now(),
      word: event.word ? String(event.word).trim() : '',
      speaker: event.speaker || this.activeSpeaker,
      dbLevel: typeof event.dbLevel === 'number' ? event.dbLevel : -24, // Normal speech dB
      tag: event.tag || null // e.g. '[laugh]', '[applause]', '[silence]', '[punchline]', '[rep_count]'
    };

    if (entry.speaker) {
      this.activeSpeaker = entry.speaker;
    }

    this.events.push(entry);
    this._pruneWindow(entry.timestampMs);
    this._notifySubscribers(entry);
    return entry;
  }

  /**
   * Ingest batch of transcript items (e.g. from ASR model or file)
   */
  ingestBatch(eventsArray) {
    if (!Array.isArray(eventsArray)) return [];
    return eventsArray.map(e => this.ingest(e));
  }

  /**
   * Prune events older than the rolling window relative to latest timestamp
   */
  _pruneWindow(currentTimestampMs) {
    const cutoff = currentTimestampMs - (this.maxWindowSeconds * 1000);
    this.events = this.events.filter(e => e.timestampMs >= cutoff);
  }

  /**
   * Generate a rolling textual context summary for the SLM
   */
  synthesizeTrajectory() {
    if (this.events.length === 0) return 'cadence: neutral | silence';

    // Calculate metrics
    const words = this.events.filter(e => e.word).map(e => e.word);
    const tags = this.events.filter(e => e.tag).map(e => e.tag);
    const avgDb = this.events.reduce((sum, e) => sum + e.dbLevel, 0) / this.events.length;
    
    // Check speaker distribution
    const speakers = [...new Set(this.events.map(e => e.speaker))];
    const isMultiSpeaker = speakers.length > 1;

    // Detect acoustic energy spikes
    const maxDb = Math.max(...this.events.map(e => e.dbLevel));
    const energyProfile = maxDb > -12 ? 'high_energy_spike' : (avgDb < -35 ? 'whisper_or_pause' : 'conversational');

    return [
      `speakers:[${speakers.join(',')}]`,
      `energy:${energyProfile}(${Math.round(avgDb)}dB)`,
      tags.length > 0 ? `tags:[${tags.join(',')}]` : '',
      `recent_words:"${words.slice(-15).join(' ')}"`
    ].filter(Boolean).join(' | ');
  }

  /**
   * Subscribe to new ingested audio events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  _notifySubscribers(event) {
    for (const sub of this.subscribers) {
      try { sub(event); } catch (err) { console.error('AudioCollector subscriber error:', err); }
    }
  }

  reset() {
    this.events = [];
  }
}
