export class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.equippedSpells = []; // Array of spells for each slot
    this.spellSlotEssence = []; // Mana Essence for each slot
    this.timeSinceLastCast = [0, 0, 0, 0]; // Track cast timing per slot
    this.castIntervals = [Infinity, Infinity, Infinity, Infinity];
    this.maxSpellSlots = 4;
  }
  
  equipSpells(spells, essence) {
    this.equippedSpells = spells || [];
    this.spellSlotEssence = essence || new Array(this.maxSpellSlots).fill(0);
    this.timeSinceLastCast = new Array(this.maxSpellSlots).fill(0);
    this.calculateCastIntervals();
  }

  calculateCastIntervals() {
    for (let i = 0; i < this.maxSpellSlots; i++) {
      const essence = this.spellSlotEssence[i] || 0;
      if (essence < 1) {
        this.castIntervals[i] = Infinity;
      } else {
        // Base interval at 1 ME is 2500ms. Speed increases from there.
        // Reaches ~500ms at 13 ME.
        this.castIntervals[i] = 2500 / (1 + (essence - 1) / 3);
      }
    }
  }
  
  update(dt) {
    const readySlots = [];
    
    for (let i = 0; i < this.equippedSpells.length; i++) {
      if (!this.equippedSpells[i]) continue;

      const castInterval = this.castIntervals[i];
      if (castInterval === Infinity) continue;
      
      this.timeSinceLastCast[i] += dt * 1000;
      
      if (this.timeSinceLastCast[i] >= castInterval) {
        readySlots.push(i);
        this.timeSinceLastCast[i] %= castInterval;
      }
    }
    
    return readySlots.length > 0 ? readySlots : null;
  }
}