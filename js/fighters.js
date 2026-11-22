// Muncie Kombat: the roster (bodies, materials, realistic heads, moves, stats)
'use strict';
const ROSTER = (() => {
  const R = RIG, PI = Math.PI, sh = R.shade;
  const HUMAN = { thigh: 27, shin: 26, torso: 35, neck: 5, upper: 20, fore: 19, hipW: 11, shW: 15, chest: 15, belly: 11.5, back: 11, thighR: 7.2, kneeR: 4.8, ankleR: 3.4, shR: 5.6, elbowR: 3.9, wristR: 3.1, fist: 3.9, footL: 12, footH: 3.8, shOff: 3 };
  const dims = o => Object.assign({}, HUMAN, o);

  // ---------- head helpers (local: origin at the top of the neck, +x forward, -y up) ----------
  function lit(g, cx, cy, r, c, hi = 0.3, lo = -0.62) {
    const gr = g.createRadialGradient(cx + r * 0.35, cy - r * 0.45, r * 0.05, cx, cy, r * 1.25);
    gr.addColorStop(0, sh(c, hi)); gr.addColorStop(0.4, c); gr.addColorStop(0.8, sh(c, (lo + 0) * 0.6)); gr.addColorStop(1, sh(c, lo));
    return gr;
  }
  function fillLit(g, c, cx, cy, r, hi, lo) { g.fillStyle = lit(g, cx, cy, r, c, hi, lo); g.fill(); }
  function strokes(g, cx, cy, rx, ry, n, seed, ang, len, dark = 0.3, light = 0.14) {
    R.srand(seed);
    for (let i = 0; i < n; i++) {
      const a = R.rr() * PI * 2, d = Math.sqrt(R.rr()), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, l = len * (0.6 + R.rr() * 0.8);
      g.strokeStyle = R.rr() < 0.55 ? `rgba(0,0,0,${dark})` : `rgba(255,245,230,${light})`; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l); g.stroke();
    }
  }
  function fringe(g, cx, cy, rx, ry, a0, a1, n, c, len, seed) {
    R.srand(seed); g.fillStyle = c;
    for (let i = 0; i < n; i++) {
      const a = a0 + (a1 - a0) * (i + 0.5) / n, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, l = len * (0.6 + R.rr() * 0.8);
      g.beginPath(); g.moveTo(x - Math.sin(a) * 1.4, y + Math.cos(a) * 1.4); g.lineTo(x + Math.cos(a + 0.3) * l, y + Math.sin(a + 0.3) * l); g.lineTo(x + Math.sin(a) * 1.4, y - Math.cos(a) * 1.4); g.fill();
    }
  }
  // realistic eye: socket shadow, small eyeball, dark iris, catchlight
  function eye(g, x, y, r, st, o = {}) {
    g.fillStyle = o.socket || 'rgba(40,10,5,0.35)'; g.beginPath(); g.ellipse(x - r * 0.1, y - r * 0.1, r * 1.5, r * 1.05, 0, 0, PI * 2); g.fill();
    if (st.dead) {
      g.fillStyle = o.white || '#e8dcc8'; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, PI * 2); g.fill();
      g.fillStyle = '#7a0010'; g.fillRect(x - r, y + r * 0.6, r * 0.6, r * 2.2);
      return;
    }
    if (st.hurt) { R.line(g, x - r, y, x + r, y - r * 0.2, '#1a0a06', r * 0.55); return; }
    if (o.animal) {
      g.fillStyle = o.iris || '#120a06'; g.beginPath(); g.ellipse(x, y, r * 0.9, r * 0.85, 0, 0, PI * 2); g.fill();
      if (o.slit) { g.fillStyle = '#050302'; g.beginPath(); g.ellipse(x + r * 0.1, y, r * 0.2, r * 0.75, 0, 0, PI * 2); g.fill(); }
    } else {
      g.fillStyle = o.white || '#e6dccc'; g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0, 0, PI * 2); g.fill();
      g.fillStyle = o.iris || '#2a1a10'; g.beginPath(); g.arc(x + r * 0.35, y, r * 0.5, 0, PI * 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x - r, y - r * 0.6, r * 2, r * 0.35);
    }
    if (o.glow) { g.fillStyle = 'rgba(255,40,20,0.3)'; g.beginPath(); g.arc(x, y, r * 2.2, 0, PI * 2); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(x + r * 0.3, y - r * 0.35, Math.max(0.6, r * 0.3), Math.max(0.6, r * 0.3));
  }
  function brow(g, x, y, w, ang, c = 'rgba(30,15,5,0.85)', t = 1.2) { R.line(g, x - w / 2, y - Math.sin(ang) * w / 2, x + w / 2, y + Math.sin(ang) * w / 2, c, t); }

  // a 3/4 profile human head; o: { skin, chin, nose, back(g), front(g), beard(g), mouth(g), glasses, eyeC }
  function humanHead(g, st, o) {
    const S = o.skin, ch = o.chin || 0, nz = o.nose || 0;
    g.save(); g.scale(0.9, 0.9);
    if (o.back) o.back(g);
    // ear
    g.beginPath(); g.ellipse(-1.5, -11, 2.4, 3.6, 0.15, 0, PI * 2); fillLit(g, sh(S, -0.08), -1.5, -11, 3.6);
    g.fillStyle = 'rgba(60,20,10,0.4)'; g.beginPath(); g.ellipse(-1.2, -11, 1.1, 2, 0.15, 0, PI * 2); g.fill();
    // skull, face profile, jaw
    g.beginPath();
    g.moveTo(-5, -1.5);
    g.bezierCurveTo(-8.5, -8, -8.5, -20, -2, -24.5);
    g.bezierCurveTo(4, -27.5, 10, -24, 10.8, -17.5);
    g.quadraticCurveTo(11.4, -14.5, 10.8, -13.2);
    g.quadraticCurveTo(11.6 + nz * 0.4, -11.5, 13.4 + nz, -8.6);
    g.quadraticCurveTo(12.8 + nz * 0.5, -7.3, 11.1, -7.5);
    g.quadraticCurveTo(11.8, -6.2, 11.3, -5);
    g.quadraticCurveTo(11.7, -3.6, 10.8, -2.4);
    g.quadraticCurveTo(11.6 + ch * 0.4, 0.5 + ch, 8.5, 1.5 + ch);
    g.quadraticCurveTo(2.5, 1 + ch * 0.6, -1, -2);
    g.closePath();
    fillLit(g, S, 5, -13, 14, 0.25, -0.6);
    g.save(); g.clip();
    // cheekbone + jaw shadow + temple shading
    g.fillStyle = 'rgba(60,20,10,0.28)'; g.beginPath(); g.ellipse(4, -4, 6, 3.5, -0.3, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(60,20,10,0.25)'; g.beginPath(); g.ellipse(-3, -12, 4, 10, 0, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(255,230,210,0.15)'; g.beginPath(); g.ellipse(8.5, -9.5, 2.2, 1.6, 0, 0, PI * 2); g.fill();
    g.restore();
    // eyes (far eye partly hidden by the nose bridge)
    eye(g, 4.6, -12.3, 1.1, st, { iris: o.eyeC });
    eye(g, 9, -12.2, 1.35, st, { iris: o.eyeC });
    brow(g, 9, -14.3, 3.6, 0.15, o.browC); brow(g, 4.6, -14.4, 3, -0.1, o.browC);
    // nose shadow + nostril
    g.fillStyle = 'rgba(60,20,10,0.35)'; g.beginPath(); g.moveTo(10.6, -12.5); g.quadraticCurveTo(11.5, -9.5, 10.4, -8); g.lineTo(11.4, -7.8); g.quadraticCurveTo(12.4, -10, 10.8, -12.8); g.fill();
    g.fillStyle = 'rgba(30,8,4,0.6)'; g.fillRect(11.3 + nz * 0.5, -8.1, 0.9, 0.7);
    if (o.mouth) o.mouth(g);
    else if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10.5, -4.6, 1.4, 1.2, 0, 0, PI * 2); g.fill(); g.fillStyle = '#8a0010'; g.fillRect(10, -3.8, 1.2, 5); }
    else { R.line(g, 9, -5.2, 11.2, -5, 'rgba(70,20,15,0.8)', 0.8); }
    if (o.beard) o.beard(g);
    if (o.front) o.front(g);
    g.restore();
  }

  // ---------- the fighters ----------
  const HP = '#7d4fa8', HPL = '#a982c8', HPD = '#4a2a68';
  const hippo = {
    id: 'hippo', name: 'MUNCIE HIPPO', short: 'HIPPO', him: 'HIM', k: 1.0, paws: true,
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
          g.beginPath(); g.ellipse(-3, -17, 15.5, 14.5, 0, 0, PI * 2); fillLit(g, '#3a2414', -3, -17, 16, 0.18, -0.6);
          g.save(); g.clip(); strokes(g, -3, -17, 15, 14, 160, 3, -1.2, 2, 0.4, 0.18); g.restore();
          fringe(g, -3, -17, 15.5, 14.5, -PI * 1.1, PI * 0.2, 34, '#2a180c', 2.2, 9);
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
    id: 'garf', name: 'GARF CAT', short: 'GARF', him: 'HIM', k: 1.08, paws: true, claws: true,
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
      for (let i = 0; i < 5; i++) { const a = PI * 0.6 + i * 0.32 + w * i * 0.4, q = R.add(p, R.dir(a, 7 * d.k)); R.seg(g, p, q, (4 - i * 0.4) * d.k, (3.6 - i * 0.4) * d.k, i % 2 ? ORD : OR, 'fur', { seed: 200 + i }); p = q; }
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
        skin: SKIN_L, chin: 2.2, nose: 0.4, eyeC: '#3a4a6a', browC: 'rgba(120,115,105,0.95)',
        front(g) {
          // swept gray hair
          g.beginPath(); g.moveTo(-6, -9); g.bezierCurveTo(-9, -22, -2, -28, 5, -27.5); g.bezierCurveTo(12, -27, 14, -22, 12, -19);
          g.quadraticCurveTo(8, -23, 2, -20.5); g.quadraticCurveTo(-2, -18, -3, -9); g.closePath();
          fillLit(g, '#c8c2b8', 2, -21, 10, 0.2, -0.5);
          g.save(); g.clip(); strokes(g, 2, -21, 10, 6, 70, 13, -0.25, 3, 0.35, 0.25); g.restore();
          // glasses
          g.strokeStyle = '#141414'; g.lineWidth = 0.9;
          g.beginPath(); g.ellipse(9.2, -12.2, 2.6, 2, 0, 0, PI * 2); g.stroke(); g.beginPath(); g.ellipse(4.6, -12.3, 2.1, 1.9, 0, 0, PI * 2); g.stroke();
          R.line(g, 6.7, -12.6, 6.7, -12.6, '#141414', 0.8); R.line(g, 2.5, -12.5, -1, -11.5, '#141414', 0.7);
          g.fillStyle = 'rgba(200,220,255,0.14)'; g.beginPath(); g.ellipse(9.2, -12.2, 2.4, 1.8, 0, 0, PI * 2); g.fill();
        },
        mouth(g) {
          if (st.dead) { g.fillStyle = '#2a0404'; g.beginPath(); g.ellipse(10, -4.2, 1.6, 1.4, 0, 0, PI * 2); g.fill(); g.fillStyle = '#8a0010'; g.fillRect(9.5, -3.4, 1.2, 5); return; }
          g.fillStyle = '#3a0a08'; g.beginPath(); g.moveTo(7, -5.6); g.quadraticCurveTo(9.5, -2.4, 11.6, -5.3); g.closePath(); g.fill();
          g.fillStyle = '#efe8d8'; g.fillRect(7.8, -5.5, 1.6, 1.2); g.fillRect(10, -5.4, 1.4, 1.2);
          g.fillStyle = 'rgba(60,20,10,0.35)'; g.beginPath(); g.ellipse(6.5, -4.6, 1, 2, 0.3, 0, PI * 2); g.fill();
        }
      });
    },
    proj: { kind: 'card', name: 'CUE CARD' }, sp2: { kind: 'slide', name: 'DESK SLIDE' },
    fatal: { id: 'host', name: 'TOP TEN LIST' }
  };

  const SKB = '#7a4a2a', RED = '#a8132a';
  const ballin = {
    id: 'ballin', name: "BALLIN' WELL", short: 'BALLIN', him: 'HIM', k: 1.05,
    bio: 'Ball State legend. Still has the moves. Still has the elbows.',
    sock: '#e8e8e8', bicep: 0.38, calf: 0.4,
    d: dims({ thigh: 29, shin: 29, torso: 36, upper: 22, fore: 21, hipW: 12, shW: 16, chest: 15.5, belly: 11, back: 11, thighR: 7.4, kneeR: 4.6, shR: 6, elbowR: 4.1 }),
    col: { torso: RED, armU: SKB, armL: SKB, hand: SKB, legU: RED, legL: SKB, foot: '#e8e8e8', neck: SKB },
    mat: { torso: 'cloth', armU: 'skin', armL: 'skin', legU: 'cloth', legL: 'skin' },
    stats: { speed: 1.1, power: 1.0, weight: 1.0 },
    torsoDetail(g, d, st, L) {
      R.poly(g, [[-d.shW * 0.4, -L * 1.06], [d.shW * 0.9, -L * 1.06], [d.shW * 0.45, -L * 0.82]], SKB);
      g.strokeStyle = '#eee'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-d.shW * 0.4, -L * 1.04); g.lineTo(d.shW * 0.45, -L * 0.82); g.lineTo(d.shW * 0.9, -L * 1.04); g.stroke();
      g.save(); g.translate(d.shW * 0.1, -L * 0.62); g.font = '700 6px Anton, Impact, sans-serif'; g.fillStyle = '#f2f2f2'; g.fillText('BALL ST', -9, 0); g.restore();
      g.fillStyle = '#eee'; g.fillRect(-d.hipW, -6, d.hipW * 2.2, 1.4);
    },
    head(g, st) {
      humanHead(g, st, {
        skin: SKB, eyeC: '#1a0a04', browC: 'rgba(10,5,0,0.95)', nose: 0.3,
        front(g) {
          g.beginPath(); g.moveTo(-6.5, -11); g.bezierCurveTo(-8.5, -21, -2, -26.5, 4, -26.5); g.bezierCurveTo(9, -26.5, 11.2, -22, 10.6, -18.5); g.quadraticCurveTo(5, -20.5, -1, -19); g.quadraticCurveTo(-3.5, -15, -4, -11); g.closePath();
          g.fillStyle = '#141010'; g.fill();
          g.save(); g.clip(); R.srand(21); g.fillStyle = 'rgba(80,60,50,0.5)'; for (let i = 0; i < 60; i++) g.fillRect(-7 + R.rr() * 18, -27 + R.rr() * 16, 0.6, 0.6); g.restore();
          R.line(g, 8.8, -3.4, 11.2, -3.6, 'rgba(20,10,5,0.6)', 0.5);
        }
      });
    },
    proj: { kind: 'bball', name: 'FIREBALL' }, sp2: { kind: 'leap', name: 'ALLEY-OOP ELBOW' },
    fatal: { id: 'ballin', name: 'POSTERIZED' }
  };

  const GB = '#6a5e50', GL = '#ddd6c6';
  const gertie = {
    id: 'gertie', name: 'GERTIE', short: 'GERTIE', him: 'HER', k: 1.0, wings: true, webbed: true,
    bio: 'Canada goose. Owns the Greenway. Will hiss at your corpse.',
    d: dims({ thigh: 17, shin: 21, torso: 30, neck: 22, upper: 19, fore: 19, hipW: 15, shW: 13, chest: 16, belly: 19, back: 15, thighR: 7, kneeR: 2.4, ankleR: 2, shR: 6, elbowR: 5, wristR: 4, fist: 4.5, footL: 13, footH: 3.2 }),
    col: { torso: GB, armU: GB, hand: '#221e1a', legU: GB, legL: '#1a1a1a', foot: '#1a1a1a' },
    mat: { torso: 'feather', legU: 'feather', legL: 'skin' }, calf: 0,
    stats: { speed: 1.06, power: 0.95, weight: 0.9 },
    wing(g, A, dark, d, st) {
      const c = dark ? sh(GB, -0.3) : GB;
      const a = A.a2, e = A.el, w = A.wr, end = R.add(w, R.dir(a, 10));
      g.beginPath(); g.moveTo(A.s0[0] - 3, A.s0[1]);
      g.quadraticCurveTo(...R.add(e, R.dir(a + PI / 2, 8)), ...R.add(w, R.dir(a + PI / 2, 5)));
      g.lineTo(...end);
      g.quadraticCurveTo(...R.add(e, R.dir(a - PI / 2, 3)), A.s0[0] + 3, A.s0[1] + 4);
      g.closePath(); g.fillStyle = lit(g, e[0], e[1], 16, c); g.fill();
      g.save(); g.clip();
      for (let i = 0; i < 6; i++) { const b = R.lerp2(A.s0, end, 0.2 + i * 0.14); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(...R.add(b, R.dir(a + PI / 2, 8))); g.lineTo(...R.add(b, R.dir(a + 0.2, 6))); g.stroke(); }
      g.fillStyle = dark ? '#100c08' : '#1e1a16'; g.beginPath(); g.moveTo(...R.lerp2(w, end, 0)); g.lineTo(...end); g.lineTo(...R.add(w, R.dir(a + PI / 2, 6))); g.fill();
      g.restore();
    },
    torsoDetail(g, d, st, L) {
      g.fillStyle = 'rgba(225,218,200,0.8)'; g.beginPath(); g.ellipse(d.belly * 0.3, -L * 0.55, d.belly * 0.6, L * 0.42, 0, 0, PI * 2); g.fill();
      g.strokeStyle = 'rgba(40,30,20,0.4)'; g.lineWidth = 0.7; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(-d.back * 0.4 + (i % 3) * 5, -L * 0.15 - ((i / 3) | 0) * 7, 3, 0.3, PI - 0.3); g.stroke(); }
    },
    tail(g, d, J) { R.poly(g, [[J.hip[0] - d.back * 0.6, J.hip[1] - 10], [J.hip[0] - d.back * 1.7, J.hip[1] - 2], [J.hip[0] - d.back * 0.8, J.hip[1] + 3]], '#121010'); R.poly(g, [[J.hip[0] - d.back * 0.9, J.hip[1] - 2], [J.hip[0] - d.back * 1.3, J.hip[1] + 4], [J.hip[0], J.hip[1] + 4]], '#e8e2d6'); },
    neckDraw(g, d, J) { R.seg(g, J.sh, J.nk, 5.5 * d.k, 3.8 * d.k, '#1c1a18', 'feather', { seed: 300 }); R.line(g, ...R.lerp2(J.sh, J.nk, 0.02), ...R.lerp2(J.sh, J.nk, 0.12), GL, 4); },
    head(g, st) {
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
    fatal: { id: 'gertie', name: 'HONK' }
  };

  const RG = '#6e6e72', RGL = '#b0b0b0', RGD = '#222226';
  const rocky = {
    id: 'rocky', name: 'ROCKY', short: 'ROCKY', him: 'HIM', k: 0.96, paws: true, claws: true,
    bio: 'Rabid, foaming and living in the dumpster behind Royal Pizza.',
    d: dims({ thigh: 21, shin: 20, torso: 31, neck: 2, upper: 18, fore: 17, hipW: 14, shW: 13, chest: 14, belly: 16, back: 13, thighR: 8.5, kneeR: 5.8, ankleR: 4.2, shR: 6.5, elbowR: 4.8, wristR: 4, fist: 4.5, footL: 11, footH: 4.4 }),
    col: { torso: RG, armU: RG, armL: sh(RG, -0.3), hand: RGD, legU: RG, legL: sh(RG, -0.3), foot: RGD, neck: RG },
    mat: { torso: 'fur', armU: 'fur', armL: 'fur', legU: 'fur', legL: 'fur', neck: 'fur' },
    stats: { speed: 1.12, power: 0.95, weight: 0.85 },
    torsoDetail(g, d, st, L) { g.fillStyle = 'rgba(190,190,185,0.5)'; g.beginPath(); g.ellipse(d.belly * 0.35, -L * 0.45, d.belly * 0.5, L * 0.38, 0, 0, PI * 2); g.fill(); },
    tail(g, d, J, st) {
      const w = Math.sin((st.t || 0) * 4) * 0.2;
      let p = [J.hip[0] - d.back * 0.8, J.hip[1] - 2];
      for (let i = 0; i < 6; i++) { const a = PI * 0.62 + i * 0.12 + w * i * 0.4, q = R.add(p, R.dir(a, 5.5 * d.k)); R.seg(g, p, q, (5.5 - i * 0.3) * d.k, (5.2 - i * 0.3) * d.k, i % 2 ? '#1a1a1c' : '#8a8a8e', 'fur', { seed: 400 + i }); p = q; }
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
    id: 'millie', name: 'MILLIE', short: 'MILLIE', him: 'HER', k: 0.93, paws: true, claws: true,
    bio: 'White River muskrat. Those teeth go through bone like balsa.',
    d: dims({ thigh: 21, shin: 19, torso: 31, neck: 2, upper: 17, fore: 17, hipW: 15, shW: 12.5, chest: 14, belly: 17, back: 14, thighR: 8.5, kneeR: 5.8, ankleR: 4, shR: 6.2, elbowR: 4.6, wristR: 3.8, fist: 4.3, footL: 12, footH: 4.2 }),
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
    fatal: { id: 'millie', name: 'TIMBER' }
  };

  // ---------- bosses ----------
  const GLASS = '#8cbccc';
  const golem = {
    id: 'golem', name: 'BALL JAR GOLEM', short: 'GOLEM', him: 'IT', k: 1.32, boss: true, glass: true,
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
    id: 'dan', name: 'DEVIL DAN', short: 'DAN', him: 'HIM', k: 1.12, boss: true, bicep: 0.42, calf: 0.2,
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
