// Boot and game flow: title → intro → Day 1 with Gus → (report → night → next day) forever.
import * as C from './config.js';
import { S, newSave, loadSave, writeSave, clearSave, hasSave, loadSettings, writeSettings, stores } from './state.js';
import { rebuildMap, occAt, FOUNTAIN_ID } from './map.js';
import { sim, step, startDay, buildReport, addJob, GUS_LINES, stepGus } from './sim.js';
import { initRender, resize, render, view, invalidate, clampCam } from './render.js';
import { initInput } from './input.js';
import { unlockAudio, sfx, setMusicMode, applySettings } from './audio.js';
import * as UI from './ui.js';
import { runDay1, pumpWaiters, tip, updateTips, resetTipBudget, maybeMemory, gusWantsToVisit, runDeeScene, deeSceneRunning } from './guide.js';
import { nightTap, openBuild, openStaff, openNotebook, placing, grabGhost, dragGhost, nightTips, closeNightUi, setLevelUpHandler } from './night.js';
import { MEET_GUS, MEMORIES } from './story.js';

const canvas = document.getElementById('world');
let phase = 'title';           // title | intro | day | report | night
let gusToday = false;

loadSettings();
initRender(canvas);
window.addEventListener('resize', () => { resize(); });
document.addEventListener('pointerdown', () => unlockAudio(), { capture: true });

UI.buildHud({
  speed: () => { sim.speed = sim.speed > 1 ? 1 : 2; },
  pause: () => pauseMenu(),
  build: () => openBuild(),
  staff: () => openStaff(),
  notebook: () => openNotebook(),
  settings: () => settings(true),
  open: () => openDoors(),
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

/* ---------- Title ---------- */
function boot(){
  const saved = loadSave();
  S.save = saved || newSave({ name: 'Boss', mall: 'Sunnyside Mall', look: { skin: '#f2c7a5', hair: '#6b3e26', hairStyle: 'short', shirt: '#f4b942', pants: '#4a5a8a' } });
  rebuildMap(S.save); invalidate();
  view.mode = 'night'; phase = 'title';
  view.cam.x = 13; view.cam.y = 8; view.cam.s = view.minS * 1.15; clampCam();
  UI.setHudMode('none');
  UI.showTitle({ hasSave: !!saved, onContinue: continueGame, onNew: newGame, onSettings: () => settings(false) });
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
function continueGame(){
  rebuildMap(S.save); invalidate(); UI.resetMoneyDisplay();
  if (S.save.phase === 'night') enterNight(null); else beginDay();
}

/* ---------- Day ---------- */
function beginDay(){
  const s = S.save;
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
  if (!best){
    let td = 0.62;
    for (const tr of sim.trash){ const d = Math.hypot(tr.x - x, tr.y - y); if (d < td){ td = d; best = { type: 'clean', trashId: tr.id }; } }
  }
  if (!best && sim.wishCoin && Math.hypot(C.FOUNTAIN.x + 1 - x, C.FOUNTAIN.y - 0.5 - y) < 0.6) best = { type: 'wish' };
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
    const u = id > 0 && S.save.units.find(v => v.id === id && v.state === 'store');
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
      case 'walkout': sfx('walkout'); if (S.save.flags.tutorial) tip('walkout'); break;
      case 'greyWish': if (S.save.day >= 2) tip('wish'); break;
      case 'trash': if (sim.trash.length >= 8) tip('litter'); break;
      case 'stockout': UI.toast(`${e.name} ran out of stock`); tip('stockout'); break;
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
  phase = 'night'; view.mode = 'night';
  sim.people = sim.people.filter(p => p.kind === 'owner'); sim.trash = []; sim.jobs = []; sim.fx = []; sim.phase = 'idle';
  if (sim.owner){ sim.owner.atRegisterId = null; sim.owner.walking = false; sim.owner.x = C.ENTRANCE.x + 0.6; sim.owner.y = C.MAP_H - 3.5; }
  UI.setHudMode('night');
  setMusicMode('night');
  resetTipBudget();
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
  if (s.level >= 3) await runDeeScene();
  nightTips(report);
}
function openDoors(){
  if (placing() || UI.dialogOpen || deeSceneRunning()) return;
  const s = S.save;
  s.day++; s.flags.tipsToday = 0; s.phase = 'day';
  writeSave();
  beginDay();
}

/* ---------- Menus ---------- */
function pauseMenu(){
  sim.paused = true;
  const m = UI.modal(UI.h('div', {}, UI.h('h2', {}, 'Paused'),
    UI.h('p', { class: 'muted', style: 'margin:0 0 10px' }, 'Your mall saves every night. If you close the app mid-day, today starts over.'),
    UI.h('div', { style: 'display:flex;gap:8px;justify-content:flex-end' },
      UI.h('button', { class: 'btn danger', onclick: async () => { m.close(); if (await UI.confirmResetSave()){ clearSave(); location.reload(); } else pauseMenu(); } }, 'Reset save'),
      UI.h('button', { class: 'btn', onclick: () => { m.close(); settings(true, pauseMenu); } }, 'Settings'),
      UI.h('button', { class: 'btn primary', onclick: () => { m.close(); sim.paused = false; } }, 'Resume'))), { onBackdrop: () => { m.close(); sim.paused = false; } });
}
function settings(inGame, onClose){
  UI.showSettings({ inGame, onClose, onChange: () => { writeSettings(); applySettings(); }, onRestart: () => { clearSave(); location.reload(); } });
}

/* ---------- Frame loop ---------- */
let last = performance.now(), hudT = 0;
const t0 = performance.now();
function frame(now){
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const t = (now - t0) / 1000;
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
    const c = view.cam, k = Math.min(1, dt * 4);
    c.x += (view.camTarget.x - c.x) * k; c.y += (view.camTarget.y - c.y) * k;
    if (Math.hypot(view.camTarget.x - c.x, view.camTarget.y - c.y) < 0.05) view.camTarget = null;
    clampCam();
  }
  render(t);
  if ((hudT -= dt) <= 0 || phase === 'day'){ hudT = 0.1; if (phase === 'day' || phase === 'night' || phase === 'report') UI.updateHud(phase !== 'day'); }
  requestAnimationFrame(frame);
}
document.fonts && document.fonts.ready ? document.fonts.ready.then(() => { invalidate(); boot(); requestAnimationFrame(frame); }) : (boot(), requestAnimationFrame(frame));
// Debug hooks for automated playtests.
window.__mall = { S, sim, view, phase: () => phase, toScreen: (x, y) => { const r = canvas.getBoundingClientRect(); return { x: (x - view.cam.x) * view.cam.s + view.W / 2 + r.left, y: (y - view.cam.y) * view.cam.s + view.H / 2 + r.top }; } };
