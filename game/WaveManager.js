import { Enemy, ENEMY_TYPES } from '../entities/Enemy.js';
import { CONFIG } from '../config.js';
import { SeededRandom } from './SeededRandom.js';

export class WaveManager {
  constructor(centerX, centerY, seed = null) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.currentWave = 0;
    this.waveActive = false;
    this.timeSinceWave = 0;
    this.enemiesRemaining = 0;
    this.waveCompleteCallback = null;
    
    // NEW: Support seeded RNG for deterministic enemy spawning
    this.rng = new SeededRandom(seed);
  }
  
  update(dt) {
    if (!this.waveActive) {
      this.timeSinceWave += dt * 1000;
      
      const delay = this.currentWave === 0 ? CONFIG.wave.initialDelay : CONFIG.wave.betweenWaveDelay;
      
      if (this.timeSinceWave >= delay) {
        // Instead of starting immediately, signal that we're ready to show start button
        // The game will handle showing the UI and calling startNextWave() when player clicks
        // For now, just mark that we should transition
      }
    }
  }
  
  startNextWave() {
    this.currentWave++;
    this.waveActive = true;
    this.timeSinceWave = 0;
  }
  
  spawnWave() {
    const enemies = [];
    
    // Check if this is a boss wave (every 5th wave)
    const isBossWave = this.currentWave > 0 && this.currentWave % 5 === 0;
    
    if (isBossWave) {
      return this.spawnBossWave();
    }
    
    const baseCount = 3 + Math.floor(this.currentWave * 1.5);
    
    for (let i = 0; i < baseCount; i++) {
      const angle = (Math.PI * 2 * i) / baseCount + (this.rng.next() - 0.5) * 0.4;
      const x = this.centerX + Math.cos(angle) * CONFIG.enemy.spawnRadius;
      const y = this.centerY + Math.sin(angle) * CONFIG.enemy.spawnRadius;
      
      let type;
      if (this.currentWave === 1) {
        type = ENEMY_TYPES.grunt;
      } else if (this.currentWave === 2) {
        type = this.rng.next() > 0.5 ? ENEMY_TYPES.grunt : ENEMY_TYPES.runner;
      } else {
        const rand = this.rng.next();
        if (rand < 0.5) type = ENEMY_TYPES.grunt;
        else if (rand < 0.85) type = ENEMY_TYPES.runner;
        else type = ENEMY_TYPES.tank;
      }
      
      const spawnSpread = this.currentWave <= 2 ? 1.2 : 0.9;
      const baseOffset = this.currentWave <= 2 ? 0.5 : 0.2;
      const spawnDelay = baseOffset + this.rng.next() * spawnSpread;
      const e = new Enemy(x, y, type);
      e.spawnDelay = spawnDelay;
      enemies.push(e);
    }
    
    this.enemiesRemaining = enemies.length;
    return enemies;
  }

  spawnBossWave() {
    const enemies = [];
    
    // Boss number: 1st boss at wave 5, 2nd at wave 10, etc.
    const bossNumber = this.currentWave / 5;
    
    // Pick a random boss type
    const bossTypes = ['mammoth', 'agile', 'double'];
    const bossTypeKey = bossTypes[this.rng.nextInt(0, bossTypes.length)];
    const bossType = ENEMY_TYPES[bossTypeKey];
    
    // Spawn boss(es) at evenly spaced positions around the spawn radius
    const baseAngle = Math.PI * 1.5; // default incoming direction (from bottom)
    // Determine how many bosses to spawn:
    // - base 1 boss per boss wave
    // - add extra bosses every 15 levels (floor(currentWave / 15))
    const extraFrom15 = Math.floor(this.currentWave / 15);
    const totalBosses = 1 + extraFrom15;

    // Choose a spawn radius for bosses (kept slightly smaller to engage quicker)
    const bossSpawnRadius = 320;

    // Spread bosses evenly around the circle to avoid clustering
    for (let i = 0; i < totalBosses; i++) {
      // Even spacing around the circle, rotate around baseAngle so they generally come from bottom
      const angle = baseAngle + (i * (Math.PI * 2) / totalBosses) + (this.rng.next() - 0.5) * 0.08; // slight jitter
      const x = this.centerX + Math.cos(angle) * bossSpawnRadius;
      const y = this.centerY + Math.sin(angle) * bossSpawnRadius;

      if (bossTypeKey === 'double') {
        // For 'double' boss type keep the original double-specific flags, but allow multiple spawned parts.
        const part = new Enemy(x, y, bossType);
        part.bossNumber = bossNumber;
        part.doubleBossId = `double-${bossNumber}-${i + 1}`;
        enemies.push(part);
      } else {
        const boss = new Enemy(x, y, bossType);
        boss.bossNumber = bossNumber;
        enemies.push(boss);
      }
    }
    
    this.enemiesRemaining = enemies.length;
    return enemies;
  }
  
  enemyDefeated() {
    this.enemiesRemaining--;
    if (this.enemiesRemaining <= 0) {
      this.waveActive = false;
      if (this.waveCompleteCallback) {
        this.waveCompleteCallback(this.currentWave);
      }
    }
  }

  onWaveComplete(callback) {
    this.waveCompleteCallback = callback;
  }
}