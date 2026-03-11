/**
 * Tiger: explosive lines, beat triggered.
 */
function TigerSystem() {
  this.lines = [];
  this.maxLines = 24;
  for (let i = 0; i < this.maxLines; i++) {
    this.lines.push({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5, life: 0 });
  }
  this.nextIndex = 0;
}

TigerSystem.prototype.update = function (a) {
  const beat = (a && a.beat) || false;
  const e = (a && a.energy) || 0;
  if (beat && e > 0.1) {
    const L = this.lines[this.nextIndex % this.maxLines];
    const angle = Math.random() * Math.PI * 2;
    const len = 0.2 + Math.random() * 0.4;
    L.x1 = 0.5;
    L.y1 = 0.5;
    L.x2 = 0.5 + Math.cos(angle) * len;
    L.y2 = 0.5 + Math.sin(angle) * len;
    L.life = 1;
    this.nextIndex++;
  }
  this.lines.forEach(function (L) {
    if (L.life > 0) L.life -= 0.03;
  });
};

TigerSystem.prototype.draw = function (p, x, y, w, h) {
  p.strokeWeight(2);
  this.lines.forEach(function (L) {
    if (L.life <= 0) return;
    p.stroke(255, 140, 60, L.life * 255);
    p.line(x + L.x1 * w, y + L.y1 * h, x + L.x2 * w, y + L.y2 * h);
  });
};
