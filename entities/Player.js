export class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.equippedSpells = []; // Array of spells for each slot
    this.timeSinceLastCast = [0, 0, 0, 0, 0]; // Track cast timing per slot
    this.maxSpellSlots = 5;
  }
  
  equipSpells(spells) {
    this.equippedSpells = spells || [];
    this.timeSinceLastCast = new Array(this.equippedSpells.length).fill(0);
  }
  
  update(dt, castInterval) {
    const readySlots = [];
    
    for (let i = 0; i < this.equippedSpells.length; i++) {
      this.timeSinceLastCast[i] += dt * 1000;
      
      if (this.timeSinceLastCast[i] >= castInterval) {
        readySlots.push(i);
        this.timeSinceLastCast[i] = 0;
      }
    }
    
    return readySlots.length > 0 ? readySlots : null;
  }
}

