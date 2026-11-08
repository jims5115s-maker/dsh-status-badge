// Reports how many rows each display mode produces for a busy session, so the
// three dropdown entries can be compared numerically instead of by eye.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
new Function('window', 'document', 'globalThis', src)(globalThis.window, globalThis.document, globalThis);
const { deriveFeed } = plugin.__internals;

// A busy session: 45 shell calls, 20 reasoning blocks, 3 answers, 6 user turns.
const nodes = new Map();
let seq = 1;
for (let i = 0; i < 45; i += 1) {
  nodes.set(seq, {
    kind: 'tool-call',
    seq: seq,
    data: { root: { name: 'pwsh', argsRaw: JSON.stringify({ command: 'node .test/x.mjs --flag ' + i }), phase: 'start' } },
  });
  seq += 1;
  if (i % 3 === 0) {
    nodes.set(seq, {
      kind: 'assistant-step',
      seq: seq,
      data: { blocks: [{ kind: 'reasoning', text: 'line one\nline two\nline three' }, { kind: 'text', text: 'answer body ' + i }] },
    });
    seq += 1;
  }
  if (i % 15 === 0) {
    nodes.set(seq, { kind: 'user', seq: seq, data: { text: '使用者的訊息 ' + i } });
    seq += 1;
  }
}
// Tier-2 only nodes: system prompt, injected context, steering, finished tool body.
nodes.set(seq, { kind: 'system-prompt', seq: seq, data: { text: '系統提示第一行\n系統提示第二行\n系統提示第三行' } });
seq += 1;
nodes.set(seq, { kind: 'context', seq: seq, data: { content: '注入的回憶內容', producer: { label: 'hindsight', role: 'recall' } } });
seq += 1;
nodes.set(seq, { kind: 'steering', seq: seq, data: { content: '插一句話' } });
seq += 1;
nodes.set(seq, {
  kind: 'tool-call',
  seq: seq,
  data: { root: { name: 'pwsh', argsRaw: JSON.stringify({ command: 'node .test/done.mjs' }), phase: 'start', content: '結果內容一行\n結果內容兩行' } },
});
seq += 1;

for (const flow of ['simple', 'normal', 'full']) {
  const feed = deriveFeed({ nodes }, flow);
  const kinds = {};
  for (const line of feed.lines) kinds[line.kind] = (kinds[line.kind] || 0) + 1;
  console.log(flow.padEnd(7), 'lines=' + String(feed.lines.length).padStart(3), 'cap=' + feed.cap, JSON.stringify(kinds));
}
