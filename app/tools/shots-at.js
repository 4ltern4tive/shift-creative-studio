// Viewport screenshots at scroll offsets: node shots-at.js <url> <prefix> <width> <y1,y2,...>
const fs = require('fs');
const cdp = require('./cdp.js');
(async () => {
  const [url, prefix, wArg, ysArg] = process.argv.slice(2);
  const w = Number(wArg), ys = ysArg.split(',').map(Number);
  const mobile = w < 700;
  const page = await cdp.launch();
  try {
    await page.setViewport(w, mobile ? 844 : 900, mobile);
    await page.goto(url, 5000);
    await page.eval('window.scrollTo(0, document.documentElement.scrollHeight)'); // trigger lazy loads
    await new Promise(r => setTimeout(r, 1200));
    await page.eval('window.scrollTo(0, 0)');
    await new Promise(r => setTimeout(r, 500));
    for (const y of ys) {
      await page.eval(`window.scrollTo(0, ${y})`);
      await new Promise(r => setTimeout(r, 900));
      await page.screenshot(`${prefix}-y${y}.png`, false);
      console.log('shot', y);
    }
  } finally { page.close(); }
})().catch(e => { console.error(e); process.exit(1); });
