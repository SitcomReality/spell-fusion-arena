/** 
 * VisualPreview: Creates a small, reusable visual tile that represents 
 * the aesthetic properties of a spell or element through CSS/HTML. 
 * 
 * Animations and effects are constrained to hover state to minimize 
 * performance impact when rendering many previews (element library, etc.) 
 */
export class VisualPreview {
  /** 
   * Creates a visual preview element for a spell or element.
   * @param {Object} data - Spell or Element object with color, properties, visualEffects
   * @param {Object} options - { size: 'small'|'medium'|'large', interactive: boolean }
   * @returns {HTMLElement} The preview container
   */
  static create(data, options = {}) {
    const size = options.size || 'medium';
    const interactive = options.interactive !== false;

    const container = document.createElement('div');
    container.className = `visual-preview visual-preview-${size}`;
    if (interactive) container.classList.add('visual-preview-interactive');

    // Determine visual characteristics from the data
    const visualEffects = data.visualEffects || {};
    const properties = data.properties || {};
    const color = data.color || { r: 120, g: 120, b: 120 };
    const accentColor = data.accentColor;
    const secondaryColor = data.secondaryColor;

    // Build CSS variables for this preview
    const primaryRgb = `${color.r}, ${color.g}, ${color.b}`;
    const accentRgb = accentColor ? `${accentColor.r}, ${accentColor.g}, ${accentColor.b}` : primaryRgb;
    const secondaryRgb = secondaryColor ? `${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b}` : primaryRgb;

    container.style.setProperty('--preview-primary', primaryRgb);
    container.style.setProperty('--preview-accent', accentRgb);
    container.style.setProperty('--preview-secondary', secondaryRgb);

    // Determine visual style based on effects
    const style = this.determineVisualStyle(visualEffects, properties);
    container.classList.add(`visual-preview-${style}`);

    // Build the inner structure based on style
    const inner = this.buildPreviewInner(style, visualEffects);
    container.appendChild(inner);

    return container;
  }

  /** 
   * Determines the primary visual style based on visual effects
   */
  static determineVisualStyle(visualEffects, properties) {
    // Priority: more specific effects first
    if (visualEffects.vortex || properties.vortex) return 'vortex';
    if (visualEffects.swirl || properties.spiral) return 'swirl';
    if (visualEffects.beam) return 'beam';
    if (visualEffects.wispy || properties.wave) return 'wispy';
    if (visualEffects.chaotic) return 'chaotic';
    if (properties.splitting) return 'splitting';
    if (properties.chaining) return 'chaining';
    if (properties.piercing) return 'piercing';
    if (properties.homing) return 'homing';
    if (visualEffects.shimmer) return 'shimmer';
    // Default
    return 'core';
  }

  /** 
   * Builds the inner HTML structure based on the visual style
   */
  static buildPreviewInner(style, visualEffects) {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-preview-inner';

    switch (style) {
      case 'vortex':
        return this.buildVortex(wrapper);
      case 'swirl':
        return this.buildSwirl(wrapper);
      case 'beam':
        return this.buildBeam(wrapper);
      case 'wispy':
        return this.buildWispy(wrapper);
      case 'chaotic':
        return this.buildChaotic(wrapper);
      case 'splitting':
        return this.buildSplitting(wrapper);
      case 'chaining':
        return this.buildChaining(wrapper);
      case 'piercing':
        return this.buildPiercing(wrapper);
      case 'homing':
        return this.buildHoming(wrapper);
      case 'shimmer':
        return this.buildShimmer(wrapper);
      default:
        return this.buildCore(wrapper);
    }
  }

  // Individual builder methods for each style

  static buildCore(wrapper) {
    // Simple concentric circles: primary center with accent ring
    wrapper.innerHTML = `
      <div class="preview-core-center"></div>
      <div class="preview-core-ring"></div>
    `;
    return wrapper;
  }

  static buildVortex(wrapper) {
    // Nested spinning rings pulling inward
    wrapper.innerHTML = `
      <div class="preview-vortex-outer"></div>
      <div class="preview-vortex-middle"></div>
      <div class="preview-vortex-inner"></div>
      <div class="preview-vortex-center"></div>
    `;
    return wrapper;
  }

  static buildSwirl(wrapper) {
    // Rotating curved elements around a center
    wrapper.innerHTML = `
      <div class="preview-swirl-background"></div>
      <div class="preview-swirl-element preview-swirl-1"></div>
      <div class="preview-swirl-element preview-swirl-2"></div>
      <div class="preview-swirl-element preview-swirl-3"></div>
      <div class="preview-swirl-core"></div>
    `;
    return wrapper;
  }

  static buildBeam(wrapper) {
    // Elongated shape with directional energy
    wrapper.innerHTML = `
      <div class="preview-beam-glow"></div>
      <div class="preview-beam-body"></div>
      <div class="preview-beam-core"></div>
    `;
    return wrapper;
  }

  static buildWispy(wrapper) {
    // Flowing, ethereal wisps
    wrapper.innerHTML = `
      <div class="preview-wisp preview-wisp-1"></div>
      <div class="preview-wisp preview-wisp-2"></div>
      <div class="preview-wisp preview-wisp-3"></div>
      <div class="preview-wisp-core"></div>
    `;
    return wrapper;
  }

  static buildChaotic(wrapper) {
    // Chaotic scattered particles
    wrapper.innerHTML = `
      <div class="preview-chaos-bg"></div>
      <div class="preview-chaos-particle preview-chaos-p1"></div>
      <div class="preview-chaos-particle preview-chaos-p2"></div>
      <div class="preview-chaos-particle preview-chaos-p3"></div>
      <div class="preview-chaos-particle preview-chaos-p4"></div>
      <div class="preview-chaos-core"></div>
    `;
    return wrapper;
  }

  static buildSplitting(wrapper) {
    // Central core with radiating branches
    wrapper.innerHTML = `
      <div class="preview-split-core"></div>
      <div class="preview-split-branch preview-split-up"></div>
      <div class="preview-split-branch preview-split-right"></div>
      <div class="preview-split-branch preview-split-down"></div>
      <div class="preview-split-branch preview-split-left"></div>
    `;
    return wrapper;
  }

  static buildChaining(wrapper) {
    // Connected nodes network
    wrapper.innerHTML = `
      <div class="preview-chain-node preview-chain-n1"></div>
      <div class="preview-chain-node preview-chain-n2"></div>
      <div class="preview-chain-node preview-chain-n3"></div>
      <div class="preview-chain-link preview-chain-link-12"></div>
      <div class="preview-chain-link preview-chain-link-23"></div>
      <div class="preview-chain-link preview-chain-link-13"></div>
    `;
    return wrapper;
  }

  static buildPiercing(wrapper) {
    // Focused point with trailing energy
    wrapper.innerHTML = `
      <div class="preview-pierce-trail preview-pierce-trail-1"></div>
      <div class="preview-pierce-trail preview-pierce-trail-2"></div>
      <div class="preview-pierce-trail preview-pierce-trail-3"></div>
      <div class="preview-pierce-point"></div>
    `;
    return wrapper;
  }

  static buildHoming(wrapper) {
    // Target-like concentric rings with seeking indicator
    wrapper.innerHTML = `
      <div class="preview-homing-ring preview-homing-outer"></div>
      <div class="preview-homing-ring preview-homing-middle"></div>
      <div class="preview-homing-indicator"></div>
      <div class="preview-homing-center"></div>
    `;
    return wrapper;
  }

  static buildShimmer(wrapper) {
    // Crystalline facets with shimmer
    wrapper.innerHTML = `
      <div class="preview-shimmer-facet preview-shimmer-1"></div>
      <div class="preview-shimmer-facet preview-shimmer-2"></div>
      <div class="preview-shimmer-facet preview-shimmer-3"></div>
      <div class="preview-shimmer-core"></div>
    `;
    return wrapper;
  }
}

export default VisualPreview;