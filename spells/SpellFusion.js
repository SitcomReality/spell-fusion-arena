import { PROPERTY_TYPES } from './Element.js';

export class SpellFusion {
  static fuse(...elements) {
    const blendedColor = this.blendColors(...elements.map(e => e.color));
    const fusedProperties = this.fuseProperties(...elements);
    const fusedVisuals = this.fuseVisualEffects(...elements.map(e => e.visualEffects));
    
    return {
      name: elements.map(e => e.name).join('-'),
      color: blendedColor,
      visualEffects: fusedVisuals,
      properties: fusedProperties,
      elements: elements
    };
  }
  
  static blendColors(...colors) {
    return {
      r: Math.floor(colors.reduce((sum, c) => sum + c.r, 0) / colors.length),
      g: Math.floor(colors.reduce((sum, c) => sum + c.g, 0) / colors.length),
      b: Math.floor(colors.reduce((sum, c) => sum + c.b, 0) / colors.length)
    };
  }
  
  static fuseTraits(...traits) {
    const avgSpeed = traits.reduce((sum, t) => sum + t.speed, 0) / traits.length;
    const avgDamage = traits.reduce((sum, t) => sum + t.damage, 0) / traits.length;
    
    // Pick random projectile type from the elements
    const projectileType = traits[Math.floor(Math.random() * traits.length)].projectileType;
    
    return {
      speed: avgSpeed,
      damage: avgDamage,
      projectileType: projectileType,
      particleShape: traits[0].particleShape,
      secondaryShape: traits[1]?.particleShape,
      destructionType: traits[0].destructionType,
      secondaryDestruction: traits[1]?.destructionType
    };
  }

  static fuseProperties(...elements) {
    const propertyScores = {};
    const numElements = elements.length;
    
    // Core stats that are averaged, not thresholded
    let totalDamage = 0;
    let totalSpeed = 0;

    // Base threshold: harder to get properties with fewer elements
    const baseThreshold = numElements === 1 ? 4 : numElements === 2 ? 6 : 5;
    
    // Sum up property contributions in order
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const positionMultiplier = 1 - (i * 0.1); // Earlier elements contribute more
      
      for (const [property, value] of Object.entries(element.propertyGenes || {})) {
        if (property === 'damage') {
          totalDamage += value;
          continue;
        }
        if (property === 'speed') {
          totalSpeed += value;
          continue;
        }

        if (!propertyScores[property]) {
          propertyScores[property] = 0;
        }
        propertyScores[property] += value * positionMultiplier;
      }
    }
    
    // Determine which properties activate based on thresholds
    // First property has lower threshold, subsequent ones need more
    const activeProperties = {
      damage: totalDamage / numElements,
      speed: totalSpeed / numElements,
    };

    const sortedProperties = Object.entries(propertyScores)
      .sort((a, b) => b[1] - a[1]); // Sort by score descending
    
    for (let i = 0; i < sortedProperties.length; i++) {
      const [property, score] = sortedProperties[i];
      // Threshold increases for each additional property
      const threshold = baseThreshold + (i * 1.5);
      
      if (score >= threshold) {
        // Normalize score to intensity (0-1)
        activeProperties[property] = Math.min(1, score / (threshold + 5));
      }
    }
    
    return activeProperties;
  }

  static fuseVisualEffects(...visuals) {
    // Combine visual effects from all elements
    const fused = {
      trail: visuals.some(v => v.trail),
      trailType: visuals.find(v => v.trail)?.trailType || 'trail',
      trailDensity: Math.floor(visuals.reduce((sum, v) => sum + (v.trailDensity || 0), 0) / visuals.length),
      trailSize: Math.floor(visuals.reduce((sum, v) => sum + (v.trailSize || 0), 0) / visuals.length),
      aura: visuals.some(v => v.aura),
      auraSize: Math.floor(visuals.reduce((sum, v) => sum + (v.auraSize || 0), 0) / visuals.length),
      auraIntensity: visuals.reduce((sum, v) => sum + (v.auraIntensity || 0), 0) / visuals.length,
      impactParticles: Math.floor(visuals.reduce((sum, v) => sum + (v.impactParticles || 0), 0) / visuals.length),
      impactType: visuals[0]?.impactType || 'spark',
      
      // Special effects - combine from all elements
      beam: visuals.some(v => v.beam),
      swirl: visuals.some(v => v.swirl),
      vortex: visuals.some(v => v.vortex),
      wispy: visuals.some(v => v.wispy),
      shimmer: visuals.some(v => v.shimmer),
      chaotic: visuals.some(v => v.chaotic),
      pullParticles: visuals.some(v => v.pullParticles)
    };
    
    return fused;
  }
}