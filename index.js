/**
 * Host half of the status-badge bundle.
 *
 * Responsibilities:
 *  - sample `node:os` so the panel can show real machine load;
 *  - keep the last live snapshot the Client half pushed (current work, latest
 *    reasoning, code lines) so a separate window can render it;
 *  - own the native monitor window: frameless, transparent, skipTaskbar, with
 *    opacity / maximize / close driven from its own title bar.
 */
import os from 'node:os';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PAGE_FILE = path.join(HERE, 'window.html');
const VERSION_CACHE = { at: 0, value: '0.0.0' };
function readVersion() {
  if (Date.now() - VERSION_CACHE.at < 5000) return VERSION_CACHE.value;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(HERE, 'package.json'), 'utf8'));
    const raw = String(pkg.version || '').trim();
    VERSION_CACHE.value = /^\d+\.\d+\.\d+$/.test(raw) ? raw : '0.0.0';
  } catch {
    VERSION_CACHE.value = '0.0.0';
  }
  VERSION_CACHE.at = Date.now();
  return VERSION_CACHE.value;
}

const ROUTE_METRICS = '/status-badge/metrics';
const ROUTE_LIVE = '/status-badge/live';
const ROUTE_BALANCE = '/status-badge/balance';
const ROUTE_PAGE = '/status-badge/window';
const ROUTE_ACTION = '/status-badge/window/action';
const ROUTE_STATE = '/status-badge/window/state';
const ROUTE_MOVE = '/status-badge/window/move';
const ROUTE_DRAG = '/status-badge/window/dragstart';
const ROUTE_RESET = '/status-badge/window/reset';
const ROUTE_FOCUS = '/status-badge/window/focus';
const ROUTE_RESTORE = '/status-badge/window/restore';
const ROUTE_OPEN = '/status-badge/open';
let sessionTag = '';
const ROUTE_ALPHA = '/status-badge/window/alpha';
const ROUTE_FIT = '/status-badge/window/fit';
const ROUTE_DEBUG = '/status-badge/debug';
const HISTORY_LIMIT = 60;

const history = [];
let previous = null;
let livePushes = 0;
let latestCpu = null;

let live = emptyLive();

function emptyLive() {
  return {
    at: 0,
    status: 'idle',
    running: false,
    thinking: '',
    tool: '',
    detail: '',
    lines: [],
    paths: [],
    stats: { nodes: 0, tools: 0 },
    tokens: {},
  };
}

/* ------------------------------------------------------------------ metrics */

function cpuTotals() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    const times = cpu.times || {};
    for (const key of Object.keys(times)) total += times[key];
    idle += times.idle;
  }
  return { idle, total, cores: cpus.length, model: cpus.length > 0 ? cpus[0].model : '' };
}

/** One CPU-delta sample; the first call only seeds the baseline. */
function sampleCpu() {
  const now = cpuTotals();
  if (previous !== null && now.total > previous.total) {
    const deltaTotal = now.total - previous.total;
    const deltaIdle = now.idle - previous.idle;
    latestCpu = Math.max(0, Math.min(100, (1 - deltaIdle / deltaTotal) * 100));
    history.push(latestCpu);
    while (history.length > HISTORY_LIMIT) history.shift();
  }
  previous = now;
  return now;
}

let gpuState = { list: [], at: 0 };
let sysState = { gpu: { list: [], at: 0, err: '' }, slow: null, at: 0, busy: false };
let netPrev = null;

function runProbe(file, args, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => { if (!done) { done = true; resolve(value); } };
    try {
      const child = spawn(file, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      child.stdout.on('data', (chunk) => { if (out.length < 1048576) out += String(chunk); });
      child.on('error', () => finish(null));
      child.on('close', () => finish(out.trim()));
      setTimeout(() => { try { child.kill(); } catch {} finish(null); }, Number.isFinite(timeoutMs) ? timeoutMs : 4000);
    } catch { finish(null); }
  });
}

function parseGpu(parsed) {
  const samples = Array.isArray(parsed.samples) ? parsed.samples : [];
  const adapters = Array.isArray(parsed.adapters) ? parsed.adapters : [];

  const byLuid = new Map();
  for (const adapter of adapters) {
    if (adapter === null || typeof adapter !== 'object') continue;
    const luid = String(adapter.luid || '').toLowerCase().replace(/^0+/, '');
    const name = String(adapter.name || '');
    const vendor = Number(adapter.vendor);
    if (luid === '' || name === '') continue;
    if (vendor === 5140 || name.indexOf('Microsoft Basic') !== -1) continue;
    byLuid.set(luid, name);
  }

  const groups = new Map();
  for (const sample of samples) {
    if (sample === null || typeof sample !== 'object') continue;
    const inst = String(sample.inst || '');
    const path = String(sample.path || '');
    const match = /luid_0x[0-9a-f]+_0x([0-9a-f]+)/i.exec(inst);
    if (match === null) continue;
    const key = match[1].toLowerCase().replace(/^0+/, '');
    const value = Number(sample.val);
    if (!Number.isFinite(value)) continue;
    const prev = groups.get(key) || { pct: 0, mem: null };
    if (path.toLowerCase().indexOf('gpu engine') !== -1) {
      if (!/engtype_(3d|compute)/i.test(inst)) continue;
      prev.pct += value;
    } else {
      prev.mem = (prev.mem || 0) + value;
    }
    groups.set(key, prev);
  }

  const list = Array.from(groups.keys())
    .filter((key) => byLuid.has(key))
    .map((key) => {
      const row = groups.get(key);
      return {
        pct: Math.min(100, Math.max(0, Math.round(row.pct * 10) / 10)),
        name: byLuid.get(key),
        memUsed: row.mem === null ? null : Math.round(row.mem),
        memTotal: null,
      };
    })
    .filter((gpu) => Number.isFinite(gpu.pct));

  return { list, at: Date.now(), err: list.length === 0 ? 'no match' : '' };
}

function parseSlow(parsed) {
  const disks = Array.isArray(parsed.disks) ? parsed.disks.filter((d) => d && typeof d.id === 'string') : [];
  const sys = disks.find((d) => d.id === 'C:') || disks[0] || null;
  const rx = Number(parsed.netRx);
  const tx = Number(parsed.netTx);
  const now = Date.now();
  let netIn = 0;
  let netOut = 0;
  if (netPrev !== null && Number.isFinite(rx) && Number.isFinite(tx)) {
    const dt = Math.max(0.5, (now - netPrev.at) / 1000);
    netIn = Math.max(0, Math.round((rx - netPrev.rx) / dt));
    netOut = Math.max(0, Math.round((tx - netPrev.tx) / dt));
  }
  if (Number.isFinite(rx) && Number.isFinite(tx)) netPrev = { rx, tx, at: now };
  const batt = Number(parsed.battery);
  return {
    disks,
    diskId: sys === null ? null : sys.id,
    diskFree: sys === null ? null : sys.free,
    diskTotal: sys === null ? null : sys.total,
    netIn,
    netOut,
    battery: Number.isFinite(batt) && batt >= 0 ? batt : null,
    procs: Array.isArray(parsed.procs) ? parsed.procs.filter((x) => x && typeof x.name === 'string').slice(0, 5) : [],
  };
}

async function sampleSys() {
  if (sysState.busy) return;
  sysState.busy = true;
  try {
    const script = [
      "$c = Get-Counter -Counter '\\GPU Engine(*)\\Utilization Percentage','\\GPU Adapter Memory(*)\\Dedicated Usage' -ErrorAction SilentlyContinue",
      "$an = Get-ChildItem 'HKLM:\\SOFTWARE\\Microsoft\\DirectX' -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue; if ($p.AdapterLuid) { [ordered]@{ luid = (($p.AdapterLuid | ForEach-Object { $_.ToString('x2') }) -join ''); name = $p.Description; vendor = [double]$p.VendorId } } }",
      "$d = Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object DeviceID, FreeSpace, Size",
      "$pr = Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 5 Name, WorkingSet64",
      "$rx = (Get-NetAdapterStatistics -ErrorAction SilentlyContinue | Measure-Object -Property ReceivedBytes -Sum).Sum",
      "$tx = (Get-NetAdapterStatistics -ErrorAction SilentlyContinue | Measure-Object -Property SentBytes -Sum).Sum",
      "$bt = (Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object -First 1).EstimatedChargeRemaining",
      "$o = [ordered]@{ samples = @($c.CounterSamples | ForEach-Object { [ordered]@{ path = $_.Path; inst = $_.InstanceName; val = [double]$_.CookedValue } }); adapters = @($an); disks = @($d | ForEach-Object { [ordered]@{ id = $_.DeviceID; free = [double]$_.FreeSpace; total = [double]$_.Size } }); procs = @($pr | ForEach-Object { [ordered]@{ name = $_.Name; mem = [double]$_.WorkingSet64 } }); netRx = $(if ($rx) { [double]$rx } else { 0 }); netTx = $(if ($tx) { [double]$tx } else { 0 }); battery = $(if ($bt) { [double]$bt } else { -1 }) }",
      "$o | ConvertTo-Json -Compress -Depth 4",
    ].join('; ');
    const raw = await runProbe('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], 15000);
    if (typeof raw === 'string' && raw.trim() !== '') {
      const parsed = JSON.parse(raw.trim());
      if (parsed !== null && typeof parsed === 'object') {
        sysState = { gpu: parseGpu(parsed), slow: parseSlow(parsed), at: Date.now(), busy: false };
        return;
      }
    }
  } catch (err) {
    sysState.gpu.err = String((err && err.message) || err);
  } finally {
    sysState.busy = false;
    if (sysState.at === 0) sysState.at = Date.now();
  }
}

function sysFresh() {
  if (Date.now() - sysState.at > 2000 && !sysState.busy) sampleSys();
  return sysState;
}

function snapshot() {
  const sys = sysFresh();
  const cpu = sampleCpu();
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const load = os.loadavg();
  return {
    at: Date.now(),
    version: readVersion(),
    session: sessionTag,
    cpuPct: latestCpu,
    cpuHistory: history.slice(),
    cores: cpu.cores,
    cpuModel: cpu.model,
    memUsed: memTotal - memFree,
    memTotal,
    memFree,
    loadavg: load,
    uptimeSec: os.uptime(),
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    node: process.version,
    electron: process.versions.electron || '',
    processType: process.type || 'node',
    resourcePath: process.resourcePath || '',
    slow: sysFresh().slow,
    gpu: sysFresh().gpu,
  };
}

/* ---------------------------------------------------------------- utilities */

function json(response, code, value) {
  const body = JSON.stringify(value);
  response.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'cache-control': 'no-store',
  });
  response.end(body);
}

function text(response, code, body, type) {
  response.writeHead(code, {
    'content-type': (type || 'text/plain') + '; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
  });
  response.end(body);
}

function cors(request, response) {
  if (request.method !== 'OPTIONS') return false;
  response.writeHead(204, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-max-age': '600',
  });
  response.end();
  return true;
}

function readBody(request) {
  return new Promise((resolve) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2_000_000) request.destroy();
    });
    request.on('end', () => {
      try {
        resolve(raw === '' ? {} : JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    request.on('error', () => resolve({}));
  });
}

function cleanLine(value) {
  return typeof value === 'string' ? value.slice(0, 400) : '';
}

function cleanLive(input) {
  const source = input !== null && typeof input === 'object' ? input : {};
  const tokens = {};
  if (source.tokens !== null && typeof source.tokens === 'object') {
    for (const key of Object.keys(source.tokens).slice(0, 40)) {
      const name = String(key).slice(0, 80);
      const value = source.tokens[key];
      if (/^--[a-z0-9-]+$/i.test(name) && typeof value === 'string' && value.length < 120) {
        tokens[name] = value;
      }
    }
  }
  const lines = Array.isArray(source.lines) ? source.lines.slice(-200) : [];
  const view = source.view !== null && typeof source.view === 'object' ? source.view : {};
  const pane = view.pane !== null && typeof view.pane === 'object' ? view.pane : {};
  const hw = view.hw !== null && typeof view.hw === 'object' ? view.hw : {};
  const usage = source.usage !== null && typeof source.usage === 'object' ? source.usage : {};
  const stats = source.stats !== null && typeof source.stats === 'object' ? source.stats : {};
  const kindSource = stats.kinds !== null && typeof stats.kinds === 'object' ? stats.kinds : {};
  const kinds = {};
  for (const key of Object.keys(kindSource).slice(0, 24)) {
    const name = String(key).slice(0, 24);
    const value = Number(kindSource[key]);
    if (/^[a-z0-9?_-]+$/i.test(name) && Number.isFinite(value) && value > 0) kinds[name] = Math.round(value);
  }
  return {
    at: Date.now(),
    status: typeof source.status === 'string' ? source.status.slice(0, 24) : 'idle',
    running: source.running === true,
    elapsed: Number.isFinite(source.elapsed) ? Math.max(0, Math.round(source.elapsed)) : 0,
    session: typeof source.session === 'string' ? source.session.slice(0, 12) : '',
    label: typeof source.label === 'string' ? source.label.slice(0, 40) : '',
    thinking: typeof source.thinking === 'string' ? source.thinking.slice(-2400) : '',
    tool: typeof source.tool === 'string' ? source.tool.slice(0, 120) : '',
    detail: typeof source.detail === 'string' ? source.detail.slice(0, 200) : '',
    lines: lines
      .map((line) => {
        const object = line !== null && typeof line === 'object';
        const value = object ? cleanLine(line.text) : cleanLine(line);
        if (value.trim() === '') return null;
        const kind = object && typeof line.kind === 'string' ? line.kind.slice(0, 12) : 'real';
        return { text: value, kind: kind };
      })
      .filter((line) => line !== null),
    paths: Array.isArray(source.paths) ? source.paths.slice(-24).map((item) => String(item).slice(0, 200)) : [],
    stats: {
      nodes: Number.isFinite(stats.nodes) ? stats.nodes : 0,
      tools: Number.isFinite(stats.tools) ? stats.tools : 0,
      kinds: kinds,
    },
    usage: {
      input: Number.isFinite(usage.input) ? Math.max(0, Math.round(usage.input)) : 0,
      output: Number.isFinite(usage.output) ? Math.max(0, Math.round(usage.output)) : 0,
      total: Number.isFinite(usage.total) ? Math.max(0, Math.round(usage.total)) : 0,
      cacheRead: Number.isFinite(usage.cacheRead) ? Math.max(0, Math.round(usage.cacheRead)) : 0,
      spend: Number.isFinite(usage.spend) ? Math.max(0, Math.round(usage.spend * 10000) / 10000) : 0,
      probe: typeof usage.probe === 'string' ? usage.probe.slice(0, 24) : '',
    },
    view: {
      theme: typeof view.theme === 'string' ? view.theme.slice(0, 16) : 'dark',
      pane: { work: pane.work !== false, think: pane.think !== false, code: pane.code !== false, hardware: pane.hardware !== false },
      hw: { cpu: hw.cpu !== false, mem: hw.mem !== false, gpu: hw.gpu !== false, disk: hw.disk !== false, balance: hw.balance !== false },
    },
    flow: source.flow === 'simple' || source.flow === 'normal' ? source.flow : 'full',
    pace: source.pace === 'instant' || source.pace === 'normal' ? source.pace : 'smooth',
    tokens: Object.keys(tokens).length === 0 ? live.tokens : tokens,
  };
}

const BRIDGE_PORT_FILE = path.join(HERE, '.runtime', 'bridge.port');
const BRIDGE_TOKEN_FILE = path.join(HERE, '.runtime', 'bridge.token');

async function bridgeSecret() {
  try {
    const fsp = await import('node:fs/promises');
    const token = String(await fsp.readFile(BRIDGE_TOKEN_FILE, 'utf8')).trim();
    return token === '' ? '' : 't=' + encodeURIComponent(token);
  } catch {
    return '';
  }
}

async function bridgeGet(pathname) {
  try {
    const fsp = await import('node:fs/promises');
    const raw = await fsp.readFile(BRIDGE_PORT_FILE, 'utf8');
    const port = Number(String(raw).trim());
    if (!Number.isFinite(port) || port <= 0) return { ok: false, reason: 'bad-port' };
    const secret = await bridgeSecret();
    const joiner = pathname.indexOf('?') === -1 ? '?' : '&';
    const url = 'http://127.0.0.1:' + port + pathname + (secret === '' ? '' : joiner + secret);
    const response = await fetch(url);
    const body = await response.json();
    return body !== null && typeof body === 'object' ? body : { ok: false, reason: 'bad-body' };
  } catch (error) {
    return { ok: false, reason: 'bridge-error', detail: String(error && error.message ? error.message : error) };
  }
}

async function bridgeOpen(pageUrl) {
  return await bridgeGet('/open?url=' + encodeURIComponent(pageUrl));
}

async function bridgeApply(action) {
  const state = await bridgeGet('/state');
  if (state === null || state.ok !== true) return null;
  if (action === 'opacity') {
    const steps = [1, 0.85, 0.7, 0.55, 0.4];
    const current = typeof state.alpha === 'number' ? state.alpha : 1;
    let index = -1;
    for (let i = 0; i < steps.length; i += 1) {
      if (Math.abs(steps[i] - current) < 0.04) index = i;
    }
    const next = steps[(index + 1) % steps.length];
    return await bridgeGet('/opacity?value=' + next);
  }
  if (action === 'maximize') return await bridgeGet('/maximize');
  if (action === 'close') return await bridgeGet('/close');
  return null;
}

const PAGE_URL = pathToFileURL(PAGE_FILE).href;

async function openMonitor(origin) {
  const bridged = await bridgeOpen(PAGE_URL + '?origin=' + encodeURIComponent(String(origin)));
  return bridged !== null && typeof bridged === 'object' ? bridged : { ok: false, reason: 'bridge-unavailable' };
}

/* --------------------------------------------------------------------- boot */

export const inject = ['webServer'];

function startSampler(ctx) {
  const timer = typeof ctx.get === 'function' ? ctx.get('timer') : undefined;
  if (timer !== undefined && typeof timer.interval === 'function') {
    return timer.interval(() => sampleCpu(), 1000);
  }
  const handle = setInterval(() => sampleCpu(), 1000);
  return () => clearInterval(handle);
}

export function apply(ctx) {
  ctx.effect(() => startSampler(ctx), 'status-badge: cpu sampler');

  let balanceCache = { at: 0, payload: null };

  async function readBalance(ctx) {
    const now = Date.now();
    if (balanceCache.payload !== null && now - balanceCache.at < 60000) return balanceCache.payload;
    const account = typeof ctx.get === 'function' ? ctx.get('deepseekAccount') : undefined;
    if (account === undefined || account === null || typeof account.getBalance !== 'function') {
      return { ok: false, reason: 'no-account' };
    }
    try {
      const details = await account.getBalance({
        version: '1.1.0',
        locale: 'zh-TW',
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      });
      if (details === null || details === undefined) return { ok: false, reason: 'signed-out' };
      if (details.status !== 'ready') return { ok: false, reason: 'failed' };
      const pick = (list) => {
        const items = Array.isArray(list) ? list : [];
        const wallet = items.find((w) => w !== null && typeof w === 'object' && w.currency === 'CNY') || items[0];
        if (wallet === undefined || wallet === null) return null;
        return { currency: String(wallet.currency || 'CNY'), balance: String(wallet.balance || '0') };
      };
      const payload = { ok: true, wallet: pick(details.value), bonus: pick(details.bonusWallets), at: now };
      balanceCache = { at: now, payload: payload };
      return payload;
    } catch (error) {
      return { ok: false, reason: 'error', detail: String(error && error.message ? error.message : error) };
    }
  }

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_BALANCE,
        async handler(request, response) {
          if ((request.method || 'GET') !== 'GET') {
            text(response, 405, 'method not allowed');
            return;
          }
          try {
            json(response, 200, await readBalance(ctx));
          } catch (error) {
            text(response, 500, String(error && error.message ? error.message : error));
          }
        },
      }),
    'status-badge: balance route',
  );
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_METRICS,
        handler(request, response) {
          if ((request.method || 'GET') !== 'GET') {
            text(response, 405, 'method not allowed');
            return;
          }
          try {
            json(response, 200, snapshot());
          } catch (error) {
            text(response, 500, String(error && error.message ? error.message : error));
          }
        },
      }),
    'status-badge: metrics route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_LIVE,
        async handler(request, response) {
          if (cors(request, response)) return;
          const method = request.method || 'GET';
          if (method === 'GET') {
            json(response, 200, live);
            return;
          }
          if (method !== 'POST') {
            text(response, 405, 'method not allowed');
            return;
          }
          const body = await readBody(request);
          live = cleanLive(body);
          livePushes += 1;
          live.pushes = livePushes;
          live.receivedAt = Date.now();
          json(response, 200, { ok: true, at: live.at, pushes: livePushes });
        },
      }),
    'status-badge: live state route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_PAGE,
        handler(request, response) {
          if ((request.method || 'GET') !== 'GET') {
            text(response, 405, 'method not allowed');
            return;
          }
          try {
            text(response, 200, fs.readFileSync(PAGE_FILE, 'utf8'), 'text/html');
          } catch (error) {
            text(response, 500, 'monitor page missing: ' + String(error && error.message ? error.message : error));
          }
        },
      }),
    'status-badge: monitor page route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_ACTION,
        async handler(request, response) {
          if (cors(request, response)) return;
          if ((request.method || 'GET') !== 'POST') {
            text(response, 405, 'method not allowed');
            return;
          }
          const body = await readBody(request);
          const action = typeof body.action === 'string' ? body.action : '';
          try {
            const bridged = await bridgeApply(action);
            if (bridged !== null && bridged.ok === true) {
              json(response, 200, {
                ok: true,
                action: action,
                maxed: bridged.maxed === true,
                alpha: typeof bridged.alpha === 'number' ? bridged.alpha : undefined,
                bounds: bridged.bounds || null,
              });
              return;
            }
            json(response, 200, { ok: false, reason: 'bridge-unavailable' });
          } catch (error) {
            json(response, 500, { ok: false, reason: String(error && error.message ? error.message : error) });
          }
        },
      }),
    'status-badge: window actions route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_FOCUS,
        async handler(request, response) {
          const bridged = await bridgeGet('/focus');
          json(response, 200, bridged !== null && typeof bridged === 'object' ? bridged : { ok: false });
        },
      }),
    'status-badge: window focus route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_RESET,
        async handler(request, response) {
          const bridged = await bridgeGet('/reset');
          if (bridged !== null && bridged.ok === true) {
            json(response, 200, { ok: true, bounds: bridged.bounds !== undefined ? bridged.bounds : null });
            return;
          }
          json(response, 200, { ok: false, reason: 'bridge-unavailable' });
        },
      }),
    'status-badge: window reset route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_STATE,
        async handler(request, response) {
          const bridged = await bridgeGet('/state');
          if (bridged !== null && bridged.ok === true) {
            json(response, 200, { open: bridged.open === true, alpha: typeof bridged.alpha === 'number' ? bridged.alpha : 1, maxed: bridged.maxed === true, bounds: bridged.bounds !== undefined ? bridged.bounds : null, pinned: bridged.pinned === true, passthrough: bridged.passthrough === true, session: sessionTag });
            return;
          }
          json(response, 200, { open: false, alpha: 1, maxed: false, bounds: null, session: sessionTag });
        },
      }),
    'status-badge: window state route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/status-badge/notify',
        async handler(request, response) {
          if (cors(request, response)) return;
          if ((request.method || 'GET') !== 'POST') {
            text(response, 405, 'method not allowed');
            return;
          }
          const body = await readBody(request);
          const title = typeof body.title === 'string' ? body.title.slice(0, 80) : 'Status badge';
          const text2 = typeof body.body === 'string' ? body.body.slice(0, 200) : '';
          const bridged = await bridgeGet('/notify?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text2));
          json(response, 200, bridged !== null && typeof bridged === 'object' ? bridged : { ok: false });
        },
      }),
    'status-badge: notify route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: '/status-badge/window/ctl',
        async handler(request, response) {
          const url = new URL(String(request.url || '/'), 'http://127.0.0.1');
          const name = String(url.searchParams.get('path') || '');
          const allowed = ['pin', 'passthrough', 'snap', 'toggle', 'opacity', 'layer', 'pinpos'];
          if (allowed.indexOf(name) === -1) {
            json(response, 400, { ok: false, reason: 'bad-path' });
            return;
          }
          const value = url.searchParams.get('value');
          const query = '/' + name + (value === null ? '' : '?value=' + encodeURIComponent(value));
          const bridged = await bridgeGet(query);
          json(response, 200, bridged !== null && typeof bridged === 'object' ? bridged : { ok: false });
        },
      }),
    'status-badge: window control proxy',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_ALPHA,
        async handler(request, response) {
          const url = new URL(String(request.url || '/'), 'http://127.0.0.1');
          const raw = Number(url.searchParams.get('value'));
          const pct = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 100;
        const bridged = await bridgeGet('/alpha?value=' + String(pct));
          json(response, 200, bridged !== null && typeof bridged === 'object' ? bridged : { ok: false });
        },
      }),
    'status-badge: window alpha proxy',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_FIT,
        async handler(request, response) {
          if (request.method !== 'POST') {
            json(response, 405, { ok: false, reason: 'method not allowed' });
            return;
          }
          const body = await readBody(request);
          const raw = Number(body !== null && typeof body === 'object' ? body.height : 0);
          const h = Number.isFinite(raw) ? Math.max(180, Math.min(2000, Math.round(raw))) : 0;
          if (h === 0) {
            json(response, 400, { ok: false, reason: 'bad height' });
            return;
          }
          const bridged = await bridgeGet('/size?h=' + String(h));
          json(response, 200, bridged !== null && typeof bridged === 'object' ? bridged : { ok: false });
        },
      }),
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_DEBUG,
        async handler(request, response) {
          if (cors(request, response)) return;
          if (request.method !== 'POST') {
            json(response, 405, { ok: false, reason: 'method not allowed' });
            return;
          }
          const body = await readBody(request);
          const tag = String(body !== null && typeof body === 'object' ? body.tag || '' : '').slice(0, 40);
          const detail = String(body !== null && typeof body === 'object' ? body.detail || '' : '').slice(0, 400);
          try {
            const fsp = await import('node:fs/promises');
            await fsp.mkdir(path.join(HERE, '.runtime'), { recursive: true });
            await fsp.appendFile(path.join(HERE, '.runtime', 'debug.log'), new Date().toISOString() + ' [' + tag + '] ' + detail + '\n', 'utf8');
          } catch {}
          json(response, 200, { ok: true });
        },
      }),
    'status-badge: window fit route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_DRAG,
        async handler(request, response) {
          if (cors(request, response)) return;
          if ((request.method || 'GET') !== 'POST') {
            text(response, 405, 'method not allowed');
            return;
          }
          const body = await readBody(request);
          const x = Number(body.x);
          const y = Number(body.y);
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
            json(response, 400, { ok: false, reason: 'bad-args' });
            return;
          }
          const bridged = await bridgeGet('/dragstart?x=' + String(Math.round(x)) + '&y=' + String(Math.round(y)));
          json(response, 200, bridged !== null && typeof bridged === 'object' ? bridged : { ok: false });
        },
      }),
    'status-badge: window drag route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_RESTORE,
        async handler(request, response) {
          const bridged = await bridgeGet('/restore');
          json(response, 200, bridged !== null && bridged.ok === true ? bridged : { ok: false });
        },
      }),
    'status-badge: window restore route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_MOVE,
        async handler(request, response) {
          if (cors(request, response)) return;
          if ((request.method || 'GET') !== 'POST') {
            text(response, 405, 'method not allowed');
            return;
          }
          const body = await readBody(request);
          const x = Number(body.x);
          const y = Number(body.y);
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
            json(response, 400, { ok: false, reason: 'bad-args' });
            return;
          }
          const bridged = await bridgeGet('/move?x=' + Math.round(x) + '&y=' + Math.round(y));
          json(response, 200, bridged !== null && bridged.ok === true ? bridged : { ok: false });
        },
      }),
    'status-badge: window move route',
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_OPEN,
        async handler(request, response) {
          if (cors(request, response)) return;
          if ((request.method || 'GET') !== 'POST') {
            text(response, 405, 'method not allowed');
            return;
          }
          const origin = typeof ctx.webServer.getOrigin === 'function' ? ctx.webServer.getOrigin() : '';
          const host = request.headers.host;
          const base = origin !== '' ? origin : 'http://' + (host || '127.0.0.1');
          try {
            const query = new URL(request.url || '/', base).searchParams;
            const tag = String(query.get('s') || '').slice(0, 40);
            if (tag !== '') sessionTag = tag;
            const opened = await openMonitor(base);
            json(response, 200, Object.assign({}, opened, { session: sessionTag }));
          } catch (error) {
            json(response, 500, { ok: false, reason: String(error && error.message ? error.message : error) });
          }
        },
      }),
    'status-badge: open window route',
  );
}
