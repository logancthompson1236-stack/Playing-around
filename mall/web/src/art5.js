// v0.18 painters: six more places to shop and two big attractions for the later levels. Hat Trick (hats), Wick & Wax
// (candles), Bear Hugs Workshop (build a teddy), Board Room (skateboards), Spec-tacular (glasses) and Blend Bar (a
// smoothie stand), plus Strike Zone (bowling) and Putt Paradise (mini golf). Also four decor pieces and four mall
// styles. Same conventions as art.js: tile units, drawn on art.js's current `g`.
import { g, rr, circ, ell, fs, box, shadow, text, OUT, local, shade, mulberry, storeIcon, cylinder } from './art.js';

export const ICONS = ['hat', 'candle', 'bear', 'skate', 'glasses', 'smoothie', 'bowling', 'golf'];
const HATS = ['#6a4c93', '#e63946', '#2a9d8f', '#f4a261', '#264653', '#ff8fab', '#ffd23f', '#8a5a44'];
const WAX = ['#f6bd60', '#f7ede2', '#f5cac3', '#84a59d', '#f28482', '#cdb4db', '#a2d2ff'];
const DECKS = ['#ff4d6d', '#80ffdb', '#ffd23f', '#5a8dee', '#9b5de5', '#ff9f1c', '#06d6a0'];
const FRAMES = ['#2b2d42', '#c1121f', '#00798c', '#edae49', '#9b5de5', '#8a5a44', '#ff5d8f'];
const FRUIT = { berry: '#ef476f', mango: '#ffb703', kiwi: '#7bd389', blue: '#7b6cf6' };
const BALLS = ['#3a86ff', '#ff006e', '#8338ec', '#fb5607', '#06d6a0', '#ffbe0b', '#2b2d42'];
const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const seg = (k, a, b) => ease((k - a) / (b - a));
const hash = (a, b) => { let t = Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663); t = Math.imul(t ^ t >>> 13, 0x5bd1e995); return ((t ^ t >>> 15) >>> 0) / 4294967296; };

/* ---------- Icons ---------- */
export function icon(name, c){
  if (name === 'hat'){
    // A fedora: wide brim, pinched crown and a band.
    ell(0, 0.18, 0.46, 0.14); fs(c('#6a4c93'), 0.07);
    g.beginPath(); g.moveTo(-0.26, 0.16); g.lineTo(-0.22, -0.26); g.quadraticCurveTo(0, -0.42, 0.22, -0.26); g.lineTo(0.26, 0.16); g.closePath(); fs(c('#7d5ba6'), 0.07);
    g.strokeStyle = 'rgba(61,43,53,.35)'; g.lineWidth = 0.04; g.beginPath(); g.moveTo(0, -0.34); g.lineTo(0, -0.18); g.stroke();
    rr(-0.25, -0.04, 0.5, 0.11, 0.03); fs(c('#ffca3a'), 0.05);
  } else if (name === 'candle'){
    rr(-0.26, -0.18, 0.52, 0.58, 0.1); fs(c('#f6bd60'), 0.07);
    rr(-0.26, -0.18, 0.52, 0.14, 0.06); fs(c('#fff1d0'), 0.05);
    rr(-0.17, 0.08, 0.34, 0.18, 0.04); fs('#fffaf3', 0.04);
    g.strokeStyle = OUT; g.lineWidth = 0.04; g.beginPath(); g.moveTo(0, -0.18); g.lineTo(0, -0.27); g.stroke();
    g.beginPath(); g.moveTo(0, -0.58); g.quadraticCurveTo(0.14, -0.38, 0, -0.27); g.quadraticCurveTo(-0.14, -0.38, 0, -0.58); fs(c('#ff9f1c'), 0.05);
    g.beginPath(); g.moveTo(0, -0.46); g.quadraticCurveTo(0.06, -0.36, 0, -0.3); g.quadraticCurveTo(-0.06, -0.36, 0, -0.46); g.fillStyle = '#fff3b0'; g.fill();
  } else if (name === 'bear'){
    // A teddy hugging a heart.
    circ(-0.27, -0.3, 0.13); fs(c('#c98b55'), 0.06); circ(0.27, -0.3, 0.13); fs(c('#c98b55'), 0.06);
    ell(0, 0.22, 0.32, 0.24); fs(c('#d9a066'), 0.07);
    circ(0, -0.12, 0.3); fs(c('#e0a96d'), 0.07); ell(0, -0.02, 0.13, 0.09); fs('#f6dcc0', 0.04);
    circ(-0.1, -0.16, 0.035); fs(OUT, 0); circ(0.1, -0.16, 0.035); fs(OUT, 0); circ(0, -0.05, 0.04); fs(OUT, 0);
    g.beginPath(); g.moveTo(0, 0.42); g.bezierCurveTo(-0.3, 0.26, -0.16, 0.06, 0, 0.18); g.bezierCurveTo(0.16, 0.06, 0.3, 0.26, 0, 0.42); fs(c('#ef476f'), 0.05);
  } else if (name === 'skate'){
    g.save(); g.rotate(-0.55);
    rr(-0.48, -0.13, 0.96, 0.26, 0.13); fs(c('#ff4d6d'), 0.07);
    g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(-0.15, 0); g.lineTo(0, -0.1); g.lineTo(0.15, 0); g.lineTo(0, 0.1); g.closePath(); g.fill();
    for (const wx of [-0.3, 0.3]) for (const wy of [-0.17, 0.17]){ circ(wx, wy, 0.07); fs(c('#80ffdb'), 0.04); }
    g.restore();
  } else if (name === 'glasses'){
    for (const sx of [-1, 1]){ circ(sx * 0.22, 0.04, 0.18); fs('rgba(200,235,250,.9)', 0); circ(sx * 0.22, 0.04, 0.18); g.strokeStyle = c('#00798c'); g.lineWidth = 0.09; g.stroke(); }
    g.beginPath(); g.arc(0, 0.02, 0.07, Math.PI + 0.4, -0.4); g.strokeStyle = c('#00798c'); g.lineWidth = 0.07; g.stroke();
    g.beginPath(); g.moveTo(-0.4, -0.02); g.lineTo(-0.48, -0.16); g.moveTo(0.4, -0.02); g.lineTo(0.48, -0.16); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.035; g.beginPath(); g.moveTo(-0.3, -0.04); g.lineTo(-0.22, -0.1); g.moveTo(0.14, -0.04); g.lineTo(0.22, -0.1); g.stroke();
  } else if (name === 'smoothie'){
    g.beginPath(); g.moveTo(-0.26, -0.2); g.lineTo(0.26, -0.2); g.lineTo(0.18, 0.46); g.lineTo(-0.18, 0.46); g.closePath(); fs(c('#ff70a6'), 0.07);
    g.beginPath(); g.arc(0, -0.2, 0.27, Math.PI, 0); g.closePath(); fs('rgba(235,248,255,.95)', 0.05);
    rr(0.02, -0.66, 0.07, 0.42, 0.03); fs(c('#06d6a0'), 0.04);
    circ(-0.2, -0.24, 0.12); fs(c('#ef476f'), 0.05); ell(-0.2, -0.36, 0.06, 0.03); fs('#7bd389', 0);
    rr(-0.16, 0.06, 0.32, 0.12, 0.04); fs('#fffaf3', 0.03);
  } else if (name === 'bowling'){
    // A pin leaning on a ball.
    g.beginPath(); g.moveTo(0.18, -0.52); g.bezierCurveTo(0.34, -0.52, 0.32, -0.28, 0.26, -0.18); g.bezierCurveTo(0.42, 0.0, 0.42, 0.34, 0.3, 0.44); g.lineTo(0.06, 0.44); g.bezierCurveTo(-0.06, 0.34, -0.06, 0.0, 0.1, -0.18); g.bezierCurveTo(0.04, -0.28, 0.02, -0.52, 0.18, -0.52); fs('#fffaf3', 0.06);
    g.fillStyle = c('#ef476f'); g.fillRect(0.11, -0.3, 0.14, 0.05); g.fillRect(0.11, -0.22, 0.14, 0.04);
    circ(-0.16, 0.16, 0.3); fs(c('#3a86ff'), 0.07);
    for (const [dx, dy] of [[-0.24, 0.02], [-0.12, 0.0], [-0.18, 0.12]]){ circ(dx, dy, 0.035); fs('#1b263b', 0); }
  } else if (name === 'golf'){
    ell(0, 0.28, 0.44, 0.15); fs(c('#52b788'), 0.06); ell(0.08, 0.28, 0.08, 0.035); fs(OUT, 0);
    rr(0.06, -0.52, 0.04, 0.8, 0.02); fs('#e9ecef', 0.03);
    g.beginPath(); g.moveTo(0.1, -0.52); g.lineTo(0.42, -0.4); g.lineTo(0.1, -0.28); g.closePath(); fs(c('#ef476f'), 0.05);
    circ(-0.2, 0.18, 0.1); fs('#fff', 0.05); circ(-0.23, 0.15, 0.02); fs('rgba(61,43,53,.25)', 0);
  }
}

/* ---------- What shoppers carry ---------- */
export function held(kind, hx, hy){
  if (kind === 'hatbox'){
    // A round striped hat box on a string.
    g.strokeStyle = OUT; g.lineWidth = 0.015; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - 0.05, hy + 0.05); g.moveTo(hx, hy); g.lineTo(hx + 0.05, hy + 0.05); g.stroke();
    rr(hx - 0.12, hy + 0.05, 0.24, 0.17, 0.04); fs('#fff1e6', 0.025);
    g.save(); rr(hx - 0.12, hy + 0.05, 0.24, 0.17, 0.04); g.clip(); g.fillStyle = '#6a4c93'; for (let i = -2; i < 3; i++) g.fillRect(hx + i * 0.07, hy + 0.05, 0.035, 0.17); g.restore();
    rr(hx - 0.13, hy + 0.03, 0.26, 0.05, 0.02); fs('#ffca3a', 0.02);
    return true;
  }
  if (kind === 'candle'){
    rr(hx - 0.06, hy - 0.12, 0.12, 0.15, 0.03); fs('#f6bd60', 0.022); rr(hx - 0.045, hy - 0.06, 0.09, 0.05, 0.01); fs('#fffaf3', 0.01);
    g.beginPath(); g.moveTo(hx, hy - 0.24); g.quadraticCurveTo(hx + 0.04, hy - 0.16, hx, hy - 0.13); g.quadraticCurveTo(hx - 0.04, hy - 0.16, hx, hy - 0.24); fs('#ff9f1c', 0.01);
    return true;
  }
  if (kind === 'teddy'){
    // A new teddy, hugged close, with a bow.
    circ(hx - 0.06, hy - 0.24, 0.03); fs('#c98b55', 0.015); circ(hx + 0.06, hy - 0.24, 0.03); fs('#c98b55', 0.015);
    ell(hx, hy - 0.06, 0.09, 0.08); fs('#d9a066', 0.022);
    circ(hx, hy - 0.17, 0.075); fs('#e0a96d', 0.022); ell(hx, hy - 0.15, 0.03, 0.022); fs('#f6dcc0', 0);
    circ(hx - 0.025, hy - 0.185, 0.01); fs(OUT, 0); circ(hx + 0.025, hy - 0.185, 0.01); fs(OUT, 0);
    for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(hx, hy - 0.1); g.lineTo(hx + sx * 0.045, hy - 0.125); g.lineTo(hx + sx * 0.045, hy - 0.075); g.closePath(); fs('#ef476f', 0.01); }
    return true;
  }
  if (kind === 'skateboard'){
    // A deck carried upright at the side, wheels out.
    rr(hx - 0.04, hy - 0.3, 0.08, 0.44, 0.04); fs(DECKS[0], 0.022);
    g.fillStyle = '#ffd23f'; g.fillRect(hx - 0.04, hy - 0.1, 0.08, 0.04);
    for (const wy of [hy - 0.22, hy + 0.06]){ circ(hx + 0.06, wy, 0.03); fs('#80ffdb', 0.015); }
    return true;
  }
  if (kind === 'smoothie'){
    g.beginPath(); g.moveTo(hx - 0.055, hy - 0.16); g.lineTo(hx + 0.055, hy - 0.16); g.lineTo(hx + 0.04, hy + 0.02); g.lineTo(hx - 0.04, hy + 0.02); g.closePath(); fs('#ff70a6', 0.022);
    g.beginPath(); g.arc(hx, hy - 0.16, 0.055, Math.PI, 0); g.closePath(); fs('rgba(235,248,255,.95)', 0.015);
    rr(hx + 0.005, hy - 0.29, 0.02, 0.1, 0.01); fs('#06d6a0', 0.01);
    return true;
  }
  if (kind === 'popcornbox'){
    g.beginPath(); g.moveTo(hx - 0.08, hy - 0.14); g.lineTo(hx + 0.08, hy - 0.14); g.lineTo(hx + 0.06, hy + 0.04); g.lineTo(hx - 0.06, hy + 0.04); g.closePath(); fs('#fff', 0.022);
    g.save(); g.clip(); g.fillStyle = '#e63946'; for (let i = -2; i < 3; i++) g.fillRect(hx + i * 0.04 - 0.01, hy - 0.15, 0.02, 0.2); g.restore();
    for (const [dx, dy] of [[-0.05, -0.16], [0, -0.19], [0.05, -0.16], [-0.025, -0.21], [0.03, -0.22]]){ circ(hx + dx, hy + dy, 0.03); fs('#fff8dc', 0.01); }
    return true;
  }
  if (kind === 'penny'){
    // A pressed penny, stretched long, glinting.
    ell(hx, hy - 0.05, 0.035, 0.06); fs('#d08c60', 0.015); ell(hx - 0.01, hy - 0.07, 0.01, 0.02); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
    return true;
  }
  return false;
}
// Hats and glasses on a person's head, in person()'s frame. Back views only show a hat.
export function headwear(o, back, profile){
  const hat = o.tryHat || o.hat;
  if (o.specs && !back){
    if (profile){ circ(0.14, -0.865, 0.065); g.fillStyle = 'rgba(210,240,255,.35)'; g.fill(); g.strokeStyle = o.specs; g.lineWidth = 0.03; g.stroke(); g.beginPath(); g.moveTo(0.075, -0.87); g.lineTo(-0.12, -0.88); g.stroke(); }
    else {
      for (const sx of [-1, 1]){ rr(sx * 0.1 - 0.075, -0.92, 0.15, 0.11, 0.045); g.fillStyle = 'rgba(210,240,255,.35)'; g.fill(); g.strokeStyle = o.specs; g.lineWidth = 0.03; g.stroke(); }
      g.beginPath(); g.moveTo(-0.025, -0.875); g.quadraticCurveTo(0, -0.895, 0.025, -0.875); g.strokeStyle = o.specs; g.lineWidth = 0.025; g.stroke();
    }
  }
  if (!hat) return;
  const c = hat.color, dk = shade(c, -0.25);
  if (hat.kind === 'beanie'){
    g.beginPath(); g.arc(0, -0.93, 0.29, Math.PI, 0); g.closePath(); fs(c, 0.03);
    rr(-0.3, -0.98, 0.6, 0.1, 0.04); fs(dk, 0.025); circ(0, -1.23, 0.06); fs('#fffaf3', 0.02);
  } else if (hat.kind === 'sun'){
    ell(0, -1.0, 0.46, 0.12); fs(c, 0.03); g.beginPath(); g.arc(0, -1.02, 0.22, Math.PI, 0); g.closePath(); fs(c, 0.03);
    rr(-0.22, -1.07, 0.44, 0.06, 0.03); fs('#ff8fab', 0.015);
  } else if (hat.kind === 'top'){
    ell(0, -1.04, 0.34, 0.07); fs('#2b2d42', 0.03); rr(-0.2, -1.42, 0.4, 0.4, 0.04); fs('#2b2d42', 0.03); rr(-0.2, -1.12, 0.4, 0.07, 0.02); fs(c, 0.015);
  } else {
    // A fedora.
    ell(0, -1.03, 0.4, 0.09); fs(c, 0.03);
    g.beginPath(); g.moveTo(-0.22, -1.03); g.lineTo(-0.19, -1.28); g.quadraticCurveTo(0, -1.36, 0.19, -1.28); g.lineTo(0.22, -1.03); g.closePath(); fs(shade(c, 0.08), 0.03);
    rr(-0.22, -1.12, 0.44, 0.07, 0.02); fs(back ? dk : '#ffca3a', 0.015);
  }
}
export const HAT_KINDS = ['fedora', 'beanie', 'sun', 'top'];
export function randomHat(r){ return { kind: HAT_KINDS[Math.floor(r() * HAT_KINDS.length)], color: HATS[Math.floor(r() * HATS.length)] }; }
export const randomSpecs = r => FRAMES[Math.floor(r() * FRAMES.length)];

/* ---------- The smoothie stand (a kiosk) ---------- */
export function smoothieCounter(x, y, t){
  // Two blenders whirring away, a pile of fruit and a row of cups.
  for (const [bx, col, ph] of [[x + 0.28, FRUIT.berry, 0], [x + 0.62, FRUIT.mango, 1.7]]){
    rr(bx - 0.1, y - 0.5, 0.2, 0.1, 0.03); fs('#3d405b', 0.02);
    circ(bx + 0.06, y - 0.45, 0.02); fs(Math.sin(t * 3 + ph) > 0 ? '#06d6a0' : '#a0a8b0', 0);
    g.beginPath(); g.moveTo(bx - 0.09, y - 0.5); g.lineTo(bx + 0.09, y - 0.5); g.lineTo(bx + 0.12, y - 0.86); g.lineTo(bx - 0.12, y - 0.86); g.closePath(); fs('rgba(225,245,255,.75)', 0.025);
    g.save(); g.beginPath(); g.moveTo(bx - 0.085, y - 0.52); g.lineTo(bx + 0.085, y - 0.52); g.lineTo(bx + 0.105, y - 0.74); g.lineTo(bx - 0.105, y - 0.74); g.closePath(); g.clip();
    const slosh = Math.sin(t * 11 + ph) * 0.03;
    g.fillStyle = col; g.beginPath(); g.moveTo(bx - 0.12, y - 0.5); g.lineTo(bx - 0.12, y - 0.7 + slosh); g.quadraticCurveTo(bx, y - 0.76 - slosh, bx + 0.12, y - 0.7 - slosh); g.lineTo(bx + 0.12, y - 0.5); g.fill();
    // The swirl in the middle.
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.018; g.beginPath();
    for (let a = 0; a < 7; a += 0.3){ const r = 0.012 * a, sp = t * 14 + ph; g.lineTo(bx + Math.cos(a + sp) * r, y - 0.62 + Math.sin(a + sp) * r * 0.5); } g.stroke();
    g.restore();
    rr(bx - 0.13, y - 0.9, 0.26, 0.05, 0.02); fs('#3d405b', 0.02);
  }
  // Fruit: strawberries, a banana, a mango and kiwi halves.
  ell(x + 1.06, y - 0.4, 0.2, 0.06); fs('#c98b55', 0.02); rr(x + 0.88, y - 0.43, 0.36, 0.1, 0.04); fs('#a77d55', 0.02);
  for (const [dx, dy, c, r] of [[0.95, -0.48, FRUIT.berry, 0.045], [1.04, -0.5, FRUIT.mango, 0.06], [1.15, -0.47, FRUIT.kiwi, 0.045], [1.0, -0.56, FRUIT.berry, 0.04]]){ circ(x + dx, y + dy, r); fs(c, 0.012); }
  g.beginPath(); g.arc(x + 1.1, y - 0.62, 0.1, 0.3, 2.2); g.strokeStyle = '#ffd23f'; g.lineWidth = 0.05; g.stroke();
  // Cups waiting, each a different flavor.
  ['#ff70a6', '#ffb703', '#7bd389', '#7b6cf6'].forEach((c, i) => { const cx = x + 0.86 + i * 0.12; g.beginPath(); g.moveTo(cx - 0.045, y - 0.68); g.lineTo(cx + 0.045, y - 0.68); g.lineTo(cx + 0.035, y - 0.56); g.lineTo(cx - 0.035, y - 0.56); g.closePath(); fs(c, 0.012); });
}

/* ---------- Store walls ---------- */
export function wallpaper(ic, x0, y0, w, H){
  if (ic === 'hat'){
    // Cream with a little plum diamond pattern, like a hat lining.
    g.fillStyle = '#fbf3e4'; g.fillRect(x0, y0, w, H);
    g.fillStyle = 'rgba(106,76,147,.22)';
    for (let x = x0; x < x0 + w + 0.2; x += 0.2) for (let y = y0; y < y0 + H + 0.2; y += 0.2){ const ox = (Math.round((y - y0) / 0.2) % 2) * 0.1; g.beginPath(); g.moveTo(x + ox, y - 0.05); g.lineTo(x + ox + 0.05, y); g.lineTo(x + ox, y + 0.05); g.lineTo(x + ox - 0.05, y); g.closePath(); g.fill(); }
    g.fillStyle = '#6a4c93'; g.fillRect(x0, y0 + H - 0.1, w, 0.1);
  } else if (ic === 'candle'){
    // Warm honey with wax drips running down from the top.
    g.fillStyle = '#ffe8c2'; g.fillRect(x0, y0, w, H);
    g.fillStyle = '#f6bd60'; g.fillRect(x0, y0, w, 0.12);
    const R = mulberry(Math.round(x0 * 31));
    for (let x = x0 + 0.05; x < x0 + w; x += 0.16){ const d = 0.08 + R() * 0.22; rr(x, y0 + 0.06, 0.07, d, 0.035); g.fill(); circ(x + 0.035, y0 + 0.06 + d, 0.04); g.fill(); }
  } else if (ic === 'bear'){
    // Soft peach with little hearts and paw prints.
    g.fillStyle = '#fde4cf'; g.fillRect(x0, y0, w, H);
    for (let x = x0 + 0.15, i = 0; x < x0 + w; x += 0.32, i++) for (let y = y0 + 0.15, j = 0; y < y0 + H; y += 0.32, j++){
      g.save(); g.translate(x + (j % 2) * 0.16, y); g.globalAlpha = 0.35;
      if ((i + j) % 2){ g.beginPath(); g.moveTo(0, 0.05); g.bezierCurveTo(-0.08, -0.01, -0.04, -0.07, 0, -0.03); g.bezierCurveTo(0.04, -0.07, 0.08, -0.01, 0, 0.05); g.fillStyle = '#ef476f'; g.fill(); }
      else { g.fillStyle = '#c98b55'; ell(0, 0.015, 0.035, 0.028); g.fill(); for (const [a, b] of [[-0.04, -0.025], [0, -0.04], [0.04, -0.025]]){ circ(a, b, 0.014); g.fill(); } }
      g.restore();
    }
  } else if (ic === 'skate'){
    // Bare concrete with spray-painted tags.
    g.fillStyle = '#c9c9c9'; g.fillRect(x0, y0, w, H);
    g.strokeStyle = 'rgba(80,80,80,.25)'; g.lineWidth = 0.015; g.beginPath(); for (let y = y0 + 0.3; y < y0 + H; y += 0.3){ g.moveTo(x0, y); g.lineTo(x0 + w, y); } g.stroke();
    const R = mulberry(Math.round(x0 * 17 + 3));
    for (let k = 0; k < w * 1.5; k++){
      const sx = x0 + R() * w, sy = y0 + 0.15 + R() * (H - 0.3), c = DECKS[Math.floor(R() * DECKS.length)];
      g.strokeStyle = c; g.lineWidth = 0.035; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); for (let i = 0; i < 4; i++) g.quadraticCurveTo(sx + i * 0.06 + 0.03, sy + (i % 2 ? 0.08 : -0.08), sx + (i + 1) * 0.06, sy); g.stroke();
    }
  } else if (ic === 'glasses'){
    // Deep teal with a thin gold ring pattern.
    g.fillStyle = '#d9f0f2'; g.fillRect(x0, y0, w, H);
    g.strokeStyle = 'rgba(0,121,140,.25)'; g.lineWidth = 0.02;
    for (let x = x0 + 0.12; x < x0 + w; x += 0.36) for (let y = y0 + 0.12; y < y0 + H; y += 0.3){ for (const sx of [-1, 1]){ circ(x + sx * 0.055, y, 0.045); g.stroke(); } }
    g.fillStyle = '#00798c'; g.fillRect(x0, y0 + H - 0.1, w, 0.1); g.fillStyle = '#edae49'; g.fillRect(x0, y0 + H - 0.13, w, 0.03);
  } else return false;
  return true;
}
// A piece on each store's wall.
export function wallPiece(ic, wx, wy, t){
  if (ic === 'hat'){
    // A round mirror with a top hat hung on a peg beside it.
    circ(wx + 0.34, wy - 0.04, 0.22); fs('#c9a227', 0.03); circ(wx + 0.34, wy - 0.04, 0.17); fs('#d6eef7', 0.02);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(wx + 0.26, wy - 0.02); g.lineTo(wx + 0.34, wy - 0.12); g.stroke();
    rr(wx + 0.66, wy - 0.18, 0.04, 0.04, 0.01); fs('#8a6a5a', 0.01);
    ell(wx + 0.68, wy - 0.06, 0.13, 0.03); fs('#2b2d42', 0.02); rr(wx + 0.6, wy - 0.24, 0.16, 0.18, 0.02); fs('#2b2d42', 0.02); rr(wx + 0.6, wy - 0.1, 0.16, 0.03, 0.01); fs('#ef476f', 0);
  } else if (ic === 'candle'){
    // Two brass sconces with flickering candles.
    for (const [sx, ph] of [[wx + 0.25, 0], [wx + 0.65, 1.9]]){
      rr(sx - 0.03, wy - 0.05, 0.06, 0.2, 0.02); fs('#c9a227', 0.015); ell(sx, wy + 0.0, 0.09, 0.03); fs('#c9a227', 0.015);
      rr(sx - 0.035, wy - 0.18, 0.07, 0.17, 0.02); fs('#fff1d0', 0.015);
      flame(sx, wy - 0.18, 0.06, t * 1.3 + ph);
    }
    text('WICK & WAX', wx + 0.45, wy + 0.2, 0.07, '#c8553d', 700);
  } else if (ic === 'bear'){
    // A big teddy face over pastel bunting.
    g.strokeStyle = 'rgba(61,43,53,.4)'; g.lineWidth = 0.012; g.beginPath(); g.moveTo(wx - 0.05, wy - 0.24); g.quadraticCurveTo(wx + 0.45, wy - 0.12, wx + 0.95, wy - 0.24); g.stroke();
    for (let i = 0; i < 6; i++){ const px = wx + 0.0 + i * 0.17, py = wy - 0.22 + Math.sin((i + 0.5) / 6 * Math.PI) * 0.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 0.13, py); g.lineTo(px + 0.065, py + 0.12); g.closePath(); g.fillStyle = ['#ffadad', '#ffd6a5', '#caffbf', '#9bf6ff', '#bdb2ff', '#ffc6ff'][i]; g.fill(); }
    g.save(); g.translate(wx + 0.45, wy + 0.06); g.scale(0.3, 0.3); storeIcon('bear', 0, 0, 1); g.restore();
  } else if (ic === 'skate'){
    // Three decks crossed on the wall.
    [[-0.5, '#ff4d6d'], [0, '#80ffdb'], [0.5, '#ffd23f']].forEach(([a, c]) => { g.save(); g.translate(wx + 0.45, wy - 0.02); g.rotate(a); rr(-0.06, -0.26, 0.12, 0.52, 0.06); fs(c, 0.02); g.fillStyle = 'rgba(43,45,66,.7)'; g.fillRect(-0.06, -0.04, 0.12, 0.08); g.restore(); });
    text('SK8', wx + 0.45, wy + 0.22, 0.09, '#2b2d42', 700);
  } else if (ic === 'glasses'){
    // A giant pair of specs on a sign.
    rr(wx + 0.06, wy - 0.22, 0.78, 0.4, 0.08); fs('#fffaf3', 0.03);
    for (const sx of [-1, 1]){ circ(wx + 0.45 + sx * 0.17, wy - 0.04, 0.12); g.fillStyle = 'rgba(200,235,250,.9)'; g.fill(); g.strokeStyle = '#00798c'; g.lineWidth = 0.04; g.stroke(); }
    g.beginPath(); g.arc(wx + 0.45, wy - 0.06, 0.05, Math.PI + 0.4, -0.4); g.strokeStyle = '#00798c'; g.lineWidth = 0.03; g.stroke();
    // A wink of light crosses the lenses now and then.
    const k = (t * 0.4) % 1; if (k < 0.3){ g.save(); g.globalAlpha = 1 - k / 0.3; circ(wx + 0.28 + k * 1.1, wy - 0.08, 0.03); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  } else return false;
  return true;
}
// A little flame that wavers.
export function flame(x, y, s, t){
  const sway = Math.sin(t * 7) * 0.2 + Math.sin(t * 13) * 0.1, h = s * (1 + Math.sin(t * 9) * 0.12);
  g.save(); g.globalAlpha = 0.25; circ(x, y - h * 0.5, s * 1.2); g.fillStyle = '#ffd166'; g.fill(); g.restore();
  g.beginPath(); g.moveTo(x + sway * s, y - h * 1.5); g.quadraticCurveTo(x + s * 0.6, y - h * 0.4, x, y); g.quadraticCurveTo(x - s * 0.6, y - h * 0.4, x + sway * s, y - h * 1.5); g.fillStyle = '#ff9f1c'; g.fill();
  g.beginPath(); g.moveTo(x + sway * s * 0.6, y - h * 1.0); g.quadraticCurveTo(x + s * 0.3, y - h * 0.3, x, y - h * 0.05); g.quadraticCurveTo(x - s * 0.3, y - h * 0.3, x + sway * s * 0.6, y - h * 1.0); g.fillStyle = '#fff3b0'; g.fill();
}
// Something on each counter, next to the register.
export function counter(ic, cx, top, t){
  if (ic === 'hat'){
    // A stack of hat boxes.
    for (let i = 0; i < 3; i++){ const w = 0.36 - i * 0.07, bx = cx + 0.24 - w / 2, by = top + 0.12 - i * 0.1; rr(bx, by - 0.08, w, 0.1, 0.03); fs(['#6a4c93', '#ffca3a', '#ff8fab'][i], 0.015); rr(bx - 0.01, by - 0.09, w + 0.02, 0.03, 0.01); fs('#fffaf3', 0.01); }
  } else if (ic === 'candle'){
    // Three pillar candles of different heights, all lit.
    [[0.1, 0.22, '#f7ede2'], [0.22, 0.32, '#f5cac3'], [0.34, 0.18, '#cdb4db']].forEach(([dx, h, c], i) => { rr(cx + dx - 0.045, top + 0.14 - h, 0.09, h, 0.02); fs(c, 0.015); flame(cx + dx, top + 0.14 - h, 0.035, t * 1.2 + i * 2.1); });
  } else if (ic === 'bear'){
    // A spool of ribbon and a little birth certificate.
    rr(cx + 0.06, top + 0.0, 0.16, 0.14, 0.03); fs('#fffaf3', 0.015); circ(cx + 0.14, top + 0.07, 0.05); fs('#ef476f', 0.01);
    rr(cx + 0.26, top + 0.02, 0.18, 0.12, 0.01); fs('#fff8dc', 0.012); g.strokeStyle = 'rgba(61,43,53,.4)'; g.lineWidth = 0.01; g.beginPath(); for (let i = 0; i < 3; i++){ g.moveTo(cx + 0.29, top + 0.05 + i * 0.03); g.lineTo(cx + 0.41, top + 0.05 + i * 0.03); } g.stroke();
  } else if (ic === 'skate'){
    // A bowl of wheels and a stack of stickers.
    ell(cx + 0.14, top + 0.08, 0.12, 0.05); fs('#3d405b', 0.015);
    for (let i = 0; i < 5; i++){ circ(cx + 0.06 + i * 0.04, top + 0.04 - (i % 2) * 0.02, 0.03); fs(DECKS[i], 0.01); }
    for (let i = 0; i < 3; i++){ rr(cx + 0.3, top + 0.08 - i * 0.025, 0.14, 0.05, 0.01); fs(DECKS[i + 3], 0.01); }
  } else if (ic === 'glasses'){
    // A swivel mirror and a tray of frames.
    rr(cx + 0.12, top - 0.04, 0.03, 0.14, 0.01); fs('#a0a8b0', 0.012); ell(cx + 0.135, top - 0.14, 0.09, 0.11); fs('#c9a227', 0.02); ell(cx + 0.135, top - 0.14, 0.07, 0.09); fs('#d6eef7', 0.012);
    rr(cx + 0.24, top + 0.06, 0.24, 0.1, 0.02); fs('#2b2d42', 0.012);
    for (let i = 0; i < 2; i++) for (const sx of [-1, 1]){ circ(cx + 0.32 + i * 0.1 + sx * 0.022, top + 0.1, 0.018); g.strokeStyle = FRAMES[i + 1]; g.lineWidth = 0.012; g.stroke(); }
  } else return false;
  return true;
}
// The big piece along each store's back wall.
export function back(ic, x, y, sw, t, id){
  if (ic === 'hat'){
    // A pegboard of hats in three rows: fedoras, beanies, caps and sun hats.
    box(x, y, sw, 0.36, 0.95, '#e9dcc8', '#c9b79c');
    const top = y + 0.36 - 0.95;
    g.fillStyle = 'rgba(120,90,60,.25)'; for (let px = x + 0.08; px < x + sw; px += 0.12) for (let py = top + 0.08; py < top + 0.86; py += 0.12) g.fillRect(px, py, 0.02, 0.02);
    for (let r = 0; r < 3; r++){
      const n = Math.max(1, Math.floor((sw - 0.08) / 0.26));
      for (let i = 0; i < n; i++){
        const hx = x + 0.17 + i * (sw - 0.2) / n, hy = top + 0.27 + r * 0.27, c = HATS[(i * 3 + r + id) % HATS.length], k = (i + r * 2 + id) % 4;
        rr(hx - 0.01, hy - 0.2, 0.02, 0.03, 0.01); fs('#8a6a5a', 0);
        if (k === 0){ ell(hx, hy, 0.12, 0.03); fs(c, 0.012); rr(hx - 0.07, hy - 0.12, 0.14, 0.12, 0.03); fs(shade(c, 0.1), 0.012); rr(hx - 0.07, hy - 0.04, 0.14, 0.025, 0.01); fs('#ffca3a', 0); }
        else if (k === 1){ g.beginPath(); g.arc(hx, hy, 0.09, Math.PI, 0); g.closePath(); fs(c, 0.012); rr(hx - 0.095, hy - 0.025, 0.19, 0.035, 0.015); fs(shade(c, -0.2), 0.01); circ(hx, hy - 0.11, 0.025); fs('#fffaf3', 0.01); }
        else if (k === 2){ g.beginPath(); g.arc(hx, hy, 0.085, Math.PI, 0); g.closePath(); fs(c, 0.012); rr(hx, hy - 0.025, 0.13, 0.035, 0.015); fs(shade(c, -0.2), 0.01); }
        else { ell(hx, hy, 0.13, 0.035); fs('#f2d68a', 0.012); g.beginPath(); g.arc(hx, hy - 0.01, 0.065, Math.PI, 0); g.closePath(); fs('#f2d68a', 0.012); rr(hx - 0.065, hy - 0.04, 0.13, 0.025, 0.01); fs(c, 0); }
      }
    }
  } else if (ic === 'candle'){
    // Shelves of candles in jars, every one of them lit.
    box(x, y, sw, 0.36, 0.9, '#8a5a44', '#6b4a3a');
    const top = y + 0.36 - 0.9;
    for (let r = 0; r < 3; r++){
      g.fillStyle = '#c49a6c'; g.fillRect(x + 0.04, top + 0.3 + r * 0.25, sw - 0.08, 0.03);
      const n = Math.max(1, Math.floor((sw - 0.1) / 0.15));
      for (let i = 0; i < n; i++){
        const px = x + 0.1 + i * (sw - 0.14) / n, py = top + 0.3 + r * 0.25, c = WAX[(i + r * 2 + id) % WAX.length], tall = (i + r) % 3 === 0;
        if (tall){ rr(px - 0.035, py - 0.17, 0.07, 0.17, 0.015); fs(c, 0.01); flame(px, py - 0.17, 0.025, t * 1.2 + i + r * 3); }
        else { rr(px - 0.05, py - 0.11, 0.1, 0.11, 0.025); fs('rgba(240,250,255,.8)', 0.01); rr(px - 0.04, py - 0.08, 0.08, 0.07, 0.015); g.fillStyle = c; g.fill(); flame(px, py - 0.09, 0.022, t * 1.4 + i * 1.7 + r); }
      }
    }
  } else if (ic === 'bear'){
    // Cubbies of finished bears, each in a little outfit.
    box(x, y, sw, 0.36, 0.95, '#ffe5d9', '#f4acb7');
    const top = y + 0.36 - 0.95, n = Math.max(1, Math.floor((sw - 0.08) / 0.3));
    for (let r = 0; r < 3; r++) for (let i = 0; i < n; i++){
      const cw = (sw - 0.08) / n, bx = x + 0.04 + i * cw, by = top + 0.06 + r * 0.29;
      rr(bx + 0.02, by, cw - 0.04, 0.26, 0.02); fs('#fff1e6', 0.012);
      miniBear(bx + cw / 2, by + 0.24, 0.62, ['#e0a96d', '#c98b55', '#fff1e6', '#ffc6ff', '#a0a8b0'][(i + r * 2 + id) % 5], HATS[(i + r + id) % HATS.length], (i + r) % 3);
    }
  } else if (ic === 'skate'){
    // A rack of decks standing on end, wheels and trucks on the shelf above.
    box(x, y, sw, 0.36, 0.95, '#3d405b', '#2b2d42');
    const top = y + 0.36 - 0.95, n = Math.max(2, Math.floor((sw - 0.08) / 0.14));
    for (let i = 0; i < n; i++){
      const dx = x + 0.08 + i * (sw - 0.16) / n, c = DECKS[(i + id) % DECKS.length];
      rr(dx, top + 0.3, 0.11, 0.6, 0.055); fs(c, 0.015);
      const k = (i + id) % 3;
      if (k === 0){ circ(dx + 0.055, top + 0.6, 0.035); fs('#fff', 0.01); }
      else if (k === 1){ g.fillStyle = '#2b2d42'; g.beginPath(); g.moveTo(dx + 0.02, top + 0.7); g.lineTo(dx + 0.055, top + 0.5); g.lineTo(dx + 0.09, top + 0.7); g.closePath(); g.fill(); }
      else { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(dx + 0.015, top + 0.55, 0.08, 0.02); g.fillRect(dx + 0.015, top + 0.6, 0.08, 0.02); }
    }
    g.fillStyle = '#80ffdb'; g.fillRect(x + 0.04, top + 0.22, sw - 0.08, 0.03);
    for (let i = 0; i < Math.floor(sw / 0.1); i++){ circ(x + 0.08 + i * 0.1, top + 0.17, 0.035); fs(DECKS[(i + 2) % DECKS.length], 0.01); }
  } else if (ic === 'glasses'){
    // A lit wall of frames on little rods, sunglasses on the top row.
    box(x, y, sw, 0.34, 0.95, '#fffaf3', '#c9e4e7');
    const top = y + 0.34 - 0.95;
    g.save(); g.globalAlpha = 0.3; g.fillStyle = '#fff6c8'; g.fillRect(x + 0.05, top + 0.04, sw - 0.1, 0.06); g.restore();
    for (let r = 0; r < 4; r++){
      const n = Math.max(1, Math.floor((sw - 0.08) / 0.22));
      g.fillStyle = 'rgba(160,190,200,.8)'; g.fillRect(x + 0.05, top + 0.25 + r * 0.17, sw - 0.1, 0.012);
      for (let i = 0; i < n; i++){
        const fx = x + 0.15 + i * (sw - 0.16) / n, fy = top + 0.22 + r * 0.17, c = FRAMES[(i * 2 + r + id) % FRAMES.length];
        for (const sx of [-1, 1]){
          if (r === 0){ rr(fx + sx * 0.045 - 0.04, fy - 0.03, 0.08, 0.055, 0.02); fs('#2b2d42', 0.008); }
          else { circ(fx + sx * 0.045, fy, 0.033); g.fillStyle = 'rgba(210,240,255,.6)'; g.fill(); g.strokeStyle = c; g.lineWidth = 0.014; g.stroke(); }
        }
      }
    }
  } else return false;
  return true;
}
// A small seated teddy, feet at (x, y), scale s.
function miniBear(x, y, s, fur, outfit, kind){
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(0, -0.1, 0.11, 0.1); fs(fur, 0.02);
  if (kind === 0){ rr(-0.1, -0.16, 0.2, 0.1, 0.03); fs(outfit, 0.015); }
  else if (kind === 1){ g.beginPath(); g.moveTo(-0.11, -0.08); g.lineTo(0.11, -0.08); g.lineTo(0.08, -0.18); g.lineTo(-0.08, -0.18); g.closePath(); fs(outfit, 0.015); }
  for (const sx of [-1, 1]){ ell(sx * 0.07, -0.02, 0.045, 0.03); fs(shade(fur, -0.08), 0.015); }
  circ(-0.07, -0.33, 0.04); fs(fur, 0.015); circ(0.07, -0.33, 0.04); fs(fur, 0.015);
  circ(0, -0.25, 0.1); fs(fur, 0.02); ell(0, -0.22, 0.04, 0.03); fs('#f6dcc0', 0);
  circ(-0.035, -0.27, 0.012); fs(OUT, 0); circ(0.035, -0.27, 0.012); fs(OUT, 0); circ(0, -0.235, 0.012); fs(OUT, 0);
  if (kind === 2){ for (const sx of [-1, 1]){ g.beginPath(); g.moveTo(0, -0.16); g.lineTo(sx * 0.06, -0.19); g.lineTo(sx * 0.06, -0.13); g.closePath(); fs(outfit, 0.01); } }
  g.restore();
}
// Pieces in the middle of the room. Returns true if it drew something.
export function mid(ic, u, W, H, t){
  if (ic === 'hat'){
    // A hat tree by the door with a few hats hung on it.
    const [x, y] = local(u, 0.42, 1.55);
    shadow(x, y, 0.18, 0.06);
    ell(x, y - 0.02, 0.15, 0.05); fs('#6b4a3a', 0.02); rr(x - 0.025, y - 0.85, 0.05, 0.84, 0.02); fs('#8a5a44', 0.02);
    for (const [dx, dy, c, k] of [[-0.15, -0.72, HATS[0], 0], [0.15, -0.6, HATS[3], 1], [-0.12, -0.45, HATS[2], 2]]){
      g.strokeStyle = '#8a5a44'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(x, dy + y + 0.05); g.lineTo(x + dx, dy + y - 0.02); g.stroke();
      if (k === 0){ ell(x + dx, y + dy, 0.12, 0.03); fs(c, 0.012); rr(x + dx - 0.07, y + dy - 0.11, 0.14, 0.11, 0.03); fs(c, 0.012); rr(x + dx - 0.07, y + dy - 0.035, 0.14, 0.025, 0.01); fs('#ffca3a', 0); }
      else if (k === 1){ g.beginPath(); g.arc(x + dx, y + dy, 0.08, Math.PI, 0); g.closePath(); fs(c, 0.012); circ(x + dx, y + dy - 0.1, 0.022); fs('#fff', 0.01); }
      else { ell(x + dx, y + dy, 0.13, 0.035); fs('#f2d68a', 0.012); g.beginPath(); g.arc(x + dx, y + dy - 0.01, 0.06, Math.PI, 0); g.closePath(); fs('#f2d68a', 0.012); }
    }
    circ(x, y - 0.87, 0.04); fs('#c9a227', 0.015);
    return true;
  }
  if (ic === 'candle'){
    // A round table of candles in glass jars, flickering.
    const [x, y] = local(u, 0.45, 1.5);
    shadow(x, y + 0.02, 0.26, 0.08);
    cylinder(x, y, 0.24, 0.36, '#8a5a44', '#c49a6c');
    for (const [dx, dy, c] of [[-0.1, -0.03, WAX[0]], [0.08, -0.06, WAX[2]], [0, 0.05, WAX[4]], [0.13, 0.04, WAX[5]]]){
      const px = x + dx, py = y - 0.36 + dy;
      rr(px - 0.04, py - 0.08, 0.08, 0.08, 0.02); fs('rgba(240,250,255,.85)', 0.01); rr(px - 0.03, py - 0.06, 0.06, 0.05, 0.01); g.fillStyle = c; g.fill();
      flame(px, py - 0.07, 0.02, t * 1.3 + dx * 20);
    }
    return true;
  }
  if (ic === 'bear' && H >= 3){
    // The stuffing machine: a clear drum of fluff, whirling, with a big heart button. Kids press it and the bear fills up.
    const [x, y] = local(u, 0.65, 2.15);
    shadow(x, y + 0.02, 0.36, 0.1);
    box(x - 0.32, y - 0.36, 0.64, 0.36, 0.42, '#ffd6a5', '#f4a261');
    rr(x - 0.08, y - 0.24, 0.16, 0.12, 0.04); fs('#ef476f', 0.02);
    g.beginPath(); g.moveTo(x, y - 0.13); g.bezierCurveTo(x - 0.06, y - 0.16, x - 0.04, y - 0.21, x, y - 0.18); g.bezierCurveTo(x + 0.04, y - 0.21, x + 0.06, y - 0.16, x, y - 0.13); g.fillStyle = '#fff'; g.fill();
    // The drum.
    const dy = y - 0.42 - 0.34;
    circ(x, dy, 0.32); fs('rgba(225,245,255,.55)', 0.03);
    g.save(); circ(x, dy, 0.3); g.clip();
    for (let i = 0; i < 14; i++){ const a = t * 2.2 + i * 0.45, r = 0.08 + (i % 4) * 0.05; circ(x + Math.cos(a) * r, dy + Math.sin(a * 1.3) * r * 0.8 + 0.06, 0.06 + (i % 3) * 0.015); g.fillStyle = i % 5 === 0 ? '#ffd6e0' : '#ffffff'; g.fill(); }
    // Little hearts tumbling with the fluff.
    for (let i = 0; i < 3; i++){ const a = t * 2.6 + i * 2.1, hx = x + Math.cos(a) * 0.16, hy = dy + Math.sin(a) * 0.12; g.beginPath(); g.moveTo(hx, hy + 0.025); g.bezierCurveTo(hx - 0.04, hy, hx - 0.02, hy - 0.035, hx, hy - 0.015); g.bezierCurveTo(hx + 0.02, hy - 0.035, hx + 0.04, hy, hx, hy + 0.025); g.fillStyle = '#ef476f'; g.fill(); }
    g.restore();
    circ(x - 0.1, dy - 0.12, 0.05); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill();
    rr(x - 0.12, dy - 0.38, 0.24, 0.08, 0.03); fs('#f4a261', 0.02);
    // A bear waiting on the nozzle, puffing up and back.
    const puff = 0.85 + Math.sin(t * 3) * 0.08;
    g.save(); g.translate(x + 0.42, y - 0.42); g.scale(puff, puff); miniBear(0, 0.06, 0.9, '#e0a96d', '#ff8fab', 2); g.restore();
    rr(x + 0.3, y - 0.42, 0.06, 0.04, 0.01); fs('#a0a8b0', 0.01);
    // A sign on top.
    rr(x - 0.24, dy - 0.56, 0.48, 0.16, 0.05); fs('#fffaf3', 0.02); text('STUFF ME!', x, dy - 0.48, 0.07, '#ef476f', 700);
    return true;
  }
  if (ic === 'skate' && H >= 3){
    // A little quarter pipe with a demo board rolling up and back down it.
    const [x, y] = local(u, 0.1, 2.3, 1.0, 0.45);
    shadow(x + 0.5, y + 0.45, 0.55, 0.08);
    box(x, y, 1.0, 0.45, 0.12, '#c9c9c9', '#a8a8a8');
    // The ramp curve rising on the right.
    g.beginPath(); g.moveTo(x + 0.45, y + 0.45 - 0.12); g.quadraticCurveTo(x + 0.95, y + 0.45 - 0.12, x + 1.0, y + 0.45 - 0.62); g.lineTo(x + 1.0, y + 0.45 - 0.12); g.closePath(); fs('#dfe3e8', 0.025);
    rr(x + 0.97, y + 0.45 - 0.66, 0.06, 0.06, 0.02); fs('#80ffdb', 0.015);
    // The board: rolls right, climbs the curve, hangs, rolls back.
    const k = (Math.sin(t * 1.6) + 1) / 2, bx = x + 0.12 + k * 0.78, rise = Math.max(0, (k - 0.45) / 0.55);
    const by = y + 0.45 - 0.14 - rise * rise * 0.42, ang = -rise * 1.1;
    g.save(); g.translate(bx, by); g.rotate(ang);
    rr(-0.13, -0.04, 0.26, 0.04, 0.02); fs(DECKS[(u.id) % DECKS.length], 0.015);
    for (const wx of [-0.08, 0.08]){ circ(wx, 0.015, 0.025); fs('#80ffdb', 0.01); }
    g.restore();
    return true;
  }
  if (ic === 'glasses' && H >= 3){
    // An eye chart on a stand, and a try-on table with a mirror.
    const [x, y] = local(u, 0.35, 2.0);
    shadow(x, y, 0.18, 0.06);
    rr(x - 0.02, y - 0.5, 0.04, 0.5, 0.01); fs('#a0a8b0', 0.015); ell(x, y, 0.12, 0.04); fs('#a0a8b0', 0.015);
    rr(x - 0.2, y - 1.06, 0.4, 0.58, 0.03); fs('#fff', 0.025);
    ['E', 'F P', 'T O Z', 'L P E D'].forEach((s, i) => text(s, x, y - 0.96 + i * 0.12, 0.11 - i * 0.02, i ? '#2b2d42' : '#c1121f', 700));
    const [mx, my] = local(u, 0.15, 1.15, 0.65, 0.3);
    box(mx, my, 0.65, 0.3, 0.3, '#fffaf3', '#c9e4e7');
    ell(mx + 0.2, my - 0.3 - 0.18, 0.12, 0.16); fs('#00798c', 0.02); ell(mx + 0.2, my - 0.3 - 0.18, 0.09, 0.13); fs('#d6eef7', 0.01);
    for (let i = 0; i < 2; i++) for (const sx of [-1, 1]){ circ(mx + 0.42 + i * 0.12 + sx * 0.025, my - 0.27, 0.02); g.strokeStyle = FRAMES[i + 3]; g.lineWidth = 0.012; g.stroke(); }
    return true;
  }
  return false;
}

/* ---------- Attractions: Strike Zone (bowling) and Putt Paradise (mini golf) ---------- */
// Both are 5×4 plots with four players at once. Each player runs through a round (bowl one frame, or putt one hole)
// over and over; `k` is how far into their visit they are, so the lanes and greens can show their ball.
export const ATTR = ['bowl', 'golf'];
// Who's playing in each seat right now, by unit id (set each frame by the renderer).
export const live = new Map();
// Which way is 'beyond the ball' on a green, in store-local rows: golfers stand on the far side from us.
const side = u => u.face === 'down' ? 1 : -1;
export const CYCLE = { bowl: 7.2, golf: 8.4 };
const LANES = [0.7, 1.9, 3.1, 4.3];
// The golf holes, in store-local tiles: tee and cup along one row, with the golfer standing behind the ball.
export const HOLES = [
  { tee: [0.45, 1.0], cup: [2.2, 1.0], green: [0.25, 0.42, 2.15, 0.82], obstacle: 'windmill' },
  { tee: [2.85, 1.0], cup: [4.55, 1.0], green: [2.65, 0.42, 2.1, 0.82], obstacle: 'lighthouse' },
  { tee: [0.45, 2.25], cup: [2.2, 2.25], green: [0.25, 1.65, 2.15, 0.82], obstacle: 'bridge' },
  { tee: [2.85, 2.25], cup: [4.55, 2.25], green: [2.65, 1.65, 2.1, 0.82], obstacle: 'pond' },
];
export function seats(def, W, H, at, dl, u){
  if (def.attraction === 'bowl'){
    return LANES.map((lx, lane) => ({ lane, lx, ly: 3.15, at: at(lx, 3.15), path: [at(dl, H - 0.3), at(lx, H - 0.3), at(lx, 3.15)] }));
  }
  return HOLES.map((h, hole) => {
    const [lx, ly] = h.tee, sy = ly - 0.16 * side(u);   // just behind the ball, so they face us across it
    return { hole, lx, ly: sy, at: at(lx, sy), path: [at(dl, H - 0.4), at(lx < 2 ? 0.2 : 2.55, H - 0.4), at(lx < 2 ? 0.2 : 2.55, ly + 0.45), at(lx, ly + 0.45), at(lx, sy)] };
  });
}
// Where things are along a bowling lane or putting line, in world coordinates.
const lanePt = (u, lx, ly) => { const [x, y] = local(u, lx, ly); return { x, y }; };

// Flat things on the floor: the lanes and approach, or the greens. Drawn under everyone.
export function floorLayer(u, def){
  if (def.attraction === 'bowl'){
    const up = u.face !== 'down';
    for (const lx of LANES){
      const [gx, gy, gw, gd] = local(u, lx - 0.42, 0.25, 0.84, 2.45);
      // Gutters, then the polished maple lane with its boards, arrows and dots.
      rr(gx, gy, gw, gd, 0.03); fs('#9aa3ab', 0.03);
      const [lx0, ly0, lw, ld] = local(u, lx - 0.33, 0.25, 0.66, 2.45);
      const gr = g.createLinearGradient(lx0, 0, lx0 + lw, 0); gr.addColorStop(0, '#e9c48f'); gr.addColorStop(0.5, '#f6dcb0'); gr.addColorStop(1, '#e9c48f');
      g.fillStyle = gr; g.fillRect(lx0, ly0, lw, ld);
      g.strokeStyle = 'rgba(160,110,60,.25)'; g.lineWidth = 0.01; g.beginPath(); for (let i = 1; i < 8; i++){ g.moveTo(lx0 + i * lw / 8, ly0); g.lineTo(lx0 + i * lw / 8, ly0 + ld); } g.stroke();
      // The shine of fresh oil, brightest near the foul line.
      g.save(); g.globalAlpha = 0.35; const sh = g.createLinearGradient(0, ly0, 0, ly0 + ld); sh.addColorStop(up ? 0 : 1, '#ffffff'); sh.addColorStop(up ? 1 : 0, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(lx0 + lw * 0.2, ly0, lw * 0.6, ld); g.restore();
      for (let i = 0; i < 5; i++){ const p = lanePt(u, lx - 0.24 + i * 0.12, 1.75 - Math.abs(i - 2) * 0.1); g.beginPath(); g.moveTo(p.x, p.y + (up ? 0.06 : -0.06)); g.lineTo(p.x - 0.03, p.y + (up ? -0.03 : 0.03)); g.lineTo(p.x + 0.03, p.y + (up ? -0.03 : 0.03)); g.closePath(); g.fillStyle = '#5a3a2e'; g.fill(); }
      for (let i = 0; i < 5; i++){ const p = lanePt(u, lx - 0.24 + i * 0.12, 2.48); circ(p.x, p.y, 0.015); g.fillStyle = '#5a3a2e'; g.fill(); }
      // The foul line.
      const f0 = lanePt(u, lx - 0.42, 2.7); g.fillStyle = '#e63946'; g.fillRect(f0.x, f0.y - 0.015, 0.84, 0.03);
      // The approach, a lighter wood.
      const [ax, ay, aw, ad] = local(u, lx - 0.42, 2.72, 0.84, 0.75); g.fillStyle = '#f2dcb8'; g.fillRect(ax, ay, aw, ad);
      g.strokeStyle = 'rgba(160,110,60,.2)'; g.lineWidth = 0.01; g.beginPath(); for (let i = 1; i < 6; i++){ g.moveTo(ax + i * aw / 6, ay); g.lineTo(ax + i * aw / 6, ay + ad); } g.stroke();
      // The pin deck, where the pins stand.
      const [px, py, pw, pd] = local(u, lx - 0.33, 0.25, 0.66, 0.6); g.fillStyle = '#f9ecd2'; g.fillRect(px, py, pw, pd);
    }
    return;
  }
  // Mini golf: four greens with brick edges, on astroturf with a little path between them.
  for (const h of HOLES){
    const [gx, gy, gw, gd] = local(u, ...h.green);
    rr(gx - 0.06, gy - 0.06, gw + 0.12, gd + 0.12, 0.14); fs('#b5651d', 0.03);
    rr(gx, gy, gw, gd, 0.1); fs('#3fae6a', 0.02);
    g.save(); rr(gx, gy, gw, gd, 0.1); g.clip(); g.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < gw / 0.3; i += 2) g.fillRect(gx + i * 0.3, gy, 0.3, gd); g.restore();
    // Brick pattern on the rim.
    g.strokeStyle = 'rgba(90,40,20,.35)'; g.lineWidth = 0.012; g.beginPath(); for (let x = gx; x < gx + gw; x += 0.18){ g.moveTo(x, gy - 0.06); g.lineTo(x, gy); g.moveTo(x + 0.09, gy + gd); g.lineTo(x + 0.09, gy + gd + 0.06); } g.stroke();
    const tee = lanePt(u, ...h.tee), cup = lanePt(u, ...h.cup);
    rr(tee.x - 0.12, tee.y - 0.08, 0.24, 0.16, 0.03); fs('#2d6a4f', 0.015);
    ell(cup.x, cup.y, 0.075, 0.04); fs('#1b4332', 0.015); ell(cup.x, cup.y + 0.01, 0.06, 0.025); g.fillStyle = '#0d2818'; g.fill();
    if (h.obstacle === 'bridge'){
      // A stream across the green.
      const s0 = lanePt(u, 1.25, h.tee[1] - 0.08 * side(u)), s1 = lanePt(u, 1.6, h.tee[1] + 0.22 * side(u));
      g.fillStyle = '#4cc9f0'; g.fillRect(s0.x, Math.min(s0.y, s1.y), s1.x - s0.x, Math.abs(s1.y - s0.y));
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 0.015; g.beginPath(); for (let k = 0; k < 4; k++){ const yy = Math.min(s0.y, s1.y) + 0.1 + k * 0.18; g.moveTo(s0.x + 0.05, yy); g.quadraticCurveTo(s0.x + 0.17, yy - 0.04, s1.x - 0.05, yy); } g.stroke();
    }
    if (h.obstacle === 'pond'){
      const p = lanePt(u, 3.7, h.tee[1] + 0.12 * side(u));
      ell(p.x, p.y, 0.32, 0.1); fs('#48cae4', 0.02); ell(p.x - 0.12, p.y + 0.01, 0.08, 0.035); fs('#52b788', 0.012);
    }
  }
}
// Tall things and moving parts: the pinsetters and pins and balls, or the windmill, lighthouse, bridge and fountain.
// live[i] is the player in seat i: { k: seconds into their visit, seed, ball } or null.
// How far down the screen each green sits, so a face-up course sorts its windmill and lighthouse in among the golfers.
export const holeY = (u, i) => lanePt(u, ...HOLES[i].tee).y;
export function backLayer(u, def, t, live = [], only){
  const down = u.face === 'down', dir = down ? 1 : -1;
  if (def.attraction === 'bowl'){
    // The masking panel over the pin decks: lane numbers and a starry neon stripe.
    if (down){
      const [mx, my] = local(u, 0.1, 0.0); box(mx, my + 0.25, u.w - 0.2, 0.25, 0.55, '#1b263b', '#0d1b2a');
      const top = my + 0.25 - 0.55;
      g.strokeStyle = '#ff4d6d'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(mx + 0.1, top + 0.08); g.lineTo(mx + u.w - 0.3, top + 0.08); g.stroke();
      g.strokeStyle = '#80ffdb'; g.beginPath(); g.moveTo(mx + 0.1, top + 0.14); g.lineTo(mx + u.w - 0.3, top + 0.14); g.stroke();
      LANES.forEach((lx, i) => text(String(i + 1), mx + lx - 0.1, top + 0.33, 0.14, '#ffd23f', 700));
    }
    ballReturns(u);
    LANES.forEach((lx, i) => bowlingLane(u, lx, i, live[i], t, dir));
    return;
  }
  HOLES.forEach((h, i) => { if (only === undefined || only === i) golfHole(u, h, i, live[i], t, dir); });
}
// Ten pins on the deck, head pin nearest the bowler. Rows step back toward the pinsetter.
const PIN_ROWS = [[0], [-1, 1], [-2, 0, 2], [-3, -1, 1, 3]];
function bowlState(p){
  if (!p) return null;
  const c = CYCLE.bowl, k = p.k % c, n = Math.floor(p.k / c), r = hash(p.seed * 7 + 1, n);
  const strike = r < 0.42, left = strike ? 10 : Math.floor(2 + r * 7);
  return { k, n, strike, down: strike ? 10 : 10 - left, seed: p.seed, ball: p.ball };
}
function bowlingLane(u, lx, lane, p, t, dir){
  const st = bowlState(p);
  const pinY = ly => lanePt(u, lx, ly);
  // Pins: stand, get knocked flying, swept away, then set back down.
  let hit = 0, gone = false, reset = 1;
  if (st){
    hit = seg(st.k, 4.15, 4.6);
    gone = st.k > 5.25 && st.k < 6.05;
    reset = st.k < 5.25 ? 1 : st.k < 6.05 ? 0 : seg(st.k, 6.05, 6.6);
  }
  const R = mulberry((st ? st.seed * 31 + st.n : lane) + 5);
  const pins = [];
  PIN_ROWS.forEach((row, ri) => row.forEach(col => pins.push({ lx: lx + col * 0.065, ly: 0.82 - ri * 0.11, fall: R() })));
  const falls = new Set();
  if (st){ const order = pins.map((q, i) => i).sort((a, b) => Math.abs(pins[a].lx - lx) - Math.abs(pins[b].lx - lx)); for (let i = 0; i < st.down; i++) falls.add(order[i]); }
  // Farthest first, so nearer pins overlap them.
  const draw = pins.map((q, i) => ({ ...q, i })).sort((a, b) => dir > 0 ? a.ly - b.ly : b.ly - a.ly);
  for (const q of draw){
    const knocked = falls.has(q.i), at = pinY(q.ly);
    if (gone) continue;
    if (reset < 1){ g.save(); g.globalAlpha = reset; }
    if (knocked && hit > 0){
      const sx = (q.lx - lx) * 3 + (q.fall - 0.5) * 1.2, fly = hit;
      pin(at.x + sx * fly * 0.25, at.y - dir * fly * 0.15 - Math.sin(fly * Math.PI) * 0.18, (sx >= 0 ? 1 : -1) * fly * (1.4 + q.fall), 1 - fly * 0.15);
    } else pin(at.x, at.y, 0, 1);
    if (reset < 1) g.restore();
  }
  // The sweep bar comes down to clear the deck.
  if (st && st.k > 5.0 && st.k < 6.2){
    const s = seg(st.k, 5.0, 5.3) * (1 - seg(st.k, 5.9, 6.2)), a = pinY(0.95 - s * 0.6);
    rr(a.x - 0.36, a.y - 0.32, 0.72, 0.06, 0.02); fs('#a0a8b0', 0.02);
  }
  if (!st) return;
  // The ball: in the bowler's hand until the release, then down the lane with a little hook, into the pins.
  if (st.k > 2.25 && st.k < 4.7){
    const r = seg(st.k, 2.3, 4.2), hook = Math.sin(r * Math.PI) * 0.12 * (lane % 2 ? 1 : -1) * (st.strike ? 0.6 : 1.4);
    const ly = 2.62 - r * 1.8 - (st.k > 4.2 ? (st.k - 4.2) * 0.4 : 0), at = pinY(ly);
    if (st.k < 4.55){ ball(at.x + hook, at.y - 0.09, 0.09 * (1 - r * 0.15), st.ball, st.k * 9 * dir); }
  }
  // The score flashes on the masking panel after the pins fall.
  if (st.k > 4.4 && st.k < 6.0){
    const a = pinY(-0.1), ty = dir > 0 ? a.y - 0.72 : a.y - 0.5, blink = Math.floor(st.k * 6) % 2;
    if (st.strike){ g.save(); g.shadowColor = '#ff4d6d'; g.shadowBlur = 8; text('STRIKE!', a.x, ty, 0.17, blink ? '#ffd23f' : '#ff4d6d', 700); g.restore(); }
    else text(String(st.down), a.x, ty, 0.16, '#80ffdb', 700);
  }
  // The ball comes back up the return beside the lane.
  if (st.k > 5.6 || st.k < 0.9){
    const rp = lanePt(u, lx + 0.52, 2.9); ball(rp.x, rp.y - 0.12, 0.07, st.ball, 0);
  }
}
// A ball return between lanes: a little hood with balls lined up.
function ballReturns(u){
  for (let i = 0; i < 3; i++){
    const p = lanePt(u, LANES[i] + 0.6, 2.95);
    box(p.x - 0.11, p.y - 0.2, 0.22, 0.4, 0.18, '#2b2d42', '#1b263b');
    for (let k = 0; k < 2; k++){ circ(p.x, p.y - 0.28 + k * 0.13, 0.06); fs(BALLS[(i * 2 + k) % BALLS.length], 0.015); }
  }
}
function pin(x, y, rot, s){
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * 0.6, s * 0.6);
  shadow(0, 0, 0.07, 0.025, 0.25);
  g.beginPath(); g.moveTo(0, -0.34); g.bezierCurveTo(0.06, -0.34, 0.06, -0.24, 0.035, -0.2); g.bezierCurveTo(0.1, -0.12, 0.1, -0.02, 0.06, 0); g.lineTo(-0.06, 0); g.bezierCurveTo(-0.1, -0.02, -0.1, -0.12, -0.035, -0.2); g.bezierCurveTo(-0.06, -0.24, -0.06, -0.34, 0, -0.34); fs('#fffaf3', 0.025);
  g.fillStyle = '#e63946'; g.fillRect(-0.04, -0.25, 0.08, 0.02); g.fillRect(-0.042, -0.22, 0.084, 0.015);
  g.restore();
}
function ball(x, y, r, col, spin){
  shadow(x, y + r, r * 0.9, r * 0.3, 0.2);
  circ(x, y, r); fs(col || BALLS[0], 0.025);
  for (let i = 0; i < 3; i++){ const a = spin + i * 0.5; circ(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.3 - r * 0.2, r * 0.13); fs('#1b263b', 0); }
  ell(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.15); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
}
function golfState(p){
  if (!p) return null;
  const c = CYCLE.golf, k = p.k % c, n = Math.floor(p.k / c), r = hash(p.seed * 13 + 3, n);
  return { k, n, ace: r < 0.3, seed: p.seed, ball: p.ball };
}
// The ball's path along a hole, from the tee (u = 0) to the cup (u = 1), with a curve around each obstacle.
function golfPath(h, f, sd){
  const [tx, ty] = h.tee, [cx] = h.cup, x = tx + (cx - tx) * f;
  const bump = h.obstacle === 'pond' ? -Math.sin(f * Math.PI) * 0.08 * sd : h.obstacle === 'lighthouse' ? Math.sin(f * Math.PI * 2) * 0.08 : 0;
  return [x, ty + bump];
}
function golfHole(u, h, i, p, t, dir){
  const st = golfState(p);
  // Obstacles.
  if (h.obstacle === 'windmill') windmill(u, t);
  else if (h.obstacle === 'lighthouse') lighthouse(u, t);
  else if (h.obstacle === 'bridge'){
    const a = lanePt(u, 1.15, h.tee[1] + 0.04 * side(u)), b = lanePt(u, 1.7, h.tee[1] + 0.04 * side(u));
    g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, a.y - 0.22, b.x, b.y); g.lineTo(b.x, b.y - 0.06); g.quadraticCurveTo((a.x + b.x) / 2, a.y - 0.28, a.x, a.y - 0.06); g.closePath(); fs('#c98b55', 0.02);
    for (const xx of [a.x + 0.06, b.x - 0.06]){ rr(xx - 0.015, a.y - 0.32, 0.03, 0.26, 0.01); fs('#8a5a44', 0.01); }
    g.strokeStyle = '#8a5a44'; g.lineWidth = 0.02; g.beginPath(); g.moveTo(a.x + 0.06, a.y - 0.3); g.quadraticCurveTo((a.x + b.x) / 2, a.y - 0.48, b.x - 0.06, b.y - 0.3); g.stroke();
  } else if (h.obstacle === 'pond'){
    // A frog on the lily pad, and a fountain jet that pulses.
    const p0 = lanePt(u, 3.7, h.tee[1] + 0.12 * side(u));
    const jet = 0.3 + Math.abs(Math.sin(t * 1.8)) * 0.25;
    for (let k = 0; k < 5; k++){ const a = -Math.PI / 2 + (k - 2) * 0.3, f = ((t * 1.5 + k * 0.2) % 1); circ(p0.x + 0.1 + Math.cos(a) * f * 0.2, p0.y - jet * Math.sin(f * Math.PI) - 0.02, 0.025); g.fillStyle = 'rgba(220,245,255,.9)'; g.fill(); }
    g.strokeStyle = 'rgba(220,245,255,.9)'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(p0.x + 0.1, p0.y - 0.02); g.lineTo(p0.x + 0.1, p0.y - jet); g.stroke();
    const fx = p0.x - 0.12, fy = p0.y + 0.0, hop = Math.max(0, Math.sin(t * 1.2 + i)) ** 8 * 0.08;
    ell(fx, fy - 0.04 - hop, 0.06, 0.045); fs('#7bd389', 0.015); for (const sx of [-1, 1]){ circ(fx + sx * 0.03, fy - 0.09 - hop, 0.02); fs('#fff', 0.01); circ(fx + sx * 0.03, fy - 0.09 - hop, 0.008); fs(OUT, 0); }
  }
  // The flag in the cup (lifted while the ball's dropping in).
  const cup = lanePt(u, ...h.cup), wave = Math.sin(t * 3 + i) * 0.03, lift = st && st.k > 3.85 && st.k < 4.8 ? 0.0 : 0;
  rr(cup.x - 0.012, cup.y - 0.62 - lift, 0.024, 0.62, 0.01); fs('#e9ecef', 0.012);
  g.beginPath(); g.moveTo(cup.x + 0.012, cup.y - 0.62); g.quadraticCurveTo(cup.x + 0.12, cup.y - 0.58 + wave, cup.x + 0.24, cup.y - 0.54 + wave); g.lineTo(cup.x + 0.012, cup.y - 0.46); g.closePath(); fs(['#ef476f', '#ffd23f', '#5a8dee', '#9b5de5'][i], 0.015);
  text(String(i + 1), cup.x + 0.09, cup.y - 0.54, 0.08, '#fff', 700);
  if (!st) return;
  // The ball: on the tee, putted along (curving round the obstacle), into the cup, then back on the tee.
  const k = st.k;
  let f = 0, show = true, sink = 0;
  if (k < 2.05) f = 0;
  else if (k < 4.0){ const r = (k - 2.05) / 1.95, e = 1 - (1 - r) * (1 - r); f = st.ace ? e : e * 0.9; }
  else if (!st.ace && k < 5.4) f = 0.9 + seg(k, 5.0, 5.35) * 0.1;      // short: tapped in once the golfer walks up
  else f = 1;
  if (st.ace && k > 3.85) sink = seg(k, 3.85, 4.0);
  if (!st.ace && k > 5.25) sink = seg(k, 5.25, 5.4);
  if (k > 5.6 && k < 7.9) show = false;                                    // in the golfer's hand
  if (k >= 7.9){ f = 0; sink = 0; }
  if (show && sink < 1){
    const [bx, by] = golfPath(h, f, side(u)), at = lanePt(u, bx, by);
    // Hopping over the bridge.
    const hop = h.obstacle === 'bridge' && f > 0.4 && f < 0.6 ? Math.sin((f - 0.4) / 0.2 * Math.PI) * 0.12 : 0;
    shadow(at.x, at.y + 0.02, 0.05, 0.02, 0.25);
    circ(at.x, at.y - 0.03 - hop, 0.045 * (1 - sink)); fs(st.ball || '#fff', 0.015);
  }
  // A hole in one: sparkles and a cheer over the green.
  if (st.ace && k > 4.0 && k < 5.6){
    const a = (k - 4.0) / 1.6;
    for (let s = 0; s < 6; s++){ const ang = s * 1.05 + a * 2, d = 0.1 + a * 0.35; circ(cup.x + Math.cos(ang) * d, cup.y - 0.2 + Math.sin(ang) * d * 0.6 - a * 0.2, 0.03 * (1 - a)); g.fillStyle = ['#ffd23f', '#ff4d6d', '#80ffdb'][s % 3]; g.fill(); }
    g.save(); g.globalAlpha = 1 - a * 0.6; text('HOLE IN ONE!', cup.x - 0.25, cup.y - 0.9 - a * 0.2, 0.12, '#ffd23f', 700); g.restore();
  }
}
// The windmill: a little red mill whose sails turn all day.
function windmill(u, t){
  const p = lanePt(u, 1.35, u.face === 'down' ? 0.55 : 0.55);
  shadow(p.x, p.y, 0.24, 0.07);
  g.beginPath(); g.moveTo(p.x - 0.2, p.y); g.lineTo(p.x - 0.14, p.y - 0.6); g.lineTo(p.x + 0.14, p.y - 0.6); g.lineTo(p.x + 0.2, p.y); g.closePath(); fs('#e63946', 0.025);
  g.beginPath(); g.moveTo(p.x - 0.17, p.y - 0.6); g.lineTo(p.x, p.y - 0.78); g.lineTo(p.x + 0.17, p.y - 0.6); g.closePath(); fs('#8a5a44', 0.025);
  rr(p.x - 0.06, p.y - 0.2, 0.12, 0.2, 0.05); fs('#3d2b35', 0.015);
  rr(p.x - 0.05, p.y - 0.45, 0.1, 0.1, 0.02); fs('#fff3c4', 0.015);
  const hx = p.x, hy = p.y - 0.58;
  for (let i = 0; i < 4; i++){
    g.save(); g.translate(hx, hy); g.rotate(t * 1.4 + i * Math.PI / 2);
    rr(-0.02, -0.42, 0.04, 0.4, 0.01); fs('#8a5a44', 0.012);
    rr(0.02, -0.4, 0.11, 0.3, 0.01); fs('#fffaf3', 0.015);
    g.strokeStyle = 'rgba(138,90,68,.5)'; g.lineWidth = 0.008; g.beginPath(); for (let k = 1; k < 4; k++){ g.moveTo(0.02, -0.4 + k * 0.075); g.lineTo(0.13, -0.4 + k * 0.075); } g.stroke();
    g.restore();
  }
  circ(hx, hy, 0.04); fs('#ffd23f', 0.015);
}
// The lighthouse: striped, with a lamp whose beam sweeps round.
function lighthouse(u, t){
  const p = lanePt(u, 3.75, 0.55);
  shadow(p.x, p.y, 0.2, 0.06);
  g.beginPath(); g.moveTo(p.x - 0.15, p.y); g.lineTo(p.x - 0.09, p.y - 0.78); g.lineTo(p.x + 0.09, p.y - 0.78); g.lineTo(p.x + 0.15, p.y); g.closePath(); fs('#fffaf3', 0.025);
  g.save(); g.clip(); g.fillStyle = '#e63946'; for (let k = 0; k < 4; k++) g.fillRect(p.x - 0.2, p.y - 0.12 - k * 0.2, 0.4, 0.08); g.restore();
  rr(p.x - 0.12, p.y - 0.84, 0.24, 0.07, 0.02); fs('#2b2d42', 0.02);
  rr(p.x - 0.08, p.y - 0.98, 0.16, 0.14, 0.03); fs('#fff3b0', 0.02);
  g.beginPath(); g.moveTo(p.x - 0.1, p.y - 0.98); g.lineTo(p.x, p.y - 1.08); g.lineTo(p.x + 0.1, p.y - 0.98); g.closePath(); fs('#e63946', 0.02);
  // The beam.
  const a = t * 1.6, sw = Math.cos(a);
  g.save(); g.globalAlpha = 0.25 + Math.max(0, Math.sin(a)) * 0.35;
  g.beginPath(); g.moveTo(p.x, p.y - 0.91); g.lineTo(p.x + sw * 0.9, p.y - 1.02); g.lineTo(p.x + sw * 0.9, p.y - 0.8); g.closePath(); g.fillStyle = '#fff6a8'; g.fill();
  g.restore();
}
// How a player moves through one round, given seconds k into it. Returns where they stand (store-local offset
// from their seat), their pose and anything in hand.
export function playerPose(kind, k, seat, u){
  const dir = u.face === 'down' ? -1 : 1;     // toward the pins/back wall in world y
  if (kind === 'bowl'){
    const c = k % CYCLE.bowl;
    // Pick the ball up at the return, step up four steps, swing, release, watch it go, then walk back.
    const fwd = c < 1.0 ? 0 : c < 2.0 ? seg(c, 1.0, 2.0) : c < 5.0 ? 1 : 1 - seg(c, 5.0, 6.0);
    const walk = (c > 1.0 && c < 2.0) || (c > 5.0 && c < 6.0);
    let swing = 0;          // -1 back, +1 forward
    if (c < 1.0) swing = 0;
    else if (c < 2.0) swing = -Math.sin(seg(c, 1.0, 2.0) * Math.PI * 0.75);
    else if (c < 2.4) swing = -0.7 + seg(c, 2.0, 2.35) * 1.7;
    else if (c < 3.0) swing = 1 - seg(c, 2.4, 3.0) * 0.6;
    const st = bowlState({ k, seed: seat.seed, ball: seat.ball });
    return {
      dy: dir * fwd * 0.42, walk, back: (dir < 0) !== (c > 5.0 && c < 6.0),
      holdBall: c > 0.35 && c < 2.3, swing, crouch: c > 2.0 && c < 2.8 ? seg(c, 2.0, 2.3) * 0.6 * (1 - seg(c, 2.5, 2.8)) : 0,
      cheer: st && st.strike && c > 4.3 && c < 5.0, ballGrab: c > 0.1 && c < 0.35,
    };
  }
  // Golf: line up and take a couple of practice swings, putt, watch, walk up to the cup, fish the ball out, walk back.
  const c = k % CYCLE.golf, st = golfState({ k, seed: seat.seed });
  const h = HOLES[seat.hole], len = h.cup[0] - h.tee[0];
  let fx = 0, walk = false, swing = 0, crouch = 0, cheer = false, flip = false;
  if (c < 1.4) swing = Math.sin(c / 1.4 * Math.PI * 2) * 0.18;
  else if (c < 1.9) swing = -seg(c, 1.4, 1.9) * 0.55;
  else if (c < 2.05) swing = -0.55 + seg(c, 1.9, 2.05) * 0.9;
  else if (c < 2.5) swing = 0.35 - seg(c, 2.05, 2.5) * 0.35;
  if (st.ace && c > 4.0 && c < 4.7) cheer = true;
  // Short putt: walk up and tap it in.
  const up = st.ace ? [4.7, 5.5] : [4.1, 4.95];
  if (c > up[0] && c < up[1]){ fx = seg(c, up[0], up[1]) * (len - 0.15); walk = true; }
  else if (c >= up[1] && c < 6.2){ fx = len - 0.15; if (!st.ace && c < 5.4) swing = c < 5.15 ? -seg(c, 4.95, 5.15) * 0.3 : -0.3 + seg(c, 5.15, 5.25) * 0.5; if (c > 5.5) crouch = seg(c, 5.5, 5.7) * (1 - seg(c, 5.9, 6.2)); }
  else if (c >= 6.2 && c < 7.8){ fx = (len - 0.15) * (1 - seg(c, 6.2, 7.8)); walk = true; flip = true; }
  return { dx: fx, walk, swing, crouch, cheer, flip, putter: true };
}
// The putter or bowling ball, drawn over a player in person()'s frame (feet at 0, 0).
export function prop(o){
  if (o.putter){
    // Both hands on the grip in front, the head swinging like a pendulum just above the ground.
    const a = o.swing || 0, gx = 0.0, gy = -0.36;
    if (o.walkProp){
      g.save(); g.translate(0.24, -0.32); g.rotate(-0.25);
      rr(-0.012, 0, 0.024, 0.42, 0.01); fs('#a0a8b0', 0.012); rr(-0.02, 0.4, 0.09, 0.04, 0.015); fs('#3d405b', 0.012);
      g.restore(); return;
    }
    g.save(); g.translate(gx, gy); g.rotate(-a);
    rr(-0.025, -0.06, 0.05, 0.1, 0.02); fs('#2b2d42', 0.012);
    rr(-0.011, 0.02, 0.022, 0.42, 0.01); fs('#c0c6cc', 0.012);
    rr(-0.02, 0.42, 0.12, 0.05, 0.015); fs('#3d405b', 0.015);
    g.restore();
    return;
  }
  if (o.bowlBall){
    const h = bowlHand(o);
    if (!h) return;
    const [hx, hy] = h;
    circ(hx, hy, 0.11); fs(o.bowlBall, 0.025);
    if (!o.back) for (let i = 0; i < 3; i++){ circ(hx - 0.03 + i * 0.03, hy - 0.04 + (i === 1 ? -0.02 : 0), 0.015); fs('#1b263b', 0); }
    ell(hx - 0.04, hy - 0.05, 0.03, 0.02); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
  }
}
// Where the bowling hand is (person()'s frame): at the side, swinging back and through. Seen from behind, the
// backswing brings the ball up toward us; seen from the front it goes behind the body (null: hidden).
export function bowlHand(o){
  const a = o.swing || 0;
  if (o.back) return [0.24, -0.3 - Math.max(0, -a) * 0.32 + Math.max(0, a) * 0.1];
  if (a < -0.35) return null;
  return [0.24 + Math.max(0, a) * 0.04, -0.3 + Math.max(0, a) * 0.06 - Math.max(0, -a) * 0.1];
}
export const ballColor = id => BALLS[id % BALLS.length];

/* ---------- Decor ---------- */
// Popcorn cart: a red cart with a glass case where kernels pop and tumble; a shopper buys a striped box.
export function popcornCart(x, y, t, live){
  shadow(x, y + 0.02, 0.36, 0.1);
  for (const wx of [x - 0.22, x + 0.22]){ circ(wx, y - 0.06, 0.09); fs('#2b2d42', 0.025); circ(wx, y - 0.06, 0.035); fs('#ffd23f', 0); }
  box(x - 0.3, y - 0.08, 0.6, 0.2, 0.36, '#ff6b6b', '#e63946');
  rr(x - 0.24, y - 0.32, 0.48, 0.08, 0.02); fs('#ffd23f', 0.015); text('POPCORN', x, y - 0.28, 0.06, '#e63946', 700);
  // The glass case.
  const cx = x - 0.24, cy = y - 0.92, cw = 0.48, ch = 0.5;
  rr(cx, cy, cw, ch, 0.03); fs('rgba(225,245,255,.6)', 0.025);
  g.save(); rr(cx, cy, cw, ch, 0.03); g.clip();
  // A drift of popped corn in the bottom, and kernels popping up from the kettle.
  for (let i = 0; i < 14; i++){ circ(cx + 0.04 + (i % 7) * 0.066, cy + ch - 0.04 - Math.floor(i / 7) * 0.05, 0.035); g.fillStyle = i % 4 ? '#fff8dc' : '#ffe8a3'; g.fill(); }
  rr(x - 0.07, cy + 0.08, 0.14, 0.1, 0.03); g.fillStyle = '#a0a8b0'; g.fill();
  for (let i = 0; i < 7; i++){
    const f = (t * 1.1 + i * 0.143) % 1, px = x + Math.sin(i * 2.3) * 0.18 * f, py = cy + 0.15 - Math.sin(f * Math.PI) * 0.1 + f * 0.25;
    circ(px, py, 0.026); g.fillStyle = '#fff8dc'; g.fill();
  }
  g.restore();
  rr(cx - 0.02, cy - 0.06, cw + 0.04, 0.08, 0.03); fs('#e63946', 0.02);
  // A striped roof.
  g.save(); g.beginPath(); g.moveTo(x - 0.34, cy - 0.06); g.lineTo(x, cy - 0.3); g.lineTo(x + 0.34, cy - 0.06); g.closePath(); g.clip();
  for (let i = -4; i < 4; i++){ g.fillStyle = i % 2 ? '#fff' : '#e63946'; g.fillRect(x + i * 0.09, cy - 0.3, 0.09, 0.26); }
  g.restore();
  g.beginPath(); g.moveTo(x - 0.34, cy - 0.06); g.lineTo(x, cy - 0.3); g.lineTo(x + 0.34, cy - 0.06); g.closePath(); fs(null, 0.025);
  // Scooping a box for a customer.
  if (live && live.k > 0.2 && live.k < 0.85){
    const k = (live.k - 0.2) / 0.65, bx = x + 0.32, by = y - 0.5 - Math.sin(k * Math.PI) * 0.1;
    g.beginPath(); g.moveTo(bx - 0.05, by - 0.1); g.lineTo(bx + 0.05, by - 0.1); g.lineTo(bx + 0.04, by + 0.03); g.lineTo(bx - 0.04, by + 0.03); g.closePath(); fs('#fff', 0.015);
    g.fillStyle = '#e63946'; g.fillRect(bx - 0.015, by - 0.1, 0.03, 0.13);
    for (let i = 0; i < 3; i++){ circ(bx - 0.03 + i * 0.03, by - 0.12, 0.022); fs('#fff8dc', 0.008); }
  }
}
// A model hot-air balloon tethered over a wicker basket, bobbing gently.
export function hotAirBalloon(x, y, t){
  const bob = Math.sin(t * 0.9) * 0.06, bx = x + 1, by = y + 1.6;
  shadow(bx, by + 0.1, 0.62, 0.18, 0.18);
  // A round base with flowers.
  ell(bx, by, 0.62, 0.22); fs('#c49a6c', 0.03); ell(bx, by - 0.05, 0.56, 0.18); fs('#7bd389', 0.02);
  for (let i = 0; i < 9; i++){ const a = i * 0.7; circ(bx + Math.cos(a) * 0.45, by - 0.05 + Math.sin(a) * 0.14, 0.04); fs(['#ff8fab', '#ffd23f', '#fff'][i % 3], 0.01); }
  // Tethers.
  const top = by - 1.75 + bob;
  g.strokeStyle = 'rgba(61,43,53,.55)'; g.lineWidth = 0.015; g.beginPath(); g.moveTo(bx - 0.35, by - 0.05); g.lineTo(bx - 0.14, top + 1.0); g.moveTo(bx + 0.35, by - 0.05); g.lineTo(bx + 0.14, top + 1.0); g.stroke();
  // The basket.
  box(bx - 0.14, top + 1.12, 0.28, 0.12, 0.18, '#c98b55', '#a47148');
  g.strokeStyle = 'rgba(90,60,30,.4)'; g.lineWidth = 0.01; g.beginPath(); for (let i = 1; i < 4; i++){ g.moveTo(bx - 0.14 + i * 0.07, top + 1.06); g.lineTo(bx - 0.14 + i * 0.07, top + 1.24); } g.stroke();
  g.strokeStyle = OUT; g.lineWidth = 0.012; g.beginPath(); for (const sx of [-1, 1]){ g.moveTo(bx + sx * 0.13, top + 0.96); g.lineTo(bx + sx * 0.2, top + 0.75); } g.stroke();
  // The envelope, in colored gores.
  g.save(); g.beginPath(); g.moveTo(bx - 0.13, top + 0.82); g.bezierCurveTo(bx - 0.55, top + 0.55, bx - 0.55, top - 0.05, bx, top - 0.05); g.bezierCurveTo(bx + 0.55, top - 0.05, bx + 0.55, top + 0.55, bx + 0.13, top + 0.82); g.closePath(); g.clip();
  const cols = ['#ef476f', '#ffd23f', '#06d6a0', '#118ab2', '#9b5de5', '#ff9f1c'];
  for (let i = 0; i < 6; i++){ g.fillStyle = cols[i]; g.fillRect(bx - 0.55 + i * 0.184, top - 0.1, 0.19, 1.0); }
  g.fillStyle = 'rgba(255,255,255,.18)'; ell(bx - 0.18, top + 0.2, 0.12, 0.24, -0.2); g.fill();
  g.restore();
  g.beginPath(); g.moveTo(bx - 0.13, top + 0.82); g.bezierCurveTo(bx - 0.55, top + 0.55, bx - 0.55, top - 0.05, bx, top - 0.05); g.bezierCurveTo(bx + 0.55, top - 0.05, bx + 0.55, top + 0.55, bx + 0.13, top + 0.82); g.closePath(); fs(null, 0.035);
}
// An ice swan on a frosty plinth, sparkling, with the odd drip.
export function iceSwan(x, y, t){
  shadow(x, y, 0.3, 0.09);
  box(x - 0.26, y - 0.14, 0.52, 0.28, 0.3, '#e8f6ff', '#bfe3f5');
  const by = y - 0.44;
  // Body and a curling neck, all glassy blue.
  g.save(); g.globalAlpha = 0.92;
  ell(x, by - 0.12, 0.24, 0.13); fs('#d6f0fd', 0.025);
  g.beginPath(); g.moveTo(x + 0.06, by - 0.2); g.bezierCurveTo(x + 0.26, by - 0.38, x - 0.1, by - 0.56, x + 0.06, by - 0.72); g.lineTo(x + 0.13, by - 0.7); g.bezierCurveTo(x + 0.0, by - 0.56, x + 0.34, by - 0.4, x + 0.13, by - 0.18); g.closePath(); fs('#e3f5ff', 0.025);
  circ(x + 0.1, by - 0.74, 0.06); fs('#e3f5ff', 0.02); g.beginPath(); g.moveTo(x + 0.15, by - 0.75); g.lineTo(x + 0.24, by - 0.72); g.lineTo(x + 0.15, by - 0.7); g.closePath(); fs('#cdeefe', 0.015);
  g.beginPath(); g.moveTo(x - 0.2, by - 0.12); g.quadraticCurveTo(x - 0.34, by - 0.36, x - 0.08, by - 0.22); g.closePath(); fs('#cdeefe', 0.02);
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 0.02; g.beginPath(); g.moveTo(x - 0.12, by - 0.18); g.lineTo(x - 0.02, by - 0.2); g.moveTo(x + 0.08, by - 0.5); g.lineTo(x + 0.04, by - 0.58); g.stroke();
  // Sparkles.
  for (let i = 0; i < 4; i++){ const f = (t * 0.7 + i * 0.25) % 1, sx = x - 0.2 + i * 0.13, sy = by - 0.2 - i % 2 * 0.35, s = Math.sin(f * Math.PI) * 0.05; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(sx, sy - s); g.lineTo(sx + s * 0.3, sy); g.lineTo(sx, sy + s); g.lineTo(sx - s * 0.3, sy); g.closePath(); g.fill(); g.beginPath(); g.moveTo(sx - s, sy); g.lineTo(sx, sy + s * 0.3); g.lineTo(sx + s, sy); g.lineTo(sx, sy - s * 0.3); g.closePath(); g.fill(); }
  // A drip falls from the plinth's edge now and then.
  const d = (t * 0.5) % 1; if (d < 0.6){ circ(x + 0.2, y - 0.14 + d * 0.25, 0.015); g.fillStyle = 'rgba(150,210,240,.9)'; g.fill(); }
}
// A penny press: put in a coin, turn the big crank, and out comes a squashed penny with the mall on it.
export function pennyPress(x, y, r, t, live){
  shadow(x + 0.5, y + 0.82, 0.3, 0.09);
  const cx = x + 0.5, cy = y + 0.8;
  box(cx - 0.24, cy - 0.22, 0.48, 0.22, 0.8, '#c9a227', '#8d6e13');
  const top = cy - 0.22 - 0.8 + 0.22;
  rr(cx - 0.18, top + 0.08, 0.36, 0.3, 0.04); fs('#fff8dc', 0.02);
  text('SOUVENIR', cx, top + 0.15, 0.055, '#8d6e13', 700); text('PENNY', cx, top + 0.24, 0.07, '#c1121f', 700);
  // A little window showing the dies.
  rr(cx - 0.1, top + 0.42, 0.2, 0.12, 0.03); fs('#3d405b', 0.015); circ(cx, top + 0.48, 0.04); fs('#d08c60', 0.01);
  rr(cx - 0.06, top + 0.62, 0.12, 0.05, 0.02); fs('#2b2d42', 0.012);
  // The crank on the side: turning while someone's pressing a penny.
  const k = live ? live.k : 0, a = live ? k * Math.PI * 6 : 0.4;
  const hx = cx + 0.27, hy = top + 0.35;
  circ(hx, hy, 0.06); fs('#a0a8b0', 0.015);
  const ex = hx + Math.cos(a) * 0.2, ey = hy + Math.sin(a) * 0.12;
  g.strokeStyle = OUT; g.lineWidth = 0.04; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
  g.strokeStyle = '#c0c6cc'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
  circ(ex, ey, 0.045); fs('#e63946', 0.015);
  // The finished penny drops into the tray at the end.
  if (live && k > 0.85){ ell(cx, top + 0.66, 0.03, 0.05); fs('#d08c60', 0.01); }
  // Glints on the brass.
  if ((t * 0.6) % 1 < 0.15){ circ(cx - 0.18, top + 0.02, 0.025); g.fillStyle = '#fff'; g.fill(); }
}

/* ---------- Mall styles ---------- */
export const WALLPAPER = {
  brick: { face: '#f7d9d0', dark: '#e8b4a6', cap: '#ffffff', base: '#b5838d' },
  maple: { face: '#fff1dc', dark: '#e9a96a', cap: '#ffffff', base: '#8a5a44' },
};
export function wallPattern(id, P, w, top){
  if (id === 'brick'){
    // Painted brick in soft pastels: every brick a slightly different shade.
    const cols = ['#f7d9d0', '#f9e4dc', '#f3cfd8', '#e9dcf2', '#d9ecf2'];
    for (let r = 0; r * 0.17 < 1.05; r++){
      const yy = top + r * 0.17, off = (r % 2) * 0.17;
      for (let x = -off, i = 0; x < w; x += 0.34, i++){ g.fillStyle = cols[Math.floor(hash(i, r) * cols.length)]; g.fillRect(x + 0.015, yy + 0.015, 0.31, 0.14); }
    }
    g.fillStyle = '#ffffff'; g.fillRect(0, -0.5, w, 0.06);
  } else if (id === 'maple'){
    // Maple leaves in red, orange and gold drifting down a cream wall.
    for (let i = 0; i < w * 2; i++){
      const lx = (i * 0.5 + hash(i, 1) * 0.3), ly = top + 0.15 + hash(i, 2) * 0.75, rot = hash(i, 3) * 6, c = ['#d62828', '#f77f00', '#fcbf49', '#e76f51'][i % 4];
      g.save(); g.translate(lx, ly); g.rotate(rot); g.scale(0.11, 0.11);
      g.beginPath(); for (let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? 0.45 : 1; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * 0.9); } g.closePath(); g.fillStyle = c; g.fill();
      g.strokeStyle = 'rgba(90,40,20,.4)'; g.lineWidth = 0.15; g.beginPath(); g.moveTo(0, 0.2); g.lineTo(0, 1.3); g.stroke();
      g.restore();
    }
    g.fillStyle = '#c98b55'; g.fillRect(0, -0.6, w, 0.38); g.fillStyle = '#b07a4f'; for (let x = 0.2; x < w; x += 0.4) g.fillRect(x, -0.6, 0.02, 0.38);
  } else return false;
  return true;
}
export const FLOOR_KIND = { neoncheck: 'neoncheck', patchwork: 'patchwork' };
// Floors. R is the floor's random stream; returns true if it painted the kind.
export function floor(kind, x, y, w, h){
  if (kind === 'neoncheck'){
    // Black and white checks with glowing pink and teal piping.
    g.fillStyle = '#f6f1ff'; g.fillRect(x, y, w, h);
    g.fillStyle = '#2b2440';
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++) if ((i + j) % 2) g.fillRect(i, j, 1, 1);
    g.strokeStyle = 'rgba(255,79,160,.55)'; g.lineWidth = 0.03; g.beginPath();
    for (let i = Math.ceil(x / 2) * 2; i <= x + w; i += 2){ g.moveTo(i, y); g.lineTo(i, y + h); } g.stroke();
    g.strokeStyle = 'rgba(76,201,240,.55)'; g.beginPath(); for (let j = Math.ceil(y / 2) * 2; j <= y + h; j += 2){ g.moveTo(x, j); g.lineTo(x + w, j); } g.stroke();
  } else if (kind === 'patchwork'){
    // Encaustic tiles in a patchwork: each tile a different little pattern.
    g.fillStyle = '#efe6d8'; g.fillRect(x, y, w, h);
    const cols = ['#2a9d8f', '#e76f51', '#264653', '#e9c46a', '#b5838d'];
    for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++){
      const v = hash(i, j), c = cols[Math.floor(v * cols.length)], k = Math.floor(hash(j, i) * 4);
      g.fillStyle = '#f8f1e5'; g.fillRect(i + 0.03, j + 0.03, 0.94, 0.94);
      g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 0.05;
      if (k === 0){ g.beginPath(); g.moveTo(i + 0.5, j + 0.12); g.lineTo(i + 0.88, j + 0.5); g.lineTo(i + 0.5, j + 0.88); g.lineTo(i + 0.12, j + 0.5); g.closePath(); g.fill(); g.fillStyle = '#f8f1e5'; circ(i + 0.5, j + 0.5, 0.14); g.fill(); }
      else if (k === 1){ for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]){ g.beginPath(); g.arc(i + a, j + b, 0.42, 0, Math.PI * 2); g.stroke(); } }
      else if (k === 2){ for (let s = 0; s < 4; s++){ g.save(); g.translate(i + 0.5, j + 0.5); g.rotate(s * Math.PI / 2); g.beginPath(); g.ellipse(0, -0.24, 0.1, 0.2, 0, 0, Math.PI * 2); g.fill(); g.restore(); } }
      else { g.fillRect(i + 0.12, j + 0.12, 0.76, 0.76); g.fillStyle = '#f8f1e5'; g.fillRect(i + 0.24, j + 0.24, 0.52, 0.52); g.fillStyle = c; g.fillRect(i + 0.4, j + 0.4, 0.2, 0.2); }
    }
  } else if (kind === 'turf'){
    // Astroturf: two greens in wide mown stripes with flecks.
    g.fillStyle = '#5aa469'; g.fillRect(x, y, w, h);
    g.fillStyle = '#4f9a5f'; for (let i = Math.floor(x); i < x + w; i += 2) g.fillRect(i, y, 1, h);
    for (let k = 0; k < w * h * 12; k++){ g.fillStyle = k % 2 ? 'rgba(255,255,255,.08)' : 'rgba(0,60,20,.12)'; g.fillRect(x + hash(k, 7) * w, y + hash(k, 9) * h, 0.03, 0.06); }
  } else if (kind === 'concrete'){
    // Polished concrete with saw cuts.
    g.fillStyle = '#d4d4d4'; g.fillRect(x, y, w, h);
    for (let k = 0; k < w * h * 6; k++){ g.fillStyle = `rgba(${k % 2 ? '255,255,255' : '90,90,90'},.12)`; circ(x + hash(k, 3) * w, y + hash(k, 5) * h, 0.04 + hash(k, 8) * 0.06); g.fill(); }
    g.strokeStyle = 'rgba(90,90,90,.3)'; g.lineWidth = 0.02; g.beginPath();
    for (let i = Math.ceil(x / 1.5) * 1.5; i < x + w; i += 1.5){ g.moveTo(i, y); g.lineTo(i, y + h); }
    for (let j = Math.ceil(y / 1.5) * 1.5; j < y + h; j += 1.5){ g.moveTo(x, j); g.lineTo(x + w, j); } g.stroke();
  } else return false;
  return true;
}
