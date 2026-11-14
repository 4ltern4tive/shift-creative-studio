// Minimal Chrome DevTools Protocol driver (no dependencies, Node 22+ global WebSocket).
// Usage: const cdp = await require('./cdp.js').launch(); const page = await cdp.page();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

async function launch() {
  const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('no chrome/edge found');
  const port = 9300 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-profile-'));
  const proc = spawn(exe, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--hide-scrollbars',
    '--disable-gpu',
    '--force-device-scale-factor=1',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const base = `http://127.0.0.1:${port}`;
  let targets = null;
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`${base}/json/list`);
      targets = await res.json();
      if (targets.some((t) => t.type === 'page')) break;
    } catch (e) { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!targets) { proc.kill(); throw new Error('chrome did not start'); }
  const target = targets.find((t) => t.type === 'page');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let mid = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++mid;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const waitEvent = (method, timeoutMs = 30000) => new Promise((resolve, reject) => {
    const t0 = Date.now();
    const check = () => {
      const idx = events.findIndex((e) => e.method === method);
      if (idx >= 0) { resolve(events.splice(idx, 1)[0]); return true; }
      if (Date.now() - t0 > timeoutMs) { reject(new Error('timeout waiting ' + method)); return true; }
      return false;
    };
    const timer = setInterval(() => { if (check()) clearInterval(timer); }, 50);
  });

  const page = {
    send,
    async goto(url, waitMs = 4000) {
      await send('Page.enable');
      await send('Runtime.enable');
      const loaded = waitEvent('Page.loadEventFired', 45000).catch(() => {});
      await send('Page.navigate', { url });
      await loaded;
      await new Promise((r) => setTimeout(r, waitMs));
    },
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
      return r.result.value;
    },
    async setViewport(width, height, mobile = false) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    },
    async screenshot(file, fullPage = true) {
      await send('Page.enable');
      const params = { format: 'png', captureBeyondViewport: !!fullPage };
      if (fullPage) {
        const metrics = await send('Page.getLayoutMetrics');
        params.clip = { x: 0, y: 0, width: Math.ceil(metrics.cssContentSize.width), height: Math.ceil(Math.min(metrics.cssContentSize.height, 20000)), scale: 1 };
      }
      const shot = await send('Page.captureScreenshot', params);
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      return file;
    },
    async scrollThrough(step = 700, pauseMs = 220) {
      await this.eval(`(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += ${step}) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, ${pauseMs})); }
        window.scrollTo(0, h); await new Promise(r => setTimeout(r, ${pauseMs * 2}));
        window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
      })()`);
    },
    close() { try { ws.close(); } catch (e) {} try { proc.kill(); } catch (e) {} try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {} },
  };
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  return page;
}

module.exports = { launch };
