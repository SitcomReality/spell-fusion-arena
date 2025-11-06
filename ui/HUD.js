export class HUD {
  constructor() {
    this.container = document.getElementById('hud');
  }
  
  update(gameState) {
    // compute total assigned Mana Essence from player.spellSlotEssence if available
    const essenceArray = (gameState.player && gameState.player.spellSlotEssence) || [];
    const totalEssence = essenceArray.reduce((s, v) => s + (v || 0), 0);

    this.container.innerHTML = `
      <div class="hud-item">Wave: ${gameState.waveManager.currentWave}</div>
      <div class="hud-item">Score: ${gameState.score}</div>
      <div class="hud-item">Enemies: ${gameState.enemies.length}</div>
      <div class="hud-item">Mana Essence: ${totalEssence}</div>
    `;
  }
}

