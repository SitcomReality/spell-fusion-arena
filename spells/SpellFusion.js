export class SpellFusion {
  static fuse(...elements) {
    const blendedColor = this.blendColors(...elements.map(e => e.color));
    const fusedTraits = this.fuseTraits(...elements.map(e => e.traits));
    const fusedVisuals = this.fuseVisualEffects(...elements.map(e => e.visualEffects));
    
    return {
      name: elements.map(e => e.name).join('-'),
      color: blendedColor,
      traits: fusedTraits,
      visualEffects: fusedVisuals,
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

