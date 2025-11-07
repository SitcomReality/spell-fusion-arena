import { CONFIG, COLORS } from './config.js';
import { GameState } from './game/GameState.js';
import { Renderer } from './rendering/Renderer.js';
import { EffectsRenderer } from './rendering/EffectsRenderer.js';
import { FusionUI } from './ui/FusionUI.js';
import { HUD } from './ui/HUD.js';
import { RewardUI } from './ui/RewardUI.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;
    
    this.fxCanvas = document.getElementById('fx-canvas');
    this.fxCanvas.width = CONFIG.canvas.width;
    this.fxCanvas.height = CONFIG.canvas.height;
    
    this.renderer = new Renderer(this.canvas);
    this.fxRenderer = new EffectsRenderer(this.fxCanvas);
    this.gameState = new GameState(CONFIG.canvas.width, CONFIG.canvas.height);
    this.hud = new HUD();
    
    // Create UI and wire its callbacks to game state
    this.fusionUI = new FusionUI((spells, focus) => {
      this.gameState.player.equipSpells(spells, focus);
    });

    this.rewardUI = new RewardUI((reward) => {
      // Handle chosen reward
      if (reward.type === 'essence') {
        this.fusionUI.addEssenceToBank(reward.amount);
      } else if (reward.type === 'element') {
        // If element unlock handling needs triggering in UI, refresh elements library
        this.fusionUI.refresh();
      }
      this.gameState.resume();
      this.fusionUI.refresh();
    });

    // Set up wave complete callback
    this.gameState.waveManager.onWaveComplete((waveNumber) => {
      this.gameState.pause();
      this.rewardUI.show(waveNumber);
    });
    
    this.lastTime = 0;
    this.running = true;
    
    this.setupMobileLayoutObserver();
    
    this.start();
  }
  
  setupMobileLayoutObserver() {
    this.headerContainer = document.getElementById('canvas-and-spells');
    this.fusionUIContainer = document.getElementById('fusion-ui');
    
    // Use ResizeObserver to detect the dynamic height of the fixed header region
    // The height changes because the canvas aspect ratio is now square and width is responsive
    this.layoutObserver = new ResizeObserver(entries => {
      // Check if we are in mobile layout (viewport width check)
      if (window.matchMedia("(max-width: 768px)").matches) {
        const entry = entries[0];
        const height = entry.contentRect.height;
        document.documentElement.style.setProperty('--fixed-header-height', `${height}px`);
      } else {
        // Reset if we are in desktop view
        document.documentElement.style.setProperty('--fixed-header-height', `0px`);
      }
    });

    if (this.headerContainer) {
      this.layoutObserver.observe(this.headerContainer);
    }
  }
  
  start() {
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  gameLoop(currentTime) {
    if (!this.running) return;
    
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    if (dt < 0.1) {
      this.update(dt);
      this.render();
    }
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  update(dt) {
    this.gameState.update(dt);
    this.gameState.updateParticles(dt);
    this.hud.update(this.gameState);
  }
  
  render() {
    // Render base game layer
    this.renderer.clear(COLORS.background);
    
    for (const enemy of this.gameState.enemies) {
      this.renderer.renderEnemy(enemy);
    }
    
    for (const projectile of this.gameState.projectiles) {
      this.renderer.renderProjectile(projectile);
    }
    
    this.renderer.renderPlayer(this.gameState.player);
    
    // Render FX layer
    this.fxRenderer.clear();
    
    // Render projectile auras
    for (const projectile of this.gameState.projectiles) {
      this.fxRenderer.renderProjectileAura(projectile);
    }
    
    // Render transient AoE visualizations (distinctive circles)
    for (const aoe of this.gameState.aoeEffects) {
      this.fxRenderer.renderAoECircle(aoe);
    }
    
    // Render all particles
    for (const particle of this.gameState.particles) {
      this.fxRenderer.renderParticle(particle);
    }
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  // Expose for UI components (HUD) to read dynamic values like essenceBank
  window.gameInstance = game;

  // Add press-to-show tooltip behavior for property badges on touch devices
  (function() {
    let activeBadge = null;
    document.addEventListener('touchstart', (ev) => {
      const el = ev.target.closest && ev.target.closest('.property-badge');
      if (el) {
        activeBadge = el;
        el.classList.add('active');
      }
    }, { passive: true });
    const clearActive = () => {
      if (activeBadge) {
        activeBadge.classList.remove('active');
        activeBadge = null;
      }
    };
    document.addEventListener('touchend', clearActive, { passive: true });
    document.addEventListener('touchcancel', clearActive, { passive: true });
    // Support mouse press for accessibility: add mousedown/mouseup toggles
    document.addEventListener('mousedown', (ev) => {
      const el = ev.target.closest && ev.target.closest('.property-badge');
      if (el) el.classList.add('active');
    });
    document.addEventListener('mouseup', () => document.querySelectorAll('.property-badge.active').forEach(e => e.classList.remove('active')));
  })();
});

