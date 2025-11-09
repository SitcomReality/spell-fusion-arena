export class Positioner {
  // Calculate placement coords for a callout relative to a target element.
  place(calloutEl, targetEl, preferredPosition = 'right') {
    if (!calloutEl || !targetEl) return { top: '50%', left: '50%', center: true };
    const rect = targetEl.getBoundingClientRect();
    // temporarily add the callout to measure it if not in DOM
    let added = false;
    if (!document.body.contains(calloutEl)) { document.body.appendChild(calloutEl); added = true; }
    const calloutRect = calloutEl.getBoundingClientRect();
    const gap = 12;
    let top, left;

    // special-case: initial 'select-element' placement rules handled by caller if needed
    switch (preferredPosition) {
      case 'top':
        top = rect.top - calloutRect.height - gap;
        left = rect.left + (rect.width - calloutRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + (rect.width - calloutRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - calloutRect.height) / 2;
        left = rect.left - calloutRect.width - gap;
        break;
      case 'right':
      default:
        top = rect.top + (rect.height - calloutRect.height) / 2;
        left = rect.right + gap;
        break;
    }

    // clamp to viewport with small margins
    top = Math.max(8, Math.min(window.innerHeight - calloutRect.height - 8, top));
    left = Math.max(8, Math.min(window.innerWidth - calloutRect.width - 8, left));

    if (added) calloutEl.remove(); // caller will append after positioning
    return { top: `${top}px`, left: `${left}px`, center: false };
  }
}