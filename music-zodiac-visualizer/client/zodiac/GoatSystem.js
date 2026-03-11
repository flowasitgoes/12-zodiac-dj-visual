/**
 * Goat: branching, centroid + mode：線粗細、分支深度、展開角度、顏色.
 */
function GoatSystem() {
  this.branches = [];
  this.depth = 0;
}

GoatSystem.prototype.update = function (a) {
  const centroid = (a && a.centroid) !== undefined ? a.centroid : 2000;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const norm = Math.min(1, centroid / 5000);
  this.angleSpread = (0.4 + norm * 0.4) * (mode === 0 ? 0.85 : mode === 2 ? 1.2 : 1);
  this.depth = Math.floor(4 + norm * 4 + intensity * 2 + (mode === 2 ? 1 : 0));
  this._strokeWeight = 1.2 + intensity * 1.5 + (mode === 2 ? 0.5 : 0);
  this._r = Math.floor(140 + intensity * 50 + norm * 30);
  this._g = Math.floor(180 + centroid / 3000);
  this._b = Math.floor(120 + intensity * 50);
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
  p.stroke(this._r || 180, this._g || 200, this._b || 160);
  p.strokeWeight(this._strokeWeight || 2);
  p.noFill();
  const cx = x + w * 0.5;
  const cy = y + h * 0.7;
  const lenScale = 0.25 * (0.85 + (this._strokeWeight || 0) * 0.05);
  this._branch(p, cx, cy, w * 0.4, h * 0.4, lenScale, -Math.PI / 2, this.depth || 6);
};
