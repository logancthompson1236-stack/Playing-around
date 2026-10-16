import * as THREE from 'three';
import { ENEMIES, ARENA } from './config.js';
import { ENEMY_BUILDERS, getHullMaterial } from './models.js';
import { rand, randomUnit, rotateTowards, leadPoint, clamp, damp } from './util.js';

const ORIGIN = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const Zaxis = new THREE.Vector3(0, 0, 1);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _avoid = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _prev = new THREE.Vector3();
const ENEMY_BOLT_SPEED = 300;

let uid = 1;

export class Enemies {
  constructor(scene, fx, proj, field) {
    this.scene = scene;
    this.fx = fx;
    this.proj = proj;
    this.field = field;
    this.list = [];
    this.onKilled = null;
    this.onFire = null;
  }

  get aliveCount() {
    let n = 0;
    for (const e of this.list) if (e.alive) n++;
    return n;
  }

  spawn(type, pos, sector) {
    const def = ENEMIES[type];
    const mat = getHullMaterial().clone();
    mat.emissive = new THREE.Color(0x000000);
    const mesh = ENEMY_BUILDERS[type](mat);
    mesh.position.copy(pos);
    mesh.scale.setScalar(0.01);
    this.scene.add(mesh);
    const hpScale = 1 + 0.16 * (sector - 1);
    const e = {
      id: uid++, type, def, mesh, mat, pos: mesh.position,
      vel: new THREE.Vector3(), fwd: randomUnit(new THREE.Vector3()),
      hp: def.hp * hpScale, maxHp: def.hp * hpScale,
      damage: def.damage * (1 + 0.1 * (sector - 1)),
      accuracy: Math.max(0.012, 0.034 - sector * 0.004),
      fireRateMul: 1 + 0.06 * (sector - 1),
      speed: def.speed, radius: def.radius,
      state: 'attack', timer: 0, breakDir: new THREE.Vector3(),
      orbitAxis: randomUnit(new THREE.Vector3()),
      fireCd: rand(1, 2.5), burstLeft: 0, burstCd: 0, gun: 0,
      bank: 0, flash: 0, spawnT: 0, alive: true, lastHitBy: null,
      jink: new THREE.Vector3(), jinkT: 0,
    };
    // Face the player-ish on arrival.
    this.list.push(e);
    this.fx.warp(pos, type === 'warden' ? 0xffa040 : 0xff5050, type === 'warden' ? 1.6 : 1);
    return e;
  }

  damage(e, amount) {
    if (!e.alive) return false;
    e.hp -= amount;
    e.flash = 0.1;
    if (e.hp <= 0) {
      this.kill(e);
      return true;
    }
    return false;
  }

  kill(e, silent = false) {
    if (!e.alive) return;
    e.alive = false;
    this.scene.remove(e.mesh);
    e.mat.dispose();
    if (!silent && this.onKilled) this.onKilled(e);
  }

  clear() {
    for (const e of this.list) if (e.alive) this.kill(e, true);
    this.list.length = 0;
  }

  update(dt, player, difficulty) {
    const field = this.field;
    let w = 0;
    for (const e of this.list) if (e.alive) this.list[w++] = e;
    this.list.length = w;

    for (const e of this.list) {
      const def = e.def;
      e.spawnT += dt;
      if (e.spawnT < 0.6) e.mesh.scale.setScalar(Math.max(0.01, e.spawnT / 0.6));
      else e.mesh.scale.setScalar(1);

      _v.subVectors(player.pos, e.pos);
      const dist = _v.length();
      const toP = _v.multiplyScalar(1 / Math.max(dist, 0.001));

      // ---- Decide where we want to go ----
      leadPoint(e.pos, player.pos, player.vel, ENEMY_BOLT_SPEED, _aim);
      _desired.subVectors(_aim, e.pos).normalize();
      const aimDir = _v2.copy(_desired);
      e.timer -= dt;
      if (!player.alive) {
        _desired.copy(e.fwd);
      } else if (e.type === 'raider') {
        if (e.state === 'attack' && dist < 65) {
          e.state = 'break';
          e.timer = rand(1.3, 2.3);
          e.breakDir.copy(randomUnit(_v2.set(0, 0, 0))).addScaledVector(toP, -0.8).normalize();
          aimDir.copy(_desired);
        }
        if (e.state === 'break') {
          _desired.copy(e.breakDir);
          if (e.timer <= 0) e.state = 'attack';
        }
      } else if (e.type === 'lancer') {
        if (e.state === 'attack' && dist < 140) {
          e.state = 'orbit';
          e.timer = rand(2.5, 4);
          e.orbitAxis.copy(randomUnit(new THREE.Vector3()));
        }
        if (e.state === 'orbit') {
          const t = new THREE.Vector3().crossVectors(toP, e.orbitAxis).normalize();
          _desired.copy(t).addScaledVector(toP, clamp((dist - 170) / 90, -1, 1)).normalize();
          if (e.timer <= 0) e.state = 'attack';
        }
      } else if (e.type === 'warden') {
        if (dist < 230) {
          const t = new THREE.Vector3().crossVectors(toP, e.orbitAxis).normalize();
          _desired.copy(t).addScaledVector(toP, -0.8).normalize();
        } else if (dist < 420) {
          // Hold range but keep the nose on target for broadsides.
          _desired.lerp(new THREE.Vector3().crossVectors(toP, e.orbitAxis).normalize(), 0.35).normalize();
        }
      }

      // ---- Evasion: jink when the player has us in their sights ----
      if (player.alive && e.state !== 'break') {
        const inSights = -toP.dot(player.forward) > 0.97 && dist < 600;
        e.jinkT -= dt;
        if (inSights && e.jinkT <= 0) {
          e.jinkT = rand(0.5, 1.1);
          e.jink.copy(randomUnit(_v2.set(0, 0, 0))).addScaledVector(toP, -toP.dot(e.jink)).normalize();
          aimDir.subVectors(_aim, e.pos).normalize();
        }
        if (e.jinkT > 0 && inSights) _desired.addScaledVector(e.jink, e.type === 'warden' ? 0.3 : 0.9).normalize();
      }

      // ---- Obstacle avoidance ----
      const look = e.speed * 1.7 + e.radius * 2;
      _avoid.set(0, 0, 0);
      _v.copy(e.pos).addScaledVector(e.fwd, look * 0.5);
      field.query(_v, look * 0.5 + 60, (a) => {
        const relx = a.pos.x - e.pos.x, rely = a.pos.y - e.pos.y, relz = a.pos.z - e.pos.z;
        const t = relx * e.fwd.x + rely * e.fwd.y + relz * e.fwd.z;
        const ar = a.tier === 'X' ? a.r * 1.15 : a.r * 0.95;
        if (t < -ar || t > look + ar) return;
        const cx = e.pos.x + e.fwd.x * t - a.pos.x, cy = e.pos.y + e.fwd.y * t - a.pos.y, cz = e.pos.z + e.fwd.z * t - a.pos.z;
        const d = Math.hypot(cx, cy, cz);
        const clear = ar + e.radius + 8;
        if (d < clear) {
          const s = (1 - Math.max(0, t) / (look + ar)) * 3.5 * (1 - d / clear + 0.3);
          if (d > 0.01) _avoid.x += (cx / d) * s, _avoid.y += (cy / d) * s, _avoid.z += (cz / d) * s;
          else _avoid.y += s;
        }
      });
      // Separation from other enemies.
      for (const o of this.list) {
        if (o === e) continue;
        const dx = e.pos.x - o.pos.x, dy = e.pos.y - o.pos.y, dz = e.pos.z - o.pos.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 900 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          _avoid.x += (dx / d) * 0.8, _avoid.y += (dy / d) * 0.8, _avoid.z += (dz / d) * 0.8;
        }
      }
      _desired.add(_avoid);
      // Stay in the arena.
      const hr = Math.hypot(e.pos.x, e.pos.z);
      if (hr > ARENA.radius * 0.98 || Math.abs(e.pos.y) > ARENA.halfHeight) {
        _desired.addScaledVector(_v.copy(e.pos).negate().normalize(), 2);
      }
      if (_desired.lengthSq() < 1e-6) _desired.copy(e.fwd);
      _desired.normalize();

      _prev.copy(e.fwd);
      const turn = def.turn * (e.state === 'break' ? 1.3 : 1);
      rotateTowards(e.fwd, _desired, turn * dt);
      const sp = e.speed * (dist > 750 ? 1.7 : 1) * (e.spawnT < 0.6 ? 0.2 : 1);
      e.vel.copy(e.fwd).multiplyScalar(sp);
      e.pos.addScaledVector(e.vel, dt);

      // Orientation with banking into turns.
      const yawRate = _v.crossVectors(_prev, e.fwd).dot(UP) / Math.max(dt, 1e-4);
      e.bank = damp(e.bank, clamp(-yawRate * 0.7, -1.1, 1.1), 4, dt);
      _m.lookAt(e.fwd, ORIGIN, UP);
      e.mesh.quaternion.setFromRotationMatrix(_m);
      _q.setFromAxisAngle(Zaxis, e.bank);
      e.mesh.quaternion.multiply(_q);

      // Visual feedback.
      if (e.flash > 0) {
        e.flash -= dt;
        e.mat.emissive.setRGB(1, 0.6, 0.4).multiplyScalar(Math.max(0, e.flash) * 10);
      } else e.mat.emissive.setRGB(0, 0, 0);
      for (const s of e.mesh.userData.engines) {
        const f = s.userData.baseSize * (0.8 + Math.random() * 0.4) * (dist > 750 ? 1.5 : 1);
        s.scale.set(f, f, f);
      }
      if (Math.random() < 0.5) {
        const s = e.mesh.userData.engines[0];
        s.getWorldPosition(_v);
        this.fx.trail(_v, _v2.copy(e.fwd).multiplyScalar(-15), s.material.color.getHex(), 1.5, 0.25);
      }

      // ---- Weapons ----
      if (!player.alive || e.spawnT < 1) continue;
      e.fireCd -= dt * e.fireRateMul * difficulty;
      e.burstCd -= dt;
      const facing = e.fwd.dot(aimDir);
      if (e.burstLeft <= 0 && e.fireCd <= 0 && dist < def.range && facing > 0.9) {
        e.burstLeft = def.burst;
        e.fireCd = def.fireCooldown * rand(0.85, 1.35);
      }
      if (e.burstLeft > 0 && e.burstCd <= 0) {
        e.burstLeft--;
        e.burstCd = def.burstGap;
        const muzzles = e.mesh.userData.muzzles;
        e.gun = (e.gun + 1) % muzzles.length;
        const mz = e.mesh.localToWorld(_v.copy(muzzles[e.gun]));
        const base = new THREE.Vector3().subVectors(_aim, mz).normalize();
        const shots = def.spread > 1 ? def.spread : 1;
        const side = new THREE.Vector3().crossVectors(base, UP).normalize();
        for (let i = 0; i < shots; i++) {
          const off = shots > 1 ? (i - (shots - 1) / 2) * 0.09 : 0;
          const d = base.clone().addScaledVector(side, off);
          d.add(randomUnit(new THREE.Vector3()).multiplyScalar(e.accuracy)).normalize();
          this.proj.fireEnemy(mz, d, ENEMY_BOLT_SPEED, e.damage);
        }
        this.fx.flash(mz, 5, 0xff5040, 0.08);
        if (this.onFire) this.onFire(e);
      }
    }
  }
}
