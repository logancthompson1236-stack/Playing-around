// DOM overlay: HUD, panels, dialogs, tips, toasts and full-screen screens. Game rules live elsewhere.
import * as A from './art.js';
import * as C from './config.js';
import { S, levelProgress } from './state.js';
import { sim, clockText, GUS_LOOK } from './sim.js';
import { sfx } from './audio.js';
import { INTRO, LETTER, TIPS } from './story.js';

const root = document.getElementById('ui');

export function h(tag, props = {}, ...kids){
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})){
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const ICON = {
  pause: svg('<path d="M9 5v14M15 5v14"/>'),
  fast: svg('<path d="M4 6l7 6-7 6zM12 6l7 6-7 6z" fill="currentColor"/>'),
  play: svg('<path d="M7 5l12 7-12 7z" fill="currentColor"/>'),
  hammer: svg('<path d="M14 4l6 6-3 3-6-6zM12 8l-8 8 3 3 8-8"/>'),
  people: svg('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 20c0-2 1-4.5 3.5-4.5S22 18 22 20"/>'),
  book: svg('<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  flip: svg('<path d="M4 9h13l-3-3M20 15H7l3 3"/>'),
  check: svg('<path d="M5 12l5 5 9-10"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
};

/* ---------- Canvas thumbnails ---------- */
const DPR = () => Math.min(window.devicePixelRatio || 1, 3);
export function portrait(look, size = 76, full = false){
  const c = document.createElement('canvas'), d = DPR();
  c.width = c.height = Math.round(size * d);
  const x = c.getContext('2d');
  const span = full ? 1.5 : 0.95, ppt = c.width / span;
  A.setTarget(x, ppt);
  x.setTransform(ppt, 0, 0, ppt, c.width / 2, full ? c.height * 0.93 : c.height * 1.12);
  A.person(0, full ? 0 : 0.18, { ...look, t: 0 });
  return c;
}
export function iconCanvas(paint, size = 44){
  const c = document.createElement('canvas'), d = DPR();
  c.width = c.height = Math.round(size * d);
  const x = c.getContext('2d'), ppt = c.width;
  A.setTarget(x, ppt); x.setTransform(ppt, 0, 0, ppt, 0, 0);
  paint();
  return c;
}

/* ---------- HUD ---------- */
export const hud = {};
let shownMoney = null;
export function buildHud(on){
  const roundBtn = (icon, fn, label) => h('button', { class: 'round', 'aria-label': label, html: icon, onclick: () => { sfx('tap'); fn(); } });
  const tool = (label, icon, fn) => { const b = h('button', { class: 'tool', onclick: () => { sfx('tap'); fn(); } }); b.innerHTML = icon; b.append(h('span', {}, label)); return b; };
  hud.top = h('div', { class: 'hud-top' },
    hud.clock = h('div', { class: 'chip clock' }, h('div', { class: 'row' }, hud.day = h('span', { class: 'day' }), hud.time = h('span')), h('div', { class: 'bar' }, hud.dayBar = h('i'))),
    hud.money = h('div', { class: 'chip money' }),
    h('div', { class: 'chip lvl' }, hud.stars = h('span', { class: 'stars' }), hud.ring = h('span', { class: 'ring' }, hud.lvl = h('b'))),
  );
  hud.dayCtl = h('div', { class: 'day-ctl' }, hud.speed = roundBtn(ICON.fast, on.speed, 'Speed up'), roundBtn(ICON.pause, on.pause, 'Pause'));
  hud.tools = {};
  hud.night = h('div', { class: 'night-bar' },
    hud.tools.build = tool('Build', ICON.hammer, on.build),
    hud.tools.staff = tool('Staff', ICON.people, on.staff),
    hud.tools.notebook = tool('Notebook', ICON.book, on.notebook),
    tool('Settings', ICON.gear, on.settings),
    h('div', { class: 'spacer' }),
    hud.open = h('button', { class: 'btn go open-doors', onclick: () => { sfx('tap'); on.open(); } }, 'Open Doors'),
  );
  root.append(hud.top, hud.dayCtl, hud.night);
  setHudMode('none');
}
export function setHudMode(mode){
  hud.top.hidden = mode === 'none';
  hud.dayCtl.hidden = mode !== 'day';
  hud.night.hidden = mode !== 'night';
}
export function setToolDot(name, on){
  const b = hud.tools[name]; if (!b) return;
  let dot = b.querySelector('.dot');
  if (on && !dot) b.prepend(h('i', { class: 'dot' })); else if (!on && dot) dot.remove();
}
export function starsHtml(v){
  const n = Math.max(1, Math.min(5, Math.round(v)));
  return '★'.repeat(n) + `<span class="off">${'★'.repeat(5 - n)}</span>`;
}
export function updateHud(night){
  const s = S.save; if (!s) return;
  hud.day.textContent = `Day ${s.day}`;
  hud.time.textContent = night ? 'Night' : clockText();
  hud.dayBar.style.width = `${night ? 100 : Math.min(100, sim.t / C.DAY_SECONDS * 100)}%`;
  if (shownMoney === null) shownMoney = s.money;
  if (shownMoney !== s.money){
    const diff = s.money - shownMoney;
    shownMoney += Math.abs(diff) < 2 ? diff : diff * 0.25;
    if (Math.abs(s.money - shownMoney) < 0.5) shownMoney = s.money;
    if (diff > 0 && !hud.money.classList.contains('up')){ hud.money.classList.add('up'); setTimeout(() => hud.money.classList.remove('up'), 300); }
  }
  const m = Math.round(shownMoney);
  hud.money.textContent = `${m < 0 ? '-' : ''}$${Math.abs(m).toLocaleString()}`;
  hud.money.classList.toggle('neg', m < 0);
  hud.stars.innerHTML = starsHtml(s.ratingHist.length ? s.rating : 1);
  hud.lvl.textContent = s.level;
  hud.ring.style.setProperty('--p', levelProgress());
  hud.speed.classList.toggle('speed-on', sim.speed > 1);
  hud.speed.hidden = !s.staff.length;
}
export function resetMoneyDisplay(){ shownMoney = null; }

/* ---------- Toasts ---------- */
let toastEl = null, toastTimer = 0;
export function toast(text, ms = 2200){
  if (toastEl) toastEl.remove();
  toastEl = h('div', { class: 'toast', role: 'status' }, text);
  root.append(toastEl);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { if (toastEl){ toastEl.remove(); toastEl = null; } }, ms);
}

/* ---------- Gus dialog ---------- */
export let dialogOpen = false;
export function say(lines, { who = 'Gus', look = GUS_LOOK } = {}){
  return new Promise(resolve => {
    dialogOpen = true;
    let i = 0, typing = null, full = '';
    const line = h('p', { class: 'line' });
    const more = h('div', { class: 'more' });
    const face = h('div', { class: 'face' }, portrait(look, 76));
    const el = h('div', { class: 'dialog', role: 'dialog', 'aria-label': `${who} says` }, face, h('div', { class: 'box' }, h('div', { class: 'who' }, who), line, more));
    const show = () => {
      full = lines[i]; line.textContent = ''; let k = 0;
      more.textContent = i < lines.length - 1 ? 'Tap to continue' : 'Tap to close';
      clearInterval(typing);
      typing = setInterval(() => { k += 2; line.textContent = full.slice(0, k); if (k >= full.length){ clearInterval(typing); typing = null; } }, 22);
    };
    el.addEventListener('pointerup', e => {
      e.stopPropagation();
      if (typing){ clearInterval(typing); typing = null; line.textContent = full; return; }
      sfx('tap');
      i++;
      if (i >= lines.length){ el.remove(); dialogOpen = false; resolve(); return; }
      show();
    });
    root.append(el); show();
  });
}
// A short line that doesn't block play (used during Day 1 while the player acts).
let hintEl = null;
export function hint(text, top = false){
  clearHint();
  if (!text) return;
  hintEl = h('div', { class: `dialog${top ? ' top' : ''}`, style: 'pointer-events:none' }, h('div', { class: 'face' }, portrait(GUS_LOOK, 76)), h('div', { class: 'box' }, h('div', { class: 'who' }, 'Gus'), h('p', { class: 'line' }, text)));
  root.append(hintEl);
}
export function clearHint(){ if (hintEl){ hintEl.remove(); hintEl = null; } }

/* ---------- Notebook tips ---------- */
let tipEl = null;
export function showTip(key, onShowMe){
  const tip = TIPS[key]; if (!tip) return Promise.resolve();
  return new Promise(resolve => {
    if (tipEl) tipEl.remove();
    sfx('chime');
    const close = () => { if (tipEl === el){ el.remove(); tipEl = null; } resolve(); };
    const el = h('div', { class: 'tip', role: 'note', onclick: close },
      h('div', { class: 't', html: `${ICON.book.replace('<svg', '<svg width="16" height="16"')} ${tip.title}` }),
      h('p', {}, tip.text),
      h('div', { class: 'row' },
        onShowMe ? h('button', { class: 'btn small', onclick: e => { e.stopPropagation(); onShowMe(); close(); } }, 'Show me') : null,
        h('button', { class: 'btn small primary', onclick: e => { e.stopPropagation(); close(); } }, 'Got it')),
    );
    tipEl = el; root.append(el);
    setTimeout(close, 16000);
  });
}
export const tipVisible = () => !!tipEl;

/* ---------- Side panel ---------- */
let panelEl = null;
export function openPanel({ title, tabs = null, tab = 0, render, onClose }){
  closePanel();
  const body = h('div', { class: 'body' });
  let current = tab;
  const tabBar = tabs ? h('div', { class: 'tabs', role: 'tablist' }, tabs.map((t, i) => h('button', { role: 'tab', 'aria-selected': i === current ? 'true' : 'false', onclick: () => { current = i; [...tabBar.children].forEach((b, j) => b.setAttribute('aria-selected', j === i)); draw(); } }, t))) : null;
  const draw = () => { body.replaceChildren(); render(body, current, draw); };
  panelEl = h('div', { class: 'panel', role: 'dialog', 'aria-label': title },
    h('header', {}, h('h2', {}, title), h('button', { class: 'x', 'aria-label': 'Close', onclick: () => { sfx('tap'); closePanel(); onClose && onClose(); } }, '✕')),
    tabBar, body);
  panelEl.addEventListener('pointerdown', e => e.stopPropagation());
  root.append(panelEl); draw();
  return { redraw: draw };
}
export function closePanel(){ if (panelEl){ panelEl.remove(); panelEl = null; } }
export const panelOpen = () => !!panelEl;

/* ---------- Context card ---------- */
let cardEl = null;
export function showCard({ title, text, warn, actions = [], extra }){
  hideCard();
  cardEl = h('div', { class: 'card', role: 'dialog', 'aria-label': title },
    h('div', { class: 'top' }, h('h3', {}, title), h('button', { class: 'x', 'aria-label': 'Close', onclick: () => { sfx('tap'); hideCard(); } }, '✕')),
    text ? h('p', {}, text) : null,
    warn ? h('p', { class: 'warn' }, warn) : null,
    extra || null,
    actions.length ? h('div', { class: 'actions' }, actions.map(a => h('button', { class: `btn small ${a.primary ? 'primary' : ''} ${a.go ? 'go' : ''}`, disabled: a.disabled, onclick: () => { sfx('tap'); a.onClick(); } }, a.label))) : null,
  );
  root.append(cardEl);
}
export function hideCard(){ if (cardEl){ cardEl.remove(); cardEl = null; } }
export const cardOpen = () => !!cardEl;

/* ---------- Placement bar ---------- */
let placeEls = null;
export function showPlacementBar({ label, canFlip, onFlip, onCancel, onConfirm, confirmLabel = 'Place', extra }){
  hidePlacementBar();
  const info = h('div', { class: 'chip place-hint' }, label);
  const confirm = h('button', { class: 'btn go' }, confirmLabel);
  confirm.addEventListener('click', () => { onConfirm(); });
  const bar = h('div', { class: 'card', style: 'width:auto;flex-direction:row;align-items:center;gap:8px' },
    canFlip ? h('button', { class: 'btn small', onclick: () => { sfx('tap'); onFlip(); } }, 'Flip door') : null,
    h('button', { class: 'btn small', onclick: () => { sfx('tap'); onCancel(); } }, 'Cancel'),
    extra ? h('button', { class: 'btn small', onclick: () => { sfx('tap'); extra.onClick(); } }, extra.label) : null,
    confirm);
  placeEls = { info, bar, confirm };
  root.append(info, bar);
  return placeEls;
}
export function hidePlacementBar(){ if (placeEls){ placeEls.info.remove(); placeEls.bar.remove(); placeEls = null; } }

/* ---------- Modals ---------- */
export function modal(content, { onBackdrop } = {}){
  const sheet = h('div', { class: 'sheet' }, content);
  const el = h('div', { class: 'modal' }, sheet);
  el.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === el && onBackdrop) onBackdrop(); });
  root.append(el);
  return { el, close: () => el.remove() };
}
export function confirmBox(text, yes = 'Yes', no = 'Cancel', detail = ''){
  return new Promise(resolve => {
    const m = modal(h('div', {}, h('h2', {}, text), detail ? h('p', { style: 'margin:0;line-height:1.45' }, detail) : null, h('div', { style: 'display:flex;gap:8px;justify-content:flex-end;margin-top:12px' },
      h('button', { class: 'btn', onclick: () => { m.close(); resolve(false); } }, no),
      h('button', { class: 'btn primary', onclick: () => { m.close(); resolve(true); } }, yes))));
  });
}

/* ---------- Title ---------- */
export function showTitle({ hasSave, onContinue, onNew, onSettings }){
  const el = h('div', { class: 'title' },
    h('div', { class: 'logo' }, 'Mall Revival', h('small', {}, 'bring it back to life')),
    h('div', { class: 'buttons' },
      hasSave ? h('button', { class: 'btn primary', onclick: () => { el.remove(); onContinue(); } }, 'Continue') : null,
      h('button', { class: `btn ${hasSave ? '' : 'primary'}`, onclick: async () => { if (hasSave && !(await confirmBox('Start over? Your current mall will be lost.', 'Start over'))) return; el.remove(); onNew(); } }, 'New game'),
      h('button', { class: 'btn', onclick: onSettings }, 'Settings')),
    h('div', { class: 'version' }, `v${C.VERSION}`));
  root.append(el);
  return el;
}

/* ---------- Intro ---------- */
function drawScene(ctx, w, scene, t, mallName){
  const ppt = w / 16;
  A.setTarget(ctx, ppt);
  ctx.setTransform(ppt, 0, 0, ppt, 0, 0);
  const g = ctx;
  if (scene === 'office'){
    g.fillStyle = '#8d8a99'; g.fillRect(0, 0, 16, 9);
    g.fillStyle = '#7a7787'; for (let i = 0; i < 16; i += 2) g.fillRect(i, 0, 1, 9);
    A.rr(9.5, 1, 5, 3.6, 0.1); A.fs('#55607a', 0.08);
    g.save(); A.rr(9.6, 1.1, 4.8, 3.4, 0.08); g.clip();
    g.strokeStyle = 'rgba(200,215,240,.7)'; g.lineWidth = 0.05;
    for (let i = 0; i < 40; i++){ const x = 9.5 + ((i * 0.37 + t * 0.6) % 5.2), y = ((i * 0.53 + t * 5) % 4) + 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 0.12, y + 0.4); g.stroke(); }
    g.restore();
    g.fillStyle = '#6b5b7b'; g.fillRect(11.9, 1, 0.12, 3.6); g.fillRect(9.5, 2.75, 5, 0.1);
    A.box(1, 5.2, 9, 1.4, 0.7, '#a8927a', '#8a745e');
    for (let k = 0; k < 4; k++){ const h = 0.6 + k * 0.35; A.box(1.6 + k * 1.3, 5.4, 1.0, 0.8, h, '#ffffff', '#e6e1d6', 0.7); }
    A.cylinder(7.8, 6.1, 0.3, 0.55, '#e8577e', '#f08aa5', 0.7);
    const buzz = Math.sin(t * 30) * 0.03 * (Math.sin(t * 2) > 0 ? 1 : 0);
    A.rr(8.7 + buzz, 5.35, 0.5, 0.8, 0.08); A.fs('#2b2230', 0.05); A.rr(8.76 + buzz, 5.42, 0.38, 0.6, 0.05); A.fs(Math.sin(t * 2) > 0 ? '#9ff5c0' : '#46566e', 0);
    if (Math.sin(t * 2) > 0){ g.strokeStyle = '#fff'; g.lineWidth = 0.05; g.beginPath(); g.arc(8.95, 5.7, 0.55, -0.8, -0.2); g.moveTo(9.5, 5.2); g.arc(8.95, 5.7, 0.8, -0.8, -0.2); g.stroke(); }
    g.fillStyle = '#5a5566'; g.fillRect(0, 6.6, 16, 2.4);
  } else if (scene === 'bus'){
    const sky = g.createLinearGradient(0, 0, 0, 6); sky.addColorStop(0, '#ff9e7a'); sky.addColorStop(1, '#ffd6a5'); g.fillStyle = sky; g.fillRect(0, 0, 16, 9);
    g.fillStyle = '#9ccf8c'; g.beginPath(); g.moveTo(0, 5); for (let x = 0; x <= 16; x += 0.5) g.lineTo(x, 4.4 + Math.sin(x * 0.6 + 1) * 0.5); g.lineTo(16, 9); g.lineTo(0, 9); g.fill();
    g.fillStyle = '#6a6470'; g.fillRect(0, 6.2, 16, 1.6); g.fillStyle = '#fff'; for (let x = -2; x < 18; x += 2){ const xx = x - (t * 3 % 2); g.fillRect(xx, 6.95, 1, 0.1); }
    for (let i = 0; i < 6; i++){ const x = ((i * 3.3 - t * 2) % 19 + 19) % 19 - 1.5; g.fillStyle = '#7a5a44'; g.fillRect(x, 4.6, 0.18, 1.0); A.circ(x + 0.09, 4.4, 0.55); A.fs('#5bbf6a', 0.05); }
    const bx = 4 + Math.sin(t * 0.7) * 0.3, by = 6.4 + Math.abs(Math.sin(t * 6)) * 0.04;
    A.rr(bx, by - 2.2, 7, 2.2, 0.35); A.fs('#ffd23f', 0.08);
    A.rr(bx, by - 0.75, 7, 0.4, 0.1); A.fs('#3fb8af', 0.05);
    for (let i = 0; i < 5; i++){ A.rr(bx + 0.4 + i * 1.25, by - 1.9, 0.95, 0.75, 0.12); A.fs('#bfe7f7', 0.05); }
    for (const wx of [bx + 1.4, bx + 5.6]){ A.circ(wx, by, 0.45); A.fs('#3d2b35', 0.05); A.circ(wx, by, 0.18); A.fs('#ccc', 0); }
  } else if (scene === 'mall'){
    g.fillStyle = '#1d1430'; g.fillRect(0, 0, 16, 9);
    for (let i = 0; i < 40; i++){ g.fillStyle = `rgba(255,255,255,${0.3 + (i % 3) * 0.2})`; g.fillRect((i * 3.71) % 16, (i * 1.93) % 3.5, 0.05, 0.05); }
    A.box(1.5, 3, 13, 4.2, 3.0, '#5a4a6e', '#4a3c5c');
    g.fillStyle = '#3a3048'; g.fillRect(0, 7.2, 16, 1.8);
    const name = (mallName || 'Sunnyside Mall').toUpperCase(), dead = [3, 7, 9, 12];
    g.save(); g.font = `700 ${0.62 * ppt}px Fredoka, sans-serif`; g.restore();
    const letters = name.split(''); const sw = 0.5, startX = 8 - letters.length * sw / 2;
    letters.forEach((ch, i) => {
      if (ch === ' ') return;
      const on = !dead.includes(i) || (i === 7 && Math.sin(t * 17) * Math.sin(t * 4.3) > 0.7);
      if (on) A.neon(ch, startX + i * sw + sw / 2, 1.0, 0.55, '#ff8fab'); else A.text(ch, startX + i * sw + sw / 2, 1.0, 0.55, '#55465f', 700);
    });
    A.rr(6.3, 4.1, 3.4, 3.1, 0.06); A.fs('#2a2236', 0.08);
    g.fillStyle = 'rgba(185,228,245,.12)'; g.fillRect(6.4, 4.2, 1.6, 3.0); g.fillRect(8.05, 4.2, 1.55, 3.0);
    // Gus sweeps his flashlight back and forth; the beam starts at the lens in his hand.
    const gx = 8.7, gy = 7.1, gs = 1.5, aim = 1.75 + Math.sin(t * 1.1) * 0.75;
    g.save(); g.filter = 'brightness(0.55)'; A.person(gx, gy, { ...GUS_LOOK, t, s: gs, torch: aim }); g.restore();
    const hx = gx + gs * 0.215, hy = gy - gs * 0.32, lx = hx + Math.cos(aim) * gs * 0.24, ly = hy + Math.sin(aim) * gs * 0.24;
    const len = 2.6, ex = lx + Math.cos(aim) * len, ey = ly + Math.sin(aim) * len, px = -Math.sin(aim) * 0.85, py = Math.cos(aim) * 0.85;
    g.save(); g.globalAlpha = 0.5; const beam = g.createLinearGradient(lx, ly, ex, ey); beam.addColorStop(0, 'rgba(255,240,170,.95)'); beam.addColorStop(1, 'rgba(255,240,170,0)');
    g.fillStyle = beam; g.beginPath(); g.moveTo(lx, ly); g.lineTo(ex + px, ey + py); g.lineTo(ex - px, ey - py); g.closePath(); g.fill(); g.restore();
    A.rr(2.5, 4.4, 2.6, 1.8, 0.05); A.fs('#3a3048', 0.06); A.planks(2.5, 5.1, 6.2, 1.8, 3);
    A.rr(10.9, 4.4, 2.6, 1.8, 0.05); A.fs('#3a3048', 0.06); A.forLease(12.2, 5.3, 0.06, 1.2);
  }
}
export function runIntro(mallName){
  return new Promise(resolve => {
    let i = 0, raf = 0, t0 = performance.now();
    const canvas = h('canvas');
    const letter = h('div', { class: 'letter' }, LETTER.map((l, k) => h('p', { class: k === LETTER.length - 1 ? 'sig' : '' }, l)));
    const cap = h('div', { class: 'cap' });
    const nextLbl = h('div', { class: 'tapnext' }, 'Tap to continue');
    const finish = () => { cancelAnimationFrame(raf); el.remove(); resolve(); };
    const el = h('div', { class: 'intro', onclick: () => { sfx('tap'); i++; if (i >= INTRO.length) finish(); else show(); } },
      canvas, letter, cap, nextLbl,
      h('button', { class: 'btn small skip', onclick: e => { e.stopPropagation(); finish(); } }, 'Skip'));
    const show = () => {
      const sc = INTRO[i];
      canvas.hidden = sc.scene === 'letter'; letter.hidden = sc.scene !== 'letter';
      cap.textContent = sc.text; cap.hidden = !sc.text;
    };
    const loop = () => {
      const sc = INTRO[i];
      if (sc && sc.scene !== 'letter'){
        const r = canvas.getBoundingClientRect(), d = DPR();
        const w = Math.round(r.width * d), hh = Math.round(r.height * d);
        if (canvas.width !== w){ canvas.width = w; canvas.height = hh; }
        drawScene(canvas.getContext('2d'), w, sc.scene, (performance.now() - t0) / 1000, mallName);
      }
      raf = requestAnimationFrame(loop);
    };
    root.append(el); show(); loop();
  });
}

/* ---------- Character creation ---------- */
export function runCreate(){
  return new Promise(resolve => {
    const look = { skin: C.LOOKS.skin[1], hair: C.LOOKS.hair[1], hairStyle: 'short', shirt: C.LOOKS.shirt[0], pants: '#4a5a8a' };
    const prev = h('div', { class: 'preview' });
    const redraw = () => prev.replaceChildren(portrait(look, 150, true));
    const name = h('input', { type: 'text', id: 'pname', maxlength: '16', placeholder: 'Your name', value: '' });
    const mall = h('input', { type: 'text', id: 'mname', maxlength: '18', value: 'Sunnyside Mall' });
    const sw = (key, list) => h('div', { class: 'swatches', role: 'group' }, list.map(c => {
      const b = h('button', { style: `background:${c}`, 'aria-label': c, 'aria-pressed': look[key] === c ? 'true' : 'false', onclick: () => { look[key] = c; [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b)); redraw(); sfx('tap'); } });
      return b;
    }));
    const styles = h('div', { class: 'swatches', role: 'group' }, [['short', 'Short'], ['long', 'Long'], ['bun', 'Bun']].map(([v, l]) => {
      const b = h('button', { class: 'txt', 'aria-pressed': look.hairStyle === v ? 'true' : 'false', onclick: () => { look.hairStyle = v; [...styles.children].forEach(x => x.setAttribute('aria-pressed', x === b)); redraw(); sfx('tap'); } }, l);
      return b;
    }));
    const go = h('button', { class: 'btn primary', onclick: () => {
      const n = name.value.trim() || 'Boss', m = mall.value.trim() || 'Sunnyside Mall';
      md.close(); resolve({ name: n, mall: m, look });
    } }, 'Head to the mall');
    const md = modal(h('div', {},
      h('h2', {}, 'Who’s the new owner?'),
      h('div', { class: 'create' }, prev, h('div', {},
        h('div', { class: 'two' }, h('div', {}, h('label', { for: 'pname' }, 'Your name'), name), h('div', {}, h('label', { for: 'mname' }, 'Mall name'), mall)),
        h('label', {}, 'Skin'), sw('skin', C.LOOKS.skin),
        h('div', { class: 'two' }, h('div', {}, h('label', {}, 'Hair'), sw('hair', C.LOOKS.hair)), h('div', {}, h('label', {}, 'Style'), styles)),
        h('label', {}, 'Shirt'), sw('shirt', C.LOOKS.shirt),
        h('div', { style: 'display:flex;justify-content:flex-end;margin-top:12px' }, go)))));
    redraw();
  });
}

/* ---------- Report card ---------- */
const GRADE_COLORS = { S: '#9b5de5', A: '#2f9e6a', B: '#3fb8af', C: '#f4a300', D: '#ef476f' };
export function showReport(r, firstDay){
  return new Promise(resolve => {
    const money = n => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;
    const row = (label, val, cls) => h('tr', { class: cls || '' }, h('td', {}, label), h('td', {}, val));
    const star = (label, v) => h('tr', {}, h('td', {}, label), h('td', { html: `<span class="stars">${starsHtml(v)}</span>` }));
    const prog = levelProgress();
    const left = h('div', {},
      h('table', {},
        row('Visitors', `${r.visitors}${r.visitorsDelta ? ` (${r.visitorsDelta > 0 ? '+' : ''}${r.visitorsDelta})` : ''}`),
        row('Served', `${r.served}${r.walkouts ? ` · ${r.walkouts} walked out` : ''}`),
        row('Sales', money(r.revenue)),
        r.wages ? row('Wages', money(-r.wages)) : null,
        row('Utilities', money(-r.utilities)),
        row('Restocking', money(-r.restock)),
        row('Profit', money(r.profit), 'total')),
      firstDay ? h('p', { class: 'note' }, 'Sales come in during the day. Wages, power and overnight restocking come out at night.') : null,
    );
    const right = h('div', {},
      h('table', {},
        star('Cleanliness', r.ratings.clean), star('Service', r.ratings.service),
        star('Variety', r.ratings.variety), star('Ambience', r.ratings.ambience),
        row('Happy customers', `${Math.round(r.happy * 100)}%`),
        h('tr', {}, h('td', {}, 'Mall rating'), h('td', { html: `<span class="stars">${starsHtml(r.rating)}</span> ${r.rating.toFixed(1)}` }))),
      firstDay ? h('p', { class: 'note' }, 'Your mall rating is the average of your last few days. Higher ratings bring more shoppers.') : null,
    );
    const foot = h('div', { class: 'foot' },
      h('div', { class: 'xp' }, `XP +${r.xpGain}`, h('div', { class: 'bar' }, h('i', { style: `width:${Math.round(prog * 100)}%` })), `Lv ${r.levelAfter}`),
      r.wishes.length ? h('div', {}, h('b', {}, 'Wished for: '), r.wishes.map(w => `${w.n}× ${w.name}`).join(' · ')) : null,
      r.top ? h('div', {}, h('b', {}, 'Top store: '), `${r.top.name} (${money(r.top.amount)})`) : null,
      r.gusTrash ? h('div', { class: 'muted' }, `Gus picked up ${r.gusTrash} piece${r.gusTrash > 1 ? 's' : ''} of trash on his laps.`) : null,
      r.restockShort ? h('div', { class: 'muted' }, 'Money was tight, so some shelves were only partly restocked.') : null,
    );
    const sheet = h('div', { class: 'report' },
      h('h2', {}, h('span', {}, `Day ${r.day} · ${S.save.player.mall}`), h('div', { class: 'grade', style: `background:${GRADE_COLORS[r.grade]}`, 'aria-label': `Grade ${r.grade}` }, r.grade)),
      r.gained.length ? h('div', { class: 'levelup' }, h('div', { class: 'lv-title' }, `★ Level ${r.levelAfter}! Here’s what you unlocked:`), unlockList(r.gained)) : null,
      h('div', { class: 'cols' }, left, right),
      foot,
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: () => { m.close(); resolve(); } }, 'Continue')));
    const m = modal(sheet);
    sfx(r.gained.length ? 'level' : 'chime');
  });
}

/* ---------- Settings ---------- */
export function showSettings({ onRestart, onChange, inGame, onClose }){
  const tog = (key, label) => {
    const b = h('button', { class: 'toggle', 'aria-pressed': S.settings[key] ? 'true' : 'false', 'aria-label': label, onclick: () => { S.settings[key] = !S.settings[key]; b.setAttribute('aria-pressed', S.settings[key]); onChange(); } });
    return h('div', { class: 'row' }, h('span', {}, label), b);
  };
  const m = modal(h('div', { class: 'settings' },
    h('h2', {}, 'Settings'),
    tog('sound', 'Sound effects'), tog('music', 'Music'), tog('tips', 'Notebook tips'),
    h('div', { style: 'display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px' },
      h('span', { class: 'muted' }, `Mall Revival v${C.VERSION}`),
      h('div', { style: 'display:flex;gap:8px' },
        inGame ? h('button', { class: 'btn small danger', onclick: async () => { if (await confirmResetSave()){ m.close(); onRestart(); } } }, 'Reset save') : null,
        h('button', { class: 'btn primary small', onclick: () => { m.close(); onClose && onClose(); } }, 'Done')))), { onBackdrop: () => { m.close(); onClose && onClose(); } });
}

/* ---------- Level ups ---------- */
// One row per unlock, with an icon and where to find it.
export function unlockList(levels){
  const rows = [];
  for (const lv of levels) for (const u of C.LEVEL_UNLOCKS[lv] || []){
    let paint, title, where;
    if (u.store){ const d = C.STORES[u.store]; paint = () => A.storeIcon(d.icon, 0.5, 0.5, 0.62); title = d.name; where = 'New store. Tap Build to open one.'; }
    else if (u.zone){ const z = C.ZONES.find(q => q.id === u.zone); paint = () => A.storeIcon('broom', 0.5, 0.5, 0.62); title = z.name; where = 'More room to build. It clears out when you build a store there.'; }
    else if (u.hire === 'janitor'){ paint = () => A.trashCan(0.5, 0.85); title = 'Hire a janitor'; where = 'Tap Staff at night.'; }
    else if (u.hire === 'clerk'){ paint = () => A.storeIcon('dollar', 0.5, 0.5, 0.6); title = `Hire up to ${C.STAFF_LIMITS.clerk[lv]} clerks`; where = 'They run a register for you. Tap Staff at night.'; }
    else if (u.staffSlots){ paint = () => A.storeIcon('heart', 0.5, 0.5, 0.6); title = 'Room for more staff'; where = `Up to ${C.STAFF_LIMITS.clerk[lv]} clerks and ${C.STAFF_LIMITS.janitor[lv]} janitor${C.STAFF_LIMITS.janitor[lv] > 1 ? 's' : ''}.`; }
    else if (u.done){ paint = () => A.sparkle(0.5, 0.5, 1.3, 1, '#ffd23f'); title = 'Top level for this test version'; where = 'Thanks for playing!'; }
    rows.push(h('div', { class: 'unlock' }, iconCanvas(paint, 36), h('div', {}, h('b', {}, title), h('span', {}, where))));
  }
  return h('div', { class: 'unlocks' }, rows);
}
export function showLevelUp(levels){
  return new Promise(resolve => {
    sfx('level');
    const m = modal(h('div', { class: 'report' },
      h('h2', {}, h('span', {}, `★ Level ${levels[levels.length - 1]}!`)),
      h('p', { style: 'margin:0 0 6px' }, 'Here\u2019s what you unlocked:'),
      unlockList(levels),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: () => { m.close(); resolve(); } }, 'Nice!'))));
  });
}
export function confirmResetSave(){
  return confirmBox('Reset your save?', 'Reset save', 'Keep playing', 'This deletes your mall and every day you\u2019ve played, then starts over from the intro. It can\u2019t be undone.');
}
