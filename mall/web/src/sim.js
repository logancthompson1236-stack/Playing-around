// The day simulation. Pure logic: no drawing, no DOM. The renderer reads `sim`, the UI reads `sim.events`.
import * as C from './config.js';
import { S, stores, addXp, staffSkill, wageOf } from './state.js';
import { map, isWalk, nextStep, unitAccess, kioskStaffAccess, decorAccess, fountainSpots, idx, GW, litterSpot } from './map.js';
import { storeSpots, kioskSpots, mulberry, local, restroomSpots, attractionSpots, dineSpots } from './art.js';

export const sim = {
  t: 0, phase: 'idle', speed: 1, paused: false, clockFrozen: false, spawning: true,
  people: [], trash: [], fx: [], events: [],
  owner: null, jobs: [], spawnTimes: [], spawnIdx: 0, nextId: 1,
  stats: null, boost: null, gus: null, wishCoin: false, closeT: 0,
  storeState: new Map(),   // unit id -> { queue: [], server: null, serveT: 0, soldOut: false }
  rooms: new Map(),        // restroom unit id -> { dirt: 0–100, claimed: person id }
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
  switch (role){
    case 'janitor': return { ...base, hairStyle: 'cap', acc: '#3a9e95', shirt: '#3a9e95', patch: true };
    case 'stocker': return { ...base, hairStyle: 'cap', acc: '#8a5a44', shirt: '#c98b55', apron: '#7a5a44' };
    case 'greeter': return { ...base, shirt: '#ef476f', badge: true };
    case 'supervisor': return { ...base, hairStyle: p(['short', 'bun']), shirt: '#3d405b', pants: '#2b2d42', glasses: true, clipboard: true };
    case 'guard': return { ...base, hairStyle: 'cap', acc: '#1d3557', shirt: '#1d3557', pants: '#2b2d42', badge: true };
    case 'mascot': return { costume: 'sun' };
    default: return { ...base, shirt: '#ff8fab', apron: '#fff6ea' };
  }
}

/* ---------- Store helpers ---------- */
export function storeInfo(u){
  let st = sim.storeState.get(u.id);
  if (!st){ st = { queue: [], server: null, serveT: 0, soldOut: false, seats: isAttraction(u) ? spotsFor(u).seats.map(() => null) : null }; sim.storeState.set(u.id, st); }
  return st;
}
export const isAttraction = u => u.state === 'store' && !!C.STORES[u.store].attraction;
export function spotsFor(u){ return u.kiosk ? kioskSpots(u) : isAttraction(u) ? attractionSpots(u, C.STORES[u.store]) : storeSpots(u); }
export function roomInfo(u){
  let r = sim.rooms.get(u.id);
  // stalls: who's headed for or using each stall; inside: whether they've stepped in (that's when the door shuts).
  if (!r){ const n = restroomSpots(u).stalls.length; r = { dirt: 0, claimed: null, stalls: Array(n).fill(null), inside: Array(n).fill(false) }; sim.rooms.set(u.id, r); }
  return r;
}
// Where the k-th person waiting for a stall stands: the doorway, two spots inside by the door, then outside along the front.
function restroomWaitSpot(u, k){
  const d = spotsFor(u), sp = restroomSpots(u);
  if (k === 0) return d.door;
  if (k < 3){ const a = sp.aisle(k === 1 ? sp.sinkY + 0.45 : sp.sinkY - 0.15); return { x: Math.min(u.x + u.w - 0.4, a.x + 0.8), y: a.y }; }
  const n = k - 2, side = n % 2 ? -1 : 1;
  return { x: d.front.x + side * 0.7 * Math.ceil(n / 2), y: d.front.y + 0.15 };
}
function freeStall(p){ for (const r of sim.rooms.values()) r.stalls.forEach((id, i) => { if (id === p.id){ r.stalls[i] = null; r.inside[i] = false; } }); }
const restrooms = () => S.save.units.filter(u => u.state === 'restroom');
// What shoppers walk out holding. Food and drinks get finished after a while; bags and boxes go home.
const HOLD_FROM = {
  pretzel: 'pretzel', candy: 'lolly', coffee: 'coffee', scoops: 'cone', arcade: 'plush', books: 'book', music: 'record', gadgets: 'gadget',
  dollar: ['bag', '#ffd23f'], boutique: ['bag', '#ff8fab'], pets: ['bag', '#06a77d'],
  toys: 'toy', perfume: ['bag', '#c77dff'], gaming: 'game', shoes: 'shoebox', burger: 'burger',
};
const SNACKS = new Set(['pretzel', 'lolly', 'coffee', 'cone', 'can', 'gum', 'burger']);
// Claw machine prizes: a random plush, about one try in three.
const PRIZES = [{ kind: 'bear', color: '#e0a96d' }, { kind: 'bunny', color: '#ffd6e0' }, { kind: 'duck', color: '#ffd23f' }, { kind: 'alien', color: '#7bd389' }, { kind: 'dino', color: '#5cc8bf' }, { kind: 'bear', color: '#ff8fab' }];
const CLAW_WIN = 0.32;
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
  sim.storeState.clear(); sim.rooms.clear();
  sim.clockFrozen = !!opts.tutorial; sim.spawning = !opts.tutorial;
  sim.boost = null; sim.wishCoin = !!s.fountain;
  sim.stats = { troubleT: 0, scared: 0, shooed: 0, troubles: 0, visitors: 0, served: 0, walkouts: 0, revenue: 0, byStore: {}, wishes: {}, waitFrac: 0, waitN: 0, dirtSum: 0, dirtN: 0, moodSum: 0, moodN: 0, sampleT: 0, stockouts: {}, gusTrash: 0, machines: 0, restockDay: 0, roomDirtSum: 0, roomDirtN: 0 };
  const open = stores(s);
  const rating = s.ratingHist.length ? s.rating : 1;
  const ambience = s.decor.length * 0.5 + (s.fountain ? 3 : 0);
  // Each store draws a crowd, a little less once the mall is big. Mascots pull in extra.
  const draw = open.length <= 10 ? 8 * open.length : 80 + 5 * (open.length - 10);
  const mascots = s.staff.filter(m => m.role === 'mascot').reduce((a, m) => a + staffSkill(m), 0);
  const [t0, t1, cut] = C.VISITOR_TAPER, taper = 1 - cut * clamp((s.level - t0) / (t1 - t0), 0, 1);
  let V = (12 + draw + ambience) * (0.6 + 0.22 * rating) * (0.9 + rand() * 0.2) * C.VISITOR_SCALE * (1 + 0.06 * mascots) * taper;
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
  planTrouble(opts.tutorial);
}
function makePerson(kind, look, x, y){
  return { id: sim.nextId++, kind, look, x, y, t: rand() * 10, walking: false, flip: false, state: 'idle', timer: 0, speed: 1.4 };
}
function spawnStaff(st){
  const p = makePerson('staff', st.look, C.ENTRANCE.x + 1, C.MAP_H - 2.5);
  const k = staffSkill(st);
  p.role = st.role; p.staffId = st.id; p.name = st.name; p.skill = k; p.dream = st.dream || null;
  p.speed = st.role === 'janitor' ? C.JANITOR_SPEED[k] : st.role === 'stocker' ? C.STOCKER_SPEED[k] : st.role === 'mascot' ? 1.0 : st.role === 'supervisor' ? 1.7 : C.STAFF_SPEED; p.cleanTime = C.JANITOR_CLEAN[k];
  p.baseSpeed = p.speed;
  if (st.role === 'greeter'){ const g = greeterPost(); p.x = g.x; p.y = g.y; }
  p.workT = nextBreak(k);
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
  // Gus's old laps: up the entrance hall, then back and forth along the concourse.
  const cy = C.CONCOURSE.y, far = C.MAP_W - 1.5;
  g.route = [{ x: C.ENTRANCE.x + 0.5, y: cy + C.CONCOURSE.h + 0.5 }, { x: 1.5, y: cy + 1.5 }, { x: far, y: cy + 0.5 }, { x: 1.5, y: cy + 0.5 }, { x: far, y: cy + 2.5 }];
  sim.gus = g; sim.people.push(g);
  return g;
}

// Seconds of work until the next phone break (never, for three-star staff).
function nextBreak(k){ const r = C.BREAK_EVERY[k]; return r ? lerp(r[0], r[1], rand()) : Infinity; }
function startBreak(p){
  p.breakMax = p.breakT = C.BREAK_LENGTH[p.skill]; p.slacking = true; p.walking = false;
  p.target = null; p.carry = false; p.roomTarget = null;
  for (const r of sim.rooms.values()) if (r.claimed === p.id) r.claimed = null;
  emit('slack', { name: p.name, role: p.role });
}
export function backToWork(p, nudged = false){
  p.breakT = 0; p.slacking = false; p.workT = nextBreak(p.skill);
  if (nudged){ sim.fx.push({ kind: 'coin', x: p.x, y: p.y - 1.4, t: 0, life: 1.1, text: 'Back to work!' }); emit('nudged', { name: p.name }); }
}
// The greeter stands just inside the doors, off to the side.
const greeterPost = () => ({ x: C.ENTRANCE.x - 0.45, y: C.MAP_H - 1.3 });

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
    const browsers = 1 + 0.75 * clamp((S.save.level - C.WINDOW_SHOP[0]) / (C.WINDOW_SHOP[1] - C.WINDOW_SHOP[0]), 0, 1);
    const entries = Object.entries(C.CUSTOMERS).map(([k, d]) => [k, d.weight * (h >= d.hours[0] && h < d.hours[1] ? 1 : 0.2) * (k === 'browser' ? browsers : 1)]);
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
  const extra = S.save.decor.some(d => d.type === 'directory') && rand() < 0.3 ? 1 : 0;
  const n = (type === 'browser' ? 2 + (rand() < 0.5 ? 1 : 0) : 1 + (rand() < 0.6 ? 1 : 0) + (rand() < 0.15 ? 1 : 0)) + extra;
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
  // Snacks and drinks get finished after a while (the wrapper is what ends up on the floor).
  if (p.holding && SNACKS.has(p.holding) && (p.holdT = (p.holdT || 0) + dt) > 14) p.holding = null;
  switch (p.state){
    case 'arrive':
      if (moveDirect(p, p.x, C.MAP_H - 0.5, dt)){ greet(p); p.state = 'decide'; }
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
        if (isAttraction(u)){ const st = storeInfo(u); st.queue.push(p.id); p.state = 'line'; p.patienceMax = p.patience = C.BASE_PATIENCE * def.patience * 1.4 * (p.patienceMul || 1); break; }
        if (u.kiosk){ p.state = 'browse'; p.timer = 0.8 + rand() * 0.8; }
        else { const sp = spotsFor(u); const b = u.store === 'arcade' ? arcadeSpot(u) : pick(sp.browse); p.exit = [sp.door, { x: b.x + (rand() - 0.5) * 0.2, y: b.y + (rand() - 0.5) * 0.2 }]; p.state = 'enter'; }
      }
      break;
    }
    case 'enter':
      if (runPath(p, dt)){
        p.state = 'browse'; p.timer = 1.6 + rand() * 2.2;
        // At the arcade they play a game or two first, back to us, facing the cabinet.
        const u = S.save.units.find(v => v.id === p.storeId);
        if (u && u.store === 'arcade'){ p.playing = true; p.faceBack = u.face === 'down'; p.timer = 3 + rand() * 2.5; }
      }
      break;
    case 'browse': {
      p.walking = false;
      if ((p.timer -= dt) > 0) break;
      p.playing = false; p.faceBack = false;
      const u = S.save.units.find(v => v.id === p.storeId);
      if (!u || u.state !== 'store'){ leaveStore(p, u); break; }
      if (u.stock <= 0){
        setBubble(p, 'empty', 'info', 1.6); p.mood -= 0.08;
        if (!sim.stats.stockouts[u.id]){ sim.stats.stockouts[u.id] = true; emit('stockout', { name: C.STORES[u.store].name }); }
        leaveStore(p, u); break;
      }
      // Bigger, busier malls draw more people who are just looking.
      const [w0, w1, wcut] = C.WINDOW_SHOP, picky = 1 - wcut * clamp((S.save.level - w0) / (w1 - w0), 0, 1);
      const chance = def.buy * (0.7 + 0.6 * p.mood) * (sim.boost === 'buy' ? 1.15 : 1) * picky;
      if (p.tutorial || rand() < chance){
        const st = storeInfo(u); st.queue.push(p.id);
        p.state = 'queue'; p.patienceMax = C.BASE_PATIENCE * def.patience * (sim.boost === 'patience' ? 1.3 : 1) * (p.patienceMul || 1); p.patience = p.patienceMax;
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
      // Once at the door they carry on to the spot (the door sits just inside, so without this they'd turn back).
      let goal = spot;
      const crossing = !u.kiosk && insideUnit(u, p.x, p.y) !== insideUnit(u, spot.x, spot.y);
      if (!crossing) p.viaDoor = false;
      else if (!p.viaDoor){
        const door = spotsFor(u).door;
        if (Math.hypot(door.x - p.x, door.y - p.y) > 0.12) goal = door; else p.viaDoor = true;
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
    case 'toDine':
      if (runPath(p, dt)){ const u = S.save.units.find(v => v.id === p.storeId); p.state = 'dine'; p.timer = 7 + rand() * 5; p.holdT = 0; if (u) p.flip = dineSpots(u).seats[p.dineSeat].flip; }
      break;
    case 'dine': {
      p.walking = false; p.holdT = 0;
      if ((p.timer -= dt) > 0) break;
      const u = S.save.units.find(v => v.id === p.storeId);
      stopDining(p, u); p.holding = null; p.mood = Math.min(1, p.mood + 0.08);
      leaveStore(p, u);
      break;
    }
    case 'toSeat': {
      dropLitter(p, def);
      if (walkTo(p, p.seatAccess.x, p.seatAccess.y, dt)){ p.exit = [p.seat]; p.state = 'seatIn'; }
      break;
    }
    case 'seatIn':
      if (runPath(p, dt)){
        p.state = 'sit'; p.timer = (3 + rand() * 3) * (p.seat.comfy ? 1.5 : 1);
        if (p.seat.flip !== undefined) p.flip = p.seat.flip;
        p.faceBack = !!p.seat.back;
      }
      break;
    case 'sit':
      p.walking = false;
      if ((p.timer -= dt) <= 0){ p.mood = Math.min(1, p.mood + (p.seat.comfy ? 0.14 : 0.08)); p.faceBack = false; p.state = 'decide'; p.wishes = []; p.rested = true; }
      break;
    case 'toMachine': {
      dropLitter(p, def);
      const a = p.machineAt;
      if (walkTo(p, a.x, a.y, dt)){ p.state = 'useMachine'; p.timer = C.DECOR[p.machine.type].coin.secs * (0.8 + rand() * 0.4); p.flip = p.machine.x + 0.5 < p.x; }
      break;
    }
    case 'useMachine':
      p.walking = false;
      if ((p.timer -= dt) <= 0){ useMachine(p); p.state = 'decide'; }
      break;
    case 'line': {
      // Waiting outside an attraction. The front of the line gets the next free seat (and buys a ticket).
      const u = S.save.units.find(v => v.id === p.storeId);
      const st = u && isAttraction(u) && storeInfo(u);
      if (!st){ p.state = 'decide'; break; }
      const i = st.queue.indexOf(p.id), spot = queueSpot(u, i);
      moveDirect(p, spot.x, spot.y, dt);
      p.walking = Math.hypot(spot.x - p.x, spot.y - p.y) > 0.05;
      const seat = st.seats.indexOf(null);
      if (i === 0 && seat >= 0){ st.queue.shift(); st.seats[seat] = p.id; p.seat = seat; buyTicket(u, p); p.exit = [spotsFor(u).door, ...spotsFor(u).seats[seat].path]; p.state = 'toShow'; break; }
      if ((p.patience -= dt) <= 0){
        st.queue.splice(i, 1); p.mood = Math.max(0, p.mood - 0.35); sim.stats.walkouts++;
        sim.fx.push({ kind: 'storm', x: p.x, y: p.y - 1.5, t: 0, life: 1.8 }); emit('walkout', { name: C.STORES[u.store].name });
        p.state = 'decide';
      }
      break;
    }
    case 'toShow':
      if (runPath(p, dt)){
        const u = S.save.units.find(v => v.id === p.storeId), def = u && C.STORES[u.store];
        if (!def){ p.state = 'decide'; break; }
        p.state = 'show'; p.timer = lerp(def.show[0], def.show[1], rand());
        p.faceBack = def.attraction === 'theater' && u.face === 'down'; p.bouncing = def.attraction === 'jump';
      }
      break;
    case 'show': {
      p.walking = false;
      if ((p.timer -= dt) > 0) break;
      const u = S.save.units.find(v => v.id === p.storeId);
      leaveShow(p, u);
      break;
    }
    case 'toRestroom': {
      const u = S.save.units.find(v => v.id === p.storeId);
      if (!u || u.state !== 'restroom'){ p.state = 'decide'; break; }
      const f = spotsFor(u).front;
      if (walkTo(p, f.x, f.y, dt)){ p.exit = [spotsFor(u).door]; p.state = 'enterRestroom'; p.timer = C.RESTROOM_WAIT; }
      break;
    }
    case 'enterRestroom': {
      // In the door, then on to the first free stall (or wait for one).
      const u = S.save.units.find(v => v.id === p.storeId);
      if (!u){ p.state = 'decide'; break; }
      const r = roomInfo(u);
      // Every stall's taken: head for a waiting spot of their own (outside along the front once the room fills up).
      if (p.waitSpot === undefined && r.stalls.indexOf(null) < 0){
        const taken = new Set(sim.people.filter(q => q !== p && q.state === 'enterRestroom' && q.storeId === u.id && q.waitSpot !== undefined).map(q => q.waitSpot));
        let k = 0; while (taken.has(k)) k++;
        const w = restroomWaitSpot(u, k);
        p.waitSpot = k; p.exit = k === 0 || k >= 3 ? [w] : [spotsFor(u).door, w];
      }
      if (!runPath(p, dt)) break;
      p.walking = false;
      const i = r.stalls.indexOf(null);
      if (i >= 0){
        r.stalls[i] = p.id; p.stall = i; const sp = restroomSpots(u).stalls[i];
        // From a spot outside, come back in through the door first.
        p.exit = p.waitSpot >= 3 ? [spotsFor(u).door, sp.front, sp.inside] : [sp.front, sp.inside];
        p.waitSpot = undefined; p.state = 'toStall'; break;
      }
      if ((p.timer -= dt) <= 0){ p.mood = Math.max(0, p.mood - 0.1); setBubble(p, 'wc', 'wish', 1.6); p.exit = p.waitSpot >= 3 ? [] : exitPath(u, p); p.waitSpot = undefined; p.state = 'leave'; }
      break;
    }
    case 'toStall':
      if (runPath(p, dt)){
        p.state = 'inStall'; p.timer = 2.4 + rand() * 1.8; p.hidden = true;
        const u = S.save.units.find(v => v.id === p.storeId); if (u) roomInfo(u).inside[p.stall] = true;
      }
      break;
    case 'inStall': {
      p.walking = false;
      if ((p.timer -= dt) > 0) break;
      const u = S.save.units.find(v => v.id === p.storeId);
      p.hidden = false; freeStall(p);
      if (!u){ p.state = 'decide'; break; }
      const r = roomInfo(u);
      // A grubby restroom ruins the trip; a clean one is a small relief.
      if (r.dirt >= 60){ p.mood = Math.max(0, p.mood - 0.15); setBubble(p, 'wc', 'wish', 1.8); emit('grossRestroom'); }
      else p.mood = Math.min(1, p.mood + 0.03);
      const before = r.dirt;
      r.dirt = Math.min(100, r.dirt + C.RESTROOM_DIRT);
      if (before < 50 && r.dirt >= 50) emit('restroomDirty');
      const sp = restroomSpots(u), sink = pick(sp.sinks);
      p.exit = [sp.stalls[p.stall].front, sink.at]; p.state = 'toSink';
      break;
    }
    case 'toSink':
      if (runPath(p, dt)){
        p.state = 'washing'; p.timer = 1.0 + rand() * 0.6;
        // With the door facing up, the sinks are between the washer and the door, so they face away from us.
        const u = S.save.units.find(v => v.id === p.storeId); p.faceBack = !!u && u.face !== 'down';
      }
      break;
    case 'washing': {
      p.walking = false;
      if ((p.timer -= dt) > 0) break;
      const u = S.save.units.find(v => v.id === p.storeId);
      if (!u){ p.state = 'decide'; break; }
      const sp = restroomSpots(u), d = spotsFor(u);
      p.faceBack = false; p.exit = [sp.aisle(sp.sinkY), d.door, d.front]; p.state = 'leave';
      break;
    }
    case 'exit': {
      dropLitter(p, def);
      // Spread out a little across the doorway rather than leaving in two neat columns.
      const ex = C.ENTRANCE.x + 0.5 + (p.id % 2) + ((p.id * 7) % 5 - 2) * 0.15, ey = C.MAP_H - 0.5;
      if (walkTo(p, ex, ey, dt, sim.phase === 'closing' ? 2 : 1)){ p.state = 'out'; }
      break;
    }
    case 'out':
      if (moveDirect(p, p.x, C.MAP_H + 1.8, dt, sim.phase === 'closing' ? 2 : 1)){
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
  if (!p.usedMachine){
    const m = findMachine(p);
    p.usedMachine = true;
    if (m){ p.machine = m.d; p.machineAt = m.at; p.state = 'toMachine'; return; }
  }
  if (!p.usedRestroom){
    p.usedRestroom = true;
    const rooms = restrooms().filter(u => { const a = unitAccess(u); return isWalk(a.x, a.y); });
    if (rooms.length && rand() < C.RESTROOM_USE * (p.boughtFood ? 1.5 : 1)){
      let best = rooms[0], bd = Infinity;
      for (const u of rooms){ const f = spotsFor(u).front, d = Math.hypot(f.x - p.x, f.y - p.y); if (d < bd){ bd = d; best = u; } }
      p.storeId = best.id; p.state = 'toRestroom'; return;
    }
  }
  if (!p.rested && rand() < 0.3){
    const seat = findSeat(p);
    if (seat){ p.seat = seat.spot; p.seatAccess = seat.access; p.state = 'toSeat'; return; }
  }
  p.state = 'exit';
}
function findSeat(p){
  const opts = [];
  for (const d of S.save.decor){
    const def = C.DECOR[d.type]; if (!def.seat) continue;
    const a = decorAccess(d); if (!isWalk(a.x, a.y)) continue;
    // Where to sit depends on which way the seat faces (and which way the sitter looks).
    const r = d.rot || 0, k = rand() < 0.5 ? 0.05 : 0.85, comfy = !!def.comfy;   // one end or the other, so two sitters don't stack up
    const spot = r === 0 ? { x: d.x + 0.55 + k, y: d.y + 0.62, comfy } : r === 2 ? { x: d.x + 0.55 + k, y: d.y + 0.45, back: true, comfy }
      : r === 1 ? { x: d.x + 0.42, y: d.y + 0.55 + k, flip: true, comfy } : { x: d.x + 0.58, y: d.y + 0.55 + k, flip: false, comfy };
    opts.push({ access: { x: a.x + 0.5, y: a.y + 0.5 }, spot });
  }
  if (S.save.fountain) for (const f of fountainSpots()) opts.push({ access: { x: f.x + 0.5, y: f.y + 0.5 }, spot: { x: f.x + 0.5 + (rand() - 0.5) * 0.3, y: f.y + 0.5 } });
  return opts.length ? pick(opts) : null;
}
// Coin-op machines: each one has its own fans and odds. Nearest willing one wins.
function findMachine(p){
  let best = null, bd = Infinity;
  for (const d of S.save.decor){
    const c = C.DECOR[d.type].coin; if (!c || (c.who && !c.who.includes(p.type))) continue;
    const a = decorAccess(d); if (!isWalk(a.x, a.y) || rand() >= c.chance) continue;
    const dist = Math.hypot(a.x + 0.5 - p.x, a.y + 0.5 - p.y);
    // At a kiddie ride facing down, the grown-up waits off to one side so the kid riding it stays in view.
    // At a soda machine they stand to the right, by the buttons, so the window and the tray stay in view;
    // at a side-on one they step right up to it.
    const r = d.rot || 0, side = d.type === 'ride' && !r ? 0.42 : d.type === 'vending' && !r ? 0.36 : 0;
    const close = d.type === 'vending' && r % 2 ? (r === 1 ? 0.25 : -0.25) : 0;
    if (dist < bd){ bd = dist; best = { d, at: { x: a.x + 0.5 + side + close, y: a.y + 0.5 + side * 0.5 } }; }
  }
  return best;
}
// Tickets come out of a machine at the door: no register, no waiting on staff.
function buyTicket(u, p){
  const def = C.STORES[u.store], cdef = C.CUSTOMERS[p.type];
  const price = Math.max(1, Math.round(lerp(def.price[0], def.price[1], rand()) * cdef.spend));
  S.save.money += price; sim.stats.revenue += price; sim.stats.served++;
  sim.stats.byStore[u.id] = (sim.stats.byStore[u.id] || 0) + price;
  p.mood = Math.min(1, p.mood + 0.15); p.bubble = null;
  p.trashKinds = TRASH_FROM[u.store] || p.trashKinds;
  sim.fx.push({ kind: 'coin', x: p.x, y: p.y - 1.3, t: 0, life: 1.1, text: `+$${price}` });
  emit('sale', { amount: price, store: u.store });
}
function leaveShow(p, u){
  p.faceBack = false; p.bouncing = false;
  const st = u && storeInfo(u);
  if (st && st.seats) st.seats = st.seats.map(id => id === p.id ? null : id);
  if (!u){ p.state = 'decide'; return; }
  const sp = spotsFor(u), seat = sp.seats[p.seat];
  p.exit = seat ? [...seat.path].reverse().slice(1).concat([sp.door, sp.front]) : [sp.door, sp.front];
  if (rand() < 0.5) sim.fx.push({ kind: 'heart', x: p.x, y: p.y - 1.2, t: 0, life: 1.0 });
  p.state = 'leave';
}
// In front of one of the arcade cabinets along the back wall.
function arcadeSpot(u){
  const sw = Math.max(0.6, u.w - 1.25), n = Math.max(1, Math.floor(sw / 0.75)), i = Math.floor(rand() * n);
  const [x, y] = local(u, 0.1 + i * 0.78 + 0.34, 0.95);
  return { x, y };
}
function useMachine(p){
  const d = p.machine, c = C.DECOR[d.type].coin;
  if (!S.save.decor.includes(d)) return;
  const price = Math.round(lerp(c.price[0], c.price[1], rand()));
  S.save.money += price; sim.stats.revenue += price; sim.stats.machines += price;
  p.mood = Math.min(1, p.mood + (d.type === 'ride' ? 0.12 : 0.05));
  if (d.type === 'vending'){ p.trashKinds = ['can']; p.boughtFood = true; p.holding = 'can'; p.holdT = 0; }
  if (d.type === 'gumball'){ p.holding = 'gum'; p.holdT = 0; }
  if (d.type === 'claw'){
    if (rand() < CLAW_WIN){ p.holding = 'plush'; p.prize = pick(PRIZES); p.mood = Math.min(1, p.mood + 0.1); sim.fx.push({ kind: 'coin', x: d.x + 0.5, y: d.y - 1.3, t: 0, life: 1.4, text: 'WIN!' }); sim.fx.push({ kind: 'sparkle', x: d.x + 0.5, y: d.y - 0.6, t: 0, life: 0.9 }); }
    else sim.fx.push({ kind: 'coin', x: d.x + 0.5, y: d.y - 1.3, t: 0, life: 1.2, text: 'So close!' });
  }
  sim.fx.push({ kind: 'coin', x: d.x + 0.5, y: d.y - 0.6, t: 0, life: 1.1, text: `+$${price}` });
  emit('sale', { amount: price, store: d.type });
}
// The greeter says hi to everyone who walks in: a little happier, a little more patient.
function greet(p){
  const g = sim.people.find(q => q.role === 'greeter' && q.state === 'post' && !q.slacking);
  if (!g) return;
  p.mood = Math.min(1, p.mood + 0.03 + 0.03 * g.skill);
  p.patienceMul = 1 + 0.07 * g.skill;
  g.waveT = 0.8;
  if (rand() < 0.3) sim.fx.push({ kind: 'heart', x: p.x, y: p.y - 1.2, t: 0, life: 1.0 });
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
    if (isAttraction(u)) continue;
    const st = storeInfo(u);
    const server = st.server && personById(st.server);
    if (!server || server.atRegisterId !== u.id || server.slacking){ st.serveT = 0; const f = st.queue.length && personById(st.queue[0]); if (f) f.served = false; continue; }
    const front = st.queue.length && personById(st.queue[0]);
    if (front) front.served = false;
    if (!front || front.state !== 'queue'){ st.serveT = 0; continue; }
    const spot = queueSpot(u, 0);
    if (Math.hypot(front.x - spot.x, front.y - spot.y) > 0.2){ st.serveT = 0; continue; }
    front.served = true;
    st.serveT += dt;
    const need = server.kind === 'owner' ? C.OWNER_SERVE : C.CLERK_SERVE[server.skill] * (server.dream === u.store ? C.DREAM_SERVE : 1) / (server.boost || 1);
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
  const hold = HOLD_FROM[u.store];
  if (hold){ p.holding = Array.isArray(hold) ? 'bag' : hold; if (Array.isArray(hold)) p.bagColor = hold[1]; p.holdT = 0; }
  st.queue.shift();
  p.bubble = null; p.served = false;
  sim.fx.push({ kind: 'coin', x: p.x, y: p.y - 1.3, t: 0, life: 1.1, text: `+$${price}` });
  if (p.mood > 0.75) sim.fx.push({ kind: 'heart', x: p.x + 0.2, y: p.y - 1.2, t: 0, life: 1.2 });
  emit('sale', { amount: price, store: u.store, tutorial: !!p.tutorial });
  if (def.dine && startDining(p, u)) return;
  leaveStore(p, u);
}
// Dine-in stores: take a free stool and eat before heading out (a full place means takeout).
function startDining(p, u){
  const st = storeInfo(u), seats = dineSpots(u).seats;
  st.dine = st.dine || seats.map(() => null);
  const i = st.dine.findIndex(id => id === null);
  if (i < 0) return false;
  st.dine[i] = p.id; p.dineSeat = i; p.exit = [seats[i]]; p.state = 'toDine';
  return true;
}
function stopDining(p, u){
  const st = u && storeInfo(u);
  if (st && st.dine && st.dine[p.dineSeat] === p.id) st.dine[p.dineSeat] = null;
  p.dineSeat = undefined;
}

// What people leave behind after shopping at each store.
const TRASH_FROM = {
  pretzel: ['bag', 'wrapper'], candy: ['wrapper', 'lolly'], coffee: ['cup'], arcade: ['can', 'popcorn'],
  dollar: ['paper', 'bag'], boutique: ['paper'], pets: ['paper', 'bag'], books: ['paper', 'cup'],
  scoops: ['cone', 'cup'], music: ['paper', 'bag'], gadgets: ['bag', 'paper'], theater: ['popcorn', 'cup'], jumppark: ['can', 'cup'],
  toys: ['paper', 'bag'], perfume: ['paper'], gaming: ['bag', 'paper'], shoes: ['paper', 'bag'], burger: ['wrapper', 'cup'],
};

/* ---------- Owner and jobs ---------- */
export function jobKey(j){ return j.type + ':' + (j.unitId || j.trashId || j.staffId || j.troubleId || ''); }
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
  if (p.mopT > 0){ p.mopT -= dt; p.walking = false; if (p.mopT <= 0){ finishMop(p); sim.jobs.shift(); p.exit = p.mopOut; p.mopOut = null; } return; }
  // Finish stepping out of wherever we were (like a restroom we just mopped) even with nothing else to do.
  if (p.exit && p.exit.length && !sim.jobs.length){ runPath(p, dt); return; }
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
  } else if (job.type === 'restroom'){
    const u = S.save.units.find(v => v.id === job.unitId && v.state === 'restroom');
    if (!u){ sim.jobs.shift(); return; }
    if (!job.inside){
      const a = unitAccess(u);
      if (!walkTo(p, a.x + 0.5, a.y + 0.5, dt)) return;
      p.exit = mopPathIn(u); job.inside = true;
      return;
    }
    roomInfo(u).claimed = p.id; p.roomTarget = u.id; p.mopT = C.RESTROOM_MOP; p.mopOut = mopPathOut(u);
  } else if (job.type === 'nudge'){
    // Walk over and have a word. Clerks get called from their store's door.
    const st = personById(job.staffId);
    if (!st || !st.slacking){ sim.jobs.shift(); return; }
    let goal = { x: st.x, y: st.y + 0.3 };
    const u = st.role === 'clerk' && S.save.units.find(v => v.id === st.storeId);
    if (u){ const a = u.kiosk ? kioskStaffAccess(u) : unitAccess(u); goal = { x: a.x + 0.5, y: a.y + 0.5 }; }
    if (!walkTo(p, goal.x, goal.y, dt) && Math.hypot(p.x - goal.x, p.y - goal.y) > 0.8) return;
    p.walking = false; sim.jobs.shift(); backToWork(st, true);
  } else if (job.type === 'shoo'){
    // Walk up to the troublemaker and send them packing.
    const q = personById(job.troubleId);
    if (!q || q.kind !== 'trouble' || q.state === 'flee' || q.state === 'gone'){ sim.jobs.shift(); return; }
    if (!walkTo(p, q.x, q.y + 0.3, dt) && Math.hypot(p.x - q.x, p.y - q.y) > 0.9) return;
    p.walking = false; sim.jobs.shift(); shoo(q, 'owner');
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

// Mopping happens inside: in through the door to the middle of the room, and back out after.
function mopPathIn(u){ const d = spotsFor(u), sp = restroomSpots(u); return [d.door, sp.aisle(sp.sinkY - 0.4)]; }
function mopPathOut(u){ const d = spotsFor(u); return [d.door, d.front]; }
function runWaypoints(p, list, dt){
  while (list.length){ if (!moveDirect(p, list[0].x, list[0].y, dt)) return false; list.shift(); }
  return true;
}
function finishMop(p){
  const u = S.save.units.find(v => v.id === p.roomTarget);
  if (u){ const r = roomInfo(u); r.dirt = 0; r.claimed = null; sim.fx.push({ kind: 'sparkle', x: u.x + u.w / 2, y: u.y + u.h / 2, t: 0, life: 0.8 }); emit('cleaned', { count: 1, by: p.kind }); }
  p.roomTarget = null;
}

/* ---------- Staff ---------- */
function updateStaff(p, dt){
  p.t += dt;
  // Phone breaks. Clerks stay put but stop ringing people up; everyone else just stands there.
  if (p.breakT > 0){ p.breakT -= dt; p.walking = false; if (p.breakT <= 0) backToWork(p); return; }
  if (p.role !== 'supervisor' && sim.phase === 'day' && !(p.broomT > 0 || p.mopT > 0 || p.restockT > 0) && (p.workT -= dt * (p.boost ? C.SUPERVISOR_BREAKS : 1)) <= 0){ startBreak(p); return; }
  p.speed = p.baseSpeed * (p.boost || 1);
  if (p.role === 'clerk'){
    if (p.storeId){ p.atRegisterId = p.storeId; p.walking = false; }
    return;
  }
  if (p.role === 'stocker') return updateStocker(p, dt);
  if (p.role === 'greeter'){
    const g = greeterPost();
    if (walkTo(p, g.x, g.y, dt)){ p.state = 'post'; p.walking = false; p.flip = false; }
    if (p.waveT > 0) p.waveT -= dt;
    return;
  }
  if (p.role === 'mascot') return updateMascot(p, dt);
  if (p.role === 'supervisor') return updateSupervisor(p, dt);
  if (p.role === 'guard' && !p.slacking) return updateGuard(p, dt);
  if (p.broomT > 0){
    p.broomT -= dt; p.walking = false;
    if (p.broomT <= 0){
      const tr = sim.trash.find(t => t.id === p.target);
      if (tr){ sim.trash = sim.trash.filter(t => t !== tr); sim.fx.push({ kind: 'sparkle', x: tr.x, y: tr.y - 0.2, t: 0, life: 0.6 }); emit('cleaned', { count: 1, by: 'staff' }); }
      p.target = null;
    }
    return;
  }
  // Restroom duty comes first once one gets grubby.
  if (p.mopT > 0){ p.mopT -= dt; p.walking = false; if (p.mopT <= 0){ finishMop(p); p.mopPath = p.mopOut; p.mopOut = null; } return; }
  // Stepping into or out of a restroom.
  if (p.mopPath && p.mopPath.length){ runWaypoints(p, p.mopPath, dt); return; }
  let room = p.roomTarget && S.save.units.find(v => v.id === p.roomTarget && v.state === 'restroom');
  if (!room && !p.target){
    for (const u of restrooms()){ const r = roomInfo(u); if (r.dirt >= 40 && (!r.claimed || r.claimed === p.id)){ room = u; r.claimed = p.id; p.roomTarget = u.id; break; } }
  }
  if (!room) p.mopInside = false;
  if (room){
    if (!p.mopInside){
      const a = unitAccess(room);
      if (walkTo(p, a.x + 0.5, a.y + 0.5, dt)){ p.mopPath = mopPathIn(room); p.mopInside = true; }
      return;
    }
    p.mopInside = false; p.mopT = C.RESTROOM_MOP * [0, 1.3, 1.0, 0.75][p.skill]; p.mopOut = mopPathOut(room);
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
    const x0 = Math.floor(map.w * i / n), x1 = Math.floor(map.w * (i + 1) / n);
    for (let k = 0; k < 40; k++){
      const x = x0 + Math.floor(rand() * (x1 - x0)), y = Math.floor(rand() * C.MAP_H);
      if (isWalk(x, y)){ p.wander = { x: x + 0.5, y: y + 0.5, wait: 0 }; break; }
    }
  }
  if (p.wander && walkTo(p, p.wander.x, p.wander.y, dt, 0.6)){ p.walking = false; p.wander.wait -= dt; }
}

// Stockers carry boxes out to whichever store is running lowest and top it up (at restocking prices).
function updateStocker(p, dt){
  if (p.restockT > 0){
    p.restockT -= dt; p.walking = false;
    if (p.restockT <= 0){
      const u = S.save.units.find(v => v.id === p.target && v.state === 'store');
      if (u){
        const def = C.STORES[u.store], unit = (def.price[0] + def.price[1]) / 2 * C.RESTOCK_RATE;
        const n = Math.max(0, Math.min(def.stock - u.stock, Math.floor(S.save.money / unit)));
        const cost = Math.round(n * unit);
        u.stock += n; S.save.money -= cost; sim.stats.restockDay += cost;
        if (n) sim.fx.push({ kind: 'sparkle', x: u.x + u.w / 2, y: u.y + u.h / 2, t: 0, life: 0.8 });
      }
      p.target = null; p.carry = false;
    }
    return;
  }
  let u = p.target && S.save.units.find(v => v.id === p.target && v.state === 'store');
  if (!u){
    p.target = null; p.carry = false;
    const claimed = new Set(sim.people.filter(q => q.role === 'stocker' && q !== p).map(q => q.target));
    let low = C.RESTOCK_AT;
    for (const v of stores(S.save)){ if (claimed.has(v.id) || isAttraction(v)) continue; const f = v.stock / C.STORES[v.store].stock; if (f < low){ low = f; u = v; } }
    if (u){ p.target = u.id; p.carry = true; }
  }
  if (u){
    const f = spotsFor(u).front;
    if (walkTo(p, f.x + 0.35, f.y, dt)) p.restockT = C.STOCKER_TIME[p.skill];
    return;
  }
  // Nothing low: wait by the doors with the next box.
  if (walkTo(p, C.ENTRANCE.x + 2.6, C.MAP_H - 1.4, dt)) p.walking = false;
}
// The supervisor walks from storefront to storefront. Anyone on their phone nearby gets walked over to and
// sent back to work; staff within range (clerks included) work faster and break less.
function updateSupervisor(p, dt){
  const R = C.SUPERVISOR_RADIUS[p.skill];
  if ((p.scanT = (p.scanT || 0) - dt) <= 0){
    p.scanT = 0.5;
    for (const q of sim.people) if (q.kind === 'staff' && q.role !== 'supervisor'){
      q.boost = 0;
      for (const v of sim.people) if (v.role === 'supervisor' && Math.hypot(v.x - q.x, v.y - q.y) < C.SUPERVISOR_RADIUS[v.skill]) q.boost = Math.max(q.boost, C.SUPERVISOR_BOOST[v.skill]);
    }
    if (!p.catching){ const lazy = sim.people.find(q => q.slacking && Math.hypot(q.x - p.x, q.y - p.y) < R); if (lazy) p.catching = lazy.id; }
  }
  if (p.catching){
    const q = personById(p.catching);
    if (!q || !q.slacking){ p.catching = null; return; }
    let goal = { x: q.x, y: q.y + 0.3 };
    const u = q.role === 'clerk' && S.save.units.find(v => v.id === q.storeId);
    if (u){ const a = u.kiosk ? kioskStaffAccess(u) : unitAccess(u); goal = { x: a.x + 0.5, y: a.y + 0.5 }; }
    if (walkTo(p, goal.x, goal.y, dt) || Math.hypot(p.x - goal.x, p.y - goal.y) < 0.8){ backToWork(q, true); p.catching = null; }
    return;
  }
  if (!p.round || (p.round.wait -= dt) < -3){
    const fronts = S.save.units.filter(u => u.state === 'store' || u.state === 'restroom');
    const u = fronts.length ? pick(fronts) : null;
    if (u){ const f = u.kiosk ? kioskStaffAccess(u) : unitAccess(u); if (isWalk(f.x, f.y)) p.round = { x: f.x + 0.5, y: f.y + 0.5, wait: 0 }; }
  }
  if (p.round && walkTo(p, p.round.x, p.round.y, dt)){ p.walking = false; p.round.wait -= dt; }
}
/* ---------- Troublemakers (level 10+) ---------- */
// Rowdy teens wander in, blast a boombox (souring the mood nearby and sometimes scaring shoppers off) or kick over
// a trash can, then drift out. Tap one to send the owner over to shoo them, or hire a security guard.
function planTrouble(tutorial){
  const s = S.save, T = C.TROUBLE;
  sim.troubleTimes = [];
  if (tutorial || s.level < T.level) return;
  const k = clamp((s.level - T.ramp[0]) / (T.ramp[1] - T.ramp[0]), 0, 1);
  const n = Math.max(1, Math.round(T.perDay[0] + (T.perDay[1] - T.perDay[0]) * k + (rand() - 0.5)));
  for (let i = 0; i < n; i++) sim.troubleTimes.push((0.15 + rand() * 0.6) * C.DAY_SECONDS);
  sim.troubleTimes.sort((a, b) => a - b);
}
function spawnTrouble(){
  const look = { skin: pick(SKINS), hair: pick(HAIRS), hairStyle: pick(['short', 'cap']), acc: '#ef476f', hood: true, shirt: pick(['#3d405b', '#5a189a', '#2b2d42']), pants: '#2b2d42', shoe: '#ef476f' };
  const p = makePerson('trouble', look, C.ENTRANCE.x + 0.5 + rand(), C.MAP_H + 1.5);
  p.speed = 1.5; p.state = 'enter'; p.holding = 'boombox';
  p.stay = C.TROUBLE.stay[0] + rand() * (C.TROUBLE.stay[1] - C.TROUBLE.stay[0]);
  p.scared = new Set();
  sim.people.push(p); sim.stats.troubles++;
  if (!S.save.flags.sawTrouble){ S.save.flags.sawTrouble = true; emit('firstTrouble'); }
}
function troubleSpot(){
  for (let k = 0; k < 40; k++){
    const x = Math.floor(rand() * map.w), y = C.CONCOURSE.y + Math.floor(rand() * C.CONCOURSE.h);
    if (isWalk(x, y)) return { x: x + 0.5, y: y + 0.5 };
  }
  return { x: C.ENTRANCE.x + 1, y: C.MAP_H - 2 };
}
const troubleActive = p => p.kind === 'trouble' && (p.state === 'roam' || p.state === 'act');
function updateTrouble(p, dt){
  p.t += dt;
  if (p.state === 'flee'){ if (walkTo(p, C.ENTRANCE.x + 1, C.MAP_H - 0.5, dt, p.shooed ? 1.8 : 1)) p.state = 'gone'; return; }
  if (p.state === 'gone'){ if (moveDirect(p, p.x, C.MAP_H + 1.8, dt, 1.8)) p.gone = true; return; }
  if (p.state === 'enter'){ if (moveDirect(p, p.x, C.MAP_H - 0.6, dt)){ p.state = 'roam'; p.goal = troubleSpot(); } return; }
  if (sim.phase !== 'day' || (p.stay -= dt) <= 0){ p.state = 'flee'; return; }
  if (p.state === 'roam'){
    if (walkTo(p, p.goal.x, p.goal.y, dt)){ p.state = 'act'; p.timer = 6 + rand() * 5; p.act = rand() < 0.35 && kickBin(p) ? 'kick' : 'music'; }
    return;
  }
  // Acting up: the boombox blares, and shoppers close by get upset (some leave in a huff).
  p.walking = false; sim.stats.troubleT += dt;
  if ((p.noteT = (p.noteT || 0) - dt) <= 0){
    p.noteT = 0.5;
    if (p.act === 'music') sim.fx.push({ kind: 'coin', x: p.x + (rand() - 0.5) * 0.6, y: p.y - 1.4, t: 0, life: 1.0, text: '♪' });
    const T = C.TROUBLE;
    for (const q of sim.people) if (q.kind === 'customer' && Math.hypot(q.x - p.x, q.y - p.y) < T.radius){
      q.mood = Math.max(0, q.mood - T.moodHit * 0.25);
      if (!p.scared.has(q.id) && ['decide', 'pause', 'toStore', 'arrive', 'toMachine', 'toSeat'].includes(q.state)){
        p.scared.add(q.id);
        if (rand() < T.scareChance){ q.state = 'exit'; q.bubble = null; sim.stats.scared++; sim.fx.push({ kind: 'storm', x: q.x, y: q.y - 1.5, t: 0, life: 1.6 }); }
      }
    }
  }
  if ((p.timer -= dt) <= 0){ p.state = 'roam'; p.goal = troubleSpot(); }
}
// Kick over the nearest trash can: its trash goes everywhere.
function kickBin(p){
  const bin = S.save.decor.filter(d => d.type === 'bin').sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
  if (!bin || Math.hypot(bin.x + 0.5 - p.x, bin.y + 0.5 - p.y) > 4) return false;
  for (let i = 0; i < 4; i++){ const sp = litterSpot(bin.x + 0.5 + (rand() - 0.5) * 2, bin.y + 1 + rand()); if (sp) addTrash(sp.x, sp.y, pick(['wrapper', 'cup', 'bag', 'paper'])); }
  sim.fx.push({ kind: 'storm', x: bin.x + 0.5, y: bin.y - 0.6, t: 0, life: 1.4 });
  return true;
}
function shoo(q, by){
  if (!q || !troubleActive(q)) return;
  q.state = 'flee'; q.shooed = true; sim.stats.shooed++;
  sim.fx.push({ kind: 'coin', x: q.x, y: q.y - 1.5, t: 0, life: 1.2, text: by === 'guard' ? 'Out you go!' : 'Scram!' });
  emit('shooed', { by });
}
// Security guards walk the storefronts; anyone acting up within range gets walked out.
function updateGuard(p, dt){
  const R = C.TROUBLE.guardRadius[p.skill];
  if ((p.scanT = (p.scanT || 0) - dt) <= 0){
    p.scanT = 0.4;
    if (!p.catching){ const q = sim.people.find(q => troubleActive(q) && Math.hypot(q.x - p.x, q.y - p.y) < R); if (q) p.catching = q.id; }
  }
  if (p.catching){
    const q = personById(p.catching);
    if (!q || !troubleActive(q)){ p.catching = null; return; }
    if (walkTo(p, q.x, q.y + 0.3, dt, 1.2) || Math.hypot(p.x - q.x, p.y - q.y) < 0.9){ shoo(q, 'guard'); p.catching = null; }
    return;
  }
  if (!p.round || (p.round.wait -= dt) < -3){
    const fronts = S.save.units.filter(u => u.state === 'store');
    const u = fronts.length ? pick(fronts) : null;
    if (u){ const f = u.kiosk ? kioskStaffAccess(u) : unitAccess(u); if (isWalk(f.x, f.y)) p.round = { x: f.x + 0.5, y: f.y + 0.5, wait: 0 }; }
  }
  if (p.round && walkTo(p, p.round.x, p.round.y, dt)){ p.walking = false; p.round.wait -= dt; }
}
// Sunny wanders the concourse, waving. Anyone close by perks up (once per visit).
function updateMascot(p, dt){
  if (!p.wander || (p.wander.wait -= dt) < -4){
    for (let k = 0; k < 30; k++){
      const x = Math.floor(rand() * map.w), y = Math.floor(rand() * C.MAP_H);
      if (isWalk(x, y)){ p.wander = { x: x + 0.5, y: y + 0.5, wait: 0 }; break; }
    }
  }
  if (p.wander && walkTo(p, p.wander.x, p.wander.y, dt)){ p.walking = false; p.wander.wait -= dt; }
  if ((p.cheerT = (p.cheerT || 0) - dt) <= 0){
    p.cheerT = 0.5;
    for (const q of sim.people) if (q.kind === 'customer' && !q.cheered && Math.hypot(q.x - p.x, q.y - p.y) < 1.8){
      q.cheered = true; q.mood = Math.min(1, q.mood + 0.06 + 0.04 * p.skill);
      sim.fx.push({ kind: 'heart', x: q.x, y: q.y - 1.2, t: 0, life: 1.0 });
    }
  }
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
    while (sim.spawning && sim.troubleTimes.length && sim.troubleTimes[0] <= sim.t){ sim.troubleTimes.shift(); spawnTrouble(); }
    if (sim.wishCoin && clockHour() >= C.OPEN_HOUR + 2) sim.wishCoin = false;
    if ((sim.stats.sampleT += dt) > 2){
      sim.stats.sampleT = 0; sim.stats.dirtSum += sim.trash.length; sim.stats.dirtN++;
      const rooms = restrooms();
      if (rooms.length){ sim.stats.roomDirtSum += rooms.reduce((a, u) => a + roomInfo(u).dirt, 0) / rooms.length; sim.stats.roomDirtN++; }
    }
    if (sim.t >= C.DAY_SECONDS) beginClosing();
  }
  if (sim.phase === 'closing'){
    sim.closeT += dt;
    const left = sim.people.some(p => p.kind === 'customer');
    // Everyone heads out at closing; a bigger mall gets a little longer before the lights go off.
    if (!left || sim.closeT > 8 + map.w * 0.3) sim.phase = 'done';
  }
  for (const p of sim.people){
    if (p.kind === 'customer') updateCustomer(p, dt);
    else if (p.kind === 'owner') updateOwner(p, dt);
    else if (p.kind === 'staff') updateStaff(p, dt);
    else if (p.kind === 'gus') updateGus(p, dt);
    else if (p.kind === 'trouble') updateTrouble(p, dt);
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
    p.hidden = false; p.playing = false; freeStall(p);
    if (p.state === 'show' || p.state === 'toShow'){ leaveShow(p, S.save.units.find(v => v.id === p.storeId)); continue; }
    p.faceBack = false;
    if (p.state === 'line'){ p.state = 'exit'; continue; }
    if (p.state === 'dine' || p.state === 'toDine') stopDining(p, S.save.units.find(v => v.id === p.storeId));
    if (['enter', 'browse', 'queue', 'leave', 'enterRestroom', 'toStall', 'inStall', 'toSink', 'washing', 'dine', 'toDine'].includes(p.state)){
      const u = S.save.units.find(v => v.id === p.storeId);
      if (u && !u.kiosk){ p.exit = exitPath(u, p); p.state = 'leave'; } else p.state = 'exit';
    } else if (p.state === 'sit' || p.state === 'seatIn'){ p.state = 'exit'; p.faceBack = false; }
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
  const wings = C.EXPANSIONS.filter(e => s.expansions && s.expansions[e.id]).length;
  const upkeep = open.reduce((a, u) => a + (C.STORES[u.store].upkeep || 0), 0);
  const utilities = C.UTILITIES_BASE + C.UTILITIES_PER_STORE * open.length + C.EXPANSION_UTILITIES * wings + upkeep;
  // Restock every store overnight.
  let restockWanted = 0;
  const needs = open.filter(u => !isAttraction(u)).map(u => { const def = C.STORES[u.store], n = def.stock - u.stock, cost = n * (def.price[0] + def.price[1]) / 2 * C.RESTOCK_RATE; restockWanted += cost; return { u, n, cost }; });
  const afterFixed = s.money - wages - utilities;
  const frac = restockWanted <= 0 ? 1 : Math.max(0, Math.min(1, afterFixed / restockWanted));
  let restock = 0;
  for (const nd of needs){ const add = Math.floor(nd.n * frac); nd.u.stock += add; restock += add / Math.max(1, nd.n) * nd.cost; }
  restock = Math.round(restock);
  s.money -= wages + utilities + restock;
  restock += st.restockDay;   // stockers already paid for theirs during the day
  const walk = Math.max(20, map.walkCount);
  const avgDirt = st.dirtN ? st.dirtSum / st.dirtN : 0;
  const roomDirt = st.roomDirtN ? st.roomDirtSum / st.roomDirtN : 0;
  const clean = clamp(5 - avgDirt / (walk / 40) * 1.7 - sim.trash.length * 0.07 - roomDirt / 100 * 1.8, 1, 5);
  const total = st.served + st.walkouts;
  const rate = total ? st.served / total : 1;
  const waitF = st.waitN ? st.waitFrac / st.waitN : 0;
  const service = total ? clamp(1 + 4 * Math.pow(rate, 1.6) - 2 * waitF, 1, 5) : 3;
  const types = new Set(open.map(u => u.store)).size;
  const variety = clamp(1 + (types - 1) * 0.5, 1, 5);
  const derelict = s.units.filter(u => u.state === 'derelict').length;
  const dusty = C.ZONES.filter(z => !s.zones[z.id]).length;
  const decorPts = s.decor.reduce((a, d) => a + C.DECOR[d.type].ambience, 0) + (s.fountain ? C.FOUNTAIN.ambience : 0);
  const amb = (T, id) => (T[id] && T[id].ambience) || 0;
  const stylePts = s.style ? amb(C.WALLPAPERS, s.style.wall) + amb(C.FLOORS, s.style.floor) : 0;
  // Troublemakers acting up sour the place's feel for the day.
  const ambience = clamp(1.6 + (decorPts + stylePts + open.length * 1.5 - derelict * 0.55 - dusty * 1.2) / 8 - Math.min(1.2, st.troubleT / 50), 1, 5);
  const happy = st.moodN ? st.moodSum / st.moodN : 0.6;
  // A five-star mall needs everything going right: clean, quick, varied, pretty, and happy shoppers.
  const overall = (clean + service + variety + ambience) / 4 * 0.8 + happy * 5 * 0.2;
  const grade = overall >= 4.7 ? 'S' : overall >= 4.1 ? 'A' : overall >= 3.3 ? 'B' : overall >= 2.4 ? 'C' : 'D';
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
    restockShort: frac < 1, gusTrash: st.gusTrash, machines: st.machines, roomDirt,
    troubles: st.troubles, scared: st.scared, shooed: st.shooed,
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
