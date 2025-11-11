export class SpeedControl {
  constructor(onSpeedChange, onAutoToggle) {
    this.onSpeedChange = onSpeedChange;
    this.onAutoToggle = onAutoToggle;
    this.container = null;
    this.element = null;
    this.currentSpeed = 1;
    this.autoEnabled = false;
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
        <div class="auto-control">
          <button class="auto-toggle-btn" title="Toggle automatic wave progression and reward selection">
            <span class="auto-toggle-label">Auto</span>
            <span class="auto-toggle-status">OFF</span>
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
}

export default SpeedControl;

