export class HUD {
  constructor() {
    this.container = document.getElementById('hud');
  }
  
  update(gameState) {
    // Prefer showing unspent Mana Essence from the Fusion UI (essence bank).
    // Fallback to total assigned Mana Essence (legacy).
    let unspentEssence = 0;

    try {
      if (window && window.gameInstance && window.gameInstance.fusionUI) {
        unspentEssence = window.gameInstance.fusionUI.essenceBank || 0;
      } else {
        const essenceArray = (gameState.player && gameState.player.spellSlotEssence) || [];
        unspentEssence = essenceArray.reduce((s, v) => s + (v || 0), 0);
      }
    } catch (e) {
      const essenceArray = (gameState.player && gameState.player.spellSlotEssence) || [];
      unspentEssence = essenceArray.reduce((s, v) => s + (v || 0), 0);
    }

    this.container.innerHTML = `
      <div class="hud-item">Wave: ${gameState.waveManager.currentWave}</div>
      <div class="hud-item">Score: ${gameState.score}</div>
      <div class="hud-item">Enemies: ${gameState.enemies.length}</div>
      <div class="hud-item">Mana Essence: ${unspentEssence}</div>
    `;
  }
}

