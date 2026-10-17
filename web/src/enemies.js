import * as THREE from 'three';
import { ENEMIES, ARENA } from './config.js';
import { ENEMY_BUILDERS, PART_BUILDERS, getHullMaterial } from './models.js';
import { rand, randomUnit, rotateTowards, leadPoint, clamp, damp, pick, segPointDistSq } from './util.js';

const ORIGIN = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const Zaxis = new THREE.Vector3(0, 0, 1);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _toP = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _avoid = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _aimDir = new THREE.Vector3();
const _prev = new THREE.Vector3();
export const ENEMY_BOLT_SPEED = 300;

let uid = 1;

// Break-off maneuvers after an attack run, so ships scatter instead of queueing behind each other.
const BREAKS = ['climb', 'dive', 'split', 'loop'];

export class Enemies {
  constructor(scene, fx, proj, field, hazards) {
    this.scene = scene;
    this.fx = fx;
    this.proj = proj;
    this.field = field;
    this.hazards = hazards;
    this.list = [];
    this.sector = 1;
    this.onKilled = null;   // (e) => void
    this.onFire = null;     // (e) => void   (gun sound)
    this.onEvent = null;    // (name, e, extra) => void  (beams, mines, kamikaze, detonations)
    this.time = 0;
  }

  get aliveCount() {
    let n = 0;
    for (const e of this.list) if (e.alive && !e.part) n++;
    return n;
  }

  _base(type, def, mesh, mat) {
    return {
      id: uid++, type, def, mesh, mat, pos: mesh.position,
      vel: new THREE.Vector3(), fwd: randomUnit(new THREE.Vector3()),
      hp: def.hp, maxHp: def.hp, damage: def.damage, accuracy: 0.03, fireRateMul: 1,
      speed: def.speed, radius: def.radius,
      state: 'engage', timer: rand(1.5, 3.5), breakDir: new THREE.Vector3(), breakKind: 'split',
      flank: randomUnit(new THREE.Vector3()), flankT: rand(3, 6), standoff: rand(200, 320),
      orbitAxis: randomUnit(new THREE.Vector3()), weave: rand(0, 6.28),
      fireCd: rand(1, 2.5), burstLeft: 0, burstCd: 0, gun: 0,
      bank: 0, flash: 0, spawnT: 0, alive: true, token: false, behindT: 0,
      jink: new THREE.Vector3(), jinkT: 0,
      stunT: 0, tumbleAxis: new THREE.Vector3(), tumbleRate: 0,
      mineCd: rand(1.5, 3), beam: null, chargeT: 0, beamFade: 0,
      beamFrom: new THREE.Vector3(), beamDir: new THREE.Vector3(),
      part: null, shielded: false,
    };
  }

  // `diff` is a DIFFICULTY preset from config.js.
  spawn(type, pos, sector, diff) {
    const def = ENEMIES[type];
    const mat = getHullMaterial().clone();
    mat.emissive = new THREE.Color(0x000000);
    const mesh = ENEMY_BUILDERS[type](mat);
    mesh.position.copy(pos);
    mesh.scale.setScalar(0.01);
    this.scene.add(mesh);
    const e = this._base(type, def, mesh, mat);
    const hpScale = (1 + 0.14 * (sector - 1)) * diff.hp;
    e.hp = e.maxHp = def.hp * hpScale;
    e.damage = def.damage * (1 + 0.08 * (sector - 1)) * diff.damage;
    e.accuracy = Math.max(0.014, 0.04 - sector * 0.004) * diff.accuracy;
    e.fireRateMul = (1 + 0.05 * (sector - 1)) * diff.fireRate;
    e.speed = def.speed * Math.min(1.25, 1 + 0.03 * (sector - 1)) * diff.speed;
    if (type === 'lancer') e.standoff = rand(150, 230);
    if (type === 'warden') e.standoff = rand(330, 420);
    if (type === 'spinner') e.standoff = rand(360, 480);
    if (type === 'longbow') e.standoff = rand(620, 820);
    if (type === 'hornet') e.state = 'attack';
    this.list.push(e);
    const warpCol = type === 'warden' ? 0xffa040 : type === 'hornet' ? 0xff3020 : 0xff5050;
    this.fx.warp(pos, warpCol, type === 'warden' ? 1.6 : type === 'hornet' ? 0.6 : 1);
    return e;
  }

  // Boss components (turrets, bays, pylons, cores) ride on a boss root and are updated by it.
  spawnPart(kind, boss, offset, hp, opts = {}) {
    const mat = getHullMaterial().clone();
    mat.emissive = new THREE.Color(0x000000);
    const mesh = PART_BUILDERS[kind](mat, opts.color, opts.r);
    boss.root.add(mesh);
    mesh.position.fromArray(offset);
    const def = {
      name: kind, hp, speed: 0, turn: 0, radius: opts.radius || 5, score: opts.score || 300,
      drop: opts.drop ?? 0.6, credits: opts.credits || 15, damage: opts.damage || 8,
    };
    const e = this._base(kind, def, mesh, mat);
    // Parts live in the boss's local space; `pos` tracks their world position every frame.
    e.pos = new THREE.Vector3();
    boss.root.updateMatrixWorld(true);
    mesh.getWorldPosition(e.pos);
    e.hp = e.maxHp = hp;
    e.part = { boss, kind, offset: new THREE.Vector3().fromArray(offset) };
    e.spawnT = 5;
    e.shielded = !!opts.shielded;
    e.fireCd = rand(1, 3);
    this.list.push(e);
    return e;
  }

  damage(e, amount) {
    if (!e.alive) return false;
    if (e.shielded) {
      e.flash = 0.05;
      return false;
    }
    if (e.stunT > 0) amount *= 1.5; // disabled ships are easy prey
    e.hp -= amount;
    e.flash = 0.1;
    if (e.hp <= 0) {
      this.kill(e);
      return true;
    }
    return false;
  }

  // EMP: knock systems offline. Ships drift and tumble and can't steer or fire.
  stun(e, seconds) {
    if (!e.alive) return;
    e.burstLeft = 0;
    if (e.part) { e.stunT = Math.max(e.stunT, seconds * 0.5); return; }
    e.stunT = Math.max(e.stunT, seconds);
    e.chargeT = 0;
    e.token = false;
    if (e.beam) this.hazards.hideBeam(e.beam);
    e.tumbleAxis.copy(randomUnit(_v));
    e.tumbleRate = rand(1.2, 2.6) * (e.type === 'warden' ? 0.4 : 1);
  }

  kill(e, silent = false) {
    if (!e.alive) return;
    e.alive = false;
    e.token = false;
    if (e.beam) { this.hazards.releaseBeam(e.beam); e.beam = null; }
    if (e.mesh.parent) e.mesh.parent.remove(e.mesh);
    e.mat.dispose();
    if (!silent && this.onKilled) this.onKilled(e);
  }

  clear() {
    for (const e of this.list) if (e.alive) this.kill(e, true);
    this.list.length = 0;
  }

  _maxAttackers() { return Math.min(5, 3 + Math.floor((this.sector - 1) / 2)); }

  update(dt, player) {
    this.time += dt;
    let w = 0;
    for (const e of this.list) if (e.alive) this.list[w++] = e;
    this.list.length = w;
    let attackers = 0;
    for (const e of this.list) if (e.token) attackers++;
    const maxAtk = this._maxAttackers();

    for (const e of this.list) {
      if (!e.alive) continue;
      e.spawnT += dt;
      if (e.part) {
        e.part.boss.updatePart(e, dt, player);
        this._flash(e, dt);
        continue;
      }
      if (e.spawnT < 0.6) e.mesh.scale.setScalar(Math.max(0.01, e.spawnT / 0.6));
      else e.mesh.scale.setScalar(1);

      if (e.stunT > 0) { this._updateStunned(e, dt); continue; }

      _toP.subVectors(player.pos, e.pos);
      const dist = _toP.length();
      _toP.multiplyScalar(1 / Math.max(dist, 0.001));
      leadPoint(e.pos, player.pos, player.vel, ENEMY_BOLT_SPEED, _aim);
      _aimDir.subVectors(_aim, e.pos).normalize();
      e.timer -= dt;
      e.weave += dt * 1.3;

      // Slowly drift each ship's personal flank direction so routes vary over time.
      e.flankT -= dt;
      if (e.flankT <= 0) {
        e.flankT = rand(4, 8);
        e.flank.lerp(randomUnit(_v), 0.6).normalize();
      }

      if (!player.alive) _desired.copy(e.fwd);
      else {
        // Wanting to attack? Ask for a token so only a few ships press in at once.
        if (e.state === 'engage' && e.timer <= 0 && (e.type === 'raider' || e.type === 'lancer')) {
          if (attackers < maxAtk) {
            e.token = true;
            attackers++;
            e.state = 'attack';
            e.timer = rand(3.5, 5.5);
            e.behindT = 0;
          } else e.timer = rand(0.8, 1.6);
        }
        const had = e.token;
        this._steer(e, dist, player, dt);
        if (!e.alive) continue;
        if (had && !e.token) attackers--;
      }

      // Evasion: jink when the player has us in their sights.
      if (player.alive && e.state !== 'break' && e.type !== 'hornet') {
        const inSights = -_toP.dot(player.forward) > 0.97 && dist < 600;
        e.jinkT -= dt;
        if (inSights && e.jinkT <= 0) {
          e.jinkT = rand(0.5, 1.1);
          e.jink.copy(randomUnit(_v)).addScaledVector(_toP, -_toP.dot(e.jink)).normalize();
        }
        if (e.jinkT > 0 && inSights) _desired.addScaledVector(e.jink, e.type === 'warden' ? 0.3 : 0.8).normalize();
      }

      this._avoid(e);
      _desired.add(_avoid);
      const hr = Math.hypot(e.pos.x, e.pos.z);
      if (hr > ARENA.radius * 0.98 || Math.abs(e.pos.y) > ARENA.halfHeight) _desired.addScaledVector(_v.copy(e.pos).negate().normalize(), 2);
      if (_desired.lengthSq() < 1e-6) _desired.copy(e.fwd);
      _desired.normalize();

      _prev.copy(e.fwd);
      const turn = e.def.turn * (e.state === 'break' ? 1.25 : 1) * (e.chargeT > 0 ? 0.4 : 1);
      rotateTowards(e.fwd, _desired, turn * dt);
      let sp = e.speed * (dist > 750 ? 1.5 : 1) * (e.spawnT < 0.6 ? 0.2 : 1);
      if (e.type === 'hornet' && dist < 160) sp *= 1.35;
      if (e.chargeT > 0) sp *= 0.3;
      e.vel.copy(e.fwd).multiplyScalar(sp);
      e.pos.addScaledVector(e.vel, dt);

      this._orient(e, dt);
      this._flash(e, dt);
      this._engines(e, dist);
      if (player.alive && e.spawnT >= 1) this._weapons(e, dt, dist, player);
    }
  }

  // ---- Steering by type ----
  _steer(e, dist, player, dt) {
    const toP = _toP;
    switch (e.type) {
      case 'raider':
      case 'lancer': {
        if (e.state === 'attack') {
          _desired.copy(_aimDir);
          // Don't camp on the player's tail; peel off after a couple of seconds there.
          const behind = toP.dot(player.forward) > 0.6 && dist < 260;
          e.behindT = behind ? e.behindT + dt : Math.max(0, e.behindT - dt);
          if (dist < (e.type === 'lancer' ? 95 : 70) || e.timer <= 0 || e.behindT > 2.5) this._startBreak(e, toP);
        } else if (e.state === 'break') {
          this._breakSteer(e, toP, dt);
          if (e.timer <= 0) { e.state = 'engage'; e.timer = rand(0.8, 2.2); }
        } else if (e.type === 'lancer') {
          this._orbit(e, toP, dist, e.standoff, 1);
        } else {
          // Engage: fly a personal flanking route around the player, weaving.
          _v.copy(player.pos).addScaledVector(e.flank, e.standoff);
          _desired.subVectors(_v, e.pos).normalize();
          _v2.crossVectors(_desired, UP).normalize();
          _desired.addScaledVector(_v2, Math.sin(e.weave) * 0.45).normalize();
          if (dist > e.standoff * 1.6) _desired.lerp(toP, 0.4).normalize();
        }
        break;
      }
      case 'warden': {
        if (dist < e.standoff * 0.65) {
          _v.crossVectors(toP, e.orbitAxis).normalize();
          _desired.copy(_v).addScaledVector(toP, -0.8).normalize();
        } else if (dist < e.standoff * 1.2) {
          _desired.copy(_aimDir).lerp(_v.crossVectors(toP, e.orbitAxis).normalize(), 0.4).normalize();
        } else _desired.copy(toP);
        break;
      }
      case 'hornet': {
        // Kamikaze run with a weaving approach that tightens as it closes.
        _desired.copy(_aimDir);
        const amp = clamp(dist / 400, 0, 1) * 0.7;
        _v.crossVectors(toP, e.orbitAxis).normalize();
        _desired.addScaledVector(_v, Math.sin(e.weave * 2.4) * amp).normalize();
        if (dist < 9 + e.radius) this.detonate(e);
        else if (dist < 120 && this.onEvent && Math.random() < dt * 8) this.onEvent('kamikaze', e);
        break;
      }
      case 'spinner': {
        // Shadow the player's flight path from a distance and seed it with mines.
        _v.copy(player.pos).addScaledVector(player.vel, 2.2).addScaledVector(e.flank, e.standoff * 0.6);
        _desired.subVectors(_v, e.pos).normalize();
        if (dist < 220) _desired.lerp(_v.copy(toP).negate(), 0.6).normalize();
        e.mineCd -= dt;
        if (e.mineCd <= 0 && dist < 700 && e.spawnT > 1) {
          e.mineCd = e.def.mineCooldown * rand(0.8, 1.3);
          const dp = e.mesh.localToWorld(_v3.copy(e.mesh.userData.dropPoint));
          this.hazards.dropMine(dp, _v2.copy(e.vel).multiplyScalar(0.3).add(randomUnit(_v).multiplyScalar(6)));
          if (this.onEvent) this.onEvent('mine', e);
        }
        break;
      }
      case 'longbow': this._steerSniper(e, dist, player, dt); break;
    }
  }

  _steerSniper(e, dist, player, dt) {
    const toP = _toP;
    if (e.chargeT > 0) {
      // Charging: track the player, then hold the line for the last moment so it can be dodged.
      _desired.copy(toP);
      e.chargeT -= dt;
      const muzzle = e.mesh.localToWorld(_v3.copy(e.mesh.userData.muzzles[0]));
      e.beamFrom.copy(muzzle);
      if (e.chargeT > 0.45) e.beamDir.subVectors(player.pos, muzzle).normalize();
      const end = _v.copy(muzzle).addScaledVector(e.beamDir, 1100);
      const locked = e.chargeT <= 0.45;
      this.hazards.setBeam(e.beam, muzzle, end, locked ? 0.9 : 0.5, 0xff2030, locked ? 0.9 : 0.3 + 0.2 * Math.random());
      if (e.chargeT <= 0) this._fireBeam(e, player);
      return;
    }
    if (e.state === 'beamcool') {
      if (e.beamFade > 0) {
        e.beamFade -= dt;
        const end = _v.copy(e.beamFrom).addScaledVector(e.beamDir, 1100);
        if (e.beamFade > 0) this.hazards.setBeam(e.beam, e.beamFrom, end, 3.2 * e.beamFade / 0.3, 0xff5040, e.beamFade / 0.3);
        else this.hazards.hideBeam(e.beam);
      }
      this._orbit(e, toP, dist, e.standoff, 0.6);
      if (e.timer <= 0) { e.state = 'engage'; e.timer = rand(1, 2.5); }
      return;
    }
    this._orbit(e, toP, dist, e.standoff, 0.5);
    if (e.timer <= 0 && dist < e.def.range && dist > 250 && e.fwd.dot(toP) > 0.5) {
      e.chargeT = e.def.charge;
      if (!e.beam) e.beam = this.hazards.makeBeam();
      e.beamDir.copy(toP);
      if (this.onEvent) this.onEvent('beamCharge', e);
    }
  }

  _orbit(e, toP, dist, radius, weave) {
    _v.crossVectors(toP, e.orbitAxis).normalize();
    _desired.copy(_v).addScaledVector(toP, clamp((dist - radius) / 90, -1, 1));
    _v2.crossVectors(_v, toP).normalize();
    _desired.addScaledVector(_v2, Math.sin(e.weave) * weave * 0.5).normalize();
  }

  _startBreak(e, toP) {
    e.state = 'break';
    e.timer = rand(1.6, 2.6);
    e.breakKind = pick(BREAKS);
    e.token = false;
    const side = _v.crossVectors(toP, UP);
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    side.normalize();
    if (Math.random() < 0.5) side.negate();
    switch (e.breakKind) {
      case 'climb': e.breakDir.copy(UP).multiplyScalar(1.2).addScaledVector(side, 0.5).addScaledVector(toP, -0.4); break;
      case 'dive': e.breakDir.copy(UP).multiplyScalar(-1.2).addScaledVector(side, 0.5).addScaledVector(toP, -0.4); break;
      case 'split': e.breakDir.copy(side).addScaledVector(toP, -0.6); break;
      default: e.breakDir.copy(UP).addScaledVector(toP, 0.6); break; // loop: pull up and over
    }
    e.breakDir.normalize();
    e.flank.copy(randomUnit(_v));
  }

  _breakSteer(e, toP, dt) {
    if (e.breakKind === 'loop') rotateTowards(e.breakDir, _v.copy(toP).negate(), 1.2 * dt);
    _desired.copy(e.breakDir);
  }

  _fireBeam(e, player) {
    e.state = 'beamcool';
    e.timer = e.def.fireCooldown * rand(0.9, 1.3) / e.fireRateMul;
    e.beamFade = 0.3;
    const end = _v.copy(e.beamFrom).addScaledVector(e.beamDir, 1100);
    const hit = player.alive && segPointDistSq(e.beamFrom, end, player.pos) < 4.5 * 4.5;
    if (this.onEvent) this.onEvent('beamFire', e, { hit, from: e.beamFrom.clone(), to: end.clone() });
  }

  detonate(e) {
    if (!e.alive) return;
    const pos = e.pos.clone();
    this.kill(e, true);
    this.fx.explosion(pos, 0.9, 0xff4020);
    if (this.onEvent) this.onEvent('detonate', e, { pos, radius: 24, damage: e.damage });
  }

  _updateStunned(e, dt) {
    e.stunT -= dt;
    e.vel.multiplyScalar(Math.exp(-0.7 * dt));
    e.pos.addScaledVector(e.vel, dt);
    _q.setFromAxisAngle(e.tumbleAxis, e.tumbleRate * dt);
    e.mesh.quaternion.premultiply(_q);
    e.fwd.set(0, 0, 1).applyQuaternion(e.mesh.quaternion);
    e.mat.emissive.setRGB(0.25, 0.6, 1).multiplyScalar(0.25 + 0.5 * Math.random());
    for (const s of e.mesh.userData.engines) s.scale.setScalar(s.userData.baseSize * 0.2 * Math.random());
    if (Math.random() < 0.2) this.fx.sparks(e.pos, 0x9fe6ff, 3, 22);
    if (e.stunT <= 0) {
      e.mat.emissive.setRGB(0, 0, 0);
      e.fireCd = Math.max(e.fireCd, 1.2);
      e.state = e.type === 'hornet' ? 'attack' : 'engage';
      e.timer = rand(1, 2);
    }
  }

  _avoid(e) {
    const look = e.speed * 1.7 + e.radius * 2;
    _avoid.set(0, 0, 0);
    _v.copy(e.pos).addScaledVector(e.fwd, look * 0.5);
    this.field.query(_v, look * 0.5 + 60, (a) => {
      const relx = a.pos.x - e.pos.x, rely = a.pos.y - e.pos.y, relz = a.pos.z - e.pos.z;
      const t = relx * e.fwd.x + rely * e.fwd.y + relz * e.fwd.z;
      const ar = a.tier === 'X' ? a.r * 1.15 : a.r * 0.95;
      if (t < -ar || t > look + ar) return;
      const cx = e.pos.x + e.fwd.x * t - a.pos.x, cy = e.pos.y + e.fwd.y * t - a.pos.y, cz = e.pos.z + e.fwd.z * t - a.pos.z;
      const d = Math.hypot(cx, cy, cz);
      const clear = ar + e.radius + 10;
      if (d < clear) {
        const s = (1 - Math.max(0, t) / (look + ar)) * 3.5 * (1 - d / clear + 0.3);
        if (d > 0.01) { _avoid.x += (cx / d) * s; _avoid.y += (cy / d) * s; _avoid.z += (cz / d) * s; }
        else _avoid.y += s;
      }
    });
    // Separation: spread out so ships don't fly nose-to-tail.
    for (const o of this.list) {
      if (o === e || o.part || !o.alive) continue;
      const dx = e.pos.x - o.pos.x, dy = e.pos.y - o.pos.y, dz = e.pos.z - o.pos.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 3600 && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const k = (1 - d / 60) * 1.4;
        _avoid.x += (dx / d) * k; _avoid.y += (dy / d) * k; _avoid.z += (dz / d) * k;
      }
    }
  }

  _orient(e, dt) {
    const yawRate = _v.crossVectors(_prev, e.fwd).dot(UP) / Math.max(dt, 1e-4);
    e.bank = damp(e.bank, clamp(-yawRate * 0.7, -1.1, 1.1), 4, dt);
    _m.lookAt(e.fwd, ORIGIN, UP);
    e.mesh.quaternion.setFromRotationMatrix(_m);
    _q.setFromAxisAngle(Zaxis, e.type === 'spinner' ? this.time * 2 : e.bank);
    e.mesh.quaternion.multiply(_q);
  }

  _flash(e, dt) {
    if (e.part && e.stunT > 0) e.stunT -= dt;
    if (e.flash > 0) {
      e.flash -= dt;
      if (e.shielded) e.mat.emissive.setRGB(0.3, 0.7, 1).multiplyScalar(Math.max(0, e.flash) * 12);
      else e.mat.emissive.setRGB(1, 0.6, 0.4).multiplyScalar(Math.max(0, e.flash) * 10);
    } else if (e.stunT <= 0) e.mat.emissive.setRGB(0, 0, 0);
  }

  _engines(e, dist) {
    const eng = e.mesh.userData.engines;
    for (const s of eng) {
      const f = s.userData.baseSize * (0.8 + Math.random() * 0.4) * (dist > 750 ? 1.5 : 1);
      s.scale.set(f, f, f);
    }
    if (eng.length && Math.random() < 0.5) {
      eng[0].getWorldPosition(_v);
      this.fx.trail(_v, _v2.copy(e.fwd).multiplyScalar(-15), eng[0].material.color.getHex(), e.type === 'hornet' ? 1.1 : 1.5, 0.25);
    }
  }

  _weapons(e, dt, dist, player) {
    const def = e.def;
    if (!def.burst || e.type === 'longbow') return;
    // Ships that aren't on an attack run fire less often.
    const eager = e.state === 'attack' || e.type === 'warden' || e.type === 'spinner';
    e.fireCd -= dt * e.fireRateMul * (eager ? 1 : 0.85);
    e.burstCd -= dt;
    const facing = e.fwd.dot(_aimDir);
    if (e.burstLeft <= 0 && e.fireCd <= 0 && dist < def.range && facing > 0.87) {
      e.burstLeft = def.burst;
      e.fireCd = def.fireCooldown * rand(0.85, 1.35);
    }
    if (e.burstLeft > 0 && e.burstCd <= 0) {
      e.burstLeft--;
      e.burstCd = def.burstGap;
      this.fireBolts(e, e.mesh, e.mesh.userData.muzzles, _aim, def.spread, player);
    }
  }

  // Shared gun logic for ships and boss turrets.
  fireBolts(e, mesh, muzzles, aimPoint, spread, player, speed = ENEMY_BOLT_SPEED) {
    e.gun = (e.gun + 1) % muzzles.length;
    const mz = mesh.localToWorld(_v.copy(muzzles[e.gun]));
    const base = new THREE.Vector3().subVectors(aimPoint, mz).normalize();
    const shots = spread > 1 ? spread : 1;
    const side = new THREE.Vector3().crossVectors(base, UP).normalize();
    const inacc = e.accuracy * (1 + (player.evasion || 0));
    for (let i = 0; i < shots; i++) {
      const off = shots > 1 ? (i - (shots - 1) / 2) * 0.09 : 0;
      const d = base.clone().addScaledVector(side, off);
      d.add(randomUnit(new THREE.Vector3()).multiplyScalar(inacc)).normalize();
      this.proj.fireEnemy(mz, d, speed, e.damage);
    }
    this.fx.flash(mz, 5, 0xff5040, 0.08);
    if (this.onFire) this.onFire(e);
  }
}
