// The tile grid: floor types, what occupies each tile, walkability, flow-field pathfinding and placement rules.
import { MAP_W, MAP_H, OUTSIDE_H, START_CLEAN, ZONES, ENTRANCE, FOUNTAIN, STORES, DECOR } from './config.js';
import { doorX } from './art.js';

export const GW = MAP_W, GH = MAP_H + OUTSIDE_H;
export const FLOOR_NONE = 0, FLOOR_CLEAN = 1, FLOOR_DUST = 2, FLOOR_OUT = 3;
export const FOUNTAIN_ID = -1;

export const map = {
  floor: new Uint8Array(GW * GH),
  occ: new Int32Array(GW * GH),
  zone: new Array(GW * GH).fill(null),
  fields: new Map(),
  walkCount: 0,
  rev: 0,
};
export const idx = (x, y) => y * GW + x;
export const inBounds = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH;

export function rebuildMap(save){
  map.floor.fill(FLOOR_NONE); map.occ.fill(0); map.zone.fill(null); map.fields.clear();
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) map.floor[idx(x, y)] = FLOOR_DUST;
  for (const z of ZONES) for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++){
    map.zone[idx(x, y)] = z.id;
    if (save.zones[z.id]) map.floor[idx(x, y)] = FLOOR_CLEAN;
  }
  for (const r of START_CLEAN) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++){ map.floor[idx(x, y)] = FLOOR_CLEAN; map.zone[idx(x, y)] = null; }
  for (let y = MAP_H; y < GH; y++) for (let x = 0; x < GW; x++) map.floor[idx(x, y)] = FLOOR_OUT;
  for (const u of save.units) fill(u.x, u.y, u.w, u.h, u.id);
  for (const d of save.decor){ const def = DECOR[d.type]; fill(d.x, d.y, def.w, def.h, d.id); }
  fill(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.w, FOUNTAIN.h, FOUNTAIN_ID);
  map.walkCount = 0;
  for (let i = 0; i < GW * MAP_H; i++) if (map.floor[i] === FLOOR_CLEAN && !map.occ[i]) map.walkCount++;
  map.rev++;
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
export function benchAccess(d){ return { x: d.x, y: d.y + 1 }; }
export function fountainSpots(){
  const out = [];
  for (const [x, y] of [[FOUNTAIN.x, FOUNTAIN.y + 2], [FOUNTAIN.x + 1, FOUNTAIN.y + 2], [FOUNTAIN.x - 1, FOUNTAIN.y + 1], [FOUNTAIN.x + 2, FOUNTAIN.y + 1], [FOUNTAIN.x, FOUNTAIN.y - 1], [FOUNTAIN.x + 1, FOUNTAIN.y - 1]]) if (isWalk(x, y)) out.push({ x, y });
  return out;
}
export const ENTRY_TILE = { x: ENTRANCE.x, y: MAP_H - 1 };

/* ---------- Placement ---------- */
// kind: 'unit' (new store shell), 'kiosk', or a decor type. Returns { ok, reason }.
export function validatePlacement(save, kind, x, y, w, h, face, ignoreId = 0){
  const occ = map.occ.slice();
  if (ignoreId) for (let i = 0; i < occ.length; i++) if (occ[i] === ignoreId) occ[i] = 0;
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++){
    if (i < 0 || j < 0 || i >= MAP_W || j >= MAP_H) return { ok: false, reason: 'Out of bounds' };
    const f = map.floor[idx(i, j)];
    if (f === FLOOR_DUST) return { ok: false, reason: 'Clear out this storage area first' };
    if (f !== FLOOR_CLEAN || occ[idx(i, j)]) return { ok: false, reason: 'Something is in the way' };
    if (j === MAP_H - 1 && i >= ENTRANCE.x && i < ENTRANCE.x + ENTRANCE.w) return { ok: false, reason: 'Keep the doors clear' };
  }
  let access = null;
  if (kind === 'unit'){
    const dx = x + Math.floor(w / 2);
    access = face === 'down' ? { x: dx, y: y + h } : { x: dx, y: y - 1 };
  } else if (kind === 'kiosk') access = { x: x + 1, y: y + 1 };
  else if (kind === 'bench') access = { x, y: y + 1 };
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
  for (const u of save.units) if (u.id !== ignoreId) need.push([unitAccess(u), u.state === 'store' ? STORES[u.store].name : 'an empty unit']);
  for (const d of save.decor) if (d.id !== ignoreId && d.type === 'bench') need.push([benchAccess(d), 'a bench']);
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
