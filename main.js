import { CONFIG, COLORS } from './config.js';
import { GameState } from './game/GameState.js';
import { Renderer } from './rendering/Renderer.js';
import { FusionUI } from './ui/FusionUI.js';
import { HUD } from './ui/HUD.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;
    
    this.renderer = new Renderer(this.canvas);
    this.gameState = new GameState(CONFIG.canvas.width, CONFIG.canvas.height);
    this.hud = new HUD();
    
    this.fusionUI = new FusionUI((spell) => {
      this.gameState.player.equipSpell(spell);
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
    
    if (dt < 0.1) { // Cap dt to prevent large jumps
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
    this.renderer.clear(COLORS.background);
    
    // Render entities
    for (const enemy of this.gameState.enemies) {
      this.renderer.renderEnemy(enemy);
    }
    
    for (const projectile of this.gameState.projectiles) {
      this.renderer.renderProjectile(projectile);
    }
    
    this.renderer.renderParticles(this.gameState.particles);
    this.renderer.renderPlayer(this.gameState.player);
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});

