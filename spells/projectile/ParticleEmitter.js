export class ParticleEmitter {
  static emitTrailParticles(projectile, dt) {
    const visuals = projectile.spell.visualEffects;
    if (!visuals || !visuals.trail) return null;

    projectile.particleTimer += dt;
    const emissionRate = 0.05 / (visuals.trailDensity || 1);
    
    if (projectile.particleTimer < emissionRate) return null;
    
    projectile.particleTimer = 0;
    
    const particles = [];
    const density = visuals.trailDensity || 1;
    
    // Use accent or secondary color for some trail particles
    const primaryColor = projectile.spell.color;
    const accentColor = projectile.spell.accentColor || primaryColor;
    const useAccent = projectile.spell.accentColor && Math.random() > 0.5;
    
    for (let i = 0; i < density; i++) {
      const particle = {
        x: projectile.x + (Math.random() - 0.5) * 3,
        y: projectile.y + (Math.random() - 0.5) * 3,
        vx: -projectile.vx * 0.1 + (Math.random() - 0.5) * 20,
        vy: -projectile.vy * 0.1 + (Math.random() - 0.5) * 20,
        color: useAccent && i % 2 === 0 ? accentColor : primaryColor,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.3 + Math.random() * 0.3,
        size: visuals.trailSize || 3,
        type: visuals.trailType || 'trail',
        opacity: 0.7
      };
      
      // Removed attraction/repulsion handling (vortex / pullParticles) — deprecated properties are ignored.
      
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

  static createImpactParticles(projectile) {
    const visuals = projectile.spell.visualEffects;
    if (!visuals) return [];
    
    const particles = [];
    const count = visuals.impactParticles || 15;
    
    // Increase particles for certain properties
    let particleMultiplier = 1;
    if (projectile.properties.aoe && projectile.properties.aoe > 0) particleMultiplier += 0.5;
    if (projectile.properties.knockback && projectile.properties.knockback > 0) particleMultiplier += 0.3;
    
    const primaryColor = projectile.spell.color;
    const accentColor = projectile.spell.accentColor;
    const secondaryColor = projectile.spell.secondaryColor || accentColor || primaryColor;
    
    for (let i = 0; i < count * particleMultiplier; i++) {
      const angle = (Math.PI * 2 * i) / (count * particleMultiplier) + (Math.random() - 0.5) * 0.5;
      const speed = 50 + Math.random() * 100;
      
      // Alternate between colors for visual variety
      let particleColor = primaryColor;
      if (accentColor && i % 3 === 0) {
        particleColor = accentColor;
      } else if (secondaryColor && i % 3 === 1) {
        particleColor = secondaryColor;
      }
      
      const particle = {
        x: projectile.x,
        y: projectile.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColor,
        // Ensure robust lifetime and opacity defaults so renderer always has sane values
        life: (0.4 + Math.random() * 0.4),
        maxLife: (0.4 + Math.random() * 0.4),
        size: Math.max(0.5, (visuals.trailSize || 3) * 1.5),
        opacity: 1,
        type: visuals.impactType || 'spark',
        // leave texture undefined so EffectsRenderer falls back to shape renderers
      };
      
      particles.push(particle);
    }
    
    return particles;
  }
}