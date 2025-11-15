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
    const accentColor = projectile.spell.accentColor;
    const shapeVariant = projectile.spell.visualEffects?.shapeVariant || 'round';
    
    // Main projectile body
    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    if (shapeVariant === 'elongated') {
      // Draw elongated shape for beam-like projectiles
      this.ctx.save();
      this.ctx.translate(projectile.x, projectile.y);
      const angle = Math.atan2(projectile.vy, projectile.vx);
      this.ctx.rotate(angle);
      this.ctx.fillRect(-projectile.radius * 1.5, -projectile.radius * 0.5, projectile.radius * 3, projectile.radius);
      this.ctx.restore();
    } else if (shapeVariant === 'swirling') {
      // Draw with slight rotation effect
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add swirl accents if accent color exists
      if (accentColor) {
        this.ctx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
        const swirlOffset = Date.now() * 0.01;
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 + swirlOffset;
          const x = projectile.x + Math.cos(angle) * projectile.radius * 0.6;
          const y = projectile.y + Math.sin(angle) * projectile.radius * 0.6;
          this.ctx.beginPath();
          this.ctx.arc(x, y, projectile.radius * 0.3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    } else {
      // Round projectile
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add accent core if accent color exists
      if (accentColor) {
        this.ctx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, projectile.radius * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Trail effect with primary color
    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
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