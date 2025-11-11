export function renderSparkParticle(ctx, particle, alpha) {
  const color = particle.color;
  
  // Ensure numeric, finite size and positions to avoid canvas errors
  const safeX = Number.isFinite(particle.x) ? particle.x : 0;
  const safeY = Number.isFinite(particle.y) ? particle.y : 0;
  const safeSize = Number.isFinite(particle.size) ? Math.max(0.1, particle.size) : 1;
  const coreSize = 1;

  // Bright core
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.fillRect(safeX - coreSize, safeY - coreSize, coreSize * 2, coreSize * 2);
  
  // Colored glow (use safeSize for gradient radius)
  const gradient = ctx.createRadialGradient(
    safeX, safeY, 0,
    safeX, safeY, safeSize * 2
  );
  gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.8})`);
  gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(safeX, safeY, safeSize * 2, 0, Math.PI * 2);
  ctx.fill();
}