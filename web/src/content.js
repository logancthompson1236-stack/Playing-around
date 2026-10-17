// Hangar content: ships, weapons, abilities and modules bought with credits.
// Stats are multipliers or absolute values consumed by Player.applyLoadout().

export const SHIPS = {
  kestrel: {
    name: 'Kestrel', price: 0, slots: 2,
    desc: 'Balanced all-rounder. Forgiving and steady.',
    cruise: 70, boost: 155, turn: 1.0, accel: 1.0, hull: 100, shield: 100, boostCap: 100, regen: 1.0,
  },
  wasp: {
    name: 'Wasp', price: 900, slots: 2,
    desc: 'Interceptor. Fast, twitchy and lightly armored.',
    cruise: 80, boost: 182, turn: 1.25, accel: 1.5, hull: 70, shield: 85, boostCap: 125, regen: 1.1,
  },
  bulwark: {
    name: 'Bulwark', price: 1300, slots: 3,
    desc: 'Heavy gunship. Slow to turn, shrugs off hits and rocks.',
    cruise: 60, boost: 135, turn: 0.8, accel: 0.7, hull: 180, shield: 140, boostCap: 90, regen: 0.9, collision: 0.6,
  },
  specter: {
    name: 'Specter', price: 2000, slots: 3,
    desc: 'Prototype. Rapid shields and a hard-to-hit profile.',
    cruise: 76, boost: 170, turn: 1.15, accel: 1.25, hull: 90, shield: 130, boostCap: 110, regen: 1.6, evasion: 0.4,
  },
};

export const PRIMARIES = {
  twin: {
    name: 'Twin Pulse', price: 0, desc: 'Reliable alternating cannons.',
    interval: 0.12, damage: 10, speed: 520, life: 0.95, pellets: 1, spread: 0, homing: 1, color: 0x34c8ff,
  },
  ion: {
    name: 'Ion Repeater', price: 500, desc: 'Very fast stream of light hits.',
    interval: 0.065, damage: 5.6, speed: 600, life: 0.8, pellets: 1, spread: 0, homing: 1, color: 0xa07bff,
  },
  scatter: {
    name: 'Scatter Cannon', price: 650, desc: 'Shotgun blast. Devastating up close, weak at range.',
    interval: 0.42, damage: 7.5, speed: 470, life: 0.55, pellets: 7, spread: 0.075, homing: 0.6, color: 0xff9a3a,
  },
  rail: {
    name: 'Rail Lance', price: 900, desc: 'Slow, heavy slugs that pierce through ships.',
    interval: 0.6, damage: 52, speed: 1000, life: 0.95, pellets: 1, spread: 0, homing: 0.5, pierce: true, color: 0x7affc8,
  },
};

export const SECONDARIES = {
  seeker: { name: 'Seeker Missiles', price: 0, desc: 'One homing missile per press.', capMul: 1 },
  swarm: { name: 'Swarm Pod', price: 600, desc: 'Four mini-missiles per press that spread across targets.', capMul: 1 },
  torpedo: { name: 'Heavy Torpedo', price: 750, desc: 'Slow, huge blast radius. Half the ammo.', capMul: 0.5 },
};

export const UTILITIES = {
  emp: { name: 'EMP Pulse', price: 0, desc: 'Stuns nearby enemies and erases incoming fire.', start: 1, max: 2, icon: 'emp' },
  drone: { name: 'Drone Bay', price: 700, desc: 'Launch a wingman drone that fights with you for 20s.', start: 1, max: 2, icon: 'drone' },
  dash: { name: 'Phase Dash', price: 550, desc: 'Blink forward, invulnerable, straight through rock.', start: 2, max: 3, icon: 'dash' },
};

export const MODULES = {
  armor: { name: 'Armor Plating', price: 350, desc: '+35 hull and 40% less impact damage.' },
  capacitor: { name: 'Shield Booster', price: 350, desc: '+35 shield capacity.' },
  thrusters: { name: 'Vector Thrusters', price: 400, desc: '+12% turning, +25% acceleration.' },
  afterburner: { name: 'Afterburner Tank', price: 300, desc: '+50% boost capacity, +30% boost recharge.' },
  targeting: { name: 'Targeting Computer', price: 450, desc: 'Locks 60% faster; homing bolts turn harder.' },
  munitions: { name: 'Munitions Rack', price: 400, desc: '+3 missile capacity, +1 ability charge.' },
  salvage: { name: 'Salvage Scanner', price: 500, desc: '+30% credits earned, wider pickup magnet.' },
};

export const CATALOG = [
  { key: 'ships', label: 'SHIPS', items: SHIPS, slot: 'ship' },
  { key: 'primaries', label: 'CANNONS', items: PRIMARIES, slot: 'primary' },
  { key: 'secondaries', label: 'MISSILES', items: SECONDARIES, slot: 'secondary' },
  { key: 'utilities', label: 'ABILITY', items: UTILITIES, slot: 'utility' },
  { key: 'modules', label: 'MODULES', items: MODULES, slot: 'modules' },
];

// Credits awarded during a run (multiplied by the Salvage Scanner).
export const CREDITS = { asteroidL: 2, asteroidM: 1, sectorClear: 40 };

// Resolve a loadout into concrete flight/combat stats.
export function computeStats(loadout) {
  const s = SHIPS[loadout.ship] || SHIPS.kestrel;
  const st = {
    cruise: s.cruise, boostSpeed: s.boost, turn: s.turn, accel: s.accel,
    hull: s.hull, shield: s.shield, boostCap: s.boostCap, boostRegenMul: 1,
    regenMul: s.regen, collision: s.collision ?? 1, evasion: s.evasion ?? 0,
    lockSpeed: 1, homingMul: 1, creditMul: 1, magnet: 1, missileBonus: 0, utilityBonus: 0,
  };
  for (const m of loadout.modules || []) {
    switch (m) {
      case 'armor': st.hull += 35; st.collision *= 0.6; break;
      case 'capacitor': st.shield += 35; break;
      case 'thrusters': st.turn *= 1.12; st.accel *= 1.25; break;
      case 'afterburner': st.boostCap *= 1.5; st.boostRegenMul *= 1.3; break;
      case 'targeting': st.lockSpeed *= 1.6; st.homingMul *= 1.35; break;
      case 'munitions': st.missileBonus += 3; st.utilityBonus += 1; break;
      case 'salvage': st.creditMul *= 1.3; st.magnet *= 1.5; break;
    }
  }
  const p = PRIMARIES[loadout.primary] || PRIMARIES.twin;
  st.dps = (p.damage * p.pellets * (p.pellets > 1 ? 0.6 : 1)) / p.interval;
  return st;
}
