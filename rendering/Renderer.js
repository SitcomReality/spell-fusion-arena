export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  
  clear(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  renderPlayer(player) {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  renderEnemy(enemy) {
    if (!enemy.alive) return;
    
    const alivePixels = enemy.pixelBody.getAlivePixels();
    const offsetX = enemy.x - enemy.type.width / 2;
    const offsetY = enemy.y - enemy.type.height / 2;
    
    const color = enemy.color;
    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    for (const pixel of alivePixels) {
      this.ctx.fillRect(offsetX + pixel.x, offsetY + pixel.y, 1, 1);
    }
  }
  
  renderProjectile(projectile) {
    const color = projectile.spell.color;
    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    this.ctx.beginPath();
    this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Trail effect
    this.ctx.globalAlpha = 0.3;
    this.ctx.beginPath();
    this.ctx.arc(projectile.x - projectile.vx * 0.02, projectile.y - projectile.vy * 0.02, projectile.radius * 0.7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
  }
  
  renderParticles(particles) {
    for (const particle of particles) {
      const alpha = particle.life / particle.maxLife;
      const color = particle.color;
      this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
    }
  }
}

