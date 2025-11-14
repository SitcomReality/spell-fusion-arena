/**
 * VisualFuser: Orchestrates visual effect generation for fused spells
 * Uses the full element objects and delegates to VisualEffectGenerator
 */

import VisualEffectGenerator from './VisualEffectGenerator.js';

export const VisualFuser = {
  /**
   * Fuse visual effects from multiple elements
   * @param {...Object} elements - Full element objects to fuse
   * @returns {Object} Complete visual effects configuration
   */
  fuse(...elements) {
    if (!elements || elements.length === 0) {
      return this.getDefaultVisuals();
    }

    // Filter out null/undefined elements
    const validElements = elements.filter(e => e && typeof e === 'object');
    
    if (validElements.length === 0) {
      return this.getDefaultVisuals();
    }

    // Calculate merged properties from all elements
    const mergedProperties = this.mergeProperties(validElements);
    
    // Generate comprehensive visual effects using the new generator
    const generatedEffects = VisualEffectGenerator.generate(validElements, mergedProperties);
    
    // Merge with any legacy visual genes for backward compatibility
    return {
      ...this.legacyEffectsFromElements(validElements),
      ...generatedEffects
    };
  },

  /**
   * Merge property genes from all elements
   */
  mergeProperties(elements) {
    const merged = {};
    
    for (const element of elements) {
      const genes = element.propertyGenes || {};
      for (const [key, value] of Object.entries(genes)) {
        if (key !== 'damage' && key !== 'speed') {
          merged[key] = (merged[key] || 0) + value;
        }
      }
    }
    
    return merged;
  },

  /**
   * Extract legacy visual effects from elements for backward compatibility
   */
  legacyEffectsFromElements(elements) {
    const legacyFusion = {
      trailDensity: 0,
      trailSize: 0,
      auraSize: 0,
      auraIntensity: 0,
      impactParticles: 0,
      swirl: false,
      wispy: false,
      shimmer: false,
      chaotic: false,
      beam: false
    };

    for (const el of elements) {
      const vis = el.visualEffects || {};
      legacyFusion.trailDensity += (vis.trailDensity || 0);
      legacyFusion.trailSize += (vis.trailSize || 0);
      legacyFusion.auraSize += (vis.auraSize || 0);
      legacyFusion.auraIntensity += (vis.auraIntensity || 0);
      legacyFusion.impactParticles += (vis.impactParticles || 0);
      if (vis.swirl) legacyFusion.swirl = true;
      if (vis.wispy) legacyFusion.wispy = true;
      if (vis.shimmer) legacyFusion.shimmer = true;
      if (vis.chaotic) legacyFusion.chaotic = true;
      if (vis.beam) legacyFusion.beam = true;
    }

    const count = elements.length;
    return {
      trailDensity: Math.round(legacyFusion.trailDensity / count),
      trailSize: Math.round(legacyFusion.trailSize / count),
      auraSize: Math.round(legacyFusion.auraSize / count),
      auraIntensity: legacyFusion.auraIntensity / count,
      impactParticles: Math.round(legacyFusion.impactParticles / count),
      swirl: legacyFusion.swirl,
      wispy: legacyFusion.wispy,
      shimmer: legacyFusion.shimmer,
      chaotic: legacyFusion.chaotic,
      beam: legacyFusion.beam
    };
  },

  /**
   * Default visuals for when no valid elements provided
   */
  getDefaultVisuals() {
    return {
      trail: true,
      trailType: 'spark',
      trailDensity: 5,
      trailSize: 2,
      aura: true,
      auraSize: 25,
      auraIntensity: 0.5,
      impactParticles: 20,
      impactType: 'spark',
      shapeVariant: 'sphere',
      sizeMultiplier: 1.0,
      visibilityTier: 'basic',
      particleTextureLevel: 'common'
    };
  }
};

export default VisualFuser;

