export class TargetFinder {
  static findNearestEnemy(x, y, enemies) {
    let nearest = null;
    let minDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  static findByPreference(x, y, enemies, preference) {
    switch (preference) {
      case 'nearest':
        return this.findNearestEnemy(x, y, enemies);
      case 'furthest':
        return this.findFurthestEnemy(x, y, enemies);
      case 'strongest':
        return this.findStrongestEnemy(x, y, enemies);
      case 'weakest':
        return this.findWeakestEnemy(x, y, enemies);
      default:
        return this.findNearestEnemy(x, y, enemies);
    }
  }

  static findFurthestEnemy(x, y, enemies) {
    let furthest = null;
    let maxDist = -Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const dist = dx * dx + dy * dy;
      if (dist > maxDist) {
        maxDist = dist;
        furthest = enemy;
      }
    }

    return furthest;
  }

  static findStrongestEnemy(x, y, enemies) {
    let strongest = null;
    let maxHealth = -Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const alivePixels = enemy.pixelBody.getAlivePixels().length;
      if (alivePixels > maxHealth) {
        maxHealth = alivePixels;
        strongest = enemy;
      }
    }

    return strongest;
  }

  static findWeakestEnemy(x, y, enemies) {
    let weakest = null;
    let minHealth = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const alivePixels = enemy.pixelBody.getAlivePixels().length;
      if (alivePixels < minHealth && alivePixels > 0) {
        minHealth = alivePixels;
        weakest = enemy;
      }
    }

    return weakest;
  }
}