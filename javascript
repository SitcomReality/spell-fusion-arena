export const MUNDANE_ELEMENTS = {
  pebble: {
    name: 'Pebble',
    rarity: 'Mundane',
    color: { r: 140, g: 135, b: 130 },
    secondaryColor: { r: 160, g: 155, b: 150 },
    propertyGenes: {
      speed: 160,
      damage: 18,
      knockback: 2,
    },
    visualEffects: {
      sizeMultiplier: 0.8,
      impactType: 'smoke',
      impactParticles: 5,
    },
  },

  damp: {
    name: 'Damp',
    rarity: 'Mundane',
    color: { r: 120, g: 140, b: 150 },
    secondaryColor: { r: 150, g: 160, b: 165 },
    propertyGenes: {
      speed: 180,
      damage: 15,
      slowing: 1,
    },
    visualEffects: {
      sizeMultiplier: 0.85,
      trail: true,
      trailType: 'trail',
      trailDensity: 1,
      trailSize: 1,
    },
  },
};

