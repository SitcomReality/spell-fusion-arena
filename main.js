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
import { GameApp } from './app/GameApp.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new GameApp();
  // Expose for UI components (HUD) to read dynamic values like essenceBank
  window.gameInstance = game;
});