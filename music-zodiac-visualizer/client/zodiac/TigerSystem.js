/**
 * Tiger: 爆炸線條，beat 觸發。每 27 秒換一種線條構成／交織方式（27、54、81…）.
 */
function TigerSystem() {
  this.lines = [];
  this.maxLines = 24;
  for (let i = 0; i < this.maxLines; i++) {
    this.lines.push({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5, life: 0 });
  }
  this.nextIndex = 0;
  this._lastVariant = -1;
}

TigerSystem.prototype.getVariant = function (time) {
  return Math.floor(time / 27);
};

TigerSystem.prototype.angleForVariant = function (variantIndex, randomOffset) {
  const v = variantIndex % 5;
  if (v === 0) {
    return Math.random() * Math.PI * 2;
  }
  if (v === 1) {
    const spoke = Math.floor(Math.random() * 8);
    return (spoke / 8) * Math.PI * 2 + (randomOffset || 0);
  }
  if (v === 2) {
    const spoke = Math.floor(Math.random() * 12);
    return (spoke / 12) * Math.PI * 2 + (randomOffset || 0);
  }
  if (v === 3) {
    const fromLeft = Math.random() < 0.5;
    const jitter = (Math.random() - 0.5) * 0.4;
    return fromLeft ? jitter : Math.PI + jitter;
  }
  const axis = Math.random() < 0.5;
  const dir = Math.random() < 0.5 ? 0 : Math.PI;
  return axis ? dir : Math.PI / 2 + dir;
};

TigerSystem.prototype.spawnLine = function (L, variantIndex, lenMin, lenRange, w, h) {
  const cx = 0.5;
  const cy = 0.5;
  const v = variantIndex % 5;
  if (v <= 2) {
    const angle = this.angleForVariant(variantIndex);
    const len = lenMin + Math.random() * lenRange;
    L.x1 = cx;
    L.y1 = cy;
    L.x2 = cx + Math.cos(angle) * len;
    L.y2 = cy + Math.sin(angle) * len;
  } else if (v === 3) {
    const fromLeft = Math.random() < 0.5;
    const len = lenMin + Math.random() * lenRange;
    const yJitter = (Math.random() - 0.5) * 0.3;
    if (fromLeft) {
      L.x1 = 0.2;
      L.y1 = 0.5 + yJitter;
      L.x2 = 0.2 + len;
      L.y2 = 0.5 + yJitter + (Math.random() - 0.5) * 0.2;
    } else {
      L.x1 = 0.8;
      L.y1 = 0.5 + yJitter;
      L.x2 = 0.8 - len;
      L.y2 = 0.5 + yJitter + (Math.random() - 0.5) * 0.2;
    }
  } else {
    const horizontal = Math.random() < 0.5;
    const len = lenMin + Math.random() * lenRange;
    if (horizontal) {
      L.x1 = cx;
      L.y1 = cy;
      L.x2 = cx + (Math.random() < 0.5 ? -1 : 1) * len;
      L.y2 = cy;
    } else {
      L.x1 = cx;
      L.y1 = cy;
      L.x2 = cx;
      L.y2 = cy + (Math.random() < 0.5 ? -1 : 1) * len;
    }
  }
  L.life = 1;
};

TigerSystem.prototype.update = function (a) {
  const time = (a && typeof a.time === 'number') ? a.time : 0;
  const variantIndex = this.getVariant(time);
  if (variantIndex !== this._lastVariant) {
    this._lastVariant = variantIndex;
    this.lines.forEach(function (L) { L.life = 0; });
    this.nextIndex = 0;
  }

  const beat = (a && a.beat) || false;
  const e = (a && a.energy) || 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const lenMin = 0.15 + intensity * 0.15;
  const lenRange = mode === 0 ? 0.2 : mode === 2 ? 0.5 : 0.35;
  const spawnOk = mode === 0 ? e > 0.35 : mode === 1 ? e > 0.2 : e > 0.1;

  if (beat && spawnOk) {
    const L = this.lines[this.nextIndex % this.maxLines];
    this.spawnLine(L, variantIndex, lenMin, lenRange);
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
