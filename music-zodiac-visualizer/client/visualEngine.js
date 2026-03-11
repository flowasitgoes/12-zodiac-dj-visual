/**
 * Visual Engine: 3x4 grid, 12 zodiac systems.
 * Global camera: 旋轉、縮放、平移 隨 mode/intensity 變化.
 * Per-cell: 每格輕微傾斜角度，增加景深與透視感.
 */
function VisualEngine() {
  this.width = 800;
  this.height = 600;
  this.cols = 4;
  this.rows = 3;
  this.systems = [
    new RatSystem(),
    new OxSystem(),
    new TigerSystem(),
    new RabbitSystem(),
    new DragonSystem(),
    new SnakeSystem(),
    new HorseSystem(),
    new GoatSystem(),
    new MonkeySystem(),
    new RoosterSystem(),
    new DogSystem(),
    new PigSystem()
  ];
}

VisualEngine.prototype.resize = function (w, h) {
  this.width = w;
  this.height = h;
};

VisualEngine.prototype.draw = function (p, audioData) {
  const w = this.width;
  const h = this.height;
  const cw = w / this.cols;
  const ch = h / this.rows;
  const ctx = p.drawingContext;
  if (!ctx) return;

  const mode = (audioData && typeof audioData.mode === 'number') ? audioData.mode : 0;
  const intensity = (audioData && typeof audioData.intensity === 'number') ? audioData.intensity : 0.5;
  const energy = (audioData && audioData.energy) !== undefined ? audioData.energy : 0;

  // —— 整體相機：旋轉、縮放、輕微平移 ——
  const cameraAngle = (mode - 1.5) * 0.018 + (intensity - 0.5) * 0.04;
  const cameraZoom = 0.96 + intensity * 0.08;
  const panX = (energy - 0.5) * w * 0.02;
  const panY = (intensity - 0.5) * h * 0.015;

  p.push();
  p.translate(w / 2, h / 2);
  p.rotate(cameraAngle);
  p.scale(cameraZoom);
  p.translate(panX, panY);
  p.translate(-w / 2, -h / 2);

  for (let i = 0; i < this.systems.length; i++) {
    const sys = this.systems[i];
    sys.update(audioData);
    const col = i % this.cols;
    const row = Math.floor(i / this.cols);
    const x = col * cw;
    const y = row * ch;

    // —— 每格輕微傾斜（依格位 + mode/intensity），像一片片有角度的面 ——
    const cellTilt = (col - 1.5) * 0.012 + (row - 1) * 0.008 + (mode - 1) * 0.01 + (intensity - 0.5) * 0.02;

    p.push();
    p.translate(x, y);
    p.translate(cw / 2, ch / 2);
    p.rotate(cellTilt);
    p.translate(-cw / 2, -ch / 2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.clip();
    sys.draw(p, 0, 0, cw, ch);
    ctx.restore();
    p.pop();
  }

  p.pop();
};
