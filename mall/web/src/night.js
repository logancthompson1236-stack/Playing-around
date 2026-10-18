// Night mode: tapping things in the mall, the Build and Staff panels, and placing or moving things.
import * as C from './config.js';
import * as A from './art.js';
import { S, writeSave, addXp, stores, staffSkill, wageOf, stars } from './state.js';
import { map, rebuildMap, validatePlacement, zoneAt, occAt, FOUNTAIN_ID, ESCALATOR_ID, unitAccess, decorSize, decorAccess, floorRange, floorOf, clearEscalators } from './map.js';
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
let place = null, pick = null, styling = null;
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
  if (styling) return;
  if (pick) return pickTap(wx, wy);
  if (place){ moveGhostTo(wx - place.w / 2 + 0.5, wy - place.h / 2 + 0.5); return; }
  const tx = Math.floor(wx), ty = Math.floor(wy);
  // Tall things are drawn above their footprint, so also look one row down.
  const id = occAt(tx, ty) || occAt(tx, Math.floor(wy + 0.7));
  if (id === FOUNTAIN_ID) return fountainCard();
  if (id === ESCALATOR_ID){ hideCard(); view.selected = null; return showCard({ title: 'Escalator', text: view.floor ? 'Down to the ground floor. Shoppers, staff and you ride it whenever where they’re going is downstairs.' : 'Up to the second floor. Shoppers, staff and you ride it whenever where they’re going is upstairs. Tap 2F on the left to look up there.' }); }
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
  if (u.state === 'restroom'){
    return showCard({ title: 'Restrooms', text: 'Shoppers stop in now and then, and it gets grubby as the day goes on. During the day, tap it to mop it out, or let your janitors handle it. The night crew leaves it spotless.',
      actions: [{ label: 'Move', onClick: () => startPlacement({ kind: 'unit', restroom: true, w: u.w, h: u.h, face: u.face, cost: 0, moveId: u.id, x: u.x, y: u.y }) }] });
  }
  const def = C.STORES[u.store];
  const clerk = s.staff.find(m => m.role === 'clerk' && m.storeId === u.id);
  const refund = Math.round(def.cost * 0.5);
  showCard({
    title: def.name,
    text: def.attraction ? `Attraction · ${def.seats} ${def.attraction === 'theater' ? 'seats' : 'trampolines'} · tickets $${def.price[0]}–${def.price[1]} from the machine at the door · upkeep ${money(def.upkeep)}/day`
      : `${def.cat} · Stock ${u.stock}/${def.stock}${clerk ? ` · ${clerk.name} runs the register` : ' · You run the register'}`,
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
// A store opens in an empty or boarded-up storefront of exactly its size, cheapest first.
const fits = (def, u) => def.w === u.w && def.h === u.h;
function roomFor(key){
  const def = C.STORES[key];
  if (def.kiosk) return [];
  return S.save.units.filter(u => !u.kiosk && (u.state === 'vacant' || u.state === 'derelict') && fits(def, u))
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
    body.append(h('p', { class: 'muted', style: 'margin:0' }, `This storefront is ${u.w}×${u.h}.${fix ? ` Prices include ${money(fix)} to fix it up.` : ''} ${u.w}×${u.h} stores:`));
    for (const [key, def] of Object.entries(C.STORES)){
      if (def.kiosk || !fits(def, u)) continue;
      body.append(storeItem(key, def, def.cost + fix, () => { if (openStore(u, key)){ closePanel(); view.selected = null; } }));
    }
  } });
}
function storeItem(key, def, cost, onPick){
  const locked = S.save.level < def.level, afford = S.save.money >= cost;
  const have = stores(S.save).filter(u => u.store === key).length;
  const b = h('button', { class: `item ${locked ? 'locked' : afford ? 'can' : ''}`, disabled: locked, onclick: () => { sfx('tap'); onPick(); } },
    iconCanvas(() => A.storeIcon(def.icon, 0.5, 0.5, 0.62)),
    h('span', { class: 'info' }, h('span', { class: 'name' }, def.name, have ? h('span', { class: 'have' }, `You have ${have}`) : null), h('span', { class: 'sub' }, def.attraction ? `${def.w}×${def.h} attraction · tickets $${def.price[0]}–${def.price[1]} · upkeep ${money(def.upkeep)}/day` : `${def.w}×${def.h} · ${def.cat} · sells $${def.price[0]}–${def.price[1]}`)),
    h('span', { class: 'price' }, locked ? `Level ${def.level}` : money(cost)));
  return b;
}
const DECOR_TEXT = {
  bin: 'Most shoppers inside the green circle toss their trash in here instead of on the floor.',
  bench: 'A place to sit. Folks like a break.', sofa: 'The comfiest seat in the mall. Folks leave it a little happier.',
  vending: 'Thirsty shoppers stop for a soda. Every can is a little extra cash (and a little extra trash).',
  ride: 'Kids beg for a ride. Families pay a few bucks a go.', gumball: 'A penny candy classic. Kids and teens stop for a gumball.',
  directory: 'Shoppers who see it find more stores they want to visit.', lamp: 'Makes the place feel nicer, and glows once evening sets in.',
};
function decorCard(d){
  const def = C.DECOR[d.type], z = decorSize(d);
  view.selected = { x: d.x, y: d.y, w: z.w, h: z.h, bin: !!def.bin };
  const actions = [{ label: 'Move', onClick: () => startPlacement({ kind: d.type, decor: d.type, w: z.w, h: z.h, face: d.rot || 0, cost: 0, moveId: d.id, x: d.x, y: d.y }) }];
  if (def.rot) actions.push({ label: 'Rotate', onClick: () => rotateInPlace(d) });
  actions.push({ label: `Sell · +${money(def.cost / 2)}`, onClick: () => { S.save.decor = S.save.decor.filter(v => v !== d); S.save.money += Math.round(def.cost / 2); hideCard(); view.selected = null; sfx('coin'); changed(); } });
  showCard({ title: def.name, text: DECOR_TEXT[d.type] || 'Makes the place feel nicer.', actions });
}
// Turn a piece a quarter turn where it stands, skipping facings that don't fit.
function rotateInPlace(d){
  for (let k = 1; k <= 3; k++){
    const rot = ((d.rot || 0) + k) % 4, z = decorSize({ type: d.type, rot });
    if (validatePlacement(S.save, d.type, d.x, d.y, z.w, z.h, rot, d.id).ok){ d.rot = rot; sfx('tap'); changed(); decorCard(d); return; }
  }
  sfx('error'); toast('No room to turn it here. Try Move.');
}
// Decor drawn small for the Build list, scaled to fit the icon.
function decorIcon(key){
  return iconCanvas(() => A.decorThumb(key, C.DECOR[key].w));
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
  endPick(); endPlacement(); endStyle(); hideCard(); view.selected = null;
  openPanel({ title: 'Build', tabs: ['Stores', 'Decor', 'Fix up', 'Style'], tab: startTab, render: (body, tab) => {
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
        const locked = s.level < def.level, have = s.decor.filter(d => d.type === key).length;
        const b = h('button', { class: `item ${locked ? 'locked' : s.money >= def.cost ? 'can' : ''}`, disabled: locked, onclick: () => { sfx('tap'); closePanel(); startPlacement({ kind: key, decor: key, w: def.w, h: def.h, face: 0, cost: def.cost }); } },
          decorIcon(key),
          h('span', { class: 'info' }, h('span', { class: 'name' }, def.name, have ? h('span', { class: 'have' }, `You have ${have}`) : null), h('span', { class: 'sub' }, def.sub + (def.rot ? ' · can rotate' : ''))),
          h('span', { class: 'price' }, locked ? `Level ${def.level}` : money(def.cost)));
        body.append(b);
      }
    } else if (tab === 3){
      styleTab(body);
    } else {
      body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, 'Storage clears out by itself when you build a store in it. You can also clear it here.'));
      const f = C.FOUNTAIN;
      body.append(fixItem('The old fountain', s.fountain ? 'Running again' : 'Folks will stop to sit a while', s.fountain ? 'Done' : money(f.cost), s.fountain, () => { closePanel(); panTo(f.x + 1, f.y + 1); fountainCard(); }));
      for (const z of C.ZONES){
        const done = !!s.zones[z.id], locked = s.level < z.level;
        body.append(fixItem(z.name, done ? 'Cleared' : `${z.w}×${z.h} of storage`, done ? 'Done' : locked ? `Level ${z.level}` : money(z.cost), done || locked, () => { closePanel(); panTo(z.x + z.w / 2, z.y + z.h / 2); zoneCard(z); }));
      }
      body.append(h('div', { class: 'section-label' }, 'Expansions'));
      C.EXPANSIONS.forEach((e, i) => {
        const done = !!s.expansions[e.id], prev = C.EXPANSIONS[i - 1], blocked = prev && !s.expansions[prev.id], locked = s.level < e.level;
        const price = done ? 'Open' : locked ? `Level ${e.level}` : blocked ? `After ${prev.name}` : money(e.cost);
        body.append(fixItem(e.name, e.sub, price, done || locked || blocked, () => { if (!done && !locked && !blocked) buyExpansion(e); }, 'expand'));
      });
    }
  } });
}
function fixItem(name, sub, price, dim, onClick, icon = 'broom'){
  return h('button', { class: `item ${dim ? 'locked' : 'can'}`, onclick: () => { sfx('tap'); onClick(); } },
    iconCanvas(() => { if (icon === 'expand') A.storeIcon('sun', 0.5, 0.5, 0.62); else A.storeIcon('broom', 0.5, 0.5, 0.65); }),
    h('span', { class: 'info' }, h('span', { class: 'name' }, name), h('span', { class: 'sub' }, sub)),
    h('span', { class: 'price' }, price));
}

/* ---------- Mall styles: tap one to see it on the mall, then keep it or go back ---------- */
const STYLE_SLOTS = { wall: { table: C.WALLPAPERS, label: 'Wallpaper', noun: 'wallpaper' }, floor: { table: C.FLOORS, label: 'Flooring', noun: 'floor' } };
const ownsStyle = (slot, id) => S.save.style[slot + 's'].includes(id);
function styleTab(body){
  const s = S.save, locked = s.level < C.STYLE_LEVEL;
  body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, locked ? `Unlocks at level ${C.STYLE_LEVEL}: new wallpaper and flooring for the whole mall.` : 'Tap a style to see it on your mall. Ones you own are free to switch back to.'));
  for (const [slot, { table, label }] of Object.entries(STYLE_SLOTS)){
    body.append(h('div', { class: 'section-label' }, label));
    for (const [id, d] of Object.entries(table)){
      // Each style unlocks at its own level milestone.
      const have = ownsStyle(slot, id), inUse = s.style[slot] === id, needs = d.level || 0, locked = s.level < needs;
      body.append(h('button', { class: `item ${locked && !have ? 'locked' : !inUse && (have || s.money >= d.cost) ? 'can' : ''}`, disabled: locked && !have, onclick: () => { sfx('tap'); closePanel(); startStyle(slot, id); } },
        iconCanvas(() => styleSwatch(slot, id)),
        h('span', { class: 'info' }, h('span', { class: 'name' }, d.name), h('span', { class: 'sub' }, d.sub + (d.ambience ? ' · +ambience' : ''))),
        h('span', { class: 'price' }, inUse ? 'In use' : have ? 'Owned' : locked ? `Level ${needs}` : money(d.cost))));
    }
  }
}
// A little square of wall over floor (wallpaper), or just floor.
export function styleSwatch(slot, id){
  const g = A.g;
  g.save(); A.rr(0.05, 0.05, 0.9, 0.9, 0.16); g.clip(); g.scale(0.5, 0.5);
  if (slot === 'wall'){ g.translate(0, 1.5); A.mallBackWall(2, id); A.floor(A.concourseFloor(S.save.style.floor), 0, 0, 2, 0.6, 1); }
  else A.floor(A.concourseFloor(id), 0, 0, 2, 2, 1);
  g.restore();
  A.rr(0.05, 0.05, 0.9, 0.9, 0.16); A.fs(null, 0.035);
}
function startStyle(slot, id){
  hideCard(); view.selected = null;
  styling = { slot, id };
  // Wallpaper runs along the top of the mall; floors show best in the middle of the concourse.
  view.camTarget = slot === 'wall' ? { x: view.cam.x, y: -3, s: view.minS * 1.8 } : { x: view.cam.x, y: 8.5, s: view.minS * 1.5 };
  showStyleBar();
}
function showStyleBar(){
  const { slot, id } = styling, { table, noun } = STYLE_SLOTS[slot], d = table[id], s = S.save;
  const have = ownsStyle(slot, id), short = !have && s.money < d.cost;
  view.stylePreview = { ...s.style, [slot]: id };
  const bar = showPlacementBar({ label: `${d.name} ${noun}`, confirmLabel: s.style[slot] === id ? 'Keep' : have ? 'Use it' : `Buy · ${money(d.cost)}`,
    onCancel: () => { endStyle(); openBuild(3); }, onConfirm: confirmStyle,
    extra: { label: 'Next ›', onClick: () => {
      const ids = Object.keys(table).filter(k => s.level >= (table[k].level || 0) || ownsStyle(slot, k));
      styling.id = ids[(ids.indexOf(styling.id) + 1) % ids.length]; showStyleBar();
    } } });
  if (short){ bar.info.textContent = `${d.name}: need ${money(d.cost)}`; bar.info.style.color = '#b3263e'; bar.confirm.disabled = true; }
}
function confirmStyle(){
  const { slot, id } = styling, { table, noun } = STYLE_SLOTS[slot], d = table[id], s = S.save;
  const fresh = !ownsStyle(slot, id);
  if (fresh && !spend(d.cost)) return;
  if (fresh) s.style[slot + 's'].push(id);
  const was = s.style[slot];
  s.style[slot] = id;
  endStyle();
  if (was !== id){ sfx('build'); toast(fresh ? `New ${noun}: ${d.name}! Shoppers will love it.` : `Switched to ${d.name}.`); }
  changed(fresh ? C.STYLE_XP : 0);
}
function endStyle(){ if (!styling) return; styling = null; view.stylePreview = null; hidePlacementBar(); }

/* ---------- Expansions ---------- */
async function buyExpansion(e){
  const s = S.save;
  if (s.money < e.cost){ sfx('error'); toast(`Not enough money (need ${money(e.cost)})`); return; }
  if (!(await confirmBox(`Open the ${e.name}?`, `Build it · ${money(e.cost)}`, 'Not yet', e.sub + '.'))) return;
  if (!spend(e.cost)) return;
  closePanel();
  s.expansions[e.id] = true;
  for (const l of e.lots) s.units.push({ id: s.nextId++, x: l.x, y: l.y, w: l.w, h: l.h, face: l.face, state: 'vacant', store: null, stock: 0 });
  if (e.restroom) s.units.push({ id: s.nextId++, x: e.restroom.x, y: e.restroom.y, w: C.RESTROOM.w, h: C.RESTROOM.h, face: e.restroom.face, state: 'restroom', store: null, stock: 0 });
  for (const d of e.decor) s.decor.push({ id: s.nextId++, ...d });
  rebuildMap(s); clearEscalators(s);
  sfx('build'); poof(e.x, 0, e.w, C.MAP_H);
  changed(e.xp);
  view.camTarget = { x: e.x + e.w / 2 - 2, y: 7.5, s: view.minS * 1.4 };
  toast(e.id === 'east' ? 'The Second Floor is open! Shoppers ride the escalator up. Tap 1F/2F to switch floors.' : `The ${e.name} is open! New storefronts are waiting.`, 4000);
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
    if (!def.kiosk) toast(`No empty ${def.w}×${def.h} storefront for ${def.name}, so put up a new one.`, 3000);
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
  // Spots on both floors: show this floor's if it has any (the other floor is a tap on 1F/2F away).
  const here = spots.filter(({ u }) => floorOf(u.x) === view.floor);
  if (here.length) spots = here;
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
  pick.bar.info.textContent = !sel ? `Tap a glowing ${def.w}×${def.h} storefront for ${def.name}` : short ? `Not enough money (need ${money(sel.cost)})` : `${def.name} here${fixCost(sel.u) ? ', fix-up included' : ''}`;
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
export const placing = () => !!place || !!pick || !!styling;
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
  // Small pieces are hard to see (and rotate) from all the way out, so move in a little.
  if (p.decor && view.cam.s < view.minS * 2) view.camTarget = { x: place.x + place.w / 2, y: place.y + place.h / 2, s: view.minS * 2 };
  const name = p.restroom ? C.RESTROOM.name : p.store ? C.STORES[p.store].name : C.DECOR[p.decor].name;
  place.name = p.moveId ? `Move ${name}` : name;
  const turnable = p.decor && C.DECOR[p.decor].rot;
  place.bar = showPlacementBar({ label: place.name, canFlip: p.kind === 'unit' || turnable, flipLabel: turnable ? 'Rotate' : 'Flip door', onFlip: () => {
    if (turnable){
      place.face = (place.face + 1) % 4; const z = decorSize({ type: p.decor, rot: place.face }); place.w = z.w; place.h = z.h; moveGhostTo(place.x + 0.5, place.y + 0.5, true);
      // If turning it blocks its own front (or something else), slide it to the nearest spot that works.
      if (!validate(place.x, place.y, place.face).ok){
        let best = null;
        for (let r = 1; r <= 3 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++){
          if (Math.max(Math.abs(dx), Math.abs(dy)) === r && validate(place.x + dx, place.y + dy, place.face).ok) best = { x: place.x + dx, y: place.y + dy };
        }
        if (best) moveGhostTo(best.x + 0.5, best.y + 0.5, true);
      }
    }
    else place.face = place.face === 'down' ? 'up' : 'down';
    refreshGhost();
  }, onCancel: endPlacement, onConfirm: confirmPlacement });
  refreshGhost();
}
// Stores can go into dusty storage: clearing it out is part of the job (and the price).
function validate(x, y, face){
  const zones = [];
  if (place.store || place.restroom){
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
  const def = place.decor && C.DECOR[place.decor];
  if (def && (def.seat || def.coin || def.play)) return decorAccess({ type: place.decor, x, y, rot: face || 0 });
  return null;
}
const placeCost = v => (place.moveId ? 0 : place.cost) + v.zones.reduce((a, z) => a + z.cost, 0);
function refreshGhost(){
  const v = validate(place.x, place.y, place.face);
  place.ok = v.ok;
  const access = accessFor(place.x, place.y, place.face), cost = placeCost(v);
  const temp = { id: 9999, x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, state: place.restroom ? 'restroom' : 'store', store: place.store, stock: 1, kiosk: place.kind === 'kiosk' };
  view.ghost = { x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, ok: v.ok, access, bin: place.decor === 'bin', zones: v.ok ? v.zones : [], preview: t => {
    if (place.kind === 'unit'){ const def = place.restroom ? C.RESTROOM : C.STORES[place.store]; A.unitBack(temp, def, t); if (def.attraction === 'jump' && temp.face !== 'down') A.trampolines(temp, def); if (!place.restroom) A.storeFurniture(temp, def, t, 'counter'); A.unitFront(temp, def, t); A.unitSign(temp, def); }
    else if (place.kind === 'kiosk') A.kiosk(temp, C.STORES[place.store], t);
    else A.decor({ type: place.decor, x: place.x, y: place.y, rot: place.face || 0 }, t);
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
export function moveGhostTo(x, y, force = false){
  if (!place) return;
  const nx = Math.round(x - 0.5), ny = Math.round(y - 0.5);
  if (nx === place.x && ny === place.y && !force) return;
  const fr = floorRange(view.floor);
  place.x = Math.max(fr.x0, Math.min(fr.x1 - place.w, nx)); place.y = Math.max(0, Math.min(C.MAP_H - place.h, ny));
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
    if (d){ d.x = p.x; d.y = p.y; d.rot = p.face || 0; }
  } else if (p.kind === 'unit' || p.kind === 'kiosk'){
    const def = C.STORES[p.store];
    s.units.push({ id: s.nextId++, x: p.x, y: p.y, w: p.w, h: p.h, face: p.kind === 'kiosk' ? 'down' : p.face, kiosk: p.kind === 'kiosk' || undefined, state: 'store', store: p.store, stock: def.stock });
    if (p.store === 'arcade') addMemory('arcade');
    s.flags.opened = true;
    xp += 50;
  } else {
    s.decor.push({ id: s.nextId++, type: p.decor, x: p.x, y: p.y, rot: p.face || 0 });
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
  const key = `3:${s.day}:${s.level}`;
  if (f.appDay !== key || !f.applicants){
    // Three clerks to choose from, and one of every other role you can hire.
    const roles = [];
    for (const [role, r] of Object.entries(C.ROLES)) if (s.level >= r.level) roles.push(...(role === 'clerk' ? ['clerk', 'clerk', 'clerk'] : [role]));
    const list = [], used = new Set(['Dee', ...s.staff.map(m => m.name)]);
    roles.forEach((role, i) => {
      const seed = s.day * 31 + i * 7 + s.level * 101 + s.nextId;
      const R = A.mulberry(seed);
      let name; do { name = C.FIRST_NAMES[Math.floor(R() * C.FIRST_NAMES.length)]; } while (used.has(name) && used.size < C.FIRST_NAMES.length);
      used.add(name);
      // Star rating: most applicants are decent, a few are great. Clerks each have a dream store.
      const r = R(), skill = r < 0.35 ? 1 : r < 0.8 ? 2 : 3;
      const dreams = Object.keys(C.STORES).filter(k => C.STORES[k].level <= s.level);
      list.push({ seed, role, name, skill, dream: role === 'clerk' ? dreams[Math.floor(R() * dreams.length)] : null });
    });
    f.applicants = list; f.appDay = key;
  }
  const out = [...f.applicants];
  if (s.level >= 3 && !f.hiredDee) out.unshift({ seed: 2004, role: 'janitor', name: 'Dee', dee: true, skill: 3 });
  return out;
}
// Staff is long by the late game: tabs pick a role (or All), and the team is grouped by role either way.
const ROLE_ORDER = ['clerk', 'janitor', 'supervisor', 'stocker', 'guard', 'greeter', 'mascot'];
export function openStaff(){
  endPick(); endPlacement(); hideCard(); view.selected = null; setToolDot('staff', false);
  const s0 = S.save, roles = ROLE_ORDER.filter(r => s0.level >= C.ROLES[r].level || s0.staff.some(m => m.role === r));
  const tabs = roles.length > 1 ? ['All', ...roles.map(r => C.ROLES[r].plural)] : null;
  openPanel({ title: 'Staff', tabs, render: (body, tab, redraw) => {
    const s = S.save, L = C.STAFF_LIMITS, count = role => s.staff.filter(m => m.role === role).length;
    const only = tabs && tab > 0 ? roles[tab - 1] : null, shows = role => !only || role === only;
    const open = Object.entries(C.ROLES).filter(([, r]) => s.level >= r.level), next = Object.values(C.ROLES).find(r => s.level < r.level);
    const limits = only ? `${C.ROLES[only].plural} ${count(only)}/${L[only][s.level]} · ${C.ROLES[only].desc}`
      : open.map(([role, r]) => `${r.plural} ${count(role)}/${L[role][s.level]}`).join(' · ') + (next ? ` · ${next.plural} at level ${next.level}` : '');
    body.append(h('p', { class: 'muted', style: 'margin:0;font-size:12px' }, `${limits}. Wages come out each night.`));
    const team = s.staff.filter(m => shows(m.role)).sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || staffSkill(b) - staffSkill(a) || a.name.localeCompare(b.name));
    let lastRole = null;
    if (team.length && only) body.append(h('div', { class: 'section-label' }, `Working for you (${team.length})`));
    for (const m of team){
      if (!only && m.role !== lastRole){ lastRole = m.role; body.append(h('div', { class: 'section-label' }, `${C.ROLES[m.role].plural} (${count(m.role)})`)); }
      const ownStores = stores(s).filter(u => !C.STORES[u.store].attraction && !s.staff.some(o => o !== m && o.storeId === u.id));
      const sel = m.role === 'clerk' ? h('select', { 'aria-label': `${m.name}'s register`, onchange: e => { m.storeId = +e.target.value || null; writeSave(); redraw(); } },
        h('option', { value: '' }, 'No register'), ownStores.map(u => h('option', { value: u.id, selected: m.storeId === u.id }, C.STORES[u.store].name + (m.dream === u.store ? ' ♥' : '')))) : null;
      body.append(h('div', { class: 'staff-row' }, portrait(m.look, 44),
        h('span', { class: 'info', style: 'flex:1;min-width:0' }, h('span', { class: 'name', style: 'font:600 15px var(--display);display:block' }, m.name), h('span', { class: 'sub muted', style: 'font-size:12px;display:block' }, staffLine(m)), dreamLine(m, s.units.find(u => u.id === m.storeId)), sel),
        h('button', { class: 'btn small', onclick: async () => { if (await confirmBox(`Let ${m.name} go?`, 'Let go')){ s.staff = s.staff.filter(o => o !== m); if (m.dee) s.flags.hiredDee = false; writeSave(); redraw(); } } }, 'Let go')));
    }
    if (!team.length && only) body.append(h('p', { class: 'muted', style: 'margin:6px 0 0;font-size:12.5px' }, `No ${C.ROLES[only].plural.toLowerCase()} yet.`));
    const apps = open.length ? applicants().filter(a => shows(a.role)) : [];
    if (apps.length){
      body.append(h('div', { class: 'section-label' }, 'Looking for work'));
      for (const a of apps){
        const look = staffLook(a.role, a.seed);
        const full = count(a.role) >= L[a.role][s.level];
        body.append(h('div', { class: 'staff-row' }, portrait(look, 44),
          h('span', { class: 'info', style: 'flex:1;min-width:0' }, h('span', { style: 'font:600 15px var(--display);display:block' }, a.name), h('span', { class: 'muted', style: 'font-size:12px;display:block' }, staffLine(a) + (a.dee ? ' · Gus recommends her' : '')), dreamLine(a), a.role === 'clerk' || a.role === 'janitor' || only ? null : h('span', { class: 'muted', style: 'font-size:11.5px;display:block' }, C.ROLES[a.role].desc)),
          h('button', { class: 'btn small primary', disabled: full, 'data-dee': a.dee ? '1' : null, onclick: () => {
            const open = stores(s).filter(u => !C.STORES[u.store].attraction && !s.staff.some(o => o.storeId === u.id));
            const free = open.find(u => u.store === a.dream) || open.find(u => !u.kiosk) || open[0];
            s.staff.push({ id: s.nextId++, role: a.role, name: a.name, look, storeId: a.role === 'clerk' && free ? free.id : null, skill: a.skill || 2, dream: a.dream || null, dee: !!a.dee });
            if (a.dee) s.flags.hiredDee = true; else s.flags.applicants = s.flags.applicants.filter(x => x !== a);
            sfx('build'); writeSave(); redraw(); tip('speed');
            toast(`${a.name} starts tomorrow`);
          } }, full ? 'Team full' : 'Hire')));
      }
    }
  } });
}

// "Clerk · ★★☆ · $46/day", then their dream job on a line of its own (with a heart when they're working it).
function staffLine(m){
  const k = staffSkill(m);
  return `${C.ROLES[m.role].name} · ${stars(k)} · ${money(wageOf({ role: m.role, skill: k }))}/day`;
}
function dreamLine(m, at){
  if (!m.dream) return null;
  const working = at && at.store === m.dream;
  return h('span', { class: 'dream', style: 'font-size:12px;display:block' }, `${working ? '♥ ' : ''}Dream job: ${C.STORES[m.dream].name}${working ? ' (working it!)' : ''}`);
}

/* ---------- Notebook ---------- */
export function openNotebook(){
  endPick(); endPlacement(); hideCard(); view.selected = null; setToolDot('notebook', false);
  openPanel({ title: 'Gus’s notebook', render: body => {
    const keys = seenTips();
    if (!keys.length) body.append(h('p', { class: 'muted' }, 'Empty for now. Gus’s tips land here as they come up.'));
    body.append(h('div', { class: 'notebook' }, keys.map(k => TIPS[k] ? h('div', { class: 'entry' }, h('b', {}, TIPS[k].title), h('div', {}, TIPS[k].text)) : null)));
    // Only stories: the same flags also mark scenes Gus has done (like suggesting a wing), which have no entry.
    const mem = Object.keys(S.save.flags.memories).filter(k => MEMORIES[k]);
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
  // Opening a second store is a Day 2 thing; night 1 is for hiring clerks.
  if (s.day >= 2 && open.length && s.money >= Math.min(...open)) tip('open', () => openBuild(0));
  if (s.level >= 2 && !s.units.some(u => u.state === 'vacant' || u.state === 'derelict')) tip('newshell', () => openBuild(0));
  if (s.level >= 3){ tip('staff'); if (!s.flags.tips.staff) setToolDot('staff', true); }
  if (s.day >= 2) tip('clerks');
  if (!s.fountain && s.level >= 2 && s.money >= C.FOUNTAIN.cost) tip('fountain', () => { panTo(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1); view.highlight = { x: C.FOUNTAIN.x, y: C.FOUNTAIN.y, w: 2, h: 2 }; setTimeout(() => { view.highlight = null; }, 4000); });
  if (report && s.day >= 2 && !s.decor.some(d => d.type === 'bin')) tip('litter', () => openBuild(1));
  if (s.level >= C.STYLE_LEVEL) tip('style', () => openBuild(3));
}
export function closeNightUi(){ hideCard(); closePanel(); endPick(); endPlacement(); endStyle(); view.selected = null; }
