export const MUNDANE_ELEMENTS = {
  dust: {
    name: 'Dust',
    color: { r: 181, g: 166, b: 146 },
    propertyGenes: {
      speed: 180,
      slowing: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 2,
      trailSize: 2,
      impactParticles: 8,
      impactType: 'smoke',
      sizeMultiplier: 0.85,
    },
    rarity: 'mundane'
  },
  water: {
    name: 'Water',
    color: { r: 135, g: 169, b: 181 },
    propertyGenes: {
      speed: 200,
      wave: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'trail',
      trailDensity: 3,
      trailSize: 2,
      impactParticles: 10,
      impactType: 'swirl',
      sizeMultiplier: 0.95,
    },
    rarity: 'mundane'
  },
  air: {
    name: 'Air',
    color: { r: 212, g: 221, b: 224 },
    propertyGenes: {
      speed: 250,
      knockback: 1,
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 1,
      trailSize: 1,
      impactParticles: 5,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 0.8,
    },
    rarity: 'mundane'
  },
  wood: {
    name: 'Wood',
    color: { r: 133, g: 94, b: 66 },
    propertyGenes: {
      speed: 150,
      damage: 22,
      piercing: 2,
    },
    visualEffects: {
      trail: false,
      impactParticles: 12,
      impactType: 'smoke',
      sizeMultiplier: 1.1,
    },
    rarity: 'mundane'
  },
  stone: {
    name: 'Stone',
    color: { r: 136, g: 140, b: 141 },
    propertyGenes: {
      speed: 120,
      damage: 25,
      knockback: 3,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 1,
      trailSize: 4,
      impactParticles: 15,
      impactType: 'smoke',
      sizeMultiplier: 1.25,
    },
    rarity: 'mundane'
  },
  clay: {
    name: 'Clay',
    color: { r: 181, g: 135, b: 113 },
    propertyGenes: {
      speed: 160,
      damage: 18,
      slowing: 3,
    },
    visualEffects: {
      impactParticles: 10,
      impactType: 'smoke',
      sizeMultiplier: 1.0,
    },
    rarity: 'mundane'
  },
  sand: {
    name: 'Sand',
    color: { r: 214, g: 191, b: 143 },
    propertyGenes: {
      speed: 210,
      piercing: 1,
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 3,
      trailSize: 1,
      impactParticles: 15,
      impactType: 'spark',
      sizeMultiplier: 0.8,
    },
    rarity: 'mundane'
  },
  grass: {
    name: 'Grass',
    color: { r: 124, g: 161, b: 103 },
    propertyGenes: {
      speed: 190,
      dot: 2,
    },
    visualEffects: {
      trail: true,
      trailType: 'aura',
      trailDensity: 2,
      trailSize: 2,
      impactParticles: 8,
      impactType: 'aura',
      sizeMultiplier: 0.9,
    },
    rarity: 'mundane'
  },
  soil: {
    name: 'Soil',
    color: { r: 110, g: 89, b: 75 },
    propertyGenes: {
      speed: 140,
      damage: 20,
      aoe: 1,
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 2,
      trailSize: 3,
      impactParticles: 14,
      impactType: 'smoke',
      sizeMultiplier: 1.05,
    },
    rarity: 'mundane'
  },
  ice: {
    name: 'Ice',
    color: { r: 180, g: 205, b: 209 },
    propertyGenes: {
      speed: 170,
      damage: 15,
      slowing: 4,
      piercing: 3,
    },
    visualEffects: {
      trail: false,
      impactParticles: 18,
      impactType: 'spark',
      shimmer: true,
      sizeMultiplier: 0.9,
    },
    rarity: 'mundane'
  },
};

