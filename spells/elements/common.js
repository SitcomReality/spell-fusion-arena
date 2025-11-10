export const COMMON_ELEMENTS = {
  fire: {
    name: 'Fire',
    color: { r: 255, g: 100, b: 50 },
    propertyGenes: {
      speed: 280,
      damage: 20,
      dot: 8,
      chaining: 4
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 4,
      trailSize: 4,
      aura: true,
      auraSize: 18,
      auraIntensity: 0.5,
      impactParticles: 20,
      impactType: 'spark',
      sizeMultiplier: 1.0
    },
    rarity: 'common'
  },

  frost: {
    name: 'Frost',
    color: { r: 120, g: 220, b: 255 },
    propertyGenes: {
      speed: 240,
      damage: 18,
      slowing: 7,
      piercing: 5,
      aoe: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'trail',
      trailDensity: 5,
      trailSize: 3,
      aura: false,
      impactParticles: 18,
      impactType: 'spark',
      ambientParticles: true,
      ambientType: 'glow',
      sizeMultiplier: 0.95
    },
    rarity: 'common'
  },

  stone: {
    name: 'Stone',
    color: { r: 130, g: 110, b: 60 },
    propertyGenes: {
      speed: 140,
      damage: 35,
      knockback: 8,
      aoe: 8,
      piercing: 1
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 2,
      trailSize: 7,
      aura: false,
      impactParticles: 35,
      impactType: 'smoke',
      shake: true,
      sizeMultiplier: 1.4
    },
    rarity: 'common'
  },

  nature: {
    name: 'Nature',
    color: { r: 100, g: 220, b: 100 },
    propertyGenes: {
      speed: 220,
      damage: 14,
      slowing: 6,
      dot: 4,
      aoe: 4,
      wave: 3
    },
    visualEffects: {
      trail: true,
      trailType: 'aura',
      trailDensity: 5,
      trailSize: 3,
      aura: true,
      auraSize: 24,
      auraIntensity: 0.4,
      impactParticles: 22,
      impactType: 'aura',
      growth: true,
      sizeMultiplier: 1.05
    },
    rarity: 'common'
  },

  wind: {
    name: 'Wind',
    color: { r: 200, g: 245, b: 255 },
    propertyGenes: {
      speed: 360,
      damage: 12,
      piercing: 4,
      knockback: 4,
      homing: 2,
      spiral: 6
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 8,
      trailSize: 2,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.25,
      impactParticles: 14,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 0.85
    },
    rarity: 'common'
  }
};

export default COMMON_ELEMENTS;

