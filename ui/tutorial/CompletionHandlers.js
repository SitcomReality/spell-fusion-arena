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
    // FINAL: when the player slots their new spell, finish the tutorial completely.
    // There are multiple ways a player can slot a spell: via the slot equip flow, via the swap button,
    // or via pressing the empty-slot button to open the inventory. To ensure the final tutorial step
    // completes reliably and only once, register both the SpellSlotsUI 'onSpellEquipped' and document
    // click handlers for the relevant buttons. Both paths will call the same finish() helper.
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        if (controller && typeof controller.complete === 'function') controller.complete();
      } catch (e) {}
      try { LockManager.clearAll(); } catch (e) {}
      try {
        if (window && window.gameInstance && window.gameInstance.tutorial) {
          // keep external tutorial state consistent and call its completion routine
          window.gameInstance.tutorial.currentStep = -1;
          window.gameInstance.tutorial.complete();
        }
      } catch (e) {}
    };

    // 1) Preferred: when a spell is equipped via the SpellSlotsUI high-level event
    const offEquip = fusionUI.spellSlotsUI.onSpellEquipped(() => {
      finish();
    });
    cleanupFns.push(offEquip);

    // 2) Document-level delegated click listener: catches direct clicks on swap/empty buttons.
    const docHandler = (ev) => {
      try {
        const swap = ev.target.closest && ev.target.closest('.spell-slot-swap');
        const emptyBtn = ev.target.closest && ev.target.closest('.spell-slot-empty-btn');
        if (swap || emptyBtn) {
          // Small timeout to allow any subsequent equip logic to run (if applicable),
          // but still finish the tutorial immediately so callouts/locks are cleared.
          setTimeout(() => finish(), 0);
        }
      } catch (e) { /* ignore */ }
    };
    document.addEventListener('click', docHandler, true);
    // Add cleanup to remove the document listener
    cleanupFns.push(() => document.removeEventListener('click', docHandler, true));
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