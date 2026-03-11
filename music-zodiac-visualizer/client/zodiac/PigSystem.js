/**
 * Pig: bubbles, energy + mode：大小、飄動速度、顏色與透明度.
 */
function PigSystem() {
  this.bubbles = [];
  for (let i = 0; i < 12; i++) {
    this.bubbles.push({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      baseR: 0.018 + Math.random() * 0.032
    });
  }
}

PigSystem.prototype.update = function (a) {
  const e = (a && a.energy) !== undefined ? a.energy : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  this.expand = (1 + e * 0.8) * (mode === 0 ? 0.85 : mode === 2 ? 1.25 : 1);
  const drift = 0.005 * (0.5 + intensity) * (mode === 2 ? 1.3 : 1);
  this.bubbles.forEach(function (b) {
    b.x += (Math.random() - 0.5) * drift;
    b.y += (Math.random() - 0.5) * drift;
    b.x = Math.max(0.05, Math.min(0.95, b.x));
    b.y = Math.max(0.05, Math.min(0.95, b.y));
  });
  this._r = Math.floor(255);
  this._g = Math.floor(200 - mode * 25 + intensity * 30);
  this._b = Math.floor(220 - intensity * 20);
};

PigSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  this.bubbles.forEach(function (b) {
    const r = (b.baseR || 0.04) * (this.expand || 1) * Math.min(w, h);
    p.fill(this._r || 255, this._g || 200, this._b || 220, 200);
    p.circle(x + b.x * w, y + b.y * h, r);
  }, this);
};
