// Draws the world: a cached floor layer, then everything with height sorted by its base row, then overlays.
import * as A from './art.js';
import * as A2 from './art2.js';
import * as A4 from './art4.js';
import * as C from './config.js';
import { S } from './state.js';
import { sim, spotsFor, storeInfo, clockHour, roomInfo, tableDealer } from './sim.js';
import { playKid, PIT } from './play.js';
import { map, GW, GH, idx, FLOOR_CLEAN, FLOOR_DUST, FOUNTAIN_ID, decorSize, floorRange, hasUpstairs, topFloor } from './map.js';

export const view = {
  W: 0, H: 0, dpr: 1,
  cam: { x: 13, y: 9, s: 56 }, minS: 24, maxS: 120,
  mode: 'day', night: 0,            // night: 0 day … 1 full night tint
  ghost: null, hideId: 0, highlight: null, selected: null, spots: null,
  cache: null, cacheRev: -1, cachePPT: 0, dirty: true,
  poofs: [], stylePreview: null, styleKey: '',
  floor: 0, cacheFloor: -1,         // which floor is on screen (the other one keeps running, just isn't drawn)
};
// World bounds the camera can see: the floor on screen, plus a little margin.
// Extra room above the back wall so it can be scrolled out from under the top bar.
const Y0 = -3.0, Y1 = GH + 0.6;
const X0 = () => floorRange(view.floor).x0 - 1.5;
const X1 = () => floorRange(view.floor).x1 + 1.5;
// Switch floors, keeping the camera over the same part of the building.
export function setFloor(f){
  f = Math.max(0, Math.min(topFloor(), f));
  if (f === view.floor) return;
  const a = floorRange(view.floor), b = floorRange(f);
  view.cam.x = b.x0 + Math.min(b.x1 - b.x0, Math.max(0, view.cam.x - a.x0));
  view.floor = f; view.cacheRev = -1;
  clampCam();
}
let canvas, ctx;

export function initRender(c){ canvas = c; ctx = c.getContext('2d'); resize(); }
export function resize(){
  const r = canvas.getBoundingClientRect();
  view.W = r.width; view.H = r.height;
  view.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = Math.round(view.W * view.dpr); canvas.height = Math.round(view.H * view.dpr);
  fitZoom();
  view.maxS = Math.max(view.minS * 2, Math.min(130, view.H / 4));
  if (!view.cam.init){ view.cam.s = Math.max(view.minS, Math.min(view.maxS, view.W / 15)); view.cam.init = true; }
  clampCam();
}
function fitZoom(){ view.minS = Math.max(18, Math.min(view.W / (X1() - X0()), view.H / (Y1 - Y0))); }
export function clampCam(){
  fitZoom();
  const c = view.cam;
  c.s = Math.max(view.minS, Math.min(view.maxS, c.s));
  const hw = view.W / 2 / c.s, hh = view.H / 2 / c.s;
  if (view.floor > topFloor()){ view.floor = topFloor(); view.cacheRev = -1; }
  const x0 = X0(), x1 = X1();
  c.x = (x1 - x0) <= hw * 2 ? (x0 + x1) / 2 : Math.max(x0 + hw, Math.min(x1 - hw, c.x));
  c.y = (Y1 - Y0) <= hh * 2 ? (Y0 + Y1) / 2 : Math.max(Y0 + hh, Math.min(Y1 - hh, c.y));
}
export const screenToWorld = (sx, sy) => ({ x: (sx - view.W / 2) / view.cam.s + view.cam.x, y: (sy - view.H / 2) / view.cam.s + view.cam.y });
export const worldToScreen = (wx, wy) => ({ x: (wx - view.cam.x) * view.cam.s + view.W / 2, y: (wy - view.cam.y) * view.cam.s + view.H / 2 });
export function invalidate(){ view.cacheRev = -1; }
export const unitDef = u => u.state === 'restroom' ? C.RESTROOM : u.store ? C.STORES[u.store] : null;
export function poof(x, y, w, h){ view.poofs.push({ x, y, w, h, t: 0 }); }

/* ---------- Cached floor layer ---------- */
// Only the floor on screen is cached (and drawn): a smaller cache, so it can be sharper too.
function buildCache(){
  const want = view.dpr * view.cam.s, X0f = X0(), X1f = X1(), fr = floorRange(view.floor), up = view.floor > 0;
  // Keep the cached floor under ~8 million pixels so a big mall still fits in a phone's memory.
  const cap = Math.sqrt(8e6 / ((X1f - X0f) * (Y1 - Y0)));
  const sizes = [32, 48, 64, 88, 112].filter(b => b <= cap);
  const ppt = sizes.find(b => b >= want * 0.9) || sizes[sizes.length - 1] || 32;
  const cw = Math.round((X1f - X0f) * ppt), ch = Math.round((Y1 - Y0) * ppt);
  if (!view.cache || view.cache.width !== cw || view.cache.height !== ch){ view.cache = document.createElement('canvas'); view.cache.width = cw; view.cache.height = ch; }
  const c = view.cache.getContext('2d');
  A.setTarget(c, ppt);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#2d2236'; c.fillRect(0, 0, cw, ch);
  c.setTransform(ppt, 0, 0, ppt, -X0f * ppt, -Y0 * ppt);
  const s = S.save;
  // Outside: sidewalk and parking lot below the ground floor; sky and rooftops below the second floor's windows.
  if (up) A.skyView(X0f, C.MAP_H, X1f - X0f, Y1 - C.MAP_H, view.floor === 2);
  else { A.floor('sidewalk', X0f, C.MAP_H, X1f - X0f, 1, 3); A.floor('asphalt', X0f, C.MAP_H + 1, X1f - X0f, Y1 - C.MAP_H - 1, 4); }
  // Inside floors, row runs at a time.
  for (let y = 0; y < C.MAP_H; y++){
    let x = fr.x0;
    while (x < fr.x1){
      const f = map.floor[idx(x, y)], gd = map.garden[idx(x, y)];
      let x2 = x; while (x2 < fr.x1 && map.floor[idx(x2, y)] === f && map.garden[idx(x2, y)] === gd) x2++;
      A.floor(gd === 1 ? 'grass' : gd === 2 ? 'casinocarpet' : gd === 3 ? 'vipcarpet' : f === FLOOR_DUST ? 'dust' : A.concourseFloor(), x, y, x2 - x, 1, 11 + y * 31 + x);
      x = x2;
    }
  }
  // Ring of teal tiles around the fountain.
  if (!up){ c.save(); A.circ(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1, 1.3); c.strokeStyle = 'rgba(92,200,191,.55)'; c.lineWidth = 0.14; c.stroke(); c.restore(); }
  // Store interiors.
  for (const u of s.units){
    if (u.kiosk || u.x < fr.x0 - 1 || u.x >= fr.x1 || u.id === view.hideId) continue;
    const kind = u.state === 'derelict' ? 'dust' : u.state === 'vacant' ? 'plain' : (unitDef(u).floor || 'plain');
    A.floor(kind, u.x, u.y, u.w, u.h, u.id * 17);
    if (u.state === 'store' && !u.kiosk){
      const f = spotsFor(u).front;
      A.rr(f.x - 0.4, u.face === 'down' ? u.y + u.h + 0.02 : u.y - 0.3, 0.8, 0.28, 0.06); A.fs(C.STORES[u.store].trim, 0.03);
    }
  }
  // Clutter and gloom in the storage areas.
  for (let y = 0; y < C.MAP_H; y++) for (let x = fr.x0; x < fr.x1; x++){
    if (map.floor[idx(x, y)] !== FLOOR_DUST || map.occ[idx(x, y)]) continue;
    if (((x * 7 + y * 13) % 5) === 0) A.storageJunk(x, y, x * 101 + y);
  }
  for (let y = 0; y < C.MAP_H; y++) for (let x = fr.x0; x < fr.x1; x++){
    const i = idx(x, y);
    if (map.floor[i] === FLOOR_DUST && !map.occ[i]){ c.fillStyle = 'rgba(30,22,48,.42)'; c.fillRect(x - 0.002, y - 0.002, 1.004, 1.004); }
    if (map.occ[i] > 0){ const u = s.units.find(v => v.id === map.occ[i]); if (u && u.state === 'derelict'){ c.fillStyle = 'rgba(30,22,48,.28)'; c.fillRect(x - 0.002, y - 0.002, 1.004, 1.004); } }
  }
  A.mallBackWall(fr.x1 - fr.x0, undefined, fr.x0, up);
  view.cacheRev = map.rev; view.cachePPT = ppt; view.cacheFloor = view.floor;
}

/* ---------- Frame ---------- */
export function render(t){
  const s = S.save; if (!s) return;
  const { dpr, cam } = view;
  // The mall's style, or one being previewed from the Build panel.
  // The casino has its own look, whatever style the rest of the mall has.
  const st0 = view.stylePreview || s.style, st = view.floor === 2 ? { ...st0, wall: 'casino', floor: 'casino' } : st0, key = st ? st.wall + '/' + st.floor : '';
  if (key !== view.styleKey){ view.styleKey = key; A.setStyle(st); view.cacheRev = -1; }
  const want = dpr * cam.s;
  if (view.cacheRev !== map.rev || view.cacheFloor !== view.floor || !view.cache || (view.cachePPT < 112 && want > view.cachePPT * 1.25) || want < view.cachePPT * 0.45) buildCache();
  const ppt = dpr * cam.s;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2d2236'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ox = (view.W / 2 - cam.x * cam.s) * dpr, oy = (view.H / 2 - cam.y * cam.s) * dpr;
  // What's on screen, in tiles. Only that part of the cache is copied, and only things near it are drawn.
  const vx0 = cam.x - view.W / 2 / cam.s, vx1 = cam.x + view.W / 2 / cam.s, vy0 = cam.y - view.H / 2 / cam.s, vy1 = cam.y + view.H / 2 / cam.s;
  // Never past this floor's edges: when zoomed out, the other floor can be just off to the side.
  VIS.x0 = Math.max(vx0, X0()); VIS.x1 = Math.min(vx1, X1()); VIS.y0 = vy0; VIS.y1 = vy1;
  {
    const cx0 = X0(), k = view.cachePPT, sx0 = Math.max(0, (vx0 - cx0) * k), sy0 = Math.max(0, (vy0 - Y0) * k);
    const sx1 = Math.min(view.cache.width, (vx1 - cx0) * k), sy1 = Math.min(view.cache.height, (vy1 - Y0) * k);
    if (sx1 > sx0 && sy1 > sy0){
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = want < k ? 'medium' : 'low';
      ctx.drawImage(view.cache, sx0, sy0, sx1 - sx0, sy1 - sy0, ox + (cx0 + sx0 / k) * ppt, oy + (Y0 + sy0 / k) * ppt, (sx1 - sx0) / k * ppt, (sy1 - sy0) / k * ppt);
    }
  }
  ctx.setTransform(ppt, 0, 0, ppt, ox, oy);
  A.setTarget(ctx, ppt);
  const fr = floorRange(view.floor), up = view.floor > 0;

  // Floor-level things.
  for (const tr of sim.trash) if (seen(tr.x, tr.y, 0.5)) A.trash(tr.x, tr.y, tr.kind, tr.t);
  drawBinRange();
  drawJobRings(t);

  const Q = [];
  const add = (y, f) => Q.push([y, f]);
  // Dine-in tables: stools just behind whoever sits on them, the table top just in front.
  // What everyone sitting down to eat has in front of them, by seat: plates.get(store or food court)[seat] = food.
  const plates = new Map(), setPlate = (key, seat, food) => { if (seat === undefined) return; if (!plates.has(key)) plates.set(key, []); plates.get(key)[seat] = food; };
  for (const p of sim.people){
    if (!p.holding) continue;
    if (p.state === 'dine'){ setPlate(p.storeId, p.dineSeat, p.holding); setPlate(p.storeId, p.kidSeat, p.holding); }
    else if (p.state === 'court' && p.court){ setPlate(p.court.d, p.court.seat, p.holding); setPlate(p.court.d, p.court.kidSeat, p.holding); }
  }
  const tablePlates = (key, i) => { const pl = plates.get(key); return pl ? [pl[i * 2], pl[i * 2 + 1]] : null; };
  const addDine = u => A.dineSpots(u).tables.forEach((tb, i) => { add(tb.y + 0.0, () => A.dineTable(u, i, 'stools')); add(tb.y + 0.12, () => A.dineTable(u, i, 'table', tablePlates(u.id, i))); });
  const manned = view.mode === 'night' ? new Set(s.staff.map(m => m.storeId).filter(Boolean)) : null;
  for (const u of s.units){
    if (u.id === view.hideId || !seenRect(u.x, u.y - 2.6, u.w, u.h + 3)) continue;
    const def = unitDef(u);
    if (manned && u.state === 'store' && !def.attraction && !manned.has(u.id)) add(u.kiosk ? u.y + 1.05 : u.face === 'down' ? u.y + u.h + 0.32 : u.y - 0.12, () => A.helpWanted(u, t));
    if (u.kiosk){ add(u.y + 0.85, () => A.kiosk(u, def, t)); continue; }
    if (u.state === 'restroom') A.roomState.set(u, roomInfo(u));
    if (def && def.attraction){
      // Attractions: no counter. Cinema seat rows are sorted one by one so people sit in them, not on top.
      add(u.face === 'down' ? u.y + 0.48 : u.y + u.h, () => A.unitBack(u, def, t));
      if (def.attraction === 'jump' && u.face !== 'down') add(u.y, () => A.trampolines(u, def));
      if (def.attraction === 'theater') for (const row of [0, 1]){
        const s0 = A.attractionSpots(u, def).seats.find(q => q.row === row);
        add(u.face === 'down' ? s0.at.y + 0.2 : s0.at.y - 0.3, () => A.theaterRow(u, def, row));
      }
      add(u.face === 'down' ? u.y + u.h + 0.05 : u.y + 0.05, () => A.unitFront(u, def, t));
      continue;
    }
    if (u.face === 'down'){
      add(u.y + 0.48, () => A.unitBack(u, def, t));
      if (u.state === 'store'){ const cb = A.storeSpots(u).counter; add(cb[1] + cb[3], () => A.storeFurniture(u, def, t, 'counter')); add(u.y + u.h * 0.72, () => A.storeFurniture(u, def, t, 'mid')); if (def.icon === 'shirt') add(A.local(u, 0.95, 1.25, 0.7, 0.35)[1] + 0.35, () => A.storeFurniture(u, def, t, 'teeTable')); }
      if (u.state === 'store' && def.dine) addDine(u);
      if (u.state === 'restroom') add(u.y + u.h * 0.72, () => A.storeFurniture(u, def, t, 'mid'));
      add(u.y + u.h + 0.05, () => A.unitFront(u, def, t));
    } else {
      add(u.y + u.h, () => A.unitBack(u, def, t));
      if (u.state === 'store'){ const cb = A.storeSpots(u).counter; add(cb[1] + cb[3], () => A.storeFurniture(u, def, t, 'counter')); add(u.y + u.h * 0.45, () => A.storeFurniture(u, def, t, 'mid')); if (def.icon === 'shirt') add(A.local(u, 0.95, 1.25, 0.7, 0.35)[1] + 0.35, () => A.storeFurniture(u, def, t, 'teeTable')); }
      if (u.state === 'store' && def.dine) addDine(u);
      // The sink counter's front edge, so people washing (just below it) are drawn in front of it.
      if (u.state === 'restroom') add(u.y + 0.72, () => A.storeFurniture(u, def, t, 'mid'));
      add(u.y + 0.05, () => A.unitFront(u, def, t));
    }
  }
  // Machines in use (claw, kiddie ride) animate; tell the art who's playing and how far along they are. Machines
  // with a step-by-step routine (soda, gumballs) run it over exactly the shopper's turn.
  const users = new Map();
  for (const p of sim.people) if (p.state === 'useMachine' && p.machine) users.set(p.machine, p);
  // Casino tables: who's in which seat and how far along their round is, and whether the dealer's there.
  const players = new Map();
  for (const p of sim.people) if (p.state === 'atTable' && p.table){ let a = players.get(p.table); if (!a) players.set(p.table, a = [null, null, null]); a[p.seat] = { k: Math.min(1, Math.max(0, 1 - p.timer / p.tableMax)), win: p.tableWin, done: p.tableWin !== null && p.tableWin !== undefined }; }
  A4.setHour(sim.phase === 'idle' ? 21 : clockHour());
  for (const d of s.decor){
    if (d.id === view.hideId || !seenRect(d.x - 1, d.y - 2.8, 4, 5)) continue;
    const u = users.get(d), def = C.DECOR[d.type], c = def.coin;
    if (def.game) A.decorState.set(d, { seats: players.get(d) || [null, null, null], dealer: view.mode === 'night' || !!tableDealer(d) });
    else if (u) A.decorState.set(d, { k: Math.min(1, Math.max(0, 1 - u.timer / (STEPS.has(d.type) ? u.machineT || c.secs : c.secs * 1.1))), win: u.machineWin, seed: (u.id * 0.618) % 1, rider: (d.type === 'ride' || d.type === 'carousel') && u.look.kid ? u.look.kid : null }); else A.decorState.delete(d);
    if (d.type === 'foodcourt'){
      // The food court in layers, so people sit on the stools and behind the tables properly.
      add(d.y + 0.05, () => A4.foodCourt(d, 'base', 0, t));
      A4.courtSpots(d).tables.forEach((tb, i) => { add(tb.y, () => A4.foodCourt(d, 'stools', i, t)); add(tb.y + 0.12, () => A4.foodCourt(d, 'table', i, t, plates.get(d))); });
      add(d.y + 2.92, () => A4.foodCourt(d, 'front', 0, t));
      continue;
    }
    add(decorSortY(d), () => d.type === 'playarea' ? A2.playArea(d, t) : A.decor(d, t));
    if (d.type === 'playarea'){ add(d.y + PIT.y + PIT.ry, () => A2.playFront(d, 'pit')); add(d.y + 0.9, () => A2.playFront(d, 'slide')); add(d.y + 1.9, () => A2.playFront(d, 'rail')); }
  }
  if (!up && seenRect(C.FOUNTAIN.x - 1, C.FOUNTAIN.y - 2, 4, 5)) add(C.FOUNTAIN.y + 1.0, () => A.fountain(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1.05, t, s.fountain));
  // The escalator: its belts under the riders, its glass sides in front of them.
  for (const e of map.esc) if (e.floor === view.floor && seenRect(e.x - 1, e.y - 3, e.w + 2, e.h + 4)){
    add(e.y - 0.01, () => A.escalator(e, t, 'back'));
    add(e.y + 1.0, () => A.escalator(e, t, 'mid'));
    add(e.y + e.h + 0.02, () => A.escalator(e, t, 'front'));
  }
  add(C.MAP_H, () => { A.sideWall(fr.x0, 0, C.MAP_H); A.sideWall(fr.x1, 0, C.MAP_H); });
  if (up) add(C.MAP_H + 0.1, () => A.upperFrontWall(fr.x0 - 0.12, fr.x1 + 0.12, C.MAP_H));
  else add(C.MAP_H + 0.1, () => {
    A.frontWall(-0.12, C.ENTRANCE.x - 0.1, C.MAP_H); A.frontWall(C.ENTRANCE.x + C.ENTRANCE.w + 0.1, fr.x1 + 0.12, C.MAP_H);
    const near = sim.people.some(p => Math.abs(p.y - C.MAP_H) < 1.2 && Math.abs(p.x - (C.ENTRANCE.x + 1)) < 1.6);
    view.doorOpen = Math.max(0, Math.min(1, (view.doorOpen || 0) + (near ? 0.12 : -0.06)));
    A.entranceDoors(C.ENTRANCE.x, C.MAP_H, C.ENTRANCE.w, view.doorOpen);
  });
  if (!up) add(-0.5, () => { if (!s.zones.nw) A.pigeon(9.4, 1.6, t); if (!s.zones.ne) A.pigeon(27.2, 2.4, t + 1.7); });
  for (const p of sim.people){
    if (p.hidden || !seen(p.x, p.y - 0.8, 1.6)) continue;
    // In the massage chair: sorted with the chair, not where they stepped up to it.
    const m = p.state === 'useMachine' && p.machine && p.machine.type === 'massage' ? p.machine : null;
    add(m ? m.y + 0.9 : p.y, () => drawPerson(p, t));
    // At the play area the kid runs off to play: drawn there, among the slide and the balls.
    if (p.state === 'playing' && p.play && p.play.from && p.look.kid) add(playKidY(p), () => drawPlayKid(p));
  }
  Q.sort((a, b) => a[0] - b[0]);
  for (const [, f] of Q) f();
  // Signs over storefronts that face up hang above everything, so nobody's head covers a store's name.
  for (const u of s.units) if (!u.kiosk && u.id !== view.hideId && seenRect(u.x, u.y - 2.6, u.w, u.h + 3)) A.unitSign(u, unitDef(u));

  if (!up) A.text(s.player.mall, C.ENTRANCE.x + 1, C.MAP_H + 0.62, 0.3, 'rgba(255,255,255,.85)', 700, 'Fredoka', 6);
  drawLighting(t);
  drawGhost(t);
  drawOverlays(t);
}

// The part of the world on screen (set each frame), for skipping whatever's off it.
const VIS = { x0: 0, x1: 0, y0: 0, y1: 0 };
const seen = (x, y, m = 1) => x > VIS.x0 - m && x < VIS.x1 + m && y > VIS.y0 - m && y < VIS.y1 + m;
const seenRect = (x, y, w, h) => x < VIS.x1 && x + w > VIS.x0 && y < VIS.y1 && y + h > VIS.y0;
// Where decor sits in the back-to-front order. Seats are split so sitters look right on them.
export function decorSortY(d){
  const r = d.rot || 0, z = decorSize(d);
  if (d.type === 'bench' || d.type === 'sofa') return r === 0 ? d.y + 0.6 : r === 2 ? d.y + 0.9 : d.y + 0.3;
  if (d.type === 'planter') return d.y + z.h - 0.12;
  if (d.type === 'playarea') return d.y + 0.2;
  if (d.type === 'carousel') return d.y + 2.6;
  if (d.type === 'piano') return d.y + 1.5;
  if (d.type === 'koi') return d.y + 0.3;
  if (C.DECOR[d.type].game) return d.y + 1.2;
  return d.y + 0.8;
}
function drawPerson(p, t){
  // On the escalator: lifted up the rising belt, or sinking down the second floor's stairwell (cut off at the
  // floor's edge), fading out at the far end where they switch floors.
  if (p.ride && p.rideZ){
    const z = p.rideZ;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.rideFade ?? 1));
    if (z < 0){ ctx.beginPath(); ctx.rect(p.x - 1.5, p.y - 3, 3, 3.08); ctx.clip(); }
    ctx.translate(0, -z * (z < 0 ? 1.1 : 1));
    drawPersonAt(p, t);
    ctx.restore();
    return;
  }
  drawPersonAt(p, t);
}
// The kid at a play area: walks in from the grown-up, climbs the ladder and slides (or dives into the ball pit), then walks back.
export function playKidY(p){ return playKid(p, p.playEl || 0).y; }
export function drawPlayKid(p){
  const q = playKid(p, p.playEl || 0), k = p.look.kid, pose = q.pose, t = p.t;
  A.person(q.x, q.y - q.z, { ...k, t: t + 0.3, s: 0.68, mood: 'happy', flip: q.flip,
    walk: pose === 'walk' || pose === 'climb', stride: (p.playEl || 0) * (pose === 'climb' ? 0.5 : 1.7), side: pose === 'climb' ? 0 : 0.6,
    back: pose === 'climb' || (pose === 'walk' && q.up),
    sit: pose === 'sit' || pose === 'slide', sitSide: pose === 'slide', climb: pose === 'climb', cheer: pose === 'slide', splash: pose === 'pit', play: pose === 'hop',
    noShadow: q.z > 0.1 || pose === 'pit' || pose === 'hop' });
  // In the ball pit, balls go flying.
  if (pose === 'pit') for (let i = 0; i < 3; i++){
    const f = (t * 1.1 + i * 0.37 + p.id * 0.13) % 1, dir = i === 1 ? 0.5 : i ? 1 : -1;
    A.circ(q.x + dir * f * 0.32, q.y - q.z - 0.3 - Math.sin(f * Math.PI) * 0.38 + f * 0.15, 0.045); A.fs(BALL_COLS[(i + p.id) % BALL_COLS.length], 0.012);
  }
}
const BALL_COLS = ['#ef476f', '#ffd23f', '#06d6a0', '#5a8dee', '#ff9f43'];
const saveNow = () => S.save;
const STEPS = new Set(['vending', 'gumball']);
// How far someone has walked (their stride, so their steps keep pace) and which way they're heading, smoothed so
// a zigzag along the path doesn't flip them about. Heading mostly away from us, we see their back.
function gait(p){
  const dx = p.x - (p.gx ?? p.x), dy = p.y - (p.gy ?? p.y), d = Math.hypot(dx, dy);
  p.gx = p.x; p.gy = p.y;
  if (d < 1e-4 || d > 0.6) return;
  p.stride = (p.stride || 0) + d;
  const k = p.hx === undefined ? 1 : Math.min(1, d * 5);
  p.hx = (p.hx ?? 0) + (dx / d - (p.hx ?? 0)) * k; p.hy = (p.hy ?? 0) + (dy / d - (p.hy ?? 0)) * k;
  const n = Math.hypot(p.hx, p.hy) || 1; p.hx /= n; p.hy /= n;
  if (p.hy < -0.62) p.away = true; else if (p.hy > -0.3) p.away = false;
}
export function drawPersonAt(p, t){
  const L = p.look;
  gait(p);
  const o = { ...L, t: p.t, walk: p.walking, flip: p.flip, stride: p.stride, side: Math.abs(p.hx ?? 1), run: p.walking && p.speed >= 2.5 };
  if (p.kind === 'customer'){
    if (p.state === 'queue' && p.patience / p.patienceMax < 0.3) o.mood = 'wait';
    else if (p.mood > 0.8) o.mood = 'happy';
    if (p.type === 'teen' && L.hood) o.hood = false;
  }
  if (p.kind === 'gus') o.mood = 'happy';
  if (p.kind === 'trouble') o.mood = 'mad';
  if (L.costume) return A.mascot(p.x, p.y, o);
  // Bouncing on a trampoline: up and down, arms out.
  if (p.bouncing){
    const b = Math.abs(Math.sin(t * 5 + p.id)) * 0.45; o.play = true;
    // The shadow stays on the trampoline while the jumper flies up.
    A.shadow(p.x, p.y, 0.24, 0.085, 0.22 - b * 0.2); o.noShadow = true;
    // Kids bounce higher, on their own rhythm.
    if (L.kid){ o.kidBob = b - Math.abs(Math.sin(t * 6.5 + p.id + 1.7)) * 0.6; return A.family(p.x, p.y - b, o); }
    return A.person(p.x, p.y - b, o);
  }
  if (p.faceBack || (p.walking && p.away)) o.back = true;
  // Seated on a bench, sofa, the fountain's rim or a cinema seat. Side-facing seats show the legs in profile.
  if (p.state === 'sit' || (p.state === 'show' && !p.bouncing)){ o.sit = true; if (p.seat && p.seat.flip !== undefined) o.sitSide = true; }
  if (p.state === 'dine'){ o.sit = true; o.sitSide = true; }
  if (p.carry) o.carry = true;
  if (p.playing) o.play = true;
  if (p.vr) o.vr = true;
  if (p.slacking) o.phone = true;
  if (p.mopT > 0) o.mop = p.t * 6;
  if (p.holding){ o.hold = p.holding; if (p.holding === 'bag') o.bagColor = p.bagColor; if (p.prize) o.prize = p.prize; }
  // Sat at a table with their food: eating it, a bite at a time.
  if ((p.state === 'dine' || p.state === 'court') && p.holding){ o.eat = p.holding; o.hold = undefined; o.seed = (p.id * 0.37) % 1; }
  // Playing a machine: hands on the controls (a kid along for the trip joins in).
  const machine = p.state === 'useMachine' && p.machine ? p.machine.type : null;
  // At the soda machine: face it and press a button, until the can drops.
  if (machine === 'vending') return drawVending(p, o, t);
  if (machine === 'gumball') return drawGumball(p, o, t);
  if (machine && machine !== 'ride' && machine !== 'vending' && machine !== 'massage' && machine !== 'photobooth'){
    o.play = true;
    // Standing in front of a machine that faces down: we see their back, hands on the controls.
    if (!(p.machine.rot || 0)) o.back = true;
  }
  // In the photo booth, behind the curtain.
  if (machine === 'photobooth') return;
  // Casino: pulling the slot lever, then watching the reels; giving the prize wheel a big spin.
  if (machine === 'slots' || machine === 'goldslots' || machine === 'wheel'){
    const live = A.decorState.get(p.machine), k = live ? live.k : 0, r = p.machine.rot || 0;
    o.back = !r; o.play = false;
    if (machine === 'wheel') o.reach = k < 0.2;
    else { o.reach = k < 0.2; o.reachSide = r % 2 === 1; if (k > 0.85 && live && live.win){ o.play = true; o.reach = false; o.mood = 'happy'; } }
    return A.person(p.x, p.y, o);
  }
  // At a casino table, seen from behind: cards and chips at blackjack and poker (sat on a stool), leaning in to place
  // chips at roulette, throwing the dice at craps. A winner throws their arms up.
  if (p.state === 'atTable' && p.table){
    const kind = p.table.type, k = Math.min(1, Math.max(0, 1 - p.timer / p.tableMax)), done = p.tableWin !== null && p.tableWin !== undefined;
    const so = { ...o, back: true, kid: undefined, flip: false, walk: false };
    if (done && p.tableWin){ so.play = true; so.mood = 'happy'; }
    else if (kind === 'blackjack' || kind === 'poker'){ so.sit = true; so.play = Math.sin(t * 1.5 + p.id) > 0.3; if (kind === 'poker') so.hold = 'cards'; }
    else if (kind === 'roulette') so.reach = k < 0.35 && Math.sin(t * 5 + p.id) > -0.2;
    else if (kind === 'craps'){
      // The shooter is whoever's in the lowest seat still mid-round; the rest cheer once the dice land.
      const shooter = Math.min(...sim.people.filter(q => q.table === p.table && q.state === 'atTable' && (q.tableWin === null || q.tableWin === undefined)).map(q => q.seat));
      const roller = shooter === p.seat; so.reach = roller && k > 0.25 && k < 0.4; so.play = !roller && k > 0.7;
    }
    return A.person(p.x, (kind === 'blackjack' || kind === 'poker') ? p.y + 0.02 : p.y, so);
  }
  // Dealers face the players, hands busy dealing while anyone's playing.
  if (p.role === 'dealer' && p.state === 'deal'){ o.reach = p.dealing && Math.sin(t * 5) > 0.2; o.play = p.dealing && !o.reach; }
  if (p.role === 'host' && p.waveT > 0) o.reach = true;
  // Sat in the massage chair, buzzing.
  if (machine === 'massage'){
    const m = p.machine, r = m.rot || 0, st = A2.MASSAGE_SEAT(r), j = Math.sin(t * 40) * 0.012;
    const so = { ...o, kid: undefined, sit: true, sitSide: !!st.side, back: !!st.back, flip: st.side ? st.flip : o.flip, play: false, mood: 'happy' };
    return A.person(m.x + st.x + j, m.y + st.y, so);
  }
  // A family at a diner table: the grown-up on one stool, the kid on the stool across from them.
  if (p.state === 'dine' && L.kid && p.kidSeat !== undefined){
    const u = saveNow().units.find(v => v.id === p.storeId), seat = u && A.dineSpots(u).seats[p.kidSeat];
    if (seat) A.person(seat.x, seat.y, { ...L.kid, t: p.t + 0.3, s: 0.68, sit: true, sitSide: true, flip: seat.flip, eat: o.eat, seed: (o.seed || 0) + 0.5 });
    return A.person(p.x, p.y, { ...o, kid: undefined });
  }
  // Eating at the food court: on a stool, side on; a kid sits on the stool across.
  if (p.state === 'court' && p.court){
    const sp = A4.courtSpots(p.court.d);
    if (L.kid && p.court.kidSeat !== undefined){ const ks = sp.seats[p.court.kidSeat]; A.person(ks.x, ks.y, { ...L.kid, t: p.t + 0.3, s: 0.68, sit: true, sitSide: true, flip: ks.flip, mood: 'happy', eat: o.eat, seed: (o.seed || 0) + 0.5 }); }
    return A.person(p.x, p.y, { ...o, kid: undefined, sit: true, sitSide: true, flip: sp.seats[p.court.seat].flip });
  }
  // A grown-up waiting at the play area, watching their kid.
  if (p.state === 'playing') return A.person(p.x, p.y, { ...o, kid: undefined, back: true, wave: (p.t + p.id) % 5.5 < 1.1 });
  if (L.kid){
    if (machine !== 'ride' && machine !== 'carousel') return A.family(p.x, p.y, o);
    // On the kiddie ride the grown-up watches. The kid hops up into the rocket's cockpit at the start and back
    // down at the end; in between the ride draws them sitting in it, rocking along.
    const m = p.machine, live = A.decorState.get(m), k = live ? live.k : 0;
    A.person(p.x, p.y, { ...o, kid: undefined, back: !(m.rot || 0) ? false : o.back });
    const hop = k < A.RIDE_ON ? k / A.RIDE_ON : k > A.RIDE_OFF ? 1 - (k - A.RIDE_OFF) / (1 - A.RIDE_OFF) : -1;
    if (hop >= 0){
      const seat = m.type === 'carousel' ? A4.carouselSeat(m) : A.rideSeat(m), fx = p.x - 0.38, fy = p.y + 0.12, e = hop * hop * (3 - 2 * hop);
      const kx = fx + (seat.x - fx) * e, ky = fy + (seat.y - fy) * e - Math.sin(hop * Math.PI) * 0.35;
      A.person(kx, ky, { ...L.kid, t: p.t + 0.3, s: 0.68, walk: hop > 0.05 && hop < 0.95, flip: seat.x < fx, play: hop > 0.3 && hop < 0.8, mood: 'happy', noShadow: hop > 0.1 });
    }
    return;
  }
  // A soda just out of the machine fizzes as it's cracked open.
  if (p.holding === 'can' && p.holdT < 0.9 && p.boughtCan) o.fizz = p.holdT / 0.9;
  if ((p.kind === 'owner' || p.kind === 'staff') && p.broomT > 0) o.broom = p.t * 18;
  A.person(p.x, p.y, o);
}

// At the soda machine, side on to it: coin in, punch a button, wait for the thunk, crouch to fish the can out of
// the tray, stand up with it. At a machine facing us they step up beside it first (so the window and tray stay in
// view) and back to where they were at the end; a kid along for it waits by the grown-up's spot.
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
function drawVending(p, o, t){
  const m = p.machine, live = A.decorState.get(m), k = live ? live.k : 0, r = m.rot || 0, V = A.VEND, seg = (a, b) => ease((k - a) / (b - a));
  if (p.look.kid) A.person(p.x - 0.38, p.y + 0.12, { ...p.look.kid, t: p.t + 0.3, s: 0.68, back: !r, flip: p.flip, mood: k > V.grab ? 'happy' : undefined });
  const lerp2 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  let x = p.x, y = p.y;
  const so = { ...o, kid: undefined, back: false, reachSide: true, flip: r === 0 ? true : p.flip };
  if (r === 0){
    const u = seg(0, 0.07) * (1 - seg(0.88, 1));
    x += (m.x + 1.1 - x) * u; y += (m.y + 1.0 - y) * u;
    // Stepping up to it (seen from behind) or back off it (can in hand).
    if (k < 0.07 || k > 0.88) return A.person(x, y, { ...o, kid: undefined, walk: true, stride: k * 3, side: 0.4, back: k < 0.07, flip: k > 0.88 ? m.x + 0.5 < p.x : false, hold: k > 0.88 ? 'can' : undefined, mood: k > 0.88 ? 'happy' : o.mood });
  }
  // Hand targets, from the feet, toward the machine: the coin slot, the button, the tray (crouched); and at rest.
  const coin = r === 0 ? [0.35, -0.64] : [0.36, -0.62], btn = r === 0 ? [0.35, -0.835] : [0.37, -0.86], tray = r === 0 ? [0.52, -0.37] : [0.42, -0.3], rest = [0.18, -0.36], chest = [0.2, -0.42];
  let h;
  if (k < V.press) h = lerp2(rest, coin, seg(0.06, V.coin));
  else if (k < V.drop) { h = lerp2(coin, btn, seg(V.press - 0.02, V.press + 0.03)); h[0] -= Math.max(0, Math.sin((k - V.press - 0.03) / 0.07 * Math.PI)) * 0.04; }
  else if (k < 0.56) h = lerp2(btn, rest, seg(V.drop, V.drop + 0.06));
  else if (k < V.grab + 0.02) h = lerp2(rest, tray, seg(0.56, 0.65));
  else h = lerp2(tray, chest, seg(V.grab + 0.02, 0.82));
  so.reachTo = h; so.crouch = seg(0.55, 0.64) * (1 - seg(V.grab + 0.02, 0.82));
  if (k >= V.grab) so.reachHold = 'can';
  if (k >= V.grab) so.mood = 'happy';
  return A.person(x, y, so);
}

// At the gumball machine (a kid does the honours when there is one): step up beside it, turn the crank a full turn,
// crouch for the gumball in the little door, pop it in, and step back.
function drawGumball(p, o, t){
  const m = p.machine, live = A.decorState.get(m), k = live ? live.k : 0, G = A.GUM, seg = (a, b) => ease((k - a) / (b - a));
  const kid = p.look.kid, look = kid || p.look, s = kid ? 0.68 : 1, gx = m.x + 0.5, gy = m.y + 0.8;
  const fx = kid ? p.x - 0.38 : p.x, fy = kid ? p.y + 0.12 : p.y, sx = gx + (kid ? 0.22 : 0.38), sy = gy + (kid ? 0.2 : 0.3);
  const u = seg(0, 0.08) * (1 - seg(0.88, 1)), x = fx + (sx - fx) * u, y = fy + (sy - fy) * u;
  // The grown-up steps aside to watch, so the machine stays in view.
  if (kid) A.person(p.x - 0.5 * u, p.y, { ...o, kid: undefined, back: true, walk: u > 0 && u < 1, stride: k * 2.2, side: 1 });
  const base = { ...look, t: p.t + (kid ? 0.3 : 0), s, mood: k > G.grab ? 'happy' : undefined };
  if (k < 0.08 || k > 0.88) return A.person(x, y, { ...base, walk: true, stride: k * 2.2, side: 0.5, back: k < 0.08, flip: k > 0.88 ? sx > fx : false });
  // Hand targets in the operator's own frame (facing the machine), from spots on it.
  const at = (wx, wy) => [(sx - wx) / s, (wy - sy) / s], lerp2 = (a, b, v) => [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v];
  const turn = k > G.crank && k < G.turned ? (k - G.crank) / (G.turned - G.crank) : 0, a = -Math.PI / 2 + turn * Math.PI * 2;
  const crank = at(gx + Math.cos(a) * 0.045, gy - 0.34 + Math.sin(a) * 0.035), door = at(gx, gy - 0.19), rest = [0.18, -0.36], mouth = [0.2, -0.78];
  let h;
  if (k < G.turned) h = lerp2(rest, crank, seg(0.08, G.crank));
  else if (k < 0.6) h = lerp2(crank, rest, seg(G.turned, G.turned + 0.06));
  else if (k < G.grab) h = lerp2(rest, door, seg(0.6, 0.69));
  else if (k < 0.8) h = lerp2(door, mouth, seg(G.grab, 0.8));
  else h = lerp2(mouth, rest, seg(0.82, 0.88));
  return A.person(x, y, { ...base, flip: true, reachSide: true, reachTo: h, crouch: seg(0.59, 0.67) * (1 - seg(G.grab, 0.8)) * (kid ? 0.6 : 1) });
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
export const restroomBubble = u => ({ x: u.x + u.w / 2, y: u.face === 'down' ? u.y - 1.35 : u.y - 1.15 });
export function jobPoint(j){
  if (j.type === 'nudge'){ const p = sim.people.find(q => q.id === j.staffId); return p ? { x: p.x, y: p.y } : null; }
  if (j.type === 'restroom'){ const u = S.save.units.find(v => v.id === j.unitId); return u ? { x: u.x + u.w / 2, y: u.face === 'down' ? u.y + u.h + 0.5 : u.y - 0.5 } : null; }
  if (j.type === 'clean'){ const tr = sim.trash.find(x => x.id === j.trashId); return tr ? { x: tr.x, y: tr.y } : null; }
  if (j.type === 'register'){ const u = S.save.units.find(v => v.id === j.unitId); if (!u) return null; const sp = spotsFor(u).staff; return { x: sp.x, y: sp.y }; }
  if (j.type === 'wish') return { x: C.FOUNTAIN.x + 1, y: C.FOUNTAIN.y + 2.2 };
  return null;
}

function drawLighting(t){
  const h = sim.phase === 'idle' ? 21 : clockHour();
  let tint = null, a = 0;
  // Evening is a soft golden-to-dusk wash, light enough to keep everything easy to see; stores and lamps glow.
  if (view.mode === 'night'){ tint = '24,20,70'; a = 0.32; }
  else if (h > 18.5){ const k = Math.min(1, (h - 18.5) / 2.5); tint = `${Math.round(lerp(255, 96, k))},${Math.round(lerp(176, 80, k))},${Math.round(lerp(96, 160, k))}`; a = 0.05 + 0.1 * k; }
  if (!tint) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(${tint},${a})`; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  // Lamp posts glow once the light starts to go.
  const lamps = S.save.decor.filter(d => d.type === 'lamp' && d.id !== view.hideId && seen(d.x, d.y - 1.4, 2.5));
  if (lamps.length && (view.mode === 'night' || h > 18.5)){
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const k = view.mode === 'night' ? 1 : Math.min(1, (h - 18.5) / 1.5);
    for (const d of lamps){
      const cx = d.x + 0.5, cy = d.y - 1.4;
      const gr = ctx.createRadialGradient(cx, cy, 0.1, cx, cy, 2.2);
      gr.addColorStop(0, `rgba(255,226,150,${0.35 * k})`); gr.addColorStop(1, 'rgba(255,226,150,0)');
      ctx.fillStyle = gr; ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
    }
    ctx.restore();
  }
  const glow = view.mode === 'night' ? 1 : h > 19 ? Math.min(1, (h - 19) / 1.5) * 0.8 : 0;
  if (glow > 0){
    // Warm light spilling from open stores.
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = glow;
    for (const u of S.save.units){
      if (u.state !== 'store' || !seenRect(u.x - 2, u.y - 2, u.w + 4, u.h + 4)) continue;
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
  // Something being moved is shown solid, as it'll look, with its old spot left empty; something new is see-through.
  ctx.globalAlpha = gh.moving ? 0.92 : 0.55;
  if (gh.preview) gh.preview(t);
  ctx.globalAlpha = 1;
  // Storage that gets cleared out as part of this build.
  for (const z of gh.zones || []){
    ctx.fillStyle = 'rgba(255,210,63,.14)'; ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 0.06; ctx.setLineDash([0.22, 0.14]);
    ctx.strokeRect(z.x + 0.04, z.y + 0.04, z.w - 0.08, z.h - 0.08); ctx.setLineDash([]);
  }
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
  // Bubbles over customers. In a long line only the first two show what they want (plus anyone about to give up),
  // so the bubbles don't pile into a heap.
  const backOfLine = new Set();
  for (const st of sim.storeState.values()) if (st.queue) for (const id of st.queue.slice(2)) backOfLine.add(id);
  for (const p of sim.people){
    if (!seen(p.x, p.y - 1.5, 2.5)) continue;
    if (p.kind === 'customer' && p.bubble){
      const b = p.bubble, y = p.y - (C.CUSTOMERS[p.type] && p.look.kid ? 1.6 : 1.55);
      const pulse = b.kind === 'want' && p.patience / p.patienceMax < 0.3 ? Math.abs(Math.sin(t * 8)) : 0;
      if (b.kind === 'want' && !pulse && backOfLine.has(p.id)) continue;
      A.bubble(p.x, y, b.icon, b.kind === 'info' ? 'info' : b.kind, b.kind === 'want' ? p.patience / p.patienceMax : 1, pulse);
    }
    if (p.kind === 'gus' && p.chatIcon){ A.bubble(p.x, p.y - 1.55, 'chat', 'info'); }
    if (p.kind === 'trouble' && (p.state === 'roam' || p.state === 'act')) A.bubble(p.x, p.y - 1.55, 'angry', 'want', 1, p.state === 'act' ? Math.abs(Math.sin(t * 6)) : 0);
    if (p.kind === 'staff' && p.slacking){ A.bubble(p.x, p.y - (p.look.costume ? 1.9 : 1.55), 'phone', 'want', Math.max(0, p.breakT / p.breakMax)); }
    if (p.kind === 'gus' && p.say){ speech(p.x, p.y - 1.6, p.say); }
    if ((p.kind === 'owner' || p.kind === 'staff') && p.serving > 0 && sim.phase === 'day'){
      A.ell(p.x, p.y - 1.42, 0.24, 0.07); A.fs('rgba(255,255,255,.9)', 0.03);
      A.rr(p.x - 0.22, p.y - 1.47, 0.44 * Math.min(1, p.serving), 0.1, 0.05); A.fs('#4cc38a', 0);
    }
  }
  // Restrooms that need a mop: flies first, then a bubble you can tap.
  if (view.mode === 'day') for (const u of s.units){
    if (u.state !== 'restroom' || !seenRect(u.x, u.y - 2, u.w, u.h + 2)) continue;
    const r = roomInfo(u), p0 = restroomBubble(u);
    if (r.dirt >= 30) for (let i = 0; i < 3; i++){ const a = t * 3 + i * 2.1; A.circ(p0.x + Math.cos(a) * 0.35, p0.y + 0.55 + Math.sin(a * 1.3) * 0.18, 0.035); A.fs('#3d2b35', 0); }
    if (r.dirt >= 50) A.bubble(p0.x, p0.y, 'wc', 'want', 1 - r.dirt / 100, r.dirt >= 80 ? Math.abs(Math.sin(t * 8)) : 0);
  }
  if (sim.wishCoin && view.mode === 'day' && !view.floor){
    const bob = Math.sin(t * 3) * 0.06;
    A.storeIcon('coin', C.FOUNTAIN.x + 1, C.FOUNTAIN.y - 0.5 + bob, 0.45);
  }
  // Numbered pins on queued jobs
  sim.jobs.forEach((j, i) => {
    const pt = jobPoint(j); if (!pt) return;
    const y = pt.y - (j.type === 'register' ? 1.75 : j.type === 'nudge' ? 2.15 : 0.6);
    A.circ(pt.x, y, 0.2); A.fs('#ffd23f', 0.04);
    A.text(String(i + 1), pt.x, y + 0.01, 0.24, A.OUT, 700);
  });
  for (const f of sim.fx){
    if (!seen(f.x, f.y, 2)) continue;
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
  // Storefronts a store can open in, each with its price.
  if (view.spots){
    const k = Math.abs(Math.sin(t * 3));
    for (const sp of view.spots){
      ctx.save();
      A.rr(sp.x + 0.06, sp.y + 0.06, sp.w - 0.12, sp.h - 0.12, 0.2);
      ctx.fillStyle = sp.sel ? 'rgba(255,210,63,.3)' : sp.afford ? `rgba(76,195,138,${0.14 + k * 0.14})` : 'rgba(200,190,210,.16)'; ctx.fill();
      ctx.strokeStyle = sp.sel ? '#ffd23f' : sp.afford ? '#4cc38a' : '#b9adc6'; ctx.lineWidth = sp.sel ? 0.13 : 0.08;
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = (sp.sel ? 0.4 : 0.15 + k * 0.2) * view.dpr * view.cam.s;
      ctx.stroke();
      ctx.restore();
      const cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2, w = 0.36 + sp.label.length * 0.17;
      A.rr(cx - w / 2, cy - 0.25, w, 0.5, 0.25); A.fs(sp.sel ? '#ffd23f' : sp.afford ? '#fffaf3' : '#e4dcea', 0.05);
      A.text(sp.label, cx, cy + 0.01, 0.28, sp.afford ? A.OUT : '#8a7d93', 700);
    }
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
