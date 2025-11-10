export const RARE_ELEMENTS = {
  void: {
    name: 'Void',
    color: { r: 50, g: 30, b: 80 },
    propertyGenes: {
      speed: 200,
      damage: 30,
      vortex: 6,
      aoe: 6,
      piercing: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 10,
      trailSize: 2,
      aura: true,
      auraSize: 38,
      auraIntensity: 0.7,
      impactParticles: 32,
      impactType: 'swirl',
      vortex: true,
      pullParticles: true,
      sizeMultiplier: 1.2
    },
    rarity: 'rare'
  },

  chaos: {
    name: 'Chaos',
    color: { r: 255, g: 80, b: 200 },
    propertyGenes: {
      speed: 290,
      damage: 25,
      chaining: 4,
      dot: 3,
      knockback: 5,
      repulsion: 2,
      wave: 4
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 12,
      trailSize: 4,
      aura: true,
      auraSize: 30,
      auraIntensity: 0.85,
      impactParticles: 38,
      impactType: 'spark',
      chaotic: true,
      randomColors: true,
      sizeMultiplier: 1.08
    },
    rarity: 'rare'
  },

  abyss: {
    name: 'Abyss',
    color: { r: 40, g: 80, b: 160 },
    propertyGenes: {
      speed: 210,
      damage: 32,
      homing: 7,
      wave: 5,
      piercing: 3
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 9,
      trailSize: 3,
      aura: true,
      auraSize: 28,
      auraIntensity: 0.6,
      impactParticles: 24,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 1.02
    },
    rarity: 'rare'
  },

  eruption: {
    name: 'Eruption',
    color: { r: 255, g: 100, b: 20 },
    propertyGenes: {
      speed: 270,
      damage: 33,
      knockback: 6,
      aoe: 5,
      splitting: 2,
      repulsion: 3
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 8,
      trailSize: 5,
      aura: true,
      auraSize: 26,
      auraIntensity: 0.75,
      impactParticles: 32,
      impactType: 'spark',
      beam: true,
      sizeMultiplier: 1.15
    },
    rarity: 'rare'
  },

  crystal: {
    name: 'Crystal',
    color: { r: 180, g: 240, b: 255 },
    propertyGenes: {
      speed: 220,
      damage: 18,
      piercing: 4,
      splitting: 4,
      aoe: 3
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 6,
      trailSize: 3,
      aura: true,
      auraSize: 22,
      auraIntensity: 0.6,
      impactParticles: 24,
      impactType: 'spark',
      shimmer: true,
      sizeMultiplier: 0.98
    },
    rarity: 'rare'
  },

  electrum: {
    name: 'Electrum',
    color: { r: 255, g: 200, b: 50 },
    propertyGenes: {
      speed: 340,
      damage: 18,
      chaining: 6,
      homing: 5,
      wave: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'beam',
      trailDensity: 9,
      trailSize: 2,
      aura: true,
      auraSize: 25,
      auraIntensity: 0.65,
      impactParticles: 18,
      impactType: 'spark',
      crackle: true,
      sizeMultiplier: 0.92
    },
    rarity: 'rare'
  },

  entropy: {
    name: 'Entropy',
    color: { r: 120, g: 60, b: 120 },
    propertyGenes: { speed: 210, damage: 28, vortex: 4, wave: 6, dot: 4, splitting: 2, spiral: 4 },
    visualEffects: { trail: true, trailType: 'smoke', trailDensity: 9, trailSize: 3, aura: true, auraSize: 30, auraIntensity: 0.65, impactParticles: 28, impactType: 'swirl', wispy: true, vortex: true, sizeMultiplier: 1.08 },
    rarity: 'rare'
  },

  singularity: {
    name: 'Singularity',
    color: { r: 30, g: 30, b: 50 },
    propertyGenes: { speed: 180, damage: 34, vortex: 8, aoe: 8, homing: 2, piercing: 4, spiral: 8 },
    visualEffects: { trail: true, trailType: 'swirl', trailDensity: 12, trailSize: 3, aura: true, auraSize: 42, auraIntensity: 0.8, impactParticles: 36, impactType: 'swirl', vortex: true, pullParticles: true, sizeMultiplier: 1.25 },
    rarity: 'rare'
  },

  time: {
    name: 'Time',
    color: { r: 220, g: 180, b: 100 },
    propertyGenes: { speed: 270, damage: 20, homing: 5, slowing: 7, wave: 5, spiral: 5 },
    visualEffects: { trail: true, trailType: 'swirl', trailDensity: 8, trailSize: 2, aura: true, auraSize: 26, auraIntensity: 0.6, impactParticles: 20, impactType: 'spark', swirl: true, sizeMultiplier: 1.0 },
    rarity: 'rare'
  },

  melody: {
    name: 'Melody',
    color: { r: 200, g: 100, b: 200 },
    propertyGenes: { speed: 260, damage: 16, chaining: 8, wave: 6, aoe: 5, piercing: 2, spiral: 5 },
    visualEffects: { trail: true, trailType: 'swirl', trailDensity: 10, trailSize: 2, aura: true, auraSize: 28, auraIntensity: 0.7, impactParticles: 24, impactType: 'swirl', swirl: true, sizeMultiplier: 0.98 },
    rarity: 'rare'
  }
};

export default RARE_ELEMENTS;