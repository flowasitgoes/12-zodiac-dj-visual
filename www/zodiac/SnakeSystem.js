/**
 * Snake: 多顆彩球繞中心旋轉，不同大小／速度／方向，保留 bass/treble/mode 驅動.
 */
function SnakeSystem() {
  this.balls = [];
  const numBalls = 16;
  const colors = [
    [100, 200, 120],
    [80, 220, 180],
    [120, 180, 200],
    [90, 200, 160],
    [70, 190, 140],
    [110, 210, 170],
    [95, 185, 150],
    [85, 205, 190],
    [105, 195, 130],
    [75, 215, 165],
    [115, 175, 145],
    [88, 198, 178],
    [98, 208, 155],
    [82, 188, 168],
    [108, 192, 138],
    [92, 202, 172]
  ];
  for (let i = 0; i < numBalls; i++) {
    this.balls.push({
      angle: (i / numBalls) * Math.PI * 2,
      speed: 0.008 + (i % 7) * 0.004,
      dir: i % 2 === 0 ? 1 : -1,
      orbitRadius: 0.12 + (i % 5) * 0.04,
      size: 0.04 + (i % 4) * 0.015,
      color: colors[i % colors.length]
    });
  }
}

SnakeSystem.prototype.update = function (a) {
  const bass = (a && a.bass) !== undefined ? a.bass : 0;
  const treble = (a && a.treble) !== undefined ? a.treble : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const speedMult = 0.8 + bass * 0.6 + intensity * 0.4;
  const sizeMult = mode === 0 ? 0.75 : mode === 2 ? 1.25 : 1;
  this.balls.forEach(function (b) {
    b.angle += b.speed * b.dir * speedMult;
  });
  this._sizeMult = sizeMult;
  this._intensity = intensity;
  this._mode = mode;
};

SnakeSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const sizeMult = this._sizeMult !== undefined ? this._sizeMult : 1;
  const intensity = this._intensity !== undefined ? this._intensity : 0.5;
  const mode = this._mode !== undefined ? this._mode : 0;
  const baseAlpha = 0.4 + intensity * 0.4 + (mode === 2 ? 0.15 : 0);

  p.noStroke();
  this.balls.forEach(function (b) {
    const px = cx + Math.cos(b.angle) * b.orbitRadius * Math.min(w, h);
    const py = cy + Math.sin(b.angle) * b.orbitRadius * Math.min(w, h);
    const r = b.size * Math.min(w, h) * sizeMult;
    const c = b.color;
    p.fill(c[0], c[1], c[2], baseAlpha * 255);
    p.circle(px, py, r * 2);
    p.fill(c[0], c[1], c[2], (baseAlpha * 0.5) * 255);
    p.circle(px, py, r * 2.4);
  });
};
