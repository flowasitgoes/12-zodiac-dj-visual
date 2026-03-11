/**
 * Dragon: fluid / smoke, spectralSpread driven.
 */
function DragonSystem() {
  this.blobs = [];
  for (let i = 0; i < 15; i++) {
    this.blobs.push({ x: Math.random(), y: Math.random(), r: 0.05, spread: 0.1 });
  }
}

DragonSystem.prototype.update = function (a) {
  const spread = (a && a.spread) !== undefined ? a.spread : 0;
  const norm = Math.min(1, (spread || 0) / 200);
  const drift = 0.002 + norm * 0.02;
  this.blobs.forEach(function (b, i) {
    b.x += (Math.sin(i * 0.7) * drift);
    b.y += (Math.cos(i * 0.5) * drift);
    if (b.x < 0 || b.x > 1) b.x = Math.max(0, Math.min(1, b.x));
    if (b.y < 0 || b.y > 1) b.y = Math.max(0, Math.min(1, b.y));
    b.spread = 0.05 + norm * 0.15;
    b.r = 0.03 + norm * 0.08;
  });
};

DragonSystem.prototype.draw = function (p, x, y, w, h) {
  p.noStroke();
  this.blobs.forEach(function (b) {
    const px = x + b.x * w;
    const py = y + b.y * h;
    const r = Math.max(w, h) * b.r;
    const g = p.drawingContext.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(200,180,255,0.4)');
    g.addColorStop(0.5, 'rgba(120,100,200,0.15)');
    g.addColorStop(1, 'rgba(80,60,150,0)');
    p.drawingContext.fillStyle = g;
    p.drawingContext.fillRect(px - r, py - r, r * 2, r * 2);
  });
};
