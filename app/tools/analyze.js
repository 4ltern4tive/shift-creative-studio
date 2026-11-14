// Analyze a page (live or local): full-page screenshots + DOM outline with computed styles + image inventory.
// Usage: node analyze.js <url> <outPrefix> [w1,w2,w3]
const fs = require('fs');
const path = require('path');
const cdp = require('./cdp.js');

const EXTRACT = `(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    return r.width > 1 && r.height > 1;
  };
  const pick = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 90),
      framer: el.getAttribute && (el.getAttribute('data-framer-name') || ''),
      x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height),
      text: (el.childElementCount === 0 ? el.textContent : '').trim().slice(0, 160),
      fs: s.fontSize, fw: s.fontWeight, ff: s.fontFamily.split(',')[0].replace(/"/g, ''),
      col: s.color, bg: s.backgroundColor, lh: s.lineHeight, ls: s.letterSpacing,
      ta: s.textAlign, tt: s.textTransform, br: s.borderRadius, pad: s.padding, op: s.opacity,
    };
  };
  const out = { text: [], imgs: [], sections: [] };
  const seen = new Set();
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,span,li,label,input,textarea').forEach((el) => {
    if (!vis(el)) return;
    const t = (el.childElementCount === 0 ? el.textContent : '').trim();
    if (!t) return;
    const key = t.slice(0, 60) + '|' + Math.round(el.getBoundingClientRect().y);
    if (seen.has(key)) return;
    seen.add(key);
    out.text.push(pick(el));
  });
  document.querySelectorAll('img,video,canvas,svg image').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const src = el.currentSrc || el.src || el.getAttribute('href') || el.getAttribute('xlink:href') || el.tagName.toLowerCase();
    out.imgs.push({ src: String(src).slice(0, 220), x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), alt: (el.alt || '').slice(0, 60) });
  });
  // sections = named framer blocks and direct structural children of main
  document.querySelectorAll('[data-framer-name]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height < 8) return;
    const s = getComputedStyle(el);
    out.sections.push({ name: el.getAttribute('data-framer-name'), tag: el.tagName.toLowerCase(), x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundColor, bgi: s.backgroundImage.slice(0, 120), br: s.borderRadius, op: s.opacity, ov: s.overflow });
  });
  out.pageH = document.documentElement.scrollHeight;
  out.bodyBg = getComputedStyle(document.body).backgroundColor;
  out.htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  return out;
})()`;

async function main() {
  const [url, prefix, widthsArg] = process.argv.slice(2);
  const widths = (widthsArg || '1440,390').split(',').map(Number);
  const outDir = path.dirname(prefix);
  fs.mkdirSync(outDir, { recursive: true });
  const page = await cdp.launch();
  try {
    for (const w of widths) {
      const mobile = w < 700;
      const h = mobile ? 844 : 900;
      await page.setViewport(w, h, mobile);
      await page.goto(url, w === widths[0] ? 6000 : 2500);
      await page.scrollThrough(700, 200);
      await page.screenshot(`${prefix}-${w}.png`, true);
      const data = await page.eval(EXTRACT);
      fs.writeFileSync(`${prefix}-${w}.json`, JSON.stringify(data, null, 1));
      console.log(`done ${w}: pageH=${data.pageH} texts=${data.text.length} imgs=${data.imgs.length} sections=${data.sections.length}`);
    }
  } finally { page.close(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
