/* App shell: routing, the contents sidebar, and every page view. */
(function () {
  'use strict';
  const { fmt, esc, progress } = Book;
  const chapters = Book.chapters;
  const money = (n) => fmt(n, { cur: true });
  const $ = (s, r) => (r || document).querySelector(s);
  const main = $('#main');
  const toc = $('#toc');

  const PARTS = {
    1: 'Foundations',
    2: 'The Accounting Cycle',
    3: 'Assets, Liabilities & Equity',
    4: 'Reading the Numbers'
  };
  const pad = (n) => String(n).padStart(2, '0');
  const byId = (id) => chapters.find((c) => c.id === id);

  function ring(pct) {
    const r = 7, c = 2 * Math.PI * r;
    return '<svg class="ring" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="' + r + '" class="ring-bg"/>' +
      (pct > 0 ? '<circle cx="9" cy="9" r="' + r + '" class="ring-fg" stroke-dasharray="' + (c * pct) + ' ' + c + '"/>' : '') +
      (pct >= 1 ? '<path class="ring-ok" d="M5.5 9.2l2.3 2.3 4.7-4.9"/>' : '') + '</svg>';
  }

  // ---------- sidebar ----------

  function drawToc(activeId) {
    let html = '<nav class="toc-nav" aria-label="Site"><a href="#home" data-nav="home">Contents</a><a href="#lab" data-nav="lab">Ledger Lab</a>' +
      '<a href="#review" data-nav="review">Mixed review</a><a href="#glossary" data-nav="glossary">Glossary</a></nav>';
    Object.keys(PARTS).forEach((p) => {
      html += '<div class="toc-part"><div class="toc-part-h"><span class="m">Part ' + ['I', 'II', 'III', 'IV'][p - 1] + '</span> ' + PARTS[p] + '</div><ol>';
      chapters.filter((c) => c.part === +p).forEach((c) => {
        const s = progress.summary(c);
        html += '<li><a href="#' + c.id + '" class="' + (c.id === activeId ? 'on' : '') + '"' + (c.id === activeId ? ' aria-current="page"' : '') + '>' +
          '<span class="toc-n m">' + pad(c.num) + '</span><span class="toc-t">' + c.title + '</span>' + ring(s.pct) + '</a></li>';
      });
      html += '</ol></div>';
    });
    toc.innerHTML = html;
    const pct = Math.round(progress.overall() * 100);
    $('#overallProgress').innerHTML = '<span class="m">' + pct + '%</span> complete';
  }

  function closeDrawer() { toc.classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
  $('#menuBtn').addEventListener('click', () => {
    const open = !toc.classList.contains('open');
    toc.classList.toggle('open', open);
    $('#scrim').hidden = !open;
    $('#menuBtn').setAttribute('aria-expanded', String(open));
  });
  $('#scrim').addEventListener('click', closeDrawer);
  toc.addEventListener('click', (e) => { if (e.target.closest('a')) closeDrawer(); });

  // ---------- home ----------

  function heroEquation(el) {
    const START = { A: { Cash: 10000 }, L: {}, E: { 'Owner investment': 10000 } };
    const TX = [
      { b: 'Borrow $5,000 from a bank', fx: { A: { Cash: 5000 }, L: { 'Bank loan': 5000 } } },
      { b: 'Buy a $3,000 laptop with cash', fx: { A: { Cash: -3000, Equipment: 3000 } } },
      { b: 'Earn $2,000 tutoring, paid in cash', fx: { A: { Cash: 2000 }, E: { 'Retained earnings': 2000 } } },
      { b: 'Pay $800 rent', fx: { A: { Cash: -800 }, E: { 'Retained earnings': -800 } } },
      { b: 'Repay $1,000 of the loan', fx: { A: { Cash: -1000 }, L: { 'Bank loan': -1000 } } }
    ];
    let st = JSON.parse(JSON.stringify(START));
    const sum = (g) => Object.values(g).reduce((s, v) => s + v, 0);
    el.innerHTML = '<div class="hero-eq" aria-live="polite"></div><div class="hero-what"></div>' +
      '<div class="hero-btns">' + TX.map((t, i) => '<button type="button" class="chip" data-i="' + i + '">' + t.b + '</button>').join('') +
      '<button type="button" class="chip ghost" data-reset>Reset</button></div>';
    const eq = $('.hero-eq', el);
    const draw = (prev, fx) => {
      const col = (k, label) => {
        const items = Object.keys(st[k]).filter((n) => st[k][n] !== 0).map((n) => {
          const hit = fx && fx[k] && fx[k][n];
          return '<div class="he-item' + (hit ? ' hit' : '') + '"><span>' + n + '</span><span class="m">' + fmt(st[k][n]) + '</span></div>';
        }).join('') || '<div class="he-item none">none yet</div>';
        return '<div class="he-col"><div class="he-label">' + label + '</div><div class="he-total m" data-from="' + (prev ? sum(prev[k]) : sum(st[k])) + '" data-to="' + sum(st[k]) + '">' + money(sum(st[k])) + '</div>' + items + '</div>';
      };
      eq.innerHTML = col('A', 'Assets') + '<div class="he-op">=</div>' + col('L', 'Liabilities') + '<div class="he-op">+</div>' + col('E', 'Equity');
      const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!rm) eq.querySelectorAll('.he-total').forEach((t) => {
        const a = +t.dataset.from, b = +t.dataset.to;
        if (a === b) return;
        const t0 = performance.now();
        const tick = (now) => { const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3); t.textContent = money(Math.round(a + (b - a) * e)); if (k < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    };
    draw();
    $('.hero-what', el).innerHTML = 'Tap a transaction. Whatever happens, the two sides stay equal.';
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const prev = JSON.parse(JSON.stringify(st));
      if (b.hasAttribute('data-reset')) {
        st = JSON.parse(JSON.stringify(START));
        draw(prev);
        $('.hero-what', el).innerHTML = 'Back to the start: the owner has put in $10,000.';
        return;
      }
      const t = TX[+b.dataset.i];
      const parts = [];
      ['A', 'L', 'E'].forEach((k) => Object.keys(t.fx[k] || {}).forEach((n) => {
        st[k][n] = (st[k][n] || 0) + t.fx[k][n];
        parts.push(n + ' <b class="m">' + (t.fx[k][n] > 0 ? '+' : '−') + money(Math.abs(t.fx[k][n])) + '</b>');
      }));
      draw(prev, t.fx);
      $('.hero-what', el).innerHTML = parts.join(' · ');
    });
  }

  function viewHome() {
    const last = byId(progress.last());
    const next = last || chapters[0];
    let list = '';
    Object.keys(PARTS).forEach((p) => {
      list += '<section class="part"><h2 class="part-h"><span class="m">Part ' + ['I', 'II', 'III', 'IV'][p - 1] + '</span>' + PARTS[p] + '</h2><ol class="ch-list">';
      chapters.filter((c) => c.part === +p).forEach((c) => {
        const s = progress.summary(c);
        list += '<li><a class="ch-row" href="#' + c.id + '"><span class="ch-n m">' + pad(c.num) + '</span>' +
          '<span class="ch-main"><span class="ch-t">' + c.title + '</span><span class="ch-b">' + c.blurb + '</span>' +
          '<span class="ch-m m">' + c.minutes + ' min · ' + c.videos.length + ' worked examples · ' + c.practice.length + ' problems</span></span>' +
          '<span class="ch-p">' + ring(s.pct) + '<span class="m">' + s.done + '/' + s.total + '</span></span></a></li>';
      });
      list += '</ol></section>';
    });
    main.innerHTML =
      '<div class="page home">' +
      '<section class="hero"><div class="hero-text"><div class="eyebrow m">An interactive textbook · 14 chapters</div>' +
      '<h1>Balanced Books</h1><p class="hero-lede">Accounting from the first entry. No background needed. Read a short lesson, watch a worked example play out step by step, then practice until it sticks.</p>' +
      '<div class="hero-cta"><a class="btn big" href="#' + next.id + '">' + (last ? 'Continue: Chapter ' + next.num : 'Start Chapter 1') + '</a>' +
      '<a class="btn ghost big" href="#lab">Open the Ledger Lab</a></div></div>' +
      '<div class="hero-demo" aria-label="Try the accounting equation"></div></section>' +
      '<section class="how"><div><div class="how-k m">Read</div><p>Short lessons in plain English, with a check-yourself question after each big idea and calculators you can play with.</p></div>' +
      '<div><div class="how-k m">Watch</div><p>Narrated worked examples that build each journal entry, T-account and statement one step at a time. Pause, rewind, change speed.</p></div>' +
      '<div><div class="how-k m">Practice</div><p>' + chapters.reduce((s, c) => s + c.practice.length, 0) + ' graded problems: journal entries, calculations and classification, each with a worked solution.</p></div></section>' +
      list +
      '<p class="fine">Progress is saved in this browser only. Examples use U.S. GAAP. Tax and payroll rates are illustrative, so check current rules before relying on them for a real filing.</p>' +
      '</div>';
    heroEquation($('.hero-demo'));
  }

  // ---------- chapter ----------

  const TABS = [['lesson', 'Lesson'], ['videos', 'Worked examples'], ['practice', 'Practice'], ['terms', 'Key terms']];

  function viewChapter(c, tab) {
    progress.setLast(c.id);
    const i = chapters.indexOf(c);
    const prev = chapters[i - 1], next = chapters[i + 1];
    const s = progress.summary(c);
    main.innerHTML =
      '<article class="page chapter">' +
      '<header class="ch-head"><div class="eyebrow m">Chapter ' + pad(c.num) + ' · Part ' + ['I', 'II', 'III', 'IV'][c.part - 1] + ' · ' + PARTS[c.part] + '</div>' +
      '<h1>' + c.title + '</h1><p class="ch-blurb">' + c.blurb + '</p>' +
      '<div class="ch-meta m">' + c.minutes + ' min read · ' + c.videos.length + ' worked examples · ' + c.practice.length + ' problems</div></header>' +
      '<div class="tabs" role="tablist">' + TABS.map(([k, l]) => {
        const badge = k === 'videos' ? s.vids + '/' + c.videos.length : k === 'practice' ? s.solved + '/' + c.practice.length : k === 'lesson' && s.read ? '✓' : '';
        return '<a role="tab" href="#' + c.id + '-' + k + '" aria-selected="' + (k === tab) + '">' + l + (badge ? ' <span class="badge m">' + badge + '</span>' : '') + '</a>';
      }).join('') + '</div>' +
      '<div class="tabpanel"></div>' +
      '<nav class="ch-nav">' + (prev ? '<a href="#' + prev.id + '"><span class="m">← Chapter ' + prev.num + '</span>' + prev.title + '</a>' : '<span></span>') +
      (next ? '<a class="nx" href="#' + next.id + '"><span class="m">Chapter ' + next.num + ' →</span>' + next.title + '</a>' : '<a class="nx" href="#review"><span class="m">Finished →</span>Mixed review</a>') + '</nav>' +
      '</article>';
    const panel = $('.tabpanel');
    if (tab === 'lesson') lessonTab(c, panel);
    if (tab === 'videos') videosTab(c, panel);
    if (tab === 'practice') practiceTab(c, panel);
    if (tab === 'terms') termsTab(c, panel);
  }

  function refreshBadges(c) {
    const s = progress.summary(c);
    const tabs = document.querySelectorAll('.tabs [role=tab]');
    tabs.forEach((t) => {
      const k = t.getAttribute('href').split('-').pop();
      const badge = k === 'videos' ? s.vids + '/' + c.videos.length : k === 'practice' ? s.solved + '/' + c.practice.length : k === 'lesson' && s.read ? '✓' : '';
      const b = t.querySelector('.badge');
      if (badge) { if (b) b.textContent = badge; else t.insertAdjacentHTML('beforeend', ' <span class="badge m">' + badge + '</span>'); }
    });
    drawToc(c.id);
  }

  function lessonTab(c, panel) {
    panel.innerHTML =
      '<div class="objectives"><div class="obj-h">By the end of this chapter you can</div><ul>' + c.objectives.map((o) => '<li>' + o + '</li>').join('') + '</ul></div>' +
      '<nav class="sections" aria-label="Sections"></nav>' +
      '<div class="prose lesson">' + c.lesson + '</div>' +
      '<div class="lesson-end"><p>That’s the reading. Next, watch the ideas worked through with real numbers.</p>' +
      '<a class="btn" href="#' + c.id + '-videos">Mark as read and watch the examples →</a></div>';
    const hs = panel.querySelectorAll('.lesson h2');
    const secNav = $('.sections', panel);
    hs.forEach((h, i) => {
      h.insertAdjacentHTML('afterbegin', '<span class="secnum m">' + c.num + '.' + (i + 1) + '</span>');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="m">' + c.num + '.' + (i + 1) + '</span> ' + h.textContent.replace(/^[\d.]+/, '');
      b.addEventListener('click', () => h.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      secNav.appendChild(b);
    });
    panel.querySelectorAll('.quick').forEach((q) => {
      const p = Book.quick[+q.dataset.quick];
      const wrap = document.createElement('div');
      q.appendChild(wrap);
      q.insertAdjacentHTML('afterbegin', '<div class="quick-h">Check yourself</div>');
      Practice.render(wrap, p, {});
    });
    Widgets.mount(panel);
    $('.lesson-end .btn', panel).addEventListener('click', () => { progress.markRead(c.id); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { io.disconnect(); if (!progress.get(c.id).read) { progress.markRead(c.id); refreshBadges(c); } }
      });
      io.observe($('.lesson-end', panel));
    }
  }

  function videosTab(c, panel) {
    panel.innerHTML = '<p class="tab-intro">Each worked example plays like a short video: press play to hear the narration and watch the numbers move, or step through at your own pace with the arrows. Captions are on by default.</p>' +
      c.videos.map((v, i) => '<section class="video"><div class="video-h"><span class="m">Example ' + c.num + '.' + String.fromCharCode(65 + i) + '</span><span class="video-len m">' + Player.duration(v) + '</span>' +
        (progress.get(c.id).videos[v.id] ? '<span class="watched">Watched</span>' : '') + '</div>' +
        '<h2>' + v.title + '</h2><p>' + v.summary + '</p><div class="pl" data-v="' + i + '"></div></section>').join('') +
      (c.more && c.more.length ? '<section class="more"><h3>Go further</h3><p>Prefer a human teacher at a whiteboard? These open YouTube searches for this chapter’s topics in a new tab.</p><ul>' +
        c.more.map((q) => '<li><a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '" target="_blank" rel="noopener">' + esc(q) + '</a></li>').join('') + '</ul></section>' : '');
    panel.querySelectorAll('.pl').forEach((el) => {
      const v = c.videos[+el.dataset.v];
      new Player(el, v, {
        onComplete: () => {
          if (!progress.get(c.id).videos[v.id]) { progress.markVideo(c.id, v.id); refreshBadges(c); }
        },
        onPractice: () => { location.hash = c.id + '-practice'; }
      });
    });
  }

  function practiceTab(c, panel) {
    const s = progress.summary(c);
    panel.innerHTML = '<div class="score"><div><div class="score-n m"><span class="solved">' + s.solved + '</span> of ' + c.practice.length + ' solved</div>' +
      '<div class="score-bar"><span style="width:' + (s.solved / c.practice.length * 100) + '%"></span></div></div>' +
      '<button type="button" class="btn ghost small reset">Reset this chapter’s practice</button></div>' +
      '<p class="tab-intro">Problems run from <b>Basic</b> to <b>Challenge</b>. Use the hint if you’re stuck; the full solution explains the reasoning, not just the answer.</p>' +
      '<div class="problems"></div>';
    const list = $('.problems', panel);
    c.practice.forEach((p, i) => {
      const el = document.createElement('div');
      list.appendChild(el);
      Practice.render(el, p, {
        label: c.num + '.' + (i + 1),
        solved: !!progress.get(c.id).solved['p' + i],
        onSolved: () => {
          progress.markSolved(c.id, 'p' + i);
          const ns = progress.summary(c);
          $('.solved', panel).textContent = ns.solved;
          $('.score-bar span', panel).style.width = (ns.solved / c.practice.length * 100) + '%';
          refreshBadges(c);
        }
      });
    });
    let armed = false;
    $('.reset', panel).addEventListener('click', (e) => {
      if (!armed) { armed = true; e.currentTarget.textContent = 'Click again to reset'; return; }
      progress.resetPractice(c.id);
      route();
    });
  }

  function termsTab(c, panel) {
    panel.innerHTML = '<dl class="terms">' + c.terms.map((t) => '<div><dt>' + t[0] + '</dt><dd>' + t[1] + '</dd></div>').join('') + '</dl>';
  }

  // ---------- glossary ----------

  function viewGlossary() {
    const all = [];
    chapters.forEach((c) => c.terms.forEach((t) => all.push({ t: t[0], d: t[1], c })));
    all.sort((a, b) => a.t.localeCompare(b.t));
    main.innerHTML = '<div class="page"><header class="ch-head"><div class="eyebrow m">Reference</div><h1>Glossary</h1>' +
      '<p class="ch-blurb">Every key term in the book, ' + all.length + ' in all, with the chapter that introduces it.</p></header>' +
      '<label class="search" for="gq"><span class="vh">Search terms</span><input id="gq" type="search" placeholder="Search, e.g. accrual, contra, FIFO" autocomplete="off"></label>' +
      '<dl class="terms gloss"></dl></div>';
    const dl = $('.gloss');
    const draw = (q) => {
      q = (q || '').toLowerCase();
      const hits = all.filter((x) => !q || x.t.toLowerCase().includes(q) || x.d.toLowerCase().includes(q));
      dl.innerHTML = hits.map((x) => '<div><dt>' + x.t + ' <a class="gref m" href="#' + x.c.id + '">Ch. ' + x.c.num + '</a></dt><dd>' + x.d + '</dd></div>').join('') ||
        '<p class="lab-empty">No terms match “' + esc(q) + '”.</p>';
    };
    $('#gq').addEventListener('input', (e) => draw(e.target.value));
    draw();
  }

  // ---------- mixed review ----------

  function viewReview() {
    main.innerHTML = '<div class="page"><header class="ch-head"><div class="eyebrow m">Mixed review</div><h1>Mixed Review</h1>' +
      '<p class="ch-blurb">A shuffled set of problems from the chapters you choose. Mixing topics is harder than practicing one at a time, and it’s what makes the ideas stick.</p></header>' +
      '<div class="rv-ctl"><div class="rv-chaps" role="group" aria-label="Chapters to include">' +
      chapters.map((c) => '<button type="button" class="chip on" aria-pressed="true" data-id="' + c.id + '"><span class="m">' + pad(c.num) + '</span> ' + c.short + '</button>').join('') + '</div>' +
      '<div class="rv-row"><label for="rvN">Questions <select id="rvN"><option>10</option><option>20</option><option>30</option></select></label>' +
      '<button type="button" class="btn ghost small rv-none">Clear all</button><button type="button" class="btn ghost small rv-all">Select all</button>' +
      '<button type="button" class="btn rv-go">New set</button></div></div>' +
      '<div class="score"><div><div class="score-n m"><span class="solved">0</span> of <span class="of">0</span> solved</div><div class="score-bar"><span style="width:0"></span></div></div></div>' +
      '<div class="problems"></div></div>';
    const chips = Array.from(document.querySelectorAll('.rv-chaps .chip'));
    chips.forEach((b) => b.addEventListener('click', () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }));
    $('.rv-none').addEventListener('click', () => chips.forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }));
    $('.rv-all').addEventListener('click', () => chips.forEach((b) => { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }));
    const make = () => {
      const ids = chips.filter((b) => b.classList.contains('on')).map((b) => b.dataset.id);
      const pool = [];
      chapters.filter((c) => ids.includes(c.id)).forEach((c) => c.practice.forEach((p, i) => pool.push({ c, p, i })));
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const set = pool.slice(0, +$('#rvN').value);
      const list = $('.problems');
      list.innerHTML = set.length ? '' : '<p class="lab-empty">Pick at least one chapter, then press <b>New set</b>.</p>';
      let solved = 0;
      $('.of').textContent = set.length;
      $('.solved').textContent = 0;
      $('.score-bar span').style.width = '0';
      set.forEach((x, k) => {
        const el = document.createElement('div');
        list.appendChild(el);
        Practice.render(el, x.p, {
          label: String(k + 1),
          source: '<a href="#' + x.c.id + '">Ch. ' + x.c.num + ' · ' + x.c.short + '</a>',
          onSolved: () => {
            solved++;
            progress.markSolved(x.c.id, 'p' + x.i);
            $('.solved').textContent = solved;
            $('.score-bar span').style.width = (solved / set.length * 100) + '%';
            drawToc();
          }
        });
      });
    };
    $('.rv-go').addEventListener('click', make);
    make();
  }

  // ---------- lab ----------

  function viewLab() {
    main.innerHTML = '<div class="page wide"><header class="ch-head"><div class="eyebrow m">Practice space</div><h1>Ledger Lab</h1>' +
      '<p class="ch-blurb">A working set of books. Post journal entries and the ledger, trial balance, income statement and balance sheet update instantly. Your journal is saved in this browser.</p></header><div class="labhost"></div></div>';
    Lab.mount($('.labhost'), { persist: true });
  }

  // ---------- router ----------

  function route() {
    Player.stopAll();
    const h = location.hash.replace(/^#/, '') || 'home';
    let active = null;
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === h));
    const m = h.match(/^(ch\d+)(?:-(lesson|videos|practice|terms))?$/);
    if (m && byId(m[1])) {
      active = m[1];
      viewChapter(byId(m[1]), m[2] || 'lesson');
      document.title = byId(m[1]).title + ' · Balanced Books';
    } else if (h === 'glossary') { viewGlossary(); document.title = 'Glossary · Balanced Books'; }
    else if (h === 'review') { viewReview(); document.title = 'Mixed Review · Balanced Books'; }
    else if (h === 'lab') { viewLab(); document.title = 'Ledger Lab · Balanced Books'; }
    else { viewHome(); document.title = 'Balanced Books'; }
    drawToc(active);
    const onlyTab = m && m[2] && main.dataset.ch === m[1];
    main.dataset.ch = m ? m[1] : '';
    if (onlyTab) {
      const tabs = $('.tabs');
      if (tabs && tabs.getBoundingClientRect().top < 0) tabs.scrollIntoView({ block: 'start' });
    } else window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  route();
})();
