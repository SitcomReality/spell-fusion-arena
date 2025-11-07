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
    // stable phase offsets per slot to avoid synchronized firing
    this.slotPhaseOffsets = new Array(this.maxSpellSlots).fill(0);
  }
  
  equipSpells(spells, focus) {
    this.equippedSpells = spells || [];
    this.spellSlotFocus = focus || new Array(this.maxSpellSlots).fill(0);
    this.timeSinceLastCast = new Array(this.maxSpellSlots).fill(0);
    // Recompute intervals and also set initial phase offsets so slots are staggered
    this.calculateCastIntervals();
    this.applyInitialPhaseOffsets();
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

    // After recalculating intervals, recompute stable phase offsets so slots stay staggered.
    this.computeSlotPhaseOffsets();
  }
  
  // Compute phase offsets in milliseconds for each slot to stagger their starting times.
  // Uses slot index to produce deterministic, evenly-distributed phases across occupied slots.
  computeSlotPhaseOffsets() {
    // Determine active slots (those with finite intervals)
    const activeIndexes = [];
    for (let i = 0; i < this.maxSpellSlots; i++) {
      if (this.castIntervals[i] !== Infinity) activeIndexes.push(i);
    }
    const activeCount = activeIndexes.length || 1;

    // Evenly distribute phase across an interval fraction to avoid exact collisions.
    // We'll set each slot's phase to (indexInActive / activeCount) * interval * 0.5
    // Multiplying by 0.5 keeps phases within first half of interval to avoid too long initial delays.
    for (let i = 0; i < this.maxSpellSlots; i++) {
      if (this.castIntervals[i] === Infinity) {
        this.slotPhaseOffsets[i] = 0;
        continue;
      }
      const idx = activeIndexes.indexOf(i);
      const interval = this.castIntervals[i];
      // If intervals differ across slots, we still want deterministic spread: use this slot's interval
      const phase = (idx / activeCount) * interval * 0.5; // milliseconds
      this.slotPhaseOffsets[i] = phase;
    }
  }

  // Apply initial phase offsets into the timeSinceLastCast so that slots won't all fire at t=0.
  applyInitialPhaseOffsets() {
    for (let i = 0; i < this.maxSpellSlots; i++) {
      const interval = this.castIntervals[i];
      if (interval === Infinity) {
        this.timeSinceLastCast[i] = 0;
      } else {
        // timeSinceLastCast counts up to interval in milliseconds; set it to the phase so that
        // the first fire happens after (interval - phase) ms, effectively staggering starts.
        this.timeSinceLastCast[i] = this.slotPhaseOffsets[i];
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