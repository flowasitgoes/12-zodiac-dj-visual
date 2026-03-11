/**
 * Visual Engine: 3x4 grid, 12 zodiac systems. Each system has update(audioData) and draw(p, x, y, w, h).
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
  for (let i = 0; i < this.systems.length; i++) {
    const sys = this.systems[i];
    sys.update(audioData);
    const col = i % this.cols;
    const row = Math.floor(i / this.cols);
    const x = col * cw;
    const y = row * ch;
    p.push();
    p.translate(x, y);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.clip();
    sys.draw(p, 0, 0, cw, ch);
    ctx.restore();
    p.pop();
  }
};
