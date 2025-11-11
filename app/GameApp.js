import { CONFIG, COLORS } from '../config.js';
import { GameState } from '../game/GameState.js';
import { Renderer } from '../rendering/Renderer.js';
import { EffectsRenderer } from '../rendering/EffectsRenderer.js';
import { SeededRandom } from '../game/SeededRandom.js';
import { ELEMENTS, ELEMENTS_READY } from '../spells/Element.js';
import { createLayoutObserver } from './LayoutObserver.js';
import { GameOverUI } from '../ui/GameOverUI.js';
import { Tutorial } from '../ui/Tutorial.js';
import { createHUD, createSpeedControl, createFusionUI, createRewardUI, createWaveStartButton } from './UISetup.js';
import { saveGameSnapshot, loadGameSnapshot } from './SaveManager.js';
import { AutoManager } from './AutoManager.js';

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
    this.hud = createHUD();
    this.fusionUI = null;
    this.rewardUI = null;
    this.waveStartButton = null;
    this.gameOverUI = null;
    this.speedControl = null;
    this.rng = null;
    this.tutorial = null;
    this.autoEnabled = false;

    this.autoManager = new AutoManager(this);

    this.lastTime = 0;
    this.running = true;

    this.setupMobileLayoutObserver();

    // Expose save helper for UI modules to call when they mutate state
    window.saveGame = this.saveGameState?.bind(this) || (() => {});

    // Show intro screen
    this.showIntroScreen();
  }

  saveGameState() {
    saveGameSnapshot(this);
  }

  showIntroScreen() {
    const IntroScreen = (async () => (await import('../ui/IntroScreen.js')).IntroScreen)();
    Promise.resolve(IntroScreen).then((IS) => {
      const intro = new IS((config) => {
        const savedState = config.savedState || null;
        this.startGameWithLoadout(
          config.startingElements, 
          config.seed,
          savedState
        );
      });
      intro.show();
    });
  }

  async startGameWithLoadout(startingElements, seed, savedState) {
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

    this.fusionUI = createFusionUI((spells, focus) => {
      this.gameState.player.equipSpells(spells, focus);
    }, this.gameState);

    if (savedState) {
      try { await ELEMENTS_READY; } catch (e) {}
      if (savedState.unlockedElementKeys && Array.isArray(savedState.unlockedElementKeys)) {
        this.gameState.unlockedElementKeys = [...savedState.unlockedElementKeys];
      }
      this.fusionUI.essenceBank = savedState.essenceBank || 0;
      this.fusionUI.focusBank = savedState.focusBank || 0;
      if (savedState.spellInventory && Array.isArray(savedState.spellInventory)) {
        this.fusionUI.spellInventory = [...savedState.spellInventory];
      }
      if (savedState.equippedSpells && Array.isArray(savedState.equippedSpells)) {
        this.fusionUI.equippedSpells = [...savedState.equippedSpells];
      }
      if (savedState.spellSlotFocus && Array.isArray(savedState.spellSlotFocus)) {
        this.fusionUI.spellSlotFocus = [...savedState.spellSlotFocus];
      }
      if (savedState.equippedSpells) {
        this.gameState.player.equipSpells(savedState.equippedSpells, savedState.spellSlotFocus || [1, 0, 0, 0]);
      }
      if (typeof savedState.wave === 'number') {
        this.gameState.waveManager.currentWave = Math.max(0, Math.floor(savedState.wave));
      }
      try { this.fusionUI.refresh(); } catch (e) { console.warn('Failed to refresh FusionUI after loading', e); }
    }

    if (!savedState) {
      this.tutorial = new Tutorial(this.gameState, this.fusionUI);
      this.tutorial.initialize();
    } else {
      try { localStorage.setItem('tutorialCompleted', 'true'); } catch (e) {}
      this.tutorial = null;
    }

    // Initialize UI controls
    this.speedControl = createSpeedControl(
      (speed) => { this.gameState.setSpeedMultiplier(speed); },
      (autoEnabled) => {
        this.autoEnabled = autoEnabled;
        if (autoEnabled) {
          if (this.rewardUI && this.rewardUI.container) {
            this.autoManager.autoSelectRewardIfAvailable();
          } else if (this.gameState && this.gameState.waveStartPending) {
            this.autoManager.autoAllocateFocusOnce();
            this.autoManager.autoStartWaveIfPending();
          }
        }
      },
      document.getElementById('canvas-wrapper')
    );

    if (this.tutorial) this.speedControl.setAutoVisible(false); else this.speedControl.setAutoVisible(true);

    this.rewardUI = createRewardUI((reward) => {
      if (reward.type === 'essence') this.fusionUI.addEssenceToBank(reward.amount);
      else if (reward.type === 'element') {
        this.gameState.unlockElement(reward.key);
        this.fusionUI.refresh();
      }
      this.gameState.resume();
      this.fusionUI.refresh();
      try { if (this.fusionUI && this.fusionUI.container) this.fusionUI.container.scrollTo?.({ top: 0, behavior: 'smooth' }); } catch (e) {}
      if (this.tutorial && this.tutorial.isActive && this.gameState.waveManager.currentWave === 1) {
        setTimeout(() => { this.tutorial.jump('two-element-fusion'); }, 500);
      }
      this.showNextWaveButton();
    }, this.rng, this.gameState);

    this.waveStartButton = createWaveStartButton(document.getElementById('canvas-wrapper'));

    this.gameState.waveManager.onWaveComplete((waveNumber) => {
      this.gameState.pause();
      try { this.fusionUI.addFocusToBank(1); this.fusionUI.addEssenceToBank(1 + Math.floor(this.rng.next() * 3)); } catch (e) {}
      this.rewardUI.show(waveNumber);
      if (this.autoEnabled) setTimeout(() => this.autoManager.autoSelectRewardIfAvailable(), 200);
    });

    this.gameState.onGameOver = () => this.handleGameOver();

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

    if (this.tutorial) setTimeout(() => this.tutorial.start(), 300);

    this.start();
  }

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

  cleanupGame() {
    this.running = false;
    if (this.gameOverUI) { this.gameOverUI.hide(); this.gameOverUI = null; }
    if (this.waveStartButton) { this.waveStartButton.hide(); this.waveStartButton = null; }
    if (this.rewardUI) { this.rewardUI.hide(); this.rewardUI = null; }
    if (this.speedControl) {
      try { if (this.speedControl.element && this.speedControl.element.parentNode) this.speedControl.element.remove(); } catch (e) {}
      this.speedControl = null;
    }
    if (this.renderer) this.renderer.clear(COLORS.background);
    if (this.fxRenderer) this.fxRenderer.clear();
  }

  autoStartWave() { this.autoManager.autoStartWaveIfPending(); }
  autoSelectReward() { this.autoManager.autoSelectRewardIfAvailable(); }
  autoAllocateFocus() { this.autoManager.autoAllocateFocusOnce(); }

  setupMobileLayoutObserver() {
    this.headerContainer = document.getElementById('canvas-and-spells');
    this.fusionUIContainer = document.getElementById('fusion-ui');
    this.equippedSpellsEl = document.getElementById('equipped-spells');
    this.layoutObserver = createLayoutObserver(this.headerContainer, this.equippedSpellsEl);
  }

  showNextWaveButton() {
    const nextWaveNumber = this.gameState.waveManager.currentWave + 1;
    this.gameState.showWaveStart();
    this.waveStartButton.show(nextWaveNumber, () => {
      try { if (this.tutorial && this.tutorial.isActive && this.tutorial.callout) this.tutorial.callout.remove(); } catch (e) {}
      this.gameState.waveManager.startNextWave();
      this.gameState.startWave();
      try { if (this.hud) this.hud.setWave(this.gameState.waveManager.currentWave); if (this.hud) this.hud.setEnemies(0); } catch (e) {}
    });
    if (this.autoEnabled) setTimeout(() => this.autoManager.autoStartWaveIfPending(), 100);
  }

  start() {
    this.running = true;
    requestAnimationFrame((time) => { this.lastTime = time; this.gameLoop(time); });
  }

  gameLoop(currentTime) {
    if (!this.running) return;
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (dt < 0.1) { this.update(dt); this.render(); }
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(dt) {
    if (this.gameState) this.gameState.update(dt);
    if (this.gameState) this.gameState.updateParticles(dt);
  }

  render() {
    this.renderer.clear(COLORS.background);
    for (const enemy of (this.gameState.enemies || [])) this.renderer.renderEnemy(enemy);
    for (const projectile of (this.gameState.projectiles || [])) this.renderer.renderProjectile(projectile);
    this.renderer.renderPlayer(this.gameState.player);
    this.fxRenderer.clear();
    for (const projectile of (this.gameState.projectiles || [])) this.fxRenderer.renderProjectileAura(projectile);
    for (const aoe of (this.gameState.aoeEffects || [])) this.fxRenderer.renderAoECircle(aoe);
    for (const particle of (this.gameState.particles || [])) this.fxRenderer.renderParticle(particle);
  }
}