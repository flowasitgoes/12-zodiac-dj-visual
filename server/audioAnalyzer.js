/**
 * Load WAV, run Meyda per 512-sample frame, derive bass/treble/beat.
 * Streams audio data via WebSocket when playback is running.
 */
const fs = require('fs');
const path = require('path');
const wav = require('node-wav');
const Meyda = require('meyda');

const BUFFER_SIZE = 512;
let pcmBuffer = null;
let sampleRate = 44100;
let frameIndex = 0;
let playbackTimer = null;
let lastRms = 0;
let lastFlux = 0;

function getAudioDir() {
  const audioDir = path.join(__dirname, 'audio');
  const audioDirRoot = path.join(__dirname, '..', 'audio');
  if (fs.existsSync(audioDir) && fs.statSync(audioDir).isDirectory()) return audioDir;
  if (fs.existsSync(audioDirRoot) && fs.statSync(audioDirRoot).isDirectory()) return audioDirRoot;
  return null;
}

function load(filename) {
  const dir = getAudioDir();
  if (!dir) return { success: false, error: 'No audio directory' };
  const name = path.basename(filename);
  if (!name.toLowerCase().endsWith('.wav')) return { success: false, error: 'Only .wav files' };
  const filePath = path.join(dir, name);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return { success: false, error: 'File not found' };
  }
  try {
    const buffer = fs.readFileSync(filePath);
    const decoded = wav.decode(buffer);
    if (!decoded || !decoded.channelData || !decoded.channelData.length) {
      return { success: false, error: 'Invalid WAV' };
    }
    sampleRate = decoded.sampleRate || 44100;
    const ch0 = decoded.channelData[0];
    if (decoded.channelData.length === 1) {
      pcmBuffer = ch0;
    } else {
      const len = ch0.length;
      pcmBuffer = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        let s = 0;
        for (let c = 0; c < decoded.channelData.length; c++) {
          s += decoded.channelData[c][i];
        }
        pcmBuffer[i] = s / decoded.channelData.length;
      }
    }
    frameIndex = 0;
    lastRms = 0;
    lastFlux = 0;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function isLoaded() {
  return pcmBuffer != null && pcmBuffer.length >= BUFFER_SIZE;
}

function getTotalFrames() {
  if (!pcmBuffer) return 0;
  return Math.floor((pcmBuffer.length - BUFFER_SIZE) / BUFFER_SIZE) + 1;
}

function getDuration() {
  if (!pcmBuffer) return 0;
  return pcmBuffer.length / sampleRate;
}

/**
 * Extract one frame of features. Returns AudioData object or null if past end.
 */
function extractFrame() {
  if (!pcmBuffer || frameIndex * BUFFER_SIZE + BUFFER_SIZE > pcmBuffer.length) {
    return null;
  }
  const start = frameIndex * BUFFER_SIZE;
  const signal = pcmBuffer.slice(start, start + BUFFER_SIZE);

  Meyda.sampleRate = sampleRate;
  Meyda.bufferSize = BUFFER_SIZE;

  const rms = Meyda.extract('rms', signal);
  const energy = Math.min(1, (rms || 0) * 4);
  const centroid = Meyda.extract('spectralCentroid', signal) || 0;
  const spread = Meyda.extract('spectralSpread', signal) || 0;
  const flatness = Meyda.extract('spectralFlatness', signal) || 0;
  const flux = Meyda.extract('spectralFlux', signal) || 0;
  const spectrum = Meyda.extract('amplitudeSpectrum', signal);
  let bass = 0;
  let treble = 0;
  if (spectrum && spectrum.length) {
    const nyquist = sampleRate / 2;
    const binFreq = nyquist / spectrum.length;
    for (let i = 0; i < spectrum.length; i++) {
      const hz = i * binFreq;
      if (hz < 200) bass += spectrum[i];
      else if (hz > 4000) treble += spectrum[i];
    }
    const sum = spectrum.reduce((a, b) => a + b, 0) || 1;
    bass = Math.min(1, bass / sum * 4);
    treble = Math.min(1, treble / sum * 4);
  }

  let beat = false;
  if (flux > lastFlux * 1.4 && flux > 0.1) beat = true;
  lastFlux = flux;
  lastRms = rms || 0;

  const time = (frameIndex * BUFFER_SIZE) / sampleRate;
  frameIndex++;

  return {
    time,
    energy,
    bass,
    treble,
    centroid: centroid || 0,
    spread: spread || 0,
    flatness: flatness || 0,
    beat
  };
}

/**
 * Start real-time playback loop: every (512/sampleRate) seconds, extract frame and broadcast.
 */
function startPlayback(broadcastFn) {
  if (!broadcastFn || !isLoaded()) return;
  stopPlayback();
  const intervalMs = (BUFFER_SIZE / sampleRate) * 1000;
  playbackTimer = setInterval(() => {
    const data = extractFrame();
    if (data) broadcastFn(data);
    else stopPlayback();
  }, intervalMs);
}

function stopPlayback() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function seekToTime(t) {
  if (!pcmBuffer) return;
  frameIndex = Math.max(0, Math.floor((t * sampleRate) / BUFFER_SIZE));
}

module.exports = {
  load,
  isLoaded,
  getTotalFrames,
  getDuration,
  extractFrame,
  startPlayback,
  stopPlayback,
  seekToTime,
  getAudioDir,
  getSampleRate: () => sampleRate
};
