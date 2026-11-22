// Muncie Kombat: skeletal fighter rig, shaded body drawing, skeleton mode
// Local frame: origin between the feet on the floor, +x is the way the fighter faces, y grows downward.
// Angles: 0 points straight down, positive swings forward (+x), PI points straight up.
'use strict';
const RIG = (() => {
  const PI = Math.PI;
  const dir = (a, L) => [Math.sin(a) * L, Math.cos(a) * L];
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const lerp2 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];

  function shade(hex, f) {
    if (hex[0] !== '#') return hex;
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }

  // ---------- shaded primitives ----------
  function sphFill(g, x, y, r, c) {
    const gr = g.createRadialGradient(x + r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 1.15);
    gr.addColorStop(0, shade(c, 0.35)); gr.addColorStop(0.45, c); gr.addColorStop(1, shade(c, -0.55));
    return gr;
  }
  function ball(g, x, y, r, c) { g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, PI * 2); g.fillStyle = sphFill(g, x, y, r, c); g.fill(); }
  function oval(g, x, y, rx, ry, c, rot = 0, flat = false) {
    g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, PI * 2);
    g.fillStyle = flat ? c : sphFill(g, x, y, Math.max(rx, ry), c); g.fill();
  }
  function poly(g, pts, c) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fillStyle = c; g.fill(); }
  function line(g, x1, y1, x2, y2, c, w) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }
  function capPath(g, A, B, ra, rb) {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1e-3, ang = Math.atan2(dy, dx);
    g.beginPath();
    g.arc(A[0], A[1], ra, ang + PI / 2, ang - PI / 2);
    g.arc(B[0], B[1], rb, ang - PI / 2, ang + PI / 2);
    g.closePath();
    return L;
  }
  // limb capsule, lit from the upper front
  function cap(g, A, B, ra, rb, c, alpha) {
    capPath(g, A, B, ra, rb);
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1e-3;
    let nx = -dy / L, ny = dx / L;
    if (nx * 0.55 - ny * 0.85 < 0) { nx = -nx; ny = -ny; }
    const m = lerp2(A, B, 0.45), r = Math.max(ra, rb) * 1.05;
    const gr = g.createLinearGradient(m[0] + nx * r, m[1] + ny * r, m[0] - nx * r, m[1] - ny * r);
    gr.addColorStop(0, shade(c, 0.32)); gr.addColorStop(0.35, c); gr.addColorStop(0.85, shade(c, -0.45)); gr.addColorStop(1, shade(c, -0.7));
    if (alpha != null) g.globalAlpha = alpha;
    g.fillStyle = gr; g.fill();
    g.globalAlpha = 1;
  }

  // ---------- poses ----------
  const BASE = { hx: 0, hy: 0, hyL: 0, hyA: 0, lean: 0, rot: 0, head: 0, aF: [0.3, 0.3], aB: [0.2, 0.3], fF: [9, 0], fB: [-9, 0], lF: null, lB: null, jaw: 0, piv: 0 };
  function P(o) { const p = Object.assign({}, BASE, o); return p; }
  function legIK(d, hip, foot) {
    const T = d.thigh, S = d.shin;
    let dx = foot[0] - hip[0], dy = foot[1] - hip[1];
    let dist = Math.hypot(dx, dy);
    dist = Math.max(Math.abs(T - S) + 0.5, Math.min((T + S) * 0.999, dist));
    const base = Math.atan2(dx, dy);
    const al = Math.acos(Math.max(-1, Math.min(1, (T * T + dist * dist - S * S) / (2 * T * dist))));
    const th = base + al;
    const knee = add(hip, dir(th, T));
    const shA = Math.atan2(hip[0] + Math.sin(base) * dist - knee[0], hip[1] + Math.cos(base) * dist - knee[1]);
    return [th, th - shA];
  }
  function hipOf(d, p) { const L = d.thigh + d.shin; return [p.hx * d.k, -L * 0.96 + p.hy * d.k + (p.hyL || 0) * L + (p.hyA || 0)]; }
  // converts foot targets into leg angles so poses can be blended
  function resolve(d, p) {
    const q = Object.assign({}, p);
    const hip = hipOf(d, p);
    if (!q.lF) q.lF = legIK(d, hip, [p.fF[0] * d.k, p.fF[1]]);
    if (!q.lB) q.lB = legIK(d, hip, [p.fB[0] * d.k, p.fB[1]]);
    return q;
  }
  function lerp(d, a, b, t) {
    a = resolve(d, a); b = resolve(d, b);
    const o = {};
    for (const k in a) {
      const va = a[k], vb = b[k] != null ? b[k] : va;
      if (Array.isArray(va)) o[k] = va.map((v, i) => v + (vb[i] - v) * t);
      else if (typeof va === 'number') o[k] = va + (vb - va) * t;
      else o[k] = t < 0.5 ? va : vb;
    }
    for (const k in b) if (o[k] == null) o[k] = b[k];
    return o;
  }
  // keyframe track: [[time, pose], ...] with smoothstep easing
  function track(d, keys, t) {
    if (t <= keys[0][0]) return resolve(d, keys[0][1]);
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return lerp(d, keys[i - 1][1], keys[i][1], u * u * (3 - 2 * u));
      }
    }
    return resolve(d, keys[keys.length - 1][1]);
  }

  function solve(d, p) {
    p = resolve(d, p);
    const hip = hipOf(d, p);
    const up = PI - p.lean;
    const sh = add(hip, dir(up, d.torso));
    const nk = add(sh, dir(up - p.head * 0.4, d.neck));
    const legs = L => {
      const h = hip;
      const knee = add(h, dir(L[0], d.thigh));
      const sa = L[0] - L[1];
      const ank = add(knee, dir(sa, d.shin));
      return { h, knee, ank, sa };
    };
    const arms = (A, off) => {
      const s0 = add(sh, dir(up + PI / 2, off));
      const a1 = A[0] + p.lean, a2 = A[0] + A[1] + p.lean;
      const el = add(s0, dir(a1, d.upper));
      const wr = add(el, dir(a2, d.fore));
      return { s0, el, wr, a2 };
    };
    return { p, hip, sh, nk, up, LF: legs(p.lF), LB: legs(p.lB), AF: arms(p.aF, d.shOff), AB: arms(p.aB, -d.shOff) };
  }

  // ---------- drawing ----------
  function drawLeg(g, d, def, L, dark, o) {
    const c = def.col, k = dark ? -0.28 : 0;
    const lu = shade(c.legU, k), ll = shade(c.legL || c.legU, k), ft = shade(c.foot, k);
    if (!o.cutAnkles) {
      // foot
      const fa = L.sa + PI / 2;
      const toe = add(L.ank, dir(fa, d.footL * 0.75));
      cap(g, add(L.ank, dir(fa, -d.footL * 0.2)), toe, d.footH * 0.8, d.footH * 0.6, ft);
      if (def.webbed) { poly(g, [L.ank, add(toe, dir(fa - 0.5, 4)), add(toe, dir(fa + 0.5, 4))], ft); }
    }
    cap(g, L.knee, o.cutAnkles ? lerp2(L.knee, L.ank, 0.88) : L.ank, d.kneeR, d.ankleR, ll);
    if (o.cutAnkles) { ball(g, ...lerp2(L.knee, L.ank, 0.88), d.ankleR * 0.9, '#8a0010'); }
    cap(g, L.h, L.knee, d.thighR, d.kneeR, lu);
    if (def.sock && !o.cutAnkles) cap(g, lerp2(L.knee, L.ank, 0.45), L.ank, d.ankleR * 1.15, d.ankleR * 1.05, shade(def.sock, k));
  }
  function drawArm(g, d, def, A, dark, st) {
    const c = def.col, k = dark ? -0.28 : 0;
    if (def.wings) { def.wing(g, A, dark, d, st); return; }
    cap(g, A.el, A.wr, d.elbowR, d.wristR, shade(c.armL || c.armU, k));
    cap(g, A.s0, A.el, d.shR, d.elbowR, shade(c.armU, k));
    if (c.cuff) cap(g, lerp2(A.el, A.wr, 0.78), A.wr, d.wristR * 1.15, d.wristR * 1.15, shade(c.cuff, k));
    const hp = add(A.wr, dir(A.a2, d.fist * 0.6));
    ball(g, hp[0], hp[1], d.fist, shade(c.hand, k));
    if (def.claws && st.claws) {
      for (let i = -1; i <= 1; i++) {
        const b = add(hp, dir(A.a2 + i * 0.35, d.fist * 0.8));
        line(g, b[0], b[1], ...add(b, dir(A.a2 + i * 0.25, 4.5)), '#f4f0e6', 1.2);
      }
    }
  }
  function torsoPath(g, d, hip, sh, bellyK) {
    const ux = sh[0] - hip[0], uy = sh[1] - hip[1], L = Math.hypot(ux, uy) || 1, u = [ux / L, uy / L], n = [-u[1], u[0]];
    const at = (t, s) => [hip[0] + ux * t + n[0] * s, hip[1] + uy * t + n[1] * s];
    const bel = d.belly * (bellyK || 1);
    g.beginPath();
    const a = at(0, d.hipW), b = at(0.45, bel), c = at(1, d.shW), e = at(1, -d.shW), f = at(0.5, -d.back), h = at(0, -d.hipW);
    g.moveTo(...at(-0.08, 0));
    g.quadraticCurveTo(...at(-0.08, d.hipW), ...a);
    g.quadraticCurveTo(...b, ...lerp2(b, c, 0.5));
    g.quadraticCurveTo(...at(1.05, d.shW), ...at(1.12, 0));
    g.quadraticCurveTo(...at(1.05, -d.shW), ...e);
    g.quadraticCurveTo(...f, ...h);
    g.quadraticCurveTo(...at(-0.08, -d.hipW), ...at(-0.08, 0));
    g.closePath();
    return { u, n, L };
  }
  function drawTorso(g, d, def, J, st) {
    const fr = torsoPath(g, d, J.hip, J.sh, st.belly);
    if (st.flush) g.filter = 'none';
    const m = lerp2(J.hip, J.sh, 0.5), r = Math.max(d.belly, d.shW) * 1.3;
    const gr = g.createLinearGradient(m[0] + fr.n[0] * r * 0.8 - fr.u[0] * 8, m[1] + fr.n[1] * r * 0.8 - fr.u[1] * 8, m[0] - fr.n[0] * r, m[1] - fr.n[1] * r);
    const c = def.col.torso;
    gr.addColorStop(0, shade(c, 0.3)); gr.addColorStop(0.35, c); gr.addColorStop(0.85, shade(c, -0.45)); gr.addColorStop(1, shade(c, -0.7));
    if (def.glass) g.globalAlpha = 0.85;
    g.fillStyle = gr; g.fill();
    g.globalAlpha = 1;
    if (def.torsoDetail) {
      g.save();
      g.translate(J.hip[0], J.hip[1]);
      g.rotate(Math.atan2(fr.u[0], -fr.u[1]));
      def.torsoDetail(g, d, st, fr.L);
      g.restore();
    }
  }

  // f: { def, x, y, face, d (scaled dims) }  o: render options
  function draw(g, f, p, o = {}) {
    const def = f.def, d = f.d;
    const J = solve(d, p);
    const st = Object.assign({ t: f.t || 0 }, f.st || {}, o);
    g.save();
    g.translate(f.x, f.y);
    if (o.scale) g.scale(o.scale, o.scale);
    g.scale(f.face, 1);
    if (J.p.rot) {
      const pv = J.p.piv ? [0, 0] : J.hip;
      g.translate(pv[0], pv[1]); g.rotate(J.p.rot); g.translate(-pv[0], -pv[1]);
    }
    if (o.tint) g.filter = o.tint;
    if (o.skeleton) { drawSkeleton(g, d, J, def, o); g.restore(); return J; }
    if (def.behind) def.behind(g, d, J, st);
    drawArm(g, d, def, J.AB, true, st);
    if (def.backHand) def.backHand(g, d, J, st);
    drawLeg(g, d, def, J.LB, true, o);
    if (def.tail) def.tail(g, d, J, st);
    drawTorso(g, d, def, J, st);
    drawLeg(g, d, def, J.LF, false, o);
    if (def.neckDraw) def.neckDraw(g, d, J, st);
    if (!o.noHead && !o.noHeadDraw) drawHeadAt(g, f, J.nk[0], J.nk[1], J.p.lean + J.p.head * 0.5, o.headScale || 1, Object.assign({}, st, { jaw: J.p.jaw }));
    if (o.noHead) { ball(g, J.nk[0], J.nk[1], d.shW * 0.42, '#7a0010'); ball(g, J.nk[0] + 1, J.nk[1] - 1, d.shW * 0.18, '#e8e0d0'); }
    drawArm(g, d, def, J.AF, false, st);
    if (def.frontHand) def.frontHand(g, d, J, st);
    g.restore();
    return J;
  }
  function drawHeadAt(g, f, x, y, rot, sc, st) {
    g.save();
    g.translate(x, y); g.rotate(rot); g.scale(sc * f.d.k, sc * f.d.k);
    f.def.head(g, st || {}, f.def);
    g.restore();
  }
  // world position of a joint (for attaching effects)
  function jointWorld(f, p, name) {
    const J = solve(f.d, p);
    let pt = name === 'head' ? add(J.nk, dir(PI - J.p.lean, 9 * f.d.k)) : name === 'handF' ? J.AF.wr : name === 'handB' ? J.AB.wr :
      name === 'neck' ? J.nk : name === 'hip' ? J.hip : name === 'chest' ? lerp2(J.hip, J.sh, 0.7) : name === 'footF' ? J.LF.ank : name === 'footB' ? J.LB.ank : J.hip;
    if (J.p.rot) {
      const pv = J.p.piv ? [0, 0] : J.hip, c = Math.cos(J.p.rot), s = Math.sin(J.p.rot);
      const dx = pt[0] - pv[0], dy = pt[1] - pv[1];
      pt = [pv[0] + dx * c - dy * s, pv[1] + dx * s + dy * c];
    }
    return [f.x + pt[0] * f.face, f.y + pt[1]];
  }

  // ---------- skeleton ----------
  const BONE = '#ece4cc', BONED = '#a89c80';
  function bone(g, A, B, w) {
    line(g, A[0], A[1], B[0], B[1], BONED, w + 1.4);
    line(g, A[0], A[1], B[0], B[1], BONE, w);
    ball(g, A[0], A[1], w * 0.95, BONE); ball(g, B[0], B[1], w * 0.95, BONE);
  }
  function skull(g, x, y, r, rot) {
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    ball(g, 0, -r * 0.2, r, BONE);
    oval(g, r * 0.35, r * 0.45, r * 0.55, r * 0.4, BONE, 0, false);
    g.fillStyle = '#1a1010';
    g.beginPath(); g.ellipse(r * 0.42, -r * 0.2, r * 0.26, r * 0.3, 0, 0, PI * 2); g.fill();
    g.beginPath(); g.moveTo(r * 0.75, r * 0.1); g.lineTo(r * 0.9, r * 0.32); g.lineTo(r * 0.66, r * 0.3); g.fill();
    for (let i = 0; i < 4; i++) g.fillRect(r * 0.05 + i * r * 0.2, r * 0.62, r * 0.08, r * 0.22);
    g.restore();
  }
  function drawSkeleton(g, d, J, def, o) {
    const w = Math.max(1.6, d.k * 2.2);
    const limb = (A, B, C) => { bone(g, A, B, w); bone(g, B, C, w * 0.85); };
    limb(J.AB.s0, J.AB.el, J.AB.wr); limb(J.LB.h, J.LB.knee, J.LB.ank);
    // spine + ribs
    for (let i = 0; i <= 8; i++) { const p = lerp2(J.hip, J.nk, i / 8); ball(g, p[0], p[1], w * 1.05, i % 2 ? BONED : BONE); }
    for (let i = 0; i < 5; i++) {
      const p = lerp2(J.hip, J.sh, 0.45 + i * 0.12), r = d.shW * (0.75 + Math.sin(i * 0.7) * 0.2);
      g.beginPath(); g.ellipse(p[0] + r * 0.35, p[1], r * 0.8, 2.2, 0, 0, PI * 2); g.strokeStyle = BONE; g.lineWidth = w * 0.7; g.stroke();
    }
    oval(g, J.hip[0], J.hip[1] + 2, d.hipW * 0.9, 5 * d.k, BONE);
    limb(J.LF.h, J.LF.knee, J.LF.ank); limb(J.AF.s0, J.AF.el, J.AF.wr);
    if (!o.noHead) skull(g, J.nk[0] + 2 * d.k, J.nk[1] - 8 * d.k, 8.5 * d.k, J.p.lean);
    if (o.gore) {
      for (let i = 0; i < 7; i++) { const p = lerp2(J.hip, J.sh, (i * 0.37) % 1); g.fillStyle = i % 2 ? '#8a0010' : '#b0101a'; g.fillRect(p[0] - 3 + (i * 5) % 7, p[1], 3, 2 + i % 3); }
    }
  }

  return { P, track, lerp, resolve, solve, draw, drawHeadAt, jointWorld, shade, ball, oval, poly, line, cap, capPath, sphFill, bone, skull, BONE, PI, dir, add, lerp2 };
})();
