import * as THREE from 'three';
import { POWERUPS, PLAYER } from './config.js';
import { buildPowerup } from './models.js';

const _v = new THREE.Vector3();

export function randomPowerupType(exclude = []) {
  const entries = Object.entries(POWERUPS).filter(([k]) => !exclude.includes(k));
  const total = entries.reduce((s, [, d]) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const [k, d] of entries) {
    r -= d.weight;
    if (r <= 0) return k;
  }
  return entries[0][0];
}

export class Powerups {
  constructor(scene, fx) {
    this.scene = scene;
    this.fx = fx;
    this.list = [];
    this.time = 0;
  }

  spawn(type, pos, life = Infinity, vel = null) {
    const def = POWERUPS[type];
    const mesh = buildPowerup(def);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    const p = { type, def, mesh, pos: mesh.position, vel: vel ? vel.clone() : new THREE.Vector3(), life, alive: true, phase: Math.random() * 6 };
    this.list.push(p);
    return p;
  }

  update(dt, player, onPickup) {
    this.time += dt;
    let w = 0;
    for (const p of this.list) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) {
        this._remove(p);
        continue;
      }
      const u = p.mesh.userData;
      u.core.rotation.y += dt * 2;
      u.shell.rotation.x += dt * 0.7;
      u.shell.rotation.y -= dt * 0.9;
      const blink = p.life < 4 ? (Math.sin(this.time * 18) > 0 ? 1 : 0.25) : 1;
      u.glow.material.opacity = 0.7 * blink;
      u.core.material.opacity = 0.85 * blink;
      p.vel.multiplyScalar(Math.exp(-1.2 * dt));
      if (player.alive) {
        _v.subVectors(player.pos, p.pos);
        const d = _v.length();
        const magnet = PLAYER.magnetRadius * player.magnet;
        if (d < magnet) p.vel.addScaledVector(_v.normalize(), (1 - d / magnet) * 900 * dt);
        if (d < PLAYER.pickupRadius * (0.6 + 0.4 * player.magnet) + 3) {
          onPickup(p);
          this._remove(p);
          continue;
        }
      }
      p.pos.addScaledVector(p.vel, dt);
      this.list[w++] = p;
    }
    this.list.length = w;
  }

  _remove(p) {
    p.alive = false;
    this.scene.remove(p.mesh);
    p.mesh.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
  }

  clear() {
    for (const p of this.list) if (p.alive) this._remove(p);
    this.list.length = 0;
  }
}
