export function renderBeamParticle(ctx, particle, alpha) {
  const color = particle.color;

  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  ctx.lineWidth = particle.size;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(particle.x, particle.y);
  ctx.lineTo(particle.x + particle.vx * 0.1, particle.y + particle.vy * 0.1);
  ctx.stroke();

  // Inner glow
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
  ctx.lineWidth = particle.size * 0.3;
  ctx.beginPath();
  ctx.moveTo(particle.x, particle.y);
  ctx.lineTo(particle.x + particle.vx * 0.1, particle.y + particle.vy * 0.1);
  ctx.stroke();
}
```
This plan adds a new file to the `rendering/particleRenderers` directory, which will contain a function to render beam-like particles.