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

    callout.dataset.position = placement;

    const content = document.createElement('div');
    content.className = 'tutorial-callout-content';

    // Build HTML based on whether to show nav buttons
    const navHtml = showNavButtons ? `
      <div class="tutorial-callout-controls">
        <button class="tutorial-prev">← Back</button>
        <div class="tutorial-progress">${currentIndex + 1} / ${total}</div>
        <button class="tutorial-next">Next →</button>
      </div>
    ` : `
      <div class="tutorial-callout-controls">
        <div class="tutorial-progress">${currentIndex + 1} / ${total}</div>
      </div>
    `;

    content.innerHTML = `
      <div class="tutorial-callout-header">
        <h3>${step.title}</h3>
        <button class="tutorial-close" aria-label="Close tutorial">×</button>
      </div>
      <p>${step.description}</p>
      ${navHtml}
    `;
    callout.appendChild(content);

    // Attach handlers
    content.querySelector('.tutorial-close').addEventListener('click', () => handlers.onClose && handlers.onClose());
    
    if (showNavButtons) {
      content.querySelector('.tutorial-prev').addEventListener('click', () => handlers.onPrev && handlers.onPrev());
      content.querySelector('.tutorial-next').addEventListener('click', () => handlers.onNext && handlers.onNext());
    }

    // Position and append
    // On small screens the fusion preview may be scrolled inside #fusion-ui;
    // for the create-spell step prefer positioning relative to the outer #fusion-ui container.
    let positionTarget = targetEl;
    try {
      if (step.id === 'create-spell' && window.matchMedia && window.matchMedia('(max-width: 480px)').matches) {
        const fusionUi = document.getElementById('fusion-ui');
        if (fusionUi) positionTarget = fusionUi;
      }
    } catch (e) { /* silent fallback to targetEl */ }
    if (positionTarget && !step.isOverlay) {
      const pos = this.positioner.place(callout, positionTarget, placement);
      callout.style.position = 'fixed';
      // If this is the create-spell step on desktop, nudge the callout up a bit so it doesn't cover the Create button.
      if (step.id === 'create-spell' && !(window.matchMedia && window.matchMedia('(max-width: 480px)').matches)) {
        // subtract 8px from the computed top to move it upward
        const numericTop = parseFloat(pos.top) || 0;
        callout.style.top = `${Math.max(8, numericTop - 8)}px`;
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