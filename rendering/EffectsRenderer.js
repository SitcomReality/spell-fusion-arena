import { renderTrailParticle } from './particleRenderers/Trail.js';
import { renderFloatingText } from './particleRenderers/FloatingText.js';
import { renderAuraParticle } from './particleRenderers/Aura.js';
import { renderBeamParticle } from './particleRenderers/Beam.js';
import { renderSmokeParticle } from './particleRenderers/Smoke.js';
import { renderSparkParticle } from './particleRenderers/Spark.js';
import { renderSwirlParticle } from './particleRenderers/Swirl.js';
import { renderGlowParticle } from './particleRenderers/Glow.js';
import { renderDefaultParticle } from './particleRenderers/Default.js';

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
        renderTrailParticle(this.ctx, particle, alpha);
        break;
      case 'floating-text':
        renderFloatingText(this.ctx, particle, alpha);
        break;
      case 'aura':
        renderAuraParticle(this.ctx, particle, alpha);
        break;
      case 'beam':
        renderBeamParticle(this.ctx, particle, alpha);
        break;
      case 'smoke':
        renderSmokeParticle(this.ctx, particle, alpha);
        break;
      case 'spark':
        renderSparkParticle(this.ctx, particle, alpha);
        break;
      case 'swirl':
        renderSwirlParticle(this.ctx, particle, alpha);
        break;
      case 'glow':
        renderGlowParticle(this.ctx, particle, alpha);
        break;
      default:
        renderDefaultParticle(this.ctx, particle, alpha);
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