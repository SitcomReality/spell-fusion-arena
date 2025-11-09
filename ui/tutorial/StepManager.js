export class StepManager {
  constructor() {
    this.steps = [];
  }

  initialize() {
    this.steps = [
      {
        id: 'select-element',
        title: 'Select an Element',
        description: 'Click an element to see its properties. Elements have different abilities they can contribute to your spell.',
        targetSelector: '.elements-library .element-card',
        position: 'right'
      },
      {
        id: 'add-to-fusion',
        title: 'Add Element',
        description: 'Review the element\'s properties, then click "Add" to include it in your spell recipe. You can add up to 4 elements.',
        targetSelector: '#element-details-panel .element-add-btn',
        position: 'left'
      },
      {
        id: 'create-spell',
        title: 'Create Your Spell',
        description: 'Once you\'ve selected elements, click Create to forge your spell. The cost in Mana Essence is shown on the button.',
        targetSelector: '.fusion-preview-create',
        position: 'top'
      },
      {
        id: 'equip-spell',
        title: 'Equip Your Spell',
        description: 'Your created spells appear here. Click the + button in a spell slot to equip one. You can swap spells between slots anytime.',
        targetSelector: '.spell-slot-empty-btn',
        position: 'bottom'
      },
      {
        id: 'start-wave',
        title: 'Ready to Battle',
        description: 'Start the wave when you\'re ready. Defeat all enemies to progress.',
        targetSelector: '.wave-start-button',
        position: 'top'
      },
      {
        id: 'wave-complete',
        title: 'Wave Complete!',
        description: 'You\'ve earned 1 Focus and Mana Essence. Use Essence to create stronger spells.',
        targetSelector: '#reward-overlay',
        position: 'center',
        isOverlay: true
      },
      {
        id: 'two-element-fusion',
        title: 'Create a 2-Element Spell',
        description: 'Now create a spell using 2 elements (costs 5 Mana Essence). This unlocks more power combinations.',
        targetSelector: '.fusion-slots',
        position: 'bottom'
      },
      {
        id: 'allocate-focus',
        title: 'Upgrade a Spell Slot',
        description: 'Click the + button on a spell slot header to spend 1 Focus to upgrade that slot — upgrades increase the slot\'s firing rate and provide a small damage bonus.',
        targetSelector: '.slot-add-focus',
        position: 'bottom'
      }
    ];
  }

  get(idx) { return this.steps[idx]; }
  length() { return this.steps.length; }
  indexOf(stepId) { return this.steps.findIndex(s => s.id === stepId); }
}