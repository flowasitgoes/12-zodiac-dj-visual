/**
 * Dragon: 多層不同濃度的雲 — 遠近、四面八方飄動，不固定在上方.
 */
function DragonSystem() {
  this.clouds = [];
  const layerCount = 8;
  for (let i = 0; i < layerCount; i++) {
    this.clouds.push(this.createCloud(i));
  }
}

DragonSystem.prototype.createCloud = function (i) {
  const side = Math.floor(Math.random() * 4);
  let x, y, driftX, driftY;
  if (side === 0) {
    x = Math.random();
    y = -0.15 - Math.random() * 0.2;
    driftX = (Math.random() - 0.5) * 0.004;
    driftY = 0.002 + Math.random() * 0.003;
  } else if (side === 1) {
    x = 1.15 + Math.random() * 0.2;
    y = Math.random();
    driftX = -0.002 - Math.random() * 0.003;
    driftY = (Math.random() - 0.5) * 0.004;
  } else if (side === 2) {
    x = Math.random();
    y = 1.15 + Math.random() * 0.2;
    driftX = (Math.random() - 0.5) * 0.004;
    driftY = -0.002 - Math.random() * 0.003;
  } else {
    x = -0.15 - Math.random() * 0.2;
    y = Math.random();
    driftX = 0.002 + Math.random() * 0.003;
    driftY = (Math.random() - 0.5) * 0.004;
  }
  const size = 0.12 + Math.random() * 0.22;
  const opacity = 0.12 + Math.random() * 0.3;
  return {
    x: x,
    y: y,
    size: size,
    opacity: opacity,
    driftX: driftX,
    driftY: driftY
  };
};

DragonSystem.prototype.update = function (a) {
  const spread = (a && a.spread) !== undefined ? a.spread : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  const speed = (0.8 + (spread || 0) / 10000) * (mode === 0 ? 0.7 : mode === 2 ? 1.4 : 1);
  const self = this;
  this.clouds.forEach(function (c, i) {
    c.x += c.driftX * speed;
    c.y += c.driftY * speed;
    if (c.x < -0.35 || c.x > 1.35 || c.y < -0.35 || c.y > 1.35) {
      var newC = self.createCloud(i);
      c.x = newC.x;
      c.y = newC.y;
      c.driftX = newC.driftX;
      c.driftY = newC.driftY;
      c.size = newC.size;
      c.opacity = newC.opacity;
    }
  });
  this._intensity = intensity;
  this._mode = mode;
};

DragonSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  const intensity = this._intensity !== undefined ? this._intensity : 0.5;
  const mode = this._mode !== undefined ? this._mode : 0;

  this.clouds.forEach(function (c) {
    const cx = x + c.x * w;
    const cy = y + c.y * h;
    const r = Math.max(w, h) * c.size * (0.9 + intensity * 0.2);
    const alpha = Math.min(0.55, c.opacity * (0.7 + intensity * 0.5));
    const g = p.drawingContext.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(200,180,255,' + alpha * 0.9 + ')');
    g.addColorStop(0.4, 'rgba(160,140,230,' + alpha * 0.5 + ')');
    g.addColorStop(0.7, 'rgba(120,100,200,' + alpha * 0.2 + ')');
    g.addColorStop(1, 'rgba(90,70,160,0)');
    p.drawingContext.fillStyle = g;
    p.drawingContext.beginPath();
    p.drawingContext.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2);
    p.drawingContext.fill();
  });
};
