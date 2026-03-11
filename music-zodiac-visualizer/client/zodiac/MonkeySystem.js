/**
 * Monkey: random playful jumps, beat triggered.
 */
function MonkeySystem() {
  this.shapes = [];
  this.maxShapes = 10;
  for (let i = 0; i < this.maxShapes; i++) {
    this.shapes.push({ x: 0.5, y: 0.5, r: 0.05, life: 0 });
  }
  this.nextIndex = 0;
}

MonkeySystem.prototype.update = function (a) {
  const beat = (a && a.beat) || false;
  if (beat) {
    const s = this.shapes[this.nextIndex % this.maxShapes];
    s.x = 0.2 + Math.random() * 0.6;
    s.y = 0.2 + Math.random() * 0.6;
    s.r = 0.03 + Math.random() * 0.08;
    s.life = 1;
    this.nextIndex++;
  }
  this.shapes.forEach(function (s) {
    if (s.life > 0) s.life -= 0.02;
  });
};

MonkeySystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  this.shapes.forEach(function (s) {
    if (s.life <= 0) return;
    p.fill(255, 200, 80, s.life * 220);
    p.circle(x + s.x * w, y + s.y * h, s.r * Math.min(w, h));
  });
};
