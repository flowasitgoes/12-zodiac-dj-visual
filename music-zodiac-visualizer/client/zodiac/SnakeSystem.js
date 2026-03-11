/**
 * Snake: wave motion, bass/treble modulate wavelength and amplitude.
 */
function SnakeSystem() {
  this.phase = 0;
  this.waves = 5;
}

SnakeSystem.prototype.update = function (a) {
  const bass = (a && a.bass) !== undefined ? a.bass : 0;
  const treble = (a && a.treble) !== undefined ? a.treble : 0;
  this.phase += 0.02 + bass * 0.03;
  this.amp = 0.08 + bass * 0.12;
  this.freq = 3 + treble * 5;
};

SnakeSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  p.stroke(100, 200, 120);
  p.strokeWeight(2);
  const amp = (this.amp || 0.1) * h;
  const freq = this.freq || 4;
  for (let wave = 0; wave < this.waves; wave++) {
    p.beginShape();
    for (let i = 0; i <= 50; i++) {
      const nx = i / 50;
      const ny = 0.5 + Math.sin(nx * Math.PI * freq + this.phase + wave * 0.5) * (amp / h);
      p.vertex(x + nx * w, y + ny * h);
    }
    p.endShape();
  }
};
