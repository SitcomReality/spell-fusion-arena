// NEW FILE
import { LockManager } from './LockManager.js';

/**
 * Wires "when this step completes" handlers to external UI components (FusionUI, SpellSlotsUI, etc.)
 * Returns cleanup functions for each registration so the controller can remove previous handlers.
 */
export function setupCompletionForStep(stepIndex, controller, fusionUI) {
  const cleanupFns = [];

  // Helper to trigger the full progression pipeline (logs, locks, new handlers)
  const advanceTutorial = (nextStepIndex) => {
    try {
      const tut = window.gameInstance.tutorial;
      if (tut && tut.isActive) {
        // Use the Tutorial instance's showStep method to ensure logging, lock updates, 
        // and new completion handlers are set up correctly.
        tut.showStep(nextStepIndex);
      }
    } catch (e) { 
      // Fallback: If the global instance is unavailable, rely only on controller for visual state
      controller.showStep(nextStepIndex);
      LockManager.applyForStep(nextStepIndex);
      controller.currentStep = nextStepIndex;
    }
  };

  // Step mapping is kept minimal: handlers return a cleanup function (or noop)
  if (stepIndex === 1) {
    // wait for Add button in ElementDetailsPanel
    const off = fusionUI.detailsPanel.onAddButtonClick(() => {
      advanceTutorial(stepIndex + 1);
    });
    cleanupFns.push(off);
  } else if (stepIndex === 2 || stepIndex === 5) {
    // Create button in FusionPreview
    // NOTE: FusionPreview now supports multiple handlers, so this no longer overwrites 
    // the primary spell creation logic from FusionUI.
    const off = fusionUI.fusionPreview.onCreateButtonClick(() => {
      advanceTutorial(stepIndex + 1);
    });
    cleanupFns.push(off);
  } else if (stepIndex === 3) {
    // Spell equipped event
    const off = fusionUI.spellSlotsUI.onSpellEquipped(() => {
      advanceTutorial(stepIndex + 1);
    });
    cleanupFns.push(off);
  } else if (stepIndex === 6) {
    // Focus allocated
    const off = fusionUI.spellSlotsUI.onFocusAllocated(() => {
      console.log('TUTORIAL STEP 6: Focus allocated. Attempting transition to step 7.');
      advanceTutorial(stepIndex + 1);
    });
    cleanupFns.push(off);
  } else if (stepIndex === 7) {
    console.log('TUTORIAL STEP 7: Slot your new spell - Setting up completion handlers.');
    // Final step: Slot your new spell.
    // We will complete this step as soon as the user clicks the highlighted button to open the inventory,
    // rather than waiting for them to select a spell.
    const completeFinalStep = (event) => {
      console.log(`TUTORIAL STEP 7: Click detected on ${event.target.className}. Completing step.`);
      // Advance to a non-existent step to trigger tutorial completion.
      advanceTutorial(stepIndex + 1);
      console.log('TUTORIAL STEP 7: Successfully initiated completion process.');
    };
    
    // Find all potential targets for this step.
    const emptySlotButtons = Array.from(document.querySelectorAll('.spell-slot-empty-btn'));
    const swapButtons = Array.from(document.querySelectorAll('.spell-slot-swap'));
    const allTargets = [...emptySlotButtons, ...swapButtons];
    
    console.log(`TUTORIAL STEP 7: Found ${allTargets.length} potential target buttons.`);

    allTargets.forEach(btn => {
      // Ensure we only attach to interactive buttons (not disabled empty slots)
      // Check if it's an empty button that is disabled (only happens when focus is 0)
      const isEnabledEmptySlot = btn.classList.contains('spell-slot-empty-btn') && !btn.disabled;
      const isSwapSlot = btn.classList.contains('spell-slot-swap');

      if (isEnabledEmptySlot || isSwapSlot) {
        btn.addEventListener('click', completeFinalStep, { once: true });
        cleanupFns.push(() => {
          console.log(`TUTORIAL STEP 7: Removing click listener from button: ${btn.className}.`);
          btn.removeEventListener('click', completeFinalStep);
        });
      }
    });

    console.log(`TUTORIAL STEP 7: Registered ${cleanupFns.length} click handlers on enabled buttons.`);
  }

  // Return a single cleanup function that will remove all listeners registered here.
  return () => {
    cleanupFns.forEach(fn => { try { if (typeof fn === 'function') fn(); } catch (e) {} });
  };
}