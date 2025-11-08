export class DetailPanel {
  constructor() {
    this.container = null;
  }

  mount(container) {
    this.container = container;
    this.renderEmpty();
  }

  renderEmpty() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="detail-panel panel disabled">
        <div class="panel-summary">
          <div class="panel-summary-info">
            <div class="panel-color" style="background: #111"></div>
            <div class="panel-summary-text">
              <h3>No selection</h3>
            </div>
          </div>
          <div class="panel-controls"></div>
        </div>
        <div class="panel-body">
          <div class="properties-empty">Select something to view</div>
        </div>
      </div>
    `;
  }

  render(title, color, properties, controls) {
    if (!this.container) return;
    
    const propertiesHtml = !properties || properties.length === 0
      ? '<div class="properties-empty">No special properties</div>'
      : '<div class="properties-list">' + properties.map(({ key, value }) =>
          `<div class="property-badge" data-property="${key}">
            <span class="property-icon"></span>
            <span class="property-value">${value}</span>
          </div>`
        ).join('') + '</div>';

    const controlsHtml = controls.map(btn => 
      `<button class="${btn.className}" ${btn.disabled ? 'disabled aria-disabled="true"' : ''}>${btn.label}</button>`
    ).join('');

    this.container.innerHTML = `
      <div class="detail-panel panel">
        <div class="panel-summary">
          <div class="panel-summary-info">
            <div class="panel-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
            <div class="panel-summary-text">
              <h3>${title}</h3>
            </div>
          </div>
          <div class="panel-controls">
            ${controlsHtml}
          </div>
        </div>
        <div class="panel-body">
          ${propertiesHtml}
        </div>
      </div>
    `;

    // Attach event listeners
    controls.forEach((btn, idx) => {
      const el = this.container.querySelector(`.${btn.className}`);
      if (el && btn.onClick) {
        el.addEventListener('click', btn.onClick);
      }
    });
  }
}

