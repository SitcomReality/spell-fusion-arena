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
    
    // Spawn boss at the spawn radius
    const angle = Math.PI * 1.5; // come from bottom
    const x = this.centerX + Math.cos(angle) * CONFIG.enemy.spawnRadius;
    const y = this.centerY + Math.sin(angle) * CONFIG.enemy.spawnRadius;
    
    if (bossTypeKey === 'double') {
      // Two bosses side by side
      const offset = 60;
      const boss1 = new Enemy(x - offset, y, bossType);
      const boss2 = new Enemy(x + offset, y, bossType);
      boss1.bossNumber = bossNumber;
      boss2.bossNumber = bossNumber;
      boss1.doubleBossId = 'double-' + bossNumber + '-1';
      boss2.doubleBossId = 'double-' + bossNumber + '-2';
      enemies.push(boss1, boss2);
    } else {
      const boss = new Enemy(x, y, bossType);
      boss.bossNumber = bossNumber;
      enemies.push(boss);
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