/**
 * 將遊戲所需檔案複製到 www/ 資料夾，供 itch.io 上傳使用。
 * 僅複製檔案，不修改任何原始碼。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

function rmDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((f) => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) rmDirRecursive(p);
    else fs.unlinkSync(p);
  });
  fs.rmdirSync(dir);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((name) => {
      copyRecursive(path.join(src, name), path.join(dest, name));
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// 清空並建立 www
if (fs.existsSync(WWW)) rmDirRecursive(WWW);
fs.mkdirSync(WWW, { recursive: true });

// 1. client/index.html -> www/index.html
copyRecursive(path.join(ROOT, 'client', 'index.html'), path.join(WWW, 'index.html'));

// 2. public/ -> www/public/
copyRecursive(path.join(ROOT, 'public'), path.join(WWW, 'public'));

// 3. client 的 JS、zodiac、about-lang.json -> www/
const clientDir = path.join(ROOT, 'client');
['visualEngine.js', 'sketch.js', 'about-lang.json'].forEach((name) => {
  const src = path.join(clientDir, name);
  if (fs.existsSync(src)) copyRecursive(src, path.join(WWW, name));
});
copyRecursive(path.join(clientDir, 'zodiac'), path.join(WWW, 'zodiac'));

console.log('www/ 已建好，可上傳到 itch.io。');
console.log('內容：index.html、public/、zodiac/、visualEngine.js、sketch.js、about-lang.json');
