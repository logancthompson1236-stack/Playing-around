// The tile grid: floor types, what occupies each tile, walkability, flow-field pathfinding and placement rules.
import { MAP_W, MAP_W_MAX, MAP_H, OUTSIDE_H, START_CLEAN, ZONES, ENTRANCE, FOUNTAIN, STORES, DECOR, EXPANSIONS } from './config.js';
import { doorX } from './art.js';

// The grid is always as wide as the biggest mall; map.w is how much of it the building covers right now.
export const GW = MAP_W_MAX, GH = MAP_H + OUTSIDE_H;
export const FLOOR_NONE = 0, FLOOR_CLEAN = 1, FLOOR_DUST = 2, FLOOR_OUT = 3;
export const FOUNTAIN_ID = -1;

export const map = {
  floor: new Uint8Array(GW * GH),
  occ: new Int32Array(GW * GH),
  zone: new Array(GW * GH).fill(null),
  hidden: new Uint8Array(GW * GH),   // 1 where something tall drawn in front would cover the floor
  garden: new Uint8Array(GW * GH),   // 1 where the floor is the garden court's grass
  w: MAP_W,
  fields: new Map(),
  walkCount: 0,
  rev: 0,
};
export const idx = (x, y) => y * GW + x;
export const inBounds = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH;

export const mallWidth = save => MAP_W + EXPANSIONS.filter(e => save.expansions && save.expansions[e.id]).reduce((a, e) => a + e.w, 0);
export function rebuildMap(save){
  map.floor.fill(FLOOR_NONE); map.occ.fill(0); map.zone.fill(null); map.fields.clear(); map.garden.fill(0);
  map.w = mallWidth(save);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < map.w; x++) map.floor[idx(x, y)] = x < MAP_W ? FLOOR_DUST : FLOOR_CLEAN;
  for (const e of EXPANSIONS) if (save.expansions && save.expansions[e.id] && e.garden){
    const r = e.garden; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) map.garden[idx(x, y)] = 1;
  }
  for (const z of ZONES) for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++){
    map.zone[idx(x, y)] = z.id;
    if (save.zones[z.id]) map.floor[idx(x, y)] = FLOOR_CLEAN;
  }
  for (const r of START_CLEAN) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++){ map.floor[idx(x, y)] = FLOOR_CLEAN; map.zone[idx(x, y)] = null; }
  for (let y = MAP_H; y < GH; y++) for (let x = 0; x < GW; x++) map.floor[idx(x, y)] = FLOOR_OUT;
  for (const u of save.units) fill(u.x, u.y, u.w, u.h, u.id);
  for (const d of save.decor){ const z = decorSize(d); fill(d.x, d.y, z.w, z.h, d.id); }
  fill(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.w, FOUNTAIN.h, FOUNTAIN_ID);
  map.walkCount = 0;
  for (let i = 0; i < GW * MAP_H; i++) if (map.floor[i] === FLOOR_CLEAN && !map.occ[i]) map.walkCount++;
  markHidden(save);
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
  for (const d of save.decor){ const z = decorSize(d); row(d.x, z.w, d.y - 1); if (['plant', 'lamp', 'vending', 'directory', 'tree'].includes(d.type)) row(d.x, 1, d.y - 2); if (d.type === 'tree') row(d.x - 1, 3, d.y - 1); }
  row(FOUNTAIN.x, FOUNTAIN.w, FOUNTAIN.y - 1);
  row(0, map.w, MAP_H - 1);
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
}

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
const usable = type => DECOR[type] && (DECOR[type].seat || DECOR[type].coin);
export function fountainSpots(){
  const out = [];
  for (const [x, y] of [[FOUNTAIN.x, FOUNTAIN.y + 2], [FOUNTAIN.x + 1, FOUNTAIN.y + 2], [FOUNTAIN.x - 1, FOUNTAIN.y + 1], [FOUNTAIN.x + 2, FOUNTAIN.y + 1], [FOUNTAIN.x, FOUNTAIN.y - 1], [FOUNTAIN.x + 1, FOUNTAIN.y - 1]]) if (isWalk(x, y)) out.push({ x, y });
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
    if (i < 0 || j < 0 || i >= map.w || j >= MAP_H) return { ok: false, reason: 'Out of bounds' };
    const f = map.floor[idx(i, j)];
    if (f === FLOOR_DUST) return { ok: false, reason: 'Still storage here. Build a store on it to clear it out.' };
    if (f !== FLOOR_CLEAN || occ[idx(i, j)]) return { ok: false, reason: 'Something is in the way' };
    if (j === MAP_H - 1 && i >= ENTRANCE.x && i < ENTRANCE.x + ENTRANCE.w) return { ok: false, reason: 'Keep the doors clear' };
  }
  if (kind === 'kiosk'){
    // A kiosk's line forms along the row in front of it: keep it off the doors and out of other storefronts.
    for (let i = x - 1; i <= x + w; i++){
      if (y + 1 >= MAP_H - 2 && i >= ENTRANCE.x && i < ENTRANCE.x + ENTRANCE.w) return { ok: false, reason: 'Its line would block the doors' };
      for (const u of save.units) if (u.id !== ignoreId && !u.kiosk){ const a = unitAccess(u); if (a.x === i && a.y === y + 1) return { ok: false, reason: 'Its line would block a storefront' }; }
    }
  }
  let access = null;
  if (kind === 'unit'){
    const dx = x + Math.floor(w / 2);
    access = face === 'down' ? { x: dx, y: y + h } : { x: dx, y: y - 1 };
  } else if (kind === 'kiosk') access = { x: x + 1, y: y + 1 };
  else if (usable(kind)) access = decorAccess({ type: kind, x, y, rot: face || 0 });
  if (access && !isWalkWith(access.x, access.y, occ, x, y, w, h)) return { ok: false, reason: kind === 'unit' ? 'The door needs open walkway in front' : 'Needs open walkway in front' };
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) occ[idx(i, j)] = 99999;
  // Everything that needs visiting must still be reachable from the doors.
  const seen = new Uint8Array(GW * GH), q = [[ENTRY_TILE.x, ENTRY_TILE.y]];
  seen[idx(ENTRY_TILE.x, ENTRY_TILE.y)] = 1;
  while (q.length){
    const [cx, cy] = q.pop();
    neighbors(cx, cy, occ, (nx, ny) => { const i = idx(nx, ny); if (!seen[i]){ seen[i] = 1; q.push([nx, ny]); } });
  }
  const need = [];
  for (const u of save.units) if (u.id !== ignoreId) need.push([unitAccess(u), u.state === 'store' ? STORES[u.store].name : u.state === 'restroom' ? 'the restrooms' : 'an empty unit']);
  for (const d of save.decor) if (d.id !== ignoreId && usable(d.type)) need.push([decorAccess(d), `the ${DECOR[d.type].name.toLowerCase()}`]);
  if (access) need.push([access, 'this spot']);
  for (const [a, name] of need){
    if (!inBounds(a.x, a.y) || !seen[idx(a.x, a.y)]) return { ok: false, reason: `That would block the way to ${name}` };
  }
  return { ok: true };
}
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
