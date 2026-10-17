// Set-piece terrain props: crystal spires, a derelict capital-ship wreck, and dust clouds.
import * as THREE from 'three';
import { getGlowTexture } from './util.js';

let cloudTex = null;
function getCloudTexture() {
  if (cloudTex) return cloudTex;
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  // Layered soft blobs make an irregular puff.
  for (let i = 0; i < 26; i++) {
    const x = s / 2 + (Math.random() - 0.5) * s * 0.45, y = s / 2 + (Math.random() - 0.5) * s * 0.45;
    const r = s * (0.12 + Math.random() * 0.22);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.22)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
  }
  cloudTex = new THREE.CanvasTexture(c);
  cloudTex.colorSpace = THREE.SRGBColorSpace;
  return cloudTex;
}

const prismGeo = new THREE.CylinderGeometry(0.55, 1, 1, 6).translate(0, 0.5, 0);

// spires: [{ base: Vector3, dir: Vector3, len, rad }]
export function buildSpires(spires, color) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: new THREE.Color(color).multiplyScalar(0.55), roughness: 0.25, metalness: 0.1, flatShading: true,
    transparent: true, opacity: 0.92,
  });
  const mesh = new THREE.InstancedMesh(prismGeo, mat, spires.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), c = new THREE.Color();
  const Y = new THREE.Vector3(0, 1, 0);
  spires.forEach((sp, i) => {
    q.setFromUnitVectors(Y, sp.dir);
    m.compose(sp.base, q, s.set(sp.rad, sp.len, sp.rad));
    mesh.setMatrixAt(i, m);
    c.set(color).lerp(new THREE.Color(0xffffff), Math.random() * 0.4);
    mesh.setColorAt(i, c);
  });
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  // A glow on some tips.
  spires.forEach((sp, i) => {
    if (i % 3) return;
    const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 }));
    g.position.copy(sp.base).addScaledVector(sp.dir, sp.len);
    g.scale.setScalar(sp.rad * 7);
    group.add(g);
  });
  return group;
}

// A broken capital ship, ~300 units long. Returns { group, colliders: [[x,y,z,r]] } in local space.
export function buildWreck(rng) {
  const group = new THREE.Group();
  const glow = new THREE.Color(0x14120f);
  const metal = new THREE.MeshStandardMaterial({ color: 0x7a7268, metalness: 0.5, roughness: 0.6, flatShading: true, emissive: glow });
  const rust = new THREE.MeshStandardMaterial({ color: 0x9a5530, metalness: 0.3, roughness: 0.8, flatShading: true, emissive: glow });
  const dark = new THREE.MeshStandardMaterial({ color: 0x45403a, metalness: 0.5, roughness: 0.7, flatShading: true, emissive: glow });
  const colliders = [];
  const add = (geo, mat, pos, rot) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    group.add(mesh);
    return mesh;
  };
  // Fore section, tilted.
  const fore = new THREE.Group();
  fore.position.set(0, 0, 70);
  fore.rotation.set(0.12, 0.25, 0.4);
  group.add(fore);
  const foreHull = new THREE.Mesh(new THREE.CylinderGeometry(18, 26, 120, 6, 1, true).rotateX(Math.PI / 2), metal);
  foreHull.material.side = THREE.DoubleSide;
  fore.add(foreHull);
  const prow = new THREE.Mesh(new THREE.ConeGeometry(18, 50, 6).rotateX(Math.PI / 2), rust);
  prow.position.z = 85;
  fore.add(prow);
  // Aft section with exposed ribs.
  add(new THREE.CylinderGeometry(26, 28, 90, 6, 1, true).rotateX(Math.PI / 2), metal, [8, -14, -70], [-0.1, -0.2, -0.3]).material.side = THREE.DoubleSide;
  for (let i = 0; i < 7; i++) {
    add(new THREE.TorusGeometry(25, 2.2, 4, 12, Math.PI * (1.1 + rng() * 0.6)), dark, [4 + i * 0.6, -8 + i * 0.8, -8 - i * 7], [0, 0, rng() * 6]);
  }
  add(new THREE.BoxGeometry(60, 12, 30), rust, [10, -18, -120], [0.2, 0.1, 0.25]);
  for (let i = 0; i < 18; i++) {
    const s = 4 + rng() * 10;
    add(new THREE.BoxGeometry(s, s * 0.4, s * 1.5), rng() < 0.5 ? rust : dark,
      [(rng() - 0.5) * 120, (rng() - 0.5) * 70, (rng() - 0.5) * 260], [rng() * 6, rng() * 6, rng() * 6]);
  }
  // Flickering lights.
  group.userData.lights = [];
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: i % 2 ? 0xff5030 : 0xffb050, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    g.position.set((rng() - 0.5) * 40, (rng() - 0.5) * 30, (rng() - 0.5) * 200);
    g.scale.setScalar(8 + rng() * 8);
    group.add(g);
    group.userData.lights.push(g);
  }
  for (let z = -40; z <= 150; z += 30) colliders.push([0, 0, z, 22, fore]);
  for (let z = -110; z <= -30; z += 28) colliders.push([8, -14, z, 26, group]);
  colliders.push([10, -18, -120, 26, group]);
  return { group, colliders };
}

export function buildDustClouds(points, colors) {
  const group = new THREE.Group();
  const tex = getCloudTexture();
  points.forEach((p, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, color: colors[i % colors.length], transparent: true, depthWrite: false, opacity: p.opacity, fog: false,
    }));
    s.position.copy(p.pos);
    s.scale.setScalar(p.size);
    s.material.rotation = Math.random() * 6.28;
    s.renderOrder = 1;
    group.add(s);
  });
  return group;
}
