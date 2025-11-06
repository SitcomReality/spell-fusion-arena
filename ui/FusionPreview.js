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
      ? '<div style="font-size:12px;color:#aaa;">No special properties</div>'
      : '<div style="display:flex;flex-direction:column;gap:6px;">' + propEntries.map(([k, v]) =>
          `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;">
             <span style="color:#ddd;text-transform:capitalize;">${k.replace(/_/g,' ')}</span>
             <span style="color:#fff;font-weight:600">${(Math.round(v * 100) / 100)}</span>
           </div>`
        ).join('') + '</div>';

    this.container.innerHTML = `
      <div class="spell-result">
        <div class="spell-result-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
        <div class="spell-result-info">
          <h3>${spell.name}</h3>
          <div class="spell-result-stats">
            <div class="stat">
              <span class="stat-label">Damage</span>
              <span class="stat-value">${Math.round(spell.traits.damage)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Speed</span>
              <span class="stat-value">${Math.round(spell.traits.speed)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Type</span>
              <span class="stat-value">${spell.traits.projectileType}</span>
            </div>
          </div>
         <div style="margin-top:10px;">
           <div style="font-size:12px;color:#777;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px;">Projectile Properties</div>
           <div style="background:#0d0d0d;border:1px solid #222;padding:8px;border-radius:4px;">
             ${propertiesHtml}
           </div>
         </div>
        </div>
      </div>
    `;
  }
}

