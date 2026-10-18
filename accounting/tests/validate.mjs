// Checks the book's content for accounting and structural errors:
//   - every journal entry (lessons, videos, practice answers) has equal debits and credits
//   - every accounting-equation frame balances
//   - statement rows marked as totals add up where a check is declared
//   - problems are well formed (answer indexes in range, numeric answers are numbers, ids unique)
// Run: node accounting/tests/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = vm.createContext({ console });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(js\/(?:core\.js|chapters\/[^"]+))"><\/script>/g)].map((m) => m[1]);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });
const Book = ctx.Book;

const errors = [];
const err = (where, msg) => errors.push(where + ': ' + msg);
const near = (a, b) => Math.abs(a - b) < 0.005;
const sum = (g) => Object.values(g || {}).reduce((s, v) => s + v, 0);

function checkEntry(where, lines) {
  let d = 0, c = 0;
  for (const l of lines) {
    if (!Array.isArray(l) || typeof l[0] !== 'string') { err(where, 'malformed line ' + JSON.stringify(l)); continue; }
    if ((l[1] || 0) && (l[2] || 0)) err(where, 'line has both debit and credit: ' + l[0]);
    if (!(l[1] || 0) && !(l[2] || 0)) err(where, 'line has no amount: ' + l[0]);
    d += l[1] || 0; c += l[2] || 0;
  }
  if (!near(d, c)) err(where, `debits ${d} != credits ${c}`);
}

Book.lessonEntries.forEach((e, i) => checkEntry('lesson entry #' + i + ' (' + (e.date || '') + ' ' + (e.memo || e.lines[0][0]) + ')', e.lines));

const ids = new Set();
let problems = 0, steps = 0;
for (const c of Book.chapters) {
  const C = c.id;
  if (ids.has(C)) err(C, 'duplicate chapter id');
  ids.add(C);
  for (const k of ['title', 'short', 'blurb', 'lesson', 'objectives', 'terms', 'videos', 'practice']) if (!c[k]) err(C, 'missing ' + k);
  if (!(c.part >= 1 && c.part <= 4)) err(C, 'bad part');

  const vids = new Set();
  c.videos.forEach((v, vi) => {
    const V = `${C} video ${v.id}`;
    if (vids.has(v.id)) err(V, 'duplicate video id');
    vids.add(v.id);
    if (!v.steps[0].f) err(V, 'first step has no frame');
    let cur = null;
    v.steps.forEach((s, si) => {
      steps++;
      const W = `${V} step ${si + 1}`;
      if (!s.say) err(W, 'missing narration');
      if (s.f) cur = s.f;
      const f = cur;
      const frames = f.k === 'split' ? [f.a, f.b] : [f];
      frames.forEach((fr) => {
        if (!fr || !fr.k) { err(W, 'frame without kind'); return; }
        if (s.f && fr.k === 'eq' && !fr.unbalanced && !near(sum(fr.A), sum(fr.L) + sum(fr.E))) err(W, `equation out of balance: A ${sum(fr.A)} vs L+E ${sum(fr.L) + sum(fr.E)}`);
        if (s.f && fr.k === 'je') fr.entries.forEach((e, ei) => checkEntry(W + ' entry ' + (ei + 1), e.lines));
        if (s.f && fr.k === 't' && fr.check) {
          let d = 0, cr = 0;
          fr.accts.forEach((a) => { const b = Book.tBalance(a.dr || [], a.cr || []); if (b > 0) d += b; else cr -= b; });
          if (!near(d, cr)) err(W, `T-account balances don't total equal: ${d} vs ${cr}`);
        }
        if (s.f && fr.k === 'stmt' && fr.check) {
          for (const [a, b] of fr.check) if (!near(fr.rows[a][1], fr.rows[b][1])) err(W, `stmt rows ${a} and ${b} should match (${fr.rows[a][1]} vs ${fr.rows[b][1]})`);
        }
      });
    });
  });

  c.practice.forEach((p, i) => {
    problems++;
    const P = `${C} problem ${i + 1}`;
    if (!p.q) err(P, 'no question');
    if (!p.explain) err(P, 'no explanation');
    if (p.type === 'mc') {
      if (!(p.answer >= 0 && p.answer < p.choices.length)) err(P, 'answer index out of range');
      if (new Set(p.choices).size !== p.choices.length) err(P, 'duplicate choices');
    } else if (p.type === 'num') {
      if (typeof p.answer !== 'number' || Number.isNaN(p.answer)) err(P, 'numeric answer missing');
    } else if (p.type === 'fill') {
      p.blanks.forEach((b) => { if (typeof b.a !== 'number' || Number.isNaN(b.a)) err(P, 'blank answer missing: ' + b.l); });
    } else if (p.type === 'je') {
      checkEntry(P, p.answer);
      if (!p.opts || p.opts.length < 2) err(P, 'needs distractor accounts in opts');
    } else if (p.type === 'classify') {
      p.items.forEach((it) => { if (!(it[1] >= 0 && it[1] < p.cats.length)) err(P, 'category out of range: ' + it[0]); });
    } else err(P, 'unknown type ' + p.type);
  });
}
Book.quick.forEach((p, i) => {
  if (p.type === 'mc' && !(p.answer >= 0 && p.answer < p.choices.length)) err('quick check ' + i, 'answer out of range');
  if (p.type === 'je') checkEntry('quick check ' + i, p.answer);
});

console.log(`${Book.chapters.length} chapters · ${Book.chapters.reduce((s, c) => s + c.videos.length, 0)} videos (${steps} steps) · ${problems} practice problems · ${Book.quick.length} inline checks · ${Book.lessonEntries.length} lesson journal entries`);
if (errors.length) {
  console.error(errors.length + ' problem(s):\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('All entries balance and every problem is well formed.');
