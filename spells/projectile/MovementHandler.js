import { TargetFinder } from './TargetFinder.js';

export class MovementHandler {
  static initMovement(projectile, targetX, targetY) {
    const properties = projectile.spell.properties;
    const spiral = properties.spiral || 0;
    const wave = properties.wave || 0;
    const homing = properties.homing || 0;

    // Trigger spiral mode if spiral is meaningful (>0.5) and is greater than
    // the average influence of homing and wave (more permissive than requiring > (wave+homing)).
    if (spiral > 0.5 && spiral > ((homing * 0.5) + (wave * 0.5))) {
      this.initSpiral(projectile, targetX, targetY);
    } else {
      this.initStandard(projectile, targetX, targetY);
    }
  }

  static initStandard(projectile, targetX, targetY) {
    const speed = projectile.spell.properties.speed;
    const dx = targetX - projectile.x;
    const dy = targetY - projectile.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (projectile.spell.properties.lob) {
      projectile.vx = (dx / dist) * speed * 0.7;
      projectile.vy = (dy / dist) * speed * 0.7 - 100;
      projectile.gravity = 200;
    } else {
      projectile.vx = (dx / dist) * speed;
      projectile.vy = (dy / dist) * speed;
      projectile.gravity = 0;
    }
  }

  static initSpiral(projectile, targetX, targetY) {
    const spiral = projectile.properties.spiral;
    const wave = projectile.properties.wave || 0;
    const homing = projectile.properties.homing || 0;
    const baseSpeed = projectile.spell.properties.speed || 150;

    projectile.movementType = 'spiral';
    projectile.spiralOriginX = projectile.x;
    projectile.spiralOriginY = projectile.y;
    projectile.spiralAngle = Math.atan2(targetY - projectile.y, targetX - projectile.x);

    // Spiral radius varies with Spiral value and Speed:
    // - At 0.5 Spiral: looser/larger orbit (faster growth)
    // - Higher Spiral values: tighter/smaller orbit (slower growth)
    // - Higher Speed: slightly larger radius
    const speedFactor = 1 + (baseSpeed - 150) / 800;
    const spiralCompactness = 1 - Math.max(0, (spiral - 0.5) * 0.6);
    projectile.spiralRadius = Math.max(1, projectile.radius * 1.0 * spiralCompactness * speedFactor);

    projectile.spiralDirection = Math.random() < 0.5 ? 1 : -1;

    // Outward expansion inversely related to Spiral value
    const outwardMultiplier = 1 - Math.max(0, (spiral - 0.5) * 0.5);
    projectile.spiralOutwardSpeed = baseSpeed * 0.25 * outwardMultiplier;

    // Rotation speed
    projectile.spiralRotationSpeed = 4 + spiral * 2.5;

    // Spiral can wobble if it has Wave property
    if (wave > 0) {
      projectile.spiralWaveEnabled = true;
      projectile.spiralWavePhase = 0;
      projectile.spiralWaveAmplitude = 6 + wave * 8;
      projectile.spiralWaveFrequency = 2 + wave * 1.5;
    }

    // Spiral can be influenced by Homing
    if (homing > 0) {
      projectile.spiralHomingEnabled = true;
      projectile.spiralHomingStrength = homing * 0.3;
    }

    // Initial velocity for spiral is tangential
    const tangentAngle = projectile.spiralAngle + (Math.PI / 2) * projectile.spiralDirection;
    projectile.vx = Math.cos(tangentAngle) * baseSpeed;
    projectile.vy = Math.sin(tangentAngle) * baseSpeed;
    projectile.gravity = 0;
  }

  static updateMovement(projectile, dt, enemies) {
    if (projectile.movementType === 'spiral') {
      this.updateSpiral(projectile, dt, enemies);
    } else {
      this.updateStandard(projectile, dt, enemies);
    }

    // NOTE: Attraction/repulsion physics removed per dev/01-remove-vortex-repulsion.md.
    // Previously this function called applyAttractionRepulsion(projectile, dt, enemies);
    // That physics was removed to eliminate ineffective vortex/repulsion forces.

    // Wave motion perpendicular to velocity (applies to both movement types)
    if (projectile.waveAmplitude) {
      projectile.waveAngle += projectile.waveFrequency * dt;
      const perpAngle = Math.atan2(projectile.vy, projectile.vx) + Math.PI / 2;
      const waveOffset = Math.sin(projectile.waveAngle) * projectile.waveAmplitude;
      projectile.x += Math.cos(perpAngle) * waveOffset * dt;
      projectile.y += Math.sin(perpAngle) * waveOffset * dt;
    }
  }

  static updateSpiral(projectile, dt, enemies) {
    projectile.spiralRadius += projectile.spiralOutwardSpeed * dt;
    projectile.spiralAngle += projectile.spiralRotationSpeed * dt * projectile.spiralDirection;

    // Apply homing to spiral: gradually shift origin towards nearest enemy
    let spiralOriginX = projectile.spiralOriginX;
    let spiralOriginY = projectile.spiralOriginY;

    if (projectile.spiralHomingEnabled && enemies.length > 0) {
      const target = TargetFinder.findNearestEnemy(spiralOriginX, spiralOriginY, enemies);
      if (target) {
        const dx = target.x - spiralOriginX;
        const dy = target.y - spiralOriginY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const pullStrength = projectile.spiralHomingStrength * dt;
          spiralOriginX += (dx / dist) * pullStrength;
          spiralOriginY += (dy / dist) * pullStrength;
        }
      }
    }

    let nextX = spiralOriginX + Math.cos(projectile.spiralAngle) * projectile.spiralRadius;
    let nextY = spiralOriginY + Math.sin(projectile.spiralAngle) * projectile.spiralRadius;

    // Apply wave wobble to spiral path
    if (projectile.spiralWaveEnabled) {
      projectile.spiralWavePhase += projectile.spiralWaveFrequency * dt;
      const perpAngle = projectile.spiralAngle + Math.PI / 2;
      const waveOffset = Math.sin(projectile.spiralWavePhase) * projectile.spiralWaveAmplitude;
      nextX += Math.cos(perpAngle) * waveOffset;
      nextY += Math.sin(perpAngle) * waveOffset;
    }

    // Update velocity for collision/orientation purposes
    projectile.vx = (nextX - projectile.x) / dt;
    projectile.vy = (nextY - projectile.y) / dt;
    projectile.x = nextX;
    projectile.y = nextY;
  }

  static updateStandard(projectile, dt, enemies) {
    // Apply gravity for lob projectiles
    projectile.vy += projectile.gravity * dt;

    // Homing behavior
    if (projectile.properties.homing && enemies.length > 0) {
      const target = TargetFinder.findNearestEnemy(projectile.x, projectile.y, enemies);
      if (target) {
        const dx = target.x - projectile.x;
        const dy = target.y - projectile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const homingStrength = (100 + projectile.properties.homing * 150) * dt;
        projectile.vx += (dx / dist) * homingStrength;
        projectile.vy += (dy / dist) * homingStrength;

        // Maintain speed
        const currentSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
        const targetSpeed = projectile.spell.properties.speed;
        projectile.vx = (projectile.vx / currentSpeed) * targetSpeed;
        projectile.vy = (projectile.vy / currentSpeed) * targetSpeed;
      }
    }

    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
  }

  static initWaveProperties(projectile) {
    const wave = projectile.properties.wave || 0;
    if (wave > 0) {
      projectile.waveAngle = 0;
      projectile.waveAmplitude = 15 + wave * 80;
      projectile.waveFrequency = 5 + wave * 5;
    }
  }
}