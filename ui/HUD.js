export class HUD {
  constructor() {
    this.container = document.getElementById('hud');
  }
  
  update(gameState) {
    this.container.innerHTML = `
      <div class="hud-item">Wave: ${gameState.waveManager.currentWave}</div>
      <div class="hud-item">Score: ${gameState.score}</div>
      <div class="hud-item">Enemies: ${gameState.enemies.length}</div>
    `;
  }
}