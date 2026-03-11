/**
 * p5.js sketch: canvas, WebSocket, audio element, visual engine.
 * currentAudioData: from WebSocket (WAV) or from client-side AnalyserNode (MP3).
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
    const sel = document.getElementById('audio-select');
    const file = sel && sel.value;
    if (isMp3(file) && audioEl && !audioEl.paused && !audioEl.ended) {
      updateMp3AudioData();
    }
    const data = window.currentAudioData || defaultAudioData();
    background(10, 10, 15);
    if (visualEngine) visualEngine.draw(this, data);
  };

  window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
    if (visualEngine) visualEngine.resize(windowWidth, windowHeight);
  };
})();
