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

  if (enemy.type.bossType === 'agile') {
    updateAgileBossMovement(enemy, dt, centerX, centerY, dx, dy, dist);
  } else {
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