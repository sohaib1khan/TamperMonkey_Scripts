// ==UserScript==
// @name         Purple Haze — Galaxy Build
// @namespace    https://github.com/sohaib1khan/TamperMonkey_Scripts.git
// @version      0.3.1
// @description  Galaxy-inspired skin: nebula drift, twinkling starfield, shooting stars, framed images, high-contrast text, Goku-style hero cursor, big slow fireball on link/button click, red-gray idle smoke, double-tap Up/Down auto-scroll. Toggle on/off with Ctrl+Alt+M.
// @author       Sohaib Khan
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) return;

  const PINK = '#ff5fd0';
  const CYAN = '#2de2ff';
  const LAVENDER = '#ecdcff';
  const DEEP = '#0a0014';
  const GOKU_ORANGE = '#f97316';
  const GOKU_BLUE = '#2563eb';
  const GOKU_SKIN = '#ffcc99';
  const SHOOT_INTERVAL = 4200;
  const SHOOT_VARIANCE = 2800;
  const AUTO_SCROLL_PX = 3;
  const DOUBLE_TAP_MS = 450;

  let enabled = true;
  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let cursorEl = null, glyphEl = null;
  let galaxyEl = null, nebulaEl = null, starsEl = null, scanEl = null;
  let shootTimer = null;

  const HERO_SVG =
    '<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="hero-body">' +
        '<path class="hero-hair" d="M7 11 L3 3 L11 9 L9 1 L16 8 L23 1 L21 9 L29 3 L25 11 L31 15 L19 13 L16 19 L13 13 L1 15 Z" fill="#141414" stroke="#2a2a2a" stroke-width="0.35"/>' +
        '<ellipse cx="16" cy="16" rx="7" ry="8" fill="' + GOKU_SKIN + '"/>' +
        '<ellipse cx="13" cy="15.5" rx="1.4" ry="1.8" fill="#111"/>' +
        '<ellipse cx="19" cy="15.5" rx="1.4" ry="1.8" fill="#111"/>' +
        '<path d="M14 19 Q16 20.5 18 19" fill="none" stroke="#c4845c" stroke-width="0.6" stroke-linecap="round"/>' +
        '<path d="M7 22 Q16 20 25 22 L27 38 L5 38 Z" fill="' + GOKU_ORANGE + '" stroke="#fff" stroke-width="0.35"/>' +
        '<path d="M12 22 L16 29 L20 22 Z" fill="' + GOKU_BLUE + '"/>' +
        '<rect x="6" y="30" width="20" height="3" rx="1" fill="#1d4ed8"/>' +
        '<path class="hero-arm" d="M25 22 Q31 17 32 24 Q28 27 24 27 Z" fill="' + GOKU_SKIN + '"/>' +
        '<circle class="hero-aura" cx="16" cy="24" r="8" fill="none" stroke="#ffeb3b" stroke-width="1.5" opacity="0"/>' +
      '</g>' +
    '</svg>';

  const styleEl = document.createElement('style');
  styleEl.id = '__phz_style';
  styleEl.textContent = `
    html { background: ${DEEP} !important; }

    body {
      background: rgba(10, 0, 20, 0.55) !important;
      color: ${LAVENDER} !important;
    }

    /* ---- text readability: contrast without bleed ---- */
    body, p, span, li, td, th, dt, dd, small, strong, em, b, i, u,
    h1, h2, h3, h4, h5, h6, label, blockquote, figcaption, legend,
    pre, code, kbd, samp, mark, time, abbr, cite, q {
      color: ${LAVENDER} !important;
      -webkit-text-fill-color: ${LAVENDER} !important;
      text-shadow:
        0 0 1px rgba(10, 0, 20, 0.95),
        0 1px 2px rgba(10, 0, 20, 0.85),
        0 0 6px rgba(140, 90, 255, 0.35) !important;
      background-color: transparent !important;
      mix-blend-mode: normal !important;
    }

    /* inputs: solid backing so typed text never vanishes */
    input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
    textarea, select, [contenteditable="true"] {
      color: ${LAVENDER} !important;
      -webkit-text-fill-color: ${LAVENDER} !important;
      background: rgba(18, 6, 32, 0.92) !important;
      border: 1px solid rgba(255, 95, 208, 0.35) !important;
      text-shadow: none !important;
      box-shadow: inset 0 0 12px rgba(80, 30, 140, 0.25) !important;
    }
    input::placeholder, textarea::placeholder {
      color: rgba(200, 170, 240, 0.65) !important;
      -webkit-text-fill-color: rgba(200, 170, 240, 0.65) !important;
    }

    button, [role="button"], input[type="submit"], input[type="button"] {
      color: ${LAVENDER} !important;
      -webkit-text-fill-color: ${LAVENDER} !important;
      text-shadow: 0 0 4px rgba(140, 90, 255, 0.5) !important;
    }

    a, a:visited, a * {
      color: ${PINK} !important;
      -webkit-text-fill-color: ${PINK} !important;
      font-weight: 600 !important;
    }
    a {
      text-decoration: none !important;
      background-image: linear-gradient(${PINK}, ${PINK}) !important;
      background-size: 100% 1px !important;
      background-position: 0 100% !important;
      background-repeat: no-repeat !important;
      text-shadow:
        0 0 1px rgba(10, 0, 20, 0.9),
        0 0 6px rgba(255, 95, 208, 0.45) !important;
      transition: color .25s ease, text-shadow .25s ease !important;
    }
    a:hover, a:hover * {
      color: #ffd6f4 !important;
      -webkit-text-fill-color: #ffd6f4 !important;
    }
    a:hover { animation: __phz_linkpulse .9s ease-in-out infinite !important; }
    @keyframes __phz_linkpulse {
      0%, 100% { text-shadow: 0 0 6px rgba(255, 95, 208, 0.6); }
      50%      { text-shadow: 0 0 14px ${PINK}, 0 0 24px rgba(45, 226, 255, 0.65); }
    }

    /* ---- images & media: preserve layout, no blow-out ---- */
    img, picture, video, canvas, svg image {
      max-width: 100% !important;
      height: auto !important;
      object-fit: contain !important;
      object-position: center !important;
      display: inline-block !important;
      vertical-align: middle !important;
      background: rgba(10, 0, 20, 0.75) !important;
      border: 1px solid rgba(255, 95, 208, 0.35) !important;
      border-radius: 8px !important;
      box-shadow:
        0 0 0 1px rgba(45, 226, 255, 0.08),
        0 4px 20px rgba(100, 40, 180, 0.3) !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
      isolation: isolate !important;
    }
    picture img, figure img, a img {
      background: rgba(10, 0, 20, 0.6) !important;
    }
    img[src=""], img:not([src]) {
      min-height: 48px !important;
      opacity: 0.4 !important;
    }

    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${DEEP}; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, ${PINK}, #8a3ce6);
      border-radius: 6px;
    }
    ::selection { background: ${PINK}; color: ${DEEP}; }

    /* ---- galaxy background layers ---- */
    #__phz_galaxy {
      position: fixed; inset: 0; z-index: -4; pointer-events: none;
      background:
        radial-gradient(ellipse 120% 80% at 50% 100%, rgba(60, 10, 100, 0.55), transparent 55%),
        radial-gradient(ellipse 80% 60% at 20% 20%, rgba(138, 43, 226, 0.22), transparent 50%),
        radial-gradient(ellipse 70% 50% at 85% 30%, rgba(45, 226, 255, 0.12), transparent 45%),
        linear-gradient(180deg, #050010 0%, ${DEEP} 35%, #120020 70%, #1a0030 100%);
    }

    #__phz_nebula {
      position: fixed; inset: -15%; z-index: -3; pointer-events: none;
      background:
        radial-gradient(45% 40% at 30% 40%, rgba(255, 61, 181, 0.28), transparent 70%),
        radial-gradient(50% 45% at 70% 25%, rgba(138, 43, 226, 0.32), transparent 70%),
        radial-gradient(55% 50% at 55% 75%, rgba(45, 226, 255, 0.14), transparent 70%),
        radial-gradient(35% 30% at 15% 80%, rgba(200, 80, 255, 0.18), transparent 65%);
      filter: blur(42px);
      animation: __phz_nebula_drift 32s ease-in-out infinite alternate;
    }
    @keyframes __phz_nebula_drift {
      0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.85; }
      50%  { transform: translate(3%, -2%) scale(1.08) rotate(1deg); opacity: 1; }
      100% { transform: translate(-2%, 3%) scale(1.14) rotate(-1deg); opacity: 0.9; }
    }

    #__phz_stars {
      position: fixed; inset: 0; z-index: -2; pointer-events: none;
      overflow: hidden;
    }

    .__phz_star {
      position: absolute;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
      animation: __phz_twinkle var(--twinkle, 3s) ease-in-out infinite;
      animation-delay: var(--delay, 0s);
    }
    @keyframes __phz_twinkle {
      0%, 100% { opacity: var(--lo, 0.25); transform: scale(1); }
      50%      { opacity: var(--hi, 0.95); transform: scale(1.35); }
    }

    .__phz_shoot {
      position: absolute;
      width: var(--len, 120px);
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(200, 150, 255, 0.6) 40%, transparent);
      box-shadow: 0 0 8px rgba(255, 200, 255, 0.7), 0 0 16px rgba(45, 226, 255, 0.4);
      transform: rotate(var(--angle, -35deg));
      transform-origin: right center;
      opacity: 0;
      animation: __phz_shoot var(--dur, 1.1s) ease-out forwards;
    }
    @keyframes __phz_shoot {
      0%   { opacity: 0; transform: rotate(var(--angle)) translateX(0) scaleX(0.2); }
      8%   { opacity: 1; }
      100% { opacity: 0; transform: rotate(var(--angle)) translateX(calc(-1 * var(--travel, 280px))) scaleX(1); }
    }

    #__phz_scan {
      position: fixed; inset: 0; z-index: 2147483640; pointer-events: none; opacity: 0.35;
      background: repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0 1px, transparent 1px 3px);
      animation: __phz_flicker 8s steps(80) infinite;
    }
    @keyframes __phz_flicker {
      0%, 96%, 100% { opacity: 0.35; }
      97% { opacity: 0.22; }
      98% { opacity: 0.42; }
    }

    /* ---- Goku-style hero cursor ---- */
    *, *::before, *::after { cursor: none !important; }
    input, textarea, [contenteditable] { cursor: text !important; }

    #__phz_cursor {
      position: fixed; top: 0; left: 0; z-index: 2147483647;
      pointer-events: none; will-change: transform;
    }
    #__phz_cursor .glyph {
      display: block; width: 32px; height: 40px;
      transform: translate(-50%, -50%);
      filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.9));
      animation: __phz_hero_glide 2.4s ease-in-out infinite;
    }
    @keyframes __phz_hero_glide {
      0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-3deg); }
      50%      { transform: translate(-50%, -50%) translateY(-3px) rotate(3deg); }
    }

    #__phz_cursor.__phz_active .glyph {
      animation: __phz_hero_power 0.75s ease-in-out infinite;
      filter: drop-shadow(0 0 14px rgba(255, 235, 59, 0.95)) drop-shadow(0 0 8px rgba(249, 115, 22, 0.9));
    }
    #__phz_cursor.__phz_active .hero-arm {
      transform-origin: 24px 24px;
      animation: __phz_hero_charge 0.45s ease-in-out infinite;
    }
    #__phz_cursor.__phz_active .hero-aura {
      transform-box: fill-box;
      transform-origin: center;
      animation: __phz_hero_aura 0.75s ease-in-out infinite;
    }
    @keyframes __phz_hero_power {
      0%, 100% { transform: translate(-50%, -50%) scale(1.1) rotate(-4deg); }
      50%      { transform: translate(-50%, -50%) scale(1.2) rotate(4deg) translateY(-4px); }
    }
    @keyframes __phz_hero_charge {
      0%, 100% { transform: rotate(0deg) translate(0, 0); }
      50%      { transform: rotate(-18deg) translate(-2px, -1px); }
    }
    @keyframes __phz_hero_aura {
      0%, 100% { transform: scale(0); opacity: 0; }
      50%      { transform: scale(1); opacity: 0.55; }
    }

    #__phz_cursor.__phz_idle:not(.__phz_active) .glyph {
      animation: __phz_hero_idle 2.2s ease-in-out infinite;
      filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.85)) drop-shadow(0 0 6px rgba(249, 115, 22, 0.75));
    }
    @keyframes __phz_hero_idle {
      0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(-3deg); }
      50%      { transform: translate(-50%, -50%) scale(1.1) rotate(3deg) translateY(-2px); }
    }

    #__phz_cursor.__phz_blast .glyph {
      animation: __phz_hero_blast 0.22s ease-out !important;
    }
    @keyframes __phz_hero_blast {
      0%   { transform: translate(-50%, -50%) scale(1.1); }
      40%  { transform: translate(-50%, -50%) scale(1.35); filter: drop-shadow(0 0 20px #ffeb3b); }
      100% { transform: translate(-50%, -50%) scale(1.05); }
    }

    /* ---- fireball (link / button click) ---- */
    .__phz_fireball {
      position: fixed; pointer-events: none; z-index: 2147483646;
      width: 40px; height: 40px; border-radius: 50%;
      background: radial-gradient(circle, #fff 0%, #ffeb3b 18%, #ff9800 50%, #ff5722 75%, transparent 100%);
      box-shadow: 0 0 16px #ff9800, 0 0 32px #ff5722, 0 0 48px rgba(255, 87, 34, 0.55);
      will-change: transform, opacity;
      animation: __phz_fireball var(--dur, 0.65s) ease-in forwards;
    }
    @keyframes __phz_fireball {
      0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
      75%  { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.15); opacity: 1; }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(2); opacity: 0; }
    }
    .__phz_fireburst {
      position: fixed; pointer-events: none; z-index: 2147483645;
      width: 72px; height: 72px; border-radius: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(255,235,59,0.95), rgba(255,87,34,0.55) 40%, transparent 72%);
      box-shadow: 0 0 24px rgba(255, 152, 0, 0.6);
      animation: __phz_fireburst 0.65s ease-out forwards;
    }
    @keyframes __phz_fireburst {
      0%   { transform: translate(-50%, -50%) scale(0.15); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
    }

    /* ---- cursor trail sparkles ---- */
    .__phz_p {
      position: fixed; pointer-events: none; z-index: 2147483646;
      font: 11px sans-serif; will-change: transform, opacity;
      text-shadow: 0 0 6px currentColor;
      animation: __phz_trail 1.1s ease-out forwards;
    }
    @keyframes __phz_trail {
      to { transform: translateY(-28px) scale(0.4) rotate(120deg); opacity: 0; }
    }
    .__phz_smoke {
      position: fixed; pointer-events: none; z-index: 2147483646;
      width: 34px; height: 34px; border-radius: 50%;
      background: radial-gradient(circle, rgba(210, 45, 45, 0.75), rgba(110, 110, 110, 0.45) 45%, rgba(90, 90, 90, 0) 72%);
      filter: blur(2px);
      will-change: transform, opacity;
      animation: __phz_smoke 1.7s ease-out forwards;
    }
    @keyframes __phz_smoke {
      0%   { transform: translate(0, 0) scale(0.3); opacity: 0.65; }
      100% { transform: translate(var(--dx, 0), -46px) scale(2.7); opacity: 0; }
    }
  `;
  (document.head || document.documentElement).appendChild(styleEl);

  let trailLast = 0, idleTimer = null, smokeTimer = null, blastTimer = null;

  function spawnTrail(x, y) {
    const p = document.createElement('div');
    p.className = '__phz_p';
    p.textContent = '✦';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.color = `hsl(${(Math.random() * 80 + 270) | 0}, 100%, 78%)`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }

  function spawnSmoke(x, y) {
    const puffs = 2 + (Math.random() * 2 | 0);
    for (let i = 0; i < puffs; i++) {
      const s = document.createElement('div');
      s.className = '__phz_smoke';
      s.style.left = (x - 13 + (Math.random() * 18 - 9)) + 'px';
      s.style.top = (y - 4) + 'px';
      s.style.setProperty('--dx', (Math.random() * 28 - 14) + 'px');
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  }

  function startIdleSmoke() {
    if (smokeTimer) return;
    if (cursorEl) cursorEl.classList.add('__phz_idle');
    smokeTimer = setInterval(() => { if (enabled) spawnSmoke(mouseX, mouseY); }, 380);
  }
  function stopIdleSmoke() {
    clearInterval(smokeTimer);
    smokeTimer = null;
    if (cursorEl) cursorEl.classList.remove('__phz_idle');
  }

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorEl) cursorEl.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    stopIdleSmoke();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startIdleSmoke, 2000);
    if (!enabled) return;
    const t = performance.now();
    if (t - trailLast > 60) { trailLast = t; spawnTrail(mouseX, mouseY); }
  }

  function buildStarfield() {
    if (!starsEl) return;
    const frag = document.createDocumentFragment();
    const count = Math.min(180, Math.floor((innerWidth * innerHeight) / 9000));
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = '__phz_star';
      const size = Math.random() < 0.12 ? 2.5 : Math.random() < 0.35 ? 1.8 : 1;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.setProperty('--twinkle', (2 + Math.random() * 4).toFixed(2) + 's');
      s.style.setProperty('--delay', (Math.random() * 5).toFixed(2) + 's');
      s.style.setProperty('--lo', (0.15 + Math.random() * 0.25).toFixed(2));
      s.style.setProperty('--hi', (0.7 + Math.random() * 0.3).toFixed(2));
      frag.appendChild(s);
    }
    starsEl.appendChild(frag);
  }

  function spawnShootingStar() {
    if (!enabled || !starsEl) return;
    const star = document.createElement('div');
    star.className = '__phz_shoot';
    const fromTop = Math.random() < 0.65;
    const x = Math.random() * innerWidth * 0.85 + innerWidth * 0.05;
    const y = fromTop
      ? Math.random() * innerHeight * 0.45
      : Math.random() * innerHeight * 0.35 + innerHeight * 0.1;
    const angle = fromTop
      ? -(25 + Math.random() * 30)
      : -(15 + Math.random() * 25);
    const len = 80 + Math.random() * 100;
    const travel = 200 + Math.random() * 220;
    const dur = 0.75 + Math.random() * 0.55;

    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.style.setProperty('--angle', angle + 'deg');
    star.style.setProperty('--len', len + 'px');
    star.style.setProperty('--travel', travel + 'px');
    star.style.setProperty('--dur', dur + 's');

    starsEl.appendChild(star);
    star.addEventListener('animationend', () => star.remove());
  }

  function scheduleShootingStar() {
    clearTimeout(shootTimer);
    const delay = SHOOT_INTERVAL + Math.random() * SHOOT_VARIANCE;
    shootTimer = setTimeout(() => {
      if (enabled) {
        spawnShootingStar();
        if (Math.random() < 0.28) setTimeout(spawnShootingStar, 180 + Math.random() * 320);
      }
      scheduleShootingStar();
    }, delay);
  }

  const CLICKABLE = 'a, button, [role="link"], [role="button"], input[type="submit"], input[type="button"], summary, label[for], [onclick]';
  const FIREBALL_TARGETS = CLICKABLE;
  const FIREBALL_MIN_DUR = 0.45;
  const FIREBALL_MAX_DUR = 1.05;
  const FIREBALL_SPEED = 420;   // px per second (lower = slower)

  function heroBlast() {
    if (!cursorEl) return;
    cursorEl.classList.add('__phz_blast');
    clearTimeout(blastTimer);
    blastTimer = setTimeout(() => cursorEl.classList.remove('__phz_blast'), 220);
  }

  function spawnFireball(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const dur = Math.min(FIREBALL_MAX_DUR, Math.max(FIREBALL_MIN_DUR, dist / FIREBALL_SPEED));

    const fb = document.createElement('div');
    fb.className = '__phz_fireball';
    fb.style.left = fromX + 'px';
    fb.style.top = fromY + 'px';
    fb.style.setProperty('--dx', dx + 'px');
    fb.style.setProperty('--dy', dy + 'px');
    fb.style.setProperty('--dur', dur + 's');
    document.body.appendChild(fb);

    const burstDelay = (dur * 1000 * 0.78) | 0;
    setTimeout(() => {
      const burst = document.createElement('div');
      burst.className = '__phz_fireburst';
      burst.style.left = toX + 'px';
      burst.style.top = toY + 'px';
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
    }, burstDelay);

    fb.addEventListener('animationend', () => fb.remove());
  }

  function onFireballClick(e) {
    if (!enabled) return;
    const target = e.target.closest && e.target.closest(FIREBALL_TARGETS);
    if (!target) return;
    heroBlast();
    spawnFireball(mouseX, mouseY, e.clientX, e.clientY);
  }

  function onOver(e) {
    if (!cursorEl || !enabled) return;
    const clickable = e.target.closest && e.target.closest(CLICKABLE);
    cursorEl.classList.toggle('__phz_active', !!clickable);
  }

  function setEnabled(on) {
    enabled = on;
    styleEl.disabled = !on;
    [galaxyEl, nebulaEl, starsEl, scanEl, cursorEl].forEach(el => {
      if (el) el.style.display = on ? 'block' : 'none';
    });
    if (!on) {
      stopIdleSmoke();
      stopAutoScroll();
      clearTimeout(shootTimer);
      clearTimeout(blastTimer);
      if (cursorEl) cursorEl.classList.remove('__phz_blast');
    } else {
      scheduleShootingStar();
    }
  }

  // ---------- double-tap Up/Down auto-scroll ----------
  let autoScrollDir = 0;
  let autoScrollRaf = null;
  let lastUpTap = 0;
  let lastDownTap = 0;

  function isEditableTarget(el) {
    if (!el || !el.closest) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return !!el.closest('[contenteditable="true"]');
  }

  function stopAutoScroll() {
    autoScrollDir = 0;
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = null;
    }
  }

  function tickAutoScroll() {
    if (!enabled || autoScrollDir === 0) {
      autoScrollRaf = null;
      return;
    }
    window.scrollBy(0, autoScrollDir * AUTO_SCROLL_PX);
    autoScrollRaf = requestAnimationFrame(tickAutoScroll);
  }

  function startAutoScroll(dir) {
    if (autoScrollDir === dir) {
      stopAutoScroll();
      return;
    }
    autoScrollDir = dir;
    if (!autoScrollRaf) autoScrollRaf = requestAnimationFrame(tickAutoScroll);
  }

  function onKeyDown(e) {
    if (e.ctrlKey && e.altKey && (e.key === 'm' || e.key === 'M')) {
      setEnabled(!enabled);
      return;
    }
    if (!enabled || isEditableTarget(e.target)) return;

    if (e.key === 'Escape' || e.key === ' ') {
      stopAutoScroll();
      return;
    }

    const now = performance.now();
    if (e.key === 'ArrowUp') {
      if (now - lastUpTap < DOUBLE_TAP_MS) {
        e.preventDefault();
        startAutoScroll(-1);
        lastUpTap = 0;
      } else {
        lastUpTap = now;
      }
    } else if (e.key === 'ArrowDown') {
      if (now - lastDownTap < DOUBLE_TAP_MS) {
        e.preventDefault();
        startAutoScroll(1);
        lastDownTap = 0;
      } else {
        lastDownTap = now;
      }
    }
  }

  addEventListener('keydown', onKeyDown);

  addEventListener('resize', () => {
    if (!starsEl) return;
    starsEl.textContent = '';
    buildStarfield();
  }, { passive: true });

  function makeLayer(id) {
    const d = document.createElement('div');
    d.id = id;
    return d;
  }

  function init() {
    galaxyEl = makeLayer('__phz_galaxy');
    nebulaEl = makeLayer('__phz_nebula');
    starsEl = makeLayer('__phz_stars');
    scanEl = makeLayer('__phz_scan');

    document.body.appendChild(galaxyEl);
    document.body.appendChild(nebulaEl);
    document.body.appendChild(starsEl);
    document.body.appendChild(scanEl);

    buildStarfield();
    scheduleShootingStar();

    cursorEl = document.createElement('div');
    cursorEl.id = '__phz_cursor';
    glyphEl = document.createElement('div');
    glyphEl.className = 'glyph';
    glyphEl.innerHTML = HERO_SVG;
    cursorEl.appendChild(glyphEl);
    document.body.appendChild(cursorEl);

    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('mouseover', onOver, true);
    addEventListener('mousedown', onFireballClick, true);
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
