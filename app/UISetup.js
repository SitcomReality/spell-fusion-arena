import { FusionUI } from '../ui/FusionUI.js';
import { HUD } from '../ui/HUD.js';
import { RewardUI } from '../ui/RewardUI.js';
import { WaveStartButton } from '../ui/WaveStartButton.js';
import { SpeedControl } from '../ui/SpeedControl.js';

export function createHUD() {
  return new HUD();
}

export function createSpeedControl(onSpeedChange, onAutoToggle, mountContainer) {
  const sc = new SpeedControl(onSpeedChange, onAutoToggle);
  sc.mount(mountContainer);
  return sc;
}

export function createFusionUI(onSpellEquipped, gameState) {
  return new FusionUI(onSpellEquipped, gameState);
}

export function createRewardUI(onRewardChosen, rng, gameState) {
  return new RewardUI(onRewardChosen, rng, gameState);
}

export function createWaveStartButton(container) {
  return new WaveStartButton(container);
}

