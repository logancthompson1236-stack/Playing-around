// v0.17.2 painters: four more places to shop. Lemon Drop (a lemonade stand), Game Day (sporting goods), Glow Up
// (a beauty bar) and Taco Loco (tacos). Same conventions as art.js: tile units, drawn on art.js's current `g`.
import { g, rr, circ, ell, fs, box, shadow, text, storeIcon, OUT, local, cylinder, shade } from './art.js';

export const ICONS = ['lemon', 'ball', 'lipstick', 'taco'];
const FIESTA = ['#e76f51', '#2ec4b6', '#ffd23f', '#ff5d8f', '#5a8dee', '#7bd389'];
const MAKEUP = ['#ff5d8f', '#c9184a', '#ff8fab', '#ffb3c6', '#9d4edd', '#e85d04', '#fb6f92'];

/* ---------- Icons (the round badge on signs, menus and cards) ---------- */
export function icon(name, c){
  if (ICONS2.includes(name)) return icon2(name, c);
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
  if (held2(kind, hx, hy)) return true;
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
  if (ICONS2.includes(ic)) return wallpaper2(ic, x0, y0, w, H);
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
  if (ICONS2.includes(ic)) return wallPiece2(ic, wx, wy, t);
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
export function counter(ic, cx, top, t = 0){
  if (ICONS2.includes(ic)) return counter2(ic, cx, top, t);
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
  if (ICONS2.includes(ic)) return back2(ic, x, y, sw, t, id);
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
  if (ICONS2.includes(ic)) return mid2(ic, u, W, H, t);
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

/* =====================================================================================================
   v0.17.4: Noodle Nook (ramen), Cotton Cloud (cotton candy stand), Crafty Corner (art supplies) and
   Sushi Spin (a sit-down sushi bar with a conveyor belt), plus a food court, a carousel and a mall clock.
   ===================================================================================================== */
export const ICONS2 = ['noodle', 'cotton', 'brush', 'sushi'];
ICONS.push(...ICONS2);
const PAINT = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5', '#ff9f1c', '#f15bb5'];

export function icon2(name, c){
  if (name === 'noodle'){
    g.beginPath(); g.moveTo(-0.44, -0.04); g.lineTo(0.44, -0.04); g.quadraticCurveTo(0.4, 0.42, 0, 0.44); g.quadraticCurveTo(-0.4, 0.42, -0.44, -0.04); g.closePath(); fs(c('#c1121f'), 0.07);
    ell(0, -0.04, 0.44, 0.1); fs(c('#fff1d6'), 0.05);
    g.strokeStyle = c('#f4c95d'); g.lineWidth = 0.05; g.beginPath(); for (let i = -2; i <= 2; i++){ g.moveTo(i * 0.08, -0.04); g.quadraticCurveTo(i * 0.08 + 0.06, -0.24, i * 0.08 - 0.02, -0.4); } g.stroke();
    circ(-0.18, -0.06, 0.07); fs(c('#fff'), 0.03); circ(-0.18, -0.06, 0.03); fs(c('#ffd23f'), 0);
    g.strokeStyle = OUT; g.lineWidth = 0.05; g.beginPath(); g.moveTo(0.1, -0.12); g.lineTo(0.5, -0.56); g.moveTo(0.2, -0.1); g.lineTo(0.56, -0.48); g.stroke();
  } else if (name === 'cotton'){
    g.beginPath(); g.moveTo(-0.1, 0.0); g.lineTo(0.1, 0.0); g.lineTo(0.02, 0.5); g.lineTo(-0.02, 0.5); g.closePath(); fs(c('#fff1d6'), 0.05);
    for (const [x, y, r] of [[-0.18, -0.12, 0.2], [0.18, -0.12, 0.2], [0, -0.3, 0.24], [-0.06, -0.06, 0.18], [0.12, -0.36, 0.14]]){ circ(x, y, r); fs(c('#ffafcc'), 0.06); }
    for (const [x, y, r] of [[-0.18, -0.12, 0.2], [0.18, -0.12, 0.2], [0, -0.3, 0.24], [-0.06, -0.06, 0.18], [0.12, -0.36, 0.14]]){ circ(x, y, r - 0.03); fs(c('#ffafcc'), 0); }
    circ(0.06, -0.24, 0.12); fs(c('#a2d2ff'), 0); circ(-0.08, -0.32, 0.06); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
  } else if (name === 'brush'){
    ell(0, 0.08, 0.46, 0.32, -0.2); fs(c('#e9c46a'), 0.07); circ(0.22, 0.22, 0.07); fs(c('#fff8e1'), 0.04);
    [['#ef476f', -0.24, 0.0], ['#06d6a0', -0.06, -0.1], ['#118ab2', 0.14, -0.06], ['#ffd166', -0.2, 0.2]].forEach(([col, x, y]) => { circ(x, y, 0.08); fs(c(col), 0.03); });
    g.save(); g.rotate(-0.7); rr(-0.04, -0.62, 0.08, 0.44, 0.03); fs(c('#8a5a44'), 0.04); rr(-0.05, -0.2, 0.1, 0.08, 0.02); fs(c('#c0c6cc'), 0.03); g.beginPath(); g.moveTo(-0.05, -0.12); g.quadraticCurveTo(0, 0.08, 0.05, -0.12); fs(c('#9b5de5'), 0.04); g.restore();
  } else if (name === 'sushi'){
    circ(0, 0, 0.42); fs(c('#1b2d2a'), 0.07);
    circ(0, 0, 0.32); fs(c('#fffaf3'), 0.03);
    for (let i = 0; i < 8; i++){ const a = i * Math.PI / 4; circ(Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0.05); g.fillStyle = 'rgba(220,210,190,.6)'; g.fill(); }
    circ(0, 0, 0.14); fs(c('#ff8c69'), 0.035); circ(0.04, 0.03, 0.05); fs(c('#7bd389'), 0);
  }
}

// What shoppers walk out with from the new food places.
export function held2(kind, hx, hy){
  if (kind === 'noodles'){
    g.beginPath(); g.moveTo(hx - 0.07, hy - 0.14); g.lineTo(hx + 0.07, hy - 0.14); g.lineTo(hx + 0.05, hy + 0.02); g.lineTo(hx - 0.05, hy + 0.02); g.closePath(); fs('#fff6ea', 0.025);
    g.fillStyle = '#c1121f'; g.fillRect(hx - 0.06, hy - 0.08, 0.12, 0.03);
    g.strokeStyle = OUT; g.lineWidth = 0.015; g.beginPath(); g.moveTo(hx, hy - 0.12); g.lineTo(hx + 0.08, hy - 0.28); g.moveTo(hx + 0.03, hy - 0.12); g.lineTo(hx + 0.11, hy - 0.26); g.stroke();
    return true;
  }
  if (kind === 'cotton'){
    rr(hx - 0.01, hy - 0.12, 0.02, 0.16, 0.01); fs('#fff1d6', 0.01);
    for (const [x, y, r] of [[-0.05, -0.18, 0.06], [0.05, -0.18, 0.06], [0, -0.25, 0.07]]){ circ(hx + x, hy + y, r); fs('#ffafcc', 0.018); }
    circ(hx + 0.02, hy - 0.22, 0.035); fs('#a2d2ff', 0);
    return true;
  }
  if (kind === 'sushi'){ rr(hx - 0.09, hy - 0.08, 0.18, 0.1, 0.02); fs('#1b2d2a', 0.02); for (let i = 0; i < 3; i++){ circ(hx - 0.05 + i * 0.05, hy - 0.04, 0.022); fs('#fffaf3', 0.01); circ(hx - 0.05 + i * 0.05, hy - 0.04, 0.01); fs('#ff8c69', 0); } return true; }
  return false;
}

/* ---------- Cotton Cloud (kiosk) ---------- */
export function cottonCounter(x, y, t){
  // A spinning cotton candy machine: a steel bowl with pink floss swirling in it.
  const bx = x + 0.42, by = y - 0.42;
  ell(bx, by, 0.3, 0.1); fs('#c0c6cc', 0.03);
  g.save(); ell(bx, by - 0.02, 0.27, 0.08); g.clip();
  for (let i = 0; i < 6; i++){ const a = t * 6 + i; circ(bx + Math.cos(a) * 0.15, by - 0.02 + Math.sin(a) * 0.04, 0.08); g.fillStyle = i % 2 ? 'rgba(255,175,204,.85)' : 'rgba(162,210,255,.8)'; g.fill(); }
  g.restore();
  ell(bx, by, 0.3, 0.1); fs(null, 0.03);
  rr(bx - 0.04, by - 0.02, 0.08, 0.08, 0.02); fs('#a0a8b0', 0.015);
  // Fluffy wisps floating up.
  for (let i = 0; i < 3; i++){ const k = (t * 0.5 + i / 3) % 1; g.save(); g.globalAlpha = 1 - k; circ(bx - 0.1 + i * 0.1, by - 0.08 - k * 0.3, 0.035 + k * 0.03); g.fillStyle = '#ffd6e5'; g.fill(); g.restore(); }
  // A rack of ready cones, pink and blue.
  rr(x + 0.8, y - 0.62, 0.42, 0.06, 0.02); fs('#e9d8a6', 0.02);
  for (let i = 0; i < 3; i++){ g.save(); g.translate(x + 0.88 + i * 0.13, y - 0.68); g.scale(0.16, 0.16); icon2('cotton', col => i === 1 && col === '#ffafcc' ? '#a2d2ff' : col); g.restore(); }
  // Sugar jars.
  ['#ff8fab', '#a2d2ff'].forEach((c, i) => { rr(x + 1.1 + i * 0.13, y - 0.42, 0.1, 0.12, 0.03); fs('rgba(255,255,255,.75)', 0.015); rr(x + 1.11 + i * 0.13, y - 0.36, 0.08, 0.06, 0.02); g.fillStyle = c; g.fill(); });
}

/* ---------- Store walls, counters and back pieces ---------- */
export function wallpaper2(ic, x0, y0, w, H){
  if (ic === 'noodle'){
    // Warm red with gold wave scallops.
    g.fillStyle = '#9d1b1f'; g.fillRect(x0, y0, w, H);
    g.strokeStyle = 'rgba(244,201,93,.35)'; g.lineWidth = 0.02;
    for (let y = y0; y < y0 + H + 0.2; y += 0.18) for (let x = x0 + (Math.round((y - y0) / 0.18) % 2) * 0.12; x < x0 + w + 0.2; x += 0.24){ g.beginPath(); g.arc(x, y, 0.11, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(x, y, 0.06, Math.PI, 0); g.stroke(); }
  } else if (ic === 'brush'){
    // Clean white, splattered with paint.
    g.fillStyle = '#fbf7ff'; g.fillRect(x0, y0, w, H);
    let k = 0; for (let x = x0 + 0.15; x < x0 + w; x += 0.37) for (let y = y0 + 0.12; y < y0 + H; y += 0.33){ k++; circ(x + (k % 3) * 0.05, y + (k % 2) * 0.06, 0.045 + (k % 3) * 0.015); g.fillStyle = PAINT[k % PAINT.length] + '66'; g.fill(); circ(x + 0.07, y - 0.05, 0.015); g.fill(); }
  } else if (ic === 'sushi'){
    // Deep indigo with white wave lines.
    g.fillStyle = '#1d3557'; g.fillRect(x0, y0, w, H);
    g.strokeStyle = 'rgba(241,250,238,.28)'; g.lineWidth = 0.02;
    for (let y = y0 + 0.1; y < y0 + H; y += 0.2){ g.beginPath(); for (let x = x0; x <= x0 + w + 0.05; x += 0.05) g.lineTo(x, y + Math.sin((x - x0) * 9 + y * 3) * 0.035); g.stroke(); }
  } else return false;
  return true;
}
export function wallPiece2(ic, wx, wy, t){
  if (ic === 'noodle'){
    // Two paper lanterns and a little menu.
    for (const lx of [wx + 0.15, wx + 0.75]){ g.strokeStyle = OUT; g.lineWidth = 0.01; g.beginPath(); g.moveTo(lx, wy - 0.3); g.lineTo(lx, wy - 0.22); g.stroke(); ell(lx, wy - 0.1, 0.09, 0.12); fs('#e63946', 0.02); g.fillStyle = 'rgba(255,214,120,.5)'; ell(lx, wy - 0.1, 0.05, 0.09); g.fill(); rr(lx - 0.05, wy - 0.23, 0.1, 0.03, 0.01); fs('#2b2230', 0); rr(lx - 0.05, wy + 0.01, 0.1, 0.03, 0.01); fs('#2b2230', 0); }
    rr(wx + 0.28, wy - 0.24, 0.34, 0.4, 0.03); fs('#fff1d6', 0.025);
    text('RAMEN', wx + 0.45, wy - 0.15, 0.07, '#c1121f', 700);
    for (let i = 0; i < 3; i++){ rr(wx + 0.33, wy - 0.07 + i * 0.07, 0.24, 0.025, 0.01); g.fillStyle = 'rgba(61,43,53,.4)'; g.fill(); }
  } else if (ic === 'brush'){
    // A big rainbow painting on an easel-style frame.
    rr(wx + 0.18, wy - 0.26, 0.56, 0.42, 0.03); fs('#c98b55', 0.03);
    rr(wx + 0.23, wy - 0.21, 0.46, 0.32, 0.02); fs('#e3f6ff', 0.015);
    g.save(); rr(wx + 0.23, wy - 0.21, 0.46, 0.32, 0.02); g.clip();
    ['#ef476f', '#ff9f1c', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5'].forEach((c, i) => { g.beginPath(); g.arc(wx + 0.46, wy + 0.13, 0.3 - i * 0.04, Math.PI, 0); g.strokeStyle = c; g.lineWidth = 0.035; g.stroke(); });
    circ(wx + 0.62, wy - 0.13, 0.04); g.fillStyle = '#ffd166'; g.fill();
    g.restore();
  } else if (ic === 'sushi'){
    // A noren curtain over the kitchen door, with a fish on it.
    rr(wx + 0.12, wy - 0.27, 0.68, 0.05, 0.02); fs('#8a5a44', 0.02);
    for (let i = 0; i < 3; i++){ rr(wx + 0.14 + i * 0.22, wy - 0.22, 0.2, 0.38, 0.02); fs('#e76f51', 0.02); }
    ell(wx + 0.46, wy - 0.02, 0.14, 0.06); fs('#fff6ea', 0.015); g.beginPath(); g.moveTo(wx + 0.32, wy - 0.02); g.lineTo(wx + 0.26, wy - 0.07); g.lineTo(wx + 0.26, wy + 0.03); g.closePath(); fs('#fff6ea', 0.015); circ(wx + 0.55, wy - 0.03, 0.012); fs(OUT, 0);
  } else return false;
  return true;
}
export function counter2(ic, cx, top, t){
  if (ic === 'noodle'){
    // A steaming bowl with chopsticks resting on it.
    g.save(); g.translate(cx + 0.22, top + 0.04); g.scale(0.15, 0.15); icon2('noodle', c => c); g.restore();
    g.save(); g.globalAlpha = 0.5; for (let i = 0; i < 2; i++){ const k = (t * 0.7 + i * 0.5) % 1; circ(cx + 0.18 + i * 0.08, top - 0.08 - k * 0.2, 0.025 + k * 0.02); g.fillStyle = '#fff'; g.fill(); } g.restore();
  } else if (ic === 'brush'){
    // A jar of brushes and a ball of yarn.
    rr(cx + 0.08, top - 0.02, 0.12, 0.14, 0.03); fs('rgba(220,240,255,.85)', 0.015);
    PAINT.slice(0, 4).forEach((c, i) => { g.save(); g.translate(cx + 0.11 + i * 0.025, top - 0.02); g.rotate((i - 1.5) * 0.15); rr(-0.008, -0.16, 0.016, 0.16, 0.005); fs('#8a5a44', 0); rr(-0.012, -0.19, 0.024, 0.04, 0.008); fs(c, 0); g.restore(); });
    circ(cx + 0.36, top + 0.06, 0.07); fs('#f15bb5', 0.015); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 0.008; g.beginPath(); g.arc(cx + 0.36, top + 0.06, 0.045, 0.3, 2.6); g.stroke();
  } else if (ic === 'sushi'){
    // A waving lucky cat.
    const x = cx + 0.24, y = top + 0.08, wave = Math.sin(t * 4) * 0.3;
    rr(x - 0.08, y - 0.14, 0.16, 0.16, 0.06); fs('#fff6ea', 0.015);
    circ(x, y - 0.2, 0.08); fs('#fff6ea', 0.015);
    for (const s of [-1, 1]){ g.beginPath(); g.moveTo(x + s * 0.07, y - 0.24); g.lineTo(x + s * 0.06, y - 0.32); g.lineTo(x + s * 0.02, y - 0.27); g.closePath(); fs('#fff6ea', 0.012); }
    circ(x - 0.03, y - 0.21, 0.01); fs(OUT, 0); circ(x + 0.03, y - 0.21, 0.01); fs(OUT, 0);
    rr(x - 0.06, y - 0.12, 0.12, 0.025, 0.01); fs('#e63946', 0); circ(x, y - 0.09, 0.02); fs('#ffd23f', 0);
    g.save(); g.translate(x + 0.07, y - 0.12); g.rotate(-1.2 + wave); rr(-0.025, -0.1, 0.05, 0.1, 0.02); fs('#fff6ea', 0.012); g.restore();
  } else return false;
  return true;
}
export function back2(ic, x, y, sw, t, id){
  if (ic === 'noodle'){
    // The kitchen: a stove with steaming stock pots, a rack of noodles drying, a stack of bowls.
    box(x, y, sw, 0.4, 0.48, '#c9d1d9', '#a9b0ba');
    const top = y + 0.4 - 0.48;
    for (let i = 0; i < 2; i++){
      const px = x + 0.25 + i * 0.42;
      cylinder(px, top + 0.24, 0.16, 0.22, '#8d99ae', '#adb5bd');
      ell(px, top + 0.02, 0.13, 0.05); fs('#f4e1b5', 0);
      g.save(); g.globalAlpha = 0.45; for (let k = 0; k < 2; k++){ const q = (t * 0.6 + k * 0.5 + i * 0.3) % 1; circ(px - 0.04 + k * 0.08, top - 0.06 - q * 0.35, 0.05 + q * 0.03); g.fillStyle = '#fff'; g.fill(); } g.restore();
    }
    // Noodle drying rack above.
    g.strokeStyle = '#8a5a44'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(x + 0.08, top - 0.62); g.lineTo(x + sw - 0.08, top - 0.62); g.stroke();
    g.strokeStyle = '#f4c95d'; g.lineWidth = 0.012; g.beginPath(); for (let k = 0; k < (sw - 0.2) / 0.05; k++){ const nx = x + 0.12 + k * 0.05; g.moveTo(nx, top - 0.62); g.quadraticCurveTo(nx + 0.02, top - 0.48, nx - 0.01, top - 0.38); } g.stroke();
    // Bowls.
    if (sw > 1.1) for (let k = 0; k < 4; k++){ ell(x + sw - 0.25, top + 0.26 - k * 0.06, 0.13, 0.04); fs(k % 2 ? '#fff' : '#c1121f', 0.012); }
  } else if (ic === 'brush'){
    // A pegboard of tools over cubbies of yarn and shelves of paint tubes.
    box(x, y, sw, 0.36, 0.9, '#f3ead8', '#c9b49a');
    const top = y + 0.36 - 0.9;
    rr(x + 0.05, top + 0.04, sw - 0.1, 0.28, 0.02); fs('#e9d8b4', 0.015);
    g.fillStyle = 'rgba(120,90,60,.25)'; for (let px = x + 0.1; px < x + sw - 0.05; px += 0.07) for (let py = top + 0.08; py < top + 0.3; py += 0.07) g.fillRect(px, py, 0.012, 0.012);
    // Scissors, brushes, a ruler.
    g.strokeStyle = OUT; g.lineWidth = 0.015;
    circ(x + 0.18, top + 0.24, 0.03); fs(null, 0.015, '#ef476f'); circ(x + 0.24, top + 0.24, 0.03); fs(null, 0.015, '#ef476f');
    g.beginPath(); g.moveTo(x + 0.19, top + 0.21); g.lineTo(x + 0.25, top + 0.1); g.moveTo(x + 0.23, top + 0.21); g.lineTo(x + 0.17, top + 0.1); g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.015; g.stroke();
    for (let k = 0; k < Math.floor((sw - 0.6) / 0.08); k++){ rr(x + 0.36 + k * 0.08, top + 0.08, 0.02, 0.18, 0.01); fs('#8a5a44', 0); rr(x + 0.355 + k * 0.08, top + 0.07, 0.03, 0.04, 0.01); fs(PAINT[(k + id) % PAINT.length], 0); }
    // Yarn cubbies.
    const n = Math.max(2, Math.floor((sw - 0.1) / 0.24));
    for (let k = 0; k < n; k++){ const cxk = x + 0.06 + k * (sw - 0.12) / n, cw = (sw - 0.12) / n - 0.03; rr(cxk, top + 0.38, cw, 0.2, 0.02); fs('#c9b49a', 0.015); for (let b = 0; b < 2; b++){ circ(cxk + cw * (0.3 + b * 0.4), top + 0.5, Math.min(0.07, cw * 0.22)); fs(PAINT[(k * 2 + b + id) % PAINT.length], 0.012); } }
    // Paint tubes.
    g.fillStyle = '#b39b7d'; g.fillRect(x + 0.05, top + 0.78, sw - 0.1, 0.03);
    for (let k = 0; k < Math.floor((sw - 0.1) / 0.09); k++){ rr(x + 0.08 + k * 0.09, top + 0.66, 0.06, 0.12, 0.015); fs('#eef1f4', 0.01); rr(x + 0.08 + k * 0.09, top + 0.68, 0.06, 0.05, 0.01); g.fillStyle = PAINT[(k + id + 3) % PAINT.length]; g.fill(); }
  } else if (ic === 'sushi'){
    // The sushi bar: a chef's counter with a fish case, and a conveyor belt of little plates going round.
    box(x, y, sw, 0.4, 0.42, '#e9dcc8', '#8a5a44');
    const top = y + 0.4 - 0.42;
    // Fish display case.
    rr(x + 0.08, top - 0.26, sw * 0.5, 0.24, 0.04); fs('rgba(220,245,255,.85)', 0.025);
    for (let k = 0; k < Math.floor(sw * 0.5 / 0.16); k++){ ell(x + 0.18 + k * 0.16, top - 0.1, 0.06, 0.03, -0.2); fs(['#ff8c69', '#f4a261', '#e63946', '#fff1e6'][(k + id) % 4], 0.012); }
    // The belt along the front of the counter.
    rr(x + 0.04, top + 0.18, sw - 0.08, 0.14, 0.05); fs('#adb5bd', 0.02);
    g.strokeStyle = 'rgba(61,43,53,.3)'; g.lineWidth = 0.01; g.beginPath(); for (let bx = x + 0.08 + ((t * 0.3) % 0.08); bx < x + sw - 0.06; bx += 0.08){ g.moveTo(bx, top + 0.19); g.lineTo(bx, top + 0.31); } g.stroke();
    const n = Math.max(3, Math.floor((sw - 0.1) / 0.3)), span = sw - 0.2;
    for (let k = 0; k < n; k++){
      const px = x + 0.1 + ((k / n + t * 0.06) % 1) * span, col = ['#e63946', '#118ab2', '#ffd166', '#06d6a0'][k % 4];
      ell(px, top + 0.24, 0.08, 0.03); fs(col, 0.015);
      if (k % 2){ rr(px - 0.05, top + 0.18, 0.1, 0.05, 0.02); fs('#fffaf3', 0.01); rr(px - 0.05, top + 0.17, 0.1, 0.025, 0.01); fs('#ff8c69', 0); }
      else { for (const dx of [-0.03, 0.03]){ circ(px + dx, top + 0.21, 0.025); fs('#1b2d2a', 0.01); circ(px + dx, top + 0.21, 0.013); fs('#fffaf3', 0); } }
    }
    // A bamboo rolling mat and a knife.
    if (sw > 1.2){ rr(x + sw * 0.62, top - 0.12, 0.3, 0.12, 0.01); fs('#c9b26e', 0.015); g.strokeStyle = 'rgba(100,80,30,.4)'; g.lineWidth = 0.008; g.beginPath(); for (let k = 0; k < 8; k++){ g.moveTo(x + sw * 0.62 + k * 0.04, top - 0.12); g.lineTo(x + sw * 0.62 + k * 0.04, top); } g.stroke(); }
  } else return false;
  return true;
}
export function mid2(ic, u, W, H, t){
  if (ic === 'noodle'){
    // Paper lanterns strung across the ceiling, and a little two-stool table.
    const [x, y] = local(u, 0.42, 1.5);
    shadow(x, y + 0.02, 0.2, 0.06);
    for (const sx of [-0.28, 0.28]) cylinder(x + sx, y + 0.05, 0.08, 0.2, '#5a3a2e', '#e63946');
    rr(x - 0.03, y - 0.36, 0.06, 0.36, 0.02); fs('#3d2b35', 0.02); rr(x - 0.2, y - 0.42, 0.4, 0.1, 0.04); fs('#8a5a44', 0.025);
    g.save(); g.translate(x, y - 0.46); g.scale(0.09, 0.09); icon2('noodle', c => c); g.restore();
    return true;
  }
  if (ic === 'brush' && H >= 3){
    // An easel with a painting in progress, and a craft table of yarn and paper.
    const [ex, ey] = local(u, 0.35, 2.05);
    shadow(ex, ey, 0.2, 0.06);
    g.strokeStyle = '#8a5a44'; g.lineWidth = 0.035; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - 0.16, ey); g.lineTo(ex, ey - 0.9); g.lineTo(ex + 0.16, ey); g.moveTo(ex, ey - 0.9); g.lineTo(ex + 0.02, ey - 0.05); g.stroke();
    rr(ex - 0.24, ey - 0.84, 0.48, 0.4, 0.02); fs('#fffaf3', 0.025);
    g.save(); rr(ex - 0.22, ey - 0.82, 0.44, 0.36, 0.02); g.clip();
    g.fillStyle = '#a2d2ff'; g.fillRect(ex - 0.22, ey - 0.82, 0.44, 0.22); g.fillStyle = '#7bd389'; g.fillRect(ex - 0.22, ey - 0.6, 0.44, 0.14);
    circ(ex + 0.12, ey - 0.72, 0.05); g.fillStyle = '#ffd166'; g.fill();
    g.restore();
    rr(ex - 0.22, ey - 0.44, 0.44, 0.04, 0.01); fs('#8a5a44', 0.015);
    // The craft table goes by the window when the door faces down; facing up that spot is the doorway, so a basket of
    // yarn sits by the easel instead.
    if (u.face !== 'down'){ const [bx, by] = local(u, 0.82, 2.3); ell(bx, by, 0.16, 0.06); fs('#c98b55', 0.02); rr(bx - 0.16, by - 0.14, 0.32, 0.14, 0.05); fs('#a77d55', 0.02); PAINT.slice(0, 4).forEach((c, i) => { circ(bx - 0.1 + i * 0.065, by - 0.16 - (i % 2) * 0.03, 0.05); fs(c, 0.012); }); return true; }
    const [tx, ty] = local(u, 0.95, 1.95, 0.8, 0.4);
    box(tx, ty, 0.8, 0.4, 0.32, '#f3ead8', '#c9b49a');
    PAINT.slice(0, 3).forEach((c, i) => { circ(tx + 0.18 + i * 0.2, ty - 0.24, 0.06); fs(c, 0.012); });
    rr(tx + 0.1, ty - 0.18, 0.24, 0.12, 0.01); fs('#fff', 0.01); rr(tx + 0.44, ty - 0.18, 0.24, 0.12, 0.01); fs('#ffe5ec', 0.01);
    return true;
  }
  return false;
}

/* ---------- Decor: the food court ---------- */
// Four tables of two stools each around a center aisle, on its own tiled floor, with a sign at the back and a
// planter rail along the front. Shoppers carrying food come sit down to eat (see sim.js).
const COURT_T = [[0.85, 0.95], [3.15, 0.95], [0.85, 2.05], [3.15, 2.05]];
export function courtSpots(d){
  const tables = COURT_T.map(([lx, ly]) => ({ x: d.x + lx, y: d.y + ly }));
  const seats = [];
  tables.forEach((tb, i) => { seats.push({ x: tb.x - 0.42, y: tb.y + 0.08, flip: false, table: i }); seats.push({ x: tb.x + 0.42, y: tb.y + 0.08, flip: true, table: i }); });
  return { tables, seats, entry: { x: d.x + 2, y: d.y + 3.35 }, aisleX: d.x + 2 };
}
export function foodCourt(d, part, i, t){
  const x = d.x, y = d.y, sp = courtSpots(d);
  if (part === 'base'){
    shadow(x + 2, y + 2.95, 2.1, 0.14, 0.12);
    // Tiled floor.
    g.save(); rr(x + 0.05, y + 0.05, 3.9, 2.85, 0.12); g.clip();
    for (let a = 0; a < 8; a++) for (let b = 0; b < 6; b++){ g.fillStyle = (a + b) % 2 ? '#fff4dc' : '#ffd8a8'; g.fillRect(x + 0.05 + a * 0.4875, y + 0.05 + b * 0.475, 0.49, 0.48); }
    g.fillStyle = 'rgba(46,196,182,.25)'; g.fillRect(x + 1.55, y + 0.05, 0.9, 2.85);
    g.restore();
    rr(x + 0.05, y + 0.05, 3.9, 2.85, 0.12); fs(null, 0.04);
    // The sign at the back: FOOD COURT on a lit board between two posts.
    for (const px of [x + 0.7, x + 3.3]){ rr(px - 0.04, y - 0.7, 0.08, 0.8, 0.03); fs('#3d405b', 0.025); }
    rr(x + 0.55, y - 1.08, 2.9, 0.44, 0.1); fs('#2ec4b6', 0.045);
    rr(x + 0.62, y - 1.02, 2.76, 0.32, 0.08); fs('#fffaf3', 0.025);
    text('FOOD COURT', x + 2, y - 0.86, 0.22, '#e76f51', 700);
    for (const [fx, flip] of [[x + 0.85, 1], [x + 3.15, -1]]){ g.save(); g.translate(fx, y - 0.86); g.scale(flip, 1); g.strokeStyle = OUT; g.lineWidth = 0.025; g.beginPath(); g.moveTo(-0.06, -0.1); g.lineTo(-0.06, 0.1); g.moveTo(0.06, -0.1); g.lineTo(0.06, 0.1); g.moveTo(-0.09, -0.1); g.lineTo(-0.09, -0.02); g.moveTo(-0.03, -0.1); g.lineTo(-0.03, -0.02); g.stroke(); g.restore(); }
    // Potted plants in the back corners.
    for (const px of [x + 0.25, x + 3.75]){ rr(px - 0.13, y + 0.12, 0.26, 0.2, 0.04); fs('#e07a5f', 0.025); for (let k = 0; k < 4; k++){ ell(px - 0.1 + k * 0.07, y + 0.02 - (k % 2) * 0.06, 0.04, 0.1, (k - 1.5) * 0.4); g.fillStyle = ['#4fa85e', '#6cc47a'][k % 2]; g.fill(); } }
    return;
  }
  if (part === 'stools'){
    const tb = sp.tables[i];
    for (const sx of [-0.42, 0.42]){ shadow(tb.x + sx, tb.y + 0.08, 0.14, 0.05); cylinder(tb.x + sx, tb.y + 0.06, 0.11, 0.2, '#2a9d8f', ['#e76f51', '#2ec4b6', '#ffd23f', '#ff5d8f'][i]); }
    return;
  }
  if (part === 'table'){
    const tb = sp.tables[i];
    shadow(tb.x, tb.y + 0.06, 0.28, 0.08);
    rr(tb.x - 0.03, tb.y - 0.36, 0.06, 0.38, 0.02); fs('#7a8090', 0.025);
    ell(tb.x, tb.y - 0.38, 0.3, 0.14); fs('#fffaf3', 0.04);
    ell(tb.x, tb.y - 0.4, 0.25, 0.1); fs(null, 0.015, ['#e76f51', '#2ec4b6', '#ffd23f', '#ff5d8f'][i]);
    // Napkins and a little condiment caddy.
    rr(tb.x - 0.05, tb.y - 0.5, 0.1, 0.08, 0.02); fs('#c9d1d9', 0.012); rr(tb.x - 0.035, tb.y - 0.56, 0.03, 0.08, 0.01); fs('#e63946', 0.008); rr(tb.x + 0.005, tb.y - 0.55, 0.03, 0.07, 0.01); fs('#ffd23f', 0.008);
    return;
  }
  if (part === 'front'){
    // A low planter rail along the front, open in the middle where people walk in.
    for (const [a, b] of [[x + 0.08, x + 1.5], [x + 2.5, x + 3.92]]){
      box(a, y + 2.62, b - a, 0.3, 0.22, '#7bd389', '#2a9d8f', 0, 0.06);
      for (let px = a + 0.12; px < b - 0.05; px += 0.22){ circ(px, y + 2.62 - 0.2, 0.07); fs(['#ff8fab', '#ffd23f', '#fffaf3'][Math.round(px * 7) % 3], 0.012); }
    }
    return;
  }
  // Everything at once (thumbnails, the placement preview).
  foodCourt(d, 'base', 0, t);
  for (let k = 0; k < 4; k++){ foodCourt(d, 'stools', k, t); foodCourt(d, 'table', k, t); }
  foodCourt(d, 'front', 0, t);
}

/* ---------- Decor: the carousel ---------- */
// Painted horses on golden poles go round under a striped canopy while a kid rides; live.k is how far along the
// ride is (it eases up to speed after the kid climbs on and back to rest before they hop off).
const C_ON = 0.12, C_OFF = 0.88;
export function carouselSeat(d){ return { x: d.x + 1.5, y: d.y + 1.75 + 0.5 - 0.44 }; }
export function carousel(d, t, live, person){
  const cx = d.x + 1.5, cy = d.y + 1.75, k = live ? live.k : 0;
  const run = Math.max(0, Math.min(1, (k - C_ON) / (C_OFF - C_ON)));
  const phase = live && run > 0 && run < 1 ? (run * run * (3 - 2 * run)) * Math.PI * 4 : 0;
  const going = live && run > 0 && run < 1;
  const rider = going && live.rider ? live.rider : null;
  shadow(cx, cy + 0.1, 1.45, 0.5, 0.18);
  // The platform.
  ell(cx, cy + 0.08, 1.38, 0.72); fs('#b5838d', 0.045);
  ell(cx, cy, 1.38, 0.72); fs('#ffe5d9', 0.045);
  g.save(); ell(cx, cy, 1.38, 0.72); g.clip();
  for (let a = 0; a < 12; a++){ const a0 = a * Math.PI / 6 + phase; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 2, a0, a0 + Math.PI / 12); g.closePath(); g.fillStyle = 'rgba(255,175,204,.35)'; g.fill(); }
  g.restore();
  ell(cx, cy, 1.38, 0.72); fs(null, 0.045);
  // Horses, back half first.
  const horses = [];
  for (let i = 0; i < 6; i++){ const a = Math.PI / 2 + phase + i * Math.PI / 3; horses.push({ i, a, hx: cx + Math.cos(a) * 1.0, hy: cy + Math.sin(a) * 0.5, z: 0.42 + (going ? Math.sin(t * 4 + i * 1.7) * 0.09 : 0) }); }
  horses.sort((p, q) => p.hy - q.hy);
  const pole = h => { rr(h.hx - 0.02, cy - 1.75 + (h.hy - cy), 0.04, 1.75, 0.01); fs('#f2c14e', 0.015); };
  const drawHorse = h => {
    pole(h);
    const dir = -Math.sin(h.a) > 0 ? 1 : -1;       // which way it's travelling across the screen
    horse(h.hx, h.hy - h.z, dir, ['#fffaf3', '#a2d2ff', '#ffd6a5', '#cdb4db', '#fffaf3', '#b9fbc0'][h.i]);
    if (rider && h.i === 0) person(h.hx - dir * 0.02, h.hy - h.z - 0.02, { ...rider, t, s: 0.6, sit: true, sitSide: true, flip: dir < 0, play: Math.sin(t * 2.5) > 0.3, mood: 'happy', noShadow: true });
  };
  for (const h of horses) if (h.hy < cy) drawHorse(h);
  // The center column, mirrored and lit.
  rr(cx - 0.18, cy - 1.75, 0.36, 1.72, 0.06); fs('#e76f51', 0.035);
  rr(cx - 0.12, cy - 1.6, 0.24, 1.0, 0.04); fs('#bde0fe', 0.025);
  g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(cx - 0.08, cy - 1.55, 0.04, 0.9);
  for (const h of horses) if (h.hy >= cy) drawHorse(h);
  // The canopy: a scalloped red-and-white dome with lights and a flag on top.
  const ty = cy - 1.82;
  for (let s = 0; s < 12; s++){ const a0 = Math.PI + s * Math.PI / 12, a1 = a0 + Math.PI / 12; g.beginPath(); g.moveTo(cx, ty - 0.62); g.lineTo(cx + Math.cos(a0) * 1.5, ty + Math.sin(a0) * 0.1); g.lineTo(cx + Math.cos(a1) * 1.5, ty + Math.sin(a1) * 0.1); g.closePath(); fs(s % 2 ? '#fffaf3' : '#e63946', 0.03); }
  ell(cx, ty + 0.02, 1.5, 0.16); fs('#f2c14e', 0.04);
  for (let s = 0; s < 14; s++){ const sx = cx - 1.4 + s * 0.2; circ(sx, ty + 0.15, 0.09); fs(s % 2 ? '#fffaf3' : '#e63946', 0.025); }
  for (let s = 0; s < 14; s++){ const lit = !going || (s + Math.floor(t * 8)) % 3 !== 0; circ(cx - 1.4 + s * 0.2, ty + 0.03, 0.025); fs(lit ? '#fff2a8' : '#c9a227', 0.008); }
  rr(cx - 0.015, ty - 0.92, 0.03, 0.32, 0.01); fs('#3d405b', 0.012);
  g.beginPath(); g.moveTo(cx + 0.015, ty - 0.92); g.lineTo(cx + 0.22, ty - 0.86 + Math.sin(t * 4) * 0.02); g.lineTo(cx + 0.015, ty - 0.8); g.closePath(); fs('#2ec4b6', 0.015);
}
// A carousel horse in profile, facing dir (1 right, -1 left), its saddle at (x, y).
function horse(x, y, dir, col){
  g.save(); g.translate(x, y); g.scale(dir, 1);
  for (const [lx, a] of [[-0.14, 0.5], [-0.08, -0.3], [0.1, -0.5], [0.16, 0.4]]){ g.save(); g.translate(lx, 0.06); g.rotate(a); rr(-0.022, 0, 0.044, 0.18, 0.02); fs(col, 0.018); g.restore(); }
  ell(0, 0.02, 0.22, 0.1); fs(col, 0.025);
  g.beginPath(); g.moveTo(0.12, -0.02); g.lineTo(0.22, -0.2); g.lineTo(0.3, -0.22); g.lineTo(0.32, -0.15); g.lineTo(0.2, 0.02); g.closePath(); fs(col, 0.022);
  g.beginPath(); g.moveTo(0.14, -0.06); g.quadraticCurveTo(0.16, -0.22, 0.24, -0.24); g.strokeStyle = '#e63946'; g.lineWidth = 0.035; g.stroke();
  circ(0.27, -0.18, 0.012); fs(OUT, 0);
  g.beginPath(); g.moveTo(-0.2, -0.02); g.quadraticCurveTo(-0.32, 0.02, -0.3, 0.14); g.strokeStyle = '#f2c14e'; g.lineWidth = 0.035; g.stroke();
  rr(-0.08, -0.08, 0.16, 0.06, 0.02); fs('#e63946', 0.015);
  g.restore();
}

/* ---------- Decor: the mall clock ---------- */
// A grand old clock on a post, keeping the mall's time (the renderer passes it in).
let hour = 10;
export function setHour(h){ hour = h; }
export function mallClock(x, y, t){
  shadow(x, y, 0.24, 0.08);
  box(x - 0.16, y - 0.04, 0.32, 0.14, 0.16, '#3d405b', '#2b2d42');
  rr(x - 0.05, y - 1.9, 0.1, 1.76, 0.04); fs('#2b2d42', 0.03);
  for (const yy of [y - 0.5, y - 1.2]){ rr(x - 0.08, yy, 0.16, 0.06, 0.02); fs('#c9a227', 0.015); }
  // The face, in a gold case, with a little roof.
  const cy = y - 2.18;
  circ(x, cy, 0.3); fs('#c9a227', 0.04);
  circ(x, cy, 0.24); fs('#fffaf3', 0.03);
  for (let k = 0; k < 12; k++){ const a = k * Math.PI / 6; rr(x + Math.cos(a) * 0.19 - 0.008, cy + Math.sin(a) * 0.19 - 0.008, 0.016, 0.016, 0.004); fs(OUT, 0); }
  const hh = hour % 12, mm = (hour % 1) * 60;
  const hand = (ang, len, wdt) => { g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.sin(ang) * len, cy - Math.cos(ang) * len); g.strokeStyle = OUT; g.lineWidth = wdt; g.lineCap = 'round'; g.stroke(); };
  hand((hh + mm / 60) / 12 * Math.PI * 2, 0.12, 0.03); hand(mm / 60 * Math.PI * 2, 0.18, 0.02);
  circ(x, cy, 0.02); fs('#e63946', 0);
  g.beginPath(); g.moveTo(x - 0.26, cy - 0.28); g.lineTo(x, cy - 0.46); g.lineTo(x + 0.26, cy - 0.28); g.closePath(); fs('#2b2d42', 0.03);
  circ(x, cy - 0.5, 0.04); fs('#c9a227', 0.015);
}
