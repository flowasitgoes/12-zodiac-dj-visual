/**
 * Rabbit: soft curves, centroid/treble influence.
 */
function RabbitSystem() {
  this.phase = 0;
  this.points = [];
  for (let i = 0; i <= 20; i++) this.points.push({ x: 0, y: 0 });
}

RabbitSystem.prototype.update = function (a) {
  const centroid = (a && a.centroid) !== undefined ? a.centroid : 1000;
  const treble = (a && a.treble) !== undefined ? a.treble : 0;
  const norm = Math.min(1, centroid / 4000);
  const curve = 0.3 + norm * 0.5 + treble * 0.2;
  this.phase += 0.02;
  this.points.forEach(function (pt, i) {
    const t = (i / (this.points.length - 1)) * Math.PI * 2 + this.phase;
    pt.x = 0.5 + Math.cos(t) * (0.15 + curve * 0.2);
    pt.y = 0.5 + Math.sin(t) * (0.15 + curve * 0.2);
  }, this);
};

RabbitSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(240, 220, 220);
  p.strokeWeight(2);
  p.beginShape();
  this.points.forEach(function (pt) {
    p.vertex(x + pt.x * w, y + pt.y * h);
  });
  p.endShape(p.CLOSE);
};
