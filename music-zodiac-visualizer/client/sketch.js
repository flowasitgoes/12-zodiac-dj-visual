/**
 * p5.js sketch: canvas, WebSocket, audio element, visual engine.
 * currentAudioData: from WebSocket (WAV) or from client-side AnalyserNode (MP3).
 * Visual "mode" and "intensity" are derived from SONG dynamics (energy trend, beat density), not fixed time.
 */
(function () {
  const WS_URL = 'ws://' + (location.host || 'localhost:3000');
  let socket;
  let visualEngine;
  let audioEl;
  let audioCtx = null;
  let analyserNode = null;
  let sourceNode = null;
  let lastMp3Energy = 0;
  let lastMp3Flux = 0;

  // —— 依「歌曲起伏」算 mode / intensity（不用固定時間）——
  const ENERGY_HISTORY_LEN = 90;  // ~1.5 sec @ 60fps
  const energyHistory = [];
  const beatFrames = [];          // 記錄發生 beat 的 frame 編號，用來算近期密度
  let smoothedEnergy = 0;
  let currentMode = 0;   // 0=calm, 1=build, 2=peak, 3=release
  let modeHoldUntil = 0; // frame count: 不隨便切 mode，避免閃爍

  const defaultAudioData = () => ({
    time: 0,
    energy: 0,
    bass: 0,
    treble: 0,
    centroid: 0,
    spread: 0,
    flatness: 0,
    beat: false
  });
  window.currentAudioData = defaultAudioData();

  function computeMusicState(raw, frameCount) {
    const e = (raw && raw.energy) !== undefined ? raw.energy : 0;
    const beat = !!(raw && raw.beat);

    energyHistory.push(e);
    if (energyHistory.length > ENERGY_HISTORY_LEN) energyHistory.shift();
    const alpha = 0.12;
    smoothedEnergy = smoothedEnergy * (1 - alpha) + e * alpha;

    if (beat) beatFrames.push(frameCount);
    const BEAT_WINDOW = 90;
    while (beatFrames.length && frameCount - beatFrames[0] > BEAT_WINDOW) beatFrames.shift();
    const beatDensity = Math.min(1, beatFrames.length / 12);

    const recentFrames = Math.min(60, energyHistory.length);
    const recent = energyHistory.slice(-recentFrames);
    const avg = recent.length ? recent.reduce(function (a, b) { return a + b; }, 0) / recent.length : e;
    const trend = e - avg;
    const energyRising = trend > 0.03;
    const energyFalling = trend < -0.03;
    const isHigh = smoothedEnergy > 0.45 || e > 0.55 || beatDensity > 0.6;
    const isLow = smoothedEnergy < 0.2 && e < 0.3;

    if (frameCount > modeHoldUntil) {
      if (isHigh && (currentMode === 1 || currentMode === 0)) {
        currentMode = 2;
        modeHoldUntil = frameCount + 25;
      } else if (energyRising && !isHigh && (currentMode === 0 || currentMode === 3)) {
        currentMode = 1;
        modeHoldUntil = frameCount + 15;
      } else if (energyFalling && currentMode === 2) {
        currentMode = 3;
        modeHoldUntil = frameCount + 30;
      } else if (isLow && (currentMode === 3 || currentMode === 1)) {
        currentMode = 0;
        modeHoldUntil = frameCount + 20;
      }
    }

    const intensity = Math.min(1, smoothedEnergy * 1.2);
    return {
      mode: currentMode,
      intensity,
      energyRising,
      energyFalling,
      beatDensity,
      smoothedEnergy
    };
  }

  function connectWS() {
    if (socket && socket.readyState === 1) return;
    socket = new WebSocket(WS_URL);
    socket.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);
        if (data && typeof data.time === 'number') window.currentAudioData = data;
      } catch (_) {}
    };
    socket.onclose = function () {
      setTimeout(connectWS, 2000);
    };
  }

  function sendStart(file) {
    if (socket && socket.readyState === 1) socket.send(JSON.stringify({ type: 'start', file: file || null }));
  }
  function sendPause() {
    if (socket && socket.readyState === 1) socket.send(JSON.stringify({ type: 'pause' }));
  }

  function isMp3(filename) {
    return filename && filename.toLowerCase().endsWith('.mp3');
  }

  let localFileObjectUrl = null;

  function isUsingLocalFile() {
    return audioEl && audioEl.src && audioEl.src.indexOf('blob:') === 0;
  }

  function setupMp3Analysis() {
    if (analyserNode && sourceNode) return;
    if (!audioEl) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.6;
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      sourceNode.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);
    } catch (e) {
      console.warn('MP3 analysis setup failed', e);
    }
  }

  function updateMp3AudioData() {
    if (!analyserNode || !audioEl || audioEl.paused || audioEl.ended) return false;
    const freq = new Float32Array(analyserNode.frequencyBinCount);
    const timeData = new Uint8Array(analyserNode.fftSize);
    analyserNode.getFloatFrequencyData(freq);
    analyserNode.getByteTimeDomainData(timeData);

    let rms = 0;
    for (let i = 0; i < timeData.length; i++) {
      const n = (timeData[i] - 128) / 128;
      rms += n * n;
    }
    rms = Math.sqrt(rms / timeData.length);
    const energy = Math.min(1, rms * 4);

    const sampleRate = audioCtx ? audioCtx.sampleRate : 44100;
    const nyquist = sampleRate / 2;
    const binFreq = nyquist / freq.length;
    let bass = 0, treble = 0, sum = 0, centroidSum = 0, centroidWeight = 0, spreadSum = 0, flatnessSum = 0;
    const len = freq.length;
    for (let i = 0; i < len; i++) {
      const magnitude = Math.pow(10, freq[i] / 20);
      const hz = i * binFreq;
      sum += magnitude;
      if (hz < 200) bass += magnitude;
      else if (hz > 4000) treble += magnitude;
      centroidSum += hz * magnitude;
      centroidWeight += magnitude;
    }
    const centroid = centroidWeight > 0 ? centroidSum / centroidWeight : 0;
    for (let i = 0; i < len; i++) {
      const magnitude = Math.pow(10, freq[i] / 20);
      const hz = i * binFreq;
      spreadSum += Math.pow(hz - centroid, 2) * magnitude;
      if (magnitude > 1e-10) flatnessSum += Math.log(magnitude + 1e-10);
    }
    const spread = centroidWeight > 0 ? Math.sqrt(spreadSum / centroidWeight) : 0;
    const flatness = len > 0 && sum > 0
      ? Math.exp(flatnessSum / len) / (sum / len + 1e-10)
      : 0;
    bass = sum > 0 ? Math.min(1, (bass / sum) * 4) : 0;
    treble = sum > 0 ? Math.min(1, (treble / sum) * 4) : 0;

    const flux = Math.abs(energy - lastMp3Energy);
    const beat = flux > lastMp3Flux * 1.4 && flux > 0.08;
    lastMp3Flux = flux;
    lastMp3Energy = energy;

    window.currentAudioData = {
      time: audioEl.currentTime,
      energy,
      bass,
      treble,
      centroid,
      spread,
      flatness: Math.min(1, flatness),
      beat
    };
    return true;
  }

  let frameCount = 0;

  window.setup = function () {
    const cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('canvas-container');
    frameRate(60);
    connectWS();
    visualEngine = new VisualEngine();
    audioEl = document.createElement('audio');
    document.body.appendChild(audioEl);

    document.getElementById('btn-play').onclick = function () {
      const sel = document.getElementById('audio-select');
      const file = sel && sel.value;
      if (file) {
        if (localFileObjectUrl) {
          URL.revokeObjectURL(localFileObjectUrl);
          localFileObjectUrl = null;
        }
        var nameEl = document.getElementById('local-file-name');
        if (nameEl) nameEl.textContent = '';
        energyHistory.length = 0;
        beatFrames.length = 0;
        smoothedEnergy = 0;
        currentMode = 0;
        modeHoldUntil = 0;
        audioEl.src = '/audio/' + encodeURIComponent(file);
        if (isMp3(file)) {
          setupMp3Analysis();
          lastMp3Energy = 0;
          lastMp3Flux = 0;
          sendPause();
        } else {
          sendStart(file);
        }
        audioEl.play().catch(function () {});
      }
    };
    document.getElementById('btn-pause').onclick = function () {
      audioEl.pause();
      sendPause();
    };

    document.getElementById('audio-file-input').onchange = function () {
      var input = this;
      var file = input.files && input.files[0];
      if (!file) return;
      if (localFileObjectUrl) {
        URL.revokeObjectURL(localFileObjectUrl);
        localFileObjectUrl = null;
      }
      localFileObjectUrl = URL.createObjectURL(file);
      energyHistory.length = 0;
      beatFrames.length = 0;
      smoothedEnergy = 0;
      currentMode = 0;
      modeHoldUntil = 0;
      audioEl.src = localFileObjectUrl;
      setupMp3Analysis();
      lastMp3Energy = 0;
      lastMp3Flux = 0;
      sendPause();
      var sel = document.getElementById('audio-select');
      if (sel) sel.value = '';
      var nameEl = document.getElementById('local-file-name');
      if (nameEl) nameEl.textContent = file.name;
      audioEl.play().catch(function () {});
      input.value = '';
    };

    fetch('/audio')
      .then(function (r) { return r.json(); })
      .then(function (list) {
        const sel = document.getElementById('audio-select');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- 選擇音檔 --</option>';
        (list || []).forEach(function (f) {
          const opt = document.createElement('option');
          opt.value = f.name;
          opt.textContent = f.name;
          sel.appendChild(opt);
        });
        const defaultName = 'Amor Satyr - Cortex.mp3';
        if (Array.isArray(list) && list.some(function (f) { return f.name === defaultName; })) {
          sel.value = defaultName;
        }
      })
      .catch(function () {});
  };

  window.draw = function () {
    frameCount++;
    const sel = document.getElementById('audio-select');
    const file = sel && sel.value;
    if (isUsingLocalFile() && audioEl && !audioEl.paused && !audioEl.ended) {
      updateMp3AudioData();
    } else if (file && isMp3(file) && audioEl && !audioEl.paused && !audioEl.ended) {
      updateMp3AudioData();
    }
    const raw = window.currentAudioData || defaultAudioData();
    const musicState = computeMusicState(raw, frameCount);
    const data = {
      ...raw,
      mode: musicState.mode,
      intensity: musicState.intensity,
      energyRising: musicState.energyRising,
      energyFalling: musicState.energyFalling,
      beatDensity: musicState.beatDensity,
      smoothedEnergy: musicState.smoothedEnergy
    };
    background(10, 10, 15);
    if (visualEngine) visualEngine.draw(this, data);
  };

  window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
    if (visualEngine) visualEngine.resize(windowWidth, windowHeight);
  };
})();
