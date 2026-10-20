# Grid Rush: In Order

A standalone, installable variation of **Grid Rush**, built with HTML, CSS and vanilla JavaScript. No packages, backend, accounts or external requests are needed to play.

## Run locally

Use Node.js 20 or newer:

```sh
cd grid-rush-in-order
npm start
```

Open **http://localhost:5174/**. Set `PORT` to use another port. Serve the folder over HTTP rather than opening `index.html` as a file, so JavaScript modules and offline installation work.

## How to play

Choose a sequence before starting:

- **Numbers:** 1 through 9, 16, 25 or 36, using a 3×3, 4×4, 5×5 or 6×6 board.
- **Lowercase:** a through z, all 26 letters.
- **Uppercase:** A through Z, all 26 letters.
- **Mixed case:** all 26 letters, each shown once in randomly chosen uppercase or lowercase. Follow alphabetical order regardless of case: `A → b → C …`.

Letter rounds use a 6×6 board with ten noninteractive blank cells. Every round shuffles the board. Find the symbol shown in **Next up**, then continue in sequence. Wrong taps do not advance the game or add a penalty; the clock keeps running. Cleared tiles show a checkmark and cannot count again.

Mouse clicks, immediate touch/pen contact, Tab, arrow keys, Enter and Space are supported. Restart stops the clock and returns to setup; Play Again starts a fresh shuffled round.

## Logic and storage

- `src/game.js`: an `idle → playing → completed` state model, sequence generation, Fisher–Yates shuffle and ordered input validation. It uses `performance.now()` and freezes the elapsed milliseconds on the final correct input.
- `src/app.js`: DOM rendering, next-symbol feedback, keyboard/touch interaction and a `requestAnimationFrame` timer display. Explicit CSS Grid rows and columns preserve cell geometry after clicks.
- `src/leaderboard.js`: fastest three full-precision times and ISO dates for each of seven challenges: four numeric sizes and three alphabet modes. Only display values are rounded. Invalid records are filtered and storage failures fall back to records for the current visit.
- Records use **`grid-rush-in-order.records.v1`**, separate from the original game's storage. Scores stay in this browser and on this device.
- `manifest.webmanifest`, `sw.js` and `src/pwa.js`: standalone installation and offline play, with a separate cache prefix that preserves Grid Rush's cache. Bump the cache version when changing app assets.

This folder is self-contained and can be served under a subdirectory such as `/games/grid-rush-in-order/`. The original `grid-rush` game remains independent.

## Verification

```sh
npm test
```

Core tests use Node's built-in test runner. Optional browser checks use an existing Playwright installation and Chrome; Playwright is not an application dependency:

```sh
# Keep npm start running in another terminal.
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/browser-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/pwa-check.mjs
```

Set `GRID_RUSH_URL` to check another served URL. Browser screenshots default to `/tmp/grid-rush-in-order-qa`; set `GRID_RUSH_SCREENSHOTS` to change that. See `VERIFICATION.md` for the recorded checks and practical limits.

## Assets

The visual style, local fonts and app icons are adapted from Grid Rush. Font licenses are included in `assets/fonts/`. Both games use the repository's MIT license.
