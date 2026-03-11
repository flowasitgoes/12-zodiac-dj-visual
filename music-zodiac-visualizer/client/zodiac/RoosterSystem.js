/**
 * Rooster: radial spikes, beat/energy + mode：線粗細、長度、顏色、密度.
 */
function RoosterSystem() {
  this.spikes = [];
  this.maxSpikes = 20;
  for (let i = 0; i < this.maxSpikes; i++) {
    this.spikes.push({ angle: 0, len: 0, life: 0 });
  }
  this.nextIndex = 0;
}

RoosterSystem.prototype.update = function (a) {
  const beat = (a && a.beat) || false;
  const e = (a && a.energy) || 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const spawnChance = mode === 0 ? 0.2 : mode === 2 ? 0.6 : 0.4;
  if ((beat || e > 0.4) && Math.random() < spawnChance) {
    const s = this.spikes[this.nextIndex % this.maxSpikes];
    s.angle = Math.random() * Math.PI * 2;
    s.len = (0.15 + e * 0.25) * (mode === 2 ? 1.3 : mode === 0 ? 0.8 : 1);
    s.life = 1;
    this.nextIndex++;
  }
  const decay = mode === 0 ? 0.035 : mode === 2 ? 0.018 : 0.025;
  this.spikes.forEach(function (s) {
    if (s.life > 0) s.life -= decay;
  });
  this._strokeWeight = 1.5 + intensity * 2 + (mode === 2 ? 1 : 0);
  this._r = Math.min(255, Math.floor(220 + intensity * 35 + e * 30));
  this._g = Math.floor(80 + intensity * 30);
  this._b = Math.floor(30 + mode * 15);
};

RoosterSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  p.strokeWeight(this._strokeWeight || 2);
  this.spikes.forEach(function (s) {
    if (s.life <= 0) return;
    p.stroke(this._r || 255, this._g || 100, this._b || 50, s.life * 255);
    const ex = cx + Math.cos(s.angle) * s.len * Math.min(w, h);
    const ey = cy + Math.sin(s.angle) * s.len * Math.min(w, h);
    p.line(cx, cy, ex, ey);
  }, this);
};
