# Support Shield Enemy — Incremental Implementation Plan

Goal:
Add a new Support enemy that periodically creates a temporary shield around itself (~2500ms on, ~2500ms off, tunable). The shield:
- Is visualized on the FX canvas.
- Makes the enemy invulnerable while active.
- Projectiles have a low chance to pierce the shield, increased by Piercing potency.
- On non-pierce, the projectile explodes (impact effects and AoE still occur; shields do not block AoE).
- Support enemies begin spawning in regular waves after the dasher (side-to-side) is in the pool.

Implement in small steps (max 3 files per step).

---

## Step 1: Define the new enemy type and minimal shield state

Files to modify (2):
- entities/EnemyTypes.js
- entities/Enemy.js

Changes:
1) In entities/EnemyTypes.js: Add a new type `support`:
   - Example attributes: speed ~16, size ~18x18, pattern 'blob', color e.g. teal, movePattern 'support' (or standard).
   - No boss flags.

2) In entities/Enemy.js constructor:
   - Add shield state fields: `shieldActive=false`, `shieldRadius=26`, `shieldOnDuration=2.5`, `shieldOffDuration=2.5`, `shieldTimer=0`, `shieldFxColor={r:120,g:220,b:220}`.

Notes:
- Do not enable behavior yet; just the structure.

---

## Step 2: Implement the shield state machine

Files to modify (2-3):
- entities/EnemyStatus.js (new shield updater)
- entities/Enemy.js (call the updater in update())
- Optional: config.js (expose tunables) — if desired (this can be skipped or done later)

Changes:
1) In entities/EnemyStatus.js:
   - Add `updateShield(enemy, dt)`:
     - Toggle `enemy.shieldActive` on/off based on `enemy.shieldTimer` cycling between `shieldOnDuration` and `shieldOffDuration`.
     - When shield becomes active, set `enemy.invulnerable = true` (new flag).
     - When shield becomes inactive, set `enemy.invulnerable = false`.

2) In entities/Enemy.js update():
   - After movement, before other status effects, call `updateShield(this, dt)`.

Notes:
- Keep shield logic independent from burn/poison/slow.

---

## Step 3: Render the shield on the FX layer

Files to modify (2):
- rendering/EffectsRenderer.js
- app/GameApp.js

Changes:
1) In rendering/EffectsRenderer.js:
   - Add `renderEnemyShield(enemy)`:
     - If `enemy.shieldActive`, draw a subtle ring/halo (stroke) using enemy.shieldRadius with `enemy.shieldFxColor`.
     - Base alpha from a gentle pulse or fixed value (e.g., 0.3–0.5).

2) In app/GameApp.js render():
   - Before rendering aoe and particles, loop enemies and call `fxRenderer.renderEnemyShield(enemy)` when active.

Notes:
- Keep shield visuals light to avoid clutter.

---

## Step 4: Collision changes for shielded enemies (piercing chance)

Files to modify (1):
- game/CollisionHandler.js

Changes:
1) When a projectile hits an enemy:
   - If `enemy.shieldActive`:
     - Compute pierce chance: `basePierce = 0.08 + clamp(projectile.properties.piercing * 0.10, 0, 0.7)`, cap total chance to ~0.9.
     - If pierce succeeds: continue as normal (damage and property application).
     - If pierce fails:
       - Do NOT damage the enemy (invulnerable).
       - Trigger impact particles as if hitting (for feedback).
       - Trigger AoE via `AoEHandler` (shields do not block AoE).
       - Handle chaining/piercing termination (projectile likely dies unless chaining redirects).
       - Mark the projectile dead if appropriate.

Notes:
- This integrates shield behavior without touching AoEHandler (AoE should still apply).

---

## Step 5: Spawn Support enemies in regular waves

Files to modify (1-2):
- game/WaveManager.js

Changes:
1) In spawnWave():
   - After the dasher is in the pool (existing condition), introduce a small `supportChance` (e.g., 0.06 increasing by 0.005 per wave up to 0.14).
   - Insert Support type similar to spiraler/dasher selection, ensuring they only appear on non-boss waves.

Notes:
- Keep boss waves unchanged.

---

## Step 6: Optional polish

Files to modify (≤3, optional):
- config.js: Move shield durations to CONFIG for easy tuning.
- rendering/EffectsRenderer.js: Add a subtle animated pulse to the shield ring.
- entities/Enemy.js: Add a faint `alpha` pulse when shield toggles.

---

## Testing checklist

- Verify shield cycles: on for ~2.5s, off for ~2.5s (tune as needed).
- Confirm FX shield renders only when active.
- Check projectiles:
  - Low piercing projectiles mostly explode on shield; high piercing often pass through.
  - AoE from explosions still damages enemies, including shielded ones.
- Ensure Support enemies start spawning after dashers are introduced.
- Boss waves contain no support/dasher logic changes.

---