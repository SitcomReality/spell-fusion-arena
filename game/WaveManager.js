import { Enemy, ENEMY_TYPES } from '../entities/Enemy.js';
import { CONFIG } from '../config.js';

export class WaveManager {
  constructor(centerX, centerY) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.currentWave = 0;
    this.waveActive = false;
    this.timeSinceWave = 0;
    this.enemiesRemaining = 0;
  }
  
  update(dt) {
    if (!this.waveActive) {
      this.timeSinceWave += dt * 1000;
      
      const delay = this.currentWave === 0 ? CONFIG.wave.initialDelay : CONFIG.wave.betweenWaveDelay;
      
      if (this.timeSinceWave >= delay) {
        this.startNextWave();
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
    const baseCount = 5 + this.currentWave * 2;
    
    for (let i = 0; i < baseCount; i++) {
      const angle = (Math.PI * 2 * i) / baseCount + Math.random() * 0.5;
      const x = this.centerX + Math.cos(angle) * CONFIG.enemy.spawnRadius;
      const y = this.centerY + Math.sin(angle) * CONFIG.enemy.spawnRadius;
      
      let type;
      if (this.currentWave === 1) {
        type = ENEMY_TYPES.grunt;
      } else if (this.currentWave === 2) {
        type = Math.random() > 0.5 ? ENEMY_TYPES.grunt : ENEMY_TYPES.runner;
      } else {
        const rand = Math.random();
        if (rand < 0.5) type = ENEMY_TYPES.grunt;
        else if (rand < 0.85) type = ENEMY_TYPES.runner;
        else type = ENEMY_TYPES.tank;
      }
      
      enemies.push(new Enemy(x, y, type));
    }
    
    this.enemiesRemaining = enemies.length;
    return enemies;
  }
  
  enemyDefeated() {
    this.enemiesRemaining--;
    if (this.enemiesRemaining <= 0) {
      this.waveActive = false;
    }
  }
}

