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
    
    // Core stats (damage, speed) are handled separately for clarity
    let totalDamage = 0;
    let totalSpeed = 0;

    // 1. Sum up property contributions from all elements
    // The first element has the most impact, subsequent ones have diminishing contributions
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // Earlier elements have a higher weight. 1st: 1.0, 2nd: 0.75, 3rd: 0.6, 4th: 0.5
      const positionMultiplier = 1.0 / (1 + i * 0.35);

      for (const [property, value] of Object.entries(element.propertyGenes || {})) {
        if (property === 'damage') {
          totalDamage += value * (i === 0 ? 1 : 0.6); // Base damage is mostly from the first element
          continue;
        }
        if (property === 'speed') {
          totalSpeed += value; // Speed is averaged later
          continue;
        }

        if (!propertyScores[property]) {
          propertyScores[property] = 0;
        }
        propertyScores[property] += value * positionMultiplier;
      }
    }
    
    // 2. Calculate final property values without a binary threshold
    const finalProperties = {
      // Base damage is the average, with a boost from the sum of genes
      damage: (totalDamage / numElements) + (elements.reduce((s, e) => s + (e.propertyGenes.damage || 0), 0) * 0.1),
      speed: totalSpeed / numElements,
    };
    
    for (const [property, score] of Object.entries(propertyScores)) {
      if (score > 0) {
        // The "potency" of a property is its calculated score divided by a balancing factor.
        // This yields values typically between 0.1 and 1.5, representing weak to strong effects.
        // A divisor of 12 provides a good range for current gene values (which are ~1-10).
        // This allows projectile mechanics to use this value as a multiplier for things like
        // knockback force, slow duration, AOE radius, or chance to split.
        const potency = score / 12;
        finalProperties[property] = Math.round(potency * 100) / 100; // round to 2 decimal places
      }
    }
    
    return finalProperties;
  }

  static fuseVisualEffects(...visuals) {
    // Normalize inputs: ensure every entry is an object to avoid undefined property access
    const vs = visuals.map(v => v || {});
    
    // Combine visual effects from all elements (using normalized array)
    const fused = {
      trail: vs.some(v => v.trail),
      trailType: (vs.find(v => v.trail) || {}).trailType || 'trail',
      trailDensity: Math.floor(vs.reduce((sum, v) => sum + (v.trailDensity || 0), 0) / Math.max(1, vs.length)),
      trailSize: Math.floor(vs.reduce((sum, v) => sum + (v.trailSize || 0), 0) / Math.max(1, vs.length)),
      aura: vs.some(v => v.aura),
      auraSize: Math.floor(vs.reduce((sum, v) => sum + (v.auraSize || 0), 0) / Math.max(1, vs.length)),
      auraIntensity: vs.reduce((sum, v) => sum + (v.auraIntensity || 0), 0) / Math.max(1, vs.length),
      impactParticles: Math.floor(vs.reduce((sum, v) => sum + (v.impactParticles || 0), 0) / Math.max(1, vs.length)),
      impactType: (vs[0] && vs[0].impactType) || 'spark',
      
      // Special effects - combine from all elements
      beam: vs.some(v => v.beam),
      swirl: vs.some(v => v.swirl),
      vortex: vs.some(v => v.vortex),
      wispy: vs.some(v => v.wispy),
      shimmer: vs.some(v => v.shimmer),
      chaotic: vs.some(v => v.chaotic),
      pullParticles: vs.some(v => v.pullParticles)
    };
     
    return fused;
  }
}