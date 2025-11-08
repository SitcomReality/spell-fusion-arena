export function createLayoutObserver(headerContainer, equippedSpellsEl) {
  const layoutObserver = new ResizeObserver(entries => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      const entry = entries[0];
      const height = entry?.contentRect?.height || 0;
      document.documentElement.style.setProperty('--fixed-header-height', `${height}px`);
      try {
        const eqEl = equippedSpellsEl || document.getElementById('equipped-spells');
        const w = eqEl ? Math.ceil(eqEl.getBoundingClientRect().width) : 56;
        document.documentElement.style.setProperty('--equipped-spells-width', `${w}px`);
      } catch (e) {
        document.documentElement.style.setProperty('--equipped-spells-width', `56px`);
      }
    } else {
      document.documentElement.style.setProperty('--fixed-header-height', `0px`);
      document.documentElement.style.setProperty('--equipped-spells-width', `0px`);
    }
  });

  if (headerContainer) layoutObserver.observe(headerContainer);
  if (equippedSpellsEl) layoutObserver.observe(equippedSpellsEl);

  return layoutObserver;
}

