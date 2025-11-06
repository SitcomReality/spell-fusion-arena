import { ElementsLibrary } from './elements/ElementsLibrary.js';
import { ElementDetailsPanel } from './elements/ElementDetailsPanel.js';
import { FusionBuilder } from './FusionBuilder.js';
import { FusionPreview } from './FusionPreview.js';
import { SpellSlotsUI } from './SpellSlotsUI.js';
import { SpellFusion } from '../spells/SpellFusion.js';

export class FusionUI {
  constructor(onSpellEquipped) {
    this.container = document.getElementById('fusion-ui');
    this.equippedContainer = document.getElementById('equipped-spells');
    this.onSpellEquipped = onSpellEquipped;

    this.selectedElements = [];
    this.currentSpell = null;
    this.equippedSpells = [null, null, null, null, null];
    this.spellSlotEssence = [5, 0, 0, 0, 0];
    this.essenceBank = 0;
    this.maxFusionSlots = 2;

    // Create subcomponents
    this.elementsLibrary = new ElementsLibrary((key, element, cardEl) => {
      this.onElementClicked(key, element, cardEl);
    });

    this.detailsPanel = new ElementDetailsPanel();

    this.fusionBuilder = new FusionBuilder({
      maxFusionSlots: this.maxFusionSlots,
      onClear: () => this.clearFusion(),
      onCreate: () => this.createSpellFromSelection()
    });

    this.fusionPreview = new FusionPreview();

    this.spellSlotsUI = new SpellSlotsUI(this.equippedContainer, {
      getEquippedSpells: () => this.equippedSpells,
      getSpellSlotEssence: () => this.spellSlotEssence,
      getEssenceBank: () => this.essenceBank,
      onUnequip: (i) => this.unequipSpell(i),
      onAllocateEssence: (i) => this.allocateEssenceToSlot(i)
    });

    this.render();
  }

  addEssenceToBank(amount) {
    this.essenceBank += amount;
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotEssence, this.essenceBank);
  }

  render() {
    this.container.innerHTML = `
      <div class="fusion-container">
        <div class="fusion-section">
          <h2>Elements</h2>
          <div class="elements-library" id="elements-library"></div>
          <div class="element-details-panel" id="element-details-panel"></div>
        </div>
        
        <div class="fusion-section">
          <h2>Create Spell</h2>
          <div class="fusion-builder" id="fusion-builder"></div>
          <div class="fusion-preview" id="fusion-preview"></div>
        </div>
      </div>
    `;

    // mount subcomponents into DOM
    this.elementsLibrary.mount(document.getElementById('elements-library'));
    this.detailsPanel.mount(document.getElementById('element-details-panel'));
    this.fusionBuilder.mount(document.getElementById('fusion-builder'), {
      onSlotRemove: (idx) => this.removeElement(idx),
      onSlotAddPlaceholderClick: () => {} // handled by element clicks
    });
    this.fusionPreview.mount(document.getElementById('fusion-preview'));
    this.spellSlotsUI.mount();

    // initial updates
    this.elementsLibrary.refresh();
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotEssence, this.essenceBank);

    // wire builder's request to place element into fusion slots
    this.fusionBuilder.onRequestPlaceElement = (element) => {
      this.addElementToFusion(element);
    };
  }

  renderSpellSlots() {
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotEssence, this.essenceBank);
  }

  renderEssenceBankHeader() {
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotEssence, this.essenceBank);
  }

  onElementClicked(key, element, cardEl) {
    // highlight & show details with add button
    this.elementsLibrary.markSelectedCard(cardEl);
    this.detailsPanel.show(element, () => this.addElementToFusion(element));
  }

  addElementToFusion(element) {
    if (this.selectedElements.length >= this.maxFusionSlots) return;
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
    if (forceEmpty || this.selectedElements.length < this.maxFusionSlots) {
      this.fusionPreview.showMessage(`Select ${this.maxFusionSlots - this.selectedElements.length} more element(s)`);
      return;
    }

    this.currentSpell = SpellFusion.fuse(...this.selectedElements);
    this.fusionPreview.showSpell(this.currentSpell, () => this.equipSpell(this.currentSpell));
  }

  createSpellFromSelection() {
    if (!this.currentSpell) return;
    this.equipSpell(this.currentSpell);
    this.selectedElements = [];
    this.currentSpell = null;
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview(true);
    this.renderSpellSlots();
  }

  equipSpell(spell) {
    const emptyIndex = this.equippedSpells.findIndex(s => s === null);
    if (emptyIndex !== -1) {
      this.equippedSpells[emptyIndex] = spell;
      // notify GameState via callback, passing full arrays
      this.onSpellEquipped(this.equippedSpells, this.spellSlotEssence);
      this.renderSpellSlots();
    }
  }

  unequipSpell(index) {
    this.equippedSpells[index] = null;
    this.spellSlotEssence[index] = Math.floor(this.spellSlotEssence[index] * 0.75);
    this.onSpellEquipped(this.equippedSpells, this.spellSlotEssence);
    this.renderSpellSlots();
  }

  allocateEssenceToSlot(slotIndex) {
    if (this.essenceBank <= 0) return;
    this.spellSlotEssence[slotIndex] = (this.spellSlotEssence[slotIndex] || 0) + 1;
    this.essenceBank -= 1;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotEssence);
    this.renderSpellSlots();
  }

  getEquippedSpells() {
    return this.equippedSpells.filter(s => s !== null);
  }

  refresh() {
    this.elementsLibrary.refresh();
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotEssence, this.essenceBank);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();
  }
}