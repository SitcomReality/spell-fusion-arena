export function renderAuraParticle(ctx, particle, alpha) {
  const color = particle.color;
  const size = particle.size;
  
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
  ctx.fill();
}

