/**
 * Rat: fast particles, rhythm (beat/energy) driven.
 */
function RatSystem() {
  this.particles = [];
  this.maxParticles = 80;
  for (let i = 0; i < this.maxParticles; i++) {
    this.particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0 });
  }
  this.nextIndex = 0;
}

RatSystem.prototype.update = function (a) {
  const e = (a && a.energy) || 0;
  const beat = (a && a.beat) || false;
  const speed = 2 + e * 8;
  if (beat || e > 0.3) {
    const p = this.particles[this.nextIndex % this.maxParticles];
    p.x = Math.random();
    p.y = Math.random();
    const angle = Math.random() * Math.PI * 2;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = 1;
    this.nextIndex++;
  }
  this.particles.forEach(function (p) {
    if (p.life <= 0) return;
    p.x += p.vx * 0.02;
    p.y += p.vy * 0.02;
    p.life -= 0.015;
  });
};

RatSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  this.particles.forEach(function (pt) {
    if (pt.life <= 0) return;
    const px = x + pt.x * w;
    const py = y + pt.y * h;
    p.fill(255, 220, 180, pt.life * 200);
    p.circle(px, py, 4);
  });
};
