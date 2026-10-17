import * as C from '../src/config.js';
import { S, newSave, stores, addXp } from '../src/state.js';
import { rebuildMap, validatePlacement } from '../src/map.js';
import { sim, step, startDay, buildReport, addJob, setRandom, staffLook } from '../src/sim.js';
const staffLookFor = m => staffLook(m.role, m.id);
import { mulberry } from '../src/art.js';

const DAYS = +(process.argv[2] || 15), SEED = +(process.argv[3] || 7), DUMP = process.argv[4];
setRandom(mulberry(SEED));
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
  for (let tries = 0; tries < 4; tries++){
    // Open a new store type in a vacant unit if possible.
    const owned = new Set(stores(s).map(u => u.store));
    const vacant = s.units.filter(u => u.state === 'vacant');
    const choices = Object.entries(C.STORES).filter(([k, d]) => !d.kiosk && d.level <= s.level).sort((a, b) => (owned.has(a[0]) - owned.has(b[0])) || b[1].level - a[1].level);
    let opened = false;
    for (const u of vacant){
      const pick = choices.find(([k, d]) => d.w <= u.w && d.h <= u.h && s.money >= d.cost + 150 && (!owned.has(k) || owned.size >= choices.length));
      if (pick){ s.money -= pick[1].cost; u.state = 'store'; u.store = pick[0]; u.stock = pick[1].stock; gain(40); opened = true; break; }
    }
    if (opened) continue;
    // Otherwise fix up a boarded-up unit and open a store in it, in one go (the smallest unit that fits).
    const der = s.units.filter(u => u.state === 'derelict').sort((a, b) => a.w * a.h - b.w * b.h);
    for (const [k, d] of choices){
      if (owned.has(k) && owned.size < choices.length) continue;
      const u = der.find(v => v.w >= d.w && v.h >= d.h), fix = u ? u.w * u.h * C.RENOVATE_PER_TILE : 0;
      if (u && s.money >= fix + d.cost + 150){ s.money -= fix + d.cost; u.state = 'store'; u.store = k; u.stock = d.stock; gain(65); opened = true; break; }
    }
    if (opened) continue;
    break;
  }
  // Hire help when allowed.
  const lim = role => C.STAFF_LIMITS[role][s.level], has = role => s.staff.filter(m => m.role === role).length;
  if (s.level >= 3 && has('janitor') < 1 && lim('janitor') >= 1) s.staff.push({ id: s.nextId++, role: 'janitor', name: 'Dee', look: {}, fast: true });
  if (s.level >= 4){
    for (const u of stores(s).filter((_, i) => i % 2 === 0)){
      if (has('clerk') >= lim('clerk') || s.money < 600) break;
      if (!s.staff.some(m => m.storeId === u.id)) s.staff.push({ id: s.nextId++, role: 'clerk', name: 'C', look: {}, storeId: u.id });
    }
  }
  if (s.level >= 5 && has('janitor') < lim('janitor') && s.money > 600) s.staff.push({ id: s.nextId++, role: 'janitor', name: 'J', look: {} });
  if (!s.fountain && s.level >= 2 && s.money > C.FOUNTAIN.cost + 300){ s.money -= C.FOUNTAIN.cost; s.fountain = true; gain(50); }
  if (s.money > 400 && s.decor.length < 10){
    const spots = [[3, 6], [9, 8], [21, 6], [5, 8], [18, 8], [24, 7], [7, 6], [20, 8], [1, 8], [10, 6]];
    const [x, y] = spots[s.decor.length];
    const type = s.decor.filter(d => d.type === 'bin').length < 4 ? 'bin' : 'plant';
    if (validatePlacement(s, type, x, y, 1, 1, 'down').ok){ s.decor.push({ id: s.nextId++, type, x, y }); s.money -= C.DECOR[type].cost; gain(5); }
  }
  for (const z of C.ZONES) if (!s.zones[z.id] && s.level >= z.level && s.money > z.cost + 800){ s.money -= z.cost; s.zones[z.id] = true; gain(60); }
  rebuildMap(s);
}
