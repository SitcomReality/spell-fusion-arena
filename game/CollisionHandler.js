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
    // Base radius scales with intensity, but apply a non-linear scale that
    // reduces fractional aoe values (so 0.1 ≈ ~50% size, 0.5 ≈ ~75% size),
    // keeps aoe=1 unchanged, and allows values >1 to continue increasing linearly.
    const baseAoERadius = 50 + aoeIntensity * 30; // baseline radius before biasing
    // For aoeIntensity in [0,1] bias the scale toward smaller sizes:
    // scale = 0.5 + 0.5 * aoeIntensity (=> 0.1 -> 0.55, 0.5 -> 0.75, 1 -> 1)
    // clamp the fractional bias to 1 so >1 intensities grow from the base value linearly.
    const biasScale = 0.5 + 0.5 * Math.min(1, aoeIntensity);
    const aoeRadius = Math.max(2, baseAoERadius * biasScale);
    // Emit a short-lived AoE visual centered at the impacted enemy for clarity
    try {
      game.createAoEVisual(centerEnemy.x, centerEnemy.y, aoeRadius, projectile.spell.color, 0.6);
    } catch (e) { /* silent if game doesn't support visuals yet */ }

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
    // Probabilistic splitting:
    // - splittingPotency controls both how many independent spawn-rolls occur
    //   and the chance of success for each roll.
    // - This allows high splitting to sometimes produce multiple children, sometimes none.
    const splittingPotency = (parentProjectile.properties.splitting || 0) * parentProjectile.potencyMultiplier;

    if (splittingPotency <= 0) return;

    // Determine number of independent attempts (rolls). Use potency to allow fractional influence:
    // e.g. potency 3.6 => 4 possible rolls, potency 1.1 => 2 rolls (ceil).
    const maxRolls = Math.max(1, Math.ceil(splittingPotency));

    // Base chance per roll increases with potency but is clamped.
    // This formula yields modest chances at low potency and strong chances at high potency.
    const baseChance = Math.min(0.9, 0.12 + (splittingPotency * 0.12));

    for (let r = 0; r < maxRolls; r++) {
      // Slightly bias later rolls to be a bit less likely to avoid runaway spawns:
      const rollModifier = 1 - (r / Math.max(1, maxRolls)) * 0.25;
      const rollChance = Math.max(0.02, Math.min(0.95, baseChance * rollModifier));

      if (Math.random() <= rollChance) {
        // Spawn a child projectile in a semi-random direction near the collision point.
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

        // Inherit generation and degrade potency (weaker children)
        childProjectile.generation = parentProjectile.generation + 1;
        childProjectile.potencyMultiplier = parentProjectile.potencyMultiplier * 0.6;

        // Create weakened spell with reduced properties according to the child's potency
        childProjectile.spell = this.createWeakenedSpell(parentProjectile.spell, childProjectile.potencyMultiplier);
        childProjectile.properties = childProjectile.spell.properties;

        game.projectiles.push(childProjectile);
      }
      // If the roll fails, no child is spawned for that attempt; next roll may still succeed.
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