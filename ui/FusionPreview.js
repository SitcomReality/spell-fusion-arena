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
  // `affordable` boolean indicates whether player can afford the cost. When false, 
  // panel should appear muted and the Create button styled as "disabled due to error".
  showSpell(spell, onCreate, cost = null, affordable = true) {
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

    // Render using the detail panel, but pass an error flag that will be applied
    // via a CSS class on the container so styles can adjust the whole panel.
    this.panel.render(
      spell.name,
      color,
      propEntries,
      [
        {
          className: 'fusion-preview-create' + (affordable ? '' : ' unaffordable'),
          label: createLabel,
          onClick: () => {
            // Defensive: prevent creation if not affordable
            if (!affordable) return;
            if (onCreate) onCreate();
          }
        }
      ]
    );

    // Add a top-level class to the panel container so CSS can mute the entire panel
    // while leaving the unaffordable Create button styled differently.
    const panelEl = this.panel.container.querySelector('.detail-panel');
    if (panelEl) {
      if (!affordable) {
        panelEl.classList.add('unaffordable-panel');
      } else {
        panelEl.classList.remove('unaffordable-panel');
      }
    }
  }

  setOnClear(callback) {
    this.onClear = callback;
  }
}