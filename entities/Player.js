export class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.equippedSpell = null;
    this.timeSinceLastCast = 0;
  }
  
  equipSpell(spell) {
    this.equippedSpell = spell;
  }
  
  update(dt, castInterval) {
    this.timeSinceLastCast += dt * 1000;
    
    if (this.equippedSpell && this.timeSinceLastCast >= castInterval) {
      this.timeSinceLastCast = 0;
      return true; // Ready to cast
    }
    return false;
  }
}

