/* ...existing code... */
    for (let i = 0; i < 4; i++) {
...
    }
  }
}
/* ...existing code... */

/* ...existing code... */
    this.timeSinceLastCast = new Array(4).fill(0); // Track cast timing per slot
    this.castIntervals = new Array(4).fill(Infinity);
    this.maxSpellSlots = 4;
  }
/* ...existing code... */

/* ...existing code... */
    this.player = new Player(this.centerX, this.centerY, CONFIG.player.radius);
    // Initial setup for player spells and essence (4 slots)
    this.player.equipSpells([], [5, 0, 0, 0]);
/* ...existing code... */

/* ...existing code... */
    this.equippedSpells = [null, null, null, null];
    this.spellSlotEssence = [5, 0, 0, 0];
/* ...existing code... */

