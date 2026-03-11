/**
 * Dog: orbiting circles, bass/centroid control radius and speed.
 */
function DogSystem() {
  this.orbits = [];
  for (let i = 0; i < 5; i++) {
    this.orbits.push({ angle: Math.random() * Math.PI * 2, r: 0.1 + i * 0.05 });
  }
}

DogSystem.prototype.update = function (a) {
  const bass = (a && a.bass) !== undefined ? a.bass : 0;
  const centroid = (a && a.centroid) !== undefined ? a.centroid : 2000;
  const speed = 0.02 + bass * 0.04;
  const radiusScale = 0.8 + (centroid / 5000) * 0.5;
  this.orbits.forEach(function (o, i) {
    o.angle += speed * (1 + i * 0.2);
    o.r = (0.08 + i * 0.04) * radiusScale;
  });
};

DogSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  p.noFill();
  this.orbits.forEach(function (o) {
    const px = cx + Math.cos(o.angle) * o.r * Math.min(w, h);
    const py = cy + Math.sin(o.angle) * o.r * Math.min(w, h);
    p.stroke(200, 180, 140);
    p.strokeWeight(2);
    p.circle(px, py, 12);
  });
};
