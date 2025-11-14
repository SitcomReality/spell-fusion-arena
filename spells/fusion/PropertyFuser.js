// Property fusion logic extracted from SpellFusion
export const PropertyFuser = {
  fuse(...elements) {
    const propertyScores = {};
    const numElements = elements.length;
    let totalDamage = 0;
    let totalSpeed = 0;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const positionMultiplier = 1.0 / (1 + i * 0.35);

      // ANALYZE PROPERTY COUNT (ignore damage/speed which are handled separately)
      const genes = element.propertyGenes || {};
      const propKeys = Object.keys(genes).filter(k => k !== 'damage' && k !== 'speed');
      const propertyCount = propKeys.length;

      // CALCULATE FOCUS MULTIPLIER: fewer properties -> larger multiplier
      // 1 + (4 - propertyCount) * 0.25 produces +0.75 at 1 prop, 0 at 4+ props
      const focusMultiplier = 1 + Math.max(0, (4 - propertyCount)) * 0.25;

      for (const [property, value] of Object.entries(element.propertyGenes || {})) {
        if (property === 'damage') {
          totalDamage += value * (i === 0 ? 1 : 0.6);
          continue;
        }
        if (property === 'speed') {
          totalSpeed += value;
          continue;
        }
        // Accumulate other properties normally (ignore vortex/repulsion entirely)
        if (property === 'vortex' || property === 'repulsion') {
          continue;
        }
        // Apply both position-based weighting and focused-contribution multiplier
        propertyScores[property] = (propertyScores[property] || 0) + value * positionMultiplier * focusMultiplier;
      }
    }

    const finalProperties = {
      damage: (totalDamage / Math.max(1, numElements)) + (elements.reduce((s, e) => s + (e.propertyGenes.damage || 0), 0) * 0.1),
      speed: totalSpeed / Math.max(1, numElements)
    };

    // Convert accumulated scores into final property potency
    for (const [property, score] of Object.entries(propertyScores)) {
      if (score > 0) {
        // Increased divisor to compensate for focused amplification; keeps values in reasonable range.
        const potency = score / 14;
        // Apply mild non-linearity to avoid extreme spikes: use sqrt on potency then preserve sign
        const adjusted = Math.sign(potency) * Math.sqrt(Math.abs(potency));
        finalProperties[property] = Math.round(adjusted * 100) / 100;
      }
    }

    return finalProperties;
  }
};