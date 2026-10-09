/**
 * FrameMind — framing-mutator-brick.js
 * 
 * Feature Brick: Zero-Jitter Dynamic Framing Mutator
 * Calculates and renders smooth cubic-bezier camera transitions (Pan/Tilt/Zoom)
 * from 16:9 widescreen footage into 9:16 vertical Short/Reel format or 1:1 square.
 * Enforces boundary safety to prevent out-of-bounds crops.
 * 
 * Zero external runtime dependencies. Runs in Browser and Node.js.
 */

export class FramingMutatorBrick {
  constructor(options = {}) {
    this.targetAspect = options.targetAspect || (9 / 16); // 9:16 vertical video default
    this.sourceAspect = options.sourceAspect || (16 / 9);

    // Current state (smoothed)
    this.current = {
      zoom: 1.0,
      panX: 0.5,
      panY: 0.5
    };

    // Target state from DirectorBrick
    this.target = {
      zoom: 1.0,
      panX: 0.5,
      panY: 0.5
    };

    // Animation transition tracking
    this.transition = {
      active: false,
      startTime: 0,
      durationMs: 800,
      startZoom: 1.0,
      startPanX: 0.5,
      startPanY: 0.5,
      easing: 'easeInOutCubic'
    };
  }

  /**
   * Apply an editorial decision from DirectorBrick
   */
  applyDecision(decision) {
    if (!decision || !decision.cameraParams) return;
    const params = decision.cameraParams;

    this.transition.startZoom = this.current.zoom;
    this.transition.startPanX = this.current.panX;
    this.transition.startPanY = this.current.panY;
    this.transition.startTime = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    this.transition.durationMs = params.durationMs || 1000;
    this.transition.easing = params.easing || 'easeInOutCubic';
    this.transition.active = true;

    this.target.zoom = Math.max(1.0, Math.min(2.0, params.zoom || 1.0));
    this.target.panX = Math.max(0.1, Math.min(0.9, params.panX || 0.5));
    this.target.panY = Math.max(0.1, Math.min(0.9, params.panY || 0.5));
  }

  /**
   * Easing function lookup
   */
  _ease(t, type) {
    if (type === 'easeOutQuad') {
      return 1 - (1 - t) * (1 - t);
    }
    // Default: easeInOutCubic
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Advance interpolation clock (called once per animation frame)
   */
  tick(currentTimeMs) {
    if (!this.transition.active) return this.getCropCoordinates();

    const elapsed = currentTimeMs - this.transition.startTime;
    const progress = Math.min(1.0, Math.max(0.0, elapsed / this.transition.durationMs));
    const factor = this._ease(progress, this.transition.easing);

    this.current.zoom = this.transition.startZoom + (this.target.zoom - this.transition.startZoom) * factor;
    this.current.panX = this.transition.startPanX + (this.target.panX - this.transition.startPanX) * factor;
    this.current.panY = this.transition.startPanY + (this.target.panY - this.transition.startPanY) * factor;

    if (progress >= 1.0) {
      this.transition.active = false;
    }

    return this.getCropCoordinates();
  }

  /**
   * Calculate normalized crop box {x, y, w, h} [0..1] within the 16:9 source
   */
  getCropCoordinates() {
    // 9:16 crop window height inside a 16:9 frame is 1.0 (at 1x zoom)
    // Width of 9:16 window relative to 16:9 frame = (9/16) / (16/9) = 81 / 256 ≈ 0.3164
    const baseW = (this.targetAspect / this.sourceAspect);
    const baseH = 1.0;

    // Apply zoom scaling (zoom reduces the crop window size to zoom in)
    const cropW = Math.max(0.1, Math.min(1.0, baseW / this.current.zoom));
    const cropH = Math.max(0.1, Math.min(1.0, baseH / this.current.zoom));

    // Center crop on panX / panY, bounded inside [0, 1]
    let cropX = this.current.panX - (cropW / 2);
    let cropY = this.current.panY - (cropH / 2);

    cropX = Math.max(0.0, Math.min(1.0 - cropW, cropX));
    cropY = Math.max(0.0, Math.min(1.0 - cropH, cropY));

    return {
      x: cropX,
      y: cropY,
      width: cropW,
      height: cropH,
      zoom: Math.round(this.current.zoom * 100) / 100,
      panX: Math.round(this.current.panX * 100) / 100,
      panY: Math.round(this.current.panY * 100) / 100
    };
  }

  /**
   * Render crop from source Canvas to target 9:16 Canvas
   */
  renderToCanvas(sourceCanvas, targetCanvas, options = {}) {
    if (!sourceCanvas || !targetCanvas) return;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const coords = this.getCropCoordinates();
    const sx = coords.x * sourceCanvas.width;
    const sy = coords.y * sourceCanvas.height;
    const sw = coords.width * sourceCanvas.width;
    const sh = coords.height * sourceCanvas.height;

    // Clear and draw cropped slice scaled to target canvas
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, targetCanvas.width, targetCanvas.height);

    // Optional debug overlay (draw rule of thirds and safe zones)
    if (options.showSafeZones) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      // Rule of thirds
      ctx.beginPath();
      ctx.moveTo(targetCanvas.width / 3, 0);
      ctx.lineTo(targetCanvas.width / 3, targetCanvas.height);
      ctx.moveTo((2 * targetCanvas.width) / 3, 0);
      ctx.lineTo((2 * targetCanvas.width) / 3, targetCanvas.height);
      ctx.moveTo(0, targetCanvas.height / 3);
      ctx.lineTo(targetCanvas.width, targetCanvas.height / 3);
      ctx.moveTo(0, (2 * targetCanvas.height) / 3);
      ctx.lineTo(targetCanvas.width, (2 * targetCanvas.height) / 3);
      ctx.stroke();
    }
  }
}
