// Muncie Kombat: the roster (bodies, materials, realistic heads, moves, stats)
'use strict';
const ROSTER = (() => {
  const { R, PI, sh, dims, lit, fillLit, strokes, fringe, curls, eye, brow, humanHead, eyesF, humanFront, vNeck, belt, bellyPatch, frontTail } = KIT;

  // ---------- the fighters ----------
  const HP = '#7d4fa8', HPL = '#a982c8', HPD = '#4a2a68';
  const hippo = {
    id: 'hippo', name: 'MUNCIE HIPPO', short: 'HIPPO', him: 'HIM', k: 1.0, paws: true, skull: 'hippo',
    bio: 'Purple, hungry and done filling potholes for this town.',
    d: dims({ thigh: 21, shin: 18, torso: 37, neck: 7, upper: 19, fore: 17, hipW: 19, shW: 19, chest: 21, belly: 26, back: 19, thighR: 10.5, kneeR: 8, ankleR: 7, shR: 8.5, elbowR: 6.8, wristR: 6, fist: 6, footL: 14, footH: 6.5, shOff: 4 }),
    col: { torso: HP, armU: HP, armL: HP, hand: HPD, legU: HP, legL: HP, foot: HPD, neck: HP },
    mat: { torso: 'skin', armU: 'skin', legU: 'skin' }, calf: 0.15, bicep: 0.3,
    stats: { speed: 0.95, power: 1.12, weight: 1.25 },
    torsoDetail(g, d, st, L) {
      g.fillStyle = 'rgba(230,190,220,0.35)'; g.beginPath(); g.ellipse(d.belly * 0.45, -L * 0.42, d.belly * 0.5, L * 0.36, 0, 0, PI * 2); g.fill();
      g.strokeStyle = 'rgba(40,10,50,0.35)'; g.lineWidth = 0.8; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(d.belly * 0.2, -L * 0.15 - i * 4, d.belly * 0.6, -0.4, 0.5); g.stroke(); }
    },
    tail(g, d, J) { R.seg(g, [J.hip[0] - d.back * 0.9, J.hip[1] - 4], [J.hip[0] - d.back * 1.3, J.hip[1] + 4], 2.6, 1.4, HPD, 'skin', {}); },
    head(g, st) {
      const jaw = st.jaw || 0;
      // ears + skull
      g.beginPath(); g.ellipse(-6, -24, 2.6, 3.6, -0.3, 0, PI * 2); fillLit(g, HPD, -6, -24, 4);
      g.beginPath(); g.ellipse(0, -14, 12.5, 12, 0, 0, PI * 2); fillLit(g, HP, 0, -14, 13, 0.22, -0.6);
      // lower jaw (opens wide on the hippo fatality)
      g.save(); g.translate(3, -4); g.rotate(jaw * 0.95);
      g.beginPath(); g.moveTo(-4, -4); g.quadraticCurveTo(10, 7, 26, 1); g.quadraticCurveTo(29, -3, 25, -5); g.lineTo(-2, -6); g.closePath(); fillLit(g, sh(HPL, -0.1), 10, 0, 16, 0.18, -0.6);
      if (jaw > 0.1) {
        g.fillStyle = '#c0405a'; g.beginPath(); g.moveTo(0, -5); g.quadraticCurveTo(13, 2, 24, -4); g.lineTo(0, -6); g.fill();
        g.fillStyle = '#efe6cc'; R.poly(g, [[21, -4], [23.5, -4], [22.5, -13]], '#efe6cc'); R.poly(g, [[7, -4], [9, -4], [8, -9]], '#e8dcc0');
      }
      g.restore();
      // muzzle: big barrel snout with nostrils on top
      g.save(); g.translate(3, -10); g.rotate(-jaw * 0.3);
      g.beginPath(); g.moveTo(-4, -6); g.bezierCurveTo(6, -12, 20, -12, 26, -8); g.quadraticCurveTo(31, -4, 28, 3); g.quadraticCurveTo(20, 7, 8, 6); g.quadraticCurveTo(-2, 5, -4, -6); g.closePath();
      fillLit(g, HPL, 12, -3, 17, 0.2, -0.55);
      g.save(); g.clip(); g.fillStyle = 'rgba(220,140,180,0.25)'; g.beginPath(); g.ellipse(18, 4, 12, 4, 0, 0, PI * 2); g.fill(); R.srand(4); g.fillStyle = 'rgba(40,10,40,0.4)'; for (let i = 0; i < 14; i++) g.fillRect(12 + R.rr() * 14, -2 + R.rr() * 7, 0.8, 0.8); g.restore();
      g.fillStyle = '#2a1030'; g.beginPath(); g.ellipse(24, -8.6, 2, 1.1, 0.2, 0, PI * 2); g.fill(); g.beginPath(); g.ellipse(19.5, -9.6, 1.7, 0.9, 0.1, 0, PI * 2); g.fill();
      if (jaw > 0.1) { R.poly(g, [[21, 5], [23.5, 5], [22.4, 12]], '#efe6cc'); }
      else { g.strokeStyle = 'rgba(30,5,30,0.7)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-1, 4); g.quadraticCurveTo(14, 8, 27, 2); g.stroke(); }
      g.restore();
      // eye bumps on top of the head
      g.beginPath(); g.ellipse(4, -24, 4.2, 3.4, 0, 0, PI * 2); fillLit(g, HP, 4, -24, 4.5);
      eye(g, 5.5, -24.5, 1.5, st, { animal: 1, iris: '#1a0a10', socket: 'rgba(30,5,40,0.45)' });
      if (!st.dead) brow(g, 5, -27, 5, 0.4, 'rgba(30,5,40,0.8)', 1.2);
      g.strokeStyle = 'rgba(40,10,50,0.4)'; g.lineWidth = 0.7; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-3, -10 + i * 3, 6, -0.5, 0.6); g.stroke(); }
    },
    proj: { kind: 'poop', name: 'POOP SHOT' }, sp2: { kind: 'rush', name: 'HIPPO RAM' },
    fatal: { id: 'hippo', name: 'POTHOLE FILLER' }
  };

  const SKIN_L = '#d9a888';
  const painter = {
    id: 'painter', name: 'PAINTER DUDE', short: 'PAINTER', him: 'HIM', k: 1.0,
    bio: 'Every tree needs a friend. Every friend needs a beating.',
    d: dims({}),
    col: { torso: '#8fb0c8', armU: '#8fb0c8', armL: '#8fb0c8', cuff: '#8fb0c8', hand: SKIN_L, legU: '#344a6e', legL: '#344a6e', foot: '#4a3020', neck: SKIN_L },
    mat: { torso: 'cloth', armU: 'cloth', armL: 'cloth', legU: 'denim', legL: 'denim' },
    stats: { speed: 1.0, power: 1.0, weight: 1.0 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.05, -L * 1.02], [d.shW * 0.75, -L * 1.02], [d.shW * 0.42, -L * 0.8]], SKIN_L);
      g.fillStyle = 'rgba(90,50,30,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(d.shW * 0.3 + (i % 3), -L * 0.98 + i * 1.3, 0.8, 0.8);
      g.fillStyle = '#e8eef4'; for (let i = 0; i < 4; i++) g.fillRect(d.shW * 0.42, -L * 0.72 + i * 7, 1.3, 1.3);
      R.line(g, d.shW * 0.5, -L * 0.78, d.shW * 0.5, -L * 0.05, 'rgba(40,60,90,0.6)', 0.7);
      g.strokeStyle = 'rgba(40,60,90,0.6)'; g.lineWidth = 0.8; g.strokeRect(-d.back * 0.1, -L * 0.75, 6, 5);
      g.fillStyle = '#2a1a10'; g.fillRect(-d.hipW * 1.2, -3, d.hipW * 2.6, 3); g.fillStyle = '#b8a040'; g.fillRect(d.hipW * 0.6, -3, 2, 3);
    },
    backHand(g, d, J, st) {
      if (st.noProp) return;
      const w = J.AB.wr;
      g.save(); g.translate(w[0], w[1] + 2); g.rotate(-0.3);
      g.beginPath(); g.ellipse(-3, 0, 10, 6.5, 0, 0, PI * 2); fillLit(g, '#a87a48', -3, 0, 10);
      g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(-8, 1, 1.6, 0, PI * 2); g.fill();
      const pc = ['#f4f4f4', '#2a5ad0', '#e8c020', '#c02020', '#2a8a3a', '#1a1a1a'];
      pc.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(-4 + (i % 3) * 4.5, -3 + ((i / 3) | 0) * 4.5, 1.5, 0, PI * 2); g.fill(); });
      g.restore();
    },
    head(g, st) {
      humanHead(g, st, {
        skin: SKIN_L, eyeC: '#3a2a1a', browC: 'rgba(40,20,10,0.9)',
        back(g) {
          g.beginPath(); g.ellipse(-2, -18, 18, 16.5, 0, 0, PI * 2); fillLit(g, '#34200f', -2, -18, 18, 0.15, -0.65);
          g.save(); g.clip(); curls(g, -2, -18, 18, 16.5, 420, 3); g.restore();
          R.srand(9); g.fillStyle = '#24140a';
          for (let i = 0; i < 46; i++) { const a = -PI * 1.15 + i * 0.068 * PI / 1.0, x = -2 + Math.cos(a) * 18, y = -18 + Math.sin(a) * 16.5; g.beginPath(); g.arc(x, y, 1.3 + R.rr() * 1.1, 0, PI * 2); g.fill(); }
        },
        front(g) {
          // hair mass over the crown and temple, down to the sideburns that meet the beard
          g.beginPath(); g.moveTo(-7, -6); g.bezierCurveTo(-11, -16, -8, -30, 2, -32); g.bezierCurveTo(10, -33, 15, -27, 13, -18.5);
          g.quadraticCurveTo(10, -20.5, 7.5, -19.2); g.quadraticCurveTo(4, -18.2, 2.5, -15); g.quadraticCurveTo(1.5, -11, 1.2, -7.5); g.closePath();
          fillLit(g, '#3a2412', 2, -22, 14, 0.18, -0.6);
          g.save(); g.clip(); curls(g, 2, -21, 14, 13, 300, 5); g.restore();
          R.srand(13); g.fillStyle = '#24140a';
          for (let i = 0; i < 22; i++) { const t = i / 21, x = 13 - t * 5.5 - Math.sin(t * PI) * 1.5, y = -18.5 - Math.sin(t * PI) * 1.2 + t * 1.5; g.beginPath(); g.arc(x, y, 0.9 + R.rr() * 0.6, 0, PI * 2); g.fill(); }
        },
        beard(g) {
          g.beginPath(); g.moveTo(-2.5, -9); g.quadraticCurveTo(-3, 2, 4, 4); g.quadraticCurveTo(11, 4.5, 12, -3.5);
          g.lineTo(11.6, -5.4); g.quadraticCurveTo(10, -3.2, 7, -4.6); g.quadraticCurveTo(3, -4, 1, -9); g.closePath();
          fillLit(g, '#4a2e18', 4, -3, 9, 0.15, -0.6);
          g.save(); g.clip(); strokes(g, 4, -2, 9, 7, 90, 5, 1.3, 2, 0.4, 0.15); g.restore();
          g.beginPath(); g.moveTo(8, -6.8); g.quadraticCurveTo(10.5, -7.6, 12.4, -6.2); g.quadraticCurveTo(10.5, -5.6, 8, -6); g.fillStyle = '#3a2210'; g.fill();
          if (!st.dead) R.line(g, 9, -5, 11.2, -5.1, 'rgba(120,40,40,0.9)', 0.7);
          else { g.fillStyle = '#8a0010'; g.fillRect(10, -5, 1.2, 6); }
        },
        mouth() {}
      });
    },
    proj: { kind: 'knife', name: 'PALETTE KNIFE' }, sp2: { kind: 'cloud', name: 'THINNER SPLASH' },
    fatal: { id: 'painter', name: 'HAPPY LITTLE ACCIDENT' }
  };

  const OR = '#c8762e', ORD = '#7a3e14', CRM = '#e8d0a8';
  const garf = {
    id: 'garf', name: 'FAT CAT', short: 'FAT CAT', him: 'HIM', k: 1.08, paws: true, claws: true, skull: 'cat',
    bio: 'Twenty pounds of alley tom. Hates Mondays. Hates you more.',
    d: dims({ thigh: 21, shin: 21, torso: 35, neck: 2, upper: 18, fore: 17, hipW: 17, shW: 15, chest: 17, belly: 21, back: 14, thighR: 9.5, kneeR: 6.5, ankleR: 4.5, shR: 7, elbowR: 5.5, wristR: 4.6, fist: 5, footL: 12, footH: 5 }),
    col: { torso: OR, armU: OR, armL: OR, hand: sh(OR, 0.15), legU: OR, legL: OR, foot: sh(OR, 0.1), neck: OR },
    mat: { torso: 'fur', armU: 'fur', armL: 'fur', legU: 'fur', legL: 'fur', neck: 'fur' },
    stats: { speed: 1.02, power: 1.05, weight: 1.1 },
    torsoDetail(g, d, st, L) {
      g.fillStyle = 'rgba(240,215,170,0.6)'; g.beginPath(); g.ellipse(d.belly * 0.45, -L * 0.45, d.belly * 0.45, L * 0.4, 0, 0, PI * 2); g.fill();
      strokes(g, d.belly * 0.45, -L * 0.45, d.belly * 0.4, L * 0.35, 30, 8, -1.6, 2.5, 0.15, 0.25);
      g.fillStyle = 'rgba(80,30,5,0.55)'; for (let i = 0; i < 5; i++) { g.save(); g.translate(-d.back * 0.55, -L * 0.15 - i * 6.5); g.rotate(0.35); g.fillRect(-5, -1, 11, 2.2); g.restore(); }
    },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 3) * 0.25;
      let p = [J.hip[0] - d.back * 0.8, J.hip[1] - 2];
      for (let i = 0; i < 7; i++) { const a = PI * 0.62 + i * 0.26 + w * i * 0.4, q = R.add(p, R.dir(a, 7.5 * d.k)); R.seg(g, p, q, (5.4 - i * 0.45) * d.k, (5 - i * 0.45) * d.k, i % 2 ? ORD : OR, 'fur', { seed: 200 + i }); p = q; }
    },
    head(g, st) {
      // ears
      g.beginPath(); g.moveTo(-8, -18); g.lineTo(-6, -31); g.lineTo(1, -22); g.closePath(); fillLit(g, ORD, -5, -24, 7);
      g.beginPath(); g.moveTo(1, -22); g.lineTo(6, -33); g.lineTo(10, -21); g.closePath(); fillLit(g, OR, 6, -26, 7);
      g.fillStyle = 'rgba(230,170,160,0.6)'; R.poly(g, [[3, -23], [6, -30], [8.5, -22]], 'rgba(220,160,150,0.55)');
      g.fillStyle = '#2a1208'; R.poly(g, [[4.5, -30.5], [6, -33], [7, -29]], '#2a1208');
      // head + cheek ruff
      g.beginPath(); g.ellipse(1, -14, 13, 11.5, 0, 0, PI * 2); fillLit(g, OR, 1, -14, 13, 0.2, -0.62);
      g.save(); g.clip(); strokes(g, 1, -14, 12, 11, 120, 11, -0.4, 2.2, 0.3, 0.18);
      g.fillStyle = 'rgba(70,25,5,0.6)'; for (let i = 0; i < 3; i++) g.fillRect(-2 + i * 3.4, -25, 1.6, 5.5 - i);
      g.restore();
      fringe(g, 1, -14, 13, 11.5, PI * 0.15, PI * 1.05, 22, sh(OR, -0.15), 2.6, 4);
      // muzzle, nose, mouth
      g.beginPath(); g.ellipse(9.5, -7, 7, 5, 0.1, 0, PI * 2); fillLit(g, CRM, 9.5, -7, 7, 0.2, -0.45);
      g.fillStyle = '#b86a6a'; R.poly(g, [[13.5, -11], [16.5, -10.8], [15, -8.8]], '#a86060');
      g.strokeStyle = 'rgba(40,10,5,0.8)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(15, -8.8); g.lineTo(15, -7); g.quadraticCurveTo(13, -5, 11, -6); g.stroke();
      if (!st.dead) { g.fillStyle = '#efe8d8'; R.poly(g, [[12.6, -6.4], [13.6, -6.4], [13.1, -3.6]], '#efe8d8'); }
      g.fillStyle = 'rgba(60,20,10,0.55)'; for (let i = 0; i < 6; i++) g.fillRect(10.5 + (i % 3) * 1.4, -8.5 + ((i / 3) | 0) * 1.4, 0.6, 0.6);
      g.strokeStyle = 'rgba(240,235,225,0.7)'; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(12, -8 + i); g.lineTo(23, -10 + i * 2.2); g.stroke(); }
      eye(g, 9.5, -14.5, 1.9, st, { animal: 1, slit: 1, iris: '#9a9a20', socket: 'rgba(60,20,0,0.5)' });
      eye(g, 3.5, -14.8, 1.6, st, { animal: 1, slit: 1, iris: '#9a9a20', socket: 'rgba(60,20,0,0.5)' });
      if (!st.dead) { brow(g, 9, -16.8, 5, 0.35, 'rgba(60,20,0,0.9)', 1.3); brow(g, 3.5, -17, 4, -0.25, 'rgba(60,20,0,0.9)', 1.2); }
      R.line(g, 6.5, -21, 4.5, -9.5, 'rgba(120,30,20,0.8)', 0.8);
    },
    proj: { kind: 'hairball', name: 'HAIRBALL' }, sp2: { kind: 'leap', name: 'POUNCE' },
    fatal: { id: 'garf', name: 'I HATE MONDAYS' }
  };

  const SUIT = '#4a4e5a';
  const host = {
    id: 'host', name: 'LATE NIGHT HOST', short: 'HOST', him: 'HIM', k: 1.04,
    bio: 'Gap-toothed, sarcastic and armed with a list. Tonight, you are on it.',
    d: dims({ thigh: 29, shin: 28, torso: 36, upper: 21, fore: 20, hipW: 10, shW: 15, chest: 14, belly: 10.5, back: 10, thighR: 6.4, kneeR: 4.4, ankleR: 3.3 }),
    col: { torso: SUIT, armU: SUIT, armL: SUIT, cuff: '#e8e8e4', hand: SKIN_L, legU: '#40444e', legL: '#40444e', foot: '#121214', neck: SKIN_L },
    mat: { torso: 'suit', armU: 'suit', armL: 'suit', legU: 'suit', legL: 'suit' }, bicep: 0.1, calf: 0.1,
    stats: { speed: 1.04, power: 0.96, weight: 0.95 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.05, -L * 1.02], [d.shW * 0.85, -L * 1.02], [d.shW * 0.55, -L * 0.45]], '#e8e8e4');
      R.poly(g, [[d.shW * 0.42, -L * 0.96], [d.shW * 0.62, -L * 0.96], [d.shW * 0.6, -L * 0.5], [d.shW * 0.5, -L * 0.42], [d.shW * 0.4, -L * 0.5]], '#2a3a7a');
      g.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 5; i++) g.fillRect(d.shW * 0.44, -L * 0.9 + i * 4.5, 2.5, 0.8);
      R.poly(g, [[d.shW * 0.05, -L * 1.02], [d.shW * 0.45, -L * 0.45], [d.shW * 0.2, -L * 0.7]], '#3a3e48');
      R.poly(g, [[d.shW * 0.85, -L * 1.02], [d.shW * 0.6, -L * 0.42], [d.shW * 0.95, -L * 0.75]], '#3a3e48');
      g.fillStyle = '#1a1c22'; g.fillRect(d.shW * 0.55, -L * 0.3, 1.5, 1.5); g.fillRect(d.shW * 0.55, -L * 0.18, 1.5, 1.5);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: '#e2b496', chin: 2.6, nose: 0.6, eyeC: '#3a4a6a', browC: 'rgba(110,100,85,0.95)', cleanJaw: 1,
        front(g) {
          // sandy gray hair combed straight back off a high forehead, with a little lift at the front
          g.beginPath(); g.moveTo(-6.5, -9); g.bezierCurveTo(-9.5, -21, -4, -28.5, 3, -28.8); g.bezierCurveTo(9, -29, 12, -26.5, 11.8, -23.4);
          g.quadraticCurveTo(8, -25, 4, -24); g.quadraticCurveTo(0, -22.5, -2.5, -18); g.quadraticCurveTo(-3.6, -13, -3.4, -9); g.closePath();
          fillLit(g, '#b8ac98', 2, -23, 10, 0.22, -0.5);
          g.save(); g.clip(); strokes(g, 2, -23, 10, 6, 90, 13, PI + 0.15, 4, 0.3, 0.3); g.restore();
          // smile lines and the big chin
          g.strokeStyle = 'rgba(120,60,40,0.45)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(9.4, -8.4); g.quadraticCurveTo(6.6, -6, 7, -3); g.stroke();
          g.fillStyle = 'rgba(255,230,210,0.2)'; g.beginPath(); g.ellipse(9.4, 1.4, 2.6, 1.6, 0, 0, PI * 2); g.fill();
          // glasses
          g.strokeStyle = '#141414'; g.lineWidth = 0.9;
          g.beginPath(); g.ellipse(9.2, -12.2, 2.6, 2, 0, 0, PI * 2); g.stroke(); g.beginPath(); g.ellipse(4.6, -12.3, 2.1, 1.9, 0, 0, PI * 2); g.stroke();
          R.line(g, 6.7, -12.6, 6.7, -12.6, '#141414', 0.8); R.line(g, 2.5, -12.5, -1, -11.5, '#141414', 0.7);
          g.fillStyle = 'rgba(200,220,255,0.14)'; g.beginPath(); g.ellipse(9.2, -12.2, 2.4, 1.8, 0, 0, PI * 2); g.fill();
        },
        mouth(g) {
          if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10, -4.2, 1.6, 1.4, 0, 0, PI * 2); g.fill(); g.fillStyle = '#8a0010'; g.fillRect(9.5, -3.4, 1.2, 5); return; }
          g.fillStyle = '#2a0606'; g.beginPath(); g.moveTo(6.2, -6); g.quadraticCurveTo(9.6, -1.6, 12, -5.7); g.quadraticCurveTo(9.2, -5.2, 6.2, -6); g.fill();
          g.fillStyle = '#f2ecdc'; g.fillRect(7.2, -5.8, 1.7, 1.5); g.fillRect(10.1, -5.7, 1.6, 1.5); g.fillRect(6.5, -5.7, 0.7, 1.1); g.fillRect(11.7, -5.6, 0.5, 1);
          g.fillStyle = '#2a0606'; g.fillRect(8.9, -5.8, 1.2, 1.6);
          g.fillStyle = 'rgba(200,110,100,0.5)'; g.fillRect(7.5, -3.9, 3.5, 0.7);
        }
      });
    },
    proj: { kind: 'card', name: 'CUE CARD' }, sp2: { kind: 'slide', name: 'DESK SLIDE' },
    fatal: { id: 'host', name: 'TOP TEN LIST' }
  };

  const SKB = '#7a4a2a', RED = '#a8132a';
  const ballin = {
    id: 'ballin', name: "BALLIN' WELL", short: 'BALLIN', him: 'HIM', k: 1.1,
    bio: 'Basketball legend. Number 42. Still has the moves. Still has the elbows.',
    sock: '#ececea', sockLow: true, bicep: 0.38, calf: 0.4, stripe: RED, sleeve: '#f0efea',
    d: dims({ thigh: 31, shin: 31, torso: 37, upper: 23, fore: 22, hipW: 12, shW: 16, chest: 15.5, belly: 11, back: 11, thighR: 7.6, kneeR: 4.6, shR: 6, elbowR: 4.1 }),
    col: { torso: '#eae8e2', armU: SKB, armL: SKB, hand: SKB, legU: '#eae8e2', legL: SKB, foot: '#b8141e', neck: SKB },
    mat: { torso: 'cloth', armU: 'skin', armL: 'skin', legU: 'cloth', legL: 'skin' },
    stats: { speed: 1.1, power: 1.0, weight: 1.0 },
    torsoDetail(g, d, st, L) {
      // tank top: scooped neck and arm holes trimmed in red
      R.poly(g, [[-d.shW * 0.4, -L * 1.06], [d.shW * 0.9, -L * 1.06], [d.shW * 0.45, -L * 0.8]], SKB);
      g.strokeStyle = RED; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-d.shW * 0.4, -L * 1.04); g.lineTo(d.shW * 0.45, -L * 0.8); g.lineTo(d.shW * 0.9, -L * 1.04); g.stroke();
      g.beginPath(); g.moveTo(-d.back * 0.9, -L * 0.98); g.quadraticCurveTo(-d.back * 0.1, -L * 0.7, d.shW * 0.25, -L * 0.98); g.stroke();
      g.save(); g.translate(d.shW * 0.08, -L * 0.36); g.font = '400 13px Anton, Impact, sans-serif'; g.fillStyle = '#5a0a10'; g.fillText('42', -6.4, 0.6); g.fillStyle = RED; g.fillText('42', -7, 0); g.restore();
      g.fillStyle = RED; g.fillRect(-d.hipW * 1.1, -5, d.hipW * 2.4, 2);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: SKB, eyeC: '#1a0a04', browC: 'rgba(10,5,0,0.95)', nose: 0.3,
        front(g) {
          // clean-shaven head: a shine on the scalp, then the white headband across the brow
          g.fillStyle = 'rgba(255,240,220,0.22)'; g.beginPath(); g.ellipse(2, -23.5, 6, 2.2, -0.15, 0, PI * 2); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(3.5, -24.2, 2.4, 0.8, -0.15, 0, PI * 2); g.fill();
          g.beginPath(); g.moveTo(-8.2, -15.5); g.quadraticCurveTo(1, -21.5, 10.9, -18.6); g.lineTo(11.2, -15.6); g.quadraticCurveTo(1, -18.6, -8, -12.3); g.closePath();
          fillLit(g, '#f2f1ec', 2, -17, 10, 0.1, -0.35);
          g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 0.4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-6 + i * 2, -14.5 - i * 0.5); g.lineTo(-6 + i * 2, -17 - i * 0.55); g.stroke(); }
          R.line(g, 8.8, -3.4, 11.2, -3.6, 'rgba(20,10,5,0.6)', 0.5);
        }
      });
    },
    proj: { kind: 'bball', name: 'FIREBALL' }, sp2: { kind: 'leap', name: 'ALLEY-OOP ELBOW' },
    fatal: { id: 'ballin', name: 'POSTERIZED' }
  };

  const GB = '#6a5e50', GL = '#ddd6c6';
  const gertie = {
    id: 'gertie', name: 'GERTIE', short: 'GERTIE', him: 'HER', k: 1.1, wings: true, webbed: true, skull: 'goose', skullK: 0.8,
    bio: 'A Canada goose the size of a linebacker. Owns the Greenway. Will hiss at your corpse.',
    d: dims({ thigh: 14, shin: 17, torso: 30, neck: 38, hox: 12, upper: 20, fore: 21, hipW: 16, shW: 14, chest: 16, belly: 26, back: 24, thighR: 5.5, kneeR: 2.8, ankleR: 2.2, shR: 7, elbowR: 6, wristR: 4.5, fist: 4.5, footL: 15, footH: 3.2, shOff: 2 }),
    col: { torso: GB, armU: GB, hand: '#221e1a', legU: '#2a2826', legL: '#222020', foot: '#1a1a1a' },
    mat: { torso: 'feather', legU: 'feather', legL: 'skin' }, calf: 0,
    stats: { speed: 1.06, power: 0.95, weight: 0.9 },
    wing(g, A, dark, d, st) {
      const c = dark ? sh(GB, -0.2) : sh(GB, 0.08);
      const a = A.a2, e = A.el, w = A.wr, end = R.add(w, R.dir(a, 13));
      g.beginPath(); g.moveTo(A.s0[0] - 3, A.s0[1]);
      g.quadraticCurveTo(...R.add(e, R.dir(a + PI / 2, 12)), ...R.add(w, R.dir(a + PI / 2, 8)));
      g.lineTo(...end);
      g.quadraticCurveTo(...R.add(e, R.dir(a - PI / 2, 3)), A.s0[0] + 3, A.s0[1] + 4);
      g.closePath(); g.fillStyle = lit(g, e[0], e[1], 16, c); g.fill();
      g.save(); g.clip();
      for (let i = 0; i < 6; i++) { const b = R.lerp2(A.s0, end, 0.2 + i * 0.14); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(...R.add(b, R.dir(a + PI / 2, 8))); g.lineTo(...R.add(b, R.dir(a + 0.2, 6))); g.stroke(); }
      g.fillStyle = dark ? '#100c08' : '#1e1a16'; g.beginPath(); g.moveTo(...R.lerp2(w, end, 0)); g.lineTo(...end); g.lineTo(...R.add(w, R.dir(a + PI / 2, 6))); g.fill();
      g.restore();
    },
    // a real goose body: big horizontal feathered barrel, long black neck
    bodyDraw(g, d, J, st) {
      const k = d.k, c = R.add(R.lerp2(J.hip, J.sh, 0.42), [5 * k, 0]), rot = J.p.lean * 0.55 - 0.12, rx = 31 * k, ry = 19 * k;
      g.save(); g.translate(c[0], c[1]); g.rotate(rot);
      R.poly(g, [[-rx * 0.8, -ry * 0.45], [-rx * 1.38, -ry * 0.55], [-rx * 1.3, ry * 0.05], [-rx * 0.8, ry * 0.3]], '#141210');
      R.poly(g, [[-rx * 0.85, ry * 0.25], [-rx * 1.2, ry * 0.2], [-rx * 0.7, ry * 0.75]], '#ece6da');
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, PI * 2); g.fillStyle = lit(g, 0, 0, rx, GB, 0.28, -0.65); g.fill();
      g.save(); g.clip();
      g.fillStyle = 'rgba(220,212,196,0.9)'; g.beginPath(); g.ellipse(rx * 0.25, ry * 0.55, rx * 0.8, ry * 0.6, 0.08, 0, PI * 2); g.fill();
      g.fillStyle = 'rgba(150,120,90,0.45)'; g.beginPath(); g.ellipse(rx * 0.7, -ry * 0.05, rx * 0.4, ry * 0.6, 0, 0, PI * 2); g.fill();
      g.strokeStyle = 'rgba(30,22,14,0.5)'; g.lineWidth = 0.8;
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-rx * 0.7 + i * rx * 0.22 + r * 2, -ry * 0.55 + r * ry * 0.3, 3.2 * k, 0.2, PI - 0.2); g.stroke(); }
      g.fillStyle = 'rgba(255,250,240,0.12)'; for (let i = 0; i < 6; i++) g.fillRect(-rx * 0.6 + i * rx * 0.2, -ry * 0.75, rx * 0.12, 1);
      g.restore();
      R.srand(5); g.fillStyle = sh(GB, -0.3);
      for (let i = 0; i < 18; i++) { const a = -PI * 0.95 + i * 0.11, x = Math.cos(a) * rx, y = Math.sin(a) * ry; g.beginPath(); g.moveTo(x - 1.5, y); g.lineTo(x * 1.06 - 1, y * 1.12 - 1); g.lineTo(x + 1.5, y); g.fill(); }
      g.restore();
      // neck rising from the front of the body
      const base = R.add(c, [Math.cos(rot) * rx * 0.62 + Math.sin(rot) * ry * 0.5, Math.sin(rot) * rx * 0.62 - Math.cos(rot) * ry * 0.5]);
      const nk = J.nk, ctl = [base[0] + 7 * k, (base[1] + nk[1]) / 2];
      let p = base;
      for (let i = 1; i <= 6; i++) { const t = i / 6, q = [(1 - t) * (1 - t) * base[0] + 2 * (1 - t) * t * ctl[0] + t * t * nk[0], (1 - t) * (1 - t) * base[1] + 2 * (1 - t) * t * ctl[1] + t * t * nk[1]]; R.seg(g, p, q, (5.4 - i * 0.35) * k, (5.0 - i * 0.35) * k, '#1c1a18', 'feather', { seed: 300 + i }); p = q; }
      R.line(g, base[0] - 2 * k, base[1] + 2 * k, base[0] + 5 * k, base[1] - 1 * k, 'rgba(220,212,196,0.8)', 2.5 * k);
    },
    head(g, st) {
      g.scale(1.25, 1.25);
      g.beginPath(); g.ellipse(2, -6, 6.5, 5.6, 0.15, 0, PI * 2); fillLit(g, '#1c1a18', 2, -6, 7, 0.35, -0.6);
      // white chinstrap
      g.beginPath(); g.moveTo(-2.5, -6.5); g.quadraticCurveTo(2, -11, 5.5, -7.5); g.quadraticCurveTo(5, -2, 0, -1); g.quadraticCurveTo(-3, -2.5, -2.5, -6.5); fillLit(g, '#ece6da', 1.5, -5, 6, 0.1, -0.35);
      // long black bill
      g.beginPath(); g.moveTo(6.5, -8.2); g.quadraticCurveTo(12, -8, 16.5, -5.8); g.quadraticCurveTo(16.8, -4.6, 15.5, -4.4); g.quadraticCurveTo(11, -3.6, 6.5, -3.6); g.closePath(); fillLit(g, '#1a1a1a', 11, -6, 6, 0.35, -0.5);
      R.line(g, 7.5, -5.4, 15.6, -5, 'rgba(90,90,90,0.8)', 0.5);
      if (st.jaw || st.honk) { g.fillStyle = '#5a1a2a'; R.poly(g, [[7, -5.3], [15.5, -4.6], [8, -2.4]], '#5a1a2a'); }
      eye(g, 5, -8.4, 1.05, st, { animal: 1, iris: '#0a0606', socket: 'rgba(0,0,0,0.2)' });
      if (!st.dead) brow(g, 5, -10, 3.5, 0.45, 'rgba(0,0,0,0.9)', 1);
      R.poly(g, [[-1, -11], [-5.5, -14.5], [-5.5, -8.5]], '#d8508a'); R.poly(g, [[-1, -11], [3.5, -14.5], [2.5, -8.5]], '#d8508a'); R.ball(g, -1, -11, 1.5, '#a8306a');
    },
    proj: { kind: 'gust', name: 'WING GUST' }, sp2: { kind: 'leap', name: 'DIVE-BOMB' },
    fatal: { id: 'gertie', name: 'HONK' }, alt: { id: 'nest', name: 'NEST' }
  };

  const RG = '#6e6e72', RGL = '#b0b0b0', RGD = '#222226';
  const rocky = {
    id: 'rocky', name: 'ROCKY', short: 'ROCKY', him: 'HIM', k: 1.05, paws: true, claws: true, skull: 'raccoon', bicep: 0.4,
    bio: 'Rabid, foaming and living in the dumpster behind Royal Pizza.',
    d: dims({ thigh: 20, shin: 19, torso: 33, neck: 2, upper: 18, fore: 17, hipW: 19, shW: 17, chest: 20, belly: 26, back: 19, thighR: 11, kneeR: 7, ankleR: 5, shR: 8.4, elbowR: 6.4, wristR: 5, fist: 5.4, footL: 12, footH: 4.8 }),
    col: { torso: RG, armU: RG, armL: sh(RG, -0.3), hand: RGD, legU: RG, legL: sh(RG, -0.3), foot: RGD, neck: RG },
    mat: { torso: 'fur', armU: 'fur', armL: 'fur', legU: 'fur', legL: 'fur', neck: 'fur' },
    stats: { speed: 1.02, power: 1.05, weight: 1.15 },
    torsoDetail(g, d, st, L) { g.fillStyle = 'rgba(190,190,185,0.5)'; g.beginPath(); g.ellipse(d.belly * 0.35, -L * 0.45, d.belly * 0.5, L * 0.38, 0, 0, PI * 2); g.fill(); },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 4) * 0.2;
      let p = [J.hip[0] - d.back * 0.8, J.hip[1] - 2];
      for (let i = 0; i < 8; i++) { const a = PI * 0.6 + i * 0.1 + w * i * 0.4, q = R.add(p, R.dir(a, 6 * d.k)); const r0 = (5 + Math.sin(i / 7 * PI) * 3.4) * d.k, r1 = (5 + Math.sin((i + 1) / 7 * PI) * 3.4) * d.k; R.seg(g, p, q, r0, r1, i % 2 ? '#1a1a1c' : '#8a8a8e', 'fur', { seed: 400 + i }); p = q; }
    },
    head(g, st) {
      g.beginPath(); g.ellipse(-4, -20, 3.4, 4.2, -0.2, 0, PI * 2); fillLit(g, RG, -4, -20, 4); g.fillStyle = 'rgba(240,240,240,0.7)'; g.beginPath(); g.ellipse(-4, -20.5, 2.3, 3, -0.2, 0, PI * 2); g.fill(); g.fillStyle = '#2a2a2e'; g.beginPath(); g.ellipse(-3.8, -20, 1.4, 2.1, -0.2, 0, PI * 2); g.fill();
      g.beginPath(); g.moveTo(-8, -6); g.bezierCurveTo(-9, -18, 0, -21, 6, -17); g.quadraticCurveTo(13, -12, 19, -9); g.quadraticCurveTo(20, -7.5, 18.5, -6.5); g.quadraticCurveTo(10, -3, 2, -1); g.quadraticCurveTo(-5, 0, -8, -6); g.closePath();
      fillLit(g, RG, 3, -11, 12, 0.22, -0.6);
      g.save(); g.clip(); strokes(g, 2, -11, 11, 9, 100, 17, -0.6, 2.2, 0.3, 0.2);
      g.fillStyle = 'rgba(230,230,228,0.75)'; g.beginPath(); g.ellipse(12, -6.5, 6.5, 3, -0.15, 0, PI * 2); g.fill();
      g.fillStyle = '#111114'; g.beginPath(); g.moveTo(-3, -12); g.quadraticCurveTo(5, -16.5, 14, -11.5); g.quadraticCurveTo(10, -8.5, 4, -9.5); g.quadraticCurveTo(0, -8.5, -3, -12); g.fill();
      g.fillStyle = 'rgba(240,240,240,0.85)'; g.beginPath(); g.ellipse(6, -15.6, 4.5, 1, -0.15, 0, PI * 2); g.fill();
      g.restore();
      fringe(g, 0, -10, 9, 8, PI * 0.4, PI * 1.2, 14, sh(RG, -0.2), 2.4, 6);
      R.ball(g, 19, -8.3, 1.6, '#0a0a0c');
      eye(g, 9, -12, 1.4, st, { animal: 1, iris: '#d01a10', glow: !st.dead, socket: 'rgba(0,0,0,0)' });
      eye(g, 3.6, -12.4, 1.2, st, { animal: 1, iris: '#d01a10', socket: 'rgba(0,0,0,0)' });
      if (!st.dead) {
        g.fillStyle = '#3a0a0a'; g.beginPath(); g.moveTo(11, -4.5); g.lineTo(18.5, -6.2); g.lineTo(13, -2); g.closePath(); g.fill();
        g.fillStyle = '#ece6d6'; for (let i = 0; i < 3; i++) R.poly(g, [[12 + i * 2, -4.6], [13.2 + i * 2, -4.9], [12.6 + i * 2, -2.8]], '#ece6d6');
        const t = st.t || 0;
        for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(250,250,240,0.9)'; g.beginPath(); g.arc(11 + (i * 2.7) % 8, -2 + Math.abs(Math.sin(t * 5 + i)) * 5, 0.8 + (i % 2) * 0.6, 0, PI * 2); g.fill(); }
      }
    },
    proj: { kind: 'can', name: 'TRASH CAN' }, sp2: { kind: 'roll', name: 'CLAW ROLL' },
    fatal: { id: 'rocky', name: 'RABIES' }
  };

  const MB = '#5a3e26', MBL = '#8a6a48', MBD = '#2a1e14';
  const millie = {
    id: 'millie', name: 'MILLIE', short: 'MILLIE', him: 'HER', k: 1.04, paws: true, claws: true, skull: 'muskrat',
    bio: 'White River muskrat. Those teeth go through bone like balsa.',
    d: dims({ thigh: 25, shin: 23, torso: 34, neck: 5, upper: 19, fore: 18, hipW: 15, shW: 13, chest: 14.5, belly: 17, back: 14, thighR: 8.5, kneeR: 5.8, ankleR: 4, shR: 6.2, elbowR: 4.6, wristR: 3.8, fist: 4.3, footL: 12, footH: 4.2 }),
    col: { torso: MB, armU: MB, armL: MB, hand: MBD, legU: MB, legL: MB, foot: MBD, neck: MB },
    mat: { torso: 'fur', armU: 'fur', armL: 'fur', legU: 'fur', legL: 'fur', neck: 'fur' },
    stats: { speed: 1.08, power: 0.95, weight: 0.85 },
    torsoDetail(g, d, st, L) { g.fillStyle = 'rgba(150,115,80,0.55)'; g.beginPath(); g.ellipse(d.belly * 0.35, -L * 0.45, d.belly * 0.5, L * 0.38, 0, 0, PI * 2); g.fill(); },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 5) * 2;
      g.beginPath(); g.moveTo(J.hip[0] - d.back * 0.8, J.hip[1] - 2);
      g.quadraticCurveTo(J.hip[0] - 22 * d.k, J.hip[1] + 26 * d.k, J.hip[0] - 40 * d.k, -2 + w);
      g.strokeStyle = '#141010'; g.lineWidth = 3.2 * d.k; g.lineCap = 'round'; g.stroke();
      g.strokeStyle = 'rgba(120,110,100,0.5)'; g.lineWidth = 0.6; g.setLineDash([1, 1.5]); g.stroke(); g.setLineDash([]);
    },
    head(g, st) {
      g.beginPath(); g.moveTo(-8, -5); g.bezierCurveTo(-9, -18, 2, -22, 9, -17); g.quadraticCurveTo(16, -13, 18.5, -9); g.quadraticCurveTo(19, -6, 16.5, -5); g.quadraticCurveTo(8, -1, 0, -0.5); g.quadraticCurveTo(-6, 0, -8, -5); g.closePath();
      fillLit(g, MB, 4, -11, 13, 0.22, -0.62);
      g.save(); g.clip(); strokes(g, 3, -11, 11, 9, 120, 23, -0.5, 2.2, 0.35, 0.2); g.fillStyle = 'rgba(150,120,90,0.45)'; g.beginPath(); g.ellipse(12, -6, 6, 3, -0.1, 0, PI * 2); g.fill(); g.restore();
      fringe(g, 1, -10, 9.5, 9, PI * 0.35, PI * 1.25, 16, sh(MB, -0.25), 2.6, 3);
      g.beginPath(); g.ellipse(-1, -17.5, 2.4, 2, 0, 0, PI * 2); fillLit(g, MBD, -1, -17.5, 2.5);
      R.ball(g, 18, -8.5, 1.5, '#2a1414');
      if (!st.dead) {
        g.fillStyle = '#d88a18'; g.fillRect(13.6, -5.2, 1.8, 5.4); g.fillRect(15.6, -5.2, 1.8, 5.4); g.fillStyle = 'rgba(80,40,0,0.7)'; g.fillRect(15.4, -5.2, 0.3, 5.4); g.fillStyle = 'rgba(255,220,150,0.5)'; g.fillRect(13.8, -5, 0.6, 4.6);
      }
      g.strokeStyle = 'rgba(200,190,170,0.6)'; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(15, -8 + i); g.lineTo(24, -10 + i * 2.4); g.stroke(); }
      eye(g, 8.5, -12.6, 1.3, st, { animal: 1, iris: '#0a0604', socket: 'rgba(0,0,0,0.2)' });
    },
    proj: { kind: 'wave', name: 'TAIL WAVE' }, sp2: { kind: 'burrow', name: 'BURROW' },
    fatal: { id: 'millie', name: 'BONE YARD' }
  };

  // ---------- bosses ----------
  const GLASS = '#8cbccc';
  const golem = {
    id: 'golem', name: 'FRUIT JAR GOLEM', short: 'GOLEM', him: 'IT', k: 1.32, boss: true, glass: true,
    bio: 'Blown in the old glass works. Something pickled lives inside.',
    d: dims({ thigh: 20, shin: 20, torso: 38, neck: 3, upper: 18, fore: 18, hipW: 18, shW: 19, chest: 20, belly: 21, back: 19, thighR: 8, kneeR: 7, ankleR: 6.5, shR: 7.5, elbowR: 6.5, wristR: 6, fist: 6.5, footL: 13, footH: 6 }),
    col: { torso: GLASS, armU: GLASS, armL: GLASS, hand: '#a8ccda', legU: GLASS, legL: GLASS, foot: '#6a98ac', neck: '#8f8f94' },
    mat: { torso: 'glass', armU: 'glass', armL: 'glass', legU: 'glass', legL: 'glass', neck: 'cloth' },
    stats: { speed: 0.82, power: 1.2, weight: 2.2, armor: 0.8 },
    torsoDetail(g, d, st, L) {
      g.fillStyle = 'rgba(90,130,40,0.55)'; g.fillRect(-d.back * 0.95, -L * 0.72, d.back * 0.95 + d.belly * 0.95, L * 0.8);
      const t = st.t || 0;
      g.beginPath(); g.ellipse(2, -L * 0.35 + Math.sin(t * 1.3) * 2, 9, 6.5, 0, 0, PI * 2); fillLit(g, '#c89098', 2, -L * 0.35, 9);
      g.strokeStyle = 'rgba(120,50,60,0.7)'; g.lineWidth = 0.7; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-5 + i * 3, -L * 0.35 + Math.sin(t * 1.3) * 2, 2.4, PI, 0); g.stroke(); }
      const ey = -L * 0.62 + Math.sin(t * 1.7 + 1) * 2;
      R.ball(g, 6, ey, 5, '#ece6da'); R.ball(g, 9, ey, 2.4, '#3a6a2a'); R.ball(g, 10, ey, 1.1, '#000');
      R.line(g, 1, ey + 2, -4, ey + 8, '#a02838', 0.9); R.line(g, 3, ey + 3, 4, ey + 6, '#a02838', 0.5);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(d.belly * 0.45, -L * 0.95, 2.2, L * 0.8);
      g.save(); g.font = '700 7px Anton, Impact, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillText('MUNCIE', -10, -L * 0.82); g.restore();
    },
    head(g, st) {
      g.fillStyle = '#7f7f84'; g.fillRect(-12, -5, 25, 6);
      g.fillStyle = '#c0c0c4'; g.fillRect(-12, -5, 25, 1.3);
      g.fillStyle = '#5a5a60'; for (let i = -11; i < 13; i += 3) g.fillRect(i, -3.5, 1, 4);
      g.fillStyle = '#a0a0a6'; g.fillRect(-11, -9, 23, 4); g.fillStyle = '#d0d0d4'; g.fillRect(-11, -9, 23, 1);
      g.fillStyle = 'rgba(120,60,20,0.5)'; g.fillRect(-6, -8, 4, 2); g.fillRect(4, -3, 3, 3);
    },
    proj: { kind: 'shards', name: 'GLASS SHARDS' }, sp2: { kind: 'leap', name: 'JAR SLAM' },
    fatal: { id: 'golem', name: 'CANNING SEASON' }
  };

  const DR = '#a82024';
  const dan = {
    id: 'dan', name: 'DEVIL DAN', short: 'DAN', him: 'HIM', k: 1.12, boss: true, skull: 'devil', bicep: 0.42, calf: 0.2,
    bio: 'He runs this town from City Hall. Now he wants your soul.',
    d: dims({ thigh: 28, shin: 27, torso: 36, upper: 21, fore: 20, hipW: 11, shW: 16.5, chest: 16, belly: 11.5, back: 11, thighR: 7.6, kneeR: 5, shR: 6.4 }),
    col: { torso: DR, armU: DR, armL: DR, hand: '#982024', legU: '#1a1012', legL: '#1a1012', foot: '#0c0606', neck: DR },
    mat: { torso: 'skin', armU: 'skin', armL: 'skin', legU: 'cloth', legL: 'cloth' },
    stats: { speed: 1.12, power: 1.15, weight: 1.1 },
    behind(g, d, J, st) {
      const fl = Math.sin((st.t || 0) * 4) * 3, s = J.sh;
      for (const [c, o] of [['#140606', 0], ['#5a1014', 2]]) {
        g.beginPath(); g.moveTo(s[0] - 2, s[1] + 2 + o);
        g.lineTo(s[0] - 38 + o, s[1] - 22 - fl); g.lineTo(s[0] - 30, s[1] - 4); g.lineTo(s[0] - 40 + o, s[1] + 6);
        g.lineTo(s[0] - 26, s[1] + 12); g.lineTo(s[0] - 30 + o, s[1] + 26); g.lineTo(s[0] - 6, s[1] + 24); g.closePath(); g.fillStyle = lit(g, s[0] - 24, s[1], 26, c); g.fill();
      }
    },
    backHand(g, d, J) {
      const w = J.AB.wr;
      R.line(g, w[0] + 2, w[1] + 26, w[0] - 4, w[1] - 40, '#4a2e12', 2.2);
      const tp = [w[0] - 4.6, w[1] - 41];
      R.line(g, tp[0] - 6, tp[1], tp[0] + 6, tp[1] - 1, '#b8b8c0', 1.8);
      for (let i = -1; i <= 1; i++) R.line(g, tp[0] + i * 5.5, tp[1] - i * 0.5, tp[0] + i * 5.5, tp[1] - 9, '#c8c8d0', 1.4);
    },
    torsoDetail(g, d, st, L) {
      g.strokeStyle = 'rgba(60,0,8,0.5)'; g.lineWidth = 0.9;
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(d.belly * 0.1, -L * 0.22 - i * 6); g.lineTo(d.belly * 0.75, -L * 0.24 - i * 6); g.stroke(); }
      R.line(g, d.belly * 0.45, -L * 0.12, d.belly * 0.45, -L * 0.62, 'rgba(60,0,8,0.5)', 0.9);
      g.fillStyle = '#1a1012'; g.fillRect(-d.hipW * 1.2, -4, d.hipW * 2.6, 4);
    },
    head(g, st) {
      R.poly(g, [[-3, -19], [-10, -34], [1, -22]], '#160606'); R.poly(g, [[5, -21], [5, -36], [10, -20]], '#160606');
      humanHead(g, st, {
        skin: '#b8282c', eyeC: '#e8c020', browC: 'rgba(10,0,0,0.95)', chin: 1, nose: 0.6,
        back(g) { R.poly(g, [[-2, -10], [-10, -16], [-2, -15]], '#a01c20'); },
        front(g) {
          g.beginPath(); g.moveTo(-5, -12); g.bezierCurveTo(-7, -22, 0, -27, 5, -26.5); g.bezierCurveTo(10, -26, 11.5, -21, 10.8, -18.5); g.quadraticCurveTo(5, -21, 0, -19); g.quadraticCurveTo(-3, -16, -3.5, -12); g.closePath(); g.fillStyle = '#120606'; g.fill();
          g.beginPath(); g.moveTo(8, 1); g.lineTo(12, 1); g.lineTo(10, 7); g.closePath(); g.fillStyle = '#120606'; g.fill();
          if (!st.dead) { g.fillStyle = '#1a0404'; g.beginPath(); g.moveTo(7, -5.4); g.lineTo(11.6, -5.2); g.lineTo(10.5, -3.8); g.closePath(); g.fill(); g.fillStyle = '#efe6d0'; g.fillRect(7.6, -5.3, 1, 1.1); g.fillRect(10.4, -5.2, 1, 1.1); }
        },
        mouth() {}
      });
    },
    proj: { kind: 'hellfire', name: 'HELLFIRE' }, sp2: { kind: 'burrow', name: 'HELL WARP' },
    fatal: { id: 'dan', name: 'HELLFIRE PILLAR' }
  };

  // ---------- CHUCKY: an original anthropomorphic red cardinal ----------
  const CR = '#b0141c', CRD = '#6a0a10', CRL = '#d83a34';
  const chucky = {
    id: 'chucky', name: 'CHUCKY', short: 'CHUCKY', him: 'HIM', k: 1.1, talons: true, paws: true, skull: 'cardinal', skullK: 1.0,
    bio: 'A cardinal with a chip on his shoulder and a beak like a pickaxe. Cardinal red runs in his veins. Yours too, soon.',
    bicep: 0.45, calf: 0.1,
    d: dims({ thigh: 25, shin: 24, torso: 36, neck: 3, upper: 21, fore: 20, hipW: 15, shW: 20, chest: 22, belly: 19, back: 17, thighR: 10.5, kneeR: 3.8, ankleR: 3.2, shR: 8.4, elbowR: 6.4, wristR: 4.8, fist: 5.6, footL: 14, footH: 3.8 }),
    col: { torso: CR, armU: CR, armL: CR, hand: '#3a2a26', legU: CR, legL: '#4a3a34', foot: '#3a2a26', neck: CR },
    mat: { torso: 'feather', armU: 'feather', armL: 'feather', legU: 'feather', legL: 'skin', neck: 'feather' },
    stats: { speed: 1.04, power: 1.06, weight: 1.08 },
    torsoDetail(g, d, st, L) {
      g.fillStyle = 'rgba(230,80,70,0.35)'; g.beginPath(); g.ellipse(d.belly * 0.45, -L * 0.6, d.belly * 0.55, L * 0.42, 0, 0, PI * 2); g.fill();
      g.strokeStyle = 'rgba(60,0,8,0.45)'; g.lineWidth = 0.7; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(-d.back * 0.5 + (i % 4) * 5, -L * 0.2 - ((i / 4) | 0) * 9, 3, 0.3, PI - 0.3); g.stroke(); }
    },
    tail(g, d, J) {
      for (let i = -1; i <= 1; i++) { const p0 = [J.hip[0] - d.back * 0.7, J.hip[1] - 4], p1 = R.add(p0, R.dir(-0.55 + i * 0.12, 25 * d.k)); R.seg(g, p0, p1, 3 * d.k, 4 * d.k, i ? CRD : '#8a0e14', 'feather', { seed: 600 + i }); }
    },
    head(g, st) {
      // swept-back crest
      g.beginPath(); g.moveTo(-6, -17); g.quadraticCurveTo(-12, -30, -2, -36); g.quadraticCurveTo(1, -28, 6, -22); g.closePath(); fillLit(g, CR, -2, -27, 9, 0.25, -0.55);
      g.save(); g.clip(); strokes(g, -2, -27, 8, 8, 40, 61, -2.2, 3, 0.3, 0.2); g.restore();
      g.beginPath(); g.ellipse(1, -13, 11, 11.5, 0, 0, PI * 2); fillLit(g, CR, 1, -13, 12, 0.25, -0.62);
      g.save(); g.clip(); strokes(g, 1, -13, 11, 11, 120, 63, -0.5, 2.2, 0.3, 0.18); g.restore();
      fringe(g, 1, -13, 11, 11.5, PI * 0.4, PI * 1.2, 16, CRD, 2.4, 7);
      // black mask around the eyes and the base of the beak
      g.fillStyle = '#0c0606'; g.beginPath(); g.moveTo(3, -17); g.quadraticCurveTo(12, -19, 14, -12); g.quadraticCurveTo(14, -4, 7, -2); g.quadraticCurveTo(4, -8, 3, -17); g.fill();
      // thick conical beak
      g.beginPath(); g.moveTo(12, -14.5); g.quadraticCurveTo(19, -12, 23, -8.6); g.quadraticCurveTo(18, -6.6, 12, -5.5); g.closePath(); fillLit(g, '#e07a2a', 15, -10, 6, 0.3, -0.5);
      R.line(g, 12.5, -9.4, 22, -8.8, 'rgba(90,30,0,0.8)', 0.6);
      eye(g, 8.5, -12.6, 1.5, st, { animal: 1, iris: '#0a0404', socket: 'rgba(0,0,0,0)' });
      if (!st.dead) brow(g, 8.5, -15.2, 5, 0.45, 'rgba(0,0,0,1)', 1.4);
    },
    proj: { kind: 'feather', name: 'FEATHER DARTS' }, sp2: { kind: 'leap', name: 'DIVE PECK' },
    fatal: { id: 'chucky', name: 'BIRD STRIKE' }, alt: { id: 'nest', name: 'NEST' }
  };

  // ---------- MAD TURKEY: a human-sized southside wild turkey ----------
  const TB = '#6a5034', TBL = '#9a7a52', TBD = '#1e140c';
  const turkey = {
    id: 'turkey', name: 'MAD TURKEY', short: 'TURKEY', him: 'HER', k: 1.08, wings: true, talons: true, skull: 'turkey', skullK: 0.85,
    bio: 'The southside wild turkey hen. Yes, the beard is real. Survived every Thanksgiving and holds a grudge about all of them.',
    d: dims({ thigh: 15, shin: 20, torso: 30, neck: 30, hox: 12, upper: 20, fore: 21, hipW: 16, shW: 14, chest: 16, belly: 26, back: 24, thighR: 6.5, kneeR: 3.2, ankleR: 2.6, shR: 7, elbowR: 6, wristR: 4.5, fist: 4.5, footL: 15, footH: 3.4, shOff: 2 }),
    col: { torso: TB, armU: TB, hand: TBD, legU: '#9a7a70', legL: '#9a7a70', foot: '#8a6a60' },
    mat: { torso: 'feather', legU: 'skin', legL: 'skin' }, calf: 0,
    stats: { speed: 0.98, power: 1.1, weight: 1.2 },
    wing(g, A, dark, d, st) {
      const c = dark ? sh(TB, -0.25) : TB, a = A.a2, e = A.el, w = A.wr, end = R.add(w, R.dir(a, 14));
      g.beginPath(); g.moveTo(A.s0[0] - 3, A.s0[1]);
      g.quadraticCurveTo(...R.add(e, R.dir(a + PI / 2, 12)), ...R.add(w, R.dir(a + PI / 2, 9)));
      g.lineTo(...end);
      g.quadraticCurveTo(...R.add(e, R.dir(a - PI / 2, 3)), A.s0[0] + 3, A.s0[1] + 4);
      g.closePath(); g.fillStyle = lit(g, e[0], e[1], 16, c); g.fill();
      g.save(); g.clip();
      for (let i = 0; i < 7; i++) { const b = R.lerp2(A.s0, end, 0.15 + i * 0.12); g.strokeStyle = i % 2 ? 'rgba(240,235,220,0.55)' : 'rgba(0,0,0,0.45)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(...R.add(b, R.dir(a + PI / 2, 10))); g.lineTo(...R.add(b, R.dir(a + 0.2, 5))); g.stroke(); }
      g.restore();
    },
    // round, plain brown body with a short folded tail
    bodyDraw(g, d, J, st) {
      const k = d.k, c = R.add(R.lerp2(J.hip, J.sh, 0.45), [4 * k, 0]), rot = J.p.lean * 0.5 - 0.05, rx = 28 * k, ry = 21 * k;
      // a hen's tail: short, folded and pointing down and back
      g.save(); g.translate(c[0] - rx * 0.8, c[1] + ry * 0.05); g.rotate(rot * 0.5 - 0.55);
      for (let i = 0; i < 7; i++) { g.save(); g.rotate(-0.3 + i * 0.1); g.fillStyle = lit(g, -12 * k, 0, 16 * k, '#4a3420', 0.2, -0.6); g.beginPath(); g.moveTo(0, -3 * k); g.lineTo(-20 * k, -2 * k); g.quadraticCurveTo(-23 * k, 0, -20 * k, 2.4 * k); g.lineTo(0, 3 * k); g.fill(); g.fillStyle = '#1a120a'; g.fillRect(-18 * k, -2.4 * k, 2 * k, 4.8 * k); g.fillStyle = '#c8b088'; g.fillRect(-21 * k, -2 * k, 1.6 * k, 4 * k); g.restore(); }
      g.restore();
      g.save(); g.translate(c[0], c[1]); g.rotate(rot);
      g.beginPath(); g.ellipse(0, 0, rx * 0.92, ry * 0.95, 0, 0, PI * 2); g.fillStyle = lit(g, 0, 0, rx, TB, 0.3, -0.7); g.fill();
      g.save(); g.clip();
      for (let r = 0; r < 6; r++) for (let i = 0; i < 9; i++) { const x = -rx * 0.9 + i * rx * 0.24 + (r % 2) * 3, y = -ry * 0.8 + r * ry * 0.3; g.fillStyle = r % 2 ? 'rgba(120,160,90,0.18)' : 'rgba(170,110,60,0.25)'; g.beginPath(); g.arc(x, y, 3.2 * k, 0, PI); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 0.7; g.beginPath(); g.arc(x, y, 3.2 * k, 0.2, PI - 0.2); g.stroke(); }
      g.restore();
      // beard bristles hanging off the chest
      g.fillStyle = '#0e0a06'; g.beginPath(); g.moveTo(rx * 0.62, -ry * 0.2); g.lineTo(rx * 0.72, ry * 0.55); g.lineTo(rx * 0.55, ry * 0.5); g.closePath(); g.fill();
      g.restore();
      // bare reddish neck
      const base = R.add(c, [Math.cos(rot) * rx * 0.6 + Math.sin(rot) * ry * 0.55, Math.sin(rot) * rx * 0.6 - Math.cos(rot) * ry * 0.55]), nk = J.nk, ctl = [base[0] + 5 * k, (base[1] + nk[1]) / 2];
      let p = base;
      for (let i = 1; i <= 6; i++) { const t = i / 6, q = [(1 - t) * (1 - t) * base[0] + 2 * (1 - t) * t * ctl[0] + t * t * nk[0], (1 - t) * (1 - t) * base[1] + 2 * (1 - t) * t * ctl[1] + t * t * nk[1]]; R.seg(g, p, q, (6.4 - i * 0.5) * k, (6 - i * 0.5) * k, i < 4 ? '#4a3a28' : '#8a90a8', i < 4 ? 'feather' : 'skin', { seed: 700 + i }); p = q; }
      // spurs
      R.line(g, J.LF.knee[0] + (J.LF.ank[0] - J.LF.knee[0]) * 0.7 - 3, J.LF.knee[1] + (J.LF.ank[1] - J.LF.knee[1]) * 0.7, J.LF.knee[0] + (J.LF.ank[0] - J.LF.knee[0]) * 0.7 - 6, J.LF.knee[1] + (J.LF.ank[1] - J.LF.knee[1]) * 0.7 + 1, '#3a2a22', 1.2);
    },
    head(g, st) {
      g.scale(1.2, 1.2);
      // a hen's head: blue-gray skin, a bristly feathered crown, only a hint of red
      g.beginPath(); g.ellipse(2, -6.5, 6.2, 5.8, 0.1, 0, PI * 2); fillLit(g, '#8094ae', 2, -6.5, 6.5, 0.25, -0.55);
      g.beginPath(); g.ellipse(0.5, -9.5, 5.2, 3.4, 0.1, PI, PI * 2); fillLit(g, '#4a3a2a', 0.5, -10, 5, 0.2, -0.5);
      fringe(g, 0.5, -9.5, 5.2, 3.4, PI * 1.05, PI * 1.95, 9, '#3a2a1a', 1.6, 12);
      R.srand(81); g.fillStyle = 'rgba(200,90,110,0.4)'; for (let i = 0; i < 6; i++) g.fillRect(1 + R.rr() * 6, -6 + R.rr() * 4, 1, 1);
      g.beginPath(); g.moveTo(7, -7.6); g.quadraticCurveTo(11.5, -6.8, 12.4, -4.6); g.quadraticCurveTo(10, -4.4, 7, -4.4); g.closePath(); fillLit(g, '#c8b080', 9, -6, 4, 0.3, -0.4);
      R.ball(g, 7.6, -8, 0.9, '#a8505a');
      g.beginPath(); g.moveTo(3.5, -2); g.quadraticCurveTo(6, -0.5, 6, 2.5); g.quadraticCurveTo(4, 3.4, 3, 1.5); g.closePath(); g.fillStyle = '#b05a68'; g.fill();
      eye(g, 4.5, -8.6, 1.1, st, { animal: 1, iris: '#1a0604', socket: 'rgba(0,0,0,0.2)', glow: !st.dead });
      if (!st.dead) brow(g, 4.6, -10.3, 4, 0.55, 'rgba(40,10,10,1)', 1.1);
    },
    proj: { kind: 'drumstick', name: 'LEFTOVERS' }, sp2: { kind: 'rush', name: 'TURKEY TROT' },
    fatal: { id: 'turkey', name: 'CARVED' }, alt: { id: 'nest', name: 'NEST' }
  };

  // ---------- COKE WOLFE: a werewolf in a white 80s suit with a nose habit ----------
  const WF = '#6a5a4a', WFD = '#3a3028', WS = '#ece8de';
  const wolfe = {
    id: 'wolfe', name: 'COKE WOLFE', short: 'WOLFE', him: 'HIM', k: 1.08, paws: true, claws: true, skull: 'raccoon', skullK: 1.25,
    bio: 'Came up in a white suit and never came down. Full moon every night if you bring enough powder.',
    bicep: 0.3, calf: 0.12,
    d: dims({ thigh: 29, shin: 28, torso: 37, neck: 5, upper: 22, fore: 21, hipW: 11, shW: 17, chest: 16, belly: 11, back: 12, thighR: 7.4, kneeR: 4.8, shR: 6.6, elbowR: 4.6, wristR: 3.8, fist: 4.6, footL: 13 }),
    col: { torso: WS, armU: WS, armL: WS, cuff: WF, hand: WFD, legU: WS, legL: WS, foot: '#b89a70', neck: WF },
    mat: { torso: 'suit', armU: 'suit', armL: 'suit', legU: 'suit', legL: 'suit', neck: 'fur' },
    stats: { speed: 1.1, power: 1.04, weight: 1.0 },
    torsoDetail(g, d, st, L) {
      // pastel tee under the open jacket, lapels, a little vial on a chain
      R.poly(g, [[d.shW * 0.0, -L * 1.02], [d.shW * 0.9, -L * 1.02], [d.shW * 0.6, -L * 0.1], [d.shW * 0.1, -L * 0.1]], '#e8a0b8');
      g.fillStyle = 'rgba(80,40,30,0.5)'; for (let i = 0; i < 9; i++) g.fillRect(d.shW * 0.25 + (i % 3) * 2.5, -L * 0.98 + ((i / 3) | 0) * 2, 1.2, 1.6);
      R.poly(g, [[d.shW * 0.0, -L * 1.02], [d.shW * 0.25, -L * 0.3], [d.shW * 0.12, -L * 0.75]], '#d8d2c4');
      R.poly(g, [[d.shW * 0.9, -L * 1.02], [d.shW * 0.62, -L * 0.3], [d.shW * 1.0, -L * 0.72]], '#d8d2c4');
      R.line(g, d.shW * 0.3, -L * 0.98, d.shW * 0.5, -L * 0.62, '#d8b040', 0.7); R.line(g, d.shW * 0.7, -L * 0.98, d.shW * 0.5, -L * 0.62, '#d8b040', 0.7);
      g.fillStyle = '#c8c8d0'; g.fillRect(d.shW * 0.46, -L * 0.63, 2.4, 4.5); g.fillStyle = '#f8f8f8'; g.fillRect(d.shW * 0.48, -L * 0.6, 1.6, 2.6);
      g.fillStyle = '#d8d2c4'; g.fillRect(d.shW * 0.55, -L * 0.25, 1.6, 1.6);
    },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 3) * 0.15;
      let p = [J.hip[0] - d.back * 0.8, J.hip[1] - 2];
      for (let i = 0; i < 7; i++) { const a = PI * 0.68 + i * 0.1 + w * i, q = R.add(p, R.dir(a, 6.5 * d.k)); R.seg(g, p, q, (5 + Math.sin(i / 6 * PI) * 3.4) * d.k, (5 + Math.sin((i + 1) / 6 * PI) * 3.4) * d.k, i >= 5 ? '#2a221c' : WF, 'fur', { seed: 450 + i }); p = q; }
    },
    head(g, st) {
      const jaw = Math.max(0, st.jaw || 0);
      R.poly(g, [[-4, -18], [-7, -33], [1, -21]], WFD);
      // skull and long snout
      g.beginPath(); g.moveTo(-8, -3); g.bezierCurveTo(-11, -14, -6, -24, 3, -22); g.quadraticCurveTo(8, -20, 12, -15); g.quadraticCurveTo(18, -13, 22, -11.5);
      g.quadraticCurveTo(23.2, -10, 22, -8.6); g.quadraticCurveTo(16, -6.5, 11, -5.5 + jaw * 0); g.quadraticCurveTo(4, -1, -2, 1); g.quadraticCurveTo(-6, 1, -8, -3); g.closePath();
      fillLit(g, WF, 4, -12, 14, 0.25, -0.6);
      g.save(); g.clip(); strokes(g, 4, -12, 14, 11, 140, 31, -0.4, 2.6, 0.32, 0.22);
      g.fillStyle = 'rgba(200,185,160,0.6)'; g.beginPath(); g.ellipse(15, -8.4, 7.5, 2.8, -0.12, 0, PI * 2); g.fill(); g.restore();
      // lower jaw drops open for howls and bites
      g.save(); g.translate(10, -6); g.rotate(jaw * 0.55);
      g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(4, 2.5, 11, 0.5); g.quadraticCurveTo(10.5, 2.6, 6, 3.6); g.quadraticCurveTo(-2, 4.5, -7, 2); g.closePath(); fillLit(g, sh(WF, 0.08), 2, 2, 8);
      g.fillStyle = '#efe8d4'; for (let i = 0; i < 3; i++) R.poly(g, [[3 + i * 2.6, 0.2], [4.2 + i * 2.6, 0.2], [3.6 + i * 2.6, -1.6]], '#efe8d4');
      g.restore();
      if (jaw > 0.1) { g.fillStyle = '#3a0608'; g.beginPath(); g.moveTo(5, -6); g.lineTo(21, -8.8); g.lineTo(18 - jaw * 2, -4 + jaw * 4); g.lineTo(6, -3); g.closePath(); g.fill(); }
      // fangs
      R.poly(g, [[16.5, -8.4], [17.8, -8.6], [17.2, -5.6]], '#f4eedc'); R.poly(g, [[12, -7.6], [13.2, -7.8], [12.7, -5.4]], '#f4eedc');
      R.poly(g, [[3, -20], [6, -35], [10, -18]], WF); R.poly(g, [[5, -21], [6.4, -31], [8.4, -19.5]], '#8a5a52');
      fringe(g, 0, -9, 10, 10, PI * 0.35, PI * 1.25, 18, WFD, 3.4, 9);
      // the nose, dusted white, and the nosebleed
      R.ball(g, 22, -10.6, 1.9, '#0c0808');
      g.fillStyle = '#fafafa'; R.srand(4); for (let i = 0; i < 12; i++) g.fillRect(19 + R.rr() * 5, -11.5 + R.rr() * 4, 0.9, 0.9);
      if (!st.dead) { g.fillStyle = '#a00010'; g.fillRect(21.4, -9, 0.9, 2.2 + Math.abs(Math.sin((st.t || 0) * 1.3)) * 1.5); }
      eye(g, 9.5, -15, 1.6, st, { animal: 1, iris: '#e8c020', slit: 1, glow: !st.dead, socket: 'rgba(20,10,0,0.4)' });
      if (!st.dead) brow(g, 9.5, -17.4, 5, 0.4, 'rgba(20,12,6,1)', 1.5);
    },
    proj: { kind: 'howl', name: 'HOWL' }, sp2: { kind: 'blow', name: 'NOSE CANDY' },
    fatal: { id: 'wolfe', name: 'FULL MOON' }
  };

  // ---------- EAST END EM: Muncie author, fashion editor, globetrotter ----------
  const EMD = '#1f5a52', EMS = '#ecc6aa', GLOVE = '#f0ece2';
  const em = {
    id: 'em', name: 'EAST END EM', short: 'EAST END EM', him: 'HER', k: 0.98,
    bio: 'Born in Muncie\'s East End in 1899. Fashion editor, globetrotter, best-selling author. Her chops leave paper cuts to the bone.',
    bicep: 0.12, calf: 0.25,
    d: dims({ thigh: 27, shin: 26, torso: 33, upper: 19, fore: 18, hipW: 11.5, shW: 13, chest: 13, belly: 10, back: 10, thighR: 6.8, kneeR: 4.2, ankleR: 3, shR: 5, elbowR: 3.4, wristR: 2.8, fist: 3.5, footL: 11 }),
    col: { torso: EMD, armU: EMD, armL: GLOVE, hand: GLOVE, legU: '#d4a890', legL: '#d4a890', foot: '#2a1a12', neck: EMS },
    mat: { torso: 'cloth', armU: 'cloth', armL: 'cloth', legU: 'skin', legL: 'skin' },
    stats: { speed: 1.08, power: 0.94, weight: 0.88 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.12, -L * 1.03], [d.shW * 0.78, -L * 1.03], [d.shW * 0.45, -L * 0.8]], EMS);
      // long rope of pearls
      g.fillStyle = '#f4efe4';
      for (let i = 0; i < 16; i++) { const t = i / 15, x = d.shW * (0.18 + 0.5 * Math.sin(t * PI) * 0.9 + t * 0.1), y = -L * (1.0 - Math.sin(t * PI) * 0.55); g.beginPath(); g.arc(x, y, 0.95, 0, PI * 2); g.fill(); }
      // dropped waist sash with a bow
      g.fillStyle = sh(EMD, -0.35); g.fillRect(-d.back * 1.3, -L * 0.24, d.back * 1.3 + d.belly * 1.3, 4);
      R.poly(g, [[d.belly * 0.4, -L * 0.22], [d.belly * 1.1, -L * 0.32], [d.belly * 1.0, -L * 0.12]], sh(EMD, -0.2));
    },
    skirt(g, d, J) {
      const ux = J.sh[0] - J.hip[0], uy = J.sh[1] - J.hip[1], L = Math.hypot(ux, uy) || 1, u = [ux / L, uy / L], n = [-u[1], u[0]];
      const at = (p, s, t) => [p[0] + n[0] * s + u[0] * t, p[1] + n[1] * s + u[1] * t];
      const wF = at(J.hip, d.hipW * 1.2, 5), wB = at(J.hip, -d.back * 1.25, 5);
      let hA = R.lerp2(J.hip, J.LF.knee, 1.12), hB = R.lerp2(J.hip, J.LB.knee, 1.12);
      const pr = p => (p[0] - J.hip[0]) * n[0] + (p[1] - J.hip[1]) * n[1];
      if (pr(hA) < pr(hB)) [hA, hB] = [hB, hA];
      const gap = pr(hA) - pr(hB), need = d.hipW * 2.4;
      if (gap < need) { const e = (need - gap) / 2; hA = [hA[0] + n[0] * e, hA[1] + n[1] * e]; hB = [hB[0] - n[0] * e, hB[1] - n[1] * e]; }
      hA = [hA[0] + n[0] * 3, hA[1] + n[1] * 3]; hB = [hB[0] - n[0] * 3, hB[1] - n[1] * 3];
      const mid = R.lerp2(hA, hB, 0.5);
      g.beginPath(); g.moveTo(...wB); g.lineTo(...wF); g.lineTo(...hA); g.quadraticCurveTo(mid[0] - u[0] * 3, mid[1] - u[1] * 3, ...hB); g.closePath();
      g.fillStyle = lit(g, mid[0], (mid[1] + J.hip[1]) / 2, 18, EMD, 0.2, -0.55); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 0.8;
      for (let i = 1; i < 5; i++) { const t = i / 5, a = R.lerp2(wB, wF, t), b = R.lerp2(hB, hA, t); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
      R.line(g, hA[0], hA[1], hB[0], hB[1], sh(EMD, -0.4), 1.2);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: EMS, chin: 0.3, nose: -0.4, eyeC: '#3a2a1a', browC: 'rgba(30,15,10,0.95)', cleanJaw: 1,
        back(g) { g.beginPath(); g.moveTo(-7, -2); g.bezierCurveTo(-12, -10, -10, -22, -2, -24); g.lineTo(2, -20); g.quadraticCurveTo(-3, -12, -1, -2); g.closePath(); fillLit(g, '#1e1410', -5, -12, 9, 0.15, -0.6); },
        front(g) {
          // finger-waved bob at the cheek, cloche hat pulled down to the brows
          g.beginPath(); g.moveTo(-4, -3); g.quadraticCurveTo(-6, -12, -1, -16); g.quadraticCurveTo(3, -15, 3.5, -12); g.quadraticCurveTo(0.5, -9, 1.5, -3.5); g.closePath(); fillLit(g, '#241812', 0, -10, 7, 0.2, -0.6);
          R.line(g, -2, -12, 1.5, -13, 'rgba(255,255,255,0.18)', 0.6); R.line(g, -2.5, -8, 0.5, -9, 'rgba(255,255,255,0.18)', 0.6);
          g.beginPath(); g.moveTo(-10, -12); g.bezierCurveTo(-12, -24, -4, -31, 4, -30.5); g.bezierCurveTo(11, -30, 14, -24, 13.5, -16.4); g.quadraticCurveTo(6, -17.4, -1, -15); g.quadraticCurveTo(-6, -13, -10, -12); g.closePath();
          fillLit(g, '#6a2638', 3, -24, 13, 0.25, -0.55);
          g.fillStyle = '#1a0a10'; g.beginPath(); g.moveTo(-10.5, -15); g.quadraticCurveTo(2, -20, 13.6, -18.8); g.lineTo(13.6, -17); g.quadraticCurveTo(2, -18, -10.5, -13); g.fill();
          R.ball(g, -6, -17.5, 2.2, '#e8d0a0'); R.ball(g, -6, -17.5, 1, '#b08030');
          R.ball(g, -0.5, -7.5, 1.1, '#f4efe4');
        },
        mouth(g) {
          if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10.3, -4.4, 1.3, 1.1, 0, 0, PI * 2); g.fill(); g.fillStyle = '#8a0010'; g.fillRect(9.8, -3.6, 1.1, 5); return; }
          g.fillStyle = '#a8142a'; g.beginPath(); g.moveTo(8.6, -5.3); g.quadraticCurveTo(10, -6.2, 11.3, -5.1); g.quadraticCurveTo(10, -3.9, 8.6, -5.3); g.fill();
          R.line(g, 8.6, -5.2, 11.3, -5.1, '#4a0410', 0.5);
        }
      });
    },
    proj: { kind: 'book', name: 'HARDCOVER' }, sp2: { kind: 'flurry', name: 'PAPER CUT' },
    fatal: { id: 'em', name: 'FIRST EDITION' }
  };

  // ---------- TIN MAN: the sheet-metal landmark, hollow chest and all ----------
  const TM = '#c2c6ce', TMD = '#7a808a';
  const tinman = {
    id: 'tinman', name: 'TIN MAN', short: 'TIN MAN', him: 'HIM', k: 1.12, bicep: 0.05, calf: 0.05,
    bio: 'Duct pipe, rivets and a painted-on smile. His chest is hollow and he wants it filled. With yours.',
    d: dims({ thigh: 26, shin: 25, torso: 38, neck: 3, upper: 20, fore: 19, hipW: 17, shW: 18, chest: 22, belly: 22, back: 20, thighR: 8, kneeR: 7.6, ankleR: 7, shR: 7.6, elbowR: 6.6, wristR: 6, fist: 6.6, footL: 15, footH: 7 }),
    col: { torso: TM, armU: TM, armL: TM, hand: sh(TM, -0.08), legU: TM, legL: TM, foot: sh(TM, -0.12), neck: TMD },
    mat: { torso: 'metal', armU: 'metal', armL: 'metal', legU: 'metal', legL: 'metal', neck: 'metal' },
    stats: { speed: 0.9, power: 1.12, weight: 1.3 },
    torsoDetail(g, d, st, L) {
      // barrel body: rolled rims top and bottom, a riveted seam and a long shine
      for (const y of [-L * 0.97, -L * 0.07]) { g.fillStyle = sh(TM, -0.35); g.fillRect(-d.back * 1.4, y - 2.2, d.back * 1.4 + d.belly * 1.4, 4.4); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-d.back * 1.4, y - 2.2, d.back * 1.4 + d.belly * 1.4, 1); g.fillStyle = '#5a606a'; for (let i = -6; i < 8; i++) g.fillRect(i * 3.6, y - 0.5, 1.1, 1.1); }
      g.fillStyle = 'rgba(70,74,84,0.55)'; g.fillRect(-d.back * 0.3, -L * 0.94, 1, L * 0.86); for (let i = 0; i < 9; i++) g.fillRect(-d.back * 0.3 - 0.6, -L * 0.9 + i * L * 0.1, 2.2, 1.1);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(d.belly * 0.35, -L * 0.92, 3, L * 0.82);
    },
    head(g, st) {
      const jaw = st.jaw || 0;
      // a can for a head, seen from the side
      g.beginPath(); g.moveTo(-7, -1); g.lineTo(-7, -22); g.quadraticCurveTo(2, -24.5, 11, -22); g.lineTo(11, -1); g.quadraticCurveTo(2, 1.5, -7, -1); g.closePath(); fillLit(g, TM, 5, -12, 14, 0.35, -0.5);
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(6.5, -21, 1.6, 19);
      R.line(g, -7, -3.5, 11, -3.5, 'rgba(60,64,74,0.6)', 0.8); g.fillStyle = '#5a606a'; for (let i = 0; i < 5; i++) g.fillRect(-5 + i * 3.6, -4, 1, 1);
      // painted face: dot eye, cone nose, smile
      if (st.dead || st.pd) { R.line(g, 6.4, -15.4, 8.8, -13, '#1a1a1e', 0.9); R.line(g, 6.4, -13, 8.8, -15.4, '#1a1a1e', 0.9); }
      else { R.ball(g, 7.6, -14.2, 1.25, '#1a1a1e'); R.line(g, 5.6, -17, 9.6, -16.6, '#2a2a2e', 0.9); }
      g.beginPath(); g.moveTo(10.6, -13.6); g.lineTo(16, -9.6); g.lineTo(10.6, -8); g.closePath(); fillLit(g, TM, 12, -11, 5, 0.3, -0.5);
      if (jaw > 0.2 || st.dead) { g.fillStyle = '#141416'; g.beginPath(); g.ellipse(9, -5.4 + jaw, 2.4, 0.8 + jaw * 1.6, 0, 0, PI * 2); g.fill(); }
      else { g.strokeStyle = '#2a2a2e'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(5.4, -6.4); g.quadraticCurveTo(8.4, -3.8, 10.8, -6.2); g.stroke(); }
      // the hat: wide flat brim, low round crown
      g.beginPath(); g.ellipse(2, -23, 15.5, 2.6, -0.04, 0, PI * 2); fillLit(g, TM, 4, -24, 15, 0.3, -0.5);
      g.beginPath(); g.moveTo(-5.5, -23.4); g.quadraticCurveTo(-6, -31.5, 2, -32); g.quadraticCurveTo(10, -31.5, 9.5, -23.4); g.closePath(); fillLit(g, TM, 3, -28, 8, 0.35, -0.5);
      R.line(g, -5.6, -25.4, 9.6, -25.4, 'rgba(60,64,74,0.7)', 1.1);
    },
    proj: { kind: 'oil', name: 'OIL SLICK' }, sp2: { kind: 'rush', name: 'TIN CAN CHARGE' },
    fatal: { id: 'tinman', name: 'HEARTLESS' }
  };

  // ---------- TIM BUNYON: the giant lumberjack ----------
  const BY = '#e6c02a', BJ = '#2a4a78', BSK = '#e6c4a4', BRD = '#141010', BCAP = '#b8161c';
  const bunyon = {
    id: 'bunyon', name: 'TIM BUNYON', short: 'BUNYON', him: 'HIM', k: 1.3, bicep: 0.42, calf: 0.35, sock: '#c0181c', sockLow: true,
    bio: 'Yellow shirt, black beard, an axe the size of a canoe. Stood by the road for decades. You look like kindling.',
    d: dims({ thigh: 30, shin: 29, torso: 38, neck: 4, upper: 22, fore: 21, hipW: 14, shW: 19, chest: 19, belly: 16, back: 14, thighR: 9, kneeR: 6, ankleR: 4.6, shR: 7.6, elbowR: 5.6, wristR: 4.6, fist: 5.6, footL: 15, footH: 5.5 }),
    col: { torso: BY, armU: BY, armL: BSK, hand: BSK, legU: BJ, legL: BJ, foot: '#4a3626', neck: BSK },
    mat: { torso: 'cloth', armU: 'cloth', armL: 'skin', legU: 'denim', legL: 'denim' },
    stats: { speed: 0.95, power: 1.0, weight: 1.1 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.1, -L * 1.03], [d.shW * 0.75, -L * 1.03], [d.shW * 0.45, -L * 0.86]], BSK);
      R.poly(g, [[d.shW * 0.12, -L * 1.03], [d.shW * 0.45, -L * 0.86], [d.shW * 0.2, -L * 0.82]], sh(BY, -0.15));
      R.line(g, d.shW * 0.5, -L * 0.86, d.shW * 0.5, -L * 0.06, 'rgba(120,90,0,0.6)', 0.8);
      g.fillStyle = '#4a3010'; for (let i = 0; i < 5; i++) g.fillRect(d.shW * 0.42, -L * 0.8 + i * 7, 1.6, 1.6);
      g.strokeStyle = 'rgba(120,90,0,0.55)'; g.lineWidth = 0.8; g.strokeRect(d.shW * 0.05, -L * 0.74, 7, 6);
      g.fillStyle = '#b81820'; g.fillRect(-d.hipW * 1.3, -4, d.hipW * 2.8, 3.4); g.fillStyle = '#d8c060'; g.fillRect(d.hipW * 0.6, -4.4, 3, 4.2);
    },
    backHand(g, d, J, st) {
      if (!st.axe) return;
      // the axe: long pale handle and a heavy dark head
      const w = J.AB.wr, ua = R.dir(J.AB.a2 + PI / 2, 1), u = ua[1] >= 0 ? ua : [-ua[0], -ua[1]], n = [-u[1], u[0]], k = d.k, L = 40 * k;
      const a = [w[0] - u[0] * 8 * k, w[1] - u[1] * 8 * k], b = [w[0] + u[0] * L, w[1] + u[1] * L];
      R.line(g, a[0], a[1], b[0], b[1], '#5a4630', 3.4 * k); R.line(g, a[0], a[1], b[0], b[1], '#e8dcc0', 2.4 * k);
      const h0 = [b[0] - u[0] * 3 * k, b[1] - u[1] * 3 * k];
      g.fillStyle = '#2a2a2e'; g.beginPath(); g.moveTo(h0[0] - n[0] * 3 * k, h0[1] - n[1] * 3 * k); g.lineTo(h0[0] + n[0] * 11 * k + u[0] * 5 * k, h0[1] + n[1] * 11 * k + u[1] * 5 * k); g.lineTo(h0[0] + n[0] * 11 * k - u[0] * 8 * k, h0[1] + n[1] * 11 * k - u[1] * 8 * k); g.lineTo(h0[0] - n[0] * 3 * k - u[0] * 6 * k, h0[1] - n[1] * 3 * k - u[1] * 6 * k); g.closePath(); g.fill();
      R.line(g, h0[0] + n[0] * 11 * k + u[0] * 5 * k, h0[1] + n[1] * 11 * k + u[1] * 5 * k, h0[0] + n[0] * 11 * k - u[0] * 8 * k, h0[1] + n[1] * 11 * k - u[1] * 8 * k, '#d8dce4', 1.3 * k);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: BSK, eyeC: '#2a1a10', browC: 'rgba(10,5,5,0.95)', nose: 0.6, chin: 1,
        back(g) { g.beginPath(); g.ellipse(-3, -13, 7, 10, 0, 0, PI * 2); fillLit(g, BRD, -3, -13, 10, 0.1, -0.6); },
        front(g) {
          // red knit cap pulled down to the brows
          g.beginPath(); g.moveTo(-9, -15); g.bezierCurveTo(-11, -27, -3, -33, 4, -32.5); g.bezierCurveTo(11, -32, 13, -25, 12.2, -18.5); g.quadraticCurveTo(2, -20.5, -9, -15); g.closePath(); fillLit(g, BCAP, 2, -25, 13, 0.25, -0.55);
          g.save(); g.clip(); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 0.6; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(-9 + i * 2.4, -16); g.lineTo(-6 + i * 2.2, -32); g.stroke(); } g.restore();
          g.fillStyle = sh(BCAP, -0.25); g.beginPath(); g.moveTo(-9.5, -17.5); g.quadraticCurveTo(2, -22.5, 12.6, -20.5); g.lineTo(12.4, -18); g.quadraticCurveTo(2, -20, -9, -14.6); g.fill();
        },
        beard(g) {
          g.beginPath(); g.moveTo(-3, -10); g.quadraticCurveTo(-4, 4, 4, 6.5); g.quadraticCurveTo(12, 6, 12.6, -3.5); g.lineTo(12, -5.6); g.quadraticCurveTo(10, -3.4, 7, -4.8); g.quadraticCurveTo(3, -4, 1, -10); g.closePath();
          fillLit(g, BRD, 4, -2, 10, 0.12, -0.6);
          g.save(); g.clip(); strokes(g, 4, -1, 9, 8, 90, 31, 1.4, 2.2, 0.5, 0.12); g.restore();
          g.beginPath(); g.moveTo(7.6, -7); g.quadraticCurveTo(10.6, -8, 12.8, -6.2); g.quadraticCurveTo(10.6, -5.4, 7.6, -6); g.fillStyle = BRD; g.fill();
          if (st.dead) { g.fillStyle = '#8a0010'; g.fillRect(10, -5, 1.2, 6); }
        },
        mouth() {}
      });
    },
    proj: { kind: 'log', name: 'LOG TOSS' }, sp2: { kind: 'roll', name: 'LOG ROLL' },
    fatal: { id: 'bunyon', name: 'TIMBER' }
  };

  // ---------- BECKY HACK: Pimihsaahkwa, Myaamia, owner of the Hackley Reserve ----------
  // dress after documented Myaamia clothing of the 1820s: ribbonworked wool wrap skirt to below
  // the knee, matching leggings and flapped moccasins, a cloth blouse set with silver brooches
  const BKS = '#a86e4c', BKB = '#7a2a24', BKSK = '#1c1f3a', BKL = '#6a1414', BKM = '#a88458', RIB = ['#c8202a', '#e8c030', '#f0ece0', '#2a6a3a'];
  function ribbon(g, a, b, w, n0) {
    // a band of folded silk ribbon with a stepped geometric pattern between two points
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L], nn = [-u[1], u[0]];
    const q = (t, s) => [a[0] + u[0] * t + nn[0] * s, a[1] + u[1] * t + nn[1] * s];
    for (let r = 0; r < 3; r++) { const s0 = -w / 2 + r * w / 3; g.fillStyle = RIB[(r + (n0 || 0)) % 3]; g.beginPath(); g.moveTo(...q(0, s0)); g.lineTo(...q(L, s0)); g.lineTo(...q(L, s0 + w / 3)); g.lineTo(...q(0, s0 + w / 3)); g.fill(); }
    g.fillStyle = RIB[3]; for (let t = 2; t < L - 2; t += 5) { g.beginPath(); g.moveTo(...q(t, -w * 0.15)); g.lineTo(...q(t + 1.6, -w * 0.15)); g.lineTo(...q(t + 1.6, w * 0.15)); g.lineTo(...q(t, w * 0.15)); g.fill(); }
    g.fillStyle = '#e8ecf4'; for (let t = 4.5; t < L - 1; t += 10) { g.beginPath(); g.arc(...q(t, 0), 0.8, 0, PI * 2); g.fill(); }
  }
  function brooches(g, pts) { for (const [x, y] of pts) { g.fillStyle = '#d8dce6'; g.beginPath(); g.arc(x, y, 1.7, 0, PI * 2); g.fill(); g.fillStyle = '#7a808a'; g.beginPath(); g.arc(x, y, 0.7, 0, PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(x - 1, y - 1.2, 0.8, 0.8); } }
  const becky = {
    id: 'becky', name: 'BECKY HACK', short: 'BECKY', him: 'HER', k: 1.0, bicep: 0.15, calf: 0.25,
    bio: 'Pimihsaahkwa. Myaamia. In 1818 she owned the 672 acres that became Muncie. Get off her land.',
    d: dims({ thigh: 27, shin: 26, torso: 33, upper: 19, fore: 18, hipW: 12, shW: 13.5, chest: 13.5, belly: 10.5, back: 10.5, thighR: 7, kneeR: 4.4, ankleR: 3.4, shR: 5.2, elbowR: 3.6, wristR: 3, fist: 3.6, footL: 11.5 }),
    col: { torso: BKB, armU: BKB, armL: BKB, cuff: BKB, hand: BKS, legU: BKL, legL: BKL, foot: BKM, neck: BKS },
    mat: { torso: 'cloth', armU: 'cloth', armL: 'cloth', legU: 'cloth', legL: 'cloth' },
    stats: { speed: 1.1, power: 1.0, weight: 0.92 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[d.shW * 0.15, -L * 1.03], [d.shW * 0.72, -L * 1.03], [d.shW * 0.45, -L * 0.9]], BKS);
      g.fillStyle = 'rgba(240,200,160,0.3)'; R.srand(61); for (let i = 0; i < 40; i++) g.fillRect(-d.back + R.rr() * (d.back + d.belly) * 1.1, -L * (0.15 + R.rr() * 0.8), 0.8, 0.8);
      const pts = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) pts.push([d.shW * (0.05 + c * 0.32), -L * (0.84 - r * 0.15)]);
      brooches(g, pts);
    },
    skirt(g, d, J) {
      const ux = J.sh[0] - J.hip[0], uy = J.sh[1] - J.hip[1], L = Math.hypot(ux, uy) || 1, u = [ux / L, uy / L], n = [-u[1], u[0]];
      const at = (p, s, t) => [p[0] + n[0] * s + u[0] * t, p[1] + n[1] * s + u[1] * t];
      const wF = at(J.hip, d.hipW * 1.2, 5), wB = at(J.hip, -d.back * 1.25, 5);
      let hA = R.lerp2(J.hip, J.LF.knee, 1.22), hB = R.lerp2(J.hip, J.LB.knee, 1.22);
      const pr = p => (p[0] - J.hip[0]) * n[0] + (p[1] - J.hip[1]) * n[1];
      if (pr(hA) < pr(hB)) [hA, hB] = [hB, hA];
      const gap = pr(hA) - pr(hB), need = d.hipW * 2.4;
      if (gap < need) { const e = (need - gap) / 2; hA = [hA[0] + n[0] * e, hA[1] + n[1] * e]; hB = [hB[0] - n[0] * e, hB[1] - n[1] * e]; }
      hA = [hA[0] + n[0] * 3, hA[1] + n[1] * 3]; hB = [hB[0] - n[0] * 3, hB[1] - n[1] * 3];
      const mid = R.lerp2(hA, hB, 0.5);
      g.beginPath(); g.moveTo(...wB); g.lineTo(...wF); g.lineTo(...hA); g.quadraticCurveTo(mid[0] - u[0] * 3, mid[1] - u[1] * 3, ...hB); g.closePath();
      g.fillStyle = lit(g, mid[0], (mid[1] + J.hip[1]) / 2, 18, BKSK, 0.2, -0.55); g.fill();
      // the doubled-over wrap at the waist, ribbonwork along the hem and up the front edge
      R.line(g, wB[0], wB[1] - u[1] * 3, wF[0], wF[1] - u[1] * 3, sh(BKSK, 0.25), 2.4);
      const hemA = R.lerp2(hA, wF, 0.1), hemB = R.lerp2(hB, wB, 0.1);
      ribbon(g, hemB, hemA, 5, 0);
      ribbon(g, R.lerp2(wF, hA, 0.08), R.lerp2(wF, hA, 0.86), 4, 1);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: BKS, chin: 0.3, nose: 0.1, eyeC: '#1a0e08', browC: 'rgba(20,10,5,0.95)', cleanJaw: 1,
        back(g) { g.beginPath(); g.moveTo(-1, -27); g.bezierCurveTo(-12, -25, -12, -8, -11, 18); g.lineTo(-5, 20); g.quadraticCurveTo(-4, 4, -1, -4); g.closePath(); fillLit(g, '#141012', -6, -6, 16, 0.12, -0.6); },
        front(g) {
          // long plain hair, center part, pulled back behind the ear
          g.beginPath(); g.moveTo(-7.5, -6); g.bezierCurveTo(-10.5, -20, -4, -28.6, 3, -28.6); g.bezierCurveTo(9, -28.6, 11.6, -24, 11.1, -18.6); g.quadraticCurveTo(6, -22.4, 1, -20.6); g.quadraticCurveTo(-3, -18, -3.6, -8); g.closePath(); fillLit(g, '#18120f', 2, -22, 12, 0.18, -0.6);
          R.line(g, -2, -24.5, 5, -26.4, 'rgba(255,255,255,0.14)', 0.7);
          R.ball(g, -1.2, -6.6, 1.2, '#d8dce6'); g.fillStyle = '#c8ccd6'; g.beginPath(); g.moveTo(-2.2, -5.6); g.lineTo(-0.2, -5.6); g.lineTo(-1.2, -2.2); g.fill();
        },
        mouth(g) {
          if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10.3, -4.4, 1.3, 1.1, 0, 0, PI * 2); g.fill(); g.fillStyle = '#8a0010'; g.fillRect(9.8, -3.6, 1.1, 5); return; }
          R.line(g, 8.6, -5.1, 11.2, -5.2, 'rgba(90,30,20,0.85)', 0.8);
        }
      });
    },
    proj: { kind: 'shimmer', name: 'SHIMMER' }, sp2: { kind: 'slide', name: 'BLANKET SNARE' },
    fatal: { id: 'becky', name: 'LIGHTS OUT' }
  };

  // ---------- POSSUM: lives under your porch ----------
  const PG = '#bab6ae', PGD = '#2a2626', PWH = '#f0ece4', PK = '#e8a8a8';
  const possum = {
    id: 'possum', name: 'PETEY', short: 'PETEY', him: 'HIM', k: 1.0, paws: true, claws: true, skull: 'raccoon', skullK: 1.05, bicep: 0.25,
    bio: 'Fifty teeth and zero shame. Lives under your porch. Plays dead until you get close.',
    d: dims({ thigh: 20, shin: 19, torso: 32, neck: 2, upper: 17, fore: 16, hipW: 15, shW: 14, chest: 16, belly: 19, back: 15, thighR: 8.4, kneeR: 5.6, ankleR: 4, shR: 6.6, elbowR: 4.8, wristR: 3.8, fist: 4.2, footL: 12, footH: 4.4 }),
    col: { torso: PG, armU: PG, armL: PGD, hand: PK, legU: PG, legL: PGD, foot: PK, neck: PG },
    mat: { torso: 'fur', armU: 'fur', armL: 'fur', legU: 'fur', legL: 'fur', neck: 'fur' },
    stats: { speed: 1.08, power: 0.98, weight: 0.95 },
    torsoDetail(g, d, st, L) { g.fillStyle = 'rgba(245,240,230,0.45)'; g.beginPath(); g.ellipse(d.belly * 0.4, -L * 0.5, d.belly * 0.45, L * 0.38, 0, 0, PI * 2); g.fill(); strokes(g, 0, -L * 0.5, d.belly, L * 0.45, 70, 23, -1.7, 3, 0.35, 0.3); },
    tail(g, d, J, st) {
      // long, bare, pink and scaly
      const w = Math.sin((st.t || 0) * 2.5) * 0.12;
      let p = [J.hip[0] - d.back * 0.8, J.hip[1] - 1];
      for (let i = 0; i < 10; i++) { const a = PI * 0.55 - i * 0.13 + w * i * 0.3, q = R.add(p, R.dir(a, 5 * d.k)); R.seg(g, p, q, (3 - i * 0.24) * d.k, (2.8 - i * 0.24) * d.k, i < 2 ? PGD : PK, 'skin', { seed: 500 + i }); p = q; }
    },
    head(g, st) {
      const jaw = st.jaw || 0, pd = st.dead || st.pd;
      // round black ear with a pale rim
      g.beginPath(); g.ellipse(-3, -19, 3.8, 4.2, -0.2, 0, PI * 2); g.fillStyle = '#e8e0d8'; g.fill(); g.beginPath(); g.ellipse(-3, -18.6, 3.1, 3.5, -0.2, 0, PI * 2); g.fillStyle = '#141212'; g.fill();
      // lower jaw
      g.save(); g.translate(6, -4); g.rotate(jaw * 0.6);
      g.beginPath(); g.moveTo(-6, -1); g.quadraticCurveTo(6, 3, 15, -1.5); g.lineTo(14, -2.6); g.quadraticCurveTo(4, -1.4, -6, -3); g.closePath(); fillLit(g, PWH, 4, 0, 10, 0.2, -0.5);
      if (jaw > 0.15) { g.fillStyle = '#f4f0e4'; for (let i = 0; i < 8; i++) R.poly(g, [[-2 + i * 2, -2.4], [-0.8 + i * 2, -2.4], [-1.4 + i * 2, -4.6]], '#f4f0e4'); }
      g.restore();
      // long tapered white face, grizzled crown
      g.beginPath(); g.moveTo(-8, -5); g.bezierCurveTo(-9, -18, 0, -21, 6, -17); g.quadraticCurveTo(14, -11.5, 22, -7.8); g.quadraticCurveTo(23.5, -6.2, 21.6, -5.2); g.quadraticCurveTo(12, -3.6, 3, -2); g.quadraticCurveTo(-5, -0.5, -8, -5); g.closePath();
      fillLit(g, PWH, 6, -10, 14, 0.2, -0.45);
      g.save(); g.clip(); g.fillStyle = 'rgba(150,146,140,0.7)'; g.beginPath(); g.ellipse(-4, -12, 6.5, 9, 0, 0, PI * 2); g.fill(); strokes(g, -3, -12, 6, 8, 60, 41, -0.7, 2.2, 0.35, 0.25); g.restore();
      if (jaw > 0.15) { g.fillStyle = '#3a0a10'; g.beginPath(); g.moveTo(5, -4); g.lineTo(21, -5.6); g.lineTo(9, -2); g.fill(); g.fillStyle = '#f4f0e4'; for (let i = 0; i < 9; i++) R.poly(g, [[6 + i * 1.7, -4.2 + i * -0.15], [7.2 + i * 1.7, -4.3 - i * 0.15], [6.6 + i * 1.7, -2.2 - i * 0.12]], '#f4f0e4'); }
      else { R.line(g, 6, -3.2, 20.5, -5.4, 'rgba(40,20,20,0.7)', 0.7); g.fillStyle = '#f4f0e4'; R.poly(g, [[16, -4.6], [17.2, -4.8], [16.6, -2.8]], '#f4f0e4'); R.poly(g, [[12, -4], [13.2, -4.2], [12.6, -2.4]], '#f4f0e4'); }
      if (st.pd && !st.dead) { g.fillStyle = '#e07090'; g.beginPath(); g.ellipse(15, -2, 3, 1.4, 0.4, 0, PI * 2); g.fill(); }
      R.ball(g, 22, -6.6, 1.9, PK);
      if (pd) { R.line(g, 6.6, -13.6, 9.4, -11, '#141212', 0.9); R.line(g, 6.6, -11, 9.4, -13.6, '#141212', 0.9); }
      else { R.ball(g, 8, -12.4, 1.6, '#050505'); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(8.3, -13.2, 0.6, 0.6); }
      g.strokeStyle = 'rgba(250,250,245,0.7)'; g.lineWidth = 0.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(19, -6.4 + i); g.lineTo(28, -8.6 + i * 2.2); g.stroke(); }
    },
    proj: { kind: 'teeth', name: 'FIFTY TEETH' }, sp2: { kind: 'playdead', name: 'PLAY DEAD' },
    fatal: { id: 'possum', name: 'PLAYING POSSUM' }
  };

  // ---------- SLUM LORD: the landlord the black mold got into ----------
  const SLF = '#b88474', SLS = '#5a1a2a';
  const slumlord = {
    id: 'slumlord', name: 'SLUM LORD', short: 'SLUMLORD', him: 'HIM', k: 1.22, boss: true, bicep: 0.5, calf: 0.3,
    bio: 'Owns half the east side and fixes none of it. The black mold got into him, and he has never looked better. Just ask him.',
    d: dims({ thigh: 25, shin: 25, torso: 38, neck: 5, upper: 21, fore: 21, hipW: 15, shW: 18, chest: 19, belly: 23, back: 15, thighR: 9, kneeR: 6, ankleR: 4.2, shR: 7.4, elbowR: 6.5, wristR: 5, fist: 5.4 }),
    col: { torso: SLF, armU: SLS, armL: SLF, hand: '#b08470', legU: '#26262c', legL: '#26262c', foot: '#140c08', neck: SLF },
    mat: { torso: 'skin', armU: 'cloth', armL: 'skin', legU: 'suit', legL: 'suit' },
    stats: { speed: 0.96, power: 1.18, weight: 1.6, armor: 0.85 },
    behind(g, d, J, st) {
      // tumorous tentacles growing out of his back
      const t = st.t || 0, b = R.lerp2(J.hip, J.sh, 0.7);
      for (let i = 0; i < 5; i++) {
        let p = [b[0] - d.back * 0.7, b[1] - 8 + i * 8];
        for (let j = 0; j < 8; j++) { const a = PI * (0.62 + i * 0.13) + Math.sin(t * 2.4 + i * 2 + j * 0.7) * 0.45, q = R.add(p, R.dir(a, 7.5 * d.k)); R.seg(g, p, q, (5.4 - j * 0.6) * d.k, (4.8 - j * 0.6) * d.k, j % 2 ? '#a05a60' : '#b87a6c', 'skin', { seed: 500 + i * 7 + j }); if (j === 3) R.ball(g, q[0], q[1], 2.2 * d.k, '#c89a5a'); p = q; }
        R.ball(g, p[0], p[1], 2 * d.k, '#6a1a20'); R.ball(g, p[0], p[1], 0.9 * d.k, '#e8dcb8');
      }
    },
    torsoDetail(g, d, st, L) {
      const t = st.t || 0;
      // mottled mold, veins, boils
      R.srand(71);
      for (let i = 0; i < 14; i++) { g.fillStyle = R.rr() < 0.5 ? 'rgba(60,80,40,0.3)' : 'rgba(110,30,40,0.25)'; g.beginPath(); g.ellipse(-d.back + R.rr() * (d.back + d.belly), -R.rr() * L, 2 + R.rr() * 4, 1.5 + R.rr() * 3, R.rr() * 3, 0, PI * 2); g.fill(); }
      g.strokeStyle = 'rgba(80,20,60,0.45)'; g.lineWidth = 0.7; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-d.back * 0.5 + i * 5, -L * 0.1); g.quadraticCurveTo(i * 4, -L * 0.5, d.belly * 0.3 + i * 2, -L * 0.85); g.stroke(); }
      // raw, weeping patches where the skin gave up
      for (let i = 0; i < 5; i++) { R.srand(130 + i); const x = -d.back * 0.7 + R.rr() * (d.back + d.belly) * 0.95, y = -L * (0.1 + R.rr() * 0.85), rx = 3 + R.rr() * 5, ry = 2 + R.rr() * 4;
        g.fillStyle = '#7a1018'; g.beginPath(); g.ellipse(x, y, rx, ry, R.rr() * 3, 0, PI * 2); g.fill(); g.fillStyle = 'rgba(220,80,90,0.6)'; g.beginPath(); g.ellipse(x - 0.6, y - 0.6, rx * 0.5, ry * 0.4, 0, 0, PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x - 1, y - ry * 0.5, 1, 0.8); }
      // ribs showing through on the flank
      for (let i = 0; i < 4; i++) R.line(g, -d.back * 0.6, -L * (0.45 + i * 0.09), -d.back * 0.05, -L * (0.5 + i * 0.09), 'rgba(240,230,210,0.75)', 1.1);
      for (let i = 0; i < 9; i++) { R.srand(90 + i); const x = -d.back * 0.6 + R.rr() * (d.back + d.belly) * 0.95, y = -L * (0.1 + R.rr() * 0.8), r = 2.2 + R.rr() * 2.6 + Math.sin(t * 3 + i) * 0.4; R.ball(g, x, y, r, '#c89a5a'); R.ball(g, x + r * 0.2, y - r * 0.3, r * 0.45, '#e8d890'); g.fillStyle = 'rgba(255,250,200,0.7)'; g.fillRect(x - r * 0.3, y - r * 0.5, 1, 1); }
      // a gaping mouth across the gut that breathes, drools and gnashes
      const o = 2 + Math.max(0, Math.sin(t * 2.2)) * 4.5, mx = d.belly * 0.42, my = -L * 0.33;
      g.fillStyle = '#a85060'; g.beginPath(); g.ellipse(mx, my, 11, o + 2.2, 0.08, 0, PI * 2); g.fill();
      g.fillStyle = '#2a0204'; g.beginPath(); g.ellipse(mx, my, 9.5, o, 0.08, 0, PI * 2); g.fill();
      g.fillStyle = '#c04050'; g.beginPath(); g.ellipse(mx + 1, my + o * 0.4, 5, o * 0.4, 0, 0, PI * 2); g.fill();
      for (let i = 0; i < 8; i++) { R.poly(g, [[mx - 8.5 + i * 2.3, my - o], [mx - 7.4 + i * 2.3, my - o], [mx - 7.9 + i * 2.3, my - o + 2.2]], '#e8dcb8'); R.poly(g, [[mx - 8 + i * 2.3, my + o], [mx - 6.9 + i * 2.3, my + o], [mx - 7.4 + i * 2.3, my + o - 2.2]], '#e8dcb8'); }
      g.fillStyle = 'rgba(200,220,160,0.6)'; g.fillRect(mx + 3, my + o, 0.9, 3 + Math.abs(Math.sin(t * 1.7)) * 5);
      // an extra eye in the chest
      const ey = -L * 0.72;
      R.ball(g, d.belly * 0.15, ey, 3.4, '#ece0c8'); R.ball(g, d.belly * 0.15 + 1.2, ey, 1.7, '#5a7a2a'); R.ball(g, d.belly * 0.15 + 1.4, ey, 0.8, '#000');
      if (Math.sin(t * 0.9) > 0.95) { g.fillStyle = SLF; g.fillRect(d.belly * 0.15 - 3.6, ey - 3.6, 7.2, 7.2); }
      // the open silk shirt and the gold chains
      R.poly(g, [[-d.back * 1.2, -L * 1.05], [d.shW * 0.05, -L * 1.05], [-d.back * 0.6, -L * 0.15], [-d.back * 1.2, -L * 0.1]], SLS);
      g.strokeStyle = '#e0b040'; g.lineWidth = 1.1; g.beginPath(); g.arc(d.shW * 0.3, -L * 0.98, 8, 0.3, 2.6); g.stroke();
      g.lineWidth = 0.8; g.beginPath(); g.arc(d.shW * 0.3, -L * 0.98, 12, 0.4, 2.4); g.stroke();
      g.fillStyle = '#e0b040'; g.fillRect(d.shW * 0.2, -L * 0.8, 3, 3.6);
      g.fillStyle = '#1a1416'; g.fillRect(-d.hipW * 1.2, -3, d.hipW * 2.6, 3); g.fillStyle = '#d8b040'; g.fillRect(d.hipW * 0.5, -3.4, 3.4, 3.8);
    },
    backHand(g, d, J, st) {
      // a gilded hand mirror, never far from his face
      const w = J.AB.wr;
      g.save(); g.translate(w[0], w[1]); g.rotate(-0.5);
      g.fillStyle = '#c89830'; g.fillRect(-1.2, -2, 2.4, 9);
      g.beginPath(); g.ellipse(0, -8, 5.5, 7, 0, 0, PI * 2); g.fillStyle = '#c89830'; g.fill();
      g.beginPath(); g.ellipse(0, -8, 4.2, 5.6, 0, 0, PI * 2); g.fillStyle = st.cracked ? '#6a7a8a' : '#b8d0e0'; g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-2, -12, 1.2, 4);
      if (st.cracked) { R.line(g, -3, -12, 2, -4, '#222', 0.6); R.line(g, 2, -12, -2, -5, '#222', 0.6); }
      g.restore();
    },
    frontHand(g, d, J) { const w = J.AF.wr; R.ball(g, w[0] + 2, w[1] + 2, 1.6, '#e0b040'); R.ball(g, w[0] + 3.5, w[1] + 1, 1.3, '#e0b040'); },
    head(g, st) {
      humanHead(g, st, {
        skin: '#c8a08a', chin: 1.4, nose: 0.8, eyeC: '#4a5a2a', browC: 'rgba(20,10,5,0.95)', cleanJaw: 1,
        front(g) {
          // greasy hair, slicked straight back, comb tracks and shine
          g.beginPath(); g.moveTo(-6.5, -7); g.bezierCurveTo(-10, -20, -3, -28, 4, -27.8); g.bezierCurveTo(10, -27.6, 12.4, -24, 12, -20.5);
          g.quadraticCurveTo(7, -23, 2, -21.6); g.quadraticCurveTo(-2, -19.6, -3.6, -14); g.quadraticCurveTo(-4.4, -10, -4, -7); g.closePath();
          fillLit(g, '#14100c', 2, -22, 11, 0.45, -0.5);
          g.save(); g.clip(); strokes(g, 2, -22, 11, 6, 70, 41, PI + 0.08, 6, 0.5, 0.35);
          g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(4, -25.5, 6, 1.1, -0.05, 0, PI * 2); g.fill(); g.restore();
          // boils, a weeping sore, and a second little eye growing out of his cheek
          // a tumor the size of a second head bulging from the back of the skull, with its own mouth
          g.beginPath(); g.ellipse(-8, -14, 7.5, 9, -0.3, 0, PI * 2); fillLit(g, '#b88070', -8, -14, 9, 0.2, -0.6);
          g.fillStyle = '#7a1018'; g.beginPath(); g.ellipse(-9, -11, 3, 1.4 + Math.abs(Math.sin((st.t || 0) * 3)) * 1.2, 0.2, 0, PI * 2); g.fill();
          g.fillStyle = '#e8dcb8'; g.fillRect(-11, -12, 1, 1); g.fillRect(-9, -12.4, 1, 1); g.fillRect(-7.4, -12, 1, 1);
          R.ball(g, -6.5, -19, 1.6, '#ece0c8'); R.ball(g, -6.1, -19, 0.8, '#5a7a2a');
          R.ball(g, -2, -18.6, 2.6, '#b07a6a'); R.ball(g, -1.6, -19, 1.2, '#d8b070');
          g.fillStyle = '#7a1018'; g.beginPath(); g.ellipse(6, -2, 3, 2, 0.3, 0, PI * 2); g.fill();
          R.ball(g, 3.2, -6.5, 2.3, '#ece0c8'); R.ball(g, 4, -6.5, 1.1, '#5a7a2a'); R.ball(g, 4.2, -6.5, 0.5, '#000');
          g.fillStyle = 'rgba(120,160,60,0.6)'; g.fillRect(7, -3, 0.9, 3);
        },
        mouth(g) {
          if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10, -4.2, 1.6, 1.4, 0, 0, PI * 2); g.fill(); return; }
          // a smug, gold-toothed smirk
          g.fillStyle = '#2a0606'; g.beginPath(); g.moveTo(7, -5.4); g.quadraticCurveTo(10, -3.8, 12, -6.4); g.quadraticCurveTo(9.6, -5.2, 7, -5.4); g.fill();
          g.fillStyle = '#e0b040'; g.fillRect(9.6, -5.4, 1.2, 1); g.fillStyle = '#e8e0c8'; g.fillRect(10.9, -5.8, 0.9, 0.9);
        }
      });
    },
    proj: { kind: 'notice', name: 'EVICTION NOTICE' }, sp2: { kind: 'sneak', name: 'LATE FEE' },
    fatal: { id: 'slumlord', name: 'CONDEMNED' }
  };

  // ---------- OFC TINKLE: six-foot-three, two-fifty, thick neck, glass jaw ----------
  const NAVY = '#16161a', VEST = '#0b0b0d', TSK = '#f0c4a4';
  const tinkle = {
    id: 'tinkle', name: 'OFC TINKLE', short: 'TINKLE', him: 'HIM', k: 1.16, boss: true, noMatrix: true, plainFinish: true, bicep: 0.45, calf: 0.38,
    bio: 'He thinks he\'s a badass. He is a wimpy little bitch.',
    d: dims({ thigh: 26, shin: 25, torso: 36, upper: 21, fore: 20, hipW: 15, shW: 23, chest: 26, belly: 22, back: 17, thighR: 12, kneeR: 6.2, ankleR: 4, shR: 9.8, elbowR: 6.4, wristR: 4.6, fist: 5.2 }),
    col: { torso: NAVY, armU: NAVY, armL: TSK, hand: TSK, legU: NAVY, legL: NAVY, foot: '#0c0c0e', neck: TSK },
    mat: { torso: 'cloth', armU: 'cloth', armL: 'skin', legU: 'cloth', legL: 'cloth' },
    stats: { speed: 0.95, power: 0.85, weight: 1.35, frail: 3.2 },
    torsoDetail(g, d, st, L) {
      // flak vest over a black uniform, POLICE across the chest, a shoulder radio, a duty belt
      g.fillStyle = VEST; g.beginPath(); g.moveTo(-d.back * 1.1, -L * 0.98); g.lineTo(d.belly * 0.9, -L * 0.98); g.quadraticCurveTo(d.belly * 1.25, -L * 0.5, d.belly * 1.05, -L * 0.14); g.lineTo(-d.back * 1.1, -L * 0.14); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 0.8; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-d.back, -L * (0.14 + i * 0.2)); g.lineTo(d.belly, -L * (0.14 + i * 0.2)); g.stroke(); }
      g.save(); g.font = '400 5px Anton, Impact, sans-serif'; g.fillStyle = '#e8e8e8'; g.fillText('POLICE', d.belly * 0.05, -L * 0.62); g.restore();
      g.fillStyle = '#1e1e22'; g.fillRect(d.belly * 0.45, -L * 0.98, 4, 6); g.fillRect(d.belly * 0.55, -L * 1.06, 1, 4);
      g.strokeStyle = '#2a2a30'; g.lineWidth = 0.7; g.beginPath(); for (let i = 0; i < 8; i++) g.lineTo(d.belly * 0.5 + Math.sin(i * 2) * 1.2, -L * 0.9 + i * 2); g.stroke();
      g.fillStyle = '#d8b840'; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3, r = i % 2 ? 1.8 : 3; g.lineTo(-d.back * 0.3 + Math.cos(a) * r, -L * 0.8 + Math.sin(a) * r); } g.fill();
      g.fillStyle = '#0a0a0c'; g.fillRect(-d.hipW * 1.3, -6, d.hipW * 2.8, 6);
      g.fillStyle = '#26262a'; g.fillRect(-d.hipW * 0.9, -10, 6, 9); g.fillRect(d.hipW * 0.55, -9, 5, 8); g.fillStyle = '#c8c8d0'; g.fillRect(-d.hipW * 0.15, -5, 3, 3);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: TSK, chin: 1.8, nose: 0.5, eyeC: '#5a7aa8', browC: 'rgba(200,170,100,0.9)', cleanJaw: 1,
        front(g) {
          // high and tight: buzzed nearly to the skin on the sides, a flat little crop on top
          g.fillStyle = 'rgba(190,160,110,0.45)'; g.beginPath(); g.moveTo(-7.5, -8); g.quadraticCurveTo(-9.5, -16, -6, -21); g.lineTo(4, -22); g.quadraticCurveTo(-1, -15, -2.5, -8); g.closePath(); g.fill();
          g.beginPath(); g.moveTo(-6.5, -21.5); g.quadraticCurveTo(-4, -26.6, 3, -26.6); g.quadraticCurveTo(9, -26.2, 10.4, -22); g.quadraticCurveTo(3, -23, -6.5, -21.5); g.closePath(); fillLit(g, '#e0c070', 2, -24, 8, 0.3, -0.5);
          g.fillStyle = 'rgba(120,60,40,0.25)'; g.beginPath(); g.ellipse(4, -9, 4, 2.4, 0, 0, PI * 2); g.fill();
        },
        mouth(g) {
          if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10, -4.6, 1.4, 1.2, 0, 0, PI * 2); g.fill(); return; }
          g.fillStyle = '#4a1414'; g.beginPath(); g.moveTo(8, -4.8); g.quadraticCurveTo(10, -5.8, 12, -4.4); g.lineTo(8, -4.8); g.fill();
        }
      });
    },
    proj: { kind: 'spray', name: 'PEPPER SPRAY' }, sp2: { kind: 'rush', name: 'TACKLE' },
    fatal: { id: 'tinkle', name: 'USE OF FORCE' }
  };

  const FRONT = {
    tinman: {
      detail: (g, d, G) => {
        for (const y of [G.sY + 2, G.hipY - 3]) { g.fillStyle = sh(TM, -0.35); g.fillRect(-G.shx * 1.25, y - 2, G.shx * 2.5, 4); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-G.shx * 1.25, y - 2, G.shx * 2.5, 1); g.fillStyle = '#5a606a'; for (let x = -G.shx; x <= G.shx; x += 4) g.fillRect(x, y - 0.4, 1, 1); }
        g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(G.shx * 0.3, G.sY + 5, 3, G.hipY - G.sY - 10);
      },
      head(g, st) {
        const jaw = st.jaw || 0;
        g.beginPath(); g.moveTo(-9, -2); g.lineTo(-9, -22); g.quadraticCurveTo(0, -24.5, 9, -22); g.lineTo(9, -2); g.quadraticCurveTo(0, 0.5, -9, -2); g.closePath();
        g.fillStyle = (() => { const gr = g.createLinearGradient(-9, 0, 9, 0); gr.addColorStop(0, sh(TM, -0.45)); gr.addColorStop(0.55, sh(TM, 0.2)); gr.addColorStop(0.75, sh(TM, 0.35)); gr.addColorStop(1, sh(TM, -0.3)); return gr; })(); g.fill();
        R.line(g, -9, -4.4, 9, -4.4, 'rgba(60,64,74,0.6)', 0.8);
        if (st.dead) eyesF(g, st, 3.4, -14, 1.3); else for (const sd of [-1, 1]) R.ball(g, sd * 3.4, -14, 1.3, '#1a1a1e');
        g.beginPath(); g.moveTo(0, -12.6); g.lineTo(-1.8, -8.2); g.lineTo(1.8, -8.2); g.closePath(); g.fillStyle = sh(TM, -0.25); g.fill();
        if (jaw > 0.2) { g.fillStyle = '#141416'; g.beginPath(); g.ellipse(0, -5 + jaw, 3, 0.8 + jaw * 1.8, 0, 0, PI * 2); g.fill(); }
        else { g.strokeStyle = '#2a2a2e'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-4, -6); g.quadraticCurveTo(0, -2.6, 4, -6); g.stroke(); }
        g.beginPath(); g.ellipse(0, -22.6, 17, 3.2, 0, 0, PI * 2); g.fillStyle = (() => { const gr = g.createLinearGradient(-17, 0, 17, 0); gr.addColorStop(0, sh(TM, -0.4)); gr.addColorStop(0.6, sh(TM, 0.3)); gr.addColorStop(1, sh(TM, -0.3)); return gr; })(); g.fill();
        g.beginPath(); g.moveTo(-7.5, -23); g.quadraticCurveTo(-8, -31.5, 0, -32); g.quadraticCurveTo(8, -31.5, 7.5, -23); g.closePath(); fillLit(g, TM, 1, -28, 9, 0.35, -0.5);
        R.line(g, -7.6, -25, 7.6, -25, 'rgba(60,64,74,0.7)', 1.1);
      }
    },
    bunyon: {
      detail: (g, d, G) => { vNeck(g, G, BSK, 0.14); for (const sd of [-1, 1]) R.poly(g, [[sd * G.shx * 0.1, G.sY - 1], [sd * G.shx * 0.55, G.sY - 1], [sd * G.shx * 0.3, G.sY + 7]], sh(BY, -0.15));
        R.line(g, 0, G.sY + 5, 0, G.hipY - 3, 'rgba(120,90,0,0.6)', 0.8); g.fillStyle = '#4a3010'; for (let i = 0; i < 5; i++) g.fillRect(-0.8, G.sY + 8 + i * 7, 1.6, 1.6);
        g.strokeStyle = 'rgba(120,90,0,0.55)'; g.lineWidth = 0.8; g.strokeRect(-G.shx * 0.75, G.sY + 7, 7, 6); g.strokeRect(G.shx * 0.75 - 7, G.sY + 7, 7, 6);
        belt(g, G, '#b81820', '#d8c060'); },
      head(g, st) {
        humanFront(g, st, { skin: BSK, w: 9, chin: 2, eyeC: '#2a1a10', browC: 'rgba(10,5,5,0.95)',
          front(g, jaw) {
            g.beginPath(); g.moveTo(-9.4, -14); g.quadraticCurveTo(-10.4, -32, 0, -33); g.quadraticCurveTo(10.4, -32, 9.4, -14); g.quadraticCurveTo(0, -18.4, -9.4, -14); g.closePath(); fillLit(g, BCAP, 0, -25, 12, 0.25, -0.55);
            g.fillStyle = sh(BCAP, -0.25); g.beginPath(); g.moveTo(-9.6, -17.5); g.quadraticCurveTo(0, -21.5, 9.6, -17.5); g.lineTo(9.4, -14.6); g.quadraticCurveTo(0, -18.6, -9.4, -14.6); g.fill();
            g.beginPath(); g.moveTo(-9, -10); g.quadraticCurveTo(-9.6, 4, 0, 6.5); g.quadraticCurveTo(9.6, 4, 9, -10); g.quadraticCurveTo(6.4, -4, 3, -5.4); g.quadraticCurveTo(0, -6.2, -3, -5.4); g.quadraticCurveTo(-6.4, -4, -9, -10); g.closePath(); fillLit(g, BRD, 0, -2, 10, 0.12, -0.6);
            g.save(); g.clip(); strokes(g, 0, -1, 9, 7, 90, 33, 1.57, 2.2, 0.5, 0.12); g.restore();
            g.fillStyle = BRD; g.beginPath(); g.moveTo(-4, -6.6); g.quadraticCurveTo(0, -7.8, 4, -6.6); g.quadraticCurveTo(0, -5.4, -4, -6.6); g.fill();
            g.fillStyle = jaw > 0.2 ? '#2a0606' : 'rgba(140,50,50,0.9)'; g.beginPath(); g.ellipse(0, -4.4, 2.2, 0.5 + jaw * 1.6, 0, 0, PI * 2); g.fill();
          }, mouth() {} });
      }
    },
    becky: {
      detail: (g, d, G) => { R.poly(g, [[-G.shx * 0.4, G.sY - 1], [G.shx * 0.4, G.sY - 1], [0, G.sY + 4]], BKS);
        const pts = []; for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) pts.push([c * G.shx * 0.34, G.sY + 7 + r * 5.5]); brooches(g, pts); },
      skirt(g, d, G) { const kn = G.legs.map(L => L.knee); const w0 = d.hipW * 1.2, y0 = G.hipY - 4, y1 = Math.max(kn[0][1], kn[1][1]) + 9, x1 = Math.max(Math.abs(kn[0][0]), Math.abs(kn[1][0])) + d.kneeR + 4;
        g.beginPath(); g.moveTo(-w0, y0); g.lineTo(w0, y0); g.lineTo(x1, y1); g.quadraticCurveTo(0, y1 + 3, -x1, y1); g.closePath(); g.fillStyle = (() => { const gr = g.createLinearGradient(-x1, 0, x1, 0); gr.addColorStop(0, sh(BKSK, -0.4)); gr.addColorStop(0.6, sh(BKSK, 0.1)); gr.addColorStop(1, sh(BKSK, -0.15)); return gr; })(); g.fill();
        R.line(g, -w0, y0 + 1.5, w0, y0 + 1.5, sh(BKSK, 0.3), 2.4);
        ribbon(g, [-x1 + 1, y1 - 3], [x1 - 1, y1 - 3], 5, 0);
        ribbon(g, [w0 * 0.55, y0 + 3], [x1 * 0.62, y1 - 6], 4, 1); },
      head(g, st) {
        humanFront(g, st, { skin: BKS, w: 7.8, chin: 0.6, eyeC: '#1a0e08', browC: 'rgba(20,10,5,0.95)',
          back(g) { g.beginPath(); g.moveTo(-10, 14); g.bezierCurveTo(-13, -6, -12, -25, 0, -26); g.bezierCurveTo(12, -25, 13, -6, 10, 14); g.quadraticCurveTo(0, 10, -10, 14); g.closePath(); fillLit(g, '#141012', 0, -8, 16, 0.12, -0.6); },
          front(g) {
            for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 0.4, -26); g.quadraticCurveTo(sd * 9.5, -26, sd * 9.8, -12); g.quadraticCurveTo(sd * 7, -19, sd * 0.4, -21.5); g.closePath(); fillLit(g, '#18120f', sd * 5, -22, 8, 0.18, -0.6); }
            for (const sd of [-1, 1]) { R.ball(g, sd * 8.6, -7.4, 1.1, '#d8dce6'); g.fillStyle = '#c8ccd6'; g.beginPath(); g.moveTo(sd * 8.6 - 0.9, -6.6); g.lineTo(sd * 8.6 + 0.9, -6.6); g.lineTo(sd * 8.6, -3.4); g.fill(); }
          },
          mouth(g, jaw) { if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(0, -3.4, 1.6, 1.3, 0, 0, PI * 2); g.fill(); return; } g.fillStyle = jaw > 0.2 ? '#2a0606' : 'rgba(110,40,30,0.9)'; g.beginPath(); g.ellipse(0, -3.9, 2.2, 0.5 + jaw * 1.4, 0, 0, PI * 2); g.fill(); } });
      }
    },
    possum: {
      behind: (g, d, G, st) => frontTail(g, d, G, st, [PK, '#d89898'], 9, 5.5, 2.6, false),
      detail: (g, d, G) => { bellyPatch(g, G, 'rgba(245,240,230,0.5)', 0.6); },
      head(g, st) {
        const jaw = st.jaw || 0;
        for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 9.5, -22, 4.2, 4.6, sd * 0.3, 0, PI * 2); g.fillStyle = '#e8e0d8'; g.fill(); g.beginPath(); g.ellipse(sd * 9.5, -21.6, 3.4, 3.8, sd * 0.3, 0, PI * 2); g.fillStyle = '#141212'; g.fill(); }
        g.beginPath(); g.moveTo(-10, -14); g.quadraticCurveTo(-10, -26, 0, -26); g.quadraticCurveTo(10, -26, 10, -14); g.quadraticCurveTo(7, -4, 0, 1); g.quadraticCurveTo(-7, -4, -10, -14); g.closePath(); fillLit(g, PWH, 0, -14, 13, 0.2, -0.45);
        g.fillStyle = 'rgba(150,146,140,0.7)'; g.beginPath(); g.moveTo(-6, -25.5); g.quadraticCurveTo(0, -27, 6, -25.5); g.quadraticCurveTo(2, -18, 0, -16); g.quadraticCurveTo(-2, -18, -6, -25.5); g.fill();
        if (st.dead || st.pd) eyesF(g, st, 4.2, -14, 1.3); else for (const sd of [-1, 1]) { R.ball(g, sd * 4.2, -14.5, 1.5, '#050505'); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(sd * 4.2 + 0.3, -15.3, 0.6, 0.6); }
        if (jaw > 0.15) { g.fillStyle = '#3a0a10'; g.beginPath(); g.ellipse(0, -1 + jaw * 2, 4, 1 + jaw * 3.4, 0, 0, PI * 2); g.fill(); g.fillStyle = '#f4f0e4'; for (let i = -3; i <= 3; i++) { R.poly(g, [[i * 1.1 - 0.5, -1.4], [i * 1.1 + 0.5, -1.4], [i * 1.1, 0.4]], '#f4f0e4'); R.poly(g, [[i * 1.1 - 0.5, -0.6 + jaw * 6], [i * 1.1 + 0.5, -0.6 + jaw * 6], [i * 1.1, -2.2 + jaw * 6]], '#f4f0e4'); } }
        R.ball(g, 0, -1.6, 2, PK);
        for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) R.line(g, sd * 2.4, -2.2 + i * 0.8, sd * 12, -4 + i * 2, 'rgba(255,255,255,0.7)', 0.4);
      }
    },
    hippo: {
      detail: (g, d, G) => { bellyPatch(g, G, 'rgba(230,190,220,0.35)', 0.65); },
      head(g, st) {
        const jaw = st.jaw || 0;
        for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 9, -27, 3, 3.6, sd * 0.4, 0, PI * 2); fillLit(g, HP, sd * 9, -27, 4); g.fillStyle = '#c890b8'; g.beginPath(); g.ellipse(sd * 9, -26.6, 1.6, 2, sd * 0.4, 0, PI * 2); g.fill(); }
        g.beginPath(); g.ellipse(0, -17, 12, 11, 0, 0, PI * 2); fillLit(g, HP, 0, -17, 12, 0.25, -0.6);
        eyesF(g, st, 5, -22, 1.6, { animal: 1, iris: '#1a0a14' });
        // the big muzzle, with the mouth open as wide as jaw says
        g.fillStyle = '#2a0618'; g.beginPath(); g.ellipse(0, -2 + jaw * 3, 11, 2 + jaw * 6, 0, 0, PI * 2); g.fill();
        if (jaw > 0.2) { g.fillStyle = '#efe6d4'; for (const sd of [-1, 1]) R.poly(g, [[sd * 8, -3], [sd * 6.5, -3], [sd * 7.2, -3 + jaw * 4]], '#efe6d4'); g.fillStyle = '#c04060'; g.beginPath(); g.ellipse(0, 1 + jaw * 4, 5, jaw * 2.4, 0, 0, PI * 2); g.fill(); }
        g.beginPath(); g.ellipse(0, -8, 14, 7.5, 0, 0, PI * 2); fillLit(g, HPL, 0, -9, 14, 0.25, -0.5);
        for (const sd of [-1, 1]) { g.fillStyle = '#3a1a44'; g.beginPath(); g.ellipse(sd * 5, -11, 1.8, 1.2, sd * 0.3, 0, PI * 2); g.fill(); }
      }
    },
    painter: {
      detail: (g, d, G) => { vNeck(g, G, SKIN_L, 0.18); g.fillStyle = '#e8eef4'; for (let i = 0; i < 4; i++) g.fillRect(-0.6, G.sY + 8 + i * 7, 1.3, 1.3); R.line(g, 0, G.sY + 5, 0, G.hipY - 2, 'rgba(40,60,90,0.5)', 0.7); belt(g, G, '#2a1a10', '#b8a040'); },
      head(g, st) {
        humanFront(g, st, { skin: SKIN_L, eyeC: '#3a2a1a',
          back(g) { g.beginPath(); g.ellipse(0, -19, 17, 15.5, 0, 0, PI * 2); fillLit(g, '#34200f', 0, -19, 17, 0.15, -0.6); g.save(); g.clip(); curls(g, 0, -19, 17, 15.5, 460, 3); g.restore(); },
          front(g, jaw) {
            g.beginPath(); g.moveTo(-8.6, -14); g.quadraticCurveTo(-9, -26, 0, -27); g.quadraticCurveTo(9, -26, 8.6, -14); g.quadraticCurveTo(5, -21, 0, -21); g.quadraticCurveTo(-5, -21, -8.6, -14); g.closePath(); fillLit(g, '#3a2412', 0, -22, 10, 0.18, -0.6);
            g.save(); g.clip(); curls(g, 0, -22, 10, 6, 140, 5); g.restore();
            g.beginPath(); g.moveTo(-8, -9); g.quadraticCurveTo(-8.5, 1, 0, 3.5); g.quadraticCurveTo(8.5, 1, 8, -9); g.quadraticCurveTo(6, -4, 3, -5.2); g.quadraticCurveTo(0, -6, -3, -5.2); g.quadraticCurveTo(-6, -4, -8, -9); g.closePath(); fillLit(g, '#4a2e18', 0, -3, 9, 0.15, -0.6);
            g.save(); g.clip(); strokes(g, 0, -2, 8, 5, 80, 5, 1.57, 2, 0.4, 0.15); g.restore();
            g.fillStyle = '#3a2210'; g.beginPath(); g.moveTo(-3.4, -6.4); g.quadraticCurveTo(0, -7.4, 3.4, -6.4); g.quadraticCurveTo(0, -5.4, -3.4, -6.4); g.fill();
            g.fillStyle = jaw > 0.2 ? '#2a0606' : 'rgba(140,50,50,0.9)'; g.beginPath(); g.ellipse(0, -4.4, 2, 0.5 + jaw * 1.5, 0, 0, PI * 2); g.fill();
          }, mouth() {} });
      }
    },
    garf: {
      behind: (g, d, G, st) => frontTail(g, d, G, st, [OR, ORD], 7, 7.5, 5, false),
      detail: (g, d, G) => { bellyPatch(g, G, 'rgba(250,220,170,0.6)', 0.6); g.strokeStyle = 'rgba(150,60,0,0.45)'; g.lineWidth = 1.4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-G.shx, G.sY + 6 + i * 7); g.lineTo(-G.shx * 0.6, G.sY + 8 + i * 7); g.moveTo(G.shx, G.sY + 6 + i * 7); g.lineTo(G.shx * 0.6, G.sY + 8 + i * 7); g.stroke(); } },
      head(g, st) {
        const O = '#e08a2a', jaw = st.jaw || 0;
        for (const sd of [-1, 1]) { R.poly(g, [[sd * 4, -24], [sd * 12, -31], [sd * 12, -19]], O); R.poly(g, [[sd * 6, -23.5], [sd * 11, -28.5], [sd * 11, -21]], '#f0b0a0'); }
        g.beginPath(); g.ellipse(0, -14, 13, 12, 0, 0, PI * 2); fillLit(g, O, 0, -15, 13, 0.25, -0.6);
        g.strokeStyle = 'rgba(150,60,0,0.6)'; g.lineWidth = 1.3; for (const x of [-3, 0, 3]) { g.beginPath(); g.moveTo(x, -26); g.lineTo(x * 0.8, -20); g.stroke(); }
        g.fillStyle = '#f8e8cc'; g.beginPath(); g.ellipse(-3.2, -6.5, 4, 3.2, 0, 0, PI * 2); g.ellipse(3.2, -6.5, 4, 3.2, 0, 0, PI * 2); g.fill();
        if (!st.dead) for (const sd of [-1, 1]) { g.fillStyle = '#e8e030'; g.beginPath(); g.ellipse(sd * 4.6, -14, 2.8, 2.2, 0, 0, PI * 2); g.fill(); g.fillStyle = '#0a0a04'; g.fillRect(sd * 4.6 - 0.5, -15.8, 1, 3.6); g.fillStyle = O; g.fillRect(sd * 4.6 - 3, -16.6, 6, 1.6); }
        else eyesF(g, st, 4.6, -14, 2);
        R.poly(g, [[-1.6, -9.5], [1.6, -9.5], [0, -7.6]], '#e86a7a');
        if (jaw > 0.25) { g.fillStyle = '#3a0608'; g.beginPath(); g.ellipse(0, -3.5 + jaw, 3, 1 + jaw * 3, 0, 0, PI * 2); g.fill(); g.fillStyle = '#e86a7a'; g.beginPath(); g.ellipse(0, -1 + jaw * 2.4, 2, jaw * 1.4, 0, 0, PI * 2); g.fill(); }
        for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) R.line(g, sd * 5, -6.5 + i, sd * 15, -8 + i * 2, 'rgba(255,255,255,0.7)', 0.4);
      }
    },
    host: {
      detail: (g, d, G) => { vNeck(g, G, '#e8e8e4', 0.45); R.poly(g, [[-1.5, G.sY], [1.5, G.sY], [2, G.sY + 16], [0, G.sY + 19], [-2, G.sY + 16]], '#2a3a7a'); R.poly(g, [[-G.shx * 0.5, G.sY - 1], [-0.5, G.sY + (G.hipY - G.sY) * 0.5], [-G.shx * 0.8, G.sY + 8]], '#3a3e48'); R.poly(g, [[G.shx * 0.5, G.sY - 1], [0.5, G.sY + (G.hipY - G.sY) * 0.5], [G.shx * 0.8, G.sY + 8]], '#3a3e48'); g.fillStyle = '#1a1c22'; g.fillRect(-0.7, G.sY + (G.hipY - G.sY) * 0.65, 1.5, 1.5); },
      head(g, st) {
        humanFront(g, st, { skin: '#e2b496', chin: 3.2, eyeC: '#3a4a6a', browC: 'rgba(110,100,85,0.95)',
          front(g) {
            g.beginPath(); g.moveTo(-8.6, -14); g.quadraticCurveTo(-9.6, -27, 0, -28.5); g.quadraticCurveTo(9.6, -27, 8.6, -14); g.quadraticCurveTo(7, -22, 0, -23.5); g.quadraticCurveTo(-7, -22, -8.6, -14); g.closePath(); fillLit(g, '#b8ac98', 0, -23, 10, 0.22, -0.5);
            g.strokeStyle = '#141414'; g.lineWidth = 0.8; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 3.4, -12.6, 2.6, 2.1, 0, 0, PI * 2); g.stroke(); } R.line(g, -0.8, -12.8, 0.8, -12.8, '#141414', 0.7);
            g.fillStyle = 'rgba(200,220,255,0.12)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 3.4, -12.6, 2.4, 1.9, 0, 0, PI * 2); g.fill(); }
          },
          mouth(g) {
            if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(0, -3.4, 2, 1.6, 0, 0, PI * 2); g.fill(); return; }
            // the big gap-tooth grin
            g.fillStyle = '#2a0606'; g.beginPath(); g.moveTo(-4.4, -4.8); g.quadraticCurveTo(0, 0.2, 4.4, -4.8); g.quadraticCurveTo(0, -3.6, -4.4, -4.8); g.fill();
            g.fillStyle = '#f2ecdc'; g.fillRect(-3, -4.5, 2.2, 1.6); g.fillRect(0.8, -4.5, 2.2, 1.6); g.fillStyle = '#2a0606'; g.fillRect(-0.8, -4.6, 1.6, 1.8);
          } });
      }
    },
    ballin: {
      detail: (g, d, G) => { R.poly(g, [[-G.shx * 0.55, G.sY - 1], [G.shx * 0.55, G.sY - 1], [0, G.sY + 7]], SKB); g.strokeStyle = RED; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-G.shx * 0.55, G.sY - 0.5); g.lineTo(0, G.sY + 7); g.lineTo(G.shx * 0.55, G.sY - 0.5); g.stroke();
        g.save(); g.font = '400 13px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#5a0a10'; g.fillText('42', 0.6, G.sY + 22.6); g.fillStyle = RED; g.fillText('42', 0, G.sY + 22); g.restore(); g.fillStyle = RED; g.fillRect(-G.shx * 2, G.hipY - 3, G.shx * 4, 2); },
      collar: (g, d, G) => { for (const sd of [-1, 1]) { g.strokeStyle = RED; g.lineWidth = 1.3; g.beginPath(); g.moveTo(sd * G.shx * 0.55, G.sY - 1); g.quadraticCurveTo(sd * G.shx * 0.9, G.sY + 6, sd * G.shx * 1.02, G.sY + 13); g.stroke(); } },
      head(g, st) {
        humanFront(g, st, { skin: SKB, eyeC: '#1a0a04', browC: 'rgba(10,5,0,0.95)',
          front(g) {
            g.fillStyle = 'rgba(255,240,220,0.22)'; g.beginPath(); g.ellipse(-1.5, -23.5, 4.5, 1.8, -0.2, 0, PI * 2); g.fill();
            g.beginPath(); g.moveTo(-8.7, -16); g.quadraticCurveTo(0, -19.6, 8.7, -16); g.lineTo(8.6, -13.6); g.quadraticCurveTo(0, -17.2, -8.6, -13.6); g.closePath(); fillLit(g, '#f2f1ec', 0, -16, 9, 0.1, -0.35);
          } });
      }
    },
    gertie: {
      neck: 30,
      body(g, d, G) {
        const k = d.k, cy = G.hipY - 6 * k;
        for (const L of G.legs) { R.line(g, L.hip[0] * 0.6, cy + 10 * k, L.foot[0], L.foot[1], '#1a1612', 2.4 * k); R.poly(g, [[L.foot[0] - 5 * k, L.foot[1] + 2 * k], [L.foot[0] + 5 * k, L.foot[1] + 2 * k], [L.foot[0], L.foot[1] - 2 * k]], '#1a1612'); }
        g.beginPath(); g.ellipse(0, cy, 20 * k, 18 * k, 0, 0, PI * 2); fillLit(g, '#8a7a68', 0, cy, 20 * k, 0.25, -0.6);
        g.fillStyle = '#e8e4dc'; g.beginPath(); g.ellipse(0, cy + 5 * k, 11 * k, 12 * k, 0, 0, PI * 2); g.fill();
        g.strokeStyle = 'rgba(40,30,20,0.35)'; g.lineWidth = 0.8; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(0, cy - 14 * k + i * 6 * k, 16 * k, 0.4, PI - 0.4); g.stroke(); }
        // the long black neck straight up
        R.seg(g, [0, cy - 12 * k], [0, G.nY], 5 * k, 4 * k, '#16130f', 'feather', { seed: 9 });
      },
      wing(g, d, A) { const k = d.k, sd = A.sd, tip = [A.wr[0] + sd * 10 * k, A.wr[1] - 2 * k]; g.beginPath(); g.moveTo(A.s0[0], A.s0[1] - 2 * k); g.quadraticCurveTo(A.el[0] + sd * 4 * k, A.el[1] - 10 * k, tip[0], tip[1]); g.quadraticCurveTo(A.el[0], A.el[1] + 8 * k, A.s0[0], A.s0[1] + 10 * k); g.closePath(); fillLit(g, '#6a5a4a', A.el[0], A.el[1], 16 * k); g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 0.8; for (let i = 0; i < 5; i++) { const p = R.lerp2(A.el, tip, i / 5); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - sd * 3 * k, p[1] + 6 * k); g.stroke(); } },
      head(g, st) {
        const jaw = st.jaw || 0;
        g.beginPath(); g.ellipse(0, -10, 6.5, 8, 0, 0, PI * 2); fillLit(g, '#14110e', 0, -10, 8, 0.2, -0.6);
        g.fillStyle = '#f2efe8'; g.beginPath(); g.ellipse(-3.6, -6.5, 2.6, 4.2, 0.3, 0, PI * 2); g.ellipse(3.6, -6.5, 2.6, 4.2, -0.3, 0, PI * 2); g.fill();
        eyesF(g, st, 3.4, -12, 1.2, { animal: 1, iris: '#0a0806', glow: !st.dead });
        g.fillStyle = '#0a0806'; g.beginPath(); g.moveTo(-2.4, -7); g.lineTo(2.4, -7); g.lineTo(0, -1 + jaw * 1.5); g.fill();
        if (jaw > 0.3) { g.fillStyle = '#c04060'; g.beginPath(); g.moveTo(-1.6, -5.6); g.lineTo(1.6, -5.6); g.lineTo(0, -1 + jaw * 2.5); g.fill(); }
      }
    },
    rocky: {
      behind: (g, d, G, st) => frontTail(g, d, G, st, ['#8a8a8e', '#1a1a1c'], 8, 6, 6, true),
      detail: (g, d, G) => { bellyPatch(g, G, 'rgba(190,190,185,0.55)', 0.6); },
      head(g, st) {
        const jaw = st.jaw || 0;
        for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 9, -24, 3.6, 4.2, sd * 0.3, 0, PI * 2); fillLit(g, RG, sd * 9, -24, 4); g.fillStyle = '#f0f0f0'; g.beginPath(); g.ellipse(sd * 9, -24.3, 2.2, 2.8, sd * 0.3, 0, PI * 2); g.fill(); g.fillStyle = '#2a2a2e'; g.beginPath(); g.ellipse(sd * 9, -23.8, 1.3, 1.9, sd * 0.3, 0, PI * 2); g.fill(); }
        g.beginPath(); g.ellipse(0, -14, 12, 11, 0, 0, PI * 2); fillLit(g, RG, 0, -15, 12, 0.22, -0.6);
        g.fillStyle = 'rgba(240,240,240,0.85)'; g.beginPath(); g.ellipse(-5, -18.5, 4, 1.4, -0.2, 0, PI * 2); g.ellipse(5, -18.5, 4, 1.4, 0.2, 0, PI * 2); g.fill();
        g.fillStyle = '#111114'; g.beginPath(); g.moveTo(-11, -13); g.quadraticCurveTo(-6, -18, 0, -13.5); g.quadraticCurveTo(6, -18, 11, -13); g.quadraticCurveTo(6, -9.5, 0, -11); g.quadraticCurveTo(-6, -9.5, -11, -13); g.fill();
        eyesF(g, st, 4.8, -13.6, 1.3, { animal: 1, iris: '#d01a10', glow: !st.dead });
        g.fillStyle = 'rgba(230,230,228,0.9)'; g.beginPath(); g.ellipse(0, -6, 6, 4.6, 0, 0, PI * 2); g.fill();
        R.ball(g, 0, -8.4, 1.8, '#0a0a0c');
        g.fillStyle = '#3a0a0a'; g.beginPath(); g.ellipse(0, -3.6 + jaw, 3.4, 0.8 + jaw * 2.4, 0, 0, PI * 2); g.fill();
        g.fillStyle = '#ece6d6'; for (const sd of [-1, 1]) R.poly(g, [[sd * 2.6, -4], [sd * 1.6, -4], [sd * 2.1, -2]], '#ece6d6');
        if (!st.dead) { const t = st.t || 0; for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(250,250,240,0.9)'; g.beginPath(); g.arc(-3 + (i * 1.7) % 6, -2 + Math.abs(Math.sin(t * 5 + i)) * 4, 0.8 + (i % 2) * 0.5, 0, PI * 2); g.fill(); } }
      }
    },
    millie: {
      behind: (g, d, G, st) => frontTail(g, d, G, st, ['#3a2a1e'], 7, 6, 2.4, false),
      detail: (g, d, G) => { bellyPatch(g, G, 'rgba(200,170,130,0.45)', 0.55); },
      head(g, st) {
        const jaw = st.jaw || 0;
        for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 8.5, -21, 2.6, 0, PI * 2); fillLit(g, MB, sd * 8.5, -21, 3); }
        g.beginPath(); g.ellipse(0, -13, 11, 11, 0, 0, PI * 2); fillLit(g, MB, 0, -14, 11, 0.22, -0.6);
        g.save(); g.clip(); strokes(g, 0, -14, 10, 10, 120, 21, 1.57, 2, 0.3, 0.15); g.restore();
        eyesF(g, st, 4.2, -15, 1.2, { animal: 1, iris: '#0a0604' });
        g.fillStyle = MBL; g.beginPath(); g.ellipse(0, -7, 5.5, 4, 0, 0, PI * 2); g.fill();
        R.ball(g, 0, -9, 1.5, '#1a0e08');
        for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) R.line(g, sd * 3, -7.5 + i, sd * 12, -9 + i * 2, 'rgba(240,230,210,0.6)', 0.35);
        g.fillStyle = '#e8a020'; g.fillRect(-1.6, -4.4 + jaw * 0.5, 1.5, 3.6); g.fillRect(0.1, -4.4 + jaw * 0.5, 1.5, 3.6);
      }
    },
    chucky: {
      detail: (g, d, G) => { bellyPatch(g, G, 'rgba(230,80,70,0.4)', 0.6); },
      head(g, st) {
        const jaw = st.jaw || 0;
        g.beginPath(); g.moveTo(-4, -20); g.quadraticCurveTo(-2, -36, 1, -37); g.quadraticCurveTo(3, -30, 4, -20); g.closePath(); fillLit(g, CR, 0, -27, 8, 0.25, -0.55);
        g.beginPath(); g.ellipse(0, -13, 11, 11.5, 0, 0, PI * 2); fillLit(g, CR, 0, -14, 12, 0.25, -0.6);
        g.save(); g.clip(); strokes(g, 0, -13, 11, 11, 120, 63, 1.57, 2, 0.3, 0.18); g.restore();
        g.fillStyle = '#0c0606'; g.beginPath(); g.moveTo(-9, -17); g.quadraticCurveTo(0, -12, 9, -17); g.quadraticCurveTo(8, -6, 0, -3); g.quadraticCurveTo(-8, -6, -9, -17); g.fill();
        eyesF(g, st, 4.6, -13.5, 1.4, { animal: 1, iris: '#0a0404', white: '#0a0404' });
        g.fillStyle = 'rgba(255,255,255,0.8)'; if (!st.dead) { g.fillRect(-4.2, -14.2, 0.8, 0.8); g.fillRect(4.9, -14.2, 0.8, 0.8); }
        // conical beak pointing at us, opens with jaw
        R.poly(g, [[-3.6, -10], [3.6, -10], [0, -4.5 - jaw * 0.5]], '#e07a2a'); if (jaw > 0.2) R.poly(g, [[-3, -5.2], [3, -5.2], [0, -2 + jaw * 2]], '#c05a1a');
        R.line(g, -3.6, -10, 3.6, -10, 'rgba(255,200,140,0.6)', 0.6);
        if (!st.dead) { R.line(g, -7, -18.5, -2, -16.5, '#000', 1.4); R.line(g, 7, -18.5, 2, -16.5, '#000', 1.4); }
      }
    },
    turkey: {
      neck: 20,
      body(g, d, G) {
        const k = d.k, cy = G.hipY - 4 * k;
        for (const L of G.legs) { R.line(g, L.hip[0] * 0.6, cy + 12 * k, L.foot[0], L.foot[1], '#9a7a70', 2.2 * k); for (let i = -1; i <= 1; i++) R.line(g, L.foot[0], L.foot[1], L.foot[0] + i * 4 * k, L.foot[1] + 3 * k, '#8a6a60', 1.2 * k); }
        g.beginPath(); g.ellipse(0, cy, 24 * k, 21 * k, 0, 0, PI * 2); fillLit(g, TB, 0, cy, 24 * k, 0.3, -0.7);
        g.save(); g.clip(); for (let r = 0; r < 6; r++) for (let i = 0; i < 8; i++) { const x = -21 * k + i * 6 * k + (r % 2) * 3, y = cy - 17 * k + r * 6 * k; g.fillStyle = 'rgba(170,120,70,0.28)'; g.beginPath(); g.arc(x, y, 2.6 * k, 0, PI); g.fill(); } g.restore();
        // the beard, front and center
        g.fillStyle = '#0e0a06'; g.beginPath(); g.moveTo(-2 * k, cy - 8 * k); g.lineTo(2 * k, cy - 8 * k); g.lineTo(1 * k, cy + 10 * k); g.lineTo(-1 * k, cy + 10 * k); g.fill();
        R.seg(g, [0, cy - 16 * k], [0, G.nY], 5.4 * k, 4 * k, '#4a3a28', 'feather', { seed: 11 });
      },
      wing(g, d, A) { const k = d.k, sd = A.sd, tip = [A.wr[0] + sd * 6 * k, A.wr[1] + 4 * k]; g.beginPath(); g.moveTo(A.s0[0], A.s0[1] - 2 * k); g.quadraticCurveTo(A.el[0] + sd * 6 * k, A.el[1] - 4 * k, tip[0], tip[1]); g.quadraticCurveTo(A.el[0] - sd * 2 * k, A.el[1] + 8 * k, A.s0[0], A.s0[1] + 12 * k); g.closePath(); fillLit(g, TB, A.el[0], A.el[1], 16 * k); for (let i = 0; i < 5; i++) { const p = R.lerp2(A.el, tip, i / 5); R.line(g, p[0], p[1], p[0] - sd * 2 * k, p[1] + 6 * k, i % 2 ? 'rgba(240,235,220,0.5)' : 'rgba(0,0,0,0.4)', 1); } },
      head(g, st) {
        const jaw = st.jaw || 0;
        g.beginPath(); g.ellipse(0, -9, 6, 7, 0, 0, PI * 2); fillLit(g, '#8094ae', 0, -9, 7, 0.25, -0.55);
        g.beginPath(); g.ellipse(0, -13.5, 5.6, 3.2, 0, PI, PI * 2); fillLit(g, '#4a3a2a', 0, -14, 5, 0.2, -0.5);
        eyesF(g, st, 2.8, -10.5, 1, { animal: 1, iris: '#1a0604', glow: !st.dead });
        R.poly(g, [[-1.6, -8], [1.6, -8], [0, -4.2 - jaw * 0.6]], '#c8b080');
        g.fillStyle = '#b05a68'; g.beginPath(); g.ellipse(1.4, -2.6, 1.4, 2.6, 0.2, 0, PI * 2); g.fill();
      }
    },
    wolfe: {
      behind: (g, d, G, st) => frontTail(g, d, G, st, [WF, WF, WF, WF, WF, '#2a221c', '#2a221c'], 7, 6.5, 6, true),
      detail: (g, d, G) => { R.poly(g, [[-G.shx * 0.5, G.sY - 1], [G.shx * 0.5, G.sY - 1], [G.shx * 0.35, G.hipY - 2], [-G.shx * 0.35, G.hipY - 2]], '#e8a0b8'); for (const sd of [-1, 1]) R.poly(g, [[sd * G.shx * 0.5, G.sY - 1], [sd * G.shx * 0.3, G.sY + (G.hipY - G.sY) * 0.55], [sd * G.shx * 0.85, G.sY + 6]], '#d8d2c4');
        R.line(g, -3, G.sY, 0, G.sY + 12, '#d8b040', 0.7); R.line(g, 3, G.sY, 0, G.sY + 12, '#d8b040', 0.7); g.fillStyle = '#c8c8d0'; g.fillRect(-1.2, G.sY + 12, 2.4, 4.5); g.fillStyle = '#f8f8f8'; g.fillRect(-0.8, G.sY + 13, 1.6, 2.6); },
      head(g, st) {
        const jaw = st.jaw || 0;
        for (const sd of [-1, 1]) { R.poly(g, [[sd * 3, -22], [sd * 10, -37], [sd * 11, -18]], WF); R.poly(g, [[sd * 5, -22], [sd * 9.6, -33], [sd * 10, -20]], '#8a5a52'); }
        g.beginPath(); g.moveTo(0, -27); g.bezierCurveTo(13, -27, 13, -12, 8, -6); g.lineTo(-8, -6); g.bezierCurveTo(-13, -12, -13, -27, 0, -27); g.closePath(); fillLit(g, WF, 0, -17, 13, 0.25, -0.6);
        g.save(); g.clip(); strokes(g, 0, -17, 12, 10, 140, 31, 1.57, 2.6, 0.32, 0.22); g.restore();
        fringe(g, 0, -12, 12, 9, 0, PI, 18, WFD, 3.4, 9);
        eyesF(g, st, 4.6, -17, 1.6, { animal: 1, iris: '#e8c020', slit: 1, glow: !st.dead });
        if (!st.dead) { R.line(g, -7.6, -20.4, -2, -18.4, 'rgba(20,12,6,1)', 1.5); R.line(g, 7.6, -20.4, 2, -18.4, 'rgba(20,12,6,1)', 1.5); }
        // the snout, coming at us
        g.beginPath(); g.ellipse(0, -8.5, 6, 6, 0, 0, PI * 2); fillLit(g, '#b8a890', 0, -9, 6, 0.25, -0.5);
        g.fillStyle = '#3a0608'; g.beginPath(); g.ellipse(0, -3 + jaw * 2, 4.4, 0.8 + jaw * 4, 0, 0, PI * 2); g.fill();
        g.fillStyle = '#f4eedc'; for (const sd of [-1, 1]) R.poly(g, [[sd * 3.6, -3.6], [sd * 2.4, -3.6], [sd * 3, -0.8]], '#f4eedc');
        R.ball(g, 0, -10.5, 2.4, '#0c0808');
        g.fillStyle = '#fafafa'; R.srand(4); for (let i = 0; i < 12; i++) g.fillRect(-3 + R.rr() * 6, -9 + R.rr() * 3, 0.9, 0.9);
        if (!st.dead) { g.fillStyle = '#a00010'; g.fillRect(-1.4, -8.4, 0.9, 2.2 + Math.abs(Math.sin((st.t || 0) * 1.3)) * 1.5); }
      }
    },
    em: {
      detail: (g, d, G) => { R.poly(g, [[-G.shx * 0.5, G.sY - 1], [G.shx * 0.5, G.sY - 1], [0, G.sY + 6]], EMS); g.fillStyle = '#f4efe4'; for (let i = 0; i < 18; i++) { const tt = i / 17; g.beginPath(); g.arc(-G.shx * 0.42 + tt * G.shx * 0.84, G.sY + Math.sin(tt * PI) * 18, 0.95, 0, PI * 2); g.fill(); }
        g.fillStyle = sh(EMD, -0.35); g.fillRect(-G.shx * 2, G.hipY - 6, G.shx * 4, 4); R.poly(g, [[G.shx * 0.2, G.hipY - 5], [G.shx * 0.75, G.hipY - 9], [G.shx * 0.7, G.hipY - 1]], sh(EMD, -0.2)); },
      skirt(g, d, G) { const kn = G.legs.map(L => L.knee); const w0 = d.hipW * 1.2, y0 = G.hipY - 4, y1 = Math.max(kn[0][1], kn[1][1]) + 6, x1 = Math.max(Math.abs(kn[0][0]), Math.abs(kn[1][0])) + d.kneeR + 4;
        g.beginPath(); g.moveTo(-w0, y0); g.lineTo(w0, y0); g.lineTo(x1, y1); g.quadraticCurveTo(0, y1 + 3, -x1, y1); g.closePath(); g.fillStyle = (() => { const gr = g.createLinearGradient(-x1, 0, x1, 0); gr.addColorStop(0, sh(EMD, -0.4)); gr.addColorStop(0.6, EMD); gr.addColorStop(1, sh(EMD, -0.15)); return gr; })(); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 0.8; for (let i = 1; i < 6; i++) { const t = i / 6; g.beginPath(); g.moveTo(-w0 + t * 2 * w0, y0); g.lineTo(-x1 + t * 2 * x1, y1); g.stroke(); } },
      head(g, st) {
        humanFront(g, st, { skin: EMS, w: 7.8, chin: 0.6, eyeC: '#3a2a1a', browC: 'rgba(30,15,10,0.95)',
          back(g) { g.beginPath(); g.moveTo(-10, -4); g.bezierCurveTo(-12, -14, -10, -24, 0, -25); g.bezierCurveTo(10, -24, 12, -14, 10, -4); g.quadraticCurveTo(0, -8, -10, -4); g.closePath(); fillLit(g, '#1e1410', 0, -14, 11, 0.15, -0.6); },
          front(g) {
            g.beginPath(); g.moveTo(-11, -14); g.bezierCurveTo(-12, -28, 12, -28, 11, -14); g.quadraticCurveTo(0, -18.5, -11, -14); g.closePath(); fillLit(g, '#6a2638', 0, -22, 12, 0.25, -0.55);
            g.fillStyle = '#1a0a10'; g.beginPath(); g.moveTo(-11, -16.5); g.quadraticCurveTo(0, -20.5, 11, -16.5); g.lineTo(11, -15); g.quadraticCurveTo(0, -19, -11, -15); g.fill();
            R.ball(g, -7.5, -17.6, 2.2, '#e8d0a0'); R.ball(g, -7.5, -17.6, 1, '#b08030');
            for (const sd of [-1, 1]) R.ball(g, sd * 8.2, -7.2, 1.1, '#f4efe4');
          },
          mouth(g, jaw) {
            if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(0, -3.4, 1.6, 1.3, 0, 0, PI * 2); g.fill(); return; }
            g.fillStyle = '#a8142a'; g.beginPath(); g.moveTo(-2.6, -3.8); g.quadraticCurveTo(-1, -4.8, 0, -4.2); g.quadraticCurveTo(1, -4.8, 2.6, -3.8); g.quadraticCurveTo(0, -2.2 - jaw, -2.6, -3.8); g.fill();
          } });
      }
    },
    golem: {
      detail: (g, d, G, st) => { const t = st.t || 0; g.fillStyle = 'rgba(90,130,40,0.55)'; g.fillRect(-G.shx * 2, G.sY + 6, G.shx * 4, G.hipY - G.sY); g.beginPath(); g.ellipse(0, (G.sY + G.hipY) / 2 + Math.sin(t * 1.3) * 2, 9, 6.5, 0, 0, PI * 2); fillLit(g, '#c89098', 0, (G.sY + G.hipY) / 2, 9);
        R.ball(g, -3, G.sY + 12 + Math.sin(t * 1.7) * 2, 5, '#ece6da'); R.ball(g, -2, G.sY + 12 + Math.sin(t * 1.7) * 2, 2.4, '#3a6a2a'); R.ball(g, -1.6, G.sY + 12 + Math.sin(t * 1.7) * 2, 1.1, '#000');
        g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(G.shx * 0.5, G.sY + 2, 2.2, G.hipY - G.sY - 4); g.save(); g.font = '700 7px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillText('MUNCIE', 0, G.sY + 8); g.restore(); },
      head(g) { g.fillStyle = '#7f7f84'; g.fillRect(-13, -5, 26, 6); g.fillStyle = '#c0c0c4'; g.fillRect(-13, -5, 26, 1.3); g.fillStyle = '#5a5a60'; for (let i = -12; i < 13; i += 3) g.fillRect(i, -3.5, 1, 4); g.fillStyle = '#a0a0a6'; g.fillRect(-12, -9, 24, 4); g.fillStyle = '#d0d0d4'; g.fillRect(-12, -9, 24, 1); }
    },
    slumlord: {
      detail: (g, d, G, st) => { const t = st.t || 0, my = (G.sY + G.hipY) / 2 + 4, o = 2 + Math.max(0, Math.sin(t * 2.2)) * 4;
        for (let i = 0; i < 6; i++) { R.srand(140 + i); const x = (R.rr() - 0.5) * G.shx * 1.6, y = G.sY + 4 + R.rr() * (G.hipY - G.sY - 8); g.fillStyle = '#7a1018'; g.beginPath(); g.ellipse(x, y, 3 + R.rr() * 3, 2 + R.rr() * 2, R.rr() * 3, 0, PI * 2); g.fill(); }
        for (let i = 0; i < 8; i++) { R.srand(90 + i); R.ball(g, (R.rr() - 0.5) * G.shx * 1.7, G.sY + 4 + R.rr() * (G.hipY - G.sY - 6), 2 + R.rr() * 2, '#c89a5a'); }
        g.fillStyle = '#a85060'; g.beginPath(); g.ellipse(0, my, 11, o + 2.2, 0, 0, PI * 2); g.fill(); g.fillStyle = '#2a0204'; g.beginPath(); g.ellipse(0, my, 9.5, o, 0, 0, PI * 2); g.fill();
        for (let i = 0; i < 8; i++) { R.poly(g, [[-8.5 + i * 2.3, my - o], [-7.4 + i * 2.3, my - o], [-7.9 + i * 2.3, my - o + 2.2]], '#e8dcb8'); R.poly(g, [[-8 + i * 2.3, my + o], [-6.9 + i * 2.3, my + o], [-7.4 + i * 2.3, my + o - 2.2]], '#e8dcb8'); }
        R.ball(g, 4, G.sY + 8, 3.2, '#ece0c8'); R.ball(g, 4.6, G.sY + 8, 1.6, '#5a7a2a');
        for (const sd of [-1, 1]) R.poly(g, [[sd * G.shx * 1.1, G.sY - 2], [sd * G.shx * 0.35, G.sY - 2], [sd * G.shx * 0.55, G.hipY - 2], [sd * G.shx * 1.2, G.hipY - 2]], SLS);
        g.strokeStyle = '#e0b040'; g.lineWidth = 1.1; g.beginPath(); g.arc(0, G.sY - 4, 9, 0.5, 2.6); g.stroke(); g.fillStyle = '#e0b040'; g.fillRect(-1.5, G.sY + 4, 3, 3.6); belt(g, G, '#1a1416', '#d8b040'); },
      behind(g, d, G, st) { const t = st.t || 0; for (let i = 0; i < 4; i++) { const sd = i % 2 ? 1 : -1; let p = [sd * G.shx * 0.6, G.sY + 4 + i * 3]; for (let j = 0; j < 7; j++) { const a = sd * (1.9 + i * 0.25) + Math.sin(t * 2.4 + i * 2 + j * 0.7) * 0.35, q = R.add(p, [Math.sin(a) * 7.5 * d.k, -Math.cos(a) * 7.5 * d.k]); R.seg(g, p, q, (5 - j * 0.6) * d.k, (4.4 - j * 0.6) * d.k, j % 2 ? '#a05a60' : '#b87a6c', 'skin', { seed: 520 + i * 7 + j }); p = q; } } },
      head(g, st) {
        humanFront(g, st, { skin: '#c8a08a', chin: 2, w: 8.8, eyeC: '#4a5a2a',
          back(g) { g.beginPath(); g.ellipse(-9, -16, 7, 8.5, -0.3, 0, PI * 2); fillLit(g, '#b88070', -9, -16, 8, 0.2, -0.6); g.fillStyle = '#7a1018'; g.beginPath(); g.ellipse(-11, -13, 2.6, 1.2 + Math.abs(Math.sin((st.t || 0) * 3)) * 1.2, 0.2, 0, PI * 2); g.fill(); },
          front(g) {
            g.beginPath(); g.moveTo(-8.8, -14); g.quadraticCurveTo(-9.6, -27, 0, -28); g.quadraticCurveTo(9.6, -27, 8.8, -14); g.quadraticCurveTo(7, -22.5, 0, -23); g.quadraticCurveTo(-7, -22.5, -8.8, -14); g.closePath(); fillLit(g, '#14100c', 0, -24, 10, 0.45, -0.5);
            g.save(); g.clip(); strokes(g, 0, -24, 10, 5, 70, 41, -1.57, 6, 0.5, 0.35); g.restore();
            R.ball(g, 5.6, -6.5, 2.2, '#ece0c8'); R.ball(g, 6, -6.5, 1.1, '#5a7a2a'); R.ball(g, 6.1, -6.5, 0.5, '#000');
            R.ball(g, -5, -20.6, 2.4, '#b07a6a'); R.ball(g, -4.6, -21, 1.1, '#d8b070');
          },
          mouth(g) { if (st.dead) return; g.fillStyle = '#2a0606'; g.beginPath(); g.moveTo(-3.6, -4.2); g.quadraticCurveTo(0, -2.4, 3.6, -5); g.quadraticCurveTo(0, -3.6, -3.6, -4.2); g.fill(); g.fillStyle = '#e0b040'; g.fillRect(0.6, -4.3, 1.2, 1); } });
      }
    },
    dan: {
      detail: (g, d, G) => { g.strokeStyle = 'rgba(60,0,8,0.5)'; g.lineWidth = 0.9; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-G.shx * 0.6, G.hipY - 8 - i * 6); g.lineTo(G.shx * 0.6, G.hipY - 8 - i * 6); g.stroke(); } R.line(g, 0, G.hipY - 4, 0, G.sY + 6, 'rgba(60,0,8,0.5)', 0.9); g.beginPath(); g.moveTo(-G.shx * 0.8, G.sY + 10); g.quadraticCurveTo(0, G.sY + 16, G.shx * 0.8, G.sY + 10); g.stroke(); belt(g, G, '#1a1012'); },
      head(g, st) {
        for (const sd of [-1, 1]) R.poly(g, [[sd * 4, -22], [sd * 12, -36], [sd * 8, -20]], '#160606');
        humanFront(g, st, { skin: '#b8282c', chin: 1.4, eyeC: '#e8c020', browC: 'rgba(10,0,0,0.95)', angry: 1,
          front(g, jaw) { g.beginPath(); g.moveTo(-8.6, -15); g.quadraticCurveTo(-8, -26, 0, -26.5); g.quadraticCurveTo(8, -26, 8.6, -15); g.quadraticCurveTo(4, -20, 0, -18); g.quadraticCurveTo(-4, -20, -8.6, -15); g.closePath(); g.fillStyle = '#120606'; g.fill();
            g.beginPath(); g.moveTo(-2, 0); g.lineTo(2, 0); g.lineTo(0, 7); g.closePath(); g.fillStyle = '#120606'; g.fill(); } });
      }
    },
    tinkle: {
      detail: (g, d, G) => { g.fillStyle = VEST; g.beginPath(); g.moveTo(-G.shx * 0.95, G.sY + 1); g.lineTo(G.shx * 0.95, G.sY + 1); g.lineTo(G.shx * 1.05, G.hipY - 5); g.lineTo(-G.shx * 1.05, G.hipY - 5); g.closePath(); g.fill();
        g.save(); g.font = '400 7px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#e8e8e8'; g.fillText('POLICE', 0, G.sY + 15); g.restore();
        g.fillStyle = '#d8b840'; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3, r = i % 2 ? 2 : 3.4; g.lineTo(-G.shx * 0.5 + Math.cos(a) * r, G.sY + 6 + Math.sin(a) * r); } g.fill();
        g.fillStyle = '#1e1e22'; g.fillRect(G.shx * 0.45, G.sY + 1, 5, 7); g.fillRect(G.shx * 0.6, G.sY - 4, 1.2, 5);
        belt(g, G, '#0a0a0c', '#c8c8d0'); g.fillStyle = '#26262a'; g.fillRect(-G.shx * 0.95, G.hipY - 4, 5, 8); g.fillRect(G.shx * 0.7, G.hipY - 4, 5, 8); },
      head(g, st) {
        humanFront(g, st, { skin: TSK, chin: 2.2, w: 9, eyeC: '#5a7aa8', browC: 'rgba(200,170,100,0.9)', angry: 1,
          front(g) {
            g.fillStyle = 'rgba(190,160,110,0.45)'; g.fillRect(-9, -21, 3, 9); g.fillRect(6, -21, 3, 9);
            g.beginPath(); g.moveTo(-6.5, -21.5); g.quadraticCurveTo(0, -28, 6.5, -21.5); g.quadraticCurveTo(0, -23.5, -6.5, -21.5); g.closePath(); fillLit(g, '#e0c070', 0, -24, 7, 0.3, -0.5);
          },
          mouth(g, jaw) { if (st.dead) return; g.fillStyle = '#4a1414'; if (jaw > 0.2) { g.beginPath(); g.ellipse(0, -3.4 + jaw, 2.4, 0.8 + jaw * 1.8, 0, 0, PI * 2); g.fill(); } else g.fillRect(-2.4, -4, 4.8, 0.9); } });
      }
    },
  };

  const FIGHTERS = [hippo, painter, garf, host, ballin, gertie, rocky, millie, chucky, turkey, wolfe, em, tinman, bunyon, becky, possum];
  const BOSSES = [tinkle, golem, slumlord, dan];
  // ---------- engine hooks: per-fighter behavior the Kombat Engine reads from the roster ----------
  // feathers: color of feathers that fly off on hits. glass: bleeds glass and green brine, no wounds.
  // sp2Mod: extra fields merged into the second special. fireTrail: flames while leaping.
  // vanish: hidden once a script marks it gone. death: boss death script. arena: the boss's ladder arena.
  // ladderOnly: only met at the top of the ladder. cpuLvl: fixed CPU skill. aiStyle: { noBlock, quips, taunt }
  Object.assign(gertie, { feathers: '#8a7a68' });
  Object.assign(chucky, { feathers: '#b0141c' });
  Object.assign(turkey, { feathers: '#5a3a22' });
  Object.assign(ballin, { fireTrail: true });
  Object.assign(tinkle, { arena: 'cityhall', cpuLvl: 0.34, aiStyle: { noBlock: true, quips: ['STOP RESISTING!', 'ON THE GROUND!', 'I AM THE LAW!', 'GET SOME!'] } });
  Object.assign(golem, { arena: 'glassworks', death: 'golemDie', sp2Mod: { dmg: 14, quake: 1 }, vanish: true });
  Object.assign(slumlord, { arena: 'rental', death: 'slumDie', aiStyle: { taunt: 0.12 } });
  Object.assign(dan, { arena: 'hell', death: 'danDie', sp2Mod: { fire: 1 }, fireTrail: true, ladderOnly: true });

  const PORTRAIT = { gertie: [0.42, 0.78, 1.5], painter: [0.5, 0.86, 0.85], hippo: [0.3, 0.9, 0.85], garf: [0.4, 0.9, 0.95], turkey: [0.36, 0.94, 1.45], chucky: [0.38, 0.95, 0.85], wolfe: [0.3, 0.92, 0.8], em: [0.42, 0.96, 0.95], slumlord: [0.42, 0.92, 0.85], tinkle: [0.42, 0.96, 0.9], golem: [0.5, 0.7, 1], dan: [0.42, 0.95, 0.85], tinman: [0.4, 1.02, 0.78], bunyon: [0.42, 0.98, 0.82], becky: [0.42, 0.94, 0.95], possum: [0.28, 0.9, 0.85] };
  return KIT.roster(FIGHTERS, BOSSES, { front: FRONT, portrait: PORTRAIT });
})();
