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
    this.maxBounces = spell.traits.projectileType === 'bouncing' ? 3 : 0;

    this.initVelocity(targetX, targetY);
  }

  initVelocity(targetX, targetY) {
    const speed = this.spell.traits.speed;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.spell.traits.projectileType === 'lob') {
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
      return;
    }

    // Apply gravity for lob projectiles
    this.vy += this.gravity * dt;

    // Homing behavior
    if (this.spell.traits.projectileType === 'homing' && enemies.length > 0) {
      const target = this.findNearestEnemy(enemies);
      if (target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const homingStrength = 150 * dt;
        this.vx += (dx / dist) * homingStrength;
        this.vy += (dy / dist) * homingStrength;

        // Maintain speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const targetSpeed = this.spell.traits.speed;
        this.vx = (this.vx / currentSpeed) * targetSpeed;
        this.vy = (this.vy / currentSpeed) * targetSpeed;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Bounce off walls
    if (this.spell.traits.projectileType === 'bouncing' && this.bounces < this.maxBounces) {
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