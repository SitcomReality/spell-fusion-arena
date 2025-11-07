import { ELEMENTS, getLockedElements } from '../spells/Element.js';
import { Icons } from './Icons.js';

export class RewardUI {
  constructor(onRewardChosen, rng = null, gameState = null) {
    this.onRewardChosen = onRewardChosen;
    this.container = null;
    this.choices = [];
    this.essenceOffer = 0;
    this.rng = rng;
    this.gameState = gameState;
  }

  show(waveNumber) {
    // Get locked elements based on current game state's unlocked elements
    const unlockedKeys = this.gameState ? this.gameState.unlockedElementKeys : [];
    const lockedElements = getLockedElements(unlockedKeys);
    const elementKeys = Object.keys(lockedElements);
    
    // Determine offered Mana Essence (biased distribution 5-10)
    this.essenceOffer = this.rollEssenceOffer();

    // Provide a short summary line
    this.autoRewardSummary = `You received: 1 Focus and ${Math.max(1, Math.min(3, this.essenceOffer <= 10 ? 1 : 1))} Essence`;

    if (elementKeys.length === 0) {
      // All elements unlocked; offer essence only
      this.renderEssenceOnly(waveNumber);
      return;
    }

    // Pick 2 random locked elements, weighted by rarity
    this.choices = [];
    const pool = [];
    for (const k of elementKeys) {
      const r = lockedElements[k].rarity || 'common';
      const w = r === 'rare' ? 10 : (r === 'uncommon' ? 30 : 60);
      for (let i = 0; i < w; i++) pool.push(k);
    }
    const picked = new Set();
    while (this.choices.length < 2 && pool.length > 0) {
      const idx = this.rng ? this.rng.nextInt(0, pool.length) : Math.floor(Math.random() * pool.length);
      const key = pool[idx];
      if (!picked.has(key)) {
        picked.add(key);
        this.choices.push({ key, element: lockedElements[key] });
      }
      for (let i = pool.length - 1; i >= 0; i--) if (pool[i] === key) pool.splice(i, 1);
    }

    this.render(waveNumber);
  }

  rollEssenceOffer() {
    // Updated distribution: offer between 5-10 for the choice card (biased)
    const weighted = [
      { amt: 5, w: 30 },
      { amt: 6, w: 20 },
      { amt: 7, w: 15 },
      { amt: 8, w: 12 },
      { amt: 9, w: 10 },
      { amt: 10, w: 8 }
    ];
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = (this.rng ? this.rng.next() : Math.random()) * total;
    for (const x of weighted) {
      if ((r -= x.w) <= 0) return x.amt;
    }
    return 5;
  }

  renderEssenceOnly(waveNumber) {
    this.container = document.createElement('div');
    this.container.id = 'reward-overlay';
    this.container.innerHTML = `
      <div class="reward-modal">
        <h2>Wave ${waveNumber} Complete!</h2>
        <p class="reward-subtitle">${Icons.focusSVG(14)} You received: 1 Focus and ${1 + Math.floor(Math.random() * 3)} ${Icons.manaEssenceSVG(14)}</p>
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
      <div class="reward-card-small-desc">Use Mana Essence to create spells (more elements → higher cost).</div>
      <div class="reward-card-essence-amount">${Icons.manaEssenceSVG(14)} Amount: <span class="essence-amt"></span> ME</div>
    `;
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    const intensity = Math.min(1, Math.max(0, (this.essenceOffer - 5) / (10 - 5)));
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
        <p class="reward-subtitle">${Icons.focusSVG(14)} You received: 1 Focus and ${1 + Math.floor(Math.random() * 3)} ${Icons.manaEssenceSVG(14)}</p>
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
      card.dataset.rarity = elem.rarity || 'common';

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
        <div class="reward-card-header">
          <h3>${elem.name}</h3>
          <span class="rarity-pill">${(elem.rarity || 'common')}</span>
        </div>
        ${propertiesHtml}
      `;
      
      const colorEl = card.querySelector('.reward-card-color');
      if (colorEl) colorEl.style.background = `rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})`;
      
      // visual intensity based on rarity: common=0.0, uncommon=0.5, rare=1.0
      const rarityMap = { common: 0.0, uncommon: 0.5, rare: 1.0 };
      const rarityIntensity = rarityMap[elem.rarity] ?? 0.0;
      card.style.setProperty('--rarity-intensity', `${rarityIntensity}`);

      card.addEventListener('click', () => this.selectElement(choice.key));
      choicesContainer.appendChild(card);
    });

    // Essence choice card
    const essenceCard = document.createElement('div');
    essenceCard.className = 'reward-card essence-card';
    essenceCard.innerHTML = `
      <div class="reward-card-color default-bg"></div>
      <h3>Mana Essence</h3>
      <div class="reward-card-small-desc">Use Mana Essence to create spells (more elements → higher cost).</div>
      <div class="reward-card-essence-amount">Amount: <span class="essence-amt"></span> ME</div>
    `;
    essenceCard.addEventListener('click', () => this.selectEssence());
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    const intensity2 = Math.min(1, Math.max(0, (this.essenceOffer - 5) / (10 - 5)));
    essenceCard.style.setProperty('--essence-intensity', `${0.2 + intensity2 * 0.8}`);
    choicesContainer.appendChild(essenceCard);
  }

  selectElement(elementKey) {
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