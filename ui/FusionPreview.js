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

  showSpell(spell) {
    if (!this.container) return;
    const color = spell.color;
    const props = spell.properties || {};
    const propEntries = Object.entries(props);
    const propertiesHtml = propEntries.length === 0
      ? '<div class="properties-empty">No special properties</div>'
      : '<div class="properties-list">' + propEntries.map(([k, v]) =>
          `<div class="property-badge">
             <span class="property-name">${k.replace(/_/g,' ')}</span>
             <span class="property-value">${(Math.round(v * 100) / 100)}</span>
           </div>`
        ).join('') + '</div>';

    this.container.innerHTML = `
      <div class="fusion-preview">
        <div class="element-summary">
          <div class="element-summary-info">
            <div class="spell-result-color element-details-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
            <div class="element-summary-text spell-result-info">
              <div class="element-details-name">${spell.name}</div>
              <div class="element-details-desc">${spell.elements.map(e=>e.name).join(' + ')}</div>
            </div>
          </div>

          <div class="element-summary-stats spell-result-stats">
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
      </div>
    `;
  }
}

