export class Tutorial {
  constructor(gameState, fusionUI) {
    this.gameState = gameState;
    this.fusionUI = fusionUI;
    this.currentStep = 0;
    this.isActive = false;
    this.steps = [];
    this.currentCallout = null;
    this.highlightedElement = null;
  }

  initialize() {
    // Define tutorial steps in sequence
    this.steps = [
      {
        id: 'select-element',
        title: 'Select an Element',
        description: 'Click an element to see its properties. Elements have different abilities they can contribute to your spell.',
        targetSelector: '.elements-library .element-card',
        position: 'right'
      },
      {
        id: 'add-to-fusion',
        title: 'Add to Fusion Slot',
        description: 'The selected element appears here. You can add up to 4 elements to create more powerful spells.',
        targetSelector: '.fusion-slot',
        position: 'bottom'
      },
      {
        id: 'create-spell',
        title: 'Create Your Spell',
        description: 'Once you\'ve selected elements, click Create to forge your spell. The cost in Mana Essence is shown on the button.',
        targetSelector: '.fusion-preview-create',
        position: 'top'
      },
      {
        id: 'equip-spell',
        title: 'Equip Your Spell',
        description: 'Your created spells appear here. Click the + button in a spell slot to equip one. You can swap spells between slots anytime.',
        targetSelector: '.spell-slot-empty-btn',
        position: 'bottom'
      },
      {
        id: 'start-wave',
        title: 'Ready to Battle',
        description: 'Start the wave when you\'re ready. Defeat all enemies to progress.',
        targetSelector: '.wave-start-button',
        position: 'top'
      },
      {
        id: 'wave-complete',
        title: 'Wave Complete!',
        description: 'You\'ve earned 1 Focus and Mana Essence. Use Essence to create stronger spells.',
        targetSelector: '#reward-overlay',
        position: 'center',
        isOverlay: true
      },
      {
        id: 'two-element-fusion',
        title: 'Create a 2-Element Spell',
        description: 'Now create a spell using 2 elements (costs 5 Mana Essence). This unlocks more power combinations.',
        targetSelector: '.fusion-slots',
        position: 'bottom'
      },
      {
        id: 'allocate-focus',
        title: 'Upgrade a Spell Slot',
        description: 'Click the + button on a spell slot header to spend your Focus. This upgrades the slot and boosts damage.',
        targetSelector: '.slot-add-focus',
        position: 'bottom'
      }
    ];
  }

  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.showStep(0);
  }

  showStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      this.complete();
      return;
    }

    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];

    // Remove previous callout
    if (this.currentCallout) {
      this.currentCallout.remove();
      this.currentCallout = null;
    }

    // Remove previous highlight
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }

    // Find target element
    const target = document.querySelector(step.targetSelector);
    if (target && !step.isOverlay) {
      this.highlightedElement = target;
      target.classList.add('tutorial-highlight');
    }

    // Create callout
    this.createCallout(step, target);
  }

  createCallout(step, target) {
    const callout = document.createElement('div');
    callout.className = 'tutorial-callout';
    callout.dataset.position = step.position;
    
    // Determine placement. For the initial "select-element" step ensure the
    // callout does NOT cover the elements library: on desktop place it to the LEFT,
    // on very small screens (<480px) place it TOP (above) so it sits over the canvas.
    let placement = step.position || 'right';
    if (step.id === 'select-element') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
          placement = 'top';
        } else {
          placement = 'left';
        }
      } catch (e) {
        placement = 'left';
      }
    }
    callout.dataset.position = placement;

    const content = document.createElement('div');
    content.className = 'tutorial-callout-content';
    content.innerHTML = `
      <div class="tutorial-callout-header">
        <h3>${step.title}</h3>
        <button class="tutorial-close" aria-label="Close tutorial">×</button>
      </div>
      <p>${step.description}</p>
      <div class="tutorial-callout-controls">
        <button class="tutorial-prev">← Back</button>
        <div class="tutorial-progress">${this.currentStep + 1} / ${this.steps.length}</div>
        <button class="tutorial-next">Next →</button>
      </div>
    `;

    callout.appendChild(content);

    // Position the callout
    if (target && !step.isOverlay) {
      this.positionCallout(callout, target, step.position);
    } else {
      // Center for overlay steps
      callout.classList.add('tutorial-overlay-callout');
    }

    // Wire up controls
    callout.querySelector('.tutorial-close').addEventListener('click', () => this.skip());
    callout.querySelector('.tutorial-prev').addEventListener('click', () => this.prevStep());
    callout.querySelector('.tutorial-next').addEventListener('click', () => this.nextStep());

    document.body.appendChild(callout);
    this.currentCallout = callout;
  }

  positionCallout(callout, target, position) {
    const rect = target.getBoundingClientRect();
    const calloutRect = callout.getBoundingClientRect();
    const gap = 12;
    let top, left;

    switch (position) {
      case 'top':
        top = rect.top - calloutRect.height - gap;
        left = rect.left + (rect.width - calloutRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + (rect.width - calloutRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - calloutRect.height) / 2;
        left = rect.left - calloutRect.width - gap;
        break;
      case 'right':
        top = rect.top + (rect.height - calloutRect.height) / 2;
        left = rect.right + gap;
        break;
      default:
        top = rect.top;
        left = rect.left;
    }

    callout.style.position = 'fixed';
    callout.style.top = `${Math.max(10, top)}px`;
    callout.style.left = `${Math.max(10, Math.min(window.innerWidth - calloutRect.width - 10, left))}px`;
  }

  nextStep() {
    this.showStep(this.currentStep + 1);
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  skip() {
    this.complete();
  }

  complete() {
    this.isActive = false;
    if (this.currentCallout) {
      this.currentCallout.remove();
      this.currentCallout = null;
    }
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }
    localStorage.setItem('tutorialCompleted', 'true');
  }

  jump(stepId) {
    const idx = this.steps.findIndex(s => s.id === stepId);
    if (idx >= 0) {
      this.showStep(idx);
    }
  }

  static hasCompletedTutorial() {
    return localStorage.getItem('tutorialCompleted') === 'true';
  }
}