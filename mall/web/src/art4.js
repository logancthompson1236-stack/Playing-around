// v0.17.2 painters: four more places to shop. Lemon Drop (a lemonade stand), Game Day (sporting goods), Glow Up
// (a beauty bar) and Taco Loco (tacos). Same conventions as art.js: tile units, drawn on art.js's current `g`.
import { g, rr, circ, ell, fs, box, shadow, text, storeIcon, OUT, local, cylinder, shade } from './art.js';

export const ICONS = ['lemon', 'ball', 'lipstick', 'taco'];
const FIESTA = ['#e76f51', '#2ec4b6', '#ffd23f', '#ff5d8f', '#5a8dee', '#7bd389'];
const MAKEUP = ['#ff5d8f', '#c9184a', '#ff8fab', '#ffb3c6', '#9d4edd', '#e85d04', '#fb6f92'];

/* ---------- Icons (the round badge on signs, menus and cards) ---------- */
export function icon(name, c){
  if (name === 'lemon'){
    ell(0, 0.04, 0.42, 0.32, -0.3); fs(c('#ffd23f'), 0.07);
    ell(0.34, -0.16, 0.08, 0.06, -0.3); fs(c('#ffd23f'), 0.05);
    ell(-0.12, -0.08, 0.12, 0.06, -0.3); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
    ell(0.08, -0.38, 0.16, 0.07, -0.6); fs(c('#7bd389'), 0.05);
  } else if (name === 'ball'){
    circ(0, 0, 0.42); fs(c('#ff8c42'), 0.07);
    g.strokeStyle = OUT; g.lineWidth = 0.045; g.beginPath();
    g.moveTo(-0.42, 0); g.lineTo(0.42, 0); g.moveTo(0, -0.42); g.lineTo(0, 0.42);
    g.moveTo(-0.3, -0.3); g.quadraticCurveTo(-0.12, 0, -0.3, 0.3); g.moveTo(0.3, -0.3); g.quadraticCurveTo(0.12, 0, 0.3, 0.3); g.stroke();
    ell(-0.16, -0.2, 0.08, 0.05, -0.6); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill();
  } else if (name === 'lipstick'){
    rr(-0.17, 0.02, 0.34, 0.42, 0.06); fs(c('#f2c14e'), 0.07);
    rr(-0.13, -0.16, 0.26, 0.2, 0.04); fs(c('#d9d4de'), 0.05);
    g.beginPath(); g.moveTo(-0.1, -0.16); g.lineTo(-0.1, -0.42); g.lineTo(0.1, -0.54); g.lineTo(0.1, -0.16); g.closePath(); fs(c('#ff3d7f'), 0.06);
    rr(-0.09, 0.1, 0.05, 0.28, 0.02); g.fillStyle = 'rgba(255,255,255,.4)'; g.fill();
  } else if (name === 'taco'){
    g.beginPath(); g.arc(0, 0.18, 0.44, Math.PI, 0); g.closePath(); fs(c('#f4c95d'), 0.07);
    for (const [x, col] of [[-0.24, '#7bd389'], [-0.08, '#e63946'], [0.1, '#7bd389'], [0.26, '#ffd23f']]){ circ(x, -0.1, 0.12); fs(c(col), 0.04); }
    g.beginPath(); g.arc(0, 0.18, 0.44, Math.PI, 0); g.lineTo(0.44, 0.18); fs(c('#f4c95d'), 0.07);
    g.strokeStyle = 'rgba(160,100,40,.45)'; g.lineWidth = 0.03; g.beginPath(); for (const x of [-0.2, 0, 0.2]){ g.moveTo(x, 0.12); g.lineTo(x + 0.04, -0.12); } g.stroke();
  }
}

/* ---------- What shoppers walk out holding ---------- */
export function held(kind, hx, hy){
  if (kind === 'lemonade'){
    g.beginPath(); g.moveTo(hx - 0.06, hy - 0.16); g.lineTo(hx + 0.06, hy - 0.16); g.lineTo(hx + 0.045, hy + 0.02); g.lineTo(hx - 0.045, hy + 0.02); g.closePath(); fs('#fff6d6', 0.025);
    g.save(); g.beginPath(); g.moveTo(hx - 0.055, hy - 0.11); g.lineTo(hx + 0.055, hy - 0.11); g.lineTo(hx + 0.045, hy + 0.02); g.lineTo(hx - 0.045, hy + 0.02); g.closePath(); g.fillStyle = '#ffe066'; g.fill(); g.restore();
    rr(hx + 0.01, hy - 0.26, 0.022, 0.12, 0.01); fs('#ff5d8f', 0.012);
    circ(hx - 0.05, hy - 0.16, 0.035); fs('#ffd23f', 0.015);
    return true;
  }
  if (kind === 'ball'){ circ(hx, hy - 0.06, 0.09); fs('#ff8c42', 0.025); g.strokeStyle = OUT; g.lineWidth = 0.012; g.beginPath(); g.moveTo(hx - 0.09, hy - 0.06); g.lineTo(hx + 0.09, hy - 0.06); g.moveTo(hx, hy - 0.15); g.lineTo(hx, hy + 0.03); g.stroke(); return true; }
  if (kind === 'taco'){ g.beginPath(); g.arc(hx, hy, 0.1, Math.PI, 0); g.closePath(); fs('#f4c95d', 0.025); circ(hx - 0.04, hy - 0.06, 0.035); fs('#7bd389', 0); circ(hx + 0.03, hy - 0.06, 0.03); fs('#e63946', 0); return true; }
  return false;
}

/* ---------- The lemonade stand (a kiosk) ---------- */
export function lemonCounter(x, y, t){
  // A big glass jug with a spigot, lemon slices bobbing in it; a stack of cups; a basket of lemons.
  const jx = x + 0.42, jy = y - 0.52;
  rr(jx - 0.22, jy - 0.36, 0.44, 0.46, 0.08); fs('rgba(225,245,255,.7)', 0.03);
  g.save(); rr(jx - 0.2, jy - 0.24, 0.4, 0.32, 0.06); g.clip();
  g.fillStyle = '#ffe066'; g.fillRect(jx - 0.22, jy - 0.24, 0.44, 0.36);
  for (let i = 0; i < 3; i++){ const bx = jx - 0.12 + i * 0.12, by = jy - 0.1 + Math.sin(t * 2 + i * 2) * 0.03; circ(bx, by, 0.05); fs('#ffd23f', 0.015); g.strokeStyle = '#fff6d6'; g.lineWidth = 0.008; g.beginPath(); for (let k = 0; k < 6; k++){ const a = k * Math.PI / 3; g.moveTo(bx, by); g.lineTo(bx + Math.cos(a) * 0.04, by + Math.sin(a) * 0.04); } g.stroke(); }
  for (let i = 0; i < 4; i++){ const k = (t * 0.6 + i * 0.27) % 1; circ(jx - 0.14 + i * 0.09, jy + 0.06 - k * 0.28, 0.012); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill(); }
  g.restore();
  rr(jx - 0.24, jy - 0.4, 0.48, 0.06, 0.03); fs('#7bd389', 0.025);
  rr(jx - 0.04, jy + 0.08, 0.08, 0.06, 0.02); fs('#a0a8b0', 0.015);
  // Paper cups.
  for (let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(x + 0.82, y - 0.4 - i * 0.05); g.lineTo(x + 0.96, y - 0.4 - i * 0.05); g.lineTo(x + 0.94, y - 0.34 - i * 0.05); g.lineTo(x + 0.84, y - 0.34 - i * 0.05); g.closePath(); fs(i % 2 ? '#fff6d6' : '#ff8fab', 0.012); }
  // A basket of lemons.
  ell(x + 1.18, y - 0.36, 0.15, 0.05); fs('#c98b55', 0.02);
  rr(x + 1.03, y - 0.38, 0.3, 0.1, 0.04); fs('#a77d55', 0.02);
  for (let i = 0; i < 5; i++){ ell(x + 1.08 + (i % 3) * 0.1, y - 0.42 - Math.floor(i / 3) * 0.06, 0.055, 0.04, -0.3); fs('#ffd23f', 0.012); }
}

/* ---------- Back walls ---------- */
export function wallpaper(ic, x0, y0, w, H){
  if (ic === 'ball'){
    // Locker-room stripes and a scoreboard band.
    g.fillStyle = '#e3eefb'; g.fillRect(x0, y0, w, H);
    g.fillStyle = 'rgba(29,111,184,.18)'; for (let x = x0; x < x0 + w; x += 0.5) g.fillRect(x, y0, 0.25, H);
    g.fillStyle = '#1d6fb8'; g.fillRect(x0, y0 + H - 0.1, w, 0.1); g.fillStyle = '#ff9f1c'; g.fillRect(x0, y0 + H - 0.14, w, 0.04);
  } else if (ic === 'lipstick'){
    // Soft pink with little sparkles.
    g.fillStyle = '#ffe5ec'; g.fillRect(x0, y0, w, H);
    for (let x = x0 + 0.1; x < x0 + w; x += 0.3) for (let y = y0 + 0.1; y < y0 + H; y += 0.3){ const ox = ((y - y0) / 0.3 % 2) * 0.15; g.fillStyle = 'rgba(255,93,143,.35)'; g.beginPath(); g.moveTo(x + ox, y - 0.04); g.lineTo(x + ox + 0.012, y - 0.012); g.lineTo(x + ox + 0.04, y); g.lineTo(x + ox + 0.012, y + 0.012); g.lineTo(x + ox, y + 0.04); g.lineTo(x + ox - 0.012, y + 0.012); g.lineTo(x + ox - 0.04, y); g.lineTo(x + ox - 0.012, y - 0.012); g.closePath(); g.fill(); }
  } else if (ic === 'taco'){
    // Warm adobe with a row of papel picado bunting along the top.
    g.fillStyle = '#ffe8cc'; g.fillRect(x0, y0, w, H);
    g.fillStyle = 'rgba(231,111,81,.15)'; for (let y = y0 + 0.2; y < y0 + H; y += 0.4) g.fillRect(x0, y, w, 0.04);
    g.strokeStyle = 'rgba(61,43,53,.4)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(x0, y0 + 0.06); g.lineTo(x0 + w, y0 + 0.06); g.stroke();
    for (let i = 0, x = x0 + 0.04; x < x0 + w - 0.12; x += 0.17, i++){ g.beginPath(); g.moveTo(x, y0 + 0.06); g.lineTo(x + 0.14, y0 + 0.06); g.lineTo(x + 0.14, y0 + 0.2); g.lineTo(x + 0.07, y0 + 0.24); g.lineTo(x, y0 + 0.2); g.closePath(); g.fillStyle = FIESTA[i % FIESTA.length]; g.fill(); circ(x + 0.07, y0 + 0.13, 0.02); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill(); }
  } else return false;
  return true;
}
// A piece on each store's wall.
export function wallPiece(ic, wx, wy, t){
  if (ic === 'ball'){
    // Team pennants and a little trophy shelf.
    ['#1d6fb8', '#ff9f1c', '#e63946'].forEach((c, i) => { const px = wx + 0.12 + i * 0.24; g.beginPath(); g.moveTo(px, wy - 0.24); g.lineTo(px + 0.22, wy - 0.16); g.lineTo(px, wy - 0.08); g.closePath(); fs(c, 0.02); rr(px - 0.015, wy - 0.26, 0.02, 0.2, 0.01); fs('#8a6a5a', 0.01); });
    rr(wx + 0.1, wy + 0.06, 0.7, 0.04, 0.01); fs('#a77d55', 0.015);
    for (let i = 0; i < 3; i++){ const px = wx + 0.24 + i * 0.22; rr(px - 0.04, wy - 0.02, 0.08, 0.08, 0.01); fs('#f2c14e', 0.012); g.beginPath(); g.arc(px, wy - 0.04, 0.05, 0, Math.PI); fs('#f2c14e', 0.012); rr(px - 0.05, wy + 0.04, 0.1, 0.03, 0.01); fs('#5a4a6b', 0.01); }
  } else if (ic === 'lipstick'){
    // A Hollywood mirror ringed with bulbs.
    rr(wx + 0.18, wy - 0.26, 0.56, 0.46, 0.06); fs('#f8f1f5', 0.03);
    rr(wx + 0.25, wy - 0.19, 0.42, 0.32, 0.04); fs('#d6eef7', 0.02);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(wx + 0.32, wy - 0.02); g.lineTo(wx + 0.42, wy - 0.12); g.stroke();
    for (let i = 0; i < 5; i++){ for (const yy of [wy - 0.25, wy + 0.19]){ circ(wx + 0.24 + i * 0.11, yy, 0.025); fs('#fff2a8', 0.01); } }
  } else if (ic === 'taco'){
    // A chalk menu board with a chili pepper.
    rr(wx + 0.08, wy - 0.25, 0.74, 0.44, 0.04); fs('#2d3a2e', 0.035);
    text('TACOS', wx + 0.36, wy - 0.13, 0.1, '#ffe8cc', 700);
    ['$3', '$4', '$5'].forEach((p, i) => text(p, wx + 0.22 + i * 0.16, wy + 0.04, 0.08, '#ffd23f', 700));
    g.beginPath(); g.moveTo(wx + 0.6, wy - 0.2); g.quadraticCurveTo(wx + 0.78, wy - 0.16, wx + 0.66, wy + 0.04); g.quadraticCurveTo(wx + 0.62, wy - 0.08, wx + 0.6, wy - 0.2); fs('#e63946', 0.015);
    rr(wx + 0.58, wy - 0.24, 0.04, 0.05, 0.01); fs('#4fa85e', 0);
  } else return false;
  return true;
}
// Something on each counter, next to the register.
export function counter(ic, cx, top){
  if (ic === 'ball'){ circ(cx + 0.16, top + 0.04, 0.09); fs('#ff8c42', 0.02); g.strokeStyle = OUT; g.lineWidth = 0.012; g.beginPath(); g.moveTo(cx + 0.07, top + 0.04); g.lineTo(cx + 0.25, top + 0.04); g.stroke(); circ(cx + 0.36, top + 0.08, 0.05); fs('#fff', 0.015); circ(cx + 0.36, top + 0.08, 0.02); fs(OUT, 0); }
  else if (ic === 'lipstick'){
    // A little rack of nail polish.
    rr(cx + 0.04, top + 0.04, 0.44, 0.12, 0.02); fs('#f8f1f5', 0.015);
    for (let i = 0; i < 5; i++){ rr(cx + 0.07 + i * 0.08, top - 0.02, 0.06, 0.08, 0.02); fs(MAKEUP[i], 0.012); rr(cx + 0.085 + i * 0.08, top - 0.07, 0.03, 0.05, 0.01); fs('#3d2b35', 0); }
  } else if (ic === 'taco'){
    // A basket of chips and a bowl of salsa.
    ell(cx + 0.16, top + 0.08, 0.13, 0.05); fs('#e63946', 0.015);
    for (let i = 0; i < 5; i++){ g.beginPath(); const px = cx + 0.08 + i * 0.04; g.moveTo(px, top + 0.06); g.lineTo(px + 0.04, top - 0.04); g.lineTo(px + 0.07, top + 0.06); g.closePath(); fs('#f4c95d', 0.01); }
    ell(cx + 0.38, top + 0.08, 0.08, 0.04); fs('#fff6ea', 0.015); ell(cx + 0.38, top + 0.06, 0.06, 0.025); fs('#c1121f', 0);
  } else return false;
  return true;
}
// The big piece along each store's back wall.
export function back(ic, x, y, sw, t, id){
  if (ic === 'ball'){
    // Ball bins at the bottom, jerseys hanging above.
    box(x, y, sw, 0.36, 0.9, '#dfe7f2', '#1d6fb8');
    const top = y + 0.36 - 0.9;
    // Jerseys on a rail.
    g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(x + 0.06, top + 0.08); g.lineTo(x + sw - 0.06, top + 0.08); g.stroke();
    const n = Math.max(2, Math.floor((sw - 0.1) / 0.3));
    for (let i = 0; i < n; i++){
      const jx = x + 0.08 + i * (sw - 0.16) / n + 0.02, col = ['#e63946', '#1d6fb8', '#ff9f1c', '#2a9d8f', '#ffd23f'][(i + id) % 5];
      g.beginPath(); g.moveTo(jx + 0.04, top + 0.1); g.lineTo(jx + 0.2, top + 0.1); g.lineTo(jx + 0.26, top + 0.16); g.lineTo(jx + 0.21, top + 0.2); g.lineTo(jx + 0.2, top + 0.42); g.lineTo(jx + 0.04, top + 0.42); g.lineTo(jx + 0.03, top + 0.2); g.lineTo(jx - 0.02, top + 0.16); g.closePath(); fs(col, 0.018);
      text(String((i * 7 + id) % 30 + 1), jx + 0.12, top + 0.28, 0.08, '#fff', 700);
    }
    // Bins of basketballs, soccer balls and footballs.
    const bw = (sw - 0.12) / 3;
    for (let b = 0; b < 3; b++){
      const bx = x + 0.06 + b * bw;
      rr(bx + 0.02, top + 0.5, bw - 0.04, 0.32, 0.03); fs('#5a6b80', 0.02);
      for (let i = 0; i < Math.floor((bw - 0.06) / 0.11); i++){
        const px = bx + 0.09 + i * 0.11, py = top + 0.52 - (i % 2) * 0.03;
        if (b === 0){ circ(px, py, 0.055); fs('#ff8c42', 0.012); }
        else if (b === 1){ circ(px, py, 0.055); fs('#fff', 0.012); circ(px, py, 0.018); fs(OUT, 0); }
        else { ell(px, py, 0.065, 0.04, -0.4); fs('#8a4b2e', 0.012); g.strokeStyle = '#fff'; g.lineWidth = 0.008; g.beginPath(); g.moveTo(px - 0.02, py); g.lineTo(px + 0.02, py); g.stroke(); }
      }
    }
  } else if (ic === 'lipstick'){
    // A lit makeup wall: shelves of lipsticks, palettes and bottles under a light strip.
    box(x, y, sw, 0.34, 0.9, '#fff5f8', '#f7c5d6');
    const top = y + 0.34 - 0.9;
    rr(x + 0.04, top + 0.02, sw - 0.08, 0.05, 0.02); fs('#fff8d6', 0.015);
    g.save(); g.globalAlpha = 0.25; g.fillStyle = '#fff2a8'; g.fillRect(x + 0.06, top + 0.07, sw - 0.12, 0.2); g.restore();
    for (let r = 0; r < 3; r++){
      g.fillStyle = '#e8b4c8'; g.fillRect(x + 0.05, top + 0.3 + r * 0.2, sw - 0.1, 0.03);
      for (let i = 0; i < Math.floor((sw - 0.12) / 0.1); i++){
        const px = x + 0.1 + i * 0.1, py = top + 0.3 + r * 0.2, col = MAKEUP[(i + r * 3 + id) % MAKEUP.length];
        if (r === 1 && i % 3 === 0){ rr(px - 0.04, py - 0.06, 0.08, 0.06, 0.01); fs('#3d2b35', 0.01); for (let k = 0; k < 3; k++){ circ(px - 0.022 + k * 0.022, py - 0.03, 0.012); g.fillStyle = MAKEUP[(k + i) % MAKEUP.length]; g.fill(); } }
        else if (r === 2){ rr(px - 0.025, py - 0.11, 0.05, 0.11, 0.015); fs(col, 0.01); rr(px - 0.015, py - 0.14, 0.03, 0.03, 0.008); fs('#f2c14e', 0); }
        else { rr(px - 0.02, py - 0.06, 0.04, 0.06, 0.01); fs('#f2c14e', 0.01); rr(px - 0.015, py - 0.11, 0.03, 0.05, 0.01); fs(col, 0); }
      }
    }
  } else if (ic === 'taco'){
    // The taco line: a griddle with tortillas, bowls of fillings, a steaming pot.
    box(x, y, sw, 0.4, 0.5, '#c9d1d9', '#a9b0ba');
    const top = y + 0.4 - 0.5;
    rr(x + 0.06, top + 0.06, sw * 0.46, 0.26, 0.03); fs('#3d405b', 0.02);
    for (let i = 0; i < 3; i++){ ell(x + 0.17 + i * 0.2, top + 0.19, 0.08, 0.05); fs('#f4e1b5', 0.015); }
    g.save(); g.globalAlpha = 0.45; for (let i = 0; i < 2; i++){ const sy = top - 0.08 - ((t * 0.6 + i * 0.5) % 1) * 0.3; circ(x + 0.2 + i * 0.22, sy, 0.05); g.fillStyle = '#fff'; g.fill(); } g.restore();
    // Fillings.
    const fx = x + sw * 0.52;
    ['#7bd389', '#c1121f', '#ffd23f', '#8a4b2e', '#fff6ea'].forEach((c, i) => { if (fx + i * 0.16 > x + sw - 0.1) return; rr(fx + i * 0.16, top + 0.08, 0.13, 0.2, 0.03); fs('#e9eef2', 0.015); rr(fx + 0.02 + i * 0.16, top + 0.1, 0.09, 0.1, 0.02); g.fillStyle = c; g.fill(); });
    // Hanging chili strand.
    g.strokeStyle = '#8a6a5a'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(x + sw - 0.15, top - 0.6); g.lineTo(x + sw - 0.15, top - 0.2); g.stroke();
    for (let i = 0; i < 4; i++){ ell(x + sw - 0.15 + (i % 2 ? 0.03 : -0.03), top - 0.55 + i * 0.09, 0.025, 0.05, i % 2 ? 0.5 : -0.5); fs('#e63946', 0.01); }
  } else return false;
  return true;
}
// Pieces in the middle of the room. Returns true if it drew something.
export function mid(ic, u, W, H, t){
  if (ic === 'ball' && H >= 3){
    // A bike on a display stand, and a basketball hoop with a ball bouncing under it (both clear of the counter).
    const [bx0, by0] = local(u, 0.15, 2.1, 0.9, 0.27);
    g.save(); g.translate(bx0, by0); g.scale(0.9, 0.9); const bx = 0, by = 0;
    box(bx, by, 1.0, 0.3, 0.12, '#cfd8e3', '#9aa7b8');
    const wy = by + 0.3 - 0.12 - 0.2;
    for (const wx of [bx + 0.24, bx + 0.76]){ circ(wx, wy, 0.18); fs(null, 0.035); circ(wx, wy, 0.18); g.strokeStyle = '#3d405b'; g.lineWidth = 0.03; g.stroke(); circ(wx, wy, 0.03); fs('#a0a8b0', 0.01); }
    g.strokeStyle = '#e63946'; g.lineWidth = 0.045; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx + 0.24, wy); g.lineTo(bx + 0.46, wy - 0.24); g.lineTo(bx + 0.7, wy - 0.24); g.lineTo(bx + 0.76, wy); g.moveTo(bx + 0.46, wy - 0.24); g.lineTo(bx + 0.5, wy); g.lineTo(bx + 0.24, wy); g.moveTo(bx + 0.5, wy); g.lineTo(bx + 0.7, wy - 0.24); g.stroke();
    rr(bx + 0.4, wy - 0.32, 0.14, 0.05, 0.02); fs('#3d405b', 0.015); g.strokeStyle = '#3d405b'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(bx + 0.7, wy - 0.24); g.lineTo(bx + 0.72, wy - 0.36); g.lineTo(bx + 0.8, wy - 0.36); g.stroke();
    g.restore();
    if (W >= 3){
      const [hx, hy] = u.face === 'down' ? local(u, 0.42, 1.25) : local(u, 1.4, 1.0);
      shadow(hx, hy, 0.2, 0.06);
      rr(hx - 0.03, hy - 1.1, 0.06, 1.1, 0.02); fs('#3d405b', 0.025);
      rr(hx - 0.24, hy - 1.34, 0.48, 0.32, 0.03); fs('#fff', 0.03); rr(hx - 0.1, hy - 1.24, 0.2, 0.14, 0.01); fs(null, 0.02, '#e63946');
      ell(hx, hy - 1.04, 0.13, 0.04); g.strokeStyle = '#ff6b35'; g.lineWidth = 0.035; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 0.012; g.beginPath(); for (let i = -2; i <= 2; i++){ g.moveTo(hx + i * 0.05, hy - 1.03); g.lineTo(hx + i * 0.035, hy - 0.86); } g.stroke();
      const k = Math.abs(Math.sin(t * 3.2)), ballY = hy - 0.08 - k * 0.5;
      ell(hx + 0.18, hy + 0.02, 0.07 * (1 - k * 0.5), 0.025); g.fillStyle = 'rgba(45,30,40,.2)'; g.fill();
      circ(hx + 0.18, ballY, 0.08); fs('#ff8c42', 0.02); g.strokeStyle = OUT; g.lineWidth = 0.01; g.beginPath(); g.moveTo(hx + 0.1, ballY); g.lineTo(hx + 0.26, ballY); g.stroke();
    }
    return true;
  }
  if (ic === 'lipstick' && H >= 3){
    // A salon chair in front of a little mirror for nails and makeovers.
    const [x, y] = local(u, 0.5, 2.15);
    shadow(x, y, 0.22, 0.07);
    rr(x - 0.04, y - 0.18, 0.08, 0.18, 0.02); fs('#a0a8b0', 0.02); ell(x, y, 0.16, 0.05); fs('#a0a8b0', 0.02);
    rr(x - 0.2, y - 0.34, 0.4, 0.16, 0.06); fs('#ff5d8f', 0.03);
    rr(x - 0.18, y - 0.66, 0.36, 0.34, 0.08); fs('#ff8fab', 0.03);
    for (const sx of [-1, 1]){ rr(x + sx * 0.2 - 0.04, y - 0.42, 0.08, 0.1, 0.03); fs('#ff5d8f', 0.02); }
    const [mx, my] = local(u, 0.2, 1.2, 0.6, 0.3);
    box(mx, my, 0.6, 0.3, 0.32, '#f8f1f5', '#e8b4c8');
    rr(mx + 0.12, my - 0.32 - 0.36, 0.36, 0.36, 0.14); fs('#d6eef7', 0.03);
    for (let i = 0; i < 3; i++){ rr(mx + 0.12 + i * 0.13, my - 0.32 + 0.04, 0.06, 0.08, 0.02); fs(MAKEUP[i + 1], 0.012); }
    return true;
  }
  if (ic === 'taco'){
    // A little high-top table with a potted cactus.
    const [x, y] = local(u, 0.45, 1.5);
    shadow(x, y + 0.02, 0.2, 0.06);
    rr(x - 0.03, y - 0.42, 0.06, 0.42, 0.02); fs('#5a3a2e', 0.025); ell(x, y - 0.44, 0.2, 0.1); fs('#2ec4b6', 0.03);
    rr(x - 0.06, y - 0.56, 0.12, 0.1, 0.02); fs('#e07a5f', 0.02);
    rr(x - 0.035, y - 0.76, 0.07, 0.22, 0.035); fs('#4fa85e', 0.02); rr(x + 0.03, y - 0.7, 0.05, 0.1, 0.025); fs('#4fa85e', 0.015); circ(x, y - 0.78, 0.025); fs('#ff5d8f', 0);
    return true;
  }
  return false;
}
