// Night mode: tapping things in the mall, the Build and Staff panels, and placing or moving things.
import * as C from './config.js';
import * as A from './art.js';
import { S, writeSave, addXp, stores, staffSkill, wageOf, stars, assignClerks } from './state.js';
import { map, rebuildMap, validatePlacement, zoneAt, occAt, FOUNTAIN_ID, ESCALATOR_ID, unitAccess, decorSize, decorAccess, floorRange, floorOf, clearEscalators } from './map.js';
import { sim, staffLook } from './sim.js';
import { view, invalidate, poof, worldToScreen, setFloor } from './render.js';
import { h, openPanel, closePanel, showCard, hideCard, toast, iconCanvas, portrait, showPlacementBar, hidePlacementBar, confirmBox, setToolDot, ROLE_ICON } from './ui.js';
import { sfx } from './audio.js';
import { tip, addMemory, seenTips } from './guide.js';
import { TIPS, MEMORIES } from './story.js';
import { SHELVES, shelfColor, STORE_INFO, DECOR_INFO } from './catalog.js';

const money = n => `$${Math.round(n).toLocaleString()}`;
// Fixing up a boarded-up storefront is folded into the price of opening a store in it.
const fixCost = u => u.state === 'derelict' ? u.w * u.h * C.RENOVATE_PER_TILE : 0;
const shellCost = (w, h) => w * h * C.BUILD_PER_TILE;
let place = null, pick = null, styling = null;
export let onLevelUp = () => {};
export function setLevelUpHandler(fn){ onLevelUp = fn; }
// Tapping an escalator at night hops floors too (main.js does the hop).
let onEscalator = () => {};
export function setEscalatorHandler(fn){ onEscalator = fn; }
export function panTo(x, y){ view.camTarget = { x, y }; }

function changed(xp = 0){
  rebuildMap(S.save); invalidate();
  const moved = assignClerks(S.save);
  if (moved.length === 1) toast(`${moved[0].name} will run ${moved[0].store}`);
  else if (moved.length) toast(`${moved.length} clerks took the open registers`);
  refreshStaffDot();
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
  if (id === ESCALATOR_ID){ hideCard(); view.selected = null; onEscalator(wx, wy); return; }
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
    text: def.attraction ? `Attraction · ${def.seats} ${def.seatWord || (def.attraction === 'theater' ? 'seats' : 'trampolines')} · tickets $${def.price[0]}–${def.price[1]} from the machine at the door · upkeep ${money(def.upkeep)}/day`
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
// Casino stores only go on the casino floor, and the speakeasy's bar only in the basement.
const floorOk = (def, x) => (!def.casino || floorOf(x) === 2) && (!def.bar || floorOf(x) === 3);
function roomFor(key){
  const def = C.STORES[key];
  if (def.kiosk) return [];
  return S.save.units.filter(u => !u.kiosk && (u.state === 'vacant' || u.state === 'derelict') && fits(def, u) && floorOk(def, u.x))
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
// Tapping an empty storefront: every store that fits it, as Mall Market cards.
function openInUnit(u){
  hideCard();
  const fix = fixCost(u), s = S.save;
  const items = Object.entries(C.STORES)
    .filter(([, def]) => !def.kiosk && fits(def, u) && floorOk(def, u.x))
    .map(([key, def]) => storeEntry(key, def, def.cost + fix, () => { if (openStore(u, key)){ closePanel(); view.selected = null; } }))
    .sort(byRank);
  fresh = new Set(); noticeNew(items);
  openPanel({ title: 'Open a store here', full: true, headerExtra: h('span', { class: 'chip mk-money' }, money(s.money)), render: body => {
    body.append(h('div', { class: 'mk-shelves' }, h('span', { class: 'mk-hint', style: 'margin-left:0' },
      `${u.state === 'derelict' ? 'Boarded-up' : 'Empty'} ${u.w}×${u.h} storefront · every ${u.w}×${u.h} store fits${fix ? ` · prices include ${money(fix)} to fix it up` : ''}`)));
    body.append(items.length ? cardRow(items) : h('div', { class: 'mk-empty' }, `No ${u.w}×${u.h} stores yet.`));
  } });
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
  const dealer = def.game && S.save.staff.filter(m => m.role === 'dealer').length > S.save.decor.filter(v => C.DECOR[v.type].game && v.id < d.id).length;
  const txt = def.game ? `Up to three players a round, and the house takes the bets ($${def.game.price[0]}–${def.game.price[1]} a hand). ${dealer ? 'A dealer runs it each day.' : 'Needs a dealer: hire one under Staff, or the table stays closed.'}` : DECOR_TEXT[d.type] || (DECOR_INFO[d.type] || [])[1] || 'Makes the place feel nicer.';
  showCard({ title: def.name, text: txt, actions });
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
/* ---------- The Mall Market (Build menu) ---------- */
// A full-screen shop: Shop (stores, stands, decor), Fix up (storage, the fountain, expansions) and Style.
// Shop items sit on shelves (Food, Shops, Fun, Decor, Casino), with All and New (unlocked, not owned yet) up front.
// The Shop tab filters by type (stores and stands, or decor) and by category. Its cards are grouped: things
// you can buy and don't own yet first, then each category in turn (what you own, then what's still locked).
// A New tag shows on something the first time the market opens after it unlocks.
let kind = 'stores', shelf = 'all', fresh = new Set();
const KINDS = [['stores', 'Stores & Stands'], ['decor', 'Decor']];
function seenSet(){
  const s = S.save;
  if (!s.flags.shopSeen){
    // First time with New tags: everything unlocked before this level counts as already seen.
    s.flags.shopSeen = [...shopItems(), ...styleItems()].filter(it => !it.locked && it.level < s.level).map(it => it.key);
  }
  return new Set(s.flags.shopSeen);
}
function noticeNew(items){
  const seen = seenSet(), now = items.filter(it => !it.locked && !seen.has(it.key)).map(it => it.key);
  for (const k of now) fresh.add(k);
  if (now.length){ S.save.flags.shopSeen.push(...now); writeSave(); }
}
export function openBuild(startTab = 0, startKind = null){
  endPick(); endPlacement(); endStyle(); hideCard(); view.selected = null;
  if (startKind){ kind = startKind; shelf = 'all'; }
  fresh = new Set(); noticeNew([...shopItems(), ...styleItems()]);
  openPanel({ title: 'Build', heading: 'Mall Market', full: true, tabs: ['Shop', 'Fix up', 'Style'], tab: startTab,
    headerExtra: h('span', { class: 'chip mk-money' }, money(S.save.money)),
    render: (body, tab, redraw) => {
      if (tab === 0) shopTab(body, redraw);
      else if (tab === 1) fixTab(body);
      else styleTab(body);
    } });
}
// A store's Mall Market card.
function storeEntry(key, def, cost, pick){
  const s = S.save, [sh, blurb] = STORE_INFO[key] || ['retail', ''], noCasino = def.casino && !s.expansions.casino, noBar = def.bar && !s.expansions.speakeasy;
  return { key: 's:' + key, shelf: sh, name: def.name, blurb, level: def.level, cost, decor: false, pick,
    icon: () => A.storeIcon(def.icon, 0.5, 0.5, 0.62),
    kind: def.kiosk ? 'Stand' : def.attraction ? `Attraction ${def.w}×${def.h}` : `Store ${def.w}×${def.h}`,
    stats: def.attraction ? `Tickets $${def.price[0]}–${def.price[1]} · upkeep ${money(def.upkeep)}/day` : `Sells $${def.price[0]}–${def.price[1]}${def.dine ? ' · dine-in' : ''}${def.casino ? ' · casino floor' : ''}${def.bar ? ' · speakeasy only' : ''}`,
    locked: s.level < def.level || noCasino || noBar, lockText: s.level < def.level ? `Level ${def.level}` : noBar ? 'Needs the speakeasy' : 'Needs the casino',
    have: stores(s).filter(u => u.store === key).length };
}
function shopItems(){
  const s = S.save, out = [];
  for (const [key, def] of Object.entries(C.STORES)){
    const room = roomFor(key);
    out.push(storeEntry(key, def, room.length ? room[0].cost : newCost(key), () => { closePanel(); startPick(key); }));
  }
  for (const [key, def] of Object.entries(C.DECOR)){
    const [sh, blurb] = DECOR_INFO[key] || ['scenery', ''];
    const noCasino = def.casino && !s.expansions.casino, noBar = def.bar && !s.expansions.speakeasy;
    out.push({ key: 'd:' + key, shelf: sh, name: def.name, blurb, level: def.level, cost: def.cost, decor: true,
      icon: () => A.decorThumb(key, def.w),
      kind: `${def.game ? 'Game table' : def.bargame ? 'Bar game' : def.perch ? 'Seating' : def.coin ? 'Machine' : def.play ? 'Play area' : 'Decor'} ${def.w}×${def.h}`,
      stats: def.sub.replace(/^\+ambience$/, 'Makes the mall nicer (+ambience)') + (def.bargame ? ` · $${def.bargame.price[0]}–${def.bargame.price[1]} a game` : '') + (def.rot ? ' · can rotate' : '') + (def.casino ? ' · casino floor' : '') + (def.bar ? ' · speakeasy only' : ''),
      locked: s.level < def.level || noCasino || noBar, lockText: s.level < def.level ? `Level ${def.level}` : noBar ? 'Needs the speakeasy' : 'Needs the casino',
      have: s.decor.filter(d => d.type === key).length,
      pick: () => { closePanel(); startPlacement({ kind: key, decor: key, w: def.w, h: def.h, face: 0, cost: def.cost }); } });
  }
  return out;
}
// Buyable and not owned, then owned, then locked (in unlock order).
const rank = it => it.locked ? 2 : it.have ? 1 : 0;
const byRank = (a, b) => (rank(a) - rank(b)) || (rank(a) === 2 ? a.level - b.level : a.cost - b.cost);
function shopTab(body, redraw){
  const ofKind = shopItems().filter(it => (kind === 'decor') === it.decor);
  const cats = SHELVES.filter(sv => ofKind.some(it => it.shelf === sv.id));
  if (shelf !== 'all' && !cats.some(c => c.id === shelf)) shelf = 'all';
  const chip = (id, name, color, sel, onclick, cls) => h('button', { class: cls, role: 'tab', 'aria-selected': sel ? 'true' : 'false', style: color ? `--c:${color}` : '', onclick: () => { sfx('tap'); onclick(); redraw(); } }, name);
  body.append(h('div', { class: 'mk-shelves' },
    h('span', { class: 'mk-seg', role: 'tablist', 'aria-label': 'Type' }, KINDS.map(([id, name]) => chip(id, name, null, kind === id, () => { if (kind !== id){ kind = id; shelf = 'all'; } }, 'mk-segbtn'))),
    h('span', { class: 'mk-div' }),
    h('span', { class: 'mk-cats', role: 'tablist', 'aria-label': 'Category' },
      chip('all', 'All', null, shelf === 'all', () => { shelf = 'all'; }, 'mk-shelf'),
      cats.map(c => chip(c.id, c.name, c.color, shelf === c.id, () => { shelf = c.id; }, 'mk-shelf')))));
  const out = [];
  if (shelf === 'all'){
    // Everything: what you could add next up front, then category by category.
    const next = ofKind.filter(it => rank(it) === 0).sort((a, b) => SHELVES.findIndex(c => c.id === a.shelf) - SHELVES.findIndex(c => c.id === b.shelf) || a.cost - b.cost);
    if (next.length) out.push({ sep: 'New to you', color: '#3fb8af' }, ...next);
    for (const c of cats){
      const rest = ofKind.filter(it => it.shelf === c.id && rank(it) > 0).sort(byRank);
      if (rest.length) out.push({ sep: c.name, color: c.color }, ...rest);
    }
  } else {
    const list = ofKind.filter(it => it.shelf === shelf).sort(byRank);
    ['New to you', 'Owned', 'Coming soon'].forEach((name, r) => { const g = list.filter(it => rank(it) === r); if (g.length) out.push({ sep: name, color: shelfColor(shelf) }, ...g); });
  }
  body.append(out.length ? cardRow(out) : h('div', { class: 'mk-empty' }, 'Nothing here yet.'));
}
function fixTab(body){
  const s = S.save, f = C.FOUNTAIN, items = [];
  items.push({ shelf: 'fix', color: '#5bb5e8', name: 'The old fountain', kind: 'Fix up', icon: () => A.storeIcon('broom', 0.5, 0.5, 0.65), cost: f.cost,
    blurb: s.fountain ? 'Running again, and folks stop to sit a while.' : 'Dusty and dry. Get the water going and it’s the heart of the mall again.',
    done: s.fountain, doneText: 'Running', openDone: true, pick: () => { closePanel(); panTo(f.x + 1, f.y + 1); fountainCard(); } });
  for (const z of C.ZONES){
    const done = !!s.zones[z.id];
    items.push({ shelf: 'fix', color: '#c9a227', name: z.name, kind: `Storage ${z.w}×${z.h}`, icon: () => A.storeIcon('broom', 0.5, 0.5, 0.65), cost: z.cost,
      blurb: done ? 'Swept out and ready for shops.' : 'Old boxes and dust. It clears itself when you build a store here, or clear it now.',
      done, doneText: 'Cleared', locked: s.level < z.level, lockText: `Level ${z.level}`, pick: () => { closePanel(); panTo(z.x + z.w / 2, z.y + z.h / 2); zoneCard(z); } });
  }
  for (const e of C.EXPANSIONS){
    const done = !!s.expansions[e.id], prev = e.requires && C.EXPANSIONS.find(q => q.id === e.requires), blocked = prev && !s.expansions[prev.id];
    items.push({ shelf: e.id === 'casino' || e.id === 'vip' ? 'casino' : 'fun', name: e.name, kind: 'Expansion', icon: () => A.storeIcon(e.id === 'speakeasy' ? 'bar' : 'sun', 0.5, 0.5, 0.62), cost: e.cost,
      blurb: e.sub + '.', done, doneText: 'Open', locked: s.level < e.level || blocked, lockText: s.level < e.level ? `Level ${e.level}` : prev ? `After ${prev.name}` : '',
      pick: () => buyExpansion(e) });
  }
  // Only what's still to do: finished fix-ups and open expansions drop off the list.
  const todo = items.filter(it => !it.done).sort((a, b) => !!a.locked - !!b.locked);
  body.append(todo.length ? cardRow(todo) : h('div', { class: 'mk-empty' }, 'Everything’s fixed up and built. Nice work!'));
}
// The cards scroll sideways (or in two rows on a tall screen); a mouse wheel scrolls them too.
// A { sep } entry is a slim label between groups.
function cardRow(items){
  const row = h('div', { class: 'mk-row' }, items.map(it => it.sep ? h('div', { class: 'mk-sep', style: `--c:${it.color}` }, h('span', {}, it.sep)) : mkCard(it)));
  row.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)){ row.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  return row;
}
function mkCard(it){
  const afford = S.save.money >= it.cost, isNew = !it.locked && fresh.has(it.key);
  const state = it.locked ? 'locked' : it.done ? 'owned' : it.priceText ? 'can' : afford ? 'can' : 'short';
  const price = it.locked ? it.lockText : it.done ? it.doneText : it.priceText || money(it.cost);
  return h('button', { class: `mk-card ${state}`, disabled: it.locked || (it.done && !it.openDone), style: `--c:${it.color || shelfColor(it.shelf)}`,
    onclick: e => {
      // Can't afford it: say so right on the card instead of heading off to place it.
      if (state === 'short'){
        sfx('error'); toast(`Not enough money: ${it.name} is ${money(it.cost)}`, 2600);
        const c = e.currentTarget; c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        return;
      }
      sfx('tap'); it.pick();
    } },
    h('span', { class: 'mk-art' }, iconCanvas(it.icon, 78),
      h('span', { class: 'mk-kind' }, it.kind),
      isNew ? h('span', { class: 'mk-new' }, 'New') : it.have > 0 ? h('span', { class: 'mk-have' }, `Own ${it.have}`) : null),
    h('span', { class: 'mk-text' },
      h('span', { class: 'mk-name' }, it.name),
      h('span', { class: 'mk-blurb' }, it.blurb),
      it.stats ? h('span', { class: 'mk-stats' }, it.stats) : null),
    h('span', { class: 'mk-buy' }, it.locked ? h('span', { class: 'mk-lock', html: LOCK }) : null, price));
}
const LOCK = '<svg viewBox="0 0 12 14" width="11" height="13"><path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="1" y="6" width="10" height="7.5" rx="1.6" fill="currentColor"/></svg>';

/* ---------- Mall styles: tap one to see it on the mall, then keep it or go back ---------- */
const STYLE_SLOTS = { wall: { table: C.WALLPAPERS, label: 'Wallpaper', noun: 'wallpaper' }, floor: { table: C.FLOORS, label: 'Flooring', noun: 'floor' } };
const ownsStyle = (slot, id) => S.save.style[slot + 's'].includes(id);
function styleItems(){
  const s = S.save, items = [];
  for (const [slot, { table, label }] of Object.entries(STYLE_SLOTS)){
    for (const [id, d] of Object.entries(table)){
      // Each style unlocks at its own level milestone.
      const have = ownsStyle(slot, id), inUse = s.style[slot] === id, needs = d.level || 0;
      items.push({ key: `${slot}:${id}`, shelf: 'style', color: slot === 'wall' ? '#3fb8af' : '#c9a227', name: d.name, kind: label, blurb: d.sub + (d.ambience ? ' · +ambience' : ''), cost: d.cost, level: needs,
        icon: () => styleSwatch(slot, id), locked: (s.level < needs || s.level < C.STYLE_LEVEL) && !have, lockText: `Level ${Math.max(needs, C.STYLE_LEVEL)}`,
        done: inUse, doneText: 'In use', openDone: true, priceText: !inUse && have ? 'Owned' : null, have: have ? -1 : 0,
        pick: () => { closePanel(); startStyle(slot, id); } });
    }
  }
  return items;
}
function styleTab(body){
  const locked = S.save.level < C.STYLE_LEVEL;
  body.append(h('div', { class: 'mk-shelves' }, h('span', { class: 'mk-hint', style: 'display:block;margin-left:0' }, locked ? `Unlocks at level ${C.STYLE_LEVEL}: new wallpaper and flooring for the whole mall.` : 'Tap a style to try it on your mall. Ones you own are free to switch back to.')));
  body.append(cardRow(styleItems()));
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
    onCancel: () => { endStyle(); openBuild(2); }, onConfirm: confirmStyle,
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
  for (const l of e.lots) s.units.push({ id: s.nextId++, x: l.x, y: l.y, w: l.w, h: l.h, face: l.face, state: l.store ? 'store' : 'vacant', store: l.store || null, stock: l.store ? C.STORES[l.store].stock : 0 });
  if (e.restroom) s.units.push({ id: s.nextId++, x: e.restroom.x, y: e.restroom.y, w: C.RESTROOM.w, h: C.RESTROOM.h, face: e.restroom.face, state: 'restroom', store: null, stock: 0 });
  for (const d of e.decor) s.decor.push({ id: s.nextId++, ...d });
  rebuildMap(s); clearEscalators(s);
  sfx('build'); poof(e.x, 0, e.w, C.MAP_H);
  changed(e.xp);
  view.camTarget = { x: e.x + e.w / 2 - 2, y: 7.5, s: view.minS * 1.4 };
  toast(e.id === 'east' ? 'The Second Floor is open: a blank slate to build on! Tap the escalator to go up.'
    : e.id === 'casino' ? 'The Lucky Star Casino is open on the third floor! Hire dealers under Staff to run the tables.'
    : e.id === 'speakeasy' ? 'The Velvet Rose is open in the basement! Put a clerk behind the bar, and look for bar games under Build.' : `The ${e.name} is open! New storefronts are waiting.`, 4500);
  if (e.floor === 3){ setFloor(3); view.cam.x = e.x + e.w / 2; }
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
  // Casino things go on the casino floor: head up there.
  const cas = (p.decor && C.DECOR[p.decor].casino) || (p.store && C.STORES[p.store].casino);
  if (cas && view.floor !== 2 && S.save.expansions.casino && p.x === undefined){ setFloor(2); view.cam.x = C.F3X + 6; }
  // Speakeasy things go in the basement: head down there.
  const bar = (p.decor && C.DECOR[p.decor].bar) || (p.store && C.STORES[p.store].bar);
  if (bar && view.floor !== 3 && S.save.expansions.speakeasy && p.x === undefined){ setFloor(3); view.cam.x = C.F4X + 8; }
  place = { ...p };
  // While it's being moved, the piece leaves its old spot (shown empty) and follows the drag.
  if (p.moveId){ view.hideId = p.moveId; invalidate(); }
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
    if (place.store && C.STORES[place.store].casino && floorOf(x) !== 2) return { ok: false, reason: 'This goes on the casino floor', zones: [] };
    if (place.store && C.STORES[place.store].bar && floorOf(x) !== 3) return { ok: false, reason: 'This goes down in the speakeasy', zones: [] };
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
  view.ghost = { x: place.x, y: place.y, w: place.w, h: place.h, face: place.face, ok: v.ok, access, moving: !!place.moveId, bin: place.decor === 'bin', zones: v.ok ? v.zones : [], preview: t => {
    if (place.kind === 'unit'){
      const def = place.restroom ? C.RESTROOM : C.STORES[place.store];
      // The whole store comes along when it's moved: its floor, furniture and all.
      if (place.moveId){ A.floor(def.floor || 'plain', temp.x, temp.y, temp.w, temp.h, place.moveId * 17); temp.id = place.moveId; }
      A.unitBack(temp, def, t); if (def.attraction && temp.face !== 'down') A.attractionFloor(temp, def);
      if (!place.restroom && !def.attraction) A.storeFurniture(temp, def, t, 'counter');
      if (place.moveId && !def.attraction){ A.storeFurniture(temp, def, t, 'mid'); if (def.icon === 'shirt') A.storeFurniture(temp, def, t, 'teeTable'); }
      if (place.moveId && def.dine) A.dineSpots(temp).tables.forEach((tb, i) => { A.dineTable(temp, i, 'stools'); A.dineTable(temp, i, 'table'); });
      A.unitFront(temp, def, t); A.unitSign(temp, def);
    }
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
export function endPlacement(){ place = null; view.ghost = null; if (view.hideId){ view.hideId = 0; invalidate(); } hidePlacementBar(); }

/* ---------- Staff ---------- */
function applicants(){
  const s = S.save, f = s.flags;
  // New applicants each day, and right away when a level unlocks a new role.
  const key = `3:${s.day}:${s.level}`;
  if (f.appDay !== key || !f.applicants){
    // Enough clerks to staff every register that needs one (three at least, up to eight), one of every other role.
    const unstaffed = stores(s).filter(u => !C.STORES[u.store].attraction && !s.staff.some(m => m.storeId === u.id)).length;
    const clerks = Math.max(3, Math.min(8, unstaffed + 1));
    // Same for dealers: one for every table still without one.
    const tables = s.decor.filter(d => C.DECOR[d.type].game).length, dealers = Math.max(1, Math.min(5, tables - s.staff.filter(m => m.role === 'dealer').length + 1));
    const roles = [];
    for (const [role, r] of Object.entries(C.ROLES)) if (s.level >= r.level) roles.push(...(role === 'clerk' ? Array(clerks).fill('clerk') : role === 'dealer' ? Array(dealers).fill('dealer') : [role]));
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
/* ---------- The Staff Room (Staff button at night) ---------- */
// A full-screen page with three tabs. Overview: the numbers at a glance, what needs attention (each with a fix),
// every role's slots, and every register with who runs it. Team: everyone you employ. Hire: today's applicants.
const ROLE_ORDER = ['clerk', 'janitor', 'supervisor', 'guard', 'greeter', 'mascot', 'dealer', 'host'];
const ROLE_WHY = { janitor: 'trash piles up and ratings slip', supervisor: 'staff slack off on their phones', guard: 'troublemakers scare shoppers off', greeter: 'shoppers are less patient', mascot: 'the crowd is smaller', host: 'gamblers are a little less happy' };
let teamRole = 'all', hireRole = 'all';
const registers = s => stores(s).filter(u => !C.STORES[u.store].attraction);
const floorTag = u => ['', '2F', '3F', 'B1'][floorOf(u.x)] || '';
export function staffNeeds(s = S.save){
  const regs = registers(s), clerkAt = new Map(s.staff.filter(m => m.role === 'clerk' && m.storeId).map(m => [m.storeId, m]));
  const unstaffed = regs.filter(u => !clerkAt.has(u.id)), idle = s.staff.filter(m => m.role === 'clerk' && (!m.storeId || !regs.some(u => u.id === m.storeId)));
  const tables = s.decor.filter(d => C.DECOR[d.type].game).length, dealers = s.staff.filter(m => m.role === 'dealer').length;
  const count = role => s.staff.filter(m => m.role === role).length, limit = role => C.STAFF_LIMITS[role][s.level] || 0;
  return { regs, clerkAt, unstaffed, idle, tables, dealers, count, limit, wages: s.staff.reduce((a, m) => a + wageOf(m), 0) };
}
// A red dot on the Staff button while a register has nobody (and you could do something about it) or a table has no dealer.
export function refreshStaffDot(){
  const s = S.save; if (!s || s.level < 1) return;
  const n = staffNeeds(s);
  setToolDot('staff', (n.unstaffed.length > 0 && (n.idle.length > 0 || n.count('clerk') < n.limit('clerk'))) || (n.tables > n.dealers && n.count('dealer') < n.limit('dealer')));
}
export function openStaff(startTab = null){
  endPick(); endPlacement(); hideCard(); view.selected = null; setToolDot('staff', false);
  // The tutorials send you straight to the applicants.
  const tab = startTab !== null ? startTab : view.staffTab === 'hire' ? 2 : 0; view.staffTab = null;
  const wageChip = h('span', { class: 'chip mk-money', style: 'margin-left:0' }), moneyChip = h('span', { class: 'chip mk-money' });
  const panel = openPanel({ title: 'Staff', heading: 'Staff Room', full: true, tabs: ['Overview', 'Team', 'Hire'], tab,
    headerExtra: h('span', { style: 'display:flex;gap:6px;margin-left:auto' }, wageChip, moneyChip),
    onClose: refreshStaffDot,
    render: (body, t, redraw) => {
      const n = staffNeeds();
      wageChip.textContent = `Wages ${money(n.wages)}/day`; moneyChip.textContent = money(S.save.money);
      const go = (i, role) => { if (role){ if (i === 1) teamRole = role; else hireRole = role; } panel.setTab(i); };
      if (t === 0) staffOverview(body, n, redraw, go); else if (t === 1) staffTeam(body, redraw); else staffHire(body, redraw);
    } });
}
function staffOverview(body, n, redraw, go){
  const s = S.save, wrap = h('div', { class: 'sr-scroll' });
  const casino = s.expansions.casino || n.tables > 0;
  const open = ROLE_ORDER.filter(r => s.level >= C.ROLES[r].level), slots = open.reduce((a, r) => a + Math.max(0, n.limit(r) - n.count(r)), 0);
  const tile = (label, value, sub, bad) => h('div', { class: `sr-tile${bad ? ' bad' : ''}` }, h('b', {}, value), h('span', {}, label), sub ? h('small', {}, sub) : null);
  wrap.append(h('div', { class: 'sr-tiles' },
    tile('registers staffed', `${n.regs.length - n.unstaffed.length}/${n.regs.length}`, n.unstaffed.length ? `${n.unstaffed.length} need a clerk` : 'all covered', n.unstaffed.length > 0),
    tile('clerks without a register', n.idle.length, n.idle.length ? 'ready to place' : 'everyone’s placed', n.idle.length > 0 && n.unstaffed.length > 0),
    tile('on the team', s.staff.length, `${money(n.wages)} a day in wages`),
    tile('open spots to hire', slots, open.length ? 'more come with levels' : ''),
    casino ? tile('tables with a dealer', `${Math.min(n.tables, n.dealers)}/${n.tables}`, n.tables > n.dealers ? `${n.tables - n.dealers} closed` : 'all open', n.tables > n.dealers) : null));
  // What needs attention, each with the fix.
  const alerts = [];
  const alert = (kind, text, btn, onClick) => alerts.push(h('div', { class: `sr-alert ${kind}` }, h('span', {}, text), btn ? h('button', { class: `btn small ${kind === 'bad' ? 'primary' : ''}`, onclick: () => { sfx('tap'); onClick(); } }, btn) : null));
  const fillable = Math.min(n.idle.length, n.unstaffed.length);
  if (fillable) alert('bad', `${n.idle.length} clerk${n.idle.length > 1 ? 's are' : ' is'} free and ${n.unstaffed.length} register${n.unstaffed.length > 1 ? 's need' : ' needs'} one.`, 'Fill registers', () => { const moved = assignClerks(s); writeSave(); toast(moved.length === 1 ? `${moved[0].name} will run ${moved[0].store}` : `${moved.length} clerks placed`); redraw(); });
  const still = n.unstaffed.length - fillable, clerkRoom = n.limit('clerk') - n.count('clerk');
  if (still > 0) alert('bad', clerkRoom > 0 ? `${still} register${still > 1 ? 's have' : ' has'} no clerk, so you'd run ${still > 1 ? 'them' : 'it'} yourself. You can hire ${Math.min(clerkRoom, still)} more.` : `${still} register${still > 1 ? 's have' : ' has'} no clerk and your clerk team is full (${n.count('clerk')}/${n.limit('clerk')}). Leveling up adds clerk spots.`, clerkRoom > 0 ? 'Hire clerks' : null, () => go(2, 'clerk'));
  if (n.idle.length && !n.unstaffed.length) alert('warn', `${n.idle.length} clerk${n.idle.length > 1 ? 's have' : ' has'} no register. Open another store or stand, or let ${n.idle.length > 1 ? 'one' : 'them'} go to save on wages.`, 'See clerks', () => go(1, 'clerk'));
  if (n.tables > n.dealers){ const room = n.limit('dealer') - n.count('dealer'); alert('bad', `${n.tables - n.dealers} casino table${n.tables - n.dealers > 1 ? 's have' : ' has'} no dealer and stay${n.tables - n.dealers > 1 ? '' : 's'} closed.${room > 0 ? '' : ' Your dealer team is full.'}`, room > 0 ? 'Hire dealers' : null, () => go(2, 'dealer')); }
  const missing = open.filter(r => r !== 'clerk' && r !== 'dealer' && n.count(r) === 0 && n.limit(r) > 0);
  for (const r of missing.slice(0, 3)) alert('idea', `No ${C.ROLES[r].name.toLowerCase()} yet. Without one, ${ROLE_WHY[r] || 'you miss out'}.`, `Hire a ${C.ROLES[r].name.toLowerCase()}`, () => go(2, r));
  if (s.staff.some(m => staffSkill(m) === 1)) { const k = s.staff.filter(m => staffSkill(m) === 1).length; alert('idea', `${k} of your staff ${k > 1 ? 'are' : 'is'} one-star: slower, and more often on ${k > 1 ? 'their phones' : 'the phone'}. Better applicants show up every day.`, null); }
  const left = h('div', { class: 'sr-col' }, h('div', { class: 'section-label' }, 'Needs attention'),
    alerts.length ? alerts : h('div', { class: 'sr-alert good' }, h('span', {}, 'All covered! Every register has a clerk and every role you need is filled.')));
  // Roles: how full each team is, and the next one coming.
  const next = ROLE_ORDER.find(r => s.level < C.ROLES[r].level);
  left.append(h('div', { class: 'section-label' }, 'Your team'), h('div', { class: 'sr-roles' },
    [...open, ...(next ? [next] : [])].map(r => {
      const role = C.ROLES[r], locked = s.level < role.level, c = n.count(r), L = n.limit(r);
      return h('div', { class: `sr-role${locked ? ' locked' : ''}` }, iconCanvas(ROLE_ICON[r], 34),
        h('span', { class: 'info' }, h('b', {}, role.plural), h('span', { class: 'bar' }, h('i', { style: `width:${L ? Math.min(100, c / L * 100) : 0}%` })),
          h('small', {}, locked ? `Unlocks at level ${role.level}` : `${c} of ${L} · ${money(role.wage[1])}–${money(role.wage[3])}/day`)),
        locked ? null : h('button', { class: 'btn small', disabled: c >= L, onclick: () => { sfx('tap'); go(2, r); } }, c >= L ? 'Full' : 'Hire'));
    })));
  // Every register and who runs it; pick a clerk right here.
  const clerks = s.staff.filter(m => m.role === 'clerk');
  const regs = [...n.regs].sort((a, b) => (n.clerkAt.has(a.id) - n.clerkAt.has(b.id)) || floorOf(a.x) - floorOf(b.x) || C.STORES[a.store].name.localeCompare(C.STORES[b.store].name));
  const right = h('div', { class: 'sr-col' }, h('div', { class: 'section-label' }, `Registers (${n.regs.length})`), h('div', { class: 'sr-regs' },
    regs.length ? regs.map(u => {
      const def = C.STORES[u.store], m = n.clerkAt.get(u.id);
      const sel = h('select', { 'aria-label': `Clerk for ${def.name}`, onchange: e => {
        const pick = clerks.find(c => c.id === +e.target.value);
        if (m) m.storeId = null;
        if (pick) pick.storeId = u.id;
        writeSave(); redraw();
      } }, h('option', { value: '' }, m ? 'Nobody (you run it)' : 'Help wanted'),
        clerks.map(c => { const at = c.storeId && s.units.find(v => v.id === c.storeId && v.state === 'store'); return h('option', { value: c.id, selected: m === c }, `${c.name} ${stars(staffSkill(c))}${c.dream === u.store ? ' ♥' : ''}${c === m ? '' : at ? ` (from ${C.STORES[at.store].name})` : ' (free)'}`); }));
      return h('div', { class: `sr-reg${m ? '' : ' bad'}` }, iconCanvas(() => A.storeIcon(def.icon, 0.5, 0.5, 0.62), 30),
        h('span', { class: 'info' }, h('b', {}, def.name, floorTag(u) ? h('small', {}, ` ${floorTag(u)}`) : null), sel));
    }) : h('div', { class: 'mk-empty' }, 'No stores open yet.')));
  wrap.append(h('div', { class: 'sr-cols' }, left, right));
  body.append(wrap);
}
function roleChips(roles, current, set, redraw, label){
  return h('div', { class: 'mk-shelves' }, h('span', { class: 'mk-cats', role: 'tablist' },
    [['all', 'All'], ...roles.map(r => [r, label(r)])].map(([id, name]) => h('button', { class: 'mk-shelf', role: 'tab', 'aria-selected': current === id ? 'true' : 'false', onclick: () => { sfx('tap'); set(id); redraw(); } }, name))));
}
function staffTeam(body, redraw){
  const s = S.save, n = staffNeeds(s), roles = ROLE_ORDER.filter(r => n.count(r) > 0);
  if (teamRole !== 'all' && !roles.includes(teamRole)) teamRole = 'all';
  body.append(roleChips(roles, teamRole, r => { teamRole = r; }, redraw, r => `${C.ROLES[r].plural} ${n.count(r)}`));
  const team = s.staff.filter(m => teamRole === 'all' || m.role === teamRole).sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || staffSkill(b) - staffSkill(a) || a.name.localeCompare(b.name));
  const grid = h('div', { class: 'sr-scroll' }, h('div', { class: 'sr-grid' }, team.map(m => {
    const at = m.storeId && s.units.find(u => u.id === m.storeId && u.state === 'store');
    const ownStores = n.regs.filter(u => !n.clerkAt.has(u.id) || n.clerkAt.get(u.id) === m);
    const job = m.role === 'clerk'
      ? h('select', { 'aria-label': `${m.name}'s register`, onchange: e => { m.storeId = +e.target.value || null; writeSave(); redraw(); } },
          h('option', { value: '' }, 'No register (free)'), ownStores.map(u => h('option', { value: u.id, selected: m.storeId === u.id }, C.STORES[u.store].name + (floorTag(u) ? ` ${floorTag(u)}` : '') + (m.dream === u.store ? ' ♥' : ''))))
      : h('small', { class: 'muted' }, C.ROLES[m.role].desc);
    return h('div', { class: `sr-card${m.role === 'clerk' && !at ? ' warn' : ''}` }, portrait(m.look, 52),
      h('span', { class: 'info' }, h('b', {}, m.name), h('small', {}, staffLine(m)), dreamLine(m, at), job),
      h('button', { class: 'btn small', onclick: async () => { if (await confirmBox(`Let ${m.name} go?`, 'Let go')){ s.staff = s.staff.filter(o => o !== m); if (m.dee) s.flags.hiredDee = false; writeSave(); redraw(); } } }, 'Let go'));
  })));
  body.append(team.length ? grid : h('div', { class: 'mk-empty' }, 'Nobody works here yet. Hire someone under Hire.'));
}
function staffHire(body, redraw){
  const s = S.save, n = staffNeeds(s), open = ROLE_ORDER.filter(r => s.level >= C.ROLES[r].level);
  if (hireRole !== 'all' && !open.includes(hireRole)) hireRole = 'all';
  body.append(roleChips(open, hireRole, r => { hireRole = r; }, redraw, r => `${C.ROLES[r].plural} ${n.count(r)}/${n.limit(r)}`));
  const apps = open.length ? applicants().filter(a => hireRole === 'all' || a.role === hireRole) : [];
  const grid = h('div', { class: 'sr-scroll' }, h('div', { class: 'sr-grid' }, apps.map(a => {
    const look = staffLook(a.role, a.seed), full = n.count(a.role) >= n.limit(a.role);
    return h('div', { class: 'sr-card' }, portrait(look, 52),
      h('span', { class: 'info' }, h('b', {}, a.name), h('small', {}, staffLine(a) + (a.dee ? ' · Gus recommends her' : '')),
        a.dream ? h('span', { class: 'dream' }, `Dream job: ${C.STORES[a.dream].name}`, n.unstaffed.some(u => u.store === a.dream) ? h('span', { class: 'open-now' }, 'needs a clerk!') : null) : null,
        a.role === 'clerk' ? null : h('small', { class: 'muted' }, C.ROLES[a.role].desc)),
      h('button', { class: 'btn small primary', disabled: full, 'data-dee': a.dee ? '1' : null, onclick: () => {
        const openRegs = n.regs.filter(u => !s.staff.some(o => o.storeId === u.id));
        const free = openRegs.find(u => u.store === a.dream) || openRegs.find(u => !u.kiosk) || openRegs[0];
        s.staff.push({ id: s.nextId++, role: a.role, name: a.name, look, storeId: a.role === 'clerk' && free ? free.id : null, skill: a.skill || 2, dream: a.dream || null, dee: !!a.dee });
        if (a.dee) s.flags.hiredDee = true; else s.flags.applicants = s.flags.applicants.filter(x => x !== a);
        sfx('build'); writeSave(); redraw(); tip('speed');
        toast(a.role === 'clerk' && free ? `${a.name} starts tomorrow at ${C.STORES[free.store].name}` : `${a.name} starts tomorrow`);
      } }, full ? 'Team full' : 'Hire'));
  })));
  body.append(apps.length ? grid : h('div', { class: 'mk-empty' }, open.length ? 'No one else is looking for that job today. New applicants come every morning.' : 'Hiring opens soon.'));
  body.append(h('p', { class: 'sr-foot' }, 'New applicants every morning. More stars: faster, more reliable, and a higher wage. Clerks sell more at their dream store (♥).'));
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
  refreshStaffDot();
  tip('night');
  const open = Object.entries(C.STORES).filter(([, d]) => !d.kiosk && d.level <= s.level).flatMap(([k]) => roomFor(k).map(r => r.cost));
  // Opening a second store is a Day 2 thing; night 1 is for hiring clerks.
  if (s.day >= 2 && open.length && s.money >= Math.min(...open)) tip('open', () => openBuild(0));
  if (s.level >= 2 && !s.units.some(u => u.state === 'vacant' || u.state === 'derelict')) tip('newshell', () => openBuild(0));
  if (s.level >= 3){ tip('staff'); if (!s.flags.tips.staff) setToolDot('staff', true); }
  if (s.day >= 2) tip('clerks');
  if (!s.fountain && s.level >= 2 && s.money >= C.FOUNTAIN.cost) tip('fountain', () => { panTo(C.FOUNTAIN.x + 1, C.FOUNTAIN.y + 1); view.highlight = { x: C.FOUNTAIN.x, y: C.FOUNTAIN.y, w: 2, h: 2 }; setTimeout(() => { view.highlight = null; }, 4000); });
  if (report && s.day >= 2 && !s.decor.some(d => d.type === 'bin')) tip('litter', () => openBuild(0, 'decor'));
  if (s.level >= C.STYLE_LEVEL) tip('style', () => openBuild(2));
}
export function closeNightUi(){ hideCard(); closePanel(); endPick(); endPlacement(); endStyle(); view.selected = null; }
