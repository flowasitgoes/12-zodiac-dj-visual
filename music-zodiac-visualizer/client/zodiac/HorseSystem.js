/**
 * Horse: running line motion, energy driven speed.
 */
function HorseSystem() {
  this.segments = [];
  for (let i = 0; i < 30; i++) {
    this.segments.push({ x: i / 30, y: 0.5 });
  }
  this.phase = 0;
}

HorseSystem.prototype.update = function (a) {
  const e = (a && a.energy) || 0;
  this.phase += 0.05 + e * 0.2;
  this.segments.forEach(function (s, i) {
    const t = (i / this.segments.length) * Math.PI * 4 + this.phase;
    s.x = (s.x - 0.02 - e * 0.04 + 1) % 1;
    s.y = 0.5 + Math.sin(t) * 0.15;
  }, this);
};

HorseSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(220, 180, 100);
  p.strokeWeight(2);
  p.beginShape();
  this.segments.forEach(function (s) {
    p.vertex(x + s.x * w, y + s.y * h);
  });
  p.endShape();
};
