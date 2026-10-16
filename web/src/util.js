import * as THREE from 'three';

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
// Frame-rate independent exponential smoothing.
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;

export function randomUnit(out = new THREE.Vector3()) {
  const u = Math.random() * 2 - 1;
  const t = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(t), u, s * Math.sin(t));
}

export function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Seeded PRNG for repeatable geometry.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cheap hashed 3D value noise (for asteroid deformation on the CPU).
function hash3(x, y, z, seed) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 144269504) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h & 0xffff) / 0xffff;
}
const fade = (t) => t * t * (3 - 2 * t);
export function valueNoise3(x, y, z, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz, seed);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}
export function fbm3(x, y, z, seed = 0, oct = 4) {
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += amp * valueNoise3(x * freq, y * freq, z * freq, seed + i * 31);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

// Rotate unit vector `from` toward `to` by at most maxAngle radians (in place on `from`).
const _axis = new THREE.Vector3();
const _q = new THREE.Quaternion();
export function rotateTowards(from, to, maxAngle) {
  const d = clamp(from.dot(to), -1, 1);
  const ang = Math.acos(d);
  if (ang < 1e-5) return from;
  if (ang <= maxAngle) return from.copy(to);
  _axis.crossVectors(from, to);
  if (_axis.lengthSq() < 1e-10) {
    // Opposite directions: pick any perpendicular axis.
    _axis.set(0, 1, 0).cross(from);
    if (_axis.lengthSq() < 1e-6) _axis.set(1, 0, 0);
  }
  _axis.normalize();
  _q.setFromAxisAngle(_axis, maxAngle);
  return from.applyQuaternion(_q).normalize();
}

// First-order intercept: where to aim a projectile of speed `speed` fired from `from` to hit target moving with `tv`.
export function leadPoint(from, tp, tv, speed, out) {
  const dx = tp.x - from.x, dy = tp.y - from.y, dz = tp.z - from.z;
  const a = tv.lengthSq() - speed * speed;
  const b = 2 * (dx * tv.x + dy * tv.y + dz * tv.z);
  const c = dx * dx + dy * dy + dz * dz;
  let t;
  if (Math.abs(a) < 1e-6) t = -c / b;
  else {
    const disc = b * b - 4 * a * c;
    if (disc < 0) t = Math.sqrt(c) / speed;
    else {
      const s = Math.sqrt(disc);
      const t1 = (-b - s) / (2 * a), t2 = (-b + s) / (2 * a);
      t = Math.min(t1, t2) > 0 ? Math.min(t1, t2) : Math.max(t1, t2);
    }
  }
  if (!(t > 0) || t > 6) t = Math.sqrt(c) / speed;
  return out.set(tp.x + tv.x * t, tp.y + tv.y * t, tp.z + tv.z * t);
}

// Closest distance squared from point c to segment p0->p1.
export function segPointDistSq(p0, p1, c) {
  const vx = p1.x - p0.x, vy = p1.y - p0.y, vz = p1.z - p0.z;
  const wx = c.x - p0.x, wy = c.y - p0.y, wz = c.z - p0.z;
  const vv = vx * vx + vy * vy + vz * vz;
  let t = vv > 0 ? (wx * vx + wy * vy + wz * vz) / vv : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = p0.x + vx * t - c.x, dy = p0.y + vy * t - c.y, dz = p0.z + vz * t - c.z;
  return dx * dx + dy * dy + dz * dz;
}

let glowTex = null;
export function getGlowTexture() {
  if (glowTex) return glowTex;
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.15, 'rgba(255,255,255,0.85)');
  grd.addColorStop(0.4, 'rgba(255,255,255,0.25)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

export function haptic(ms) {
  if (!window.__settings || !window.__settings.haptics) return;
  try {
    if (window.AndroidBridge && window.AndroidBridge.vibrate) window.AndroidBridge.vibrate(ms | 0);
    else if (navigator.vibrate) navigator.vibrate(ms | 0);
  } catch (e) { /* ignore */ }
}
