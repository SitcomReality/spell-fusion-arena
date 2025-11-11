export function renderFloatingText(ctx, particle, alpha) {
  const text = particle.text || '';
  const size = Number.isFinite(particle.size) ? particle.size : 14;
  const x = Number.isFinite(particle.x) ? particle.x : 0;
  const y = Number.isFinite(particle.y) ? particle.y : 0;
  const color = particle.color || { r: 255, g: 255, b: 255 };

  // Soft drop shadow / outline for readability
  ctx.save();
  ctx.font = `${size}px \"Space Mono\", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  ctx.fillStyle = `rgba(0,0,0,${0.6 * alpha})`;
  ctx.fillText(text, x + 1, y + 2);

  // Main colored text
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${1 * alpha})`;
  ctx.fillText(text, x, y);

  ctx.restore();
}