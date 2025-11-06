export class FusionPreview {
  constructor() {
    this.container = null;
    this.onClear = null;
  }

  mount(container) {
    this.container = container;
    // Render the full preview layout in a visually disabled state
    this.container.innerHTML = `
      <div class="spell-result disabled">
        <div class="spell-summary">
          <div class="spell-summary-info">
            <div class="spell-result-color" style="background: #111"></div>
            <div class="spell-summary-text">
              <h3>No spell</h3>
            </div>
          </div>
        </div>

        <div class="properties-row">
          <div class="properties-section">
            <div class="properties-title">Projectile Properties</div>
            <div class="properties-empty">Add elements to create a spell</div>
          </div>

          <div class="fusion-preview-controls">
            <button class="fusion-preview-clear" disabled aria-disabled="true">Clear</button>
            <button class="fusion-preview-equip" disabled aria-disabled="true">Equip</button>
          </div>
        </div>
      </div>
    `;
  }

  showMessage(msg) {
    if (!this.container) return;
    // Update to disabled layout with provided message in the properties area
    this.container.innerHTML = `
      <div class="spell-result disabled">
        <div class="spell-summary">
          <div class="spell-summary-info">
            <div class="spell-result-color" style="background: #111"></div>
            <div class="spell-summary-text">
              <h3>No spell</h3>
            </div>
          </div>
        </div>

        <div class="properties-row">
          <div class="properties-section">
            <div class="properties-title">Projectile Properties</div>
            <div class="properties-empty">${msg}</div>
          </div>

          <div class="fusion-preview-controls">
            <button class="fusion-preview-clear" disabled aria-disabled="true">Clear</button>
            <button class="fusion-preview-equip" disabled aria-disabled="true">Equip</button>
          </div>
        </div>
      </div>
    `;
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
        </div>

        <div class="properties-row">
          <div class="properties-section">
            <div class="properties-title">Projectile Properties</div>
            ${propertiesHtml}
          </div>

          <div class="fusion-preview-controls">
            <button class="fusion-preview-clear">Clear</button>
            <button class="fusion-preview-equip">Equip</button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for the integrated controls
    this.container.querySelector('.fusion-preview-clear').addEventListener('click', () => {
      if (this.onClear) this.onClear();
    });

    this.container.querySelector('.fusion-preview-equip').addEventListener('click', () => {
      if (onEquip) onEquip();
    });
  }

  setOnClear(callback) {
    this.onClear = callback;
  }
}