import { getLockedElements, unlockElement } from '../spells/Element.js';

export class RewardUI {
  constructor(onRewardChosen) {
    this.onRewardChosen = onRewardChosen;
    this.container = null;
    this.choices = [];
    this.essenceOffer = 0; // Mana Essence offered
  }

  show(waveNumber) {
    const lockedElements = getLockedElements();
    const elementKeys = Object.keys(lockedElements);
    
    // Determine offered Mana Essence (biased distribution 2-10)
    this.essenceOffer = this.rollEssenceOffer();

    if (elementKeys.length === 0) {
      // All elements unlocked; offer essence only
      this.renderEssenceOnly(waveNumber);
      return;
    }

    // Pick 2 random locked elements
    this.choices = [];
    const availableKeys = [...elementKeys];
    const numChoices = Math.min(2, availableKeys.length);
    
    for (let i = 0; i < numChoices; i++) {
      const randomIndex = Math.floor(Math.random() * availableKeys.length);
      this.choices.push({
        key: availableKeys[randomIndex],
        element: lockedElements[availableKeys[randomIndex]]
      });
      availableKeys.splice(randomIndex, 1);
    }

    this.render(waveNumber);
  }

  rollEssenceOffer() {
    const weighted = [
      { amt: 2, w: 40 },
      { amt: 3, w: 20 },
      { amt: 4, w: 12 },
      { amt: 5, w: 8 },
      { amt: 6, w: 6 },
      { amt: 7, w: 5 },
      { amt: 8, w: 4 },
      { amt: 9, w: 3 },
      { amt: 10, w: 2 }
    ];
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const x of weighted) {
      if ((r -= x.w) <= 0) return x.amt;
    }
    return 2;
  }

  renderEssenceOnly(waveNumber) {
    this.container = document.createElement('div');
    this.container.id = 'reward-overlay';
    this.container.innerHTML = `
      <div class="reward-modal">
        <h2>Wave ${waveNumber} Complete!</h2>
        <p class="reward-subtitle">Take your reward</p>
        <div class="reward-choices" id="reward-choices"></div>
      </div>
    `;
    document.body.appendChild(this.container);
    const choicesContainer = document.getElementById('reward-choices');

    const essenceCard = document.createElement('div');
    essenceCard.className = 'reward-card essence-card';
    essenceCard.innerHTML = `
      <div class="reward-card-color default-bg"></div>
      <h3>Mana Essence</h3>
      <div class="reward-card-small-desc">Use Mana Essence to equip spells.</div>
      <div class="reward-card-essence-amount">Amount: <span class="essence-amt"></span> ME</div>
    `;
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    const intensity = Math.min(1, Math.max(0, (this.essenceOffer - 2) / (10 - 2)));
    essenceCard.style.setProperty('--essence-intensity', `${0.2 + intensity * 0.8}`);

    essenceCard.addEventListener('click', () => this.selectEssence());
    choicesContainer.appendChild(essenceCard);
  }

  render(waveNumber) {
    this.container = document.createElement('div');
    this.container.id = 'reward-overlay';
    this.container.innerHTML = `
      <div class="reward-modal">
        <h2>Wave ${waveNumber} Complete!</h2>
        <p class="reward-subtitle">Choose an element to unlock, or take Mana Essence</p>
        <div class="reward-choices" id="reward-choices"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    const choicesContainer = document.getElementById('reward-choices');
    
    // Element choices (2)
    this.choices.forEach((choice) => {
      const elem = choice.element;
      const card = document.createElement('div');
      card.className = 'reward-card';
      card.dataset.key = choice.key;
      
      const propertyGenes = elem.propertyGenes || {};
      const propertiesHtml = Object.keys(propertyGenes).length === 0
        ? '<div class="reward-card-small-desc">No special properties</div>'
        : '<div class="reward-card-properties">' + Object.entries(propertyGenes).map(([k,v]) =>
            `<div class="reward-card-property-row">
               <span class="reward-card-property-icon" data-property="${k}"></span>
               <span class="reward-card-property-value">${v}</span>
             </div>`
          ).join('') + '</div>';
      
      card.innerHTML = `
        <div class="reward-card-color"></div>
        <h3>${elem.name}</h3>
        ${propertiesHtml}
      `;
      
      const colorEl = card.querySelector('.reward-card-color');
      if (colorEl) colorEl.style.background = `rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})`;
      
      card.addEventListener('click', () => this.selectElement(choice.key));
      choicesContainer.appendChild(card);
    });

    // Essence choice card
    const essenceCard = document.createElement('div');
    essenceCard.className = 'reward-card essence-card';
    essenceCard.innerHTML = `
      <div class="reward-card-color default-bg"></div>
      <h3>Mana Essence</h3>
      <div class="reward-card-small-desc">Use Mana Essence to equip spells.</div>
      <div class="reward-card-essence-amount">Amount: <span class="essence-amt"></span> ME</div>
    `;
    essenceCard.addEventListener('click', () => this.selectEssence());
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    const intensity2 = Math.min(1, Math.max(0, (this.essenceOffer - 2) / (10 - 2)));
    essenceCard.style.setProperty('--essence-intensity', `${0.2 + intensity2 * 0.8}`);
    choicesContainer.appendChild(essenceCard);
  }

  selectElement(elementKey) {
    unlockElement(elementKey);
    this.hide();
    this.onRewardChosen({ type: 'element', key: elementKey });
  }

  selectEssence() {
    const amount = this.essenceOffer;
    this.hide();
    this.onRewardChosen({ type: 'essence', amount });
  }

  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}