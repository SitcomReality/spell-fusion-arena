export class Element {
  constructor(name, color, propertyGenes, visualEffects, rarity = 'common') {
    this.name = name;
    this.color = color;
    this.propertyGenes = propertyGenes || {}; // property contribution system
    this.visualEffects = visualEffects;
    this.rarity = rarity; // 'common', 'uncommon', or 'rare'
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

  inferno: new Element('Inferno', { r: 255, g: 140, b: 40 }, {
    speed: 270,
    damage: 33,
    dot: 6,
    knockback: 6,
    aoe: 5,
    splitting: 2
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
Object.assign(ELEMENTS.inferno, { secondaryColor: { r: 255, g: 80, b: 50 }, visualGenes: { primaryColorInfluence: 1.3, secondaryAffinity: 0.6, particleColor: 0.9, auraColor: 0.8 } });
Object.assign(ELEMENTS.crystal, { secondaryColor: { r: 100, g: 200, b: 255 }, visualGenes: { primaryColorInfluence: 0.85, secondaryAffinity: 0.8, particleColor: 0.95, auraColor: 1.05 } });
Object.assign(ELEMENTS.electrum, { secondaryColor: { r: 255, g: 255, b: 150 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.7, particleColor: 1.1, auraColor: 0.8 } });

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