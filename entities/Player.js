export class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.equippedSpells = [null]; // Start with one spell slot
    this.maxSpellSlots = 5;
    this.timeSinceLastCast = 0;
  }
  
  equipSpell(spell, slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.equippedSpells.length) {
      this.equippedSpells[slotIndex] = spell;
    }
  }

  getEquippedSpells() {
    return this.equippedSpells.filter(spell => spell !== null);
  }
  
  update(dt, castInterval) {
    this.timeSinceLastCast += dt * 1000;
    
    if (this.getEquippedSpells().length > 0 && this.timeSinceLastCast >= castInterval) {
      this.timeSinceLastCast = 0;
      return true; // Ready to cast
    }
    return false;
  }
}

