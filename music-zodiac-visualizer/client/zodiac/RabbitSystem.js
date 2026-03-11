/**
 * Rabbit: soft curves, centroid/treble + mode：線粗細、形狀大小、顏色.
 */
function RabbitSystem() {
  this.phase = 0;
  this.points = [];
  for (let i = 0; i <= 20; i++) this.points.push({ x: 0, y: 0 });
}

RabbitSystem.prototype.update = function (a) {
  const centroid = (a && a.centroid) !== undefined ? a.centroid : 1000;
  const treble = (a && a.treble) !== undefined ? a.treble : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const norm = Math.min(1, centroid / 4000);
  const curve = 0.3 + norm * 0.5 + treble * 0.2 + intensity * 0.15;
  const radius = (0.15 + curve * 0.2) * (mode === 0 ? 0.8 : mode === 2 ? 1.25 : 1);
  this.phase += 0.02 + intensity * 0.01;
  this.points.forEach(function (pt, i) {
    const t = (i / (this.points.length - 1)) * Math.PI * 2 + this.phase;
    pt.x = 0.5 + Math.cos(t) * radius;
    pt.y = 0.5 + Math.sin(t) * radius;
  }, this);
  this._strokeWeight = 1 + intensity * 1.5 + (mode === 2 ? 1 : 0);
  this._bright = Math.floor(220 + intensity * 35 - mode * 25);
};

RabbitSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(this._bright || 240, this._bright - 20 || 220, this._bright || 220);
  p.strokeWeight(this._strokeWeight || 2);
  p.beginShape();
  this.points.forEach(function (pt) {
    p.vertex(x + pt.x * w, y + pt.y * h);
  });
  p.endShape(p.CLOSE);
};
