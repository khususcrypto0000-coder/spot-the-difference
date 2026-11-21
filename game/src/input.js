// Pointer and keyboard input: turning a click or a key press into a
// panel coordinate, and a panel coordinate into the difference it hits.
// No game rules live here, only geometry and events.
import { PANEL_H, PANEL_W } from './config.js';

/** A mouse/touch point in panel coordinates (the canvas is scaled by CSS). */
export function toPanelCoords(canvas, clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((clientX - box.left) / box.width) * PANEL_W,
    y: ((clientY - box.top) / box.height) * PANEL_H,
  };
}

/**
 * The difference a point hits: the nearest unfound one whose circle holds
 * it, or -1. A click on an already-found difference is not a hit, so
 * re-clicking a ring never scores twice.
 */
export function findHit(diffs, found, x, y) {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < diffs.length; i += 1) {
    if (found.has(i)) continue;
    const d = diffs[i];
    const dist = Math.hypot(x - d.x, y - d.y);
    if (dist <= d.r && dist < bestD) {
      best = i;
      bestD = dist;
    }
  }
  return best;
}

/** Attach a click handler to a panel canvas; returns a detach function. */
export function bindPointer(canvas, onPoint) {
  const handler = (event) => {
    event.preventDefault();
    onPoint(toPanelCoords(canvas, event.clientX, event.clientY));
  };
  canvas.addEventListener('pointerdown', handler);
  return () => canvas.removeEventListener('pointerdown', handler);
}

const KEY_ACTIONS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'mark',
  ' ': 'mark',
  h: 'hint',
  H: 'hint',
  p: 'pause',
  P: 'pause',
  m: 'mute',
  M: 'mute',
  r: 'restart',
  R: 'restart',
  Escape: 'escape',
};

/**
 * Attach the keyboard controls; `onAction(action, event)` receives one of
 * up/down/left/right/mark/hint/pause/mute/restart/escape. Arrow keys and
 * space never scroll the page while the game has focus.
 */
export function bindKeys(onAction) {
  const handler = (event) => {
    const action = KEY_ACTIONS[event.key];
    if (action === undefined) return;
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right' || action === 'mark') {
      event.preventDefault();
    }
    onAction(action, event);
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
