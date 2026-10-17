// Renders launcher icons, splash screens and the web home-screen icon into the Android project and web/assets.
// Usage: node tools/make-icons.mjs   (needs Playwright with Chromium)
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname), web = path.join(root, '..'), res = path.join(web, '..', 'android', 'app', 'src', 'main', 'res');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const js = (await esbuild.build({ entryPoints: [path.join(root, 'icons-entry.js')], bundle: true, write: false, format: 'iife' })).outputFiles[0].text;
const font = fs.readFileSync(path.join(web, 'node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2')).toString('base64');
const html = `<!doctype html><style>@font-face{font-family:Fredoka;font-weight:700;src:url(data:font/woff2;base64,${font})}</style><body><span style="font:700 20px Fredoka">.</span><script>${js}</script>`;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.setContent(html); await page.evaluate(() => document.fonts.ready);
const save = (file, b64) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(b64, 'base64')); };
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(dens)){
  save(path.join(res, `mipmap-${d}`, 'ic_launcher.png'), await page.evaluate(s => makeIcon(s, 'full'), Math.round(48 * k)));
  save(path.join(res, `mipmap-${d}`, 'ic_launcher_round.png'), await page.evaluate(s => makeIcon(s, 'round'), Math.round(48 * k)));
  save(path.join(res, `mipmap-${d}`, 'ic_launcher_foreground.png'), await page.evaluate(s => makeIcon(s, 'fg'), Math.round(108 * k)));
}
const splashes = { 'drawable': [480, 320], 'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720], 'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280], 'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280], 'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920] };
for (const [dir, [w, h]] of Object.entries(splashes)) save(path.join(res, dir, 'splash.png'), await page.evaluate(([w, h]) => makeSplash(w, h), [w, h]));
save(path.join(web, 'assets', 'icon-180.png'), await page.evaluate(() => makeIcon(180, 'full')));
save(path.join(web, 'assets', 'icon-512.png'), await page.evaluate(() => makeIcon(512, 'full')));
await browser.close();
console.log('Icons and splash screens written.');
