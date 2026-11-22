// Muncie Kombat: the roster (bodies, heads, colors, moves, stats)
'use strict';
const ROSTER = (() => {
  const R = RIG, PI = Math.PI;
  const HUMAN = { thigh: 27, shin: 26, torso: 35, neck: 5, upper: 20, fore: 19, hipW: 11, shW: 14, belly: 12, back: 11, thighR: 7.5, kneeR: 5, ankleR: 3.8, shR: 5.5, elbowR: 4.3, wristR: 3.4, fist: 4.6, footL: 12, footH: 4.4, shOff: 3 };
  const dims = o => Object.assign({}, HUMAN, o);

  // ---------- face helpers ----------
  function eye(g, x, y, r, st, o = {}) {
    if (st.dead) { R.line(g, x - r, y - r, x + r, y + r, '#111', 1.2); R.line(g, x + r, y - r, x - r, y + r, '#111', 1.2); return; }
    if (st.hurt) { R.line(g, x - r, y, x + r, y - r * 0.3, '#111', 1.3); return; }
    g.fillStyle = o.white || '#f6f2ea'; g.beginPath(); g.ellipse(x, y, r, r * (o.lid ? 0.55 : 0.8), 0, 0, PI * 2); g.fill();
    g.fillStyle = o.iris || '#2a1a10'; g.beginPath(); g.ellipse(x + r * 0.3, y + (o.lid ? r * 0.1 : 0), r * (o.slit ? 0.22 : 0.48), r * (o.lid ? 0.45 : 0.6), 0, 0, PI * 2); g.fill();
    if (o.glow) { g.fillStyle = 'rgba(255,40,30,0.35)'; g.beginPath(); g.arc(x, y, r * 1.8, 0, PI * 2); g.fill(); }
    if (o.lid) { g.fillStyle = o.lidC || '#000'; g.fillRect(x - r * 1.1, y - r * 0.7, r * 2.2, r * 0.45); }
  }
  function brow(g, x, y, w, ang, c = '#1a1008', t = 1.4) { R.line(g, x - w / 2, y - Math.sin(ang) * w / 2, x + w / 2, y + Math.sin(ang) * w / 2, c, t); }
  function fur(g, x, y, r, c, n = 14, seed = 1) {
    g.fillStyle = c;
    for (let i = 0; i < n; i++) { const a = (i * 2.39996 + seed) % (PI * 2), d = r * Math.sqrt(((i * 0.618 + seed * 0.3) % 1)); g.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.2, 1.2); }
  }
  // thick tail drawn as overlapping balls along a curve
  function tailCurve(g, J, d, fn, n, rad, col) {
    for (let i = n; i >= 0; i--) { const u = i / n, p = fn(u); R.ball(g, J.hip[0] + p[0] * d.k, J.hip[1] + p[1] * d.k, rad(u) * d.k, col(u, i)); }
  }

  // ---------- the fighters ----------
  const hippo = {
    id: 'hippo', name: 'MUNCIE HIPPO', short: 'HIPPO', him: 'HIM', k: 1.0,
    bio: 'Purple, hungry and done filling potholes for this town.',
    d: dims({ thigh: 21, shin: 18, torso: 37, neck: 2, upper: 19, fore: 17, hipW: 19, shW: 19, belly: 25, back: 18, thighR: 10.5, kneeR: 8.5, ankleR: 7, shR: 8.5, elbowR: 7, wristR: 6.2, fist: 7, footL: 13, footH: 7, shOff: 4 }),
    col: { torso: '#9b59d0', armU: '#9b59d0', armL: '#9b59d0', hand: '#8a4cc0', legU: '#9b59d0', legL: '#9b59d0', foot: '#6f3aa3' },
    stats: { speed: 0.92, power: 1.12, weight: 1.25 },
    torsoDetail(g, d, st, L) { R.oval(g, d.belly * 0.42, -L * 0.42, d.belly * 0.55, L * 0.36, '#d8b8f5'); },
    tail(g, d, J) { R.ball(g, J.hip[0] - d.back * 0.95, J.hip[1] - 4, 3.2, '#6f3aa3'); },
    head(g, st) {
      const jaw = st.jaw || 0, B = '#9b59d0', L = '#c99ce8';
      R.oval(g, -6, -22, 3.2, 4, '#6f3aa3'); R.oval(g, -6, -22, 1.6, 2.4, '#d8a0c8', 0, true);
      R.oval(g, 0, -13, 13, 12, B);
      // lower jaw
      g.save(); g.translate(2, -3); g.rotate(jaw * 0.9);
      R.oval(g, 13, 2, 15, 6.5, L);
      if (jaw > 0.1) { g.fillStyle = '#e04a6a'; g.beginPath(); g.ellipse(14, -1, 12, 3.5 + jaw * 2, 0, PI, 0); g.fill(); g.fillStyle = '#fff'; g.fillRect(22, -5, 2.4, 5); g.fillRect(6, -4, 2, 4); }
      g.restore();
      // muzzle
      g.save(); g.translate(2, -10); g.rotate(-jaw * 0.25);
      R.oval(g, 14, -2, 15, 8.5, L);
      if (jaw > 0.1) { g.fillStyle = '#fff'; g.fillRect(22, 3, 2.4, 5); g.fillRect(8, 4, 2, 4); }
      R.oval(g, 23, -8, 2.4, 1.6, '#5a2a78', 0, true); R.oval(g, 17.5, -8.5, 2.2, 1.5, '#5a2a78', 0, true);
      g.restore();
      R.ball(g, 4, -24, 4.2, B); R.ball(g, -2, -24, 3.6, B);
      eye(g, 5, -24, 2.6, st); eye(g, -1.5, -24, 2.1, st);
      if (!st.dead) brow(g, 3, -28, 9, 0.35, '#3a1a55', 1.6);
      if (!jaw) R.line(g, 6, -4, 26, -5, '#5a2a78', 1);
    },
    proj: { kind: 'poop', name: 'POOP SHOT' }, sp2: { kind: 'rush', name: 'HIPPO RAM' },
    fatal: { id: 'hippo', name: 'POTHOLE FILLER' }
  };

  const SKIN_L = '#f0c4a0';
  const painter = {
    id: 'painter', name: 'PAINTER DUDE', short: 'PAINTER', him: 'HIM', k: 1.0,
    bio: 'Every tree needs a friend. Every friend needs a beating.',
    d: dims({}),
    col: { torso: '#9cc0dc', armU: '#9cc0dc', armL: '#9cc0dc', cuff: '#9cc0dc', hand: SKIN_L, legU: '#3c5582', legL: '#3c5582', foot: '#4a3020' },
    stats: { speed: 1.0, power: 1.0, weight: 1.0 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.1, -L], [d.shW * 0.75, -L], [d.shW * 0.42, -L * 0.8]], SKIN_L);
      g.fillStyle = '#e8eef4'; for (let i = 0; i < 4; i++) g.fillRect(d.shW * 0.45, -L * 0.72 + i * 7, 1.6, 1.6);
      R.line(g, d.shW * 0.5, -L * 0.78, d.shW * 0.5, -L * 0.05, '#6a8aa8', 0.8);
      g.strokeStyle = '#6a8aa8'; g.lineWidth = 1; g.strokeRect(-d.back * 0.1, -L * 0.75, 6, 5);
      g.fillStyle = '#2a2a30'; g.fillRect(-d.hipW, -3, d.hipW * 2 + 2, 3);
    },
    backHand(g, d, J, st) {
      if (st.noProp) return;
      const w = J.AB.wr;
      g.save(); g.translate(w[0], w[1] + 2); g.rotate(-0.3);
      R.oval(g, -3, 0, 10, 6.5, '#b88a50'); g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(-8, 1, 1.6, 0, PI * 2); g.fill();
      const pc = ['#f4f4f4', '#2a5ad0', '#e8c020', '#c02020', '#2a8a3a', '#1a1a1a'];
      pc.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(-4 + (i % 3) * 4.5, -3 + ((i / 3) | 0) * 4.5, 1.5, 0, PI * 2); g.fill(); });
      g.restore();
    },
    head(g, st) {
      R.ball(g, -4, -15, 15.5, '#3a2414');
      fur(g, -4, -15, 14, '#5a3a22', 26, 2); fur(g, -4, -15, 14, '#24160c', 20, 5);
      R.oval(g, -2, -9, 2.6, 3.6, SKIN_L);
      R.oval(g, 4, -10, 8, 10, SKIN_L);
      // beard
      g.fillStyle = '#4a2e18';
      g.beginPath(); g.moveTo(-3, -9); g.quadraticCurveTo(-3, 3, 5, 3.5); g.quadraticCurveTo(12, 3, 12.5, -5);
      g.lineTo(11, -6); g.quadraticCurveTo(8, -3.5, 4, -6); g.quadraticCurveTo(1, -4, 0, -9); g.closePath(); g.fill();
      fur(g, 5, -2, 5, '#6a4426', 10, 3);
      R.line(g, 7, -6.5, 12, -6, '#4a2e18', 1.8);
      if (!st.dead && !st.hurt) R.line(g, 8, -4.2, 11.5, -4.6, '#c06060', 1);
      R.oval(g, 12, -10, 1.8, 2.4, '#e0a888');
      eye(g, 8.5, -13, 1.7, st); brow(g, 8.5, -15.6, 4.5, -0.1, '#3a2414', 1.2);
    },
    proj: { kind: 'knife', name: 'PALETTE KNIFE' }, sp2: { kind: 'cloud', name: 'THINNER SPLASH' },
    fatal: { id: 'painter', name: 'HAPPY LITTLE ACCIDENT' }
  };

  const OR = '#e3832a', ORD = '#a8501a', CRM = '#f6dcae';
  const garf = {
    id: 'garf', name: 'GARF CAT', short: 'GARF', him: 'HIM', k: 1.08,
    bio: 'Twenty pounds of alley tom. Hates Mondays. Hates you more.',
    claws: true,
    d: dims({ thigh: 21, shin: 21, torso: 35, neck: 2, upper: 18, fore: 17, hipW: 17, shW: 15, belly: 21, back: 14, thighR: 9.5, kneeR: 7, ankleR: 5, shR: 7, elbowR: 5.8, wristR: 5, fist: 5.8, footL: 12, footH: 5.5 }),
    col: { torso: OR, armU: OR, armL: OR, hand: CRM, legU: OR, legL: OR, foot: CRM },
    stats: { speed: 1.02, power: 1.05, weight: 1.1 },
    torsoDetail(g, d, st, L) {
      R.oval(g, d.belly * 0.4, -L * 0.42, d.belly * 0.5, L * 0.38, CRM);
      g.fillStyle = ORD; for (let i = 0; i < 4; i++) { g.save(); g.translate(-d.back * 0.6, -L * 0.25 - i * 7); g.rotate(0.3); g.fillRect(-4, -1, 9, 2.4); g.restore(); }
    },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 3) * 4;
      tailCurve(g, J, d, u => [-14 - u * 14 + Math.sin(u * 3) * 4, -2 - u * 30 + w * u], 12, u => 4.2 - u * 1.2, (u, i) => i % 3 === 0 ? ORD : OR);
    },
    head(g, st) {
      R.poly(g, [[-9, -18], [-6, -32], [1, -22]], ORD); R.poly(g, [[-7.5, -20], [-6, -28], [-1.5, -22]], '#e8a0a0');
      R.poly(g, [[2, -22], [8, -33], [11, -20]], OR); R.poly(g, [[5, -28], [8, -33], [9, -26]], '#1a0a04');
      R.oval(g, 1, -13, 13.5, 12, OR);
      g.fillStyle = ORD; for (let i = 0; i < 3; i++) g.fillRect(-4 + i * 3.5, -24.5, 1.8, 5 - i);
      R.oval(g, 9, -6, 8, 5.5, CRM);
      R.oval(g, 14.5, -9.5, 2.2, 1.6, '#e07080');
      g.fillStyle = '#2a1008'; g.fillRect(9, -4.5, 8, 1.1);
      if (!st.dead) { g.fillStyle = '#fff'; g.fillRect(10, -3.4, 1.4, 2.6); g.fillRect(14.5, -3.4, 1.4, 2.6); }
      R.line(g, 12, -7, 22, -9, '#f4f0e6', 0.6); R.line(g, 12, -6, 22, -5, '#f4f0e6', 0.6);
      eye(g, 9, -14, 2.8, st, { iris: '#7a9a10', slit: 1, lid: 1, lidC: ORD, white: '#e8e06a' });
      eye(g, 2.5, -14.5, 2.4, st, { iris: '#7a9a10', slit: 1, lid: 1, lidC: ORD, white: '#e8e06a' });
      R.line(g, 6, -21, 4, -9, '#8a2a10', 0.9);
    },
    proj: { kind: 'hairball', name: 'HAIRBALL' }, sp2: { kind: 'leap', name: 'POUNCE' },
    fatal: { id: 'garf', name: 'I HATE MONDAYS' }
  };

  const SUIT = '#565a66';
  const host = {
    id: 'host', name: 'LATE NIGHT HOST', short: 'HOST', him: 'HIM', k: 1.04,
    bio: 'Gap-toothed, sarcastic and armed with a list. Tonight, you are on it.',
    d: dims({ thigh: 29, shin: 28, torso: 36, upper: 21, fore: 20, hipW: 10, shW: 14.5, belly: 10, back: 10, thighR: 6.5, kneeR: 4.6, ankleR: 3.6 }),
    col: { torso: SUIT, armU: SUIT, armL: SUIT, cuff: '#f2f2f0', hand: SKIN_L, legU: '#4a4e58', legL: '#4a4e58', foot: '#121214' },
    stats: { speed: 1.04, power: 0.96, weight: 0.95 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.05, -L * 1.02], [d.shW * 0.85, -L * 1.02], [d.shW * 0.55, -L * 0.45]], '#f4f4f2');
      R.poly(g, [[d.shW * 0.42, -L * 0.96], [d.shW * 0.62, -L * 0.96], [d.shW * 0.6, -L * 0.5], [d.shW * 0.5, -L * 0.42], [d.shW * 0.4, -L * 0.5]], '#2a3a8a');
      R.poly(g, [[d.shW * 0.05, -L * 1.02], [d.shW * 0.45, -L * 0.45], [d.shW * 0.2, -L * 0.7]], '#444852');
      R.poly(g, [[d.shW * 0.85, -L * 1.02], [d.shW * 0.6, -L * 0.42], [d.shW * 0.95, -L * 0.75]], '#444852');
      g.fillStyle = '#2a2c32'; g.fillRect(d.shW * 0.55, -L * 0.3, 1.6, 1.6); g.fillRect(d.shW * 0.55, -L * 0.18, 1.6, 1.6);
    },
    head(g, st) {
      R.oval(g, -2, -9, 2.6, 4, SKIN_L);
      R.oval(g, 4, -11, 8, 11.5, SKIN_L);
      R.oval(g, 6, -1.5, 6, 3.6, '#e8b490');
      // swoop hair
      g.fillStyle = '#d8d4cc';
      g.beginPath(); g.moveTo(-5, -10); g.quadraticCurveTo(-6, -25, 5, -25.5); g.quadraticCurveTo(14, -26, 13, -19); g.quadraticCurveTo(8, -22, 2, -19); g.quadraticCurveTo(-1, -16, -2, -10); g.closePath(); g.fill();
      g.fillStyle = '#9a968e'; g.fillRect(0, -24, 7, 1); g.fillRect(-3, -20, 4, 1);
      R.oval(g, 12.5, -10, 2, 2.8, '#e0a080');
      // glasses
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 1.1; g.strokeRect(5.5, -16, 5, 4); g.strokeRect(-0.5, -16, 4.5, 4); R.line(g, 4, -15, 5.5, -15, '#1a1a1a', 0.8);
      eye(g, 8.5, -14, 1.4, st); eye(g, 2.5, -14, 1.3, st);
      brow(g, 8, -17.6, 5, 0.1, '#8a8680', 1.2);
      // gap-tooth grin
      if (!st.dead) { g.fillStyle = '#5a1010'; g.beginPath(); g.ellipse(8.5, -5, 4.3, 2, 0, 0, PI); g.fill(); g.fillStyle = '#fff'; g.fillRect(5, -5, 3, 2); g.fillRect(9, -5, 3, 2); }
      else R.line(g, 5, -4, 12, -4, '#5a1010', 1);
    },
    proj: { kind: 'card', name: 'CUE CARD' }, sp2: { kind: 'slide', name: 'DESK SLIDE' },
    fatal: { id: 'host', name: 'TOP TEN LIST' }
  };

  const SKB = '#8b5a35', RED = '#b4122c';
  const ballin = {
    id: 'ballin', name: "BALLIN' WELL", short: 'BALLIN', him: 'HIM', k: 1.05,
    bio: 'Ball State legend. Still has the moves. Still has the elbows.',
    sock: '#f2f2f2',
    d: dims({ thigh: 29, shin: 29, torso: 36, upper: 22, fore: 21, hipW: 12, shW: 15.5, belly: 11.5, back: 11, thighR: 7.6, kneeR: 4.8 }),
    col: { torso: RED, armU: SKB, armL: SKB, hand: SKB, legU: RED, legL: SKB, foot: '#f4f4f4' },
    stats: { speed: 1.1, power: 1.0, weight: 1.0 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[-d.shW * 0.4, -L * 1.06], [d.shW * 0.9, -L * 1.06], [d.shW * 0.45, -L * 0.82]], SKB);
      g.strokeStyle = '#f4f4f4'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-d.shW * 0.4, -L * 1.04); g.lineTo(d.shW * 0.45, -L * 0.82); g.lineTo(d.shW * 0.9, -L * 1.04); g.stroke();
      g.save(); g.translate(d.shW * 0.1, -L * 0.62); g.font = '700 6px Anton, Impact, sans-serif'; g.fillStyle = '#fff'; g.fillText('BALL ST', -9, 0); g.restore();
      g.fillStyle = '#f4f4f4'; g.fillRect(-d.hipW, -6, d.hipW * 2.2, 1.6);
    },
    head(g, st) {
      R.oval(g, -1.5, -9, 2.6, 3.6, SKB);
      R.oval(g, 4, -11, 8, 11, SKB);
      R.oval(g, 4, -17, 8.2, 6, '#141010');
      fur(g, 4, -18, 6, '#2a2220', 12, 1);
      R.oval(g, 12.2, -9, 1.9, 2.6, '#7a4a2a');
      eye(g, 9, -12.5, 1.6, st); brow(g, 9, -15.2, 4.8, 0.25, '#141010', 1.5);
      g.fillStyle = '#1a1010'; g.fillRect(7, -5.2, 6, 1.2);
      if (!st.dead && !st.hurt) R.line(g, 8, -2.5, 11.5, -2.8, '#5a2a1a', 1);
    },
    proj: { kind: 'bball', name: 'FIREBALL' }, sp2: { kind: 'leap', name: 'ALLEY-OOP ELBOW' },
    fatal: { id: 'ballin', name: 'POSTERIZED' }
  };

  const GB = '#7a6a58', GL = '#e6e0d2';
  const gertie = {
    id: 'gertie', name: 'GERTIE', short: 'GERTIE', him: 'HER', k: 1.0,
    bio: 'Canada goose. Owns the Greenway. Will hiss at your corpse.',
    wings: true, webbed: true,
    d: dims({ thigh: 17, shin: 21, torso: 30, neck: 22, upper: 19, fore: 19, hipW: 15, shW: 13, belly: 19, back: 15, thighR: 7, kneeR: 2.6, ankleR: 2.2, shR: 6, elbowR: 5, wristR: 4, fist: 4.5, footL: 13, footH: 3.6 }),
    col: { torso: GB, armU: GB, hand: '#2a2420', legU: GB, legL: '#1a1a1a', foot: '#1a1a1a' },
    stats: { speed: 1.06, power: 0.95, weight: 0.9 },
    wing(g, A, dark, d, st) {
      const c = dark ? R.shade(GB, -0.3) : GB, tip = dark ? '#1a1612' : '#2a2420';
      const a = A.a2, e = A.el, w = A.wr;
      const end = R.add(w, R.dir(a, 9));
      g.beginPath(); g.moveTo(A.s0[0] - 3, A.s0[1]);
      g.quadraticCurveTo(...R.add(e, R.dir(a + PI / 2, 8)), ...R.add(w, R.dir(a + PI / 2, 5)));
      g.lineTo(...end);
      g.quadraticCurveTo(...R.add(e, R.dir(a - PI / 2, 3)), A.s0[0] + 3, A.s0[1] + 4);
      g.closePath(); g.fillStyle = R.sphFill(g, e[0], e[1], 16, c); g.fill();
      for (let i = 0; i < 4; i++) { const b = R.lerp2(w, end, 0.2 + i * 0.25); R.line(g, ...R.add(b, R.dir(a + PI / 2, 4)), ...R.add(b, R.dir(a + 0.4, 6)), tip, 2.2); }
      R.line(g, ...R.lerp2(A.s0, e, 0.4), ...R.lerp2(e, w, 0.7), R.shade(c, 0.25), 0.8);
    },
    torsoDetail(g, d, st, L) {
      R.oval(g, d.belly * 0.3, -L * 0.55, d.belly * 0.65, L * 0.45, GL);
      g.fillStyle = 'rgba(60,45,30,0.5)'; for (let i = 0; i < 6; i++) g.fillRect(-d.back * 0.7 + (i % 2) * 3, -L * 0.2 - i * 4, 6, 1);
    },
    tail(g, d, J) { R.poly(g, [[J.hip[0] - d.back * 0.6, J.hip[1] - 10], [J.hip[0] - d.back * 1.7, J.hip[1] - 2], [J.hip[0] - d.back * 0.8, J.hip[1] + 3]], '#141210'); R.poly(g, [[J.hip[0] - d.back * 0.9, J.hip[1] - 2], [J.hip[0] - d.back * 1.3, J.hip[1] + 4], [J.hip[0], J.hip[1] + 4]], '#f4f0e8'); },
    neckDraw(g, d, J) { R.cap(g, J.sh, J.nk, 5.5 * d.k, 4.2 * d.k, '#1c1a18'); R.line(g, ...R.lerp2(J.sh, J.nk, 0.02), ...R.lerp2(J.sh, J.nk, 0.12), GL, 4); },
    head(g, st) {
      R.oval(g, 2, -6, 6.5, 6, '#1c1a18');
      R.poly(g, [[-2, -6], [4, -9], [6, -1], [0, -1]], '#f4f0e8');
      R.oval(g, 10, -5.5, 5.5, 2.3, '#1a1a1a');
      R.line(g, 8, -5.2, 15, -5.5, '#3a3a3a', 0.6);
      eye(g, 5, -8.5, 1.5, st, { white: '#fff', iris: '#100808' });
      if (!st.dead) brow(g, 5, -10.5, 4.5, 0.45, '#000', 1.3);
      // pink bow
      R.poly(g, [[-1, -12], [-6, -16], [-6, -9]], '#ff6fa8'); R.poly(g, [[-1, -12], [4, -16], [3, -9]], '#ff6fa8'); R.ball(g, -1, -12, 1.8, '#d03a78');
    },
    proj: { kind: 'gust', name: 'WING GUST' }, sp2: { kind: 'leap', name: 'DIVE-BOMB' },
    fatal: { id: 'gertie', name: 'HONK' }
  };

  const RG = '#7c7c82', RGL = '#b8b8bc', RGD = '#2a2a2e';
  const rocky = {
    id: 'rocky', name: 'ROCKY', short: 'ROCKY', him: 'HIM', k: 0.96,
    bio: 'Rabid, foaming and living in the dumpster behind Royal Pizza.',
    claws: true,
    d: dims({ thigh: 21, shin: 20, torso: 31, neck: 2, upper: 18, fore: 17, hipW: 14, shW: 13, belly: 16, back: 13, thighR: 8.5, kneeR: 6, ankleR: 4.5, shR: 6.5, elbowR: 5, wristR: 4.2, fist: 5, footL: 11, footH: 4.8 }),
    col: { torso: RG, armU: RG, armL: RG, hand: RGD, legU: RG, legL: RG, foot: RGD },
    stats: { speed: 1.12, power: 0.95, weight: 0.85 },
    torsoDetail(g, d, st, L) { R.oval(g, d.belly * 0.35, -L * 0.45, d.belly * 0.55, L * 0.38, RGL); fur(g, 0, -L * 0.5, 10, '#5a5a60', 16, 4); },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 4) * 3;
      tailCurve(g, J, d, u => [-12 - u * 20, -2 - u * 16 + Math.sin(u * 4) * 3 + w * u], 12, u => 6 - u * 1.5, (u, i) => ((i / 2) | 0) % 2 ? '#1e1e22' : '#9a9aa0');
    },
    head(g, st) {
      R.poly(g, [[-6, -16], [-6, -27], [1, -19]], RG); R.poly(g, [[-5, -18], [-5.5, -24], [-1.5, -19]], '#f0f0f0');
      R.poly(g, [[0, -19], [5, -28], [8, -18]], RG);
      R.oval(g, 1, -12, 11, 10, RG);
      R.oval(g, 10, -7, 8, 4.5, RGL);
      R.ball(g, 17.5, -8.5, 2.1, '#111');
      // mask
      g.fillStyle = '#121214'; g.beginPath(); g.moveTo(-4, -12); g.quadraticCurveTo(4, -18, 15, -13); g.quadraticCurveTo(12, -9, 4, -10); g.quadraticCurveTo(0, -8, -4, -12); g.fill();
      R.line(g, 1, -17.5, 12, -16.5, '#f0f0f0', 1.4);
      eye(g, 9, -13, 2, st, { white: '#ff3020', iris: '#300', glow: !st.dead });
      eye(g, 3, -13.5, 1.6, st, { white: '#ff3020', iris: '#300' });
      if (!st.dead) {
        g.fillStyle = '#fff'; g.fillRect(11, -4.5, 7, 3); for (let i = 0; i < 3; i++) g.fillRect(12 + i * 2.2, -2, 1.2, 2.2);
        const t = st.t || 0;
        for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(11 + (i * 2.7) % 8, -1 + Math.abs(Math.sin(t * 5 + i)) * 4, 1.1 + (i % 2) * 0.6, 0, PI * 2); g.fill(); }
      }
    },
    proj: { kind: 'can', name: 'TRASH CAN' }, sp2: { kind: 'roll', name: 'CLAW ROLL' },
    fatal: { id: 'rocky', name: 'RABIES' }
  };

  const MB = '#6b4a2e', MBL = '#a07a52', MBD = '#33241a';
  const millie = {
    id: 'millie', name: 'MILLIE', short: 'MILLIE', him: 'HER', k: 0.93,
    bio: 'White River muskrat. Those teeth go through bone like balsa.',
    claws: true,
    d: dims({ thigh: 21, shin: 19, torso: 31, neck: 2, upper: 17, fore: 17, hipW: 15, shW: 12.5, belly: 17, back: 14, thighR: 8.5, kneeR: 6, ankleR: 4.3, shR: 6.2, elbowR: 4.8, wristR: 4, fist: 4.8, footL: 12, footH: 4.5 }),
    col: { torso: MB, armU: MB, armL: MB, hand: MBD, legU: MB, legL: MB, foot: MBD },
    stats: { speed: 1.08, power: 0.95, weight: 0.85 },
    torsoDetail(g, d, st, L) { R.oval(g, d.belly * 0.35, -L * 0.45, d.belly * 0.55, L * 0.38, MBL); fur(g, -2, -L * 0.5, 10, '#4a3220', 16, 6); },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 5) * 2;
      g.beginPath(); g.moveTo(J.hip[0] - d.back * 0.8, J.hip[1] - 2);
      g.quadraticCurveTo(J.hip[0] - 22 * d.k, J.hip[1] + 26 * d.k, J.hip[0] - 40 * d.k, -2 + w);
      g.strokeStyle = '#141010'; g.lineWidth = 3.4 * d.k; g.lineCap = 'round'; g.stroke();
      g.strokeStyle = '#3a3030'; g.lineWidth = 1 * d.k; g.stroke();
    },
    head(g, st) {
      R.ball(g, -4, -20, 3.2, MBD);
      R.oval(g, 1, -12, 10.5, 10, MB);
      R.oval(g, 10, -8, 8.5, 5.2, MBL);
      R.ball(g, 18, -10, 2, '#d07080');
      // big orange incisors
      if (!st.dead) { g.fillStyle = '#e89a20'; g.fillRect(13, -4.5, 2.4, 6); g.fillRect(15.6, -4.5, 2.4, 6); g.fillStyle = '#8a5010'; g.fillRect(15.4, -4.5, 0.4, 6); }
      R.line(g, 14, -9, 23, -11, '#2a2018', 0.5); R.line(g, 14, -8, 23, -7, '#2a2018', 0.5);
      eye(g, 7, -14, 1.9, st, { white: '#1a1010', iris: '#000' });
      if (!st.dead) { g.fillStyle = '#fff'; g.fillRect(7.4, -14.8, 0.8, 0.8); R.line(g, 6, -16.4, 5, -18, '#000', 0.6); R.line(g, 7.5, -16.4, 7.5, -18.3, '#000', 0.6); R.line(g, 9, -16, 10, -17.8, '#000', 0.6); }
    },
    proj: { kind: 'wave', name: 'TAIL WAVE' }, sp2: { kind: 'burrow', name: 'BURROW' },
    fatal: { id: 'millie', name: 'TIMBER' }
  };

  // ---------- bosses ----------
  const GLASS = '#9cc8dc';
  const golem = {
    id: 'golem', name: 'BALL JAR GOLEM', short: 'GOLEM', him: 'IT', k: 1.32, boss: true, glass: true,
    bio: 'Blown in the old glass works. Something pickled lives inside.',
    d: dims({ thigh: 20, shin: 20, torso: 38, neck: 3, upper: 18, fore: 18, hipW: 18, shW: 19, belly: 21, back: 19, thighR: 8, kneeR: 7, ankleR: 6.5, shR: 7.5, elbowR: 6.5, wristR: 6, fist: 7.5, footL: 13, footH: 6 }),
    col: { torso: GLASS, armU: GLASS, armL: GLASS, hand: '#b8dcea', legU: GLASS, legL: GLASS, foot: '#7aa8bc' },
    stats: { speed: 0.82, power: 1.2, weight: 2.2, armor: 0.8 },
    torsoDetail(g, d, st, L) {
      g.fillStyle = 'rgba(90,140,40,0.55)'; g.fillRect(-d.back * 0.85, -L * 0.7, d.back * 0.85 + d.belly * 0.85, L * 0.7);
      const t = st.t || 0;
      // pickled brain + eyeball bobbing in the brine
      R.oval(g, 2, -L * 0.35 + Math.sin(t * 1.3) * 2, 9, 6.5, '#d8a0a0');
      g.strokeStyle = '#a06070'; g.lineWidth = 0.8; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-3 + i * 3.5, -L * 0.35 + Math.sin(t * 1.3) * 2, 2.6, PI, 0); g.stroke(); }
      const ey = -L * 0.62 + Math.sin(t * 1.7 + 1) * 2;
      R.ball(g, 6, ey, 5, '#f4f0e8'); R.ball(g, 9, ey, 2.4, '#3a7a30'); R.ball(g, 10, ey, 1.2, '#000');
      R.line(g, 1, ey + 2, -4, ey + 8, '#b03040', 0.9);
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(d.belly * 0.45, -L * 0.95, 2.5, L * 0.8);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-d.back * 0.6, -L * 0.9, 1.5, L * 0.6);
      g.save(); g.font = '700 7px Anton, Impact, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillText('MUNCIE', -10, -L * 0.82); g.restore();
    },
    head(g, st) {
      g.fillStyle = '#8f8f94'; g.fillRect(-12, -5, 25, 6);
      g.fillStyle = '#c8c8cc'; g.fillRect(-12, -5, 25, 1.5);
      g.fillStyle = '#6a6a70'; for (let i = -11; i < 13; i += 3) g.fillRect(i, -3.5, 1, 4);
      g.fillStyle = '#b0b0b6'; g.fillRect(-11, -9, 23, 4);
      g.fillStyle = '#d8d8dc'; g.fillRect(-11, -9, 23, 1.2);
    },
    proj: { kind: 'shards', name: 'GLASS SHARDS' }, sp2: { kind: 'leap', name: 'JAR SLAM' }
  };

  const DR = '#c8232c';
  const dan = {
    id: 'dan', name: 'DEVIL DAN', short: 'DAN', him: 'HIM', k: 1.12, boss: true,
    bio: 'He runs this town from City Hall. Now he wants your soul.',
    d: dims({ thigh: 28, shin: 27, torso: 36, upper: 21, fore: 20, hipW: 11, shW: 15.5, belly: 12.5, back: 11, thighR: 7.6, kneeR: 5 }),
    col: { torso: DR, armU: DR, armL: DR, hand: '#b01c24', legU: '#1e1214', legL: '#1e1214', foot: '#0c0606' },
    stats: { speed: 1.12, power: 1.15, weight: 1.1 },
    behind(g, d, J, st) {
      const fl = Math.sin((st.t || 0) * 4) * 3, s = J.sh;
      for (const [c, o] of [['#1d0a0a', 0], ['#7a141a', 2]]) {
        g.beginPath(); g.moveTo(s[0] - 2, s[1] + 2 + o);
        g.lineTo(s[0] - 38 + o, s[1] - 22 - fl); g.lineTo(s[0] - 30, s[1] - 4); g.lineTo(s[0] - 40 + o, s[1] + 6);
        g.lineTo(s[0] - 26, s[1] + 12); g.lineTo(s[0] - 30 + o, s[1] + 26); g.lineTo(s[0] - 6, s[1] + 24); g.closePath(); g.fillStyle = c; g.fill();
      }
    },
    backHand(g, d, J) {
      const w = J.AB.wr;
      R.line(g, w[0] + 2, w[1] + 26, w[0] - 4, w[1] - 40, '#5a3a1a', 2.2);
      const tp = [w[0] - 4.6, w[1] - 41];
      R.line(g, tp[0] - 6, tp[1], tp[0] + 6, tp[1] - 1, '#c8c8d0', 1.8);
      for (let i = -1; i <= 1; i++) R.line(g, tp[0] + i * 5.5, tp[1] - i * 0.5, tp[0] + i * 5.5, tp[1] - 9, '#d8d8e0', 1.4);
    },
    torsoDetail(g, d, st, L) {
      g.strokeStyle = 'rgba(80,0,10,0.6)'; g.lineWidth = 0.9;
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(d.belly * 0.1, -L * 0.25 - i * 6); g.lineTo(d.belly * 0.75, -L * 0.25 - i * 6); g.stroke(); }
      R.line(g, d.belly * 0.45, -L * 0.15, d.belly * 0.45, -L * 0.85, 'rgba(80,0,10,0.6)', 0.9);
      g.fillStyle = '#1e1214'; g.fillRect(-d.hipW, -4, d.hipW * 2.2, 4);
    },
    head(g, st) {
      R.poly(g, [[-4, -19], [-9, -33], [0, -21]], '#1d0a0a'); R.poly(g, [[5, -20], [6, -35], [10, -19]], '#1d0a0a');
      R.poly(g, [[-3, -10], [-9, -15], [-2, -15]], DR);
      R.oval(g, 4, -11, 8.5, 11, '#d83030');
      R.poly(g, [[5, -1], [11, -1], [8, 6]], '#1d0a0a');
      eye(g, 9, -13, 1.9, st, { white: '#ffe030', iris: '#111' });
      eye(g, 3.5, -13.4, 1.6, st, { white: '#ffe030', iris: '#111' });
      if (!st.dead) { brow(g, 8.5, -16.2, 6, 0.4, '#111', 1.6); brow(g, 3, -16.4, 4.5, -0.3, '#111', 1.4); }
      g.fillStyle = '#1d0a0a'; g.fillRect(6, -6, 7, 2.2); g.fillStyle = '#fff'; g.fillRect(6.6, -6, 1.2, 1.6); g.fillRect(11, -6, 1.2, 1.6);
    },
    proj: { kind: 'hellfire', name: 'HELLFIRE' }, sp2: { kind: 'burrow', name: 'HELL WARP' }
  };

  const FIGHTERS = [hippo, painter, garf, host, ballin, gertie, rocky, millie];
  const BOSSES = [golem, dan];
  const ALL = {};
  for (const f of FIGHTERS.concat(BOSSES)) {
    ALL[f.id] = f;
    const k = f.k * 1.14, d = {};
    for (const key in f.d) d[key] = f.d[key] * k;
    d.k = k;
    f.dk = d;
  }
  return { FIGHTERS, BOSSES, ALL, eye };
})();
