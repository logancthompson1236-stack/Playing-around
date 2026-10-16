// Procedural sound design: every effect and the music is synthesized at runtime with WebAudio.
// No sample files means zero licensing issues and a tiny APK.

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxVol = 0.8;
    this.musicVol = 0.5;
    this.last = Object.create(null);
    this.music = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC({ latencyHint: 'interactive' }));

    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    this.master.connect(comp).connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxVol;
    this.sfxBus.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicVol * 0.55;
    this.musicBus.connect(this.master);

    // Space-y reverb from a synthesized impulse response.
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(2.8, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.35;
    this.reverb.connect(this.reverbSend).connect(this.sfxBus);

    // Shared white-noise buffer.
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this._setupEngine();
    this.music = new Music(this);
  }

  get now() { return this.ctx ? this.ctx.currentTime : 0; }

  setVolumes(sfx, music) {
    this.sfxVol = sfx;
    this.musicVol = music;
    if (!this.ctx) return;
    this.sfxBus.gain.setTargetAtTime(sfx, this.now, 0.05);
    this.musicBus.gain.setTargetAtTime(music * 0.55, this.now, 0.05);
  }

  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }

  _impulse(seconds, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // Rate limit a sound so rapid events don't stack into mush.
  _gate(name, minGap) {
    const t = this.now;
    if (this.last[name] && t - this.last[name] < minGap) return false;
    this.last[name] = t;
    return true;
  }

  // Output chain: [node] -> gain -> panner -> sfx (+ reverb send)
  _out(vol = 1, pan = 0, rev = 0.15) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.value = vol;
    let tail = g;
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      tail = p;
    }
    tail.connect(this.sfxBus);
    if (rev > 0) {
      const s = ctx.createGain();
      s.gain.value = rev;
      tail.connect(s).connect(this.reverb);
    }
    return g;
  }

  _env(param, t, attack, peak, decay, floor = 0.0001) {
    param.cancelScheduledValues(t);
    param.setValueAtTime(floor, t);
    param.linearRampToValueAtTime(peak, t + attack);
    param.exponentialRampToValueAtTime(floor, t + attack + decay);
  }

  _osc(type, f0, f1, t, dur, dest) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    o.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  _noise(t, dur, dest) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    s.connect(dest);
    s.start(t, Math.random() * 1.5, dur + 0.05);
    return s;
  }

  _filter(type, f, q = 1) {
    const f0 = this.ctx.createBiquadFilter();
    f0.type = type;
    f0.frequency.value = f;
    f0.Q.value = q;
    return f0;
  }

  // ---------- Effects ----------

  laser(pan = 0) {
    if (!this.ctx || !this._gate('laser', 0.045)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.5, pan, 0.08);
    const lp = this._filter('lowpass', 5200, 0.7);
    lp.connect(out);
    const g = ctx.createGain();
    g.connect(lp);
    this._env(g.gain, t, 0.002, 0.22, 0.13);
    const j = 1 + (Math.random() - 0.5) * 0.08;
    this._osc('square', 1500 * j, 240 * j, t, 0.13, g);
    const g2 = ctx.createGain();
    g2.connect(lp);
    this._env(g2.gain, t, 0.002, 0.25, 0.09);
    this._osc('sine', 820 * j, 160 * j, t, 0.1, g2);
  }

  enemyLaser(vol = 1, pan = 0) {
    if (!this.ctx || vol < 0.03 || !this._gate('elaser', 0.06)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.45 * vol, pan, 0.2);
    const lp = this._filter('lowpass', 2200, 2);
    lp.connect(out);
    const g = ctx.createGain();
    g.connect(lp);
    this._env(g.gain, t, 0.003, 0.3, 0.22);
    this._osc('sawtooth', 640, 110, t, 0.22, g);
    this._osc('sawtooth', 652, 118, t, 0.22, g);
  }

  boltImpact(vol = 1, pan = 0) {
    if (!this.ctx || vol < 0.05 || !this._gate('impact', 0.04)) return;
    const t = this.now;
    const out = this._out(0.35 * vol, pan, 0.05);
    const bp = this._filter('bandpass', 2600 + Math.random() * 1500, 1.5);
    bp.connect(out);
    const g = this.ctx.createGain();
    g.connect(bp);
    this._env(g.gain, t, 0.001, 0.8, 0.06);
    this._noise(t, 0.08, g);
  }

  explosion(size = 1, vol = 1, pan = 0) {
    if (!this.ctx || vol < 0.03 || !this._gate('expl' + (size > 1.5 ? 'L' : 'S'), 0.05)) return;
    const t = this.now, ctx = this.ctx;
    const dur = 0.5 + size * 0.55;
    const out = this._out(Math.min(1, 0.55 + size * 0.2) * vol, pan, 0.25 + size * 0.1);
    // Body: filtered noise sweeping down.
    const lp = this._filter('lowpass', 2600, 0.8);
    lp.frequency.setValueAtTime(3200 / Math.sqrt(size), t);
    lp.frequency.exponentialRampToValueAtTime(70, t + dur);
    lp.connect(out);
    const g = ctx.createGain();
    g.connect(lp);
    this._env(g.gain, t, 0.004, 1.0, dur);
    this._noise(t, dur, g);
    // Sub thump.
    const g2 = ctx.createGain();
    g2.connect(out);
    this._env(g2.gain, t, 0.004, 0.9, dur * 0.7);
    this._osc('sine', 140 / Math.sqrt(size), 28, t, dur * 0.7, g2);
    // Crackle debris.
    const n = Math.round(2 + size * 3);
    for (let i = 0; i < n; i++) {
      const tt = t + 0.05 + Math.random() * dur * 0.6;
      const hp = this._filter('bandpass', 1500 + Math.random() * 3000, 3);
      hp.connect(out);
      const gc = ctx.createGain();
      gc.connect(hp);
      this._env(gc.gain, tt, 0.001, 0.25 + Math.random() * 0.3, 0.04 + Math.random() * 0.05);
      this._noise(tt, 0.1, gc);
    }
  }

  rockBreak(size = 1, vol = 1, pan = 0) {
    if (!this.ctx || vol < 0.03 || !this._gate('rock', 0.05)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(Math.min(1, 0.5 + 0.2 * size) * vol, pan, 0.3);
    const bp = this._filter('bandpass', 700 / Math.sqrt(size), 1.2);
    bp.connect(out);
    const g = ctx.createGain();
    g.connect(bp);
    this._env(g.gain, t, 0.002, 1.2, 0.25 + 0.2 * size);
    this._noise(t, 0.6, g);
    const g2 = ctx.createGain();
    g2.connect(out);
    this._env(g2.gain, t, 0.002, 0.9, 0.3 + 0.15 * size);
    this._osc('triangle', 110 / Math.sqrt(size), 38, t, 0.4, g2);
    for (let i = 0; i < 3 + size * 2; i++) {
      const tt = t + Math.random() * 0.25;
      const hp = this._filter('highpass', 1800, 1);
      hp.connect(out);
      const gc = ctx.createGain();
      gc.connect(hp);
      this._env(gc.gain, tt, 0.001, 0.35, 0.03);
      this._noise(tt, 0.05, gc);
    }
  }

  hullHit() {
    if (!this.ctx || !this._gate('hull', 0.08)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.7, 0, 0.3);
    const base = 150 + Math.random() * 40;
    [1, 2.76, 5.4, 8.93].forEach((m, i) => {
      const g = ctx.createGain();
      g.connect(out);
      this._env(g.gain, t, 0.001, 0.3 / (i + 1), 0.5 / (1 + i * 0.6));
      this._osc('sine', base * m, base * m * 0.97, t, 0.6, g);
    });
    const lp = this._filter('lowpass', 1200);
    lp.connect(out);
    const gn = ctx.createGain();
    gn.connect(lp);
    this._env(gn.gain, t, 0.001, 0.9, 0.15);
    this._noise(t, 0.2, gn);
  }

  shieldHit() {
    if (!this.ctx || !this._gate('shield', 0.08)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.45, 0, 0.3);
    const bp = this._filter('bandpass', 1400, 2);
    bp.connect(out);
    const g = ctx.createGain();
    g.connect(bp);
    this._env(g.gain, t, 0.002, 0.8, 0.3);
    const o = this._osc('sawtooth', 2200, 500, t, 0.3, g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 55;
    const lg = ctx.createGain();
    lg.gain.value = 400;
    lfo.connect(lg).connect(o.frequency);
    lfo.start(t);
    lfo.stop(t + 0.35);
  }

  pickup() {
    if (!this.ctx) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.4, 0, 0.5);
    [0, 4, 7, 12, 16].forEach((s, i) => {
      const g = ctx.createGain();
      g.connect(out);
      const tt = t + i * 0.055;
      this._env(g.gain, tt, 0.004, 0.35, 0.28);
      this._osc('triangle', 660 * Math.pow(2, s / 12), null, tt, 0.3, g);
    });
  }

  missileLaunch() {
    if (!this.ctx) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.6, 0, 0.3);
    const bp = this._filter('bandpass', 400, 1.2);
    bp.frequency.setValueAtTime(350, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + 0.55);
    bp.connect(out);
    const g = ctx.createGain();
    g.connect(bp);
    this._env(g.gain, t, 0.03, 1.2, 0.6);
    this._noise(t, 0.7, g);
    const g2 = ctx.createGain();
    g2.connect(out);
    this._env(g2.gain, t, 0.005, 0.5, 0.25);
    this._osc('sawtooth', 70, 180, t, 0.25, g2);
  }

  lockBeep(locked) {
    if (!this.ctx || !this._gate('lock', locked ? 0.25 : 0.12)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.18, 0, 0);
    const g = ctx.createGain();
    g.connect(out);
    if (locked) {
      this._env(g.gain, t, 0.002, 0.6, 0.18);
      this._osc('square', 2350, null, t, 0.08, g);
      this._osc('square', 1760, null, t + 0.09, 0.09, g);
    } else {
      this._env(g.gain, t, 0.002, 0.4, 0.05);
      this._osc('square', 1650, null, t, 0.05, g);
    }
  }

  nova() {
    if (!this.ctx) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(1.0, 0, 0.7);
    // Rising charge then a deep boom.
    const g0 = ctx.createGain();
    g0.connect(out);
    this._env(g0.gain, t, 0.15, 0.3, 0.12);
    this._osc('sawtooth', 180, 1800, t, 0.27, g0);
    const tb = t + 0.22;
    const lp = this._filter('lowpass', 900, 0.6);
    lp.frequency.setValueAtTime(1600, tb);
    lp.frequency.exponentialRampToValueAtTime(40, tb + 2.6);
    lp.connect(out);
    const g = ctx.createGain();
    g.connect(lp);
    this._env(g.gain, tb, 0.005, 1.0, 2.6);
    this._noise(tb, 2.7, g);
    const g2 = ctx.createGain();
    g2.connect(out);
    this._env(g2.gain, tb, 0.005, 1.0, 2.0);
    this._osc('sine', 75, 18, tb, 2.0, g2);
  }

  warpIn(vol = 1, pan = 0) {
    if (!this.ctx || vol < 0.03 || !this._gate('warpin', 0.1)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.4 * vol, pan, 0.6);
    const g = ctx.createGain();
    g.connect(out);
    this._env(g.gain, t, 0.25, 0.5, 0.35);
    const o = this._osc('sine', 160, 1300, t, 0.55, g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 22;
    const lg = ctx.createGain();
    lg.gain.value = 120;
    lfo.connect(lg).connect(o.frequency);
    lfo.start(t);
    lfo.stop(t + 0.6);
  }

  warpJump() {
    if (!this.ctx) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.8, 0, 0.8);
    const bp = this._filter('bandpass', 300, 1.5);
    bp.frequency.setValueAtTime(200, t);
    bp.frequency.exponentialRampToValueAtTime(5000, t + 2.0);
    bp.connect(out);
    const g = ctx.createGain();
    g.connect(bp);
    this._env(g.gain, t, 1.6, 1.2, 0.6);
    this._noise(t, 2.3, g);
    const g2 = ctx.createGain();
    g2.connect(out);
    this._env(g2.gain, t, 1.8, 0.35, 0.5);
    this._osc('sawtooth', 55, 880, t, 2.3, g2);
    this._osc('sawtooth', 55.5, 884, t, 2.3, g2);
  }

  boost() {
    if (!this.ctx || !this._gate('boost', 0.4)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.55, 0, 0.2);
    const bp = this._filter('bandpass', 500, 0.9);
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
    bp.connect(out);
    const g = ctx.createGain();
    g.connect(bp);
    this._env(g.gain, t, 0.02, 1.0, 0.45);
    this._noise(t, 0.5, g);
    const g2 = ctx.createGain();
    g2.connect(out);
    this._env(g2.gain, t, 0.005, 0.6, 0.25);
    this._osc('sine', 90, 45, t, 0.25, g2);
  }

  alarm() {
    if (!this.ctx || !this._gate('alarm', 0.9)) return;
    const t = this.now, ctx = this.ctx;
    const out = this._out(0.22, 0, 0.1);
    for (let i = 0; i < 2; i++) {
      const g = ctx.createGain();
      g.connect(out);
      this._env(g.gain, t + i * 0.16, 0.005, 0.5, 0.13);
      this._osc('square', i ? 660 : 880, null, t + i * 0.16, 0.14, g);
    }
  }

  combo(level) {
    if (!this.ctx) return;
    const t = this.now;
    const out = this._out(0.25, 0, 0.4);
    const g = this.ctx.createGain();
    g.connect(out);
    this._env(g.gain, t, 0.003, 0.5, 0.35);
    this._osc('sine', 880 * Math.pow(2, Math.min(level, 8) * 2 / 12), null, t, 0.35, g);
  }

  ui(confirm = false) {
    if (!this.ctx) return;
    const t = this.now;
    const out = this._out(0.25, 0, 0.1);
    const g = this.ctx.createGain();
    g.connect(out);
    this._env(g.gain, t, 0.002, 0.5, 0.07);
    this._osc('sine', 1100, null, t, 0.07, g);
    if (confirm) {
      const g2 = this.ctx.createGain();
      g2.connect(out);
      this._env(g2.gain, t + 0.07, 0.002, 0.5, 0.12);
      this._osc('sine', 1650, null, t + 0.07, 0.12, g2);
    }
  }

  // ---------- Continuous engine ----------
  _setupEngine() {
    const ctx = this.ctx;
    this.engGain = ctx.createGain();
    this.engGain.gain.value = 0;
    this.engGain.connect(this.sfxBus);
    const lp = (this.engLP = this._filter('lowpass', 260, 1.5));
    lp.connect(this.engGain);
    this.engOsc = [ctx.createOscillator(), ctx.createOscillator()];
    this.engOsc[0].type = 'sawtooth';
    this.engOsc[1].type = 'sawtooth';
    this.engOsc[0].frequency.value = 42;
    this.engOsc[1].frequency.value = 42.6;
    this.engOsc.forEach((o) => { o.connect(lp); o.start(); });
    const ns = ctx.createBufferSource();
    ns.buffer = this.noise;
    ns.loop = true;
    this.engNoiseBP = this._filter('bandpass', 500, 0.8);
    this.engNoiseG = ctx.createGain();
    this.engNoiseG.gain.value = 0.25;
    ns.connect(this.engNoiseBP).connect(this.engNoiseG).connect(this.engGain);
    ns.start();
  }

  setEngine(on, speedNorm = 0.5, boosting = false) {
    if (!this.ctx) return;
    const t = this.now;
    this.engGain.gain.setTargetAtTime(on ? 0.12 + (boosting ? 0.1 : 0) : 0, t, 0.15);
    const f = 36 + speedNorm * 30;
    this.engOsc[0].frequency.setTargetAtTime(f, t, 0.2);
    this.engOsc[1].frequency.setTargetAtTime(f * 1.015, t, 0.2);
    this.engLP.frequency.setTargetAtTime(boosting ? 650 : 220 + speedNorm * 150, t, 0.2);
    this.engNoiseBP.frequency.setTargetAtTime(boosting ? 1100 : 380 + speedNorm * 200, t, 0.2);
    this.engNoiseG.gain.setTargetAtTime(boosting ? 0.9 : 0.25, t, 0.2);
  }
}

// ---------- Generative soundtrack ----------
// A-minor synthwave-ish loop: i - VI - III - VII. Layers fade in with combat intensity.
class Music {
  constructor(engine) {
    this.e = engine;
    this.ctx = engine.ctx;
    this.bpm = 98;
    this.step = 0;
    this.nextTime = 0;
    this.playing = false;
    this.mode = 'menu';
    this.intensity = 0;
    this.targetIntensity = 0;
    this.chords = [
      { root: 45, third: 3 }, // Am
      { root: 41, third: 4 }, // F
      { root: 48, third: 4 }, // C
      { root: 43, third: 4 }, // G
    ];
    const ctx = this.ctx;
    this.bus = ctx.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(engine.musicBus);
    // Ping-pong-ish echo for the arp.
    this.delay = ctx.createDelay(1.5);
    this.delay.delayTime.value = (60 / this.bpm) * 0.75;
    this.fb = ctx.createGain();
    this.fb.gain.value = 0.35;
    const dlp = ctx.createBiquadFilter();
    dlp.type = 'lowpass';
    dlp.frequency.value = 2500;
    this.delay.connect(dlp).connect(this.fb).connect(this.delay);
    dlp.connect(this.bus);
    this.timer = null;
  }

  start(mode) {
    this.mode = mode;
    const t = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setTargetAtTime(1, t, 0.8);
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextTime = t + 0.1;
    this.timer = setInterval(() => this._tick(), 30);
  }

  stop() {
    if (!this.playing) return;
    const t = this.ctx.currentTime;
    this.bus.gain.setTargetAtTime(0, t, 0.4);
    setTimeout(() => {
      if (this.bus.gain.value < 0.05) {
        clearInterval(this.timer);
        this.playing = false;
      }
    }, 2000);
  }

  setIntensity(v) { this.targetIntensity = v; }

  _tick() {
    const ctx = this.ctx;
    if (ctx.state !== 'running') return;
    const sixteenth = 60 / this.bpm / 4;
    this.intensity += (this.targetIntensity - this.intensity) * 0.02;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this._schedule(this.step, this.nextTime, sixteenth);
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % 128;
    }
  }

  _voice(type, freq, t, dur, vol, cutoff, dest = this.bus, attack = 0.005) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
    return { o, f, g };
  }

  _schedule(step, t, s16) {
    const chord = this.chords[Math.floor(step / 32)];
    const inBar = step % 16;
    const tones = [chord.root, chord.root + chord.third, chord.root + 7, chord.root + 10 + (chord.third === 4 ? 1 : 0)];
    const combat = this.mode === 'game';
    const I = combat ? this.intensity : 0;

    // Pad on chord change.
    if (step % 32 === 0) {
      const dur = s16 * 32 + 0.6;
      tones.slice(0, 3).forEach((n) => {
        [-6, 6].forEach((cents) => {
          const v = this._voice('sawtooth', mtof(n + 12) * Math.pow(2, cents / 1200), t, dur, 0.022, 900, this.bus, 1.2);
          v.f.frequency.setValueAtTime(500, t);
          v.f.frequency.linearRampToValueAtTime(1300, t + dur * 0.5);
          v.f.frequency.linearRampToValueAtTime(500, t + dur);
        });
      });
    }

    // Bass: quarters in menu, driving eighths in game.
    const bassEvery = combat ? 2 : 4;
    if (step % bassEvery === 0) {
      const oct = combat && inBar % 4 === 2 ? 12 : 0;
      const v = this._voice('sawtooth', mtof(chord.root - 12 + oct), t, s16 * (combat ? 1.8 : 3.5), combat ? 0.11 : 0.07, 900);
      v.f.frequency.setValueAtTime(1100, t);
      v.f.frequency.exponentialRampToValueAtTime(160, t + s16 * 1.5);
    }

    // Arp (fades in with intensity; quiet sparkle in menu).
    const arpAmt = combat ? 0.25 + I * 0.75 : 0.35;
    if (step % (combat ? 1 : 2) === 0) {
      const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
      const idx = pattern[(step / (combat ? 1 : 2)) % pattern.length | 0];
      const n = tones[idx % tones.length] + 24;
      const v = this._voice('triangle', mtof(n), t, s16 * 1.6, 0.035 * arpAmt, 4000);
      v.g.connect(this.delay);
    }

    if (combat) {
      // Kick on beats, hats on off-beats as intensity grows.
      if (inBar % 4 === 0 && I > 0.15) {
        const g = this.ctx.createGain();
        g.connect(this.bus);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.32 * Math.min(1, I * 1.5), t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        const o = this.ctx.createOscillator();
        o.frequency.setValueAtTime(130, t);
        o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
        o.connect(g);
        o.start(t);
        o.stop(t + 0.32);
      }
      if (inBar % 4 === 2 && I > 0.4) {
        const g = this.ctx.createGain();
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 7000;
        hp.connect(g).connect(this.bus);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.07 * I, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        const s = this.ctx.createBufferSource();
        s.buffer = this.e.noise;
        s.connect(hp);
        s.start(t, Math.random(), 0.06);
      }
      if (inBar === 12 && I > 0.6) {
        // Snare-ish clap on beat 4.
        const g = this.ctx.createGain();
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1800;
        bp.connect(g).connect(this.bus);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.12 * I, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        const s = this.ctx.createBufferSource();
        s.buffer = this.e.noise;
        s.connect(bp);
        s.start(t, Math.random(), 0.18);
      }
    }
  }
}

export const audio = new AudioEngine();
