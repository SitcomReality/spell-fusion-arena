export class Element {
  constructor(name, color, propertyGenes, visualEffects, rarity = 'common') {
    this.name = name;
    this.color = color;
    this.propertyGenes = propertyGenes || {}; // property contribution system
    this.visualEffects = visualEffects;
    this.rarity = rarity; // 'common', 'uncommon', or 'rare'
    // Default genetic propensities (can be overridden after construction)
    this.vortexPropensity = 0;
    this.repulsionPropensity = 0;
  }
}

// Available properties that projectiles can have
export const PROPERTY_TYPES = {
  dot: 'dot',
  chaining: 'chaining',
  piercing: 'piercing',
  homing: 'homing',
  slowing: 'slowing',
  knockback: 'knockback',
  aoe: 'aoe',
  shield: 'shield',
  lifesteal: 'lifesteal',
  vortex: 'vortex',
  splitting: 'splitting',
  repulsion: 'repulsion'
};

export const ELEMENTS = {
  // COMMON ELEMENTS
  fire: new Element('Fire', { r: 255, g: 100, b: 50 }, {
    speed: 280,
    damage: 20,
    dot: 8,
    chaining: 4
  }, {
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
  }, 'common'),
  
  frost: new Element('Frost', { r: 120, g: 220, b: 255 }, {
    speed: 240,
    damage: 18,
    slowing: 7,
    piercing: 5,
    aoe: 2
  }, {
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
  }, 'common'),
  
  stone: new Element('Stone', { r: 130, g: 110, b: 60 }, {
    speed: 140,
    damage: 35,
    knockback: 8,
    aoe: 8,
    piercing: 1
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 2,
    trailSize: 7,
    aura: false,
    impactParticles: 35,
    impactType: 'smoke',
    shake: true,
    sizeMultiplier: 1.4
  }, 'common'),

  nature: new Element('Nature', { r: 100, g: 220, b: 100 }, {
    speed: 220,
    damage: 14,
    slowing: 6,
    dot: 4,
    aoe: 4,
    wave: 3
  }, {
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
  }, 'common'),

  wind: new Element('Wind', { r: 200, g: 245, b: 255 }, {
    speed: 360,
    damage: 12,
    piercing: 4,
    knockback: 4,
    homing: 2
  }, {
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
  }, 'common'),

  // UNCOMMON ELEMENTS
  blood: new Element('Blood', { r: 220, g: 20, b: 60 }, {
    speed: 250,
    damage: 24,
    lifesteal: 8,
    knockback: 3,
    dot: 2
  }, {
    trail: true,
    trailType: 'trail',
    trailDensity: 6,
    trailSize: 2,
    aura: false,
    impactParticles: 18,
    impactType: 'spark',
    drip: true,
    sizeMultiplier: 0.9
  }, 'uncommon'),

  shadow: new Element('Shadow', { r: 100, g: 70, b: 140 }, {
    speed: 290,
    damage: 21,
    homing: 6,
    lifesteal: 4,
    piercing: 2
  }, {
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
  }, 'uncommon'),

  metal: new Element('Metal', { r: 190, g: 190, b: 210 }, {
    speed: 260,
    damage: 26,
    piercing: 6,
    chaining: 4,
    knockback: 2
  }, {
    trail: true,
    trailType: 'spark',
    trailDensity: 5,
    trailSize: 3,
    aura: false,
    impactParticles: 20,
    impactType: 'spark',
    sizeMultiplier: 1.0
  }, 'uncommon'),

  arcane: new Element('Arcane', { r: 200, g: 120, b: 255 }, {
    speed: 270,
    damage: 22,
    chaining: 5,
    aoe: 4,
    splitting: 2,
    wave: 2
  }, {
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
  }, 'uncommon'),

  light: new Element('Light', { r: 255, g: 240, b: 100 }, {
    speed: 350,
    damage: 16,
    piercing: 8,
    chaining: 3,
    aoe: 3
  }, {
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
  }, 'uncommon'),

  poison: new Element('Poison', { r: 150, g: 255, b: 100 }, {
    speed: 240,
    damage: 15,
    slowing: 5,
    dot: 7,
    aoe: 3
  }, {
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
  }, 'uncommon'),

  // RARE ELEMENTS (more exotic, powerful, vivid)
  void: new Element('Void', { r: 50, g: 30, b: 80 }, {
    speed: 200,
    damage: 30,
    vortex: 6,
    aoe: 6,
    piercing: 2
  }, {
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
  }, 'rare'),

  chaos: new Element('Chaos', { r: 255, g: 80, b: 200 }, {
    speed: 290,
    damage: 25,
    chaining: 4,
    dot: 3,
    knockback: 5,
    repulsion: 2,
    wave: 4
  }, {
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
  }, 'rare'),

  abyss: new Element('Abyss', { r: 40, g: 80, b: 160 }, {
    speed: 210,
    damage: 32,
    homing: 7,
    wave: 5,
    piercing: 3
  }, {
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
  }, 'rare'),

  eruption: new Element('Eruption', { r: 255, g: 100, b: 20 }, {
    speed: 270,
    damage: 33,
    knockback: 6,
    aoe: 5,
    splitting: 2,
    repulsion: 3
  }, {
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
  }, 'rare'),

  crystal: new Element('Crystal', { r: 180, g: 240, b: 255 }, {
    speed: 220,
    damage: 18,
    piercing: 4,
    splitting: 4,
    aoe: 3
  }, {
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
  }, 'rare'),

  electrum: new Element('Electrum', { r: 255, g: 200, b: 50 }, {
    speed: 340,
    damage: 18,
    chaining: 6,
    homing: 5,
    wave: 2
  }, {
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
  }, 'rare'),

  // NEW UNCOMMON ELEMENTS
  lunar: new Element('Lunar', { r: 200, g: 220, b: 240 }, {
    speed: 200,
    damage: 16,
    homing: 4,
    slowing: 4,
    wave: 3,
    spiral: 2
  }, {
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
  }, 'uncommon'),

  solar: new Element('Solar', { r: 255, g: 180, b: 60 }, {
    speed: 300,
    damage: 28,
    aoe: 6,
    dot: 5,
    piercing: 3
  }, {
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
  }, 'uncommon'),

  love: new Element('Love', { r: 255, g: 150, b: 180 }, {
    speed: 250,
    damage: 12,
    chaining: 7,
    lifesteal: 6,
    aoe: 2
  }, {
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
  }, 'uncommon'),

  hate: new Element('Hate', { r: 100, g: 20, b: 40 }, {
    speed: 280,
    damage: 31,
    splitting: 5,
    knockback: 4,
    repulsion: 4
  }, {
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
  }, 'uncommon'),

  glitch: new Element('Glitch', { r: 150, g: 255, b: 200 }, {
    speed: 310,
    damage: 19,
    chaining: 3,
    homing: 3,
    wave: 4,
    knockback: 2,
    piercing: 2
  }, {
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
  }, 'uncommon'),

  mercury: new Element('Mercury', { r: 200, g: 200, b: 200 }, {
    speed: 320,
    damage: 17,
    homing: 6,
    wave: 3,
    piercing: 3,
    slowing: 2
  }, {
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
  }, 'uncommon'),

  toenail: new Element('Toenail', { r: 180, g: 160, b: 140 }, {
    speed: 130,
    damage: 36,
    knockback: 9,
    aoe: 6,
    piercing: 4
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 3,
    trailSize: 6,
    aura: false,
    impactParticles: 32,
    impactType: 'smoke',
    shake: true,
    sizeMultiplier: 1.35
  }, 'uncommon'),

  // NEW RARE ELEMENTS
  entropy: new Element('Entropy', { r: 120, g: 60, b: 120 }, {
    speed: 210,
    damage: 28,
    vortex: 4,
    wave: 6,
    dot: 4,
    splitting: 2
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 9,
    trailSize: 3,
    aura: true,
    auraSize: 30,
    auraIntensity: 0.65,
    impactParticles: 28,
    impactType: 'swirl',
    wispy: true,
    vortex: true,
    sizeMultiplier: 1.08
  }, 'rare'),

  singularity: new Element('Singularity', { r: 30, g: 30, b: 50 }, {
    speed: 180,
    damage: 34,
    vortex: 8,
    aoe: 8,
    homing: 2,
    piercing: 4
  }, {
    trail: true,
    trailType: 'swirl',
    trailDensity: 12,
    trailSize: 3,
    aura: true,
    auraSize: 42,
    auraIntensity: 0.8,
    impactParticles: 36,
    impactType: 'swirl',
    vortex: true,
    pullParticles: true,
    sizeMultiplier: 1.25
  }, 'rare'),

  time: new Element('Time', { r: 220, g: 180, b: 100 }, {
    speed: 270,
    damage: 20,
    homing: 5,
    slowing: 7,
    wave: 5,
    spiral: 3
  }, {
    trail: true,
    trailType: 'swirl',
    trailDensity: 8,
    trailSize: 2,
    aura: true,
    auraSize: 26,
    auraIntensity: 0.6,
    impactParticles: 20,
    impactType: 'spark',
    swirl: true,
    sizeMultiplier: 1.0
  }, 'rare'),

  melody: new Element('Melody', { r: 200, g: 100, b: 200 }, {
    speed: 260,
    damage: 16,
    chaining: 8,
    wave: 6,
    aoe: 5,
    piercing: 2
  }, {
    trail: true,
    trailType: 'swirl',
    trailDensity: 10,
    trailSize: 2,
    aura: true,
    auraSize: 28,
    auraIntensity: 0.7,
    impactParticles: 24,
    impactType: 'swirl',
    swirl: true,
    sizeMultiplier: 0.98
  }, 'rare')
};

// Add secondary colors to all elements
Object.assign(ELEMENTS.fire, { secondaryColor: { r: 255, g: 180, b: 40 }, visualGenes: { primaryColorInfluence: 1.2, secondaryAffinity: 0.3, particleColor: 0.8, auraColor: 0.6 } });
Object.assign(ELEMENTS.frost, { secondaryColor: { r: 180, g: 240, b: 255 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.7, particleColor: 0.9, auraColor: 0.8 } });
Object.assign(ELEMENTS.stone, { secondaryColor: { r: 180, g: 140, b: 80 }, visualGenes: { primaryColorInfluence: 1.4, secondaryAffinity: 0.2, particleColor: 0.6, auraColor: 0.3 } });
Object.assign(ELEMENTS.nature, { secondaryColor: { r: 150, g: 255, b: 120 }, visualGenes: { primaryColorInfluence: 0.8, secondaryAffinity: 0.8, particleColor: 0.9, auraColor: 0.9 } });
Object.assign(ELEMENTS.wind, { secondaryColor: { r: 230, g: 255, b: 240 }, visualGenes: { primaryColorInfluence: 0.7, secondaryAffinity: 0.6, particleColor: 1.0, auraColor: 0.7 } });
Object.assign(ELEMENTS.blood, { secondaryColor: { r: 140, g: 20, b: 40 }, visualGenes: { primaryColorInfluence: 1.1, secondaryAffinity: 0.5, particleColor: 0.8, auraColor: 0.4 } });
Object.assign(ELEMENTS.shadow, { secondaryColor: { r: 150, g: 100, b: 200 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.9, particleColor: 0.7, auraColor: 0.9 } });
Object.assign(ELEMENTS.metal, { secondaryColor: { r: 255, g: 200, b: 80 }, visualGenes: { primaryColorInfluence: 1.3, secondaryAffinity: 0.4, particleColor: 1.0, auraColor: 0.5 } });
Object.assign(ELEMENTS.arcane, { secondaryColor: { r: 255, g: 100, b: 200 }, visualGenes: { primaryColorInfluence: 0.8, secondaryAffinity: 0.95, particleColor: 0.85, auraColor: 1.1 } });
Object.assign(ELEMENTS.light, { secondaryColor: { r: 255, g: 255, b: 200 }, visualGenes: { primaryColorInfluence: 0.75, secondaryAffinity: 0.8, particleColor: 1.05, auraColor: 1.0 } });
Object.assign(ELEMENTS.poison, { secondaryColor: { r: 100, g: 180, b: 60 }, visualGenes: { primaryColorInfluence: 0.95, secondaryAffinity: 0.7, particleColor: 0.9, auraColor: 0.7 } });
Object.assign(ELEMENTS.void, { secondaryColor: { r: 100, g: 80, b: 160 }, visualGenes: { primaryColorInfluence: 1.0, secondaryAffinity: 0.9, particleColor: 0.8, auraColor: 1.2 } });
Object.assign(ELEMENTS.chaos, { secondaryColor: { r: 255, g: 150, b: 100 }, visualGenes: { primaryColorInfluence: 0.85, secondaryAffinity: 0.85, particleColor: 1.1, auraColor: 1.0 } });
Object.assign(ELEMENTS.abyss, { secondaryColor: { r: 100, g: 150, b: 220 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.75, particleColor: 0.85, auraColor: 0.95 } });
// Object.assign(ELEMENTS.inferno, { secondaryColor: { r: 255, g: 80, b: 50 }, visualGenes: { primaryColorInfluence: 1.3, secondaryAffinity: 0.6, particleColor: 0.9, auraColor: 0.8 } });
Object.assign(ELEMENTS.crystal, { secondaryColor: { r: 100, g: 200, b: 255 }, visualGenes: { primaryColorInfluence: 0.85, secondaryAffinity: 0.8, particleColor: 0.95, auraColor: 1.05 } });
Object.assign(ELEMENTS.electrum, { secondaryColor: { r: 255, g: 255, b: 150 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.7, particleColor: 1.1, auraColor: 0.8 } });
Object.assign(ELEMENTS.eruption, { secondaryColor: { r: 255, g: 80, b: 50 }, visualGenes: { primaryColorInfluence: 1.3, secondaryAffinity: 0.6, particleColor: 0.9, auraColor: 0.8 } });

// NEW: Secondary colors for new elements
Object.assign(ELEMENTS.lunar, { secondaryColor: { r: 100, g: 150, b: 200 }, visualGenes: { primaryColorInfluence: 0.85, secondaryAffinity: 0.9, particleColor: 0.95, auraColor: 1.0 } });
Object.assign(ELEMENTS.solar, { secondaryColor: { r: 255, g: 220, b: 100 }, visualGenes: { primaryColorInfluence: 1.2, secondaryAffinity: 0.7, particleColor: 1.0, auraColor: 0.9 } });
Object.assign(ELEMENTS.love, { secondaryColor: { r: 255, g: 200, b: 220 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.95, particleColor: 1.05, auraColor: 1.1 } });
Object.assign(ELEMENTS.hate, { secondaryColor: { r: 140, g: 10, b: 60 }, visualGenes: { primaryColorInfluence: 1.1, secondaryAffinity: 0.8, particleColor: 0.9, auraColor: 0.7 } });
Object.assign(ELEMENTS.glitch, { secondaryColor: { r: 100, g: 255, b: 150 }, visualGenes: { primaryColorInfluence: 0.8, secondaryAffinity: 0.85, particleColor: 1.1, auraColor: 0.9 } });
Object.assign(ELEMENTS.mercury, { secondaryColor: { r: 150, g: 180, b: 200 }, visualGenes: { primaryColorInfluence: 0.95, secondaryAffinity: 0.8, particleColor: 1.05, auraColor: 0.8 } });
Object.assign(ELEMENTS.toenail, { secondaryColor: { r: 200, g: 140, b: 100 }, visualGenes: { primaryColorInfluence: 1.25, secondaryAffinity: 0.3, particleColor: 0.7, auraColor: 0.4 } });
Object.assign(ELEMENTS.entropy, { secondaryColor: { r: 180, g: 100, b: 180 }, visualGenes: { primaryColorInfluence: 1.0, secondaryAffinity: 0.85, particleColor: 0.85, auraColor: 1.0 } });
Object.assign(ELEMENTS.singularity, { secondaryColor: { r: 80, g: 60, b: 120 }, visualGenes: { primaryColorInfluence: 1.1, secondaryAffinity: 0.9, particleColor: 0.8, auraColor: 1.2 } });
Object.assign(ELEMENTS.time, { secondaryColor: { r: 255, g: 220, b: 150 }, visualGenes: { primaryColorInfluence: 0.95, secondaryAffinity: 0.8, particleColor: 0.95, auraColor: 0.9 } });
Object.assign(ELEMENTS.melody, { secondaryColor: { r: 255, g: 150, b: 255 }, visualGenes: { primaryColorInfluence: 0.85, secondaryAffinity: 0.95, particleColor: 1.0, auraColor: 1.1 } });

// Add vortex/repulsion genetic propensity to elements (separate from visualEffects)
Object.assign(ELEMENTS.void, { vortexPropensity: 0.9, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.chaos, { vortexPropensity: 0.0, repulsionPropensity: 0.8 });
Object.assign(ELEMENTS.wind, { vortexPropensity: 0.0, repulsionPropensity: 0.7 });
Object.assign(ELEMENTS.inferno, { vortexPropensity: 0.0, repulsionPropensity: 0.6 });
Object.assign(ELEMENTS.arcane, { vortexPropensity: 0.4, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.abyss, { vortexPropensity: 0.6, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.eruption, { vortexPropensity: 0.0, repulsionPropensity: 0.6 });

// NEW: Genetic propensities for new elements
Object.assign(ELEMENTS.lunar, { vortexPropensity: 0.3, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.solar, { vortexPropensity: 0.0, repulsionPropensity: 0.2 });
Object.assign(ELEMENTS.love, { vortexPropensity: 0.2, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.hate, { vortexPropensity: 0.0, repulsionPropensity: 0.9 });
Object.assign(ELEMENTS.glitch, { vortexPropensity: 0.5, repulsionPropensity: 0.5 });
Object.assign(ELEMENTS.mercury, { vortexPropensity: 0.4, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.toenail, { vortexPropensity: 0.0, repulsionPropensity: 0.3 });
Object.assign(ELEMENTS.entropy, { vortexPropensity: 0.7, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.singularity, { vortexPropensity: 0.95, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.time, { vortexPropensity: 0.2, repulsionPropensity: 0.0 });
Object.assign(ELEMENTS.melody, { vortexPropensity: 0.1, repulsionPropensity: 0.0 });

export function getUnlockedElements(unlockedKeys) {
  if (!unlockedKeys || unlockedKeys.length === 0) {
    return {};
  }
  const result = {};
  for (const key of unlockedKeys) {
    if (ELEMENTS[key]) {
      result[key] = ELEMENTS[key];
    }
  }
  return result;
}

export function getLockedElements(unlockedKeys) {
  if (!unlockedKeys) unlockedKeys = [];
  const result = {};
  for (const [key, element] of Object.entries(ELEMENTS)) {
    if (!unlockedKeys.includes(key)) {
      result[key] = element;
    }
  }
  return result;
}

export function unlockElement(elementKey) {
  if (ELEMENTS[elementKey]) {
    ELEMENTS[elementKey].locked = false;
  }
}

// Spell equipping costs based on number of fused elements
export const SPELL_COSTS = {
  1: 1,   // 1 element
  2: 5,   // 2 elements
  3: 10,  // 3 elements
  4: 20   // 4 elements
};

export function getSpellCost(elementCount) {
  return SPELL_COSTS[elementCount] || 0;
}