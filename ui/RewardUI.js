import { getLockedElements, unlockElement } from '../spells/Element.js';

export class RewardUI {
  constructor(onElementChosen) {
    this.onElementChosen = onElementChosen;
    this.container = null;
    this.choices = [];
  }

  show(waveNumber) {
    const lockedElements = getLockedElements();
    const elementKeys = Object.keys(lockedElements);
    
    if (elementKeys.length === 0) {
      // All elements unlocked
      this.onElementChosen();
      return;
    }

    // Pick 3 random locked elements
    this.choices = [];
    const availableKeys = [...elementKeys];
    const numChoices = Math.min(3, availableKeys.length);
    
    for (let i = 0; i < numChoices; i++) {
      const randomIndex = Math.floor(Math.random() * availableKeys.length);
      this.choices.push({
        key: availableKeys[randomIndex],
        element: lockedElements[availableKeys[randomIndex]]
      });
      availableKeys.splice(randomIndex, 1);
    }

    this.render(waveNumber);
  }

  render(waveNumber) {
    // Create overlay
    this.container = document.createElement('div');
    this.container.id = 'reward-overlay';
    this.container.innerHTML = `
      <div class="reward-modal">
        <h2>Wave ${waveNumber} Complete!</h2>
        <p class="reward-subtitle">Choose an element to unlock</p>
        <div class="reward-choices" id="reward-choices"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    const choicesContainer = document.getElementById('reward-choices');
    
    this.choices.forEach((choice, index) => {
      const elem = choice.element;
      const card = document.createElement('div');
      card.className = 'reward-card';
      card.dataset.key = choice.key;
      card.innerHTML = `
        <div class="reward-card-color" style="background: rgb(${elem.color.r}, ${elem.color.g}, ${elem.color.b})"></div>
        <h3>${elem.name}</h3>
        <p class="reward-card-desc">${elem.description}</p>
        <div class="reward-card-stats">
          <span>Damage: ${elem.traits.damage}</span>
          <span>Speed: ${Math.round(elem.traits.speed)}</span>
        </div>
      `;
      
      card.addEventListener('click', () => this.selectChoice(choice.key));
      choicesContainer.appendChild(card);
    });
  }

  selectChoice(elementKey) {
    unlockElement(elementKey);
    this.hide();
    this.onElementChosen();
  }

  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}