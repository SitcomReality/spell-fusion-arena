import { ELEMENTS } from '../spells/Element.js';
import { SeededRandom } from '../game/SeededRandom.js';
import VisualPreview from './VisualPreview.js';
import { ELEMENTS_READY } from '../spells/Element.js';

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
    // Ensure elements are loaded before starting the new-game flow to avoid races.
    newGameBtn.addEventListener('click', async () => {
      try {
        await ELEMENTS_READY;
      } catch (e) { /* silent */ }
      this.startNewGame();
    });

    // Check for v2 saves to show load button
    try {
      const savedV2 = localStorage.getItem('spellFusion_save_v2');
      if (savedV2) {
        const loadBtn = document.createElement('button');
        loadBtn.className = 'intro-button';
        loadBtn.id = 'load-game-btn';
        loadBtn.textContent = 'Load Game';
        newGameBtn.insertAdjacentElement('afterend', loadBtn);

        loadBtn.addEventListener('click', async () => {
          let payload = null;
          try { payload = JSON.parse(savedV2); } catch (e) { payload = null; }
          // Ensure element definitions are available
          try { await ELEMENTS_READY; } catch (e) {}

          // If no valid payload, fall back to new game
          if (!payload) {
            alert('Failed to load saved game.');
            this.startNewGame();
            return;
          }

          // Reconstruct full game state from payload
          const startingElements = [];
          if (Array.isArray(payload.unlockedElementKeys)) {
            for (const key of payload.unlockedElementKeys.slice(0, 4)) {
              const elem = ELEMENTS[key];
              if (elem) startingElements.push(elem);
            }
          }

          // Build the full config for game startup
          const loadedConfig = {
            startingElements,
            startingElementKeys: payload.unlockedElementKeys || [],
            seed: payload.seed || Math.floor(Math.random() * 0x7FFFFFFF),
            // Pass the full saved state so GameApp can restore it
            savedState: {
              unlockedElementKeys: payload.unlockedElementKeys || [],
              essenceBank: payload.essenceBank || 0,
              focusBank: payload.focusBank || 0,
              spellInventory: payload.spellInventory || [],
              equippedSpells: payload.equippedSpells || [null, null, null, null],
              spellSlotFocus: payload.spellSlotFocus || [1, 0, 0, 0],
              playerHp: payload.playerHp || 1000,
              wave: payload.wave || 0
            }
          };

          // Hide intro screen and start game with loaded state
          this.container.remove();
          this.onGameStart(loadedConfig);
        });
      }
    } catch (e) { /* silent */ }

    // Check for v1 saves and show a message if found
    try {
      const savedV1 = localStorage.getItem('spellFusion_save_v1');
      if (savedV1 && !localStorage.getItem('spellFusion_save_v2')) {
        // Only show the legacy message if there's no v2 save
        const legacyNotice = document.createElement('div');
        legacyNotice.className = 'intro-legacy-notice';
        legacyNotice.innerHTML = `
          <p>We detected an older save file. The game has been updated significantly and old saves are no longer compatible.</p>
          <p>If you'd like to continue with your old save, you can play the previous version here:</p>
          <a href="https://websim.com/@SitcomReality/spell-fusion-arena/412" target="_blank" rel="noopener noreferrer" class="intro-legacy-link">Play Previous Version</a>
        `;
        this.container.querySelector('.intro-screen-content').appendChild(legacyNotice);
      }
    } catch (e) { /* silent */ }
  }

  async startNewGame() {
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
    // Build curated pools by rarity so we can present controlled choice pairs:
    const allEntries = Object.entries(ELEMENTS).map(([key, elem]) => ({ key, elem }));
    const byRarity = allEntries.reduce((acc, entry) => {
      const r = entry.elem.rarity || 'common';
      acc[r] = acc[r] || [];
      acc[r].push(entry);
      return acc;
    }, {});

    // Helper to pick and remove one random entry from a rarity pool
    const pickFrom = (rarityPool) => {
      const pool = byRarity[rarityPool] || [];
      if (!pool || pool.length === 0) return null;
      const idx = this.rng.nextInt(0, pool.length);
      return pool.splice(idx, 1)[0];
    };

    // Construct the four choice rounds according to new rules:
    // Round 1: mundane vs mundane
    // Round 2: mundane vs common
    // Round 3: common vs uncommon
    // Round 4: uncommon vs unusual
    const rounds = [];
    // Defensive defaults if a rarity pool is empty: fall back to any available entry
    const fallbackPick = () => {
      const anyPools = Object.values(byRarity).flat();
      if (anyPools.length === 0) return null;
      const idx = this.rng.nextInt(0, anyPools.length);
      return anyPools.splice(idx, 1)[0];
    };

    // ensure we use the RNG-seeded picks consistently
    const pickSafe = (rarity) => {
      const p = pickFrom(rarity);
      return p || fallbackPick();
    };

    rounds.push([pickSafe('mundane'), pickSafe('mundane')]);
    rounds.push([pickSafe('mundane'), pickSafe('common')]);
    rounds.push([pickSafe('common'), pickSafe('uncommon')]);
    rounds.push([pickSafe('uncommon'), pickSafe('unusual')]);

    // Flatten remaining pools into a single pool for any missing picks later if needed
    const elementPool = [];
    for (const arr of Object.values(byRarity)) {
      for (const e of arr) elementPool.push(e);
    }

    // For any round positions that ended up null (due to missing rarity), fill from leftover pool
    for (let i = 0; i < rounds.length; i++) {
      for (let j = 0; j < 2; j++) {
        if (!rounds[i][j]) {
          if (elementPool.length > 0) {
            const idx = this.rng.nextInt(0, elementPool.length);
            rounds[i][j] = elementPool.splice(idx, 1)[0];
          } else {
            rounds[i][j] = null;
          }
        }
      }
    }

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

    // Start the choice sequence using our precomputed rounds
    this._precomputedRounds = rounds; // store for the choice flow
    this.showLoadoutChoice(null, 0, containerEl);
  }

  // rollElementPool removed (no longer used) - selection is handled in showLoadoutSelection

  showLoadoutChoice(elementPool, choiceIndex, parentContainer = null) {
    // If we have precomputed rounds from showLoadoutSelection, use them.
    const rounds = this._precomputedRounds || null;
    if (choiceIndex >= 4) {
      // All choices made, start game with selected elements
      this.startGameWithLoadout();
      return;
    }

    // If rounds exist, extract the two choices for this index
    let leftChoice = null;
    let rightChoice = null;
    if (rounds && rounds[choiceIndex]) {
      leftChoice = rounds[choiceIndex][0];
      rightChoice = rounds[choiceIndex][1];
    } else {
      // Fallback: pick two random distinct elements from provided elementPool
      const pool = Array.isArray(elementPool) ? elementPool.slice() : [];
      if (pool.length === 0) {
        // No pool available; nothing to show
        this.startGameWithLoadout();
        return;
      }
      const idx1 = this.rng.nextInt(0, pool.length);
      leftChoice = pool.splice(idx1, 1)[0];
      if (pool.length > 0) {
        const idx2 = this.rng.nextInt(0, pool.length);
        rightChoice = pool.splice(idx2, 1)[0];
      } else {
        rightChoice = null;
      }
    }

    // Build the UI choices using the same rendering code previously used.
    const choiceContainer = document.createElement('div');
    choiceContainer.className = 'loadout-choice-container';

    const updateProgress = () => {
      const progressFill = this.container.querySelector('.progress-fill');
      const progressText = this.container.querySelector('.progress-text');
      if (progressFill) progressFill.style.width = `${(this.selectedStartingElements.length / 4) * 100}%`;
      if (progressText) progressText.textContent = `${this.selectedStartingElements.length} / 4 selected`;
    };

    const makeCard = (choice) => {
      if (!choice) {
        const empty = document.createElement('div');
        empty.className = 'loadout-choice-card';
        empty.innerHTML = `<div class="loadout-card-content"><h3>Unavailable</h3></div>`;
        return empty;
      }
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
          const val = (typeof v === 'number') ? (Math.round((k === 'damage' || k === 'speed') ? v : v * 100) / 100) : v;
          return `<div class="property-badge" data-property="${k}">
                    <span class="property-icon"></span>
                    <span class="property-value">${val}</span>
                  </div>`;
        }).join('') + '</div>';
      }

      card.innerHTML = `
        <div class="loadout-card-content">
          <h3>${elem.name}</h3>
          <span class="rarity-pill" data-rarity="${(elem.rarity || 'common')}">${(elem.rarity || 'common')}</span>
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
          this.showLoadoutChoice(null, choiceIndex + 1, parentContainer);
        }, 200);
      });

      return card;
    };

    choiceContainer.appendChild(makeCard(leftChoice));
    choiceContainer.appendChild(makeCard(rightChoice));

    // Remove the old choice cards if any exist inside the same parent container
    const targetParent = parentContainer || this.container;
    const oldChoice = targetParent.querySelector('.loadout-choice-container');
    if (oldChoice) oldChoice.remove();
    targetParent.appendChild(choiceContainer);
  }

  startGameWithLoadout() {
    // Hide intro screen and start game with selected elements
    this.container.remove();

    // Pass the selected elements, their keys, seed, and savedState to the game
    this.onGameStart({
      startingElements: this.selectedStartingElements,
      startingElementKeys: this.selectedElementKeys,
      seed: this.rng.seed
    });
  }
}