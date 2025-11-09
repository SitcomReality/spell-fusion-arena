export class SpeedControl {
  constructor(onSpeedChange) {
    this.onSpeedChange = onSpeedChange;
    this.container = null;
    this.currentSpeed = 1;
  }

  mount(container) {
    this.container = container;
    this.render();
  }

  render() {
    if (!this.container) return;

    const speeds = [1, 2, 5, 10];
    this.container.innerHTML = `
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
    `;

    const buttons = this.container.querySelectorAll('.speed-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed);
        this.setSpeed(speed);
      });
    });
  }

  setSpeed(speed) {
    this.currentSpeed = speed;

    // Update active state
    const buttons = this.container.querySelectorAll('.speed-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
    });

    if (this.onSpeedChange) {
      this.onSpeedChange(speed);
    }
  }

  getSpeed() {
    return this.currentSpeed;
  }
}