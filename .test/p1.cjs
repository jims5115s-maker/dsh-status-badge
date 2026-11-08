const fs = require('fs');
const path = require('path');
const P = path.join(__dirname, '..', 'window.html');
let s = fs.readFileSync(P, 'utf8');
let n = 0;
function rep(a, b, tag) {
  if (!s.includes(a)) { console.error('MISSING', tag); return; }
  s = s.replace(a, b);
  n += 1;
}

// 1. 主題跟隨：本地變數 fallback 到 DSH token
rep(
  `        --bg: #16181c;
        --bg2: #1e2126;
        --fg: #e6edf3;
        --fg2: #9aa4af;
        --fg3: #6b7684;
        --line: #2c313a;`,
  `        --bg: var(--dsw-alias-bg-base, #16181c);
        --bg2: var(--dsw-alias-bg-layer-1, #1e2126);
        --fg: var(--dsw-alias-label-primary, #e6edf3);
        --fg2: var(--dsw-alias-label-secondary, #9aa4af);
        --fg3: var(--dsw-alias-label-tertiary, #6b7684);
        --line: var(--dsw-alias-border-l1, #2c313a);`,
  'tokens'
);

// 2. 背景漸層跟隨主題
rep(
  `        background: linear-gradient(180deg, #1b1e23, #14161a);`,
  `        background: linear-gradient(180deg, var(--bg2), var(--bg));`,
  'gradient'
);

// 3. 標題列加釘選按鈕（在最大化左邊）
rep(
  `          <button id="btn-max" type="button" title="Maximize">⛶</button>`,
  `          <button id="btn-pin" type="button" title="釘選（穿透 + 不可拖動）" data-pin="off"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/><path d="M12 14v7"/></svg></button>
          <button id="btn-max" type="button" title="Maximize">⛶</button>`,
  'pin-button'
);

// 4. 釘選按鈕樣式
rep(
  `      #ctl button[data-close="true"]:hover {`,
  `      #ctl button[data-pin="on"] {
        color: var(--brand);
        background: color-mix(in srgb, var(--brand) 22%, transparent);
      }
      #ctl button[data-pin="on"] svg {
        fill: currentColor;
      }
      #ctl button[data-close="true"]:hover {`,
  'pin-css'
);

fs.writeFileSync(P, s);
console.log('patchA', n, 'size', s.length);
