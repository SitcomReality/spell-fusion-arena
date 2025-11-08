import { Icons } from './Icons.js';

export class HUD {
  constructor() {
    this.container = document.getElementById('hud');
    // internal state cache so callers can set values and HUD will render only on changes
    this.state = {
      wave: 0,
      score: 0,
      enemies: 0,
      essence: 0,
      focus: 0,
      health: 1000
    };
    // initial render
    this.render();
  }
  
  // Unused for per-frame updates; left for backwards-compatibility (no-op)
  update() {
    // no-op: HUD is now push-based via specific setters
  }

  setWave(n) {
    if (this.state.wave === n) return;
    this.state.wave = n;
    this.render();
  }

  setScore(n) {
    if (this.state.score === n) return;
    this.state.score = n;
    this.render();
  }

  setEnemies(n) {
    if (this.state.enemies === n) return;
    this.state.enemies = n;
    this.render();
  }

  setEssence(n) {
    if (this.state.essence === n) return;
    this.state.essence = n;
    this.render();
  }

  setFocus(n) {
    if (this.state.focus === n) return;
    this.state.focus = n;
    this.render();
  }

  setHealth(n) {
    if (this.state.health === n) return;
    this.state.health = n;
    this.render();
  }

  // Small internal renderer that composes HTML from cached state
  render() {
    const s = this.state;
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="hud-item">Wave: ${s.wave}</div>
      <div class="hud-item">Score: ${s.score}</div>
      <div class="hud-item">Health: ${s.health}</div>
      <div class="hud-item">Enemies: ${s.enemies}</div>
      <div class="hud-item">Essence: ${Icons.manaEssenceSVG(14)} ${s.essence}</div>
      <div class="hud-item">Focus: ${Icons.focusSVG(14)} ${s.focus}</div>
    `;
  }
}