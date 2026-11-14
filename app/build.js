// SHIFT STUDIO — static build script
// Copies src/pages/*.html into dist (index at root, each route in its own folder) + assets.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// assets
fs.cpSync(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });

// pages: page-name.html -> dist/<page>/index.html (index -> dist/index.html)
const pagesDir = path.join(SRC, 'pages');
for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith('.html')) continue;
  const name = path.basename(file, '.html');
  let html = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  // strip comments, collapse blank lines
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*\n+/g, '\n');
  if (name === 'index') {
    fs.writeFileSync(path.join(DIST, 'index.html'), html);
  } else {
    const dir = path.join(DIST, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
}

console.log('build ok ->', DIST);
