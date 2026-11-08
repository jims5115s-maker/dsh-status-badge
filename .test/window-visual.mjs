// Deterministic visual check of the monitor window: serves the host routes from a
// stub with fixed fixtures, then screenshots the window once per display mode.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const outDir = path.join(root, '.runtime');
const edge = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Each mode's fixture only contains the line categories that mode shows, mirroring
// deriveFeed's tiers: 0 = spine, 1 = reasoning/answers/args, 2 = everything.
const CATEGORIES = {
  simple: ['cmd', 'note', 'error', 'dim'],
  normal: ['cmd', 'note', 'error', 'dim', 'out', 'file', 'reason', 'answer'],
  full: ['cmd', 'note', 'error', 'dim', 'out', 'file', 'reason', 'answer', 'sys', 'body', 'inject', 'turn'],
};

function lineFor(category, i) {
  switch (category) {
    case 'cmd':
      return { text: '$ node .test/probe.mjs --row ' + i, kind: 'cmd' };
    case 'note':
      return { text: '› 你：第 ' + i + ' 輪的訊息', kind: 'note' };
    case 'error':
      return { text: '! pwsh 失敗：exit code ' + i, kind: 'error' };
    case 'dim':
      return { text: '  ~ 模型重試（scheduled）：rate limited ' + i, kind: 'dim' };
    case 'out':
      return { text: '  out = 第 ' + i + ' 段的輸出內容', kind: 'out' };
    case 'file':
      return { text: '  file = src/module-' + i + '.ts', kind: 'file' };
    case 'reason':
      return { text: '· 思考第 ' + i + ' 行：先確認這個分支有沒有被走到', kind: 'note' };
    case 'answer':
      return { text: '> 回答第 ' + i + ' 段：這裡說明改動的原因', kind: 'out' };
    case 'sys':
      return { text: '◈ 系統提示 ' + (1200 + i) + ' 字 · ' + (30 + i) + ' 行', kind: 'cmd' };
    case 'body':
      return { text: '  ← pwsh 結果第 ' + i + ' 行內容', kind: 'out' };
    case 'inject':
      return { text: '⌁ hindsight 注入：被召回的回憶 ' + i, kind: 'dim' };
    default:
      return { text: '▸ 新一輪開始 ' + i, kind: 'dim' };
  }
}

function fixture(flow) {
  const categories = CATEGORIES[flow] || CATEGORIES.full;
  const lines = [];
  for (let i = 1; i <= 160; i += 1) lines.push(lineFor(categories[i % categories.length], i));
  return {
    ok: true,
    flow,
    pace: 'instant',
    running: true,
    status: 'working',
    thinking: '檢查「' + flow + '」這個檔位畫出來長什麼樣。',
    tool: 'pwsh',
    detail: 'node .test/probe.mjs',
    elapsed: 128,
    lines,
    paths: ['src/module-1.ts'],
    stats: { nodes: 210, tools: 60, kinds: { 'tool-call': 60, 'assistant-step': 145 } },
    usage: { input: 120000, output: 40000, cacheRead: 80000, spend: 3.21, total: 160000 },
    view: { theme: 'dark', pane: { work: true, think: true, code: true, hardware: true }, hw: { cpu: true, mem: true, gpu: true, disk: true, balance: true } },
    receivedAt: Date.now(),
    pushes: 42,
  };
}

const metrics = {
  ok: true,
  cpuPct: 23.4,
  cores: 8,
  memUsed: 17123456000,
  memTotal: 34359738368,
  disk: { pct: 88 },
  gpu: [{ pct: 50, name: 'RTX 5080', memUsed: 8090812416 }, { pct: 21, name: 'RTX 5070 Ti', memUsed: 2000000000 }],
  uptimeSec: 57000,
};
const balance = { ok: true, wallet: { currency: 'CNY', balance: 22.66 } };

function serve(flow) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    res.setHeader('cache-control', 'no-store');
    res.setHeader('access-control-allow-origin', '*');
    if (url.pathname === '/status-badge/live') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(fixture(flow)));
      return;
    }
    if (url.pathname === '/status-badge/metrics') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(metrics));
      return;
    }
    if (url.pathname === '/status-badge/balance') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(balance));
      return;
    }
    res.statusCode = 404;
    res.end('{}');
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function shot(flow, port) {
  const target = path.join(outDir, 'flow-' + flow + '.png');
  const page = 'file:///' + path.join(root, 'window.html').replace(/\\/g, '/')
    + '?origin=http://127.0.0.1:' + port + '&theme=terminal';
  return new Promise((resolve) => {
    const child = spawn(edge, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=2600',
      '--window-size=1080,1920', '--screenshot=' + target, page,
    ], { stdio: 'ignore' });
    child.on('exit', () => resolve(target));
  });
}

for (const flow of ['simple', 'normal', 'full']) {
  const server = await serve(flow);
  const file = await shot(flow, server.address().port);
  server.close();
  console.log(flow, '->', file, fs.statSync(file).size + ' bytes');
}
