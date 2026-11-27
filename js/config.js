// Muncie Kombat: game settings for the Kombat Engine (titles, mascot, victory poses)
'use strict';
// the announcer: say "Pres." as "President" when a line falls back to text-to-speech
if (typeof SFX !== 'undefined' && SFX.say) { const say0 = SFX.say; SFX.say = (str, ...rest) => say0(String(str).replace(/\bpres\.?\s/gi, 'president ').replace(/\bballing\b/gi, 'bawlin'), ...rest); }
window.GAME = {
  title: 'MUNCIE KOMBAT',
  kicker: "PURPLE HIPPO ARCADE'S",                     // small line stacked above MUNCIE KOMBAT on the title screen
  titleStack: true,                                      // MUNCIE over KOMBAT
  subtitle: '',
  ladderGoal: 'CITY HALL',
  endingLine: 'Devil Dan is back in the basement of City Hall. For now.',
  mascot: 'hippo',                                       // head on the title emblem
  toasty: { fighter: 'hippo', text: 'SQUARE SLICED!' },  // pops in after some uppercuts

  // ---------- title screen: the Purple Hippo and Devil Dan square off on the Tillotson Overpass ----------
  titleScene(g, W, H, t) {
    const R = RIG, st = STAGES.get('overpass'), FL = STAGES.FLOOR;
    // the overpass arena itself: downtown skyline from its far layer, the tagged barrier and deck from its near layer
    // the skyline at its true distance, framed so the Teachers College and the AT&T building sit between the fighters
    const S = 1, y0 = 0;
    g.imageSmoothingEnabled = false;
    g.drawImage(st.back, 730 - W / 2 / S, y0, W / S, H / S, 0, 0, W, H);
    g.imageSmoothingEnabled = true;
    g.drawImage(st.front, Math.round(560 - W / 2), 0, W, H, 0, 0, W, H);
    // a dark band so the title reads
    let gr = g.createLinearGradient(0, 0, 0, 105); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 105);
    // both fighters in their fighting stance, facing each other
    const stance = ph => R.P({ hy: 8 + Math.sin(t * 4.5 + ph) * 1.6, lean: 0.12 + Math.sin(t * 4.5 + ph) * 0.02, head: 0.05, aF: [1.0 + Math.sin(t * 4.5 + ph) * 0.05, 1.55], aB: [0.25, 2.45], fF: [17, 0], fB: [-17, 0] });
    const hip = ROSTER.FIGHTERS.find(f => f.id === 'hippo'), dan = ROSTER.BOSSES.find(f => f.id === 'dan');
    for (const [def, x, face, ph] of [[hip, W * 0.15, 1, 0], [dan, W * 0.85, -1, 1.7]]) {
      if (!def) continue;
      const f = { def, d: def.dk, x, y: FL, face, t: t + ph };
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.ellipse(x, FL + 1, 30, 4.5, 0, 0, Math.PI * 2); g.fill();
      R.digi(g, x, FL, gg => R.draw(gg, f, stance(ph), {}), { phase: ph > 0 ? 1 : 0 });
    }
    gr = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  },

  // ---------- the announcer: the same recorded robot as POTUS Kombat, crackling over the radio ----------
  // built by tools/make_voice.py (rerun it after adding a fighter or a spoken line)
  voiceClips: 'voice/',
  voice: { pitch: 0.85, rate: 1.12, prefer: /Daniel|Fred|Alex|Google US English|Male/i, radio: true },

  // ---------- game-defined projectiles ----------
  projectiles: {
    // Wally World Karen's expired coupons: three at once, fanned out
    coupons: { speed: 300, dmg: 4, w: 10, h: 7, spread: [-50, 0, 50], sfx: 'whoosh', draw(g, p, s, t) { g.rotate(Math.sin(t * 20) * 0.4); g.fillStyle = '#fff6c8'; g.fillRect(-7, -4, 14, 8); g.strokeStyle = '#2a2a2a'; g.setLineDash([1, 1]); g.lineWidth = 0.5; g.strokeRect(-7, -4, 14, 8); g.setLineDash([]); g.fillStyle = '#c81818'; g.font = '4px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillText('50¢ OFF', 0, 1.6); g.textAlign = 'left'; } },
    // Bearcat's fight song: a stack of purple sound waves that stuns
    fightsong: { speed: 260, dmg: 7, w: 14, h: 24, fx: 'stun', sfx: 'horn', draw(g, p, s, t) { g.scale(s * 1.6, 1.6); for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(${210 - i * 30},150,255,${0.95 - i * 0.22})`; g.lineWidth = 3; g.beginPath(); g.arc(-i * 6, 0, 7 + i * 4 + Math.sin(t * 30) * 1.5, -1.0, 1.0); g.stroke(); } g.scale(s / 1.6, 1 / 1.6); g.fillStyle = '#f0e8ff'; g.font = '8px Anton, Impact, sans-serif'; g.fillText('♪', -3, -10 + Math.sin(t * 12) * 2); } },
    // Councilman Creep's business card: CALL ME scrawled on the back
    bizcard: { speed: 320, dmg: 7, w: 12, h: 8, sfx: 'whoosh', draw(g, p, s, t) { g.rotate(t * 16 * s); g.fillStyle = '#f4f0e8'; g.fillRect(-8, -5, 16, 10); g.fillStyle = '#22283a'; g.fillRect(-8, -5, 16, 2.4); g.fillStyle = '#b01848'; g.font = '4px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillText('CALL ME', 0, 3); g.textAlign = 'left'; } },
    // the president's diploma: a rolled scroll in a red ribbon, lobbed end over end
    diploma: { speed: 280, vy: -160, grav: 380, dmg: 9, w: 12, h: 10, fx: 'knock', launch: [180, -300], sfx: 'whoosh', hitSfx: 'thud', draw(g, p, s, t) { g.rotate(t * 13 * s); g.fillStyle = '#f2ead4'; g.fillRect(-11, -3, 22, 6); g.fillStyle = '#d8ccae'; g.beginPath(); g.ellipse(-11, 0, 1.6, 3, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(11, 0, 1.6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#a8141c'; g.fillRect(-1.6, -3.4, 3.2, 6.8); } },
  },

  // ---------- victory poses: each winner celebrates in character ----------
  winPoses(K) {
    const { R, PI, FX, SFX, FLOOR, game, once, once2, fj, hurtH, rnd } = K;
    const WIN = {
      hippo: { fp: t => ({ jaw: t > 1.6 && t < 2.3 ? 1 : 0.15, aL: t < 1.6 ? [0.5, -2.8 + Math.sin(t * 16) * 0.35] : [1.4, 0.4], aR: t < 1.6 ? [0.5, -2.8 - Math.sin(t * 16) * 0.35] : [1.4, 0.4], squat: t < 1.6 ? 2 : 0 }),
        fx(f, t) { if (t < 1.6 && Math.sin(t * 16) > 0.97) SFX.thud(); if (once(f, 'burp', t, 1.65)) { SFX.gulp(); SFX.fart(); const h = fj(f, 'head'); FX.puff(h[0], h[1] + 10, 'rgba(160,110,200,0.7)', 14, 4); } } },
      painter: { fp: t => ({ aR: [2.3 + Math.sin(t * 6) * 0.25, 0.6 + Math.cos(t * 6) * 0.25], aL: [0.7, -1.3] }),
        fx(f, t) { if (t > 0.2 && t < 2.6 && Math.random() < 0.25) { const h = fj(f, 'handR'); FX.puff(h[0] + 8, h[1] - 8, 'rgba(250,250,255,0.75)', 1, 1); } },
        draw(g, f) { const h = fj(f, 'handR'), l = fj(f, 'handL'); R.line(g, h[0], h[1], h[0] + 6, h[1] - 9, '#6a4a2a', 1.4); R.ball(g, h[0] + 6.5, h[1] - 9.5, 1.4, '#f8f8ff');
          g.save(); g.translate(l[0] - 4, l[1] + 2); g.fillStyle = '#a87a48'; g.beginPath(); g.ellipse(0, 0, 9, 6, -0.3, 0, PI * 2); g.fill(); ['#f4f4f4', '#2a5ad0', '#e8c020', '#c02020', '#2a8a3a'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(-5 + i * 2.6, -1.5 + (i % 2) * 2.5, 1.3, 0, PI * 2); g.fill(); }); g.restore(); } },
      garf: { fp: t => t < 1.0 ? ({ jaw: 1, aL: [2.9, 0.1], aR: [2.9, 0.1], hy: -2 }) : ({ jaw: 0.25 + Math.abs(Math.sin(t * 9)) * 0.2, head: 0.18, aR: [0.45, -3.2], aL: [0.3, 0.1], squat: 3 }),
        fx(f, t) { if (once(f, 'yawn', t, 0.1)) SFX.squeak(); } },
      host: { fp: t => t < 0.55 ? ({ aR: [2.2, 1.0], aL: [0.6, -1.5] }) : t < 0.9 ? ({ aR: [3.3, 0.3], aL: [0.6, -1.5] }) : ({ aR: [0.6, -1.5], aL: [0.6, -1.5] }),
        fx(f, t) { if (once(f, 'toss', t, 0.6)) { const h = fj(f, 'handR'); FX.gib('pencil', h[0], h[1] - 8, 260, -300, { vr: 18, draw: g => { g.fillStyle = '#e8c020'; g.fillRect(-6, -0.9, 10, 1.8); g.fillStyle = '#f0c8a0'; g.fillRect(4, -0.9, 2, 1.8); g.fillStyle = '#e88aa0'; g.fillRect(-7.5, -0.9, 1.5, 1.8); } }); }
          if (once(f, 'glass', t, 1.0)) { SFX.shatter(); game.flash = 0.06; } },
        draw(g, f, t) { if (t < 0.6) { const h = fj(f, 'handR'); g.fillStyle = '#e8c020'; g.fillRect(h[0] - 1, h[1] - 10, 1.8, 10); } } },
      ballin: { fp: t => ({ aR: [2.98, 0.04], aL: t > 1.2 ? [0.45, -2.5] : [0.5, -1.4] }),
        draw(g, f, t) { const h = fj(f, 'handR'); g.save(); g.translate(h[0], h[1] - 13); g.rotate(t * 16); R.ball(g, 0, 0, 11, '#e0701a'); R.line(g, -11, 0, 11, 0, '#2a1004', 1.2); R.line(g, 0, -11, 0, 11, '#2a1004', 1.2); g.strokeStyle = '#2a1004'; g.lineWidth = 1; g.beginPath(); g.arc(-14, 0, 11, -0.8, 0.8); g.stroke(); g.beginPath(); g.arc(14, 0, 11, PI - 0.8, PI + 0.8); g.stroke(); g.restore(); } },
      gertie: { fp: t => ({ jaw: Math.sin(t * 5) > 0 ? 0.9 : 0.1, aL: [1.9 + Math.sin(t * 14) * 0.4, 0.3], aR: [1.9 + Math.sin(t * 14) * 0.4, 0.3], head: Math.sin(t * 3) * 0.15 }),
        fx(f, t) { if (once(f, 'h1', t, 0.1) || once(f, 'h2', t, 0.8) || once(f, 'h3', t, 1.6)) SFX.honk(); } },
      rocky: { fp: t => ({ jaw: 0.4 + Math.abs(Math.sin(t * 7)) * 0.3, aL: [0.35, -1.9 + Math.sin(t * 20) * 0.18], aR: [0.35, -1.9 - Math.sin(t * 20) * 0.18], squat: 4 }),
        fx(f, t) { if (Math.random() < 0.2) { const h = fj(f, 'head'); FX.puff(h[0], h[1] + 12, 'rgba(245,245,235,0.9)', 1, 1); } if (once(f, 'c', t, 0.3) || once(f, 'c2', t, 1.3)) SFX.squeak(); } },
      millie: { fp: t => ({ jaw: Math.abs(Math.sin(t * 30)) * 0.6, aL: [2.5, 0.8], aR: [2.5, 0.8], hy: -Math.abs(Math.sin(t * 4)) * 3 }),
        fx(f, t) { if (once(f, 's1', t, 0.3) || once(f, 's2', t, 1.0) || once(f, 's3', t, 1.7)) { SFX.thud(); FX.dust(f.x, FLOOR, 6); } } },
      chucky: { fp: t => ({ aL: [1.65, 1.45 + Math.sin(t * 6) * 0.1], aR: [1.65, 1.45 + Math.sin(t * 6) * 0.1], hy: -2, jaw: once2(t) }),
        fx(f, t) { if (once(f, 'c1', t, 0.1) || once(f, 'c2', t, 0.8) || once(f, 'c3', t, 1.4)) SFX.chirp(); if (Math.random() < 0.05) { const c = fj(f, 'chest'); FX.gib('feather', c[0], c[1], rnd(-60, 60), rnd(-120, -40), { grav: 100, vr: 4, draw: g => R.oval(g, 0, 0, 4, 1.4, '#b0141c', 0, true) }); } } },
      turkey: { fp: t => ({ aL: [0.45, 0.1], aR: [0.45, 0.1], head: Math.sin(t * 6) * 0.2, squat: Math.abs(Math.sin(t * 5)) * 3, jaw: Math.sin(t * 9) > 0.5 ? 0.6 : 0 }),
        fx(f, t) { if (once(f, 'g1', t, 0.2) || once(f, 'g2', t, 1.2)) SFX.yelp(); } },
      wolfe: { fp: t => t < 1.7 ? ({ jaw: 1, aL: [1.0, 0.5], aR: [1.0, 0.5], hy: -2 }) : ({ jaw: 0.1, aR: [0.45, -3.25], aL: [0.6, -1.5] }),
        fx(f, t) { if (once(f, 'howl', t, 0.05)) SFX.howl(); if (once(f, 'sniff', t, 1.8)) { SFX.sniff(); const h = fj(f, 'head'); FX.puff(h[0], h[1] + 6, 'rgba(250,250,250,0.9)', 10, 2); } } },
      em: { fp: t => t < 1.0 ? ({ squat: 10, head: 0.1, aL: [0.35, -0.35], aR: [0.35, -0.35], spread: 1 }) : ({ aR: [2.95, 0.15], aL: [0.6, -1.5] }),
        fx(f, t) { if (once(f, 'ding', t, 1.05)) SFX.ding(); },
        draw(g, f, t) { if (t < 1.0) return; const h = fj(f, 'handR'); g.save(); g.translate(h[0], h[1] - 8); g.fillStyle = '#6a1420'; g.fillRect(-6, -8, 12, 16); g.fillStyle = '#d8b040'; g.fillRect(-4, -4, 8, 1); g.fillRect(-4, -2, 8, 0.7); g.fillStyle = '#f0e8d0'; g.fillRect(6, -7, 1.4, 14); g.restore(); } },
      golem: { fp: t => ({ aL: [2.9 + Math.sin(t * 22) * 0.15, 0.3], aR: [2.9 - Math.sin(t * 22) * 0.15, 0.3], sway: Math.sin(t * 20) * 0.03 }),
        fx(f, t) { if (once(f, 'c', t, 0.2) || once(f, 'c2', t, 0.9)) SFX.clang(); } },
      slumlord: { fp: t => ({ aL: [1.9, 1.7], aR: [2.6 + Math.sin(t * 7) * 0.15, 1.6], head: -0.12 }),
        fx(f, t) { if (once(f, 'b', t, 0.4)) game.bubbles.push({ str: 'STILL GORGEOUS.', x: f.x, y: f.y - hurtH(f) - 20, t: 0, life: 1.8, size: 11, fill: 'gold' }); },
        draw(g, f) { const h = fj(f, 'handL'); g.save(); g.translate(h[0], h[1]); g.fillStyle = '#c89830'; g.fillRect(-1.2, -2, 2.4, 9); g.beginPath(); g.ellipse(0, -8, 5.5, 7, 0, 0, PI * 2); g.fill(); g.fillStyle = '#b8d0e0'; g.beginPath(); g.ellipse(0, -8, 4.2, 5.6, 0, 0, PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-2, -12, 1.2, 4); g.restore(); } },
      dan: { fp: t => ({ jaw: Math.abs(Math.sin(t * 18)) * 0.8, aR: [2.98, 0.08], aL: [0.5, -2.0] }),
        fx(f, t) { if (Math.random() < 0.4) FX.fire(f.x + rnd(-24, 24), FLOOR, 1, 0.9); if (once(f, 'f', t, 0.1)) SFX.fire(); },
        draw(g, f) { const h = fj(f, 'handR'); R.line(g, h[0], h[1] + 26, h[0], h[1] - 40, '#4a2e12', 2.2); R.line(g, h[0] - 6, h[1] - 40, h[0] + 6, h[1] - 40, '#b8b8c0', 1.8); for (let i = -1; i <= 1; i++) R.line(g, h[0] + i * 5.5, h[1] - 40, h[0] + i * 5.5, h[1] - 49, '#c8c8d0', 1.4); } },
      tinman: { fp: t => t < 1.5 ? ({ aL: [1.5 + Math.sin(t * 8) * 0.5, 0.05], aR: [1.5 - Math.sin(t * 8) * 0.5, 0.05], sway: Math.sin(t * 8) * 0.04 }) : ({ aR: [0.55, -2.1], aL: [0.6, -1.5], jaw: 0.4 }),
        fx(f, t) { if (once(f, 'c1', t, 0.15) || once(f, 'c2', t, 0.55) || once(f, 'c3', t, 0.95) || once(f, 'c4', t, 1.6) || once(f, 'c5', t, 2.0)) SFX.clang(); } },
      bunyon: { fp: t => ({ aR: [0.45, -2.5], aL: [0.45, -2.5], sway: Math.sin(t * 2) * 0.02 }),
        fx(f, t) { if (once(f, 's', t, 0.25) || once(f, 's2', t, 1.25)) { SFX.thud(); game.shake = 4; FX.dust(f.x, FLOOR, 14); } } },
      becky: { fp: t => ({ aL: [0.6, -1.5], aR: [0.6, -1.5], head: Math.sin(t * 1.5) * 0.06 }),
        fx(f, t) { if (Math.random() < 0.25) { const c = fj(f, 'chest'); FX.spark(c[0] + rnd(-12, 12), c[1] + rnd(-6, 10), '#eef2ff', 2); } if (once(f, 'd', t, 0.3)) SFX.ding(); } },
      possum: { fp: t => t < 1.5 ? ({ jaw: 1, aL: [1.9 + Math.sin(t * 18) * 0.15, 0.3], aR: [1.9 - Math.sin(t * 18) * 0.15, 0.3], squat: 4 }) : ({ jaw: 0.2, aL: [0.4, 0.2], aR: [0.4, 0.2], squat: 3, head: 0.25 }),
        fx(f, t) { if (once(f, 'h', t, 0.05) || once(f, 'h2', t, 0.9)) SFX.hiss(); } },
      catbear: { fp: t => t < 1.4 ? ({ jaw: 1, aL: [2.9 + Math.sin(t * 10) * 0.15, 0.2], aR: [2.9 - Math.sin(t * 10) * 0.15, 0.2], hy: -Math.abs(Math.sin(t * 5)) * 4 }) : ({ jaw: 0.3, aR: [0.45, -3.2], aL: [0.6, -1.5], squat: 2 }),
        fx(f, t) { if (once(f, 'r', t, 0.1)) SFX.horn(); if (once(f, 'j1', t, 0.65) || once(f, 'j2', t, 1.25)) { SFX.thud(); FX.dust(f.x, FLOOR, 8); } } },
      councilman: { fp: t => t < 1.2 ? ({ aR: [0.6, -2.6], aL: [0.6, -1.5], head: 0.12 }) : ({ aL: [1.35, 1.4], aR: [1.35, 1.4], head: Math.sin(t * 2) * 0.05 }),
        fx(f, t) { if (once(f, 'w', t, 1.5)) { SFX.ding(); game.bubbles.push({ str: 'LOTS OF TALENT IN THE ROOM TODAY.', x: f.x, y: f.y - hurtH(f) - 20, t: 0, life: 2.2, size: 11, fill: 'white' }); } },
        draw(g, f, t) { if (t > 1.2) for (const hn of ['handL', 'handR']) { const h = fj(f, hn); g.fillStyle = '#e8b898'; g.fillRect(h[0] - 1, h[1] - 7, 2, 7); } } },
      prez: { fp: t => t < 1.2 ? ({ aR: [2.5, 1.0], aL: [0.6, -1.5], head: 0.05 }) : ({ aR: [2.95, 0.05], aL: [0.6, -1.5], head: -0.05 }),
        fx(f, t) { if (once(f, 'g', t, 0.25)) SFX.gong(); if (once(f, 'b', t, 1.3)) game.bubbles.push({ str: 'TUITION IS GOING UP.', x: f.x, y: f.y - hurtH(f) - 20, t: 0, life: 2, size: 11, fill: 'white' }); },
        draw(g, f, t) { if (t < 1.2) return; const h = fj(f, 'handR'); g.save(); g.translate(h[0], h[1] - 6); g.fillStyle = '#f2ead4'; g.fillRect(-2.5, -9, 5, 18); g.fillStyle = '#a8141c'; g.fillRect(-2.8, -1.4, 5.6, 2.8); g.restore(); } },
      karen: { fp: t => t < 1.3 ? ({ aL: [1.55, 1.9], aR: [1.55, 1.9], head: Math.sin(t * 3) * 0.08 }) : ({ aR: [1.6, 0.05], aL: [0.6, -1.5], jaw: Math.abs(Math.sin(t * 14)) * 0.7, head: 0.1 }),
        fx(f, t) { if (once(f, 'u', t, 1.4)) game.bubbles.push({ str: 'THIS IS UNACCEPTABLE.', x: f.x, y: f.y - hurtH(f) - 20, t: 0, life: 2, size: 11, fill: 'white' }); } },
      tinkle: { fp: t => ({ aL: [0.95, 1.25], aR: [0.95, 1.25], jaw: 0.3, head: Math.sin(t * 2) * 0.1 }),
        fx(f, t) { if (once(f, 'b', t, 0.3)) game.bubbles.push({ str: 'I FEARED FOR MY LIFE.', x: f.x, y: f.y - hurtH(f) - 20, t: 0, life: 2, size: 11, fill: 'white' }); } },
    };
    return WIN;
  },
};
