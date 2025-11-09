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
      console.debug('[Tutorial Debug] Completion handler: add-to-fusion fired for stepIndex', stepIndex);
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
      console.debug('[Tutorial Debug] Completion handler: create-spell fired for stepIndex', stepIndex);
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
      console.debug('[Tutorial Debug] Completion handler: equip-spell fired for stepIndex', stepIndex);
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
    // Attach listeners to current swap/empty buttons and log when they fire so we can trace why tutorial isn't completing.
    const swapButtons = Array.from(document.querySelectorAll('.spell-slot-swap') || []);
    const emptyButtons = Array.from(document.querySelectorAll('.spell-slot-empty-btn') || []);

    console.debug('[Tutorial Debug] Registering final-step listeners for stepIndex', stepIndex, 'swapCount', swapButtons.length, 'emptyCount', emptyButtons.length);

    const finishTutorial = (ev) => {
      console.debug('[Tutorial Debug] Final tutorial trigger fired by', ev?.currentTarget?.className || ev?.target || ev);
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
    };

    // Attach listeners
    swapButtons.forEach(btn => btn.addEventListener('click', finishTutorial));
    emptyButtons.forEach(btn => btn.addEventListener('click', finishTutorial));

    // Return cleanup that also logs removal
    const cleanupFinal = () => {
      console.debug('[Tutorial Debug] Cleaning up final-step listeners for stepIndex', stepIndex);
      swapButtons.forEach(btn => btn.removeEventListener('click', finishTutorial));
      emptyButtons.forEach(btn => btn.removeEventListener('click', finishTutorial));
    };
    cleanupFns.push(cleanupFinal);
  } else if (stepIndex === 6) {
    // Focus allocated
    const off = fusionUI.spellSlotsUI.onFocusAllocated(() => {
      console.debug('[Tutorial Debug] Completion handler: allocate-focus fired for stepIndex', stepIndex);
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
    console.debug('[Tutorial Debug] Running cleanup for completion handlers of stepIndex', stepIndex);
    cleanupFns.forEach(fn => { try { if (typeof fn === 'function') fn(); } catch (e) {} });
  };
}