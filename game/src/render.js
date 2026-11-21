// Drawing the two panels and everything on top of them: the found
// markers (a ring on both panels at once), the red X of a wrong click,
// the hint pulse, the keyboard crosshair and the floating score text.
// The scene itself is drawn by scenes.js; this file only frames it.
import { PANEL_H, PANEL_W, HINT_COLOR, MARK_FOUND, MARK_WRONG } from './config.js';
import { circle, line } from './draw.js';

/** Paint one panel: the scene variant, then its markers and effects. */
export function drawPanel(ctx, scene, variant, decor, marks) {
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, PANEL_W, PANEL_H);
  ctx.clip();
  scene.draw(ctx, variant, decor);
  ctx.restore();
  for (const mark of marks.found) {
    ring(ctx, mark.x, mark.y, mark.r, MARK_FOUND, 4);
  }
  if (marks.hint !== null) {
    const p = marks.hint;
    const pulse = 1 + 0.25 * Math.sin(p.age * 0.012);
    ring(ctx, p.x, p.y, p.r * pulse + 6, HINT_COLOR, 3);
  }
  for (const fx of marks.wrongs) {
    const a = Math.max(0, 1 - fx.age / 500);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.strokeStyle = MARK_WRONG;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const r = 12;
    line(ctx, fx.x - r, fx.y - r, fx.x + r, fx.y + r, MARK_WRONG, 4);
    line(ctx, fx.x + r, fx.y - r, fx.x - r, fx.y + r, MARK_WRONG, 4);
    ctx.globalAlpha = 1;
    ctx.lineCap = 'butt';
  }
  for (const fl of marks.floats) {
    const a = Math.max(0, 1 - fl.age / 900);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd23f';
    ctx.fillText(fl.text, fl.x, fl.y - fl.age * 0.03);
    ctx.globalAlpha = 1;
  }
}

/** A ring marker: two strokes so it reads on any background. */
function ring(ctx, x, y, r, color, width) {
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = width + 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

/** The keyboard crosshair on the active panel. */
export function drawCrosshair(ctx, x, y) {
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, x - 20, y, x - 8, y, 'rgba(255,255,255,0.9)', 2);
  line(ctx, x + 8, y, x + 20, y, 'rgba(255,255,255,0.9)', 2);
  line(ctx, x, y - 20, x, y - 8, 'rgba(255,255,255,0.9)', 2);
  line(ctx, x, y + 8, x, y + 20, 'rgba(255,255,255,0.9)', 2);
  circle(ctx, x, y, 2, '#ffd23f');
}
