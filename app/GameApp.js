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
    this.rng = null;
    this.tutorial = new Tutorial();

    this.lastTime = 0;
    this.running = true;

    this.setupMobileLayoutObserver();

    // Show intro screen
    this.showIntroScreen();
  }

  showIntroScreen() {
    const introScreen = new IntroScreen((config) => {
      this.startGameWithLoadout(config.startingElements, config.seed);
    });
    introScreen.show();
  }

  startGameWithLoadout(startingElements, seed) {
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

    this.rewardUI = new RewardUI((reward) => {
      if (reward.type === 'essence') {
        this.fusionUI.addEssenceToBank(reward.amount);
      } else if (reward.type === 'element') {
        this.gameState.unlockElement(reward.key);
        this.fusionUI.refresh();
      }
      this.gameState.resume();
      this.fusionUI.refresh();
      this.showNextWaveButton();
    }, this.rng, this.gameState);

    this.waveStartButton = new WaveStartButton(document.getElementById('canvas-wrapper'));

    // Start tutorial if this is the first game
    if (this.tutorial.isFirstGame) {
      // Delay tutorial start to let UI render
      setTimeout(() => {
        this.tutorial.start(this.gameState);
      }, 500);
    }

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