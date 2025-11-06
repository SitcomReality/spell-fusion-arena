import { Player } from '../entities/Player.js';
import { WaveManager } from './WaveManager.js';
import { Projectile } from '../spells/Projectile.js';
import { CONFIG } from '../config.js';

export class GameState {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;

    this.player = new Player(this.centerX, this.centerY, CONFIG.player.radius);
    // Initial setup for player spells and essence
    this.player.equipSpells([], [5, 0, 0, 0]);

    this.waveManager = new WaveManager(this.centerX, this.centerY);
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];

    this.score = 0;
    this.paused = false;
  }

  update(dt) {
    if (this.paused) return;

    // Update wave manager
    this.waveManager.update(dt);

    // Spawn new wave if needed
    if (this.waveManager.waveActive && this.enemies.length === 0) {
      this.enemies = this.waveManager.spawnWave();
    }

    // Update player and check for casting
    const readySlots = this.player.update(dt);
    if (readySlots) {
      for (const slotIndex of readySlots) {
        this.castSpell(slotIndex);
      }
    }

    // Update knockback on enemies
    for (const enemy of this.enemies) {
      if (enemy.knockbackTimer && enemy.knockbackTimer > 0) {
        enemy.knockbackTimer -= dt;
        enemy.x += enemy.knockbackVx * dt;
        enemy.y += enemy.knockbackVy * dt;
        
        // Apply friction
        enemy.knockbackVx *= 0.85;
        enemy.knockbackVy *= 0.85;
      }
    }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.centerX, this.centerY);
    }

    // Update projectiles and collect trail particles
    for (const projectile of this.projectiles) {
      const trailParticles = projectile.update(dt, this.enemies, this.width, this.height);
      if (trailParticles) {
        this.particles.push(...trailParticles);
      }
    }

    // Check collisions
    this.checkCollisions();

    // Remove dead entities
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.enemies = this.enemies.filter(e => {
      if (!e.alive) {
        this.waveManager.enemyDefeated();
        this.score += 10;
        return false;
      }
      return true;
    });
  }

  castSpell(slotIndex) {
    if (!this.player.equippedSpells[slotIndex]) return;

    const spell = this.player.equippedSpells[slotIndex];

    // Find nearest enemy or shoot forward
    let targetX = this.centerX;
    let targetY = this.centerY - 100;

    if (this.enemies.length > 0) {
      const nearest = this.findNearestEnemy();
      if (nearest) {
        targetX = nearest.x;
        targetY = nearest.y;
      }
    }

    const projectile = new Projectile(
      this.player.x,
      this.player.y,
      spell,
      targetX,
      targetY
    );

    this.projectiles.push(projectile);
  }

  findNearestEnemy() {
    let nearest = null;
    let minDist = Infinity;

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  checkCollisions() {
    for (const projectile of this.projectiles) {
      if (!projectile.alive) continue;

      // For chaining, check if we've already hit this enemy
      const chainedEnemies = projectile.chainedEnemies || [];

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;

        // For chaining, check if we've already hit this enemy
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
            // Apply projectile properties
            projectile.applyProjectileProperties(enemy);
            
            // Create impact particles
            const impactParticles = projectile.createImpactParticles();
            this.particles.push(...impactParticles);
            
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

  handleSplitting(parentProjectile, collisionEnemy) {
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
      
      this.projectiles.push(childProjectile);
    }
  }

  findChainTarget(currentProjectile, chainedEnemies) {
    const chainRange = 150; // How far to search for next target
    let nearest = null;
    let minDist = chainRange;

    for (const enemy of this.enemies) {
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

  createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 50 + Math.random() * 50;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.5,
        maxLife: 0.5,
        size: 2,
        type: 'spark'
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      // Handle attracted particles (void effect)
      if (particle.attracted && particle.targetX !== undefined) {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          particle.vx += (dx / dist) * 200 * dt;
          particle.vy += (dy / dist) * 200 * dt;
        }
      }
      
      // Handle swirl particles
      if (particle.swirlAngle !== undefined) {
        particle.swirlAngle += particle.swirlSpeed * dt;
        particle.x += Math.cos(particle.swirlAngle) * particle.swirlRadius * dt * 10;
        particle.y += Math.sin(particle.swirlAngle) * particle.swirlRadius * dt * 10;
      }
      
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      
      // Apply drag for smoke particles
      if (particle.type === 'smoke') {
        particle.vx *= 0.95;
        particle.vy *= 0.95;
      }
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}