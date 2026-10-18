/* Practice engine. Problem shapes:
     {type:'mc',  q, choices:[...], answer: index, explain, hint?, lvl?}
     {type:'num', q, answer, unit?: '$'|'%'|'x'|'days'|..., tol?, label?, explain, hint?}
     {type:'fill', q, blanks:[{l, a, unit?, tol?}], explain, hint?}
     {type:'je',  q, opts:[account names], answer:[[account, debit, credit]], explain, hint?}
     {type:'classify', q, cats:[...], items:[[text, catIndex]], explain, hint?}
   render(el, problem, {label, solved, onSolved}) draws one problem with feedback and a worked solution. */
(function () {
  'use strict';
  const { fmt, esc, parseNum } = Book;
  const LVL = { 1: 'Basic', 2: 'Apply', 3: 'Challenge' };

  function defaultTol(a, unit) {
    if (unit === '%' || unit === 'x' || unit === 'ratio') return Number.isInteger(a) ? 0.05 : 0.051;
    return Number.isInteger(a) ? 0.5 : 0.011;
  }

  function showAnswer(a, unit) {
    if (unit === '$') return fmt(a, { cur: true });
    if (unit === '%') return a + '%';
    if (unit === 'x') return a + '×';
    return fmt(a) + (unit ? ' ' + unit : '');
  }

  function blanksOf(p) {
    if (p.type === 'fill') return p.blanks;
    return [{ l: p.label || 'Answer', a: p.answer, unit: p.unit, tol: p.tol }];
  }

  function solutionHTML(p) {
    let ans = '';
    if (p.type === 'mc') ans = '<p class="sol-ans"><b>Answer:</b> ' + p.choices[p.answer] + '</p>';
    else if (p.type === 'num' || p.type === 'fill') {
      ans = '<p class="sol-ans">' + blanksOf(p).map((b) => '<b>' + b.l + ':</b> <span class="m">' + showAnswer(b.a, b.unit) + '</span>').join('<br>') + '</p>';
    } else if (p.type === 'je') ans = Book.jeMany([{ lines: p.answer }], true);
    else if (p.type === 'classify') {
      ans = '<ul class="sol-list">' + p.items.map((it) => '<li>' + it[0] + ' <span class="arrow">→</span> <b>' + p.cats[it[1]] + '</b></li>').join('') + '</ul>';
    }
    return '<div class="sol-label">Solution</div>' + ans + (p.explain ? '<div class="sol-explain">' + p.explain + '</div>' : '');
  }

  function render(el, p, ctx) {
    ctx = ctx || {};
    el.classList.add('problem');
    el.dataset.type = p.type;
    const uid = 'p' + Math.random().toString(36).slice(2, 8);
    el.innerHTML =
      '<div class="p-head">' + (ctx.label ? '<span class="p-num m">' + ctx.label + '</span>' : '') +
      (p.lvl ? '<span class="p-lvl lvl' + p.lvl + '">' + LVL[p.lvl] + '</span>' : '') +
      (ctx.source ? '<span class="p-src">' + ctx.source + '</span>' : '') +
      '<span class="p-state"' + (ctx.solved ? '' : ' hidden') + '>Solved</span></div>' +
      '<div class="p-q">' + p.q + '</div><div class="p-body"></div>' +
      '<div class="p-actions"></div><div class="p-fb" aria-live="polite"></div><div class="p-sol" hidden></div>';
    const body = el.querySelector('.p-body');
    const actions = el.querySelector('.p-actions');
    const fb = el.querySelector('.p-fb');
    const sol = el.querySelector('.p-sol');
    const state = el.querySelector('.p-state');
    let solvedNow = false;

    const feedback = (kind, html) => { fb.className = 'p-fb ' + kind; fb.innerHTML = html; };
    const reveal = () => { sol.innerHTML = solutionHTML(p); sol.hidden = false; solBtn.hidden = true; };
    const win = (msg) => {
      feedback('good', '<b>Correct.</b> ' + (msg || ''));
      if (!solvedNow) { solvedNow = true; state.hidden = false; if (ctx.onSolved) ctx.onSolved(); }
      reveal();
      sol.querySelector('.sol-label').textContent = 'Why';
    };

    const btn = (label, cls) => {
      const b = document.createElement('button');
      b.className = 'btn ' + (cls || '');
      b.type = 'button';
      b.textContent = label;
      actions.appendChild(b);
      return b;
    };

    let checkBtn = null;
    if (p.type !== 'mc') checkBtn = btn('Check', 'check');
    let hintBtn = null;
    if (p.hint) {
      hintBtn = btn('Hint', 'ghost');
      hintBtn.addEventListener('click', () => { feedback('hint', '<b>Hint.</b> ' + p.hint); hintBtn.hidden = true; });
    }
    const solBtn = btn('Show solution', 'ghost');
    solBtn.addEventListener('click', reveal);

    // ----- multiple choice -----
    if (p.type === 'mc') {
      body.innerHTML = '<div class="choices" role="group">' + p.choices.map((c, i) =>
        '<button type="button" class="choice" data-i="' + i + '"><span class="ch-key m">' + String.fromCharCode(65 + i) + '</span><span class="ch-t">' + c + '</span></button>').join('') + '</div>';
      body.querySelectorAll('.choice').forEach((b) => b.addEventListener('click', () => {
        const i = +b.dataset.i;
        if (i === p.answer) {
          body.querySelectorAll('.choice').forEach((x) => { x.classList.remove('wrong'); x.disabled = true; });
          b.classList.add('right');
          win();
        } else {
          b.classList.add('wrong');
          feedback('bad', '<b>Not quite.</b> Try another choice' + (p.hint && hintBtn && !hintBtn.hidden ? ', or take the hint.' : '.'));
        }
      }));
    }

    // ----- numeric blanks -----
    if (p.type === 'num' || p.type === 'fill') {
      const blanks = blanksOf(p);
      body.innerHTML = '<div class="blanks">' + blanks.map((b, i) =>
        '<label class="blank" for="' + uid + '-' + i + '"><span class="blank-l">' + b.l + '</span><span class="inwrap">' +
        (b.unit === '$' ? '<span class="affix">$</span>' : '') +
        '<input id="' + uid + '-' + i + '" class="m" inputmode="decimal" autocomplete="off" spellcheck="false">' +
        (b.unit && b.unit !== '$' ? '<span class="affix">' + (b.unit === 'x' ? '×' : b.unit) + '</span>' : '') +
        '</span></label>').join('') + '</div>';
      const inputs = Array.from(body.querySelectorAll('input'));
      const check = () => {
        let all = true, empty = false;
        inputs.forEach((inp, i) => {
          const b = blanks[i];
          const v = parseNum(inp.value);
          if (Number.isNaN(v)) { empty = true; all = false; inp.classList.remove('ok', 'bad'); return; }
          const ok = Math.abs(v - b.a) <= (b.tol !== undefined ? b.tol : defaultTol(b.a, b.unit));
          inp.classList.toggle('ok', ok);
          inp.classList.toggle('bad', !ok);
          if (!ok) all = false;
        });
        if (all) win();
        else if (empty) feedback('bad', 'Enter a number in ' + (inputs.length > 1 ? 'every box' : 'the box') + '. Use a minus sign or parentheses for negatives.');
        else feedback('bad', '<b>Not quite.</b> ' + (inputs.length > 1 ? 'The boxes marked in red need another look.' : 'Check your arithmetic and try again.'));
      };
      checkBtn.addEventListener('click', check);
      inputs.forEach((inp) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); }));
    }

    // ----- journal entry -----
    if (p.type === 'je') {
      const accts = Array.from(new Set(p.opts.concat(p.answer.map((l) => l[0])))).sort();
      body.innerHTML = '<div class="je-build"><div class="je-row je-headrow"><span>Account</span><span class="dr">Debit</span><span class="cr">Credit</span><span></span></div>' +
        '<div class="je-rows"></div><div class="je-foot"><button type="button" class="btn ghost small addrow">+ Add line</button>' +
        '<span class="je-tot m"></span></div></div>';
      const rowsEl = body.querySelector('.je-rows');
      const tot = body.querySelector('.je-tot');
      let n = 0;
      const addRow = () => {
        const id = uid + '-r' + (n++);
        const row = document.createElement('div');
        row.className = 'je-row';
        row.innerHTML = '<select id="' + id + '-a" aria-label="Account"><option value="">Choose account…</option>' +
          accts.map((a) => '<option>' + esc(a) + '</option>').join('') + '</select>' +
          '<input id="' + id + '-d" class="m dr" inputmode="decimal" aria-label="Debit amount" placeholder="Debit" autocomplete="off">' +
          '<input id="' + id + '-c" class="m cr" inputmode="decimal" aria-label="Credit amount" placeholder="Credit" autocomplete="off">' +
          '<button type="button" class="rm" aria-label="Remove line">×</button>';
        row.querySelector('.rm').addEventListener('click', () => { row.remove(); totals(); });
        row.querySelectorAll('input,select').forEach((x) => x.addEventListener('input', totals));
        rowsEl.appendChild(row);
      };
      const read = () => Array.from(rowsEl.children).map((r) => ({
        el: r,
        a: r.querySelector('select').value,
        d: parseNum(r.querySelector('.dr').value) || 0,
        c: parseNum(r.querySelector('.cr').value) || 0
      }));
      function totals() {
        const rs = read();
        const d = rs.reduce((s, r) => s + r.d, 0), c = rs.reduce((s, r) => s + r.c, 0);
        tot.innerHTML = '<span class="dr">' + fmt(d, { cur: true }) + '</span> · <span class="cr">' + fmt(c, { cur: true }) + '</span>' +
          (d || c ? (Math.abs(d - c) < 0.005 ? ' <span class="okchip">balanced</span>' : ' <span class="offchip">off by ' + fmt(Math.abs(d - c), { cur: true }) + '</span>') : '');
      }
      p.answer.forEach(addRow);
      totals();
      body.querySelector('.addrow').addEventListener('click', () => { addRow(); totals(); });
      checkBtn.addEventListener('click', () => {
        const rs = read().filter((r) => r.a || r.d || r.c);
        if (!rs.length || rs.some((r) => !r.a || (!r.d && !r.c) || (r.d && r.c))) {
          feedback('bad', 'Each line needs an account and an amount in <i>either</i> the debit or the credit column. Remove lines you don’t need.');
          return;
        }
        const D = rs.reduce((s, r) => s + r.d, 0), C = rs.reduce((s, r) => s + r.c, 0);
        rs.forEach((r) => {
          const ok = p.answer.some((l) => l[0] === r.a && Math.abs((l[1] || 0) - r.d) < 0.005 && Math.abs((l[2] || 0) - r.c) < 0.005);
          r.el.classList.toggle('ok', ok);
          r.el.classList.toggle('bad', !ok);
        });
        const net = (lines) => {
          const m = {};
          lines.forEach((l) => { m[l[0]] = (m[l[0]] || 0) + (l[1] || 0) - (l[2] || 0); });
          return m;
        };
        const u = net(rs.map((r) => [r.a, r.d, r.c])), k = net(p.answer);
        const keys = new Set(Object.keys(u).concat(Object.keys(k)));
        const same = Array.from(keys).every((key) => Math.abs((u[key] || 0) - (k[key] || 0)) < 0.005);
        if (same) win();
        else if (Math.abs(D - C) > 0.005) feedback('bad', '<b>Out of balance.</b> Debits total ' + fmt(D, { cur: true }) + ' but credits total ' + fmt(C, { cur: true }) + '. Every entry needs equal debits and credits.');
        else feedback('bad', '<b>Balanced, but not the right entry.</b> Lines marked in red have the wrong account, side or amount.');
      });
    }

    // ----- classify -----
    if (p.type === 'classify') {
      body.innerHTML = '<div class="cls">' + p.items.map((it, i) =>
        '<div class="cls-row" data-i="' + i + '"><span class="cls-t">' + it[0] + '</span><span class="cls-opts" role="radiogroup" aria-label="' + esc(it[0].replace(/<[^>]+>/g, '')) + '">' +
        p.cats.map((c, ci) => '<button type="button" class="cls-b" role="radio" aria-checked="false" data-c="' + ci + '">' + c + '</button>').join('') +
        '</span></div>').join('') + '</div>';
      body.querySelectorAll('.cls-row').forEach((row) => {
        row.querySelectorAll('.cls-b').forEach((b) => b.addEventListener('click', () => {
          row.querySelectorAll('.cls-b').forEach((x) => x.setAttribute('aria-checked', x === b));
          row.dataset.pick = b.dataset.c;
          row.classList.remove('ok', 'bad');
        }));
      });
      checkBtn.addEventListener('click', () => {
        const rows = Array.from(body.querySelectorAll('.cls-row'));
        if (rows.some((r) => r.dataset.pick === undefined)) { feedback('bad', 'Pick a category for every item first.'); return; }
        let wrong = 0;
        rows.forEach((r, i) => {
          const ok = +r.dataset.pick === p.items[i][1];
          r.classList.toggle('ok', ok);
          r.classList.toggle('bad', !ok);
          if (!ok) wrong++;
        });
        if (!wrong) win();
        else feedback('bad', '<b>' + wrong + ' of ' + rows.length + ' need another look.</b> They’re marked in red.');
      });
    }
  }

  window.Practice = { render, solutionHTML };
})();
