/**
 * Rooster: 同心三角環，每 23 秒換一種格子／交織方式，數量 1–9 隨機；三角形略縮小.
 */
function RoosterSystem() {
  this._lastVariantIndex = -1;
  this._count = 5;
}

RoosterSystem.prototype.update = function (a) {
  const e = (a && a.energy) || 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const time = (a && typeof a.time === 'number') ? a.time : 0;
  const variantIndex = Math.floor(time / 23);
  if (variantIndex !== this._lastVariantIndex) {
    this._lastVariantIndex = variantIndex;
    this._count = 1 + ((variantIndex * 7 + 11) % 9);
  }
  this._strokeWeight = 1.5 + intensity * 2 + (mode === 2 ? 1 : 0);
  this._r = Math.min(255, Math.floor(220 + intensity * 35 + e * 30));
  this._g = Math.floor(80 + intensity * 30);
  this._b = Math.floor(30 + mode * 15);
  this._time = time;
  this._speed = 1.5 + e * 1.5 + (mode === 2 ? 0.5 : 0);
  this._variant = variantIndex % 5;
};

RoosterSystem.prototype.drawTriangleRing = function (p, x, y, w, h, inset, marginStep, rotDeg) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const scale = 0.72;
  const left = 0.5 - scale * 0.5 + inset * marginStep;
  const right = 0.5 + scale * 0.5 - inset * marginStep;
  const top = 0.5 - scale * 0.5 + inset * marginStep;
  const bottom = 0.5 + scale * 0.5 - inset * marginStep;
  const x1 = x + left * w;
  const y1 = y + top * h;
  const x2 = x + right * w;
  const y2 = y + top * h;
  const x3 = x + 0.5 * w;
  const y3 = y + bottom * h;
  p.push();
  p.translate(cx, cy);
  if (rotDeg) p.rotate(rotDeg);
  p.translate(-cx, -cy);
  p.beginShape();
  p.vertex(x1, y1);
  p.vertex(x2, y2);
  p.vertex(x3, y3);
  p.endShape(p.CLOSE);
  p.pop();
};

RoosterSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const time = this._time || 0;
  const speed = this._speed || 2;
  const variant = this._variant !== undefined ? this._variant : 0;
  const count = this._count || 5;
  const marginStep = 0.038;

  p.noFill();
  p.strokeWeight(this._strokeWeight || 2);

  if (variant === 0) {
    for (let i = 0; i < count; i++) {
      const phase = (time * speed + i * -0.12) % (Math.PI * 2);
      const depth = Math.sin(phase);
      const alpha = 0.5 + 0.5 * depth;
      const scale = 1 + depth * 0.06;
      p.stroke(this._r || 255, this._g || 100, this._b || 50, 80 + alpha * 175);
      p.push();
      p.translate(cx, cy);
      p.scale(scale);
      p.translate(-cx, -cy);
      this.drawTriangleRing(p, x, y, w, h, i, marginStep, 0);
      p.pop();
    }
  } else if (variant === 1) {
    for (let i = 0; i < count; i++) {
      const phase = (time * speed + i * -0.12) % (Math.PI * 2);
      const depth = Math.sin(phase);
      const alpha = 0.5 + 0.5 * depth;
      p.stroke(this._r || 255, this._g || 100, this._b || 50, 80 + alpha * 175);
      this.drawTriangleRing(p, x, y, w, h, i, marginStep, Math.PI / 4);
    }
    for (let i = 0; i < count; i++) {
      const phase = (time * speed + i * -0.12 + 1.5) % (Math.PI * 2);
      const depth = Math.sin(phase);
      const alpha = 0.5 + 0.5 * depth;
      p.stroke(this._r || 255, this._g || 100, this._b || 50, 60 + alpha * 150);
      this.drawTriangleRing(p, x, y, w, h, i, marginStep, -Math.PI / 4);
    }
  } else if (variant === 2) {
    const rots = [0, Math.PI * 2 / 3, Math.PI * 4 / 3];
    const n = Math.max(1, Math.floor(count / 3));
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < n; i++) {
        const phase = (time * speed + (r * n + i) * -0.1) % (Math.PI * 2);
        const depth = Math.sin(phase);
        const alpha = 0.5 + 0.5 * depth;
        p.stroke(this._r || 255, this._g || 100, this._b || 50, 70 + alpha * 165);
        this.drawTriangleRing(p, x, y, w, h, i, marginStep, rots[r]);
      }
    }
  } else if (variant === 3) {
    for (let i = 0; i < count; i++) {
      const phase = (time * speed + i * 0.15) % (Math.PI * 2);
      const depth = Math.sin(phase);
      const alpha = 0.5 + 0.5 * depth;
      const rad = 0.35 - (i / count) * 0.28;
      p.stroke(this._r || 255, this._g || 100, this._b || 50, 80 + alpha * 175);
      p.push();
      p.translate(cx, cy);
      p.scale(1 + depth * 0.05);
      p.translate(-cx, -cy);
      p.ellipse(cx, cy, rad * w, rad * h);
      p.pop();
    }
  } else {
    for (let i = 0; i < count; i++) {
      const phase = (time * speed + i * -0.12) % (Math.PI * 2);
      const depth = Math.sin(phase);
      const alpha = 0.5 + 0.5 * depth;
      p.stroke(this._r || 255, this._g || 100, this._b || 50, 80 + alpha * 175);
      this.drawTriangleRing(p, x, y, w, h, i, marginStep, 0);
    }
    for (let i = 0; i < count; i++) {
      const phase = (time * speed + i * -0.12 + Math.PI * 0.5) % (Math.PI * 2);
      const depth = Math.sin(phase);
      const alpha = 0.5 + 0.5 * depth;
      p.stroke(this._r || 255, this._g || 100, this._b || 50, 65 + alpha * 160);
      this.drawTriangleRing(p, x, y, w, h, i, marginStep, Math.PI / 2);
    }
  }
};
