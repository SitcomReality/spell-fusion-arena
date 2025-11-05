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
    const readySlots = this.player.update(dt, CONFIG.player.castInterval);
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

      // Check for chaining
      const chainsAvailable = projectile.properties.chaining && projectile.properties.chaining > 0;
      const maxChains = chainsAvailable ? Math.floor(projectile.properties.chaining) + 1 : 0;
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
            
            if (pierceCount >= maxPierces) {
              projectile.alive = false;
            } else {
              projectile.pierceCount = pierceCount + 1;
            }

            // Handle chaining
            if (chainsAvailable && chainedEnemies.length < maxChains) {
              chainedEnemies.push(enemy);
              projectile.chainedEnemies = chainedEnemies;
            } else if (!chainsAvailable) {
              projectile.alive = false;
            }
          }
        }
      }
    }
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