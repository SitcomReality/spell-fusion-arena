import { ELEMENTS } from '../spells/Element.js';
import { SeededRandom } from '../game/SeededRandom.js';
import VisualPreview from './VisualPreview.js';

export class IntroScreen {
  constructor(onGameStart) {
    this.onGameStart = onGameStart;
    this.container = null;
    this.rng = null;
    this.selectedStartingElements = [];
    this.selectedElementKeys = [];
  }

  show() {
    this.container = document.createElement('div');
    this.container.id = 'intro-screen-overlay';
    this.container.className = 'intro-screen-overlay';
    this.container.innerHTML = `
      <div class="intro-screen-container">
        <div class="intro-screen-content">
          <h1 class="intro-title">Spell Fusion Arena</h1>
          <p class="intro-subtitle">Master the elements. Defeat the waves.</p>
          <button class="intro-button" id="new-game-btn">New Game</button>
          <div class="intro-credits">
            <span>A game by</span>
            <a href="https://websim.com/@SitcomReality" target="_blank" rel="noopener noreferrer">
              <img src="/sitcomreality.png" alt="SitcomReality" width="250" height="70" />
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);

    const newGameBtn = document.getElementById('new-game-btn');
    newGameBtn.addEventListener('click', () => this.startNewGame());
  }

  startNewGame() {
    // Generate a random seed for this game session
    const seed = Math.floor(Math.random() * 0x7FFFFFFF);
    this.rng = new SeededRandom(seed);

    // Clear the current screen and show loadout selection
    this.container.innerHTML = '';
    this.selectedStartingElements = [];
    this.selectedElementKeys = [];
    this.showLoadoutSelection(seed);
  }

  showLoadoutSelection(seed) {
    // Roll 8 random elements, weighted by rarity (common > uncommon > rare)
    const elementPool = this.rollElementPool(8);

    // Display title with seed info
    const titleEl = document.createElement('div');
    titleEl.className = 'intro-screen-content';
    titleEl.innerHTML = `
      <h2 class="intro-title">Select Your Starting Elements</h2>
      <p class="intro-subtitle">Choose 4 elements to begin (2 choices at a time)</p>
      <div class="loadout-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <span class="progress-text">0 / 4 selected</span>
      </div>
    `;
    // Ensure both the title content and the choice cards are placed inside the same
    // intro-screen-container so the choice cards render below the intro content.
    this.container.innerHTML = '';
    const containerEl = document.createElement('div');
    containerEl.className = 'intro-screen-container';
    containerEl.appendChild(titleEl);
    this.container.appendChild(containerEl);

    // Start the choice sequence
    this.showLoadoutChoice(elementPool, 0, containerEl);
  }

  rollElementPool(count) {
    const allElements = Object.entries(ELEMENTS).map(([key, elem]) => ({ key, elem }));
    const pool = [];

    // Weight by rarity: common=60, uncommon=30, rare=10
    const weighted = [];
    for (const { key, elem } of allElements) {
      const weight = elem.rarity === 'rare' ? 10 : (elem.rarity === 'uncommon' ? 30 : 60);
      for (let i = 0; i < weight; i++) {
        weighted.push({ key, elem });
      }
    }

    // Pick `count` unique elements
    const picked = new Set();
    while (pool.length < count && weighted.length > 0) {
      const idx = this.rng.nextInt(0, weighted.length);
      const { key, elem } = weighted[idx];
      if (!picked.has(key)) {
        picked.add(key);
        pool.push({ key, elem });
      }
      // Remove all instances of this key from pool
      for (let i = weighted.length - 1; i >= 0; i--) {
        if (weighted[i].key === key) weighted.splice(i, 1);
      }
    }

    return pool;
  }

  showLoadoutChoice(elementPool, choiceIndex, parentContainer = null) {
    if (choiceIndex >= 4) {
      // All choices made, start game with selected elements
      this.startGameWithLoadout();
      return;
    }

    // Pick 2 unique elements from the remaining pool
    const choice1Idx = this.rng.nextInt(0, elementPool.length);
    const choice1 = elementPool[choice1Idx];

    // Remove choice1 from pool
    const remaining = elementPool.filter((_, idx) => idx !== choice1Idx);
    const choice2Idx = this.rng.nextInt(0, remaining.length);
    const choice2 = remaining[choice2Idx];

    // Remove choice2 from pool
    const nextPool = remaining.filter((_, idx) => idx !== choice2Idx);

    // Render choice cards
    const choiceContainer = document.createElement('div');
    choiceContainer.className = 'loadout-choice-container';

    const updateProgress = () => {
      const progressFill = this.container.querySelector('.progress-fill');
      const progressText = this.container.querySelector('.progress-text');
      if (progressFill) progressFill.style.width = `${(this.selectedStartingElements.length / 4) * 100}%`;
      if (progressText) progressText.textContent = `${this.selectedStartingElements.length} / 4 selected`;
    };

    const makeCard = (choice) => {
      const card = document.createElement('div');
      card.className = 'loadout-choice-card';
      const elem = choice.elem;
      const color = elem.color;

      // Build property badges markup from propertyGenes
      const propGenes = elem.propertyGenes || {};
      let propsHtml = '';
      const propEntries = Object.entries(propGenes);
      if (propEntries.length > 0) {
        propsHtml = '<div class="properties-list">' + propEntries.map(([k, v]) => {
          // display numeric formatting for common keys
          const val = (typeof v === 'number') ? (Math.round((k === 'damage' || k === 'speed') ? v : v * 100) / 100) : v;
          return `<div class="property-badge" data-property="${k}">
                    <span class="property-icon"></span>
                    <span class="property-value">${val}</span>
                  </div>`;
        }).join('') + '</div>';
      }

      // Build card structure then insert a VisualPreview in place of the color square
      card.innerHTML = `
        <div class="loadout-card-content">
          <h3>${elem.name}</h3>
          <p class="loadout-card-rarity">${(elem.rarity || 'common').toUpperCase()}</p>
          ${propsHtml}
        </div>
      `;

      // Create a non-interactive preview for the element
      try {
        const previewData = {
          color: elem.color,
          secondaryColor: elem.secondaryColor,
          accentColor: elem.accentColor || elem.secondaryColor,
          properties: elem.propertyGenes,
          visualEffects: elem.visualEffects
        };
        const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
        previewEl.classList.add('loadout-card-color-preview');
        // Insert preview at the top of the card
        card.insertBefore(previewEl, card.firstChild);
      } catch (e) {
        // Fallback to original simple color block if preview fails
        const fallback = document.createElement('div');
        fallback.className = 'loadout-card-color';
        fallback.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
        card.insertBefore(fallback, card.firstChild);
      }

      card.addEventListener('click', () => {
        this.selectedStartingElements.push(elem);
        this.selectedElementKeys.push(choice.key);
        updateProgress();
        // Small delay to show selection feedback
        setTimeout(() => {
          this.showLoadoutChoice(nextPool, choiceIndex + 1, parentContainer);
        }, 200);
      });

      return card;
    };

    choiceContainer.appendChild(makeCard(choice1));
    choiceContainer.appendChild(makeCard(choice2));

    // Remove the old choice cards if any exist inside the same parent container
    const targetParent = parentContainer || this.container;
    const oldChoice = targetParent.querySelector('.loadout-choice-container');
    if (oldChoice) oldChoice.remove();
    targetParent.appendChild(choiceContainer);
  }

  startGameWithLoadout() {
    // Hide intro screen and start game with selected elements
    this.container.remove();

    // Pass the selected elements, their keys, and seed to the game
    this.onGameStart({
      startingElements: this.selectedStartingElements,
      startingElementKeys: this.selectedElementKeys,
      seed: this.rng.seed
    });
  }
}