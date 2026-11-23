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
      stones(B, x0, wy, wingW, FY - wy, hell ? '#8a5a48' : '#b8ae98', 18, 9);
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
    B.save(); B.clip(); stones(B, m - cw / 2, ctop, cw, FY - ctop, hell ? '#a06a50' : '#d8ccb0', 20, 10); vg(B, m - cw / 2, ctop, cw, FY - ctop, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'rgba(255,200,140,0.15)']); B.restore();
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
    B.fillStyle = '#e8e2d0'; B.font = '9px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillText('BENEFICENCE', m, FY - 6); B.textAlign = 'left';
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
    B.font = '15px Anton, Impact, sans-serif'; B.textAlign = 'center';
    [['YOU', '#ff3a8a'], ['ARE', '#ffd040'], ['BEAUTIFUL', '#30e8ff']].forEach(([t, c], i) => { const y = 88 + i * 22, fs = i === 2 ? 11 : 15; B.font = fs + 'px Anton, Impact, sans-serif'; B.fillStyle = '#0a0a0a'; for (const [dx, dy] of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5]]) B.fillText(t, px + 32 + dx, y + dy); B.fillStyle = shade(c, -0.25); B.fillText(t, px + 32, y); });
    B.textAlign = 'left';
    for (let x = -10; x < BW; x += 30) { if (x > px - 30 && x < px + 64) continue; B.strokeStyle = '#06070a'; B.lineWidth = 3; B.beginPath(); B.moveTo(x, 150); B.lineTo(x + 15, 100); B.lineTo(x + 30, 150); B.stroke(); B.strokeStyle = 'rgba(160,170,200,0.25)'; B.lineWidth = 0.8; B.beginPath(); B.moveTo(x + 1, 150); B.lineTo(x + 16, 100); B.stroke(); }
    B.fillStyle = '#06070a'; B.fillRect(0, 96, px - 6, 6); B.fillRect(px + 70, 96, BW, 6); B.fillRect(0, 150, BW, 8);
    B.fillStyle = 'rgba(160,170,200,0.25)'; B.fillRect(0, 96, BW, 1);
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
    const top = FY - 118, sf = FY - 66, x0 = -10, x1 = BW + 10;
    bricks(B, x0, top, x1 - x0, sf - top, '#6a2a22', '#1a0806', 7, 3.2);
    vg(B, x0, top, x1 - x0, sf - top, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.1)', 'rgba(255,150,90,0.12)']);
    B.fillStyle = '#2a1a16'; B.fillRect(x0, top - 6, x1 - x0, 7); B.fillStyle = '#8a7a6a'; B.fillRect(x0, top - 7, x1 - x0, 2);
    for (let x = 14; x < BW; x += 34) { win(B, x, top + 12, 14, 20, rand() < 0.45, rand() < 0.3 ? '#a0c0ff' : '#ffc070', '#1a1412'); B.fillStyle = '#9a8a7a'; B.fillRect(x - 2, top + 32, 18, 2.4); }
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
        B.fillStyle = '#1a0a08'; B.fillRect(x - 4, top - 30, 120, 24); B.strokeStyle = '#c8b060'; B.lineWidth = 1.5; B.strokeRect(x - 3, top - 29, 118, 22);
        B.font = '14px Anton, Impact, sans-serif'; B.textAlign = 'center'; B.fillStyle = '#ff3030'; B.shadowColor = '#ff2020'; B.shadowBlur = 10; B.fillText('THE VILLAGE', x + 56, top - 12); B.shadowBlur = 0; B.textAlign = 'left';
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
    g.save(); g.globalAlpha = 0.55;
    for (const b of BROS) {
      const bob = Math.abs(Math.sin(t * 5 + b.ph)) * 3, x = b.x, y = FY - 2 - bob, h = b.h, up = Math.sin(t * 2.5 + b.ph) > 0;
      g.fillStyle = b.col; g.fillRect(x - 7, y - h * 0.62, 14, h * 0.32);
      g.fillStyle = '#1a1a24'; g.fillRect(x - 6, y - h * 0.32, 5, h * 0.32); g.fillRect(x + 1, y - h * 0.32, 5, h * 0.32);
      g.fillStyle = '#c89070'; g.beginPath(); g.arc(x, y - h * 0.72, 5, 0, PI * 2); g.fill();
      if (b.cap) { g.fillStyle = b.col; g.fillRect(x - 5, y - h * 0.8, 10, 3.5); g.fillRect(x - 9, y - h * 0.77, 5, 1.6); }
      // arms: one pumping, one holding a can up
      const ay = y - h * 0.58, a1 = up ? -2.2 : -1.2, a2 = up ? -1.0 : -2.4;
      g.strokeStyle = b.col; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x - 6, ay); g.lineTo(x - 6 + Math.cos(a1) * 12, ay + Math.sin(a1) * 12); g.stroke();
      g.beginPath(); g.moveTo(x + 6, ay); g.lineTo(x + 6 - Math.cos(a2) * 12, ay + Math.sin(a2) * 12); g.stroke();
      if (b.can) { g.fillStyle = '#c8c8d0'; g.fillRect(x + 6 - Math.cos(a2) * 12 - 1.5, ay + Math.sin(a2) * 12 - 5, 3.5, 5); }
    }
    g.restore();
    fog(g, FY - 60, 64, 'rgba(60,40,70,0.4)');
  }

  const DEFS = {
    cityhall: { name: 'CITY HALL', draw: (B, F) => cityhall(B, F, false) },
    hell: { name: 'CITY HALL', draw: (B, F) => cityhall(B, F, true) },
    benny: { name: 'BENEFICENCE', draw: benny },
    bridge: { name: 'WHITE RIVER RAILROAD BRIDGE', draw: bridge, pit: true },
    minnetrista: { name: 'MINNETRISTA', draw: minnetrista },
    westend: { name: 'GILLESPIE TOWER', draw: westend },
    greenway: { name: 'WYSOR STREET DEPOT', draw: greenway },
    shedtown: { name: 'SHEDTOWN DRIVE-IN', draw: shedtown },
    cornbread: { name: 'CORNBREAD ROAD', draw: cornbread },
    glassworks: { name: 'BALL GLASS WORKS', draw: glassworks },
    village: { name: 'THE VILLAGE', draw: village },
  };
  const cache = {};
  function get(id) {
    if (!DEFS[id]) id = 'cityhall';
    if (cache[id]) return cache[id];
    seed = 11 + id.length * 97;
    const back = mk(BW), front = mk(AWX);
    DEFS[id].draw(back.getContext('2d'), front.getContext('2d'));
    digitize(back, 14, 0.85); digitize(front, 14, 0.85);
    return (cache[id] = { id, name: DEFS[id].name, pit: !!DEFS[id].pit, back, front, bxOff: -206 });
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
    if (id === 'village') { bros(g, t); for (let i = 0; i < 4; i++) { const on = Math.sin(t * 3 + i * 2) > -0.7; if (on) glow(g, 78 + i * 166, FY - 75, 30, 'rgba(255,120,200,0.1)'); } }
    if (id === 'glassworks') for (const x of [230, 640, 1050]) glow(g, x, 160, 40 + Math.sin(t * 6 + x) * 8, 'rgba(255,140,40,0.3)');
    if (id === 'benny') { for (const d of [-78, 78]) glow(g, CX + d, FY - 158, 14 + Math.sin(t * 9 + d) * 2, 'rgba(255,220,150,0.35)'); }
    if (id === 'bridge') { for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(230,230,210,${0.1 + 0.25 * Math.abs(Math.sin(t * 2 + i))})`; g.fillRect(800 + Math.sin(i * 7.1) * 70 * (1 + i / 30), 175 + i * 2, 8 + (i % 4) * 4, 0.8); } }
  }
  // the view from under the bridge for the stage fatality
  function drawBelow(g, W, t) {
    vg(g, 0, 0, W, H, ['#05060c', '#0e1424', '#141a24']);
    g.fillStyle = '#2a2620'; g.fillRect(0, 0, W, 22);
    for (let x = 0; x < W; x += 34) { g.fillStyle = '#1a1814'; g.fillRect(x, 0, 6, 70); }
    vg(g, 0, 150, W, 40, ['#0a1420', '#1a2a3a']);
    vg(g, 0, 190, W, 50, ['#3a342c', '#26221c']);
    for (let x = -10; x < W; x += 14) { g.fillStyle = '#3a2a1a'; g.fillRect(x, 203, 9, 14); }
    g.fillStyle = '#8a8a90'; g.fillRect(0, 202, W, 2.5); g.fillRect(0, 214, W, 2.5);
    g.fillStyle = '#c8c8d0'; g.fillRect(0, 202, W, 0.8); g.fillRect(0, 214, W, 0.8);
  }
  function drawTrain(g, x, y) {
    // locomotive facing left, then boxcars
    g.fillStyle = '#1a1a1e'; g.fillRect(x, y - 52, 130, 46);
    g.fillStyle = '#d8a020'; g.fillRect(x, y - 30, 130, 6);
    g.fillStyle = '#2a2a30'; g.fillRect(x + 6, y - 66, 34, 16);
    g.fillStyle = '#e8e8b0'; g.fillRect(x + 10, y - 62, 10, 7);
    R.ball(g, x + 3, y - 40, 4, '#fff8d0');
    g.fillStyle = '#0a0a0a'; for (let i = 0; i < 4; i++) R.ball(g, x + 16 + i * 30, y - 4, 6, '#2a2a2e');
    for (let c = 0; c < 6; c++) {
      const cx = x + 140 + c * 120;
      g.fillStyle = ['#5a2a1a', '#3a3a3a', '#4a1a1a'][c % 3]; g.fillRect(cx, y - 56, 112, 50);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(cx + 4, y - 50, 104, 2);
      g.fillStyle = '#c8c8d0'; g.font = '9px Anton, Impact, sans-serif'; g.fillText(['CSX', 'NS', 'MUNCIE'][c % 3], cx + 30, y - 26);
      R.ball(g, cx + 16, y - 4, 6, '#2a2a2e'); R.ball(g, cx + 96, y - 4, 6, '#2a2a2e');
    }
  }

  return { AW: AWX, H, FLOOR, get, name, live, drawBelow, drawTrain, ROTATION: ['benny', 'bridge', 'minnetrista', 'westend', 'greenway', 'shedtown', 'cornbread', 'cityhall', 'village'] };
})();
