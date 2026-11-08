/* __statusBridgeV2:start */
const __stReq = createRequire(import.meta.url);
const __stHttp = __stReq("node:http");
const __stPortFile = __ST_PORT_FILE__;
let __statusWin = null;
let __statusToken = "";
let __statusTokenFile = "";
let __statusPos = null;
let __statusSize = null;
let __statusLayer = "normal";
let __statusAlpha = 100;
const __statusPersistPath = __ST_BOUNDS_FILE__;
const __statusFS = __stReq("node:fs");
try { __stReq("node:fs").mkdirSync(__stReq("node:path").dirname(__stPortFile), { recursive: true }); } catch {}
try {
  const __b = JSON.parse(__statusFS.readFileSync(__statusPersistPath, "utf8"));
  const __w = Number(__b.width);
  const __h = Number(__b.height);
  const __x = Number(__b.x);
  const __y = Number(__b.y);
  if (__w >= 600 && __w <= 1600 && __h >= 500 && __h <= 1600 && Math.abs(__x) < 8000 && Math.abs(__y) < 8000) {
    __statusPos = { x: Math.round(__x), y: Math.round(__y) };
    __statusSize = { width: Math.round(__w), height: Math.round(__h) };
    try { __statusFS.appendFileSync(__ST_LOG_FILE__, "bounds-load-ok " + __x + "," + __y + "," + __w + "," + __h + String.fromCharCode(10)); } catch {}
  } else {
    try { __statusFS.appendFileSync(__ST_LOG_FILE__, "bounds-load-reject " + __x + "," + __y + "," + __w + "," + __h + String.fromCharCode(10)); } catch {}
  }
} catch (e) {
  try { __statusFS.appendFileSync(__ST_LOG_FILE__, "bounds-load-fail " + String(e && e.message) + String.fromCharCode(10)); } catch {}
}

function __statusSF() {
  try { return screen.getPrimaryDisplay().scaleFactor || 1; } catch {}
  return 1;
}
function __statusDipArea(area) {
  const sf = __statusSF();
  return {
    x: Math.round(area.x / sf),
    y: Math.round(area.y / sf),
    width: Math.round(area.width / sf),
    height: Math.round(area.height / sf),
  };
}
function __statusSFFor(win) {
  try {
    const { screen } = __stReq("electron");
    const display = screen.getDisplayMatching(win.getBounds());
    const sf = display && Number.isFinite(display.scaleFactor) ? display.scaleFactor : 1;
    return sf > 0 ? sf : 1;
  } catch {
    return 1;
  }
}
function __statusLiveBounds() {
  try {
    if (__statusWin && !__statusWin.isDestroyed()) {
      const b = __statusWin.getBounds();
      return {
        x: Math.round(b.x),
        y: Math.round(b.y),
        width: Math.round(b.width),
        height: Math.round(b.height),
      };
    }
  } catch {}
  return null;
}
function __statusBounds() {
  const live = __statusLiveBounds();
  if (live !== null && live.width > 0 && live.height > 0) return live;
  return {
    x: __statusPos === null ? 0 : __statusPos.x,
    y: __statusPos === null ? 0 : __statusPos.y,
    width: __statusSize === null ? 720 : __statusSize.width,
    height: __statusSize === null ? 780 : __statusSize.height,
  };
}

function __statusState() {
  const open = !!(__statusWin && !__statusWin.isDestroyed());
  return {
    ok: true,
    open,
    alpha: open ? __statusWin.getOpacity() : 1,
    maxed: open ? __statusWin.__statusMaxed === true : false,
    bounds: open ? __statusBounds() : null,
    pinned: open ? __statusWin.__statusPinned === true : false,
    passthrough: open ? __statusWin.__statusPassthrough === true : false,
  };
}

function __statusHideTaskbar(win) {
  try {
    const buf = win.getNativeWindowHandle();
    const hwnd = typeof buf.readBigUInt64LE === "function" ? Number(buf.readBigUInt64LE(0)) : buf.readUInt32LE(0);
    const ps = [
      "$s = Add-Type -PassThru -Name W -Namespace N -MemberDefinition '[DllImport(\"user32.dll\")] public static extern int GetWindowLong(IntPtr h,int i);[DllImport(\"user32.dll\")] public static extern int SetWindowLong(IntPtr h,int i,int v);'",
      "$h = [IntPtr]" + hwnd,
      "$e = [N.W]::GetWindowLong($h,-20)",
      "[N.W]::SetWindowLong($h,-20,($e -bor 0x80)) | Out-Null",
      "try { [N.W]::SetWindowLong($h,-20,(([N.W]::GetWindowLong($h,-20)) -band (-bnot 0x40000))) | Out-Null } catch {}"
    ].join("; ");
    __stReq("node:child_process").execFile("powershell.exe", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps], { windowsHide: true }, () => {});
  } catch {}
}
async function __statusOpen(target) {
  if (__statusWin && !__statusWin.isDestroyed()) {
    try { await __statusWin.loadURL(target); } catch {}
  try { await __statusWin.webContents.executeJavaScript("window.__setAlpha(" + String(__statusAlpha) + ")"); } catch {}
    try { __statusWin.show(); __statusWin.moveTop(); __statusWin.focus(); } catch {}
    return { ok: true, reused: true };
  }
  const raw = __statusSize === null ? { width: 720, height: 780 } : __statusSize;
  const size = { width: Math.max(600, Math.min(1600, raw.width)), height: Math.max(500, Math.min(1600, raw.height)) };
  __statusSize = { width: size.width, height: size.height };
  __statusPos = null;
  const __statusClampPos = (() => {
    const wa = __stReq("electron").screen.getPrimaryDisplay().workArea;
    const center = {
      x: Math.round(wa.x + Math.max(0, (wa.width - size.width) / 2)),
      y: Math.round(wa.y + Math.max(0, (wa.height - size.height) / 2)),
    };
    const p = __statusPos;
    if (p === null) return center;
    const outside = p.x < wa.x - 8 || p.y < wa.y - 8 || p.x + size.width > wa.x + wa.width + 8 || p.y + size.height > wa.y + wa.height + 8;
    return outside ? center : p;
  })();
  const pos = __statusClampPos;
  __statusWin = new BrowserWindow({
    width: size.width,
    height: size.height,
    ...(pos === null ? {} : { x: pos.x, y: pos.y }),
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    skipTaskbar: true,
    resizable: true,
    maximizable: true,
    minimizable: false,
    fullscreenable: false,
    hasShadow: true,
    roundedCorners: true,
    autoHideMenuBar: true,
    title: "Status Monitor",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  try { __statusWin.setMenuBarVisibility(false); } catch {}
  __statusWin.once("ready-to-show", () => {
    try { __statusWin.show(); __statusWin.moveTop(); __statusWin.focus(); __statusHideTaskbar(__statusWin); } catch {}
  });
  __statusWin.webContents.on("did-finish-load", () => {
    try { if (!__statusWin.isVisible()) __statusWin.show(); __statusWin.moveTop(); } catch {}
  });
  __statusWin.on("closed", () => { __statusWin = null; });
  try { __statusWin.setAlwaysOnTop(__statusLayer === "top", "screen-saver"); } catch {}
  try { __statusWin.__statusMaxed = false; } catch {}
  try { await __statusWin.loadURL(target); } catch {}
  try { await __statusWin.webContents.executeJavaScript("window.__setAlpha(" + String(__statusAlpha) + ")"); } catch {}
  return { ok: true };
}

function __statusToast(title, bodyText) {
  const electronScreen = __stReq("electron").screen;
  const area = electronScreen.getPrimaryDisplay().workArea;
  const w = 340;
  const h = 112;
  const win = new BrowserWindow({
    width: w, height: h,
    x: area.x + area.width - w - 18,
    y: area.y + area.height - h - 2,
    frame: false, transparent: true, backgroundColor: "#00000000", skipTaskbar: true,
    focusable: false, resizable: false, movable: false, minimizable: false, maximizable: false,
    fullscreenable: false, alwaysOnTop: true, show: false, hasShadow: true,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  });
  const page = __stReq("node:url").pathToFileURL(__stReq("node:path").join(__stReq("node:path").dirname(__stPortFile), "..", "toast.html")).href;
  win.loadURL(page + "?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(bodyText));
  win.once("ready-to-show", () => { try { win.show(); win.moveTop(); } catch {} });
  win.webContents.on("did-finish-load", () => { try { if (!win.isVisible()) { win.show(); win.moveTop(); } } catch {} });
  setTimeout(() => { try { win.close(); } catch {} }, 5200);
}
function __statusStart() {
  try { app.setAppUserModelId("com.deepseek.harness"); } catch {}
  try {
    __statusTokenFile = __stReq("node:path").join(__stReq("node:path").dirname(__stPortFile), "bridge.token");
    __statusToken = __stReq("node:crypto").randomUUID().replace(/-/g, "");
    __statusFS.writeFileSync(__statusTokenFile, __statusToken, "utf8");
  } catch {}
  const reply = (res, obj) => {
    try {
      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
      });
      res.end(JSON.stringify(obj));
    } catch {}
  };
  const srv = __stHttp.createServer(async (req, res) => {
    let u;
    try { u = new URL(req.url, "http://127.0.0.1"); } catch { u = new URL("http://127.0.0.1/"); }
    const p = u.pathname;
    if (p !== "/state" && u.searchParams.get("t") !== __statusToken) {
      try { __statusFS.appendFileSync(__stReq("node:path").join(__stReq("node:path").dirname(__stPortFile), "open.log"), new Date().toISOString() + " denied " + p + String.fromCharCode(10)); } catch {}
      return reply(res, { ok: false, reason: "unauthorized" });
    }
    if (p === "/displays") {
      const { screen } = __stReq("electron");
      const list = screen.getAllDisplays().map((d) => ({ id: d.id, bounds: d.bounds, workArea: d.workArea, scaleFactor: d.scaleFactor, primary: d.id === screen.getPrimaryDisplay().id }));
      const live = __statusWin && !__statusWin.isDestroyed() ? __statusWin.getBounds() : null;
      return reply(res, { ok: true, list: list, window: live });
    }
    if (p === "/state") return reply(res, __statusState());
    if (p === "/open") {
      const target = u.searchParams.get("url") || "";
      const okHttp = /^http:\/\/127\.0\.0\.1:\d+\//.test(target);
  const okFile = target.indexOf(__ST_PAGE_PREFIX__) === 0;
      if (!okHttp && !okFile) return reply(res, { ok: false, error: "bad-url" });
      return reply(res, await __statusOpen(target));
    }
    if (p === "/notify") {
      const title = String(u.searchParams.get("title") || "Status badge").slice(0, 80);
      const bodyText = String(u.searchParams.get("body") || "").slice(0, 200);
      try { __statusToast(title, bodyText); return reply(res, { ok: true, toast: "ok" }); } catch (err) { return reply(res, { ok: false, toast: String(err && err.message ? err.message : err), stack: String(err && err.stack ? String(err.stack).slice(0, 300) : "") }); }
      return reply(res, { ok: true });
    }
    if (p === "/shot") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      try {
        const image = await __statusWin.webContents.capturePage();
        const out = __stReq("node:path").join(__stReq("node:path").dirname(__stPortFile), "window.png");
        __stReq("node:fs").writeFileSync(out, image.toPNG());
        return reply(res, { ok: true, path: out });
      } catch (err) {
        return reply(res, { ok: false, error: String(err && err.message ? err.message : err) });
      }
    }    if (p === "/close") {
      if (__statusWin && !__statusWin.isDestroyed()) { try { __statusWin.close(); } catch {} }
      return reply(res, { ok: true, open: false });
    }
    if (p === "/layer") {
      const mode = String(u.searchParams.get("value") || "normal");
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      try {
        if (mode === "top") {
          __statusWin.setAlwaysOnTop(true, "screen-saver");
          __statusWin.__statusBottom = false;
          __statusWin.setFocusable(true);
          __statusWin.setIgnoreMouseEvents(false);
          __statusWin.show();
          __statusWin.moveTop();
        } else if (mode === "bottom") {
          __statusWin.setAlwaysOnTop(false);
          __statusWin.__statusBottom = true;
          __statusWin.setFocusable(false);
          __statusWin.setIgnoreMouseEvents(true, { forward: true });
          __statusWin.showInactive();
          __statusWin.blur();
        } else {
          __statusWin.setAlwaysOnTop(false);
          __statusWin.__statusBottom = false;
          __statusWin.setFocusable(true);
          __statusWin.setIgnoreMouseEvents(false);
          __statusWin.show();
        }
      } catch {}
      __statusWin.__statusLayer = mode;
      __statusLayer = mode;
      return reply(res, { ok: true, layer: mode });
    }
    if (p === "/pinpos") {
      const on = u.searchParams.get("value") === "1";
      if (__statusWin && !__statusWin.isDestroyed()) __statusWin.__statusPinned = on;
      return reply(res, { ok: true, pinned: on });
    }
    if (p === "/alpha") {
      const raw = Number(u.searchParams.get("value"));
      const pct = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 100;
      __statusAlpha = pct;
      if (__statusWin && !__statusWin.isDestroyed()) {
        try { await __statusWin.webContents.executeJavaScript("window.__setAlpha(" + String(pct) + ")"); } catch {}
      }
      return reply(res, { ok: true, alpha: pct });
    }
    if (p === "/opacity") {
      const v = Number(u.searchParams.get("value"));
      const a = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
      if (__statusWin && !__statusWin.isDestroyed()) { try { __statusWin.setOpacity(a); } catch {} }
      return reply(res, { ok: true, alpha: a });
    }
    if (p === "/maximize" || p === "/togglemax") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      const { screen } = __stReq("electron");
      if (__statusWin.__statusMaxed === true) {
        const back = __statusWin.__statusRestore || { x: 200, y: 200, width: 720, height: 780 };
        try { __statusWin.setBounds(back); } catch {}
        __statusWin.__statusMaxed = false;
        __statusPos = { x: back.x, y: back.y };
        __statusSize = { width: back.width, height: back.height };
        return reply(res, { ok: true, maxed: false, bounds: __statusBounds() });
      }
      const area = screen.getDisplayMatching(__statusWin.getBounds()).workArea;
      __statusWin.__statusRestore =
        __statusPos && __statusSize
          ? { x: __statusPos.x, y: __statusPos.y, width: __statusSize.width, height: __statusSize.height }
          : (__statusLiveBounds() || __statusWin.getBounds());
      try { __statusWin.setBounds(area); } catch {}
      __statusWin.__statusMaxed = true;
      __statusPos = { x: area.x, y: area.y };
      __statusSize = { width: area.width, height: area.height };
      return reply(res, { ok: true, maxed: true, bounds: __statusBounds() });
    }
    if (p === "/restore") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      const back = __statusWin.__statusRestore || { x: 200, y: 200, width: 720, height: 780 };
      try { __statusWin.setBounds(back); } catch {}
      __statusWin.__statusMaxed = false;
      __statusPos = { x: back.x, y: back.y };
      __statusSize = { width: back.width, height: back.height };
      return reply(res, { ok: true, maxed: false, bounds: __statusBounds() });
    }
    if (p === "/move") {
      if (__statusWin && (__statusWin.__statusPinned === true || __statusWin.__statusBottom === true)) {
        return reply(res, { ok: false, reason: "locked" });
      }
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      if (__statusWin.__statusPinned === true) return reply(res, { ok: true, pinned: true, bounds: __statusBounds() });
      const x = Number(u.searchParams.get("x"));
      const y = Number(u.searchParams.get("y"));
      if (Number.isFinite(x) && Number.isFinite(y)) {
        __statusPos = { x: Math.round(x), y: Math.round(y) };
        try { __statusWin.setPosition(__statusPos.x, __statusPos.y); } catch {}
      }
      return reply(res, { ok: true, bounds: __statusBounds() });
    }
    if (p === "/size") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      const h = Math.round(Number(u.searchParams.get("h")));
      if (!Number.isFinite(h) || h < 120) return reply(res, { ok: false, reason: "bad height" });
      if (__statusWin.__statusMaxed === true) return reply(res, { ok: true, skipped: "maxed" });
      const live = __statusLiveBounds();
      const clipped = Math.max(120, Math.min(2000, h));
      const width = Math.max(460, live.width);
      __statusSize = { width: width, height: clipped };
      __statusPos = { x: live.x, y: live.y };
      try { __statusWin.setBounds({ x: live.x, y: live.y, width: width, height: clipped }); } catch {}
      return reply(res, { ok: true, bounds: __statusBounds() });
    }
    if (p === "/reload") {
      try {
        const { BrowserWindow } = __stReq("electron");
        const list = BrowserWindow.getAllWindows().filter((w) => !w.isDestroyed() && w !== __statusWin);
        for (const w of list) {
          try { w.webContents.reloadIgnoringCache(); } catch {}
        }
        return reply(res, { ok: true, reloaded: list.length });
      } catch (err) {
        return reply(res, { ok: false, reason: String((err && err.message) || err) });
      }
    }
    if (p === "/dragstart") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      const mx = Number(u.searchParams.get("x"));
      const my = Number(u.searchParams.get("y"));
      if (__statusWin.__statusMaxed === true) {
        const back = __statusWin.__statusRestore && typeof __statusWin.__statusRestore === "object"
          ? __statusWin.__statusRestore
          : { x: 200, y: 200, width: 720, height: 780 };
        __statusWin.__statusMaxed = false;
        __statusWin.__statusRestore = null;
        __statusPos = { x: back.x, y: back.y };
        __statusSize = { width: back.width, height: back.height };
      }
      const size = __statusSize && typeof __statusSize === "object" ? __statusSize : { width: 720, height: 780 };
      const x = Number.isFinite(mx) ? Math.round(mx - size.width / 2) : (__statusPos ? __statusPos.x : 200);
      const y = Number.isFinite(my) ? Math.round(my - 14) : (__statusPos ? __statusPos.y : 200);
      __statusPos = { x: x, y: y };
      try { __statusWin.setBounds({ x: x, y: y, width: size.width, height: size.height }); } catch {}
      return reply(res, { ok: true, bounds: __statusBounds(), size: size });
    }
    if (p === "/appreload") {
      let reloaded = 0;
      try {
        const bw = __stReq("electron").BrowserWindow;
        for (const win of bw.getAllWindows()) {
          if (win === __statusWin || win.isDestroyed()) continue;
          try {
            win.webContents.reloadIgnoringCache();
            reloaded += 1;
          } catch {}
        }
      } catch {}
      return reply(res, { ok: true, reloaded: reloaded });
    }
    if (p === "/reset") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false });
      const { screen } = __stReq("electron");
      const area = screen.getPrimaryDisplay().workArea;
      const size = { width: 720, height: 780 };
      const x = Math.round(area.x + Math.max(0, (area.width - size.width) / 2));
      const y = Math.round(area.y + Math.max(0, (area.height - size.height) / 2));
      __statusPos = { x, y };
      __statusSize = size;
      __statusWin.__statusMaxed = false;
      __statusWin.__statusRestore = null;
      try { __statusWin.setBounds({ x, y, width: size.width, height: size.height }); } catch {}
      return reply(res, { ok: true, bounds: __statusBounds() });
    }
    if (p === "/focus") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, open: false, visible: false });
      try {
        __statusWin.restore();
        __statusWin.show();
        __statusWin.moveTop();
        __statusWin.focus();
        __statusWin.setAlwaysOnTop(true, "screen-saver");
      } catch {}
      return reply(res, { ok: true, open: true, visible: __statusWin.isVisible(), bounds: __statusBounds() });
    }
    if (p === "/pin") {
      const on = u.searchParams.get("value") !== "0";
      if (__statusWin && !__statusWin.isDestroyed()) { try { __statusWin.setAlwaysOnTop(on, "screen-saver"); } catch {} }
      return reply(res, { ok: true, pinned: on });
    }
    if (p === "/passthrough") {
      const on = u.searchParams.get("value") === "1";
      if (__statusWin && !__statusWin.isDestroyed()) {
        try { __statusWin.setIgnoreMouseEvents(on, { forward: true }); __statusWin.setFocusable(!on); __statusWin.__statusPassthrough = on; } catch {}
      }
      return reply(res, { ok: true, passthrough: on });
    }
    if (p === "/html") {
      if (!__statusWin || __statusWin.isDestroyed()) return reply(res, { ok: false, reason: "no-window" });
      let out = "";
      try {
        out = await __statusWin.webContents.executeJavaScript(
          "JSON.stringify({title: document.title, len: document.documentElement ? document.documentElement.outerHTML.length : -1})"
        );
      } catch (err) {
        out = "ERR " + String(err && err.message ? err.message : err);
      }
      return reply(res, { ok: true, out });
    }
    return reply(res, { ok: false, error: "not-found" });
  });
  srv.listen(0, "127.0.0.1", () => {
    const port = srv.address().port;
    try { __stReq("node:fs").writeFileSync(__stPortFile, String(port)); } catch {}
    try { __stReq("node:fs").appendFileSync(__ST_LOG_FILE__, "bridge up on " + port + String.fromCharCode(10)); } catch {}
  });
}
/* __statusBridgeV2:end */
