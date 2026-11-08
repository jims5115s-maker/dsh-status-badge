// Renders the settings sheet in isolation so its two-column geometry can be screenshotted.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '..', 'client.js'), 'utf8');

const start = src.indexOf('const CSS = [');
const end = src.indexOf('].join', start);
const body = src.slice(start, end);
const rules = [...body.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'")).join('\n');

const row = (label, on) =>
  `<button class="SBx9_opt"><span>${label}</span><span class="SBx9_sw" data-on="${on}"></span></button>`;
const title = (label) => `<div class="SBx9_sheetTitle" style="padding-top:6px">${label}</div>`;

const items = [
  title('設定'),
  row('顯示狀態文字', true),
  row('這輪結束時通知', true),
  title('視窗圖層'),
  '<select class="SBx9_select"><option>一般</option></select>',
  title('主題'),
  '<select class="SBx9_select"><option>終端綠</option></select>',
  row('鎖定視窗（不可拖動 + 滑鼠穿透）', false),
  title('透明度'),
  '<div class="SBx9_alphaRow"><input class="SBx9_alpha" type="range" value="100"><span class="SBx9_alphaVal">100%</span></div>',
  title('視窗內容'),
  row('目前工作與思考', true),
  row('程式碼流', true),
  row('硬體監控', true),
  title('程式碼流顯示量'),
  '<select class="SBx9_select"><option>全部（現在這個版本）</option></select>',
  title('程式碼流節奏'),
  '<select class="SBx9_select"><option>流暢（打字機動畫）</option></select>',
  title('硬體卡片'),
  row('CPU', true),
  row('記憶體', true),
  row('GPU', true),
  row('磁碟', true),
  row('餘額', true),
  '<div class="SBx9_sec"><span class="SBx9_seclabel">計費單價（¥ / 百萬 token）</span>'
    + '<div class="SBx9_numRow"><span class="SBx9_numLabel">輸入</span><input class="SBx9_num" value="2"></div>'
    + '<div class="SBx9_numRow"><span class="SBx9_numLabel">快取讀取</span><input class="SBx9_num" value="0.2"></div>'
    + '<div class="SBx9_numRow"><span class="SBx9_numLabel">輸出</span><input class="SBx9_num" value="3"></div>'
    + row('除錯記錄（寫入 .runtime/debug.log）', false)
    + row('重設用量基準（歸零）', false)
    + '</div>',
];

const rows = Math.ceil(items.length / 2);
const split = items.findIndex(
  (el) => typeof el === 'string' && el.includes('>硬體卡片<'),
);
const cut = split > 0 ? split : Math.ceil(items.length / 2);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
:root{--dsw-alias-bg-overlay:#1b1d22;--dsw-alias-bg-layer-2:#24262c;--dsw-alias-border-l2:#3a3d45;
--dsw-alias-label-primary:#e6e8ec;--dsw-alias-label-secondary:#a9adb8;--dsw-alias-label-tertiary:#767b87;
--dsw-alias-brand-primary:#4c8dff;--dsh-content-font-size-secondary:13px}
body{margin:0;background:#111318;font-family:"Segoe UI",system-ui,sans-serif;padding:24px}
${rules}
.SBx9_sheet{position:static;bottom:auto}
</style></head><body>
<div class="SBx9_sheet">
  <div class="SBx9_col">${items.slice(0, cut).join('')}</div>
  <div class="SBx9_col">${items.slice(cut).join('')}</div>
</div>
</body></html>`;

const out = path.join(here, 'sheet-mock.html');
fs.writeFileSync(out, html, 'utf8');
console.log(out, 'split at', cut, 'of', items.length);
