import * as C from '../src/config.js';
import { S, newSave, stores, addXp } from '../src/state.js';
import { rebuildMap, validatePlacement, map } from '../src/map.js';
import { sim, step, startDay, buildReport, addJob, setRandom, staffLook, roomInfo } from '../src/sim.js';
const staffLookFor = m => staffLook(m.role, m.id);
import { mulberry } from '../src/art.js';

const DAYS = +(process.argv[2] || 15), SEED = +(process.argv[3] || 7), DUMP = process.argv[4];
setRandom(mulberry(SEED));
const botRand = mulberry(SEED * 7919 + 1);   // the bot's own choices, seeded so runs are repeatable
S.save = newSave({ name: 'Bot', mall: 'Bot Mall', look: {} });
S.save.flags.tutorial = 1;
rebuildMap(S.save);
const pad = (v, n) => String(v).padStart(n);
console.log('day visit served walk  sales  profit   money lvl rating grade stores staff');
for (let d = 1; d <= DAYS; d++){
  const s = S.save; s.day = d;
  startDay({});
  let think = 0;
  while (sim.phase !== 'done'){
    step(0.05);
    sim.events.length = 0;
    if ((think += 0.05) > 0.4){ think = 0; player(); }
  }
  const r = buildReport();
  if (r.gained.length) for (const l of r.gained) if (l === 3) s.flags.pending.push('dee');
  night();
  if (DUMP && d === DAYS){ s.phase = 'night'; s.flags.memories.night1 = true; for (const m of s.staff) m.look = staffLookFor(m); (await import('node:fs')).writeFileSync(DUMP, JSON.stringify(s)); }
  console.log(`${pad(d, 3)} ${pad(r.visitors, 5)} ${pad(r.served, 6)} ${pad(r.walkouts, 4)} ${pad(r.revenue, 6)} ${pad(r.profit, 7)} ${pad(Math.round(s.money), 7)} ${pad(s.level, 3)} ${pad(r.rating.toFixed(2), 6)} ${pad(r.grade, 5)} ${pad(stores(s).length, 6)} ${pad(s.staff.length, 5)}  C${r.ratings.clean.toFixed(1)} S${r.ratings.service.toFixed(1)} V${r.ratings.variety.toFixed(1)} A${r.ratings.ambience.toFixed(1)} happy ${Math.round(r.happy * 100)}%`);
}

function player(){
  if (sim.jobs.length || sim.phase !== 'day') return;
  const o = sim.owner;
  // An attentive player: nudges staff off their phones, mops a filthy restroom nobody's handling.
  const slacker = sim.people.find(p => p.slacking && p.breakT < p.breakMax - 4);
  if (slacker && botRand() < 0.5){ addJob({ type: 'nudge', staffId: slacker.id }); return; }
  const gross = S.save.units.find(u => u.state === 'restroom' && roomInfo(u).dirt >= 70 && !roomInfo(u).claimed);
  if (gross){ addJob({ type: 'restroom', unitId: gross.id }); return; }
  let best = null, bq = 0;
  for (const u of stores(S.save)){
    const st = sim.storeState.get(u.id); if (!st) continue;
    const server = st.server && sim.people.find(p => p.id === st.server);
    if (server && server.kind === 'staff') continue;
    const waiting = st.queue.length;
    if (waiting > bq){ bq = waiting; best = u; }
  }
  if (best && o.atRegisterId !== best.id){
    // Stay put if our own register still has people waiting.
    const mine = o.atRegisterId && sim.storeState.get(o.atRegisterId);
    if (!mine || !mine.queue.length || bq >= mine.queue.length + 2){ addJob({ type: 'register', unitId: best.id }); return; }
  }
  if (!bq && sim.trash.length){
    let t = null, td = Infinity;
    for (const tr of sim.trash){ const dd = Math.hypot(tr.x - o.x, tr.y - o.y); if (dd < td){ td = dd; t = tr; } }
    if (t) addJob({ type: 'clean', trashId: t.id });
  }
}

function night(){
  const s = S.save, gain = n => addXp(n);
  const lim = role => C.STAFF_LIMITS[role][s.level], has = role => s.staff.filter(m => m.role === role).length;
  // Night 1 is for hiring the first clerks; stores open from night 2 (like Gus suggests).
  for (let tries = 0; tries < 4 && s.day >= 2; tries++){
    // Open a new store type in an empty unit of the right size if possible.
    const owned = new Set(stores(s).map(u => u.store));
    const vacant = s.units.filter(u => u.state === 'vacant');
    const choices = Object.entries(C.STORES).filter(([k, d]) => !d.kiosk && d.level <= s.level).sort((a, b) => (owned.has(a[0]) - owned.has(b[0])) || a[1].cost - b[1].cost);   // new kinds first, the cheapest it can afford
    let opened = false;
    for (const u of vacant){
      const pick = choices.find(([k, d]) => d.w === u.w && d.h === u.h && s.money >= d.cost + 150 && (!owned.has(k) || owned.size >= choices.length));
      if (pick){ s.money -= pick[1].cost; u.state = 'store'; u.store = pick[0]; u.stock = pick[1].stock; gain(40); opened = true; break; }
    }
    if (opened) continue;
    // Otherwise fix up a boarded-up unit and open a store in it, in one go (the smallest unit that fits).
    const der = s.units.filter(u => u.state === 'derelict').sort((a, b) => a.w * a.h - b.w * b.h);
    for (const [k, d] of choices){
      if (owned.has(k) && owned.size < choices.length) continue;
      const u = der.find(v => v.w === d.w && v.h === d.h), fix = u ? u.w * u.h * C.RENOVATE_PER_TILE : 0;
      if (u && s.money >= fix + d.cost + 150){ s.money -= fix + d.cost; u.state = 'store'; u.store = k; u.stock = d.stock; gain(65); opened = true; break; }
    }
    if (opened) continue;
    // No shell left for a store we don't have yet (or a kiosk): put up a new one on clean floor.
    const all = Object.entries(C.STORES).filter(([k, d]) => d.level <= s.level);
    const want = all.find(([k]) => !owned.has(k)) || (stores(s).length < 24 && s.money > 6000 ? all.sort((a, b) => b[1].price[1] - a[1].price[1])[0] : null);
    if (want){
      const [k, d] = want, cost = d.cost + (d.kiosk ? 0 : d.w * d.h * C.BUILD_PER_TILE);
      const spot = s.money >= cost + 300 && findSpot(d.kiosk ? 'kiosk' : 'unit', d.w, d.h);
      if (spot){ s.money -= cost; s.units.push({ id: s.nextId++, x: spot.x, y: spot.y, w: d.w, h: d.h, face: spot.face, kiosk: d.kiosk || undefined, state: 'store', store: k, stock: d.stock }); gain(50); rebuildMap(s); continue; }
    }
    break;
  }
  // Hire help when allowed.
  const saving = stores(s).length < 8 && s.money < 1500;   // like a sensible player: stores first, frills later
  const hire = (role, extra = {}) => s.staff.push({ id: s.nextId++, role, name: role[0].toUpperCase(), look: {}, skill: [1, 2, 2, 3][Math.floor(botRand() * 4)], ...extra });
  if (s.level >= 3 && has('janitor') < 1 && lim('janitor') >= 1) s.staff.push({ id: s.nextId++, role: 'janitor', name: 'Dee', look: {}, fast: true });
  if (s.level >= 1){
    const firstTwo = s.day <= 2;
    for (const u of stores(s).filter((_, i) => firstTwo || i % 2 === 0)){
      if (has('clerk') >= lim('clerk') || s.money < 600 || (!firstTwo && saving && has('clerk') >= 2)) break;
      if (!s.staff.some(m => m.storeId === u.id)) hire('clerk', { storeId: u.id });
    }
  }
  if (s.level >= 5 && has('janitor') < lim('janitor') && !saving && s.money > 600) hire('janitor');
  for (const role of ['guard', 'stocker', 'greeter', 'mascot', 'supervisor']) if (has(role) < lim(role) && !saving && s.money > 900) hire(role);
  if (!s.fountain && s.level >= 2 && s.money > C.FOUNTAIN.cost + 300){ s.money -= C.FOUNTAIN.cost; s.fountain = true; gain(50); }
  // Decor: a few trash cans first, then whatever's unlocked, a piece or two a night.
  for (let n = 0; n < 2 && !saving && s.money > 500 && s.decor.length < 26; n++){
    const bins = s.decor.filter(d => d.type === 'bin').length;
    const pool = Object.entries(C.DECOR).filter(([k, d]) => d.level <= s.level && k !== 'bin').map(([k]) => k);
    const type = bins < 4 ? 'bin' : pool[(s.decor.length * 7) % pool.length];
    const def = C.DECOR[type];
    if (s.money < def.cost + 400) break;
    const spot = findSpot(type, def.w, def.h);
    if (!spot) break;
    s.decor.push({ id: s.nextId++, type, x: spot.x, y: spot.y, rot: 0 }); s.money -= def.cost; gain(5); rebuildMap(s);
  }
  // Mall styles: the cheapest new wallpaper or floor, once there's money to spare.
  if (s.level >= C.STYLE_LEVEL && !saving){
    const next = [['wall', C.WALLPAPERS], ['floor', C.FLOORS]].flatMap(([slot, T]) => Object.entries(T).filter(([id, d]) => !s.style[slot + 's'].includes(id) && (d.level || 0) <= s.level).map(([id, d]) => ({ slot, id, d }))).sort((a, b) => a.d.cost - b.d.cost)[0];
    if (next && s.money > next.d.cost + 2500){ s.money -= next.d.cost; s.style[next.slot + 's'].push(next.id); s.style[next.slot] = next.id; gain(C.STYLE_XP); }
  }
  for (const z of C.ZONES) if (!s.zones[z.id] && s.level >= z.level && s.money > z.cost + 800){ s.money -= z.cost; s.zones[z.id] = true; gain(60); }
  C.EXPANSIONS.forEach((e, i) => {
    if (s.expansions[e.id] || (i && !s.expansions[C.EXPANSIONS[i - 1].id]) || s.level < e.level || s.money < e.cost + 1500) return;
    s.money -= e.cost; s.expansions[e.id] = true; gain(e.xp);
    for (const l of e.lots) s.units.push({ id: s.nextId++, ...l, state: 'vacant', store: null, stock: 0 });
    if (e.restroom) s.units.push({ id: s.nextId++, x: e.restroom.x, y: e.restroom.y, w: C.RESTROOM.w, h: C.RESTROOM.h, face: e.restroom.face, state: 'restroom', store: null, stock: 0 });
    for (const d of e.decor) s.decor.push({ id: s.nextId++, ...d });
    console.log(`      (day ${s.day}: opened the ${e.name})`);
  });
  rebuildMap(s);
}
// First spot (scanning out from the concourse) where something fits without blocking anything.
function findSpot(kind, w, h){
  const c0 = C.CONCOURSE.y, c1 = C.CONCOURSE.y + C.CONCOURSE.h, rows = [];
  if (kind === 'unit') for (let k = 0; k < 8; k++) rows.push(c0 - h - k, c1 + k);
  else rows.push(c0, c1 - 1, c0 + 1, c1 - 2, c0 - 1, c1, c0 - 2, c1 + 1);
  for (const y of rows) for (let x = 0; x <= map.w - w; x++){
    if (y < 0 || y + h > C.MAP_H) continue;
    if (kind === 'unit'){
      const face = y + h <= c0 ? 'down' : 'up';
      if (validatePlacement(S.save, 'unit', x, y, w, h, face).ok) return { x, y, face };
    } else if (validatePlacement(S.save, kind, x, y, w, h, 0).ok) return { x, y, face: 'down' };
  }
  return null;
}
