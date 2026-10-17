// Touch and mouse: one finger pans (or drags the placement ghost), two fingers pinch-zoom, a quick touch taps.
import { view, clampCam, screenToWorld } from './render.js';

export function initInput(canvas, h){
  const pts = new Map();
  let start = null, moved = false, pinch = null, grab = false;
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, pos(e));
    if (pts.size === 1){
      const p = pos(e); start = { ...p, cx: view.cam.x, cy: view.cam.y, time: performance.now() }; moved = false;
      const w = screenToWorld(p.x, p.y);
      grab = !!(h.onGrab && h.onGrab(w.x, w.y));
    } else if (pts.size === 2){
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.cam.s, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cx: view.cam.x, cy: view.cam.y };
      moved = true; grab = false;
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, pos(e));
    if (pinch && pts.size >= 2){
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const anchor = { x: (pinch.mid.x - view.W / 2) / pinch.s + pinch.cx, y: (pinch.mid.y - view.H / 2) / pinch.s + pinch.cy };
      view.cam.s = pinch.s * d / pinch.d; clampCam();
      view.cam.x = anchor.x - (mid.x - view.W / 2) / view.cam.s;
      view.cam.y = anchor.y - (mid.y - view.H / 2) / view.cam.s;
      clampCam();
      return;
    }
    if (!start) return;
    const p = pos(e);
    if (!moved && Math.hypot(p.x - start.x, p.y - start.y) > 9) moved = true;
    if (!moved) return;
    if (grab){ const w = screenToWorld(p.x, p.y); h.onGrabMove && h.onGrabMove(w.x, w.y); return; }
    view.cam.x = start.cx - (p.x - start.x) / view.cam.s;
    view.cam.y = start.cy - (p.y - start.y) / view.cam.s;
    clampCam();
  });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size === 0){
      if (start && !moved){ const w = screenToWorld(start.x, start.y); h.onTap && h.onTap(w.x, w.y); }
      if (grab && moved) h.onGrabEnd && h.onGrabEnd();
      start = null; pinch = null; grab = false;
    } else if (pts.size === 1){ pinch = null; const p = [...pts.values()][0]; start = { ...p, cx: view.cam.x, cy: view.cam.y }; moved = true; }
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const p = pos(e), before = screenToWorld(p.x, p.y);
    view.cam.s *= Math.exp(-e.deltaY * 0.0015); clampCam();
    const after = screenToWorld(p.x, p.y);
    view.cam.x += before.x - after.x; view.cam.y += before.y - after.y; clampCam();
  }, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}
