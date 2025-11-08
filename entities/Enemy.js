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
      burning: { active: false, duration: 0, damage: 0, color: null },
      poison: { active: false, duration: 0, damage: 0, color: null },
      slowing: { active: false, duration: 0, slowAmount: 0 }
    };
    this.burnTickTimer = 0;
    this.poisonTickTimer = 0;
    
    this.particleRequests = []; // Stores particles to be emitted by GameState
    
    // Optional spawn delay (seconds). When >0 the enemy will exist but not move/approach until it counts down.
    this.spawnDelay = 0;
  }
  
  update(dt, centerX, centerY) {
    if (!this.alive) return;

    // If this enemy has a spawnDelay, count it down and skip behavior until it reaches zero.
    if (this.spawnDelay && this.spawnDelay > 0) {
      this.spawnDelay -= dt;
      // Once spawnDelay elapses, ensure speed resets to base in case status effects were applied earlier.
      if (this.spawnDelay <= 0) {
        this.spawnDelay = 0;
        this.speed = this.baseSpeed;
      } else {
        return;
      }
    }
    
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
        this.emitDoTParticles('burning', this.statusEffects.burning.color);
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
        this.emitDoTParticles('poison', this.statusEffects.poison.color);
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

  applyBurning(duration, damagePerTick, color) {
    if (!this.statusEffects.burning.active || this.statusEffects.burning.duration < duration) {
      this.statusEffects.burning.active = true;
      this.statusEffects.burning.duration = duration;
      this.statusEffects.burning.damage = damagePerTick;
      this.statusEffects.burning.color = color;
      this.burnTickTimer = 0;
    }
  }

  applyPoison(duration, damagePerTick, color) {
    if (!this.statusEffects.poison.active || this.statusEffects.poison.duration < duration) {
      this.statusEffects.poison.active = true;
      this.statusEffects.poison.duration = duration;
      this.statusEffects.poison.damage = damagePerTick;
      this.statusEffects.poison.color = color;
      this.poisonTickTimer = 0;
    }
  }

  takeBurnDamage(damage) {
    const localX = this.x;
    const localY = this.y;
    // Damage in small bursts for DoT effect
    this.pixelBody.damage(this.type.width / 2, this.type.height / 2, this.type.width / 3);
  }

  takePoisonDamage(damage) {
    const localX = this.x;
    const localY = this.y;
    // Poison is more precise/small
    this.pixelBody.damage(this.type.width / 2, this.type.height / 2, this.type.width / 4);
  }
  
  emitDoTParticles(type, color) {
    // Generate particles derived from the DoT effect color
    if (!color) return;
    
    // Make DoT effects visibly more profuse:
    // - burning: many small energetic sparks
    // - poison (or other non-burning DoT): more smoke/acid puffs
    const isBurn = type === 'burning';
    const minCount = isBurn ? 3 : 2;
    const maxCount = isBurn ? 6 : 4;
    const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (isBurn ? 20 : 8) + Math.random() * (isBurn ? 40 : 16);
      const particleType = isBurn ? 'spark' : 'smoke';
      const size = isBurn ? (1 + Math.random() * 1.5) : (1.5 + Math.random() * 1.5);
      const life = (isBurn ? 0.25 : 0.35) + Math.random() * (isBurn ? 0.35 : 0.45);
      
      // Spread particles across a slightly larger area so DoT looks more active
      const spreadX = (Math.random() - 0.5) * this.type.width * (isBurn ? 0.5 : 0.7);
      const spreadY = (Math.random() - 0.5) * this.type.height * (isBurn ? 0.5 : 0.7);
      
      this.particleRequests.push({
        x: this.x + spreadX,
        y: this.y + spreadY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isBurn ? Math.random() * 10 : 0),
        color: color,
        life: life,
        maxLife: life,
        size: size,
        type: particleType,
        opacity: isBurn ? 0.95 : 0.85
      });
    }
  }

  takeDamageFromSource(sourceX, sourceY, destructionRadius, destructionType = 'explosive') {
    const localX = sourceX - (this.x - this.type.width / 2);
    const localY = sourceY - (this.y - this.type.height / 2);
    
    const destroyed = this.pixelBody.damage(
      localX,
      localY,
      destructionRadius,
      destructionType
    );
    
    return destroyed > 0;
  }
  
  takeDamage(projectile) {
    // Standard projectile damage application
    const destructionRadius = projectile.radius * 2;
    // Note: Projectiles currently don't pass destructionType dynamically, using default 'explosive'
    
    const destroyed = this.takeDamageFromSource(
      projectile.x, 
      projectile.y, 
      destructionRadius, 
      'explosive'
    );
    
    return destroyed > 0;
  }
}

export const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    speed: 15,
    width: 16,
    height: 16,
    pattern: 'blob',
    color: { r: 180, g: 50, b: 50 }
  },
  
  runner: {
    name: 'Runner',
    speed: 30,
    width: 12,
    height: 12,
    pattern: 'blob',
    color: { r: 50, g: 180, b: 50 }
  },
  
  tank: {
    name: 'Tank',
    speed: 12,
    width: 24,
    height: 24,
    pattern: 'square',
    color: { r: 80, g: 80, b: 180 }
  }
};