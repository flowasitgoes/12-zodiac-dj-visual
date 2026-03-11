/**
 * Goat: organic branching shapes, centroid influences branches.
 */
function GoatSystem() {
  this.branches = [];
  this.depth = 0;
}

GoatSystem.prototype.update = function (a) {
  const centroid = (a && a.centroid) !== undefined ? a.centroid : 2000;
  const norm = Math.min(1, centroid / 5000);
  this.angleSpread = 0.4 + norm * 0.4;
  this.depth = Math.floor(4 + norm * 4);
};

GoatSystem.prototype._branch = function (p, x, y, w, h, len, angle, d) {
  if (d <= 0) return;
  const endX = x + Math.cos(angle) * len * w;
  const endY = y + Math.sin(angle) * len * h;
  p.line(x, y, endX, endY);
  const newLen = len * 0.7;
  this._branch(p, endX, endY, w, h, newLen, angle - this.angleSpread, d - 1);
  this._branch(p, endX, endY, w, h, newLen, angle + this.angleSpread, d - 1);
};

GoatSystem.prototype.draw = function (p, x, y, w, h) {
  p.stroke(180, 200, 160);
  p.strokeWeight(2);
  p.noFill();
  const cx = x + w * 0.5;
  const cy = y + h * 0.7;
  this._branch(p, cx, cy, w * 0.4, h * 0.4, 0.25, -Math.PI / 2, this.depth || 6);
};
