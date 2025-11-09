    // Update knockback on enemies
    for (const enemy of this.enemies) {
      if (enemy.knockbackTimer && enemy.knockbackTimer > 0) {
        enemy.knockbackTimer -= scaledDt;
        enemy.x += enemy.knockbackVx * scaledDt;
        enemy.y += enemy.knockbackVy * scaledDt;
        enemy.knockbackVx *= 0.85;
        enemy.knockbackVy *= 0.85;

        // Prevent bosses from being knocked beyond the spawn radius.
        // If they exceed the radius, clamp their position to the radius and damp remaining knockback.
        try {
          if (enemy.type && enemy.type.isBoss) {
            const dx = enemy.x - this.centerX;
            const dy = enemy.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxR = CONFIG.enemy.spawnRadius;
            if (dist > maxR && dist > 0.0001) {
              const ratio = maxR / dist;
              enemy.x = this.centerX + dx * ratio;
              enemy.y = this.centerY + dy * ratio;
              // Reduce lingering knockback so boss doesn't repeatedly fight the boundary
              enemy.knockbackVx *= 0.3;
              enemy.knockbackVy *= 0.3;
            }
          }
        } catch (e) {
          // Non-critical; fail silently if enemy/type unavailable
        }
      }
    }

