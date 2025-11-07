import { Icons } from './Icons.js';

export class SpellSlotsUI {
  constructor(container, callbacks = {}) {
    this.externalContainer = container;
    this.onUnequip = callbacks.onUnequip || (() => {});
    this.onAllocateFocus = callbacks.onAllocateFocus || (() => {});
    this.onEquipFromInventory = callbacks.onEquipFromInventory || (() => {});
    this.getEquippedSpells = callbacks.getEquippedSpells || (() => []);
    this.getSpellSlotFocus = callbacks.getSpellSlotFocus || (() => []);
    this.getFocusBank = callbacks.getFocusBank || (() => 0);
    this.getSpellInventory = callbacks.getSpellInventory || (() => []);
    this.container = null;
  }

  mount() {
    if (!this.externalContainer) return;
    this.externalContainer.innerHTML = '';
    this.container = document.createElement('div');
    this.externalContainer.appendChild(this.container);
  }

  update(equippedSpells, slotFocus, focusBank, spellInventory) {
    if (!this.externalContainer) return;
    this.externalContainer.innerHTML = `<div class="spell-slots" id="external-spell-slots"></div>`;
    const grid = document.getElementById('external-spell-slots');

    for (let i = 0; i < 4; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'spell-slot-wrapper';
      wrapper.dataset.slot = i;

      const slot = document.createElement('div');
      slot.className = 'spell-slot';

      const focus = slotFocus[i] || 0;

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
            <button class="slot-props-btn" aria-label="Show properties">i</button>
            <div class="slot-props-tooltip" aria-hidden="true"></div>
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

        // Populate tooltip content with properties
        const tooltipEl = slot.querySelector('.slot-props-tooltip');
        if (tooltipEl) {
          if (propEntries.length === 0) {
            tooltipEl.innerHTML = `<div class="property-row properties-empty">No special properties</div>`;
          } else {
            tooltipEl.innerHTML = propEntries.map(([k,v]) => {
              const val = (typeof v === 'number') ? (Math.round((k === 'damage' || k === 'speed') ? v : v * 100) / 100) : v;
              return `<div class="property-row"><span class="property-name">${k}</span><span class="property-value">${val}</span></div>`;
            }).join('');
          }
        }

        // Press-to-show behavior for touch and mouse
        const btn = slot.querySelector('.slot-props-btn');
        let pressTimer = null;
        const showTooltip = (show) => {
          if (tooltipEl) {
            tooltipEl.classList.toggle('active', show);
            tooltipEl.setAttribute('aria-hidden', !show);
          }
        };

        if (btn) {
          btn.addEventListener('mousemove', (ev) => {
            ev.stopPropagation();
            showTooltip(true);
          });
          document.addEventListener('mouseup', () => showTooltip(false));
          btn.addEventListener('touchstart', (ev) => {
            ev.stopPropagation();
            showTooltip(true);
          }, { passive: true });
          btn.addEventListener('touchend', (ev) => {
            ev.stopPropagation();
            showTooltip(false);
          });
          btn.addEventListener('mouseleave', () => showTooltip(false));
        }
      } else {
        // Empty slot: show button to pick from inventory
        slot.innerHTML = `<button class="spell-slot-empty-btn" data-slot="${i}">+</button>`;
        const emptyBtn = slot.querySelector('.spell-slot-empty-btn');
        emptyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showInventorySelector(i, spellInventory);
        });
      }

      // Add add-focus button overlay if bank available
      if (focusBank > 0) {
        const addBtn = document.createElement('button');
        addBtn.className = 'slot-add-essence';
        addBtn.textContent = '+';
        addBtn.title = 'Assign 1 Focus to this slot';
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onAllocateFocus(i);
        });
        slot.appendChild(addBtn);
      }

      // focus display moved below the slot
      const focusEl = document.createElement('div');
      focusEl.className = `spell-slot-essence ${equippedSpells[i] ? '' : 'inactive'}`;

      // Use the Focus SVG icon instead of the "Focus:" text.
      // Create icon element and append the numeric value.
      const iconEl = Icons.createIconElement(Icons.focusSVG(14));
      iconEl.classList.add('slot-focus-icon');
      focusEl.appendChild(iconEl);
      const numNode = document.createElement('span');
      numNode.className = 'slot-focus-number';
      numNode.textContent = `${focus}`;
      focusEl.appendChild(numNode);

      wrapper.appendChild(slot);
      wrapper.appendChild(focusEl);
      grid.appendChild(wrapper);
    }
  }

  // NEW: Show inventory selector modal when empty slot is clicked
  showInventorySelector(slotIndex, spellInventory) {
    if (spellInventory.length === 0) {
      alert('No spells in inventory. Create a spell first!');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'inventory-selector-overlay';
    overlay.className = 'inventory-selector-overlay';
    overlay.innerHTML = `
      <div class="inventory-selector-modal">
        <div class="inventory-selector-header">
          <h3>Select a spell for Slot ${slotIndex + 1}</h3>
          <button class="inventory-selector-close" aria-label="Close">×</button>
        </div>
        <div class="inventory-selector-list" id="inventory-list"></div>
      </div>
    `;

    const listContainer = overlay.querySelector('#inventory-list');
    spellInventory.forEach((spell, idx) => {
      const item = document.createElement('div');
      item.className = 'inventory-spell-item';
      const color = spell.color;
      item.innerHTML = `
        <div class="inventory-spell-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
        <div class="inventory-spell-info">
          <div class="inventory-spell-name">${spell.name}</div>
          <div class="inventory-spell-desc">Damage: ${Math.round(spell.properties.damage)}, Speed: ${Math.round(spell.properties.speed)}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        this.onEquipFromInventory(slotIndex, spell);
        overlay.remove();
      });
      listContainer.appendChild(item);
    });

    const closeBtn = overlay.querySelector('.inventory-selector-close');
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }
}