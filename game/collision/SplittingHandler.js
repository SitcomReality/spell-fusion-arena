import { Projectile } from '../../spells/Projectile.js';

export class SplittingHandler {
  constructor(game) {
    this.game = game;
  }

  handleSplitting(parentProjectile, collisionEnemy) {
    const game = this.game;
    const splittingPotency = (parentProjectile.properties.splitting || 0) * parentProjectile.potencyMultiplier;
    if (splittingPotency <= 0) return;

    const maxRolls = Math.max(1, Math.ceil(splittingPotency));
    const baseChance = Math.min(0.9, 0.12 + (splittingPotency * 0.12));

    for (let r = 0; r < maxRolls; r++) {
      const rollModifier = 1 - (r / Math.max(1, maxRolls)) * 0.25;
      const rollChance = Math.max(0.02, Math.min(0.95, baseChance * rollModifier));

      if (Math.random() <= rollChance) {
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

        game.projectiles.push(childProjectile);
      }
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