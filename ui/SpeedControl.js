export class SpeedControl {
  constructor(onSpeedChange, onAutoToggle, onSkipWave) {
    this.onSpeedChange = onSpeedChange;
    this.onAutoToggle = onAutoToggle;
    this.onSkipWave = onSkipWave;
    this.container = null;
    this.element = null;
    this.currentSpeed = 1;
    this.autoEnabled = false;
    this.autoVisible = true; // NEW: Assume visible unless told otherwise
    this.hudHideEnabled = false;
  }

  mount(container) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'game-controls-wrapper';
    this.container.appendChild(this.element);
    this.render();
  }

  render() {
    if (!this.container) return;

    const speeds = [1, 2, 5, 10];
    const autoControlClass = this.autoVisible ? 'auto-control' : 'auto-control hidden-by-tutorial';
    this.element.innerHTML = `
      <div class="game-controls">
        <div class="speed-control">
          <div class="speed-control-label">Speed:</div>
          <div class="speed-control-buttons">
            ${speeds.map(speed => `
              <button class="speed-btn ${speed === 1 ? 'active' : ''}" data-speed="${speed}">
                ${speed}x
              </button>
            `).join('')}
          </div>
        </div>
        <div class="${autoControlClass}">
          <button class="auto-toggle-btn" title="Toggle automatic wave progression and reward selection">
            <span class="auto-toggle-label">Auto</span>
            <span class="auto-toggle-status">OFF</span>
          </button>
        </div>
        <div class="hud-hide-control">
          <button class="hud-hide-toggle-btn" title="Hide HUD during gameplay">
            <span class="hud-hide-toggle-label">Hide</span>
            <span class="hud-hide-toggle-status">OFF</span>
          </button>
        </div>
        <div class="skip-wave-control">
          <button class="skip-wave-btn" title="Skip the current wave (no rewards)">
            Skip
          </button>
        </div>
      </div>
    `;

    const buttons = this.element.querySelectorAll('.speed-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed);
        this.setSpeed(speed);
      });
    });

    const autoBtn = this.element.querySelector('.auto-toggle-btn');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.toggleAuto();
      });
    }

    const hudHideBtn = this.element.querySelector('.hud-hide-toggle-btn');
    if (hudHideBtn) {
      hudHideBtn.addEventListener('click', () => {
        this.toggleHudHide();
      });
    }

    const skipWaveBtn = this.element.querySelector('.skip-wave-btn');
    if (skipWaveBtn) {
      skipWaveBtn.addEventListener('click', () => {
        this.skipWave();
      });
    }
  }

  setSpeed(speed) {
    this.currentSpeed = speed;

    const buttons = this.element.querySelectorAll('.speed-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
    });

    if (this.onSpeedChange) {
      this.onSpeedChange(speed);
    }
  }

  toggleAuto() {
    this.autoEnabled = !this.autoEnabled;
    const statusEl = this.element.querySelector('.auto-toggle-status');
    if (statusEl) {
      statusEl.textContent = this.autoEnabled ? 'ON' : 'OFF';
    }
    const autoBtn = this.element.querySelector('.auto-toggle-btn');
    if (autoBtn) {
      autoBtn.classList.toggle('active', this.autoEnabled);
    }
    if (this.onAutoToggle) {
      this.onAutoToggle(this.autoEnabled);
    }
  }

  toggleHudHide() {
    this.hudHideEnabled = !this.hudHideEnabled;
    const statusEl = this.element.querySelector('.hud-hide-toggle-status');
    if (statusEl) {
      statusEl.textContent = this.hudHideEnabled ? 'ON' : 'OFF';
    }
    const hudHideBtn = this.element.querySelector('.hud-hide-toggle-btn');
    if (hudHideBtn) {
      hudHideBtn.classList.toggle('active', this.hudHideEnabled);
    }
    this.updateHudVisibility();
  }

  skipWave() {
    if (this.onSkipWave) {
      this.onSkipWave();
    }
  }

  updateHudVisibility() {
    // Only hide HUD if toggle is ON and a wave is active (not waiting for start)
    const gameState = (typeof window !== 'undefined' && window.gameInstance && window.gameInstance.gameState) ? window.gameInstance.gameState : null;

    // Determine whether a wave is actively playing. The authoritative flag lives on the WaveManager.
    const waveActive = gameState && (
      // prefer WaveManager flag
      (gameState.waveManager && gameState.waveManager.waveActive) ||
      // legacy / fallback flag (kept for compatibility)
      Boolean(gameState.waveActive)
    );

    // waveStartPending indicates we're waiting for player to press Start Wave (do NOT hide UI then)
    const startPending = gameState ? Boolean(gameState.waveStartPending) : false;

    const shouldHide = this.hudHideEnabled && waveActive && !startPending;
    
    if (shouldHide) {
      document.documentElement.classList.add('hide-ui-during-wave');
    } else {
      document.documentElement.classList.remove('hide-ui-during-wave');
    }
  }

  setAutoVisible(visible) {
    if (this.autoVisible !== visible) {
      this.autoVisible = visible;
      this.render();
    }
  }

  getAuto() {
    return this.autoEnabled;
  }

  getSpeed() {
    return this.currentSpeed;
  }
}

export default SpeedControl;