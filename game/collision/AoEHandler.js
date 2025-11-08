import { PropertyApplier } from '../../spells/projectile/PropertyApplier.js';

export class AoEHandler {
  constructor(game) {
    this.game = game;
  }

  handleAoEDamage(projectile, centerEnemy, aoeIntensity) {
    const game = this.game;
    const baseAoERadius = 50 + aoeIntensity * 30;
    const biasScale = 0.5 + 0.5 * Math.min(1, aoeIntensity);
    const aoeRadius = Math.max(2, baseAoERadius * biasScale);

    try {
      game.createAoEVisual(centerEnemy.x, centerEnemy.y, aoeRadius, projectile.spell.color, 0.6);
    } catch (e) { /* silent */ }

    for (const enemy of game.enemies) {
      if (!enemy.alive || enemy === centerEnemy) continue;

      const dx = enemy.x - centerEnemy.x;
      const dy = enemy.y - centerEnemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < aoeRadius) {
        const falloff = 1 - (dist / aoeRadius);
        const damageMultiplier = falloff * (0.5 + aoeIntensity * 0.1);

        const baseDamage = projectile.spell.properties.damage || 10;
        const damage = baseDamage * damageMultiplier;

        const aoeDamageProj = {
          x: centerEnemy.x,
          y: centerEnemy.y,
          radius: projectile.radius
        };

        const destructionRadius = 4 + 10 * (damageMultiplier);

        enemy.takeDamageFromSource(centerEnemy.x, centerEnemy.y, destructionRadius, 'explosive');

        // Apply DoT
        const dotIntensity = projectile.properties.dot || 0;
        if (dotIntensity > 0) {
          const duration = 2 + dotIntensity * 1.5;
          const damagePerTick = Math.max(1, damage * dotIntensity * 0.12);
          enemy.applyBurning(duration, damagePerTick, projectile.spell.color);
        }

        // Apply slowing
        const slowIntensity = projectile.properties.slowing || 0;
        if (slowIntensity > 0) {
          const duration = 1.5 + slowIntensity * 1;
          const slowAmount = Math.min(0.6, 0.2 + slowIntensity * 0.08);
          enemy.applySlowing(duration, slowAmount);
        }

        // Propagate other non-movement properties probabilistically
        try {
          const temp = {
            x: centerEnemy.x,
            y: centerEnemy.y,
            radius: projectile.radius,
            spell: projectile.spell,
            properties: {}
          };

          const propagateProps = ['knockback', 'lifesteal', 'poison', 'dot'];
          for (const prop of propagateProps) {
            const val = projectile.properties[prop];
            if (val && val > 0) {
              const chance = Math.min(0.95, 0.12 + (val * 0.08) * (projectile.potencyMultiplier || 1) * aoeIntensity);
              if (Math.random() <= chance) {
                temp.properties[prop] = val * 0.5 * (projectile.potencyMultiplier || 1) * aoeIntensity;
              }
            }
          }

          if (Object.keys(temp.properties).length > 0) {
            PropertyApplier.applyProperties(temp, enemy, game);

            // lifesteal credit best-effort handled inside PropertyApplier when provided game/player
          }
        } catch (e) { /* non-critical */ }
      }
    }
  }
}