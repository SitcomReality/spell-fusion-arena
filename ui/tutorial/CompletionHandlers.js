// NEW FILE
import { LockManager } from './LockManager.js';

/**
 * Wires "when this step completes" handlers to external UI components (FusionUI, SpellSlotsUI, etc.)
 * Returns cleanup functions for each registration so the controller can remove previous handlers.
 */
export function setupCompletionForStep(stepIndex, controller, fusionUI) {
  const cleanupFns = [];

  // Step mapping is kept minimal: handlers return a cleanup function (or noop)
  if (stepIndex === 1) {
    // wait for Add button in ElementDetailsPanel
    const off = fusionUI.detailsPanel.onAddButtonClick(() => {
      controller.showStep(stepIndex + 1);
      // Ensure the global UI lock advances as well so interactions are properly updated
      try { LockManager.applyForStep(stepIndex + 1); } catch (e) {}
      // Keep the top-level Tutorial.currentStep in sync (used by external UI like WaveStartButton)
      try {
        if (window && window.gameInstance && window.gameInstance.tutorial) {
          window.gameInstance.tutorial.currentStep = stepIndex + 1;
        }
      } catch (e) {}
    });
    cleanupFns.push(off);
  } else if (stepIndex === 2 || stepIndex === 5) {
    // Create button in FusionPreview
    const off = fusionUI.fusionPreview.onCreateButtonClick(() => {
      controller.showStep(stepIndex + 1);
      try { LockManager.applyForStep(stepIndex + 1); } catch (e) {}
      try {
        if (window && window.gameInstance && window.gameInstance.tutorial) {
          window.gameInstance.tutorial.currentStep = stepIndex + 1;
        }
      } catch (e) {}
    });
    cleanupFns.push(off);
  } else if (stepIndex === 3) {
    // Spell equipped event (intermediate equip step) -> advance normally
    const off = fusionUI.spellSlotsUI.onSpellEquipped(() => {
      controller.showStep(stepIndex + 1);
      try { LockManager.applyForStep(stepIndex + 1); } catch (e) {}
      try {
        if (window && window.gameInstance && window.gameInstance.tutorial) {
          window.gameInstance.tutorial.currentStep = stepIndex + 1;
        }
      } catch (e) {}
    });
    cleanupFns.push(off);
  } else if (stepIndex === 7) {
    // FINAL: Tutorial ends when player clicks swap or empty button to slot their new spell
    const cleanupSwapClick = () => {
      const swapButtons = document.querySelectorAll('.spell-slot-swap');
      const emptyButtons = document.querySelectorAll('.spell-slot-empty-btn');
      
      const finishTutorial = () => {
        try {
          if (controller && typeof controller.complete === 'function') controller.complete();
        } catch (e) {}
        try { LockManager.clearAll(); } catch (e) {}
        try {
          if (window && window.gameInstance && window.gameInstance.tutorial) {
            window.gameInstance.tutorial.isActive = false;
            window.gameInstance.tutorial.currentStep = -1;
          }
        } catch (e) {}
        // Remove all listeners
        swapButtons.forEach(btn => btn.removeEventListener('click', finishTutorial));
        emptyButtons.forEach(btn => btn.removeEventListener('click', finishTutorial));
      };
      
      swapButtons.forEach(btn => btn.addEventListener('click', finishTutorial));
      emptyButtons.forEach(btn => btn.addEventListener('click', finishTutorial));
      
      return () => {
        swapButtons.forEach(btn => btn.removeEventListener('click', finishTutorial));
        emptyButtons.forEach(btn => btn.removeEventListener('click', finishTutorial));
      };
    };
    cleanupFns.push(cleanupSwapClick());
  } else if (stepIndex === 6) {
    // Focus allocated
    const off = fusionUI.spellSlotsUI.onFocusAllocated(() => {
      controller.showStep(stepIndex + 1);
      try { LockManager.applyForStep(stepIndex + 1); } catch (e) {}
      try {
        if (window && window.gameInstance && window.gameInstance.tutorial) {
          window.gameInstance.tutorial.currentStep = stepIndex + 1;
        }
      } catch (e) {}
    });
    cleanupFns.push(off);
  }

  // Return a single cleanup function that will remove all listeners registered here.
  return () => {
    cleanupFns.forEach(fn => { try { if (typeof fn === 'function') fn(); } catch (e) {} });
  };
}