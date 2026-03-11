/**
 * Dragon: 多層雲霧飄動 + 每 10 秒一次「漩渦」：繞中心軌道粒子先向內收斂再擴散，帶殘影，療癒感.
 */
function DragonSystem() {
  this.clouds = [];
  const layerCount = 8;
  for (let i = 0; i < layerCount; i++) {
    this.clouds.push(this.createCloud(i));
  }
  this.orbiters = [];
  this._orbitersReady = false;
  this._vortexSegment = -1;
}

DragonSystem.prototype.initOrbiters = function (w, h) {
  if (this._orbitersReady) return;
  const count = 50 + Math.floor(30 * Math.random());
  const minSize = Math.min(w, h);
  for (let i = 0; i < count; i++) {
    const r1 = Math.random() * 0.2 + 0.05;
    const r2 = Math.random() * 0.25 + 0.2;
    const orbitRadius = (r1 + r2) / 2;
    const normRadius = Math.min(1, orbitRadius / 0.42);
    this.orbiters.push({
      orbitRadius: orbitRadius,
      angle: Math.random() * Math.PI * 2,
      speed: (0.8 + Math.random() * 1.2) * 0.012,
      alpha: 0.35 * (1 - normRadius * 0.7)
    });
  }
  this._orbitersReady = true;
};

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

  const VORTEX_INTERVAL = 10;
  const VORTEX_DURATION = 5;
  const inWindow = time % VORTEX_INTERVAL;
  this._vortexActive = time >= VORTEX_INTERVAL && inWindow < VORTEX_DURATION;
  if (this._vortexActive) {
    const segment = Math.floor(time / VORTEX_INTERVAL);
    if (segment !== this._vortexSegment) {
      this._vortexSegment = segment;
      this._vortexCenterX = 0.3 + Math.random() * 0.4;
      this._vortexCenterY = 0.3 + Math.random() * 0.4;
    }
    const t = inWindow / VORTEX_DURATION;
    this._vortexPhase = t < 0.5
      ? 1 - t * 2
      : (t - 0.5) * 2;
    this.orbiters.forEach(function (o) {
      o.angle += o.speed * (t < 0.5 ? 1.2 : 0.85);
    });
  }
};

DragonSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  const intensity = this._intensity !== undefined ? this._intensity : 0.5;
  const mode = this._mode !== undefined ? this._mode : 0;

  if (this._vortexActive) {
    this.initOrbiters(w, h);
    const vcx = x + (this._vortexCenterX !== undefined ? this._vortexCenterX : 0.5) * w;
    const vcy = y + (this._vortexCenterY !== undefined ? this._vortexCenterY : 0.5) * h;
    const trailR = Math.min(w, h) * 0.5;
    const ctx = p.drawingContext;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(10,8,18,0.14)';
    ctx.beginPath();
    ctx.ellipse(vcx, vcy, trailR, trailR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

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

  if (this._vortexActive && this.orbiters.length) {
    const vcx = x + (this._vortexCenterX !== undefined ? this._vortexCenterX : 0.5) * w;
    const vcy = y + (this._vortexCenterY !== undefined ? this._vortexCenterY : 0.5) * h;
    const phase = this._vortexPhase !== undefined ? this._vortexPhase : 1;
    const baseR = Math.min(w, h) * 0.42;
    this.orbiters.forEach(function (o) {
      const r = baseR * o.orbitRadius * (0.25 + 0.75 * phase);
      const px = vcx + Math.cos(o.angle) * r;
      const py = vcy + Math.sin(o.angle) * r;
      const alpha = o.alpha * (0.6 + 0.4 * phase);
      p.noStroke();
      p.fill(200, 185, 255, alpha * 255);
      p.circle(px, py, 2.5);
    });
    p.noFill();
  }
};
