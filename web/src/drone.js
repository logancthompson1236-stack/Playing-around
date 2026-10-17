// Allied wingman drones: fly formation off your wing and engage your target.
import * as THREE from 'three';
import { buildDrone } from './models.js';
import { leadPoint, randomUnit, rand } from './util.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _slot = new THREE.Vector3();
const _want = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _qt = new THREE.Quaternion();
const ORIGIN = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export class Wingmen {
  constructor(scene, fx, proj) {
    this.scene = scene;
    this.fx = fx;
    this.proj = proj;
    this.list = [];
  }

  spawn(player, duration) {
    if (this.list.length >= 2) {
      // Refresh the oldest instead of stacking a third.
      const d = this.list.reduce((a, b) => (a.life < b.life ? a : b));
      d.life = Math.max(d.life, duration);
      return d;
    }
    const side = this.list.some((d) => d.side > 0) ? -1 : 1;
    const mesh = buildDrone();
    const right = _v.crossVectors(player.forward, player.levelUp).normalize();
    mesh.position.copy(player.pos).addScaledVector(right, side * 14).addScaledVector(player.forward, 10);
    this.scene.add(mesh);
    const d = {
      mesh, pos: mesh.position, vel: player.vel.clone(), fwd: player.forward.clone(), side,
      life: duration, max: duration, fireCd: rand(0.2, 0.5), target: null, alive: true,
    };
    this.list.push(d);
    this.fx.warp(d.pos, 0x7dff9a, 0.7);
    return d;
  }

  update(dt, player, enemies, field, lockTarget) {
    let w = 0;
    for (const d of this.list) {
      d.life -= dt;
      if (d.life <= 0 || !player.alive) {
        this.fx.warp(d.pos, 0x7dff9a, 0.6);
        this.scene.remove(d.mesh);
        continue;
      }
      this.list[w++] = d;
      // Pick a target: the player's lock first, else the nearest threat to the player.
      if (lockTarget && lockTarget.alive && !lockTarget.shielded && lockTarget.pos.distanceTo(player.pos) < 650) d.target = lockTarget;
      else if (!d.target || !d.target.alive || d.target.shielded || d.target.pos.distanceTo(player.pos) > 650) {
        d.target = null;
        let best = 520;
        for (const e of enemies.list) {
          if (!e.alive || e.shielded) continue;
          const dist = e.pos.distanceTo(player.pos);
          if (dist < best) { best = dist; d.target = e; }
        }
      }
      const right = _v.crossVectors(player.forward, player.levelUp).normalize();
      _slot.copy(player.pos).addScaledVector(right, d.side * 15).addScaledVector(player.levelUp, 3).addScaledVector(player.forward, -4);
      let maxSpeed = Math.max(140, player.speed * 1.4);
      if (d.target) {
        // Attack from a stand-off point between the player and the target.
        _v2.subVectors(d.target.pos, d.pos);
        const td = _v2.length();
        _v2.multiplyScalar(1 / Math.max(td, 1));
        _want.copy(d.target.pos).addScaledVector(_v2, -110).addScaledVector(right, d.side * 30);
        if (_want.distanceTo(player.pos) > 380) _want.lerp(_slot, 0.6);
        maxSpeed = 190;
      } else _want.copy(_slot);
      // Steer: desired velocity toward the goal, plus rock avoidance.
      _v.subVectors(_want, d.pos).multiplyScalar(2.2);
      if (!d.target) _v.addScaledVector(player.vel, 1);
      field.query(d.pos, 50, (a) => {
        const sd = field.surfaceDistance(a, d.pos);
        if (sd < 22) _v.addScaledVector(_v2.subVectors(d.pos, a.pos).normalize(), (22 - sd) * 12);
      });
      _v.clampLength(0, maxSpeed);
      d.vel.lerp(_v, 1 - Math.exp(-4 * dt));
      d.pos.addScaledVector(d.vel, dt);
      // Face the target when engaging, otherwise the direction of travel.
      if (d.target) d.fwd.subVectors(d.target.pos, d.pos).normalize();
      else if (d.vel.lengthSq() > 4) d.fwd.copy(d.vel).normalize();
      _m.lookAt(d.fwd, ORIGIN, UP);
      d.mesh.quaternion.slerp(_qt.setFromRotationMatrix(_m), 1 - Math.exp(-8 * dt));
      for (const s of d.mesh.userData.engines) s.scale.setScalar(s.userData.baseSize * (0.8 + Math.random() * 0.4));
      d.mesh.visible = d.life > 2 || Math.sin(d.life * 30) > -0.3;
      // Guns.
      d.fireCd -= dt;
      if (d.target && d.fireCd <= 0) {
        const dist = d.target.pos.distanceTo(d.pos);
        leadPoint(d.pos, d.target.pos, d.target.vel, 520, _aim);
        _v.subVectors(_aim, d.pos).normalize();
        if (dist < 480 && _v.dot(d.fwd) > 0.9) {
          d.fireCd = 0.26;
          const mz = d.mesh.localToWorld(_v2.copy(d.mesh.userData.muzzles[0]));
          this.proj.firePlayer(mz, _v, 520, 7, 1.0, null, d.target, 2.2, { color: 0x7dff9a, scale: 0.8 });
        }
      }
    }
    this.list.length = w;
  }

  clear() {
    for (const d of this.list) this.scene.remove(d.mesh);
    this.list.length = 0;
  }
}
