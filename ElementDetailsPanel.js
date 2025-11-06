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

    this.container.classList.add('active');
    this.container.innerHTML = `
      <div class="element-details-header">
        <div class="element-details-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
        <div>
          <div class="element-details-name">${element.name}</div>
          <div class="element-details-desc">${element.description}</div>
        </div>
      </div>
      
      <div class="element-details-main-stats">
        <div class="element-details-stat-item">
          <div class="stat-item-label">Damage</div>
          <div class="stat-item-value">${traits.damage}</div>
        </div>
        <div class="element-details-stat-item">
          <div class="stat-item-label">Speed</div>
          <div class="stat-item-value">${Math.round(traits.speed)}</div>
        </div>
      </div>

      <div class="element-details-type">
        <span class="type-label">Type:</span>
        <span class="type-value">${traits.projectileType}</span>
      </div>

      ${Object.keys(propertyGenes).length > 0 ? `
        <div class="element-details-properties">
          <div class="properties-label">Properties</div>
          <div class="properties-list">
            ${Object.entries(propertyGenes).map(([key, value]) =>
              `<div class="property-item">
                <span class="property-name">${key.replace(/_/g, ' ')}</span>
                <span class="property-value">${value}</span>
              </div>`
            ).join('')}
          </div>
        </div>
      ` : `
        <div class="element-details-properties">
          <div class="properties-label">Properties</div>
          <div class="properties-empty">None</div>
        </div>
      `}
    `;
  }
}

