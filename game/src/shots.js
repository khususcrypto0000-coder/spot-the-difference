// The deterministic screenshot scenes behind ?shot=start|play|end.
// Each one drives the real game forward from a fresh level, so the frame
// is what a short game really looks like — the same seed always gives
// the same frame. The clock is frozen by the caller, so nothing moves
// between the staging and the capture.
import { mulberry32, shuffle } from './random.js';

/**
 * Set the game to the named scene and leave it there:
 * - start: the title screen over level 1, nothing found yet.
 * - play: level 1 mid-hunt, 3 of 7 found with rings on both panels,
 *   4 still unfound, the counter showing what remains, 2:12 on the clock.
 * - end: level 1 finished, every difference ringed, stars and score shown.
 */
export function stageShot(game, name, seed) {
  if (name === 'play') {
    game.startLevel(0);
    game.setTimeLeft(132);
    const order = shuffle(game.scene.diffs.map((d, i) => i), mulberry32(seed));
    for (const index of order.slice(0, 3)) game.findDiff(index);
    return;
  }
  if (name === 'end') {
    game.startLevel(0);
    game.setTimeLeft(96);
    for (let i = 0; i < game.scene.diffs.length; i += 1) game.findDiff(i);
    return;
  }
  // Any other name is the start scene: title over a fresh level 1.
  game.toTitle();
}
