import { ELEMENTS, getLockedElements } from '../spells/Element.js';
import { Icons } from './Icons.js';
import VisualPreview from './VisualPreview.js';

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
    // Special tutorial reward for wave 1: only offer 5 Mana Essence and explanatory text
    if (waveNumber === 1) {
      this.essenceOffer = 5;
      this.renderWaveOneIntro(waveNumber);
      return;
    }
    
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
    // Rarity tiers from lowest -> highest. Each step increases rarity by factor 10.
    const rarityTier = {
      mundane: 1,
      common: 2,
      uncommon: 3,
      unusual: 4,
      rare: 5,
      prestigious: 6,
      exotic: 7,
      outstanding: 8,
      exceptional: 9,
      legendary: 10,
      wondrous: 11,
      supernal: 12,
      mythic: 13
    };

    const maxTier = 13;

    // Build weighted options where higher-tier rarities are exponentially less likely.
    const options = elementKeys.map(k => {
      const el = lockedElements[k];
      const tier = rarityTier[el.rarity] || 2; // default to common-like if unknown
      // weight scale: lower numeric weight for rarer tiers (each tier ~10x rarer).
      // Use pow(0.1, tier-1) to keep numbers well-behaved as small floats; weightedChoice handles relative weights.
      const weight = Math.pow(0.1, tier - 1);
      return { value: k, weight, element: el };
    }).filter(o => o.weight > 0);

    // Helper to pick without replacement using rng.weightedChoice where available.
    const pickOne = () => {
      if (options.length === 0) return null;
      if (this.rng && typeof this.rng.weightedChoice === 'function') {
        const value = this.rng.weightedChoice(options.map(o => ({ value: o, weight: o.weight })));
        // value is the object from options (we passed objects as value); find and remove it
        const idx = options.findIndex(o => o === value);
        if (idx >= 0) return options.splice(idx, 1)[0];
        // fallback: random pop
        return options.splice(Math.floor((this.rng ? this.rng.next() : Math.random()) * options.length), 1)[0];
      } else {
        // Fallback: deterministic-ish random by cumulative weights using Math.random()
        const total = options.reduce((s, o) => s + o.weight, 0);
        let r = (this.rng ? this.rng.next() : Math.random()) * total;
        for (let i = 0; i < options.length; i++) {
          r -= options[i].weight;
          if (r <= 0) {
            return options.splice(i, 1)[0];
          }
        }
        return options.splice(options.length - 1, 1)[0];
      }
    };

    // Pick up to 2 distinct choices
    while (this.choices.length < 2 && options.length > 0) {
      const pick = pickOne();
      if (!pick) break;
      this.choices.push({ key: pick.value, element: pick.element });
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
        <p class="reward-subtitle">You received: 1 ${Icons.focusSVG(14)} Focus and ${1 + Math.floor(Math.random() * 3)} ${Icons.manaEssenceSVG(14)} Mana Essence</p>
        <p class="reward-subtitle">Take your reward</p>
        <div class="reward-choices" id="reward-choices"></div>
      </div>
    `;
    document.body.appendChild(this.container);
    const choicesContainer = document.getElementById('reward-choices');

    const essenceCard = document.createElement('div');
    essenceCard.className = 'reward-card essence-card';
    essenceCard.innerHTML = `
      <h3>Mana Essence</h3>
      <div class="reward-card-small-desc">Use Mana Essence to create spells (more elements → higher cost).</div>
      <div class="reward-card-essence-amount">${Icons.manaEssenceSVG(14)} Amount: <span class="essence-amt"></span> ${Icons.manaEssenceSVG(14)}</div>
    `;
    // create a simple visual preview for essence
    try {
      const preview = VisualPreview.create({ color: { r: 100, g: 200, b: 255 }, visualEffects: { shimmer: true } }, { size: 'medium', interactive: false });
      preview.classList.add('reward-card-color-preview');
      essenceCard.insertBefore(preview, essenceCard.firstChild);
    } catch (e) {
      const fallback = document.createElement('div');
      fallback.className = 'reward-card-color';
      fallback.innerHTML = Icons.manaEssenceSVG(40);
      essenceCard.insertBefore(fallback, essenceCard.firstChild);
    }
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    const intensity = Math.min(1, Math.max(0, (this.essenceOffer - 5) / (10 - 5)));
    essenceCard.style.setProperty('--essence-intensity', `${0.2 + intensity * 0.8}`);

    essenceCard.addEventListener('click', () => this.selectEssence());
    choicesContainer.appendChild(essenceCard);
  }

  // Special tutorial panel for wave 1 that explains Focus & Mana Essence and only offers 5 ME
  renderWaveOneIntro(waveNumber) {
    this.container = document.createElement('div');
    this.container.id = 'reward-overlay';
    this.container.innerHTML = `
      <div class="reward-modal">
        <h2>Wave ${waveNumber} Complete!</h2>
        <p class="reward-subtitle">You received: 1 ${Icons.focusSVG(14)} Focus — Focus can be spent to upgrade a spell slot (one Focus per wave).</p>
        <p class="reward-subtitle">You also get 5 ${Icons.manaEssenceSVG(14)} Mana Essence — Mana Essence is used to create spells; with 5 Essence you can make a 2-element fusion for the next wave.</p>
        <p class="reward-subtitle">Normally you may choose to unlock an element or take Mana Essence, but for this first wave we've granted 5 Essence to get you started.</p>
        <div class="reward-choices" id="reward-choices"></div>
      </div>
    `;
    document.body.appendChild(this.container);
    const choicesContainer = document.getElementById('reward-choices');

    const essenceCard = document.createElement('div');
    essenceCard.className = 'reward-card essence-card';
    essenceCard.innerHTML = `
      <h3>Mana Essence</h3>
      <div class="reward-card-small-desc">Use Mana Essence to create spells (5 Essence → allows making a 2-element spell).</div>
      <div class="reward-card-essence-amount">${Icons.manaEssenceSVG(14)} Amount: <span class="essence-amt"></span> ${Icons.manaEssenceSVG(14)}</div>
    `;
    try {
      const preview = VisualPreview.create({ color: { r: 100, g: 200, b: 255 }, visualEffects: { shimmer: true } }, { size: 'medium', interactive: false });
      preview.classList.add('reward-card-color-preview');
      essenceCard.insertBefore(preview, essenceCard.firstChild);
    } catch (e) {
      const fallback = document.createElement('div');
      fallback.className = 'reward-card-color';
      fallback.innerHTML = Icons.manaEssenceSVG(40);
      essenceCard.insertBefore(fallback, essenceCard.firstChild);
    }
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    essenceCard.style.setProperty('--essence-intensity', `${0.2 + Math.min(1, (this.essenceOffer - 5) / 5) * 0.8}`);

    essenceCard.addEventListener('click', () => this.selectEssence());
    choicesContainer.appendChild(essenceCard);
  }

  render(waveNumber) {
    this.container = document.createElement('div');
    this.container.id = 'reward-overlay';
    this.container.innerHTML = `
      <div class="reward-modal">
        <h2>Wave ${waveNumber} Complete!</h2>
        <p class="reward-subtitle">You received: 1 ${Icons.focusSVG(14)} Focus and ${1 + Math.floor(Math.random() * 3)} ${Icons.manaEssenceSVG(14)} Mana Essence</p>
        <p class="reward-subtitle">Choose an element to unlock, or take ${Icons.manaEssenceSVG(14)} Mana Essence</p>
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
      // Build properties area using the site's standard property-badge markup
      let propertiesHtml = '';
      const propEntries = Object.entries(propertyGenes || {});
      if (propEntries.length === 0) {
        propertiesHtml = '<div class="reward-card-small-desc">No special properties</div>';
      } else {
        propertiesHtml = '<div class="reward-card-properties">';
        for (const [k, v] of propEntries) {
          const displayVal = (typeof v === 'number') ? (Math.round((k === 'damage' || k === 'speed') ? v : v * 100) / 100) : v;
          propertiesHtml += `<div class="property-badge" data-property="${k}">
              <span class="property-icon"></span>
              <span class="property-value">${displayVal}</span>
            </div>`;
        }
        propertiesHtml += '</div>';
      }

      card.innerHTML = `
        <div class="reward-card-header-left"></div>
        <div class="reward-card-header">
          <h3>${elem.name}</h3>
          <span class="rarity-pill">${(elem.rarity || 'common')}</span>
        </div>
        ${propertiesHtml}
      `;
      
      // Insert a VisualPreview as the color/header-left visual
      try {
        const previewData = {
          color: elem.color,
          secondaryColor: elem.secondaryColor,
          accentColor: elem.accentColor || elem.secondaryColor,
          properties: elem.propertyGenes,
          visualEffects: elem.visualEffects
        };
        const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
        previewEl.classList.add('reward-card-color-preview');
        const headerLeft = card.querySelector('.reward-card-header-left');
        if (headerLeft) headerLeft.appendChild(previewEl);
      } catch (e) {
        const fallback = card.querySelector('.reward-card-header-left');
        if (fallback) {
          fallback.className = 'reward-card-color';
          fallback.style.background = `rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})`;
        }
      }
      
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
      <h3>Mana Essence</h3>
      <div class="reward-card-small-desc">Use Mana Essence to create spells (more elements → higher cost).</div>
      <div class="reward-card-essence-amount">${Icons.manaEssenceSVG(14)} Amount: <span class="essence-amt"></span> ${Icons.manaEssenceSVG(14)}</div>
    `;
    try {
      const preview = VisualPreview.create({ color: { r: 100, g: 200, b: 255 }, visualEffects: { shimmer: true } }, { size: 'medium', interactive: false });
      preview.classList.add('reward-card-color-preview');
      essenceCard.insertBefore(preview, essenceCard.firstChild);
    } catch (e) {
      const fallback = document.createElement('div');
      fallback.className = 'reward-card-color';
      fallback.innerHTML = Icons.manaEssenceSVG(40);
      essenceCard.insertBefore(fallback, essenceCard.firstChild);
    }
    essenceCard.addEventListener('click', () => this.selectEssence());
    essenceCard.querySelector('.essence-amt').textContent = `${this.essenceOffer}`;
    const intensity2 = Math.min(1, Math.max(0, (this.essenceOffer - 5) / (10 - 5)));
    essenceCard.style.setProperty('--essence-intensity', `${0.2 + intensity2 * 0.8}`);
    choicesContainer.appendChild(essenceCard);
  }

  selectElement(elementKey) {
    this.hide();
    this.onRewardChosen({ type: 'element', key: elementKey });
    // Persist save immediately after choosing a reward
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
    
    // NEW: Auto-allocate focus if auto is enabled
    try {
      if (window && window.gameInstance && window.gameInstance.autoAllocateFocus) {
        setTimeout(() => {
          window.gameInstance.autoAllocateFocus();
        }, 100);
      }
    } catch (e) {}
  }

  selectEssence() {
    const amount = this.essenceOffer;
    this.hide();
    this.onRewardChosen({ type: 'essence', amount });
    // Persist save immediately after choosing a reward
    try { if (window && window.saveGame) window.saveGame(); } catch (e) {}
    
    // NEW: Auto-allocate focus if auto is enabled
    try {
      if (window && window.gameInstance && window.gameInstance.autoAllocateFocus) {
        setTimeout(() => {
          window.gameInstance.autoAllocateFocus();
        }, 100);
      }
    } catch (e) {}
  }

  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}