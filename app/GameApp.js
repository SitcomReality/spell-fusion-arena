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
import { ELEMENTS } from '../spells/Element.js';
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
      this.startGameWithLoadout(config.startingElements, config.seed);
    });
    introScreen.show();
  }

  startGameWithLoadout(startingElements, seed) {
    // Accept either positional args (old callers) or a single config object from IntroScreen load flow.
    let cfg = null;
    if (startGameWithLoadout && typeof startGameWithLoadout === 'object' && startGameWithLoadout.startingElements !== undefined) {
      // defensive - not used, fallback below
    }
    if (typeof startingElements === 'object' && startingElements !== null && startingElements.startingElements !== undefined) {
      cfg = startingElements;
    } else {
      cfg = { startingElements: startingElements || [], seed: seed };
    }

    // Clean up previous game if any
    this.cleanupGame();

    this.rng = new SeededRandom(cfg.seed);

    const startingElementKeys = (cfg.startingElements || []).map(elem => {
      for (const [key, el] of Object.entries(ELEMENTS)) {
        if (el === elem) return key;
      }
      return null;
    }).filter(k => k !== null);

    this.gameState = new GameState(CONFIG.canvas.width, CONFIG.canvas.height, cfg.seed, startingElementKeys);

    const startingSpells = startingElements.slice(0, 4);
    this.gameState.player.equipSpells(startingSpells, [1, 0, 0, 0]);

    this.fusionUI = new FusionUI((spells, focus) => {
      this.gameState.player.equipSpells(spells, focus);
    }, this.gameState);

    // If a saved payload was provided, apply it now to fully restore game UI/state
    try {
      const payload = cfg.savedPayload || null;
      if (payload) {
        // unlocked elements
        if (Array.isArray(payload.unlockedElementKeys)) {
          this.gameState.unlockedElementKeys = [...payload.unlockedElementKeys];
        }

        // Essence & Focus banks
        if (this.fusionUI) {
          if (typeof payload.essenceBank === 'number') this.fusionUI.essenceBank = payload.essenceBank;
          if (typeof payload.focusBank === 'number') this.fusionUI.focusBank = payload.focusBank;
        }

        // Spell inventory
        if (Array.isArray(payload.spellInventory) && this.fusionUI) {
          // Best-effort: accept saved spells as-is (they should already be serializable objects)
          this.fusionUI.spellInventory = payload.spellInventory.slice();
        }

        // Equipped spells and slot focus
        if (Array.isArray(payload.equippedSpells) && this.fusionUI) {
          // equippedSpells may contain nulls or spell objects; assign directly but ensure array length 4
          const eq = payload.equippedSpells.slice(0, 4);
          while (eq.length < 4) eq.push(null);
          this.fusionUI.equippedSpells = eq;
        }
        if (Array.isArray(payload.spellSlotFocus) && this.fusionUI) {
          const sf = payload.spellSlotFocus.slice(0, 4);
          while (sf.length < 4) sf.push(0);
          this.fusionUI.spellSlotFocus = sf;
          // Also push into player so firing intervals are correct
          this.gameState.player.spellSlotFocus = sf;
          this.gameState.player.calculateCastIntervals();
        }

        // Player HP
        if (typeof payload.playerHp === 'number') {
          this.gameState.player.hp = payload.playerHp;
        }

        // Wave number (restore to that wave so HUD shows correct next-wave)
        if (typeof payload.wave === 'number' && this.gameState.waveManager) {
          this.gameState.waveManager.currentWave = payload.wave;
        }
      }
    } catch (e) {
      console.warn('Failed to apply saved payload during load:', e);
    }

    // Initialize tutorial
    this.tutorial = new Tutorial(this.gameState, this.fusionUI);
    this.tutorial.initialize();

    // Initialize speed control
    this.speedControl = new SpeedControl((speed) => {
      this.gameState.setSpeedMultiplier(speed);
    });
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
        this.hud.setEssence(this.fusionUI.essenceBank || 0);
        this.hud.setFocus(this.fusionUI.focusBank || 0);
      }
    } catch (e) {}

    this.showNextWaveButton();

    // Always start the tutorial for each new game (even if previously completed)
    setTimeout(() => {
      this.tutorial.start();
    }, 300);

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