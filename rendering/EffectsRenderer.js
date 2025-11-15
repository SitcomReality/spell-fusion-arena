import { renderTrailParticle } from './particleRenderers/Trail.js';
import { renderFloatingText } from './particleRenderers/FloatingText.js';
import { renderAuraParticle } from './particleRenderers/Aura.js';
import { renderBeamParticle } from './particleRenderers/Beam.js';
import { renderSmokeParticle } from './particleRenderers/Smoke.js';
import { renderSparkParticle } from './particleRenderers/Spark.js';
import { renderSwirlParticle } from './particleRenderers/Swirl.js';
import { renderGlowParticle } from './particleRenderers/Glow.js';
import { renderDefaultParticle } from './particleRenderers/Default.js';
import TextureManager from './TextureManager.js';

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
    
    // If particle specifies a texture, attempt to draw the preloaded image centered at the particle.
    if (particle.texture) {
      const img = TextureManager.getTexture(particle.texture);
      if (img) {
        try {
          this.ctx.save();
          const x = Number.isFinite(particle.x) ? particle.x : 0;
          const y = Number.isFinite(particle.y) ? particle.y : 0;
          const size = Number.isFinite(particle.size) ? Math.max(1, particle.size) : 8;
          
          // Handle rotation for directional particles (like slash_01)
          if (Number.isFinite(particle.vx) && Number.isFinite(particle.vy) && particle.rotateWithVelocity) {
            const angle = Math.atan2(particle.vy, particle.vx);
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.drawImage(img, -size/2, -size/2, size, size);
          } else if (Number.isFinite(particle.rotation)) {
            // Static rotation
            this.ctx.translate(x, y);
            this.ctx.rotate(particle.rotation);
            this.ctx.drawImage(img, -size/2, -size/2, size, size);
          } else {
            // No rotation
            this.ctx.drawImage(img, x - size/2, y - size/2, size, size);
          }
          this.ctx.restore();
          this.ctx.globalAlpha = 1.0;
          return;
        } catch (e) {
          // If textured draw fails, fall back to shape rendering below
          this.ctx.restore?.();
        }
      }
    }
    
    // Fallback to shape rendering
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

  renderProjectileAura(projectile) {
    if (!projectile || !projectile.spell) return;
    const px = Number.isFinite(projectile.x) ? projectile.x : 0;
    const py = Number.isFinite(projectile.y) ? projectile.y : 0;
    const baseRadius = Number.isFinite(projectile.radius) ? Math.max(0.1, projectile.radius) : 1;
    const spell = projectile.spell;
    const visualEffects = spell.visualEffects || {};
    
    // Support new aura configuration
    const auraConfig = visualEffects.aura || {};
    const auraSize = (typeof auraConfig === 'object' ? (auraConfig.size || 20) : visualEffects.auraSize) || 20;
    const auraIntensity = (typeof auraConfig === 'object' ? (auraConfig.intensity || 0.3) : visualEffects.auraIntensity) || 0.3;
    const color = auraConfig.color || spell.color || { r: 200, g: 120, b: 40 };
    const accentColor = spell.accentColor;

    // Main aura glow
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
    
    // Accent glow if available
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

  /**
   * Draw a subtle shield ring for shielded enemies on the FX canvas.
   * Expects enemy to expose: shieldActive (bool), shieldRadius (number) and shieldFxColor {r,g,b}.
   */
  renderEnemyShield(enemy) {
    if (!enemy || !enemy.shieldActive) return;
    const cx = Number.isFinite(enemy.x) ? enemy.x : 0;
    const cy = Number.isFinite(enemy.y) ? enemy.y : 0;
    const radius = Number.isFinite(enemy.shieldRadius) ? enemy.shieldRadius : Math.max(20, (enemy.type ? Math.max(enemy.type.width, enemy.type.height) : 24));
    const color = enemy.shieldFxColor || { r: 120, g: 220, b: 220 };

    // Gentle pulsing alpha so shields feel alive
    // Make the pulse tighter and brighter so the shield never appears 'off' at its low point.
    // Use a higher baseline (0.65) and a smaller amplitude (0.12) to keep opacity consistent.
    const pulse = 0.65 + 0.12 * Math.sin((Date.now() % 2000) / 2000 * Math.PI * 2);

    try {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'lighter';
      // outer glow
      const g1 = this.ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.6);
      // Increase outer glow alpha proportionally to the brighter pulse so it remains visible.
      g1.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.12 * pulse})`);
      g1.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      this.ctx.fillStyle = g1;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
      this.ctx.fill();

      // ring stroke
      // Keep the stroke reasonably opaque at all times.
      this.ctx.globalAlpha = 0.75 * pulse;
      this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.95 * pulse})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // inner faint core ring
      this.ctx.globalAlpha = 0.28 * pulse;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, Math.max(6, radius * 0.45), 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.restore();
    } catch (e) {
      try { this.ctx.restore(); } catch (er) { /* silent */ }
    }
  }
}