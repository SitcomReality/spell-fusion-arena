import { CONFIG, COLORS } from '../config.js';
import { ELEMENTS_READY } from '../spells/Element.js';
import { GameCore } from './GameCore.js';
import { IntroScreen } from '../ui/IntroScreen.js';

export class GameApp {
  constructor() {
    // Keep this file lightweight: it just boots the Intro screen and hands control
    // to GameCore which contains the main game logic.
    this.core = null;
    document.addEventListener('DOMContentLoaded', () => {
      // Ensure elements are ready before showing intro
      ELEMENTS_READY.then(() => {
        this.showIntroScreen();
      }).catch(() => {
        this.showIntroScreen();
      });
    });
  }

  showIntroScreen() {
    const introScreen = new IntroScreen((config) => {
      // When intro decides to start a game, create the core and start it.
      if (!this.core) this.core = new GameCore();
      this.core.startFromConfig(config);
    });
    introScreen.show();
  }
}