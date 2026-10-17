// Draws the world: a cached floor layer, then everything with height sorted by its base row, then overlays.
import * as A from './art.js';
import * as C from './config.js';
import { S } from './state.js';
import { sim, spotsFor, storeInfo, clockHour } from './sim.js';
import { map, GW, GH, idx, FLOOR_CLEAN, FLOOR_DUST, FOUNTAIN_ID } from './map.js';

export const view = {
  W: 0, H: 0, dpr: 1,
  cam: { x: 13, y: 9, s: 56 }, minS: 24, maxS: 120,
  mode: 'day', night: 0,            // night: 0 day … 1 full night tint
  ghost: null, highlight: null, selected: null,
  cache: null, cacheRev: -1, cachePPT: 0, dirty: true,
  poofs: [],
};
const X0 = -1.5, Y0 = -2.2, X1 = C.MAP_W + 1.5, Y1 = GH + 0.6;
let canvas, ctx;

export function initRender(c){ canvas = c; ctx = c.getContext('2d'); resize(); }
export function resize(){
  const r = canvas.getBoundingClientRect();
  view.W = r.width; view.H = r.height;
  view.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(view.W * view.dpr); canvas.height = Math.round(view.H * view.dpr);
  view.minS = Math.max(18, Math.min(view.W / (X1 - X0), view.H / (Y1 - Y0)));
  view.maxS = Math.max(view.minS * 2, Math.min(130, view.H / 4));
  if (!view.cam.init){ view.cam.s = Math.max(view.minS, Math.min(view.maxS, view.W / 15)); view.cam.init = true; }
  clampCam();
}
export function clampCam(){
  const c = view.cam;
  c.s = Math.max(view.minS, Math.min(view.maxS, c.s));
  const hw = view.W / 2 / c.s, hh = view.H / 2 / c.s;
  c.x = (X1 - X0) <= hw * 2 ? (X0 + X1) / 2 : Math.max(X0 + hw, Math.min(X1 - hw, c.x));
  c.y = (Y1 - Y0) <= hh * 2 ? (Y0 + Y1) / 2 : Math.max(Y0 + hh, Math.min(Y1 - hh, c.y));
}
export const screenToWorld = (sx, sy) => ({ x: (sx - view.W / 2) / view.cam.s + view.cam.x, y: (sy - view.H / 2) / view.cam.s + view.cam.y });
export const worldToScreen = (wx, wy) => ({ x: (wx - view.cam.x) * view.cam.s + view.W / 2, y: (wy - view.cam.y) * view.cam.s + view.H / 2 });
export function invalidate(){ view.cacheRev = -1; }
export function poof(x, y, w, h){ view.poofs.push({ x, y, w, h, t: 0 }); }

/* ---------- Cached floor layer ---------- */
function buildCache(){
  const want = view.dpr * view.cam.s;
  const ppt = [32, 48, 64, 88, 112].find(b => b >= want * 0.9) || 112;
  const cw = Math.round((X1 - X0) * ppt), ch = Math.round((Y1 - Y0) * ppt);
  if (!view.cache || view.cache.width !== cw || view.cache.height !== ch){ view.cache = document.createElement('canvas'); view.cache.width = cw; view.cache.height = ch; }
  const c = view.cache.getContext('2d');
  A.setTarget(c, ppt);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#2d2236'; c.fillRect(0, 0, cw, ch);
  c.setTransform(ppt, 0, 0, ppt, -X0 * ppt, -Y0 * ppt);
  const s = S.save;
  // Outside: sidewalk and parking lot.
  A.floor('sidewalk', X0, C.MAP_H, X1 - X0, 1, 3);
  A.floor('asphalt', X0, C.MAP_H + 1, X1 - X0, Y1 - C.MAP_H - 1, 4);
  // Inside floors, row runs at a time.
  for (let y = 0; y < C.MAP_H; y++){
    let x = 0;
    while (x < C.MAP_W){
      const f = map.floor[idx(x, y)];
      let x2 = x; while (x2 < C.MAP_W && map.floor[idx(x2, y)] === f) x2++;
      A.floor(f === FLOOR_DUST ? 'dust' : 'concourse', x, y, x2 - x, 1, 11 + y * 31 + x);
      x = x2;
    }
  }
  // Ring of teal tiles around the fountain.
  c.save(); A.circ(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1, 1.3); c.strokeStyle = 'rgba(92,200,191,.55)'; c.lineWidth = 0.14; c.stroke(); c.restore();
  // Store interiors.
  for (const u of s.units){
    if (u.kiosk) continue;
    const kind = u.state === 'derelict' ? 'dust' : u.state === 'vacant' ? 'plain' : (C.STORES[u.store].floor || 'plain');
    A.floor(kind, u.x, u.y, u.w, u.h, u.id * 17);
    if (u.state === 'store' && !u.kiosk){
      const f = spotsFor(u).front;
      A.rr(f.x - 0.4, u.face === 'down' ? u.y + u.h + 0.02 : u.y - 0.3, 0.8, 0.28, 0.06); A.fs(C.STORES[u.store].trim, 0.03);
    }
  }
  // Clutter and gloom in the storage areas.
  for (let y = 0; y < C.MAP_H; y++) for (let x = 0; x < C.MAP_W; x++){
    if (map.floor[idx(x, y)] !== FLOOR_DUST || map.occ[idx(x, y)]) continue;
    if (((x * 7 + y * 13) % 5) === 0) A.storageJunk(x, y, x * 101 + y);
  }
  for (let y = 0; y < C.MAP_H; y++) for (let x = 0; x < C.MAP_W; x++){
    const i = idx(x, y);
    if (map.floor[i] === FLOOR_DUST && !map.occ[i]){ c.fillStyle = 'rgba(30,22,48,.42)'; c.fillRect(x - 0.002, y - 0.002, 1.004, 1.004); }
    if (map.occ[i] > 0){ const u = s.units.find(v => v.id === map.occ[i]); if (u && u.state === 'derelict'){ c.fillStyle = 'rgba(30,22,48,.28)'; c.fillRect(x - 0.002, y - 0.002, 1.004, 1.004); } }
  }
  A.mallBackWall(C.MAP_W);
  view.cacheRev = map.rev; view.cachePPT = ppt;
}

/* ---------- Frame ---------- */
export function render(t){
  const s = S.save; if (!s) return;
  const { dpr, cam } = view;
  const want = dpr * cam.s;
  if (view.cacheRev !== map.rev || !view.cache || (view.cachePPT < 112 && want > view.cachePPT * 1.25) || want < view.cachePPT * 0.45) buildCache();
  const ppt = dpr * cam.s;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2d2236'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ox = (view.W / 2 - cam.x * cam.s) * dpr, oy = (view.H / 2 - cam.y * cam.s) * dpr;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(view.cache, ox + X0 * ppt, oy + Y0 * ppt, (X1 - X0) * ppt, (Y1 - Y0) * ppt);
  ctx.setTransform(ppt, 0, 0, ppt, ox, oy);
  A.setTarget(ctx, ppt);

  // Floor-level things.
  for (const tr of sim.trash) A.trash(tr.x, tr.y, tr.kind, tr.t);
  drawBinRange();
  drawJobRings(t);

  const Q = [];
  const add = (y, f) => Q.push([y, f]);
  for (const u of s.units){
    const def = u.store ? C.STORES[u.store] : null;
    if (u.kiosk){ add(u.y + 0.85, () => A.kiosk(u, def, t)); continue; }
    if (u.face === 'down'){
      add(u.y + 0.48, () => A.unitBack(u, def, t));
      if (u.state === 'store'){ const cb = A.storeSpots(u).counter; add(cb[1] + cb[3], () => A.storeFurniture(u, def, t, 'counter')); add(u.y + u.h * 0.72, () => A.storeFurniture(u, def, t, 'mid')); }
      add(u.y + u.h + 0.05, () => A.unitFront(u, def, t));
    } else {
      add(u.y + u.h, () => A.unitBack(u, def, t));
      if (u.state === 'store'){ const cb = A.storeSpots(u).counter; add(cb[1] + cb[3], () => A.storeFurniture(u, def, t, 'counter')); add(u.y + u.h * 0.45, () => A.storeFurniture(u, def, t, 'mid')); }
      add(u.y + 0.05, () => A.unitFront(u, def, t));
    }
  }
  for (const d of s.decor){
    if (d.type === 'plant') add(d.y + 0.85, () => A.palm(d.x + 0.5, d.y + 0.85));
    else if (d.type === 'bin') add(d.y + 0.8, () => A.trashCan(d.x + 0.5, d.y + 0.8));
    else if (d.type === 'bench') add(d.y + 0.6, () => A.bench(d.x + 0.1, d.y + 0.15, 1.8));
  }
  add(C.FOUNTAIN.y + 1.0, () => A.fountain(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1.05, t, s.fountain));
  add(C.MAP_H, () => { A.sideWall(0, 0, C.MAP_H); A.sideWall(C.MAP_W, 0, C.MAP_H); });
  add(C.MAP_H + 0.1, () => {
    A.frontWall(-0.12, C.ENTRANCE.x - 0.1, C.MAP_H); A.frontWall(C.ENTRANCE.x + C.ENTRANCE.w + 0.1, C.MAP_W + 0.12, C.MAP_H);
    const near = sim.people.some(p => Math.abs(p.y - C.MAP_H) < 1.2 && Math.abs(p.x - (C.ENTRANCE.x + 1)) < 1.6);
    view.doorOpen = Math.max(0, Math.min(1, (view.doorOpen || 0) + (near ? 0.12 : -0.06)));
    A.entranceDoors(C.ENTRANCE.x, C.MAP_H, C.ENTRANCE.w, view.doorOpen);
  });
  add(-0.5, () => { if (!s.zones.nw) A.pigeon(9.4, 1.6, t); if (!s.zones.ne) A.pigeon(24.2, 2.4, t + 1.7); });
  for (const p of sim.people) add(p.y, () => drawPerson(p, t));
  Q.sort((a, b) => a[0] - b[0]);
  for (const [, f] of Q) f();

  A.text(s.player.mall, C.ENTRANCE.x + 1, C.MAP_H + 0.62, 0.3, 'rgba(255,255,255,.85)', 700, 'Fredoka', 6);
  drawLighting(t);
  drawGhost(t);
  drawOverlays(t);
}

function drawPerson(p, t){
  const L = p.look;
  const o = { ...L, t: p.t, walk: p.walking, flip: p.flip };
  if (p.kind === 'customer'){
    if (p.state === 'queue' && p.patience / p.patienceMax < 0.3) o.mood = 'wait';
    else if (p.mood > 0.8) o.mood = 'happy';
    if (p.type === 'teen' && L.hood) o.hood = false;
    if (L.kid) return A.family(p.x, p.y, o);
  }
  if (p.kind === 'gus') o.mood = 'happy';
  if ((p.kind === 'owner' || p.kind === 'staff') && p.broomT > 0) o.broom = p.t * 18;
  A.person(p.x, p.y, o);
}

// Show how far a trash can reaches while placing or selecting one.
function drawBinRange(){
  const bins = [];
  if (view.ghost && view.ghost.bin) bins.push({ x: view.ghost.x, y: view.ghost.y });
  const sel = view.selected;
  if (sel && sel.bin) bins.push({ x: sel.x, y: sel.y });
  for (const b of bins){
    A.circ(b.x + 0.5, b.y + 0.5, C.BIN_RADIUS);
    ctx.fillStyle = 'rgba(92,184,138,.12)'; ctx.fill();
    ctx.setLineDash([0.2, 0.14]); ctx.strokeStyle = 'rgba(47,158,106,.8)'; ctx.lineWidth = 0.05; ctx.stroke(); ctx.setLineDash([]);
  }
}
function drawJobRings(t){
  sim.jobs.forEach((j, i) => {
    const pt = jobPoint(j); if (!pt) return;
    A.ell(pt.x, pt.y, 0.38 + Math.sin(t * 5) * 0.03, 0.17); A.fs(null, 0.05, '#ffd23f');
  });
}
export function jobPoint(j){
  if (j.type === 'clean'){ const tr = sim.trash.find(x => x.id === j.trashId); return tr ? { x: tr.x, y: tr.y } : null; }
  if (j.type === 'register'){ const u = S.save.units.find(v => v.id === j.unitId); if (!u) return null; const sp = spotsFor(u).staff; return { x: sp.x, y: sp.y }; }
  if (j.type === 'wish') return { x: C.FOUNTAIN.x + 1, y: C.FOUNTAIN.y + 2.2 };
  return null;
}

function drawLighting(t){
  const h = sim.phase === 'idle' ? 21 : clockHour();
  let tint = null, a = 0;
  if (view.mode === 'night'){ tint = '20,16,60'; a = 0.42; }
  else if (h > 18.5){ const k = Math.min(1, (h - 18.5) / 2.5); tint = `${Math.round(lerp(255, 60, k))},${Math.round(lerp(140, 40, k))},${Math.round(lerp(60, 110, k))}`; a = 0.1 + 0.18 * k; }
  if (!tint) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(${tint},${a})`; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  if (view.mode === 'night'){
    // Warm light spilling from open stores.
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const u of S.save.units){
      if (u.state !== 'store') continue;
      const cx = u.x + u.w / 2, cy = u.y + u.h / 2;
      const gr = ctx.createRadialGradient(cx, cy, 0.2, cx, cy, Math.max(u.w, u.h) * 0.9);
      gr.addColorStop(0, 'rgba(255,214,150,.22)'); gr.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = gr; ctx.fillRect(cx - 3, cy - 3, 6, 6);
    }
    ctx.restore();
  }
}
const lerp = (a, b, k) => a + (b - a) * k;

function drawGhost(t){
  const gh = view.ghost; if (!gh) return;
  const ok = gh.ok;
  ctx.save();
  ctx.globalAlpha = 0.55;
  if (gh.preview) gh.preview(t);
  ctx.globalAlpha = 1;
  ctx.fillStyle = ok ? 'rgba(76,195,138,.32)' : 'rgba(239,71,111,.32)';
  ctx.fillRect(gh.x, gh.y, gh.w, gh.h);
  ctx.strokeStyle = ok ? '#2f9e6a' : '#d62839'; ctx.lineWidth = 0.06; ctx.setLineDash([0.15, 0.1]);
  ctx.strokeRect(gh.x + 0.03, gh.y + 0.03, gh.w - 0.06, gh.h - 0.06); ctx.setLineDash([]);
  if (gh.access){
    const a = gh.access, cx = a.x + 0.5, cy = a.y + 0.5, dir = gh.face === 'up' ? -1 : 1;
    ctx.fillStyle = ok ? '#2f9e6a' : '#d62839';
    ctx.beginPath(); ctx.moveTo(cx - 0.22, cy - dir * 0.12); ctx.lineTo(cx + 0.22, cy - dir * 0.12); ctx.lineTo(cx, cy + dir * 0.18); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawOverlays(t){
  const s = S.save;
  // Bubbles over customers
  for (const p of sim.people){
    if (p.kind === 'customer' && p.bubble){
      const b = p.bubble, y = p.y - (C.CUSTOMERS[p.type] && p.look.kid ? 1.6 : 1.55);
      const pulse = b.kind === 'want' && p.patience / p.patienceMax < 0.3 ? Math.abs(Math.sin(t * 8)) : 0;
      A.bubble(p.x, y, b.icon, b.kind === 'info' ? 'info' : b.kind, b.kind === 'want' ? p.patience / p.patienceMax : 1, pulse);
    }
    if (p.kind === 'gus' && p.chatIcon){ A.bubble(p.x, p.y - 1.55, 'chat', 'info'); }
    if (p.kind === 'gus' && p.say){ speech(p.x, p.y - 1.6, p.say); }
    if ((p.kind === 'owner' || p.kind === 'staff') && p.serving > 0){
      A.ell(p.x, p.y - 1.42, 0.24, 0.07); A.fs('rgba(255,255,255,.9)', 0.03);
      A.rr(p.x - 0.22, p.y - 1.47, 0.44 * Math.min(1, p.serving), 0.1, 0.05); A.fs('#4cc38a', 0);
    }
  }
  if (sim.wishCoin && view.mode === 'day'){
    const bob = Math.sin(t * 3) * 0.06;
    A.storeIcon('coin', C.FOUNTAIN.x + 1, C.FOUNTAIN.y - 0.5 + bob, 0.45);
  }
  // Numbered pins on queued jobs
  sim.jobs.forEach((j, i) => {
    const pt = jobPoint(j); if (!pt) return;
    const y = pt.y - (j.type === 'register' ? 1.75 : 0.6);
    A.circ(pt.x, y, 0.2); A.fs('#ffd23f', 0.04);
    A.text(String(i + 1), pt.x, y + 0.01, 0.24, A.OUT, 700);
  });
  for (const f of sim.fx){
    const k = f.t / f.life;
    if (f.kind === 'coin'){ ctx.save(); ctx.globalAlpha = 1 - k * k; A.text(f.text, f.x, f.y - k * 0.6, 0.3, '#2f9e6a', 700); ctx.restore(); }
    else if (f.kind === 'heart'){ ctx.save(); ctx.globalAlpha = 1 - k; A.heartPath(f.x, f.y - k * 0.7, 0.26); A.fs('#ef476f', 0.04); ctx.restore(); }
    else if (f.kind === 'storm') A.stormCloud(f.x, f.y - k * 0.2, 1 - k * k);
    else if (f.kind === 'toss'){
      // Litter arcing into a trash can, then a little sparkle.
      const x = f.x + (f.tx - f.x) * k, y = f.y + (f.ty - f.y) * k - Math.sin(k * Math.PI) * 0.9;
      if (k < 0.85) A.trash(x, y, f.trash, 1, 0.55);
      else A.sparkle(f.tx, f.ty - 0.5, 0.5, 1 - (k - 0.85) / 0.15);
    }
    else if (f.kind === 'sparkle'){ for (let i = 0; i < 4; i++){ const a = i * 1.57 + k * 2; A.sparkle(f.x + Math.cos(a) * k * 0.5, f.y + Math.sin(a) * k * 0.35, 0.6 * (1 - k) + 0.2, 1 - k); } }
  }
  // Restoration poofs
  view.poofs = view.poofs.filter(p => (p.t += 1 / 60) < 1.2);
  for (const p of view.poofs){
    const k = p.t / 1.2;
    ctx.save(); ctx.globalAlpha = 1 - k;
    ctx.fillStyle = '#fff6e6';
    for (let i = 0; i < 10; i++){
      const a = i / 10 * Math.PI * 2, r = 0.3 + k * 0.9;
      A.circ(p.x + p.w / 2 + Math.cos(a) * r * p.w / 2, p.y + p.h / 2 + Math.sin(a) * r * p.h / 2, 0.35 * (1 - k * 0.5)); ctx.fill();
    }
    for (let i = 0; i < 6; i++) A.sparkle(p.x + ((i * 37) % 10) / 10 * p.w, p.y + ((i * 53) % 10) / 10 * p.h - k, 0.7, 1 - k);
    ctx.restore();
  }
  // Tutorial highlight
  const hl = view.highlight;
  if (hl){
    const r = 0.5 + Math.abs(Math.sin(t * 4)) * 0.12;
    ctx.save(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 0.09; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 0.3 * view.dpr * view.cam.s;
    if (hl.w){ A.rr(hl.x - 0.15, hl.y - 0.15, hl.w + 0.3, hl.h + 0.3, 0.2); ctx.stroke(); }
    else { A.circ(hl.x, hl.y, r); ctx.stroke(); }
    ctx.restore();
  }
  // Selection outline at night
  const sel = view.selected;
  if (sel){ ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.06; ctx.setLineDash([0.18, 0.12]); ctx.strokeRect(sel.x - 0.05, sel.y - 0.05, sel.w + 0.1, sel.h + 0.1); ctx.restore(); }
}
function speech(x, y, txt){
  ctx.save();
  ctx.font = `600 ${0.24 * view.dpr * view.cam.s}px Nunito, sans-serif`;
  const w = Math.min(4.2, ctx.measureText(txt).width / (view.dpr * view.cam.s) + 0.4);
  ctx.restore();
  A.rr(x - w / 2, y - 0.5, w, 0.46, 0.14); A.fs('#fffaf3', 0.04);
  ctx.beginPath(); ctx.moveTo(x - 0.08, y - 0.05); ctx.lineTo(x, y + 0.1); ctx.lineTo(x + 0.08, y - 0.05); A.fs('#fffaf3', 0);
  A.text(txt, x, y - 0.27, 0.22, A.OUT, 600, 'Nunito', w - 0.3);
}
