export class FusionBuilder {
  constructor(options = {}) {
    this.container = null;
    this.maxFusionSlots = options.maxFusionSlots || 2;
    this.selectedElements = [];
    this.onClear = options.onClear || (() => {});
    this.onCreate = options.onCreate || (() => {});
    this.onRequestPlaceElement = null;
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = `
      <div class="fusion-builder-inner">
        <div class="fusion-slots" id="fusion-slots-inner"></div>
      </div>
    `;
    this.slotsContainer = this.container.querySelector('#fusion-slots-inner');

    this.refresh();
  }

  setSelectedElements(arr) {
    this.selectedElements = [...arr];
    this.refresh();
  }

  refresh() {
    if (!this.slotsContainer) return;
    this.slotsContainer.innerHTML = '';
    for (let i = 0; i < this.maxFusionSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'fusion-slot';
      slot.dataset.slot = i;

      if (this.selectedElements[i]) {
        const elem = this.selectedElements[i];
        slot.innerHTML = `
          <div class="fusion-slot-content" style="background: rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})">
            <span>${elem.name}</span>
            <button class="fusion-slot-remove">×</button>
          </div>
        `;
        slot.querySelector('.fusion-slot-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectedElements.splice(i, 1);
          this.refresh();
        });
      } else {
        slot.innerHTML = '<span class="fusion-slot-placeholder">+</span>';
        slot.addEventListener('click', () => {
          // Request placing an element - handled by FusionUI via onRequestPlaceElement
          if (this.onRequestPlaceElement) this.onRequestPlaceElement();
        });
      }

      this.slotsContainer.appendChild(slot);
    }
  }
}