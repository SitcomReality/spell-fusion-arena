import { DetailPanel } from '../DetailPanel.js';
import VisualPreview from '../VisualPreview.js';

export class ElementDetailsPanel {
  constructor() {
    this.panel = new DetailPanel();
    this._addButtonClickHandler = null;
  }

  mount(container) {
    this.panel.mount(container);
  }

  show(element, onAdd) {
    if (!this.panel.container) return;
    const color = element.color;
    const propertyGenes = element.propertyGenes || {};
    const propEntries = Object.entries(propertyGenes).map(([k, v]) => ({
      key: k,
      value: v
    }));

    this.panel.render(
      element.name,
      color,
      propEntries,
      [
        {
          className: 'element-add-btn',
          label: 'Add',
          onClick: () => {
            if (onAdd) onAdd(element);
            // Trigger tutorial completion
            if (this._addButtonClickHandler) {
              this._addButtonClickHandler();
            }
          }
        }
      ]
    );

    // Replace the simple .panel-color block with a VisualPreview tile for richer visuals.
    try {
      const previewData = {
        color: element.color,
        secondaryColor: element.secondaryColor,
        accentColor: element.accentColor || element.secondaryColor,
        properties: element.propertyGenes,
        visualEffects: element.visualEffects
      };
      const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
      previewEl.classList.add('panel-color-preview');
      const colorEl = this.panel.container.querySelector('.panel-color');
      if (colorEl && colorEl.parentNode) {
        colorEl.parentNode.replaceChild(previewEl, colorEl);
      }
    } catch (e) {
      // If preview creation fails, leave the default color block as-is.
    }
  }

  onAddButtonClick(callback) {
    this._addButtonClickHandler = callback;
    // Return cleanup function
    return () => {
      this._addButtonClickHandler = null;
    };
  }
}