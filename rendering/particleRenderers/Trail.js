export function renderTrailParticle(ctx, particle, alpha) {
  const color = particle.color || { r: 200, g: 200, b: 200 };

  const safeX = Number.isFinite(particle.x) ? particle.x : 0;
  const safeY = Number.isFinite(particle.y) ? particle.y : 0;
  const rawSize = Number.isFinite(particle.size) ? particle.size : 1;

  // Compute a sensible radius and ensure it is finite and positive
  let size = rawSize * (0.8 + 0.2 * Math.max(0, Math.min(1, alpha)));
  size = Number.isFinite(size) ? Math.max(0.1, size) : 0.5;

  try {
    const gradient = ctx.createRadialGradient(
      safeX, safeY, 0,
      safeX, safeY, size
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, alpha * 0.45)})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(safeX, safeY, size, 0, Math.PI * 2);
    ctx.fill();
  } catch (e) {
    // Fallback to a simple pixel if gradients fail
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fillRect(Math.round(safeX) - 1, Math.round(safeY) - 1, 2, 2);
  }
}