import { TutorialController } from './tutorial/TutorialController.js';
import { LockManager } from './tutorial/LockManager.js';
import { setupCompletionForStep } from './tutorial/CompletionHandlers.js';

export class Tutorial {
  constructor(gameState, fusionUI) {
    this.gameState = gameState;
    this.fusionUI = fusionUI;

    // Delegate to the new controller for callouts/highlights/step manager
    this.controller = new TutorialController(gameState, fusionUI);

    // Expose the controller's StepManager so external components (e.g. WaveStartButton)
    // can query step indices like 'start-wave' to determine whether the tutorial is blocking.
    this.stepManager = this.controller.stepManager;
    // Expose the active callout so external systems (GameApp / WaveStartButton) can remove it when needed.
    this.callout = this.controller.callout;

    this.currentStep = 0;
    this._completionCleanup = null;
  }

  initialize() {
    this.controller.initialize();
  }

  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.showStep(0);
    console.log('TUTORIAL: Started.');
  }

  showStep(stepIndex) {
    const step = this.controller.stepManager.get(stepIndex);
    const stepId = step ? step.id : 'COMPLETED';
    console.log(`TUTORIAL: Showing step index ${stepIndex}. ID: ${stepId}`);
    // clear previous completion handlers
    if (this._completionCleanup) {
      try { this._completionCleanup(); } catch (e) {}
      this._completionCleanup = null;
    }

    // Apply UI locks centrally
    LockManager.applyForStep(stepIndex);

    // Show visuals and callout via controller
    this.controller.showStep(stepIndex);

    // Wire completion handlers for this step
    this._completionCleanup = setupCompletionForStep(stepIndex, this.controller, this.fusionUI);

    this.currentStep = stepIndex;
  }

  jump(stepId) {
    const idx = this.stepManager.indexOf(stepId);
    if (idx >= 0) this.showStep(idx);
  }

  skip() {
    this.complete();
  }

  complete() {
    this.isActive = false;
    this.controller.complete();
    LockManager.clearAll();
    if (this._completionCleanup) {
      try { this._completionCleanup(); } catch (e) {}
      this._completionCleanup = null;
    }
  }

  static hasCompletedTutorial() {
    return localStorage.getItem('tutorialCompleted') === 'true';
  }
}