// New: movement-related logic for Enemy (extracted from previous Enemy class)
export function updatePosition(enemy, dt, centerX, centerY) {
  if (!enemy.alive) return;

  if (enemy.spawnDelay && enemy.spawnDelay > 0) {
    enemy.spawnDelay -= dt;
    if (enemy.spawnDelay <= 0) {
      enemy.spawnDelay = 0;
      enemy.speed = enemy.baseSpeed;
    } else {
      return;
    }
  }

  const dx = centerX - enemy.x;
  const dy = centerY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // New: support custom movement pattern 'spiral' for enemies that orbit while closing in
  try {
    if (enemy.type && enemy.type.movePattern === 'spiral') {
      updateSpiralEnemyMovement(enemy, dt, centerX, centerY, dx, dy, dist);
      // after spiral movement, continue to boss wobble/clamp logic below
    } else if (enemy.type && enemy.type.movePattern === 'dasher') {
      updateDasherMovement(enemy, dt, centerX, centerY, dx, dy, dist);
    } else if (enemy.type.bossType === 'agile') {
      updateAgileBossMovement(enemy, dt, centerX, centerY, dx, dy, dist);
    } else {
      if (dist > 5) {
        enemy.x += (dx / dist) * enemy.speed * dt;
        enemy.y += (dy / dist) * enemy.speed * dt;
      }
    }
  } catch (e) {
    // fallback to basic movement
    if (dist > 5) {
      enemy.x += (dx / dist) * enemy.speed * dt;
      enemy.y += (dy / dist) * enemy.speed * dt;
    }
  }

  // Gentle lateral wobble for non-agile bosses
  try {
    if (enemy.type && enemy.type.isBoss && enemy.type.bossType !== 'agile') {
      enemy.bossWobbleTimer += dt;
      const wobbleFreq = 1.2;
      const wobbleAmpByType = enemy.type.bossType === 'mammoth' ? 10 : 6;
      const perpAngle = Math.atan2(dy, dx) + (Math.PI / 2);
      const wobbleOffset = Math.sin(enemy.bossWobbleTimer * Math.PI * 2 * wobbleFreq) * wobbleAmpByType;
      enemy.x += Math.cos(perpAngle) * wobbleOffset * dt;
      enemy.y += Math.sin(perpAngle) * wobbleOffset * dt;
    }
  } catch (e) { /* silent */ }

  // Clamp boss positions and damp knockback if outside spawn radius
  try {
    if (enemy.type && enemy.type.isBoss) {
      const maxR = (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.enemy && window.CONFIG.enemy.spawnRadius) ? window.CONFIG.enemy.spawnRadius : 360;
      const toCenterX = enemy.x - centerX;
      const toCenterY = enemy.y - centerY;
      const curDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
      if (curDist > maxR) {
        const nx = (toCenterX / curDist) * maxR;
        const ny = (toCenterY / curDist) * maxR;
        enemy.x = centerX + nx;
        enemy.y = centerY + ny;

        if (enemy.knockbackVx !== undefined && enemy.knockbackVy !== undefined) {
          enemy.knockbackVx *= 0.3;
          enemy.knockbackVy *= 0.3;
          enemy.knockbackTimer = Math.max(0, (enemy.knockbackTimer || 0) - 0.05);
        }
      }
    }
  } catch (e) { /* silent fallback */ }

  if (!enemy.pixelBody.intact) {
    enemy.alive = false;
  }
}

export function updateAgileBossMovement(enemy, dt, centerX, centerY, dx, dy, dist) {
  enemy.agilePhaseTimer += dt;
  if (enemy.agilePhaseTimer >= 1.0) {
    enemy.agilePhase = (enemy.agilePhase + 1) % 2;
    enemy.agilePhaseTimer = 0;
  }

  if (dist > 5) {
    enemy.x += (dx / dist) * enemy.speed * dt;
    enemy.y += (dy / dist) * enemy.speed * dt;
  }

  if (dist > 0) {
    const perpAngle = Math.atan2(dy, dx) + (Math.PI / 2);
    const strafeSpeed = enemy.speed * 1.15;
    const strafeDir = enemy.agilePhase === 0 ? 1 : -1;
    const lateralMultiplier = 2.0;
    enemy.x += Math.cos(perpAngle) * strafeSpeed * strafeDir * dt * lateralMultiplier;
    enemy.y += Math.sin(perpAngle) * strafeSpeed * strafeDir * dt * lateralMultiplier;
  }
}

// New: spiral-orbit enemy movement - enemy orbits the center while its orbit radius slowly shrinks
export function updateSpiralEnemyMovement(enemy, dt, centerX, centerY, dx, dy, dist) {
  // Initialize spiral state on first tick
  if (enemy._spiralInitialized !== true) {
    enemy._spiralInitialized = true;
    // starting radius is current distance or spawnRadius if not set
    enemy._spiralRadius = dist || Math.hypot(enemy.x - centerX, enemy.y - centerY) || 200;
    // angle around center
    enemy._spiralAngle = Math.atan2(enemy.y - centerY, enemy.x - centerX);
    // rotation direction: clockwise or ccw
    enemy._spiralDirection = Math.random() < 0.5 ? 1 : -1;
    // rotation speed scales with enemy base speed
    // Lower base multiplier and smaller additive offset to slow orbital rotation for spiraler enemies
    enemy._spiralRotationSpeed = (enemy.speed || 20) * 0.03 + 0.5;
    // inward shrink rate: how fast radius decreases (units per second)
    // Reduce inward shrink so the orbit decays more gently
    enemy._spiralInward = Math.max(4, (enemy.speed || 20) * 0.4);
  }

  // Gradually decrease radius so orbit shrinks toward player
  enemy._spiralRadius = Math.max(6, enemy._spiralRadius - enemy._spiralInward * dt);

  // Advance angle
  enemy._spiralAngle += enemy._spiralRotationSpeed * dt * enemy._spiralDirection;

  // Optional wobble to make motion more organic
  const wobble = (Math.sin((enemy._spiralAngle || 0) * 3.1) * 6) * (0.5 + (enemy.speed || 20) / 200);

  // Compute new position relative to center
  const nextX = centerX + Math.cos(enemy._spiralAngle) * (enemy._spiralRadius + wobble);
  const nextY = centerY + Math.sin(enemy._spiralAngle) * (enemy._spiralRadius + wobble);

  // Update velocity fields for compatibility with other systems (knockback/orientation)
  enemy.vx = (nextX - enemy.x) / Math.max(1e-6, dt);
  enemy.vy = (nextY - enemy.y) / Math.max(1e-6, dt);

  enemy.x = nextX;
  enemy.y = nextY;
}

// New: dasher movement - strafes left/right while approaching like agile boss
export function updateDasherMovement(enemy, dt, centerX, centerY, dx, dy, dist) {
  enemy.dasherPhaseTimer = (enemy.dasherPhaseTimer || 0) + dt;
  if (enemy.dasherPhaseTimer >= 0.8) {
    enemy.dasherPhase = ((enemy.dasherPhase || 0) + 1) % 2;
    enemy.dasherPhaseTimer = 0;
  }

  // Move toward center
  if (dist > 5) {
    enemy.x += (dx / dist) * enemy.speed * dt;
    enemy.y += (dy / dist) * enemy.speed * dt;
  }

  // Strafe left/right
  if (dist > 0) {
    const perpAngle = Math.atan2(dy, dx) + (Math.PI / 2);
    const strafeSpeed = enemy.speed * 1.2;
    const strafeDir = enemy.dasherPhase === 0 ? 1 : -1;
    enemy.x += Math.cos(perpAngle) * strafeSpeed * strafeDir * dt;
    enemy.y += Math.sin(perpAngle) * strafeSpeed * strafeDir * dt;
  }
}