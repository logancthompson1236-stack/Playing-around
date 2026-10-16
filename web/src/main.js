import * as THREE from 'three';
import { ARENA, PLAYER, THEMES, ASTEROID_TIERS, POWERUPS, UPGRADES, WAVES_PER_SECTOR, waveComposition } from './config.js';
import { audio } from './audio.js';
import { World } from './world.js';
import { Effects } from './particles.js';
import { AsteroidField } from './asteroids.js';
import { Projectiles } from './projectiles.js';
import { Player } from './player.js';
import { Enemies } from './enemies.js';
import { Powerups, randomPowerupType } from './powerups.js';
import { HUD } from './hud.js';
import { Input } from './input.js';
import { UI, loadSettings, loadBest, saveBest } from './ui.js';
import { buildWarpGate } from './models.js';
import { clamp, damp, rand, randomUnit, chance, leadPoint, segPointDistSq, haptic, getGlowTexture } from './util.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _camRight = new THREE.Vector3();

const PLAYER_CAUSES = new Set(['player', 'missile', 'nova', 'ram', 'blast']);

class Game {
  constructor() {
    const settings = (this.settings = loadSettings());
    window.__settings = settings;
    this.best = loadBest();
    const q = (this.quality = settings.quality);

    const canvas = document.getElementById('gl');
    const renderer = (this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: q > 0, powerPreference: 'high-performance', stencil: false,
    }));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const dpr = window.devicePixelRatio || 1;
    this.maxPR = q === 0 ? Math.min(dpr, 1) : q === 1 ? Math.min(dpr, 1.5) : Math.min(dpr, 2);
    this.minPR = Math.min(this.maxPR, 0.6);
    this.pixelRatio = this.maxPR;
    renderer.setPixelRatio(this.pixelRatio);

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.contextLost = true; });
    canvas.addEventListener('webglcontextrestored', () => location.reload());

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, 1, 0.5, 4400);
    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.fov = 72;

    this.world = new World(renderer, this.scene, q);
    this.fx = new Effects(this.scene, q);
    this.field = new AsteroidField(this.scene, q);
    this.proj = new Projectiles(this.scene, this.fx);
    this.player = new Player(this.scene, this.fx, this.proj);
    this.enemies = new Enemies(this.scene, this.fx, this.proj, this.field);
    this.powerups = new Powerups(this.scene, this.fx);
    this.gate = buildWarpGate();
    this.gate.visible = false;
    this.scene.add(this.gate);

    // Nova shockwave sphere
    this.novaMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0xc86bff, wireframe: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    this.novaMesh.visible = false;
    this.scene.add(this.novaMesh);
    this.novaGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: 0xc86bff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    this.novaGlow.visible = false;
    this.scene.add(this.novaGlow);

    this.hud = new HUD(document.getElementById('hud'));
    this.input = new Input(document.getElementById('touch'));
    this.input.setLefty(settings.lefty);
    this.input.tapHandler = (x, y) => {
      if (this.state === 'playing' && this.hud.hitRadar(x, y)) {
        this.hud.toggleRadar();
        audio.ui();
        return true;
      }
      return false;
    };
    this.ui = new UI(settings, {
      play: () => this.newGame(),
      resume: () => this.resume(),
      quit: () => this.toTitle(),
      title: () => this.toTitle(),
      layout: () => this.input.setLefty(settings.lefty),
    });
    audio.setVolumes(settings.sfxVol, settings.musicVol);

    this.dom = {
      touch: document.getElementById('touch'),
      pause: document.getElementById('pauseBtn'),
      vignette: document.getElementById('vignette'),
      fade: document.getElementById('fade'),
      missiles: document.getElementById('missileCount'),
      bombs: document.getElementById('bombCount'),
      bMissile: document.querySelector('.btn.missile'),
      bBomb: document.querySelector('.btn.bomb'),
    };
    this.dom.pause.addEventListener('click', (e) => { e.stopPropagation(); this.pause(); });

    // Hooks
    this.field.onDestroyed = (a, cause) => this.onAsteroidDestroyed(a, cause);
    this.enemies.onKilled = (e) => this.onEnemyKilled(e);
    this.enemies.onFire = (e) => {
      const s = this.spatial(e.pos);
      audio.enemyLaser(s.vol, s.pan);
    };
    this.projHooks = {
      playerBolt: (b) => this.playerBoltHit(b),
      enemyBolt: (b) => this.enemyBoltHit(b),
      missile: (m) => this.missileHit(m),
      retarget: (m) => this.missileRetarget(m),
    };

    this.state = 'title';
    this.time = 0;
    this.timeScale = 1;
    this.slowmo = 0;
    this.trauma = 0;
    this.lock = { target: null, progress: 0, locked: false };
    this.aimTarget = null;
    this.aimPoint = new THREE.Vector3();
    this.novas = [];
    this.blasts = [];
    this.proximity = 0;
    this.hudVisible = false;
    this.loadedTheme = -1;
    this.frameTimes = [];
    this.prTimer = 0;
    this.engineTick = 0;

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.state === 'playing') this.pause();
        audio.suspend();
      } else audio.resume();
    });
    window.onAndroidBack = () => this.back();
    window.onAndroidPause = () => { if (this.state === 'playing') this.pause(); audio.suspend(); };
    window.onAndroidResume = () => audio.resume();
    // First touch anywhere unlocks audio.
    const unlock = () => { audio.init(); if (this.state === 'title') audio.music && audio.music.start('menu'); };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });

    this.resize();
    this.loadSector(1, true);
    this.toTitle();
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  // ---------------- Flow ----------------

  toTitle() {
    this.state = 'title';
    this.enemies.clear();
    this.proj.clear();
    this.hudVisible = false;
    this.dom.touch.classList.remove('on');
    this.dom.pause.classList.remove('on');
    this.input.enabled = false;
    this.input.reset();
    this.dom.fade.style.opacity = 0;
    this.dom.vignette.style.opacity = 0;
    if (!this.player.alive || this.sector !== 1) this.loadSector(1, true);
    this.player.mesh.visible = true;
    document.getElementById('bestScore').textContent = this.best.score.toLocaleString();
    this.ui.show('title');
    audio.setEngine(false);
    if (audio.music) audio.music.start('menu');
  }

  newGame() {
    audio.init();
    this.player.resetStats();
    this.score = 0;
    this.kills = 0;
    this.rocks = 0;
    this.combo = 0;
    this.comboMult = 1;
    this.lastKill = -99;
    this.ui.show(null);
    this.loadSector(1, false);
    this.beginPlay();
    if (audio.music) audio.music.start('game');
  }

  beginPlay() {
    this.state = 'playing';
    this.hudVisible = true;
    this.dom.touch.classList.add('on');
    this.dom.pause.classList.add('on');
    this.input.enabled = true;
    this.input.reset();
    this.input.layout();
  }

  loadSector(n, preview) {
    this.sector = n;
    const ti = (n - 1) % THEMES.length;
    const theme = (this.theme = THEMES[ti]);
    if (this.loadedTheme !== n) {
      this.world.setTheme(theme, n);
      this.loadedTheme = n;
    }
    document.documentElement.style.setProperty('--accent', theme.accent);
    const ang = rand(0, Math.PI * 2);
    const spawn = new THREE.Vector3(Math.cos(ang) * ARENA.radius * 0.72, rand(-100, 100), Math.sin(ang) * ARENA.radius * 0.72);
    this.field.generate(theme, n, spawn);
    this.enemies.clear();
    this.proj.clear();
    this.powerups.clear();
    this.fx.clear();
    this.novas.length = 0;
    this.blasts.length = 0;
    this.gate.visible = false;
    this.novaMesh.visible = this.novaGlow.visible = false;
    const yaw = Math.atan2(-spawn.x, -spawn.z);
    this.player.spawn(spawn, yaw);
    this.lock = { target: null, progress: 0, locked: false };
    this.camPos.copy(spawn).addScaledVector(this.player.forward, -16).add(_v.set(0, 5, 0));
    // Field power-ups scattered around the sector.
    for (let i = 0; i < 7 + Math.min(n, 4); i++) {
      for (let tries = 0; tries < 10; tries++) {
        const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * ARENA.radius * 0.85;
        _v.set(Math.cos(a) * r, rand(-ARENA.halfHeight, ARENA.halfHeight) * 0.6, Math.sin(a) * r);
        if (this.isClear(_v, 25)) {
          this.powerups.spawn(randomPowerupType(i < 2 ? ['nova', 'phase'] : []), _v);
          break;
        }
      }
    }
    this.wave = 0;
    this.waveState = 'intro';
    this.waveTimer = 3.2;
    this.spawnQueue = [];
    this.sectorTime = 0;
    if (!preview) this.ui.showBanner(`SECTOR ${n}`, theme.name, 3);
  }

  isClear(pos, margin) {
    let ok = true;
    this.field.query(pos, margin + 60, (a) => {
      if (this.field.surfaceDistance(a, pos) < margin) { ok = false; return false; }
    });
    return ok;
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.reset();
    this.input.enabled = false;
    this.ui.show('pause');
    audio.setEngine(false);
  }

  resume() {
    if (this.state !== 'paused') return;
    this.ui.show(null);
    this.beginPlay();
    this.last = performance.now();
  }

  back() {
    if (this.ui.top === 'settings' || this.ui.top === 'howto') return this.ui.pop();
    if (this.state === 'playing') return this.pause();
    if (this.state === 'paused') return this.resume();
    if (this.state === 'gameover') return this.toTitle();
    if (this.state === 'title' && window.AndroidBridge && window.AndroidBridge.exit) window.AndroidBridge.exit();
  }

  // ---------------- Waves ----------------

  updateWaves(dt) {
    this.sectorTime += dt;
    if (this.waveState === 'intro' || this.waveState === 'intermission') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) this.startWave();
      return;
    }
    if (this.waveState === 'fighting') {
      for (const s of this.spawnQueue) {
        s.t -= dt;
        if (s.t <= 0 && !s.done) {
          s.done = true;
          this.spawnGroup(s.types);
        }
      }
      this.spawnQueue = this.spawnQueue.filter((s) => !s.done);
      if (!this.spawnQueue.length && this.enemies.aliveCount === 0) {
        if (this.wave < WAVES_PER_SECTOR) {
          this.waveState = 'intermission';
          this.waveTimer = 3.5;
          this.ui.showBanner('WAVE CLEARED', `Next wave incoming`, 2.2);
        } else this.sectorCleared();
      }
    }
  }

  startWave() {
    this.wave++;
    this.waveState = 'fighting';
    const comp = waveComposition(this.sector, this.wave);
    let t = 0;
    for (let i = 0; i < comp.length; i += 3) {
      this.spawnQueue.push({ t, types: comp.slice(i, i + 3) });
      t += rand(2.5, 4.5);
    }
    this.ui.showBanner(`WAVE ${this.wave}/${WAVES_PER_SECTOR}`, 'HOSTILES INBOUND', 2.2);
  }

  spawnGroup(types) {
    const p = this.player;
    let anchor = null;
    for (let tries = 0; tries < 25 && !anchor; tries++) {
      randomUnit(_v);
      _v.y *= 0.4;
      // Bias toward the player's forward hemisphere so fights find you.
      _v.addScaledVector(p.forward, 0.8).normalize();
      const d = rand(650, 950);
      const c = _v2.copy(p.pos).addScaledVector(_v, d);
      if (Math.hypot(c.x, c.z) > ARENA.radius * 0.95 || Math.abs(c.y) > ARENA.halfHeight) continue;
      if (!this.isClear(c, 40)) continue;
      anchor = c.clone();
    }
    if (!anchor) anchor = _v.set(0, 0, 0).clone();
    for (const type of types) {
      const pos = anchor.clone().add(randomUnit(_v3).multiplyScalar(rand(10, 40)));
      const e = this.enemies.spawn(type, pos, this.sector);
      e.fwd.subVectors(p.pos, pos).normalize();
    }
    const s = this.spatial(anchor);
    audio.warpIn(Math.max(0.35, s.vol), s.pan);
  }

  sectorCleared() {
    this.waveState = 'gate';
    const bonus = 1000 * this.sector + Math.max(0, Math.round(3000 - this.sectorTime * 10));
    this.score += bonus;
    this.ui.showBanner('SECTOR CLEAR', `+${bonus.toLocaleString()} · fly through the warp gate`, 3.5);
    audio.pickup();
    // Place gate somewhere reachable but a real trip away.
    const p = this.player;
    let pos = null;
    for (let tries = 0; tries < 60 && !pos; tries++) {
      const a = rand(0, Math.PI * 2);
      const d = rand(800, 1400);
      const c = new THREE.Vector3(p.pos.x + Math.cos(a) * d, clamp(p.pos.y + rand(-200, 200), -ARENA.halfHeight * 0.7, ARENA.halfHeight * 0.7), p.pos.z + Math.sin(a) * d);
      if (Math.hypot(c.x, c.z) > ARENA.radius * 0.85) continue;
      if (this.field.monoliths.some((m) => m.pos.distanceTo(c) < m.r * 1.4 + 90)) continue;
      pos = c;
    }
    if (!pos) pos = new THREE.Vector3(0, 0, 0);
    // Clear loose rocks around the gate.
    const kill = [];
    this.field.query(pos, 120, (a) => { if (a.tier !== 'X' && a.pos.distanceTo(pos) < 110) kill.push(a); });
    kill.forEach((a) => this.field.remove(a));
    this.gate.position.copy(pos);
    this.gate.lookAt(p.pos);
    this.gate.visible = true;
    this.gate.scale.setScalar(0.01);
    this.gateT = 0;
    this.fx.warp(pos, 0x6bffb0, 3);
  }

  startWarp() {
    this.state = 'warping';
    this.warpT = 0;
    this.input.enabled = false;
    this.input.reset();
    this.dom.touch.classList.remove('on');
    this.dom.pause.classList.remove('on');
    this.player.invuln = 99;
    audio.warpJump();
    haptic(120);
    for (const e of this.enemies.list) if (e.alive) this.enemies.kill(e, true);
    this.proj.enemy.clear();
  }

  showUpgrades() {
    this.state = 'upgrade';
    this.hudVisible = false;
    this.dom.fade.style.background = '#060a18';
    audio.setEngine(false);
    const pool = UPGRADES.slice();
    const choices = [];
    while (choices.length < 3 && pool.length) choices.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    this.ui.showUpgrades(this.sector, choices, (u) => {
      this.applyUpgrade(u.id);
      const p = this.player;
      p.hull = Math.min(p.maxHull, p.hull + p.maxHull * 0.3);
      p.shield = p.maxShield;
      p.missiles = Math.min(p.maxMissiles, p.missiles + 2);
      this.ui.show(null);
      this.loadSector(this.sector + 1, false);
      this.dom.fade.style.background = '#ffffff';
      this.dom.fade.style.opacity = 1;
      this.fadeIn = 1;
      this.beginPlay();
    });
  }

  applyUpgrade(id) {
    const p = this.player;
    switch (id) {
      case 'hull': p.maxHull += 25; p.hull = p.maxHull; break;
      case 'shield': p.maxShield += 25; break;
      case 'regen': p.shieldRegen *= 1.4; p.shieldDelay = Math.max(1, p.shieldDelay - 0.6); break;
      case 'damage': p.damageMul *= 1.2; break;
      case 'rate': p.rateMul *= 1.15; break;
      case 'missile': p.maxMissiles += 2; p.missiles = p.maxMissiles; break;
      case 'boost': p.maxBoost *= 1.35; p.boostRegen *= 1.35; p.boost = p.maxBoost; break;
      case 'agility': p.agility *= 1.15; break;
      case 'magnet': p.magnet *= 1.6; p.puDur *= 1.3; break;
      case 'nova': p.maxBombs += 1; p.bombs = p.maxBombs; break;
    }
  }

  gameOver() {
    this.state = 'gameover';
    this.hudVisible = false;
    this.dom.touch.classList.remove('on');
    this.dom.pause.classList.remove('on');
    const isBest = this.score > this.best.score;
    if (isBest) this.best = { score: this.score, sector: this.sector };
    saveBest(this.best);
    this.ui.showGameOver({ score: this.score, sector: this.sector, kills: this.kills, rocks: this.rocks, best: this.best.score }, isBest);
    if (audio.music) audio.music.start('menu');
  }

  // ---------------- Combat events ----------------

  spatial(pos) {
    _v.subVectors(pos, this.camera.position);
    const d = _v.length();
    const vol = Math.pow(clamp(1 - d / 1500, 0, 1), 1.4);
    _camRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const pan = d > 1 ? clamp(_v.dot(_camRight) / d, -1, 1) * 0.8 : 0;
    return { vol, pan, d };
  }

  shake(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  addScore(points, pos, isKill) {
    if (this.state !== 'playing' && this.state !== 'dead') return;
    if (isKill) {
      this.combo = this.time - this.lastKill < 4 ? this.combo + 1 : 1;
      this.lastKill = this.time;
      const m = Math.min(5, 1 + Math.floor(this.combo / 3));
      if (m > this.comboMult) audio.combo(m);
      this.comboMult = m;
    }
    const total = Math.round(points * (isKill ? this.comboMult : 1));
    this.score += total;
    if (pos && (isKill || points >= 50)) this.hud.popup(pos, '+' + total, isKill ? '#ffd36b' : 'rgba(220,230,255,0.8)');
  }

  onAsteroidDestroyed(a, cause) {
    const s = this.spatial(a.pos);
    const size = a.tier === 'L' ? 2 : a.tier === 'M' ? 1.2 : 0.7;
    this.fx.rockBurst(a.pos, a.r, a.color);
    audio.rockBreak(size, s.vol, s.pan);
    if (PLAYER_CAUSES.has(cause)) {
      this.rocks++;
      this.addScore(ASTEROID_TIERS[a.tier].score, a.pos, false);
    }
    if (a.type === 'volatile') this.blasts.push({ pos: a.pos.clone(), r: 90 + a.r * 1.2, cause: PLAYER_CAUSES.has(cause) ? 'blast' : 'env', delay: 0.06 });
    if (a.type === 'crystal') {
      this.powerups.spawn(randomPowerupType(), a.pos, 30, randomUnit(_v).multiplyScalar(5));
    }
    if (s.d < 200) this.shake(a.r / 150);
  }

  onEnemyKilled(e) {
    const s = this.spatial(e.pos);
    const big = e.type === 'warden';
    this.fx.explosion(e.pos, big ? 2.4 : 1.2);
    audio.explosion(big ? 2.5 : 1.3, Math.max(0.3, s.vol), s.pan);
    if (this.player.alive) {
      this.kills++;
      this.addScore(e.def.score, e.pos, true);
    }
    if (chance(e.def.drop)) this.powerups.spawn(randomPowerupType(), e.pos, 25, _v.copy(e.vel).multiplyScalar(0.25));
    if (s.d < 250) this.shake(big ? 0.5 : 0.25);
    if (this.lock.target === e) this.lock = { target: null, progress: 0, locked: false };
  }

  onPlayerHit(result, fromDir) {
    if (!result) return;
    if (fromDir) this.hud.damageFrom(fromDir, this.camera);
    if (result === 'hull' || result === 'dead') {
      this.vignette = 0.9;
      this.shake(0.35);
    } else this.shake(0.15);
    if (result === 'dead') this.onPlayerDeath();
  }

  onPlayerDeath() {
    const p = this.player;
    this.state = 'dead';
    this.deadT = 0;
    this.fx.explosion(p.pos, 2.0, 0x7fe6ff);
    this.fx.ring(p.pos, 3, 90, 0x7fe6ff, 1.0);
    this.deathDir = new THREE.Vector3().subVectors(this.camPos, p.pos).normalize();
    audio.explosion(3.5, 1, 0);
    haptic(300);
    p.mesh.visible = false;
    this.slowmo = 1.6;
    this.shake(1);
    this.input.enabled = false;
    this.input.reset();
    this.dom.touch.classList.remove('on');
    this.dom.pause.classList.remove('on');
    audio.setEngine(false);
  }

  // Bolt vs asteroid test along segment; returns asteroid hit or null.
  boltVsRocks(b) {
    let hit = null;
    _v.addVectors(b.prev, b.pos).multiplyScalar(0.5);
    const half = b.prev.distanceTo(b.pos) * 0.5;
    this.field.query(_v, half + 2, (a) => {
      if (a.tier === 'X') {
        if (this.field.surfaceDistance(a, b.pos) < 0) { hit = a; return false; }
      } else if (segPointDistSq(b.prev, b.pos, a.pos) < a.r * a.r * 0.8) { hit = a; return false; }
    });
    return hit;
  }

  playerBoltHit(b) {
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      const rr = e.radius + 1.2;
      if (segPointDistSq(b.prev, b.pos, e.pos) < rr * rr) {
        this.fx.sparks(b.pos, 0xffc080, 6, 40);
        const s = this.spatial(b.pos);
        audio.boltImpact(s.vol, s.pan);
        this.enemies.damage(e, b.damage);
        return true;
      }
    }
    const a = this.boltVsRocks(b);
    if (a) {
      this.fx.sparks(b.pos, a.tier === 'X' ? 0x9fd8ff : 0xffd0a0, 4, 30);
      const s = this.spatial(b.pos);
      audio.boltImpact(s.vol * 0.7, s.pan);
      this.field.damage(a, b.damage, 'player', _v.copy(b.dir).multiplyScalar(b.damage * 5));
      return true;
    }
    return false;
  }

  enemyBoltHit(b) {
    const p = this.player;
    if (p.alive) {
      const rr = PLAYER.radius + 1.6;
      if (segPointDistSq(b.prev, b.pos, p.pos) < rr * rr) {
        const res = p.damage(b.damage);
        this.fx.sparks(b.pos, p.shield > 0 ? 0x6fc8ff : 0xffa060, 8, 35);
        this.onPlayerHit(res, _v.copy(b.dir).negate());
        return !!res || p.timers.phase <= 0;
      }
    }
    const a = this.boltVsRocks(b);
    if (a) {
      this.fx.sparks(b.pos, 0xff8060, 3, 25);
      this.field.damage(a, b.damage * 0.5, 'enemy', null);
      return true;
    }
    return false;
  }

  missileHit(m) {
    let hit = false;
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      const rr = e.radius + 2.5;
      if (segPointDistSq(m.prev, m.pos, e.pos) < rr * rr) { hit = true; break; }
    }
    if (!hit) hit = !!this.boltVsRocks(m);
    if (!hit) return false;
    // Splash damage.
    const R = 32;
    this.fx.explosion(m.pos, 0.9, 0xff7a3a);
    const s = this.spatial(m.pos);
    audio.explosion(1.2, s.vol, s.pan);
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      const d = e.pos.distanceTo(m.pos);
      if (d < R + e.radius) this.enemies.damage(e, m.damage * (d < e.radius + 4 ? 1 : 0.6));
    }
    const rocks = [];
    this.field.query(m.pos, R + 55, (a) => { if (a.tier !== 'X' && a.pos.distanceTo(m.pos) < R + a.r) rocks.push(a); });
    rocks.forEach((a) => this.field.damage(a, m.damage * 0.8, 'missile', _v.subVectors(a.pos, m.pos).normalize().multiplyScalar(200)));
    return true;
  }

  missileRetarget(m) {
    let best = null, bs = -Infinity;
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      _v.subVectors(e.pos, m.pos);
      const d = _v.length();
      if (d > 900) continue;
      const dot = _v.dot(m.dir) / d;
      if (dot < 0.6) continue;
      const score = dot - d / 1500;
      if (score > bs) { bs = score; best = e; }
    }
    return best;
  }

  fireMissile() {
    const p = this.player;
    if (p.missiles <= 0) { audio.ui(); return; }
    p.missiles--;
    const target = this.lock.target && this.lock.target.alive ? this.lock.target : null;
    const pos = _v.copy(p.pos).addScaledVector(p.up, -1.4).addScaledVector(p.forward, 2);
    this.proj.fireMissile(pos, p.forward, p.vel, target, PLAYER.missileDamage * p.damageMul);
    audio.missileLaunch();
    haptic(25);
  }

  fireNova() {
    const p = this.player;
    if (p.bombs <= 0) { audio.ui(); return; }
    p.bombs--;
    this.novas.push({ c: p.pos.clone(), r: 0, max: PLAYER.bombRadius, hit: new Set() });
    this.fx.flash(p.pos, 70, 0xd08bff, 0.45);
    this.fx.ring(p.pos, 5, PLAYER.bombRadius, 0xd08bff, 0.8);
    audio.nova();
    haptic(90);
    this.shake(0.6);
    this.slowmo = Math.max(this.slowmo, 0.25);
  }

  updateNovas(dt) {
    for (const n of this.novas) {
      const prevR = n.r;
      n.r = Math.min(n.max, n.r + 520 * dt);
      this.novaMesh.visible = this.novaGlow.visible = true;
      this.novaMesh.position.copy(n.c);
      this.novaMesh.scale.setScalar(Math.max(1, n.r));
      this.novaMesh.rotation.y += dt;
      this.novaMesh.material.opacity = 0.45 * (1 - n.r / n.max) + 0.03;
      this.novaGlow.position.copy(n.c);
      this.novaGlow.scale.setScalar(n.r * 1.6);
      this.novaGlow.material.opacity = 0.16 * (1 - n.r / n.max);
      for (const e of this.enemies.list) {
        if (e.alive && !n.hit.has(e) && e.pos.distanceTo(n.c) < n.r + e.radius) {
          n.hit.add(e);
          this.enemies.damage(e, 300);
        }
      }
      const rocks = [];
      this.field.query(n.c, n.r + 60, (a) => {
        if (a.tier !== 'X' && !n.hit.has(a) && a.pos.distanceTo(n.c) < n.r + a.r * 0.5) rocks.push(a);
      });
      for (const a of rocks) {
        n.hit.add(a);
        this.field.destroy(a, 'nova', _v.subVectors(a.pos, n.c).normalize().multiplyScalar(600));
      }
      for (const b of this.proj.enemy.items) if (b.pos.distanceTo(n.c) < n.r) b.life = 0;
      if (prevR >= n.max) n.done = true;
    }
    this.novas = this.novas.filter((n) => !n.done);
    if (!this.novas.length) this.novaMesh.visible = this.novaGlow.visible = false;
  }

  updateBlasts(dt) {
    if (!this.blasts.length) return;
    const now = [];
    for (const b of this.blasts) {
      b.delay -= dt;
      if (b.delay <= 0) now.push(b);
    }
    this.blasts = this.blasts.filter((b) => b.delay > 0);
    for (const b of now) {
      this.fx.explosion(b.pos, 2.2, 0xff6a2a);
      this.fx.ring(b.pos, 4, b.r, 0xff8a3a, 0.6);
      const s = this.spatial(b.pos);
      audio.explosion(2.4, Math.max(0.2, s.vol), s.pan);
      if (s.d < 400) this.shake(0.6 * (1 - s.d / 400));
      const p = this.player;
      const dp = p.pos.distanceTo(b.pos);
      if (p.alive && dp < b.r) {
        const res = p.damage(45 * (1 - dp / b.r) + 5);
        p.knock.add(_v.subVectors(p.pos, b.pos).normalize().multiplyScalar(60));
        this.onPlayerHit(res, _v.subVectors(b.pos, p.pos).normalize());
      }
      for (const e of this.enemies.list) {
        if (!e.alive) continue;
        const d = e.pos.distanceTo(b.pos);
        if (d < b.r + e.radius) this.enemies.damage(e, 160 * (1 - d / (b.r + e.radius)) + 20);
      }
      const rocks = [];
      this.field.query(b.pos, b.r + 55, (a) => {
        if (a.tier !== 'X' && a.pos.distanceTo(b.pos) < b.r + a.r * 0.5) rocks.push(a);
      });
      for (const a of rocks) {
        const d = a.pos.distanceTo(b.pos);
        this.field.damage(a, 90 * (1 - d / (b.r + a.r)) + 10, b.cause, _v.subVectors(a.pos, b.pos).normalize().multiplyScalar(400));
      }
    }
  }

  // ---------------- Per-frame systems ----------------

  updateTargeting(dt) {
    const p = this.player;
    // Aim assist: snap bolts to an enemy's lead point if it's very near the reticle.
    this.aimTarget = null;
    let best = 0.06;
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      const d = e.pos.distanceTo(p.pos);
      if (d > 520) continue;
      leadPoint(p.pos, e.pos, _v2.subVectors(e.vel, p.vel), PLAYER.boltSpeed, _v);
      _v3.subVectors(_v, p.pos).normalize();
      const ang = Math.acos(clamp(_v3.dot(p.forward), -1, 1));
      if (ang < best + e.radius / Math.max(d, 1)) {
        best = ang;
        this.aimTarget = e;
        this.aimPoint.copy(_v);
      }
    }
    // Missile lock.
    let cand = null, cs = Infinity;
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      _v.subVectors(e.pos, p.pos);
      const d = _v.length();
      if (d > 1100) continue;
      const ang = Math.acos(clamp(_v.dot(p.forward) / d, -1, 1));
      if (ang > 0.4) continue;
      const sc = ang * (1 + d / 1500);
      if (sc < cs) { cs = sc; cand = e; }
    }
    const L = this.lock;
    if (cand !== L.target) {
      L.target = cand;
      L.progress = 0;
      L.locked = false;
    } else if (cand) {
      L.progress = Math.min(1, L.progress + dt * 1.8);
      if (L.progress >= 1 && !L.locked) {
        L.locked = true;
        if (p.missiles > 0) audio.lockBeep(true);
      } else if (!L.locked && p.missiles > 0) audio.lockBeep(false);
    }
  }

  updateCollisions(dt) {
    const p = this.player, field = this.field;
    this.proximity = 0;
    if (p.alive) {
      // Proximity warning: something solid close ahead.
      _v.copy(p.pos).addScaledVector(p.forward, 30);
      field.query(_v, 45, (a) => {
        if (field.surfaceDistance(a, _v) < 25 && a.tier !== 'S') { this.proximity = 1; return false; }
      });
      if (p.timers.phase <= 0) {
        this.collideCd = (this.collideCd || 0) - dt;
        const hits = [];
        field.query(p.pos, PLAYER.radius + 4, (a) => {
          const sd = a.tier === 'X' ? field.surfaceDistance(a, p.pos) : p.pos.distanceTo(a.pos) - a.r * 0.8;
          if (sd < PLAYER.radius) hits.push([a, sd]);
        });
        for (const [a, sd] of hits) {
          const n = _v.subVectors(p.pos, a.pos).normalize();
          p.pos.addScaledVector(n, PLAYER.radius - sd + 0.2);
          const rel = _v2.subVectors(p.vel, a.vel);
          const vn = rel.dot(n);
          if (vn < 0) p.knock.addScaledVector(n, -vn * 1.5 + 10);
          if (this.collideCd <= 0) {
            this.collideCd = 0.45;
            const base = { S: 6, M: 12, L: 18, X: 22 }[a.tier];
            const res = p.damage(base * clamp(Math.abs(vn) / 70, 0.5, 1.6));
            this.fx.sparks(_v3.copy(p.pos).addScaledVector(n, -PLAYER.radius), 0xffd0a0, 14, 50);
            audio.rockBreak(0.6, 0.8, 0);
            this.onPlayerHit(res, _v3.copy(n).negate());
            if (a.tier === 'S') field.destroy(a, 'ram');
            else if (a.tier !== 'X') field.damage(a, 10, 'ram', null);
          }
        }
      }
      // Ramming enemies.
      for (const e of this.enemies.list) {
        if (!e.alive) continue;
        const rr = e.radius + PLAYER.radius;
        if (e.pos.distanceToSquared(p.pos) < rr * rr) {
          const res = p.damage(20);
          p.knock.add(_v.subVectors(p.pos, e.pos).normalize().multiplyScalar(40));
          this.onPlayerHit(res, _v3.copy(_v).negate());
          this.enemies.damage(e, 80);
        }
      }
    }
    // Enemies crashing into rocks.
    for (const e of this.enemies.list) {
      if (!e.alive || e.spawnT < 0.6) continue;
      let crash = null;
      field.query(e.pos, e.radius + 2, (a) => {
        const sd = a.tier === 'X' ? field.surfaceDistance(a, e.pos) : e.pos.distanceTo(a.pos) - a.r * 0.8;
        if (sd < e.radius * 0.7) { crash = [a, sd]; return false; }
      });
      if (crash) {
        const [a, sd] = crash;
        const n = _v.subVectors(e.pos, a.pos).normalize();
        e.pos.addScaledVector(n, e.radius * 0.7 - sd + 0.5);
        e.fwd.addScaledVector(n, 1.2).normalize();
        this.fx.sparks(e.pos, 0xffd0a0, 10, 40);
        this.enemies.damage(e, 35);
      }
    }
    // Gate entry.
    if (this.gate.visible && this.state === 'playing' && p.alive) {
      if (p.pos.distanceTo(this.gate.position) < 42) this.startWarp();
    }
  }

  updateCamera(dt) {
    const p = this.player, cam = this.camera;
    if (this.state === 'title') {
      const t = this.time * 0.12;
      cam.position.set(p.pos.x + Math.sin(t) * 20, p.pos.y + 5 + Math.sin(t * 0.7) * 3, p.pos.z + Math.cos(t) * 20);
      cam.up.set(0, 1, 0);
      // Look past the ship so it sits in the lower-left third, clear of the menu.
      _v2.subVectors(p.pos, cam.position).normalize();
      _v3.crossVectors(_v2, cam.up).normalize();
      cam.lookAt(_v.copy(p.pos).addScaledVector(_v3, 9).add(_v2.set(0, 3.5, 0)));
      this.fov = 60;
    } else {
      const warping = this.state === 'warping';
      const back = p.boosting ? 17.5 : 14.5;
      if (!warping) {
        _v.copy(p.pos).addScaledVector(p.forward, -back).addScaledVector(p.levelUp, 4.4);
        if (p.alive) {
          this.camPos.x = damp(this.camPos.x, _v.x, 11, dt);
          this.camPos.y = damp(this.camPos.y, _v.y, 11, dt);
          this.camPos.z = damp(this.camPos.z, _v.z, 11, dt);
          this.camLook.copy(p.pos).addScaledVector(p.forward, 40).addScaledVector(p.levelUp, 1.2);
        } else if (this.deathDir) {
          // Pull back and watch the wreck.
          this.camPos.addScaledVector(this.deathDir, 28 * dt);
          this.camLook.lerp(p.pos, 1 - Math.exp(-3 * dt));
        }
      } else {
        this.camLook.copy(p.pos);
      }
      cam.position.copy(this.camPos);
      if (this.trauma > 0) {
        const t2 = this.trauma * this.trauma * 1.3;
        cam.position.x += rand(-1, 1) * t2;
        cam.position.y += rand(-1, 1) * t2;
        cam.position.z += rand(-1, 1) * t2;
      }
      _v.copy(p.levelUp).applyAxisAngle(p.forward, p.roll * 0.3);
      cam.up.copy(_v);
      cam.lookAt(this.camLook);
      this.fov = warping ? 115 : p.boosting ? 84 : p.braking ? 66 : 72;
    }
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const f = damp(cam.fov, this.fov, 4, dt);
    if (Math.abs(f - cam.fov) > 0.01) {
      cam.fov = f;
      cam.updateProjectionMatrix();
    }
    this.fx.setScale((this.renderer.domElement.height / 2) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
  }

  updateDom(dt) {
    const p = this.player;
    if (this._mc !== p.missiles) {
      this._mc = p.missiles;
      this.dom.missiles.textContent = p.missiles;
      this.dom.bMissile.classList.toggle('empty', p.missiles <= 0);
    }
    if (this._bc !== p.bombs) {
      this._bc = p.bombs;
      this.dom.bombs.textContent = p.bombs;
      this.dom.bBomb.classList.toggle('empty', p.bombs <= 0);
    }
    this.vignette = Math.max(0, (this.vignette || 0) - dt * 1.8);
    const low = p.alive && this.hudVisible && p.hull / p.maxHull < 0.25 ? 0.25 + 0.15 * Math.sin(this.time * 6) : 0;
    const v = Math.max(this.vignette, low);
    if (Math.abs(v - (this._vig || 0)) > 0.01) {
      this._vig = v;
      this.dom.vignette.style.opacity = v.toFixed(2);
    }
    if (this.fadeIn > 0) {
      this.fadeIn = Math.max(0, this.fadeIn - dt * 1.2);
      this.dom.fade.style.opacity = this.fadeIn.toFixed(2);
    }
  }

  objectiveText() {
    if (this.waveState === 'gate') return 'REACH THE WARP GATE';
    if (this.waveState === 'fighting') {
      const n = this.enemies.aliveCount + this.spawnQueue.reduce((s, q) => s + q.types.length, 0);
      return `SECTOR ${this.sector} · WAVE ${this.wave}/${WAVES_PER_SECTOR} · HOSTILES ${n}`;
    }
    return `SECTOR ${this.sector} · ${this.theme.name}`;
  }

  adaptResolution(rawDt) {
    this.frameTimes.push(rawDt);
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes.length = 0;
    let pr = this.pixelRatio;
    if (avg > 1 / 42 && pr > this.minPR) pr = Math.max(this.minPR, pr - 0.15);
    else if (avg < 1 / 58 && pr < this.maxPR) pr = Math.min(this.maxPR, pr + 0.1);
    if (pr !== this.pixelRatio) {
      this.pixelRatio = pr;
      this.renderer.setPixelRatio(pr);
      this.resize();
    }
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.hud.resize();
    this.input.layout();
  }

  frame(now) {
    requestAnimationFrame((t) => this.frame(t));
    if (this.contextLost) return;
    const rawDt = Math.min(0.05, Math.max(0.0001, (now - this.last) / 1000));
    this.last = now;
    if (this.state === 'paused' || this.state === 'upgrade') return;
    if (this.state === 'playing') this.adaptResolution(rawDt);

    // Slow-motion for dramatic moments.
    if (this.slowmo > 0) this.slowmo -= rawDt;
    this.timeScale = damp(this.timeScale, this.slowmo > 0 ? 0.3 : 1, 6, rawDt);
    const dt = rawDt * this.timeScale;
    this.time += dt;

    const p = this.player;
    this.input.update(rawDt);
    if (this.state === 'playing') {
      for (const ev of this.input.consume()) {
        if (ev === 'missile') this.fireMissile();
        else if (ev === 'bomb') this.fireNova();
        else if (ev === 'pause') { this.pause(); return; }
      }
      p.update(dt, this.input, this.settings, this.time);
      this.updateTargeting(dt);
      p.fireCd -= dt;
      const auto = this.settings.autoFire && this.aimTarget;
      if ((this.input.fire || auto) && p.fireCd <= 0 && p.alive) p.fire(this.aimTarget ? this.aimPoint : null);
      this.updateWaves(dt);
      if (p.hull / p.maxHull < 0.25) audio.alarm();
      if (this.time - this.lastKill > 4 && this.comboMult > 1) { this.comboMult = 1; this.combo = 0; }
    } else if (this.state === 'warping') {
      this.warpT += rawDt;
      p.speed += rawDt * 900;
      p.vel.copy(p.forward).multiplyScalar(p.speed);
      p.pos.addScaledVector(p.vel, rawDt);
      p.update(0, { stick: { x: 0, y: 0 }, boost: false, brake: false }, this.settings, this.time);
      this.dom.fade.style.opacity = clamp((this.warpT - 1.1) / 0.9, 0, 1).toFixed(2);
      if (this.warpT > 2.3) this.showUpgrades();
    } else if (this.state === 'dead') {
      this.deadT += rawDt;
      if (this.deadT > 2.6) this.gameOver();
    } else if (this.state === 'title') {
      for (const s of p.mesh.userData.engines) s.scale.setScalar(s.userData.baseSize * (0.85 + Math.random() * 0.3));
    }
    this.input.consume();

    const simulate = this.state !== 'title' || true;
    if (simulate) {
      this.field.update(dt);
      this.enemies.update(dt, p, 1);
      this.proj.update(dt, this.projHooks);
      this.powerups.update(dt, p, (pu) => {
        p.applyPowerup(pu.type);
        audio.pickup();
        haptic(20);
        this.hud.popup(pu.pos, pu.def.name, pu.def.css);
        this.fx.flash(pu.pos, 30, pu.def.color, 0.3);
      });
      if (this.state === 'playing' || this.state === 'dead') {
        this.updateCollisions(dt);
        this.updateNovas(dt);
        this.updateBlasts(dt);
      }
      if (this.gate.visible) {
        this.gateT += dt;
        const s = Math.min(1, this.gateT / 1.2);
        this.gate.scale.setScalar(s);
        this.gate.userData.segs.rotation.z += dt * 0.6;
        this.gate.userData.disk.rotation.z -= dt * 1.5;
      }
    }

    this.updateCamera(rawDt);
    this.world.update(dt, this.camera.position, this.state === 'title' ? _v.set(0, 0, 0) : p.vel);
    this.fx.update(dt, this.camera);

    // Audio: engine + music intensity.
    this.engineTick -= rawDt;
    if (this.engineTick <= 0) {
      this.engineTick = 0.1;
      const flying = (this.state === 'playing' || this.state === 'warping') && p.alive;
      audio.setEngine(flying, clamp(p.speed / PLAYER.boostSpeed, 0, 1), p.boosting || this.state === 'warping');
      if (audio.music) {
        let inten = 0;
        if (this.state === 'playing') {
          const n = this.enemies.aliveCount;
          let near = Infinity;
          for (const e of this.enemies.list) if (e.alive) near = Math.min(near, e.pos.distanceTo(p.pos));
          inten = clamp(n / 6, 0, 1) * 0.6 + (near < 450 ? 0.4 : 0);
        }
        audio.music.setIntensity(inten);
      }
    }

    this.updateDom(rawDt);
    this.renderer.render(this.scene, this.camera);
    this.hud.draw(this, rawDt);
  }
}

function boot() {
  const msg = document.getElementById('loadMsg');
  document.getElementById('loading').classList.add('on');
  setTimeout(() => {
    try {
      window.game = new Game();
      document.getElementById('loading').classList.remove('on');
    } catch (err) {
      console.error(err);
      msg.textContent = 'Failed to start: ' + (err && err.message ? err.message : err) + ' (WebGL required)';
    }
  }, 50);
}

boot();
