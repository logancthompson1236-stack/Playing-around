// The day simulation. Pure logic: no drawing, no DOM. The renderer reads `sim`, the UI reads `sim.events`.
import * as C from './config.js';
import { S, stores, addXp, staffSkill, wageOf } from './state.js';
import { map, isWalk, nextStep, unitAccess, kioskStaffAccess, benchAccess, fountainSpots, idx, GW, litterSpot } from './map.js';
import { storeSpots, kioskSpots, mulberry } from './art.js';

export const sim = {
  t: 0, phase: 'idle', speed: 1, paused: false, clockFrozen: false, spawning: true,
  people: [], trash: [], fx: [], events: [],
  owner: null, jobs: [], spawnTimes: [], spawnIdx: 0, nextId: 1,
  stats: null, boost: null, gus: null, wishCoin: false, closeT: 0,
  storeState: new Map(),   // unit id -> { queue: [], server: null, serveT: 0, soldOut: false }
};
let rand = Math.random;
export function setRandom(fn){ rand = fn; }
const pick = arr => arr[Math.floor(rand() * arr.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const emit = (type, data = {}) => sim.events.push({ type, ...data });

export const clockHour = () => C.OPEN_HOUR + (C.CLOSE_HOUR - C.OPEN_HOUR) * Math.min(1, sim.t / C.DAY_SECONDS);
export function clockText(){
  const h = clockHour(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10;
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
}

/* ---------- Looks ---------- */
const SKINS = C.LOOKS.skin, HAIRS = ['#2b2230', '#6b3e26', '#d9733f', '#e8c46a', '#1f1a1f', '#8a5a44'];
function lookFor(type){
  const base = { skin: pick(SKINS), hair: pick(HAIRS), pants: pick(['#33415c', '#3d405b', '#6d597a', '#2f3a5a', '#c9a46b', '#5a8dee']) };
  switch (type){
    case 'walker': return { ...base, hair: pick(['#f4f4f4', '#d8d8d8', '#bdb6c4']), hairStyle: pick(['visor', 'short', 'bun']), acc: '#ffffff', shirt: pick(['#7b6fd6', '#06a77d', '#e07a5f']), shoe: '#fff', glasses: rand() < 0.4 };
    case 'teen': { const hood = rand() < 0.5; return { ...base, hairStyle: pick(['short', 'long']), shirt: pick(['#7b2cbf', '#ef476f', '#118ab2', '#2b2d42']), hood }; }
    case 'family': return { ...base, hairStyle: pick(['short', 'long', 'bun']), shirt: pick(['#5cb85c', '#f4b942', '#118ab2', '#e76f51']), kid: { skin: base.skin, hair: base.hair, hairStyle: pick(['bun', 'short']), shirt: pick(['#ffd23f', '#ff8fab', '#7bd389']), pants: pick(['#5a8dee', '#ef476f']), balloon: rand() < 0.4 ? pick(['#ef476f', '#5a8dee', '#ffd23f']) : null } };
    case 'fashion': return { ...base, hairStyle: pick(['long', 'bun']), shirt: pick(['#e63946', '#ff8fab', '#f4a261', '#9b5de5']), bag: true, bagColor: pick(['#ff8fab', '#ffd23f', '#5cc8bf']) };
    default: return { ...base, hairStyle: pick(['short', 'long', 'bun']), shirt: pick(['#8ecae6', '#f4a261', '#90be6d', '#cdb4db']) };
  }
}
export const GUS_LOOK = { skin: '#e8b894', hair: '#e6e6e6', hairStyle: 'flatcap', acc: '#5f6f7a', shirt: '#3a9e95', pants: '#4a4f5a', stache: true, thermos: true };
export function staffLook(role, seed){
  const R = mulberry(seed * 977 + 3), p = a => a[Math.floor(R() * a.length)];
  const base = { skin: p(SKINS), hair: p(HAIRS), hairStyle: p(['short', 'long', 'bun']), pants: '#3d405b' };
  return role === 'janitor' ? { ...base, hairStyle: 'cap', acc: '#3a9e95', shirt: '#3a9e95', patch: true } : { ...base, shirt: '#ff8fab', apron: '#fff6ea' };
}

/* ---------- Store helpers ---------- */
export function storeInfo(u){
  let st = sim.storeState.get(u.id);
  if (!st){ st = { queue: [], server: null, serveT: 0, soldOut: false }; sim.storeState.set(u.id, st); }
  return st;
}
export function spotsFor(u){ return u.kiosk ? kioskSpots(u) : storeSpots(u); }
function queueSpot(u, i){
  const sp = spotsFor(u);
  if (i < sp.queue.length) return sp.queue[i];
  // Overflow line forms outside the door.
  const f = sp.front, k = i - sp.queue.length;
  const dir = u.kiosk ? 1 : (u.face === 'down' ? 1 : -1);
  return { x: f.x + ((k % 2) ? 0.55 : -0.55) * (1 + Math.floor(k / 2) * 0.4), y: f.y + dir * (0.1 + Math.floor(k / 2) * 0.25) };
}
const personById = id => sim.people.find(p => p.id === id);
const insideUnit = (u, x, y) => x > u.x && x < u.x + u.w && y > u.y && y < u.y + u.h;
// Out through the door if inside; straight to the front if already waiting outside.
function exitPath(u, p){ const sp = spotsFor(u); return insideUnit(u, p.x, p.y) ? [sp.door, sp.front] : [sp.front]; }

/* ---------- Day lifecycle ---------- */
export function startDay(opts = {}){
  const s = S.save;
  sim.t = 0; sim.phase = 'day'; sim.paused = false; sim.closeT = 0;
  sim.people = []; sim.trash = []; sim.fx = []; sim.events = []; sim.jobs = [];
  sim.storeState.clear();
  sim.clockFrozen = !!opts.tutorial; sim.spawning = !opts.tutorial;
  sim.boost = null; sim.wishCoin = !!s.fountain;
  sim.stats = { visitors: 0, served: 0, walkouts: 0, revenue: 0, byStore: {}, wishes: {}, waitFrac: 0, waitN: 0, dirtSum: 0, dirtN: 0, moodSum: 0, moodN: 0, sampleT: 0, stockouts: {}, gusTrash: 0 };
  const open = stores(s);
  const rating = s.ratingHist.length ? s.rating : 1;
  const ambience = s.decor.length * 0.5 + (s.fountain ? 3 : 0);
  let V = (12 + 8 * open.length + ambience) * (0.6 + 0.22 * rating) * (0.9 + rand() * 0.2) * C.VISITOR_SCALE;
  if (opts.tutorial) V *= 0.8;
  V = Math.round(V);
  const weights = C.HOURLY, total = weights.reduce((a, b) => a + b, 0), times = [];
  for (let i = 0; i < V; i++){
    let r = rand() * total, h = 0;
    while (r > weights[h]){ r -= weights[h]; h++; }
    const t = (h + rand()) / 12 * C.DAY_SECONDS;
    if (t < C.DAY_SECONDS * C.LAST_ENTRY) times.push(t);
  }
  sim.spawnTimes = times.sort((a, b) => a - b); sim.spawnIdx = 0;
  sim.owner = makePerson('owner', { ...s.player.look, badge: true }, C.ENTRANCE.x + 0.6, C.MAP_H - 3.5);
  sim.owner.speed = C.OWNER_SPEED; sim.owner.atRegister = null; sim.owner.exit = [];
  sim.people.push(sim.owner);
  for (const st of s.staff) spawnStaff(st);
  sim.gus = null;
  if (opts.gus) spawnGus(opts.tutorial ? 'tutorial' : 'visit');
}
function makePerson(kind, look, x, y){
  return { id: sim.nextId++, kind, look, x, y, t: rand() * 10, walking: false, flip: false, state: 'idle', timer: 0, speed: 1.4 };
}
function spawnStaff(st){
  const p = makePerson('staff', st.look, C.ENTRANCE.x + 1, C.MAP_H - 2.5);
  const k = staffSkill(st);
  p.role = st.role; p.staffId = st.id; p.name = st.name; p.skill = k; p.dream = st.dream || null;
  p.speed = st.role === 'janitor' ? C.JANITOR_SPEED[k] : C.STAFF_SPEED; p.cleanTime = C.JANITOR_CLEAN[k];
  if (st.role === 'clerk'){
    const u = S.save.units.find(v => v.id === st.storeId && v.state === 'store');
    if (u){ const sp = spotsFor(u).staff; p.x = sp.x; p.y = sp.y; p.storeId = u.id; storeInfo(u).server = p.id; p.state = 'register'; }
    else p.state = 'idle';
  } else p.state = 'idle';
  sim.people.push(p);
}
export function spawnGus(mode){
  const g = makePerson('gus', GUS_LOOK, C.ENTRANCE.x + 1.4, C.MAP_H - 1.6);
  g.mode = mode; g.speed = 1.0; g.state = mode === 'tutorial' ? 'stand' : 'arrive'; g.picked = 0; g.lap = 0;
  g.route = [{ x: 12.5, y: 9.5 }, { x: 1.5, y: 7.5 }, { x: 24.5, y: 6.5 }, { x: 1.5, y: 6.5 }, { x: 24.5, y: 8.5 }];
  sim.gus = g; sim.people.push(g);
  return g;
}

/* ---------- Movement ---------- */
function moveDirect(p, gx, gy, dt, speedMul = 1){
  const dx = gx - p.x, dy = gy - p.y, d = Math.hypot(dx, dy), step = p.speed * speedMul * dt;
  p.walking = d > 0.02;
  if (Math.abs(dx) > 0.02) p.flip = dx < 0;
  if (d <= step){ p.x = gx; p.y = gy; return true; }
  p.x += dx / d * step; p.y += dy / d * step;
  if (p.kind === 'customer') p.litterAcc = (p.litterAcc || 0) + step;
  return false;
}
// Walk along the walkway toward (gx, gy). The goal's tile must be walkable.
function walkTo(p, gx, gy, dt, speedMul = 1){
  const tx = Math.floor(gx), ty = Math.floor(gy), cx = Math.floor(p.x), cy = Math.floor(p.y);
  if (cx === tx && cy === ty) return moveDirect(p, gx, gy, dt, speedMul);
  const n = nextStep(cx, cy, tx, ty);
  if (!n) return moveDirect(p, gx, gy, dt, speedMul);
  const last = n.x === tx && n.y === ty;
  moveDirect(p, last ? gx : n.x + 0.5, last ? gy : n.y + 0.5, dt, speedMul);
  return false;
}
// Run through a list of direct waypoints (used for stepping in and out of stores).
function runPath(p, dt){
  while (p.exit && p.exit.length){
    const w = p.exit[0];
    if (!moveDirect(p, w.x, w.y, dt)) return false;
    p.exit.shift();
  }
  return true;
}

/* ---------- Customers ---------- */
function spawnCustomer(forceType, forceWish){
  const h = Math.floor(clockHour());
  let type = forceType;
  if (!type){
    const entries = Object.entries(C.CUSTOMERS).map(([k, d]) => [k, d.weight * (h >= d.hours[0] && h < d.hours[1] ? 1 : 0.2)]);
    let r = rand() * entries.reduce((a, e) => a + e[1], 0);
    type = entries.find(e => (r -= e[1]) <= 0)[0];
  }
  const def = C.CUSTOMERS[type];
  const p = makePerson('customer', lookFor(type), C.ENTRANCE.x + 0.5 + rand(), C.MAP_H + 1.7);
  p.type = type; p.speed = def.speed * (0.9 + rand() * 0.2); p.mood = 0.6; p.state = 'arrive';
  p.litterAcc = 0; p.boughtFood = false; p.moodT = 0;
  p.wishes = forceWish ? [forceWish] : chooseWishes(type);
  sim.people.push(p); sim.stats.visitors++;
  return p;
}
function chooseWishes(type){
  const def = C.CUSTOMERS[type], openTypes = new Set(stores(S.save).map(u => u.store));
  const pool = Object.entries(def.wants).map(([k, w]) => [k, w * (openTypes.has(k) ? 2.5 : 1)]);
  const n = type === 'browser' ? 2 + (rand() < 0.5 ? 1 : 0) : 1 + (rand() < 0.6 ? 1 : 0) + (rand() < 0.15 ? 1 : 0);
  const out = [];
  for (let i = 0; i < n && pool.length; i++){
    let r = rand() * pool.reduce((a, e) => a + e[1], 0);
    const j = pool.findIndex(e => (r -= e[1]) <= 0);
    out.push(pool[j][0]); pool.splice(j, 1);
  }
  return out;
}
function setBubble(p, icon, kind, secs){ p.bubble = { icon, kind, until: sim.t + secs, real: secs }; }

function updateCustomer(p, dt){
  const def = C.CUSTOMERS[p.type];
  p.t += dt;
  if (p.bubble && p.bubble.kind !== 'want' && (p.bubbleT = (p.bubbleT || 0) + dt) > p.bubble.real){ p.bubble = null; p.bubbleT = 0; }
  // Mood drifts with the surroundings.
  if ((p.moodT += dt) > 2){
    p.moodT = 0;
    let dirt = 0;
    for (const tr of sim.trash) if (Math.abs(tr.x - p.x) < 2.5 && Math.abs(tr.y - p.y) < 2.5) dirt++;
    p.mood = Math.max(0, Math.min(1, p.mood - Math.min(0.06, dirt * 0.012) + decorNear(p.x, p.y) * 0.004));
  }
  switch (p.state){
    case 'arrive':
      if (moveDirect(p, p.x, C.MAP_H - 0.5, dt)) p.state = 'decide';
      break;
    case 'decide': decide(p); break;
    case 'pause':
      p.walking = false;
      if ((p.timer -= dt) <= 0) p.state = 'decide';
      break;
    case 'toStore': {
      const u = S.save.units.find(v => v.id === p.storeId);
      if (!u || u.state !== 'store'){ p.state = 'decide'; break; }
      const f = spotsFor(u).front;
      dropLitter(p, def);
      if (walkTo(p, f.x, f.y, dt)){
        if (u.kiosk){ p.state = 'browse'; p.timer = 0.8 + rand() * 0.8; }
        else { const sp = spotsFor(u); const b = pick(sp.browse); p.exit = [sp.door, { x: b.x + (rand() - 0.5) * 0.2, y: b.y + (rand() - 0.5) * 0.2 }]; p.state = 'enter'; }
      }
      break;
    }
    case 'enter':
      if (runPath(p, dt)){ p.state = 'browse'; p.timer = 1.6 + rand() * 2.2; }
      break;
    case 'browse': {
      p.walking = false;
      if ((p.timer -= dt) > 0) break;
      const u = S.save.units.find(v => v.id === p.storeId);
      if (!u || u.state !== 'store'){ leaveStore(p, u); break; }
      if (u.stock <= 0){
        setBubble(p, 'empty', 'info', 1.6); p.mood -= 0.08;
        if (!sim.stats.stockouts[u.id]){ sim.stats.stockouts[u.id] = true; emit('stockout', { name: C.STORES[u.store].name }); }
        leaveStore(p, u); break;
      }
      const chance = def.buy * (0.7 + 0.6 * p.mood) * (sim.boost === 'buy' ? 1.15 : 1);
      if (p.tutorial || rand() < chance){
        const st = storeInfo(u); st.queue.push(p.id);
        p.state = 'queue'; p.patienceMax = C.BASE_PATIENCE * def.patience * (sim.boost === 'patience' ? 1.3 : 1); p.patience = p.patienceMax;
        setBubble(p, C.STORES[u.store].icon, 'want', 999);
        if (sim.tutorialHold) p.patienceMax = p.patience = 9999;
      } else leaveStore(p, u);
      break;
    }
    case 'queue': {
      const u = S.save.units.find(v => v.id === p.storeId);
      const st = u && storeInfo(u);
      if (!u || u.state !== 'store'){ p.bubble = null; leaveStore(p, u); break; }
      const i = st.queue.indexOf(p.id);
      const spot = queueSpot(u, i);
      // Moving between a spot inside the store and the overflow line outside goes through the door.
      let goal = spot;
      if (!u.kiosk && insideUnit(u, p.x, p.y) !== insideUnit(u, spot.x, spot.y)){
        const door = spotsFor(u).door;
        if (Math.hypot(door.x - p.x, door.y - p.y) > 0.12) goal = door;
      }
      moveDirect(p, goal.x, goal.y, dt);
      p.walking = Math.hypot(spot.x - p.x, spot.y - p.y) > 0.05;
      if (!p.served) p.patience -= dt;
      if (p.patience <= 0){
        st.queue.splice(i, 1); p.bubble = null; p.mood = Math.max(0, p.mood - 0.35);
        sim.stats.walkouts++; sim.fx.push({ kind: 'storm', x: p.x, y: p.y - 1.5, t: 0, life: 1.8 });
        emit('walkout', { name: C.STORES[u.store].name });
        leaveStore(p, u);
      }
      break;
    }
    case 'leave':
      if (runPath(p, dt)) p.state = 'decide';
      break;
    case 'toSeat': {
      dropLitter(p, def);
      if (walkTo(p, p.seatAccess.x, p.seatAccess.y, dt)){ p.exit = [p.seat]; p.state = 'seatIn'; }
      break;
    }
    case 'seatIn':
      if (runPath(p, dt)){ p.state = 'sit'; p.timer = 3 + rand() * 3; }
      break;
    case 'sit':
      p.walking = false;
      if ((p.timer -= dt) <= 0){ p.mood = Math.min(1, p.mood + 0.08); p.state = 'decide'; p.wishes = []; p.rested = true; }
      break;
    case 'exit': {
      dropLitter(p, def);
      const ex = C.ENTRANCE.x + 0.5 + (p.id % 2), ey = C.MAP_H - 0.5;
      if (walkTo(p, ex, ey, dt, sim.phase === 'closing' ? 1.6 : 1)){ p.state = 'out'; }
      break;
    }
    case 'out':
      if (moveDirect(p, p.x, C.MAP_H + 1.8, dt, sim.phase === 'closing' ? 1.6 : 1)){
        p.gone = true; sim.stats.moodSum += p.mood; sim.stats.moodN++;
      }
      break;
  }
}
function decide(p){
  if (sim.phase === 'closing'){ p.state = 'exit'; return; }
  while (p.wishes.length){
    const want = p.wishes.shift();
    const options = stores(S.save).filter(u => u.store === want);
    if (!options.length){
      setBubble(p, C.STORES[want].icon, 'wish', 2.2);
      sim.stats.wishes[want] = (sim.stats.wishes[want] || 0) + 1;
      p.mood = Math.max(0, p.mood - 0.03);
      emit('greyWish', { store: want });
      // Sometimes they settle for something else while they're here.
      const any = stores(S.save);
      if (any.length && rand() < 0.5) p.wishes.push(pick(any).store);
      p.state = 'pause'; p.timer = 1.0; return;
    }
    let best = options[0], bd = Infinity;
    for (const u of options){ const a = spotsFor(u).front, d = Math.hypot(a.x - p.x, a.y - p.y) + storeInfo(u).queue.length * 1.5; if (d < bd){ bd = d; best = u; } }
    p.storeId = best.id; p.state = 'toStore'; return;
  }
  if (!p.rested && rand() < 0.3){
    const seat = findSeat(p);
    if (seat){ p.seat = seat.spot; p.seatAccess = seat.access; p.state = 'toSeat'; return; }
  }
  p.state = 'exit';
}
function findSeat(p){
  const opts = [];
  for (const d of S.save.decor) if (d.type === 'bench'){ const a = benchAccess(d); if (isWalk(a.x, a.y)) opts.push({ access: { x: a.x + 0.5, y: a.y + 0.5 }, spot: { x: d.x + 0.5 + rand() * 0.8, y: d.y + 0.62 } }); }
  if (S.save.fountain) for (const f of fountainSpots()) opts.push({ access: { x: f.x + 0.5, y: f.y + 0.5 }, spot: { x: f.x + 0.5 + (rand() - 0.5) * 0.3, y: f.y + 0.5 } });
  return opts.length ? pick(opts) : null;
}
function leaveStore(p, u){
  p.bubble = p.bubble && p.bubble.kind === 'want' ? null : p.bubble;
  p.served = false;
  if (!u || u.kiosk){ p.state = 'decide'; return; }
  p.exit = exitPath(u, p); p.state = 'leave';
}
function decorNear(x, y){
  let n = 0;
  for (const d of S.save.decor) if (d.type !== 'bin' && Math.abs(d.x + 0.5 - x) < 3 && Math.abs(d.y + 0.5 - y) < 3) n++;
  if (S.save.fountain && Math.abs(C.FOUNTAIN.x + 1 - x) < 4 && Math.abs(C.FOUNTAIN.y + 1 - y) < 4) n += 2;
  return n;
}
function binNear(x, y){
  let best = null, bd = C.BIN_RADIUS;
  for (const d of S.save.decor) if (d.type === 'bin'){ const dd = Math.hypot(d.x + 0.5 - x, d.y + 0.5 - y); if (dd < bd){ bd = dd; best = d; } }
  return best;
}
function dropLitter(p, def){
  if (p.litterAcc < 3) return;
  p.litterAcc = 0;
  if (sim.trash.length >= C.MAX_TRASH || sim.phase !== 'day' || sim.clockFrozen) return;
  const chance = def.litter * C.LITTER_SCALE * (p.boughtFood ? 2.2 : 1) * (sim.boost === 'clean' ? 0.6 : 1);
  if (rand() >= chance) return;
  const kind = pick(p.trashKinds || ['paper', 'can', 'banana']);
  // A trash can nearby? Most people use it, and you can see them toss it in.
  const bin = binNear(p.x, p.y);
  if (bin && rand() < C.BIN_USE){
    sim.fx.push({ kind: 'toss', x: p.x, y: p.y - 0.5, tx: bin.x + 0.5, ty: bin.y + 0.3, trash: kind, t: 0, life: 0.55 });
    emit('binned');
    return;
  }
  const spot = litterSpot(p.x, p.y, rand);
  if (!spot || sim.trash.some(t => Math.hypot(t.x - spot.x, t.y - spot.y) < 0.45)) return;
  sim.trash.push({ id: sim.nextId++, x: spot.x, y: spot.y, kind, t: 0 });
  emit('trash');
}
export function addTrash(x, y, kind = 'bag'){
  const tr = { id: sim.nextId++, x, y, kind, t: 0 };
  sim.trash.push(tr); return tr;
}

/* ---------- Sales ---------- */
function updateStores(dt){
  for (const u of stores(S.save)){
    const st = storeInfo(u);
    const server = st.server && personById(st.server);
    if (!server || server.atRegisterId !== u.id){ st.serveT = 0; const f = st.queue.length && personById(st.queue[0]); if (f) f.served = false; continue; }
    const front = st.queue.length && personById(st.queue[0]);
    if (front) front.served = false;
    if (!front || front.state !== 'queue'){ st.serveT = 0; continue; }
    const spot = queueSpot(u, 0);
    if (Math.hypot(front.x - spot.x, front.y - spot.y) > 0.2){ st.serveT = 0; continue; }
    front.served = true;
    st.serveT += dt;
    const need = server.kind === 'owner' ? C.OWNER_SERVE : C.CLERK_SERVE[server.skill] * (server.dream === u.store ? C.DREAM_SERVE : 1);
    server.serving = st.serveT / need;
    if (st.serveT >= need){ st.serveT = 0; server.serving = 0; completeSale(u, st, front); }
  }
}
function completeSale(u, st, p){
  const def = C.STORES[u.store], cdef = C.CUSTOMERS[p.type];
  let price = lerp(def.price[0], def.price[1], rand()) * cdef.spend;
  if (sim.boost === 'price') price *= 1.1;
  const server = st.server && personById(st.server);
  if (server && server.kind === 'staff' && server.dream === u.store) price *= C.DREAM_SPEND;
  price = Math.max(1, Math.round(price));
  S.save.money += price;
  sim.stats.revenue += price; sim.stats.served++;
  sim.stats.byStore[u.id] = (sim.stats.byStore[u.id] || 0) + price;
  sim.stats.waitFrac += 1 - p.patience / p.patienceMax; sim.stats.waitN++;
  u.stock = Math.max(0, u.stock - 1);
  p.mood = Math.min(1, p.mood + 0.12 + 0.2 * (p.patience / p.patienceMax));
  if (def.cat === 'Food') p.boughtFood = true;
  p.trashKinds = TRASH_FROM[u.store] || p.trashKinds;
  st.queue.shift();
  p.bubble = null; p.served = false;
  sim.fx.push({ kind: 'coin', x: p.x, y: p.y - 1.3, t: 0, life: 1.1, text: `+$${price}` });
  if (p.mood > 0.75) sim.fx.push({ kind: 'heart', x: p.x + 0.2, y: p.y - 1.2, t: 0, life: 1.2 });
  emit('sale', { amount: price, store: u.store, tutorial: !!p.tutorial });
  leaveStore(p, u);
}

// What people leave behind after shopping at each store.
const TRASH_FROM = {
  pretzel: ['bag', 'wrapper'], candy: ['wrapper', 'lolly'], coffee: ['cup'], arcade: ['can', 'popcorn'],
  dollar: ['paper', 'bag'], boutique: ['paper'], pets: ['paper', 'bag'], books: ['paper', 'cup'],
};

/* ---------- Owner and jobs ---------- */
export function jobKey(j){ return j.type + ':' + (j.unitId || j.trashId || ''); }
export function addJob(job){
  const k = jobKey(job), i = sim.jobs.findIndex(j => jobKey(j) === k);
  if (i >= 0){ if (i > 0 || !sim.jobs[0].started){ sim.jobs.splice(i, 1); return 'removed'; } return 'busy'; }
  if (sim.jobs.length >= C.MAX_JOBS) return 'full';
  sim.jobs.push(job);
  return 'added';
}
function leaveRegister(p){
  if (p.atRegisterId == null) return true;
  const u = S.save.units.find(v => v.id === p.atRegisterId);
  const st = u && storeInfo(u);
  if (st && st.server === p.id) st.server = null;
  p.atRegisterId = null;
  if (u){
    if (u.kiosk){ const a = kioskStaffAccess(u); p.exit = [{ x: a.x + 0.5, y: a.y + 0.5 }]; }
    else { const sp = spotsFor(u); p.exit = [...sp.staffPath].reverse().slice(1).concat([sp.front]); }
  }
  return false;
}
function updateOwner(p, dt){
  p.t += dt;
  if (p.broomT > 0){ p.broomT -= dt; p.walking = false; if (p.broomT <= 0) finishClean(p); return; }
  const job = sim.jobs[0];
  if (!job){ p.walking = false; return; }
  if (!job.started){ job.started = true; leaveRegister(p); }
  if (!runPath(p, dt)) return;
  if (job.type === 'register'){
    const u = S.save.units.find(v => v.id === job.unitId);
    if (!u || u.state !== 'store'){ sim.jobs.shift(); return; }
    const st = storeInfo(u);
    const clerk = st.server && personById(st.server);
    if (clerk && clerk.kind === 'staff'){ sim.jobs.shift(); emit('toast', { text: 'A clerk already has that register' }); return; }
    if (!job.inside){
      const a = u.kiosk ? kioskStaffAccess(u) : unitAccess(u);
      if (!walkTo(p, a.x + 0.5, a.y + 0.5, dt)) return;
      const sp = spotsFor(u);
      p.exit = u.kiosk ? [sp.staff] : [...sp.staffPath];
      job.inside = true;
      return;
    }
    p.atRegisterId = u.id; st.server = p.id; p.walking = false;
    sim.jobs.shift();
    emit('atRegister', { unitId: u.id });
  } else if (job.type === 'clean'){
    const tr = sim.trash.find(t => t.id === job.trashId);
    if (!tr){ sim.jobs.shift(); return; }
    if (!walkTo(p, tr.x, tr.y + 0.15, dt)) return;
    p.broomT = C.OWNER_CLEAN; p.cleanTarget = tr.id;
  } else if (job.type === 'wish'){
    const spots = fountainSpots();
    const f = spots[0] || { x: C.FOUNTAIN.x, y: C.FOUNTAIN.y + 2 };
    if (!walkTo(p, f.x + 0.5, f.y + 0.4, dt)) return;
    sim.jobs.shift(); tossCoin();
  }
}
function finishClean(p){
  const tr = sim.trash.find(t => t.id === p.cleanTarget);
  const x = tr ? tr.x : p.x, y = tr ? tr.y : p.y;
  const before = sim.trash.length;
  sim.trash = sim.trash.filter(t => Math.hypot(t.x - x, t.y - y) > 0.7);
  sim.fx.push({ kind: 'sparkle', x, y: y - 0.2, t: 0, life: 0.7 });
  if (sim.jobs[0] && sim.jobs[0].type === 'clean') sim.jobs.shift();
  emit('cleaned', { count: before - sim.trash.length, by: p.kind });
}
function tossCoin(){
  sim.wishCoin = false;
  const boosts = [
    ['patience', 'Folks are extra patient today'],
    ['buy', 'Shoppers are in a spending mood'],
    ['clean', 'People are minding their litter today'],
    ['price', 'Everything sells for a little more today'],
  ];
  const [b, text] = pick(boosts);
  sim.boost = b;
  sim.fx.push({ kind: 'sparkle', x: C.FOUNTAIN.x + 1, y: C.FOUNTAIN.y + 0.6, t: 0, life: 1.2 });
  emit('wish', { text: `Rose's penny: ${text}.` });
}

/* ---------- Staff ---------- */
function updateStaff(p, dt){
  p.t += dt;
  if (p.role === 'clerk'){
    if (p.storeId){ p.atRegisterId = p.storeId; p.walking = false; }
    return;
  }
  if (p.broomT > 0){
    p.broomT -= dt; p.walking = false;
    if (p.broomT <= 0){
      const tr = sim.trash.find(t => t.id === p.target);
      if (tr){ sim.trash = sim.trash.filter(t => t !== tr); sim.fx.push({ kind: 'sparkle', x: tr.x, y: tr.y - 0.2, t: 0, life: 0.6 }); emit('cleaned', { count: 1, by: 'staff' }); }
      p.target = null;
    }
    return;
  }
  let tr = p.target && sim.trash.find(t => t.id === p.target);
  if (!tr){
    p.target = null;
    const claimed = new Set(sim.people.filter(q => q.role === 'janitor' && q !== p).map(q => q.target));
    if (sim.owner && sim.owner.cleanTarget) claimed.add(sim.owner.cleanTarget);
    // Janitors only notice trash near them, so one janitor can't be everywhere at once.
    let bd = C.JANITOR_SIGHT;
    for (const t of sim.trash){ if (claimed.has(t.id)) continue; const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < bd){ bd = d; tr = t; } }
    if (tr){ p.target = tr.id; p.wander = null; }
  }
  if (tr){
    if (walkTo(p, tr.x, tr.y + 0.15, dt)) p.broomT = p.cleanTime;
    return;
  }
  // Nothing to clean: patrol. With more than one janitor, each keeps to their own slice of the mall.
  if (!p.wander || (p.wander.wait -= dt) < -6){
    const crew = sim.people.filter(q => q.role === 'janitor'), i = crew.indexOf(p), n = crew.length;
    const x0 = Math.floor(C.MAP_W * i / n), x1 = Math.floor(C.MAP_W * (i + 1) / n);
    for (let k = 0; k < 40; k++){
      const x = x0 + Math.floor(rand() * (x1 - x0)), y = Math.floor(rand() * C.MAP_H);
      if (isWalk(x, y)){ p.wander = { x: x + 0.5, y: y + 0.5, wait: 0 }; break; }
    }
  }
  if (p.wander && walkTo(p, p.wander.x, p.wander.y, dt, 0.6)){ p.walking = false; p.wander.wait -= dt; }
}

/* ---------- Gus ---------- */
function updateGus(p, dt){
  p.t += dt;
  if (p.state === 'stand' || p.state === 'chat'){ p.walking = false; return; }
  if (p.pickT > 0){ p.pickT -= dt; p.walking = false; return; }
  // Old habits: he picks up a little litter he passes, never much.
  if (p.picked < 4 && p.state === 'lap'){
    const tr = sim.trash.find(t => Math.hypot(t.x - p.x, t.y - p.y) < 0.6);
    if (tr){ sim.trash = sim.trash.filter(t => t !== tr); p.picked++; p.pickT = 0.8; sim.stats.gusTrash++; sim.fx.push({ kind: 'sparkle', x: tr.x, y: tr.y - 0.2, t: 0, life: 0.6 }); return; }
  }
  if (p.state === 'arrive'){ if (moveDirect(p, p.x, C.MAP_H - 0.6, dt)) p.state = 'lap'; return; }
  if (p.state === 'lap'){
    const w = p.route[p.lap];
    if (!w){ p.state = S.save.fountain ? 'toFountain' : 'leave'; p.timer = 14; return; }
    if (walkTo(p, w.x, w.y, dt)) p.lap++;
    return;
  }
  if (p.state === 'toFountain'){
    const f = fountainSpots()[1] || fountainSpots()[0];
    if (!f || walkTo(p, f.x + 0.5, f.y + 0.4, dt)){ p.walking = false; if ((p.timer -= dt) <= 0) p.state = 'leave'; }
    return;
  }
  if (p.state === 'leave'){
    if (walkTo(p, C.ENTRANCE.x + 1.5, C.MAP_H - 0.5, dt)) p.state = 'out';
    return;
  }
  if (p.state === 'out'){ if (moveDirect(p, p.x, C.MAP_H + 1.8, dt)) p.gone = true; return; }
  if (p.state === 'walkTo'){ if (walkTo(p, p.goal.x, p.goal.y, dt)){ p.state = 'stand'; p.walking = false; } }
}

// At night only Gus moves (when he drops by after closing).
export function stepGus(dt){
  const g = sim.gus; if (!g) return;
  updateGus(g, Math.min(0.05, dt));
  if (g.gone){ sim.people = sim.people.filter(p => p !== g); sim.gus = null; }
}

/* ---------- Main step ---------- */
export function step(realDt){
  if (sim.phase !== 'day' && sim.phase !== 'closing') return;
  if (sim.paused) return;
  const dt = Math.min(0.05, realDt) * sim.speed;
  if (sim.phase === 'day' && !sim.clockFrozen){
    sim.t += dt;
    if (sim.spawning) while (sim.spawnIdx < sim.spawnTimes.length && sim.spawnTimes[sim.spawnIdx] <= sim.t){ spawnCustomer(); sim.spawnIdx++; }
    if (sim.wishCoin && clockHour() >= C.OPEN_HOUR + 2) sim.wishCoin = false;
    if ((sim.stats.sampleT += dt) > 2){ sim.stats.sampleT = 0; sim.stats.dirtSum += sim.trash.length; sim.stats.dirtN++; }
    if (sim.t >= C.DAY_SECONDS) beginClosing();
  }
  if (sim.phase === 'closing'){
    sim.closeT += dt;
    const left = sim.people.some(p => p.kind === 'customer');
    if (!left || sim.closeT > 10) sim.phase = 'done';
  }
  for (const p of sim.people){
    if (p.kind === 'customer') updateCustomer(p, dt);
    else if (p.kind === 'owner') updateOwner(p, dt);
    else if (p.kind === 'staff') updateStaff(p, dt);
    else if (p.kind === 'gus') updateGus(p, dt);
  }
  if (sim.phase === 'day') updateStores(dt);
  sim.people = sim.people.filter(p => !p.gone);
  for (const tr of sim.trash) tr.t += dt;
  for (const f of sim.fx) f.t += dt;
  sim.fx = sim.fx.filter(f => f.t < f.life);
  if (sim.gus && sim.gus.gone) sim.gus = null;
}
function beginClosing(){
  sim.phase = 'closing'; sim.t = C.DAY_SECONDS; sim.closeT = 0;
  for (const st of sim.storeState.values()) st.queue = [];
  for (const p of sim.people) if (p.kind === 'customer'){
    p.bubble = null; p.served = false;
    if (['enter', 'browse', 'queue', 'leave'].includes(p.state)){
      const u = S.save.units.find(v => v.id === p.storeId);
      if (u && !u.kiosk){ p.exit = exitPath(u, p); p.state = 'leave'; } else p.state = 'exit';
    } else if (p.state === 'sit' || p.state === 'seatIn'){ p.state = 'exit'; }
    else if (p.state !== 'out') p.state = 'exit';
  }
  sim.jobs = [];
  emit('closing');
}

// Tutorial hooks
export function spawnTutorialCustomer(storeType){
  sim.tutorialHold = true;
  const p = spawnCustomer('walker', storeType);
  p.tutorial = true;
  return p;
}
export function releaseTutorial(){ sim.tutorialHold = false; sim.clockFrozen = false; sim.spawning = true; }

/* ---------- End-of-day report ---------- */
export function buildReport(){
  const s = S.save, st = sim.stats;
  for (const p of sim.people) if (p.kind === 'customer'){ st.moodSum += p.mood; st.moodN++; }
  const open = stores(s);
  const wages = s.staff.reduce((a, m) => a + wageOf(m), 0);
  const utilities = C.UTILITIES_BASE + C.UTILITIES_PER_STORE * open.length;
  // Restock every store overnight.
  let restockWanted = 0;
  const needs = open.map(u => { const def = C.STORES[u.store], n = def.stock - u.stock, cost = n * (def.price[0] + def.price[1]) / 2 * C.RESTOCK_RATE; restockWanted += cost; return { u, n, cost }; });
  const afterFixed = s.money - wages - utilities;
  const frac = restockWanted <= 0 ? 1 : Math.max(0, Math.min(1, afterFixed / restockWanted));
  let restock = 0;
  for (const nd of needs){ const add = Math.floor(nd.n * frac); nd.u.stock += add; restock += add / Math.max(1, nd.n) * nd.cost; }
  restock = Math.round(restock);
  s.money -= wages + utilities + restock;
  const walk = Math.max(20, map.walkCount);
  const avgDirt = st.dirtN ? st.dirtSum / st.dirtN : 0;
  const clean = clamp(5 - avgDirt / (walk / 40) * 1.4 - sim.trash.length * 0.06, 1, 5);
  const total = st.served + st.walkouts;
  const rate = total ? st.served / total : 1;
  const waitF = st.waitN ? st.waitFrac / st.waitN : 0;
  const service = total ? clamp(1 + 4 * rate - 1.4 * waitF, 1, 5) : 3;
  const types = new Set(open.map(u => u.store)).size;
  const variety = clamp(1 + (types - 1) * 0.8, 1, 5);
  const derelict = s.units.filter(u => u.state === 'derelict').length;
  const dusty = C.ZONES.filter(z => !s.zones[z.id]).length;
  const decorPts = s.decor.reduce((a, d) => a + C.DECOR[d.type].ambience, 0) + (s.fountain ? C.FOUNTAIN.ambience : 0);
  const ambience = clamp(1.6 + (decorPts + open.length * 1.5 - derelict * 0.55 - dusty * 1.2) / 6, 1, 5);
  const happy = st.moodN ? st.moodSum / st.moodN : 0.6;
  const overall = (clean + service + variety + ambience) / 4 * 0.85 + happy * 5 * 0.15;
  const grade = overall >= 4.6 ? 'S' : overall >= 3.9 ? 'A' : overall >= 3.1 ? 'B' : overall >= 2.3 ? 'C' : 'D';
  s.ratingHist.push(overall); if (s.ratingHist.length > 5) s.ratingHist.shift();
  s.rating = s.ratingHist.reduce((a, b) => a + b, 0) / s.ratingHist.length;
  const levelBefore = s.level;
  const xpGain = Math.round(st.revenue * 0.4 + st.served * 1.2 + happy * 20);
  const gained = addXp(xpGain);
  const top = Object.entries(st.byStore).sort((a, b) => b[1] - a[1])[0];
  const topUnit = top && s.units.find(u => u.id === +top[0]);
  const wishes = Object.entries(st.wishes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => ({ store: k, name: C.STORES[k].name, n }));
  const report = {
    day: s.day, visitors: st.visitors, visitorsDelta: s.stats.lastVisitors ? st.visitors - s.stats.lastVisitors : 0,
    served: st.served, walkouts: st.walkouts, revenue: st.revenue, wages, utilities, restock,
    profit: st.revenue - wages - utilities - restock,
    ratings: { clean, service, variety, ambience }, happy, overall, grade, rating: s.rating,
    xpGain, levelBefore, levelAfter: s.level, gained,
    wishes, top: topUnit ? { name: C.STORES[topUnit.store].name, amount: top[1] } : null,
    restockShort: frac < 1, gusTrash: st.gusTrash,
  };
  s.stats.visitors += st.visitors; s.stats.served += st.served; s.stats.revenue += st.revenue; s.stats.lastVisitors = st.visitors;
  return report;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Lines Gus says when tapped during a visit.
export const GUS_LINES = [
  "Morning laps. Doc says they're good for the ticker.",
  "Used to wax this whole concourse every Tuesday.",
  "Don't let the pigeons see you eat.",
  "Your grandma would've liked that new sign.",
  "Gum. Always gum. Some things never change.",
  "Just checking for leaks. Habit.",
  "Smells like pretzels again. That's a good sign.",
  "Place is getting loud. I missed that.",
];
