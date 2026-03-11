/**
 * Ox: heavy rectangles, bass + mode 驅動：大小、粗細、顏色、展開度.
 */
function OxSystem() {
  this.rects = [];
  this.maxRects = 12;
  for (let i = 0; i < this.maxRects; i++) {
    this.rects.push({ x: 0.5, y: 0.5, w: 0.1, h: 0.1, angle: 0 });
  }
}

OxSystem.prototype.update = function (a) {
  const bass = (a && a.bass) !== undefined ? a.bass : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const sizeBase = 0.06 + bass * 0.2 + intensity * 0.12;
  const size = mode === 0 ? sizeBase * 0.7 : mode === 2 ? sizeBase * 1.3 : sizeBase;
  const offset = (bass * 0.15 + intensity * 0.08) * (mode === 2 ? 1.4 : mode === 0 ? 0.5 : 1);
  this.rects.forEach(function (r, i) {
    const t = (i / this.rects.length) * Math.PI * 2;
    r.x = 0.5 + Math.cos(t) * offset;
    r.y = 0.5 + Math.sin(t) * offset;
    r.w = size * (0.8 + Math.sin(i) * 0.2);
    r.h = size * (0.8 + Math.cos(i * 0.7) * 0.2);
    r.angle = bass * Math.PI * 0.2 + intensity * 0.3;
  }, this);
  this._strokeWeight = 1.5 + intensity * 2.5 + mode * 0.5;
  this._r = Math.floor(160 + intensity * 50 + mode * 15);
  this._g = Math.floor(140 + bass * 60);
  this._b = Math.floor(100 + intensity * 40);
};

OxSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(this._r || 180, this._g || 160, this._b || 120);
  p.strokeWeight(this._strokeWeight || 3);
  this.rects.forEach(function (r) {
    p.push();
    p.translate(x + r.x * w, y + r.y * h);
    p.rotate(r.angle);
    p.rect(-r.w * w / 2, -r.h * h / 2, r.w * w, r.h * h);
    p.pop();
  });
};
