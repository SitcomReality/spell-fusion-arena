import { PixelBody } from './PixelBody.js';

export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.speed = type.speed;
    this.color = type.color;
    
    this.pixelBody = new PixelBody(type.width, type.height, type.pattern);
  }
  
  update(dt, centerX, centerY) {
    if (!this.alive) return;
    
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
  
  takeDamage(projectile) {
    const localX = projectile.x - (this.x - this.type.width / 2);
    const localY = projectile.y - (this.y - this.type.height / 2);
    
    const destroyed = this.pixelBody.damage(
      localX,
      localY,
      projectile.radius * 2,
      projectile.spell.traits.destructionType
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

