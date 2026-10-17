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
const renoCost = u => u.w * u.h * C.RENOVATE_PER_TILE;
const shellCost = (w, h) => w * h * C.BUILD_PER_TILE;
let place = null;
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
  if (u.state === 'derelict'){
    const cost = renoCost(u);
    return showCard({ title: 'Boarded-up unit', text: `${u.w}×${u.h} storefront left over from the old days. Fix it up so a store can open here.`, actions: [{ label: `Renovate · ${money(cost)}`, primary: true, disabled: s.money < cost, onClick: () => renovate(u) }] });
  }
  if (u.state === 'vacant'){
    return showCard({ title: 'Empty unit', text: `${u.w}×${u.h}, clean and ready. Open one of your stores here.`, actions: [
      { label: 'Remove shell', onClick: async () => { if (await confirmBox('Tear out this shell to free up the floor?', 'Tear it out')){ s.units = s.units.filter(v => v !== u); hideCard(); view.selected = null; poof(u.x, u.y, u.w, u.h); changed(); } } },
      { label: 'Open a store', primary: true, onClick: () => openInUnit(u) }] });
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
function renovate(u){
  if (!spend(renoCost(u))) return;
  u.state = 'vacant'; sfx('build'); poof(u.x, u.y, u.w, u.h);
  changed(25);
  tip('vacant');
  unitCard(u);
}
function openInUnit(u){
  hideCard();
  openPanel({ title: 'Open a store here', render: body => {
    body.append(h('p', { class: 'muted', style: 'margin:0' }, `This unit is ${u.w}×${u.h}. Stores that fit:`));
    for (const [key, def] of Object.entries(C.STORES)){
      if (def.kiosk || def.w > u.w || def.h > u.h) continue;
      body.append(storeItem(key, def, def.cost, () => {
        if (!spend(def.cost)) return;
        u.state = 'store'; u.store = key; u.stock = def.stock;
        closePanel(); sfx('build'); poof(u.x, u.y, u.w, u.h);
        if (key === 'arcade') addMemory('arcade');
        changed(40);
        tip('move');
      }));
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
  view.selected = { x: d.x, y: d.y, w: def.w, h: def.h };
  showCard({ title: def.name, text: def.bin ? 'Cuts down on litter nearby.' : def.seat ? 'A place to sit. Folks like a break.' : 'Makes the place feel nicer.', actions: [
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
  showCard({ title: z.name, text: 'Dusty storage full of old boxes and pigeons. Clear it out and the floor is yours to build on.', warn: locked ? `Unlocks at level ${z.level}` : null,
    actions: locked ? [] : [{ label: `Clear it out · ${money(z.cost)}`, primary: true, disabled: s.money < z.cost, onClick: () => {
      if (!spend(z.cost)) return;
      s.zones[z.id] = true; hideCard(); view.selected = null; sfx('build'); poof(z.x, z.y, z.w, z.h);
      changed(60); toast(`${z.name} is cleared. Build anything you like there.`);
    } }] });
}

/* ---------- Build panel ---------- */
export function openBuild(){
  hideCard(); view.selected = null;
  openPanel({ title: 'Build', tabs: ['Stores', 'Decor', 'Fix up'], render: (body, tab) => {
    const s = S.save;
    if (tab === 0){
      body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, 'New stores come with their own shell. It’s cheaper to open one inside an empty unit.'));
      for (const [key, def] of Object.entries(C.STORES)){
        const cost = def.cost + (def.kiosk ? 0 : shellCost(def.w, def.h));
        body.append(storeItem(key, def, cost, () => { closePanel(); startPlacement({ kind: def.kiosk ? 'kiosk' : 'unit', store: key, w: def.w, h: def.h, face: 'down', cost }); }));
      }
    } else if (tab === 1){
      for (const [key, def] of Object.entries(C.DECOR)){
        const b = h('button', { class: `item ${s.money >= def.cost ? 'can' : ''}`, onclick: () => { sfx('tap'); closePanel(); startPlacement({ kind: key, decor: key, w: def.w, h: def.h, cost: def.cost }); } },
          iconCanvas(() => { if (key === 'plant') A.palm(0.5, 0.92); else if (key === 'bin') A.trashCan(0.5, 0.85); else { A.g.scale(0.5, 0.5); A.bench(0.1, 1.1, 1.8); } }),
          h('span', { class: 'info' }, h('span', { class: 'name' }, def.name), h('span', { class: 'sub' }, def.bin ? 'Cuts litter nearby' : def.seat ? 'Somewhere to sit · +ambience' : '+ambience')),
          h('span', { class: 'price' }, money(def.cost)));
        body.append(b);
      }
    } else {
      body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, 'Tap a boarded-up store in the mall to renovate it.'));
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

/* ---------- Placement ---------- */
export const placing = () => !!place;
function startPlacement(p){
  hideCard(); view.selected = null;
  place = { ...p };
  if (p.x === undefined){
    const c = view.cam; let best = null;
    // Start near the middle of the screen, on the nearest spot that works.
    for (let r = 0; r < 14 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++){
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = Math.round(c.x - p.w / 2) + dx, y = Math.round(c.y - p.h / 2) + dy;
      if (validate(x, y, p.face).ok) best = { x, y };
    }
    place.x = best ? best.x : Math.round(c.x - p.w / 2); place.y = best ? best.y : Math.round(c.y - p.h / 2);
  }
  const name = p.store ? C.STORES[p.store].name : C.DECOR[p.decor].name;
  place.label = p.moveId ? `Move ${name}` : `${name} · ${money(p.cost)}`;
  place.bar = showPlacementBar({ label: place.label, canFlip: p.kind === 'unit', onFlip: () => { place.face = place.face === 'down' ? 'up' : 'down'; refreshGhost(); }, onCancel: endPlacement, onConfirm: confirmPlacement });
  refreshGhost();
}
function validate(x, y, face){
  const kind = place.kind === 'unit' || place.kind === 'kiosk' ? place.kind : place.kind;
  return validatePlacement(S.save, kind, x, y, place.w, place.h, face, place.moveId || 0);
}
function refreshGhost(){
  const v = validate(place.x, place.y, place.face);
  place.ok = v.ok;
  let access = null;
  if (place.kind === 'unit'){ const dx = place.x + Math.floor(place.w / 2); access = place.face === 'down' ? { x: dx, y: place.y + place.h } : { x: dx, y: place.y - 1 }; }
  else if (place.kind === 'kiosk') access = { x: place.x + 1, y: place.y + 1 };
  const temp = { id: 9999, x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, state: 'store', store: place.store, stock: 1, kiosk: place.kind === 'kiosk' };
  view.ghost = { x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, ok: v.ok, access, preview: t => {
    if (place.kind === 'unit'){ const def = C.STORES[place.store]; A.unitBack(temp, def, t); A.storeFurniture(temp, def, t, 'counter'); A.unitFront(temp, def, t); }
    else if (place.kind === 'kiosk') A.kiosk(temp, C.STORES[place.store], t);
    else if (place.decor === 'plant') A.palm(place.x + 0.5, place.y + 0.85);
    else if (place.decor === 'bin') A.trashCan(place.x + 0.5, place.y + 0.8);
    else if (place.decor === 'bench') A.bench(place.x + 0.1, place.y + 0.15, 1.8);
  } };
  if (place.bar){
    place.bar.info.textContent = v.ok ? `${place.label} · drag to move` : v.reason;
    place.bar.info.style.color = v.ok ? '' : '#b3263e';
    place.bar.confirm.disabled = !v.ok;
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
  const s = S.save, p = place;
  if (!p.moveId && !spend(p.cost)) return;
  let xp = 0;
  if (p.moveId){
    const u = s.units.find(v => v.id === p.moveId), d = s.decor.find(v => v.id === p.moveId);
    if (u){ u.x = p.x; u.y = p.y; u.face = p.face || u.face; }
    if (d){ d.x = p.x; d.y = p.y; }
  } else if (p.kind === 'unit' || p.kind === 'kiosk'){
    const def = C.STORES[p.store];
    s.units.push({ id: s.nextId++, x: p.x, y: p.y, w: p.w, h: p.h, face: p.kind === 'kiosk' ? 'down' : p.face, kiosk: p.kind === 'kiosk' || undefined, state: 'store', store: p.store, stock: def.stock });
    if (p.store === 'arcade') addMemory('arcade');
    xp = 50;
  } else {
    s.decor.push({ id: s.nextId++, type: p.decor, x: p.x, y: p.y });
    xp = 5;
  }
  sfx('build'); poof(p.x, p.y, p.w, p.h);
  endPlacement();
  changed(xp);
}
export function endPlacement(){ place = null; view.ghost = null; hidePlacementBar(); }

/* ---------- Staff ---------- */
function applicants(){
  const s = S.save, f = s.flags;
  if (f.appDay !== s.day || !f.applicants){
    const roles = [];
    if (s.level >= 3) roles.push('janitor');
    if (s.level >= 4) roles.push('clerk');
    const list = [];
    for (let i = 0; i < 3 && roles.length; i++){
      const seed = s.day * 31 + i * 7 + s.nextId;
      const R = A.mulberry(seed);
      list.push({ seed, role: roles[Math.floor(R() * roles.length)], name: C.FIRST_NAMES[Math.floor(R() * C.FIRST_NAMES.length)] });
    }
    if (s.level >= 4 && !list.some(a => a.role === 'clerk')) list[list.length - 1].role = 'clerk';
    f.applicants = list; f.appDay = s.day;
  }
  const out = [...f.applicants];
  if (s.level >= 3 && !f.hiredDee) out.unshift({ seed: 2004, role: 'janitor', name: 'Dee', dee: true });
  return out;
}
export function openStaff(){
  hideCard(); view.selected = null; setToolDot('staff', false);
  openPanel({ title: 'Staff', render: (body, tab, redraw) => {
    const s = S.save, max = C.STAFF_MAX[s.level];
    body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, s.level < 3 ? 'You can start hiring at level 3. Until then, it’s all you.' : `Your team: ${s.staff.length} of ${max}. Wages come out each night.`));
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
        const full = s.staff.length >= max;
        body.append(h('div', { class: 'staff-row' }, portrait(look, 44),
          h('span', { class: 'info', style: 'flex:1;min-width:0' }, h('span', { style: 'font:600 15px var(--display);display:block' }, a.name), h('span', { class: 'muted', style: 'font-size:12px' }, `${a.role === 'janitor' ? 'Janitor' : 'Clerk'} · ${money(C.WAGES[a.role])}/day${a.dee ? ' · Gus recommends her: works faster' : ''}`)),
          h('button', { class: 'btn small primary', disabled: full, onclick: () => {
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
  hideCard(); view.selected = null; setToolDot('notebook', false);
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
  const derelict = s.units.filter(u => u.state === 'derelict');
  const cheapest = derelict.sort((a, b) => renoCost(a) - renoCost(b))[0];
  if (cheapest && s.money >= renoCost(cheapest)) tip('renovate', () => { panTo(cheapest.x + cheapest.w / 2, cheapest.y + cheapest.h / 2); view.highlight = { x: cheapest.x, y: cheapest.y, w: cheapest.w, h: cheapest.h }; setTimeout(() => { view.highlight = null; }, 4000); });
  if (s.level >= 3){ tip('staff'); if (!s.flags.tips.staff) setToolDot('staff', true); }
  if (s.level >= 4) tip('clerks');
  if (!s.fountain && s.level >= 2 && s.money >= C.FOUNTAIN.cost) tip('fountain', () => { panTo(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1); view.highlight = { x: C.FOUNTAIN.x, y: C.FOUNTAIN.y, w: 2, h: 2 }; setTimeout(() => { view.highlight = null; }, 4000); });
  const z = C.ZONES.find(q => !s.zones[q.id] && s.level >= q.level && s.money >= q.cost);
  if (z) tip('zone', () => { panTo(z.x + z.w / 2, z.y + z.h / 2); view.highlight = { x: z.x, y: z.y, w: z.w, h: z.h }; setTimeout(() => { view.highlight = null; }, 4000); });
  if (report && report.ratings.clean < 3) tip('litter');
}
export function closeNightUi(){ hideCard(); closePanel(); endPlacement(); view.selected = null; }
