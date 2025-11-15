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
    spawnRadius: 360,
    // Shield defaults for support enemies (seconds)
    shieldOnDuration: 2.5,
    shieldOffDuration: 2.5,
    shieldRadius: 26,
    shieldFxColor: { r: 120, g: 220, b: 220 }
  },
  wave: {
    initialDelay: 3000,
    betweenWaveDelay: 5000,
    focusRewardPerWave: 1
  },
  particles: {
    maxParticles: 500
  },

  // NEW: per-slot spiral projectile cap (how many spiral projectiles a single spell slot may have active)
  limits: {
    spiralPerSlot: 6
  }
};

export const COLORS = {
  background: '#0a0a0a',
  ui: '#ffffff',
  uiAccent: '#333333'
};