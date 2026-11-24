// Muncie Kombat: arenas. Muncie landmarks (as worked out for Hole Patrol) repainted in a dark,
// moody early-90s Mortal Kombat style: night skies, fog, hard light sources, textured stone and
// brick, deep perspective floors, then dithered like a digitized backdrop.
'use strict';
const STAGES = (() => {
  const R = RIG, PI = Math.PI;
  const H = 240, FLOOR = 222, AWX = 1100, BW = 1280, CX = 640, FY = 186, VY = 118;
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const rr = (a, b) => a + rand() * (b - a);
  const mk = w => { const c = document.createElement('canvas'); c.width = w; c.height = H; return c; };
  const shade = R.shade;

  // ---------- painting helpers ----------
  function vg(g, x, y, w, h, stops) { const gr = g.createLinearGradient(0, y, 0, y + h); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); g.fillStyle = gr; g.fillRect(x, y, w, h); }
  function hgf(g, x, y, w, h, stops) { const gr = g.createLinearGradient(x, 0, x + w, 0); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); g.fillStyle = gr; g.fillRect(x, y, w, h); }
  function glow(g, x, y, r, c, a = 1) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  }
  function shadowRect(g, x, y, w, h, a = 0.5) { const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h); }
  function speckle(g, x, y, w, h, n, dark = 0.35, light = 0.12) {
    for (let i = 0; i < n; i++) { g.fillStyle = rand() < 0.6 ? `rgba(0,0,0,${dark * rand()})` : `rgba(255,240,220,${light * rand()})`; g.fillRect(x + rand() * w, y + rand() * h, 1 + (rand() < 0.2), 1); }
  }
  function grime(g, x, y, w, h, n = 12, a = 0.25) {
    for (let i = 0; i < n; i++) { const xx = x + rand() * w, ww = 1 + rand() * 4, hh = h * (0.2 + rand() * 0.8); const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, `rgba(0,0,0,${a * rand()})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(xx, y, ww, hh); }
  }
  // lit wall: vertical light falloff from a light at the bottom (street lamps) or top (moon)
  function wall(g, x, y, w, h, c, o = {}) {
    const gr = g.createLinearGradient(0, y, 0, y + h);
    const up = o.uplit;
    gr.addColorStop(0, shade(c, up ? -0.45 : 0.08)); gr.addColorStop(0.55, c); gr.addColorStop(1, shade(c, up ? 0.12 : -0.4));
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    if (o.side) shadowRect(g, x + w - o.side, y, o.side, h, 0.0), (() => { const s = g.createLinearGradient(x + w - o.side, 0, x + w, 0); s.addColorStop(0, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = s; g.fillRect(x + w - o.side, y, o.side, h); })();
  }
  function bricks(g, x, y, w, h, c, mortar, bw = 7, bh = 3.2) {
    g.fillStyle = mortar; g.fillRect(x, y, w, h);
    for (let yy = y, r = 0; yy < y + h; yy += bh, r++) {
      const off = r % 2 ? bw / 2 : 0;
      for (let xx = x - off; xx < x + w; xx += bw) {
        g.fillStyle = shade(c, rr(-0.18, 0.1)); g.fillRect(Math.max(x, xx + 0.6), yy + 0.6, Math.min(bw - 0.9, x + w - xx - 0.6), bh - 0.9);
      }
    }
  }
  // cheap fake-adobe plaster: flat color, mottled patches, water stains and hairline cracks
  function stucco(g, x, y, w, h, c) {
    g.fillStyle = c; g.fillRect(x, y, w, h);
    for (let i = 0; i < w * h / 90; i++) { g.fillStyle = rand() < 0.5 ? 'rgba(255,250,235,0.07)' : 'rgba(60,40,20,0.08)'; g.beginPath(); g.ellipse(x + rand() * w, y + rand() * h, rr(3, 10), rr(2, 6), 0, 0, PI * 2); g.fill(); }
    for (let i = 0; i < w / 14; i++) { const sx = x + rand() * w, sy = y + rand() * h * 0.3, sl = rr(10, h * 0.7); const gr = g.createLinearGradient(0, sy, 0, sy + sl); gr.addColorStop(0, 'rgba(70,55,35,0.35)'); gr.addColorStop(1, 'rgba(70,55,35,0)'); g.fillStyle = gr; g.fillRect(sx, sy, rr(2, 6), sl); }
    g.strokeStyle = 'rgba(40,30,20,0.4)'; g.lineWidth = 0.6;
    for (let i = 0; i < w / 30; i++) { let px = x + rand() * w, py = y + rand() * h; g.beginPath(); g.moveTo(px, py); for (let j = 0; j < 4; j++) { px += rr(-6, 6); py += rr(3, 9); g.lineTo(px, py); } g.stroke(); }
    speckle(g, x, y, w, h, w * h / 6, 0.12, 0.08);
  }
  function stones(g, x, y, w, h, c, sw = 16, sh = 8) {
    g.fillStyle = shade(c, -0.45); g.fillRect(x, y, w, h);
    for (let yy = y, r = 0; yy < y + h; yy += sh, r++) {
      const off = r % 2 ? sw * 0.5 : 0;
      for (let xx = x - off; xx < x + w; xx += sw) {
        const cx = Math.max(x, xx + 0.7), cw = Math.min(sw - 1.2, x + w - cx);
        if (cw <= 0) continue;
        const gr = g.createLinearGradient(0, yy, 0, yy + sh); const t = rr(-0.12, 0.06);
        gr.addColorStop(0, shade(c, t + 0.1)); gr.addColorStop(1, shade(c, t - 0.15));
        g.fillStyle = gr; g.fillRect(cx, yy + 0.7, cw, sh - 1.2);
      }
    }
  }
  // a window: dark glass catching a little sky, or lit from inside with a warm bloom
  function win(g, x, y, w, h, lit, warm = '#ffcc70', frame = '#1a1612') {
    g.fillStyle = frame; g.fillRect(x - 1, y - 1, w + 2, h + 2);
    if (lit) { vg(g, x, y, w, h, [shade(warm, 0.25), warm, shade(warm, -0.35)]); glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 1.6, warm, 0.22); }
    else { vg(g, x, y, w, h, ['#3a4458', '#1a2030', '#0c1018']); g.fillStyle = 'rgba(180,200,230,0.12)'; g.fillRect(x, y, w * 0.35, h); }
  }
  function moon(g, x, y, r, c = '#efe8cf') {
    glow(g, x, y, r * 6, 'rgba(200,210,255,0.35)');
    glow(g, x, y, r * 2.4, 'rgba(230,230,255,0.45)');
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); gr.addColorStop(0, '#fffdf0'); gr.addColorStop(0.7, c); gr.addColorStop(1, shade(c, -0.25));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(120,110,90,0.25)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + rr(-r, r) * 0.6, y + rr(-r, r) * 0.6, rr(1, r * 0.25), 0, PI * 2); g.fill(); }
  }
  function stars(g, n, h, w = BW) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.6})`; g.fillRect(rand() * w, rand() * h, 1, 1); } }
  // soft painted clouds, lit on one side by the moon or the city glow
  function clouds(g, y0, y1, n, dark, light, lx = 0) {
    for (let i = 0; i < n; i++) {
      const x = rand() * BW, y = rr(y0, y1), w = rr(40, 140), h = w * rr(0.18, 0.35);
      g.globalAlpha = 0.55;
      for (let j = 0; j < 12; j++) {
        const cx = x + rr(-w, w) * 0.55, cy = y + rr(-h, h) * 0.35, r = rr(h * 0.9, h * 1.8);
        const gr = g.createRadialGradient(cx + lx * r * 0.25, cy - r * 0.3, 0, cx, cy, r);
        gr.addColorStop(0, light); gr.addColorStop(0.35, dark); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      g.globalAlpha = 1;
    }
  }
  function fog(g, y, h, c, w = BW) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, y, w, h); }
  function treeline(g, y, n, c, h0, h1, w = BW, lit) {
    for (let i = 0; i < n; i++) {
      const x = rand() * w, h = rr(h0, h1);
      for (let j = 0; j < 6; j++) { const cx = x + rr(-h, h) * 0.3, cy = y - h * rr(0.45, 0.9), r = h * rr(0.22, 0.38); g.fillStyle = shade(c, rr(-0.15, 0.05)); g.beginPath(); g.arc(cx, cy, r, 0, PI * 2); g.fill(); if (lit) { g.fillStyle = lit; g.beginPath(); g.arc(cx - r * 0.3, cy - r * 0.35, r * 0.45, 0, PI * 2); g.fill(); } }
      g.fillStyle = shade(c, -0.3); g.fillRect(x - 1.5, y - h * 0.4, 3, h * 0.4);
    }
  }
  function tree(g, x, y, h, c, lit) {
    g.fillStyle = '#140e0a'; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x - 1.5, y - h * 0.5); g.lineTo(x + 1.5, y - h * 0.5); g.lineTo(x + 3, y); g.fill();
    for (let j = 0; j < 14; j++) { const cx = x + rr(-h, h) * 0.32, cy = y - h * rr(0.45, 0.95), r = h * rr(0.14, 0.26); g.fillStyle = shade(c, rr(-0.25, 0.05)); g.beginPath(); g.arc(cx, cy, r, 0, PI * 2); g.fill(); if (lit && rand() < 0.6) { g.fillStyle = lit; g.beginPath(); g.arc(cx + r * 0.25, cy + r * 0.3, r * 0.5, 0, PI * 2); g.fill(); } }
  }
  function lamp(g, x, y, h, c = 'rgba(255,220,150,0.9)') {
    g.fillStyle = '#0c0c0e'; g.fillRect(x - 1.2, y - h, 2.4, h); g.fillRect(x - 3, y - 4, 6, 4);
    g.fillStyle = '#0c0c0e'; g.beginPath(); g.moveTo(x - 4, y - h); g.lineTo(x + 4, y - h); g.lineTo(x + 2.5, y - h - 7); g.lineTo(x - 2.5, y - h - 7); g.fill();
    g.fillStyle = '#ffe6b0'; g.fillRect(x - 2, y - h - 6, 4, 5);
    glow(g, x, y - h - 3, 34, c, 0.55); glow(g, x, y - h - 3, 10, 'rgba(255,250,220,1)', 0.7);
    // light pool on the ground
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, 40); gr.addColorStop(0, 'rgba(255,200,130,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 40, 8, 0, 0, PI * 2); g.fill(); g.restore();
  }
  function flag(g, x, top, c) { g.fillStyle = '#6a6a72'; g.fillRect(x - 0.8, top, 1.6, FY - top); g.fillStyle = '#c8b060'; g.fillRect(x - 1.5, top - 2, 3, 2); g.fillStyle = c; g.beginPath(); g.moveTo(x + 1, top + 1); g.quadraticCurveTo(x + 9, top - 1, x + 17, top + 3); g.lineTo(x + 17, top + 12); g.quadraticCurveTo(x + 9, top + 8, x + 1, top + 10); g.fill(); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 9, top + 1, 8, 10); }
  function vignette(g, w) { const gr = g.createRadialGradient(w / 2, H * 0.55, H * 0.4, w / 2, H * 0.55, w * 0.62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, w, H); }
  // MK-style perspective floor, lines converge to a vanishing point above the middle of the arena
  function pfloor(g, kind, c1, c2, o = {}) {
    const w = AWX, vx = w / 2, y0 = FY, y1 = H;
    vg(g, 0, y0, w, y1 - y0, [c1, c2]);
    const rows = o.rows || 9, span = o.span || 34;
    const ry = t => y0 + (y1 - y0) * Math.pow(t, 1.7);
    // tiles
    for (let r = 0; r < rows; r++) {
      const ya = ry(r / rows), yb = ry((r + 1) / rows), sa = (ya - VY) / (y1 - VY), sb = (yb - VY) / (y1 - VY);
      for (let i = -40; i <= 40; i++) {
        const off = kind === 'brick' && r % 2 ? 0.5 : 0;
        const xa0 = vx + (i + off) * span * sa, xa1 = vx + (i + 1 + off) * span * sa, xb0 = vx + (i + off) * span * sb, xb1 = vx + (i + 1 + off) * span * sb;
        if (Math.max(xa1, xb1) < 0 || Math.min(xa0, xb0) > w) continue;
        const t = rr(-0.12, 0.08);
        g.fillStyle = shade(r % 2 ^ (i & 1) && kind === 'check' ? c2 : c1, t - (1 - r / rows) * 0.25);
        g.beginPath(); g.moveTo(xa0 + 0.6, ya + 0.6); g.lineTo(xa1 - 0.6, ya + 0.6); g.lineTo(xb1 - 0.6, yb - 0.6); g.lineTo(xb0 + 0.6, yb - 0.6); g.closePath(); g.fill();
        if (rand() < 0.15) { g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(rr(xa0, xa1), ya + 1); g.lineTo(rr(xb0, xb1), yb - 1); g.stroke(); }
      }
    }
    speckle(g, 0, y0, w, y1 - y0, 2200, 0.4, 0.1);
    // depth darkening toward the back
    const dg = g.createLinearGradient(0, y0, 0, y0 + 26); dg.addColorStop(0, 'rgba(0,0,0,0.6)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = dg; g.fillRect(0, y0, w, 26);
    if (o.wet) { for (let i = 0; i < 16; i++) { const x = rand() * w, y = rr(y0 + 10, y1 - 4); g.fillStyle = 'rgba(160,180,220,0.12)'; g.beginPath(); g.ellipse(x, y, rr(10, 40), rr(1, 3), 0, 0, PI * 2); g.fill(); } }
    if (o.edge) { g.fillStyle = o.edge; g.fillRect(0, y0 - 2, w, 3); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y0 - 2, w, 1); }
  }
  // dithered color reduction so backdrops match the digitized fighters
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function digitize(c, step = 14, sat = 0.82, gain = 1) {
    const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data, w = c.width;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (d[i + 3] < 8) continue;
      const x = p % w, y = (p / w) | 0, n = (BAY[(y & 3) * 4 + (x & 3)] - 7.5) * step / 16 + (rand() - 0.5) * 10;
      let r = d[i] * gain, gg = d[i + 1] * gain, b = d[i + 2] * gain;
      const l = 0.3 * r + 0.59 * gg + 0.11 * b;
      r = l + (r - l) * sat + n; gg = l + (gg - l) * sat + n; b = l + (b - l) * sat + n;
      d[i] = Math.round(r / step) * step; d[i + 1] = Math.round(gg / step) * step; d[i + 2] = Math.round(b / step) * step;
    }
    g.putImageData(img, 0, 0);
  }

  // ---------- CITY HALL, downtown at night in the rain ----------
  function cityhall(B, F, hell) {
    vg(B, 0, 0, BW, H, hell ? ['#0e0000', '#4a0606', '#a02808', '#ff6a1a'] : ['#04040c', '#0e0e22', '#2a1a34', '#5a2a2a']);
    if (!hell) stars(B, 40, 70);
    clouds(B, 10, 90, 22, hell ? 'rgba(90,10,0,0.5)' : 'rgba(40,30,55,0.6)', hell ? 'rgba(255,120,40,0.5)' : 'rgba(150,90,80,0.35)', 0);
    // downtown silhouettes: AT&T tower, Cornerstone's crenellated tower, office blocks
    seed = 31;
    for (let i = 0; i < 22; i++) {
      const x = i * 62 + rr(-10, 10), w = rr(40, 60), h = rr(50, 120), top = FY - 30 - h;
      wall(B, x, top, w, h + 30, hell ? '#2a0a08' : '#1a1a26', { uplit: true });
      for (let yy = top + 6; yy < FY - 10; yy += 8) for (let xx = x + 4; xx < x + w - 5; xx += 7) if (rand() < 0.28) win(B, xx, yy, 3, 4, true, hell ? '#ff6a30' : rand() < 0.5 ? '#ffd080' : '#c8d8ff', '#0a0a10');
    }
    // AT&T tower: tall windowless beige slab with the blue globe
    wall(B, 360, 12, 46, 190, hell ? '#5a2818' : '#4a443c', { uplit: true, side: 14 }); grime(B, 360, 12, 46, 190, 18, 0.35);
    B.fillStyle = hell ? '#ff4a10' : '#2a6ad0'; B.beginPath(); B.arc(383, 30, 6, 0, PI * 2); B.fill(); glow(B, 383, 30, 20, hell ? 'rgba(255,80,20,0.6)' : 'rgba(80,140,255,0.6)');
    glow(B, 383, 12, 6, 'rgba(255,40,40,0.9)');
    // Cornerstone: red brick tower with battlements
    bricks(B, 860, 40, 50, 160, hell ? '#5a1a10' : '#4a2018', '#1a0a08', 6, 3); shadowRect(B, 880, 40, 30, 160, 0); B.fillStyle = 'rgba(0,0,0,0.35)'; B.fillRect(890, 40, 20, 160);
    for (let i = 0; i < 5; i++) B.fillRect(860 + i * 10, 33, 6, 8);
    for (let y = 52; y < 180; y += 22) { win(B, 870, y, 5, 10, rand() < 0.4, '#ffb060'); win(B, 890, y, 5, 10, rand() < 0.3, '#ffb060'); }
    fog(B, 120, 70, hell ? 'rgba(120,20,0,0.45)' : 'rgba(60,40,70,0.45)');
    // City Hall: cream stone, tall arched glass entry, dark glass wings
    const m = CX, s = 1.45;
    const wingW = 120 * s / 1.45 * 1.2, wy = FY - 120;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? m - 52 - wingW : m + 52;
      stucco(B, x0, wy, wingW, FY - wy, hell ? '#8a5a48' : '#b8ae98');
      wall(B, x0, wy, wingW, FY - wy, 'rgba(0,0,0,0)');
      B.fillStyle = 'rgba(10,8,20,0.35)'; B.fillRect(x0, wy, wingW, FY - wy);
      B.fillStyle = hell ? '#3a1a10' : '#2a5a6a'; B.fillRect(x0 - 3, wy - 7, wingW + 6, 7); B.fillStyle = 'rgba(255,255,255,0.15)'; B.fillRect(x0 - 3, wy - 7, wingW + 6, 1);
      // dark glass bands, lit at night
      const gx = x0 + 12, gw = wingW - 24;
      B.fillStyle = '#0e1420'; B.fillRect(gx, wy + 12, gw, 18); B.fillRect(gx + 6, wy + 40, gw - 12, 68);
      for (let i = 0; i < 6; i++) { win(B, gx + 7 + i * (gw - 14) / 6, wy + 44, (gw - 14) / 6 - 2, 30, rand() < 0.7, hell ? '#ff7a30' : '#ffcf80', '#141c28'); win(B, gx + 7 + i * (gw - 14) / 6, wy + 77, (gw - 14) / 6 - 2, 28, rand() < 0.6, hell ? '#ff7a30' : '#ffcf80', '#141c28'); }
      for (let i = 0; i < 5; i++) win(B, gx + 2 + i * gw / 5, wy + 14, gw / 5 - 3, 14, false);
    }
    // central pavilion with the arched glass entry
    const cw = 104, ctop = FY - 175;
    B.beginPath(); B.moveTo(m - cw / 2, FY); B.lineTo(m - cw / 2, ctop + 34); B.lineTo(m, ctop); B.lineTo(m + cw / 2, ctop + 34); B.lineTo(m + cw / 2, FY); B.closePath();
    B.save(); B.clip(); stucco(B, m - cw / 2, ctop, cw, FY - ctop, hell ? '#a06a50' : '#d8ccb0'); vg(B, m - cw / 2, ctop, cw, FY - ctop, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'rgba(255,200,140,0.15)']); B.restore();
    B.fillStyle = 'rgba(0,0,0,0.4)'; B.fillRect(m + cw / 2 - 16, ctop + 34, 16, FY - ctop - 34);
    // the arch
    const ax = m - 32, aw = 64, atop = ctop + 46;
    B.fillStyle = '#16100c'; B.beginPath(); B.moveTo(ax - 3, FY - 30); B.lineTo(ax - 3, atop + 32); B.arc(m, atop + 32, 35, PI, 0); B.lineTo(ax + aw + 3, FY - 30); B.fill();
    B.save(); B.beginPath(); B.moveTo(ax, FY - 30); B.lineTo(ax, atop + 32); B.arc(m, atop + 32, 32, PI, 0); B.lineTo(ax + aw, FY - 30); B.closePath(); B.clip();
    vg(B, ax, atop, aw, FY - atop, hell ? ['#ff9a40', '#ff4a10', '#8a1800'] : ['#5a6a8a', '#e8b868', '#ffdc90']);
    B.fillStyle = 'rgba(40,30,20,0.85)'; for (let i = 1; i < 6; i++) B.fillRect(ax + i * aw / 6 - 0.6, atop, 1.2, 140); for (let j = 0; j < 9; j++) B.fillRect(ax, atop + 8 + j * 13, aw, 1.2);
    B.restore();
    glow(B, m, FY - 70, 90, hell ? 'rgba(255,80,10,0.55)' : 'rgba(255,200,120,0.4)');
    B.fillStyle = hell ? '#6a3a28' : '#cfc3a6'; B.fillRect(m - 40, FY - 34, 80, 8); B.fillStyle = '#0e0a08'; B.fillRect(m - 12, FY - 26, 24, 26);
    B.fillStyle = hell ? '#2a0a04' : '#3a3428'; B.font = '6px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('CITY OF MUNCIE', m, FY - 28.5); B.textAlign = 'left';
    B.fillStyle = hell ? '#ffb070' : '#e8e0c8'; B.font = '9px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('CITY HALL', m, ctop + 30); B.textAlign = 'left';
    for (let i = 0; i < 3; i++) { B.fillStyle = hell ? '#7a4a38' : '#bdb19a'; B.fillRect(m - 46 - i * 6, FY - 6 + i * 2, 92 + i * 12, 2); }
    // flags + trees + uplights
    flag(B, m - 160, FY - 200, hell ? '#2a0000' : '#2a52a8'); flag(B, m + 160, FY - 200, '#b8202a');
    tree(B, m - 118, FY, 52, hell ? '#2a0a04' : '#14281a', hell ? 'rgba(255,90,20,0.25)' : 'rgba(255,190,110,0.18)'); tree(B, m + 118, FY, 50, hell ? '#2a0a04' : '#14281a', hell ? 'rgba(255,90,20,0.25)' : 'rgba(255,190,110,0.18)');
    for (const x of [m - 62, m + 62]) glow(B, x, FY - 10, 40, hell ? 'rgba(255,60,0,0.45)' : 'rgba(255,220,160,0.35)');
    fog(B, FY - 30, 40, hell ? 'rgba(140,20,0,0.35)' : 'rgba(70,60,90,0.3)');
    vignette(B, BW);
    // wet brick plaza
    pfloor(F, 'brick', hell ? '#4a1a10' : '#3a2a26', hell ? '#2a0804' : '#1a1416', { rows: 11, span: 26, wet: true, edge: hell ? '#5a2a1a' : '#5a5250' });
    for (const x of [130, 330, 770, 970]) lamp(F, x, FY + 4, 72, hell ? 'rgba(255,90,30,0.9)' : 'rgba(255,210,140,0.9)');
  }

  // ---------- BENEFICENCE on the Ball State campus, foggy night ----------
  function benny(B, F) {
    vg(B, 0, 0, BW, H, ['#02030a', '#0a1222', '#18203a', '#2a2a40']);
    stars(B, 120, 90); moon(B, 470, 40, 15);
    clouds(B, 20, 80, 14, 'rgba(30,40,60,0.55)', 'rgba(170,180,210,0.35)', -1);
    // campus brick halls and the Shafer bell tower in the fog
    seed = 41;
    for (const [x, w, h] of [[150, 170, 80], [330, 120, 70], [820, 150, 86], [990, 170, 74]]) {
      bricks(B, x, FY - h, w, h, '#4a2420', '#1a0c0a', 7, 3.2); B.fillStyle = 'rgba(10,14,30,0.5)'; B.fillRect(x, FY - h, w, h);
      for (let yy = FY - h + 10; yy < FY - 14; yy += 18) for (let xx = x + 8; xx < x + w - 10; xx += 16) win(B, xx, yy, 7, 10, rand() < 0.35, '#ffcc80');
      B.fillStyle = '#121014'; B.beginPath(); B.moveTo(x - 4, FY - h); B.lineTo(x + w / 2, FY - h - 16); B.lineTo(x + w + 4, FY - h); B.fill();
    }
    bricks(B, 1010, 40, 22, 80, '#4a2420', '#1a0c0a', 5, 3); B.fillStyle = 'rgba(10,14,30,0.4)'; B.fillRect(1010, 40, 22, 80);
    B.fillStyle = '#0e0c10'; B.beginPath(); B.moveTo(1006, 40); B.lineTo(1021, 14); B.lineTo(1036, 40); B.fill(); win(B, 1016, 52, 10, 14, true, '#ffe0a0');
    fog(B, 90, 100, 'rgba(90,110,140,0.4)');
    treeline(B, FY, 40, '#0a1410', 30, 70, BW, 'rgba(120,140,170,0.12)');
    fog(B, 140, 60, 'rgba(110,130,160,0.35)');
    // Benny: two white stone pylons with black lanterns, bronze winged figure on a pedestal
    const m = CX, S = 0.92;
    tree(B, m - 128, FY, 90, '#0c1a10', 'rgba(140,170,200,0.14)'); tree(B, m + 128, FY, 96, '#0c1a10', 'rgba(140,170,200,0.14)'); tree(B, m - 60, FY - 20, 70, '#0a160e', 'rgba(140,170,200,0.12)'); tree(B, m + 60, FY - 20, 66, '#0a160e', 'rgba(140,170,200,0.12)');
    for (const d of [-78, 78]) {
      const c = m + d, top = FY - 140;
      stones(B, c - 8, top, 16, FY - top, '#d8d2c0', 16, 8); vg(B, c - 8, top, 16, FY - top, ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)', 'rgba(255,240,210,0.2)']);
      B.fillStyle = 'rgba(0,0,0,0.35)'; B.fillRect(c + 3, top, 5, FY - top);
      B.fillStyle = '#e8e2d0'; B.fillRect(c - 12, top - 10, 24, 10); B.fillRect(c - 13, FY - 10, 26, 10);
      B.fillStyle = '#0a0a0a'; B.fillRect(c - 7, top - 26, 14, 16); B.fillRect(c - 2, top - 34, 4, 8);
      win(B, c - 4, top - 23, 8, 10, true, '#ffe6a0', '#0a0a0a'); glow(B, c, top - 18, 30, 'rgba(255,220,150,0.6)');
    }
    // pedestal + uplight
    stones(B, m - 18, FY - 24, 36, 24, '#3a3028', 12, 6);
    glow(B, m, FY - 20, 110, 'rgba(255,210,150,0.32)');
    // bronze wings, robe and raised arm
    const Bz = '#6a5232', Bd = '#2a1e10', Bh = '#c09a60';
    for (const sgn of [-1, 1]) {
      B.fillStyle = Bd; B.beginPath(); B.moveTo(m + sgn * 9, FY - 128 * S + 10); B.lineTo(m + sgn * 75, FY - 180 * S + 20); B.lineTo(m + sgn * 56, FY - 140 * S + 14); B.lineTo(m + sgn * 66, FY - 130 * S + 10); B.lineTo(m + sgn * 42, FY - 112 * S + 8); B.lineTo(m + sgn * 12, FY - 110 * S + 6); B.fill();
      B.fillStyle = Bz; B.beginPath(); B.moveTo(m + sgn * 9, FY - 128 * S + 12); B.lineTo(m + sgn * 71, FY - 176 * S + 20); B.lineTo(m + sgn * 54, FY - 140 * S + 14); B.lineTo(m + sgn * 62, FY - 131 * S + 10); B.lineTo(m + sgn * 40, FY - 114 * S + 8); B.lineTo(m + sgn * 12, FY - 113 * S + 6); B.fill();
      B.strokeStyle = Bd; B.lineWidth = 1; for (let i = 0; i < 6; i++) { B.beginPath(); B.moveTo(m + sgn * 12, FY - 122 * S + 10 + i * 3); B.lineTo(m + sgn * (64 - i * 4), FY - 166 * S + 18 + i * 9); B.stroke(); }
      B.strokeStyle = Bh; B.beginPath(); B.moveTo(m + sgn * 14, FY - 124 * S + 10); B.lineTo(m + sgn * 66, FY - 170 * S + 20); B.stroke();
    }
    B.fillStyle = Bd; B.beginPath(); B.moveTo(m - 12, FY - 132 * S + 14); B.lineTo(m + 12, FY - 132 * S + 14); B.lineTo(m + 19, FY - 24); B.lineTo(m - 19, FY - 24); B.fill();
    const rg = B.createLinearGradient(m - 18, 0, m + 18, 0); rg.addColorStop(0, Bh); rg.addColorStop(0.4, Bz); rg.addColorStop(1, Bd);
    B.fillStyle = rg; B.beginPath(); B.moveTo(m - 10, FY - 131 * S + 14); B.lineTo(m + 10, FY - 131 * S + 14); B.lineTo(m + 17, FY - 25); B.lineTo(m - 17, FY - 25); B.fill();
    B.strokeStyle = 'rgba(20,12,4,0.6)'; for (let i = -2; i <= 2; i++) { B.beginPath(); B.moveTo(m + i * 4, FY - 110 * S); B.lineTo(m + i * 6, FY - 26); B.stroke(); }
    B.fillStyle = Bz; B.beginPath(); B.arc(m, FY - 140 * S + 12, 8, 0, PI * 2); B.fill(); B.fillStyle = Bh; B.beginPath(); B.arc(m + 2, FY - 142 * S + 11, 4, 0, PI * 2); B.fill();
    B.strokeStyle = Bz; B.lineWidth = 4; B.beginPath(); B.moveTo(m + 7, FY - 130 * S + 12); B.lineTo(m + 20, FY - 152 * S + 12); B.stroke();
    fog(B, FY - 26, 34, 'rgba(120,140,170,0.35)');
    vignette(B, BW);
    pfloor(F, 'brick', '#5a2a22', '#2a1210', { rows: 10, span: 24, edge: '#6a6460' });
    for (const x of [200, 900]) lamp(F, x, FY + 4, 70);
  }

  // ---------- WHITE RIVER RAILROAD BRIDGE: fight on the trestle, "The Pit" style ----------
  function bridge(B, F) {
    vg(B, 0, 0, BW, H, ['#010208', '#060c1c', '#101a30', '#1a2236']);
    stars(B, 160, 120); moon(B, 820, 52, 22);
    clouds(B, 30, 110, 16, 'rgba(20,28,48,0.6)', 'rgba(180,190,220,0.3)', 1);
    seed = 57;
    treeline(B, 168, 60, '#04080a', 30, 70);
    // river far below, moonlight on the water
    vg(B, 0, 168, BW, 72, ['#0a1424', '#0e1c30', '#08101c']);
    for (let i = 0; i < 60; i++) { B.fillStyle = `rgba(230,230,210,${rr(0.08, 0.35)})`; B.fillRect(800 + rr(-50, 50) * (1 + i / 40), 172 + i * 1.1, rr(4, 18), 0.8); }
    // the concrete pier with the YOU ARE BEAUTIFUL graffiti, then the black truss running off both ways
    const px = 470;
    stones(B, px, 58, 64, 140, '#7a7a74', 22, 12); vg(B, px, 58, 64, 140, ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.45)']); grime(B, px, 58, 64, 140, 20, 0.4);
    B.fillStyle = 'rgba(0,0,0,0.4)'; B.fillRect(px + 46, 58, 18, 140);
    B.fillStyle = '#8a8a84'; B.fillRect(px - 6, 50, 76, 10);

    for (let x = -10; x < BW; x += 30) { if (x > px - 30 && x < px + 64) continue; B.strokeStyle = '#06070a'; B.lineWidth = 3; B.beginPath(); B.moveTo(x, 150); B.lineTo(x + 15, 100); B.lineTo(x + 30, 150); B.stroke(); B.strokeStyle = 'rgba(160,170,200,0.25)'; B.lineWidth = 0.8; B.beginPath(); B.moveTo(x + 1, 150); B.lineTo(x + 16, 100); B.stroke(); }
    B.fillStyle = '#06070a'; B.fillRect(0, 96, px - 6, 6); B.fillRect(px + 70, 96, BW, 6); B.fillRect(0, 150, BW, 8);
    B.fillStyle = 'rgba(160,170,200,0.25)'; B.fillRect(0, 96, BW, 1);
    // a solid riveted plate girder span, with YOU ARE BEAUT painted down its side
    const gx0 = 560, gx1 = 900;
    vg(B, gx0, 100, gx1 - gx0, 52, ['#1a1c22', '#121318', '#0a0a0e']);
    B.fillStyle = 'rgba(150,160,190,0.2)'; B.fillRect(gx0, 100, gx1 - gx0, 1.2);
    for (let x = gx0 + 8; x < gx1; x += 34) { B.fillStyle = 'rgba(0,0,0,0.45)'; B.fillRect(x, 101, 3, 50); B.fillStyle = 'rgba(160,170,200,0.12)'; B.fillRect(x - 1, 101, 1, 50); }
    for (let x = gx0 + 4; x < gx1; x += 6) { B.fillStyle = 'rgba(170,180,200,0.25)'; B.fillRect(x, 104, 1, 1); B.fillRect(x, 147, 1, 1); }
    B.font = '26px Anton, Impact, sans-serif'; B.textAlign = 'left';
    let tx = gx0 + 28;
    for (const [t, c] of [['YOU', '#ff3a8a'], ['ARE', '#ffd040'], ['BEAUT', '#30e8ff']]) {
      B.fillStyle = '#050505'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) B.fillText(t, tx + dx, 138 + dy);
      B.fillStyle = shade(c, -0.2); B.fillText(t, tx, 138); B.fillStyle = 'rgba(255,255,255,0.18)'; B.fillText(t, tx, 136.5);
      const w = B.measureText(t).width; for (let i = 0; i < 3; i++) { B.fillStyle = shade(c, -0.35); B.fillRect(tx + rr(4, w - 4), 139, 1.4, rr(3, 9)); }
      tx += w + 16;
    }
    for (const x of [200, 760, 1060]) { stones(B, x, 158, 30, 82, '#4a4a48', 15, 8); B.fillStyle = 'rgba(0,0,0,0.5)'; B.fillRect(x + 18, 158, 12, 82); }
    fog(B, 150, 60, 'rgba(60,80,110,0.35)');
    vignette(B, BW);
    // the deck: railroad ties over the void
    F.fillStyle = '#050505'; F.fillRect(0, FY - 6, AWX, H - FY + 6);
    for (let x = 0; x < AWX; x += 9) { const gr = F.createLinearGradient(0, FY - 2, 0, H); gr.addColorStop(0, '#4a3a2a'); gr.addColorStop(1, '#2a1e14'); F.fillStyle = gr; F.beginPath(); F.moveTo(x + (x - AWX / 2) * -0.15, FY - 2); F.lineTo(x + 6 + (x - AWX / 2) * -0.15, FY - 2); F.lineTo(x + 7, H); F.lineTo(x, H); F.fill(); }
    speckle(F, 0, FY, AWX, H - FY, 1800, 0.45, 0.08);
    for (const y of [FY + 6, FY + 26]) { F.fillStyle = '#5a5a60'; F.fillRect(0, y, AWX, 2.5); F.fillStyle = '#b0b0b8'; F.fillRect(0, y, AWX, 0.8); }
    F.fillStyle = '#121214'; F.fillRect(0, FY - 8, AWX, 4); for (let x = 0; x < AWX; x += 26) F.fillRect(x, FY - 26, 2.5, 20); F.fillRect(0, FY - 27, AWX, 2.5);
    const dg = F.createLinearGradient(0, FY - 6, 0, FY + 16); dg.addColorStop(0, 'rgba(0,0,0,0.6)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); F.fillStyle = dg; F.fillRect(0, FY - 6, AWX, 22);
  }

  // ---------- MINNETRISTA at dusk ----------
  function minnetrista(B, F) {
    vg(B, 0, 0, BW, H, ['#0a0614', '#2a0e2a', '#6a2a2a', '#c86a3a']);
    clouds(B, 20, 100, 18, 'rgba(60,20,40,0.55)', 'rgba(255,150,90,0.4)', 1);
    glow(B, 900, 150, 140, 'rgba(255,130,60,0.35)');
    seed = 71;
    treeline(B, FY - 20, 40, '#0e0a0a', 40, 80, BW, 'rgba(255,120,60,0.12)');
    // Ball mansions: tan brick colonial, sandstone Richardsonian with red tile roof, red brick Georgian
    const mansion = (x, w, h, c, roof, kind) => {
      bricks(B, x, FY - h, w, h, c, shade(c, -0.6), 7, 3.2); B.fillStyle = 'rgba(30,10,30,0.45)'; B.fillRect(x, FY - h, w, h);
      B.fillStyle = roof; B.beginPath(); B.moveTo(x - 6, FY - h); B.lineTo(x + w * 0.18, FY - h - 24); B.lineTo(x + w * 0.82, FY - h - 24); B.lineTo(x + w + 6, FY - h); B.fill();
      B.fillStyle = 'rgba(255,140,80,0.2)'; B.fillRect(x + w * 0.18, FY - h - 24, w * 0.64, 2);
      for (let yy = FY - h + 10; yy < FY - 16; yy += 24) for (let xx = x + 8; xx < x + w - 10; xx += 20) win(B, xx, yy, 8, 14, rand() < 0.45, '#ffc070', '#d8cbb0');
      if (kind === 'cols') { B.fillStyle = '#d8d0bc'; for (let c2 = 0; c2 < 4; c2++) B.fillRect(x + w * 0.3 + c2 * w * 0.12, FY - h, 4, h); }
      if (kind === 'arch') { B.fillStyle = '#0c0808'; B.beginPath(); B.moveTo(x + w * 0.6, FY); B.lineTo(x + w * 0.6, FY - 26); B.arc(x + w * 0.7, FY - 26, w * 0.1, PI, 0); B.lineTo(x + w * 0.8, FY); B.fill(); }
    };
    mansion(120, 150, 90, '#8a6a48', '#2a2a26', 'dorm'); mansion(300, 130, 100, '#8a7a62', '#6a1a10', 'arch'); mansion(840, 150, 92, '#7a2a1a', '#3a1a10', 'cols'); mansion(1020, 140, 84, '#8a6a48', '#2a2a26');
    fog(B, 110, 80, 'rgba(120,50,50,0.35)');
    // Minnetrista: cream pavilion, dark clerestory, lit gallery, gold doors, colonnade arms, the steel ring sculpture
    const m = CX;
    for (const [a, b] of [[m - 190, m - 60], [m + 60, m + 190]]) { B.fillStyle = '#b8ac90'; B.fillRect(a, FY - 52, b - a, 6); for (let c = a + 4; c < b - 4; c += 20) { vg(B, c, FY - 46, 6, 46, ['#d8ccb0', '#8a8070']); } }
    B.fillStyle = '#2a2a32'; B.beginPath(); B.moveTo(m - 120, FY - 60); B.lineTo(m - 64, FY - 106); B.lineTo(m - 64, FY - 50); B.fill(); B.beginPath(); B.moveTo(m + 120, FY - 60); B.lineTo(m + 64, FY - 106); B.lineTo(m + 64, FY - 50); B.fill();
    B.beginPath(); B.moveTo(m - 64, FY); B.lineTo(m - 64, FY - 106); B.lineTo(m - 46, FY - 130); B.lineTo(m + 46, FY - 130); B.lineTo(m + 64, FY - 106); B.lineTo(m + 64, FY); B.closePath();
    B.save(); B.clip(); stones(B, m - 64, FY - 130, 128, 130, '#d0c2a0', 18, 9); vg(B, m - 64, FY - 130, 128, 130, ['rgba(255,150,90,0.25)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.45)']); B.restore();
    B.fillStyle = '#0e1220'; B.beginPath(); B.moveTo(m - 42, FY - 128); B.lineTo(m + 42, FY - 128); B.lineTo(m + 52, FY - 108); B.lineTo(m - 52, FY - 108); B.fill();
    for (let i = -3; i <= 3; i++) { B.fillStyle = 'rgba(255,170,110,0.35)'; B.fillRect(m + i * 13, FY - 127, 1, 18); }
    B.fillStyle = '#1a1c24'; B.fillRect(m - 48, FY - 98, 96, 30);
    for (let i = 0; i < 4; i++) win(B, m - 42 + i * 22, FY - 94, 16, 20, true, '#ffb060', '#1a1c24');
    B.fillStyle = '#8a8478'; B.fillRect(m - 52, FY - 66, 104, 6);
    B.fillStyle = '#0e0c10'; B.fillRect(m - 30, FY - 56, 60, 56); win(B, m - 24, FY - 48, 20, 48, true, '#ffc860', '#0e0c10'); win(B, m + 4, FY - 48, 20, 48, true, '#ffc860', '#0e0c10');
    glow(B, m, FY - 30, 70, 'rgba(255,190,100,0.35)');
    B.fillStyle = '#f0e0c0'; B.font = '10px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('MINNETRISTA', m, FY - 136); B.textAlign = 'left';
    B.strokeStyle = '#1a1a1e'; B.lineWidth = 6; B.beginPath(); B.ellipse(m - 92, FY - 60, 26, 38, 0.5, 0, PI * 2); B.stroke(); B.strokeStyle = 'rgba(255,160,100,0.5)'; B.lineWidth = 1.5; B.beginPath(); B.ellipse(m - 92, FY - 60, 26, 38, 0.5, -2.4, -0.6); B.stroke();
    B.strokeStyle = '#141418'; B.lineWidth = 4; B.beginPath(); B.ellipse(m - 92, FY - 60, 14, 33, -0.4, 0, PI * 2); B.stroke();
    // Appeal to the Great Spirit silhouette on its plinth
    const sx = m + 200;
    B.fillStyle = '#100c0a'; B.fillRect(sx - 22, FY - 38, 44, 38);
    B.beginPath(); B.moveTo(sx - 22, FY - 40); B.quadraticCurveTo(sx - 4, FY - 56, sx + 20, FY - 46); B.lineTo(sx + 26, FY - 40); B.fill();
    B.beginPath(); B.moveTo(sx + 14, FY - 48); B.lineTo(sx + 22, FY - 66); B.lineTo(sx + 30, FY - 70); B.lineTo(sx + 32, FY - 62); B.lineTo(sx + 22, FY - 48); B.fill();
    B.beginPath(); B.moveTo(sx - 4, FY - 52); B.lineTo(sx - 2, FY - 86); B.lineTo(sx + 4, FY - 88); B.lineTo(sx + 6, FY - 52); B.fill(); B.beginPath(); B.arc(sx + 1, FY - 92, 4, 0, PI * 2); B.fill();
    B.lineWidth = 3; B.strokeStyle = '#100c0a'; B.beginPath(); B.moveTo(sx, FY - 84); B.lineTo(sx - 18, FY - 98); B.moveTo(sx + 3, FY - 84); B.lineTo(sx + 20, FY - 96); B.stroke();
    B.strokeStyle = 'rgba(255,150,90,0.5)'; B.lineWidth = 0.8; B.beginPath(); B.moveTo(sx + 5, FY - 86); B.lineTo(sx + 6, FY - 52); B.stroke();
    fog(B, FY - 30, 36, 'rgba(120,60,50,0.35)');
    vignette(B, BW);
    pfloor(F, 'stone', '#6a5a48', '#2a2018', { rows: 9, span: 40, edge: '#7a6e5a' });
    F.fillStyle = 'rgba(200,90,20,0.6)'; for (let i = 0; i < 260; i++) { F.fillRect(rand() * AWX, FY + rand() * (H - FY), 1.6, 1); }
  }

  // ---------- OLD WEST END: Gillespie Tower at night ----------
  function westend(B, F) {
    vg(B, 0, 0, BW, H, ['#020206', '#0a0a18', '#1a1428', '#2a1a24']);
    stars(B, 80, 80); moon(B, 300, 34, 11, '#e8d8c8');
    clouds(B, 10, 90, 14, 'rgba(30,25,40,0.6)', 'rgba(120,100,120,0.3)', -1);
    seed = 83;
    // old houses with porches and FOR SALE signs
    const house = (x, w, h, c) => {
      wall(B, x, FY - h, w, h, c, { uplit: true }); for (let r = FY - h + 3; r < FY; r += 4) { B.fillStyle = 'rgba(0,0,0,0.25)'; B.fillRect(x, r, w, 0.8); }
      B.fillStyle = '#0a0a0e'; B.beginPath(); B.moveTo(x - 6, FY - h); B.lineTo(x + w / 2, FY - h - w * 0.35); B.lineTo(x + w + 6, FY - h); B.fill();
      win(B, x + 8, FY - h + 10, 10, 14, rand() < 0.4, '#ffb060'); win(B, x + w - 18, FY - h + 10, 10, 14, rand() < 0.3, '#ffb060');
      B.fillStyle = '#121014'; B.fillRect(x - 4, FY - 24, w + 8, 3); for (let c = 0; c < 4; c++) B.fillRect(x - 2 + c * (w + 4) / 3, FY - 22, 2, 22);
    };
    for (const [x, w, h, c] of [[110, 80, 62, '#4a4436'], [220, 70, 56, '#3a3a40'], [870, 86, 64, '#4a3a2a'], [990, 76, 58, '#3a4038']]) house(x, w, h, c);
    for (const x of [200, 960]) { B.fillStyle = '#0a0a0a'; B.fillRect(x, FY - 26, 2, 26); B.fillStyle = '#d8d2c4'; B.fillRect(x - 10, FY - 34, 22, 12); B.fillStyle = '#a02020'; B.font = '5px Anton, Impact, sans-serif'; B.fillText('FOR SALE', x - 9, FY - 26); }
    treeline(B, FY, 18, '#060a08', 50, 90, BW);
    fog(B, 120, 70, 'rgba(50,40,70,0.4)');
    // Gillespie Tower: V-shaped brick high-rise, gray concrete balcony bands, lit rooms
    const m = CX, top = 8, mid = 34, xl = m - 136, xr = m + 136;
    const ry = c => c < m ? mid + (top - mid) * (m - c) / (m - xl) : mid + (top - mid) * (c - m) / (xr - m);
    B.save(); B.beginPath(); B.moveTo(xl, top); B.lineTo(m, mid); B.lineTo(xr, top); B.lineTo(xr, FY); B.lineTo(xl, FY); B.closePath(); B.clip();
    bricks(B, xl, top, xr - xl, FY - top, '#6a2a1e', '#200a06', 6, 3);
    hgf(B, xl, top, m - xl, FY - top, ['rgba(120,100,140,0.18)', 'rgba(0,0,0,0.1)']); hgf(B, m, top, xr - m, FY - top, ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.55)']);
    vg(B, xl, top, xr - xl, FY - top, ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0)', 'rgba(255,190,120,0.12)']);
    for (let wing = 0; wing < 2; wing++) for (let c = 0; c < 5; c++) {
      const xc = wing ? m + 10 + c * 25 : m - 32 - c * 25, yb = ry(xc + 8);
      for (let f = 0; f < 9; f++) {
        const y = yb + 10 + f * 16; if (y + 14 > FY - 26) break;
        win(B, xc, y, 15, 9, rand() < 0.32, rand() < 0.3 ? '#c8d8ff' : '#ffc870', '#2a2e36');
        B.fillStyle = '#8a8c90'; B.fillRect(xc - 3, y + 10, 21, 4); B.fillStyle = 'rgba(0,0,0,0.5)'; B.fillRect(xc - 3, y + 13, 21, 1);
      }
    }
    B.restore();
    B.strokeStyle = '#9a9ca0'; B.lineWidth = 4; B.beginPath(); B.moveTo(xl - 2, top); B.lineTo(m, mid); B.lineTo(xr + 2, top); B.stroke();
    B.fillStyle = '#4a2018'; B.fillRect(m - 3, mid, 6, FY - mid);
    glow(B, xr - 20, top + 2, 6, 'rgba(255,30,30,1)'); glow(B, xl + 20, top + 2, 6, 'rgba(255,30,30,1)');
    stones(B, xl, FY - 26, xr - xl, 26, '#6a6a6a', 20, 13);
    B.fillStyle = '#0a0a10'; B.beginPath(); B.moveTo(m + 8, FY); B.lineTo(m + 8, FY - 20); B.quadraticCurveTo(m + 34, FY - 36, m + 60, FY - 20); B.lineTo(m + 60, FY); B.fill();
    win(B, m + 24, FY - 16, 20, 16, true, '#ffd890'); B.fillStyle = '#e8e8e8'; B.font = '6px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('GILLESPIE', m + 34, FY - 24); B.textAlign = 'left';
    fog(B, FY - 36, 44, 'rgba(70,60,90,0.35)');
    vignette(B, BW);
    pfloor(F, 'stone', '#3a3a40', '#18181c', { rows: 8, span: 46, wet: true, edge: '#6a6a68' });
    F.fillStyle = 'rgba(230,200,90,0.5)'; for (let x = 30; x < AWX; x += 70) { F.beginPath(); F.moveTo(x, H - 10); F.lineTo(x + 30, H - 10); F.lineTo(x + 31, H - 7); F.lineTo(x - 1, H - 7); F.fill(); }
    for (const x of [160, 560, 940]) lamp(F, x, FY + 4, 70);
  }

  // ---------- CARDINAL GREENWAY at the Wysor Street Depot, blood-orange dusk ----------
  function greenway(B, F) {
    vg(B, 0, 0, BW, H, ['#100608', '#3a0e10', '#8a2a14', '#e0702a']);
    clouds(B, 20, 110, 16, 'rgba(70,20,20,0.55)', 'rgba(255,140,60,0.45)', 1);
    glow(B, 400, 160, 170, 'rgba(255,140,40,0.4)'); B.fillStyle = '#ffcc70'; B.beginPath(); B.arc(400, 150, 18, 0, PI * 2); B.fill(); glow(B, 400, 150, 40, 'rgba(255,220,120,0.8)');
    seed = 97;
    treeline(B, FY, 50, '#0c0604', 40, 90, BW, 'rgba(255,120,40,0.14)');
    fog(B, 120, 70, 'rgba(160,60,30,0.3)');
    // Wysor Street Depot: brick, hip roof, arched windows, chimney, platform
    const m = CX, x = m - 130, w = 260, wt = FY - 92;
    bricks(B, x, wt, w, FY - wt, '#6a2a1a', '#1a0806', 7, 3.2);
    vg(B, x, wt, w, FY - wt, ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']); hgf(B, x, wt, w, FY - wt, ['rgba(255,120,40,0.2)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']);
    B.fillStyle = '#b8ae98'; B.fillRect(x, FY - 22, w, 10); B.fillRect(x, FY - 58, w, 3);
    B.fillStyle = '#0c0808'; B.beginPath(); B.moveTo(x - 14, wt); B.lineTo(x + w + 14, wt); B.lineTo(x + w - 30, wt - 46); B.lineTo(x + 30, wt - 46); B.fill();
    for (let r = wt - 6; r > wt - 44; r -= 6) { B.fillStyle = 'rgba(255,120,60,0.12)'; B.fillRect(x + 30 - (r - wt + 46) * 0, r, w - 60, 1); }
    bricks(B, x + w - 80, wt - 64, 16, 22, '#5a2414', '#1a0806', 5, 3);
    for (let i = 0; i < 6; i++) { const cx = x + 26 + i * 42; B.fillStyle = '#140c08'; B.beginPath(); B.moveTo(cx - 11, FY - 24); B.lineTo(cx - 11, FY - 70); B.arc(cx, FY - 70, 11, PI, 0); B.lineTo(cx + 11, FY - 24); B.fill(); B.save(); B.beginPath(); B.moveTo(cx - 9, FY - 26); B.lineTo(cx - 9, FY - 70); B.arc(cx, FY - 70, 9, PI, 0); B.lineTo(cx + 9, FY - 26); B.clip(); vg(B, cx - 10, FY - 80, 20, 56, i % 3 === 1 ? ['#ffd080', '#c86a20'] : ['#3a5a6a', '#0e1a22']); B.fillStyle = 'rgba(20,10,5,0.9)'; B.fillRect(cx - 0.8, FY - 80, 1.6, 60); B.fillRect(cx - 10, FY - 52, 20, 1.2); B.restore(); }
    glow(B, x + 26 + 42 * 1, FY - 50, 30, 'rgba(255,180,90,0.4)'); glow(B, x + 26 + 42 * 4, FY - 50, 30, 'rgba(255,180,90,0.4)');
    B.fillStyle = '#e8d8b0'; B.font = '9px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('WYSOR STREET DEPOT', m, wt - 50); B.textAlign = 'left';
    for (const xx of [x - 30, x + w + 26]) lamp(B, xx, FY, 60);
    fog(B, FY - 24, 30, 'rgba(160,70,30,0.3)');
    vignette(B, BW);
    // gravel trail with the old rails still in it
    pfloor(F, 'stone', '#5a4a3a', '#241a12', { rows: 7, span: 60, edge: '#3a2e22' });
    speckle(F, 0, FY, AWX, H - FY, 3000, 0.5, 0.18);
    for (const y of [FY + 10, FY + 30]) { F.fillStyle = '#2a2a2e'; F.fillRect(0, y, AWX, 2.4); F.fillStyle = 'rgba(255,150,80,0.6)'; F.fillRect(0, y, AWX, 0.7); }
    F.fillStyle = '#1a1210'; for (let x0 = 0; x0 < AWX; x0 += 70) { F.fillRect(x0, FY - 16, 3, 16); } F.fillRect(0, FY - 14, AWX, 2); F.fillRect(0, FY - 7, AWX, 2);
  }

  // ---------- SHEDTOWN: the drive-in at night ----------
  function shedtown(B, F) {
    vg(B, 0, 0, BW, H, ['#020204', '#0a0810', '#18121a', '#2a1e1e']);
    stars(B, 100, 90); moon(B, 1000, 40, 12, '#e8d8b8');
    clouds(B, 10, 80, 12, 'rgba(25,20,25,0.6)', 'rgba(120,100,90,0.3)', 1);
    seed = 101;
    // shacks with tin roofs
    const shack = (x, w, h, c) => {
      wall(B, x, FY - h, w, h, c, { uplit: true }); for (let i = 0; i < w; i += 4) { B.fillStyle = 'rgba(0,0,0,0.3)'; B.fillRect(x + i, FY - h, 1, h); }
      grime(B, x, FY - h, w, h, 10, 0.4);
      B.fillStyle = '#3a3a3e'; B.beginPath(); B.moveTo(x - 6, FY - h); B.lineTo(x + w / 2, FY - h - 18); B.lineTo(x + w + 6, FY - h); B.fill();
      for (let i = 0; i < w + 12; i += 3) { B.fillStyle = 'rgba(255,255,255,0.06)'; B.fillRect(x - 6 + i, FY - h - 16 + Math.abs(i - (w + 12) / 2) * 0.33 * (16 / ((w + 12) / 2)) * 0, 1, 16); }
      B.fillStyle = '#6a2a10'; B.fillRect(x + w * 0.2, FY - h - 8, w * 0.25, 3);
      win(B, x + w * 0.6, FY - h + 12, 12, 10, rand() < 0.6, '#ffa040');
    };
    for (const [x, w, h, c] of [[120, 90, 54, '#4a4034'], [230, 70, 46, '#3a3a40'], [850, 100, 58, '#4a3a2a'], [980, 80, 50, '#3a3830']]) shack(x, w, h, c);
    treeline(B, FY - 40, 20, '#06080a', 40, 80, BW);
    // lifted truck silhouette
    const tx = 330; B.fillStyle = '#0a0a0a'; B.beginPath(); B.arc(tx + 18, FY - 10, 12, 0, PI * 2); B.arc(tx + 92, FY - 10, 12, 0, PI * 2); B.fill(); B.fillStyle = '#2a0a0a'; B.fillRect(tx, FY - 48, 110, 26); B.fillRect(tx + 50, FY - 66, 40, 20); win(B, tx + 56, FY - 62, 28, 12, false);
    glow(B, tx + 108, FY - 38, 26, 'rgba(255,240,200,0.6)');
    // the drive-in: striped awning, glowing order windows, the DRIVE-IN sign with chaser bulbs
    const m = CX;
    wall(B, m - 110, FY - 70, 220, 70, '#c8b890', { uplit: true }); for (let r = FY - 64; r < FY; r += 7) { B.fillStyle = 'rgba(0,0,0,0.2)'; B.fillRect(m - 110, r, 220, 1); }
    B.fillStyle = 'rgba(10,6,20,0.45)'; B.fillRect(m - 110, FY - 70, 220, 70);
    for (let i = 0; i < 12; i++) { B.fillStyle = i % 2 ? '#e8e0d0' : '#a01818'; B.beginPath(); B.moveTo(m - 120 + i * 20, FY - 80); B.lineTo(m - 100 + i * 20, FY - 80); B.lineTo(m - 96 + i * 20, FY - 66); B.lineTo(m - 116 + i * 20, FY - 66); B.fill(); }
    win(B, m - 80, FY - 54, 50, 28, true, '#ffe0a0'); win(B, m - 20, FY - 54, 40, 28, true, '#ffd890'); B.fillStyle = '#2a1408'; B.fillRect(m + 40, FY - 50, 26, 50);
    glow(B, m - 30, FY - 30, 80, 'rgba(255,210,140,0.45)');
    B.fillStyle = '#0c0c0c'; B.fillRect(m + 104, FY - 150, 6, 150);
    B.fillStyle = '#5a0808'; B.fillRect(m + 74, FY - 176, 68, 36); win(B, m + 79, FY - 171, 58, 26, true, '#ff5a40', '#5a0808');
    B.fillStyle = '#fff4d0'; B.font = '13px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('DRIVE-IN', m + 108, FY - 152); B.textAlign = 'left';
    glow(B, m + 108, FY - 158, 70, 'rgba(255,60,40,0.55)');
    for (let i = 0; i < 7; i++) { B.fillStyle = '#ffe070'; B.fillRect(m + 74 + i * 11, FY - 178, 3, 3); }
    // chain-link fence
    B.strokeStyle = 'rgba(150,150,160,0.35)'; B.lineWidth = 0.6;
    for (let x = 0; x < BW; x += 5) { B.beginPath(); B.moveTo(x, FY - 36); B.lineTo(x + 30, FY); B.moveTo(x + 30, FY - 36); B.lineTo(x, FY); B.stroke(); }
    B.fillStyle = '#4a4a50'; for (let x = 0; x < BW; x += 80) B.fillRect(x, FY - 40, 2, 40); B.fillRect(0, FY - 38, BW, 1.5);
    fog(B, FY - 30, 36, 'rgba(60,40,40,0.35)');
    vignette(B, BW);
    // muddy gravel lot with puddles catching the neon
    pfloor(F, 'stone', '#3a2e24', '#16100c', { rows: 7, span: 70, edge: '#2a2018' });
    speckle(F, 0, FY, AWX, H - FY, 3000, 0.5, 0.15);
    for (let i = 0; i < 10; i++) { const x = rand() * AWX, y = rr(FY + 12, H - 6), w = rr(16, 44); F.fillStyle = 'rgba(20,20,30,0.8)'; F.beginPath(); F.ellipse(x, y, w, w * 0.12, 0, 0, PI * 2); F.fill(); F.fillStyle = rand() < 0.5 ? 'rgba(255,70,50,0.35)' : 'rgba(255,210,140,0.25)'; F.beginPath(); F.ellipse(x, y, w * 0.6, w * 0.06, 0, 0, PI * 2); F.fill(); }
    for (let i = 0; i < 4; i++) { const x = 100 + rand() * 900; F.fillStyle = '#0a0a0a'; F.beginPath(); F.ellipse(x, FY + 8, 9, 4, 0, 0, PI * 2); F.fill(); F.fillStyle = '#2a2a2a'; F.beginPath(); F.ellipse(x, FY + 7, 4, 1.6, 0, 0, PI * 2); F.fill(); }
  }

  // ---------- CORNBREAD ROAD: cornfields, the movie-prop Devils Tower, UFOs ----------
  function cornbread(B, F) {
    vg(B, 0, 0, BW, H, ['#06040e', '#1a0e2a', '#4a1e3a', '#a04a3a']);
    stars(B, 90, 70);
    clouds(B, 20, 90, 14, 'rgba(40,20,50,0.55)', 'rgba(255,120,90,0.3)', 1);
    seed = 113;
    // Yorktown water tower on the horizon
    const yx = 1000; B.fillStyle = '#1a1620'; B.fillRect(yx - 4, 80, 8, FY - 80); B.beginPath(); B.ellipse(yx, 70, 30, 22, 0, 0, PI * 2); B.fill(); B.fillStyle = 'rgba(255,150,120,0.25)'; B.beginPath(); B.ellipse(yx - 8, 64, 14, 8, -0.3, 0, PI * 2); B.fill();
    B.fillStyle = '#3a6a4a'; B.font = '7px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('YORKTOWN', yx, 74); B.textAlign = 'left'; glow(B, yx, 46, 5, 'rgba(255,40,40,1)');
    // Devils Tower: fluted columns, flat summit, boulder skirt, lit from the UFO
    const cx = CX, top = 26;
    B.fillStyle = '#100a08'; B.beginPath(); B.moveTo(cx - 120, FY); B.lineTo(cx - 60, FY - 50); B.lineTo(cx + 60, FY - 50); B.lineTo(cx + 120, FY); B.fill();
    const N = 16;
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N, tl0 = cx - 44 + t0 * 88, tl1 = cx - 44 + t1 * 88, bl0 = cx - 84 + t0 * 168, bl1 = cx - 84 + t1 * 168;
      const gr = B.createLinearGradient(tl0, 0, tl1, 0); const base = i < N * 0.4 ? '#6a5a4c' : i < N * 0.75 ? '#4a3e34' : '#2a221c';
      gr.addColorStop(0, shade(base, 0.15)); gr.addColorStop(0.6, base); gr.addColorStop(1, shade(base, -0.35));
      B.fillStyle = gr; B.beginPath(); B.moveTo(tl0, top + (i % 3)); B.lineTo(tl1, top + ((i + 1) % 3)); B.lineTo(bl1, FY - 30); B.lineTo(bl0, FY - 30); B.fill();
    }
    grime(B, cx - 84, top, 168, FY - top - 30, 30, 0.3);
    B.fillStyle = '#2a3a1a'; B.fillRect(cx - 44, top - 4, 88, 5); for (let i = 0; i < 12; i++) B.fillRect(cx - 42 + i * 7, top - 8 - (i % 3) * 2, 5, 5);
    for (let i = 0; i < 26; i++) { const bx = cx + rr(-110, 110), by = FY - rr(0, 40), r = rr(6, 16); B.fillStyle = shade('#4a3e34', rr(-0.4, 0)); B.beginPath(); B.ellipse(bx, by, r, r * 0.7, 0, 0, PI * 2); B.fill(); B.fillStyle = 'rgba(255,160,120,0.12)'; B.beginPath(); B.ellipse(bx - r * 0.3, by - r * 0.3, r * 0.4, r * 0.25, 0, 0, PI * 2); B.fill(); }
    // cornfields
    for (let row = 0; row < 3; row++) {
      const y = FY - 4 - row * 8, h = 34 - row * 8;
      for (let x = 0; x < BW; x += 3 + row) { if (Math.abs(x - cx) < 120 - row * 20) continue; B.strokeStyle = shade(row ? '#2a2a10' : '#3a3214', rr(-0.3, 0.1)); B.lineWidth = 1.2; B.beginPath(); B.moveTo(x, y); B.quadraticCurveTo(x + rr(-3, 3), y - h * 0.6, x + rr(-6, 6), y - h * rr(0.8, 1.1)); B.stroke(); if (rand() < 0.3) { B.fillStyle = '#5a4a1a'; B.fillRect(x - 1, y - h * 0.5, 2, 4); } }
    }
    // little houses in the corn, a MOVIE PROP sign
    B.fillStyle = '#d8d0c0'; B.fillRect(cx - 160, FY - 30, 22, 16); B.fillStyle = '#a01818'; B.font = '5px Anton, Impact, sans-serif'; B.fillText('MOVIE', cx - 157, FY - 23); B.fillText('PROP', cx - 155, FY - 17); B.fillStyle = '#111'; B.fillRect(cx - 150, FY - 14, 2, 14);
    fog(B, FY - 40, 50, 'rgba(120,60,90,0.35)');
    vignette(B, BW);
    pfloor(F, 'stone', '#4a3a26', '#1a1208', { rows: 6, span: 90, edge: '#2a2210' });
    speckle(F, 0, FY, AWX, H - FY, 3500, 0.5, 0.15);
    F.strokeStyle = 'rgba(0,0,0,0.35)'; F.lineWidth = 2; for (const off of [-0.12, 0.12]) { F.beginPath(); F.moveTo(AWX / 2 + off * 200, FY); F.lineTo(AWX / 2 + off * 2600, H); F.stroke(); }
  }

  // ---------- BALL GLASS WORKS (Ball Jar Golem): furnace hall, Goro's Lair style ----------
  function glassworks(B, F) {
    vg(B, 0, 0, BW, H, ['#060202', '#140806', '#2a120a']);
    seed = 127;
    stones(B, 0, 10, BW, FY - 10, '#3a2016', 22, 11);
    B.fillStyle = 'rgba(0,0,0,0.45)'; B.fillRect(0, 10, BW, FY - 10);
    grime(B, 0, 10, BW, FY - 10, 80, 0.45);
    for (const x of [230, 640, 1050]) {
      stones(B, x - 54, 70, 108, FY - 70, '#4a4a4e', 18, 9); B.fillStyle = 'rgba(0,0,0,0.35)'; B.fillRect(x - 54, 70, 108, FY - 70); B.fillStyle = '#1a1a1e'; B.fillRect(x - 62, 62, 124, 10);
      B.fillStyle = '#1a0a04'; B.beginPath(); B.arc(x, 150, 30, PI, 0); B.fillRect(x - 30, 150, 60, FY - 150); B.fill();
      const fg = B.createRadialGradient(x, 165, 2, x, 160, 34); fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.3, '#ffd060'); fg.addColorStop(0.7, '#ff6a10'); fg.addColorStop(1, '#5a1000');
      B.fillStyle = fg; B.beginPath(); B.arc(x, 156, 24, PI, 0); B.fillRect(x - 24, 156, 48, FY - 156); B.fill();
      glow(B, x, 160, 150, 'rgba(255,110,20,0.55)'); B.fillStyle = '#1a1a1e'; B.fillRect(x - 8, 0, 16, 64);
    }
    for (const x0 of [360, 820]) for (let s = 0; s < 3; s++) {
      B.fillStyle = '#2a1a0e'; B.fillRect(x0, 70 + s * 34, 140, 4);
      for (let j = 0; j < 10; j++) { const jx = x0 + 6 + j * 13, jy = 52 + s * 34; B.fillStyle = 'rgba(140,190,210,0.4)'; B.fillRect(jx, jy, 9, 17); B.fillStyle = '#7a7a80'; B.fillRect(jx, jy - 2, 9, 3); if (rand() < 0.5) { B.fillStyle = 'rgba(110,150,50,0.6)'; B.fillRect(jx + 1, jy + 7, 7, 9); } if (rand() < 0.15) { B.fillStyle = '#e8dcc8'; B.beginPath(); B.arc(jx + 4.5, jy + 11, 2.5, 0, PI * 2); B.fill(); } B.fillStyle = 'rgba(255,255,255,0.35)'; B.fillRect(jx + 1, jy + 1, 1, 14); }
    }
    B.strokeStyle = '#141414'; B.lineWidth = 2; for (const x of [140, 470, 760, 1170]) { B.beginPath(); B.moveTo(x, 0); B.lineTo(x + rr(-6, 6), rr(60, 110)); B.stroke(); B.fillStyle = '#141414'; B.fillRect(x - 4, 100, 8, 6); }
    B.fillStyle = '#d8b070'; B.font = '10px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('BALL BROTHERS GLASS WORKS', CX, 30); B.textAlign = 'left';
    fog(B, FY - 40, 50, 'rgba(160,60,10,0.3)');
    vignette(B, BW);
    pfloor(F, 'check', '#3a3430', '#26201c', { rows: 9, span: 40, edge: '#1a1410' });
    for (const x of [230, 640, 1050].map(v => v - 90)) { F.save(); F.globalCompositeOperation = 'lighter'; const gr = F.createRadialGradient(x, FY + 8, 0, x, FY + 8, 120); gr.addColorStop(0, 'rgba(255,110,20,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); F.fillStyle = gr; F.fillRect(x - 120, FY, 240, H - FY); F.restore(); }
  }

  // ---------- THE VILLAGE: the strip of shops by Ball State, late on a Friday ----------
  function village(B, F) {
    vg(B, 0, 0, BW, H, ['#04030a', '#0c0a1e', '#22142e', '#3a1c2a']);
    stars(B, 40, 60); clouds(B, 6, 60, 10, 'rgba(30,20,40,0.6)', 'rgba(120,80,110,0.25)', -1);
    seed = 211;
    // distant campus: dorm towers and a water tower
    for (let i = 0; i < 9; i++) { const x = 40 + i * 140 + rr(-20, 20), w = rr(40, 70), h = rr(50, 90); B.fillStyle = '#0e0c18'; B.fillRect(x, FY - 60 - h, w, h + 60); for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) if (rand() < 0.35) { B.fillStyle = rand() < 0.5 ? 'rgba(255,210,140,0.5)' : 'rgba(180,200,255,0.4)'; B.fillRect(x + 5 + c * (w - 10) / 4, FY - 54 - h + r * 12, 4, 5); } }
    fog(B, 70, 60, 'rgba(60,30,60,0.4)');
    // one long two-story brick building, storefronts on the ground floor
    const sf = FY - 66, top = sf - 24, x0 = -10, x1 = BW + 10;
    bricks(B, x0, top, x1 - x0, sf - top, '#6a2a22', '#1a0806', 7, 3.2);
    vg(B, x0, top, x1 - x0, sf - top, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.1)', 'rgba(255,150,90,0.12)']);
    B.fillStyle = '#2a1a16'; B.fillRect(x0, top - 6, x1 - x0, 7); B.fillStyle = '#8a7a6a'; B.fillRect(x0, top - 7, x1 - x0, 2);
    const shops = [
      { n: 'MIDNIGHT COOKIES', aw: '#c8402a', neon: '#ffb0d0', fill: (x, w) => { for (let i = 0; i < 6; i++) { R.ball(B, x + 12 + i * (w - 24) / 5, sf + 38, 5, '#c08040'); R.ball(B, x + 11 + i * (w - 24) / 5, sf + 37, 1.2, '#3a1a08'); } B.fillStyle = '#e8e0d0'; B.fillRect(x + 6, sf + 43, w - 12, 3); } },
      { n: 'BEAN THERE COFFEE', aw: '#2a5a3a', neon: '#a0ffc0', fill: (x, w) => { B.fillStyle = '#3a2416'; B.fillRect(x + 6, sf + 36, w - 12, 12); for (let i = 0; i < 4; i++) { B.fillStyle = '#f0ece0'; B.fillRect(x + 12 + i * 12, sf + 31, 5, 5); } B.fillStyle = '#1a1a1a'; B.fillRect(x + w - 24, sf + 22, 12, 14); } },
      { n: 'CLOUD 9 VAPE', aw: '#3a2a7a', neon: '#80e8ff', fill: (x, w) => { for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { B.fillStyle = ['#40c0ff', '#ff40c0', '#c0ff40'][(i + r) % 3]; B.fillRect(x + 8 + i * (w - 16) / 7, sf + 22 + r * 9, 3, 6); } } },
      { n: 'THIRD EYE HEAD SHOP', aw: '#6a2a6a', neon: '#d0a0ff', fill: (x, w) => { B.fillStyle = '#5a1a6a'; B.fillRect(x + 6, sf + 18, w * 0.4, 24); B.fillStyle = '#e0c020'; B.beginPath(); B.arc(x + 6 + w * 0.2, sf + 30, 7, 0, PI * 2); B.fill(); B.fillStyle = '#5a1a6a'; B.beginPath(); B.arc(x + 6 + w * 0.2, sf + 30, 3, 0, PI * 2); B.fill(); for (let i = 0; i < 4; i++) { B.fillStyle = 'rgba(120,220,255,0.6)'; B.fillRect(x + w * 0.55 + i * 9, sf + 30 - i * 3, 4, 16 + i * 3); } } },
    ];
    let x = 12, i = 0;
    while (x < BW) {
      const s = shops[i % 4], w = 132;
      // pilasters between storefronts
      B.fillStyle = '#4a1c16'; B.fillRect(x - 6, sf - 2, 6, 66);
      // big lit shop window
      vg(B, x, sf + 10, w, 44, ['#ffd8a0', '#e0a060', '#8a5030']);
      s.fill(x, w);
      B.fillStyle = 'rgba(255,255,255,0.12)'; B.beginPath(); B.moveTo(x + 10, sf + 10); B.lineTo(x + 30, sf + 10); B.lineTo(x + 10, sf + 40); B.fill();
      B.strokeStyle = '#140c0a'; B.lineWidth = 2; B.strokeRect(x, sf + 10, w, 44); B.fillStyle = '#140c0a'; B.fillRect(x + w * 0.7, sf + 10, 2, 44);
      // door
      B.fillStyle = '#1a100c'; B.fillRect(x + w + 2, sf + 14, 20, 50); win(B, x + w + 5, sf + 18, 14, 20, true, '#ffd090', '#1a100c');
      // striped awning
      for (let k = 0; k < 12; k++) { B.fillStyle = k % 2 ? s.aw : '#e8e0d0'; B.beginPath(); B.moveTo(x - 4 + k * (w + 30) / 12, sf + 2); B.lineTo(x - 4 + (k + 1) * (w + 30) / 12, sf + 2); B.lineTo(x - 2 + (k + 1) * (w + 30) / 12, sf + 10); B.lineTo(x - 2 + k * (w + 30) / 12, sf + 10); B.fill(); }
      B.fillStyle = 'rgba(0,0,0,0.35)'; B.fillRect(x - 4, sf + 10, w + 30, 2);
      // neon sign above the awning
      B.fillStyle = '#0a0608'; B.fillRect(x + 6, sf - 16, w - 12, 15);
      glow(B, x + w / 2, sf - 9, 50, 'rgba(255,255,255,0.12)', 0.5);
      B.font = '10px Anton, Impact, sans-serif'; B.textAlign = 'center';
      B.fillStyle = s.neon; B.shadowColor = s.neon; B.shadowBlur = 8; B.fillText(s.n, x + w / 2, sf - 4); B.shadowBlur = 0; B.textAlign = 'left';
      x += w + 34; i++;
      if (i === 4) { // THE VILLAGE arch sign mid-block
        B.fillStyle = '#0c0c0e'; B.fillRect(x + 20, top - 12, 2, 8); B.fillRect(x + 90, top - 12, 2, 8);
        B.fillStyle = '#1a0a08'; B.fillRect(x - 4, top - 34, 120, 24); B.strokeStyle = '#c8b060'; B.lineWidth = 1.5; B.strokeRect(x - 3, top - 33, 118, 22);
        B.font = '14px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillStyle = '#ff3030'; B.shadowColor = '#ff2020'; B.shadowBlur = 10; B.fillText('THE VILLAGE', x + 56, top - 16); B.shadowBlur = 0; B.textAlign = 'left';
      }
    }
    grime(B, 0, top, BW, FY - top, 30, 0.2);
    // sidewalk
    vg(B, 0, FY - 4, BW, 6, ['#6a6460', '#4a4440']); for (let x = 0; x < BW; x += 22) { B.fillStyle = 'rgba(0,0,0,0.3)'; B.fillRect(x, FY - 4, 1, 6); }
    // parking meters and a trash can
    for (let x = 90; x < BW; x += 220) { B.fillStyle = '#1a1a1e'; B.fillRect(x, FY - 22, 2, 20); B.fillStyle = '#6a6a72'; B.fillRect(x - 3, FY - 28, 8, 8); }
    fog(B, FY - 50, 50, 'rgba(70,40,70,0.35)');
    vignette(B, BW);
    // street: wet asphalt, curb at the back, double yellow up the middle
    pfloor(F, 'stone', '#2a2a30', '#121216', { rows: 8, span: 60, wet: true, edge: '#8a8478' });
    F.fillStyle = 'rgba(0,0,0,0.25)'; F.fillRect(0, FY, AWX, H - FY);
    F.fillStyle = 'rgba(230,190,60,0.6)'; F.fillRect(0, H - 22, AWX, 1.6); F.fillRect(0, H - 19, AWX, 1.6);
    for (let i = 0; i < 26; i++) { F.fillStyle = ['#c8c0a0', '#a02020', '#3a6a3a', '#d8d8d8'][i % 4]; F.fillRect(rr(0, AWX), rr(FY + 6, H - 4), rr(2, 5), rr(1, 2)); }
    for (const x of [140, 540, 960]) lamp(F, x, FY + 3, 78, 'rgba(255,200,140,0.9)');
  }
  // the crowd of bros on the sidewalk (back-layer coords), drawn faded every frame
  const BROS = (() => { const a = []; let s = 77; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 16; i++) a.push({ x: 80 + i * 72 + r() * 30, h: 40 + r() * 8, ph: r() * 6, cap: r() < 0.7, can: r() < 0.75, col: ['#5a2a2a', '#2a3a5a', '#4a4a4a', '#5a4a2a', '#2a4a3a'][i % 5] }); return a; })();
  function bros(g, t) {
    g.save(); g.globalAlpha = 0.82;
    for (const b of BROS2) person(g, b, t);
    g.restore();
    fog(g, FY - 56, 60, 'rgba(50,30,60,0.22)');
  }

  // ---------- crowds: small front-facing people, shaded and lit, for the Village and the beach ----------
  function person(g, p, t) {
    const sp = p.speed || 4, bob = Math.abs(Math.sin(t * sp + p.ph)) * (p.bob ?? 1.6), x = p.x, y = p.y - bob, h = p.h, fem = p.fem;
    const ys = y - h * 0.81, yw = y - h * 0.6, yh = y - h * 0.5, yc = y - h * 0.45, yk = y - h * 0.25;
    const sw = h * (fem ? 0.1 : 0.125), ww = h * (fem ? 0.066 : 0.085), hw = h * (fem ? 0.098 : 0.09), st = h * 0.055 * (p.stance || 1);
    const skinG = g.createLinearGradient(x - sw, 0, x + sw, 0); skinG.addColorStop(0, shade(p.skin, -0.3)); skinG.addColorStop(0.55, p.skin); skinG.addColorStop(1, shade(p.skin, 0.12));
    const leg = (sd, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x + sd * hw, yh); g.lineTo(x + sd * 0.8, yc); g.lineTo(x + sd * (st * 0.6 + h * 0.012), yk); g.lineTo(x + sd * (st + h * 0.008), y - 1.5); g.lineTo(x + sd * (st + h * 0.04), y - 1.5); g.lineTo(x + sd * (st * 0.6 + h * 0.05), yk); g.closePath(); g.fill(); };
    leg(-1, p.legs || skinG); leg(1, p.legs || skinG);
    g.fillStyle = p.shoes || shade(p.skin, -0.25); g.fillRect(x - st - h * 0.05, y - 2, h * 0.05, 2); g.fillRect(x + st, y - 2, h * 0.05, 2);
    // torso
    const torso = () => { g.beginPath(); g.moveTo(x - sw, ys + 1); g.quadraticCurveTo(x, ys - 1.5, x + sw, ys + 1); g.quadraticCurveTo(x + sw * 0.95, yw - h * 0.08, x + ww, yw); g.quadraticCurveTo(x + hw * 1.1, yh - 1, x + hw, yh); g.lineTo(x - hw, yh); g.quadraticCurveTo(x - hw * 1.1, yh - 1, x - ww, yw); g.quadraticCurveTo(x - sw * 0.95, yw - h * 0.08, x - sw, ys + 1); g.closePath(); };
    torso(); g.fillStyle = p.topKind === 'shirt' || p.topKind === 'one' ? p.top : skinG; g.fill();
    if (p.topKind === 'one') { g.fillStyle = skinG; g.beginPath(); g.moveTo(x - sw * 0.7, ys + 1); g.lineTo(x + sw * 0.7, ys + 1); g.lineTo(x, ys + h * 0.06); g.fill(); }
    if (p.topKind === 'shirt') { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 0.4, ys + 2, 0.8, yh - ys - 2); if (p.logo) { g.fillStyle = p.logo; g.fillRect(x - h * 0.04, ys + h * 0.07, h * 0.08, h * 0.05); } }
    if (!fem && p.topKind === 'none') { g.strokeStyle = shade(p.skin, -0.3); g.lineWidth = 0.5; g.beginPath(); g.moveTo(x - sw * 0.7, ys + h * 0.07); g.quadraticCurveTo(x, ys + h * 0.1, x + sw * 0.7, ys + h * 0.07); g.stroke(); }
    if (p.topKind === 'bikini') { g.fillStyle = p.top; g.beginPath(); g.ellipse(x - sw * 0.42, ys + h * 0.07, h * 0.04, h * 0.032, 0, 0, PI * 2); g.ellipse(x + sw * 0.42, ys + h * 0.07, h * 0.04, h * 0.032, 0, 0, PI * 2); g.fill(); R.line(g, x - sw * 0.8, ys + h * 0.06, x + sw * 0.8, ys + h * 0.06, p.top, 0.6); }
    // bottoms: briefs, trunks to mid thigh, or board shorts to the knee
    const bl = p.bottomLen === 'knee' ? yk + 1 : p.bottomLen === 'mid' ? (yc + yk) / 2 : yc + 1.5;
    g.fillStyle = p.bottom; g.beginPath(); g.moveTo(x - hw - 0.4, yh - 1.5); g.lineTo(x + hw + 0.4, yh - 1.5); g.lineTo(x + hw * (p.bottomLen ? 1.05 : 0.6), bl); g.lineTo(x + 0.8, bl); g.lineTo(x, yc + (p.bottomLen ? 1 : 0)); g.lineTo(x - 0.8, bl); g.lineTo(x - hw * (p.bottomLen ? 1.05 : 0.6), bl); g.closePath(); g.fill();
    if (p.bottomLen === 'knee' && p.stripe) { g.fillStyle = p.stripe; g.fillRect(x - hw - 0.4, yh + 1, hw * 2 + 0.8, 1); }
    // arms: upper and forearm, elbows bent by pose
    const L1 = h * 0.16, L2 = h * 0.15, up = Math.sin(t * sp * 0.5 + p.ph);
    let aL, aR, eL, eR;
    if (p.style === 'cheer') { aL = 2.6 + up * 0.25; aR = 2.4 - up * 0.25; eL = -0.5 + up * 0.4; eR = 0.5 - up * 0.4; }
    else if (p.style === 'clap') { const c = Math.abs(Math.sin(t * 8 + p.ph)); aL = 0.55; aR = 0.55; eL = 1.3 + c * 0.35; eR = 1.3 + c * 0.35; }
    else if (p.style === 'hip') { aL = 0.7; aR = 0.18; eL = 1.9; eR = 1.6; }
    else { aL = 0.15; aR = 0.2; eL = 0.15; eR = 0.25; }
    const arm = (sd, a, e) => {
      const sx = x + sd * (sw - 1), sy = ys + 1.5, ex = sx + sd * Math.sin(a) * L1, ey = sy + Math.cos(a) * L1, hx = ex + sd * Math.sin(a + e * -1 * -1) * 0 + sd * Math.sin(a - e) * L2 * -1 * -1, hy = ey + Math.cos(a - e) * L2;
      g.lineCap = 'round';
      g.strokeStyle = p.topKind === 'shirt' && p.sleeves ? p.top : shade(p.skin, sd > 0 ? 0.05 : -0.15); g.lineWidth = h * 0.05; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      if (p.topKind === 'shirt' && p.sleeves) { g.strokeStyle = shade(p.skin, sd > 0 ? 0.05 : -0.15); g.lineWidth = h * 0.04; g.beginPath(); g.moveTo(sx + (ex - sx) * 0.6, sy + (ey - sy) * 0.6); g.lineTo(ex, ey); g.stroke(); }
      g.strokeStyle = shade(p.skin, sd > 0 ? 0.05 : -0.15); g.lineWidth = h * 0.04; g.beginPath(); g.moveTo(ex, ey); g.lineTo(hx, hy); g.stroke(); g.lineCap = 'butt';
      g.fillStyle = p.skin; g.beginPath(); g.arc(hx, hy, h * 0.026, 0, PI * 2); g.fill();
      return [hx, hy];
    };
    arm(-1, aL, eL); const hr = arm(1, aR, eR);
    if (p.can) { g.fillStyle = p.canC || '#c8c8d0'; g.fillRect(hr[0] - h * 0.022, hr[1] - h * 0.07, h * 0.044, h * 0.07); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(hr[0] - h * 0.02, hr[1] - h * 0.07, 0.6, h * 0.07); }
    // neck and head
    const hr0 = h * 0.072, hy0 = ys - h * 0.09;
    g.fillStyle = shade(p.skin, -0.15); g.fillRect(x - h * 0.025, hy0 + hr0 * 0.6, h * 0.05, ys - hy0 - hr0 * 0.4);
    if (p.longHair) { g.fillStyle = p.hair; g.beginPath(); g.ellipse(x, hy0 + hr0 * 0.9, hr0 * 1.25, hr0 * 1.9, 0, 0, PI * 2); g.fill(); }
    g.fillStyle = skinG; g.beginPath(); g.ellipse(x, hy0, hr0 * 0.88, hr0, 0, 0, PI * 2); g.fill();
    if (p.hair && !p.bald) { g.fillStyle = p.hair; g.beginPath(); g.ellipse(x, hy0 - hr0 * 0.3, hr0 * 0.95, hr0 * 0.8, 0, PI, PI * 2); g.fill(); g.fillRect(x - hr0 * 0.95, hy0 - hr0 * 0.35, hr0 * 0.3, hr0 * 0.7); g.fillRect(x + hr0 * 0.65, hy0 - hr0 * 0.35, hr0 * 0.3, hr0 * 0.7); }
    if (p.shades) { g.fillStyle = '#0a0a0c'; g.fillRect(x - hr0 * 0.75, hy0 - hr0 * 0.15, hr0 * 1.5, hr0 * 0.35); }
    else { g.fillStyle = 'rgba(20,10,5,0.8)'; g.fillRect(x - hr0 * 0.45, hy0 - hr0 * 0.05, 0.9, 0.9); g.fillRect(x + hr0 * 0.3, hy0 - hr0 * 0.05, 0.9, 0.9); }
    if (p.style === 'cheer') { g.fillStyle = 'rgba(60,10,10,0.8)'; g.fillRect(x - hr0 * 0.2, hy0 + hr0 * 0.45, hr0 * 0.4, hr0 * 0.3); }
    if (p.cap) { g.fillStyle = p.cap; g.beginPath(); g.ellipse(x, hy0 - hr0 * 0.4, hr0 * 0.98, hr0 * 0.65, 0, PI, PI * 2); g.fill(); g.fillRect(x - hr0 * 1.1, hy0 - hr0 * 0.45, hr0 * 2.2, hr0 * 0.25); }
    if (p.hat) { g.fillStyle = p.hat; g.beginPath(); g.ellipse(x, hy0 - hr0 * 0.55, hr0 * 1.9, hr0 * 0.35, 0, 0, PI * 2); g.fill(); g.beginPath(); g.ellipse(x, hy0 - hr0 * 0.75, hr0 * 0.9, hr0 * 0.7, 0, PI, PI * 2); g.fill(); }
    // rim light from the lit side
    if (p.rim) { g.strokeStyle = p.rim; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x + sw, ys + 1); g.quadraticCurveTo(x + sw * 0.95, yw - h * 0.08, x + ww, yw); g.lineTo(x + hw, yh); g.stroke(); g.beginPath(); g.arc(x, hy0, hr0 * 0.95, -1.2, 0.6); g.stroke(); }
  }
  const prng = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const SKINS = ['#e8c0a0', '#c89070', '#8a5a3a', '#5a3a26', '#f0d0b8', '#a87050'], HAIRS = ['#1a1008', '#4a2a12', '#8a6a3a', '#d8b870', '#2a1a10'];

  // ---------- THE OVERPASS: Tillotson Avenue over State Road 32 and the railroad ----------
  function overpass(B, F) {
    vg(B, 0, 0, BW, H, ['#020208', '#080a1a', '#141428', '#2a1e26']);
    stars(B, 70, 70);
    clouds(B, 10, 80, 10, 'rgba(24,20,36,0.6)', 'rgba(140,100,90,0.2)', 1);
    seed = 401;
    glow(B, 700, 150, 260, 'rgba(255,140,60,0.16)', 1);
    // downtown in the distance: a low line of two- to five-story blocks, a steeple and the water tower
    const hz = 152;
    for (let i = 0; i < 40; i++) {
      const x = 380 + i * 18 + rr(-5, 5), w = rr(12, 22), h = i === 17 || i === 24 ? rr(22, 26) : rr(5, 14);
      B.fillStyle = shade('#14121a', rr(-0.1, 0.15)); B.fillRect(x, hz - h, w, h);
      for (let r = hz - h + 2; r < hz - 2; r += 3.5) for (let c = x + 2; c < x + w - 2; c += 3.5) if (rand() < 0.2) { B.fillStyle = rand() < 0.7 ? 'rgba(255,200,120,0.75)' : 'rgba(170,200,255,0.6)'; B.fillRect(c, r, 1.3, 1.4); }
    }
    B.fillStyle = '#14121a'; B.beginPath(); B.moveTo(588, hz - 16); B.lineTo(591, hz - 36); B.lineTo(594, hz - 16); B.fill(); B.fillRect(586, hz - 16, 10, 16);
    B.fillStyle = '#1a181e'; B.fillRect(965, hz - 26, 1.4, 26); B.fillRect(975, hz - 26, 1.4, 26); B.beginPath(); B.ellipse(970, hz - 29, 9, 5, 0, 0, PI * 2); B.fill();
    treeline(B, hz, 30, '#05060a', 4, 12, BW);
    // the cut below: State Road 32 and the tracks, lit orange
    vg(B, 0, hz, BW, FY - hz, ['#0c0c12', '#16141a', '#0a0a0e']);
    for (const [y, c] of [[hz + 10, '#3a3a40'], [hz + 14, '#3a3a40'], [hz + 22, '#2a2a30']]) { B.fillStyle = c; B.fillRect(0, y, BW, 1.2); }
    for (let x = 0; x < BW; x += 6) { B.fillStyle = '#1e1a16'; B.fillRect(x, hz + 11, 2, 3); }
    vg(B, 0, hz + 26, BW, 10, ['#1a1a20', '#242428']); for (let x = 0; x < BW; x += 30) { B.fillStyle = 'rgba(230,200,90,0.5)'; B.fillRect(x, hz + 31, 14, 0.8); }
    for (const x of [140, 420, 760, 1080]) { B.fillStyle = '#0a0a0c'; B.fillRect(x, hz - 8, 1.4, 36); glow(B, x, hz - 9, 16, 'rgba(255,150,60,0.8)', 0.7); }
    fog(B, hz - 10, 50, 'rgba(90,60,60,0.3)');
    vignette(B, BW);
    // the deck: cracked four-lane concrete, a pothole, lane paint
    pfloor(F, 'stone', '#5a5a5c', '#2a2a2c', { rows: 8, span: 60, edge: '#7a7a78' });
    F.fillStyle = 'rgba(240,240,230,0.55)'; for (let x = 10; x < AWX; x += 60) { F.beginPath(); F.moveTo(x, H - 18); F.lineTo(x + 26, H - 18); F.lineTo(x + 28, H - 15); F.lineTo(x - 1, H - 15); F.fill(); }
    F.fillStyle = 'rgba(230,190,60,0.6)'; F.fillRect(0, FY + 8, AWX, 1.2); F.fillRect(0, FY + 10.5, AWX, 1.2);
    F.fillStyle = '#121214'; F.beginPath(); F.ellipse(720, H - 10, 26, 5, 0, 0, PI * 2); F.fill(); F.fillStyle = 'rgba(60,70,90,0.6)'; F.beginPath(); F.ellipse(722, H - 9, 18, 3, 0, 0, PI * 2); F.fill();
    // jersey barrier along the back edge, tagged end to end
    const by = FY - 24;
    F.fillStyle = '#6a6a66'; F.beginPath(); F.moveTo(0, FY); F.lineTo(0, FY - 8); F.lineTo(0, by); F.lineTo(AWX, by); F.lineTo(AWX, FY); F.fill();
    vg(F, 0, by, AWX, 24, ['#8a8a84', '#6a6a66', '#4a4a48']);
    F.fillStyle = 'rgba(0,0,0,0.25)'; F.fillRect(0, FY - 9, AWX, 2); F.fillStyle = 'rgba(255,255,255,0.15)'; F.fillRect(0, by, AWX, 1.2);
    for (let x = 0; x < AWX; x += 70) { F.fillStyle = 'rgba(0,0,0,0.35)'; F.fillRect(x, by, 1, 24); }
    grime(F, 0, by, AWX, 24, 40, 0.3);
    const tags = [['MUNCIE EATS ITS OWN', '#e83030', 60], ['NO WAY OUT', '#30d0ff', 230], ['THE PLANT CLOSED', '#ffd040', 370], ['SO DID WE', '#ff60c0', 500], ["DON'T LOOK DOWN", '#40ff70', 610], ['RUST BELT FOREVER', '#ff8a30', 770], ['NOBODY GETS OUT', '#e83030', 930], ['765', '#b070ff', 1060]];
    for (const [t, c, x] of tags) {
      F.save(); F.translate(x, by + 16); F.rotate(rr(-0.06, 0.06)); F.font = '11px Anton, Impact, sans-serif'; F.textAlign = 'left';
      F.fillStyle = '#0a0a0a'; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) F.fillText(t, dx, dy);
      F.fillStyle = shade(c, -0.15); F.fillText(t, 0, 0);
      const w = F.measureText(t).width; for (let i = 0; i < 4; i++) { F.fillStyle = shade(c, -0.3); F.fillRect(rr(0, w), 1, 1, rr(3, 8)); }
      F.restore();
    }
    // chain-link fence on top of the barrier, and the lights
    F.strokeStyle = 'rgba(160,160,170,0.22)'; F.lineWidth = 0.6;
    for (let x = -60; x < AWX + 60; x += 7) { F.beginPath(); F.moveTo(x, by); F.lineTo(x + 40, by - 40); F.moveTo(x, by); F.lineTo(x - 40, by - 40); F.stroke(); }
    F.fillStyle = '#2a2a2e'; for (let x = 0; x < AWX; x += 110) F.fillRect(x, by - 42, 2, 42); F.fillRect(0, by - 42, AWX, 1.6);
    for (const x of [200, 640, 1000]) lamp(F, x, by, 88, 'rgba(255,160,70,0.9)');
  }

  // ---------- PRAIRIE CREEK BEACH: the reservoir at dusk ----------
  function beach(B, F) {
    vg(B, 0, 0, BW, 120, ['#1a1438', '#3e2250', '#8a3a58', '#d8684a', '#f4a858']);
    clouds(B, 20, 80, 10, 'rgba(90,40,70,0.55)', 'rgba(255,170,120,0.35)', 1);
    seed = 503;
    const hz = 118, sx = 820;
    glow(B, sx, hz, 120, 'rgba(255,170,80,0.45)', 1); R.ball(B, sx, hz, 15, '#ffd27a'); B.fillStyle = 'rgba(255,240,200,0.6)'; B.beginPath(); B.arc(sx, hz, 11, 0, PI * 2); B.fill();
    // the far shore: flat, solid with trees
    for (let x = -10; x < BW; x += 7) { const h = rr(8, 20); B.fillStyle = rand() < 0.5 ? '#0e140e' : '#141a10'; B.beginPath(); B.ellipse(x, hz - h * 0.5, rr(5, 9), h * 0.6, 0, 0, PI * 2); B.fill(); }
    B.fillStyle = '#0e140e'; B.fillRect(0, hz - 6, BW, 6);
    // the reservoir
    vg(B, 0, hz, BW, FY - 30 - hz, ['#6a3a5a', '#4a2a4a', '#2a1a32']);
    for (let i = 0; i < 70; i++) { B.fillStyle = `rgba(255,200,120,${rr(0.15, 0.5)})`; B.fillRect(sx + rr(-26, 26) * (1 + i / 30), hz + 2 + i * 0.5, rr(4, 14), 0.8); }
    for (let i = 0; i < 90; i++) { B.fillStyle = 'rgba(255,220,200,0.12)'; B.fillRect(rr(0, BW), rr(hz + 3, FY - 32), rr(6, 20), 0.6); }
    // sand
    vg(B, 0, FY - 32, BW, 34, ['#c8906a', '#b07a58', '#8a5e44']);
    B.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = 0; x < BW; x += 3) B.fillRect(x, FY - 32 + Math.sin(x * 0.07) * 1.2, 3, 1);
    speckle(B, 0, FY - 30, BW, 30, 900, 0.25, 0.12);
    // umbrellas, towels and the torch posts
    for (const [x, c] of [[120, '#d8304a'], [330, '#2a8ad8'], [960, '#e8c020'], [1150, '#30a060']]) {
      B.fillStyle = '#3a2a1a'; B.fillRect(x - 0.8, FY - 46, 1.6, 30);
      for (let i = 0; i < 6; i++) { B.fillStyle = i % 2 ? c : '#f0ead8'; B.beginPath(); B.moveTo(x, FY - 50); B.lineTo(x - 22 + i * 7.3, FY - 40); B.lineTo(x - 14.7 + i * 7.3, FY - 40); B.fill(); }
      B.fillStyle = shade(c, -0.2); B.fillRect(x - 14, FY - 18, 26, 4);
    }
    for (const x of TIKI) { B.fillStyle = '#5a3a1e'; B.fillRect(x - 1.2, FY - 50, 2.4, 44); B.fillStyle = '#3a2410'; B.fillRect(x - 2.5, FY - 54, 5, 6); }
    fog(B, hz - 6, 20, 'rgba(255,170,140,0.25)');
    vignette(B, BW);
    // the fighting sand
    vg(F, 0, FY, AWX, H - FY, ['#a87452', '#8a5a3e', '#6a4230']);
    for (let i = 0; i < 3000; i++) { F.fillStyle = rand() < 0.5 ? 'rgba(255,230,190,0.18)' : 'rgba(60,30,10,0.2)'; F.fillRect(rand() * AWX, FY + rand() * (H - FY), 1, 1); }
    for (let i = 0; i < 40; i++) { const x = rand() * AWX, y = FY + 4 + rand() * (H - FY - 8); F.fillStyle = 'rgba(60,30,10,0.25)'; F.beginPath(); F.ellipse(x, y, 2.2, 1, 0.3, 0, PI * 2); F.fill(); F.beginPath(); F.ellipse(x + 7, y + 2, 2.2, 1, 0.3, 0, PI * 2); F.fill(); }
    for (let i = 0; i < 10; i++) { F.fillStyle = '#f0e0d0'; F.beginPath(); F.ellipse(rand() * AWX, FY + 6 + rand() * 40, 1.6, 1, 0, 0, PI * 2); F.fill(); }
    F.fillStyle = '#2a6ad8'; F.fillRect(820, H - 18, 18, 10); F.fillStyle = '#f0f0f0'; F.fillRect(820, H - 18, 18, 3);
    const dg = F.createLinearGradient(0, FY, 0, FY + 20); dg.addColorStop(0, 'rgba(0,0,0,0.35)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); F.fillStyle = dg; F.fillRect(0, FY, AWX, 20);
  }
  const TIKI = [70, 250, 470, 640, 800, 1010, 1220];
  const BOATS = (() => { const r = prng(91), a = []; for (let i = 0; i < 6; i++) a.push({ x0: r() * 1280, y: 124 + r() * 20, s: 0.5 + r() * 0.6, v: (r() < 0.5 ? -1 : 1) * (4 + r() * 7), sail: ['#f4ece0', '#f4ece0', '#e86a5a', '#f0d070'][i % 4], ph: r() * 6 }); return a; })();
  const SWIMMERS = (() => { const r = prng(57), a = [], suits = ['#e83a5a', '#2a9ad8', '#f0d040', '#30b070', '#f08030', '#c050c0', '#f4f0e8', '#1a1a22'];
    for (let i = 0; i < 24; i++) { const fem = r() < 0.5, x = 40 + i * 52 + r() * 24, pick = arr => arr[(r() * arr.length) | 0];
      a.push({ x, y: 184 - (i % 3) * 2, h: (fem ? 40 : 44) + r() * 6, fem, ph: r() * 6, speed: 2.4 + r() * 2, stance: 0.7 + r() * 0.7, skin: pick(SKINS), hair: pick(HAIRS), longHair: fem && r() < 0.8, bald: !fem && r() < 0.15,
        topKind: fem ? (r() < 0.65 ? 'bikini' : 'one') : 'none', top: pick(suits), bottom: pick(suits), bottomLen: fem ? null : (r() < 0.55 ? 'knee' : 'mid'), stripe: r() < 0.5 ? '#f4f0e8' : null,
        style: pick(['cheer', 'cheer', 'clap', 'hip', 'stand']), shades: r() < 0.35, hat: r() < 0.12 ? '#e8d8a0' : null, cap: !fem && r() < 0.12 ? pick(suits) : null, can: r() < 0.3, canC: pick(['#c8c8d0', '#d83030', '#f0f0f0']), rim: 'rgba(255,180,120,0.75)' }); }
    return a; })();
  const BRO_COLS = ['#7a3a3a', '#3a4a7a', '#5a5a5a', '#7a6a3a', '#3a6a5a', '#8a2a2a'];
  const BROS2 = (() => { const r = prng(77), a = []; for (let i = 0; i < 18; i++) a.push({ x: 60 + i * 66 + r() * 26, y: FY - 1, h: 42 + r() * 7, ph: r() * 6, speed: 3 + r() * 1.5, stance: 0.8 + r() * 0.6, skin: SKINS[(r() * SKINS.length) | 0], hair: HAIRS[(r() * HAIRS.length) | 0],
    topKind: 'shirt', sleeves: true, top: BRO_COLS[i % 6], logo: r() < 0.5 ? '#e8e0d0' : null, bottom: r() < 0.5 ? '#3a3a42' : '#6a5a3a', bottomLen: 'knee', shoes: '#e8e8e8', style: r() < 0.6 ? 'cheer' : r() < 0.5 ? 'hip' : 'stand', cap: r() < 0.7 ? BRO_COLS[(i + 3) % 6] : null, can: r() < 0.75, rim: 'rgba(255,210,150,0.6)' }); return a; })();

  // ---------- THE RENTAL: Slum Lord's condemned house on the east side ----------
  function rental(B, F) {
    vg(B, 0, 0, BW, H, ['#040806', '#0c1610', '#1a2418', '#2a2a1a']);
    stars(B, 30, 50); moon(B, 980, 30, 10, '#d8e0b8');
    clouds(B, 8, 80, 12, 'rgba(20,30,20,0.6)', 'rgba(110,130,90,0.25)', 1);
    seed = 307;
    // neighbors: more rentals, just as bad
    const shack = (x, w, h, c) => {
      wall(B, x, FY - h, w, h, c, { uplit: true }); for (let r = FY - h + 3; r < FY; r += 4) { B.fillStyle = 'rgba(0,0,0,0.28)'; B.fillRect(x, r, w, 0.8); }
      B.fillStyle = '#0a0c0a'; B.beginPath(); B.moveTo(x - 6, FY - h); B.lineTo(x + w / 2, FY - h - w * 0.32); B.lineTo(x + w + 6, FY - h); B.fill();
      win(B, x + 8, FY - h + 10, 10, 13, rand() < 0.3, '#c8e0a0'); B.fillStyle = '#3a2a1a'; B.fillRect(x + w - 20, FY - h + 10, 12, 14); B.fillStyle = '#5a4a32'; B.fillRect(x + w - 21, FY - h + 14, 14, 2); B.fillRect(x + w - 21, FY - h + 19, 14, 2);
    };
    for (const [x, w, h, c] of [[90, 78, 58, '#3a3a2e'], [200, 70, 52, '#2e3430'], [940, 80, 60, '#383028'], [1060, 72, 54, '#30342c']]) shack(x, w, h, c);
    treeline(B, FY, 14, '#060806', 40, 80, BW);
    fog(B, 110, 70, 'rgba(60,80,50,0.35)');
    // the big house: two stories of peeling siding, a sagging porch
    const x0 = CX - 150, w = 300, top = FY - 150;
    B.fillStyle = '#0a0c0a'; B.beginPath(); B.moveTo(x0 - 14, top); B.lineTo(CX - 20, top - 62); B.lineTo(CX + 10, top - 58); B.lineTo(x0 + w + 14, top); B.fill();
    for (let i = 0; i < 14; i++) { B.fillStyle = 'rgba(80,70,50,0.5)'; B.fillRect(x0 + 20 + i * 18, top - 30 + Math.abs(i - 7) * 3.6, 10, 2); }
    B.fillStyle = '#3a3a34'; B.fillRect(CX + 60, top - 52, 14, 26); B.fillStyle = '#221a14'; B.fillRect(CX + 58, top - 54, 18, 4);
    wall(B, x0, top, w, FY - top, '#6a6a52', { uplit: true });
    for (let r = top + 3; r < FY; r += 4.5) { B.fillStyle = 'rgba(0,0,0,0.3)'; B.fillRect(x0, r, w, 0.9); }
    // peeling paint and black mold creeping up from the ground
    for (let i = 0; i < 60; i++) { B.fillStyle = rand() < 0.5 ? 'rgba(160,150,120,0.35)' : 'rgba(30,24,16,0.4)'; B.fillRect(x0 + rand() * w, top + rand() * (FY - top), 2 + rand() * 7, 1 + rand() * 2); }
    for (let i = 0; i < 26; i++) { const mx = x0 + rand() * w, mh = 20 + rand() * 70; const gr = B.createLinearGradient(0, FY - mh, 0, FY); gr.addColorStop(0, 'rgba(20,40,10,0)'); gr.addColorStop(1, 'rgba(14,26,8,0.75)'); B.fillStyle = gr; B.beginPath(); B.ellipse(mx, FY - mh * 0.4, 6 + rand() * 12, mh * 0.6, 0, 0, PI * 2); B.fill(); }
    // windows: boarded, broken, one lit by a TV
    const board = (x, y, ww, hh) => { B.fillStyle = '#0a0806'; B.fillRect(x, y, ww, hh); for (let i = 0; i < 3; i++) { B.save(); B.translate(x + ww / 2, y + 5 + i * (hh - 8) / 2); B.rotate((i - 1) * 0.18); B.fillStyle = '#7a6040'; B.fillRect(-ww / 2 - 3, -2.2, ww + 6, 4.4); B.fillStyle = 'rgba(0,0,0,0.4)'; B.fillRect(-ww / 2 - 3, 1.4, ww + 6, 0.8); B.fillStyle = '#2a2a2a'; B.fillRect(-ww / 2 - 1, -0.6, 1.2, 1.2); B.fillRect(ww / 2, -0.6, 1.2, 1.2); B.restore(); } };
    board(x0 + 24, top + 14, 30, 40); board(x0 + 96, top + 14, 30, 40); win(B, x0 + 176, top + 14, 30, 40, true, '#8ab8e0'); board(x0 + 246, top + 14, 30, 40);
    B.fillStyle = '#0a0806'; B.beginPath(); B.moveTo(x0 + 178, top + 16); B.lineTo(x0 + 190, top + 30); B.lineTo(x0 + 182, top + 40); B.fill();
    board(x0 + 24, FY - 76, 30, 40); win(B, x0 + 246, FY - 76, 30, 40, false, '#ffb060');
    // porch, door, CONDEMNED notice
    B.fillStyle = '#1a1612'; B.fillRect(x0 + 64, FY - 86, 170, 5); B.save(); B.translate(x0 + 64, FY - 86); B.rotate(0.03); B.fillStyle = '#2a2018'; B.fillRect(0, 0, 170, 3); B.restore();
    for (const px of [x0 + 66, x0 + 140, x0 + 228]) { B.fillStyle = '#4a4030'; B.fillRect(px, FY - 82, 4, 82); }
    B.fillStyle = '#2a1e14'; B.fillRect(x0 + 136, FY - 70, 30, 70); B.fillStyle = '#c8a040'; B.fillRect(x0 + 160, FY - 36, 2, 2);
    B.fillStyle = '#e86a10'; B.fillRect(x0 + 140, FY - 62, 22, 16); B.fillStyle = '#1a0a04'; B.font = '5px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('CONDEMNED', x0 + 151, FY - 55); B.fillText('UNFIT', x0 + 151, FY - 49); B.textAlign = 'left';
    // couch on the porch
    B.fillStyle = '#4a3a5a'; B.fillRect(x0 + 82, FY - 24, 44, 14); B.fillRect(x0 + 82, FY - 34, 44, 10); B.fillStyle = '#3a2a48'; B.fillRect(x0 + 78, FY - 30, 6, 20); B.fillRect(x0 + 124, FY - 30, 6, 20);
    B.fillStyle = 'rgba(200,180,120,0.5)'; B.fillRect(x0 + 96, FY - 33, 10, 4);
    // the FOR RENT sign in the yard
    B.fillStyle = '#1a1410'; B.fillRect(x0 + w + 24, FY - 34, 2, 34); B.fillStyle = '#f2eedc'; B.fillRect(x0 + w + 8, FY - 50, 34, 20); B.strokeStyle = '#b01018'; B.lineWidth = 1.5; B.strokeRect(x0 + w + 9, FY - 49, 32, 18);
    B.fillStyle = '#b01018'; B.font = '7px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('FOR RENT', x0 + w + 25, FY - 41); B.font = '4px Anton, Impact, sans-serif'; B.fillStyle = '#2a2a2a'; B.fillText('NO REFUNDS', x0 + w + 25, FY - 34); B.textAlign = 'left';
    // a fridge at the curb, a dead tree
    B.fillStyle = '#c8c4b0'; B.fillRect(x0 - 60, FY - 40, 20, 40); B.fillStyle = '#8a8670'; B.fillRect(x0 - 60, FY - 26, 20, 1.5); B.fillRect(x0 - 43, FY - 36, 1.5, 8);
    B.strokeStyle = '#0c0a08'; B.lineWidth = 4; B.beginPath(); B.moveTo(x0 + w + 80, FY); B.lineTo(x0 + w + 74, FY - 90); B.stroke(); B.lineWidth = 2; for (const [a, b] of [[-0.8, 40], [0.7, 34], [-0.3, 50], [1.1, 28]]) { B.beginPath(); B.moveTo(x0 + w + 76, FY - 60 - b * 0.4); B.lineTo(x0 + w + 76 + Math.sin(a) * b, FY - 60 - b * 0.4 - Math.cos(a) * b); B.stroke(); }
    grime(B, x0, top, w, FY - top, 30, 0.25);
    fog(B, FY - 40, 50, 'rgba(70,90,50,0.35)');
    vignette(B, BW);
    // the yard: dead grass, mud, trash
    pfloor(F, 'stone', '#3a3424', '#14120a', { rows: 8, span: 50, wet: true, edge: '#4a4a30' });
    for (let i = 0; i < 160; i++) { F.fillStyle = rand() < 0.5 ? 'rgba(90,100,40,0.6)' : 'rgba(40,30,16,0.6)'; F.fillRect(rand() * AWX, FY + rand() * (H - FY), 1, 2 + rand() * 3); }
    for (let i = 0; i < 26; i++) { F.fillStyle = ['#c8c0a0', '#8a2020', '#3a6a3a', '#d8d8d8', '#2a4a8a'][i % 5]; F.fillRect(rand() * AWX, FY + 4 + rand() * (H - FY - 6), 2 + rand() * 4, 1 + rand() * 2); }
    for (const x of [180, 900]) lamp(F, x, FY + 3, 74, 'rgba(200,230,150,0.85)');
  }

  const DEFS = {
    cityhall: { name: 'CITY HALL', draw: (B, F) => cityhall(B, F, false) },
    hell: { name: 'CITY HALL', draw: (B, F) => cityhall(B, F, true) },
    benny: { name: 'CAMPUS', draw: benny },
    bridge: { name: 'WHITE RIVER RAILROAD BRIDGE', draw: bridge, pit: 'bridge' },
    overpass: { name: 'TILLOTSON OVERPASS', draw: overpass, pit: 'overpass' },
    beach: { name: 'PRAIRIE CREEK BEACH', draw: beach },
    minnetrista: { name: 'MINNETRISTA', draw: minnetrista },
    westend: { name: 'GILLESPIE TOWER', draw: westend },
    greenway: { name: 'WYSOR STREET DEPOT', draw: greenway },
    shedtown: { name: 'SHEDTOWN DRIVE-IN', draw: shedtown },
    cornbread: { name: 'CORNBREAD ROAD', draw: cornbread },
    glassworks: { name: 'BALL GLASS WORKS', draw: glassworks },
    village: { name: 'THE VILLAGE', draw: village },
    rental: { name: 'THE RENTAL', draw: rental },
  };
  const cache = {};
  function get(id) {
    if (!DEFS[id]) id = 'cityhall';
    if (cache[id]) return cache[id];
    seed = 11 + id.length * 97;
    const back = mk(BW), front = mk(AWX);
    DEFS[id].draw(back.getContext('2d'), front.getContext('2d'));
    digitize(back, 14, 0.85); digitize(front, 14, 0.85);
    return (cache[id] = { id, name: DEFS[id].name, pit: DEFS[id].pit || false, back, front, bxOff: -206 });
  }
  function name(id) { return (DEFS[id] || DEFS.cityhall).name; }

  // animated bits drawn each frame on top of the far layer (back-layer coords)
  function live(g, id, t) {
    if (id === 'cityhall' || id === 'hell') {
      for (const x of [CX - 62, CX + 62]) glow(g, x, FY - 12, 24 + Math.sin(t * 7 + x) * 3, id === 'hell' ? 'rgba(255,60,0,0.25)' : 'rgba(255,220,160,0.12)');
      if (id === 'hell') for (let i = 0; i < 10; i++) { const x = (i * 131 + t * 30) % BW, y = FY - ((t * 40 + i * 37) % 160); g.fillStyle = 'rgba(255,120,30,0.8)'; g.fillRect(x, y, 1.5, 1.5); }
      else { g.strokeStyle = 'rgba(170,180,220,0.22)'; g.lineWidth = 0.6; for (let i = 0; i < 70; i++) { const x = (i * 97.3 + t * 30) % BW, y = (i * 53.1 + t * 420) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 9); g.stroke(); } }
    }
    if (id === 'shedtown') {
      const x = 500; g.fillStyle = '#1a1a1e'; g.fillRect(x - 8, FY - 22, 16, 22);
      for (let i = 0; i < 5; i++) { const r = 3 + Math.sin(t * 9 + i) * 1.5; g.fillStyle = i % 2 ? '#ff8a20' : '#ffd040'; g.beginPath(); g.arc(x - 6 + i * 3, FY - 25 - Math.abs(Math.sin(t * 7 + i * 2)) * 9, r, 0, PI * 2); g.fill(); }
      glow(g, x, FY - 26, 46 + Math.sin(t * 11) * 5, 'rgba(255,120,30,0.45)');
      const on = Math.floor(t * 6) % 2; for (let i = 0; i < 7; i++) if ((i + on) % 2) glow(g, CX + 75 + i * 11, FY - 177, 5, 'rgba(255,230,120,1)');
    }
    if (id === 'cornbread') {
      for (let i = 0; i < 3; i++) {
        const x = (300 + i * 360 + Math.sin(t * 0.4 + i) * 60) % BW, y = 40 + i * 14 + Math.sin(t * 1.3 + i) * 5;
        g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, y, 0, FY); gr.addColorStop(0, 'rgba(160,255,200,0.3)'); gr.addColorStop(1, 'rgba(160,255,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.lineTo(x + 26, FY); g.lineTo(x - 26, FY); g.fill(); g.restore();
        g.fillStyle = '#2a2a34'; g.beginPath(); g.ellipse(x, y, 18, 5, 0, 0, PI * 2); g.fill(); g.fillStyle = '#8a8aa0'; g.beginPath(); g.ellipse(x, y - 3, 8, 4, 0, PI, 0); g.fill();
        for (let k = 0; k < 4; k++) glow(g, x - 12 + k * 8, y + 1, 4, (Math.floor(t * 8) + k) % 2 ? 'rgba(255,60,60,1)' : 'rgba(80,255,120,1)');
      }
    }
    if (id === 'beach') {
      for (const b of BOATS) {
        const x = ((b.x0 + t * b.v) % 1400 + 1400) % 1400 - 60, y = b.y + Math.sin(t * 1.3 + b.ph) * 0.8, s = b.s * (0.6 + (b.y - 120) / 40);
        g.fillStyle = '#1a1018'; g.beginPath(); g.moveTo(x - 9 * s, y); g.lineTo(x + 9 * s, y); g.lineTo(x + 6 * s, y + 3 * s); g.lineTo(x - 6 * s, y + 3 * s); g.fill();
        g.fillStyle = '#2a2026'; g.fillRect(x - 0.5, y - 22 * s, 1, 22 * s);
        g.fillStyle = b.sail; g.beginPath(); g.moveTo(x + 0.8, y - 21 * s); g.lineTo(x + 0.8, y - 1.5 * s); g.lineTo(x + 11 * s * Math.sign(b.v || 1), y - 1.5 * s); g.fill();
        g.fillStyle = 'rgba(255,150,90,0.35)'; g.beginPath(); g.moveTo(x - 0.8, y - 17 * s); g.lineTo(x - 0.8, y - 1.5 * s); g.lineTo(x - 7 * s * Math.sign(b.v || 1), y - 1.5 * s); g.fill();
        g.fillStyle = 'rgba(255,200,160,0.25)'; g.fillRect(x - 8 * s, y + 3.5 * s, 16 * s, 0.8);
      }
      g.save(); g.globalAlpha = 0.9; for (const p of SWIMMERS) person(g, p, t); g.restore();
      for (const x of TIKI) { const fl = Math.sin(t * 13 + x) * 1.5; glow(g, x, FY - 58, 26, 'rgba(255,140,40,0.5)', 0.8); g.fillStyle = '#ff8a20'; g.beginPath(); g.moveTo(x - 3, FY - 54); g.quadraticCurveTo(x - 2 + fl, FY - 64, x + fl * 0.5, FY - 69); g.quadraticCurveTo(x + 2 + fl, FY - 62, x + 3, FY - 54); g.fill(); g.fillStyle = '#ffe080'; g.beginPath(); g.ellipse(x, FY - 57, 1.6, 3, 0, 0, PI * 2); g.fill(); }
    }
    if (id === 'overpass') {
      // traffic on 32 and, now and then, a freight train down in the cut
      for (let i = 0; i < 6; i++) { const dir = i % 2 ? 1 : -1, x = ((t * 90 * dir + i * 260) % 1400 + 1400) % 1400 - 60, y = 150 + 28 + (i % 2) * 3; g.fillStyle = dir > 0 ? 'rgba(255,250,220,0.9)' : 'rgba(255,40,30,0.9)'; g.fillRect(x, y, 2, 1.2); g.fillRect(x + 4, y, 2, 1.2); }
      const cyc = t % 22;
      if (cyc < 9) { const x = 1400 - cyc * 220; glow(g, x, 160, 14, 'rgba(255,250,200,0.9)', 0.9); g.fillStyle = '#0a0a0c'; g.fillRect(x, 157, 26, 7); for (let c = 0; c < 26; c++) { g.fillStyle = ['#2a1a14', '#1a1a1e', '#2a2018'][c % 3]; g.fillRect(x + 28 + c * 23, 156, 21, 8); } }
    }
    if (id === 'rental') { const fl = Math.sin(t * 13) * Math.sin(t * 7.3) > 0.1 ? 0.22 : 0.08; g.fillStyle = `rgba(120,170,240,${fl})`; g.fillRect(CX - 150 + 170, FY - 150 + 8, 44, 54); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(20,20,10,0.8)'; g.fillRect(CX - 60 + Math.sin(t * 3 + i * 2) * 30 + i * 8, FY - 40 + Math.cos(t * 4 + i) * 12, 1, 1); } }
    if (id === 'village') { bros(g, t); for (let i = 0; i < 4; i++) { const on = Math.sin(t * 3 + i * 2) > -0.7; if (on) glow(g, 78 + i * 166, FY - 75, 30, 'rgba(255,120,200,0.1)'); } }
    if (id === 'glassworks') for (const x of [230, 640, 1050]) glow(g, x, 160, 40 + Math.sin(t * 6 + x) * 8, 'rgba(255,140,40,0.3)');
    if (id === 'benny') { for (const d of [-78, 78]) glow(g, CX + d, FY - 158, 14 + Math.sin(t * 9 + d) * 2, 'rgba(255,220,150,0.35)'); }
    if (id === 'bridge') { for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(230,230,210,${0.1 + 0.25 * Math.abs(Math.sin(t * 2 + i))})`; g.fillRect(800 + Math.sin(i * 7.1) * 70 * (1 + i / 30), 175 + i * 2, 8 + (i % 4) * 4, 0.8); } }
  }
  // the view from under the bridge for the stage fatality
  function drawBelow(g, W, t, kind) {
    if (kind === 'river') return belowRiver(g, W, t);
    if (kind === 'overpass') return belowOverpass(g, W, t);
    vg(g, 0, 0, W, H, ['#05060c', '#0e1424', '#141a24']);
    g.fillStyle = '#2a2620'; g.fillRect(0, 0, W, 22);
    for (let x = 0; x < W; x += 34) { g.fillStyle = '#1a1814'; g.fillRect(x, 0, 6, 70); }
    vg(g, 0, 150, W, 40, ['#0a1420', '#1a2a3a']);
    vg(g, 0, 190, W, 50, ['#3a342c', '#26221c']);
    for (let x = -10; x < W; x += 14) { g.fillStyle = '#3a2a1a'; g.fillRect(x, 203, 9, 14); }
    g.fillStyle = '#8a8a90'; g.fillRect(0, 202, W, 2.5); g.fillRect(0, 214, W, 2.5);
    g.fillStyle = '#c8c8d0'; g.fillRect(0, 202, W, 0.8); g.fillRect(0, 214, W, 0.8);
  }
  function belowRiver(g, W, t) {
    vg(g, 0, 0, W, H, ['#02030a', '#08101e', '#0e1828']);
    seed = 61; for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.5})`; g.fillRect(rand() * W, rand() * 110, 1, 1); }
    R.ball(g, W * 0.78, 70, 12, '#ece6cf');
    for (let x = -10; x < W; x += 9) { const h = rr(18, 46); g.fillStyle = '#05080a'; g.beginPath(); g.ellipse(x, 140 - h * 0.4, rr(6, 12), h * 0.6, 0, 0, PI * 2); g.fill(); }
    g.fillStyle = '#05080a'; g.fillRect(0, 128, W, 14);
    // the trestle overhead
    g.fillStyle = '#06070a'; g.fillRect(0, 0, W, 16); g.fillRect(0, 38, W, 5);
    for (let x = -20; x < W; x += 28) { g.strokeStyle = '#06070a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 40); g.lineTo(x + 14, 14); g.lineTo(x + 28, 40); g.stroke(); }
    g.fillStyle = 'rgba(140,150,180,0.25)'; g.fillRect(0, 16, W, 0.8);
    // shallow river, moonlight, and the rocks
    vg(g, 0, 140, W, 100, ['#0c1626', '#122236', '#0a1420']);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(230,230,210,${0.1 + 0.25 * Math.abs(Math.sin(t * 2 + i))})`; g.fillRect(W * 0.78 + Math.sin(i * 7.1) * 40 * (1 + i / 30), 146 + i * 2, 8 + (i % 4) * 4, 0.8); }
    const rock = (x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x - w, y + h * 0.3); g.quadraticCurveTo(x - w * 0.9, y - h * 0.6, x - w * 0.2, y - h); g.quadraticCurveTo(x + w * 0.6, y - h * 1.05, x + w, y - h * 0.1); g.quadraticCurveTo(x + w * 0.9, y + h * 0.4, x, y + h * 0.45); g.closePath(); g.fill();
      g.fillStyle = 'rgba(200,210,230,0.18)'; g.beginPath(); g.ellipse(x - w * 0.2, y - h * 0.75, w * 0.5, h * 0.18, -0.1, 0, PI * 2); g.fill();
      g.fillStyle = 'rgba(230,240,255,0.35)'; g.fillRect(x - w, y + h * 0.3, w * 2, 0.8); };
    rock(W * 0.5, 214, 62, 18, '#4a4a4c'); rock(W * 0.5 - 70, 222, 30, 12, '#3a3a3e'); rock(W * 0.5 + 76, 220, 34, 14, '#424246'); rock(W * 0.2, 226, 22, 8, '#323236'); rock(W * 0.82, 230, 26, 9, '#36363a');
    for (let i = 0; i < 10; i++) { const x = (i * 97 + t * 30) % W; g.fillStyle = 'rgba(200,220,255,0.15)'; g.fillRect(x, 232 + (i % 3) * 2, 12, 0.8); }
  }
  function belowOverpass(g, W, t) {
    vg(g, 0, 0, W, H, ['#05060c', '#0e1020', '#161420']);
    // the overpass deck above, the barrier face with its tags
    vg(g, 0, 0, W, 30, ['#4a4a48', '#3a3a38']); g.fillStyle = '#2a2a28'; g.fillRect(0, 30, W, 4);
    g.font = '10px Anton, Impact, sans-serif'; g.fillStyle = '#e83030'; g.fillText('NO WAY OUT', 30, 22); g.fillStyle = '#30d0ff'; g.fillText("DON'T LOOK DOWN", W - 120, 20);
    for (const x of [W * 0.15, W * 0.85]) { vg(g, x - 12, 34, 24, 160, ['#5a5a58', '#3a3a38']); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 4, 34, 8, 160); }
    glow(g, W * 0.5, 60, 120, 'rgba(255,150,60,0.25)', 1);
    // the cut: chain link, gravel, the rails
    g.strokeStyle = 'rgba(150,150,160,0.18)'; g.lineWidth = 0.6; for (let x = -40; x < W + 40; x += 7) { g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 30, 120); g.moveTo(x, 150); g.lineTo(x - 30, 120); g.stroke(); }
    vg(g, 0, 150, W, 40, ['#14141a', '#1e1c1c']);
    vg(g, 0, 190, W, 50, ['#3a342c', '#26221c']);
    seed = 83; for (let i = 0; i < 500; i++) { g.fillStyle = rand() < 0.5 ? 'rgba(150,140,130,0.35)' : 'rgba(0,0,0,0.35)'; g.fillRect(rand() * W, 190 + rand() * 50, 1.4, 1); }
    for (let x = -10; x < W; x += 14) { g.fillStyle = '#3a2a1a'; g.fillRect(x, 203, 9, 14); }
    g.fillStyle = '#8a8a90'; g.fillRect(0, 202, W, 2.5); g.fillRect(0, 214, W, 2.5);
    g.fillStyle = '#c8c8d0'; g.fillRect(0, 202, W, 0.8); g.fillRect(0, 214, W, 0.8);
    g.fillStyle = '#0a0a0c'; g.fillRect(W * 0.7, 120, 2, 82); R.ball(g, W * 0.7 + 1, 118, 3, '#2a0a0a'); glow(g, W * 0.7 + 1, 118, 8, 'rgba(255,30,20,0.9)', 0.9);
  }
  function drawTrain(g, x, y) {
    // a big black six-axle road diesel leading a string of hoppers and boxcars
    const LH = 112, LL = 230;
    g.fillStyle = '#121214'; g.fillRect(x, y - 30, LL, 16);
    for (const tx of [x + 22, x + LL - 74]) { g.fillStyle = '#1a1a1c'; g.fillRect(tx, y - 18, 56, 12); for (let i = 0; i < 3; i++) R.ball(g, tx + 9 + i * 19, y - 5, 7.5, '#2a2a2e'); }
    g.fillStyle = '#101012'; g.fillRect(x + 4, y - LH + 22, LL - 10, LH - 52);
    g.fillStyle = '#0c0c0e'; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x, y - 74); g.lineTo(x + 8, y - LH + 6); g.lineTo(x + 48, y - LH + 6); g.lineTo(x + 52, y - 74); g.lineTo(x + 52, y - 30); g.fill();
    g.fillStyle = '#9ab0c0'; g.fillRect(x + 8, y - LH + 14, 18, 13); g.fillRect(x + 30, y - LH + 14, 16, 13); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x + 9, y - LH + 15, 4, 11);
    g.fillStyle = '#d8d8d8'; g.fillRect(x, y - 50, LL - 6, 4); g.fillStyle = '#8a8a8e'; g.fillRect(x + 52, y - LH + 22, LL - 58, 3);
    g.fillStyle = '#e8e8e8'; g.font = '11px Anton, Impact, sans-serif'; g.fillText('9265', x + 64, y - 36);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 60 + i * 26, y - LH + 26, 1.2, LH - 58); }
    g.fillStyle = '#1e1e22'; g.fillRect(x + LL - 60, y - LH + 14, 36, 8);
    R.ball(g, x + 3, y - 40, 5, '#fffbe0'); R.ball(g, x + 3, y - 92, 4, '#fffbe0');
    g.fillStyle = 'rgba(255,250,210,0.35)'; g.beginPath(); g.moveTo(x, y - 46); g.lineTo(x - 140, y - 70); g.lineTo(x - 140, y - 10); g.fill();
    g.fillStyle = '#c8a020'; g.fillRect(x, y - 30, 52, 3);
    for (let c = 0; c < 6; c++) {
      const cx = x + LL + 10 + c * 150, hop = c % 2 === 0;
      g.fillStyle = ['#3a2418', '#2a2a2e', '#4a1e16'][c % 3];
      if (hop) { g.beginPath(); g.moveTo(cx, y - 96); g.lineTo(cx + 140, y - 96); g.lineTo(cx + 140, y - 40); g.lineTo(cx + 110, y - 22); g.lineTo(cx + 30, y - 22); g.lineTo(cx, y - 40); g.fill(); }
      else g.fillRect(cx, y - 100, 140, 80);
      g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(cx + 4, y - 94, 132, 2);
      g.fillStyle = 'rgba(0,0,0,0.3)'; for (let r = 0; r < 8; r++) g.fillRect(cx + 8 + r * 17, y - 96, 1.4, 70);
      g.fillStyle = '#c8c8d0'; g.font = '10px Anton, Impact, sans-serif'; g.fillText('MWRR ' + (40112 + c * 37), cx + 34, y - 58);
      for (const wx of [cx + 18, cx + 36, cx + 104, cx + 122]) R.ball(g, wx, y - 6, 7, '#2a2a2e');
      g.fillStyle = '#121214'; g.fillRect(cx - 10, y - 26, 10, 4);
    }
  }

  return { AW: AWX, H, FLOOR, get, name, live, drawBelow, drawTrain, ROTATION: ['benny', 'bridge', 'minnetrista', 'westend', 'greenway', 'shedtown', 'cornbread', 'cityhall', 'village', 'overpass', 'beach'] };
})();
