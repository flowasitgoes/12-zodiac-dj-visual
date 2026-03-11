/**
 * Dragon: 多層不同濃度的雲 — 遠近、四面八方飄動.
 * 每 10 秒觸發一次「爆炸／散列」：粒子從中心向外散開再緩慢收回，療癒感.
 */
function DragonSystem() {
  this.clouds = [];
  const layerCount = 8;
  for (let i = 0; i < layerCount; i++) {
    this.clouds.push(this.createCloud(i));
  }
  this.burstParticles = [];
  this._lastBurstCycle = -1;
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
  const time = (a && typeof a.time === 'number') ? a.time : 0;
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

  const BURST_INTERVAL = 10;
  const BURST_OUT_DURATION = 2.5;
  const BURST_RETURN_DURATION = 3.5;
  const tInCycle = time % BURST_INTERVAL;
  const burstCycle = Math.floor(time / BURST_INTERVAL);

  if (tInCycle >= 6) {
    this._lastBurstCycle = burstCycle - 1;
  }
  if (tInCycle < BURST_OUT_DURATION && burstCycle > this._lastBurstCycle) {
    this._lastBurstCycle = burstCycle;
    this.burstParticles = [];
    const n = 50 + Math.floor(Math.random() * 25);
    for (let i = 0; i < n; i++) {
      this.burstParticles.push({
        angle: Math.random() * Math.PI * 2,
        targetR: 0.15 + Math.random() * 0.35,
        opacity: 0.3 + Math.random() * 0.5
      });
    }
  }

  if (this.burstParticles.length > 0) {
    if (tInCycle < BURST_OUT_DURATION) {
      const progress = tInCycle / BURST_OUT_DURATION;
      const ease = 1 - Math.pow(1 - progress, 1.4);
      this.burstParticles.forEach(function (pt) {
        pt.currentR = pt.targetR * ease;
      });
    } else if (tInCycle < BURST_OUT_DURATION + BURST_RETURN_DURATION) {
      const progress = (tInCycle - BURST_OUT_DURATION) / BURST_RETURN_DURATION;
      const ease = 1 - Math.pow(progress, 1.2);
      this.burstParticles.forEach(function (pt) {
        pt.currentR = pt.targetR * ease;
      });
    }
  }
};

DragonSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  const intensity = this._intensity !== undefined ? this._intensity : 0.5;
  const mode = this._mode !== undefined ? this._mode : 0;
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;

  this.clouds.forEach(function (c) {
    const cgx = x + c.x * w;
    const cgy = y + c.y * h;
    const r = Math.max(w, h) * c.size * (0.9 + intensity * 0.2);
    const alpha = Math.min(0.55, c.opacity * (0.7 + intensity * 0.5));
    const g = p.drawingContext.createRadialGradient(cgx, cgy, 0, cgx, cgy, r);
    g.addColorStop(0, 'rgba(200,180,255,' + alpha * 0.9 + ')');
    g.addColorStop(0.4, 'rgba(160,140,230,' + alpha * 0.5 + ')');
    g.addColorStop(0.7, 'rgba(120,100,200,' + alpha * 0.2 + ')');
    g.addColorStop(1, 'rgba(90,70,160,0)');
    p.drawingContext.fillStyle = g;
    p.drawingContext.beginPath();
    p.drawingContext.ellipse(cgx, cgy, r, r * 0.7, 0, 0, Math.PI * 2);
    p.drawingContext.fill();
  });

  if (this.burstParticles && this.burstParticles.length > 0) {
    const baseR = Math.min(w, h) * 0.5;
    this.burstParticles.forEach(function (pt) {
      const px = cx + Math.cos(pt.angle) * (pt.currentR || 0) * baseR;
      const py = cy + Math.sin(pt.angle) * (pt.currentR || 0) * baseR;
      const dotR = Math.max(1.5, baseR * 0.012);
      const alpha = (pt.opacity || 0.5) * (0.6 + intensity * 0.3);
      const g = p.drawingContext.createRadialGradient(px, py, 0, px, py, dotR * 2);
      g.addColorStop(0, 'rgba(220,200,255,' + alpha + ')');
      g.addColorStop(0.5, 'rgba(160,140,230,' + alpha * 0.4 + ')');
      g.addColorStop(1, 'rgba(120,100,200,0)');
      p.drawingContext.fillStyle = g;
      p.drawingContext.beginPath();
      p.drawingContext.arc(px, py, dotR * 2, 0, Math.PI * 2);
      p.drawingContext.fill();
    });
  }
};
