import { MovementHandler } from './projectile/MovementHandler.js';
import { ParticleEmitter } from './projectile/ParticleEmitter.js';
import { PropertyApplier } from './projectile/PropertyApplier.js';

export class Projectile {
  constructor(x, y, spell, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.spell = spell;
    this.vx = 0;
    this.vy = 0;
    this.radius = 8;
    this.lifetime = 5000;
    this.alive = true;
    this.bounces = 0;
    this.maxBounces = spell.properties.bouncing || 0;
    this.particleTimer = 0;
    
    // Track enemies hit for piercing
    this.enemiesHit = new Set();
    
    // Properties from spell
    this.properties = spell.properties || {};

    // Generation tracking for splitting/chaining potency degradation
    this.generation = 0;
    this.potencyMultiplier = 1.0;

    // Movement type defaulting to standard
    this.movementType = 'standard';
    this.gravity = 0;

    // Initialize movement (determines type and sets initial velocity)
    MovementHandler.initMovement(this, targetX, targetY);

    // Initialize wave properties if applicable
    MovementHandler.initWaveProperties(this);
  }

  update(dt, enemies, canvasWidth, canvasHeight) {
    this.lifetime -= dt * 1000;
    if (this.lifetime <= 0) {
      this.alive = false;
      return null;
    }

    // Update movement based on type
    MovementHandler.updateMovement(this, dt, enemies);
    
    // Bounce off walls
    if (this.properties.bouncing && this.bounces < this.maxBounces) {
      if (this.x < 0 || this.x > canvasWidth) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(canvasWidth, this.x));
        this.bounces++;
      }
      if (this.y < 0 || this.y > canvasHeight) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(canvasHeight, this.y));
        this.bounces++;
      }
    } else if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.alive = false;
      return null;
    }

    // Emit trail particles
    return ParticleEmitter.emitTrailParticles(this, dt);
  }

  createImpactParticles() {
    return ParticleEmitter.createImpactParticles(this);
  }

  applyProjectileProperties(enemy) {
    PropertyApplier.applyProperties(this, enemy);
  }
}