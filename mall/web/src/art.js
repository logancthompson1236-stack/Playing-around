// Vector painters. Everything draws in tile units on the current context `g`; PPT is device pixels per tile.
// The renderer and the UI (portraits, intro panels) both call these.
export const OUT = '#3d2b35';
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
  else if (kind === 'cinema'){ checker(0.5, '#5b2a3e', '#53263a'); grid(1, 'rgba(255,210,63,.12)', 0.02); }
  else if (kind === 'bounce'){ checker(1, '#e9f3ff', '#d9e8fb'); grid(1, 'rgba(90,141,238,.2)', 0.03); }
  else if (kind === 'mint'){ checker(1, '#e3f6ea', '#c9ecd8'); grid(1, 'rgba(60,140,100,.2)', 0.025); }
  else if (kind === 'wood'){ planks('#ead2ac', '#e2c69b', 'rgba(120,80,40,.2)'); }
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
function face(o){
  if (o.stache){
    for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(0, -0.81); g.quadraticCurveTo(sx * 0.12, -0.84, sx * 0.17, -0.77); g.quadraticCurveTo(sx * 0.1, -0.75, 0, -0.78); fs('#f2f2f2', 0.03); }
    g.strokeStyle = '#cfcfcf'; g.lineWidth = 0.04; g.beginPath(); g.moveTo(-0.15, -0.95); g.lineTo(-0.05, -0.94); g.moveTo(0.05, -0.94); g.lineTo(0.15, -0.95); g.stroke();
  }
  for (const sx of [-1, 1]){
    if (o.mood === 'happy'){ g.beginPath(); g.arc(sx * 0.095, -0.85, 0.035, Math.PI + 0.3, -0.3); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); }
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
  shadow(0, 0, 0.24, 0.085, 0.22);
  const ph = t * 9, sw = walking ? Math.sin(ph) : 0;
  const bob = walking ? Math.abs(Math.sin(ph)) * 0.035 : Math.sin(t * 2) * 0.005;
  const lL = Math.max(0, sw) * 0.05, lR = Math.max(0, -sw) * 0.05;
  for (const [lx, lift] of [[-0.13, lL], [0.02, lR]]){
    rr(lx, -0.27 - lift, 0.11, 0.24, 0.05); fs(o.pants);
    ell(lx + 0.055, -0.035 - lift, 0.075, 0.04); fs(o.shoe || '#4a3a44', 0.03);
  }
  g.translate(0, -bob);
  if (o.back && o.hood){ circ(0, -0.88, 0.31); fs(o.shirt); }
  if (o.hairStyle === 'long' && !o.back){ rr(-0.3, -1.05, 0.6, 0.6, 0.26); fs(o.hair); }
  rr(-0.2, -0.63, 0.4, 0.43, 0.14); fs(o.shirt);
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
  for (const [ax, dir] of [[-0.215, 1], [0.215, -1]]){
    if (o.play){
      // Hands up on the controls, jiggling away.
      const jig = Math.sin(t * 22 + ax * 10) * 0.025;
      rr(ax - 0.055, -0.62 + jig, 0.11, 0.24, 0.055); fs(o.sleeve || o.shirt);
      circ(ax * 0.85, -0.66 + jig, 0.055); fs(o.skin, 0.035);
      continue;
    }
    const swing = o.torch !== undefined && ax > 0 ? 0 : sw * dir * 0.04;
    rr(ax - 0.055, -0.6 + swing, 0.11, 0.28, 0.055); fs(o.sleeve || o.shirt);
    circ(ax, -0.31 + swing, 0.055); fs(o.skin, 0.035);
  }
  if (o.hold && !o.back) heldItem(o.hold, 0.235, -0.31, o.bagColor, o.prize);
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
  } else {
    hairFront(o); face(o);
    if (o.hold === 'gum'){ const r = 0.03 + Math.abs(Math.sin(t * 1.3)) * 0.08; circ(0.03, -0.77, r); fs('rgba(255,143,200,.92)', 0.025); }
  }
  g.restore();
}
// Something a shopper bought, held in the right hand at (hx, hy).
function heldItem(kind, hx, hy, color, prize){
  switch (kind){
    case 'cone':
      g.beginPath(); g.moveTo(hx - 0.06, hy - 0.06); g.lineTo(hx + 0.06, hy - 0.06); g.lineTo(hx, hy + 0.1); g.closePath(); fs('#e0a96d', 0.025);
      circ(hx, hy - 0.11, 0.07); fs('#ff8fc8', 0.025); circ(hx + 0.01, hy - 0.19, 0.05); fs('#7ed6c8', 0.025); break;
    case 'coffee':
      rr(hx - 0.05, hy - 0.13, 0.1, 0.15, 0.02); fs('#fff', 0.025); rr(hx - 0.055, hy - 0.16, 0.11, 0.04, 0.015); fs('#8a5a44', 0.02);
      g.fillStyle = '#c98b55'; g.fillRect(hx - 0.05, hy - 0.08, 0.1, 0.035); break;
    case 'pretzel': pretzelIcon(hx, hy - 0.06, 0.11); break;
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
  const kx = x + (o.flip ? 0.38 : -0.38);
  person(kx, y + 0.12 + (o.kidBob || 0), { ...k, t: (o.t || 0) + 0.3, walk: o.walk, flip: o.flip, s: 0.68, play: o.play || o.kidPlay, back: o.back });
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
};
const FLOOR_KIND = { classic: 'concourse', diner: 'diner', terracotta: 'terracotta', flagstone: 'flagstone', herring: 'herring', marble: 'marble' };
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
export function mallBackWall(w, id = style.wall){
  const P = wallpaper(id), top = -WALL_H;
  g.save(); g.beginPath(); g.rect(0, top, w, WALL_H); g.clip();
  g.fillStyle = P.face; g.fillRect(0, top, w, WALL_H);
  wallPattern(id, P, w, top);
  g.restore();
  g.fillStyle = P.base; g.fillRect(0, -0.22, w, 0.22);
  g.fillStyle = 'rgba(45,30,40,.15)'; g.fillRect(0, -0.06, w, 0.06);
  g.beginPath(); g.rect(0, top, w, WALL_H); fs(null);
  rr(-0.15, top - 0.22, w + 0.3, 0.22, 0.04); fs(P.cap);
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
    if (isOpen(u)){
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
    box(u.x - 0.04, u.y + u.h - 0.1, u.w + 0.08, 0.16, 0.42, wl, wd);
  }
  if (isOpen(u)) storeFurniture(u, def, t, 'back');
  // The sign goes up last so tall back shelves and cabinets never cover the store's name.
  if (u.face === 'down' && isOpen(u)){
    // Neon names glow on a dark plate so they read in daylight too.
    const lit = def.icon === 'joystick' || def.icon === 'film';
    rr(u.x + 0.2, u.y - 0.98, u.w - 0.4, 0.42, 0.12); fs(lit ? '#2b2340' : '#fffaf3');
    if (lit) neon(def.name, u.x + u.w / 2, u.y - 0.77, 0.27, def.icon === 'film' ? '#ffd23f' : '#ff5fa2', u.w - 0.6);
    else text(def.name, u.x + u.w / 2, u.y - 0.76, 0.27, shade(def.color, -0.3), 700, 'Fredoka', u.w - 0.6);
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
  const queue = [at(W - 0.55, Math.min(1.75, H - 0.25)), at(Math.max(0.45, W - 1.3), Math.min(1.75, H - 0.25))];
  if (H >= 3) queue.push(at(W - 0.55, 2.55));
  const browse = [];
  for (let ly = 0.9; ly <= H - 0.35; ly += 0.55) for (let lx = 0.4; lx <= W - 1.35; lx += 0.45) browse.push(at(lx, ly));
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
    queue: [{ x: cx + 0.05, y: k.y + 1.5 }, { x: cx - 0.65, y: k.y + 1.62 }, { x: cx + 0.75, y: k.y + 1.62 }],
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

const JAR = ['#ff6b8b', '#ffd23f', '#5cc8bf', '#9b7bff', '#ff9f43', '#7bd389', '#5a8dee'];
function goods(x, y, w, rows, seed, cols = JAR){
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
function shelf(x, y, w, d, h, items, seed){
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
function counter(u, def){
  const sp = storeSpots(u), [cx, cy, cw, cd] = sp.counter;
  box(cx, cy, cw, cd, 0.48, shade(def.color, 0.75), def.color);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(cx + 0.05, cy + cd - 0.3, cw - 0.1, 0.05);
  if (def.icon === 'cup'){ box(cx + 0.1, cy + 0.04, 0.32, 0.22, 0.28, '#c0c0c8', '#8a8a95', 0.48); }
  else { box(cx + cw - 0.45, cy + 0.06, 0.34, 0.2, 0.18, '#6b5b7b', '#4d4060', 0.48); }
}
// Store furniture split across sort layers: 'back' items sit along the back wall, 'mid' items stand in the room.
export function storeFurniture(u, def, t, layer){
  const W = u.w, H = u.h, ic = def.icon;
  if (ic === 'wc') return restroomFurniture(u, layer);
  if (def.attraction){ if (layer === 'back') attractionBack(u, def, t); return; }
  const sw = Math.max(0.6, W - 1.25);
  if (layer === 'back'){
    const [x, y] = local(u, 0.1, 0.08, sw, 0.4);
    if (ic === 'joystick'){
      for (let i = 0; i < Math.floor(sw / 0.75); i++){
        const cx = x + i * 0.78, hue = ['#5a8dee', '#ef476f', '#06d6a0'][i % 3];
        box(cx, y, 0.68, 0.42, 0.9, shade(hue, -0.3), hue);
        rr(cx + 0.09, y + 0.42 - 0.9 + 0.2, 0.5, 0.34, 0.04); fs(`hsl(${(t * 50 + i * 120 + u.id * 40) % 360},85%,62%)`, 0.035);
      }
    } else if (ic === 'candy') shelf(x, y, sw, 0.4, 0.75, 'jars', u.id);
    else if (ic === 'book') shelf(x, y, sw, 0.4, 0.95, 'books', u.id);
    else if (ic === 'paw') shelf(x, y, sw, 0.4, 0.7, 'tanks', u.id);
    else if (ic === 'shirt') shelf(x, y, sw, 0.36, 0.85, 'rack', u.id);
    else if (ic === 'record'){
      // Record crates along the back, with a couple of posters above.
      box(x, y, sw, 0.4, 0.55, '#3d405b', '#2b2d42');
      const R = mulberry(u.id * 7);
      for (let px = x + 0.08; px < x + sw - 0.2; px += 0.2){ rr(px, y + 0.4 - 0.55 - 0.24, 0.17, 0.26, 0.02); fs(JAR[Math.floor(R() * JAR.length)], 0.02); circ(px + 0.085, y + 0.4 - 0.55 - 0.12, 0.05); fs('#2b2d42', 0); }
      // Posters hang above the crates, except on a back wall that already holds the sign.
      if (u.face !== 'down'){ rr(x + 0.1, y - 1.05, 0.38, 0.42, 0.03); fs('#ffd23f', 0.03); circ(x + 0.29, y - 0.84, 0.12); fs('#2b2d42', 0.02); }
      if (sw > 0.9 && u.face !== 'down'){ rr(x + 0.6, y - 1.0, 0.34, 0.36, 0.03); fs('#ef476f', 0.03); text('♪', x + 0.77, y - 0.82, 0.26, '#fff', 700); }
    }
    else if (ic === 'tv'){
      // A wall of TVs, all showing the same flickering channel.
      const n = Math.max(1, Math.floor(sw / 0.62));
      for (let i = 0; i < n; i++) for (let row = 0; row < 2; row++){
        const cx = x + 0.04 + i * (sw - 0.08) / n, bw = (sw - 0.08) / n - 0.06, by = y + 0.4 - row * 0.38;
        box(cx, by - 0.4, bw, 0.4, 0.36, '#4a5058', '#2f343a');
        rr(cx + 0.06, by - 0.4 - 0.31, bw - 0.12, 0.24, 0.05); fs(`hsl(${(t * 40 + i * 30 + row * 60) % 360},70%,${62 + Math.sin(t * 9 + i) * 6}%)`, 0.025);
      }
    }
    else if (ic === 'cup'){ box(x, y, sw, 0.36, 0.6, '#6b4a3a', '#8a5a44'); for (let i = 0; i < 3; i++){ rr(x + 0.08 + i * 0.18, y + 0.36 - 0.6 - 0.2, 0.12, 0.18, 0.03); fs('#ffe8c2', 0.02); } }
    else shelf(x, y, sw, 0.4, 0.7, 'goods', u.id);
    return;
  }
  if (layer === 'counter'){ counter(u, def); return; }
  // Mid-room pieces
  if (ic === 'dollar' && H >= 3){ const [x, y] = local(u, 0.3, 1.9, Math.max(0.6, W - 1.6), 0.36); shelf(x, y, Math.max(0.6, W - 1.6), 0.36, 0.5, 'goods', u.id + 5); }
  if (ic === 'candy'){ const [x, y] = local(u, 0.3, 1.25, 0.3, 0.2); box(x, y, 0.3, 0.2, 0.3, '#e8577e', '#c23e63'); circ(x + 0.15, y - 0.45, 0.2); fs('rgba(230,248,255,.9)', 0.035); for (let i = 0; i < 5; i++){ circ(x + 0.07 + (i % 3) * 0.08, y - 0.42 - Math.floor(i / 3) * 0.08, 0.04); fs(JAR[i], 0.012); } }
  if (ic === 'joystick' && H >= 3){ const [x, y] = local(u, 0.25, 1.8, 0.7, 0.55); box(x, y, 0.7, 0.55, 1.0, '#ffd23f', '#ffb703'); rr(x + 0.07, y + 0.55 - 0.92, 0.56, 0.45, 0.04); fs('rgba(210,240,255,.9)', 0.03); circ(x + 0.22, y + 0.05, 0.07); fs('#ff8fab', 0.02); circ(x + 0.45, y + 0.08, 0.07); fs('#7bd389', 0.02); }
  if (ic === 'shirt' && H >= 3){ const [x, y] = local(u, 0.35, 2.0); shadow(x, y, 0.18, 0.06); rr(x - 0.03, y - 0.35, 0.06, 0.35, 0.02); fs('#a89a8a', 0.025); rr(x - 0.16, y - 0.82, 0.32, 0.45, 0.12); fs('#ff8fab'); circ(x, y - 0.98, 0.14); fs('#efe4d6'); }
  if (ic === 'paw' && H >= 3){ const [x, y] = local(u, 0.25, 1.55, 1.1, 0.9); rr(x, y, 1.1, 0.9, 0.06); fs('rgba(255,248,220,.9)', 0.035); g.strokeStyle = '#b08968'; g.lineWidth = 0.04; g.beginPath(); for (let i = 0; i <= 5; i++){ g.moveTo(x + i * 0.22, y + 0.9); g.lineTo(x + i * 0.22, y + 0.9 - 0.3); } g.moveTo(x, y + 0.6); g.lineTo(x + 1.1, y + 0.6); g.stroke(); puppy(x + 0.55, y + 0.55, t); }
  if (ic === 'cup'){ const [x, y] = local(u, 0.45, 1.5); shadow(x, y + 0.02, 0.22, 0.07); rr(x - 0.03, y - 0.38, 0.06, 0.38, 0.02); fs('#6b4a3a', 0.025); ell(x, y - 0.42, 0.22, 0.12); fs('#f2e3cf'); rr(x - 0.05, y - 0.55, 0.1, 0.1, 0.02); fs('#fff', 0.02); }
  if (ic === 'record' && H >= 3){ const [x, y] = local(u, 0.3, 2.0, 0.6, 0.4); box(x, y, 0.6, 0.4, 0.45, '#ffd23f', '#e0b52f'); circ(x + 0.3, y - 0.26, 0.15); fs('#2b2d42', 0.03); circ(x + 0.3, y - 0.26, 0.04); fs('#ef476f', 0); g.beginPath(); g.arc(x + 0.52, y - 0.12, 0.08, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.03; g.stroke(); }
  if (ic === 'tv' && H >= 3){ const [x, y] = local(u, 0.3, 1.9, 1.2, 0.5); box(x, y, 1.2, 0.5, 0.45, '#e9e1d4', '#c9bfb0'); rr(x + 0.12, y - 0.36, 0.26, 0.16, 0.03); fs('#ffd23f', 0.025); rr(x + 0.5, y - 0.38, 0.2, 0.22, 0.03); fs('#a0a8b0', 0.025); rr(x + 0.84, y - 0.36, 0.24, 0.14, 0.04); fs('#ef476f', 0.025); }
  if (ic === 'book' && H >= 3){ const [x, y] = local(u, 0.3, 2.05); box(x - 0.2, y - 0.35, 0.45, 0.35, 0.35, '#e07a5f', '#c0583f'); }
}
// Restrooms: stalls with toilets along the back, sinks on a counter by the door.
// roomState holds each restroom's live state (which stalls are taken), set by the renderer.
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
function toilet(cx, backY, bowlY){
  shadow(cx, bowlY + 0.2, 0.18, 0.06, 0.15);
  box(cx - 0.17, backY, 0.34, 0.14, 0.4, '#ffffff', '#e8eef0', 0, 0.05, 0.035);
  rr(cx - 0.19, backY - 0.3, 0.38, 0.06, 0.03); fs('#f4f8f9', 0.03);
  rr(cx + 0.06, backY - 0.17, 0.08, 0.03, 0.015); fs('#a0a8b0', 0.015);
  rr(cx - 0.13, backY - 0.12, 0.26, 0.24, 0.1); fs('#f0f5f6', 0.03);
  g.beginPath(); g.moveTo(cx - 0.08, bowlY + 0.06); g.lineTo(cx - 0.06, bowlY + 0.21); g.lineTo(cx + 0.06, bowlY + 0.21); g.lineTo(cx + 0.08, bowlY + 0.06); g.closePath(); fs('#e8eef0', 0.03);
  ell(cx, bowlY, 0.16, 0.12); fs('#ffffff', 0.035);
  ell(cx, bowlY + 0.005, 0.11, 0.08); fs('#eef4f5', 0.02);
  ell(cx, bowlY + 0.015, 0.07, 0.05); fs('#bfe7f7', 0);
}
function restroomFurniture(u, layer){
  const st = roomState.get(u), sp = restroomSpots(u), down = u.face === 'down';
  if (layer === 'back'){
    for (let i = 0; i < sp.stalls.length; i++){
      const s0 = sp.stalls[i], taken = st && st.inside && st.inside[i];
      // Stalls stand a little off the back wall so their tops stay under the sign.
      const D = 1.0, [x, y] = local(u, s0.lx, 0.3, s0.sw, D);
      // Toilet: tank against the back of the stall, bowl in front of it.
      const back = down ? y : y + D - 0.25, bowlY = down ? y + 0.36 : y + 0.45;
      if (down || !taken) toilet(x + s0.sw / 2, back, bowlY);
      // Partitions either side, and the door: shut (with a red light) when someone's in, swung open when free.
      box(x - 0.03, y, 0.06, D, 0.85, '#bfe7e3', '#9fd6d0');
      if (i === sp.stalls.length - 1) box(x + s0.sw - 0.03, y, 0.06, D, 0.85, '#bfe7e3', '#9fd6d0');
      const dy = down ? y + D - 0.05 : y;
      if (taken) box(x + 0.04, dy, s0.sw - 0.08, 0.05, 0.78, '#7fcfc6', '#5cc8bf');
      else box(x + 0.04, dy - (down ? 0.25 : 0), 0.05, 0.3, 0.78, '#7fcfc6', '#5cc8bf');
      // A rail across the top of the doorway, with the light on it: red when someone's in, green when it's free.
      rr(x - 0.03, dy - 0.86, s0.sw + 0.06, 0.07, 0.02); fs('#9fd6d0', 0.025);
      circ(x + s0.sw / 2, dy - 0.825, 0.04); fs(taken ? '#ef476f' : '#4cc38a', 0.015);
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
    box(x, down ? y + 0.16 : y - 0.26, 0.6, 0.1, 0.55, '#e05a4f', '#a83226');
  }
}
function puppy(x, y, t){
  const hop = Math.max(0, Math.sin(t * 3)) * 0.06;
  shadow(x, y, 0.16, 0.05);
  ell(x, y - 0.14 - hop, 0.17, 0.11); fs('#e9c46a', 0.03);
  circ(x + 0.15, y - 0.26 - hop, 0.1); fs('#e9c46a', 0.03);
  ell(x + 0.1, y - 0.33 - hop, 0.04, 0.07, -0.4); fs('#b08968', 0.02);
  circ(x + 0.18, y - 0.27 - hop, 0.015); fs(OUT, 0);
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
    if (isOpen(u)){
      rr(sx - Math.min(1.1, u.w / 2 - 0.05), top - 0.05, Math.min(2.2, u.w - 0.1), 0.4, 0.1); fs(def.color);
      text(def.name, sx, top + 0.15, 0.23, '#fffaf3', 700, 'Fredoka', Math.min(2.0, u.w - 0.3));
    } else if (u.state === 'vacant') forLease(sx, top + 0.15, 0.04, 0.8);
  }
  if (u.face === 'down' && u.state === 'store' && def.icon === 'joystick'){
    g.save(); g.shadowColor = '#ff5fa2'; g.shadowBlur = 0.3 * PPT; rr(u.x + 0.08, yF + 0.14 - 0.44, u.w - 0.16, 0.04, 0.02); g.fillStyle = '#ff9cc8'; g.fill(); g.restore();
  }
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
  if (def.icon === 'cone'){
    // Tubs of ice cream under a glass sneeze guard.
    rr(x + 0.12, y - 0.55, 1.16, 0.22, 0.05); fs('rgba(220,245,255,.85)', 0.03);
    ['#ff8fc8', '#7ed6c8', '#fff3d6', '#8a5a44'].forEach((c, i) => { ell(x + 0.3 + i * 0.27, y - 0.42, 0.11, 0.06); fs(c, 0.025); });
  } else for (const px of [x + 0.35, x + 0.7, x + 1.05]) pretzelIcon(px, y - 0.36, 0.17);
  const top = y - 1.6, x0 = x - 0.12, x1 = x + 1.52;
  g.save(); g.beginPath(); g.moveTo(x0, top + 0.3); g.lineTo(x + 0.15, top); g.lineTo(x + 1.25, top); g.lineTo(x1, top + 0.3); g.closePath(); g.clip();
  g.fillStyle = def.color; g.fillRect(x0, top, x1 - x0, 0.3); g.fillStyle = '#fff3e0';
  for (let i = 0; i < 6; i += 2) g.fillRect(x0 + i * (x1 - x0) / 6, top, (x1 - x0) / 6, 0.3);
  g.restore();
  g.beginPath(); g.moveTo(x0, top + 0.3); g.lineTo(x + 0.15, top); g.lineTo(x + 1.25, top); g.lineTo(x1, top + 0.3); g.closePath(); fs(null);
  for (let i = 0; i < 6; i++){ const cx = x0 + (i + 0.5) * (x1 - x0) / 6; g.beginPath(); g.arc(cx, top + 0.3, (x1 - x0) / 12, 0, Math.PI); fs(i % 2 ? def.color : '#fff3e0', 0.04); }
  rr(x + 0.3, top - 0.3, 0.8, 0.26, 0.08); fs('#fff8ec', 0.04); text(def.name, x + 0.7, top - 0.17, 0.12, '#c23e1e', 700, 'Fredoka', 0.72);
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
  shadow(x, y, 0.22, 0.08);
  rr(x - 0.18, y - 0.46, 0.36, 0.46, 0.06); fs('#5cb88a');
  g.strokeStyle = 'rgba(61,43,53,.3)'; g.lineWidth = 0.02; for (const dx of [-0.07, 0.07]){ g.beginPath(); g.moveTo(x + dx, y - 0.4); g.lineTo(x + dx, y - 0.06); g.stroke(); }
  rr(x - 0.22, y - 0.55, 0.44, 0.13, 0.06); fs('#3f9a72');
}
/* ---------- Decor with a facing: rot 0 faces the camera, 1 faces left, 2 faces away, 3 faces right ---------- */
const BENCH = { back: ['#f0b57e', '#d08e57'], seat: ['#f3c08c', '#c98b55'], legs: '#7a5a44', backH: 0.72, seatH: 0.32 };
const SOFA = { back: ['#e891b3', '#c86a90'], seat: ['#f4a9c6', '#d47fa1'], legs: '#5a3a44', backH: 0.78, seatH: 0.38, arms: ['#e891b3', '#b85f84'] };
// Live state for decor (is someone using it, and how far along), set by the renderer.
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
    case 'vending': vending(x, y, r); break;
    case 'ride': kiddieRide(x, y, r, t, live); break;
    case 'claw': clawMachine(x, y, r, t, live); break;
    case 'gumball': gumball(x + 0.5, y + 0.8); break;
    case 'directory': directory(x, y, r); break;
    case 'tree': shadeTree(x + 0.5, y + 0.85); break;
  }
}
function seatPiece(x, y, r, st){
  const legs = (pts) => { for (const [lx, ly] of pts){ rr(lx, ly, 0.1, 0.1, 0.02); fs(st.legs, 0.03); } };
  if (r === 0 || r === 2){
    shadow(x + 1, y + 0.62, 1.0, 0.12, 0.15);
    const backY = r === 0 ? y + 0.15 : y + 0.56, seatY = r === 0 ? y + 0.27 : y + 0.2;
    if (r === 0) box(x + 0.1, backY, 1.8, 0.12, st.backH, st.back[0], st.back[1]);
    box(x + 0.1, seatY, 1.8, 0.36, st.seatH, st.seat[0], st.seat[1]);
    if (st.arms) for (const ax of [x + 0.02, x + 1.84]) box(ax, y + 0.18, 0.14, 0.5, st.seatH + 0.16, st.arms[0], st.arms[1]);
    if (r === 2) box(x + 0.1, backY, 1.8, 0.12, st.backH, st.back[0], st.back[1]);
    legs([[x + 0.2, y + 0.6], [x + 1.7, y + 0.6]]);
  } else {
    shadow(x + 0.5, y + 1.92, 0.32, 0.1, 0.15);
    const backX = r === 1 ? x + 0.64 : x + 0.24, seatX = r === 1 ? x + 0.22 : x + 0.36;
    if (st.arms) box(x + 0.22, y + 0.02, 0.56, 0.14, st.seatH + 0.16, st.arms[0], st.arms[1]);
    if (r === 3) box(backX, y + 0.1, 0.12, 1.8, st.backH, st.back[0], st.back[1]);
    box(seatX, y + 0.1, 0.42, 1.8, st.seatH, st.seat[0], st.seat[1]);
    if (r === 1) box(backX, y + 0.1, 0.12, 1.8, st.backH, st.back[0], st.back[1]);
    if (st.arms) box(x + 0.22, y + 1.84, 0.56, 0.14, st.seatH + 0.16, st.arms[0], st.arms[1]);
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
function vending(x, y, r){
  const bx = x + 0.12, by = y + 0.3, bw = 0.76, bd = 0.5, H = 1.3;
  shadow(x + 0.5, y + 0.82, 0.42, 0.1);
  box(bx, by, bw, bd, H, '#c23e63', r === 2 ? '#b8355a' : '#ef476f');
  const top = by + bd - H;
  if (r === 0){
    rr(bx + 0.06, top + 0.1, 0.44, 0.92, 0.04); fs('rgba(200,235,250,.95)', 0.03);
    for (let row = 0; row < 4; row++) for (let i = 0; i < 3; i++){ rr(bx + 0.1 + i * 0.13, top + 0.16 + row * 0.22, 0.09, 0.16, 0.03); fs(['#118ab2', '#ffd23f', '#06d6a0', '#ff9f43'][(row + i) % 4], 0.015); }
    for (let i = 0; i < 4; i++){ rr(bx + 0.56, top + 0.16 + i * 0.13, 0.14, 0.08, 0.02); fs('#fff6ea', 0.015); }
    rr(bx + 0.58, top + 0.75, 0.1, 0.16, 0.02); fs('#3d2b35', 0);
    rr(bx + 0.1, top + 1.08, 0.4, 0.12, 0.03); fs('#3d2b35', 0.02);
  } else if (r === 2){
    g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.025;
    for (let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(bx + 0.15, top + 0.2 + i * 0.08); g.lineTo(bx + bw - 0.15, top + 0.2 + i * 0.08); g.stroke(); }
  } else {
    // Side on: a white swoosh, and the edge of the glass front on the side it faces.
    g.save(); rr(bx, top, bw, H, 0.05); g.clip();
    g.beginPath(); g.moveTo(bx, top + 0.9); g.quadraticCurveTo(bx + bw / 2, top + 0.55, bx + bw, top + 0.75); g.lineTo(bx + bw, top + 0.85); g.quadraticCurveTo(bx + bw / 2, top + 0.65, bx, top + 1.0); g.closePath(); g.fillStyle = '#fff6ea'; g.fill();
    g.restore();
    const ex = r === 1 ? bx : bx + bw - 0.08;
    rr(ex, top + 0.08, 0.08, 1.0, 0.02); fs('rgba(200,235,250,.95)', 0.02);
  }
}
function kiddieRide(x, y, r, t, live){
  // In use, it rocks side to side (the kid on it rocks with it; see the renderer).
  const cx = x + 0.5, cy = y + 0.78, bob = live ? Math.abs(Math.sin(t * 4)) * 0.06 : Math.sin(t * 2.2) * 0.02, tilt = live ? Math.sin(t * 4) * 0.18 : 0;
  shadow(cx, cy, 0.42, 0.12);
  cylinder(cx, cy - 0.02, 0.38, 0.14, '#e0b52f', '#ffd23f');
  rr(cx - 0.03, cy - 0.4, 0.06, 0.26, 0.02); fs('#a0a8b0', 0.025);
  const by = cy - 0.62 - bob;
  g.save(); g.translate(cx, cy - 0.4); g.rotate(tilt); g.translate(-cx, -(cy - 0.4));
  if (live){ for (let i = 0; i < 3; i++){ circ(cx - 0.3 + i * 0.3, cy - 0.06, 0.03); fs(`hsl(${(t * 300 + i * 120) % 360},90%,60%)`, 0); } }
  if (r === 1 || r === 3){
    // Drawn nose-right; turned to face left it's mirrored.
    g.save(); g.translate(cx, by); if (r === 1) g.scale(-1, 1);
    g.beginPath(); g.moveTo(0.22, -0.02); g.lineTo(0.42, 0.1); g.lineTo(0.22, 0.2); g.closePath(); fs('#ef476f', 0.03);
    ell(0, 0.0, 0.36, 0.2); fs('#5a8dee');
    g.beginPath(); g.moveTo(-0.36, 0); g.quadraticCurveTo(-0.5, -0.02, -0.56, 0.0); g.quadraticCurveTo(-0.5, 0.04, -0.36, 0.02); fs('#ef476f', 0.03);
    circ(-0.1, -0.03, 0.08); fs('#bfe7f7', 0.03);
    g.beginPath(); g.moveTo(0.12, -0.16); g.lineTo(0.28, -0.32); g.lineTo(0.3, -0.12); g.closePath(); fs('#ef476f', 0.03);
    g.restore();
  } else {
    for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(cx + sx * 0.16, by - 0.05); g.lineTo(cx + sx * 0.34, by + 0.12); g.lineTo(cx + sx * 0.18, by + 0.16); g.closePath(); fs('#ef476f', 0.03); }
    circ(cx, by, 0.22); fs('#5a8dee');
    if (r === 0){ circ(cx, by - 0.02, 0.1); fs('#bfe7f7', 0.03); circ(cx - 0.03, by - 0.05, 0.03); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill(); }
    else { circ(cx, by + 0.02, 0.1); fs('#3d405b', 0.03); circ(cx, by + 0.02, 0.05); fs('#ff9f43', 0); }
    g.beginPath(); g.moveTo(cx - 0.1, by - 0.18); g.lineTo(cx, by - 0.42); g.lineTo(cx + 0.1, by - 0.18); fs('#ef476f', 0.03);
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
