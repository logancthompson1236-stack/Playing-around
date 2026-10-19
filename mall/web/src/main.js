// Boot and game flow: title → intro → Day 1 with Gus → (report → night → next day) forever.
import * as C from './config.js';
import { S, newSave, loadSave, writeSave, clearSave, hasSave, loadSettings, writeSettings, stores, assignClerks } from './state.js';
import { rebuildMap, occAt, FOUNTAIN_ID, validatePlacement, map, clearEscalators, fixDoors, floorOf, hasUpstairs, topFloor } from './map.js';
import { sim, step, startDay, buildReport, addJob, GUS_LINES, stepGus, staffLook } from './sim.js';
import { initRender, resize, render, view, invalidate, clampCam, restroomBubble, setFloor } from './render.js';
import { initInput } from './input.js';
import { startTitleScene } from './titlescene.js';
import { unlockAudio, sfx, setMusicMode, applySettings, setBackground } from './audio.js';
import * as UI from './ui.js';
import { runDay1, pumpWaiters, tip, updateTips, resetTipBudget, maybeMemory, gusWantsToVisit, runDeeScene, deeSceneRunning, runExpandScene, runClerkScene, runStoreScene, runTroubleScene, setNightIntro } from './guide.js';
import { nightTap, openBuild, openStaff, openNotebook, placing, grabGhost, dragGhost, nightTips, closeNightUi, setLevelUpHandler, setEscalatorHandler } from './night.js';
import { MEET_GUS, MEMORIES } from './story.js';

const canvas = document.getElementById('world');
let phase = 'title';
let titleScene = null;           // title | intro | day | report | night
let gusToday = false;

loadSettings();
initRender(canvas);
window.addEventListener('resize', () => { resize(); });
document.addEventListener('pointerdown', () => unlockAudio(), { capture: true });
// Leaving the app (home button, app switcher, screen off, a call) pauses the day and the sound.
// Browsers report it as visibilitychange; the Android app also sends pause/resume.
function toBackground(){ setBackground(true); if (phase === 'day' && !sim.paused) pauseMenu(); }
function fromBackground(){ setBackground(false); }
document.addEventListener('visibilitychange', () => { if (document.hidden) toBackground(); else fromBackground(); });
document.addEventListener('pause', toBackground);
document.addEventListener('resume', fromBackground);
window.mallBackground = hidden => hidden ? toBackground() : fromBackground();   // called by the Android app

UI.buildHud({
  speed: () => { sim.speed = sim.speed > 1 ? 1 : 2; },
  pause: () => pauseMenu(),
  build: () => openBuild(),
  staff: () => openStaff(),
  notebook: () => openNotebook(),
  settings: () => settings(true),
  open: () => openDoors(),
  floorUp: () => { view.camTarget = null; setFloor(view.floor + 1); },
  floorDown: () => { view.camTarget = null; setFloor(view.floor - 1); },
});
setLevelUpHandler(async levels => {
  await UI.showLevelUp(levels);
  if (phase === 'night' && S.save.level >= 3) runDeeScene();
});

initInput(canvas, {
  onTap: (x, y) => { if (phase === 'day') dayTap(x, y); else if (phase === 'night') nightTap(x, y); },
  onGrab: (x, y) => phase === 'night' && grabGhost(x, y),
  onGrabMove: (x, y) => dragGhost(x, y),
  onGrabEnd: () => {},
});

/* ---------- Offline ---------- */
// On the web (GitHub Pages, or added to an iPhone's home screen) a service worker keeps a copy of the game so it opens
// with no connection. Not inside the Android app (it's already installed) or when opened as a local file.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !window.Capacitor && window.top === window)
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

setEscalatorHandler((x, y) => rideEscalatorAt(x, y));
/* ---------- Title ---------- */
function boot(){
  const saved = loadSave();
  S.save = saved || newSave({ name: 'Boss', mall: 'Sunnyside Mall', look: { skin: '#f2c7a5', hair: '#6b3e26', hairStyle: 'short', shirt: '#f4b942', pants: '#4a5a8a' } });
  rebuildMap(S.save); invalidate();
  view.mode = 'night'; phase = 'title';
  view.cam.x = 13; view.cam.y = 8; view.cam.s = view.minS * 1.15; clampCam();
  UI.setHudMode('none');
  // The title is the outside of the mall at dusk; starting walks in through its doors.
  titleScene = startTitleScene(document.getElementById('ui'), { mall: saved && saved.player && saved.player.mall });
  view.covered = true;
  const enter = go => async () => { await titleScene.enter(); view.covered = false; go(); titleScene.fadeOut(); titleScene = null; };
  UI.showTitle({ hasSave: !!saved, onContinue: enter(continueGame), onNew: enter(newGame), onSettings: () => settings(false) });
  UI.iosInstallTip();
}
async function newGame(){
  clearSave();
  phase = 'intro';
  setMusicMode('night');
  await UI.runIntro('Sunnyside Mall');
  await UI.say(MEET_GUS);
  const player = await UI.runCreate();
  S.save = newSave(player); S.save.phase = 'start';
  writeSave();
  rebuildMap(S.save); invalidate(); UI.resetMoneyDisplay();
  beginDay();
}
// After a remodel: kiosks go back on the concourse (the pretzel cart to its usual spot), and stores that had no
// matching storefront get a new one on open floor. Anything that still doesn't fit is refunded.
function placeLeftovers(s){
  if (!s.pendingKiosks && !s.pendingStores) return;
  let refund = 0;
  const c0 = C.CONCOURSE.y, c1 = c0 + C.CONCOURSE.h;
  for (const k of s.pendingKiosks || []){
    const def = C.STORES[k.store], home = C.START_KIOSKS.find(q => q.store === k.store);
    const spots = home ? [home] : [];
    for (let y = c0; y < c1; y++) for (let x = 0; x < map.w - 1; x++) spots.push({ x, y });
    const at = spots.find(p => validatePlacement(s, 'kiosk', p.x, p.y, def.w, def.h, 'down').ok);
    if (at){ s.units.push({ id: k.id, x: at.x, y: at.y, w: def.w, h: def.h, face: 'down', kiosk: true, state: 'store', store: k.store, stock: k.stock }); rebuildMap(s); }
    else refund += def.cost;
  }
  for (const k of s.pendingStores || []){
    let at = null;
    for (let d = 0; d < 8 && !at; d++) for (const y of [c0 - k.h - d, c1 + d]) for (let x = 0; x <= map.w - k.w && !at; x++){
      if (y < 0 || y + k.h > C.MAP_H) continue;
      const face = y + k.h <= c0 ? 'down' : 'up';
      if (validatePlacement(s, 'unit', x, y, k.w, k.h, face).ok) at = { x, y, face };
    }
    if (at){ s.units.push({ id: k.id, x: at.x, y: at.y, w: k.w, h: k.h, face: at.face, state: 'store', store: k.store, stock: k.stock }); rebuildMap(s); }
    else refund += C.STORES[k.store].cost + k.w * k.h * C.BUILD_PER_TILE;
  }
  for (const m of s.staff) if (m.storeId && !s.units.some(u => u.id === m.storeId)) m.storeId = null;
  s.money += refund;
  if (s.flags.remodel) s.flags.remodel.refund = refund;
  delete s.pendingKiosks; delete s.pendingStores; writeSave();
}
function remodelNote(s){
  const r = s.flags.remodel; if (!r) return;
  delete s.flags.remodel; writeSave();
  const bits = [];
  if (r.decor) bits.push(`your decorations were refunded (${'$' + r.decor.toLocaleString()}) so you can place them again`);
  if (r.refund) bits.push(`stores with no room left were refunded (${'$' + r.refund.toLocaleString()})`);
  const m = UI.modal(UI.h('div', {}, UI.h('h2', {}, 'The mall got a remodel'),
    UI.h('p', { style: 'margin:0 0 10px;line-height:1.45' }, `New floor plan: a wider concourse, storefronts side by side and bigger restrooms. Your stores moved to storefronts of the same size${bits.length ? ', and ' + bits.join('; ') : ''}.`),
    UI.h('div', { style: 'display:flex;justify-content:flex-end' }, UI.h('button', { class: 'btn primary', onclick: () => m.close() }, 'Let’s see it'))));
}
// v0.12: the East Wing (and Garden Court) moved upstairs.
function upstairsNote(s, fixed){
  if (!s.flags.upstairs) return;
  delete s.flags.upstairs; writeSave();
  const extra = fixed.moved ? ` A few things by the east end of the concourse moved over a little to make room for the escalator.` : '';
  const m = UI.modal(UI.h('div', {}, UI.h('h2', {}, 'Your east wing went upstairs'),
    UI.h('p', { style: 'margin:0 0 10px;line-height:1.45' }, `The East Wing${s.expansions.garden ? ' and Garden Court are' : ' is'} now the Second Floor${s.expansions.garden ? ' and its Sky Garden' : ''}, up an escalator at the east end of the concourse. Everything you built out there came along. Tap ▲ on the left to look upstairs. Shoppers ride up on their own.${extra}${fixed.refund ? ` (${'$' + fixed.refund.toLocaleString()} refunded for what didn't fit.)` : ''}`),
    UI.h('div', { style: 'display:flex;justify-content:flex-end' }, UI.h('button', { class: 'btn primary', onclick: () => m.close() }, 'Let’s see it'))));
}
// v0.15: stockers are gone. Anyone who was one is a clerk now, at a register that needs one.
function retireStockers(s){
  for (const m of s.staff) if (m.role === 'stocker'){
    m.role = 'clerk'; m.look = staffLook('clerk', m.id);
    const free = stores(s).find(u => !C.STORES[u.store].attraction && !s.staff.some(o => o.storeId === u.id));
    m.storeId = free ? free.id : null;
  }
}
function continueGame(){
  retireStockers(S.save);
  rebuildMap(S.save); placeLeftovers(S.save);
  const fixed = clearEscalators(S.save), doors = fixDoors(S.save); if (fixed.moved || fixed.refund || doors.moved || doors.refund) writeSave();
  invalidate(); UI.resetMoneyDisplay();
  remodelNote(S.save); upstairsNote(S.save, fixed);
  if (S.save.phase === 'night') enterNight(null); else beginDay();
}

/* ---------- Day ---------- */
function beginDay(){
  const s = S.save;
  assignClerks(s);
  closeNightUi(); UI.hideCard(); UI.clearHint();
  const tutorial = !s.flags.tutorial;
  gusToday = tutorial || gusWantsToVisit() || (s.day > 1 && Math.random() < Math.min(0.7, 0.2 + 0.04 * stores(s).length));
  phase = 'day'; view.mode = 'day'; s.phase = 'day';
  startDay({ tutorial, gus: gusToday });
  if (sim.gus && !tutorial && s.flags.pending.length) sim.gus.chatIcon = true;
  resetTipBudget();
  view.cam.s = Math.max(view.cam.s, view.minS * 1.6);
  view.camTarget = { x: C.ENTRANCE.x + 1, y: C.MAP_H - 6 };
  UI.setHudMode('day');
  setMusicMode('day'); sfx('bell');
  if (tutorial) runDay1(() => {});
}
function dayTap(x, y){
  if (UI.dialogOpen) return;
  // Bubbles first: they float above heads, so tap targets sit there too.
  let best = null, bd = 0.5;
  for (const p of sim.people){
    if (p.kind === 'customer' && p.bubble && p.bubble.kind === 'want'){
      const d = Math.hypot(p.x - x, p.y - 1.55 - y); if (d < bd){ bd = d; best = { type: 'register', unitId: p.storeId }; }
    }
  }
  // Staff on their phones: tap the bubble to go have a word.
  if (!best) for (const p of sim.people){
    if (p.kind === 'staff' && p.slacking){ const d = Math.hypot(p.x - x, p.y - (p.look.costume ? 1.9 : 1.55) - y); if (d < bd){ bd = d; best = { type: 'nudge', staffId: p.id }; } }
    // Troublemakers: tap their bubble or the kid themself.
    if (p.kind === 'trouble' && (p.state === 'roam' || p.state === 'act')){ const d = Math.min(Math.hypot(p.x - x, p.y - 1.55 - y), Math.hypot(p.x - x, p.y - 0.6 - y)); if (d < bd + 0.2){ bd = d; best = { type: 'shoo', troubleId: p.id }; } }
  }
  // A restroom that needs mopping: its bubble, or the restroom itself.
  if (!best) for (const u of S.save.units){
    if (u.state !== 'restroom') continue;
    const b = restroomBubble(u);
    if (Math.hypot(b.x - x, b.y - y) < 0.55 || (x >= u.x && x < u.x + u.w && y >= u.y - 1 && y < u.y + u.h)) best = { type: 'restroom', unitId: u.id };
  }
  if (!best){
    let td = 0.62;
    for (const tr of sim.trash){ const d = Math.hypot(tr.x - x, tr.y - y); if (d < td){ td = d; best = { type: 'clean', trashId: tr.id }; } }
  }
  if (!best && sim.wishCoin && Math.hypot(C.FOUNTAIN.x + 1 - x, C.FOUNTAIN.y - 0.5 - y) < 0.6) best = { type: 'wish' };
  // Tap an escalator to hop to the floor at its other end.
  if (!best && rideEscalatorAt(x, y)) return;
  if (!best && sim.gus){
    const g = sim.gus;
    if (Math.hypot(g.x - x, g.y - 0.6 - y) < 0.6){
      g.say = GUS_LINES[Math.floor(Math.random() * GUS_LINES.length)];
      clearTimeout(g.sayT); g.sayT = setTimeout(() => { g.say = null; }, 3200);
      sfx('tap'); return;
    }
  }
  if (!best){
    // Queued customers and store fronts send you to that register.
    for (const p of sim.people) if (p.kind === 'customer' && p.state === 'queue' && Math.hypot(p.x - x, p.y - 0.6 - y) < 0.5){ best = { type: 'register', unitId: p.storeId }; break; }
  }
  if (!best){
    const id = occAt(Math.floor(x), Math.floor(y)) || occAt(Math.floor(x), Math.floor(y + 0.7));
    const u = id > 0 && S.save.units.find(v => v.id === id && v.state === 'store' && !C.STORES[v.store].attraction);
    if (u) best = { type: 'register', unitId: u.id };
  }
  if (!best) return;
  if (best.type === 'register' && sim.owner.atRegisterId === best.unitId && !sim.jobs.length){ UI.toast('You’re already at that register'); return; }
  const r = addJob(best);
  if (r === 'added'){ sfx('pop'); if (best.type === 'register' && S.save.day >= 2) tip('register'); }
  else if (r === 'removed') sfx('tap');
  else if (r === 'full'){ sfx('error'); UI.toast(`Your hands are full (${C.MAX_JOBS} jobs at a time)`); }
}
function handleEvents(){
  for (const e of sim.events){
    switch (e.type){
      case 'sale': sfx('coin'); break;
      case 'cleaned': sfx('sweep'); break;
      case 'binned': sfx('plop'); break;
      case 'walkout': sfx('walkout'); if (S.save.flags.tutorial) tip('walkout', null, true); break;
      case 'greyWish': if (S.save.day >= 2) tip('wish'); break;
      case 'trash': if (sim.trash.length >= 8) tip('litter'); break;
      case 'stockout': UI.toast(`${e.name} ran out of stock`); tip('stockout'); break;
      case 'slack': tip('slacker'); break;
      case 'nudged': sfx('pop'); break;
      case 'restroomDirty': case 'grossRestroom': tip('restroom'); break;
      case 'firstTrouble': sfx('error'); UI.toast('A troublemaker is causing a scene! Tap them to shoo them out.', 4200); break;
      case 'shooed': sfx('chime'); break;
      case 'wish': sfx('wish'); UI.toast(e.text, 3200); break;
      case 'toast': UI.toast(e.text); break;
      case 'closing': sfx('bell'); UI.toast('Closing time! Last customers are heading out.'); break;
    }
  }
  sim.events.length = 0;
}
async function endDay(){
  phase = 'report';
  UI.clearHint(); view.highlight = null;
  const firstDay = S.save.day === 1;
  const report = buildReport();
  S.save.phase = 'night';
  writeSave();
  setMusicMode('night');
  await UI.showReport(report, firstDay);
  enterNight(report, gusToday);
}
async function enterNight(report, gusVisited = false){
  phase = 'night'; view.mode = 'night'; assignClerks(S.save);
  sim.people = sim.people.filter(p => p.kind === 'owner'); sim.trash = []; sim.jobs = []; sim.fx = []; sim.phase = 'idle';
  if (sim.owner){ sim.owner.atRegisterId = null; sim.owner.walking = false; sim.owner.ride = null; sim.owner.rideZ = 0; sim.owner.x = C.ENTRANCE.x + 0.6; sim.owner.y = C.MAP_H - 3.5; }
  UI.setHudMode('night');
  setMusicMode('night');
  resetTipBudget();
  setNightIntro(true);
  const s = S.save;
  if (report && s.day === 1 && !s.flags.memories.night1){
    s.flags.memories.night1 = true; writeSave();
    await UI.say(MEMORIES.night1.lines);
    UI.toast(MEMORIES.night1.reward, 3500);
    UI.setToolDot('notebook', true);
  } else if (report){
    const reward = await maybeMemory(gusVisited);
    if (typeof reward === 'string' && reward) UI.toast(reward, 3800);
  }
  if (report && s.day === 1) await runClerkScene();
  if (report && s.day === 2) await runStoreScene();
  if (s.level >= 3) await runDeeScene();
  await runTroubleScene();
  await runExpandScene();
  setNightIntro(false);
  nightTips(report);
}
function openDoors(){
  if (placing()){ UI.toast('Finish or cancel what you’re placing first'); return; }
  if (UI.dialogOpen) return;
  if (deeSceneRunning()){ UI.toast('Gus is still talking. Finish up with him first'); return; }
  const s = S.save;
  s.day++; s.flags.tipsToday = 0; s.phase = 'day';
  writeSave();
  beginDay();
}

/* ---------- Menus ---------- */
let pauseOpen = false;
function pauseMenu(){
  if (pauseOpen) return;
  pauseOpen = true;
  sim.paused = true;
  // Reset save lives in Settings now, out of the way.
  const s = S.save;
  const m = UI.modal(UI.h('div', {}, UI.h('h2', {}, 'Paused'),
    UI.h('p', { style: 'margin:0 0 4px;font:600 15px var(--display)' }, `${s.player.mall} · Day ${s.day} · Level ${s.level}`),
    UI.h('p', { class: 'muted', style: 'margin:0 0 10px' }, 'Your mall saves every night. If you close the app mid-day, today starts over.'),
    UI.h('div', { style: 'display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap' },
      UI.h('button', { class: 'btn', onclick: () => { close(); settings(true, pauseMenu); } }, 'Settings'),
      UI.h('button', { class: 'btn primary', onclick: () => { close(); sim.paused = false; } }, 'Resume'))), { onBackdrop: () => { close(); sim.paused = false; } });
  const close = () => { m.close(); pauseOpen = false; };
}
function settings(inGame, onClose){
  UI.showSettings({ inGame, onClose, onChange: () => { writeSettings(); applySettings(); }, onRestart: () => { clearSave(); location.reload(); } });
}

// Floors above and below that want attention: a shopper about to give up, a troublemaker or a filthy restroom.
function floorsNeedingYou(){
  const need = new Set();
  for (const p of sim.people){
    if ((p.kind === 'customer' && p.state === 'queue' && p.patience / p.patienceMax < 0.35) || (p.kind === 'trouble' && (p.state === 'roam' || p.state === 'act'))) need.add(floorOf(p.x));
  }
  for (const u of S.save.units) if (u.state === 'restroom' && (sim.rooms.get(u.id) || {}).dirt >= 70) need.add(floorOf(u.x));
  return [[...need].some(f => f > view.floor), [...need].some(f => f < view.floor)];
}

// The escalator under (x, y), if any: switch to the floor at its other end and look at where it comes out.
export function rideEscalatorAt(x, y){
  const e = map.esc.find(q => x >= q.x && x < q.x + q.w && y >= q.y - 1.2 && y < q.y + q.h + 0.2);
  if (!e) return false;
  const to = map.esc.find(q => q.id === e.to);
  if (!to) return false;
  setFloor(to.floor); view.cam.x = to.land.x + 0.5; view.cam.y = to.land.y; view.camTarget = { x: to.land.x + 0.5, y: to.land.y };
  clampCam(); sfx('tap');
  UI.toast(['Ground floor', 'Second floor', 'Casino floor'][to.floor] || `Floor ${to.floor + 1}`, 1200);
  return true;
}
/* ---------- Frame loop ---------- */
let last = performance.now(), hudT = 0;
const perf = { step: 0, render: 0 };   // smoothed ms per frame, for playtests
const t0 = performance.now();
function frame(now){
  // Battery saver: every other frame on a 60 Hz screen (about 30 a second).
  if (S.settings.saver && now - last < 30){ requestAnimationFrame(frame); return; }
  // A long gap between frames means the app was frozen in the background: come back paused.
  if (now - last > 1500 && phase === 'day' && !sim.paused) pauseMenu();
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const t = (now - t0) / 1000;
  const p0 = performance.now();
  if (phase === 'day'){
    step(dt);
    pumpWaiters();
    handleEvents();
    const busy = sim.people.filter(p => p.kind === 'customer' && p.state === 'queue').length >= 3;
    updateTips(busy || sim.clockFrozen);
    if (sim.phase === 'done') endDay();
  } else {
    pumpWaiters();
    if (phase === 'night'){ stepGus(dt); updateTips(UI.panelOpen() || placing() || deeSceneRunning()); }
  }
  if (view.camTarget){
    const c = view.cam, T = view.camTarget, k = Math.min(1, dt * 4);
    // Heading for something on the other floor: switch floors and cut straight there.
    if (floorOf(T.x) !== view.floor && floorOf(T.x) <= topFloor()){ setFloor(floorOf(T.x)); c.x = T.x; }
    const px = c.x, py = c.y, ps = c.s;
    c.x += (T.x - c.x) * k; c.y += (T.y - c.y) * k;
    if (T.s) c.s += (T.s - c.s) * k;
    clampCam();
    // Done once it has (nearly) stopped moving, including when the edge of the map holds it back.
    if (Math.abs(c.x - px) + Math.abs(c.y - py) + Math.abs(c.s - ps) / 40 < 0.003) view.camTarget = null;
  }
  const p1 = performance.now();
  if (!view.covered) render(t);
  const p2 = performance.now();
  perf.step = perf.step * 0.95 + (p1 - p0) * 0.05; perf.render = perf.render * 0.95 + (p2 - p1) * 0.05;
  if ((hudT -= dt) <= 0 || phase === 'day'){ hudT = 0.1; if (phase === 'day' || phase === 'night' || phase === 'report'){ UI.updateHud(phase !== 'day'); UI.updateFloorBtn(phase !== 'report' ? topFloor() : 0, view.floor, phase === 'day' ? floorsNeedingYou() : undefined); } }
  requestAnimationFrame(frame);
}
document.fonts && document.fonts.ready ? document.fonts.ready.then(() => { invalidate(); boot(); requestAnimationFrame(frame); }) : (boot(), requestAnimationFrame(frame));
// Debug hooks for automated playtests.
window.__mall = { S, sim, view, perf, ride: rideEscalatorAt, phase: () => phase, toScreen: (x, y) => { const r = canvas.getBoundingClientRect(); return { x: (x - view.cam.x) * view.cam.s + view.W / 2 + r.left, y: (y - view.cam.y) * view.cam.s + view.H / 2 + r.top }; } };
