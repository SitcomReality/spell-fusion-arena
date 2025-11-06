export class ElementDetailsPanel {
  constructor() {
    this.container = null;
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
  }

  show(element) {
    if (!this.container) return;
    const color = element.color;
    const traits = element.traits;
    const propertyGenes = element.propertyGenes || {};

    const propertiesEntries = Object.entries(propertyGenes);
    const propertiesHtml = propertiesEntries.length === 0
      ? `<div class="properties-empty">No special properties</div>`
      : `<div class="properties-list">` + propertiesEntries.map(([k, v]) =>
          `<div class="property-badge">
            <span class="property-name">${k.replace(/_/g, ' ')}</span>
            <span class="property-value">${v}</span>
          </div>`
        ).join('') + `</div>`;

    this.container.classList.add('active');
    this.container.innerHTML = `
      <div class="element-details-top">
        <div class="element-details-header">
          <div class="element-details-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
          <div class="element-details-meta">
            <div class="element-details-name">${element.name}</div>
            <div class="element-details-desc">${element.description}</div>
          </div>
        </div>

        <div class="element-stats-row">
          <div class="key-stat">
            <div class="key-stat-value">${traits.damage}</div>
            <div class="key-stat-label">Damage</div>
          </div>
          <div class="key-stat">
            <div class="key-stat-value">${Math.round(traits.speed)}</div>
            <div class="key-stat-label">Speed</div>
          </div>
          <div class="key-stat">
            <div class="type-pill">${traits.projectileType}</div>
            <div class="key-stat-label">Type</div>
          </div>
        </div>
      </div>

      <div class="properties-section">
        <div class="properties-title">Projectile Properties</div>
        ${propertiesHtml}
      </div>
    `;
  }
}

