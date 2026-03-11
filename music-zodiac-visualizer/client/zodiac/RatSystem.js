/**
 * Rat: 迷宮式快跑 — 一條彎曲通道，小點在通道上快速奔跑，速度隨 beat/energy.
 */
function RatSystem() {
  this.path = [];  // 通道轉折點 (0~1, 0~1)
  this.buildPath();
  this.runner = { t: 0, speed: 0.02 };
}

RatSystem.prototype.buildPath = function () {
  const pts = [];
  const steps = [0.15, 0.35, 0.5, 0.65, 0.85];
  let px = 0.1;
  let py = 0.5;
  pts.push({ x: px, y: py });
  for (let i = 0; i < steps.length; i++) {
    if (i % 2 === 0) {
      px = steps[i];
      pts.push({ x: px, y: py });
      py = i % 4 === 0 ? 0.2 : 0.8;
      pts.push({ x: px, y: py });
    } else {
      py = steps[i];
      pts.push({ x: px, y: py });
      px = px > 0.5 ? 0.15 : 0.85;
      pts.push({ x: px, y: py });
    }
  }
  pts.push({ x: 0.9, y: py });
  this.path = pts;
  this.pathLength = this.computePathLength();
}

RatSystem.prototype.computePathLength = function () {
  let len = 0;
  for (let i = 1; i < this.path.length; i++) {
    const a = this.path[i - 1];
    const b = this.path[i];
    len += Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
  }
  return len;
};

RatSystem.prototype.getPathPoint = function (t) {
  const path = this.path;
  if (path.length < 2) return { x: 0.5, y: 0.5 };
  let remain = t * this.pathLength;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const seg = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    if (remain <= seg) {
      const u = remain / seg;
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
    remain -= seg;
  }
  return path[path.length - 1];
};

RatSystem.prototype.update = function (a) {
  const e = (a && a.energy) || 0;
  const beat = (a && a.beat) || false;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const baseSpeed = 0.008 + e * 0.04 + intensity * 0.02;
  const speed = mode === 0 ? baseSpeed * 0.7 : mode === 2 ? baseSpeed * 1.5 : baseSpeed;
  if (beat) this.runner.t += 0.15;
  this.runner.t += speed;
  if (this.runner.t > 1) this.runner.t -= 1;
  if (this.runner.t < 0) this.runner.t += 1;
  this._strokeWeight = 1.5 + intensity * 1;
  this._bright = Math.floor(240 + intensity * 15 - mode * 20);
};

RatSystem.prototype.draw = function (p, x, y, w, h) {
  const path = this.path;
  const pt = this.getPathPoint(this.runner.t);
  const px = x + pt.x * w;
  const py = y + pt.y * h;

  p.stroke(this._bright || 240, this._bright - 30 || 210, 180);
  p.strokeWeight(this._strokeWeight || 2);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < path.length; i++) {
    p.vertex(x + path[i].x * w, y + path[i].y * h);
  }
  p.endShape();

  p.noStroke();
  p.fill(255, 230, 200);
  p.circle(px, py, 6);
  p.fill(40, 35, 30);
  p.circle(px + 1, py + 1, 2);
};
