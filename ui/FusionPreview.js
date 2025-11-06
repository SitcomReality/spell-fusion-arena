export class FusionPreview {
  constructor() {
    this.container = null;
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = `<p>Select elements to create a spell</p>`;
  }

  showMessage(msg) {
    if (!this.container) return;
    this.container.innerHTML = `<p>${msg}</p>`;
  }

  showSpell(spell, onEquip) {
    if (!this.container) return;
    const color = spell.color;
    const props = spell.properties || {};
    const propEntries = Object.entries(props);
    const propertiesHtml = propEntries.length === 0
      ? '<div class="properties-empty">No special properties</div>'
      : '<div class="properties-list">' + propEntries.map(([k, v]) =>
          `<div class="property-badge">
            <span class="property-name">${k.replace(/_/g, ' ')}</span>
            <span class="property-value">${Math.round(v * 100) / 100}</span>
          </div>`
        ).join('') + '</div>';

    this.container.innerHTML = `
      <div class="spell-result">
        <div class="spell-summary">
          <div class="spell-summary-info">
            <div class="spell-result-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
            <div class="spell-summary-text">
              <h3>${spell.name}</h3>
            </div>
          </div>

          <div class="spell-summary-stats">
            <div class="key-stat">
              <div class="key-stat-value">${Math.round(spell.traits.damage)}</div>
              <div class="key-stat-label">Damage</div>
            </div>
            <div class="key-stat">
              <div class="key-stat-value">${Math.round(spell.traits.speed)}</div>
              <div class="key-stat-label">Speed</div>
            </div>
            <div class="key-stat type-stat">
              <div class="type-pill">${spell.traits.projectileType}</div>
              <div class="key-stat-label">Type</div>
            </div>
          </div>
        </div>

        <div class="properties-section">
          <div class="properties-title">Projectile Properties</div>
          ${propertiesHtml}
        </div>

        <div class="fusion-preview-controls">
          <button class="fusion-preview-clear">Clear</button>
          <button class="fusion-preview-equip">Equip Spell</button>
        </div>
      </div>
    `;

    // Add event listeners for the integrated controls
    this.container.querySelector('.fusion-preview-clear').addEventListener('click', () => {
      this.clearFusion();
    });

    this.container.querySelector('.fusion-preview-equip').addEventListener('click', () => {
      if (onEquip) onEquip();
    });
  }

  clearFusion() {
    // This will be set by the parent component
    if (this.onClear) this.onClear();
  }

  setOnClear(callback) {
    this.onClear = callback;
  }
}

