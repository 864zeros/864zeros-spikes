/**
 * 864zeros Feature-Brick: inspector-brick.js
 * 
 * Edge CJA & Air-Gap Telemetry Inspector Component.
 * Provides live diagnostic visibility into local clickstream events,
 * trajectory synthesis, vector angles, and zero-network egress proof.
 */

export class EdgeInspector {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.targetElement
   */
  constructor(options = {}) {
    this.el = typeof options.targetElement === 'string'
      ? document.querySelector(options.targetElement)
      : options.targetElement;

    this.networkBytesEgress = 0;
    this.eventCount = 0;
  }

  /**
   * Render the inspector shell
   */
  render() {
    if (!this.el) return;

    this.el.innerHTML = `
      <div class="edge-inspector-card oia-card">
        <div class="inspector-header">
          <div class="badge-airgap">
            <span class="pulse-indicator"></span>
            AIR-GAPPED &bull; 0 BYTES EGRESS
          </div>
          <span class="inspector-title">GemmaEdge Live CJA</span>
        </div>

        <div class="inspector-metrics-grid">
          <div class="metric-box">
            <span class="metric-label">Inference Latency</span>
            <span class="metric-value" id="metric-latency">-- ms</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">Network Sent</span>
            <span class="metric-value success" id="metric-egress">0 Bytes</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">Vector Space</span>
            <span class="metric-value" id="metric-dim">256d MRL</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">Active Intent</span>
            <span class="metric-value highlight" id="metric-segment">Neutral</span>
          </div>
        </div>

        <div class="inspector-section">
          <label class="section-label">Session Trajectory Buffer</label>
          <div class="trajectory-display" id="inspector-trajectory">
            No behavioral interactions recorded yet. Click around the demo site to generate clickstream.
          </div>
        </div>

        <div class="inspector-section">
          <label class="section-label">Segment Confidence Rankings (Cosine)</label>
          <div class="segment-bars" id="inspector-segments">
            <!-- Dynamically populated -->
          </div>
        </div>

        <div class="inspector-section">
          <div class="collapsible-header" id="toggle-xdm-log">
            <label class="section-label">Live XDM-Lite Event Feed (<span id="event-counter">0</span>)</label>
            <span class="subtle-badge">Raw In-Memory Stream</span>
          </div>
          <div class="xdm-log-container" id="inspector-xdm-log">
            <div class="empty-log-hint">Awaiting first user action...</div>
          </div>
        </div>
      </div>
    `;

    // Hook internal events
    this.metricLatency = this.el.querySelector('#metric-latency');
    this.metricEgress = this.el.querySelector('#metric-egress');
    this.metricSegment = this.el.querySelector('#metric-segment');
    this.trajectoryDisplay = this.el.querySelector('#inspector-trajectory');
    this.segmentBars = this.el.querySelector('#inspector-segments');
    this.xdmLog = this.el.querySelector('#inspector-xdm-log');
    this.eventCounter = this.el.querySelector('#event-counter');
  }

  /**
   * Log an incoming XDM-Lite event
   * @param {Object} event 
   */
  logEvent(event) {
    this.eventCount++;
    if (this.eventCounter) this.eventCounter.textContent = this.eventCount;

    if (this.xdmLog) {
      const hint = this.xdmLog.querySelector('.empty-log-hint');
      if (hint) hint.remove();

      const item = document.createElement('div');
      item.className = 'xdm-log-item';
      item.innerHTML = `
        <div class="log-item-header">
          <span class="event-pill">${event.eventType.split('.').pop()}</span>
          <span class="log-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
        </div>
        <pre class="log-json">${JSON.stringify(event, null, 2)}</pre>
      `;

      this.xdmLog.prepend(item);
      // Keep DOM clean (max 5 in log)
      if (this.xdmLog.children.length > 5) {
        this.xdmLog.removeChild(this.xdmLog.lastChild);
      }
    }
  }

  /**
   * Update the live trajectory narrative
   * @param {string} narrative 
   */
  updateTrajectory(narrative) {
    if (this.trajectoryDisplay) {
      this.trajectoryDisplay.textContent = narrative;
    }
  }

  /**
   * Update classification scores & latency
   * @param {Object} classificationResult 
   */
  updateClassification(classificationResult) {
    const { topSegment, scores, evaluationTimeMs } = classificationResult;

    if (this.metricLatency) {
      this.metricLatency.textContent = `${evaluationTimeMs.toFixed(1)} ms`;
    }

    if (this.metricSegment && topSegment) {
      this.metricSegment.textContent = topSegment.qualified ? topSegment.name : 'Neutral / Unqualified';
    }

    if (this.segmentBars && scores) {
      this.segmentBars.innerHTML = scores.map(s => {
        const pct = Math.round(s.score * 100);
        const qualifiedClass = s.qualified ? 'is-qualified' : '';
        return `
          <div class="segment-score-row ${qualifiedClass}">
            <div class="score-meta">
              <span class="score-name">${s.name}</span>
              <span class="score-val">${(s.score).toFixed(3)} (${pct}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${Math.min(100, Math.max(4, pct))}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}
