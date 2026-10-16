// Core tuning + content definitions for SHARDFALL.

export const ARENA = {
  radius: 2200,      // horizontal radius of a sector
  halfHeight: 750,   // vertical half extent
};

export const PLAYER = {
  cruise: 70,
  boostSpeed: 155,
  brakeSpeed: 22,
  yawRate: 1.9,
  pitchRate: 1.6,
  maxPitch: 1.25,
  hull: 100,
  shield: 100,
  shieldRegen: 17,      // per second
  shieldDelay: 2.8,     // seconds after damage before regen
  boost: 100,
  boostDrain: 32,
  boostRegen: 18,
  fireInterval: 0.12,
  boltSpeed: 520,
  boltDamage: 10,
  boltLife: 0.95,
  missiles: 5,
  maxMissiles: 8,
  missileDamage: 75,
  homingTurn: 2.7,      // rad/s that cannon bolts curve toward a locked target
  emps: 1,
  maxEmps: 2,
  empRadius: 260,
  empStun: 4.0,         // seconds enemies are disabled
  pickupRadius: 9,
  magnetRadius: 45,
  radius: 2.6,
};

// Sector visual themes. Colors are hex ints.
export const THEMES = [
  {
    name: 'KEPLER BELT',
    base: 0x05060f, nebA: 0x5b2bd6, nebB: 0x149fe0, nebC: 0xd13f9a,
    rock: [0x8d8a94, 0x6f6b78, 0x9a958c], fog: 0x0a0b1c,
    sun: 0xfff1d9, sunDir: [0.55, 0.35, -0.75], hemiSky: 0x5b6bb0, hemiGround: 0x1b1028,
    planet: { color: 0xc77b4a, dir: [-0.6, 0.15, 0.78], size: 0.32, ring: true },
    accent: '#7fd6ff',
  },
  {
    name: 'CRIMSON DRIFT',
    base: 0x0d0406, nebA: 0xc4281e, nebB: 0xf08a24, nebC: 0x6b1460,
    rock: [0x8e5a46, 0x6d4234, 0xa36d55], fog: 0x1a0708,
    sun: 0xffd2a8, sunDir: [-0.4, 0.25, -0.85], hemiSky: 0xb05040, hemiGround: 0x200808,
    planet: { color: 0x7a9fbf, dir: [0.7, 0.3, 0.65], size: 0.22, ring: false },
    accent: '#ffb27f',
  },
  {
    name: 'GLACIER RING',
    base: 0x020a10, nebA: 0x1b8fb8, nebB: 0x8fe6ff, nebC: 0x2a3fa8,
    rock: [0xb8d4e3, 0x8fb3c9, 0xdbeef7], fog: 0x061520,
    sun: 0xe6f6ff, sunDir: [0.2, 0.6, -0.78], hemiSky: 0x7fc4e6, hemiGround: 0x0b1b2a,
    planet: { color: 0xe8e2d0, dir: [-0.75, -0.1, 0.65], size: 0.38, ring: true },
    accent: '#a6f0ff',
  },
  {
    name: 'VERDANT VEIL',
    base: 0x030a05, nebA: 0x2fa84a, nebB: 0xc8e04a, nebC: 0x177a7a,
    rock: [0x6f7a5e, 0x56604a, 0x8a8f6a], fog: 0x07140a,
    sun: 0xf4ffd6, sunDir: [0.75, 0.2, 0.6], hemiSky: 0x6fae5a, hemiGround: 0x0c1a08,
    planet: { color: 0x9b6bd1, dir: [-0.3, 0.45, -0.84], size: 0.26, ring: false },
    accent: '#c6ff8a',
  },
  {
    name: 'OBSIDIAN RIFT',
    base: 0x060504, nebA: 0xd19a2a, nebB: 0x7a3df0, nebC: 0x2a1a0a,
    rock: [0x4a4642, 0x3a3532, 0x5e5650], fog: 0x0d0a06,
    sun: 0xffe2a0, sunDir: [-0.7, 0.4, 0.58], hemiSky: 0x8a6a40, hemiGround: 0x100a04,
    planet: { color: 0x3a6fd8, dir: [0.5, -0.05, -0.86], size: 0.3, ring: true },
    accent: '#ffd36b',
  },
];

export const ASTEROID_TIERS = {
  L: { rMin: 30, rMax: 52, hp: 70, score: 50, children: [2, 3], child: 'M' },
  M: { rMin: 13, rMax: 21, hp: 26, score: 25, children: [2, 3], child: 'S' },
  S: { rMin: 5, rMax: 8.5, hp: 8, score: 10, children: [0, 0], child: null },
  X: { rMin: 130, rMax: 270, hp: Infinity, score: 0, children: [0, 0], child: null }, // monolith (unbreakable)
};

export const ENEMIES = {
  raider: {
    name: 'Raider', hp: 45, speed: 58, turn: 1.4, radius: 4.2,
    fireCooldown: 1.25, burst: 2, burstGap: 0.14, spread: 0, damage: 5, range: 580,
    score: 100, drop: 0.26,
  },
  lancer: {
    name: 'Lancer', hp: 30, speed: 84, turn: 2.0, radius: 3.8,
    fireCooldown: 1.8, burst: 3, burstGap: 0.1, spread: 0, damage: 4, range: 500,
    score: 150, drop: 0.28,
  },
  warden: {
    name: 'Warden', hp: 220, speed: 34, turn: 0.7, radius: 9,
    fireCooldown: 2.0, burst: 2, burstGap: 0.25, spread: 3, damage: 7, range: 680,
    score: 400, drop: 0.85,
  },
};

// Power-ups. `timed` ones count down; others are instant.
export const POWERUPS = {
  repair:  { name: 'HULL REPAIR',   color: 0x45ff8a, css: '#45ff8a', icon: '+', weight: 3.5 },
  shield:  { name: 'OVERSHIELD',    color: 0x4aa8ff, css: '#4aa8ff', icon: 'S', weight: 4 },
  rapid:   { name: 'RAPID FIRE',    color: 0xffe14a, css: '#ffe14a', icon: 'R', weight: 2.5, timed: 15 },
  spread:  { name: 'SPREAD SHOT',   color: 0xff8a2a, css: '#ff8a2a', icon: 'W', weight: 2.5, timed: 15 },
  missile: { name: 'SEEKER PACK',   color: 0xff4a5e, css: '#ff4a5e', icon: 'M', weight: 4 },
  emp:     { name: 'EMP CELL',      color: 0x5ad8ff, css: '#5ad8ff', icon: 'E', weight: 1.4 },
  phase:   { name: 'PHASE SHIELD',  color: 0xffffff, css: '#ffffff', icon: 'P', weight: 0.9, timed: 8 },
};

export const UPGRADES = [
  { id: 'hull',    name: 'Reinforced Hull',   desc: '+25 max hull, full repair' },
  { id: 'shield',  name: 'Shield Capacitor',  desc: '+25 max shield' },
  { id: 'regen',   name: 'Fast Recharge',     desc: 'Shields regen 40% faster, start sooner' },
  { id: 'damage',  name: 'Overcharged Bolts', desc: '+20% cannon damage' },
  { id: 'rate',    name: 'Autoloaders',       desc: '+15% fire rate' },
  { id: 'missile', name: 'Missile Rack',      desc: '+3 max seekers, refill' },
  { id: 'boost',   name: 'Afterburner',       desc: '+35% boost capacity & regen' },
  { id: 'agility', name: 'Vector Thrusters',  desc: '+15% turn rate & speed' },
  { id: 'magnet',  name: 'Salvage Magnet',    desc: 'Bigger pickup range, +30% power-up time' },
  { id: 'emp',     name: 'EMP Capacitor',     desc: '+1 max EMP charge, bigger pulse, refill' },
];

export const WAVES_PER_SECTOR = 3;

export function waveComposition(sector, wave) {
  const list = [];
  const count = Math.min(3 + sector + wave, 12);
  const lancerW = wave >= 2 || sector >= 2 ? 0.35 + 0.08 * sector : 0;
  const wardenW = sector >= 2 ? 0.1 + 0.04 * sector : 0;
  for (let i = 0; i < count; i++) {
    const r = Math.random() * (1 + lancerW + wardenW);
    if (r < 1) list.push('raider');
    else if (r < 1 + lancerW) list.push('lancer');
    else list.push('warden');
  }
  // Sector 1 finale gets a single Warden to introduce it.
  if (sector === 1 && wave === WAVES_PER_SECTOR) list.push('warden');
  return list;
}

// Difficulty presets (multipliers on enemy stats). "normal" is the default.
export const DIFFICULTY = {
  relaxed: { label: 'Relaxed', hp: 0.8, damage: 0.6, speed: 0.88, fireRate: 0.75, accuracy: 1.5 },
  normal:  { label: 'Normal',  hp: 1.0, damage: 1.0, speed: 1.0,  fireRate: 1.0,  accuracy: 1.0 },
  veteran: { label: 'Veteran', hp: 1.25, damage: 1.35, speed: 1.15, fireRate: 1.25, accuracy: 0.7 },
};
