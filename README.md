# TamperMonkey Scripts

A collection of useful userscripts for Tampermonkey (and compatible managers). Scripts in this repository are intended to be practical, self-contained, and easy to install on any site where they apply.

## Repository layout

| Path | Description |
|------|-------------|
| `theme/` | Universal page themes: visual styling, custom cursors, and lightweight interaction effects |

Additional script categories may be added over time as the collection grows.

## Themes

These scripts apply a site-wide visual theme on matching pages (`*://*/*`). Each theme can be toggled on or off with **Ctrl+Alt+M**.

| Script | Summary |
|--------|---------|
| [Matrix Theme](theme/MatrixTheme.js) | Matrix-style code rain, glowing links, emoji cursor with a breathing effect over clickables, purple idle smoke, and double-tap Up/Down auto-scroll |
| [Matrix Theme — Superhero Build](theme/MatrixTheme_Superhero.js) | Code rain plus a caped-hero cursor: movement tilt, idle breathing, click feedback, whip effect on links, rain flash on impact |
| [Purple Haze — Galaxy Build](theme/PurpleHaze_Retro.js) | Galaxy nebula background, starfield, Goku-style hero cursor, fireball effect on link and button clicks, idle smoke, and auto-scroll |

### Theme demo

**[Watch on YouTube](https://youtu.be/CBf7S6pyqAQ)**

[![Theme demo](https://img.youtube.com/vi/CBf7S6pyqAQ/maxresdefault.jpg)](https://youtu.be/CBf7S6pyqAQ)

GitHub README files do not support embedded YouTube players (iframes are stripped). The preview above links to the full recording on YouTube.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open the desired script file in this repository (for example, `theme/MatrixTheme.js`).
3. Copy the full contents into a new Tampermonkey userscript, or install via your preferred workflow (raw URL, local file, and so on).
4. Save and enable the script.

## Usage notes

- **Toggle:** Press **Ctrl+Alt+M** to enable or disable an active theme without removing it.
- **Auto-scroll:** Double-tap the **Up** or **Down** arrow key to start continuous scrolling in that direction; double-tap again, or press **Escape** or **Space**, to stop.
- **iframes:** Theme scripts skip iframe contexts to avoid duplicate effects and reduce overhead.

## Author

Sohaib Khan — [github.com/sohaib1khan](https://github.com/sohaib1khan)
