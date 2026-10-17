// Synthesized sound effects and a soft mall-muzak loop. No audio files.
import { S } from './state.js';

let ac = null, master = null, sfxBus = null, musicBus = null, timer = null, nextBar = 0, bar = 0, mode = 'off';

export function unlockAudio(){
  if (ac){ if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
  sfxBus = ac.createGain(); sfxBus.gain.value = S.settings.sound ? 0.7 : 0; sfxBus.connect(master);
  musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
  applySettings();
}
export function applySettings(){
  if (!ac) return;
  sfxBus.gain.setTargetAtTime(S.settings.sound ? 0.7 : 0, ac.currentTime, 0.05);
  setMusicMode(mode);
}

function tone(freq, t0, dur, { type = 'sine', vol = 0.3, to = null, attack = 0.005, bus = sfxBus } = {}){
  const o = ac.createOscillator(), gn = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(vol, t0 + attack); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(gn); gn.connect(bus); o.start(t0); o.stop(t0 + dur + 0.05);
}
function noise(t0, dur, { vol = 0.2, f0 = 2000, f1 = 600, q = 1.5 } = {}){
  const len = Math.ceil(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const gn = ac.createGain(); gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(gn); gn.connect(sfxBus); src.start(t0);
}

export function sfx(name){
  if (!ac || !S.settings.sound) return;
  const t = ac.currentTime;
  switch (name){
    case 'coin': tone(1046, t, 0.09, { type: 'square', vol: 0.08 }); tone(1568, t + 0.07, 0.22, { type: 'square', vol: 0.08 }); break;
    case 'sweep': noise(t, 0.22, { vol: 0.25, f0: 3500, f1: 900 }); break;
    case 'tap': tone(880, t, 0.05, { type: 'triangle', vol: 0.12 }); break;
    case 'pop': tone(620, t, 0.12, { vol: 0.2, to: 320 }); break;
    case 'walkout': tone(240, t, 0.3, { type: 'sawtooth', vol: 0.06, to: 150 }); break;
    case 'error': tone(160, t, 0.18, { type: 'square', vol: 0.06 }); tone(150, t + 0.12, 0.18, { type: 'square', vol: 0.06 }); break;
    case 'chime': tone(1046, t, 0.6, { vol: 0.12 }); tone(1568, t + 0.08, 0.7, { vol: 0.09 }); break;
    case 'bell': tone(784, t, 0.7, { vol: 0.14 }); tone(622, t + 0.35, 0.9, { vol: 0.14 }); break;
    case 'build': noise(t, 0.12, { vol: 0.3, f0: 400, f1: 120, q: 0.8 }); [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, t + 0.12 + i * 0.06, 0.25, { vol: 0.07 })); break;
    case 'level': [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, t + i * 0.09, 0.4, { type: 'triangle', vol: 0.12 })); break;
    case 'wish': [1318, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.1, 0.5, { vol: 0.08 })); break;
  }
}

/* ---------- Muzak ---------- */
// Fmaj7 – Dm7 – Gm7 – C7, electric-piano-ish tones with a soft bass.
const PROG = [[53, [65, 69, 72, 76]], [50, [62, 65, 69, 72]], [55, [62, 65, 67, 70]], [48, [64, 67, 70, 72]]];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function scheduleBar(t0, i, night){
  const beat = night ? 0.85 : 0.68;
  const [bass, chord] = PROG[i % 4];
  tone(mtof(bass - 12), t0, beat * 3.6, { type: 'sine', vol: night ? 0.07 : 0.1, attack: 0.02, bus: musicBus });
  for (const b of [0, 2]){
    for (const n of chord) tone(mtof(n), t0 + b * beat, beat * 1.8, { type: 'triangle', vol: night ? 0.018 : 0.025, attack: 0.01, bus: musicBus });
  }
  if (!night){
    const notes = [chord[3] + 12, chord[2] + 12, chord[1] + 12, chord[3] + 12];
    [0.5, 1.5, 2.5, 3.25].forEach((b, k) => { if ((i + k) % 3 !== 0) tone(mtof(notes[k]), t0 + b * beat, beat * 0.9, { type: 'sine', vol: 0.03, bus: musicBus }); });
  }
  return beat * 4;
}
export function setMusicMode(m){
  mode = m;
  if (!ac) return;
  const on = S.settings.music && m !== 'off';
  musicBus.gain.setTargetAtTime(on ? (m === 'night' ? 0.5 : 0.65) : 0, ac.currentTime, 0.6);
  if (on && !timer){
    nextBar = ac.currentTime + 0.1;
    timer = setInterval(() => {
      while (nextBar < ac.currentTime + 0.6){ nextBar += scheduleBar(nextBar, bar++, mode === 'night'); }
    }, 150);
  } else if (!on && timer){ clearInterval(timer); timer = null; }
}
