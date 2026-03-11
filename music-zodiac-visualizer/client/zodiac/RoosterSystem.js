/**
 * Rooster: sharp radial bursts, beat/energy triggered.
 */
function RoosterSystem() {
  this.spikes = [];
  this.maxSpikes = 20;
  for (let i = 0; i < this.maxSpikes; i++) {
    this.spikes.push({ angle: 0, len: 0, life: 0 });
  }
  this.nextIndex = 0;
}

RoosterSystem.prototype.update = function (a) {
  const beat = (a && a.beat) || false;
  const e = (a && a.energy) || 0;
  if ((beat || e > 0.5) && Math.random() < 0.4) {
    const s = this.spikes[this.nextIndex % this.maxSpikes];
    s.angle = Math.random() * Math.PI * 2;
    s.len = 0.15 + e * 0.25;
    s.life = 1;
    this.nextIndex++;
  }
  this.spikes.forEach(function (s) {
    if (s.life > 0) s.life -= 0.025;
  });
};

RoosterSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  p.strokeWeight(2);
  this.spikes.forEach(function (s) {
    if (s.life <= 0) return;
    p.stroke(255, 100, 50, s.life * 255);
    const ex = cx + Math.cos(s.angle) * s.len * Math.min(w, h);
    const ey = cy + Math.sin(s.angle) * s.len * Math.min(w, h);
    p.line(cx, cy, ex, ey);
  });
};
