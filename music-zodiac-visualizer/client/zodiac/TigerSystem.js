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
  const time = (a && typeof a.time === 'number') ? a.time : 0;
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

  const TUMBLE_START = 90;
  const TUMBLE_DURATION = 5;
  const TUMBLE_END = 135;
  if (time >= TUMBLE_START && time < TUMBLE_END) {
    const localT = ((time - TUMBLE_START) % TUMBLE_DURATION) / TUMBLE_DURATION;
    if (localT < 0.25) {
      this._tumbleAngle = -4 * Math.PI + (localT / 0.25) * 4 * Math.PI;
    } else if (localT < 0.75) {
      this._tumbleAngle = 0;
    } else {
      this._tumbleAngle = ((localT - 0.75) / 0.25) * 4 * Math.PI;
    }
  } else {
    this._tumbleAngle = null;
  }
};

TigerSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const tumble = this._tumbleAngle != null;

  p.push();
  if (tumble) {
    p.translate(cx, cy);
    p.rotate(this._tumbleAngle);
    p.translate(-w * 0.5, -h * 0.5);
  }
  p.strokeWeight(this._strokeWeight || 1);
  this.lines.forEach(function (L) {
    if (L.life <= 0) return;
    p.stroke(this._r || 255, this._g || 140, this._b || 60, L.life * 255);
    const x1 = tumble ? L.x1 * w : x + L.x1 * w;
    const y1 = tumble ? L.y1 * h : y + L.y1 * h;
    const x2 = tumble ? L.x2 * w : x + L.x2 * w;
    const y2 = tumble ? L.y2 * h : y + L.y2 * h;
    p.line(x1, y1, x2, y2);
  }, this);
  p.pop();
};
