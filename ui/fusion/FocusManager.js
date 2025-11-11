export class FocusManager {
  constructor(state) {
    this.state = state;
  }

  allocateFocusToSlot(slotIndex) {
    if (!this.state.deductFocus(1)) {
      return false;
    }
    this.state.incrementSlotFocus(slotIndex);
    return true;
  }

  getFocusBank() {
    return this.state.focusBank;
  }

  getSlotFocus(slotIndex) {
    return this.state.getSpellSlotFocus(slotIndex);
  }

  addFocusToBank(amount) {
    this.state.addFocus(amount);
  }
}

