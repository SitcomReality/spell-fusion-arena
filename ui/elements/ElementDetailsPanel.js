export class ElementDetailsPanel {
  constructor() {
    this.container = null;
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
  }

  show(element, onAdd) {
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
      <div class="element-summary">
        <div class="element-summary-info">
          <div class="element-details-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
          <div class="element-summary-text">
            <div class="element-details-name">${element.name}</div>
            <div class="element-details-desc">${element.description}</div>
          </div>
        </div>

        <div class="element-summary-stats">
          <div class="key-stat">
            <div class="key-stat-value">${traits.damage}</div>
            <div class="key-stat-label">Damage</div>
          </div>
          <div class="key-stat">
            <div class="key-stat-value">${Math.round(traits.speed)}</div>
            <div class="key-stat-label">Speed</div>
          </div>
          <div class="key-stat type-stat">
            <div class="type-pill">${traits.projectileType}</div>
            <div class="key-stat-label">Type</div>
          </div>
        </div>
      </div>

      <div class="properties-section">
        <div class="properties-title">Projectile Properties</div>
        ${propertiesHtml}
      </div>

      <div class="element-details-controls">
        <button class="element-add-btn">Add to Fusion</button>
      </div>
    `;

    // Add event listener for the add button
    this.container.querySelector('.element-add-btn').addEventListener('click', () => {
      if (onAdd) onAdd(element);
    });
  }
}

