// The three scenes of Dusk Differences. Each scene is drawn twice, once
// per panel: variant 0 is the original, variant 1 hides the changes. A
// scene's `diffs` list names exactly where those changes sit, so the
// click test, the markers and the pictures always agree. Decorative
// scatter (stars, pebbles, fireflies) is precomputed once per level by
// `decor(rng)` and shared by both panels, so the two pictures are
// identical except for the differences on purpose.
import { circle, ellipse, glow, line, poly, rect, roundRect, star, text, vgrad } from './draw.js';
import { intBetween } from './random.js';

// ---------------------------------------------------------------- level 1
function warungDecor(rng) {
  const pebbles = [];
  for (let i = 0; i < 14; i += 1) {
    pebbles.push({ x: intBetween(rng, 20, 600), y: intBetween(rng, 372, 394), r: intBetween(rng, 2, 5) });
  }
  return { pebbles };
}

function drawWarung(ctx, v, d) {
  // Dusk sky and low sun.
  ctx.fillStyle = vgrad(ctx, 0, 0, 0, 280, [[0, '#2b1b4d'], [0.55, '#7b2d5e'], [1, '#ff7e5f']]);
  ctx.fillRect(0, 0, 620, 282);
  glow(ctx, 505, 205, 70, '#ffd166', 0.7);
  circle(ctx, 505, 205, 32, '#ffd166');
  // Rooftops far away.
  ctx.fillStyle = '#241636';
  poly(ctx, [[0, 282], [0, 250], [60, 232], [120, 252], [190, 238], [260, 254], [330, 240], [420, 256], [500, 238], [570, 252], [620, 244], [620, 282]]);
  // Ground.
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(0, 282, 620, 118);
  ctx.fillStyle = '#4a3626';
  ctx.fillRect(0, 282, 620, 6);
  for (const p of d.pebbles) circle(ctx, p.x, p.y, p.r, '#5a4632');
  // String lights across the top.
  ctx.strokeStyle = '#1d1420';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 28);
  ctx.quadraticCurveTo(310, 78, 600, 34);
  ctx.stroke();
  const bulbColors = ['#ffd23f', '#ff5964', '#4cc9f0', '#ffd23f', '#3ddc84'];
  for (let i = 0; i < 9; i += 1) {
    const t = i / 8;
    const x = 20 + (600 - 20) * t;
    // The bulb hangs on the sagging wire: y of the quadratic curve at t.
    const by = (1 - t) * (1 - t) * 28 + 2 * (1 - t) * t * 78 + t * t * 34;
    line(ctx, x, by - 12, x, by - 2, '#1d1420', 2);
    circle(ctx, x, by + 3, 5, bulbColors[i % bulbColors.length]);
    glow(ctx, x, by + 3, 12, bulbColors[i % bulbColors.length], 0.5);
  }
  // The wooden stall: counter, posts, striped awning.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(96, 268, 14, 96);
  ctx.fillRect(322, 268, 14, 96);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(84, 300, 264, 64);
  ctx.fillStyle = '#a06a3d';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(84, 306 + i * 15, 264, 3);
  ctx.fillStyle = '#7a4a28';
  ctx.fillRect(84, 300, 264, 8);
  // Awning stripes.
  for (let i = 0; i < 8; i += 1) {
    poly(ctx, [[70 + i * 36, 232], [106 + i * 36, 232], [100 + i * 36, 268], [76 + i * 36, 268]], i % 2 === 0 ? '#d64545' : '#f6ead8');
  }
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(66, 228, 296, 8);
  // Menu board: three chalk lines, or two when changed.
  roundRect(ctx, 246, 312, 88, 40, 6, '#20242e');
  ctx.strokeStyle = '#e8e4d8';
  ctx.lineWidth = 2;
  line(ctx, 256, 322, 324, 322, '#e8e4d8', 2);
  line(ctx, 256, 332, 312, 332, '#e8e4d8', 2);
  if (v === 0) line(ctx, 256, 342, 296, 342, '#e8e4d8', 2);
  // Kettle on the counter, with steam only in the original.
  ctx.fillStyle = '#c9ced6';
  ellipse(ctx, 150, 288, 20, 14, '#c9ced6');
  poly(ctx, [[168, 284], [184, 276], [182, 286], [168, 292]], '#aab0bc');
  rect(ctx, 146, 270, 8, 8, '#8f959f');
  if (v === 0) {
    ctx.strokeStyle = 'rgba(240,240,240,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(146, 262);
    ctx.quadraticCurveTo(138, 246, 146, 232);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(158, 262);
    ctx.quadraticCurveTo(166, 248, 158, 234);
    ctx.stroke();
  }
  // Cups on the counter: three, or two when changed.
  for (const cx of [200, 224, 248]) {
    if (v === 1 && cx === 224) continue;
    ctx.fillStyle = '#f2ede4';
    roundRect(ctx, cx - 8, 288, 16, 14, 3, '#f2ede4');
    ctx.fillStyle = '#b5542d';
    ctx.fillRect(cx - 8, 288, 16, 4);
  }
  // Hanging lamp: lit warm in the original, dim in the changed one.
  line(ctx, 312, 268, 312, 282, '#1d1420', 2);
  if (v === 0) glow(ctx, 312, 292, 26, '#ffd23f', 0.8);
  circle(ctx, 312, 292, 8, v === 0 ? '#ffd23f' : '#6b6252');
  // Stool with the orange cat; its tail points up, or lies flat.
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(424, 344, 56, 8);
  ctx.fillRect(432, 352, 6, 22);
  ctx.fillRect(466, 352, 6, 22);
  ctx.fillStyle = '#e8912d';
  ellipse(ctx, 452, 330, 22, 14, '#e8912d');
  circle(ctx, 436, 312, 13, '#e8912d');
  poly(ctx, [[428, 302], [432, 290], [438, 300]], '#e8912d');
  poly(ctx, [[440, 300], [446, 290], [448, 302]], '#e8912d');
  ctx.strokeStyle = '#e8912d';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (v === 0) {
    // Tail up, tip near (488, 296).
    ctx.moveTo(472, 330);
    ctx.quadraticCurveTo(492, 318, 488, 296);
  } else {
    // Tail tucked in, tip near (480, 318): same neighbourhood, other shape.
    ctx.moveTo(472, 332);
    ctx.quadraticCurveTo(486, 330, 480, 318);
  }
  ctx.stroke();
  ctx.lineCap = 'butt';
  circle(ctx, 431, 310, 2, '#20242e');
  // Bicycle leaning on the right, with a basket or without one.
  ctx.strokeStyle = '#20242e';
  ctx.lineWidth = 3;
  circle(ctx, 516, 348, 20, undefined);
  ctx.strokeStyle = '#20242e';
  ctx.beginPath();
  ctx.arc(516, 348, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(572, 348, 20, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, 516, 348, 544, 312, '#20242e', 3);
  line(ctx, 544, 312, 572, 348, '#20242e', 3);
  line(ctx, 544, 312, 536, 296, '#20242e', 3);
  line(ctx, 536, 296, 556, 296, '#20242e', 3);
  if (v === 0) {
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 2;
    ctx.strokeRect(548, 300, 22, 16);
    line(ctx, 548, 300, 570, 300, '#8a5a33', 2);
  }
  // Potted plant: a red flower, or a yellow one.
  ctx.fillStyle = '#b5542d';
  poly(ctx, [[44, 330], [76, 330], [70, 356], [50, 356]], '#b5542d');
  ctx.strokeStyle = '#3ddc84';
  ctx.lineWidth = 4;
  line(ctx, 60, 330, 60, 306, '#3ddc84', 4);
  ellipse(ctx, 48, 316, 12, 6, '#3ddc84');
  ellipse(ctx, 72, 318, 12, 6, '#3ddc84');
  circle(ctx, 60, 300, 9, v === 0 ? '#ff5964' : '#ffd23f');
  circle(ctx, 60, 300, 3, '#fff3b0');
}

// ---------------------------------------------------------------- level 2
function marketDecor(rng) {
  const clouds = [];
  for (let i = 0; i < 3; i += 1) clouds.push({ x: intBetween(rng, 40, 520), y: intBetween(rng, 30, 90), s: intBetween(rng, 26, 44) });
  const grass = [];
  for (let i = 0; i < 12; i += 1) grass.push({ x: intBetween(rng, 16, 604), y: intBetween(rng, 368, 392) });
  return { clouds, grass };
}

function drawMarket(ctx, v, d) {
  // Morning sky, sun and clouds.
  ctx.fillStyle = vgrad(ctx, 0, 0, 0, 260, [[0, '#8ec9ee'], [1, '#eaf7ff']]);
  ctx.fillRect(0, 0, 620, 262);
  glow(ctx, 540, 62, 60, '#fff3b0', 0.8);
  circle(ctx, 540, 62, 26, '#ffd23f');
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const c of d.clouds) {
    ellipse(ctx, c.x, c.y, c.s, c.s * 0.45, 'rgba(255,255,255,0.9)');
    ellipse(ctx, c.x + c.s * 0.7, c.y + 6, c.s * 0.7, c.s * 0.4, 'rgba(255,255,255,0.9)');
  }
  // Ground.
  ctx.fillStyle = '#d9b380';
  ctx.fillRect(0, 262, 620, 138);
  ctx.fillStyle = '#c9a06e';
  ctx.fillRect(0, 262, 620, 6);
  ctx.strokeStyle = '#8a9a5b';
  ctx.lineWidth = 2;
  for (const g of d.grass) {
    line(ctx, g.x, g.y, g.x - 3, g.y - 8, '#8a9a5b', 2);
    line(ctx, g.x + 4, g.y, g.x + 7, g.y - 7, '#8a9a5b', 2);
  }
  // The big umbrella: red stripes, or blue ones.
  const stripe = v === 0 ? '#d64545' : '#3a6fd8';
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(306, 130, 8, 160);
  for (let i = 0; i < 8; i += 1) {
    const a0 = Math.PI + (i * Math.PI) / 8;
    const a1 = Math.PI + ((i + 1) * Math.PI) / 8;
    ctx.beginPath();
    ctx.moveTo(310, 132);
    ctx.arc(310, 132, 168, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? stripe : '#f6ead8';
    ctx.fill();
  }
  ctx.fillStyle = '#20242e';
  circle(ctx, 310, 132, 8, '#20242e');
  // A little bird on top of the umbrella, or none.
  if (v === 0) {
    ctx.fillStyle = '#3a6fd8';
    ellipse(ctx, 310, 52, 12, 8, '#3a6fd8');
    circle(ctx, 320, 46, 6, '#3a6fd8');
    poly(ctx, [[325, 44], [332, 46], [325, 49]], '#ff9f1c');
    ctx.strokeStyle = '#3a6fd8';
    ctx.lineWidth = 2;
    line(ctx, 300, 58, 292, 52, '#3a6fd8', 2);
  }
  // Hanging sign: BUAH in the original, SAYUR in the changed one.
  line(ctx, 310, 150, 310, 178, '#5d3a1e', 3);
  roundRect(ctx, 262, 178, 96, 34, 6, '#f6ead8');
  ctx.strokeStyle = '#5d3a1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(262, 178, 96, 34);
  text(ctx, v === 0 ? 'BUAH' : 'SAYUR', 310, 196, 20, '#b5542d');
  // The fruit cart.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(150, 292, 320, 16);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(160, 308, 300, 46);
  ctx.fillStyle = '#20242e';
  circle(ctx, 190, 362, 14, '#20242e');
  circle(ctx, 430, 362, 14, '#20242e');
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(150, 292, 10, 62);
  ctx.fillRect(460, 292, 10, 62);
  // Oranges piled on the left of the cart.
  for (const [ox, oy] of [[180, 282], [205, 282], [230, 282], [192, 268], [217, 268], [205, 254]]) {
    circle(ctx, ox, oy, 11, '#ff9f1c');
    circle(ctx, ox - 3, oy - 3, 3, '#ffd23f');
  }
  // Apples piled on the right: one is missing in the changed picture.
  const apples = [[380, 282], [405, 282], [430, 282], [392, 268], [417, 268], [405, 254]];
  for (let i = 0; i < apples.length; i += 1) {
    if (v === 1 && i === 2) continue;
    const [ax, ay] = apples[i];
    circle(ctx, ax, ay, 11, '#d64545');
    circle(ctx, ax - 3, ay - 4, 3, '#ff8a80');
  }
  // Baskets on the left.
  ctx.fillStyle = '#a9804a';
  ellipse(ctx, 118, 330, 30, 14, '#a9804a');
  ellipse(ctx, 118, 322, 24, 10, '#c9a06e');
  ellipse(ctx, 168, 338, 26, 12, '#a9804a');
  // The weighing scale: its needle points left, or right.
  ctx.fillStyle = '#8f959f';
  ctx.fillRect(476, 292, 6, 34);
  circle(ctx, 479, 258, 16, '#c9ced6');
  ctx.strokeStyle = '#20242e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(479, 258, 16, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, 479, 258, v === 0 ? 468 : 490, 250, '#d64545', 2);
  ellipse(ctx, 448, 300, 18, 5, '#8f959f');
  // Crates stacked on the right: three, or two.
  ctx.fillStyle = '#b5542d';
  ctx.fillRect(508, 330, 44, 26);
  ctx.fillRect(508, 304, 44, 26);
  if (v === 0) ctx.fillRect(508, 278, 44, 26);
  ctx.strokeStyle = '#7a3a1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(508, 330, 44, 26);
  ctx.strokeRect(508, 304, 44, 26);
  if (v === 0) ctx.strokeRect(508, 278, 44, 26);
  // The grey cat curled under the cart, or gone.
  if (v === 0) {
    ctx.fillStyle = '#8f959f';
    ellipse(ctx, 250, 366, 24, 12, '#8f959f');
    circle(ctx, 230, 358, 10, '#8f959f');
    poly(ctx, [[222, 350], [225, 340], [230, 348]], '#8f959f');
    ctx.strokeStyle = '#8f959f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(272, 366);
    ctx.quadraticCurveTo(284, 360, 282, 348);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

// ---------------------------------------------------------------- level 3
function parkDecor(rng) {
  const stars = [];
  for (let i = 0; i < 26; i += 1) stars.push({ x: intBetween(rng, 16, 604), y: intBetween(rng, 14, 150), r: intBetween(rng, 1, 2) });
  const fireflies = [];
  // The fixed firefly below sits at (258, 148) in the original only, so the
  // shared ones must keep their distance, or a click on a shared firefly
  // would land inside the difference's circle by mistake.
  while (fireflies.length < 5) {
    const f = { x: intBetween(rng, 180, 340), y: intBetween(rng, 120, 190) };
    if (Math.hypot(f.x - 258, f.y - 148) < 40) continue;
    fireflies.push(f);
  }
  const tufts = [];
  for (let i = 0; i < 12; i += 1) tufts.push({ x: intBetween(rng, 16, 604), y: intBetween(rng, 372, 394) });
  return { stars, fireflies, tufts };
}

function drawPark(ctx, v, d) {
  // Deep dusk sky and stars.
  ctx.fillStyle = vgrad(ctx, 0, 0, 0, 280, [[0, '#0f1e3d'], [0.6, '#1d3a5f'], [1, '#274b7a']]);
  ctx.fillRect(0, 0, 620, 282);
  for (const s of d.stars) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    circle(ctx, s.x, s.y, s.r, 'rgba(255,255,255,0.85)');
  }
  // The moon: a crescent, or a full moon.
  glow(ctx, 520, 70, 54, '#fff3b0', 0.6);
  circle(ctx, 520, 70, 26, '#fff3b0');
  if (v === 0) circle(ctx, 530, 64, 22, '#1d3a5f');
  // Ground and path.
  ctx.fillStyle = '#1d3a24';
  ctx.fillRect(0, 282, 620, 118);
  ellipse(ctx, 310, 360, 260, 34, '#2c5233');
  ctx.strokeStyle = '#2c5233';
  ctx.lineWidth = 2;
  for (const t of d.tufts) {
    line(ctx, t.x, t.y, t.x - 3, t.y - 8, '#2c5233', 2);
    line(ctx, t.x + 4, t.y, t.x + 7, t.y - 7, '#2c5233', 2);
  }
  // The big tree on the left, with a kite and a nest in its branches.
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(96, 210, 22, 90);
  ctx.fillStyle = '#2c5233';
  circle(ctx, 107, 180, 62, '#2c5233');
  circle(ctx, 60, 210, 44, '#2c5233');
  circle(ctx, 158, 212, 46, '#2c5233');
  ctx.fillStyle = '#3a6b40';
  circle(ctx, 90, 160, 34, '#3a6b40');
  circle(ctx, 140, 150, 30, '#3a6b40');
  if (v === 0) {
    // A red diamond kite caught in the branches.
    poly(ctx, [[150, 108], [172, 130], [150, 152], [128, 130]], '#d64545');
    line(ctx, 150, 152, 150, 176, '#f6ead8', 2);
    line(ctx, 150, 152, 138, 168, '#f6ead8', 2);
  }
  if (v === 0) {
    // A bird's nest on a low branch.
    ctx.fillStyle = '#8a5a33';
    ellipse(ctx, 108, 178, 18, 8, '#8a5a33');
    ctx.fillStyle = '#5d3a1e';
    ellipse(ctx, 108, 174, 12, 4, '#5d3a1e');
  }
  // Fireflies: four shared ones, plus one extra at a fixed spot that only
  // the original has, so the count differs by one and the spot is exact.
  for (let i = 0; i < 4; i += 1) {
    const f = d.fireflies[i];
    glow(ctx, f.x, f.y, 14, '#d8f26e', 0.9);
    circle(ctx, f.x, f.y, 3, '#eaffb0');
  }
  if (v === 0) {
    glow(ctx, 258, 148, 14, '#d8f26e', 0.9);
    circle(ctx, 258, 148, 3, '#eaffb0');
  }
  // The pond with koi: three fish, or two.
  ellipse(ctx, 150, 344, 118, 32, '#16324a');
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(150, 344, 118, 32, 0, 0, Math.PI * 2);
  ctx.stroke();
  const koi = [[120, 338], [165, 350], [195, 336]];
  for (let i = 0; i < koi.length; i += 1) {
    if (v === 1 && i === 2) continue;
    const [kx, ky] = koi[i];
    ctx.fillStyle = '#ff9f1c';
    ellipse(ctx, kx, ky, 12, 6, '#ff9f1c');
    poly(ctx, [[kx + 12, ky], [kx + 20, ky - 5], [kx + 20, ky + 5]], '#ff9f1c');
  }
  // The lamp post: glowing warm, or dark.
  ctx.fillStyle = '#20242e';
  ctx.fillRect(426, 210, 8, 120);
  circle(ctx, 430, 202, 12, '#20242e');
  if (v === 0) glow(ctx, 430, 202, 40, '#ffd23f', 0.85);
  circle(ctx, 430, 202, 7, v === 0 ? '#ffd23f' : '#4a4a52');
  // The bench, with a bag on it or without one.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(288, 296, 96, 10);
  ctx.fillRect(288, 312, 96, 8);
  ctx.fillRect(296, 320, 8, 26);
  ctx.fillRect(368, 320, 8, 26);
  if (v === 0) {
    roundRect(ctx, 322, 272, 30, 24, 6, '#b5542d');
    ctx.fillStyle = '#7a3a1e';
    ctx.fillRect(330, 266, 14, 8);
  }
  // The fountain: water arcs when it flows, still when it does not.
  ctx.fillStyle = '#8f959f';
  ellipse(ctx, 520, 348, 52, 14, '#8f959f');
  ellipse(ctx, 520, 344, 40, 8, '#c9ced6');
  if (v === 0) {
    ctx.strokeStyle = 'rgba(174,226,255,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(520, 318);
    ctx.quadraticCurveTo(500, 330, 492, 344);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(520, 318);
    ctx.quadraticCurveTo(540, 330, 548, 344);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(520, 312);
    ctx.quadraticCurveTo(520, 326, 520, 340);
    ctx.stroke();
    circle(ctx, 520, 312, 4, '#aee2ff');
  } else {
    circle(ctx, 520, 340, 3, '#aee2ff');
  }
}

// ---------------------------------------------------------------- the scenes
export const SCENES = [
  {
    id: 1,
    name: 'Warung Kopi Senja',
    sub: 'Dusk Coffee Stall',
    timeLimit: 180,
    draw: drawWarung,
    decor: warungDecor,
    diffs: [
      { x: 488, y: 318, r: 26, label: 'Cat tail' },
      { x: 276, y: 332, r: 26, label: 'Menu lines' },
      { x: 152, y: 246, r: 24, label: 'Kettle steam' },
      { x: 312, y: 292, r: 24, label: 'Lamp glow' },
      { x: 559, y: 308, r: 22, label: 'Bike basket' },
      { x: 60, y: 300, r: 20, label: 'Flower color' },
      { x: 224, y: 296, r: 22, label: 'Middle cup' },
    ],
  },
  {
    id: 2,
    name: 'Pasar Pagi',
    sub: 'Morning Market',
    timeLimit: 150,
    draw: drawMarket,
    decor: marketDecor,
    diffs: [
      { x: 310, y: 50, r: 20, label: 'Bird on umbrella' },
      { x: 250, y: 108, r: 26, label: 'Umbrella stripes' },
      { x: 479, y: 254, r: 22, label: 'Scale needle' },
      { x: 430, y: 282, r: 20, label: 'Missing apple' },
      { x: 530, y: 291, r: 20, label: 'Top crate' },
      { x: 250, y: 364, r: 24, label: 'Cat under cart' },
      { x: 310, y: 196, r: 24, label: 'Sign word' },
    ],
  },
  {
    id: 3,
    name: 'Taman Senja',
    sub: 'Dusk Park',
    timeLimit: 120,
    draw: drawPark,
    decor: parkDecor,
    diffs: [
      { x: 520, y: 70, r: 26, label: 'Moon phase' },
      { x: 195, y: 336, r: 26, label: 'Third koi' },
      { x: 150, y: 130, r: 24, label: 'Kite in tree' },
      { x: 430, y: 202, r: 24, label: 'Lamp glow' },
      { x: 337, y: 284, r: 22, label: 'Bag on bench' },
      { x: 258, y: 148, r: 22, label: 'Firefly count' },
      { x: 108, y: 176, r: 22, label: 'Bird nest' },
      { x: 520, y: 326, r: 24, label: 'Fountain water' },
    ],
  },
];
