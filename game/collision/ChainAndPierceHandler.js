export class ChainAndPierceHandler {
  constructor(game) {
    this.game = game;
  }

  // Returns true if projectile should die after processing chaining/piercing
  handleChainAndPierce(projectile, enemy) {
    // Handle piercing
    const pierceIntensity = projectile.properties.piercing || 0;
    const maxPierces = Math.floor(pierceIntensity) + 1;
    const pierceCount = (projectile.pierceCount || 0);

    let shouldDie = false;
    if (pierceCount >= maxPierces) {
      shouldDie = true;
    } else {
      projectile.pierceCount = pierceCount + 1;
    }

    // Handle chaining if still alive
    const chainingIntensity = projectile.properties.chaining || 0;
    if (!shouldDie && chainingIntensity > 0) {
      const chainedEnemies = projectile.chainedEnemies || [];
      chainedEnemies.push(enemy);
      projectile.chainedEnemies = chainedEnemies;

      const nextTarget = this.findChainTarget(projectile, chainedEnemies);
      if (nextTarget) {
        this.redirectProjectile(projectile, nextTarget);
      } else {
        shouldDie = true;
      }
    } else if (!shouldDie && !chainingIntensity) {
      shouldDie = true;
    }

    return shouldDie;
  }

  findChainTarget(currentProjectile, chainedEnemies) {
    const game = this.game;
    const chainRange = 150;
    let nearest = null;
    let minDist = chainRange;

    for (const enemy of game.enemies) {
      if (!enemy.alive || chainedEnemies.includes(enemy)) continue;

      const dx = enemy.x - currentProjectile.x;
      const dy = enemy.y - currentProjectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  redirectProjectile(projectile, targetEnemy) {
    const dx = targetEnemy.x - projectile.x;
    const dy = targetEnemy.y - projectile.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = projectile.spell.properties.speed;

    if (dist > 0) {
      projectile.vx = (dx / dist) * speed;
      projectile.vy = (dy / dist) * speed;
    }
  }
}