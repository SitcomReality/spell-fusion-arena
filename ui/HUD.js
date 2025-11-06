export class HUD {
  constructor() {
    this.container = document.getElementById('hud');
  }
  
  update(gameState) {
    // compute total assigned Mana Essence from player.spellSlotEssence if available
    const essenceArray = (gameState.player && gameState.player.spellSlotEssence) || [];
    const assigned = essenceArray.reduce((s, v) => s + (v || 0), 0);
    const bank = (gameState.player && (gameState.player.essenceBank || 0)) || 0;
    const totalEssence = assigned + bank;

    this.container.innerHTML = `
      <div class="hud-item">Wave: ${gameState.waveManager.currentWave}</div>
      <div class="hud-item">Score: ${gameState.score}</div>
      <div class="hud-item">Enemies: ${gameState.enemies.length}</div>
      <div class="hud-item">Mana Essence: ${totalEssence}</div>
    `;
  }
}