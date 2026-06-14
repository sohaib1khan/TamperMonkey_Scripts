# TamperMonkey Scripts

A collection of useful userscripts for Tampermonkey (and compatible managers). Scripts in this repository are intended to be practical, self-contained, and easy to install on any site where they apply.

## Repository layout

| Path | Description |
|------|-------------|
| `theme/` | Universal page themes: visual styling, custom cursors, and lightweight interaction effects |
| `assets/` | Supporting media for documentation and demos |

Additional script categories may be added over time as the collection grows.

## Themes

These scripts apply a site-wide visual theme on matching pages (`*://*/*`). Each theme can be toggled on or off with **Ctrl+Alt+M**.

| Script | Summary |
|--------|---------|
| [Matrix Theme](theme/MatrixTheme.js) | Matrix-style code rain, glowing links, emoji cursor with a breathing effect over clickables, purple idle smoke, and double-tap Up/Down auto-scroll |
| [Matrix Theme — Superhero Build](theme/MatrixTheme_Superhero.js) | Code rain plus a caped-hero cursor: movement tilt, idle breathing, click feedback, whip effect on links, rain flash on impact, idle smoke, and auto-scroll |
| [Purple Haze — Galaxy Build](theme/PurpleHaze_Retro.js) | Galaxy nebula background, starfield, Goku-style hero cursor, fireball effect on link and button clicks, idle smoke, and auto-scroll |

### Theme demo

A screen recording of the themes in use is included in this repository:

- **File:** [`assets/theme-demo.mp4`](assets/theme-demo.mp4)
- **Direct link (after push to GitHub):** [View or download on GitHub](https://github.com/sohaib1khan/TamperMonkey_Scripts/blob/main/assets/theme-demo.mp4)

<video src="assets/theme-demo.mp4" controls width="100%">
  Your browser does not support embedded video. Use the link above to open the demo file.
</video>

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open the desired script file in this repository (for example, `theme/MatrixTheme.js`).
3. Copy the full contents into a new Tampermonkey userscript, or install via your preferred workflow (raw URL, local file, and so on).
4. Save and enable the script.

## Usage notes

- **Toggle:** Press **Ctrl+Alt+M** to enable or disable an active theme without removing it.
- **Auto-scroll:** Double-tap the **Up** or **Down** arrow key to start continuous scrolling in that direction; double-tap again, or press **Escape** or **Space**, to stop.
- **iframes:** Theme scripts skip iframe contexts to avoid duplicate effects and reduce overhead.
