// Muncie Kombat: engine, combat, AI, screens, HUD and touch controls
'use strict';
(() => {
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const H = 240;
  let W = 480;
  const AW = STAGES.AW, FLOOR = STAGES.FLOOR, GRAV = 2300;
  const R = RIG, P = RIG.P, PI = Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  FX.setFloor(FLOOR);
  const AUTO = /auto/.test(location.search);

  // ---------- poses ----------
  const STANCE = P({ hy: 3, lean: 0.12, aF: [0.9, 1.75], aB: [0.55, 1.95], fF: [13, 0], fB: [-13, 0] });
  const PS = {
    stance: t => P({ hy: 3 + Math.sin(t * 3) * 1.2, lean: 0.12, aF: [0.9, 1.75], aB: [0.55, 1.95], fF: [13, 0], fB: [-13, 0] }),
    walk: ph => P({ hy: 3 - Math.abs(Math.sin(ph)) * 1.5, lean: 0.14, aF: [0.9 + Math.sin(ph) * 0.12, 1.75], aB: [0.55 - Math.sin(ph) * 0.12, 1.95],
      fF: [13 + Math.sin(ph) * 7, -Math.max(0, Math.cos(ph)) * 5], fB: [-13 - Math.sin(ph) * 7, -Math.max(0, -Math.cos(ph)) * 5] }),
    run: ph => P({ hy: 1 - Math.abs(Math.sin(ph)) * 3, lean: 0.35, aF: [0.9 - Math.sin(ph) * 0.8, 1.6], aB: [0.9 + Math.sin(ph) * 0.8, 1.6],
      fF: [8 + Math.sin(ph) * 16, -Math.max(0, Math.cos(ph)) * 10], fB: [8 - Math.sin(ph) * 16, -Math.max(0, -Math.cos(ph)) * 10] }),
    crouch: P({ hyL: 0.4, lean: 0.3, aF: [1.0, 1.7], aB: [0.7, 1.9], fF: [15, 0], fB: [-13, 0] }),
    block: P({ hy: 4, lean: 0.0, head: -0.2, aF: [1.25, 2.3], aB: [1.15, 2.45], fF: [12, 0], fB: [-14, 0] }),
    cblock: P({ hyL: 0.4, lean: 0.2, aF: [1.35, 2.3], aB: [1.25, 2.4], fF: [15, 0], fB: [-13, 0] }),
    jump: P({ hy: -2, lean: 0.1, aF: [1.2, 1.6], aB: [0.9, 1.8], lF: [1.5, 2.4], lB: [0.9, 2.3] }),
    jab: P({ hy: 4, lean: 0.38, head: 0.1, aF: [1.64, 0.0], aB: [0.45, 2.2], fF: [20, 0], fB: [-13, 0] }),
    jab2: P({ hy: 4, lean: 0.48, head: 0.1, aF: [0.8, 2.0], aB: [1.64, 0.0], fF: [20, 0], fB: [-12, 0] }),
    up0: P({ hyL: 0.44, lean: 0.5, aF: [0.15, 0.5], aB: [0.9, 1.9], fF: [16, 0], fB: [-12, 0] }),
    up1: P({ hy: -7, lean: -0.15, head: -0.2, aF: [2.7, 0.02], aB: [0.4, 1.7], fF: [10, -5], fB: [-13, 0] }),
    up2: P({ hy: -5, lean: -0.25, head: -0.3, aF: [3.1, 0.02], aB: [0.4, 1.7], fF: [9, -3], fB: [-13, 0] }),
    kick0: P({ hy: 1, lean: -0.35, aF: [0.55, 2.3], aB: [0.35, 2.4], lF: [1.8, 2.6], fB: [-5, 0] }),
    kick1: P({ hy: 0, lean: -0.7, head: 0.3, aF: [0.55, 2.35], aB: [0.3, 2.4], lF: [2.12, 0.0], fB: [-3, 0] }),
    sw0: P({ hyL: 0.5, lean: 0.55, aF: [0.1, 0.1], aB: [-0.1, 0.2], fF: [10, 0], fB: [-12, 0] }),
    sw1: P({ hyL: 0.55, lean: 0.6, aF: [0.1, 0.05], aB: [-0.05, 0.15], lF: [1.5, 0.0], fB: [-10, 0] }),
    round: P({ hy: -2, lean: -0.95, head: 0.4, aF: [1.1, 1.4], aB: [0.7, 1.5], lF: [2.55, 0.0], fB: [-2, 0] }),
    jkick: P({ hy: -2, lean: -0.5, head: 0.3, aF: [0.8, 2.2], aB: [0.6, 2.3], lF: [1.9, 0.0], lB: [0.6, 2.4] }),
    jpunch: P({ hy: -2, lean: 0.35, aF: [1.25, 0.0], aB: [0.8, 1.9], lF: [1.3, 2.3], lB: [0.7, 2.2] }),
    grab: P({ hy: 4, lean: 0.35, aF: [1.6, 0.4], aB: [1.5, 0.5], fF: [16, 0], fB: [-12, 0] }),
    toss: P({ hy: 4, lean: -0.4, aF: [2.9, 0.2], aB: [2.6, 0.3], fF: [8, 0], fB: [-16, 0] }),
    proj0: P({ hy: 4, lean: -0.1, aF: [0.4, 1.2], aB: [0.3, 1.3], fF: [12, 0], fB: [-14, 0] }),
    proj1: P({ hy: 4, lean: 0.35, aF: [1.62, 0.05], aB: [1.5, 0.1], fF: [18, 0], fB: [-14, 0] }),
    hitHigh: P({ hy: 5, lean: -0.6, head: -0.9, aF: [0.7, 0.4], aB: [0.2, 0.6], fF: [10, 0], fB: [-17, 0] }),
    hitLow: P({ hy: 10, lean: 0.8, head: 0.6, aF: [0.9, 0.5], aB: [0.6, 0.7], fF: [12, 0], fB: [-12, 0] }),
    rush: ph => P({ hy: 6, lean: 0.75, head: 0.6, aF: [0.5, 0.4], aB: [0.3, 0.5], fF: [10 + Math.sin(ph) * 14, -Math.max(0, Math.cos(ph)) * 8], fB: [10 - Math.sin(ph) * 14, -Math.max(0, -Math.cos(ph)) * 8] }),
    slide: P({ hyL: 0.72, lean: -0.95, aF: [0.9, 0.3], aB: [0.6, 0.3], lF: [1.55, 0.05], lB: [1.1, 1.4] }),
    dive: P({ lean: 0.6, aF: [1.2, 2.5], aB: [1.6, 0.2], lF: [1.0, 1.6], lB: [0.6, 1.8] }),
    tuck: P({ lean: 0.9, aF: [1.5, 2.4], aB: [1.3, 2.4], lF: [1.7, 2.6], lB: [1.5, 2.6] }),
    win: t => P({ hy: 2 + Math.sin(t * 6) * 1.5, lean: -0.1, aF: [3.0 + Math.sin(t * 6) * 0.1, 0.1], aB: [0.6, 1.9], fF: [11, 0], fB: [-11, 0] }),
    dizzy: t => P({ hy: 6, lean: -0.05 + Math.sin(t * 2.2) * 0.16, head: Math.sin(t * 2.7) * 0.6, aF: [0.15, 0.25], aB: [0.12, 0.3], fF: [9 + Math.sin(t * 2.2) * 3, 0], fB: [-9, 0] }),
    air: (rot, t = 0) => P({ lean: -0.25, head: -0.4, aF: [2.4 + Math.sin(t * 17) * 0.5, 0.4], aB: [1.9 + Math.cos(t * 15) * 0.5, 0.6], lF: [0.9 + Math.sin(t * 13) * 0.3, 0.6], lB: [0.2, 0.4], rot, piv: 2 }),
  };
  PS.down = f => { const L = f.d.thigh + f.d.shin; return P({ rot: -PI / 2, hyA: L * 0.96 - f.d.back * 0.75, aF: [0.9, 0.4], aB: [0.6, 0.3], lF: [0.15, 0.1], lB: [-0.05, 0.15], head: 0.2 }); };
  PS.downFace = f => { const L = f.d.thigh + f.d.shin; return P({ rot: PI / 2, hyA: L * 0.96 - f.d.belly * 0.75, aF: [2.6, 0.2], aB: [2.4, 0.3], lF: [0.1, 0.4], lB: [-0.1, 0.5], head: -0.3 }); };
  const K = (...a) => a;

  // ---------- moves ----------
  // t: [startup, active, recovery]; box: [x0, x1, y0, y1] px ahead of / above the root (scaled by size)
  const MV = {
    jab: { t: [0.045, 0.06, 0.1], dmg: 5, limb: 'handFx', rad: 5, lunge: 110, fx: 'stun', stun: 0.24, push: 170, snd: 'punch', keys: K([0, STANCE], [0.045, PS.jab], [0.105, PS.jab], [0.2, STANCE]) },
    jab2: { t: [0.045, 0.06, 0.1], dmg: 5, limb: 'handBx', rad: 5, lunge: 110, fx: 'stun', stun: 0.24, push: 170, snd: 'punch', keys: K([0, STANCE], [0.045, PS.jab2], [0.105, PS.jab2], [0.2, STANCE]) },
    upper: { t: [0.08, 0.1, 0.3], dmg: 14, limb: 'handFx', rad: 10, lunge: 150, fx: 'launch', vy: -800, vx: 190, spin: 18, snd: 'big', upper: 1, keys: K([0, PS.crouch], [0.06, PS.up0], [0.12, PS.up1], [0.2, PS.up2], [0.48, STANCE]) },
    kick: { t: [0.08, 0.07, 0.16], dmg: 8, limb: 'toeF', rad: 6, lunge: 90, fx: 'stun', stun: 0.3, push: 230, snd: 'kick', keys: K([0, STANCE], [0.05, PS.kick0], [0.09, PS.kick1], [0.16, PS.kick1], [0.31, STANCE]) },
    sweep: { t: [0.09, 0.09, 0.24], dmg: 7, limb: 'toeF', rad: 7, lunge: 60, fx: 'trip', low: 1, snd: 'kick', crouchEnd: 1, keys: K([0, PS.crouch], [0.06, PS.sw0], [0.11, PS.sw1], [0.19, PS.sw1], [0.42, PS.crouch]) },
    round: { t: [0.13, 0.09, 0.26], dmg: 11, limb: 'toeF', rad: 7, lunge: 70, fx: 'knock', vy: -480, vx: 280, spin: 7, snd: 'kick', keys: K([0, STANCE], [0.08, PS.kick0], [0.15, PS.round], [0.23, PS.round], [0.48, STANCE]) },
    jkick: { air: 1, t: [0.04, 0.6, 0], dmg: 10, limb: 'toeF', rad: 7, fx: 'knock', vy: -380, vx: 260, spin: 6, snd: 'kick', pose: PS.jkick },
    jpunch: { air: 1, t: [0.04, 0.4, 0], dmg: 8, limb: 'handFx', rad: 6, fx: 'stun', stun: 0.3, push: 140, snd: 'punch', pose: PS.jpunch },
    grab: { t: [0.07, 0.04, 0.26], grab: 1, keys: K([0, STANCE], [0.08, PS.grab], [0.2, PS.toss], [0.42, STANCE]) },
    proj: { t: [0.2, 0.02, 0.24], spawn: 1, keys: K([0, STANCE], [0.13, PS.proj0], [0.2, PS.proj1], [0.36, PS.proj1], [0.46, STANCE]) },
  };
  const SP2 = {
    rush: { t: [0.1, 0.43, 0.2], dmg: 12, box: [0, 38, 20, 96], fx: 'knock', vy: -460, vx: 320, spin: 7, speed: 330, snd: 'big' },
    roll: { t: [0.1, 0.45, 0.2], dmg: 11, box: [-10, 30, 0, 44], fx: 'knock', vy: -500, vx: 260, spin: 10, speed: 340, snd: 'big' },
    slide: { t: [0.1, 0.4, 0.25], dmg: 9, box: [0, 54, 0, 24], fx: 'trip', low: 1, speed: 360, snd: 'kick' },
    leap: { t: [0.08, 0.9, 0.16], dmg: 13, box: [-6, 40, 0, 70], fx: 'knock', vy: -420, vx: 280, spin: 7, snd: 'big' },
    cloud: { t: [0.2, 0.3, 0.3], dmg: 5, box: [14, 74, 36, 104], fx: 'daze', snd: 'splat' },
    burrow: { t: [0.6, 0.2, 0.3], dmg: 12, box: [-16, 32, 0, 120], fx: 'launch', vy: -850, vx: 140, spin: 14, snd: 'big' },
  };

  // ---------- state ----------
  let screen = 'title', paused = false;
  const game = { phase: 'intro', pt: 0, round: 1, timer: 99, time: 0, freeze: 0, shake: 0, flash: 0, banners: [], bubbles: [], toasty: 0, scene: null, script: null };
  const ladder = { pick: 0, opps: [], rung: 0, stages: [] };
  let p1 = null, p2 = null, projs = [], stage = null, cam = 0;
  const sel = { i: 0 };
  let ui = [];

  function hurtH(f) { return (f.d.thigh + f.d.shin) * 0.96 + f.d.torso + f.d.neck + 16 * f.d.k; }
  function halfW(f) { return Math.max(f.d.belly, f.d.back, f.d.hipW) * 0.85; }
  function newFighter(def, side) {
    return { def, d: def.dk, side, x: 0, y: FLOOR, vx: 0, vy: 0, face: 1, hp: 100, state: 'idle', st: 0, t: 0, wins: 0, move: null, mt: 0, hitDone: false,
      pose: R.resolve(def.dk, STANCE), target: STANCE, ro: {}, st2: {}, juggle: 0, airAtk: null, spin: 0, wph: 0, hist: [], tok: 'N', bufP: -9, bufK: -9,
      cpu: side ? { t: 0.5, walk: 0, lvl: 0.3, blockT: 0, fatalT: 0 } : null, dmgTaken: 0, dead: false, finishing: false, sink: 0, hidden: false, jabAlt: 0, projOut: 0 };
  }

  // ---------- combat helpers ----------
  const grounded = f => f.y >= FLOOR - 0.5 && !['jump', 'air'].includes(f.state) && !(f.state === 'attack' && f.move && f.move.airborne);
  const actionable = f => ['idle', 'walk', 'crouch', 'block', 'cblock'].includes(f.state);
  const invuln = f => (f.finishing && game.phase === 'finishwait') || ['down', 'getup'].includes(f.state) || f.hidden || f.state === 'held' || (f.state === 'attack' && f.move && f.move.kind === 'burrow' && f.mt < 0.6);
  function hurtbox(f) {
    const hh = hurtH(f), hw = halfW(f);
    let top = hh;
    if (f.state === 'crouch' || f.state === 'cblock' || (f.state === 'attack' && f.move && (f.move === MV.sweep || f.move.kind === 'roll' || f.move.kind === 'slide'))) top = hh * 0.62;
    if (f.state === 'air') return { x0: f.x - hw * 1.3, x1: f.x + hw * 1.3, y0: f.y - hh * 0.75, y1: f.y + 4 };
    return { x0: f.x - hw, x1: f.x + hw, y0: f.y - top, y1: f.y };
  }
  function atkbox(f, b) {
    const k = f.d.k;
    const xa = f.x + b[0] * k * f.face, xb = f.x + b[1] * k * f.face;
    return { x0: Math.min(xa, xb), x1: Math.max(xa, xb), y0: f.y - b[3] * k, y1: f.y - b[2] * k };
  }
  const overlap = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  function bleed(v, x, y, n, dir, power) {
    if (v.def.id === 'golem') { for (let i = 0; i < n / 2; i++) FX.gib('shard', x, y, rnd(-120, 120) + dir * 80, rnd(-260, -60)); FX.puff(x, y, 'rgba(120,170,60,0.7)', n / 2, 2); return; }
    FX.blood(x, y, n, dir, power);
    if (v.def.id === 'gertie') for (let i = 0; i < 3; i++) FX.gib('feather', x, y, rnd(-60, 60), rnd(-160, -40), { grav: 120, vr: rnd(-4, 4) });
  }

  // extra gore on every connecting hit: wounds that stay on the body, teeth, chunks
  function gore(v, x, y, dir, dmg, mv) {
    if (v.def.id === 'golem') return;
    const hh = hurtH(v), rel = (v.y - y) / hh;
    const j = rel > 0.8 ? 'head' : rel > 0.55 ? 'chest' : rel > 0.35 ? 'belly' : 'leg';
    const w = v.st2.wounds || (v.st2.wounds = []);
    if (w.length < 18) w.push({ j: j === 'leg' ? 'knee' : j, dx: rnd(-4, 8), dy: rnd(-5, 5), r: rnd(1.4, 2.6) + dmg * 0.08, a: rnd(0, 3), drip: rnd(2, 7) });
    if (j === 'head' && Math.random() < 0.5) for (let i = 0; i < 1 + (dmg > 9 ? 2 : 0); i++) FX.gib('tooth', x, y, dir * rnd(60, 200), rnd(-260, -120));
    if (dmg >= 9) { for (let i = 0; i < (mv.upper ? 4 : 2); i++) FX.gib('chunk', x, y, dir * rnd(40, 220), rnd(-360, -120)); }
    if (mv.upper || dmg >= 12) FX.blood(x, y, 30, dir, 2.2, 0.6);
    if (Math.random() < 0.08 * dmg / 5) FX.drops(1 + (mv.upper ? 2 : 0));
  }
  function startMove(f, mv) {
    f.state = 'attack'; f.move = mv; f.mt = 0; f.hitDone = false; f.claws = 0; f.snapPose = true;
    if (!mv.spawn && !mv.grab) SFX.whoosh();
  }
  function startSP2(f) {
    const kind = f.def.sp2.kind, mv = Object.assign({ kind, name: f.def.sp2.name }, SP2[kind]);
    if (f.def.id === 'golem') { mv.dmg = 14; mv.quake = 1; }
    if (f.def.id === 'dan') mv.fire = 1;
    startMove(f, mv);
    if (kind === 'cloud') SFX.splat();
  }
  function doJump(f, dirx) {
    f.state = 'jump'; f.vy = -660; f.vx = dirx * 165 * f.def.stats.speed; f.airAtk = null; f.at = 0; SFX.whoosh();
  }

  function applyHit(a, v, mv, blocked, cx, cy, proj) {
    const dir = proj ? Math.sign(proj.vx) : a.face;
    const power = a.def.stats.power * (v.def.stats.armor || 1);
    if (blocked) {
      const chip = (mv.chip ? mv.dmg * 0.2 : 0) * power;
      damage(v, chip, a);
      v.bvx = dir * 140; v.bst = 0.14; SFX.block(); FX.spark(cx, cy);
      return;
    }
    let dmg = mv.dmg * power;
    if (v.state === 'air') dmg *= Math.pow(0.75, v.juggle);
    if (v.state === 'dizzy' && game.phase === 'finish') { finishBlow(a, v, mv); return; }
    damage(v, dmg, a);
    SFX[mv.snd || 'punch']();
    bleed(v, cx, cy, Math.round(dmg * 5), dir, mv.upper ? 1.9 : 1.2);
    gore(v, cx, cy, dir, dmg, mv);
    game.freeze = mv.upper ? 0.11 : dmg >= 10 ? 0.08 : 0.055;
    if (mv.upper) { game.shake = 5; if (Math.random() < 0.14 && !game.toasty) { game.toasty = 1.4; SFX.squeak(); } }
    const heavy = v.def.stats.armor && (mv.fx === 'stun') && v.hp > 0;
    let fx = mv.fx;
    if (heavy) { v.flashT = 0.1; return; }
    if (v.state === 'air' || v.state === 'jump' || (v.state === 'attack' && v.move && v.move.airborne)) fx = fx === 'trip' ? 'trip' : fx === 'daze' ? 'knock' : (fx === 'stun' ? 'knock' : fx);
    const wt = v.def.stats.weight;
    if (fx === 'stun') { v.state = 'hit'; v.snapPose = true; v.st = 0; v.stunT = mv.stun; v.vx = dir * mv.push / wt; v.low = !!mv.low; v.move = null; }
    else if (fx === 'daze') { v.state = 'hit'; v.st = 0; v.vx = 0; v.daze = true; v.move = null; }
    else if (fx === 'launch' || fx === 'knock') { launch(v, dir * (mv.vx != null ? mv.vx : 160) / wt, (mv.vy != null ? mv.vy : -380) / Math.sqrt(wt) * Math.pow(0.82, v.juggle), mv.spin || 6); }
    else if (fx === 'trip') { launch(v, dir * 70, -330, 9); }
    if (v.hp <= 0 && !v.finishing && game.phase !== 'fight' && game.phase !== 'finishwait') v.dead = true;
  }
  function launch(v, vx, vy, spin = 7) {
    v.state = 'air'; v.st = 0; v.vx = vx; v.vy = vy; v.juggle++; v.move = null; v.spinRate = spin * (0.9 + Math.random() * 0.2); v.hidden = false; v.sink = 0; v.bounced = false;
    if (v.y >= FLOOR - 0.5) v.y = FLOOR - 1;
  }
  function damage(v, amt, a) {
    if (amt <= 0) return;
    v.hp = Math.max(0, v.hp - amt); v.dmgTaken += amt;
    if (v.hp <= 0 && game.phase === 'fight') ko(v, a);
  }

  // ---------- round flow ----------
  function banner(str, o = {}) { game.banners.push(Object.assign({ str, t: 0, life: 1.6, size: 34, fill: 'gold', y: 78 }, o)); }
  function say(str) { SFX.say(str); }
  function ko(v, a) {
    a.wins++;
    game.loser = v; game.winner = a;
    const decided = a.wins >= 2;
    if (decided && !v.def.boss) { game.phase = 'finishwait'; game.pt = 0; v.finishing = true; return; }
    if (decided && v.def.boss) { game.phase = 'finishwait'; game.pt = 0; v.finishing = true; v.bossDie = true; return; }
    v.dead = true;
    if (v.state === 'hit' || actionable(v) || v.state === 'attack') launch(v, a.face * 140, -260);
    game.phase = 'roundend'; game.pt = 0;
    winText(a);
  }
  function winText(a) {
    const flawless = a.dmgTaken <= 0;
    setTimeout(() => { banner(a.def.name + ' WINS', { size: 28, fill: 'gold', life: 2.4 }); say(a.def.name.replace("'", 'g').toLowerCase() + ' wins'); }, 700);
    if (flawless) setTimeout(() => { banner('FLAWLESS VICTORY', { size: 26, fill: 'fire', y: 112, life: 2 }); say('flawless victory'); }, 2000);
  }
  function finishBlow(a, v, mv) {
    // stage fatality: uppercut off the trestle
    if (stage.pit && mv.upper) { startFatality(a, v, 'bridge'); return; }
    v.dead = true; v.finishing = false;
    SFX[mv.snd || 'punch'](); bleed(v, v.x, v.y - hurtH(v) * 0.7, 30, a.face, 1.4);
    launch(v, a.face * 200, -320);
    game.phase = 'matchend'; game.pt = 0;
    winText(a);
  }
  function startFatality(a, v, id) {
    game.phase = 'fatality'; game.pt = 0;
    a.state = 'script'; v.state = 'script'; a.move = null; v.move = null; v.finishing = false;
    projs = [];
    game.banners = [];
    game.script = FATAL.start(id || (a.def.fatal ? a.def.fatal.id : 'generic'), a, v, fatalAPI);
  }
  const fatalAPI = {
    FLOOR, AW, PS, R,
    get cam() { return cam; }, get W() { return W; },
    sfx: n => SFX[n] && SFX[n](), say,
    shake: m => { game.shake = Math.max(game.shake, m); },
    flash: () => { game.flash = 0.12; },
    bubble: (str, x, y, o = {}) => game.bubbles.push(Object.assign({ str, x, y, t: 0, life: 1.4, size: 12 }, o)),
    scene: fn => { game.scene = fn; },
    setCam: v => { cam = v; },
    hurtH,
  };
  function bossDeath(v) {
    game.phase = 'fatality'; game.pt = 0;
    v.state = 'script'; game.winner.state = 'win';
    game.script = FATAL.start(v.def.id === 'golem' ? 'golemDie' : 'danDie', game.winner, v, fatalAPI);
  }
  function startRound() {
    FX.reset(); projs = []; game.banners = []; game.bubbles = []; game.scene = null; game.script = null;
    for (const f of [p1, p2]) {
      Object.assign(f, { hp: 100, state: 'idle', st: 0, vx: 0, vy: 0, y: FLOOR, move: null, dead: false, finishing: false, juggle: 0, dmgTaken: 0, ro: {}, hidden: false, sink: 0, daze: false, projOut: 0, bossDie: false, scale: 1, airAtk: null });
      f.st2 = {};
    }
    p1.x = AW / 2 - 70; p2.x = AW / 2 + 70; p1.face = 1; p2.face = -1;
    cam = AW / 2 - W / 2;
    game.phase = 'intro'; game.pt = 0; game.timer = 99;
    banner('ROUND ' + game.round, { size: 34, life: 1.3, fill: 'gold' });
    say('round ' + ['one', 'two', 'three', 'four', 'five'][Math.min(4, game.round - 1)]);
  }
  function startMatch() {
    const oppDef = ladder.opps[ladder.rung];
    p1 = newFighter(ROSTER.FIGHTERS[ladder.pick], 0);
    p2 = newFighter(oppDef, 1);
    const lv = ladder.rung / Math.max(1, ladder.opps.length - 1);
    p2.cpu.lvl = oppDef.boss ? 0.55 + lv * 0.2 : 0.12 + lv * 0.5;
    stage = STAGES.get(ladder.stages[ladder.rung]);
    game.round = 1;
    screen = 'play'; paused = false;
    startRound();
  }
  function newLadder() {
    const others = ROSTER.FIGHTERS.filter((f, i) => i !== ladder.pick);
    for (let i = others.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [others[i], others[j]] = [others[j], others[i]]; }
    ladder.opps = others.concat(ROSTER.BOSSES);
    const rot = STAGES.ROTATION.slice();
    ladder.stages = others.map((f, i) => rot[i % rot.length]).concat(['glassworks', 'hell']);
    ladder.rung = 0;
  }

  // ---------- input ----------
  const keys = new Set();
  const btn = { P: false, K: false, B: false };
  const press = { P: false, K: false };
  window.addEventListener('keydown', e => {
    if (!keys.has(e.code)) { if (e.code === 'KeyJ' || e.code === 'KeyZ') press.P = true; if (e.code === 'KeyK' || e.code === 'KeyX') press.K = true; }
    keys.add(e.code);
    if ((e.code === 'KeyP' || e.code === 'Escape') && screen === 'play') { paused = !paused; menu = null; }
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if ((e.code === 'Enter' || e.code === 'Space') && screen !== 'play') uiKey();
    SFX.unlock();
  });
  window.addEventListener('keyup', e => keys.delete(e.code));

  const elControls = document.getElementById('controls');
  const elBase = document.getElementById('stickBase'), elKnob = document.getElementById('stickKnob');
  const elBtn = { P: document.getElementById('bPunch'), K: document.getElementById('bKick'), B: document.getElementById('bBlock') };
  const elPause = document.getElementById('pauseBtn');
  const touches = new Map();
  let stickId = null, stickOrigin = [0, 0], stickVec = [0, 0];
  const defaultStickPos = () => [Math.max(100, window.innerWidth * 0.13), window.innerHeight - 105];
  const placeStick = (x, y) => { elBase.style.left = x + 'px'; elBase.style.top = y + 'px'; };
  const setKnob = (dx, dy) => { elKnob.style.transform = `translate(${dx}px, ${dy}px)`; };
  function btnZone(x, y) {
    if (x < window.innerWidth * 0.5) return [];
    const list = [];
    for (const k in elBtn) { const r = elBtn[k].getBoundingClientRect(); list.push({ k, d: Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) / (r.width / 2) }); }
    list.sort((a, b) => a.d - b.d);
    if (list[0].d > 2.2) return [];
    return [list[0].k];
  }
  function moveStick(x, y) {
    let dx = x - stickOrigin[0], dy = y - stickOrigin[1];
    const L = Math.hypot(dx, dy), max = 40;
    if (L > max) { stickOrigin[0] += dx * (1 - max / L); stickOrigin[1] += dy * (1 - max / L); placeStick(stickOrigin[0], stickOrigin[1]); dx = x - stickOrigin[0]; dy = y - stickOrigin[1]; }
    const L2 = Math.hypot(dx, dy);
    setKnob(dx, dy);
    stickVec = L2 < 9 ? [0, 0] : [dx / Math.max(L2, 26), dy / Math.max(L2, 26)];
  }
  function pressStart(id, x, y) {
    SFX.unlock();
    if (screen === 'play' && !paused && game.phase !== 'fatality') {
      if (x < window.innerWidth * 0.5) { if (stickId === null) { stickId = id; stickOrigin = [x, y]; placeStick(x, y); setKnob(0, 0); stickVec = [0, 0]; } return; }
      const hits = btnZone(x, y);
      touches.set(id, { hits });
      for (const h of hits) { if (h === 'P') press.P = true; if (h === 'K') press.K = true; }
      if (hits.length) { elBtn[hits[0]].classList.add('down'); return; }
    }
    uiTap(x, y);
  }
  function pressMove(id, x, y) {
    if (id === stickId) { moveStick(x, y); return; }
    const t = touches.get(id);
    if (t) {
      const hits = btnZone(x, y);
      for (const h of hits) if (!t.hits.includes(h)) { if (h === 'P') press.P = true; if (h === 'K') press.K = true; }
      t.hits = hits;
    }
  }
  function pressEnd(id) {
    if (id === stickId) { stickId = null; stickVec = [0, 0]; setKnob(0, 0); placeStick(...defaultStickPos()); }
    touches.delete(id);
  }
  const onTouch = fn => e => { if (e.target === elPause) return; e.preventDefault(); for (const t of e.changedTouches) fn(t.identifier, t.clientX, t.clientY); };
  document.addEventListener('touchstart', onTouch(pressStart), { passive: false });
  document.addEventListener('touchmove', onTouch(pressMove), { passive: false });
  document.addEventListener('touchend', onTouch(pressEnd), { passive: false });
  document.addEventListener('touchcancel', onTouch(pressEnd), { passive: false });
  for (const ev of ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
  window.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.target !== elPause) pressStart('m', e.clientX, e.clientY); });
  window.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && e.buttons) pressMove('m', e.clientX, e.clientY); });
  window.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') pressEnd('m'); });
  const togglePause = e => { e.preventDefault(); e.stopPropagation(); if (screen === 'play') { paused = !paused; menu = null; SFX.blip(); } };
  elPause.addEventListener('touchstart', togglePause, { passive: false });
  elPause.addEventListener('mousedown', togglePause);

  function readInput() {
    btn.P = btn.K = btn.B = false;
    for (const t of touches.values()) for (const h of t.hits) btn[h] = true;
    for (const k in elBtn) elBtn[k].classList.toggle('down', btn[k]);
    let mx = stickVec[0], my = stickVec[1];
    const k = c => keys.has(c);
    if (k('ArrowLeft') || k('KeyA')) mx = -1;
    if (k('ArrowRight') || k('KeyD')) mx = 1;
    if (k('ArrowUp') || k('KeyW')) my = -1;
    if (k('ArrowDown') || k('KeyS')) my = 1;
    if (k('KeyJ') || k('KeyZ')) btn.P = true;
    if (k('KeyK') || k('KeyX')) btn.K = true;
    if (k('KeyL') || k('KeyC') || k('ShiftLeft')) btn.B = true;
    return { mx, my };
  }
  function tokenFor(f, mx, my) {
    const x = mx > 0.42 ? 1 : mx < -0.42 ? -1 : 0;
    const y = my < -0.55 ? 'U' : my > 0.5 ? 'D' : '';
    const fw = x * f.face;
    return (y + (fw > 0 ? 'F' : fw < 0 ? 'B' : '')) || 'N';
  }
  function pushTok(f, tok) {
    if (tok !== f.tok) { f.tok = tok; f.hist.push({ k: tok, t: game.time }); if (f.hist.length > 12) f.hist.shift(); }
  }
  function motion(f, seq, win = 0.75) {
    let idx = 0, need = false;
    for (const e of f.hist) {
      if (game.time - e.t > win) continue;
      const L = seq[idx];
      if (need) { if (!e.k.includes(L)) need = false; continue; }
      if (e.k.includes(L)) { idx++; if (idx === seq.length) return true; if (seq[idx] === L) need = true; }
    }
    return false;
  }

  // a fighter tries to act this frame (shared by human and CPU)
  function act(f, o, c) {
    // c: { tok, P, K, B }
    const tok = c.tok, D = tok.includes('D'), U = tok.includes('U'), F = tok.includes('F'), B = tok.includes('B');
    if (f.state === 'jump') {
      if (!f.airAtk && (c.P || c.K)) { f.airAtk = c.K ? MV.jkick : MV.jpunch; f.at = 0; f.airHit = false; SFX.whoosh(); }
      return;
    }
    if (!actionable(f)) return;
    if (c.P) {
      if (game.phase === 'finish' && game.winner === f && f.def.fatal && motion(f, ['D', 'D'])) { f.hist = []; startFatality(f, o); return; }
      if (f.projOut <= 0 && motion(f, ['B', 'F'])) { f.hist = []; startMove(f, MV.proj); return; }
      if (D) { startMove(f, MV.upper); return; }
      if (F && Math.abs(o.x - f.x) < 44 * f.d.k && grounded(o) && !invuln(o) && o.state !== 'dizzy') { startMove(f, MV.grab); return; }
      f.jabAlt = game.time - (f.lastJab || 0) < 0.5 ? 1 - f.jabAlt : 0; f.lastJab = game.time;
      startMove(f, f.jabAlt ? MV.jab2 : MV.jab); return;
    }
    if (c.K) {
      if (motion(f, ['D', 'F'])) { f.hist = []; startSP2(f); return; }
      if (D) { startMove(f, MV.sweep); return; }
      if (B) { startMove(f, MV.round); return; }
      startMove(f, MV.kick); return;
    }
    if (c.B) { f.state = D ? 'cblock' : 'block'; return; }
    if (U) { doJump(f, F ? f.face : B ? -f.face : 0); return; }
    if (D) { f.state = 'crouch'; return; }
    if (F || B) { f.state = 'walk'; f.wdir = F ? 1 : -1; return; }
    f.state = 'idle';
  }

  // ---------- AI ----------
  function ai(f, o, dt) {
    const c = f.cpu, lv = c.lvl;
    const out = { tok: 'N', P: false, K: false, B: false };
    const dx = o.x - f.x, dist = Math.abs(dx);
    const fwd = Math.sign(dx) * f.face >= 0 ? 'F' : 'B';
    if (game.phase === 'finish' && game.winner === f) {
      c.fatalT += dt;
      if (c.fatalT > 0.9) {
        if (c.fatalT < 1.15) c.doFatal = !!f.def.fatal;
        if (c.doFatal) { startFatality(f, o); return out; }
        if (dist > 50) out.tok = 'F'; else out.P = true;
      }
      return out;
    }
    if (game.phase !== 'fight' && game.phase !== 'finishwait') return out;
    if (f.state === 'jump') { if (!f.airAtk && dist < 80 && f.vy > -150) out.K = Math.random() < 0.7, out.P = !out.K; return out; }
    if (c.blockT > 0) { c.blockT -= dt; out.B = true; out.tok = c.blockLow ? 'D' : 'N'; return out; }
    if (!actionable(f)) return out;
    // reactive defense
    const threat = (o.state === 'attack' && o.move && dist < 110 && o.mt < (o.move.t[0] + o.move.t[1])) || projs.some(p => p.o === o && Math.abs(p.x - f.x) < 120);
    if (threat && !c.reacted) {
      c.reacted = true;
      if (Math.random() < 0.12 + lv * 0.6) {
        if (projs.some(p => p.o === o && p.kind !== 'wave') && Math.random() < 0.25 + lv * 0.3) { out.tok = 'U' + fwd; return out; }
        c.blockT = 0.28 + lv * 0.25; c.blockLow = o.move && o.move.low; out.B = true; return out;
      }
    }
    if (!threat) c.reacted = false;
    if (o.state === 'jump' && dist < 75 && Math.random() < (0.1 + lv * 0.5) * dt * 20) { out.tok = 'D'; out.P = true; return out; }
    c.t -= dt;
    if (c.walk) out.tok = c.walk > 0 ? 'F' : 'B';
    if (c.t > 0) return out;
    c.t = (0.5 - lv * 0.32) * rnd(0.6, 1.4);
    c.walk = 0;
    const r = Math.random();
    const hw = 40 * f.d.k + halfW(o);
    if (['down', 'getup', 'air'].includes(o.state)) { if (r < 0.4) c.walk = -1; else if (r < 0.55 && f.projOut <= 0 && dist > 120) { f.hist = [{ k: 'B', t: game.time }, { k: 'F', t: game.time }]; out.P = true; } return out; }
    if (dist > 170) {
      if (r < 0.28 && f.projOut <= 0) { f.hist = [{ k: 'B', t: game.time }, { k: 'F', t: game.time }]; out.P = true; }
      else if (r < 0.38) { f.hist = [{ k: 'D', t: game.time }, { k: 'F', t: game.time }]; out.K = true; }
      else if (r < 0.48) out.tok = 'UF';
      else c.walk = 1;
    } else if (dist > hw + 18) {
      if (r < 0.4) c.walk = 1;
      else if (r < 0.55) { f.hist = [{ k: 'D', t: game.time }, { k: 'F', t: game.time }]; out.K = true; }
      else if (r < 0.7) out.tok = 'UF';
      else if (r < 0.8 && f.projOut <= 0) { f.hist = [{ k: 'B', t: game.time }, { k: 'F', t: game.time }]; out.P = true; }
      else c.walk = Math.random() < 0.5 ? 1 : 0;
    } else {
      const crouching = o.state === 'crouch' || o.state === 'cblock';
      if (r < 0.26) out.P = true;
      else if (r < 0.44) out.K = true;
      else if (r < 0.54) { out.tok = 'D'; out.K = true; }
      else if (r < 0.64 + (crouching ? 0.15 : 0)) { out.tok = 'D'; out.P = true; }
      else if (r < 0.72) { out.tok = 'B'; out.K = true; }
      else if (r < 0.8 && dist < 44 * f.d.k) { out.tok = 'F'; out.P = true; }
      else if (r < 0.88) c.walk = -1;
      else { c.blockT = 0.4; out.B = true; }
    }
    return out;
  }

  // ---------- update ----------
  function updateFighter(f, o, dt) {
    if (!isFinite(f.x) || !isFinite(f.y)) { f.x = isFinite(f.x) ? f.x : AW / 2; f.y = FLOOR; f.vx = f.vy = 0; f.state = 'idle'; }
    if (!isFinite(f.vx)) f.vx = 0; if (!isFinite(f.vy)) f.vy = 0;
    f.t += dt; f.st += dt;
    if (f.flashT) f.flashT -= dt;
    if (f.projOut > 0) f.projOut -= dt;
    const sp = f.def.stats.speed;
    if (grounded(f) && (actionable(f) || f.state === 'dizzy') && Math.abs(o.x - f.x) > 2 && o.state !== 'held') f.face = Math.sign(o.x - f.x);
    switch (f.state) {
      case 'idle': case 'crouch': case 'block': case 'cblock': f.vx = 0; break;
      case 'walk': f.vx = f.wdir * f.face * (f.wdir > 0 ? 140 : 118) * sp; f.wph += dt * 13 * sp * f.wdir; break;
      case 'jump': case 'air': {
        f.vy += GRAV * dt; f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.state === 'air') f.spin += dt * (f.spinRate || 6);
        if (f.state === 'jump' && f.airAtk) { f.at += dt; const m = f.airAtk; if (!f.airHit && f.at > m.t[0] && f.at < m.t[0] + m.t[1]) tryHit(f, o, m); }
        if (f.y >= FLOOR && f.vy > 0) {
          f.y = FLOOR;
          if (f.state === 'air') {
            SFX.thud(); FX.dust(f.x, FLOOR, 14); FX.blood(f.x, FLOOR - 6, 18, Math.sign(f.vx), 0.9); game.shake = Math.max(game.shake, 4);
            if (!f.bounced && f.vy > 420) { f.bounced = true; f.vy = -f.vy * 0.3; f.vx *= 0.65; f.spinRate *= 0.45; f.y = FLOOR - 1; }
            else { f.state = 'down'; f.st = 0; f.vx *= 0.6; f.juggle = 0; }
          }
          else { f.state = 'idle'; f.airAtk = null; SFX.land(); }
        }
        break;
      }
      case 'hit': f.vx *= 1 - dt * 8; if (f.st >= (f.daze ? 1.1 : f.stunT || 0.26)) { f.state = 'idle'; f.daze = false; } break;
      case 'down': f.vx *= 1 - dt * 6; if (f.dead && !f.finishing) break; if (f.st > (f.finishing ? 0.9 : 0.7)) { f.state = 'getup'; f.st = 0; } break;
      case 'getup': if (f.st > 0.35) { f.state = 'idle'; } break;
      case 'attack': updateAttack(f, o, dt); break;
      case 'held': break;
      case 'dizzy': f.vx = 0; break;
      case 'win': f.vx = 0; break;
    }
    if (f.state === 'hit' && f.stunT == null) f.stunT = 0.26;
    if (f.bst > 0) { f.bst -= dt; f.x += f.bvx * dt; f.bvx *= 1 - dt * 10; }
    if (!['jump', 'air', 'attack'].includes(f.state) || (f.state === 'attack' && f.move && f.move.lunge)) f.x += f.vx * dt;
    if (f.finishing && ['idle', 'walk', 'crouch', 'block', 'cblock'].includes(f.state)) {
      if (f.bossDie) bossDeath(f);
      else { f.state = 'dizzy'; f.st = 0; game.phase = 'finish'; game.pt = 0; banner(f.def.him === 'IT' ? 'FINISH IT!' : 'FINISH ' + f.def.him + '!', { size: 34, fill: 'blood', life: 2.2 }); say('finish ' + f.def.him.toLowerCase()); }
    }
  }
  function updateAttack(f, o, dt) {
    const m = f.move, k = m.kind;
    f.mt += dt;
    const [su, ac, rc] = m.t;
    if (m.grab) {
      if (!f.grabbed && f.mt >= su && f.mt < su + ac + 0.02) {
        if (Math.abs(o.x - f.x) < 50 * f.d.k && grounded(o) && !invuln(o) && (actionable(o) || o.state === 'hit')) {
          f.grabbed = true; o.state = 'held'; o.heldBy = f; o.ht = 0; SFX.punch();
        }
      }
      if (f.grabbed && o.state === 'held') {
        o.ht += dt;
        const a = Math.min(1, o.ht / 0.3) * PI;
        o.x = f.x + f.face * Math.cos(a) * 30 * f.d.k; o.y = FLOOR - Math.sin(a) * 50 * f.d.k; o.spin = -a * 1.2;
        if (o.ht >= 0.3) {
          f.grabbed = false; o.y = Math.min(o.y, FLOOR - 1);
          damage(o, 12 * f.def.stats.power, f); SFX.big(); bleed(o, o.x, o.y - 30, 18, -f.face, 1);
          launch(o, -f.face * 200, -160); o.spin = -PI; game.shake = 4;
          if (o.state === 'air' && o.hp <= 0 && !o.finishing && game.phase !== 'fight') o.dead = true;
        }
      }
      if (f.mt >= su + ac + rc) { f.state = 'idle'; f.grabbed = false; }
      return;
    }
    if (m.lunge) f.vx = f.mt < su + ac ? f.face * m.lunge * (1 - f.mt / (su + ac)) : f.vx * (1 - dt * 12);
    if (m.limb && !f.hitDone && f.mt >= su && f.mt <= su + ac) tryHit(f, o, m);
    if (m.spawn && !f.spawned && f.mt >= su) { f.spawned = true; spawnProj(f); }
    if (!m.spawn) f.spawned = false;
    if (k === 'rush' || k === 'roll' || k === 'slide') {
      if (f.mt > su && f.mt < su + ac && !f.hitDone) f.vx = f.face * m.speed * f.def.stats.speed; else f.vx *= 1 - dt * 10;
      f.x += f.vx * dt;
    }
    if (k === 'leap') {
      if (!m.airborne && f.mt >= su && !f.leapt) { f.leapt = true; m.airborne = true; f.vy = -480; f.vx = clamp((o.x - f.x) / 0.62, -280, 280); }
      if (f.leapt && f.y < FLOOR + 1) {
        f.vy += GRAV * dt; f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.def.id === 'dan' || f.def.id === 'ballin') FX.fire(f.x, f.y - 40, 1, 0.6);
        if (f.y >= FLOOR && f.vy > 0) {
          f.y = FLOOR; m.airborne = false; f.leapt = false; f.vx = 0; SFX.land(); FX.dust(f.x, FLOOR, 12);
          if (m.quake) { game.shake = 7; SFX.thud(); if (!f.hitDone && grounded(o) && Math.abs(o.x - f.x) < 110 && !invuln(o) && o.state !== 'block') { f.hitDone = true; applyHit(f, o, { dmg: 8, fx: 'trip', snd: 'thud' }, false, o.x, FLOOR - 10); } }
          f.mt = su + ac; // go to recovery
        }
      }
    }
    if (k === 'burrow') {
      if (f.mt < 0.3) { f.sink = f.mt / 0.3; if (Math.random() < 0.6) m.fire ? FX.fire(f.x, FLOOR, 2) : FX.dust(f.x, FLOOR, 2, 'rgba(90,70,40,0.8)'); }
      else if (f.mt < 0.6) { f.hidden = true; f.x += clamp(o.x - f.x, -500 * dt, 500 * dt); }
      else if (f.mt < 0.8) { f.hidden = false; f.sink = Math.max(0, 1 - (f.mt - 0.6) / 0.12); if (Math.random() < 0.6) m.fire ? FX.fire(f.x, FLOOR, 3) : FX.dust(f.x, FLOOR, 3, 'rgba(90,70,40,0.8)'); }
      else f.sink = 0;
    }
    if (k === 'cloud' && f.mt > su && f.mt < su + ac) {
      for (let i = 0; i < 3; i++) FX.puff(f.x + f.face * rnd(20, 70) * f.d.k, f.y - rnd(40, 95) * f.d.k, pick(['rgba(200,220,240,0.6)', 'rgba(120,180,230,0.5)', 'rgba(230,200,90,0.5)']), 1, 5);
    }
    if (m.box && !f.hitDone && f.mt >= su && f.mt <= su + ac && (k !== 'leap' || f.vy > -60)) tryHit(f, o, m);
    if (f.mt >= su + ac + rc) {
      f.state = m.crouchEnd ? 'crouch' : 'idle'; f.move = null; f.vx = 0; f.sink = 0; f.hidden = false;
      if (m.airborne) { m.airborne = false; f.state = 'jump'; f.airAtk = MV.jkick; f.at = 9; }
    }
  }
  // body targets for contact checks, built from the defender's current pose
  const TGT = [['head', 10], ['chest', 12], ['belly', 12], ['hip', 11], ['kneeF', 7], ['kneeB', 7], ['footF', 6], ['footB', 6]];
  function contact(f, o, m) {
    const pose = m.keys ? R.track(f.d, m.keys, f.mt) : m.pose || f.pose;
    const sp = R.jointWorld(f, pose, m.limb), k = f.d.k, ok = o.d.k;
    let best = null, bd = 1e9;
    for (const [j, r] of TGT) {
      const p = R.jointWorld(o, o.pose, j), d = Math.hypot(p[0] - sp[0], p[1] - sp[1]) - (r * ok + m.rad * k);
      if (d < bd) { bd = d; best = [(p[0] + sp[0]) / 2, (p[1] + sp[1]) / 2]; }
    }
    return bd < 0 ? best : null;
  }
  function tryHit(f, o, m) {
    if (invuln(o) || o.state === 'script' || o.state === 'held') return;
    let cx, cy;
    if (m.limb) { const c = contact(f, o, m); if (!c) return; cx = c[0]; cy = c[1]; }
    else { const a = atkbox(f, m.box), b = hurtbox(o); if (!overlap(a, b)) return; cx = (Math.max(a.x0, b.x0) + Math.min(a.x1, b.x1)) / 2; cy = (Math.max(a.y0, b.y0) + Math.min(a.y1, b.y1)) / 2; }
    if (m.air) f.airHit = true; else f.hitDone = true;
    f.vx = 0;
    const facing = Math.sign(f.x - o.x) === o.face || Math.abs(f.x - o.x) < 3;
    const blocked = (o.state === 'block' || o.state === 'cblock') && facing && !(m.low && o.state === 'block' && false);
    applyHit(f, o, m, blocked, cx, cy);
    if (m.kind === 'rush' || m.kind === 'roll' || m.kind === 'slide') { f.mt = m.t[0] + m.t[1]; f.vx = -f.face * 60; }
  }

  // ---------- projectiles ----------
  function spawnProj(f) {
    const kind = f.def.proj.kind, k = f.d.k;
    const base = { o: f, kind, x: f.x + f.face * 30 * k, y: FLOOR - 78 * k, vx: f.face * 270, vy: 0, t: 0, w: 9, h: 8, dmg: 9, grav: 0 };
    SFX.proj();
    const list = [];
    if (kind === 'wave') list.push(Object.assign(base, { y: FLOOR - 8, h: 8, w: 12, vx: f.face * 230, low: 1 }));
    else if (kind === 'can') list.push(Object.assign(base, { vy: -170, grav: 420, w: 10, h: 10, dmg: 11 }));
    else if (kind === 'gust') list.push(Object.assign(base, { w: 14, h: 18, vx: f.face * 240, dmg: 6, push: 260 }));
    else if (kind === 'shards') { for (const v of [-70, 0, 70]) list.push(Object.assign({}, base, { vy: v, dmg: 6, w: 6, h: 5 })); }
    else if (kind === 'hellfire') list.push(Object.assign(base, { vx: f.face * 320, w: 12, h: 10, dmg: 11 }));
    else if (kind === 'poop') list.push(Object.assign(base, { y: FLOOR - 52, vy: -120, grav: 300, vx: f.face * 250 }));
    else list.push(base);
    for (const p of list) projs.push(p);
    f.projOut = 1.4;
  }
  function updateProjs(dt) {
    for (const p of projs) {
      p.t += dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > FLOOR - 4 && p.grav) { p.y = FLOOR - 4; p.vy = -Math.abs(p.vy) * 0.4; }
      if (p.kind === 'hellfire' || p.kind === 'bball') FX.fire(p.x - Math.sign(p.vx) * 4, p.y, 1, 0.7);
      if (p.kind === 'wave' && Math.random() < 0.7) FX.puff(p.x, FLOOR - 4, 'rgba(120,170,210,0.6)', 1, 2);
      const v = p.o === p1 ? p2 : p1;
      const box = { x0: p.x - p.w, x1: p.x + p.w, y0: p.y - p.h, y1: p.y + p.h };
      if (!invuln(v) && v.state !== 'script' && overlap(box, hurtbox(v))) {
        p.dead = true;
        const blocked = (v.state === 'block' || v.state === 'cblock') && Math.sign(p.x - v.x) === v.face;
        const mv = { dmg: p.dmg, fx: p.push ? 'knock' : 'stun', vx: p.push || 0, vy: -200, stun: 0.42, push: 110, snd: 'big', chip: 1 };
        if (p.kind === 'gust') { mv.fx = 'stun'; mv.push = p.push; mv.stun = 0.3; }
        applyHit(p.o, v, mv, blocked, p.x, p.y, p);
        if (p.kind === 'can') { FX.burst(p.x, p.y, 4, ['chunk', 'bone', 'poop']); SFX.clang(); }
        if (p.kind === 'poop') FX.puff(p.x, p.y, 'rgba(90,60,26,0.9)', 10, 3);
      }
      for (const q of projs) if (q !== p && q.o !== p.o && !q.dead && Math.abs(q.x - p.x) < p.w + q.w && Math.abs(q.y - p.y) < p.h + q.h) { p.dead = q.dead = true; FX.spark(p.x, p.y, '#fff', 14); SFX.block(); }
      if (p.x < cam - 60 || p.x > cam + W + 60 || p.t > 4) p.dead = true;
    }
    for (const p of projs) if (p.dead) p.o.projOut = Math.min(p.o.projOut, 0.25);
    projs = projs.filter(p => !p.dead);
  }
  function drawProj(g, p) {
    const s = Math.sign(p.vx) || 1, t = p.t;
    g.save(); g.translate(p.x, p.y);
    switch (p.kind) {
      case 'poop': R.ball(g, 0, 3, 5, '#5a3a1a'); R.ball(g, 0, -1, 4, '#6a4422'); R.ball(g, 0.5, -4.5, 2.5, '#7a5028'); g.fillStyle = 'rgba(120,140,40,0.6)'; for (let i = 0; i < 3; i++) g.fillRect(-s * (6 + i * 4), -6 + Math.sin(t * 20 + i) * 3, 2, 2); break;
      case 'knife': g.rotate(t * 22 * s); R.poly(g, [[-8, -1.5], [8, 0], [-8, 1.5]], '#d8dce4'); g.fillStyle = '#6a4a2a'; g.fillRect(-11, -1.6, 4, 3.2); break;
      case 'hairball': g.rotate(t * 8); R.ball(g, 0, 0, 6, '#7a7a52'); for (let i = 0; i < 10; i++) R.line(g, 0, 0, Math.cos(i) * 8, Math.sin(i * 1.3) * 8, '#5a5a3a', 0.8); g.fillStyle = 'rgba(150,200,60,0.7)'; g.fillRect(-2, 3, 3, 4); break;
      case 'card': g.rotate(t * 16 * s); g.fillStyle = '#f4f2e8'; g.fillRect(-7, -4.5, 14, 9); g.fillStyle = '#2a3a8a'; for (let i = 0; i < 3; i++) g.fillRect(-5, -2.5 + i * 2.5, 10, 0.8); break;
      case 'bball': g.rotate(t * 12 * s); R.ball(g, 0, 0, 6.5, '#e0701a'); R.line(g, -6.5, 0, 6.5, 0, '#2a1004', 0.8); R.line(g, 0, -6.5, 0, 6.5, '#2a1004', 0.8); break;
      case 'gust': for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(220,240,255,${0.7 - i * 0.2})`; g.lineWidth = 2; g.beginPath(); g.arc(-s * i * 6, 0, 8 + i * 3 + Math.sin(t * 20) * 2, s > 0 ? -1 : PI - 1, s > 0 ? 1 : PI + 1); g.stroke(); } break;
      case 'can': g.rotate(t * 10 * s); g.fillStyle = '#8a8a90'; g.fillRect(-7, -8, 14, 16); g.fillStyle = '#b0b0b8'; g.fillRect(-7, -8, 14, 2); for (let i = -5; i < 7; i += 3) g.fillRect(i, -6, 0.8, 13); g.fillStyle = '#5a4a2a'; g.fillRect(-4, -11, 7, 3); break;
      case 'wave': g.fillStyle = 'rgba(100,160,210,0.85)'; g.beginPath(); g.moveTo(-14 * s, 8); g.quadraticCurveTo(0, -12 - Math.sin(t * 18) * 3, 14 * s, 8); g.fill(); g.fillStyle = 'rgba(230,245,255,0.8)'; g.fillRect(-3, -4, 6, 2); break;
      case 'shards': g.rotate(t * 18); R.poly(g, [[-6, -2], [7, 0], [-4, 3]], 'rgba(190,230,250,0.9)'); break;
      case 'hellfire': R.ball(g, 0, 0, 7, '#ff6a10'); R.ball(g, 1, -1, 4, '#ffe060'); break;
    }
    g.restore();
  }

  // ---------- pose + camera ----------
  function targetPose(f) {
    const t = f.t;
    switch (f.state) {
      case 'idle': return PS.stance(t);
      case 'walk': return PS.walk(f.wph);
      case 'crouch': return PS.crouch;
      case 'block': return PS.block;
      case 'cblock': return PS.cblock;
      case 'jump': return f.airAtk && f.at < f.airAtk.t[0] + f.airAtk.t[1] + 0.1 ? f.airAtk.pose : PS.jump;
      case 'hit': return f.daze ? PS.dizzy(t * 2) : f.low ? PS.hitLow : PS.hitHigh;
      case 'air': return PS.air(-f.spin, f.t);
      case 'held': return PS.air(f.spin);
      case 'down': return PS.down(f);
      case 'getup': return PS.crouch;
      case 'dizzy': return PS.dizzy(t);
      case 'win': return PS.win(t);
      case 'script': return f.scriptPose || PS.stance(t);
      case 'attack': {
        const m = f.move, k = m.kind;
        if (m.keys) return R.track(f.d, m.keys, f.mt);
        if (k === 'rush') return PS.rush(f.mt * 22);
        if (k === 'roll') return Object.assign({}, PS.tuck, { rot: f.mt * 20, hyA: (f.d.thigh + f.d.shin) * 0.55 });
        if (k === 'slide') return PS.slide;
        if (k === 'leap') return f.vy < 0 && f.leapt ? PS.jump : f.leapt ? PS.dive : PS.crouch;
        if (k === 'cloud') return f.mt < m.t[0] ? PS.proj0 : PS.proj1;
        if (k === 'burrow') return f.mt < 0.6 ? PS.crouch : PS.up1;
        return STANCE;
      }
    }
    return STANCE;
  }
  function updatePose(f, dt) {
    const tgt = targetPose(f);
    const fast = f.state === 'air' || f.state === 'held' || f.state === 'script' || f.state === 'jump' || f.state === 'hit';
    const snap = f.snapPose || (f.state === 'attack' && f.move && f.move.keys) || f.state === 'air';
    const rate = snap ? 1 : Math.min(1, dt * (fast ? 40 : 24));
    f.snapPose = false;
    const tr = R.resolve(f.d, tgt);
    // spin angles take the short way round
    while (tr.rot - f.pose.rot > PI) f.pose.rot += 2 * PI;
    while (tr.rot - f.pose.rot < -PI) f.pose.rot -= 2 * PI;
    f.pose = R.lerp(f.d, f.pose, tr, rate);
    f.st2 = Object.assign(f.st2 || {}, { wounds: f.st2.wounds || [], t: f.t, dead: f.dead && f.state !== 'script' ? true : f.st2.dead, hurt: ['hit', 'air', 'down'].includes(f.state) && !f.dead, claws: f.state === 'attack' });
  }
  function separate() {
    if (!p1 || !p2) return;
    const a = p1, b = p2;
    const both = ['script', 'held'];
    if (both.includes(a.state) || both.includes(b.state) || a.hidden || b.hidden) return;
    const ha = a.y < FLOOR - 40 || b.y < FLOOR - 40;
    const minD = (halfW(a) + halfW(b)) * 0.78;
    const dx = b.x - a.x;
    if (!ha && Math.abs(dx) < minD) {
      const push = (minD - Math.abs(dx)) / 2, s = dx >= 0 ? 1 : -1;
      a.x -= push * s; b.x += push * s;
    }
  }
  function updateCam(dt) {
    if (game.phase === 'fatality') return;
    const mid = (p1.x + p2.x) / 2;
    cam += (clamp(mid - W / 2, 0, AW - W) - cam) * Math.min(1, dt * 10);
    for (const f of [p1, p2]) {
      if (f.state === 'script' || f.state === 'held') continue;
      const ext = (f.state === 'down' || f.state === 'air') ? -f.face * hurtH(f) * 0.45 : 0;
      f.x = clamp(f.x + ext, Math.max(14, cam + W * 0.27), Math.min(AW - 14, cam + W * 0.73)) - ext;
    }
  }

  function step(dt) {
    if (screen !== 'play' || paused) { press.P = press.K = false; return; }
    game.time += dt; game.pt += dt;
    if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 18);
    if (game.flash > 0) game.flash -= dt;
    if (game.toasty > 0) game.toasty -= dt;
    for (const b of game.banners) b.t += dt;
    game.banners = game.banners.filter(b => b.t < b.life);
    for (const b of game.bubbles) b.t += dt;
    game.bubbles = game.bubbles.filter(b => b.t < b.life);
    if (game.freeze > 0) { game.freeze -= dt; return; }
    const inp = readInput();
    const tok = tokenFor(p1, inp.mx, inp.my);
    pushTok(p1, tok);
    if (press.P) p1.bufP = game.time;
    if (press.K) p1.bufK = game.time;
    press.P = press.K = false;
    const ph = game.phase;
    if (ph === 'intro') {
      if (game.pt > 1.3 && !game.fought) { game.fought = true; banner('FIGHT!', { size: 44, fill: 'fire', life: 0.9 }); say('fight'); SFX.gong(); }
      if (game.pt > 2.0) { game.phase = 'fight'; game.pt = 0; game.fought = false; }
    }
    if (ph === 'fight') {
      game.timer -= dt;
      if (game.timer <= 0) { game.timer = 0; timeUp(); }
    }
    if (ph === 'finish' && game.pt > 6) {
      const v = game.loser; v.finishing = false; v.dead = true; launch(v, -v.face * 60, -120); game.phase = 'matchend'; game.pt = 0; winText(game.winner);
    }
    if (ph === 'fatality') {
      if (game.script) { game.script.update(dt); if (game.script.done) { game.script = null; afterFatality(); } }
    }
    if (ph === 'roundend' && game.pt > 3.6) { game.round++; startRound(); return; }
    if (ph === 'matchend' && game.pt > 4.2) { endMatch(); return; }
    if (ph === 'fatalend' && game.pt > 4.4) { endMatch(); return; }
    if (['fight', 'finish', 'finishwait'].includes(game.phase)) {
      const can = game.phase !== 'finishwait' || true;
      let c1 = { tok, P: game.time - p1.bufP < 0.14, K: game.time - p1.bufK < 0.14, B: btn.B };
      if (window.MK_P1AI) { if (!p1.cpu) p1.cpu = { t: 0.5, walk: 0, lvl: 0.6, blockT: 0, fatalT: 0 }; c1 = ai(p1, p2, dt); }
      if (can && !p1.finishing && !(game.phase === 'finish' && game.loser === p1)) {
        const before = p1.state;
        act(p1, p2, c1);
        if (p1.state !== before && (c1.P || c1.K)) { p1.bufP = p1.bufK = -9; }
        if (p1.state === 'attack' || (p1.state === 'jump' && p1.airAtk)) p1.bufP = p1.bufK = -9;
      }
      if (!p2.finishing && !(game.phase === 'finish' && game.loser === p2)) { const c2 = window.MK_NOAI ? { tok: 'N' } : ai(p2, p1, dt); if (game.phase !== 'fatality') act(p2, p1, c2); }
    }
    if (game.phase === 'roundend' || game.phase === 'matchend' || game.phase === 'fatalend') {
      const w = game.winner;
      if (w && actionable(w) && game.pt > 1.0) { w.state = 'win'; }
    }
    for (const f of [p1, p2]) if (f.state !== 'script') updateFighter(f, f === p1 ? p2 : p1, dt);
    separate();
    updateProjs(dt);
    updateCam(dt);
    for (const f of [p1, p2]) updatePose(f, dt);
    FX.update(dt);
  }
  function timeUp() {
    if (Math.abs(p1.hp - p2.hp) < 0.5) { game.phase = 'roundend'; game.pt = 0; banner('DRAW', { size: 34 }); return; }
    const v = p1.hp < p2.hp ? p1 : p2, a = v === p1 ? p2 : p1;
    v.hp = 0; ko(v, a);
    if (v.finishing) { v.state = 'idle'; }
  }
  function afterFatality() {
    const w = game.winner;
    game.phase = 'fatalend'; game.pt = 0;
    if (game.loser.bossDie) { winText(w); w.state = 'win'; return; }
    w.state = 'win'; w.scriptPose = null;
    banner('FATALITY', { size: 46, fill: 'blood', life: 4.2, y: 70, drip: 1 });
    say('fatality');
    setTimeout(() => { banner(w.def.name + ' WINS', { size: 24, fill: 'gold', life: 3, y: 124 }); }, 1300);
  }
  function endMatch() {
    const won = game.winner === p1;
    if (won) {
      ladder.rung++;
      if (ladder.rung >= ladder.opps.length) { screen = 'ending'; game.pt = 0; return; }
      screen = 'ladder'; game.pt = 0;
    } else { screen = 'continue'; game.pt = 0; }
  }

  // ---------- rendering ----------
  function drawFighter(g, f) {
    if (f.hidden) return;
    if (f.def.id === 'golem' && f.state === 'script' && f.ro.gone) return;
    g.save();
    if (f.sink > 0) { g.beginPath(); g.rect(f.x - 80, 0, 160, FLOOR + 1); g.clip(); g.translate(0, f.sink * hurtH(f) * 1.05); }
    if (f.flashT > 0) g.globalAlpha = 0.7;
    // shadow
    if (!f.ro.noShadow) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(f.x, FLOOR + 1, halfW(f) * 1.4 * (1 - Math.min(0.6, (FLOOR - f.y) / 200)), 3.5, 0, 0, PI * 2); g.fill(); }
    const ro = Object.assign({}, f.ro);
    if (f.ro.scale) ro.scale = f.ro.scale;
    const fx = f.x + (f.ro.dx || 0), fy = f.y + (f.ro.dy || 0);
    R.digi(g, fx, fy, gg => R.draw(gg, { def: f.def, d: f.d, x: fx, y: fy, face: f.face, t: f.t, st: f.st2 }, f.pose, ro), { box: [50, 20, 280, 310], tint: f.ro.char ? [0.45, 0.35, 0.3] : null });
    // the wounded keep bleeding
    if (!f.hidden && f.hp < 70 && Math.random() < (1 - f.hp / 70) * 0.25 && f.state !== 'script') { const hp = R.jointWorld(f, f.pose, Math.random() < 0.5 ? 'head' : 'chest'); FX.blood(hp[0], hp[1], 1, 0, 0.15); }
    if (f.state === 'dizzy' || (f.state === 'hit' && f.daze)) {
      const hp = R.jointWorld(f, f.pose, 'head');
      for (let i = 0; i < 3; i++) { const a = f.t * 4 + i * 2.1; g.fillStyle = '#ffe040'; g.font = '9px Anton, Impact, sans-serif'; g.fillText('*', hp[0] + Math.cos(a) * 12 - 2, hp[1] - 12 + Math.sin(a) * 3); }
    }
    g.restore();
  }
  // gritty faux-digitized look: grain + reduced color depth
  const NOISE = new Int8Array(560 * 240 * 2);
  for (let i = 0; i < NOISE.length; i++) NOISE[i] = ((Math.random() + Math.random() + Math.random() - 1.5) * 9) | 0;
  function grit() {
    const img = ctx.getImageData(0, 0, W, H), d = img.data, off = ((game.time * 12) | 0) % 2 ? 0 : 337;
    for (let i = 0, j = off; i < d.length; i += 4, j++) {
      const n = NOISE[j];
      let r = d[i] + n, gg = d[i + 1] + n, b = d[i + 2] + n;
      d[i] = (r < 0 ? 0 : r > 255 ? 255 : r) & 0xf8; d[i + 1] = (gg < 0 ? 0 : gg > 255 ? 255 : gg) & 0xf8; d[i + 2] = (b < 0 ? 0 : b > 255 ? 255 : b) & 0xf8;
    }
    ctx.putImageData(img, 0, 0);
  }
  function drawWorld() {
    const g = ctx;
    g.save();
    const sx = game.shake ? rnd(-game.shake, game.shake) : 0, sy = game.shake ? rnd(-game.shake, game.shake) * 0.6 : 0;
    g.translate(Math.round(sx), Math.round(sy));
    if (game.scene) { game.scene(g, W, H); g.restore(); return; }
    g.drawImage(stage.back, -Math.round(cam * 0.6) - 40, 0);
    g.save(); g.translate(-Math.round(cam * 0.6) - 40, 0); STAGES.live(g, stage.id, game.time); g.restore();
    g.drawImage(stage.front, -Math.round(cam), 0, AW, H);
    // restore the far layer above the floor line (front layer is transparent there)
    g.translate(-Math.round(cam), 0);
    if (game.phase === 'fatality') { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(cam - 10, 0, W + 20, H); }
    FX.drawDecals(g);
    FX.drawProps(g, 'back');
    const order = [p1, p2].sort((a, b) => (a.state === 'attack' ? 1 : 0) - (b.state === 'attack' ? 1 : 0));
    for (const f of order) drawFighter(g, f);
    FX.drawGibs(g);
    for (const p of projs) drawProj(g, p);
    FX.drawProps(g, 'front');
    FX.drawParts(g);
    for (const b of game.bubbles) { const a = Math.min(1, (b.life - b.t) * 3); g.globalAlpha = a; TXT.draw(g, b.str, b.x, b.y - b.t * 8, { size: b.size, align: 'center', fill: b.fill || 'white' }); g.globalAlpha = 1; }
    g.restore();
  }
  function bar(x, y, w, f, right) {
    const g = ctx, h = 11;
    g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle = '#a00a0a'; g.fillRect(x, y, w, h);
    const fw = w * clamp(f.hp / 100, 0, 1);
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#9aff6a'); gr.addColorStop(0.5, '#1ec41e'); gr.addColorStop(1, '#0a6a0a');
    g.fillStyle = gr; g.fillRect(right ? x + w - fw : x, y, fw, h);
    TXT.draw(g, f.def.name, right ? x + w - 3 : x + 3, y + 0.5, { size: 9, align: right ? 'right' : 'left', fill: '#ffe860', strokeW: 1.6, shadow: false });
    for (let i = 0; i < f.wins; i++) { const cx = right ? x + w - 8 - i * 13 : x + 8 + i * 13; R.ball(g, cx, y + h + 8, 5, '#9b59d0'); g.fillStyle = '#ffe860'; g.fillRect(cx - 1, y + h + 5, 2, 6); }
  }
  function drawHUD() {
    const bw = Math.min(190, W / 2 - 34);
    bar(10, 8, bw, p1, false); bar(W - 10 - bw, 8, bw, p2, true);
    TXT.draw(ctx, String(Math.ceil(game.timer)).padStart(2, '0'), W / 2, 3, { size: 20, align: 'center', fill: 'gold' });
    for (const b of game.banners) {
      const a = b.t < 0.12 ? b.t / 0.12 : Math.min(1, (b.life - b.t) * 3);
      const sc = b.t < 0.15 ? 1.5 - b.t / 0.3 : 1;
      ctx.globalAlpha = clamp(a, 0, 1);
      TXT.draw(ctx, b.str, W / 2, b.y - (b.size * sc) / 2, { size: Math.round(b.size * sc), align: 'center', fill: b.fill });
      if (b.drip) { ctx.fillStyle = '#9a000c'; const w = TXT.width(ctx, b.str, b.size); for (let i = 0; i < 9; i++) { const x = W / 2 - w / 2 + (i + 0.5) * w / 9; ctx.fillRect(x, b.y + b.size * 0.45, 2, Math.min(30, b.t * 14 * (1 + (i * 7) % 5 / 3))); } }
      ctx.globalAlpha = 1;
    }
    if (game.toasty > 0) {
      const u = game.toasty > 1.1 ? (1.4 - game.toasty) / 0.3 : game.toasty < 0.3 ? game.toasty / 0.3 : 1;
      const x = W - 46 * u + 8, y = H - 128;
      R.drawHeadAt(ctx, { def: ROSTER.ALL.hippo, d: ROSTER.ALL.hippo.dk }, x, y + 34, -0.2, 1.4, { t: game.time });
      TXT.draw(ctx, 'SQUARE SLICED!', x - 6, y - 6, { size: 11, align: 'right', fill: 'purple' });
    }
    if (game.phase === 'finish') { const left = Math.max(0, 6 - game.pt); if (left < 3) TXT.draw(ctx, String(Math.ceil(left)), W / 2, 100, { size: 18, align: 'center', fill: 'red' }); }
  }
  let menu = null;
  function renderPlay() {
    elControls.classList.toggle('on', !paused && game.phase !== 'fatality');
    elPause.classList.add('on');
    const pl = paused ? 'RESUME' : 'II PAUSE'; if (elPause.textContent !== pl) elPause.textContent = pl;
    drawWorld();
    grit();
    FX.drawScreen(ctx, W, H);
    if (game.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${game.flash * 2})`; ctx.fillRect(0, 0, W, H); }
    drawHUD();
    if (paused) renderPause();
  }

  // ---------- screens ----------
  function uiButton(label, x, y, w, h, fn, fill = 'gold', size = 16) {
    const g = ctx;
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y, w, h);
    g.strokeStyle = '#c8a030'; g.lineWidth = 1.5; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    TXT.draw(g, label, x + w / 2, y + h / 2 - size * 0.62, { size, align: 'center', fill });
    ui.push({ x, y, w, h, fn });
  }
  function bgDark(t) {
    const g = ctx, gr = g.createRadialGradient(W / 2, H * 0.45, 10, W / 2, H * 0.45, W * 0.7);
    gr.addColorStop(0, '#3a0808'); gr.addColorStop(0.6, '#140204'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  function emblem(g, x, y, r, t) {
    g.save(); g.translate(x, y);
    R.ball(g, 0, 0, r, '#2a0a3a');
    g.strokeStyle = '#d8a030'; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, r - 2, 0, PI * 2); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r - 6, 0, PI * 2); g.stroke();
    R.drawHeadAt(g, { def: ROSTER.ALL.hippo, d: ROSTER.ALL.hippo.dk }, -r * 0.18, r * 0.5, 0, r / 26, { t, jaw: 0.6 + Math.sin(t * 2) * 0.3 });
    g.fillStyle = '#9a000c'; for (let i = 0; i < 4; i++) g.fillRect(-6 + i * 5, r * 0.55, 2, 4 + ((t * 6 + i * 3) % 8));
    g.restore();
  }
  function renderTitle() {
    elControls.classList.remove('on'); elPause.classList.remove('on');
    bgDark(); ui = [];
    const t = game.time;
    emblem(ctx, W / 2, 84, 42, t);
    TXT.draw(ctx, 'MUNCIE KOMBAT', W / 2, 128, { size: 44, align: 'center', fill: 'fire' });
    TXT.draw(ctx, 'A PURPLE HIPPO ARCADE GAME', W / 2, 180, { size: 10, align: 'center', fill: 'purple' });
    if (Math.sin(t * 5) > -0.3) TXT.draw(ctx, 'TAP TO FIGHT', W / 2, 202, { size: 18, align: 'center', fill: 'white' });
    ui.push({ x: 0, y: 0, w: W, h: H, fn: () => { SFX.gong(); screen = 'select'; say('choose your fighter'); } });
    grit();
  }
  function portrait(g, def, x, y, w, h, on, t) {
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, on ? '#7a1a1a' : '#2a0a10'); gr.addColorStop(1, on ? '#3a0606' : '#100206');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const sc = w / 36, adj = { gertie: [0.42, 0.78, 1.5], painter: [0.5, 0.86, 0.85], hippo: [0.3, 0.9, 0.85], garf: [0.4, 0.9, 0.95], golem: [0.5, 0.7, 1], dan: [0.42, 0.95, 0.85] }[def.id] || [0.4, 0.88, 1];
    R.drawHeadAt(g, { def, d: def.dk }, x + w * adj[0], y + h * adj[1], 0, sc / def.k * adj[2], { t, hurt: false });
    g.restore();
    g.strokeStyle = on ? '#ffe060' : '#6a4a20'; g.lineWidth = on ? 2 : 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  function renderSelect() {
    elControls.classList.remove('on'); elPause.classList.remove('on');
    bgDark(); ui = [];
    const t = game.time, g = ctx;
    TXT.draw(g, 'CHOOSE YOUR FIGHTER', W / 2, 6, { size: 20, align: 'center', fill: 'gold' });
    const cw = 44, chh = 46, gx = W / 2 - 2 * (cw + 4) + 2 + 40, gy = 38;
    ROSTER.FIGHTERS.forEach((def, i) => {
      const x = gx + (i % 4) * (cw + 4), y = gy + ((i / 4) | 0) * (chh + 4);
      portrait(g, def, x, y, cw, chh, i === sel.i, t);
      ui.push({ x, y, w: cw, h: chh, fn: () => { if (sel.i === i) confirmPick(); else { sel.i = i; SFX.select(); } } });
    });
    const def = ROSTER.FIGHTERS[sel.i];
    // big preview on the left
    const f = { def, d: def.dk, x: 66, y: 196, face: 1, t };
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.ellipse(66, 197, 30, 5, 0, 0, PI * 2); g.fill();
    R.digi(g, f.x, f.y, gg => R.draw(gg, f, PS.stance(t), {}));
    TXT.draw(g, def.name, gx + 2 * (cw + 4) - 2, gy + 2 * (chh + 4) + 2, { size: 17, align: 'center', fill: 'fire' });
    const words = def.bio.split(' '); let line = '', ly = gy + 2 * (chh + 4) + 26; const maxW = 4 * (cw + 4) - 6;
    for (const wd of words) { const tr = line ? line + ' ' + wd : wd; if (TXT.width(g, tr, 9) > maxW) { TXT.draw(g, line, gx + 2 * (cw + 4) - 2, ly, { size: 9, align: 'center', fill: 'white', italic: false }); line = wd; ly += 12; } else line = tr; }
    TXT.draw(g, line, gx + 2 * (cw + 4) - 2, ly, { size: 9, align: 'center', fill: 'white', italic: false });
    uiButton('FIGHT', W - 86, H - 36, 76, 28, confirmPick, 'fire', 18);
    uiButton('MOVES', W - 86, H - 70, 76, 26, () => { screen = 'moves'; movesBack = 'select'; SFX.blip(); }, 'gold', 14);
    grit();
  }
  function confirmPick() { SFX.gong(); ladder.pick = sel.i; newLadder(); screen = 'ladder'; game.pt = 0; say(ROSTER.FIGHTERS[sel.i].name.replace("'", 'g').toLowerCase()); }
  let movesBack = 'select';
  function renderMoves() {
    elControls.classList.remove('on');
    bgDark(); ui = [];
    const g = ctx, def = screen === 'moves' && movesBack === 'play' ? p1.def : ROSTER.FIGHTERS[sel.i];
    TXT.draw(g, def.name + ' MOVES', W / 2, 6, { size: 18, align: 'center', fill: 'gold' });
    const rows = [
      ['PUNCH', 'Jab (tap again for a combo)'], ['DOWN + PUNCH', 'Uppercut'], ['TOWARD + PUNCH (close)', 'Throw'],
      ['KICK', 'Kick'], ['DOWN + KICK', 'Sweep'], ['BACK + KICK', 'Roundhouse'], ['UP', 'Jump (punch or kick in the air)'], ['BLOCK (hold)', 'Block (hold DOWN too to block low)'],
      ['BACK, FORWARD + PUNCH', def.proj.name], ['DOWN, FORWARD + KICK', def.sp2.name], ['FINISH: DOWN, DOWN + PUNCH', 'FATALITY: ' + def.fatal.name], ['FINISH on the TRESTLE: DOWN + PUNCH', 'Stage fatality'],
    ];
    rows.forEach((r, i) => {
      const y = 32 + i * 16.2, hl = i >= 8;
      TXT.draw(g, r[0], W / 2 - 6, y, { size: 10, align: 'right', fill: hl ? 'fire' : 'white', italic: false });
      TXT.draw(g, r[1], W / 2 + 6, y, { size: 10, align: 'left', fill: hl ? 'gold' : '#c8c8d0', italic: false });
    });
    uiButton('BACK', W - 70, H - 26, 62, 22, () => { screen = movesBack; if (movesBack === 'play') paused = true; SFX.blip(); }, 'gold', 13);
  }
  function renderLadder() {
    elControls.classList.remove('on'); elPause.classList.remove('on');
    bgDark(); ui = [];
    const g = ctx, t = game.time;
    TXT.draw(g, 'YOUR DESTINY', W / 2 - 50, 6, { size: 20, align: 'center', fill: 'gold' });
    const n = ladder.opps.length, bh = 21, bx = W - 64, by = H - 10 - n * (bh + 2);
    for (let i = n - 1; i >= 0; i--) {
      const y = by + (n - 1 - i) * (bh + 2), def = ladder.opps[i];
      const done = i < ladder.rung, cur = i === ladder.rung;
      g.fillStyle = cur ? '#7a1a1a' : done ? '#1a1a1a' : '#2a0a10'; g.fillRect(bx, y, 54, bh);
      g.save(); g.beginPath(); g.rect(bx, y, 54, bh); g.clip();
      R.drawHeadAt(g, { def, d: def.dk }, bx + 16, y + bh + 2, 0, 0.62 / def.k, { t, dead: done });
      g.restore();
      TXT.draw(g, def.short, bx + 30, y + 6, { size: 8, fill: cur ? 'gold' : done ? '#666' : 'white', italic: false, shadow: false });
      if (cur) { g.strokeStyle = '#ffe060'; g.lineWidth = 1.5; g.strokeRect(bx + 0.5, y + 0.5, 53, bh - 1); }
      if (done) { R.line(g, bx + 4, y + 4, bx + 50, y + bh - 4, '#b0101a', 2); }
    }
    const me = ROSTER.FIGHTERS[ladder.pick], op = ladder.opps[ladder.rung];
    const f1 = { def: me, d: me.dk, x: 70, y: 196, face: 1, t }, f2 = { def: op, d: op.dk, x: 230, y: 196, face: -1, t: t + 1 };
    R.digi(g, f1.x, f1.y, gg => R.draw(gg, f1, PS.stance(t))); R.digi(g, f2.x, f2.y, gg => R.draw(gg, f2, PS.stance(t + 1)));
    TXT.draw(g, 'VS', 150, 110, { size: 30, align: 'center', fill: 'fire' });
    TXT.draw(g, 'BATTLE ' + (ladder.rung + 1) + ' OF ' + n, 150, 34, { size: 14, align: 'center', fill: 'white' });
    TXT.draw(g, STAGES.get(ladder.stages[ladder.rung]).name, 150, 52, { size: 11, align: 'center', fill: 'purple' });
    if (op.boss) TXT.draw(g, op.bio, 150, 206, { size: 8, align: 'center', fill: 'gold', italic: false });
    if (Math.sin(t * 5) > -0.3) TXT.draw(g, 'TAP TO FIGHT', 150, 218, { size: 13, align: 'center', fill: 'white' });
    ui.push({ x: 0, y: 0, w: W, h: H, fn: () => { SFX.gong(); startMatch(); } });
    grit();
  }
  function renderContinue() {
    elControls.classList.remove('on'); elPause.classList.remove('on');
    drawWorld(); grit(); ui = [];
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    const left = Math.max(0, 9 - Math.floor(game.pt));
    TXT.draw(ctx, 'CONTINUE?', W / 2, 60, { size: 34, align: 'center', fill: 'blood' });
    TXT.draw(ctx, String(left), W / 2, 104, { size: 48, align: 'center', fill: 'gold' });
    TXT.draw(ctx, 'TAP TO KEEP FIGHTING', W / 2, 170, { size: 14, align: 'center', fill: 'white' });
    if (game.pt > 10) { screen = 'title'; return; }
    ui.push({ x: 0, y: 0, w: W, h: H, fn: () => { SFX.gong(); startMatch(); } });
  }
  function renderEnding() {
    elControls.classList.remove('on'); elPause.classList.remove('on');
    bgDark(); ui = [];
    const g = ctx, t = game.time, def = ROSTER.FIGHTERS[ladder.pick];
    if (Math.random() < 0.6) FX.blood(rnd(0, W), -4, 1, 0, 0.2);
    FX.setFloor(H + 20); FX.update(1 / 60); FX.drawParts(g); FX.setFloor(FLOOR);
    R.digi(g, W / 2, 206, gg => R.draw(gg, { def, d: def.dk, x: W / 2, y: 206, face: 1, t }, PS.win(t)));
    TXT.draw(g, def.name, W / 2, 10, { size: 30, align: 'center', fill: 'fire' });
    TXT.draw(g, 'IS THE CHAMPION OF', W / 2, 46, { size: 14, align: 'center', fill: 'white' });
    TXT.draw(g, 'MUNCIE KOMBAT', W / 2, 62, { size: 24, align: 'center', fill: 'blood' });
    TXT.draw(g, 'Devil Dan is back in the basement of City Hall. For now.', W / 2, 214, { size: 9, align: 'center', fill: 'gold', italic: false });
    if (game.pt > 2.5) ui.push({ x: 0, y: 0, w: W, h: H, fn: () => { FX.reset(); screen = 'title'; } });
    game.pt += 1 / 60;
    grit();
  }
  function renderPause() {
    ui = [];
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
    TXT.draw(ctx, 'PAUSED', W / 2, 30, { size: 30, align: 'center', fill: 'gold' });
    const bx = W / 2 - 60;
    uiButton('RESUME', bx, 76, 120, 26, () => { paused = false; SFX.blip(); });
    uiButton('MOVES', bx, 108, 120, 26, () => { screen = 'moves'; movesBack = 'play'; SFX.blip(); });
    uiButton(SFX.isMuted() ? 'SOUND: OFF' : 'SOUND: ON', bx, 140, 120, 26, () => { SFX.setMuted(!SFX.isMuted()); SFX.blip(); });
    uiButton('QUIT', bx, 172, 120, 26, () => { paused = false; screen = 'title'; FX.reset(); SFX.blip(); });
  }
  function uiTap(x, y) {
    const r = cv.getBoundingClientRect(), cx = (x - r.left) / r.width * W, cy = (y - r.top) / r.height * H;
    for (let i = ui.length - 1; i >= 0; i--) { const b = ui[i]; if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) { ui = []; b.fn(); return; } }
  }
  function uiKey() { if (ui.length) { const b = ui[ui.length - 1]; ui = []; b.fn(); } }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (screen === 'title') return renderTitle();
    if (screen === 'select') { game.time += 0; return renderSelect(); }
    if (screen === 'moves') return renderMoves();
    if (screen === 'ladder') return renderLadder();
    if (screen === 'continue') { game.pt += 1 / 60; return renderContinue(); }
    if (screen === 'ending') return renderEnding();
    renderPlay();
  }

  // ---------- sizing ----------
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    W = Math.round(clamp(H * vw / vh, 400, 540));
    cv.width = W; cv.height = H;
    let cw = vw, ch = vw * H / W;
    if (ch > vh) { ch = vh; cw = vh * W / H; }
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.style.left = (vw - cw) / 2 + 'px'; cv.style.top = (vh - ch) / 2 + 'px';
    placeStick(...defaultStickPos());
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 250));
  resize();
  elBtn.P.style.cssText = 'right: calc(16px + env(safe-area-inset-right)); bottom: calc(20px + env(safe-area-inset-bottom));';
  elBtn.K.style.cssText = 'right: calc(122px + env(safe-area-inset-right)); bottom: calc(12px + env(safe-area-inset-bottom));';
  elBtn.B.style.cssText = 'right: calc(56px + env(safe-area-inset-right)); bottom: calc(124px + env(safe-area-inset-bottom));';

  // ---------- main loop ----------
  let last = performance.now(), acc = 0;
  const STEP = 1 / 60;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    acc += dt * (window.MK_SPEED || 1);
    let n = 0;
    while (acc >= STEP && n < 40) { if (screen !== 'play') game.time += STEP; step(STEP); acc -= STEP; n++; }
    if (n >= 40) acc = 0;
    render();
    requestAnimationFrame(frame);
  }
  TXT.ready.then(() => { last = performance.now(); requestAnimationFrame(frame); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'play') paused = true; });

  window.MK = { game, ladder, sel, get p1() { return p1; }, get p2() { return p2; }, get screen() { return screen; }, set screen(v) { screen = v; }, startMatch, newLadder, startFatality, PS, MV,
    set paused(v) { paused = v; }, get cam() { return cam; }, set cam(v) { cam = v; }, act, applyHit, projs: () => projs };
  if (AUTO) { const q = new URLSearchParams(location.search); ladder.pick = +(q.get('p') || 0); newLadder(); if (q.get('o')) { const o = ROSTER.ALL[q.get('o')]; ladder.opps[0] = o; } if (q.get('s')) ladder.stages[0] = q.get('s'); startMatch(); }
})();
