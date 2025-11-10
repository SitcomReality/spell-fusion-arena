export const EXTRA_UNCOMMON_ELEMENTS = {
  lunar: {
    name: 'Lunar',
    color: { r: 200, g: 220, b: 240 },
    propertyGenes: {
      speed: 200,
      damage: 16,
      homing: 4,
      slowing: 4,
      wave: 3,
      spiral: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'trail',
      trailDensity: 6,
      trailSize: 2,
      aura: true,
      auraSize: 28,
      auraIntensity: 0.45,
      impactParticles: 16,
      impactType: 'spark',
      wispy: true,
      sizeMultiplier: 0.95
    },
    rarity: 'uncommon'
  },

  solar: {
    name: 'Solar',
    color: { r: 255, g: 180, b: 60 },
    propertyGenes: {
      speed: 300,
      damage: 28,
      aoe: 6,
      dot: 5,
      piercing: 3,
      spiral: 1
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 7,
      trailSize: 4,
      aura: true,
      auraSize: 32,
      auraIntensity: 0.8,
      impactParticles: 28,
      impactType: 'spark',
      beam: true,
      sizeMultiplier: 1.1
    },
    rarity: 'uncommon'
  },

  love: {
    name: 'Love',
    color: { r: 255, g: 150, b: 180 },
    propertyGenes: {
      speed: 250,
      damage: 12,
      chaining: 7,
      lifesteal: 6,
      vortex: 8,
      aoe: 2,
      spiral: 2,
      wave: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 8,
      trailSize: 2,
      aura: true,
      auraSize: 24,
      auraIntensity: 0.5,
      impactParticles: 20,
      impactType: 'swirl',
      swirl: true,
      sizeMultiplier: 0.98
    },
    rarity: 'uncommon'
  },

  hate: {
    name: 'Hate',
    color: { r: 100, g: 20, b: 40 },
    propertyGenes: {
      speed: 280,
      damage: 31,
      repulsion: 8,
      splitting: 5,
      knockback: 4,
      spiral: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 10,
      trailSize: 3,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.7,
      impactParticles: 26,
      impactType: 'spark',
      chaotic: true,
      sizeMultiplier: 1.05
    },
    rarity: 'uncommon'
  },

  glitch: {
    name: 'Glitch',
    color: { r: 150, g: 255, b: 200 },
    propertyGenes: {
      speed: 310,
      damage: 19,
      chaining: 3,
      homing: 3,
      wave: 4,
      knockback: 2,
      piercing: 2,
      spiral: 5
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 11,
      trailSize: 2,
      aura: true,
      auraSize: 18,
      auraIntensity: 0.6,
      impactParticles: 22,
      impactType: 'spark',
      chaotic: true,
      randomColors: true,
      sizeMultiplier: 0.9
    },
    rarity: 'uncommon'
  },

  mercury: {
    name: 'Mercury',
    color: { r: 200, g: 200, b: 200 },
    propertyGenes: {
      speed: 320,
      damage: 17,
      homing: 6,
      wave: 3,
      piercing: 3,
      slowing: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 7,
      trailSize: 2,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.4,
      impactParticles: 18,
      impactType: 'swirl',
      shimmer: true,
      sizeMultiplier: 0.92
    },
    rarity: 'uncommon'
  },

  toenail: {
    name: 'Toenail',
    color: { r: 180, g: 160, b: 140 },
    propertyGenes: {
      speed: 130,
      damage: 36,
      knockback: 9,
      aoe: 6,
      piercing: 4
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 3,
      trailSize: 6,
      aura: false,
      impactParticles: 32,
      impactType: 'smoke',
      shake: true,
      sizeMultiplier: 1.35
    },
    rarity: 'uncommon'
  }
};

export default EXTRA_UNCOMMON_ELEMENTS;

