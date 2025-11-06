export class SpellSlotsUI {
  constructor(container, callbacks = {}) {
    this.externalContainer = container;
    this.onUnequip = callbacks.onUnequip || (() => {});
    this.onAllocateEssence = callbacks.onAllocateEssence || (() => {});
    this.getEquippedSpells = callbacks.getEquippedSpells || (() => []);
    this.getSpellSlotEssence = callbacks.getSpellSlotEssence || (() => []);
    this.getEssenceBank = callbacks.getEssenceBank || (() => 0);
    this.container = null;
  }

  mount() {
    // Ensure equipped container exists
    if (!this.externalContainer) return;
    this.externalContainer.innerHTML = '';
    this.container = document.createElement('div');
    this.externalContainer.appendChild(this.container);
  }

  update(equippedSpells, slotEssence, bank) {
    if (!this.externalContainer) return;
    // Removed the equipped-title header per request
    this.externalContainer.innerHTML = `<div class="spell-slots" id="external-spell-slots"></div>`;
    const grid = document.getElementById('external-spell-slots');

    for (let i = 0; i < 4; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'spell-slot-wrapper';
      wrapper.dataset.slot = i;

      const slot = document.createElement('div');
      slot.className = 'spell-slot';

      const essence = slotEssence[i] || 0;

      if (equippedSpells[i]) {
        const spell = equippedSpells[i];
        const color = spell.color;
        // build properties markup (small badges) including damage and speed
        const propEntries = Object.entries(spell.properties || {});
        const propsHtml = propEntries.length === 0
          ? ''
          : '<div class="spell-slot-properties">' + propEntries
            .map(([k,v]) => {
              // format numeric values
              const val = (typeof v === 'number') ? (Math.round((k === 'damage' || k === 'speed') ? v : v * 100) / 100) : v;
              return `<div class="property-badge" data-property="${k}">
                        <span class="property-icon"></span>
                        <span class="property-value">${val}</span>
                      </div>`;
            }).join('') + '</div>';

        slot.innerHTML = `
          <div class="spell-slot-content" style="background: rgb(${color.r}, ${color.g}, ${color.b})">
            <span class="spell-slot-name">${spell.name}</span>
            ${propsHtml}
            <span class="spell-slot-number">${i + 1}</span>
            <button class="spell-slot-unequip">−</button>
          </div>
        `;
        slot.querySelector('.spell-slot-unequip').addEventListener('click', (e) => {
          e.stopPropagation();
          this.onUnequip(i);
        });
      } else {
        // simple symbol placeholder "O"
        slot.innerHTML = `<span class="spell-slot-placeholder">O</span>`;
      }

      // Add add-essence button overlay if bank available
      if (bank > 0) {
        const addBtn = document.createElement('button');
        addBtn.className = 'slot-add-essence';
        addBtn.textContent = '+';
        addBtn.title = 'Assign 1 Mana Essence to this slot';
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onAllocateEssence(i);
        });
        slot.appendChild(addBtn);
      }

      // essence display moved below the slot
      const essenceEl = document.createElement('div');
      essenceEl.className = `spell-slot-essence ${equippedSpells[i] ? '' : 'inactive'}`;
      essenceEl.textContent = `ME: ${essence}`;

      wrapper.appendChild(slot);
      wrapper.appendChild(essenceEl);
      grid.appendChild(wrapper);
    }
  }
}