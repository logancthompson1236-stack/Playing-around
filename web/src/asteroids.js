import * as THREE from 'three';
import { ARENA, ASTEROID_TIERS } from './config.js';
import { fbm3, rand, randInt, randomUnit, gaussian, chance, getGlowTexture, mulberry32 } from './util.js';
import { buildSpires, buildWreck, buildDustClouds } from './terrain.js';

const VARIANTS = 6;
const CAPACITY = { L: 48, M: 96, S: 140 };
const DETAIL = { L: 2, M: 1, S: 1 };
const CELL = 64;

// Radius multiplier for a unit direction: lumpy rock with craters.
export function rockShape(x, y, z, seed, rough = 1) {
  const n = fbm3(x * 1.3 + seed, y * 1.3, z * 1.3, seed | 0, 4);
  const n2 = fbm3(x * 3.7, y * 3.7 + seed, z * 3.7, (seed * 7) | 0, 3);
  let r = 0.78 + (n - 0.5) * 0.9 * rough + (n2 - 0.5) * 0.18 * rough;
  // Crater-ish dents.
  const c = fbm3(x * 2.2 - seed, y * 2.2, z * 2.2 + seed, (seed * 13) | 0, 2);
  if (c > 0.62) r -= (c - 0.62) * 0.9 * rough;
  return r;
}

function makeRockGeometry(detail, seed, rough, stretch, strata = false) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const r = rockShape(v.x, v.y, v.z, seed, rough);
    const shade = THREE.MathUtils.clamp(0.55 + (r - 0.78) * 1.6, 0.35, 1.15);
    let speck = 0.9 + fbm3(v.x * 9, v.y * 9, v.z * 9, seed + 99, 2) * 0.2;
    if (strata) {
      // Layered sediment bands plus the odd bright mineral vein.
      const band = Math.sin(v.y * 16 + fbm3(v.x * 2, v.y * 2, v.z * 2, seed + 7, 2) * 5);
      speck *= 0.88 + 0.12 * band;
      if (band > 0.93) speck *= 1.35;
    }
    v.multiplyScalar(r).multiply(stretch);
    p.setXYZ(i, v.x, v.y, v.z);
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = shade * speck;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.deleteAttribute('uv');
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

class InstancePool {
  constructor(geo, mat, cap, scene) {
    this.mesh = new THREE.InstancedMesh(geo, mat, cap);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.setColorAt(0, new THREE.Color(1, 1, 1));
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.cap = cap;
    this.list = [];
    scene.add(this.mesh);
  }
  get full() { return this.list.length >= this.cap; }
  add(a) {
    a.idx = this.list.length;
    a.pool = this;
    this.list.push(a);
    this.mesh.count = this.list.length;
    this.mesh.setColorAt(a.idx, a.color);
    this.mesh.instanceColor.needsUpdate = true;
  }
  remove(a) {
    const last = this.list.pop();
    if (last !== a) {
      this.list[a.idx] = last;
      last.idx = a.idx;
      this.mesh.setColorAt(last.idx, last.color);
      this.mesh.instanceColor.needsUpdate = true;
    }
    this.mesh.count = this.list.length;
    a.pool = null;
  }
  clear() {
    this.list.length = 0;
    this.mesh.count = 0;
  }
}

const _m = new THREE.Matrix4();
const _s = new THREE.Vector3();
const _dq = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _d = new THREE.Vector3();

export class AsteroidField {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.list = [];
    this.monoliths = [];
    this.cells = new Map();
    this.usedKeys = [];
    this.stamp = 1;
    this.onDestroyed = null; // (asteroid, cause) => void
    this.mat = new THREE.MeshStandardMaterial({
      vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0.06,
    });
    this.pools = {};
    for (const tier of ['L', 'M', 'S']) {
      this.pools[tier] = [];
      for (let v = 0; v < VARIANTS; v++) {
        const st = new THREE.Vector3(rand(0.85, 1.25), rand(0.75, 1.1), rand(0.85, 1.3));
        const geo = makeRockGeometry(quality === 0 && tier === 'L' ? 1 : DETAIL[tier], v * 17.3 + tier.charCodeAt(0), tier === 'S' ? 1.2 : 1, st);
        this.pools[tier].push(new InstancePool(geo, this.mat, CAPACITY[tier], scene));
      }
    }
    this.statics = [];   // sphere colliders: wreck, spires, boss hulls
    this.terrain = new THREE.Group();
    scene.add(this.terrain);
    this.styleKey = 'rock';
    this.glowPool = [];
    for (let i = 0; i < 40; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: getGlowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      s.visible = false;
      scene.add(s);
      this.glowPool.push(s);
    }
    this.time = 0;
  }

  clear() {
    for (const tier in this.pools) this.pools[tier].forEach((p) => p.clear());
    for (const m of this.monoliths) {
      this.scene.remove(m.mesh);
      m.mesh.geometry.dispose();
    }
    for (const a of this.list) if (a.glow) { a.glow.visible = false; this.glowPool.push(a.glow); }
    this.list.length = 0;
    this.monoliths.length = 0;
    this.statics = this.statics.filter((c) => c.boss); // boss colliders are owned by the boss
    for (const c of [...this.terrain.children]) {
      this.terrain.remove(c);
      c.traverse((o) => { if (o.geometry && o.geometry !== undefined) o.geometry.dispose?.(); if (o.material) o.material.dispose?.(); });
    }
    this.features = [];
    this.wreck = null;
  }

  // Rebuild the rock shapes for a theme: rounded rock, chunky boulders, or sharp shards.
  setStyle(style) {
    if (style === this.styleKey) return;
    this.styleKey = style;
    for (const tier of ['L', 'M', 'S']) {
      this.pools[tier].forEach((pool, v) => {
        let st, rough = tier === 'S' ? 1.2 : 1, detail = this.quality === 0 && tier === 'L' ? 1 : DETAIL[tier];
        if (style === 'shard') { st = new THREE.Vector3(rand(0.5, 0.75), rand(0.5, 0.8), rand(1.4, 2.1)); rough *= 0.6; detail = Math.max(0, detail - 1); }
        else if (style === 'chunk') { st = new THREE.Vector3(rand(0.95, 1.15), rand(0.85, 1.05), rand(0.95, 1.15)); rough *= 1.45; }
        else st = new THREE.Vector3(rand(0.85, 1.25), rand(0.75, 1.1), rand(0.85, 1.3));
        const geo = makeRockGeometry(detail, v * 17.3 + tier.charCodeAt(0) + (style === 'rock' ? 0 : 5.1), rough, st);
        pool.mesh.geometry.dispose();
        pool.mesh.geometry = geo;
      });
    }
  }

  _addStatic(pos, r, extra = {}) {
    const c = { tier: 'X', shape: 'sphere', pos: pos.clone(), r, alive: true, vel: new THREE.Vector3(), ...extra };
    this.statics.push(c);
    return c;
  }

  _blocked(pos, r) {
    if (this.monoliths.some((m) => m.pos.distanceTo(pos) < m.r * 1.05 + r)) return true;
    return this.statics.some((c) => !c.boss && c.pos.distanceTo(pos) < c.r + r);
  }

  generate(theme, sector, spawnPoint) {
    this.clear();
    this.theme = theme;
    const rng = mulberry32(sector * 7919 + 13);
    const R = ARENA.radius, H = ARENA.halfHeight;
    const dens = this.quality === 0 ? 0.7 : 1;
    this.setStyle(theme.rockStyle || 'rock');

    // Pick this sector's set pieces (sector 1 always shows off the ringed planetoid).
    const pool = ['planetoid', 'wall', 'spires', 'wreck', 'debris', 'dust'];
    for (let i = pool.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
    let feats = pool.slice(0, 3);
    if (sector === 1 && !feats.includes('planetoid')) feats[0] = 'planetoid';
    if (feats.includes('spires') === false && rng() < 0.4) feats.push('spires');
    this.features = feats;
    const findSpot = (clearance, fromSpawn, maxR = 0.8) => {
      for (let t = 0; t < 60; t++) {
        const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * R * maxR;
        const p = new THREE.Vector3(Math.cos(ang) * rad, (rng() * 2 - 1) * H * 0.4, Math.sin(ang) * rad);
        if (p.distanceTo(spawnPoint) < fromSpawn) continue;
        if (this._blocked(p, clearance)) continue;
        return p;
      }
      return null;
    };
    const ringJobs = [];
    if (feats.includes('planetoid')) {
      const r = 340 + rng() * 80;
      const pos = findSpot(r + 300, r + 500, 0.55);
      if (pos) {
        this.addMonolith(pos, r, sector * 13.7, theme, 1.0);
        const axis = new THREE.Vector3((rng() - 0.5) * 0.8, 1, (rng() - 0.5) * 0.8).normalize();
        ringJobs.push({ center: pos, axis, radius: r * (1.85 + rng() * 0.35) });
      }
    }
    if (feats.includes('wall')) {
      // An arc of tall rock pillars with gaps you can thread.
      const c = findSpot(200, 700, 0.6);
      if (c) {
        const arcR = 520 + rng() * 260, a0 = rng() * Math.PI * 2, span = 1.6 + rng() * 0.8;
        let a = a0;
        while (a < a0 + span) {
          const r = 70 + rng() * 60;
          const p = new THREE.Vector3(c.x + Math.cos(a) * arcR, c.y + (rng() - 0.5) * 120, c.z + Math.sin(a) * arcR);
          if (p.distanceTo(spawnPoint) > r + 220 && Math.hypot(p.x, p.z) < R * 0.95) this.addMonolith(p, r, sector * 5.3 + a * 11, theme, 0.55);
          a += (2 * r + 45 + rng() * 70) / arcR;
        }
      }
    }
    if (feats.includes('wreck')) {
      const pos = findSpot(240, 450, 0.75);
      if (pos) {
        const { group, colliders } = buildWreck(rng);
        group.position.copy(pos);
        group.rotation.set((rng() - 0.5) * 0.5, rng() * 6.28, (rng() - 0.5) * 0.6);
        this.terrain.add(group);
        group.updateMatrixWorld(true);
        for (const [x, y, z, r, parent] of colliders) {
          const wp = new THREE.Vector3(x, y, z).applyMatrix4(parent.matrixWorld);
          this._addStatic(wp, r, { wreck: true });
        }
        this.wreck = group;
      }
    }

    // Monoliths: huge unbreakable landmarks.
    const mCount = 12 + Math.min(sector, 6) - (feats.includes('planetoid') ? 3 : 0) - (feats.includes('wall') ? 4 : 0);
    for (let i = 0; i < mCount * 4 && this.monoliths.length < mCount; i++) {
      const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * R * 0.92;
      const pos = new THREE.Vector3(Math.cos(ang) * rad, (rng() * 2 - 1) * H * 0.7, Math.sin(ang) * rad);
      const r = 130 + rng() * 140;
      if (pos.distanceTo(spawnPoint) < r + 260) continue;
      if (this.monoliths.some((m) => m.pos.distanceTo(pos) < m.r + r + 200)) continue;
      if (this.statics.some((c) => !c.boss && c.pos.distanceTo(pos) < c.r + r + 120)) continue;
      this.addMonolith(pos, r, sector * 31 + i * 3.7, theme);
    }

    if (feats.includes('spires')) {
      // Crystal outcrops growing from a few monoliths.
      const spires = [];
      const hosts = this.monoliths.filter((m) => m.r < 300).slice(0, 5);
      for (const m of hosts) {
        const n = 8 + ((rng() * 9) | 0);
        const center = randomUnit(new THREE.Vector3());
        for (let k = 0; k < n; k++) {
          const dir = center.clone().addScaledVector(randomUnit(new THREE.Vector3()), 0.55).normalize();
          const base = m.pos.clone().addScaledVector(dir, this.monolithRadius(m, dir) * 0.9);
          const out = dir.clone().addScaledVector(randomUnit(new THREE.Vector3()), 0.25).normalize();
          const len = 18 + rng() * 42, rad = 3 + rng() * 4.5;
          spires.push({ base, dir: out, len, rad });
          this._addStatic(base.clone().addScaledVector(out, len * 0.5), Math.max(rad * 1.3, len * 0.32), { spire: true });
        }
      }
      if (spires.length) this.terrain.add(buildSpires(spires, theme.crystal || 0x9a7bff));
    }

    // Cluster centers for belt-like density.
    const clusters = [];
    for (let i = 0; i < 10; i++) {
      const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * R * 0.85;
      clusters.push(new THREE.Vector3(Math.cos(ang) * rad, (rng() * 2 - 1) * H * 0.5, Math.sin(ang) * rad));
    }
    const place = (out) => {
      if (rng() < 0.65) {
        const c = clusters[(rng() * clusters.length) | 0];
        out.set(c.x + gaussian() * 260, c.y + gaussian() * 160, c.z + gaussian() * 260);
      } else {
        const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * R * 0.95;
        out.set(Math.cos(ang) * rad, (rng() * 2 - 1) * H * 0.9, Math.sin(ang) * rad);
      }
      return out;
    };
    const counts = { L: Math.round(64 * dens), M: Math.round(105 * dens), S: Math.round(135 * dens) };
    const volatileP = sector >= 1 ? 0.1 + 0.01 * sector : 0;
    for (const tier of ['L', 'M', 'S']) {
      for (let i = 0; i < counts[tier]; i++) {
        const pos = place(new THREE.Vector3());
        if (pos.distanceTo(spawnPoint) < 160) continue;
        if (this._blocked(pos, 40)) continue;
        let type = 'rock';
        if (tier !== 'S' && chance(volatileP)) type = 'volatile';
        else if (tier === 'M' && chance(0.09)) type = 'crystal';
        this.spawn(tier, pos, randomUnit(new THREE.Vector3()).multiplyScalar(rand(0, 7)), type);
      }
    }

    // Planetary ring: a slowly orbiting belt of rocks.
    for (const job of ringJobs) {
      const u = new THREE.Vector3(1, 0, 0).cross(job.axis);
      if (u.lengthSq() < 0.01) u.set(0, 0, 1).cross(job.axis);
      u.normalize();
      const w = new THREE.Vector3().crossVectors(job.axis, u);
      const n = Math.round(130 * dens);
      for (let i = 0; i < n; i++) {
        const a = rng() * Math.PI * 2;
        const rr = job.radius + gaussian() * 45;
        const pos = job.center.clone().addScaledVector(u, Math.cos(a) * rr).addScaledVector(w, Math.sin(a) * rr).addScaledVector(job.axis, gaussian() * 10);
        if (pos.distanceTo(spawnPoint) < 140) continue;
        const tier = rng() < 0.12 ? 'L' : rng() < 0.5 ? 'M' : 'S';
        const ast = this.spawn(tier, pos, new THREE.Vector3(), tier !== 'S' && rng() < 0.06 ? 'crystal' : 'rock');
        if (ast) ast.orbit = { center: job.center, axis: job.axis, w: 0.035 + rng() * 0.01 };
      }
    }

    if (feats.includes('debris')) {
      // Dense swirling storms of small rocks.
      for (let k = 0; k < 2; k++) {
        const c = findSpot(180, 400, 0.8);
        if (!c) continue;
        const axis = randomUnit(new THREE.Vector3());
        for (let i = 0; i < Math.round(65 * dens); i++) {
          const pos = c.clone().add(randomUnit(new THREE.Vector3()).multiplyScalar(Math.cbrt(rng()) * 160));
          const ast = this.spawn(rng() < 0.15 ? 'M' : 'S', pos, new THREE.Vector3(), 'rock');
          if (ast) ast.orbit = { center: c, axis, w: 0.12 + rng() * 0.08 };
        }
      }
    }

    if (feats.includes('dust') || feats.includes('debris')) {
      const pts = [];
      const n = feats.includes('dust') ? 16 : 6;
      for (let i = 0; i < n; i++) {
        const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * R * 0.9;
        pts.push({ pos: new THREE.Vector3(Math.cos(ang) * rad, (rng() * 2 - 1) * H * 0.6, Math.sin(ang) * rad), size: 320 + rng() * 420, opacity: 0.1 + rng() * 0.1 });
      }
      this.terrain.add(buildDustClouds(pts, [theme.nebA, theme.nebB, theme.fog]));
    }
  }

  addMonolith(pos, r, seed, theme, flat = null) {
    const detail = this.quality === 0 ? 3 : 4;
    // `flat` = vertical squash; pillars for walls use a tall stretch instead.
    const st = flat === 1.0 ? new THREE.Vector3(1, 0.95, 1)
      : flat === 0.55 ? new THREE.Vector3(rand(0.7, 0.9), rand(1.3, 1.7), rand(0.7, 0.9))
      : new THREE.Vector3(rand(0.9, 1.2), rand(0.6, 0.9), rand(0.9, 1.25));
    const geo = makeRockGeometry(detail, seed, flat === 1.0 ? 0.8 : 1.25, st, true);
    const mat = this.mat;
    const mesh = new THREE.InstancedMesh(geo, mat, 1); // instanced so it shares the per-instance color path
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)));
    _m.compose(pos, quat, _s.set(r, r, r));
    mesh.setMatrixAt(0, _m);
    const c = new THREE.Color(theme.rock[(Math.random() * theme.rock.length) | 0]).multiplyScalar(0.8);
    mesh.setColorAt(0, c);
    this.scene.add(mesh);
    const inv = quat.clone().invert();
    this.monoliths.push({ tier: 'X', pos, r, seed, mesh, quat, inv, st, rough: flat === 1.0 ? 0.8 : 1.25, alive: true, vel: new THREE.Vector3() });
  }

  // Approximate surface radius of a monolith along world direction d (unit).
  monolithRadius(m, d) {
    _d.copy(d).applyQuaternion(m.inv);
    // Undo stretch approximately: sample shape on the normalized unstretched dir.
    _v.set(_d.x / m.st.x, _d.y / m.st.y, _d.z / m.st.z);
    const k = 1 / _v.length();
    _v.multiplyScalar(k);
    return m.r * rockShape(_v.x, _v.y, _v.z, m.seed, m.rough) * k;
  }

  spawn(tier, pos, vel, type = 'rock') {
    const variants = this.pools[tier];
    let pool = variants[(Math.random() * VARIANTS) | 0];
    if (pool.full) pool = variants.find((p) => !p.full);
    if (!pool) return null;
    const def = ASTEROID_TIERS[tier];
    const theme = this.theme;
    const color = new THREE.Color(theme.rock[(Math.random() * theme.rock.length) | 0]).multiplyScalar(rand(0.8, 1.1));
    if (type === 'volatile') color.setRGB(0.95, 0.42, 0.22);
    if (type === 'crystal') color.setRGB(0.45, 0.95, 1.0);
    const r = rand(def.rMin, def.rMax);
    const a = {
      tier, type, r, color,
      pos: pos.clone(), vel: vel.clone(),
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6))),
      axis: randomUnit(new THREE.Vector3()),
      spin: rand(0.05, 0.5) * (tier === 'S' ? 2 : tier === 'M' ? 1.2 : 0.6),
      hp: def.hp * (type === 'volatile' ? 0.6 : 1),
      alive: true, idx: -1, pool: null, q: 0, glow: null, flash: 0,
    };
    pool.add(a);
    if (type !== 'rock' && this.glowPool.length) {
      a.glow = this.glowPool.pop();
      a.glow.visible = true;
      a.glow.material.color.set(type === 'volatile' ? 0xff6a2a : 0x6ff6ff);
      a.glow.scale.setScalar(r * 3.2);
    }
    this.list.push(a);
    return a;
  }

  remove(a) {
    if (!a.alive) return;
    a.alive = false;
    a.pool.remove(a);
    if (a.glow) {
      a.glow.visible = false;
      this.glowPool.push(a.glow);
      a.glow = null;
    }
  }

  // Damage; returns true if destroyed.
  damage(a, amount, cause, impulse) {
    if (!a.alive || a.tier === 'X') return false;
    a.hp -= amount;
    a.flash = 0.08;
    if (impulse) a.vel.addScaledVector(impulse, 1 / (a.r * 0.6));
    if (a.hp > 0) return false;
    this.destroy(a, cause, impulse);
    return true;
  }

  destroy(a, cause, impulse) {
    if (!a.alive) return;
    this.remove(a);
    const def = ASTEROID_TIERS[a.tier];
    if (def.child) {
      const n = randInt(def.children[0], def.children[1]);
      for (let i = 0; i < n; i++) {
        const dir = randomUnit(new THREE.Vector3());
        const p = a.pos.clone().addScaledVector(dir, a.r * 0.45);
        const v = a.vel.clone().addScaledVector(dir, rand(10, 28));
        if (impulse) v.addScaledVector(impulse, 0.02);
        const child = this.spawn(def.child, p, v, a.type === 'crystal' ? 'rock' : 'rock');
        if (child) child.spin *= 2;
      }
    }
    if (this.onDestroyed) this.onDestroyed(a, cause);
  }

  update(dt) {
    this.time += dt;
    const R = ARENA.radius, H = ARENA.halfHeight;
    const list = this.list;
    // Compact dead entries.
    let w = 0;
    for (let i = 0; i < list.length; i++) if (list[i].alive) list[w++] = list[i];
    list.length = w;

    // Clear grid.
    for (const k of this.usedKeys) this.cells.get(k).length = 0;
    this.usedKeys.length = 0;

    const touched = new Set();
    for (const a of list) {
      if (a.orbit) {
        _v.subVectors(a.pos, a.orbit.center).applyAxisAngle(a.orbit.axis, a.orbit.w * dt);
        a.pos.copy(a.orbit.center).add(_v);
      }
      a.pos.addScaledVector(a.vel, dt);
      // Soft arena bounds.
      const hr = Math.hypot(a.pos.x, a.pos.z);
      if (hr > R && a.pos.x * a.vel.x + a.pos.z * a.vel.z > 0) {
        a.vel.x *= -1;
        a.vel.z *= -1;
      }
      if (Math.abs(a.pos.y) > H && a.pos.y * a.vel.y > 0) a.vel.y *= -1;
      // Gentle drag on fast fragments.
      const sp2 = a.vel.lengthSq();
      if (sp2 > 400) a.vel.multiplyScalar(Math.exp(-0.3 * dt));
      _dq.setFromAxisAngle(a.axis, a.spin * dt);
      a.quat.premultiply(_dq);
      let sc = a.r;
      if (a.flash > 0) {
        a.flash -= dt;
        sc *= 1.04;
      }
      _m.compose(a.pos, a.quat, _s.set(sc, sc, sc));
      a.pool.mesh.setMatrixAt(a.idx, _m);
      touched.add(a.pool);
      if (a.glow) {
        a.glow.position.copy(a.pos);
        const pulse = a.type === 'volatile' ? 0.75 + 0.25 * Math.sin(this.time * 5 + a.r) : 1;
        a.glow.material.opacity = 0.55 * pulse;
      }
      this._insert(a);
    }
    for (const p of touched) p.mesh.instanceMatrix.needsUpdate = true;
    if (this.wreck && this.wreck.parent) for (const l of this.wreck.userData.lights) l.material.opacity = Math.random() < 0.08 ? 0.15 : 0.85;
    for (const tier in this.pools) for (const p of this.pools[tier]) if (!touched.has(p)) p.mesh.count = p.list.length;
  }

  _key(ix, iy, iz) { return ((ix + 512) * 1024 + (iy + 512)) * 1024 + (iz + 512); }

  _insert(a) {
    const r = a.r;
    const x0 = Math.floor((a.pos.x - r) / CELL), x1 = Math.floor((a.pos.x + r) / CELL);
    const y0 = Math.floor((a.pos.y - r) / CELL), y1 = Math.floor((a.pos.y + r) / CELL);
    const z0 = Math.floor((a.pos.z - r) / CELL), z1 = Math.floor((a.pos.z + r) / CELL);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      const k = this._key(x, y, z);
      let c = this.cells.get(k);
      if (!c) { c = []; this.cells.set(k, c); }
      if (c.length === 0) this.usedKeys.push(k);
      c.push(a);
    }
  }

  // Calls fn(asteroid) for every candidate overlapping the sphere (pos, r). Includes monoliths.
  query(pos, r, fn) {
    const stamp = ++this.stamp;
    const x0 = Math.floor((pos.x - r) / CELL), x1 = Math.floor((pos.x + r) / CELL);
    const y0 = Math.floor((pos.y - r) / CELL), y1 = Math.floor((pos.y + r) / CELL);
    const z0 = Math.floor((pos.z - r) / CELL), z1 = Math.floor((pos.z + r) / CELL);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      const c = this.cells.get(this._key(x, y, z));
      if (!c) continue;
      for (let i = 0; i < c.length; i++) {
        const a = c[i];
        if (a.q === stamp || !a.alive) continue;
        a.q = stamp;
        if (fn(a) === false) return;
      }
    }
    for (const m of this.monoliths) {
      const lim = m.r * 1.35 + r;
      if (m.pos.distanceToSquared(pos) < lim * lim) if (fn(m) === false) return;
    }
    for (const c of this.statics) {
      const lim = c.r + r;
      if (c.pos.distanceToSquared(pos) < lim * lim) if (fn(c) === false) return;
    }
  }

  // Signed-ish distance from point to asteroid surface (negative = inside).
  surfaceDistance(a, p) {
    _v.subVectors(p, a.pos);
    const d = _v.length();
    if (a.shape === 'sphere') return d - a.r;
    if (a.tier === 'X') {
      if (d < 1e-3) return -a.r;
      _v.multiplyScalar(1 / d);
      return d - this.monolithRadius(a, _v);
    }
    return d - a.r * 0.88;
  }

  get counts() {
    let L = 0, M = 0, S = 0;
    for (const a of this.list) if (a.alive) a.tier === 'L' ? L++ : a.tier === 'M' ? M++ : S++;
    return { L, M, S };
  }
}
