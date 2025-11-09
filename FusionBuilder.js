import { Icons } from './Icons.js';

export class FusionBuilder {
  constructor(options = {}) {
    this.container = null;
    this.totalSlots = options.totalSlots || 4;
    this.unlockedSlots = options.unlockedSlots || 1;
    this.selectedElements = [];
    this.onSlotRemove = options.onSlotRemove || (() => {});
    this.onUnlockSlot = options.onUnlockSlot || (() => {});
    // NEW: optional getter to read current Mana Essence (fallback to 0)
    this.getEssence = options.getEssence || (() => 0);
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
    
    // Placeholder costs per fusion slot (1..4)
    const COSTS = [1, 5, 10, 20];
    
    // Read current essence so we can mark unusable slots
    const currentEssence = Number(this.getEssence() || 0);

    // Always render total slots, show locked overlay for locked ones
    for (let i = 0; i < this.totalSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'fusion-slot';
      slot.dataset.slot = i;

      // If the player doesn't have enough essence for this slot, mark inactive
      const required = COSTS[i] || 0;
      if (currentEssence < required) {
        slot.classList.add('inactive-slot');
      } else {
        slot.classList.remove('inactive-slot');
      }

      if (i < this.unlockedSlots) {
        // unlocked slot
        if (this.selectedElements[i]) {
          const elem = this.selectedElements[i];
          // Build content container and insert VisualPreview (with fallback) instead of flat background
          const content = document.createElement('div');
          content.className = 'fusion-slot-content';
          const nameSpan = document.createElement('span');
          nameSpan.textContent = elem.name;
          const removeBtn = document.createElement('button');
          removeBtn.className = 'fusion-slot-remove';
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onSlotRemove(i); });
          // Try to create a VisualPreview; fallback to a simple color block
          try {
            const previewData = {
              color: elem.color,
              secondaryColor: elem.secondaryColor,
              accentColor: elem.accentColor || elem.secondaryColor,
              properties: elem.propertyGenes,
              visualEffects: elem.visualEffects
            };
            // Import assumed available at runtime; VisualPreview provided by UI bundle
            const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
            previewEl.classList.add('fusion-slot-preview');
            content.appendChild(previewEl);
          } catch (e) {
            const fallback = document.createElement('div');
            fallback.className = 'fusion-slot-fallback-color';
            fallback.style.width = '100%';
            fallback.style.height = '60%';
            fallback.style.background = `rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})`;
            fallback.style.borderRadius = '6px';
            content.appendChild(fallback);
          }
          content.appendChild(nameSpan);
          content.appendChild(removeBtn);
          slot.appendChild(content);
        } else {
          // Show faded mana essence icon + cost for empty fusion slot
          const cost = COSTS[i] || 0;
          slot.innerHTML = `
            <div class="fusion-slot-placeholder">
              <span class="fusion-slot-placeholder-icon">${Icons ? Icons.manaEssenceSVG(14) : ''}</span>
              <span class="fusion-slot-placeholder-cost">${cost}</span>
            </div>
          `;
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

  onUnlockSlot(slotIndex) {
    // Slots are all unlocked from the start now, so this is a no-op
  }
}
```