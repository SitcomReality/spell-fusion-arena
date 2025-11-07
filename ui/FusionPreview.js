import { DetailPanel } from './DetailPanel.js';

export class FusionPreview {
  constructor() {
    this.panel = new DetailPanel();
    this.onClear = null;
  }

  mount(container) {
    this.panel.mount(container);
    this.panel.renderEmpty();
  }

  showMessage(msg) {
    if (!this.panel.container) return;
    this.panel.container.innerHTML = `
      <div class="detail-panel panel disabled">
        <div class="panel-summary">
          <div class="panel-summary-info">
            <div class="panel-color" style="background: #111"></div>
            <div class="panel-summary-text">
              <h3>No spell</h3>
            </div>
          </div>
          <div class="panel-controls">
            <button class="fusion-preview-clear" disabled aria-disabled="true">Clear</button>
            <button class="fusion-preview-create" disabled aria-disabled="true">Create</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="properties-empty">${msg}</div>
        </div>
      </div>
    `;
  }

  showSpell(spell, onCreate) {
    if (!this.panel.container) return;
    const color = spell.color;
    const props = spell.properties || {};
    const propEntries = Object.entries(props).map(([k, v]) => ({
      key: k,
      value: Math.round(v * 100) / 100
    }));

    this.panel.render(
      spell.name,
      color,
      propEntries,
      [
        {
          className: 'fusion-preview-clear',
          label: 'Clear',
          onClick: () => {
            if (this.onClear) this.onClear();
          }
        },
        {
          className: 'fusion-preview-create',
          label: 'Create',
          onClick: () => {
            if (onCreate) onCreate();
          }
        }
      ]
    );
  }

  setOnClear(callback) {
    this.onClear = callback;
  }
}

