/**
 * Visual Engine: 3x4 grid, 12 zodiac systems.
 * 1:30 後：每 5 秒輪流凸顯一個生肖（共 60 秒），接著「旋轉壽司」式流轉（3D 旋轉木馬感）.
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
  this.REVEAL_START = 90;
  this.REVEAL_DURATION = 60;
  this.CONVEYOR_START = 90 + 60;
  this.CONVEYOR_SPEED = 0.35;
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

  const time = (audioData && typeof audioData.time === 'number') ? audioData.time : 0;
  const mode = (audioData && typeof audioData.mode === 'number') ? audioData.mode : 0;
  const intensity = (audioData && typeof audioData.intensity === 'number') ? audioData.intensity : 0.5;
  const energy = (audioData && audioData.energy) !== undefined ? audioData.energy : 0;

  const isReveal = time >= this.REVEAL_START && time < this.CONVEYOR_START;
  const isConveyor = time >= this.CONVEYOR_START;
  const featuredIndex = isReveal
    ? Math.floor((time - this.REVEAL_START) / 5) % 12
    : -1;
  const scrollOffset = isConveyor ? (time - this.CONVEYOR_START) * this.CONVEYOR_SPEED : 0;

  const cameraScale = isConveyor ? 0.98 : 1;
  const cameraAngle = ((mode - 1.5) * 0.018 + (intensity - 0.5) * 0.04) * cameraScale;
  const cameraZoom = (0.96 + intensity * 0.08) * cameraScale;
  const panX = (energy - 0.5) * w * 0.02;
  const panY = (intensity - 0.5) * h * 0.015;

  p.push();
  p.translate(w / 2, h / 2);
  p.rotate(cameraAngle);
  p.scale(cameraZoom);
  p.translate(panX, panY);
  p.translate(-w / 2, -h / 2);

  if (isConveyor) {
    this.drawConveyor(p, audioData, ctx, cw, ch, scrollOffset, w, h);
  } else {
    this.drawGrid(p, audioData, ctx, cw, ch, isReveal, featuredIndex);
  }

  p.pop();
};

VisualEngine.prototype.drawGrid = function (p, audioData, ctx, cw, ch, isReveal, featuredIndex) {
  const mode = (audioData && typeof audioData.mode === 'number') ? audioData.mode : 0;
  const intensity = (audioData && typeof audioData.intensity === 'number') ? audioData.intensity : 0.5;
  for (let i = 0; i < this.systems.length; i++) {
    const sys = this.systems[i];
    sys.update(audioData);
    const col = i % this.cols;
    const row = Math.floor(i / this.cols);
    const x = col * cw;
    const y = row * ch;
    let scale = 1;
    if (isReveal && featuredIndex >= 0 && i === featuredIndex) {
      scale = 1.06;
    }
    const cellTilt = (col - 1.5) * 0.012 + (row - 1) * 0.008 + (mode - 1) * 0.01 + (intensity - 0.5) * 0.02;
    p.push();
    p.translate(x, y);
    p.translate(cw / 2, ch / 2);
    p.scale(scale);
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
};

VisualEngine.prototype.drawConveyor = function (p, audioData, ctx, cw, ch, scrollOffset, w, h) {
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const radiusX = w * 0.48;
  const radiusY = h * 0.38;
  const angleStep = (Math.PI * 2) / 12;

  for (let i = 0; i < this.systems.length; i++) {
    const sys = this.systems[i];
    sys.update(audioData);
    const angle = (i - scrollOffset) * angleStep;
    const depth = Math.cos(angle);
    const scale = 0.62 + 0.38 * (depth * 0.5 + 0.5);
    const alpha = 0.55 + 0.45 * (depth * 0.5 + 0.5);
    const px = centerX + Math.cos(angle) * radiusX;
    const py = centerY + Math.sin(angle) * radiusY * 0.85;

    p.push();
    p.translate(px, py);
    p.rotate(angle);
    p.scale(scale);
    p.translate(-cw / 2, -ch / 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.clip();
    sys.draw(p, 0, 0, cw, ch);
    ctx.restore();
    p.pop();
  }
};
