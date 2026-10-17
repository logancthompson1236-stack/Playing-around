import * as THREE from 'three';
import { getGlowTexture, rotateTowards, leadPoint } from './util.js';

const Z = new THREE.Vector3(0, 0, 1);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(1, 1, 1);
const _v = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _want = new THREE.Vector3();

const MISSILE_KINDS = {
  seeker: { start: 110, accel: 260, max: 340, turn: 4.2, life: 5.5, splash: 32, scale: 1, glow: 0xff7a3a },
  swarm: { start: 140, accel: 320, max: 370, turn: 6.0, life: 3.5, splash: 16, scale: 0.6, glow: 0xffb04a },
  torpedo: { start: 60, accel: 140, max: 235, turn: 1.9, life: 7.5, splash: 75, scale: 2.0, glow: 0xff4a8a },
};

class BoltSet {
  constructor(scene, cap, coreColor, glowColor, len, homingColor = glowColor) {
    this.cap = cap;
    this.items = [];
    this.glowColor = new THREE.Color(glowColor);
    this.homingColor = new THREE.Color(homingColor);
    const along = (g) => g.rotateX(Math.PI / 2);
    const coreGeo = along(new THREE.CylinderGeometry(0.32, 0.32, len, 6));
    const glowGeo = along(new THREE.CylinderGeometry(1.35, 0.9, len * 1.3, 8));
    const mk = (geo, color, opacity) => {
      const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({
        color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      }), cap);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      m.count = 0;
      m.renderOrder = 3;
      scene.add(m);
      return m;
    };
    this.core = mk(coreGeo, coreColor, 1);
    // Glow is tinted per instance so homing bolts can read differently.
    this.glow = mk(glowGeo, 0xffffff, 0.45);
    for (let i = 0; i < cap; i++) this.glow.setColorAt(i, this.glowColor);
  }

  // `target` (optional) makes the bolt curve toward that ship at `turn` rad/s.
  // opts: { color, pierce, scale }
  spawn(pos, dir, speed, damage, life, inherit, target = null, turn = 0, opts = null) {
    if (this.items.length >= this.cap) this.items.shift();
    const b = {
      pos: pos.clone(), prev: pos.clone(), dir: dir.clone(),
      vel: dir.clone().multiplyScalar(speed), damage, life, dead: false,
      target, turn, speed: 0,
      color: opts && opts.color != null ? new THREE.Color(opts.color) : null,
      pierce: !!(opts && opts.pierce), hits: null, scale: (opts && opts.scale) || 1,
    };
    if (b.pierce) b.hits = new Set();
    if (inherit) b.vel.add(inherit);
    b.speed = b.vel.length();
    if (target) b.dir.copy(b.vel).normalize();
    this.items.push(b);
    return b;
  }

  update(dt, hitFn) {
    let w = 0;
    for (const b of this.items) {
      if (b.target) {
        if (b.target.alive) {
          leadPoint(b.pos, b.target.pos, b.target.vel, b.speed, _aim);
          _want.subVectors(_aim, b.pos).normalize();
          // Don't U-turn after overshooting; keep flying straight instead.
          if (_want.dot(b.dir) > -0.1) {
            rotateTowards(b.dir, _want, b.turn * dt);
            b.vel.copy(b.dir).multiplyScalar(b.speed);
          }
        } else b.target = null;
      }
      b.prev.copy(b.pos);
      b.pos.addScaledVector(b.vel, dt);
      b.life -= dt;
      if (b.life <= 0) b.dead = true;
      else if (hitFn(b)) b.dead = true;
      if (!b.dead) this.items[w++] = b;
    }
    this.items.length = w;
    for (let i = 0; i < w; i++) {
      const b = this.items[i];
      _q.setFromUnitVectors(Z, b.dir);
      _m.compose(b.pos, _q, _s.setScalar(b.scale));
      this.core.setMatrixAt(i, _m);
      this.glow.setMatrixAt(i, _m);
      this.glow.setColorAt(i, b.target && this.homingColor !== this.glowColor ? this.homingColor : b.color || this.glowColor);
    }
    this.core.count = this.glow.count = w;
    this.core.instanceMatrix.needsUpdate = true;
    this.glow.instanceMatrix.needsUpdate = true;
    if (this.glow.instanceColor) this.glow.instanceColor.needsUpdate = true;
  }

  clear() {
    this.items.length = 0;
    this.core.count = this.glow.count = 0;
  }
}

export class Projectiles {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.player = new BoltSet(scene, 220, 0xe8fdff, 0x34c8ff, 10, 0xffc84a);
    this.enemy = new BoltSet(scene, 220, 0xfff0e0, 0xff3a2a, 8);
    this.missiles = [];
    this.missilePool = [];
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6).rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd0d4dc, metalness: 0.6, roughness: 0.4, flatShading: true });
    for (let i = 0; i < 28; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(bodyGeo, bodyMat));
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: getGlowTexture(), color: 0xff7a3a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      s.scale.setScalar(3.4);
      s.position.z = -1.3;
      g.add(s);
      g.visible = false;
      scene.add(g);
      this.missilePool.push(g);
    }
  }

  firePlayer(pos, dir, speed, damage, life, inherit, target = null, turn = 0, opts = null) {
    return this.player.spawn(pos, dir, speed, damage, life, inherit, target, turn, opts);
  }

  // opts: { target, turn, life, color, scale } — a target makes a slow homing orb.
  fireEnemy(pos, dir, speed, damage, opts = null) {
    if (!opts) return this.enemy.spawn(pos, dir, speed, damage, 2.6, null);
    return this.enemy.spawn(pos, dir, speed, damage, opts.life || 2.6, null, opts.target || null, opts.turn || 0, opts);
  }

  // kind: 'seeker' | 'swarm' | 'torpedo'
  fireMissile(pos, dir, inheritVel, target, damage, kind = 'seeker') {
    const mesh = this.missilePool.pop();
    if (!mesh) return null;
    mesh.visible = true;
    const K = MISSILE_KINDS[kind] || MISSILE_KINDS.seeker;
    mesh.scale.setScalar(K.scale);
    mesh.children[1].material.color.set(K.glow);
    const m = {
      mesh, kind, K, pos: pos.clone(), dir: dir.clone(), speed: K.start + inheritVel.length() * 0.6,
      target, damage, splash: K.splash, life: K.life, age: 0, dead: false, prev: pos.clone(),
    };
    this.missiles.push(m);
    return m;
  }

  update(dt, hooks) {
    this.player.update(dt, hooks.playerBolt);
    this.enemy.update(dt, hooks.enemyBolt);
    const fx = this.fx;
    let w = 0;
    for (const m of this.missiles) {
      m.age += dt;
      m.life -= dt;
      const K = m.K;
      m.speed = Math.min(K.max, m.speed + K.accel * dt);
      if (!m.target || !m.target.alive) m.target = hooks.retarget(m);
      if (m.target && m.age > 0.15) {
        leadPoint(m.pos, m.target.pos, m.target.vel, m.speed, _aim);
        _v.subVectors(_aim, m.pos).normalize();
        rotateTowards(m.dir, _v, K.turn * dt);
      }
      m.prev.copy(m.pos);
      m.pos.addScaledVector(m.dir, m.speed * dt);
      m.mesh.position.copy(m.pos);
      m.mesh.quaternion.setFromUnitVectors(Z, m.dir);
      if (m.kind !== 'swarm' || Math.random() < 0.5) fx.smokeTrail(_v.copy(m.pos).addScaledVector(m.dir, -1.5 * K.scale));
      if (m.life <= 0) {
        fx.explosion(m.pos, 0.5 * K.scale);
        m.dead = true;
      } else if (hooks.missile(m)) m.dead = true;
      if (m.dead) {
        m.mesh.visible = false;
        this.missilePool.push(m.mesh);
      } else this.missiles[w++] = m;
    }
    this.missiles.length = w;
  }

  clear() {
    this.player.clear();
    this.enemy.clear();
    for (const m of this.missiles) {
      m.mesh.visible = false;
      this.missilePool.push(m.mesh);
    }
    this.missiles.length = 0;
  }
}
