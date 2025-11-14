export const COMMON_ELEMENTS = {
  fire: {
    name: 'Fire',
    color: { r: 255, g: 120, b: 40 },
    secondaryColor: { r: 255, g: 180, b: 80 },
    accentColor: { r: 255, g: 200, b: 100 },
    propertyGenes: {
      speed: 260,
      damage: 24,
      dot: 5,
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
      sizeMultiplier: 1.05,
    },
    rarity: 'common'
  },

  earth: {
    name: 'Earth',
    color: { r: 160, g: 120, b: 80 },
    secondaryColor: { r: 140, g: 100, b: 60 },
    accentColor: { r: 180, g: 140, b: 100 },
    propertyGenes: {
      speed: 150,
      damage: 32,
      knockback: 4,
      aoe: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 3,
      trailSize: 4,
      aura: false,
      impactParticles: 28,
      impactType: 'smoke',
      sizeMultiplier: 1.15,
    },
    rarity: 'common'
  },

  wind: {
    name: 'Wind',
    color: { r: 200, g: 230, b: 240 },
    secondaryColor: { r: 220, g: 245, b: 255 },
    accentColor: { r: 180, g: 220, b: 255 },
    propertyGenes: {
      speed: 300,
      piercing: 3,
      knockback: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 5,
      trailSize: 2,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.35,
      impactParticles: 16,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 0.9,
    },
    rarity: 'common'
  },

  metal: {
    name: 'Metal',
    color: { r: 180, g: 180, b: 200 },
    secondaryColor: { r: 160, g: 160, b: 180 },
    accentColor: { r: 200, g: 200, b: 220 },
    propertyGenes: {
      speed: 200,
      damage: 26,
      piercing: 4,
      chaining: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 4,
      trailSize: 2,
      aura: false,
      impactParticles: 18,
      impactType: 'spark',
      shimmer: true,
      sizeMultiplier: 1.0,
    },
    rarity: 'common'
  },

  light: {
    name: 'Light',
    color: { r: 255, g: 250, b: 150 },
    secondaryColor: { r: 255, g: 255, b: 180 },
    accentColor: { r: 255, g: 240, b: 80 },
    propertyGenes: {
      speed: 280,
      damage: 20,
      piercing: 5,
      chaining: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'beam',
      trailDensity: 7,
      trailSize: 2,
      aura: true,
      auraSize: 26,
      auraIntensity: 0.65,
      impactParticles: 20,
      impactType: 'spark',
      beam: true,
      sizeMultiplier: 0.95,
    },
    rarity: 'common'
  },

  dark: {
    name: 'Dark',
    color: { r: 80, g: 70, b: 100 },
    secondaryColor: { r: 60, g: 50, b: 80 },
    accentColor: { r: 120, g: 100, b: 150 },
    propertyGenes: {
      speed: 220,
      damage: 22,
      homing: 4,
      dot: 3,
      piercing: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 4,
      trailSize: 3,
      aura: true,
      auraSize: 18,
      auraIntensity: 0.5,
      impactParticles: 22,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 1.0,
    },
    rarity: 'common'
  },

  sound: {
    name: 'Sound',
    color: { r: 200, g: 140, b: 180 },
    secondaryColor: { r: 220, g: 160, b: 200 },
    accentColor: { r: 240, g: 180, b: 220 },
    propertyGenes: {
      speed: 240,
      chaining: 5,
      wave: 4,
      aoe: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 6,
      trailSize: 2,
      aura: true,
      auraSize: 24,
      auraIntensity: 0.55,
      impactParticles: 18,
      impactType: 'swirl',
      swirl: true,
      sizeMultiplier: 0.98,
    },
    rarity: 'common'
  },

  glass: {
    name: 'Glass',
    color: { r: 180, g: 220, b: 255 },
    secondaryColor: { r: 200, g: 235, b: 255 },
    accentColor: { r: 150, g: 200, b: 255 },
    propertyGenes: {
      speed: 270,
      piercing: 6,
      splitting: 3,
      wave: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'beam',
      trailDensity: 5,
      trailSize: 2,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.45,
      impactParticles: 24,
      impactType: 'spark',
      shimmer: true,
      sizeMultiplier: 0.92,
    },
    rarity: 'common'
  },

  charcoal: {
    name: 'Charcoal',
    color: { r: 60, g: 50, b: 40 },
    secondaryColor: { r: 80, g: 70, b: 60 },
    accentColor: { r: 100, g: 80, b: 60 },
    propertyGenes: {
      speed: 180,
      damage: 28,
      dot: 4,
      slowing: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 5,
      trailSize: 3,
      aura: false,
      impactParticles: 20,
      impactType: 'smoke',
      sizeMultiplier: 1.08,
    },
    rarity: 'common'
  },

  moss: {
    name: 'Moss',
    color: { r: 120, g: 150, b: 90 },
    secondaryColor: { r: 140, g: 170, b: 110 },
    accentColor: { r: 100, g: 130, b: 70 },
    propertyGenes: {
      speed: 170,
      damage: 16,
      slowing: 5,
      aoe: 4,
      dot: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'aura',
      trailDensity: 4,
      trailSize: 2,
      aura: true,
      auraSize: 22,
      auraIntensity: 0.4,
      impactParticles: 16,
      impactType: 'aura',
      sizeMultiplier: 0.95,
    },
    rarity: 'common'
  },
};

export default COMMON_ELEMENTS;

