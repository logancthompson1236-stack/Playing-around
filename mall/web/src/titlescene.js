// The title screen: the mall from the outside at dusk. The big MALL REVIVAL sign over the entrance flickers on a
// letter at a time, shoppers come and go through the sliding doors, cars cruise the parking lot. Starting a game
// slides the doors open and carries the camera through them into the mall.
// Drawn on its own canvas in "units" (the screen is 9 units tall), with the art.js helpers.
import * as A from './art.js';
import * as C from './config.js';

const SIGN = 'MALL REVIVAL', TAG = 'bring it back to life';
const SKY = [[0, '#24183f'], [0.34, '#55377a'], [0.6, '#b85c82'], [0.8, '#f0946c'], [1, '#ffcf8a']];
const CARS = ['#ef476f', '#5a8dee', '#ffd23f', '#06d6a0', '#f4f1ea', '#9b5de5', '#ff9f43', '#3d405b'];
const SHIRTS = ['#8ecae6', '#f4a261', '#90be6d', '#cdb4db', '#ef476f', '#5a8dee', '#ffd23f', '#06a77d', '#e76f51'];
const PANTS = ['#33415c', '#3d405b', '#6d597a', '#2f3a5a', '#c9a46b', '#5a8dee'];
const HAIRS = ['#2b2230', '#6b3e26', '#d9733f', '#e8c46a', '#1f1a1f', '#8a5a44', '#d8d8d8'];
const ease = k => k * k * (3 - 2 * k), easeIn = k => k * k * k;
const pick = (a, r = Math.random) => a[Math.floor(r() * a.length)];

export function startTitleScene(parent, { mall } = {}){
  const cv = document.createElement('canvas');
  cv.className = 'title-scene';
  parent.prepend(cv);
  const ctx = cv.getContext('2d');
  let W = 16, ppt = 40, dpr = 1, L = null, back = null, front = null, raf = 0, t0 = performance.now(), last = t0;
  let doorOpen = 0, entering = null, gone = false;
  const people = [], cars = [], R = A.mulberry(2024);
  let nextPerson = 0.2, nextCar = 1.2, flickT = 4, flick = null;

  function layout(){
    const cx = W / 2, bw = Math.min(W - 0.8, 17.5), cw = Math.min(bw * 0.58, 10);
    // Fit the sign's letters to the center block.
    ctx.save(); ctx.font = "700 100px Fredoka, 'Trebuchet MS', sans-serif";
    const widths = [...SIGN].map(ch => ctx.measureText(ch).width / 100); ctx.restore();
    const total = widths.reduce((a, b) => a + b, 0) + 0.06 * (SIGN.length - 1);
    const font = Math.min(1.2, (cw - 1.0) / total);
    const lots = [];
    // Parked cars in the two rows of stalls (leaving some gaps): nose to the mall in the top row, facing us below.
    for (let x = 0.15; x < W - 1; x += 1.05){
      if (R() < 0.5) lots.push({ cx: x + 0.525, by: 7.0, dir: 'up', c: pick(CARS, R), door: 0, blink: 0, busy: false });
      if (R() < 0.4) lots.push({ cx: x + 0.525, by: 8.97, dir: 'down', c: pick(CARS, R), door: 0, blink: 0, busy: false });
    }
    // Street lamps along the front of the sidewalk, clear of the entrance and the mall's sign.
    const signX = Math.max(1.0, cx - bw / 2 + 0.2) + 0.1, lamps = [];
    for (let x = 1.4; x < W - 0.6; x += 3.1){ if (Math.abs(x - cx) < 3.5 || (x > signX - 0.4 && x < signX + 1.4)) continue; lamps.push(x); }
    L = { cx, bw, x0: cx - bw / 2, x1: cx + bw / 2, cw, c0: cx - cw / 2, c1: cx + cw / 2, cTop: 0.62, wingTop: 2.6, base: 5.35,
      signY: 0.86, signH: 1.5, font, widths, total, door: { x0: cx - 0.95, x1: cx + 0.95, top: 3.62 }, lots, lamps, signX };
  }

  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ppt = cv.height / 9; W = w / h * 9;
    layout(); back = paintCache(paintBack); front = paintCache(paintFront);
  }
  function paintCache(fn){
    const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    const g = c.getContext('2d'); g.setTransform(ppt, 0, 0, ppt, 0, 0); A.setTarget(g, ppt); fn(g);
    return c;
  }

  /* ---------- The still parts, painted once ---------- */
  function paintBack(g){
    const gr = g.createLinearGradient(0, 0, 0, 5.4); SKY.forEach(([k, c]) => gr.addColorStop(k, c));
    g.fillStyle = gr; g.fillRect(0, 0, W, 9);
    // The last of the sun, low behind the mall.
    const sun = g.createRadialGradient(L.cx + W * 0.18, 4.9, 0.2, L.cx + W * 0.18, 4.9, 6);
    sun.addColorStop(0, 'rgba(255,220,150,.9)'); sun.addColorStop(1, 'rgba(255,170,120,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, 6);
    // A crescent moon.
    A.circ(W * 0.12, 1.05, 0.36); g.fillStyle = '#fff4d6'; g.fill();
    A.circ(W * 0.12 + 0.16, 0.95, 0.32); g.fillStyle = '#3a2760'; g.fill();
    // The town on the horizon.
    const r = A.mulberry(7);
    for (let x = -0.2; x < W; ){
      const bw = 0.6 + r() * 1.3, bh = 0.6 + r() * 1.5;
      g.fillStyle = r() < 0.5 ? '#5c3f72' : '#674878'; g.fillRect(x, 4.9 - bh, bw + 0.02, bh + 0.6);
      g.fillStyle = 'rgba(255,214,150,.8)';
      for (let wx = x + 0.12; wx < x + bw - 0.12; wx += 0.25) for (let wy = 4.9 - bh + 0.15; wy < 4.8; wy += 0.25) if (r() < 0.3) g.fillRect(wx, wy, 0.08, 0.08);
      x += bw;
    }
  }
  function paintFront(g){
    const { x0, x1, c0, c1, cTop, wingTop, base, cx } = L;
    // Wings: peach walls, a pink cornice, lit shop windows with little awnings.
    A.rr(x0, wingTop, x1 - x0, base - wingTop + 0.05, 0.06); A.fs('#f2d3c0', 0.05);
    g.fillStyle = 'rgba(120,70,110,.12)'; g.fillRect(x0 + 0.03, wingTop + 0.05, x1 - x0 - 0.06, 0.55);
    for (let x = x0 + 0.5; x < x1 - 1; x += 2.2){ A.box(x, wingTop - 0.42, 0.9, 0.3, 0.32, '#c9b8d8', '#a896c0', 0, 0.04, 0.03); }  // rooftop AC units
    A.rr(x0 - 0.12, wingTop - 0.12, x1 - x0 + 0.24, 0.3, 0.08); A.fs('#e8577e', 0.05);
    A.rr(x0 - 0.12, wingTop + 0.1, x1 - x0 + 0.24, 0.08, 0.04); A.fs('#ffd23f', 0.03);
    // Clerestory windows along the top of the wings.
    for (let x = x0 + 0.35; x < x1 - 0.5; x += 0.7){ if (x > c0 - 0.6 && x < c1 + 0.1) continue; A.rr(x, wingTop + 0.38, 0.45, 0.28, 0.06); A.fs('#ffd98a', 0.025); }
    const r = A.mulberry(31), awn = ['#3fb8af', '#ffd23f', '#e8577e', '#5a8dee', '#ff9f43', '#9b5de5'];
    for (const [a, b] of [[x0 + 0.25, c0 - 0.25], [c1 + 0.25, x1 - 0.25]]){
      const n = Math.max(1, Math.floor((b - a) / 1.9)), sw = (b - a) / n;
      for (let i = 0; i < n; i++){
        const wx = a + i * sw + 0.12, ww = sw - 0.24, wy = 3.55, wh = base - 0.2 - wy, col = awn[Math.floor(r() * awn.length)];
        const lit = g.createLinearGradient(0, wy, 0, wy + wh); lit.addColorStop(0, '#fff1c4'); lit.addColorStop(1, '#ffc46b');
        A.rr(wx, wy, ww, wh, 0.05); A.fs(lit, 0.04);
        // Shelves and goods inside, and a shopper's silhouette now and then.
        g.fillStyle = 'rgba(150,90,80,.28)'; for (const sy of [wy + wh * 0.45, wy + wh * 0.75]) g.fillRect(wx + 0.1, sy, ww - 0.2, 0.05);
        for (let k = 0; k < 6; k++){ A.rr(wx + 0.15 + r() * (ww - 0.4), wy + wh * (r() < 0.5 ? 0.3 : 0.6), 0.12, 0.14, 0.03); A.fs(awn[Math.floor(r() * awn.length)], 0); }
        if (r() < 0.5){ const px = wx + 0.3 + r() * (ww - 0.6); A.circ(px, wy + wh * 0.42, 0.11); g.fillStyle = 'rgba(90,50,70,.35)'; g.fill(); A.rr(px - 0.13, wy + wh * 0.5, 0.26, 0.42, 0.1); g.fill(); }
        g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(wx + 0.1, wy + wh); g.lineTo(wx + 0.45, wy); g.lineTo(wx + 0.6, wy); g.lineTo(wx + 0.25, wy + wh); g.fill();
        // A scalloped awning.
        const ay = wy - 0.32;
        A.rr(wx - 0.08, ay, ww + 0.16, 0.24, 0.04); A.fs(col, 0.035);
        for (let s = 0; s < Math.round(ww / 0.3); s++){ const sx = wx - 0.08 + (s + 0.5) * (ww + 0.16) / Math.round(ww / 0.3); A.circ(sx, ay + 0.24, 0.13); A.fs(s % 2 ? '#fff6ea' : col, 0.03); }
      }
    }
    // The center block: taller, with teal pilasters, the sign board and the entrance.
    A.rr(c0, cTop, c1 - c0, base - cTop + 0.05, 0.1); A.fs('#fbe6d4', 0.05);
    for (const px of [c0, c1 - 0.34]){ A.rr(px, cTop, 0.34, base - cTop + 0.05, 0.08); A.fs('#3fb8af', 0.045); }
    A.rr(c0 - 0.15, cTop - 0.16, c1 - c0 + 0.3, 0.3, 0.1); A.fs('#e8577e', 0.05);
    // The sign board (letters are lit separately), with marquee bulbs around it (also lit separately).
    A.rr(c0 + 0.45, L.signY, c1 - c0 - 0.9, L.signH, 0.22); A.fs('#3a2346', 0.06);
    A.rr(c0 + 0.6, L.signY + 0.15, c1 - c0 - 1.2, L.signH - 0.3, 0.16); A.fs(null, 0.025, 'rgba(255,255,255,.15)');
    const glass = g.createLinearGradient(0, L.door.top, 0, base); glass.addColorStop(0, '#ffe3a8'); glass.addColorStop(1, '#ffc477');
    // Sidelights either side of the doors.
    for (const sx of [L.door.x0 - 1.0, L.door.x1 + 0.1]){ A.rr(sx, L.door.top, 0.9, base - L.door.top, 0.05); A.fs(glass, 0.04); }
    // The striped awning over the entrance.
    const ax0 = L.door.x0 - 1.25, ax1 = L.door.x1 + 1.25, ay = L.door.top - 0.42;
    for (let i = 0; i < 10; i++){ const a = ax0 + (ax1 - ax0) * i / 10; g.beginPath(); g.moveTo(a, ay); g.lineTo(a + (ax1 - ax0) / 10, ay); g.lineTo(a + (ax1 - ax0) / 10 + 0.04, ay + 0.36); g.lineTo(a + 0.04, ay + 0.36); g.closePath(); A.fs(i % 2 ? '#fff6ea' : '#e8577e', 0.03); }
    for (let i = 0; i < 10; i++){ A.circ(ax0 + (i + 0.5) * (ax1 - ax0) / 10 + 0.04, ay + 0.36, 0.17); A.fs(i % 2 ? '#fff6ea' : '#e8577e', 0.03); }
    A.rr(ax0 - 0.05, ay - 0.2, ax1 - ax0 + 0.1, 0.26, 0.06); A.fs('#c23e63', 0.035);
    A.text('ENTRANCE', cx, ay - 0.07, 0.16, '#fff6ea', 700);
    // Sidewalk and curb.
    g.fillStyle = '#d6c6dc'; g.fillRect(0, base, W, 0.55);
    g.strokeStyle = 'rgba(120,90,130,.25)'; g.lineWidth = 0.02; g.beginPath(); for (let x = 0; x < W; x += 0.8){ g.moveTo(x, base); g.lineTo(x, base + 0.55); } g.stroke();
    g.fillStyle = '#b3a3c4'; g.fillRect(0, base + 0.55, W, 0.12);
    // The parking lot: asphalt, stall lines, a dashed lane down the middle.
    const lot = g.createLinearGradient(0, base + 0.67, 0, 9); lot.addColorStop(0, '#5b5878'); lot.addColorStop(1, '#3b3854');
    g.fillStyle = lot; g.fillRect(0, base + 0.67, W, 9);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.045; g.beginPath();
    for (let x = 0.15; x < W; x += 1.05){ g.moveTo(x, 6.1); g.lineTo(x, 7.05); g.moveTo(x, 8.0); g.lineTo(x, 9); }
    g.moveTo(0, 7.05); g.lineTo(W, 7.05); g.moveTo(0, 8.0); g.lineTo(W, 8.0); g.stroke();
    g.setLineDash([0.35, 0.3]); g.strokeStyle = 'rgba(255,214,90,.6)'; g.beginPath(); g.moveTo(0, 7.52); g.lineTo(W, 7.52); g.stroke(); g.setLineDash([]);
    // Palms in planters by the doors, bushes along the curb.
    for (const px of [L.door.x0 - 1.55, L.door.x1 + 1.55]){ A.box(px - 0.32, base + 0.12, 0.64, 0.3, 0.3, '#e09a7a', '#c97b5a'); A.palm(px, base + 0.15); }
    for (let x = 2.95; x < W - 0.4; x += 3.1){ if (Math.abs(x - cx) < 3.2) continue; A.ell(x, base + 0.48, 0.42, 0.2); A.fs('#4fa85e', 0.035); A.ell(x - 0.15, base + 0.4, 0.2, 0.12); A.fs('#6cc47a', 0); }
    // The mall's own name on a pylon sign at the edge of the lot.
    const name = (mall || 'Sunnyside Mall').toUpperCase(), sx = L.signX, sy = base + 0.55;
    A.rr(sx + 0.42, sy - 2.2, 0.16, 2.2, 0.04); A.fs('#4a4f6a', 0.035);
    A.rr(sx, sy - 3.2, 1.0, 1.15, 0.12); A.fs('#3fb8af', 0.05);
    A.rr(sx + 0.08, sy - 3.12, 0.84, 0.99, 0.08); A.fs('#fff6ea', 0.03);
    const words = name.split(' '), mid = Math.ceil(words.length / 2), lines = words.length > 1 ? [words.slice(0, mid).join(' '), words.slice(mid).join(' ')] : [name];
    lines.forEach((ln, i) => A.text(ln, sx + 0.5, sy - 2.62 + (i - (lines.length - 1) / 2) * 0.26, 0.2, '#3a2346', 700, 'Fredoka', 0.76));
  }

  /* ---------- Cars and people ---------- */
  // A parked car, seen from above and in front like everything else: the roof and hood (or trunk) on top, the near
  // end (taillights, or headlights and grille) facing us, wheels peeking out at the corners. The driver's door
  // (on our left when the nose points at the mall, on our right when it points at us) swings open when someone
  // gets in or out.
  const CW = 0.64, CL = 0.92, H1 = 0.21, H2 = 0.19;
  function parkedCar(g, c){
    const x = c.cx, y = c.by, up = c.dir === 'up', col = c.c, dark = A.shade(col, -0.3), lite = A.shade(col, 0.22);
    const cab0 = y - CL * 0.72, cab1 = y - CL * 0.3;           // the cabin's far and near ends, on the ground
    const P = (gx, gy, z) => [gx, gy - z];
    const quad = (pts, fill, lw = 0.03) => { g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo : g.moveTo).call(g, px, py)); g.closePath(); A.fs(fill, lw); };
    A.rr(x - CW / 2 - 0.04, y - CL + 0.06, CW + 0.08, CL, 0.16); g.fillStyle = 'rgba(25,15,35,.32)'; g.fill();
    // Wheels: the near pair under the bumper corners, slivers of the far pair at the sides.
    for (const s of [-1, 1]){
      A.rr(x + s * CW / 2 - 0.055, y - 0.27, 0.11, 0.24, 0.045); A.fs('#2b2230', 0.025);
      A.rr(x + s * CW / 2 - 0.055, y - CL + 0.12, 0.11, 0.22, 0.045); A.fs('#2b2230', 0.025);
    }
    // The open door is behind the car when it swings away from us.
    const side = up ? -1 : 1, a = ease(c.door) * 1.05, dl = cab1 - cab0 - 0.02;
    const hinge = up ? cab0 + 0.02 : cab1, tip = [x + side * (CW / 2 + Math.sin(a) * dl), hinge + (up ? 1 : -1) * Math.cos(a) * dl];
    const door = () => {
      const hx = x + side * CW / 2;
      quad([P(hx, hinge, 0.06), P(tip[0], tip[1], 0.06), P(tip[0], tip[1], H1), P(hx, hinge, H1)], up ? dark : col);
      quad([P(hx, hinge, H1), P(tip[0], tip[1], H1), P(tip[0], tip[1], H1 + H2 * 0.8), P(hx, hinge, H1 + H2 * 0.85)], 'rgba(160,200,235,.85)', 0.025);
    };
    if (c.door > 0.02 && !up) door();
    // Body: the near end, then the top.
    A.rr(x - CW / 2, y - H1 - 0.02, CW, H1 + 0.02, 0.07); A.fs(dark, 0.035);
    A.rr(x - CW / 2, y - CL - H1, CW, CL, 0.15); A.fs(col, 0.035);
    g.fillStyle = lite; g.fillRect(x - CW / 2 + 0.08, y - CL - H1 + 0.05, CW - 0.16, 0.035);
    // Cabin: side glass along the edges, the roof, and the near window sloping toward us.
    const rw = CW * 0.39, bw = CW * 0.45, zr = H1 + H2;
    for (const s of [-1, 1]) quad([P(x + s * bw, cab0, H1), P(x + s * rw, cab0 + 0.06, zr), P(x + s * rw, cab1 - 0.08, zr), P(x + s * bw, cab1, H1)], '#6f8fb8', 0.02);
    quad([P(x - rw, cab1 - 0.08, zr), P(x + rw, cab1 - 0.08, zr), P(x + bw, cab1, H1), P(x - bw, cab1, H1)], up ? '#86a8d0' : '#a9cbee', 0.025);
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); const [g0x, g0y] = P(x - rw * 0.5, cab1 - 0.08, zr), [g1x, g1y] = P(x - bw * 0.15, cab1, H1); g.moveTo(g0x, g0y); g.lineTo(g0x + 0.06, g0y); g.lineTo(g1x + 0.08, g1y); g.lineTo(g1x, g1y); g.fill();
    A.rr(x - rw, cab0 + 0.06 - zr, rw * 2, cab1 - cab0 - 0.14, 0.06); A.fs(col, 0.03);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - rw + 0.05, cab0 + 0.09 - zr, rw * 2 - 0.1, 0.03);
    // Mirrors at the front of the cabin.
    const my = up ? cab0 + 0.04 : cab1 - 0.04;
    for (const s of [-1, 1]){ A.rr(x + s * (CW / 2 + 0.02) - 0.035, my - H1 - 0.06, 0.07, 0.05, 0.02); A.fs(dark, 0.02); }
    // The near end: taillights (blinking when locked) or headlights and a grille, a bumper and a plate.
    const ly = y - H1 + 0.04, on = c.blink > 0 && Math.sin(c.blink * 22) > 0;
    for (const s of [-1, 1]){
      A.rr(x + s * (CW / 2 - 0.1) - 0.06, ly, 0.12, 0.06, 0.025); A.fs(up ? (on ? '#ffd23f' : '#ff4d5e') : '#fff3c4', 0.018);
      if (on){ g.save(); g.globalCompositeOperation = 'lighter'; A.circ(x + s * (CW / 2 - 0.1), ly + 0.03, 0.16); g.fillStyle = 'rgba(255,200,90,.45)'; g.fill(); g.restore(); }
    }
    if (!up){ A.rr(x - 0.1, ly + 0.01, 0.2, 0.06, 0.02); A.fs('#3a3346', 0.015); }
    A.rr(x - CW / 2 + 0.02, y - 0.07, CW - 0.04, 0.05, 0.02); A.fs('#4a4560', 0.02);
    A.rr(x - 0.07, y - 0.135, 0.14, 0.05, 0.01); A.fs('#fff6ea', 0.012);
    if (c.door > 0.02 && up) door();
  }
  // Where someone stands to get in (beside the driver's door) and where they sit.
  const doorSpot = c => { const up = c.dir === 'up', side = up ? -1 : 1, mid = c.by - CL * 0.5; return { x: c.cx + side * (CW / 2 + 0.24), y: mid + 0.02, sx: c.cx + side * (CW / 2 - 0.14), side }; };
  function streetLamp(g, x, y){
    A.shadow(x, y, 0.22, 0.07);
    A.box(x - 0.13, y - 0.02, 0.26, 0.14, 0.14, '#5a5f7a', '#4a4f6a');
    A.rr(x - 0.045, y - 2.2, 0.09, 2.08, 0.03); A.fs('#4a4f6a', 0.03);
    A.rr(x - 0.08, y - 1.0, 0.16, 0.08, 0.03); A.fs('#5a5f7a', 0.02);
    // A lantern head with a little cap.
    A.rr(x - 0.16, y - 2.56, 0.32, 0.36, 0.08); A.fs('#fff3b0', 0.03);
    g.beginPath(); g.moveTo(x - 0.22, y - 2.54); g.lineTo(x, y - 2.7); g.lineTo(x + 0.22, y - 2.54); g.closePath(); A.fs('#3d405b', 0.03);
    A.rr(x - 0.19, y - 2.22, 0.38, 0.06, 0.03); A.fs('#3d405b', 0.02);
  }
  function car(g, x, y, col, dir, t = 0){
    g.save(); g.translate(x, y); g.scale(0.8, 0.8); g.translate(-x, -y);
    paintCar(g, x, y, col, dir, t);
    g.restore();
  }
  function paintCar(g, x, y, col, dir, t){
    // A little car seen from above at our usual angle. x, y is the middle of its back (or front) bumper.
    const shade = A.shade(col, -0.25);
    if (dir === 'up' || dir === 'down'){
      A.shadow(x, y, 0.42, 0.1, 0.25);
      A.box(x - 0.36, y - 0.92, 0.72, 0.92, 0.3, col, shade, 0, 0.12, 0.035);
      const cabY = dir === 'up' ? y - 0.66 : y - 0.78;
      A.box(x - 0.29, cabY, 0.58, 0.46, 0.22, col, '#9fc3e6', 0.3, 0.1, 0.03);
      A.rr(x - 0.25, cabY - 0.5 + (dir === 'up' ? -0.02 : 0.06), 0.5, 0.14, 0.04); A.fs('#bcd6ef', 0.02);
      for (const s of [-1, 1]){ A.rr(x + s * 0.26 - 0.06, y - 0.14, 0.12, 0.06, 0.02); A.fs(dir === 'up' ? '#ff5d5d' : '#fff3b0', 0.015); }
      return;
    }
    const f = dir === 'right' ? 1 : -1, bounce = Math.sin(t * 18) * 0.008;
    A.shadow(x, y, 0.62, 0.12, 0.25);
    g.save(); g.translate(0, bounce);
    A.box(x - 0.6, y - 0.5, 1.2, 0.5, 0.32, col, shade, 0.06, 0.12, 0.035);
    A.box(x - 0.32 - f * 0.05, y - 0.44, 0.62, 0.4, 0.24, col, '#9fc3e6', 0.38, 0.1, 0.03);
    g.fillStyle = shade; g.fillRect(x - 0.02 - f * 0.05, y - 0.62, 0.04, 0.22);
    g.restore();
    for (const wx of [x - 0.36, x + 0.36]){ A.circ(wx, y - 0.04, 0.12); A.fs('#2b2230', 0.025); A.circ(wx, y - 0.04, 0.045); A.fs('#c9c9d6', 0); }
    A.rr(x + f * 0.55 - 0.05, y - 0.3, 0.1, 0.08, 0.02); A.fs('#fff3b0', 0.015);
    A.rr(x - f * 0.58 - 0.04, y - 0.3, 0.08, 0.08, 0.02); A.fs('#ff5d5d', 0.015);
  }
  const IN = { open: 0.35, step: 0.5, close: 0.35, blink: 0.8 };
  function spawnPerson(){
    const base = L.base, dc = L.cx, r = Math.random, look = { skin: pick(C.LOOKS.skin), hair: pick(HAIRS), hairStyle: pick(['short', 'long', 'bun']), shirt: pick(SHIRTS), pants: pick(PANTS) };
    if (r() < 0.25) look.kid = { skin: look.skin, hair: look.hair, hairStyle: pick(['bun', 'short']), shirt: pick(['#ffd23f', '#ff8fab', '#7bd389']), pants: pick(['#5a8dee', '#ef476f']), balloon: r() < 0.4 ? pick(['#ef476f', '#5a8dee', '#ffd23f']) : null };
    const doorX = dc + (r() - 0.5) * 1.2, walkY = base + 0.3 + r() * 0.15, doorY = base - 0.02;
    // Only the front row (the back row is half behind the buttons).
    const free = L.lots.filter(c => !c.busy && c.dir === 'up'), car = free.length ? pick(free) : null;
    const kind = r();
    if (car && kind < 0.84){
      car.busy = true;
      const d = doorSpot(car);
      if (kind < 0.42){
        // Pulling up: the door opens, they climb out, shut it, and walk to the mall.
        people.push({ mode: 'out', car, d, tt: 0, x: d.sx, y: d.y, look, path: [[d.x, d.y], [d.x, walkY], [doorX, walkY], [doorX, doorY]], i: 0, speed: 0.95 + r() * 0.35, t: r() * 10, door: true, a: 0 });
      } else {
        // Heading home with a bag: out the doors, across to the car, in, door shut, lights blink.
        look.hold = 'bag'; look.bagColor = pick(['#ff8fab', '#ffd23f', '#5cc8bf', '#5a8dee']);
        people.push({ mode: 'walk', car, d, then: 'in', x: doorX, y: doorY, look, path: [[doorX, doorY], [doorX, walkY], [d.x, walkY], [d.x, d.y]], i: 0, speed: 0.95 + r() * 0.35, t: r() * 10, door: true, a: 0 });
      }
      return;
    }
    // Strolling past on the sidewalk.
    const ltr = r() < 0.5, path = [[ltr ? -0.5 : W + 0.5, walkY], [ltr ? W + 0.5 : -0.5, walkY]];
    people.push({ mode: 'walk', path, i: 0, x: path[0][0], y: path[0][1], look, speed: 0.95 + r() * 0.35, t: r() * 10, door: false, a: 0 });
  }
  function stepPeople(dt){
    const doorY = L.base - 0.02;
    for (const p of people){
      p.t += dt; p.age = (p.age || 0) + dt;
      if (p.mode === 'in' || p.mode === 'out'){
        // Getting into (or out of) a car, in steps: door opens, step in (or out), door shuts, (lights blink).
        const c = p.car, d = p.d, k = (p.tt += dt), o = IN.open, st = o + IN.step, cl = st + IN.close;
        p.walking = false;
        c.door = k < o ? k / o : k < st ? 1 : Math.max(0, 1 - (k - st) / IN.close);
        const m = Math.max(0, Math.min(1, (k - o) / IN.step));
        if (p.mode === 'in'){
          p.x = d.x + (d.sx - d.x) * m; p.y = d.y - 0.04 * m; p.a = 1 - ease(m); p.flip = d.side > 0;
          if (k > cl) c.blink = Math.max(c.blink, 0.0001);
          if (k > cl + IN.blink){ c.busy = false; p.out = 0; }
        } else {
          p.x = d.sx + (d.x - d.sx) * m; p.y = d.y - 0.04 * (1 - m); p.a = ease(m); p.flip = d.side < 0;
          if (k > st){ p.mode = 'walk'; p.walking = true; }
          if (k > cl) c.busy = false;
        }
        continue;
      }
      if (p.car && p.car.door > 0 && p.car.busy && !p.then){ p.car.door = Math.max(0, p.car.door - dt / IN.close); if (p.car.door === 0) p.car.busy = false; }
      if (p.i < p.path.length - 1){
        const [tx, ty] = p.path[p.i + 1], dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), s = p.speed * dt;
        if (d <= s){ p.x = tx; p.y = ty; p.i++; } else { p.x += dx / d * s; p.y += dy / d * s; if (Math.abs(dx) > 0.01) p.flip = dx < 0; p.back = dy < -0.01 && Math.abs(dx) < 0.01; }
      }
      const done = p.i >= p.path.length - 1;
      if (done && p.then === 'in'){ p.mode = 'in'; p.tt = 0; p.then = null; p.back = false; continue; }
      // Fading in through the mall's doors (or out of them), and away at the end of a stroll.
      const doorF = Math.max(0, Math.min(1, (p.y - doorY) / 0.3));
      if (done) p.out = Math.max(0, (p.out === undefined ? 1 : p.out) - dt * 3);
      p.a = Math.min(1, p.age * 2.5) * (p.door ? doorF : 1) * (p.out === undefined ? 1 : p.out);
    }
    for (const c of L.lots) if (c.blink > 0 && (c.blink += dt) > IN.blink) c.blink = 0;
    for (let k = people.length - 1; k >= 0; k--) if (people[k].out === 0) people.splice(k, 1);
  }

  /* ---------- Each frame ---------- */
  function frame(now){
    if (gone) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000; last = now;
    if ((nextPerson -= dt) <= 0 && !entering){ spawnPerson(); nextPerson = 0.9 + Math.random() * 1.2; }
    if ((nextCar -= dt) <= 0){ const right = Math.random() < 0.5; cars.push({ x: right ? -1.2 : W + 1.2, y: right ? 7.42 : 7.92, dir: right ? 'right' : 'left', c: pick(CARS), v: 1.6 + Math.random() * 0.8 }); nextCar = 2.5 + Math.random() * 3.5; }
    for (const c of cars) c.x += (c.dir === 'right' ? 1 : -1) * c.v * dt;
    for (let k = cars.length - 1; k >= 0; k--) if (cars[k].x < -2 || cars[k].x > W + 2) cars.splice(k, 1);
    stepPeople(dt);
    const near = people.some(p => Math.abs(p.x - L.cx) < 1.1 && p.y < L.base + 0.55);
    doorOpen = entering ? Math.min(1, doorOpen + dt * 2.4) : Math.max(0, Math.min(1, doorOpen + (near ? dt * 2.5 : -dt * 1.6)));
    draw(t);
  }
  function draw(t){
    const g = ctx; A.setTarget(g, ppt);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // Heading inside: zoom toward the doors.
    let z = 1, white = 0;
    if (entering){
      const k = Math.min(1, (performance.now() - entering.t0) / 1500);
      z = 1 + easeIn(Math.max(0, (k - 0.15) / 0.85)) * 9; white = Math.max(0, (k - 0.45) / 0.55);
    }
    const fx = L.cx * ppt, fy = (L.base - 0.8) * ppt;
    g.translate(fx, fy); g.scale(z, z); g.translate(-fx, -fy);
    g.drawImage(back, 0, 0);
    g.save(); g.scale(ppt, ppt);
    // Stars coming out, and slow pink clouds.
    const r = A.mulberry(5);
    for (let k = 0; k < 46; k++){ const sx = r() * W, sy = r() * 2.6, tw = 0.45 + 0.55 * Math.sin(t * (1 + r() * 2) + k); A.circ(sx, sy, 0.018 + r() * 0.02); g.fillStyle = `rgba(255,248,230,${0.35 + 0.55 * tw * (1 - sy / 3)})`; g.fill(); }
    for (let k = 0; k < 3; k++){ const cw = 2 + k * 0.6, cx = ((k * 7.3 + t * (0.08 + k * 0.03)) % (W + cw * 2)) - cw, cy = 0.5 + k * 0.45; g.fillStyle = 'rgba(255,190,200,.32)'; A.ell(cx, cy, cw * 0.5, 0.18); g.fill(); A.ell(cx + cw * 0.15, cy - 0.12, cw * 0.28, 0.16); g.fill(); }
    g.restore();
    g.drawImage(front, 0, 0);
    g.save(); g.scale(ppt, ppt);
    drawDoors(g);
    drawSign(g, t);
    // Light pools under the lamps, and people and cars sorted by how far down they are.
    g.save(); g.globalCompositeOperation = 'lighter';
    const ly = L.base + 0.46;
    for (const lx of L.lamps){ const gl = g.createRadialGradient(lx, ly + 0.2, 0.1, lx, ly + 0.2, 1.7); gl.addColorStop(0, 'rgba(255,220,140,.34)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gl; A.ell(lx, ly + 0.2, 1.7, 0.75); g.fill(); }
    for (const c of cars){ const f = c.dir === 'right' ? 1 : -1, bx = c.x + f * 0.6; const beam = g.createRadialGradient(bx, c.y - 0.2, 0, bx + f * 1.1, c.y - 0.2, 1.4); beam.addColorStop(0, 'rgba(255,240,180,.45)'); beam.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = beam; g.beginPath(); g.moveTo(bx, c.y - 0.3); g.lineTo(bx + f * 2.2, c.y - 0.7); g.lineTo(bx + f * 2.2, c.y + 0.25); g.closePath(); g.fill(); }
    g.restore();
    const Q = [...people.map(p => [p.y, () => drawPerson(g, p, t)]), ...cars.map(c => [c.y, () => car(g, c.x, c.y, c.c, c.dir, t)]),
      ...L.lots.map(c => [c.by, () => parkedCar(g, c)]), ...L.lamps.map(lx => [ly, () => streetLamp(g, lx, ly)])].sort((a, b) => a[0] - b[0]);
    for (const [, f] of Q) f();
    // The lamps' lanterns glow over everything.
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const lx of L.lamps){ const hy = ly - 2.38, hg = g.createRadialGradient(lx, hy, 0, lx, hy, 0.75); hg.addColorStop(0, 'rgba(255,240,180,.6)'); hg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = hg; A.circ(lx, hy, 0.75); g.fill(); }
    g.restore();
    // A soft vignette, and the warm white of the mall's lights as we go in.
    const vg = g.createRadialGradient(W / 2, 4.5, 3, W / 2, 4.5, W * 0.7); vg.addColorStop(0, 'rgba(20,10,30,0)'); vg.addColorStop(1, 'rgba(20,10,30,.45)');
    g.fillStyle = vg; g.fillRect(-W, -9, W * 3, 27);
    g.restore();
    if (white > 0){ g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(255,246,226,${white})`; g.fillRect(0, 0, cv.width, cv.height); }
  }
  function drawPerson(g, p, t){
    if (p.a <= 0.01) return;
    g.save(); g.globalAlpha = p.a;
    A.person(p.x, p.y, { ...p.look, t: p.t, walk: p.mode === 'walk', flip: p.flip, back: p.back, s: 0.68 });
    g.restore();
  }
  function drawDoors(g){
    const { x0, x1, top } = L.door, base = L.base, k = ease(doorOpen), w = (x1 - x0) / 2;
    // The bright mall inside, seen through the doors.
    const inside = g.createLinearGradient(0, top, 0, base); inside.addColorStop(0, '#fff6dc'); inside.addColorStop(1, '#ffe2a8');
    A.rr(x0, top, x1 - x0, base - top, 0.04); A.fs(inside, 0.05);
    g.save(); A.rr(x0, top, x1 - x0, base - top, 0.04); g.clip();
    // Storefronts across the concourse, and the checkered floor running up to them.
    const sy = top + 0.35, fy = top + (base - top) * 0.55;
    ['#e8577e', '#3fb8af', '#ffd23f', '#5a8dee', '#9b5de5'].forEach((c, i) => { const bx = x0 - 0.2 + i * 0.5; A.rr(bx, sy, 0.44, fy - sy, 0.03); A.fs('#fff8ea', 0.02); A.rr(bx, sy, 0.44, 0.12, 0.02); A.fs(c, 0.015); A.rr(bx + 0.08, sy + 0.22, 0.28, fy - sy - 0.28, 0.02); A.fs('rgba(185,228,245,.8)', 0.012); });
    for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) if ((i + j) % 2){ g.fillStyle = 'rgba(232,170,190,.45)'; g.fillRect(x0 + i * 0.22, fy + j * (base - fy) / 4, 0.22, (base - fy) / 4); }
    for (const px of [x0 + 0.3, x1 - 0.3]){ g.save(); g.translate(px, fy + 0.3); g.scale(0.42, 0.42); g.translate(-px, -(fy + 0.3)); A.palm(px, fy + 0.3); g.restore(); }
    g.restore();
    // Two glass panes sliding apart.
    for (const s of [-1, 1]){
      const px = s < 0 ? x0 - k * w * 0.92 : L.cx + k * w * 0.92;
      g.save(); g.beginPath(); g.rect(x0 - 0.02, top, x1 - x0 + 0.04, base - top); g.clip();
      A.rr(px + 0.03, top + 0.03, w - 0.06, base - top - 0.06, 0.03); A.fs('rgba(200,236,250,.55)', 0.04);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(px + 0.15, base - 0.1); g.lineTo(px + 0.45, top + 0.1); g.lineTo(px + 0.58, top + 0.1); g.lineTo(px + 0.28, base - 0.1); g.fill();
      A.rr(px + (s < 0 ? w - 0.16 : 0.08), top + (base - top) * 0.45, 0.08, 0.32, 0.03); A.fs('#c9c2d6', 0.02);
      g.restore();
    }
    A.rr(x0 - 0.06, top - 0.08, x1 - x0 + 0.12, base - top + 0.08, 0.04); A.fs(null, 0.06, '#3a2346');
    // A little neon OPEN in the window beside the doors.
    const ox = x0 - 0.55, oy = top + 0.55;
    A.rr(ox - 0.34, oy - 0.16, 0.68, 0.32, 0.12); A.fs('rgba(58,35,70,.85)', 0.025);
    g.save(); g.shadowColor = '#ff5fa2'; g.shadowBlur = 0.25 * ppt;
    A.text('OPEN', ox, oy + 0.01, 0.2, '#ffb3d3', 700);
    g.restore();
  }
  function drawSign(g, t){
    const { c0, c1, signY, signH, font, widths, total, cx } = L;
    const start = 0.5, step = 0.13;
    const onAt = i => start + i * step;
    const allOn = onAt(SIGN.length - 1) + 0.25;
    // Marquee bulbs chasing round the board once it's lit.
    const bx0 = c0 + 0.45, bx1 = c1 - 0.45, by0 = signY, by1 = signY + signH, per = 2 * (bx1 - bx0 + by1 - by0), n = Math.round(per / 0.28);
    for (let i = 0; i < n; i++){
      let d = i / n * per, x, y;
      if (d < bx1 - bx0){ x = bx0 + d; y = by0; } else if ((d -= bx1 - bx0) < by1 - by0){ x = bx1; y = by0 + d; } else if ((d -= by1 - by0) < bx1 - bx0){ x = bx1 - d; y = by1; } else { d -= bx1 - bx0; x = bx0; y = by1 - d; }
      const lit = t > allOn && (i + Math.floor(t * 6)) % 3 !== 0;
      A.circ(x, y, 0.055); A.fs(lit ? '#fff2a8' : '#7a5a6e', 0.018);
      if (lit){ g.save(); g.globalCompositeOperation = 'lighter'; A.circ(x, y, 0.14); g.fillStyle = 'rgba(255,220,120,.35)'; g.fill(); g.restore(); }
    }
    // Now and then one letter sputters, like real neon.
    if (t > allOn + 1 && (flickT -= 1 / 60) <= 0){ flick = { i: Math.floor(Math.random() * SIGN.length), until: t + 0.35 }; flickT = 4 + Math.random() * 4; }
    let x = cx - total * font / 2;
    const y = signY + signH * 0.53;
    g.save(); g.translate(0, 0);
    for (let i = 0; i < SIGN.length; i++){
      const ch = SIGN[i], w = widths[i] * font;
      if (ch !== ' '){
        const k = t - onAt(i);
        let on = k > 0.2 || (k > 0 && Math.sin(k * 90 + i) > 0);
        if (flick && flick.i === i && t < flick.until) on = Math.sin(t * 70) > 0.2;
        neonLetter(g, ch, x + w / 2, y, font, on, i);
      }
      x += w + 0.06 * font;
    }
    g.restore();
    // The tagline lights up once the sign's on.
    const ta = Math.max(0, Math.min(1, (t - allOn - 0.2) / 0.5));
    if (ta > 0){
      const sz = Math.min(0.42, font * 0.4) * ppt;
      g.save(); g.globalAlpha = ta; g.translate(cx, signY + signH + 0.36); g.scale(1 / ppt, 1 / ppt);
      g.font = `700 ${sz}px Fredoka, 'Trebuchet MS', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.fillStyle = '#3a2346'; g.fillText(TAG, 0, sz * 0.12);
      g.lineWidth = sz * 0.22; g.strokeStyle = '#3a2346'; g.strokeText(TAG, 0, 0);
      g.fillStyle = '#ffd23f'; g.fillText(TAG, 0, 0);
      g.restore();
    }
  }
  function neonLetter(g, ch, x, y, size, on, i){
    g.save(); g.translate(x, y); g.scale(1 / ppt, 1 / ppt);
    g.font = `700 ${size * ppt}px Fredoka, 'Trebuchet MS', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round';
    const col = i < 4 ? '#ff6fae' : '#ffd23f';
    if (on){
      g.shadowColor = col; g.shadowBlur = size * ppt * 0.45;
      g.lineWidth = size * ppt * 0.16; g.strokeStyle = col; g.strokeText(ch, 0, 0);
      g.shadowBlur = size * ppt * 0.2; g.fillStyle = '#fff4fa'; g.fillText(ch, 0, 0);
    } else {
      g.lineWidth = size * ppt * 0.13; g.strokeStyle = '#5a3d5e'; g.strokeText(ch, 0, 0);
      g.fillStyle = '#7a5874'; g.fillText(ch, 0, 0);
    }
    g.restore();
  }

  // For playtests: what's going on in the scene.
  cv.__scene = { people, get lots(){ return L.lots; } };
  resize();
  if (document.fonts && document.fonts.load) document.fonts.load("700 20px Fredoka").then(() => { if (!gone) resize(); }).catch(() => {});
  const onResize = () => resize();
  addEventListener('resize', onResize);
  raf = requestAnimationFrame(frame);
  return {
    // Doors open, the camera goes in, the screen goes warm white. Resolves when it's all white.
    enter(){
      if (entering) return entering.done;
      entering = { t0: performance.now() };
      entering.done = new Promise(res => setTimeout(res, 1550));
      return entering.done;
    },
    // Fade the warm white away to show the game, then clean up.
    fadeOut(){
      cv.style.transition = 'opacity .45s ease'; cv.style.opacity = '0';
      setTimeout(() => this.destroy(), 500);
    },
    destroy(){ gone = true; cancelAnimationFrame(raf); removeEventListener('resize', onResize); cv.remove(); },
  };
}
