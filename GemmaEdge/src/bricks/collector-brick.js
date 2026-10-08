/**
 * 864zeros Feature-Brick: collector-brick.js
 * 
 * Standardized XDM-Lite event collector and session trajectory synthesizer.
 * Ingests user interactions completely in memory with zero network egress.
 */

export class XdmEventCollector {
  /**
   * @param {Object} options
   * @param {number} [options.bufferSize=10] Maximum events in rolling trajectory
   * @param {Function} [options.onEvent] Callback for every captured event
   * @param {Function} [options.onTrajectoryChange] Callback when trajectory updates
   */
  constructor(options = {}) {
    this.bufferSize = options.bufferSize || 10;
    this.events = [];
    this.onEvent = options.onEvent || null;
    this.onTrajectoryChange = options.onTrajectoryChange || null;
    this.sessionStartTime = Date.now();
  }

  /**
   * Capture a standardized XDM-Lite behavioral event
   * @param {string} eventType e.g., 'web.interaction.pageView', 'web.interaction.click'
   * @param {Object} payload
   * @returns {Object} The recorded XDM event
   */
  track(eventType, payload = {}) {
    const xdmEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      web: {
        pageName: payload.pageName || 'home',
        category: payload.category || 'general',
        scrollDepthPercent: payload.scrollDepthPercent || 0
      },
      interaction: {
        clickedElement: payload.clickedElement || null,
        dwellTimeSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        searchedQuery: payload.searchedQuery || null,
        metadata: payload.metadata || {}
      }
    };

    // Maintain in-memory ring buffer
    this.events.push(xdmEvent);
    if (this.events.length > this.bufferSize) {
      this.events.shift();
    }

    if (typeof this.onEvent === 'function') {
      this.onEvent(xdmEvent);
    }

    const narrative = this.getTrajectoryNarrative();
    if (typeof this.onTrajectoryChange === 'function') {
      this.onTrajectoryChange(narrative, xdmEvent);
    }

    return xdmEvent;
  }

  /**
   * Synthesize the rolling session history into a dense semantic narrative
   * suitable for on-edge SLM embedding.
   * @returns {string} Natural language trajectory string
   */
  getTrajectoryNarrative() {
    if (this.events.length === 0) {
      return 'Session initialized with no prior interactions.';
    }

    return this.events.map((e, idx) => {
      const parts = [];
      if (e.eventType === 'web.interaction.pageView') {
        parts.push(`Viewed page '${e.web.pageName}' in category '${e.web.category}'`);
      } else if (e.eventType === 'web.interaction.click') {
        parts.push(`Clicked '${e.interaction.clickedElement}' on '${e.web.pageName}'`);
      } else if (e.eventType === 'web.interaction.search') {
        parts.push(`Searched query '${e.interaction.searchedQuery}' on '${e.web.pageName}'`);
      } else if (e.eventType === 'web.interaction.scroll') {
        parts.push(`Scrolled to ${e.web.scrollDepthPercent}% depth on '${e.web.pageName}'`);
      } else {
        parts.push(`Triggered ${e.eventType} on '${e.web.pageName}'`);
      }

      if (e.interaction.metadata && Object.keys(e.interaction.metadata).length > 0) {
        const metaStr = Object.entries(e.interaction.metadata)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');
        parts.push(`(${metaStr})`);
      }

      return parts.join(' ');
    }).join(' -> ');
  }

  /**
   * Retrieve all events currently in the rolling window
   * @returns {Array<Object>}
   */
  getHistory() {
    return [...this.events];
  }

  /**
   * Reset session trajectory buffer
   */
  clear() {
    this.events = [];
    this.sessionStartTime = Date.now();
    if (typeof this.onTrajectoryChange === 'function') {
      this.onTrajectoryChange(this.getTrajectoryNarrative(), null);
    }
  }
}
