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

        <!-- Promotional line for Squishdrift -->
        <div class="game-over-promo" style="margin-top:18px; font-size:14px; color:#dfefff; text-align:center;">
          <p style="margin:0 0 8px 0;">
            After this, play Squishdrift! It's a chaotic top-down 2.5D action game about drifting around a randomly generated city while being chased by cops.
          </p>
          <p style="margin:0;">
            <a href="https://websim.com/@SitcomReality/squishdrift" target="_blank" rel="noopener noreferrer" style="color:#64c8ff; text-decoration:none; font-weight:700;">
              https://websim.com/@SitcomReality/squishdrift
            </a>
          </p>
        </div>
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

