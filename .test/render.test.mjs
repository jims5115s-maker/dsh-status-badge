import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(dir, '..', 'client.js'), 'utf8');

let definition = null;
const appended = [];

globalThis.document = {
  querySelector: () => null,
  head: { appendChild: (tag) => appended.push(tag) },
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
const ReactDOM = { createPortal: (node) => node };
const reactDomClient = { createRoot: () => ({ render: () => {}, unmount: () => {} }) };

globalThis.window.__ModuleLoader__.load = ({ id, factory }) => {
  definition = factory((name) => {
    if (name === 'react') return React;
    if (name === 'react-dom') return ReactDOM;
    if (name === 'react-dom/client') return reactDomClient;
    throw new Error('unexpected require: ' + name);
  });
  definition.id = id;
};

new Function(src)();

if (!definition) throw new Error('module did not register');
if (typeof definition.apply !== 'function') throw new Error('missing apply');
const internals = definition.__internals;
if (!internals) throw new Error('missing internals');

let registration = null;
const noop = () => {};
const ctx = {
  effect: (fn) => {
    const dispose = fn();
    return typeof dispose === 'function' ? dispose : noop;
  },
  locale: { register: () => noop, bind: () => (key) => key },
  slots: {
    inject: (name, run) => {
      run();
    },
    register: (entry, Component) => {
      registration = { entry, Component };
      return noop;
    },
  },
};
definition.apply(ctx);
if (!registration) throw new Error('no slot registration');
console.log('slot:', registration.entry.name, 'id:', registration.entry.id, 'order:', registration.entry.order);

const css = appended[0] ? appended[0].textContent : '';
if (css.indexOf('.SBx9_panel') < 0) throw new Error('panel styles missing');
if (css.indexOf('.SBx9_stream') < 0) throw new Error('stream styles missing');

const assistantStep = (blocks, seq) => ({ kind: 'assistant-step', seq: seq || 1, data: { blocks } });
const toolCall = (root, seq) => ({ kind: 'tool-call', seq: seq || 1, data: { root } });

function render({ running, pending, node, nodes: extraNodes, t }) {
  const nodes = new Map();
  if (extraNodes) extraNodes.forEach((value, index) => nodes.set('x' + index, value));
  if (node) nodes.set('n1', node);
  const props = {
    sessionId: 's1',
    useSession: (selector) => selector({ running }),
    useSessionStatus: (selector) =>
      selector(new Map([['s1', { running, pendingInteraction: pending, completionUnread: false }]])),
    useChat: (selector) => selector({ nodes, order: [], timeline: undefined, navigation: undefined, legacy: undefined }),
    t: t || (() => undefined),
  };
  const tree = registration.Component(props);
  const findPill = (node) => {
    if (node === null || node === void 0 || typeof node !== 'object') return null;
    if (node.props !== void 0 && typeof node.props.className === 'string' && node.props.className.indexOf('SBx9_row') !== -1) return node;
    const kids = Array.isArray(node.children) ? node.children : [];
    for (const kid of kids) {
      const hit = findPill(kid);
      if (hit !== null) return hit;
    }
    return null;
  };
  const button = findPill(tree);
  const labelNode = Array.isArray(button.children)
    ? button.children.find((kid) => kid !== null && typeof kid === 'object' && kid.props !== void 0 && kid.props.className === 'SBx9_label')
    : null;
  return {
    status: button.props['data-status'],
    busy: button.props['data-busy'],
    open: button.props['data-open'],
    expanded: button.props['aria-expanded'],
    label: labelNode === null || labelNode === void 0 ? null : labelNode.children,
    aria: button.props['aria-label'],
    panel: null,
  };
}

const cases = [
  ['idle', { running: false }],
  ['thinking (reasoning block)', { running: true, node: assistantStep([{ kind: 'reasoning', text: 'x' }]) }],
  ['thinking (empty text)', { running: true, node: assistantStep([{ kind: 'text', text: '   ' }]) }],
  ['writing (text)', { running: true, node: assistantStep([{ kind: 'reasoning', text: 'x' }, { kind: 'text', text: 'hi' }]) }],
  ['editing (ops_edit)', { running: true, node: toolCall({ callId: 'c', phase: 'start', name: 'ops_edit' }) }],
  ['tooling (bash)', { running: true, node: toolCall({ callId: 'c', phase: 'start', name: 'bash' }) }],
  ['no nodes while running', { running: true }],
  ['waiting', { running: false, pending: { kind: 'approval' } }],
  [
    'locale hit',
    {
      running: true,
      node: assistantStep([{ kind: 'text', text: 'hi' }]),
      t: (k) => ({ 'status.writing': 'Writing', aria: 'Current activity: {label}' })[k],
    },
  ],
];

for (const [name, fixture] of cases) {
  const out = render(fixture);
  if (out.panel !== null && out.panel !== undefined && out.panel !== false) throw new Error(name + ': panel should start closed');
  if (out.expanded !== false) throw new Error(name + ': aria-expanded should start false');
  console.log(name.padEnd(26), '->', out.status.padEnd(9), '|', out.label, '| busy', out.busy, '|', out.aria);
}

const feed = internals.deriveFeed({
  nodes: new Map([
    ['a', assistantStep([{ kind: 'reasoning', text: '先看插槽宣告，再決定要掛在哪一層。' }], 1)],
    ['b', toolCall({ callId: 'c1', phase: 'start', name: 'ops_grep', argsRaw: '{"pattern":"__ModuleLoader__","path":"node_modules"}' }, 2)],
    ['c', assistantStep([{ kind: 'text', text: '找到載入器了。' }], 3)],
    ['d', toolCall({ callId: 'c2', phase: 'start', name: 'ops_bash', argsRaw: '{"command":"node .test/render.test.mjs"}' }, 4)],
  ]),
});
assertEqual('feed.tool', feed.tool, 'ops_bash');
assertEqual('feed.detail', feed.detail, 'node .test/render.test.mjs');
assertEqual('feed.thinking tail', feed.thinking.slice(-6), '掛在哪一層。');
assertEqual('feed.lines has grep', feed.lines.some((row) => row.text.startsWith('ops_grep')), true);
assertEqual('feed.lines has arg', feed.lines.some((row) => row.text.indexOf('pattern = __ModuleLoader__') !== -1), true);
assertEqual('feed.lines has note', feed.lines.some((row) => row.text === '· 先看插槽宣告，再決定要掛在哪一層。'), true);
assertEqual('feed.lines has answer', feed.lines.some((row) => row.text === '> 找到載入器了。'), true);
assertEqual('feed.lines has cmd', feed.lines.some((row) => row.text.startsWith('$ node')), true);
assertEqual('feed.lines has file', feed.lines.some((row) => row.kind === 'file' && row.text.startsWith('  file =')), true);
assertEqual('feed.lines has stats', feed.lines.some((row) => row.kind === 'dim' && row.text.indexOf('# nodes 4') !== -1), true);
assertEqual('feed.lines tail is stats', feed.lines[feed.lines.length - 1].kind, 'dim');
assertEqual('feed.paths', feed.paths.join(','), 'node_modules');
assertEqual('feed.stats tools', feed.stats.tools, 2);
assertEqual('feed.stats nodes', feed.stats.nodes, 4);

assertEqual('fmtBytes GB', internals.fmtBytes(1610612736), '1.5 GB');
assertEqual('fmtBytes MB', internals.fmtBytes(52428800), '50 MB');
assertEqual('fmtDuration days', internals.fmtDuration(90061), '1d 1h');
assertEqual('toneOf high', internals.toneOf(91), 'error');
assertEqual('toneOf mid', internals.toneOf(70), 'warn');
assertEqual('callPreview truncates', internals.callPreview({ argsRaw: '{"command":"' + 'x'.repeat(400) + '"}' }).length, 160);
assertEqual('callPreview bad json', internals.callPreview({ argsRaw: 'not-json' }), 'not-json');
assertEqual('nodePhase null', internals.nodePhase(null), null);

const stream = internals.createStream();
internals.streamIngest(stream, ['$ node .test/render.test.mjs']);
const seed = () => 'const stamp = Date.now();';
let beats = 0;
while (stream.rows.length === 0 && beats < 200) {
  internals.streamTick(stream, seed, true);
  beats += 1;
}
assertEqual('stream first line', stream.rows.length, 1);
assertEqual('stream first text', stream.rows[0].text, '$ node .test/render.test.mjs');
assertEqual('stream first kind', stream.rows[0].kind, 'real');
assertEqual('stream typed many beats', beats > 5, true);

beats = 0;
while (stream.rows.length === 1 && beats < 400) {
  internals.streamTick(stream, seed, true);
  beats += 1;
}
assertEqual('stream seeded second line', stream.rows.length, 2);
assertEqual('stream second kind', stream.rows[1].kind, 'seed');

const quiet = internals.createStream();
for (let i = 0; i < 34; i += 1) internals.streamTick(quiet, seed, false);
assertEqual('no seed while busy', quiet.target === '' && quiet.rows.length === 0, true);

const bounded = internals.createStream();
for (let i = 0; i < 120; i += 1) bounded.pending.push('line ' + i);
for (let i = 0; i < 6000; i += 1) internals.streamTick(bounded, seed, true);
assertEqual('stream bounded', bounded.rows.length, 80);

function assertEqual(name, actual, expected) {
  if (actual !== expected) throw new Error(name + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  console.log('ok', name, '->', JSON.stringify(actual).slice(0, 80));
}

console.log('all checks passed');
