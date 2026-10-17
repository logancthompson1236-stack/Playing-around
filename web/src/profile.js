// Persistent player profile: credits, purchases, loadout, tutorial/hint flags, control layout.
import { SHIPS, PRIMARIES, SECONDARIES, UTILITIES, MODULES } from './content.js';

const KEY = 'shardfall.profile.v1';
const CATS = { ships: SHIPS, primaries: PRIMARIES, secondaries: SECONDARIES, utilities: UTILITIES, modules: MODULES };
const SLOT = { ships: 'ship', primaries: 'primary', secondaries: 'secondary', utilities: 'utility' };

function fresh() {
  return {
    credits: 0,
    owned: { ships: ['kestrel'], primaries: ['twin'], secondaries: ['seeker'], utilities: ['emp'], modules: [] },
    loadout: { ship: 'kestrel', primary: 'twin', secondary: 'seeker', utility: 'emp', modules: [] },
    tutorialDone: false,
    hints: {},
    controls: null, // { pos: {btn: [fx, fy]}, size, opacity }
    stats: { runs: 0, bestSector: 0, kills: 0, creditsEarned: 0 },
  };
}

class Profile {
  constructor() {
    this.data = fresh();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        const f = fresh();
        this.data = { ...f, ...d, owned: { ...f.owned, ...(d.owned || {}) }, loadout: { ...f.loadout, ...(d.loadout || {}) }, stats: { ...f.stats, ...(d.stats || {}) } };
      }
    } catch (e) { /* storage unavailable: play with a fresh profile */ }
    this._sanitize();
  }

  _sanitize() {
    const d = this.data;
    for (const [cat, items] of Object.entries(CATS)) d.owned[cat] = (d.owned[cat] || []).filter((id) => items[id]);
    for (const [cat, slot] of Object.entries(SLOT)) {
      if (!d.owned[cat].includes(d.loadout[slot])) d.loadout[slot] = fresh().loadout[slot];
      if (!d.owned[cat].includes(d.loadout[slot])) d.owned[cat].push(d.loadout[slot]);
    }
    d.loadout.modules = (d.loadout.modules || []).filter((m) => d.owned.modules.includes(m)).slice(0, this.slots);
  }

  get slots() { return (SHIPS[this.data.loadout.ship] || SHIPS.kestrel).slots; }
  get credits() { return this.data.credits; }
  get loadout() { return this.data.loadout; }

  save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  }

  addCredits(n) {
    n = Math.max(0, Math.round(n));
    this.data.credits += n;
    this.data.stats.creditsEarned += n;
    return n;
  }

  owns(cat, id) { return this.data.owned[cat].includes(id); }

  buy(cat, id) {
    const item = CATS[cat][id];
    if (!item || this.owns(cat, id) || this.data.credits < item.price) return false;
    this.data.credits -= item.price;
    this.data.owned[cat].push(id);
    this.save();
    return true;
  }

  // Equip an owned item. Modules toggle in/out of the limited slots.
  equip(cat, id) {
    if (!this.owns(cat, id)) return false;
    const L = this.data.loadout;
    if (cat === 'modules') {
      const i = L.modules.indexOf(id);
      if (i >= 0) L.modules.splice(i, 1);
      else if (L.modules.length < this.slots) L.modules.push(id);
      else return false;
    } else {
      L[SLOT[cat]] = id;
      if (cat === 'ships') L.modules = L.modules.slice(0, this.slots);
    }
    this.save();
    return true;
  }

  isEquipped(cat, id) {
    const L = this.data.loadout;
    return cat === 'modules' ? L.modules.includes(id) : L[SLOT[cat]] === id;
  }

  seenHint(id) { return !!this.data.hints[id]; }
  markHint(id) { this.data.hints[id] = 1; this.save(); }

  reset() { this.data = fresh(); this.save(); }
}

export const profile = new Profile();
