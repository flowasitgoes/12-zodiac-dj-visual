/**
 * Rooster: 同心三角環 (類似 loader aro)，依時間做上下層次動畫，保留 mode/energy 驅動顏色與節奏.
 */
function RoosterSystem() {
  this.numRings = 15;
}

RoosterSystem.prototype.update = function (a) {
  const e = (a && a.energy) || 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const time = (a && typeof a.time === 'number') ? a.time : 0;
  this._strokeWeight = 1.5 + intensity * 2 + (mode === 2 ? 1 : 0);
  this._r = Math.min(255, Math.floor(220 + intensity * 35 + e * 30));
  this._g = Math.floor(80 + intensity * 30);
  this._b = Math.floor(30 + mode * 15);
  this._time = time;
  this._speed = 1.5 + e * 1.5 + (mode === 2 ? 0.5 : 0);
};

RoosterSystem.prototype.draw = function (p, x, y, w, h) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const time = this._time || 0;
  const speed = this._speed || 2;
  const numRings = this.numRings;
  const marginStep = 0.055;

  p.noFill();
  p.strokeWeight(this._strokeWeight || 2);

  for (let i = 0; i < numRings; i++) {
    const inset = i * marginStep;
    const x1 = x + (0.03 + inset) * w;
    const y1 = y + (0.03 + inset) * h;
    const x2 = x + (0.97 - inset) * w;
    const y2 = y + (0.03 + inset) * h;
    const x3 = x + 0.5 * w;
    const y3 = y + (0.97 - inset) * h;

    const phase = (time * speed + i * -0.12) % (Math.PI * 2);
    const depth = Math.sin(phase);
    const alpha = 0.5 + 0.5 * depth;
    const scale = 1 + depth * 0.06;

    p.push();
    p.translate(cx, cy);
    p.scale(scale);
    p.translate(-cx, -cy);
    p.stroke(this._r || 255, this._g || 100, this._b || 50, 80 + alpha * 175);
    p.beginShape();
    p.vertex(x1, y1);
    p.vertex(x2, y2);
    p.vertex(x3, y3);
    p.endShape(p.CLOSE);
    p.pop();
  }
};
