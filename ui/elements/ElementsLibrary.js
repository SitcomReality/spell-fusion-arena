import { ELEMENTS, getUnlockedElements } from '../../spells/Element.js';
import VisualPreview from '../VisualPreview.js';

export class ElementsLibrary {
  constructor(onClick) {
    this.onClick = onClick;
    this.container = null;
    this.cardMap = new Map();
    
    // View mode and sorting state
    this.viewMode = 'grid'; // 'grid' or 'list'
    this.sortProperty = null; // null = most recently unlocked, or property name
    this.sortAscending = false; // default is descending (highest first)
    this.unlockedElements = [];
    this.lastUnlockedKeys = []; // remember last keys passed to refresh
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
  }

  // NEW: allow external UI to toggle view mode
  toggleView() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    // reset sort state when toggling view as previously done
    this.sortProperty = null;
    this.sortAscending = false;
    this.refresh(this.lastUnlockedKeys);
  }

  refresh(unlockedKeys = []) {
    if (!this.container) return;
    this.cardMap.clear();

    // remember the keys so external toggle can refresh with same set
    this.lastUnlockedKeys = Array.isArray(unlockedKeys) ? unlockedKeys.slice() : [];

    const unlocked = getUnlockedElements(unlockedKeys);
    this.unlockedElements = Object.entries(unlocked).map(([key, element]) => ({ key, element }));

    // Apply sorting
    this.unlockedElements = this.sortElements(this.unlockedElements);

    this.container.innerHTML = '';
    
    // NOTE: view toggle moved to FusionUI header; do not add controls here anymore.
    // (previously created an elements-library-controls div here)

    if (this.viewMode === 'grid') {
      this.renderGridView();
    } else {
      this.renderListView(unlockedKeys);
    }
  }

  sortElements(elements) {
    const sorted = [...elements];

    // If no sort property, sort by unlock order (most recent first = reverse)
    if (this.sortProperty === null) {
      return sorted.reverse();
    }

    // Sort by property value
    sorted.sort((a, b) => {
      const valA = a.element.propertyGenes?.[this.sortProperty] || 0;
      const valB = b.element.propertyGenes?.[this.sortProperty] || 0;

      if (this.sortAscending) {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

    return sorted;
  }

  renderGridView() {
    const gridDiv = document.createElement('div');
    gridDiv.className = 'elements-library elements-library-grid';

    for (const { key, element } of this.unlockedElements) {
      const card = document.createElement('div');
      card.className = 'element-card';
      card.dataset.element = key;
      card.innerHTML = `<div class="element-card-content"><h4>${element.name}</h4></div>`;
      
      try {
        const previewData = {
          color: element.color,
          secondaryColor: element.secondaryColor,
          accentColor: element.accentColor || element.secondaryColor,
          properties: element.propertyGenes,
          visualEffects: element.visualEffects
        };
        const previewEl = VisualPreview.create(previewData, { size: 'medium', interactive: false });
        previewEl.classList.add('element-card-color', 'element-card-color-preview');
        card.insertBefore(previewEl, card.firstChild);
      } catch (e) {
        const fallback = document.createElement('div');
        fallback.className = 'element-card-color';
        fallback.style.background = `rgb(${element.color.r}, ${element.color.g}, ${element.color.b})`;
        card.insertBefore(fallback, card.firstChild);
      }

      card.addEventListener('click', () => {
        this.onClick(key, element, card);
      });
      
      gridDiv.appendChild(card);
      this.cardMap.set(key, card);
    }

    this.container.appendChild(gridDiv);
  }

  renderListView(unlockedKeys) {
    const listContainer = document.createElement('div');
    listContainer.className = 'elements-list-container';

    // Build a two-pane layout: fixed name column + scrollable properties pane
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'elements-list-table';

    // Fixed left column (header + name cells)
    const fixedColumn = document.createElement('div');
    fixedColumn.className = 'elements-list-fixed-column';

    const fixedHeader = document.createElement('div');
    fixedHeader.className = 'elements-list-fixed-header';
    fixedHeader.innerHTML = `<div class="fixed-name-cell">Element</div>`;
    fixedColumn.appendChild(fixedHeader);

    // Scrollable right pane (header + rows)
    const scrollablePane = document.createElement('div');
    scrollablePane.className = 'elements-list-scrollable';

    const headerRow = document.createElement('div');
    headerRow.className = 'elements-list-header';

    // Name header placeholder (kept for alignment only in scroll pane)
    const spacer = document.createElement('div');
    spacer.className = 'elements-list-header-spacer';
    headerRow.appendChild(spacer);

    // Extended property list: keep sensible order for readability and sorting
    const properties = ['speed', 'damage', 'piercing', 'chaining', 'aoe', 'wave', 'knockback', 'dot', 'splitting', 'homing', 'spiral'];

    for (const prop of properties) {
      const header = document.createElement('button');
      header.className = 'elements-list-sort-btn';
      header.innerHTML = `<span class="elements-list-sort-icon" data-property="${prop}" aria-hidden="true"></span>`;
      header.dataset.property = prop;

      header.addEventListener('click', () => {
        if (this.sortProperty === prop) {
          this.sortAscending = !this.sortAscending;
        } else {
          this.sortProperty = prop;
          this.sortAscending = false;
        }
        this.refresh(unlockedKeys);
      });

      headerRow.appendChild(header);
    }

    scrollablePane.appendChild(headerRow);

    // Build rows container inside the scrollable pane
    const rowsDiv = document.createElement('div');
    rowsDiv.className = 'elements-list-rows';

    for (const { key, element } of this.unlockedElements) {
      // Fixed name cell (left column)
      const nameCell = document.createElement('div');
      nameCell.className = 'elements-list-fixed-row';
      const color = element.color || { r: 120, g: 120, b: 120 };
      nameCell.innerHTML = `
        <span class="element-list-swatch" aria-hidden="true" style="background: rgb(${color.r}, ${color.g}, ${color.b});"></span>
        <span class="element-list-name">${element.name}</span>
      `;
      nameCell.addEventListener('click', () => {
        const dummyCard = document.createElement('div');
        this.onClick(key, element, dummyCard);
      });
      fixedColumn.appendChild(nameCell);

      // Property row in scrollable pane
      const row = document.createElement('div');
      row.className = 'elements-list-row';

      // Spacer cell aligns with fixed column height to keep rows lined up
      const spacerCell = document.createElement('div');
      spacerCell.className = 'elements-list-row-spacer';
      row.appendChild(spacerCell);

      for (const prop of properties) {
        const cell = document.createElement('div');
        const value = element.propertyGenes?.[prop] || 0;
        cell.textContent = typeof value === 'number' ? Math.round(value * 100) / 100 : value;
        row.appendChild(cell);
      }

      row.addEventListener('click', () => {
        const dummyCard = document.createElement('div');
        this.onClick(key, element, dummyCard);
      });

      rowsDiv.appendChild(row);
    }

    scrollablePane.appendChild(rowsDiv);

    // Combine panes
    tableWrapper.appendChild(fixedColumn);
    tableWrapper.appendChild(scrollablePane);
    listContainer.appendChild(tableWrapper);

    this.container.appendChild(listContainer);
  }

  markSelectedCard(cardEl) {
    document.querySelectorAll('.element-card.selected').forEach(c => c.classList.remove('selected'));
    if (cardEl && cardEl.classList) {
      cardEl.classList.add('selected');
    }
  }
}