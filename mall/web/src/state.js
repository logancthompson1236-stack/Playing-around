// The save file and per-device settings. The save is plain JSON so it can later be shared for mall visits.
import { START_CASH, START_UNITS, START_KIOSKS, STORES, VERSION, LEVEL_XP, MAX_LEVEL, WAGES, RESTROOM_SPOT } from './config.js';

const SAVE_KEY = 'mall-revival-save-v1';
const SETTINGS_KEY = 'mall-revival-settings';

export const S = { save: null, settings: { sound: true, music: true, tips: true } };

export function newSave(player){
  const save = {
    v: 1, version: VERSION, created: Date.now(),
    day: 1, money: START_CASH, xp: 0, level: 1,
    rating: 1, ratingHist: [],
    player,
    zones: {}, fountain: false, expansions: {},
    units: [], decor: [], staff: [],
    nextId: 1,
    flags: { tutorial: 0, tips: {}, memories: {}, pending: [], tipsToday: 0, applicants: null, appDay: 0 },
    stats: { visitors: 0, served: 0, revenue: 0, lastVisitors: 0 },
  };
  for (const u of START_UNITS){
    const restroom = u.x === RESTROOM_SPOT.x && u.y === RESTROOM_SPOT.y;
    save.units.push({ id: save.nextId++, x: u.x, y: u.y, w: u.w, h: u.h, face: u.face, state: u.store ? 'store' : restroom ? 'restroom' : 'derelict', store: u.store || null, stock: u.store ? STORES[u.store].stock : 0 });
  }
  for (const k of START_KIOSKS){
    const d = STORES[k.store];
    save.units.push({ id: save.nextId++, x: k.x, y: k.y, w: d.w, h: d.h, face: 'down', kiosk: true, state: 'store', store: k.store, stock: d.stock });
  }
  return save;
}

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
// Older saves predate restrooms and expansions: turn the spare 2×2 storefront into restrooms if there is one.
function upgradeSave(s){
  s.expansions = s.expansions || {};
  if (!s.units.some(u => u.state === 'restroom')){
    const spare = s.units.find(u => !u.kiosk && u.w === 2 && u.h === 2 && u.x === RESTROOM_SPOT.x && u.y === RESTROOM_SPOT.y && u.state !== 'store')
      || s.units.find(u => !u.kiosk && u.w === 2 && u.h === 2 && u.state === 'derelict')
      || s.units.find(u => !u.kiosk && u.w === 2 && u.h === 2 && u.state === 'vacant');
    if (spare){ spare.state = 'restroom'; spare.store = null; spare.stock = 0; }
  }
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
