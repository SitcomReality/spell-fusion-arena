export class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.equippedSpells = []; // Array of spells for each slot
    this.spellSlotFocus = []; // Focus resource for each slot (increases firing speed)
    this.timeSinceLastCast = [0, 0, 0, 0]; // Track cast timing per slot
    this.castIntervals = [Infinity, Infinity, Infinity, Infinity];
    this.maxSpellSlots = 4;
  }
  
  equipSpells(spells, focus) {
    this.equippedSpells = spells || [];
    this.spellSlotFocus = focus || new Array(this.maxSpellSlots).fill(0);
    this.timeSinceLastCast = new Array(this.maxSpellSlots).fill(0);
    this.calculateCastIntervals();
  }

  calculateCastIntervals() {
    for (let i = 0; i < this.maxSpellSlots; i++) {
      const focus = this.spellSlotFocus[i] || 0;
      if (focus < 1) {
        this.castIntervals[i] = Infinity;
      } else {
        // Base interval at 1 Focus is 2500ms. Speed increases from there.
        // Reduce how much each Focus decreases interval (slower ramp-up).
        // Using divisor 5 makes slot firing speed increase more gradually.
        // Reaches a faster rate much later than before.
        this.castIntervals[i] = 2500 / (1 + (focus - 1) / 5);
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