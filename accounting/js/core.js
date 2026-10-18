/* Balanced Books core: chapter registry, number formatting, progress storage and the
   HTML helpers chapter files use to draw journal entries, statements and T-accounts.
   Nothing here touches the DOM, so tests/validate.mjs can load it in Node. */
(function (root) {
  'use strict';

  const chapters = [];
  const quick = [];          // inline "check yourself" problems, referenced by index from lesson HTML
  const lessonEntries = [];  // every journal entry drawn in a lesson, so the validator can check it balances

  function chapter(c) {
    chapters.push(c);
    chapters.sort((a, b) => a.num - b.num);
  }

  // ---------- numbers ----------

  function fmt(n, opts) {
    opts = opts || {};
    if (n === null || n === undefined || n === '' || Number.isNaN(n)) return '';
    const neg = n < 0;
    const abs = Math.abs(n);
    const dec = opts.dec !== undefined ? opts.dec : (Math.abs(Math.round(abs) - abs) < 1e-9 ? 0 : 2);
    const s = abs.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const body = (opts.cur ? '$' : '') + s;
    return neg ? '(' + body + ')' : body;
  }
  const money = (n) => fmt(n, { cur: true });

  // Accepts "$1,234.50", "(500)", "-500", "12.5%", "1.2x", " 4 ".
  function parseNum(str) {
    if (typeof str === 'number') return str;
    if (str === null || str === undefined) return NaN;
    let s = String(str).trim();
    if (!s) return NaN;
    let neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/[$,%\s]/g, '').replace(/(x|times|days)$/i, '');
    if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
    if (!/^\d*\.?\d+$/.test(s)) return NaN;
    const v = parseFloat(s);
    return neg ? -v : v;
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- lesson HTML helpers ----------

  // lines: [[account, debit, credit], ...]. One entry, or pass {entries:[{date, lines, memo}]} via jeMany.
  function je(lines, opts) {
    return jeMany([Object.assign({ lines: lines }, opts || {})]);
  }

  // noRecord: drawn at runtime (a practice solution), not part of a lesson the validator should see.
  function jeMany(entries, noRecord) {
    let rows = '';
    entries.forEach((e, i) => {
      if (!noRecord) lessonEntries.push(e);
      e.lines.forEach((l, j) => {
        const isCr = !l[1] && l[2];
        rows += '<tr' + (j === 0 && i > 0 ? ' class="gap"' : '') + '>' +
          '<td class="jdate">' + (j === 0 && e.date ? esc(e.date) : '') + '</td>' +
          '<td class="jacct' + (isCr ? ' cr' : '') + '">' + esc(l[0]) + '</td>' +
          '<td class="num dr">' + (l[1] ? fmt(l[1]) : '') + '</td>' +
          '<td class="num cr">' + (l[2] ? fmt(l[2]) : '') + '</td></tr>';
      });
      if (e.memo) rows += '<tr class="memo"><td></td><td colspan="3">' + esc(e.memo) + '</td></tr>';
    });
    return '<div class="scroll-x"><table class="jtable"><thead><tr><th class="jdate">Date</th><th>Account</th>' +
      '<th class="num dr">Debit</th><th class="num cr">Credit</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  // rows: [label, amount, flags]. Flags: h heading (no number), i indent, ii double indent,
  // L inner column, u single rule under the number, d double rule (final total), b bold, $ currency sign.
  function stmtRowsHTML(rows, hi, shown) {
    const hiSet = new Set([].concat(hi === undefined ? [] : hi));
    return rows.map((r, idx) => {
      const [label, amt, flags = ''] = r;
      const cls = [];
      if (flags.includes('h')) cls.push('head');
      if (flags.includes('ii')) cls.push('ind2'); else if (flags.includes('i')) cls.push('ind');
      if (flags.includes('b')) cls.push('bold');
      if (hiSet.has(idx)) cls.push('hi');
      if (shown !== undefined && idx >= shown) cls.push('later');
      const inner = flags.includes('L');
      const num = amt === null || amt === undefined || amt === '' ? '' :
        (typeof amt === 'string' ? esc(amt) : fmt(amt, { cur: flags.includes('$') }));
      const rule = flags.includes('d') ? ' rule-d' : flags.includes('u') ? ' rule-u' : '';
      return '<tr class="' + cls.join(' ') + '"><td class="sl">' + esc(label) + '</td>' +
        '<td class="num' + (inner ? rule : '') + '">' + (inner ? num : '') + '</td>' +
        '<td class="num' + (inner ? '' : rule) + '">' + (inner ? '' : num) + '</td></tr>';
    }).join('');
  }

  function stmt(title, sub, rows) {
    const cap = title || sub ? '<caption>' + (title ? '<span class="stmt-co">' + esc(title) + '</span>' : '') +
      (sub ? '<span class="stmt-sub">' + esc(sub) + '</span>' : '') + '</caption>' : '';
    return '<div class="scroll-x"><table class="stmt' + (cap ? '' : ' bare') + '">' + cap + '<tbody>' +
      stmtRowsHTML(rows) + '</tbody></table></div>';
  }

  function tBalance(dr, cr) {
    const sum = (a) => a.reduce((s, x) => s + (Array.isArray(x) ? x[1] : x), 0);
    return sum(dr) - sum(cr);
  }

  function tacctHTML(name, dr, cr, opts) {
    opts = opts || {};
    const cell = (x) => Array.isArray(x)
      ? '<span class="tref">' + esc(x[0]) + '</span><span class="tamt">' + fmt(x[1]) + '</span>'
      : '<span class="tamt">' + fmt(x) + '</span>';
    const n = Math.max(dr.length, cr.length, 1);
    let rows = '';
    for (let i = 0; i < n; i++) {
      rows += '<div class="tside tdr">' + (dr[i] !== undefined ? cell(dr[i]) : '') + '</div>' +
        '<div class="tside tcr">' + (cr[i] !== undefined ? cell(cr[i]) : '') + '</div>';
    }
    const bal = tBalance(dr, cr);
    const balRow = opts.noBal ? '' :
      '<div class="tside tdr tbal">' + (bal > 0 ? '<span class="tref">Bal.</span><span class="tamt">' + fmt(bal) + '</span>' : '') + '</div>' +
      '<div class="tside tcr tbal">' + (bal < 0 ? '<span class="tref">Bal.</span><span class="tamt">' + fmt(-bal) + '</span>' : '') + '</div>';
    return '<div class="tacct' + (opts.cls ? ' ' + opts.cls : '') + '"><div class="tname">' + esc(name) + '</div><div class="tbody">' + rows + balRow + '</div></div>';
  }

  // accts: [{n, dr:[], cr:[]}]
  function tgrid(accts) {
    return '<div class="tgrid">' + accts.map((a) => tacctHTML(a.n, a.dr || [], a.cr || [], a)).join('') + '</div>';
  }

  function table(head, rows, opts) {
    opts = opts || {};
    const cellHTML = (c, tag) => {
      const isNum = typeof c === 'number';
      return '<' + tag + (isNum ? ' class="num"' : '') + '>' + (isNum ? fmt(c, { dec: opts.dec }) : c) + '</' + tag + '>';
    };
    return '<div class="scroll-x"><table class="grid' + (opts.cls ? ' ' + opts.cls : '') + '">' +
      (head ? '<thead><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead>' : '') +
      '<tbody>' + rows.map((r) => '<tr>' + r.map((c) => cellHTML(c, 'td')).join('') + '</tr>').join('') + '</tbody>' +
      (opts.foot ? '<tfoot><tr>' + opts.foot.map((c) => cellHTML(c, 'td')).join('') + '</tr></tfoot>' : '') +
      '</table></div>';
  }

  // Inline "check yourself" question inside a lesson.
  function qc(problem) {
    quick.push(problem);
    return '<div class="quick" data-quick="' + (quick.length - 1) + '"></div>';
  }

  function widget(name, opts) {
    return '<div class="widget" data-widget="' + name + '" data-opts="' + esc(JSON.stringify(opts || {})) + '"></div>';
  }

  // ---------- progress (per viewer, in this browser only) ----------

  const KEY = 'balanced-books.v1';
  let state = {};
  try { state = JSON.parse(root.localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  if (!state.ch) state.ch = {};

  function save() {
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: progress lasts this visit only */ }
  }
  function chState(id) {
    if (!state.ch[id]) state.ch[id] = { read: false, videos: {}, solved: {} };
    return state.ch[id];
  }
  const progress = {
    get: chState,
    markRead(id) { chState(id).read = true; save(); },
    markVideo(id, vid) { chState(id).videos[vid] = true; save(); },
    markSolved(id, key) { chState(id).solved[key] = true; save(); },
    resetPractice(id) { chState(id).solved = {}; save(); },
    setLast(id) { state.last = id; save(); },
    last() { return state.last; },
    getMisc(k) { return state[k]; },
    setMisc(k, v) { state[k] = v; save(); },
    summary(c) {
      const s = chState(c.id);
      const vids = c.videos.filter((v) => s.videos[v.id]).length;
      const solved = c.practice.filter((p, i) => s.solved['p' + i]).length;
      const total = 1 + c.videos.length + c.practice.length;
      const done = (s.read ? 1 : 0) + vids + solved;
      return { read: s.read, vids, solved, done, total, pct: done / total };
    },
    overall() {
      let d = 0, t = 0;
      chapters.forEach((c) => { const s = progress.summary(c); d += s.done; t += s.total; });
      return t ? d / t : 0;
    }
  };

  root.Book = {
    chapters, chapter, quick, lessonEntries,
    fmt, money, parseNum, esc,
    je, jeMany, stmt, stmtRowsHTML, tacctHTML, tgrid, tBalance, table, qc, widget,
    progress
  };
})(typeof window !== 'undefined' ? window : globalThis);
