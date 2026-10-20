// v0.20 painters: the Velvet Rose, Grandma Rose's old speakeasy in the basement. Its look (brick walls, a parquet
// floor with a red runner, the foundation below the cutaway), the bar itself, the drinks, and the seats and
// decorations people drink at. The bar games live in art7.js. Same conventions as art.js: tile units, drawn on
// art.js's current `g`.
import { g, rr, circ, ell, fs, box, shadow, text, OUT, local, shade, mulberry, cylinder, person } from './art.js';
import * as A7 from './art7.js';

export const ICONS = ['bar'];
const BRASS = '#d4a24c', WINE = '#7a1f2b', WALNUT = '#5a3626', LEATHER = '#8c2a32';
const BOTTLES = ['#c97b2a', '#3f7d4e', '#e8d9b0', '#8b2e3a', '#d9a441', '#5b8fa8', '#a8572a'];
const hash = (a, b, c = 0) => { let t = Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791); t = Math.imul(t ^ t >>> 13, 0x5bd1e995); return ((t ^ t >>> 15) >>> 0) / 4294967296; };
const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

/* ---------- Floors ---------- */
// The basement's concourse: dark walnut parquet, with a red runner edged in gold down the middle (rows 7–10).
// The bar's own floor: little black and cream tiles, the classic octagon-and-dot.
export const FLOOR_KIND = { speakeasy: 'speakeasy' };
export function floor(kind, x, y, w, h){
  if (kind === 'speakeasy'){
    g.fillStyle = '#3b2219'; g.fillRect(x, y, w, h);
    for (let i = Math.floor(x * 2); i < (x + w) * 2; i++) for (let j = Math.floor(y * 2); j < (y + h) * 2; j++){
      const bx = i / 2, by = j / 2, flip = (i + j) % 2;
      for (let k = 0; k < 4; k++){
        const v = hash(i, j, k), c = `rgb(${Math.round(92 + v * 26)},${Math.round(56 + v * 16)},${Math.round(38 + v * 10)})`;
        g.fillStyle = c;
        if (flip) g.fillRect(bx + 0.01, by + k * 0.125 + 0.008, 0.48, 0.11); else g.fillRect(bx + k * 0.125 + 0.008, by + 0.01, 0.11, 0.48);
      }
    }
    g.fillStyle = 'rgba(255,220,170,.05)'; g.fillRect(x, y, w, h * 0.5);
    // The runner.
    const r0 = Math.max(y, 7.1), r1 = Math.min(y + h, 10.9);
    if (r1 > r0){
      g.fillStyle = WINE; g.fillRect(x, r0, w, r1 - r0);
      g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = Math.floor(x); i < x + w; i++) if (i % 2) g.fillRect(i, r0, 1, r1 - r0);
      // Gold art-deco diamonds down the middle and a gold border along each edge.
      for (let i = Math.floor(x); i < x + w; i++){
        const cy = 9, cx = i + 0.5;
        if (cy > r0 && cy < r1 + 1){ g.save(); g.beginPath(); g.rect(x, r0, w, r1 - r0); g.clip();
          g.beginPath(); g.moveTo(cx, cy - 0.38); g.lineTo(cx + 0.3, cy); g.lineTo(cx, cy + 0.38); g.lineTo(cx - 0.3, cy); g.closePath(); g.strokeStyle = 'rgba(212,162,76,.7)'; g.lineWidth = 0.035; g.stroke();
          circ(cx, cy, 0.06); g.fillStyle = 'rgba(212,162,76,.8)'; g.fill(); g.restore(); }
      }
      g.fillStyle = BRASS;
      if (y <= 7.1 && y + h > 7.1){ g.fillRect(x, 7.1, w, 0.05); g.fillRect(x, 7.22, w, 0.02); }
      if (y < 10.9 && y + h >= 10.9){ g.fillRect(x, 10.85, w, 0.05); g.fillRect(x, 10.76, w, 0.02); }
    }
    return true;
  }
  if (kind === 'speakbar'){
    g.fillStyle = '#efe4cc'; g.fillRect(x, y, w, h);
    const s = 0.25;
    g.strokeStyle = 'rgba(40,28,24,.35)'; g.lineWidth = 0.012;
    for (let i = Math.floor(x / s); i < (x + w) / s; i++) for (let j = Math.floor(y / s); j < (y + h) / s; j++){
      const cx = i * s + s / 2, cy = j * s + s / 2, a = s * 0.3;
      g.beginPath(); for (let k = 0; k < 8; k++){ const ang = Math.PI / 8 + k * Math.PI / 4; g.lineTo(cx + Math.cos(ang) * a * 1.3, cy + Math.sin(ang) * a * 1.3); } g.closePath(); g.stroke();
      g.fillStyle = '#231815'; g.save(); g.translate(i * s, j * s); g.rotate(Math.PI / 4); g.fillRect(-0.035, -0.035, 0.07, 0.07); g.restore();
    }
    return true;
  }
  return false;
}

/* ---------- The basement's walls ---------- */
export const WALLPAPER = { speakeasy: { face: '#7a3427', dark: '#3e1d18', cap: BRASS, base: '#2a1712' } };
export function wallPattern(id, P, w, top){
  if (id !== 'speakeasy') return false;
  // Old brick, sooty toward the ceiling.
  const bh = 0.13, bw = 0.34;
  for (let r = 0; top + r * bh < -0.62; r++){
    const yy = top + r * bh, off = r % 2 ? bw / 2 : 0;
    for (let x = -off; x < w; x += bw){
      const v = hash(Math.round(x * 10), r, 7);
      g.fillStyle = `rgb(${Math.round(112 + v * 34)},${Math.round(46 + v * 18)},${Math.round(34 + v * 12)})`;
      g.fillRect(x + 0.012, yy + 0.012, bw - 0.024, bh - 0.024);
    }
  }
  const soot = g.createLinearGradient(0, top, 0, top + 0.5); soot.addColorStop(0, 'rgba(20,10,8,.55)'); soot.addColorStop(1, 'rgba(20,10,8,0)');
  g.fillStyle = soot; g.fillRect(0, top, w, 0.5);
  // Dark wood wainscot with raised panels and a brass rail.
  g.fillStyle = '#3d2219'; g.fillRect(0, -0.64, w, 0.42);
  for (let x = 0.08; x + 0.5 < w; x += 0.62){ rr(x, -0.58, 0.54, 0.3, 0.03); g.fillStyle = '#4e2c20'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 0.015; g.stroke(); }
  g.fillStyle = BRASS; g.fillRect(0, -0.67, w, 0.035);
  // Brass sconces, glowing warm, with a faded VR monogram plaque between every other pair.
  for (let i = 1.5, n = 0; i < w; i += 3, n++){
    const sx = i, sy = top + 0.5;
    g.save(); const gl = g.createRadialGradient(sx, sy - 0.05, 0.02, sx, sy - 0.05, 0.55); gl.addColorStop(0, 'rgba(255,200,120,.55)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(sx - 0.6, sy - 0.6, 1.2, 1.2); g.restore();
    rr(sx - 0.03, sy, 0.06, 0.14, 0.02); g.fillStyle = BRASS; g.fill();
    g.beginPath(); g.moveTo(sx - 0.09, sy + 0.02); g.lineTo(sx + 0.09, sy + 0.02); g.lineTo(sx + 0.06, sy - 0.14); g.lineTo(sx - 0.06, sy - 0.14); g.closePath(); g.fillStyle = '#ffe2a8'; g.fill(); g.strokeStyle = BRASS; g.lineWidth = 0.02; g.stroke();
    if (n % 2 === 1){ const px = i - 1.5; rr(px - 0.22, top + 0.32, 0.44, 0.3, 0.05); g.fillStyle = 'rgba(30,14,10,.45)'; g.fill(); g.strokeStyle = 'rgba(212,162,76,.55)'; g.lineWidth = 0.02; g.stroke(); text('VR', px, top + 0.47, 0.16, 'rgba(212,162,76,.6)', 700); }
  }
  return true;
}
// Below the basement's cutaway edge: the foundation in cross-section, old pipes, and a boiler's glow.
export function basementView(x, y, w, h){
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#2c201c'); gr.addColorStop(1, '#130c0a');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  const R = mulberry(313);
  // Rough stone blocks.
  for (let r = 0; r * 0.42 < h; r++){
    for (let bx = x - (r % 2) * 0.35; bx < x + w; bx += 0.7){
      const v = R();
      rr(bx + 0.02, y + r * 0.42 + 0.02, 0.66, 0.38, 0.06); g.fillStyle = `rgba(${Math.round(90 + v * 30)},${Math.round(80 + v * 24)},${Math.round(72 + v * 20)},${0.35 - r * 0.06})`; g.fill();
    }
  }
  // Copper pipes running along, with valves and a brace now and then.
  for (const [py, c] of [[y + 0.34, '#b87333'], [y + 0.56, '#8d8478']]){
    g.fillStyle = c; g.fillRect(x, py - 0.045, w, 0.09); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, py - 0.035, w, 0.02);
    for (let px = x + 1.3 + (py > y + 0.4 ? 0.8 : 0); px < x + w; px += 3.2){
      rr(px - 0.06, py - 0.07, 0.12, 0.14, 0.02); fs(shade(c, -0.25), 0.015);
      if (py < y + 0.4){ circ(px, py - 0.14, 0.07); fs('#c0392b', 0.015); g.strokeStyle = '#5a1e1e'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(px - 0.06, py - 0.14); g.lineTo(px + 0.06, py - 0.14); g.moveTo(px, py - 0.2); g.lineTo(px, py - 0.08); g.stroke(); }
    }
  }
  // A boiler's grate glowing every few tiles, and crates stacked in the dark.
  for (let bx = x + 3.5; bx < x + w - 1; bx += 7){
    g.save(); const gl = g.createRadialGradient(bx, y + h * 0.7, 0.05, bx, y + h * 0.7, 1.1); gl.addColorStop(0, 'rgba(255,140,60,.5)'); gl.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gl; g.fillRect(bx - 1.2, y, 2.4, h); g.restore();
    rr(bx - 0.25, y + h * 0.55, 0.5, 0.3, 0.06); fs('#2a1d1a', 0.02);
    for (let k = 0; k < 4; k++){ g.fillStyle = k % 2 ? '#ff9a4a' : '#ffcf6a'; g.fillRect(bx - 0.19 + k * 0.1, y + h * 0.6, 0.06, 0.2); }
  }
  for (let bx = x + 1; bx < x + w - 1; bx += 5.5){
    g.fillStyle = 'rgba(110,78,50,.55)'; g.fillRect(bx, y + h - 0.45, 0.5, 0.45); g.fillRect(bx + 0.52, y + h - 0.32, 0.4, 0.32);
    g.strokeStyle = 'rgba(40,25,15,.6)'; g.lineWidth = 0.02; g.strokeRect(bx, y + h - 0.45, 0.5, 0.45); g.beginPath(); g.moveTo(bx, y + h - 0.45); g.lineTo(bx + 0.5, y + h); g.stroke();
  }
}
// The basement's cutaway front: a low brick wall with a walnut cap.
export function basementFrontWall(x0, x1, y){
  rr(x0, y - 0.5, x1 - x0, 0.42, 0.03); fs('#6e2f24', 0.035);
  g.save(); rr(x0, y - 0.5, x1 - x0, 0.42, 0.03); g.clip();
  g.strokeStyle = 'rgba(40,16,12,.55)'; g.lineWidth = 0.014; g.beginPath();
  for (let r = 0; r < 4; r++){ const yy = y - 0.5 + r * 0.105; g.moveTo(x0, yy); g.lineTo(x1, yy); for (let x = x0 + (r % 2) * 0.17; x < x1; x += 0.34){ g.moveTo(x, yy); g.lineTo(x, yy + 0.105); } }
  g.stroke(); g.restore();
  box(x0, y - 0.1, x1 - x0, 0.2, 0.12, '#2a1712', '#2a1712', 0, 0.03);
  rr(x0 - 0.04, y - 0.6, x1 - x0 + 0.08, 0.12, 0.04); fs(WALNUT, 0.035);
  g.fillStyle = BRASS; g.fillRect(x0, y - 0.5, x1 - x0, 0.025);
}

/* ---------- The bar store ---------- */
export function icon(name, c){
  if (name !== 'bar') return false;
  // A coupe with a rose laid across it.
  g.beginPath(); g.moveTo(-0.4, -0.18); g.quadraticCurveTo(0, 0.2, 0.4, -0.18); g.closePath(); fs(c('#e8b04a'), 0.07);
  g.beginPath(); g.moveTo(-0.3, -0.12); g.quadraticCurveTo(0, 0.08, 0.3, -0.12); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.035; g.stroke();
  rr(-0.03, 0.02, 0.06, 0.32, 0.02); fs(c('#e9f6fb'), 0.05); ell(0, 0.36, 0.2, 0.06); fs(c('#e9f6fb'), 0.05);
  g.beginPath(); g.moveTo(-0.46, -0.48); g.quadraticCurveTo(0, -0.3, 0.32, -0.12); g.strokeStyle = c('#3f7d4e'); g.lineWidth = 0.06; g.stroke();
  ell(-0.24, -0.36, 0.08, 0.04, -0.5); fs(c('#3f7d4e'), 0.04);
  circ(-0.42, -0.5, 0.15); fs(c('#c1121f'), 0.06);
  g.beginPath(); g.arc(-0.42, -0.5, 0.08, 0.4, 4.6); g.strokeStyle = 'rgba(80,0,10,.6)'; g.lineWidth = 0.035; g.stroke();
  return true;
}
export function wallpaper(ic, x0, y0, w, H){
  if (ic !== 'bar') return false;
  // Deep emerald with brass deco fans.
  g.fillStyle = '#1f3b33'; g.fillRect(x0, y0, w, H);
  g.strokeStyle = 'rgba(212,162,76,.45)'; g.lineWidth = 0.014;
  for (let x = x0; x < x0 + w + 0.3; x += 0.3) for (let y = y0 + 0.3, r = 0; y < y0 + H + 0.3; y += 0.22, r++){
    const cx = x + (r % 2) * 0.15;
    g.beginPath(); g.arc(cx, y, 0.14, Math.PI, 0); g.stroke();
    g.beginPath(); for (let k = 1; k < 4; k++){ const a = Math.PI + k * Math.PI / 4; g.moveTo(cx, y); g.lineTo(cx + Math.cos(a) * 0.14, y + Math.sin(a) * 0.14); } g.stroke();
  }
  g.fillStyle = '#3d2219'; g.fillRect(x0, y0 + H - 0.12, w, 0.12); g.fillStyle = BRASS; g.fillRect(x0, y0 + H - 0.14, w, 0.025);
  return true;
}
// An oval portrait of Rose herself, a rose tucked in her hair.
export function wallPiece(ic, wx, wy, t){
  if (ic !== 'bar') return false;
  const cx = wx + 0.45, cy = wy - 0.03;
  ell(cx, cy, 0.2, 0.25); fs(BRASS, 0.035); ell(cx, cy, 0.155, 0.2); fs('#e9dcc0', 0.02);
  g.save(); ell(cx, cy, 0.155, 0.2); g.clip();
  circ(cx, cy + 0.26, 0.17); g.fillStyle = '#5a3a4a'; g.fill();
  circ(cx, cy - 0.02, 0.085); g.fillStyle = '#f2d2b6'; g.fill();
  g.beginPath(); g.arc(cx, cy - 0.04, 0.1, Math.PI * 0.95, Math.PI * 2.05); g.fillStyle = '#3a2a24'; g.fill();
  circ(cx + 0.08, cy - 0.09, 0.035); g.fillStyle = '#c1121f'; g.fill();
  g.restore();
  text('Rose', cx, cy + 0.32, 0.08, BRASS, 700);
  return true;
}
// On the counter by the register: a shaker that gets a good shake every few seconds, bitters and a fresh coupe.
export function counter(ic, cx, top, t){
  if (ic !== 'bar') return false;
  const c = t % 4.2, shaking = c < 1.4, jig = shaking ? Math.sin(t * 38) * 0.035 : 0, sx = cx + 0.14, sy = top + 0.12 - (shaking ? 0.08 : 0);
  g.save(); g.translate(sx + jig, sy); g.rotate(shaking ? Math.sin(t * 38) * 0.25 : 0);
  g.beginPath(); g.moveTo(-0.06, 0); g.lineTo(0.06, 0); g.lineTo(0.05, -0.17); g.lineTo(-0.05, -0.17); g.closePath(); fs('#d9dde3', 0.015);
  rr(-0.045, -0.22, 0.09, 0.06, 0.02); fs('#c0c6cc', 0.012); rr(-0.018, -0.26, 0.036, 0.05, 0.012); fs('#c0c6cc', 0.01);
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-0.04, -0.15, 0.015, 0.12);
  g.restore();
  // Little dropper bottles of bitters.
  [['#8b2e3a', 0.28], ['#c97b2a', 0.36]].forEach(([col, dx]) => { rr(cx + dx - 0.03, top + 0.02, 0.06, 0.1, 0.02); fs(col, 0.012); rr(cx + dx - 0.012, top - 0.03, 0.024, 0.05, 0.008); fs('#2b2230', 0.008); });
  // A coupe being poured into after the shake.
  const gx = cx + 0.47, gy = top + 0.13;
  g.beginPath(); g.moveTo(gx - 0.06, gy - 0.1); g.quadraticCurveTo(gx, gy - 0.02, gx + 0.06, gy - 0.1); g.closePath(); fs(c > 1.6 && c < 3.8 ? '#e8b04a' : 'rgba(230,245,255,.7)', 0.012);
  g.strokeStyle = 'rgba(230,245,255,.9)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(gx, gy - 0.05); g.lineTo(gx, gy); g.stroke();
  return true;
}
// The back bar: a mirror behind three shelves of backlit bottles, a brass rail, and the name in brass up top.
export function back(ic, x, y, sw, t, id){
  if (ic !== 'bar') return false;
  box(x, y, sw, 0.36, 1.0, '#3d2219', WALNUT);
  const top = y + 0.36 - 1.0;
  // The mirror, with a soft sheen sliding across it.
  rr(x + 0.06, top + 0.06, sw - 0.12, 0.84, 0.03); g.fillStyle = '#5b6b6e'; g.fill();
  g.save(); rr(x + 0.06, top + 0.06, sw - 0.12, 0.84, 0.03); g.clip();
  const sh = ((t * 0.08) % 1.6) - 0.3;
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(x + sw * sh, top); g.lineTo(x + sw * sh + 0.3, top); g.lineTo(x + sw * sh - 0.1, top + 1); g.lineTo(x + sw * sh - 0.4, top + 1); g.fill();
  const gl = g.createLinearGradient(0, top + 0.06, 0, top + 0.9); gl.addColorStop(0, 'rgba(255,190,110,.35)'); gl.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gl; g.fillRect(x, top, sw, 1);
  g.restore();
  for (let r = 0; r < 3; r++){
    const sy = top + 0.34 + r * 0.25;
    g.fillStyle = '#2a1712'; g.fillRect(x + 0.06, sy, sw - 0.12, 0.035);
    g.fillStyle = BRASS; g.fillRect(x + 0.06, sy - 0.006, sw - 0.12, 0.012);
    const n = Math.max(2, Math.floor((sw - 0.16) / 0.12));
    for (let i = 0; i < n; i++){
      const bx = x + 0.12 + i * (sw - 0.2) / n, c = BOTTLES[(i * 3 + r * 5 + id) % BOTTLES.length], tall = (i + r + id) % 3;
      const bh = tall === 0 ? 0.2 : tall === 1 ? 0.16 : 0.13;
      rr(bx - 0.035, sy - bh, 0.07, bh, 0.02); g.fillStyle = c; g.fill(); g.strokeStyle = 'rgba(20,10,8,.6)'; g.lineWidth = 0.01; g.stroke();
      rr(bx - 0.013, sy - bh - 0.06, 0.026, 0.065, 0.008); g.fillStyle = shade(c, -0.25); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(bx - 0.025, sy - bh + 0.03, 0.012, bh - 0.06);
      if ((i + r) % 2) { g.fillStyle = '#efe4cc'; g.fillRect(bx - 0.028, sy - bh * 0.55, 0.056, 0.04); }
    }
  }
  // The name in brass letters, glowing.
  g.save(); g.shadowColor = '#ffb85c'; g.shadowBlur = 6;
  text('The Velvet Rose', x + sw / 2, top + 0.17, 0.13, '#ffd38a', 700, 'Fredoka', sw - 0.3);
  g.restore();
  return true;
}
// Nothing extra mid-room: the long bar and its stools have their own layers (storeLayers).
export function mid(ic){ return ic === 'bar'; }
// The long bar: a polished walnut counter running from the register to the far wall, a brass foot rail, a beer
// tower with three taps, and padded stools along the front. A bartender works behind it, polishing glasses
// and pulling a pint now and then. Layered: bartender, counter, then the stools.
export function storeLayers(u, def, t, add){
  if (def.icon !== 'bar' || u.state !== 'store') return;
  const W = u.w, down = u.face === 'down';
  const [bx, by, bw, bd] = local(u, 0.1, 0.95, W - 1.15, 0.42);
  const H = 0.48;
  // The bartender: behind the bar facing out.
  const [px, py] = local(u, 0.95 + Math.sin(t * 0.25) * 0.5, down ? 0.62 : 0.6);
  const c = t % 6, pour = c > 3.6 && c < 5.2;
  add(down ? py : py + 0.01, () => {
    person(px, py, { t, skin: '#e0ac85', hair: '#2b2230', shirt: '#f4efe6', pants: '#2b2230', sleeve: '#f4efe6', vest: '#2b2230', bowtie: true, back: !down, reach: !pour && Math.sin(t * 6) > -0.2, mood: 'happy' });
    if (down && !pour){ const gx = px + 0.24 + Math.sin(t * 6) * 0.03, gy = py - 0.82; g.beginPath(); g.moveTo(gx - 0.05, gy - 0.06); g.lineTo(gx + 0.05, gy - 0.06); g.lineTo(gx + 0.04, gy + 0.06); g.lineTo(gx - 0.04, gy + 0.06); g.closePath(); fs('rgba(230,245,255,.85)', 0.012); rr(gx - 0.09, gy - 0.02, 0.07, 0.12, 0.02); fs('#fff', 0.01); }
  });
  add(by + bd, () => {
    box(bx, by, bw, bd, H, '#7a4a32', '#4e2c20');
    // Raised panels on the front, a polished top with reflections.
    const fy = by + bd - H;
    if (down) for (let x = bx + 0.08; x + 0.36 < bx + bw; x += 0.44){ rr(x, fy + 0.08, 0.36, H - 0.16, 0.03); g.fillStyle = '#5a3424'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 0.012; g.stroke(); }
    g.fillStyle = 'rgba(255,230,190,.18)'; g.fillRect(bx + 0.05, by - H + 0.04, bw - 0.1, 0.05);
    if (down){ g.strokeStyle = BRASS; g.lineWidth = 0.035; g.beginPath(); g.moveTo(bx, by + bd - 0.06); g.lineTo(bx + bw, by + bd - 0.06); g.stroke(); }
    // The beer tower.
    const tx = bx + bw * 0.7, ty = by + bd * 0.5 - H;
    rr(tx - 0.03, ty - 0.3, 0.06, 0.3, 0.02); fs('#c0c6cc', 0.015); rr(tx - 0.16, ty - 0.34, 0.32, 0.08, 0.03); fs('#c0c6cc', 0.015);
    for (let k = 0; k < 3; k++){ const hx = tx - 0.11 + k * 0.11; rr(hx - 0.018, ty - 0.48, 0.036, 0.14, 0.012); fs(['#c97b2a', '#2b2230', '#3f7d4e'][k], 0.012); }
    // Glasses and a dish of olives along the bar.
    for (let k = 0; k < 3; k++){ const gx = bx + 0.3 + k * 0.62; if (gx > tx - 0.3 && gx < tx + 0.3) continue; rr(gx - 0.04, by + 0.1 - H - 0.12, 0.08, 0.12, 0.02); fs(k % 2 ? 'rgba(232,176,74,.85)' : 'rgba(230,245,255,.75)', 0.012); }
    if (pour && down){ const k = (c - 3.6) / 1.6; rr(tx + 0.02, ty - 0.24, 0.1, 0.14, 0.02); fs('rgba(230,245,255,.6)', 0.012); g.fillStyle = '#e0a53a'; g.fillRect(tx + 0.025, ty - 0.1 - k * 0.12, 0.09, k * 0.12); g.fillStyle = '#fff6e0'; g.fillRect(tx + 0.025, ty - 0.12 - k * 0.12, 0.09, 0.03); }
  });
  // Stools along the front (face down) or behind it (face up, where the bar's back is to us).
  if (down) for (let k = 0; k < Math.floor((bw - 0.2) / 0.62); k++){
    const sx = bx + 0.32 + k * 0.62, sy = by + bd + 0.32;
    add(sy, () => { shadow(sx, sy + 0.02, 0.13, 0.05); rr(sx - 0.02, sy - 0.32, 0.04, 0.32, 0.01); fs('#2b2230', 0.012); ell(sx, sy - 0.12, 0.09, 0.03); g.strokeStyle = BRASS; g.lineWidth = 0.025; g.stroke(); ell(sx, sy - 0.34, 0.13, 0.055); fs(LEATHER, 0.025); ell(sx, sy - 0.36, 0.1, 0.035); g.fillStyle = 'rgba(255,255,255,.15)'; g.fill(); });
  }
}

/* ---------- Drinks ---------- */
export function held(kind, hx, hy){
  if (kind === 'beer'){
    rr(hx - 0.055, hy - 0.16, 0.11, 0.17, 0.02); fs('rgba(230,245,255,.75)', 0.02);
    g.fillStyle = '#e0a53a'; g.fillRect(hx - 0.045, hy - 0.11, 0.09, 0.11);
    for (const [dx, dy, r] of [[-0.03, -0.165, 0.035], [0.01, -0.175, 0.04], [0.04, -0.16, 0.03]]){ circ(hx + dx, hy + dy, r); g.fillStyle = '#fff8e6'; g.fill(); }
    g.beginPath(); g.arc(hx + 0.07, hy - 0.08, 0.04, -Math.PI / 2, Math.PI / 2); g.strokeStyle = 'rgba(230,245,255,.9)'; g.lineWidth = 0.02; g.stroke();
    return true;
  }
  if (kind === 'whiskey'){
    g.beginPath(); g.moveTo(hx - 0.055, hy - 0.11); g.lineTo(hx + 0.055, hy - 0.11); g.lineTo(hx + 0.05, hy); g.lineTo(hx - 0.05, hy); g.closePath(); fs('rgba(230,245,255,.65)', 0.018);
    g.fillStyle = '#b8651f'; g.fillRect(hx - 0.048, hy - 0.06, 0.096, 0.055);
    rr(hx - 0.025, hy - 0.085, 0.045, 0.04, 0.008); g.fillStyle = 'rgba(240,250,255,.85)'; g.fill();
    return true;
  }
  if (kind === 'martini'){
    g.beginPath(); g.moveTo(hx - 0.08, hy - 0.2); g.lineTo(hx + 0.08, hy - 0.2); g.lineTo(hx, hy - 0.09); g.closePath(); fs('rgba(230,245,255,.75)', 0.016);
    g.beginPath(); g.moveTo(hx - 0.065, hy - 0.185); g.lineTo(hx + 0.065, hy - 0.185); g.lineTo(hx, hy - 0.1); g.closePath(); g.fillStyle = 'rgba(240,235,200,.85)'; g.fill();
    g.strokeStyle = 'rgba(230,245,255,.9)'; g.lineWidth = 0.014; g.beginPath(); g.moveTo(hx, hy - 0.09); g.lineTo(hx, hy); g.moveTo(hx - 0.035, hy); g.lineTo(hx + 0.035, hy); g.stroke();
    g.strokeStyle = '#8a5a44'; g.lineWidth = 0.01; g.beginPath(); g.moveTo(hx + 0.05, hy - 0.24); g.lineTo(hx - 0.01, hy - 0.15); g.stroke();
    circ(hx + 0.012, hy - 0.165, 0.02); fs('#7a9a3a', 0.008);
    return true;
  }
  return false;
}
export const DRINKS = ['beer', 'whiskey', 'martini', 'cocktail'];
// A drink set down on a table, at its foot (x, y).
function tableDrink(kind, x, y){
  if (!kind) return;
  g.save(); g.translate(x, y); g.scale(0.85, 0.85);
  if (kind === 'cocktail'){ g.beginPath(); g.moveTo(-0.07, -0.18); g.lineTo(0.07, -0.18); g.lineTo(0, -0.08); g.closePath(); fs('#ff4fa0', 0.012); g.strokeStyle = 'rgba(230,245,255,.9)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(0, -0.08); g.lineTo(0, 0); g.stroke(); }
  else held(kind, 0, 0);
  g.restore();
}

/* ---------- Seats for drinking: stool, bistro table, booth ---------- */
// Where each sitter's feet go (world tiles). side: sat side-on (flip: facing left); back: seen from behind.
export function perchSpots(d){
  const x = d.x, y = d.y;
  if (d.type === 'stool') return [{ x: x + 0.34, y: y + 0.74, side: true, flip: false }];
  if (d.type === 'bistro') return [{ x: x + 0.58, y: y + 0.72, side: true, flip: false }, { x: x + 1.42, y: y + 0.72, side: true, flip: true }];
  if (d.type === 'booth') return [{ x: x + 0.95, y: y + 0.92 }, { x: x + 2.05, y: y + 0.92 }, { x: x + 0.95, y: y + 1.86, back: true }, { x: x + 2.05, y: y + 1.86, back: true }];
  return [];
}
const stoolSeat = (sx, sy) => {
  shadow(sx, sy + 0.02, 0.15, 0.055);
  cylinder(sx, sy, 0.035, 0.12, '#2b2230', '#2b2230');
  ell(sx, sy - 0.06, 0.1, 0.035); g.strokeStyle = BRASS; g.lineWidth = 0.025; g.stroke();
  cylinder(sx, sy - 0.12, 0.13, 0.1, '#5e1c22', LEATHER);
  ell(sx - 0.03, sy - 0.235, 0.06, 0.02); g.fillStyle = 'rgba(255,255,255,.18)'; g.fill();
};
function barrelTable(cx, cy, drink){
  shadow(cx, cy + 0.02, 0.18, 0.06);
  cylinder(cx, cy, 0.15, 0.44, '#8a5a3a', '#a8714a');
  for (const hy of [0.08, 0.36]){ g.beginPath(); g.ellipse(cx, cy - hy, 0.15, 0.05, 0, 0, Math.PI); g.strokeStyle = '#2b2230'; g.lineWidth = 0.025; g.stroke(); }
  g.strokeStyle = 'rgba(60,30,15,.35)'; g.lineWidth = 0.01; g.beginPath(); for (const dx of [-0.07, 0, 0.07]){ g.moveTo(cx + dx, cy - 0.43); g.lineTo(cx + dx, cy - 0.02); } g.stroke();
  tableDrink(drink, cx, cy - 0.44);
}
// Draws the seat pieces in sort layers via add(sortY, fn). live.drinks[seat] = what each sitter has, if anyone.
function perchLayers(d, t, add, live){
  const x = d.x, y = d.y, sp = perchSpots(d), drinks = (live && live.drinks) || [];
  if (d.type === 'stool'){
    add(y + 0.6, () => stoolSeat(sp[0].x, sp[0].y - 0.04));
    add(y + 0.78, () => barrelTable(x + 0.78, y + 0.66, null));
    return;
  }
  if (d.type === 'bistro'){
    add(y + 0.6, () => { for (const s of sp) stoolSeat(s.x, s.y - 0.04); });
    add(y + 0.8, () => {
      const cx = x + 1, cy = y + 0.66;
      shadow(cx, cy + 0.03, 0.24, 0.07);
      ell(cx, cy, 0.12, 0.04); fs('#2b2230', 0.02); rr(cx - 0.025, cy - 0.42, 0.05, 0.42, 0.02); fs('#2b2230', 0.015);
      ell(cx, cy - 0.44, 0.27, 0.11); fs('#efe6dc', 0.035); ell(cx, cy - 0.455, 0.23, 0.08); g.fillStyle = 'rgba(160,140,140,.15)'; g.fill();
      g.strokeStyle = BRASS; g.lineWidth = 0.02; ell(cx, cy - 0.44, 0.27, 0.11); g.stroke();
      // A candle in red glass, flickering.
      rr(cx - 0.035, cy - 0.53, 0.07, 0.08, 0.02); fs('rgba(193,18,31,.75)', 0.01);
      g.save(); g.globalAlpha = 0.5 + Math.sin(t * 9 + d.id) * 0.15; circ(cx, cy - 0.5, 0.07); g.fillStyle = '#ffcf6a'; g.fill(); g.restore();
      // A coaster each (the drinks themselves are in hand).
      for (const sx of [-0.13, 0.13]){ ell(cx + sx, cy - 0.44, 0.045, 0.018); g.fillStyle = '#c9a052'; g.fill(); }
    });
    return;
  }
  if (d.type === 'booth'){
    // The back bench: a tall tufted back and its seat.
    add(y + 0.5, () => {
      shadow(x + 1.5, y + 2.0, 1.5, 0.14, 0.15);
      box(x + 0.15, y + 0.2, 2.7, 0.2, 1.05, '#6e1f28', '#8c2a32');
      const ft = y + 0.4 - 1.05;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++){ circ(x + 0.38 + i * 0.45 + (j % 2) * 0.22, ft + 0.2 + j * 0.24, 0.02); g.fillStyle = '#4a1218'; g.fill(); }
      rr(x + 0.1, y + 0.2 - 1.15, 2.8, 0.12, 0.05); fs(WALNUT, 0.03);
      box(x + 0.15, y + 0.4, 2.7, 0.5, 0.28, '#a33340', '#6e1f28');
      for (const ex of [x + 0.05, x + 2.85]) box(ex, y + 0.2, 0.12, 0.72, 0.5, WALNUT, '#3d2219');
    });
    add(y + 1.46, () => {
      const tx = x + 0.45, ty = y + 1.1;
      shadow(x + 1.5, ty + 0.36, 1.0, 0.1, 0.15);
      rr(x + 1.45, ty, 0.1, 0.36, 0.02); fs('#2b2230', 0.015);
      box(tx, ty - 0.36, 2.1, 0.36, 0.08, '#3d2219', '#2a1712', 0.36, 0.05);
      rr(tx + 0.04, ty - 0.36 - 0.44 + 0.02, 2.02, 0.05, 0.02); g.fillStyle = 'rgba(255,230,190,.18)'; g.fill();
      const top = ty - 0.36 - 0.44 + 0.18;
      // A little lamp in the middle with a fringed shade.
      rr(x + 1.48, top - 0.3, 0.04, 0.3, 0.01); fs(BRASS, 0.01);
      g.beginPath(); g.moveTo(x + 1.38, top - 0.28); g.lineTo(x + 1.62, top - 0.28); g.lineTo(x + 1.56, top - 0.42); g.lineTo(x + 1.44, top - 0.42); g.closePath(); fs('#c1121f', 0.015);
      g.save(); g.globalAlpha = 0.35; circ(x + 1.5, top - 0.25, 0.22); g.fillStyle = '#ffcf6a'; g.fill(); g.restore();
      // Those with their backs to us have set their drinks down in front of them.
      [[0.95, 0.1], [2.05, 0.1]].forEach(([dx, dy], i) => tableDrink(drinks[i + 2], x + dx, top + dy));
    });
    add(y + 1.8, () => box(x + 0.15, y + 1.55, 2.7, 0.45, 0.26, '#a33340', '#6e1f28'));
    add(y + 2.0, () => {
      box(x + 0.15, y + 1.9, 2.7, 0.1, 0.62, '#6e1f28', '#8c2a32');
      for (let i = 0; i < 6; i++){ circ(x + 0.38 + i * 0.45, y + 2.0 - 0.36, 0.02); g.fillStyle = '#4a1218'; g.fill(); }
      rr(x + 0.1, y + 2.0 - 0.7, 2.8, 0.1, 0.04); fs(WALNUT, 0.03);
      for (const ex of [x + 0.05, x + 2.85]) box(ex, y + 1.5, 0.12, 0.5, 0.5, WALNUT, '#3d2219');
    });
  }
}

/* ---------- Jukebox and barrels ---------- */
// A Wurlitzer-style jukebox: walnut arch, bubbling color tubes, a record turning behind the window while it plays.
export function jukebox(x, y, t, playing, using){
  const cx = x + 0.5, base = y + 0.84, w = 0.72, h = 1.2, top = base - h;
  shadow(cx, base, 0.42, 0.12);
  if (playing){ g.save(); g.globalAlpha = 0.35 + Math.sin(t * 4) * 0.1; const gl = g.createRadialGradient(cx, top + 0.5, 0.1, cx, top + 0.5, 0.9); gl.addColorStop(0, 'rgba(255,170,90,.7)'); gl.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gl; g.fillRect(cx - 1, top - 0.5, 2, 2); g.restore(); }
  const arch = () => { g.beginPath(); g.moveTo(cx - w / 2, base); g.lineTo(cx - w / 2, top + w / 2); g.arc(cx, top + w / 2, w / 2, Math.PI, 0); g.lineTo(cx + w / 2, base); g.closePath(); };
  arch(); fs(WALNUT, 0.04);
  // The bubble tubes round the arch, color shifting.
  for (const [r, lw] of [[w / 2 - 0.06, 0.07]]){
    g.beginPath(); g.moveTo(cx - r, base - 0.12); g.lineTo(cx - r, top + w / 2); g.arc(cx, top + w / 2, r, Math.PI, 0); g.lineTo(cx + r, base - 0.12);
    const hue = (t * 40) % 360, gr = g.createLinearGradient(cx - r, top, cx + r, base);
    gr.addColorStop(0, `hsl(${hue},90%,62%)`); gr.addColorStop(0.5, `hsl(${(hue + 120) % 360},90%,62%)`); gr.addColorStop(1, `hsl(${(hue + 240) % 360},90%,62%)`);
    g.strokeStyle = gr; g.lineWidth = lw; g.stroke();
    // Bubbles rising in the side tubes.
    for (const sx of [-1, 1]) for (let k = 0; k < 4; k++){ const f = ((t * (playing ? 0.6 : 0.25) + k * 0.25 + (sx > 0 ? 0.12 : 0)) % 1); circ(cx + sx * r, base - 0.14 - f * (h - w / 2 - 0.14), 0.016); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill(); }
  }
  // The dome window with the record.
  const wy = top + w / 2 + 0.02;
  g.beginPath(); g.arc(cx, wy, w / 2 - 0.13, Math.PI, 0); g.closePath(); fs('#1d1420', 0.025);
  g.save(); g.beginPath(); g.arc(cx, wy, w / 2 - 0.14, Math.PI, 0); g.closePath(); g.clip();
  ell(cx, wy - 0.02, 0.17, 0.06); fs('#141014', 0.01);
  const spin = playing ? t * 5 : 0;
  for (let k = 0; k < 3; k++){ const a = spin + k * 2.1; g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.008; g.beginPath(); g.ellipse(cx, wy - 0.02, 0.13 - k * 0.03, 0.045 - k * 0.01, 0, a, a + 1.2); g.stroke(); }
  ell(cx, wy - 0.02, 0.045, 0.016); g.fillStyle = '#c1121f'; g.fill();
  const arm = playing ? 0.25 : 0.6; g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.015; g.beginPath(); g.moveTo(cx + 0.2, wy - 0.12); g.lineTo(cx + 0.2 - Math.cos(arm) * 0.14, wy - 0.12 + Math.sin(arm) * 0.1); g.stroke();
  g.restore();
  // The selector strip with its glowing buttons, and the chrome grille below.
  rr(cx - 0.26, wy + 0.04, 0.52, 0.12, 0.03); fs('#f4efe6', 0.02);
  for (let k = 0; k < 6; k++){ rr(cx - 0.22 + k * 0.075, wy + 0.07, 0.05, 0.06, 0.012); fs(using && Math.floor(t * 6) % 6 === k ? '#ffd23f' : ['#ff8fab', '#7ed6c8', '#ffe8a3'][k % 3], 0.008); }
  rr(cx - 0.26, wy + 0.2, 0.52, base - wy - 0.3, 0.05); fs('#a8a4a0', 0.02);
  g.strokeStyle = 'rgba(60,50,50,.5)'; g.lineWidth = 0.012; g.beginPath(); for (let k = 0; k < 5; k++){ const gy = wy + 0.25 + k * (base - wy - 0.38) / 4; g.moveTo(cx - 0.22, gy); g.lineTo(cx + 0.22, gy); } g.stroke();
  circ(cx, top + 0.1, 0.045); fs(BRASS, 0.015);
  // Notes drifting up while it plays.
  if (playing) for (let k = 0; k < 3; k++){
    const f = (t * 0.45 + k / 3) % 1, nx = cx + Math.sin(f * 6 + k * 2) * 0.3 + (k - 1) * 0.15, ny = top - 0.05 - f * 0.9;
    g.save(); g.globalAlpha = Math.sin(f * Math.PI); const col = ['#ffd23f', '#ff8fab', '#7ed6c8'][k];
    ell(nx, ny, 0.045, 0.034, -0.4); g.fillStyle = col; g.fill(); g.strokeStyle = col; g.lineWidth = 0.018; g.beginPath(); g.moveTo(nx + 0.04, ny); g.lineTo(nx + 0.04, ny - 0.14); g.lineTo(nx + 0.1, ny - 0.11); g.stroke();
    g.restore();
  }
}
// Oak barrels stacked three high in a cradle, stamped with the rose, with a little tap dripping.
export function barrels(x, y, t){
  const cx = x + 0.5, by = y + 0.82;
  shadow(cx, by, 0.44, 0.12);
  box(x + 0.06, by - 0.2, 0.88, 0.2, 0.1, '#4e2c20', '#3d2219', 0, 0.02);
  const face = (fx, fy, r) => {
    circ(fx, fy, r); fs('#b07a4a', 0.035);
    for (let k = 1; k < 4; k++){ g.strokeStyle = 'rgba(80,45,20,.35)'; g.lineWidth = 0.01; g.beginPath(); g.moveTo(fx - r + k * r / 2, fy - Math.sqrt(Math.max(0, r * r - (r - k * r / 2) ** 2))); g.lineTo(fx - r + k * r / 2, fy + Math.sqrt(Math.max(0, r * r - (r - k * r / 2) ** 2))); g.stroke(); }
    circ(fx, fy, r - 0.025); g.strokeStyle = '#2b2230'; g.lineWidth = 0.03; g.stroke();
    // The rose stamp, burnt in.
    circ(fx, fy - 0.02, 0.045); g.strokeStyle = 'rgba(60,20,10,.6)'; g.lineWidth = 0.014; g.stroke();
    g.beginPath(); g.moveTo(fx, fy + 0.025); g.lineTo(fx, fy + 0.08); g.stroke();
  };
  face(x + 0.28, by - 0.36, 0.22); face(x + 0.72, by - 0.36, 0.22); face(cx, by - 0.74, 0.22);
  // The tap and its drip.
  rr(cx - 0.015, by - 0.72, 0.03, 0.12, 0.01); fs(BRASS, 0.01); rr(cx - 0.03, by - 0.62, 0.06, 0.03, 0.01); fs(BRASS, 0.01);
  const f = (t * 0.7) % 1; if (f < 0.7){ circ(cx, by - 0.58 + f * 0.1, 0.012 + f * 0.01); g.fillStyle = '#c97b2a'; g.fill(); }
}

/* ---------- One entry point for render.js ---------- */
export const TYPES = new Set(['stool', 'bistro', 'booth', 'jukebox', 'barrels', 'darts', 'pool', 'foosball', 'shuffle', 'pinball']);
// Adds the piece's draw calls in sort order. live: { drinks, G, playing, using }.
export function layers(d, t, add, live = {}){
  if (d.type === 'stool' || d.type === 'bistro' || d.type === 'booth') return perchLayers(d, t, add, live);
  if (d.type === 'jukebox') return add(d.y + 0.8, () => jukebox(d.x, d.y, t, live.playing, live.using));
  if (d.type === 'barrels') return add(d.y + 0.8, () => barrels(d.x, d.y, t));
  return A7.layers(d, t, add, live.G);
}
// The whole piece at once (thumbnails and the placement ghost).
export function decor(d, t){
  const Q = [];
  layers(d, t, (y, f) => Q.push([y, f]), {});
  Q.sort((a, b) => a[0] - b[0]);
  for (const [, f] of Q) f();
}
export const THUMB = { stool: [1.3, -0.15], bistro: [2.0, -0.05], booth: [3.1, -0.2], jukebox: [1.9, 0.45], barrels: [1.6, 0.2], darts: [3.4, 0.55], pool: [3.2, -0.45], foosball: [2.2, -0.35], shuffle: [4.1, -0.3], pinball: [2.4, 0.05] };
export { gameSpots, playerPose } from './art7.js';
