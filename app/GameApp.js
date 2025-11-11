import { CONFIG, COLORS } from '../config.js';
import { GameState } from '../game/GameState.js';
import { Renderer } from '../rendering/Renderer.js';
import { EffectsRenderer } from '../rendering/EffectsRenderer.js';
import { FusionUI } from '../ui/FusionUI.js';
import { HUD } from '../ui/HUD.js';
import { RewardUI } from '../ui/RewardUI.js';
import { IntroScreen } from '../ui/IntroScreen.js';
import { WaveStartButton } from '../ui/WaveStartButton.js';
import { SeededRandom } from '../game/SeededRandom.js';
import { ELEMENTS, ELEMENTS_READY } from '../spells/Element.js';
import { createLayoutObserver } from './LayoutObserver.js';
import { GameOverUI } from '../ui/GameOverUI.js';
import { Tutorial } from '../ui/Tutorial.js';
import { SpeedControl } from '../ui/SpeedControl.js';

export class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;

    this.fxCanvas = document.getElementById('fx-canvas');
    this.fxCanvas.width = CONFIG.canvas.width;
    this.fxCanvas.height = CONFIG.canvas.height;

    this.renderer = new Renderer(this.canvas);
    this.fxRenderer = new EffectsRenderer(this.fxCanvas);
    this.gameState = null;
    this.hud = new HUD();
    this.fusionUI = null;
    this.rewardUI = null;
    this.waveStartButton = null;
    this.gameOverUI = null;
    this.speedControl = null;
    this.rng = null;
    this.tutorial = null;
    this.autoEnabled = false;

    this.lastTime = 0;
    this.running = true;

    this.setupMobileLayoutObserver();

    // Expose save helper for UI modules to call when they mutate state
    window.saveGame = this.saveGameState?.bind(this) || (() => {});

    // Show intro screen
    this.showIntroScreen();
  }

  // NEW: persist a minimal snapshot of important game/fusion state to localStorage
  saveGameState() {
    try {
      const payload = {
        unlockedElementKeys: this.gameState ? this.gameState.unlockedElementKeys : [],
        // fusionUI may be null during intro/cleanup - guard access
        essenceBank: this.fusionUI ? this.fusionUI.essenceBank : 0,
        focusBank: this.fusionUI ? this.fusionUI.focusBank : 0,
        spellInventory: this.fusionUI ? this.fusionUI.spellInventory : [],
        equippedSpells: this.fusionUI ? this.fusionUI.equippedSpells : [null, null, null, null],
        spellSlotFocus: this.fusionUI ? this.fusionUI.spellSlotFocus : [1,0,0,0],
        playerHp: this.gameState ? this.gameState.player.hp : undefined,
        wave: this.gameState ? this.gameState.waveManager.currentWave : undefined,
        seed: this.gameState ? this.gameState.seed : undefined
      };
      localStorage.setItem('spellFusion_save_v1', JSON.stringify(payload));
    } catch (e) {
      // best-effort; do not break game flow on storage errors
      console.warn('Failed to save game state', e);
    }
  }

  showIntroScreen() {
    const introScreen = new IntroScreen((config) => {
      // Extract savedState if provided (from load game flow)
      const savedState = config.savedState || null;
      this.startGameWithLoadout(
        config.startingElements, 
        config.seed,
        savedState
      );
    });
    introScreen.show();
  }

  async startGameWithLoadout(startingElements, seed, savedState) {
    // savedState is provided as the third parameter; use it directly
    
    // Clean up previous game if any
    this.cleanupGame();

    this.rng = new SeededRandom(seed);

    const startingElementKeys = startingElements.map(elem => {
      for (const [key, el] of Object.entries(ELEMENTS)) {
        if (el === elem) return key;
      }
      return null;
    }).filter(k => k !== null);

    this.gameState = new GameState(CONFIG.canvas.width, CONFIG.canvas.height, seed, startingElementKeys);

    const startingSpells = startingElements.slice(0, 4);
    this.gameState.player.equipSpells(startingSpells, [1, 0, 0, 0]);

    this.fusionUI = new FusionUI((spells, focus) => {
      this.gameState.player.equipSpells(spells, focus);
    }, this.gameState);

    // If we have saved state, restore it
    if (savedState) {
      // Ensure element definitions are loaded before we attempt to refresh any UI
      try { await ELEMENTS_READY; } catch (e) { /* continue best-effort */ }

      // Restore unlocked elements
      if (savedState.unlockedElementKeys && Array.isArray(savedState.unlockedElementKeys)) {
        this.gameState.unlockedElementKeys = [...savedState.unlockedElementKeys];
      }

      // Restore essence and focus banks
      this.fusionUI.essenceBank = savedState.essenceBank || 0;
      this.fusionUI.focusBank = savedState.focusBank || 0;

      // Restore spell inventory (spells are serialized, need to be reconstructed)
      if (savedState.spellInventory && Array.isArray(savedState.spellInventory)) {
        this.fusionUI.spellInventory = [...savedState.spellInventory];
      }

      // Restore equipped spells and slot focus
      if (savedState.equippedSpells && Array.isArray(savedState.equippedSpells)) {
        this.fusionUI.equippedSpells = [...savedState.equippedSpells];
      }
      if (savedState.spellSlotFocus && Array.isArray(savedState.spellSlotFocus)) {
        this.fusionUI.spellSlotFocus = [...savedState.spellSlotFocus];
      }

      // Apply equipped spells to player
      if (savedState.equippedSpells) {
        this.gameState.player.equipSpells(savedState.equippedSpells, savedState.spellSlotFocus || [1, 0, 0, 0]);
      }

      // Ensure WaveManager reflects saved wave number so loaded games resume at the correct wave
      if (typeof savedState.wave === 'number') {
        this.gameState.waveManager.currentWave = Math.max(0, Math.floor(savedState.wave));
      }
      
      // After restoring data, ensure the FusionUI reflects the restored state (unlocked elements, inventory, slots, focus/essence)
      try {
        if (this.fusionUI) {
          // Refresh will re-render elements library, slots, preview and created spells list
          this.fusionUI.refresh();
        }
      } catch (e) {
        console.warn('Failed to refresh FusionUI after loading savedState', e);
      }
    }

    // Initialize tutorial
    // Only initialize and start the tutorial for new games. If we are restoring from a savedState
    // assume the player has already completed (or skipped) the tutorial and mark it as completed
    // so the UI is not locked.
    if (!savedState) {
      this.tutorial = new Tutorial(this.gameState, this.fusionUI);
      this.tutorial.initialize();
    } else {
      // Treat loaded games as if the player skipped the tutorial.
      try { localStorage.setItem('tutorialCompleted', 'true'); } catch (e) { /* silent */ }
      this.tutorial = null;
    }

    // Initialize speed control with auto toggle
    this.speedControl = new SpeedControl(
      (speed) => {
        this.gameState.setSpeedMultiplier(speed);
      },
      (autoEnabled) => {
        this.autoEnabled = autoEnabled;
      }
    );
    this.speedControl.mount(document.getElementById('canvas-wrapper'));

    this.rewardUI = new RewardUI((reward) => {
      if (reward.type === 'essence') {
        this.fusionUI.addEssenceToBank(reward.amount);
      } else if (reward.type === 'element') {
        this.gameState.unlockElement(reward.key);
        this.fusionUI.refresh();
      }
      this.gameState.resume();
      this.fusionUI.refresh();

      // Ensure fusion UI scrolls to the top after picking a reward so the elements library is visible
      try {
        if (this.fusionUI && this.fusionUI.container) {
          this.fusionUI.container.scrollTo?.({ top: 0, behavior: 'smooth' });
        }
      } catch (e) { /* silent */ }

      // Progress tutorial on Wave 1 completion
      if (this.tutorial && this.tutorial.isActive && this.gameState.waveManager.currentWave === 1) {
        setTimeout(() => {
          this.tutorial.jump('two-element-fusion');
        }, 500);
      }

      this.showNextWaveButton();
    }, this.rng, this.gameState);

    this.waveStartButton = new WaveStartButton(document.getElementById('canvas-wrapper'));

    this.gameState.waveManager.onWaveComplete((waveNumber) => {
      this.gameState.pause();
      const autoFocus = 1;
      const autoEssence = 1 + Math.floor(this.rng.next() * 3);
      try {
        this.fusionUI.addFocusToBank(autoFocus);
        this.fusionUI.addEssenceToBank(autoEssence);
      } catch (e) {}
      this.rewardUI.show(waveNumber);
    });

    // Handle game over
    this.gameState.onGameOver = () => {
      this.handleGameOver();
    };

    try {
      if (this.hud) {
        this.hud.setWave(this.gameState.waveManager.currentWave);
        this.hud.setScore(this.gameState.score);
        this.hud.setEnemies(0);
        this.hud.setHealth(this.gameState.player.hp);
        this.hud.setEssence(this.fusionUI.essenceBank);
        this.hud.setFocus(this.fusionUI.focusBank);
      }
    } catch (e) {}

    this.showNextWaveButton();

    // Start the tutorial only for fresh/new games.
    if (this.tutorial) {
      setTimeout(() => {
        this.tutorial.start();
      }, 300);
    }

    this.start();
  }

  // Handle game over
  handleGameOver() {
    this.running = false;
    const waveNumber = this.gameState.waveManager.currentWave - 1;
    const finalScore = this.gameState.score;
    const finalHealth = this.gameState.player.hp;

    this.gameOverUI = new GameOverUI(() => {
      this.gameOverUI.hide();
      this.cleanupGame();
      this.showIntroScreen();
    });

    this.gameOverUI.show(waveNumber, finalScore, finalHealth);
  }

  // Clean up game resources
  cleanupGame() {
    this.running = false;
    if (this.gameOverUI) {
      this.gameOverUI.hide();
      this.gameOverUI = null;
    }
    if (this.waveStartButton) {
      this.waveStartButton.hide();
      this.waveStartButton = null;
    }
    if (this.rewardUI) {
      this.rewardUI.hide();
      this.rewardUI = null;
    }
    // Remove only the speed-control wrapper element that the SpeedControl appended
    // instead of clearing the whole canvas-wrapper (which would remove the canvases).
    if (this.speedControl) {
      try {
        if (this.speedControl.element && this.speedControl.element.parentNode) {
          this.speedControl.element.remove();
        }
      } catch (e) { /* silent */ }
      this.speedControl = null;
    }
    // Clear canvas
    if (this.renderer) {
      this.renderer.clear(COLORS.background);
    }
    if (this.fxRenderer) {
      this.fxRenderer.clear();
    }
  }

  // NEW: Auto-advance to next wave
  autoStartWave() {
    if (!this.autoEnabled || !this.waveStartButton) return;
    const nextWaveNumber = this.gameState.waveManager.currentWave + 1;
    if (this.gameState.waveStartPending) {
      // Simulate click on the wave start button
      try {
        if (this.tutorial && this.tutorial.isActive && this.tutorial.callout) {
          this.tutorial.callout.remove();
        }
      } catch (e) { /* silent */ }
      this.gameState.waveManager.startNextWave();
      this.gameState.startWave();
      this.waveStartButton.hide();
      try {
        if (this.hud) this.hud.setWave(this.gameState.waveManager.currentWave);
        if (this.hud) this.hud.setEnemies(0);
      } catch (e) {}
    }
  }

  // NEW: Auto-select a random reward
  autoSelectReward() {
    if (!this.autoEnabled || !this.rewardUI) return;
    if (!this.rewardUI.container) return;

    // Find all reward cards
    const cards = this.rewardUI.container.querySelectorAll('.reward-card');
    if (cards.length === 0) return;

    // Pick a random card and click it
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    if (randomCard.dataset.key) {
      // Element card
      this.rewardUI.selectElement(randomCard.dataset.key);
    } else if (randomCard.classList.contains('essence-card')) {
      // Essence card
      this.rewardUI.selectEssence();
    }
  }

  // NEW: Auto-allocate unspent focus to random slots
  autoAllocateFocus() {
    if (!this.autoEnabled || !this.fusionUI) return;

    let focusRemaining = this.fusionUI.focusBank;
    const maxIterations = 10; // Prevent infinite loop
    let iterations = 0;

    while (focusRemaining > 0 && iterations < maxIterations) {
      // Pick a random slot (0-3)
      const slotIndex = Math.floor(Math.random() * 4);
      // Allocate one focus to this slot
      this.fusionUI.allocateFocusToSlot(slotIndex);
      focusRemaining--;
      iterations++;
    }
  }

  showNextWaveButton() {
    const nextWaveNumber = this.gameState.waveManager.currentWave + 1;
    this.gameState.showWaveStart();
    this.waveStartButton.show(nextWaveNumber, () => {
      // Ensure any active tutorial callout is removed so it doesn't obscure the canvas during the wave
      try {
        if (this.tutorial && this.tutorial.isActive && this.tutorial.callout) {
          this.tutorial.callout.remove();
        }
      } catch (e) { /* silent fallback */ }

      this.gameState.waveManager.startNextWave();
      this.gameState.startWave();
      try {
        if (this.hud) this.hud.setWave(this.gameState.waveManager.currentWave);
        if (this.hud) this.hud.setEnemies(0);
      } catch (e) {}

      // NEW: Auto-start wave if auto is enabled
      if (this.autoEnabled) {
        setTimeout(() => this.autoStartWave(), 500);
      }
    });
  }

  setupMobileLayoutObserver() {
    this.headerContainer = document.getElementById('canvas-and-spells');
    this.fusionUIContainer = document.getElementById('fusion-ui');
    this.equippedSpellsEl = document.getElementById('equipped-spells');
    this.layoutObserver = createLayoutObserver(this.headerContainer, this.equippedSpellsEl);
  }

  start() {
    this.running = true;
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  gameLoop(currentTime) {
    if (!this.running) return;
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (dt < 0.1) {
      this.update(dt);
      this.render();
    }
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(dt) {
    this.gameState.update(dt);
    this.gameState.updateParticles(dt);
  }

  render() {
    this.renderer.clear(COLORS.background);
    for (const enemy of this.gameState.enemies) this.renderer.renderEnemy(enemy);
    for (const projectile of this.gameState.projectiles) this.renderer.renderProjectile(projectile);
    this.renderer.renderPlayer(this.gameState.player);

    this.fxRenderer.clear();
    for (const projectile of this.gameState.projectiles) this.fxRenderer.renderProjectileAura(projectile);
    for (const aoe of this.gameState.aoeEffects) this.fxRenderer.renderAoECircle(aoe);
    for (const particle of this.gameState.particles) this.fxRenderer.renderParticle(particle);
  }
}