export class Element {
  constructor(name, color, traits, description, locked = true) {
    this.name = name;
    this.color = color;
    this.traits = traits;
    this.description = description;
    this.locked = locked;
  }
}

export const ELEMENTS = {
  // Starting elements (unlocked by default)
  fire: new Element('Fire', { r: 255, g: 80, b: 20 }, {
    speed: 300,
    damage: 25,
    projectileType: 'straight',
    particleShape: 'spark',
    destructionType: 'explosive',
    dotType: 'burn',
    dotDuration: 2,
    dotDamage: 5
  }, 'Burns enemies over time', false),
  
  frost: new Element('Frost', { r: 100, g: 200, b: 255 }, {
    speed: 200,
    damage: 15,
    projectileType: 'homing',
    particleShape: 'shard',
    destructionType: 'piercing',
    slowAmount: 0.5,
    slowDuration: 1.5
  }, 'Slows and pierces enemies', false),
  
  storm: new Element('Storm', { r: 200, g: 150, b: 255 }, {
    speed: 400,
    damage: 20,
    projectileType: 'bouncing',
    particleShape: 'bolt',
    destructionType: 'chain',
    chainCount: 2,
    chainRange: 100
  }, 'Chains between enemies', false),
  
  stone: new Element('Stone', { r: 120, g: 100, b: 80 }, {
    speed: 150,
    damage: 35,
    projectileType: 'straight',
    particleShape: 'chunk',
    destructionType: 'shatter',
    knockback: 50
  }, 'Heavy damage with knockback', false),

  // Unlockable elements
  poison: new Element('Poison', { r: 120, g: 255, b: 80 }, {
    speed: 250,
    damage: 10,
    projectileType: 'arcing',
    particleShape: 'droplet',
    destructionType: 'normal',
    dotType: 'poison',
    dotDuration: 4,
    dotDamage: 8
  }, 'Deals heavy damage over time'),

  light: new Element('Light', { r: 255, g: 255, b: 200 }, {
    speed: 500,
    damage: 18,
    projectileType: 'piercing',
    particleShape: 'ray',
    destructionType: 'piercing',
    pierce: true,
    maxPierce: 3
  }, 'Pierces through multiple enemies'),

  shadow: new Element('Shadow', { r: 80, g: 60, b: 120 }, {
    speed: 350,
    damage: 22,
    projectileType: 'homing',
    particleShape: 'wisp',
    destructionType: 'normal',
    lifesteal: 0.3
  }, 'Homing projectiles that heal on hit'),

  arcane: new Element('Arcane', { r: 180, g: 100, b: 255 }, {
    speed: 280,
    damage: 28,
    projectileType: 'splitting',
    particleShape: 'orb',
    destructionType: 'explosive',
    splitCount: 3,
    splitAngle: 60
  }, 'Splits into multiple projectiles'),

  nature: new Element('Nature', { r: 80, g: 200, b: 100 }, {
    speed: 220,
    damage: 12,
    projectileType: 'straight',
    particleShape: 'leaf',
    destructionType: 'normal',
    dotType: 'entangle',
    dotDuration: 3,
    slowAmount: 0.7,
    slowDuration: 3
  }, 'Heavily slows enemies'),

  blood: new Element('Blood', { r: 200, g: 20, b: 50 }, {
    speed: 240,
    damage: 20,
    projectileType: 'straight',
    particleShape: 'spike',
    destructionType: 'normal',
    lifesteal: 0.5,
    damageBonus: 0.1
  }, 'Life steal and damage increase'),

  void: new Element('Void', { r: 40, g: 20, b: 60 }, {
    speed: 200,
    damage: 30,
    projectileType: 'slow',
    particleShape: 'sphere',
    destructionType: 'implosion',
    aoeRadius: 40,
    pullStrength: 100
  }, 'Pulls and damages in area'),

  crystal: new Element('Crystal', { r: 150, g: 220, b: 255 }, {
    speed: 180,
    damage: 15,
    projectileType: 'straight',
    particleShape: 'shard',
    destructionType: 'shatter',
    shield: true,
    shieldRadius: 60,
    shieldDamage: 10
  }, 'Creates damaging shield around player'),

  chaos: new Element('Chaos', { r: 255, g: 100, b: 200 }, {
    speed: 320,
    damage: 25,
    projectileType: 'erratic',
    particleShape: 'spark',
    destructionType: 'random',
    randomEffects: true
  }, 'Unpredictable effects'),

  earth: new Element('Earth', { r: 140, g: 100, b: 60 }, {
    speed: 120,
    damage: 40,
    projectileType: 'straight',
    particleShape: 'boulder',
    destructionType: 'shatter',
    aoeRadius: 50,
    knockback: 80
  }, 'Large area damage and knockback'),

  wind: new Element('Wind', { r: 200, g: 240, b: 255 }, {
    speed: 450,
    damage: 12,
    projectileType: 'swirling',
    particleShape: 'wisp',
    destructionType: 'normal',
    knockback: 30,
    multishot: 3
  }, 'Fast projectiles with knockback'),

  metal: new Element('Metal', { r: 180, g: 180, b: 200 }, {
    speed: 280,
    damage: 30,
    projectileType: 'bouncing',
    particleShape: 'blade',
    destructionType: 'piercing',
    pierce: true,
    maxPierce: 2,
    bounceCount: 2
  }, 'Piercing bouncing projectiles')
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