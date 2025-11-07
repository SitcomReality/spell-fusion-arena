import { ElementsLibrary } from './elements/ElementsLibrary.js';
import { ElementDetailsPanel } from './elements/ElementDetailsPanel.js';
import { FusionBuilder } from './FusionBuilder.js';
import { FusionPreview } from './FusionPreview.js';
import { SpellSlotsUI } from './SpellSlotsUI.js';
import { SpellFusion } from '../spells/SpellFusion.js';
import { getSpellCost } from '../spells/Element.js';

export class FusionUI {
  constructor(onSpellEquipped) {
    this.container = document.getElementById('fusion-ui');
    this.equippedContainer = document.getElementById('equipped-spells');
    this.onSpellEquipped = onSpellEquipped;

    this.selectedElements = [];
    this.currentSpell = null;
    this.equippedSpells = [null, null, null, null];
    this.spellSlotFocus = [1, 0, 0, 0]; // Focus starts at 1 for slot 1, 0 for others
    this.essenceBank = 0; // Mana Essence for spell equipping
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
      onUnlockSlot: (slotIndex) => this.unlockFusionSlot(slotIndex)
    });

    this.fusionPreview = new FusionPreview();

    this.spellSlotsUI = new SpellSlotsUI(this.equippedContainer, {
      getEquippedSpells: () => this.equippedSpells,
      getSpellSlotFocus: () => this.spellSlotFocus,
      getEssenceBank: () => this.essenceBank,
      onUnequip: (i) => this.unequipSpell(i),
      onAllocateFocus: (i) => this.allocateFocusToSlot(i)
    });

    this.render();
  }

  addEssenceToBank(amount) {
    this.essenceBank += amount;
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank);
  }

  addFocusToBank(amount) {
    this.focusBank += amount;
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank);
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
          <h2>Create Spell</h2>
          <div class="fusion-layout-wrapper">
            <div class="fusion-builder" id="fusion-builder"></div>
            <div id="fusion-panel"></div>
          </div>
        </div>
      </div>
    `;

    // mount subcomponents into DOM
    this.elementsLibrary.mount(document.getElementById('elements-library'));
    this.detailsPanel.mount(document.getElementById('element-details-panel'));
    this.fusionBuilder.mount(document.getElementById('fusion-builder'));
    this.fusionPreview.mount(document.getElementById('fusion-panel'));
    this.spellSlotsUI.mount();

    // initial updates
    this.elementsLibrary.refresh();
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank);

    // Set up preview clear callback
    this.fusionPreview.setOnClear(() => this.clearFusion());
  }

  renderSpellSlots() {
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank);
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
        if (this.selectedElements.length === this.maxFusionSlots) {
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
    this.fusionPreview.showSpell(this.currentSpell, () => this.equipSpell(this.currentSpell));
  }

  equipSpell(spell) {
    const elementCount = this.selectedElements.length;
    const cost = getSpellCost(elementCount);

    // Check if player has enough essence
    if (this.essenceBank < cost) {
      alert(`Need ${cost} Mana Essence to equip this spell (have ${this.essenceBank})`);
      return;
    }

    const emptyIndex = this.equippedSpells.findIndex(s => s === null);
    if (emptyIndex !== -1) {
      this.equippedSpells[emptyIndex] = spell;
      this.essenceBank -= cost;
      
      // notify GameState via callback, passing full arrays
      this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
      this.renderSpellSlots();
    }
  }

  unequipSpell(index) {
    this.equippedSpells[index] = null;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.renderSpellSlots();
  }

  allocateFocusToSlot(slotIndex) {
    if (this.focusBank <= 0) return;
    this.spellSlotFocus[slotIndex] = (this.spellSlotFocus[slotIndex] || 0) + 1;
    this.focusBank -= 1;
    this.onSpellEquipped(this.equippedSpells, this.spellSlotFocus);
    this.renderSpellSlots();
  }

  getEquippedSpells() {
    return this.equippedSpells.filter(s => s !== null);
  }

  refresh() {
    this.elementsLibrary.refresh();
    this.spellSlotsUI.update(this.equippedSpells, this.spellSlotFocus, this.focusBank);
    this.fusionBuilder.setSelectedElements(this.selectedElements);
    this.updateFusionPreview();
  }
}