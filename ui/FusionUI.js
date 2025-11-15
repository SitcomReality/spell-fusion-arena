import { ElementsLibrary } from './elements/ElementsLibrary.js';
import { ElementDetailsPanel } from './elements/ElementDetailsPanel.js';
import { FusionBuilder } from './FusionBuilder.js';
import { FusionPreview } from './FusionPreview.js';
import { SpellSlotsUI } from './SpellSlotsUI.js';
import { FusionState } from './fusion/FusionState.js';
import { InventoryManager } from './fusion/InventoryManager.js';
import { FocusManager } from './fusion/FocusManager.js';
import { FusionController } from './fusion/FusionController.js';

export class FusionUI {
  constructor(onSpellEquipped, gameState) {
    this.container = document.getElementById('fusion-ui');
    this.equippedContainer = document.getElementById('equipped-spells');
    this.onSpellEquipped = onSpellEquipped;
    this.gameState = gameState;

    this.state = new FusionState();
    this.inventoryManager = new InventoryManager(this.state);
    this.focusManager = new FocusManager(this.state);

    this.elementsLibrary = new ElementsLibrary((key, element, cardEl) => {
      this.onElementClicked(key, element, cardEl);
    });

    this.detailsPanel = new ElementDetailsPanel();

    this.fusionBuilder = new FusionBuilder({
      totalSlots: 4,
      unlockedSlots: this.state.unlockedFusionSlots,
      onSlotRemove: (idx) => this.fusionController.removeElement(idx),
      onUnlockSlot: (slotIndex) => this.unlockFusionSlot(slotIndex),
      getEssence: () => this.state.essenceBank
    });

    this.fusionPreview = new FusionPreview();
    this.fusionController = new FusionController(this.state, this.fusionPreview, this.fusionBuilder);

    this.spellSlotsUI = new SpellSlotsUI(this.equippedContainer, {
      getEquippedSpells: () => this.state.equippedSpells,
      getSpellSlotFocus: () => this.state.spellSlotFocus,
      getEssenceBank: () => this.state.essenceBank,
      getSpellInventory: () => this.state.spellInventory,
      onUnequip: (i) => this.unequipSpell(i),
      onAllocateFocus: (i) => this.allocateFocusToSlot(i),
      onEquipFromInventory: (slotIndex, spellFromInventory) => this.equipSpellFromInventory(slotIndex, spellFromInventory),
      onSetTargetPreference: (slotIndex, preference) => this.setTargetPreference(slotIndex, preference),
      getTargetPreferences: () => this.state.targetPreferences
    });

    this.render();
  }

  addEssenceToBank(amount) {
    this.state.addEssence(amount);
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setEssence(this.state.essenceBank);
      }
    } catch (e) {}
  }

  addFocusToBank(amount) {
    this.focusManager.addFocusToBank(amount);
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setFocus(this.state.focusBank);
      }
    } catch (e) {}
  }

  unlockFusionSlot(slotIndex) {
    // Slots are all unlocked from the start
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
        
        <div class="fusion-section">
          <h2>Created Spells</h2>
          <div id="created-spells-list" class="created-spells-list" aria-live="polite"></div>
        </div>
      </div>
    `;

    this.elementsLibrary.mount(document.getElementById('elements-library'));
    this.detailsPanel.mount(document.getElementById('element-details-panel'));
    this.fusionBuilder.mount(document.getElementById('fusion-builder'));
    this.fusionPreview.mount(document.getElementById('fusion-panel'));
    this.spellSlotsUI.mount();

    const clearBtn = this.container.querySelector('.fusion-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.fusionController.clearFusion());
    }

    this.elementsLibrary.refresh(this.gameState?.unlockedElementKeys || []);
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
    this.inventoryManager.renderCreatedSpells(document.getElementById('created-spells-list'));

    this.fusionPreview.setOnClear(() => this.fusionController.clearFusion());
    this.fusionPreview.onCreateButtonClick(() => this.handleSpellCreation());
  }

  handleSpellCreation() {
    const success = this.fusionController.createSpell();
    if (!success) return;

    this.renderSpellSlots();
    this.inventoryManager.renderCreatedSpells(document.getElementById('created-spells-list'));
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}

    this.attemptTutorialProgression();

    try {
      if (this.container) {
        this.container.scrollTo?.({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {}

    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setEssence(this.state.essenceBank);
      }
    } catch (e) {}
  }

  attemptTutorialProgression() {
    try {
      if (window && window.gameInstance && window.gameInstance.tutorial && window.gameInstance.tutorial.isActive) {
        const tut = window.gameInstance.tutorial;
        const twoIdx = tut.stepManager.indexOf('two-element-fusion');
        const allocIdx = tut.stepManager.indexOf('allocate-focus');
        const equipIdx = tut.stepManager.indexOf('equip-spell');
        if (twoIdx >= 0 && allocIdx >= 0 && tut.currentStep === twoIdx) {
          tut.showStep(allocIdx);
        } else if (equipIdx >= 0) {
          tut.showStep(equipIdx);
        }
      }
    } catch (e) {}
  }

  renderSpellSlots() {
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory, this.state.targetPreferences);
  }

  setTargetPreference(slotIndex, preference) {
    if (this.state.targetPreferences) {
      this.state.targetPreferences[slotIndex] = preference;
      this.renderSpellSlots();
    }
  }

  onElementClicked(key, element, cardEl) {
    this.elementsLibrary.markSelectedCard(cardEl);
    this.detailsPanel.show(element, () => this.fusionController.addElementToFusion(element, this.container));
    
    try {
      if (window && window.gameInstance && window.gameInstance.tutorial && window.gameInstance.tutorial.isActive) {
        if (window.gameInstance.tutorial.currentStep === 0) {
          window.gameInstance.tutorial.showStep(1);
        }
      }
    } catch (e) {}
  }

  equipSpellFromInventory(slotIndex, spell) {
    this.inventoryManager.equipSpellFromInventory(slotIndex, spell);
    this.onSpellEquipped(this.state.equippedSpells, this.state.spellSlotFocus);
    this.renderSpellSlots();
    this.inventoryManager.renderCreatedSpells(document.getElementById('created-spells-list'));
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  unequipSpell(index) {
    this.state.removeFromEquipped(index);
    this.onSpellEquipped(this.state.equippedSpells, this.state.spellSlotFocus);
    this.renderSpellSlots();
    this.inventoryManager.renderCreatedSpells(document.getElementById('created-spells-list'));
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  allocateFocusToSlot(slotIndex) {
    if (!this.focusManager.allocateFocusToSlot(slotIndex)) return;
    this.onSpellEquipped(this.state.equippedSpells, this.state.spellSlotFocus);
    this.renderSpellSlots();
    try {
      if (window && window.gameInstance && window.gameInstance.hud) {
        window.gameInstance.hud.setFocus(this.state.focusBank);
      }
    } catch (e) {}
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  get selectedElements() { return this.state.selectedElements; }
  get equippedSpells() { return this.state.equippedSpells; }
  get spellSlotFocus() { return this.state.spellSlotFocus; }
  get spellInventory() { return this.state.spellInventory; }
  get essenceBank() { return this.state.essenceBank; }
  get focusBank() { return this.state.focusBank; }

  getEquippedSpells() {
    return this.state.getEquippedSpells();
  }

  refresh() {
    this.elementsLibrary.refresh(this.gameState.unlockedElementKeys);
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
    this.fusionBuilder.setSelectedElements(this.state.selectedElements);
    this.fusionController.updateFusionPreview();
    this.inventoryManager.renderCreatedSpells(document.getElementById('created-spells-list'));
  }

  // Add setters so external callers can restore state safely (used by GameApp when loading)
  set essenceBank(amount) {
    this.state.essenceBank = Number(amount) || 0;
    try { if (window && window.gameInstance && window.gameInstance.hud) window.gameInstance.hud.setEssence(this.state.essenceBank); } catch (e) {}
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
  }

  set focusBank(amount) {
    this.state.focusBank = Number(amount) || 0;
    try { if (window && window.gameInstance && window.gameInstance.hud) window.gameInstance.hud.setFocus(this.state.focusBank); } catch (e) {}
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
  }

  set spellInventory(arr) {
    this.state.spellInventory = Array.isArray(arr) ? [...arr] : [];
    this.inventoryManager.renderCreatedSpells(document.getElementById('created-spells-list'));
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
  }

  set equippedSpells(arr) {
    this.state.equippedSpells = Array.isArray(arr) ? [...arr] : [null, null, null, null];
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
  }

  set spellSlotFocus(arr) {
    this.state.spellSlotFocus = Array.isArray(arr) ? [...arr] : [1,0,0,0];
    // Recompute player equip in GameApp happens elsewhere; just update UI
    this.spellSlotsUI.update(this.state.equippedSpells, this.state.spellSlotFocus, this.state.focusBank, this.state.spellInventory);
  }
}