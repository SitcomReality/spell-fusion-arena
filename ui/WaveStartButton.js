export class WaveStartButton {
  constructor(container) {
    this.container = container;
    this.overlay = null;
  }

  show(waveNumber, onStart) {
    if (this.overlay) this.overlay.remove();

    // Check for unspent Focus in global game instance (safe fallback if not available)
    let focusBank = 0;
    try {
      if (window && window.gameInstance && window.gameInstance.fusionUI) {
        focusBank = window.gameInstance.fusionUI.focusBank || 0;
      }
    } catch (e) {
      focusBank = 0;
    }

    // Inline Focus SVG (kept small and self-contained so we don't need an import)
    const focusSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="vertical-align:middle; margin-right:6px;">
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
        <div class="wave-start-instructions" style="font-size:14px; color:#9db4ff; text-align:center;">
          ${focusBank > 0 ? `${focusSVG}You have ${focusBank} unspent Focus — spend it to upgrade a spell slot before starting the next wave.` : ''}
        </div>
        <button class="wave-start-button">${focusBank > 0 ? 'Start Wave' : 'Start Wave'}</button>
      </div>
    `;

    const btn = this.overlay.querySelector('.wave-start-button');

    // Disable start if player has unspent Focus
    if (focusBank > 0) {
      btn.disabled = true;
      // Provide subtle visual hint that action is blocked
      btn.title = 'Spend your unspent Focus on a spell slot before starting the wave';
    } else {
      btn.disabled = false;
    }

    btn.addEventListener('click', () => {
      // Defensive guard: prevent starting when focus remains
      if (focusBank > 0) return;
      this.hide();
      onStart();
    });

    this.container.appendChild(this.overlay);
  }

  hide() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

