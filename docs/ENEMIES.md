# Enemies, Damage & DoT — Quick Reference

Summary
- Enemies are represented by a PixelBody (grid of pixels) rather than an explicit HP bar; "health" is the number of alive pixels remaining.
- Damage removes pixels from the PixelBody (via PixelBody.damage), and an enemy is considered dead when too many pixels are destroyed (PixelBody.intact becomes false).
- Projectiles call Enemy.takeDamage(projectile) which converts projectile impact into a local destruction radius and passes it to PixelBody.damage.
- DoT effects (burning/poison) are applied via Enemy.applyBurning / applyPoison and are processed in Enemy.updateStatusEffects; they periodically call takeBurnDamage / takePoisonDamage which in turn call pixelBody.damage — i.e. DoT does remove pixels over time.
- DoT damage magnitude is derived from projectile properties (props.dot or props.poison) and the projectile's damage value; the code computes a duration and damage-per-tick and schedules periodic pixel damage and particles.

How damage is computed and applied
- Instant hits: CollisionHandler -> enemy.takeDamage(projectile) -> takeDamageFromSource -> pixelBody.damage(localX, localY, radius, destructionType).
  - destructionRadius typically equals projectile.radius * 2 for direct hits.
  - PixelBody.damage uses the radius and a destructionType heuristic to mark pixels dead; when remaining pixels fall below ~20% the enemy is flagged not intact and removed.
- DoT (burning / poison):
  - PropertyApplier.applyProperties sets up DoT by calling enemy.applyBurning(duration, damagePerTick, color) or applyPoison.
  - Enemy.updateStatusEffects counts down duration and, on each tick interval, calls takeBurnDamage/takePoisonDamage — which call pixelBody.damage with a smaller radius. So DoT gradually removes pixels (weaker than direct hits).
  - DoT damage-per-tick is computed from projectile.spell.properties.damage multiplied by the dot/poison intensity, but clamped so very small values still produce at least 1 tick damage.

Why you might not "feel" DoT
- Pixel-based visuals can make gradual DoT pixel removal subtle compared to instant explosion/crushes; many DoT ticks remove only a few pixels each tick and emit particles (which are more visible).
- If projectiles have low 'dot' or enemy pixel counts are high, DoT may take many seconds to noticeably kill an enemy.
- Other mechanics (piercing, chaining, splitting, AoE propagation) can overshadow DoT because they change how many targets are hit or spawn extra projectiles.

Testing tips
- For quick testing enable a visible health indicator: sample suggestion is to render a temporary numeric health or small progress bar derived from `enemy.pixelBody.getAlivePixels().length / totalPixels` (this file is just documentation — implementation can be added to Renderer.renderEnemy or a debug overlay).
- Increase `dot` values or reduce PixelBody size/pixel counts to better observe DoT effects.
- Use Particle and AoE visuals to confirm DoT ticks are firing (Enemy.emitDoTParticles pushes particle requests to GameState).

Relevant code entry points
- PixelBody.damage(...) — core pixel removal logic (entities/PixelBody.js).
- Enemy.takeDamage / takeDamageFromSource (entities/Enemy.js) — direct hit handling.
- Enemy.applyBurning / applyPoison and updateStatusEffects (entities/Enemy.js) — DoT lifecycle and ticking.
- PropertyApplier.applyProperties (spells/projectile/PropertyApplier.js) — converts projectile properties into enemy status effects.
- CollisionHandler.handleAoEDamage (game/CollisionHandler.js) — AoE spreads damage and can probabilistically propagate projectile properties (including diluted DoT).

If you'd like, I can add a simple debug health-bar renderer (visible only during testing) and a dev toggle so DoT effects are easier to observe.

