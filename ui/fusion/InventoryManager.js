export class InventoryManager {
  constructor(state) {
    this.state = state;
  }

  renderCreatedSpells(container) {
    if (!container) return;
    container.innerHTML = '';

    if (!this.state.spellInventory || this.state.spellInventory.length === 0) {
      container.innerHTML = `<div class=\"properties-empty\">No created spells yet</div>`;
      return;
    }

    this.state.spellInventory.forEach((spell, idx) => {
      const item = document.createElement('div');
      item.className = 'created-spell-item';
      item.dataset.index = idx;

      const color = spell.color || { r: 120, g: 120, b: 120 };
      const dmg = Math.round((spell.properties?.damage || 0));
      const spd = Math.round((spell.properties?.speed || 0));

      item.innerHTML = `
        <span class=\"created-spell-color\" aria-hidden=\"true\" style=\"background: rgb(${color.r}, ${color.g}, ${color.b})\"></span>
        <span class=\"created-spell-label\">${spell.name} <span class=\"created-spell-meta\">— D:${dmg} S:${spd}</span></span>
        <button class=\"created-spell-delete\" title=\"Delete spell\" aria-label=\"Delete spell\">✕</button>
      `;

      const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
      const isEquipped = this.state.equippedSpells.some(s => s === spell);
      const deleteBtn = item.querySelector('.created-spell-delete');

      if (!tutorialCompleted || isEquipped) {
        if (deleteBtn) deleteBtn.remove();
      } else {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const stillEquipped = this.state.equippedSpells.some(s => s === spell);
          if (!stillEquipped) {
            const realIdx = this.state.spellInventory.indexOf(spell);
            if (realIdx >= 0) {
              this.state.spellInventory.splice(realIdx, 1);
            }
            this.renderCreatedSpells(container);
            try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
          }
        });
      }

      item.addEventListener('click', (ev) => {
        if (ev.target.closest('.created-spell-delete')) return;
        const event = new CustomEvent('fusionui:equip-from-created', { detail: { spell, index: idx } });
        window.dispatchEvent(event);
      });

      container.appendChild(item);
    });
  }

  addSpellToInventory(spell) {
    this.state.spellInventory.push(spell);
  }

  equipSpellFromInventory(slotIndex, spell) {
    for (let i = 0; i < this.state.equippedSpells.length; i++) {
      if (i !== slotIndex && this.state.equippedSpells[i] === spell) {
        this.state.equippedSpells[i] = null;
      }
    }
    this.state.equippedSpells[slotIndex] = spell;
  }

  getInventory() {
    return [...this.state.spellInventory];
  }
}