export class Element {
  constructor(name, color, propertyGenes, visualEffects, locked = true) {
    this.name = name;
    this.color = color;
    this.propertyGenes = propertyGenes || {}; // property contribution system
    this.visualEffects = visualEffects;
    this.locked = locked;
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
  // Starting elements (unlocked by default)
  fire: new Element('Fire', { r: 255, g: 80, b: 20 }, {
    speed: 280,
    damage: 20,
    dot: 8,
    chaining: 4
  }, {
    trail: true,
    trailType: 'spark',
    trailDensity: 3,
    trailSize: 4,
    aura: true,
    auraSize: 15,
    auraIntensity: 0.4,
    impactParticles: 20,
    impactType: 'spark'
  }, false),
  
  frost: new Element('Frost', { r: 100, g: 200, b: 255 }, {
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
    impactParticles: 15,
    impactType: 'spark',
    ambientParticles: true,
    ambientType: 'glow'
  }, false),
  
  storm: new Element('Storm', { r: 200, g: 150, b: 255 }, {
    speed: 320,
    damage: 19,
    chaining: 7,
    piercing: 3,
    knockback: 3,
    spiral: 4
  }, {
    trail: true,
    trailType: 'spark',
    trailDensity: 8,
    trailSize: 2,
    aura: true,
    auraSize: 25,
    auraIntensity: 0.5,
    impactParticles: 25,
    impactType: 'spark',
    crackle: true
  }, false),
  
  stone: new Element('Stone', { r: 120, g: 100, b: 80 }, {
    speed: 160,
    damage: 32,
    knockback: 8,
    aoe: 5,
    piercing: 2
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 2,
    trailSize: 6,
    aura: false,
    impactParticles: 30,
    impactType: 'smoke',
    shake: true
  }, false),

  // Unlockable elements
  poison: new Element('Poison', { r: 120, g: 255, b: 80 }, {
    speed: 260,
    damage: 16,
    dot: 8,
    slowing: 3,
    aoe: 2
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 4,
    trailSize: 5,
    aura: true,
    auraSize: 18,
    auraIntensity: 0.3,
    impactParticles: 18,
    impactType: 'smoke',
    drip: true
  }),

  light: new Element('Light', { r: 255, g: 255, b: 200 }, {
    speed: 360,
    damage: 17,
    piercing: 8,
    chaining: 2,
    aoe: 3
  }, {
    trail: true,
    trailType: 'beam',
    trailDensity: 10,
    trailSize: 3,
    aura: true,
    auraSize: 30,
    auraIntensity: 0.6,
    impactParticles: 12,
    impactType: 'spark',
    beam: true
  }),

  shadow: new Element('Shadow', { r: 80, g: 60, b: 120 }, {
    speed: 300,
    damage: 21,
    homing: 6,
    lifesteal: 5,
    piercing: 2
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 6,
    trailSize: 4,
    aura: true,
    auraSize: 20,
    auraIntensity: 0.5,
    impactParticles: 15,
    impactType: 'swirl',
    wispy: true
  }),

  arcane: new Element('Arcane', { r: 180, g: 100, b: 255 }, {
    speed: 270,
    damage: 22,
    chaining: 5,
    aoe: 4,
    spiral: 3
  }, {
    trail: true,
    trailType: 'swirl',
    trailDensity: 7,
    trailSize: 3,
    aura: true,
    auraSize: 22,
    auraIntensity: 0.7,
    impactParticles: 25,
    impactType: 'swirl',
    swirl: true
  }),

  nature: new Element('Nature', { r: 80, g: 200, b: 100 }, {
    speed: 220,
    damage: 15,
    slowing: 8,
    dot: 3,
    aoe: 4,
    wave: 2
  }, {
    trail: true,
    trailType: 'aura',
    trailDensity: 5,
    trailSize: 3,
    aura: true,
    auraSize: 25,
    auraIntensity: 0.4,
    impactParticles: 20,
    impactType: 'aura',
    growth: true
  }),

  blood: new Element('Blood', { r: 200, g: 20, b: 50 }, {
    speed: 250,
    damage: 23,
    lifesteal: 7,
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
    drip: true
  }),

  void: new Element('Void', { r: 40, g: 20, b: 60 }, {
    speed: 200,
    damage: 28,
    vortex: 7,
    aoe: 6,
    piercing: 2
  }, {
    trail: true,
    trailType: 'swirl',
    trailDensity: 10,
    trailSize: 2,
    aura: true,
    auraSize: 35,
    auraIntensity: 0.6,
    impactParticles: 30,
    impactType: 'swirl',
    vortex: true,
    pullParticles: true
  }),

  crystal: new Element('Crystal', { r: 150, g: 220, b: 255 }, {
    speed: 210,
    damage: 19,
    piercing: 4,
    aoe: 4,
    splitting: 3
  }, {
    trail: true,
    trailType: 'spark',
    trailDensity: 4,
    trailSize: 3,
    aura: true,
    auraSize: 20,
    auraIntensity: 0.5,
    impactParticles: 22,
    impactType: 'spark',
    shimmer: true
  }, false),

  chaos: new Element('Chaos', { r: 255, g: 100, b: 200 }, {
    speed: 290,
    damage: 24,
    chaining: 4,
    dot: 4,
    knockback: 4,
    repulsion: 2
  }, {
    trail: true,
    trailType: 'spark',
    trailDensity: 12,
    trailSize: 4,
    aura: true,
    auraSize: 28,
    auraIntensity: 0.8,
    impactParticles: 35,
    impactType: 'spark',
    chaotic: true,
    randomColors: true
  }),

  earth: new Element('Earth', { r: 140, g: 100, b: 60 }, {
    speed: 140,
    damage: 35,
    knockback: 10,
    aoe: 8,
    repulsion: 3
  }, {
    trail: true,
    trailType: 'smoke',
    trailDensity: 3,
    trailSize: 8,
    aura: false,
    impactParticles: 40,
    impactType: 'smoke',
    shake: true,
    rocks: true
  }),

  wind: new Element('Wind', { r: 200, g: 240, b: 255 }, {
    speed: 380,
    damage: 14,
    knockback: 5,
    piercing: 4,
    chaining: 2,
    spiral: 5
  }, {
    trail: true,
    trailType: 'swirl',
    trailDensity: 8,
    trailSize: 2,
    aura: true,
    auraSize: 22,
    auraIntensity: 0.3,
    impactParticles: 16,
    impactType: 'swirl',
    wispy: true
  }),

  metal: new Element('Metal', { r: 180, g: 180, b: 200 }, {
    speed: 270,
    damage: 26,
    piercing: 6,
    chaining: 4,
    knockback: 2,
    splitting: 2
  })
};

export function getUnlockedElements() {
  return Object.entries(ELEMENTS)
    .filter(([_, element]) => !element.locked)
    .reduce((acc, [key, element]) => {
      acc[key] = element;
      return acc;
    }, {});
}

export function getLockedElements() {
  return Object.entries(ELEMENTS)
    .filter(([_, element]) => element.locked)
    .reduce((acc, [key, element]) => {
      acc[key] = element;
      return acc;
    }, {});
}

export function unlockElement(elementKey) {
  if (ELEMENTS[elementKey]) {
    ELEMENTS[elementKey].locked = false;
  }
}