import { ELEMENTS, getUnlockedElements } from '../../spells/Element.js';
import VisualPreview from '../VisualPreview.js';

export class ElementsLibrary {
  constructor(onClick) {
    this.onClick = onClick;
    this.container = null;
    this.cardMap = new Map();
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
  }

  refresh(unlockedKeys = []) {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.cardMap.clear();

    const unlocked = getUnlockedElements(unlockedKeys);
    for (const [key, element] of Object.entries(unlocked)) {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.dataset.element = key;
      // Build card content and insert a VisualPreview in place of the simple color square
      card.innerHTML = `<div class="element-card-content"><h4>${element.name}</h4></div>`;
      try {
        const previewData = {
          color: element.color,
          secondaryColor: element.secondaryColor,
          accentColor: element.accentColor || element.secondaryColor,
          properties: element.propertyGenes,
          visualEffects: element.visualEffects
        };
        const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
        previewEl.classList.add('element-card-color', 'element-card-color-preview');
        card.insertBefore(previewEl, card.firstChild);
      } catch (e) {
        // fallback to simple color square if VisualPreview fails
        const fallback = document.createElement('div');
        fallback.className = 'element-card-color';
        fallback.style.background = `rgb(${element.color.r}, ${element.color.g}, ${element.color.b})`;
        card.insertBefore(fallback, card.firstChild);
      }

      card.addEventListener('click', () => {
        this.onClick(key, element, card);
      });
      this.container.appendChild(card);
      this.cardMap.set(key, card);
    }
  }

  markSelectedCard(cardEl) {
    document.querySelectorAll('.element-card.selected').forEach(c => c.classList.remove('selected'));
    if (cardEl) cardEl.classList.add('selected');
  }
}