import { Player } from '../entities/Player.js';
import { WaveManager } from './WaveManager.js';
import { Projectile } from '../spells/Projectile.js';
import { CONFIG } from '../config.js';
import { CollisionHandler } from './CollisionHandler.js';
import { ParticleManager } from './ParticleManager.js';
import { castSpell } from './GameActions.js';

export class GameState {
  constructor(canvasWidth, canvasHeight, seed = null, unlockedElementKeys = []) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;

    // Track which elements are unlocked for this game session
    this.unlockedElementKeys = [...unlockedElementKeys];

    this.player = new Player(this.centerX, this.centerY, CONFIG.player.radius);
    // Initial setup for player spells and essence
    this.player.equipSpells([], [5, 0, 0, 0]);

    this.waveManager = new WaveManager(this.centerX, this.centerY, seed);
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.aoeEffects = []; // transient AoE visual effects

    this.score = 0;
    this.paused = false;
    this.waveStartPending = false; // NEW: True when waiting for player to start wave
    this.gameOver = false; // NEW: Track if game is over
    this.onGameOver = null; // NEW: Callback when player dies

    // NEW: Game speed multiplier (affects enemy speed, projectile speed, DoT ticks, etc.)
    this.speedMultiplier = 1;

    // New: handlers for collision and particles
    this.collisionHandler = new CollisionHandler(this);
    this.particleManager = new ParticleManager(this);
    this.lastFocusReward = 0; // Track focus rewarded this wave

    this.seed = seed;
  }

  // NEW: Set the game speed multiplier
  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = Math.max(0.1, multiplier);
  }

  unlockElement(elementKey) {
    if (!this.unlockedElementKeys.includes(elementKey)) {
      this.unlockedElementKeys.push(elementKey);
    }
  }

  update(dt) {
    if (this.paused || this.waveStartPending || this.gameOver) return;
    
    const scaledDt = dt * this.speedMultiplier;
    
    this.updateAoEs(scaledDt);
    this.waveManager.update(scaledDt);

    if (this.waveManager.waveActive && this.enemies.length === 0) {
      this.enemies = this.waveManager.spawnWave();
      try {
        if (window && window.gameInstance && window.gameInstance.hud) {
          window.gameInstance.hud.setEnemies(this.enemies.length);
          window.gameInstance.hud.setWave(this.waveManager.currentWave);
        }
      } catch (e) { /* silent */ }
    }

    const readySlots = this.player.update(scaledDt);
    if (readySlots) {
      for (const slotIndex of readySlots) {
        castSpell(this, slotIndex);
      }
    }

    // Update knockback on enemies
    for (const enemy of this.enemies) {
      if (enemy.knockbackTimer && enemy.knockbackTimer > 0) {
        enemy.knockbackTimer -= scaledDt;
        enemy.x += enemy.knockbackVx * scaledDt;
        enemy.y += enemy.knockbackVy * scaledDt;
        enemy.knockbackVx *= 0.85;
        enemy.knockbackVy *= 0.85;
      }
    }

    for (const enemy of this.enemies) {
      enemy.update(scaledDt, this.centerX, this.centerY);
      if (enemy.particleRequests.length > 0) {
        this.particles.push(...enemy.particleRequests);
        enemy.particleRequests.length = 0;
      }
    }

    // Check for enemies reaching center
    const enemiesToRemove = [];
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (!enemy.alive) continue;
      
      const dx = enemy.x - this.centerX;
      const dy = enemy.y - this.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < enemy.type.width / 2 + this.player.radius) {
        // Calculate damage based on boss health if applicable
        let damageAmount = 10;
        if (enemy.type.isBoss && enemy.bossNumber > 0) {
          damageAmount = this.calculateBossDamage(enemy);
        }
        
        this.player.hp -= damageAmount;
        try {
          this.particles.push({
            type: 'floating-text',
            x: enemy.x,
            y: enemy.y,
            vx: 0,
            vy: -30,
            text: `-${damageAmount}`,
            color: { r: 255, g: 80, b: 80 },
            size: 16,
            life: 0.9,
            maxLife: 0.9,
            opacity: 1
          });
        } catch (e) {}
        
        enemiesToRemove.push(i);
        
        try {
          if (window && window.gameInstance && window.gameInstance.hud) {
            window.gameInstance.hud.setHealth(this.player.hp);
          }
        } catch (e) { /* silent */ }
        
        if (this.player.hp <= 0) {
          this.gameOver = true;
          if (this.onGameOver) {
            this.onGameOver();
          }
          return;
        }
      }
    }
    
    for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
      const idx = enemiesToRemove[i];
      this.enemies[idx].alive = false;
      this.enemies[idx]._defeatedCounted = true;
      this.waveManager.enemyDefeated();
    }

    for (const projectile of this.projectiles) {
      const trailParticles = projectile.update(scaledDt, this.enemies, this.width, this.height);
      if (trailParticles) {
        this.particles.push(...trailParticles);
      }
    }

    this.collisionHandler.checkCollisions();

    this.projectiles = this.projectiles.filter(p => p.alive);
    this.enemies = this.enemies.filter(e => {
      if (!e.alive) {
        if (!e._defeatedCounted) {
          this.waveManager.enemyDefeated();
          this.score += 10;
        }
        try {
          if (window && window.gameInstance && window.gameInstance.hud) {
            window.gameInstance.hud.setScore(this.score);
            const remaining = Math.max(0, this.enemies.length - 1);
            window.gameInstance.hud.setEnemies(remaining);
          }
        } catch (e) { /* silent */ }
        return false;
      }
      return true;
    });
  }

  // NEW: Calculate boss damage based on remaining health
  calculateBossDamage(boss) {
    const maxDamage = boss.bossNumber * 100;
    
    // Calculate health percentage (alive pixels / total pixels)
    const alivePixels = boss.pixelBody.getAlivePixels().length;
    const totalPixels = boss.pixelBody.pixels.length;
    const healthPercent = totalPixels > 0 ? alivePixels / totalPixels : 0;
    
    let damage = Math.max(1, Math.round(maxDamage * healthPercent));
    
    // For double bosses, damage is split between the two
    if (boss.type.bossType === 'double') {
      damage = Math.round(damage / 2);
    }
    
    return damage;
  }

  // NEW: Signal that the player is ready to start the current wave
  startWave() {
    this.waveStartPending = false;
    this.waveManager.waveActive = true;
  }

  // NEW: Prepare to show wave start button (pause wave spawning)
  showWaveStart() {
    this.waveStartPending = true;
  }

  createParticles(x, y, color) {
    this.particleManager.createParticles(x, y, color);
  }

  updateParticles(dt) {
    // Use scaled dt for particles too
    this.particleManager.updateParticles(dt * this.speedMultiplier);
  }

  updateAoEs(dt) {
    if (!this.aoeEffects) return;
    for (const aoe of this.aoeEffects) {
      aoe.life -= dt;
    }
    this.aoeEffects = this.aoeEffects.filter(a => a.life > 0);
  }

  createAoEVisual(x, y, radius, color, duration = 0.6) {
    this.aoeEffects.push({ x, y, radius, color, life: duration, maxLife: duration });
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}