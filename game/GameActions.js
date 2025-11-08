import { Projectile } from '../spells/Projectile.js';

/**
 * castSpell(gameState, slotIndex)
 * Handles creating and launching a projectile for the player's equipped spell at slotIndex.
 * Delegates targeting to an internal nearest-enemy lookup, defaults forward when none.
 */
export function castSpell(gameState, slotIndex) {
  const player = gameState.player;
  if (!player.equippedSpells[slotIndex]) return;

  const spell = player.equippedSpells[slotIndex];

  // Default forward target
  let targetX = gameState.centerX;
  let targetY = gameState.centerY - 100;

  // If enemies exist, aim at nearest
  if (gameState.enemies.length > 0) {
    const nearest = findNearestEnemy(gameState, player.x, player.y);
    if (nearest) {
      targetX = nearest.x;
      targetY = nearest.y;
    }
  }

  // Apply a small damage boost based on Focus allocated to this slot.
  // Each Focus provides a modest damage bonus (e.g. +3% per Focus) to slow projectile-count ramp while keeping player effectiveness.
  const focusForSlot = (player.spellSlotFocus && player.spellSlotFocus[slotIndex]) || 0;
  const damageBoostPerFocus = 0.03; // 3% damage per Focus
  const damageMultiplier = 1 + focusForSlot * damageBoostPerFocus;

  // Create a shallow copy of the spell and its numeric properties so the boost only affects this cast instance.
  const spellInstance = {
    ...spell,
    properties: { ...(spell.properties || {}) }
  };
  if (typeof spellInstance.properties.damage === 'number') {
    spellInstance.properties.damage = spellInstance.properties.damage * damageMultiplier;
  }

  const projectile = new Projectile(player.x, player.y, spellInstance, targetX, targetY);

  gameState.projectiles.push(projectile);
}

/**
 * findNearestEnemy(gameState, fromX, fromY)
 * Returns nearest alive enemy to the point (fromX, fromY), or null.
 */
export function findNearestEnemy(gameState, fromX, fromY) {
  let nearest = null;
  let minDist = Infinity;

  for (const enemy of gameState.enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - fromX;
    const dy = enemy.y - fromY;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  }

  return nearest;
}