export class FusionBuilder {
  constructor(options = {}) {
    this.container = null;
    this.totalSlots = options.totalSlots || 4;
    this.unlockedSlots = options.unlockedSlots || 1;
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
    // backwards-compatible alias for unlockedSlots
    this.setUnlockedSlots(max);
  }

  setUnlockedSlots(n) {
    this.unlockedSlots = Math.max(0, Math.min(this.totalSlots, n));
    this.refresh();
  }

  setSelectedElements(arr) {
    this.selectedElements = [...arr];
    this.refresh();
  }

  refresh() {
    if (!this.slotsContainer) return;
    this.slotsContainer.innerHTML = '';
    
    // Always render total slots, show locked overlay for locked ones
    for (let i = 0; i < this.totalSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'fusion-slot';
      slot.dataset.slot = i;

      if (i < this.unlockedSlots) {
        // unlocked slot
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
      } else {
        // locked slot with unlock CTA
        slot.classList.add('locked');
        slot.innerHTML = `
          <div class="fusion-slot-locked">
            <div class="fusion-slot-lock-icon">🔒</div>
            <div class="fusion-slot-locked-controls">
              <button class="fusion-slot-unlock">Unlock</button>
              <div class="fusion-slot-locked-hint">Cost: 1 ME</div>
            </div>
          </div>
        `;
        slot.querySelector('.fusion-slot-unlock').addEventListener('click', (e) => {
          e.stopPropagation();
          this.onUnlockSlot(i);
        });
      }

      this.slotsContainer.appendChild(slot);
    }
  }
}