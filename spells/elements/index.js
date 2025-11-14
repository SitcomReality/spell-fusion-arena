/**
 * Central hub that imports element definition modules for each rarity tier
 * and merges them into a single exported ELEMENTS object.
 *
 * Files imported here follow the naming convention:
 *   /spells/elements/definitions/01-mundane.js  ...  13-mythic.js
 *
 * Each module is expected to export a const like MUNDANE_ELEMENTS, COMMON_ELEMENTS, etc.
 */

import { MUNDANE_ELEMENTS } from './definitions/01-mundane.js';
import { COMMON_ELEMENTS } from './definitions/02-common.js';
import { UNCOMMON_ELEMENTS } from './definitions/03-uncommon.js';
import { UNUSUAL_ELEMENTS } from './definitions/04-unusual.js';
import { RARE_ELEMENTS as RARE_DEF_ELEMENTS } from './definitions/05-rare.js';
import { PRESTIGIOUS_ELEMENTS } from './definitions/06-prestigious.js';
import { EXOTIC_ELEMENTS } from './definitions/07-exotic.js';
import { OUTSTANDING_ELEMENTS } from './definitions/08-outstanding.js';
import { EXCEPTIONAL_ELEMENTS } from './definitions/09-exceptional.js';
import { LEGENDARY_ELEMENTS } from './definitions/10-legendary.js';
import { WONDROUS_ELEMENTS } from './definitions/11-wondrous.js';
import { SUPERNAL_ELEMENTS } from './definitions/12-supernal.js';
import { MYTHIC_ELEMENTS } from './definitions/13-mythic.js';

/**
 * Merge order: mundane -> common -> uncommon -> ... -> mythic
 * Later entries will override keys from earlier tiers if a key collision occurs.
 */
export const ELEMENTS = Object.assign(
  {},
  MUNDANE_ELEMENTS || {},
  COMMON_ELEMENTS || {},
  UNCOMMON_ELEMENTS || {},
  UNUSUAL_ELEMENTS || {},
  RARE_DEF_ELEMENTS || {},
  PRESTIGIOUS_ELEMENTS || {},
  EXOTIC_ELEMENTS || {},
  OUTSTANDING_ELEMENTS || {},
  EXCEPTIONAL_ELEMENTS || {},
  LEGENDARY_ELEMENTS || {},
  WONDROUS_ELEMENTS || {},
  SUPERNAL_ELEMENTS || {},
  MYTHIC_ELEMENTS || {}
);

export default ELEMENTS;


