// The kids play area's layout and the kids' routines in it, shared by the sim (how long a visit lasts) and the art.
// Everything is in tiles from the play area's top-left corner; z is height off the floor.

export const PIT = { x: 2.3, y: 0.62, rx: 0.6, ry: 0.38 };         // ball pit, back right
export const TOWER = { x: 0.3, y: 0.42, w: 0.62, d: 0.46, h: 0.82 }; // slide platform, back left
export const LADDER_X = 0.5;
const SLIDE_A = [0.92, 0.66], SLIDE_B = [1.62, 1.42];               // top of the chute, and its mouth
const GATE_Y = 1.88;                                                  // the gap in the front rail
const RUN = 1.7, CLIMB = 0.8, SLIDE = 1.05;

// The chute, k from 0 (top) to 1 (mouth): steep at the top, a flat lip at the end.
export function slidePath(d, k){
  const z = TOWER.h * Math.max(0, 1 - k / 0.86) ** 1.6;
  return { x: d.x + SLIDE_A[0] + (SLIDE_B[0] - SLIDE_A[0]) * k, y: d.y + SLIDE_A[1] + (SLIDE_B[1] - SLIDE_A[1]) * k, z };
}
// Where in the pit each pit kid plays.
export const pitSpot = slot => slot === 1 ? [2.02, 0.72] : [2.56, 0.56];

// The visit as a list of legs: walk in from the grown-up, play, and walk back out.
// Slide kids loop ladder → slide → run around, and always finish at the slide's mouth before walking off.
function legs(slot, from, secs){
  const L = [], walk = (a, b, pose = 'walk') => L.push({ a, b, t: Math.hypot(b[0] - a[0], b[1] - a[1]) / RUN + 0.01, pose });
  const start = [from[0], from[1], 0];
  if (slot === 0){
    const gate = [1.25, GATE_Y, 0], side = [0.3, 1.32, 0], foot = [LADDER_X, 0.98, 0], top = [LADDER_X, 0.93, TOWER.h];
    const deck = [0.66, 0.66, TOWER.h], mouth = [SLIDE_B[0], SLIDE_B[1], 0], front = [1.05, 1.58, 0];
    walk(start, gate); walk(gate, side);
    const loop = () => {
      walk(side, foot);
      L.push({ a: foot, b: top, t: TOWER.h / CLIMB, pose: 'climb' });
      walk(top, deck);
      L.push({ a: deck, b: [SLIDE_A[0], SLIDE_A[1], TOWER.h], t: 0.35, pose: 'sit' });
      L.push({ a: null, b: mouth, t: SLIDE, pose: 'slide' });
    };
    const inT = L.reduce((s, l) => s + l.t, 0), n0 = L.length;
    loop();
    const loopT = L.slice(n0).reduce((s, l) => s + l.t, 0), aroundT = (Math.hypot(front[0] - mouth[0], front[1] - mouth[1]) + Math.hypot(side[0] - front[0], side[1] - front[1])) / RUN;
    const outT = (Math.hypot(gate[0] - mouth[0], gate[1] - mouth[1]) + Math.hypot(start[0] - gate[0], start[1] - gate[1])) / RUN;
    const n = Math.max(1, Math.round((secs - inT - outT + aroundT) / (loopT + aroundT)));
    for (let i = 1; i < n; i++){ walk(mouth, front); walk(front, side); loop(); }
    walk(mouth, gate); walk(gate, start);
  } else {
    const [sx, sy] = pitSpot(slot), gate = [1.75, GATE_Y, 0], edge = [sx, PIT.y + PIT.ry + 0.16, 0], inPit = [sx, sy, 0];
    walk(start, gate); walk(gate, edge);
    L.push({ a: edge, b: inPit, t: 0.45, pose: 'hop' });
    L.push({ a: inPit, b: inPit, t: Math.max(2.5, secs - 3), pose: 'pit' });
    L.push({ a: inPit, b: edge, t: 0.45, pose: 'hop' });
    walk(edge, gate); walk(gate, start);
  }
  return L;
}
const cache = new WeakMap();
function plan(p){
  let c = cache.get(p.play);
  if (!c){ c = legs(p.play.slot, p.play.from, p.play.secs); cache.set(p.play, c); }
  return c;
}
// How long the whole visit takes, walking in and out included.
export function playLength(p){ return plan(p).reduce((s, l) => s + l.t, 0); }

// Where the kid is `el` seconds into the visit, and what they're doing.
export function playKid(p, el){
  const d = p.play.d, L = plan(p);
  let i = 0;
  while (i < L.length - 1 && el >= L[i].t){ el -= L[i].t; i++; }
  const l = L[i], k = Math.min(1, Math.max(0, el / l.t));
  if (l.pose === 'slide'){
    const q = slidePath(d, Math.pow(k, 1.35));
    return { x: q.x, y: q.y, z: q.z + 0.04, pose: 'slide', flip: false };
  }
  const x = l.a[0] + (l.b[0] - l.a[0]) * k, y = l.a[1] + (l.b[1] - l.a[1]) * k;
  let z = l.a[2] + (l.b[2] - l.a[2]) * k;
  if (l.pose === 'hop') z = Math.sin(k * Math.PI) * 0.28 - (l.b[1] < l.a[1] ? k : 1 - k) * 0.12;
  if (l.pose === 'pit') z = -0.12 - Math.abs(Math.sin(el * 3 + p.id)) * 0.08;
  return { x: d.x + x, y: d.y + y, z, pose: l.pose, flip: l.b[0] < l.a[0] - 0.02, up: l.b[1] < l.a[1] - 0.02 };
}
