// The save file and per-device settings. The save is plain JSON so it can later be shared for mall visits.
import { START_CASH, START_UNITS, START_KIOSKS, STORES, DECOR, VERSION, LEVEL_XP, MAX_LEVEL, WAGES, LAYOUT, EXPANSIONS, RESTROOM, F2X, MAP_W } from './config.js';

const SETTINGS_KEY = 'mall-revival-settings';

// Everything is kept twice: in localStorage, and copied to IndexedDB. Some browsers lose one of them, notably Safari
// with a game inside another site's page (itch.io's frame); on start, whatever's missing or older is put back from
// the other (see restoreStorage).
const DB_NAME = 'mall-revival', DB_STORE = 'kv';
let dbp = null;
function db(){
  if (!dbp) dbp = new Promise((res, rej) => {
    try { const r = indexedDB.open(DB_NAME, 1); r.onupgradeneeded = () => r.result.createObjectStore(DB_STORE); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e){ rej(e); }
  });
  return dbp;
}
const idb = (mode, f) => db().then(d => new Promise((res, rej) => { const tx = d.transaction(DB_STORE, mode), q = f(tx.objectStore(DB_STORE)); tx.oncomplete = () => res(q && q.result); tx.onerror = tx.onabort = () => rej(tx.error); }));
// mem: this session's copy, for when localStorage refuses outright (some private modes).
const mem = {};
function get(k){ try { const v = localStorage.getItem(k); return v != null ? v : mem[k] ?? null; } catch { return mem[k] ?? null; } }
function put(k, v){
  mem[k] = v;
  idb('readwrite', st => st.put(v, k)).catch(() => {});
  localStorage.setItem(k, v);
}
function drop(k){
  delete mem[k];
  idb('readwrite', st => st.delete(k)).catch(() => {});
  localStorage.removeItem(k);
}
// On start: copies back anything localStorage has lost (or holds an older save of) from IndexedDB, and copies
// anything IndexedDB is missing over to it. Gives up after a moment rather than hold up the title screen.
export async function restoreStorage(){
  const keys = [SETTINGS_KEY, ACTIVE_KEY, ...Array.from({ length: SAVE_SLOTS }, (_, i) => slotKey(i + 1))];
  const stamp = raw => { try { return JSON.parse(raw).savedAt || 0; } catch { return 0; } };
  const work = (async () => {
    for (const k of keys){
      const kept = await idb('readonly', st => st.get(k));
      const here = get(k);
      if (kept != null && (here == null || (k.includes('-save-') && stamp(kept) > stamp(here)))){ mem[k] = kept; try { localStorage.setItem(k, kept); } catch {} }
      else if (here != null && kept !== here) await idb('readwrite', st => st.put(here, k));
    }
  })().catch(() => {});
  await Promise.race([work, new Promise(r => setTimeout(r, 1500))]);
}
// Save slots (Dev options). Slot 1 is the original save key, so saves from before slots existed are slot 1. The
// slot in use is remembered on the device, and the game opens it next time.
export const SAVE_SLOTS = 5;
const ACTIVE_KEY = 'mall-revival-active-slot';
const slotKey = n => n === 1 ? 'mall-revival-save-v1' : `mall-revival-save-v1-slot${n}`;
export function activeSlot(){
  let n = 1; try { n = parseInt(get(ACTIVE_KEY), 10) || 1; } catch {}
  return n >= 1 && n <= SAVE_SLOTS ? n : 1;
}
export function setActiveSlot(n){ try { put(ACTIVE_KEY, String(n)); } catch {} }
// What's in each slot, for the picker: null for an empty one.
export function listSlots(){
  const out = [];
  for (let n = 1; n <= SAVE_SLOTS; n++){
    let info = null;
    try { const raw = get(slotKey(n)); if (raw){ const s = JSON.parse(raw); info = { mall: s.player && s.player.mall || 'My Mall', day: s.day, level: s.level, money: s.money, version: s.version }; } } catch { info = { broken: true }; }
    out.push({ n, info, active: n === activeSlot() });
  }
  return out;
}
export function deleteSlot(n){ try { drop(slotKey(n)); } catch {} }
export function copySlot(from, to){
  try { const raw = get(slotKey(from)); if (!raw) return false; put(slotKey(to), raw); return true; } catch { return false; }
}
const saveKey = () => slotKey(activeSlot());

// Volumes are 0-100. `sound` and `music` follow them (on when above zero); older settings only had the switches.
// What the volume sliders start at (and go back to with Reset volume).
export const VOLUME_DEFAULTS = { volMaster: 80, volSfx: 80, volMusic: 70 };
export const S = { save: null, settings: { sound: true, music: true, tips: true, ...VOLUME_DEFAULTS, saver: false } };

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
  try { return !!get(saveKey()); } catch { return false; }
}
export function loadSave(){
  try {
    const raw = get(saveKey());
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
  // v0.20.3: the speakeasy opens with just the Velvet Rose and its restrooms. Its three empty storefronts go (only
  // ones still empty: anything built there stays).
  if (s.flags && !s.flags.speakLots && (s.flags.speakLots = true)) for (const [x, y] of [[119, 4], [121, 11], [125, 11]]){ const i = (s.units || []).findIndex(u => u.x === x && u.y === y && u.state === 'vacant'); if (i >= 0) s.units.splice(i, 1); }
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
  S.save.savedAt = Date.now();
  try { put(saveKey(), JSON.stringify(S.save)); } catch {}
}
// A save backup is the last saved copy (from the end of the last night) as a code to copy and paste,
// e.g. from the Android app to an iPhone.
const CODE_TAG = 'MALL1:';
export function exportSave(){
  const raw = get(saveKey());
  return raw ? CODE_TAG + btoa(unescape(encodeURIComponent(raw))) : null;
}
// Returns the save the code holds (for a confirm), or null if it isn't one.
export function readSaveCode(code){
  try {
    const t = String(code).trim(), raw = t.startsWith(CODE_TAG) ? decodeURIComponent(escape(atob(t.slice(CODE_TAG.length)))) : t;
    const s = JSON.parse(raw);
    return s && s.v === 1 && s.player && Array.isArray(s.units) ? s : null;
  } catch { return null; }
}
export function importSave(s){
  s.savedAt = Date.now();
  try { put(saveKey(), JSON.stringify(s)); return true; } catch { return false; }
}
// itch.io's frame on iPhone keeps nothing once Safari closes, and the game in its own tab has separate storage, so
// "Open in a tab" (ui.js, frameSaveTip) passes the save along in the link: #carry=<slot>.<backup code>.
export function carryLink(){
  const base = location.href.split('#')[0], code = exportSave();
  return code ? `${base}#carry=${activeSlot()}.${encodeURIComponent(code)}` : base;
}
// On start, in the new tab: takes the carried save unless this tab already has a newer one in that slot.
export function takeCarried(){
  const m = /^#carry=(\d)\.(.+)$/.exec(location.hash);
  if (!m) return;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  let s = null; try { s = readSaveCode(decodeURIComponent(m[2])); } catch {}
  if (!s) return;
  const n = Math.min(SAVE_SLOTS, Math.max(1, +m[1])), here = get(slotKey(n));
  let at = 0; try { at = here ? JSON.parse(here).savedAt || 0 : 0; } catch {}
  try { if (!here || (s.savedAt || 0) >= at) put(slotKey(n), JSON.stringify(s)); setActiveSlot(n); } catch {}
}
export function clearSave(){
  try { drop(saveKey()); } catch {}
}
export function loadSettings(){
  let saved = {};
  try { saved = JSON.parse(get(SETTINGS_KEY) || '{}') || {}; } catch {}
  if (saved.volSfx === undefined && saved.sound === false) saved.volSfx = 0;
  if (saved.volMusic === undefined && saved.music === false) saved.volMusic = 0;
  Object.assign(S.settings, saved);
  S.settings.sound = S.settings.volSfx > 0; S.settings.music = S.settings.volMusic > 0;
}
export function writeSettings(){
  try { put(SETTINGS_KEY, JSON.stringify(S.settings)); } catch {}
}

// Older saves have no star rating: Dee was the quick one.
export const staffSkill = m => m.skill || (m.fast ? 3 : 2);
export const wageOf = m => WAGES[m.role][staffSkill(m)];
export const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export function stores(save = S.save){ return save.units.filter(u => u.state === 'store'); }
// Stores and kiosks with a register but nobody behind it.
export function unstaffed(save = S.save){
  return stores(save).filter(u => !STORES[u.store].attraction && !save.staff.some(m => m.storeId === u.id));
}
// Clerks without a register take the open ones, dream store first. Returns the names of who moved where.
export function assignClerks(save = S.save){
  const moved = [];
  for (const m of save.staff){
    if (m.role !== 'clerk' || m.storeId) continue;
    const open = unstaffed(save);
    if (!open.length) break;
    const u = open.find(v => v.store === m.dream) || open[0];
    m.storeId = u.id; moved.push({ name: m.name, store: STORES[u.store].name });
  }
  return moved;
}
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
