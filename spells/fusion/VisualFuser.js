// Visual effects fusion extracted from SpellFusion
export const VisualFuser = {
  fuse(...visuals) {
    const vs = visuals.map(v => v || {});
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
      beam: vs.some(v => v.beam),
      swirl: vs.some(v => v.swirl),
      wispy: vs.some(v => v.wispy),
      shimmer: vs.some(v => v.shimmer),
      chaotic: vs.some(v => v.chaotic),
      sizeModifier: this.calculateSizeModifier(vs),
      shapeVariant: this.determineShapeVariant(vs)
    };
    return fused;
  },

  calculateSizeModifier(visuals) {
    let sizeSum = 0, count = 0;
    for (const v of visuals) {
      if (v && v.sizeMultiplier !== undefined) {
        sizeSum += v.sizeMultiplier;
        count++;
      }
    }
    if (count === 0) return 1.0;
    const average = sizeSum / count;
    const varietyBonus = Math.min(0.15, (visuals.length - 1) * 0.05);
    return Math.max(0.7, Math.min(1.5, average + varietyBonus));
  },

  determineShapeVariant(visuals) {
    const hasBeam = visuals.some(v => v && v.beam);
    const hasSwirl = visuals.some(v => v && v.swirl);
    const hasVortex = visuals.some(v => v && v.vortex);
    if (hasBeam) return 'elongated';
    if (hasSwirl || hasVortex) return 'swirling';
    return 'round';
  }
};

