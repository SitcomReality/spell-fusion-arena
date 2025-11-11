import { SpellFusion } from '../../spells/SpellFusion.js';
import { getSpellCost } from '../../spells/Element.js';

export class FusionController {
  constructor(state, fusionPreview, fusionBuilder) {
    this.state = state;
    this.fusionPreview = fusionPreview;
    this.fusionBuilder = fusionBuilder;
  }

  addElementToFusion(element, container) {
    if (this.state.selectedElements.length >= this.state.maxFusionSlots) return;
    this.state.selectedElements.push(element);
    this.fusionBuilder.setSelectedElements(this.state.selectedElements);
    this.updateFusionPreview();

    this.attemptAutoScrollToFusion(container);
  }

  attemptAutoScrollToFusion(container) {
    try {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        const COSTS = [1, 5, 10, 20];
        const currentEssence = Number(this.state.essenceBank || 0);

        let affordableSlots = 0;
        for (let i = 0; i < Math.min(this.state.maxFusionSlots, COSTS.length); i++) {
          if (currentEssence >= (COSTS[i] || 0)) affordableSlots++;
        }

        if (this.state.selectedElements.length === affordableSlots && affordableSlots > 0) {
          const fusionSections = container.querySelectorAll('.fusion-section');
          const targetSection = fusionSections[1] || fusionSections[0];
          if (targetSection) {
            const offsetTop = targetSection.offsetTop;
            container.scrollTo({ top: offsetTop - 8, behavior: 'smooth' });
          }
        }
      }
    } catch (e) { /* silent fallback */ }
  }

  removeElement(index) {
    this.state.selectedElements.splice(index, 1);
    this.fusionBuilder.setSelectedElements(this.state.selectedElements);
    this.updateFusionPreview();
  }

  clearFusion() {
    this.state.selectedElements = [];
    this.state.currentSpell = null;
    this.fusionBuilder.setSelectedElements(this.state.selectedElements);
    this.updateFusionPreview(true);
  }

  updateFusionPreview(forceEmpty = false) {
    if (forceEmpty || this.state.selectedElements.length === 0) {
      this.fusionPreview.showMessage(`Add an element to create a spell`);
      return;
    }

    this.state.currentSpell = SpellFusion.fuse(...this.state.selectedElements);

    const cost = getSpellCost(this.state.selectedElements.length);
    const isInTutorialStep7 = document.documentElement.classList.contains('tutorial-lock-to-fusion-full');
    const isExactlyTwoElements = this.state.selectedElements.length === 2;
    const canCreate = isInTutorialStep7 ? isExactlyTwoElements : true;
    const affordable = (this.state.essenceBank >= cost) && canCreate;

    this.fusionPreview.showSpell(this.state.currentSpell, () => {
      // Create spell will be called from outside
    }, cost, affordable);

    if (isInTutorialStep7) {
      const createBtn = document.querySelector('.fusion-preview-create');
      if (createBtn) {
        createBtn.classList.toggle('enabled-for-two-elements', isExactlyTwoElements);
      }
    }
  }

  createSpell() {
    const elementCount = this.state.selectedElements.length;
    const cost = getSpellCost(elementCount);

    if (!this.state.deductEssence(cost)) {
      alert(`Need ${cost} Mana Essence to create this spell (have ${this.state.essenceBank})`);
      return false;
    }

    this.state.spellInventory.push(this.state.currentSpell);
    this.clearFusion();
    return true;
  }

  getCurrentSpell() {
    return this.state.currentSpell;
  }

  getSelectedElements() {
    return this.state.selectedElements;
  }
}