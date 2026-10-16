// Menu screens, settings persistence and banners.
import { POWERUPS, UPGRADES } from './config.js';
import { audio } from './audio.js';

const SETTINGS_KEY = 'shardfall.settings.v1';
const BEST_KEY = 'shardfall.best.v1';

const DEFAULTS = {
  sensitivity: 1, musicVol: 0.55, sfxVol: 0.85, invertY: false, autoFire: false,
  lefty: false, haptics: true, quality: 1,
};

function store() {
  try { return window.localStorage; } catch (e) { return null; }
}

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(store()?.getItem(SETTINGS_KEY) || '{}') || {}; } catch (e) { s = {}; }
  const out = { ...DEFAULTS, ...s };
  if (!('quality' in s)) {
    // Guess a sensible default: phones with huge DPR but small screens can still struggle.
    const mem = navigator.deviceMemory || 4;
    out.quality = mem <= 3 ? 0 : 1;
  }
  return out;
}

export function saveSettings(s) {
  try { store()?.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
}

export function loadBest() {
  try { return JSON.parse(store()?.getItem(BEST_KEY) || 'null') || { score: 0, sector: 0 }; } catch (e) { return { score: 0, sector: 0 }; }
}
export function saveBest(b) {
  try { store()?.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { /* ignore */ }
}

export class UI {
  constructor(settings, handlers) {
    this.settings = settings;
    this.h = handlers;
    this.stack = [];
    this.screens = {};
    document.querySelectorAll('.screen').forEach((el) => (this.screens[el.id] = el));
    this.banner = document.getElementById('banner');
    this.bannerTimer = null;

    document.querySelectorAll('[data-act]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.init();
        audio.ui(b.classList.contains('primary'));
        this._act(b.dataset.act);
      });
    });

    // Power-up legend
    document.getElementById('puLegend').innerHTML = Object.values(POWERUPS)
      .map((p) => `<div><i style="color:${p.css};border-color:${p.css}">${p.icon}</i>${p.name}</div>`).join('');

    this._bindSettings();
  }

  _act(a) {
    switch (a) {
      case 'play': this.h.play(); break;
      case 'howto': this.push('howto'); break;
      case 'settings': this.push('settings'); break;
      case 'back': this.pop(); break;
      case 'resume': this.h.resume(); break;
      case 'quit': this.h.quit(); break;
      case 'title': this.h.title(); break;
    }
  }

  show(id) {
    this.stack = id ? [id] : [];
    this._render();
  }
  push(id) {
    this.stack.push(id);
    this._render();
  }
  pop() {
    this.stack.pop();
    this._render();
  }
  get top() { return this.stack[this.stack.length - 1] || null; }
  _render() {
    const top = this.top;
    for (const [id, el] of Object.entries(this.screens)) el.classList.toggle('on', id === top);
  }

  _bindSettings() {
    const s = this.settings;
    const $ = (id) => document.getElementById(id);
    const bindRange = (id, key, after) => {
      const el = $(id);
      el.value = s[key];
      el.addEventListener('input', () => { s[key] = parseFloat(el.value); saveSettings(s); after && after(); });
    };
    const bindCheck = (id, key, after) => {
      const el = $(id);
      el.checked = !!s[key];
      el.addEventListener('change', () => { s[key] = el.checked; saveSettings(s); audio.ui(); after && after(); });
    };
    bindRange('sSens', 'sensitivity');
    bindRange('sMusic', 'musicVol', () => audio.setVolumes(s.sfxVol, s.musicVol));
    bindRange('sSfx', 'sfxVol', () => audio.setVolumes(s.sfxVol, s.musicVol));
    bindCheck('sInvert', 'invertY');
    bindCheck('sAuto', 'autoFire');
    bindCheck('sLefty', 'lefty', () => this.h.layout());
    bindCheck('sHaptics', 'haptics');
    const q = $('sQuality');
    q.value = String(s.quality);
    q.addEventListener('change', () => {
      s.quality = parseInt(q.value, 10);
      saveSettings(s);
      // Renderer resources are sized at boot; reload to apply.
      setTimeout(() => location.reload(), 150);
    });
  }

  showBanner(t1, t2 = '', dur = 2.4) {
    this.banner.querySelector('.b1').textContent = t1;
    this.banner.querySelector('.b2').textContent = t2;
    this.banner.classList.add('show');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => this.banner.classList.remove('show'), dur * 1000);
  }

  showUpgrades(sector, choices, onPick) {
    document.getElementById('upTitle').textContent = `SECTOR ${sector} CLEARED`;
    const wrap = document.getElementById('upCards');
    wrap.innerHTML = '';
    for (const u of choices) {
      const b = document.createElement('button');
      b.className = 'card';
      b.innerHTML = `<span class="n">${u.name}</span><span class="d">${u.desc}</span>`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.ui(true);
        onPick(u);
      });
      wrap.appendChild(b);
    }
    this.show('upgrade');
  }

  showGameOver(stats, isBest) {
    const rows = [
      ['SCORE', stats.score.toLocaleString(), isBest ? 'nb' : ''],
      ['SECTOR', stats.sector],
      ['KILLS', stats.kills],
      ['ROCKS SHATTERED', stats.rocks],
      ['BEST', stats.best.toLocaleString()],
    ];
    document.getElementById('goStats').innerHTML = rows
      .map(([k, v, c]) => `<div class="k">${k}</div><div class="v ${c || ''}">${v}${c === 'nb' ? ' ★ NEW' : ''}</div>`).join('');
    this.show('gameover');
  }
}

export { UPGRADES };
