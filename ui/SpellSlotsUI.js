import { Icons } from './Icons.js';
import VisualPreview from './VisualPreview.js';

export class SpellSlotsUI {
  constructor(container, callbacks = {}) {
    this.externalContainer = container;
    this.onUnequip = callbacks.onUnequip || (() => {});
    this.onAllocateFocus = callbacks.onAllocateFocus || (() => {});
    this.onEquipFromInventory = callbacks.onEquipFromInventory || (() => {});
    this.onSetTargetPreference = callbacks.onSetTargetPreference || (() => {});
    this.getEquippedSpells = callbacks.getEquippedSpells || (() => []);
    this.getSpellSlotFocus = callbacks.getSpellSlotFocus || (() => []);
    this.getFocusBank = callbacks.getFocusBank || (() => 0);
    this.getSpellInventory = callbacks.getSpellInventory || (() => []);
    this.getTargetPreferences = callbacks.getTargetPreferences || (() => ['nearest', 'furthest', 'strongest', 'weakest']);
    this.container = null;
    this._spellEquippedHandler = null;
    this._focusAllocatedHandler = null;
  }

  mount() {
    if (!this.externalContainer) return;
    this.externalContainer.innerHTML = '';
    this.container = document.createElement('div');
    this.externalContainer.appendChild(this.container);
  }

  update(equippedSpells, slotFocus, focusBank, spellInventory, targetPreferences) {
    if (!this.externalContainer) return;
    this.externalContainer.innerHTML = `<div class="spell-slots" id="external-spell-slots"></div>`;
    const grid = document.getElementById('external-spell-slots');

    for (let i = 0; i < 4; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'spell-slot-wrapper';
      wrapper.dataset.slot = i;

      const slot = document.createElement('div');
      const focus = slotFocus[i] || 0;
      slot.className = 'spell-slot' + (focus < 1 ? ' inactive-slot' : '');
      slot.setAttribute('data-focus', String(focus));

      let headerContentHtml = `
          <div class="spell-slot-header">
            <span class="spell-slot-focus-display"></span>
            ${focusBank > 0 ? `<button class="slot-add-focus" title="Assign 1 Focus to this slot">+</button>` : ''}
          </div>`;

      const appendFocusDisplay = (slotEl) => {
        const focusDisplayEl = slotEl.querySelector('.spell-slot-focus-display');
        if (!focusDisplayEl) return;
        
        const iconEl = Icons.createIconElement(Icons.focusSVG(14));
        iconEl.classList.add('slot-focus-icon');
        focusDisplayEl.appendChild(iconEl);
        const numNode = document.createElement('span');
        numNode.className = 'slot-focus-number';
        numNode.textContent = `${focus}`;
        focusDisplayEl.appendChild(numNode);
      };

      if (equippedSpells[i]) {
        const spell = equippedSpells[i];
        const color = spell.color;
        const propEntries = Object.entries(spell.properties || {});
        const propsHtml = propEntries.length === 0
          ? ''
          : '<div class="spell-slot-properties">' + propEntries
            .map(([k,v]) => {
              const val = (typeof v === 'number') ? (Math.round((k === 'damage' || k === 'speed') ? v : v * 100) / 100) : v;
              return `<div class="property-badge" data-property="${k}">
                        <span class="property-icon"></span>
                        <span class="property-value">${val}</span>
                      </div>`;
            }).join('') + '</div>';

        slot.innerHTML = `
          ${headerContentHtml}
          <div class="spell-slot-content">
            <button class="slot-target-selector" title="Change target preference" data-slot="${i}">🎯</button>
            <button class="slot-props-btn" aria-label="Show properties">i</button>
            <div class="slot-props-tooltip" aria-hidden="true"></div>
            ${propsHtml}
            <button class="spell-slot-swap" title="Swap spell">⇄</button>
          </div>
          <div class="spell-slot-footer">
            <span class="spell-slot-name">${spell.name}</span>
          </div>
        `;

        try {
          const previewData = {
            color: spell.color,
            secondaryColor: spell.secondaryColor,
            accentColor: spell.accentColor || spell.secondaryColor,
            properties: spell.properties,
            visualEffects: spell.visualEffects
          };
          const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
          previewEl.classList.add('slot-visual-preview');
          const contentEl = slot.querySelector('.spell-slot-content');
          if (contentEl) {
            contentEl.insertBefore(previewEl, contentEl.firstChild);
          }
        } catch (e) {
          const contentEl = slot.querySelector('.spell-slot-content');
          if (contentEl) contentEl.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
        }

        appendFocusDisplay(slot);

        slot.querySelector('.spell-slot-swap').addEventListener('click', (e) => {
          e.stopPropagation();
          this.showInventorySelector(i, this.getSpellInventory());
        });

        const targetBtn = slot.querySelector('.slot-target-selector');
        if (targetBtn) {
          const currentPref = targetPreferences ? targetPreferences[i] : 'nearest';
          targetBtn.title = `Target: ${currentPref}`;
          targetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTargetSelector(i, currentPref);
          });
        }

        const addFocusBtn = slot.querySelector('.slot-add-focus');
        if (addFocusBtn) {
          addFocusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onAllocateFocus(i);
            if (this._focusAllocatedHandler) {
              this._focusAllocatedHandler();
            }
          });
        }

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
        slot.innerHTML = `
          ${headerContentHtml}
          <button class="spell-slot-empty-btn" data-slot="${i}">+</button>
          <div class="spell-slot-footer">
            <span class="spell-slot-name inactive">Empty Slot</span>
          </div>
        `;

        appendFocusDisplay(slot);
        
        const addFocusBtn = slot.querySelector('.slot-add-focus');
        if (addFocusBtn) {
          addFocusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onAllocateFocus(i);
            if (this._focusAllocatedHandler) {
              this._focusAllocatedHandler();
            }
          });
        }

        const emptyBtn = slot.querySelector('.spell-slot-empty-btn');
        if (emptyBtn) {
          if (focus < 1) {
            emptyBtn.disabled = true;
            emptyBtn.title = 'Assign Focus to this slot to enable equipping a spell';
            emptyBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); });
          } else {
            emptyBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.showInventorySelector(i, spellInventory);
            });
          }
        }
      }

      wrapper.appendChild(slot);
      grid.appendChild(wrapper);
    }
  }

  showTargetSelector(slotIndex, currentPref) {
    const targetOptions = ['nearest', 'furthest', 'strongest', 'weakest'];
    const labels = {
      nearest: '🎯 Nearest',
      furthest: '📍 Furthest',
      strongest: '💪 Strongest',
      weakest: '🎲 Weakest'
    };

    const overlay = document.createElement('div');
    overlay.id = 'target-selector-overlay';
    overlay.className = 'target-selector-overlay';
    overlay.innerHTML = `
      <div class="target-selector-modal">
        <h3>Target Preference</h3>
        <div class="target-options" id="target-options"></div>
      </div>
    `;

    const optionsContainer = overlay.querySelector('#target-options');
    targetOptions.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'target-option-btn' + (option === currentPref ? ' active' : '');
      btn.textContent = labels[option];
      btn.addEventListener('click', () => {
        this.onSetTargetPreference(slotIndex, option);
        overlay.remove();
        try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
      });
      optionsContainer.appendChild(btn);
    });

    const closeOverlay = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });

    document.body.appendChild(overlay);
  }

  onSpellEquipped(callback) {
    this._spellEquippedHandler = callback;
    return () => {
      this._spellEquippedHandler = null;
    };
  }

  onFocusAllocated(callback) {
    this._focusAllocatedHandler = callback;
    return () => {
      this._focusAllocatedHandler = null;
    };
  }

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
    // Add document-level class so other UI (tutorial callouts) can react/ hide when inventory modal is open.
    document.documentElement.classList.add('inventory-modal-open');

    const removeInventoryFlag = () => {
      document.documentElement.classList.remove('inventory-modal-open');
    };

    spellInventory.forEach((spell, idx) => {
      const item = document.createElement('div');
      item.className = 'inventory-spell-item';
      const color = spell.color;
      // Use VisualPreview for inventory color preview, fallback to color square if needed
      item.innerHTML = `
        <div class="inventory-spell-info">
          <div class="inventory-spell-name">${spell.name}</div>
          <div class="inventory-spell-desc">Damage: ${Math.round(spell.properties.damage)}, Speed: ${Math.round(spell.properties.speed)}</div>
        </div>
      `;
      try {
        const previewData = {
          color: spell.color,
          secondaryColor: spell.secondaryColor,
          accentColor: spell.accentColor || spell.secondaryColor,
          properties: spell.properties,
          visualEffects: spell.visualEffects
        };
        const previewEl = VisualPreview.create(previewData, { size: 'small', interactive: false });
        previewEl.classList.add('inventory-spell-color');
        item.insertBefore(previewEl, item.firstChild);
      } catch (e) {
        const colorEl = document.createElement('div');
        colorEl.className = 'inventory-spell-color';
        colorEl.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
        item.insertBefore(colorEl, item.firstChild);
      }

      item.addEventListener('click', () => {
        this.onEquipFromInventory(slotIndex, spell);
        // NEW: Trigger tutorial completion
        if (this._spellEquippedHandler) {
          this._spellEquippedHandler();
        }
        // ensure we remove the document-level flag before removing overlay
        removeInventoryFlag();
        overlay.remove();

        // Persist save when user equips a spell from inventory via the selector
        try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
      });
      listContainer.appendChild(item);
    });

    const closeBtn = overlay.querySelector('.inventory-selector-close');
    closeBtn.addEventListener('click', () => {
      removeInventoryFlag();
      overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        removeInventoryFlag();
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
  }
}