import { getUnlockedElements } from '../../spells/Element.js';

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

  refresh() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.cardMap.clear();

    const unlocked = getUnlockedElements();
    for (const [key, element] of Object.entries(unlocked)) {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.dataset.element = key;
      card.innerHTML = `
        <div class="element-card-color" style="background: rgb(${element.color.r}, ${element.color.g}, ${element.color.b})"></div>
        <div class="element-card-content">
          <h4>${element.name}</h4>
        </div>
      `;
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