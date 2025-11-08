import { CONFIG, COLORS } from './config.js';
import { GameState } from './game/GameState.js';
import { Renderer } from './rendering/Renderer.js';
import { EffectsRenderer } from './rendering/EffectsRenderer.js';
import { FusionUI } from './ui/FusionUI.js';
import { HUD } from './ui/HUD.js';
import { RewardUI } from './ui/RewardUI.js';
import { IntroScreen } from './ui/IntroScreen.js';
import { WaveStartButton } from './ui/WaveStartButton.js';
import { SeededRandom } from './game/SeededRandom.js';
import { ELEMENTS } from './spells/Element.js';

class Game {
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
    this.rng = null; // Seeded RNG for this game session
    
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
    // Create seeded RNG for this game session
    this.rng = new SeededRandom(seed);

    // Derive starting element keys by matching against the known ELEMENTS map
    const startingElementKeys = startingElements.map(elem => {
      for (const [key, el] of Object.entries(ELEMENTS)) {
        if (el === elem) return key;
      }
      return null;
    }).filter(k => k !== null);
    
    this.gameState = new GameState(CONFIG.canvas.width, CONFIG.canvas.height, seed, startingElementKeys);
    
    // Set starting spells from selection
    const startingSpells = startingElements.slice(0, 4);
    this.gameState.player.equipSpells(startingSpells, [1, 0, 0, 0]);

    // Pass the gameState into FusionUI so it can access unlockedElementKeys for the library
    this.fusionUI = new FusionUI((spells, focus) => {
      this.gameState.player.equipSpells(spells, focus);
    }, this.gameState);

    this.rewardUI = new RewardUI((reward) => {
      // Handle chosen reward
      if (reward.type === 'essence') {
        this.fusionUI.addEssenceToBank(reward.amount);
      } else if (reward.type === 'element') {
        this.gameState.unlockElement(reward.key);
        this.fusionUI.refresh();
      }
      this.gameState.resume();
      this.fusionUI.refresh();
      // After reward, show next wave start button
      this.showNextWaveButton();
    }, this.rng, this.gameState);

    // Wave start button
    this.waveStartButton = new WaveStartButton(document.getElementById('canvas-wrapper'));

    // Set up wave complete callback
    this.gameState.waveManager.onWaveComplete((waveNumber) => {
      this.gameState.pause();
      // Automatic rewards: 1 Focus and 1-3 Essence
      const autoFocus = 1;
      const autoEssence = 1 + Math.floor(this.rng.next() * 3); // 1..3 using seeded RNG
      try {
        this.fusionUI.addFocusToBank(autoFocus);
        this.fusionUI.addEssenceToBank(autoEssence);
      } catch (e) { /* silent fallback */ }
      this.rewardUI.show(waveNumber);
    });

    // Show the first wave start button
    this.showNextWaveButton();
    
    this.start();
  }

  showNextWaveButton() {
    const nextWaveNumber = this.gameState.waveManager.currentWave + 1;
    this.gameState.showWaveStart();
    this.waveStartButton.show(nextWaveNumber, () => {
      this.gameState.waveManager.startNextWave();
      this.gameState.startWave();
    });
  }
  
  setupMobileLayoutObserver() {
    this.headerContainer = document.getElementById('canvas-and-spells');
    this.fusionUIContainer = document.getElementById('fusion-ui');
    this.equippedSpellsEl = document.getElementById('equipped-spells');
    
    // Use ResizeObserver to detect the dynamic height of the fixed header region
    // The height changes because the canvas aspect ratio is now square and width is responsive
    this.layoutObserver = new ResizeObserver(entries => {
      // Check if we are in mobile layout (viewport width check)
      if (window.matchMedia("(max-width: 768px)").matches) {
        const entry = entries[0];
        const height = entry.contentRect.height;
        document.documentElement.style.setProperty('--fixed-header-height', `${height}px`);
        // Also compute equipped-spells width and expose to CSS so overlays can avoid it.
        try {
          const eqEl = this.equippedSpellsEl || document.getElementById('equipped-spells');
          if (eqEl) {
            const w = Math.ceil(eqEl.getBoundingClientRect().width);
            document.documentElement.style.setProperty('--equipped-spells-width', `${w}px`);
          } else {
            // fallback
            document.documentElement.style.setProperty('--equipped-spells-width', `56px`);
          }
        } catch (e) {
          document.documentElement.style.setProperty('--equipped-spells-width', `56px`);
        }
      } else {
        // Reset if we are in desktop view
        document.documentElement.style.setProperty('--fixed-header-height', `0px`);
        document.documentElement.style.setProperty('--equipped-spells-width', `0px`);
      }
    });

    if (this.headerContainer) {
      this.layoutObserver.observe(this.headerContainer);
    }
    // Observe equipped-spells for width changes as well (keeps variable in sync)
    if (this.equippedSpellsEl) {
      this.layoutObserver.observe(this.equippedSpellsEl);
    }
  }
  
  start() {
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
    this.hud.update(this.gameState);
  }
  
  render() {
    // Render base game layer
    this.renderer.clear(COLORS.background);
    
    for (const enemy of this.gameState.enemies) {
      this.renderer.renderEnemy(enemy);
    }
    
    for (const projectile of this.gameState.projectiles) {
      this.renderer.renderProjectile(projectile);
    }
    
    this.renderer.renderPlayer(this.gameState.player);
    
    // Render FX layer
    this.fxRenderer.clear();
    
    // Render projectile auras
    for (const projectile of this.gameState.projectiles) {
      this.fxRenderer.renderProjectileAura(projectile);
    }
    
    // Render transient AoE visualizations (distinctive circles)
    for (const aoe of this.gameState.aoeEffects) {
      this.fxRenderer.renderAoECircle(aoe);
    }
    
    // Render all particles
    for (const particle of this.gameState.particles) {
      this.fxRenderer.renderParticle(particle);
    }
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  // Expose for UI components (HUD) to read dynamic values like essenceBank
  window.gameInstance = game;

  // Add press-to-show tooltip behavior for property badges on touch devices
  (function() {
    let activeBadge = null;
    document.addEventListener('touchstart', (ev) => {
      const el = ev.target.closest && ev.target.closest('.property-badge');
      if (el) {
        activeBadge = el;
        el.classList.add('active');
      }
    }, { passive: true });
    const clearActive = () => {
      if (activeBadge) {
        activeBadge.classList.remove('active');
        activeBadge = null;
      }
    };
    document.addEventListener('touchend', clearActive, { passive: true });
    document.addEventListener('touchcancel', clearActive, { passive: true });
    // Support mouse press for accessibility: add mousedown/mouseup toggles
    document.addEventListener('mousedown', (ev) => {
      const el = ev.target.closest && ev.target.closest('.property-badge');
      if (el) el.classList.add('active');
    });
    document.addEventListener('mouseup', () => document.querySelectorAll('.property-badge.active').forEach(e => e.classList.remove('active')));
  })();
});