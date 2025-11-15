import { Projectile } from '../spells/Projectile.js';
import { TargetFinder } from '../spells/projectile/TargetFinder.js';

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

  // If enemies exist, aim using the slot's target preference
  if (gameState.enemies.length > 0) {
    const preference = player.targetPreferences[slotIndex] || 'nearest';
    const targetEnemy = TargetFinder.findByPreference(player.x, player.y, gameState.enemies, preference);
    if (targetEnemy) {
      targetX = targetEnemy.x;
      targetY = targetEnemy.y;
    }
  }

  // Apply a small damage boost based on Focus allocated to this slot.
  const focusForSlot = (player.spellSlotFocus && player.spellSlotFocus[slotIndex]) || 0;
  const damageBoostPerFocus = 0.03;
  const damageMultiplier = 1 + focusForSlot * damageBoostPerFocus;

  const spellInstance = {
    ...spell,
    properties: { ...(spell.properties || {}) }
  };
  if (typeof spellInstance.properties.damage === 'number') {
    spellInstance.properties.damage = spellInstance.properties.damage * damageMultiplier;
  }

  const projectile = new Projectile(player.x, player.y, spellInstance, targetX, targetY);

  // record origin slot so we can enforce per-slot spiral limits
  projectile.originSlot = slotIndex;

  // If this projectile uses spiral movement, enforce per-slot limit:
  try {
    const spiralLimit = (typeof CONFIG !== 'undefined' && CONFIG.limits && Number.isFinite(CONFIG.limits.spiralPerSlot))
      ? Number(CONFIG.limits.spiralPerSlot)
      : 6;

    const isSpiral = projectile.movementType === 'spiral' || (projectile.properties && projectile.properties.spiral && projectile.properties.spiral > 0.5);
    if (isSpiral && Array.isArray(gameState.projectiles)) {
      // collect existing spiral projectiles that were spawned from this slot and are still alive
      const sameSlotSpirals = gameState.projectiles.filter(p => p && p.alive && (p.movementType === 'spiral' || (p.properties && p.properties.spiral)) && p.originSlot === slotIndex);
      if (sameSlotSpirals.length >= spiralLimit) {
        // find the oldest extant projectile (by remaining lifetime or insertion order)
        // choose the one with smallest lifetime remaining (closest to expiry) to self-destruct,
        // falling back to the first element if lifetimes not meaningful.
        let oldest = sameSlotSpirals[0];
        let oldestKey = 0;
        for (let i = 1; i < sameSlotSpirals.length; i++) {
          const cand = sameSlotSpirals[i];
          const candLife = Number.isFinite(cand.lifetime) ? cand.lifetime : Infinity;
          const oldLife = Number.isFinite(oldest.lifetime) ? oldest.lifetime : Infinity;
          if (candLife < oldLife) {
            oldest = cand;
            oldestKey = i;
          }
        }

        // Simulate collision effects before retiring the projectile
        try {
          // Emit impact particles
          const impact = (typeof oldest.createImpactParticles === 'function') ? oldest.createImpactParticles() : [];
          if (impact && impact.length > 0) gameState.particles.push(...impact);

          const targetEnemy = TargetFinder.findNearestEnemy(oldest.x, oldest.y, gameState.enemies);
          
          if (targetEnemy) {
            // 1. Simulate enemy taking damage (calls takeDamageFromSource internally)
            targetEnemy.takeDamage(oldest);
            
            // 2. Apply projectile properties (DoT, Slowing, Knockback, Lifesteal, etc.)
            oldest.applyProjectileProperties(targetEnemy, gameState);

            // 3. Handle AoE via dedicated handler
            const aoeIntensity = oldest.properties.aoe || 0;
            if (aoeIntensity > 0 && gameState.collisionHandler?.aoeHandler) {
              gameState.collisionHandler.aoeHandler.handleAoEDamage(oldest, targetEnemy, aoeIntensity);
            }

            // 4. Handle splitting via dedicated handler
            const splittingIntensity = oldest.properties.splitting || 0;
            if (splittingIntensity > 0 && gameState.collisionHandler?.splittingHandler) {
              gameState.collisionHandler.splittingHandler.handleSplitting(oldest, targetEnemy);
            }
            
          } else {
            // If no enemy is found, just trigger AoE visualization if applicable
            const aoeIntensity = oldest.properties.aoe || 0;
            if (aoeIntensity > 0) {
              // Recalculate radius based on AoE intensity (matching AoEHandler internal logic base)
              const baseAoERadius = 50 + aoeIntensity * 30;
              const biasScale = 0.5 + 0.5 * Math.min(1, aeeIntensity);
              const aoeRadius = Math.max(2, baseAoERadius * biasScale);
              gameState.createAoEVisual(oldest.x, oldest.y, aoeRadius, oldest.spell.color, 0.6);
            }
          }

        } catch (e) { 
          // If simulation fails, log it but proceed to mark it dead.
          console.error('Error simulating spiral projectile retirement collision:', e);
        }

        // mark it dead so it will be removed during the next update loop
        try { oldest.alive = false; } catch (e) { /* silent */ }
      }
    }
  } catch (e) { /* silent guard: do not block projectile creation on any error */ }

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