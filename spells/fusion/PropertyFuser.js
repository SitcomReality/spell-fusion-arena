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
        propertyScores[property] = (propertyScores[property] || 0) + value * positionMultiplier;
      }
    }

    const finalProperties = {
      damage: (totalDamage / Math.max(1, numElements)) + (elements.reduce((s, e) => s + (e.propertyGenes.damage || 0), 0) * 0.1),
      speed: totalSpeed / Math.max(1, numElements)
    };

    // Convert accumulated scores into final property potency
    for (const [property, score] of Object.entries(propertyScores)) {
      if (score > 0) {
        const potency = score / 12;
        finalProperties[property] = Math.round(potency * 100) / 100;
      }
    }

    return finalProperties;
  }
};