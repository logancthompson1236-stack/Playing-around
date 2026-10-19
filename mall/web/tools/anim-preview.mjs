// Renders the animation preview scenes (tools/anim-entry.js) to PNG frame strips, and writes a page that plays them live.
// Usage: node tools/anim-preview.mjs [outDir]   (needs Playwright with Chromium)
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname), web = path.join(root, '..');
const out = path.resolve(process.argv[2] || path.join(web, 'out', 'anim'));
fs.mkdirSync(out, { recursive: true });
const pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'), chromium = pw.chromium || pw.default.chromium;
const js = (await esbuild.build({ entryPoints: [path.join(root, 'anim-entry.js')], bundle: true, write: false, format: 'iife', define: { __VERSION__: '"preview"' } })).outputFiles[0].text;
const font = fs.readFileSync(path.join(web, 'node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2')).toString('base64');
const head = `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:Fredoka;font-weight:700;src:url(data:font/woff2;base64,${font})}</style>`;
fs.writeFileSync(path.join(out, 'live.html'), `${head}<body style="background:#f4ecf7;font:14px sans-serif"><div id="g" style="display:flex;flex-wrap:wrap;gap:8px"></div><script>${js.replace(/<\/script/gi, '<\\/script')}
for (const n of Object.keys(scenes)){ const d = document.createElement('div'); d.innerHTML = '<div>' + n + '</div>'; const c = document.createElement('canvas'); c.width = 280; c.height = 300; d.appendChild(c); g.appendChild(d); live(c, n); }</script>`);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
page.on('pageerror', e => console.error(e));
await page.setContent(`${head}<body><span style="font:700 20px Fredoka">.</span><script>${js.replace(/<\/script/gi, '<\\/script')}</script>`);
await page.evaluate(() => document.fonts.ready);
const names = await page.evaluate(() => Object.keys(scenes));
const only = process.env.SCENES ? process.env.SCENES.split(',') : names;
for (const n of only){
  const cyc = await page.evaluate(n => cycleOf(n), n), N = +(process.env.FRAMES || 8);
  const times = Array.from({ length: N }, (_, i) => +(i * cyc / N).toFixed(3));
  const url = await page.evaluate(([n, times]) => sheet(n, times), [n, times]);
  fs.writeFileSync(path.join(out, `${n}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
console.log(`Wrote ${only.length} strips and live.html to ${out}`);
