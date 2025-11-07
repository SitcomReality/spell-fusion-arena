export class SpellSlotsUI {
  constructor(container, callbacks = {}) {
    this.externalContainer = container;
    this.onUnequip = callbacks.onUnequip || (() => {});
    this.onAllocateFocus = callbacks.onAllocateFocus || (() => {});
    this.getEquippedSpells = callbacks.getEquippedSpells || (() => []);
    this.getSpellSlotFocus = callbacks.getSpellSlotFocus || (() => []);
    this.getFocusBank = callbacks.getFocusBank || (() => 0);
    this.container = null;
  }

  mount() {
    if (!this.externalContainer) return;
    this.externalContainer.innerHTML = '';
    this.container = document.createElement('div');
    this.externalContainer.appendChild(this.container);
  }

  update(equippedSpells, slotFocus, focusBank) {
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
        slot.innerHTML = `<span class="spell-slot-placeholder">O</span>`;
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
      focusEl.textContent = `Focus: ${focus}`;

      wrapper.appendChild(slot);
      wrapper.appendChild(focusEl);
      grid.appendChild(wrapper);
    }
  }
}