import { ElementsLibrary } from './elements/ElementsLibrary.js';
import { ElementDetailsPanel } from './elements/ElementDetailsPanel.js';
import { FusionBuilder } from './FusionBuilder.js';
import { FusionPreview } from './FusionPreview.js';
import { SpellSlotsUI } from './SpellSlotsUI.js';
import { SpellFusion } from '../spells/SpellFusion.js';
import { getSpellCost } from '../spells/Element.js';
import { FusionController } from './fusion/FusionController.js';
import { CreatedSpellsList } from './fusion/CreatedSpellsList.js';

export class FusionUI {
  constructor(onSpellEquipped, gameState) {
    this.container = document.getElementById('fusion-ui');
    this.equippedContainer = document.getElementById('equipped-spells');
    this.onSpellEquipped = onSpellEquipped;
    this.gameState = gameState;

    // Delegate heavy logic to the controller
    this.controller = new FusionController(onSpellEquipped, gameState);

    // Created spells list helper
    this.createdList = new CreatedSpellsList((spell) => {
      // quick-equip event: dispatch to controller
      this.controller.handleQuickEquip(spell);
      this.renderSpellSlots();
    });

    this.render();
  }

  addEssenceToBank(amount) {
    this.controller.addEssence(amount);
  }

  addFocusToBank(amount) {
    this.controller.addFocus(amount);
  }

  unlockFusionSlot(slotIndex) {
    // Slots are all unlocked from the start now, so this is a no-op
  }

  render() {
    // keep outer DOM scaffold but delegate inner pieces
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

        <div class="fusion-section">
          <h2>Created Spells</h2>
          <div id="created-spells-list" class="created-spells-list" aria-live="polite"></div>
        </div>
      </div>
    `;

    // mount controller-managed subcomponents
    this.controller.mount({
      elementsLibraryEl: document.getElementById('elements-library'),
      elementDetailsEl: document.getElementById('element-details-panel'),
      fusionBuilderEl: document.getElementById('fusion-builder'),
      fusionPanelEl: document.getElementById('fusion-panel')
    });

    this.createdList.mount(document.getElementById('created-spells-list'));
    this.controller.refresh();
    this.renderSpellSlots();

    const clearBtn = this.container.querySelector('.fusion-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => this.controller.clearFusion());
  }

  renderSpellSlots() {
    const { equippedSpells, spellSlotFocus, focusBank, spellInventory } = this.controller.getPublicState();
    // reuse existing SpellSlotsUI instance behavior via controller helper
    this.controller.spellSlotsUI.update(equippedSpells, spellSlotFocus, focusBank, spellInventory);
  }

  // Renders the player's created spells inventory as a vertical list.
  renderCreatedSpells() {
    this.createdList.render(this.controller.spellInventory, this.controller.equippedSpells);
  }

  onElementClicked(key, element, cardEl) {
    this.controller.onElementClicked(key, element, cardEl);
    
    // NEW: Handle tutorial progression from step 0 (Select Element) to step 1 (Add to Fusion Slot)
    try {
      if (window && window.gameInstance && window.gameInstance.tutorial && window.gameInstance.tutorial.isActive) {
        if (window.gameInstance.tutorial.currentStep === 0) {
          window.gameInstance.tutorial.showStep(1);
        }
      }
    } catch (e) {}
  }

  addElementToFusion(element) {
    this.controller.addElementToFusion(element);
  }

  removeElement(index) {
    this.controller.removeElement(index);
  }

  clearFusion() {
    this.controller.clearFusion();
  }

  updateFusionPreview(forceEmpty = false) {
    this.controller.updateFusionPreview(forceEmpty);
  }

  // NEW: Add spell to inventory (costs Essence)
  addSpellToInventory(spell) {
    this.controller.addSpellToInventory(spell);
  }

  // NEW: Equip spell from inventory to a slot (free)
  equipSpellFromInventory(slotIndex, spell) {
    this.controller.equipSpellFromInventory(slotIndex, spell);
  }

  unequipSpell(index) {
    this.controller.unequipSpell(index);
  }

  allocateFocusToSlot(slotIndex) {
    this.controller.allocateFocusToSlot(slotIndex);
  }

  getEquippedSpells() {
    return this.controller.getEquippedSpells();
  }
}