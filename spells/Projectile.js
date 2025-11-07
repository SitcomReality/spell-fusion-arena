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
    this.potencyMultiplier = 1.0; // How strong this generation's properties are

    // New movement properties
    this.movementType = 'standard';
    const spiral = this.properties.spiral || 0;
    const wave = this.properties.wave || 0;
    const homing = this.properties.homing || 0;

    if (spiral > 0.5 && spiral > (wave + homing)) {
      this.movementType = 'spiral';
      this.spiralOriginX = x;
      this.spiralOriginY = y;
      this.spiralAngle = Math.atan2(targetY - y, targetX - x);
      // Start slightly tighter than before so initial orbit is compact
      this.spiralRadius = Math.max(1, this.radius * 0.6);
      this.spiralDirection = Math.random() < 0.5 ? 1 : -1;
      // Reduce outward expansion so projectiles stay in orbit longer, but increase rotation for more revolutions
      const baseSpeed = this.properties.speed || 150;
      this.spiralOutwardSpeed = baseSpeed * 0.22; // much slower radial growth
      // Make rotation noticeably faster (more radians/sec) scaled by spiral gene
      this.spiralRotationSpeed = 4 + spiral * 2.5; // Rad/s
    } else {
      // Wave properties
      if (wave > 0) {
        this.waveAngle = 0;
        this.waveAmplitude = 15 + wave * 40;
        this.waveFrequency = 5 + wave * 5;
      }
    }

    this.initVelocity(targetX, targetY);
  }

  initVelocity(targetX, targetY) {
    const speed = this.spell.properties.speed;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.movementType === 'spiral') {
      // Initial velocity for spiral is tangential
      const tangentAngle = this.spiralAngle + (Math.PI / 2) * this.spiralDirection;
      this.vx = Math.cos(tangentAngle) * speed;
      this.vy = Math.sin(tangentAngle) * speed;
      this.gravity = 0;
    } else if (this.spell.properties.lob) {
      this.vx = (dx / dist) * speed * 0.7;
      this.vy = (dy / dist) * speed * 0.7 - 100;
      this.gravity = 200;
    } else {
      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;
      this.gravity = 0;
    }
  }

  update(dt, enemies, canvasWidth, canvasHeight) {
    this.lifetime -= dt * 1000;
    if (this.lifetime <= 0) {
      this.alive = false;
      return null;
    }

    // --- MOVEMENT LOGIC ---
    if (this.movementType === 'spiral') {
      // Spiral movement: orbit origin and move outwards
      this.spiralRadius += this.spiralOutwardSpeed * dt;
      this.spiralAngle += this.spiralRotationSpeed * dt * this.spiralDirection;
      
      const nextX = this.spiralOriginX + Math.cos(this.spiralAngle) * this.spiralRadius;
      const nextY = this.spiralOriginY + Math.sin(this.spiralAngle) * this.spiralRadius;
      
      // Update velocity for collision/orientation purposes
      this.vx = (nextX - this.x) / dt;
      this.vy = (nextY - this.y) / dt;
      this.x = nextX;
      this.y = nextY;
      
    } else {
      // Standard movement (linear + modifiers)
      
      // Apply gravity for lob projectiles
      this.vy += this.gravity * dt;

      // Homing behavior
      if (this.properties.homing && enemies.length > 0) {
        const target = this.findNearestEnemy(enemies);
        if (target) {
          const dx = target.x - this.x;
          const dy = target.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Homing strength scales with property value
          const homingStrength = (100 + this.properties.homing * 150) * dt;
          this.vx += (dx / dist) * homingStrength;
          this.vy += (dy / dist) * homingStrength;

          // Maintain speed
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          const targetSpeed = this.spell.properties.speed;
          this.vx = (this.vx / currentSpeed) * targetSpeed;
          this.vy = (this.vy / currentSpeed) * targetSpeed;
        }
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Wave motion perpendicular to velocity
      if (this.waveAmplitude) {
        this.waveAngle += this.waveFrequency * dt;
        const perpAngle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        const waveOffset = Math.sin(this.waveAngle) * this.waveAmplitude;
        this.x += Math.cos(perpAngle) * waveOffset * dt;
        this.y += Math.sin(perpAngle) * waveOffset * dt;
      }
    }

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
    return this.emitTrailParticles(dt);
  }

  emitTrailParticles(dt) {
    const visuals = this.spell.visualEffects;
    if (!visuals || !visuals.trail) return null;

    this.particleTimer += dt;
    const emissionRate = 0.05 / (visuals.trailDensity || 1); // Higher density = more frequent
    
    if (this.particleTimer < emissionRate) return null;
    
    this.particleTimer = 0;
    
    const particles = [];
    const density = visuals.trailDensity || 1;
    
    for (let i = 0; i < density; i++) {
      const particle = {
        x: this.x + (Math.random() - 0.5) * 3,
        y: this.y + (Math.random() - 0.5) * 3,
        vx: -this.vx * 0.1 + (Math.random() - 0.5) * 20,
        vy: -this.vy * 0.1 + (Math.random() - 0.5) * 20,
        color: this.spell.color,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.3 + Math.random() * 0.3,
        size: visuals.trailSize || 3,
        type: visuals.trailType || 'trail',
        opacity: 0.7
      };
      
      // Special effects for specific types
      if (visuals.vortex || visuals.pullParticles) {
        particle.vx *= -0.5;
        particle.vy *= -0.5;
        particle.attracted = true;
        particle.targetX = this.x;
        particle.targetY = this.y;
      }
      
      if (visuals.swirl) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5;
        particle.swirlAngle = angle;
        particle.swirlRadius = radius;
        particle.swirlSpeed = 5;
      }
      
      particles.push(particle);
    }
    
    return particles;
  }

  createImpactParticles() {
    const visuals = this.spell.visualEffects;
    if (!visuals) return [];
    
    const particles = [];
    const count = visuals.impactParticles || 15;
    
    // Increase particles for certain properties
    let particleMultiplier = 1;
    if (this.properties.aoe && this.properties.aoe > 0) particleMultiplier += 0.5;
    if (this.properties.knockback && this.properties.knockback > 0) particleMultiplier += 0.3;
    
    for (let i = 0; i < count * particleMultiplier; i++) {
      const angle = (Math.PI * 2 * i) / (count * particleMultiplier) + (Math.random() - 0.5) * 0.5;
      const speed = 50 + Math.random() * 100;
      
      const particle = {
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: this.spell.color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.4 + Math.random() * 0.4,
        size: (visuals.trailSize || 3) * 1.5,
        type: visuals.impactType || 'spark',
        opacity: 1
      };
      
      particles.push(particle);
    }
    
    return particles;
  }

  applyProjectileProperties(enemy) {
    const props = this.properties;
    
    // Knockback
    if (props.knockback && props.knockback > 0) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const knockbackForce = 150 * props.knockback;
        enemy.knockbackVx = (dx / dist) * knockbackForce;
        enemy.knockbackVy = (dy / dist) * knockbackForce;
        enemy.knockbackTimer = 0.2;
      }
    }
    
    // Slowing
    if (props.slowing && props.slowing > 0) {
      const duration = 2 + props.slowing * 2;
      const slowAmount = Math.min(0.7, 0.3 + props.slowing * 0.1);
      enemy.applySlowing(duration, slowAmount);
    }
    
    // General DoT (treat as burning effect)
    if (props.dot && props.dot > 0) {
      const duration = 2 + props.dot * 1.5;
      const damagePerTick = Math.max(1, this.spell.properties.damage * props.dot * 0.15);
      enemy.applyBurning(duration, damagePerTick, this.spell.color);
    }
    
    // Poison
    if (props.poison && props.poison > 0) {
      const duration = 3 + props.poison * 2;
      const damagePerTick = Math.max(1, this.spell.properties.damage * props.poison * 0.1);
      enemy.applyPoison(duration, damagePerTick, this.spell.color);
    }
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }
}