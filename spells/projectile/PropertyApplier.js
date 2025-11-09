export class PropertyApplier {
  static applyProperties(projectile, enemy, gameState) {
    const props = projectile.properties;
    
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
        const knockbackForce = 150 * props.knockback;
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