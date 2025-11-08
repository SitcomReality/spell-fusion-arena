// NEW: Reusable SVG icons for UI (Mana Essence & Focus)
export const Icons = {
  // Returns an inline SVG string for Mana Essence (stylized crystal / droplet)
  manaEssenceSVG(size = 20, fill = '#64c8ff') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="manaGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="${fill}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#a8ecff" stop-opacity="0.95"/>
          </linearGradient>
        </defs>
        <g fill="none" fill-rule="evenodd">
          <path d="M12 2 L16.5 9.5 L12 22 L7.5 9.5 Z" fill="url(#manaGrad)" stroke="#ffffff" stroke-opacity="0.12" stroke-width="0.8"/>
          <path d="M12 6 L14.8 11.3 L12 19 L9.2 11.3 Z" fill="#ffffff" fill-opacity="0.12"/>
          <circle cx="12" cy="12" r="1.2" fill="#ffffff" fill-opacity="0.9"/>
        </g>
      </svg>
    `;
  },

  // Returns an inline SVG string for Focus (stylized target / eye / crosshair)
  focusSVG(size = 20, fill = '#ffd76b') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="focusGrad" cx="50%" cy="40%">
            <stop offset="0" stop-color="${fill}" stop-opacity="0.95"/>
            <stop offset="1" stop-color="#ffecb8" stop-opacity="0.85"/>
          </radialGradient>
        </defs>
        <g fill="none" fill-rule="evenodd" stroke="#111">
          <circle cx="12" cy="12" r="7" fill="url(#focusGrad)" stroke="#ffffff" stroke-opacity="0.14" stroke-width="0.8"/>
          <path d="M12 8 L12 5 M12 19 L12 16 M8 12 L5 12 M19 12 L16 12" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="2.2" fill="#ffffff" fill-opacity="0.95"/>
        </g>
      </svg>
    `;
  },

  // Helper to create a DOM element from an SVG string for insertion into UI
  createIconElement(svgString) {
    const wrapper = document.createElement('span');
    wrapper.className = 'ui-inline-icon';
    wrapper.innerHTML = svgString;
    // Ensure the svg doesn't capture focus
    const svg = wrapper.querySelector('svg');
    if (svg) {
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.style.display = 'inline-block';
      svg.style.verticalAlign = 'middle';
    }
    return wrapper;
  }
};