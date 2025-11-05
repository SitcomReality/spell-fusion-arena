import { getUnlockedElements } from '../spells/Element.js';
import { SpellFusion } from '../spells/SpellFusion.js';

export class FusionUI {
  constructor(onSpellEquipped) {
    this.container = document.getElementById('fusion-ui');
    this.onSpellEquipped = onSpellEquipped;
    this.selectedElements = [];
    this.currentSpell = null;
    this.equippedSpells = [null, null, null, null, null]; // 5 slots
    this.maxFusionSlots = 2; // Will be upgradeable later

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="fusion-container">
        <div class="fusion-section">
          <h2>Elements</h2>
          <div class="elements-library" id="elements-library"></div>
        </div>
        
        <div class="fusion-section">
          <h2>Create Spell</h2>
          <div class="fusion-builder">
            <div class="fusion-slots" id="fusion-slots"></div>
            <div class="fusion-controls">
              <button id="clear-fusion-btn">Clear</button>
              <button id="create-spell-btn" disabled>Create Spell</button>
            </div>
          </div>
          <div class="fusion-preview" id="fusion-preview">
            <p>Select ${this.maxFusionSlots} elements to create a spell</p>
          </div>
        </div>

        <div class="fusion-section">
          <h2>Equipped Spells (${this.equippedSpells.filter(s => s).length}/5)</h2>
          <div class="spell-slots" id="spell-slots"></div>
        </div>
      </div>
    `;

    this.renderElementsLibrary();
    this.renderFusionSlots();
    this.renderSpellSlots();
    this.attachListeners();
  }

  renderElementsLibrary() {
    const library = document.getElementById('elements-library');
    library.innerHTML = '';

    const unlockedElements = getUnlockedElements();
    
    for (const [key, element] of Object.entries(unlockedElements)) {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.dataset.element = key;
      card.innerHTML = `
        <div class="element-card-color" style="background: rgb(${element.color.r}, ${element.color.g}, ${element.color.b})"></div>
        <div class="element-card-content">
          <h4>${element.name}</h4>
          <p class="element-desc">${element.description}</p>
          <div class="element-stats">
            <span>DMG: ${element.traits.damage}</span>
            <span>SPD: ${Math.round(element.traits.speed)}</span>
          </div>
          <div class="element-type">${element.traits.projectileType}</div>
        </div>
      `;
      
      card.addEventListener('click', () => this.selectElement(key, element));
      library.appendChild(card);
    }
  }

  renderFusionSlots() {
    const slotsContainer = document.getElementById('fusion-slots');
    slotsContainer.innerHTML = '';

    for (let i = 0; i < this.maxFusionSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'fusion-slot';
      slot.dataset.slot = i;

      if (this.selectedElements[i]) {
        const elem = this.selectedElements[i];
        slot.innerHTML = `
          <div class="fusion-slot-content" style="background: rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})">
            <span>${elem.name}</span>
            <button class="fusion-slot-remove">×</button>
          </div>
        `;
        
        slot.querySelector('.fusion-slot-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeElement(i);
        });
      } else {
        slot.innerHTML = '<span class="fusion-slot-placeholder">+</span>';
      }

      slotsContainer.appendChild(slot);
    }
  }

  renderSpellSlots() {
    const slotsContainer = document.getElementById('spell-slots');
    slotsContainer.innerHTML = '';

    for (let i = 0; i < 5; i++) {
      const slot = document.createElement('div');
      slot.className = 'spell-slot';
      slot.dataset.slot = i;

      if (this.equippedSpells[i]) {
        const spell = this.equippedSpells[i];
        const color = spell.color;
        slot.innerHTML = `
          <div class="spell-slot-content" style="background: rgb(${color.r}, ${color.g}, ${color.b})">
            <span class="spell-slot-name">${spell.name}</span>
            <span class="spell-slot-number">${i + 1}</span>
            <button class="spell-slot-unequip">−</button>
          </div>
        `;
        
        slot.querySelector('.spell-slot-unequip').addEventListener('click', (e) => {
          e.stopPropagation();
          this.unequipSpell(i);
        });
      } else {
        slot.innerHTML = `<span class="spell-slot-placeholder">Empty</span>`;
      }

      slotsContainer.appendChild(slot);
    }
  }

  selectElement(elementKey, element) {
    if (this.selectedElements.length < this.maxFusionSlots) {
      this.selectedElements.push(element);
      this.renderFusionSlots();
      this.updateFusionPreview();
    }
  }

  removeElement(index) {
    this.selectedElements.splice(index, 1);
    this.renderFusionSlots();
    this.updateFusionPreview();
  }

  updateFusionPreview() {
    const preview = document.getElementById('fusion-preview');
    const createBtn = document.getElementById('create-spell-btn');

    if (this.selectedElements.length < this.maxFusionSlots) {
      preview.innerHTML = `<p>Select ${this.maxFusionSlots - this.selectedElements.length} more element(s)</p>`;
      createBtn.disabled = true;
      return;
    }

    // Create spell preview
    this.currentSpell = SpellFusion.fuse(...this.selectedElements);
    const color = this.currentSpell.color;

    preview.innerHTML = `
      <div class="spell-result">
        <div class="spell-result-color" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
        <div class="spell-result-info">
          <h3>${this.currentSpell.name}</h3>
          <div class="spell-result-stats">
            <div class="stat">
              <span class="stat-label">Damage</span>
              <span class="stat-value">${Math.round(this.currentSpell.traits.damage)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Speed</span>
              <span class="stat-value">${Math.round(this.currentSpell.traits.speed)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Type</span>
              <span class="stat-value">${this.currentSpell.traits.projectileType}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    createBtn.disabled = false;
  }

  attachListeners() {
    document.getElementById('clear-fusion-btn').addEventListener('click', () => {
      this.selectedElements = [];
      this.currentSpell = null;
      this.render();
    });

    document.getElementById('create-spell-btn').addEventListener('click', () => {
      if (this.currentSpell) {
        this.equipSpell(this.currentSpell);
        this.selectedElements = [];
        this.currentSpell = null;
        this.render();
      }
    });
  }

  equipSpell(spell) {
    // Find first empty slot
    const emptyIndex = this.equippedSpells.findIndex(s => s === null);
    
    if (emptyIndex !== -1) {
      this.equippedSpells[emptyIndex] = spell;
      this.onSpellEquipped(this.equippedSpells.filter(s => s !== null));
      this.renderSpellSlots();
    }
  }

  unequipSpell(index) {
    this.equippedSpells[index] = null;
    this.onSpellEquipped(this.equippedSpells.filter(s => s !== null));
    this.renderSpellSlots();
  }

  getEquippedSpells() {
    return this.equippedSpells.filter(s => s !== null);
  }

  refresh() {
    this.render();
  }
}