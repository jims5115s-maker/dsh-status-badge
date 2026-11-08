/**
 * Inject the status-badge window bridge into a DeepSeek Harness shell.
 *
 * The plugin runs inside the DSH host process, which has no access to the
 * Electron API. Opening a real frameless/transparent/skipTaskbar window
 * therefore has to happen in the Electron main process. This script appends a
 * small localhost bridge (`http://127.0.0.1:<port>`) to the shell entry file so
 * the plugin can ask the shell to create and control that window.
 *
 *   node install-shell.cjs "<path to App/resources/app/lib/main.js>"
 *
 * The script is idempotent: running it again replaces the previous install.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const HERE = __dirname;
const PLUGIN_DIR = path.resolve(HERE, '..');
const RUNTIME_DIR = path.join(PLUGIN_DIR, '.runtime');
const PAGE_FILE = path.join(PLUGIN_DIR, 'window.html');
const BLOCK_FILE = path.join(HERE, 'bridge-block.js');

const target = process.argv[2];
if (target === undefined || target === '') {
  console.error('usage: node install-shell.cjs <path to app/lib/main.js>');
  process.exit(1);
}
if (fs.existsSync(PAGE_FILE) === false) {
  console.error('window.html not found at ' + PAGE_FILE);
  process.exit(1);
}
if (fs.existsSync(BLOCK_FILE) === false) {
  console.error('bridge-block.js not found at ' + BLOCK_FILE);
  process.exit(1);
}

const MARK_A = '/* __statusBridgeV2:start */';
const MARK_B = '/* __statusBridgeV2:end */';
const ANCHOR = 'if (claimDesktopSingleInstance(app, () => {';
const HOOK_FROM = '})) app.whenReady().then(main).catch(';
const HOOK_TO = '})) app.whenReady().then(() => { try { __statusStart(); } catch (err) { console.error("[status-badge] bridge start failed", err); } }).then(main).catch(';

let src = fs.readFileSync(target, 'utf8');

const i = src.indexOf(MARK_A);
const j = src.indexOf(MARK_B);
if (i !== -1 && j !== -1) {
  src = src.slice(0, i) + src.slice(j + MARK_B.length);
  console.log('removed previous install');
}

if (src.indexOf(ANCHOR) === -1) {
  console.error('anchor not found - is this the correct shell entry file?');
  process.exit(1);
}

fs.mkdirSync(RUNTIME_DIR, { recursive: true });

const portFile = path.join(RUNTIME_DIR, 'bridge.port').split(path.sep).join('/');
const boundsFile = path.join(RUNTIME_DIR, 'bounds.json').split(path.sep).join('/');
const logFile = path.join(RUNTIME_DIR, 'bridge.log').split(path.sep).join('/');
const pagePrefix = pathToFileURL(PAGE_FILE).href;

let block = fs.readFileSync(BLOCK_FILE, 'utf8');
block = block.split('__ST_PORT_FILE__').join(JSON.stringify(portFile));
block = block.split('__ST_BOUNDS_FILE__').join(JSON.stringify(boundsFile));
block = block.split('__ST_LOG_FILE__').join(JSON.stringify(logFile));
block = block.split('__ST_PAGE_PREFIX__').join(JSON.stringify(pagePrefix));

if (block.indexOf('__ST_') !== -1) {
  console.error('unresolved placeholder left in block');
  process.exit(1);
}

const NL = String.fromCharCode(10);
src = src.replace(ANCHOR, block + NL + ANCHOR);

if (src.indexOf(MARK_A) === -1) {
  console.error('insert failed');
  process.exit(1);
}

if (src.indexOf(HOOK_TO) === -1) {
  if (src.indexOf(HOOK_FROM) !== -1) {
    src = src.replace(HOOK_FROM, HOOK_TO);
  } else {
    const plain = 'app.whenReady().then(main)';
    const k = src.indexOf(plain);
    if (k === -1) {
      console.error('startup hook anchor not found: ' + plain);
      process.exit(1);
    }
    src = src.slice(0, k) + 'app.whenReady().then(() => { try { __statusStart(); } catch (err) { console.error("[status-badge] bridge start failed", err); } }).then(main)' + src.slice(k + plain.length);
  }
}

fs.writeFileSync(target, src);
console.log('installed, size ' + src.length);
console.log('page  ' + pagePrefix);
console.log('state ' + portFile);
