import { getUnlockedElements } from '../spells/Element.js';
import { SpellFusion } from '../spells/SpellFusion.js';

export class FusionUI {
  constructor(onSpellEquipped) {
    this.container = document.getElementById('fusion-ui');
    this.onSpellEquipped = onSpellEquipped;
    this.selectedElements = [];
    this.currentSpell = null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="fusion-panel">
        <h2>Spell Fusion</h2>
        <div class="element-grid" id="element-grid"></div>
        <div class="fusion-result" id="fusion-result">
          <p>Select 2 elements to fuse</p>
        </div>
        <button id="equip-btn" disabled>Equip Spell</button>
      </div>
    `;

    this.renderElements();
    this.attachListeners();
  }

  renderElements() {
    const grid = document.getElementById('element-grid');
    grid.innerHTML = '';

    const unlockedElements = getUnlockedElements();
    
    for (const [key, element] of Object.entries(unlockedElements)) {
      const btn = document.createElement('button');
      btn.className = 'element-btn';
      btn.dataset.element = key;
      btn.textContent = element.name;
      btn.style.background = `rgb(${element.color.r}, ${element.color.g}, ${element.color.b})`;
      btn.style.color = this.getContrastColor(element.color);
      grid.appendChild(btn);
    }
  }

  getContrastColor(rgb) {
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 155 ? '#000' : '#fff';
  }

  attachListeners() {
    const grid = document.getElementById('element-grid');
    grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('element-btn')) {
        this.selectElement(e.target.dataset.element);
      }
    });

    document.getElementById('equip-btn').addEventListener('click', () => {
      if (this.currentSpell) {
        this.onSpellEquipped(this.currentSpell);
      }
    });
  }

  selectElement(elementKey) {
    const unlockedElements = getUnlockedElements();
    const element = unlockedElements[elementKey];

    if (this.selectedElements.length < 2) {
      this.selectedElements.push(element);
      
      // Visual feedback
      const buttons = document.querySelectorAll(`[data-element="${elementKey}"]`);
      buttons.forEach(btn => btn.style.border = '3px solid #fff');
    }

    if (this.selectedElements.length === 2) {
      this.fuseElements();
    }
  }

  fuseElements() {
    this.currentSpell = SpellFusion.fuse(this.selectedElements[0], this.selectedElements[1]);

    const result = document.getElementById('fusion-result');
    const color = this.currentSpell.color;
    result.innerHTML = `
      <h3>${this.currentSpell.name}</h3>
      <div class="spell-preview" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
      <p>Type: ${this.currentSpell.traits.projectileType}</p>
      <p>Damage: ${Math.round(this.currentSpell.traits.damage)}</p>
      <p>Speed: ${Math.round(this.currentSpell.traits.speed)}</p>
    `;

    document.getElementById('equip-btn').disabled = false;
    this.selectedElements = [];
    
    // Reset button borders
    document.querySelectorAll('.element-btn').forEach(btn => {
      btn.style.border = '2px solid #333';
    });
  }

  refresh() {
    this.render();
  }
}