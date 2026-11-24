// Muncie Kombat: fatalities, the stage fatality and boss deaths (scripted timelines)
'use strict';
const FATAL = (() => {
  const R = RIG, P = RIG.P, PI = Math.PI;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
  const pick = a => a[(Math.random() * a.length) | 0];
  const ease = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

  function walkTo(f, x, dt, api, sp = 95) {
    const dx = x - f.x;
    if (Math.abs(dx) < 1.5) { f.scriptPose = api.PS.stance(f.t); return true; }
    const s = Math.sign(dx);
    f.x += s * Math.min(Math.abs(dx), sp * dt);
    f.wph = (f.wph || 0) + dt * 9 * s * f.face;
    f.scriptPose = api.PS.walk(f.wph);
    return false;
  }
  const J = (f, name) => R.jointWorld(f, f.pose, name);
  function prop(o) { FX.props.push(o); return o; }
  function center(A, V, api) {
    const mid = (A.x + V.x) / 2, sh = api.AW / 2 - mid;
    A.x += sh; V.x += sh;
    api.setCam(api.AW / 2 - api.W / 2);
    api.flash();
  }
  function headGib(V, x, y, o = {}) {
    return FX.gib('head', x, y, o.vx || 0, o.vy || 0, Object.assign({ trail: true, draw: (g) => R.drawHeadAt(g, { def: V.def, d: V.d }, 0, 8 * V.d.k, 0, 1, { dead: true, t: 0 }) }, o));
  }

  function skullGib(V, x, y, vx, vy) {
    return FX.gib('skull', x, y, vx, vy, { s: 1, vr: 8, trail: true, draw: (g) => R.skull(g, 0, 0, 7.5 * V.d.k * (V.def.skullK || 1), 0, V.def.skull) });
  }
  function start(id, A, V, api) {
    const s = { t: 0, done: false, ev: [], tick: null };
    s.at = (time, fn) => s.ev.push({ time, fn });
    s.update = dt => {
      s.t += dt; A.t += dt; V.t += dt;
      for (const e of s.ev) if (!e.f && s.t >= e.time) { e.f = 1; e.fn(); }
      if (s.tick) s.tick(s.t, dt);
    };
    if (!['golemDie', 'danDie', 'slumDie', 'bridge', 'overpass'].includes(id)) center(A, V, api);
    if (Math.abs(V.x - A.x) > 1) A.face = Math.sign(V.x - A.x);
    V.face = -A.face;
    A.scriptPose = api.PS.stance(A.t); V.scriptPose = api.PS.dizzy(V.t);
    A.ro = {}; V.ro = {};
    (S[id] || S.generic)(s, A, V, api);
    return s;
  }

  const S = {};

  // ---------- MUNCIE HIPPO: Pothole Filler ----------
  S.hippo = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    const gap = 26 * k + 10;
    let x0, y0;
    s.at(0.95, () => { x0 = V.x; y0 = V.y; api.sfx('scream'); });
    s.at(1.55, () => { V.hidden = true; api.sfx('gulp'); A.st2.belly = 1.7; api.shake(2); });
    s.at(2.35, () => { A.face = -A.face; api.sfx('thud'); });
    s.at(2.75, () => {
      api.sfx('fart'); api.sfx('crunch'); api.shake(6); A.st2.belly = 1;
      const hp = J(A, 'hip'), bx = hp[0] - A.face * 14 * k, by = hp[1];
      FX.puff(bx, by, 'rgba(90,60,26,0.9)', 18, 4); FX.blood(bx, by, 30, -A.face, 1.2);
      // the skeleton comes out already flying apart: bones in every direction
      skullGib(V, bx, by, -A.face * rnd(260, 420), rnd(-560, -380));
      for (let i = 0; i < 34; i++) { const a = rnd(0, PI * 2), sp = rnd(250, 720); FX.gib(pick(['bone', 'bone', 'bone', 'tooth', 'skullfrag']), bx, by, Math.cos(a) * sp - A.face * 120, Math.sin(a) * sp - 220, { s: rnd(0.8, 1.7), vr: rnd(-24, 24) }); }
      FX.burst(bx, by, 8, ['chunk', 'guts'], 1.2); FX.drops(6); api.flash();
      for (let i = 0; i < 5; i++) FX.gib('poop', bx, by, -A.face * rnd(60, 200), rnd(-200, -60));
    });
    s.at(3.3, () => { A.face = -A.face; });
    s.at(3.5, () => api.bubble('BURP.', A.x + A.face * 20, F - 140, { size: 13, fill: 'purple' }));
    s.at(4.4, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.7) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * gap, dt, api, 110); return; }
      if (t < 1.55) {
        const jaw = Math.min(1, (t - 0.7) / 0.25);
        A.scriptPose = P({ hy: 3, lean: 0.25, head: 0.55, jaw, aF: [1.5, 1.2], aB: [1.3, 1.4], fF: [14, 0], fB: [-13, 0] });
        if (t > 0.95) {
          const u = ease((t - 0.95) / 0.6), nk = J(A, 'neck');
          const mx = nk[0] + A.face * 24 * k, my = nk[1] - 2;
          V.ro.scale = 1 - 0.9 * u;
          V.x = lerp(x0, mx, u); V.y = lerp(y0, my + 10, u);
          V.scriptPose = PS.air(Math.sin(t * 30) * 0.3 - 0.4);
          FX.blood(V.x, V.y - 20 * (1 - u), 1, -A.face, 0.5);
        } else V.scriptPose = PS.dizzy(V.t);
        return;
      }
      if (t < 2.35) { A.scriptPose = P({ hy: 3 + Math.sin(t * 20), lean: 0.1, head: 0.2, jaw: Math.abs(Math.sin(t * 9)) * 0.3, aF: [0.9, 1.2], aB: [0.7, 1.4], fF: [12, 0], fB: [-12, 0] }); A.st2.belly = 1.7 + Math.sin(t * 14) * 0.15; return; }
      if (t < 3.3) { A.scriptPose = P({ hy: 8, lean: 0.85, head: 0.3, aF: [0.6, 0.6], aB: [0.4, 0.6], fF: [12, 0], fB: [-13, 0] }); if (t < 2.75) A.ro.dx = rnd(-1, 1); else A.ro.dx = 0; return; }
      A.scriptPose = api.PS.win(A.t);
    };
  };

  // ---------- PAINTER DUDE: Happy Little Accident ----------
  S.painter = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    const raise = a => P({ hy: 2, lean: -0.1, aF: [a, 0.1], aB: [0.55, 1.95], fF: [12, 0], fB: [-13, 0] });
    let easel = null, hand = null, swingA = 0, dropped = false, sig = 0;
    s.at(0.6, () => {
      A.scriptPose = raise(2.75); A.snapPose = true;
      const hh = api.hurtH(V);
      const hd = R.jointWorld(A, R.resolve(A.d, raise(2.75)), 'handF'), Lh = hh * 0.95;
      easel = prop({ layer: 'back', x: hd[0] + A.face * (Math.sin(1.2) * Lh + 12), y: hd[1] + Math.cos(1.2) * Lh + 2, splats: [], draw(g, p) {
        g.fillStyle = '#5a3a1a';
        R.line(g, p.x - 12, F, p.x - 4, p.y - 26, '#6a4422', 2.5); R.line(g, p.x + 12, F, p.x + 4, p.y - 26, '#6a4422', 2.5); R.line(g, p.x, F - 4, p.x, p.y - 30, '#5a3a1a', 2);
        g.fillStyle = '#f4f0e4'; g.fillRect(p.x - 17, p.y - 22, 34, 40);
        g.fillStyle = '#9ac0e0'; g.fillRect(p.x - 17, p.y - 22, 34, 12); g.fillStyle = '#3a6a3a'; R.poly(g, [[p.x - 17, p.y - 4], [p.x - 6, p.y - 16], [p.x + 4, p.y - 6], [p.x + 17, p.y - 14], [p.x + 17, p.y + 2], [p.x - 17, p.y + 2]], '#4a6a4a');
        for (const sp of p.splats) { g.fillStyle = sp.c; g.beginPath(); g.arc(p.x + sp.x, p.y + sp.y, sp.r, 0, PI * 2); g.fill(); if (sp.d) g.fillRect(p.x + sp.x - 0.6, p.y + sp.y, 1.2, Math.min(sp.d, 18 - sp.y)); }
        if (sig > 0) { g.strokeStyle = '#1a1a1a'; g.lineWidth = 0.9; g.beginPath(); for (let i = 0; i < sig * 12; i++) { const xx = p.x + 2 + i * 1.2, yy = p.y + 14 + Math.sin(i * 1.7) * 1.6; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
        g.fillStyle = '#3a2a1a'; g.fillRect(p.x - 19, p.y + 18, 38, 3);
      } });
      void hh;
    });
    const splat = (n, big) => { for (let i = 0; i < n; i++) easel.splats.push({ x: rnd(-15, 15), y: rnd(-18, 14), r: rnd(1.5, big ? 6 : 4), c: Math.random() < 0.5 ? '#9a000c' : '#c0101a', d: Math.random() < 0.5 ? rnd(4, 14) : 0 }); };
    // swish swish: whack the victim back and forth like a wet brush, faster and faster
    const hits = [1.45, 1.75, 2.0, 2.2, 2.38, 2.53, 2.66, 2.78, 2.89, 2.99];
    const side = i => i % 2 ? -1.25 : 1.2;
    let can = null;
    s.at(0.62, () => {
      const hh = api.hurtH(V), hd = R.jointWorld(A, R.resolve(A.d, raise(2.75)), 'handF'), Lh = hh * 0.95;
      can = prop({ layer: 'back', x: hd[0] - A.face * (Math.sin(1.25) * Lh + 6), dents: 0, draw(g, p) {
        const x = p.x, h = 34;
        g.fillStyle = '#5a5e64'; g.fillRect(x - 11, F - h, 22, h); g.fillStyle = '#8a9098'; g.fillRect(x - 11, F - h, 4, h); g.fillStyle = '#3a3e44'; g.fillRect(x + 7, F - h, 4, h);
        g.fillStyle = '#2a2c30'; for (let i = 1; i < 4; i++) g.fillRect(x - 11, F - h + i * 8, 22, 1.2);
        g.fillStyle = '#6a6e74'; g.fillRect(x - 13, F - h - 3, 26, 3);
        g.fillStyle = 'rgba(140,0,12,0.8)'; for (let i = 0; i < p.dents; i++) g.fillRect(x - 10 + (i * 7) % 20, F - h + 2 + (i * 5) % 18, 2, 4 + i % 3);
      } });
      api.bubble("LET'S BEAT THE DEVIL OUT OF IT.", A.x, F - 160, { size: 11, life: 1.6, fill: 'white' });
    });
    hits.forEach((h, i) => s.at(h, () => {
      const last = i === hits.length - 1, front = side(i) > 0;
      api.sfx(front ? 'splat' : 'clang'); api.sfx('crunch'); api.shake(last ? 8 : 3);
      const hp = J(V, 'head');
      // blood flicks off in arcs, like paint off a brush
      for (let j = 0; j < 3; j++) FX.blood(hp[0], hp[1], last ? 30 : 12, (front ? 1 : -1) * A.face, last ? 1.6 : 1.2);
      if (front) splat(last ? 14 : 4, last); else if (can) can.dents++;
      if (i > 2 && Math.random() < 0.6) FX.gib('tooth', hp[0], hp[1], rnd(-200, 200), rnd(-300, -100));
      if (i === 6) FX.gib('eye', hp[0], hp[1], rnd(-150, 150), -280);
      if (last) { V.ro.noHead = true; FX.burst(hp[0], hp[1], 12, ['brain', 'eye', 'skullfrag', 'chunk', 'tooth', 'skullfrag'], 1.1); skullGib(V, hp[0], hp[1], -A.face * 120, -260); api.flash(); }
    }));
    s.at(3.35, () => { dropped = true; V.scriptPose = PS.down(V); V.snapPose = true; V.x = hand[0] + A.face * 20; V.y = F; V.ro.noHead = true; api.sfx('thud'); FX.blood(V.x, F - 6, 12, 0, 0.6); });
    s.at(4.3, () => api.bubble('THERE. NICE AND CLEAN.', A.x, F - 150, { size: 12, life: 2, fill: 'white' }));
    s.at(5.4, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.6) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 30 * k, dt, api, 110); return; }
      if (!dropped) {
        // swing: 0 = hanging, ~1.2 = head into the canvas
        if (t < 1.05) swingA = -0.3 * ease((t - 0.6) / 0.45);
        else if (t < hits[hits.length - 1]) {
          let i = 0; while (i < hits.length && hits[i] <= t) i++;
          const t0 = i ? hits[i - 1] : 1.05, a0 = i ? side(i - 1) : -0.3, u = (t - t0) / (hits[i] - t0);
          swingA = a0 + (side(i) - a0) * u * u;
        }
        else swingA = lerp(swingA, 0, dt * 6);
        A.scriptPose = raise(2.75 - Math.max(0, swingA) * 0.6);
        hand = J(A, 'handF');
        V.x = hand[0]; V.y = hand[1] + 2;
        V.scriptPose = P({ rot: PI + swingA, piv: 1, aF: [3.0 + Math.sin(t * 9) * 0.2, 0.1], aB: [3.25, 0.1], lF: [0.04, 0], lB: [-0.04, 0], hyA: 0 });
        return;
      }
      if (t < 4.0) { walkTo(A, easel.x - A.face * 30, dt, api, 80); return; }
      sig = Math.min(1, sig + dt * 1.5);
      A.scriptPose = P({ hy: 3, lean: 0.15, aF: [1.6 + Math.sin(t * 25) * 0.08, 0.3], aB: [0.55, 1.95], fF: [12, 0], fB: [-13, 0] });
    };
  };

  // ---------- GARF CAT: I Hate Mondays ----------
  S.garf = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    let can = false, lighter = false, burning = false, ash = 0, pour = 0, x0 = 0;
    const who = V.def.him === 'HER' ? 'SHE' : 'HE';
    prop({ layer: 'front', draw(g) {
      if (can) { const h = J(A, 'handF'); g.save(); g.translate(h[0], h[1]); g.rotate(A.face * (0.3 + pour * 1.3)); g.scale(A.face, 1); g.fillStyle = '#b81c1c'; g.fillRect(-4, -6, 9, 12); g.fillStyle = '#e8c020'; g.fillRect(-4, -2, 9, 2.4); g.fillStyle = '#2a2a2a'; g.fillRect(4, -7, 4, 2.4); g.restore();
        if (pour > 0.3) { g.strokeStyle = 'rgba(220,200,120,0.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(h[0] + A.face * 8, h[1] - 4); const c = J(V, 'chest'); g.quadraticCurveTo((h[0] + c[0]) / 2, h[1] - 16, c[0], c[1] - 6 + Math.sin(s.t * 30) * 6); g.stroke(); } }
      if (lighter) { const h = J(A, 'handF'); g.fillStyle = '#c8c8d0'; g.fillRect(h[0] - 1.5, h[1] - 5, 3, 6); g.fillStyle = '#ffd040'; g.beginPath(); g.ellipse(h[0], h[1] - 8, 1.6, 3 + Math.sin(s.t * 40), 0, 0, PI * 2); g.fill(); }
      if (ash > 0) { g.fillStyle = '#4a4848'; g.beginPath(); g.ellipse(V.x, F, 8 + ash * 30, 3 + ash * 11, 0, PI, PI * 2); g.fill(); g.fillStyle = 'rgba(120,118,115,0.8)'; for (let i = 0; i < 10; i++) g.fillRect(V.x - ash * 18 + (i * 7.3) % (ash * 36 + 1), F - 2 - (i % 3) * ash * 2, 2, 1); if (ash > 0.8) { g.save(); g.filter = 'brightness(0.42)'; R.skull(g, V.x + 8, F - 8, 6 * V.d.k * (V.def.skullK || 1), 0.3, V.def.skull); g.restore(); } }
    } });
    s.at(0.5, () => { can = true; api.sfx('clang'); });
    s.at(0.75, () => { api.sfx('splat'); });
    s.at(1.35, () => { can = false; lighter = true; api.sfx('blip'); });
    s.at(1.6, () => {
      // WHOOMPH
      lighter = false; burning = true; V.ro.char = true; api.sfx('fire'); api.sfx('big'); api.sfx('scream'); api.shake(12); api.flash();
      const c = J(V, 'chest'), hh = api.hurtH(V); for (let i = 0; i < 160; i++) FX.fire(c[0] + rnd(-55, 55), V.y - rnd(0, hh * 1.5), 1, 2.4);
      for (let i = 0; i < 6; i++) FX.puff(c[0] + rnd(-30, 30), c[1] - rnd(0, 60), 'rgba(255,120,30,0.7)', 6, 8);
      FX.puff(c[0], c[1], 'rgba(255,170,60,0.8)', 24, 6);
    });
    s.at(3.4, () => { burning = false; V.ro.skeleton = true; V.ro.ash = true; api.sfx('fire'); });
    s.at(4.3, () => {
      V.hidden = true; api.sfx('crunch'); api.shake(3);
      const hh = api.hurtH(V); for (let i = 0; i < 40; i++) FX.puff(V.x + rnd(-14, 14), F - rnd(0, hh), 'rgba(90,88,86,0.8)', 1, 2);
    });
    s.at(5.0, () => api.bubble(`I THINK ${who} SAID I LOVE LASAGNA.`, A.x, F - 150, { size: 11, fill: 'gold', life: 2.4 }));
    s.at(6.8, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 46 * k, dt, api, 110); x0 = A.x; return; }
      if (t < 1.35) { pour = Math.min(1, (t - 0.6) / 0.3); A.scriptPose = P({ hy: 4, lean: 0.25, aF: [1.9, 0.2], aB: [0.6, 1.6], fF: [15, 0], fB: [-13, 0] }); V.scriptPose = PS.dizzy(V.t); if (pour > 0.3 && Math.random() < 0.5) { const c = J(V, 'chest'); FX.puff(c[0], c[1], 'rgba(220,210,140,0.5)', 1, 1); } return; }
      if (t < 1.6) { A.scriptPose = P({ hy: 4, lean: 0.1, aF: [1.6, 0.4], aB: [0.6, 1.6], fF: [14, 0], fB: [-13, 0] }); return; }
      if (t < 3.4) {
        // he backs off and watches; the victim flails inside the fire
        A.x = lerp(x0, x0 - A.face * 30, (t - 1.6) / 0.4); A.scriptPose = P({ hy: 6, lean: -0.15, head: -0.1, aF: [0.7, 2.0], aB: [0.6, 2.1], fF: [13, 0], fB: [-13, 0] });
        V.scriptPose = P({ hy: 5, lean: Math.sin(t * 9) * 0.3, head: Math.sin(t * 13) * 0.5, aF: [2.6 + Math.sin(t * 17) * 0.5, 0.6], aB: [2.4 + Math.cos(t * 15) * 0.5, 0.6], fF: [8 + Math.sin(t * 11) * 5, 0], fB: [-10, 0] });
        V.ro.dx = Math.sin(t * 7) * 4;
        if (burning) for (const j of ['head', 'chest', 'belly', 'handF', 'handBx', 'kneeF', 'kneeB']) if (Math.random() < 0.7) { const p = J(V, j); FX.fire(p[0] + rnd(-4, 4), p[1], 1, 1.1); }
        if (Math.random() < 0.4) FX.puff(V.x, V.y - api.hurtH(V), 'rgba(30,28,26,0.6)', 1, 3);
        return;
      }
      V.ro.dx = 0;
      if (t < 4.3) { V.scriptPose = P({ hy: 3, lean: 0.05, head: 0.2, aF: [1.2, 0.8], aB: [1.0, 0.9], fF: [8, 0], fB: [-10, 0] }); if (Math.random() < 0.5) FX.puff(V.x + rnd(-8, 8), V.y - rnd(20, 90), 'rgba(70,68,66,0.5)', 1, 2); return; }
      ash = Math.min(1, (t - 4.3) / 0.5);
      A.scriptPose = t < 5.0 ? PS.stance(A.t) : P({ hy: 4, lean: 0.1, head: 0.3, aF: [2.3, 2.6], aB: [0.5, 1.6], fF: [13, 0], fB: [-13, 0] });
    };
  };

  // ---------- LATE NIGHT HOST: Top Ten List ----------
  S.host = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    const items = ['SPLEEN', 'APPENDIX', 'KIDNEY', 'OTHER KIDNEY', 'LIVER', 'STOMACH', 'LUNGS', 'GUTS', 'HEART', 'SPINE'];
    const kinds = ['spleen', 'appendix', 'kidney', 'kidney', 'liver', 'stomach', 'lung', 'guts', 'heart'];
    let shown = 0, spine = false;
    const thrust = P({ hy: 4, lean: 0.4, aF: [1.5, 0.05], aB: [0.6, 1.9], fF: [17, 0], fB: [-13, 0] });
    const pull = P({ hy: 3, lean: -0.15, aF: [2.6, 0.5], aB: [0.6, 1.9], fF: [13, 0], fB: [-13, 0] });
    prop({ layer: 'front', draw(g) {
      const x = api.cam + 8, y = 34, w = 120;
      g.fillStyle = 'rgba(10,14,40,0.88)'; g.fillRect(x, y, w, 26 + 10 * 13); g.strokeStyle = '#c8a030'; g.lineWidth = 1.5; g.strokeRect(x + 0.5, y + 0.5, w - 1, 25 + 10 * 13);
      TXT.draw(g, 'TOP TEN LIST', x + w / 2, y + 4, { size: 13, align: 'center', fill: 'gold' });
      for (let i = 0; i < shown; i++) TXT.draw(g, (10 - i) + '. ' + items[i], x + 8, y + 24 + i * 13, { size: 10, fill: i === 9 ? 'blood' : 'white', italic: false });
    } });
    for (let i = 0; i < 9; i++) {
      const t0 = 0.7 + i * 0.3;
      s.at(t0, () => { A.scriptPose = thrust; api.sfx('punch'); });
      s.at(t0 + 0.12, () => {
        A.scriptPose = pull; shown = i + 1; api.sfx('splat');
        const c = J(V, 'chest');
        FX.gib(kinds[i], c[0], c[1], -A.face * rnd(70, 150), rnd(-330, -250), { s: 1.3 });
        FX.blood(c[0], c[1], 14, -A.face, 1);
        V.ro.dx = A.face * 2;
      });
    }
    s.at(3.6, () => { A.scriptPose = P({ hy: 4, lean: 0.25, aF: [2.2, 0.4], aB: [0.6, 1.9], fF: [16, 0], fB: [-13, 0] }); });
    s.at(4.0, () => {
      shown = 10; spine = true; V.ro.noHead = true; V.scriptPose = PS.down(V); V.snapPose = true; V.x += A.face * 12;
      api.sfx('crunch'); api.sfx('splat'); api.shake(6); api.flash();
      const nk = J(V, 'neck'); FX.blood(nk[0], nk[1], 50, -A.face, 1.4);
      A.scriptPose = P({ hy: 2, lean: -0.1, aF: [1.85, 0.0], aB: [0.5, 2.0], fF: [11, 0], fB: [-12, 0] }); A.x -= A.face * 14;
    });
    prop({ layer: 'front', draw(g) { if (!spine) return; const h = J(A, 'handF'); g.save(); g.translate(h[0] + A.face * 3, h[1] + 2); FX.drawSpine(g, 46 * V.d.k, V.d.k, V.def.skull); g.restore(); } });
    s.at(5.2, () => { spine = false; const h = J(A, 'handF'); FX.gib('spine', h[0], h[1], -A.face * 160, -120, { vr: 8, s: 1, draw: g => FX.drawSpine(g, 46 * V.d.k, V.d.k, V.def.skull) }); api.sfx('thud'); A.scriptPose = P({ hy: 4, lean: 0.3, aF: [0.6, 0.2], aB: [0.6, 1.9], fF: [14, 0], fB: [-13, 0] }); });
    s.at(3.55, () => api.bubble('AND THE NUMBER ONE...', A.x - A.face * 10, F - 168, { size: 11, life: 1.6, fill: 'gold' }));
    s.at(6.0, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.7) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 30 * k, dt, api, 110); return; }
      if (V.ro.dx) V.ro.dx *= 0.8;
      if (!spine) V.scriptPose = P({ hy: 6 + (t - 0.7) * 3, lean: 0.25 + (t - 0.7) * 0.08, head: 0.3, aF: [0.4, 0.3], aB: [0.3, 0.3], fF: [9, 0], fB: [-10, 0] });
      if (spine && Math.random() < 0.5) { const h = J(A, 'handF'); FX.blood(h[0], h[1] + 46 * V.d.k, 1, 0, 0.2); }
    };
  };

  // ---------- BALLIN' WELL: Posterized ----------
  S.ballin = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    const d = -A.face, rimY = F - 176;
    const reach = F - R.jointWorld(Object.assign({}, A, { y: F }), R.resolve(A.d, P({ hy: -2, lean: -0.1, aF: [3.1, 0.05], aB: [2.6, 0.3], lF: [0.3, 0.6], lB: [-0.1, 0.4] })), 'handF')[1];
    const jumpH = Math.max(12, Math.min(90, 176 - reach + 16)), hangY = F - (176 - reach) - 4;
    let head = null, hoopX, drop = -160, shattered = false, jumpX0;
    s.at(0.5, () => { A.scriptPose = P({ hy: 4, lean: 0.2, aF: [2.2, 0.2], aB: [0.6, 1.9], fF: [16, 0], fB: [-13, 0] }); });
    s.at(1.1, () => {
      V.ro.noHead = true; api.sfx('crunch'); api.sfx('splat'); api.shake(5);
      head = headGib(V, 0, 0, { follow: () => { const h = J(A, 'handF'); return [h[0], h[1] - 6 * V.d.k, 0]; } });
      hoopX = Math.max(api.cam + 50, Math.min(api.cam + api.W - 50, A.x + d * 110));
      prop({ layer: 'back', draw(g) {
        const y = rimY + drop, bx = hoopX + d * 16;
        R.line(g, bx + d * 26, F, bx + d * 26, y - 20, '#3a3a40', 4); R.line(g, bx + d * 26, y - 10, bx, y - 10, '#3a3a40', 3);
        if (!shattered) { g.fillStyle = 'rgba(220,235,245,0.7)'; g.fillRect(bx - 2, y - 34, 4, 40); g.strokeStyle = '#f4f4f4'; g.lineWidth = 1; g.strokeRect(bx - 2, y - 34, 4, 40); }
        else { g.fillStyle = 'rgba(220,235,245,0.4)'; g.fillRect(bx - 2, y - 34, 4, 6); }
        g.strokeStyle = '#e8e8ec'; g.lineWidth = 0.7; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(hoopX + i * 3, y); g.lineTo(hoopX + i * 2, y + 14); g.stroke(); }
        g.strokeStyle = '#e8601a'; g.lineWidth = 2; g.beginPath(); g.ellipse(hoopX, y, 11, 2.5, 0, 0, PI * 2); g.stroke();
      } });
      api.sfx('clang');
    });
    s.at(1.6, () => { A.face = -A.face; });
    s.at(2.05, () => { jumpX0 = A.x; api.sfx('whoosh'); });
    s.at(2.45, () => {
      shattered = true; api.sfx('shatter'); api.sfx('big'); api.shake(8); api.flash();
      for (let i = 0; i < 26; i++) FX.gib('shard', hoopX + d * 16, rimY - 14 + rnd(-18, 18), rnd(-160, 160), rnd(-260, 40));
      head.follow = null; head.x = hoopX; head.y = rimY + 4; head.vx = 0; head.vy = 160; head.vr = 6; head.onRest = () => api.sfx('thud');
      FX.blood(hoopX, rimY + 4, 20, 0, 0.6);
    });
    s.at(2.1, () => { V.scriptPose = PS.downFace(V); api.sfx('thud'); });
    s.at(3.4, () => api.bubble('POSTERIZED!', A.x, F - 150, { size: 15, fill: 'fire', life: 1.8 }));
    s.at(4.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 22 * k, dt, api, 110); return; }
      if (t < 1.1) { V.ro.dx = rnd(-1.5, 1.5); A.scriptPose = P({ hy: 4, lean: lerp(0.2, -0.4, (t - 0.5) / 0.6), aF: [lerp(2.0, 2.6, (t - 0.5) / 0.6), 0.2], aB: [0.6, 1.9], fF: [16, 0], fB: [-13, 0] }); return; }
      V.ro.dx = 0;
      if (t < 2.1) { const nk = J(V, 'neck'); FX.spurt(nk[0], nk[1], V.face * 0.2, 1); }
      drop = t < 1.5 ? lerp(-160, 0, ease((t - 1.1) / 0.4)) : 0;
      if (t < 1.6) { A.scriptPose = P({ hy: 3, lean: -0.1, aF: [2.9, 0.1], aB: [0.6, 1.9], fF: [12, 0], fB: [-12, 0] }); return; }
      if (t < 2.05) { A.x += (hoopX - A.face * 34 - A.x) * Math.min(1, dt * 7); A.wph = (A.wph || 0) + dt * 14; A.scriptPose = Object.assign({}, PS.run(A.wph), { aF: [2.9, 0.1] }); return; }
      if (t < 2.45) { const u = (t - 2.05) / 0.4; A.x = lerp(jumpX0, hoopX - A.face * 10, u); A.y = F - Math.sin(u * PI * 0.5) * jumpH; A.scriptPose = P({ hy: -2, lean: -0.1, aF: [3.1, 0.05], aB: [2.6, 0.3], lF: [1.4, 2.3], lB: [0.8, 2.2] }); return; }
      if (t < 2.95) { A.scriptPose = P({ hy: 0, lean: 0.05, aF: [3.1, 0.05], aB: [3.0, 0.1], lF: [0.3, 0.6], lB: [-0.1, 0.4] }); A.y = Math.min(F, hangY) + Math.sin((t - 2.45) * 20) * 2; return; }
      if (t < 3.2) { A.y = lerp(Math.min(F, hangY), F, (t - 2.95) / 0.25); A.scriptPose = PS.jump; return; }
      A.y = F; A.scriptPose = PS.win(A.t);
    };
  };

  // ---------- GERTIE: Honk ----------
  S.gertie = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    const rings = prop({ layer: 'front', list: [], update(p, dt) { for (const r of p.list) r.t += dt; p.list = p.list.filter(r => r.t < 0.6); }, draw(g, p) {
      for (const r of p.list) { g.strokeStyle = `rgba(255,255,255,${0.8 - r.t})`; g.lineWidth = 2; g.beginPath(); const rad = 6 + r.t * 90; g.arc(r.x, r.y, rad, A.face > 0 ? -0.6 : PI - 0.6, A.face > 0 ? 0.6 : PI + 0.6); g.stroke(); }
    } });
    let hs = 1, popped = false, stump = null, nextHonk = 0.5;
    const flush = prop({ layer: 'front', draw(g) { if (popped || hs <= 1.05) return; const h = J(V, 'head'); g.fillStyle = `rgba(220,20,40,${Math.min(0.5, (hs - 1) * 0.35)})`; g.beginPath(); g.arc(h[0] + V.face * 2, h[1] - 4 * hs, 9 * V.d.k * hs, 0, PI * 2); g.fill(); } });
    void flush;
    s.at(2.1, () => {
      popped = true; V.ro.noHead = true; V.ro.headScale = 1;
      const h = J(V, 'head');
      api.sfx('splat'); api.sfx('crunch'); api.shake(8); api.flash();
      FX.burst(h[0], h[1], 18, ['brain', 'eye', 'skullfrag', 'chunk', 'tooth', 'skullfrag', 'chunk', 'eye', 'brain'], 1.3);
      skullGib(V, h[0], h[1], -A.face * 90, -420);
      FX.blood(h[0], h[1], 70, 0, 1.6, 1.4);
      FX.drops(5);
    });
    s.at(3.0, () => { V.scriptPose = PS.downFace(V); api.sfx('thud'); setTimeout(() => {}, 0); });
    s.at(3.1, () => { const nk = J(V, 'neck'); stump = nk[0]; });
    s.at(3.9, () => { api.bubble('HSSSSSSS!', A.x, F - 120, { size: 14, fill: 'white', life: 1.4 }); api.sfx('slash'); });
    s.at(5.0, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 44 * k, dt, api, 110); return; }
      if (t < 2.1) {
        A.scriptPose = P({ hy: 4, lean: 0.5 + Math.sin(t * 30) * 0.04, head: 0.7, aF: [2.3, 0.4], aB: [2.1, 0.4], fF: [14, 0], fB: [-14, 0] });
        if (t >= nextHonk) { nextHonk = t + 0.2; api.sfx('honk'); const b = J(A, 'head'); rings.list.push({ x: b[0] + A.face * 10, y: b[1] - 4, t: 0 }); }
        hs = 1 + 1.7 * ease((t - 0.6) / 1.5);
        V.ro.headScale = hs; V.ro.dx = rnd(-1, 1) * hs;
        V.scriptPose = P({ hy: 4, lean: -0.2, head: Math.sin(t * 20) * 0.3, aF: [2.4 + Math.sin(t * 17) * 0.4, 0.5], aB: [2.2 + Math.cos(t * 15) * 0.4, 0.6], fF: [9, 0], fB: [-10, 0] });
        return;
      }
      V.ro.dx = 0;
      if (t < 3.0) { const nk = J(V, 'neck'); FX.spurt(nk[0], nk[1], 0, 1.1); V.scriptPose = P({ hy: 6, lean: 0.1, aF: [0.8, 0.4], aB: [0.6, 0.4], fF: [9, 0], fB: [-10, 0] }); A.scriptPose = PS.stance(A.t); return; }
      if (t < 3.8 && stump != null) { const tx = stump - Math.sign(stump - A.x || 1) * 30; if (Math.abs(stump - A.x) > 3) A.face = Math.sign(stump - A.x); walkTo(A, tx, dt, api, 90); return; }
      A.scriptPose = P({ hy: 10, lean: 1.0, head: 0.9, aF: [2.6 + Math.sin(t * 12) * 0.1, 0.3], aB: [2.4, 0.3], fF: [14, 0], fB: [-14, 0] });
    };
  };

  // ---------- ROCKY: Rabies (drag the leftovers to the dumpster) ----------
  S.rocky = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR, k = A.d.k;
    let x0, nextChomp = 0.6, dragFrom = 0, skel = null, nextFoam = 0;
    const dumpX = Math.max(api.cam + 56, Math.min(api.cam + api.W - 56, A.x - A.face * 130));
    const DW = 44, DH = 46, back = -A.face;
    const dump = { x: dumpX, lid: 0 };
    const box = (g, x) => {
      g.fillStyle = '#1e4a2a'; g.fillRect(x - DW, F - DH, DW * 2, DH);
      g.fillStyle = '#2a6a3a'; g.fillRect(x - DW - 2, F - DH, DW * 2 + 4, 4);
      g.fillStyle = '#143220'; for (let i = -DW + 6; i < DW; i += 9) g.fillRect(x + i, F - DH + 7, 1.6, DH - 12);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - DW, F - 8, DW * 2, 8);
      g.fillStyle = '#3a2a10'; g.fillRect(x - 20, F - 30, 40, 9);
      g.fillStyle = '#e8e0c0'; g.font = '7px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.fillText('CITY OF MUNCIE', x, F - 23); g.textAlign = 'left';
      R.ball(g, x - DW + 6, F - 2, 3, '#111'); R.ball(g, x + DW - 6, F - 2, 3, '#111');
    };
    // lid raised behind the box, then the box face in front (so whatever goes in disappears)
    prop({ layer: 'back', draw(g) {
      g.fillStyle = '#0c140e'; g.fillRect(dump.x - DW, F - DH - 2, DW * 2, 4);
      if (dump.lid > 0.05) { g.save(); g.translate(dump.x + back * DW, F - DH); g.rotate(back * dump.lid * 1.5); g.fillStyle = '#2a2a2e'; g.fillRect(back > 0 ? -DW * 2 - 2 : 0, -3, DW * 2 + 2, 4); g.restore(); }
    } });
    prop({ layer: 'front', draw(g) {
      box(g, dump.x);
      if (dump.lid <= 0.05) { g.fillStyle = '#2a2a2e'; g.fillRect(dump.x - DW - 2, F - DH - 4, DW * 2 + 4, 4); }
    } });
    s.at(0.25, () => { x0 = A.x; api.sfx('scream'); });
    s.at(2.4, () => {
      V.ro.skeleton = true; V.ro.gore = true; api.sfx('crunch'); api.shake(5);
      const c = J(V, 'chest'); FX.blood(c[0], c[1], 50, 0, 1.3); FX.burst(c[0], c[1], 10, ['chunk', 'chunk', 'guts', 'heart', 'eye'], 1);
      A.y = F; A.x = V.x - A.face * 30; A.snapPose = true;
    });
    s.at(2.5, () => { V.scriptPose = PS.down(V); });
    s.at(2.95, () => { api.sfx('thud'); FX.dust(V.x, F, 10); });
    s.at(3.05, () => { dragFrom = A.x; api.sfx('squeak'); });
    s.at(4.35, () => { A.face = back; A.snapPose = true; dump.lid = 1; api.sfx('clang'); });
    s.at(4.4, () => {
      V.hidden = true;
      const hh = api.hurtH(V), pose = P({ aF: [2.7, 0.3], aB: [2.4, 0.4], lF: [0.15, 0.1], lB: [-0.1, 0.15], head: 0.2 });
      skel = FX.gib('skel', V.x, F - 6, 0, 0, { trail: false, draw: (g, o) => { g.save(); g.rotate(-o.rot); g.translate(-o.x, -o.y); g.beginPath(); g.rect(o.x - 300, o.y - 400, 600, 400 + (F - 3 - o.y)); g.clip(); g.translate(o.x, o.y); g.rotate(o.rot); R.draw(g, { def: V.def, d: V.d, x: 0, y: hh * 0.5, face: 1, t: 0 }, pose, { skeleton: true, gore: true }); g.restore(); }, follow: () => {
        const t = s.t, hd = J(A, 'head'), over = [A.x + A.face * 6, hd[1] - 22 * k], top = [dump.x, F - DH - 26], bot = [dump.x, F + hh * 0.45];
        if (t < 4.85) { const u = ease((t - 4.4) / 0.45); return [lerp(V.x, over[0], u), lerp(F - 6, over[1], u), lerp(-A.face * PI / 2, A.face * PI / 2, u)]; }
        if (t < 5.2) { const u = ease((t - 4.85) / 0.35); return [lerp(over[0], top[0], u), lerp(over[1], top[1], u), A.face * (PI / 2 + u * 0.75)]; }
        const u = Math.min(1, ((t - 5.2) / 0.5) ** 1.6); return [top[0], lerp(top[1], bot[1], u), A.face * (PI / 2 + 0.75 + u * 0.75)];
      } });
    });
    s.at(5.6, () => { api.sfx('crunch'); api.shake(4); FX.blood(dump.x, F - DH, 16, 0, 0.8); FX.gib('bone', dump.x, F - DH - 4, rnd(-90, 90), -260, { s: 0.5 }); });
    s.at(5.9, () => { dump.lid = 0; api.sfx('clang'); api.shake(5); if (skel) skel.dead = true; });
    s.at(6.4, () => { api.sfx('land'); api.shake(2); });
    s.at(6.55, () => api.bubble('HEH HEH HEH', dump.x, F - 150, { size: 12, fill: 'white', life: 1.6 }));
    s.at(7.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.25) { V.scriptPose = PS.dizzy(V.t); A.scriptPose = PS.crouch; return; }
      const hh = api.hurtH(V);
      const cx = V.x + V.face * 8, cy = F - hh * 0.58;
      if (t < 0.55) { const u = ease((t - 0.25) / 0.3); A.x = lerp(x0, cx, u); A.y = lerp(F, cy, u) - Math.sin(u * PI) * 30; A.scriptPose = PS.jump; return; }
      if (t < 2.4) {
        A.x = cx + rnd(-1.5, 1.5); A.y = cy + rnd(-1.5, 1.5);
        A.scriptPose = P({ hy: -2, lean: 0.45 + Math.sin(t * 40) * 0.12, head: 0.5, aF: [2.0, 0.7], aB: [1.8, 0.8], lF: [1.4, 1.9], lB: [1.0, 2.0] });
        A.ro.claws = true;
        const nk = J(V, 'neck'); FX.spurt(nk[0], nk[1], -A.face * 0.5, 1); if (Math.random() < 0.3) FX.blood(nk[0], nk[1], 3, -A.face, 1.2);
        if (t > nextChomp) { nextChomp = t + 0.14; api.sfx('chomp'); if (Math.random() < 0.3) FX.gib('chunk', nk[0], nk[1], rnd(-80, 80), rnd(-200, -80)); }
        V.ro.dx = rnd(-1.5, 1.5);
        V.scriptPose = P({ hy: 6 + (t - 0.55) * 4, lean: -0.3, head: -0.5, aF: [2.0 + Math.sin(t * 13) * 0.6, 0.5], aB: [1.6 + Math.cos(t * 11) * 0.6, 0.6], fF: [9, 0], fB: [-10, 0] });
        return;
      }
      V.ro.dx = 0; A.ro.claws = false;
      const grip = () => { const fp = J(V, 'footF'), hp = J(A, 'handF'); V.x += hp[0] - fp[0]; };
      if (t < 3.05) {
        // the skeleton folds to the ground, Rocky steps to its feet and reaches for an ankle
        if (t > 2.5) { const fp = J(V, 'footF'); walkTo(A, fp[0] - A.face * 14 * k, dt, api, 90); }
        if (t > 2.85) A.scriptPose = P({ hy: 12, lean: 0.8, head: 0.3, aF: [0.45, 0.2], aB: [1.0, 1.2], fF: [12, 0], fB: [-14, 0] });
        return;
      }
      if (t < 4.35) {
        // drag it backward to the dumpster by one ankle
        const u = ease((t - 3.05) / 1.3), tx = dump.x - back * (DW + 22 * k);
        A.x = lerp(dragFrom, tx, u);
        A.wph = (A.wph || 0) - dt * 7;
        A.scriptPose = Object.assign({}, PS.walk(A.wph), { hy: 12, lean: 0.75 + Math.sin(t * 14) * 0.05, head: 0.3, aF: [0.5, 0.15], aB: [1.1, 1.3] });
        grip();
        if (Math.random() < 0.5) FX.dust(V.x, F, 1);
        if (Math.random() < 0.25) FX.blood(V.x, F - 3, 1, 0, 0.3);
        return;
      }
      if (t < 5.2) { A.scriptPose = P({ hy: 4, lean: -0.15 + (t > 4.85 ? 0.35 : 0), head: 0.1, aF: [2.85 - (t > 4.85 ? 0.5 : 0), 0.15], aB: [2.75 - (t > 4.85 ? 0.5 : 0), 0.2], fF: [13, 0], fB: [-14, 0] }); return; }
      if (t < 6.1) { A.scriptPose = P({ hy: 6, lean: 0.45, head: 0.3, aF: [2.0, 0.4], aB: [1.9, 0.4], fF: [13, 0], fB: [-14, 0] }); return; }
      if (t < 6.4) {
        const u = (t - 6.1) / 0.3, sx = dump.x - back * (DW + 22 * k);
        A.x = lerp(sx, dump.x, u); A.y = lerp(F, F - DH - 4, u) - Math.sin(u * PI) * 36; A.scriptPose = PS.jump; return;
      }
      A.x = dump.x; A.y = F - DH - 4;
      A.scriptPose = P({ hy: 6, lean: 0.2 + Math.sin(t * 9) * 0.06, head: -0.2, jaw: 0.4 + Math.abs(Math.sin(t * 7)) * 0.4, aF: [1.6 + Math.sin(t * 8) * 0.3, 0.8], aB: [1.4, 1.0], fF: [12, 0], fB: [-12, 0] });
      if (t > nextFoam) { nextFoam = t + 0.06; const h = J(A, 'head'); FX.puff(h[0] + A.face * 9 * k, h[1] + 4, 'rgba(240,240,230,0.9)', 1, 1.2); FX.gib('chunk', h[0] + A.face * 9 * k, h[1] + 4, rnd(-30, 30), rnd(-60, 0), { s: 0.25, draw: (g) => R.ball(g, 0, 0, 1.6, '#f4f4ea') }); }
    };
  };

  // ---------- CHUCKY: Bird Strike ----------
  S.chucky = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR, k = A.d.k;
    const hh = api.hurtH(V), cut = hh * 0.5;
    let x0 = 0, path = null, off = null, split = false, heart = false, shadow = 0, vPose = null, land = 0;
    const top = { x: 0, y: 0, vx: 0, vy: 0, a: 0, rest: false }, bot = { a: 0, va: 0 };
    const DIVE = P({ lean: 1.45, head: 0.2, aF: [-0.5, 0.15], aB: [-0.65, 0.2], lF: [-0.55, 0.2], lB: [-0.75, 0.3], rot: 0.42, piv: 2 });
    const piece = (g, upper) => {
      const f = { def: V.def, d: V.d, x: 0, y: upper ? cut : 0, face: V.face, t: 0, st: { dead: true, wounds: V.st2.wounds } };
      g.save(); g.beginPath(); if (upper) g.rect(-300, -400, 600, 400); else g.rect(-300, -cut, 600, cut + 30); g.clip();
      R.draw(g, f, vPose, { gore: true }); g.restore();
      const cy = upper ? 0 : -cut; g.fillStyle = '#8a0010'; g.beginPath(); g.ellipse(0, cy, V.d.belly * 1.05, 3.2, 0, 0, PI * 2); g.fill();
      g.fillStyle = '#c8303a'; g.beginPath(); g.ellipse(-1, cy - 0.5, V.d.belly * 0.6, 1.6, 0, 0, PI * 2); g.fill(); R.ball(g, -V.face * V.d.back * 0.4, cy, 2.2, '#ece4d0');
    };
    prop({ layer: 'back', draw(g) { if (shadow > 0) { g.fillStyle = `rgba(0,0,0,${0.15 + shadow * 0.35})`; g.beginPath(); g.ellipse(V.x, F + 1, 8 + shadow * 26, 2 + shadow * 2.5, 0, 0, PI * 2); g.fill(); } } });
    prop({ layer: 'front', draw(g) {
      if (split) {
        g.save(); g.translate(V.x, F); g.rotate(bot.a); piece(g, false); g.restore();
        g.save(); g.translate(top.x, top.y); g.rotate(top.a); piece(g, true); g.restore();
      }
      if (heart) { const h = J(A, 'head'); g.save(); g.translate(h[0] + A.face * 17 * k, h[1] + 1); g.scale(1.3, 1.3); FX.ORG.heart(g); g.restore(); if (Math.random() < 0.4) FX.blood(h[0] + A.face * 17 * k, h[1] + 6, 1, 0, 0.2); }
    } });
    s.at(0.35, () => { x0 = A.x; api.sfx('whoosh'); api.sfx('chirp'); FX.dust(A.x, F, 16); });
    s.at(1.25, () => { api.sfx('chirp'); api.sfx('whoosh'); });
    s.at(1.3, () => {
      const c = J(V, 'chest'), sx = V.x - A.face * 230, sy = F - 210, dx = c[0] - sx, dy = c[1] - sy, L = Math.hypot(dx, dy);
      path = { sx, sy, cx: c[0], cy: c[1], ex: c[0] + dx / L * 110, ey: Math.min(F - 14, c[1] + dy / L * 110) };
      const p = R.jointWorld(A, R.resolve(A.d, DIVE), 'head'); off = [p[0] - A.x, p[1] - A.y]; A.scriptPose = DIVE; A.snapPose = true;
    });
    s.at(1.5, () => {
      split = true; heart = true; vPose = V.pose; V.hidden = true; shadow = 0;
      top.x = V.x; top.y = F - cut; top.vx = A.face * 240; top.vy = -380; top.a = 0; land = V.x + A.face * 95;
      api.sfx('crunch'); api.sfx('splat'); api.sfx('big'); api.shake(10); api.flash(); FX.drops(8);
      const c = [path.cx, path.cy];
      FX.blood(c[0], c[1], 90, A.face, 2); FX.spurt(c[0], c[1], A.face, 1.6);
      FX.burst(c[0], c[1], 16, ['chunk', 'guts', 'lung', 'chunk', 'bone', 'liver', 'stomach'], 1.4);
      for (let i = 0; i < 8; i++) FX.gib('bone', c[0], c[1], A.face * rnd(150, 420), rnd(-360, -60), { s: 0.8 });
    });
    s.at(1.95, () => { api.sfx('thud'); api.shake(4); });
    s.at(3.3, () => { heart = false; const h = J(A, 'head'); FX.gib('heart', h[0] + A.face * 17 * k, h[1], 0, -330, { s: 1.3, vr: 10 }); api.sfx('whoosh'); });
    s.at(3.75, () => { api.sfx('gulp'); FX.gibs.forEach(g => { if (g.kind === 'heart') g.dead = true; }); });
    s.at(4.0, () => { api.sfx('chirp'); api.bubble('TWEET TWEET.', A.x, F - 150, { size: 13, fill: 'white', life: 1.8 }); });
    s.at(5.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.35) { V.scriptPose = PS.dizzy(V.t); A.scriptPose = P({ hyL: 0.5, lean: 0.4, aF: [2.2, 0.4], aB: [2.0, 0.5], fF: [12, 0], fB: [-12, 0] }); return; }
      if (t < 1.3) {
        // straight up and out of sight while the victim looks around for him
        A.y = Math.max(F - 520, F - (t - 0.35) * 1400); A.scriptPose = P({ lean: -0.1, head: -0.3, aF: [2.9, 0.1], aB: [2.8, 0.1], lF: [0.1, 0.1], lB: [-0.1, 0.1] });
        V.scriptPose = P({ hy: 6, lean: -0.25, head: -0.6 + Math.sin(t * 4) * 0.3, aF: [0.6, 0.6], aB: [0.5, 0.6], fF: [9, 0], fB: [-10, 0] });
        shadow = Math.max(0, (t - 0.8) / 0.5);
        return;
      }
      if (path && t < 1.5) { const u = (t - 1.3) / 0.2; A.x = lerp(path.sx, path.cx, u) - off[0]; A.y = lerp(path.sy, path.cy, u) - off[1]; shadow = 1; return; }
      if (path && t < 1.75) { const u = (t - 1.5) / 0.25; A.x = lerp(path.cx, path.ex, u) - off[0]; A.y = lerp(path.cy, path.ey, u) - off[1]; return; }
      if (t < 2.05) { A.y = lerp(A.y, F, Math.min(1, dt * 14)); A.x = lerp(A.x, land, Math.min(1, dt * 8)); A.scriptPose = P({ hyL: 0.5, lean: 0.5, aF: [1.8, 0.5], aB: [1.6, 0.6], fF: [16, 0], fB: [-12, 0] }); if (Math.random() < 0.6) FX.dust(A.x, F, 1); return; }
      A.y = F;
      if (t < 3.3) { if (t > 2.3 && A.face !== -Math.sign(A.x - V.x)) { A.face = -A.face; A.snapPose = true; } A.scriptPose = P({ hy: 4, lean: -0.15, head: -0.25, aF: [2.2, 0.6], aB: [2.0, 0.6], fF: [12, 0], fB: [-12, 0] }); }
      else if (t < 3.75) A.scriptPose = P({ hy: 4, lean: -0.3, head: -0.7, jaw: 1, aF: [1.8, 0.6], aB: [1.6, 0.6], fF: [12, 0], fB: [-12, 0] });
      else A.scriptPose = PS.win(A.t);
    };
    // the two halves: the top flies, the legs topple
    const base = s.tick;
    s.tick = (t, dt) => {
      base(t, dt);
      if (!split) return;
      if (!top.rest) { top.vy += 1200 * dt; top.x += top.vx * dt; top.y += top.vy * dt; top.a += A.face * 5 * dt; if (top.y >= F - 8 && top.vy > 0) { top.y = F - 8; top.rest = true; api.sfx('thud'); FX.blood(top.x, F - 4, 30, 0, 0.8); } }
      else { top.a += (A.face * PI / 2 - top.a) * Math.min(1, dt * 6); }
      if (t > 1.85) { bot.va += A.face * 7 * dt; bot.a = Math.max(-1.45, Math.min(1.45, bot.a + bot.va * dt)); }
      if (Math.random() < 0.7) {
        FX.spurt(top.x, top.y, -A.face * 0.3, 0.7);
        FX.spurt(V.x + Math.sin(bot.a) * cut, F - Math.cos(bot.a) * cut, Math.sin(bot.a) * 0.6, 0.8);
      }
    };
  };

  // ---------- CHUCKY (hidden): Nest ----------
  S.nest = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR, k = A.d.k;
    let nx = 0, build = 0, egg = 0, crack = 0, chick = false, chickT = 0, pile = false;
    const sp = A.def.id, N = sp === 'gertie' ? 3 : sp === 'turkey' ? 2 : 1;
    const babyLine = { chucky: "IT'S A BOY.", gertie: 'HONK HONK HONK.', turkey: "IT'S TWINS." }[sp] || "IT'S A BOY.";
    const baby = (g, bob) => {
      if (sp === 'gertie') { R.ball(g, 0, 0, 5.5, '#c8b860'); R.ball(g, 2, -6, 3.8, '#8a8458'); R.poly(g, [[5, -6.6], [8.6, -5.6], [5, -4.6]], '#2a2a26'); R.ball(g, 3.4, -6.8, 0.7, '#000'); g.fillStyle = 'rgba(255,250,200,0.5)'; g.fillRect(-3, -2, 5, 2); }
      else if (sp === 'turkey') { R.ball(g, 0, 0, 5, '#a8865a'); R.ball(g, 2, -5.6, 3.4, '#b8966a'); g.fillStyle = '#4a3420'; for (let i = 0; i < 5; i++) g.fillRect(-4 + i * 2, -2 + (i % 2) * 2, 1.2, 1.2); R.poly(g, [[4.8, -6], [7.6, -5.2], [4.8, -4.4]], '#c8b080'); R.ball(g, 3.2, -6.4, 0.7, '#000'); }
      else { R.ball(g, 0, 0, 5.5, '#c01420'); R.ball(g, 2.5, -6, 4, '#c8161e'); R.poly(g, [[0, -9], [1.5, -14], [3, -9.5]], '#c8161e'); g.fillStyle = '#0a0404'; g.beginPath(); g.ellipse(4.5, -6, 2, 1.8, 0, 0, PI * 2); g.fill(); R.poly(g, [[5.5, -7], [9, -5.6], [5.5, -4.4]], '#e8802a'); R.ball(g, 4, -6.6, 0.7, '#fff'); }
      g.fillStyle = '#8a0010'; g.fillRect(-2, 3, 1, 3 + bob); g.fillRect(2, 2, 1, 2 + bob);
    };
    prop({ layer: 'back', draw(g) {
      if (!pile) return;
      // a mound of guts first, then woven bones and a ribcage on top
      g.fillStyle = '#6a0a12'; g.beginPath(); g.ellipse(nx, F - 3, 34, 9, 0, PI, PI * 2); g.fill();
      g.fillStyle = '#a0202a'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(nx - 26 + i * 7.5, F - 7 - (i % 3) * 2, 3.2, 0, PI * 2); g.fill(); }
    } });
    prop({ layer: 'front', draw(g) {
      if (!pile) return;
      const n = Math.floor(build * 22);
      R.srand(77);
      for (let i = 0; i < n; i++) { const a = R.rr() * 0.9 - 0.45, x = nx - 30 + R.rr() * 60, y = F - 4 - R.rr() * 12 - Math.abs(x - nx) * 0.12; R.line(g, x - Math.cos(a) * 9, y - Math.sin(a) * 9, x + Math.cos(a) * 9, y + Math.sin(a) * 9, R.rr() < 0.7 ? '#e6dcc4' : '#b02030', 2); }
      if (build > 0.6) { g.strokeStyle = '#e6dcc4'; g.lineWidth = 1.6; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(nx + 22, F - 6, 5 + i * 2.2, PI * 1.1, PI * 1.9); g.stroke(); } }
      if (build > 0.85) R.skull(g, nx - 30, F - 12, 6.5 * V.d.k * (V.def.skullK || 1), -0.3, V.def.skull);
      const offs = N === 1 ? [0] : N === 2 ? [-9, 9] : [-14, 0, 14];
      if (egg > 0 && !chick) for (const ox of offs) {
        g.save(); g.translate(nx + ox, F - 18); g.scale(1.9, 1.9); g.rotate(Math.sin(s.t * 18 + ox) * 0.25 * (crack > 0 ? 1 : 0));
        g.fillStyle = sp === 'gertie' ? '#f4f0e4' : sp === 'turkey' ? '#e8d4b0' : '#f2ece0'; g.beginPath(); g.ellipse(0, 0, 6 * egg, 8 * egg, 0, 0, PI * 2); g.fill();
        g.fillStyle = '#a0101c'; for (let i = 0; i < 6; i++) g.fillRect(-4 + (i * 3.7) % 8, -5 + (i * 2.9) % 9, 1.2, 1.2);
        if (crack > 0) { g.strokeStyle = '#2a1a10'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-5, -1); g.lineTo(-2, -3 * crack); g.lineTo(1, 0); g.lineTo(3, -3 * crack); g.lineTo(5, -1); g.stroke(); }
        g.restore();
      }
      if (chick) offs.forEach((ox, i) => {
        const bob = Math.abs(Math.sin(chickT * 9 + i * 1.7)) * 2;
        g.save(); g.translate(nx + ox, F - 16 - bob * 1.8); g.scale(N > 1 ? 1.6 : 1.9, N > 1 ? 1.6 : 1.9); if (i % 2) g.scale(-1, 1);
        baby(g, bob);
        g.fillStyle = '#f2ece0'; g.beginPath(); g.ellipse(-7, 4, 4, 3, 0.4, 0, PI); g.fill(); g.beginPath(); g.ellipse(8, 4, 4, 3, -0.4, 0, PI); g.fill();
        g.restore();
      });
    } });
    for (let i = 0; i < 12; i++) s.at(0.5 + i * 0.12, () => {
      api.sfx(i % 3 ? 'chomp' : 'splat'); const c = J(V, pick(['chest', 'belly', 'head', 'hip']));
      FX.blood(c[0], c[1], 14, -A.face, 1); FX.gib(pick(['chunk', 'guts', 'bone', 'bone', 'chunk']), c[0], c[1], rnd(-160, 160), rnd(-320, -120)); V.ro.gore = true; V.ro.dx = rnd(-3, 3);
    });
    s.at(2.0, () => { V.hidden = true; pile = true; nx = V.x; api.sfx('crunch'); api.shake(5); FX.burst(V.x, F - 30, 10, ['bone', 'bone', 'guts', 'chunk'], 0.7); FX.blood(V.x, F - 20, 40, 0, 1); });
    s.at(3.05, () => { api.sfx('land'); });
    s.at(3.55, () => { api.sfx('squeak'); api.shake(2); });
    s.at(3.85, () => { api.sfx('squeak'); api.shake(3); });
    s.at(4.1, () => { egg = 1; api.sfx('gulp'); });
    s.at(4.9, () => { crack = 0.5; api.sfx('crunch'); });
    s.at(5.2, () => { crack = 1; api.sfx('crunch'); });
    s.at(5.45, () => { chick = true; api.sfx('chirp'); FX.blood(nx, F - 16, 10, 0, 0.5); });
    s.at(5.8, () => api.bubble(babyLine, A.x, F - 150, { size: 13, fill: 'gold', life: 2 }));
    s.at(7.4, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (chick) chickT += dt;
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 28 * k, dt, api, 110); return; }
      if (t < 2.0) {
        const p = Math.sin(t * 40);
        A.scriptPose = P({ hy: 6, lean: 0.55 + p * 0.2, head: 0.5 + p * 0.3, aF: [1.6 + p * 0.4, 0.5], aB: [1.4 - p * 0.4, 0.6], fF: [14, 0], fB: [-13, 0] });
        V.scriptPose = P({ hy: 6 + (t - 0.5) * 10, lean: 0.2 + (t - 0.5) * 0.4, head: 0.6, aF: [0.4, 0.3], aB: [0.3, 0.3], fF: [9, 0], fB: [-10, 0] });
        return;
      }
      V.ro.dx = 0;
      if (t < 3.0) {
        // building: hop around the pile tucking bones in
        build = Math.min(1, (t - 2.0) / 0.9);
        A.x = nx - A.face * (34 + Math.sin(t * 7) * 8); A.y = F - Math.abs(Math.sin(t * 7)) * 8;
        A.scriptPose = P({ hy: 6, lean: 0.8, head: 0.5 + Math.sin(t * 30) * 0.2, aF: [1.2, 0.5], aB: [1.0, 0.6], fF: [12, 0], fB: [-12, 0] });
        return;
      }
      if (t < 3.3) { const u = (t - 3.0) / 0.3; A.x = lerp(nx - A.face * 34, nx, u); A.y = F - 8 - Math.sin(u * PI) * 30; A.scriptPose = PS.jump; return; }
      if (t < 4.1) { A.x = nx; A.y = F - 8; A.ro.dx = Math.sin(t * 30) * 1.5; A.scriptPose = P({ hyL: 0.7, lean: 0.15, head: -0.1, aF: [1.0 + Math.sin(t * 20) * 0.3, 0.5], aB: [0.9, 0.6], fF: [10, 0], fB: [-10, 0] }); return; }
      if (t < 4.4) { A.ro.dx = 0; const u = (t - 4.1) / 0.3; A.x = lerp(nx, nx - A.face * 78, u); A.y = F - Math.sin(u * PI) * 26; A.scriptPose = PS.jump; return; }
      A.y = F; A.x = nx - A.face * 78;
      A.scriptPose = chick ? P({ hy: 3, lean: -0.3, head: 0.3, aF: [2.0 + Math.sin(t * 14) * 0.3, 0.5], aB: [1.9, 0.6], fF: [12, 0], fB: [-12, 0] }) : P({ hy: 6, lean: 0.4, head: 0.5, aF: [0.8, 0.8], aB: [0.6, 0.9], fF: [12, 0], fB: [-12, 0] });
    };
  };

  // ---------- MAD TURKEY: Carved ----------
  S.turkey = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR, k = A.d.k;
    let tools = false, sliceA = 0;
    const px = Math.max(api.cam + 40, Math.min(api.cam + api.W - 40, A.x - A.face * 70)), py = F - 2;
    const plat = prop({ layer: 'front', fly: [], items: [], head: null, apple: false, draw(g, p) {
      // a big oval serving platter on a low stand
      g.fillStyle = '#5a4a3a'; g.fillRect(px - 4, py - 6, 8, 6);
      g.fillStyle = '#c8ccd4'; g.beginPath(); g.ellipse(px, py - 8, 40, 5, 0, 0, PI * 2); g.fill();
      g.fillStyle = '#e8ecf4'; g.beginPath(); g.ellipse(px, py - 9, 34, 3.6, 0, 0, PI * 2); g.fill();
      for (const it of p.items) slab(g, it.x, it.y, it.r);
      for (const f of p.fly) if (f.kind === 'slab') slab(g, f.x, f.y, f.r);
      if (p.head) { g.save(); g.translate(p.head.x, p.head.y); g.rotate(p.head.r); R.drawHeadAt(g, { def: V.def, d: V.d }, 0, 0, 0, 1, { dead: true, t: 0, jaw: 0.6 }); g.restore(); }
      if (p.apple) { const h = p.head, ax = h.x + 12 * V.d.k, ay = h.y - 5 * V.d.k; R.ball(g, ax, ay, 4.2, '#c01818'); R.ball(g, ax - 1.2, ay - 1.4, 1.4, '#ff8080'); R.line(g, ax, ay - 4, ax + 1, ay - 6.5, '#4a2a10', 1); }
      // garnish
      for (let i = 0; i < 6; i++) R.ball(g, px - 30 + i * 12, py - 10, 2.4, i % 2 ? '#3a8a2a' : '#2a6a1a');
    }, update(p, dt) {
      for (const f of p.fly) {
        f.t += dt; const u = Math.min(1, f.t / f.d);
        f.x = lerp(f.x0, f.tx, u); f.y = lerp(f.y0, f.ty, u) - Math.sin(u * PI) * f.h; f.r = f.r0 + u * f.spin;
        if (u >= 1) { f.done = 1; if (f.kind === 'slab') { p.items.push({ x: f.tx, y: f.ty, r: f.rt }); api.sfx('splat'); } else { p.head = { x: f.tx, y: f.ty, r: 0 }; api.sfx('thud'); } }
      }
      p.fly = p.fly.filter(f => !f.done);
      if (p.fly.some(f => f.kind === 'head')) { const f = p.fly.find(f => f.kind === 'head'); p.headFly = f; } else p.headFly = null;
    } });
    function slab(g, x, y, r) {
      g.save(); g.translate(x, y); g.rotate(r);
      g.fillStyle = '#e0a090'; g.beginPath(); g.ellipse(0, 0, 7, 3, 0, 0, PI * 2); g.fill();
      g.fillStyle = '#a8303a'; g.beginPath(); g.ellipse(0.5, -0.4, 5.4, 2, 0, 0, PI * 2); g.fill();
      g.strokeStyle = '#7a4a2a'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, 7, 3, 0, PI, PI * 2); g.stroke();
      g.restore();
    }
    // flying head is drawn by a gib so it stays in front during the arc
    prop({ layer: 'front', draw(g) {
      const f = plat.headFly; if (!f) return;
      g.save(); g.translate(f.x, f.y); g.rotate(f.r); R.drawHeadAt(g, { def: V.def, d: V.d }, 0, 0, 0, 1, { dead: true, t: 0 }); g.restore();
    } });
    // carving knife and fork in the wing tips
    prop({ layer: 'front', draw(g) {
      if (!tools) return;
      const hf = J(A, 'handF'), hb = J(A, 'handB');
      g.save(); g.translate(hf[0], hf[1]); g.rotate(sliceA); g.scale(A.face, 1);
      g.fillStyle = '#3a2416'; g.fillRect(-2, -3, 4, 8); g.fillStyle = '#dfe4ec'; g.beginPath(); g.moveTo(-1.6, -3); g.lineTo(-1.2, -26); g.quadraticCurveTo(3, -22, 2.2, -3); g.fill();
      g.fillStyle = 'rgba(160,0,10,0.8)'; g.fillRect(-1, -18, 2.6, 7); g.restore();
      g.save(); g.translate(hb[0], hb[1]); g.scale(A.face, 1);
      g.fillStyle = '#3a2416'; g.fillRect(-1.5, -2, 3, 7); R.line(g, 0, -2, 4, -16, '#c8ccd4', 1.2); for (const o of [-1.4, 1.4]) R.line(g, 4 + o, -16, 5 + o, -22, '#c8ccd4', 0.8);
      g.restore();
    } });
    const launch = (kind, x, y, tx, ty, o = {}) => plat.fly.push(Object.assign({ kind, x0: x, y0: y, x, y, tx, ty, t: 0, d: 0.55, h: 60, r0: 0, r: 0, spin: rnd(-6, 6), rt: rnd(-0.4, 0.4) }, o));
    s.at(0.55, () => { tools = true; api.sfx('slash'); api.sfx('yelp'); });
    const cuts = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5];
    cuts.forEach((c, i) => s.at(c, () => {
      const parts = ['chest', 'belly', 'chest', 'hip', 'belly', 'elbowF', 'kneeF'], p = J(V, parts[i]);
      api.sfx('slash'); api.sfx('crunch'); api.shake(2);
      FX.blood(p[0], p[1], 14, -A.face, 1); V.ro.gore = true;
      const n = plat.items.length + plat.fly.length;
      launch('slab', p[0], p[1], px - 22 + (n % 5) * 11, py - 12 - Math.floor(n / 5) * 3);
    }));
    s.at(2.85, () => {
      V.ro.skeleton = true; V.ro.noHead = true; api.sfx('splat'); api.shake(4);
      const h = J(V, 'head'); FX.blood(h[0], h[1], 40, 0, 1.2); FX.spurt(h[0], h[1], 0, 1.2);
      launch('head', h[0], h[1], px - 6, py - 12, { d: 0.7, h: 80, spin: 0, r0: 0 });
    });
    s.at(3.5, () => {
      V.hidden = true; api.sfx('crunch'); api.shake(5);
      const b = J(V, 'hip');
      FX.burst(b[0], F - 20, 14, ['bone', 'bone', 'bone', 'guts', 'chunk', 'liver', 'bone'], 0.7);
      FX.blood(b[0], F - 10, 40, 0, 0.8);
    });
    s.at(3.9, () => { plat.apple = true; api.sfx('select'); });
    s.at(4.3, () => { api.sfx('yelp'); api.bubble('HAPPY THANKSGIVING.', A.x, F - 140, { size: 12, fill: 'gold', life: 2 }); });
    s.at(5.8, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.55) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 40 * k, dt, api, 110); return; }
      if (t < 2.85) {
        const ph = ((t - 0.95) / 0.25) % 1, cut = t > 0.95 ? Math.sin(ph * PI) : 0;
        sliceA = A.face * (-0.6 + cut * 1.8);
        A.scriptPose = P({ hy: 6, lean: 0.25, head: 0.2, aF: [1.6 + cut * 0.9, 0.4 + cut * 0.4], aB: [1.4, 0.6], fF: [14, 0], fB: [-14, 0] });
        V.scriptPose = P({ hy: 5, lean: -0.15, head: Math.sin(t * 11) * 0.2, aF: [0.5, 0.3], aB: [0.4, 0.3], fF: [9, 0], fB: [-10, 0] });
        V.ro.dx = cut > 0.8 ? rnd(-1.2, 1.2) : 0;
        return;
      }
      V.ro.dx = 0;
      if (t < 3.5) { V.scriptPose = P({ hy: 18 * ease((t - 2.85) / 0.65), lean: 0.2, aF: [0.3, 0.2], aB: [0.2, 0.2], fF: [9, 0], fB: [-10, 0] }); A.scriptPose = PS.stance(A.t); return; }
      if (t < 4.3) { sliceA = 0; A.scriptPose = PS.stance(A.t); return; }
      tools = t < 4.3; A.scriptPose = PS.win(A.t);
    };
  };

  // ---------- MILLIE: Timber ----------
  S.millie = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    let nextGnaw = 0.6, fallU = 0, lodge = null, feetX = 0, bite = 0;
    prop({ layer: 'front', draw(g) {
      if (bite <= 0 || V.ro.cutAnkles) return;
      for (const leg of ['F', 'B']) {
        const kn = J(V, 'knee' + leg), ft = J(V, 'foot' + leg), p = [lerp(ft[0], kn[0], 0.35), lerp(ft[1], kn[1], 0.35)];
        g.fillStyle = '#5a0008'; g.beginPath(); g.ellipse(p[0], p[1], V.d.ankleR * 1.3, 1.5 + bite * 4, 0, 0, PI * 2); g.fill();
        g.fillStyle = '#c8303a'; g.beginPath(); g.ellipse(p[0], p[1], V.d.ankleR * 0.9, 0.8 + bite * 2.6, 0, 0, PI * 2); g.fill();
        R.line(g, p[0], p[1] - bite * 3, p[0], p[1] + bite * 3, '#ece4d0', 1.3);
      }
    } });
    s.at(2.1, () => {
      api.bubble('TIMBER!', A.x, F - 100, { size: 16, fill: 'gold', life: 1.6 }); api.sfx('crunch');
      V.ro.cutAnkles = true; feetX = V.x;
      const fc = V.def.col.foot, d = V.d;
      prop({ layer: 'back', draw(g) {
        for (const o of [-d.footL * 0.15, d.footL * 0.45]) {
          const x = feetX + o * V.face;
          R.cap(g, [x - V.face * 2, F - 3], [x + V.face * d.footL * 0.6, F - 2], d.footH * 0.8, d.footH * 0.6, fc);
          R.cap(g, [x, F - 10], [x, F - 3], d.ankleR, d.ankleR, V.def.col.legL || V.def.col.legU);
          R.ball(g, x, F - 10, d.ankleR * 0.9, '#8a0010'); R.ball(g, x, F - 10.5, d.ankleR * 0.35, '#e8e0d0');
        }
      } });
    });
    s.at(2.9, () => { api.sfx('thud'); api.shake(7); const hh = api.hurtH(V); FX.blood(V.x - V.face * hh * 0.8, F - 4, 40, 0, 1); FX.dust(V.x - V.face * hh * 0.5, F, 16); });
    s.at(3.5, () => {
      V.hidden = true; api.sfx('crunch'); api.sfx('splat');
      const hh = api.hurtH(V), cx = V.x - V.face * hh * 0.5;
      const bones = [];
      for (let i = 0; i < 22; i++) {
        const row = i < 9 ? 0 : i < 15 ? 1 : i < 19 ? 2 : 3, n = [9, 6, 4, 3][row], j = row === 0 ? i : row === 1 ? i - 9 : row === 2 ? i - 15 : i - 19;
        const a = PI * (j + 0.5) / n, rad = 30 - row * 6;
        bones.push({ x: V.x - V.face * rnd(10, hh), y: F - rnd(2, 12), tx: cx + Math.cos(a) * rad, ty: F - 3 - Math.sin(a) * (6 + row * 7) - row * 4, tr: a + PI / 2 + rnd(-0.3, 0.3), r: rnd(0, 6), t0: 3.5 + i * 0.03 });
      }
      lodge = prop({ layer: 'back', draw(g) {
        for (const b of bones) { g.save(); g.translate(b.x, b.y); g.rotate(b.r); R.bone(g, [-6, 0], [6, 0], 1.5); g.restore(); }
        if (s.t > 4.4) R.skull(g, cx, F - 6, 7 * V.d.k * (V.def.skullK || 1), 0, V.def.skull);
      }, update() { for (const b of bones) { const u = ease((s.t - b.t0) / 0.6); b.cx = b.cx == null ? b.x : b.cx; b.cy = b.cy == null ? b.y : b.cy; b.x = lerp(b.cx, b.tx, u); b.y = lerp(b.cy, b.ty, u) - Math.sin(u * PI) * 40; b.r = lerp(b.r, b.tr, u * 0.2); } } });
      lodge.cx = cx;
      FX.blood(cx, F - 10, 30, 0, 0.8);
    });
    s.at(4.6, () => { A.x = lodge.cx; A.y = F - 32; A.snapPose = true; api.sfx('land'); });
    s.at(4.9, () => api.bubble('HOME SWEET HOME', A.x, F - 120, { size: 12, fill: 'white', life: 1.6 }));
    s.at(6.0, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 6 * k, dt, api, 110); return; }
      if (t < 2.1) {
        bite = (t - 0.5) / 1.6;
        A.ro.top = true;
        { const hd = J(A, 'head'), tx = V.x - A.face * (V.d.ankleR + 6 * k); A.x += (tx - (hd[0] + A.face * 8 * k)) * Math.min(1, dt * 10); }
        const sh = J(V, 'footF'), sk = J(V, 'kneeF'), sp = [lerp(sh[0], sk[0], 0.35), lerp(sh[1], sk[1], 0.35)];
        if (Math.random() < 0.6) FX.gib(Math.random() < 0.3 ? 'bone' : 'chunk', sp[0], sp[1], -A.face * rnd(40, 160), rnd(-200, -60), { s: 0.35 });
        if (Math.random() < 0.5) FX.blood(sp[0], sp[1], 2, -A.face, 0.6);
        A.scriptPose = P({ hyL: 0.42, lean: 1.45 + Math.sin(t * 34) * 0.08, head: 0.35 + Math.sin(t * 28) * 0.15, jaw: Math.abs(Math.sin(t * 30)), aF: [1.0, 0.8], aB: [0.9, 0.9], fF: [10, 0], fB: [-16, 0] });
        V.scriptPose = P({ hy: 3, lean: -0.1, head: -0.4, aF: [2.0 + Math.sin(t * 16) * 0.5, 0.4], aB: [1.8, 0.5], fF: [8, 0], fB: [-8, 0] });
        V.ro.dx = rnd(-1, 1);
        if (t > nextGnaw) { nextGnaw = t + 0.12; api.sfx('gnaw'); FX.blood(V.x, F - 6, 4, -A.face, 0.6); if (Math.random() < 0.5) FX.gib('bone', V.x, F - 6, rnd(-90, 90), rnd(-160, -60), { s: 0.4 }); }
        return;
      }
      V.ro.dx = 0;
      if (t < 2.9) { fallU = Math.min(1, ((t - 2.1) / 0.8) ** 2); A.scriptPose = PS.stance(A.t); V.scriptPose = P({ rot: -PI / 2 * fallU, piv: 1, hy: 0, lean: 0, aF: [2.5, 0.2], aB: [2.3, 0.3], fF: [6, 0], fB: [-6, 0] }); return; }
      if (t < 4.6) { A.scriptPose = PS.stance(A.t); V.scriptPose = P({ rot: -PI / 2, piv: 1, hy: 0, aF: [2.5, 0.2], aB: [2.3, 0.3], fF: [6, 0], fB: [-6, 0] }); return; }
      A.scriptPose = PS.win(A.t);
    };
  };


  // ---------- BALL JAR GOLEM: Canning Season ----------
  S.golem = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    let lifted = false, slammed = false;
    s.at(0.6, () => { lifted = true; api.sfx('scream'); });
    s.at(0.95, () => { A.scriptPose = P({ hy: 2, lean: 0.35, aF: [1.0, 0.2], aB: [0.8, 1.4], fF: [16, 0], fB: [-12, 0] }); A.snapPose = true; api.sfx('big'); FX.blood(V.x, V.y - api.hurtH(V) * 0.85, 30, A.face, 1.3); FX.gib('tooth', V.x, V.y - 100, A.face * 150, -250); });
    s.at(1.2, () => {
      lifted = false; slammed = true; V.x = A.x + A.face * 34 * k; V.y = F; V.scriptPose = PS.down(V); V.snapPose = true;
      api.sfx('thud'); api.sfx('crunch'); api.shake(8); FX.blood(V.x + A.face * 20, F - 6, 40, 0, 1.2); FX.dust(V.x, F, 20);
    });
    const stomp = (t0, big) => s.at(t0, () => {
      api.sfx('thud'); api.sfx('crunch'); api.sfx('splat'); api.shake(big ? 11 : 7); api.flash();
      V.ro.flat = big ? 0.16 : 0.5;
      const x = A.x + A.face * 40 * k;
      FX.blood(x, F - 4, big ? 130 : 50, 0, 1.6, 1.4); FX.blood(x, F - 4, 40, A.face, 1.4); FX.blood(x, F - 4, 40, -A.face, 1.4);
      if (big) { FX.burst(x, F - 6, 18, ['eye', 'eye', 'guts', 'guts', 'heart', 'brain', 'skullfrag', 'bone', 'chunk', 'liver', 'kidney', 'tooth'], 1.3); FX.drops(6); }
    });
    stomp(2.0, false); stomp(2.7, true);
    s.at(3.3, () => api.bubble('PRESERVED.', A.x, F - 190, { size: 15, fill: 'white', life: 1.8 }));
    s.at(4.6, () => { s.done = true; });
    const raise = P({ hy: 0, lean: -0.15, aF: [1.2, 1.2], aB: [0.8, 1.4], lF: [1.7, 1.5], fB: [-8, 0] });
    const plant = P({ hy: 4, lean: 0.2, aF: [0.9, 1.3], aB: [0.6, 1.5], fF: [40, 0], fB: [-10, 0] });
    s.tick = (t, dt) => {
      if (t < 0.6) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 30 * k, dt, api, 80); return; }
      if (lifted) { A.scriptPose = P({ hy: 2, lean: 0.1, aF: [2.2, 0.3], aB: [0.8, 1.4], fF: [14, 0], fB: [-12, 0] }); V.scriptPose = PS.hitHigh || PS.dizzy(V.t); return; }
      if (!slammed) return;
      if (t < 1.75) { A.scriptPose = P({ hy: 6, lean: 0.4, aF: [1.0, 0.3], aB: [0.8, 0.4], fF: [14, 0], fB: [-12, 0] }); return; }
      if (t < 2.0 || (t > 2.25 && t < 2.7)) { A.scriptPose = raise; return; }
      A.scriptPose = t < 3.2 ? plant : PS.win(A.t);
      if (t < 3.4 && Math.random() < 0.3) FX.blood(A.x + A.face * 40 * k, F - 3, 2, 0, 0.4);
    };
  };

  // ---------- DEVIL DAN: Hellfire Pillar ----------
  S.dan = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR;
    s.at(0.5, () => { api.sfx('fire'); api.sfx('scream'); api.shake(4); });
    s.at(1.2, () => { V.ro.char = true; api.sfx('fire'); });
    s.at(2.0, () => { V.ro.skeleton = true; V.ro.gore = true; api.sfx('crunch'); });
    s.at(2.8, () => {
      V.hidden = true; api.sfx('crunch'); api.shake(5);
      const hh = api.hurtH(V);
      for (let i = 0; i < 16; i++) FX.gib(i % 5 ? 'bone' : 'skullfrag', V.x + FX.rnd(-8, 8), F - FX.rnd(10, hh), FX.rnd(-90, 90), FX.rnd(-160, -20));
      FX.gib('skull', V.x, F - hh * 0.8, A.face * -40, -120, { draw: (g) => R.skull(g, 0, 0, 7 * V.d.k * (V.def.skullK || 1), 0, V.def.skull) });
      FX.puff(V.x, F - 30, 'rgba(40,30,30,0.8)', 30, 7);
    });
    s.at(3.2, () => api.bubble('YOUR SOUL IS MINE.', A.x, F - 175, { size: 13, fill: 'fire', life: 2 }));
    s.at(4.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.4) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 70, dt, api, 80); return; }
      A.scriptPose = P({ hy: 2, lean: -0.2, aF: [2.7 + Math.sin(t * 6) * 0.1, 0.4], aB: [2.6, 0.4], fF: [12, 0], fB: [-12, 0] });
      if (t < 2.6) {
        const hh = api.hurtH(V);
        for (let i = 0; i < 6; i++) FX.fire(V.x + FX.rnd(-14, 14), F - FX.rnd(0, hh * 1.1), 1, 1.5);
        FX.fire(V.x, F, 3, 2);
        if (Math.random() < 0.3) FX.blood(V.x, F - hh * 0.6, 2, 0, 0.6);
        V.ro.dx = FX.rnd(-1.5, 1.5);
        V.scriptPose = t < 2.0 ? P({ hy: 4, lean: -0.3, head: -0.6, aF: [2.6 + Math.sin(t * 19) * 0.5, 0.4], aB: [2.4 + Math.cos(t * 17) * 0.5, 0.5], fF: [9, 0], fB: [-9, 0] }) : P({ hy: 10 + (t - 2) * 20, lean: 0.3, aF: [0.4, 0.3], aB: [0.3, 0.3], fF: [9, 0], fB: [-9, 0] });
      }
    };
  };

  // ---------- Stage fatality: off the White River trestle ----------
  S.overpass = (s, A, V, api) => {
    const PS = api.PS;
    let vy = -900, by = -40, bvy = 0, landed = false, trainX = null, smashed = false;
    const bx = () => api.W * 0.5;
    api.sfx('big'); FX.blood(V.x, V.y - 80, 40, A.face, 1.6);
    s.at(0.75, () => {
      FX.reset();
      api.scene((g, W, H) => {
        STAGES.drawBelow(g, W, s.t, 'overpass');
        FX.drawDecals(g); FX.drawGibs(g);
        if (!smashed) {
          const f = { def: V.def, d: V.d, x: bx(), y: by, face: 1, t: s.t, st: { dead: landed } };
          R.draw(g, f, landed ? P({ rot: -PI / 2, hyA: 4, aF: [2.6, 0.3], aB: [1.2, 0.8], lF: [0.3, 0.2], lB: [-0.4, 0.4], head: 0.4 + Math.sin(s.t * 6) * 0.2 }) : PS.air(s.t * 9), {});
        }
        // headlight sweeping in from the right before the train arrives
        if (s.t > 1.4 && (trainX == null || trainX > W)) { const a = Math.min(1, (s.t - 1.4) / 0.8); const gr = g.createLinearGradient(W, 0, W * 0.2, 0); gr.addColorStop(0, `rgba(255,250,210,${0.55 * a})`); gr.addColorStop(1, 'rgba(255,250,210,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(W, 176); g.lineTo(W * 0.15, 196); g.lineTo(W * 0.15, 222); g.lineTo(W, 206); g.fill(); }
        if (smear > 0) { g.fillStyle = 'rgba(130,0,10,0.85)'; g.fillRect(0, 201, bx() * smear + 40, 3.5); g.fillRect(0, 213, bx() * smear + 30, 3.5); }
        if (trainX != null) { STAGES.drawTrain(g, trainX, 214); g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const y = 160 + i * 4; g.beginPath(); g.moveTo(trainX + 20 + (i * 53) % 700, y); g.lineTo(trainX + 80 + (i * 53) % 700, y); g.stroke(); } }
        FX.drawParts(g);
      });
    });
    let smear = 0;
    s.at(1.35, () => api.sfx('horn'));
    s.at(1.85, () => api.sfx('horn'));
    s.at(2.2, () => { trainX = api.W + 30; api.sfx('train'); });
    s.at(4.4, () => { api.scene(null); FX.reset(); V.hidden = true; A.scriptPose = PS.win(A.t); });
    s.at(5.0, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.75) { V.y += vy * dt; V.x += A.face * 40 * dt; V.scriptPose = PS.air(t * 12); A.scriptPose = PS.up1 || PS.stance(A.t); return; }
      if (!landed) { bvy += 1300 * dt; by += bvy * dt; if (by >= 210) { by = 210; landed = true; api.sfx('thud'); api.shake(5); FX.blood(bx(), 205, 30, 0, 0.8); } }
      if (trainX != null) {
        trainX -= 1450 * dt;
        if (!smashed && trainX < bx() + 10) {
          // obliterated: a red cloud of meat and bone flung down the line
          smashed = true; api.sfx('splat'); api.sfx('crunch'); api.sfx('big'); api.sfx('splat'); api.shake(16); api.flash();
          FX.burst(bx(), 200, 48, ['chunk', 'bone', 'guts', 'skullfrag', 'eye', 'chunk', 'heart', 'brain', 'liver', 'lung', 'bone', 'tooth'], 1.8);
          skullGib(V, bx(), 196, -700, -420);
          for (const gb of FX.gibs) gb.vx -= rnd(500, 1100);
          for (let i = 0; i < 4; i++) FX.blood(bx(), 186 + i * 6, 120, -1, 2.4, 1.6);
          FX.drops(40);
        }
        if (smashed) { smear = Math.min(1, smear + dt * 2); if (Math.random() < 0.9) FX.blood(trainX + rnd(0, 300), 170 + rnd(-30, 20), 3, -1, 1.2); }
      }
      A.scriptPose = PS.win(A.t);
    };
  };

  // ---------- boss deaths ----------
  S.bridge = (s, A, V, api) => {
    const PS = api.PS, ROCK = 198;
    let vy = -900, by = -40, bvy = 0, landed = false, pool = 0, stream = 0;
    const bx = () => api.W * 0.5;
    const BROKE = P({ rot: -PI / 2, hyA: 6, aF: [2.7, -1.2], aB: [-0.9, 1.6], lF: [1.9, -1.4], lB: [-0.7, 2.3], head: 1.1 });
    api.sfx('big'); FX.blood(V.x, V.y - 80, 40, A.face, 1.6);
    s.at(0.75, () => {
      FX.reset();
      api.scene((g, W) => {
        STAGES.drawBelow(g, W, s.t, 'river');
        // blood spreads over the rock and runs into the water
        if (pool > 0) {
          g.fillStyle = 'rgba(120,0,10,0.85)'; g.beginPath(); g.ellipse(bx(), ROCK + 2, 10 + pool * 34, 3 + pool * 5, 0, 0, PI * 2); g.fill();
          g.fillStyle = 'rgba(140,0,14,0.5)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(bx() - 30 + i * 15, ROCK + 4); g.lineTo(bx() - 34 + i * 17, ROCK + 4 + stream * (18 + i * 6)); g.lineTo(bx() - 26 + i * 15, ROCK + 4); g.fill(); }
          g.fillStyle = `rgba(150,10,20,${0.35 * stream})`; g.beginPath(); g.ellipse(bx(), 226, 40 + stream * 90, 6 + stream * 5, 0, 0, PI * 2); g.fill();
        }
        FX.drawDecals(g); FX.drawGibs(g);
        const f = { def: V.def, d: V.d, x: bx(), y: landed ? ROCK + 2 : by, face: 1, t: s.t, st: { dead: landed, wounds: V.st2.wounds } };
        R.draw(g, f, landed ? BROKE : PS.air(s.t * 9), landed ? { flat: 0.7, gore: true } : {});
        FX.drawParts(g);
      });
    });
    s.at(1.0, () => api.sfx('scream'));
    s.at(3.9, () => { api.scene(null); FX.reset(); V.hidden = true; A.scriptPose = PS.win(A.t); });
    s.at(4.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.75) { V.y += vy * dt; V.x += A.face * 40 * dt; V.scriptPose = PS.air(t * 12); A.scriptPose = PS.up1 || PS.stance(A.t); return; }
      if (!landed) {
        bvy += 1300 * dt; by += bvy * dt;
        if (by >= ROCK) {
          by = ROCK; landed = true; api.sfx('splat'); api.sfx('crunch'); api.sfx('thud'); api.shake(10); api.flash(); FX.drops(12);
          FX.burst(bx(), ROCK - 10, 24, ['chunk', 'bone', 'guts', 'skullfrag', 'eye', 'brain', 'bone', 'tooth'], 1.3);
          FX.blood(bx(), ROCK - 6, 140, 0, 1.8, 1.2);
          for (let i = 0; i < 6; i++) FX.gib('chunk', bx(), ROCK - 8, rnd(-260, 260), rnd(-420, -200), { onRest: o => { if (o.x < bx() - 70 || o.x > bx() + 70) FX.puff(o.x, o.y, 'rgba(220,230,255,0.8)', 6, 2); } });
        }
      } else { pool = Math.min(1, pool + dt * 0.9); stream = Math.min(1, stream + dt * 0.45); }
      A.scriptPose = PS.win(A.t);
    };
  };
  // ---------- OFC TINKLE: Use of Force ----------
  S.tinkle = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR, k = A.d.k;
    let drawn = false, shots = 0, flash = 0;
    const aim = P({ hy: 6, lean: -0.05, head: 0.1, aF: [1.62, 0.02], aB: [1.5, 0.1], fF: [16, 0], fB: [-16, 0] });
    prop({ layer: 'front', draw(g) {
      if (drawn) {
        const h = J(A, 'handF');
        g.save(); g.translate(h[0], h[1]); g.scale(A.face, 1);
        g.fillStyle = '#141416'; g.fillRect(0, -3, 11, 3.4); g.fillRect(0, -1, 3, 6); g.fillStyle = '#3a3a3e'; g.fillRect(0, -3, 11, 0.8);
        if (flash > 0) { g.fillStyle = '#fff6b0'; g.beginPath(); g.moveTo(11, -1.5); g.lineTo(22, -5); g.lineTo(19, -1.5); g.lineTo(22, 2); g.fill(); }
        g.restore();
      }
      if (shots > 0) TXT.draw(g, 'SHOTS FIRED: ' + shots, api.cam + api.W / 2, 40, { size: 13, align: 'center', fill: 'white' });
    } });
    s.at(0.3, () => api.bubble('STOP RESISTING!', A.x, F - 150, { size: 12, fill: 'white', life: 1 }));
    s.at(0.75, () => { drawn = true; api.sfx('clang'); });
    for (let i = 0; i < 40; i++) s.at(1.0 + i * 0.075, () => {
      shots = i + 1; flash = 0.04; api.sfx('shot'); api.shake(2);
      const j = J(V, pick(['chest', 'chest', 'belly', 'head', 'hip', 'neck']));
      FX.blood(j[0], j[1], 8, A.face, 1.1); FX.spurt(j[0], j[1], A.face, 0.6);
      const w = V.st2.wounds || (V.st2.wounds = []); if (w.length < 40) w.push({ j: pick(['head', 'chest', 'chest', 'belly']), dx: rnd(-4, 8), dy: rnd(-6, 6), r: 1.2, a: 0, drip: rnd(3, 9) });
      const h = J(A, 'handF'); FX.gib('casing', h[0], h[1] - 4, -A.face * rnd(40, 120), rnd(-220, -120), { s: 0.6, vr: 20, draw: g => { g.fillStyle = '#d8b040'; g.fillRect(-1.5, -0.8, 3, 1.6); } });
      V.ro.dx = rnd(-3, 3) + A.face * 2;
    });
    s.at(4.1, () => { V.ro.dx = 0; V.scriptPose = PS.down(V); api.sfx('thud'); FX.blood(V.x, F - 8, 40, 0, 0.8); });
    s.at(4.7, () => { drawn = false; api.sfx('clang'); });
    s.at(5.0, () => api.bubble('USE OF FORCE JUSTIFIED.', A.x, F - 150, { size: 12, fill: 'gold', life: 2.2 }));
    s.at(6.8, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (flash > 0) flash -= dt;
      if (t < 0.4) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 70 * k, dt, api, 80); return; }
      if (t < 0.75) { A.scriptPose = P({ hy: 6, lean: 0.2, head: 0.4, aF: [0.4, 0.9], aB: [0.3, 0.6], fF: [14, 0], fB: [-14, 0] }); return; }
      if (t < 4.1) {
        A.scriptPose = aim;
        if (t > 1.0) V.scriptPose = P({ hy: 6 + (t - 1) * 2, lean: -0.35 + Math.sin(t * 50) * 0.2, head: -0.4 + Math.sin(t * 43) * 0.4, aF: [1.0 + Math.sin(t * 37) * 0.8, 0.5], aB: [0.8 + Math.cos(t * 41) * 0.8, 0.6], fF: [9, 0], fB: [-10, 0] });
        return;
      }
      if (t < 4.7) { A.scriptPose = aim; return; }
      A.scriptPose = P({ hy: 4, lean: -0.1, head: -0.1, aF: [0.5, 2.2], aB: [0.5, 2.2], fF: [13, 0], fB: [-13, 0] });
    };
  };
  S.golemDie = (s, A, V, api) => {
    const F = api.FLOOR;
    s.at(0.7, () => {
      V.hidden = true; api.sfx('shatter'); api.sfx('big'); api.shake(9); api.flash();
      const c = J(V, 'chest');
      for (let i = 0; i < 36; i++) FX.gib('shard', c[0] + rnd(-20, 20), c[1] + rnd(-40, 40), rnd(-240, 240), rnd(-380, -40), { s: rnd(1, 2.2) });
      FX.puff(c[0], c[1], 'rgba(120,170,60,0.75)', 30, 6);
      FX.gib('brain', c[0], c[1], rnd(-60, 60), -300, { s: 2.2 });
      FX.gib('eye', c[0], c[1] - 10, rnd(-100, 100), -340, { s: 2.4, onRest: () => api.sfx('splat') });
      FX.gib('lid', c[0], c[1] - 50, rnd(-80, 80), -420, { draw: (g) => { g.fillStyle = '#9a9aa0'; g.fillRect(-14, -4, 28, 8); g.fillStyle = '#d0d0d4'; g.fillRect(-14, -4, 28, 2); } });
    });
    s.at(2.6, () => { s.done = true; });
    s.tick = (t) => { if (t < 0.7) { V.ro.dx = rnd(-2, 2); V.scriptPose = api.PS.dizzy(V.t * 3); if (Math.random() < 0.3) api.sfx('crunch'); } A.scriptPose = api.PS.win(A.t); void F; };
  };
  S.danDie = (s, A, V, api) => {
    const F = api.FLOOR;
    s.at(0.1, () => { api.sfx('scream'); api.bubble('NOOOOOO!', V.x, F - 150, { size: 16, fill: 'fire', life: 1.6 }); });
    s.at(0.6, () => api.sfx('fire'));
    s.at(1.8, () => { V.hidden = true; api.sfx('thud'); api.shake(6); });
    s.at(2.8, () => { s.done = true; });
    s.tick = (t) => {
      V.sink = Math.min(1, t / 1.7);
      V.scriptPose = P({ hy: 3, lean: -0.2, head: -0.5, aF: [2.9 + Math.sin(t * 14) * 0.2, 0.2], aB: [2.7 + Math.cos(t * 13) * 0.2, 0.2], fF: [9, 0], fB: [-9, 0] });
      if (t < 1.9) FX.fire(V.x + rnd(-18, 18), F, 4, 1.3);
      A.scriptPose = api.PS.win(A.t);
    };
  };
  // ---------- COKE WOLFE: Full Moon ----------
  S.wolfe = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    let moon = 0, bite = false, head = false, x0 = 0, nextShake = 0;
    const mx = () => api.cam + api.W * 0.5, my = 54;
    prop({ layer: 'back', draw(g) {
      if (moon <= 0) return;
      const y = lerp(F, my, moon);
      g.save(); g.globalAlpha = Math.min(1, moon * 1.4);
      const gr = g.createRadialGradient(mx(), y, 10, mx(), y, 70); gr.addColorStop(0, 'rgba(255,250,220,0.5)'); gr.addColorStop(1, 'rgba(255,250,220,0)');
      g.fillStyle = gr; g.fillRect(mx() - 80, y - 80, 160, 160);
      R.ball(g, mx(), y, 28, '#f4efd8'); g.fillStyle = 'rgba(160,150,120,0.35)'; g.beginPath(); g.arc(mx() - 8, y - 6, 7, 0, PI * 2); g.arc(mx() + 9, y + 8, 5, 0, PI * 2); g.arc(mx() + 4, y - 12, 3, 0, PI * 2); g.fill();
      g.restore();
    } });
    prop({ layer: 'front', draw(g) {
      if (!head) return;
      const h = J(A, 'head');
      g.save(); g.translate(h[0] + A.face * 20 * k, h[1] + 10); g.rotate(A.face * 0.6); R.drawHeadAt(g, { def: V.def, d: V.d }, 0, 6 * V.d.k, 0, 1, { dead: true, t: 0 }); g.restore();
      if (Math.random() < 0.5) FX.blood(h[0] + A.face * 20 * k, h[1] + 18, 1, 0, 0.3);
    } });
    s.at(0.6, () => { api.sfx('sniff'); const h = J(A, 'head'); FX.puff(h[0] + A.face * 20 * k, h[1], 'rgba(250,250,250,0.9)', 14, 3); });
    s.at(1.1, () => { api.sfx('howl'); });
    s.at(2.3, () => { x0 = A.x; });
    s.at(2.55, () => { bite = true; api.sfx('chomp'); api.sfx('scream'); api.shake(5); V.ro.gore = true; });
    s.at(4.1, () => {
      bite = false; head = true; V.ro.noHead = true; api.sfx('crunch'); api.sfx('splat'); api.shake(8); api.flash();
      const nk = J(V, 'neck'); FX.blood(nk[0], nk[1], 70, A.face, 1.6); FX.spurt(nk[0], nk[1], A.face * 0.3, 1.6);
      FX.burst(nk[0], nk[1], 6, ['chunk', 'chunk', 'bone', 'guts'], 1);
    });
    s.at(4.7, () => { head = false; const h = J(A, 'head'); headGib(V, h[0] + A.face * 20 * k, h[1] + 10, { vx: -A.face * 140, vy: -420, vr: 9 }); api.sfx('howl'); });
    s.at(5.2, () => api.bubble('AWOOOOOO!', A.x, F - 170, { size: 14, fill: 'white', life: 1.8 }));
    s.at(6.4, () => { s.done = true; });
    s.tick = (t, dt) => {
      moon = Math.min(1, Math.max(0, (t - 0.4) / 0.9));
      if (t < 0.6) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 34 * k, dt, api, 110); return; }
      if (t < 1.0) { A.scriptPose = P({ hy: 6, lean: 0.3, head: 0.4, aF: [2.5, 2.75], aB: [0.6, 1.9], fF: [13, 0], fB: [-13, 0] }); V.scriptPose = PS.dizzy(V.t); return; }
      if (t < 2.3) {
        // the howl, and the change: he gets bigger
        A.ro.scale = 1 + ease((t - 1.0) / 1.2) * 0.22;
        A.scriptPose = P({ hy: 3, lean: -0.35, head: -1.05, jaw: 1, aF: [0.8 + Math.sin(t * 9) * 0.1, 0.6], aB: [0.7, 0.6], fF: [14, 0], fB: [-14, 0] });
        V.scriptPose = P({ hy: 9, lean: -0.3, head: -0.3, aF: [2.3, 2.5], aB: [2.1, 2.6], fF: [8, 0], fB: [-13, 0] });
        return;
      }
      if (t < 2.55) { A.x = lerp(x0, V.x - A.face * 16 * k, (t - 2.3) / 0.25); A.scriptPose = P({ hy: 4, lean: 0.9, head: 0.4, jaw: 1, aF: [1.7, 0.3], aB: [1.6, 0.4], fF: [20, 0], fB: [-16, 0] }); return; }
      if (bite) {
        // shakes the victim like a dog with a chew toy
        const w = Math.sin(t * 26);
        A.scriptPose = P({ hy: 6, lean: 0.55 + w * 0.15, head: 0.5 + w * 0.3, jaw: 0.25, aF: [1.6, 0.6], aB: [1.4, 0.8], fF: [18, 0], fB: [-16, 0] });
        V.scriptPose = P({ hy: 6, lean: -0.35 + w * 0.5, head: -0.6 - w * 0.4, aF: [1.6 - w * 1.2, 0.4], aB: [1.2 + w * 1.2, 0.4], fF: [8 + w * 8, -Math.max(0, w) * 8], fB: [-10 - w * 8, -Math.max(0, -w) * 8], rot: w * 0.25, piv: 2 });
        V.ro.dx = w * 5;
        if (t > nextShake) { nextShake = t + 0.12; api.sfx('gnaw'); const nk = J(V, 'neck'); FX.blood(nk[0], nk[1], 10, Math.sign(w) || 1, 1.1); if (Math.random() < 0.4) FX.gib('chunk', nk[0], nk[1], rnd(-120, 120), rnd(-260, -100)); }
        return;
      }
      V.ro.dx = 0;
      if (t < 4.7) { V.scriptPose = PS.down(V); A.scriptPose = P({ hy: 5, lean: 0.3, head: 0.1, jaw: 0.4, aF: [1.2, 1.0], aB: [0.6, 1.9], fF: [14, 0], fB: [-14, 0] }); return; }
      A.scriptPose = P({ hy: 3, lean: -0.35, head: -1.05, jaw: 1, aF: [0.8, 0.6], aB: [0.7, 0.6], fF: [14, 0], fB: [-14, 0] });
    };
  };

  // ---------- EAST END EM: First Edition ----------
  S.em = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    const PW = 66, PH = 128;
    let bookY = -300, close = 0, pressed = false, sign = 0, spineX = 0, dir = 1, drop = false;
    const pageL = () => spineX - dir * PW, pageR = () => spineX;
    prop({ layer: 'back', draw(g) {
      if (!drop) return;
      const y0 = F - PH + bookY, sx = spineX;
      g.save();
      // the open book standing up behind the victim, facing us
      if (close < 1) { g.fillStyle = '#4a0c14'; g.fillRect(sx - PW - 4, y0 - 4, PW * 2 + 8, PH + 8); }
      else { const lx = Math.min(sx, sx - dir * PW); g.fillStyle = '#efe6cc'; g.fillRect(lx - 2, y0 - 2, PW + 4, PH + 4); g.fillStyle = '#6a1420'; g.fillRect(lx - 4, y0 - 4, PW + 6, PH + 8); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(dir > 0 ? lx + PW - 4 : lx - 4, y0 - 4, 5, PH + 8); }
      const page = (x, w, red) => { g.fillStyle = '#efe6cc'; g.fillRect(x, y0, w, PH); g.fillStyle = 'rgba(60,50,40,0.45)'; for (let i = 0; i < 13; i++) g.fillRect(x + 6, y0 + 12 + i * 7.5, Math.abs(w) - 12, 1); if (red) { g.fillStyle = 'rgba(140,0,12,0.55)'; g.fillRect(x, y0, w, PH); } };
      // the page the victim is pressed into
      if (close < 1) page(Math.min(sx, sx - dir * PW), PW, false);
      if (pressed && close < 1) {
        g.save(); g.beginPath(); g.rect(Math.min(sx, sx - dir * PW), y0, PW, PH); g.clip();
        g.translate(sx - dir * PW / 2, y0 + PH - 6); g.scale(0.82, 0.82); g.globalAlpha = 0.9;
        R.draw(g, { def: V.def, d: V.d, x: 0, y: 0, face: -dir, t: 0, st: { dead: true, wounds: V.st2.wounds } }, R.resolve(V.d, P({ hy: 4, lean: 0, aF: [2.4, 0.2], aB: [2.2, 0.3], fF: [16, 0], fB: [-16, 0] })), { flat: 1 });
        g.restore();
        g.fillStyle = 'rgba(150,0,14,0.5)'; g.fillRect(Math.min(sx, sx - dir * PW), y0, PW, PH);
      }
      // the other page swings shut over it
      const c = Math.cos(close * PI), w = PW * c;
      if (close < 1) { if (c > 0) page(sx, dir * w, false); else { g.fillStyle = '#6a1420'; g.fillRect(Math.min(sx, sx + dir * w), y0 - 4, Math.abs(w) + 4, PH + 8); } }
      if (close >= 1) {
        const cx = sx - dir * PW / 2;
        g.fillStyle = '#d8b040'; g.fillRect(cx - 22, y0 + 18, 44, 1.5); g.fillRect(cx - 22, y0 + 46, 44, 1.5);
        TXT.draw(g, 'MUNCIE', cx, y0 + 24, { size: 9, align: 'center', fill: 'gold', italic: false, shadow: false });
        TXT.draw(g, 'VICTIMS', cx, y0 + 34, { size: 8, align: 'center', fill: 'gold', italic: false, shadow: false });
        if (sign > 0) { g.strokeStyle = '#1a1a40'; g.lineWidth = 1.2; g.beginPath(); for (let i = 0; i <= sign * 20; i++) { const x = cx - 18 + i * 1.8, y = y0 + 80 + Math.sin(i * 1.3) * 3 - (i % 5 === 0 ? 3 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      }
      g.restore();
    } });
    s.at(0.5, () => { drop = true; dir = A.face; spineX = V.x + A.face * PW / 2; });
    s.at(0.8, () => { api.sfx('thud'); api.shake(6); FX.dust(spineX, F, 20); });
    for (let i = 0; i < 8; i++) s.at(1.0 + i * 0.1, () => {
      api.sfx('slash'); const c = J(V, pick(['chest', 'belly', 'head', 'neck']));
      FX.blood(c[0], c[1], 10, A.face, 1); FX.spark(c[0], c[1], '#fffbe8', 4); V.ro.gore = true;
      const w = V.st2.wounds || (V.st2.wounds = []); w.push({ j: pick(['head', 'chest', 'belly']), dx: rnd(-4, 8), dy: rnd(-6, 6), r: 1, a: rnd(0, 3), drip: rnd(3, 8) });
      V.x += A.face * 1.2;
    });
    s.at(1.9, () => { pressed = true; V.hidden = true; api.sfx('splat'); api.sfx('squish'); api.shake(3); FX.blood(V.x, F - 60, 30, A.face, 0.9); });
    s.at(2.55, () => {
      api.sfx('crunch'); api.sfx('thud'); api.shake(9); api.flash();
      const cx = spineX - dir * PW / 2;
      for (let i = 0; i < 4; i++) FX.blood(cx + rnd(-PW / 2, PW / 2), F - PH, 18, rnd(-1, 1), 1.4);
      FX.blood(spineX - dir * PW, F - 60, 30, -dir, 1.4);
      FX.burst(cx, F - PH, 6, ['tooth', 'tooth', 'eye', 'chunk'], 1);
    });
    s.at(3.2, () => { api.sfx('ding'); });
    s.at(4.3, () => api.bubble('AUTOGRAPHED COPY.', A.x, F - 140, { size: 12, fill: 'gold', life: 2 }));
    s.at(5.8, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (drop) bookY = Math.min(0, bookY + dt * 1400);
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 36 * k, dt, api, 110); return; }
      if (t < 1.0) { V.scriptPose = PS.dizzy(V.t); A.scriptPose = PS.chopUp; return; }
      if (t > 1.9 && t < 3.2) walkTo(A, spineX - dir * PW - A.face * 26 * k, dt, api, 120);
      if (t < 1.9) { const n = Math.floor(t / 0.05); A.scriptPose = [PS.chopUp, PS.chopDn, PS.chopUp2, PS.chopDn2][n % 4]; V.scriptPose = P({ hy: 6, lean: -0.35, head: -0.4, aF: [0.8, 0.4], aB: [0.6, 0.4], fF: [8, 0], fB: [-11, 0] }); return; }
      if (t < 2.55) { close = ease((t - 2.15) / 0.4); A.scriptPose = t < 2.2 ? PS.chopUp : P({ hy: 8, lean: 0.4, aF: [1.5, 0.05], aB: [0.6, 1.9], fF: [19, 0], fB: [-14, 0] }); return; }
      close = 1;
      if (Math.random() < 0.5) FX.blood(spineX - dir * rnd(4, PW - 4), F - 2, 1, 0, 0.2);
      if (t < 3.2) return;
      A.x = spineX - dir * PW - A.face * 20 * k;
      if (t < 4.2) { sign = Math.min(1, (t - 3.3) / 0.8); A.scriptPose = P({ hy: 6, lean: 0.2, head: 0.3, aF: [1.6 + Math.sin(t * 30) * 0.05, 1.0], aB: [0.6, 1.9], fF: [14, 0], fB: [-14, 0] }); return; }
      A.scriptPose = P({ hy: 4, lean: -0.1, head: -0.25, aF: [3.0, 0.3], aB: [0.7, 2.3], fF: [12, 0], fB: [-12, 0] });
    };
  };

  // ---------- SLUM LORD: Condemned ----------
  S.slumlord = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    let maw = 0, pull = 0, vx0 = 0, tentT = 0;
    const belly = () => { const c = J(A, 'belly'); return [c[0] + A.face * 8 * k, c[1]]; };
    prop({ layer: 'front', draw(g) {
      if (maw <= 0) return;
      const [bx, by] = belly(), r = 18 * k * maw;
      g.fillStyle = '#2a0204'; g.beginPath(); g.ellipse(bx, by, r * 0.55, r, 0, 0, PI * 2); g.fill();
      g.fillStyle = '#e8dcb8'; for (let i = -3; i <= 3; i++) { R.poly(g, [[bx - r * 0.5, by + i * r * 0.26], [bx - r * 0.5 + 4, by + i * r * 0.26 + 2], [bx - r * 0.5, by + i * r * 0.26 + 4]], '#e8dcb8'); R.poly(g, [[bx + r * 0.5, by + i * r * 0.26], [bx + r * 0.5 - 4, by + i * r * 0.26 + 2], [bx + r * 0.5, by + i * r * 0.26 + 4]], '#e8dcb8'); }
      if (tentT > 0) {
        const h = J(V, 'chest');
        for (let i = 0; i < 4; i++) {
          g.strokeStyle = i % 2 ? '#a86a6a' : '#c08070'; g.lineWidth = 3.4 - i * 0.4; g.lineCap = 'round';
          g.beginPath(); g.moveTo(bx, by + (i - 1.5) * 5);
          g.quadraticCurveTo((bx + h[0]) / 2 + Math.sin(s.t * 9 + i) * 10, (by + h[1]) / 2 - 20 + i * 8, h[0], h[1] + (i - 1.5) * 9);
          g.stroke();
        }
        g.lineCap = 'butt';
      }
    } });
    s.at(0.55, () => { api.sfx('squish'); api.bubble('RENT IS DUE.', A.x, F - 170, { size: 12, fill: 'gold', life: 1.4 }); });
    s.at(1.3, () => { tentT = 1; V.ro.top = true; api.sfx('slurp'); api.sfx('scream'); vx0 = V.x; });
    s.at(3.0, () => { V.hidden = true; tentT = 0; api.sfx('gulp'); api.shake(5); });
    s.at(3.2, () => { for (let i = 0; i < 5; i++) s.at(3.2 + i * 0.22, () => { api.sfx('crunch'); api.shake(3); const [bx, by] = belly(); FX.blood(bx, by, 12, A.face, 0.9); }); });
    s.at(4.5, () => {
      const [bx, by] = belly(); api.sfx('fart'); api.shake(4);
      skullGib(V, bx, by, A.face * 260, -300);
      for (let i = 0; i < 5; i++) FX.gib('bone', bx, by, A.face * rnd(120, 300), rnd(-300, -120));
      FX.gib('receipt', bx, by, A.face * 160, -380, { vr: 6, s: 1.4, draw: g => { g.fillStyle = '#f4f0e0'; g.fillRect(-7, -10, 14, 20); g.fillStyle = '#b01018'; g.font = '5px Anton, Impact, sans-serif'; g.fillText('PAID', -5.5, -3); g.fillStyle = 'rgba(40,40,40,0.6)'; for (let i = 0; i < 4; i++) g.fillRect(-5, 1 + i * 2, 10, 0.7); } });
    });
    s.at(5.0, () => api.bubble('DEPOSIT IS NON-REFUNDABLE.', A.x, F - 150, { size: 11, fill: 'gold', life: 2 }));
    s.at(6.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 70 * k, dt, api, 90); return; }
      maw = Math.min(1, Math.max(0, (t - 0.6) / 0.5)); if (t > 3.0 && t < 4.7) maw = 0.6 + Math.abs(Math.sin(t * 12)) * 0.4; if (t > 4.7) maw = Math.max(0, maw - dt * 2);
      A.scriptPose = P({ hy: 6, lean: -0.35, head: -0.3, aF: [1.2, 1.5], aB: [0.8, 1.7], fF: [16, 0], fB: [-16, 0] });
      if (t > 4.7) A.scriptPose = PS.mirror(t);
      if (tentT > 0) {
        // dragged in feet first, shrinking into the gut
        const u = ease((t - 1.6) / 1.4), [bx, by] = belly();
        V.x = lerp(vx0, bx, u); V.y = lerp(F, by + 20 * (1 - u), u);
        V.ro.scale = 1 - u * 0.75;
        V.scriptPose = P({ hy: 3, lean: -0.6 - u * 0.6, head: -0.5, aF: [2.6 + Math.sin(t * 20) * 0.3, 0.4], aB: [2.4 + Math.cos(t * 18) * 0.3, 0.5], fF: [14, -4], fB: [-6, 0], rot: -u * 1.2, piv: 2 });
        if (Math.random() < 0.3) { const c = J(V, 'chest'); FX.blood(c[0], c[1], 2, 0, 0.5); }
      }
    };
  };
  S.slumDie = (s, A, V, api) => {
    const F = api.FLOOR;
    let melt = 0;
    prop({ layer: 'front', draw(g) {
      if (melt <= 0) return;
      const w = 30 + melt * 40, h = 10 + (1 - melt) * 20;
      g.fillStyle = '#9a6a5a'; g.beginPath(); g.ellipse(V.x, F - h / 2, w, h / 2 + 2, 0, PI, PI * 2); g.fill();
      g.fillStyle = 'rgba(110,30,40,0.6)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(V.x - w * 0.8 + i * w * 0.27, F - h * 0.3, 3 + (i % 3), 0, PI * 2); g.fill(); }
      g.fillStyle = '#c8a060'; for (let i = 0; i < 4; i++) R.ball(g, V.x - 20 + i * 13, F - h * 0.6, 2.2, '#c8a060');
      // the hair survives, still perfectly slicked
      g.fillStyle = '#14100c'; g.beginPath(); g.ellipse(V.x + 4, F - h - 2, 10, 3.2, 0, PI, PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(V.x - 2, F - h - 4.4, 8, 0.8);
    } });
    s.at(0.1, () => { api.sfx('scream'); api.bubble('NOT THE FACE!', V.x, F - 170, { size: 14, fill: 'gold', life: 1.4 }); });
    for (let i = 0; i < 6; i++) s.at(0.5 + i * 0.18, () => { const c = J(V, pick(['chest', 'belly', 'head'])); api.sfx('splat'); FX.puff(c[0], c[1], 'rgba(170,190,80,0.8)', 8, 2); FX.blood(c[0], c[1], 12, rnd(-1, 1), 1); });
    s.at(1.7, () => { V.ro.cracked = true; api.sfx('shatter'); });
    s.at(2.0, () => { V.hidden = true; api.sfx('squish'); api.shake(6); FX.burst(V.x, F - 30, 10, ['chunk', 'guts', 'eye', 'bone', 'liver'], 1); });
    s.at(3.4, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 2.0) { V.ro.dx = rnd(-2, 2); V.ro.scale = 1 + Math.sin(t * 30) * 0.03 * t; V.scriptPose = P({ hy: 6 + t * 10, lean: 0.3 + t * 0.2, head: 0.5, aF: [2.6, 2.6], aB: [2.4, 2.5], fF: [10, 0], fB: [-12, 0] }); }
      else melt = Math.min(1, (t - 2.0) / 0.8);
      A.scriptPose = api.PS.stance(A.t); void dt;
    };
  };

  S.generic = (s, A, V, api) => { s.at(0.1, () => { V.scriptPose = api.PS.down(V); }); s.at(1.5, () => { s.done = true; }); };

  return { start };
})();
