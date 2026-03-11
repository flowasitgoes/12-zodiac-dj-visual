/**
 * Monkey: 跳來跳去的長方形粒子 — 拋物線跳躍，與豬的漂浮氣泡區隔.
 */
function MonkeySystem() {
  this.rects = [];
  this.maxRects = 6;
  for (let i = 0; i < this.maxRects; i++) {
    this.rects.push({
      x: 0.5,
      y: 0.9,
      vx: 0,
      vy: 0,
      w: 0.03,
      h: 0.05,
      life: 0,
      gravity: 0.0012
    });
  }
  this.nextIndex = 0;
}

MonkeySystem.prototype.update = function (a) {
  const beat = (a && a.beat) || false;
  const e = (a && a.energy) || 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;

  if (beat || (mode >= 1 && Math.random() < 0.08)) {
    const r = this.rects[this.nextIndex % this.maxRects];
    r.x = 0.15 + Math.random() * 0.7;
    r.y = 0.88;
    const angle = -Math.PI / 2 - 0.3 + Math.random() * 0.6;
    const speed = 0.018 + e * 0.02 + intensity * 0.01;
    r.vx = Math.cos(angle) * speed;
    r.vy = Math.sin(angle) * speed;
    r.w = 0.025 + Math.random() * 0.04;
    r.h = r.w * (1.2 + Math.random() * 0.8);
    r.life = 1;
    r.gravity = 0.001 + intensity * 0.0005;
    this.nextIndex++;
  }

  this.rects.forEach(function (r) {
    if (r.life <= 0) return;
    r.x += r.vx;
    r.y += r.vy;
    r.vy += r.gravity;
    if (r.y > 0.95) {
      r.y = 0.95;
      r.vy *= -0.4;
      r.vx *= 0.9;
    }
    if (r.x < 0 || r.x > 1) r.life -= 0.02;
    r.life -= 0.008;
  });

  this._r = Math.floor(255);
  this._g = Math.floor(200 - mode * 25 + intensity * 35);
  this._b = Math.floor(60 + intensity * 50);
  this._alpha = 0.7 + intensity * 0.3;
};

MonkeySystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  const alpha = Math.min(255, Math.floor((this._alpha || 0.8) * 255));
  this.rects.forEach(function (r) {
    if (r.life <= 0) return;
    const rx = x + r.x * w;
    const ry = y + r.y * h;
    const rw = r.w * Math.min(w, h);
    const rh = r.h * Math.min(w, h);
    p.fill(this._r || 255, this._g || 200, this._b || 60, r.life * alpha);
    p.push();
    p.translate(rx, ry);
    p.rect(-rw / 2, -rh / 2, rw, rh);
    p.pop();
  }, this);
};
