// Reworked Element module to use the new definitions hub and remove deprecated vortex/repulsion API.
export class Element {
  constructor(name, color, propertyGenes, visualEffects, rarity = 'common') {
    this.name = name;
    this.color = color;
    this.propertyGenes = propertyGenes || {}; // property contribution system
    this.visualEffects = visualEffects || {};
    this.rarity = rarity; // 'mundane' .. 'mythic'
    // deprecated movement propensities removed (vortex/repulsion no longer used)
  }
}

// Available properties that projectiles can have (vortex & repulsion removed)
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
  splitting: 'splitting',
  wave: 'wave',
  spiral: 'spiral'
};

// Central list populated from the new rarity files
export const ELEMENTS = {};

// Load all rarity definition modules from the new index and instantiate Element objects.
// Expose a readiness promise for consumers to await.
export let ELEMENTS_READY = (async () => {
  try {
    const mod = await import('./elements/index.js');
    const defs = mod.ELEMENTS || mod.default || {};
    for (const [key, desc] of Object.entries(defs)) {
      ELEMENTS[key] = new Element(desc.name, desc.color, desc.propertyGenes, desc.visualEffects, desc.rarity || 'common');
      if (desc.secondaryColor) ELEMENTS[key].secondaryColor = desc.secondaryColor;
      if (desc.accentColor) ELEMENTS[key].accentColor = desc.accentColor;
      if (desc.visualGenes) ELEMENTS[key].visualGenes = desc.visualGenes;
    }
  } catch (e) {
    // Fallback minimal set to ensure game doesn't break if imports fail.
    ELEMENTS.fire = new Element('Fire', { r: 255, g: 120, b: 40 }, { speed: 260, damage: 24 }, { trail: true }, 'common');
    ELEMENTS.frost = new Element('Frost', { r: 150, g: 200, b: 220 }, { speed: 210, damage: 18 }, { trail: true }, 'common');
  }
})();

// Utilities
export function getUnlockedElements(unlockedKeys) {
  if (!unlockedKeys || unlockedKeys.length === 0) return {};
  const result = {};
  for (const key of unlockedKeys) {
    if (ELEMENTS[key]) result[key] = ELEMENTS[key];
  }
  return result;
}

export function getLockedElements(unlockedKeys) {
  if (!unlockedKeys) unlockedKeys = [];
  const result = {};
  for (const [key, element] of Object.entries(ELEMENTS)) {
    if (!unlockedKeys.includes(key)) result[key] = element;
  }
  return result;
}

export function unlockElement(elementKey) {
  if (ELEMENTS[elementKey]) ELEMENTS[elementKey].locked = false;
}

// Spell cost table
export const SPELL_COSTS = { 1: 1, 2: 5, 3: 10, 4: 20 };
export function getSpellCost(elementCount) { return SPELL_COSTS[elementCount] || 0; }