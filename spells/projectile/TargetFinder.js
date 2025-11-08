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
}

