// NEW FILE
/**
 * Responsible for applying and clearing tutorial-related UI locks (CSS classes).
 * Centralizing lock logic makes the main tutorial flow easier to reason about.
 */
export const LockManager = {
  clearAll() {
    document.documentElement.classList.remove(
      'tutorial-lock-to-elements',
      'tutorial-lock-to-elements-details',
      'tutorial-lock-to-fusion-preview',
      'tutorial-lock-to-equipped',
      'tutorial-lock-to-wave',
      'tutorial-lock-to-reward',
      'tutorial-lock-to-fusion-full'
    );
  },

  applyForStep(stepIndex) {
    // Clear first
    this.clearAll();
    switch (stepIndex) {
      case 0:
        document.documentElement.classList.add('tutorial-lock-to-elements');
        break;
      case 1:
        document.documentElement.classList.add('tutorial-lock-to-elements-details');
        break;
      case 2:
        document.documentElement.classList.add('tutorial-lock-to-fusion-preview');
        break;
      case 3:
        document.documentElement.classList.add('tutorial-lock-to-equipped');
        break;
      case 4:
        document.documentElement.classList.add('tutorial-lock-to-wave');
        break;
      case 5:
        document.documentElement.classList.add('tutorial-lock-to-fusion-full');
        break;
      case 6:
      case 7:
        document.documentElement.classList.add('tutorial-lock-to-equipped');
        break;
      default:
        break;
    }
  }
};