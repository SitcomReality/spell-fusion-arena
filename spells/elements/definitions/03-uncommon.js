export const UNCOMMON_ELEMENTS = {
  tar: {
    name: 'Tar',
    color: { r: 40, g: 30, b: 25 },
    secondaryColor: { r: 60, g: 45, b: 40 },
    accentColor: { r: 80, g: 60, b: 50 },
    propertyGenes: {
      speed: 140,
      damage: 22,
      slowing: 6,
      dot: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 5,
      trailSize: 4,
      aura: false,
      impactParticles: 18,
      impactType: 'smoke',
      sizeMultiplier: 1.1,
    },
    rarity: 'uncommon'
  },

  rust: {
    name: 'Rust',
    color: { r: 184, g: 92, b: 35 },
    secondaryColor: { r: 160, g: 70, b: 30 },
    accentColor: { r: 210, g: 110, b: 50 },
    propertyGenes: {
      speed: 180,
      damage: 28,
      piercing: 4,
      dot: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 4,
      trailSize: 3,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.45,
      impactParticles: 20,
      impactType: 'spark',
      sizeMultiplier: 0.98,
    },
    rarity: 'uncommon'
  },

  oil: {
    name: 'Oil',
    color: { r: 80, g: 60, b: 20 },
    secondaryColor: { r: 100, g: 80, b: 30 },
    accentColor: { r: 120, g: 100, b: 40 },
    propertyGenes: {
      speed: 240,
      damage: 14,
      homing: 5,
      wave: 4,
      slowing: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 6,
      trailSize: 3,
      aura: true,
      auraSize: 18,
      auraIntensity: 0.35,
      impactParticles: 16,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 0.92,
    },
    rarity: 'uncommon'
  },

  soot: {
    name: 'Soot',
    color: { r: 50, g: 48, b: 47 },
    secondaryColor: { r: 70, g: 65, b: 60 },
    accentColor: { r: 90, g: 85, b: 80 },
    propertyGenes: {
      speed: 200,
      damage: 20,
      dot: 5,
      slowing: 4,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 7,
      trailSize: 2,
      aura: true,
      auraSize: 22,
      auraIntensity: 0.4,
      impactParticles: 22,
      impactType: 'smoke',
      sizeMultiplier: 0.95,
    },
    rarity: 'uncommon'
  },

  driftwood: {
    name: 'Driftwood',
    color: { r: 168, g: 125, b: 85 },
    secondaryColor: { r: 145, g: 105, b: 70 },
    accentColor: { r: 190, g: 145, b: 100 },
    propertyGenes: {
      speed: 170,
      damage: 24,
      knockback: 5,
      piercing: 3,
      wave: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'trail',
      trailDensity: 3,
      trailSize: 3,
      aura: false,
      impactParticles: 18,
      impactType: 'spark',
      sizeMultiplier: 1.08,
    },
    rarity: 'uncommon'
  },

  bronze: {
    name: 'Bronze',
    color: { r: 167, g: 112, b: 68 },
    secondaryColor: { r: 145, g: 95, b: 55 },
    accentColor: { r: 190, g: 135, b: 90 },
    propertyGenes: {
      speed: 210,
      damage: 26,
      chaining: 4,
      piercing: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 5,
      trailSize: 2,
      aura: true,
      auraSize: 19,
      auraIntensity: 0.48,
      impactParticles: 20,
      impactType: 'spark',
      shimmer: true,
      sizeMultiplier: 1.0,
    },
    rarity: 'uncommon'
  },

  slime: {
    name: 'Slime',
    color: { r: 130, g: 180, b: 60 },
    secondaryColor: { r: 150, g: 200, b: 80 },
    accentColor: { r: 110, g: 160, b: 40 },
    propertyGenes: {
      speed: 160,
      damage: 16,
      aoe: 5,
      slowing: 5,
      dot: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'aura',
      trailDensity: 6,
      trailSize: 3,
      aura: true,
      auraSize: 24,
      auraIntensity: 0.55,
      impactParticles: 20,
      impactType: 'aura',
      sizeMultiplier: 1.05,
    },
    rarity: 'uncommon'
  },

  watermelon: {
    name: 'Watermelon',
    color: { r: 220, g: 80, b: 100 },
    secondaryColor: { r: 180, g: 200, b: 80 },
    accentColor: { r: 240, g: 100, b: 120 },
    propertyGenes: {
      speed: 230,
      damage: 18,
      aoe: 6,
      wave: 5,
      knockback: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 6,
      trailSize: 2,
      aura: true,
      auraSize: 25,
      auraIntensity: 0.6,
      impactParticles: 22,
      impactType: 'spark',
      randomColors: true,
      sizeMultiplier: 0.98,
    },
    rarity: 'uncommon'
  },

  apricotJam: {
    name: 'Apricot Jam',
    color: { r: 220, g: 140, b: 50 },
    secondaryColor: { r: 240, g: 160, b: 70 },
    accentColor: { r: 200, g: 120, b: 30 },
    propertyGenes: {
      speed: 190,
      damage: 20,
      aoe: 4,
      lifesteal: 4,
      wave: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 5,
      trailSize: 3,
      aura: true,
      auraSize: 22,
      auraIntensity: 0.52,
      impactParticles: 18,
      impactType: 'spark',
      shimmer: true,
      sizeMultiplier: 1.02,
    },
    rarity: 'uncommon'
  },

  cinnamon: {
    name: 'Cinnamon',
    color: { r: 184, g: 92, b: 50 },
    secondaryColor: { r: 210, g: 120, b: 70 },
    accentColor: { r: 240, g: 150, b: 90 },
    propertyGenes: {
      speed: 250,
      damage: 22,
      dot: 4,
      wave: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 5,
      trailSize: 2,
      aura: true,
      auraSize: 21,
      auraIntensity: 0.5,
      impactParticles: 18,
      impactType: 'spark',
      sizeMultiplier: 0.96,
    },
    rarity: 'uncommon'
  },

  toenail: {
    name: 'Toenail',
    color: { r: 200, g: 170, b: 130 },
    secondaryColor: { r: 180, g: 150, b: 110 },
    accentColor: { r: 220, g: 190, b: 150 },
    propertyGenes: {
      speed: 150,
      damage: 32,
      knockback: 7,
      aoe: 5,
      piercing: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 3,
      trailSize: 4,
      aura: false,
      impactParticles: 28,
      impactType: 'smoke',
      sizeMultiplier: 1.2,
    },
    rarity: 'uncommon'
  },

  mold: {
    name: 'Mold',
    color: { r: 95, g: 120, b: 70 },
    secondaryColor: { r: 110, g: 140, b: 85 },
    accentColor: { r: 75, g: 100, b: 50 },
    propertyGenes: {
      speed: 180,
      damage: 14,
      slowing: 6,
      dot: 6,
      aoe: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 6,
      trailSize: 2,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.42,
      impactParticles: 16,
      impactType: 'aura',
      wispy: true,
      sizeMultiplier: 0.92,
    },
    rarity: 'uncommon'
  },
};

export default UNCOMMON_ELEMENTS;

