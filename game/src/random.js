// A tiny seeded RNG (mulberry32) so a scene draws the same decorative
// details on both panels and the same frame every time a seed is used.
// Nothing in the game reads Math.random: every shuffle and scatter goes
// through here, which is what makes the ?shot= frames deterministic.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh RNG for one scene draw, so both panels consume the same numbers. */
export function sceneRng(levelId, seed) {
  return mulberry32(levelId * 1000003 + seed * 97 + 13);
}

/** Fisher-Yates shuffle driven by `rng`; returns a new array. */
export function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** An integer in [min, max] from `rng`. */
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
