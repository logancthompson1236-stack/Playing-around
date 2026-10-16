// Bundles the game and writes:
//   dist/            -> web build (index.html, style.css, game.js)
//   dist/shardfall.html -> single-file build (everything inlined)
//   ../android/app/src/main/assets/www -> copy for the APK
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const root = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(root, 'dist');
const androidAssets = path.join(root, '..', 'android', 'app', 'src', 'main', 'assets', 'www');
const serve = process.argv.includes('--serve');

fs.mkdirSync(dist, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, 'src', 'main.js')],
  bundle: true,
  minify: !serve,
  format: 'iife',
  target: ['chrome80'],
  outfile: path.join(dist, 'game.js'),
  legalComments: 'none',
  logLevel: 'info',
});

fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(dist, 'style.css'));

// Single-file variant.
const js = fs.readFileSync(path.join(dist, 'game.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script src="game.js"></script>', () => `<script>\n${js}\n</script>`);
fs.writeFileSync(path.join(dist, 'shardfall.html'), html);

// Body-only variant for hosts that supply their own document skeleton.
const title = html.match(/<title>[\s\S]*?<\/title>/)[0];
const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(path.join(dist, 'shardfall-embed.html'), `${title}\n${style}\n${body}`);

if (fs.existsSync(path.join(root, '..', 'android'))) {
  fs.mkdirSync(androidAssets, { recursive: true });
  for (const f of ['index.html', 'style.css', 'game.js']) fs.copyFileSync(path.join(dist, f), path.join(androidAssets, f));
  console.log('Copied web build into Android assets.');
}

if (serve) {
  const port = 8080;
  http.createServer((req, res) => {
    const f = path.join(dist, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(dist) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(f)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(f).pipe(res);
  }).listen(port, () => console.log(`Serving on http://localhost:${port}`));
}
