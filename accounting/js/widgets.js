/* Interactive lesson widgets. Lessons place them with Book.widget(name, opts); the app calls
   Widgets.mount(root) after rendering a lesson. */
(function () {
  'use strict';
  const { fmt, esc, parseNum } = Book;
  const money = (n) => fmt(n, { cur: true });
  const signed = (n) => (n > 0 ? '+' : '−') + fmt(Math.abs(n));
  const r2 = (n) => Math.round(n * 100) / 100;
  let seq = 0;
  const uid = (p) => p + '-' + (++seq);

  // ---------- small SVG chart helpers ----------

  function niceTicks(min, max, count) {
    const span = max - min || 1;
    const step0 = span / (count || 4);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) || 10 * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const t = [];
    for (let v = lo; v <= hi + step / 2; v += step) t.push(Math.round(v * 1e6) / 1e6);
    return t;
  }
  const compact = (v) => {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e6) return s + '$' + r2(a / 1e6) + 'M';
    if (a >= 1000) return s + '$' + r2(a / 1000) + 'K';
    return s + '$' + a;
  };
  // Column with a 4px rounded data end and a square baseline end.
  function colPath(x, w, yBase, yEnd) {
    const r = Math.min(4, w / 2, Math.abs(yBase - yEnd));
    if (yEnd < yBase) {
      return 'M' + x + ',' + yBase + 'V' + (yEnd + r) + 'Q' + x + ',' + yEnd + ' ' + (x + r) + ',' + yEnd +
        'H' + (x + w - r) + 'Q' + (x + w) + ',' + yEnd + ' ' + (x + w) + ',' + (yEnd + r) + 'V' + yBase + 'Z';
    }
    return 'M' + x + ',' + yBase + 'V' + (yEnd - r) + 'Q' + x + ',' + yEnd + ' ' + (x + r) + ',' + yEnd +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + yEnd + ' ' + (x + w) + ',' + (yEnd - r) + 'V' + yBase + 'Z';
  }
  function tooltip(host) {
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    host.appendChild(tip);
    return {
      show(html, x, y) {
        tip.innerHTML = html;
        tip.hidden = false;
        const hw = host.clientWidth, tw = tip.offsetWidth;
        tip.style.left = Math.max(4, Math.min(hw - tw - 4, x - tw / 2)) + 'px';
        tip.style.top = Math.max(4, y - tip.offsetHeight - 12) + 'px';
      },
      hide() { tip.hidden = true; }
    };
  }
  function onResize(el, fn) {
    if (window.ResizeObserver) {
      let w = 0;
      new ResizeObserver(() => { if (el.clientWidth !== w) { w = el.clientWidth; fn(); } }).observe(el);
    } else fn();
  }

  const W = {};

  // ---------- 1. Accounting equation, transaction by transaction ----------

  W.equation = (el) => {
    const COLS = [['Cash', 'A'], ['Accounts Receivable', 'A'], ['Supplies', 'A'], ['Equipment', 'A'], ['Accounts Payable', 'L'], ['Common Stock', 'E'], ['Retained Earnings', 'E']];
    const TX = [
      { d: 'Jan 1', t: 'Owner invests $10,000 cash for common stock', fx: { Cash: 10000, 'Common Stock': 10000 } },
      { d: 'Jan 2', t: 'Buys tutoring equipment for $4,800 cash', fx: { Cash: -4800, Equipment: 4800 } },
      { d: 'Jan 3', t: 'Buys supplies on account, $600', fx: { Supplies: 600, 'Accounts Payable': 600 } },
      { d: 'Jan 10', t: 'Tutors students and is paid $2,500 cash', fx: { Cash: 2500, 'Retained Earnings': 2500 }, why: 'revenue' },
      { d: 'Jan 15', t: 'Tutors for a school on account, $1,800', fx: { 'Accounts Receivable': 1800, 'Retained Earnings': 1800 }, why: 'revenue' },
      { d: 'Jan 20', t: 'Pays January rent, $1,000', fx: { Cash: -1000, 'Retained Earnings': -1000 }, why: 'expense' },
      { d: 'Jan 25', t: 'Pays $400 of the amount owed for supplies', fx: { Cash: -400, 'Accounts Payable': -400 } },
      { d: 'Jan 28', t: 'Collects $1,000 from the school', fx: { Cash: 1000, 'Accounts Receivable': -1000 } },
      { d: 'Jan 30', t: 'Pays the assistant’s salary, $1,200', fx: { Cash: -1200, 'Retained Earnings': -1200 }, why: 'expense' },
      { d: 'Jan 31', t: 'Pays the owner a $300 dividend', fx: { Cash: -300, 'Retained Earnings': -300 }, why: 'dividend' }
    ];
    let k = 0;
    el.innerHTML =
      '<div class="w-head"><div class="w-title">Brightside Tutoring, January</div>' +
      '<div class="w-sub">Record each transaction and watch both sides of the equation move together.</div></div>' +
      '<div class="w-next"></div>' +
      '<div class="scroll-x"><table class="eqgrid"><thead><tr class="grp"><th></th><th colspan="4">Assets</th><th class="op" colspan="1"><span>=</span> Liabilities</th><th class="op" colspan="2"><span>+</span> Equity</th></tr>' +
      '<tr><th>Transaction</th>' + COLS.map((c) => '<th class="num">' + c[0].replace(' ', '<br>') + '</th>').join('') + '</tr></thead><tbody></tbody><tfoot></tfoot></table></div>' +
      '<div class="w-sum"></div>' +
      '<div class="w-ctl"><button type="button" class="btn rec">Record next</button><button type="button" class="btn ghost undo">Undo</button>' +
      '<button type="button" class="btn ghost all">Record all</button><button type="button" class="btn ghost reset">Start over</button><span class="w-count m"></span></div>';
    const tb = el.querySelector('tbody'), tf = el.querySelector('tfoot');
    const draw = () => {
      const bal = {};
      COLS.forEach((c) => { bal[c[0]] = 0; });
      let rows = '';
      TX.slice(0, k).forEach((t, i) => {
        Object.keys(t.fx).forEach((a) => { bal[a] += t.fx[a]; });
        rows += '<tr class="' + (i === k - 1 ? 'fresh' : '') + '"><td class="tx"><span class="m">' + t.d + '</span> ' + esc(t.t) + '</td>' +
          COLS.map((c) => {
            const v = t.fx[c[0]];
            return '<td class="num ' + (v > 0 ? 'up' : v < 0 ? 'down' : '') + '">' + (v ? signed(v) : '') +
              (v && c[0] === 'Retained Earnings' && t.why ? '<span class="why">' + t.why + '</span>' : '') + '</td>';
          }).join('') + '</tr>';
      });
      tb.innerHTML = rows || '<tr><td class="tx empty" colspan="8">Nothing recorded yet. Press <b>Record next</b>.</td></tr>';
      tf.innerHTML = '<tr><td class="tx">Balance</td>' + COLS.map((c) => '<td class="num">' + money(bal[c[0]]) + '</td>').join('') + '</tr>';
      const A = bal.Cash + bal['Accounts Receivable'] + bal.Supplies + bal.Equipment;
      const L = bal['Accounts Payable'], E = bal['Common Stock'] + bal['Retained Earnings'];
      el.querySelector('.w-sum').innerHTML = '<span class="m">Assets ' + money(A) + '</span><span class="op">=</span><span class="m">Liabilities ' + money(L) +
        '</span><span class="op">+</span><span class="m">Equity ' + money(E) + '</span><span class="okchip">' + (A === L + E ? 'balanced' : 'off') + '</span>';
      el.querySelector('.w-next').innerHTML = k < TX.length
        ? '<span class="lbl">Next</span> <span class="m">' + TX[k].d + '</span> ' + esc(TX[k].t) + '. <i>Which two places change?</i>'
        : '<span class="lbl">Done</span> All ten transactions recorded, and the equation balanced after every one.';
      el.querySelector('.w-count').textContent = k + ' / ' + TX.length;
      el.querySelector('.rec').disabled = k >= TX.length;
      el.querySelector('.all').disabled = k >= TX.length;
      el.querySelector('.undo').disabled = k === 0;
    };
    el.querySelector('.rec').addEventListener('click', () => { if (k < TX.length) { k++; draw(); } });
    el.querySelector('.undo').addEventListener('click', () => { if (k > 0) { k--; draw(); } });
    el.querySelector('.all').addEventListener('click', () => { k = TX.length; draw(); });
    el.querySelector('.reset').addEventListener('click', () => { k = 0; draw(); });
    draw();
  };

  // ---------- 2. Cash basis vs accrual basis ----------

  W.cashaccrual = (el) => {
    const months = ['January', 'February', 'March'];
    const M = {
      cash: { name: 'Cash basis', rev: [1200, 5000, 0], exp: [1800, 1000, 1000] },
      acc: { name: 'Accrual basis', rev: [3400, 2400, 2900], exp: [1300, 1300, 1300] }
    };
    const ev = [
      ['Jan 1: pays $1,800 for six months of insurance (Jan to Jun)', '$1,800 expense in Jan', '$300 expense each month'],
      ['Jan 5: collects $1,200 in advance for three months of hosting', '$1,200 revenue in Jan', '$400 revenue each month'],
      ['Jan: builds a $3,000 site and bills the client, who pays Feb 10', '$3,000 revenue in Feb', '$3,000 revenue in Jan'],
      ['Feb: builds a $2,000 site, paid on completion', '$2,000 revenue in Feb', '$2,000 revenue in Feb'],
      ['Mar: builds a $2,500 site, client pays Apr 8', 'Nothing until April', '$2,500 revenue in Mar'],
      ['Wages are $1,000 a month, paid on the 2nd of the next month', '$1,000 expense in Feb and Mar', '$1,000 expense in each month worked']
    ];
    el.innerHTML =
      '<div class="w-head"><div class="w-title">Northwind Web Studio, first quarter</div>' +
      '<div class="w-sub">Same six events, two ways of counting. Hover or tap a column for its numbers.</div></div>' +
      '<div class="scroll-x"><table class="grid compact"><thead><tr><th>What happened</th><th>Cash basis counts it…</th><th>Accrual basis counts it…</th></tr></thead><tbody>' +
      ev.map((e) => '<tr><td>' + e[0] + '</td><td>' + e[1] + '</td><td>' + e[2] + '</td></tr>').join('') + '</tbody></table></div>' +
      '<div class="chart-box"><div class="chart-title">Net income by month</div><div class="legend"><span><i class="sw s2"></i>Cash basis</span><span><i class="sw s1"></i>Accrual basis</span></div><div class="chart"></div></div>' +
      '<div class="scroll-x"><table class="grid compact nums"><thead><tr><th></th>' + months.map((m) => '<th class="num">' + m.slice(0, 3) + '</th>').join('') + '<th class="num">Quarter</th></tr></thead><tbody>' +
      ['cash', 'acc'].map((key) => {
        const m = M[key];
        const ni = m.rev.map((r, i) => r - m.exp[i]);
        const q = (a) => a.reduce((s, x) => s + x, 0);
        return '<tr class="sub"><td colspan="5"><b>' + m.name + '</b></td></tr>' +
          '<tr><td class="ind">Revenue</td>' + m.rev.map((v) => '<td class="num">' + fmt(v) + '</td>').join('') + '<td class="num">' + fmt(q(m.rev)) + '</td></tr>' +
          '<tr><td class="ind">Expenses</td>' + m.exp.map((v) => '<td class="num">' + fmt(-v) + '</td>').join('') + '<td class="num">' + fmt(-q(m.exp)) + '</td></tr>' +
          '<tr class="tot"><td class="ind">Net income</td>' + ni.map((v) => '<td class="num">' + fmt(v) + '</td>').join('') + '<td class="num">' + fmt(q(ni)) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="w-foot">Over the quarter the accrual method shows $2,400 more profit. That gap is exactly what cash accounting leaves out: $2,500 still owed by the March client, plus $900 of insurance not yet used, minus $1,000 of March wages not yet paid.</p>';

    const box = el.querySelector('.chart');
    const tip = tooltip(box);
    const draw = () => {
      const W0 = Math.max(280, box.clientWidth), H = 220, padL = 52, padR = 12, padT = 14, padB = 30;
      const series = [['cash', 's2'], ['acc', 's1']];
      const vals = [];
      series.forEach(([k]) => M[k].rev.forEach((r, i) => vals.push(r - M[k].exp[i])));
      const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 4);
      const lo = ticks[0], hi = ticks[ticks.length - 1];
      const y = (v) => padT + (hi - v) / (hi - lo) * (H - padT - padB);
      const band = (W0 - padL - padR) / months.length;
      const bw = Math.min(24, band / 4);
      let svg = '<svg width="' + W0 + '" height="' + H + '" role="img" aria-label="Net income by month under cash and accrual accounting">';
      ticks.forEach((t) => {
        svg += '<line class="grid-l" x1="' + padL + '" x2="' + (W0 - padR) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>' +
          '<text class="axis-t" x="' + (padL - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + compact(t) + '</text>';
      });
      months.forEach((m, i) => {
        const cx = padL + band * i + band / 2;
        series.forEach(([k, cls], si) => {
          const v = M[k].rev[i] - M[k].exp[i];
          const x = si === 0 ? cx - bw - 1 : cx + 1;
          if (v !== 0) svg += '<path class="bar ' + cls + '" data-k="' + k + '" data-i="' + i + '" d="' + colPath(x, bw, y(0), y(v)) + '"/>';
          svg += '<rect class="hit" data-k="' + k + '" data-i="' + i + '" x="' + (x - 3) + '" y="' + padT + '" width="' + (bw + 6) + '" height="' + (H - padT - padB) + '"/>';
        });
        svg += '<text class="axis-t" x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle">' + m.slice(0, 3) + '</text>';
      });
      svg += '<line class="zero-l" x1="' + padL + '" x2="' + (W0 - padR) + '" y1="' + y(0) + '" y2="' + y(0) + '"/></svg>';
      box.querySelector('svg') && box.querySelector('svg').remove();
      box.insertAdjacentHTML('afterbegin', svg);
      box.querySelectorAll('.hit').forEach((h) => {
        const show = () => {
          const k = h.dataset.k, i = +h.dataset.i, m = M[k];
          const r = h.getBoundingClientRect(), b = box.getBoundingClientRect();
          tip.show('<b>' + m.name + ', ' + months[i] + '</b><br>Revenue ' + money(m.rev[i]) + '<br>Expenses ' + money(m.exp[i]) + '<br>Net income <b>' + money(m.rev[i] - m.exp[i]) + '</b>',
            r.left - b.left + r.width / 2, Math.min(y(m.rev[i] - m.exp[i]), y(0)));
          box.querySelectorAll('.bar').forEach((p) => p.classList.toggle('dim', !(p.dataset.k === k && +p.dataset.i === i)));
        };
        h.addEventListener('mouseenter', show);
        h.addEventListener('click', show);
        h.addEventListener('mouseleave', () => { tip.hide(); box.querySelectorAll('.bar').forEach((p) => p.classList.remove('dim')); });
      });
    };
    onResize(box, draw);
  };

  // ---------- 3. Inventory costing: FIFO, LIFO, weighted average ----------

  W.inventory = (el) => {
    const id = uid('inv');
    const layers = [['Beginning inventory', 10, 200], ['Purchase, Mar 10', 20, 220], ['Purchase, Mar 20', 10, 250]];
    el.innerHTML =
      '<div class="w-head"><div class="w-title">Inventory cost-flow calculator</div>' +
      '<div class="w-sub">Juniper Bikes, March (periodic system). Change any number; results update as you type.</div></div>' +
      '<div class="scroll-x"><table class="grid compact inputs"><thead><tr><th>Layer</th><th class="num">Units</th><th class="num">Unit cost</th><th class="num">Total cost</th></tr></thead><tbody>' +
      layers.map((l, i) => '<tr><td>' + l[0] + '</td><td class="num"><input id="' + id + '-u' + i + '" class="m" inputmode="numeric" value="' + l[1] + '" aria-label="' + l[0] + ' units"></td>' +
        '<td class="num"><input id="' + id + '-c' + i + '" class="m" inputmode="decimal" value="' + l[2] + '" aria-label="' + l[0] + ' unit cost"></td><td class="num lt"></td></tr>').join('') +
      '</tbody><tfoot><tr><td>Goods available for sale</td><td class="num ga-u"></td><td></td><td class="num ga-c"></td></tr></tfoot></table></div>' +
      '<div class="w-inputs"><label for="' + id + '-sold">Units sold <input id="' + id + '-sold" class="m" inputmode="numeric" value="25"></label>' +
      '<label for="' + id + '-price">Selling price per unit <span class="inwrap"><span class="affix">$</span><input id="' + id + '-price" class="m" inputmode="decimal" value="400"></span></label></div>' +
      '<div class="w-out"></div>';
    const $ = (s) => el.querySelector(s);
    const calc = () => {
      const L = layers.map((l, i) => ({ name: l[0], u: Math.max(0, Math.floor(parseNum($('#' + id + '-u' + i).value) || 0)), c: Math.max(0, parseNum($('#' + id + '-c' + i).value) || 0) }));
      el.querySelectorAll('.lt').forEach((td, i) => { td.textContent = fmt(r2(L[i].u * L[i].c)); });
      const units = L.reduce((s, l) => s + l.u, 0), cost = r2(L.reduce((s, l) => s + l.u * l.c, 0));
      $('.ga-u').textContent = fmt(units);
      $('.ga-c').textContent = money(cost);
      const sold = Math.max(0, Math.floor(parseNum($('#' + id + '-sold').value) || 0));
      const price = Math.max(0, parseNum($('#' + id + '-price').value) || 0);
      const out = $('.w-out');
      if (sold > units) { out.innerHTML = '<p class="w-warn">You can’t sell ' + sold + ' units when only ' + units + ' are available. Lower units sold or add purchases.</p>'; return; }
      const take = (order) => {
        let left = sold, c = 0; const parts = [];
        order.forEach((l) => { const n = Math.min(left, l.u); if (n > 0) { c += n * l.c; parts.push(n + ' × ' + money(l.c)); left -= n; } });
        return { cogs: r2(c), how: parts.join(' + ') || '0 units' };
      };
      const fifo = take(L), lifo = take(L.slice().reverse());
      const avgCost = units ? cost / units : 0;
      const avg = { cogs: r2(sold * avgCost), how: sold + ' × ' + money(r2(avgCost)) + ' average' };
      const sales = r2(sold * price);
      const row = (name, m) => '<tr><td><b>' + name + '</b><span class="layers m">' + m.how + '</span></td><td class="num">' + money(m.cogs) + '</td><td class="num">' + money(r2(cost - m.cogs)) + '</td><td class="num">' + money(r2(sales - m.cogs)) + '</td></tr>';
      out.innerHTML = '<div class="scroll-x"><table class="grid compact results"><thead><tr><th>Method</th><th class="num">Cost of goods sold</th><th class="num">Ending inventory</th><th class="num">Gross profit</th></tr></thead><tbody>' +
        row('FIFO', fifo) + row('LIFO', lifo) + row('Weighted average', avg) + '</tbody></table></div>' +
        '<p class="w-foot">Sales revenue is ' + money(sales) + ' under every method. Only the split of ' + money(cost) + ' between cost of goods sold and ending inventory changes.' +
        (fifo.cogs < lifo.cogs ? ' Prices rose during the month, so FIFO reports the higher profit and LIFO the lower.' : fifo.cogs > lifo.cogs ? ' Prices fell during the month, so LIFO reports the higher profit.' : '') + '</p>';
    };
    el.querySelectorAll('input').forEach((i) => i.addEventListener('input', calc));
    calc();
  };

  // ---------- 4. Depreciation schedule ----------

  W.depreciation = (el) => {
    const id = uid('dep');
    el.innerHTML =
      '<div class="w-head"><div class="w-title">Depreciation scheduler</div><div class="w-sub">Delivery van example. Try each method and compare the totals.</div></div>' +
      '<div class="w-inputs">' +
      '<label for="' + id + '-cost">Cost <span class="inwrap"><span class="affix">$</span><input id="' + id + '-cost" class="m" inputmode="decimal" value="40000"></span></label>' +
      '<label for="' + id + '-salv">Salvage value <span class="inwrap"><span class="affix">$</span><input id="' + id + '-salv" class="m" inputmode="decimal" value="4000"></span></label>' +
      '<label for="' + id + '-life">Useful life (years) <input id="' + id + '-life" class="m" inputmode="numeric" value="5"></label>' +
      '<label for="' + id + '-m">Method <select id="' + id + '-m"><option value="sl">Straight-line</option><option value="ddb">Double-declining-balance</option><option value="syd">Sum-of-the-years’-digits</option></select></label>' +
      '</div><div class="w-out"></div>';
    const $ = (s) => el.querySelector(s);
    const calc = () => {
      const cost = parseNum($('#' + id + '-cost').value), salv = parseNum($('#' + id + '-salv').value);
      const life = Math.floor(parseNum($('#' + id + '-life').value));
      const m = $('#' + id + '-m').value;
      const out = $('.w-out');
      if (!(cost > 0) || !(salv >= 0) || salv >= cost || !(life >= 1 && life <= 40)) {
        out.innerHTML = '<p class="w-warn">Enter a cost above zero, a salvage value below cost, and a life from 1 to 40 years.</p>';
        return;
      }
      const base = cost - salv;
      let bv = cost, acc = 0, rows = '', note = '';
      const syd = life * (life + 1) / 2;
      for (let y = 1; y <= life; y++) {
        let d;
        if (m === 'sl') d = base / life;
        else if (m === 'syd') d = base * (life - y + 1) / syd;
        else d = y === life ? bv - salv : Math.min(bv * 2 / life, bv - salv);
        d = r2(Math.max(0, d));
        if (y === life) d = r2(cost - salv - acc);  // absorb rounding so the asset lands exactly on salvage
        const begin = bv;
        acc = r2(acc + d); bv = r2(cost - acc);
        rows += '<tr><td class="m">' + y + '</td><td class="num">' + fmt(begin) + '</td><td class="num">' + fmt(d) + '</td><td class="num">' + fmt(acc) + '</td><td class="num">' + fmt(bv) + '</td></tr>';
      }
      if (m === 'sl') note = 'Rate: (' + money(cost) + ' − ' + money(salv) + ') ÷ ' + life + ' = ' + money(r2(base / life)) + ' a year, every year.';
      if (m === 'ddb') note = 'Rate: 2 ÷ ' + life + ' = ' + r2(200 / life) + '% of each year’s <i>beginning book value</i>. Salvage is ignored until the end; the final year takes whatever brings book value down to exactly ' + money(salv) + '.';
      if (m === 'syd') note = 'Digits: 1 + 2 + … + ' + life + ' = ' + syd + '. Year 1 takes ' + life + '/' + syd + ' of the ' + money(base) + ' depreciable base, year 2 takes ' + (life - 1) + '/' + syd + ', and so on.';
      out.innerHTML = '<div class="scroll-x"><table class="grid compact nums"><thead><tr><th>Year</th><th class="num">Beginning book value</th><th class="num">Depreciation expense</th><th class="num">Accumulated depreciation</th><th class="num">Ending book value</th></tr></thead><tbody>' +
        rows + '</tbody><tfoot><tr><td>Total</td><td></td><td class="num">' + money(base) + '</td><td></td><td></td></tr></tfoot></table></div><p class="w-foot">' + note + '</p>';
    };
    el.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', calc));
    calc();
  };

  // ---------- 5. Break-even explorer ----------

  W.breakeven = (el) => {
    const id = uid('be');
    const S = { price: 25, vc: 10, fixed: 30000, expected: 2600 };
    const slider = (k, label, min, max, step) =>
      '<label class="slide" for="' + id + '-' + k + '"><span class="slide-l">' + label + '</span><span class="slide-v m" data-v="' + k + '"></span>' +
      '<input type="range" id="' + id + '-' + k + '" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + S[k] + '"></label>';
    el.innerHTML =
      '<div class="w-head"><div class="w-title">Break-even explorer</div><div class="w-sub">Ridgeline Candle Co. Drag the sliders and watch where the lines cross.</div></div>' +
      '<div class="be-ctl">' + slider('price', 'Price per candle', 5, 60, 1) + slider('vc', 'Variable cost per candle', 1, 40, 1) +
      slider('fixed', 'Fixed costs per month', 5000, 80000, 1000) + slider('expected', 'Expected sales (units)', 0, 8000, 100) + '</div>' +
      '<div class="be-stats"></div>' +
      '<div class="chart-box"><div class="chart-title">Revenue and total cost by units sold</div><div class="legend"><span><i class="sw s1"></i>Total revenue</span><span><i class="sw s2"></i>Total cost</span><span><i class="sw sf"></i>Fixed cost</span></div><div class="chart"></div></div>';
    const box = el.querySelector('.chart');
    const tip = tooltip(box);
    const draw = () => {
      el.querySelectorAll('[data-v]').forEach((s) => { const k = s.dataset.v; s.textContent = k === 'expected' ? fmt(S[k]) : money(S[k]); });
      const cm = S.price - S.vc;
      const stats = el.querySelector('.be-stats');
      if (cm <= 0) {
        stats.innerHTML = '<p class="w-warn">Each candle costs at least as much to make as it sells for, so the company can never break even. Raise the price or lower the variable cost.</p>';
        if (box.querySelector('svg')) box.querySelector('svg').remove();
        tip.hide();
        return;
      }
      const ratio = cm / S.price, beU = S.fixed / cm, beS = S.fixed / ratio;
      const mos = S.expected - beU;
      const profit = S.expected * cm - S.fixed;
      const stat = (l, v) => '<div class="stat"><div class="stat-l">' + l + '</div><div class="stat-v m">' + v + '</div></div>';
      stats.innerHTML = stat('Contribution margin per unit', money(cm)) + stat('Contribution margin ratio', r2(ratio * 100) + '%') +
        stat('Break-even units', fmt(Math.ceil(beU - 1e-9))) + stat('Break-even sales', money(Math.round(beS))) +
        stat('Profit at expected sales', money(Math.round(profit))) + stat('Margin of safety', (mos >= 0 ? fmt(Math.round(mos)) + ' units' : 'below break-even'));

      const W0 = Math.max(280, box.clientWidth), H = 240, padL = 56, padR = 14, padT = 14, padB = 32;
      const maxU = Math.max(1000, Math.ceil(Math.max(beU * 2, S.expected * 1.2) / 500) * 500);
      const maxY = Math.max(maxU * S.price, S.fixed + maxU * S.vc);
      const yt = niceTicks(0, maxY, 4), xt = niceTicks(0, maxU, 4);
      const yMax = yt[yt.length - 1], xMax = xt[xt.length - 1];
      const x = (u) => padL + u / xMax * (W0 - padL - padR);
      const y = (v) => padT + (1 - v / yMax) * (H - padT - padB);
      let svg = '<svg width="' + W0 + '" height="' + H + '" role="img" aria-label="Break-even chart">';
      yt.forEach((t) => { svg += '<line class="grid-l" x1="' + padL + '" x2="' + (W0 - padR) + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="axis-t" x="' + (padL - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + compact(t) + '</text>'; });
      xt.forEach((t) => { svg += '<text class="axis-t" x="' + x(t) + '" y="' + (H - 12) + '" text-anchor="middle">' + fmt(t) + '</text>'; });
      // profit wash right of break-even, loss wash left of it
      const bx = Math.min(beU, xMax);
      svg += '<path class="wash loss" d="M' + x(0) + ',' + y(0) + 'L' + x(0) + ',' + y(S.fixed) + 'L' + x(bx) + ',' + y(S.fixed + bx * S.vc) + 'Z"/>';
      if (beU < xMax) svg += '<path class="wash gain" d="M' + x(beU) + ',' + y(beU * S.price) + 'L' + x(xMax) + ',' + y(xMax * S.price) + 'L' + x(xMax) + ',' + y(S.fixed + xMax * S.vc) + 'Z"/>';
      svg += '<line class="ln sf" x1="' + x(0) + '" x2="' + x(xMax) + '" y1="' + y(S.fixed) + '" y2="' + y(S.fixed) + '"/>';
      svg += '<line class="ln s2" x1="' + x(0) + '" x2="' + x(xMax) + '" y1="' + y(S.fixed) + '" y2="' + y(S.fixed + xMax * S.vc) + '"/>';
      svg += '<line class="ln s1" x1="' + x(0) + '" x2="' + x(xMax) + '" y1="' + y(0) + '" y2="' + y(xMax * S.price) + '"/>';
      if (S.expected <= xMax) svg += '<line class="exp-l" x1="' + x(S.expected) + '" x2="' + x(S.expected) + '" y1="' + padT + '" y2="' + y(0) + '"/><text class="axis-t" x="' + (x(S.expected) + 4) + '" y="' + (padT + 10) + '">expected</text>';
      if (beU <= xMax) svg += '<circle class="be-dot" cx="' + x(beU) + '" cy="' + y(beS) + '" r="5"/><text class="be-lbl" x="' + (x(beU) - 8) + '" y="' + (y(beS) - 10) + '" text-anchor="end">Break-even ' + fmt(Math.ceil(beU - 1e-9)) + ' units</text>';
      svg += '<line class="cross" x1="0" x2="0" y1="' + padT + '" y2="' + y(0) + '" visibility="hidden"/><rect class="hit" x="' + padL + '" y="' + padT + '" width="' + (W0 - padL - padR) + '" height="' + (H - padT - padB) + '"/></svg>';
      box.querySelector('svg') && box.querySelector('svg').remove();
      box.insertAdjacentHTML('afterbegin', svg);
      const hit = box.querySelector('.hit'), cross = box.querySelector('.cross');
      const move = (ev) => {
        const b = box.getBoundingClientRect();
        const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - b.left;
        const u = Math.max(0, Math.min(xMax, (cx - padL) / (W0 - padL - padR) * xMax));
        const uu = Math.round(u / 10) * 10;
        cross.setAttribute('x1', x(uu)); cross.setAttribute('x2', x(uu)); cross.setAttribute('visibility', 'visible');
        const rev = uu * S.price, tc = S.fixed + uu * S.vc;
        tip.show('<b>' + fmt(uu) + ' units</b><br>Revenue ' + money(rev) + '<br>Total cost ' + money(tc) + '<br>' + (rev >= tc ? 'Profit' : 'Loss') + ' <b>' + money(Math.abs(rev - tc)) + '</b>', x(uu), y(Math.max(rev, tc)));
      };
      hit.addEventListener('mousemove', move);
      hit.addEventListener('touchstart', move, { passive: true });
      hit.addEventListener('touchmove', move, { passive: true });
      hit.addEventListener('mouseleave', () => { tip.hide(); cross.setAttribute('visibility', 'hidden'); });
    };
    el.querySelectorAll('input[type=range]').forEach((r) => r.addEventListener('input', () => { S[r.dataset.k] = +r.value; draw(); }));
    onResize(box, draw);
  };

  // ---------- 6. Ledger Lab, embedded ----------

  W.lab = (el, opts) => { window.Lab.mount(el, Object.assign({ compact: true }, opts)); };

  function mount(root) {
    root.querySelectorAll('.widget[data-widget]').forEach((el) => {
      if (el.dataset.mounted) return;
      const fn = W[el.dataset.widget];
      if (!fn) return;
      el.dataset.mounted = '1';
      let opts = {};
      try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
      fn(el, opts);
    });
  }

  window.Widgets = { mount, niceTicks, colPath };
})();
