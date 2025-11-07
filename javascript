    // --- MOVEMENT LOGIC ---
    if (this.movementType === 'spiral') {
      // Spiral movement: orbit origin and move outwards
      this.spiralRadius += this.spiralOutwardSpeed * dt;
      this.spiralAngle += this.spiralRotationSpeed * dt * this.spiralDirection;
      
      // Apply homing to spiral: gradually shift origin towards nearest enemy
      let spiralOriginX = this.spiralOriginX;
      let spiralOriginY = this.spiralOriginY;
      
      if (this.spiralHomingEnabled && enemies.length > 0) {
        const target = this.findNearestEnemy(enemies);
        if (target) {
          const dx = target.x - spiralOriginX;
          const dy = target.y - spiralOriginY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const pullStrength = this.spiralHomingStrength * dt;
            spiralOriginX += (dx / dist) * pullStrength;
            spiralOriginY += (dy / dist) * pullStrength;
          }
        }
      }
      
      let nextX = spiralOriginX + Math.cos(this.spiralAngle) * this.spiralRadius;
      let nextY = spiralOriginY + Math.sin(this.spiralAngle) * this.spiralRadius;
      
      // Apply wave wobble to spiral path
      if (this.spiralWaveEnabled) {
        this.spiralWavePhase += this.spiralWaveFrequency * dt;
        const perpAngle = this.spiralAngle + Math.PI / 2;
        const waveOffset = Math.sin(this.spiralWavePhase) * this.spiralWaveAmplitude;
        nextX += Math.cos(perpAngle) * waveOffset;
        nextY += Math.sin(perpAngle) * waveOffset;
      }
      
      // Update velocity for collision/orientation purposes
      this.vx = (nextX - this.x) / dt;
      this.vy = (nextY - this.y) / dt;
      this.x = nextX;
      this.y = nextY;
      
    } else {

