import * as THREE from 'three';
import { ARENA, POWERUPS } from './config.js';
import { clamp } from './util.js';

const _v = new THREE.Vector3();
const _p = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _invQ = new THREE.Quaternion();

export class HUD {
  constructor(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.popups = [];
    this.hits = [];
    this.radarZoom = false;
    this.warnBlink = 0;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    const app = document.getElementById('app');
    this.w = (app && app.clientWidth) || window.innerWidth;
    this.h = (app && app.clientHeight) || window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.s = clamp(Math.min(this.h / 390, this.w / 760), 0.75, 1.4);
    this._radarGeom();
  }

  _radarGeom() {
    const r = 64 * this.s;
    // The small radar in the corner is always the tap target; the sector map opens centered.
    this.radarSmall = { x: this.w - r - 14 * this.s, y: r + 14 * this.s, r };
    if (this.radarZoom) {
      const R = Math.min(this.h * 0.42, 175 * this.s);
      this.radar = { x: this.w / 2, y: this.h * 0.5, r: R };
    } else this.radar = this.radarSmall;
  }

  toggleRadar() {
    this.radarZoom = !this.radarZoom;
    this._radarGeom();
  }

  // Is a screen point inside the radar (for tap-to-zoom)?
  hitRadar(x, y) {
    const r = this.radarSmall;
    return Math.hypot(x - r.x, y - r.y) < r.r + 8;
  }

  popup(pos, text, color = '#fff') {
    this.popups.push({ pos: pos.clone(), text, color, t: 0 });
  }

  damageFrom(dirWorld, camera) {
    // Store direction in camera space for an arc indicator.
    _v.copy(dirWorld).applyQuaternion(_invQ.copy(camera.quaternion).invert());
    let a = Math.atan2(_v.x, _v.y);
    if (_v.z > 0 && Math.hypot(_v.x, _v.y) < 0.5) a = Math.PI; // from behind -> show at bottom
    this.hits.push({ a, t: 0 });
  }

  // Project world position to screen; returns {x,y,on,behind}.
  project(pos, camera, out) {
    _v.copy(pos).project(camera);
    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    const behind = _p.subVectors(pos, camera.position).dot(_fwd) < 0;
    let x = _v.x, y = _v.y;
    if (behind) { x = -x; y = -y; }
    out.nx = x;
    out.ny = y;
    out.behind = behind;
    out.x = (x * 0.5 + 0.5) * this.w;
    out.y = (-y * 0.5 + 0.5) * this.h;
    out.on = !behind && Math.abs(x) < 1 && Math.abs(y) < 1;
    return out;
  }

  edgeArrow(g, sp, color, label) {
    const cx = this.w / 2, cy = this.h / 2;
    let dx = sp.nx, dy = -sp.ny;
    if (sp.behind && Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) dy = 1;
    const a = Math.atan2(dy * this.h, dx * this.w);
    const rx = this.w / 2 - 40 * this.s, ry = this.h / 2 - 34 * this.s;
    const t = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
    const x = cx + Math.cos(a) * t, y = cy + Math.sin(a) * t;
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.fillStyle = color;
    g.beginPath();
    const k = 9 * this.s;
    g.moveTo(k, 0);
    g.lineTo(-k * 0.7, -k * 0.75);
    g.lineTo(-k * 0.35, 0);
    g.lineTo(-k * 0.7, k * 0.75);
    g.closePath();
    g.fill();
    g.restore();
    if (label) {
      g.fillStyle = color;
      g.font = `${10 * this.s}px monospace`;
      g.textAlign = 'center';
      g.fillText(label, x - Math.cos(a) * 20 * this.s, y - Math.sin(a) * 18 * this.s + 4);
    }
  }

  draw(game, dt) {
    const g = this.g, s = this.s;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    if (!game.hudVisible) return;
    const cam = game.camera, player = game.player;
    this.warnBlink += dt;
    const sp = {};

    // ---- Enemy brackets & arrows ----
    for (const e of game.enemies.list) {
      if (!e.alive) continue;
      const d = e.pos.distanceTo(player.pos);
      this.project(e.pos, cam, sp);
      const locked = game.lock.target === e;
      if (sp.on) {
        const size = clamp(900 / Math.max(d, 1), 7, 34) * s * (e.type === 'warden' ? 1.5 : 1);
        g.strokeStyle = locked ? '#ffc84a' : e.shielded || e.stunT > 0 ? 'rgba(140,230,255,0.95)' : 'rgba(255,90,80,0.85)';
        g.lineWidth = locked ? 2.2 : 1.4;
        const c = size * 0.4;
        g.beginPath();
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          g.moveTo(sp.x + sx * size, sp.y + sy * (size - c));
          g.lineTo(sp.x + sx * size, sp.y + sy * size);
          g.lineTo(sp.x + sx * (size - c), sp.y + sy * size);
        }
        g.stroke();
        if (e.hp < e.maxHp) {
          const bw = size * 2;
          g.fillStyle = 'rgba(0,0,0,0.5)';
          g.fillRect(sp.x - size, sp.y + size + 4, bw, 3 * s);
          g.fillStyle = '#ff5a4a';
          g.fillRect(sp.x - size, sp.y + size + 4, bw * Math.max(0, e.hp / e.maxHp), 3 * s);
        }
        if (e.shielded) {
          g.fillStyle = 'rgba(140,230,255,0.9)';
          g.font = `bold ${9 * s}px monospace`;
          g.textAlign = 'center';
          g.fillText('SHIELDED', sp.x, sp.y + size + 12 * s);
        } else if (d > 350 && !e.part) {
          g.fillStyle = 'rgba(255,140,130,0.8)';
          g.font = `${9 * s}px monospace`;
          g.textAlign = 'center';
          g.fillText(Math.round(d) + 'm', sp.x, sp.y - size - 4);
        }
      } else if (d < 1600 && !e.part) {
        this.edgeArrow(g, sp, 'rgba(255,80,70,0.9)');
      }
    }
    // Boss arrow when off screen.
    if (game.boss && game.boss.alive) {
      this.project(game.boss.pos, cam, sp);
      if (!sp.on) this.edgeArrow(g, sp, '#ff7a4a', game.boss.name);
    }
    // Tutorial marker.
    const cm = game.coachMarker;
    if (cm && cm.alive) {
      this.project(cm.pos, cam, sp);
      if (sp.on) {
        const r = (16 + 4 * Math.sin(this.warnBlink * 6)) * s;
        g.strokeStyle = '#ffd36b';
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(sp.x, sp.y, r, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = '#ffd36b';
        g.font = `bold ${10 * s}px monospace`;
        g.textAlign = 'center';
        g.fillText('TARGET', sp.x, sp.y - r - 6);
      } else this.edgeArrow(g, sp, '#ffd36b', 'TARGET');
    }

    // ---- Lock-on ----
    const L = game.lock;
    if (L.target && L.target.alive) {
      this.project(L.target.pos, cam, sp);
      if (sp.on) {
        const r = 26 * s;
        g.save();
        g.translate(sp.x, sp.y);
        if (L.locked) {
          g.rotate(this.warnBlink * 2);
          g.strokeStyle = '#ffc84a';
          g.lineWidth = 2.5;
          g.beginPath();
          g.moveTo(0, -r); g.lineTo(r, 0); g.lineTo(0, r); g.lineTo(-r, 0); g.closePath();
          g.stroke();
          g.rotate(-this.warnBlink * 2);
          g.fillStyle = '#ffc84a';
          g.font = `bold ${11 * s}px monospace`;
          g.textAlign = 'center';
          g.fillText('LOCKED', 0, r + 14 * s);
        } else {
          g.strokeStyle = 'rgba(255,200,80,0.9)';
          g.lineWidth = 2;
          g.beginPath();
          g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * L.progress);
          g.stroke();
        }
        g.restore();
      }
    }

    // ---- Lead indicator for aim-assisted target ----
    if (game.aimPoint && game.aimTarget && game.aimTarget.alive) {
      this.project(game.aimPoint, cam, sp);
      if (sp.on) {
        g.strokeStyle = 'rgba(255,255,255,0.8)';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(sp.x, sp.y, 4 * s, 0, Math.PI * 2);
        g.stroke();
      }
    }

    // ---- Warp gate marker ----
    if (game.gate && game.gate.visible) {
      const d = game.gate.position.distanceTo(player.pos);
      this.project(game.gate.position, cam, sp);
      const label = Math.round(d) + 'm';
      if (sp.on) {
        const r = 14 * s;
        g.strokeStyle = '#6bffb0';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(sp.x, sp.y - r); g.lineTo(sp.x + r, sp.y); g.lineTo(sp.x, sp.y + r); g.lineTo(sp.x - r, sp.y); g.closePath();
        g.stroke();
        g.fillStyle = '#6bffb0';
        g.font = `bold ${11 * s}px monospace`;
        g.textAlign = 'center';
        g.fillText('WARP ' + label, sp.x, sp.y - r - 6);
      } else this.edgeArrow(g, sp, '#6bffb0', label);
    }

    // ---- Power-up markers (nearby, on-screen only) ----
    for (const p of game.powerups.list) {
      const d = p.pos.distanceTo(player.pos);
      if (d > 600) continue;
      this.project(p.pos, cam, sp);
      if (!sp.on) continue;
      g.strokeStyle = p.def.css;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(sp.x, sp.y, clamp(400 / d, 5, 16) * s, 0, Math.PI * 2);
      g.stroke();
      if (d < 300) {
        g.fillStyle = p.def.css;
        g.font = `${9 * s}px monospace`;
        g.textAlign = 'center';
        g.fillText(p.def.name, sp.x, sp.y + 22 * s);
      }
    }

    // ---- Reticle ----
    if (player.alive) {
      _p.copy(player.pos).addScaledVector(player.forward, 280);
      this.project(_p, cam, sp);
      const homing = game.lock.locked && game.lock.target && game.lock.target.alive;
      const hot = !!game.aimTarget;
      g.strokeStyle = homing ? 'rgba(255,200,74,0.95)' : hot ? 'rgba(255,120,100,0.95)' : 'rgba(140,230,255,0.9)';
      g.lineWidth = 1.6;
      const r = 15 * s;
      g.beginPath();
      g.arc(sp.x, sp.y, r, 0, Math.PI * 2);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        g.moveTo(sp.x + dx * r * 0.55, sp.y + dy * r * 0.55);
        g.lineTo(sp.x + dx * r * 1.4, sp.y + dy * r * 1.4);
      }
      g.stroke();
      g.fillStyle = g.strokeStyle;
      g.fillRect(sp.x - 1, sp.y - 1, 2, 2);
    }

    // ---- Damage direction arcs ----
    const cx = this.w / 2, cy = this.h / 2;
    for (const h of this.hits) {
      h.t += dt;
      const a = 1 - h.t / 0.8;
      if (a <= 0) continue;
      g.strokeStyle = `rgba(255,50,40,${a * 0.8})`;
      g.lineWidth = 6 * s;
      g.beginPath();
      const ang = h.a - Math.PI / 2;
      g.arc(cx, cy, Math.min(this.w, this.h) * 0.3, ang - 0.35, ang + 0.35);
      g.stroke();
    }
    this.hits = this.hits.filter((h) => h.t < 0.8);

    // ---- Score popups ----
    for (const p of this.popups) {
      p.t += dt;
      this.project(p.pos, cam, sp);
      if (!sp.on) continue;
      const a = 1 - p.t / 1.2;
      g.globalAlpha = Math.max(0, a);
      g.fillStyle = p.color;
      g.font = `bold ${13 * s}px monospace`;
      g.textAlign = 'center';
      g.fillText(p.text, sp.x, sp.y - p.t * 40 * s);
      g.globalAlpha = 1;
    }
    this.popups = this.popups.filter((p) => p.t < 1.2);

    this.drawBars(g, game);
    this.drawRadar(g, game);
    this.drawTop(g, game);
    this.drawWarnings(g, game);
  }

  drawBars(g, game) {
    const p = game.player, s = this.s;
    const x = 104 * s, y = 16 * s, w = 150 * s, h = 7 * s, gap = 13 * s;
    const bar = (i, frac, color, label, extra = 0, extraColor = null) => {
      const yy = y + i * gap;
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.fillRect(x, yy, w, h);
      g.fillStyle = color;
      g.fillRect(x, yy, w * clamp(frac, 0, 1), h);
      if (extra > 0) {
        g.fillStyle = extraColor;
        g.fillRect(x, yy - 2, w * clamp(extra, 0, 1), 2);
      }
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.lineWidth = 1;
      g.strokeRect(x + 0.5, yy + 0.5, w, h);
      g.fillStyle = 'rgba(220,235,255,0.85)';
      g.font = `bold ${8.5 * s}px monospace`;
      g.textAlign = 'right';
      g.fillText(label, x - 5 * s, yy + h - 0.5);
    };
    const hf = p.hull / p.maxHull;
    const crit = hf < 0.25;
    bar(0, hf, crit ? (Math.sin(this.warnBlink * 10) > 0 ? '#ff3030' : '#a01818') : hf < 0.5 ? '#ffb030' : '#4dff88', 'HULL');
    bar(1, Math.min(p.shield, p.maxShield) / p.maxShield, '#4aa8ff', 'SHLD', (p.shield - p.maxShield) / (p.maxShield * 0.5), '#9affff');
    bar(2, p.boost / p.maxBoost, p.boosting ? '#fff07a' : '#e0c040', 'BOOST');
    // Active timed power-ups.
    let i = 0;
    for (const k of ['rapid', 'spread', 'phase', 'wingman']) {
      const t = p.timers[k];
      if (t <= 0) continue;
      const def = POWERUPS[k];
      const xx = x + i * 52 * s, yy = y + 3 * gap + 2 * s;
      g.fillStyle = 'rgba(0,0,0,0.45)';
      g.fillRect(xx, yy, 48 * s, 14 * s);
      g.fillStyle = def.css;
      g.fillRect(xx, yy + 12 * s, 48 * s * (t / (def.timed * p.puDur)), 2 * s);
      g.font = `bold ${9 * s}px monospace`;
      g.textAlign = 'left';
      g.fillText(def.icon + ' ' + Math.ceil(t) + 's', xx + 4 * s, yy + 10 * s);
      i++;
    }
    if (game.runCredits > 0) {
      g.fillStyle = '#7dffb0';
      g.font = `bold ${9.5 * s}px monospace`;
      g.textAlign = 'left';
      g.fillText(game.runCredits.toLocaleString() + ' CR', x, y + 3 * gap + (i ? 26 : 8) * s);
    }
  }

  drawTop(g, game) {
    const s = this.s;
    const portrait = this.w < 560;
    const top = portrait ? this.radarSmall.y + this.radarSmall.r + 34 * s : 0;
    g.textAlign = 'center';
    g.fillStyle = '#ffffff';
    g.font = `bold ${20 * s}px monospace`;
    g.fillText(String(game.score).padStart(7, '0'), this.w / 2, top + 26 * s);
    if (game.comboMult > 1) {
      g.fillStyle = '#ffd36b';
      g.font = `bold ${12 * s}px monospace`;
      g.fillText('x' + game.comboMult + ' COMBO', this.w / 2, top + 42 * s);
    }
    g.fillStyle = 'rgba(200,225,255,0.85)';
    g.font = `${10 * s}px monospace`;
    g.fillText(game.objectiveText(), this.w / 2, top + (game.comboMult > 1 ? 56 : 42) * s);
    const b = game.boss;
    if (b && b.alive) {
      const bw = Math.min(this.w * 0.42, 340 * s), bh = 7 * s;
      const bx = this.w / 2 - bw / 2, by = top + (game.comboMult > 1 ? 66 : 52) * s;
      g.fillStyle = 'rgba(0,0,0,0.55)';
      g.fillRect(bx, by, bw, bh);
      const f = b.hpFrac;
      g.fillStyle = b.core.shielded ? '#5ab8ff' : '#ff4a3a';
      g.fillRect(bx, by, bw * f, bh);
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.strokeRect(bx + 0.5, by + 0.5, bw, bh);
      g.fillStyle = b.core.shielded ? 'rgba(160,220,255,0.9)' : '#ffb0a0';
      g.font = `bold ${9 * s}px monospace`;
      g.fillText(b.status, this.w / 2, by + bh + 11 * s);
    }
  }

  drawWarnings(g, game) {
    const p = game.player, s = this.s;
    const msgs = [];
    if (p.alive) {
      if (p.outOfBounds > 0) msgs.push(['RETURN TO SECTOR', '#ffb030']);
      if (p.hull / p.maxHull < 0.25) msgs.push(['HULL CRITICAL', '#ff4040']);
      if (game.proximity > 0) msgs.push(['PROXIMITY', '#ffd36b']);
    }
    if (!msgs.length) return;
    if (Math.sin(this.warnBlink * 9) < -0.2) return;
    g.font = `bold ${13 * s}px monospace`;
    g.textAlign = 'center';
    msgs.forEach(([m, c], i) => {
      g.fillStyle = c;
      g.fillText(m, this.w / 2, this.h * 0.3 + i * 18 * s);
    });
  }

  drawRadar(g, game) {
    const { x: cx, y: cy, r: R } = this.radar;
    const p = game.player;
    const zoom = this.radarZoom;
    const range = zoom ? ARENA.radius * 1.08 : 750;
    const k = R / range;
    // Radar is heading-up around the player; sector map is north-up around the arena center.
    const yaw = zoom ? 0 : p.yaw;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const rx = -fz, rz = fx; // right vector on the horizontal plane
    const ox = zoom ? 0 : p.pos.x, oz = zoom ? 0 : p.pos.z;
    g.save();
    // Backdrop
    g.fillStyle = zoom ? 'rgba(6,14,26,0.55)' : 'rgba(6,14,26,0.62)';
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(120,200,255,0.5)';
    g.lineWidth = 1.2;
    g.stroke();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();
    g.strokeStyle = 'rgba(120,200,255,0.16)';
    g.beginPath();
    g.arc(cx, cy, R * 0.33, 0, Math.PI * 2);
    g.moveTo(cx + R * 0.66, cy);
    g.arc(cx, cy, R * 0.66, 0, Math.PI * 2);
    g.moveTo(cx - R, cy); g.lineTo(cx + R, cy);
    g.moveTo(cx, cy - R); g.lineTo(cx, cy + R);
    g.stroke();
    // View cone (radar only; the sector map is north-up)
    if (!zoom) {
      g.fillStyle = 'rgba(120,200,255,0.07)';
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, R, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62);
      g.closePath();
      g.fill();
    }

    const toRadar = (pos, out) => {
      const dx = pos.x - ox, dz = pos.z - oz;
      out.x = cx + (dx * rx + dz * rz) * k;
      out.y = cy - (dx * fx + dz * fz) * k;
      out.h = (pos.y - p.pos.y) * k * 0.55;
      return out;
    };
    const o = {};

    // Arena boundary
    toRadar(_v.set(0, p.pos.y, 0), o);
    g.strokeStyle = 'rgba(255,170,60,0.55)';
    g.setLineDash([4, 4]);
    g.beginPath();
    g.arc(o.x, o.y, ARENA.radius * k, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);

    // Monoliths
    for (const m of game.field.monoliths) {
      toRadar(m.pos, o);
      const rr = Math.max(2, m.r * k * 0.95);
      if (Math.hypot(o.x - cx, o.y - cy) - rr > R) continue;
      const above = m.pos.y - p.pos.y;
      g.fillStyle = Math.abs(above) < m.r ? 'rgba(170,175,190,0.55)' : 'rgba(120,125,140,0.3)';
      g.beginPath();
      g.arc(o.x, o.y, rr, 0, Math.PI * 2);
      g.fill();
    }
    // Static obstacles: wreck sections, crystal spires, capital-ship hulls.
    for (const c of game.field.statics) {
      toRadar(c.pos, o);
      const rr = Math.max(1.5, c.r * k);
      if (Math.hypot(o.x - cx, o.y - cy) - rr > R) continue;
      g.fillStyle = c.boss ? 'rgba(255,120,90,0.45)' : c.spire ? 'rgba(170,140,255,0.5)' : 'rgba(150,140,130,0.45)';
      g.beginPath();
      g.arc(o.x, o.y, rr, 0, Math.PI * 2);
      g.fill();
    }
    // Asteroids
    const r2 = range * range;
    for (const a of game.field.list) {
      if (!a.alive) continue;
      if (zoom && a.tier === 'S') continue;
      const dx = a.pos.x - ox, dz = a.pos.z - oz;
      if (dx * dx + dz * dz > r2) continue;
      toRadar(a.pos, o);
      const near = Math.abs(a.pos.y - p.pos.y) < a.r + 40;
      const sz = a.tier === 'L' ? 2.4 : a.tier === 'M' ? 1.6 : 1.0;
      g.fillStyle = a.type === 'volatile' ? '#ff7a3a' : a.type === 'crystal' ? '#6ff6ff' : near ? 'rgba(210,210,220,0.9)' : 'rgba(150,150,165,0.45)';
      g.fillRect(o.x - sz / 2, o.y - sz / 2, sz, sz);
    }
    // Power-ups
    for (const pu of game.powerups.list) {
      toRadar(pu.pos, o);
      g.fillStyle = pu.def.css;
      this._stemDot(g, o, 2.6, cx, cy, R, false);
    }
    // Gate
    if (game.gate && game.gate.visible) {
      toRadar(game.gate.position, o);
      g.strokeStyle = '#6bffb0';
      g.lineWidth = 2;
      const c = this._clampToRadar(o, cx, cy, R - 4);
      g.beginPath();
      g.arc(c.x, c.y, 4.5, 0, Math.PI * 2);
      g.stroke();
    }
    // Mines and wingmen
    for (const m of game.hazards.mines) {
      if (!m.alive) continue;
      toRadar(m.pos, o);
      g.fillStyle = '#ffa020';
      this._stemDot(g, o, 2, cx, cy, R, false);
    }
    for (const d of game.wingmen.list) {
      toRadar(d.pos, o);
      g.fillStyle = '#7dff9a';
      this._stemDot(g, o, 3, cx, cy, R, true);
    }
    // Enemies
    for (const e of game.enemies.list) {
      if (!e.alive) continue;
      toRadar(e.pos, o);
      g.fillStyle = '#ff4a3a';
      g.strokeStyle = 'rgba(255,74,58,0.8)';
      this._stemDot(g, o, e.type === 'warden' ? 4 : 3, cx, cy, R, true);
    }
    g.restore();

    // Player marker
    toRadar(p.pos, o);
    g.save();
    g.translate(zoom ? o.x : cx, zoom ? o.y : cy);
    if (zoom) g.rotate(-p.yaw);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(0, -6);
    g.lineTo(4.5, 5);
    g.lineTo(0, 2.5);
    g.lineTo(-4.5, 5);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = 'rgba(200,230,255,0.75)';
    g.font = `${8 * this.s}px monospace`;
    g.textAlign = 'center';
    g.fillText(zoom ? 'SECTOR MAP' : 'RADAR', cx, cy + R + 11 * this.s);
    if (zoom) {
      const c = this.radarSmall;
      g.fillStyle = 'rgba(6,14,26,0.62)';
      g.strokeStyle = 'rgba(120,200,255,0.5)';
      g.beginPath();
      g.arc(c.x, c.y, 22 * this.s, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = 'rgba(220,240,255,0.9)';
      g.font = `bold ${10 * this.s}px monospace`;
      g.fillText('MAP', c.x, c.y - 1);
      g.fillText('\u2715', c.x, c.y + 11 * this.s);
    }
  }

  _clampToRadar(o, cx, cy, R) {
    const dx = o.x - cx, dy = o.y - cy;
    const d = Math.hypot(dx, dy);
    if (d <= R) return o;
    return { x: cx + (dx / d) * R, y: cy + (dy / d) * R, h: 0, clamped: true };
  }

  _stemDot(g, o, size, cx, cy, R, triangle) {
    const c = this._clampToRadar(o, cx, cy, R - 3);
    const h = c.clamped ? 0 : clamp(o.h, -R * 0.4, R * 0.4);
    if (Math.abs(h) > 2) {
      g.lineWidth = 1;
      g.strokeStyle = g.fillStyle;
      g.beginPath();
      g.moveTo(c.x, c.y);
      g.lineTo(c.x, c.y - h);
      g.stroke();
    }
    const y = c.y - h;
    if (triangle) {
      g.beginPath();
      g.moveTo(c.x, y - size);
      g.lineTo(c.x + size, y + size * 0.8);
      g.lineTo(c.x - size, y + size * 0.8);
      g.closePath();
      g.fill();
    } else {
      g.fillRect(c.x - size / 2, y - size / 2, size, size);
    }
  }
}
