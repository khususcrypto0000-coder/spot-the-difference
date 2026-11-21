// Procedural sound effects through WebAudio: no audio files, no network.
// Every effect is a few oscillators with an envelope, so the game stays
// silent until the player first interacts (browsers block audio before a
// gesture) and stays fully offline.
let ctx = null;
let muted = false;

function audio() {
  if (ctx === null) {
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx !== null && ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type = 'sine', gain = 0.12) {
  const ac = audio();
  if (ac === null || muted) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

function now() {
  const ac = audio();
  return ac === null ? 0 : ac.currentTime;
}

/** A bright rising arpeggio when a difference is found. */
export function soundFind(combo = 0) {
  const t = now();
  const base = 523.25 * (1 + Math.min(combo, 6) * 0.06);
  tone(base, t, 0.14, 'sine', 0.14);
  tone(base * 1.25, t + 0.07, 0.14, 'sine', 0.12);
  tone(base * 1.5, t + 0.14, 0.22, 'sine', 0.12);
}

/** A dull buzz for a wrong click. */
export function soundWrong() {
  const t = now();
  tone(160, t, 0.18, 'sawtooth', 0.07);
  tone(110, t + 0.05, 0.2, 'sawtooth', 0.06);
}

/** A soft tick for a UI click. */
export function soundClick() {
  tone(880, now(), 0.06, 'triangle', 0.06);
}

/** A short sparkle when a hint is spent. */
export function soundHint() {
  const t = now();
  tone(1174.66, t, 0.1, 'sine', 0.09);
  tone(1567.98, t + 0.09, 0.16, 'sine', 0.08);
}

/** A little fanfare for finishing a level. */
export function soundWin() {
  const t = now();
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.11, 0.28, 'triangle', 0.11));
}

/** A low two-note cue when time runs out. */
export function soundTimeout() {
  const t = now();
  tone(392, t, 0.25, 'triangle', 0.1);
  tone(261.63, t + 0.22, 0.4, 'triangle', 0.1);
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  return muted;
}
