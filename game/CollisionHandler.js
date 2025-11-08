import { Projectile } from '../spells/Projectile.js';
import { PropertyApplier } from '../spells/projectile/PropertyApplier.js';
import { AoEHandler } from './collision/AoEHandler.js';
import { SplittingHandler } from './collision/SplittingHandler.js';
import { ChainAndPierceHandler } from './collision/ChainAndPierceHandler.js';

export class CollisionHandler {
  constructor(gameState) {
    this.game = gameState;
    this.aoeHandler = new AoEHandler(this.game);
    this.splittingHandler = new SplittingHandler(this.game);
    this.chainAndPierceHandler = new ChainAndPierceHandler(this.game);
  }

  checkCollisions() {
    const game = this.game;
    for (const projectile of game.projectiles) {
      if (!projectile.alive) continue;

      const chainedEnemies = projectile.chainedEnemies || [];

      for (const enemy of game.enemies) {
        if (!enemy.alive) continue;
        if (chainedEnemies.includes(enemy)) continue;

        const dx = projectile.x - enemy.x;
        const dy = projectile.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let hitRadius = projectile.radius + enemy.type.width / 2;

        if (projectile.properties.aoe && projectile.properties.aoe > 0) {
          hitRadius += projectile.properties.aoe * 15;
        }

        if (dist < hitRadius) {
          const hit = enemy.takeDamage(projectile);
          if (hit) {
            // Apply direct projectile properties
            projectile.applyProjectileProperties(enemy, game);

            // Create impact particles
            const impactParticles = projectile.createImpactParticles();
            game.particles.push(...impactParticles);

            // Handle AoE via dedicated handler
            const aoeIntensity = projectile.properties.aoe || 0;
            if (aoeIntensity > 0) {
              this.aoeHandler.handleAoEDamage(projectile, enemy, aoeIntensity);
            }

            // Handle splitting via dedicated handler
            const splittingIntensity = projectile.properties.splitting || 0;
            if (splittingIntensity > 0) {
              this.splittingHandler.handleSplitting(projectile, enemy);
            }

            // Handle chaining and piercing (which determine whether the projectile dies)
            const shouldDie = this.chainAndPierceHandler.handleChainAndPierce(projectile, enemy);

            if (shouldDie) {
              projectile.alive = false;
            }
          }
        }
      }
    }
  }
}