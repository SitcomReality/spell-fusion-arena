export class WaveStartButton {
  constructor(container) {
    this.container = container;
    this.overlay = null;
  }

  show(waveNumber, onStart) {
    if (this.overlay) this.overlay.remove();

    this.overlay = document.createElement('div');
    this.overlay.className = 'wave-start-overlay';
    this.overlay.innerHTML = `
      <div class="wave-start-panel">
        <h2>Wave ${waveNumber}</h2>
        <button class="wave-start-button">Start Wave</button>
      </div>
    `;

    const btn = this.overlay.querySelector('.wave-start-button');
    btn.addEventListener('click', () => {
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

