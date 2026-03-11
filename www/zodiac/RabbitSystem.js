/**
 * Rabbit: soft curves, centroid/treble + mode：線粗細、形狀大小、顏色.
 * 每 6 秒觸發約 2 秒「擺動」；每 10 秒在附近隨機位置出現一個影分身（第二個圓），每 15 秒收回，最多同時兩個圓.
 */
function RabbitSystem() {
  this.phase = 0;
  this.points = [];
  for (let i = 0; i <= 20; i++) this.points.push({ x: 0, y: 0 });
  this.swayAngle = 0;
  this._showClone = false;
  this._cloneOffsetX = 0;
  this._cloneOffsetY = 0;
  this._lastCloneSegment = -1;
}

RabbitSystem.prototype.update = function (a) {
  const centroid = (a && a.centroid) !== undefined ? a.centroid : 1000;
  const treble = (a && a.treble) !== undefined ? a.treble : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const time = (a && typeof a.time === 'number') ? a.time : 0;
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

  const SWAY_INTERVAL = 6;
  const SWAY_DURATION = 2;
  const inCycle = time % SWAY_INTERVAL;
  const isSway = time >= SWAY_INTERVAL && inCycle < SWAY_DURATION;
  if (isSway) {
    const localT = inCycle / SWAY_DURATION;
    this.swayAngle = Math.sin(localT * Math.PI) * 0.28;
  } else {
    this.swayAngle = 0;
  }

  const CLONE_INTERVAL = 10;
  const RESET_INTERVAL = 15;
  const phase30 = time % 30;
  this._showClone = (phase30 >= 10 && phase30 < 15) || (phase30 >= 20 && phase30 < 25);
  if (this._showClone) {
    const segment = Math.floor(time / 5);
    if (segment !== this._lastCloneSegment) {
      this._lastCloneSegment = segment;
      this._cloneOffsetX = (Math.random() - 0.5) * 0.36;
      this._cloneOffsetY = (Math.random() - 0.5) * 0.36;
    }
  }
};

RabbitSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(this._bright || 240, this._bright - 20 || 220, this._bright || 220);
  p.strokeWeight(this._strokeWeight || 2);
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const self = this;

  function drawOneShape(centerX, centerY) {
    p.push();
    p.translate(centerX, centerY);
    p.rotate(self.swayAngle || 0);
    p.translate(-w * 0.5, -h * 0.5);
    p.beginShape();
    self.points.forEach(function (pt) {
      p.vertex(pt.x * w, pt.y * h);
    });
    p.endShape(p.CLOSE);
    p.pop();
  }

  if (this._showClone) {
    p.push();
    p.drawingContext.globalAlpha = 0.5;
    p.stroke(this._bright || 240, this._bright - 20 || 220, this._bright || 220);
    drawOneShape(cx + this._cloneOffsetX * w, cy + this._cloneOffsetY * h);
    p.pop();
    p.drawingContext.globalAlpha = 1;
  }
  drawOneShape(cx, cy);
};
