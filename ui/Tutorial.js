import { StepManager } from './tutorial/StepManager.js';
import { Callout } from './tutorial/Callout.js';
import { Positioner } from './tutorial/Positioner.js';

export class Tutorial {
  constructor(gameState, fusionUI) {
    this.gameState = gameState;
    this.fusionUI = fusionUI;
    this.isActive = false;

    this.stepManager = new StepManager();
    this.positioner = new Positioner();
    this.callout = new Callout(this.positioner);

    this.currentStep = 0;
    this.currentCallout = null;
    this.highlightedElement = null;

    // Track step completion handlers
    this.completionHandlers = {};
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

    // Clean previous
    this.callout.remove();
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }

    // Remove old completion handler
    if (this.completionHandlers[this.currentStep]) {
      this.completionHandlers[this.currentStep]();
    }

    // Lock/unlock UI areas based on step
    this.lockUIForStep(stepIndex);

    const target = document.querySelector(step.targetSelector);
    if (target && !step.isOverlay) {
      this.highlightedElement = target;
      target.classList.add('tutorial-highlight');
    }

    // Create callout (without manual prev/next buttons during flow)
    this.callout.create(step, this.currentStep, this.stepManager.length(), 
      { onClose: () => this.skip() }, 
      target,
      false // no manual navigation during tutorial flow
    );

    // Set up completion detection for this step
    this.setupStepCompletion(stepIndex);

    this.currentStep = stepIndex;
  }

  setupStepCompletion(stepIndex) {
    const step = this.stepManager.get(stepIndex);

    if (stepIndex === 0) {
      // Step 0: Select element. Progression is handled in FusionUI.js when an element card is clicked.
    } else if (stepIndex === 1) {
      // Step 1: Add element to fusion - wait for .element-add-btn click
      this.completionHandlers[stepIndex] = this.fusionUI.detailsPanel.onAddButtonClick(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 2) {
      // Step 2: Create spell - wait for .fusion-preview-create click
      this.completionHandlers[stepIndex] = this.fusionUI.fusionPreview.onCreateButtonClick(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 3) {
      // Step 3: Equip spell - wait for spell to be equipped in a slot
      this.completionHandlers[stepIndex] = this.fusionUI.spellSlotsUI.onSpellEquipped(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 4) {
      // Step 4: Start wave - wave-start-panel button will trigger next step (handled by GameApp)
      // Wait for the wave start (which calls waveManager.startNextWave)
    } else if (stepIndex === 5) {
      // Step 5: Reward UI - handled by GameApp's rewardUI when reward is selected
    } else if (stepIndex === 6) {
      // Step 6: Create 2-element spell
      // Wait for exactly 2 elements, then create button becomes enabled
      // When pressed, advance to step 8
      this.completionHandlers[stepIndex] = this.fusionUI.fusionPreview.onCreateButtonClick(() => {
        this.showStep(stepIndex + 1);
      });
    } else if (stepIndex === 7) {
      // Step 7: Allocate focus - wait for .slot-add-focus button click
      this.completionHandlers[stepIndex] = this.fusionUI.spellSlotsUI.onFocusAllocated(() => {
        this.complete();
      });
    }
  }

  lockUIForStep(stepIndex) {
    // Remove all locks first
    document.documentElement.classList.remove(
      'tutorial-lock-to-elements',
      'tutorial-lock-to-elements-details',
      'tutorial-lock-to-fusion-preview',
      'tutorial-lock-to-equipped',
      'tutorial-lock-to-wave',
      'tutorial-lock-to-reward',
      'tutorial-lock-to-fusion-full'
    );

    // Apply appropriate lock based on step
    switch (stepIndex) {
      case 0: // Step 1: Select element (Library/Details Panel open)
        document.documentElement.classList.add('tutorial-lock-to-elements');
        break;
      case 1: // Step 2: Add to fusion (Library/Details Panel open)
        document.documentElement.classList.add('tutorial-lock-to-elements-details');
        break;
      case 2: // Step 3: Create spell (Fusion Preview open)
        document.documentElement.classList.add('tutorial-lock-to-fusion-preview');
        break;
      case 3: // Step 4: Equip spell (Equipped Slots open)
        document.documentElement.classList.add('tutorial-lock-to-equipped');
        break;
      case 4: // Step 5: Start wave (Wave button open)
        document.documentElement.classList.add('tutorial-lock-to-wave');
        break;
      case 5: // Step 6: Reward (Reward UI open)
        document.documentElement.classList.add('tutorial-lock-to-reward');
        break;
      case 6: // Step 7: Create 2-element spell (Fusion area open, strict 2-element rule enforced)
        document.documentElement.classList.add('tutorial-lock-to-fusion-full');
        break;
      case 7: // Step 8: Allocate focus (Equipped Slots open)
        document.documentElement.classList.add('tutorial-lock-to-equipped');
        break;
    }
  }

  skip() {
    this.complete();
  }

  complete() {
    this.isActive = false;
    this.callout.remove();
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }
    // Remove all locks
    document.documentElement.classList.remove(
      'tutorial-lock-to-elements',
      'tutorial-lock-to-elements-details',
      'tutorial-lock-to-fusion-preview',
      'tutorial-lock-to-equipped',
      'tutorial-lock-to-wave',
      'tutorial-lock-to-reward',
      'tutorial-lock-to-fusion-full'
    );
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