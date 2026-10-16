import * as THREE from 'three';
import { getGlowTexture, rand, randomUnit } from './util.js';

const VERT = /* glsl */ `
  attribute float size;
  attribute float alpha;
  attribute vec3 pcolor;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(size * uScale / max(-mv.z, 0.1), 0.0, 256.0);
    gl_Position = projectionMatrix * mv;
    vColor = pcolor;
    vAlpha = alpha;
  }
`;
const FRAG_ADD = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.0, 1.0, d);
    a *= a * vAlpha;
    gl_FragColor = vec4(vColor * a, 1.0);
  }
`;
const FRAG_ALPHA = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = 1.0 - smoothstep(0.35, 1.0, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

class ParticlePool {
  constructor(scene, max, additive) {
    this.max = max;
    this.i = 0;
    const g = (this.geo = new THREE.BufferGeometry());
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.s0 = new Float32Array(max);
    this.s1 = new Float32Array(max);
    this.a0 = new Float32Array(max);
    this.drag = new Float32Array(max);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('pcolor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.uniforms = { uScale: { value: 400 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERT,
      fragmentShader: additive ? FRAG_ADD : FRAG_ALPHA,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      transparent: true,
      depthWrite: false,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 3 : 2;
    scene.add(this.points);
    this.active = 0;
  }

  emit(x, y, z, vx, vy, vz, color, s0, s1, life, alpha = 1, drag = 1.5) {
    const i = this.i;
    this.i = (this.i + 1) % this.max;
    const i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.col[i3] = color.r; this.col[i3 + 1] = color.g; this.col[i3 + 2] = color.b;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.s0[i] = s0;
    this.s1[i] = s1;
    this.a0[i] = alpha;
    this.drag[i] = drag;
    this.size[i] = s0;
    this.alpha[i] = alpha;
  }

  update(dt) {
    const { pos, vel, life, maxLife, size, alpha, s0, s1, a0, drag } = this;
    let active = 0;
    for (let i = 0; i < this.max; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      if (life[i] <= 0) {
        alpha[i] = 0;
        size[i] = 0;
        continue;
      }
      active++;
      const i3 = i * 3;
      const k = Math.exp(-drag[i] * dt);
      vel[i3] *= k; vel[i3 + 1] *= k; vel[i3 + 2] *= k;
      pos[i3] += vel[i3] * dt;
      pos[i3 + 1] += vel[i3 + 1] * dt;
      pos[i3 + 2] += vel[i3 + 2] * dt;
      const t = 1 - life[i] / maxLife[i];
      size[i] = s0[i] + (s1[i] - s0[i]) * t;
      alpha[i] = a0[i] * (1 - t) * (1 - t * 0.3);
    }
    this.active = active;
    const a = this.geo.attributes;
    a.position.needsUpdate = true;
    a.pcolor.needsUpdate = true;
    a.size.needsUpdate = true;
    a.alpha.needsUpdate = true;
  }

  clear() {
    this.life.fill(0);
    this.alpha.fill(0);
    this.size.fill(0);
  }
}

const C = (hex) => new THREE.Color(hex);
const FIRE = [C(0xfff3c4), C(0xffc04a), C(0xff7a1f), C(0xff4a1a)];
const _c = new THREE.Color();
const _v = new THREE.Vector3();

export class Effects {
  constructor(scene, quality = 1) {
    this.scene = scene;
    this.add = new ParticlePool(scene, quality > 0 ? 4500 : 2500, true);
    this.alpha = new ParticlePool(scene, quality > 0 ? 2000 : 1000, false);
    this.q = quality > 0 ? 1 : 0.6;

    // Flash sprites
    this.flashes = [];
    for (let i = 0; i < 24; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: getGlowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      s.visible = false;
      s.renderOrder = 4;
      scene.add(s);
      this.flashes.push({ s, life: 0, max: 1, size: 1 });
    }
    // Shockwave rings
    this.rings = [];
    const rg = new THREE.RingGeometry(0.93, 1, 64);
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({
        color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide,
      }));
      m.visible = false;
      m.renderOrder = 4;
      scene.add(m);
      this.rings.push({ m, life: 0, max: 1, r0: 1, r1: 10 });
    }
    this._fi = 0;
    this._ri = 0;
  }

  setScale(px) {
    this.add.uniforms.uScale.value = px;
    this.alpha.uniforms.uScale.value = px;
  }

  flash(pos, size, color, life = 0.35) {
    const f = this.flashes[this._fi];
    this._fi = (this._fi + 1) % this.flashes.length;
    f.s.position.copy(pos);
    f.s.material.color.set(color);
    f.s.visible = true;
    f.life = f.max = life;
    f.size = size;
    f.s.scale.setScalar(size);
  }

  ring(pos, r0, r1, color, life = 0.6) {
    const r = this.rings[this._ri];
    this._ri = (this._ri + 1) % this.rings.length;
    r.m.position.copy(pos);
    r.m.material.color.set(color);
    r.m.visible = true;
    r.life = r.max = life;
    r.r0 = r0;
    r.r1 = r1;
  }

  explosion(pos, scale = 1, tint = null) {
    const n = Math.round((30 + 40 * scale) * this.q);
    for (let i = 0; i < n; i++) {
      randomUnit(_v).multiplyScalar(rand(4, 22) * scale);
      _c.copy(FIRE[(Math.random() * FIRE.length) | 0]);
      if (tint && Math.random() < 0.35) _c.set(tint);
      const ss = Math.sqrt(scale);
      this.add.emit(pos.x, pos.y, pos.z, _v.x, _v.y, _v.z, _c, rand(2.5, 5) * ss, rand(6, 11) * ss, rand(0.35, 0.9), 0.75, 2.5);
    }
    // Sparks
    for (let i = 0; i < Math.round(20 * scale * this.q); i++) {
      randomUnit(_v).multiplyScalar(rand(40, 110) * Math.sqrt(scale));
      this.add.emit(pos.x, pos.y, pos.z, _v.x, _v.y, _v.z, FIRE[0], 1.4, 0.4, rand(0.4, 1.1), 1, 1.2);
    }
    // Smoke
    _c.set(0x2a2a30);
    for (let i = 0; i < Math.round(12 * scale * this.q); i++) {
      randomUnit(_v).multiplyScalar(rand(3, 12) * scale);
      this.alpha.emit(pos.x + _v.x * 0.3, pos.y + _v.y * 0.3, pos.z + _v.z * 0.3, _v.x, _v.y, _v.z, _c, 6 * scale, 22 * scale, rand(1.0, 2.2), 0.55, 1.2);
    }
    this.flash(pos, 26 * Math.sqrt(scale) + 6, 0xffd38a, 0.25 + 0.08 * scale);
    if (scale >= 1) this.ring(pos, 2 * scale, 45 * scale, 0xffb070, 0.55);
  }

  sparks(pos, color, n = 8, speed = 50) {
    _c.set(color);
    for (let i = 0; i < n * this.q; i++) {
      randomUnit(_v).multiplyScalar(rand(0.3, 1) * speed);
      this.add.emit(pos.x, pos.y, pos.z, _v.x, _v.y, _v.z, _c, 1.6, 0.3, rand(0.2, 0.5), 1, 2);
    }
  }

  rockBurst(pos, radius, rockColor) {
    const n = Math.round(Math.min(70, 10 + radius * 1.3) * this.q);
    for (let i = 0; i < n; i++) {
      randomUnit(_v);
      const sp = rand(8, 30) + radius * 0.4;
      _c.set(rockColor).multiplyScalar(rand(0.35, 0.8));
      this.alpha.emit(
        pos.x + _v.x * radius * 0.6, pos.y + _v.y * radius * 0.6, pos.z + _v.z * radius * 0.6,
        _v.x * sp, _v.y * sp, _v.z * sp, _c, rand(0.8, 2.2) + radius * 0.05, 0.5, rand(0.8, 2.0), 1, 0.4
      );
    }
    // Dust cloud
    _c.set(rockColor).multiplyScalar(0.45);
    for (let i = 0; i < Math.round(8 * this.q + radius * 0.15); i++) {
      randomUnit(_v).multiplyScalar(rand(4, 12));
      this.alpha.emit(pos.x, pos.y, pos.z, _v.x, _v.y, _v.z, _c, radius * 0.6, radius * 2.0, rand(1.2, 2.5), 0.4, 0.8);
    }
    for (let i = 0; i < 8 * this.q; i++) {
      randomUnit(_v).multiplyScalar(rand(30, 70));
      this.add.emit(pos.x, pos.y, pos.z, _v.x, _v.y, _v.z, FIRE[1], 1.2, 0.3, rand(0.2, 0.5), 1, 2);
    }
  }

  warp(pos, color = 0x8fd8ff, size = 1) {
    _c.set(color);
    for (let i = 0; i < 40 * this.q; i++) {
      randomUnit(_v).multiplyScalar(rand(20, 60) * size);
      this.add.emit(pos.x - _v.x * 0.4, pos.y - _v.y * 0.4, pos.z - _v.z * 0.4, _v.x, _v.y, _v.z, _c, 2.5 * size, 0.5, rand(0.4, 0.8), 1, 3);
    }
    this.flash(pos, 40 * size, color, 0.5);
    this.ring(pos, 2, 30 * size, color, 0.5);
  }

  trail(pos, vel, color, size = 1.8, life = 0.35) {
    _c.set(color);
    this.add.emit(pos.x, pos.y, pos.z, vel.x, vel.y, vel.z, _c, size, size * 0.2, life, 0.7, 1);
  }

  smokeTrail(pos) {
    _c.set(0x6a6a70);
    this.alpha.emit(pos.x, pos.y, pos.z, rand(-1, 1), rand(-1, 1), rand(-1, 1), _c, 1.2, 4.5, rand(0.6, 1.0), 0.45, 0.5);
  }

  update(dt, camera) {
    this.add.update(dt);
    this.alpha.update(dt);
    for (const f of this.flashes) {
      if (f.life <= 0) continue;
      f.life -= dt;
      if (f.life <= 0) { f.s.visible = false; continue; }
      const t = f.life / f.max;
      f.s.material.opacity = t;
      f.s.scale.setScalar(f.size * (1.2 - 0.4 * t));
    }
    for (const r of this.rings) {
      if (r.life <= 0) continue;
      r.life -= dt;
      if (r.life <= 0) { r.m.visible = false; continue; }
      const t = 1 - r.life / r.max;
      const e = 1 - (1 - t) * (1 - t);
      r.m.scale.setScalar(r.r0 + (r.r1 - r.r0) * e);
      r.m.material.opacity = (1 - t) * 0.6;
      r.m.quaternion.copy(camera.quaternion);
    }
  }

  clear() {
    this.add.clear();
    this.alpha.clear();
    this.flashes.forEach((f) => { f.life = 0; f.s.visible = false; });
    this.rings.forEach((r) => { r.life = 0; r.m.visible = false; });
  }
}
