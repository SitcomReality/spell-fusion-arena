export function renderDefaultParticle(ctx, particle, alpha) {
  const color = particle.color;
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
}

