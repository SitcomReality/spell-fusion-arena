export function renderSmokeParticle(ctx, particle, alpha) {
  // Ensure numeric, finite positions and size to avoid canvas API errors
  const safeX = Number.isFinite(particle.x) ? particle.x : 0;
  const safeY = Number.isFinite(particle.y) ? particle.y : 0;
  const rawSize = Number.isFinite(particle.size) ? particle.size : 1;
  let size = rawSize * (1 + (1 - alpha) * 2);
  size = Number.isFinite(size) ? Math.max(0.1, size) : 0.1;
  const color = particle.color || { r: 200, g: 200, b: 200 };

  // Protect gradient creation with try/catch; fallback to simple fill if it fails
  try {
    const gradient = ctx.createRadialGradient(
      safeX, safeY, 0,
      safeX, safeY, size
    );
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, Math.min(1, alpha * 0.3))})`);
    gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, Math.min(1, alpha * 0.1))})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(safeX, safeY, size, 0, Math.PI * 2);
    ctx.fill();
  } catch (e) {
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, Math.min(1, alpha * 0.25))})`;
    ctx.fillRect(Math.round(safeX) - 1, Math.round(safeY) - 1, 2, 2);
  }
}