// Muncie Kombat: synthesized sound effects and a deep announcer voice (no audio files)
'use strict';
const SFX = (() => {
  let ac = null, master = null, muted = false, voice = null;
  try { muted = localStorage.getItem('mk_muted') === '1'; } catch (e) {}
  function unlock() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ac.destination); }
      try { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } } catch (e) {}
    }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  function setMuted(m) { muted = m; try { localStorage.setItem('mk_muted', m ? '1' : '0'); } catch (e) {} if (master) master.gain.value = m ? 0 : 0.55; if (m && window.speechSynthesis) speechSynthesis.cancel(); }
  const now = () => ac.currentTime;
  function tone(freq, dur, type = 'square', vol = 0.3, slide = 0, delay = 0) {
    if (!ac || muted) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = now() + delay;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(dur, vol = 0.3, f0 = 1000, q = 1, type = 'bandpass', delay = 0, attack = 0.004, f1 = 0) {
    if (!ac || muted) return;
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = now() + delay;
    s.buffer = noiseBuf; f.type = type; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function say(text, pitch = 0.2, rate = 0.82) {
    if (muted || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (!voice) { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /en-(US|GB)/.test(v.lang) && /Daniel|Fred|Alex|Male|Google UK English Male/i.test(v.name)) || vs.find(v => /^en/.test(v.lang)) || null; }
      if (voice) u.voice = voice;
      u.pitch = pitch; u.rate = rate; u.volume = 1;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const S = {
    unlock, setMuted, isMuted: () => muted, say,
    whoosh: () => noise(0.12, 0.12, 900, 0.7, 'bandpass', 0, 0.02, 2400),
    punch: () => { noise(0.1, 0.45, 500, 0.8, 'lowpass'); tone(120, 0.1, 'sine', 0.4, -60); },
    kick: () => { noise(0.14, 0.5, 380, 0.8, 'lowpass'); tone(90, 0.14, 'sine', 0.45, -40); },
    big: () => { noise(0.3, 0.6, 300, 0.6, 'lowpass'); tone(70, 0.3, 'sine', 0.6, -35); noise(0.25, 0.25, 1800, 1, 'bandpass', 0.02); },
    block: () => { tone(900, 0.05, 'square', 0.12); noise(0.06, 0.2, 2500, 2); },
    splat: () => { noise(0.22, 0.35, 700, 1.2, 'bandpass', 0, 0.01, 200); tone(60, 0.15, 'sine', 0.3, -20); },
    crunch: () => { for (let i = 0; i < 4; i++) noise(0.05, 0.35, 1500 + Math.random() * 1500, 3, 'bandpass', i * 0.03); tone(80, 0.2, 'square', 0.15, -30); },
    gulp: () => { tone(180, 0.25, 'sine', 0.4, -140); tone(120, 0.2, 'sine', 0.3, -60, 0.18); },
    fart: () => { tone(70, 0.6, 'sawtooth', 0.35, -25); tone(84, 0.6, 'square', 0.12, -30); noise(0.5, 0.3, 200, 2, 'bandpass'); },
    honk: () => { tone(330, 0.22, 'sawtooth', 0.3, -40); tone(336, 0.22, 'square', 0.15, -40); },
    shatter: () => { for (let i = 0; i < 8; i++) tone(2000 + Math.random() * 3000, 0.15, 'triangle', 0.08, -500, i * 0.025); noise(0.5, 0.35, 5000, 0.6, 'highpass'); },
    clang: () => { tone(420, 0.6, 'triangle', 0.25, -40); tone(637, 0.5, 'triangle', 0.15, -30); noise(0.1, 0.3, 3000, 1); },
    thud: () => { tone(55, 0.35, 'sine', 0.6, -25); noise(0.2, 0.4, 250, 0.7, 'lowpass'); },
    horn: () => { tone(277, 1.1, 'sawtooth', 0.18); tone(349, 1.1, 'sawtooth', 0.14); tone(415, 1.1, 'sawtooth', 0.12); },
    train: () => { for (let i = 0; i < 10; i++) noise(0.12, 0.35, 300, 1, 'lowpass', i * 0.13); noise(1.4, 0.25, 800, 0.5, 'bandpass'); },
    fire: () => { noise(0.5, 0.3, 900, 0.5, 'bandpass', 0, 0.05, 300); tone(150, 0.4, 'sawtooth', 0.1, 100); },
    proj: () => { tone(300, 0.2, 'sawtooth', 0.15, 400); noise(0.15, 0.15, 1500, 1); },
    gong: () => { tone(98, 2.2, 'sine', 0.5); tone(147, 1.8, 'sine', 0.2); tone(207, 1.4, 'triangle', 0.12); },
    scream: () => { tone(700, 0.7, 'sawtooth', 0.12, -450); tone(720, 0.7, 'square', 0.06, -470); },
    squeak: () => { tone(1400, 0.08, 'square', 0.12, 300); tone(1800, 0.12, 'square', 0.1, -400, 0.08); },
    slash: () => noise(0.09, 0.3, 3500, 1, 'bandpass', 0, 0.005, 1200),
    chomp: () => { noise(0.08, 0.35, 900, 2); tone(140, 0.07, 'square', 0.15, -60); },
    gnaw: () => { for (let i = 0; i < 3; i++) noise(0.03, 0.3, 2500, 4, 'bandpass', i * 0.04); },
    select: () => { tone(330, 0.08, 'square', 0.15); tone(495, 0.12, 'square', 0.12, 0, 0.07); },
    blip: () => tone(660, 0.05, 'square', 0.1),
    land: () => { tone(70, 0.12, 'sine', 0.4, -20); noise(0.1, 0.2, 400, 0.8, 'lowpass'); },
  };
  return S;
})();
