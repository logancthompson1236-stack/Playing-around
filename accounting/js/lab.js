/* Ledger Lab: a small double-entry system. Post journal entries and see the ledger,
   trial balance, income statement and balance sheet update. */
(function () {
  'use strict';
  const { fmt, esc, parseNum } = Book;
  const money = (n) => fmt(n, { cur: true });

  // type: A asset, CA contra-asset, L liability, E equity, D dividends, R revenue, X expense
  const COA = [
    ['Cash', 'A'], ['Accounts Receivable', 'A'], ['Supplies', 'A'], ['Prepaid Insurance', 'A'], ['Equipment', 'A'],
    ['Accumulated Depreciation', 'CA'],
    ['Accounts Payable', 'L'], ['Unearned Revenue', 'L'], ['Salaries Payable', 'L'], ['Interest Payable', 'L'], ['Notes Payable', 'L'],
    ['Common Stock', 'E'], ['Retained Earnings', 'E'], ['Dividends', 'D'],
    ['Service Revenue', 'R'],
    ['Salaries Expense', 'X'], ['Rent Expense', 'X'], ['Supplies Expense', 'X'], ['Utilities Expense', 'X'],
    ['Insurance Expense', 'X'], ['Depreciation Expense', 'X'], ['Advertising Expense', 'X'], ['Interest Expense', 'X']
  ];
  const TYPE = Object.fromEntries(COA);
  const debitNormal = (a) => ['A', 'D', 'X'].includes(TYPE[a]);

  const SAMPLE = [
    { d: 'Jan 1', m: 'Owner invests cash for common stock', l: [['Cash', 10000, 0], ['Common Stock', 0, 10000]] },
    { d: 'Jan 2', m: 'Buy tutoring equipment for cash', l: [['Equipment', 4800, 0], ['Cash', 0, 4800]] },
    { d: 'Jan 3', m: 'Buy supplies on account', l: [['Supplies', 600, 0], ['Accounts Payable', 0, 600]] },
    { d: 'Jan 10', m: 'Tutoring for cash', l: [['Cash', 2500, 0], ['Service Revenue', 0, 2500]] },
    { d: 'Jan 15', m: 'Tutoring for a school, billed on account', l: [['Accounts Receivable', 1800, 0], ['Service Revenue', 0, 1800]] },
    { d: 'Jan 20', m: 'Pay January rent', l: [['Rent Expense', 1000, 0], ['Cash', 0, 1000]] },
    { d: 'Jan 25', m: 'Pay part of the supplies bill', l: [['Accounts Payable', 400, 0], ['Cash', 0, 400]] },
    { d: 'Jan 28', m: 'Collect from the school', l: [['Cash', 1000, 0], ['Accounts Receivable', 0, 1000]] },
    { d: 'Jan 30', m: 'Pay assistant’s salary', l: [['Salaries Expense', 1200, 0], ['Cash', 0, 1200]] },
    { d: 'Jan 31', m: 'Pay dividend to owner', l: [['Dividends', 300, 0], ['Cash', 0, 300]] }
  ];
  const ADJ = [
    { d: 'Jan 31', m: 'Adj: supplies used ($600 bought, $250 on hand)', l: [['Supplies Expense', 350, 0], ['Supplies', 0, 350]] },
    { d: 'Jan 31', m: 'Adj: January depreciation', l: [['Depreciation Expense', 100, 0], ['Accumulated Depreciation', 0, 100]] },
    { d: 'Jan 31', m: 'Adj: salary earned Jan 29–31, unpaid', l: [['Salaries Expense', 180, 0], ['Salaries Payable', 0, 180]] },
    { d: 'Jan 31', m: 'Adj: tutoring done, not yet billed', l: [['Accounts Receivable', 200, 0], ['Service Revenue', 0, 200]] }
  ];
  const clone = (x) => JSON.parse(JSON.stringify(x));

  function balances(entries) {
    const b = {};
    entries.forEach((e) => e.l.forEach(([a, d, c]) => { b[a] = (b[a] || 0) + (d || 0) - (c || 0); }));
    return b;  // positive = debit balance
  }

  function mount(el, opts) {
    opts = opts || {};
    const persist = !!opts.persist;
    let entries;
    if (persist) {
      const saved = Book.progress.getMisc('lab');
      entries = Array.isArray(saved) ? saved : clone(SAMPLE);
    } else entries = clone(SAMPLE);
    let tab = opts.tab || 'journal';
    const id = 'lab' + Math.random().toString(36).slice(2, 7);

    el.classList.add('lab');
    el.innerHTML =
      (opts.compact ? '<div class="w-head"><div class="w-title">Ledger Lab</div><div class="w-sub">Brightside’s January journal is loaded. Post your own entry below, then flip through the tabs. The <a href="#lab">full-page Ledger Lab</a> saves your work.</div></div>' : '') +
      '<div class="lab-grid"><section class="lab-form" aria-label="New journal entry">' +
      '<div class="lab-form-h">New journal entry</div>' +
      '<div class="lab-meta"><label for="' + id + '-d">Date<input id="' + id + '-d" class="m" placeholder="Feb 1" autocomplete="off"></label>' +
      '<label for="' + id + '-m">Description<input id="' + id + '-m" placeholder="What happened?" autocomplete="off"></label></div>' +
      '<div class="je-build"><div class="je-row je-headrow"><span>Account</span><span class="dr">Debit</span><span class="cr">Credit</span><span></span></div><div class="je-rows"></div>' +
      '<div class="je-foot"><button type="button" class="btn ghost small addrow">+ Add line</button><span class="je-tot m"></span></div></div>' +
      '<div class="lab-post"><button type="button" class="btn post" disabled>Post entry</button><span class="lab-msg" aria-live="polite"></span></div>' +
      '<div class="lab-tools"><button type="button" class="btn ghost small load">Load Brightside sample</button>' +
      '<button type="button" class="btn ghost small adj">Add month-end adjustments</button>' +
      '<button type="button" class="btn ghost small clear">Clear journal</button></div>' +
      '</section><section class="lab-views" aria-label="Books"><div class="lab-tabs" role="tablist"></div><div class="lab-view"></div></section></div>';

    const $ = (s) => el.querySelector(s);
    const rowsEl = $('.je-rows');
    let n = 0;
    const addRow = () => {
      const rid = id + '-r' + (n++);
      const row = document.createElement('div');
      row.className = 'je-row';
      row.innerHTML = '<select id="' + rid + '-a" aria-label="Account"><option value="">Choose account…</option>' +
        COA.map(([a]) => '<option>' + esc(a) + '</option>').join('') + '</select>' +
        '<input id="' + rid + '-d" class="m dr" inputmode="decimal" aria-label="Debit amount" placeholder="Debit" autocomplete="off">' +
        '<input id="' + rid + '-c" class="m cr" inputmode="decimal" aria-label="Credit amount" placeholder="Credit" autocomplete="off">' +
        '<button type="button" class="rm" aria-label="Remove line">×</button>';
      row.querySelector('.rm').addEventListener('click', () => { if (rowsEl.children.length > 2) row.remove(); formState(); });
      row.querySelectorAll('input,select').forEach((x) => x.addEventListener('input', formState));
      rowsEl.appendChild(row);
    };
    const readForm = () => Array.from(rowsEl.children).map((r) => [r.querySelector('select').value, parseNum(r.querySelector('.dr').value) || 0, parseNum(r.querySelector('.cr').value) || 0])
      .filter((l) => l[0] || l[1] || l[2]);
    function formState() {
      const ls = readForm();
      const D = ls.reduce((s, l) => s + l[1], 0), C = ls.reduce((s, l) => s + l[2], 0);
      const ok = ls.length >= 2 && ls.every((l) => l[0] && ((l[1] > 0) !== (l[2] > 0))) && D > 0 && Math.abs(D - C) < 0.005;
      $('.je-tot').innerHTML = '<span class="dr">' + money(D) + '</span> · <span class="cr">' + money(C) + '</span>' +
        (D || C ? (Math.abs(D - C) < 0.005 ? ' <span class="okchip">balanced</span>' : ' <span class="offchip">off by ' + money(Math.abs(D - C)) + '</span>') : '');
      $('.post').disabled = !ok;
      return ok;
    }
    addRow(); addRow(); formState();
    $('.addrow').addEventListener('click', () => { addRow(); formState(); });

    const msg = (t) => { $('.lab-msg').textContent = t; };
    const save = () => { if (persist) Book.progress.setMisc('lab', entries); };
    $('.post').addEventListener('click', () => {
      if (!formState()) return;
      entries.push({ d: $('#' + id + '-d').value.trim() || '—', m: $('#' + id + '-m').value.trim(), l: readForm() });
      save();
      rowsEl.innerHTML = ''; addRow(); addRow();
      $('#' + id + '-d').value = ''; $('#' + id + '-m').value = '';
      formState();
      msg('Posted. Every view below now includes it.');
      draw();
    });
    $('.load').addEventListener('click', () => { entries = clone(SAMPLE); save(); msg('Loaded Brightside’s ten January entries.'); draw(); });
    $('.adj').addEventListener('click', () => {
      const have = entries.some((e) => e.m && e.m.startsWith('Adj:'));
      if (have) { msg('The adjustments are already in the journal.'); return; }
      entries = entries.concat(clone(ADJ)); save(); msg('Added four adjusting entries. Compare net income before and after.'); draw();
    });
    let armed = false;
    $('.clear').addEventListener('click', (e) => {
      if (!armed) { armed = true; e.currentTarget.textContent = 'Click again to clear'; setTimeout(() => { armed = false; e.currentTarget.textContent = 'Clear journal'; }, 3000); return; }
      armed = false; e.currentTarget.textContent = 'Clear journal';
      entries = []; save(); msg('Journal cleared. Start with an owner investment.'); draw();
    });

    const TABS = [['journal', 'Journal'], ['ledger', 'T-accounts'], ['tb', 'Trial balance'], ['is', 'Income statement'], ['bs', 'Balance sheet']];
    $('.lab-tabs').innerHTML = TABS.map(([k, l]) => '<button type="button" role="tab" data-t="' + k + '">' + l + '</button>').join('');
    $('.lab-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; draw(); } });

    function draw() {
      el.querySelectorAll('.lab-tabs [data-t]').forEach((b) => b.setAttribute('aria-selected', b.dataset.t === tab));
      const v = $('.lab-view');
      const b = balances(entries);
      const used = COA.map(([a]) => a).filter((a) => entries.some((e) => e.l.some((l) => l[0] === a)));
      if (!entries.length) { v.innerHTML = '<p class="lab-empty">The journal is empty. Post an entry, or load the Brightside sample.</p>'; return; }

      if (tab === 'journal') {
        let rows = '';
        entries.forEach((e, i) => {
          e.l.forEach((l, j) => {
            rows += '<tr class="' + (j === 0 && i ? 'gap' : '') + '"><td class="jdate">' + (j === 0 ? esc(e.d) : '') + '</td><td class="jacct' + (!l[1] ? ' cr' : '') + '">' + esc(l[0]) + '</td>' +
              '<td class="num dr">' + (l[1] ? fmt(l[1]) : '') + '</td><td class="num cr">' + (l[2] ? fmt(l[2]) : '') + '</td>' +
              '<td class="del">' + (j === 0 ? '<button type="button" data-del="' + i + '" aria-label="Delete entry">×</button>' : '') + '</td></tr>';
          });
          if (e.m) rows += '<tr class="memo"><td></td><td colspan="4">' + esc(e.m) + '</td></tr>';
        });
        v.innerHTML = '<div class="scroll-x"><table class="jtable"><thead><tr><th class="jdate">Date</th><th>Account</th><th class="num dr">Debit</th><th class="num cr">Credit</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        v.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => { entries.splice(+btn.dataset.del, 1); save(); draw(); }));
      }

      if (tab === 'ledger') {
        v.innerHTML = Book.tgrid(used.map((a) => {
          const dr = [], cr = [];
          entries.forEach((e) => e.l.forEach((l) => { if (l[0] === a) { if (l[1]) dr.push([e.d, l[1]]); if (l[2]) cr.push([e.d, l[2]]); } }));
          return { n: a, dr, cr };
        }));
      }

      if (tab === 'tb') {
        let D = 0, C = 0;
        const rows = used.map((a) => {
          const x = b[a];
          if (x >= 0) D += x; else C -= x;
          return '<tr><td>' + esc(a) + (debitNormal(a) === (x < 0) && x !== 0 ? ' <span class="flag">abnormal balance</span>' : '') + '</td><td class="num dr">' + (x > 0 ? fmt(x) : '') + '</td><td class="num cr">' + (x < 0 ? fmt(-x) : '') + '</td></tr>';
        }).join('');
        const ok = Math.abs(D - C) < 0.005;
        v.innerHTML = '<div class="scroll-x"><table class="grid tb"><thead><tr><th>Account</th><th class="num dr">Debit</th><th class="num cr">Credit</th></tr></thead><tbody>' + rows +
          '</tbody><tfoot><tr><td>Totals</td><td class="num rule-d">' + money(D) + '</td><td class="num rule-d">' + money(C) + '</td></tr></tfoot></table></div>' +
          '<p class="lab-check ' + (ok ? 'ok' : 'off') + '">' + (ok ? 'Debits equal credits.' : 'Out of balance by ' + money(Math.abs(D - C)) + '.') + '</p>';
      }

      const rev = used.filter((a) => TYPE[a] === 'R'), exp = used.filter((a) => TYPE[a] === 'X');
      const totalRev = rev.reduce((s, a) => s - b[a], 0), totalExp = exp.reduce((s, a) => s + b[a], 0);
      const ni = totalRev - totalExp;

      if (tab === 'is') {
        const rows = [['Revenues', null, 'h']].concat(rev.map((a, i) => [a, -b[a], 'iL' + (i === rev.length - 1 ? 'u' : '')]), [['Total revenues', totalRev, '']],
          [['Expenses', null, 'h']], exp.map((a, i) => [a, b[a], 'iL' + (i === exp.length - 1 ? 'u' : '')]), [['Total expenses', totalExp, 'u']],
          [[ni >= 0 ? 'Net income' : 'Net loss', ni, 'bd$']]);
        v.innerHTML = Book.stmt('Income Statement', 'For the period covered by the journal', rows);
      }

      if (tab === 'bs') {
        const assets = used.filter((a) => TYPE[a] === 'A' || TYPE[a] === 'CA');
        const liab = used.filter((a) => TYPE[a] === 'L');
        const ta = assets.reduce((s, a) => s + b[a], 0);
        const tl = liab.reduce((s, a) => s - b[a], 0);
        const cs = -(b['Common Stock'] || 0);
        const re = -(b['Retained Earnings'] || 0) + ni - (b.Dividends || 0);
        const te = cs + re;
        const rows = [['Assets', null, 'h']].concat(assets.map((a, i) => [a, b[a], 'iL' + (i === assets.length - 1 ? 'u' : '')]), [['Total assets', ta, 'bd$']],
          [['Liabilities', null, 'h']], liab.map((a, i) => [a, -b[a], 'iL' + (i === liab.length - 1 ? 'u' : '')]), [['Total liabilities', tl, '']],
          [['Stockholders’ equity', null, 'h']], [['Common Stock', cs, 'iL']], [['Retained Earnings', re, 'iLu']], [['Total equity', te, 'u']],
          [['Total liabilities and equity', tl + te, 'bd$']]);
        const ok = Math.abs(ta - tl - te) < 0.005;
        v.innerHTML = Book.stmt('Balance Sheet', 'At the end of the period', rows) +
          '<p class="lab-note">Retained earnings here = beginning balance ' + money(-(b['Retained Earnings'] || 0)) + ' + net income ' + money(ni) + ' − dividends ' + money(b.Dividends || 0) + '. Closing entries make the ledger agree.</p>' +
          '<p class="lab-check ' + (ok ? 'ok' : 'off') + '">' + (ok ? 'Assets equal liabilities plus equity.' : 'Out of balance by ' + money(Math.abs(ta - tl - te)) + '.') + '</p>';
      }
    }
    draw();
  }

  window.Lab = { mount, COA, SAMPLE, ADJ };
})();
