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
        import('./particleRenderers/Trail.js').then(m => m.renderTrailParticle(this.ctx, particle, alpha));
        break;
      case 'floating-text':
        import('./particleRenderers/FloatingText.js').then(m => m.renderFloatingText(this.ctx, particle, alpha));
        break;
      case 'aura':
        import('./particleRenderers/Aura.js').then(m => m.renderAuraParticle(this.ctx, particle, alpha));
        break;
      case 'beam':
        import('./particleRenderers/Beam.js').then(m => m.renderBeamParticle(this.ctx, particle, alpha));
        break;
      case 'smoke':
        import('./particleRenderers/Smoke.js').then(m => m.renderSmokeParticle(this.ctx, particle, alpha));
        break;
      case 'spark':
        import('./particleRenderers/Spark.js').then(m => m.renderSparkParticle(this.ctx, particle, alpha));
        break;
      case 'swirl':
        import('./particleRenderers/Swirl.js').then(m => m.renderSwirlParticle(this.ctx, particle, alpha));
        break;
      case 'glow':
        import('./particleRenderers/Glow.js').then(m => m.renderGlowParticle(this.ctx, particle, alpha));
        break;
      default:
        import('./particleRenderers/Default.js').then(m => m.renderDefaultParticle(this.ctx, particle, alpha));
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  // The higher-level aura/aoe renderers remain here and continue to use the canvas context synchronously.
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