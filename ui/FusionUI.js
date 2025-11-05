import { getUnlockedElements, EMPTY_ELEMENT } from '../spells/Element.js';
import { SpellFusion } from '../spells/SpellFusion.js';

export class FusionUI {
  constructor(onSpellEquipped) {
    this.container = document.getElementById('fusion-ui');
    this.onSpellEquipped = onSpellEquipped;
    
    // Player spell data
    this.spellSlots = [[]]; // Array of arrays of element keys. Starts with 1 spell slot.
    this.maxSpellSlots = 5;
    this.maxElementsPerSpell = 5;

    // UI state
    this.activeSpellSlot = 0;
    
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="fusion-panel">
        <h2>Spell Slots</h2>
        <div class="spell-slots-container" id="spell-slots-container"></div>
        
        <div id="fusion-chamber" class="fusion-chamber">
            <h2>Fusion Chamber (Spell ${this.activeSpellSlot + 1})</h2>
            <div class="fusion-element-slots" id="fusion-element-slots"></div>
            <div class="fusion-result" id="fusion-result"><p>Add elements to fuse</p></div>
            <button id="craft-spell-btn">Craft & Equip Spell</button>
        </div>

        <h2>Available Elements</h2>
        <div class="element-grid" id="element-grid"></div>
      </div>
    `;

    this.renderSpellSlots();
    this.renderFusionChamber();
    this.renderElements();
    this.attachListeners();
  }

  renderSpellSlots() {
    const container = document.getElementById('spell-slots-container');
    container.innerHTML = '';
    for (let i = 0; i < this.maxSpellSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'spell-slot';
        slot.dataset.slotIndex = i;

        if (i < this.spellSlots.length) {
            // Active slot
            slot.classList.add('unlocked');
            if (i === this.activeSpellSlot) {
                slot.classList.add('active');
            }
            const spellElements = this.spellSlots[i];
            const spell = SpellFusion.fuse(spellElements.map(key => getUnlockedElements()[key]));
            if (spell) {
                slot.style.background = `rgb(${spell.color.r}, ${spell.color.g}, ${spell.color.b})`;
                slot.textContent = spell.name.substring(0, 3);
            } else {
                slot.textContent = 'Empty';
            }
        } else {
            // Locked slot
            slot.classList.add('locked');
            slot.textContent = '🔒';
        }
        container.appendChild(slot);
    }
  }

  renderFusionChamber() {
    const elementSlotsContainer = document.getElementById('fusion-element-slots');
    elementSlotsContainer.innerHTML = '';
    const currentElements = this.spellSlots[this.activeSpellSlot] || [];

    for (let i = 0; i < this.maxElementsPerSpell; i++) {
        const slot = document.createElement('div');
        slot.className = 'fusion-element-slot';
        slot.dataset.elementSlotIndex = i;

        if (i < 2) { // To be replaced with unlockable logic
            slot.classList.add('unlocked');
            if (currentElements[i]) {
                const element = getUnlockedElements()[currentElements[i]];
                slot.textContent = element.name;
                slot.style.background = `rgb(${element.color.r}, ${element.color.g}, ${element.color.b})`;
                slot.style.color = this.getContrastColor(element.color);
            } else {
                slot.textContent = 'Empty';
            }
        } else {
            slot.classList.add('locked');
            slot.textContent = '🔒';
        }
        elementSlotsContainer.appendChild(slot);
    }
    this.updateFusionResult();
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
      btn.draggable = true;
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
    // Spell Slot Selection
    document.getElementById('spell-slots-container').addEventListener('click', e => {
        if (e.target.classList.contains('spell-slot') && e.target.classList.contains('unlocked')) {
            this.activeSpellSlot = parseInt(e.target.dataset.slotIndex, 10);
            this.render();
        }
    });

    // Element Drag and Drop
    const elementBtns = document.querySelectorAll('.element-btn');
    elementBtns.forEach(btn => {
      btn.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.dataset.element);
      });
    });

    const fusionSlots = document.querySelectorAll('.fusion-element-slot.unlocked');
    fusionSlots.forEach(slot => {
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', e => {
            e.preventDefault();
            const elementKey = e.dataTransfer.getData('text/plain');
            const slotIndex = parseInt(e.target.dataset.elementSlotIndex, 10);
            this.addElementToFusion(elementKey, slotIndex);
        });
        slot.addEventListener('click', e => {
            const slotIndex = parseInt(e.target.dataset.elementSlotIndex, 10);
            this.removeElementFromFusion(slotIndex);
        })
    });

    // Craft Button
    document.getElementById('craft-spell-btn').addEventListener('click', () => {
        this.craftAndEquipSpell();
    });
  }

  addElementToFusion(elementKey, slotIndex) {
      const currentElements = this.spellSlots[this.activeSpellSlot] || [];
      if (currentElements.length < 2) { // Replace with unlocked count
          // Prevent duplicates
          if (currentElements.includes(elementKey)) return;
          
          // Find first empty slot if one wasn't dropped on
          let targetIndex = slotIndex;
          if(currentElements[slotIndex]) {
             targetIndex = currentElements.findIndex(e => !e);
             if(targetIndex === -1) targetIndex = currentElements.length;
          }

          const newElements = [...currentElements];
          newElements[targetIndex] = elementKey;

          this.spellSlots[this.activeSpellSlot] = newElements.filter(Boolean); // remove empty spots in middle
      }
      this.renderFusionChamber();
  }
  
  removeElementFromFusion(slotIndex) {
      let currentElements = this.spellSlots[this.activeSpellSlot] || [];
      if (currentElements[slotIndex]) {
          currentElements.splice(slotIndex, 1);
          this.spellSlots[this.activeSpellSlot] = currentElements;
      }
      this.renderFusionChamber();
  }
  
  updateFusionResult() {
    const resultContainer = document.getElementById('fusion-result');
    const elementKeys = this.spellSlots[this.activeSpellSlot] || [];
    const elements = elementKeys.map(key => getUnlockedElements()[key]);
    
    if (elements.length === 0) {
        resultContainer.innerHTML = '<p>Add elements to fuse</p>';
        document.getElementById('craft-spell-btn').disabled = true;
        return;
    }

    const fusedSpell = SpellFusion.fuse(elements);
    const color = fusedSpell.color;
    resultContainer.innerHTML = `
      <h3>${fusedSpell.name}</h3>
      <div class="spell-preview" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
      <p>Damage: ${Math.round(fusedSpell.traits.damage)}</p>
      <p>Speed: ${Math.round(fusedSpell.traits.speed)}</p>
    `;
    document.getElementById('craft-spell-btn').disabled = false;
  }

  craftAndEquipSpell() {
    const elementKeys = this.spellSlots[this.activeSpellSlot] || [];
    const elements = elementKeys.map(key => getUnlockedElements()[key]);
    const fusedSpell = SpellFusion.fuse(elements);

    this.onSpellEquipped(fusedSpell, this.activeSpellSlot);
    this.renderSpellSlots();
  }

  refresh() {
    this.render();
  }
}