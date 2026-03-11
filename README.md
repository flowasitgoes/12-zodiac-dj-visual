# 12 Zodiac Music Visualizer

Generative music visual art system: 12 panels (Chinese Zodiac) driven by real-time audio analysis.

## Tech Stack

- **Server**: Node.js, Express, WebSocket, Meyda, node-wav
- **Client**: p5.js, canvas

## Setup

```bash
npm install
```

Add at least one `.wav` file to `server/audio/` (or project root `audio/`).

```bash
npm start
```

Open http://localhost:3000. Choose a WAV from the dropdown and click **播放**. The server will analyze the audio and stream features over WebSocket; the 12 panels will animate with the music.

## Layout (3×4 grid)

| Rat    | Ox     | Tiger  | Rabbit |
| Dragon | Snake  | Horse  | Goat   |
| Monkey | Rooster| Dog    | Pig    |

## Controls

- **播放**: Start playback and server-side analysis (loads first WAV if none selected).
- **暫停**: Pause audio and stop analysis stream.

## Project Structure

- `server/index.js` – Express, static, `/audio` routes, WebSocket attach
- `server/audioAnalyzer.js` – WAV load, Meyda per-frame extraction, bass/treble/beat
- `server/websocket.js` – WS server, broadcast, start/pause from client
- `client/index.html` – UI, p5, script order
- `client/sketch.js` – Canvas, WS, default audio data, visual engine
- `client/visualEngine.js` – 3×4 grid, 12 zodiac systems
- `client/zodiac/*.js` – One class per animal: `update(audioData)`, `draw(p, x, y, w, h)`
- `shared/audioDataSchema.js` – Default shape for audio data (time, energy, bass, treble, centroid, spread, beat)

## Audio Data (WebSocket payload)

```json
{
  "time": 12.4,
  "energy": 0.72,
  "bass": 0.41,
  "treble": 0.65,
  "centroid": 2200,
  "spread": 150,
  "flatness": 0.2,
  "beat": true
}
```

MIT

## Deploy (Vercel)

專案已放在 **repo 根目錄**（沒有 `music-zodiac-visualizer` 子資料夾）。

在 Vercel 請確認：
1. **Settings → General → Root Directory** 設為 **空白** 或 **`.`**（使用 repo 根目錄）。
2. 若之前曾設成 `music-zodiac-visualizer`，請改掉並重新 deploy，否則會找不到 `server/index.js`。
