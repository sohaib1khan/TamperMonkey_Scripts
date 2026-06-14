// ==UserScript==
// @name         Matrix Theme — Superhero Build
// @namespace    https://github.com/yourname/matrix-theme
// @version      0.4.0
// @description  Matrix-inspired universal theme: code rain, framed images, glowing links, a caped-hero cursor that floats over clickables and cracks a whip on click, purple idle smoke. Toggle on/off with Ctrl+Alt+M.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Don't run inside iframes — keeps it light and avoids duplicate rain.
  if (window.top !== window.self) return;

  // ---------- config ----------
  const GREEN = '#00ff9c';
  const GLYPHS = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
  const randGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  let enabled = true;
  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let cursorEl = null;        // custom emoji cursor element
  let glyphEl = null;         // inner span that holds the emoji

  // emoji used for the cursor — generic caped superhero
  const HERO = '🦸';

  // ---------- styles ----------

  const styleEl = document.createElement('style');
  styleEl.id = '__mtx_style';
  styleEl.textContent = `
    html { background: #05060a !important; }
    body { background: rgba(5,6,10,0.72) !important; color: ${GREEN} !important;
           font-family: "Courier New", monospace !important; }

    /* readable green text + soft phosphor glow */
    body, p, span, li, td, th, h1, h2, h3, h4, h5, h6, label, blockquote, figcaption {
      color: ${GREEN} !important;
      text-shadow: 0 0 4px rgba(0,255,156,0.35) !important;
    }

    /* links: a distinct cyan, always underlined, so they're obviously clickable */
    a, a * { color: #2fd9ff !important; font-weight: 600 !important; }
    a {
      text-decoration: none !important;
      background-image: linear-gradient(#2fd9ff, #2fd9ff) !important;
      background-size: 100% 1px !important;          /* subtle underline always on */
      background-position: 0 100% !important;
      background-repeat: no-repeat !important;
      text-shadow: 0 0 4px rgba(47,217,255,0.4) !important;
      transition: color .2s ease !important;
    }
    a:hover, a:hover * { color: #d6f6ff !important; }
    a:hover {
      animation: __mtx_linkpulse .85s ease-in-out infinite !important;  /* pulses = clickable */
    }
    @keyframes __mtx_linkpulse {
      0%, 100% { text-shadow: 0 0 4px rgba(47,217,255,0.5); }
      50%      { text-shadow: 0 0 12px #2fd9ff, 0 0 22px rgba(47,217,255,0.85); }
    }

    /* images: dark backing + frame so white ones don't blow out, never overflow text */
    img, picture, video {
      max-width: 100% !important;
      height: auto !important;
      background: #05060a !important;
      border: 1px solid rgba(0,255,156,0.35) !important;
      border-radius: 4px !important;
      box-shadow: 0 0 14px rgba(0,255,156,0.18) !important;
    }

    /* hide the native pointer — we draw our own emoji hand instead */
    *, *::before, *::after { cursor: none !important; }
    input, textarea, [contenteditable] { cursor: text !important; }

    /* custom emoji hand cursor */
    #__mtx_cursor {
      position: fixed; top: 0; left: 0; z-index: 2147483647;
      pointer-events: none; will-change: transform; user-select: none;
    }
    #__mtx_cursor .glyph {
      display: block; font-size: 28px; line-height: 1;
      transform: translate(-50%, -50%);
      filter: drop-shadow(0 0 7px rgba(120,180,255,0.8));
      transition: filter .15s ease;
    }
    /* "hovering in the air" animation when over anything clickable */
    #__mtx_cursor.__mtx_hero .glyph {
      animation: __mtx_herofloat 1s ease-in-out infinite;
    }
    @keyframes __mtx_herofloat {
      0%, 100% { transform: translate(-50%,-50%) translateY(0)    scale(1);
                 filter: drop-shadow(0 0 7px rgba(90,150,255,0.85)); }
      50%      { transform: translate(-50%,-50%) translateY(-6px) scale(1.15);
                 filter: drop-shadow(0 0 18px rgba(140,200,255,1)); }
    }

    /* whip crack — spawned at the click point */
    .__mtx_whipwrap {
      position: fixed; z-index: 2147483646; pointer-events: none;
      transform: translate(-50%, -50%);
      animation: __mtx_whipfade .5s ease-out forwards;
    }
    .__mtx_whipwrap .lash, .__mtx_whipwrap .lash2 {
      stroke-dasharray: 240; stroke-dashoffset: 240;
      animation: __mtx_lash .16s ease-out forwards;
    }
    .__mtx_whipwrap .lash2 { animation-delay: .09s; }
    .__mtx_whipwrap .burst { opacity: 0; }
    .__mtx_whipwrap .burst line {
      stroke-dasharray: 30; stroke-dashoffset: 30;
      animation: __mtx_spark .3s ease-out .12s forwards;
    }
    .__mtx_whipwrap .star {
      opacity: 0; transform-box: fill-box; transform-origin: center;
      transform: scale(0); animation: __mtx_star .38s ease-out .12s forwards;
    }
    @keyframes __mtx_lash  { to { stroke-dashoffset: 0; } }
    @keyframes __mtx_spark { 0% { stroke-dashoffset: 30; opacity: 1; }
                             100% { stroke-dashoffset: 0; opacity: 0; } }
    @keyframes __mtx_star  { 0% { opacity: 0; transform: scale(0); }
                             40% { opacity: 1; transform: scale(1.3); }
                             100% { opacity: 0; transform: scale(1.7); } }
    @keyframes __mtx_whipfade { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }

    /* thin glowing scrollbar */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #05060a; }
    ::-webkit-scrollbar-thumb { background: rgba(0,255,156,0.4); border-radius: 6px; }

    /* selection like a terminal */
    ::selection { background: ${GREEN}; color: #05060a; }

    /* particle layer pieces */
    .__mtx_p {
      position: fixed; pointer-events: none; z-index: 2147483646;
      color: ${GREEN}; font: 14px "Courier New", monospace;
      text-shadow: 0 0 6px ${GREEN}; will-change: transform, opacity;
      animation: __mtx_trail .9s linear forwards;
    }
    .__mtx_s {
      position: fixed; pointer-events: none; z-index: 2147483646;
      width: 34px; height: 34px; border-radius: 50%;
      background: radial-gradient(circle, rgba(180,90,255,0.75), rgba(140,60,230,0.3) 45%, rgba(140,60,230,0) 72%);
      filter: blur(2px);                 /* hazy */
      will-change: transform, opacity; animation: __mtx_smoke 1.7s ease-out forwards;
    }
    @keyframes __mtx_trail { to { transform: translateY(-34px); opacity: 0; } }
    @keyframes __mtx_smoke {
      0%   { transform: translate(0,0) scale(.3); opacity: .6; }
      100% { transform: translate(var(--dx,0px), -46px) scale(2.7); opacity: 0; }
    }
  `;
  (document.head || document.documentElement).appendChild(styleEl);

  // ---------- rain canvas ----------
  const canvas = document.createElement('canvas');
  canvas.id = '__mtx_rain';
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  const ctx = canvas.getContext('2d');
  const FONT = 16;
  let drops = [];

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const cols = Math.floor(canvas.width / FONT);
    drops = Array(cols).fill(0).map(() => Math.random() * -50);
  }

  let last = 0;
  function rain(now) {
    requestAnimationFrame(rain);
    if (!enabled) return;
    if (now - last < 48) return;            // ~20fps, calm + cheap
    last = now;
    ctx.fillStyle = 'rgba(5,6,10,0.1)';     // fade trail
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FONT + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const x = i * FONT, y = drops[i] * FONT;
      ctx.fillStyle = '#cfffe9';            // bright head
      ctx.fillText(randGlyph(), x, y);
      ctx.fillStyle = 'rgba(0,255,156,0.55)';
      ctx.fillText(randGlyph(), x, y - FONT);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  // ---------- cursor trail + idle smoke ----------
  let trailLast = 0;
  let idleTimer = null;
  let smokeTimer = null;

  function spawnTrail(x, y) {
    const p = document.createElement('div');
    p.className = '__mtx_p';
    p.textContent = randGlyph();
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }

  function spawnSmoke(x, y) {
    const puffs = 2 + (Math.random() * 2 | 0);   // 2-3 puffs per "pfft"
    for (let i = 0; i < puffs; i++) {
      const s = document.createElement('div');
      s.className = '__mtx_s';
      s.style.left = (x - 13 + (Math.random() * 18 - 9)) + 'px';
      s.style.top = (y - 4) + 'px';
      s.style.setProperty('--dx', (Math.random() * 28 - 14) + 'px');
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  }

  function startIdleSmoke() {
    if (smokeTimer) return;
    smokeTimer = setInterval(() => { if (enabled) spawnSmoke(mouseX, mouseY); }, 380);
  }
  function stopIdleSmoke() {
    clearInterval(smokeTimer);
    smokeTimer = null;
  }

  function onMove(e) {
    mouseX = e.clientX; mouseY = e.clientY;
    if (cursorEl) cursorEl.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    stopIdleSmoke();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startIdleSmoke, 2200); // idle ~2.2s -> it breathes smoke
    if (!enabled) return;
    const t = performance.now();
    if (t - trailLast > 45) { trailLast = t; spawnTrail(mouseX, mouseY); }
  }

  // float the hero when over anything clickable
  const CLICKABLE = 'a, button, [role="link"], [role="button"], input[type="submit"], input[type="button"], summary, label[for], [onclick]';
  function onOver(e) {
    if (!cursorEl || !enabled) return;
    const clickable = e.target.closest && e.target.closest(CLICKABLE);
    cursorEl.classList.toggle('__mtx_hero', !!clickable);
  }

  // crack a whip at the click point
  function spawnWhip(x, y) {
    const wrap = document.createElement('div');
    wrap.className = '__mtx_whipwrap';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.innerHTML =
      '<svg width="170" height="170" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="lash"  d="M8 14 Q 46 60, 85 85" fill="none" stroke="#c98a3c" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path class="lash2" d="M85 85 q 22 6, 40 -8"  fill="none" stroke="#a9712c" stroke-width="2.5" stroke-linecap="round"/>' +
        '<g class="burst" stroke="#fff6cc" stroke-width="3" stroke-linecap="round">' +
          '<line x1="85" y1="85" x2="85"  y2="58"/>' +
          '<line x1="85" y1="85" x2="106" y2="68"/>' +
          '<line x1="85" y1="85" x2="112" y2="90"/>' +
          '<line x1="85" y1="85" x2="100" y2="106"/>' +
          '<line x1="85" y1="85" x2="66"  y2="104"/>' +
        '</g>' +
        '<polygon class="star" points="85,64 90,79 105,79 93,89 98,104 85,95 72,104 77,89 65,79 80,79" fill="rgba(255,240,170,0.9)"/>' +
      '</svg>';
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 600);
  }

  function onClickWhip(e) {
    if (!enabled) return;
    if (e.target.closest && e.target.closest(CLICKABLE)) spawnWhip(e.clientX, e.clientY);
  }

  // ---------- toggle (Ctrl+Alt+M) ----------
  function setEnabled(on) {
    enabled = on;
    styleEl.disabled = !on;
    canvas.style.display = on ? 'block' : 'none';
    if (cursorEl) cursorEl.style.display = on ? 'block' : 'none';
    if (!on) stopIdleSmoke();
  }

  addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && (e.key === 'm' || e.key === 'M')) setEnabled(!enabled);
  });

  // ---------- boot ----------
  function init() {
    document.body.appendChild(canvas);

    // build the emoji hand cursor
    cursorEl = document.createElement('div');
    cursorEl.id = '__mtx_cursor';
    glyphEl = document.createElement('span');
    glyphEl.className = 'glyph';
    glyphEl.textContent = HERO;
    cursorEl.appendChild(glyphEl);
    document.body.appendChild(cursorEl);

    resize();
    addEventListener('resize', resize);
    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('mouseover', onOver, true);
    addEventListener('mousedown', onClickWhip, true);
    requestAnimationFrame(rain);
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
