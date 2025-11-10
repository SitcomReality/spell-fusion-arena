import { PixelBody } from './PixelBody.js';
import { CONFIG } from '../config.js';
import { updatePosition, updateAgileBossMovement } from './EnemyMovement.js';
import {
  updateStatusEffects,
  applySlowing,
  applyBurning,
  applyPoison,
  takeBurnDamage,
  takePoisonDamage,
  emitDoTParticles
} from './EnemyStatus.js';
import { ENEMY_TYPES } from './EnemyTypes.js';

export class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.speed = type.speed;
    this.baseSpeed = type.speed;
    this.color = type.color;

    this.pixelBody = new PixelBody(type.width, type.height, type.pattern);

    this.statusEffects = {
      burning: { active: false, duration: 0, damage: 0, color: null },
      poison: { active: false, duration: 0, damage: 0, color: null },
      slowing: { active: false, duration: 0, slowAmount: 0 }
    };
    this.burnTickTimer = 0;
    this.poisonTickTimer = 0;

    this.particleRequests = [];
    this.spawnDelay = 0;

    this.bossNumber = 0;
    this.doubleBossId = null;

    this.agilePhase = 0;
    this.agilePhaseTimer = 0;

    this.bossWobbleTimer = 0;
  }

  update(dt, centerX, centerY) {
    if (!this.alive) return;

    // Movement & spawn handling delegated to movement module
    updatePosition(this, dt, centerX, centerY);

    // Status effects delegated to status module
    updateStatusEffects(this, dt);
  }

  applySlowing(duration, slowAmount) {
    applySlowing(this, duration, slowAmount);
  }

  applyBurning(duration, damagePerTick, color) {
    applyBurning(this, duration, damagePerTick, color);
  }

  applyPoison(duration, damagePerTick, color) {
    applyPoison(this, duration, damagePerTick, color);
  }

  takeBurnDamage(damage) {
    takeBurnDamage(this, damage);
  }

  takePoisonDamage(damage) {
    takePoisonDamage(this, damage);
  }

  emitDoTParticles(type, color) {
    emitDoTParticles(this, type, color);
  }

  takeDamageFromSource(sourceX, sourceY, destructionRadius, destructionType = 'explosive') {
    const localX = sourceX - (this.x - this.type.width / 2);
    const localY = sourceY - (this.y - this.type.height / 2);

    const destroyed = this.pixelBody.damage(
      localX,
      localY,
      destructionRadius,
      destructionType
    );

    return destroyed > 0;
  }

  takeDamage(projectile) {
    const destructionRadius = projectile.radius * 2;
    const destroyed = this.takeDamageFromSource(
      projectile.x,
      projectile.y,
      destructionRadius,
      'explosive'
    );

    return destroyed > 0;
  }
}

export { ENEMY_TYPES }; // re-export centralized enemy type definitions for backwards compatibility

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

  // Boss types
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
    // Make agile boss ~50% larger for a more imposing presence
    width: 30, // 20 * 1.5
    height: 30,
    pattern: 'blob',
    color: { r: 200, g: 100, b: 150 },
    isBoss: true,
    bossType: 'agile'
  },

  double: {
    name: 'Double',
    speed: 22,
    // Make each part of the double boss ~50% larger
    width: 36, // 24 * 1.5
    height: 36,
    pattern: 'blob',
    color: { r: 150, g: 150, b: 200 },
    isBoss: true,
    bossType: 'double',
    isDoublePart: true // flag for the individual parts
  }
};