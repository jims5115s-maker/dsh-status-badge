import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(dir, '..', 'client.js'), 'utf8');

globalThis.document = {
  querySelector: () => null,
  head: { appendChild: () => {} },
  createElement: () => ({ dataset: {}, textContent: '' }),
  addEventListener: () => {},
  removeEventListener: () => {},
};
globalThis.window = {
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener: () => {},
  removeEventListener: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  __ModuleLoader__: { load: () => {} },
};

const React = {
  Fragment: Symbol.for('react.fragment'),
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useRef: (initial) => ({ current: initial === undefined ? null : initial }),
  useEffect: () => {},
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
};

let plugin = null;
globalThis.window.__ModuleLoader__.load = ({ factory }) => {
  plugin = factory((name) => {
    if (name === 'react') return React;
    if (name === 'react-dom') return { createPortal: (node) => node };
    if (name === 'react-dom/client') return { createRoot: () => ({ render: () => {}, unmount: () => {} }) };
    return {};
  });
};

const holder = {};
new Function('window', 'document', 'globalThis', src)(globalThis.window, globalThis.document, globalThis);
const api = holder.plugin || plugin;
assert.ok(api && api.__internals, 'internals missing');

const { deriveFeed, errorTextOf } = api.__internals;

const failedNode = {
  kind: 'tool-result',
  seq: 2,
  name: 'pwsh',
  content: 'Command failed with exit code 1',
  isError: true,
  error: { message: 'runProbe exploded' },
};
assert.equal(errorTextOf(failedNode), 'runProbe exploded');
assert.equal(errorTextOf({ error: 'plain string' }), 'plain string');
assert.equal(errorTextOf({ content: [{ text: 'part text' }] }), 'part text');
assert.equal(errorTextOf({}), '');

const snapshot = {
  nodes: new Map([
    [1, { kind: 'tool-call', seq: 1, data: { root: { name: 'pwsh', argsRaw: JSON.stringify({ command: 'npm test' }), phase: 'start' } } }],
    [2, failedNode],
  ]),
};
const feed = deriveFeed(snapshot);
const errorLines = feed.lines.filter((line) => line.kind === 'error');
assert.equal(errorLines.length, 1);
assert.equal(errorLines[0].text, '! pwsh 失敗：runProbe exploded');
assert.ok(feed.lines.some((line) => line.kind === 'cmd'), 'command line still present');

console.log('error-line ok:', JSON.stringify(errorLines[0]));
