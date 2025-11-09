// Property fusion logic extracted from SpellFusion
export const PropertyFuser = {
  fuse(...elements) {
    const propertyScores = {};
    const numElements = elements.length;
    let totalDamage = 0;
    let totalSpeed = 0;
    let totalVortex = 0;
    let totalRepulsion = 0;
    let vortexGeneticWeight = 0;
    let repulsionGeneticWeight = 0;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const positionMultiplier = 1.0 / (1 + i * 0.35);
      
      // Get genetic propensities (default to 0 if not defined)
      const vortexProp = element.vortexPropensity || 0;
      const repulsionProp = element.repulsionPropensity || 0;
      
      for (const [property, value] of Object.entries(element.propertyGenes || {})) {
        if (property === 'damage') {
          totalDamage += value * (i === 0 ? 1 : 0.6);
          continue;
        }
        if (property === 'speed') {
          totalSpeed += value;
          continue;
        }
        if (property === 'vortex') {
          // Weight vortex value by genetic propensity and position
          totalVortex += value * positionMultiplier * (1 + vortexProp);
          vortexGeneticWeight += vortexProp * positionMultiplier;
          continue;
        }
        if (property === 'repulsion') {
          // Weight repulsion value by genetic propensity and position
          totalRepulsion += value * positionMultiplier * (1 + repulsionProp);
          repulsionGeneticWeight += repulsionProp * positionMultiplier;
          continue;
        }
        propertyScores[property] = (propertyScores[property] || 0) + value * positionMultiplier;
      }
    }

    const finalProperties = {
      damage: (totalDamage / Math.max(1, numElements)) + (elements.reduce((s, e) => s + (e.propertyGenes.damage || 0), 0) * 0.1),
      speed: totalSpeed / Math.max(1, numElements)
    };

    // Handle vortex vs repulsion: they cancel each other out, genetic propensity can override raw value
    // The element with stronger genetic weighting wins, breaking ties by value
    const vortexScore = totalVortex + vortexGeneticWeight * 5; // genetic boost
    const repulsionScore = totalRepulsion + repulsionGeneticWeight * 5;
    
    if (vortexScore > repulsionScore && vortexScore > 0) {
      finalProperties.vortex = Math.round((vortexScore / (numElements * 12)) * 100) / 100;
    } else if (repulsionScore > vortexScore && repulsionScore > 0) {
      finalProperties.repulsion = Math.round((repulsionScore / (numElements * 12)) * 100) / 100;
    }

    for (const [property, score] of Object.entries(propertyScores)) {
      if (score > 0) {
        const potency = score / 12;
        finalProperties[property] = Math.round(potency * 100) / 100;
      }
    }

    return finalProperties;
  }
};