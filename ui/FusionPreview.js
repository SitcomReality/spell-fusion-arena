import { DetailPanel } from './DetailPanel.js';
import { Icons } from './Icons.js';

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
            <button class="fusion-preview-create" disabled aria-disabled="true">Create</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="properties-empty">${msg}</div>
        </div>
      </div>
    `;
  }

  // Accepts optional cost (number) which will be shown on the Create button using the Mana Essence icon.
  showSpell(spell, onCreate, cost = null) {
    if (!this.panel.container) return;
    const color = spell.color;
    const props = spell.properties || {};
    const propEntries = Object.entries(props).map(([k, v]) => ({
      key: k,
      value: Math.round(v * 100) / 100
    }));

    // Prepare create button label: include mana essence icon and numeric cost when provided.
    let createLabel = 'Create';
    if (typeof cost === 'number') {
      // Put icon before the numeric cost to keep it compact
      createLabel = `Create ${Icons.manaEssenceSVG(14)} ${cost}`;
    }

    this.panel.render(
      spell.name,
      color,
      propEntries,
      [
        {
          className: 'fusion-preview-create',
          label: createLabel,
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