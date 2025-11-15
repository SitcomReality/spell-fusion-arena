export const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    speed: 15,
    width: 16,
    height: 16,
    pattern: 'blob',
    color: { r: 180, g: 50, b: 50 }
  },

  runner: {
    name: 'Runner',
    speed: 30,
    width: 12,
    height: 12,
    pattern: 'blob',
    color: { r: 50, g: 180, b: 50 }
  },

  tank: {
    name: 'Tank',
    speed: 12,
    width: 24,
    height: 24,
    pattern: 'square',
    color: { r: 80, g: 80, b: 180 }
  },

  mammoth: {
    name: 'Mammoth',
    speed: 8,
    width: 48,
    height: 48,
    pattern: 'square',
    color: { r: 100, g: 80, b: 60 },
    isBoss: true,
    bossType: 'mammoth'
  },

  agile: {
    name: 'Agile',
    speed: 35,
    width: 30,
    height: 30,
    pattern: 'blob',
    color: { r: 200, g: 100, b: 150 },
    isBoss: true,
    bossType: 'agile'
  },

  double: {
    name: 'Double',
    speed: 22,
    width: 36,
    height: 36,
    pattern: 'blob',
    color: { r: 150, g: 150, b: 200 },
    isBoss: true,
    bossType: 'double',
    isDoublePart: true
  },

  // New enemy type: Spiraler — orbits the player while spiraling inward
  spiraler: {
    name: 'Spiraler',
    speed: 26,
    width: 18,
    height: 18,
    pattern: 'blob',
    color: { r: 200, g: 120, b: 220 },
    // movePattern 'spiral' triggers updateSpiralEnemyMovement in EnemyMovement
    movePattern: 'spiral'
  },

  dasher: {
    name: 'Dasher',
    speed: 28,
    width: 14,
    height: 14,
    pattern: 'blob',
    color: { r: 100, g: 200, b: 150 },
    movePattern: 'dasher'
  },

  // New support enemy: periodically toggles a local shield
  support: {
    name: 'Support',
    speed: 16,
    width: 18,
    height: 18,
    pattern: 'blob',
    color: { r: 80, g: 200, b: 180 },
    movePattern: 'standard'
  }
};

export default ENEMY_TYPES;