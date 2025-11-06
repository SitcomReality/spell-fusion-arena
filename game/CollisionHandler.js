import { Projectile } from '../spells/Projectile.js';

export class CollisionHandler {
  constructor(gameState) {
    this.game = gameState;
  }

  checkCollisions() {
    const game = this.game;
    for (const projectile of game.projectiles) {
      if (!projectile.alive) continue;

      // For chaining, check if we've already hit this enemy
      const chainedEnemies = projectile.chainedEnemies || [];

      for (const enemy of game.enemies) {
        if (!enemy.alive) continue;

        if (chainedEnemies.includes(enemy)) continue;

        const dx = projectile.x - enemy.x;
        const dy = projectile.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let hitRadius = projectile.radius + enemy.type.width / 2;

        // AOE expands hit radius
        if (projectile.properties.aoe && projectile.properties.aoe > 0) {
          hitRadius += projectile.properties.aoe * 15;
        }

        if (dist < hitRadius) {
          const hit = enemy.takeDamage(projectile);
          if (hit) {
            // Apply projectile properties to hit enemy
            projectile.applyProjectileProperties(enemy);

            // Create impact particles
            const impactParticles = projectile.createImpactParticles();
            game.particles.push(...impactParticles);

            // Handle AoE damage to nearby enemies
            const aoeIntensity = projectile.properties.aoe || 0;
            if (aoeIntensity > 0) {
              this.handleAoEDamage(projectile, enemy, aoeIntensity);
            }

            // Handle piercing
            const pierceIntensity = projectile.properties.piercing || 0;
            const maxPierces = Math.floor(pierceIntensity) + 1;
            const pierceCount = (projectile.pierceCount || 0);

            let shouldDie = false;
            if (pierceCount >= maxPierces) {
              shouldDie = true;
            } else {
              projectile.pierceCount = pierceCount + 1;
            }

            // Handle splitting
            const splittingIntensity = projectile.properties.splitting || 0;
            if (splittingIntensity > 0) {
              this.handleSplitting(projectile, enemy);
            }

            // Handle chaining - if not already dead from other mechanics
            const chainingIntensity = projectile.properties.chaining || 0;
            if (!shouldDie && chainingIntensity > 0) {
              const chainedEnemies = projectile.chainedEnemies || [];
              chainedEnemies.push(enemy);
              projectile.chainedEnemies = chainedEnemies;

              // Try to find another enemy to chain to
              const nextTarget = this.findChainTarget(projectile, chainedEnemies);
              if (nextTarget) {
                // Redirect projectile to new target
                this.redirectProjectile(projectile, nextTarget);
              } else {
                // No more targets, die
                shouldDie = true;
              }
            } else if (!shouldDie && !chainingIntensity) {
              // No chaining and no piercing surviving, die
              shouldDie = true;
            }

            if (shouldDie) {
              projectile.alive = false;
            }
          }
        }
      }
    }
  }

  handleAoEDamage(projectile, centerEnemy, aoeIntensity) {
    const game = this.game;
    const aoeRadius = 50 + aoeIntensity * 30; // Base 50px, scales with intensity

    for (const enemy of game.enemies) {
      if (!enemy.alive || enemy === centerEnemy) continue;

      const dx = enemy.x - centerEnemy.x;
      const dy = enemy.y - centerEnemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < aoeRadius) {
        // Damage falls off with distance
        const falloff = 1 - (dist / aoeRadius);
        const damageMultiplier = falloff * (0.5 + aoeIntensity * 0.1); // Scales with intensity

        // Deal damage to this enemy
        const baseDamage = projectile.spell.properties.damage || 10;
        const damage = baseDamage * damageMultiplier;

        // Create a temporary projectile-like object to use takeDamage
        const aoeDamageProj = {
          x: centerEnemy.x,
          y: centerEnemy.y,
          radius: projectile.radius
        };

        // Calculate destruction radius based on damage magnitude. 
        // Base destruction is 4 pixels radius, multiplied by damageMultiplier and aoeIntensity influence.
        const destructionRadius = 4 + 10 * damageMultiplier; 

        // Use new generalized damage function for AoE, centered at centerEnemy
        enemy.takeDamageFromSource(centerEnemy.x, centerEnemy.y, destructionRadius, 'explosive');

        // Apply DoT properties from projectile
        const dotIntensity = projectile.properties.dot || 0;
        if (dotIntensity > 0) {
          const duration = 2 + dotIntensity * 1.5;
          const damagePerTick = Math.max(1, damage * dotIntensity * 0.12);
          enemy.applyBurning(duration, damagePerTick);
        }

        // Apply slowing from AoE
        const slowIntensity = projectile.properties.slowing || 0;
        if (slowIntensity > 0) {
          const duration = 1.5 + slowIntensity * 1;
          const slowAmount = Math.min(0.6, 0.2 + slowIntensity * 0.08);
          enemy.applySlowing(duration, slowAmount);
        }
      }
    }
  }

  handleSplitting(parentProjectile, collisionEnemy) {
    const game = this.game;
    const splittingPotency = (parentProjectile.properties.splitting || 0) * parentProjectile.potencyMultiplier;

    // Determine number of child projectiles based on splitting potency
    const numChildren = Math.max(1, Math.floor(splittingPotency / 3));

    for (let i = 0; i < numChildren; i++) {
      // Create new projectile with weakened properties
      const childProjectile = new Projectile(
        collisionEnemy.x,
        collisionEnemy.y,
        parentProjectile.spell,
        // Target a random direction or nearby enemy
        collisionEnemy.x + (Math.random() - 0.5) * 200,
        collisionEnemy.y + (Math.random() - 0.5) * 200
      );

      // Inherit generation and degrade potency
      childProjectile.generation = parentProjectile.generation + 1;
      childProjectile.potencyMultiplier = parentProjectile.potencyMultiplier * 0.7;

      // Create weakened spell with reduced properties
      childProjectile.spell = this.createWeakenedSpell(parentProjectile.spell, childProjectile.potencyMultiplier);
      childProjectile.properties = childProjectile.spell.properties;

      game.projectiles.push(childProjectile);
    }
  }

  findChainTarget(currentProjectile, chainedEnemies) {
    const game = this.game;
    const chainRange = 150; // How far to search for next target
    let nearest = null;
    let minDist = chainRange;

    for (const enemy of game.enemies) {
      if (!enemy.alive || chainedEnemies.includes(enemy)) continue;

      const dx = enemy.x - currentProjectile.x;
      const dy = enemy.y - currentProjectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  redirectProjectile(projectile, targetEnemy) {
    const dx = targetEnemy.x - projectile.x;
    const dy = targetEnemy.y - projectile.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = projectile.spell.properties.speed;

    if (dist > 0) {
      projectile.vx = (dx / dist) * speed;
      projectile.vy = (dy / dist) * speed;
    }
  }

  createWeakenedSpell(originalSpell, potencyMultiplier) {
    // Create a copy of the spell with weakened properties
    const weakenedSpell = {
      ...originalSpell,
      properties: {}
    };

    // Scale all numeric properties
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