/**
 * Ox: heavy rectangles, bass driven.
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
  const size = 0.08 + bass * 0.25;
  const offset = bass * 0.15;
  this.rects.forEach(function (r, i) {
    const t = (i / this.rects.length) * Math.PI * 2;
    r.x = 0.5 + Math.cos(t) * offset;
    r.y = 0.5 + Math.sin(t) * offset;
    r.w = size * (0.8 + Math.sin(i) * 0.2);
    r.h = size * (0.8 + Math.cos(i * 0.7) * 0.2);
    r.angle = bass * Math.PI * 0.2;
  }, this);
};

OxSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(180, 160, 120);
  p.strokeWeight(3);
  this.rects.forEach(function (r) {
    p.push();
    p.translate(x + r.x * w, y + r.y * h);
    p.rotate(r.angle);
    p.rect(-r.w * w / 2, -r.h * h / 2, r.w * w, r.h * h);
    p.pop();
  });
};
