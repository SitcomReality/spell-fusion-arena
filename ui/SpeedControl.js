export class SpeedControl {
  constructor(onSpeedChange, onAutoToggle) {
    this.onSpeedChange = onSpeedChange;
    this.onAutoToggle = onAutoToggle;
    this.container = null;
    this.element = null;
    this.currentSpeed = 1;
    this.autoEnabled = false;
    this._onTutorialCompleted = () => {
      // re-render when tutorial finishes so the auto control becomes available
      this.render();
    };
  }

  mount(container) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'game-controls-wrapper';
    this.container.appendChild(this.element);
    // Listen for tutorial completion so we can show the auto toggle when tutorial ends
    if (typeof window !== 'undefined') {
      window.addEventListener('tutorial-completed', this._onTutorialCompleted);
    }
    this.render();
  }

  render() {
    if (!this.container) return;

    const speeds = [1, 2, 5, 10];

    // Determine if tutorial is active (if so, hide auto control)
    let tutorialActive = false;
    try {
      const gi = window && window.gameInstance;
      tutorialActive = !!(gi && gi.tutorial && gi.tutorial.isActive);
    } catch (e) {
      tutorialActive = false;
    }

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
        ${tutorialActive ? '' : `
        <div class="auto-control">
          <button class="auto-toggle-btn" title="Toggle automatic wave progression and reward selection">
            <span class="auto-toggle-label">Auto</span>
            <span class="auto-toggle-status">OFF</span>
          </button>
        </div>`}
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
      // update status text/class to match current state
      const statusEl = this.element.querySelector('.auto-toggle-status');
      if (statusEl) statusEl.textContent = this.autoEnabled ? 'ON' : 'OFF';
      if (this.autoEnabled) autoBtn.classList.add('active'); else autoBtn.classList.remove('active');
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

  getAuto() {
    return this.autoEnabled;
  }

  getSpeed() {
    return this.currentSpeed;
  }

  // cleanup if SpeedControl is removed
  unmount() {
    try {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tutorial-completed', this._onTutorialCompleted);
      }
    } catch (e) {}
  }
}

export default SpeedControl;

