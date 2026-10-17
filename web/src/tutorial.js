// First-flight tutorial and one-time contextual hints.
import * as THREE from 'three';
import { profile } from './profile.js';
import { audio } from './audio.js';

const _v = new THREE.Vector3();

// Coach box + pulsing ring that points at a control.
class Coach {
  constructor() {
    this.box = document.getElementById('coach');
    this.text = document.getElementById('coachText');
    this.ring = document.getElementById('coachRing');
    this.skip = document.getElementById('coachSkip');
    this.timer = 0;
  }
  show(html, ms = 0, sticky = true) {
    this.text.innerHTML = html;
    this.box.classList.add('on');
    this.timer = ms;
    this.sticky = sticky;
  }
  hide() {
    this.box.classList.remove('on');
    this.pointAt(null);
  }
  pointAt(target) {
    if (!target) { this.ring.classList.remove('on'); return; }
    this.ring.classList.add('on');
    this.ring.style.left = target.x + 'px';
    this.ring.style.top = target.y + 'px';
    this.ring.style.width = this.ring.style.height = target.r * 2 + 'px';
  }
  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt * 1000;
      if (this.timer <= 0) this.hide();
    }
  }
}

export class Tutorial {
  constructor(game) {
    this.game = game;
    this.coach = new Coach();
    this.active = false;
    this.coach.skip.addEventListener('click', (e) => { e.stopPropagation(); this.finish(true); });
  }

  start() {
    this.active = true;
    this.step = -1;
    this.coach.skip.classList.add('on');
    this.game.player.godMode = true;
    this._next();
  }

  _btn(name) {
    const r = this.game.input.rects[name];
    return r ? { x: r.x, y: r.y, r: r.r * 1.1 } : null;
  }

  _ahead(dist, side = 0) {
    const p = this.game.player;
    const right = _v.crossVectors(p.forward, p.levelUp).normalize();
    return p.pos.clone().addScaledVector(p.forward, dist).addScaledVector(right, side);
  }

  _next() {
    this.step++;
    this.t = 0;
    this.acc = 0;
    const g = this.game;
    const S = STEPS[this.step];
    if (!S) return this.finish(false);
    audio.hint();
    this.coach.show(S.text);
    S.setup && S.setup(this, g);
  }

  update(dt) {
    if (!this.active) return;
    this.t += dt;
    const S = STEPS[this.step];
    this.coach.pointAt(S.point ? S.point(this) : null);
    if (S.done(this, this.game, dt)) this._next();
  }

  finish(skipped) {
    if (!this.active) return;
    this.active = false;
    this.coach.hide();
    this.coach.skip.classList.remove('on');
    this.game.player.godMode = false;
    for (const e of this.game.enemies.list) if (e.alive && e.tutorial) this.game.enemies.kill(e, true);
    profile.data.tutorialDone = true;
    profile.save();
    this.game.tutorialDone(skipped);
  }
}

const DUMMY = { hp: 0.6, damage: 0, speed: 0.45, fireRate: 0, accuracy: 1 };

const STEPS = [
  {
    text: 'Drag anywhere on the <b>left side</b> to steer.',
    point: (t) => { const b = t.game.input; return { x: b.baseX, y: b.baseY, r: b.stickRadius * 1.2 }; },
    done: (t, g, dt) => { if (Math.hypot(g.input.stick.x, g.input.stick.y) > 0.3) t.acc += dt; return t.acc > 1.5; },
  },
  {
    text: 'Hold <b>FIRE</b> and break the marked rock ahead.',
    setup: (t, g) => {
      t.rock = g.field.spawn('M', t._ahead(170), new THREE.Vector3(), 'rock');
      g.coachMarker = t.rock;
    },
    point: (t) => t._btn('fire'),
    done: (t, g) => { const ok = !t.rock || !t.rock.alive; if (ok) g.coachMarker = null; return ok; },
  },
  {
    text: 'Hold <b>BOOST</b> for speed. <b>BRAKE</b> tightens your turns.',
    point: (t) => t._btn('boost'),
    done: (t, g, dt) => { if (g.player.boosting) t.acc += dt; return t.acc > 1.0; },
  },
  {
    text: 'Fly through the <b>power-up</b> to collect it.',
    setup: (t, g) => { t.pu = g.powerups.spawn('shield', t._ahead(130), 60); g.coachMarker = t.pu; },
    done: (t, g) => { const ok = !t.pu.alive; if (ok) g.coachMarker = null; return ok; },
  },
  {
    text: 'Training drone! Keep it in the ring until it reads <b>LOCKED</b>. Locked shots curve into the target.',
    setup: (t, g) => {
      t.dummy = g.enemies.spawn('raider', t._ahead(320, 40), 1, DUMMY);
      t.dummy.tutorial = true;
    },
    point: (t) => (t.game.lock.locked ? t._btn('fire') : null),
    done: (t) => !t.dummy.alive,
  },
  {
    text: 'Tap the <b>missile</b> button to launch a seeker at a target.',
    setup: (t, g) => {
      t.dummy = g.enemies.spawn('raider', t._ahead(380, -40), 1, DUMMY);
      t.dummy.tutorial = true;
      t.fired = g.missilesFired;
      g.player.missiles = Math.max(g.player.missiles, 2);
    },
    point: (t) => t._btn('missile'),
    done: (t, g) => g.missilesFired > t.fired && (!t.dummy.alive || t.t > 6),
  },
  {
    text: 'Tap your <b>ability</b> button. Each ship can carry an EMP, a wingman drone or a phase dash.',
    setup: (t, g) => { t.used = g.abilitiesUsed; g.player.charges = Math.max(1, g.player.charges); },
    point: (t) => t._btn('emp'),
    done: (t, g) => g.abilitiesUsed > t.used,
  },
  {
    text: 'Tap the <b>radar</b> to open the full sector map. Tap it again to close.',
    setup: (t, g) => { t.toggles = g.radarToggles; },
    point: (t) => { const r = t.game.hud.radarSmall; return { x: r.x, y: r.y, r: r.r + 6 }; },
    done: (t, g) => g.radarToggles >= t.toggles + 2 || (g.radarToggles > t.toggles && t.t > 5),
  },
  {
    text: 'Clear 3 waves, destroy the capital ship, then fly through the warp gate. Bumping rocks hurts, so watch the proximity warning. Good hunting!',
    done: (t) => t.t > 5,
  },
];

// One-time tips that appear the first time something happens.
export const HINTS = {
  volatile: 'Orange rocks are <b>volatile</b>. Shoot them when enemies are close.',
  crystal: 'Cyan <b>crystal</b> rocks drop power-ups.',
  hornet: '<b>Hornets</b> are kamikaze drones. Shoot them before they reach you.',
  spinner: '<b>Spinners</b> lay proximity mines. Shoot mines from a distance.',
  longbow: 'Red targeting laser! <b>Move off the line</b> before the Longbow fires.',
  dreadnought: 'Destroy the <b>turrets and launch bays</b> to drop the reactor shield.',
  sentinel: 'Shoot the four <b>pylons</b>. When the laser spokes close in on you, <b>slide sideways</b> out of their path.',
  wingman: 'A <b>wingman drone</b> is flying with you. It attacks your locked target.',
  credits: 'You earn <b>credits</b> for kills. Spend them in the <b>Hangar</b> on new ships and weapons.',
  impact: 'Hitting rocks at speed does real damage. <b>Brake</b> in tight spaces.',
};

export class Hints {
  constructor(coach) {
    this.coach = coach;
    this.queue = [];
    this.cool = 0;
  }
  maybe(id) {
    if (profile.seenHint(id) || this.queue.some((q) => q.id === id)) return;
    this.queue.push({ id, age: 0 });
  }
  update(dt, blocked) {
    this.cool -= dt;
    for (const q of this.queue) q.age += dt;
    this.queue = this.queue.filter((q) => q.age < 10); // stale tips are no longer relevant
    if (blocked || this.cool > 0 || !this.queue.length) return;
    const { id } = this.queue.shift();
    if (profile.seenHint(id)) return;
    profile.markHint(id);
    audio.hint();
    this.coach.show(HINTS[id], 5000);
    this.cool = 6;
  }
}
