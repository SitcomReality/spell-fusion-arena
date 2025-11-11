export function renderSwirlParticle(ctx, particle, alpha) {
  const color = particle.color;
  const size = particle.size;
  
  // Draw elongated particle for motion blur
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(Math.atan2(particle.vy, particle.vx));
  
  const gradient = ctx.createLinearGradient(-size * 2, 0, size, 0);
  gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(-size * 2, -size * 0.5, size * 3, size);
  
  ctx.restore();
}

