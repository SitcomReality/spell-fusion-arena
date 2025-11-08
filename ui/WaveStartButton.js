export class WaveStartButton {
  constructor(container) {
    this.container = container;
    this.overlay = null;
    this._focusPoll = null;
  }

  show(waveNumber, onStart) {
    if (this.overlay) this.overlay.remove();

    // Inline Focus SVG (kept small and self-contained so we don't need an import)
    const focusSVG = `
      <svg class="focus-svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="focusGrad_inline" cx="50%" cy="40%">
            <stop offset="0" stop-color="#ffd76b" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#ffecb8" stop-opacity="0.85"/>
          </radialGradient>
        </defs>
        <g fill="none" fill-rule="evenodd" stroke="#111">
          <circle cx="12" cy="12" r="7" fill="url(#focusGrad_inline)" stroke="#ffffff" stroke-opacity="0.14" stroke-width="0.8"/>
          <path d="M12 8 L12 5 M12 19 L12 16 M8 12 L5 12 M19 12 L16 12" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="2.2" fill="#ffffff" fill-opacity="0.95"/>
        </g>
      </svg>`;

    this.overlay = document.createElement('div');
    this.overlay.className = 'wave-start-overlay';
    this.overlay.innerHTML = `
      <div class="wave-start-panel">
        <h2>Wave ${waveNumber}</h2>
        <div class="wave-start-instructions"></div>
        <button class="wave-start-button">Start Wave</button>
      </div>
    `;

    const instrEl = this.overlay.querySelector('.wave-start-instructions');
    const btn = this.overlay.querySelector('.wave-start-button');

    // Helper to read current focus from FusionUI safely
    const readFocusBank = () => {
      try {
        if (window && window.gameInstance && window.gameInstance.fusionUI) {
          return window.gameInstance.fusionUI.focusBank || 0;
        }
      } catch (e) { /* ignore */ }
      return 0;
    };

    const updateUI = () => {
      const focusBank = readFocusBank();
      if (focusBank > 0) {
        instrEl.innerHTML = `${focusSVG}You have ${focusBank} unspent Focus — spend it to upgrade a spell slot before starting the next wave.`;
        btn.disabled = true;
        btn.title = 'Spend your unspent Focus on a spell slot before starting the wave';
      } else {
        instrEl.innerHTML = '';
        btn.disabled = false;
        btn.title = '';
      }
    };

    // Initial update
    updateUI();

    // Poll for changes while overlay is visible; this ensures the UI reflects changes
    // (e.g. when the player assigns Focus from FusionUI). Interval is small but modest.
    this._focusPoll = setInterval(() => {
      // If overlay removed externally, clear polling.
      if (!document.body.contains(this.overlay)) {
        clearInterval(this._focusPoll);
        this._focusPoll = null;
        return;
      }
      updateUI();
    }, 200);

    btn.addEventListener('click', () => {
      // Defensive guard: re-check live value before proceeding
      if (readFocusBank() > 0) return;
      this.hide();
      onStart();
    });

    this.container.appendChild(this.overlay);
  }

  hide() {
    if (this._focusPoll) {
      clearInterval(this._focusPoll);
      this._focusPoll = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

