export class GameOverUI {
  constructor(onReturnToMenu) {
    this.onReturnToMenu = onReturnToMenu;
    this.container = null;
  }

  show(waveNumber, score, health) {
    this.container = document.createElement('div');
    this.container.id = 'game-over-overlay';
    this.container.className = 'game-over-overlay';
    this.container.innerHTML = `
      <div class="game-over-modal">
        <h1 class="game-over-title">Game Over</h1>
        <div class="game-over-stats">
          <div class="stat-row">
            <span class="stat-label">Waves Survived:</span>
            <span class="stat-value">${waveNumber}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Final Score:</span>
            <span class="stat-value">${score}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Health Remaining:</span>
            <span class="stat-value">${Math.max(0, health)}</span>
          </div>
        </div>
        <button class="game-over-button" id="return-menu-btn">Return to Menu</button>
      </div>
    `;

    document.body.appendChild(this.container);

    const btn = this.container.querySelector('#return-menu-btn');
    btn.addEventListener('click', () => {
      this.hide();
      this.onReturnToMenu();
    });
  }

  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

