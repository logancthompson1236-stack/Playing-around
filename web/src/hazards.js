// Mines (laid by Spinners) and laser beams (Longbow snipers, Sentinel sweeps).
import * as THREE from 'three';
import { getGlowTexture, segPointDistSq } from './util.js';

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const Y = new THREE.Vector3(0, 1, 0);

export class Hazards {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.mines = [];
    this.minePool = [];
    this.onMineBlast = null; // (pos, radius, damage) => void
    this.onMineBeep = null;
    const mineGeo = new THREE.IcosahedronGeometry(1.6, 0);
    const spikeGeo = new THREE.OctahedronGeometry(2.6, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, metalness: 0.6, roughness: 0.4, flatShading: true });
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x6a5a20, metalness: 0.5, roughness: 0.5, flatShading: true, wireframe: true });
    for (let i = 0; i < 48; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(mineGeo, mat));
      g.add(new THREE.Mesh(spikeGeo, spikeMat));
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: 0xffa020, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      glow.scale.setScalar(9);
      g.add(glow);
      g.userData.glow = glow;
      g.visible = false;
      scene.add(g);
      this.minePool.push(g);
    }
    // Beam meshes: unit-length cylinders along +Y, stretched per use.
    this.beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true).translate(0, 0.5, 0);
    this.beamPool = [];
    this.time = 0;
  }

  // ---------------- Mines ----------------
  dropMine(pos, vel) {
    const mesh = this.minePool.pop();
    if (!mesh) return null;
    mesh.visible = true;
    mesh.position.copy(pos);
    const m = { mesh, pos: mesh.position, vel: vel.clone(), arm: 0.9, fuse: -1, life: 35, alive: true, radius: 2.2 };
    this.mines.push(m);
    return m;
  }

  detonate(m) {
    if (!m.alive) return;
    m.alive = false;
    m.mesh.visible = false;
    this.minePool.push(m.mesh);
    this.fx.explosion(m.pos, 1.1, 0xffa020);
    if (this.onMineBlast) this.onMineBlast(m.pos.clone(), 42, 24);
  }

  // Bolt hit test against mines; returns true if a mine was hit (and detonated).
  hitMine(p0, p1) {
    for (const m of this.mines) {
      if (!m.alive) continue;
      if (segPointDistSq(p0, p1, m.pos) < 9) { this.detonate(m); return true; }
    }
    return false;
  }

  updateMines(dt, player) {
    this.time += dt;
    let w = 0;
    for (const m of this.mines) {
      if (!m.alive) continue;
      m.life -= dt;
      if (m.life <= 0) { this.detonate(m); continue; }
      m.vel.multiplyScalar(Math.exp(-0.8 * dt));
      m.pos.addScaledVector(m.vel, dt);
      m.mesh.rotation.y += dt * 1.5;
      m.mesh.rotation.x += dt * 0.7;
      if (m.arm > 0) m.arm -= dt;
      const glow = m.mesh.userData.glow;
      if (m.fuse >= 0) {
        m.fuse -= dt;
        glow.material.color.set(0xff2a10);
        glow.material.opacity = Math.sin(this.time * 60) > 0 ? 1 : 0.2;
        if (this.onMineBeep && Math.random() < 0.3) this.onMineBeep(m.pos);
        if (m.fuse <= 0) { this.detonate(m); continue; }
      } else {
        glow.material.color.set(m.arm > 0 ? 0x806020 : 0xffa020);
        glow.material.opacity = 0.45 + 0.35 * Math.sin(this.time * 4 + m.life);
        if (m.arm <= 0 && player.alive && m.pos.distanceTo(player.pos) < 30) m.fuse = 0.45;
      }
      this.mines[w++] = m;
    }
    this.mines.length = w;
  }

  clearMines() {
    for (const m of this.mines) if (m.alive) { m.alive = false; m.mesh.visible = false; this.minePool.push(m.mesh); }
    this.mines.length = 0;
  }

  // ---------------- Beams ----------------
  makeBeam() {
    let b = this.beamPool.pop();
    if (!b) {
      const core = new THREE.Mesh(this.beamGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      const glow = new THREE.Mesh(this.beamGeo, new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      core.renderOrder = glow.renderOrder = 3;
      core.frustumCulled = glow.frustumCulled = false;
      this.scene.add(core, glow);
      b = { core, glow };
    }
    b.core.visible = b.glow.visible = false;
    return b;
  }

  // Stretch a beam from a to b. width is the glow radius; core is a third of it.
  setBeam(beam, a, b, width, color, opacity) {
    _v.subVectors(b, a);
    const len = _v.length();
    if (len < 0.01) return this.hideBeam(beam);
    _q.setFromUnitVectors(Y, _v.multiplyScalar(1 / len));
    for (const [m, w, op] of [[beam.glow, width, opacity * 0.55], [beam.core, width * 0.3, opacity]]) {
      m.visible = true;
      m.position.copy(a);
      m.quaternion.copy(_q);
      m.scale.set(w, len, w);
      m.material.opacity = op;
    }
    beam.glow.material.color.set(color);
  }

  hideBeam(beam) {
    beam.core.visible = beam.glow.visible = false;
  }

  releaseBeam(beam) {
    if (!beam) return;
    this.hideBeam(beam);
    this.beamPool.push(beam);
  }
}
