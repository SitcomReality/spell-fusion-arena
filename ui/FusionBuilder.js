export class FusionBuilder {
  constructor(options = {}) {
    this.container = null;
    this.maxFusionSlots = options.maxFusionSlots || 1;
    this.selectedElements = [];
    this.onSlotRemove = options.onSlotRemove || (() => {});
    this.onUnlockSlot = options.onUnlockSlot || (() => {});
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

  setMaxSlots(max) {
    this.maxFusionSlots = max;
    this.refresh();
  }

  setSelectedElements(arr) {
    this.selectedElements = [...arr];
    this.refresh();
  }

  refresh() {
    if (!this.slotsContainer) return;
    this.slotsContainer.innerHTML = '';
    
    // Show unlocked slots
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
          this.onSlotRemove(i);
        });
      } else {
        slot.innerHTML = '<span class="fusion-slot-placeholder">+</span>';
      }

      this.slotsContainer.appendChild(slot);
    }
  }
}