import { Projectile } from '../../spells/Projectile.js';
import { MovementHandler } from '../../spells/projectile/MovementHandler.js';

export class SplittingHandler {
  constructor(game) {
    this.game = game;
  }

  handleSplitting(parentProjectile, collisionEnemy) {
    const game = this.game;
    const splittingPotency = (parentProjectile.properties.splitting || 0) * parentProjectile.potencyMultiplier;
    if (splittingPotency <= 0) return;

    // Previous behavior used multiple independent rolls with a modest base chance.
    // New behavior: use a stronger, potency-scaled single chance (closer to chaining's reliability)
    // and when it procs spawn a minimum of 2 children (distinct from chaining which redirects).
    const baseChance = Math.min(0.95, 0.25 + splittingPotency * 0.25); // higher, potency-scaled chance

    if (Math.random() > baseChance) return;

    // Determine how many children to spawn: at least 2, scale with potency
    const spawnCount = Math.max(2, Math.round(splittingPotency));

    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 6 + Math.random() * 12;
      const targetX = collisionEnemy.x + Math.cos(angle) * distance + (Math.random() - 0.5) * 40;
      const targetY = collisionEnemy.y + Math.sin(angle) * distance + (Math.random() - 0.5) * 40;

      const childProjectile = new Projectile(
        collisionEnemy.x,
        collisionEnemy.y,
        parentProjectile.spell,
        targetX,
        targetY
      );

      childProjectile.generation = parentProjectile.generation + 1;
      childProjectile.potencyMultiplier = parentProjectile.potencyMultiplier * 0.6;

      childProjectile.spell = this.createWeakenedSpell(parentProjectile.spell, childProjectile.potencyMultiplier);
      childProjectile.properties = childProjectile.spell.properties;

      // Ensure child inherits 100% of the parent's actual speed magnitude
      try {
        const parentSpeed = Math.sqrt(parentProjectile.vx * parentProjectile.vx + parentProjectile.vy * parentProjectile.vy) || (parentProjectile.spell.properties && parentProjectile.spell.properties.speed) || 0;
        if (childProjectile.spell && childProjectile.spell.properties) {
          childProjectile.spell.properties.speed = parentSpeed;
        }
      } catch (e) { /* silent */ }

      // Re-init movement so the child uses the weakened spell's properties (speed, spiral, homing, etc.)
      try {
        MovementHandler.initMovement(childProjectile, targetX, targetY);
        MovementHandler.initWaveProperties(childProjectile);
      } catch (e) { /* silent fallback */ }

      game.projectiles.push(childProjectile);
    }
  }

  createWeakenedSpell(originalSpell, potencyMultiplier) {
    const weakenedSpell = {
      ...originalSpell,
      properties: {}
    };

    for (const [key, value] of Object.entries(originalSpell.properties || {})) {
      if (typeof value === 'number') {
        weakenedSpell.properties[key] = value * potencyMultiplier;
      } else {
        weakenedSpell.properties[key] = value;
      }
    }

    return weakenedSpell;
  }
}