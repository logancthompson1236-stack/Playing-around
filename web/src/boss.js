// End-of-sector capital ships. Each boss is a root object carrying destructible parts that
// live in the enemy list (so lock-on, homing, missiles and radar all work on them).
import * as THREE from 'three';
import { BOSSES } from './config.js';
import { buildDreadnought, buildSentinel, buildShieldBubble } from './models.js';
import { rand, randomUnit, rotateTowards, leadPoint, segPointDistSq, clamp } from './util.js';
import { ENEMY_BOLT_SPEED } from './enemies.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _aim = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const ORIGIN = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _qi = new THREE.Quaternion();

export class Boss {
  // game: { scene, enemies, hazards, proj, fx, field, spawnEnemy(type,pos), onBossEvent(name, extra) }
  constructor(game, kind, sector, pos, diff) {
    this.game = game;
    this.kind = kind;
    this.def = BOSSES[kind];
    this.name = this.def.name;
    this.sector = sector;
    this.scale = (1 + 0.22 * Math.max(0, sector - 1)) * diff.hp;
    this.dmgScale = (1 + 0.08 * (sector - 1)) * diff.damage;
    this.alive = true;
    this.dying = 0;
    this.phase = 1;
    this.time = 0;
    this.root = new THREE.Group();
    this.root.position.copy(pos);
    this.vel = new THREE.Vector3();
    this.fwd = new THREE.Vector3(1, 0, 0);
    game.scene.add(this.root);
    this.colliders = [];
    this.parts = [];
    this.beams = [];
    this.spawnT = 0;
    this.size = kind === 'dreadnought' ? 1.7 : 1.6;
    if (kind === 'dreadnought') this._buildDreadnought();
    else this._buildSentinel();
    this.root.scale.setScalar(0.01);
  }

  get pos() { return this.root.position; }

  _collider(local, r, parent) {
    const c = { tier: 'X', shape: 'sphere', local: new THREE.Vector3().fromArray(local), r: r * this.size, pos: new THREE.Vector3(), parent, alive: true, vel: this.vel, boss: this };
    this.colliders.push(c);
    this.game.field.statics.push(c);
    return c;
  }

  _buildDreadnought() {
    const model = buildDreadnought();
    this.model = model;
    this.root.add(model);
    const M = model.userData.mounts;
    const E = this.game.enemies;
    for (const off of M.turrets) {
      const t = E.spawnPart('turret', this, off, this.def.turretHp * this.scale, { radius: 4.5 * this.size, score: 400, credits: 15, damage: 7 * this.dmgScale });
      t.part.role = 'turret';
      if (off[1] < 0) t.mesh.rotation.z = Math.PI;
      this.parts.push(t);
    }
    for (const off of M.bays) {
      const b = E.spawnPart('bay', this, off, this.def.bayHp * this.scale, { radius: 7 * this.size, score: 500, credits: 20 });
      b.part.role = 'bay';
      if (off[0] < 0) b.mesh.rotation.y = Math.PI;
      b.launchT = rand(4, 7);
      this.parts.push(b);
    }
    this.core = E.spawnPart('core', this, M.core, this.def.coreHp * this.scale, { radius: 8 * this.size, score: 2000, credits: 0, shielded: true, drop: 0, damage: 8 * this.dmgScale });
    this.core.part.role = 'core';
    this.bubble = buildShieldBubble(14);
    this.core.mesh.add(this.bubble);
    for (const c of model.userData.colliders) this._collider([c[0], c[1], c[2]], c[3], model);
    // Arrive broadside so the whole hull is on show.
    const toP = new THREE.Vector3().subVectors(this.game.playerPos, this.root.position).normalize();
    this.fwd.crossVectors(toP, UP).normalize();
    if (this.fwd.lengthSq() < 0.01) this.fwd.set(1, 0, 0);
    this.speed = 14;
  }

  _buildSentinel() {
    const model = buildSentinel();
    this.model = model;
    this.root.add(model);
    const spin = model.userData.spin;
    const E = this.game.enemies;
    for (const off of model.userData.mounts.pylons) {
      const p = E.spawnPart('pylon', this, off, this.def.pylonHp * this.scale, { radius: 5 * this.size, score: 500, credits: 20, damage: 7 * this.dmgScale });
      spin.add(p.mesh); // pylons ride the spinning ring
      p.mesh.position.fromArray(off);
      p.part.role = 'pylon';
      this.parts.push(p);
    }
    this.core = E.spawnPart('core', this, [0, 0, 0], this.def.coreHp * this.scale, { radius: 12 * this.size, r: 12, color: 0xff3050, score: 2000, credits: 0, shielded: true, drop: 0, damage: 9 * this.dmgScale });
    this.core.part.role = 'core';
    this.bubble = buildShieldBubble(22, 0xff7a9a);
    this.core.mesh.add(this.bubble);
    for (const c of model.userData.colliders) this._collider([c[0], c[1], c[2]], c[3], spin);
    this.beams = [0, 1, 2, 3].map(() => this.game.hazards.makeBeam());
    this.alpha = 0.3;
    this.beamAngle = 0;
    this.beamLen = 760;
    this.axis = new THREE.Vector3(0, 1, 0);
    this.orbT = 3;
    this.speed = 8;
  }

  // Remaining "shield" parts that protect the core.
  get guards() { return this.parts.filter((p) => p.alive && p.part.role !== 'core'); }

  get hpFrac() {
    if (!this.core.alive) return 0;
    if (this.core.shielded) {
      const total = this.parts.reduce((s, p) => s + p.maxHp, 0);
      const left = this.parts.reduce((s, p) => s + (p.alive ? Math.max(0, p.hp) : 0), 0);
      return 0.5 + 0.5 * (left / total);
    }
    return 0.5 * Math.max(0, this.core.hp) / this.core.maxHp;
  }

  get status() {
    if (this.core.shielded) {
      const n = this.guards.length;
      return this.kind === 'dreadnought' ? `TURRETS & BAYS ${n} · CORE SHIELDED` : `SHIELD PYLONS ${n} · CORE SHIELDED`;
    }
    return 'CORE EXPOSED';
  }

  onPartKilled(e) {
    if (e === this.core) return this._beginDeath();
    if (this.core.shielded && this.guards.length === 0) {
      this.core.shielded = false;
      this.phase = 2;
      this.bubble.visible = false;
      this.game.onBossEvent('exposed', { boss: this });
    }
  }

  update(dt, player) {
    this.time += dt;
    this.spawnT += dt;
    if (this.spawnT < 1.5) this.root.scale.setScalar(Math.max(0.01, this.size * this.spawnT / 1.5));
    else this.root.scale.setScalar(this.size);
    if (this.dying > 0) return this._updateDeath(dt);

    _v.subVectors(player.pos, this.root.position);
    const dist = _v.length();
    const toP = _v.multiplyScalar(1 / Math.max(1, dist));
    if (this.kind === 'dreadnought') {
      // Keep the player off the broadside, closing or opening range as needed.
      const tangent = _v2.crossVectors(toP, UP).normalize();
      if (tangent.dot(this.fwd) < 0) tangent.negate();
      const want = tangent.clone();
      if (dist > 620) want.lerp(toP, 0.5);
      else if (dist < 320) want.lerp(toP.clone().negate(), 0.5);
      want.y *= 0.3;
      want.normalize();
      rotateTowards(this.fwd, want, 0.12 * dt);
      const sp = this.speed * (this.phase === 2 ? 1.5 : 1);
      this.vel.copy(this.fwd).multiplyScalar(sp);
      this.root.position.addScaledVector(this.vel, dt);
      _m.lookAt(this.fwd, ORIGIN, UP);
      this.root.quaternion.setFromRotationMatrix(_m);
      for (const s of this.model.userData.engines) s.scale.setScalar(s.userData.baseSize * (0.85 + Math.random() * 0.3));
    } else {
      // Sentinel drifts to a standoff range with its ring turned toward the player (lagging behind).
      const goal = _v2.copy(player.pos).addScaledVector(toP, -400);
      this.vel.subVectors(goal, this.root.position).multiplyScalar(0.25).clampLength(0, this.speed * (this.phase === 2 ? 2 : 1));
      this.root.position.addScaledVector(this.vel, dt);
      this.axis.lerp(toP, 1 - Math.exp(-0.6 * dt)).normalize();
      _m.lookAt(this.axis, ORIGIN, UP);
      this.root.quaternion.setFromRotationMatrix(_m);
      const fast = this.phase === 2 ? 1.45 : 1;
      const spinRate = 0.55 * fast;
      this.model.userData.spin.rotation.z += spinRate * dt;
      const prevAngle = this.beamAngle;
      this.beamAngle += spinRate * dt;
      // Laser spokes ride a cone that slowly closes in on the player and opens out again (an iris).
      this.irisT = (this.irisT || 0) + dt * fast;
      this.alpha = 0.33 * (0.5 - 0.5 * Math.cos(this.irisT * 0.45));
      this.root.updateMatrixWorld(true);
      this._updateBeams(dt, player, prevAngle);
      if (this.phase === 2) {
        this.orbT -= dt;
        if (this.orbT <= 0) {
          this.orbT = 2.6;
          const from = this.core.pos;
          const d = _v.subVectors(player.pos, from).normalize();
          this.game.proj.fireEnemy(from, d, 120, 14 * this.dmgScale, { target: player, turn: 1.1, life: 7, color: 0xff3fa0, scale: 2.4 });
          this.game.onBossEvent('orb', { pos: from });
        }
      }
    }
    // Update collider world positions.
    this.root.updateMatrixWorld(true);
    for (const c of this.colliders) c.pos.copy(c.local).applyMatrix4(c.parent.matrixWorld);
    this.bubble.rotation.y += dt * 0.5;
    if (this.bubble.visible) this.bubble.material.opacity = 0.25 + 0.1 * Math.sin(this.time * 4);
  }

  _updateBeams(dt, player, prevAngle) {
    if (this.spawnT < 2.5) return;
    const center = this.root.position;
    const q = this.root.quaternion;
    const inner = 14 * this.size;
    const sa = Math.sin(this.alpha), ca = Math.cos(this.alpha);
    // Player in the ring's frame: angle off the axis (delta) and azimuth around it (phi).
    const lp = _v2.copy(player.pos).sub(center).applyQuaternion(_qi.copy(q).invert());
    const dist = lp.length();
    const delta = Math.atan2(Math.hypot(lp.x, lp.y), lp.z);
    const phi = Math.atan2(lp.y, lp.x);
    const tolA = 9 / Math.max(dist, 1);
    const onCone = player.alive && dist > inner && dist < this.beamLen && Math.abs(delta - this.alpha) < tolA;
    this.beamCd = (this.beamCd || 0) - dt;
    for (let i = 0; i < 4; i++) {
      const a = this.beamAngle + (i * Math.PI) / 2;
      const dir = _v.set(sa * Math.cos(a), sa * Math.sin(a), ca).applyQuaternion(q);
      const from = center.clone().addScaledVector(dir, inner);
      const to = center.clone().addScaledVector(dir, this.beamLen);
      this.game.hazards.setBeam(this.beams[i], from, to, 4.2, 0xff2a50, 0.9);
      if (onCone && this.beamCd <= 0) {
        // Near the cone axis every spoke is close, so widen the sideways tolerance there.
        const tolZ = Math.min(Math.PI / 4, 9 / Math.max(dist * sa, 1));
        let d = phi - a;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        const swept = this.beamAngle - prevAngle;
        if (d <= tolZ && d >= -swept - tolZ) {
          this.beamCd = 0.9;
          this.game.onBossEvent('beamHit', { damage: 18 * this.dmgScale, from });
        }
      }
    }
  }

  // Called by Enemies.update for each part.
  updatePart(e, dt, player) {
    e.mesh.getWorldPosition(e.pos);
    e.vel.copy(this.vel);
    if (this.dying > 0 || !player.alive || this.spawnT < 2) return;
    if (e.stunT > 0) return;
    const dist = e.pos.distanceTo(player.pos);
    const role = e.part.role;
    if (role === 'turret') {
      e.mesh.lookAt(player.pos);
      if (e.mesh.position.y < 0) e.mesh.rotateZ(Math.PI);
      e.fireCd -= dt;
      e.burstCd -= dt;
      if (e.burstLeft <= 0 && e.fireCd <= 0 && dist < 800) {
        e.burstLeft = 3;
        e.fireCd = rand(2.0, 3.0) / (this.phase === 2 ? 1.4 : 1);
      }
      if (e.burstLeft > 0 && e.burstCd <= 0) {
        e.burstLeft--;
        e.burstCd = 0.16;
        leadPoint(e.pos, player.pos, player.vel, ENEMY_BOLT_SPEED, _aim);
        this.game.enemies.fireBolts(e, e.mesh, e.mesh.userData.muzzles, _aim, 0, player);
      }
    } else if (role === 'bay') {
      e.launchT -= dt;
      if (e.launchT <= 0) {
        e.launchT = rand(10, 13);
        const hornets = this.game.enemies.list.filter((x) => x.alive && x.type === 'hornet').length;
        if (hornets < 7) {
          const out = e.mesh.localToWorld(_v.set(9, 0, 0));
          this.game.spawnEnemy('hornet', out);
          this.game.spawnEnemy('hornet', out.clone().add(randomUnit(_v2).multiplyScalar(6)));
        }
      }
    } else if (role === 'pylon') {
      e.fireCd -= dt;
      if (e.fireCd <= 0 && dist < 700) {
        e.fireCd = rand(2.4, 3.4);
        leadPoint(e.pos, player.pos, player.vel, ENEMY_BOLT_SPEED, _aim);
        this.game.enemies.fireBolts(e, e.mesh, e.mesh.userData.muzzles, _aim, 0, player);
      }
    } else if (role === 'core' && !e.shielded && this.kind === 'dreadnought') {
      e.fireCd -= dt;
      if (e.fireCd <= 0 && dist < 800) {
        e.fireCd = 2.2;
        leadPoint(e.pos, player.pos, player.vel, ENEMY_BOLT_SPEED, _aim);
        this.game.enemies.fireBolts(e, e.mesh, e.mesh.userData.muzzles, _aim, 5, player);
      }
    }
  }

  _beginDeath() {
    this.dying = 2.8;
    this.deathT = 0;
    for (const p of this.parts) if (p.alive) this.game.enemies.kill(p, true);
    for (const b of this.beams) this.game.hazards.hideBeam(b);
    this.game.onBossEvent('dying', { boss: this });
  }

  _updateDeath(dt) {
    this.dying -= dt;
    this.deathT += dt;
    this.root.updateMatrixWorld(true);
    if (Math.random() < dt * 9) {
      const c = this.colliders[(Math.random() * this.colliders.length) | 0];
      c.pos.copy(c.local).applyMatrix4(c.parent.matrixWorld);
      this.game.onBossEvent('chain', { pos: c.pos.clone().add(randomUnit(_v).multiplyScalar(c.r * 0.6)), r: c.r });
    }
    this.root.rotateZ(dt * 0.15);
    if (this.dying <= 0) {
      this.alive = false;
      this.game.onBossEvent('destroyed', { boss: this, pos: this.root.position.clone() });
      this.dispose();
    }
  }

  dispose() {
    this.alive = false;
    for (const p of this.parts) if (p.alive) this.game.enemies.kill(p, true);
    for (const b of this.beams) this.game.hazards.releaseBeam(b);
    this.beams = [];
    const st = this.game.field.statics;
    for (const c of this.colliders) {
      const i = st.indexOf(c);
      if (i >= 0) st.splice(i, 1);
    }
    this.colliders = [];
    this.game.scene.remove(this.root);
  }
}
