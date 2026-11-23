// Muncie Kombat: arenas, drawn once into layers (far layer scrolls slower than the floor)
'use strict';
const STAGES = (() => {
  const R = RIG, PI = Math.PI;
  const AW = 760, H = 240, FLOOR = 222, AWX = 1100, PAD = (AWX - AW) / 2;
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const mk = () => { const c = document.createElement('canvas'); c.width = AW; c.height = H; return c; };

  function grit(c, amt = 14) {
    const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const n = (rand() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(img, 0, 0);
  }
  function vgrad(g, x, y, w, h, stops) { const gr = g.createLinearGradient(0, y, 0, y + h); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); g.fillStyle = gr; g.fillRect(x, y, w, h); }
  function glow(g, x, y, r, c) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  function bricks(g, x, y, w, h, c1, c2, bw = 8, bh = 4) {
    g.fillStyle = c1; g.fillRect(x, y, w, h);
    g.fillStyle = c2;
    for (let yy = y; yy < y + h; yy += bh) { g.fillRect(x, yy, w, 0.7); const off = ((yy - y) / bh) % 2 ? bw / 2 : 0; for (let xx = x + off; xx < x + w; xx += bw) g.fillRect(xx, yy, 0.7, bh); }
  }
  function windows(g, x, y, cols, rows, w, h, gx, gy, lit) {
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { g.fillStyle = rand() < lit ? (rand() < 0.5 ? '#e8c060' : '#c89838') : '#1a1820'; g.fillRect(x + i * gx, y + j * gy, w, h); }
  }
  function trees(g, y, n, c, h0, h1) {
    for (let i = 0; i < n; i++) { const x = rand() * AW, h = h0 + rand() * (h1 - h0); g.fillStyle = c; g.beginPath(); g.ellipse(x, y - h * 0.6, h * 0.35, h * 0.5, 0, 0, PI * 2); g.fill(); g.fillRect(x - 1.5, y - h * 0.3, 3, h * 0.3); }
  }
  function stars(g, n, h) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.6})`; g.fillRect(rand() * AW, rand() * h, 1, 1); } }
  // perspective floor: slats from the horizon line to the bottom
  function floorPlanks(g, top, c1, c2, n = 26) {
    vgrad(g, 0, top, AW, H - top, [c1, c2]);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.8;
    for (let i = -n; i <= n * 2; i++) { const x0 = AW / 2 + (i - n / 2) * 30; g.beginPath(); g.moveTo(AW / 2 + (x0 - AW / 2) * 0.55, top); g.lineTo(x0 + (x0 - AW / 2) * 0.3, H); g.stroke(); }
  }

  // ---------- the arenas ----------
  function fieldhouse(B, F) {
    vgrad(B, 0, 0, AW, H, ['#0a0610', '#1c1222', '#2a1a20']);
    // steel trusses
    B.strokeStyle = '#2e2a36'; B.lineWidth = 2;
    for (let x = 0; x < AW; x += 60) { B.beginPath(); B.moveTo(x, 8); B.lineTo(x + 30, 30); B.lineTo(x + 60, 8); B.stroke(); }
    B.fillStyle = '#2e2a36'; B.fillRect(0, 6, AW, 3); B.fillRect(0, 29, AW, 2);
    // bleachers with the crowd
    for (let r = 0; r < 16; r++) {
      const y = 48 + r * 9.5;
      B.fillStyle = r % 2 ? '#3a2a1e' : '#30221a'; B.fillRect(0, y, AW, 9.5);
      for (let x = 2; x < AW; x += 5 + rand() * 3) {
        if (rand() < 0.15) continue;
        const c = ['#5a1a1a', '#2a2a4a', '#4a3a2a', '#6a5a4a', '#2a3a2a', '#5a2a5a', '#8a7a6a'][(rand() * 7) | 0];
        B.fillStyle = c; B.fillRect(x, y - 3, 3.4, 5);
        B.fillStyle = ['#e0b090', '#a07050', '#6a4028', '#f0c8a0'][(rand() * 4) | 0]; B.fillRect(x + 0.6, y - 6, 2.4, 2.6);
      }
    }
    // banners + hanging scoreboard
    for (let i = 0; i < 6; i++) { const x = 40 + i * 128; B.fillStyle = '#4a1a6a'; B.fillRect(x, 32, 22, 30); B.fillStyle = '#e8c840'; B.fillRect(x + 3, 38, 16, 2); B.fillRect(x + 3, 44, 16, 2); R.poly(B, [[x, 62], [x + 11, 70], [x + 22, 62]], '#4a1a6a'); }
    B.fillStyle = '#111'; B.fillRect(AW / 2 - 40, 30, 80, 28); B.fillStyle = '#ff3a2a'; B.font = '10px monospace'; B.fillText('HOME 00', AW / 2 - 36, 44); B.fillText('GUEST 00', AW / 2 - 36, 55);
    glow(B, AW * 0.25, 20, 90, 'rgba(255,230,180,0.14)'); glow(B, AW * 0.75, 20, 90, 'rgba(255,230,180,0.14)');
    // floor
    F.fillStyle = '#1a0f0a'; F.fillRect(0, 196, AW, 6);
    floorPlanks(F, 200, '#8a5a2a', '#c08a4a', 30);
    F.strokeStyle = 'rgba(255,255,255,0.5)'; F.lineWidth = 1.2; F.beginPath(); F.ellipse(AW / 2, 222, 70, 12, 0, 0, PI * 2); F.stroke();
    F.fillStyle = 'rgba(80,20,110,0.45)'; F.fillRect(0, 234, AW, 6);
    F.fillStyle = 'rgba(255,255,255,0.08)'; F.fillRect(0, 202, AW, 3);
  }

  function benny(B, F) {
    vgrad(B, 0, 0, AW, H, ['#05060e', '#141a30', '#2a2238']);
    stars(B, 90, 90);
    R.ball(B, 600, 34, 13, '#e8e2c8');
    trees(B, 175, 14, '#0c1410', 40, 80);
    // campus buildings
    for (const [x, w, h] of [[0, 150, 70], [520, 240, 64]]) { bricks(B, x, 175 - h, w, h, '#4a2420', '#2a1210'); windows(B, x + 10, 175 - h + 10, (w / 18) | 0, 3, 7, 9, 18, 18, 0.4); }
    // colonnade + Beneficence
    const cx = AW / 2;
    B.fillStyle = '#6a665e'; B.beginPath(); B.ellipse(cx, 176, 150, 24, 0, PI, 0); B.fill();
    for (let i = -6; i <= 6; i++) { const x = cx + i * 22, y = 176 - Math.sqrt(Math.max(0, 1 - (i / 6.8) ** 2)) * 24; B.fillStyle = '#8a857a'; B.fillRect(x - 3, y - 26, 6, 26); B.fillStyle = '#5a564e'; B.fillRect(x + 1.5, y - 26, 1.5, 26); }
    B.fillStyle = '#9a958a'; B.fillRect(cx - 18, 118, 36, 58); B.fillStyle = '#6a665e'; B.fillRect(cx - 22, 114, 44, 6); B.fillRect(cx - 20, 170, 40, 6);
    // bronze winged figure
    const br = '#3a5a48';
    R.poly(B, [[cx - 4, 112], [cx - 34, 70], [cx - 26, 64], [cx - 14, 86], [cx - 2, 96]], br);
    R.poly(B, [[cx + 4, 112], [cx + 34, 70], [cx + 26, 64], [cx + 14, 86], [cx + 2, 96]], br);
    R.poly(B, [[cx - 6, 114], [cx - 4, 84], [cx + 4, 84], [cx + 6, 114]], '#4a6a58');
    R.ball(B, cx, 79, 5, '#4a6a58'); R.line(B, cx + 3, 86, cx + 10, 66, '#4a6a58', 2.5);
    glow(B, cx, 100, 70, 'rgba(120,200,160,0.12)');
    // lamp posts
    for (const x of [90, 300, 460, 670]) { B.fillStyle = '#111'; B.fillRect(x, 120, 2, 60); R.ball(B, x + 1, 118, 3, '#fff0c0'); glow(B, x + 1, 118, 26, 'rgba(255,230,160,0.25)'); }
    vgrad(F, 0, 196, AW, 44, ['#5a2a22', '#7a3a2a']);
    F.fillStyle = 'rgba(0,0,0,0.4)';
    for (let y = 198; y < H; y += 5) { F.fillRect(0, y, AW, 0.8); const off = ((y / 5) | 0) % 2 ? 6 : 0; for (let x = off; x < AW; x += 12) F.fillRect(x, y, 0.8, 5); }
    F.fillStyle = '#3a3a38'; F.fillRect(0, 194, AW, 4);
  }

  function bridge(B, F) {
    vgrad(B, 0, 0, AW, H, ['#03040a', '#0e1428', '#1a2036']);
    stars(B, 120, 110);
    R.ball(B, 140, 40, 16, '#f0ead0'); glow(B, 140, 40, 60, 'rgba(240,230,200,0.12)');
    trees(B, 150, 20, '#060c0a', 30, 60);
    vgrad(B, 0, 150, AW, 90, ['#0a1420', '#16263a']);
    for (let i = 0; i < 40; i++) { B.fillStyle = 'rgba(240,230,200,0.25)'; B.fillRect(120 + rand() * 50, 155 + i * 2, 10 + rand() * 20, 0.8); }
    // far railroad truss
    B.strokeStyle = '#1a1a22'; B.lineWidth = 2;
    for (let x = 380; x < AW; x += 24) { B.beginPath(); B.moveTo(x, 140); B.lineTo(x + 12, 118); B.lineTo(x + 24, 140); B.stroke(); }
    B.fillStyle = '#1a1a22'; B.fillRect(380, 117, 400, 3); B.fillRect(380, 139, 400, 3);
    // the trestle deck we fight on
    F.fillStyle = '#2a2620'; F.fillRect(0, 168, AW, 4);
    for (let x = 0; x < AW; x += 30) { F.fillStyle = '#3a3630'; F.fillRect(x, 168, 3, 30); F.fillStyle = '#4a463e'; F.fillRect(x, 168, 1, 30); }
    F.fillStyle = '#3a3630'; F.fillRect(0, 184, AW, 2);
    vgrad(F, 0, 198, AW, 26, ['#5a4a36', '#3a3024']);
    F.fillStyle = 'rgba(0,0,0,0.45)'; for (let x = 0; x < AW; x += 9) F.fillRect(x, 198, 1, 26);
    vgrad(F, 0, 224, AW, 16, ['#1a1814', '#050404']);
    F.strokeStyle = '#2a2620'; F.lineWidth = 2;
    for (let x = 0; x < AW; x += 40) { F.beginPath(); F.moveTo(x, 226); F.lineTo(x + 20, 240); F.lineTo(x + 40, 226); F.stroke(); }
  }
  // the view from below for the stage fatality
  function drawBelow(g, W, t) {
    vgrad(g, 0, 0, W, H, ['#05060c', '#0e1424', '#141a24']);
    g.fillStyle = '#2a2620'; g.fillRect(0, 0, W, 22);
    for (let x = 0; x < W; x += 34) { g.fillStyle = '#1a1814'; g.fillRect(x, 0, 6, 70); }
    vgrad(g, 0, 150, W, 40, ['#0a1420', '#1a2a3a']);
    vgrad(g, 0, 190, W, 50, ['#3a342c', '#26221c']);
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

  function minnetrista(B, F) {
    vgrad(B, 0, 0, AW, H, ['#2a0e1a', '#8a3a2a', '#e09a4a']);
    R.ball(B, 520, 120, 22, '#ffd890'); glow(B, 520, 120, 90, 'rgba(255,200,120,0.3)');
    // Ball mansions far back
    for (const [x, w, h, c] of [[10, 130, 64, '#5a4030'], [580, 170, 70, '#6a4a34']]) {
      B.fillStyle = c; B.fillRect(x, 170 - h, w, h); R.poly(B, [[x - 6, 170 - h], [x + w / 2, 170 - h - 26], [x + w + 6, 170 - h]], '#3a2420');
      windows(B, x + 10, 170 - h + 12, (w / 22) | 0, 2, 9, 12, 22, 22, 0.5);
    }
    // Minnetrista
    const x0 = 220, w0 = 320;
    bricks(B, x0, 92, w0, 82, '#7a3a2a', '#4a2018', 10, 5);
    B.fillStyle = '#c8b898'; B.fillRect(x0 - 4, 88, w0 + 8, 6);
    for (let i = 0; i < 8; i++) { B.fillStyle = '#2a2a3a'; B.fillRect(x0 + 16 + i * 38, 104, 18, 46); B.fillStyle = 'rgba(255,220,150,0.35)'; B.fillRect(x0 + 16 + i * 38, 104, 18, 20); B.fillStyle = '#c8b898'; B.fillRect(x0 + 14 + i * 38, 150, 22, 3); }
    B.fillStyle = '#c8b898'; B.fillRect(x0 + w0 / 2 - 50, 64, 100, 26);
    B.fillStyle = '#3a2418'; B.font = '13px Anton, Impact, sans-serif'; B.fillText('MINNETRISTA', x0 + w0 / 2 - 40, 82);
    trees(B, 178, 16, '#5a2a10', 34, 70); trees(B, 178, 10, '#8a4a14', 30, 54);
    vgrad(F, 0, 194, AW, 46, ['#3a4a1a', '#4a5a22']);
    for (let i = 0; i < 300; i++) { F.fillStyle = ['#c8601a', '#a8401a', '#e09a2a', '#6a2a0a'][(rand() * 4) | 0]; F.fillRect(rand() * AW, 196 + rand() * 44, 2, 1.2); }
  }

  function cityhall(B, F, hell) {
    vgrad(B, 0, 0, AW, H, hell ? ['#1a0204', '#5a0a0a', '#c8341a'] : ['#04040c', '#141432', '#2a2244']);
    stars(B, hell ? 0 : 60, 80);
    // downtown behind
    for (let i = 0; i < 12; i++) { const x = i * 66, h = 60 + rand() * 60; B.fillStyle = hell ? '#1a0606' : '#14141e'; B.fillRect(x, 175 - h, 58, h); windows(B, x + 5, 175 - h + 6, 5, (h / 12) | 0, 6, 6, 10, 12, hell ? 0.25 : 0.35); }
    // City Hall: cream stone, tall arched glass entry, dark glass wings
    const cx = AW / 2;
    B.fillStyle = '#d8ccb0'; B.fillRect(cx - 160, 96, 320, 82);
    B.fillStyle = '#1a2230'; B.fillRect(cx - 150, 108, 100, 60); B.fillRect(cx + 50, 108, 100, 60);
    B.fillStyle = 'rgba(120,160,200,0.3)'; for (let i = 0; i < 6; i++) { B.fillRect(cx - 148 + i * 17, 110, 14, 56); B.fillRect(cx + 52 + i * 17, 110, 14, 56); }
    B.fillStyle = '#e8dcc0'; B.fillRect(cx - 36, 64, 72, 114);
    B.fillStyle = '#1a2a3a'; B.beginPath(); B.moveTo(cx - 24, 178); B.lineTo(cx - 24, 92); B.arc(cx, 92, 24, PI, 0); B.lineTo(cx + 24, 178); B.fill();
    B.fillStyle = hell ? 'rgba(255,90,30,0.45)' : 'rgba(255,220,150,0.45)'; B.fillRect(cx - 22, 96, 44, 82);
    B.strokeStyle = '#c8bca0'; B.lineWidth = 1; for (let i = -2; i <= 2; i++) { B.beginPath(); B.moveTo(cx + i * 9, 72); B.lineTo(cx + i * 9, 178); B.stroke(); }
    B.fillStyle = '#3a3428'; B.font = '9px Anton, Impact, sans-serif'; B.fillText('CITY HALL', cx - 22, 60);
    glow(B, cx, 140, 90, hell ? 'rgba(255,60,20,0.3)' : 'rgba(255,220,150,0.18)');
    for (const x of [60, 220, 540, 700]) { B.fillStyle = '#0a0a0a'; B.fillRect(x, 126, 2, 54); R.ball(B, x + 1, 124, 3, '#fff0c0'); glow(B, x + 1, 124, 24, 'rgba(255,230,160,0.25)'); }
    vgrad(F, 0, 194, AW, 46, hell ? ['#2a1010', '#3a1a14'] : ['#2a2a30', '#3a3a40']);
    F.fillStyle = '#8a8a88'; F.fillRect(0, 194, AW, 3);
    F.fillStyle = 'rgba(230,230,220,0.6)'; for (let x = 20; x < AW; x += 40) F.fillRect(x, 228, 22, 3);
  }

  function shedtown(B, F) {
    vgrad(B, 0, 0, AW, H, ['#0a0a12', '#2a1e2a', '#5a3a2a']);
    stars(B, 40, 60);
    trees(B, 160, 12, '#0c100a', 40, 80);
    // shacks with tin roofs
    for (const [x, w, h, c] of [[10, 110, 56, '#5a5040'], [170, 90, 48, '#4a4a52'], [500, 120, 60, '#5a4436'], [660, 100, 50, '#4a4038']]) {
      B.fillStyle = c; B.fillRect(x, 176 - h, w, h);
      for (let i = 0; i < w; i += 5) { B.fillStyle = 'rgba(0,0,0,0.25)'; B.fillRect(x + i, 176 - h, 1, h); }
      R.poly(B, [[x - 6, 176 - h], [x + w / 2, 176 - h - 18], [x + w + 6, 176 - h]], '#6a6a6e');
      B.fillStyle = '#8a3a1a'; B.fillRect(x + w * 0.2, 176 - h - 8, w * 0.25, 4);
      B.fillStyle = rand() < 0.6 ? '#e8b050' : '#1a1a1a'; B.fillRect(x + w * 0.6, 176 - h + 14, 14, 12);
      B.fillStyle = '#2a1a10'; B.fillRect(x + w * 0.2, 176 - 30, 14, 30);
    }
    // lifted truck
    const tx = 330;
    B.fillStyle = '#1a1a1a'; R.ball(B, tx + 18, 166, 12, '#141414'); R.ball(B, tx + 92, 166, 12, '#141414');
    B.fillStyle = '#6a1a1a'; B.fillRect(tx, 128, 110, 26); B.fillRect(tx + 50, 110, 40, 20);
    B.fillStyle = '#7a8a9a'; B.fillRect(tx + 56, 113, 28, 12);
    B.fillStyle = '#3a3a3a'; B.fillRect(tx - 2, 152, 116, 4);
    // chain-link fence
    B.strokeStyle = 'rgba(140,140,150,0.45)'; B.lineWidth = 0.6;
    for (let x = 0; x < AW; x += 5) { B.beginPath(); B.moveTo(x, 150); B.lineTo(x + 26, 180); B.moveTo(x + 26, 150); B.lineTo(x, 180); B.stroke(); }
    B.fillStyle = '#5a5a60'; for (let x = 0; x < AW; x += 80) B.fillRect(x, 146, 2, 36); B.fillRect(0, 148, AW, 1.5);
    vgrad(F, 0, 192, AW, 48, ['#3a2e22', '#2a2018']);
    for (let i = 0; i < 400; i++) { F.fillStyle = ['#5a4a3a', '#1a140e', '#6a5a46', '#2a3a1a'][(rand() * 4) | 0]; F.fillRect(rand() * AW, 194 + rand() * 46, 1.5, 1.5); }
    for (let i = 0; i < 5; i++) { const x = 40 + rand() * 680; R.ball(F, x, 198, 5, '#141414'); R.ball(F, x, 198, 2, '#3a3a3a'); }
  }

  function glassworks(B, F) {
    vgrad(B, 0, 0, AW, H, ['#0a0606', '#1a0e0a', '#2a1a12']);
    bricks(B, 0, 20, AW, 160, '#3a1e16', '#1a0c08', 12, 6);
    B.fillStyle = 'rgba(0,0,0,0.4)'; B.fillRect(0, 20, AW, 160);
    // furnaces
    for (const x of [80, 380, 640]) {
      B.fillStyle = '#2a2a2e'; B.fillRect(x - 40, 90, 80, 90); B.fillStyle = '#1a1a1e'; B.fillRect(x - 46, 84, 92, 8);
      B.fillStyle = '#ff8a20'; B.beginPath(); B.arc(x, 150, 20, PI, 0); B.fill(); B.fillRect(x - 20, 150, 40, 24);
      B.fillStyle = '#ffe080'; B.beginPath(); B.arc(x, 156, 11, PI, 0); B.fill(); B.fillRect(x - 11, 156, 22, 18);
      glow(B, x, 150, 80, 'rgba(255,120,30,0.35)');
      B.fillStyle = '#1a1a1e'; B.fillRect(x - 6, 0, 12, 86);
    }
    // shelves of jars
    for (const x0 of [180, 470]) for (let s = 0; s < 3; s++) {
      B.fillStyle = '#3a2a1a'; B.fillRect(x0, 80 + s * 30, 120, 3);
      for (let j = 0; j < 9; j++) { B.fillStyle = 'rgba(140,190,210,0.55)'; B.fillRect(x0 + 4 + j * 13, 66 + s * 30, 9, 14); B.fillStyle = '#8a8a90'; B.fillRect(x0 + 4 + j * 13, 64 + s * 30, 9, 3); if (rand() < 0.4) { B.fillStyle = 'rgba(120,160,60,0.7)'; B.fillRect(x0 + 5 + j * 13, 72 + s * 30, 7, 8); } }
    }
    B.strokeStyle = '#2a2a2a'; B.lineWidth = 1.5; for (const x of [150, 330, 560, 720]) { B.beginPath(); B.moveTo(x, 0); B.lineTo(x, 50 + rand() * 40); B.stroke(); }
    vgrad(F, 0, 192, AW, 48, ['#3a3430', '#26221e']);
    F.fillStyle = 'rgba(0,0,0,0.5)'; for (let x = 0; x < AW; x += 40) F.fillRect(x, 192, 1, 48);
    for (const x of [80, 380, 640]) { glow(F, x, 200, 60, 'rgba(255,120,30,0.25)'); }
  }

  const DEFS = {
    fieldhouse: { name: 'MUNCIE FIELDHOUSE', draw: fieldhouse },
    benny: { name: 'BENEFICENCE', draw: benny },
    bridge: { name: 'WHITE RIVER TRESTLE', draw: bridge, pit: true },
    minnetrista: { name: 'MINNETRISTA', draw: minnetrista },
    cityhall: { name: 'CITY HALL', draw: cityhall },
    shedtown: { name: 'SHEDTOWN', draw: shedtown },
    glassworks: { name: 'THE OLD GLASS WORKS', draw: glassworks },
    hell: { name: 'CITY HALL', draw: (B, F) => cityhall(B, F, true) },
  };
  const cache = {};
  function get(id) {
    if (cache[id]) return cache[id];
    seed = 11 + id.length * 97;
    const back = mk(), front = mk();
    DEFS[id].draw(back.getContext('2d'), front.getContext('2d'));
    const bg = back.getContext('2d'); bg.fillStyle = `rgba(0,0,0,${id === 'fieldhouse' ? 0.42 : 0.22})`; bg.fillRect(0, 0, AW, H);
    grit(back, 16); grit(front, 18);
    // widen the arena: the scene sits in the middle, mirrored scenery fills both ends
    const widen = c => {
      const w = document.createElement('canvas'); w.width = AWX; w.height = H; const g = w.getContext('2d');
      g.drawImage(c, PAD, 0);
      g.save(); g.scale(-1, 1); g.drawImage(c, 0, 0, PAD, H, -PAD, 0, PAD, H); g.drawImage(c, AW - PAD, 0, PAD, H, -AWX, 0, PAD, H); g.restore();
      return w;
    };
    cache[id] = { id, name: DEFS[id].name, pit: !!DEFS[id].pit, back: widen(back), front: widen(front) };
    return cache[id];
  }
  // animated bits drawn each frame on top of the far layer (world coords, already scrolled)
  function live(g, id, t) {
    g.save(); g.translate(PAD, 0); live0(g, id, t); g.restore();
  }
  function live0(g, id, t) {
    if (id === 'shedtown') { const x = 470; g.fillStyle = '#3a3a3e'; g.fillRect(x - 8, 172, 16, 22); g.fillStyle = '#2a2a2e'; g.fillRect(x - 8, 178, 16, 2); for (let i = 0; i < 4; i++) { const r = 3 + Math.sin(t * 9 + i) * 1.5; RIG.ball(g, x - 5 + i * 3.3, 168 - Math.abs(Math.sin(t * 7 + i * 2)) * 8, r, i % 2 ? '#ff9a20' : '#ffd040'); } }
    if (id === 'glassworks') { for (const x of [80, 380, 640]) { g.fillStyle = `rgba(255,${120 + Math.sin(t * 6 + x) * 40 | 0},30,${0.15 + Math.sin(t * 5 + x) * 0.08})`; g.fillRect(x - 24, 128, 48, 50); } }
    if (id === 'hell') { for (let i = 0; i < 6; i++) { const x = (i * 131 + t * 20) % AW; g.fillStyle = 'rgba(255,90,20,0.5)'; g.beginPath(); g.arc(x, 194 - Math.abs(Math.sin(t * 4 + i)) * 10, 4, 0, PI * 2); g.fill(); } }
    if (id === 'fieldhouse') { g.fillStyle = 'rgba(255,255,255,0.05)'; if (Math.sin(t * 13) > 0.97) g.fillRect(0, 0, AW, 190); }
  }
  return { AW: AWX, H, FLOOR, get, live, drawBelow, drawTrain, ROTATION: ['fieldhouse', 'benny', 'bridge', 'minnetrista', 'shedtown', 'cityhall'] };
})();
