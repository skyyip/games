# Grid Rush: In Order

A standalone, installable variation of **Grid Rush**, built with HTML, CSS and vanilla JavaScript. No packages, backend or accounts are needed to play. Online pages load Google Tag Manager container `GTM-TZ646NJ9`; gameplay and local records continue to work when analytics is unavailable.

## Run locally

Use Node.js 20 or newer:

```sh
cd grid-rush-in-order
npm start
```

Open **http://localhost:5174/grid-rush-in-order/**. Set `PORT` to use another port. The dev server serves the full playground so shared navigation and assets work. Use HTTP rather than opening `index.html` as a file, so JavaScript modules and offline installation work.

## How to play

Choose a sequence before starting:

- **Numbers:** 1 through 9, 16, 25 or 36, using a 3×3, 4×4, 5×5 or 6×6 board.
- **Number range:** 9, 16, 25 or 36 unique random integers from **−999 to 999 inclusive**, using the same grid sizes. Choose smallest to largest or largest to smallest. Negative values and zero follow numeric order, for example `−20 → −3 → 0 → 8`. Values are sampled without replacement, so repeated random draws cannot produce duplicate tiles or stall generation. Start preserves the previewed set; a new round samples a fresh set.
- **Lowercase:** a through z, all 26 letters.
- **Uppercase:** A through Z, all 26 letters.
- **Mixed case:** all 26 letters, each shown once in randomly chosen uppercase or lowercase. Follow alphabetical order regardless of case: `A → b → C …`.
- **Letters + numbers:** **26 shared positions**. Each position randomly appears as its number, uppercase letter or lowercase letter: `1 = A = a`, `2 = B = b`, …, `26 = Z = z`. Each position appears exactly once, with numbers and both cases in every round. Follow the shared position order, for example `1 → b → 3 → 4 → e → F → 7 …`.
- **Colours:** a randomly chosen key of four named colours. Clear every tile matching the first colour, in any tile order, before moving to the next colour. Each round randomly chooses one of three reviewed colour combinations and shuffles its order, avoiding similar shades together. Gold and teal use dark labels; the other colours use white. Label/background contrast stays at least **3:1**, including faded cleared tiles. All four grid sizes are available; names accompany swatches and tiles so the game never relies on colour alone.

- **Shapes:** the same grouped rules as Colours. Each round samples four distinct shapes from the 18-shape catalog and shows a random left-to-right key. Clear every tile of the current shape, in any cell order, before moving on. The previewed key stays the same when the round starts; replay chooses a fresh set. SVG silhouettes preserve their proportions and accessible names identify every tile. All four grid sizes are available.

The shape catalog includes circle, ellipse, equilateral/right/isosceles triangles, square, rectangle, rhombus, trapezoid, parallelogram, pentagon, hexagon, octagon, heart, star, crescent, arrow and cross.

Select **Smallest → largest** or **Largest → smallest** before starting a symbol round. Descending order reverses the complete sequence; letters and numbers still share positions in the mixed-symbol mode. Colour and shape rounds always follow the displayed random key from left to right.

The three 26-letter modes and Letters + numbers use a 6×6 board with ten noninteractive blank cells. Every round shuffles the board. Find the symbol shown in **Next up**, then continue in sequence. Wrong taps give visual feedback and a short vibration when supported. They do not advance the game or add a penalty; the clock keeps running. Cleared tiles keep their original symbol or colour name, become partly transparent and gain a corner tick. They cannot count again. Completion results appear below the board so cleared items remain visible.

Mouse clicks, immediate touch/pen contact, Tab, arrow keys, Enter and Space are supported. Restart stops the clock and returns to setup; Play Again starts a fresh shuffled round.

## Logic and storage

- `src/game.js`: an `idle → playing → completed` state model, sequence generation, Fisher–Yates shuffle and ordered input validation. It uses `performance.now()` and freezes the elapsed milliseconds on the final correct input.
- `src/shapes.js`: the immutable 18-shape catalog, consistent SVG paths and shape-value lookup. Shape scores use `shapes-3` through `shapes-6` with no descending variant.
- `src/app.js`: DOM rendering, next-symbol feedback, keyboard/touch interaction and a `requestAnimationFrame` timer display. Explicit CSS Grid rows and columns preserve cell geometry after clicks.
- `src/leaderboard.js`: fastest three full-precision times and ISO dates for each of **32 challenges**: the twelve symbol/grid combinations in both ascending and descending order, plus four colour-grid sizes and four shape-grid sizes. Existing ascending scores retain their original keys; new modes and descending scores are stored separately. The number-range mode uses `number-range-3` through `number-range-6`, with a `-descending` suffix for reverse order. Only display values are rounded. Invalid records are filtered and storage failures fall back to records for the current visit.
- Records use **`grid-rush-in-order.records.v1`**, separate from the original game's storage. Scores stay in this browser and on this device.
- The 26-position mixed-symbol mode uses `alphanumeric-26` and `alphanumeric-26-descending`. Earlier 62-symbol scores remain stored under their original keys, but are excluded from the new leaderboards because round lengths differ.
- `manifest.webmanifest`, `sw.js` and `src/pwa.js`: standalone installation and offline play, with a separate cache prefix that preserves Grid Rush's cache. Bump the cache version when changing app assets.

Publish this folder alongside `grid-rush`, which supplies the shared `playground-ui.css` and `src/playground-ui.js` navigation/feedback assets. All paths work under `/games/`. Game logic, records and offline caches remain separate.

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

## Shape-mode browser verification

Start the development server, then run from this directory with the existing optional Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node scripts/shapes-check.mjs
```

The script checks both languages, all grid sizes, any-order input within a shape group, wrong/duplicate clicks, keyboard/touch rounds, stable cell geometry, separate records, replay/reset and an offline round. `GRID_RUSH_URL` defaults to `http://localhost:5174/grid-rush-in-order/`; set it when using the shared server on another port. Screenshots default to `/tmp/grid-rush-shapes-qa`.
