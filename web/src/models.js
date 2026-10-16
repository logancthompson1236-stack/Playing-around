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
