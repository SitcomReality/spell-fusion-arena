export class ParticleManager {
  constructor(gameState) {
    this.game = gameState;
  }

  createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 50 + Math.random() * 50;
      this.game.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.5,
        maxLife: 0.5,
        size: 2,
        type: 'spark'
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.game.particles) {
      // Handle attracted particles (void effect)
      if (particle.attracted && particle.targetX !== undefined) {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          particle.vx += (dx / dist) * 200 * dt;
          particle.vy += (dy / dist) * 200 * dt;
        }
      }
      
      // Handle swirl particles
      if (particle.swirlAngle !== undefined) {
        particle.swirlAngle += particle.swirlSpeed * dt;
        particle.x += Math.cos(particle.swirlAngle) * particle.swirlRadius * dt * 10;
        particle.y += Math.sin(particle.swirlAngle) * particle.swirlRadius * dt * 10;
      }
      
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      
      // Apply drag for smoke particles
      if (particle.type === 'smoke') {
        particle.vx *= 0.95;
        particle.vy *= 0.95;
      }
    }
    this.game.particles = this.game.particles.filter(p => p.life > 0);
  }
}

