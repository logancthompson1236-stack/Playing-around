// Draws the app icon and splash screens with the game's own painters. Run via tools/make-icons.mjs.
import * as A from '../src/art.js';

function storefront(g){
  const lw = 0.028;
  A.ell(0.5, 0.88, 0.36, 0.045); g.fillStyle = 'rgba(45,30,40,.18)'; g.fill();
  A.rr(0.15, 0.36, 0.7, 0.52, 0.04); A.fs('#f6efff', lw);
  A.rr(0.15, 0.8, 0.7, 0.08, 0.02); A.fs('#cdb8e6', lw);
  A.rr(0.21, 0.53, 0.28, 0.24, 0.03); A.fs('#bfe7f7', lw);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(0.26, 0.72); g.lineTo(0.33, 0.58); g.moveTo(0.31, 0.73); g.lineTo(0.37, 0.62); g.stroke();
  A.rr(0.56, 0.5, 0.23, 0.38, 0.03); A.fs('#ff8fab', lw);
  A.circ(0.6, 0.7, 0.018); A.fs('#3d2b35', 0);
  // awning
  const x0 = 0.1, x1 = 0.9, top = 0.25, h = 0.13, n = 6;
  g.save(); A.rr(x0, top, x1 - x0, h, 0.03); g.clip();
  g.fillStyle = '#e8577e'; g.fillRect(x0, top, x1 - x0, h); g.fillStyle = '#fff6f8';
  for (let i = 1; i < n; i += 2) g.fillRect(x0 + i * (x1 - x0) / n, top, (x1 - x0) / n, h);
  g.restore(); A.rr(x0, top, x1 - x0, h, 0.03); A.fs(null, lw);
  for (let i = 0; i < n; i++){ const cx = x0 + (i + 0.5) * (x1 - x0) / n, r = (x1 - x0) / n / 2; g.beginPath(); g.arc(cx, top + h, r, 0, Math.PI); A.fs(i % 2 ? '#fff6f8' : '#e8577e', lw); }
  // sign
  A.rr(0.28, 0.08, 0.44, 0.14, 0.05); A.fs('#ffd23f', lw);
  A.heartPath(0.5, 0.155, 0.075); A.fs('#e8577e', 0.02);
  A.sparkle(0.84, 0.14, 0.32, 1, '#ffffff');
  A.sparkle(0.12, 0.5, 0.2, 1, '#ffffff');
}
export function icon(size, mode){
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  A.setTarget(g, size); g.setTransform(size, 0, 0, size, 0, 0);
  if (mode !== 'fg'){
    g.save();
    if (mode === 'round') A.circ(0.5, 0.5, 0.5); else A.rr(0, 0, 1, 1, 0.22);
    g.clip();
    const gr = g.createLinearGradient(0, 0, 0, 1); gr.addColorStop(0, '#ffe8ee'); gr.addColorStop(1, '#ffb3c6');
    g.fillStyle = gr; g.fillRect(0, 0, 1, 1);
    g.restore();
  }
  const k = mode === 'fg' ? 0.62 : mode === 'round' ? 0.76 : 0.84;
  g.translate(0.5, 0.5); g.scale(k, k); g.translate(-0.5, -0.52);
  A.setTarget(g, size * k);
  storefront(g);
  return c;
}
export function splash(w, h){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#2d2236'; g.fillRect(0, 0, w, h);
  const m = Math.min(w, h), s = m * 0.34;
  g.drawImage(icon(Math.round(s), 'full'), (w - s) / 2, h * 0.5 - s * 0.85, s, s);
  g.font = `700 ${m * 0.11}px Fredoka`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = m * 0.016; g.strokeStyle = '#3d2b35';
  const ty = h * 0.5 + s * 0.38;
  g.fillStyle = '#3d2b35'; g.fillText('Mall Revival', w / 2, ty + m * 0.012);
  g.strokeText('Mall Revival', w / 2, ty); g.fillStyle = '#ff8fab'; g.fillText('Mall Revival', w / 2, ty);
  return c;
}
window.makeIcon = (size, mode) => icon(size, mode).toDataURL('image/png').split(',')[1];
window.makeSplash = (w, h) => splash(w, h).toDataURL('image/png').split(',')[1];
