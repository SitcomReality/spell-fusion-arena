import { StepManager } from './tutorial/StepManager.js';
import { Callout } from './tutorial/Callout.js';
import { Positioner } from './tutorial/Positioner.js';

export class Tutorial {
  constructor(gameState, fusionUI) {
    this.gameState = gameState;
    this.fusionUI = fusionUI;
    this.isActive = false;

    // Compose modules
    this.stepManager = new StepManager();
    this.positioner = new Positioner();
    this.callout = new Callout(this.positioner);

    this.currentStep = 0;
    this.currentCallout = null;
    this.highlightedElement = null;
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

    // clean previous
    this.callout.remove();
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }

    const target = document.querySelector(step.targetSelector);
    if (target && !step.isOverlay) {
      this.highlightedElement = target;
      target.classList.add('tutorial-highlight');
    }

    // create callout through Callout module
    this.callout.create(step, this.currentStep, this.stepManager.length(), {
      onNext: () => this.showStep(this.currentStep + 1),
      onPrev: () => this.showStep(Math.max(0, this.currentStep - 1)),
      onClose: () => this.skip()
    }, target);

    this.currentStep = stepIndex;
  }

  nextStep() { this.showStep(this.currentStep + 1); }
  prevStep() { this.showStep(Math.max(0, this.currentStep - 1)); }

  skip() { this.complete(); }

  complete() {
    this.isActive = false;
    this.callout.remove();
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }
    localStorage.setItem('tutorialCompleted', 'true');
  }

  jump(stepId) {
    const idx = this.stepManager.indexOf(stepId);
    if (idx >= 0) this.showStep(idx);
  }

  static hasCompletedTutorial() {
    return localStorage.getItem('tutorialCompleted') === 'true';
  }
}