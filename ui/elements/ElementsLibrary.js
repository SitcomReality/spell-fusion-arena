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
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
  }

  refresh(unlockedKeys = []) {
    if (!this.container) return;
    this.cardMap.clear();

    const unlocked = getUnlockedElements(unlockedKeys);
    this.unlockedElements = Object.entries(unlocked).map(([key, element]) => ({ key, element }));

    // Apply sorting
    this.unlockedElements = this.sortElements(this.unlockedElements);

    this.container.innerHTML = '';
    
    // Add view mode toggle
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'elements-library-controls';
    controlsDiv.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      align-items: center;
    `;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'elements-view-toggle';
    toggleBtn.textContent = this.viewMode === 'grid' ? '📋 List' : '⊞ Grid';
    toggleBtn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #4a9eff;
      background: rgba(74, 158, 255, 0.1);
      color: #b0d4ff;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    `;
    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.borderColor = '#64c8ff';
      toggleBtn.style.background = 'rgba(100, 200, 255, 0.2)';
    });
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.borderColor = '#4a9eff';
      toggleBtn.style.background = 'rgba(74, 158, 255, 0.1)';
    });
    toggleBtn.addEventListener('click', () => {
      this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
      this.sortProperty = null;
      this.sortAscending = false;
      this.refresh(unlockedKeys);
    });

    controlsDiv.appendChild(toggleBtn);
    this.container.appendChild(controlsDiv);

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
    gridDiv.className = 'elements-library';
    gridDiv.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 6px;
      max-height: 280px;
      overflow-y: auto;
      justify-content: flex-start;
    `;

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
    listContainer.style.cssText = `
      border: 1px solid #4a2a7f;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a0f2e 100%);
      border-radius: 4px;
      overflow-x: auto;
    `;

    // Build header with sortable columns
    const headerRow = document.createElement('div');
    headerRow.className = 'elements-list-header';
    headerRow.style.cssText = `
      display: grid;
      grid-template-columns: 120px repeat(6, 48px);
      gap: 0;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid #4a2a7f;
      position: sticky;
      top: 0;
      z-index: 10;
      min-width: 100%;
    `;

    const nameHeader = document.createElement('div');
    nameHeader.textContent = 'Element';
    nameHeader.style.cssText = `
      padding: 8px;
      font-weight: 600;
      color: #64c8ff;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      border-right: 1px solid #4a2a7f;
      cursor: default;
    `;
    headerRow.appendChild(nameHeader);

    const properties = ['speed', 'damage', 'piercing', 'chaining', 'aoe', 'wave'];
    
    for (const prop of properties) {
      const header = document.createElement('button');
      // Use the shared property-icon mapping so headers show the small icons instead of text
      header.innerHTML = `<span class="property-icon" data-property="${prop}" aria-hidden="true"></span>`;
      header.title = prop.charAt(0).toUpperCase() + prop.slice(1);
      header.className = 'elements-list-sort-btn';
      header.dataset.property = prop;
      header.style.cssText = `
        padding: 8px;
        border: none;
        background: rgba(0, 0, 0, 0.2);
        color: #b0d4ff;
        cursor: pointer;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.5px;
        border-right: 1px solid #4a2a7f;
        transition: all 0.2s ease;
        font-weight: 500;
      `;

      const updateHeaderStyle = () => {
        // Keep the icon as the main content; append a compact arrow indicator when active
        if (this.sortProperty === prop) {
          header.style.background = 'rgba(100, 200, 255, 0.2)';
          header.style.color = '#64c8ff';
          header.style.fontWeight = '700';
          // icon + small arrow (up/down) kept minimal width
          header.innerHTML = `<span class="property-icon" data-property="${prop}" aria-hidden="true"></span><span class="sort-arrow">${this.sortAscending ? '▲' : '▼'}</span>`;
        } else {
          // restore default icon-only content when not active
          header.innerHTML = `<span class="property-icon" data-property="${prop}" aria-hidden="true"></span>`;
          header.style.background = 'rgba(0, 0, 0, 0.2)';
          header.style.color = '#b0d4ff';
          header.style.fontWeight = '500';
        }
      };
      updateHeaderStyle();

      header.addEventListener('click', () => {
        // If clicking the same property, toggle sort order
        if (this.sortProperty === prop) {
          this.sortAscending = !this.sortAscending;
        } else {
          this.sortProperty = prop;
          this.sortAscending = false;
        }
        this.refresh(unlockedKeys);
      });

      header.addEventListener('mouseenter', () => {
        if (this.sortProperty !== prop) {
          header.style.background = 'rgba(74, 158, 255, 0.15)';
          header.style.color = '#dff6ff';
        }
      });

      header.addEventListener('mouseleave', () => {
        if (this.sortProperty !== prop) {
          header.style.background = 'rgba(0, 0, 0, 0.2)';
          header.style.color = '#b0d4ff';
        }
      });

      headerRow.appendChild(header);
    }

    listContainer.appendChild(headerRow);

    // Build rows
    const rowsDiv = document.createElement('div');
    rowsDiv.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
    `;

    for (const { key, element } of this.unlockedElements) {
      const row = document.createElement('div');
      row.className = 'elements-list-row';
      row.style.cssText = `
        display: grid;
        grid-template-columns: 120px repeat(6, 48px);
        gap: 0;
        border-bottom: 1px solid rgba(74, 158, 255, 0.1);
        align-items: center;
        cursor: pointer;
        transition: background 0.2s ease;
        min-width: 100%;
      `;

      row.addEventListener('mouseenter', () => {
        row.style.background = 'rgba(100, 200, 255, 0.08)';
      });
      row.addEventListener('mouseleave', () => {
        row.style.background = 'transparent';
      });

      // Name cell
      const nameCell = document.createElement('div');
      nameCell.textContent = element.name;
      nameCell.style.cssText = `
        padding: 8px;
        border-right: 1px solid rgba(74, 158, 255, 0.1);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #dff6ff;
      `;
      row.appendChild(nameCell);

      // Property cells
      for (const prop of properties) {
        const cell = document.createElement('div');
        const value = element.propertyGenes?.[prop] || 0;
        cell.textContent = typeof value === 'number' ? Math.round(value * 100) / 100 : value;
        cell.style.cssText = `
          padding: 8px;
          border-right: 1px solid rgba(74, 158, 255, 0.1);
          text-align: center;
          font-size: 11px;
          color: #b0d4ff;
        `;
        row.appendChild(cell);
      }

      row.addEventListener('click', () => {
        // Find the card element for consistency (create a dummy card for callback)
        const dummyCard = document.createElement('div');
        this.onClick(key, element, dummyCard);
      });

      rowsDiv.appendChild(row);
    }

    listContainer.appendChild(rowsDiv);
    this.container.appendChild(listContainer);
  }

  markSelectedCard(cardEl) {
    document.querySelectorAll('.element-card.selected').forEach(c => c.classList.remove('selected'));
    if (cardEl && cardEl.classList) {
      cardEl.classList.add('selected');
    }
  }
}