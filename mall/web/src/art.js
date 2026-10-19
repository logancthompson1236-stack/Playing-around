// Vector painters. Everything draws in tile units on the current context `g`; PPT is device pixels per tile.
// The renderer and the UI (portraits, intro panels) both call these.
export const OUT = '#3d2b35';
const GOLDEN = '#f2c14e';
import * as A2 from './art2.js';
import * as A3 from './art3.js';
import * as A4 from './art4.js';
// Older WebViews and Safari before 16 lack roundRect.
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r){
    r = Math.max(0, Math.min(+r || 0, Math.abs(w) / 2, Math.abs(h) / 2));
    this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
  };
}
export let g = null;
export let PPT = 64;
export function setTarget(ctx, ppt){ g = ctx; PPT = ppt; }

export function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shade(hex, amt){
  const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255];
  const f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  return `rgb(${c.map(f).join(',')})`;
}

// Is a color light enough that white text on it would be hard to read?
export const light = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 170; };
export const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
export const circ = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); };
export const ell = (x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
export function fs(fill, lw = 0.045, stroke = OUT){
  if (fill){ g.fillStyle = fill; g.fill(); }
  if (lw){ g.lineWidth = lw; g.strokeStyle = stroke; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
}
// A box seen from the 3/4 view: footprint (x, y, w, d) on the floor, height h, raised by z.
export function box(x, y, w, d, h, top, front, z = 0, r = 0.05, lw = 0.045){
  rr(x, y + d - h - z, w, h, r); fs(front, lw);
  rr(x, y - h - z, w, d, r); fs(top, lw);
}
export const shadow = (x, y, rx, ry = rx * 0.36, a = 0.2) => { ell(x, y, rx, ry); g.fillStyle = `rgba(45,30,40,${a})`; g.fill(); };
export function text(s, x, y, size, color, weight = 600, family = 'Fredoka', maxW = 0){
  g.save(); g.translate(x, y); g.scale(1 / PPT, 1 / PPT);
  g.font = `${weight} ${size * PPT}px ${family}, 'Trebuchet MS', sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color;
  if (maxW){ const m = g.measureText(s).width; if (m > maxW * PPT) g.scale(maxW * PPT / m, 1); }
  g.fillText(s, 0, 0);
  g.restore();
}
export function neon(s, x, y, size, color, maxW = 0){
  g.save(); g.shadowColor = color; g.shadowBlur = 0.35 * PPT;
  text(s, x, y, size, color, 700, 'Fredoka', maxW);
  g.shadowBlur = 0.1 * PPT; text(s, x, y, size, '#ffe6f2', 700, 'Fredoka', maxW);
  g.restore();
}

/* ---------- Floors ---------- */
export function floor(kind, x, y, w, h, seed){
  const R = mulberry(seed * 7919 + 13);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const checker = (step, a, b) => {
    g.fillStyle = a; g.fillRect(x, y, w, h); g.fillStyle = b;
    for (let i = 0; i < w / step; i++) for (let j = 0; j < h / step; j++) if ((Math.round(x / step) + Math.round(y / step) + i + j) % 2) g.fillRect(x + i * step, y + j * step, step, step);
  };
  const grid = (step, col, lw) => {
    g.beginPath();
    for (let i = 0; i <= w / step; i++){ g.moveTo(x + i * step, y); g.lineTo(x + i * step, y + h); }
    for (let j = 0; j <= h / step; j++){ g.moveTo(x, y + j * step); g.lineTo(x + w, y + j * step); }
    g.strokeStyle = col; g.lineWidth = lw; g.stroke();
  };
  const planks = (a, b, line) => {
    g.fillStyle = a; g.fillRect(x, y, w, h);
    for (let j = 0; j < h * 4; j++){
      const off = (j % 3) * 0.4;
      g.fillStyle = j % 2 ? b : a; g.fillRect(x, y + j * 0.25, w, 0.25);
      g.strokeStyle = line; g.lineWidth = 0.02; g.beginPath(); g.moveTo(x, y + j * 0.25); g.lineTo(x + w, y + j * 0.25);
      for (let i = off; i < w; i += 1.2){ g.moveTo(x + i, y + j * 0.25); g.lineTo(x + i, y + j * 0.25 + 0.25); }
      g.stroke();
    }
  };
  if (kind === 'concourse'){
    checker(1, '#f8ebcf', '#f2e0bd'); grid(1, 'rgba(150,110,80,.2)', 0.025);
    for (let k = 0; k < w * h * 10; k++){
      g.fillStyle = ['rgba(92,200,191,.4)', 'rgba(242,140,168,.4)', 'rgba(160,120,90,.25)'][k % 3];
      g.fillRect(x + R() * w, y + R() * h, 0.045, 0.045);
    }
    for (let i = 0; i <= w; i++) for (let j = 0; j <= h; j++){
      const gx = Math.round(x + i), gy = Math.round(y + j);
      if (gx % 2 || gy % 2) continue;
      g.beginPath(); g.moveTo(gx, gy - 0.17); g.lineTo(gx + 0.17, gy); g.lineTo(gx, gy + 0.17); g.lineTo(gx - 0.17, gy); g.closePath();
      g.fillStyle = ((gx + gy) / 2) % 2 ? '#f28ca8' : '#5cc8bf'; g.fill();
    }
  } else if (kind === 'candy'){ checker(0.5, '#fff3f6', '#ffc9d6'); grid(0.5, 'rgba(232,87,126,.15)', 0.02); }
  else if (kind === 'carpet'){
    g.fillStyle = '#3a2a66'; g.fillRect(x, y, w, h);
    const cs = ['#ff5fa2', '#3ee0d0', '#ffd23f', '#9b7bff'];
    for (let k = 0; k < w * h * 7; k++){
      const px = x + R() * w, py = y + R() * h, c = cs[k % 4], s = R();
      g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 0.035;
      if (s < 0.33){ circ(px, py, 0.045); g.fill(); }
      else if (s < 0.66){ g.beginPath(); g.moveTo(px, py - 0.06); g.lineTo(px + 0.06, py + 0.05); g.lineTo(px - 0.06, py + 0.05); g.closePath(); g.fill(); }
      else { g.beginPath(); g.moveTo(px - 0.08, py); g.quadraticCurveTo(px - 0.04, py - 0.07, px, py); g.quadraticCurveTo(px + 0.04, py + 0.07, px + 0.08, py); g.stroke(); }
    }
  }
  else if (kind === 'diner'){ checker(1, '#fdf5e6', '#cdeee6'); grid(1, 'rgba(60,120,110,.16)', 0.025); }
  else if (kind === 'terracotta'){
    g.fillStyle = '#f6e9d6'; g.fillRect(x, y, w, h);
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++){
      const v = hash(i, j);
      g.fillStyle = v < 0.33 ? '#efc1a2' : v < 0.66 ? '#ebba99' : '#f2c8aa'; g.fillRect(i + 0.04, j + 0.04, 0.92, 0.92);
    }
    for (let i = Math.floor(x); i <= x + w; i++) for (let j = Math.floor(y); j <= Math.ceil(y + h); j++){
      if ((i + j) % 2) continue;
      g.save(); g.translate(i, j); g.rotate(Math.PI / 4);
      g.fillStyle = '#f7ead6'; g.fillRect(-0.13, -0.13, 0.26, 0.26); g.fillStyle = '#62bfb3'; g.fillRect(-0.065, -0.065, 0.13, 0.13);
      g.restore();
    }
  }
  else if (kind === 'flagstone'){
    // Irregular pavers: a grid of jittered corners, each cell drawn as a stone shrunk toward its middle.
    g.fillStyle = '#d2c5ae'; g.fillRect(x, y, w, h);
    const st = 0.8, cols = ['#ede6d7', '#e6ddcb', '#dfd4c0', '#f1ebdf', '#e4d9c5'];
    const P = (i, j) => [i * st + (hash(i, j, 1) - 0.5) * 0.34, j * st + (hash(i, j, 2) - 0.5) * 0.34];
    g.lineJoin = 'round'; g.lineWidth = 0.06;
    for (let i = Math.floor(x / st) - 1; i <= (x + w) / st; i++) for (let j = Math.floor(y / st) - 1; j <= (y + h) / st; j++){
      const q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
      g.beginPath(); q.forEach(([px, py], k) => { const sx = cx + (px - cx) * 0.86, sy = cy + (py - cy) * 0.86; if (k) g.lineTo(sx, sy); else g.moveTo(sx, sy); }); g.closePath();
      g.fillStyle = g.strokeStyle = cols[Math.floor(hash(i, j, 3) * cols.length)]; g.fill(); g.stroke();
    }
  }
  else if (kind === 'herring'){
    // Herringbone: planks two units long, u wide, in diagonal strips repeating every 4u.
    const u = 0.25, X0 = Math.floor(x / u) - 6, X1 = Math.ceil((x + w) / u) + 2, Y0 = Math.floor(y / u) - 3, Y1 = Math.ceil((y + h) / u) + 1;
    g.strokeStyle = 'rgba(120,78,40,.2)'; g.lineWidth = 0.018;
    for (let n = Y0; n <= Y1; n++) for (let k = Math.ceil((X0 - n) / 4); k <= Math.floor((X1 - n) / 4); k++){
      const px = n + 4 * k;
      for (const [ax, ay, aw, ah, t] of [[px, n, 2, 1, 0], [px, n + 1, 1, 2, 1]]){
        const v = hash(px, n, t);
        g.fillStyle = t ? (v < 0.5 ? '#e3c091' : '#dfbb8b') : (v < 0.5 ? '#e9c898' : '#e6c494');
        g.fillRect(ax * u, ay * u, aw * u, ah * u); g.strokeRect(ax * u, ay * u, aw * u, ah * u);
      }
    }
  }
  else if (kind === 'marble'){
    // Big 2x2 slabs with soft veins and gold seams.
    for (let i = Math.floor(x / 2) * 2; i < x + w; i += 2) for (let j = Math.floor(y / 2) * 2; j < y + h; j += 2){
      g.fillStyle = ((i + j) / 2) % 2 ? '#ede8e2' : '#f7f4f0'; g.fillRect(i, j, 2, 2);
      marbleVeins(mulberry(i * 131 + j * 977 + 5), i, j, 2);
    }
    g.strokeStyle = 'rgba(205,165,85,.7)'; g.lineWidth = 0.035; g.beginPath();
    for (let i = Math.ceil(x / 2) * 2; i <= x + w; i += 2){ g.moveTo(i, y); g.lineTo(i, y + h); }
    for (let j = Math.ceil(y / 2) * 2; j <= y + h; j += 2){ g.moveTo(x, j); g.lineTo(x + w, j); }
    g.stroke();
  }
  else if (kind === 'pizzeria'){ checker(0.5, '#fff6ea', '#e9c9b4'); grid(0.5, 'rgba(193,80,46,.15)', 0.02); }
  else if (kind === 'mosaic'){
    // Tiny glossy tiles in every color, in soft bands.
    g.fillStyle = '#fff7ec'; g.fillRect(x, y, w, h);
    // Mostly cream, with soft rainbow diagonals running through it.
    const cs = ['#ffd3e0', '#ffe6bf', '#d9f0cf', '#cfeaf6', '#e2d6f6', '#ffdccb'];
    for (let i = Math.floor(x * 4); i < (x + w) * 4; i++) for (let j = Math.floor(y * 4); j < (y + h) * 4; j++){
      const v = hash(i, j, 5), band = Math.floor((i + j) / 3);
      g.fillStyle = band % 3 === 0 || v < 0.12 ? cs[(Math.floor(band / 3) + (v < 0.12 ? 2 : 0)) % cs.length] : (v < 0.55 ? '#fff6ea' : '#fbefdf');
      g.fillRect(i / 4 + 0.012, j / 4 + 0.012, 0.226, 0.226);
    }
  }
  else if (kind === 'starlight'){
    g.fillStyle = '#2a2f5c'; g.fillRect(x, y, w, h);
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++) for (let k = 0; k < 3; k++){
      const v = hash(i, j, k + 20), sx = i + hash(i, j, k + 40), sy = j + hash(i, j, k + 60);
      if (v < 0.5){ circ(sx, sy, 0.02 + v * 0.03); g.fillStyle = v < 0.15 ? '#f2d68a' : 'rgba(255,255,255,.6)'; g.fill(); }
    }
  }
  else if (kind === 'bamboo'){
    g.fillStyle = '#efdcb0'; g.fillRect(x, y, w, h);
    for (let j = Math.floor(y * 5); j < (y + h) * 5; j++){
      const yy = j / 5; g.fillStyle = j % 2 ? '#e8d3a3' : '#f2e2bb'; g.fillRect(x, yy, w, 0.2);
      g.strokeStyle = 'rgba(140,110,60,.25)'; g.lineWidth = 0.015; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy);
      for (let i = Math.floor(x) + (j % 3) * 0.33; i < x + w; i += 1){ g.moveTo(i, yy + 0.04); g.lineTo(i, yy + 0.16); }
      g.stroke();
    }
  }
  else if (kind === 'goldterrazzo'){
    g.fillStyle = '#f8f5ef'; g.fillRect(x, y, w, h);
    for (let k = 0; k < w * h * 14; k++){ const v = R(); g.fillStyle = v < 0.25 ? 'rgba(212,176,106,.85)' : v < 0.6 ? 'rgba(160,150,140,.35)' : 'rgba(200,190,180,.4)'; g.fillRect(x + R() * w, y + R() * h, 0.05 + (v < 0.25 ? 0.03 : 0), 0.04); }
    grid(2, 'rgba(205,165,85,.5)', 0.03);
  }
  else if (kind === 'seatile'){
    g.fillStyle = '#eadfc8'; g.fillRect(x, y, w, h);
    const cs = ['#a8dcd9', '#8ccfd6', '#bfe6e4', '#9fd3ea'];
    for (let i = Math.floor(x * 2); i < (x + w) * 2; i++) for (let j = Math.floor(y * 2); j < (y + h) * 2; j++){ g.fillStyle = cs[Math.floor(hash(i, j, 7) * cs.length)]; rr(i / 2 + 0.03, j / 2 + 0.03, 0.44, 0.44, 0.05); g.fill(); }
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++) if (hash(i, j, 8) < 0.08){ g.fillStyle = '#f2c8aa'; g.save(); g.translate(i + 0.5, j + 0.5); for (let k = 0; k < 5; k++){ g.rotate(Math.PI * 2 / 5); ell(0, -0.08, 0.035, 0.08); g.fill(); } g.restore(); }
  }
  else if (kind === 'royal'){
    g.fillStyle = '#9b2335'; g.fillRect(x, y, w, h);
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++){
      g.strokeStyle = 'rgba(242,214,138,.45)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(i + 0.5, j + 0.2); g.lineTo(i + 0.8, j + 0.5); g.lineTo(i + 0.5, j + 0.8); g.lineTo(i + 0.2, j + 0.5); g.closePath(); g.stroke();
      circ(i + 0.5, j + 0.5, 0.05); g.fillStyle = 'rgba(242,214,138,.55)'; g.fill();
    }
  }
  else if (kind === 'crystal'){
    for (let i = Math.floor(x / 2) * 2; i < x + w; i += 2) for (let j = Math.floor(y / 2) * 2; j < y + h; j += 2){
      const gr = g.createLinearGradient(i, j, i + 2, j + 2); gr.addColorStop(0, '#f7f3ff'); gr.addColorStop(0.5, '#fdf3f6'); gr.addColorStop(1, '#eef7fb');
      g.fillStyle = gr; g.fillRect(i, j, 2, 2); marbleVeins(mulberry(i * 71 + j * 13 + 3), i, j, 2);
    }
    g.strokeStyle = 'rgba(190,170,240,.6)'; g.lineWidth = 0.03; g.beginPath();
    for (let i = Math.ceil(x / 2) * 2; i <= x + w; i += 2){ g.moveTo(i, y); g.lineTo(i, y + h); }
    for (let j = Math.ceil(y / 2) * 2; j <= y + h; j += 2){ g.moveTo(x, j); g.lineTo(x + w, j); }
    g.stroke();
  }
  else if (kind === 'starburst'){
    checker(1, '#fbf8f2', '#2b2230');
    for (let i = Math.floor(x); i <= x + w; i++) for (let j = Math.floor(y); j <= y + h; j++){
      g.save(); g.translate(i, j); g.fillStyle = '#e0a526';
      g.beginPath(); for (let k = 0; k < 16; k++){ const a = k / 16 * Math.PI * 2, r = k % 2 ? 0.06 : 0.2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
      g.restore();
    }
  }
  else if (kind === 'casinocarpet'){
    // The classic busy casino carpet: deep red with gold and teal swirls and little stars.
    g.fillStyle = '#5c1028'; g.fillRect(x, y, w, h);
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++){
      const v = hash(i, j, 31);
      g.strokeStyle = 'rgba(242,193,78,.55)'; g.lineWidth = 0.035; g.beginPath(); g.arc(i + 0.5, j + 0.5, 0.28, v * 6, v * 6 + 3.6); g.stroke();
      g.strokeStyle = 'rgba(64,196,180,.5)'; g.beginPath(); g.arc(i + (v < 0.5 ? 0 : 1), j + (v < 0.5 ? 1 : 0), 0.32, 0, Math.PI * 2); g.stroke();
      if (v < 0.3){ circ(i + 0.5, j + 0.5, 0.05); g.fillStyle = '#ffd23f'; g.fill(); }
    }
  }
  else if (kind === 'vipcarpet'){
    g.fillStyle = '#c99a2e'; g.fillRect(x, y, w, h);
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++){
      g.fillStyle = 'rgba(40,20,10,.75)'; g.beginPath(); g.moveTo(i + 0.5, j + 0.2); g.lineTo(i + 0.8, j + 0.5); g.lineTo(i + 0.5, j + 0.8); g.lineTo(i + 0.2, j + 0.5); g.closePath(); g.fill();
      circ(i + 0.5, j + 0.5, 0.06); g.fillStyle = '#ffe9a8'; g.fill();
    }
  }
  else if (kind === 'play'){ checker(1, '#e8f4ff', '#fff4d6'); grid(1, 'rgba(90,141,238,.18)', 0.025); for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++){ const v = hash(i, j, 9); if (v < 0.3){ circ(i + 0.5, j + 0.5, 0.08); g.fillStyle = ['rgba(239,71,111,.35)', 'rgba(255,210,63,.45)', 'rgba(6,214,160,.35)'][Math.floor(v * 10) % 3]; g.fill(); } } }
  else if (kind === 'blush'){ checker(0.5, '#fff0f6', '#fbe3ef'); grid(1, 'rgba(199,125,255,.18)', 0.02); }
  else if (kind === 'neon'){ checker(1, '#241a4a', '#2c2158'); grid(1, 'rgba(76,201,240,.45)', 0.03); }
  else if (kind === 'cinema'){ checker(0.5, '#5b2a3e', '#53263a'); grid(1, 'rgba(255,210,63,.12)', 0.02); }
  else if (kind === 'bounce'){ checker(1, '#e9f3ff', '#d9e8fb'); grid(1, 'rgba(90,141,238,.2)', 0.03); }
  else if (kind === 'mint'){ checker(1, '#e3f6ea', '#c9ecd8'); grid(1, 'rgba(60,140,100,.2)', 0.025); }
  else if (kind === 'wood'){ planks('#ead2ac', '#e2c69b', 'rgba(120,80,40,.2)'); }
  else if (kind === 'court'){
    // Gym floor: honey planks with painted court lines.
    planks('#e9c28a', '#e0b67a', 'rgba(120,80,40,.18)');
    g.strokeStyle = 'rgba(29,111,184,.55)'; g.lineWidth = 0.05; g.beginPath(); g.arc(x + w / 2, y + h, Math.min(w, h * 2) * 0.32, Math.PI, 0); g.stroke();
    g.strokeStyle = 'rgba(255,159,28,.6)'; g.lineWidth = 0.035; g.strokeRect(x + 0.12, y + 0.12, w - 0.24, h - 0.24);
  }
  else if (kind === 'wood2'){ planks('#c49a6c', '#b98d5f', 'rgba(70,40,20,.25)'); }
  else if (kind === 'grass'){ checker(0.5, '#d5f0d0', '#c2e8bb'); grid(0.5, 'rgba(40,120,60,.12)', 0.02); }
  else if (kind === 'cafe'){ checker(0.5, '#f2e3cf', '#c99f7a'); grid(0.5, 'rgba(80,50,30,.15)', 0.02); }
  else if (kind === 'plain'){ checker(1, '#efe8f5', '#e7def0'); grid(1, 'rgba(90,70,110,.15)', 0.025); }
  else if (kind === 'sidewalk'){ g.fillStyle = '#d6d0c6'; g.fillRect(x, y, w, h); grid(1, 'rgba(80,70,60,.2)', 0.03); }
  else if (kind === 'asphalt'){
    g.fillStyle = '#5b5560'; g.fillRect(x, y, w, h);
    for (let k = 0; k < w * h * 6; k++){ g.fillStyle = `rgba(255,255,255,${0.04 + R() * 0.06})`; g.fillRect(x + R() * w, y + R() * h, 0.04, 0.04); }
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 0.06; g.beginPath();
    for (let i = Math.ceil(x); i <= x + w; i += 2){ g.moveTo(i, y + 0.15); g.lineTo(i, y + h); }
    g.stroke();
  }
  else if (kind === 'dust' || kind === 'dark'){
    if (kind === 'dust') checker(1, '#a9a092', '#a1978a'); else checker(1, '#5a5360', '#524b58');
    grid(1, 'rgba(40,30,30,.3)', 0.03);
    for (let k = 0; k < w * h * 1.2; k++){
      g.fillStyle = `rgba(${R() < 0.5 ? '110,98,84' : '195,185,170'},${(kind === 'dark' ? 0.08 : 0.15) + R() * 0.2})`;
      ell(x + R() * w, y + R() * h, 0.2 + R() * 0.4, 0.1 + R() * 0.25, R() * 3); g.fill();
    }
    g.strokeStyle = 'rgba(50,40,35,.45)'; g.lineWidth = 0.02;
    for (let k = 0; k < w * h * 0.5; k++){
      let px = x + R() * w, py = y + R() * h; g.beginPath(); g.moveTo(px, py);
      for (let s = 0; s < 3; s++){ px += (R() - 0.5) * 0.4; py += (R() - 0.5) * 0.4; g.lineTo(px, py); }
      g.stroke();
    }
    for (let k = 0; k < w * h * 0.5; k++){
      g.save(); g.translate(x + R() * w, y + R() * h); g.rotate(R() * 3);
      g.fillStyle = kind === 'dark' ? 'rgba(160,150,140,.5)' : 'rgba(240,235,220,.8)'; g.fillRect(-0.07, -0.05, 0.14, 0.1); g.restore();
    }
  }
  g.restore();
}

/* ---------- Small decorative bits ---------- */
export function cobweb(x, y, s, dir, flipY = 1){
  g.save(); g.translate(x, y); g.scale(dir, flipY);
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.018;
  const angs = [0, 0.4, 0.8, 1.2, Math.PI / 2];
  g.beginPath();
  for (const a of angs){ g.moveTo(0, 0); g.lineTo(Math.cos(a) * s, Math.sin(a) * s); }
  for (let k = 1; k <= 3; k++){
    const r = s * k / 3.3; g.moveTo(r, 0);
    for (let i = 1; i < angs.length; i++){
      const am = (angs[i - 1] + angs[i]) / 2;
      g.quadraticCurveTo(Math.cos(am) * r * 0.8, Math.sin(am) * r * 0.8, Math.cos(angs[i]) * r, Math.sin(angs[i]) * r);
    }
  }
  g.stroke(); g.restore();
}
export function forLease(x, y, rot, s = 1){
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(-0.42, -0.2, 0.84, 0.4, 0.03); fs('#fdfaf2', 0.035);
  text('FOR LEASE', 0, -0.06, 0.15, '#d62839', 700);
  g.fillStyle = 'rgba(61,43,53,.5)'; g.fillRect(-0.25, 0.08, 0.5, 0.025);
  g.fillStyle = 'rgba(255,240,180,.85)'; g.fillRect(-0.48, -0.24, 0.16, 0.07); g.fillRect(0.32, -0.24, 0.16, 0.07);
  g.restore();
}
export function planks(x0, x1, yBase, h, seed){
  const R = mulberry(seed), n = Math.max(2, Math.round(h / 0.22)), ph = h / n;
  for (let i = 0; i < n; i++){
    const y = yBase - h + i * ph + ph / 2;
    g.save(); g.translate((x0 + x1) / 2, y); g.rotate((R() - 0.5) * 0.08);
    rr(-(x1 - x0) / 2 - 0.05, -ph * 0.45, x1 - x0 + 0.1, ph * 0.9, 0.03); fs(i % 2 ? '#c69462' : '#b8834f', 0.04);
    for (const nx of [-(x1 - x0) / 2 + 0.1, (x1 - x0) / 2 - 0.1]){ circ(nx, 0, 0.02); fs('#5a4a4a', 0); }
    g.restore();
  }
}
export function cardboard(x, y, w, d, h, z = 0){
  box(x, y, w, d, h, '#dcb07e', '#c4925f', z, 0.03);
  g.fillStyle = 'rgba(255,240,200,.6)'; g.fillRect(x + w / 2 - 0.04, y - h - z, 0.08, d);
}
export function deadPlant(x, y){
  shadow(x, y, 0.22, 0.07);
  rr(x - 0.18, y - 0.3, 0.36, 0.3, 0.06); fs('#9a6f5c');
  g.strokeStyle = '#7c6a4a'; g.lineWidth = 0.035;
  for (const a of [-2.4, -1.9, -1.2, -0.7]){ g.beginPath(); g.moveTo(x, y - 0.3); g.quadraticCurveTo(x + Math.cos(a) * 0.25, y - 0.3 + Math.sin(a) * 0.35, x + Math.cos(a) * 0.35, y - 0.25); g.stroke(); }
}
export function glass(x, y, w, h = 0.45, tint = 'rgba(185,228,245,.85)'){
  box(x, y, w, 0.14, h, '#f4fbff', tint, 0, 0.04, 0.04);
  if (w > 0.4){
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 0.035;
    g.beginPath(); g.moveTo(x + 0.12, y + 0.14 - 0.08); g.lineTo(x + 0.28, y + 0.14 - h + 0.06); g.moveTo(x + 0.26, y + 0.14 - 0.08); g.lineTo(x + 0.36, y + 0.14 - h + 0.15); g.stroke();
  }
}

/* ---------- Icons used in bubbles, signs and the UI ---------- */
export function pretzelIcon(x, y, s){
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round';
  const path = () => {
    g.beginPath(); g.moveTo(-0.42, 0.32); g.bezierCurveTo(-0.95, -0.05, -0.55, -0.72, -0.08, -0.3);
    g.bezierCurveTo(0.12, -0.1, 0.18, 0.12, 0.42, 0.32);
    g.moveTo(0.42, 0.32); g.bezierCurveTo(0.95, -0.05, 0.55, -0.72, 0.08, -0.3);
    g.bezierCurveTo(-0.12, -0.1, -0.18, 0.12, -0.42, 0.32);
  };
  path(); g.strokeStyle = OUT; g.lineWidth = 0.3; g.stroke();
  path(); g.strokeStyle = '#c47a35'; g.lineWidth = 0.19; g.stroke();
  g.fillStyle = '#fff'; for (const [a, b] of [[-0.5, -0.2], [0.45, -0.25], [0, 0.1], [-0.25, 0.25], [0.3, 0.2]]) g.fillRect(a, b, 0.06, 0.06);
  g.restore();
}
export function pawIcon(x, y, s, c = '#8a5a44'){
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(0, 0.12, 0.26, 0.21); fs(c, 0);
  for (const [a, b] of [[-0.3, -0.12], [-0.11, -0.3], [0.11, -0.3], [0.3, -0.12]]){ ell(a, b, 0.1, 0.12); fs(c, 0); }
  g.restore();
}
export function heartPath(x, y, s){
  g.beginPath(); g.moveTo(x, y + s * 0.35);
  g.bezierCurveTo(x - s * 0.9, y - s * 0.2, x - s * 0.35, y - s * 0.75, x, y - s * 0.3);
  g.bezierCurveTo(x + s * 0.35, y - s * 0.75, x + s * 0.9, y - s * 0.2, x, y + s * 0.35);
}
export function storeIcon(icon, x, y, s, mono = null){
  g.save(); g.translate(x, y); g.scale(s, s);
  const c = col => mono || col;
  switch (icon){
    case 'pretzel': pretzelIcon(0, 0, 1); break;
    case 'hotdog': A2.hotdogIcon(c); break;
    case 'leaf': A2.leafIcon(c); break;
    case 'chip': A3.chipIcon(c); break;
    case 'cocktail': A3.cocktailIcon(c); break;
    case 'clover': A3.cloverIcon(c); break;
    case 'ring': A2.ringIcon(c); break;
    case 'boba': A2.bobaIcon(c); break;
    case 'vr': A2.vrIcon(c); break;
    case 'cupcake': A2.cupcakeIcon(c); break;
    case 'comic': A2.comicIcon(c); break;
    case 'lemon': case 'ball': case 'lipstick': case 'taco': case 'noodle': case 'cotton': case 'brush': case 'sushi': A4.icon(icon, c); break;
    case 'pizza': A2.pizzaIcon(c); break;
    case 'dollar': text('$', 0, 0.02, 1.25, c('#2f9e6a'), 700); break;
    case 'candy':
      circ(0, 0, 0.36); fs(c('#ff6b8b'), 0.09);
      g.beginPath(); for (let a = 0; a < 12; a += 0.3){ const r = 0.028 * a; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.strokeStyle = '#fff'; g.lineWidth = 0.08; g.stroke(); break;
    case 'joystick':
      rr(-0.42, 0.05, 0.84, 0.32, 0.1); fs(c('#7b2cbf'), 0.08);
      rr(-0.05, -0.3, 0.1, 0.38, 0.04); fs('#3d2b35', 0);
      circ(0, -0.34, 0.15); fs(c('#ef476f'), 0.07);
      circ(0.24, 0.2, 0.06); fs('#ffd23f', 0); break;
    case 'shirt':
      g.beginPath(); g.moveTo(-0.18, -0.38); g.lineTo(-0.45, -0.22); g.lineTo(-0.32, 0.0); g.lineTo(-0.22, -0.06); g.lineTo(-0.22, 0.4); g.lineTo(0.22, 0.4); g.lineTo(0.22, -0.06); g.lineTo(0.32, 0); g.lineTo(0.45, -0.22); g.lineTo(0.18, -0.38); g.quadraticCurveTo(0, -0.22, -0.18, -0.38); fs(c('#5a8dee'), 0.08); break;
    case 'paw': pawIcon(0, 0, 1, c('#8a5a44')); break;
    case 'cup':
      rr(-0.3, -0.25, 0.5, 0.55, 0.1); fs(c('#fff'), 0.08);
      g.beginPath(); g.arc(0.24, 0.0, 0.13, -1.2, 1.2); g.strokeStyle = OUT; g.lineWidth = 0.08; g.stroke();
      g.strokeStyle = c('#8a5a44'); g.lineWidth = 0.06; g.beginPath(); g.moveTo(-0.15, -0.35); g.quadraticCurveTo(-0.05, -0.5, -0.12, -0.6); g.moveTo(0.02, -0.35); g.quadraticCurveTo(0.12, -0.5, 0.05, -0.6); g.stroke(); break;
    case 'book':
      rr(-0.4, -0.3, 0.38, 0.6, 0.04); fs(c('#3d5a80'), 0.08); rr(0.02, -0.3, 0.38, 0.6, 0.04); fs(c('#e07a5f'), 0.08); break;
    case 'heart': heartPath(0, 0.05, 0.9); fs(c('#ef476f'), 0.08); break;
    case 'cone':
      g.beginPath(); g.moveTo(-0.2, -0.05); g.lineTo(0.2, -0.05); g.lineTo(0, 0.48); g.closePath(); fs(c('#e0a96d'), 0.08);
      circ(-0.1, -0.12, 0.18); fs(c('#ff8fc8'), 0.08); circ(0.1, -0.16, 0.18); fs(c('#7ed6c8'), 0.08); circ(0, -0.34, 0.16); fs(c('#fff3d6'), 0.08); break;
    case 'record':
      circ(0, 0, 0.42); fs(c('#2b2d42'), 0.08);
      g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.03; g.beginPath(); g.arc(0, 0, 0.3, -2.4, -1.2); g.stroke();
      circ(0, 0, 0.15); fs(c('#ffd23f'), 0.05); circ(0, 0, 0.035); fs(OUT, 0); break;
    case 'tv':
      g.strokeStyle = OUT; g.lineWidth = 0.06; g.beginPath(); g.moveTo(-0.05, -0.28); g.lineTo(-0.22, -0.5); g.moveTo(0.05, -0.28); g.lineTo(0.22, -0.5); g.stroke();
      rr(-0.42, -0.3, 0.84, 0.62, 0.12); fs(c('#118ab2'), 0.08);
      rr(-0.32, -0.21, 0.5, 0.44, 0.08); fs(c('#a8f0e6'), 0.05);
      circ(0.29, -0.1, 0.05); fs('#ffd23f', 0.03); circ(0.29, 0.08, 0.05); fs('#ef476f', 0.03); break;
    case 'film':
      rr(-0.42, -0.12, 0.84, 0.5, 0.06); fs(c('#3d2b56'), 0.08);
      g.save(); g.translate(-0.42, -0.14); g.rotate(-0.35); rr(0, -0.16, 0.86, 0.16, 0.03); fs(c('#ffd23f'), 0.07); g.restore();
      for (let i = 0; i < 4; i++){ g.fillStyle = '#fff'; g.fillRect(-0.32 + i * 0.2, 0.0, 0.1, 0.06); }
      circ(0, 0.2, 0.08); fs('#ef476f', 0); break;
    case 'bounce':
      ell(0, 0.22, 0.42, 0.14); fs(c('#3d405b'), 0.07); ell(0, 0.2, 0.32, 0.09); fs(c('#5a8dee'), 0);
      circ(0, -0.2, 0.1); fs('#ffd23f', 0.05); g.strokeStyle = OUT; g.lineWidth = 0.06; g.beginPath(); g.moveTo(0, -0.1); g.lineTo(0, 0.05); g.moveTo(-0.15, -0.05); g.lineTo(0.15, -0.05); g.stroke(); break;
    case 'wc':
      rr(-0.42, -0.36, 0.84, 0.72, 0.14); fs(c('#5cc8bf'), 0.08);
      for (const [px, dress] of [[-0.18, false], [0.18, true]]){
        circ(px, -0.17, 0.07); fs('#fff', 0);
        if (dress){ g.beginPath(); g.moveTo(px - 0.11, 0.2); g.lineTo(px, -0.07); g.lineTo(px + 0.11, 0.2); g.closePath(); fs('#fff', 0); }
        else rr(px - 0.07, -0.07, 0.14, 0.28, 0.04), fs('#fff', 0);
      }
      g.fillStyle = '#fff'; g.fillRect(-0.015, -0.28, 0.03, 0.52); break;
    case 'phone':
      rr(-0.2, -0.38, 0.4, 0.76, 0.08); fs(c('#3d405b'), 0.08);
      rr(-0.14, -0.3, 0.28, 0.5, 0.04); fs(c('#8ecae6'), 0);
      circ(0, 0.29, 0.04); fs('#fff', 0); break;
    case 'toy':     // a teddy bear head
      circ(-0.28, -0.26, 0.15); fs(c('#c98b55'), 0.07); circ(0.28, -0.26, 0.15); fs(c('#c98b55'), 0.07);
      circ(0, 0.02, 0.38); fs(c('#e0a96d'), 0.08); ell(0, 0.14, 0.17, 0.12); fs('#f6dcc0', 0.05);
      circ(-0.13, -0.06, 0.045); fs(OUT, 0); circ(0.13, -0.06, 0.045); fs(OUT, 0); circ(0, 0.08, 0.05); fs(OUT, 0); break;
    case 'perfume': // a faceted bottle with a round cap
      rr(-0.1, -0.5, 0.2, 0.16, 0.05); fs(c('#ffd23f'), 0.07);
      rr(-0.32, -0.34, 0.64, 0.74, 0.18); fs(c('#e0b0ff'), 0.08);
      rr(-0.2, -0.2, 0.16, 0.4, 0.06); g.fillStyle = 'rgba(255,255,255,.55)'; g.fill(); break;
    case 'controller':
      g.beginPath(); g.moveTo(-0.3, -0.22); g.lineTo(0.3, -0.22); g.quadraticCurveTo(0.5, -0.22, 0.5, 0.05); g.quadraticCurveTo(0.52, 0.34, 0.32, 0.3); g.lineTo(0.18, 0.12); g.lineTo(-0.18, 0.12); g.lineTo(-0.32, 0.3); g.quadraticCurveTo(-0.52, 0.34, -0.5, 0.05); g.quadraticCurveTo(-0.5, -0.22, -0.3, -0.22); g.closePath(); fs(c('#4cc9f0'), 0.08);
      g.fillStyle = OUT; g.fillRect(-0.32, -0.05, 0.18, 0.06); g.fillRect(-0.26, -0.11, 0.06, 0.18);
      circ(0.24, -0.06, 0.05); fs('#ef476f', 0); circ(0.34, 0.04, 0.05); fs('#ffd23f', 0); break;
    case 'shoe':
      g.beginPath(); g.moveTo(-0.42, -0.3); g.lineTo(-0.1, -0.3); g.quadraticCurveTo(0.0, -0.05, 0.25, 0.0); g.quadraticCurveTo(0.46, 0.04, 0.46, 0.2); g.lineTo(0.46, 0.28); g.lineTo(-0.42, 0.28); g.closePath(); fs(c('#e76f51'), 0.08);
      g.fillStyle = '#fff'; g.fillRect(-0.42, 0.16, 0.88, 0.1); g.strokeStyle = '#fff'; g.lineWidth = 0.05; g.beginPath(); g.moveTo(-0.12, -0.12); g.lineTo(0.02, -0.18); g.moveTo(-0.06, -0.04); g.lineTo(0.08, -0.1); g.stroke(); break;
    case 'burger':
      g.beginPath(); g.moveTo(-0.42, -0.04); g.quadraticCurveTo(-0.42, -0.42, 0, -0.42); g.quadraticCurveTo(0.42, -0.42, 0.42, -0.04); g.closePath(); fs(c('#e9a35a'), 0.07);
      for (const [sx, sy] of [[-0.18, -0.26], [0.04, -0.32], [0.2, -0.22]]){ ell(sx, sy, 0.04, 0.022, 0.3); fs('#fff6e0', 0); }
      rr(-0.46, -0.06, 0.92, 0.1, 0.05); fs('#7bd389', 0.05);
      rr(-0.42, 0.04, 0.84, 0.13, 0.05); fs('#8a4b2e', 0.05);
      rr(-0.42, 0.17, 0.84, 0.15, 0.07); fs(c('#e9a35a'), 0.07); break;
    case 'angry':   // a cross little face: the troublemaker's bubble
      circ(0, 0, 0.38); fs(c('#ef476f'), 0.08);
      g.strokeStyle = OUT; g.lineWidth = 0.07; g.beginPath(); g.moveTo(-0.22, -0.16); g.lineTo(-0.06, -0.08); g.moveTo(0.22, -0.16); g.lineTo(0.06, -0.08); g.stroke();
      circ(-0.12, 0.0, 0.05); fs(OUT, 0); circ(0.12, 0.0, 0.05); fs(OUT, 0);
      g.beginPath(); g.arc(0, 0.22, 0.12, Math.PI + 0.4, -0.4); g.stroke(); break;
    case 'shield':
      g.beginPath(); g.moveTo(0, -0.42); g.lineTo(0.36, -0.28); g.quadraticCurveTo(0.34, 0.2, 0, 0.42); g.quadraticCurveTo(-0.34, 0.2, -0.36, -0.28); g.closePath(); fs(c('#1d3557'), 0.08);
      g.save(); g.translate(0, 0); g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.07 : 0.17; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); fs('#ffd23f', 0.03); g.restore(); break;
    case 'box': box(-0.38, -0.05, 0.76, 0.38, 0.4, '#e8c08a', '#c4925f', 0, 0.03, 0.08); g.fillStyle = 'rgba(61,43,53,.3)'; g.fillRect(-0.05, -0.45, 0.1, 0.38); break;
    case 'sun':
      for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a - 0.2) * 0.3, Math.sin(a - 0.2) * 0.3); g.lineTo(Math.cos(a) * 0.48, Math.sin(a) * 0.48); g.lineTo(Math.cos(a + 0.2) * 0.3, Math.sin(a + 0.2) * 0.3); fs(c('#ff9f43'), 0.05); }
      circ(0, 0, 0.32); fs(c('#ffd23f'), 0.08); circ(-0.1, -0.05, 0.035); fs(OUT, 0); circ(0.1, -0.05, 0.035); fs(OUT, 0);
      g.beginPath(); g.arc(0, 0.03, 0.12, 0.3, Math.PI - 0.3); g.strokeStyle = OUT; g.lineWidth = 0.04; g.stroke(); break;
    case 'empty':
      box(-0.35, -0.05, 0.7, 0.35, 0.35, '#dcb07e', '#c4925f', 0, 0.03, 0.08); text('0', 0, 0.12, 0.35, OUT, 700); break;
    case 'coin': circ(0, 0, 0.35); fs('#ffd23f', 0.08); text('¢', 0, 0.03, 0.5, '#b8860b', 700); break;
    case 'broom':
      g.strokeStyle = OUT; g.lineWidth = 0.09; g.beginPath(); g.moveTo(0.35, -0.45); g.lineTo(-0.05, 0.1); g.stroke();
      g.beginPath(); g.moveTo(-0.15, 0.0); g.lineTo(0.08, 0.18); g.lineTo(-0.15, 0.48); g.lineTo(-0.45, 0.25); g.closePath(); fs('#e9c46a', 0.06); break;
    case 'chat':
      rr(-0.42, -0.32, 0.84, 0.56, 0.18); fs('#fff', 0.08);
      g.beginPath(); g.moveTo(-0.15, 0.22); g.lineTo(-0.25, 0.45); g.lineTo(0.05, 0.22); fs('#fff', 0.06);
      for (const dx of [-0.2, 0, 0.2]){ circ(dx, -0.04, 0.06); fs(OUT, 0); } break;
  }
  g.restore();
}

// Emote bubble centered on (x, y). kind: 'want' (needs serving, with patience ring), 'wish' (grey thought cloud), 'info'.
export function bubble(x, y, icon, kind, p = 1, pulse = 0){
  const s = 1 + pulse * 0.08;
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y);
  if (kind === 'wish'){
    circ(x + 0.12, y + 0.42, 0.05); fs('#e9e4ec', 0.03); circ(x + 0.04, y + 0.33, 0.07); fs('#e9e4ec', 0.03);
    const puffs = r0 => { g.beginPath(); for (const [a, b, r] of [[-0.17, 0.02, 0.17], [0.17, 0.02, 0.17], [0, -0.13, 0.2], [0, 0.1, 0.18]]){ g.moveTo(x + a + r - r0, y + b); g.arc(x + a, y + b, r - r0, 0, Math.PI * 2); } };
    puffs(0); fs('#e9e4ec', 0.04); puffs(0.02); g.fillStyle = '#e9e4ec'; g.fill();
    storeIcon(icon, x, y, 0.36, '#9d8f9a');
  } else {
    g.beginPath(); g.moveTo(x - 0.08, y + 0.24); g.lineTo(x, y + 0.4); g.lineTo(x + 0.08, y + 0.24); fs('#fff', 0.04);
    circ(x, y, 0.29); fs('#fff', 0.045);
    g.beginPath(); g.moveTo(x - 0.075, y + 0.27); g.lineTo(x + 0.075, y + 0.27); g.strokeStyle = '#fff'; g.lineWidth = 0.06; g.stroke();
    if (kind === 'want'){
      g.beginPath(); g.arc(x, y, 0.37, 0, Math.PI * 2); g.strokeStyle = 'rgba(61,43,53,.25)'; g.lineWidth = 0.07; g.stroke();
      g.beginPath(); g.arc(x, y, 0.37, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, p));
      g.strokeStyle = p > 0.5 ? '#4cc38a' : p > 0.25 ? '#ffc93c' : '#ef476f'; g.lineWidth = 0.07; g.lineCap = 'round'; g.stroke();
    }
    storeIcon(icon, x, y + 0.01, 0.3);
  }
  g.restore();
}
export function stormCloud(x, y, a){
  g.save(); g.globalAlpha = a;
  g.beginPath(); for (const [dx, dy, r] of [[-0.15, 0, 0.14], [0.12, 0, 0.14], [0, -0.1, 0.17]]){ g.moveTo(x + dx + r, y + dy); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); }
  fs('#8a8095', 0.04);
  g.beginPath(); g.moveTo(x + 0.02, y + 0.1); g.lineTo(x - 0.06, y + 0.26); g.lineTo(x + 0.03, y + 0.24); g.lineTo(x - 0.03, y + 0.4); fs(null, 0.05, '#ffd23f');
  g.restore();
}
export function sparkle(x, y, s, a, c = '#fff6c9'){
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, -0.3); g.quadraticCurveTo(0.04, -0.04, 0.3, 0); g.quadraticCurveTo(0.04, 0.04, 0, 0.3); g.quadraticCurveTo(-0.04, 0.04, -0.3, 0); g.quadraticCurveTo(-0.04, -0.04, 0, -0.3);
  g.fillStyle = c; g.fill(); g.restore();
}

/* ---------- Characters ---------- */
function hairFront(o){
  const st = o.hairStyle, col = o.hair;
  if (st === 'short' || st === 'long' || st === 'bun' || st === 'visor'){
    g.beginPath(); g.arc(0, -0.89, 0.29, Math.PI - 0.35, Math.PI * 2 + 0.35);
    g.quadraticCurveTo(0.2, -0.93, 0.1, -0.97); g.quadraticCurveTo(0.02, -0.9, -0.06, -0.98); g.quadraticCurveTo(-0.16, -0.92, -0.272, -0.789);
    g.closePath(); fs(col);
    if (st === 'bun'){ circ(0, -1.2, 0.11); fs(col); }
    if (st === 'visor'){ rr(-0.3, -1.03, 0.6, 0.09, 0.04); fs(o.acc); ell(0, -0.95, 0.28, 0.05); fs(shade(o.acc, -0.15)); }
  } else if (st === 'cap' || st === 'flatcap'){
    ell(-0.255, -0.84, 0.07, 0.1); fs(col); ell(0.255, -0.84, 0.07, 0.1); fs(col);
    if (st === 'cap'){
      g.beginPath(); g.arc(0, -0.92, 0.285, Math.PI, Math.PI * 2); g.closePath(); fs(o.acc);
      rr(-0.34, -0.96, 0.68, 0.1, 0.05); fs(shade(o.acc, -0.2));
      circ(0, -1.06, 0.05); fs('#fff', 0.03);
    } else {
      g.beginPath(); g.moveTo(-0.3, -0.93); g.quadraticCurveTo(-0.28, -1.22, 0.02, -1.2); g.quadraticCurveTo(0.3, -1.18, 0.32, -0.97); g.closePath(); fs(o.acc);
      rr(-0.31, -0.98, 0.66, 0.08, 0.04); fs(shade(o.acc, -0.25));
    }
  } else if (st === 'bald'){
    ell(-0.25, -0.86, 0.06, 0.09); fs(col); ell(0.25, -0.86, 0.06, 0.09); fs(col);
  }
}
// The head seen from the side, facing right (person() mirrors it to face left).
function profileHead(o){
  const st = o.hairStyle, col = o.hair;
  if (st === 'cap' || st === 'flatcap'){
    ell(-0.2, -0.84, 0.08, 0.11); fs(col);
    g.beginPath(); g.arc(0, -0.92, 0.285, Math.PI, Math.PI * 2); g.closePath(); fs(o.acc);
    rr(0.06, -0.96, 0.36, 0.09, 0.045); fs(shade(o.acc, -0.2));
  } else if (st === 'bald'){ ell(-0.22, -0.86, 0.07, 0.1); fs(col); }
  else {
    g.beginPath(); g.arc(0, -0.89, 0.29, Math.PI * 0.62, Math.PI * 1.92); g.quadraticCurveTo(0.12, -1.0, 0.03, -0.96); g.quadraticCurveTo(-0.06, -0.9, -0.13, -0.72); g.closePath(); fs(col);
    if (st === 'bun'){ circ(-0.21, -1.12, 0.11); fs(col); }
    if (st === 'visor'){ rr(-0.04, -1.03, 0.4, 0.08, 0.04); fs(o.acc); }
  }
  if (o.blink){ g.beginPath(); g.moveTo(0.1, -0.865); g.quadraticCurveTo(0.13, -0.845, 0.16, -0.865); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); }
  else if (o.mood === 'happy'){ g.beginPath(); g.arc(0.13, -0.85, 0.035, Math.PI + 0.3, -0.3); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); }
  else { ell(0.13, -0.865, 0.032, 0.045); fs(OUT, 0); circ(0.142, -0.88, 0.011); fs('#fff', 0); }
  ell(0.13, -0.79, 0.05, 0.028); g.fillStyle = 'rgba(255,110,140,.4)'; g.fill();
  g.beginPath(); g.moveTo(0.262, -0.87); g.quadraticCurveTo(0.31, -0.83, 0.262, -0.805); g.strokeStyle = OUT; g.lineWidth = 0.025; g.stroke();
  g.beginPath(); if (o.mood === 'wait' || o.mood === 'mad'){ g.moveTo(0.17, -0.785); g.lineTo(0.22, -0.785); } else g.arc(0.2, -0.8, 0.03, 0.4, Math.PI - 0.8); g.strokeStyle = OUT; g.lineWidth = 0.025; g.lineCap = 'round'; g.stroke();
  if (o.glasses){ circ(0.13, -0.865, 0.07); fs(null, 0.025); }
}
function face(o){
  if (o.stache){
    for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(0, -0.81); g.quadraticCurveTo(sx * 0.12, -0.84, sx * 0.17, -0.77); g.quadraticCurveTo(sx * 0.1, -0.75, 0, -0.78); fs('#f2f2f2', 0.03); }
    g.strokeStyle = '#cfcfcf'; g.lineWidth = 0.04; g.beginPath(); g.moveTo(-0.15, -0.95); g.lineTo(-0.05, -0.94); g.moveTo(0.05, -0.94); g.lineTo(0.15, -0.95); g.stroke();
  }
  for (const sx of [-1, 1]){
    if (o.blink){ g.beginPath(); g.moveTo(sx * 0.095 - 0.035, -0.865); g.quadraticCurveTo(sx * 0.095, -0.845, sx * 0.095 + 0.035, -0.865); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); }
    else if (o.mood === 'happy'){ g.beginPath(); g.arc(sx * 0.095, -0.85, 0.035, Math.PI + 0.3, -0.3); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); }
    else { ell(sx * 0.095, -0.865, 0.034, 0.045); fs(OUT, 0); circ(sx * 0.095 + 0.012, -0.88, 0.012); fs('#fff', 0); }
    ell(sx * 0.165, -0.795, 0.05, 0.028); g.fillStyle = 'rgba(255,110,140,.4)'; g.fill();
  }
  if (o.glasses){ for (const sx of [-1, 1]){ circ(sx * 0.095, -0.865, 0.07); fs(null, 0.025); } }
  if (!o.stache){
    g.beginPath();
    if (o.mood === 'wait' || o.mood === 'mad'){ g.moveTo(-0.04, -0.79); g.lineTo(0.04, -0.79); }
    else g.arc(0, -0.81, 0.045, 0.3, Math.PI - 0.3);
    g.strokeStyle = OUT; g.lineWidth = 0.028; g.lineCap = 'round'; g.stroke();
  }
}
// Draws a chibi person standing at (x, y) = feet. o: look + pose. Returns nothing; draws in place.
export function person(x, y, o){
  const t = o.t || 0, s = o.s || 1, walking = !!o.walk;
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  if (o.mop !== undefined){ ell(0.5, 0.04, 0.32, 0.1); g.fillStyle = 'rgba(150,210,240,.45)'; g.fill(); }
  if (!o.noShadow) shadow(0, 0, 0.24, 0.085, 0.22);
  const ph = t * 9, sw = walking ? Math.sin(ph) : 0, sit = !!o.sit;
  // Walking bobs twice a stride; standing still, folks breathe and now and then blink.
  const bob = walking ? Math.abs(Math.sin(ph)) * 0.04 : 0, breathe = walking ? 0 : Math.sin(t * 2.2) * 0.01;
  o = { ...o, blink: !walking && (t % 3.7) < 0.13 };
  // Side-on seats and machines show the person in profile.
  const profile = !o.back && (o.sitSide || o.reachSide);
  if (o.eat && !profile) o = { ...o, hold: o.eat, eat: undefined };
  if (sit){
    // Seated: knees toward us, shins hanging over the seat edge, feet swinging a little.
    const swing = Math.sin(t * 2.4) * 0.025;
    if (o.sitSide){
      rr(0.25, -0.18, 0.11, 0.17, 0.05); fs(o.pants);
      ell(0.32, -0.02 + swing, 0.075, 0.04); fs(o.shoe || '#4a3a44', 0.03);
    } else if (o.back){
      // From behind, the seat hides the legs.
    } else {
      for (const [lx, k] of [[-0.14, 1], [0.03, -1]]){
        rr(lx, -0.17, 0.11, 0.16, 0.05); fs(o.pants);
        ell(lx + 0.055, -0.01 + k * swing, 0.075, 0.04); fs(o.shoe || '#4a3a44', 0.03);
      }
      rr(-0.2, -0.24, 0.4, 0.12, 0.06); fs(o.pants);
    }
    g.translate(0, 0.1);
  } else {
    // Each leg lifts and swings a touch forward in turn; the lifted one is a little shorter (knee bent).
    for (const [lx, k] of [[-0.13, 1], [0.02, -1]]){
      const lift = Math.max(0, sw * k) * 0.07, fwd = walking ? sw * k * 0.025 : 0;
      rr(lx + fwd, -0.27 - lift * 0.4, 0.11, 0.24 - lift * 0.6, 0.05); fs(o.pants);
      ell(lx + 0.055 + fwd, -0.035 - lift, 0.075, 0.04); fs(o.shoe || '#4a3a44', 0.03);
    }
  }
  g.translate(0, -bob);
  if (walking) g.rotate(sw * 0.03);
  if (o.back && o.hood){ circ(0, -0.88, 0.31); fs(o.shirt); }
  if (o.hairStyle === 'long' && !o.back){ if (profile){ rr(-0.32, -1.02, 0.36, 0.62, 0.18); fs(o.hair); } else { rr(-0.3, -1.05, 0.6, 0.6, 0.26); fs(o.hair); } }
  if (profile){ rr(-0.15, -0.63 - breathe, 0.3, 0.43 + breathe, 0.12); fs(o.shirt); }
  else { rr(-0.2, -0.63 - breathe, 0.4, 0.43 + breathe, 0.14); fs(o.shirt); }
  if (sit && o.sitSide){ rr(-0.08, -0.34, 0.44, 0.14, 0.07); fs(o.pants); }
  // Casino outfits: a dealer's vest and bow tie, a host's sequins, a high roller's gold chain.
  if (o.vest && !o.back){ g.beginPath(); g.moveTo(-0.19, -0.6); g.lineTo(-0.05, -0.6); g.lineTo(0, -0.42); g.lineTo(0.05, -0.6); g.lineTo(0.19, -0.6); g.lineTo(0.18, -0.24); g.lineTo(-0.18, -0.24); g.closePath(); fs(o.vest, 0.03); circ(0, -0.36, 0.015); fs(GOLDEN, 0); circ(0, -0.3, 0.015); fs(GOLDEN, 0); }
  else if (o.vest){ rr(-0.19, -0.6, 0.38, 0.36, 0.12); fs(o.vest, 0.03); }
  if (o.bowtie && !o.back){ g.beginPath(); g.moveTo(0, -0.6); g.lineTo(-0.08, -0.64); g.lineTo(-0.08, -0.56); g.closePath(); g.moveTo(0, -0.6); g.lineTo(0.08, -0.64); g.lineTo(0.08, -0.56); g.closePath(); fs('#2b2230', 0.015); }
  if (o.sequins){ for (let i = 0; i < 9; i++){ circ(-0.13 + (i % 3) * 0.13, -0.55 + Math.floor(i / 3) * 0.11, 0.022); g.fillStyle = Math.floor(t * 5 + i) % 3 ? 'rgba(255,255,255,.75)' : '#fff6c9'; g.fill(); } }
  if (o.chain && !o.back){ g.beginPath(); g.arc(0, -0.62, 0.12, 0.3, Math.PI - 0.3); g.strokeStyle = GOLDEN; g.lineWidth = 0.025; g.stroke(); }
  if (o.apron){ rr(-0.15, -0.5, 0.3, 0.32, 0.06); fs(o.apron, 0.03); }
  if (o.badge){ g.save(); g.translate(0.09, -0.48); g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.025 : 0.06; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); fs('#ffd23f', 0.02); g.restore(); }
  if (o.patch){ rr(0.03, -0.53, 0.12, 0.07, 0.02); fs('#fff', 0.02); }
  if (o.broom !== undefined){
    const bx = 0.5 + Math.sin(o.broom) * 0.15;
    g.beginPath(); g.moveTo(0.18, -0.42); g.lineTo(bx, 0.0); g.strokeStyle = OUT; g.lineWidth = 0.075; g.stroke();
    g.beginPath(); g.moveTo(0.18, -0.42); g.lineTo(bx, 0.0); g.strokeStyle = '#c98b55'; g.lineWidth = 0.04; g.stroke();
    g.beginPath(); g.moveTo(bx - 0.14, 0.03); g.lineTo(bx + 0.14, 0.03); g.lineTo(bx + 0.08, -0.1); g.lineTo(bx - 0.08, -0.1); g.closePath(); fs('#e9c46a', 0.035);
  }
  if (o.mop !== undefined){
    const mx = 0.55 + Math.sin(o.mop) * 0.12;
    g.beginPath(); g.moveTo(0.18, -0.42); g.lineTo(mx, 0.0); g.strokeStyle = OUT; g.lineWidth = 0.075; g.stroke();
    g.beginPath(); g.moveTo(0.18, -0.42); g.lineTo(mx, 0.0); g.strokeStyle = '#c98b55'; g.lineWidth = 0.04; g.stroke();
    rr(mx - 0.17, -0.06, 0.34, 0.1, 0.05); fs('#ece6dc', 0.035);
  }
  // A flashlight held out in the right hand, pointing at angle o.torch (radians, 0 = right).
  if (o.torch !== undefined){
    g.save(); g.translate(0.215, -0.32); g.rotate(o.torch);
    rr(0, -0.04, 0.2, 0.08, 0.025); fs('#4a5058', 0.03);
    rr(0.17, -0.06, 0.07, 0.12, 0.025); fs('#9aa3ab', 0.03);
    rr(0.225, -0.045, 0.02, 0.09, 0.01); fs('#fff6c8', 0);
    g.restore();
  }
  // Sipping: every few seconds a drink (or a cone) comes up to the mouth.
  const sipping = (o.hold === 'can' || o.hold === 'coffee' || o.hold === 'cone' || o.hold === 'burger' || o.hold === 'hotdog' || o.hold === 'pizza' || o.hold === 'boba' || o.hold === 'cupcake' || o.hold === 'cocktail') && !o.back && !walking && (t % 3.2) < 0.8;
  if (profile){
    // One arm shows: reaching out to the machine, or resting forward in the lap.
    if (o.reachSide) raisedArm(o, 0.04, 0.42, -0.6);
    else if (o.eat){ /* drawn after the head */ }
    else if (!sipping){ g.save(); g.translate(0.03, -0.58); g.rotate(-0.55); rr(-0.055, 0, 0.11, 0.24, 0.055); fs(o.sleeve || o.shirt); g.restore(); circ(0.17, -0.37, 0.055); fs(o.skin, 0.035); }
  }
  else for (const [ax, dir] of [[-0.215, 1], [0.215, -1]]){
    if (ax > 0 && sipping) continue;   // drawn after the head, so the drink is in front of the face
    if (ax > 0 && o.reach){ if (o.reachSide) raisedArm(o, ax, 0.42, -0.6); else raisedArm(o, ax, 0.2, -0.82); continue; }
    if (sit && !o.play){
      // Hands resting in the lap.
      rr(ax - 0.055 + dir * 0.02, -0.58, 0.11, 0.24, 0.055); fs(o.sleeve || o.shirt);
      circ(ax * 0.6, -0.34, 0.055); fs(o.skin, 0.035);
      continue;
    }
    if (o.play){
      // Hands up on the controls, jiggling away.
      const jig = Math.sin(t * 22 + ax * 10) * 0.025;
      rr(ax - 0.055, -0.62 + jig, 0.11, 0.24, 0.055); fs(o.sleeve || o.shirt);
      circ(ax * 0.85, -0.66 + jig, 0.055); fs(o.skin, 0.035);
      continue;
    }
    const swing = o.torch !== undefined && ax > 0 ? 0 : sw * dir * 0.065;
    rr(ax - 0.055, -0.6 + swing, 0.11, 0.28, 0.055); fs(o.sleeve || o.shirt);
    circ(ax, -0.31 + swing, 0.055); fs(o.skin, 0.035);
  }
  if (o.hold && !o.back && !sipping) heldItem(o.hold, profile ? 0.19 : sit ? 0.13 : 0.235, profile ? -0.35 : sit ? -0.33 : -0.31, o.bagColor, o.prize);
  if (o.clipboard && !o.back){ rr(0.12, -0.5, 0.2, 0.26, 0.03); fs('#c98b55', 0.03); rr(0.15, -0.46, 0.14, 0.19, 0.01); fs('#fff', 0); rr(0.18, -0.53, 0.08, 0.05, 0.015); fs('#a0a8b0', 0.02); }
  if (o.phone && !o.back){ rr(0.12, -0.64, 0.12, 0.2, 0.03); fs('#3d405b', 0.025); rr(0.14, -0.62, 0.08, 0.14, 0.02); fs('#8ecae6', 0); }
  if (o.carry){ box(-0.21, -0.47, 0.42, 0.12, 0.26, '#e8c08a', '#c4925f', 0, 0.03, 0.03); g.fillStyle = 'rgba(61,43,53,.3)'; g.fillRect(-0.03, -0.73, 0.06, 0.38); }
  if (o.thermos){ rr(-0.31, -0.42, 0.12, 0.22, 0.04); fs('#c0392b', 0.03); rr(-0.3, -0.45, 0.1, 0.05, 0.02); fs('#bbb', 0.025); }
  if (o.bag){ g.beginPath(); g.arc(-0.25, -0.28, 0.06, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); rr(-0.37, -0.27, 0.24, 0.22, 0.04); fs(o.bagColor || '#ff8fab', 0.035); }
  if (o.balloon){
    const bx = 0.32 + Math.sin(t * 1.7) * 0.05;
    g.beginPath(); g.moveTo(0.22, -0.32); g.quadraticCurveTo(0.35, -0.9, bx, -1.45); g.strokeStyle = OUT; g.lineWidth = 0.02; g.stroke();
    ell(bx, -1.66, 0.19, 0.23); fs(o.balloon, 0.04); ell(bx - 0.06, -1.74, 0.045, 0.07); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
  }
  circ(0, -0.88, 0.27); fs(o.skin);
  if (o.back){
    circ(0, -0.89, 0.28); fs(o.hood ? shade(o.shirt, -0.15) : o.hair);
    if (o.hood){ circ(0, -0.89, 0.2); fs(o.hair, 0); }
    if (o.vr){ rr(-0.28, -0.95, 0.56, 0.07, 0.03); fs('#2b2d42', 0.03); }
  } else {
    if (profile) profileHead(o); else { hairFront(o); face(o); }
    if (o.vr){ rr(-0.25, -0.99, 0.5, 0.18, 0.07); fs('#2b2d42', 0.035); rr(-0.2, -0.95, 0.4, 0.06, 0.03); fs(`hsl(${(t * 120) % 360},90%,65%)`, 0); }
    if (o.hold === 'gum'){ const r = 0.03 + Math.abs(Math.sin(t * 1.3)) * 0.08; circ(0.03, -0.77, r); fs('rgba(255,143,200,.92)', 0.025); }
    if (o.eat && profile) eatArm(o, t);
    if (sipping){ raisedArm(o, profile ? 0.04 : 0.215, profile ? 0.2 : 0.09, -0.66); g.save(); g.translate(0.06, -0.64); g.rotate(-0.6); heldItem(o.hold, 0, 0.1, o.bagColor, o.prize); g.restore(); }
  }
  g.restore();
}
// Eating at a table, side on: the hand rests at the plate a moment, then a bite comes up to the mouth, every couple of
// seconds. Noodles come up twirled on a fork, sushi in chopsticks; anything else is eaten out of the hand.
function eatArm(o, t){
  const c = (t * 0.42 + (o.seed || 0)) % 1;
  let u = c < 0.45 ? 0 : c < 0.6 ? (c - 0.45) / 0.15 : c < 0.82 ? 1 : 1 - (c - 0.82) / 0.18;
  u = u * u * (3 - 2 * u);
  const dig = c < 0.45 ? Math.sin(t * 8) * 0.012 : 0;
  const hx = 0.3 - u * 0.1, hy = -0.48 - u * 0.2 + dig;      // at the plate → at the mouth
  if (o.eat === 'noodles' || o.eat === 'sushi'){
    // Tines (or tips) point down into the bowl, then swing up toward the mouth.
    const a = 0.3 + (-2.3 - 0.3) * u, L = 0.17, ex = hx + Math.cos(a) * L, ey = hy + Math.sin(a) * L;
    g.lineCap = 'round';
    if (o.eat === 'noodles'){
      g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
      g.save(); g.translate(ex, ey); g.rotate(a); g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.012; g.beginPath(); for (const k of [-0.022, 0, 0.022]){ g.moveTo(0, k); g.lineTo(0.05, k); } g.stroke(); g.restore();
      // A forkful of noodles dangling once it's off the bowl.
      if (u > 0.12){ g.strokeStyle = '#f4d58d'; g.lineWidth = 0.014; g.beginPath(); for (const k of [-0.02, 0.005, 0.03]){ g.moveTo(ex + k, ey); g.quadraticCurveTo(ex + k + 0.02, ey + 0.05, ex + k - 0.005, ey + 0.09 * u); } g.stroke(); }
    } else {
      g.strokeStyle = '#c9a27e'; g.lineWidth = 0.014; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.moveTo(hx + 0.015, hy + 0.01); g.lineTo(ex + 0.02, ey + 0.015); g.stroke();
      if (u > 0.08){ circ(ex + 0.012, ey + 0.012, 0.03); fs('#1b2d2a', 0.01); circ(ex + 0.012, ey + 0.012, 0.016); fs('#fffaf3', 0); circ(ex + 0.012, ey + 0.012, 0.007); fs('#ff8c69', 0); }
    }
    raisedArm(o, 0.04, hx, hy);
    return;
  }
  raisedArm(o, 0.04, hx, hy);
  g.save(); g.translate(hx - 0.02, hy + 0.02); g.rotate(-0.5 * u); heldItem(o.eat, 0, 0.02, o.bagColor, o.prize); g.restore();
}
// An arm raised from the shoulder at (ax, -0.56) to a hand at (hx, hy).
function raisedArm(o, ax, hx, hy){
  g.save(); g.translate(ax, -0.56); g.rotate(Math.atan2(-(hx - ax), hy + 0.56));
  rr(-0.055, -0.02, 0.11, Math.min(0.26, Math.hypot(hx - ax, hy + 0.56) + 0.04), 0.055); fs(o.sleeve || o.shirt); g.restore();
  circ(hx, hy, 0.055); fs(o.skin, 0.035);
}
// Something a shopper bought, held in the right hand at (hx, hy).
function heldItem(kind, hx, hy, color, prize){
  if (A2.heldNew(kind, hx, hy) || A3.heldCasino(kind, hx, hy) || A4.held(kind, hx, hy)) return;
  switch (kind){
    case 'cone':
      g.beginPath(); g.moveTo(hx - 0.06, hy - 0.06); g.lineTo(hx + 0.06, hy - 0.06); g.lineTo(hx, hy + 0.1); g.closePath(); fs('#e0a96d', 0.025);
      circ(hx, hy - 0.11, 0.07); fs('#ff8fc8', 0.025); circ(hx + 0.01, hy - 0.19, 0.05); fs('#7ed6c8', 0.025); break;
    case 'coffee':
      rr(hx - 0.05, hy - 0.13, 0.1, 0.15, 0.02); fs('#fff', 0.025); rr(hx - 0.055, hy - 0.16, 0.11, 0.04, 0.015); fs('#8a5a44', 0.02);
      g.fillStyle = '#c98b55'; g.fillRect(hx - 0.05, hy - 0.08, 0.1, 0.035); break;
    case 'pretzel': pretzelIcon(hx + 0.02, hy - 0.1, 0.22); break;
    case 'toy':     // a little toy rocket
      g.beginPath(); g.moveTo(hx, hy - 0.3); g.lineTo(hx + 0.06, hy - 0.16); g.lineTo(hx + 0.06, hy); g.lineTo(hx - 0.06, hy); g.lineTo(hx - 0.06, hy - 0.16); g.closePath(); fs('#f8f9fa', 0.02);
      circ(hx, hy - 0.15, 0.03); fs('#4cc9f0', 0.012); g.beginPath(); g.moveTo(hx - 0.06, hy - 0.06); g.lineTo(hx - 0.1, hy + 0.02); g.lineTo(hx - 0.06, hy); fs('#ef476f', 0.012); g.beginPath(); g.moveTo(hx + 0.06, hy - 0.06); g.lineTo(hx + 0.1, hy + 0.02); g.lineTo(hx + 0.06, hy); fs('#ef476f', 0.012); break;
    case 'game': rr(hx - 0.07, hy - 0.16, 0.14, 0.19, 0.015); fs('#3a0ca3', 0.025); rr(hx - 0.05, hy - 0.13, 0.1, 0.09, 0.01); fs('#4cc9f0', 0); break;
    case 'shoebox': box(hx - 0.13, hy - 0.04, 0.26, 0.1, 0.12, '#ffe8d6', '#e76f51', 0, 0.02, 0.025); break;
    case 'burger': g.save(); g.translate(hx, hy - 0.1); g.scale(0.17, 0.17); storeIcon('burger', 0, 0, 1); g.restore(); break;
    case 'hotdog': g.save(); g.translate(hx, hy - 0.08); g.scale(0.19, 0.19); storeIcon('hotdog', 0, 0, 1); g.restore(); break;
    case 'pizza': g.save(); g.translate(hx, hy - 0.12); g.rotate(-0.3); g.scale(0.18, 0.18); storeIcon('pizza', 0, 0, 1); g.restore(); break;
    case 'photos': rr(hx - 0.05, hy - 0.26, 0.1, 0.3, 0.01); fs('#fff', 0.015); for (let k = 0; k < 3; k++){ rr(hx - 0.04, hy - 0.25 + k * 0.095, 0.08, 0.08, 0.01); fs(['#ffd6e0', '#cdeefe', '#fff3c4'][k], 0.008); } break;
    case 'boombox':
      rr(hx - 0.16, hy - 0.16, 0.32, 0.2, 0.04); fs('#2b2d42', 0.025); circ(hx - 0.08, hy - 0.06, 0.055); fs('#a0a8b0', 0.015); circ(hx + 0.08, hy - 0.06, 0.055); fs('#a0a8b0', 0.015);
      g.beginPath(); g.arc(hx, hy - 0.16, 0.1, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.02; g.stroke(); break;
    case 'lolly':
      g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx, hy - 0.16); g.strokeStyle = '#fff'; g.lineWidth = 0.025; g.stroke();
      circ(hx, hy - 0.2, 0.065); fs('#9b5de5', 0.025); circ(hx, hy - 0.2, 0.03); fs('#ffd6f5', 0); break;
    case 'can': rr(hx - 0.04, hy - 0.12, 0.08, 0.14, 0.02); fs('#118ab2', 0.025); g.fillStyle = '#ffd23f'; g.fillRect(hx - 0.04, hy - 0.07, 0.08, 0.035); break;
    case 'book': rr(hx - 0.07, hy - 0.12, 0.14, 0.17, 0.015); fs('#e07a5f', 0.025); g.fillStyle = '#f2e6c8'; g.fillRect(hx - 0.07, hy - 0.11, 0.025, 0.15); break;
    case 'record': rr(hx - 0.09, hy - 0.15, 0.18, 0.18, 0.015); fs('#ffd23f', 0.025); circ(hx + 0.02, hy - 0.06, 0.06); fs('#2b2d42', 0.015); break;
    case 'gadget': box(hx - 0.1, hy - 0.04, 0.2, 0.08, 0.15, '#c0f0ff', '#118ab2', 0, 0.02, 0.025); rr(hx - 0.06, hy - 0.15, 0.12, 0.07, 0.015); fs('#a8f0e6', 0.015); break;
    case 'plush': {
      // A claw-machine or arcade prize: bear, bunny, duck, alien or dino.
      const pz = prize || { kind: 'bear', color: '#e0a96d' }, c = pz.color, dark = shade(c, -0.25);
      if (pz.kind === 'bunny'){ for (const sx of [-1, 1]){ ell(hx + sx * 0.035, hy - 0.22, 0.022, 0.06); fs(c, 0.018); } }
      else if (pz.kind === 'alien'){ g.beginPath(); g.moveTo(hx, hy - 0.16); g.lineTo(hx, hy - 0.24); g.strokeStyle = OUT; g.lineWidth = 0.015; g.stroke(); circ(hx, hy - 0.25, 0.02); fs('#ff5fa2', 0.012); }
      else if (pz.kind === 'dino'){ for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(hx - 0.05 + i * 0.04, hy - 0.16); g.lineTo(hx - 0.03 + i * 0.04, hy - 0.21); g.lineTo(hx - 0.01 + i * 0.04, hy - 0.16); fs(dark, 0.012); } }
      else if (pz.kind === 'bear'){ circ(hx - 0.05, hy - 0.17, 0.032); fs(dark, 0.018); circ(hx + 0.05, hy - 0.17, 0.032); fs(dark, 0.018); }
      circ(hx, hy - 0.1, 0.075); fs(c, 0.025);
      if (pz.kind === 'duck'){ ell(hx, hy - 0.08, 0.035, 0.018); fs('#ff9f43', 0.012); }
      else if (pz.kind === 'alien'){ ell(hx - 0.025, hy - 0.11, 0.018, 0.024); fs(OUT, 0); ell(hx + 0.025, hy - 0.11, 0.018, 0.024); fs(OUT, 0); }
      else { circ(hx - 0.025, hy - 0.115, 0.01); fs(OUT, 0); circ(hx + 0.025, hy - 0.115, 0.01); fs(OUT, 0); circ(hx, hy - 0.08, 0.02); fs(shade(c, 0.4), 0); }
      break;
    }
    case 'bag':
      g.beginPath(); g.arc(hx, hy + 0.02, 0.05, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.025; g.stroke();
      rr(hx - 0.11, hy + 0.02, 0.22, 0.2, 0.03); fs(color || '#ff8fab', 0.03); break;
  }
}
// A family: parent plus a smaller kid walking beside them.
export function family(x, y, o){
  const k = o.kid;
  const side = o.sit && o.sitSide, kx = side ? x : x + (o.flip ? 0.38 : -0.38);
  person(kx, y + (side ? 0.45 : o.sit ? 0 : 0.12) + (o.kidBob || 0), { ...k, t: (o.t || 0) + 0.3, walk: o.walk, flip: o.flip, s: 0.68, play: o.play || o.kidPlay, back: o.back, sit: o.sit, sitSide: o.sitSide, noShadow: o.noShadow });
  person(x, y, o);
}

/* ---------- Mall styles ---------- */
// Wallpaper palettes. face: the wall, dark: its pattern and shaded sides, cap: trim along the top, base: baseboard.
export const WALLPAPER = {
  classic: { face: '#e9dcf7', dark: '#cdb8e6', cap: '#f6efff', base: '#cdb8e6' },
  retro:   { face: '#c8f0e8', dark: '#93d9cc', cap: '#fff3f8', base: '#7a5aa8' },
  sunset:  { face: '#ffdcc4', dark: '#eea482', cap: '#fff3e4', base: '#c97a5c' },
  garden:  { face: '#dcefd4', dark: '#a8cf9d', cap: '#f8fcf1', base: '#b98d5f' },
  deco:    { face: '#2f6168', dark: '#244b51', cap: '#f2d68a', base: '#e2bb5e' },
  luxe:    { face: '#f6f3ef', dark: '#d8d1c9', cap: '#ffffff', base: '#4d4752' },
  candy:   { face: '#fff0f4', dark: '#f7b8cb', cap: '#ffffff', base: '#e8577e' },
  starry:  { face: '#24305e', dark: '#1a2347', cap: '#f2d68a', base: '#3b4a8a' },
  tropic:  { face: '#fff6e0', dark: '#9fd4a4', cap: '#ffffff', base: '#2f9e6a' },
  gala:    { face: '#5b2a5e', dark: '#43204a', cap: '#f2d68a', base: '#c9a227' },
  sakura:  { face: '#fff4f0', dark: '#f4c6d0', cap: '#ffffff', base: '#8a5a5a' },
  waves:   { face: '#e3f4fb', dark: '#9fd3ea', cap: '#ffffff', base: '#2a6f9a' },
  crystal: { face: '#eee8fb', dark: '#cfc3ee', cap: '#ffffff', base: '#9b8ad0' },
  casino:  { face: '#7a1734', dark: '#4f0e22', cap: '#f2c14e', base: '#1b1440' },
  neonights: { face: '#2a1650', dark: '#1b0e38', cap: '#ff6fb5', base: '#4cc9f0' },
};
const FLOOR_KIND = { classic: 'concourse', diner: 'diner', terracotta: 'terracotta', flagstone: 'flagstone', herring: 'herring', marble: 'marble', mosaic: 'mosaic', starlight: 'starlight', bamboo: 'bamboo', gold: 'goldterrazzo', ocean: 'seatile', velvet: 'royal', crystal: 'crystal', casino: 'casinocarpet', starburst: 'starburst' };
let style = { wall: 'classic', floor: 'classic' };
export function setStyle(st){ if (st) style = st; }
export const wallpaper = (id = style.wall) => WALLPAPER[id] || WALLPAPER.classic;
export const concourseFloor = (id = style.floor) => FLOOR_KIND[id] || 'concourse';
// A repeatable 0..1 number for a tile, so patterns line up across separately drawn floor strips.
const hash = (a, b, c = 0) => { let t = Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791); t = Math.imul(t ^ t >>> 13, 0x5bd1e995); return ((t ^ t >>> 15) >>> 0) / 4294967296; };

// Two soft veins across a marble slab: a faint wide wash with a fine line down the middle.
function marbleVeins(R, x, y, w, h = w){
  g.lineCap = 'round';
  for (let v = 0; v < 2; v++){
    const ax = x + R() * w, bx = x + R() * w, c1 = x + R() * w, c2 = x + R() * w;
    for (const [a, lw] of [[0.06, 0.08], [0.15, 0.016]]){
      g.strokeStyle = `rgba(140,128,124,${a})`; g.lineWidth = lw;
      g.beginPath(); g.moveTo(ax, y); g.bezierCurveTo(c1, y + h * 0.35, c2, y + h * 0.65, bx, y + h); g.stroke();
    }
  }
}

/* ---------- Mall structure ---------- */
export const WALL_H = 1.25;
export function mallBackWall(w, id = style.wall, x0 = 0, windows = false){
  const P = wallpaper(id), top = -WALL_H;
  g.save(); g.translate(x0, 0);
  g.save(); g.beginPath(); g.rect(0, top, w, WALL_H); g.clip();
  g.fillStyle = P.face; g.fillRect(0, top, w, WALL_H);
  wallPattern(id, P, w, top);
  if (windows) upperWindows(w, P, top);
  g.restore();
  g.fillStyle = P.base; g.fillRect(0, -0.22, w, 0.22);
  g.fillStyle = 'rgba(45,30,40,.15)'; g.fillRect(0, -0.06, w, 0.06);
  g.beginPath(); g.rect(0, top, w, WALL_H); fs(null);
  rr(-0.15, top - 0.22, w + 0.3, 0.22, 0.04); fs(P.cap);
  g.restore();
}
// Upstairs, tall arched windows let the daylight in.
function upperWindows(w, P, top){
  for (let x = 1.6; x + 1.5 < w; x += 4){
    const x0 = x, ww = 1.5, y0 = top + 0.16, y1 = -0.32, r = ww / 2;
    const path = () => { g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + r); g.arc(x0 + r, y0 + r, r, Math.PI, 0); g.lineTo(x0 + ww, y1); g.closePath(); };
    path();
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#7cc4ea'); gr.addColorStop(1, '#d6f1fd');
    g.fillStyle = gr; g.fill();
    g.save(); path(); g.clip();
    g.fillStyle = 'rgba(255,255,255,.9)'; for (const [cx, cy, cr] of [[0.45, 0.62, 0.17], [0.7, 0.55, 0.22], [0.98, 0.64, 0.15]]){ circ(x0 + cx, y0 + cy, cr); g.fill(); }
    g.restore();
    path(); g.strokeStyle = P.cap; g.lineWidth = 0.09; g.stroke();
    g.beginPath(); g.moveTo(x0 + r, y0 + 0.02); g.lineTo(x0 + r, y1); g.moveTo(x0, y0 + r + 0.15); g.lineTo(x0 + ww, y0 + r + 0.15); g.strokeStyle = P.cap; g.lineWidth = 0.05; g.stroke();
    path(); g.strokeStyle = OUT; g.lineWidth = 0.035; g.stroke();
    g.fillStyle = P.cap; rr(x0 - 0.1, y1 - 0.02, ww + 0.2, 0.1, 0.03); fs(P.cap, 0.03);
  }
}
// The pattern on the wall above the baseboard (from top down to y = -0.22).
function wallPattern(id, P, w, top){
  if (id === 'retro'){
    // A pink zigzag band, little yellow triangles above it and purple dots below.
    g.strokeStyle = '#ff8fb8'; g.lineWidth = 0.075; g.lineJoin = 'round'; g.beginPath();
    for (let x = 0; x <= w + 0.5; x += 0.25) (x === 0 ? g.moveTo : g.lineTo).call(g, x, -0.62 + ((x * 4) % 2 ? -0.1 : 0.1));
    g.stroke();
    for (let i = 0; i < w; i++){
      g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(i + 0.25, top + 0.2); g.lineTo(i + 0.36, top + 0.38); g.lineTo(i + 0.14, top + 0.38); g.closePath(); g.fill();
      g.strokeStyle = '#9b7bff'; g.lineWidth = 0.04; g.beginPath(); g.moveTo(i + 0.6, top + 0.3); g.quadraticCurveTo(i + 0.68, top + 0.18, i + 0.76, top + 0.3); g.quadraticCurveTo(i + 0.84, top + 0.42, i + 0.92, top + 0.3); g.stroke();
      g.fillStyle = i % 2 ? '#9b7bff' : '#5cc8bf'; circ(i + 0.5, -0.36, 0.045); g.fill();
    }
  } else if (id === 'sunset'){
    // A cream band along the top and a row of terracotta arches.
    g.fillStyle = '#fff0dc'; g.fillRect(0, top, w, 0.14);
    for (let i = 0; i < w; i += 2){
      const ax = i + 0.35, aw = 1.3, ay = top + 0.32, ab = -0.3;
      for (const [inset, col] of [[0, P.dark], [0.09, '#ffc7a6']]){
        g.beginPath(); g.moveTo(ax + inset, ab); g.lineTo(ax + inset, ay + aw / 2); g.arc(ax + aw / 2, ay + aw / 2, aw / 2 - inset, Math.PI, 0); g.lineTo(ax + aw - inset, ab); g.closePath();
        g.fillStyle = col; g.fill();
      }
      g.fillStyle = 'rgba(255,240,220,.7)'; g.fillRect(ax + 0.2, ab - 0.06, aw - 0.4, 0.06);
    }
  } else if (id === 'garden'){
    // Oak wainscoting below, sage with leafy sprigs above.
    for (let i = 0; i < w; i++){
      const lx = i + 0.5, ly = top + (i % 2 ? 0.5 : 0.3);
      g.strokeStyle = '#7fae74'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(lx, ly + 0.22); g.lineTo(lx, ly - 0.12); g.stroke();
      g.fillStyle = '#8fbf84';
      for (const [dx, dy, r] of [[-0.09, 0.1, -0.7], [0.09, 0.02, 0.7], [-0.08, -0.07, -0.6], [0, -0.16, 0]]){ ell(lx + dx, ly + dy, 0.09, 0.045, r); g.fill(); }
    }
    g.fillStyle = '#c99a68'; g.fillRect(0, -0.66, w, 0.44);
    g.fillStyle = '#b8895a'; for (let x = 0.16; x < w; x += 0.33) g.fillRect(x, -0.66, 0.025, 0.44);
    g.fillStyle = '#a87a4c'; g.fillRect(0, -0.7, w, 0.07);
  } else if (id === 'deco'){
    // Gold pinstripes and sunburst fans sitting on the baseboard.
    g.fillStyle = 'rgba(226,187,94,.55)'; for (let i = 0; i < w; i++) g.fillRect(i + 0.485, top, 0.03, WALL_H);
    g.fillStyle = '#e2bb5e'; g.fillRect(0, top + 0.1, w, 0.04);
    for (let i = 0; i < w; i += 2){
      const cx = i + 1, cy = -0.22, r = 0.55;
      g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.closePath(); g.fillStyle = P.dark; g.fill();
      g.strokeStyle = '#e2bb5e'; g.lineWidth = 0.035; g.stroke();
      g.beginPath();
      for (let k = 1; k < 6; k++){ const a = Math.PI + k * Math.PI / 6; g.moveTo(cx + Math.cos(a) * 0.12, cy + Math.sin(a) * 0.12); g.lineTo(cx + Math.cos(a) * (r - 0.06), cy + Math.sin(a) * (r - 0.06)); }
      g.lineWidth = 0.025; g.stroke();
    }
  } else if (id === 'luxe'){
    // Marble veining, faint panel seams and a thin gold line.
    for (let i = 0; i < w; i += 2){
      marbleVeins(mulberry(i * 97 + 11), i, top, 2, WALL_H);
      g.fillStyle = 'rgba(80,70,70,.07)'; g.fillRect(i, top, 0.025, WALL_H);
    }
    g.fillStyle = '#d4b06a'; g.fillRect(0, -0.52, w, 0.035);
  } else if (id === 'candy'){
    // Pink stripes, a scalloped frosting band, and wrapped sweets dotted along it.
    g.fillStyle = '#ffd6e2'; for (let x = 0; x < w; x += 0.5) g.fillRect(x, top, 0.25, WALL_H);
    g.fillStyle = '#fffaf3'; g.fillRect(0, -0.62, w, 0.18);
    for (let x = 0; x < w; x += 0.25){ g.beginPath(); g.arc(x + 0.125, -0.44, 0.125, 0, Math.PI); g.fill(); }
    for (let i = 0; i < w; i++){
      const cx = i + 0.5, cy = top + 0.35, c = ['#5cc8bf', '#ffd23f', '#9b7bff', '#ff8fab'][i % 4];
      ell(cx, cy, 0.1, 0.07); fs(c, 0.025);
      for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(cx + sx * 0.09, cy); g.lineTo(cx + sx * 0.18, cy - 0.06); g.lineTo(cx + sx * 0.18, cy + 0.06); g.closePath(); fs(c, 0.02); }
    }
  } else if (id === 'starry'){
    // Twinkling gold stars and a crescent moon on midnight blue.
    const R = mulberry(31);
    for (let k = 0; k < w * 5; k++){ const sx = R() * w, sy = top + 0.08 + R() * (WALL_H - 0.4), r = 0.015 + R() * 0.025; circ(sx, sy, r); g.fillStyle = R() < 0.3 ? '#f2d68a' : 'rgba(255,255,255,.75)'; g.fill(); }
    for (let i = 1.5; i < w; i += 3){
      const sx = i + (Math.floor(i) % 2) * 0.4, sy = top + 0.4;
      g.beginPath(); for (let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? 0.05 : 0.12; g.lineTo(sx + Math.cos(a) * rr2, sy + Math.sin(a) * rr2); } g.closePath(); g.fillStyle = '#f2d68a'; g.fill();
    }
    for (let i = 4; i < w; i += 9){ circ(i, top + 0.42, 0.2); g.fillStyle = '#fff3c4'; g.fill(); circ(i + 0.09, top + 0.37, 0.18); g.fillStyle = P.face; g.fill(); }
  } else if (id === 'tropic'){
    // Big banana leaves fanning up from the baseboard.
    for (let i = 0; i < w; i += 1.25){
      for (const [a, len, c] of [[-0.9, 0.8, '#5bbf6a'], [-0.35, 0.95, '#4fa85e'], [0.3, 0.9, '#66c776'], [0.85, 0.75, '#4fa85e']]){
        const bx = i + 0.6, by = -0.22, tx = bx + Math.sin(a) * len, ty = by - Math.cos(a) * len;
        g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo((bx + tx) / 2 + Math.cos(a) * 0.2, (by + ty) / 2 + Math.sin(a) * 0.2, tx, ty); g.quadraticCurveTo((bx + tx) / 2 - Math.cos(a) * 0.2, (by + ty) / 2 - Math.sin(a) * 0.2, bx, by); g.fillStyle = c; g.fill();
        g.beginPath(); g.moveTo(bx, by); g.lineTo(tx, ty); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 0.02; g.stroke();
      }
    }
    g.fillStyle = 'rgba(255,190,90,.6)'; for (let i = 0.3; i < w; i += 2.5){ circ(i, top + 0.25, 0.07); g.fill(); }
  } else if (id === 'gala'){
    // Velvet panels with gold frames, and a gold rail.
    for (let i = 0; i < w; i += 1.5){
      rr(i + 0.15, top + 0.16, 1.2, WALL_H - 0.5, 0.06); g.fillStyle = P.dark; g.fill(); g.strokeStyle = '#d4b06a'; g.lineWidth = 0.04; g.stroke();
      circ(i + 0.75, top + 0.5, 0.06); g.fillStyle = '#d4b06a'; g.fill();
    }
    g.fillStyle = '#d4b06a'; g.fillRect(0, top + 0.06, w, 0.04);
  } else if (id === 'sakura'){
    // Dark blossom branches reaching in, dotted with pink flowers, and a few petals drifting.
    const R = mulberry(41);
    for (let i = 0; i < w; i += 2.5){
      const bx = i + 0.2, by = top + 0.25;
      g.strokeStyle = '#6b4a4a'; g.lineWidth = 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, top); g.quadraticCurveTo(bx + 0.6, by + 0.25, bx + 1.6, by + 0.1); g.moveTo(bx + 0.7, by + 0.15); g.quadraticCurveTo(bx + 0.9, by + 0.45, bx + 1.2, by + 0.5); g.stroke();
      for (let k = 0; k < 9; k++){ const fx = bx + 0.2 + R() * 1.4, fy = by - 0.05 + R() * 0.55; circ(fx, fy, 0.06); g.fillStyle = R() < 0.5 ? '#ffb3c6' : '#ffc8d6'; g.fill(); circ(fx, fy, 0.018); g.fillStyle = '#e8577e'; g.fill(); }
    }
    for (let k = 0; k < w * 1.5; k++){ ell(R() * w, top + 0.6 + R() * 0.3, 0.035, 0.02, R() * 3); g.fillStyle = 'rgba(255,170,195,.8)'; g.fill(); }
  } else if (id === 'waves'){
    // Layered waves along the bottom, little sailboats bobbing on top.
    for (const [yy, c] of [[-0.62, '#9fd3ea'], [-0.48, '#6fb8dc'], [-0.34, '#3f9fc4']]){
      g.fillStyle = c; g.beginPath(); g.moveTo(0, -0.22);
      for (let x = 0; x <= w + 0.5; x += 0.25) g.lineTo(x, yy + Math.sin(x * 3 + yy * 10) * 0.05);
      g.lineTo(w + 0.5, -0.22); g.closePath(); g.fill();
    }
    for (let i = 1; i < w; i += 3.5){ const by = -0.66 + Math.sin(i * 3 - 6.2) * 0.05; g.fillStyle = '#c97b5a'; g.beginPath(); g.moveTo(i - 0.18, by); g.lineTo(i + 0.18, by); g.lineTo(i + 0.12, by + 0.07); g.lineTo(i - 0.12, by + 0.07); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(i, by - 0.32); g.lineTo(i, by - 0.02); g.lineTo(i + 0.16, by - 0.04); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 2; i < w; i += 4){ circ(i, top + 0.3, 0.1); g.fill(); circ(i + 0.14, top + 0.26, 0.13); g.fill(); circ(i + 0.3, top + 0.31, 0.09); g.fill(); }
  } else if (id === 'crystal'){
    // Faceted crystal diamonds in a lattice, a few catching the light.
    for (let i = 0; i < w; i += 0.8) for (let k = 0; k < 2; k++){
      const cx = i + 0.4 + (k % 2) * 0.4, cy = top + 0.35 + k * 0.4;
      g.beginPath(); g.moveTo(cx, cy - 0.2); g.lineTo(cx + 0.14, cy); g.lineTo(cx, cy + 0.2); g.lineTo(cx - 0.14, cy); g.closePath();
      g.fillStyle = ((i * 5 + k * 3) | 0) % 4 === 0 ? 'rgba(255,255,255,.9)' : 'rgba(190,170,240,.45)'; g.fill();
      g.strokeStyle = 'rgba(155,138,208,.5)'; g.lineWidth = 0.015; g.stroke();
      g.beginPath(); g.moveTo(cx - 0.14, cy); g.lineTo(cx + 0.14, cy); g.stroke();
    }
  } else if (id === 'neonights'){
    // Glowing neon stripes: pink, cyan and gold, with soft halos.
    for (const [yy, c] of [[top + 0.3, '#ff6fb5'], [top + 0.5, '#4cc9f0'], [top + 0.7, '#ffd23f']]){
      g.strokeStyle = c; g.globalAlpha = 0.3; g.lineWidth = 0.12; g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy); g.stroke();
      g.globalAlpha = 1; g.lineWidth = 0.035; g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy); g.stroke();
    }
    for (let i = 1; i < w; i += 3){ g.strokeStyle = '#ff6fb5'; g.lineWidth = 0.03; g.beginPath(); g.arc(i, top + 0.95, 0.12, 0, Math.PI * 2); g.stroke(); }
  } else if (id === 'casino'){
    // Red velvet panels in gold frames, a marquee of bulbs along the top and the suits along the rail.
    for (let i = 0; i < w; i += 1.5){ rr(i + 0.12, top + 0.32, 1.26, WALL_H - 0.66, 0.08); g.fillStyle = P.dark; g.fill(); g.strokeStyle = '#f2c14e'; g.lineWidth = 0.035; g.stroke(); }
    g.fillStyle = '#2b1d4f'; g.fillRect(0, top, w, 0.24);
    for (let x = 0.15; x < w; x += 0.3){ circ(x, top + 0.12, 0.06); g.fillStyle = Math.floor(x / 0.3) % 2 ? '#fff3b0' : '#ffd23f'; g.fill(); }
    const suits = ['♠', '♥', '♦', '♣'];
    for (let i = 0; i < w; i += 1.5){ const k = Math.floor(i / 1.5) % 4; text(suits[k], i + 0.75, -0.55, 0.3, k === 1 || k === 2 ? '#ff4f6d' : '#f2c14e', 700); }
  } else {
    g.fillStyle = '#ddcdf0'; for (let i = 0; i < w; i++) g.fillRect(i + 0.45, top, 0.1, WALL_H);
  }
}
export function sideWall(x, y0, y1){
  const P = wallpaper();
  box(x - 0.12, y0, 0.24, y1 - y0, WALL_H, P.cap, P.dark);
}
export function frontWall(x0, x1, y){
  const P = wallpaper();
  box(x0, y - 0.1, x1 - x0, 0.2, 0.55, P.cap, P.dark, 0, 0.04);
}
export function entranceDoors(x, y, w, open){
  // Low sliding glass doors so the cutaway view stays clear.
  box(x - 0.1, y - 0.12, 0.16, 0.24, 0.62, '#ffc2d1', '#ff8fab');
  box(x + w - 0.06, y - 0.12, 0.16, 0.24, 0.62, '#ffc2d1', '#ff8fab');
  const gap = open * 0.45;
  for (const [gx, gw] of [[x + 0.06 - gap, w / 2 - 0.06], [x + w / 2 + gap, w / 2 - 0.06]]){
    rr(gx, y - 0.48, gw, 0.5, 0.03); fs('rgba(185,228,245,.6)', 0.04);
  }
}
// Below the second floor's front railing: open sky and the town's rooftops.
export function skyView(x, y, w, h, night = false){
  if (night) return nightCity(x, y, w, h);
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#a9dcf5'); gr.addColorStop(1, '#f6dbe6');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  const R = mulberry(77);
  g.fillStyle = 'rgba(255,255,255,.8)';
  for (let cx = x + 1 + R() * 3; cx < x + w; cx += 5 + R() * 4){ const cy = y + 0.45 + R() * 0.3; circ(cx, cy, 0.22); g.fill(); circ(cx + 0.28, cy - 0.08, 0.28); g.fill(); circ(cx + 0.6, cy, 0.2); g.fill(); }
  // Rooftops along the bottom, in a soft lavender haze.
  for (let rx = x; rx < x + w; ){
    const bw = 0.8 + R() * 1.6, bh = 0.35 + R() * 0.7;
    g.fillStyle = R() < 0.5 ? '#c9b8dc' : '#bba9d1'; g.fillRect(rx, y + h - bh, bw + 0.02, bh);
    g.fillStyle = 'rgba(255,240,200,.75)';
    for (let wx = rx + 0.15; wx < rx + bw - 0.15; wx += 0.3) for (let wy = y + h - bh + 0.12; wy < y + h - 0.1; wy += 0.28) if (R() < 0.35) g.fillRect(wx, wy, 0.1, 0.1);
    rx += bw;
  }
}
// Below the casino's windows: the city at night, all neon.
function nightCity(x, y, w, h){
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#1b1440'); gr.addColorStop(1, '#4a2a6a');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  const R = mulberry(91);
  for (let k = 0; k < w * 3; k++){ circ(x + R() * w, y + R() * h * 0.5, 0.015 + R() * 0.02); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill(); }
  for (let rx = x; rx < x + w; ){
    const bw = 0.7 + R() * 1.4, bh = 0.5 + R() * 0.9;
    g.fillStyle = R() < 0.5 ? '#2b1d4f' : '#35245e'; g.fillRect(rx, y + h - bh, bw + 0.02, bh);
    const neonC = ['#ff4fa0', '#4cc9f0', '#ffd23f', '#7bff9b'][Math.floor(R() * 4)];
    if (R() < 0.45){ g.fillStyle = neonC; g.fillRect(rx + 0.1, y + h - bh + 0.08, bw - 0.2, 0.05); }
    g.fillStyle = 'rgba(255,220,150,.75)';
    for (let wx = rx + 0.12; wx < rx + bw - 0.12; wx += 0.26) for (let wy = y + h - bh + 0.22; wy < y + h - 0.1; wy += 0.24) if (R() < 0.4) g.fillRect(wx, wy, 0.09, 0.09);
    rx += bw;
  }
}
// Upstairs there's no front door: a low wall topped with a glass railing, looking out.
export function upperFrontWall(x0, x1, y){
  const P = wallpaper();
  rr(x0, y - 0.62, x1 - x0, 0.44, 0.04); fs('rgba(185,228,245,.45)', 0.035);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 0.03; g.beginPath();
  for (let x = Math.ceil(x0); x < x1 - 0.5; x += 2){ g.moveTo(x + 0.2, y - 0.26); g.lineTo(x + 0.4, y - 0.56); }
  g.stroke();
  box(x0, y - 0.1, x1 - x0, 0.2, 0.3, P.cap, P.dark, 0, 0.04);
  rr(x0, y - 0.7, x1 - x0, 0.1, 0.05); fs('#c9a46b', 0.035);
}
// The escalators. Ground floor: two belts rising toward the east wall, up into a bulkhead with the 2F sign.
// Second floor: an open stairwell with railings round it and the belts sinking out of sight.
// Layers: 'back' (floor plate, belts, back rail) under the riders, 'mid' (the rail between the belts), 'front'.
const ESC_H = 1.15;
export function escalator(e, t, layer){
  const P = wallpaper(), up = !!e.rise, near = e.dir > 0 ? e.x + 0.08 : e.x + e.w - 0.08, far = e.dir > 0 ? e.x + e.w - 0.05 : e.x + 0.05;
  const lanes = [[e.y + 0.14, e.y + 0.96], [e.y + 1.04, e.y + 1.86]];
  const lift = u => up ? -ESC_H * u : 0;   // how far up the screen a point u of the way along the belt is drawn
  if (layer === 'back'){
    if (up){
      // Comb plates at the landing end, then the belts.
      rr(Math.min(near, near - e.dir * 0.4), e.y + 0.08, 0.4, e.h - 0.16, 0.05); fs('#c9c4cf', 0.035);
      lanes.forEach(([a, b], i) => {
        g.beginPath(); g.moveTo(near, a); g.lineTo(far, a + lift(1)); g.lineTo(far, b + lift(1)); g.lineTo(near, b); g.closePath(); fs('#5f5a6b', 0.04);
        // Steps sliding along: up the first belt, down the second.
        g.strokeStyle = 'rgba(220,214,230,.55)'; g.lineWidth = 0.03; g.beginPath();
        for (let k = 0; k < 9; k++){ const u = ((k / 9 + (i ? -1 : 1) * t * 0.35) % 1 + 1) % 1, x = near + (far - near) * u; g.moveTo(x, a + lift(u) + 0.04); g.lineTo(x, b + lift(u) - 0.04); }
        g.stroke();
        g.fillStyle = i ? '#ffd23f' : '#5cc8bf'; g.fillRect(near - e.dir * 0.06 - 0.03, a + 0.06, 0.06, b - a - 0.12);
      });
      railing(near, far, e.y + 0.1, true);
    } else {
      // The stairwell: a dark opening, belts dropping away into it.
      g.save(); rr(e.x, e.y, e.w, e.h, 0.08); g.clip();
      const gr = g.createLinearGradient(near, 0, far, 0); gr.addColorStop(0, '#8d869c'); gr.addColorStop(1, '#2d2236');
      g.fillStyle = gr; g.fillRect(e.x, e.y, e.w, e.h);
      lanes.forEach(([a, b], i) => {
        g.beginPath(); g.moveTo(near, a); g.lineTo(far, a + 0.9); g.lineTo(far, b + 0.9); g.lineTo(near, b); g.closePath();
        const bg = g.createLinearGradient(near, 0, far, 0); bg.addColorStop(0, '#6b6578'); bg.addColorStop(1, '#2d2236'); g.fillStyle = bg; g.fill();
        g.strokeStyle = 'rgba(220,214,230,.35)'; g.lineWidth = 0.03; g.beginPath();
        for (let k = 0; k < 9; k++){ const u = ((k / 9 + (i ? -1 : 1) * t * 0.35) % 1 + 1) % 1, x = near + (far - near) * u; g.moveTo(x, a + 0.9 * u + 0.04); g.lineTo(x, b + 0.9 * u - 0.04); }
        g.stroke();
      });
      g.restore();
      rr(e.x, e.y, e.w, e.h, 0.08); fs(null, 0.05);
      rr(e.dir < 0 ? e.x + e.w - 0.32 : e.x, e.y + 0.06, 0.32, e.h - 0.12, 0.05); fs('#c9c4cf', 0.035);
      railing(e.x + 0.05, e.x + e.w - 0.05, e.y + 0.08, false);
    }
    return;
  }
  if (layer === 'mid'){ railing(near, far, e.y + 1.0, up); return; }
  // Front: the near-side rail, then (ground floor) the truss under the belts and the bulkhead they ride up into.
  railing(near, far, e.y + e.h - 0.06, up);
  if (up){
    const y = e.y + e.h - 0.06;
    g.beginPath(); g.moveTo(near + e.dir * 0.3, y); g.lineTo(far, y + lift(1) + 0.08); g.lineTo(far, y); g.closePath(); fs(P.dark, 0.04);
    // The bulkhead the belts disappear into, with the 2F sign hanging off its front.
    const bx = e.dir > 0 ? far - 0.42 : far + 0.07;
    box(bx, e.y - 0.05, 0.35, e.h + 0.1, ESC_H + 0.95, P.cap, P.face, 0, 0.05);
    g.fillStyle = 'rgba(45,30,40,.25)'; g.fillRect(bx + 0.04, e.y + e.h + 0.05 - ESC_H - 0.95 + 0.1, 0.27, ESC_H + 0.75);
    const sx = bx + 0.18 - e.dir * 0.2, sy = e.y - 2.4;
    rr(sx - 0.5, sy - 0.22, 1.0, 0.44, 0.1); fs('#3d2b56', 0.04);
    text(e.label, sx, sy + 0.01, 0.26, '#ffd23f', 700);
  } else {
    // A little sign on a post by the landing.
    const px = e.dir < 0 ? e.x + e.w + 0.15 : e.x - 0.15, py = e.y + 0.2;
    rr(px - 0.03, py - 1.0, 0.06, 1.0, 0.02); fs('#8d869c', 0.03);
    rr(px - 0.42, py - 1.36, 0.84, 0.4, 0.1); fs('#3d2b56', 0.04);
    text(e.label, px, py - 1.16, 0.22, '#ffd23f', 700);
  }
}
// A glass balustrade with a black handrail, sloping up with the belt (or flat round the stairwell).
function railing(x0, x1, y, sloped){
  const rise = sloped ? -ESC_H : 0, hh = 0.42;
  const a = Math.min(x0, x1), b = Math.max(x0, x1), ra = sloped ? (x0 < x1 ? 0 : rise) : 0, rb = sloped ? (x0 < x1 ? rise : 0) : 0;
  g.beginPath(); g.moveTo(a, y + ra); g.lineTo(b, y + rb); g.lineTo(b, y + rb - hh); g.lineTo(a, y + ra - hh); g.closePath();
  g.fillStyle = 'rgba(185,228,245,.42)'; g.fill(); g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.025; g.stroke();
  g.beginPath(); g.moveTo(a, y + ra - hh); g.lineTo(b, y + rb - hh); g.strokeStyle = '#2b2230'; g.lineWidth = 0.07; g.lineCap = 'round'; g.stroke();
  g.beginPath(); g.moveTo(a, y + ra); g.lineTo(b, y + rb); g.strokeStyle = '#c9c4cf'; g.lineWidth = 0.05; g.stroke();
}
export function mallSign(x, y, name){
  rr(x - 2.2, y - 0.42, 4.4, 0.62, 0.18); fs('#fff8fa', 0.05);
  text(name, x, y - 0.11, 0.36, '#e8577e', 700, 'Fredoka', 4.0);
}

/* ---------- Units (store shells) ---------- */
export function doorX(u){ return u.x + Math.floor(u.w / 2); }

// Wall color for a unit given its state.
// Stores and restrooms both have a sign, furniture and lit windows.
const isOpen = u => u.state === 'store' || u.state === 'restroom';
function unitWall(u, def){
  if (u.state === 'derelict') return ['#b5a996', '#a2967f'];
  if (u.state === 'vacant'){ const P = wallpaper(); return [P.face, P.dark]; }
  return [shade(def.color, 0.55), shade(def.color, 0.25)];
}

// The back layer: back wall (tall for doors facing down), plus the store's back-row furniture.
export function unitBack(u, def, t){
  const [wl, wd] = unitWall(u, def);
  if (u.face === 'down'){
    const H = 1.05;
    g.fillStyle = wd; g.fillRect(u.x, u.y - H, u.w, H);
    if (u.state === 'store') wallDeco(u, def, H, t);
    else if (isOpen(u)){
      g.fillStyle = shade(def.color, 0.4); for (let i = 0; i < u.w * 3; i++) if (i % 2) g.fillRect(u.x + i / 3, u.y - H, 1 / 3, H);
    }
    if (u.state === 'derelict'){
      g.fillStyle = 'rgba(110,95,70,.25)'; ell(u.x + 0.6, u.y - 0.75, 0.3, 0.2); g.fill(); rr(u.x + 0.52, u.y - 0.75, 0.1, 0.5, 0.05); g.fill();
      g.save(); g.globalAlpha = 0.25; text(['VID O HUT', 'SH E BARN', 'T Y LAND', 'MALL ART'][u.id % 4], u.x + u.w / 2, u.y - 0.6, 0.26, OUT, 700, 'Fredoka', u.w - 0.2); g.restore();
    }
    g.beginPath(); g.rect(u.x, u.y - H, u.w, H); fs(null);
    rr(u.x - 0.04, u.y - H - 0.14, u.w + 0.08, 0.14, 0.03); fs(wl);
    if (u.state === 'vacant'){ forLease(u.x + u.w / 2, u.y - 0.6, -0.05, 0.9); }
    if (u.state === 'derelict'){ cobweb(u.x, u.y - H, 0.42, 1); cobweb(u.x + u.w, u.y - H, 0.36, -1); }
  } else {
    if (isOpen(u)) storeFurniture(u, def, t, 'back');
    box(u.x - 0.04, u.y + u.h - 0.1, u.w + 0.08, 0.16, 0.42, wl, wd);
    if (u.state === 'store'){ storeWallpaper(u, def, u.x, u.y + u.h - 0.34, u.w, 0.38); rr(u.x - 0.04, u.y + u.h - 0.36, u.w + 0.08, 0.42, 0.05); fs(null); }
  }
  if (isOpen(u) && u.face === 'down') storeFurniture(u, def, t, 'back');
  // The sign goes up last so tall back shelves and cabinets never cover the store's name.
  if (u.face === 'down' && isOpen(u)){
    // Wide stores share the sign band with their wall piece.
    if (u.state === 'store' && u.w >= 3) storeSign(u.x + 0.15 + (u.w - 1.35) / 2, u.y - 0.77, u.w - 1.35, def);
    else storeSign(u.x + u.w / 2, u.y - 0.77, u.w - 0.4, def);
  }
  if (u.state === 'derelict') derelictJunk(u);
}

// Convert a store-local rectangle (lx, ly from the back wall) into world coordinates.
export function local(u, lx, ly, lw = 0, ld = 0){
  const x = u.x + lx;
  const y = u.face === 'down' ? u.y + ly : u.y + u.h - ly - ld;
  return [x, y, lw, ld];
}
export function storeSpots(u){
  const W = u.w, H = u.h;
  const at = (lx, ly) => { const [x, y] = local(u, lx, ly); return { x, y }; };
  const counter = local(u, W - 1.05, 0.95, 0.95, 0.42);
  const staff = at(W - 0.55, 0.62);
  // (Noodle Nook's second in line waits by the door, clear of its little table.)
  const queue = [at(W - 0.55, Math.min(1.75, H - 0.25)), u.store === 'noodle' ? at(1.12, 1.88) : at(Math.max(0.45, W - 1.3), Math.min(1.75, H - 0.25))];
  if (H >= 3) queue.push(at(W - 0.55, 2.55));
  const browse = [];
  // At the burger, pizza and sushi places the left side is tables, so folks look at the menu from the middle instead.
  const lx0 = u.store === 'burger' || u.store === 'pizza' || u.store === 'sushi' ? 1.4 : 0.4;
  for (let ly = 0.9; ly <= H - 0.35; ly += 0.55) for (let lx = lx0; lx <= Math.max(lx0, W - 1.35); lx += 0.45){
    // Not standing in the middle of Threads' tee table or on the mannequin.
    if (u.store === 'boutique' && H >= 3 && ((lx > 0.75 && lx < 1.75 && ly > 1.1 && ly < 1.75) || (lx < 0.7 && ly > 1.7))) continue;
    browse.push(at(lx, ly));
  }
  if (u.store === 'noodle') browse.splice(0, browse.length, at(1.12, 1.88));
  if (!browse.length) browse.push(at(0.45, H - 0.4));
  const dx = doorX(u) + 0.5;
  const door = { x: dx, y: u.face === 'down' ? u.y + u.h - 0.25 : u.y + 0.25 };
  const front = { x: dx, y: u.face === 'down' ? u.y + u.h + 0.5 : u.y - 0.5 };
  // Door to register goes around the left end of the counter, never through it.
  const side = W - 1.2;
  const staffPath = [door, at(side, Math.min(1.7, H - 0.3)), at(side, 0.66), staff];
  return { counter, staff, queue, browse, door, front, staffPath };
}
export function kioskSpots(k){
  const cx = k.x + 1;
  return {
    staff: { x: cx, y: k.y + 0.12 },
    queue: [{ x: cx + 0.05, y: k.y + 1.5 }, { x: cx - 0.85, y: k.y + 1.62 }, { x: cx + 0.95, y: k.y + 1.62 }],
    front: { x: cx + 0.05, y: k.y + 1.5 },
  };
}

function derelictJunk(u){
  const R = mulberry(u.id * 31 + 7);
  const [bx, by] = local(u, 0.25 + R() * (u.w - 1.2), 0.15, 0.8, 0.4);
  box(bx, by, 0.8, 0.4, 0.45, '#9d8f7c', '#857663');
  if (u.w * u.h >= 6){ const [cx, cy] = local(u, u.w - 0.9, 1.2, 0.55, 0.45); cardboard(cx, cy, 0.55, 0.45, 0.4); }
  const [px, py] = local(u, 0.4, u.h - 0.6); deadPlant(px, py + 0.2);
}

export const JAR = ['#ff6b8b', '#ffd23f', '#5cc8bf', '#9b7bff', '#ff9f43', '#7bd389', '#5a8dee'];
export function goods(x, y, w, rows, seed, cols = JAR){
  const R = mulberry(seed);
  for (let r = 0; r < rows; r++){
    let px = x + 0.06;
    while (px < x + w - 0.2){
      const bw = 0.12 + R() * 0.12, bh = 0.1 + R() * 0.1;
      rr(px, y - r * 0.24 - bh, bw, bh, 0.02); fs(cols[Math.floor(R() * cols.length)], 0.022);
      px += bw + 0.03;
    }
  }
}
export function shelf(x, y, w, d, h, items, seed){
  box(x, y, w, d, h, '#f2e6c8', '#d9c59a');
  const top = y + d - h, rows = Math.max(1, Math.floor((h - 0.1) / 0.26));
  if (items === 'jars'){
    const n = Math.max(1, Math.floor(w / 0.38));
    for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++){
      const cx = x + (i + 0.5) * w / n, cy = y + d - 0.06 - r * 0.28;
      rr(cx - 0.1, cy - 0.2, 0.2, 0.2, 0.05); fs('rgba(235,248,255,.95)', 0.025);
      circ(cx, cy - 0.08, 0.065); fs(JAR[(i + r * 3 + seed) % JAR.length], 0);
      rr(cx - 0.075, cy - 0.23, 0.15, 0.05, 0.02); fs('#c98b55', 0.02);
    }
  } else if (items === 'books'){
    const R = mulberry(seed);
    for (let r = 0; r < rows; r++){
      let px = x + 0.06;
      while (px < x + w - 0.08){ const bw = 0.05 + R() * 0.05, bh = 0.15 + R() * 0.06; rr(px, y + d - 0.06 - r * 0.26 - bh, bw, bh, 0.01); fs(JAR[Math.floor(R() * JAR.length)], 0.015); px += bw + 0.01; }
    }
  } else if (items === 'tanks'){
    const n = Math.max(1, Math.floor(w / 0.6));
    for (let i = 0; i < n; i++){
      const tx = x + 0.06 + i * (w - 0.12) / n, tw = (w - 0.12) / n - 0.06;
      rr(tx, top + 0.06, tw, h - 0.14, 0.04); fs('rgba(120,200,235,.9)', 0.03);
      ell(tx + tw * 0.4, top + 0.3, 0.07, 0.04); fs('#ff9f43', 0.015); ell(tx + tw * 0.7, top + 0.45, 0.06, 0.035); fs('#ffd23f', 0.015);
    }
  } else if (items === 'rack'){
    g.strokeStyle = '#8a7a8a'; g.lineWidth = 0.04; g.beginPath(); g.moveTo(x + 0.05, top + 0.12); g.lineTo(x + w - 0.05, top + 0.12); g.stroke();
    const n = Math.max(2, Math.floor(w / 0.2));
    for (let i = 0; i < n; i++){ const cx = x + 0.12 + i * (w - 0.24) / (n - 1); rr(cx - 0.08, top + 0.14, 0.16, h - 0.3, 0.05); fs(JAR[(i + seed) % JAR.length], 0.022); }
  } else {
    goods(x, y + d - 0.04, w, rows, seed);
  }
}
/* ---------- Store themes: what each kind of store looks like ---------- */
// The back wall's pattern and wall decor for doors facing down (the wall faces us), drawn behind the furniture.
// Wall decor sits on the right, above the counter, where the back shelf doesn't reach.
function wallDeco(u, def, H, t){
  storeWallpaper(u, def, u.x, u.y - H, u.w, H);
  wallPiece(u, def, t);
}
// The store's wallpaper, clipped to a rectangle of wall.
function storeWallpaper(u, def, x0, y0, w, H){
  const ic = def.icon, R = mulberry(u.id * 13 + 5);
  g.save(); g.beginPath(); g.rect(x0, y0, w, H); g.clip();
  const stripes = (a, b, step) => { g.fillStyle = a; g.fillRect(x0, y0, w, H); g.fillStyle = b; for (let i = 0; i * step < w; i += 2) g.fillRect(x0 + i * step, y0, step, H); };
  switch (ic){
    case 'candy':
      stripes('#ffe3ec', '#ffc2d4', 0.22);
      for (let k = 0; k < w * 10; k++){ g.fillStyle = JAR[k % JAR.length]; g.save(); g.translate(x0 + R() * w, y0 + R() * H); g.rotate(R() * 3); g.fillRect(-0.04, -0.012, 0.08, 0.024); g.restore(); }
      break;
    case 'cup':   // warm brick
      g.fillStyle = '#b07a5a'; g.fillRect(x0, y0, w, H);
      g.strokeStyle = 'rgba(255,235,210,.35)'; g.lineWidth = 0.02; g.beginPath();
      for (let r = 0; r * 0.15 < H; r++){ const yy = y0 + r * 0.15; g.moveTo(x0, yy); g.lineTo(x0 + w, yy); for (let xx = x0 + (r % 2) * 0.17; xx < x0 + w; xx += 0.34){ g.moveTo(xx, yy); g.lineTo(xx, yy + 0.15); } }
      g.stroke(); break;
    case 'book':  // wood paneling
      g.fillStyle = '#8a6a4f'; g.fillRect(x0, y0, w, H); g.fillStyle = '#7a5c43'; for (let i = 0; i * 0.3 < w; i += 2) g.fillRect(x0 + i * 0.3, y0, 0.3, H); break;
    case 'paw':
      g.fillStyle = '#d8f1e4'; g.fillRect(x0, y0, w, H);
      for (let i = 0; i < w * 2.5; i++) pawIcon(x0 + 0.2 + (i % (w * 2.5)) * 0.4, y0 + 0.2 + (i % 2) * 0.4, 0.13, 'rgba(6,167,125,.3)');
      break;
    case 'joystick':
      g.fillStyle = '#2a1f4a'; g.fillRect(x0, y0, w, H);
      for (const [c, oy] of [['#ff5fa2', 0.25], ['#3ee0d0', 0.55]]){ g.strokeStyle = c; g.lineWidth = 0.035; g.beginPath(); for (let x = x0; x <= x0 + w + 0.2; x += 0.2) g.lineTo(x, y0 + oy + ((x - x0) * 5 % 2 < 1 ? -0.06 : 0.06)); g.stroke(); }
      break;
    case 'record':
      g.fillStyle = '#3d405b'; g.fillRect(x0, y0, w, H); g.fillStyle = '#34374f'; for (let i = 0; i * 0.25 < w; i += 2) g.fillRect(x0 + i * 0.25, y0, 0.25, H); break;
    case 'tv':
      g.fillStyle = '#d6f0fa'; g.fillRect(x0, y0, w, H);
      g.strokeStyle = 'rgba(17,138,178,.3)'; g.lineWidth = 0.025; g.beginPath();
      for (let i = 0; i < w * 3; i++){ const sx = x0 + R() * w, sy = y0 + R() * H; g.moveTo(sx, sy); g.lineTo(sx + 0.2, sy); g.lineTo(sx + 0.2, sy + 0.15); g.moveTo(sx + 0.2, sy + 0.15); g.arc(sx + 0.2, sy + 0.17, 0.02, -Math.PI / 2, Math.PI * 1.5); }
      g.stroke(); break;
    case 'dollar':
      stripes('#fff1b8', '#ffe68a', 0.33); break;
    case 'toy':
      g.fillStyle = '#e3f2ff'; g.fillRect(x0, y0, w, H);
      for (let k = 0; k < w * 3; k++){ const sx = x0 + 0.2 + k * 0.33, sy = y0 + 0.2 + (k % 2) * 0.35; g.fillStyle = JAR[k % JAR.length]; g.save(); g.translate(sx, sy); g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.035 : 0.08; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.globalAlpha = 0.55; g.fill(); g.restore(); }
      break;
    case 'perfume':
      g.fillStyle = '#f6e6ff'; g.fillRect(x0, y0, w, H);
      g.strokeStyle = 'rgba(199,125,255,.35)'; g.lineWidth = 0.02; for (let x = x0; x < x0 + w; x += 0.25){ g.beginPath(); for (let yy = y0; yy <= y0 + H; yy += 0.1) g.lineTo(x + Math.sin((yy - y0) * 9) * 0.04, yy); g.stroke(); }
      break;
    case 'controller':
      g.fillStyle = '#1c1240'; g.fillRect(x0, y0, w, H);
      g.strokeStyle = 'rgba(76,201,240,.5)'; g.lineWidth = 0.02; g.beginPath(); for (let x = x0; x < x0 + w; x += 0.2){ g.moveTo(x, y0); g.lineTo(x, y0 + H); } for (let yy = y0; yy < y0 + H; yy += 0.2){ g.moveTo(x0, yy); g.lineTo(x0 + w, yy); } g.stroke();
      break;
    case 'shoe':
      g.fillStyle = '#fbe9dc'; g.fillRect(x0, y0, w, H); g.fillStyle = '#f4d5bf'; for (let r = 0; r * 0.2 < H; r += 2) g.fillRect(x0, y0 + r * 0.2, w, 0.2); break;
    case 'pizza': A2.pizzaWallpaper(x0, y0, w, H); break;
    case 'leaf': case 'ring': case 'vr': case 'cupcake': case 'comic': A2.newWallpaper(ic, x0, y0, w, H); break;
    case 'ball': case 'lipstick': case 'taco': case 'noodle': case 'brush': case 'sushi': A4.wallpaper(ic, x0, y0, w, H); break;
    case 'chip': case 'cocktail': case 'clover': A3.casinoWallpaper(ic, x0, y0, w, H); break;
    case 'burger':
      g.fillStyle = '#fff6e0'; g.fillRect(x0, y0, w, H);
      for (let i = 0; i * 0.2 < w; i++) for (let j = 0; j * 0.2 < H; j++) if ((i + j) % 2){ g.fillStyle = '#ffd9a0'; g.fillRect(x0 + i * 0.2, y0 + j * 0.2, 0.2, 0.2); }
      g.fillStyle = '#d62828'; g.fillRect(x0, y0 + H - 0.12, w, 0.12); break;
    case 'shirt':
      g.fillStyle = '#e4ecff'; g.fillRect(x0, y0, w, H);
      g.strokeStyle = 'rgba(90,141,238,.25)'; g.lineWidth = 0.02; g.beginPath();
      for (let x = x0 - H; x < x0 + w; x += 0.3){ g.moveTo(x, y0); g.lineTo(x + H, y0 + H); g.moveTo(x + H, y0); g.lineTo(x, y0 + H); }
      g.stroke(); break;
    default:
      g.fillStyle = shade(def.color, 0.25); g.fillRect(x0, y0, w, H);
      g.fillStyle = shade(def.color, 0.4); for (let i = 0; i < w * 3; i++) if (i % 2) g.fillRect(x0 + i / 3, y0, 1 / 3, H);
  }
  g.restore();
}
// Something on the wall that says what the store is, on the free patch behind the counter (under the sign).
function wallPiece(u, def, t){
  // Wide stores hang it beside the sign, up out of the clerk's way; narrow ones put it left of where the clerk stands.
  const wide = u.w >= 3, wx = wide ? u.x + u.w - 1.02 : u.x + 0.55, wy = wide ? u.y - 0.72 : u.y - 0.27;
  const ic = def.icon;
  g.save(); g.translate(wx + 0.45, wy); g.scale(0.85, 0.85); g.translate(-(wx + 0.45), -wy);
  wallPieceArt(ic, wx, wy, t);
  g.restore();
}
function wallPieceArt(ic, wx, wy, t){
  switch (ic){
    case 'candy':   // a giant swirly lollipop
      g.strokeStyle = '#fff'; g.lineWidth = 0.06; g.beginPath(); g.moveTo(wx + 0.45, wy - 0.05); g.lineTo(wx + 0.45, wy + 0.25); g.stroke();
      circ(wx + 0.45, wy - 0.08, 0.16); fs('#ff6b8b', 0.035);
      g.beginPath(); for (let a = 0; a < 13; a += 0.25){ const r = 0.011 * a; g.lineTo(wx + 0.45 + Math.cos(a) * r, wy - 0.08 + Math.sin(a) * r); } g.strokeStyle = '#fff'; g.lineWidth = 0.04; g.stroke();
      break;
    case 'cup':     // chalkboard menu
      rr(wx + 0.05, wy - 0.24, 0.8, 0.44, 0.04); fs('#3b3f3a', 0.035);
      text('MENU', wx + 0.45, wy - 0.14, 0.11, '#fff6e0', 700);
      g.strokeStyle = 'rgba(255,246,224,.7)'; g.lineWidth = 0.018; g.beginPath(); for (let i = 0; i < 3; i++){ g.moveTo(wx + 0.15, wy - 0.04 + i * 0.07); g.lineTo(wx + 0.6, wy - 0.04 + i * 0.07); g.moveTo(wx + 0.68, wy - 0.04 + i * 0.07); g.lineTo(wx + 0.76, wy - 0.04 + i * 0.07); } g.stroke();
      break;
    case 'book':    // a framed READ poster
      rr(wx + 0.2, wy - 0.24, 0.5, 0.38, 0.03); fs('#f2e6c8', 0.035); text('READ', wx + 0.45, wy - 0.1, 0.13, '#3d5a80', 700); rr(wx + 0.3, wy, 0.3, 0.06, 0.02); fs('#e07a5f', 0.015);
      break;
    case 'paw':     // a happy dog poster
      rr(wx + 0.18, wy - 0.24, 0.55, 0.4, 0.04); fs('#fffaf0', 0.035); puppy(wx + 0.42, wy + 0.1, 0); break;
    case 'record':  // a guitar on the wall
      g.save(); g.translate(wx + 0.45, wy + 0.02); g.rotate(-0.3); g.scale(0.75, 0.75);
      rr(-0.03, -0.42, 0.06, 0.36, 0.02); fs('#6b4a3a', 0.025); rr(-0.06, -0.48, 0.12, 0.08, 0.02); fs('#3d2b35', 0.02);
      circ(0, 0.0, 0.14); fs('#ef476f', 0.03); circ(0, 0.12, 0.17); fs('#ef476f', 0.03); circ(0, 0.06, 0.05); fs('#2b2d42', 0);
      g.restore(); break;
    case 'toy':     // a big balloon bunch
      for (const [dx, dy, c] of [[0.3, -0.12, '#ef476f'], [0.48, -0.2, '#ffd23f'], [0.62, -0.08, '#06d6a0']]){ g.strokeStyle = OUT; g.lineWidth = 0.012; g.beginPath(); g.moveTo(wx + dx, wy + dy + 0.1); g.lineTo(wx + 0.47, wy + 0.24); g.stroke(); ell(wx + dx, wy + dy, 0.1, 0.12); fs(c, 0.025); }
      break;
    case 'perfume': // an arched mirror with a bow
      g.beginPath(); g.moveTo(wx + 0.25, wy + 0.2); g.lineTo(wx + 0.25, wy - 0.05); g.arc(wx + 0.45, wy - 0.05, 0.2, Math.PI, 0); g.lineTo(wx + 0.65, wy + 0.2); g.closePath(); fs('#f2c94c', 0.035);
      g.beginPath(); g.moveTo(wx + 0.3, wy + 0.16); g.lineTo(wx + 0.3, wy - 0.04); g.arc(wx + 0.45, wy - 0.04, 0.15, Math.PI, 0); g.lineTo(wx + 0.6, wy + 0.16); g.closePath(); fs('#e9f6fb', 0.02);
      ell(wx + 0.4, wy - 0.24, 0.05, 0.03, -0.4); fs('#ff8fc8', 0.015); ell(wx + 0.5, wy - 0.24, 0.05, 0.03, 0.4); fs('#ff8fc8', 0.015);
      break;
    case 'controller': // a big game poster
      rr(wx + 0.12, wy - 0.24, 0.66, 0.42, 0.03); fs('#3a0ca3', 0.035); text('LEVEL', wx + 0.45, wy - 0.13, 0.1, '#4cc9f0', 700); text('UP!', wx + 0.45, wy + 0.0, 0.14, '#ffd23f', 700);
      break;
    case 'shoe':    // slanted shelves of sneakers
      for (let r = 0; r < 2; r++){ rr(wx + 0.1, wy - 0.1 + r * 0.2, 0.7, 0.04, 0.01); fs('#c9a27e', 0.015); for (let i = 0; i < 3; i++){ g.save(); g.translate(wx + 0.22 + i * 0.22, wy - 0.15 + r * 0.2); g.scale(0.14, 0.14); storeIcon('shoe', 0, 0, 1, JAR[(i + r * 2) % JAR.length]); g.restore(); } }
      break;
    case 'pizza': A2.pizzaMenu(wx, wy); break;
    case 'leaf': case 'ring': case 'vr': case 'cupcake': case 'comic': A2.newWallPiece(ic, wx, wy, t); break;
    case 'ball': case 'lipstick': case 'taco': case 'noodle': case 'brush': case 'sushi': A4.wallPiece(ic, wx, wy, t); break;
    case 'chip': case 'cocktail': case 'clover': A3.casinoWallPiece(ic, wx, wy, t); break;
    case 'burger':  // a lit menu board
      rr(wx + 0.05, wy - 0.24, 0.8, 0.42, 0.04); fs('#2b2d42', 0.035);
      for (let i = 0; i < 3; i++){ g.save(); g.translate(wx + 0.2 + i * 0.25, wy - 0.1); g.scale(0.12, 0.12); storeIcon(['burger', 'cup', 'burger'][i], 0, 0, 1); g.restore(); text(['$5', '$2', '$7'][i], wx + 0.2 + i * 0.25, wy + 0.07, 0.08, '#fcbf49', 700); }
      break;
    case 'shirt':   // a tall mirror
      rr(wx + 0.3, wy - 0.26, 0.36, 0.5, 0.15); fs('#d7a86e', 0.035); rr(wx + 0.35, wy - 0.21, 0.26, 0.4, 0.11); fs('#cfeaf5', 0.02);
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(wx + 0.4, wy - 0.08); g.lineTo(wx + 0.5, wy - 0.16); g.stroke();
      break;
    case 'dollar':  // a big price tag
      g.save(); g.translate(wx + 0.45, wy - 0.06); g.rotate(-0.15);
      g.beginPath(); g.moveTo(-0.32, -0.15); g.lineTo(0.22, -0.15); g.lineTo(0.34, 0); g.lineTo(0.22, 0.15); g.lineTo(-0.32, 0.15); g.closePath(); fs('#2f9e6a', 0.035);
      circ(0.2, 0, 0.03); fs('#fff1b8', 0.015); text('$1', -0.06, 0.01, 0.2, '#fff', 700);
      g.restore(); break;
    case 'joystick': // prize shelf with plushies
      box(wx + 0.05, wy + 0.0, 0.8, 0.14, 0.05, '#c9a0ff', '#9b6fe0');
      [['#ffd23f', 0], ['#5cc8bf', 1], ['#ff8fab', 2], ['#7bd389', 3]].forEach(([c, i]) => { circ(wx + 0.17 + i * 0.19, wy - 0.12, 0.07); fs(c, 0.025); circ(wx + 0.12 + i * 0.19, wy - 0.18, 0.025); fs(c, 0.015); circ(wx + 0.22 + i * 0.19, wy - 0.18, 0.025); fs(c, 0.015); });
      break;
    case 'tv':      // a big SALE screen
      rr(wx + 0.08, wy - 0.25, 0.76, 0.38, 0.04); fs('#2f343a', 0.035);
      rr(wx + 0.13, wy - 0.2, 0.66, 0.28, 0.03); fs(`hsl(${(t * 30) % 360},70%,60%)`, 0); text('SALE', wx + 0.46, wy - 0.06, 0.15, '#fff', 700);
      break;
  }
}
// A store's sign: a plate in its trim color with its icon beside the name. Neon names glow on a dark plate.
export function storeSign(cx, cy, w, def, small = false){
  const lit = def.icon === 'joystick' || def.icon === 'film', h = small ? 0.38 : 0.42, ts = small ? 0.22 : 0.26;
  rr(cx - w / 2, cy - h / 2, w, h, 0.12); fs(lit ? '#2b2340' : small ? def.color : '#fffaf3', 0.05);
  if (!lit && !small){ rr(cx - w / 2 + 0.05, cy - h / 2 + 0.05, w - 0.1, h - 0.1, 0.09); fs(null, 0.025, def.trim === '#fff' ? def.color : def.trim); }
  const narrow = w < 2, ir = narrow ? 0.12 : 0.15, ix = cx - w / 2 + 0.08 + ir;
  circ(ix, cy, ir); fs('#fffaf3', 0.03);
  storeIcon(def.icon, ix, cy, ir * 1.6);
  const tx = (ix + ir + cx + w / 2) / 2, tw = cx + w / 2 - (ix + ir) - 0.12;
  if (lit) neon(def.name, tx, cy + 0.01, ts, def.icon === 'film' ? '#ffd23f' : '#ff5fa2', tw);
  else text(def.name, tx, cy + 0.01, ts, small ? (light(def.color) ? shade(def.color, -0.65) : '#fffaf3') : shade(def.color, -0.3), 700, 'Fredoka', tw);
}
// Doors facing up: the sign stands over the storefront. Drawn after the people (see render.js) so heads never cover it.
export function unitSign(u, def){
  if (u.face !== 'up' || !isOpen(u) || !def) return;
  const yF = u.y - 0.07, top = yF + 0.14 - 0.95;
  storeSign(u.x + u.w / 2, top + 0.15, Math.min(2.6, u.w - 0.1), def, true);
}
// A cash register on a counter top: drawer, keys and a little green screen.
function register(x, y, z, tint){
  box(x, y, 0.34, 0.2, 0.12, '#efe8dc', '#c9bfb0', z, 0.03, 0.03);
  rr(x + 0.04, y + 0.2 - z - 0.12 + 0.03, 0.26, 0.04, 0.01); fs(tint, 0.015);
  const ty = y - z - 0.12;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++){ rr(x + 0.05 + i * 0.07, ty + 0.03 + j * 0.07, 0.05, 0.05, 0.01); fs('#a0a8b0', 0.01); }
  rr(x + 0.24, ty - 0.18, 0.04, 0.12, 0.01); fs('#7a8090', 0.015);
  rr(x + 0.17, ty - 0.3, 0.18, 0.14, 0.03); fs('#3d405b', 0.025); rr(x + 0.2, ty - 0.27, 0.12, 0.08, 0.02); fs('#9be7c4', 0);
}
// A glass case with goods inside, for the counter or the middle of a store.
function glassCase(x, y, w, d, h, z, fill){
  box(x, y, w, d, h, 'rgba(220,245,255,.85)', 'rgba(200,235,250,.8)', z, 0.04, 0.035);
  fill(x + 0.06, y + d - z - 0.07, w - 0.12);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 0.08, y + d - h - z + 0.05, 0.05, h - 0.12);
}
function counter(u, def){
  const sp = storeSpots(u), [cx, cy, cw, cd] = sp.counter, ic = def.icon, H = 0.48;
  box(cx, cy, cw, cd, H, shade(def.color, 0.75), def.color);
  // A trim stripe and the store's icon on the front, so even the counter says what the store is.
  g.fillStyle = def.trim === '#fff' ? shade(def.color, 0.5) : def.trim; g.fillRect(cx + 0.05, cy + cd - H + 0.06, cw - 0.1, 0.05);
  circ(cx + cw / 2, cy + cd - H / 2 + 0.03, 0.12); fs('#fffaf3', 0.025); storeIcon(ic, cx + cw / 2, cy + cd - H / 2 + 0.03, 0.17);
  const top = cy - H;   // top surface runs from top to top + cd
  if (ic === 'cup'){
    // Espresso machine with a wisp of steam, and a stack of cups.
    box(cx + 0.06, cy + 0.02, 0.4, 0.22, 0.3, '#d9dde3', '#a9b0ba', H, 0.04);
    rr(cx + 0.12, cy + 0.24 - H - 0.3 + 0.12, 0.1, 0.06, 0.02); fs('#3d2b35', 0.015); rr(cx + 0.28, cy + 0.24 - H - 0.3 + 0.12, 0.1, 0.06, 0.02); fs('#3d2b35', 0.015);
    for (let i = 0; i < 3; i++) rr(cx + 0.58, top + 0.06 - i * 0.07, 0.12, 0.07, 0.02), fs('#fff', 0.015);
  } else if (ic === 'candy'){
    glassCase(cx + 0.04, cy + 0.04, 0.5, 0.3, 0.22, H, (x, y, w) => { for (let i = 0; i < 5; i++){ circ(x + 0.04 + i * (w - 0.08) / 4, y - 0.04, 0.045); fs(JAR[i + 1], 0.012); } });
    register(cx + 0.57, cy + 0.1, H, def.trim);
  } else if (ic === 'joystick'){
    // Prize counter: tickets and a jar of tokens.
    rr(cx + 0.1, top + 0.08, 0.24, 0.14, 0.03); fs('#ffd23f', 0.02); rr(cx + 0.12, top + 0.05, 0.24, 0.14, 0.03); fs('#ff8fab', 0.02);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'book'){
    for (let i = 0; i < 3; i++){ rr(cx + 0.1, top + 0.2 - i * 0.06, 0.3, 0.06, 0.01); fs(JAR[i + 2], 0.015); }
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'shirt'){
    // Shopping bags waiting to be filled.
    for (const [bx, c] of [[cx + 0.08, '#ffd6e0'], [cx + 0.24, '#5a8dee']]){ rr(bx, top - 0.02, 0.16, 0.2, 0.02); fs(c, 0.02); g.beginPath(); g.arc(bx + 0.08, top - 0.02, 0.04, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.015; g.stroke(); }
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'paw'){
    // A jar of dog biscuits.
    rr(cx + 0.12, top - 0.04, 0.2, 0.24, 0.05); fs('rgba(235,248,255,.9)', 0.02); for (let i = 0; i < 3; i++){ rr(cx + 0.15, top + 0.02 + i * 0.05, 0.14, 0.035, 0.015); fs('#c98b55', 0.01); } rr(cx + 0.11, top - 0.07, 0.22, 0.05, 0.02); fs('#06a77d', 0.015);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'tv'){
    // An open laptop.
    rr(cx + 0.08, top + 0.12, 0.34, 0.12, 0.02); fs('#c9d1d9', 0.02); rr(cx + 0.1, top - 0.1, 0.3, 0.22, 0.02); fs('#2f343a', 0.02); rr(cx + 0.13, top - 0.07, 0.24, 0.16, 0.015); fs('#8ecae6', 0);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'record'){
    rr(cx + 0.08, top + 0.0, 0.26, 0.26, 0.02); fs('#ffd23f', 0.02); circ(cx + 0.21, top + 0.13, 0.08); fs('#2b2d42', 0.015);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'perfume'){
    // Tester bottles on a little mirrored tray.
    rr(cx + 0.06, top + 0.12, 0.4, 0.08, 0.03); fs('#e9f6fb', 0.02);
    ['#e0b0ff', '#ff8fc8', '#ffd23f'].forEach((c2, i) => { rr(cx + 0.1 + i * 0.12, top - 0.02, 0.08, 0.14, 0.03); fs(c2, 0.015); rr(cx + 0.12 + i * 0.12, top - 0.06, 0.04, 0.05, 0.01); fs('#c9a227', 0.012); });
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (['chip', 'cocktail', 'clover'].includes(ic)){
    A3.casinoCounter(ic, cx, top);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (['leaf', 'ring', 'vr', 'cupcake', 'comic'].includes(ic)){
    A2.newCounter(ic, cx, top);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (A4.ICONS.includes(ic)){
    A4.counter(ic, cx, top, performance.now() / 1000);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'pizza'){
    A2.pizzaCounter(cx, top);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'burger'){
    // A tray with a burger, fries and a drink waiting for pickup.
    rr(cx + 0.05, top + 0.04, 0.46, 0.22, 0.03); fs('#d62828', 0.02);
    g.save(); g.translate(cx + 0.16, top + 0.12); g.scale(0.11, 0.11); storeIcon('burger', 0, 0, 1); g.restore();
    rr(cx + 0.28, top + 0.02, 0.08, 0.12, 0.015); fs('#fcbf49', 0.015); for (let i = 0; i < 3; i++){ rr(cx + 0.29 + i * 0.02, top - 0.03, 0.015, 0.06, 0.005); fs('#ffd23f', 0); }
    rr(cx + 0.4, top - 0.02, 0.08, 0.15, 0.02); fs('#fff', 0.015); g.fillStyle = '#d62828'; g.fillRect(cx + 0.4, top + 0.03, 0.08, 0.03);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'shoe'){
    box(cx + 0.08, cy + 0.06, 0.38, 0.22, 0.14, '#ffe8d6', '#e76f51', H, 0.02); rr(cx + 0.08, cy + 0.06 - H - 0.14 + 0.08, 0.38, 0.03, 0.01); fs('#fff', 0);
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else if (ic === 'controller'){
    g.save(); g.translate(cx + 0.25, top + 0.1); g.scale(0.16, 0.16); storeIcon('controller', 0, 0, 1); g.restore();
    register(cx + 0.55, cy + 0.1, H, def.trim);
  } else register(cx + 0.55, cy + 0.1, H, def.trim);
}
// Store furniture split across sort layers: 'back' items sit along the back wall, 'mid' items stand in the room.
export function storeFurniture(u, def, t, layer){
  const W = u.w, H = u.h, ic = def.icon;
  if (ic === 'wc') return restroomFurniture(u, layer);
  if (def.attraction){ if (layer === 'back') attractionBack(u, def, t); return; }
  const sw = Math.max(0.6, W - 1.25);
  if (layer === 'counter'){ counter(u, def); return; }
  if (layer === 'back'){
    const [x, y] = local(u, 0.1, 0.08, sw, 0.4);
    if (ic === 'joystick'){
      // Arcade cabinets: marquee, glowing screen, joystick and buttons.
      for (let i = 0; i < Math.floor(sw / 0.75); i++){
        const cx = x + i * 0.78, hue = ['#5a8dee', '#ef476f', '#06d6a0'][i % 3], top = y + 0.42 - 0.9;
        box(cx, y, 0.68, 0.42, 0.9, shade(hue, -0.3), hue);
        rr(cx + 0.06, top + 0.04, 0.56, 0.12, 0.03); fs(shade(hue, 0.5), 0.025);
        rr(cx + 0.09, top + 0.2, 0.5, 0.32, 0.04); fs(`hsl(${(t * 50 + i * 120 + u.id * 40) % 360},85%,62%)`, 0.035);
        rr(cx + 0.06, top + 0.58, 0.56, 0.12, 0.03); fs(shade(hue, -0.15), 0.025);
        rr(cx + 0.2, top + 0.5, 0.03, 0.1, 0.01); fs('#3d2b35', 0); circ(cx + 0.215, top + 0.5, 0.035); fs('#ef476f', 0.015);
        circ(cx + 0.4, top + 0.63, 0.025); fs('#ffd23f', 0.01); circ(cx + 0.48, top + 0.63, 0.025); fs('#3ee0d0', 0.01);
      }
    } else if (ic === 'candy'){
      // Gravity bins: clear tubes of candy in every color.
      box(x, y, sw, 0.4, 0.82, '#ffd1df', '#ff9fbb');
      const n = Math.max(2, Math.floor(sw / 0.18)), top = y + 0.4 - 0.82;
      for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++){
        const bx = x + 0.05 + i * (sw - 0.1) / n, bw = (sw - 0.1) / n - 0.03, by = top + 0.08 + r * 0.36;
        rr(bx, by, bw, 0.3, 0.03); fs('rgba(240,250,255,.95)', 0.02);
        const c = JAR[(i + r * 2 + u.id) % JAR.length];
        rr(bx + 0.015, by + 0.1, bw - 0.03, 0.18, 0.02); fs(c, 0);
        for (let k = 0; k < 3; k++){ circ(bx + bw * (0.25 + k * 0.25), by + 0.13, 0.018); fs('rgba(255,255,255,.6)', 0); }
      }
    } else if (ic === 'book'){
      // A tall bookcase, every shelf full.
      shelf(x, y, sw, 0.4, 1.0, 'books', u.id);
    } else if (ic === 'paw'){
      // Fish tanks with bubbles drifting up.
      box(x, y, sw, 0.4, 0.3, '#c9a27e', '#a47148');
      const n = Math.max(1, Math.floor(sw / 0.55)), top = y + 0.4 - 0.3;
      for (let i = 0; i < n; i++){
        const tx = x + 0.04 + i * (sw - 0.08) / n, tw = (sw - 0.08) / n - 0.05, th = 0.48;
        rr(tx, top - th, tw, th, 0.03); fs('rgba(110,195,235,.9)', 0.03);
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(tx + 0.03, top - th + 0.04, tw - 0.06, 0.06);
        rr(tx + 0.02, top - 0.08, tw - 0.04, 0.06, 0.02); fs('#e9c46a', 0);
        g.strokeStyle = '#3f9a52'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(tx + tw * 0.8, top - 0.05); g.quadraticCurveTo(tx + tw * 0.9, top - 0.2, tx + tw * 0.78, top - 0.32); g.stroke();
        const f = (t * 0.3 + i * 0.4) % 1, fx = tx + 0.08 + Math.abs(f * 2 - 1) * (tw - 0.2);
        ell(fx, top - 0.26 - i % 2 * 0.08, 0.06, 0.035); fs(i % 2 ? '#ffd23f' : '#ff9f43', 0.015);
        for (let b = 0; b < 3; b++){ const by = top - 0.1 - ((t * 0.5 + b * 0.33 + i * 0.2) % 1) * (th - 0.14); circ(tx + tw * 0.3 + b * 0.02, by, 0.018); fs('rgba(255,255,255,.75)', 0); }
      }
    } else if (ic === 'shirt'){
      // A clothes rail of shirts on hangers.
      box(x, y, sw, 0.36, 0.1, '#d8d0e0', '#b0a6bd');
      const top = y + 0.36 - 0.85;
      rr(x + 0.02, top, 0.05, 0.75, 0.02); fs('#8a7a8a', 0.02); rr(x + sw - 0.07, top, 0.05, 0.75, 0.02); fs('#8a7a8a', 0.02);
      g.strokeStyle = '#8a7a8a'; g.lineWidth = 0.04; g.beginPath(); g.moveTo(x + 0.04, top + 0.06); g.lineTo(x + sw - 0.04, top + 0.06); g.stroke();
      const n = Math.max(2, Math.floor(sw / 0.2));
      for (let i = 0; i < n; i++){
        const cx = x + 0.15 + i * (sw - 0.3) / Math.max(1, n - 1), c = ['#ff8fab', '#5a8dee', '#ffd23f', '#06a77d', '#9b5de5'][(i + u.id) % 5];
        g.beginPath(); g.arc(cx, top + 0.08, 0.03, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.015; g.stroke();
        g.beginPath(); g.moveTo(cx - 0.05, top + 0.1); g.lineTo(cx - 0.12, top + 0.16); g.lineTo(cx - 0.09, top + 0.24); g.lineTo(cx - 0.07, top + 0.22); g.lineTo(cx - 0.07, top + 0.5); g.lineTo(cx + 0.07, top + 0.5); g.lineTo(cx + 0.07, top + 0.22); g.lineTo(cx + 0.09, top + 0.24); g.lineTo(cx + 0.12, top + 0.16); g.lineTo(cx + 0.05, top + 0.1); g.closePath(); fs(c, 0.018);
      }
    } else if (ic === 'record'){
      // Record crates, and posters above them where there's room on the wall.
      box(x, y, sw, 0.4, 0.55, '#3d405b', '#2b2d42');
      const R = mulberry(u.id * 7);
      for (let px = x + 0.08; px < x + sw - 0.2; px += 0.2){ rr(px, y + 0.4 - 0.55 - 0.24, 0.17, 0.26, 0.02); fs(JAR[Math.floor(R() * JAR.length)], 0.02); circ(px + 0.085, y + 0.4 - 0.55 - 0.12, 0.05); fs('#2b2d42', 0); }
      if (u.face !== 'down'){ rr(x + 0.1, y - 1.05, 0.38, 0.42, 0.03); fs('#ffd23f', 0.03); circ(x + 0.29, y - 0.84, 0.12); fs('#2b2d42', 0.02); }
      if (sw > 0.9 && u.face !== 'down'){ rr(x + 0.6, y - 1.0, 0.34, 0.36, 0.03); fs('#ef476f', 0.03); text('♪', x + 0.77, y - 0.82, 0.26, '#fff', 700); }
    } else if (ic === 'tv'){
      // A wall of TVs, all showing the same flickering channel.
      const n = Math.max(1, Math.floor(sw / 0.62));
      for (let i = 0; i < n; i++) for (let row = 0; row < 2; row++){
        const cx = x + 0.04 + i * (sw - 0.08) / n, bw = (sw - 0.08) / n - 0.06, by = y + 0.4 - row * 0.38;
        box(cx, by - 0.4, bw, 0.4, 0.36, '#4a5058', '#2f343a');
        rr(cx + 0.06, by - 0.33, bw - 0.12, 0.26, 0.05); fs(`hsl(${(t * 40 + i * 30 + row * 60) % 360},70%,${62 + Math.sin(t * 9 + i) * 6}%)`, 0.025);
      }
    } else if (ic === 'cup'){
      // Pastry case along the back: croissants and muffins.
      glassCase(x, y, sw, 0.36, 0.6, 0, (gx, gy, gw) => {
        for (let i = 0; i < Math.floor(gw / 0.18); i++){ const px = gx + 0.08 + i * 0.18; if (i % 2){ rr(px - 0.06, gy - 0.1, 0.12, 0.08, 0.03); fs('#c98b55', 0.015); circ(px, gy - 0.12, 0.05); fs('#8a5a44', 0.015); } else { ell(px, gy - 0.06, 0.07, 0.04); fs('#e0a96d', 0.015); } }
        for (let i = 0; i < Math.floor(gw / 0.2); i++){ circ(gx + 0.1 + i * 0.2, gy - 0.32, 0.055); fs(i % 2 ? '#ff8fab' : '#f2e3cf', 0.015); }
      });
    } else if (ic === 'dollar'){
      // Shelves of everything, with yellow price tags.
      shelf(x, y, sw, 0.4, 0.75, 'goods', u.id);
      const top = y + 0.4 - 0.75;
      for (let i = 0; i < Math.floor(sw / 0.4); i++){ rr(x + 0.12 + i * 0.4, top + 0.3, 0.14, 0.06, 0.01); fs('#ffd23f', 0.012); }
    } else if (ic === 'toy'){
      // Toy shelves: teddies, blocks, rockets and a toy train.
      box(x, y, sw, 0.4, 0.85, '#ffe08a', '#ffb703');
      const top = y + 0.4 - 0.85;
      for (let r = 0; r < 2; r++){
        g.fillStyle = 'rgba(61,43,53,.25)'; g.fillRect(x + 0.05, top + 0.42 + r * 0.36, sw - 0.1, 0.02);
        for (let i = 0; i < Math.floor(sw / 0.26); i++){
          const px = x + 0.16 + i * 0.26, py = top + 0.38 + r * 0.36, k = (i + r * 3 + u.id) % 4;
          if (k === 0){ circ(px, py - 0.1, 0.08); fs('#c98b55', 0.018); circ(px - 0.06, py - 0.17, 0.03); fs('#c98b55', 0.012); circ(px + 0.06, py - 0.17, 0.03); fs('#c98b55', 0.012); }
          else if (k === 1){ for (let b = 0; b < 3; b++){ rr(px - 0.08 + (b % 2) * 0.08, py - 0.08 - Math.floor(b / 2) * 0.08, 0.08, 0.08, 0.01); fs(JAR[b + 1], 0.012); } }
          else if (k === 2){ g.beginPath(); g.moveTo(px, py - 0.24); g.lineTo(px + 0.05, py - 0.12); g.lineTo(px + 0.05, py - 0.02); g.lineTo(px - 0.05, py - 0.02); g.lineTo(px - 0.05, py - 0.12); g.closePath(); fs('#f8f9fa', 0.015); circ(px, py - 0.12, 0.02); fs('#4cc9f0', 0); }
          else { rr(px - 0.1, py - 0.1, 0.2, 0.09, 0.02); fs('#ef476f', 0.015); circ(px - 0.05, py - 0.01, 0.025); fs(OUT, 0); circ(px + 0.05, py - 0.01, 0.025); fs(OUT, 0); }
        }
      }
    } else if (ic === 'perfume'){
      // Glass shelves of bottles, lit from behind.
      box(x, y, sw, 0.36, 0.8, '#f3e1ff', '#d4b0f0');
      const top = y + 0.36 - 0.8;
      g.save(); g.globalAlpha = 0.5; rr(x + 0.04, top + 0.06, sw - 0.08, 0.66, 0.04); g.fillStyle = '#fffaf0'; g.fill(); g.restore();
      for (let r = 0; r < 2; r++){
        g.fillStyle = 'rgba(160,190,210,.7)'; g.fillRect(x + 0.04, top + 0.36 + r * 0.3, sw - 0.08, 0.025);
        for (let i = 0; i < Math.floor(sw / 0.17); i++){ const bx = x + 0.08 + i * 0.17, c2 = ['#e0b0ff', '#ff8fc8', '#ffd23f', '#7ed6c8', '#c77dff'][(i + r) % 5]; rr(bx, top + 0.22 + r * 0.3, 0.1, 0.14, 0.04); fs(c2, 0.015); rr(bx + 0.03, top + 0.17 + r * 0.3, 0.04, 0.05, 0.01); fs('#c9a227', 0.012); }
      }
    } else if (ic === 'controller'){
      // A wall of game cases and a demo TV with a console under it.
      box(x, y, sw, 0.36, 0.85, '#2c2158', '#1c1240');
      const top = y + 0.36 - 0.85;
      for (let r = 0; r < 3; r++) for (let i = 0; i < Math.floor(sw / 0.12); i++){ rr(x + 0.06 + i * 0.12, top + 0.1 + r * 0.22, 0.09, 0.16, 0.01); fs(['#4cc9f0', '#ef476f', '#ffd23f', '#7bd389', '#9b5de5'][(i * 2 + r + u.id) % 5], 0.012); }
    } else if (ic === 'shoe'){
      // Angled shelves of shoes in every color.
      box(x, y, sw, 0.36, 0.85, '#f2d5bf', '#d9a98a');
      const top = y + 0.36 - 0.85;
      for (let r = 0; r < 3; r++){ g.fillStyle = '#b07a5a'; g.fillRect(x + 0.05, top + 0.26 + r * 0.22, sw - 0.1, 0.03); for (let i = 0; i < Math.floor(sw / 0.24); i++){ g.save(); g.translate(x + 0.17 + i * 0.24, top + 0.18 + r * 0.22); g.scale(0.13, 0.13); storeIcon('shoe', 0, 0, 1, JAR[(i + r * 3 + u.id) % JAR.length]); g.restore(); } }
    } else if (['chip', 'cocktail', 'clover'].includes(ic)){
      A3.casinoBack(ic, x, y, sw, t);
    } else if (['leaf', 'ring', 'vr', 'cupcake', 'comic'].includes(ic)){
      A2.newBack(ic, x, y, sw, t, u.id);
    } else if (A4.ICONS.includes(ic)){
      A4.back(ic, x, y, sw, t, u.id);
    } else if (ic === 'pizza'){
      A2.pizzaOven(x, y, sw, t);
    } else if (ic === 'burger'){
      // The kitchen: a grill under a steel hood, a fryer, and a drink machine.
      box(x, y, sw, 0.4, 0.48, '#c9d1d9', '#a9b0ba');
      const top = y + 0.4 - 0.48;
      rr(x + 0.06, top + 0.06, sw * 0.5, 0.26, 0.03); fs('#3d405b', 0.02);
      for (let i = 0; i < 3; i++){ ell(x + 0.18 + i * 0.22, top + 0.19, 0.08, 0.05); fs('#8a4b2e', 0.015); }
      g.save(); g.globalAlpha = 0.5; for (let i = 0; i < 2; i++){ const sy = top - 0.1 - ((t * 0.6 + i * 0.5) % 1) * 0.3; circ(x + 0.25 + i * 0.2, sy, 0.06); g.fillStyle = '#ffffff'; g.fill(); } g.restore();
      rr(x + 0.02, top - 0.62, sw * 0.6, 0.18, 0.03); fs('#dfe4ea', 0.03);
      rr(x + sw * 0.62, top + 0.04, 0.3, 0.3, 0.03); fs('#fcbf49', 0.02); for (let i = 0; i < 4; i++){ rr(x + sw * 0.62 + 0.05 + i * 0.05, top - 0.04, 0.03, 0.1, 0.01); fs('#ffd23f', 0); }
      if (sw > 1.3){ box(x + sw - 0.38, y + 0.05, 0.34, 0.3, 0.7, '#e9e1d4', '#d62828'); for (let i = 0; i < 3; i++){ rr(x + sw - 0.34 + i * 0.1, y + 0.35 - 0.7 + 0.12, 0.07, 0.12, 0.02); fs(['#2b2d42', '#ef476f', '#ffd23f'][i], 0.012); } }
    } else shelf(x, y, sw, 0.4, 0.7, 'goods', u.id);
    return;
  }
  // Mid-room pieces
  if (layer === 'teeTable'){
    // Threads' table of folded tees, sorted on its own so shoppers walk in front of and behind it properly.
    if (ic !== 'shirt' || H < 3) return;
    const [tx, ty] = local(u, 0.95, 1.25, 0.7, 0.35);
    if (W >= 2){ box(tx, ty, 0.62, 0.35, 0.32, '#e9dcc8', '#c9b79c'); for (let i = 0; i < 3; i++){ rr(tx + 0.05 + i * 0.19, ty - 0.32 + 0.06, 0.16, 0.1, 0.02); fs(['#5a8dee', '#ffd23f', '#ff8fab'][i], 0.015); rr(tx + 0.05 + i * 0.19, ty - 0.32 + 0.0, 0.16, 0.08, 0.02); fs(['#9bbcf5', '#ffe68a', '#ffc2d4'][i], 0.015); } }
      return;
  }
  if (A4.mid(ic, u, W, H, t)) return;
  if (ic === 'vr'){
    // Glowing play pads where folks try the headsets.
    for (const [lx, ly] of [[0.7, 1.55], [1.75, 1.95]]){
      if (lx > W - 0.5 || ly > H - 0.5) continue;
      const [px, py] = local(u, lx, ly);
      ell(px, py, 0.42, 0.2); fs('#3a0ca3', 0.03);
      ell(px, py, 0.32, 0.14); g.strokeStyle = `hsla(${(t * 90 + lx * 100) % 360},95%,65%,.9)`; g.lineWidth = 0.04; g.stroke();
    }
    return;
  }
  if (ic === 'dollar' && H >= 3){
    const bw = Math.max(0.6, W - 1.6), [x, y] = local(u, 0.3, 1.9, bw, 0.36); shelf(x, y, bw, 0.36, 0.5, 'goods', u.id + 5);
    // A wire bargain bin.
    const [bx, by] = local(u, 0.25, 1.15, 0.5, 0.4);
    box(bx, by, 0.5, 0.4, 0.3, '#d9d9d9', '#bdbdbd'); goods(bx + 0.02, by + 0.4 - 0.3 + 0.04 - 0.04, 0.5, 1, u.id + 9);
    g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.015; g.beginPath(); for (let i = 1; i < 5; i++){ g.moveTo(bx + i * 0.1, by + 0.1); g.lineTo(bx + i * 0.1, by + 0.4); } g.stroke();
    rr(bx + 0.12, by - 0.32, 0.26, 0.14, 0.03); fs('#ef476f', 0.02); text('SALE', bx + 0.25, by - 0.25, 0.08, '#fff', 700);
  }
  if (ic === 'candy'){
    // A round pick'n'mix barrel with a scoop.
    const [x, y] = local(u, 0.42, 1.45);
    cylinder(x, y, 0.2, 0.32, '#c98b55', '#e9c46a');
    circ(x, y - 0.32, 0.17); fs('#fff3f6', 0);
    for (let i = 0; i < 9; i++){ const a = i * 2.4, r = 0.04 + (i % 3) * 0.04; circ(x + Math.cos(a) * r, y - 0.32 + Math.sin(a) * r * 0.6, 0.035); fs(JAR[i % JAR.length], 0.01); }
    g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(x + 0.06, y - 0.34); g.lineTo(x + 0.2, y - 0.46); g.stroke();
    g.fillStyle = 'rgba(61,43,53,.25)'; g.fillRect(x - 0.2, y - 0.17, 0.4, 0.03);
  }
  if (ic === 'joystick' && H >= 3){ const [x, y] = local(u, 0.25, 1.8, 0.7, 0.55); box(x, y, 0.7, 0.55, 1.0, '#ffd23f', '#ffb703'); rr(x + 0.07, y + 0.55 - 0.92, 0.56, 0.45, 0.04); fs('rgba(210,240,255,.9)', 0.03); circ(x + 0.22, y + 0.05, 0.07); fs('#ff8fab', 0.02); circ(x + 0.45, y + 0.08, 0.07); fs('#7bd389', 0.02); }
  if (ic === 'shirt' && H >= 3){
    // A mannequin in a dress, and a table of folded tees.
    const [x, y] = local(u, 0.35, 2.0); shadow(x, y, 0.18, 0.06);
    rr(x - 0.03, y - 0.3, 0.06, 0.3, 0.02); fs('#a89a8a', 0.025); rr(x - 0.12, y - 0.04, 0.24, 0.05, 0.02); fs('#a89a8a', 0.02);
    g.beginPath(); g.moveTo(x - 0.12, y - 0.82); g.lineTo(x + 0.12, y - 0.82); g.lineTo(x + 0.2, y - 0.3); g.lineTo(x - 0.2, y - 0.3); g.closePath(); fs('#ff8fab', 0.03);
    rr(x - 0.13, y - 0.86, 0.26, 0.1, 0.04); fs('#e8577e', 0.02); circ(x, y - 0.98, 0.13); fs('#efe4d6', 0.03);
  }
  if (ic === 'paw' && H >= 3){ const [x, y] = local(u, 0.25, 1.55, 1.1, 0.9); rr(x, y, 1.1, 0.9, 0.06); fs('rgba(255,248,220,.9)', 0.035); g.strokeStyle = '#b08968'; g.lineWidth = 0.04; g.beginPath(); for (let i = 0; i <= 5; i++){ g.moveTo(x + i * 0.22, y + 0.9); g.lineTo(x + i * 0.22, y + 0.9 - 0.3); } g.moveTo(x, y + 0.6); g.lineTo(x + 1.1, y + 0.6); g.stroke(); puppy(x + 0.55, y + 0.55, t); ell(x + 0.25, y + 0.3, 0.1, 0.04); fs('#ef476f', 0.015); }
  if (ic === 'cup'){
    // A little café table with two stools and a latte.
    const [x, y] = local(u, 0.45, 1.5); shadow(x, y + 0.02, 0.22, 0.07);
    for (const sx of [-0.3, 0.3]){ cylinder(x + sx, y + 0.05, 0.09, 0.22, '#6b4a3a', '#c98b55'); }
    rr(x - 0.03, y - 0.38, 0.06, 0.38, 0.02); fs('#6b4a3a', 0.025); ell(x, y - 0.42, 0.22, 0.12); fs('#f2e3cf');
    rr(x - 0.05, y - 0.55, 0.1, 0.1, 0.02); fs('#fff', 0.02); ell(x, y - 0.55, 0.05, 0.02); fs('#c98b55', 0);
  }
  if (ic === 'record' && H >= 3){
    // Listening station: a turntable and headphones.
    const [x, y] = local(u, 0.3, 2.0, 0.6, 0.4); box(x, y, 0.6, 0.4, 0.45, '#ffd23f', '#e0b52f');
    circ(x + 0.3, y - 0.26, 0.15); fs('#2b2d42', 0.03); circ(x + 0.3, y - 0.26, 0.04); fs('#ef476f', 0);
    g.save(); g.translate(x + 0.3, y - 0.26); g.rotate(t * 3); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 0.015; g.beginPath(); g.arc(0, 0, 0.1, 0, 1.2); g.stroke(); g.restore();
    g.beginPath(); g.arc(x + 0.52, y - 0.12, 0.08, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); circ(x + 0.44, y - 0.1, 0.035); fs('#ef476f', 0.015); circ(x + 0.6, y - 0.1, 0.035); fs('#ef476f', 0.015);
  }
  if (ic === 'tv' && H >= 3){ const [x, y] = local(u, 0.3, 1.9, 1.2, 0.5); box(x, y, 1.2, 0.5, 0.45, '#e9e1d4', '#c9bfb0'); for (const [px, c] of [[0.12, '#2f343a'], [0.5, '#2f343a'], [0.86, '#2f343a']]){ rr(x + px, y - 0.38, 0.2, 0.22, 0.03); fs(c, 0.025); rr(x + px + 0.03, y - 0.35, 0.14, 0.16, 0.02); fs(`hsl(${(t * 60 + px * 300) % 360},70%,65%)`, 0); } }
  if (ic === 'toy' && H >= 3){
    // A giant teddy bear, and a toy train going round a little table.
    const [bx, by] = local(u, 0.4, 2.1); shadow(bx, by, 0.3, 0.09);
    circ(bx, by - 0.25, 0.27); fs('#c98b55', 0.035); ell(bx, by - 0.2, 0.15, 0.12); fs('#f6dcc0', 0.02);
    circ(bx, by - 0.62, 0.2); fs('#c98b55', 0.035); circ(bx - 0.15, by - 0.78, 0.07); fs('#c98b55', 0.025); circ(bx + 0.15, by - 0.78, 0.07); fs('#c98b55', 0.025);
    circ(bx - 0.07, by - 0.65, 0.025); fs(OUT, 0); circ(bx + 0.07, by - 0.65, 0.025); fs(OUT, 0); ell(bx, by - 0.56, 0.06, 0.04); fs('#f6dcc0', 0.015); circ(bx, by - 0.57, 0.02); fs(OUT, 0);
    g.beginPath(); g.moveTo(bx - 0.1, by - 0.45); g.lineTo(bx + 0.1, by - 0.45); g.lineTo(bx, by - 0.38); g.closePath(); fs('#ef476f', 0.015);
    const [tx, ty] = local(u, 1.0, 1.35, 0.8, 0.5); box(tx, ty, 0.8, 0.5, 0.3, '#7bd389', '#4fa85e');
    const k = (t * 0.25) % 1, ax = tx + 0.12 + Math.abs(k * 2 - 1) * 0.5;
    rr(ax, ty - 0.22, 0.14, 0.08, 0.02); fs('#ef476f', 0.015); rr(ax - 0.12, ty - 0.21, 0.1, 0.07, 0.02); fs('#5a8dee', 0.015);
  }
  if (ic === 'perfume'){
    // A round display table with a pyramid of gift boxes.
    const [x, y] = local(u, 0.45, 1.45); cylinder(x, y, 0.24, 0.32, '#e0c3f0', '#f6e6ff');
    for (const [dx, dy, c2] of [[-0.09, 0, '#c77dff'], [0.09, 0, '#ff8fc8'], [0, -0.1, '#ffd23f']]){ rr(x + dx - 0.07, y - 0.32 - 0.1 + dy, 0.14, 0.1, 0.02); fs(c2, 0.015); g.fillStyle = '#fff'; g.fillRect(x + dx - 0.01, y - 0.32 - 0.1 + dy, 0.02, 0.1); }
  }
  if (ic === 'controller' && H >= 3){
    // A demo station: TV on a stand, console and a controller on a cord.
    const [x, y] = local(u, 0.3, 2.0, 0.8, 0.4); box(x, y, 0.8, 0.4, 0.4, '#2c2158', '#1c1240');
    rr(x + 0.08, y - 0.84, 0.64, 0.42, 0.03); fs('#2f343a', 0.03); rr(x + 0.12, y - 0.8, 0.56, 0.34, 0.02); fs(`hsl(${(t * 60) % 360},75%,60%)`, 0);
    circ(x + 0.3 + Math.sin(t * 3) * 0.12, y - 0.66, 0.04); fs('#fff', 0);
    rr(x + 0.25, y - 0.42, 0.3, 0.06, 0.02); fs('#4cc9f0', 0.015);
  }
  if (ic === 'shoe' && H >= 3){
    // A try-on bench with a foot measurer and a stack of shoeboxes.
    const [x, y] = local(u, 0.3, 2.05, 0.9, 0.3); box(x, y, 0.9, 0.3, 0.26, '#e76f51', '#c4553a');
    rr(x + 0.3, y + 0.34, 0.22, 0.12, 0.02); fs('#a0a8b0', 0.015);
    for (let i = 0; i < 3; i++) box(x + 0.98, y + 0.02 - i * 0.0, 0.3, 0.24, 0.12, '#ffe8d6', '#e76f51', i * 0.12, 0.02, 0.025);
  }
  if (ic === 'book' && H >= 3){
    // A NEW ARRIVALS table with stacks of books.
    const [x, y] = local(u, 0.25, 2.0, 0.8, 0.4); box(x, y, 0.8, 0.4, 0.34, '#c9a27e', '#a47148');
    for (let s = 0; s < 3; s++) for (let k = 0; k < 2 + s % 2; k++){ rr(x + 0.07 + s * 0.24, y + 0.4 - 0.34 - 0.18 - k * 0.06, 0.18, 0.06, 0.01); fs(JAR[(s * 3 + k) % JAR.length], 0.012); }
    g.strokeStyle = '#7a5a44'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(x + 0.63, y - 0.3); g.lineTo(x + 0.63, y - 0.48); g.stroke();
    rr(x + 0.5, y - 0.62, 0.26, 0.16, 0.02); fs('#fffaf3', 0.02); text('NEW', x + 0.63, y - 0.54, 0.08, '#e07a5f', 700);
  }
}

// Dine-in: two tables with a stool either side, on the left of the store (the counter's on the right). Noodle Nook
// has just one little lacquered table for two, tucked by its kitchen.
const NOODLE_SEAT = 0.25;
export function dineSpots(u){
  const at = (lx, ly) => { const [x, y] = local(u, lx, ly); return { x, y }; };
  const noodle = u.store === 'noodle', off = noodle ? NOODLE_SEAT : 0.42;
  const tables = noodle ? [at(0.55, 1.5)] : [at(0.75, 1.55), at(0.75, 2.45)].slice(0, u.h >= 3 ? 2 : 1);
  const seats = [];
  for (const tb of tables){ seats.push({ x: tb.x - off, y: tb.y + 0.08, flip: false }); seats.push({ x: tb.x + off, y: tb.y + 0.08, flip: true }); }
  return { tables, seats };
}
// Stools and table are drawn as separate layers so someone sitting on a stool sits on it, beside the table.
// plates: what each of the table's two diners is eating (left seat, right seat), set out in front of them.
export function dineTable(u, i, part, plates){
  const tb = dineSpots(u).tables[i];
  if (u.store === 'noodle'){
    if (part === 'stools'){ for (const sx of [-NOODLE_SEAT, NOODLE_SEAT]){ shadow(tb.x + sx, tb.y + 0.08, 0.12, 0.045); cylinder(tb.x + sx, tb.y + 0.05, 0.08, 0.2, '#5a3a2e', '#e63946'); } return; }
    shadow(tb.x, tb.y + 0.02, 0.2, 0.06);
    rr(tb.x - 0.03, tb.y - 0.36, 0.06, 0.36, 0.02); fs('#3d2b35', 0.02); rr(tb.x - 0.2, tb.y - 0.42, 0.4, 0.1, 0.04); fs('#8a5a44', 0.025);
    // A soy sauce bottle and a cup of chopsticks in the middle.
    rr(tb.x - 0.025, tb.y - 0.52, 0.05, 0.1, 0.015); fs('#3d2b35', 0.012); rr(tb.x - 0.012, tb.y - 0.56, 0.024, 0.04, 0.008); fs('#e63946', 0.008);
    tablePlates(plates, tb.x, tb.y - 0.4, 0.11);
    return;
  }
  if (part === 'stools'){ for (const sx of [-0.42, 0.42]){ shadow(tb.x + sx, tb.y + 0.08, 0.14, 0.05); cylinder(tb.x + sx, tb.y + 0.06, 0.11, 0.2, '#d62828', '#ef476f'); } return; }
  shadow(tb.x, tb.y + 0.06, 0.28, 0.08);
  rr(tb.x - 0.03, tb.y - 0.36, 0.06, 0.38, 0.02); fs('#7a8090', 0.025);
  ell(tb.x, tb.y - 0.38, 0.3, 0.14); fs('#fff6e0', 0.04); ell(tb.x, tb.y - 0.4, 0.26, 0.11); fs(null, 0.015, 'rgba(214,40,40,.5)');
  rr(tb.x - 0.04, tb.y - 0.5, 0.05, 0.1, 0.01); fs('#ef476f', 0.012); rr(tb.x + 0.02, tb.y - 0.49, 0.05, 0.09, 0.01); fs('#fcbf49', 0.012);
  tablePlates(plates, tb.x, tb.y - 0.4, 0.18);
}
// Each diner's food on the table in front of them: a steaming bowl of noodles, a slate of sushi, or (for things
// eaten out of the hand) a paper boat and a soda. dx is how far out from the table's middle each plate sits.
const DRINKS = new Set(['coffee', 'boba', 'lemonade', 'can', 'cocktail']);
export function tablePlates(plates, cx, ty, dx){
  if (!plates) return;
  plates.forEach((food, side) => { if (food) tablePlate(food, cx + (side ? dx : -dx), ty, side ? -1 : 1); });
}
export function tablePlate(food, x, y, dir){
  const t = performance.now() / 1000;
  if (food === 'noodles'){
    ell(x, y + 0.01, 0.1, 0.035); g.fillStyle = 'rgba(61,43,53,.18)'; g.fill();
    g.beginPath(); g.moveTo(x - 0.1, y - 0.06); g.quadraticCurveTo(x - 0.09, y + 0.02, x, y + 0.02); g.quadraticCurveTo(x + 0.09, y + 0.02, x + 0.1, y - 0.06); g.closePath(); fs('#c1121f', 0.02);
    g.fillStyle = '#fff6ea'; g.fillRect(x - 0.085, y - 0.035, 0.17, 0.018);
    ell(x, y - 0.06, 0.1, 0.03); fs('#f4d58d', 0.018);
    g.strokeStyle = '#e9c46a'; g.lineWidth = 0.008; g.beginPath(); for (let k = 0; k < 3; k++){ g.moveTo(x - 0.07 + k * 0.03, y - 0.065); g.quadraticCurveTo(x - 0.05 + k * 0.03, y - 0.045, x - 0.02 + k * 0.03, y - 0.07); } g.stroke();
    circ(x + 0.04, y - 0.065, 0.018); fs('#fff1d6', 0.008); circ(x + 0.04, y - 0.065, 0.008); fs('#ffb703', 0);   // half an egg
    rr(x - 0.06, y - 0.075, 0.03, 0.02, 0.005); fs('#7bd389', 0);                                                  // scallions
    // Steam curling up.
    g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 0.012; g.lineCap = 'round';
    for (let k = 0; k < 2; k++){ const ph = (t * 0.6 + k * 0.5) % 1, sx = x - 0.02 + k * 0.05; g.globalAlpha = 1 - ph; g.beginPath(); g.moveTo(sx, y - 0.09 - ph * 0.12); g.quadraticCurveTo(sx + 0.03, y - 0.13 - ph * 0.12, sx, y - 0.17 - ph * 0.12); g.stroke(); }
    g.globalAlpha = 1;
    return;
  }
  if (food === 'sushi'){
    rr(x - 0.11, y - 0.05, 0.22, 0.06, 0.015); fs('#2b2d42', 0.015);
    for (let k = 0; k < 3; k++){ circ(x - 0.07 + k * 0.05, y - 0.05, 0.02); fs('#1b2d2a', 0.008); circ(x - 0.07 + k * 0.05, y - 0.05, 0.011); fs('#fffaf3', 0); circ(x - 0.07 + k * 0.05, y - 0.05, 0.005); fs('#ff8c69', 0); }
    ell(x + 0.08 * dir, y + 0.03, 0.03, 0.012); fs('#fffaf3', 0.008); ell(x + 0.08 * dir, y + 0.03, 0.018, 0.007); fs('#6b3e26', 0);
    return;
  }
  // A napkin, and a paper boat (or, with a drink, just the napkin) plus a soda with a straw.
  rr(x - 0.06, y - 0.02, 0.12, 0.04, 0.008); fs('#fffaf3', 0.008);
  if (!DRINKS.has(food)){
    g.beginPath(); g.moveTo(x - 0.08, y - 0.05); g.lineTo(x + 0.06, y - 0.05); g.lineTo(x + 0.05, y - 0.01); g.lineTo(x - 0.07, y - 0.01); g.closePath(); fs('#fffaf3', 0.012);
    for (let k = 0; k < 4; k++){ g.fillStyle = '#e63946'; g.fillRect(x - 0.07 + k * 0.03, y - 0.045, 0.012, 0.03); }
    const cx = x - 0.09 * dir;
    rr(cx - 0.025, y - 0.12, 0.05, 0.11, 0.01); fs('#ef476f', 0.012); g.fillStyle = '#fffaf3'; g.fillRect(cx - 0.025, y - 0.085, 0.05, 0.02);
    g.strokeStyle = '#fffaf3'; g.lineWidth = 0.01; g.beginPath(); g.moveTo(cx + 0.005, y - 0.12); g.lineTo(cx + 0.02, y - 0.17); g.stroke();
  }
}
export const roomState = new WeakMap();
export function restroomSpots(u){
  const W = u.w, H = u.h, n = Math.max(1, Math.floor((W - 0.2) / 1.25)), sw = (W - 0.2) / n;
  const at = (lx, ly) => { const [x, y] = local(u, lx, ly); return { x, y }; };
  const stalls = [];
  for (let i = 0; i < n; i++){ const c = 0.1 + i * sw + sw / 2; stalls.push({ lx: 0.1 + i * sw, sw, front: at(c, 1.62), inside: at(c, 0.85) }); }
  const sinks = [];
  for (let j = 0; j < (W >= 3 ? 2 : 1); j++) sinks.push({ lx: 0.5 + j * 0.7, at: at(0.5 + j * 0.7, H - 1.02) });
  const dl = doorX(u) - u.x + 0.5;
  return { stalls, sinks, aisle: (ly) => at(dl, ly), sinkY: H - 1.02 };
}
// A proper toilet in the 3/4 view: tank against the wall, lid up, seat ring, water, and a pedestal.
// One cute toilet, drawn as a single piece: tank, bowl and pedestal share one outline. (cx, fy) is where it meets
// the floor. Seen from the front it shows the seat and a bit of water; from behind, mostly the tank.
function toilet(cx, fy, front = true){
  shadow(cx, fy, 0.2, 0.06, 0.16);
  g.beginPath();
  g.moveTo(cx - 0.15, fy - 0.74); g.lineTo(cx + 0.15, fy - 0.74); g.quadraticCurveTo(cx + 0.18, fy - 0.74, cx + 0.18, fy - 0.7);
  g.lineTo(cx + 0.18, fy - 0.46); g.quadraticCurveTo(cx + 0.21, fy - 0.42, cx + 0.2, fy - 0.36);
  g.quadraticCurveTo(cx + 0.19, fy - 0.16, cx + 0.09, fy - 0.1); g.lineTo(cx + 0.11, fy); g.lineTo(cx - 0.11, fy); g.lineTo(cx - 0.09, fy - 0.1);
  g.quadraticCurveTo(cx - 0.19, fy - 0.16, cx - 0.2, fy - 0.36); g.quadraticCurveTo(cx - 0.21, fy - 0.42, cx - 0.18, fy - 0.46);
  g.lineTo(cx - 0.18, fy - 0.7); g.quadraticCurveTo(cx - 0.18, fy - 0.74, cx - 0.15, fy - 0.74); g.closePath();
  fs('#ffffff', 0.04);
  rr(cx - 0.19, fy - 0.78, 0.38, 0.07, 0.03); fs('#f4f8ff', 0.03);                     // tank lid
  g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(cx - 0.12, fy - 0.68, 0.04, 0.16);   // shine
  g.strokeStyle = 'rgba(61,43,53,.18)'; g.lineWidth = 0.02; g.beginPath(); g.moveTo(cx - 0.16, fy - 0.46); g.lineTo(cx + 0.16, fy - 0.46); g.stroke();
  if (front){
    rr(cx + 0.06, fy - 0.62, 0.07, 0.03, 0.015); fs('#a0a8b0', 0.015);                   // flush handle
    ell(cx, fy - 0.35, 0.17, 0.075); fs('#eef3ff', 0.03);                                  // seat
    ell(cx, fy - 0.35, 0.1, 0.04); fs('#9be0f5', 0.015);                                   // water
    ell(cx - 0.03, fy - 0.36, 0.03, 0.012); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill();
  }
}
function restroomFurniture(u, layer){
  const st = roomState.get(u), sp = restroomSpots(u), down = u.face === 'down';
  if (layer === 'back'){
    const D = 1.0, wall = ['#d7f1ee', '#b5e3dd'], door = ['#9fd8d0', '#6cc4b8'];
    for (let i = 0; i < sp.stalls.length; i++){
      const s0 = sp.stalls[i], taken = st && st.inside && st.inside[i];
      const [x, y] = local(u, s0.lx, 0.3, s0.sw, D), cx = x + s0.sw / 2;
      // The stall door: closed with a red occupied tab when someone's in, swung open (with a green tab) when free.
      const drawDoor = dy => {
        if (taken){
          box(x + 0.05, dy, s0.sw - 0.1, 0.05, 0.8, door[0], door[1], 0, 0.04, 0.035);
          rr(x + s0.sw - 0.26, dy + 0.05 - 0.44, 0.14, 0.07, 0.02); fs('#ef476f', 0.015);
          circ(x + s0.sw - 0.16, dy + 0.05 - 0.32, 0.025); fs('#7a8090', 0.012);
        } else {
          const hx = x + 0.07, hy = dy + 0.04, fx = hx + 0.17, fy2 = down ? hy - 0.42 : hy + 0.42;
          g.beginPath(); g.moveTo(hx, hy); g.lineTo(fx, fy2); g.lineTo(fx, fy2 - 0.8); g.lineTo(hx, hy - 0.8); g.closePath(); fs(door[1], 0.035);
          rr(fx - 0.06, fy2 - 0.48, 0.04, 0.07, 0.01); fs('#4cc38a', 0.012);
        }
      };
      if (down){
        toilet(cx, y + 0.62, true);
        box(x - 0.03, y, 0.06, D, 0.9, wall[0], wall[1]);
        if (i === sp.stalls.length - 1) box(x + s0.sw - 0.03, y, 0.06, D, 0.9, wall[0], wall[1]);
        drawDoor(y + D - 0.06);
      } else {
        // Seen from the back: the door's on the far side, the toilet's tank faces us.
        drawDoor(y);
        toilet(cx, y + D - 0.12, false);
        box(x - 0.03, y, 0.06, D, 0.9, wall[0], wall[1]);
        if (i === sp.stalls.length - 1) box(x + s0.sw - 0.03, y, 0.06, D, 0.9, wall[0], wall[1]);
      }
    }
  } else if (layer === 'mid'){
    // Sink counter by the door, one basin and faucet per sink.
    const n = sp.sinks.length, [x, y] = local(u, 0.15, u.h - 0.72, 0.7 * n, 0.38);
    box(x, y, 0.7 * n, 0.38, 0.5, '#ffffff', '#dfe7e6');
    for (let j = 0; j < n; j++){
      const cx = x + 0.35 + j * 0.7;
      ell(cx, y - 0.32, 0.18, 0.08); fs('#cfe9f2', 0.025);
      rr(cx - 0.03, y - 0.52, 0.06, 0.18, 0.02); fs('#a0a8b0', 0.02);
    }
  }
}
/* ---------- Attractions ---------- */
// Seats (or trampolines), each with the path in from the door. Tickets are sold by a machine at the door.
export function attractionSpots(u, def){
  const W = u.w, H = u.h, at = (lx, ly) => { const [x, y] = local(u, lx, ly); return { x, y }; };
  const dl = doorX(u) - u.x + 0.5;
  const door = { x: u.x + dl, y: u.face === 'down' ? u.y + H - 0.25 : u.y + 0.25 };
  const front = { x: u.x + dl, y: u.face === 'down' ? u.y + H + 0.5 : u.y - 0.5 };
  const seats = [];
  if (def.attraction === 'theater'){
    // Two rows of four, split by a center aisle, all facing the screen on the back wall.
    [1.55, 2.45].forEach((ly, row) => { for (const lx of [0.75, 1.55, W - 1.55, W - 0.75]) seats.push({ row, ly, lx, at: at(lx, ly), path: [at(dl, ly + 0.5), at(lx, ly + 0.5), at(lx, ly)] }); });
  } else {
    for (const ly of [1.2, 2.45]) for (const lx of [0.95, W / 2, W - 0.95]) seats.push({ ly, lx, at: at(lx, ly), path: [at(dl, H - 0.7), at(lx, H - 0.7), at(lx, ly)] });
  }
  return { door, front, seats, queue: [], staff: front, staffPath: [], browse: [], counter: [u.x, u.y, 0, 0] };
}
function attractionBack(u, def, t){
  if (def.attraction === 'theater'){
    // The big screen, playing a cartoon: rolling hills, a bouncing ball and a sun that won't stop grinning.
    const [x, y] = local(u, 0.35, 0.3, u.w - 0.7, 0.18), sw = u.w - 0.7, top = y - 0.72, sh = 0.62;
    box(x - 0.08, y, sw + 0.16, 0.18, 0.8, '#2b2d42', '#1d1430');
    g.save(); rr(x, top, sw, sh, 0.04); g.clip();
    const sky = g.createLinearGradient(0, top, 0, top + sh); sky.addColorStop(0, '#8ecae6'); sky.addColorStop(1, '#ffd6e0');
    g.fillStyle = sky; g.fillRect(x, top, sw, sh);
    g.fillStyle = '#7bd389'; g.beginPath(); g.moveTo(x, top + sh); for (let i = 0; i <= 8; i++) g.lineTo(x + i * sw / 8, top + sh * 0.72 + Math.sin(i * 1.3 + t * 0.6) * 0.06); g.lineTo(x + sw, top + sh); g.fill();
    const bx = x + ((t * 0.5) % 1) * sw, by = top + sh * 0.7 - Math.abs(Math.sin(t * 3.2)) * sh * 0.45;
    circ(bx, by, 0.09); fs('#ef476f', 0.02);
    circ(x + sw * 0.82, top + 0.2, 0.12); fs('#ffd23f', 0.02);
    g.restore();
    rr(x, top, sw, sh, 0.04); fs(null, 0.05);
  } else {
    // Foam mats along the back wall. The trampolines lie flat on the floor; when the back wall is at the bottom
    // (doors facing up) the renderer draws them early instead, so jumpers aren't hidden under them.
    const [mx, my] = local(u, 0.08, 0.08, u.w - 0.16, 0.3); box(mx, my, u.w - 0.16, 0.3, 0.35, '#ffd23f', '#f4b942');
    if (u.face === 'down') trampolines(u, def);
  }
}
// Trampolines: a padded frame with a stretchy blue bed.
export function trampolines(u, def){
  for (const s0 of attractionSpots(u, def).seats){
    const cx = s0.at.x, cy = s0.at.y + 0.05;
    ell(cx, cy, 0.55, 0.3); fs('#3d405b', 0.04);
    ell(cx, cy, 0.44, 0.22); fs('#5a8dee', 0.025);
    for (let a = 0; a < 6; a++){ circ(cx + Math.cos(a) * 0.5, cy + Math.sin(a) * 0.27, 0.035); fs('#ef476f', 0); }
  }
}
// One row of cinema seats (drawn separately so people sit in them properly).
export function theaterRow(u, def, row){
  const sp = attractionSpots(u, def), down = u.face === 'down';
  for (const s0 of sp.seats){
    if (s0.row !== row) continue;
    const x = s0.at.x - 0.3, y = s0.at.y;
    box(x, y - 0.12, 0.6, 0.3, 0.22, '#e05a4f', '#c0392b');
    // Plush seat back with a rounded top and a stitched panel, and armrests either side.
    const by = down ? y + 0.16 : y - 0.26;
    box(x, by, 0.6, 0.1, 0.55, '#e05a4f', '#a83226', 0, 0.12);
    rr(x + 0.1, by + 0.1 - 0.47, 0.4, 0.3, 0.08); fs(null, 0.02, 'rgba(255,220,200,.45)');
    for (const ax of [x - 0.06, x + 0.6]){ box(ax, y - 0.1, 0.07, 0.32, 0.3, '#5a2a3e', '#3d1e2c', 0, 0.02, 0.03); }
  }
}
// A little puppy in the pet shop's pen: floppy ears, a wagging tail, and a happy hop now and then.
function puppy(x, y, t){
  const hop = Math.max(0, Math.sin(t * 2.4)) ** 3 * 0.08, wag = Math.sin(t * 14) * 0.5;
  const fur = '#d9a066', dark = '#a8743f';
  shadow(x, y, 0.2, 0.06);
  g.save(); g.translate(0, -hop);
  // Tail, then legs, body and head (facing right).
  g.save(); g.translate(x - 0.17, y - 0.2); g.rotate(-0.9 + wag * 0.4); rr(-0.02, -0.15, 0.05, 0.16, 0.025); fs(fur, 0.025); g.restore();
  for (const lx of [-0.12, -0.04, 0.06, 0.13]){ rr(x + lx - 0.025, y - 0.12, 0.05, 0.12, 0.02); fs(lx > 0 ? fur : dark, 0.02); }
  ell(x, y - 0.17, 0.19, 0.1); fs(fur, 0.03);
  ell(x - 0.02, y - 0.13, 0.11, 0.05); fs('#f3d9b1', 0);
  circ(x + 0.17, y - 0.3, 0.11); fs(fur, 0.03);
  ell(x + 0.26, y - 0.27, 0.06, 0.045); fs('#f3d9b1', 0.02);
  circ(x + 0.31, y - 0.285, 0.018); fs(OUT, 0);
  ell(x + 0.1, y - 0.3, 0.045, 0.09, 0.35); fs(dark, 0.02);       // floppy ear
  circ(x + 0.2, y - 0.33, 0.016); fs(OUT, 0);                      // eye
  g.beginPath(); g.arc(x + 0.26, y - 0.245, 0.025, 0.2, Math.PI - 0.2); g.strokeStyle = OUT; g.lineWidth = 0.012; g.stroke();
  if (Math.sin(t * 2.4) > 0.9) { rr(x + 0.26, y - 0.24, 0.03, 0.04, 0.012); fs('#ff8fab', 0); }   // tongue out at the top of a hop
  rr(x + 0.07, y - 0.24, 0.1, 0.03, 0.012); fs('#ef476f', 0.012);   // collar
  g.restore();
}

// The front layer: glass with a door gap (or boards when derelict), side walls, and the sign for doors facing up.
export function unitFront(u, def, t){
  const [wl, wd] = unitWall(u, def);
  const yF = u.face === 'down' ? u.y + u.h - 0.07 : u.y - 0.07;
  const dx = doorX(u);
  // side walls
  for (const x of [u.x, u.x + u.w]) box(x - 0.07, u.y, 0.14, u.h, 0.42, wl, wd);
  if (u.state === 'derelict'){
    planks(u.x, u.x + u.w, yF + 0.14, u.face === 'down' ? 0.85 : 0.62, u.id * 13);
    forLease(u.x + u.w / 2, yF + 0.14 - (u.face === 'down' ? 0.45 : 0.32), (u.id % 3 - 1) * 0.06, 0.85);
    return;
  }
  const tint = u.state === 'store' && def.icon === 'joystick' ? 'rgba(160,140,230,.75)' : 'rgba(185,228,245,.85)';
  if (dx > u.x) glass(u.x + 0.07, yF, dx - u.x - 0.07, 0.42, tint);
  if (dx + 1 < u.x + u.w) glass(dx + 1, yF, u.x + u.w - dx - 1 - 0.07, 0.42, tint);
  const post = u.state === 'restroom' ? def.color : u.state === 'store' ? def.trim : '#cdb8e6';
  box(dx - 0.05, yF - 0.02, 0.1, 0.18, 0.75, shade(post, 0.4), post);
  box(dx + 0.95, yF - 0.02, 0.1, 0.18, 0.75, shade(post, 0.4), post);
  if (u.face === 'up'){
    const sx = u.x + u.w / 2, top = yF + 0.14 - 0.95;
    if (u.state === 'vacant') forLease(sx, top + 0.15, 0.04, 0.8);
  }
  if (u.face === 'down' && u.state === 'store' && def.icon === 'joystick'){
    g.save(); g.shadowColor = '#ff5fa2'; g.shadowBlur = 0.3 * PPT; rr(u.x + 0.08, yF + 0.14 - 0.44, u.w - 0.16, 0.04, 0.02); g.fillStyle = '#ff9cc8'; g.fill(); g.restore();
  }
}

// At night, a sandwich board out front of any store or kiosk with nobody to run its register.
export function helpWanted(u, t){
  let x, y;
  if (u.kiosk){ x = u.x + 0.35; y = u.y + 1.05; }
  else {
    const dx = doorX(u);
    x = dx + 1 + 0.45 <= u.x + u.w ? dx + 1.4 : dx - 0.4;
    y = u.face === 'down' ? u.y + u.h + 0.32 : u.y - 0.12;
  }
  const bob = Math.sin(t * 3 + u.id) * 0.03;
  shadow(x, y, 0.32, 0.08);
  for (const lx of [-0.24, 0.24]){ g.beginPath(); g.moveTo(x + lx * 0.6, y - 0.7); g.lineTo(x + lx, y); g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.05; g.stroke(); }
  g.save(); g.translate(x, y - 0.42 + bob);
  g.shadowColor = 'rgba(255,214,64,.9)'; g.shadowBlur = 0.25 * PPT;
  rr(-0.33, -0.3, 0.66, 0.5, 0.05); fs('#ffd23f', 0.04);
  g.restore(); g.save(); g.translate(x, y - 0.42 + bob);
  rr(-0.28, -0.25, 0.56, 0.4, 0.035); fs('#fffaf0', 0.025);
  text('HELP', 0, -0.13, 0.13, '#d62839', 700);
  text('WANTED', 0, 0.02, 0.12, '#d62839', 700);
  text('ask inside', 0, 0.11, 0.06, '#5a4a5a', 600);
  g.restore();
}

/* ---------- Kiosk ---------- */
export function kiosk(k, def, t){
  const x = k.x + 0.3, y = k.y + 0.4;
  shadow(x + 0.7, y + 0.47, 0.85, 0.14);
  for (const px of [x + 0.08, x + 1.26]){ rr(px, y - 1.5, 0.06, 1.05, 0.02); fs('#e9e1d4', 0.03); }
  box(x, y, 1.4, 0.45, 0.58, '#ffe8c2', def.color);
  rr(x + 0.06, y - 0.03, 1.28, 0.12, 0.04); fs(def.trim, 0.03);
  storeIcon(def.icon, x + 0.7, y - 0.16, 0.28);
  for (const wx of [x + 0.22, x + 1.18]){ circ(wx, y + 0.45, 0.09); fs('#5a4a5a', 0.04); circ(wx, y + 0.45, 0.03); fs('#ccc', 0); }
  if (def.icon === 'hotdog') A2.hotdogCounter(x, y, t);
  else if (def.icon === 'lemon') A4.lemonCounter(x, y, t);
  else if (def.icon === 'cotton') A4.cottonCounter(x, y, t);
  else if (def.icon === 'boba') A2.bobaCounter(x, y, t);
  else if (def.icon === 'cone'){
    // Tubs of ice cream under a glass sneeze guard.
    rr(x + 0.12, y - 0.55, 1.16, 0.22, 0.05); fs('rgba(220,245,255,.85)', 0.03);
    ['#ff8fc8', '#7ed6c8', '#fff3d6', '#8a5a44'].forEach((c, i) => { ell(x + 0.3 + i * 0.27, y - 0.42, 0.11, 0.06); fs(c, 0.025); });
  } else {
    // Pretzels hanging from a rod behind the glass, and a mustard pump.
    g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(x + 0.2, y - 0.62); g.lineTo(x + 1.2, y - 0.62); g.stroke();
    for (const px of [x + 0.35, x + 0.7, x + 1.05]){ g.beginPath(); g.moveTo(px, y - 0.62); g.lineTo(px, y - 0.55); g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.015; g.stroke(); pretzelIcon(px, y - 0.43, 0.17); }
    rr(x + 1.2, y - 0.5, 0.09, 0.14, 0.02); fs('#ffd23f', 0.02); rr(x + 1.225, y - 0.58, 0.04, 0.09, 0.01); fs('#a0a8b0', 0.015);
  }
  const top = y - 1.6, x0 = x - 0.12, x1 = x + 1.52;
  g.save(); g.beginPath(); g.moveTo(x0, top + 0.3); g.lineTo(x + 0.15, top); g.lineTo(x + 1.25, top); g.lineTo(x1, top + 0.3); g.closePath(); g.clip();
  g.fillStyle = def.color; g.fillRect(x0, top, x1 - x0, 0.3); g.fillStyle = '#fff3e0';
  for (let i = 0; i < 6; i += 2) g.fillRect(x0 + i * (x1 - x0) / 6, top, (x1 - x0) / 6, 0.3);
  g.restore();
  g.beginPath(); g.moveTo(x0, top + 0.3); g.lineTo(x + 0.15, top); g.lineTo(x + 1.25, top); g.lineTo(x1, top + 0.3); g.closePath(); fs(null);
  for (let i = 0; i < 6; i++){ const cx = x0 + (i + 0.5) * (x1 - x0) / 6; g.beginPath(); g.arc(cx, top + 0.3, (x1 - x0) / 12, 0, Math.PI); fs(i % 2 ? def.color : '#fff3e0', 0.04); }
  // The sign rides on top of the awning, with the kiosk's icon as a topper.
  rr(x + 0.05, top - 0.36, 1.3, 0.34, 0.1); fs('#fff8ec', 0.04);
  circ(x + 0.2, top - 0.19, 0.15); fs(def.trim, 0.035); storeIcon(def.icon, x + 0.2, top - 0.19, 0.2);
  text(def.name, x + 0.85, top - 0.19, 0.17, shade(def.color, -0.25), 700, 'Fredoka', 0.82);
}

/* ---------- Decor and props ---------- */
export function palm(x, y){
  shadow(x, y, 0.36, 0.12);
  rr(x - 0.3, y - 0.42, 0.6, 0.42, 0.1); fs('#e07a5f');
  rr(x - 0.34, y - 0.52, 0.68, 0.14, 0.06); fs('#f09a7f');
  ell(x, y - 0.47, 0.26, 0.045); fs('#6b4a3a', 0);
  rr(x - 0.055, y - 1.22, 0.11, 0.77, 0.05); fs('#a47148');
  const tx = x, ty = y - 1.22;
  for (const [a, L] of [[-1.57, 0.42], [-2.75, 0.62], [-0.39, 0.62], [-2.25, 0.7], [-0.9, 0.7], [-1.9, 0.6], [-1.25, 0.6]]){
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.7 + L * 0.42;
    const mx = tx + Math.cos(a) * L * 0.5, my = ty + Math.sin(a) * L * 0.5 - 0.06;
    const nx = -Math.sin(a) * 0.13, ny = Math.cos(a) * 0.13;
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(mx + nx, my + ny, ex, ey); g.quadraticCurveTo(mx - nx, my - ny, tx, ty); fs('#5bbf6a', 0.04);
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(mx, my, ex, ey); g.strokeStyle = '#3f9a52'; g.lineWidth = 0.02; g.stroke();
  }
}
export function bench(x, y, w = 1.8){
  shadow(x + w / 2, y + 0.5, w * 0.55, 0.12, 0.15);
  box(x, y, w, 0.1, 0.72, '#f0b57e', '#d08e57');
  box(x, y + 0.1, w, 0.36, 0.32, '#f3c08c', '#c98b55');
  for (const xx of [x + 0.1, x + w - 0.2]){ rr(xx, y + 0.38, 0.1, 0.1, 0.02); fs('#7a5a44', 0.03); }
}
export function trashCan(x, y, full = 0){
  g.save(); g.translate(x, y); g.scale(1.25, 1.25); g.translate(-x, -y);
  // A classic mall bin: round body with ribs, a domed lid with a swing flap, and a little recycling leaf.
  shadow(x, y, 0.24, 0.08);
  cylinder(x, y - 0.02, 0.2, 0.44, '#3f9a72', '#2f7a58');
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.02; for (const dx of [-0.1, 0, 0.1]){ g.beginPath(); g.moveTo(x + dx, y - 0.4); g.lineTo(x + dx, y - 0.06); g.stroke(); }
  g.fillStyle = '#2f7a58'; g.fillRect(x - 0.2, y - 0.16, 0.4, 0.04);
  circ(x, y - 0.29, 0.07); fs('#fffaf3', 0.02);
  g.beginPath(); g.ellipse(x - 0.02, y - 0.29, 0.03, 0.045, 0.6, 0, Math.PI * 2); g.fillStyle = '#3f9a72'; g.fill();
  g.beginPath(); g.ellipse(x, y - 0.46, 0.23, 0.08, 0, Math.PI, 0); g.lineTo(x + 0.23, y - 0.46); g.ellipse(x, y - 0.46, 0.23, 0.07, 0, 0, Math.PI); fs('#a9b7b0', 0.04);
  g.beginPath(); g.ellipse(x, y - 0.5, 0.17, 0.11, 0, Math.PI, 0); g.closePath(); fs('#c9d4ce', 0.035);
  rr(x - 0.09, y - 0.55, 0.18, 0.06, 0.02); fs('#3d2b35', 0);
  if (full > 0.7){ ell(x - 0.04, y - 0.58, 0.05, 0.03, 0.4); fs('#fffaf3', 0.015); rr(x + 0.01, y - 0.6, 0.06, 0.05, 0.01); fs('#e07a5f', 0.015); }
  circ(x, y - 0.62, 0.025); fs('#7a8a85', 0.015);
  g.restore();
}
/* ---------- Decor with a facing: rot 0 faces the camera, 1 faces left, 2 faces away, 3 faces right ---------- */
const BENCH = { back: ['#f0b57e', '#d08e57'], seat: ['#f3c08c', '#c98b55'], legs: '#4a4f6a', backH: 0.72, seatH: 0.32, slats: true, metalArms: '#4a4f6a' };
const SOFA = { back: ['#e891b3', '#c86a90'], seat: ['#f4a9c6', '#d47fa1'], legs: '#5a3a44', backH: 0.78, seatH: 0.38, arms: ['#e891b3', '#b85f84'], cushions: true };
// Live state for decor (is someone using it, and how far along), set by the renderer.
// A decor piece drawn to fit a 1×1 icon (the Build list, level-up cards), centered at (0.5, 0.5).
const THUMB = { slots: [2.2, 0.3], goldslots: [2.2, 0.3], blackjack: [3.2, -0.55], roulette: [3.2, -0.55], poker: [3.2, -0.55], craps: [3.2, -0.55], wheel: [2.6, 0.5], neon: [2.6, 0.5], jackpot: [2.5, 0.45], rope: [1.6, -0.1], dicestatue: [2.2, 0.3], champagne: [2.2, 0.3], balloons: [2.2, 0.3], arcadecab: [2.0, 0.2], bubbles: [2.2, 0.3], koi: [2.1, -0.55], lamp: [2.7, 0.38], tree: [2.7, 0.38], topiary: [2.3, 0.3], photobooth: [2.3, 0.3], arch: [2.4, 0.25], ride: [1.45, -0.3], piano: [2.6, -0.45], playarea: [3.2, -0.5], foodcourt: [4.3, -0.2], carousel: [3.4, 0.3], clock: [3.2, 0.35] };
export function decorThumb(type, w){
  const [span, dy] = THUMB[type] || [1.45, -0.15], k = 1 / Math.max(w, span);
  g.translate(0.5, 0.5); g.scale(k, k); g.translate(-w / 2, dy);
  decor({ type, x: 0, y: 0, rot: 0, id: 1 }, 0);
}
export const decorState = new WeakMap();
export function decor(d, t = 0){
  const r = d.rot || 0, x = d.x, y = d.y, live = decorState.get(d);
  switch (d.type){
    case 'plant': palm(x + 0.5, y + 0.85); break;
    case 'bin': trashCan(x + 0.5, y + 0.8); break;
    case 'bench': seatPiece(x, y, r, BENCH); break;
    case 'sofa': seatPiece(x, y, r, SOFA); break;
    case 'planter': planter(x, y, r); break;
    case 'lamp': lampPost(x + 0.5, y + 0.8); break;
    case 'vending': vending(x, y, r, t, live); break;
    case 'ride': kiddieRide(x, y, r, t, live); break;
    case 'claw': clawMachine(x, y, r, t, live); break;
    case 'gumball': gumball(x + 0.5, y + 0.8); break;
    case 'directory': directory(x, y, r); break;
    case 'tree': shadeTree(x + 0.5, y + 0.85); break;
    // In the mall the pit's near edge, the chute and the front rail are their own layers (render.js); thumbnails and
    // the placement preview get the whole thing at once.
    case 'playarea': A2.playArea(d, t); for (const part of ['pit', 'slide', 'rail']) A2.playFront(d, part); break;
    case 'foodcourt': A4.foodCourt(d, 'all', 0, t); break;
    case 'carousel': A4.carousel(d, t, live, person); break;
    case 'clock': A4.mallClock(x + 0.5, y + 0.8, t); break;
    case 'topiary': A2.topiary(x + 0.5, y + 0.85); break;
    case 'photobooth': A2.photobooth(x, y, r, t, live); break;
    case 'aquarium': A2.aquarium(x, y, t); break;
    case 'massage': A2.massageChair(x, y, r, live); break;
    case 'piano': A2.piano(x, y, t); break;
    case 'arch': A2.flowerArch(x, y); break;
    case 'balloons': A2.balloonCart(x + 0.5, y + 0.8, t); break;
    case 'statue': A2.littleFountain(x + 0.5, y + 0.82, t); break;
    case 'arcadecab': A2.arcadeCabinet(x, y, r, t, live); break;
    case 'bubbles': A2.bubbleMachine(x + 0.5, y + 0.82, t); break;
    case 'koi': A2.koiPond(x, y, t); break;
    case 'slots': A3.slotMachine(x, y, r, t, live); break;
    case 'goldslots': A3.slotMachine(x, y, r, t, live, true); break;
    case 'blackjack': case 'roulette': case 'poker': case 'craps': A3.casinoTable(d, t, live); break;
    case 'wheel': A3.prizeWheel(x, y, t, live); break;
    case 'neon': A3.neonSign(x, y, t); break;
    case 'rope': A3.velvetRope(x + 0.5, y + 0.8); break;
    case 'jackpot': A3.jackpotBoard(x, y, t); break;
    case 'dicestatue': A3.diceStatue(x + 0.5, y + 0.82); break;
    case 'champagne': A3.champagneTower(x + 0.5, y + 0.82, t); break;
  }
}
function seatPiece(x, y, r, st){
  const legs = (pts) => { for (const [lx, ly] of pts){ rr(lx, ly, 0.1, 0.1, 0.02); fs(st.legs, 0.03); } };
  // Slats on a bench: thin lines across a seat or back face.
  const slatsH = (bx, by, bw, bh, n) => { g.strokeStyle = 'rgba(122,74,40,.45)'; g.lineWidth = 0.02; g.beginPath(); for (let i = 1; i < n; i++){ g.moveTo(bx + 0.03, by + i * bh / n); g.lineTo(bx + bw - 0.03, by + i * bh / n); } g.stroke(); };
  const slatsV = (bx, by, bw, bh, n) => { g.strokeStyle = 'rgba(122,74,40,.45)'; g.lineWidth = 0.02; g.beginPath(); for (let i = 1; i < n; i++){ g.moveTo(bx + i * bw / n, by + 0.03); g.lineTo(bx + i * bw / n, by + bh - 0.03); } g.stroke(); };
  const metalArm = (ax, ay, w, d) => { rr(ax, ay - st.seatH - 0.16, w, d + 0.06, 0.03); fs(st.metalArms, 0.03); rr(ax + w / 2 - 0.03, ay - st.seatH - 0.12, 0.06, st.seatH + 0.12, 0.02); fs(st.metalArms, 0.02); };
  if (r === 0 || r === 2){
    shadow(x + 1, y + 0.62, 1.0, 0.12, 0.15);
    const backY = r === 0 ? y + 0.15 : y + 0.56, seatY = r === 0 ? y + 0.27 : y + 0.2;
    const back = () => { box(x + 0.1, backY, 1.8, 0.12, st.backH, st.back[0], st.back[1]); if (st.slats) slatsH(x + 0.1, backY + 0.12 - st.backH, 1.8, st.backH, 4); if (st.cushions && r === 0) for (const px of [x + 0.3, x + 1.3]){ rr(px, backY - st.backH + 0.25, 0.4, 0.32, 0.12); fs(px < x + 1 ? '#ffd23f' : '#7ed6c8', 0.03); } };
    if (r === 0) back();
    box(x + 0.1, seatY, 1.8, 0.36, st.seatH, st.seat[0], st.seat[1]);
    if (st.slats) slatsH(x + 0.1, seatY - st.seatH, 1.8, 0.36, 3);
    if (st.cushions){ g.strokeStyle = 'rgba(120,40,80,.35)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(x + 1.0, seatY - st.seatH + 0.03); g.lineTo(x + 1.0, seatY + 0.36 - 0.03); g.stroke(); }
    if (st.arms) for (const ax of [x + 0.02, x + 1.84]) box(ax, y + 0.18, 0.14, 0.5, st.seatH + 0.16, st.arms[0], st.arms[1]);
    if (st.metalArms) for (const ax of [x + 0.04, x + 1.86]) metalArm(ax, seatY + 0.3, 0.1, 0.06);
    if (r === 2) back();
    legs([[x + 0.2, y + 0.6], [x + 1.7, y + 0.6]]);
  } else {
    shadow(x + 0.5, y + 1.92, 0.32, 0.1, 0.15);
    const backX = r === 1 ? x + 0.64 : x + 0.24, seatX = r === 1 ? x + 0.22 : x + 0.36;
    const back = () => { box(backX, y + 0.1, 0.12, 1.8, st.backH, st.back[0], st.back[1]); if (st.slats) slatsV(backX, y + 0.1 - st.backH, 0.12, 1.8, 1); };
    if (st.arms) box(x + 0.22, y + 0.02, 0.56, 0.14, st.seatH + 0.16, st.arms[0], st.arms[1]);
    if (st.metalArms) metalArm(seatX + 0.06, y + 0.1, 0.3, 0.04);
    if (r === 3) back();
    box(seatX, y + 0.1, 0.42, 1.8, st.seatH, st.seat[0], st.seat[1]);
    if (st.slats) slatsV(seatX, y + 0.1 - st.seatH, 0.42, 1.8, 3);
    if (st.cushions){ g.strokeStyle = 'rgba(120,40,80,.35)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(seatX + 0.03, y + 1.0 - st.seatH); g.lineTo(seatX + 0.39, y + 1.0 - st.seatH); g.stroke(); }
    if (r === 1) back();
    if (st.arms) box(x + 0.22, y + 1.84, 0.56, 0.14, st.seatH + 0.16, st.arms[0], st.arms[1]);
    if (st.metalArms) metalArm(seatX + 0.06, y + 1.86, 0.3, 0.04);
    legs([[seatX + 0.05, y + 1.86], [seatX + 0.27, y + 1.86]]);
  }
}
function planter(x, y, r){
  const flat = r === 0 || r === 2;
  const [bx, by, bw, bd] = flat ? [x + 0.08, y + 0.32, 1.84, 0.55] : [x + 0.22, y + 0.08, 0.56, 1.84];
  shadow(bx + bw / 2, by + bd, bw * 0.55, 0.1, 0.15);
  box(bx, by, bw, bd, 0.42, '#6b4a3a', '#e07a5f');
  rr(bx - 0.03, by - 0.47, bw + 0.06, 0.1, 0.04); fs('#f09a7f', 0.03);
  const n = flat ? 7 : 7, cols = ['#ff6b8b', '#ffd23f', '#fff', '#9b7bff'];
  for (let i = 0; i < n; i++){
    const fx = flat ? bx + 0.15 + i * (bw - 0.3) / (n - 1) : bx + bw / 2 + (i % 2 ? 0.12 : -0.12);
    const fy = flat ? by - 0.32 + (i % 2) * 0.12 : by - 0.25 + i * (bd - 0.3) / (n - 1);
    g.strokeStyle = '#3f9a52'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(fx, fy + 0.05); g.lineTo(fx, fy - 0.12); g.stroke();
    ell(fx - 0.06, fy - 0.02, 0.06, 0.03, -0.5); fs('#5bbf6a', 0.015);
    for (let k = 0; k < 5; k++){ const a = k / 5 * Math.PI * 2; circ(fx + Math.cos(a) * 0.05, fy - 0.15 + Math.sin(a) * 0.04, 0.035); fs(cols[i % cols.length], 0.012); }
    circ(fx, fy - 0.15, 0.025); fs('#ffb703', 0);
  }
}
export function lampPost(x, y){
  shadow(x, y, 0.2, 0.07);
  rr(x - 0.14, y - 0.12, 0.28, 0.12, 0.04); fs('#3d405b', 0.035);
  rr(x - 0.04, y - 1.95, 0.08, 1.85, 0.03); fs('#4a4f6a', 0.035);
  rr(x - 0.15, y - 2.28, 0.3, 0.34, 0.08); fs('#fff3b0', 0.035);
  g.beginPath(); g.moveTo(x - 0.2, y - 2.26); g.lineTo(x, y - 2.42); g.lineTo(x + 0.2, y - 2.26); g.closePath(); fs('#3d405b', 0.035);
}
function vending(x, y, r, t = 0, live = null){
  const bx = x + 0.12, by = y + 0.3, bw = 0.76, bd = 0.5, H = 1.3;
  shadow(x + 0.5, y + 0.82, 0.42, 0.1);
  box(bx, by, bw, bd, H, '#c23e63', r === 2 ? '#b8355a' : '#ef476f');
  const top = by + bd - H, k = live ? live.k : -1;
  if (r === 0){
    // Lit header with the brand, a window full of cans, buttons, and the pickup tray.
    rr(bx + 0.05, top + 0.05, bw - 0.1, 0.16, 0.04); fs('#fff6ea', 0.025);
    text('POP!', bx + bw / 2, top + 0.135, 0.13, '#ef476f', 700);
    g.save(); g.globalAlpha = 0.25 + 0.15 * Math.sin(t * 3); rr(bx + 0.06, top + 0.25, 0.44, 0.78, 0.04); g.fillStyle = '#fffbe0'; g.fill(); g.restore();
    rr(bx + 0.06, top + 0.25, 0.44, 0.78, 0.04); fs('rgba(200,235,250,.85)', 0.03);
    for (let row = 0; row < 4; row++){ g.fillStyle = 'rgba(61,43,53,.25)'; g.fillRect(bx + 0.07, top + 0.43 + row * 0.18, 0.42, 0.02); for (let i = 0; i < 3; i++){ rr(bx + 0.1 + i * 0.13, top + 0.29 + row * 0.18, 0.09, 0.14, 0.03); fs(['#118ab2', '#ffd23f', '#06d6a0', '#ff9f43'][(row + i) % 4], 0.015); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(bx + 0.115 + i * 0.13, top + 0.31 + row * 0.18, 0.015, 0.09); } }
    for (let i = 0; i < 4; i++){ rr(bx + 0.56, top + 0.3 + i * 0.11, 0.14, 0.07, 0.02); fs(k > 0 && k < 0.5 && i === 1 ? '#7bd389' : '#fff6ea', 0.015); }
    rr(bx + 0.58, top + 0.78, 0.1, 0.16, 0.02); fs('#3d2b35', 0); rr(bx + 0.61, top + 0.8, 0.04, 0.06, 0.01); fs('#ffd23f', 0);
    rr(bx + 0.1, top + 1.08, 0.4, 0.12, 0.03); fs('#3d2b35', 0.02);
    // A can rolls down into the tray once it's paid for.
    if (k >= 0.45){ const d = Math.min(1, (k - 0.45) / 0.2); rr(bx + 0.24, top + 0.85 + d * 0.25, 0.12, 0.08, 0.02); fs('#118ab2', 0.015); }
  } else if (r === 2){
    g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.025;
    for (let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(bx + 0.15, top + 0.2 + i * 0.08); g.lineTo(bx + bw - 0.15, top + 0.2 + i * 0.08); g.stroke(); }
  } else {
    // Side on: a white swoosh, and the edge of the glass front on the side it faces.
    g.save(); rr(bx, top, bw, H, 0.05); g.clip();
    g.beginPath(); g.moveTo(bx, top + 0.9); g.quadraticCurveTo(bx + bw / 2, top + 0.55, bx + bw, top + 0.75); g.lineTo(bx + bw, top + 0.85); g.quadraticCurveTo(bx + bw / 2, top + 0.65, bx, top + 1.0); g.closePath(); g.fillStyle = '#fff6ea'; g.fill();
    g.restore();
    text('POP!', bx + bw / 2, top + 0.35, 0.16, '#fff6ea', 700);
    const ex = r === 1 ? bx : bx + bw - 0.08;
    rr(ex, top + 0.08, 0.08, 1.0, 0.02); fs('rgba(200,235,250,.95)', 0.02);
  }
}
// The kiddie ride: a fat little rocket on a coin-op base. A kid rides in the open cockpit (see rideSeat), rocking
// with it; while it runs, the base lights chase and the rocket puffs exhaust. live.k is how far along the ride is
// (0 to 1): the kid climbs on over the first bit and hops off over the last (the renderer draws those hops).
export const RIDE_ON = 0.12, RIDE_OFF = 0.88;
const rideAmp = k => k < RIDE_ON || k > RIDE_OFF ? 0 : Math.min(1, (k - RIDE_ON) / 0.08, (RIDE_OFF - k) / 0.08);
// Where a seated rider goes (their feet, so to speak), for rotation r, with the rocket at rest.
export function rideSeat(d){
  const r = d.rot || 0, cx = d.x + 0.5, cy = d.y + 0.8;
  return r === 1 ? { x: cx + 0.04, y: cy - 0.72 } : r === 3 ? { x: cx - 0.04, y: cy - 0.72 } : { x: cx, y: cy - 0.76 };
}
function kiddieRide(x, y, r, t, live){
  const cx = x + 0.5, cy = y + 0.8, k = live ? live.k : 0, amp = rideAmp(k);
  const rock = Math.sin(t * 5) * amp, bob = Math.abs(Math.sin(t * 5)) * 0.05 * amp + (live ? 0 : Math.sin(t * 2) * 0.008);
  const rider = live && live.rider && amp > 0 ? live.rider : null;
  const BODY = '#ef476f', BODY2 = '#c23e63', NOSE = '#ffd23f', STRIPE = '#fff6ea', FIN = '#5a8dee', FIN2 = '#3f6fd1';
  // The base: a round platform with a coin box and chasing lights.
  shadow(cx, cy, 0.4, 0.12);
  cylinder(cx, cy - 0.02, 0.33, 0.12, '#3fb8af', '#5cc8bf');
  for (let i = 0; i < 6; i++){ const a = Math.PI * (0.15 + i * 0.14); circ(cx - Math.cos(a) * 0.26, cy - 0.06 + Math.sin(a) * 0.02, 0.028); fs(live && amp > 0 && (i + Math.floor(t * 8)) % 3 === 0 ? '#fff2a8' : '#ffd23f', 0.012); }
  box(cx + 0.2, cy - 0.04, 0.15, 0.1, 0.22, '#ffd23f', '#e0b52f', 0, 0.03, 0.03);
  rr(cx + 0.235, cy - 0.21, 0.08, 0.02, 0.01); fs('#3d405b', 0);
  rr(cx - 0.04, cy - 0.42, 0.08, 0.3, 0.03); fs('#a0a8b0', 0.025);
  const py = cy - 0.42;                                   // the pivot the rocket rocks on
  g.save(); g.translate(cx, py - bob);
  const puff = (px, py2, dir) => { if (!amp) return; for (let i = 0; i < 3; i++){ const q = ((t * 1.6 + i / 3) % 1); circ(px + dir * q * 0.35, py2 - q * 0.08, 0.04 + q * 0.06); g.fillStyle = `rgba(255,255,255,${0.55 * (1 - q)})`; g.fill(); } };
  const flame = (fx, fy, dir, len) => { if (!amp) return; const f = len * (0.8 + Math.sin(t * 30) * 0.2); g.beginPath(); g.moveTo(fx, fy - 0.06); g.quadraticCurveTo(fx + dir * f, fy, fx, fy + 0.06); fs('#ff9f43', 0.02); g.beginPath(); g.moveTo(fx, fy - 0.03); g.quadraticCurveTo(fx + dir * f * 0.6, fy, fx, fy + 0.03); fs('#fff2a8', 0); };
  if (r === 1 || r === 3){
    // Side on: nose to the right (r 3) or mirrored to the left (r 1); it pitches nose up and down.
    const m = r === 1 ? -1 : 1;
    g.scale(m, 1); g.rotate(rock * 0.16);
    const by = -0.24, RX = 0.44, RY = 0.27;              // body center (above the pivot) and size
    puff(-RX - 0.08, by + 0.02, -1); flame(-RX - 0.03, by + 0.01, -1, 0.24);
    rr(-RX - 0.09, by - 0.08, 0.12, 0.17, 0.03); fs('#6c7385', 0.025);               // nozzle
    g.beginPath(); g.moveTo(-0.26, by - 0.16); g.lineTo(-0.5, by - 0.4); g.lineTo(-0.4, by - 0.1); g.closePath(); fs(FIN, 0.03);   // top fin
    // The rider sits down into the cockpit: drawn first, so the body hides their legs.
    if (rider){ g.save(); g.scale(m, 1); person(-0.04 * m, by - 0.06, { ...rider, t, s: 0.68, sit: true, sitSide: true, flip: m < 0, play: Math.sin(t * 2.5) > 0.3, mood: 'happy', noShadow: true }); g.restore(); }
    const body = () => { g.beginPath(); g.ellipse(0, by, RX, RY, 0, 0, Math.PI * 2); };
    // With a rider, the top of the body is cut away where the cockpit is, so they show through it.
    g.save();
    if (rider){ g.beginPath(); g.rect(-0.6, by - 0.5, 1.2, 1.2); g.ellipse(-0.04, by - RY + 0.03, 0.17, 0.12, 0, 0, Math.PI * 2); g.clip('evenodd'); }
    body(); fs(BODY, 0.04);
    g.save(); body(); g.clip();
    g.fillStyle = NOSE; g.beginPath(); g.ellipse(RX, by, 0.2, 0.34, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(RX - 0.08, by - 0.12, 0.05, 0.08, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = STRIPE; g.fillRect(-0.16, by - 0.34, 0.07, 0.68);
    g.fillStyle = BODY2; g.fillRect(-0.5, by + 0.14, 1, 0.2);
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-0.05, by - 0.16, 0.24, 0.05, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    body(); fs(null, 0.04);
    g.beginPath(); g.ellipse(RX - 0.2, by, 0.03, RY * 0.92, 0, -Math.PI / 2, Math.PI / 2); g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.02; g.stroke();
    circ(0.14, by + 0.04, 0.07); fs('#bfe7f7', 0.03); circ(0.12, by + 0.02, 0.022); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill();   // porthole
    g.restore();
    g.beginPath(); g.moveTo(-0.26, by + 0.16); g.lineTo(-0.48, by + 0.34); g.lineTo(-0.34, by + 0.12); g.closePath(); fs(FIN2, 0.03);   // bottom fin
    // The cockpit: its dark far side, the rider in it, the near lip over their lap, and a little windshield.
    if (!rider){ ell(-0.04, by - RY + 0.03, 0.17, 0.06); fs('#3a2346', 0.03); }
    g.beginPath(); g.ellipse(-0.04, by - RY + 0.03, 0.17, 0.06, 0, 0, Math.PI); g.strokeStyle = OUT; g.lineWidth = 0.05; g.stroke(); g.strokeStyle = '#ffd23f'; g.lineWidth = 0.025; g.stroke();
    g.beginPath(); g.moveTo(0.11, by - RY + 0.03); g.quadraticCurveTo(0.22, by - RY - 0.12, 0.27, by - RY + 0.05); g.closePath(); fs('rgba(190,230,250,.75)', 0.025);
  } else if (r === 0){
    // Nose toward us: the yellow nose cone in the middle, fins out to the sides, the rider peeking over the top.
    g.rotate(rock * 0.14);
    const by = -0.24;
    for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(sx * 0.18, by - 0.02); g.lineTo(sx * 0.42, by + 0.16); g.lineTo(sx * 0.2, by + 0.16); g.closePath(); fs(FIN, 0.03); }
    g.beginPath(); g.moveTo(-0.05, by - 0.2); g.lineTo(0, by - 0.4); g.lineTo(0.05, by - 0.2); g.closePath(); fs(FIN2, 0.03);
    if (rider) person(0, by - 0.1, { ...rider, t, s: 0.68, sit: true, play: Math.sin(t * 2.5) > 0.3, mood: 'happy', noShadow: true });
    circ(0, by, 0.26); fs(BODY, 0.04);
    g.save(); circ(0, by, 0.26); g.clip(); g.fillStyle = BODY2; g.fillRect(-0.3, by + 0.12, 0.6, 0.2); g.restore();
    circ(0, by, 0.26); fs(null, 0.04);
    circ(0, by + 0.02, 0.15); fs(STRIPE, 0.03);
    circ(0, by + 0.02, 0.1); fs(NOSE, 0.03);
    circ(-0.03, by - 0.01, 0.03); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
    puff(-0.28, by + 0.12, -1); puff(0.28, by + 0.12, 1);
  } else {
    // Tail toward us: the nozzle (with flames when it's running), fins, the rider's back over the top.
    g.rotate(rock * 0.14);
    const by = -0.24;
    if (rider) person(0, by - 0.1, { ...rider, t, s: 0.68, sit: true, back: true, play: Math.sin(t * 2.5) > 0.3, noShadow: true });
    for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(sx * 0.18, by - 0.02); g.lineTo(sx * 0.42, by + 0.16); g.lineTo(sx * 0.2, by + 0.16); g.closePath(); fs(FIN, 0.03); }
    circ(0, by, 0.26); fs(BODY, 0.04);
    g.save(); circ(0, by, 0.26); g.clip(); g.fillStyle = BODY2; g.fillRect(-0.3, by + 0.12, 0.6, 0.2); g.restore();
    circ(0, by, 0.26); fs(null, 0.04);
    circ(0, by + 0.02, 0.13); fs('#6c7385', 0.035); circ(0, by + 0.02, 0.08); fs('#3a3346', 0.02);
    if (amp){ circ(0, by + 0.02, 0.06 + Math.sin(t * 30) * 0.015); fs('#ff9f43', 0); circ(0, by + 0.02, 0.035); fs('#fff2a8', 0); }
    g.beginPath(); g.moveTo(-0.05, by - 0.2); g.lineTo(0, by - 0.42); g.lineTo(0.05, by - 0.2); g.closePath(); fs(FIN2, 0.03);
  }
  g.restore();
}
// A leafy indoor shade tree in a round planter.
function shadeTree(x, y){
  shadow(x, y, 0.42, 0.14);
  cylinder(x, y - 0.02, 0.36, 0.3, '#b08968', '#c9a27e');
  ell(x, y - 0.33, 0.3, 0.09); fs('#6b4a3a', 0);
  rr(x - 0.07, y - 1.5, 0.14, 1.2, 0.05); fs('#8a6040');
  for (const [dx, dy, r, c] of [[-0.32, -1.55, 0.36, '#4fa85e'], [0.32, -1.6, 0.36, '#4fa85e'], [0, -1.95, 0.42, '#5bbf6a'], [-0.18, -1.75, 0.34, '#66c776'], [0.2, -1.8, 0.32, '#5bbf6a']]){ circ(x + dx, y + dy, r); fs(c); }
  for (const [dx, dy] of [[-0.1, -2.05], [0.18, -1.7], [-0.3, -1.6]]){ circ(x + dx, y + dy, 0.06); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
}
// Claw machine: a glass case full of plushies, and a claw that drifts about (and dives when someone's playing).
function clawMachine(x, y, r, t, live){
  const cx = x + 0.5, base = y + 0.3;
  shadow(cx, y + 0.84, 0.42, 0.1);
  box(x + 0.12, base, 0.76, 0.52, 0.52, '#ff8fc8', r === 2 ? '#e8569b' : '#ff5fa2');
  const top = base + 0.52 - 0.52 - 0.95;
  rr(x + 0.14, top, 0.72, 0.95, 0.04); fs('rgba(205,238,255,.55)', 0.04);
  const cols = ['#ffd23f', '#5cc8bf', '#e0a96d', '#ff8fab', '#7bd389', '#9b7bff'];
  for (let i = 0; i < 9; i++){ circ(x + 0.24 + (i % 5) * 0.13 + (i > 4 ? 0.06 : 0), top + 0.86 - (i > 4 ? 0.1 : 0), 0.065); fs(cols[i % cols.length], 0.018); }
  const k = live ? live.k : 0;
  const sway = live ? Math.sin(k * 9) * 0.2 * (k < 0.7 ? 1 : 0) : Math.sin(t * 0.9) * 0.18;
  const drop = live && k >= 0.7 ? Math.sin((k - 0.7) / 0.3 * Math.PI) * 0.5 : 0;
  const clx = cx + sway, cly = top + 0.22 + drop;
  g.beginPath(); g.moveTo(clx, top + 0.05); g.lineTo(clx, cly); g.strokeStyle = '#7a8a8a'; g.lineWidth = 0.02; g.stroke();
  rr(clx - 0.05, cly - 0.03, 0.1, 0.05, 0.02); fs('#a0a8b0', 0.015);
  for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(clx + sx * 0.04, cly + 0.02); g.quadraticCurveTo(clx + sx * 0.1, cly + 0.08, clx + sx * 0.05, cly + 0.13); g.strokeStyle = '#a0a8b0'; g.lineWidth = 0.025; g.stroke(); }
  rr(x + 0.1, top - 0.2, 0.8, 0.22, 0.05); fs('#7b2cbf', 0.035);
  for (let i = 0; i < 5; i++){ circ(x + 0.22 + i * 0.14, top - 0.09, 0.025); fs(live ? `hsl(${(t * 400 + i * 70) % 360},95%,65%)` : '#ffe9a8', 0); }
  if (r === 0){ rr(x + 0.3, base + 0.52 - 0.4, 0.4, 0.16, 0.03); fs('#3d2b35', 0.02); circ(x + 0.42, base + 0.52 - 0.34, 0.035); fs('#ef476f', 0.015); rr(x + 0.58, base + 0.52 - 0.37, 0.04, 0.1, 0.015); fs('#fff', 0.015); }
  else if (r !== 2){ rr(r === 1 ? x + 0.14 : x + 0.8, base + 0.52 - 0.42, 0.06, 0.2, 0.02); fs('#3d2b35', 0.02); }
}
function gumball(x, y){
  shadow(x, y, 0.22, 0.07);
  rr(x - 0.18, y - 0.12, 0.36, 0.12, 0.04); fs('#c0392b', 0.03);
  rr(x - 0.1, y - 0.5, 0.2, 0.4, 0.05); fs('#e63946', 0.035);
  rr(x - 0.05, y - 0.38, 0.1, 0.08, 0.02); fs('#e9e1d4', 0.02);
  circ(x, y - 0.72, 0.24); fs('rgba(232,248,255,.9)', 0.035);
  const cols = ['#ff6b8b', '#ffd23f', '#5cc8bf', '#9b7bff', '#ff9f43', '#7bd389'];
  for (let i = 0; i < 9; i++){ const a = i * 2.4, rr2 = 0.05 + (i % 3) * 0.05; circ(x + Math.cos(a) * rr2, y - 0.68 + Math.sin(a) * rr2 * 0.8, 0.045); fs(cols[i % cols.length], 0.012); }
  rr(x - 0.08, y - 0.99, 0.16, 0.07, 0.03); fs('#e63946', 0.03);
}
function directory(x, y, r){
  shadow(x + 0.5, y + 0.82, 0.38, 0.08);
  if (r === 1 || r === 3){
    rr(x + 0.45, y + 0.82 - 1.0, 0.1, 1.0, 0.03); fs('#4a4f6a', 0.03);
    rr(x + 0.42, y + 0.82 - 1.45, 0.16, 0.78, 0.04); fs('#7b6fd6', 0.035);
    return;
  }
  for (const px of [x + 0.18, x + 0.74]){ rr(px, y + 0.82 - 0.75, 0.08, 0.75, 0.03); fs('#4a4f6a', 0.03); }
  rr(x + 0.08, y + 0.82 - 1.5, 0.84, 0.8, 0.06); fs('#7b6fd6', 0.04);
  if (r === 0){
    rr(x + 0.14, y + 0.82 - 1.36, 0.72, 0.6, 0.04); fs('#fffaf3', 0.025);
    const cols = ['#ff8fab', '#ffd23f', '#5a8dee', '#06a77d', '#ff9f43', '#9b7bff'];
    for (let i = 0; i < 6; i++){ rr(x + 0.18 + (i % 3) * 0.22, y + 0.82 - 1.3 + Math.floor(i / 3) * 0.33, 0.18, 0.13, 0.02); fs(cols[i], 0.012); }
    circ(x + 0.5, y + 0.82 - 0.98, 0.05); fs('#ef476f', 0.02);
    text('MAP', x + 0.5, y + 0.82 - 1.43, 0.1, '#fff', 700);
  }
}
// Sunny, the mall mascot: a big walking sun that waves at everyone.
export function mascot(x, y, o){
  const t = o.t || 0, s = o.s || 1, walking = !!o.walk;
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  shadow(0, 0, 0.34, 0.1);
  const sw = walking ? Math.sin(t * 9) : 0;
  for (const [lx, d] of [[-0.15, 1], [0.04, -1]]){ const lift = Math.max(0, sw * d) * 0.06; rr(lx, -0.32 - lift, 0.11, 0.3, 0.05); fs('#ff9f43'); ell(lx + 0.055, -0.035 - lift, 0.09, 0.045); fs('#e76f51', 0.03); }
  const cy = -0.86, R = 0.42;
  for (let i = 0; i < 12; i++){
    const a = i / 12 * Math.PI * 2 + Math.sin(t * 1.5) * 0.08;
    g.beginPath(); g.moveTo(Math.cos(a - 0.17) * R, cy + Math.sin(a - 0.17) * R); g.lineTo(Math.cos(a) * (R + 0.17), cy + Math.sin(a) * (R + 0.17)); g.lineTo(Math.cos(a + 0.17) * R, cy + Math.sin(a + 0.17) * R); g.closePath(); fs('#ff9f43', 0.03);
  }
  rr(-0.47, cy + 0.08, 0.1, 0.3, 0.05); fs('#ffd23f'); circ(-0.42, cy + 0.4, 0.07); fs('#fff', 0.03);
  circ(0, cy, R); fs('#ffd23f');
  ell(-0.14, cy - 0.06, 0.045, 0.06); fs(OUT, 0); ell(0.14, cy - 0.06, 0.045, 0.06); fs(OUT, 0);
  g.beginPath(); g.arc(0, cy + 0.04, 0.16, 0.25, Math.PI - 0.25); g.strokeStyle = OUT; g.lineWidth = 0.045; g.stroke();
  for (const cx of [-0.25, 0.25]){ circ(cx, cy + 0.07, 0.065); g.fillStyle = 'rgba(255,110,110,.45)'; g.fill(); }
  g.save(); g.translate(0.38, cy + 0.12); g.rotate(0.55 + Math.sin(t * 6) * 0.4);   // waving, out to the side
  rr(-0.05, -0.32, 0.1, 0.32, 0.05); fs('#ffd23f'); circ(0, -0.34, 0.075); fs('#fff', 0.03);
  g.restore();
  g.restore();
}
export function cylinder(cx, cy, r, h, side, top, z = 0){
  g.beginPath(); g.arc(cx, cy - z, r, 0, Math.PI); g.lineTo(cx - r, cy - z - h); g.arc(cx, cy - z - h, r, Math.PI, 0, true); g.closePath(); fs(side);
  circ(cx, cy - z - h, r); fs(top);
}
export function fountain(cx, cy, t, working){
  const r = 0.95, h = 0.32;
  shadow(cx, cy + 0.12, r * 1.05, r * 0.3, 0.12);
  cylinder(cx, cy, r, h, working ? '#cfc5b5' : '#b9b0a2', working ? '#e9e1d4' : '#d2c9bb');
  circ(cx, cy - h, r * 0.8);
  if (working){
    fs('#7fd3e6', 0.035);
    g.save(); circ(cx, cy - h, r * 0.79); g.clip();
    for (let k = 0; k < 3; k++){ const p = ((t * 0.35) + k / 3) % 1; circ(cx, cy - h, 0.3 + p * 0.5); g.strokeStyle = `rgba(255,255,255,${0.55 * (1 - p)})`; g.lineWidth = 0.03; g.stroke(); }
    for (const [a, b] of [[-0.45, 0.25], [0.5, 0.1], [0.2, 0.45], [-0.3, -0.35]]){ ell(cx + a, cy - h + b, 0.05, 0.035); fs('#ffd23f', 0.015); }
    g.restore();
  } else {
    fs('#a39a8c', 0.035);
    g.save(); circ(cx, cy - h, r * 0.79); g.clip(); g.fillStyle = 'rgba(70,60,50,.25)'; ell(cx + 0.1, cy - h + 0.15, 0.5, 0.3); g.fill();
    const R = mulberry(9); for (let i = 0; i < 6; i++){ g.save(); g.translate(cx + (R() - 0.5) * 1.2, cy - h + (R() - 0.5) * 1.0); g.rotate(R() * 3); g.fillStyle = 'rgba(240,235,220,.8)'; g.fillRect(-0.06, -0.04, 0.12, 0.08); g.restore(); }
    g.restore();
  }
  cylinder(cx, cy - h, 0.17, 0.5, working ? '#cfc5b5' : '#b9b0a2', working ? '#e9e1d4' : '#d2c9bb');
  cylinder(cx, cy - h - 0.5, 0.38, 0.1, working ? '#cfc5b5' : '#b9b0a2', working ? '#e9e1d4' : '#d2c9bb');
  circ(cx, cy - h - 0.6, 0.3); fs(working ? '#7fd3e6' : '#a39a8c', 0.03);
  if (working){
    for (let k = 0; k < 14; k++){
      const a = k / 14 * Math.PI * 2, p = (t * 0.9 + k * 0.137) % 1;
      const rad = 0.38 + p * 0.32, z = h + 0.62 + 0.2 * p - 0.82 * p * p;
      circ(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad - z, 0.035); g.fillStyle = 'rgba(200,240,255,.95)'; g.fill();
    }
  } else cobweb(cx - 0.38, cy - h - 0.6, 0.25, 1);
}
// Litter on the floor. Big, outlined and recognizable so it's easy to spot and tap on a phone.
export function trash(x, y, kind, t = 0, scale = 1){
  const drop = t < 0.25 ? (1 - t / 0.25) * 0.35 : 0;
  shadow(x, y + 0.04, 0.27 * scale, 0.08 * scale, 0.22);
  g.save(); g.translate(x, y - drop); g.scale(scale, scale);
  const lw = 0.035;
  switch (kind){
    case 'cup': {
      ell(0.14, 0.04, 0.2, 0.08); g.fillStyle = 'rgba(176,112,64,.6)'; g.fill();
      g.save(); g.rotate(-0.25);
      g.beginPath(); g.moveTo(-0.26, -0.13); g.lineTo(0.14, -0.1); g.lineTo(0.14, 0.06); g.lineTo(-0.26, 0.09); g.closePath(); fs('#ef476f', lw);
      g.fillStyle = '#fff'; g.fillRect(-0.16, -0.12, 0.08, 0.2);
      rr(0.12, -0.12, 0.07, 0.2, 0.03); fs('#f6f6f6', lw);
      g.beginPath(); g.moveTo(0.18, -0.02); g.lineTo(0.32, -0.04); g.lineTo(0.36, -0.16); g.strokeStyle = OUT; g.lineWidth = 0.06; g.stroke();
      g.beginPath(); g.moveTo(0.18, -0.02); g.lineTo(0.32, -0.04); g.lineTo(0.36, -0.16); g.strokeStyle = '#5cc8bf'; g.lineWidth = 0.032; g.stroke();
      g.restore(); break;
    }
    case 'bag': {
      g.beginPath(); g.moveTo(-0.22, 0.04); g.lineTo(-0.19, -0.2); g.lineTo(-0.12, -0.26); g.lineTo(-0.02, -0.21); g.lineTo(0.06, -0.28); g.lineTo(0.17, -0.22); g.lineTo(0.22, 0.03); g.quadraticCurveTo(0, 0.09, -0.22, 0.04); fs('#d9a066', lw);
      g.strokeStyle = 'rgba(61,43,53,.4)'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(-0.12, -0.18); g.lineTo(-0.06, -0.02); g.moveTo(0.08, -0.2); g.lineTo(0.03, -0.04); g.stroke();
      ell(0.08, -0.07, 0.05, 0.035); g.fillStyle = 'rgba(140,80,30,.35)'; g.fill();
      break;
    }
    case 'wrapper': {
      for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(sx * 0.1, -0.05); g.lineTo(sx * 0.27, -0.14); g.lineTo(sx * 0.24, 0.0); g.lineTo(sx * 0.28, 0.08); g.lineTo(sx * 0.1, 0.03); g.closePath(); fs('#ffd23f', lw); }
      ell(0, -0.01, 0.13, 0.09); fs('#ff5fa2', lw);
      g.strokeStyle = '#fff'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(-0.06, -0.05); g.lineTo(0.05, 0.03); g.stroke();
      break;
    }
    case 'can': {
      g.save(); g.rotate(0.2);
      rr(-0.22, -0.11, 0.42, 0.19, 0.05); fs('#118ab2', lw);
      g.fillStyle = '#ffd23f'; g.fillRect(-0.1, -0.1, 0.12, 0.17);
      ell(0.2, -0.015, 0.04, 0.095); fs('#c9c9d1', lw);
      g.beginPath(); g.moveTo(-0.02, -0.11); g.lineTo(0.02, -0.06); g.lineTo(-0.01, -0.01); g.strokeStyle = 'rgba(61,43,53,.5)'; g.lineWidth = 0.02; g.stroke();
      g.restore(); break;
    }
    case 'popcorn': {
      for (const [a, b] of [[0.2, 0.02], [0.28, -0.05], [0.12, 0.06], [-0.24, 0.04]]){ circ(a, b, 0.045); fs('#fff6c9', 0.02); }
      g.save(); g.rotate(-0.5);
      g.beginPath(); g.moveTo(-0.15, -0.22); g.lineTo(0.15, -0.22); g.lineTo(0.1, 0.08); g.lineTo(-0.1, 0.08); g.closePath();
      g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(-0.2, -0.25, 0.4, 0.4); g.fillStyle = '#ef476f'; for (const sx of [-0.12, 0.0, 0.12]) g.fillRect(sx - 0.03, -0.25, 0.06, 0.4); g.restore();
      fs(null, lw);
      for (const [a, b] of [[-0.08, -0.26], [0.02, -0.29], [0.1, -0.25]]){ circ(a, b, 0.05); fs('#fff6c9', 0.02); }
      g.restore(); break;
    }
    case 'banana': {
      for (const a of [-2.6, -0.5, 1.4]){
        g.save(); g.rotate(a);
        g.beginPath(); g.moveTo(0, -0.04); g.quadraticCurveTo(0.12, -0.1, 0.24, -0.02); g.quadraticCurveTo(0.14, 0.05, 0, 0.04); g.closePath(); fs('#ffd23f', lw);
        circ(0.22, -0.02, 0.025); fs('#7a5a2a', 0);
        g.restore();
      }
      circ(0, 0, 0.06); fs('#f4c430', lw);
      break;
    }
    case 'cone': {
      ell(0.1, 0.02, 0.2, 0.09); fs('#ff8fc8', lw);
      ell(0.05, -0.01, 0.07, 0.04); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
      g.save(); g.rotate(-0.6);
      g.beginPath(); g.moveTo(-0.08, -0.06); g.lineTo(-0.08, 0.06); g.lineTo(-0.34, 0.0); g.closePath(); fs('#e0a96d', lw);
      g.strokeStyle = 'rgba(122,74,40,.5)'; g.lineWidth = 0.015; g.beginPath(); g.moveTo(-0.14, -0.04); g.lineTo(-0.22, 0.03); g.moveTo(-0.2, -0.03); g.lineTo(-0.12, 0.04); g.stroke();
      g.restore(); break;
    }
    case 'lolly': {
      g.beginPath(); g.moveTo(-0.22, 0.06); g.lineTo(0.05, -0.04); g.strokeStyle = OUT; g.lineWidth = 0.05; g.stroke();
      g.beginPath(); g.moveTo(-0.22, 0.06); g.lineTo(0.05, -0.04); g.strokeStyle = '#fff'; g.lineWidth = 0.025; g.stroke();
      g.beginPath(); g.arc(0.13, -0.07, 0.11, 0.6, Math.PI * 1.9); fs('#9b5de5', lw);
      g.beginPath(); for (let a = 0; a < 9; a += 0.4){ const r = 0.012 * a; g.lineTo(0.13 + Math.cos(a) * r, -0.07 + Math.sin(a) * r); } g.strokeStyle = '#fff'; g.lineWidth = 0.022; g.stroke();
      break;
    }
    default: { // crumpled paper
      g.beginPath();
      const pts = [[-0.16, 0.0], [-0.12, -0.14], [0.0, -0.19], [0.13, -0.13], [0.17, 0.0], [0.08, 0.07], [-0.08, 0.07]];
      pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); fs('#fdfcf7', lw);
      g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.02; g.beginPath(); g.moveTo(-0.1, -0.08); g.lineTo(0.0, -0.02); g.lineTo(0.1, -0.1); g.moveTo(0.0, -0.02); g.lineTo(0.02, 0.06); g.stroke();
    }
  }
  g.restore();
  // Trash that's been sitting a while draws flies.
  if (t > 12){
    for (let i = 0; i < 2; i++){
      const a = t * 6 + i * Math.PI;
      const fx = x + Math.cos(a) * 0.18, fy = y - 0.38 + Math.sin(a * 1.3) * 0.08;
      ell(fx - 0.02, fy - 0.025, 0.025, 0.014); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
      circ(fx, fy, 0.022); fs(OUT, 0);
    }
  }
}
export function pigeon(x, y, t){
  const peck = Math.max(0, Math.sin(t * 3.1)) ** 6;
  shadow(x, y, 0.13, 0.05, 0.18);
  g.save(); g.translate(x, y);
  g.strokeStyle = '#e48a5a'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(-0.03, -0.06); g.lineTo(-0.03, 0); g.moveTo(0.03, -0.06); g.lineTo(0.03, 0); g.stroke();
  ell(0, -0.13, 0.15, 0.1); fs('#9c95ae', 0.035);
  ell(-0.03, -0.12, 0.08, 0.05, 0.3); fs('#857e98', 0);
  const hx = 0.12 + peck * 0.05, hy = -0.24 + peck * 0.12;
  circ(hx, hy, 0.075); fs('#8fc6b2', 0.035);
  g.beginPath(); g.moveTo(hx + 0.07, hy - 0.01); g.lineTo(hx + 0.13, hy + 0.01); g.lineTo(hx + 0.07, hy + 0.025); fs('#e48a5a', 0.02);
  circ(hx + 0.025, hy - 0.015, 0.014); fs(OUT, 0);
  g.restore();
}
export function storageJunk(x, y, seed){
  const R = mulberry(seed), k = R();
  if (k < 0.35) cardboard(x + 0.15, y + 0.3, 0.55, 0.45, 0.4);
  else if (k < 0.55){ cardboard(x + 0.1, y + 0.35, 0.5, 0.4, 0.35); cardboard(x + 0.18, y + 0.42, 0.36, 0.28, 0.28, 0.35); }
  else if (k < 0.7) box(x + 0.1, y + 0.3, 0.8, 0.35, 0.5, '#9d8f7c', '#857663');
  else if (k < 0.8) deadPlant(x + 0.5, y + 0.7);
}
