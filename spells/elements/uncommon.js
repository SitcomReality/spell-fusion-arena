import { EXTRA_UNCOMMON_ELEMENTS } from './more_uncommon.js';

export const UNCOMMON_ELEMENTS = {
  blood: {
    name: 'Blood',
    color: { r: 220, g: 20, b: 60 },
    propertyGenes: {
      speed: 250,
      damage: 24,
      lifesteal: 8,
      knockback: 3,
      dot: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'trail',
      trailDensity: 6,
      trailSize: 2,
      aura: false,
      impactParticles: 18,
      impactType: 'spark',
      drip: true,
      sizeMultiplier: 0.9
    },
    rarity: 'uncommon'
  },

  shadow: {
    name: 'Shadow',
    color: { r: 100, g: 70, b: 140 },
    propertyGenes: {
      speed: 290,
      damage: 21,
      homing: 6,
      lifesteal: 4,
      piercing: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 6,
      trailSize: 4,
      aura: true,
      auraSize: 22,
      auraIntensity: 0.5,
      impactParticles: 16,
      impactType: 'swirl',
      wispy: true,
      sizeMultiplier: 1.0
    },
    rarity: 'uncommon'
  },

  metal: {
    name: 'Metal',
    color: { r: 190, g: 190, b: 210 },
    propertyGenes: {
      speed: 260,
      damage: 26,
      piercing: 6,
      chaining: 4,
      knockback: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'spark',
      trailDensity: 5,
      trailSize: 3,
      aura: false,
      impactParticles: 20,
      impactType: 'spark',
      sizeMultiplier: 1.0
    },
    rarity: 'uncommon'
  },

  arcane: {
    name: 'Arcane',
    color: { r: 200, g: 120, b: 255 },
    propertyGenes: {
      speed: 270,
      damage: 22,
      chaining: 5,
      aoe: 4,
      splitting: 2,
      wave: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'swirl',
      trailDensity: 7,
      trailSize: 3,
      aura: true,
      auraSize: 24,
      auraIntensity: 0.7,
      impactParticles: 26,
      impactType: 'swirl',
      swirl: true,
      sizeMultiplier: 1.0
    },
    rarity: 'uncommon'
  },

  light: {
    name: 'Light',
    color: { r: 255, g: 240, b: 100 },
    propertyGenes: {
      speed: 350,
      damage: 16,
      piercing: 8,
      chaining: 3,
      aoe: 3,
      spiral: 2
    },
    visualEffects: {
      trail: true,
      trailType: 'beam',
      trailDensity: 10,
      trailSize: 3,
      aura: true,
      auraSize: 32,
      auraIntensity: 0.65,
      impactParticles: 13,
      impactType: 'spark',
      beam: true,
      sizeMultiplier: 0.85
    },
    rarity: 'uncommon'
  },

  poison: {
    name: 'Poison',
    color: { r: 150, g: 255, b: 100 },
    propertyGenes: {
      speed: 240,
      damage: 15,
      slowing: 5,
      dot: 7,
      aoe: 3
    },
    visualEffects: {
      trail: true,
      trailType: 'smoke',
      trailDensity: 4,
      trailSize: 5,
      aura: true,
      auraSize: 20,
      auraIntensity: 0.35,
      impactParticles: 18,
      impactType: 'smoke',
      drip: true,
      sizeMultiplier: 0.95
    },
    rarity: 'uncommon'
  }
};

/* Merge in extra uncommon elements so imports elsewhere get a single unified object */
Object.assign(UNCOMMON_ELEMENTS, EXTRA_UNCOMMON_ELEMENTS);

export default UNCOMMON_ELEMENTS;