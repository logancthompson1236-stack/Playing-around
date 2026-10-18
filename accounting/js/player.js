/* Lesson player: plays a worked example as a sequence of animated "board" frames with
   captions and optional spoken narration (Web Speech API). A video is
   {id, title, summary, steps: [{say, f?, hi?, n?, speak?}]}; a step without `f` keeps the
   previous frame and may override its highlight (`hi`) or reveal count (`n`). */
(function () {
  'use strict';
  const { fmt, esc, stmtRowsHTML } = Book;

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.5v14H6zM20 5v14L9.5 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 5H18v14h-2.5zM4 5v14l10.5-7z"/></svg>',
    voice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    fs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5v2H6v3zM15 4h5v5h-2V6h-3zM4 15h2v3h3v2H4zM18 15h2v5h-5v-2h3z"/></svg>',
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>'
  };

  const hiHas = (hi, x) => hi !== undefined && hi !== null && [].concat(hi).includes(x);
  const sum = (g) => Object.values(g || {}).reduce((s, v) => s + v, 0);
  const strip = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, 'and').replace(/\s+/g, ' ').trim();
  const words = (s) => strip(s).split(' ').length;
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- frame renderers ----------

  const R = {
    title(f) {
      return '<div class="f-title">' + (f.eyebrow ? '<div class="f-eyebrow">' + f.eyebrow + '</div>' : '') +
        '<div class="f-h">' + f.h + '</div>' + (f.sub ? '<div class="f-sub">' + f.sub + '</div>' : '') + '</div>';
    },

    points(f) {
      const n = f.n === undefined ? f.items.length : f.n;
      return '<div class="f-points">' + (f.h ? '<div class="f-h2">' + f.h + '</div>' : '') +
        '<ol' + (f.plain ? ' class="plain"' : '') + '>' + f.items.map((t, i) =>
          '<li class="' + (i >= n ? 'later ' : '') + (hiHas(f.hi, i) ? 'hi' : '') + '" style="--i:' + i + '">' + t + '</li>').join('') +
        '</ol></div>';
    },

    eq(f, prev) {
      const labels = Object.assign({ A: 'Assets', L: 'Liabilities', E: 'Equity' }, f.labels || {});
      const prevEq = prev && prev.k === 'eq' ? prev : null;
      const cols = ['A', 'L', 'E'].map((k, gi) => {
        const g = f[k] || {};
        const total = sum(g);
        const from = prevEq ? sum(prevEq[k]) : total;
        const items = Object.keys(g).map((n) => {
          const changed = prevEq && (prevEq[k] || {})[n] !== g[n];
          return '<div class="eq-item' + (hiHas(f.hi, n) ? ' hi' : '') + (changed ? ' changed' : '') + '"><span>' + esc(n) + '</span><span class="m">' + fmt(g[n]) + '</span></div>';
        }).join('');
        return (gi === 1 ? '<div class="eq-op">=</div>' : gi === 2 ? '<div class="eq-op">+</div>' : '') +
          '<div class="eq-col' + (hiHas(f.hi, k) ? ' hi' : '') + '"><div class="eq-label">' + labels[k] + '</div>' +
          '<div class="eq-total m" data-count="' + total + '" data-from="' + from + '">' + fmt(total, { cur: true }) + '</div>' +
          '<div class="eq-items">' + items + '</div></div>';
      }).join('');
      const ok = Math.abs(sum(f.A) - sum(f.L) - sum(f.E)) < 0.005;
      return '<div class="f-eqwrap">' + (f.h ? '<div class="f-h2">' + f.h + '</div>' : '') +
        '<div class="f-eq">' + cols + '</div>' +
        '<div class="eq-foot">' + (f.note ? '<span class="eq-note">' + f.note + '</span>' : '') +
        '<span class="eq-chip ' + (ok ? 'ok' : 'off') + '">' + (ok ? 'Balanced' : 'Out of balance') + '</span></div></div>';
    },

    t(f, prev) {
      const prevMap = {};
      if (prev && prev.k === 't') prev.accts.forEach((a) => { prevMap[a.n] = a; });
      const cell = (x) => x === undefined ? '' : Array.isArray(x)
        ? '<span class="tref">' + esc(x[0]) + '</span><span class="tamt">' + fmt(x[1]) + '</span>'
        : '<span class="tamt">' + fmt(x) + '</span>';
      const accts = f.accts.map((a) => {
        const dr = a.dr || [], cr = a.cr || [];
        const p = prevMap[a.n];
        const pd = p ? (p.dr || []).length : (prev ? 0 : Infinity);
        const pc = p ? (p.cr || []).length : (prev ? 0 : Infinity);
        const n = Math.max(dr.length, cr.length, 1);
        let rows = '';
        for (let i = 0; i < n; i++) {
          rows += '<div class="ts dr' + (dr[i] !== undefined && i >= pd ? ' new' : '') + '">' + cell(dr[i]) + '</div>' +
            '<div class="ts cr' + (cr[i] !== undefined && i >= pc ? ' new' : '') + '">' + cell(cr[i]) + '</div>';
        }
        const bal = Book.tBalance(dr, cr);
        if (!f.noBal && (dr.length || cr.length)) {
          rows += '<div class="ts dr bal">' + (bal > 0 ? cell(['Bal', bal]) : '') + '</div><div class="ts cr bal">' + (bal < 0 ? cell(['Bal', -bal]) : '') + '</div>';
        }
        return '<div class="ft' + (hiHas(f.hi, a.n) ? ' hi' : '') + '"><div class="ft-name">' + esc(a.n) + '</div><div class="ft-body">' + rows + '</div></div>';
      }).join('');
      return '<div class="f-t">' + (f.h ? '<div class="f-h2">' + f.h + '</div>' : '') +
        '<div class="f-tgrid' + (f.accts.length > 4 ? ' many' : '') + '">' + accts + '</div></div>';
    },

    je(f) {
      const show = f.show === undefined ? f.entries.length : f.show;
      let rows = '';
      f.entries.forEach((e, ei) => {
        const cls = (ei >= show ? ' later' : '') + (hiHas(f.hi, ei) ? ' hi' : '');
        e.lines.forEach((l, j) => {
          const isCr = !l[1] && l[2];
          rows += '<tr class="' + cls + (j === 0 && ei > 0 ? ' gap' : '') + '"><td class="jd">' + (j === 0 ? esc(e.d || '') : '') + '</td>' +
            '<td class="ja' + (isCr ? ' cr' : '') + '">' + esc(l[0]) + '</td><td class="m dr">' + (l[1] ? fmt(l[1]) : '') + '</td>' +
            '<td class="m cr">' + (l[2] ? fmt(l[2]) : '') + '</td></tr>';
        });
        if (e.memo) rows += '<tr class="memo' + cls + '"><td></td><td colspan="3">' + esc(e.memo) + '</td></tr>';
      });
      return '<div class="f-je">' + (f.h ? '<div class="f-h2">' + f.h + '</div>' : '') +
        '<table><thead><tr><th class="jd">Date</th><th>Account</th><th class="m dr">Debit</th><th class="m cr">Credit</th></tr></thead><tbody>' +
        rows + '</tbody></table></div>';
    },

    stmt(f) {
      return '<div class="f-stmt"><div class="f-stmt-head">' + (f.h ? '<div class="f-stmt-co">' + f.h + '</div>' : '') +
        (f.sub ? '<div class="f-stmt-sub">' + f.sub + '</div>' : '') + '</div>' +
        '<table><tbody>' + stmtRowsHTML(f.rows, f.hi, f.n) + '</tbody></table>' +
        (f.note ? '<div class="f-note">' + f.note + '</div>' : '') + '</div>';
    },

    table(f) {
      const n = f.n === undefined ? f.rows.length : f.n;
      const cell = (c, ci) => {
        const isNum = typeof c === 'number';
        return '<td class="' + (isNum ? 'm' : '') + (hiHas(f.hc, ci) ? ' hc' : '') + '">' + (isNum ? fmt(c, { dec: f.dec }) : c) + '</td>';
      };
      return '<div class="f-table">' + (f.h ? '<div class="f-h2">' + f.h + '</div>' : '') +
        '<table>' + (f.head ? '<thead><tr>' + f.head.map((h, ci) => '<th class="' + (hiHas(f.hc, ci) ? 'hc' : '') + '">' + h + '</th>').join('') + '</tr></thead>' : '') +
        '<tbody>' + f.rows.map((r, ri) => '<tr class="' + (ri >= n ? 'later ' : '') + (hiHas(f.hi, ri) ? 'hi' : '') + '">' + r.map(cell).join('') + '</tr>').join('') + '</tbody>' +
        (f.foot ? '<tfoot><tr class="' + (hiHas(f.hi, 'foot') ? 'hi' : '') + '">' + f.foot.map(cell).join('') + '</tr></tfoot>' : '') +
        '</table>' + (f.note ? '<div class="f-note">' + f.note + '</div>' : '') + '</div>';
    },

    tl(f) {
      const n = f.n === undefined ? f.pts.length : f.n;
      return '<div class="f-tl">' + (f.h ? '<div class="f-h2">' + f.h + '</div>' : '') +
        '<div class="tl" style="--cols:' + f.pts.length + '">' + f.pts.map((p, i) =>
          '<div class="tl-pt' + (i >= n ? ' later' : '') + (hiHas(f.hi, i) ? ' hi' : '') + '"><div class="tl-at">' + p.at + '</div><div class="tl-dot"></div><div class="tl-l">' + p.l + '</div></div>').join('') +
        '</div>' + (f.note ? '<div class="f-note">' + f.note + '</div>' : '') + '</div>';
    },

    split(f, prev) {
      const p = prev && prev.k === 'split' ? prev : null;
      return '<div class="f-split">' + render(f.a, p && p.a) + render(f.b, p && p.b) + '</div>';
    }
  };

  function render(f, prev) {
    const fn = R[f.k];
    return fn ? fn(f, prev) : '';
  }

  function countUp(root) {
    if (reduceMotion()) return;
    root.querySelectorAll('[data-count]').forEach((el) => {
      const to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from);
      if (from === to || Number.isNaN(from)) return;
      const t0 = performance.now(), dur = 650;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(Math.round(from + (to - from) * e), { cur: true });
        if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(to, { cur: true });
      };
      requestAnimationFrame(tick);
    });
  }

  // Resolve each step's full frame up front so jumping around is cheap.
  function resolveFrames(steps) {
    const frames = [];
    let cur = null;
    steps.forEach((s) => {
      if (s.f) cur = s.f;
      else if (cur) {
        cur = Object.assign({}, cur);
        if ('hi' in s) cur.hi = s.hi;
        if ('n' in s) { cur.n = s.n; cur.show = s.n; }
      }
      frames.push(cur);
    });
    return frames;
  }

  function stepMs(step) { return Math.min(16000, Math.max(3200, words(step.say) * 340 + 1400)); }
  function videoLength(v) {
    const s = Math.round(v.steps.reduce((t, st) => t + stepMs(st), 0) / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  // ---------- speech ----------

  const synth = window.speechSynthesis;
  let voiceCache = null;
  function pickVoice() {
    if (!synth) return null;
    if (voiceCache) return voiceCache;
    const vs = synth.getVoices();
    if (!vs.length) return null;
    const en = vs.filter((v) => /^en[-_]/i.test(v.lang));
    voiceCache = en.find((v) => /natural|neural|online/i.test(v.name) && /en[-_]US/i.test(v.lang)) ||
      en.find((v) => /Google US English|Samantha|Aria|Jenny|Guy|Alex/i.test(v.name)) ||
      en.find((v) => /en[-_]US/i.test(v.lang)) || en[0] || vs[0];
    return voiceCache;
  }
  if (synth && 'onvoiceschanged' in synth) synth.onvoiceschanged = () => { voiceCache = null; };

  // ---------- player ----------

  const live = new Set();
  const SPEEDS = [1, 1.25, 1.5, 0.75];

  class Player {
    constructor(el, video, opts) {
      this.el = el;
      this.v = video;
      this.opts = opts || {};
      this.frames = resolveFrames(video.steps);
      this.i = 0;
      this.playing = false;
      this.token = 0;
      this.speed = Book.progress.getMisc('speed') || 1;
      const vPref = Book.progress.getMisc('voice');
      this.voice = !!synth && (vPref === undefined ? true : vPref);
      const ccPref = Book.progress.getMisc('cc');
      this.cc = ccPref === undefined ? true : ccPref;
      this.build();
      this.fit();
      this.show(0, false);
      live.add(this);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (live.has(this)) { this.fit(); this.fitFrame(); } });
    }

    // Size the stage to the tallest frame in this video (within the viewport), so frames
    // never spill out of the board and the height doesn't jump between steps.
    fit() {
      const stage = this.$stage;
      if (document.fullscreenElement === this.el) { stage.style.height = ''; stage.style.aspectRatio = ''; return; }
      const w = stage.clientWidth;
      if (!w) return;
      const narrow = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
      const base = w * (narrow ? 5 / 4 : 10 / 16);
      const m = document.createElement('div');
      m.className = 'frame measure';
      this.$stage.querySelector('.board').appendChild(m);
      let tallest = 0;
      new Set(this.frames).forEach((f) => {
        m.innerHTML = '<div class="frame-in k-' + f.k + '">' + render(f, null) + '</div>';
        tallest = Math.max(tallest, m.scrollHeight);
      });
      m.remove();
      const cap = this.cc ? this.$cap.offsetHeight : 0;
      const limit = Math.max(base, window.innerHeight * 0.8);
      stage.style.aspectRatio = 'auto';
      stage.style.height = Math.round(Math.min(limit, Math.max(base, tallest + cap + 4))) + 'px';
    }

    // If a frame is still too tall for the board, shrink its type until it fits.
    fitFrame() {
      const fr = this.$frame, inner = fr.firstChild;
      if (!inner) return;
      inner.style.fontSize = '';
      for (let k = 0; k < 3 && fr.scrollHeight > fr.clientHeight + 1; k++) {
        const cur = parseFloat(inner.style.fontSize) || 1;
        inner.style.fontSize = Math.max(0.62, cur * (fr.clientHeight / fr.scrollHeight) * 0.98) + 'em';
      }
    }

    build() {
      const v = this.v;
      this.el.classList.add('player');
      this.el.tabIndex = 0;
      this.el.setAttribute('aria-label', 'Lesson video: ' + strip(v.title));
      this.el.innerHTML =
        '<div class="stage idle"><div class="board"><div class="frame"></div></div>' +
        '<div class="caption" aria-live="polite"></div>' +
        '<button class="bigplay" aria-label="Play">' + ICON.play + '<span>Play · ' + videoLength(v) + '</span></button>' +
        '<div class="endcard" hidden><div class="endcard-in"><div class="endcard-t">Example complete</div>' +
        '<div class="endcard-b"><button class="btn replay">' + ICON.replay + ' Replay</button>' +
        (this.opts.onPractice ? '<button class="btn ghost-light topractice">Try the practice problems</button>' : '') + '</div></div></div></div>' +
        '<div class="pctl">' +
        '<button class="pbtn play" aria-label="Play">' + ICON.play + '</button>' +
        '<button class="pbtn prev" aria-label="Previous step">' + ICON.prev + '</button>' +
        '<button class="pbtn next" aria-label="Next step">' + ICON.next + '</button>' +
        '<div class="pseg">' + v.steps.map((s, i) => '<button class="seg" data-i="' + i + '" aria-label="Step ' + (i + 1) + '"><span class="fill"></span></button>').join('') + '</div>' +
        '<span class="pcount m"></span>' +
        '<button class="pbtn speed m" aria-label="Playback speed">' + this.speed + '×</button>' +
        (synth ? '<button class="pbtn voice" aria-label="Narration" aria-pressed="' + this.voice + '">' + ICON.voice + '</button>' : '') +
        '<button class="pbtn cc m" aria-label="Captions" aria-pressed="' + this.cc + '">CC</button>' +
        '<button class="pbtn fs" aria-label="Full screen">' + ICON.fs + '</button>' +
        '</div>';
      const q = (s) => this.el.querySelector(s);
      this.$stage = q('.stage');
      this.$frame = q('.frame');
      this.$cap = q('.caption');
      this.$play = q('.pctl .play');
      this.$count = q('.pcount');
      this.$segs = Array.from(this.el.querySelectorAll('.seg'));
      this.$end = q('.endcard');
      this.$stage.classList.toggle('nocc', !this.cc);

      q('.bigplay').addEventListener('click', () => this.play());
      this.$play.addEventListener('click', () => this.toggle());
      q('.prev').addEventListener('click', () => this.go(this.i - 1));
      q('.next').addEventListener('click', () => this.go(this.i + 1));
      this.$segs.forEach((b) => b.addEventListener('click', () => this.go(+b.dataset.i)));
      q('.speed').addEventListener('click', (e) => {
        this.speed = SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length];
        e.currentTarget.textContent = this.speed + '×';
        Book.progress.setMisc('speed', this.speed);
        if (this.playing) this.run();
      });
      const vb = q('.voice');
      if (vb) vb.addEventListener('click', () => {
        this.voice = !this.voice;
        vb.setAttribute('aria-pressed', this.voice);
        Book.progress.setMisc('voice', this.voice);
        if (!this.voice && synth) synth.cancel();
        if (this.playing) this.run();
      });
      q('.cc').addEventListener('click', (e) => {
        this.cc = !this.cc;
        e.currentTarget.setAttribute('aria-pressed', this.cc);
        this.$stage.classList.toggle('nocc', !this.cc);
        Book.progress.setMisc('cc', this.cc);
        this.fit();
        this.fitFrame();
      });
      q('.fs').addEventListener('click', () => {
        try {
          if (document.fullscreenElement) document.exitFullscreen();
          else if (this.el.requestFullscreen) this.el.requestFullscreen().catch(() => {});
        } catch (e) { /* full screen unavailable here */ }
      });
      q('.replay').addEventListener('click', () => { this.go(0); this.play(); });
      const tp = q('.topractice');
      if (tp) tp.addEventListener('click', () => this.opts.onPractice());
      this.el.addEventListener('keydown', (e) => {
        if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
        if (e.key === ' ' || e.key === 'k') { e.preventDefault(); this.toggle(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); this.go(this.i + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(this.i - 1); }
      });
    }

    show(i, animate) {
      const prevFrame = animate && this.shownFrame ? this.shownFrame : null;
      const f = this.frames[i];
      if (f !== this.shownFrame) {
        const sameKind = prevFrame && prevFrame.k === f.k;
        this.$frame.innerHTML = '<div class="frame-in ' + (animate ? (sameKind ? 'morph' : 'enter') : '') + ' k-' + f.k + '">' + render(f, sameKind ? prevFrame : null) + '</div>';
        if (animate) countUp(this.$frame);
        this.shownFrame = f;
        this.fitFrame();
      }
      this.$cap.innerHTML = '<span>' + this.v.steps[i].say + '</span>';
      this.$count.textContent = (i + 1) + ' / ' + this.v.steps.length;
      this.$segs.forEach((s, j) => {
        s.classList.toggle('done', j < i);
        s.classList.toggle('cur', j === i);
        const fill = s.firstChild;
        fill.style.transition = 'none';
        fill.style.width = j < i ? '100%' : '0%';
      });
    }

    run() {
      const tok = ++this.token;
      clearTimeout(this.timer);
      clearTimeout(this.safety);
      if (synth) synth.cancel();
      const step = this.v.steps[this.i];
      const est = stepMs(step) / this.speed;
      const fill = this.$segs[this.i].firstChild;
      fill.style.transition = 'none';
      fill.style.width = '0%';
      void fill.offsetWidth;
      fill.style.transition = 'width ' + est + 'ms linear';
      fill.style.width = '100%';
      const next = () => { if (tok === this.token && this.playing) this.advance(); };
      if (this.voice && synth) {
        const u = new SpeechSynthesisUtterance(step.speak || strip(step.say));
        const voice = pickVoice();
        if (voice) u.voice = voice;
        u.rate = Math.min(2, 1.02 * this.speed);
        u.onend = () => { if (tok === this.token) this.timer = setTimeout(next, 500); };
        u.onerror = () => { if (tok === this.token) this.timer = setTimeout(next, est); };
        this.utt = u;  // keep a reference: some engines drop onend when the utterance is garbage collected
        setTimeout(() => { if (tok === this.token) synth.speak(u); }, 80);
        this.safety = setTimeout(next, est * 2.2 + 4000);
      } else {
        this.timer = setTimeout(next, est);
      }
    }

    advance() {
      if (this.i < this.v.steps.length - 1) {
        this.i++;
        this.show(this.i, true);
        this.run();
      } else {
        this.finish();
      }
    }

    finish() {
      this.pause();
      this.done = true;
      this.$segs.forEach((s) => { s.firstChild.style.transition = 'none'; s.firstChild.style.width = '100%'; });
      this.$end.hidden = false;
      if (this.opts.onComplete) this.opts.onComplete();
    }

    play() {
      live.forEach((p) => { if (p !== this) p.pause(); });
      this.$stage.classList.remove('idle');
      this.$end.hidden = true;
      if (this.done) { this.done = false; this.go(0); }
      this.playing = true;
      this.$play.innerHTML = ICON.pause;
      this.$play.setAttribute('aria-label', 'Pause');
      this.el.classList.add('playing');
      this.run();
    }

    pause() {
      this.playing = false;
      this.token++;
      clearTimeout(this.timer);
      clearTimeout(this.safety);
      if (synth) synth.cancel();
      this.$play.innerHTML = ICON.play;
      this.$play.setAttribute('aria-label', 'Play');
      this.el.classList.remove('playing');
      const fill = this.$segs[this.i] && this.$segs[this.i].firstChild;
      if (fill) { const w = getComputedStyle(fill).width; fill.style.transition = 'none'; fill.style.width = w; }
    }

    toggle() { if (this.playing) this.pause(); else this.play(); }

    go(j) {
      if (j < 0 || j >= this.v.steps.length) return;
      this.$stage.classList.remove('idle');
      this.$end.hidden = true;
      this.i = j;
      this.show(j, true);
      if (j === this.v.steps.length - 1 && !this.playing && this.opts.onComplete) this.opts.onComplete();
      if (this.playing) this.run();
    }

    destroy() { this.pause(); live.delete(this); }
  }

  let resizeT = null;
  const refit = () => { clearTimeout(resizeT); resizeT = setTimeout(() => live.forEach((p) => { p.fit(); p.fitFrame(); }), 120); };
  window.addEventListener('resize', refit);
  document.addEventListener('fullscreenchange', refit);

  Player.stopAll = () => { live.forEach((p) => p.destroy()); };
  Player.duration = videoLength;
  Player.render = render;
  Player.resolveFrames = resolveFrames;
  window.Player = Player;
})();
