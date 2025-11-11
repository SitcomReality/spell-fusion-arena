// NEW FILE
import { ElementsLibrary } from '../elements/ElementsLibrary.js';
import { ElementDetailsPanel } from '../elements/ElementDetailsPanel.js';
import { FusionBuilder } from '../FusionBuilder.js';
import { FusionPreview } from '../FusionPreview.js';
import { SpellSlotsUI } from '../SpellSlotsUI.js';
import { SpellFusion } from '../../spells/SpellFusion.js';
import { getSpellCost } from '../../spells/Element.js';

export class FusionController {
  constructor(onSpellEquipped, gameState) {
    this.onSpellEquipped = onSpellEquipped;
    this.gameState = gameState;

    this.selectedElements = [];
    this.currentSpell = null;
    this.equippedSpells = [null, null, null, null];
    this.spellSlotFocus = [1, 0, 0, 0];
    this.spellInventory = [];
    this.essenceBank = 1;
    this.focusBank = 0;

    this.elementsLibrary = new ElementsLibrary((k, e, card) => this.onElementClicked(k, e, card));
    this.detailsPanel = new ElementDetailsPanel();
    this.fusionBuilder = new FusionBuilder({
      totalSlots: 4,
      unlockedSlots: 4,
      onSlotRemove: (idx) => this.removeElement(idx),
      onUnlockSlot: () => {}
    });
    this.fusionPreview = new FusionPreview();
    this.spellSlotsUI = new SpellSlotsUI(document.getElementById('equipped-spells'), {
      getEquippedSpells: () => this.equippedSpells,
      getSpellSlotFocus: () => this.spellSlotFocus,
      getEssenceBank: () => this.essenceBank,
      getSpellInventory: () => this.spellInventory,
      onUnequip: (i) => this.unequipSpell(i),
      onAllocateFocus: (i) => this.allocateFocusToSlot(i),
      onEquipFromInventory: (slotIndex, spell) => this.equipSpellFromInventory(slotIndex, spell)
    });
  }

  mount(els) {
    if (els.elementsLibraryEl) this.elementsLibrary.mount(els.elementsLibraryEl);
    if (els.elementDetailsEl) this.detailsPanel.mount(els.elementDetailsEl);
    if (els.fusionBuilderEl) {
      this.fusionBuilder = new FusionBuilder({
        totalSlots: 4,
        unlockedSlots: 4,
        onSlotRemove: (idx) => this.removeElement(idx),
        onUnlockSlot: () => {},
        getEssence: () => this.essenceBank
      });
      this.fusionBuilder.mount(els.fusionBuilderEl);
    }
    if (els.fusionPanelEl) this.fusionPreview.mount(els.fusionPanelEl);
    this.spellSlotsUI.mount();
    // wire preview clear
    this.fusionPreview.setOnClear(() => this.clearFusion());
  }

  getPublicState() {
    return {
      equippedSpells: this.equippedSpells,
      spellSlotFocus: this.spellSlotFocus,
      focusBank: this.focusBank,
      spellInventory: this.spellInventory
    }
  }

  refresh() {
    this.elementsLibrary.refresh(this.gameState.unlockedElementKeys);
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();
  }

  onElementClicked(key, element, cardEl) {
    this.elementsLibrary.markSelectedCard(cardEl);
    this.detailsPanel.show(element, () => this.addElementToFusion(element));
    try {
      if (window && window.gameInstance && window.gameInstance.tutorial && window.gameInstance.tutorial.isActive) {
        if (window.gameInstance.tutorial.currentStep === 0) {
          window.gameInstance.tutorial.showStep(1);
        }
      }
    } catch (e) {}
  }

  addElementToFusion(element) {
    if (this.selectedElements.length >= 4) return;
    this.selectedElements.push(element);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();
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
    const isInTutorialStep7 = document.documentElement.classList.contains('tutorial-lock-to-fusion-full');
    const isExactlyTwoElements = this.selectedElements.length === 2;
    const canCreate = isInTutorialStep7 ? isExactlyTwoElements : true;
    const affordable = (this.essenceBank >= cost) && canCreate;

    this.fusionPreview.showSpell(this.currentSpell, () => this.addSpellToInventory(this.currentSpell), cost, affordable);

    if (isInTutorialStep7) {
      const createBtn = document.querySelector('.fusion-preview-create');
      if (createBtn) createBtn.classList.toggle('enabled-for-two-elements', isExactlyTwoElements);
    }
  }

  addSpellToInventory(spell) {
    const cost = getSpellCost(this.selectedElements.length);
    if (this.essenceBank < cost) {
      alert(`Need ${cost} Mana Essence to create this spell (have ${this.essenceBank})`);
      return;
    }

    this.essenceBank -= cost;
    this.spellInventory.push(spell);
    this.clearFusion();
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    this.updateCreatedSpellsList();
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  equipSpellFromInventory(slotIndex, spell) {
    for (let i = 0; i < this.equippedSpells.length; i++) {
      if (i !== slotIndex && this.equippedSpells[i] === spell) this.equippedSpells[i] = null;
    }
    this.equippedSpells[slotIndex] = spell;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  unequipSpell(index) {
    this.equippedSpells[index] = null;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  allocateFocusToSlot(slotIndex) {
    if (this.focusBank <= 0) return;
    this.spellSlotFocus[slotIndex] = (this.spellSlotFocus[slotIndex] || 0) + 1;
    this.focusBank -= 1;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank, this.spellInventory);
    try { if (window && window.gameInstance && window.gameInstance.hud) window.gameInstance.hud.setFocus(this.focusBank); } catch (e) {}
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
  }

  handleQuickEquip(spell) {
    // If any empty slot exists, equip there, else do nothing (UI handles selection)
    const emptyIndex = this.equippedSpells.findIndex(s => !s);
    if (emptyIndex >= 0) this.equipSpellFromInventory(emptyIndex, spell);
  }

  updateCreatedSpellsList() {
    try {
      if (window && window.gameInstance && window.gameInstance.fusionUI) {
        window.gameInstance.fusionUI.renderCreatedSpells();
      }
    } catch (e) {}
  }
}