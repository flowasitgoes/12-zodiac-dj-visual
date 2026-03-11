/**
 * Dog: orbiting circles, bass/centroid + mode：圓大小、線粗細、速度、顏色.
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
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const speed = (0.02 + bass * 0.04) * (mode === 0 ? 0.7 : mode === 2 ? 1.25 : 1);
  const radiusScale = (0.8 + (centroid / 5000) * 0.5) * (0.85 + intensity * 0.3);
  this.orbits.forEach(function (o, i) {
    o.angle += speed * (1 + i * 0.2);
    o.r = (0.08 + i * 0.04) * radiusScale;
  });
  this._circleSize = (10 + intensity * 8 + mode * 2);
  this._strokeWeight = 1.2 + intensity * 1.5 + (mode === 2 ? 0.8 : 0);
  this._r = Math.floor(180 + intensity * 50);
  this._g = Math.floor(160 + centroid / 4000);
  this._b = Math.floor(120 + bass * 60);
};

DogSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  p.noFill();
  p.stroke(this._r || 200, this._g || 180, this._b || 140);
  p.strokeWeight(this._strokeWeight || 2);
  this.orbits.forEach(function (o) {
    const px = cx + Math.cos(o.angle) * o.r * Math.min(w, h);
    const py = cy + Math.sin(o.angle) * o.r * Math.min(w, h);
    p.circle(px, py, this._circleSize || 12);
  }, this);
};
