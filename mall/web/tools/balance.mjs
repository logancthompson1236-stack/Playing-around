// Plays the simulation headlessly with a simple "attentive player" and prints one line per day.
// Usage: node tools/balance.mjs [days] [seed]
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const root = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(os.tmpdir(), `mall-balance-${process.pid}.mjs`);
await esbuild.build({ entryPoints: [path.join(root, 'balance-run.js')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error', define: { __VERSION__: '"bot"' } });
await import(out);
fs.unlinkSync(out);
