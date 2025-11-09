export class Callout {
  constructor(positioner) {
    this.positioner = positioner;
    this.current = null;
  }

  create(step, currentIndex, total, handlers = {}, targetEl = null) {
    this.remove();

    const callout = document.createElement('div');
    callout.className = 'tutorial-callout';
    // determine initial placement preference for select-element special case
    let placement = step.position || 'right';
    if (step.id === 'select-element') {
      try {
        if (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) placement = 'top';
        else placement = 'left';
      } catch (e) { placement = 'left'; }
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
        <div class="tutorial-progress">${currentIndex + 1} / ${total}</div>
        <button class="tutorial-next">Next →</button>
      </div>
    `;
    callout.appendChild(content);

    // attach handlers
    content.querySelector('.tutorial-close').addEventListener('click', () => handlers.onClose && handlers.onClose());
    content.querySelector('.tutorial-prev').addEventListener('click', () => handlers.onPrev && handlers.onPrev());
    content.querySelector('.tutorial-next').addEventListener('click', () => handlers.onNext && handlers.onNext());

    // position and append
    if (targetEl && !step.isOverlay) {
      const pos = this.positioner.place(callout, targetEl, placement);
      callout.style.position = 'fixed';
      callout.style.top = pos.top;
      callout.style.left = pos.left;
      document.body.appendChild(callout);
    } else {
      callout.classList.add('tutorial-overlay-callout');
      document.body.appendChild(callout);
      // center overlay via CSS class
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