// Muncie Kombat: fatalities, the stage fatality and boss deaths (scripted timelines)
'use strict';
const FATAL = (() => {
  const R = RIG, P = RIG.P, PI = Math.PI;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
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

  function start(id, A, V, api) {
    const s = { t: 0, done: false, ev: [], tick: null };
    s.at = (time, fn) => s.ev.push({ time, fn });
    s.update = dt => {
      s.t += dt; A.t += dt; V.t += dt;
      for (const e of s.ev) if (!e.f && s.t >= e.time) { e.f = 1; e.fn(); }
      if (s.tick) s.tick(s.t, dt);
    };
    if (!['golemDie', 'danDie', 'bridge'].includes(id)) center(A, V, api);
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
      const pose = P({ aF: [2.8, 0.4], aB: [2.4, 0.6], lF: [0.6, 0.3], lB: [-0.4, 0.3], lean: 0 });
      const hh = api.hurtH(V);
      FX.gib('skel', bx, by, -A.face * 520, -90, {
        grav: 260, vr: -A.face * 9, trail: true,
        draw: (g) => R.draw(g, { def: V.def, d: V.d, x: 0, y: hh * 0.5, face: 1, t: 0 }, pose, { skeleton: true, gore: true }),
        onUpdate: (o) => {
          if (o.x < api.cam + 16 || o.x > api.cam + api.W - 16 || o.rest) {
            o.dead = true; api.sfx('crunch'); api.shake(5);
            FX.burst(o.x, o.y, 14, ['bone', 'bone', 'skullfrag', 'chunk', 'tooth'], 1);
            FX.blood(o.x, o.y, 30, A.face, 1);
          }
        }
      });
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
      easel = prop({ layer: 'back', x: A.x + A.face * 108 * k, y: F - 82, splats: [], draw(g, p) {
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
    const hits = [1.3, 1.8, 2.3, 2.8];
    hits.forEach((h, i) => s.at(h, () => {
      const last = i === hits.length - 1;
      api.sfx('crunch'); api.sfx('splat'); api.shake(last ? 7 : 3);
      const hp = J(V, 'head');
      FX.blood(hp[0], hp[1], last ? 50 : 16, -A.face, last ? 1.5 : 0.9);
      splat(last ? 14 : 5, last);
      if (last) { V.ro.noHead = true; FX.burst(hp[0], hp[1], 12, ['brain', 'eye', 'skullfrag', 'chunk', 'tooth', 'skullfrag'], 1.1); api.flash(); }
    }));
    s.at(3.35, () => { dropped = true; V.scriptPose = PS.down(V); V.snapPose = true; V.x = hand[0] + A.face * 20; V.y = F; V.ro.noHead = true; api.sfx('thud'); FX.blood(V.x, F - 6, 12, 0, 0.6); });
    s.at(4.3, () => api.bubble('A HAPPY LITTLE ACCIDENT.', A.x, F - 150, { size: 12, life: 2, fill: 'white' }));
    s.at(5.4, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.6) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 30 * k, dt, api, 110); return; }
      if (!dropped) {
        // swing: 0 = hanging, ~1.2 = head into the canvas
        if (t < 1.05) swingA = -0.3 * ease((t - 0.6) / 0.45);
        else if (t < 3.05) { const u = ((t - 1.05) % 0.5) / 0.5; swingA = u < 0.5 ? lerp(-0.4, 1.2, ease(u / 0.5)) : lerp(1.2, -0.4, ease((u - 0.5) / 0.5)); }
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
    const sw = [P({ hy: 4, lean: 0.35, aF: [2.5, 0.2], aB: [0.8, 1.6], fF: [16, 0], fB: [-12, 0] }), P({ hy: 4, lean: 0.4, aF: [1.0, 0.3], aB: [2.4, 0.2], fF: [16, 0], fB: [-12, 0] }), P({ hy: 4, lean: 0.4, aF: [2.2, 0.3], aB: [1.0, 0.2], fF: [16, 0], fB: [-12, 0] })];
    const slashes = prop({ layer: 'front', list: [], draw(g, p) { if (V.hidden) return; for (const l of p.list) R.line(g, V.x + l[0], V.y + l[1], V.x + l[2], V.y + l[3], '#9a000c', 1.6); } });
    let swipe = 0, nextSwipe = 0.55;
    s.at(0.5, () => { A.ro.claws = true; });
    s.at(2.3, () => {
      V.hidden = true; api.sfx('splat'); api.sfx('crunch'); api.shake(5);
      const cols = [V.def.col.torso, V.def.col.legU, V.def.col.hand, '#8a0010', '#b0101a', V.def.col.armU];
      const strips = []; for (let i = 0; i < 46; i++) { const a = rnd(0, PI), r = rnd(0, 1); strips.push({ x: Math.cos(a) * 28 * r, y: -Math.sin(a) * 16 * r, a: rnd(0, PI), l: rnd(5, 11), c: cols[i % cols.length] }); }
      prop({ layer: 'back', x: V.x, draw(g, p) {
        g.fillStyle = '#6a0008'; g.beginPath(); g.ellipse(p.x, F + 1, 34, 6, 0, 0, PI * 2); g.fill();
        for (const s2 of strips) R.line(g, p.x + s2.x - Math.cos(s2.a) * s2.l / 2, F - 3 + s2.y - Math.sin(s2.a) * s2.l / 2, p.x + s2.x + Math.cos(s2.a) * s2.l / 2, F - 3 + s2.y + Math.sin(s2.a) * s2.l / 2, s2.c, 2.4);
        R.bone(g, [p.x - 14, F - 8], [p.x - 2, F - 14], 1.4); R.bone(g, [p.x + 6, F - 6], [p.x + 18, F - 12], 1.4);
        R.drawHeadAt(g, { def: V.def, d: V.d }, p.x + 4, F - 14, -0.4, 1, { dead: true });
      } });
      FX.blood(V.x, F - 30, 40, 0, 1); for (let i = 0; i < 8; i++) FX.gib('ribbon', V.x, F - 50, rnd(-120, 120), rnd(-260, -100));
    });
    s.at(2.5, () => api.bubble('MONDAYS.', A.x, F - 140, { size: 15, fill: 'fire', life: 1.6 }));
    s.at(3.4, () => { A.x = V.x; A.y = F - 12; A.scriptPose = P(Object.assign({}, PS.down(A), { rot: -PI / 2 })); A.snapPose = true; A.ro.claws = false; });
    s.at(3.7, () => api.bubble('Z', A.x + 10, F - 40, { size: 10, life: 1.2 }));
    s.at(4.1, () => api.bubble('Z Z', A.x + 18, F - 52, { size: 12, life: 1.2 }));
    s.at(4.5, () => api.bubble('Z Z Z', A.x + 26, F - 64, { size: 14, life: 1.2 }));
    s.at(5.2, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 30 * k, dt, api, 110); return; }
      if (t < 2.3) {
        if (t >= nextSwipe) {
          nextSwipe = t + 0.09; swipe++;
          A.scriptPose = sw[swipe % 3]; A.snapPose = true;
          api.sfx('slash');
          const hh = api.hurtH(V), y = -rnd(hh * 0.15, hh * 0.9);
          FX.blood(V.x + A.face * -4, V.y + y, 6, A.face, 0.8);
          slashes.list.push([rnd(-10, 6), y - 6, rnd(-4, 10), y + 6]);
          V.ro.dx = rnd(-2, 2);
          V.scriptPose = swipe % 2 ? PS.hitHigh : PS.hitLow;
        }
        return;
      }
      if (t < 3.4) { walkTo(A, V.x - A.face * 4, dt, api, 60); return; }
      A.scriptPose = P(Object.assign({}, PS.down(A), { rot: -PI / 2, aF: [1.8, 1.5], aB: [1.6, 1.6], hy: Math.sin(t * 2) * 0.6 }));
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
      shown = 10; spine = true; V.ro.noHead = true; V.scriptPose = PS.downFace(V); V.snapPose = true;
      api.sfx('crunch'); api.sfx('splat'); api.shake(6); api.flash();
      const nk = J(V, 'neck'); FX.blood(nk[0], nk[1], 50, -A.face, 1.4);
      A.scriptPose = P({ hy: 2, lean: -0.15, aF: [3.05, 0.05], aB: [0.6, 1.9], fF: [11, 0], fB: [-12, 0] });
    });
    prop({ layer: 'front', draw(g) { if (!spine) return; const h = J(A, 'handF'); g.save(); g.translate(h[0], h[1] + 3); FX.drawSpine(g, 46 * V.d.k, V.d.k); g.restore(); } });
    s.at(3.55, () => api.bubble('AND THE NUMBER ONE...', A.x - A.face * 10, F - 168, { size: 11, life: 1.6, fill: 'gold' }));
    s.at(5.8, () => { s.done = true; });
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

  // ---------- ROCKY: Rabies ----------
  S.rocky = (s, A, V, api) => {
    const PS = api.PS, F = api.FLOOR;
    let x0, nextChomp = 0.6, dump = null, tossed = null;
    s.at(0.25, () => { x0 = A.x; api.sfx('scream'); });
    s.at(2.4, () => {
      V.ro.skeleton = true; V.ro.gore = true; api.sfx('crunch'); api.shake(5);
      const c = J(V, 'chest'); FX.blood(c[0], c[1], 50, 0, 1.3); FX.burst(c[0], c[1], 10, ['chunk', 'chunk', 'guts', 'heart', 'eye'], 1);
      A.y = F; A.x = V.x - A.face * 26; A.snapPose = true;
    });
    s.at(2.7, () => {
      dump = prop({ layer: 'back', x: Math.max(api.cam + 40, Math.min(api.cam + api.W - 40, A.x - A.face * 76)), y: -60, lid: 0, update(p, dt) { if (p.y < F) { p.y = Math.min(F, p.y + dt * 600); if (p.y >= F) { api.sfx('clang'); api.shake(5); FX.dust(p.x, F, 14); } } }, draw(g, p) {
        const y = p.y;
        g.fillStyle = '#1e4a2a'; g.fillRect(p.x - 30, y - 40, 60, 40); g.fillStyle = '#2a6a3a'; g.fillRect(p.x - 30, y - 40, 60, 4);
        g.fillStyle = '#143220'; for (let i = -24; i < 30; i += 8) g.fillRect(p.x + i, y - 34, 1.5, 32);
        g.fillStyle = '#f0f0f0'; g.font = '7px Anton, Impact, sans-serif'; g.fillText('CITY OF MUNCIE', p.x - 24, y - 16);
        g.save(); g.translate(p.x - 31, y - 41); g.rotate(-p.lid * 1.2); g.fillStyle = '#2a2a2e'; g.fillRect(0, -3, 62, 4); g.restore();
      } });
    });
    s.at(3.0, () => { A.face = -A.face; });
    s.at(4.0, () => {
      V.hidden = true; api.sfx('whoosh');
      const hh = api.hurtH(V);
      const pose = P({ aF: [2.6, 0.5], aB: [2.2, 0.6], lF: [0.5, 0.4], lB: [-0.3, 0.4] });
      tossed = FX.gib('skel', V.x, F - hh * 0.5, (dump.x - V.x) / 0.55, -420, { grav: 1300, vr: 8, trail: false, draw: (g) => R.draw(g, { def: V.def, d: V.d, x: 0, y: hh * 0.5, face: 1, t: 0 }, pose, { skeleton: true, gore: true }), onUpdate: (o) => { if (o.vy > 0 && o.y > F - 46 && Math.abs(o.x - dump.x) < 40) { o.dead = true; api.sfx('crunch'); } } });
      dump.lid = 1;
    });
    s.at(4.7, () => { dump.lid = 0; api.sfx('clang'); api.shake(4); });
    s.at(5.0, () => { A.x = dump.x; A.y = F - 40; A.face = -A.face; A.snapPose = true; api.bubble('HEH HEH HEH', A.x, F - 130, { size: 12, fill: 'white', life: 1.4 }); });
    s.at(6.0, () => { s.done = true; });
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
      if (t < 3.0) { A.scriptPose = PS.stance(A.t); V.scriptPose = P({ hy: 8, lean: 0.1, aF: [0.3, 0.2], aB: [0.2, 0.2], fF: [9, 0], fB: [-10, 0] }); return; }
      if (t < 4.0 && dump) {
        walkTo(A, dump.x + A.face * -36, dt, api, 70);
        V.x = A.x - A.face * 26; V.scriptPose = P({ rot: V.face * 0, lean: -0.5, hy: 4, aF: [2.6, 0.2], aB: [0.3, 0.2], fF: [14, -2], fB: [6, -2] });
        A.scriptPose = Object.assign({}, A.scriptPose, { aB: [1.9, 0.2] });
        return;
      }
      if (t < 5.0) { A.scriptPose = PS.win(A.t); return; }
      A.scriptPose = PS.stance(A.t);
    };
  };

  // ---------- MILLIE: Timber ----------
  S.millie = (s, A, V, api) => {
    const PS = api.PS, k = A.d.k, F = api.FLOOR;
    let nextGnaw = 0.6, fallU = 0, lodge = null, feetX = 0;
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
        if (s.t > 4.4) R.drawHeadAt(g, { def: V.def, d: V.d }, cx, F - 4, 0, 0.9, { dead: true });
      }, update() { for (const b of bones) { const u = ease((s.t - b.t0) / 0.6); b.cx = b.cx == null ? b.x : b.cx; b.cy = b.cy == null ? b.y : b.cy; b.x = lerp(b.cx, b.tx, u); b.y = lerp(b.cy, b.ty, u) - Math.sin(u * PI) * 40; b.r = lerp(b.r, b.tr, u * 0.2); } } });
      lodge.cx = cx;
      FX.blood(cx, F - 10, 30, 0, 0.8);
    });
    s.at(4.6, () => { A.x = lodge.cx; A.y = F - 32; A.snapPose = true; api.sfx('land'); });
    s.at(4.9, () => api.bubble('HOME SWEET HOME', A.x, F - 120, { size: 12, fill: 'white', life: 1.6 }));
    s.at(6.0, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.5) { V.scriptPose = PS.dizzy(V.t); walkTo(A, V.x - A.face * 16 * k, dt, api, 110); return; }
      if (t < 2.1) {
        A.scriptPose = P({ hyL: 0.45, lean: 1.05 + Math.sin(t * 34) * 0.1, head: 0.7, aF: [1.4, 0.6], aB: [1.2, 0.7], fF: [12, 0], fB: [-14, 0] });
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

  // ---------- Stage fatality: off the White River trestle ----------
  S.bridge = (s, A, V, api) => {
    const PS = api.PS;
    let vy = -900, by = -40, bvy = 0, landed = false, trainX = null, smashed = false;
    const bx = () => api.W * 0.5;
    api.sfx('big'); FX.blood(V.x, V.y - 80, 40, A.face, 1.6);
    s.at(0.75, () => {
      FX.reset();
      api.scene((g, W, H) => {
        STAGES.drawBelow(g, W, s.t);
        FX.drawDecals(g); FX.drawGibs(g);
        if (!smashed) {
          const f = { def: V.def, d: V.d, x: bx(), y: by, face: 1, t: s.t, st: { dead: landed } };
          R.draw(g, f, landed ? PS.down(f) : PS.air(s.t * 9), {});
        }
        if (trainX != null) STAGES.drawTrain(g, trainX, 214);
        FX.drawParts(g);
      });
    });
    s.at(1.6, () => api.sfx('horn'));
    s.at(1.9, () => { trainX = api.W + 30; api.sfx('train'); });
    s.at(3.9, () => { api.scene(null); FX.reset(); V.hidden = true; A.scriptPose = PS.win(A.t); });
    s.at(4.6, () => { s.done = true; });
    s.tick = (t, dt) => {
      if (t < 0.75) { V.y += vy * dt; V.x += A.face * 40 * dt; V.scriptPose = PS.air(t * 12); A.scriptPose = PS.up1 || PS.stance(A.t); return; }
      if (!landed) { bvy += 1300 * dt; by += bvy * dt; if (by >= 210) { by = 210; landed = true; api.sfx('thud'); api.shake(5); FX.blood(bx(), 205, 30, 0, 0.8); } }
      if (trainX != null) {
        trainX -= 950 * dt;
        if (!smashed && trainX < bx() + 10) {
          smashed = true; api.sfx('splat'); api.sfx('crunch'); api.shake(10);
          FX.burst(bx(), 200, 26, ['chunk', 'bone', 'guts', 'skullfrag', 'eye', 'chunk', 'heart', 'brain'], 1.4);
          for (const gb of FX.gibs) gb.vx -= 380;
          FX.blood(bx(), 200, 120, -1, 1.8, 1.3); FX.drops(18);
        }
        if (smashed && Math.random() < 0.6) FX.blood(trainX + 10, 190 + rnd(-20, 10), 2, -1, 0.8);
      }
      A.scriptPose = PS.win(A.t);
    };
  };

  // ---------- boss deaths ----------
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
  S.generic = (s, A, V, api) => { s.at(0.1, () => { V.scriptPose = api.PS.down(V); }); s.at(1.5, () => { s.done = true; }); };

  return { start };
})();
