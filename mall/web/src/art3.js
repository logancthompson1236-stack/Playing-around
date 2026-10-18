// v0.15 painters: the casino floor. Slot machines, the table games (blackjack, roulette, poker, craps) with their
// stools, cards, chips, dice and wheel, the prize wheel, casino decor, and the casino stores' pieces.
// Same conventions as art.js: tile units, drawn on art.js's current `g`.
import { g, PPT, rr, circ, ell, fs, box, shadow, text, storeIcon, mulberry, OUT } from './art.js';

const GOLD = '#f2c14e', FELT = '#1f7a4d', RED = '#d62839', CHIPS = ['#d62839', '#1d3557', '#2f9e6a', '#f2c14e', '#fffaf3', '#7b2cbf'];
const bulbs = (x0, y0, x1, y1, n, t, r = 0.035) => {
  for (let i = 0; i < n; i++){ const k = i / (n - 1); circ(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r); g.fillStyle = Math.floor(t * 6 + i) % 2 ? '#fff6c9' : '#ffb703'; g.fill(); }
};
export function chip(x, y, c, r = 0.07){
  ell(x, y + 0.012, r, r * 0.5); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill();
  ell(x, y, r, r * 0.5); fs(c, 0.015);
  ell(x, y, r * 0.55, r * 0.27); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 0.012; g.setLineDash([0.02, 0.02]); g.stroke(); g.setLineDash([]);
}
function chipStack(x, y, n, c){ for (let i = 0; i < n; i++) chip(x, y - i * 0.025, c, 0.06); }
function card(x, y, faceUp = true, rot = 0, suit = 0){
  g.save(); g.translate(x, y); g.rotate(rot);
  rr(-0.07, -0.05, 0.14, 0.1, 0.015); fs(faceUp ? '#fffaf3' : '#9b2335', 0.012);
  if (faceUp) text(['♠', '♥', '♣', '♦'][suit % 4], 0, 0.004, 0.075, suit % 2 ? '#d62839' : '#2b2230', 700);
  else { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 0.01; g.strokeRect(-0.05, -0.035, 0.1, 0.07); }
  g.restore();
}

/* ---------- Slot machines ---------- */
// The reels spin while someone's playing (live.k runs 0..1), the lever comes down at the start, and they land on
// three of a kind now and then.
export function slotMachine(x, y, r, t, live, gold = false){
  const cx = x + 0.5, base = y + 0.3, k = live ? live.k : -1;
  shadow(cx, y + 0.86, 0.38, 0.1);
  const body = gold ? '#e0a526' : '#c1121f', side = gold ? '#b8821b' : '#8f0d17', trim = gold ? '#fff3b0' : GOLD;
  box(x + 0.16, base, 0.68, 0.55, 0.62, gold ? '#f5d77a' : '#e5383b', r === 2 ? side : body);
  const top = base + 0.55 - 0.62 - 0.72;
  rr(x + 0.14, top, 0.72, 0.74, 0.12); fs(r === 2 ? side : body, 0.04);
  rr(x + 0.12, top - 0.2, 0.76, 0.24, 0.1); fs(gold ? '#2b2230' : '#3c096c', 0.035);
  text(gold ? 'GOLD' : '777', cx, top - 0.08, 0.13, trim, 700);
  bulbs(x + 0.2, top - 0.22, x + 0.8, top - 0.22, 5, t + (live ? t * 2 : 0));
  if (r === 0){
    // The reel window.
    rr(x + 0.22, top + 0.16, 0.56, 0.3, 0.04); fs('#fffaf3', 0.03);
    const sym = ['7', '🍒', '★', 'BAR', '🔔'], spin = k >= 0 && k < 0.82, land = k >= 0.82 ? live.win : null;
    for (let i = 0; i < 3; i++){
      const rx = x + 0.31 + i * 0.19;
      if (spin){ for (let j = 0; j < 3; j++){ const yy = top + 0.18 + ((t * 9 + i * 0.37 + j / 3) % 1) * 0.3; g.fillStyle = 'rgba(60,40,60,.5)'; g.fillRect(rx - 0.05, yy, 0.1, 0.03); } }
      else { const s = land ? '7' : sym[(Math.floor((live ? live.seed : 0) * 7) + i * 2 + (x | 0)) % 3]; text(s === '🍒' ? '●' : s === '🔔' ? '♪' : s, rx, top + 0.31, s === 'BAR' ? 0.07 : 0.13, s === '7' ? RED : s === '★' ? '#e0a526' : '#3c096c', 700); }
    }
    g.strokeStyle = 'rgba(60,40,60,.35)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(x + 0.405, top + 0.17); g.lineTo(x + 0.405, top + 0.45); g.moveTo(x + 0.595, top + 0.17); g.lineTo(x + 0.595, top + 0.45); g.stroke();
    if (land){ g.save(); g.globalAlpha = Math.abs(Math.sin(t * 12)); rr(x + 0.2, top + 0.14, 0.6, 0.34, 0.05); g.strokeStyle = '#ffd23f'; g.lineWidth = 0.05; g.stroke(); g.restore(); }
    rr(x + 0.24, top + 0.52, 0.52, 0.12, 0.03); fs('#2b2230', 0.02);
    for (let i = 0; i < 3; i++){ circ(x + 0.33 + i * 0.17, top + 0.58, 0.035); fs(['#ffd23f', '#2f9e6a', RED][i], 0.012); }
  } else if (r !== 2){ rr(r === 1 ? x + 0.16 : x + 0.76, top + 0.16, 0.08, 0.3, 0.02); fs('#fffaf3', 0.02); }
  // The lever on the side, pulled down at the start of a spin.
  const lx = r === 3 ? x + 0.1 : x + 0.9, pull = k >= 0 && k < 0.18 ? Math.sin(k / 0.18 * Math.PI) : 0;
  g.beginPath(); g.moveTo(lx, top + 0.5); g.lineTo(lx, top + 0.12 + pull * 0.32); g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.035; g.stroke();
  circ(lx, top + 0.1 + pull * 0.32, 0.05); fs(RED, 0.025);
}

/* ---------- Table games (3×2) ---------- */
// state: { seats: [{ k: 0..1 progress, win, done } | null ×3], dealer: bool }
function stools(d){
  for (let i = 0; i < 3; i++){ const sx = d.x + 0.55 + i * 0.95, sy = d.y + 2.3; rr(sx - 0.03, sy - 0.32, 0.06, 0.3, 0.02); fs('#5a4a3a', 0.02); ell(sx, sy - 0.33, 0.17, 0.07); fs('#9b2335', 0.03); }
}
function tableShell(d, felt, oval){
  shadow(d.x + 1.5, d.y + 1.95, 1.5, 0.16, 0.18);
  const x = d.x + 0.12, y = d.y + 0.72, w = 2.76, h = 1.15, top = y - 0.38;
  for (const lx of [x + 0.25, x + w - 0.3]){ rr(lx, top + h - 0.1, 0.06, 0.48, 0.02); fs('#3d2b35', 0.02); }
  if (oval){
    ell(x + w / 2, top + h / 2 + 0.06, w / 2, h / 2 + 0.06); fs('#5a3a2a', 0.04);
    ell(x + w / 2, top + h / 2, w / 2, h / 2); fs('#7a4a30', 0.04);
    ell(x + w / 2, top + h / 2, w / 2 - 0.14, h / 2 - 0.12); fs(felt, 0.03);
  } else {
    rr(x, top + 0.06, w, h, 0.4); fs('#5a3a2a', 0.04);
    rr(x, top, w, h, 0.4); fs('#7a4a30', 0.04);
    rr(x + 0.12, top + 0.1, w - 0.24, h - 0.22, 0.32); fs(felt, 0.03);
  }
  return { x, y: top, w, h };
}
export function casinoTable(d, t, st){
  const kind = d.type, seats = (st && st.seats) || [null, null, null];
  stools(d);
  const T = tableShell(d, kind === 'craps' ? '#1d5c8a' : FELT, kind === 'poker');
  const sx = i => d.x + 0.55 + i * 0.95, front = T.y + T.h - 0.28;
  if (kind === 'blackjack'){
    g.beginPath(); g.arc(d.x + 1.5, T.y - 0.25, 1.2, 0.35, Math.PI - 0.35); g.strokeStyle = 'rgba(242,193,78,.6)'; g.lineWidth = 0.025; g.stroke();
    text('BLACKJACK PAYS 3 TO 2', d.x + 1.5, T.y + 0.42, 0.07, 'rgba(242,193,78,.85)', 700);
    // The dealer's chip rack and shoe.
    rr(d.x + 1.1, T.y + 0.08, 0.8, 0.14, 0.03); fs('#3d2b35', 0.02); for (let i = 0; i < 6; i++){ rr(d.x + 1.14 + i * 0.12, T.y + 0.1, 0.1, 0.1, 0.02); fs(CHIPS[i], 0.008); }
    rr(d.x + 2.15, T.y + 0.12, 0.26, 0.16, 0.03); fs('#2b2230', 0.02); card(d.x + 2.2, T.y + 0.17, false);
    // Dealer's cards and each player's hand, dealt as the round goes.
    const anyone = seats.some(Boolean);
    if (anyone){ card(d.x + 1.38, T.y + 0.36, false, 0.1); card(d.x + 1.56, T.y + 0.36, true, -0.05, 2); }
    seats.forEach((s, i) => {
      if (!s) return;
      const n = 1 + Math.min(3, Math.floor(s.k * 4));
      for (let c = 0; c < n; c++) card(sx(i) - 0.08 + c * 0.07, front - 0.12 - c * 0.02, true, -0.15 + c * 0.1, i + c);
      const toward = s.done ? (s.win ? 0.12 : -0.4) : 0;
      chipStack(sx(i) + 0.14, front - 0.05 + toward, s.win && s.done ? 4 : 2, CHIPS[i]);
    });
  } else if (kind === 'roulette'){
    // The wheel on the left, spinning while a round is on; the betting layout on the right.
    const wx = d.x + 0.75, wy = T.y + 0.55, spinning = seats.some(s => s && !s.done), sp = spinning ? t * 6 : t * 0.4;
    ell(wx, wy, 0.48, 0.3); fs('#5a3a2a', 0.035); ell(wx, wy, 0.4, 0.24); fs('#2b2230', 0.02);
    for (let i = 0; i < 18; i++){ const a0 = sp + i / 18 * Math.PI * 2, a1 = a0 + Math.PI * 2 / 18; g.beginPath(); g.moveTo(wx, wy); g.ellipse(wx, wy, 0.38, 0.22, 0, a0, a1); g.closePath(); g.fillStyle = i === 0 ? '#2f9e6a' : i % 2 ? RED : '#2b2230'; g.fill(); }
    ell(wx, wy, 0.16, 0.1); fs('#c9a27e', 0.02); circ(wx, wy - 0.04, 0.035); fs(GOLD, 0.012);
    const ba = spinning ? -t * 9 : 1.3; circ(wx + Math.cos(ba) * 0.3, wy + Math.sin(ba) * 0.17, 0.03); fs('#fff', 0.01);
    const gx = d.x + 1.3, gy = T.y + 0.2;
    g.fillStyle = '#2f9e6a'; g.fillRect(gx, gy, 0.14, 0.6);
    for (let c = 0; c < 6; c++) for (let r = 0; r < 3; r++){ g.fillStyle = (c + r) % 2 ? RED : '#2b2230'; g.fillRect(gx + 0.16 + c * 0.2, gy + r * 0.2, 0.18, 0.18); }
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.01; g.strokeRect(gx, gy, 1.36, 0.6);
    seats.forEach((s, i) => { if (!s) return; const n = Math.min(3, 1 + Math.floor(s.k * 3)); for (let c = 0; c < n; c++) chip(gx + 0.3 + i * 0.4 + c * 0.05, gy + 0.15 + (c % 2) * 0.22 + i * 0.04, CHIPS[i], 0.05); });
  } else if (kind === 'poker'){
    text('♠ ♥ POKER ♦ ♣', d.x + 1.5, T.y + 0.3, 0.08, 'rgba(242,193,78,.85)', 700);
    // The pot grows in the middle as the hand goes on; the flop and the turn come out.
    const pot = seats.reduce((a, s) => a + (s ? 1 + Math.floor(s.k * 3) : 0), 0);
    for (let i = 0; i < pot; i++) chip(d.x + 1.35 + (i % 4) * 0.1, T.y + 0.62 - Math.floor(i / 4) * 0.03, CHIPS[i % 6], 0.055);
    const k = Math.max(0, ...seats.map(s => (s ? s.k : 0)));
    for (let c = 0; c < Math.min(5, 1 + Math.floor(k * 5)); c++) card(d.x + 1.05 + c * 0.2, T.y + 0.42, k > 0, 0, c);
    seats.forEach((s, i) => { if (!s) return; chipStack(sx(i) + 0.16, front - 0.04, 3, CHIPS[i + 2]); card(sx(i) - 0.05, front - 0.06, false, -0.1); card(sx(i) + 0.03, front - 0.06, false, 0.1); });
  } else if (kind === 'craps'){
    // The rail, the pass line, and the dice tumbling across when someone throws.
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 0.02; rr(T.x + 0.3, T.y + 0.22, T.w - 0.6, T.h - 0.5, 0.25); g.stroke();
    text('PASS LINE', d.x + 1.5, T.y + T.h - 0.32, 0.09, '#fffaf3', 700);
    text('COME', d.x + 1.5, T.y + 0.45, 0.12, '#ffd23f', 700);
    const roller = seats.findIndex(s => s && !s.done);
    if (roller >= 0){
      const s = seats[roller], k = Math.min(1, Math.max(0, (s.k - 0.35) / 0.35));
      if (s.k > 0.35){
        for (let i = 0; i < 2; i++){
          const dx = sx(roller) + (d.x + 2.4 - sx(roller)) * k + i * 0.12, dy = front - 0.1 - k * 0.55 - Math.sin(k * Math.PI) * 0.25;
          g.save(); g.translate(dx, dy); g.rotate(k < 1 ? t * 14 + i : i * 0.3);
          rr(-0.05, -0.05, 0.1, 0.1, 0.02); fs('#fffaf3', 0.015); circ(0, 0, 0.012); fs(OUT, 0); if (i){ circ(-0.025, -0.025, 0.01); fs(OUT, 0); circ(0.025, 0.025, 0.01); fs(OUT, 0); }
          g.restore();
        }
      }
    }
    seats.forEach((s, i) => { if (s) chipStack(sx(i) + 0.15, front - 0.03, 2, CHIPS[i + 1]); });
  }
  // A little sign when there's no dealer.
  if (st && !st.dealer){ rr(d.x + 1.05, T.y - 0.05, 0.9, 0.24, 0.08); fs('#fffaf3', 0.03); text('CLOSED', d.x + 1.5, T.y + 0.07, 0.12, RED, 700); }
}

/* ---------- Prize wheel (2×1) ---------- */
export function prizeWheel(x, y, t, live){
  const cx = x + 1, cy = y - 0.55, r = 0.62, k = live ? live.k : -1;
  shadow(cx, y + 0.85, 0.7, 0.12);
  for (const px of [x + 0.35, x + 1.6]){ rr(px, y - 0.3, 0.08, 1.15, 0.03); fs('#5a4a3a', 0.025); }
  rr(x + 0.2, y + 0.55, 1.6, 0.3, 0.06); fs('#3c096c', 0.035);
  // Spins up fast, then slows to a stop.
  const ang = k >= 0 ? (1 - Math.pow(1 - k, 3)) * 14 + (live.seed || 0) * 6 : t * 0.15;
  circ(cx, cy, r + 0.08); fs(GOLD, 0.04);
  const cols = [RED, '#ffd23f', '#2f9e6a', '#5a8dee', '#ff4fa0', '#ff9f43', '#7b2cbf', '#fffaf3'];
  for (let i = 0; i < 16; i++){ const a0 = ang + i / 16 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a0, a0 + Math.PI / 8); g.closePath(); g.fillStyle = cols[i % 8]; g.fill(); }
  circ(cx, cy, r); fs(null, 0.035);
  for (let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2 + t * 4; circ(cx + Math.cos(i / 16 * Math.PI * 2) * (r + 0.04), cy + Math.sin(i / 16 * Math.PI * 2) * (r + 0.04), 0.025); g.fillStyle = Math.floor(a) % 2 ? '#fff6c9' : '#ffb703'; g.fill(); }
  circ(cx, cy, 0.12); fs(GOLD, 0.03); text('★', cx, cy + 0.005, 0.12, RED, 700);
  g.beginPath(); g.moveTo(cx - 0.08, cy - r - 0.16); g.lineTo(cx + 0.08, cy - r - 0.16); g.lineTo(cx, cy - r + 0.04); g.closePath(); fs(RED, 0.03);
}

/* ---------- Casino decor ---------- */
export function neonSign(x, y, t){
  shadow(x + 1, y + 0.85, 0.9, 0.1);
  for (const px of [x + 0.3, x + 1.62]){ rr(px, y - 0.2, 0.08, 1.05, 0.03); fs('#3d2b35', 0.025); }
  rr(x + 0.05, y - 1.25, 1.9, 0.95, 0.12); fs('#1b1440', 0.045);
  bulbs(x + 0.15, y - 1.17, x + 1.85, y - 1.17, 12, t); bulbs(x + 0.15, y - 0.38, x + 1.85, y - 0.38, 12, t + 0.5);
  const on = Math.floor(t * 2) % 3 !== 2;
  g.save(); g.shadowColor = '#ff4fa0'; g.shadowBlur = on ? 0.25 * PPT : 0;
  text('CASINO', x + 1, y - 0.86, 0.36, on ? '#ff6fb5' : '#7a2a55', 700);
  g.restore();
  text('★ ★ ★', x + 1, y - 0.55, 0.14, on ? '#ffd23f' : '#7a6a2a', 700);
}
export function velvetRope(x, y){
  shadow(x, y, 0.3, 0.08);
  for (const px of [x - 0.3, x + 0.3]){ ell(px, y - 0.02, 0.09, 0.04); fs('#c9a227', 0.02); rr(px - 0.025, y - 0.6, 0.05, 0.58, 0.02); fs(GOLD, 0.02); circ(px, y - 0.62, 0.05); fs(GOLD, 0.02); }
  g.beginPath(); g.moveTo(x - 0.3, y - 0.55); g.quadraticCurveTo(x, y - 0.32, x + 0.3, y - 0.55); g.strokeStyle = OUT; g.lineWidth = 0.075; g.stroke();
  g.beginPath(); g.moveTo(x - 0.3, y - 0.55); g.quadraticCurveTo(x, y - 0.32, x + 0.3, y - 0.55); g.strokeStyle = '#9b2335'; g.lineWidth = 0.045; g.stroke();
}
export function jackpotBoard(x, y, t){
  shadow(x + 1, y + 0.85, 0.9, 0.1);
  box(x + 0.15, y + 0.4, 1.7, 0.45, 0.5, '#3c096c', '#240046');
  rr(x + 0.08, y - 1.0, 1.84, 0.9, 0.1); fs('#240046', 0.045);
  bulbs(x + 0.16, y - 0.94, x + 1.84, y - 0.94, 11, t);
  text('JACKPOT', x + 1, y - 0.75, 0.16, GOLD, 700);
  rr(x + 0.2, y - 0.62, 1.6, 0.36, 0.04); fs('#10002b', 0.02);
  const amt = 250000 + Math.floor(t * 137) % 99999;
  text('$' + amt.toLocaleString(), x + 1, y - 0.44, 0.2, '#ff4fa0', 700);
}
export function diceStatue(x, y){
  shadow(x, y, 0.36, 0.1);
  box(x - 0.3, y - 0.05, 0.6, 0.3, 0.3, '#2b2230', '#1b1440');
  const die = (dx, dy, s, rot) => {
    g.save(); g.translate(dx, dy); g.rotate(rot);
    rr(-s / 2, -s / 2, s, s, s * 0.18); fs('#f2c14e', 0.035);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-s / 2 + 0.03, -s / 2 + 0.03, s * 0.3, s * 0.15);
    for (const [px, py] of [[-0.25, -0.25], [0.25, 0.25], [0, 0], [0.25, -0.25], [-0.25, 0.25]]){ circ(px * s, py * s, s * 0.08); fs('#7a4a10', 0); }
    g.restore();
  };
  die(x - 0.1, y - 0.62, 0.4, -0.15); die(x + 0.14, y - 0.98, 0.3, 0.35);
}
export function champagneTower(x, y, t){
  shadow(x, y, 0.36, 0.1);
  g.save(); g.translate(x, y); g.scale(1.35, 1.35); g.translate(-x, -y);
  rr(x - 0.28, y - 0.18, 0.56, 0.18, 0.05); fs('#fffaf3', 0.03);
  const glass = (gx, gy) => { g.beginPath(); g.moveTo(gx - 0.07, gy - 0.12); g.lineTo(gx + 0.07, gy - 0.12); g.lineTo(gx, gy - 0.02); g.closePath(); g.fillStyle = '#ffe08a'; g.fill(); g.strokeStyle = 'rgba(61,43,53,.7)'; g.lineWidth = 0.012; g.stroke(); g.beginPath(); g.moveTo(gx, gy - 0.02); g.lineTo(gx, gy + 0.04); g.stroke(); };
  for (let row = 0; row < 4; row++){ const n = 4 - row; for (let i = 0; i < n; i++) glass(x + (i - (n - 1) / 2) * 0.15, y - 0.2 - row * 0.17); }
  // Bubbles, and the overflow trickling down.
  for (let i = 0; i < 5; i++){ const k = (t * 0.6 + i / 5) % 1; circ(x + Math.sin(i * 2 + k * 6) * 0.15, y - 0.3 - k * 0.6, 0.012); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); }
  rr(x - 0.05, y - 0.98, 0.1, 0.22, 0.03); fs('#1f4f2e', 0.02); rr(x - 0.03, y - 1.06, 0.06, 0.09, 0.02); fs(GOLD, 0.015);
  g.restore();
}

/* ---------- Icons and held things ---------- */
export function chipIcon(c){
  circ(0, 0, 0.42); fs(c(RED), 0.07);
  for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; g.save(); g.translate(Math.cos(a) * 0.33, Math.sin(a) * 0.33); g.rotate(a); g.fillStyle = '#fffaf3'; g.fillRect(-0.04, -0.07, 0.08, 0.14); g.restore(); }
  circ(0, 0, 0.22); fs(c('#fffaf3'), 0.05); text('$', 0, 0.01, 0.24, RED, 700);
}
export function cocktailIcon(c){
  g.beginPath(); g.moveTo(-0.36, -0.3); g.lineTo(0.36, -0.3); g.lineTo(0, 0.08); g.closePath(); fs(c('#ff4fa0'), 0.07);
  g.beginPath(); g.moveTo(-0.26, -0.2); g.lineTo(0.26, -0.2); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.04; g.stroke();
  rr(-0.03, 0.06, 0.06, 0.3, 0.02); fs(c('#e9f6fb'), 0.05); ell(0, 0.38, 0.2, 0.06); fs(c('#e9f6fb'), 0.05);
  circ(0.24, -0.36, 0.08); fs(c('#7bd389'), 0.05);
  g.beginPath(); g.moveTo(-0.1, -0.3); g.lineTo(-0.34, -0.6); g.strokeStyle = OUT; g.lineWidth = 0.04; g.stroke(); g.beginPath(); g.arc(-0.34, -0.6, 0.14, Math.PI, 0); g.closePath(); fs(c('#ffd23f'), 0.04);
}
export function cloverIcon(c){
  for (let i = 0; i < 4; i++){ const a = i * Math.PI / 2 + Math.PI / 4; g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-0.32, -0.12, -0.24, -0.46, 0, -0.3); g.bezierCurveTo(0.24, -0.46, 0.32, -0.12, 0, 0); fs(c('#2f9e6a'), 0.06); g.restore(); }
  g.beginPath(); g.moveTo(0.02, 0.05); g.quadraticCurveTo(0.08, 0.3, 0.2, 0.45); g.strokeStyle = OUT; g.lineWidth = 0.07; g.stroke();
  circ(0, 0, 0.06); fs(c(GOLD), 0.03);
}
export function heldCasino(kind, hx, hy){
  if (kind === 'chips'){ for (let i = 0; i < 4; i++) chip(hx, hy - 0.02 - i * 0.03, CHIPS[i], 0.065); return true; }
  if (kind === 'cards'){ for (let i = 0; i < 3; i++) card(hx - 0.04 + i * 0.04, hy - 0.08, false, -0.4 + i * 0.35); return true; }
  if (kind === 'cocktail'){ g.save(); g.translate(hx, hy - 0.12); g.scale(0.2, 0.2); storeIcon('cocktail', 0, 0, 1); g.restore(); return true; }
  return false;
}

/* ---------- Casino stores ---------- */
export function casinoWallpaper(ic, x0, y0, w, H){
  if (ic === 'chip'){ g.fillStyle = '#1b4332'; g.fillRect(x0, y0, w, H); for (let x = x0 + 0.15; x < x0 + w; x += 0.3) for (let y = y0 + 0.15; y < y0 + H; y += 0.3){ circ(x, y, 0.05); g.fillStyle = 'rgba(242,193,78,.35)'; g.fill(); } }
  else if (ic === 'cocktail'){ g.fillStyle = '#240046'; g.fillRect(x0, y0, w, H); g.strokeStyle = 'rgba(255,79,160,.6)'; g.lineWidth = 0.025; for (let y = y0 + 0.1; y < y0 + H; y += 0.25){ g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + w, y); g.stroke(); } }
  else if (ic === 'clover'){ g.fillStyle = '#e9f5db'; g.fillRect(x0, y0, w, H); for (let x = x0 + 0.2; x < x0 + w; x += 0.4) for (let y = y0 + 0.2; y < y0 + H; y += 0.4){ g.save(); g.translate(x, y); g.scale(0.12, 0.12); storeIcon('clover', 0, 0, 1, 'rgba(47,158,106,.35)'); g.restore(); } }
  else return false;
  return true;
}
export function casinoWallPiece(ic, wx, wy, t){
  if (ic === 'chip'){ rr(wx + 0.08, wy - 0.24, 0.74, 0.42, 0.04); fs('#2b2230', 0.035); text('CASHIER', wx + 0.45, wy - 0.1, 0.11, GOLD, 700); bulbs(wx + 0.14, wy + 0.08, wx + 0.76, wy + 0.08, 6, t, 0.025); }
  else if (ic === 'cocktail'){ g.save(); g.shadowColor = '#ff4fa0'; g.shadowBlur = 0.15 * PPT; text('LOUNGE', wx + 0.45, wy - 0.05, 0.16, '#ff6fb5', 700); g.restore(); g.save(); g.translate(wx + 0.45, wy + 0.12); g.scale(0.09, 0.09); storeIcon('cocktail', 0, 0, 1); g.restore(); }
  else if (ic === 'clover'){ rr(wx + 0.12, wy - 0.24, 0.66, 0.42, 0.06); fs('#2d6a4f', 0.035); g.save(); g.translate(wx + 0.45, wy - 0.03); g.scale(0.14, 0.14); storeIcon('clover', 0, 0, 1, GOLD); g.restore(); }
  else return false;
  return true;
}
export function casinoCounter(ic, cx, top){
  if (ic === 'chip'){ for (let i = 0; i < 4; i++) chipStack(cx + 0.1 + i * 0.1, top + 0.1, 3 + (i % 2), CHIPS[i]); }
  else if (ic === 'cocktail'){ for (let i = 0; i < 2; i++){ g.save(); g.translate(cx + 0.14 + i * 0.18, top + 0.02); g.scale(0.11, 0.11); storeIcon('cocktail', 0, 0, 1, i ? '#4cc9f0' : null); g.restore(); } }
  else if (ic === 'clover'){ rr(cx + 0.06, top - 0.02, 0.36, 0.14, 0.03); fs('rgba(220,245,255,.85)', 0.02); for (let i = 0; i < 3; i++){ g.save(); g.translate(cx + 0.13 + i * 0.11, top + 0.05); g.scale(0.06, 0.06); storeIcon('clover', 0, 0, 1, GOLD); g.restore(); } }
  else return false;
  return true;
}
export function casinoBack(ic, x, y, sw, t){
  if (ic === 'chip'){
    // The cage: brass bars over a counter, the cashier's window.
    box(x, y, sw, 0.36, 0.95, '#2b2230', '#1b4332');
    const top = y + 0.36 - 0.95;
    g.strokeStyle = GOLD; g.lineWidth = 0.035; g.beginPath(); for (let bx = x + 0.1; bx < x + sw - 0.05; bx += 0.12){ g.moveTo(bx, top + 0.06); g.lineTo(bx, top + 0.6); } g.stroke();
    rr(x + 0.05, top + 0.02, sw - 0.1, 0.08, 0.03); fs(GOLD, 0.02);
  } else if (ic === 'cocktail'){
    // A glowing back bar with bottles and a neon strip.
    box(x, y, sw, 0.36, 0.9, '#3c096c', '#240046');
    const top = y + 0.36 - 0.9;
    for (let r = 0; r < 2; r++){ g.fillStyle = 'rgba(255,79,160,.7)'; g.fillRect(x + 0.06, top + 0.3 + r * 0.26, sw - 0.12, 0.03); for (let i = 0; i < Math.floor(sw / 0.13); i++){ rr(x + 0.08 + i * 0.13, top + 0.12 + r * 0.26, 0.07, 0.18, 0.02); fs(['#4cc9f0', '#ffd23f', '#7bd389', '#ff9f43', '#e0b0ff'][(i + r) % 5], 0.012); } }
    g.save(); g.globalAlpha = 0.6 + Math.sin(t * 3) * 0.3; g.fillStyle = '#ff4fa0'; g.fillRect(x + 0.05, top + 0.04, sw - 0.1, 0.04); g.restore();
  } else if (ic === 'clover'){
    box(x, y, sw, 0.36, 0.8, '#e9f5db', '#2d6a4f');
    const top = y + 0.36 - 0.8;
    for (let r = 0; r < 3; r++) for (let i = 0; i < Math.floor(sw / 0.24); i++){ const px = x + 0.16 + i * 0.24, py = top + 0.16 + r * 0.22; if ((i + r) % 3 === 0){ g.save(); g.translate(px, py); g.scale(0.08, 0.08); storeIcon('clover', 0, 0, 1, GOLD); g.restore(); } else { rr(px - 0.06, py - 0.06, 0.12, 0.12, 0.02); fs(['#d62839', '#f2c14e', '#1d3557'][(i + r) % 3], 0.012); } }
  } else return false;
  return true;
}
