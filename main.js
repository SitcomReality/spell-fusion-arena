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
    
    this.fusionUI = new FusionUI((spells, essence) => {
      this.gameState.player.equipSpells(spells, essence);
    });

    this.rewardUI = new RewardUI((reward) => {
      // Handle chosen reward
      if (reward.type === 'essence') {
        this.fusionUI.addEssenceToBank(reward.amount);
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
    
    this.start();
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
    
    // Render all particles
    for (const particle of this.gameState.particles) {
      this.fxRenderer.renderParticle(particle);
    }
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});

