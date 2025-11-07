import { Icons } from './Icons.js';

export class HUD {
  constructor() {
    this.container = document.getElementById('hud');
  }
  
  update(gameState) {
    let essenceBank = 0;
    let focusBank = 0;

    try {
      if (window && window.gameInstance && window.gameInstance.fusionUI) {
        essenceBank = window.gameInstance.fusionUI.essenceBank || 0;
        focusBank = window.gameInstance.fusionUI.focusBank || 0;
      }
    } catch (e) {
      // silent fallback
    }

    this.container.innerHTML = `
      <div class="hud-item">Wave: ${gameState.waveManager.currentWave}</div>
      <div class="hud-item">Score: ${gameState.score}</div>
      <div class="hud-item">Enemies: ${gameState.enemies.length}</div>
      <div class="hud-item">Essence: ${Icons.manaEssenceSVG(14)} ${essenceBank}</div>
      <div class="hud-item">Focus: ${Icons.focusSVG(14)} ${focusBank}</div>
    `;
  }
}