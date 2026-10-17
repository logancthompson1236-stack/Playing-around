import * as THREE from 'three';
import { PLAYER, ARENA, POWERUPS } from './config.js';
import { SHIP_BUILDERS, getHullMaterial } from './models.js';
import { computeStats, PRIMARIES, SECONDARIES, UTILITIES } from './content.js';
import { clamp, damp, rand, haptic } from './util.js';
import { audio } from './audio.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _e = new THREE.Euler();

const SHIELD_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){
  vec4 wp = modelMatrix * vec4(position,1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const SHIELD_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uAlpha; uniform float uTime;
varying vec3 vN; varying vec3 vV;
void main(){
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  float hex = 0.6 + 0.4 * sin(vN.x * 40.0 + uTime * 3.0) * sin(vN.y * 40.0) * sin(vN.z * 40.0 - uTime * 2.0);
  gl_FragColor = vec4(uColor * (f * 1.4 + 0.08) * hex * uAlpha, 1.0);
}`;

export class Player {
  constructor(scene, fx, proj) {
    this.scene = scene;
    this.fx = fx;
    this.proj = proj;
    this.mesh = new THREE.Group();
    scene.add(this.mesh);
    this.material = getHullMaterial();
    this.shieldUniforms = { uColor: { value: new THREE.Color(0x4aa8ff) }, uAlpha: { value: 0 }, uTime: { value: 0 } };
    this.shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 16),
      new THREE.ShaderMaterial({
        uniforms: this.shieldUniforms, vertexShader: SHIELD_VERT, fragmentShader: SHIELD_FRAG,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    this.shieldMesh.scale.set(5.6, 3.0, 6.0);
    this.mesh.add(this.shieldMesh);

    this.pos = this.mesh.position;
    this.vel = new THREE.Vector3();
    this.knock = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.up = new THREE.Vector3(0, 1, 0);
    this.levelUp = new THREE.Vector3(0, 1, 0);
    this.timers = { rapid: 0, spread: 0, phase: 0, wingman: 0 };
    this.applyLoadout({ ship: 'kestrel', primary: 'twin', secondary: 'seeker', utility: 'emp', modules: [] });
  }

  setShip(id) {
    if (this.model && this.shipId === id) return;
    if (this.model) this.mesh.remove(this.model);
    this.shipId = id;
    this.model = (SHIP_BUILDERS[id] || SHIP_BUILDERS.kestrel)();
    this.mesh.add(this.model);
    this.engines = this.model.userData.engines;
    this.muzzles = this.model.userData.muzzles;
  }

  // Equip a hangar loadout (ship + weapons + modules) and reset to full stats.
  applyLoadout(loadout) {
    this.loadout = JSON.parse(JSON.stringify(loadout));
    this.base = computeStats(loadout);
    this.primary = PRIMARIES[loadout.primary] || PRIMARIES.twin;
    this.primaryId = loadout.primary;
    this.secondary = SECONDARIES[loadout.secondary] || SECONDARIES.seeker;
    this.secondaryId = loadout.secondary;
    this.utility = UTILITIES[loadout.utility] || UTILITIES.emp;
    this.utilityId = loadout.utility;
    this.setShip(loadout.ship);
    this.resetStats();
  }

  resetStats() {
    const st = this.base;
    this.maxHull = st.hull;
    this.maxShield = st.shield;
    this.shieldRegen = PLAYER.shieldRegen * st.regenMul;
    this.shieldDelay = PLAYER.shieldDelay;
    this.maxBoost = st.boostCap;
    this.boostRegen = PLAYER.boostRegen * st.boostRegenMul;
    this.cruise = st.cruise;
    this.boostSpeed = st.boostSpeed;
    this.turn = st.turn;
    this.accel = st.accel;
    this.collisionMul = st.collision;
    this.evasion = st.evasion;
    this.lockSpeed = st.lockSpeed;
    this.homingMul = st.homingMul;
    this.creditMul = st.creditMul;
    this.damageMul = 1;
    this.rateMul = 1;
    this.agility = 1;
    this.magnet = st.magnet;
    this.puDur = 1;
    this.abilityPower = 1;
    const cap = this.secondary.capMul;
    this.maxMissiles = Math.max(2, Math.round((PLAYER.maxMissiles + st.missileBonus) * cap));
    this.missiles = Math.min(this.maxMissiles, Math.round(PLAYER.missiles * cap) + Math.round(st.missileBonus * cap * 0.5));
    this.maxCharges = this.utility.max + st.utilityBonus;
    this.charges = Math.min(this.maxCharges, this.utility.start + Math.min(1, st.utilityBonus));
    this.chargeTimer = 0;
    this.hull = this.maxHull;
    this.shield = this.maxShield;
    this.boost = this.maxBoost;
  }

  spawn(pos, yaw) {
    this.pos.copy(pos);
    this.yaw = yaw;
    this.pitch = 0;
    this.roll = 0;
    this.yawRate = 0;
    this.pitchRate = 0;
    this.speed = this.cruise;
    this.vel.set(0, 0, 0);
    this.knock.set(0, 0, 0);
    this.fireCd = 0;
    this.gunSide = 0;
    this.sinceHit = 99;
    for (const k in this.timers) this.timers[k] = 0;
    this.alive = true;
    this.boosting = false;
    this.braking = false;
    this.shieldFlash = 0;
    this.outOfBounds = 0;
    this.dashT = 0;
    this.mesh.visible = true;
    this.invuln = 1.5;
    this._applyOrientation();
  }

  // True while the ship ignores rock collisions (phase shield or dashing).
  get ghost() { return this.timers.phase > 0 || this.dashT > 0; }

  _applyOrientation() {
    this.mesh.rotation.set(-this.pitch, this.yaw, this.roll, 'YXZ');
    this.forward.set(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(this.mesh.quaternion);
    _e.set(-this.pitch, this.yaw, 0, 'YXZ');
    this.levelUp.set(0, 1, 0).applyEuler(_e);
  }

  update(dt, input, settings, time) {
    if (!this.alive) return;
    const sens = settings.sensitivity;
    let sx = input.stick.x, sy = input.stick.y * (settings.invertY ? -1 : 1);

    // Boundary assist: steer back toward the sector when outside.
    const hr = Math.hypot(this.pos.x, this.pos.z);
    const over = Math.max(hr - ARENA.radius, Math.abs(this.pos.y) - ARENA.halfHeight);
    this.outOfBounds = over > 0 ? over : 0;
    let assistYaw = 0, assistPitch = 0;
    if (over > 0) {
      const k = clamp(over / 160, 0, 1);
      _v.set(-this.pos.x, -this.pos.y * 0.5, -this.pos.z).normalize();
      const wantYaw = Math.atan2(_v.x, _v.z);
      let dy = wantYaw - this.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      assistYaw = clamp(dy, -1, 1) * 2.2 * k;
      assistPitch = clamp(Math.asin(clamp(_v.y, -1, 1)) - this.pitch, -1, 1) * 1.8 * k;
      sx *= 1 - k * 0.8;
      sy *= 1 - k * 0.8;
    }

    const agi = this.agility * this.turn * sens;
    const tYaw = -sx * PLAYER.yawRate * agi + assistYaw;
    const tPitch = sy * PLAYER.pitchRate * agi + assistPitch;
    const resp = 7 + 3 * this.accel; // nimbler ships settle into turns faster
    this.yawRate = damp(this.yawRate, tYaw, resp, dt);
    this.pitchRate = damp(this.pitchRate, tPitch, resp, dt);
    this.yaw += this.yawRate * dt;
    this.pitch = clamp(this.pitch + this.pitchRate * dt, -PLAYER.maxPitch, PLAYER.maxPitch);
    this.roll = damp(this.roll, -this.yawRate * 0.42 - sx * 0.12, 6, dt);
    this._applyOrientation();

    // Throttle.
    const wantBoost = input.boost && this.boost > 1;
    if (wantBoost && !this.boosting) {
      audio.boost();
      haptic(15);
    }
    this.boosting = wantBoost;
    this.braking = input.brake && !wantBoost;
    let target = this.cruise * (0.92 + 0.08 * this.agility);
    if (this.boosting) {
      target = this.boostSpeed * (0.9 + 0.1 * this.agility);
      this.boost = Math.max(0, this.boost - PLAYER.boostDrain * dt);
    } else {
      if (this.braking) target = PLAYER.brakeSpeed;
      this.boost = Math.min(this.maxBoost, this.boost + this.boostRegen * dt);
    }
    if (this.dashT > 0) {
      this.dashT -= dt;
      target = 430;
      this.speed = Math.max(this.speed, 380);
    }
    this.speed = damp(this.speed, target, (this.boosting ? 3 : 2.2) * this.accel, dt);
    this.knock.multiplyScalar(Math.exp(-3 * dt));
    this.vel.copy(this.forward).multiplyScalar(this.speed).add(this.knock);
    this.pos.addScaledVector(this.vel, dt);

    // Shields, timers, ability recharge.
    this.sinceHit += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.sinceHit > this.shieldDelay && this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegen * dt);
    }
    if (this.shield > this.maxShield) this.shield = Math.max(this.maxShield, this.shield - 3 * dt);
    for (const k in this.timers) if (this.timers[k] > 0) this.timers[k] = Math.max(0, this.timers[k] - dt);
    if (this.charges < this.maxCharges) {
      this.chargeTimer += dt;
      if (this.chargeTimer >= PLAYER.chargeRecharge) {
        this.chargeTimer = 0;
        this.charges++;
      }
    } else this.chargeTimer = 0;

    // Visuals: engine flames, shield shimmer, phase ghosting.
    const thrust = this.dashT > 0 ? 2.6 : this.boosting ? 1.9 : this.braking ? 0.45 : 1;
    for (const s of this.engines) {
      const f = s.userData.baseSize * thrust * (0.85 + Math.random() * 0.3);
      s.scale.set(f, f, f);
    }
    this.shieldFlash = Math.max(0, this.shieldFlash - dt * 2.5);
    const phase = this.ghost;
    this.shieldUniforms.uAlpha.value = Math.max(this.shieldFlash, phase ? 0.55 : 0, this.invuln > 0 ? 0.35 : 0);
    this.shieldUniforms.uColor.value.set(phase ? 0xe8f6ff : this.shield > this.maxShield ? 0x7affff : 0x4aa8ff);
    this.shieldUniforms.uTime.value = time;
    this.material.transparent = phase;
    this.material.opacity = phase ? 0.45 + 0.15 * Math.sin(time * 12) : 1;

    // Engine trail particles.
    for (const s of this.engines) {
      s.getWorldPosition(_v);
      _v2.copy(this.forward).multiplyScalar(-20).addScaledVector(this.vel, 0.3);
      const col = this.dashT > 0 ? 0xe8f6ff : this.boosting ? 0xffb050 : s.material.color.getHex();
      this.fx.trail(_v, _v2, col, this.boosting || this.dashT > 0 ? 2.6 : 1.6, this.boosting ? 0.4 : 0.25);
    }
  }

  // Fires the equipped cannon. `aim` (optional) is a world-space point to converge on.
  // `homing` (optional) is a locked enemy the bolts will curve toward.
  fire(aim, damageScale = 1, homing = null) {
    const P = this.primary;
    const rapid = this.timers.rapid > 0;
    this.fireCd = P.interval / this.rateMul / (rapid ? 1.75 : 1);
    this.gunSide ^= 1;
    const m = _v.copy(this.muzzles[this.gunSide % this.muzzles.length]);
    this.model.localToWorld(m);
    const base = new THREE.Vector3();
    if (aim) base.subVectors(aim, m).normalize();
    else base.copy(this.pos).addScaledVector(this.forward, 260).sub(m).normalize();
    const dmg = P.damage * this.damageMul * damageScale;
    const inherit = _v2.copy(this.forward).multiplyScalar(this.speed * 0.9);
    const life = homing ? P.life * 1.45 : P.life;
    const turn = homing ? PLAYER.homingTurn * P.homing * this.homingMul : 0;
    const opts = { color: P.color, pierce: !!P.pierce };
    const side = new THREE.Vector3().crossVectors(this.forward, this.up).normalize();
    const dirs = [];
    if (P.pellets > 1) {
      for (let i = 0; i < P.pellets; i++) {
        const d = base.clone().addScaledVector(side, rand(-1, 1) * P.spread).addScaledVector(this.up, rand(-1, 1) * P.spread * 0.7);
        dirs.push([d.normalize(), 1]);
      }
    } else {
      dirs.push([base, 1]);
      if (this.timers.spread > 0) for (const s of [-1, 1]) dirs.push([base.clone().addScaledVector(side, s * 0.07).normalize(), 0.75]);
    }
    for (const [d, k] of dirs) this.proj.firePlayer(m, d, P.speed, dmg * k, life, inherit, homing, turn * (k < 1 ? 0.7 : 1), opts);
    if (P.pellets > 1 && this.timers.spread > 0) this.fireCd *= 0.75; // spread power-up speeds up the shotgun instead
    this.fx.flash(m, P.pellets > 1 || P.pierce ? 7 : 4, homing ? 0xffd27a : P.color, 0.06);
    audio.laser(this.gunSide ? -0.25 : 0.25, !!homing, this.primaryId);
  }

  applyPowerup(type) {
    const def = POWERUPS[type];
    switch (type) {
      case 'repair': this.hull = Math.min(this.maxHull, this.hull + this.maxHull * 0.4); break;
      case 'shield': this.shield = Math.max(this.shield, this.maxShield * 1.5); this.shieldFlash = 1; break;
      case 'missile': this.missiles = Math.min(this.maxMissiles, this.missiles + Math.max(2, Math.round(4 * this.secondary.capMul))); break;
      case 'charge': this.charges = Math.min(this.maxCharges, this.charges + 1); break;
      default: if (def.timed) this.timers[type] = def.timed * this.puDur;
    }
  }

  // Returns 'shield' | 'hull' | 'dead' | null
  damage(amount) {
    if (!this.alive || this.godMode || this.timers.phase > 0 || this.dashT > 0 || this.invuln > 0) return null;
    this.sinceHit = 0;
    let result = 'shield';
    if (this.shield > 0) {
      const a = Math.min(this.shield, amount);
      this.shield -= a;
      amount -= a;
      this.shieldFlash = 1;
      audio.shieldHit();
    }
    if (amount > 0) {
      this.hull -= amount;
      result = 'hull';
      audio.hullHit();
      haptic(40);
    } else haptic(12);
    if (this.hull <= 0) {
      this.hull = 0;
      this.alive = false;
      return 'dead';
    }
    return result;
  }

  get hullFrac() { return this.hull / this.maxHull; }
}
