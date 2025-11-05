export class PixelBody {
  constructor(width, height, pattern) {
    this.width = width;
    this.height = height;
    this.pixels = this.createPattern(pattern);
    this.intact = true;
  }
  
  createPattern(pattern) {
    const pixels = [];
    
    if (pattern === 'blob') {
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = Math.min(this.width, this.height) / 2;
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius && Math.random() > 0.1) {
            pixels.push({ x, y, alive: true });
          }
        }
      }
    } else if (pattern === 'square') {
      for (let y = 2; y < this.height - 2; y++) {
        for (let x = 2; x < this.width - 2; x++) {
          if (Math.random() > 0.05) {
            pixels.push({ x, y, alive: true });
          }
        }
      }
    }
    
    return pixels;
  }
  
  damage(localX, localY, radius, destructionType) {
    let destroyed = 0;
    
    for (const pixel of this.pixels) {
      if (!pixel.alive) continue;
      
      const dx = pixel.x - localX;
      const dy = pixel.y - localY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let shouldDestroy = false;
      
      if (destructionType === 'explosive') {
        shouldDestroy = dist < radius;
      } else if (destructionType === 'piercing') {
        shouldDestroy = dist < radius * 0.5;
      } else if (destructionType === 'shatter') {
        shouldDestroy = dist < radius * 1.5 && Math.random() > 0.3;
      } else {
        shouldDestroy = dist < radius;
      }
      
      if (shouldDestroy) {
        pixel.alive = false;
        destroyed++;
      }
    }
    
    // Check if body is mostly destroyed
    const aliveCount = this.pixels.filter(p => p.alive).length;
    if (aliveCount < this.pixels.length * 0.2) {
      this.intact = false;
    }
    
    return destroyed;
  }
  
  getAlivePixels() {
    return this.pixels.filter(p => p.alive);
  }
}

