// Animation preview: draws people walking, eating and using decor with the game's own painters, frame by frame or
// live, so animation changes can be checked without playing to the right moment. Built by tools/anim-preview.mjs.
import * as A from '../src/art.js';
import * as A2 from '../src/art2.js';
import * as A4 from '../src/art4.js';
import * as C from '../src/config.js';
import { drawPersonAt, drawPlayKid, playKidY, drawEatArms } from '../src/render.js';
import { PIT, playLength } from '../src/play.js';

const SHOPPER = { skin: '#f1c7a5', hair: '#6b3e26', hairStyle: 'long', pants: '#33415c', shirt: '#f4a261' };
const TEEN = { skin: '#c68e6a', hair: '#2b2230', hairStyle: 'short', pants: '#2b2d42', shirt: '#118ab2', hood: false };
const WALKER = { skin: '#e8b894', hair: '#d8d8d8', hairStyle: 'visor', acc: '#ffffff', pants: '#6d597a', shirt: '#06a77d', shoe: '#fff', glasses: true };
const FAMILY = { skin: '#f1c7a5', hair: '#d9733f', hairStyle: 'bun', pants: '#5a8dee', shirt: '#5cb85c', kid: { skin: '#f1c7a5', hair: '#d9733f', hairStyle: 'short', shirt: '#ffd23f', pants: '#ef476f' } };
const OWNER = { skin: '#e0ac8a', hair: '#2b2230', hairStyle: 'short', pants: '#3d405b', shirt: '#ef476f' };
const person = (look, extra = {}) => ({ id: 3, kind: 'customer', type: 'browser', look, x: 0, y: 0, t: 0, walking: false, flip: false, state: 'idle', mood: 0.6, ...extra });

// A walker heading (hx, hy) at `speed` tiles a second; the camera follows them over the floor tiles.
function walker(look, speed, hx, hy, extra){
  const p = person(look, { speed, ...extra });
  return { cam: [0, -0.55], span: 2.1, cycle: 0.85 / speed * 2, draw(t){
    Object.assign(p, { t: t + 1.3, walking: true, flip: hx < 0, x: hx * speed * t, y: hy * speed * t });
    A.g.save(); A.g.translate(-p.x, -p.y);
    const fx = Math.floor(p.x), fy = Math.floor(p.y); floorPatch(fx - 2, fy - 2, 5, 4);
    drawPersonAt(p, t); A.g.restore();
  } };
}
// Things with a base row, drawn back to front like the mall does.
function sorted(items){ items.sort((a, b) => a[0] - b[0]); for (const [, f] of items) f(); }
function floorPatch(x, y, w, h){ for (let i = 0; i < w; i++) for (let j = 0; j < h; j++){ A.g.fillStyle = ((x + i + y + j) % 2 + 2) % 2 ? '#efe6f5' : '#e6dcef'; A.g.fillRect(x + i, y + j, 1, 1); } }

const court = { type: 'foodcourt', x: 0, y: 0, id: 4 };
function eater(food, seat, kid){
  const p = person(kid ? FAMILY : SHOPPER, { id: 5 + seat, state: 'court', holding: food, court: { d: court, seat, kidSeat: kid ? seat + 1 : undefined } });
  const s = A4.courtSpots(court).seats[seat]; p.x = s.x; p.y = s.y; p.flip = s.flip;
  return p;
}
function vendingScene(rot){
  const d = { type: 'vending', x: 0, y: 0, rot, id: 9 }, secs = C.DECOR.vending.coin.secs, p = person(TEEN, { state: 'useMachine', machine: d });
  // Where the sim parks a shopper at the machine (sim.js, the coin-op picker).
  const a = rot === 0 ? { x: 0, y: 1 } : rot === 1 ? { x: -1, y: 0 } : { x: 1, y: 0 };
  const side = rot === 0 ? 0.36 : 0, close = rot % 2 ? (rot === 1 ? 0.25 : -0.25) : 0;
  p.x = a.x + 0.5 + side + close; p.y = a.y + 0.5 + side * 0.5; p.flip = d.x + 0.5 < p.x;
  const cycle = secs + 0.8;
  return { cam: [rot === 0 ? 0.6 : 0.5 + (rot === 1 ? -0.4 : 0.4), 0.35], span: 2.6, cycle, draw(t){
    floorPatch(-2, -1, 5, 3);
    const k = t % cycle, busy = k < secs;
    p.t = t + 1; p.state = busy ? 'useMachine' : 'idle'; p.timer = secs - k; p.holding = busy ? null : 'can';
    if (busy) A.decorState.set(d, { k: Math.min(1, Math.max(0, 1 - p.timer / secs)), win: false, seed: 0.3 }); else A.decorState.delete(d);
    p.holdT = busy ? 0 : k - secs; p.boughtCan = true;
    sorted([[d.y + 0.8, () => A.decor(d, t)], [p.y, () => drawPersonAt(p, t)]]);
  } };
}
function gumballScene(look){
  const d = { type: 'gumball', x: 0, y: 0, rot: 0, id: 8 }, secs = C.DECOR.gumball.coin.secs, p = person(look, { state: 'useMachine', machine: d, x: 0.5, y: 1.5 }), cycle = secs + 0.6;
  return { cam: [0.4, 0.6], span: 2.3, cycle, draw(t){
    floorPatch(-2, -1, 5, 3);
    const k = t % cycle, busy = k < secs;
    p.t = t + 1; p.state = busy ? 'useMachine' : 'idle'; p.timer = secs - k; p.holding = busy ? null : 'gum';
    if (busy) A.decorState.set(d, { k: Math.min(1, Math.max(0, 1 - p.timer / secs)) }); else A.decorState.delete(d);
    sorted([[d.y + 0.8, () => A.decor(d, t)], [p.y, () => drawPersonAt(p, t)]]);
  } };
}
function playScene(slot){
  const d = { type: 'playarea', x: 0, y: 0, id: 6, rot: 0 }, p = person(FAMILY, { id: 11 + slot, state: 'playing', x: 1.3 + slot * 0.9, y: 2.45, faceBack: true });
  p.play = { d, slot, from: [p.x - 0.38, p.y + 0.12], secs: 9 };
  const len = playLength(p);
  return { cam: [1.5, 0.75], span: 3.6, cycle: len, draw(t){
    floorPatch(-1, -1, 5, 4);
    p.t = t; p.playEl = t % len;
    sorted([[d.y + 0.2, () => A2.playArea(d, t)], [d.y + PIT.y + PIT.ry, () => A2.playFront(d, 'pit')], [d.y + 0.9, () => A2.playFront(d, 'slide')], [d.y + 1.9, () => A2.playFront(d, 'rail')],
      [p.y, () => drawPersonAt(p, t)], [playKidY(p), () => drawPlayKid(p)]]);
  } };
}
// The carousel going round with a kid riding (k runs 0 to 1 over the ride).
function carouselScene(){
  const d = { type: 'carousel', x: 0, y: 0, id: 12, rot: 0 }, cycle = 8;
  return { cam: [1.5, 0.6], span: 4.2, cycle, draw(t){
    floorPatch(-1, -1, 5, 5);
    const k = (t % cycle) / cycle;
    A4.carousel(d, t, { k, rider: FAMILY.kid }, A.person);
  } };
}
const SCENES = {
  'walk-side': walker(SHOPPER, 1.3, 1, 0),
  'walk-down': walker(TEEN, 1.6, 0, 1),
  'walk-up': walker(WALKER, 1.2, 0, -1),
  'walk-diag': walker(SHOPPER, 1.3, -0.7, 0.7),
  'owner-run': walker(OWNER, C.OWNER_SPEED, 1, 0, { kind: 'owner' }),
  'family-walk': walker(FAMILY, 1.1, 1, 0),
  'eat-court': { cam: [0.85, 1.15], span: 2.5, cycle: 2.4, draw(t){
    const ps = [eater('noodles', 0), eater('burger', 1), eater('pizza', 2, true), eater('sushi', 5)];
    for (const p of ps) p.t = t + p.id;
    const plates = new Map(); for (const p of ps){ plates.set(p.court.seat, p.holding); if (p.court.kidSeat !== undefined) plates.set(p.court.kidSeat, p.holding); }
    const pl = []; for (const [s, f] of plates) pl[s] = f;
    const items = [[court.y + 0.05, () => A4.foodCourt(court, 'base', 0, t)], [court.y + 2.92, () => A4.foodCourt(court, 'front', 0, t)]];
    A4.courtSpots(court).tables.forEach((tb, i) => { items.push([tb.y, () => A4.foodCourt(court, 'stools', i, t)], [tb.y + 0.12, () => A4.foodCourt(court, 'table', i, t, pl)]); });
    for (const p of ps) items.push([p.y, () => drawPersonAt(p, t)], [p.y + 0.06, () => drawEatArms(p)]);
    sorted(items);
  } },
  'vending-front': vendingScene(0),
  'vending-side': vendingScene(1),
  'gumball-teen': gumballScene(TEEN),
  'gumball-kid': gumballScene(FAMILY),
  'play-slide': playScene(0),
  'play-pit': playScene(1),
  'carousel': carouselScene(),
};

function paint(g, name, t, w, h){
  const sc = SCENES[name], ppt = Math.min(w, h) / sc.span;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#f4ecf7'; g.fillRect(0, 0, w, h);
  A.setTarget(g, ppt);
  g.setTransform(ppt, 0, 0, ppt, w / 2 - sc.cam[0] * ppt, h / 2 - sc.cam[1] * ppt);
  sc.draw(t);
}
// A strip of frames: one scene at each of `times`, side by side. Returns a PNG data URL.
window.sheet = (name, times, w = 220, h = 260) => {
  const c = document.createElement('canvas'); c.width = w * times.length; c.height = h;
  const g = c.getContext('2d'), cell = document.createElement('canvas'); cell.width = w; cell.height = h;
  times.forEach((t, i) => { paint(cell.getContext('2d'), name, t, w, h); g.drawImage(cell, i * w, 0); g.fillStyle = 'rgba(61,43,53,.55)'; g.font = '600 12px sans-serif'; g.fillText(t.toFixed(2) + 's', i * w + 6, 16); });
  return c.toDataURL('image/png');
};
window.scenes = SCENES;
window.cycleOf = name => SCENES[name].cycle || 2;
// Plays a scene on a canvas until stopped.
window.live = (canvas, name, speed = 1) => {
  let on = true; const t0 = performance.now(), g = canvas.getContext('2d');
  const f = () => { if (!on) return; paint(g, name, (performance.now() - t0) / 1000 * speed, canvas.width, canvas.height); requestAnimationFrame(f); };
  f(); return () => { on = false; };
};
