import { PixelBody } from './PixelBody.js';

export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.speed = type.speed;
    this.baseSpeed = type.speed;
    this.color = type.color;
    
    this.pixelBody = new PixelBody(type.width, type.height, type.pattern);
    
    // Status effects
    this.statusEffects = {
      burning: { active: false, duration: 0, damage: 0 },
      poison: { active: false, duration: 0, damage: 0 },
      slowing: { active: false, duration: 0, slowAmount: 0 }
    };
    this.burnTickTimer = 0;
    this.poisonTickTimer = 0;
  }
  
  update(dt, centerX, centerY) {
    if (!this.alive) return;
    
    // Update status effects
    this.updateStatusEffects(dt);
    
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 5) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
    
    if (!this.pixelBody.intact) {
      this.alive = false;
    }
  }

  updateStatusEffects(dt) {
    // Update slowing
    if (this.statusEffects.slowing.active) {
      this.statusEffects.slowing.duration -= dt;
      if (this.statusEffects.slowing.duration <= 0) {
        this.statusEffects.slowing.active = false;
        this.speed = this.baseSpeed;
      } else {
        this.speed = this.baseSpeed * (1 - this.statusEffects.slowing.slowAmount);
      }
    }

    // Update burning
    if (this.statusEffects.burning.active) {
      this.statusEffects.burning.duration -= dt;
      this.burnTickTimer -= dt;
      
      if (this.statusEffects.burning.duration <= 0) {
        this.statusEffects.burning.active = false;
      } else if (this.burnTickTimer <= 0) {
        this.takeBurnDamage(this.statusEffects.burning.damage);
        this.burnTickTimer = 0.3; // Burn ticks every 0.3 seconds
      }
    }

    // Update poison
    if (this.statusEffects.poison.active) {
      this.statusEffects.poison.duration -= dt;
      this.poisonTickTimer -= dt;
      
      if (this.statusEffects.poison.duration <= 0) {
        this.statusEffects.poison.active = false;
      } else if (this.poisonTickTimer <= 0) {
        this.takePoisonDamage(this.statusEffects.poison.damage);
        this.poisonTickTimer = 0.25; // Poison ticks every 0.25 seconds
      }
    }
  }

  applySlowing(duration, slowAmount) {
    if (!this.statusEffects.slowing.active || this.statusEffects.slowing.duration < duration) {
      this.statusEffects.slowing.active = true;
      this.statusEffects.slowing.duration = duration;
      this.statusEffects.slowing.slowAmount = Math.min(slowAmount, 0.8); // Cap at 80% slow
    }
  }

  applyBurning(duration, damagePerTick) {
    if (!this.statusEffects.burning.active || this.statusEffects.burning.duration < duration) {
      this.statusEffects.burning.active = true;
      this.statusEffects.burning.duration = duration;
      this.statusEffects.burning.damage = damagePerTick;
      this.burnTickTimer = 0;
    }
  }

  applyPoison(duration, damagePerTick) {
    if (!this.statusEffects.poison.active || this.statusEffects.poison.duration < duration) {
      this.statusEffects.poison.active = true;
      this.statusEffects.poison.duration = duration;
      this.statusEffects.poison.damage = damagePerTick;
      this.poisonTickTimer = 0;
    }
  }

  takeBurnDamage(damage) {
    const localX = this.x;
    const localY = this.y;
    this.pixelBody.damage(this.type.width / 2, this.type.height / 2, this.type.width / 3);
  }

  takePoisonDamage(damage) {
    const localX = this.x;
    const localY = this.y;
    this.pixelBody.damage(this.type.width / 2, this.type.height / 2, this.type.width / 4);
  }
  
  takeDamage(projectile) {
    const localX = projectile.x - (this.x - this.type.width / 2);
    const localY = projectile.y - (this.y - this.type.height / 2);
    
    const destroyed = this.pixelBody.damage(
      localX,
      localY,
      projectile.radius * 2,
      'explosive' // Default destruction type since it's removed from spells
    );
    
    return destroyed > 0;
  }
}

export const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    speed: 30,
    width: 16,
    height: 16,
    pattern: 'blob',
    color: { r: 180, g: 50, b: 50 }
  },
  
  runner: {
    name: 'Runner',
    speed: 60,
    width: 12,
    height: 12,
    pattern: 'blob',
    color: { r: 50, g: 180, b: 50 }
  },
  
  tank: {
    name: 'Tank',
    speed: 15,
    width: 24,
    height: 24,
    pattern: 'square',
    color: { r: 80, g: 80, b: 180 }
  }
};