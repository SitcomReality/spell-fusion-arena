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
    const propertiesHtml = Object.keys(propertyGenes).length === 0
      ? '<div style="font-size:12px;color:#aaa;">No special properties</div>'
      : '<div style="display:flex;flex-direction:column;gap:6px;">' + Object.entries(propertyGenes).map(([k,v]) =>
          `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;">
             <span style="color:#ddd;text-transform:capitalize;">${k.replace(/_/g,' ')}</span>
             <span style="color:#fff;font-weight:600">${v}</span>
           </div>`
        ).join('') + '</div>';

    this.container.classList.add('active');
    this.container.innerHTML = `
      <div class="element-details-header">
        <div class="element-details-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
        <div>
          <div class="element-details-name">${element.name}</div>
          <div class="element-details-desc">${element.description}</div>
        </div>
      </div>
      <div class="element-details-stats">
        <div class="details-stat">
          <span class="details-stat-label">Damage</span>
          <span class="details-stat-value">${traits.damage}</span>
        </div>
        <div class="details-stat">
          <span class="details-stat-label">Speed</span>
          <span class="details-stat-value">${Math.round(traits.speed)}</span>
        </div>
        <div class="details-stat">
          <span class="details-stat-label">Type</span>
          <span class="details-stat-value" style="font-size: 11px;">${traits.projectileType}</span>
        </div>
        <div class="details-stat" style="padding:8px;">
          ${propertiesHtml}
        </div>
      </div>
    `;
  }
}

