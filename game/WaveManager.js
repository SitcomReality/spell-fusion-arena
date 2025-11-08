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
    const baseCount = 3 + Math.floor(this.currentWave * 1.5);
    
    for (let i = 0; i < baseCount; i++) {
      // Slight jitter to break perfect radial symmetry
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
      
      // Create enemy and assign a small randomized spawn delay so they start moving at slightly different times.
      // Delay: early waves get slightly larger spread and offset to ease difficulty, later waves tighten spread.
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