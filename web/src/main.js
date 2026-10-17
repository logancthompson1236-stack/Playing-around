import * as THREE from 'three';
import { ARENA, PLAYER, THEMES, ASTEROID_TIERS, POWERUPS, UPGRADES, WAVES_PER_SECTOR, waveComposition, DIFFICULTY, BOSSES } from './config.js';
import { CREDITS } from './content.js';
import { audio } from './audio.js';
import { World } from './world.js';
import { Effects } from './particles.js';
import { AsteroidField } from './asteroids.js';
import { Projectiles } from './projectiles.js';
import { Player } from './player.js';
import { Enemies } from './enemies.js';
import { Hazards } from './hazards.js';
import { Boss } from './boss.js';
import { Wingmen } from './drone.js';
import { Powerups, randomPowerupType } from './powerups.js';
import { HUD } from './hud.js';
import { Input } from './input.js';
import { UI, loadSettings, loadBest, saveBest } from './ui.js';
import { Hangar } from './hangar.js';
import { Tutorial, Hints } from './tutorial.js';
import { profile } from './profile.js';
import { buildWarpGate } from './models.js';
import { clamp, damp, rand, randomUnit, chance, leadPoint, segPointDistSq, haptic, getGlowTexture } from './util.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _camRight = new THREE.Vector3();

const PLAYER_CAUSES = new Set(['player', 'missile', 'ram', 'blast']);
const IMPACT_MASS = { S: 0.45, M: 1, L: 1.6, X: 2.1 };

const UTIL_ICONS = {
  emp: '<circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/><path d="M27 6L14 27h9l-3 15 14-22h-9z" fill="currentColor"/>',
  drone: '<path d="M24 8l6 10h-12z M10 28l8-6v12z M38 28l-8-6v12z" fill="currentColor"/><circle cx="24" cy="28" r="6" fill="none" stroke="currentColor" stroke-width="3"/>',
  dash: '<path d="M8 16h18M4 24h22M8 32h18" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M28 12l14 12-14 12z" fill="currentColor"/>',
};

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
    this.hazards = new Hazards(this.scene, this.fx);
    this.player = new Player(this.scene, this.fx, this.proj);
    this.enemies = new Enemies(this.scene, this.fx, this.proj, this.field, this.hazards);
    this.wingmen = new Wingmen(this.scene, this.fx, this.proj);
    this.powerups = new Powerups(this.scene, this.fx);
    this.gate = buildWarpGate();
    this.gate.visible = false;
    this.scene.add(this.gate);
    this.boss = null;
    this.profile = profile;

    // EMP pulse: an expanding electric shell.
    this.empMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.MeshBasicMaterial({ color: 0x7fe0ff, wireframe: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    this.empMesh.visible = false;
    this.scene.add(this.empMesh);
    this.empGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: 0x5ad8ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    this.empGlow.visible = false;
    this.scene.add(this.empGlow);

    this.hud = new HUD(document.getElementById('hud'));
    this.input = new Input(document.getElementById('touch'));
    this.input.setLefty(settings.lefty);
    this.input.setCustom(profile.data.controls);
    this.input.tapHandler = (x, y) => {
      if (this.state === 'playing' && this.hud.hitRadar(x, y)) {
        this.toggleRadar();
        return true;
      }
      return false;
    };
    this.ui = new UI(settings, {
      play: () => this.newGame(),
      resume: () => this.resume(),
      quit: () => this.abandonRun(),
      title: () => this.toTitle(),
      layout: () => this.input.setLefty(settings.lefty),
      hangar: () => this.openHangar(),
      tutorial: () => { this.forceTutorial = true; this.newGame(); },
      controls: () => this.openLayoutEditor(),
      closed: (id) => { if (id === 'hangar') this.closeHangar(); },
    });
    this.hangar = new Hangar({ previewShip: (id) => this.player.setShip(id) });
    this.tutorial = new Tutorial(this);
    this.hints = new Hints(this.tutorial.coach);
    audio.setVolumes(settings.sfxVol, settings.musicVol);

    this.dom = {
      touch: document.getElementById('touch'),
      pause: document.getElementById('pauseBtn'),
      vignette: document.getElementById('vignette'),
      fade: document.getElementById('fade'),
      missiles: document.getElementById('missileCount'),
      charges: document.getElementById('empCount'),
      bMissile: document.querySelector('.btn.missile'),
      bUtil: document.querySelector('.btn.emp'),
      utilIcon: document.getElementById('utilIcon'),
      layoutBar: document.getElementById('layoutBar'),
    };
    this.dom.pause.addEventListener('click', (e) => { e.stopPropagation(); this.pause(); });
    this._wireLayoutEditor();

    // Hooks
    this.field.onDestroyed = (a, cause) => this.onAsteroidDestroyed(a, cause);
    this.enemies.onKilled = (e) => this.onEnemyKilled(e);
    this.enemies.onFire = (e) => {
      const s = this.spatial(e.pos);
      audio.enemyLaser(s.vol, s.pan);
    };
    this.enemies.onEvent = (name, e, extra) => this.onEnemyEvent(name, e, extra);
    this.hazards.onMineBlast = (pos, radius, dmg) => this.blastAt(pos, radius, dmg, 'mine');
    this.hazards.onMineBeep = (pos) => { const s = this.spatial(pos); audio.mineBeep(s.vol, s.pan); };
    this.projHooks = {
      playerBolt: (b) => this.playerBoltHit(b),
      enemyBolt: (b) => this.enemyBoltHit(b),
      missile: (m) => this.missileHit(m),
      retarget: (m) => this.missileRetarget(m),
    };
    const game = this;
    this.bossApi = {
      scene: this.scene, enemies: this.enemies, hazards: this.hazards, proj: this.proj, fx: this.fx, field: this.field,
      get playerPos() { return game.player.pos; },
      spawnEnemy: (type, pos) => this.spawnEnemy(type, pos),
      onBossEvent: (name, extra) => this.onBossEvent(name, extra),
    };

    this.state = 'title';
    this.viewMode = 'title';
    this.time = 0;
    this.timeScale = 1;
    this.slowmo = 0;
    this.trauma = 0;
    this.lock = { target: null, progress: 0, locked: false };
    this.aimTarget = null;
    this.aimPoint = new THREE.Vector3();
    this.emps = [];
    this.blasts = [];
    this.proximity = 0;
    this.hudVisible = false;
    this.loadedTheme = -1;
    this.frameTimes = [];
    this.engineTick = 0;
    this.missilesFired = 0;
    this.abilitiesUsed = 0;
    this.radarToggles = 0;
    this.runCredits = 0;
    this.hintTick = 0;
    this.beamHurtT = 0;

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.state === 'playing') this.pause();
        profile.save();
        audio.suspend();
      } else audio.resume();
    });
    window.onAndroidBack = () => this.back();
    window.onAndroidPause = () => { if (this.state === 'playing') this.pause(); profile.save(); audio.suspend(); };
    window.onAndroidResume = () => audio.resume();
    // First touch anywhere unlocks audio.
    const unlock = () => { audio.init(); if (this.state === 'title') audio.music && audio.music.start('menu'); };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });

    const rd = document.getElementById('rotateDismiss');
    if (rd) rd.addEventListener('click', () => { document.body.classList.add('portrait-ok'); setTimeout(() => this.resize(), 50); });

    this.player.applyLoadout(profile.loadout);
    this._setUtilIcon();
    this.resize();
    this.loadSector(1, true);
    this.toTitle();
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  get diff() { return DIFFICULTY[this.settings.difficulty] || DIFFICULTY.normal; }

  // ---------------- Flow ----------------

  toTitle() {
    if (this.tutorial.active) this.tutorial.finish(true);
    this.state = 'title';
    this.viewMode = 'title';
    this.enemies.clear();
    this.proj.clear();
    this.wingmen.clear();
    this.hazards.clearMines();
    if (this.boss) { this.boss.dispose(); this.boss = null; }
    this.hudVisible = false;
    this.dom.touch.classList.remove('on');
    this.dom.pause.classList.remove('on');
    this.input.enabled = false;
    this.input.reset();
    this.dom.fade.style.opacity = 0;
    this.dom.vignette.style.opacity = 0;
    this.tutorial.coach.hide();
    if (!this.player.alive || this.sector !== 1) this.loadSector(1, true);
    this.player.applyLoadout(profile.loadout);
    this.player.mesh.visible = true;
    this._refreshTitle();
    this.ui.show('title');
    audio.setEngine(false);
    if (audio.music) audio.music.start('menu');
  }

  _refreshTitle() {
    document.getElementById('bestScore').textContent = this.best.score.toLocaleString();
    document.getElementById('titleCredits').textContent = profile.credits.toLocaleString();
  }

  openHangar() {
    this.viewMode = 'hangar';
    this.hangar.open();
  }

  closeHangar() {
    this.viewMode = 'title';
    this.player.applyLoadout(profile.loadout);
    this._setUtilIcon();
    this._refreshTitle();
  }

  _setUtilIcon() {
    this.dom.utilIcon.innerHTML = UTIL_ICONS[this.player.utilityId] || UTIL_ICONS.emp;
  }

  newGame() {
    audio.init();
    this.player.applyLoadout(profile.loadout);
    this._setUtilIcon();
    this.score = 0;
    this.kills = 0;
    this.rocks = 0;
    this.combo = 0;
    this.comboMult = 1;
    this.lastKill = -99;
    this.runCredits = 0;
    profile.data.stats.runs++;
    this.ui.show(null);
    this.loadSector(1, false);
    this.beginPlay();
    if (audio.music) audio.music.start('game');
    if (!profile.data.tutorialDone || this.forceTutorial) {
      this.forceTutorial = false;
      this.waveState = 'tutorial';
      this.tutorial.start();
    }
  }

  tutorialDone(skipped) {
    this.waveState = 'intro';
    this.waveTimer = skipped ? 2 : 3;
    this.coachMarker = null;
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
    this.enemies.sector = n;
    const ti = (n - 1) % THEMES.length;
    const theme = (this.theme = THEMES[ti]);
    if (this.loadedTheme !== n) {
      this.world.setTheme(theme, n);
      this.loadedTheme = n;
    }
    document.documentElement.style.setProperty('--accent', theme.accent);
    if (this.boss) { this.boss.dispose(); this.boss = null; }
    const ang = rand(0, Math.PI * 2);
    const spawn = new THREE.Vector3(Math.cos(ang) * ARENA.radius * 0.72, rand(-100, 100), Math.sin(ang) * ARENA.radius * 0.72);
    this.field.generate(theme, n, spawn);
    this.enemies.clear();
    this.proj.clear();
    this.powerups.clear();
    this.hazards.clearMines();
    this.wingmen.clear();
    this.fx.clear();
    this.emps.length = 0;
    this.blasts.length = 0;
    this.gate.visible = false;
    this.empMesh.visible = this.empGlow.visible = false;
    const yaw = Math.atan2(-spawn.x, -spawn.z);
    this.player.spawn(spawn, yaw);
    this.lock = { target: null, progress: 0, locked: false };
    this.camPos.copy(spawn).addScaledVector(this.player.forward, -16).add(_v.set(0, 5, 0));
    // Field power-ups scattered around the sector.
    for (let i = 0; i < 12 + Math.min(n, 4); i++) {
      for (let tries = 0; tries < 10; tries++) {
        const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * ARENA.radius * 0.85;
        _v.set(Math.cos(a) * r, rand(-ARENA.halfHeight, ARENA.halfHeight) * 0.6, Math.sin(a) * r);
        if (this.isClear(_v, 25)) {
          const type = i < 3 ? 'missile' : i < 5 ? 'shield' : randomPowerupType();
          this.powerups.spawn(type, _v);
          break;
        }
      }
    }
    this.wave = 0;
    this.waveState = 'intro';
    this.waveTimer = 3.2;
    this.spawnQueue = [];
    this.sectorTime = 0;
    if (!preview) {
      const feat = this.field.features.includes('planetoid') ? ' · RINGED PLANETOID'
        : this.field.features.includes('wreck') ? ' · DERELICT SIGHTED' : this.field.features.includes('wall') ? ' · ROCK WALL' : '';
      this.ui.showBanner(`SECTOR ${n}`, theme.name + feat, 3);
    }
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
    profile.save();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.ui.show(null);
    this.beginPlay();
    this.last = performance.now();
  }

  abandonRun() {
    profile.save();
    this.toTitle();
  }

  back() {
    if (this.input.editing) return this.closeLayoutEditor();
    if (['settings', 'howto', 'hangar'].includes(this.ui.top)) return this.ui.pop();
    if (this.state === 'playing') return this.pause();
    if (this.state === 'paused') return this.resume();
    if (this.state === 'gameover') return this.toTitle();
    if (this.state === 'title' && window.AndroidBridge && window.AndroidBridge.exit) window.AndroidBridge.exit();
  }

  toggleRadar() {
    this.hud.toggleRadar();
    this.radarToggles++;
    audio.ui();
  }

  // ---------------- Control layout editor ----------------

  _wireLayoutEditor() {
    const size = document.getElementById('lbSize');
    const op = document.getElementById('lbOpacity');
    size.addEventListener('input', () => { this.input.custom.size = parseFloat(size.value); this.input.layout(); });
    op.addEventListener('input', () => { this.input.custom.opacity = parseFloat(op.value); this.input.layout(); });
    document.getElementById('lbReset').addEventListener('click', (e) => {
      e.stopPropagation();
      this.input.custom = { pos: {}, size: 1, opacity: 1 };
      size.value = 1;
      op.value = 1;
      this.input.layout();
      audio.ui();
    });
    document.getElementById('lbDone').addEventListener('click', (e) => { e.stopPropagation(); this.closeLayoutEditor(); });
  }

  openLayoutEditor() {
    this.editorReturn = this.ui.stack.slice();
    this.ui.show(null);
    this.input.startEditing();
    document.getElementById('lbSize').value = this.input.custom.size || 1;
    document.getElementById('lbOpacity').value = this.input.custom.opacity || 1;
    this.dom.layoutBar.classList.add('on');
    this.dom.pause.classList.remove('on');
  }

  closeLayoutEditor() {
    const custom = this.input.stopEditing();
    const isDefault = custom && Object.keys(custom.pos).length === 0 && (custom.size || 1) === 1 && (custom.opacity || 1) === 1;
    profile.data.controls = isDefault ? null : custom;
    profile.save();
    this.input.setCustom(profile.data.controls);
    this.dom.layoutBar.classList.remove('on');
    if (this.state !== 'playing') this.dom.touch.classList.remove('on');
    this.ui.stack = this.editorReturn || ['settings'];
    this.ui._render();
    audio.ui(true);
  }

  // ---------------- Waves & boss ----------------

  updateWaves(dt) {
    this.sectorTime += dt;
    const ws = this.waveState;
    if (ws === 'tutorial') return;
    if (ws === 'intro' || ws === 'intermission') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) this.startWave();
      return;
    }
    if (ws === 'fighting') {
      for (const s of this.spawnQueue) {
        s.t -= dt;
        if (s.t <= 0 && !s.done) {
          s.done = true;
          this.spawnGroup(s.types);
        }
      }
      this.spawnQueue = this.spawnQueue.filter((s) => !s.done);
      if (!this.spawnQueue.length && this.enemies.aliveCount === 0) {
        this.supplyDrop();
        if (this.wave < WAVES_PER_SECTOR) {
          this.waveState = 'intermission';
          this.waveTimer = 3.5;
          this.ui.showBanner('WAVE CLEARED', 'Supply drop ahead', 2.2);
        } else {
          this.waveState = 'bossIntro';
          this.waveTimer = 4.5;
          const kind = this.sector % 2 === 1 ? 'dreadnought' : 'sentinel';
          this.ui.showBanner('WARNING', `${BOSSES[kind].name} INBOUND`, 3.5);
          audio.bossAlarm();
        }
      }
    } else if (ws === 'bossIntro') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) this.spawnBoss();
    } else if (ws === 'bossDown') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) this.sectorCleared();
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

  spawnEnemy(type, pos) {
    const e = this.enemies.spawn(type, pos, this.sector, this.diff);
    e.fwd.subVectors(this.player.pos, pos).normalize();
    if (type === 'hornet' || type === 'spinner') this.hints.maybe(type);
    return e;
  }

  findSpawnPoint(minD, maxD, clearance) {
    const p = this.player;
    for (let tries = 0; tries < 30; tries++) {
      randomUnit(_v);
      _v.y *= 0.4;
      _v.addScaledVector(p.forward, 0.8).normalize();
      const c = _v2.copy(p.pos).addScaledVector(_v, rand(minD, maxD));
      if (Math.hypot(c.x, c.z) > ARENA.radius * 0.95 || Math.abs(c.y) > ARENA.halfHeight) continue;
      if (!this.isClear(c, clearance)) continue;
      return c.clone();
    }
    return p.pos.clone().addScaledVector(p.forward, minD);
  }

  spawnGroup(types) {
    const anchor = this.findSpawnPoint(650, 950, 40);
    for (const type of types) this.spawnEnemy(type, anchor.clone().add(randomUnit(_v3).multiplyScalar(rand(10, 40))));
    const s = this.spatial(anchor);
    audio.warpIn(Math.max(0.35, s.vol), s.pan);
  }

  spawnBoss() {
    const kind = this.sector % 2 === 1 ? 'dreadnought' : 'sentinel';
    const pos = this.findSpawnPoint(340, 430, 140);
    // Clear loose rocks around the arrival point.
    const kill = [];
    this.field.query(pos, 200, (a) => { if (a.tier !== 'X' && a.pos.distanceTo(pos) < 180) kill.push(a); });
    kill.forEach((a) => this.field.remove(a));
    this.boss = new Boss(this.bossApi, kind, this.sector, pos, this.diff);
    this.waveState = 'boss';
    this.fx.warp(pos, 0xff6040, 5);
    audio.warpIn(1, 0);
    this.hints.maybe(kind);
  }

  onBossEvent(name, x) {
    switch (name) {
      case 'exposed':
        this.ui.showBanner('CORE EXPOSED', 'Hit the reactor!', 2.5);
        audio.combo(4);
        break;
      case 'beamHit': {
        const res = this.player.damage(x.damage);
        this.fx.sparks(this.player.pos, 0xff5070, 14, 45);
        this.onPlayerHit(res, _v.subVectors(x.from, this.player.pos).normalize());
        break;
      }
      case 'orb': { const s = this.spatial(x.pos); audio.enemyLaser(s.vol, s.pan); break; }
      case 'dying':
        this.slowmo = 1.2;
        this.ui.showBanner(`${x.boss.name} DESTROYED`, '', 3);
        break;
      case 'chain': {
        this.fx.explosion(x.pos, rand(1.4, 2.6));
        const s = this.spatial(x.pos);
        audio.explosion(2.5, Math.max(0.4, s.vol), s.pan);
        this.shake(0.15);
        break;
      }
      case 'destroyed': {
        const b = x.boss;
        this.fx.explosion(x.pos, 5);
        this.fx.ring(x.pos, 10, 260, 0xffc080, 1.2);
        this.fx.flash(x.pos, 260, 0xffe0b0, 0.8);
        audio.explosion(4, 1, 0);
        this.shake(0.9);
        haptic(250);
        this.addScore(b.def.score * this.sector, x.pos, false);
        this.addCredits(b.def.credits + 50 * (this.sector - 1), x.pos);
        for (let i = 0; i < 4; i++) this.powerups.spawn(i === 0 ? 'repair' : i === 1 ? 'missile' : randomPowerupType(), x.pos.clone().add(randomUnit(_v).multiplyScalar(30)), 40, randomUnit(_v2).multiplyScalar(25));
        this.boss = null;
        this.waveState = 'bossDown';
        this.waveTimer = 2;
        break;
      }
    }
  }

  // Two crates just ahead of the player: seekers if running low, then shields or repairs.
  supplyDrop() {
    const p = this.player;
    if (!p.alive) return;
    const first = p.missiles < p.maxMissiles * 0.6 ? 'missile' : randomPowerupType(['phase']);
    const second = p.hull < p.maxHull * 0.7 ? 'repair' : 'shield';
    const side = _v3.crossVectors(p.forward, p.levelUp).normalize();
    [first, second].forEach((type, i) => {
      const pos = p.pos.clone().addScaledVector(p.forward, 90).addScaledVector(side, i ? 14 : -14);
      this.powerups.spawn(type, pos, 30);
      this.fx.warp(pos, POWERUPS[type].color, 0.6);
    });
  }

  sectorCleared() {
    this.waveState = 'gate';
    const bonus = 1000 * this.sector + Math.max(0, Math.round(3000 - this.sectorTime * 8));
    this.score += bonus;
    this.addCredits(CREDITS.sectorClear * this.sector, null);
    profile.data.stats.bestSector = Math.max(profile.data.stats.bestSector, this.sector);
    profile.save();
    this.ui.showBanner('SECTOR CLEAR', `+${bonus.toLocaleString()} · fly through the warp gate`, 3.5);
    audio.pickup();
    const p = this.player;
    let pos = null;
    for (let tries = 0; tries < 60 && !pos; tries++) {
      const a = rand(0, Math.PI * 2);
      const d = rand(800, 1300);
      const c = new THREE.Vector3(p.pos.x + Math.cos(a) * d, clamp(p.pos.y + rand(-200, 200), -ARENA.halfHeight * 0.7, ARENA.halfHeight * 0.7), p.pos.z + Math.sin(a) * d);
      if (Math.hypot(c.x, c.z) > ARENA.radius * 0.85) continue;
      if (this.field.monoliths.some((m) => m.pos.distanceTo(c) < m.r * 1.4 + 90)) continue;
      if (this.field.statics.some((s) => s.pos.distanceTo(c) < s.r + 90)) continue;
      pos = c;
    }
    if (!pos) pos = new THREE.Vector3(0, 0, 0);
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
    this.hazards.clearMines();
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
      const keep = { hull: p.hull, shield: p.shield, missiles: p.missiles, charges: p.charges };
      this.ui.show(null);
      this.loadSector(this.sector + 1, false);
      Object.assign(p, keep);
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
      case 'missile': p.maxMissiles += 3; p.missiles = p.maxMissiles; break;
      case 'boost': p.maxBoost *= 1.35; p.boostRegen *= 1.35; p.boost = p.maxBoost; break;
      case 'agility': p.agility *= 1.15; break;
      case 'magnet': p.magnet *= 1.6; p.puDur *= 1.3; break;
      case 'charge': p.maxCharges += 1; p.abilityPower *= 1.15; p.charges = p.maxCharges; break;
    }
  }

  gameOver() {
    this.state = 'gameover';
    this.hudVisible = false;
    this.dom.touch.classList.remove('on');
    this.dom.pause.classList.remove('on');
    this.tutorial.coach.hide();
    const isBest = this.score > this.best.score;
    if (isBest) this.best = { score: this.score, sector: this.sector };
    saveBest(this.best);
    profile.data.stats.kills += this.kills;
    profile.save();
    this.ui.showGameOver({ score: this.score, sector: this.sector, kills: this.kills, rocks: this.rocks, best: this.best.score, credits: this.runCredits }, isBest);
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

  addCredits(n, pos) {
    if (this.state !== 'playing' && this.state !== 'dead') return;
    if (this.tutorial.active || n <= 0) return;
    const got = profile.addCredits(n * this.player.creditMul);
    this.runCredits += got;
    if (pos && got >= 5) this.hud.popup(pos.clone().add(_v.set(0, 6, 0)), `+${got} CR`, '#7dffb0');
    this.hints.maybe('credits');
  }

  onAsteroidDestroyed(a, cause) {
    const s = this.spatial(a.pos);
    const size = a.tier === 'L' ? 2 : a.tier === 'M' ? 1.2 : 0.7;
    this.fx.rockBurst(a.pos, a.r, a.color);
    audio.rockBreak(size, s.vol, s.pan);
    if (PLAYER_CAUSES.has(cause)) {
      this.rocks++;
      this.addScore(ASTEROID_TIERS[a.tier].score, a.pos, false);
      if (a.tier === 'L') this.addCredits(CREDITS.asteroidL, null);
      else if (a.tier === 'M') this.addCredits(CREDITS.asteroidM, null);
    }
    if (a.type === 'volatile') this.blasts.push({ pos: a.pos.clone(), r: 90 + a.r * 1.2, cause: PLAYER_CAUSES.has(cause) ? 'blast' : 'env', delay: 0.06 });
    if (a.type === 'crystal') {
      this.powerups.spawn(randomPowerupType(), a.pos, 30, randomUnit(_v).multiplyScalar(5));
    }
    if (s.d < 200) this.shake(a.r / 150);
  }

  onEnemyKilled(e) {
    const s = this.spatial(e.pos);
    const big = e.type === 'warden' || (e.part && e.part.role !== 'turret');
    this.fx.explosion(e.pos, big ? 2.4 : e.type === 'hornet' ? 0.8 : 1.2);
    audio.explosion(big ? 2.5 : 1.3, Math.max(0.3, s.vol), s.pan);
    if (this.player.alive && !e.tutorial) {
      this.kills++;
      this.addScore(e.def.score, e.pos, true);
      this.addCredits(e.def.credits || 0, e.pos);
    }
    if (!e.tutorial && chance(e.def.drop)) this.powerups.spawn(randomPowerupType(), e.pos, 25, _v.copy(e.vel).multiplyScalar(0.25));
    if (s.d < 250) this.shake(big ? 0.5 : 0.25);
    if (this.lock.target === e) this.lock = { target: null, progress: 0, locked: false };
    if (e.part && this.boss) this.boss.onPartKilled(e);
  }

  onEnemyEvent(name, e, x) {
    const s = this.spatial(e.pos);
    switch (name) {
      case 'kamikaze': audio.kamikaze(s.vol, s.pan); break;
      case 'mine': audio.mineDrop(s.vol, s.pan); break;
      case 'beamCharge': audio.beamCharge(s.vol, s.pan, e.def.charge); this.hints.maybe('longbow'); break;
      case 'beamFire':
        audio.beamFire(s.vol, s.pan);
        this.fx.flash(x.from, 14, 0xff5040, 0.2);
        if (x.hit) {
          const res = this.player.damage(e.damage);
          this.fx.sparks(this.player.pos, 0xff6040, 16, 50);
          this.onPlayerHit(res, _v.subVectors(x.from, this.player.pos).normalize());
        }
        break;
      case 'detonate':
        audio.explosion(1.2, Math.max(0.3, s.vol), s.pan);
        this.blastAt(x.pos, x.radius, x.damage, 'hornet');
        break;
    }
  }

  // Generic blast (mines, kamikaze drones) that hurts the player and rattles nearby rocks.
  blastAt(pos, radius, dmg, kind) {
    const p = this.player;
    const d = p.pos.distanceTo(pos);
    if (p.alive && d < radius) {
      const res = p.damage(dmg * (1 - 0.5 * d / radius));
      p.knock.add(_v.subVectors(p.pos, pos).normalize().multiplyScalar(40));
      this.onPlayerHit(res, _v.subVectors(pos, p.pos).normalize());
    }
    if (kind === 'mine') {
      for (const e of this.enemies.list) if (e.alive && !e.part && e.pos.distanceTo(pos) < radius) this.enemies.damage(e, dmg * 2);
    }
    if (this.spatial(pos).d < 200) this.shake(0.3);
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
    if (this.state === 'dead') return;
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
    this.wingmen.clear();
    audio.setEngine(false);
    profile.save();
  }

  // Bolt vs rocks (and static colliders) along a segment; returns what was hit or null.
  boltVsRocks(b) {
    let hit = null;
    _v.addVectors(b.prev, b.pos).multiplyScalar(0.5);
    const half = b.prev.distanceTo(b.pos) * 0.5;
    this.field.query(_v, half + 2, (a) => {
      if (a.shape === 'sphere') {
        if (segPointDistSq(b.prev, b.pos, a.pos) < a.r * a.r) { hit = a; return false; }
      } else if (a.tier === 'X') {
        if (this.field.surfaceDistance(a, b.pos) < 0) { hit = a; return false; }
      } else if (segPointDistSq(b.prev, b.pos, a.pos) < a.r * a.r * 0.8) { hit = a; return false; }
    });
    return hit;
  }

  playerBoltHit(b) {
    if (this.hazards.mines.length && this.hazards.hitMine(b.prev, b.pos)) return true;
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      if (b.hits && b.hits.has(e)) continue;
      const rr = e.radius + 1.2;
      if (segPointDistSq(b.prev, b.pos, e.pos) < rr * rr) {
        const s = this.spatial(b.pos);
        audio.boltImpact(s.vol, s.pan);
        if (e.shielded) {
          this.fx.sparks(b.pos, 0x8fd8ff, 6, 30);
          this.enemies.damage(e, 0);
          return true;
        }
        this.fx.sparks(b.pos, 0xffc080, 6, 40);
        this.enemies.damage(e, b.damage);
        if (b.pierce) { b.hits.add(e); continue; }
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
      const rr = PLAYER.radius + (b.scale > 1 ? 3 : 1.6);
      if (segPointDistSq(b.prev, b.pos, p.pos) < rr * rr) {
        const res = p.damage(b.damage);
        this.fx.sparks(b.pos, p.shield > 0 ? 0x6fc8ff : 0xffa060, 8, 35);
        this.onPlayerHit(res, _v.copy(b.dir).negate());
        return !!res || !p.ghost;
      }
    }
    const a = this.boltVsRocks(b);
    if (a) {
      if (a.boss) return false; // boss guns fire out through their own hull
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
      const rr = e.radius + 2.5 * m.K.scale;
      if (segPointDistSq(m.prev, m.pos, e.pos) < rr * rr) { hit = true; break; }
    }
    if (!hit && this.hazards.mines.length) hit = this.hazards.hitMine(m.prev, m.pos);
    if (!hit) hit = !!this.boltVsRocks(m);
    if (!hit) return false;
    const R = m.splash;
    this.fx.explosion(m.pos, m.kind === 'torpedo' ? 2.4 : m.kind === 'swarm' ? 0.6 : 0.9, 0xff7a3a);
    if (m.kind === 'torpedo') this.fx.ring(m.pos, 4, R, 0xff6aa0, 0.6);
    const s = this.spatial(m.pos);
    audio.explosion(m.kind === 'torpedo' ? 2.6 : 1.2, s.vol, s.pan);
    for (const e of this.enemies.list) {
      if (!e.alive) continue;
      const d = e.pos.distanceTo(m.pos);
      if (d < R + e.radius) this.enemies.damage(e, m.damage * (d < e.radius + 4 ? 1 : 0.6));
    }
    const rocks = [];
    this.field.query(m.pos, R + 55, (a) => { if (a.tier !== 'X' && a.pos.distanceTo(m.pos) < R + a.r) rocks.push(a); });
    rocks.forEach((a) => this.field.damage(a, m.damage * 0.8, 'missile', _v.subVectors(a.pos, m.pos).normalize().multiplyScalar(200)));
    if (m.kind === 'torpedo' && s.d < 250) this.shake(0.4);
    return true;
  }

  missileRetarget(m) {
    let best = null, bs = -Infinity;
    for (const e of this.enemies.list) {
      if (!e.alive || e.shielded) continue;
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
    this.missilesFired++;
    const lockT = this.lock.target && this.lock.target.alive && !this.lock.target.shielded ? this.lock.target : null;
    const pos = _v.copy(p.pos).addScaledVector(p.up, -1.4).addScaledVector(p.forward, 2);
    const kind = p.secondaryId;
    if (kind === 'swarm') {
      // Spread four mini-missiles over the lock target and its nearest neighbours.
      const targets = this.enemies.list.filter((e) => e.alive && !e.shielded && e.pos.distanceTo(p.pos) < 900)
        .sort((a, b) => a.pos.distanceTo(p.pos) - b.pos.distanceTo(p.pos));
      if (lockT) targets.unshift(lockT);
      const side = _v2.crossVectors(p.forward, p.up).normalize();
      for (let i = 0; i < 4; i++) {
        const dir = p.forward.clone().addScaledVector(side, (i - 1.5) * 0.25).addScaledVector(p.up, (i % 2 ? 0.12 : -0.12)).normalize();
        this.proj.fireMissile(pos, dir, p.vel, targets.length ? targets[i % targets.length] : null, 26 * p.damageMul, 'swarm');
      }
    } else if (kind === 'torpedo') {
      this.proj.fireMissile(pos, p.forward, p.vel, lockT, 170 * p.damageMul, 'torpedo');
    } else {
      this.proj.fireMissile(pos, p.forward, p.vel, lockT, PLAYER.missileDamage * p.damageMul, 'seeker');
    }
    audio.missileLaunch();
    haptic(25);
  }

  useAbility() {
    const p = this.player;
    if (p.charges <= 0) { audio.ui(); return; }
    p.charges--;
    this.abilitiesUsed++;
    if (p.utilityId === 'drone') {
      this.wingmen.spawn(p, 20 * p.abilityPower);
      audio.droneDeploy();
      haptic(30);
      this.hints.maybe('wingman');
    } else if (p.utilityId === 'dash') {
      p.dashT = 0.42 * p.abilityPower;
      this.fx.flash(p.pos, 30, 0xe8f6ff, 0.25);
      this.fx.ring(p.pos, 2, 30, 0xe8f6ff, 0.3);
      audio.dash();
      haptic(40);
    } else this.fireEmp();
  }

  fireEmp() {
    const p = this.player;
    const R = p.empRadius * p.abilityPower;
    this.emps.push({ c: p.pos.clone(), r: 0, max: R, hit: new Set() });
    this.fx.flash(p.pos, 45, 0x8fe6ff, 0.35);
    this.fx.ring(p.pos, 4, R, 0x8fe6ff, 0.55);
    audio.emp();
    haptic(60);
    this.shake(0.3);
  }

  // EMP: stuns enemies (no kills), erases hostile fire, nudges loose rocks away.
  updateEmps(dt) {
    for (const n of this.emps) {
      n.r = Math.min(n.max, n.r + 650 * dt);
      const k = n.r / n.max;
      this.empMesh.visible = this.empGlow.visible = true;
      this.empMesh.position.copy(n.c);
      this.empMesh.scale.setScalar(Math.max(1, n.r));
      this.empMesh.rotation.set(Math.random() * 6, Math.random() * 6, 0);
      this.empMesh.material.opacity = 0.35 * (1 - k) + 0.03;
      this.empGlow.position.copy(n.c);
      this.empGlow.scale.setScalar(n.r * 1.2);
      this.empGlow.material.opacity = 0.12 * (1 - k);
      for (const e of this.enemies.list) {
        if (e.alive && !n.hit.has(e) && e.pos.distanceTo(n.c) < n.r + e.radius) {
          n.hit.add(e);
          this.enemies.stun(e, PLAYER.empStun * (e.type === 'warden' ? 0.6 : 1));
          if (!e.shielded) this.enemies.damage(e, 8);
          this.fx.sparks(e.pos, 0x9fe6ff, 18, 45);
          if (e.alive && !e.part) this.hud.popup(e.pos, 'STUNNED', '#8fe6ff');
          if (this.lock.target === e) this.lock.progress = 1;
        }
      }
      for (const m of this.hazards.mines) if (m.alive && m.pos.distanceTo(n.c) < n.r) this.hazards.detonate(m);
      this.field.query(n.c, n.r + 20, (a) => {
        if (a.tier === 'X' || a.tier === 'L' || n.hit.has(a)) return;
        if (a.pos.distanceTo(n.c) > n.r) return;
        n.hit.add(a);
        a.vel.addScaledVector(_v.subVectors(a.pos, n.c).normalize(), a.tier === 'S' ? 40 : 18);
      });
      for (const b of this.proj.enemy.items) if (b.pos.distanceTo(n.c) < n.r) b.life = 0;
      if (n.r >= n.max) n.done = true;
    }
    this.emps = this.emps.filter((n) => !n.done);
    if (!this.emps.length) this.empMesh.visible = this.empGlow.visible = false;
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
    const boltSpeed = p.primary.speed;
    for (const e of this.enemies.list) {
      if (!e.alive || e.shielded) continue;
      const d = e.pos.distanceTo(p.pos);
      if (d > 520) continue;
      leadPoint(p.pos, e.pos, _v2.subVectors(e.vel, p.vel), boltSpeed, _v);
      _v3.subVectors(_v, p.pos).normalize();
      const ang = Math.acos(clamp(_v3.dot(p.forward), -1, 1));
      if (ang < best + e.radius / Math.max(d, 1)) {
        best = ang;
        this.aimTarget = e;
        this.aimPoint.copy(_v);
      }
    }
    // Lock-on.
    let cand = null, cs = Infinity;
    for (const e of this.enemies.list) {
      if (!e.alive || e.shielded) continue;
      _v.subVectors(e.pos, p.pos);
      const d = _v.length();
      if (d > 950) continue;
      const ang = Math.acos(clamp(_v.dot(p.forward) / d, -1, 1));
      if (ang > 0.42) continue;
      const sc = ang * (1 + d / 1500);
      if (sc < cs) { cs = sc; cand = e; }
    }
    const L = this.lock;
    if (L.locked && L.target && L.target.alive && !L.target.shielded && cand !== L.target) {
      _v.subVectors(L.target.pos, p.pos);
      const d = _v.length();
      if (d < 1000 && _v.dot(p.forward) / d > Math.cos(0.65)) cand = L.target;
    }
    if (cand !== L.target) {
      L.target = cand;
      L.progress = 0;
      L.locked = false;
    } else if (cand) {
      L.progress = Math.min(1, L.progress + dt * 2.3 * p.lockSpeed);
      if (L.progress >= 1 && !L.locked) {
        L.locked = true;
        audio.lockBeep(true);
        haptic(10);
      } else if (!L.locked) audio.lockBeep(false);
    }
  }

  updateCollisions(dt) {
    const p = this.player, field = this.field;
    this.proximity = 0;
    if (p.alive) {
      _v.copy(p.pos).addScaledVector(p.forward, 30);
      field.query(_v, 45, (a) => {
        if (field.surfaceDistance(a, _v) < 25 && a.tier !== 'S') { this.proximity = 1; return false; }
      });
      if (!p.ghost) {
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
          const impact = Math.max(0, -vn);
          if (vn < 0) p.knock.addScaledVector(n, impact * (a.tier === 'S' ? 0.8 : 1.4) + 8);
          if (this.collideCd <= 0) {
            this.collideCd = 0.35;
            // Damage scales with how hard you hit and how big the thing is. Grinding against
            // the same rock right after a hit only scrapes.
            const mass = IMPACT_MASS[a.tier] || 1;
            const repeat = this.lastImpact === a && this.time - this.lastImpactT < 1;
            let dmg = impact < 8 || repeat ? 1.5 * mass : impact * 0.42 * mass;
            if (!repeat && impact >= 8) { this.lastImpact = a; this.lastImpactT = this.time; }
            dmg = Math.min(70, dmg * p.collisionMul);
            if (impact > 40) p.speed *= 0.55;
            const res = p.damage(dmg);
            this.fx.sparks(_v3.copy(p.pos).addScaledVector(n, -PLAYER.radius), 0xffd0a0, 8 + Math.min(20, impact * 0.3), 50);
            audio.rockBreak(0.4 + Math.min(1.6, impact / 60), 0.9, 0);
            if (impact > 15) {
              this.onPlayerHit(res, _v3.copy(n).negate());
              this.shake(Math.min(0.8, impact / 120));
              this.hints.maybe('impact');
            }
            if (a.tier === 'S' && impact > 20) field.destroy(a, 'ram');
            else if (a.tier !== 'X') field.damage(a, impact * 0.3, 'ram', null);
          }
        }
      }
      for (const e of this.enemies.list) {
        if (!e.alive || e.part) continue;
        const rr = e.radius + PLAYER.radius;
        if (e.pos.distanceToSquared(p.pos) < rr * rr) {
          if (e.type === 'hornet') { this.enemies.detonate(e); continue; }
          const res = p.damage(20 * p.collisionMul);
          p.knock.add(_v.subVectors(p.pos, e.pos).normalize().multiplyScalar(40));
          this.onPlayerHit(res, _v3.copy(_v).negate());
          this.enemies.damage(e, 80);
        }
      }
    }
    for (const e of this.enemies.list) {
      if (!e.alive || e.part || e.spawnT < 0.6) continue;
      let crash = null;
      field.query(e.pos, e.radius + 2, (a) => {
        if (a.boss) return;
        const sd = a.tier === 'X' ? field.surfaceDistance(a, e.pos) : e.pos.distanceTo(a.pos) - a.r * 0.8;
        if (sd < e.radius * 0.7) { crash = [a, sd]; return false; }
      });
      if (crash) {
        const [a, sd] = crash;
        const n = _v.subVectors(e.pos, a.pos).normalize();
        e.pos.addScaledVector(n, e.radius * 0.7 - sd + 0.5);
        e.fwd.addScaledVector(n, 1.2).normalize();
        this.fx.sparks(e.pos, 0xffd0a0, 10, 40);
        if (e.type === 'hornet') this.enemies.detonate(e);
        else this.enemies.damage(e, 35);
      }
    }
    if (this.gate.visible && this.state === 'playing' && p.alive) {
      if (p.pos.distanceTo(this.gate.position) < 42) this.startWarp();
    }
  }

  updateHints(dt) {
    this.hintTick -= dt;
    if (this.hintTick > 0) return;
    this.hintTick = 0.5;
    const p = this.player;
    this.field.query(p.pos, 260, (a) => {
      if (a.type === 'volatile') this.hints.maybe('volatile');
      else if (a.type === 'crystal') this.hints.maybe('crystal');
    });
  }

  updateCamera(dt) {
    const p = this.player, cam = this.camera;
    if (this.state === 'title') {
      const hangar = this.viewMode === 'hangar';
      const t = this.time * (hangar ? 0.25 : 0.12);
      const R = hangar ? 17 : 20;
      cam.position.set(p.pos.x + Math.sin(t) * R, p.pos.y + (hangar ? 4 : 5) + Math.sin(t * 0.7) * 3, p.pos.z + Math.cos(t) * R);
      cam.up.set(0, 1, 0);
      // Look past the ship so it sits clear of the menu (left third on the title, left half in the hangar).
      _v2.subVectors(p.pos, cam.position).normalize();
      _v3.crossVectors(_v2, cam.up).normalize();
      const portrait = cam.aspect < 1;
      const side = portrait ? 0 : hangar ? 8.5 : 9;
      cam.lookAt(_v.copy(p.pos).addScaledVector(_v3, side).add(_v2.set(0, portrait && hangar ? 6 : hangar ? 1.2 : 3.5, 0)));
      this.fov = hangar ? 55 : 60;
    } else {
      const warping = this.state === 'warping';
      const back = p.boosting || p.dashT > 0 ? 17.5 : 14.5;
      if (!warping) {
        _v.copy(p.pos).addScaledVector(p.forward, -back).addScaledVector(p.levelUp, 4.4);
        if (p.alive) {
          const lam = p.dashT > 0 ? 5 : 11;
          this.camPos.x = damp(this.camPos.x, _v.x, lam, dt);
          this.camPos.y = damp(this.camPos.y, _v.y, lam, dt);
          this.camPos.z = damp(this.camPos.z, _v.z, lam, dt);
          this.camLook.copy(p.pos).addScaledVector(p.forward, 40).addScaledVector(p.levelUp, 1.2);
        } else if (this.deathDir) {
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
      this.fov = warping ? 115 : p.dashT > 0 ? 95 : p.boosting ? 84 : p.braking ? 66 : 72;
    }
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    if (cam.aspect < 1.2) {
      const h = THREE.MathUtils.degToRad(this.fov) * 0.5;
      const want = 2 * Math.atan(Math.tan(h) * 1.35 / cam.aspect);
      this.fov = Math.min(105, THREE.MathUtils.radToDeg(want));
    }
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
    if (this._bc !== p.charges) {
      this._bc = p.charges;
      this.dom.charges.textContent = p.charges;
      this.dom.bUtil.classList.toggle('empty', p.charges <= 0);
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
    switch (this.waveState) {
      case 'tutorial': return 'FLIGHT TRAINING';
      case 'gate': return 'REACH THE WARP GATE';
      case 'bossIntro': return 'CAPITAL SHIP INBOUND';
      case 'boss': return this.boss ? `DESTROY THE ${this.boss.name}` : '';
      case 'bossDown': return 'TARGET DESTROYED';
      case 'fighting': {
        const n = this.enemies.aliveCount + this.spawnQueue.reduce((s, q) => s + q.types.length, 0);
        return `SECTOR ${this.sector} · WAVE ${this.wave}/${WAVES_PER_SECTOR} · HOSTILES ${n}`;
      }
      default: return `SECTOR ${this.sector} · ${this.theme.name}`;
    }
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
    const app = document.getElementById('app');
    const w = app.clientWidth || window.innerWidth, h = app.clientHeight || window.innerHeight;
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

    if (this.slowmo > 0) this.slowmo -= rawDt;
    this.timeScale = damp(this.timeScale, this.slowmo > 0 ? 0.3 : 1, 6, rawDt);
    const dt = rawDt * this.timeScale;
    this.time += dt;

    const p = this.player;
    this.input.update(rawDt);
    if (this.state === 'playing') {
      for (const ev of this.input.consume()) {
        if (ev === 'missile') this.fireMissile();
        else if (ev === 'emp') this.useAbility();
        else if (ev === 'radar') this.toggleRadar();
        else if (ev === 'pause') { this.pause(); return; }
      }
      p.update(dt, this.input, this.settings, this.time);
      this.updateTargeting(dt);
      p.fireCd -= dt;
      const L = this.lock;
      const homing = L.locked && L.target && L.target.alive && !L.target.shielded ? L.target : null;
      const auto = this.settings.autoFire && (this.aimTarget || homing);
      if ((this.input.fire || auto) && p.fireCd <= 0 && p.alive) {
        if (homing) {
          leadPoint(p.pos, homing.pos, _v2.subVectors(homing.vel, p.vel), p.primary.speed, _v);
          p.fire(_v, 1, homing);
        } else p.fire(this.aimTarget ? this.aimPoint : null);
      }
      this.updateWaves(dt);
      this.tutorial.update(dt);
      this.updateHints(dt);
      this.hints.update(dt, this.tutorial.active);
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
      for (const s of p.engines) s.scale.setScalar(s.userData.baseSize * (0.85 + Math.random() * 0.3));
    }
    this.input.consume();
    this.tutorial.coach.update(rawDt);
    const coachTop = this.boss && this.state === 'playing' ? '27%' : '15%';
    if (this._coachTop !== coachTop) { this._coachTop = coachTop; this.tutorial.coach.box.style.top = coachTop; }

    this.field.update(dt);
    if (this.boss) this.boss.update(dt, p);
    this.enemies.update(dt, p);
    this.hazards.updateMines(dt, p);
    this.wingmen.update(dt, p, this.enemies, this.field, this.lock.locked ? this.lock.target : null);
    this.proj.update(dt, this.projHooks);
    this.powerups.update(dt, p, (pu) => {
      p.applyPowerup(pu.type);
      if (pu.type === 'wingman') { this.wingmen.spawn(p, POWERUPS.wingman.timed * p.puDur); audio.droneDeploy(); this.hints.maybe('wingman'); }
      audio.pickup();
      haptic(20);
      this.hud.popup(pu.pos, pu.def.name, pu.def.css);
      this.fx.flash(pu.pos, 30, pu.def.color, 0.3);
    });
    if (this.state === 'playing' || this.state === 'dead') {
      this.updateCollisions(dt);
      this.updateEmps(dt);
      this.updateBlasts(dt);
    }
    if (this.gate.visible) {
      this.gateT += dt;
      this.gate.scale.setScalar(Math.min(1, this.gateT / 1.2));
      this.gate.userData.segs.rotation.z += dt * 0.6;
      this.gate.userData.disk.rotation.z -= dt * 1.5;
    }

    this.updateCamera(rawDt);
    this.world.update(dt, this.camera.position, this.state === 'title' ? _v.set(0, 0, 0) : p.vel);
    this.fx.update(dt, this.camera);

    this.engineTick -= rawDt;
    if (this.engineTick <= 0) {
      this.engineTick = 0.1;
      const flying = (this.state === 'playing' || this.state === 'warping') && p.alive;
      audio.setEngine(flying, clamp(p.speed / p.boostSpeed, 0, 1), p.boosting || p.dashT > 0 || this.state === 'warping');
      if (audio.music) {
        let inten = 0;
        if (this.state === 'playing') {
          if (this.boss) inten = 1;
          else {
            const n = this.enemies.aliveCount;
            let near = Infinity;
            for (const e of this.enemies.list) if (e.alive) near = Math.min(near, e.pos.distanceTo(p.pos));
            inten = clamp(n / 6, 0, 1) * 0.6 + (near < 450 ? 0.4 : 0);
          }
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
