export class Element {
  constructor(name, color, propertyGenes, visualEffects, rarity = 'common') {
    this.name = name;
    this.color = color;
    this.propertyGenes = propertyGenes || {}; // property contribution system
    this.visualEffects = visualEffects || {};
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
  repulsion: 'repulsion',
  wave: 'wave',
  spiral: 'spiral'
};

// Start with an empty container; we'll populate by importing rarity modules
export const ELEMENTS = {};

// Attempt to import grouped element descriptors and instantiate Element objects.
// This is defensive: if grouped modules are not present, we fall back to defining a minimal set.
async function _loadElements() {
  // Try to import grouped modules; they are local and synchronous via static imports,
  // but dynamic strategy lets us catch missing modules gracefully.
  try {
    // Static imports (synchronous) - prefer these in build-time environments.
    // If the runtime doesn't support top-level dynamic imports for these, they will be resolved at bundling.
    // For clarity and compatibility, attempt to import the modules if available.
    // Note: in this refactor we assume the three rarity files exist.
    const common = (await import('./elements/common.js')).COMMON_ELEMENTS || {};
    const uncommon = (await import('./elements/uncommon.js')).UNCOMMON_ELEMENTS || {};
    const rare = (await import('./elements/rare.js')).RARE_ELEMENTS || {};
    const mundane = (await import('./elements/definitions/01-mundane.js')).MUNDANE_ELEMENTS || {};
    const commonDef = (await import('./elements/definitions/02-common.js')).COMMON_ELEMENTS || {};
    const uncommonDef = (await import('./elements/definitions/03-uncommon.js')).UNCOMMON_ELEMENTS || {};
    const supernal = (await import('./elements/definitions/12-supernal.js')).SUPERNAL_ELEMENTS || {};
    const mythic = (await import('./elements/definitions/13-mythic.js')).MYTHIC_ELEMENTS || {};
    const wondrous = (await import('./elements/definitions/11-wondrous.js')).WONDROUS_ELEMENTS || {};

    const merged = Object.assign({}, mundane, commonDef, uncommonDef, supernal, mythic, wondrous, common, uncommon, rare);

    for (const [key, desc] of Object.entries(merged)) {
      ELEMENTS[key] = new Element(desc.name, desc.color, desc.propertyGenes, desc.visualEffects, desc.rarity || 'common');
      // carry over any optional secondary fields if present later
      if (desc.secondaryColor) ELEMENTS[key].secondaryColor = desc.secondaryColor;
      if (desc.visualGenes) ELEMENTS[key].visualGenes = desc.visualGenes;
    }
  } catch (e) {
    // Fallback: ensure at least a few core elements are available inline
    const fallback = {
      fire: {
        name: 'Fire',
        color: { r: 255, g: 100, b: 50 },
        propertyGenes: { speed: 280, damage: 20 },
        visualEffects: { trail: true },
        rarity: 'common'
      },
      frost: {
        name: 'Frost',
        color: { r: 120, g: 220, b: 255 },
        propertyGenes: { speed: 240, damage: 18 },
        visualEffects: { trail: true },
        rarity: 'common'
      }
    };
    for (const [key, desc] of Object.entries(fallback)) {
      ELEMENTS[key] = new Element(desc.name, desc.color, desc.propertyGenes, desc.visualEffects, desc.rarity);
    }
  }

  // After populating, apply some common visual/propensity tweaks for existing keys.
  // These were previously mass-assigned; keep them here so external code continues to work.
  if (ELEMENTS.fire) Object.assign(ELEMENTS.fire, { secondaryColor: { r: 255, g: 180, b: 40 }, visualGenes: { primaryColorInfluence: 1.2, secondaryAffinity: 0.3, particleColor: 0.8, auraColor: 0.6 } });
  if (ELEMENTS.frost) Object.assign(ELEMENTS.frost, { secondaryColor: { r: 180, g: 240, b: 255 }, visualGenes: { primaryColorInfluence: 0.9, secondaryAffinity: 0.7, particleColor: 0.9, auraColor: 0.8 } });
  if (ELEMENTS.stone) Object.assign(ELEMENTS.stone, { secondaryColor: { r: 180, g: 140, b: 80 }, visualGenes: { primaryColorInfluence: 1.4, secondaryAffinity: 0.2, particleColor: 0.6, auraColor: 0.3 } });
  if (ELEMENTS.nature) Object.assign(ELEMENTS.nature, { secondaryColor: { r: 150, g: 255, b: 120 }, visualGenes: { primaryColorInfluence: 0.8, secondaryAffinity: 0.8, particleColor: 0.9, auraColor: 0.9 } });
  if (ELEMENTS.wind) Object.assign(ELEMENTS.wind, { secondaryColor: { r: 230, g: 255, b: 240 }, visualGenes: { primaryColorInfluence: 0.7, secondaryAffinity: 0.6, particleColor: 1.0, auraColor: 0.7 } });

  // Vortex/repulsion propensity defaults and some explicit assignments
  if (ELEMENTS.void) Object.assign(ELEMENTS.void, { vortexPropensity: 0.9, repulsionPropensity: 0.0 });
  if (ELEMENTS.chaos) Object.assign(ELEMENTS.chaos, { vortexPropensity: 0.0, repulsionPropensity: 0.8 });
  if (ELEMENTS.wind) Object.assign(ELEMENTS.wind, { vortexPropensity: 0.0, repulsionPropensity: 0.7 });
  if (ELEMENTS.abyss) Object.assign(ELEMENTS.abyss, { vortexPropensity: 0.6, repulsionPropensity: 0.0 });
  if (ELEMENTS.eruption) Object.assign(ELEMENTS.eruption, { vortexPropensity: 0.0, repulsionPropensity: 0.6 });

  // Guard assign for previously-removed element keys
  if (ELEMENTS.inferno) {
    Object.assign(ELEMENTS.inferno, { vortexPropensity: 0.0, repulsionPropensity: 0.6 });
  }

  // New-ish elements propensity defaults if present
  if (ELEMENTS.lunar) Object.assign(ELEMENTS.lunar, { vortexPropensity: 0.3, repulsionPropensity: 0.0 });
  if (ELEMENTS.solar) Object.assign(ELEMENTS.solar, { vortexPropensity: 0.0, repulsionPropensity: 0.2 });
  if (ELEMENTS.love) Object.assign(ELEMENTS.love, { vortexPropensity: 0.2, repulsionPropensity: 0.0 });
  if (ELEMENTS.hate) Object.assign(ELEMENTS.hate, { vortexPropensity: 0.0, repulsionPropensity: 0.9 });
  if (ELEMENTS.glitch) Object.assign(ELEMENTS.glitch, { vortexPropensity: 0.5, repulsionPropensity: 0.5 });
  if (ELEMENTS.mercury) Object.assign(ELEMENTS.mercury, { vortexPropensity: 0.4, repulsionPropensity: 0.0 });
  if (ELEMENTS.toenail) Object.assign(ELEMENTS.toenail, { vortexPropensity: 0.0, repulsionPropensity: 0.3 });
  if (ELEMENTS.entropy) Object.assign(ELEMENTS.entropy, { vortexPropensity: 0.7, repulsionPropensity: 0.0 });
  if (ELEMENTS.singularity) Object.assign(ELEMENTS.singularity, { vortexPropensity: 0.95, repulsionPropensity: 0.0 });
  if (ELEMENTS.time) Object.assign(ELEMENTS.time, { vortexPropensity: 0.2, repulsionPropensity: 0.0 });
  if (ELEMENTS.melody) Object.assign(ELEMENTS.melody, { vortexPropensity: 0.1, repulsionPropensity: 0.0 });
}

// Immediately attempt to load grouped elements.
// _loadElements already returns a Promise since it's async; expose that promise for consumers.
export const ELEMENTS_READY = _loadElements().catch(() => { /* silent */ });

// Utility functions (unchanged API surface)
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