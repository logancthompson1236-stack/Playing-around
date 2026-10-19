// Bundles the game into one self-contained HTML file:
//   dist/index.html  -> single-file build (game, styles and fonts inlined). Capacitor copies dist/ into the app.
//   out/embed.html   -> body-only variant for hosts that supply their own document skeleton.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const root = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(root, 'dist');
const out = path.join(root, 'out');
const serve = process.argv.includes('--serve');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(out, { recursive: true });

const result = await esbuild.build({
  entryPoints: [path.join(root, 'src', 'main.js')],
  bundle: true,
  minify: !serve,
  format: 'iife',
  target: ['chrome90', 'safari15'],
  write: false,
  define: { __VERSION__: JSON.stringify(pkg.version) },
  legalComments: 'none',
  logLevel: 'info',
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// Fonts are inlined so the app works offline.
const fontFiles = [
  ['Fredoka', 500, 'fredoka'], ['Fredoka', 600, 'fredoka'], ['Fredoka', 700, 'fredoka'],
  ['Nunito', 600, 'nunito'], ['Nunito', 800, 'nunito'],
];
const fonts = fontFiles.map(([family, weight, dir]) => {
  const file = path.join(root, 'node_modules', '@fontsource', dir, 'files', `${dir}-latin-${weight}-normal.woff2`);
  const b64 = fs.readFileSync(file).toString('base64');
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
}).join('\n');

const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8').replace('/*FONTS*/', () => fonts);
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script src="game.js"></script>', () => `<script>\n${js}\n</script>`);
// Home-screen icon and web app manifest, inlined as data URIs so the single file stays self-contained.
const png = f => `data:image/png;base64,${fs.readFileSync(path.join(root, 'assets', f)).toString('base64')}`;
const manifest = { name: 'Mall Revival', short_name: 'Mall Revival', display: 'fullscreen', orientation: 'landscape', background_color: '#2d2236', theme_color: '#2d2236', icons: [{ src: png('icon-512.png'), sizes: '512x512', type: 'image/png' }] };
html = html.replaceAll('href="assets/icon-180.png"', () => `href="${png('icon-180.png')}"`);
html = html.replace('href="manifest.json"', () => `href="data:application/manifest+json,${encodeURIComponent(JSON.stringify(manifest))}"`);
fs.writeFileSync(path.join(dist, 'index.html'), html);
// The offline service worker sits next to the page on GitHub Pages (the page registers it; see main.js).
fs.copyFileSync(path.join(root, 'sw.js'), path.join(dist, 'sw.js'));

const title = html.match(/<title>[\s\S]*?<\/title>/)[0];
const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(path.join(out, 'embed.html'), `${title}\n${style}\n${body}`);
console.log(`Built Mall Revival v${pkg.version}: dist/index.html (${(html.length / 1024).toFixed(0)} KB)`);

if (serve) {
  const port = 8080;
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(dist, 'index.html')).pipe(res);
  }).listen(port, () => console.log(`Serving on http://localhost:${port}`));
}
