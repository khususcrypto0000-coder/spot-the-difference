// Dusk Differences: the state machine, the loop and the HUD wiring.
// Screens: title, playing, paused, level-complete, game-complete, timeout.
// The pictures are drawn by scenes.js through render.js; the rules
// (find, hint, timer, score, stars) live here and nowhere else.
import { COMBO_STEP, FIND_POINTS, HINT_COST, MAX_HINTS, PANEL_H, PANEL_W, WRONG_PENALTY_SECONDS } from './config.js';
import { SCENES } from './scenes.js';
import { sceneRng, shuffle } from './random.js';
import { drawCrosshair, drawPanel } from './render.js';
import { bindKeys, bindPointer, findHit, toPanelCoords } from './input.js';
import { isMuted, setMuted, soundClick, soundFind, soundHint, soundTimeout, soundWin, soundWrong } from './audio.js';
import { stageShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const leftCanvas = $('panel-left');
const rightCanvas = $('panel-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const BEST_KEY = 'dusk-differences-best';

export const game = {
  screen: 'title',
  levelIndex: 0,
  scene: SCENES[0],
  decor: null,
  found: new Set(),
  score: 0,
  totalScore: 0,
  combo: 0,
  hintsLeft: MAX_HINTS,
  timeLeft: 0,
  timeLimit: 0,
  frozen: false,
  shotMode: false,
  crosshair: { panel: 0, x: PANEL_W / 2, y: PANEL_H / 2, visible: false },
  marks: { found: [], wrongs: [], floats: [], hint: null },
  best: 0,
  lastTs: 0,
};

function loadBest() {
  try {
    game.best = Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    game.best = 0;
  }
}

function saveBest() {
  try {
    window.localStorage.setItem(BEST_KEY, String(game.best));
  } catch {
    // Storage is a nicety, never a failure.
  }
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateHud() {
  const scene = game.scene;
  $('level-name').textContent = `Level ${game.levelIndex + 1} · ${scene.name} — ${scene.sub}`;
  $('timer-text').textContent = fmtTime(game.timeLeft);
  const frac = game.timeLimit > 0 ? game.timeLeft / game.timeLimit : 0;
  const bar = $('timer-bar');
  bar.style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
  bar.classList.toggle('low', frac < 0.25);
  const remaining = scene.diffs.length - game.found.size;
  $('found-text').textContent = `Found ${game.found.size} / ${scene.diffs.length} · ${remaining} left`;
  $('score-text').textContent = `Score ${game.score + game.totalScore}`;
  $('hints-text').textContent = `Hints ${game.hintsLeft}`;
  $('btn-hint').disabled = game.hintsLeft <= 0 || game.screen !== 'playing';
  $('best-text').textContent = game.best > 0 ? `Best ${game.best}` : '';
}

function showOverlay(title, bodyHtml, buttonLabel, onButton) {
  const overlay = $('overlay');
  $('overlay-title').textContent = title;
  $('overlay-body').innerHTML = bodyHtml;
  const btn = $('overlay-btn');
  btn.textContent = buttonLabel;
  btn.onclick = () => {
    soundClick();
    onButton();
  };
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  $('overlay').classList.add('hidden');
}

function refreshMarks() {
  game.marks.found = game.scene.diffs
    .map((d, i) => ({ ...d, i }))
    .filter((d) => game.found.has(d.i));
}

export function toTitle() {
  game.screen = 'title';
  game.levelIndex = 0;
  game.scene = SCENES[0];
  game.decor = game.scene.decor(sceneRng(game.scene.id, 1));
  game.found = new Set();
  game.score = 0;
  game.totalScore = 0;
  game.combo = 0;
  game.hintsLeft = MAX_HINTS;
  game.timeLeft = game.scene.timeLimit;
  game.timeLimit = game.scene.timeLimit;
  game.marks = { found: [], wrongs: [], floats: [], hint: null };
  refreshMarks();
  updateHud();
  showOverlay(
    'Dusk Differences',
    `<p>Two pictures, side by side. One of them hides the changes.</p>
     <p>Click a difference on either picture to mark it on both. Find them all before the time runs out.</p>
     <p class="levels">1 · Warung Kopi Senja — 7 differences · 3:00<br>
     2 · Pasar Pagi — 7 differences · 2:30<br>
     3 · Taman Senja — 8 differences · 2:00</p>
     <p class="keys">Mouse or arrow keys + Enter to mark · H hint · P pause · M sound</p>`,
    'Start level 1',
    () => startLevel(0),
  );
}

export function startLevel(index) {
  game.levelIndex = index;
  game.scene = SCENES[index];
  game.decor = game.scene.decor(sceneRng(game.scene.id, 1));
  game.found = new Set();
  game.score = 0;
  game.combo = 0;
  game.hintsLeft = MAX_HINTS;
  game.timeLeft = game.scene.timeLimit;
  game.timeLimit = game.scene.timeLimit;
  game.marks = { found: [], wrongs: [], floats: [], hint: null };
  game.screen = 'playing';
  hideOverlay();
  refreshMarks();
  updateHud();
}

function applyFound(index, silent = false) {
  const diff = game.scene.diffs[index];
  game.found.add(index);
  const gained = FIND_POINTS + game.combo * COMBO_STEP;
  game.score += gained;
  game.combo += 1;
  game.marks.floats.push({ x: diff.x, y: diff.y - 24, text: `+${gained}`, age: 0 });
  refreshMarks();
  if (!silent) soundFind(game.combo);
  updateHud();
  if (game.found.size === game.scene.diffs.length) finishLevel();
}

function applyWrong(x, y) {
  game.combo = 0;
  game.timeLeft = Math.max(0, game.timeLeft - WRONG_PENALTY_SECONDS);
  game.marks.wrongs.push({ x, y, age: 0 });
  soundWrong();
  updateHud();
  if (game.timeLeft <= 0) timeUp();
}

export function markAt(x, y) {
  if (game.screen !== 'playing') return;
  const hit = findHit(game.scene.diffs, game.found, x, y);
  if (hit >= 0) applyFound(hit);
  else applyWrong(x, y);
}

/** Mark one difference through the real find path (used by ?shot= staging). */
export function findDiff(index, silent = true) {
  if (game.screen !== 'playing' || game.found.has(index)) return;
  applyFound(index, silent);
}

/** Freeze the clock at a fixed value (used by ?shot= staging). */
export function setTimeLeft(seconds) {
  game.timeLeft = seconds;
  updateHud();
}

export function useHint() {
  if (game.screen !== 'playing' || game.hintsLeft <= 0) return;
  const remaining = game.scene.diffs.map((d, i) => i).filter((i) => !game.found.has(i));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  const diff = game.scene.diffs[pick];
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.marks.hint = { ...diff, age: 0 };
  window.setTimeout(() => {
    if (game.marks.hint !== null && game.marks.hint.x === diff.x) game.marks.hint = null;
  }, 2600);
  soundHint();
  updateHud();
}

function starsFor() {
  const frac = game.timeLeft / game.timeLimit;
  if (frac >= 0.5) return 3;
  if (frac >= 0.25) return 2;
  return 1;
}

export function finishLevel() {
  const timeBonus = Math.round(game.timeLeft) * 2;
  game.score += timeBonus;
  const levelScore = game.score;
  game.totalScore += game.score;
  game.score = 0; // banked: the HUD now shows the running total only
  const stars = starsFor();
  game.screen = 'level-complete';
  soundWin();
  const last = game.levelIndex === SCENES.length - 1;
  if (last) {
    if (game.totalScore > game.best) {
      game.best = game.totalScore;
      saveBest();
    }
    showOverlay(
      'All levels clear!',
      `<p>You found every difference in all three scenes.</p>
       <p class="big">Total score ${game.totalScore}</p>
       <p>Best ${game.best} · ${'★'.repeat(3)}</p>`,
      'Play again',
      () => {
        game.totalScore = 0;
        startLevel(0);
      },
    );
  } else {
    showOverlay(
      `Level ${game.levelIndex + 1} complete!`,
      `<p class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
       <p>Found ${game.scene.diffs.length} / ${game.scene.diffs.length} · Time bonus +${timeBonus}</p>
       <p class="big">Level score ${levelScore} · Total ${game.totalScore}</p>`,
      `Next: ${SCENES[game.levelIndex + 1].name}`,
      () => startLevel(game.levelIndex + 1),
    );
  }
  updateHud();
}

function timeUp() {
  game.screen = 'timeout';
  soundTimeout();
  showOverlay(
    "Time's up!",
    `<p>You found ${game.found.size} of ${game.scene.diffs.length} differences in ${game.scene.name}.</p>
     <p>Wrong clicks cost ${WRONG_PENALTY_SECONDS} seconds — slow down and look twice.</p>`,
    'Retry this level',
    () => startLevel(game.levelIndex),
  );
  updateHud();
}

export function togglePause() {
  if (game.screen === 'playing') {
    game.screen = 'paused';
    showOverlay('Paused', '<p>Take a breath. The pictures will wait.</p>', 'Resume', () => {
      game.screen = 'playing';
      hideOverlay();
    });
  } else if (game.screen === 'paused') {
    game.screen = 'playing';
    hideOverlay();
  }
}

function tick(ts) {
  const dt = game.lastTs === 0 ? 0 : Math.min(0.1, (ts - game.lastTs) / 1000);
  game.lastTs = ts;
  if (game.screen === 'playing' && !game.frozen) {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      timeUp();
    }
    updateHud();
  }
  for (const fx of game.marks.wrongs) fx.age += dt * 1000;
  for (const fl of game.marks.floats) fl.age += dt * 1000;
  if (game.marks.hint !== null) game.marks.hint.age += dt * 1000;
  game.marks.wrongs = game.marks.wrongs.filter((f) => f.age < 500);
  game.marks.floats = game.marks.floats.filter((f) => f.age < 900);
  drawPanel(leftCtx, game.scene, 0, game.decor, game.marks);
  drawPanel(rightCtx, game.scene, 1, game.decor, game.marks);
  if (game.crosshair.visible && game.screen === 'playing') {
    drawCrosshair(game.crosshair.panel === 0 ? leftCtx : rightCtx, game.crosshair.x, game.crosshair.y);
  }
  window.requestAnimationFrame(tick);
}

function moveCrosshair(dx, dy) {
  const c = game.crosshair;
  c.visible = true;
  c.x += dx;
  c.y += dy;
  if (c.x < 0) {
    c.panel = c.panel === 0 ? 1 : 0;
    c.x += PANEL_W;
  } else if (c.x > PANEL_W) {
    c.panel = c.panel === 0 ? 1 : 0;
    c.x -= PANEL_W;
  }
  c.x = Math.max(0, Math.min(PANEL_W, c.x));
  c.y = Math.max(0, Math.min(PANEL_H, c.y));
}

function init() {
  // The state object carries its own controls, so the screenshot staging
  // (shots.js) can drive the real game without a second interface.
  Object.assign(game, { toTitle, startLevel, findDiff, setTimeLeft });
  leftCanvas.width = PANEL_W;
  leftCanvas.height = PANEL_H;
  rightCanvas.width = PANEL_W;
  rightCanvas.height = PANEL_H;
  loadBest();
  $('btn-hint').addEventListener('click', () => useHint());
  $('btn-pause').addEventListener('click', () => togglePause());
  $('btn-sound').addEventListener('click', () => {
    const muted = setMuted(!isMuted());
    $('btn-sound').textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
  });
  $('btn-restart').addEventListener('click', () => {
    soundClick();
    startLevel(game.levelIndex);
  });
  bindPointer(leftCanvas, (p) => {
    game.crosshair = { panel: 0, x: p.x, y: p.y, visible: false };
    markAt(p.x, p.y);
  });
  bindPointer(rightCanvas, (p) => {
    game.crosshair = { panel: 1, x: p.x, y: p.y, visible: false };
    markAt(p.x, p.y);
  });
  // Hovering a panel with the mouse hides the keyboard crosshair.
  for (const canvas of [leftCanvas, rightCanvas]) {
    canvas.addEventListener('pointermove', (event) => {
      game.crosshair.visible = false;
      const p = toPanelCoords(canvas, event.clientX, event.clientY);
      game.crosshair.x = p.x;
      game.crosshair.y = p.y;
      game.crosshair.panel = canvas === leftCanvas ? 0 : 1;
    });
  }
  bindKeys((action) => {
    if (action === 'mute') {
      const muted = setMuted(!isMuted());
      $('btn-sound').textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
      return;
    }
    if (action === 'pause') {
      if (game.screen === 'playing' || game.screen === 'paused') togglePause();
      return;
    }
    if (action === 'restart') {
      if (game.screen === 'playing' || game.screen === 'paused') startLevel(game.levelIndex);
      return;
    }
    if (action === 'hint') {
      useHint();
      return;
    }
    if (game.screen !== 'playing') return;
    if (action === 'mark') {
      game.crosshair.visible = true;
      markAt(game.crosshair.x, game.crosshair.y);
      return;
    }
    const step = 14;
    if (action === 'up') moveCrosshair(0, -step);
    if (action === 'down') moveCrosshair(0, step);
    if (action === 'left') moveCrosshair(-step, 0);
    if (action === 'right') moveCrosshair(step, 0);
  });

  // Deterministic screenshot staging: ?shot=start|play|end&seed=N
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') ?? 1) || 1;
  if (shot !== null) {
    game.shotMode = true;
    game.frozen = true;
    setMuted(true);
    toTitle();
    stageShot(game, shot, seed);
  } else {
    toTitle();
  }
  updateHud();
  // A handle for automated checks (screenshots, playtests): the live state.
  window.__game = game;
  window.requestAnimationFrame(tick);
}

init();
