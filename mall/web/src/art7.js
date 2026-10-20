// v0.20 painters: the speakeasy's bar games. Darts, pool, foosball, shuffleboard and pinball, each with its own
// table and the players' moves around it. Everything is driven by the game's clock (G.t) and seed so a frame can be
// drawn from scratch: G = { kind, players: [id|null…], on, t, len, seed, winner, done, postT, solo, wait } (see
// sim.js). No G means nobody's playing, and the table is drawn at rest.
import { g, rr, circ, ell, fs, box, shadow, text, OUT, shade, cylinder } from './art.js';

const BRASS = '#d4a24c', WALNUT = '#5a3626';
const hash = (a, b, c = 0) => { let t = Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791); t = Math.imul(t ^ t >>> 13, 0x5bd1e995); return ((t ^ t >>> 15) >>> 0) / 4294967296; };
const clamp01 = k => Math.max(0, Math.min(1, k));
const ease = k => { k = clamp01(k); return k * k * (3 - 2 * k); };
const seg = (k, a, b) => ease((k - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const TEAM = ['#c1121f', '#2f5aa8'];

/* ---------- Turns ---------- */
// Seconds per turn for the turn-based games.
const TURN = { darts: 5.2, pool: 4.2, shuffle: 2.9 };
const present = G => G ? G.players.map((id, i) => id !== null && id !== undefined ? i : -1).filter(i => i >= 0) : [];
// Whose turn it is in turn n. Turns alternate; in a solo game it's always the one player. The last turn goes to
// the winner, so the game ends on their big shot.
function turnOf(G, n, T){
  const ps = present(G);
  if (!ps.length) return 0;
  if (G.solo || ps.length === 1) return ps[0];
  const last = Math.max(0, Math.floor((G.len - 0.01) / T));
  if (n >= last && G.winner !== null && G.winner !== undefined) return G.winner;
  return n % 2 === 0 ? ps[0] : ps[1];
}
// Where the game is: turn number, seconds into it, and whose it is.
function clock(G, T){
  const tt = Math.min(G.t || 0, G.len || 0), n = Math.floor(tt / T);
  return { n, c: tt - n * T, who: turnOf(G, n, T), tt };
}
// Walking from a to b, k of the way: where to stand, and the person() options for the walk.
function walkPose(a, b, k){
  const d = Math.hypot(b.x - a.x, b.y - a.y), e = ease(k);
  const moving = k > 0.001 && k < 0.999 && d > 0.05;
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), o: moving ? { walk: true, stride: e * d, side: d ? Math.abs(b.x - a.x) / d : 0, back: b.y < a.y - 0.05, flip: b.x < a.x - 0.02 } : {} };
}
// At the end: the winner throws their arms up, everyone else claps.
function endPose(G, slot, spot, o = {}){
  const win = G.winner === slot || G.solo;
  return { x: spot.x, y: spot.y, o: { ...o, back: false, cheer: win && (G.postT || 0) < 1.5, play: !win, mood: 'happy' } };
}

/* ---------- Where players stand ---------- */
export function gameSpots(d){
  const x = d.x, y = d.y;
  switch (d.type){
    case 'darts': return [{ x: x + 0.35, y: y + 2.72 }, { x: x + 1.65, y: y + 2.72 }];
    case 'pool': return [{ x: x + 0.3, y: y + 2.62 }, { x: x + 2.7, y: y + 2.62 }];
    case 'foosball': return [{ x: x + 0.16, y: y + 1.22 }, { x: x + 1.84, y: y + 1.22 }];
    case 'shuffle': return [{ x: x + 0.55, y: y + 1.66 }, { x: x + 1.15, y: y + 1.72 }];
    case 'pinball': return [{ x: x + 0.5, y: y + 1.62 }];
  }
  return [];
}

/* ---------- Darts ---------- */
// The board hangs in a walnut cabinet with a chalk scoreboard on its door. Players throw from the brass oche line,
// three darts a turn, then walk up and pull them out.
const DARTS = { board: (d) => ({ x: d.x + 1, y: d.y - 0.6, r: 0.3 }), oche: d => ({ x: d.x + 1.0, y: d.y + 2.28 }), pull: d => ({ x: d.x + 1.0, y: d.y + 0.82 }), rel: [0.95, 1.65, 2.35] };
const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
// Where dart k of turn n lands (board-local, in board radii) and what it scores.
function dartHit(G, n, k){
  const a = hash(G.seed, n, k * 3 + 1) * Math.PI * 2, v = hash(G.seed, n, k * 3 + 2);
  const bull = v < 0.1, r = bull ? v * 0.5 : 0.12 + Math.sqrt(v) * 0.78;
  const sector = SECTORS[Math.floor(((a + Math.PI / 2 + Math.PI / 20) / (Math.PI * 2)) * 20 + 20) % 20];
  const ring = r > 0.58 && r < 0.66 ? 3 : r > 0.88 ? 2 : 1;
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, score: bull ? (v < 0.04 ? 50 : 25) : sector * ring, bull, ring };
}
function dartsBoard(d, t, G){
  const b = DARTS.board(d), x = d.x, y = d.y;
  // The cabinet, doors open, on a stand.
  shadow(x + 1, y + 0.36, 0.6, 0.1);
  rr(x + 0.94, y - 0.1, 0.12, 0.45, 0.02); fs('#2b2230', 0.02);
  box(x + 0.55, y + 0.12, 0.9, 0.18, 1.32, '#3d2219', WALNUT, 0.08);
  for (const sx of [-1, 1]){
    const dx = sx < 0 ? x + 0.2 : x + 1.45;
    rr(dx, y - 1.13, 0.35, 0.98, 0.03); fs(sx < 0 ? '#2a3a32' : WALNUT, 0.03);
    if (sx < 0){
      // The chalk scoreboard: 301 down to zero for each player.
      g.strokeStyle = 'rgba(240,240,230,.65)'; g.lineWidth = 0.01; g.beginPath(); g.moveTo(dx + 0.175, y - 1.05); g.lineTo(dx + 0.175, y - 0.22); g.moveTo(dx + 0.04, y - 0.95); g.lineTo(dx + 0.31, y - 0.95); g.stroke();
      text('A', dx + 0.09, y - 1.0, 0.07, '#f0efe6', 700); text('B', dx + 0.26, y - 1.0, 0.07, '#f0efe6', 700);
      const sc = dartsScores(G);
      for (let p = 0; p < 2; p++) sc[p].forEach((v, i) => { if (i < 6) text(String(v), dx + 0.09 + p * 0.17, y - 0.86 + i * 0.11, 0.065, i === sc[p].length - 1 ? '#fff8c4' : 'rgba(240,240,230,.55)', 600); });
    } else {
      for (let k = 0; k < 3; k++){ rr(dx + 0.08, y - 1.0 + k * 0.2, 0.19, 0.03, 0.01); fs(BRASS, 0); }
    }
  }
  rr(x + 0.58, y - 1.16, 0.84, 1.0, 0.03); fs('#1d1420', 0.02);
  // The board: black and cream wedges, red and green rings, the bull.
  circ(b.x, b.y, b.r + 0.06); fs('#141014', 0.03);
  for (let i = 0; i < 20; i++){
    const a0 = -Math.PI / 2 - Math.PI / 20 + i * Math.PI / 10, a1 = a0 + Math.PI / 10;
    const wedge = (r0, r1, col) => { g.beginPath(); g.arc(b.x, b.y, r1, a0, a1); g.arc(b.x, b.y, r0, a1, a0, true); g.closePath(); g.fillStyle = col; g.fill(); };
    wedge(0, b.r, i % 2 ? '#efe4cc' : '#1d1d1d');
    wedge(b.r * 0.88, b.r, i % 2 ? '#2e8b57' : '#c1121f');
    wedge(b.r * 0.58, b.r * 0.66, i % 2 ? '#2e8b57' : '#c1121f');
  }
  g.strokeStyle = 'rgba(200,200,200,.5)'; g.lineWidth = 0.006; circ(b.x, b.y, b.r); g.stroke();
  circ(b.x, b.y, 0.045); g.fillStyle = '#2e8b57'; g.fill(); circ(b.x, b.y, 0.02); g.fillStyle = '#c1121f'; g.fill();
  for (let i = 0; i < 20; i += 5){ const a = -Math.PI / 2 + i * Math.PI / 10; text(String(SECTORS[i]), b.x + Math.cos(a) * (b.r + 0.035), b.y + Math.sin(a) * (b.r + 0.035), 0.04, '#f0efe6', 700); }
  // A little lamp over it.
  rr(x + 0.85, y - 1.3, 0.3, 0.07, 0.03); fs(BRASS, 0.015);
  g.save(); g.globalAlpha = 0.18; g.beginPath(); g.moveTo(x + 0.88, y - 1.24); g.lineTo(x + 1.12, y - 1.24); g.lineTo(x + 1.4, y - 0.25); g.lineTo(x + 0.6, y - 0.25); g.closePath(); g.fillStyle = '#ffe2a8'; g.fill(); g.restore();
  // Darts in the board: this turn's (until they're pulled), or three left from the last game.
  const stuck = [];
  if (G && G.on){
    const T = TURN.darts, k = clock(G, T);
    for (let i = 0; i < 3; i++) if (k.c > DARTS.rel[i] + 0.22 && k.c < 4.0) stuck.push({ ...dartHit(G, k.n, i), col: TEAM[k.who] });
  } else for (let i = 0; i < 3; i++) stuck.push({ dx: [0.2, -0.35, 0.05][i], dy: [-0.3, 0.1, 0.45][i], col: TEAM[i % 2] });
  for (const s of stuck) dartStuck(b.x + s.dx * b.r, b.y + s.dy * b.r, s.col);
  // The score of each dart pops up, and a bullseye gets a flash.
  if (G && G.on){
    const T = TURN.darts, k = clock(G, T);
    for (let i = 0; i < 3; i++){
      const since = k.c - DARTS.rel[i] - 0.22;
      if (since < 0 || since > 0.9) continue;
      const h = dartHit(G, k.n, i), a = 1 - since / 0.9;
      g.save(); g.globalAlpha = a;
      if (h.bull){ g.shadowColor = '#ffd23f'; g.shadowBlur = 8; text('BULLSEYE!', b.x, b.y - b.r - 0.2 - since * 0.15, 0.13, '#ffd23f', 700); circ(b.x, b.y, 0.06 + since * 0.3); g.strokeStyle = '#fff6a8'; g.lineWidth = 0.02; g.stroke(); }
      else text(`${h.ring === 3 ? 'TRIPLE ' : h.ring === 2 ? 'DOUBLE ' : ''}${h.score}`, b.x + 0.42, b.y - 0.3 - since * 0.15, 0.08, '#fff8c4', 700);
      g.restore();
    }
  }
}
function dartsScores(G){
  const out = [[301], [301]];
  if (!G || !G.on) return out;
  const T = TURN.darts, k = clock(G, T);
  for (let n = 0; n <= k.n; n++){
    const who = turnOf(G, n, T);
    let sum = 0;
    for (let i = 0; i < 3; i++) if (n < k.n || k.c > DARTS.rel[i] + 0.22) sum += dartHit(G, n, i).score;
    if (!sum) continue;
    const col = out[who], v = Math.max(0, col[col.length - 1] - sum);
    if (n < k.n || k.c > DARTS.rel[2] + 0.22) col.push(v);
  }
  if (G.done && G.winner !== null && G.winner !== undefined && !G.solo){ const col = out[G.winner]; if (col[col.length - 1] !== 0) col.push(0); }
  for (const c of out) while (c.length > 6) c.shift();
  return out;
}
function dartStuck(x, y, col){
  g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.014; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.04, y + 0.05); g.stroke();
  g.strokeStyle = '#2b2230'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(x + 0.04, y + 0.05); g.lineTo(x + 0.07, y + 0.09); g.stroke();
  g.fillStyle = col; g.beginPath(); g.moveTo(x + 0.07, y + 0.09); g.lineTo(x + 0.13, y + 0.1); g.lineTo(x + 0.09, y + 0.15); g.closePath(); g.fill();
}
// A dart in flight from (x0, y0) to (x1, y1), u of the way.
function dartFlying(x0, y0, x1, y1, u, col){
  const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 0.18, a = Math.atan2((y1 - y0) - Math.cos(u * Math.PI) * 0.18 * Math.PI, x1 - x0);
  g.save(); g.translate(x, y); g.rotate(a); const s = 1 - u * 0.35; g.scale(s, s);
  g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.014; g.beginPath(); g.moveTo(0.05, 0); g.lineTo(0.1, 0); g.stroke();
  g.strokeStyle = '#2b2230'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(-0.03, 0); g.lineTo(0.05, 0); g.stroke();
  g.fillStyle = col; g.beginPath(); g.moveTo(-0.03, 0); g.lineTo(-0.1, -0.04); g.lineTo(-0.08, 0); g.lineTo(-0.1, 0.04); g.closePath(); g.fill();
  g.restore();
}
function dartsPose(d, slot, G, t){
  const sp = gameSpots(d)[slot];
  if (!G || !G.on) return { x: sp.x, y: sp.y, o: { back: true } };
  if (G.done) return endPose(G, slot, sp);
  const T = TURN.darts, k = clock(G, T);
  if (k.who !== slot) return { x: sp.x, y: sp.y, o: { back: true, mood: k.c > 2.4 && k.c < 3.0 ? 'happy' : undefined } };
  const oche = DARTS.oche(d), pull = DARTS.pull(d), c = k.c, b = DARTS.board(d);
  const col = TEAM[slot];
  if (c < 0.6) return walkPose(sp, oche, c / 0.6);
  if (c < 2.9){
    // Wind up (arm back), throw (arm forward); the dart flies to the board.
    const rel = DARTS.rel.find(r => c > r - 0.32 && c < r + 0.08);
    const hand = { x: oche.x + 0.2, y: oche.y - 0.82 };
    const after = () => {
      for (let i = 0; i < 3; i++){ const u = (c - DARTS.rel[i]) / 0.22; if (u >= 0 && u <= 1){ const h = dartHit(G, k.n, i); dartFlying(hand.x, hand.y, b.x + h.dx * b.r, b.y + h.dy * b.r, u, col); } }
      // The next dart, in hand and raised to the eye.
      const next = DARTS.rel.findIndex(r => c < r);
      if (next >= 0 && c > DARTS.rel[next] - 0.32) dartFlying(hand.x, hand.y + 0.05, hand.x, hand.y - 0.5, 0, col);
    };
    return { x: oche.x, y: oche.y, o: { back: true, reach: !!rel, crouch: rel ? 0.08 : 0 }, after };
  }
  if (c < 3.7) return walkPose(oche, pull, (c - 2.9) / 0.8);
  if (c < 4.1) return { x: pull.x, y: pull.y, o: { back: true, reach: c > 3.75 && c < 4.05 } };
  return walkPose(pull, sp, (c - 4.1) / 1.1);
}

/* ---------- Pool ---------- */
// A 9-ball table: felt, walnut rails, leather pockets. The break scatters the rack; after that each shot goes at the
// lowest ball left, and the winner's last shot sinks the 9.
const BALL_R = 0.048;
const POOL_COLS = ['#f8f5ec', '#f2c14e', '#2f5aa8', '#c1121f', '#6a3d9a', '#f28c28', '#2e8b57', '#7a1f2b', '#1d1d1d', '#f2c14e'];
function poolGeom(d){
  const X0 = d.x + 0.3, X1 = d.x + 2.7, Y0 = d.y + 0.5, Y1 = d.y + 1.9, H = 0.42;
  const fx0 = X0 + 0.15, fx1 = X1 - 0.15, fy0 = Y0 + 0.15 - H, fy1 = Y1 - 0.15 - H;
  return { X0, X1, Y0, Y1, H, fx0, fx1, fy0, fy1, at: (u, v) => ({ x: lerp(fx0, fx1, u), y: lerp(fy0, fy1, v) }) };
}
const POCKETS = [[0, 0], [0.5, -0.02], [1, 0], [0, 1], [0.5, 1.02], [1, 1]];
function rack(){
  const balls = [{ u: 0.25, v: 0.5, in: false }];
  const du = 0.083 * 0.866 / 2.1, dv = 0.083 / 1.1, rows = [[1], [2, 3], [4, 9, 5], [6, 7], [8]];
  const pos = [];
  rows.forEach((row, r) => row.forEach((n, i) => { pos[n] = { u: 0.7 + r * du, v: 0.5 + (i - (row.length - 1) / 2) * dv, in: false }; }));
  for (let n = 1; n <= 9; n++) balls[n] = pos[n];
  return balls;
}
// Every shot of a game worked out from the start: where the balls were before it and what moves where.
function poolShots(G, T){
  const shots = [], n = Math.max(1, Math.floor((G.len - 0.01) / T) + 1);
  let balls = rack();
  for (let s = 0; s < n; s++){
    const before = balls.map(b => ({ ...b })), after = balls.map(b => ({ ...b })), moves = [];
    const last = s === n - 1, r = (k) => hash(G.seed, s, k);
    if (s === 0){
      // The break: the cue ball smashes the rack and everything scatters; a ball or two drops.
      const sunk = new Set([1 + Math.floor(r(1) * 8), r(2) < 0.5 ? 1 + Math.floor(r(3) * 8) : 0]);
      for (let i = 1; i <= 9; i++){
        if (sunk.has(i) && i !== 9){ const p = POCKETS[Math.floor(r(10 + i) * 6)]; after[i] = { u: p[0], v: p[1], in: true }; }
        else after[i] = { u: 0.12 + r(20 + i) * 0.76, v: 0.1 + r(40 + i) * 0.8, in: false };
        moves.push({ i, from: before[i], to: after[i], t0: 0.12 + Math.hypot(before[i].u - 0.7, before[i].v - 0.5) * 0.6, t1: 0.7 + r(60 + i) * 0.35 });
      }
      after[0] = { u: 0.4 + r(5) * 0.2, v: 0.3 + r(6) * 0.4, in: false };
      moves.push({ i: 0, from: before[0], to: { u: 0.67, v: 0.5 }, t0: 0, t1: 0.15 }, { i: 0, from: { u: 0.67, v: 0.5 }, to: after[0], t0: 0.15, t1: 0.9 });
      shots.push({ before, after, moves, target: 1 });
    } else {
      // The lowest ball left (the 9 on the winner's last shot).
      let ti = 0; for (let i = 1; i <= 9; i++) if (!before[i].in){ ti = i; break; }
      if (last) ti = 9;
      if (!ti || before[ti].in){ shots.push({ before, after, moves, target: 0 }); balls = after; continue; }
      const tb = before[ti], cb = before[0];
      const make = last || (ti !== 9 && r(1) < 0.55);
      // Aim for the pocket the ball is lined up with best.
      let best = POCKETS[0], bd = Infinity;
      for (const p of POCKETS){ const dd = Math.hypot(p[0] - tb.u, (p[1] - tb.v) * 0.55) + r(7 + p[0] * 3 + p[1]) * 0.15; if (dd < bd){ bd = dd; best = p; } }
      const dirU = best[0] - tb.u, dirV = (best[1] - tb.v), dl = Math.hypot(dirU, dirV) || 1;
      const ghost = { u: tb.u - dirU / dl * 0.045, v: tb.v - dirV / dl * 0.08 };
      const dest = make ? { u: best[0], v: best[1], in: true } : { u: clamp01(tb.u + dirU * 0.7 + (r(2) - 0.5) * 0.12), v: clamp01(tb.v + dirV * 0.7 + (r(3) - 0.5) * 0.2), in: false };
      after[ti] = dest;
      const cuEnd = { u: Math.min(0.92, Math.max(0.08, ghost.u + (r(4) - 0.5) * 0.3)), v: Math.min(0.9, Math.max(0.1, ghost.v + (r(5) - 0.5) * 0.4)), in: false };
      after[0] = cuEnd;
      moves.push({ i: 0, from: cb, to: ghost, t0: 0, t1: 0.35 }, { i: 0, from: ghost, to: cuEnd, t0: 0.35, t1: 0.9 }, { i: ti, from: tb, to: dest, t0: 0.33, t1: make ? 0.85 : 0.95 });
      shots.push({ before, after, moves, target: ti, make });
    }
    balls = after;
  }
  return shots;
}
const shotCache = new WeakMap();
function shotsFor(G){
  let c = shotCache.get(G);
  if (!c || c.seed !== G.seed || c.len !== G.len){ c = { seed: G.seed, len: G.len, shots: poolShots(G, TURN.pool) }; shotCache.set(G, c); }
  return c.shots;
}
// Ball positions at seconds c into shot s (the balls start rolling at the strike, 2.2 s in).
const STRIKE = 2.2, ROLL = 1.1;
function poolBalls(G){
  const T = TURN.pool, k = clock(G, T), shots = shotsFor(G), s = shots[Math.min(k.n, shots.length - 1)];
  if (!s) return { balls: rack(), k };
  const r = (k.c - STRIKE) / ROLL;
  if (G.done) return { balls: s.after, k };
  if (r <= 0) return { balls: s.before, k, shot: s };
  const balls = s.before.map(b => ({ ...b }));
  for (const m of s.moves){
    const u = clamp01((r - m.t0) / (m.t1 - m.t0)), e = 1 - (1 - u) * (1 - u);
    if (r < m.t0) continue;
    balls[m.i] = { u: lerp(m.from.u, m.to.u, e), v: lerp(m.from.v, m.to.v, e), in: false, sink: m.to.in ? seg(u, 0.85, 1) : 0, spin: e };
    if (u >= 1) balls[m.i] = { ...m.to };
  }
  return { balls, k, shot: s, r };
}
// Where the shooter stands for shot s: behind the cue ball on the line of the shot, just off the table.
function poolStance(d, s){
  const P = poolGeom(d), cb = s.before[0], tg = s.target ? s.before[s.target] : { u: 0.7, v: 0.5 };
  const c = P.at(cb.u, cb.v), tp = P.at(tg.u, tg.v);
  let dx = tp.x - c.x, dy = tp.y - c.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  // Walk back from the cue ball (on the floor: the top surface sits H above it) until clear of the table.
  const fx = c.x, fy = c.y + P.H;
  let x = fx, y = fy;
  for (let i = 0; i < 60; i++){ x -= dx * 0.05; y -= dy * 0.05; if (x < P.X0 - 0.14 || x > P.X1 + 0.14 || y < P.Y0 - 0.12 || y > P.Y1 + 0.18) break; }
  x = Math.max(d.x + 0.12, Math.min(d.x + 2.88, x)); y = Math.max(d.y + 0.2, Math.min(d.y + 2.85, y));
  return { x, y, dx, dy };
}
function poolBall(x, y, i, sink = 0, spin = 0){
  const r = BALL_R * (1 - sink * 0.6);
  if (sink >= 1) return;
  if (!sink){ ell(x + 0.01, y + r * 0.8, r * 0.9, r * 0.35); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); }
  circ(x, y, r); g.fillStyle = POOL_COLS[i]; g.fill(); g.strokeStyle = 'rgba(30,20,20,.55)'; g.lineWidth = 0.008; g.stroke();
  if (i === 9){ g.save(); circ(x, y, r); g.clip(); g.fillStyle = '#f8f5ec'; g.fillRect(x - r, y - r, r * 2, r * 0.55); g.fillRect(x - r, y + r * 0.45, r * 2, r * 0.6); g.restore(); }
  if (i){ circ(x + Math.cos(spin * 20) * r * 0.25, y - r * 0.1, r * 0.38); g.fillStyle = '#fbf8f0'; g.fill(); if (r > 0.03) text(String(i), x + Math.cos(spin * 20) * r * 0.25, y - r * 0.1, r * 0.55, '#1d1d1d', 700); }
  circ(x - r * 0.35, y - r * 0.4, r * 0.25); g.fillStyle = 'rgba(255,255,255,.65)'; g.fill();
}
function poolCue(x0, y0, x1, y1){
  g.lineCap = 'round';
  g.strokeStyle = OUT; g.lineWidth = 0.04; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  const mx = lerp(x0, x1, 0.6), my = lerp(y0, y1, 0.6);
  g.strokeStyle = '#e6c78f'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(mx, my); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = '#3d2219'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(x0, y0); g.lineTo(mx, my); g.stroke();
  circ(x1, y1, 0.012); g.fillStyle = '#5b8fa8'; g.fill();
}
function poolTable(d, t, G){
  const P = poolGeom(d);
  shadow(d.x + 1.5, P.Y1 + 0.02, 1.35, 0.14, 0.2);
  // Legs, the apron, the rails.
  for (const lx of [P.X0 + 0.12, P.X1 - 0.24]) for (const ly of [P.Y0 + 0.2, P.Y1 - 0.06]){ rr(lx, ly - 0.3, 0.12, 0.3, 0.03); fs('#3d2219', 0.02); }
  box(P.X0, P.Y0, P.X1 - P.X0, P.Y1 - P.Y0 - 0.15, 0.16, WALNUT, '#4e2c20', 0.24, 0.06);
  rr(P.X0, P.Y0 - P.H, P.X1 - P.X0, P.Y1 - P.Y0, 0.08); fs('#6b3f2a', 0.035);
  for (const [u, v] of [[0.25, 0], [0.75, 0], [0.25, 1], [0.75, 1], [0, 0.5], [1, 0.5]]){ const p = P.at(u, v); circ(p.x + (u === 0 ? -0.08 : u === 1 ? 0.08 : 0), p.y + (v === 0 ? -0.08 : v === 1 ? 0.08 : 0), 0.016); g.fillStyle = '#f2e6c8'; g.fill(); }
  // The felt, with a lamp's pool of light on it.
  rr(P.fx0, P.fy0, P.fx1 - P.fx0, P.fy1 - P.fy0, 0.03); fs('#1f7a4d', 0.02);
  g.save(); rr(P.fx0, P.fy0, P.fx1 - P.fx0, P.fy1 - P.fy0, 0.03); g.clip();
  const gl = g.createRadialGradient((P.fx0 + P.fx1) / 2, (P.fy0 + P.fy1) / 2, 0.1, (P.fx0 + P.fx1) / 2, (P.fy0 + P.fy1) / 2, 1.2); gl.addColorStop(0, 'rgba(255,240,180,.25)'); gl.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gl; g.fillRect(P.fx0, P.fy0, 3, 2);
  const hs = P.at(0.25, 0.5); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 0.008; g.beginPath(); g.moveTo(hs.x, P.fy0); g.lineTo(hs.x, P.fy1); g.stroke();
  g.restore();
  for (const [u, v] of POCKETS){ const p = P.at(u, v); circ(p.x, p.y, 0.065); fs('#141014', 0.015); }
  // The balls.
  let balls = rack(), stick = !G || !G.on;
  if (G && G.on){ const st = poolBalls(G); balls = st.balls; }
  if (stick){
    // The wooden rack still sitting round the balls.
    const a = P.at(0.66, 0.5), b = P.at(0.89, 0.24), c = P.at(0.89, 0.76);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.closePath(); g.strokeStyle = '#8a5a3a'; g.lineWidth = 0.025; g.stroke();
  }
  const order = balls.map((b, i) => ({ ...b, i })).filter(b => !b.in).sort((a, b) => a.v - b.v);
  for (const b of order){ const p = P.at(b.u, b.v); poolBall(p.x, p.y, b.i, b.sink || 0, b.spin || 0); }
  if (stick){ const p = P.at(0.12, 0.85); poolCue(p.x - 0.3, p.y + 0.05, p.x + 1.0, p.y - 0.12); }
  // The pocketed balls line up in the return tray on the front.
  if (G && G.on){ const inn = balls.map((b, i) => b.in && i ? i : 0).filter(Boolean); inn.forEach((i, k) => poolBall(P.X0 + 0.25 + k * 0.1, P.Y1 - 0.29, i)); }
  // The lamp above: a long green shade on chains.
  const lx = d.x + 1.5, ly = P.Y0 - 1.4;
  g.strokeStyle = '#2b2230'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(lx - 0.5, ly - 1.0); g.lineTo(lx - 0.5, ly); g.moveTo(lx + 0.5, ly - 1.0); g.lineTo(lx + 0.5, ly); g.stroke();
  rr(lx - 0.7, ly, 1.4, 0.16, 0.06); fs('#2e6b4a', 0.03); rr(lx - 0.66, ly + 0.12, 1.32, 0.05, 0.02); fs('#fff2c4', 0.015);
}
function poolPose(d, slot, G, t){
  const sp = gameSpots(d)[slot];
  if (!G || !G.on) return { x: sp.x, y: sp.y, o: { back: true }, after: () => cueUpright(sp) };
  if (G.done) return { ...endPose(G, slot, sp), after: () => cueUpright(sp) };
  const T = TURN.pool, k = clock(G, T), shots = shotsFor(G), s = shots[Math.min(k.n, shots.length - 1)];
  if (k.who !== slot || !s) return { x: sp.x, y: sp.y, o: { back: true, mood: s && s.make && k.c > 3.0 ? 'happy' : undefined }, after: () => cueUpright(sp) };
  const st = poolStance(d, s), c = k.c;
  if (c < 1.0){ const w = walkPose(sp, st, c); return { ...w, after: () => cueUpright({ x: w.x, y: w.y }) }; }
  if (c > 3.4){ const w = walkPose(st, sp, (c - 3.4) / 0.8); return { ...w, after: () => cueUpright({ x: w.x, y: w.y }) }; }
  const P = poolGeom(d), front = st.y > P.Y1 - 0.05;
  const o = { crouch: c < 2.6 ? seg(c, 1.0, 1.3) * 0.38 : 0.38 * (1 - seg(c, 2.6, 3.0)), mood: c > 2.9 && s.make ? 'happy' : undefined };
  if (Math.abs(st.dy) >= Math.abs(st.dx) * 0.7){ o.back = st.dy < 0; } else { o.reachSide = true; o.flip = st.dx < 0; }
  if (c > 2.9 && s.make && hash(G.seed, k.n, 99) < 0.5) o.cheer = true;
  const draw = () => poolShooterCue(d, s, st, c);
  return { x: st.x, y: st.y, o, after: front ? draw : undefined, behind: !front && draw };
}
// The shooter's cue: lined up behind the cue ball, two practice strokes, then the shot.
function poolShooterCue(d, s, st, c){
  if (c < 1.0 || c > 3.0) return;
  const P = poolGeom(d), cb = P.at(s.before[0].u, s.before[0].v);
  let stroke = 0;
  if (c < 2.0) stroke = 0.08 + Math.sin((c - 1.0) * Math.PI * 2) * 0.06;
  else if (c < STRIKE) stroke = 0.08 + seg(c, 2.0, 2.15) * 0.12 - seg(c, 2.15, STRIKE) * 0.24;
  else stroke = -0.04 + seg(c, STRIKE, 2.8) * 0.12;
  const hx = st.x + st.dx * 0.22, hy = st.y - 0.5;
  let ux = cb.x - hx, uy = cb.y - hy; const l = Math.hypot(ux, uy) || 1; ux /= l; uy /= l;
  const tip = { x: cb.x - ux * (0.07 + stroke), y: cb.y - uy * (0.07 + stroke) };
  poolCue(tip.x - ux * 1.15, tip.y - uy * 1.15, tip.x, tip.y);
}
function cueUpright(p){ poolCue(p.x + 0.2, p.y - 0.02, p.x + 0.26, p.y - 1.15); }

/* ---------- Foosball ---------- */
// Long end to end, top to bottom, with the goals at the ends: red defends the far goal, blue the near one. The
// players stand at the sides on their handles; the ball zips between the rods, and the beads count the goals.
function foosGeom(d){
  const X0 = d.x + 0.48, X1 = d.x + 1.52, Y0 = d.y + 0.3, Y1 = d.y + 1.55, H = 0.46;
  return { X0, X1, Y0, Y1, H, at: (u, v) => ({ x: lerp(X0 + 0.08, X1 - 0.08, u), y: lerp(Y0 + 0.06, Y1 - 0.1, v) - H }) };
}
const RODS = [0.06, 0.19, 0.33, 0.46, 0.56, 0.7, 0.83, 0.95];
// Red (slot 0, left) works rods 0,1,3,5; blue (slot 1, right) works 2,4,6,7. Men per rod.
const ROD_TEAM = [0, 0, 1, 0, 1, 0, 1, 1], ROD_MEN = [1, 2, 3, 3, 3, 3, 2, 1];
const GOAL_EVERY = 3.4;
// The ball, t seconds into the game: a new waypoint every 0.32 s, and every few seconds a shot into a goal.
function foosBall(G, t){
  const n = Math.floor(t / GOAL_EVERY), c = t - n * GOAL_EVERY, scorer = foosScorer(G, n);
  const step = 0.32, i = Math.floor(c / step), f = (c - i * step) / step;
  const wp = j => {
    if (j <= 0) return { u: 0.5, v: 0.5 };
    if (j * step >= GOAL_EVERY - 0.6) return { u: 0.5, v: scorer === 0 ? 1.08 : -0.08 };   // red scores in the near goal
    return { u: 0.12 + hash(G.seed, n * 31 + j, 1) * 0.76, v: 0.08 + hash(G.seed, n * 31 + j, 2) * 0.84 };
  };
  const a = wp(i), b = wp(i + 1), e = f;
  const goal = c > GOAL_EVERY - 0.6 && c < GOAL_EVERY - 0.05;
  return { u: lerp(a.u, b.u, e), v: lerp(a.v, b.v, e), goal, scorer, n, c, hidden: c > GOAL_EVERY - 0.25 };
}
function foosScorer(G, n){
  if (G.solo){ return n % 2; }
  const w = G.winner ?? 0;
  return hash(G.seed, n, 5) < 0.62 ? w : 1 - w;
}
function foosScore(G, t){
  const s = [0, 0], n = Math.floor(t / GOAL_EVERY);
  for (let i = 0; i < n; i++) s[foosScorer(G, i)]++;
  if (foosBall(G, t).c > GOAL_EVERY - 0.25) s[foosScorer(G, n)]++;
  return s;
}
function foosTable(d, t, G){
  const F = foosGeom(d), on = G && G.on, tt = on ? Math.min(G.t, G.len) : 0;
  shadow(d.x + 1, F.Y1 + 0.02, 0.62, 0.1, 0.2);
  for (const lx of [F.X0 + 0.04, F.X1 - 0.12]) for (const ly of [F.Y0 + 0.12, F.Y1]){ rr(lx, ly - 0.36, 0.08, 0.36, 0.02); fs('#2b2230', 0.02); }
  box(F.X0, F.Y0, F.X1 - F.X0, F.Y1 - F.Y0, 0.22, '#4e2c20', WALNUT, 0.24, 0.05);
  // The pitch, with its white lines and the goals at each end.
  const p0 = F.at(0, 0), p1 = F.at(1, 1);
  rr(F.X0 + 0.04, F.Y0 + 0.02 - F.H, F.X1 - F.X0 - 0.08, F.Y1 - F.Y0 - 0.06, 0.03); fs('#2e8b57', 0.02);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(p0.x, (p0.y + p1.y) / 2); g.lineTo(p1.x, (p0.y + p1.y) / 2); g.stroke();
  circ((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, 0.1); g.stroke();
  for (const v of [0, 1]){ const a = F.at(0.32, v), b = F.at(0.68, v); rr(a.x, a.y - 0.03 + (v ? 0.02 : -0.02), b.x - a.x, 0.06, 0.02); fs('#141014', 0.012); }
  // The ball.
  const ball = on ? foosBall(G, tt) : { u: 0.5, v: 0.5 };
  const rods = () => {
    RODS.forEach((v, i) => {
      const p = F.at(0, v), team = ROD_TEAM[i], near = on ? Math.abs(ball.v - v) < 0.1 : false;
      const kick = near ? Math.sin(tt * 30 + i) : on ? Math.sin(tt * 4 + i * 1.7) * 0.25 : 0;
      const slide = on ? Math.sin(tt * 2.3 + i * 2.1) * 0.06 : 0;
      // The rod, through both sides, with its handle out on the player's side.
      g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.018; g.beginPath(); g.moveTo(F.X0 - 0.12 + slide, p.y); g.lineTo(F.X1 + 0.12 + slide, p.y); g.stroke();
      const hx = team ? F.X1 + 0.12 + slide : F.X0 - 0.12 + slide;
      rr(hx - 0.07, p.y - 0.025, 0.14, 0.05, 0.02); fs('#2b2230', 0.01);
      const n = ROD_MEN[i];
      for (let m = 0; m < n; m++){
        const mx = lerp(F.X0 + 0.2, F.X1 - 0.2, n === 1 ? 0.5 : m / (n - 1)) + slide;
        const col = TEAM[team];
        // A little man, kicking forward or back as the rod spins.
        const lean = kick * 0.07 * (team ? -1 : 1);
        rr(mx - 0.03, p.y - 0.12, 0.06, 0.1, 0.02); fs(col, 0.01);
        circ(mx, p.y - 0.15, 0.025); fs('#f2d2b6', 0.008);
        rr(mx - 0.018, p.y - 0.02 + lean * 0.3, 0.036, 0.06 + Math.abs(lean), 0.01); fs(shade(col, -0.3), 0.008);
      }
    });
  };
  // Draw the far rods, the ball, then the near rods so the ball sits among them.
  if (on && !ball.hidden){ const bp = F.at(clamp01(ball.u), Math.max(-0.05, Math.min(1.05, ball.v))); circ(bp.x, bp.y + 0.01, 0.028); fs('#fbf8f0', 0.012); }
  rods();
  // Goal beads on wires at each end, and a GOAL! flash.
  const sc = on ? foosScore(G, tt) : [0, 0];
  for (const [team, v] of [[0, 1], [1, 0]]){
    const a = F.at(0.15, v), y = a.y + (v ? 0.12 : -0.12);
    g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.008; g.beginPath(); g.moveTo(a.x - 0.05, y); g.lineTo(a.x + 0.7, y); g.stroke();
    for (let k = 0; k < 5; k++){ circ(k < sc[team] ? a.x + k * 0.05 : a.x + 0.45 + k * 0.05, y, 0.02); fs(TEAM[team], 0.006); }
  }
  if (on && ball.goal){ const a = ball.c - (GOAL_EVERY - 0.6); g.save(); g.globalAlpha = Math.min(1, 1.6 - a * 2.4); g.shadowColor = TEAM[ball.scorer]; g.shadowBlur = 8; text('GOAL!', d.x + 1, F.Y0 - F.H - 0.35 - a * 0.2, 0.15, '#ffd23f', 700); g.restore(); }
}
function foosPose(d, slot, G, t){
  const sp = gameSpots(d)[slot];
  const base = { reachSide: true, flip: slot === 1 };
  if (!G || !G.on) return { x: sp.x, y: sp.y, o: { flip: slot === 1, sitSide: false } };
  if (G.done) return endPose(G, slot, sp);
  if (G.solo && G.players[slot] === null) return { x: sp.x, y: sp.y, o: base };
  const tt = Math.min(G.t, G.len), b = foosBall(G, tt);
  if (b.c > GOAL_EVERY - 0.35 && b.c < GOAL_EVERY + 0.4 - 0.4 && b.scorer === slot) return { x: sp.x, y: sp.y, o: { cheer: true, mood: 'happy', flip: slot === 1 } };
  const jig = Math.sin(t * 17 + slot * 2) * 0.02;
  return { x: sp.x + jig, y: sp.y, o: { ...base, crouch: 0.12 } };
}

/* ---------- Shuffleboard ---------- */
// A long polished table. Each turn one puck is slid from the left end; the closer it stops to the far end the more
// it scores (1, 2, 3, and 4 hanging over the edge), and it can knock an opponent's puck on or off.
function shufGeom(d){
  const X0 = d.x + 0.15, X1 = d.x + 3.85, Y0 = d.y + 0.25, Y1 = d.y + 0.9, H = 0.4;
  return { X0, X1, Y0, Y1, H, at: (u, v) => ({ x: lerp(X0 + 0.12, X1 - 0.1, u), y: lerp(Y0 + 0.08, Y1 - 0.12, v) - H }) };
}
// Every puck slid so far: where it ended up (u along the table, v across), whose it is, and whether it fell off.
function shufPucks(G, upTo){
  const pucks = [];
  for (let n = 0; n <= upTo; n++){
    const who = turnOf(G, n, TURN.shuffle), r = k => hash(G.seed, n, k);
    const last = n === Math.floor((G.len - 0.01) / TURN.shuffle);
    let u = last ? 0.95 + r(1) * 0.03 : 0.62 + r(1) * 0.38, v = 0.25 + r(2) * 0.5;
    const hit = pucks.find(p => !p.off && Math.abs(p.u - u) < 0.06 && Math.abs(p.v - v) < 0.22);
    pucks.push({ n, who, u, v, from: 0.04, hit: hit ? hit.idx : -1, idx: pucks.length, off: u > 1.0 });
    if (hit){ hit.knockN = n; hit.knockFrom = hit.u; hit.u += 0.1 + r(3) * 0.08; hit.v = clamp01(hit.v + (r(4) - 0.5) * 0.3); if (hit.u > 1.0) hit.off = true; }
  }
  return pucks;
}
const shufPoints = u => u > 1 ? 0 : u > 0.985 ? 4 : u > 0.9 ? 3 : u > 0.8 ? 2 : u > 0.68 ? 1 : 0;
function shufTable(d, t, G){
  const S = shufGeom(d);
  shadow(d.x + 2, S.Y1 + 0.03, 1.95, 0.12, 0.2);
  for (const lx of [S.X0 + 0.1, d.x + 1.95, S.X1 - 0.22]){ rr(lx, S.Y1 - 0.3, 0.12, 0.3, 0.03); fs('#3d2219', 0.02); }
  box(S.X0, S.Y0, S.X1 - S.X0, S.Y1 - S.Y0, 0.14, WALNUT, '#4e2c20', 0.26, 0.05);
  // The playing surface: glossy maple, a sprinkle of sawdust, the scoring lines and numbers at the far end.
  rr(S.X0 + 0.05, S.Y0 - S.H + 0.04, S.X1 - S.X0 - 0.1, S.Y1 - S.Y0 - 0.1, 0.04); fs('#e9c48f', 0.02);
  g.save(); rr(S.X0 + 0.05, S.Y0 - S.H + 0.04, S.X1 - S.X0 - 0.1, S.Y1 - S.Y0 - 0.1, 0.04); g.clip();
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(S.X0, S.Y0 - S.H + 0.08, S.X1 - S.X0, 0.05);
  for (let k = 0; k < 40; k++){ circ(S.X0 + hash(d.id, k, 1) * (S.X1 - S.X0), S.Y0 - S.H + 0.05 + hash(d.id, k, 2) * 0.55, 0.008); g.fillStyle = 'rgba(160,120,60,.35)'; g.fill(); }
  g.restore();
  for (const [u, n] of [[0.68, '1'], [0.8, '2'], [0.9, '3']]){
    const a = S.at(u, 0), b = S.at(u, 1);
    g.strokeStyle = 'rgba(120,40,30,.6)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(a.x, a.y - 0.04); g.lineTo(b.x, b.y + 0.06); g.stroke();
    const c = S.at(u + 0.05, 0.5); text(n, c.x, c.y, 0.11, 'rgba(120,40,30,.6)', 700);
  }
  // The gutter at the end.
  rr(S.X1 - 0.08, S.Y0 - S.H + 0.02, 0.1, S.Y1 - S.Y0 - 0.06, 0.02); fs('#2b2230', 0.015);
  // The scoreboard: a little light-up box on a post at the far end.
  const bx = S.X1 - 0.5, by = S.Y0 - S.H - 0.55;
  rr(bx + 0.22, by + 0.3, 0.04, 0.3, 0.01); fs('#2b2230', 0.01);
  rr(bx - 0.05, by - 0.04, 0.6, 0.36, 0.05); fs('#1d1420', 0.025);
  const on = G && G.on, tt = on ? Math.min(G.t, G.len) : 0, k = on ? clock(G, TURN.shuffle) : null;
  const done = n => !k || n < k.n || k.c > 1.9;
  const pucks = on ? shufPucks(G, k.n) : [];
  const score = [0, 0];
  for (const p of pucks) if (done(p.n) && !p.off) score[p.who] += shufPoints(p.u);
  for (let s = 0; s < 2; s++){ rr(bx + 0.02 + s * 0.27, by + 0.02, 0.22, 0.2, 0.03); fs('#2a0f12', 0.012); text(String(score[s]), bx + 0.13 + s * 0.27, by + 0.12, 0.13, s ? '#7fb3ff' : '#ff6b6b', 700); }
  if (G && G.done && !G.solo){ const w = G.winner ?? 0; g.save(); g.globalAlpha = Math.floor(t * 4) % 2 ? 1 : 0.4; text('WIN', bx + 0.13 + w * 0.27, by + 0.27, 0.06, '#ffd23f', 700); g.restore(); }
  // The pucks: each one glides out from the left end and slows to a stop; a knocked puck jumps forward.
  if (!on){ for (const [u, v, s] of [[0.04, 0.3, 0], [0.04, 0.55, 1], [0.08, 0.42, 0], [0.08, 0.68, 1]]){ const p = S.at(u, v); puck(p.x, p.y, TEAM[s]); } return; }
  for (const p of pucks){
    let u = p.u, v = p.v, vis = true;
    if (p.n === k.n){ const r = (k.c - 1.0) / 1.0; if (r < 0) { u = 0.0; v = 0.5; vis = k.c > 0.45; } else u = lerp(p.from, p.u, 1 - (1 - clamp01(r)) ** 2.4); }
    if (p.knockN !== undefined){ if (p.knockN > k.n || (p.knockN === k.n && k.c < 1.6)) u = p.knockFrom; else if (p.knockN === k.n && k.c < 1.9) u = lerp(p.knockFrom, p.u, seg(k.c, 1.6, 1.9)); }
    if (p.off && (p.n < k.n || k.c > 2.0) && !(p.knockN !== undefined && (p.knockN > k.n || (p.knockN === k.n && k.c < 1.9)))) continue;
    if (!vis) continue;
    const at = S.at(Math.min(u, 1.02), v);
    if (p.n === k.n && k.c > 1.0 && k.c < 2.0) for (let q = 1; q < 4; q++){ const tr = S.at(Math.max(0, u - q * 0.025), v); g.save(); g.globalAlpha = 0.12 * (4 - q); circ(tr.x, tr.y, 0.05); g.fillStyle = TEAM[p.who]; g.fill(); g.restore(); }
    puck(at.x, at.y, TEAM[p.who]);
  }
}
function puck(x, y, col){
  ell(x, y + 0.025, 0.06, 0.025); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill();
  cylinder(x, y + 0.01, 0.055, 0.03, '#a0a8b0', col);
  ell(x - 0.015, y - 0.03, 0.025, 0.01); g.fillStyle = 'rgba(255,255,255,.4)'; g.fill();
}
function shufPose(d, slot, G, t){
  const sp = gameSpots(d)[slot], shoot = { x: d.x + 0.32, y: d.y + 1.22 };
  if (!G || !G.on) return { x: sp.x, y: sp.y, o: { flip: false } };
  if (G.done) return endPose(G, slot, sp);
  const k = clock(G, TURN.shuffle), c = k.c;
  if (k.who !== slot) return { x: sp.x, y: sp.y, o: { back: false, flip: false, mood: c > 1.8 && c < 2.6 && hash(G.seed, k.n, 9) < 0.4 ? 'happy' : undefined } };
  if (c < 0.45) return walkPose(sp, shoot, c / 0.45);
  if (c < 2.3){
    // Lean over the table, puck under the fingertips, a couple of practice slides, then the push.
    const lean = seg(c, 0.45, 0.7) * (1 - seg(c, 1.8, 2.2));
    const push = c > 0.95 && c < 1.25;
    const after = c < 1.0 ? () => { const S = shufGeom(d), p = S.at(0.0 + Math.sin(c * 9) * 0.01, 0.5); puck(p.x, p.y, TEAM[slot]); } : undefined;
    return { x: shoot.x + (push ? 0.08 : 0), y: shoot.y, o: { reachSide: true, flip: false, crouch: 0.32 * lean, mood: c > 1.9 && shufPoints(shufPucks(G, k.n)[k.n].u) >= 3 ? 'happy' : undefined }, after };
  }
  return walkPose(shoot, sp, (c - 2.3) / 0.6);
}

/* ---------- Pinball ---------- */
// A cabinet with a tall lit backbox; the slanted playfield shows the ball ricocheting off the bumpers, the
// flippers flicking it back up, the score ticking over, and JACKPOT (or, now and then, TILT) flashing.
function pinGeom(d){
  const x0 = d.x + 0.16, x1 = d.x + 0.84;
  // Playfield corners: back edge high, front edge low.
  return { x0, x1, by: d.y + 0.32 - 0.92, fy: d.y + 1.22 - 0.6, at(u, v){ return { x: lerp(x0 + 0.06, x1 - 0.06, u), y: lerp(this.by + 0.06, this.fy - 0.06, v) }; } };
}
const BUMPERS = [[0.3, 0.3], [0.7, 0.3], [0.5, 0.48]];
function pinBall(tt, seed){
  // A lively bounce: a sum of sines, kept inside the playfield, dropping to the flippers every couple of seconds.
  const k = tt % 2.4, drop = k > 1.8 ? (k - 1.8) / 0.6 : 0;
  let u = 0.5 + Math.sin(tt * 3.1 + seed) * 0.32 + Math.sin(tt * 7.3) * 0.08;
  let v = 0.35 + Math.sin(tt * 2.3 + seed * 2) * 0.22 + Math.cos(tt * 5.1) * 0.06;
  v = lerp(v, 0.9, drop); u = lerp(u, 0.5 + Math.sin(tt) * 0.12, drop);
  return { u: clamp01(u), v: clamp01(v), flip: k < 0.15 || k > 2.25 };
}
function pinball(d, t, G){
  const P = pinGeom(d), on = G && G.on, tt = on ? Math.min(G.t, G.len) : t * 0.3, x = d.x;
  shadow(x + 0.5, d.y + 1.28, 0.45, 0.1, 0.2);
  for (const lx of [P.x0 + 0.02, P.x1 - 0.08]) for (const ly of [d.y + 0.45, d.y + 1.25]){ rr(lx, ly - 0.42, 0.06, 0.42, 0.02); fs('#c0c6cc', 0.015); }
  // The cabinet sides and front.
  g.beginPath(); g.moveTo(P.x0, P.by); g.lineTo(P.x1, P.by); g.lineTo(P.x1, P.fy + 0.22); g.lineTo(P.x0, P.fy + 0.22); g.closePath(); fs('#3a1d5c', 0.035);
  rr(P.x0, P.fy, P.x1 - P.x0, 0.22, 0.03); fs('#5b2a8c', 0.03);
  rr(x + 0.42, P.fy + 0.06, 0.16, 0.08, 0.02); fs(BRASS, 0.012);
  for (const sx of [P.x0 + 0.03, P.x1 - 0.07]){ rr(sx, P.fy + 0.04, 0.04, 0.06, 0.01); fs('#ff4fa0', 0.008); }
  // The playfield.
  const pf = () => { g.beginPath(); g.moveTo(P.x0 + 0.04, P.by + 0.04); g.lineTo(P.x1 - 0.04, P.by + 0.04); g.lineTo(P.x1 - 0.04, P.fy - 0.02); g.lineTo(P.x0 + 0.04, P.fy - 0.02); g.closePath(); };
  pf(); fs('#1d2a5c', 0.02);
  g.save(); pf(); g.clip();
  const gr = g.createLinearGradient(0, P.by, 0, P.fy); gr.addColorStop(0, 'rgba(255,79,160,.35)'); gr.addColorStop(1, 'rgba(76,201,240,.25)'); g.fillStyle = gr; g.fillRect(P.x0, P.by, 1, 1);
  // Lanes and lit arrows.
  for (let i = 0; i < 4; i++){ const a = P.at(0.2 + i * 0.2, 0.62), lit = on && Math.floor(tt * 6 + i) % 4 === 0; g.beginPath(); g.moveTo(a.x, a.y - 0.03); g.lineTo(a.x + 0.025, a.y + 0.01); g.lineTo(a.x - 0.025, a.y + 0.01); g.closePath(); g.fillStyle = lit ? '#ffd23f' : 'rgba(255,210,63,.3)'; g.fill(); }
  const ball = pinBall(tt, (G && G.seed) || 1);
  for (const [bu, bv] of BUMPERS){
    const p = P.at(bu, bv), hit = on && Math.hypot(ball.u - bu, (ball.v - bv) * 1.6) < 0.16;
    if (hit){ circ(p.x, p.y, 0.09); g.fillStyle = 'rgba(255,240,150,.5)'; g.fill(); }
    circ(p.x, p.y, 0.055); fs(hit ? '#fff6a8' : '#ff4fa0', 0.012); circ(p.x, p.y - 0.01, 0.03); fs('#ffffff', 0.008);
  }
  // The flippers.
  for (const sx of [-1, 1]){
    const p = P.at(0.5 + sx * 0.17, 0.9), up = on && ball.flip ? -0.5 : 0.35;
    g.save(); g.translate(p.x, p.y); g.scale(sx < 0 ? 1 : -1, 1); g.rotate(up);
    rr(0, -0.015, 0.13, 0.03, 0.015); fs('#fbf8f0', 0.01); g.restore();
  }
  if (on){ const b = P.at(ball.u, ball.v); circ(b.x, b.y, 0.025); fs('#e6ecf2', 0.008); circ(b.x - 0.008, b.y - 0.008, 0.008); g.fillStyle = '#fff'; g.fill(); }
  g.restore();
  // The glass and the lockdown bar.
  pf(); g.fillStyle = 'rgba(220,240,255,.1)'; g.fill(); g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.025; g.stroke();
  // The backbox: art, and the score.
  const bx = x + 0.14, bt = P.by - 0.82;
  box(bx, P.by - 0.04, 0.72, 0.1, 0.84, '#2a1250', '#3a1d5c');
  rr(bx + 0.05, bt + 0.06, 0.62, 0.45, 0.04); g.fillStyle = '#1a0d33'; g.fill();
  g.save(); rr(bx + 0.05, bt + 0.06, 0.62, 0.45, 0.04); g.clip();
  for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + tt * (on ? 0.8 : 0.2); g.beginPath(); g.moveTo(bx + 0.36, bt + 0.3); g.arc(bx + 0.36, bt + 0.3, 0.5, a, a + 0.25); g.closePath(); g.fillStyle = 'rgba(255,79,160,.25)'; g.fill(); }
  text('VELVET', bx + 0.36, bt + 0.2, 0.1, '#ffd23f', 700); text('ROSE', bx + 0.36, bt + 0.33, 0.12, '#ff8fab', 700);
  g.restore();
  rr(bx + 0.1, bt + 0.55, 0.52, 0.16, 0.02); fs('#100808', 0.015);
  const score = on ? Math.floor(tt * 2300 + Math.floor(tt / 0.4) * 500) * 10 : 0;
  const k = on ? tt % 4 : 9, tilt = on && (G.seed % 7 === 3) && tt > G.len - 1.6;
  if (tilt){ if (Math.floor(t * 5) % 2) text('TILT', bx + 0.36, bt + 0.63, 0.11, '#ff4f4f', 700); }
  else if (k > 3.1 && k < 3.9 && Math.floor(t * 8) % 2) text('JACKPOT!', bx + 0.36, bt + 0.63, 0.085, '#ffd23f', 700);
  else text(String(score).padStart(7, '0'), bx + 0.36, bt + 0.63, 0.085, '#ff9a4a', 700, 'monospace');
  for (let i = 0; i < 5; i++){ circ(bx + 0.1 + i * 0.13, bt + 0.04, 0.025); g.fillStyle = on && Math.floor(t * 6 + i) % 3 === 0 ? '#ffd23f' : '#6b5a8a'; g.fill(); }
}
function pinPose(d, slot, G, t){
  const sp = gameSpots(d)[0];
  if (!G || !G.on) return { x: sp.x, y: sp.y, o: { back: true } };
  if (G.done) return { x: sp.x, y: sp.y, o: { back: false, cheer: (G.postT || 0) < 1.4, mood: 'happy' } };
  const tt = Math.min(G.t, G.len), b = pinBall(tt, G.seed || 1);
  // Hands on the flipper buttons, a nudge of the hips when the ball drains toward them.
  const nudge = b.v > 0.8 ? Math.sin(t * 22) * 0.03 : 0;
  return { x: sp.x + nudge, y: sp.y, o: { back: true, play: true } };
}

/* ---------- Entry points ---------- */
// The pieces' sort layers: each game's floor bits first, then the table.
export function layers(d, t, add, G){
  const x = d.x, y = d.y;
  switch (d.type){
    case 'darts':
      add(y + 0.05, () => {
        // The throwing mat with its brass oche.
        rr(x + 0.6, y + 0.55, 0.8, 1.95, 0.05); fs('#1f2a24', 0.02);
        g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 0.01; g.beginPath(); for (let k = 1; k < 6; k++){ g.moveTo(x + 0.62, y + 0.55 + k * 0.32); g.lineTo(x + 1.38, y + 0.55 + k * 0.32); } g.stroke();
        rr(x + 0.62, y + 2.14, 0.76, 0.05, 0.02); fs(BRASS, 0.012);
      });
      add(y + 0.36, () => dartsBoard(d, t, G));
      return;
    case 'pool': {
      const P = poolGeom(d);
      // Anyone shooting from behind the table has their cue drawn over the felt.
      add(P.Y1, () => {
        poolTable(d, t, G);
        if (G && G.on && !G.done){ const k = clock(G, TURN.pool), s = shotsFor(G)[Math.min(k.n, shotsFor(G).length - 1)]; if (s){ const st = poolStance(d, s); if (st.y <= P.Y1 - 0.05 && st.x >= P.X0 + 0.05 && st.x <= P.X1 - 0.05) poolShooterCue(d, s, st, k.c); } }
      });
      return;
    }
    case 'foosball': add(foosGeom(d).Y1, () => foosTable(d, t, G)); return;
    case 'shuffle': add(shufGeom(d).Y1, () => shufTable(d, t, G)); return;
    case 'pinball': add(y + 1.26, () => pinball(d, t, G)); return;
  }
}
// Where to draw a player and how they stand this frame: { x, y, o, after } (after: draw once the person is drawn).
export function playerPose(d, slot, G, p, t){
  let r;
  switch (d.type){
    case 'darts': r = dartsPose(d, slot, G, t); break;
    case 'pool': r = poolPose(d, slot, G, t); break;
    case 'foosball': r = foosPose(d, slot, G, t); break;
    case 'shuffle': r = shufPose(d, slot, G, t); break;
    case 'pinball': r = pinPose(d, slot, G, t); break;
    default: { const sp = gameSpots(d)[slot] || { x: p.x, y: p.y }; r = { x: sp.x, y: sp.y, o: {} }; }
  }
  // Off either end of the pool table, a player is drawn in front of it, never tucked behind the rail (their cue
  // then goes over them too, rather than with the table).
  if (d.type === 'pool'){ const P = poolGeom(d); if (r.x < P.X0 + 0.05 || r.x > P.X1 - 0.05){ r.sortY = Math.max(r.y, P.Y1 + 0.01); if (r.behind) r.after = r.behind; } }
  if (r.behind) delete r.behind;
  return r;
}
