// The save file and per-device settings. The save is plain JSON so it can later be shared for mall visits.
import { START_CASH, START_UNITS, START_KIOSKS, STORES, DECOR, VERSION, LEVEL_XP, MAX_LEVEL, WAGES, LAYOUT, EXPANSIONS, RESTROOM, F2X, MAP_W } from './config.js';

const SAVE_KEY = 'mall-revival-save-v1';
const SETTINGS_KEY = 'mall-revival-settings';

export const S = { save: null, settings: { sound: true, music: true, tips: true } };

export function newSave(player){
  const save = {
    v: 1, layout: LAYOUT, version: VERSION, created: Date.now(),
    day: 1, money: START_CASH, xp: 0, level: 1,
    rating: 1, ratingHist: [],
    player,
    zones: {}, fountain: false, expansions: {},
    style: newStyle(),
    units: [], decor: [], staff: [],
    nextId: 1,
    flags: { tutorial: 0, tips: {}, memories: {}, pending: [], tipsToday: 0, applicants: null, appDay: 0 },
    stats: { visitors: 0, served: 0, revenue: 0, lastVisitors: 0 },
  };
  for (const u of START_UNITS){
    save.units.push({ id: save.nextId++, x: u.x, y: u.y, w: u.w, h: u.h, face: u.face, state: u.store ? 'store' : u.restroom ? 'restroom' : 'derelict', store: u.store || null, stock: u.store ? STORES[u.store].stock : 0 });
  }
  for (const k of START_KIOSKS){
    const d = STORES[k.store];
    save.units.push({ id: save.nextId++, x: k.x, y: k.y, w: d.w, h: d.h, face: 'down', kiosk: true, state: 'store', store: k.store, stock: d.stock });
  }
  return save;
}

// The mall's wallpaper and concourse floor, plus every style bought so far.
const newStyle = () => ({ wall: 'classic', floor: 'classic', walls: ['classic'], floors: ['classic'] });

export function hasSave(){
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}
export function loadSave(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.v === 1 ? upgradeSave(s) : null;
  } catch { return null; }
}
// Older saves were built on the first floor plan. Remodel them onto the current one: every store moves to an
// empty storefront of the same size (keeping its id, so clerks stay put), and anything that can't fit is refunded.
function upgradeSave(s){
  s.expansions = s.expansions || {};
  s.style = s.style || newStyle();
  if ((s.layout || 1) >= LAYOUT) return s;
  // Layout 3: the East Wing and Garden Court became the second floor. Everything out there keeps its spot, just
  // further along the grid (the escalator gets room made for it once the map is built: see clearEscalators).
  if (s.layout === 2){
    const shift = F2X - MAP_W;
    for (const u of s.units) if (u.x >= MAP_W) u.x += shift;
    for (const d of s.decor) if (d.x >= MAP_W) d.x += shift;
    s.layout = LAYOUT;
    if (s.expansions.east) s.flags.upstairs = true;
    return s;
  }
  const old = s.units, units = [];
  for (const u of START_UNITS) units.push({ id: s.nextId++, x: u.x, y: u.y, w: u.w, h: u.h, face: u.face, state: u.restroom ? 'restroom' : 'derelict', store: null, stock: 0 });
  for (const e of EXPANSIONS) if (s.expansions[e.id]){
    for (const l of e.lots) units.push({ id: s.nextId++, ...l, store: null, state: 'vacant', stock: 0 });
    if (e.restroom) units.push({ id: s.nextId++, x: e.restroom.x, y: e.restroom.y, w: RESTROOM.w, h: RESTROOM.h, face: e.restroom.face, state: 'restroom', store: null, stock: 0 });
  }
  const leftovers = [];
  const free = (w, h) => units.find(n => (n.state === 'derelict' || n.state === 'vacant') && n.w === w && n.h === h);
  const moved = old.filter(u => u.state === 'store' && !u.kiosk).sort((a, b) => (b.store === 'dollar') - (a.store === 'dollar'));
  for (const u of moved){
    const n = (u.store === 'dollar' && units.find(v => v.x === START_UNITS[3].x && v.y === START_UNITS[3].y && v.state === 'derelict')) || free(u.w, u.h);
    if (n){ n.id = u.id; n.state = 'store'; n.store = u.store; n.stock = u.stock; }
    else leftovers.push({ id: u.id, store: u.store, stock: u.stock, w: u.w, h: u.h });
  }
  for (const u of old.filter(u => u.state === 'vacant')){ const n = units.find(v => v.state === 'derelict' && v.w === u.w && v.h === u.h); if (n) n.state = 'vacant'; }
  // Kiosks, and stores with no matching storefront, get placed once the map is built (see placeLeftovers in main.js).
  s.pendingKiosks = old.filter(u => u.kiosk && u.state === 'store').map(u => ({ id: u.id, store: u.store, stock: u.stock }));
  s.pendingStores = leftovers;
  const decorRefund = s.decor.reduce((a, d) => a + (DECOR[d.type] ? DECOR[d.type].cost : 0), 0);
  s.units = units; s.decor = [];
  s.money += decorRefund;
  s.layout = LAYOUT;
  s.flags.remodel = { refund: 0, decor: decorRefund };
  return s;
}
export function writeSave(){
  if (!S.save) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.save)); } catch {}
}
export function clearSave(){
  try { localStorage.removeItem(SAVE_KEY); } catch {}
}
export function loadSettings(){
  try { Object.assign(S.settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch {}
}
export function writeSettings(){
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(S.settings)); } catch {}
}

// Older saves have no star rating: Dee was the quick one.
export const staffSkill = m => m.skill || (m.fast ? 3 : 2);
export const wageOf = m => WAGES[m.role][staffSkill(m)];
export const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export function stores(save = S.save){ return save.units.filter(u => u.state === 'store'); }
export function unitById(id){ return S.save.units.find(u => u.id === id) || null; }

// Adds XP and returns the list of levels gained.
export function addXp(n){
  const s = S.save, gained = [];
  s.xp += Math.max(0, Math.round(n));
  while (s.level < MAX_LEVEL && s.xp >= LEVEL_XP[s.level + 1]){ s.level++; gained.push(s.level); }
  return gained;
}
export function levelProgress(){
  const s = S.save;
  if (s.level >= MAX_LEVEL) return 1;
  const a = LEVEL_XP[s.level], b = LEVEL_XP[s.level + 1];
  return Math.max(0, Math.min(1, (s.xp - a) / (b - a)));
}
