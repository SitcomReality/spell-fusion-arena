// NEW FILE
import { StepManager } from '../tutorial/StepManager.js';
import { Callout } from './Callout.js';
import { Positioner } from './Positioner.js';

/**
 * High-level controller that encapsulates step progression, callout creation,
 * and basic highlight management. It intentionally avoids locking and completion
 * wiring which are handled by separate modules.
 */
export class TutorialController {
  constructor(gameState, fusionUI) {
    this.gameState = gameState;
    this.fusionUI = fusionUI;

    this.stepManager = new StepManager();
    this.positioner = new Positioner();
    this.callout = new Callout(this.positioner);

    this.currentStep = 0;
    this.highlightedElement = null;
    this.highlightedElements = [];
  }

  initialize() {
    this.stepManager.initialize();
  }

  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.showStep(0);
  }

  showStep(stepIndex) {
    if (stepIndex >= this.stepManager.length()) {
      this.complete();
      return;
    }
    const step = this.stepManager.get(stepIndex);

    // clean previous visuals
    this.callout.remove();
    this._clearHighlights();

    const target = document.querySelector(step.targetSelector);
    if (target && !step.isOverlay) {
      this.highlightedElement = target;
      target.classList.add('tutorial-highlight');
    }

    // Special multi-target highlight for swap buttons
    if (step.id === 'slot-your-spell') {
      const swapButtons = Array.from(document.querySelectorAll('.spell-slot-swap') || []);
      const visible = swapButtons.filter(el => el.offsetParent && el.getClientRects().length > 0);
      visible.forEach(el => el.classList.add('tutorial-highlight'));
      this.highlightedElements = visible;
    }

    this.callout.create(step, stepIndex, this.stepManager.length(), {}, target, false);
    this.currentStep = stepIndex;
  }

  _clearHighlights() {
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }
    if (this.highlightedElements && this.highlightedElements.length) {
      this.highlightedElements.forEach(el => el.classList.remove('tutorial-highlight'));
      this.highlightedElements = [];
    }
  }

  complete() {
    this.isActive = false;
    this.callout.remove();
    this._clearHighlights();
    localStorage.setItem('tutorialCompleted', 'true');
  }

  jump(stepId) {
    const idx = this.stepManager.indexOf(stepId);
    if (idx >= 0) this.showStep(idx);
  }
}