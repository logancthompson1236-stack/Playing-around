// Gus's Day 1 walkthrough, the notebook tip queue, and his memories.
import * as C from './config.js';
import { S, writeSave } from './state.js';
import { sim, spawnTutorialCustomer, releaseTutorial, addTrash, spotsFor, spawnGus } from './sim.js';
import { litterSpot } from './map.js';
import { say, hint, clearHint, showTip, tipVisible, dialogOpen, hideTipFor } from './ui.js';
import { view } from './render.js';
import { DAY1, MEMORIES, DEE_SCENE, EXPAND_SCENES, CLERK_SCENE, STORE_SCENE, TROUBLE_SCENE } from './story.js';

/* ---------- Waiting on game state from async scripts ---------- */
const waiters = [];
export function until(cond){ return new Promise(res => waiters.push({ cond, res })); }
export function pumpWaiters(){
  for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].cond()){ const w = waiters[i]; waiters.splice(i, 1); w.res(); }
}
const wait = secs => { const end = performance.now() + secs * 1000; return until(() => performance.now() >= end); };

/* ---------- Tips ---------- */
const queue = [];
let shownThisPhase = 0;
// Tips can go stale while they wait (e.g. you already opened the store). Each is re-checked right before it shows.
const STILL = {
  open: s => !s.flags.opened && s.units.filter(u => u.state === 'store').length <= 2,
  newshell: s => !s.units.some(u => u.state === 'vacant' || u.state === 'derelict'),
  fountain: s => !s.fountain,
  staff: s => s.staff.length === 0,
  clerks: s => !s.staff.some(m => m.role === 'clerk'),
  litter: s => !s.decor.some(d => d.type === 'bin'),
  speed: s => s.staff.length > 0,
  style: s => s.style.walls.length + s.style.floors.length <= 2,
};
// New day or new night: drop anything still waiting from the other half.
export function resetTipBudget(){ shownThisPhase = 0; queue.length = 0; }
export function tip(key, showMe = null, now = false){
  const f = S.save.flags;
  if (!S.settings.tips || !f.memories.night1 || f.tips[key] || queue.some(q => q.key === key)) return;
  if (now) queue.unshift({ key, showMe, now }); else queue.push({ key, showMe });
}
export function updateTips(busy){
  while (queue.length && STILL[queue[0].key] && !STILL[queue[0].key](S.save)) queue.shift();
  if (!queue.length || tipVisible() || dialogOpen || busy || (shownThisPhase >= 2 && !queue[0].now)) return;
  const next = queue.shift();
  S.save.flags.tips[next.key] = true; shownThisPhase++;
  writeSave();
  showTip(next.key, next.showMe);
}
export function seenTips(){ return Object.keys(S.save.flags.tips); }

/* ---------- Day 1 ---------- */
export async function runDay1(onDone){
  const g = sim.gus;
  // Off to the side of the entrance hall, out of the way of shoppers heading in.
  g.x = C.ENTRANCE.x - 0.62; g.y = C.MAP_H - 3.2; g.state = 'stand';
  await wait(0.6);
  await say(DAY1.open);
  const kiosk = S.save.units.find(u => u.kiosk);
  const c = spawnTutorialCustomer(kiosk.store);
  sim.clockFrozen = true;
  await until(() => c.state === 'queue' && Math.hypot(c.x - spotsFor(kiosk).queue[0].x, c.y - spotsFor(kiosk).queue[0].y) < 0.3);
  hint(DAY1.serve);
  const q = () => ({ x: c.x, y: c.y - 1.55 });
  view.highlight = q(); const hl = setInterval(() => { if (view.highlight) view.highlight = q(); }, 50);
  await until(() => sim.jobs.length > 0 || sim.owner.atRegisterId === kiosk.id);
  view.highlight = null; clearInterval(hl);
  await until(() => sim.stats.served > 0 || c.state !== 'queue');
  hint(DAY1.served);
  await wait(1.6);
  const spot = litterSpot(kiosk.x + 2.5, kiosk.y + 0.5) || { x: kiosk.x + 2.5, y: kiosk.y + 0.5 };
  const tr = addTrash(spot.x, spot.y, 'wrapper');
  hint(DAY1.trash);
  view.highlight = { x: spot.x, y: spot.y };
  await until(() => !sim.trash.includes(tr));
  view.highlight = null;
  clearHint();
  await wait(0.5);
  await say(DAY1.done);
  g.state = 'leave';
  S.save.flags.tutorial = 1;
  releaseTutorial();
  onDone && onDone();
}

/* ---------- Memories ---------- */
export function addMemory(key){
  const f = S.save.flags;
  if (f.memories[key] || f.pending.includes(key)) return;
  f.pending.push(key);
}
export async function maybeMemory(gusVisited){
  const f = S.save.flags;
  f.pending = f.pending.filter(k => k !== 'dee');   // Dee has her own scene now (older saves queued it as a memory)
  if (!gusVisited || !f.pending.length) return false;
  const key = f.pending.shift(), m = MEMORIES[key];
  f.memories[key] = true;
  writeSave();
  await say(m.lines);
  return m.reward || true;
}
export const gusWantsToVisit = () => S.save.flags.pending.some(k => k !== 'dee');

/* ---------- Hiring help: Gus brings up Dee the first night you can hire ---------- */
let deeRunning = false;
const staffPanel = () => document.querySelector('.panel[aria-label="Staff"]');
export async function runDeeScene(){
  const f = S.save.flags;
  if (deeRunning || f.memories.dee || f.hiredDee || S.save.level < 3) return;
  deeRunning = true;
  const g = spawnGus('night');
  g.x = C.ENTRANCE.x + 1.4; g.y = C.MAP_H + 1.3;
  g.state = 'walkTo'; g.goal = { x: C.ENTRANCE.x + 1.6, y: C.MAP_H - 3.4 };
  view.camTarget = { x: g.goal.x, y: g.goal.y - 1.5 };
  await until(() => g.state === 'stand');
  await say(MEMORIES.dee.lines);
  f.memories.dee = true; f.tips.staff = true; writeSave();
  const staffBtn = document.querySelector('.night-bar .tool:nth-child(2)');
  hint(DEE_SCENE.staff, true);
  staffBtn && staffBtn.classList.add('pulse');
  await until(() => staffPanel());
  staffBtn && staffBtn.classList.remove('pulse');
  hint(DEE_SCENE.hire, true);
  await until(() => { const btn = document.querySelector('[data-dee]'); if (btn) btn.classList.add('pulse'); return f.hiredDee || !staffPanel(); });
  clearHint();
  await wait(0.3);
  await say(f.hiredDee ? DEE_SCENE.hired : DEE_SCENE.skipped);
  g.state = 'leave';
  deeRunning = false;
}
// While the night opens (Gus's story, scenes), tips wait so they never pop up over his lines.
let nightIntro = false;
export function setNightIntro(on){ nightIntro = on; hideTipFor(on); }
export const deeSceneRunning = () => deeRunning || expandRunning || sceneRunning || nightIntro;

/* ---------- Early nights and level 10: short Gus scenes ---------- */
let sceneRunning = false;
// Gus walks in from the parking lot, says his piece, does whatever the scene needs, and heads out.
async function gusScene(lines, during){
  sceneRunning = true;
  const g = spawnGus('night');
  g.x = C.ENTRANCE.x + 1.4; g.y = C.MAP_H + 1.3;
  g.state = 'walkTo'; g.goal = { x: C.ENTRANCE.x + 1.6, y: C.MAP_H - 3.4 };
  view.camTarget = { x: g.goal.x, y: g.goal.y - 1.5 };
  await until(() => g.state === 'stand');
  await say(lines);
  if (during) await during();
  g.state = 'leave';
  sceneRunning = false;
}
const clerks = () => S.save.staff.filter(m => m.role === 'clerk').length;
// Night 1: hire the first two clerks.
export async function runClerkScene(){
  const s = S.save, f = s.flags;
  if (sceneRunning || f.memories.clerks || s.day > 2 || clerks() >= 2) return;
  f.memories.clerks = true; f.tips.clerks = true; writeSave();
  await gusScene(CLERK_SCENE.lines, async () => {
    const staffBtn = document.querySelector('.night-bar .tool:nth-child(2)');
    hint(CLERK_SCENE.staff, true); staffBtn && staffBtn.classList.add('pulse');
    await until(() => staffPanel());
    staffBtn && staffBtn.classList.remove('pulse');
    hint(CLERK_SCENE.hire, true);
    await until(() => clerks() >= 2 || !staffPanel());
    clearHint();
    await wait(0.3);
    await say(clerks() ? CLERK_SCENE.hired : CLERK_SCENE.skipped);
  });
}
// Night 2: open another store.
export async function runStoreScene(){
  const s = S.save, f = s.flags;
  if (sceneRunning || f.memories.store2 || s.day !== 2 || s.units.filter(u => u.state === 'store').length > 2) return;
  f.memories.store2 = true; writeSave();
  await gusScene(STORE_SCENE);
  const buildBtn = document.querySelector('.night-bar .tool:nth-child(1)');
  buildBtn && buildBtn.classList.add('pulse');
  until(() => document.querySelector('.panel[aria-label="Build"]') || S.save.phase !== 'night').then(() => buildBtn && buildBtn.classList.remove('pulse'));
}
// The first night after troublemakers show up: Gus brings up security.
export async function runTroubleScene(){
  const s = S.save, f = s.flags;
  if (sceneRunning || f.memories.trouble || !f.sawTrouble) return;
  f.memories.trouble = true; f.tips.trouble = true; writeSave();
  await gusScene(TROUBLE_SCENE);
  const staffBtn = document.querySelector('.night-bar .tool:nth-child(2)');
  staffBtn && staffBtn.classList.add('pulse');
  until(() => staffPanel() || S.save.phase !== 'night').then(() => staffBtn && staffBtn.classList.remove('pulse'));
}

/* ---------- Expansions: Gus brings each one up the first night you can afford it ---------- */
let expandRunning = false;
export function expansionToSuggest(){
  const s = S.save;
  return C.EXPANSIONS.find((e, i) => !s.expansions[e.id] && (i === 0 || s.expansions[C.EXPANSIONS[i - 1].id]) && s.level >= e.level && s.money >= e.cost && !s.flags.memories['wing_' + e.id]);
}
export async function runExpandScene(){
  const e = expansionToSuggest();
  if (!e || expandRunning || deeRunning) return;
  expandRunning = true;
  const f = S.save.flags, g = spawnGus('night');
  g.x = C.ENTRANCE.x + 1.4; g.y = C.MAP_H + 1.3;
  g.state = 'walkTo'; g.goal = { x: C.ENTRANCE.x + 1.6, y: C.MAP_H - 3.4 };
  view.camTarget = { x: g.goal.x, y: g.goal.y - 1.5 };
  await until(() => g.state === 'stand');
  await say(EXPAND_SCENES[e.id]);
  f.memories['wing_' + e.id] = true; writeSave();
  const buildBtn = document.querySelector('.night-bar .tool:nth-child(1)');
  buildBtn && buildBtn.classList.add('pulse');
  g.state = 'leave';
  expandRunning = false;
  until(() => document.querySelector('.panel[aria-label="Build"]') || S.save.phase !== 'night').then(() => buildBtn && buildBtn.classList.remove('pulse'));
}
