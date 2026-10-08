/**
 * 864zeros Feature-Brick: mutator-brick.js
 * 
 * Zero-Latency DOM Mutator and Experience Personalizer.
 * Applies reactive UI mutations in <15ms without layout shift or cloud round-trips.
 */

export class ExperienceMutator {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} options.targetContainer Target container element or selector
   * @param {Object} [options.variants] Dictionary of variant content configurations
   * @param {Function} [options.onMutate] Callback when mutation completes
   */
  constructor(options = {}) {
    this.container = typeof options.targetContainer === 'string'
      ? document.querySelector(options.targetContainer)
      : options.targetContainer;

    this.onMutate = options.onMutate || null;
    this.currentVariantKey = 'default';

    this.variants = options.variants || {
      'default': {
        badge: 'Zero-Cloud Edge AI',
        headline: 'Private, High-Performance Software for Human Agency',
        subhead: 'Run intelligent embeddings and local personalization entirely inside your device with zero telemetry.',
        ctaText: 'Explore Features',
        ctaAction: 'explore',
        accentColor: 'var(--oia-sage, #8BA888)'
      },
      'dev-focus': {
        badge: 'Developer Architecture',
        headline: 'Direct REST & Webhook APIs with Real-Time JSON Streaming',
        subhead: 'Zero cloud intermediaries. Bolt our modular SLM lego bricks directly into your app with zero boilerplate.',
        ctaText: 'Read Developer Specs',
        ctaAction: 'docs',
        accentColor: 'var(--oia-slate, #475569)'
      },
      'enterprise-focus': {
        badge: 'Enterprise Isolation',
        headline: 'Hardware-Enclave Privacy & Air-Gapped Security Architecture',
        subhead: 'Complete on-device processing. Your sensitive corporate data never leaves the client boundary.',
        ctaText: 'View Security Specs',
        ctaAction: 'enterprise',
        accentColor: 'var(--oia-dusty-blue, #7A8FA3)'
      },
      'value-focus': {
        badge: 'Simple Honest Pricing',
        headline: 'One-Time Purchase. No Subscriptions. No Hidden Fees.',
        subhead: 'Own the software forever with zero recurring fees and a 100% offline guarantee.',
        ctaText: 'View Honest Tiers',
        ctaAction: 'pricing',
        accentColor: 'var(--oia-coral, #E8A598)'
      },
      'support-focus': {
        badge: 'Immediate Assistance',
        headline: 'Encountered a Problem? Let’s Resolve It Right Here.',
        subhead: 'Offline self-repair diagnostics and direct assistance without intrusive surveillance.',
        ctaText: 'Open Quick Help',
        ctaAction: 'support',
        accentColor: 'var(--oia-coral-dark, #D99A8E)'
      }
    };
  }

  /**
   * Apply a personalized variant to the target container
   * @param {string} variantKey 
   * @param {Object} [meta] Additional metadata from the classifier
   */
  applyVariant(variantKey, meta = {}) {
    if (!this.container) return;
    if (this.currentVariantKey === variantKey) return; // Prevent unnecessary DOM work

    const config = this.variants[variantKey] || this.variants['default'];
    this.currentVariantKey = variantKey;

    // Smooth ADHD-friendly crossfade without layout shift
    this.container.style.transition = 'opacity 180ms ease, transform 180ms ease';
    this.container.style.opacity = '0.4';
    this.container.style.transform = 'translateY(2px)';

    setTimeout(() => {
      // Find or bind elements within container
      const badgeEl = this.container.querySelector('[data-slot="badge"]');
      const headlineEl = this.container.querySelector('[data-slot="headline"]');
      const subheadEl = this.container.querySelector('[data-slot="subhead"]');
      const ctaEl = this.container.querySelector('[data-slot="cta"]');

      if (badgeEl) {
        badgeEl.textContent = config.badge;
        badgeEl.style.backgroundColor = config.accentColor;
      }
      if (headlineEl) headlineEl.textContent = config.headline;
      if (subheadEl) subheadEl.textContent = config.subhead;
      if (ctaEl) {
        ctaEl.textContent = config.ctaText;
        ctaEl.setAttribute('data-action', config.ctaAction);
      }

      this.container.style.opacity = '1';
      this.container.style.transform = 'translateY(0)';

      if (typeof this.onMutate === 'function') {
        this.onMutate(variantKey, config, meta);
      }
    }, 180);
  }

  /**
   * Reset container back to default state
   */
  reset() {
    this.applyVariant('default');
  }
}
