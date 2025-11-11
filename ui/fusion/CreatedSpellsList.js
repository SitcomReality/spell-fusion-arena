export class CreatedSpellsList {
  constructor(onQuickEquip) {
    this.container = null;
    this.onQuickEquip = onQuickEquip;
  }

  mount(container) {
    this.container = container;
    this.render([], []);
  }

  render(spellInventory = [], equippedSpells = []) {
    if (!this.container) return;
    this.container.innerHTML = '';
    if (!spellInventory || spellInventory.length === 0) {
      this.container.innerHTML = `<div class=\"properties-empty\">No created spells yet</div>`;
      return;
    }

    const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';

    spellInventory.forEach((spell, idx) => {
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

      const isEquipped = equippedSpells.some(s => s === spell);
      const deleteBtn = item.querySelector('.created-spell-delete');
      if (!tutorialCompleted || isEquipped) {
        if (deleteBtn) deleteBtn.remove();
      } else {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const realIdx = this._findIndex(spellInventory, spell);
          if (realIdx >= 0) {
            spellInventory.splice(realIdx, 1);
          }
          this.render(spellInventory, equippedSpells);
          try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
        });
      }

      item.addEventListener('click', (ev) => {
        if (ev.target.closest('.created-spell-delete')) return;
        if (this.onQuickEquip) this.onQuickEquip(spell);
      });

      this.container.appendChild(item);
    });
  }

  _findIndex(arr, item) {
    return arr.indexOf(item);
  }
}