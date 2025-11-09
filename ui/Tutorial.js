export class Tutorial {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.isFirstGame = true;
    this.overlay = null;
    this.pausedGameState = null;
    this.highlightedElements = new Set();
  }

  start(gameState) {
    if (!this.isFirstGame) return;
    this.isActive = true;
    this.pausedGameState = gameState;
    this.currentStep = 0;
    this.showStep(0);
  }

  showStep(stepNumber) {
    this.currentStep = stepNumber;
    const steps = this.getSteps();

    if (stepNumber >= steps.length) {
      this.complete();
      return;
    }

    const step = steps[stepNumber];
    this.renderStep(step, stepNumber);
  }

  getSteps() {
    return [
      {
        id: 'select-element',
        title: 'Select an Element',
        description: 'Click on an element to add it to your spell. Different elements have unique properties that will influence your spell\'s behavior — like damage, speed, and special effects.',
        highlightSelector: '.element-card',
        action: 'click',
        pauseGame: true
      },
      {
        id: 'fusion-slot',
        title: 'Add to Fusion Slot',
        description: 'The element you selected has been added to the fusion builder. You can add up to 4 elements to create more powerful spells.',
        highlightSelector: '.fusion-slot',
        action: 'auto',
        pauseGame: false,
        delayMs: 1000
      },
      {
        id: 'create-spell',
        title: 'Create Your Spell',
        description: 'Click \"Create\" to fuse these elements into a spell. The cost in Mana Essence depends on how many elements you use: 1 element = 1 Essence, 2 elements = 5, 3 elements = 10, 4 elements = 20.',
        highlightSelector: '.fusion-preview-create',
        action: 'click',
        pauseGame: false
      },
      {
        id: 'spell-slot',
        title: 'Equip Your Spell',
        description: 'Your created spell is ready to equip! Click the \"+\" button on any spell slot to add it. You can swap any spell into any slot at any time during the game.',
        highlightSelector: '.spell-slot-empty-btn',
        action: 'click',
        pauseGame: false
      },
      {
        id: 'wave-start',
        title: 'Start the Wave',
        description: 'When you\'re ready, click \"Start Wave\" to begin the first wave of enemies. Your equipped spells will fire automatically at nearby enemies.',
        highlightSelector: '.wave-start-button',
        action: 'click',
        pauseGame: false
      },
      {
        id: 'wave-complete',
        title: 'Wave Complete!',
        description: 'Excellent! You\'ve defeated the first wave. You earned 1 Focus and 5 Mana Essence as a reward. Focus is used to upgrade spell slots for increased fire rate.',
        highlightSelector: '.reward-card',
        action: 'click',
        pauseGame: true
      },
      {
        id: 'two-element-fusion',
        title: 'Create a Two-Element Spell',
        description: 'Now you have enough Mana Essence to create multi-element spells. Try adding 2 elements to your fusion slots (costs 5 Essence) to see how their properties combine and create unique effects.',
        highlightSelector: '.fusion-slot',
        action: 'auto',
        pauseGame: false,
        delayMs: 1500
      },
      {
        id: 'focus-upgrade',
        title: 'Upgrade a Spell Slot',
        description: 'You have unspent Focus! Click the \"+\" button next to any spell slot\'s focus number to spend it and increase that slot\'s fire rate. Higher fire rate = more projectiles per second.',
        highlightSelector: '.slot-add-focus',
        action: 'click',
        pauseGame: false
      }
    ];
  }

  renderStep(step, stepNumber) {
    // Remove old overlay if exists
    if (this.overlay) {
      this.overlay.remove();
    }

    // Create new overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.id = `tutorial-step-${stepNumber}`;

    const panel = document.createElement('div');
    panel.className = 'tutorial-panel';
    panel.innerHTML = `
      <div class="tutorial-header">
        <h2>${step.title}</h2>
        <span class="tutorial-step-counter">${stepNumber + 1} / 8</span>
      </div>
      <p class="tutorial-description">${step.description}</p>
      <div class="tutorial-controls">
        ${stepNumber > 0 ? '<button class="tutorial-btn tutorial-btn-back">Back</button>' : ''}
        ${stepNumber < 7 ? '<button class="tutorial-btn tutorial-btn-skip">Skip Tutorial</button>' : ''}
        <button class="tutorial-btn tutorial-btn-next">${stepNumber === 7 ? 'Finish' : 'Next'}</button>
      </div>
    `;

    this.overlay.appendChild(panel);
    document.body.appendChild(this.overlay);

    // Wire up controls
    const nextBtn = panel.querySelector('.tutorial-btn-next');
    const skipBtn = panel.querySelector('.tutorial-btn-skip');
    const backBtn = panel.querySelector('.tutorial-btn-back');

    nextBtn.addEventListener('click', () => {
      // Always advance when Next is clicked.
      // Preserve existing behavior where a user interaction can also auto-advance earlier:
      if (step.action === 'click') {
        // If target elements exist, keep listening so a user interaction can auto-advance sooner.
        try {
          const elements = document.querySelectorAll(step.highlightSelector);
          if (elements && elements.length > 0) {
            this.waitForElementInteraction(step.highlightSelector, () => {
              // Only auto-advance if the overlay still exists and we are still on this step.
              if (this.currentStep === stepNumber) this.showStep(stepNumber + 1);
            });
          }
        } catch (e) { /* ignore if selector invalid */ }
      }
      // Regardless of required action, advance when Next is explicitly clicked.
      this.showStep(stepNumber + 1);
    });

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.complete();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.showStep(stepNumber - 1);
      });
    }

    // Highlight elements
    this.highlightElements(step.highlightSelector);

    // If auto-advance, move to next step after delay
    if (step.action === 'auto' && step.delayMs) {
      setTimeout(() => {
        const nextBtn = panel.querySelector('.tutorial-btn-next');
        if (nextBtn && this.overlay && this.overlay.parentNode) {
          nextBtn.click();
        }
      }, step.delayMs);
    }

    // Pause game if needed
    if (step.pauseGame && this.pausedGameState) {
      this.pausedGameState.pause();
    }
  }

  highlightElements(selector) {
    // Remove previous highlights
    this.highlightedElements.forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    this.highlightedElements.clear();

    // Add new highlights
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('tutorial-highlight');
      this.highlightedElements.add(el);
    });
  }

  waitForElementInteraction(selector, callback) {
    const elements = document.querySelectorAll(selector);
    const handler = () => {
      elements.forEach(el => el.removeEventListener('click', handler));
      callback();
    };
    elements.forEach(el => el.addEventListener('click', handler));
  }

  complete() {
    this.isActive = false;
    this.isFirstGame = false;

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    this.highlightedElements.forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    this.highlightedElements.clear();

    if (this.pausedGameState) {
      this.pausedGameState.resume();
    }

    // Store in localStorage that tutorial is complete
    try {
      localStorage.setItem('tutorialComplete', 'true');
    } catch (e) { /* silent */ }
  }

  nextStep() {
    this.showStep(this.currentStep + 1);
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
}