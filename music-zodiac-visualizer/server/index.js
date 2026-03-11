/**
 * Express server + static files + audio routes.
 * WebSocket is attached to the same HTTP server in websocket.js.
 */
const path = require('path');
const express = require('express');
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Static: serve client folder at /
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// Static: serve public folder at /public (MP3 etc.)
const publicPath = path.join(__dirname, '..', 'public');
app.use('/public', express.static(publicPath));

// Audio directory (WAV files): server/audio or project root audio/
const audioDir = path.join(__dirname, 'audio');
const audioDirRoot = path.join(__dirname, '..', 'audio');

function getPublicDir() {
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isDirectory()) return publicPath;
  return null;
}

function getAudioDir() {
  if (fs.existsSync(audioDir) && fs.statSync(audioDir).isDirectory()) return audioDir;
  if (fs.existsSync(audioDirRoot) && fs.statSync(audioDirRoot).isDirectory()) return audioDirRoot;
  return null;
}

// GET /audio -> list .wav (from audio dirs) + .mp3 (from public)
app.get('/audio', (req, res) => {
  const list = [];
  try {
    const wavDir = getAudioDir();
    if (wavDir) {
      fs.readdirSync(wavDir)
        .filter(f => f.toLowerCase().endsWith('.wav'))
        .forEach(f => list.push({ name: f }));
    }
    const pubDir = getPublicDir();
    if (pubDir) {
      fs.readdirSync(pubDir)
        .filter(f => f.toLowerCase().endsWith('.mp3'))
        .forEach(f => list.push({ name: f }));
    }
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /audio/:filename -> stream WAV (from audio dirs) or MP3 (from public)
app.get('/audio/:filename', (req, res) => {
  const name = path.basename(req.params.filename);
  const lower = name.toLowerCase();
  if (lower.endsWith('.wav')) {
    const dir = getAudioDir();
    if (!dir) return res.status(404).send('No audio directory');
    const filePath = path.join(dir, name);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).send('File not found');
    }
    return res.sendFile(filePath);
  }
  if (lower.endsWith('.mp3')) {
    const dir = getPublicDir();
    if (!dir) return res.status(404).send('No public directory');
    const filePath = path.join(dir, name);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).send('File not found');
    }
    return res.sendFile(filePath);
  }
  return res.status(400).send('Only .wav or .mp3 files');
});

// Create HTTP server (WebSocket will attach to it)
const server = http.createServer(app);

// Attach WebSocket and wire audio analyzer to broadcast
require('./websocket')(server);
const ws = require('./websocket');
const audioAnalyzer = require('./audioAnalyzer');
ws.setBroadcastControl((cmd, file) => {
  if (cmd === 'start') {
    const dir = getAudioDir();
    const list = dir ? fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.wav')) : [];
    const name = (file && list.includes(file)) ? file : list[0];
    if (name) {
      audioAnalyzer.load(name);
      audioAnalyzer.startPlayback((data) => ws.broadcast(data));
    }
  } else if (cmd === 'pause') {
    audioAnalyzer.stopPlayback();
  }
});

server.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
  const ad = getAudioDir();
  console.log(`Audio dir: ${ad || '(none - add server/audio or audio/ with .wav files)'}`);
});