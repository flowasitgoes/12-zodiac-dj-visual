/**
 * Visual Engine: 3x4 grid, 12 zodiac systems.
 * 約 1:00 後：圓環流轉，每 10 秒全部 jump、其間兩兩 jump（3 秒後其餘跟上）。
 * 4:00 後：停止 3D 走動與輪轉，維持最後一幀的圓環靜態畫面。
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
  this.REVEAL_START = 30;
  this.REVEAL_DURATION = 30;
  this.CONVEYOR_START = 60;
  this.CONVEYOR_DURATION = 60;
  this.CONVEYOR_END = 240;
  this.CONVEYOR_SPEED = 0.35;
  this.JUMP_START = this.CONVEYOR_START + this.CONVEYOR_DURATION;
  this.JUMP_FULL_INTERVAL = 10;
  this.JUMP_DURATION_FULL = 2.5;
  this.JUMP_DURATION_PAIR = 3.0;
  this.currentOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  this.jumpScrollOffset = (this.JUMP_START - this.CONVEYOR_START) * this.CONVEYOR_SPEED;
  this.jumpPhaseStart = null;
  this.jumpFromOrder = null;
  this.jumpToOrder = null;
  this.jumpDuration = 2.5;
  this.appliedOrderPhase = null;
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
  const isConveyorActive = time >= this.CONVEYOR_START && time < this.CONVEYOR_END;
  const isConveyorFrozen = time >= this.CONVEYOR_END;
  const tFromStart = time - this.JUMP_START;
  let jumpPhaseStart = 0;
  let phaseDuration = this.JUMP_DURATION_FULL;
  let isFullSwapStep = false;
  let stepIndex = -1;
  if (isConveyorActive && tFromStart >= 0) {
    const block = Math.floor(tFromStart / this.JUMP_FULL_INTERVAL);
    const tInBlock = tFromStart - block * this.JUMP_FULL_INTERVAL;
    const stepStarts = [0, 3, 6];
    const stepDurations = [this.JUMP_DURATION_FULL, this.JUMP_DURATION_PAIR, this.JUMP_DURATION_PAIR];
    const stepsCount = stepStarts.length;
    stepIndex = 0;
    while (stepIndex < stepsCount && tInBlock >= stepStarts[stepIndex] + stepDurations[stepIndex]) stepIndex++;
    if (stepIndex < stepsCount) {
      jumpPhaseStart = this.JUMP_START + block * this.JUMP_FULL_INTERVAL + stepStarts[stepIndex];
      phaseDuration = stepDurations[stepIndex];
      isFullSwapStep = (stepIndex === 0);
    } else {
      stepIndex = -1;
    }
  }
  const isJump = isConveyorActive && stepIndex >= 0 && time >= jumpPhaseStart && time < jumpPhaseStart + phaseDuration;
  const isConveyorAfterJump = time >= this.JUMP_START && time < this.CONVEYOR_END;
  const featuredIndex = isReveal
    ? Math.floor((time - this.REVEAL_START) / 5) % 12
    : -1;
  const scrollOffset = (time >= this.CONVEYOR_START && time < this.CONVEYOR_END)
    ? (time - this.CONVEYOR_START) * this.CONVEYOR_SPEED
    : (time >= this.CONVEYOR_END ? (this.CONVEYOR_END - this.CONVEYOR_START) * this.CONVEYOR_SPEED : 0);

  if (isJump) {
    if (this.jumpPhaseStart !== jumpPhaseStart) {
      if (this.jumpPhaseStart != null && time >= this.jumpPhaseStart + this.jumpDuration) {
        this.currentOrder = (this.jumpToOrder || this.currentOrder).slice();
      }
      this.jumpPhaseStart = jumpPhaseStart;
      this.jumpFromOrder = this.currentOrder.slice();
      if (isFullSwapStep) {
        this.jumpToOrder = shuffleArray(this.currentOrder.slice());
      } else {
        this.jumpToOrder = this.currentOrder.slice();
        const i = Math.floor(Math.random() * 12);
        let j = Math.floor(Math.random() * 12);
        while (j === i) j = Math.floor(Math.random() * 12);
        const t = this.jumpToOrder[i];
        this.jumpToOrder[i] = this.jumpToOrder[j];
        this.jumpToOrder[j] = t;
      }
      this.jumpDuration = phaseDuration;
    }
  } else if (stepIndex >= 0 && this.jumpPhaseStart != null && time >= this.jumpPhaseStart + this.jumpDuration && this.appliedOrderPhase !== this.jumpPhaseStart) {
    this.currentOrder = (this.jumpToOrder || this.currentOrder).slice();
    this.appliedOrderPhase = this.jumpPhaseStart;
  }

  const cameraScale = (isConveyorAfterJump || isConveyorFrozen) ? 0.98 : 1;
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

  if (isJump) {
    this.drawConveyorJump(p, audioData, ctx, cw, ch, w, h, time);
  } else if (isConveyorAfterJump || isConveyorFrozen) {
    this.drawConveyor(p, audioData, ctx, cw, ch, scrollOffset, w, h, this.currentOrder);
  } else {
    this.drawGrid(p, audioData, ctx, cw, ch, isReveal, featuredIndex);
  }

  p.pop();
};

function randomPermutation(n) {
  const a = [];
  for (let i = 0; i < n; i++) a[i] = i;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

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

VisualEngine.prototype.drawConveyor = function (p, audioData, ctx, cw, ch, scrollOffset, w, h, order) {
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const radiusX = w * 0.48;
  const radiusY = h * 0.38;
  const angleStep = (Math.PI * 2) / 12;

  for (let i = 0; i < this.systems.length; i++) {
    const slotIndex = (order && order.length === 12) ? order[i] : i;
    const sys = this.systems[slotIndex];
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

VisualEngine.prototype.drawConveyorJump = function (p, audioData, ctx, cw, ch, w, h, time) {
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const radiusX = w * 0.48;
  const radiusY = h * 0.38;
  const angleStep = (Math.PI * 2) / 12;
  const scrollOffset = this.jumpScrollOffset;
  const phaseStart = this.jumpPhaseStart;
  const fromOrder = this.jumpFromOrder;
  const toOrder = this.jumpToOrder;
  if (!fromOrder || !toOrder || phaseStart == null) return;

  const duration = this.jumpDuration || 2.5;
  const t = Math.min(1, (time - phaseStart) / duration);
  const ease = 1 - Math.pow(1 - t, 2.2);
  const jumpY = 4 * (h * 0.08) * t * (1 - t);
  const jumpScale = 1 + 0.15 * 4 * t * (1 - t);

  for (let toSlot = 0; toSlot < this.systems.length; toSlot++) {
    const sysIndex = toOrder[toSlot];
    const fromSlot = fromOrder.indexOf(sysIndex);
    const sys = this.systems[sysIndex];
    sys.update(audioData);

    const fromAngle = (fromSlot - scrollOffset) * angleStep;
    const toAngle = (toSlot - scrollOffset) * angleStep;
    const angle = fromAngle + (toAngle - fromAngle) * ease;

    const isMoving = fromSlot !== toSlot;
    const moveScale = isMoving ? jumpScale : 1;
    const moveY = isMoving ? jumpY : 0;

    const depth = Math.cos(angle);
    const scale = (0.62 + 0.38 * (depth * 0.5 + 0.5)) * moveScale;
    const alpha = 0.55 + 0.45 * (depth * 0.5 + 0.5);
    const px = centerX + Math.cos(angle) * radiusX;
    const py = centerY + Math.sin(angle) * radiusY * 0.85 - moveY;

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
