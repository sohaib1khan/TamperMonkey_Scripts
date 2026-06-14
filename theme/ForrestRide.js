// ==UserScript==
// @name         Forrest Ride
// @namespace    https://github.com/sohaib1khan/TamperMonkey_Scripts.git
// @version      1.3.1
// @description  Forest waterfall GIF backdrop, bluish-gray sky, low-vision text contrast, droplet/wave cursor, link thunder, mist trail, idle storm, auto-scroll. Toggle on/off with Ctrl+Alt+M.
// @author       Sohaib Khan
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.top !== window.self) return;

  const TEXT = '#f5fff8';
  const TEXT_BRIGHT = '#ffffff';
  const DEEP = '#071510';
  const AQUA = '#52b788';
  const LINK = '#9eeaff';
  const READ_HALO =
    '0 0 2px rgba(0,0,0,0.98), 0 1px 3px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.88)';
  const FOREST_GIF = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExODVvYmFsYXNwZjg1Y2V0ZWRsOTJ3cnBoaDZjYWs4Y2k3NXVzM2NtciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RoFXqXWN639Qs/giphy.gif';
  const AUTO_SCROLL_PX = 3;
  const DOUBLE_TAP_MS = 450;

  let enabled = true;
  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let cursorEl = null, glyphEl = null;
  let forestEl = null, skyEl = null, scrimEl = null, thunderEl = null, boltEl = null;
  let rainIntensity = 0.35;

  const DROPLET_SVG =
    '<svg width="44" height="58" viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="__ocr_dropGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#b7e4ff"/>' +
          '<stop offset="45%" stop-color="#48cae4"/>' +
          '<stop offset="100%" stop-color="#0077b6"/>' +
        '</linearGradient>' +
        '<radialGradient id="__ocr_shine" cx="35%" cy="30%" r="55%">' +
          '<stop offset="0%" stop-color="rgba(255,255,255,0.85)"/>' +
          '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<g class="drop-body">' +
        '<path d="M22 3 C22 3 6 30 6 42 C6 52 13 56 22 56 C31 56 38 52 38 42 C38 30 22 3 22 3 Z" fill="url(#__ocr_dropGrad)" stroke="rgba(255,255,255,0.55)" stroke-width="0.8"/>' +
        '<ellipse cx="16" cy="34" rx="6" ry="9" fill="url(#__ocr_shine)" opacity="0.75"/>' +
        '<ellipse class="drop-core" cx="22" cy="44" rx="3" ry="4" fill="rgba(180,240,255,0.55)">' +
          '<animate attributeName="ry" values="4;5.5;4" dur="1.6s" repeatCount="indefinite"/>' +
        '</ellipse>' +
        '<circle class="drop-ripple drop-ripple-1" cx="22" cy="52" r="2" fill="none" stroke="rgba(180,230,255,0.7)" stroke-width="1">' +
          '<animate attributeName="r" values="2;14;2" dur="2.2s" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values="0.8;0;0.8" dur="2.2s" repeatCount="indefinite"/>' +
        '</circle>' +
        '<circle class="drop-ripple drop-ripple-2" cx="22" cy="52" r="2" fill="none" stroke="rgba(140,210,255,0.5)" stroke-width="0.8">' +
          '<animate attributeName="r" values="2;18;2" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>' +
        '</circle>' +
      '</g>' +
    '</svg>';

  const WAVE_SVG =
    '<svg width="56" height="44" viewBox="0 0 56 44" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="__ocr_waveGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#caf0f8"/>' +
          '<stop offset="55%" stop-color="#48cae4"/>' +
          '<stop offset="100%" stop-color="#023e8a"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g class="wave-body">' +
        '<path d="M-2 27 C11 17 19 33 28 25 S45 17 58 27 L58 44 L-2 44 Z" fill="rgba(72,202,228,0.35)">' +
          '<animate attributeName="d" dur="2.1s" repeatCount="indefinite" values="' +
            'M-2 27 C11 17 19 33 28 25 S45 17 58 27 L58 44 L-2 44 Z;' +
            'M-2 27 C11 31 19 15 28 23 S45 31 58 27 L58 44 L-2 44 Z;' +
            'M-2 27 C11 17 19 33 28 25 S45 17 58 27 L58 44 L-2 44 Z"/>' +
        '</path>' +
        '<path d="M-2 31 C13 21 21 37 28 29 S43 21 58 31 L58 44 L-2 44 Z" fill="url(#__ocr_waveGrad)" stroke="rgba(255,255,255,0.55)" stroke-width="0.7">' +
          '<animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="' +
            'M-2 31 C13 21 21 37 28 29 S43 21 58 31 L58 44 L-2 44 Z;' +
            'M-2 31 C13 35 21 19 28 27 S43 35 58 31 L58 44 L-2 44 Z;' +
            'M-2 31 C13 21 21 37 28 29 S43 21 58 31 L58 44 L-2 44 Z"/>' +
        '</path>' +
        '<path d="M6 29 Q14 24 22 29 T38 29 T50 29" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.6" stroke-linecap="round">' +
          '<animate attributeName="opacity" values="0.45;1;0.45" dur="1.1s" repeatCount="indefinite"/>' +
        '</path>' +
        '<circle cx="42" cy="26" r="2" fill="rgba(255,255,255,0.8)">' +
          '<animate attributeName="cy" values="26;22;26" dur="1.4s" repeatCount="indefinite"/>' +
        '</circle>' +
      '</g>' +
    '</svg>';

  const styleEl = document.createElement('style');
  styleEl.id = '__ocr_style';
  styleEl.textContent = `
    html { background: ${DEEP} !important; }

    body {
      background: transparent !important;
      color: ${TEXT} !important;
      line-height: 1.5 !important;
    }

    /* readable text: bright color + dark halo — text nodes only, not layout containers */
    body, p, span, li, td, th, dt, dd, small, strong, em, b, i, u,
    h1, h2, h3, h4, h5, h6, label, blockquote, figcaption, legend,
    pre, code, kbd, samp, mark, time, abbr, cite, q {
      color: ${TEXT} !important;
      -webkit-text-fill-color: ${TEXT} !important;
      text-shadow: ${READ_HALO} !important;
      background-color: transparent !important;
      mix-blend-mode: normal !important;
    }

    h1, h2, h3, h4, h5, h6 {
      color: ${TEXT_BRIGHT} !important;
      -webkit-text-fill-color: ${TEXT_BRIGHT} !important;
      font-weight: 700 !important;
    }

    nav, header, [role="navigation"], [role="banner"] {
      background-color: rgba(2, 8, 6, 0.82) !important;
    }
    nav a, nav span,
    header a, header span,
    [role="navigation"] a, [role="navigation"] span {
      color: ${TEXT_BRIGHT} !important;
      -webkit-text-fill-color: ${TEXT_BRIGHT} !important;
      text-shadow: ${READ_HALO} !important;
      font-weight: 600 !important;
    }

    pre, code {
      background: rgba(2, 8, 6, 0.94) !important;
      border: 1px solid rgba(130, 220, 180, 0.5) !important;
      border-radius: 4px !important;
      text-shadow: none !important;
    }
    pre { padding: 0.65em 0.85em !important; }
    code { padding: 0.12em 0.35em !important; }

    mark {
      background: rgba(255, 244, 120, 0.92) !important;
      color: ${DEEP} !important;
      -webkit-text-fill-color: ${DEEP} !important;
      text-shadow: none !important;
      font-weight: 700 !important;
    }

    input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
    textarea, select, [contenteditable="true"] {
      color: ${TEXT_BRIGHT} !important;
      -webkit-text-fill-color: ${TEXT_BRIGHT} !important;
      background: rgba(2, 10, 7, 0.96) !important;
      border: 2px solid rgba(130, 220, 180, 0.65) !important;
      text-shadow: none !important;
      font-weight: 600 !important;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.45) !important;
    }
    input::placeholder, textarea::placeholder {
      color: rgba(210, 235, 220, 0.8) !important;
      -webkit-text-fill-color: rgba(210, 235, 220, 0.8) !important;
    }

    button, [role="button"], input[type="submit"], input[type="button"] {
      color: ${TEXT_BRIGHT} !important;
      -webkit-text-fill-color: ${TEXT_BRIGHT} !important;
      text-shadow: ${READ_HALO} !important;
      font-weight: 600 !important;
    }

    a, a:visited {
      color: ${LINK} !important;
      -webkit-text-fill-color: ${LINK} !important;
      font-weight: 700 !important;
      text-decoration: none !important;
      background-image: linear-gradient(${LINK}, ${LINK}) !important;
      background-size: 100% 2px !important;
      background-position: 0 100% !important;
      background-repeat: no-repeat !important;
      text-shadow: ${READ_HALO} !important;
    }
    a:hover {
      color: ${TEXT_BRIGHT} !important;
      -webkit-text-fill-color: ${TEXT_BRIGHT} !important;
      animation: __ocr_linkpulse .9s ease-in-out infinite !important;
    }
    /* never restyle media inside links — fixes Amazon nav icon stacks */
    a img, a svg, a picture, a video,
    button img, button svg, nav img, nav svg,
    header img, header svg, footer img, footer svg,
    [role="navigation"] img, [role="navigation"] svg {
      color: inherit !important;
      -webkit-text-fill-color: initial !important;
      text-shadow: none !important;
      font-weight: normal !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      mix-blend-mode: normal !important;
    }
    svg { text-shadow: none !important; filter: none !important; }

    @keyframes __ocr_linkpulse {
      0%, 100% { text-shadow: ${READ_HALO}; }
      50%      { text-shadow: ${READ_HALO}, 0 0 14px rgba(158, 234, 255, 0.75); }
    }

    /* content images only — leave nav/header icons alone */
    article img, main img, figure img, picture img, p img {
      max-width: 100% !important;
      height: auto !important;
      object-fit: contain !important;
      background: rgba(7, 21, 16, 0.75) !important;
      border: 1px solid rgba(82, 183, 136, 0.35) !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 18px rgba(20, 80, 60, 0.25) !important;
      mix-blend-mode: normal !important;
      isolation: isolate !important;
    }
    nav img, header img, footer img, [role="navigation"] img,
    img[width], img[height], img[src*="sprites"], img[src*="sprite"] {
      max-width: none !important;
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      border-radius: 0 !important;
    }
    video:not(#__ocr_rain) {
      max-width: 100% !important;
      height: auto !important;
      background: rgba(7, 21, 16, 0.75) !important;
      border: 1px solid rgba(82, 183, 136, 0.35) !important;
      border-radius: 8px !important;
    }

    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${DEEP}; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, ${AQUA}, #2d6a4f);
      border-radius: 6px;
    }
    ::selection { background: ${AQUA}; color: ${DEEP}; -webkit-text-fill-color: ${DEEP}; }

    *, *::before, *::after { cursor: none !important; }
    input, textarea, [contenteditable] { cursor: text !important; }

    #__ocr_forest {
      position: fixed; inset: 0; z-index: -5; pointer-events: none;
      background: ${DEEP} url("${FOREST_GIF}") center center / cover no-repeat;
    }

    #__ocr_sky {
      position: fixed; inset: 0; z-index: -4; pointer-events: none;
      background:
        radial-gradient(ellipse 55% 28% at 22% 12%, rgba(255, 255, 255, 0.22), transparent 70%),
        radial-gradient(ellipse 45% 22% at 68% 8%, rgba(255, 255, 255, 0.16), transparent 68%),
        radial-gradient(ellipse 60% 30% at 48% 18%, rgba(255, 255, 255, 0.1), transparent 72%),
        linear-gradient(180deg,
          rgba(130, 150, 170, 0.72) 0%,
          rgba(110, 130, 150, 0.48) 14%,
          rgba(90, 110, 125, 0.28) 28%,
          rgba(70, 90, 100, 0.12) 42%,
          transparent 58%);
    }

    #__ocr_scrim {
      position: fixed; inset: 0; z-index: -3; pointer-events: none;
      background: rgba(8, 16, 14, 0.42);
    }

    #__ocr_rain {
      position: fixed; inset: 0; z-index: -2; pointer-events: none;
      width: 100vw; height: 100vh;
    }

    #__ocr_thunder {
      position: fixed; inset: 0; z-index: -1; pointer-events: none;
      background: radial-gradient(ellipse at 50% 20%, rgba(220, 235, 255, 0.55), transparent 65%);
      opacity: 0;
    }
    #__ocr_thunder.__ocr_flash {
      animation: __ocr_thunder_flash 0.55s ease-out forwards;
    }
    @keyframes __ocr_thunder_flash {
      0%   { opacity: 0; }
      12%  { opacity: 0.75; }
      28%  { opacity: 0.15; }
      42%  { opacity: 0.55; }
      100% { opacity: 0; }
    }

    #__ocr_bolt {
      position: fixed; top: 0; left: 50%; z-index: -1; pointer-events: none;
      width: 120px; height: 220px; transform: translateX(-50%);
      opacity: 0;
    }
    #__ocr_bolt.__ocr_show {
      animation: __ocr_bolt_show 0.55s ease-out forwards;
    }
    @keyframes __ocr_bolt_show {
      0%   { opacity: 0; transform: translateX(-50%) scale(0.85); }
      15%  { opacity: 1; }
      100% { opacity: 0; transform: translateX(-50%) scale(1.05); }
    }

    #__ocr_cursor {
      position: fixed; top: 0; left: 0; z-index: 2147483647;
      pointer-events: none; will-change: transform; user-select: none;
    }
    #__ocr_cursor .glyph {
      display: block; width: 44px; height: 58px;
      transform: translate(-50%, -58%) rotate(var(--tilt, 0deg));
      filter: drop-shadow(0 0 10px rgba(72, 202, 228, 0.85));
      animation: __ocr_drop_float 2.5s ease-in-out infinite;
    }
    @keyframes __ocr_drop_float {
      0%, 100% { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) translateY(0); }
      50%      { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) translateY(-4px); }
    }

    #__ocr_cursor.__ocr_active .glyph {
      animation: __ocr_drop_power 0.8s ease-in-out infinite;
      filter: drop-shadow(0 0 16px rgba(144, 224, 239, 1)) drop-shadow(0 0 8px rgba(82, 183, 136, 0.8));
    }
    @keyframes __ocr_drop_power {
      0%, 100% { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1.08); }
      50%      { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1.18) translateY(-5px); }
    }

    #__ocr_cursor.__ocr_wave .glyph {
      width: 56px; height: 44px;
      transform: translate(-50%, -50%) rotate(var(--tilt, 0deg));
      animation: __ocr_wave_surf 1.1s ease-in-out infinite;
      filter: drop-shadow(0 0 16px rgba(72, 202, 228, 0.95)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.45));
    }
    @keyframes __ocr_wave_surf {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--tilt, 0deg)) scale(1.05); }
      50%      { transform: translate(-50%, -50%) rotate(var(--tilt, 0deg)) scale(1.15) translateY(-4px); }
    }

    #__ocr_cursor.__ocr_idle:not(.__ocr_wave):not(.__ocr_active) .glyph {
      animation: __ocr_drop_idle 2.4s ease-in-out infinite;
      filter: drop-shadow(0 0 14px rgba(125, 211, 252, 0.9));
    }
    @keyframes __ocr_drop_idle {
      0%, 100% { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1); }
      50%      { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1.1) translateY(-2px); }
    }

    #__ocr_cursor.__ocr_splash .glyph {
      animation: __ocr_drop_splash 0.18s ease-out !important;
    }
    @keyframes __ocr_drop_splash {
      0%   { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1.05); }
      50%  { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1.28); }
      100% { transform: translate(-50%, -58%) rotate(var(--tilt, 0deg)) scale(1.05); }
    }

    .__ocr_mistpuff {
      position: fixed; pointer-events: none; z-index: 2147483646;
      width: 38px; height: 38px; border-radius: 50%;
      background: radial-gradient(circle, rgba(220, 235, 230, 0.55), rgba(180, 210, 200, 0.2) 50%, transparent 72%);
      filter: blur(3px);
      will-change: transform, opacity;
      animation: __ocr_mistpuff 1.8s ease-out forwards;
    }
    @keyframes __ocr_mistpuff {
      0%   { transform: translate(0, 0) scale(0.25); opacity: 0.7; }
      100% { transform: translate(var(--dx, 0), var(--dy, -36px)) scale(2.4); opacity: 0; }
    }

    .__ocr_splashring {
      position: fixed; pointer-events: none; z-index: 2147483646;
      width: 20px; height: 8px; border-radius: 50%;
      border: 2px solid rgba(144, 224, 239, 0.85);
      transform: translate(-50%, -50%);
      animation: __ocr_splashring 0.55s ease-out forwards;
    }
    @keyframes __ocr_splashring {
      0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
    }

    .__ocr_boldflash {
      position: fixed; inset: 0; z-index: 2147483644; pointer-events: none;
      background: radial-gradient(ellipse at var(--sx, 50%) var(--sy, 40%), rgba(255,255,255,0.95), rgba(200,230,255,0.5) 35%, transparent 70%);
      animation: __ocr_boldflash 0.72s ease-out forwards;
    }
    @keyframes __ocr_boldflash {
      0%   { opacity: 0; }
      10%  { opacity: 1; }
      25%  { opacity: 0.35; }
      38%  { opacity: 0.95; }
      55%  { opacity: 0.2; }
      100% { opacity: 0; }
    }

    .__ocr_strike {
      position: fixed; z-index: 2147483645; pointer-events: none;
      transform: translate(-50%, -55%);
      animation: __ocr_strike_pop 0.72s ease-out forwards;
    }
    .__ocr_strike svg { width: 160px; height: 220px; display: block; filter: drop-shadow(0 0 18px #fff) drop-shadow(0 0 32px rgba(125,211,252,0.95)); }
    @keyframes __ocr_strike_pop {
      0%   { opacity: 0; transform: translate(-50%, -55%) scale(0.5); }
      12%  { opacity: 1; transform: translate(-50%, -55%) scale(1.15); }
      100% { opacity: 0; transform: translate(-50%, -55%) scale(1.35); }
    }
  `;
  (document.head || document.documentElement).appendChild(styleEl);

  const rainCanvas = document.createElement('canvas');
  rainCanvas.id = '__ocr_rain';
  const rainCtx = rainCanvas.getContext('2d');
  let rainDrops = [];

  function resizeRain() {
    rainCanvas.width = innerWidth;
    rainCanvas.height = innerHeight;
    const count = Math.floor((innerWidth * rainIntensity * 0.12) | 0);
    rainDrops = Array(Math.max(20, count)).fill(0).map(() => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      len: 8 + Math.random() * 14,
      speed: 4 + Math.random() * 8,
      drift: -0.8 + Math.random() * 0.4
    }));
  }

  let rainLast = 0;
  function drawRain(now) {
    requestAnimationFrame(drawRain);
    if (!enabled) return;
    if (now - rainLast < 32) return;
    rainLast = now;
    const w = rainCanvas.width, h = rainCanvas.height;
    rainCtx.clearRect(0, 0, w, h);
    rainCtx.lineWidth = 1.2;
    for (let i = 0; i < rainDrops.length; i++) {
      const d = rainDrops[i];
      rainCtx.strokeStyle = 'rgba(180, 220, 210, ' + (0.15 + rainIntensity * 0.45) + ')';
      rainCtx.beginPath();
      rainCtx.moveTo(d.x, d.y);
      rainCtx.lineTo(d.x + d.drift * d.len, d.y + d.len);
      rainCtx.stroke();
      d.y += d.speed * (0.5 + rainIntensity);
      d.x += d.drift * 2;
      if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
      if (d.x < -20 || d.x > w + 20) d.x = Math.random() * w;
    }
  }

  let trailLast = 0, idleTimer = null, mistTimer = null, thunderTimer = null, splashTimer = null;
  let prevX = innerWidth / 2, tilt = 0;
  let isIdle = false;
  let cursorMode = 'drop';

  function spawnMist(x, y) {
    const puffs = 1 + (Math.random() * 2 | 0);
    for (let i = 0; i < puffs; i++) {
      const m = document.createElement('div');
      m.className = '__ocr_mistpuff';
      m.style.left = (x - 16 + Math.random() * 20 - 10) + 'px';
      m.style.top = (y - 8) + 'px';
      m.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
      m.style.setProperty('--dy', (-28 - Math.random() * 24) + 'px');
      document.body.appendChild(m);
      m.addEventListener('animationend', () => m.remove());
    }
  }

  function spawnSplash(x, y) {
    const ring = document.createElement('div');
    ring.className = '__ocr_splashring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 600);
  }

  function spawnBoldStrike(x, y) {
    const flash = document.createElement('div');
    flash.className = '__ocr_boldflash';
    flash.style.setProperty('--sx', ((x / innerWidth) * 100).toFixed(1) + '%');
    flash.style.setProperty('--sy', ((y / innerHeight) * 100).toFixed(1) + '%');
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 750);

    const strike = document.createElement('div');
    strike.className = '__ocr_strike';
    strike.style.left = x + 'px';
    strike.style.top = y + 'px';
    strike.innerHTML =
      '<svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M62 0 L38 92 H72 L48 220 L98 86 H64 L62 0 Z" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="4"/>' +
        '<path d="M62 0 L48 110 L68 110 L58 160 L82 98 H62 L62 0 Z" fill="rgba(255,255,255,0.55)"/>' +
        '<path d="M20 40 L62 0 L52 70 M98 30 L62 0 L72 65" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round">' +
          '<animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="2"/>' +
        '</path>' +
      '</svg>';
    document.body.appendChild(strike);
    setTimeout(() => strike.remove(), 750);

    rainIntensity = Math.min(1, rainIntensity + 0.2);
    resizeRain();
    setTimeout(() => {
      rainIntensity = isIdle ? 0.85 : 0.35;
      resizeRain();
    }, 700);
  }

  function triggerThunder() {
    if (!enabled || !isIdle) return;
    thunderEl.classList.remove('__ocr_flash');
    boltEl.classList.remove('__ocr_show');
    void thunderEl.offsetWidth;
    thunderEl.classList.add('__ocr_flash');
    boltEl.classList.add('__ocr_show');
    rainIntensity = Math.min(1, rainIntensity + 0.08);
    resizeRain();
    setTimeout(() => {
      thunderEl.classList.remove('__ocr_flash');
      boltEl.classList.remove('__ocr_show');
    }, 600);
  }

  function scheduleThunder() {
    clearTimeout(thunderTimer);
    if (!isIdle || !enabled) return;
    const delay = 2800 + Math.random() * 4500;
    thunderTimer = setTimeout(() => {
      triggerThunder();
      scheduleThunder();
    }, delay);
  }

  function startIdleStorm() {
    if (mistTimer) return;
    isIdle = true;
    rainIntensity = 0.85;
    resizeRain();
    if (cursorEl) cursorEl.classList.add('__ocr_idle');
    mistTimer = setInterval(() => { if (enabled) spawnMist(mouseX, mouseY); }, 340);
    scheduleThunder();
  }

  function stopIdleStorm() {
    isIdle = false;
    rainIntensity = 0.35;
    resizeRain();
    clearInterval(mistTimer);
    mistTimer = null;
    clearTimeout(thunderTimer);
    thunderTimer = null;
    if (cursorEl) cursorEl.classList.remove('__ocr_idle');
    if (thunderEl) thunderEl.classList.remove('__ocr_flash');
    if (boltEl) boltEl.classList.remove('__ocr_show');
  }

  function dropSplash() {
    if (!cursorEl) return;
    cursorEl.classList.add('__ocr_splash');
    clearTimeout(splashTimer);
    splashTimer = setTimeout(() => cursorEl.classList.remove('__ocr_splash'), 180);
  }

  function onMove(e) {
    const dx = e.clientX - prevX;
    prevX = e.clientX;
    mouseX = e.clientX;
    mouseY = e.clientY;
    tilt = Math.max(-10, Math.min(10, tilt * 0.65 + dx * 0.3));
    if (cursorEl) cursorEl.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    if (glyphEl) glyphEl.style.setProperty('--tilt', tilt.toFixed(1) + 'deg');
    stopIdleStorm();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startIdleStorm, 2200);
    if (!enabled) return;
    const t = performance.now();
    if (t - trailLast > 50) { trailLast = t; spawnMist(mouseX, mouseY); }
  }

  const CLICKABLE = 'a, button, [role="link"], [role="button"], input[type="submit"], input[type="button"], summary, label[for], [onclick]';
  const LINK_SEL = 'a, [role="link"]';

  function setCursorGlyph(mode) {
    if (!glyphEl || !cursorEl || cursorMode === mode) return;
    cursorMode = mode;
    cursorEl.classList.remove('__ocr_wave', '__ocr_active');
    if (mode === 'wave') {
      glyphEl.innerHTML = WAVE_SVG;
      cursorEl.classList.add('__ocr_wave');
    } else if (mode === 'active') {
      glyphEl.innerHTML = DROPLET_SVG;
      cursorEl.classList.add('__ocr_active');
    } else {
      glyphEl.innerHTML = DROPLET_SVG;
    }
  }

  function onOver(e) {
    if (!cursorEl || !enabled) return;
    const link = e.target.closest && e.target.closest(LINK_SEL);
    const clickable = e.target.closest && e.target.closest(CLICKABLE);
    if (link) setCursorGlyph('wave');
    else if (clickable) setCursorGlyph('active');
    else setCursorGlyph('drop');
  }

  function onClick(e) {
    if (!enabled) return;
    dropSplash();
    spawnSplash(e.clientX, e.clientY);
    const link = e.target.closest && e.target.closest(LINK_SEL);
    if (link) spawnBoldStrike(e.clientX, e.clientY);
    else if (isIdle) triggerThunder();
  }

  function setEnabled(on) {
    enabled = on;
    styleEl.disabled = !on;
    rainCanvas.style.display = on ? 'block' : 'none';
    [forestEl, skyEl, scrimEl, thunderEl, boltEl, cursorEl].forEach(el => {
      if (el) el.style.display = on ? 'block' : 'none';
    });
    if (!on) {
      stopIdleStorm();
      stopAutoScroll();
      cursorMode = 'drop';
      if (cursorEl) {
        cursorEl.classList.remove('__ocr_splash', '__ocr_wave', '__ocr_active');
        if (glyphEl) glyphEl.innerHTML = DROPLET_SVG;
      }
    } else {
      rainIntensity = isIdle ? 0.85 : 0.35;
      resizeRain();
    }
  }

  let autoScrollDir = 0, autoScrollRaf = null, lastUpTap = 0, lastDownTap = 0;

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
    if (autoScrollDir === dir) { stopAutoScroll(); return; }
    autoScrollDir = dir;
    if (!autoScrollRaf) autoScrollRaf = requestAnimationFrame(tickAutoScroll);
  }

  function onKeyDown(e) {
    if (e.ctrlKey && e.altKey && (e.key === 'm' || e.key === 'M')) {
      setEnabled(!enabled);
      return;
    }
    if (!enabled || isEditableTarget(e.target)) return;
    if (e.key === 'Escape' || e.key === ' ') { stopAutoScroll(); return; }
    const now = performance.now();
    if (e.key === 'ArrowUp') {
      if (now - lastUpTap < DOUBLE_TAP_MS) {
        e.preventDefault(); startAutoScroll(-1); lastUpTap = 0;
      } else lastUpTap = now;
    } else if (e.key === 'ArrowDown') {
      if (now - lastDownTap < DOUBLE_TAP_MS) {
        e.preventDefault(); startAutoScroll(1); lastDownTap = 0;
      } else lastDownTap = now;
    }
  }

  addEventListener('keydown', onKeyDown);

  const BOLT_SVG =
    '<svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M68 0 L42 98 H78 L52 220 L92 88 H58 L68 0 Z" fill="rgba(230,245,255,0.95)" stroke="rgba(180,220,255,0.8)" stroke-width="1.5">' +
        '<animate attributeName="opacity" values="1;0.6;1" dur="0.35s" repeatCount="2"/>' +
      '</path>' +
    '</svg>';

  function makeLayer(id) {
    const d = document.createElement('div');
    d.id = id;
    return d;
  }

  function init() {
    forestEl = makeLayer('__ocr_forest');
    skyEl = makeLayer('__ocr_sky');
    scrimEl = makeLayer('__ocr_scrim');
    thunderEl = makeLayer('__ocr_thunder');
    boltEl = makeLayer('__ocr_bolt');
    boltEl.innerHTML = BOLT_SVG;

    document.body.appendChild(forestEl);
    document.body.appendChild(skyEl);
    document.body.appendChild(scrimEl);
    document.body.appendChild(rainCanvas);
    document.body.appendChild(thunderEl);
    document.body.appendChild(boltEl);

    cursorEl = document.createElement('div');
    cursorEl.id = '__ocr_cursor';
    glyphEl = document.createElement('div');
    glyphEl.className = 'glyph';
    glyphEl.innerHTML = DROPLET_SVG;
    cursorEl.appendChild(glyphEl);
    document.body.appendChild(cursorEl);

    resizeRain();
    addEventListener('resize', resizeRain, { passive: true });
    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('mouseover', onOver, true);
    addEventListener('mousedown', onClick, true);
    requestAnimationFrame(drawRain);
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
