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
  }

  update(dt) {
    // Update wave manager
    this.waveManager.update(dt);

    // Spawn new wave if needed
    if (this.waveManager.waveActive && this.enemies.length === 0) {
      this.enemies = this.waveManager.spawnWave();
    }

    // Update player and check for casting
    if (this.player.update(dt, CONFIG.player.castInterval)) {
      this.castSpell();
    }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.centerX, this.centerY);
    }

    // Update projectiles
    for (const projectile of this.projectiles) {
      projectile.update(dt, this.enemies, this.width, this.height);
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

  castSpell() {
    if (!this.player.equippedSpell) return;

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
      this.player.equippedSpell,
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

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;

        const dx = projectile.x - enemy.x;
        const dy = projectile.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < projectile.radius + enemy.type.width / 2) {
          const hit = enemy.takeDamage(projectile);
          if (hit) {
            this.createParticles(projectile.x, projectile.y, projectile.spell.color);
            projectile.alive = false;
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
        maxLife: 0.5
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }
}