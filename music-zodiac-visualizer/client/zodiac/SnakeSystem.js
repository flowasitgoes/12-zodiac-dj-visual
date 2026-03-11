/**
 * Snake: wave motion, bass/treble modulate wavelength and amplitude.
 * mode 來自歌曲起伏：calm=少波/淡, build=變密, peak=波多/亮, release=漸少.
 */
function SnakeSystem() {
  this.phase = 0;
  this.waves = 5;
}

SnakeSystem.prototype.update = function (a) {
  const bass = (a && a.bass) !== undefined ? a.bass : 0;
  const treble = (a && a.treble) !== undefined ? a.treble : 0;
  const mode = (a && typeof a.mode === 'number') ? a.mode : 0;
  const intensity = (a && typeof a.intensity === 'number') ? a.intensity : 0.5;
  this.waves = mode === 0 ? 2 : mode === 1 ? 4 : mode === 2 ? 7 : 3;
  const phaseSpeed = 0.02 + bass * 0.03 + intensity * 0.025;
  this.phase += phaseSpeed;
  this.amp = (0.08 + bass * 0.12) * (0.5 + intensity * 0.8);
  this.freq = (3 + treble * 5) * (mode === 2 ? 1.25 : 1);
  this._mode = mode;
};

SnakeSystem.prototype.draw = function (p, x, y, w, h) {
  p.noFill();
  const mode = this._mode !== undefined ? this._mode : 0;
  const g = mode === 2 ? 220 : mode === 0 ? 140 : 180;
  const b = mode === 2 ? 200 : 120;
  p.stroke(100, g, b);
  p.strokeWeight(mode === 2 ? 3 : mode === 0 ? 1.5 : 2);
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
