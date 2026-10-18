// v0.12 painters: the new decor (play area, topiary, photo booth, aquarium, massage chair, piano, flower arch) and
// the hot dog stand and pizzeria's pieces. Same conventions as art.js: tile units, drawn on art.js's current `g`.
import { g, rr, circ, ell, fs, box, shadow, text, storeIcon, mulberry, OUT } from './art.js';

const BALLS = ['#ef476f', '#ffd23f', '#5a8dee', '#06d6a0', '#ff9f43', '#9b5de5'];

/* ---------- Kids play area (3×2) ---------- */
// Where the kids play: the top of the slide, and two spots in the ball pit.
export function playSpots(d){
  return [
    { x: d.x + 0.62, y: d.y + 0.95, kind: 'slide' },
    { x: d.x + 2.05, y: d.y + 1.35, kind: 'pit' },
    { x: d.x + 2.5, y: d.y + 1.0, kind: 'pit' },
  ];
}
// The slide's path for a kid going down it, k from 0 (top) to 1 (bottom): x, y on the floor and z, the height.
export function slidePath(d, k){
  return { x: d.x + 0.62 + k * 0.85, y: d.y + 0.95 + k * 0.6, z: 0.75 * (1 - k) * (1 - k * 0.3) };
}
export function playArea(d, t){
  const x = d.x, y = d.y;
  shadow(x + 1.5, y + 1.95, 1.55, 0.14, 0.14);
  // Padded mat in big squares.
  for (let i = 0; i < 6; i++){ const cx = x + 0.08 + (i % 3) * 0.95, cy = y + 0.12 + Math.floor(i / 3) * 0.9; rr(cx, cy, 0.95, 0.9, 0.06); fs(['#bde0fe', '#ffe5a3', '#ffc8dd'][(i + Math.floor(i / 3)) % 3], 0.025); }
  // Back fence: soft padded posts with netting between.
  g.strokeStyle = 'rgba(61,43,53,.25)'; g.lineWidth = 0.015; g.beginPath();
  for (let k = 0; k <= 12; k++){ g.moveTo(x + 0.1 + k * 0.233, y + 0.1); g.lineTo(x + 0.1 + k * 0.233, y - 0.45); }
  for (let k = 0; k < 4; k++){ g.moveTo(x + 0.1, y - 0.45 + k * 0.15); g.lineTo(x + 2.9, y - 0.45 + k * 0.15); }
  g.stroke();
  for (const px of [x + 0.08, x + 1.5, x + 2.92]){ rr(px - 0.07, y - 0.55, 0.14, 0.68, 0.06); fs('#ef476f', 0.03); circ(px, y - 0.58, 0.09); fs('#ffd23f', 0.03); }
  // The ball pit: a padded ring full of balls.
  ell(x + 2.15, y + 1.2, 0.72, 0.5); fs('#5a8dee', 0.04);
  ell(x + 2.15, y + 1.16, 0.6, 0.4); fs('#e9f3ff', 0.02);
  const R = mulberry(d.id * 7 + 3);
  for (let i = 0; i < 26; i++){ const a = R() * Math.PI * 2, rad = Math.sqrt(R()); circ(x + 2.15 + Math.cos(a) * rad * 0.52, y + 1.16 + Math.sin(a) * rad * 0.33, 0.07); fs(BALLS[i % BALLS.length], 0.012); }
  // The slide tower: a little platform with a roof, a ladder at the back and a yellow slide curving down.
  box(x + 0.3, y + 0.55, 0.64, 0.5, 0.75, '#ffd166', '#f4a261');
  for (let k = 0; k < 4; k++){ rr(x + 0.36, y + 0.6 - 0.7 + k * 0.17, 0.14, 0.03, 0.01); fs('#e76f51', 0.01); }
  for (const px of [x + 0.32, x + 0.88]){ rr(px, y + 0.55 - 1.45, 0.05, 0.75, 0.02); fs('#ef476f', 0.02); }
  g.beginPath(); g.moveTo(x + 0.22, y - 0.85); g.lineTo(x + 0.62, y - 1.12); g.lineTo(x + 1.02, y - 0.85); g.closePath(); fs('#06d6a0', 0.035);
  g.beginPath();
  for (let k = 0; k <= 10; k++){ const p = slidePath(d, k / 10); (k ? g.lineTo : g.moveTo).call(g, p.x + 0.18, p.y - p.z - 0.05); }
  for (let k = 10; k >= 0; k--){ const p = slidePath(d, k / 10); g.lineTo(p.x - 0.12, p.y - p.z + 0.12); }
  g.closePath(); fs('#ffd23f', 0.04);
  g.beginPath(); for (let k = 0; k <= 10; k++){ const p = slidePath(d, k / 10); (k ? g.lineTo : g.moveTo).call(g, p.x + 0.03, p.y - p.z + 0.03); } g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 0.035; g.stroke();
}
// In front of the kids: the near edge of the ball pit (so pit kids sink in among the balls) and the front fence.
export function playFront(d){
  const x = d.x, y = d.y;
  g.save(); g.beginPath(); g.rect(x + 1.3, y + 1.2, 1.7, 0.6); g.clip();
  const R = mulberry(d.id * 11 + 1);
  for (let i = 0; i < 18; i++){ const a = Math.PI * (0.1 + R() * 0.8), rad = 0.7 + R() * 0.3; circ(x + 2.15 + Math.cos(a) * rad * 0.55, y + 1.16 + Math.sin(a) * rad * 0.36, 0.07); fs(BALLS[i % BALLS.length], 0.012); }
  g.restore();
  g.beginPath(); g.ellipse(x + 2.15, y + 1.2, 0.72, 0.5, 0, 0.05, Math.PI - 0.05); g.strokeStyle = '#5a8dee'; g.lineWidth = 0.14; g.stroke();
  // A low padded rail along the front, open in the middle where the grown-ups stand.
  for (const [a, b] of [[x + 0.05, x + 1.05], [x + 1.95, x + 2.95]]){ rr(a, y + 1.86, b - a, 0.14, 0.06); fs('#ef476f', 0.03); rr(a, y + 1.72, b - a, 0.12, 0.06); fs('#ffd23f', 0.03); }
}

/* ---------- Small decor ---------- */
export function topiary(x, y){
  shadow(x, y, 0.3, 0.1);
  g.beginPath(); g.moveTo(x - 0.22, y - 0.32); g.lineTo(x + 0.22, y - 0.32); g.lineTo(x + 0.16, y); g.lineTo(x - 0.16, y); g.closePath(); fs('#c97b5a', 0.035);
  rr(x - 0.25, y - 0.38, 0.5, 0.08, 0.03); fs('#e09a7a', 0.03);
  const leaf = (cx, cy, rx, ry, rot = 0) => { ell(cx, cy, rx, ry, rot); fs('#4fa85e', 0.035); };
  leaf(x, y - 0.62, 0.28, 0.26);                       // body
  leaf(x + 0.04, y - 1.0, 0.19, 0.18);                 // head
  leaf(x - 0.06, y - 1.32, 0.06, 0.17, -0.15); leaf(x + 0.12, y - 1.3, 0.06, 0.17, 0.25);   // ears
  circ(x - 0.26, y - 0.5, 0.09); fs('#e8f5e9', 0.03);  // cotton tail
  for (const [dx, dy] of [[-0.1, -0.7], [0.12, -0.55], [0.06, -1.05]]){ circ(x + dx, y + dy, 0.035); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
  circ(x + 0.1, y - 1.02, 0.025); fs(OUT, 0);
  for (const [dx, dy, c] of [[-0.18, -0.38, '#ff8fab'], [0.2, -0.4, '#ffd23f']]){ circ(x + dx, y + dy, 0.05); fs(c, 0.02); }
}
// Photo booth: a tall box with a curtain on its front. Closed (and flashing) while someone's inside.
export function photobooth(x, y, r, t, live){
  shadow(x + 0.5, y + 0.86, 0.42, 0.1);
  const side = r % 2 === 1, front = r === 0;
  box(x + 0.1, y + 0.25, 0.8, 0.6, 1.5, '#ffe8f0', front ? '#ef476f' : '#d6336c');
  const top = y + 0.85 - 1.5;
  rr(x + 0.06, top - 0.3, 0.88, 0.3, 0.06); fs('#2b2d42', 0.035);
  text('PHOTO', x + 0.5, top - 0.15, 0.13, '#ffd23f', 700);
  for (let i = 0; i < 5; i++){ circ(x + 0.16 + i * 0.17, top - 0.34, 0.03); fs(live ? (Math.floor(t * 8 + i) % 2 ? '#fff6c9' : '#ffd23f') : '#ffe9a8', 0.01); }
  if (front || side){
    const cx = side ? (r === 1 ? x + 0.12 : x + 0.62) : x + 0.24, cw = side ? 0.26 : 0.52;
    rr(cx, top + 0.18, cw, 1.05, 0.03); fs('#2b2d42', 0.02);
    // The curtain: pulled to one side when it's free, drawn shut while someone's in there.
    const shut = live ? 1 : 0.35;
    rr(cx, top + 0.18, cw * shut, 1.0, 0.03); fs('#7b2cbf', 0.025);
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 0.02; g.beginPath(); for (let k = 1; k < 4; k++){ g.moveTo(cx + cw * shut * k / 4, top + 0.2); g.lineTo(cx + cw * shut * k / 4, top + 1.16); } g.stroke();
    if (live){ rr(cx + cw * 0.2, top + 1.12, 0.1, 0.06, 0.02); fs('#3d405b', 0.01); rr(cx + cw * 0.55, top + 1.12, 0.1, 0.06, 0.02); fs('#3d405b', 0.01); }
    // Flash!
    if (live && live.k % 0.33 < 0.06){ g.save(); g.globalAlpha = 0.7; rr(cx, top + 0.18, cw, 1.0, 0.03); g.fillStyle = '#fff'; g.fill(); g.restore(); }
  }
  // A strip of sample photos on the side.
  if (front){ rr(x + 0.78, top + 0.25, 0.1, 0.42, 0.01); fs('#fff', 0.015); for (let k = 0; k < 3; k++){ rr(x + 0.79, top + 0.27 + k * 0.135, 0.08, 0.11, 0.01); fs(['#ffd6e0', '#cdeefe', '#fff3c4'][k], 0.008); } }
}
export function aquarium(x, y, t){
  shadow(x + 1, y + 0.86, 0.95, 0.12);
  box(x + 0.06, y + 0.35, 1.88, 0.5, 0.42, '#5b4a6b', '#3d2b56');
  const top = y + 0.85 - 0.42 - 0.9, tx = x + 0.1, tw = 1.8;
  rr(tx, top, tw, 0.9, 0.04);
  const gr = g.createLinearGradient(0, top, 0, top + 0.9); gr.addColorStop(0, '#9fe3f5'); gr.addColorStop(1, '#2a9dbf');
  g.fillStyle = gr; g.fill();
  g.save(); rr(tx, top, tw, 0.9, 0.04); g.clip();
  // Sand, weeds swaying and a little castle.
  g.fillStyle = '#f2d8a7'; g.beginPath(); g.moveTo(tx, top + 0.9); g.quadraticCurveTo(tx + 0.6, top + 0.72, tx + tw, top + 0.8); g.lineTo(tx + tw, top + 0.9); g.closePath(); g.fill();
  for (const [wx, h] of [[0.25, 0.45], [0.38, 0.32], [1.45, 0.5], [1.6, 0.35]]){
    g.beginPath(); g.moveTo(tx + wx, top + 0.86); g.quadraticCurveTo(tx + wx + Math.sin(t * 1.5 + wx * 5) * 0.08, top + 0.86 - h / 2, tx + wx + Math.sin(t * 1.5 + wx * 5 + 1) * 0.1, top + 0.86 - h);
    g.strokeStyle = '#2f9e6a'; g.lineWidth = 0.05; g.lineCap = 'round'; g.stroke();
  }
  rr(tx + 0.95, top + 0.55, 0.22, 0.28, 0.02); fs('#ffc8dd', 0.02); rr(tx + 1.0, top + 0.68, 0.06, 0.15, 0.03); fs('#3d2b56', 0);
  // Fish swimming back and forth.
  const fish = [['#ff9f43', 0.25, 0.7, 0], ['#ffd23f', 0.45, 0.9, 2], ['#ef476f', 0.6, 0.55, 4], ['#9b5de5', 0.35, 1.1, 1]];
  for (const [c, fy, sp, ph] of fish){
    const k = (t * sp * 0.25 + ph * 0.21) % 2, dir = k < 1 ? 1 : -1, fx = tx + 0.15 + (k < 1 ? k : 2 - k) * (tw - 0.3), yy = top + fy + Math.sin(t * 2 + ph) * 0.03;
    ell(fx, yy, 0.09, 0.05); fs(c, 0.018);
    g.beginPath(); g.moveTo(fx - dir * 0.08, yy); g.lineTo(fx - dir * 0.15, yy - 0.045); g.lineTo(fx - dir * 0.15, yy + 0.045); g.closePath(); fs(c, 0.018);
    circ(fx + dir * 0.04, yy - 0.01, 0.012); fs(OUT, 0);
  }
  // Bubbles rising.
  for (let i = 0; i < 4; i++){ const by = top + 0.85 - ((t * 0.3 + i * 0.27) % 1) * 0.85; circ(tx + 1.3 + Math.sin(by * 9) * 0.03, by, 0.025); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 0.012; g.stroke(); }
  g.restore();
  rr(tx, top, tw, 0.9, 0.04); fs(null, 0.04);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(tx + 0.12, top + 0.1); g.lineTo(tx + 0.3, top + 0.1); g.stroke();
  rr(tx - 0.04, top - 0.1, tw + 0.08, 0.12, 0.03); fs('#3d2b56', 0.03);
  rr(tx + tw * 0.5 - 0.15, top - 0.08, 0.3, 0.06, 0.02); fs('#c9f2ff', 0);
}
// Massage chair: a big padded recliner on a base. Sitters are drawn by the renderer, buzzing gently.
export const MASSAGE_SEAT = r => r === 0 ? { x: 0.5, y: 0.62 } : r === 2 ? { x: 0.5, y: 0.5, back: true } : { x: r === 1 ? 0.45 : 0.55, y: 0.6, side: true, flip: r === 1 };
export function massageChair(x, y, r, live){
  shadow(x + 0.5, y + 0.86, 0.4, 0.1);
  const c1 = '#5a4a8a', c2 = '#7b6fd6', hi = live ? '#ffd23f' : '#c9f2ff';
  rr(x + 0.15, y + 0.62, 0.7, 0.2, 0.06); fs('#3d405b', 0.03);
  if (r === 0 || r === 2){
    rr(x + 0.18, y - 0.45, 0.64, 0.95, 0.18); fs(r === 2 ? c1 : c2, 0.04);   // back
    if (r === 0){ rr(x + 0.28, y - 0.35, 0.44, 0.5, 0.12); fs(c1, 0.025); for (let k = 0; k < 3; k++){ circ(x + 0.5, y - 0.22 + k * 0.14, 0.035); fs(hi, 0.01); } }
    rr(x + 0.12, y + 0.25, 0.76, 0.42, 0.12); fs(c2, 0.04);                    // seat and leg rest
    for (const sx of [x + 0.08, x + 0.78]){ rr(sx, y + 0.0, 0.14, 0.5, 0.06); fs(c1, 0.035); }
  } else {
    const back = r === 1 ? x + 0.62 : x + 0.18;
    rr(back, y - 0.45, 0.22, 1.0, 0.1); fs(c1, 0.04);
    rr(x + 0.18, y + 0.25, 0.64, 0.4, 0.12); fs(c2, 0.04);
    rr(x + 0.2, y + 0.05, 0.6, 0.18, 0.08); fs(c1, 0.035);
    circ(back + 0.11, y - 0.1, 0.04); fs(hi, 0.01);
  }
}
// Grand piano (2×2): seen from the front, lid open on its golden insides, keys toward us, and notes drifting up.
export function piano(x, y, t){
  shadow(x + 1, y + 1.75, 1.0, 0.18);
  const wing = (dy = 0, inset = 0) => {
    g.beginPath();
    g.moveTo(x + 0.2 + inset, y + 1.1 + dy);
    g.lineTo(x + 0.2 + inset, y + 0.3 + dy + inset);
    g.quadraticCurveTo(x + 0.22 + inset, y + 0.02 + dy + inset, x + 0.6, y + 0.05 + dy + inset);
    g.quadraticCurveTo(x + 1.15, y + 0.12 + dy + inset, x + 1.3 - inset * 0.5, y + 0.45 + dy + inset * 0.5);
    g.quadraticCurveTo(x + 1.8 - inset, y + 0.65 + dy, x + 1.8 - inset, y + 1.1 + dy);
    g.closePath();
  };
  for (const [lx, ly] of [[x + 0.3, y + 1.62], [x + 1.62, y + 1.62], [x + 1.45, y + 0.8]]){ rr(lx, ly - 0.5, 0.1, 0.5, 0.03); fs('#2b2230', 0.025); circ(lx + 0.05, ly, 0.05); fs('#c9a227', 0.015); }
  // The body's side (its depth), then the top.
  wing(0.32); fs('#1c1820', 0.04);
  g.fillStyle = '#1c1820'; g.fillRect(x + 0.22, y + 1.1, 1.56, 0.3);
  wing(); fs('#2b2230', 0.04);
  // Open lid: the gold soundboard and strings show.
  wing(0, 0.1);
  const gr = g.createLinearGradient(x, y, x + 1.8, y + 1.1); gr.addColorStop(0, '#f2d68a'); gr.addColorStop(1, '#c9a227');
  g.fillStyle = gr; g.fill();
  g.save(); wing(0, 0.1); g.clip();
  g.strokeStyle = 'rgba(90,60,20,.45)'; g.lineWidth = 0.012; g.beginPath();
  for (let k = 0; k < 14; k++){ const sx = x + 0.38 + k * 0.095; g.moveTo(sx, y + 1.05); g.lineTo(sx - 0.05 + k * 0.01, y + 0.15); }
  g.stroke(); g.restore();
  // The propped lid, a thin black sheet rising off the straight side.
  g.beginPath(); g.moveTo(x + 0.2, y + 0.95); g.lineTo(x + 0.2, y + 0.25); g.lineTo(x + 0.62, y - 0.75); g.lineTo(x + 0.62, y - 0.1); g.closePath(); fs('#3a3340', 0.035);
  g.beginPath(); g.moveTo(x + 0.55, y + 0.6); g.lineTo(x + 0.5, y - 0.3); g.strokeStyle = '#c9a227'; g.lineWidth = 0.025; g.stroke();
  // Music stand and keys along the front.
  rr(x + 0.75, y + 0.8, 0.5, 0.2, 0.02); fs('#2b2230', 0.025); rr(x + 0.82, y + 0.83, 0.36, 0.12, 0.01); fs('#fffaf3', 0.01);
  rr(x + 0.24, y + 1.08, 1.52, 0.18, 0.02); fs('#fffaf3', 0.025);
  g.fillStyle = '#2b2230'; for (let k = 0; k < 15; k++) if (k % 7 !== 2 && k % 7 !== 6) g.fillRect(x + 0.32 + k * 0.095, y + 1.08, 0.045, 0.1);
  // Bench.
  box(x + 0.6, y + 1.6, 0.8, 0.28, 0.3, '#3a3340', '#2b2230', 0, 0.04);
  // Notes drifting up.
  for (let i = 0; i < 3; i++){
    const k = (t * 0.35 + i / 3) % 1, nx = x + 0.7 + i * 0.35 + Math.sin(k * 6 + i) * 0.1, ny = y - 0.2 - k * 0.9;
    g.save(); g.globalAlpha = Math.sin(k * Math.PI) * 0.9; text(i % 2 ? '♪' : '♫', nx, ny, 0.28, '#7b2cbf', 700); g.restore();
  }
}
// Flower arch (2×1): two posts wound with leaves, and roses along the curve.
export function flowerArch(x, y){
  shadow(x + 1, y + 0.82, 0.95, 0.1);
  for (const px of [x + 0.15, x + 1.75]){ rr(px, y + 0.85 - 1.5, 0.1, 1.5, 0.04); fs('#fff6ea', 0.03); }
  g.beginPath(); g.arc(x + 1, y + 0.85 - 1.45, 0.85, Math.PI, 0); g.strokeStyle = '#fff6ea'; g.lineWidth = 0.1; g.stroke();
  g.beginPath(); g.arc(x + 1, y + 0.85 - 1.45, 0.85, Math.PI, 0); g.strokeStyle = OUT; g.lineWidth = 0.13; g.globalCompositeOperation = 'destination-over'; g.stroke(); g.globalCompositeOperation = 'source-over';
  const R = mulberry(17);
  const along = k => k < 0.3 ? { px: x + (k < 0.15 ? 0.2 : 1.8), py: y + 0.85 - (k % 0.15) / 0.15 * 1.45 } : (() => { const a = Math.PI + (k - 0.3) / 0.7 * Math.PI; return { px: x + 1 + Math.cos(a) * 0.85, py: y + 0.85 - 1.45 + Math.sin(a) * 0.85 }; })();
  for (let i = 0; i < 26; i++){ const { px, py } = along(R()); ell(px + (R() - 0.5) * 0.1, py, 0.11, 0.07, R() * 3); fs('#5bbf6a', 0.02); }
  for (let i = 0; i < 12; i++){ const { px, py } = along(R()); circ(px, py, 0.075); fs(['#ff8fab', '#ef476f', '#fff0f3'][i % 3], 0.02); circ(px, py, 0.025); g.fillStyle = 'rgba(61,43,53,.3)'; g.fill(); }
}

/* ---------- Hot dog stand and pizzeria ---------- */
// The hot dog stand's counter: a roller grill with franks turning, and ketchup and mustard bottles.
export function hotdogCounter(x, y, t){
  rr(x + 0.14, y - 0.58, 0.9, 0.24, 0.05); fs('#c9d1d9', 0.03);
  for (let i = 0; i < 4; i++){
    const fx = x + 0.24 + i * 0.2, turn = Math.sin(t * 3 + i) * 0.015;
    rr(fx - 0.035, y - 0.56 + turn, 0.07, 0.2, 0.035); fs('#c0392b', 0.015);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(fx - 0.012, y - 0.53 + turn, 0.012, 0.12);
  }
  rr(x + 1.1, y - 0.55, 0.09, 0.2, 0.03); fs('#e63946', 0.02); rr(x + 1.12, y - 0.6, 0.05, 0.06, 0.01); fs('#fff', 0.01);
  rr(x + 1.21, y - 0.55, 0.09, 0.2, 0.03); fs('#ffd23f', 0.02); rr(x + 1.23, y - 0.6, 0.05, 0.06, 0.01); fs('#fff', 0.01);
}
export function hotdogIcon(c){
  rr(-0.46, -0.12, 0.92, 0.34, 0.17); fs(c('#e9b872'), 0.07);              // bun
  rr(-0.5, -0.18, 1.0, 0.2, 0.1); fs(c('#c0392b'), 0.07);                  // frank
  g.strokeStyle = '#ffd23f'; g.lineWidth = 0.07; g.lineJoin = 'round'; g.beginPath();
  for (let k = 0; k <= 8; k++) (k ? g.lineTo : g.moveTo).call(g, -0.36 + k * 0.09, -0.08 + (k % 2 ? -0.05 : 0.03));
  g.stroke();
  rr(-0.42, 0.05, 0.84, 0.14, 0.07); fs(c('#e9b872'), 0.06);
}
export function pizzaIcon(c){
  g.beginPath(); g.moveTo(0, 0.44); g.lineTo(-0.42, -0.3); g.quadraticCurveTo(0, -0.46, 0.42, -0.3); g.closePath(); fs(c('#ffd166'), 0.07);
  g.beginPath(); g.moveTo(-0.44, -0.3); g.quadraticCurveTo(0, -0.5, 0.44, -0.3); g.lineTo(0.4, -0.22); g.quadraticCurveTo(0, -0.38, -0.4, -0.22); g.closePath(); fs(c('#d4883c'), 0.06);
  for (const [px, py] of [[-0.12, -0.12], [0.14, -0.08], [0.0, 0.12]]){ circ(px, py, 0.08); fs('#e63946', 0.03); }
  circ(-0.2, 0.0, 0.03); fs('#2f9e6a', 0); circ(0.18, 0.08, 0.03); fs('#2f9e6a', 0);
}
// The pizzeria's back wall: a brick oven with a fire glowing inside.
export function pizzaOven(x, y, sw, t){
  box(x, y, sw, 0.4, 0.42, '#d9c7b0', '#b89b7a');
  const top = y + 0.4 - 0.42, ox = x + 0.15, ow = Math.min(1.2, sw - 0.3);
  g.beginPath(); g.moveTo(ox, top + 0.02); g.lineTo(ox, top - 0.35); g.quadraticCurveTo(ox + ow / 2, top - 0.95, ox + ow, top - 0.35); g.lineTo(ox + ow, top + 0.02); g.closePath(); fs('#c1502e', 0.04);
  g.strokeStyle = 'rgba(80,30,20,.35)'; g.lineWidth = 0.02; g.beginPath();
  for (let r = 0; r < 4; r++){ const yy = top - 0.08 - r * 0.15; g.moveTo(ox + 0.05, yy); g.lineTo(ox + ow - 0.05, yy); }
  g.stroke();
  g.beginPath(); g.moveTo(ox + ow * 0.28, top + 0.02); g.lineTo(ox + ow * 0.28, top - 0.22); g.quadraticCurveTo(ox + ow / 2, top - 0.45, ox + ow * 0.72, top - 0.22); g.lineTo(ox + ow * 0.72, top + 0.02); g.closePath(); fs('#2b1d1d', 0.03);
  for (let i = 0; i < 3; i++){ const f = 0.08 + Math.abs(Math.sin(t * 6 + i * 2)) * 0.06; g.beginPath(); g.moveTo(ox + ow * (0.38 + i * 0.12) - 0.05, top); g.quadraticCurveTo(ox + ow * (0.38 + i * 0.12), top - f * 2.2, ox + ow * (0.38 + i * 0.12) + 0.05, top); g.closePath(); g.fillStyle = i === 1 ? '#ffd23f' : '#ff9f43'; g.fill(); }
  rr(ox + ow / 2 - 0.08, top - 0.98, 0.16, 0.2, 0.02); fs('#8a6a5a', 0.03);
  if (sw > ow + 0.6){ box(x + sw - 0.45, y + 0.08, 0.38, 0.28, 0.55, '#f2e8d8', '#2a9d8f'); g.save(); g.translate(x + sw - 0.26, y + 0.36 - 0.55 + 0.18); g.scale(0.14, 0.14); storeIcon('pizza', 0, 0, 1); g.restore(); }
}
export function pizzaCounter(cx, top){
  // A whole pie on a wooden peel, ready to slice.
  rr(cx + 0.04, top + 0.05, 0.3, 0.06, 0.03); fs('#c9a27e', 0.02);
  circ(cx + 0.24, top + 0.08, 0.15); fs('#d4883c', 0.025); circ(cx + 0.24, top + 0.08, 0.12); fs('#ffd166', 0);
  for (const [dx, dy] of [[-0.05, -0.03], [0.05, 0.02], [0.0, 0.07], [-0.06, 0.05]]){ circ(cx + 0.24 + dx, top + 0.08 + dy, 0.025); fs('#e63946', 0); }
}
export function pizzaWallpaper(x0, y0, w, H){
  g.fillStyle = '#c1502e'; g.fillRect(x0, y0, w, H);
  g.strokeStyle = 'rgba(255,230,210,.45)'; g.lineWidth = 0.02; g.beginPath();
  for (let r = 0; r * 0.13 < H; r++){ const yy = y0 + r * 0.13; g.moveTo(x0, yy); g.lineTo(x0 + w, yy); for (let x = x0 + (r % 2) * 0.13; x < x0 + w; x += 0.26){ g.moveTo(x, yy); g.lineTo(x, yy + 0.13); } }
  g.stroke();
  g.fillStyle = '#2a9d8f'; g.fillRect(x0, y0 + H - 0.1, w, 0.05); g.fillStyle = '#fff'; g.fillRect(x0, y0 + H - 0.05, w, 0.025); g.fillStyle = '#e63946'; g.fillRect(x0, y0 + H - 0.025, w, 0.025);
}
export function pizzaMenu(wx, wy){
  rr(wx + 0.05, wy - 0.24, 0.8, 0.42, 0.04); fs('#2b2d42', 0.035);
  text('PIZZA', wx + 0.45, wy - 0.13, 0.11, '#fff', 700);
  for (let i = 0; i < 3; i++){ g.save(); g.translate(wx + 0.2 + i * 0.25, wy + 0.04); g.scale(0.09, 0.09); storeIcon('pizza', 0, 0, 1); g.restore(); }
}

/* ---------- Levels 29–35 ---------- */
// Balloon cart: a little striped cart with a bunch of balloons bobbing on strings.
export function balloonCart(x, y, t){
  shadow(x, y, 0.32, 0.09);
  const cols = ['#ef476f', '#ffd23f', '#5a8dee', '#06d6a0', '#9b5de5', '#ff9f43'];
  for (let i = 0; i < 6; i++){
    const a = -0.9 + i * 0.36, bx = x + Math.sin(a) * 0.32 + Math.sin(t * 1.6 + i) * 0.03, by = y - 1.25 - Math.cos(a) * 0.25 + Math.sin(t * 2 + i * 1.3) * 0.03;
    g.beginPath(); g.moveTo(x, y - 0.5); g.quadraticCurveTo((x + bx) / 2, by + 0.35, bx, by + 0.14); g.strokeStyle = 'rgba(61,43,53,.5)'; g.lineWidth = 0.012; g.stroke();
    ell(bx, by, 0.13, 0.16); fs(cols[i], 0.025);
    ell(bx - 0.04, by - 0.05, 0.03, 0.045); g.fillStyle = 'rgba(255,255,255,.55)'; g.fill();
  }
  box(x - 0.28, y - 0.08, 0.56, 0.22, 0.4, '#fff3e0', '#ef476f');
  g.fillStyle = '#fff3e0'; for (let k = 0; k < 3; k++) g.fillRect(x - 0.22 + k * 0.18, y + 0.14 - 0.4, 0.08, 0.38);
  rr(x - 0.28, y + 0.14 - 0.4, 0.56, 0.4, 0.05); fs(null, 0.035);
  for (const wx of [x - 0.18, x + 0.18]){ circ(wx, y + 0.16, 0.06); fs('#5a4a5a', 0.03); }
}
// Wishing fountain: a stone basin on a pedestal, water bubbling up and sparkling.
export function littleFountain(x, y, t){
  shadow(x, y, 0.38, 0.11);
  ell(x, y - 0.12, 0.38, 0.17); fs('#c9c4cf', 0.04);
  ell(x, y - 0.15, 0.31, 0.12); fs('#7fd3ea', 0.025);
  rr(x - 0.07, y - 0.62, 0.14, 0.48, 0.04); fs('#d9d4de', 0.035);
  ell(x, y - 0.62, 0.2, 0.08); fs('#c9c4cf', 0.035); ell(x, y - 0.63, 0.15, 0.05); fs('#a8e4f2', 0.015);
  for (let i = 0; i < 4; i++){
    const k = (t * 0.9 + i / 4) % 1, a = i * 1.57 + 0.4, dx = Math.cos(a) * 0.17 * k, h = Math.sin(k * Math.PI) * 0.22;
    circ(x + dx, y - 0.66 - h + k * 0.48 * k, 0.025); g.fillStyle = 'rgba(200,240,255,.95)'; g.fill();
  }
  for (let i = 0; i < 2; i++){ const k = (t * 0.6 + i * 0.5) % 1; g.save(); g.globalAlpha = Math.sin(k * Math.PI); g.fillStyle = '#fff6c9'; circ(x - 0.15 + i * 0.3, y - 0.18, 0.03); g.fill(); g.restore(); }
}
// Arcade cabinet: a tall stand-up machine with a glowing screen, facing the way it's turned.
export function arcadeCabinet(x, y, r, t, live){
  shadow(x + 0.5, y + 0.85, 0.36, 0.09);
  const side = r % 2 === 1;
  box(x + 0.18, y + 0.3, 0.64, 0.55, 1.35, '#3a0ca3', r === 2 ? '#2a0880' : '#4361ee');
  const top = y + 0.85 - 1.35;
  if (r === 0){
    rr(x + 0.16, top - 0.18, 0.68, 0.2, 0.04); fs('#ef476f', 0.03); text('GO!', x + 0.5, top - 0.08, 0.12, '#ffd23f', 700);
    rr(x + 0.26, top + 0.1, 0.48, 0.38, 0.03); fs('#1c1240', 0.03);
    const blink = live ? Math.floor(t * 6) % 2 : 0;
    g.fillStyle = blink ? '#ffd23f' : '#4cc9f0'; g.fillRect(x + 0.32, top + 0.36, 0.08, 0.06);
    g.fillStyle = '#ef476f'; g.fillRect(x + 0.5 + Math.sin(t * 2) * 0.12, top + 0.18, 0.07, 0.07);
    g.fillStyle = '#7bd389'; g.fillRect(x + 0.6, top + 0.4, 0.06, 0.04);
    rr(x + 0.2, top + 0.56, 0.6, 0.16, 0.03); fs('#2b2d42', 0.025);
    circ(x + 0.36, top + 0.63, 0.04); fs('#ef476f', 0.015); circ(x + 0.58, top + 0.62, 0.035); fs('#ffd23f', 0.015); circ(x + 0.67, top + 0.65, 0.035); fs('#06d6a0', 0.015);
  } else if (side){
    rr(r === 1 ? x + 0.2 : x + 0.62, top + 0.1, 0.18, 0.5, 0.03); fs('#1c1240', 0.025);
    g.fillStyle = 'rgba(76,201,240,.6)'; g.fillRect(r === 1 ? x + 0.22 : x + 0.64, top + 0.14, 0.04, 0.4);
  }
  for (let i = 0; i < 3; i++){ circ(x + 0.3 + i * 0.2, top - 0.22, 0.025); fs(live ? `hsl(${(t * 300 + i * 90) % 360},95%,65%)` : '#ffe9a8', 0); }
}
// Bubble machine: a little box on a stand blowing bubbles that drift up and pop.
export function bubbleMachine(x, y, t){
  shadow(x, y, 0.25, 0.08);
  rr(x - 0.04, y - 0.55, 0.08, 0.5, 0.02); fs('#8d869c', 0.025);
  box(x - 0.22, y - 0.55, 0.44, 0.28, 0.3, '#c0f0ff', '#5cc8bf');
  circ(x + 0.1, y - 0.72, 0.07); fs('#2b2d42', 0.025);
  for (let i = 0; i < 7; i++){
    const k = (t * 0.25 + i / 7) % 1, bx = x + 0.15 + k * 0.6 + Math.sin(k * 8 + i) * 0.12, by = y - 0.8 - k * 1.3, r = 0.05 + (i % 3) * 0.025;
    g.save(); g.globalAlpha = k < 0.85 ? 0.9 : (1 - k) / 0.15 * 0.9;
    circ(bx, by, r); g.fillStyle = 'rgba(220,240,255,.25)'; g.fill(); g.strokeStyle = `hsla(${(i * 50 + t * 60) % 360},80%,70%,.9)`; g.lineWidth = 0.015; g.stroke();
    circ(bx - r * 0.35, by - r * 0.35, r * 0.25); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill();
    g.restore();
  }
}
// Koi pond (2×2): a stone-rimmed pond with lily pads and koi gliding in circles.
export function koiPond(x, y, t){
  ell(x + 1, y + 1.05, 0.98, 0.78); fs('#b8b0a8', 0.045);
  for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2; ell(x + 1 + Math.cos(a) * 0.9, y + 1.05 + Math.sin(a) * 0.7, 0.13, 0.08, a); fs(i % 2 ? '#cfc8c0' : '#bdb5ad', 0.02); }
  ell(x + 1, y + 1.05, 0.78, 0.58);
  const gr = g.createRadialGradient(x + 1, y + 1.05, 0.1, x + 1, y + 1.05, 0.8); gr.addColorStop(0, '#3f9fc4'); gr.addColorStop(1, '#2a6f9a');
  g.fillStyle = gr; g.fill();
  g.save(); ell(x + 1, y + 1.05, 0.76, 0.56); g.clip();
  for (const [c, sp, rad, ph] of [['#ff7b39', 0.5, 0.45, 0], ['#fff6ea', 0.38, 0.3, 2], ['#ff9f43', 0.45, 0.55, 4]]){
    const a = t * sp + ph, fx = x + 1 + Math.cos(a) * rad, fy = y + 1.05 + Math.sin(a) * rad * 0.7, dir = a + Math.PI / 2;
    g.save(); g.translate(fx, fy); g.rotate(dir);
    ell(0, 0, 0.13, 0.05); fs(c, 0.012); g.beginPath(); g.moveTo(-0.12, 0); g.lineTo(-0.2, -0.05); g.lineTo(-0.2, 0.05); g.closePath(); fs(c, 0.012);
    if (c === '#fff6ea'){ circ(0.03, 0, 0.03); fs('#ef476f', 0); }
    g.restore();
  }
  for (const [lx, ly, r] of [[0.55, 0.8, 0.14], [1.4, 1.25, 0.16], [1.25, 0.72, 0.1]]){ g.beginPath(); g.moveTo(x + lx, y + ly); g.arc(x + lx, y + ly, r, 0.4, Math.PI * 2); g.closePath(); fs('#5bbf6a', 0.02); }
  circ(x + 1.45, y + 1.22, 0.05); fs('#ff8fab', 0.015);
  g.restore();
}
