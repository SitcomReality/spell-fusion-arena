export class EffectsRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderParticle(particle) {
    const alpha = particle.life / particle.maxLife;
    
    this.ctx.globalAlpha = alpha * (particle.opacity || 1);
    
    // Different rendering based on particle type
    switch (particle.type) {
      case 'trail':
        this.renderTrailParticle(particle, alpha);
        break;
      case 'aura':
        this.renderAuraParticle(particle, alpha);
        break;
      case 'beam':
        this.renderBeamParticle(particle, alpha);
        break;
      case 'smoke':
        this.renderSmokeParticle(particle, alpha);
        break;
      case 'spark':
        this.renderSparkParticle(particle, alpha);
        break;
      case 'swirl':
        this.renderSwirlParticle(particle, alpha);
        break;
      case 'glow':
        this.renderGlowParticle(particle, alpha);
        break;
      default:
        this.renderDefaultParticle(particle, alpha);
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  renderTrailParticle(particle, alpha) {
    let size = particle.size * (1 - (1 - alpha) * 0.5);
    size = Math.max(0.1, size); // Ensure minimum size
    const color = particle.color;
    
    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, size
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderAuraParticle(particle, alpha) {
    const color = particle.color;
    const size = particle.size;
    
    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderBeamParticle(particle, alpha) {
    const color = particle.color;
    
    this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    this.ctx.lineWidth = particle.size;
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(particle.x, particle.y);
    this.ctx.lineTo(particle.x + particle.vx * 0.1, particle.y + particle.vy * 0.1);
    this.ctx.stroke();
    
    // Inner glow
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    this.ctx.lineWidth = particle.size * 0.3;
    this.ctx.beginPath();
    this.ctx.moveTo(particle.x, particle.y);
    this.ctx.lineTo(particle.x + particle.vx * 0.1, particle.y + particle.vy * 0.1);
    this.ctx.stroke();
  }

  renderSmokeParticle(particle, alpha) {
    let size = particle.size * (1 + (1 - alpha) * 2);
    size = Math.max(0.1, size); // Ensure minimum size to prevent invalid gradients
    const color = particle.color;
    
    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, size
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
    gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.1})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderSparkParticle(particle, alpha) {
    const color = particle.color;
    
    // Ensure numeric, finite size and positions to avoid canvas errors
    const safeX = Number.isFinite(particle.x) ? particle.x : 0;
    const safeY = Number.isFinite(particle.y) ? particle.y : 0;
    const safeSize = Number.isFinite(particle.size) ? Math.max(0.1, particle.size) : 1;
    const coreSize = 1;

    // Bright core
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.fillRect(safeX - coreSize, safeY - coreSize, coreSize * 2, coreSize * 2);
    
    // Colored glow (use safeSize for gradient radius)
    const gradient = this.ctx.createRadialGradient(
      safeX, safeY, 0,
      safeX, safeY, safeSize * 2
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(safeX, safeY, safeSize * 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderSwirlParticle(particle, alpha) {
    const color = particle.color;
    const size = particle.size;
    
    // Draw elongated particle for motion blur
    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(Math.atan2(particle.vy, particle.vx));
    
    const gradient = this.ctx.createLinearGradient(-size * 2, 0, size, 0);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(-size * 2, -size * 0.5, size * 3, size);
    
    this.ctx.restore();
  }

  renderGlowParticle(particle, alpha) {
    let size = particle.size * 3;
    size = Math.max(0.1, size); // Ensure minimum size
    const color = particle.color;
    
    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, size
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.8})`);
    gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.4})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderDefaultParticle(particle, alpha) {
    const color = particle.color;
    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
  }

  renderProjectileAura(projectile) {
    // Guard against invalid projectile data to prevent createRadialGradient errors
    if (!projectile || !projectile.spell) return;
    const px = Number.isFinite(projectile.x) ? projectile.x : 0;
    const py = Number.isFinite(projectile.y) ? projectile.y : 0;
    const baseRadius = Number.isFinite(projectile.radius) ? Math.max(0.1, projectile.radius) : 1;
    const spell = projectile.spell;
    const visualEffects = spell.visualEffects || {};
    const auraSizeRaw = visualEffects.auraSize || 20;
    const auraSize = Number.isFinite(auraSizeRaw) ? Math.max(0.1, auraSizeRaw) : 20;
    // Ensure auraIntensity uses the raw value when finite, otherwise default to 0.3
    const rawAuraIntensity = visualEffects.auraIntensity;
    const auraIntensity = Number.isFinite(rawAuraIntensity) ? rawAuraIntensity : 0.3;
    const color = spell.color || { r: 200, g: 120, b: 40 };
    const accentColor = spell.accentColor;

    // Main aura with primary color
    const gradient = this.ctx.createRadialGradient(
      px, py, baseRadius,
      px, py, auraSize
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${auraIntensity})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(px, py, auraSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add accent color outer ring if available
    if (accentColor) {
      const accentGradient = this.ctx.createRadialGradient(
        px, py, auraSize * 0.7,
        px, py, auraSize * 1.2
      );
      accentGradient.addColorStop(0, `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${auraIntensity * 0.3})`);
      accentGradient.addColorStop(1, `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0)`);
      
      this.ctx.fillStyle = accentGradient;
      this.ctx.beginPath();
      this.ctx.arc(px, py, auraSize * 1.2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderAoECircle(aoe) {
    const alpha = Math.max(0, Math.min(1, aoe.life / (aoe.maxLife || 1)));
    const color = aoe.color || { r: 200, g: 120, b: 40 };
    this.ctx.save();
    this.ctx.globalAlpha = 0.25 * alpha;
    this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.9 * alpha})`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }
}