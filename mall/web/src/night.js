// Night mode: tapping things in the mall, the Build and Staff panels, and placing or moving things.
import * as C from './config.js';
import * as A from './art.js';
import { S, writeSave, addXp, stores } from './state.js';
import { map, rebuildMap, validatePlacement, zoneAt, occAt, FOUNTAIN_ID, unitAccess } from './map.js';
import { sim, staffLook } from './sim.js';
import { view, invalidate, poof, worldToScreen } from './render.js';
import { h, openPanel, closePanel, showCard, hideCard, toast, iconCanvas, portrait, showPlacementBar, hidePlacementBar, confirmBox, setToolDot } from './ui.js';
import { sfx } from './audio.js';
import { tip, addMemory, seenTips } from './guide.js';
import { TIPS, MEMORIES } from './story.js';

const money = n => `$${Math.round(n).toLocaleString()}`;
// Fixing up a boarded-up storefront is folded into the price of opening a store in it.
const fixCost = u => u.state === 'derelict' ? u.w * u.h * C.RENOVATE_PER_TILE : 0;
const shellCost = (w, h) => w * h * C.BUILD_PER_TILE;
let place = null, pick = null;
export let onLevelUp = () => {};
export function setLevelUpHandler(fn){ onLevelUp = fn; }
export function panTo(x, y){ view.camTarget = { x, y }; }

function changed(xp = 0){
  rebuildMap(S.save); invalidate();
  if (xp){ const gained = addXp(xp); if (gained.length) onLevelUp(gained); }
  writeSave();
}
function spend(cost){
  if (S.save.money < cost){ sfx('error'); toast(`Not enough money (need ${money(cost)})`); return false; }
  S.save.money -= cost; return true;
}

/* ---------- Tapping at night ---------- */
export function nightTap(wx, wy){
  if (pick) return pickTap(wx, wy);
  if (place){ moveGhostTo(wx - place.w / 2 + 0.5, wy - place.h / 2 + 0.5); return; }
  const tx = Math.floor(wx), ty = Math.floor(wy);
  // Tall things are drawn above their footprint, so also look one row down.
  const id = occAt(tx, ty) || occAt(tx, Math.floor(wy + 0.7));
  if (id === FOUNTAIN_ID) return fountainCard();
  if (id){
    const u = S.save.units.find(v => v.id === id);
    if (u) return unitCard(u);
    const d = S.save.decor.find(v => v.id === id);
    if (d) return decorCard(d);
  }
  const z = zoneAt(tx, ty);
  if (z) return zoneCard(C.ZONES.find(q => q.id === z));
  hideCard(); view.selected = null;
}

function unitCard(u){
  view.selected = { x: u.x, y: u.y, w: u.w, h: u.h };
  const s = S.save;
  if (u.state === 'derelict' || u.state === 'vacant'){
    const boarded = u.state === 'derelict';
    const actions = [{ label: 'Open a store here', primary: true, onClick: () => openInUnit(u) }];
    if (!boarded) actions.unshift({ label: 'Remove shell', onClick: async () => { if (await confirmBox('Tear out this shell to free up the floor?', 'Tear it out')){ s.units = s.units.filter(v => v !== u); hideCard(); view.selected = null; poof(u.x, u.y, u.w, u.h); changed(); } } });
    return showCard({ title: boarded ? 'Boarded-up storefront' : 'Empty storefront', text: boarded ? `${u.w}×${u.h}, left over from the old days. Pick a store and it gets fixed up and opened in one go.` : `${u.w}×${u.h}, clean and ready. Pick a store to open here.`, actions });
  }
  const def = C.STORES[u.store];
  const clerk = s.staff.find(m => m.role === 'clerk' && m.storeId === u.id);
  const refund = Math.round(def.cost * 0.5);
  showCard({
    title: def.name,
    text: `${def.cat} · Stock ${u.stock}/${def.stock}${clerk ? ` · ${clerk.name} runs the register` : ' · You run the register'}`,
    actions: [
      { label: 'Move', onClick: () => startPlacement({ kind: u.kiosk ? 'kiosk' : 'unit', store: u.store, w: u.w, h: u.h, face: u.face, cost: 0, moveId: u.id, x: u.x, y: u.y }) },
      { label: u.kiosk ? `Sell · +${money(refund)}` : `Close store · +${money(refund)}`, onClick: async () => {
        if (!(await confirmBox(u.kiosk ? `Sell ${def.name}?` : `Close ${def.name}? The empty unit stays.`, u.kiosk ? 'Sell' : 'Close it'))) return;
        if (u.kiosk) s.units = s.units.filter(v => v !== u); else { u.state = 'vacant'; u.store = null; u.stock = 0; }
        for (const m of s.staff) if (m.storeId === u.id) m.storeId = null;
        s.money += refund; hideCard(); view.selected = null; sfx('coin'); changed();
      } },
    ],
  });
}
// Every empty or boarded-up storefront a store fits in, cheapest first.
function roomFor(key){
  const def = C.STORES[key];
  if (def.kiosk) return [];
  return S.save.units.filter(u => !u.kiosk && u.state !== 'store' && def.w <= u.w && def.h <= u.h)
    .map(u => ({ u, cost: def.cost + fixCost(u) })).sort((a, b) => a.cost - b.cost);
}
function openStore(u, key){
  const def = C.STORES[key];
  if (!spend(def.cost + fixCost(u))) return false;
  const xp = u.state === 'derelict' ? 65 : 40;
  u.state = 'store'; u.store = key; u.stock = def.stock;
  S.save.flags.opened = true;
  sfx('build'); poof(u.x, u.y, u.w, u.h);
  if (key === 'arcade') addMemory('arcade');
  changed(xp);
  toast(`${def.name} is open for business!`);
  tip('move');
  return true;
}
function openInUnit(u){
  hideCard();
  const fix = fixCost(u);
  openPanel({ title: 'Open a store here', render: body => {
    body.append(h('p', { class: 'muted', style: 'margin:0' }, `This storefront is ${u.w}×${u.h}.${fix ? ` Prices include ${money(fix)} to fix it up.` : ''} Stores that fit:`));
    for (const [key, def] of Object.entries(C.STORES)){
      if (def.kiosk || def.w > u.w || def.h > u.h) continue;
      body.append(storeItem(key, def, def.cost + fix, () => { if (openStore(u, key)){ closePanel(); view.selected = null; } }));
    }
  } });
}
function storeItem(key, def, cost, onPick){
  const locked = S.save.level < def.level, afford = S.save.money >= cost;
  const b = h('button', { class: `item ${locked ? 'locked' : afford ? 'can' : ''}`, disabled: locked, onclick: () => { sfx('tap'); onPick(); } },
    iconCanvas(() => A.storeIcon(def.icon, 0.5, 0.5, 0.62)),
    h('span', { class: 'info' }, h('span', { class: 'name' }, def.name), h('span', { class: 'sub' }, `${def.w}×${def.h} · ${def.cat} · sells $${def.price[0]}–${def.price[1]}`)),
    h('span', { class: 'price' }, locked ? `Level ${def.level}` : money(cost)));
  return b;
}
function decorCard(d){
  const def = C.DECOR[d.type];
  view.selected = { x: d.x, y: d.y, w: def.w, h: def.h, bin: !!def.bin };
  showCard({ title: def.name, text: def.bin ? 'Most shoppers inside the green circle toss their trash in here instead of on the floor.' : def.seat ? 'A place to sit. Folks like a break.' : 'Makes the place feel nicer.', actions: [
    { label: 'Move', onClick: () => startPlacement({ kind: d.type, decor: d.type, w: def.w, h: def.h, cost: 0, moveId: d.id, x: d.x, y: d.y }) },
    { label: `Sell · +${money(def.cost / 2)}`, onClick: () => { S.save.decor = S.save.decor.filter(v => v !== d); S.save.money += Math.round(def.cost / 2); hideCard(); view.selected = null; sfx('coin'); changed(); } }] });
}
function fountainCard(){
  const f = C.FOUNTAIN;
  view.selected = { x: f.x, y: f.y, w: f.w, h: f.h };
  if (S.save.fountain) return showCard({ title: 'The fountain', text: 'Running again. Folks stop to sit here, and it brightens up the whole concourse.' });
  showCard({ title: 'The old fountain', text: 'Dry as a bone and full of old receipts. It used to be the heart of this place.', actions: [{ label: `Restore · ${money(f.cost)}`, primary: true, disabled: S.save.money < f.cost, onClick: () => {
    if (!spend(f.cost)) return;
    S.save.fountain = true; hideCard(); view.selected = null; sfx('build'); poof(f.x, f.y, f.w, f.h);
    addMemory('fountain'); changed(50);
    toast('The fountain is running again!');
  } }] });
}
function zoneCard(z){
  view.selected = { x: z.x, y: z.y, w: z.w, h: z.h };
  const s = S.save, locked = s.level < z.level;
  showCard({ title: z.name, text: 'Dusty storage full of old boxes and pigeons. Build a store here and it gets cleared out as part of the job, or clear it now.', warn: locked ? `Unlocks at level ${z.level}` : null,
    actions: locked ? [] : [{ label: `Clear it out · ${money(z.cost)}`, primary: true, disabled: s.money < z.cost, onClick: () => {
      if (!spend(z.cost)) return;
      s.zones[z.id] = true; hideCard(); view.selected = null; sfx('build'); poof(z.x, z.y, z.w, z.h);
      changed(60); toast(`${z.name} is cleared. Build anything you like there.`);
    } }] });
}

/* ---------- Build panel ---------- */
export function openBuild(startTab = 0){
  endPick(); endPlacement(); hideCard(); view.selected = null;
  openPanel({ title: 'Build', tabs: ['Stores', 'Decor', 'Fix up'], tab: startTab, render: (body, tab) => {
    const s = S.save;
    if (tab === 0){
      body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, 'Pick a store, then tap a glowing storefront to open it there.'));
      for (const [key, def] of Object.entries(C.STORES)){
        const room = roomFor(key);
        const cost = room.length ? room[0].cost : newCost(key);
        body.append(storeItem(key, def, cost, () => { closePanel(); startPick(key); }));
      }
    } else if (tab === 1){
      for (const [key, def] of Object.entries(C.DECOR)){
        const b = h('button', { class: `item ${s.money >= def.cost ? 'can' : ''}`, onclick: () => { sfx('tap'); closePanel(); startPlacement({ kind: key, decor: key, w: def.w, h: def.h, cost: def.cost }); } },
          iconCanvas(() => { if (key === 'plant') A.palm(0.5, 0.92); else if (key === 'bin') A.trashCan(0.5, 0.85); else { A.g.scale(0.5, 0.5); A.bench(0.1, 1.1, 1.8); } }),
          h('span', { class: 'info' }, h('span', { class: 'name' }, def.name), h('span', { class: 'sub' }, def.bin ? 'Shoppers nearby toss trash in it' : def.seat ? 'Somewhere to sit · +ambience' : '+ambience')),
          h('span', { class: 'price' }, money(def.cost)));
        body.append(b);
      }
    } else {
      body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, 'Storage clears out by itself when you build a store in it. You can also clear it here.'));
      const f = C.FOUNTAIN;
      body.append(fixItem('The old fountain', s.fountain ? 'Running again' : 'Folks will stop to sit a while', s.fountain ? 'Done' : money(f.cost), s.fountain, () => { closePanel(); panTo(f.x + 1, f.y + 1); fountainCard(); }));
      for (const z of C.ZONES){
        const done = !!s.zones[z.id], locked = s.level < z.level;
        body.append(fixItem(z.name, done ? 'Cleared' : `${z.w}×${z.h} of storage`, done ? 'Done' : locked ? `Level ${z.level}` : money(z.cost), done || locked, () => { closePanel(); panTo(z.x + z.w / 2, z.y + z.h / 2); zoneCard(z); }));
      }
    }
  } });
}
function fixItem(name, sub, price, dim, onClick){
  return h('button', { class: `item ${dim ? 'locked' : 'can'}`, onclick: () => { sfx('tap'); onClick(); } },
    iconCanvas(() => { A.storeIcon('broom', 0.5, 0.5, 0.65); }),
    h('span', { class: 'info' }, h('span', { class: 'name' }, name), h('span', { class: 'sub' }, sub)),
    h('span', { class: 'price' }, price));
}

/* ---------- Picking a storefront for a store ---------- */
const newCost = key => { const d = C.STORES[key]; return d.cost + (d.kiosk ? 0 : shellCost(d.w, d.h)); };
function startNew(key){
  const def = C.STORES[key];
  startPlacement({ kind: def.kiosk ? 'kiosk' : 'unit', store: key, w: def.w, h: def.h, face: 'down', cost: newCost(key) });
}
function startPick(key){
  const def = C.STORES[key], spots = roomFor(key);
  if (!spots.length){
    if (!def.kiosk) toast(`No empty storefront fits ${def.name}, so put up a new one.`, 3000);
    return startNew(key);
  }
  hideCard(); view.selected = null;
  pick = { key, spots, sel: null };
  view.spots = spots.map(sp => ({ x: sp.u.x, y: sp.u.y, w: sp.u.w, h: sp.u.h, label: money(sp.cost), sel: false, afford: S.save.money >= sp.cost }));
  frameSpots(spots);
  pick.bar = showPlacementBar({ label: '', confirmLabel: 'Open', onCancel: endPick, onConfirm: confirmPick,
    extra: { label: 'Build new', onClick: () => { endPick(); startNew(key); } } });
  refreshPick();
}
// Zoom out just enough to see every spot.
function frameSpots(spots){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { u } of spots){ x0 = Math.min(x0, u.x); y0 = Math.min(y0, u.y - 1); x1 = Math.max(x1, u.x + u.w); y1 = Math.max(y1, u.y + u.h); }
  const fit = Math.min(view.W / (x1 - x0 + 2), (view.H - 150) / (y1 - y0 + 2));
  view.camTarget = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: Math.max(view.minS, Math.min(view.cam.s, fit)) };
}
function pickTap(wx, wy){
  // Storefront walls and signs are drawn above the footprint, so taps there count too.
  const sp = pick.spots.find(({ u }) => wx >= u.x && wx < u.x + u.w && wy >= u.y - 1 && wy < u.y + u.h + 0.3) || null;
  if (sp) sfx('tap');
  pick.sel = sp;
  refreshPick();
}
function refreshPick(){
  const def = C.STORES[pick.key], sel = pick.sel;
  view.spots.forEach((v, i) => { v.sel = pick.spots[i] === sel; });
  const short = sel && S.save.money < sel.cost;
  pick.bar.info.textContent = !sel ? `Tap a glowing storefront for ${def.name}` : short ? `Not enough money (need ${money(sel.cost)})` : `${def.name} here${fixCost(sel.u) ? ', fix-up included' : ''}`;
  pick.bar.info.style.color = short ? '#b3263e' : '';
  pick.bar.confirm.textContent = sel ? `Open · ${money(sel.cost)}` : 'Open';
  pick.bar.confirm.disabled = !sel || short;
}
function confirmPick(){
  if (!pick || !pick.sel) return;
  if (openStore(pick.sel.u, pick.key)) endPick();
}
export function endPick(){ if (!pick) return; pick = null; view.spots = null; hidePlacementBar(); }

/* ---------- Placement ---------- */
export const placing = () => !!place || !!pick;
function startPlacement(p){
  hideCard(); view.selected = null;
  place = { ...p };
  if (p.x === undefined){
    const c = view.cam; let best = null;
    // Start near the middle of the screen, on the nearest spot that works (clean floor first, then storage).
    for (const dusty of [false, true]) for (let r = 0; r < 14 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++){
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = Math.round(c.x - p.w / 2) + dx, y = Math.round(c.y - p.h / 2) + dy;
      const v = validate(x, y, p.face);
      if (v.ok && (dusty || !v.zones.length)) best = { x, y };
    }
    place.x = best ? best.x : Math.round(c.x - p.w / 2); place.y = best ? best.y : Math.round(c.y - p.h / 2);
  }
  const name = p.store ? C.STORES[p.store].name : C.DECOR[p.decor].name;
  place.name = p.moveId ? `Move ${name}` : name;
  place.bar = showPlacementBar({ label: place.name, canFlip: p.kind === 'unit', onFlip: () => { place.face = place.face === 'down' ? 'up' : 'down'; refreshGhost(); }, onCancel: endPlacement, onConfirm: confirmPlacement });
  refreshGhost();
}
// Stores can go into dusty storage: clearing it out is part of the job (and the price).
function validate(x, y, face){
  const zones = [];
  if (place.store){
    const tiles = [];
    for (let j = y; j < y + place.h; j++) for (let i = x; i < x + place.w; i++) tiles.push([i, j]);
    const a = accessFor(x, y, face); if (a) tiles.push([a.x, a.y]);
    for (const [i, j] of tiles){ const id = zoneAt(i, j), z = id && C.ZONES.find(q => q.id === id); if (z && !zones.includes(z)) zones.push(z); }
    const locked = zones.find(z => S.save.level < z.level);
    if (locked) return { ok: false, reason: `${locked.name} opens at level ${locked.level}`, zones: [] };
  }
  const v = validatePlacement(S.save, place.kind, x, y, place.w, place.h, face, place.moveId || 0, zones.map(z => z.id));
  return { ...v, zones };
}
function accessFor(x, y, face){
  if (place.kind === 'unit'){ const dx = x + Math.floor(place.w / 2); return face === 'down' ? { x: dx, y: y + place.h } : { x: dx, y: y - 1 }; }
  if (place.kind === 'kiosk') return { x: x + 1, y: y + 1 };
  return null;
}
const placeCost = v => (place.moveId ? 0 : place.cost) + v.zones.reduce((a, z) => a + z.cost, 0);
function refreshGhost(){
  const v = validate(place.x, place.y, place.face);
  place.ok = v.ok;
  const access = accessFor(place.x, place.y, place.face), cost = placeCost(v);
  const temp = { id: 9999, x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, state: 'store', store: place.store, stock: 1, kiosk: place.kind === 'kiosk' };
  view.ghost = { x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, ok: v.ok, access, bin: place.decor === 'bin', zones: v.ok ? v.zones : [], preview: t => {
    if (place.kind === 'unit'){ const def = C.STORES[place.store]; A.unitBack(temp, def, t); A.storeFurniture(temp, def, t, 'counter'); A.unitFront(temp, def, t); }
    else if (place.kind === 'kiosk') A.kiosk(temp, C.STORES[place.store], t);
    else if (place.decor === 'plant') A.palm(place.x + 0.5, place.y + 0.85);
    else if (place.decor === 'bin') A.trashCan(place.x + 0.5, place.y + 0.8);
    else if (place.decor === 'bench') A.bench(place.x + 0.1, place.y + 0.15, 1.8);
  } };
  if (place.bar){
    const clears = v.zones.length ? ` · clears ${v.zones.map(z => z.name).join(' and ')}` : '';
    const short = v.ok && S.save.money < cost;
    place.bar.info.textContent = !v.ok ? v.reason : short ? `Not enough money (need ${money(cost)})${clears}` : `${place.name}${clears} · drag to move`;
    place.bar.info.style.color = v.ok && !short ? '' : '#b3263e';
    place.bar.confirm.disabled = !v.ok || short;
    place.bar.confirm.textContent = cost ? `Place · ${money(cost)}` : 'Place';
  }
}
export function moveGhostTo(x, y){
  if (!place) return;
  const nx = Math.round(x - 0.5), ny = Math.round(y - 0.5);
  if (nx === place.x && ny === place.y) return;
  place.x = Math.max(0, Math.min(C.MAP_W - place.w, nx)); place.y = Math.max(0, Math.min(C.MAP_H - place.h, ny));
  refreshGhost();
}
export function grabGhost(wx, wy){
  if (!place) return false;
  if (wx >= place.x - 0.5 && wx <= place.x + place.w + 0.5 && wy >= place.y - 1 && wy <= place.y + place.h + 0.5){ place.grab = { dx: wx - place.x, dy: wy - place.y }; return true; }
  return false;
}
export function dragGhost(wx, wy){ if (place && place.grab) moveGhostTo(wx - place.grab.dx + 0.5, wy - place.grab.dy + 0.5); }
function confirmPlacement(){
  if (!place || !place.ok){ sfx('error'); return; }
  const s = S.save, p = place, v = validate(p.x, p.y, p.face);
  if (!v.ok){ sfx('error'); return; }
  const cost = placeCost(v);
  if (cost && !spend(cost)) return;
  let xp = 0;
  for (const z of v.zones){ s.zones[z.id] = true; poof(z.x, z.y, z.w, z.h); xp += 60; }
  if (v.zones.length) toast(`${v.zones.map(z => z.name).join(' and ')} cleared out!`);
  if (p.moveId){
    const u = s.units.find(v => v.id === p.moveId), d = s.decor.find(v => v.id === p.moveId);
    if (u){ u.x = p.x; u.y = p.y; u.face = p.face || u.face; }
    if (d){ d.x = p.x; d.y = p.y; }
  } else if (p.kind === 'unit' || p.kind === 'kiosk'){
    const def = C.STORES[p.store];
    s.units.push({ id: s.nextId++, x: p.x, y: p.y, w: p.w, h: p.h, face: p.kind === 'kiosk' ? 'down' : p.face, kiosk: p.kind === 'kiosk' || undefined, state: 'store', store: p.store, stock: def.stock });
    if (p.store === 'arcade') addMemory('arcade');
    s.flags.opened = true;
    xp += 50;
  } else {
    s.decor.push({ id: s.nextId++, type: p.decor, x: p.x, y: p.y });
    xp += 5;
  }
  sfx('build'); poof(p.x, p.y, p.w, p.h);
  endPlacement();
  changed(xp);
}
export function endPlacement(){ place = null; view.ghost = null; hidePlacementBar(); }

/* ---------- Staff ---------- */
function applicants(){
  const s = S.save, f = s.flags;
  // New applicants each day, and right away when a level unlocks a new role.
  const key = `${s.day}:${s.level}`;
  if (f.appDay !== key || !f.applicants){
    const roles = [];
    if (s.level >= 4) roles.push('clerk', 'clerk', 'clerk');
    if (s.level >= 3) roles.push('janitor');
    const list = [], used = new Set(['Dee', ...s.staff.map(m => m.name)]);
    roles.forEach((role, i) => {
      const seed = s.day * 31 + i * 7 + s.level * 101 + s.nextId;
      const R = A.mulberry(seed);
      let name; do { name = C.FIRST_NAMES[Math.floor(R() * C.FIRST_NAMES.length)]; } while (used.has(name) && used.size < C.FIRST_NAMES.length);
      used.add(name);
      list.push({ seed, role, name });
    });
    f.applicants = list; f.appDay = key;
  }
  const out = [...f.applicants];
  if (s.level >= 3 && !f.hiredDee) out.unshift({ seed: 2004, role: 'janitor', name: 'Dee', dee: true });
  return out;
}
export function openStaff(){
  endPick(); endPlacement(); hideCard(); view.selected = null; setToolDot('staff', false);
  openPanel({ title: 'Staff', render: (body, tab, redraw) => {
    const s = S.save, L = C.STAFF_LIMITS, count = role => s.staff.filter(m => m.role === role).length;
    const limits = `Janitors ${count('janitor')}/${L.janitor[s.level]}` + (s.level >= 4 ? ` · Clerks ${count('clerk')}/${L.clerk[s.level]}` : ' · Clerks unlock at level 4');
    body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, s.level < 3 ? 'You can start hiring at level 3. Until then, it’s all you.' : `${limits}. Wages come out each night.`));
    if (s.staff.length) body.append(h('div', { class: 'section-label' }, 'Working for you'));
    for (const m of s.staff){
      const ownStores = stores(s).filter(u => !s.staff.some(o => o !== m && o.storeId === u.id));
      const sel = m.role === 'clerk' ? h('select', { 'aria-label': `${m.name}'s register`, onchange: e => { m.storeId = +e.target.value || null; writeSave(); } },
        h('option', { value: '' }, 'No register'), ownStores.map(u => h('option', { value: u.id, selected: m.storeId === u.id }, C.STORES[u.store].name))) : null;
      body.append(h('div', { class: 'staff-row' }, portrait(m.look, 44),
        h('span', { class: 'info', style: 'flex:1;min-width:0' }, h('span', { class: 'name', style: 'font:600 15px var(--display);display:block' }, m.name), h('span', { class: 'sub muted', style: 'font-size:12px' }, `${m.role === 'janitor' ? 'Janitor' : 'Clerk'} · ${money(C.WAGES[m.role])}/day${m.fast ? ' · quick' : ''}`)),
        sel,
        h('button', { class: 'btn small', onclick: async () => { if (await confirmBox(`Let ${m.name} go?`, 'Let go')){ s.staff = s.staff.filter(o => o !== m); if (m.dee) s.flags.hiredDee = false; writeSave(); redraw(); } } }, 'Let go')));
    }
    if (s.level >= 3){
      body.append(h('div', { class: 'section-label' }, 'Looking for work'));
      for (const a of applicants()){
        const look = staffLook(a.role, a.seed);
        const full = count(a.role) >= L[a.role][s.level];
        body.append(h('div', { class: 'staff-row' }, portrait(look, 44),
          h('span', { class: 'info', style: 'flex:1;min-width:0' }, h('span', { style: 'font:600 15px var(--display);display:block' }, a.name), h('span', { class: 'muted', style: 'font-size:12px' }, `${a.role === 'janitor' ? 'Janitor' : 'Clerk'} · ${money(C.WAGES[a.role])}/day${a.dee ? ' · Gus recommends her: works faster' : ''}`)),
          h('button', { class: 'btn small primary', disabled: full, 'data-dee': a.dee ? '1' : null, onclick: () => {
            const free = stores(s).find(u => !s.staff.some(o => o.storeId === u.id) && !u.kiosk) || stores(s).find(u => !s.staff.some(o => o.storeId === u.id));
            s.staff.push({ id: s.nextId++, role: a.role, name: a.name, look, storeId: a.role === 'clerk' && free ? free.id : null, fast: !!a.dee, dee: !!a.dee });
            if (a.dee) s.flags.hiredDee = true; else s.flags.applicants = s.flags.applicants.filter(x => x !== a);
            sfx('build'); writeSave(); redraw(); tip('speed');
            toast(`${a.name} starts tomorrow`);
          } }, full ? 'Team full' : 'Hire')));
      }
    }
  } });
}

/* ---------- Notebook ---------- */
export function openNotebook(){
  endPick(); endPlacement(); hideCard(); view.selected = null; setToolDot('notebook', false);
  openPanel({ title: 'Gus’s notebook', render: body => {
    const keys = seenTips();
    if (!keys.length) body.append(h('p', { class: 'muted' }, 'Empty for now. Gus’s tips land here as they come up.'));
    body.append(h('div', { class: 'notebook' }, keys.map(k => TIPS[k] ? h('div', { class: 'entry' }, h('b', {}, TIPS[k].title), h('div', {}, TIPS[k].text)) : null)));
    const mem = Object.keys(S.save.flags.memories);
    if (mem.length){
      body.append(h('div', { class: 'section-label' }, 'Gus’s stories'));
      body.append(h('div', { class: 'notebook' }, mem.map(k => h('div', { class: 'entry' }, h('b', {}, MEMORIES[k].title), h('div', { class: 'muted' }, MEMORIES[k].lines[1] || MEMORIES[k].lines[0])))));
    }
  } });
}

/* ---------- Night tips ---------- */
export function nightTips(report){
  const s = S.save;
  tip('night');
  const open = Object.entries(C.STORES).filter(([, d]) => !d.kiosk && d.level <= s.level).flatMap(([k]) => roomFor(k).map(r => r.cost));
  if (open.length && s.money >= Math.min(...open)) tip('open', () => openBuild(0));
  if (s.level >= 2 && !s.units.some(u => !u.kiosk && u.state !== 'store')) tip('newshell', () => openBuild(0));
  if (s.level >= 3){ tip('staff'); if (!s.flags.tips.staff) setToolDot('staff', true); }
  if (s.level >= 4) tip('clerks');
  if (!s.fountain && s.level >= 2 && s.money >= C.FOUNTAIN.cost) tip('fountain', () => { panTo(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1); view.highlight = { x: C.FOUNTAIN.x, y: C.FOUNTAIN.y, w: 2, h: 2 }; setTimeout(() => { view.highlight = null; }, 4000); });
  if (report && s.day >= 2 && !s.decor.some(d => d.type === 'bin')) tip('litter', () => openBuild(1));
}
export function closeNightUi(){ hideCard(); closePanel(); endPick(); endPlacement(); view.selected = null; }
