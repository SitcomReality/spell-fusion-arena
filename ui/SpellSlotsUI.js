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
    this.externalContainer.innerHTML = `<h3 class="equipped-title">Equipped Spells (${equippedSpells.filter(s => s).length}/5) — Bank: ${bank} ME</h3><div class="spell-slots" id="external-spell-slots"></div>`;
    const grid = document.getElementById('external-spell-slots');

    for (let i = 0; i < 5; i++) {
      const slot = document.createElement('div');
      slot.className = 'spell-slot';
      slot.dataset.slot = i;
      const essence = slotEssence[i] || 0;

      if (equippedSpells[i]) {
        const spell = equippedSpells[i];
        const color = spell.color;
        slot.innerHTML += `
          <div class="spell-slot-content" style="background: rgb(${color.r}, ${color.g}, ${color.b})">
            <span class="spell-slot-name">${spell.name}</span>
            <div class="spell-slot-essence">ME: ${essence}</div>
            <span class="spell-slot-number">${i + 1}</span>
            <button class="spell-slot-unequip">−</button>
          </div>
        `;
        slot.querySelector('.spell-slot-unequip').addEventListener('click', (e) => {
          e.stopPropagation();
          this.onUnequip(i);
        });
      } else {
        slot.innerHTML += `<span class="spell-slot-placeholder">Empty</span><div class="spell-slot-essence inactive">ME: ${essence}</div>`;
      }

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

      grid.appendChild(slot);
    }
  }
}