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
    // FINAL: Complete when swap or empty slot button is pressed OR when inventory modal opens.
    // Use document-level capture to avoid missing events due to bubbling issues or dynamic DOM.
    const finishTutorial = (reason = 'unknown') => {
      console.debug('[Tutorial Debug] Final tutorial completion via:', reason);
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

    const captureClickListener = (ev) => {
      const target = ev.target && ev.target.closest && ev.target.closest('.spell-slot-swap, .spell-slot-empty-btn');
      if (!target) return;
      console.debug('[Tutorial Debug] Document capture click detected on', target.className);
      finishTutorial('button-press');
    };

    document.addEventListener('click', captureClickListener, true);
    cleanupFns.push(() => {
      document.removeEventListener('click', captureClickListener, true);
      console.debug('[Tutorial Debug] Removed document capture click listener for final step');
    });

    // Also observe when inventory modal opens (class flag or overlay element insertion)
    const modalOpenCheck = () => {
      if (document.documentElement.classList.contains('inventory-modal-open') ||
          document.getElementById('inventory-selector-overlay')) {
        console.debug('[Tutorial Debug] Inventory modal detected open');
        finishTutorial('inventory-open');
      }
    };

    const mo = new MutationObserver(() => modalOpenCheck());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    mo.observe(document.body, { childList: true, subtree: true });

    cleanupFns.push(() => {
      try { mo.disconnect(); } catch (e) {}
      console.debug('[Tutorial Debug] Disconnected MutationObserver for final step');
    });

    // Initial debug context
    const swapButtons = Array.from(document.querySelectorAll('.spell-slot-swap') || []);
    const emptyButtons = Array.from(document.querySelectorAll('.spell-slot-empty-btn') || []);
    console.debug('[Tutorial Debug] Final-step setup: swapCount', swapButtons.length, 'emptyCount', emptyButtons.length);
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