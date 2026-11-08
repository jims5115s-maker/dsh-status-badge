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

new Function('window', 'document', 'globalThis', src)(globalThis.window, globalThis.document, globalThis);
const { deriveFeed } = plugin.__internals;

const nodes = new Map([
  [1, { kind: 'user', seq: 1, text: '請幫我修好視窗' }],
  [2, { kind: 'tool-call', seq: 2, data: { root: { name: 'pwsh', argsRaw: JSON.stringify({ command: 'npm test' }), phase: 'start' } } }],
  [3, { kind: 'tool-result', seq: 3, name: 'pwsh', isError: true, error: { message: 'exit code 1' } }],
  [4, { kind: 'model-retry', seq: 4, retryState: 'scheduled', error: 'rate limited' }],
  [5, { kind: 'compaction', seq: 5, shadowedTokenCount: 128000 }],
  [6, { kind: 'turn-error', seq: 6, message: 'stream closed', code: 'ECONNRESET' }],
]);

const feed = deriveFeed({ nodes });
const byKind = (kind) => feed.lines.filter((line) => line.kind === kind).map((line) => line.text);

console.log('error :', byKind('error'));
console.log('dim   :', byKind('dim'));
console.log('cmd   :', byKind('cmd'));
console.log('note  :', byKind('note'));

assert.ok(byKind('error').some((text) => text.indexOf('pwsh') >= 0), 'tool error line');
assert.ok(byKind('error').some((text) => text.indexOf('本輪錯誤') >= 0), 'turn error line');
assert.ok(byKind('dim').some((text) => text.indexOf('模型重試') >= 0), 'retry line');
assert.ok(byKind('dim').some((text) => text.indexOf('上下文壓縮') >= 0), 'compaction line');
assert.ok(byKind('note').some((text) => text.indexOf('你：') >= 0), 'user line');
assert.ok(byKind('cmd').some((text) => text.indexOf('$ npm test') >= 0), 'command line');
console.log('coverage ok');

// Real chat nodes wrap their payload in `data`; this scenario mirrors the live shape.
const wrapped = new Map([
  [1, { kind: 'user', seq: 1, data: { text: '包裝節點也要出現' } }],
  [2, { kind: 'steering', seq: 2, data: { content: '插一句話' } }],
  [3, { kind: 'context', seq: 3, data: { content: '被召回的回憶', producer: { label: 'hindsight', role: 'recall' } } }],
  [4, { kind: 'system-prompt', seq: 4, data: { text: '第一行系統提示\n第二行系統提示', update: true } }],
  [5, { kind: 'turn-trigger', seq: 5, data: {} }],
  [6, { kind: 'turn-process', seq: 6, data: {} }],
  [7, { kind: 'tool-result', seq: 7, data: { name: 'pwsh', content: [{ type: 'text', text: 'stdout: done' }] } }],
  [8, { kind: 'tool-result', seq: 8, data: { name: 'read', isError: true, error: { message: 'ENOENT' }, content: [{ type: 'text', text: 'missing.txt' }] } }],
  [9, { kind: 'unknown', seq: 9, data: { type: 'mystery' } }],
  [10, { kind: 'assistant-step', seq: 10, data: { blocks: [{ kind: 'reasoning', text: '思考中的一行' }, { kind: 'text', text: '回答的一行' }] } }],
  [11, { kind: 'tool-call', seq: 11, data: { root: { name: 'pwsh', argsRaw: JSON.stringify({ command: 'node .test/x.mjs' }), phase: 'start' } } }],
]);

const wrappedFeed = deriveFeed({ nodes: wrapped });
const wrappedKind = (kind) => wrappedFeed.lines.filter((line) => line.kind === kind).map((line) => line.text);
console.log('wrapped:', wrappedFeed.lines.map((line) => line.kind + '|' + line.text));

assert.ok(wrappedKind('note').some((text) => text.indexOf('包裝節點也要出現') >= 0), 'wrapped user line');
assert.ok(wrappedKind('note').some((text) => text.indexOf('插話') >= 0), 'steering line');
assert.ok(wrappedKind('note').some((text) => text.indexOf('被召回的回憶') >= 0), 'recall context line');
assert.ok(wrappedKind('cmd').some((text) => text.indexOf('系統提示') >= 0), 'system prompt header');
assert.ok(wrappedKind('out').some((text) => text.indexOf('第二行系統提示') >= 0), 'system prompt body');
assert.ok(wrappedKind('dim').some((text) => text.indexOf('新一輪開始') >= 0), 'turn trigger line');
assert.ok(wrappedKind('dim').some((text) => text.indexOf('工具程序') >= 0), 'turn process line');
assert.ok(wrappedKind('dim').some((text) => text.indexOf('未知節點') >= 0), 'unknown line');
assert.ok(wrappedKind('out').some((text) => text.indexOf('stdout: done') >= 0), 'successful tool result body');
assert.ok(wrappedKind('error').some((text) => text.indexOf('ENOENT') >= 0), 'wrapped tool failure');
assert.ok(wrappedKind('out').some((text) => text.indexOf('missing.txt') >= 0), 'failed tool body');
console.log('wrapped coverage ok');

// Display-amount tiers: simple keeps only the spine, normal is the previous release,
// full is everything.
const simpleFeed = deriveFeed({ nodes: wrapped }, 'simple');
const normalFeed = deriveFeed({ nodes: wrapped }, 'normal');
const fullFeed = deriveFeed({ nodes: wrapped }, 'full');
console.log('simple:', simpleFeed.lines.map((line) => line.kind + '|' + line.text));
console.log('normal:', normalFeed.lines.map((line) => line.kind + '|' + line.text));

const hasText = (feed, needle) => feed.lines.some((line) => line.text.indexOf(needle) >= 0);
const kindsOf = (feed) => Array.from(new Set(feed.lines.map((line) => line.kind))).sort();
console.log('kinds simple:', kindsOf(simpleFeed), 'normal:', kindsOf(normalFeed), 'full:', kindsOf(fullFeed));

// The ladder is by kind count, not by row budget: simple ⊂ normal ⊂ full.
assert.ok(!simpleFeed.lines.some((line) => line.kind === 'out'), 'simple hides tool output and answers');
assert.ok(!simpleFeed.lines.some((line) => line.text.indexOf('· ') === 0), 'simple hides reasoning');
assert.ok(!simpleFeed.lines.some((line) => line.text.indexOf('file = ') === 0), 'simple hides file paths');
assert.ok(simpleFeed.lines.length <= 200, 'simple row cap');
assert.ok(hasText(simpleFeed, '包裝節點也要出現'), 'simple keeps the user line');
assert.ok(hasText(simpleFeed, 'ENOENT'), 'simple keeps tool failures');
assert.ok(!hasText(normalFeed, '系統提示'), 'normal drops the system prompt');
assert.ok(!hasText(normalFeed, 'stdout: done'), 'normal drops tool bodies');
assert.ok(!hasText(normalFeed, '未知節點'), 'normal drops nodes the previous release never showed');
assert.ok(hasText(normalFeed, '第二行系統提示') === false, 'normal keeps the system prompt out');
assert.ok(hasText(fullFeed, '系統提示'), 'full keeps the system prompt');
assert.ok(hasText(fullFeed, 'stdout: done'), 'full keeps tool bodies');
assert.equal(fullFeed.flow, 'full');
assert.equal(simpleFeed.cap, 200);
assert.equal(normalFeed.cap, 200);
assert.ok(!hasText(simpleFeed, '思考中的一行'), 'simple drops reasoning text');
assert.ok(hasText(normalFeed, '思考中的一行'), 'normal keeps reasoning text');
assert.ok(hasText(simpleFeed, '$ node .test/x.mjs'), 'simple keeps the tool call line');
assert.ok(!hasText(simpleFeed, 'command = node .test/x.mjs'), 'simple drops tool arguments');
assert.ok(hasText(normalFeed, 'command = node .test/x.mjs'), 'normal keeps tool arguments');
assert.ok(simpleFeed.lines.length <= normalFeed.lines.length, 'simple is not longer than normal');
assert.ok(normalFeed.lines.length <= fullFeed.lines.length, 'normal is not longer than full');
assert.ok(kindsOf(simpleFeed).length < kindsOf(fullFeed).length, 'simple shows fewer kinds than full');
console.log('flow tiers ok');

// A finished tool call keeps its result inside data.root — no separate tool-result node exists.
const finished = new Map([
  [1, { kind: 'tool-call', seq: 1, data: { root: { kind: 'tool-result', name: 'pwsh', isError: false, content: [{ type: 'text', text: 'stdout: 42 lines\nsecond line' }], call: { name: 'pwsh', argsRaw: JSON.stringify({ command: 'ls' }) } } } }],
  [2, { kind: 'tool-call', seq: 2, data: { root: { kind: 'tool-result', name: 'read', isError: true, error: { message: 'ENOENT: no such file' }, content: [], call: { name: 'read', argsRaw: JSON.stringify({ path: 'a.txt' }) } } } }],
  [3, { kind: 'tool-call', seq: 3, data: { root: { kind: 'tool-result', name: 'grep', content: [], subCalls: [{ name: 'rg', content: [{ type: 'text', text: 'child hit' }] }] } } }],
  [4, { kind: 'question-reply', seq: 4, data: { callId: 'c1', outcome: 'answered', questions: [{ id: 'q1', question: '要哪個主題?' }], answers: [{ id: 'q1', selected: ['終端綠'] }] } }],
]);

const finishedFeed = deriveFeed({ nodes: finished });
const finishedKind = (kind) => finishedFeed.lines.filter((line) => line.kind === kind).map((line) => line.text);
console.log('finished:', finishedFeed.lines.map((line) => line.kind + '|' + line.text));

assert.ok(finishedKind('out').some((text) => text.indexOf('stdout: 42 lines') >= 0), 'successful tool output body');
assert.ok(finishedKind('error').some((text) => text.indexOf('ENOENT') >= 0), 'failed call error line');
assert.ok(finishedKind('out').some((text) => text.indexOf('child hit') >= 0), 'sub-call output');
assert.ok(finishedKind('note').some((text) => text.indexOf('終端綠') >= 0), 'question reply answer');
console.log('finished coverage ok');
