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
    // Spell equipped event
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
  } else if (stepIndex === 7) {
    console.log('TUTORIAL STEP 7: Slot your new spell - Setting up completion handlers.');
    // Final step: Slot your new spell.
    // We will complete this step as soon as the user clicks the highlighted button to open the inventory,
    // rather than waiting for them to select a spell.
    const completeFinalStep = (event) => {
      console.log(`TUTORIAL STEP 7: Click detected on ${event.target.className}. Completing step.`);
      // Advance to a non-existent step to trigger tutorial completion.
      controller.showStep(stepIndex + 1);
      try { LockManager.applyForStep(stepIndex + 1); } catch (e) {}
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