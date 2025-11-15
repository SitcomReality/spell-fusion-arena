export class PropertyApplier {
  static applyProperties(projectile, enemy, gameState) {
    const props = projectile.properties;

    // NEW: If the enemy hasn't finished spawning / fading in, do not apply properties.
    // This prevents AoE/explosion side-effects or DoT being applied to invisible pre-spawn enemies.
    if (!enemy || !enemy.alive) return;
    if ((enemy.spawnDelay && enemy.spawnDelay > 0) || (enemy.alpha !== undefined && enemy.alpha < 1)) {
      return;
    }
    
    // Lifesteal (NEW)
    if (props.lifesteal && props.lifesteal > 0 && gameState && gameState.player) {
      // Chance to proc: increases with lifesteal property strength
      // Clamp chance to 100% (max 1.0)
      const procChance = Math.min(1.0, 0.1 + props.lifesteal * 0.08 * (projectile.potencyMultiplier || 1));
      
      if (Math.random() < procChance) {
        // Heal player for 1 HP per proc, as per prompt
        gameState.player.receiveHealing(1);
        // Emit floating heal text at projectile position (where effect happened)
        try {
          gameState.particles.push({
            type: 'floating-text',
            x: projectile.x,
            y: projectile.y,
            vx: 0,
            vy: -28,
            text: '+1',
            color: { r: 160, g: 255, b: 160 },
            size: 14,
            life: 0.8,
            maxLife: 0.8,
            opacity: 1
          });
        } catch (e) {}
      }
    }

    // Knockback
    if (props.knockback && props.knockback > 0) {
      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        // Base knockback force
        let knockbackForce = 150 * props.knockback;

        // If target is a boss, reduce knockback power based on distance from center (player)
        try {
          if (enemy.type && enemy.type.isBoss && gameState && gameState.centerX !== undefined) {
            const toCenterX = enemy.x - gameState.centerX;
            const toCenterY = enemy.y - gameState.centerY;
            const curDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
            const spawnR = (gameState && gameState.width && gameState.height) ? (gameState.waveManager ? (gameState.waveManager.rng ? (gameState.waveManager.rng, (gameState.waveManager && gameState.waveManager.rng) && undefined) : undefined) : undefined) : undefined;
            // Fallback to CONFIG spawnRadius if waveManager data unavailable
          }
        } catch (e) { /* silent */ }

        // Compute reduction multiplier (default no reduction)
        let reduction = 0;
        try {
          // Prefer CONFIG value if available
          const spawnRadius = (typeof CONFIG !== 'undefined' && CONFIG.enemy && CONFIG.enemy.spawnRadius) ? CONFIG.enemy.spawnRadius : 360;
          if (enemy.type && enemy.type.isBoss && gameState && gameState.centerX !== undefined) {
            const toCenterX = enemy.x - gameState.centerX;
            const toCenterY = enemy.y - gameState.centerY;
            const curDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
            const distFrac = Math.max(0, Math.min(1, curDist / spawnRadius));
            if (enemy.type.bossType === 'agile' || enemy.type.bossType === 'double') {
              reduction = 0.5; // 50% reduction at spawn edge
            } else if (enemy.type.bossType === 'mammoth') {
              reduction = 1.0; // 100% reduction at spawn edge (no knockback at edge)
            }
            const multiplier = 1 - (reduction * distFrac); // linear from center (1) -> edge (1-reduction)
            knockbackForce *= multiplier;
          }
        } catch (e) { /* silent fallback - no reduction */ }

        enemy.knockbackVx = (dx / dist) * knockbackForce;
        enemy.knockbackVy = (dy / dist) * knockbackForce;
        enemy.knockbackTimer = 0.2;
      }
    }
    
    // Slowing
    if (props.slowing && props.slowing > 0) {
      const duration = 2 + props.slowing * 2;
      const slowAmount = Math.min(0.7, 0.3 + props.slowing * 0.1);
      enemy.applySlowing(duration, slowAmount);
    }
    
    // General DoT (treat as burning effect)
    if (props.dot && props.dot > 0) {
      const duration = 2 + props.dot * 1.5;
      const damagePerTick = Math.max(1, projectile.spell.properties.damage * props.dot * 0.15);
      enemy.applyBurning(duration, damagePerTick, projectile.spell.color);
    }
    
    // Poison
    if (props.poison && props.poison > 0) {
      const duration = 3 + props.poison * 2;
      const damagePerTick = Math.max(1, projectile.spell.properties.damage * props.poison * 0.1);
      enemy.applyPoison(duration, damagePerTick, projectile.spell.color);
    }
  }
}