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
      const angle = this.rng.next() * Math.PI * 2;
      const x = this.centerX + Math.cos(angle) * CONFIG.enemy.spawnRadius;
      const y = this.centerY + Math.sin(angle) * CONFIG.enemy.spawnRadius;
      
      let type;
      if (this.currentWave === 1) {
        type = ENEMY_TYPES.grunt;
      } else if (this.currentWave === 2) {
        type = this.rng.next() > 0.5 ? ENEMY_TYPES.grunt : ENEMY_TYPES.runner;
      } else {
        const rand = this.rng.next();
        // Regular enemy pool order: grunt, runner, tank, spiraler, dasher
        // Base probabilities but dasher chance scales up with wave number so dashers become common later.
        const baseGrunt = 0.45;
        const baseRunner = 0.30;
        const baseTank = 0.15;
        const spiralerChance = 0.05; // keep spiraler rare
        // Increase dasher chance by 1% per wave up to 25%
        const dasherChance = Math.min(0.25, 0.05 + (this.currentWave * 0.01));
        // Support enemy chance: starts small and grows slowly per wave up to ~14%
        const supportChance = Math.min(0.14, 0.06 + (this.currentWave * 0.005));
        // Normalize remaining probability to keep total = 1 (favoring grunt/runner/tank)
        const remaining = 1 - spiralerChance - dasherChance - supportChance;
        const gruntShare = baseGrunt / (baseGrunt + baseRunner + baseTank);
        const runnerShare = baseRunner / (baseGrunt + baseRunner + baseTank);
        const tankShare = baseTank / (baseGrunt + baseRunner + baseTank);
        
        const gCut = remaining * gruntShare;
        const rCut = remaining * runnerShare;
        const tCut = remaining * tankShare;
        
        if (rand < gCut) {
          type = ENEMY_TYPES.grunt;
        } else if (rand < gCut + rCut) {
          type = ENEMY_TYPES.runner;
        } else if (rand < gCut + rCut + tCut) {
          type = ENEMY_TYPES.tank;
        } else if (rand < gCut + rCut + tCut + spiralerChance) {
          type = ENEMY_TYPES.spiraler || ENEMY_TYPES.grunt;
        } else if (rand < gCut + rCut + tCut + spiralerChance + supportChance) {
          type = ENEMY_TYPES.support || ENEMY_TYPES.grunt;
        } else {
          type = ENEMY_TYPES.dasher || ENEMY_TYPES.grunt;
        }
      }
      
      const e = new Enemy(x, y, type);
      e.spawnDelay = i * 0.5;
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
    // Ensure 'spiraler' type (if present) is appended last to the spawn pool so spiral enemies appear at the end.
    // NOTE: spiraler enemies are intentionally NOT appended during boss waves to avoid a
    // lone spiraler appearing alongside bosses; spiraler spawns are handled by regular waves.
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