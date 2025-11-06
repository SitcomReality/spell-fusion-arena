import { DetailPanel } from '../DetailPanel.js';

export class ElementDetailsPanel {
  constructor() {
    this.panel = new DetailPanel();
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
          }
        }
      ]
    );
  }
}