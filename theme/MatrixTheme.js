// ==UserScript==
// @name         Matrix Theme — Cool Build
// @namespace    https://github.com/yourname/matrix-theme
// @version      0.3.0
// @description  Matrix-inspired universal theme: code rain, framed images, glowing links, emoji hand cursor that breathes on clickables, purple idle smoke. Toggle on/off with Ctrl+Alt+M.
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

  // emoji used for the cursor
  const HAND_DEFAULT = '🖕';  // resting gesture
  const HAND_LINK = '👆';     // over something clickable

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
      display: block; font-size: 26px; line-height: 1;
      transform: translate(-50%, -50%);
      filter: drop-shadow(0 0 6px rgba(0,255,156,0.7));
      transition: filter .15s ease;
    }
    /* breathing animation when hovering anything clickable */
    #__mtx_cursor.__mtx_breathe .glyph {
      animation: __mtx_breathe 1.05s ease-in-out infinite;
    }
    @keyframes __mtx_breathe {
      0%, 100% { transform: translate(-50%,-50%) scale(1);
                 filter: drop-shadow(0 0 5px rgba(47,217,255,0.75)); }
      50%      { transform: translate(-50%,-50%) scale(1.45);
                 filter: drop-shadow(0 0 16px rgba(47,217,255,0.95)); }
    }

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

  // swap gesture + start/stop breathing based on what's under the pointer
  const CLICKABLE = 'a, button, [role="link"], [role="button"], input[type="submit"], input[type="button"], summary, label[for], [onclick]';
  function onOver(e) {
    if (!cursorEl || !enabled) return;
    const clickable = e.target.closest && e.target.closest(CLICKABLE);
    glyphEl.textContent = clickable ? HAND_LINK : HAND_DEFAULT;
    cursorEl.classList.toggle('__mtx_breathe', !!clickable);
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
    glyphEl.textContent = HAND_DEFAULT;
    cursorEl.appendChild(glyphEl);
    document.body.appendChild(cursorEl);

    resize();
    addEventListener('resize', resize);
    addEventListener('mousemove', onMove, { passive: true });
    addEventListener('mouseover', onOver, true);
    requestAnimationFrame(rain);
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
