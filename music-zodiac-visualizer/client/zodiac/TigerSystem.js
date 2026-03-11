/**
 * Tiger: explosive lines, beat triggered.
 * mode 來自歌曲起伏：calm=少/短, build=變多, peak=長/多, release=漸淡.
 */
function TigerSystem() {
  this.lines = [];
  this.maxLines = 24;
  for (let i = 0; i < this.maxLines; i++) {
    this.lines.push({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5, life: 0 });
  }
  this.nextIndex = 0;
}

TigerSystem.prototype.update = function (a) {
  const beat = (a && a.beat) || false;
  const e = (a && a.energy) || 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const lenMin = 0.15 + intensity * 0.15;
  const lenRange = mode === 0 ? 0.2 : mode === 2 ? 0.5 : 0.35;
  const spawnOk = mode === 0 ? e > 0.35 : mode === 1 ? e > 0.2 : e > 0.1;
  if (beat && spawnOk) {
    const L = this.lines[this.nextIndex % this.maxLines];
    const angle = Math.random() * Math.PI * 2;
    const len = lenMin + Math.random() * lenRange;
    L.x1 = 0.5;
    L.y1 = 0.5;
    L.x2 = 0.5 + Math.cos(angle) * len;
    L.y2 = 0.5 + Math.sin(angle) * len;
    L.life = 1;
    this.nextIndex++;
  }
  const decay = mode === 0 ? 0.04 : mode === 2 ? 0.02 : mode === 3 ? 0.032 : 0.028;
  this.lines.forEach(function (L) {
    if (L.life > 0) L.life -= decay;
  });
  this._strokeWeight = 0.6 + intensity * 0.7 + (mode === 2 ? 0.35 : 0);
  this._r = 255;
  this._g = Math.floor(140 - mode * 15);
  this._b = Math.floor(60 + intensity * 30);
};

TigerSystem.prototype.draw = function (p, x, y, w, h) {
  p.strokeWeight(this._strokeWeight || 1);
  this.lines.forEach(function (L) {
    if (L.life <= 0) return;
    p.stroke(this._r || 255, this._g || 140, this._b || 60, L.life * 255);
    p.line(x + L.x1 * w, y + L.y1 * h, x + L.x2 * w, y + L.y2 * h);
  }, this);
};
