// The tile grid: floor types, what occupies each tile, walkability, flow-field pathfinding and placement rules.
import { MAP_W, MAP_W_MAX, MAP_H, OUTSIDE_H, START_CLEAN, ZONES, ENTRANCE, FOUNTAIN, STORES, DECOR, EXPANSIONS, F2X, F3X, ESCALATORS, ESCALATOR_RIDE } from './config.js';
import { doorX } from './art.js';

// The grid is always as wide as the biggest mall; map.w is how far across it the building reaches right now.
// The upper floors sit on the same grid, from columns F2X and F3X (see config.js); map.fw[f] is how much of floor f
// is open (map.f2w is the second floor's, for short).
export const GW = MAP_W_MAX, GH = MAP_H + OUTSIDE_H;
export const FLOOR_NONE = 0, FLOOR_CLEAN = 1, FLOOR_DUST = 2, FLOOR_OUT = 3;
export const FOUNTAIN_ID = -1, ESCALATOR_ID = -2;
// Which floor a spot is on (0 ground, 1 second), and the columns each floor covers.
export const floorOf = x => x >= F3X - 5 ? 2 : x >= F2X - 5 ? 1 : 0;
const FLOOR_X = [0, F2X, F3X];
export const floorRange = f => ({ x0: FLOOR_X[f], x1: FLOOR_X[f] + map.fw[f] });
export const hasUpstairs = () => map.f2w > 0;
export const topFloor = () => map.fw[2] ? 2 : map.fw[1] ? 1 : 0;
// Walking time the escalator ride counts as, for finding the way.
const RIDE_COST = ESCALATOR_RIDE * 2 * 1.4;

export const map = {
  floor: new Uint8Array(GW * GH),
  occ: new Int32Array(GW * GH),
  zone: new Array(GW * GH).fill(null),
  hidden: new Uint8Array(GW * GH),   // 1 where something tall drawn in front would cover the floor
  garden: new Uint8Array(GW * GH),   // special floor: 1 the garden's grass, 2 casino carpet, 3 the high-roller suite's gold carpet
  w: MAP_W, f2w: 0, fw: [MAP_W, 0, 0],
  esc: [],              // the escalators that are running (their floors are open)
  portals: new Map(),   // landing tile index -> the other floor's landing
  reach: new Uint8Array(GW * GH),   // 1 where you can walk to from the doors
  fields: new Map(),
  walkCount: 0,
  rev: 0,
};
export const idx = (x, y) => y * GW + x;
export const inBounds = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH;

export const floorWidth = (save, f) => EXPANSIONS.filter(e => e.floor === f && save.expansions && save.expansions[e.id]).reduce((a, e) => a + e.w, 0);
export const upstairsWidth = save => floorWidth(save, 1);
export const activeEscalators = save => ESCALATORS.filter(e => save.expansions && save.expansions[e.needs]);
export function rebuildMap(save){
  map.floor.fill(FLOOR_NONE); map.occ.fill(0); map.zone.fill(null); map.fields.clear(); map.garden.fill(0); map.portals.clear();
  map.fw = [MAP_W, floorWidth(save, 1), floorWidth(save, 2)];
  map.f2w = map.fw[1];
  map.w = map.fw[2] ? F3X + map.fw[2] : map.f2w ? F2X + map.f2w : MAP_W;
  map.esc = activeEscalators(save);
  for (let y = 0; y < MAP_H; y++){
    for (let x = 0; x < MAP_W; x++) map.floor[idx(x, y)] = FLOOR_DUST;
    for (const f of [1, 2]) for (let x = FLOOR_X[f]; x < FLOOR_X[f] + map.fw[f]; x++) map.floor[idx(x, y)] = FLOOR_CLEAN;
  }
  for (const e of EXPANSIONS) if (save.expansions && save.expansions[e.id] && e.garden){
    const r = e.garden; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) map.garden[idx(x, y)] = 1;
  }
  for (const e of EXPANSIONS) if (save.expansions && save.expansions[e.id] && e.theme)
    for (let y = 0; y < MAP_H; y++) for (let x = e.x; x < e.x + e.w; x++) map.garden[idx(x, y)] = e.theme === 'vip' ? 3 : 2;
  for (const z of ZONES) for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++){
    map.zone[idx(x, y)] = z.id;
    if (save.zones[z.id]) map.floor[idx(x, y)] = FLOOR_CLEAN;
  }
  for (const r of START_CLEAN) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++){ map.floor[idx(x, y)] = FLOOR_CLEAN; map.zone[idx(x, y)] = null; }
  // Sidewalk and parking out front (the ground floor only).
  for (let y = MAP_H; y < GH; y++) for (let x = 0; x < MAP_W; x++) map.floor[idx(x, y)] = FLOOR_OUT;
  for (const e of map.esc){
    fill(e.x, e.y, e.w, e.h, ESCALATOR_ID);
    const o = ESCALATORS.find(q => q.id === e.to);
    map.portals.set(idx(e.land.x, e.land.y), { x: o.land.x, y: o.land.y });
  }
  for (const u of save.units) fill(u.x, u.y, u.w, u.h, u.id);
  for (const d of save.decor){ const z = decorSize(d); fill(d.x, d.y, z.w, z.h, d.id); }
  fill(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.w, FOUNTAIN.h, FOUNTAIN_ID);
  map.walkCount = 0;
  for (let i = 0; i < GW * MAP_H; i++) if (map.floor[i] === FLOOR_CLEAN && !map.occ[i]) map.walkCount++;
  markHidden(save);
  map.reach = reachFrom(map.occ);
  map.rev++;
}
// In the 3/4 view, tall things cover the row (or two) behind them. Litter never lands there.
function markHidden(save){
  map.hidden.fill(0);
  const row = (x0, w, y) => { for (let x = x0; x < x0 + w; x++) if (inBounds(x, y)) map.hidden[idx(x, y)] = 1; };
  for (const u of save.units){
    if (u.kiosk){ row(u.x, u.w, u.y - 1); row(u.x, u.w, u.y - 2); }
    else row(u.x, u.w, u.y - 1);
  }
  for (const d of save.decor){ const z = decorSize(d); row(d.x, z.w, d.y - 1); if (['plant', 'lamp', 'vending', 'directory', 'tree', 'topiary', 'photobooth', 'arch', 'piano', 'balloons', 'arcadecab', 'bubbles', 'slots', 'goldslots', 'neon', 'jackpot', 'wheel', 'dicestatue', 'champagne'].includes(d.type)) row(d.x, z.w, d.y - 2); if (d.type === 'tree') row(d.x - 1, 3, d.y - 1); }
  row(FOUNTAIN.x, FOUNTAIN.w, FOUNTAIN.y - 1);
  for (const f of [0, 1, 2]) row(FLOOR_X[f], map.fw[f], MAP_H - 1);
  for (const e of map.esc) row(e.x, e.w, e.y - 1);
}
// The nearest open, visible walkway spot to (x, y), snapped toward the middle of its tile.
export function litterSpot(x, y, rand = Math.random){
  const cx = Math.floor(x), cy = Math.floor(y);
  let best = null, bd = Infinity;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
    const tx = cx + dx, ty = cy + dy;
    if (ty >= MAP_H || !isWalk(tx, ty) || map.hidden[idx(tx, ty)]) continue;
    const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
    if (d < bd){ bd = d; best = { x: tx + 0.5 + (rand() - 0.5) * 0.3, y: ty + 0.5 + (rand() - 0.5) * 0.25 }; }
  }
  return best;
}
function fill(x, y, w, h, id){
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inBounds(i, j)) map.occ[idx(i, j)] = id;
}

export function isWalk(x, y, occ = map.occ){
  if (!inBounds(x, y)) return false;
  const f = map.floor[idx(x, y)];
  if (f === FLOOR_OUT) return true;
  return f === FLOOR_CLEAN && !occ[idx(x, y)];
}
// The front wall sits between the last inside row and the sidewalk; only the doors cross it.
export function canStep(x0, y0, x1, y1){
  const a = Math.min(y0, y1), b = Math.max(y0, y1);
  if (a === MAP_H - 1 && b === MAP_H){
    if (x0 !== x1) return false;
    return x0 >= ENTRANCE.x && x0 < ENTRANCE.x + ENTRANCE.w;
  }
  return true;
}
const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
function neighbors(x, y, occ, cb){
  for (const [dx, dy, c] of DIRS){
    const nx = x + dx, ny = y + dy;
    if (!isWalk(nx, ny, occ) || !canStep(x, y, nx, ny)) continue;
    if (dx && dy && (!isWalk(x + dx, y, occ) || !isWalk(x, y + dy, occ) || !canStep(x, y, x + dx, y) || !canStep(x, y, x, y + dy))) continue;
    cb(nx, ny, c);
  }
  // The escalator: from one landing to the other floor's.
  const pt = map.portals.size && map.portals.get(idx(x, y));
  if (pt && isWalk(pt.x, pt.y, occ)) cb(pt.x, pt.y, RIDE_COST);
}
// A step between floors (the escalator ride) rather than to a neighboring tile.
export const isRide = (x0, x1) => Math.abs(x1 - x0) > 1;
export const escalatorAt = (x, y) => map.esc.find(e => e.land.x === x && e.land.y === y) || null;

// Distance field toward a target tile (Dijkstra over the walkable grid), cached until the layout changes.
export function field(tx, ty){
  const key = idx(tx, ty);
  let f = map.fields.get(key);
  if (f) return f;
  f = new Float32Array(GW * GH).fill(Infinity);
  f[key] = 0;
  const open = [[tx, ty]];
  while (open.length){
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (f[idx(open[i][0], open[i][1])] < f[idx(open[bi][0], open[bi][1])]) bi = i;
    const [x, y] = open[bi]; open[bi] = open[open.length - 1]; open.pop();
    const d = f[idx(x, y)];
    neighbors(x, y, map.occ, (nx, ny, c) => {
      const ni = idx(nx, ny);
      if (d + c < f[ni]){ if (f[ni] === Infinity) open.push([nx, ny]); f[ni] = d + c; }
    });
  }
  map.fields.set(key, f);
  return f;
}
export function nextStep(cx, cy, tx, ty){
  const f = field(tx, ty);
  let best = null, bd = isWalk(cx, cy) ? f[idx(cx, cy)] : Infinity;
  neighborsFrom(cx, cy, (nx, ny) => { const d = f[idx(nx, ny)]; if (d < bd){ bd = d; best = { x: nx, y: ny }; } });
  return best;
}
// Like neighbors(), but also works when standing on a tile that isn't walkable (stepping back out onto the walkway).
function neighborsFrom(x, y, cb){
  if (isWalk(x, y)) return neighbors(x, y, map.occ, cb);
  for (const [dx, dy] of DIRS.slice(0, 4)){ const nx = x + dx, ny = y + dy; if (isWalk(nx, ny) && canStep(x, y, nx, ny)) cb(nx, ny); }
}
export function reachable(tx, ty, fx, fy){ return field(tx, ty)[idx(fx, fy)] < Infinity; }

/* ---------- Access points ---------- */
export function unitAccess(u){
  if (u.kiosk) return { x: u.x + 1, y: u.y + 1 };
  const dx = doorX(u);
  return u.face === 'down' ? { x: dx, y: u.y + u.h } : { x: dx, y: u.y - 1 };
}
export function kioskStaffAccess(u){
  for (const [x, y] of [[u.x + 1, u.y - 1], [u.x, u.y - 1], [u.x + 2, u.y], [u.x - 1, u.y]]) if (isWalk(x, y)) return { x, y };
  return { x: u.x + 1, y: u.y + 1 };
}
// Decor turned sideways (rot 1 or 3) swaps its width and depth.
export function decorSize(d){ const def = DECOR[d.type], side = (d.rot || 0) % 2 === 1; return side ? { w: def.h, h: def.w } : { w: def.w, h: def.h }; }
// The tile a shopper stands on to use a seat or a machine: the one it faces.
export function decorAccess(d){
  const r = d.rot || 0, z = decorSize(d);
  return r === 0 ? { x: d.x, y: d.y + z.h } : r === 1 ? { x: d.x - 1, y: d.y } : r === 2 ? { x: d.x, y: d.y - 1 } : { x: d.x + z.w, y: d.y };
}
const usable = type => DECOR[type] && (DECOR[type].seat || DECOR[type].coin || DECOR[type].play || DECOR[type].game);
export function fountainSpots(){
  const out = [];
  for (const [x, y] of [[FOUNTAIN.x, FOUNTAIN.y + 2], [FOUNTAIN.x + 1, FOUNTAIN.y + 2], [FOUNTAIN.x - 1, FOUNTAIN.y + 1], [FOUNTAIN.x + 2, FOUNTAIN.y + 1], [FOUNTAIN.x, FOUNTAIN.y - 1], [FOUNTAIN.x + 1, FOUNTAIN.y - 1]]) if (canReach(x, y)) out.push({ x, y });
  return out;
}
export const ENTRY_TILE = { x: ENTRANCE.x, y: MAP_H - 1 };

/* ---------- Placement ---------- */
// kind: 'unit' (new store shell), 'kiosk', or a decor type. face: 'down'/'up' for units, rot 0–3 for decor. Returns { ok, reason }.
// clearZones: storage rooms to treat as already cleared (building there clears them out).
export function validatePlacement(save, kind, x, y, w, h, face, ignoreId = 0, clearZones = []){
  if (!clearZones.length) return checkPlacement(save, kind, x, y, w, h, face, ignoreId);
  const floor = map.floor.slice();
  for (let i = 0; i < GW * MAP_H; i++) if (clearZones.includes(map.zone[i])) map.floor[i] = FLOOR_CLEAN;
  try { return checkPlacement(save, kind, x, y, w, h, face, ignoreId); } finally { map.floor.set(floor); }
}
function checkPlacement(save, kind, x, y, w, h, face, ignoreId){
  const occ = map.occ.slice();
  if (ignoreId) for (let i = 0; i < occ.length; i++) if (occ[i] === ignoreId) occ[i] = 0;
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++){
    if (i < 0 || j < 0 || i >= map.w || j >= MAP_H || floorOf(i) !== floorOf(x)) return { ok: false, reason: 'Out of bounds' };
    const f = map.floor[idx(i, j)];
    if (f === FLOOR_DUST) return { ok: false, reason: 'Still storage here. Build a store on it to clear it out.' };
    if (f !== FLOOR_CLEAN || occ[idx(i, j)]) return { ok: false, reason: 'Something is in the way' };
    if (j === MAP_H - 1 && i >= ENTRANCE.x && i < ENTRANCE.x + ENTRANCE.w) return { ok: false, reason: 'Keep the doors clear' };
    if (map.esc.some(e => e.land.x === i && e.land.y === j)) return { ok: false, reason: 'Keep the escalator clear' };
  }
  const ddef = DECOR[kind];
  if (ddef && ddef.casino && floorOf(x) !== 2) return { ok: false, reason: 'This goes on the casino floor' };
  // A casino table's three seats run along its front: all of it needs to be open walkway.
  if (ddef && ddef.game) for (let i = x; i < x + w; i++) if (!isWalkWith(i, y + h, occ, x, y, w, h)) return { ok: false, reason: 'The seats along the front need open floor' };
  if (kind === 'kiosk'){
    // A kiosk's line forms along the row in front of it: keep it off the doors and out of other storefronts.
    for (let i = x - 1; i <= x + w; i++){
      if (y + 1 >= MAP_H - 2 && i >= ENTRANCE.x && i < ENTRANCE.x + ENTRANCE.w) return { ok: false, reason: 'Its line would block the doors' };
      for (const u of save.units) if (u.id !== ignoreId && !u.kiosk){ const a = unitAccess(u); if (a.x === i && a.y === y + 1) return { ok: false, reason: 'Its line would block a storefront' }; }
      if (map.esc.some(e => e.land.x === i && e.land.y === y + 1)) return { ok: false, reason: 'Its line would block the escalator' };
    }
  }
  let access = null;
  if (kind === 'unit'){
    const dx = x + Math.floor(w / 2);
    access = face === 'down' ? { x: dx, y: y + h } : { x: dx, y: y - 1 };
  } else if (kind === 'kiosk') access = { x: x + 1, y: y + 1 };
  else if (usable(kind)) access = decorAccess({ type: kind, x, y, rot: face || 0 });
  // The front has to open onto the mall's own floor: past the outer walls is the sidewalk outside.
  if (access && (access.y < 0 || access.y >= MAP_H || floorOf(access.x) !== floorOf(x))) return { ok: false, reason: kind === 'unit' ? 'The door can’t open onto the outside wall' : 'Its front can’t face the outside wall' };
  if (access && !isWalkWith(access.x, access.y, occ, x, y, w, h)) return { ok: false, reason: kind === 'unit' ? 'The door needs open walkway in front' : 'Needs open walkway in front' };
  // Everything that needs visiting must still be reachable from the doors. Only what this change would cut off
  // counts: something that was already out of reach (say, from an older layout) never blocks a new placement.
  const before = reachFrom(occ);
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) occ[idx(i, j)] = 99999;
  const seen = reachFrom(occ);
  const need = needs(save, ignoreId);
  if (access) need.push([access, 'this spot']);
  for (const [a, name] of need){
    const i = inBounds(a.x, a.y) ? idx(a.x, a.y) : -1;
    if (i < 0 || (!seen[i] && (before[i] || name === 'this spot'))) return { ok: false, reason: `That would block the way to ${name}` };
  }
  return { ok: true };
}
// Every walkable tile you can get to from the front doors (escalator included).
function reachFrom(occ){
  const seen = new Uint8Array(GW * GH), q = [[ENTRY_TILE.x, ENTRY_TILE.y]];
  seen[idx(ENTRY_TILE.x, ENTRY_TILE.y)] = 1;
  while (q.length){
    const [cx, cy] = q.pop();
    neighbors(cx, cy, occ, (nx, ny) => { const i = idx(nx, ny); if (!seen[i]){ seen[i] = 1; q.push([nx, ny]); } });
  }
  return seen;
}
// The spots people need to get to: storefront doors, the fronts of seats and machines, the escalator landings.
function needs(save, ignoreId = 0){
  const need = [];
  for (const u of save.units) if (u.id !== ignoreId) need.push([unitAccess(u), u.state === 'store' ? STORES[u.store].name : u.state === 'restroom' ? 'the restrooms' : 'an empty unit', u]);
  for (const d of save.decor) if (d.id !== ignoreId && usable(d.type)) need.push([decorAccess(d), `the ${DECOR[d.type].name.toLowerCase()}`, d]);
  for (const e of map.esc) need.push([e.land, 'the escalator', null]);
  return need;
}
// Whether a tile can be walked to from the doors right now (worked out once per layout change).
export const canReach = (x, y) => inBounds(x, y) && map.reach[idx(x, y)] === 1;
function isWalkWith(x, y, occ, fx, fy, fw, fh){
  if (x >= fx && x < fx + fw && y >= fy && y < fy + fh) return false;
  return isWalk(x, y, occ);
}

export function zoneAt(x, y){
  if (!inBounds(x, y)) return null;
  const id = map.zone[idx(x, y)];
  return id && map.floor[idx(x, y)] === FLOOR_DUST ? id : null;
}
export function occAt(x, y){ return inBounds(x, y) ? map.occ[idx(x, y)] : 0; }

// Ring by ring outward from (x0, y0), the nearest spot on the same floor where something fits.
function nearestSpot(save, kind, x0, y0, w, h, face){
  for (let r = 1; r < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++){
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = x0 + dx, y = y0 + dy;
    if (floorOf(x) !== floorOf(x0)) continue;
    const f = kind === 'unit' ? (y + h <= 7 ? 'down' : 'up') : face;
    if (validatePlacement(save, kind, x, y, w, h, f).ok) return { x, y, face: f };
    const g = f === 'down' ? 'up' : 'down';
    if (kind === 'unit' && validatePlacement(save, kind, x, y, w, h, g).ok) return { x, y, face: g };
  }
  return null;
}
const unitKind = u => u.kiosk ? 'kiosk' : 'unit';
// Older saves could have a store (or a bench, machine...) whose front opened onto the outside wall, so shoppers
// walked through the wall. Turn it around if that works where it stands, or else move it to the nearest spot that
// does. Nothing is removed (a decoration that truly can't fit anywhere is refunded).
const facesOut = (save, a, x) => a.y < 0 || a.y >= MAP_H || floorOf(a.x) !== floorOf(x);
export function fixDoors(save){
  const out = { moved: 0, refund: 0 };
  rebuildMap(save);
  for (const u of [...save.units]){
    if (u.kiosk || (u.state !== 'store' && u.state !== 'vacant' && u.state !== 'restroom') || !facesOut(save, unitAccess(u), u.x)) continue;
    const flip = u.face === 'down' ? 'up' : 'down';
    if (validatePlacement(save, 'unit', u.x, u.y, u.w, u.h, flip, u.id).ok){ u.face = flip; out.moved++; rebuildMap(save); continue; }
    save.units = save.units.filter(v => v !== u); rebuildMap(save);
    const at = nearestSpot(save, 'unit', u.x, u.y, u.w, u.h, u.face);
    if (at){ u.x = at.x; u.y = at.y; u.face = at.face; out.moved++; }
    else u.face = flip;                       // nowhere better: at least the door faces in
    save.units.push(u); rebuildMap(save);
  }
  for (const d of [...save.decor]){
    if (!usable(d.type) || !facesOut(save, decorAccess(d), d.x)) continue;
    save.decor = save.decor.filter(v => v !== d); rebuildMap(save);
    const z = decorSize(d);
    const turned = DECOR[d.type].rot && [0, 1, 2, 3].map(r => ({ r, z: decorSize({ type: d.type, rot: r }) })).find(o => !facesOut(save, decorAccess({ ...d, rot: o.r }), d.x) && validatePlacement(save, d.type, d.x, d.y, o.z.w, o.z.h, o.r).ok);
    if (turned){ d.rot = turned.r; save.decor.push(d); out.moved++; }
    else { const at = nearestSpot(save, d.type, d.x, d.y, z.w, z.h, d.rot || 0); if (at){ d.x = at.x; d.y = at.y; save.decor.push(d); out.moved++; } else out.refund += DECOR[d.type].cost; }
    rebuildMap(save);
  }
  save.money += out.refund;
  return out;
}

// Opening the second floor puts an escalator at the east end of the concourse. Anything the player had put where it
// (or its landing) goes moves to the nearest spot that works on the same floor; only what truly can't fit is refunded.
// (It also catches anything left straddling the old opening to the east wing, which is a wall now.)
// Then fixReachability makes sure nothing ended up walled off.
export function clearEscalators(save){
  const out = { moved: 0, refund: 0 };
  const over = (x, y, w, h, rx, ry, rw, rh) => x < rx + rw && x + w > rx && y < ry + rh && y + h > ry;
  const esc = activeEscalators(save);
  const hits = (x, y, w, h) => (x + w > MAP_W && x < F2X) || (x + w > F2X + 28 && x < F3X) || esc.some(e => over(x, y, w, h, e.x, e.y, e.w, e.h) || over(x, y, w, h, e.land.x, e.land.y, 1, 1));
  // Also anything whose front (the tile you use it from) the escalator would cover.
  const blocks = a => esc.some(e => over(a.x, a.y, 1, 1, e.x, e.y, e.w, e.h));
  const decor = save.decor.filter(d => { const z = decorSize(d); return hits(d.x, d.y, z.w, z.h) || (usable(d.type) && blocks(decorAccess(d))); });
  const units = save.units.filter(u => hits(u.x, u.y, u.w, u.h) || blocks(unitAccess(u)));
  if (decor.length || units.length){
    save.decor = save.decor.filter(d => !decor.includes(d)); save.units = save.units.filter(u => !units.includes(u));
    rebuildMap(save);
    for (const u of units){
      const at = nearestSpot(save, unitKind(u), u.x, u.y, u.w, u.h, u.face);
      if (at){ u.x = at.x; u.y = at.y; if (!u.kiosk) u.face = at.face; save.units.push(u); rebuildMap(save); out.moved++; }
      else { out.refund += u.state === 'store' ? STORES[u.store].cost : 0; for (const m of save.staff) if (m.storeId === u.id) m.storeId = null; }
    }
    for (const d of decor){
      const z = decorSize(d), at = nearestSpot(save, d.type, d.x, d.y, z.w, z.h, d.rot || 0);
      if (at){ d.x = at.x; d.y = at.y; save.decor.push(d); rebuildMap(save); out.moved++; }
      else out.refund += Math.round(DECOR[d.type].cost);
    }
    save.money += out.refund;
  }
  const r = fixReachability(save);
  out.moved += r.moved; out.refund += r.refund;
  return out;
}
// Storefronts, seats and machines nobody can walk to (say the escalator cut off a corner, or the old way round through
// the east wing is a wall now). First try moving decor that walls them off; failing that, move the stranded thing
// itself to the nearest spot people can reach. Nothing is removed unless there's truly no room anywhere.
export function fixReachability(save){
  const out = { moved: 0, refund: 0 };
  for (let pass = 0; pass < 16; pass++){
    rebuildMap(save);
    const bad = needs(save).filter(([a]) => !canReach(a.x, a.y));
    if (!bad.length) break;
    const stranded = n => { const seen = reachFrom(n); return bad.filter(([a]) => !seen[idx(a.x, a.y)]).length; };
    let best = null, bestN = bad.length;
    for (const d of save.decor){
      if (!bad.some(([a]) => Math.abs(d.x - a.x) + Math.abs(d.y - a.y) < 14)) continue;
      const occ = map.occ.slice();
      for (let i = 0; i < occ.length; i++) if (occ[i] === d.id) occ[i] = 0;
      const n = stranded(occ);
      if (n < bestN){ bestN = n; best = d; }
    }
    let item = best, kind = best && best.type;
    if (!item){ const b = bad.find(([, , o]) => o); if (!b) break; item = b[2]; kind = item.type || unitKind(item); }
    const isDecor = save.decor.includes(item);
    if (isDecor) save.decor = save.decor.filter(d => d !== item); else save.units = save.units.filter(u => u !== item);
    rebuildMap(save);
    const z = isDecor ? decorSize(item) : { w: item.w, h: item.h };
    const at = nearestSpot(save, kind, item.x, item.y, z.w, z.h, isDecor ? item.rot || 0 : item.face);
    if (at){
      item.x = at.x; item.y = at.y;
      if (!isDecor && !item.kiosk) item.face = at.face;
      (isDecor ? save.decor : save.units).push(item); out.moved++;
    } else if (isDecor) out.refund += DECOR[item.type].cost;
    else { (save.units).push(item); break; }   // a store with nowhere better to go stays put
  }
  save.money += out.refund;
  rebuildMap(save);
  return out;
}
