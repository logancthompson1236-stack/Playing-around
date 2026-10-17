// Procedurally assembled low-poly models (no external assets).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { getGlowTexture } from './util.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();

// Take a primitive, transform it, paint it a flat color, and strip it down to position/normal/color.
function part(geo, color, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  let g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  _m.compose(_v.set(...pos), _q.setFromEuler(_e.set(...rot)), _s.set(...scale));
  g.applyMatrix4(_m);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const c = new THREE.Color(color);
  for (let i = 0; i < n; i++) {
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// Mirror helper: same part at +x and -x (rotations around y/z flipped).
function mirror(list, geoFn, color, pos, rot = [0, 0, 0], scale = [1, 1, 1]) {
  list.push(part(geoFn(), color, pos, rot, scale));
  list.push(part(geoFn(), color, [-pos[0], pos[1], pos[2]], [rot[0], -rot[1], -rot[2]], scale));
}

const ALONG_Z = [Math.PI / 2, 0, 0]; // cylinders: +Y -> +Z

const cyl = (rt, rb, h, seg = 8) => () => new THREE.CylinderGeometry(rt, rb, h, seg);
const box = (x, y, z) => () => new THREE.BoxGeometry(x, y, z);

let hullMat = null;
let glowMat = null;
export function getHullMaterial() {
  if (!hullMat) {
    hullMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, metalness: 0.5, roughness: 0.42 });
  }
  return hullMat;
}
export function getGlowMaterial() {
  if (!glowMat) glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  return glowMat;
}

function engineSprite(color, size) {
  const mat = new THREE.SpriteMaterial({
    map: getGlowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
  const s = new THREE.Sprite(mat);
  s.scale.set(size, size, size);
  s.userData.baseSize = size;
  return s;
}

function assemble(hullParts, glowParts, engines, engineColor, engineSize, hullMaterial) {
  const group = new THREE.Group();
  const hull = new THREE.Mesh(mergeGeometries(hullParts), hullMaterial || getHullMaterial());
  group.add(hull);
  if (glowParts.length) group.add(new THREE.Mesh(mergeGeometries(glowParts), getGlowMaterial()));
  group.userData.engines = engines.map((p) => {
    const s = engineSprite(engineColor, engineSize);
    s.position.set(...p);
    group.add(s);
    return s;
  });
  group.userData.hull = hull;
  return group;
}

// ---------------- Player: "Kestrel" ----------------
export function buildPlayerShip() {
  const H = [], G = [];
  const white = 0xdfe4ec, grey = 0x8f99a8, dark = 0x353b45, orange = 0xff7a1a;
  H.push(part(cyl(0.12, 0.95, 6.2, 6)(), white, [0, 0, 0.6], ALONG_Z, [1.15, 1, 0.62]));
  H.push(part(new THREE.SphereGeometry(0.55, 10, 8), 0x1d3c5e, [0, 0.38, 1.1], [0, 0, 0], [0.75, 0.55, 1.9]));
  H.push(part(box(1.5, 0.5, 2.6)(), grey, [0, -0.05, -1.7]));
  mirror(H, box(4.3, 0.12, 1.7), grey, [2.25, -0.05, -0.9], [0, 0.38, -0.07]);
  mirror(H, box(1.3, 0.14, 0.45), orange, [3.0, 0.0, -0.75], [0, 0.38, -0.07]);
  mirror(H, cyl(0.13, 0.13, 2.4, 6), dark, [4.05, -0.18, -0.15], ALONG_Z);
  mirror(H, cyl(0.42, 0.55, 2.6, 8), 0x5c6573, [0.95, -0.1, -2.5], ALONG_Z);
  mirror(H, box(0.1, 1.3, 1.3), orange, [0.75, 0.62, -2.7], [0, 0, -0.32]);
  // Glows: nozzles, nav lights, canopy rim.
  mirror(G, cyl(0.36, 0.36, 0.08, 8), 0x8ff0ff, [0.95, -0.1, -3.82], ALONG_Z);
  G.push(part(new THREE.BoxGeometry(0.18, 0.18, 0.18), 0xff2a2a, [4.05, -0.18, 1.0]));
  G.push(part(new THREE.BoxGeometry(0.18, 0.18, 0.18), 0x2aff6a, [-4.05, -0.18, 1.0]));
  const g = assemble(H, G, [[0.95, -0.1, -4.1], [-0.95, -0.1, -4.1]], 0x7fe6ff, 2.4);
  g.userData.muzzles = [new THREE.Vector3(4.05, -0.18, 1.4), new THREE.Vector3(-4.05, -0.18, 1.4)];
  return g;
}

// ---------------- Enemies ----------------
export function buildRaider(mat) {
  const H = [], G = [];
  const red = 0x8a1f2c, dark = 0x2a2d33, steel = 0x5a5f69;
  H.push(part(cyl(0.15, 1.0, 5.2, 4)(), red, [0, 0, 0.2], [Math.PI / 2, Math.PI / 4, 0], [1.2, 1, 0.55]));
  mirror(H, box(3.6, 0.12, 1.2), dark, [1.9, 0, 0.3], [0, -0.5, 0.12]);
  mirror(H, box(0.25, 0.25, 2.2), steel, [3.4, 0.15, 1.2]);
  mirror(H, box(0.1, 0.9, 1.0), red, [3.4, 0.55, 0.6]);
  H.push(part(box(1.4, 0.6, 1.6)(), dark, [0, 0, -2.0]));
  G.push(part(new THREE.SphereGeometry(0.32, 8, 6), 0xff3030, [0, 0.28, 1.4], [0, 0, 0], [1, 0.6, 1.4]));
  mirror(G, box(0.12, 0.12, 0.5), 0xff5040, [3.4, 0.15, 2.35]);
  const g = assemble(H, G, [[0, 0, -2.9]], 0xff5a3a, 2.6, mat);
  g.userData.muzzles = [new THREE.Vector3(3.4, 0.15, 2.4), new THREE.Vector3(-3.4, 0.15, 2.4)];
  return g;
}

export function buildLancer(mat) {
  const H = [], G = [];
  const purple = 0x4c2a80, dark = 0x24222e, pale = 0xb9a8d9;
  H.push(part(cyl(0.04, 0.55, 7.4, 6)(), purple, [0, 0, 0.4], ALONG_Z));
  H.push(part(cyl(0.55, 0.65, 1.6, 6)(), dark, [0, 0, -3.6], ALONG_Z));
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    H.push(part(box(0.08, 1.9, 1.6)(), pale, [Math.sin(a) * 1.0, Math.cos(a) * 1.0, -2.8], [0, 0, -a]));
  }
  G.push(part(box(0.12, 0.12, 3.2)(), 0xff4cff, [0, 0.42, 0.2]));
  G.push(part(new THREE.SphereGeometry(0.22, 6, 5), 0xff7aff, [0, 0, 4.1]));
  const g = assemble(H, G, [[0, 0, -4.6]], 0xff4cff, 2.8, mat);
  g.userData.muzzles = [new THREE.Vector3(0, 0, 4.2)];
  return g;
}

export function buildWarden(mat) {
  const H = [], G = [];
  const hull = 0x3e4552, plate = 0x8a5a22, dark = 0x23262c;
  H.push(part(cyl(2.4, 3.1, 10, 6)(), hull, [0, 0, 0], ALONG_Z, [1, 0.7, 1]));
  H.push(part(box(2.0, 1.2, 3.0)(), plate, [0, 1.6, -0.8]));
  mirror(H, box(1.4, 1.4, 5.2), dark, [3.9, 0, 0.6]);
  mirror(H, cyl(0.22, 0.22, 2.6, 6), 0x777f8c, [3.9, 0.35, 4.2], ALONG_Z);
  mirror(H, cyl(0.22, 0.22, 2.6, 6), 0x777f8c, [3.9, -0.35, 4.2], ALONG_Z);
  mirror(H, box(2.4, 0.3, 3.0), plate, [2.0, -1.4, -1.5], [0, 0, 0.3]);
  H.push(part(cyl(1.4, 2.0, 1.4, 6)(), dark, [0, 0, -5.6], ALONG_Z));
  G.push(part(box(1.7, 0.25, 0.3)(), 0xffb040, [0, 1.75, 0.75]));
  mirror(G, box(0.3, 0.3, 0.3), 0xffa030, [3.9, 0.75, 3.0]);
  const g = assemble(H, G, [[0, 0, -6.6], [1.4, 0.6, -6.3], [-1.4, 0.6, -6.3]], 0xffa040, 4.2, mat);
  g.userData.muzzles = [new THREE.Vector3(3.9, 0, 5.6), new THREE.Vector3(-3.9, 0, 5.6)];
  return g;
}

export const ENEMY_BUILDERS = { raider: buildRaider, lancer: buildLancer, warden: buildWarden };

// ---------------- Power-up crystal ----------------
const iconTexCache = {};
function iconTexture(letter, css) {
  if (iconTexCache[letter]) return iconTexCache[letter];
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.strokeStyle = css;
  g.lineWidth = 8;
  g.beginPath();
  g.arc(64, 64, 52, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#ffffff';
  g.font = 'bold 72px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = css;
  g.shadowBlur = 16;
  g.fillText(letter, 64, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return (iconTexCache[letter] = t);
}

export function buildPowerup(def) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.0, 0),
    new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.85 })
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.6, 0),
    new THREE.MeshBasicMaterial({ color: def.color, wireframe: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: getGlowTexture(), color: def.color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8,
  }));
  glow.scale.setScalar(16);
  const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture(def.icon, def.css), depthWrite: false, transparent: true }));
  icon.scale.setScalar(5);
  icon.position.y = 6;
  g.add(core, shell, glow, icon);
  g.userData = { core, shell, glow, icon };
  return g;
}

// ---------------- Warp gate ----------------
export function buildWarpGate() {
  const g = new THREE.Group();
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a6578, metalness: 0.7, roughness: 0.35, flatShading: true });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(48, 4.5, 6, 28), ringMat);
  g.add(ring);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x6bffb0, toneMapped: false });
  const segs = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 11), lightMat);
    b.position.set(Math.cos(a) * 48, Math.sin(a) * 48, 0);
    b.rotation.z = a;
    segs.add(b);
  }
  g.add(segs);
  // Swirling portal disk.
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const grd = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,0.95)');
  grd.addColorStop(0.3, 'rgba(120,255,200,0.55)');
  grd.addColorStop(0.75, 'rgba(40,160,255,0.25)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = grd;
  x.fillRect(0, 0, 256, 256);
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    x.strokeStyle = 'rgba(180,255,230,0.25)';
    x.lineWidth = 6;
    x.beginPath();
    for (let t = 0; t < 1; t += 0.01) {
      const r = t * 120, a = t * 7 + (i * Math.PI) / 3;
      const px = 128 + Math.cos(a) * r, py = 128 + Math.sin(a) * r;
      t === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const disk = new THREE.Mesh(
    new THREE.CircleGeometry(44, 40),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  g.add(disk);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: getGlowTexture(), color: 0x6bffb0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6,
  }));
  glow.scale.setScalar(220);
  g.add(glow);
  g.userData = { ring, segs, disk };
  return g;
}

// ---------------- Additional player ships ----------------
export function buildWasp() {
  const H = [], G = [];
  const yellow = 0xf2c230, black = 0x22242a, grey = 0x8a919c;
  H.push(part(cyl(0.08, 0.7, 7.6, 6)(), yellow, [0, 0, 0.8], ALONG_Z, [1, 0.8, 1]));
  H.push(part(new THREE.SphereGeometry(0.45, 10, 8), 0x1a2a40, [0, 0.32, 1.6], [0, 0, 0], [0.7, 0.55, 2.0]));
  mirror(H, box(3.0, 0.1, 1.2), black, [1.6, 0, 0.2], [0, -0.55, -0.05]);
  mirror(H, box(0.9, 0.12, 0.35), yellow, [2.4, 0.02, 0.7], [0, -0.55, -0.05]);
  mirror(H, cyl(0.12, 0.12, 3.0, 6), grey, [0.9, 0.1, -2.2], ALONG_Z);
  mirror(H, box(0.08, 1.0, 1.1), black, [0.9, 0.55, -3.2], [0, 0, -0.2]);
  H.push(part(cyl(0.55, 0.7, 2.0, 8)(), 0x4a4f58, [0, 0, -3.0], ALONG_Z));
  G.push(part(cyl(0.48, 0.48, 0.08, 8)(), 0xffe08a, [0, 0, -4.02], ALONG_Z));
  mirror(G, box(0.15, 0.15, 0.15), 0xff3030, [2.9, 0, 1.15]);
  const g = assemble(H, G, [[0, 0, -4.3]], 0xffd27a, 3.0);
  g.userData.muzzles = [new THREE.Vector3(1.2, -0.1, 1.6), new THREE.Vector3(-1.2, -0.1, 1.6)];
  return g;
}

export function buildBulwark() {
  const H = [], G = [];
  const olive = 0x6d7458, plate = 0x9a9f8a, dark = 0x30332e, orange = 0xff8a2a;
  H.push(part(box(2.8, 1.4, 6.6)(), olive, [0, 0, 0]));
  H.push(part(cyl(0.4, 1.5, 2.6, 4)(), plate, [0, 0, 4.2], [Math.PI / 2, Math.PI / 4, 0], [1.2, 1, 0.6]));
  H.push(part(box(1.4, 0.7, 1.8)(), 0x1d3048, [0, 0.95, 1.6]));
  mirror(H, box(2.6, 0.3, 3.2), plate, [2.6, -0.2, -0.6], [0, 0, -0.08]);
  mirror(H, box(1.1, 1.1, 4.6), dark, [3.9, -0.1, 0.4]);
  mirror(H, cyl(0.2, 0.2, 2.0, 6), 0x7a8088, [3.9, 0.2, 3.4], ALONG_Z);
  mirror(H, cyl(0.2, 0.2, 2.0, 6), 0x7a8088, [3.9, -0.4, 3.4], ALONG_Z);
  mirror(H, cyl(0.75, 0.9, 2.6, 8), 0x50544c, [1.2, 0, -4.0], ALONG_Z);
  mirror(H, box(1.5, 0.15, 0.5), orange, [2.6, 0, 0.9], [0, 0, -0.08]);
  mirror(G, cyl(0.6, 0.6, 0.08, 8), 0xffb060, [1.2, 0, -5.32], ALONG_Z);
  const g = assemble(H, G, [[1.2, 0, -5.6], [-1.2, 0, -5.6]], 0xffb060, 3.2);
  g.userData.muzzles = [new THREE.Vector3(3.9, -0.1, 4.5), new THREE.Vector3(-3.9, -0.1, 4.5)];
  return g;
}

export function buildSpecter() {
  const H = [], G = [];
  const hull = 0x2e2742, edge = 0x4a3f6e;
  H.push(part(cyl(0.05, 4.2, 7.5, 3)(), hull, [0, 0, 0.2], [Math.PI / 2, 0, 0], [1, 1, 0.22]));
  H.push(part(new THREE.SphereGeometry(0.5, 10, 8), 0x0e1a2e, [0, 0.45, 1.0], [0, 0, 0], [0.8, 0.5, 2.2]));
  mirror(H, box(0.1, 1.1, 1.6), edge, [1.6, 0.6, -2.4], [0, 0, -0.45]);
  mirror(H, cyl(0.45, 0.55, 2.2, 8), 0x3a3550, [1.1, 0, -2.6], ALONG_Z);
  mirror(G, box(3.6, 0.06, 0.12), 0x6ff6ff, [1.9, 0.18, -1.0], [0, 0.62, 0]);
  mirror(G, cyl(0.4, 0.4, 0.08, 8), 0x8ff6ff, [1.1, 0, -3.72], ALONG_Z);
  const g = assemble(H, G, [[1.1, 0, -4.0], [-1.1, 0, -4.0]], 0x8ff6ff, 2.6);
  g.userData.muzzles = [new THREE.Vector3(2.4, -0.1, 0.4), new THREE.Vector3(-2.4, -0.1, 0.4)];
  return g;
}

export const SHIP_BUILDERS = { kestrel: buildPlayerShip, wasp: buildWasp, bulwark: buildBulwark, specter: buildSpecter };

// ---------------- New enemies ----------------
export function buildHornet(mat) {
  const H = [], G = [];
  H.push(part(new THREE.IcosahedronGeometry(1.6, 0), 0x3a2a2a, [0, 0, 0]));
  for (const [x, y, z] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]]) {
    const geo = new THREE.ConeGeometry(0.35, 1.6, 5);
    const rot = z ? [Math.PI / 2, 0, 0] : x ? [0, 0, -x * Math.PI / 2] : [y < 0 ? Math.PI : 0, 0, 0];
    H.push(part(geo, 0x8a2020, [x * 1.6, y * 1.6, z * 1.6], rot));
  }
  G.push(part(new THREE.SphereGeometry(0.5, 8, 6), 0xff2020, [0, 0, 1.3]));
  const g = assemble(H, G, [[0, 0, -1.8]], 0xff4030, 1.8, mat);
  g.userData.muzzles = [new THREE.Vector3(0, 0, 2)];
  return g;
}

export function buildSpinner(mat) {
  const H = [], G = [];
  H.push(part(cyl(5, 5.4, 1.2, 12)(), 0x4a4a3a, [0, 0, 0]));
  H.push(part(new THREE.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x7a7a50, [0, 0.5, 0]));
  H.push(part(cyl(1.4, 1.0, 1.6, 8)(), 0x2a2a24, [0, -1.2, 0]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    G.push(part(new THREE.BoxGeometry(0.5, 0.3, 0.5), i % 2 ? 0xffe040 : 0x60ff60, [Math.cos(a) * 5.2, 0, Math.sin(a) * 5.2]));
  }
  G.push(part(cyl(0.6, 0.6, 0.1, 8)(), 0xffe040, [0, -2.05, 0]));
  const g = assemble(H, G, [[0, 0, -5.4]], 0xc8ff60, 2.6, mat);
  g.userData.muzzles = [new THREE.Vector3(0, 0, 5.6)];
  g.userData.dropPoint = new THREE.Vector3(0, -2.4, 0);
  return g;
}

export function buildLongbow(mat) {
  const H = [], G = [];
  H.push(part(box(1.6, 1.2, 5)(), 0x3c3f4a, [0, 0, -1]));
  H.push(part(cyl(0.35, 0.45, 10, 8)(), 0x6a6f7a, [0, 0, 5], ALONG_Z));
  H.push(part(cyl(0.7, 0.7, 1.4, 8)(), 0x2a2c33, [0, 0, 1.6], ALONG_Z));
  mirror(H, box(3.2, 0.12, 1.6), 0x8a2a30, [1.8, 0, -2.2], [0, 0.3, 0]);
  mirror(H, box(0.12, 1.6, 1.4), 0x8a2a30, [0.6, 0.9, -3.0], [0, 0, -0.3]);
  G.push(part(new THREE.SphereGeometry(0.42, 8, 6), 0xff3040, [0, 0, 10.1]));
  G.push(part(box(0.9, 0.2, 0.2)(), 0xff6060, [0, 0.62, 0.4]));
  const g = assemble(H, G, [[0, 0, -3.8]], 0xff5060, 2.4, mat);
  g.userData.muzzles = [new THREE.Vector3(0, 0, 10.4)];
  return g;
}

Object.assign(ENEMY_BUILDERS, { hornet: buildHornet, spinner: buildSpinner, longbow: buildLongbow });

// ---------------- Wingman drone ----------------
export function buildDrone() {
  const H = [], G = [];
  H.push(part(new THREE.OctahedronGeometry(1.0, 0), 0xd8e6dc, [0, 0, 0], [0, 0, 0], [1, 0.6, 1.6]));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    H.push(part(box(0.1, 1.8, 0.9)(), 0x56705e, [Math.cos(a) * 1.1, Math.sin(a) * 1.1, -0.4], [0, 0, a - Math.PI / 2]));
  }
  G.push(part(new THREE.SphereGeometry(0.3, 8, 6), 0x7dff9a, [0, 0, 1.4]));
  const g = assemble(H, G, [[0, 0, -1.4]], 0x7dff9a, 1.8);
  g.userData.muzzles = [new THREE.Vector3(0, 0, 1.8)];
  return g;
}

// ---------------- Bosses ----------------
let bossMat = null;
function getBossMaterial() {
  if (!bossMat) bossMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, metalness: 0.35, roughness: 0.55, fog: false,
    emissive: new THREE.Color(0x30343c) });
  return bossMat;
}

// Dreadnought carrier hull. Mount points (local space) for turrets, bays and the reactor core.
export function buildDreadnought() {
  const H = [], G = [];
  const gun = 0x7a808c, dark = 0x4a4e58, red = 0xb02a32, plate = 0x9aa0ac;
  // Running lights along both flanks so the hull reads at range.
  for (const x of [-1, 1]) for (let i = 0; i < 9; i++) G.push(part(new THREE.BoxGeometry(0.8, 0.8, 2.4), i % 3 ? 0xff5a3a : 0xffd27a, [x * 25.2, 2.8, -36 + i * 9]));
  H.push(part(cyl(9, 12, 88, 6)(), gun, [0, 0, 0], ALONG_Z, [1.5, 1, 0.75]));
  H.push(part(cyl(0.5, 9, 22, 6)(), plate, [0, 0, 55], ALONG_Z, [1.5, 1, 0.6]));
  H.push(part(box(10, 9, 14)(), dark, [0, 11, -18]));
  H.push(part(box(6, 5, 8)(), plate, [0, 17, -16]));
  mirror(H, box(8, 6, 40), dark, [20, -1, 0]);
  mirror(H, box(9, 1.2, 46), red, [18, 2.6, 2]);
  H.push(part(box(30, 14, 12)(), gun, [0, 0, -48]));
  // Greebles along the spine.
  for (let i = 0; i < 18; i++) {
    const z = -40 + i * 5;
    H.push(part(box(2 + (i % 3), 1.2, 2.2)(), i % 2 ? plate : dark, [((i * 7) % 9) - 4, 7.4, z]));
  }
  for (const x of [-10, -3.5, 3.5, 10]) G.push(part(cyl(3, 3, 0.4, 10)(), 0xffa040, [x, 0, -54.3], ALONG_Z));
  G.push(part(box(8, 0.6, 0.4)(), 0x8fd8ff, [0, 15, -12]));
  const hull = new THREE.Mesh(mergeGeometries(H), getBossMaterial());
  const glow = new THREE.Mesh(mergeGeometries(G), getGlowMaterial());
  const g = new THREE.Group();
  g.add(hull, glow);
  g.userData.engines = [-10, -3.5, 3.5, 10].map((x) => {
    const s = engineSprite(0xffa040, 14);
    s.position.set(x, 0, -56);
    g.add(s);
    return s;
  });
  g.userData.mounts = {
    turrets: [[0, 7.8, 30], [0, 7.8, -2], [0, -7.5, 18], [0, -7.5, -30]],
    bays: [[24.5, -1, 6], [-24.5, -1, 6]],
    core: [0, 0, -56],
  };
  // Approximate collision spheres along the hull (local space).
  g.userData.colliders = [[0, 0, 52, 9], [0, 0, 34, 13], [0, 0, 14, 15], [0, 2, -6, 16], [0, 2, -26, 16], [0, 0, -46, 14],
    [20, -1, 12, 7], [20, -1, -10, 7], [-20, -1, 12, 7], [-20, -1, -10, 7]];
  return g;
}

export function buildTurret(mat) {
  const H = [], G = [];
  H.push(part(cyl(3, 3.4, 1.4, 8)(), 0x3a3e46, [0, 0, 0]));
  H.push(part(new THREE.SphereGeometry(2.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0x6c727e, [0, 0.6, 0]));
  mirror(H, cyl(0.35, 0.35, 5, 6), 0x23262c, [0.8, 1.6, 2.6], ALONG_Z);
  G.push(part(box(1.4, 0.4, 0.3)(), 0xff4030, [0, 2.2, 1.6]));
  const g = assemble(H, G, [], 0xff4030, 1, mat);
  g.userData.muzzles = [new THREE.Vector3(0.8, 1.6, 5.2), new THREE.Vector3(-0.8, 1.6, 5.2)];
  return g;
}

export function buildBay(mat) {
  const H = [], G = [];
  H.push(part(box(5, 7, 16)(), 0x3a3e46, [0, 0, 0]));
  G.push(part(box(0.3, 5, 12)(), 0xff9a30, [2.6, 0, 0]));
  const g = assemble(H, G, [], 0xff9a30, 1, mat);
  g.userData.muzzles = [new THREE.Vector3(4, 0, 0)];
  return g;
}

export function buildCore(mat, color = 0xff8a30, r = 7) {
  const H = [], G = [];
  for (let i = 0; i < 3; i++) H.push(part(new THREE.TorusGeometry(r * 1.15, 0.5, 4, 20), 0x5a5f6a, [0, 0, 0], [i * 1.05, i * 0.6, 0]));
  G.push(part(new THREE.IcosahedronGeometry(r, 1), color, [0, 0, 0]));
  const g = assemble(H, G, [], color, 1, mat);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
  halo.scale.setScalar(r * 5);
  g.add(halo);
  g.userData.muzzles = [new THREE.Vector3(0, 0, r + 1)];
  return g;
}

export function buildShieldBubble(r, color = 0x7fd8ff) {
  return new THREE.Mesh(
    new THREE.IcosahedronGeometry(r, 2),
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
  );
}

// Sentinel: a rotating ring station with shield pylons and beam emitters.
export function buildSentinel() {
  const g = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(55, 5, 8, 48);
  const H = [part(ringGeo, 0x8a90a0, [0, 0, 0])];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    H.push(part(box(2, 50, 2)(), 0x343842, [Math.cos(a) * 27, Math.sin(a) * 27, 0], [0, 0, a - Math.PI / 2]));
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    H.push(part(box(4, 4, 8)(), i % 2 ? 0x6a707c : 0x2c3038, [Math.cos(a) * 55, Math.sin(a) * 55, 0], [0, 0, a]));
  }
  const ring = new THREE.Mesh(mergeGeometries(H), getBossMaterial());
  const lights = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    lights.push(part(new THREE.BoxGeometry(1.6, 1.6, 1.6), 0xff5060, [Math.cos(a) * 55, Math.sin(a) * 55, 5.4]));
  }
  const glow = new THREE.Mesh(mergeGeometries(lights), getGlowMaterial());
  const spin = new THREE.Group();
  spin.add(ring, glow);
  g.add(spin);
  g.userData.spin = spin;
  g.userData.mounts = {
    pylons: [0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; return [Math.cos(a) * 55, Math.sin(a) * 55, 7]; }),
    core: [0, 0, 0],
  };
  g.userData.colliders = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.userData.colliders.push([Math.cos(a) * 55, Math.sin(a) * 55, 0, 8]);
  }
  return g;
}

export function buildPylon(mat) {
  const H = [], G = [];
  H.push(part(cyl(2.2, 3, 3, 6)(), 0x3a3e46, [0, 0, 0], ALONG_Z));
  G.push(part(new THREE.OctahedronGeometry(2.4, 0), 0x7fd8ff, [0, 0, 4.4], [0, 0, 0], [1, 1, 2]));
  const g = assemble(H, G, [], 0x7fd8ff, 1, mat);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: 0x7fd8ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 }));
  halo.scale.setScalar(14);
  halo.position.z = 4.4;
  g.add(halo);
  g.userData.muzzles = [new THREE.Vector3(0, 0, 9)];
  return g;
}

export const PART_BUILDERS = { turret: buildTurret, bay: buildBay, core: buildCore, pylon: buildPylon };
