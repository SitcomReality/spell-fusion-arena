export class ElementDetailsPanel {
  constructor() {
    this.container = null;
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';

    // Render the full structure in an inactive state (no add button enabled)
    this.container.classList.add('active', 'inactive', 'panel');
    this.container.innerHTML = `
      <div class="element-summary">
        <div class="element-summary-info">
          <div class="element-details-color" style="background: #111"></div>
          <div class="element-summary-text">
            <div class="element-details-name">No element selected</div>
            <!-- description removed: name, stats and properties convey behavior -->
          </div>
        </div>
      </div>

      <div class="element-details-body">
        <div class="properties-empty">No element selected</div>
      </div>

      <div class="element-details-controls">
        <button class="element-add-btn" disabled aria-disabled="true">Add</button>
      </div>
    `;
  }

  show(element, onAdd) {
    if (!this.container) return;
    const color = element.color;
    const propertyGenes = element.propertyGenes || {};

    const propertiesEntries = Object.entries(propertyGenes);
    const propertiesHtml = propertiesEntries.length === 0
      ? `<div class="properties-empty">No special properties</div>`
      : `<div class="properties-list">` + propertiesEntries.map(([k, v]) =>
          `<div class="property-badge" data-property="${k}">
            <span class="property-icon"></span>
            <span class="property-value">${v}</span>
          </div>`
        ).join('') + `</div>`;

    // Remove inactive state and populate real values
    this.container.classList.remove('inactive');
    this.container.innerHTML = `
      <div class="element-summary">
        <div class="element-summary-info">
          <div class="element-details-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
          <div class="element-summary-text">
            <div class="element-details-name">${element.name}</div>
            <!-- description removed: using name, stats and properties only -->
          </div>
        </div>
      </div>

      <div class="element-details-body">
        ${propertiesHtml}
      </div>

      <div class="element-details-controls">
        <button class="element-add-btn">Add</button>
      </div>
    `;

    // Add event listener for the add button
    const addBtn = this.container.querySelector('.element-add-btn');
    addBtn.addEventListener('click', () => {
      if (onAdd) onAdd(element);
    });
  }
}