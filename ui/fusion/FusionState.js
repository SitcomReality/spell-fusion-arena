export class FusionState {
  constructor() {
    this.selectedElements = [];
    this.currentSpell = null;
    this.equippedSpells = [null, null, null, null];
    this.spellSlotFocus = [1, 0, 0, 0];
    this.spellInventory = [];
    this.essenceBank = 1;
    this.focusBank = 0;
    this.maxFusionSlots = 4;
    this.unlockedFusionSlots = 4;
  }

  addEssence(amount) {
    this.essenceBank += amount;
  }

  deductEssence(amount) {
    if (this.essenceBank >= amount) {
      this.essenceBank -= amount;
      return true;
    }
    return false;
  }

  addFocus(amount) {
    this.focusBank += amount;
  }

  deductFocus(amount) {
    if (this.focusBank >= amount) {
      this.focusBank -= amount;
      return true;
    }
    return false;
  }

  setSelectedElements(elements) {
    this.selectedElements = [...elements];
  }

  getSelectedElements() {
    return [...this.selectedElements];
  }

  addToEquipped(slotIndex, spell) {
    if (slotIndex >= 0 && slotIndex < 4) {
      this.equippedSpells[slotIndex] = spell;
    }
  }

  removeFromEquipped(slotIndex) {
    if (slotIndex >= 0 && slotIndex < 4) {
      this.equippedSpells[slotIndex] = null;
    }
  }

  getEquippedSpells() {
    return this.equippedSpells.filter(s => s !== null);
  }

  getSpellSlotFocus(slotIndex) {
    return this.spellSlotFocus[slotIndex] || 0;
  }

  incrementSlotFocus(slotIndex) {
    if (slotIndex >= 0 && slotIndex < 4) {
      this.spellSlotFocus[slotIndex] = (this.spellSlotFocus[slotIndex] || 0) + 1;
    }
  }
}
```