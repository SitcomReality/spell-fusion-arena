export const CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },
  player: {
    radius: 12
    // castInterval is now calculated per spell slot based on Mana Essence
  },
  enemy: {
    baseSpeed: 30,
    spawnRadius: 520
  },
  wave: {
    initialDelay: 3000,
    betweenWaveDelay: 5000,
    focusRewardPerWave: 1
  },
  particles: {
    maxParticles: 500
  }
};

export const COLORS = {
  background: '#0a0a0a',
  ui: '#ffffff',
  uiAccent: '#333333'
};