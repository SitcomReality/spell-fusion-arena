export class Callout {
  constructor(positioner) {
    this.positioner = positioner;
    this.current = null;
  }

  create(step, currentIndex, total, handlers = {}, targetEl = null, showNavButtons = true) {
    this.remove();

    const callout = document.createElement('div');
    callout.className = 'tutorial-callout';
    let placement = step.position || 'right';
    if (step.id === 'select-element') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) placement = 'top';
        else placement = 'left';
      } catch (e) { placement = 'left'; }
    }
    // Special placement: for the "add-to-fusion" step, show the callout below the details panel on desktop,
    // but move it above the panel on very small screens so it doesn't obscure the panel content.
    if (step.id === 'add-to-fusion') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) placement = 'top';
        else placement = 'bottom';
      } catch (e) { placement = 'bottom'; }
    }

    // NEW: For the "create-spell" step, prefer showing the callout above the fusion preview on mobile
    // and slightly nudge it upward on desktop so it doesn't obscure the Create button.
    if (step.id === 'create-spell') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) placement = 'top';
        else placement = 'top';
      } catch (e) { placement = 'top'; }
    }

    // NEW: For the "two-element-fusion" tutorial step we want the callout placed near the fusion UI
    // but visually over the canvas so it doesn't obscure the fusion UI:
    // - Desktop: place the callout to the left of the fusion UI and show the pointer on the right.
    // - Mobile (<=480px): place the callout above the fusion UI and show the pointer pointing down.
    if (step.id === 'two-element-fusion') {
      try {
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 480px)').matches;
        // positioner placement (where callout will sit relative to target)
        placement = isMobile ? 'top' : 'left';
        // Make the pointer side match the placement (same behavior as select-element)
        callout.dataset.position = placement;
      } catch (e) { /* silent fallback - keep previously computed placement */ }
    }

    // NEW: For the "equip-spell" step, show the callout above the equipped-spells on desktop
    // (so it points down at the slots). On very small screens move it to the left and point right
    // so the equipped-spells column remains fully visible.
    if (step.id === 'equip-spell') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
          placement = 'left';
        } else {
          placement = 'top';
        }
      } catch (e) {
        placement = 'top';
      }
    }

    // NEW: For the "allocate-focus" final tutorial step, use the same placement as "equip-spell"
    // so the callout does not obscure the #equipped-spells panel on desktop or mobile.
    if (step.id === 'allocate-focus') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
          placement = 'left';
        } else {
          placement = 'top';
        }
      } catch (e) {
        placement = 'top';
      }
    }

    // NEW: For the "slot-your-spell" final reminder step, match the same placement/anchoring
    // as the "allocate-focus" step so it does not cover the equipped-spells panel.
    if (step.id === 'slot-your-spell') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
          placement = 'left'; // sits to the left of the slots on mobile, pointer should point right
        } else {
          placement = 'top'; // sits above the slots on desktop, pointer should point down
        }
      } catch (e) {
        placement = 'top';
      }
    }

    // NEW: Position the "start-wave" callout lower on the canvas and point up at the wave panel.
    // Anchor to the canvas wrapper so it sits over the canvas (not over the fusion UI), and nudge it down.
    if (step.id === 'start-wave') {
      try {
        placement = 'bottom'; // place callout below the target so the pointer faces up
        callout.dataset.position = 'bottom';
        // prefer anchoring to the canvas wrapper so callout sits over canvas area near the wave panel
        const canvasWrapper = document.getElementById('canvas-wrapper');
        if (canvasWrapper) positionTarget = canvasWrapper;
      } catch (e) { /* silent fallback */ }
    }

    if (!callout.dataset.position) callout.dataset.position = placement;

    const content = document.createElement('div');
    content.className = 'tutorial-callout-content';

    // Note: controls and close button intentionally removed — tutorial cannot be skipped.
    content.innerHTML = `
      <div class="tutorial-callout-header">
        <h3>${step.title}</h3>
      </div>
      <p>${step.description}</p>
    `;
    callout.appendChild(content);

    // No close or nav buttons to attach (tutorial flow controlled externally).

    // Position and append
    // On small screens the fusion preview may be scrolled inside #fusion-ui;
    // for the create-spell step prefer positioning relative to the outer #fusion-ui container.
    let positionTarget = targetEl;
    try {
      // For the final "allocate-focus" step we want the callout anchored to the equipped-spells
      // container so on narrow viewports it will sit to the left of the slot column (pointer on the right)
      // instead of being positioned relative to an inner button which could push it over the slots.
      if (step.id === 'allocate-focus') {
        const eq = document.getElementById('equipped-spells');
        if (eq) positionTarget = eq;
        // Ensure pointer placement is set so the callout appears to the left of the slots.
        callout.dataset.position = 'left';
      }
      // For two-element fusion we prefer to position relative to the fusion UI container
      if (step.id === 'two-element-fusion') {
        const fusionUi = document.getElementById('fusion-ui');
        if (fusionUi) positionTarget = fusionUi;
      }
      if (step.id === 'create-spell' && window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
        const fusionUi = document.getElementById('fusion-ui');
        if (fusionUi) positionTarget = fusionUi;
      }

      // For start-wave, nudge the computed position lower so the callout sits toward the bottom of the canvas
      if (step.id === 'start-wave') {
        // ensure positionTarget is the canvas wrapper (set above) or fallback to targetEl
        positionTarget = positionTarget || document.getElementById('canvas-wrapper') || targetEl;
      }
    } catch (e) { /* silent fallback to targetEl */ }
    if (positionTarget && !step.isOverlay) {
      const pos = this.positioner.place(callout, positionTarget, placement);
      callout.style.position = 'fixed';
      // Nudge the callout slightly further down so it appears lower on the canvas and points up at the wave panel.
      if (step.id === 'start-wave') {
        const numericTop = parseFloat(pos.top) || 0;
        // Larger nudge on desktop, smaller on mobile
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 480px)').matches;
        const nudge = isMobile ? 40 : 80;
        callout.style.top = `${Math.min(window.innerHeight - 8, numericTop + nudge)}px`;
      } else if (step.id === 'create-spell' && !(window.matchMedia && window.matchMedia('(max-width: 480px)').matches)) {
        // subtract 8px from the computed top to move it upward
        const numericTop = parseFloat(pos.top) || 0;
        // increased nudge to avoid obscuring the Create button on desktop
        callout.style.top = `${Math.max(8, numericTop - 20)}px`;
      } else {
        callout.style.top = pos.top;
      }
      callout.style.left = pos.left;
      document.body.appendChild(callout);
    } else {
      callout.classList.add('tutorial-overlay-callout');
      document.body.appendChild(callout);
    }

    this.current = callout;
  }

  remove() {
    if (this.current) {
      this.current.remove();
      this.current = null;
    }
  }
}