export class AutoManager {
  constructor(gameApp) {
    this.gameApp = gameApp;
  }

  autoStartWaveIfPending() {
    if (!this.gameApp.autoEnabled || !this.gameApp.waveStartButton) return;
    if (this.gameApp.gameState.waveStartPending) {
      try { if (this.gameApp.tutorial && this.gameApp.tutorial.isActive && this.gameApp.tutorial.callout) this.gameApp.tutorial.callout.remove(); } catch (e) {}
      this.gameApp.gameState.waveManager.startNextWave();
      this.gameApp.gameState.startWave();
      if (this.gameApp.waveStartButton) this.gameApp.waveStartButton.hide();
      try {
        if (this.gameApp.hud) this.gameApp.hud.setWave(this.gameApp.gameState.waveManager.currentWave);
        if (this.gameApp.hud) this.gameApp.hud.setEnemies(0);
      } catch (e) {}
    }
  }

  autoSelectRewardIfAvailable() {
    if (!this.gameApp.autoEnabled || !this.gameApp.rewardUI) return;
    if (!this.gameApp.rewardUI.container) return;
    const cards = this.gameApp.rewardUI.container.querySelectorAll('.reward-card');
    if (cards.length === 0) return;
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    if (randomCard.dataset.key) this.gameApp.rewardUI.selectElement(randomCard.dataset.key);
    else if (randomCard.classList.contains('essence-card')) this.gameApp.rewardUI.selectEssence();
  }

  autoAllocateFocusOnce() {
    if (!this.gameApp.autoEnabled || !this.gameApp.fusionUI) return;
    let focusRemaining = this.gameApp.fusionUI.focusBank;
    let iterations = 0;
    const maxIterations = 10;
    while (focusRemaining > 0 && iterations < maxIterations) {
      const slotIndex = Math.floor(Math.random() * 4);
      this.gameApp.fusionUI.allocateFocusToSlot(slotIndex);
      focusRemaining--;
      iterations++;
    }
  }
}

