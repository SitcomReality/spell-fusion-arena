// New: status-update and DoT related logic for Enemy (extracted from previous Enemy class)
import { CONFIG } from '../config.js';

export function updateStatusEffects(enemy, dt) {
  // Slowing
  if (enemy.statusEffects.slowing.active) {
    enemy.statusEffects.slowing.duration -= dt;
    if (enemy.statusEffects.slowing.duration <= 0) {
      enemy.statusEffects.slowing.active = false;
      enemy.speed = enemy.baseSpeed;
    } else {
      enemy.speed = enemy.baseSpeed * (1 - enemy.statusEffects.slowing.slowAmount);
    }
  }

  // Burning
  if (enemy.statusEffects.burning.active) {
    enemy.statusEffects.burning.duration -= dt;
    enemy.burnTickTimer -= dt;

    if (enemy.statusEffects.burning.duration <= 0) {
      enemy.statusEffects.burning.active = false;
    } else if (enemy.burnTickTimer <= 0) {
      takeBurnDamage(enemy, enemy.statusEffects.burning.damage);
      emitDoTParticles(enemy, 'burning', enemy.statusEffects.burning.color);
      enemy.burnTickTimer = 0.3;
    }
  }

  // Poison
  if (enemy.statusEffects.poison.active) {
    enemy.statusEffects.poison.duration -= dt;
    enemy.poisonTickTimer -= dt;

    if (enemy.statusEffects.poison.duration <= 0) {
      enemy.statusEffects.poison.active = false;
    } else if (enemy.poisonTickTimer <= 0) {
      takePoisonDamage(enemy, enemy.statusEffects.poison.damage);
      emitDoTParticles(enemy, 'poison', enemy.statusEffects.poison.color);
      enemy.poisonTickTimer = 0.25;
    }
  }
}

export function updateShield(enemy, dt) {
  if (typeof enemy.shieldActive === 'undefined') return;
  // Initialize timer if unset
  if (typeof enemy.shieldTimer !== 'number' || enemy.shieldTimer === 0) {
    // prefer per-enemy values, fall back to CONFIG defaults
    const offDur = (typeof enemy.shieldOffDuration === 'number') ? enemy.shieldOffDuration : (CONFIG.enemy && CONFIG.enemy.shieldOffDuration) || 2.5;
    enemy.shieldTimer = offDur;
    enemy.shieldActive = false;
    enemy.invulnerable = false;
  }

  enemy.shieldTimer -= dt;
  if (enemy.shieldActive) {
    if (enemy.shieldTimer <= 0) {
      // turn off
      enemy.shieldActive = false;
      enemy.invulnerable = false;
      enemy.shieldTimer = (typeof enemy.shieldOffDuration === 'number') ? enemy.shieldOffDuration : (CONFIG.enemy && CONFIG.enemy.shieldOffDuration) || 2.5;
    }
  } else {
    if (enemy.shieldTimer <= 0) {
      // turn on
      enemy.shieldActive = true;
      enemy.invulnerable = true;
      enemy.shieldTimer = (typeof enemy.shieldOnDuration === 'number') ? enemy.shieldOnDuration : (CONFIG.enemy && CONFIG.enemy.shieldOnDuration) || 2.5;
    }
  }
}

export function applySlowing(enemy, duration, slowAmount) {
  if (!enemy.statusEffects.slowing.active || enemy.statusEffects.slowing.duration < duration) {
    enemy.statusEffects.slowing.active = true;
    enemy.statusEffects.slowing.duration = duration;
    enemy.statusEffects.slowing.slowAmount = Math.min(slowAmount, 0.8);
  }
}

export function applyBurning(enemy, duration, damagePerTick, color) {
  if (!enemy.statusEffects.burning.active || enemy.statusEffects.burning.duration < duration) {
    enemy.statusEffects.burning.active = true;
    enemy.statusEffects.burning.duration = duration;
    enemy.statusEffects.burning.damage = damagePerTick;
    enemy.statusEffects.burning.color = color;
    enemy.burnTickTimer = 0;
  }
}

export function applyPoison(enemy, duration, damagePerTick, color) {
  if (!enemy.statusEffects.poison.active || enemy.statusEffects.poison.duration < duration) {
    enemy.statusEffects.poison.active = true;
    enemy.statusEffects.poison.duration = duration;
    enemy.statusEffects.poison.damage = damagePerTick;
    enemy.statusEffects.poison.color = color;
    enemy.poisonTickTimer = 0;
  }
}

export function takeBurnDamage(enemy, damage) {
  const localX = enemy.x;
  const localY = enemy.y;
  enemy.pixelBody.damage(enemy.type.width / 2, enemy.type.height / 2, enemy.type.width / 3);
}

export function takePoisonDamage(enemy, damage) {
  enemy.pixelBody.damage(enemy.type.width / 2, enemy.type.height / 2, enemy.type.width / 4);
}

export function emitDoTParticles(enemy, type, color) {
  if (!color) return;
  const isBurn = type === 'burning';
  const minCount = isBurn ? 3 : 2;
  const maxCount = isBurn ? 6 : 4;
  const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (isBurn ? 20 : 8) + Math.random() * (isBurn ? 40 : 16);
    const particleType = isBurn ? 'spark' : 'smoke';
    const size = isBurn ? (1 + Math.random() * 1.5) : (1.5 + Math.random() * 1.5);
    const life = (isBurn ? 0.25 : 0.35) + Math.random() * (isBurn ? 0.35 : 0.45);
    const spreadX = (Math.random() - 0.5) * enemy.type.width * (isBurn ? 0.5 : 0.7);
    const spreadY = (Math.random() - 0.5) * enemy.type.height * (isBurn ? 0.5 : 0.7);

    enemy.particleRequests.push({
      x: enemy.x + spreadX,
      y: enemy.y + spreadY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurn ? Math.random() * 10 : 0),
      color: color,
      life: life,
      maxLife: life,
      size: size,
      type: particleType,
      opacity: isBurn ? 0.95 : 0.85
    });
  }
}