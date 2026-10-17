// Hangar: browse, buy and equip ships, weapons, abilities and modules with credits.
import { CATALOG, computeStats } from './content.js';
import { profile } from './profile.js';
import { audio } from './audio.js';

const STAT_ROWS = [
  ['SPEED', (s) => s.boostSpeed / 190],
  ['AGILITY', (s) => s.turn / 1.4],
  ['ACCEL', (s) => s.accel / 1.9],
  ['HULL', (s) => s.hull / 220],
  ['SHIELD', (s) => s.shield / 180],
  ['FIREPOWER', (s) => s.dps / 140],
];

const fmt = (n) => n.toLocaleString() + ' CR';

export class Hangar {
  constructor(handlers) {
    this.h = handlers; // { previewShip(id), close() }
    this.el = document.getElementById('hangar');
    this.tabsEl = document.getElementById('hgTabs');
    this.listEl = document.getElementById('hgList');
    this.detailEl = document.getElementById('hgDetail');
    this.actionEl = document.getElementById('hgAction');
    this.creditsEl = document.getElementById('hgCredits');
    this.statsEl = document.getElementById('hgStats');
    this.loadoutEl = document.getElementById('hgLoadout');
    this.tab = 'ships';
    this.sel = null;
    this.actionEl.addEventListener('click', (e) => { e.stopPropagation(); this._action(); });
  }

  open() {
    this.tab = 'ships';
    this.sel = profile.loadout.ship;
    this.render();
  }

  _cat() { return CATALOG.find((c) => c.key === this.tab); }

  _equippedId(cat) {
    const L = profile.loadout;
    return cat.slot === 'modules' ? null : L[cat.slot];
  }

  render() {
    const cat = this._cat();
    this.creditsEl.textContent = fmt(profile.credits);
    this.tabsEl.innerHTML = '';
    for (const c of CATALOG) {
      const b = document.createElement('button');
      b.textContent = c.label;
      b.className = c.key === this.tab ? 'on' : '';
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.ui();
        this.tab = c.key;
        this.sel = this._equippedId(c) || Object.keys(c.items)[0];
        this.render();
      });
      this.tabsEl.appendChild(b);
    }
    this.listEl.innerHTML = '';
    for (const [id, item] of Object.entries(cat.items)) {
      const owned = profile.owns(cat.key, id);
      const eq = profile.isEquipped(cat.key, id);
      const b = document.createElement('button');
      b.className = 'hg-item' + (id === this.sel ? ' sel' : '') + (eq ? ' eq' : '');
      const tag = eq ? 'EQUIPPED' : owned ? 'OWNED' : fmt(item.price);
      const tagCls = eq ? 'eq' : owned ? 'own' : profile.credits >= item.price ? 'buy' : 'poor';
      b.innerHTML = `<span class="n">${item.name}</span><span class="t ${tagCls}">${tag}</span>`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.ui();
        this.sel = id;
        this.render();
      });
      this.listEl.appendChild(b);
    }
    this._renderDetail(cat);
    this._renderStats(cat);
    this._renderLoadout();
    if (cat.key === 'ships') this.h.previewShip(this.sel);
    else this.h.previewShip(profile.loadout.ship);
  }

  _renderDetail(cat) {
    const item = cat.items[this.sel];
    const owned = profile.owns(cat.key, this.sel);
    const eq = profile.isEquipped(cat.key, this.sel);
    let extra = '';
    if (cat.key === 'ships') extra = `<div class="hg-sub">${item.slots} module slots</div>`;
    if (cat.key === 'modules') extra = `<div class="hg-sub">Slots used ${profile.loadout.modules.length}/${profile.slots}</div>`;
    this.detailEl.innerHTML = `<div class="hg-name">${item.name}</div><div class="hg-desc">${item.desc}</div>${extra}`;
    const a = this.actionEl;
    a.disabled = false;
    a.className = 'hg-action';
    if (!owned) {
      a.textContent = `BUY · ${fmt(item.price)}`;
      if (profile.credits < item.price) { a.disabled = true; a.textContent = `NEED ${fmt(item.price - profile.credits)} MORE`; }
      else a.classList.add('buy');
    } else if (cat.key === 'modules') {
      if (eq) a.textContent = 'REMOVE';
      else if (profile.loadout.modules.length >= profile.slots) { a.textContent = 'SLOTS FULL'; a.disabled = true; }
      else a.textContent = 'INSTALL';
    } else if (eq) { a.textContent = 'EQUIPPED'; a.disabled = true; }
    else a.textContent = 'EQUIP';
  }

  // Bars show the current loadout, with a ghost marker for what the selection would change.
  _renderStats(cat) {
    const cur = computeStats(profile.loadout);
    const L = JSON.parse(JSON.stringify(profile.loadout));
    if (cat.key === 'modules') {
      const i = L.modules.indexOf(this.sel);
      if (i >= 0) L.modules.splice(i, 1);
      else L.modules.push(this.sel);
    } else L[cat.slot] = this.sel;
    const nxt = computeStats(L);
    this.statsEl.innerHTML = STAT_ROWS.map(([label, f]) => {
      const a = Math.min(1, f(cur)), b = Math.min(1, f(nxt));
      const diff = b - a;
      const cls = Math.abs(diff) < 0.005 ? '' : diff > 0 ? 'up' : 'down';
      return `<div class="hg-stat"><span>${label}</span><div class="bar"><i style="width:${(a * 100).toFixed(1)}%"></i>` +
        `<b class="${cls}" style="left:${(Math.min(a, b) * 100).toFixed(1)}%;width:${(Math.abs(diff) * 100).toFixed(1)}%"></b></div></div>`;
    }).join('');
  }

  _renderLoadout() {
    const L = profile.loadout;
    const name = (key, id) => CATALOG.find((c) => c.key === key).items[id]?.name || '-';
    const mods = L.modules.map((m) => name('modules', m)).join(', ') || 'none';
    this.loadoutEl.innerHTML =
      `<div><span>SHIP</span>${name('ships', L.ship)}</div><div><span>CANNON</span>${name('primaries', L.primary)}</div>` +
      `<div><span>MISSILES</span>${name('secondaries', L.secondary)}</div><div><span>ABILITY</span>${name('utilities', L.utility)}</div>` +
      `<div><span>MODULES</span>${mods}</div>`;
  }

  _action() {
    const cat = this._cat();
    const id = this.sel;
    if (!profile.owns(cat.key, id)) {
      if (profile.buy(cat.key, id)) {
        audio.purchase();
        if (cat.key !== 'modules' || profile.loadout.modules.length < profile.slots) profile.equip(cat.key, id);
      } else audio.ui();
    } else {
      profile.equip(cat.key, id);
      audio.ui(true);
    }
    this.render();
  }
}
