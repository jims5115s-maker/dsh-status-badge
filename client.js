window.__ModuleLoader__.load({
  id: '@local/status-badge',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;

    const NS = 'statusBadge';
    const CSS_ID = '@local/status-badge/StatusBadge.css';
    const METRICS_URL = '/status-badge/metrics';

    const CSS = [
      '.SBx9_row{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;vertical-align:middle;',
      'padding:1px 8px;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);',
      'line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));white-space:nowrap;',
      'color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;user-select:none}',
      '.SBx9_btn{appearance:none;border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;',
      'border-radius:var(--dsw-radius-sm);padding:1px 8px;transition:background-color .15s ease,color .15s ease}',
      '.SBx9_btn:hover,.SBx9_btn[data-open="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}',
      '.SBx9_btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.SBx9_dot{flex:none;width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);',
      'transition:background-color .18s ease,opacity .18s ease}',
      '.SBx9_row[data-status="idle"] .SBx9_dot{opacity:.5}',
      '.SBx9_row[data-status="thinking"] .SBx9_dot{background:var(--dsw-alias-state-warn-primary)}',
      '.SBx9_row[data-status="writing"] .SBx9_dot{background:var(--dsw-alias-state-success-primary)}',
      '.SBx9_row[data-status="editing"] .SBx9_dot{background:var(--dsw-alias-brand-primary)}',
      '.SBx9_row[data-status="tooling"] .SBx9_dot{background:var(--dsw-alias-brand-primary)}',
      '.SBx9_row[data-status="waiting"] .SBx9_dot{background:var(--dsw-alias-state-warn-primary)}',
      '.SBx9_row[data-status="working"] .SBx9_dot{background:var(--dsw-alias-label-tertiary)}',
      '.SBx9_row[data-busy="true"]{color:var(--dsw-alias-label-secondary)}',
      '.SBx9_row[data-busy="true"] .SBx9_dot{animation:SBx9_pulse 1.6s ease-in-out infinite}',
      '.SBx9_label{min-width:0;overflow:hidden;text-overflow:ellipsis}',
      '.SBx9_caret{flex:none;font-size:9px;opacity:.6;transition:transform .18s ease}',
      '.SBx9_btn[data-open="true"] .SBx9_caret{transform:rotate(180deg)}',
      '@keyframes SBx9_pulse{0%,100%{opacity:1}50%{opacity:.35}}',
      '@media (prefers-reduced-motion:reduce){.SBx9_row[data-busy="true"] .SBx9_dot{animation:none}}',
      '.SBx9_wrap{position:relative;display:inline-flex;align-items:center}',
      '.SBx9_gear{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1;padding:0;width:0;overflow:hidden;opacity:0;cursor:pointer;border-radius:4px;transition:opacity .12s ease,width .12s ease}',
      '.SBx9_wrap:hover .SBx9_gear,.SBx9_gear[data-on="true"]{width:13px;opacity:1}',
      '.SBx9_gear:hover{color:var(--dsw-alias-label-primary)}',
      '.SBx9_sheet{position:absolute;left:0;bottom:calc(100% + 8px);min-width:392px;max-width:min(560px,92vw);max-height:80vh;overflow:auto;padding:8px 10px;display:flex;flex-direction:row;align-items:flex-start;gap:14px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.36);z-index:2147483000}',
      '.SBx9_col{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 0}',
      '.SBx9_alphaRow{display:flex;align-items:center;gap:8px;padding:2px 6px 4px}',
      '.SBx9_alpha{flex:1 1 auto;accent-color:var(--dsw-alias-brand-primary);height:14px}',
      '.SBx9_alphaVal{min-width:34px;text-align:right;font-size:10px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}',
      '.SBx9_dotPick{width:9px;height:9px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2)}',
      '.SBx9_opt[data-on="true"] .SBx9_dotPick{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}',
      '.SBx9_select{width:100%;margin:0 0 2px;padding:5px 7px;font-size:11.5px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;outline:none;cursor:pointer}',
'.SBx9_select:focus-visible{border-color:var(--dsw-alias-brand-primary)}',
'.SBx9_sheetTitle{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary);padding:2px 6px 6px}',
      '.SBx9_opt{appearance:none;border:0;background:transparent;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px;border-radius:6px;cursor:pointer;text-align:left}',
      '.SBx9_opt:hover{background:var(--dsw-alias-bg-layer-2)}',
          '.SBx9_sw{width:26px;height:14px;border-radius:7px;background:var(--dsw-alias-border-l2);position:relative;flex:none;transition:background .12s ease}',
      '.SBx9_sw::after{content:"";position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform .12s ease}',
      '.SBx9_opt[data-on="true"] .SBx9_sw{background:var(--dsw-alias-brand-primary)}',
      '.SBx9_opt[data-on="true"] .SBx9_sw::after{transform:translateX(12px);background:#fff}',

      '.SBx9_panel{position:fixed;z-index:2147483000;box-sizing:border-box;display:flex;flex-direction:column;',
      'gap:8px;padding:10px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);',
      'background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);',
      'box-shadow:0 18px 48px rgba(0,0,0,.34);backdrop-filter:blur(10px);',
      'font-size:12px;line-height:1.45;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain}',
      '.SBx9_panel::-webkit-scrollbar{width:6px}',
      '.SBx9_panel::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l1);border-radius:3px}',
      '.SBx9_head{display:flex;align-items:center;gap:8px;min-width:0}',
      '.SBx9_title{font-weight:600;font-size:12px;letter-spacing:.02em;color:var(--dsw-alias-label-primary)}',
      '.SBx9_headstate{margin-left:auto;display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.SBx9_close{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;',
      'font-size:14px;line-height:1;padding:2px 4px;border-radius:6px}',
      '.SBx9_close:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.SBx9_sec{display:flex;flex-direction:column;gap:5px;min-height:0}',
      '.SBx9_numRow{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.SBx9_numLabel{flex:1 1 auto}',
      '.SBx9_num{width:74px;padding:3px 6px;border-radius:6px;font-size:11px;font-variant-numeric:tabular-nums;',
      'border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.SBx9_seclabel{display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;',
      'color:var(--dsw-alias-label-secondary)}',
      '.SBx9_seclabel::after{content:"";flex:1;height:1px;background:var(--dsw-alias-border-l2)}',
      '.SBx9_work{display:flex;align-items:baseline;gap:6px;min-width:0}',
      '.SBx9_tool{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;',
      'color:var(--dsw-alias-brand-primary)}',
      '.SBx9_detail{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.SBx9_think{max-height:96px;overflow:auto;white-space:pre-wrap;word-break:break-word;',
      'font-size:11.5px;color:var(--dsw-alias-label-secondary);padding-right:2px}',
      '.SBx9_think::-webkit-scrollbar{width:6px}',
      '.SBx9_think::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l1);border-radius:3px}',
      '.SBx9_empty{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}',
      '.SBx9_stream{position:relative;height:132px;overflow-x:hidden;overflow-y:auto;padding:6px 8px;border-radius:8px;',
      'background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:1.6;',
      'color:var(--dsw-alias-state-success-primary);white-space:pre-wrap;word-break:break-all;scrollbar-width:thin}',
      '.SBx9_stream::-webkit-scrollbar{width:6px}',
      '.SBx9_stream::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l1);border-radius:3px}',
      '.SBx9_line{animation:SBx9_in .16s ease-out both}',
      '.SBx9_line[data-kind="seed"]{opacity:.34}',
      '.SBx9_cursor{display:inline-block;width:6px;height:10px;margin-left:2px;vertical-align:-1px;background:currentColor;',
      'animation:SBx9_blink 1s steps(1,end) infinite}',
      '@keyframes SBx9_in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}',
      '@keyframes SBx9_blink{0%,49%{opacity:1}50%,100%{opacity:0}}',
      '.SBx9_meters{display:flex;flex-direction:column;gap:6px}',
      '.SBx9_meter{display:grid;grid-template-columns:44px 1fr 84px;align-items:center;gap:8px;font-size:11px;',
      'color:var(--dsw-alias-label-secondary)}',
      '.SBx9_meterkey{color:var(--dsw-alias-label-tertiary);letter-spacing:.04em}',
      '.SBx9_bar{position:relative;height:6px;border-radius:3px;overflow:hidden;background:var(--dsw-alias-bg-layer-2)}',
      '.SBx9_fill{position:absolute;inset:0 auto 0 0;border-radius:3px;background:var(--dsw-alias-state-success-primary);',
      'transition:width .35s ease}',
      '.SBx9_meter[data-tone="warn"] .SBx9_fill{background:var(--dsw-alias-state-warn-primary)}',
      '.SBx9_meter[data-tone="error"] .SBx9_fill{background:var(--dsw-alias-state-error-primary)}',
      '.SBx9_meter[data-tone="brand"] .SBx9_fill{background:var(--dsw-alias-brand-primary)}',
      '.SBx9_val{text-align:right;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px}',
      '.SBx9_spark{display:flex;align-items:flex-end;gap:1px;height:22px}',
      '.SBx9_sparkbar{flex:1;min-width:1px;border-radius:1px 1px 0 0;background:var(--dsw-alias-state-success-primary);opacity:.55}',
      '.SBx9_facts{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:10.5px;color:var(--dsw-alias-label-tertiary);',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
      '.SBx9_line[data-kind="note"]{opacity:.6;color:var(--dsw-alias-label-secondary)}',
      '.SBx9_line[data-kind="file"]{color:var(--dsw-alias-state-warn-primary)}',
      '.SBx9_win{position:fixed;inset:0;display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;',
      'background:var(--dsw-alias-bg-overlay,#141414);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.45}',
      '.SBx9_winbar{display:flex;align-items:center;gap:8px;padding:5px 8px 5px 10px;flex:none;',
      'border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);',
      'user-select:none;-webkit-app-region:drag}',
      '.SBx9_winctl{margin-left:auto;display:flex;align-items:center;gap:2px;-webkit-app-region:no-drag}',
      '.SBx9_wbtn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;',
      'font:inherit;font-size:11px;line-height:1;padding:4px 7px;border-radius:6px;min-width:26px;text-align:center}',
      '.SBx9_wbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.SBx9_wbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.SBx9_wbtn[data-close="true"]:hover{background:var(--dsw-alias-state-error-primary);color:#fff}',
      '.SBx9_winbody{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;overflow-y:auto;scrollbar-width:thin}',
      '.SBx9_winbody::-webkit-scrollbar{width:6px}',
      '.SBx9_winbody::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l1);border-radius:3px}',
      '.SBx9_winbody .SBx9_stream{flex:1;height:auto;min-height:140px}',
      '.SBx9_winbody .SBx9_think{max-height:120px}',
    ].join('');

    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + CSS_ID + '"]') === null) {
      const tag = document.createElement('style');
      tag.dataset.plugin = '@local/status-badge';
      tag.dataset.pluginCss = CSS_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    const zh = {
      'status.idle': '閒置中',
      'status.thinking': '思考中',
      'status.writing': '編寫中',
      'status.editing': '修改中',
      'status.tooling': '執行工具中',
      'status.working': '處理中',
      'status.waiting': '等你回應',
      'aria': '目前動態：{label}',
      'toggle': '展開監控面板',
      'panel.title': '即時監控',
      'panel.close': '關閉',
      'panel.work': '目前工作',
      'panel.think': '思考',
      'panel.code': '程式碼流',
      'panel.hardware': '硬體',
      'panel.nothing': '目前沒有新的動態',
      'panel.thinking.none': '（這一輪還沒有思考內容）',
      'panel.hw.waiting': '正在讀取主機資訊…',
      'panel.hw.error': '讀不到主機資訊（{message}）',
      'panel.cpu': 'CPU',
      'panel.mem': '記憶體',
      'panel.uptime': '運行',
      'panel.addr': '代理',
      'panel.tool': '工具',
      'panel.opacity': '透明度',
      'panel.maximize': '放到最大',
      'panel.restore': '還原視窗',
      'panel.stat.nodes': '節點',
      'panel.stat.tools': '工具',
      'panel.stat.lines': '行',
      'panel.stat.paths': '檔案',
      'settings.title': '設定',
      'settings.label': '顯示狀態文字',
      'settings.pulse': '忙碌時脈動',
      'settings.notify': '這輪結束時通知',
      'settings.inline': '內嵌顯示（視窗看不到時用）',
      'settings.windowLayer': '視窗圖層',
      'settings.top': '置頂（最上層）',
          'settings.normal': '一般',
      'settings.lock': '鎖定視窗（不可拖動 + 滑鼠穿透）',
            'settings.opacity': '透明度',
        };
    const en = {
      'status.idle': 'Idle',
      'status.thinking': 'Thinking',
      'status.writing': 'Writing',
      'status.editing': 'Editing files',
      'status.tooling': 'Running a tool',
      'status.working': 'Working',
      'status.waiting': 'Waiting for you',
      'aria': 'Current activity: {label}',
      'toggle': 'Open the monitor panel',
      'panel.title': 'Live monitor',
      'panel.close': 'Close',
      'panel.work': 'Current work',
      'panel.think': 'Thinking',
      'panel.code': 'Code stream',
      'panel.hardware': 'Hardware',
      'panel.nothing': 'Nothing new yet',
      'panel.thinking.none': '(no reasoning in this turn yet)',
      'panel.hw.waiting': 'Reading host metrics…',
      'panel.hw.error': 'Host metrics unavailable ({message})',
      'panel.cpu': 'CPU',
      'panel.mem': 'Memory',
      'panel.uptime': 'Uptime',
      'panel.addr': 'Agent',
      'panel.tool': 'Tool',
      'panel.opacity': 'Opacity',
      'panel.maximize': 'Maximize',
      'panel.restore': 'Restore',
      'panel.stat.nodes': 'nodes',
      'panel.stat.tools': 'tools',
      'panel.stat.lines': 'lines',
      'panel.stat.paths': 'paths',
      'settings.title': 'Settings',
      'settings.label': 'Show status text',
      'settings.pulse': 'Pulse while busy',
      'settings.notify': 'Notify when the turn ends',
      'settings.inline': 'Inline panel (when the window is invisible)',
      'settings.windowLayer': 'Window layer',
      'settings.top': 'Always on top',
          'settings.normal': 'Normal',
      'settings.lock': 'Lock window (no drag + click-through)',
            'settings.opacity': 'Opacity',
        };

    const FALLBACK = {
      idle: '閒置中',
      thinking: '思考中',
      writing: '編寫中',
      editing: '修改中',
      tooling: '執行工具中',
      working: '處理中',
      waiting: '等你回應',
    };

    const EDIT_TOOLS = /(edit|write|patch|write_file|edit_file|str_replace|apply_patch|notebook_edit|multi_edit)/;
    const PREVIEW_KEYS = [
      'command',
      'cmd',
      'file_path',
      'filePath',
      'path',
      'pattern',
      'query',
      'url',
      'description',
      'prompt',
      'target',
      'name',
    ];
    const PATH_KEYS = ['file_path', 'filePath', 'path', 'target', 'url'];
    const CODE_SEEDS = [
      'const stamp = Date.now();',
      'ctx.slots.register({ name, id, order });',
      'await fetch(METRICS_URL, { cache: "no-store" });',
      'for (const node of snapshot.nodes.values()) {}',
      'if (!running) return "idle";',
      'export function apply(ctx, config) {}',
      'history.push(cpu); while (history.length > LIMIT) history.shift();',
      'res.writeHead(200, { "content-type": "application/json" });',
      'ctx.effect(() => ctx.locale.register(NS, { zh, en }));',
      'type ChatNodeKind = "assistant-step" | "tool-call";',
      'const blocks = node.data?.blocks ?? [];',
      'npm run build --if-present',
      'git status --short',
      'const [state, setState] = React.useState(null);',
      'useEffect(() => { const id = setInterval(tick, 26); return () => clearInterval(id); }, []);',
      'function clampText(value, limit) { return value.length > limit ? value.slice(-limit) : value; }',
      'const rows = rec.rows.slice(-STREAM_LIMIT);',
      'if (rec.typed.length < rec.target.length) rec.typed = rec.target.slice(0, n);',
      'const percent = Math.max(0, Math.min(100, value));',
      'el.style.setProperty("--dsw-alias-bg-overlay", token);',
      'const req = new Request(url, { method: "GET", cache: "no-store" });',
      'for (let i = 0; i < cores; i += 1) acc += deltas[i];',
      'const used = total - free; const ratio = used / total;',
      'await new Promise((resolve) => setTimeout(resolve, 26));',
      'module.exports = { createStream, streamTick };',
      'interface ToolCallRoot { callId: string; name: string; argsRaw: string }',
      'switch (block.kind) { case "reasoning": break; case "text": break; }',
      'registry.set(sessionId, snapshot); if (registry.size > 32) prune();',
      'throw new Error("locale namespace already has locale");',
      'assert.equal(feed.lines.length, 240);',
      'diff --git a/client.js b/client.js',
      '@@ -418,6 +418,9 @@ function createStream() {',
      '+  const rec = createStream();',
      '-  const items = [];',
      '  if (disabled) return undefined;',
      '  return () => { win.removeEventListener("unload", onUnload); };',
      'const target = doc.body.appendChild(mount);',
      'win.resizeTo(screen.availWidth, screen.availHeight);',
      'root.style.setProperty("--dsw-alias-label-primary", fg);',
      'await fs.writeText(target, content, { version });',
      'spawn("node", ["--test", ".test/render.test.mjs"]);',
      'grep -rn "SBx9_" client.js | wc -l',
      'curl -s http://127.0.0.1:<port>/status-badge/metrics | jq .cpuPct',
      'const snapshot = { nodes: new Map(), order: [] };',
      'snapshot.legacy?.nodes?.values?.() ?? [];',
      'type Tone = "ok" | "warn" | "error";',
      'if (alpha < 1) root.style.opacity = String(alpha);',
      'window.close(); // popup teardown',
      'export const inject = ["webServer"];',
      'ctx.webServer.register({ kind: "exact", path: "/status-badge/metrics", handler });',
      'JSON.stringify({ at, cpuPct, memUsed, memTotal }, null, 0)',
      'const id = "dsh-status-monitor";',
    ];

    /** Flatten message content: plain strings, block arrays, and `{ text }` wrappers all read the same. */
    function textOf(value) {
      if (typeof value === 'string') return value;
      if (Array.isArray(value)) {
        const parts = [];
        for (const part of value) {
          const text = textOf(part);
          if (text !== '') parts.push(text);
        }
        return parts.join('\\n');
      }
      if (value !== null && typeof value === 'object') {
        if (typeof value.text === 'string') return value.text;
        if (value.content !== void 0) return textOf(value.content);
        if (typeof value.message === 'string') return value.message;
      }
      return '';
    }

    function clampText(value, limit) {
      const text = textOf(value);
      return text.length > limit ? text.slice(text.length - limit) : text;
    }

    function oneLine(value, limit) {
      return textOf(value).replace(/\s+/g, ' ').trim().slice(0, limit);
    }

    /** Chat nodes wrap their payload in `data`; flat fixtures and older builds keep it on the node. */
    function dataOf(node) {
      if (node === null || typeof node !== 'object') return {};
      const data = node.data;
      return data !== null && typeof data === 'object' && !Array.isArray(data) ? data : node;
    }

    /** Read one payload field whichever layer the build puts it on. */
    function fieldOf(node, key) {
      const data = dataOf(node);
      if (node !== null && typeof node === 'object' && node !== data && node[key] !== void 0) return node[key];
      return data[key];
    }

    function toolNameOf(call) {
      if (call === null || typeof call !== 'object') return '';
      return textOf(call.name) || textOf(call.toolName) || textOf(call.tool) || textOf(call.title);
    }

    /** Classify one pending tool call root into editing vs. generic tooling. */
    function toolPhase(call) {
      if (call === null || typeof call !== 'object') return 'tooling';
      if ('kind' in call) return 'tooling';
      const name = toolNameOf(call).toLowerCase();
      if (name === '') return 'tooling';
      return EDIT_TOOLS.test(name) ? 'editing' : 'tooling';
    }

    /** Classify one Chat node into a status id, or null when it says nothing. */
    function nodePhase(node) {
      if (node === null || typeof node !== 'object') return null;
      const kind = node.kind;
      const data = node.data === null || typeof node.data !== 'object' ? {} : node.data;

      if (kind === 'tool-call') return toolPhase(data.root);
      if (kind === 'user' || kind === 'command' || kind === 'input') return 'thinking';
      if (kind === 'assistant-step') {
        const blocks = Array.isArray(data.blocks) ? data.blocks : [];
        for (let i = blocks.length - 1; i >= 0; i -= 1) {
          const block = blocks[i];
          if (block === null || typeof block !== 'object') continue;
          if (block.kind === 'reasoning') {
            return 'thinking';
          }
          if (block.kind === 'text') {
            return textOf(block.text).trim() === '' ? 'thinking' : 'writing';
          }
          if (block.kind === 'tool-call') return toolPhase(block);
          if (block.kind === 'image') return 'working';
        }
        return 'thinking';
      }
      return null;
    }

    function nodesOf(snapshot) {
      if (snapshot === null || typeof snapshot !== 'object') return [];
      const nodes = snapshot.nodes;
      if (nodes === null || typeof nodes !== 'object' || typeof nodes.values !== 'function') return [];
      const out = [];
      for (const node of nodes.values()) {
        if (node !== null && typeof node === 'object') out.push(node);
      }
      return out;
    }

    /** Newest Chat node in the map; insertion order is the fallback when seq is absent. */
    function lastNode(snapshot) {
      let last = null;
      let lastSeq = -Infinity;
      for (const node of nodesOf(snapshot)) {
        const seq = typeof node.seq === 'number' ? node.seq : NaN;
        if (Number.isNaN(seq)) {
          last = node;
          lastSeq = -Infinity;
          continue;
        }
        if (last === null || seq >= lastSeq) {
          last = node;
          lastSeq = seq;
        }
      }
      return last;
    }

    function resolvePhase(snapshot) {
      return nodePhase(lastNode(snapshot)) || null;
    }

    function parseArgs(raw) {
      if (typeof raw !== 'string' || raw.trim() === '') return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed !== null && typeof parsed === 'object' ? parsed : null;
      } catch {
        return null;
      }
    }

    function callPreview(call) {
      if (call === null || typeof call !== 'object') return '';
      const args = parseArgs(call.argsRaw);
      if (args !== null) {
        for (const key of PREVIEW_KEYS) {
          const value = args[key];
          if (typeof value === 'string' && value.trim() !== '') return oneLine(value, 160);
        }
      }
      return oneLine(call.argsRaw, 160);
    }

    /** One line summarising why a tool call failed. */
    function errorTextOf(node) {
      const squeeze = (value) => String(value).replace(/\s+/g, ' ').trim().slice(0, 160);
      const error = node === null || typeof node !== 'object' ? null : fieldOf(node, 'error');
      if (typeof error === 'string' && error.trim() !== '') return squeeze(error);
      if (error !== null && typeof error === 'object') {
        if (typeof error.message === 'string' && error.message.trim() !== '') return squeeze(error.message);
        if (typeof error.code === 'string' && error.code.trim() !== '') return squeeze(error.code);
      }
      const content = node === null || typeof node !== 'object' ? null : fieldOf(node, 'content');
      if (typeof content === 'string' && content.trim() !== '') return squeeze(content);
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part !== null && typeof part === 'object' && typeof part.text === 'string' && part.text.trim() !== '') {
            return squeeze(part.text);
          }
        }
      }
      return '';
    }

    /** One scrollable line of real work for the code stream. */
    function callLine(node) {
      const data = node.data === null || typeof node.data !== 'object' ? {} : node.data;
      const call = data.root !== null && typeof data.root === 'object' ? data.root : null;
      if (call === null) return '';
      const name = toolNameOf(call);
      const preview = callPreview(call);
      if (preview === '') return name === '' ? '' : name;
      const lower = name.toLowerCase();
      const isShell =
        lower.indexOf('bash') >= 0 ||
        lower.indexOf('shell') >= 0 ||
        lower.indexOf('pwsh') >= 0 ||
        lower.indexOf('powershell') >= 0 ||
        lower === 'sh' ||
        lower === 'cmd' ||
        lower === 'zsh';
      const head = name === '' || isShell ? '$' : name;
      return oneLine(head + ' ' + preview, 200);
    }

    function blocksOf(node) {
      const data = node === null || typeof node !== 'object' || node.data === null || typeof node.data !== 'object' ? null : node.data;
      const blocks = data === null ? null : data.blocks;
      return Array.isArray(blocks) ? blocks : null;
    }

    /**
     * Everything the panel shows about the running turn: the current line of work,
     * the newest reasoning tail, and the last real commands for the code stream.
     */
    function pathsOf(call) {
      const args = call === null || typeof call !== 'object' ? null : parseArgs(call.argsRaw);
      if (args === null) return [];
      const found = [];
      for (const key of PATH_KEYS) {
        const value = args[key];
        if (typeof value === 'string' && value.trim() !== '') found.push(value.trim());
        if (Array.isArray(value)) {
          for (const item of value) if (typeof item === 'string' && item.trim() !== '') found.push(item.trim());
        }
      }
      for (const key of ['command', 'cmd', 'script', 'query', 'prompt']) {
        const text = args[key];
        if (typeof text !== 'string') continue;
        const re = /(?:^|[\s"'(=])([A-Za-z]:\\[^\s"'|<>)]+|(?:\.{1,2}\/)[^\s"'|<>)]+)/g;
        let hit = re.exec(text);
        let guard = 0;
        while (hit !== null && guard < 8) {
          const candidate = String(hit[1]).replace(/[),.;]+$/, '');
          if (candidate.length >= 3 && candidate.length <= 200) found.push(candidate);
          guard += 1;
          hit = re.exec(text);
        }
      }
      return found;
    }

    /**
     * Everything the panel shows about the running turn: the current line of work,
     * the newest reasoning tail, the last real commands, and the touched paths.
     */
    function sessionTokens(snapshot) {
      const out = { total: 0, input: 0, output: 0, cacheRead: 0 };
      const seen = new WeakSet();
      function num(value) {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
      }
      function measure(node) {
        if (node === null || typeof node !== 'object') return null;
        const hasTotal = typeof node.totalTokens === 'number';
        const hasParts =
          typeof node.outputTokens === 'number' ||
          typeof node.uncachedInputTokens === 'number' ||
          typeof node.inputTokens === 'number';
        if (!hasTotal && !hasParts) return null;
        const input = num(node.uncachedInputTokens !== undefined ? node.uncachedInputTokens : node.inputTokens);
        const cacheRead = num(node.cacheReadTokens);
        const output = num(node.outputTokens);
        const total = hasTotal ? num(node.totalTokens) : input + cacheRead + output;
        if (total <= 0) return null;
        return { total: total, input: input, cacheRead: cacheRead, output: output };
      }
      function take(node) {
        if (node === null || typeof node !== 'object' || seen.has(node)) return;
        seen.add(node);
        const viaData =
          node.data !== null && typeof node.data === 'object' && node.data.tokenUsage !== null && typeof node.data.tokenUsage === 'object'
            ? node.data.tokenUsage
            : null;
        const fromData = measure(viaData);
        if (fromData !== null) {
          out.total += fromData.total;
          out.input += fromData.input;
          out.cacheRead += fromData.cacheRead;
          out.output += fromData.output;
          return;
        }
        const fromNode = measure(node);
        if (fromNode !== null) {
          out.total += fromNode.total;
          out.input += fromNode.input;
          out.cacheRead += fromNode.cacheRead;
          out.output += fromNode.output;
          return;
        }
        if (Array.isArray(node)) {
          for (const item of node) take(item);
          return;
        }
        for (const key of Object.keys(node)) {
          if (key === 'root' || key === 'data' || key === 'blocks' || key === 'usage' || key === 'attempts' || key === 'turn') take(node[key]);
        }
      }
      if (snapshot !== null && typeof snapshot === 'object') {
        const nodes = snapshot.nodes;
        if (nodes !== null && typeof nodes === 'object' && typeof nodes.forEach === 'function') nodes.forEach((node) => take(node));
      }
      return out;
    }
    const RATE_DEFAULT = { input: 2, cache: 0.2, output: 3 };
    function normRates(raw) {
      const src = raw !== null && typeof raw === 'object' ? raw : {};
      const pick = (key) => {
        const value = Number(src[key]);
        return Number.isFinite(value) && value >= 0 ? Math.round(value * 1000) / 1000 : RATE_DEFAULT[key];
      };
      return { input: pick('input'), cache: pick('cache'), output: pick('output') };
    }
    function spendOf(usage, rates) {
      const view = usage !== null && typeof usage === 'object' ? usage : {};
      const rate = normRates(rates);
      const input = Number.isFinite(view.input) ? view.input : 0;
      const cache = Number.isFinite(view.cacheRead) ? view.cacheRead : 0;
      const output = Number.isFinite(view.output) ? view.output : 0;
      const amount = (input * rate.input + cache * rate.cache + output * rate.output) / 1000000;
      return Math.round(amount * 10000) / 10000;
    }
    function deriveFeed(snapshot, flow) {
      const mode = flow === 'simple' || flow === 'normal' ? flow : 'full';
      const maxTier = mode === 'simple' ? 0 : mode === 'normal' ? 1 : 2;
      // Row budget is identical in all three modes; only the kinds of lines differ.
      const cap = 200;
      const orderOf = (node) => {
        if (typeof node.seq === 'number') return node.seq;
        if (typeof node.anchorSeq === 'number') return node.anchorSeq;
        return -1;
      };
      const nodes = nodesOf(snapshot).sort((a, b) => orderOf(a) - orderOf(b));

      let thinking = '';
      let answer = '';
      let call = null;
      let tools = 0;
      const kinds = {};
      const lines = [];
      const paths = [];
      const dumpText = (value, kind, limit, tier) => {
        const text = textOf(value);
        if (text.trim() === '') return;
        const rows = text.split('\n');
        let used = 0;
        for (const row of rows) {
          const clean = row.trim().slice(0, 150);
          if (clean === '') continue;
          if (used >= limit) {
            lines.push({ text: '  … 另有 ' + (rows.length - used) + ' 行', kind: 'dim', tier: tier || 0 });
            return;
          }
          used += 1;
          lines.push({ text: '  ' + clean, kind: kind, tier: tier || 0 });
        }
      };

      for (const node of nodes) {
        const kindKey = typeof node.kind === 'string' && node.kind !== '' ? node.kind.slice(0, 24) : '?';
        kinds[kindKey] = (kinds[kindKey] || 0) + 1;
        if (node.kind === 'turn-error') {
          const errData = node.data !== null && typeof node.data === 'object' ? node.data : {};
          const rawMsg = node.message !== void 0 ? node.message : (errData.message !== void 0 ? errData.message : (errData.error !== void 0 ? errData.error : errData.reason));
          const msg = rawMsg === void 0 || rawMsg === null ? '' : oneLine(String(typeof rawMsg === 'object' && rawMsg !== null && rawMsg.message !== void 0 ? rawMsg.message : rawMsg), 160);
          const rawCode = node.code !== void 0 ? node.code : errData.code;
          const code = rawCode === void 0 || rawCode === null || String(rawCode) === '' ? '' : ' [' + String(rawCode) + ']';
          lines.push({ text: '! 本輪錯誤' + code + (msg === '' ? '' : '：' + msg), kind: 'error' });
          continue;
        }
        if (node.kind === 'turn-max-tokens') {
          lines.push({ text: '! 已達 token 上限，本輪被截斷', kind: 'error' });
          continue;
        }
        if (node.kind === 'model-retry') {
          const state = typeof fieldOf(node, 'retryState') === 'string' ? fieldOf(node, 'retryState') : 'scheduled';
          const reason = errorTextOf(node);
          lines.push({ text: '~ 模型重試（' + state + '）' + (reason === '' ? '' : '：' + reason), kind: 'dim' });
          continue;
        }
        if (node.kind === 'compaction') {
          const tok = Number(fieldOf(node, 'shadowedTokenCount'));
          const label = Number.isFinite(tok) && tok > 0 ? '（' + Math.round(tok / 1000) + 'k tok）' : '';
          lines.push({ text: '↺ 上下文壓縮' + label, kind: 'dim' });
          continue;
        }
        if (node.kind === 'command') {
          const name = typeof fieldOf(node, 'name') === 'string' ? fieldOf(node, 'name') : typeof fieldOf(node, 'command') === 'string' ? fieldOf(node, 'command') : '';
          const args = typeof fieldOf(node, 'args') === 'string' ? oneLine(fieldOf(node, 'args'), 100) : '';
          lines.push({ text: '› /' + (name === '' ? 'command' : name) + (args === '' ? '' : ' ' + args), kind: 'cmd' });
          continue;
        }
        if (node.kind === 'user') {
          const text = textOf(fieldOf(node, 'text') !== void 0 ? fieldOf(node, 'text') : fieldOf(node, 'content')).trim();
          if (text !== '') lines.push({ text: '› 你：' + oneLine(text, 120), kind: 'note' });
          continue;
        }
        if (node.kind === 'steering') {
          const said = textOf(fieldOf(node, 'content')).trim();
          if (said !== '') lines.push({ text: '› 你（插話）：' + oneLine(said, 120), kind: 'note', tier: 2 });
          continue;
        }
        if (node.kind === 'question-reply') {
          const list = fieldOf(node, 'questions');
          const picked = fieldOf(node, 'answers');
          const rows = Array.isArray(list) ? list : [];
          const given = Array.isArray(picked) ? picked : [];
          if (rows.length === 0) {
            lines.push({ text: '› 你（回覆提問）', kind: 'note', tier: 1 });
            continue;
          }
          for (const row of rows.slice(0, 6)) {
            const ask = row !== null && typeof row === 'object' ? oneLine(typeof row.question === 'string' ? row.question : '', 50) : '';
            const answer = given.find((item) => item !== null && typeof item === 'object' && item.id === (row !== null && typeof row === 'object' ? row.id : ''));
            const values = [];
            if (answer !== void 0 && Array.isArray(answer.selected)) {
              for (const value of answer.selected) if (typeof value === 'string' && value.trim() !== '') values.push(value.trim());
            }
            if (answer !== void 0 && typeof answer.custom === 'string' && answer.custom.trim() !== '') values.push(answer.custom.trim());
            const said = values.length === 0 ? '（略過）' : oneLine(values.join(' / '), 60);
            lines.push({ text: '› 你（答）' + (ask === '' ? '' : ' ' + ask) + ' → ' + said, kind: 'note', tier: 1 });
          }
          continue;
        }
        if (node.kind === 'context') {
          const producer = fieldOf(node, 'producer');
          const label = producer !== null && typeof producer === 'object' && typeof producer.label === 'string' ? producer.label : '';
          const role = producer !== null && typeof producer === 'object' && typeof producer.role === 'string' ? producer.role : 'inject';
          const head = label === '' ? '⌁ 注入' : '⌁ ' + label + ' 注入';
          const first = oneLine(textOf(fieldOf(node, 'content')), 120);
          lines.push({ text: head + (first === '' ? '' : '：' + first), kind: role === 'recall' ? 'note' : 'dim', tier: 2 });
          continue;
        }
        if (node.kind === 'system-prompt' || node.kind === 'system-message') {
          const text = textOf(fieldOf(node, 'text'));
          if (text.trim() === '') continue;
          const count = text.split('\n').filter((row) => row.trim() !== '').length;
          const updated = fieldOf(node, 'update') === true ? '（更新）' : '';
          lines.push({ text: '◈ 系統提示 ' + text.length + ' 字 · ' + count + ' 行' + updated, kind: 'cmd', tier: 2 });
          dumpText(text, 'out', 400, 2);
          continue;
        }
        if (node.kind === 'turn-trigger') {
          lines.push({ text: '▸ 新一輪開始', kind: 'dim', tier: 2 });
          continue;
        }
        if (node.kind === 'turn-process') {
          lines.push({ text: '▸ 工具程序', kind: 'dim', tier: 2 });
          continue;
        }
        if (node.kind === 'unknown') {
          lines.push({ text: '? 未知節點', kind: 'dim', tier: 2 });
          continue;
        }
        if (node.kind === 'tool-result') {
          const rawName = fieldOf(node, 'name');
          const who = typeof rawName === 'string' && rawName !== '' ? rawName : 'tool';
          const error = fieldOf(node, 'error');
          const failed = fieldOf(node, 'isError') === true || (error !== null && error !== void 0);
          if (failed) {
            const errText = errorTextOf(node);
            lines.push({ text: '! ' + who + ' 失敗' + (errText === '' ? '' : '：' + errText), kind: 'error' });
          }
          const body = textOf(fieldOf(node, 'content')).trim();
          if (body !== '') {
            lines.push({ text: '← ' + who + (failed ? '（失敗內容）' : ''), kind: 'out', tier: 2 });
            dumpText(body, 'out', 200, 2);
          }
          continue;
        }
        if (node.kind === 'tool-call') {
          tools += 1;
          const data = node.data !== null && typeof node.data === 'object' ? node.data : null;
          const root = data === null ? null : data.root;
          const name = root !== null && typeof root === 'object' ? toolNameOf(root) : '';
          const line = callLine(node);
          if (line !== '') lines.push({ text: line, kind: line.charAt(0) === '$' ? 'cmd' : 'file', tier: 0 });
          const args = root !== null && typeof root === 'object' ? parseArgs(root.argsRaw) : null;
          if (args !== null) {
            const keys = Object.keys(args).slice(0, 10);
            for (const key of keys) {
              const value = args[key];
              if (typeof value === 'string' && value.trim() !== '') {
                const rows = value.trim().split('\n').slice(0, 8);
                for (const row of rows) lines.push({ text: '  ' + key + ' = ' + row.slice(0, 150), kind: 'out', tier: 1 });
              } else if (typeof value === 'number' || typeof value === 'boolean') {
                lines.push({ text: '  ' + key + ' = ' + String(value), kind: 'out', tier: 1 });
              }
            }
          }
          for (const path of pathsOf(root)) if (paths.indexOf(path) === -1) paths.push(path);
          if (root !== null && typeof root === 'object' && name !== '') call = root;
          // A finished call keeps its result inside the same node: data.root.kind === 'tool-result'.
          if (root !== null && typeof root === 'object' && root.kind === 'tool-result') {
            const who = name === '' ? 'tool' : name;
            const failed = root.isError === true || (root.error !== null && root.error !== void 0);
            if (failed) {
              const errText = errorTextOf(root);
              lines.push({ text: '! ' + who + ' 失敗' + (errText === '' ? '' : '：' + errText), kind: 'error' });
            }
            const body = textOf(root.content).trim();
            if (body !== '') {
              lines.push({ text: '← ' + who + (failed ? '（失敗內容）' : ''), kind: 'out', tier: 2 });
              dumpText(body, 'out', 40, 2);
            }
            const children = Array.isArray(root.subCalls) ? root.subCalls : [];
            for (const child of children) {
              if (child === null || typeof child !== 'object') continue;
              const childName = toolNameOf(child);
              const childFailed = child.isError === true || (child.error !== null && child.error !== void 0);
              lines.push({
                text: '  ' + (childFailed ? '!' : '⇢') + ' ' + (childName === '' ? '子呼叫' : childName) + (childFailed ? ' 失敗' : ''),
                kind: childFailed ? 'error' : 'out',
                tier: 2,
              });
              const childBody = textOf(child.content).trim();
              if (childBody !== '') dumpText(childBody, 'out', 20, 2);
            }
          }
          continue;
        }
        if (node.kind !== 'assistant-step') continue;
        const blocks = blocksOf(node);
        if (blocks === null) continue;
        for (const block of blocks) {
          if (block === null || typeof block !== 'object') continue;
          if (block.kind === 'reasoning' && textOf(block.text).trim() !== '') {
            thinking = textOf(block.text);
            const rows = textOf(block.text)
              .split('\n')
              .map((row) => row.trim())
              .filter((row) => row !== '')
              .slice(-18);
            for (const row of rows) lines.push({ text: '· ' + row.slice(0, 170), kind: 'note', tier: 1 });
          }
          if (block.kind === 'text' && textOf(block.text).trim() !== '') {
            answer = textOf(block.text);
            const rows = textOf(block.text)
              .split('\n')
              .map((row) => row.trim())
              .filter((row) => row !== '')
              .slice(-12);
            for (const row of rows) lines.push({ text: '> ' + row.slice(0, 180), kind: 'out', tier: 1 });
          }
        }
      }

      for (const path of paths.slice(-20)) lines.push({ text: '  file = ' + path, kind: 'file', tier: 1 });
      lines.push({ text: '  # nodes ' + nodes.length + ' · tools ' + tools + ' · paths ' + paths.length, kind: 'dim' });
      const ranked = Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a]);
      if (ranked.length > 0) {
        const shown = ranked.slice(0, 8).map((name) => name + ' ' + kinds[name]).join(' · ');
        const more = ranked.length > 8 ? ' · …另有 ' + (ranked.length - 8) + ' 類' : '';
        lines.push({ text: '  # kinds ' + shown + more, kind: 'dim', tier: 1 });
      }

      const visible = [];
      for (const line of lines) {
        if ((line.tier || 0) > maxTier) continue;
        visible.push({ text: line.text, kind: line.kind });
      }

      return {
        thinking: clampText(thinking, 2400),
        answer: clampText(answer, 800),
        tool: call === null ? '' : toolNameOf(call),
        detail: call === null ? '' : callPreview(call),
        lines: visible.slice(-cap),
        flow: mode,
        cap: cap,
        paths: paths.slice(-12),
        stats: { nodes: nodes.length, tools: tools, kinds: kinds },
      };
    }

    function labelFor(status, t, key, fallback) {
      const name = key || 'status.' + status;
      let value;
      try {
        value = typeof t === 'function' ? t(name) : undefined;
      } catch {
        value = undefined;
      }
      if (typeof value !== 'string' || value === '' || value === name) return fallback !== undefined ? fallback : FALLBACK[status] || FALLBACK.working;
      return value;
    }

    function fmtBytes(bytes) {
      const value = typeof bytes === 'number' && isFinite(bytes) ? bytes : 0;
      if (value >= 1024 * 1024 * 1024) return (value / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
      if (value >= 1024 * 1024) return (value / (1024 * 1024)).toFixed(0) + ' MB';
      return (value / 1024).toFixed(0) + ' KB';
    }

    function fmtDuration(seconds) {
      const total = typeof seconds === 'number' && isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      if (days > 0) return days + 'd ' + hours + 'h';
      if (hours > 0) return hours + 'h ' + minutes + 'm';
      return minutes + 'm';
    }

    function toneOf(percent) {
      if (percent >= 85) return 'error';
      if (percent >= 60) return 'warn';
      return 'ok';
    }

    function Meter(props) {
      const value = props.value;
      const percent = Math.max(0, Math.min(100, typeof value === 'number' && isFinite(value) ? value : 0));
      return h(
        'div',
        { className: 'SBx9_meter', 'data-tone': props.tone || toneOf(percent) },
        h('span', { className: 'SBx9_meterkey' }, props.label),
        h('span', { className: 'SBx9_bar' }, h('i', { className: 'SBx9_fill', style: { width: percent.toFixed(1) + '%' } })),
        h('span', { className: 'SBx9_val' }, props.readout),
      );
    }

    /**
     * Terminal-style code stream: real session commands are typed out one line at
     * a time and stack upward; when the turn is quiet a seeded line keeps it alive.
     */
    const STREAM_LIMIT = 80;

    function createStream() {
      return { rows: [], pending: [], seen: new Set(), target: '', typed: '', kind: '', hold: 0, idle: 0, seq: 0 };
    }

    function streamIngest(rec, source) {
      if (!Array.isArray(source)) return;
      for (const entry of source) {
        const object = entry !== null && typeof entry === 'object';
        const text = object ? textOf(entry.text) : textOf(entry);
        if (text.trim() === '') continue;
        if (rec.seen.has(text)) continue;
        rec.seen.add(text);
        rec.pending.push({ text: text, kind: object && textOf(entry.kind) !== '' ? entry.kind : 'real' });
      }
    }

    function seedLine() {
      return CODE_SEEDS[Math.floor(Math.random() * CODE_SEEDS.length)];
    }

    /** One 26ms beat: finish the live line, or start typing the next queued one. */
    function streamTick(rec, seed, allowSeed) {
      if (rec.target === '') {
        if (rec.hold > 0) {
          rec.hold -= 1;
          return;
        }
        if (rec.pending.length > 0) {
          const next = rec.pending.shift();
          const entry = next !== null && typeof next === 'object' ? next : null;
          rec.target = entry === null ? textOf(next) : textOf(entry.text);
          rec.typed = '';
          rec.kind = entry === null || textOf(entry.kind) === '' ? 'real' : entry.kind;
          rec.idle = 0;
        } else if (allowSeed === true) {
          rec.idle += 1;
          if (rec.idle > 34) {
            rec.idle = 0;
            rec.target = seed();
            rec.typed = '';
            rec.kind = 'seed';
          }
        }
      }
      if (rec.target === '') return;
      if (rec.typed.length < rec.target.length) {
        const step = Math.max(1, Math.ceil(rec.target.length / 22));
        rec.typed = rec.target.slice(0, rec.typed.length + step);
        return;
      }
      rec.seq += 1;
      rec.rows.push({ id: rec.seq, text: rec.target, kind: rec.kind });
      if (rec.rows.length > STREAM_LIMIT) rec.rows.splice(0, rec.rows.length - STREAM_LIMIT);
      rec.target = '';
      rec.typed = '';
      rec.kind = '';
      rec.hold = 3;
    }

    function CodeStream(props) {
      const source = Array.isArray(props.lines) ? props.lines : [];
      const [view, setView] = React.useState({ rows: [], typed: '' });
      const boxRef = React.useRef(null);
      const sourceRef = React.useRef(source);
      sourceRef.current = source;

      React.useEffect(() => {
        const rec = createStream();
        streamIngest(rec, sourceRef.current);
        streamTick(rec, seedLine, true);
        setView({ rows: rec.rows.slice(-STREAM_LIMIT), typed: rec.typed });

        const timer = window.setInterval(() => {
          streamIngest(rec, sourceRef.current);
          streamTick(rec, seedLine, true);
          setView({ rows: rec.rows.slice(-STREAM_LIMIT), typed: rec.typed });
        }, 26);

        return () => window.clearInterval(timer);
      }, []);

      React.useEffect(() => {
        const box = boxRef.current;
        if (box !== null && typeof box.scrollHeight === 'number') box.scrollTop = box.scrollHeight;
      }, [view]);

      const rows = view.rows.map((row) =>
        h('div', { key: row.id, className: 'SBx9_line', 'data-kind': row.kind }, row.text),
      );
      const live =
        view.typed === ''
          ? null
          : h(
              'div',
              { className: 'SBx9_line', 'data-kind': 'typing' },
              view.typed,
              h('span', { className: 'SBx9_cursor' }),
            );

      return h('div', { className: 'SBx9_stream', ref: boxRef }, rows, live);
    }

    function Hardware(props) {
      const t = props.t;
      const [data, setData] = React.useState(null);
      const [error, setError] = React.useState('');

      React.useEffect(() => {
        let alive = true;
        let handle = 0;

        async function load() {
          try {
            const response = await fetch(METRICS_URL, { cache: 'no-store', headers: { accept: 'application/json' } });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const payload = await response.json();
            if (alive) {
              setData(payload);
              setError('');
            }
          } catch (failure) {
            if (alive) setError(failure instanceof Error ? failure.message : String(failure));
          }
        }

        load();
        handle = window.setInterval(load, 1500);
        return () => {
          alive = false;
          window.clearInterval(handle);
        };
      }, []);

      if (error !== '') {
        return h('div', { className: 'SBx9_empty' }, labelFor('', t, 'panel.hw.error', '讀不到主機資訊（{message}）').replace('{message}', error));
      }
      if (data === null) {
        return h('div', { className: 'SBx9_empty' }, labelFor('', t, 'panel.hw.waiting', '正在讀取主機資訊…'));
      }

      const cpu = typeof data.cpuPct === 'number' ? data.cpuPct : 0;
      const memPercent = data.memTotal > 0 ? ((data.memUsed / data.memTotal) * 100) : 0;
      const history = Array.isArray(data.cpuHistory) ? data.cpuHistory.slice(-48) : [];

      return h(
        'div',
        { className: 'SBx9_meters' },
        h(Meter, {
          label: labelFor('', t, 'panel.cpu', 'CPU'),
          value: cpu,
          readout: cpu.toFixed(0) + '% · ' + (data.cores || 0) + 'c',
        }),
        h(Meter, {
          label: labelFor('', t, 'panel.mem', '記憶體'),
          value: memPercent,
          tone: 'brand',
          readout: fmtBytes(data.memUsed) + ' / ' + fmtBytes(data.memTotal),
        }),
        h(
          'div',
          { className: 'SBx9_spark', 'aria-hidden': 'true' },
          history.length === 0
            ? null
            : history.map((value, index) =>
                h('i', {
                  key: 'spark-' + index,
                  className: 'SBx9_sparkbar',
                  style: { height: Math.max(2, (Math.max(0, Math.min(100, value)) / 100) * 22).toFixed(1) + 'px' },
                }),
              ),
        ),
        h(
          'div',
          { className: 'SBx9_facts' },
          h('span', null, labelFor('', t, 'panel.uptime', '運行') + ' ' + fmtDuration(data.uptimeSec)),
          h('span', null, (data.hostname || '') + ' · ' + (data.platform || '') + '/' + (data.arch || '')),
          h('span', null, 'node ' + (data.node || '?')),
        ),
      );
    }

    const TOKEN_NAMES = [
      '--dsw-alias-bg-base',
      '--dsw-alias-bg-layer-1',
      '--dsw-alias-bg-layer-2',
      '--dsw-alias-bg-overlay',
      '--dsw-alias-border-l1',
      '--dsw-alias-border-l2',
      '--dsw-alias-brand-primary',
      '--dsw-alias-label-primary',
      '--dsw-alias-label-secondary',
      '--dsw-alias-label-tertiary',
      '--dsw-alias-state-error-primary',
      '--dsw-alias-state-idle-primary',
      '--dsw-alias-state-success-primary',
      '--dsw-alias-state-warn-primary',
    ];
    const URL_OPEN = '/status-badge/open';
    const URL_WIN_STYLE = '/status-badge/window/ctl';
    const URL_WIN_CLOSE = '/status-badge/window/action';
    const URL_CTL = '/status-badge/window/ctl';
    const URL_ALPHA = '/status-badge/window/alpha';
    const URL_LIVE = '/status-badge/live';
    const URL_NOTIFY = '/status-badge/notify';
    const URL_FOCUS = '/status-badge/window/focus';
    const URL_RESET = '/status-badge/window/reset';
    const URL_STATE = '/status-badge/window/state';
    const URL_ACTION = '/status-badge/window/action';
      const PUSH_INTERVAL = 120;

    /** The popup document has no stylesheet of ours, so ship the theme values. */
    function readTokens() {
      if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return {};
      try {
        const style = getComputedStyle(document.documentElement);
        const out = {};
        for (const name of TOKEN_NAMES) {
          const value = style.getPropertyValue(name).trim();
          if (value !== '') out[name] = value;
        }
        return out;
      } catch {
        return {};
      }
    }

    async function callJson(url, body, method) {
      try {
        const init = { method: method || 'POST', cache: 'no-store' };
        if (body !== null && body !== void 0) {
          init.headers = { 'content-type': 'application/json' };
          init.body = JSON.stringify(body);
        }
        const response = await fetch(url, init);
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    }

    function Monitor(props) {
      const t = props.t;
      const thinkRef = React.useRef(null);

      const running = props.useSession((snapshot) =>
        snapshot === null || snapshot === void 0 ? false : snapshot.running === true,
      );
      const feed = props.useChat((snapshot) => deriveFeed(snapshot));

      React.useEffect(() => {
        const node = thinkRef.current;
        if (node !== null && typeof node.scrollHeight === 'number') node.scrollTop = node.scrollHeight;
      }, [feed.thinking]);

      const title = labelFor('', t, 'panel.title', '即時監控');
      const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth || 1024;
      const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight || 768;
      const width = Math.min(560, viewportWidth - 24);
      const rect = props.rect === null || props.rect === void 0 ? { left: 24, top: viewportHeight - 40 } : props.rect;
      const left = Math.max(12, Math.min(rect.left, viewportWidth - width - 12));
      const bottom = Math.max(12, viewportHeight - rect.top + 8);

      const thinking =
        feed.thinking !== '' ? feed.thinking : labelFor('', t, 'panel.thinking.none', '（這一輪還沒有思考內容）');
      const workTool = feed.tool !== '' ? feed.tool : labelFor('', t, 'panel.nothing', '目前沒有新的動態');
      const facts = [
        labelFor('', t, 'panel.stat.nodes', '節點') + ' ' + feed.stats.nodes,
        labelFor('', t, 'panel.stat.tools', '工具') + ' ' + feed.stats.tools,
        labelFor('', t, 'panel.stat.lines', '行') + ' ' + feed.lines.length,
        labelFor('', t, 'panel.stat.paths', '檔案') + ' ' + feed.paths.length,
      ];

      return ReactDOM.createPortal(
        h(
          'div',
          {
            className: 'SBx9_panel',
            style: {
              left: left + 'px',
              bottom: bottom + 'px',
              width: width + 'px',
              maxHeight: 'min(68vh, 560px)',
            },
            role: 'dialog',
            'aria-label': title,
          },
          h(
            'div',
            { className: 'SBx9_head' },
            h('span', { className: 'SBx9_title' }, title),
            h(
              'span',
              { className: 'SBx9_headstate' },
              h('i', {
                className: 'SBx9_dot',
                'aria-hidden': 'true',
                style: {
                  background: running ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-idle-primary)',
                },
              }),
              labelFor(props.status, t),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'SBx9_close',
                onClick: props.onClose,
                'aria-label': labelFor('', t, 'panel.close', '關閉'),
              },
              '×',
            ),
          ),
          h(
            'div',
            { className: 'SBx9_sec' },
            h('span', { className: 'SBx9_seclabel' }, labelFor('', t, 'panel.work', '目前工作')),
            h(
              'div',
              { className: 'SBx9_work' },
              h('span', { className: 'SBx9_tool' }, workTool),
              feed.detail === '' ? null : h('span', { className: 'SBx9_detail' }, feed.detail),
            ),
            h('span', { className: 'SBx9_seclabel' }, labelFor('', t, 'panel.think', '思考')),
            h('div', { className: 'SBx9_think', ref: thinkRef }, thinking),
          ),
          h(
            'div',
            { className: 'SBx9_sec' },
            h('span', { className: 'SBx9_seclabel' }, labelFor('', t, 'panel.code', '程式碼流')),
            h(CodeStream, { lines: feed.lines }),
          ),
          h(
            'div',
            { className: 'SBx9_sec' },
            h('span', { className: 'SBx9_seclabel' }, labelFor('', t, 'panel.hardware', '硬體')),
            h(Hardware, { t: t }),
          ),
          h(
            'div',
            { className: 'SBx9_facts' },
            facts.map((item, index) => h('span', { key: 'fact-' + index }, item)),
            feed.paths.length === 0
              ? null
              : h('span', { key: 'paths' }, feed.paths.slice(0, 4).join(' · ')),
          ),
        ),
        document.body,
      );
    }

    const CFG_KEY = 'dsh.statusBadge.cfg';
    const HW_KEYS = ['cpu', 'mem', 'gpu', 'disk', 'balance'];
    const PANE_KEYS = ['work', 'think', 'code', 'hardware'];

    function pickFlags(saved, keys) {
      const out = {};
      const src = saved !== null && typeof saved === 'object' ? saved : {};
      for (const key of keys) out[key] = typeof src[key] === 'boolean' ? src[key] : true;
      return out;
    }

    function loadCfg() {
      try {
        const raw = window.localStorage.getItem(CFG_KEY);
        if (typeof raw === 'string' && raw !== '') {
          const saved = JSON.parse(raw);
          if (saved !== null && typeof saved === 'object') {
            return {
              label: saved.label !== false,
              pulse: saved.pulse !== false,
              notify: saved.notify !== false,
              layer: saved.layer === 'top' ? 'top' : 'normal',
              alpha: Number.isFinite(Number(saved.alpha)) ? Math.max(0, Math.min(100, Number(saved.alpha))) : 100,
              pinPos: saved.pinPos === true,
              click: saved.click === true,
              hw: pickFlags(saved.hw, HW_KEYS),
              pane: pickFlags(saved.pane, PANE_KEYS),
              rates: normRates(saved.rates),
              debug: saved.debug === true,
              theme: saved.theme === 'terminal' || saved.theme === 'light' ? saved.theme : 'dark',
              flow: saved.flow === 'simple' || saved.flow === 'normal' ? saved.flow : 'full',
              pace: saved.pace === 'instant' || saved.pace === 'normal' ? saved.pace : 'smooth',
            };
          }
        }
      } catch {}
      return {
        label: true,
        pulse: true,
        notify: true,
        layer: 'normal',
        alpha: 100,
        pinPos: false,
        click: false,
        hw: pickFlags(null, HW_KEYS),
        pane: pickFlags(null, PANE_KEYS),
        rates: normRates(null),
        debug: false,
        theme: 'dark',
        flow: 'full',
        pace: 'smooth',
      };
    }

    function saveCfg(cfg) {
      try {
        window.localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      } catch {}
    }

    function StatusBadge(props) {
      const { useSession, useChat, useSessionStatus, useProjection, sessionId, t } = props;
      try {
        React.useEffect(() => {
          const keys = Object.keys(props).join(',');
          const detail = 'keys=' + keys + ' | sessionId=' + String(sessionId) + ' | type=' + typeof sessionId;
          callJson('/status-badge/debug', { tag: 'props', detail: detail.slice(0, 400) }, 'POST');
        }, []);
      } catch {}
      const [mode, setMode] = React.useState('closed');
      const modeLive = React.useRef('closed');
      const openRef = React.useRef(null);
      React.useEffect(() => {
        modeLive.current = mode;
      }, [mode]);
      const [rect, setRect] = React.useState(null);
      const [cfg, setCfg] = React.useState(loadCfg);
      const [sheet, setSheet] = React.useState(false);
      const anchorRef = React.useRef(null);
      const popupRef = React.useRef(null);
      const finishedRef = React.useRef(false);
      const hoverRef = React.useRef(0);
      const pinnedRef = React.useRef(false);
      const cfgRef = React.useRef(cfg);
      cfgRef.current = cfg;
      /** Latest chat store snapshot, refreshed on every store change so the pusher never waits for a render. */
      const snapRef = React.useRef(null);

      const running = useSession((snapshot) =>
        snapshot === null || snapshot === void 0 ? false : snapshot.running === true,
      );
      const waiting = useSessionStatus((snapshot) => {
        if (snapshot === null || snapshot === void 0) return false;
        const entry = typeof snapshot.get === 'function' ? snapshot.get(props.sessionId) : null;
        return entry !== null && entry !== void 0 && entry.pendingInteraction !== null && entry.pendingInteraction !== void 0;
      });
      const phase = useChat((snapshot) => {
        snapRef.current = snapshot;
        return resolvePhase(snapshot);
      });
      const feed = useChat((snapshot) => {
        snapRef.current = snapshot;
        return deriveFeed(snapshot);
      });
      const chatTokens = useChat((snapshot) => sessionTokens(snapshot));
        const tokenUsage = typeof useProjection === 'function' ? useProjection('tokenUsage') : null;
        const projected =
          tokenUsage !== null && typeof tokenUsage === 'object'
            ? {
                input: Math.round(Number(tokenUsage.uncachedInputTokens) || 0),
                cacheRead: Math.round(Number(tokenUsage.cacheReadTokens) || 0),
                cacheWrite: Math.round(Number(tokenUsage.cacheWriteTokens) || 0),
                output: Math.round(Number(tokenUsage.outputTokens) || 0),
              }
            : null;
        const tokens =
          chatTokens.total > 0
            ? chatTokens
            : projected !== null && projected.input + projected.cacheRead + projected.cacheWrite + projected.output > 0
              ? {
                  input: projected.input + projected.cacheWrite,
                  cacheRead: projected.cacheRead,
                  output: projected.output,
                  total: projected.input + projected.cacheRead + projected.cacheWrite + projected.output,
                }
              : chatTokens;
        const tokensAreSession = chatTokens.total > 0;

      const usageView = (function () {
        const raw = Math.max(0, Number(tokens.total) || 0);
        if (raw === 0) {
          return { input: 0, cacheRead: 0, output: 0, total: 0 };
        }
        if (tokensAreSession) {
          return {
            input: Math.round(Number(tokens.input) || 0),
            cacheRead: Math.round(Number(tokens.cacheRead) || 0),
            output: Math.round(Number(tokens.output) || 0),
            total: raw,
          };
        }
        let base = 0;
        try {
          const saved = JSON.parse(window.localStorage.getItem('dsh.statusBadge.tokenBase.' + String(sessionId || 'default')) || 'null');
          if (saved !== null && typeof saved === 'object' && Number.isFinite(saved.t) && raw >= saved.t) {
            base = saved.t;
          } else {
            window.localStorage.setItem('dsh.statusBadge.tokenBase.' + String(sessionId || 'default'), JSON.stringify({ t: raw, at: Date.now() }));
            base = raw;
          }
        } catch {}
        const scale = Math.max(0, raw - base) / raw;
        return {
          input: Math.round((Number(tokens.input) || 0) * scale),
          cacheRead: Math.round((Number(tokens.cacheRead) || 0) * scale),
          output: Math.round((Number(tokens.output) || 0) * scale),
          total: Math.max(0, raw - base),
        };
      })();

      let status = 'idle';
      if (waiting) status = 'waiting';
      else if (running) status = phase || 'working';

      const label = labelFor(status, t);
      let aria;
      try {
        aria = typeof t === 'function' ? t('aria', { label: label }) : label;
      } catch {
        aria = label;
      }

      const runRef = React.useRef({ on: false, since: 0 });
      const track = runRef.current;
      if (running === true && track.on !== true) {
        track.on = true;
        track.since = Date.now();
      } else if (running !== true && track.on === true) {
        track.on = false;
        track.since = 0;
      }
      const elapsed = running === true && track.since > 0 ? Math.floor((Date.now() - track.since) / 1000) : 0;

      React.useEffect(() => {
        if (cfgRef.current.notify !== true) {
          finishedRef.current = running === true;
          return;
        }
        if (finishedRef.current === true && running !== true) {
          callJson(URL_NOTIFY, { title: '這輪結束了', body: '狀態回到' + label });
        }
        finishedRef.current = running === true;
      }, [running]);

      function applyCfg(patch) {
        const next = {
          label: patch.label === void 0 ? cfg.label : patch.label,
          pulse: patch.pulse === void 0 ? cfg.pulse : patch.pulse,
          notify: patch.notify === void 0 ? cfg.notify : patch.notify,
          layer: patch.layer === void 0 ? cfg.layer : patch.layer,
          alpha: patch.alpha === void 0 ? cfg.alpha : patch.alpha,
          pinPos: patch.pinPos === void 0 ? cfg.pinPos : patch.pinPos,
          click: patch.click === void 0 ? cfg.click : patch.click,
          hw: patch.hw === void 0 ? cfg.hw : Object.assign({}, cfg.hw, patch.hw),
          pane: patch.pane === void 0 ? cfg.pane : Object.assign({}, cfg.pane, patch.pane),
          rates: patch.rates === void 0 ? cfg.rates : normRates(Object.assign({}, cfg.rates, patch.rates)),
          debug: patch.debug === void 0 ? cfg.debug : patch.debug === true,
          theme: patch.theme === void 0 ? cfg.theme : String(patch.theme),
          flow: patch.flow === void 0 ? cfg.flow : String(patch.flow),
          pace: patch.pace === void 0 ? cfg.pace : String(patch.pace),
        };
        setCfg(next);
        cfgRef.current = next;
        saveCfg(next);
      }

      const liveRef = React.useRef(null);
      liveRef.current = {
        status: status,
        running: running,
        elapsed: elapsed,
        since: track.since,
        session: String(sessionId === null || sessionId === void 0 ? '' : sessionId).slice(0, 12),
        label: 'sid=' + String(sessionId),
        thinking: feed.thinking,
        tool: feed.tool,
        detail: feed.detail,
        lines: feed.lines,
        paths: feed.paths,
        stats: feed.stats,
        usage: { total: usageView.total, input: usageView.input, output: usageView.output, cacheRead: usageView.cacheRead, spend: spendOf(usageView, cfgRef.current.rates), probe: typeof useProjection },
        view: { pane: cfgRef.current.pane, hw: cfgRef.current.hw, theme: cfgRef.current.theme },
      };

      function measure() {
        const node = anchorRef.current;
        if (node === null || typeof node.getBoundingClientRect !== 'function') return;
        setRect(node.getBoundingClientRect());
      }

      function pushWinStyle() {
        const c = cfgRef.current;
        callJson(URL_WIN_STYLE + '?path=layer&value=' + encodeURIComponent(c.layer || 'top'), null, 'GET');
        callJson(URL_WIN_STYLE + '?path=pinpos&value=' + (c.pinPos === true ? '1' : '0'), null, 'GET');
        callJson(URL_ALPHA + '?value=' + String(c.alpha), null, 'GET');
        callJson(URL_WIN_STYLE + '?path=passthrough&value=' + (c.click === true ? '1' : '0'), null, 'GET');
      }

      function open() {
        measure();        setMode('window');
        callJson(URL_OPEN + '?s=' + encodeURIComponent(String(sessionId === null || sessionId === void 0 ? '' : sessionId)), {}).then((res) => {
          const ok = res !== null && typeof res === 'object' && res.ok === true;
          if (!ok) { setMode('inline'); return; }
          pushWinStyle();
          window.setTimeout(pushWinStyle, 350);
          window.setTimeout(pushWinStyle, 900);
        });
      }

      function closeAll() {
        setMode('closed');
        popupRef.current = null;
        callJson(URL_WIN_CLOSE, { action: 'close' }, 'POST');
      }

      openRef.current = open;

      React.useEffect(() => {
        const id = window.setInterval(async () => {
          if (modeLive.current !== 'closed') return;
          const state = await callJson(URL_STATE, null, 'GET');
          if (state !== null && typeof state === 'object' && state.open === true) {
            if (openRef.current !== null) openRef.current();
          }
        }, 3000);
        return () => {
          window.clearInterval(id);
        };
      }, []);

      function offScreen(bounds) {
        if (bounds === null || bounds === void 0 || typeof bounds !== 'object') return false;
        if (typeof window === 'undefined' || window.screen === void 0) return false;
        const maxW = Number(window.screen.availWidth) || 0;
        const maxH = Number(window.screen.availHeight) || 0;
        if (maxW <= 0 || maxH <= 0) return false;
        const right = Number(bounds.x) + Number(bounds.width);
        const bottom = Number(bounds.y) + Number(bounds.height);
        return Number(bounds.x) < -8 || Number(bounds.y) < -8 || right > maxW + 8 || bottom > maxH + 8;
      }

      function toggle() {
        callJson(URL_STATE, null, 'GET').then((state) => {
          const alive = state !== null && typeof state === 'object' && state.open === true;
          if (alive !== true) {
            open();
            return;
          }
          const bounds = state.bounds === void 0 ? null : state.bounds;
          const fix = offScreen(bounds);
          setMode('window');
          const step = fix === true ? callJson(URL_RESET, {}) : Promise.resolve(null);
          step.then(() => {
            callJson(URL_FOCUS, {}).then((res) => {
              const ok = res !== null && typeof res === 'object' && res.ok === true;
              if (ok !== true) open();
              else if (res.visible === false) callJson(URL_RESET, {});
            });
          });
        });
      }

      function hoverIn() {
        if (typeof window === 'undefined') return;
        window.clearTimeout(hoverRef.current);
      }

      function hoverOut() {
        if (typeof window === 'undefined') return;
        window.clearTimeout(hoverRef.current);
        hoverRef.current = window.setTimeout(() => {
          if (pinnedRef.current !== true) setSheet(false);
        }, 380);
      }

      function toggleSheet() {
        if (sheet === true && pinnedRef.current === true) {
          pinnedRef.current = false;
          setSheet(false);
          return;
        }
        pinnedRef.current = true;
        setSheet(true);
      }

      function optRow(key, text, on) {
        return h(
          'button',
          {
            type: 'button',
            className: 'SBx9_opt',
            'data-on': on ? 'true' : 'false',
            role: 'switch',
            'aria-checked': on,
            onClick: () => applyCfg({ [key]: !on }),
          },
          h('span', null, text),
          h('span', { className: 'SBx9_sw', 'aria-hidden': 'true' }),
        );
      }

      try { window.setTimeout(() => { try { const x = new XMLHttpRequest(); x.open('POST', '/status-badge/debug', true); x.setRequestHeader('content-type', 'application/json'); x.send(JSON.stringify({ tag: 'bundle', detail: 'v1_0_4_marker' })); } catch {} }, 1500); } catch {}    function debugLog(tag, detail) {
      try {
        const cur = cfgRef.current;
        if (cur === null || cur.debug !== true) return;
        callJson('/status-badge/debug', { tag: String(tag), detail: String(detail).slice(0, 400) }, 'POST');
      } catch {}
    }
    try {
      window.addEventListener('error', (event) => debugLog('error', (event && event.message) || 'error'));
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event && event.reason;
        debugLog('rejection', (reason && reason.message) || String(reason || 'rejection'));
      });
    } catch {}
    function rateValue(key) {
      const rates = cfgRef.current !== null && cfgRef.current.rates !== null && typeof cfgRef.current.rates === 'object' ? cfgRef.current.rates : RATE_DEFAULT;
      const value = Number(rates[key]);
      return Number.isFinite(value) ? value : RATE_DEFAULT[key];
    }
    function numRow(text, value, onChange) {
      return h(
        'label',
        { className: 'SBx9_numRow' },
        h('span', { className: 'SBx9_numLabel' }, text),
        h('input', {
          className: 'SBx9_num',
          type: 'number',
          min: '0',
          step: '0.1',
          value: String(value),
          onChange: (event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next) && next >= 0) onChange(next);
          },
        }),
      );
    }
    function checkRow(text, on, onToggle) {
        return h(
          'button',
          {
            type: 'button',
            className: 'SBx9_opt',
            'data-on': on ? 'true' : 'false',
            role: 'switch',
            'aria-checked': on,
            onClick: onToggle,
          },
          h('span', null, text),
          h('span', { className: 'SBx9_sw', 'aria-hidden': 'true' }),
        );
      }

      const firstStyle = React.useRef(true);
      React.useEffect(() => {
        if (firstStyle.current === true) {
          firstStyle.current = false;
          return;
        }
        pushWinStyle();
      }, [mode, cfg.layer, cfg.alpha, cfg.pinPos, cfg.click]);
      React.useEffect(() => {
        // always-on pusher
        const tokens = readTokens();
        let alive = true;

        let lastSignature = '';
        let pushing = false;

        async function push() {
          if (pushing === true) return;
          const base = liveRef.current;
          if (base === null) return;
          const snap = snapRef.current;
          const fresh = snap === null ? null : deriveFeed(snap, cfgRef.current.flow);
          const current =
            fresh === null
              ? base
              : Object.assign({}, base, {
                  thinking: fresh.thinking,
                  tool: fresh.tool,
                  detail: fresh.detail,
                  lines: fresh.lines,
                  paths: fresh.paths,
                  stats: fresh.stats,
                });
          const liveElapsed =
            current.running === true && Number(current.since) > 0
              ? Math.floor((Date.now() - Number(current.since)) / 1000)
              : current.elapsed;
          const signature = [
            current.status,
            current.running === true ? '1' : '0',
            liveElapsed,
            current.tool,
            current.detail,
            current.thinking.length,
            current.lines.length,
            current.lines.length > 0 ? current.lines[current.lines.length - 1].text : '',
            current.paths.length,
            current.stats.nodes,
            current.usage.total,
            JSON.stringify(current.view),
            cfgRef.current.flow,
            cfgRef.current.pace,
            tokens['--dsw-alias-label-primary'] || '',
          ].join('|');
          if (signature === lastSignature) return;
          lastSignature = signature;
          pushing = true;
          try {
            await callJson(URL_LIVE, {
              status: current.status,
              running: current.running,
              elapsed: liveElapsed,
              thinking: current.thinking,
              tool: current.tool,
              detail: current.detail,
              lines: current.lines,
              paths: current.paths,
              stats: current.stats,
              tokens: tokens,
              usage: current.usage,
              view: current.view,
              flow: cfgRef.current.flow,
              pace: cfgRef.current.pace,
            });
          } finally {
            pushing = false;
          }
        }

        push();
        const pusher = window.setInterval(() => {
          void push();
        }, PUSH_INTERVAL);
        const keep = window.setInterval(() => {
          const next = readTokens();
          Object.assign(tokens, next);
        }, 4000);
        const watcher = window.setInterval(async () => {
          const state = await callJson(URL_STATE, null, 'GET');
          if (!alive) return;
          if (state === null || state.open !== true) {
            if (mode === 'window') setMode('closed');
            return;
          }
          const wantLock = state.pinned === true && state.passthrough === true;
          const cfgNow = cfgRef.current;
          if (cfgNow !== null && (cfgNow.pinPos === true) !== wantLock) {
            const next = Object.assign({}, cfgNow, { pinPos: wantLock, click: wantLock });
            setCfg(next);
            cfgRef.current = next;
            saveCfg(next);
          }
        }, 1800);

        return () => {
          alive = false;
          window.clearInterval(pusher);
          window.clearInterval(watcher);
          window.clearInterval(keep);
        };
      }, []);

      React.useEffect(() => {
        if (mode !== 'inline' && sheet !== true) return undefined;

        function onPointer(event) {
          const node = anchorRef.current;
          if (node !== null && typeof node.contains === 'function' && node.contains(event.target)) return;
          const wrap = document.querySelector('.SBx9_wrap');
          if (wrap !== null && wrap.contains(event.target)) return;
          pinnedRef.current = false;
          setSheet(false);
          if (mode === 'inline') setMode('closed');
        }

        function onKey(event) {
          if (event.key === 'Escape') {
            pinnedRef.current = false;
            setSheet(false);
            setMode('closed');
          }
        }

        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
          document.removeEventListener('mousedown', onPointer);
          document.removeEventListener('keydown', onKey);
        };
      }, [mode, sheet]);

      const active = mode !== 'closed';
      const busy = status !== 'idle' ? 'true' : 'false';

      // The settings sheet is two columns: display prefs on the left, hardware and pricing on the right.
      const sheetBox = (...items) => {
        let split = items.findIndex(
          (el) =>
            el !== null &&
            typeof el === 'object' &&
            el.props &&
            el.props.className === 'SBx9_sheetTitle' &&
            String(el.props.children) === '硬體卡片',
        );
        if (split <= 0 || split >= items.length - 1) split = Math.ceil(items.length / 2);
        return h(
          'div',
          { className: 'SBx9_sheet', onMouseEnter: hoverIn, onMouseLeave: hoverOut },
          h('div', { className: 'SBx9_col' }, ...items.slice(0, split)),
          h('div', { className: 'SBx9_col' }, ...items.slice(split)),
        );
      };

      return h(
        React.Fragment,
        null,
        h(
          'span',
          {
            className: 'SBx9_wrap',
            onMouseEnter: hoverIn,
            onMouseLeave: hoverOut,
          },
          h(
            'button',
            {
              type: 'button',
              ref: anchorRef,
              className: 'SBx9_row SBx9_btn',
              'data-status': status,
              'data-busy': busy,
              'data-open': active ? 'true' : 'false',
              'aria-expanded': active,
              'aria-label':
                (typeof aria === 'string' ? aria : label) +
                ' · ' +
                labelFor('', t, 'toggle', '展開監控視窗'),
              title: label,
              onClick: toggle,
            },
            h('i', { className: 'SBx9_dot', 'aria-hidden': 'true' }),
            cfg.label === true ? h('span', { className: 'SBx9_label' }, label) : null,
            h('span', { className: 'SBx9_caret', 'aria-hidden': 'true' }, '▾'),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'SBx9_gear',
              'data-on': sheet ? 'true' : 'false',
              'aria-label': labelFor('', t, 'settings.title', '設定'),
              title: labelFor('', t, 'settings.title', '設定'),
              onClick: toggleSheet,
            },
            '⚙',
          ),
          sheet === true
            ? sheetBox(
                h('div', { className: 'SBx9_sheetTitle' }, labelFor('', t, 'settings.title', '設定')),
                optRow('label', labelFor('', t, 'settings.label', '顯示狀態文字'), cfg.label === true),
                optRow('notify', labelFor('', t, 'settings.notify', '這輪結束時通知'), cfg.notify === true),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, labelFor('', t, 'settings.windowLayer', '視窗圖層')),
                h(
                  'select',
                  {
                    className: 'SBx9_select',
                    value: cfg.layer || 'normal',
                    'aria-label': labelFor('', t, 'settings.windowLayer', '視窗圖層'),
                    onChange: (event) => applyCfg({ layer: String(event.target.value) }),
                  },
                  h('option', { value: 'top' }, labelFor('', t, 'settings.top', '置頂（最上層）')),
                  h('option', { value: 'normal' }, labelFor('', t, 'settings.normal', '一般')),
                ),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, labelFor('', t, 'settings.theme', '主題')),
                h(
                  'select',
                  {
                    className: 'SBx9_select',
                    value: cfg.theme || 'dark',
                    'aria-label': labelFor('', t, 'settings.theme', '主題'),
                    onChange: (event) => applyCfg({ theme: String(event.target.value) }),
                  },
                  h('option', { value: 'dark' }, labelFor('', t, 'settings.themeDark', '深色')),
                  h('option', { value: 'terminal' }, labelFor('', t, 'settings.themeTerminal', '終端綠')),
                  h('option', { value: 'light' }, labelFor('', t, 'settings.themeLight', '亮色')),
                ),
                checkRow(
                  labelFor('', t, 'settings.lock', '鎖定視窗（不可拖動 + 滑鼠穿透）'),
                  cfg.pinPos === true && cfg.click === true,
                  () => {
                    const next = !(cfg.pinPos === true && cfg.click === true);
                    applyCfg({ pinPos: next, click: next });
                  },
                ),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, labelFor('', t, 'settings.opacity', '透明度')),
                h(
                  'div',
                  { className: 'SBx9_alphaRow' },
                  h('input', {
                    type: 'range',
                    min: 0,
                    max: 100,
                    step: 5,
                    value: cfg.alpha,
                    className: 'SBx9_alpha',
                    onChange: (event) => applyCfg({ alpha: Number(event.target.value) }),
                  }),
                  h('span', { className: 'SBx9_alphaVal' }, String(cfg.alpha) + '%'),
                ),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, '視窗內容'),
                checkRow('目前工作與思考', cfg.pane.work, () => applyCfg({ pane: { work: !cfg.pane.work } })),
                checkRow('程式碼流', cfg.pane.code, () => applyCfg({ pane: { code: !cfg.pane.code } })),
                checkRow('硬體監控', cfg.pane.hardware, () => applyCfg({ pane: { hardware: !cfg.pane.hardware } })),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, '程式碼流顯示量'),
                h(
                  'select',
                  {
                    className: 'SBx9_select',
                    value: cfg.flow || 'full',
                    'aria-label': '程式碼流顯示量',
                    onChange: (event) => applyCfg({ flow: String(event.target.value) }),
                  },
                  h('option', { value: 'simple' }, '簡潔'),
                  h('option', { value: 'normal' }, '一般'),
                  h('option', { value: 'full' }, '全部'),
                ),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, '程式碼流節奏'),
                h(
                  'select',
                  {
                    className: 'SBx9_select',
                    value: cfg.pace || 'smooth',
                    'aria-label': '程式碼流節奏',
                    onChange: (event) => applyCfg({ pace: String(event.target.value) }),
                  },
                  h('option', { value: 'instant' }, '即時'),
                  h('option', { value: 'normal' }, '一般'),
                  h('option', { value: 'smooth' }, '流暢'),
                ),
                h('div', { className: 'SBx9_sheetTitle', style: { paddingTop: '6px' } }, '硬體卡片'),
                checkRow('CPU', cfg.hw.cpu, () => applyCfg({ hw: { cpu: !cfg.hw.cpu } })),
                checkRow('記憶體', cfg.hw.mem, () => applyCfg({ hw: { mem: !cfg.hw.mem } })),
                checkRow('GPU', cfg.hw.gpu, () => applyCfg({ hw: { gpu: !cfg.hw.gpu } })),
                checkRow('磁碟', cfg.hw.disk, () => applyCfg({ hw: { disk: !cfg.hw.disk } })),
                checkRow('餘額', cfg.hw.balance, () => applyCfg({ hw: { balance: !cfg.hw.balance } })),
                h(
        'div',
        { className: 'SBx9_sec' },
        h('span', { className: 'SBx9_seclabel' }, '計費單價（¥ / 百萬 token）'),
        numRow('輸入', rateValue('input'), (value) => applyCfg({ rates: { input: value } })),
        numRow('快取讀取', rateValue('cache'), (value) => applyCfg({ rates: { cache: value } })),
        numRow('輸出', rateValue('output'), (value) => applyCfg({ rates: { output: value } })),
        checkRow('除錯記錄（寫入 .runtime/debug.log）', cfg.debug, () => applyCfg({ debug: !cfg.debug })),
        h(
          'button',
          {
            className: 'SBx9_opt',
            type: 'button',
            onClick: () => {
              try {
                window.localStorage.removeItem('dsh.statusBadge.tokenBase.' + String(sessionId || 'default'));
              } catch {}
            },
          },
          h('span', null, '重設用量基準（歸零）'),
          h('span', { className: 'SBx9_sw', 'aria-hidden': 'true' }),
        ),
                ),
              )
            : null,
        ),
        mode === 'inline'
          ? h(Monitor, {
              variant: 'inline',
              rect: rect,
              status: status,
              t: t,
              onClose: () => setMode('closed'),
              useSession: useSession,
              useChat: useChat,
            })
          : null,
      );
    }

    return {
      inject: ['slots', 'locale'],
      __internals: {
        nodePhase,
        toolPhase,
        resolvePhase,
        deriveFeed,
        fmtBytes,
        fmtDuration,
        callPreview,
        errorTextOf,
        toneOf,
        createStream,
        streamIngest,
        streamTick,
        seedLine,
      },
      apply(ctx) {
        ctx.effect(() => {
          try {
            return ctx.locale.register(NS, { zh, 'zh-TW': zh, 'zh-CN': zh, en });
          } catch {
            return () => {};
          }
        }, 'status-badge: dictionaries');

        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            {
              name: 'conversation.composer.dock',
              id: 'status-badge',
              order: 2,
              label: 'Status',
              locale: NS,
            },
            StatusBadge,
          ),
        );
      },
    };
  },
});
