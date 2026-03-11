/**
 * Ox: heavy rectangles, bass + mode 驅動；每 27 秒換一種格子／交織形狀 (27, 54, 81...).
 */
function OxSystem() {
  this.rects = [];
  this.maxRects = 12;
  for (let i = 0; i < this.maxRects; i++) {
    this.rects.push({ x: 0.5, y: 0.5, w: 0.1, h: 0.1, angle: 0 });
  }
  this._lastVariant = -1;
}

OxSystem.prototype.update = function (a) {
  const time = (a && typeof a.time === 'number') ? a.time : 0;
  const variantIndex = Math.floor(time / 27);

  const bass = (a && a.bass) !== undefined ? a.bass : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const sizeBase = 0.06 + bass * 0.2 + intensity * 0.12;
  const size = mode === 0 ? sizeBase * 0.7 : mode === 2 ? sizeBase * 1.3 : sizeBase;
  const offset = (bass * 0.15 + intensity * 0.08) * (mode === 2 ? 1.4 : mode === 0 ? 0.5 : 1);

  const v = variantIndex % 5;
  const n = this.rects.length;

  this.rects.forEach(function (r, i) {
    if (v === 0) {
      const t = (i / n) * Math.PI * 2;
      r.x = 0.5 + Math.cos(t) * offset;
      r.y = 0.5 + Math.sin(t) * offset;
      r.angle = bass * Math.PI * 0.2 + intensity * 0.3;
    } else if (v === 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      var px = 0.25 + (col / 3) * 0.5;
      var py = 0.2 + (row / 2) * 0.6;
      r.x = 0.5 + (px - 0.5) * (0.3 + offset);
      r.y = 0.5 + (py - 0.5) * (0.3 + offset);
      r.angle = bass * 0.3 + (col - row) * 0.15;
    } else if (v === 2) {
      const t = (i / n) * Math.PI * 2;
      const r0 = 0.15 + offset * 0.5;
      const r1 = 0.28 + offset * 0.6;
      const rad = i % 2 === 0 ? r0 : r1;
      r.x = 0.5 + Math.cos(t) * rad;
      r.y = 0.5 + Math.sin(t) * rad;
      r.angle = t + bass * 0.4;
    } else if (v === 3) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const stagger = row % 2 === 0 ? 0 : 0.12;
      r.x = 0.2 + (col * 0.2 + stagger) * (0.6 + offset);
      r.y = 0.25 + row * 0.22 * (0.6 + offset);
      r.angle = bass * 0.25 + row * 0.2 - col * 0.1;
    } else {
      const t = (i / n) * Math.PI * 2 + 0.5;
      r.x = 0.5 + Math.cos(t) * (0.12 + offset * 0.4) * (1 + Math.sin(i * 1.3) * 0.4);
      r.y = 0.5 + Math.sin(t) * (0.12 + offset * 0.4) * (1 + Math.cos(i * 0.9) * 0.4);
      r.angle = t * 0.5 + bass * 0.3 + i * 0.1;
    }
    r.w = size * (0.8 + Math.sin(i) * 0.2);
    r.h = size * (0.8 + Math.cos(i * 0.7) * 0.2);
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
