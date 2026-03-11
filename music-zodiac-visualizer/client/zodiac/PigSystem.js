/**
 * Pig: soft blobs / bubbles, energy controls expansion.
 */
function PigSystem() {
  this.bubbles = [];
  for (let i = 0; i < 12; i++) {
    this.bubbles.push({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      baseR: 0.03 + Math.random() * 0.05
    });
  }
}

PigSystem.prototype.update = function (a) {
  const e = (a && a.energy) !== undefined ? a.energy : 0;
  this.expand = 1 + e * 0.8;
  this.bubbles.forEach(function (b) {
    b.x += (Math.random() - 0.5) * 0.005;
    b.y += (Math.random() - 0.5) * 0.005;
    b.x = Math.max(0.1, Math.min(0.9, b.x));
    b.y = Math.max(0.1, Math.min(0.9, b.y));
  });
};

PigSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  this.bubbles.forEach(function (b) {
    const r = (b.baseR || 0.04) * (this.expand || 1) * Math.min(w, h);
    p.fill(255, 200, 220, 180);
    p.circle(x + b.x * w, y + b.y * h, r);
  }, this);
};
