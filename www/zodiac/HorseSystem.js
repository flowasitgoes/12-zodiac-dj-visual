/**
 * Horse: running line, energy + mode：線粗細、波高、速度、顏色.
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
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  this.phase += (0.05 + e * 0.2) * (mode === 0 ? 0.7 : mode === 2 ? 1.3 : 1);
  const waveAmp = 0.15 * (0.6 + intensity * 0.8) * (mode === 2 ? 1.3 : mode === 0 ? 0.7 : 1);
  const speed = (0.02 + e * 0.04) * (mode === 2 ? 1.2 : 1);
  this.segments.forEach(function (s, i) {
    const t = (i / this.segments.length) * Math.PI * 4 + this.phase;
    s.x = (s.x - speed + 1) % 1;
    s.y = 0.5 + Math.sin(t) * waveAmp;
  }, this);
  this._strokeWeight = 1 + intensity * 2 + (mode === 2 ? 0.8 : 0);
  this._r = Math.floor(200 + intensity * 55);
  this._g = Math.floor(160 + e * 40);
  this._b = Math.floor(80 + intensity * 30);
};

HorseSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(this._r || 220, this._g || 180, this._b || 100);
  p.strokeWeight(this._strokeWeight || 2);
  p.beginShape();
  this.segments.forEach(function (s) {
    p.vertex(x + s.x * w, y + s.y * h);
  });
  p.endShape();
};
