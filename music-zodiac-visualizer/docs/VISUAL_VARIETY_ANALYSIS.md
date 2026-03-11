# 音樂視覺化「變化不足」分析與改動說明

## 一、現有 codebase 掃描結果

### 1. 資料流

- **sketch.js**：從 WebSocket（WAV）或 client 端 AnalyserNode（MP3）取得 `currentAudioData`，內含 `time, energy, bass, treble, centroid, spread, flatness, beat`，每 frame 傳給 `visualEngine.draw(p, data)`。
- **visualEngine.js**：固定 3×4 格，依序對 12 個生肖呼叫 `sys.update(audioData)` → `sys.draw(p, 0, 0, cw, ch)`。**沒有**全域的段落、強度或 mode 切換。
- **client/zodiac/*.js**：每個生肖只根據「當下這一格」的 audio 數值做即時反應，**沒有任何一個**使用 `time` 或「樂段／段落」概念。

### 2. 各生肖目前行為（簡要）

| 生肖 | 驅動來源 | 是否有「段落／時間」 | 備註 |
|------|----------|----------------------|------|
| Rat | beat, energy | ❌ | 粒子生成與 decay 固定 |
| Ox | bass | ❌ | 純即時 size/offset/angle |
| Tiger | beat, energy | ❌ | 線條生成與 decay 固定 |
| Rabbit | centroid, treble | ❌ | phase 固定 +0.02，與歌曲時間無關 |
| Dragon | spread | ❌ | 飄動與 blob 大小即時映射 |
| Snake | bass, treble | ❌ | phase 只隨 bass 微調，無段落 |
| Horse | energy | ❌ | phase 固定增量，無段落 |
| Goat | centroid | ❌ | 每 frame 重畫同結構，僅 depth/angle 變 |
| Monkey | beat | ❌ | 形狀生成與 decay 固定 |
| Rooster | beat, energy + random | ❌ | 尖刺生成與 decay 固定 |
| Dog | bass, centroid | ❌ | 軌道速度與半徑即時映射 |
| Pig | energy | ❌ | 膨脹 + 隨機飄移，無段落 |

結論：**整首歌從頭到尾都是「同一套即時反應」在重複，沒有「隨時間／樂段」的節奏感或層次變化。**

---

## 二、業界常見做法（搜尋整理）

- **Section-based structure**：把一首歌切成多個段落（例如 16–30 秒一段），不同段落用不同視覺參數（顏色、密度、節奏、形狀），避免從頭到尾同一個 loop。
- **State machine / 模式切換**：用 FFT 的 bass/treble/energy 或 beat 觸發「狀態切換」（例如 calm → build → peak → release），或依時間切換 mode。
- **Dynamic parameter modulation**：不只「音量→大小」，還用音色、頻譜分佈、時間位置一起調變參數（顏色、形狀、速度、密度）。
- **Progressive reveal / 層次**：隨歌曲進行逐步解鎖或加強某些視覺層（例如 verse 只顯示部分元素，chorus 全開）。
- **Time + energy 結合**：用 `time`（播放位置）決定「現在是哪一段」，用 `energy`/beat 決定「這段裡多激烈」，兩者一起驅動視覺。

---

## 三、我們缺了什麼（對照結論）

1. **沒有「段落感」**：沒有使用 `time` 做 section / phase，所以 0:30 和 3:00 行為完全一樣。
2. **沒有 state / mode 切換**：沒有 intro / verse / chorus / drop 等概念，也沒有「強度等級」的切換。
3. **參數範圍偏窄**：例如 Rabbit、Snake 的 phase 增量幾乎固定，變化小；多數生肖的係數範圍也偏保守。
4. **只綁「即時特徵」**：只依賴當下 frame 的 energy/bass/beat，沒有「累積」「歷史」或「段落進度」。
5. **12 格永遠平等**：沒有「某一格在某一節特別突出」或「全域強度」來製造層次。

---

## 四、已實作的改動（第一階段）

### 1. 在 sketch.js 加入「段落 + 強度」meta

- 用 `time` 切出 **4 個段落**，每段 **20 秒**：`section = floor(time / 20) % 4`。
- 段落內進度：`sectionProgress = (time % 20) / 20`（0→1）。
- 段落內強度曲線：`intensity = 0.5 + 0.5 * sin(sectionProgress * π)`，在每段內從 0.5 升到 1 再降回 0.5，形成 build → peak → release。
- 傳給 `visualEngine.draw` 的 `data` 現在多三個欄位：**section**、**sectionProgress**、**intensity**。

### 2. 三個生肖改為「段落 + 強度」驅動（示範）

- **RatSystem.js**
  - 用 `section` 提高速度與 spawn 門檻（section 2 更激烈）、用 `intensity` 調 decay 與速度。
  - 依 `section` 做顏色偏移與粒子大小（section 2 時粒子略大、色偏）。
- **SnakeSystem.js**
  - 用 `section` 改變波數：section 0→1→2→3 對應 3 / 5 / 7 / 4 條波，並調 phase 速度、amp、freq。
  - 用 `section` 改變線條顏色與粗細（peak 段更粗、更亮）。
- **TigerSystem.js**
  - 用 `section`、`intensity` 調線條長度範圍與 decay 速度，讓 build/peak/release 有明顯差異。

其餘生肖仍只吃既有 `audioData`，若傳入 `section`/`sectionProgress`/`intensity` 也會被忽略，不影響行為。

---

## 五、後續可擴充方向

- **段落長度可調**：例如依 BPM 或手動設定 `sectionDuration`（目前固定 20 秒）。
- **更多生肖吃 section/intensity**：Ox、Dragon、Horse、Rooster 等可依段落改 scale、顏色、密度、速度。
- **全域「mode」**：例如用 energy 歷史或 beat 計數在「calm / build / peak / release」間切換，再讓每個生肖讀取 mode 而非只讀 section。
- **單格強調**：例如依 `section` 或 `sectionProgress` 讓某一格（如 section % 12）暫時放大或加強對比，製造焦點。
- **參數範圍放寬**：在現有公式中把係數範圍拉大，並用 `intensity` 或 `section` 做非線性縮放，讓同一首歌內變化更明顯。

---

## 六、要改的檔案一覽

| 檔案 | 改動內容 |
|------|----------|
| `client/sketch.js` | 依 `time` 計算 `section`、`sectionProgress`、`intensity`，併入傳給 `visualEngine.draw` 的 data |
| `client/zodiac/RatSystem.js` | 使用 section / intensity 調速度、spawn、decay、顏色、粒子大小 |
| `client/zodiac/SnakeSystem.js` | 使用 section 改波數、phase/amp/freq、線條顏色與粗細 |
| `client/zodiac/TigerSystem.js` | 使用 section / intensity 調線條長度與 decay |

重新整理頁面後，同一首歌播放時應能感受到約每 20 秒一輪的「段落感」以及段內的 build/peak/release，視覺不會再是單一 loop 無限重複。
