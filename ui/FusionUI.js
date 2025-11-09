import { ElementsLibrary } from './elements/ElementsLibrary.js';
import { ElementDetailsPanel } from './elements/ElementDetailsPanel.js';
import { FusionBuilder } from './FusionBuilder.js';
import { FusionPreview } from './FusionPreview.js';
import { SpellSlotsUI } from './SpellSlotsUI.js';
import { SpellFusion } from '../spells/SpellFusion.js';
import { getSpellCost } from '../spells/Element.js';

export class FusionUI {
  constructor(onSpellEquipped, gameState) {
    this.container = document.getElementById('fusion-ui');
    this.equippedContainer = document.getElementById('equipped-spells');
    this.onSpellEquipped = onSpellEquipped;
    this.gameState = gameState;

    this.selectedElements = [];
    this.currentSpell = null;
    this.equippedSpells = [null, null, null, null];
    this.spellSlotFocus = [1, 0, 0, 0]; // Focus starts at 1 for slot 1, 0 for others
    this.spellInventory = []; // NEW: Array of created spells
    this.essenceBank = 1; // Mana Essence for spell equipping (start with 1)
    this.focusBank = 0;   // Focus for upgrading slots
    this.maxFusionSlots = 4;
    this.unlockedFusionSlots = 4; // All slots unlocked from start

    // Create subcomponents
    this.elementsLibrary = new ElementsLibrary((key, element, cardEl) => {
      this.onElementClicked(key, element, cardEl);
    });

    this.detailsPanel = new ElementDetailsPanel();

    this.fusionBuilder = new FusionBuilder({
      totalSlots: 4,
      unlockedSlots: this.unlockedFusionSlots,
      onSlotRemove: (idx) => this.removeElement(idx),
      onUnlockSlot: (slotIndex) => this.unlockFusionSlot(slotIndex),
      // NEW: allow builder to read the live Mana Essence value so it can mark inactive slots
      getEssence: () => this.essenceBank
    });

    this.fusionPreview = new FusionPreview();

    this.spellSlotsUI = new SpellSlotsUI(this.equippedContainer, {
      getEquippedSpells: () => this.equippedSpells,
      getSpellSlotFocus: () => this.spellSlotFocus,
      getEssenceBank: () => this.essenceBank,
      getSpellInventory: () => this.spellInventory,
      onUnequip: (i) => this.unequipSpell(i),
      onAllocateFocus: (i) => this.allocateFocusToSlot(i),
      onEquipFromInventory: (slotIndex, spellFromInventory) => this.equipSpellFromInventory(slotIndex, spellFromInventory)
    });

    this.render();
  }

  addEssenceToBank(amount) {
    this.essenceBank += amount;
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    // Update HUD if available
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setEssence(this.essenceBank);
      }
    } catch (e) {}
  }

  addFocusToBank(amount) {
    this.focusBank += amount;
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    // Update HUD if available
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setFocus(this.focusBank);
      }
    } catch (e) {}
  }

  unlockFusionSlot(slotIndex) {
    // Slots are all unlocked from the start now, so this is a no-op
  }

  render() {
    this.container.innerHTML = `
      <div class="fusion-container">
        <div class="fusion-section">
          <h2>Elements</h2>
          <div class="elements-layout-wrapper">
            <div class="elements-library" id="elements-library"></div>
            <div class="element-details-panel" id="element-details-panel"></div>
          </div>
        </div>
        
        <div class="fusion-section">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <h2 style="margin:0;">Create Spell</h2>
            <button class="fusion-clear-btn" title="Clear selected elements" style="border:1px solid #4a9eff; background:rgba(74,158,255,0.06); color:#b0d4ff; padding:6px 10px; cursor:pointer;">Clear</button>
          </div>
          <div class="fusion-layout-wrapper">
            <div class="fusion-builder" id="fusion-builder"></div>
            <div id="fusion-panel"></div>
          </div>
        </div>
        
        <!-- Created spells list: player's spell inventory -->
        <div class="fusion-section">
          <h2>Created Spells</h2>
          <div id="created-spells-list" class="created-spells-list" aria-live="polite"></div>
        </div>
      </div>
    `;

    // mount subcomponents into DOM
    this.elementsLibrary.mount(document.getElementById('elements-library'));
    this.detailsPanel.mount(document.getElementById('element-details-panel'));
    this.fusionBuilder.mount(document.getElementById('fusion-builder'));
    this.fusionPreview.mount(document.getElementById('fusion-panel'));
    this.spellSlotsUI.mount();

    // Wire the external Clear button to clear fusion selection
    const clearBtn = this.container.querySelector('.fusion-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFusion());
    }

    // initial updates - pass unlockedElementKeys to refresh
    this.elementsLibrary.refresh(this.gameState?.unlockedElementKeys || []);
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    this.renderCreatedSpells();

    // Set up preview clear callback
    this.fusionPreview.setOnClear(() => this.clearFusion());
  }

  renderSpellSlots() {
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
  }

  // Renders the player's created spells inventory as a vertical list.
  renderCreatedSpells() {
    const listEl = this.container && this.container.querySelector('#created-spells-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!this.spellInventory || this.spellInventory.length === 0) {
      listEl.innerHTML = `<div class="properties-empty">No created spells yet</div>`;
      return;
    }

    // Each item: small color square (same height as text) + name and simple stats
    this.spellInventory.forEach((spell, idx) => {
      const item = document.createElement('div');
      item.className = 'created-spell-item';
      item.dataset.index = idx;

      const color = spell.color || { r: 120, g: 120, b: 120 };
      const dmg = Math.round((spell.properties?.damage || 0));
      const spd = Math.round((spell.properties?.speed || 0));

      item.innerHTML = `
        <span class="created-spell-color" aria-hidden="true" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></span>
        <span class="created-spell-label">${spell.name} <span class="created-spell-meta">— D:${dmg} S:${spd}</span></span>
        <button class="created-spell-delete" title="Delete spell" aria-label="Delete spell">✕</button>
      `;

      // Delete button handler: remove spell from inventory and re-render
      const deleteBtn = item.querySelector('.created-spell-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Remove the spell at this index
          this.spellInventory.splice(idx, 1);
          // Re-render slots and created list
          this.renderSpellSlots();
          this.renderCreatedSpells();
        });
      }

      // Allow clicking to equip from this list via a quick-equip action (optional UX)
      item.addEventListener('click', (ev) => {
        // Avoid triggering equip when clicking the delete button
        if (ev.target.closest('.created-spell-delete')) return;
        // If user has no equipped slot empty, open a chooser by dispatching a simple event:
        const event = new CustomEvent('fusionui:equip-from-created', { detail: { spell, index: idx } });
        window.dispatchEvent(event);
      });

      listEl.appendChild(item);
    });
  }

  onElementClicked(key, element, cardEl) {
    this.elementsLibrary.markSelectedCard(cardEl);
    this.detailsPanel.show(element, () => this.addElementToFusion(element));
  }

  addElementToFusion(element) {
    if (this.selectedElements.length >= this.maxFusionSlots) return;
    this.selectedElements.push(element);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();

    try {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        // Determine whether to auto-scroll: only when all currently affordable slots are filled.
        // Use the same COSTS mapping as FusionBuilder to determine per-slot required essence.
        const COSTS = [1, 5, 10, 20]; // per-slot required Mana Essence for slots 0..3
        const currentEssence = Number(this.essenceBank || 0);

        // Count how many fusion slots are currently affordable (player can pay the slot cost)
        let affordableSlots = 0;
        for (let i = 0; i < Math.min(this.maxFusionSlots, COSTS.length); i++) {
          if (currentEssence >= (COSTS[i] || 0)) affordableSlots++;
        }

        // If the number of selected elements equals the number of affordable slots, scroll down.
        if (this.selectedElements.length === affordableSlots && affordableSlots > 0) {
          const fusionContainer = this.container;
          const fusionSections = fusionContainer.querySelectorAll('.fusion-section');
          const targetSection = fusionSections[1] || fusionSections[0];
          if (targetSection) {
            const offsetTop = targetSection.offsetTop;
            fusionContainer.scrollTo({ top: offsetTop - 8, behavior: 'smooth' });
          }
        }
      }
    } catch (e) {
      // silent fallback
    }
  }

  removeElement(index) {
    this.selectedElements.splice(index, 1);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();
  }

  clearFusion() {
    this.selectedElements = [];
    this.currentSpell = null;
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview(true);
  }

  updateFusionPreview(forceEmpty = false) {
    if (forceEmpty || this.selectedElements.length === 0) {
      this.fusionPreview.showMessage(`Add an element to create a spell`);
      return;
    }

    this.currentSpell = SpellFusion.fuse(...this.selectedElements);

    const cost = getSpellCost(this.selectedElements.length);

    // NEW: Handle step 7 tutorial constraint
    const isInTutorialStep7 = document.documentElement.classList.contains('tutorial-lock-to-fusion-full');
    const isExactlyTwoElements = this.selectedElements.length === 2;
    const canCreate = isInTutorialStep7 ? isExactlyTwoElements : true;
    const affordable = (this.essenceBank >= cost) && canCreate;

    this.fusionPreview.showSpell(this.currentSpell, () => this.addSpellToInventory(this.currentSpell), cost, affordable);
    
    // NEW: Mark create button for step 7 specific styling
    if (isInTutorialStep7) {
      const createBtn = document.querySelector('.fusion-preview-create');
      if (createBtn) {
        createBtn.classList.toggle('enabled-for-two-elements', isExactlyTwoElements);
      }
    }
  }

  // NEW: Add spell to inventory (costs Essence)
  addSpellToInventory(spell) {
    const elementCount = this.selectedElements.length;
    const cost = getSpellCost(elementCount);

    if (this.essenceBank < cost) {
      alert(`Need ${cost} Mana Essence to create this spell (have ${this.essenceBank})`);
      return;
    }

    // Deduct cost and add to inventory
    this.essenceBank -= cost;
    this.spellInventory.push(spell);

    // Clear fusion UI after successful creation
    this.clearFusion();
    this.renderSpellSlots();
    // Update created spells list
    this.renderCreatedSpells();

    // Update HUD to reflect essence spent
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setEssence(this.essenceBank);
      }
    } catch (e) {}
  }

  // NEW: Equip spell from inventory to a slot (free)
  equipSpellFromInventory(slotIndex, spell) {
    // Remove the same spell from any other slot so each spell occupies at most one slot
    for (let i = 0; i < this.equippedSpells.length; i++) {
      if (i !== slotIndex && this.equippedSpells[i] === spell) {
        this.equippedSpells[i] = null;
      }
    }
    this.equippedSpells[slotIndex] = spell;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.renderSpellSlots();
    this.renderCreatedSpells();
  }

  unequipSpell(index) {
    this.equippedSpells[index] = null;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.renderSpellSlots();
    this.renderCreatedSpells();
  }

  allocateFocusToSlot(slotIndex) {
    if (this.focusBank <= 0) return;
    this.spellSlotFocus[slotIndex] = (this.spellSlotFocus[slotIndex] || 0) + 1;
    this.focusBank -= 1;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.renderSpellSlots();
    // Update HUD to reflect focus spent
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setFocus(this.focusBank);
      }
    } catch (e) {}
  }

  getEquippedSpells() {
    return this.equippedSpells.filter(s => s !== null);
  }

  refresh() {
    this.elementsLibrary.refresh(this.gameState.unlockedElementKeys);
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();
    this.renderCreatedSpells();
  }
}