// Gus's Day 1 walkthrough, the notebook tip queue, and his memories.
import * as C from './config.js';
import { S, writeSave } from './state.js';
import { sim, spawnTutorialCustomer, releaseTutorial, addTrash, spotsFor, spawnGus } from './sim.js';
import { say, hint, clearHint, showTip, tipVisible, dialogOpen } from './ui.js';
import { view } from './render.js';
import { DAY1, MEMORIES, DEE_SCENE } from './story.js';

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
export function resetTipBudget(){ shownThisPhase = 0; }
export function tip(key, showMe = null){
  const f = S.save.flags;
  if (!S.settings.tips || !f.memories.night1 || f.tips[key] || queue.some(q => q.key === key)) return;
  queue.push({ key, showMe });
}
export function updateTips(busy){
  if (!queue.length || tipVisible() || dialogOpen || busy || shownThisPhase >= 2) return;
  const next = queue.shift();
  S.save.flags.tips[next.key] = true; shownThisPhase++;
  writeSave();
  showTip(next.key, next.showMe);
}
export function seenTips(){ return Object.keys(S.save.flags.tips); }

/* ---------- Day 1 ---------- */
export async function runDay1(onDone){
  const g = sim.gus;
  g.x = C.ENTRANCE.x + 2.3; g.y = C.MAP_H - 3.2; g.state = 'stand';
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
  const spot = { x: kiosk.x + 2.6, y: kiosk.y + 1.55 };
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
export const deeSceneRunning = () => deeRunning;
