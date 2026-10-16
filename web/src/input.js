// Touch (floating joystick + slide-friendly buttons) and keyboard input.
import { clamp } from './util.js';

const HOLD = new Set(['fire', 'boost', 'brake']);

// Button layout: distance of center from the right (or left, when left-handed) and bottom edge, and diameter.
const LAYOUT = {
  fire:    { r: 88,  b: 88,  d: 112 },
  boost:   { r: 205, b: 56,  d: 74 },
  brake:   { r: 292, b: 46,  d: 56 },
  missile: { r: 190, b: 152, d: 66 },
  bomb:    { r: 82,  b: 205, d: 60 },
};

export class Input {
  constructor(root) {
    this.root = root;
    this.stick = { x: 0, y: 0 };
    this.fire = false;
    this.boost = false;
    this.brake = false;
    this.events = [];
    this.pointers = new Map();
    this.held = { fire: 0, boost: 0, brake: 0 };
    this.keys = new Set();
    this.lefty = false;
    this.enabled = false;
    this.stickRadius = 62;
    this.base = root.querySelector('#stickBase');
    this.knob = root.querySelector('#stickKnob');
    this.buttons = {};
    root.querySelectorAll('[data-btn]').forEach((el) => (this.buttons[el.dataset.btn] = el));
    this.stickState = null;
    this._kbStick = { x: 0, y: 0 };

    const opts = { passive: false };
    root.addEventListener('pointerdown', (e) => this._down(e), opts);
    root.addEventListener('pointermove', (e) => this._move(e), opts);
    root.addEventListener('pointerup', (e) => this._up(e), opts);
    root.addEventListener('pointercancel', (e) => this._up(e), opts);
    root.addEventListener('lostpointercapture', (e) => this._up(e), opts);
    root.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => this._key(e, true));
    window.addEventListener('keyup', (e) => this._key(e, false));
    window.addEventListener('blur', () => this.reset());
    this.layout();
  }

  setLefty(v) {
    this.lefty = v;
    this.layout();
  }

  layout() {
    const h = window.innerHeight, w = window.innerWidth;
    const s = clamp(Math.min(h / 390, w / 760), 0.72, 1.35);
    this.scale = s;
    this.stickRadius = 62 * s;
    for (const [k, L] of Object.entries(LAYOUT)) {
      const el = this.buttons[k];
      if (!el) continue;
      const d = L.d * s;
      el.style.width = el.style.height = d + 'px';
      el.style.bottom = (L.b * s - d / 2) + 'px';
      if (this.lefty) { el.style.left = (L.r * s - d / 2) + 'px'; el.style.right = ''; }
      else { el.style.right = (L.r * s - d / 2) + 'px'; el.style.left = ''; }
    }
    const bd = this.stickRadius * 2;
    this.base.style.width = this.base.style.height = bd + 'px';
    this.knob.style.width = this.knob.style.height = bd * 0.45 + 'px';
    this._restBase();
    this._cacheRects();
  }

  _restBase() {
    const s = this.scale || 1;
    const x = this.lefty ? window.innerWidth - 130 * s : 130 * s;
    const y = window.innerHeight - 120 * s;
    this._placeBase(x, y);
    this.base.classList.remove('active');
    this.knob.style.transform = 'translate(-50%, -50%)';
  }

  _placeBase(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.base.style.left = x + 'px';
    this.base.style.top = y + 'px';
  }

  _cacheRects() {
    this.rects = {};
    for (const [k, el] of Object.entries(this.buttons)) {
      const r = el.getBoundingClientRect();
      this.rects[k] = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: (r.width / 2) * 1.12 };
    }
  }

  _hit(x, y) {
    let best = null, bd = Infinity;
    for (const [k, c] of Object.entries(this.rects)) {
      const d = Math.hypot(x - c.x, y - c.y);
      if (d < c.r && d < bd) { best = k; bd = d; }
    }
    return best;
  }

  _press(btn) {
    if (!btn) return;
    this.buttons[btn].classList.add('down');
    if (HOLD.has(btn)) this.held[btn]++;
    else this.events.push(btn);
  }

  _release(btn) {
    if (!btn) return;
    if (HOLD.has(btn)) this.held[btn] = Math.max(0, this.held[btn] - 1);
    let still = false;
    for (const p of this.pointers.values()) if (p.btn === btn) still = true;
    if (!still || HOLD.has(btn) && this.held[btn] === 0) this.buttons[btn].classList.remove('down');
  }

  _isStickSide(x) {
    return this.lefty ? x > window.innerWidth * 0.55 : x < window.innerWidth * 0.45;
  }

  _down(e) {
    if (!this.enabled) return;
    e.preventDefault();
    try { this.root.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const x = e.clientX, y = e.clientY;
    if (this.tapHandler && this.tapHandler(x, y)) return;
    const btn = this._hit(x, y);
    if (btn) {
      this.pointers.set(e.pointerId, { kind: 'btn', btn });
      this._press(btn);
    } else if (this._isStickSide(x) && !this.stickState) {
      this.stickState = { id: e.pointerId };
      this.pointers.set(e.pointerId, { kind: 'stick' });
      this._placeBase(x, y);
      this.base.classList.add('active');
      this._stickMove(x, y);
    } else {
      this.pointers.set(e.pointerId, { kind: 'btn', btn: null });
    }
  }

  _move(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    e.preventDefault();
    if (p.kind === 'stick') this._stickMove(e.clientX, e.clientY);
    else {
      // Slide between buttons without lifting the thumb.
      const btn = this._hit(e.clientX, e.clientY);
      if (btn !== p.btn) {
        const old = p.btn;
        p.btn = btn;
        this._release(old);
        this._press(btn);
      }
    }
  }

  _up(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;
    this.pointers.delete(e.pointerId);
    if (p.kind === 'stick') {
      this.stickState = null;
      this.stick.x = this.stick.y = 0;
      this._restBase();
    } else this._release(p.btn);
  }

  _stickMove(x, y) {
    const R = this.stickRadius;
    let dx = x - this.baseX, dy = y - this.baseY;
    let d = Math.hypot(dx, dy);
    // Base follows the thumb if it drifts far, so control is never lost.
    if (d > R * 1.5) {
      const k = (d - R * 1.5) / d;
      this._placeBase(this.baseX + dx * k, this.baseY + dy * k);
      dx = x - this.baseX;
      dy = y - this.baseY;
      d = Math.hypot(dx, dy);
    }
    const cl = Math.min(d, R);
    const kx = d > 0 ? (dx / d) * cl : 0, ky = d > 0 ? (dy / d) * cl : 0;
    this.knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    let nx = kx / R, ny = -ky / R;
    const mag = Math.hypot(nx, ny);
    const dz = 0.08;
    if (mag < dz) nx = ny = 0;
    else {
      const m2 = Math.pow((mag - dz) / (1 - dz), 1.35);
      nx = (nx / mag) * m2;
      ny = (ny / mag) * m2;
    }
    this.stick.x = nx;
    this.stick.y = ny;
  }

  _key(e, down) {
    const k = e.code;
    if (down && this.keys.has(k)) return;
    if (down) this.keys.add(k);
    else this.keys.delete(k);
    if (!down) return;
    if (k === 'KeyE' || k === 'KeyI') this.events.push('missile');
    if (k === 'KeyQ' || k === 'KeyO') this.events.push('bomb');
    if (k === 'Escape' || k === 'KeyP') this.events.push('pause');
  }

  update(dt) {
    const K = this.keys;
    const kx = (K.has('KeyD') || K.has('ArrowRight') ? 1 : 0) - (K.has('KeyA') || K.has('ArrowLeft') ? 1 : 0);
    const ky = (K.has('KeyW') || K.has('ArrowUp') ? 1 : 0) - (K.has('KeyS') || K.has('ArrowDown') ? 1 : 0);
    const a = 1 - Math.exp(-10 * dt);
    this._kbStick.x += (kx - this._kbStick.x) * a;
    this._kbStick.y += (ky - this._kbStick.y) * a;
    const kbActive = kx || ky || Math.abs(this._kbStick.x) > 0.01 || Math.abs(this._kbStick.y) > 0.01;
    if (!this.stickState && kbActive) {
      this.stick.x = this._kbStick.x;
      this.stick.y = this._kbStick.y;
    } else if (!this.stickState) {
      this.stick.x = this.stick.y = 0;
    }
    this.fire = this.held.fire > 0 || K.has('Space') || K.has('KeyJ');
    this.boost = this.held.boost > 0 || K.has('ShiftLeft') || K.has('ShiftRight') || K.has('KeyK');
    this.brake = this.held.brake > 0 || K.has('KeyL') || K.has('ControlLeft');
  }

  consume() {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  reset() {
    this.pointers.clear();
    this.stickState = null;
    this.stick.x = this.stick.y = 0;
    this.held = { fire: 0, boost: 0, brake: 0 };
    this.events = [];
    this.keys.clear();
    Object.values(this.buttons).forEach((b) => b.classList.remove('down'));
    this._restBase();
  }
}
