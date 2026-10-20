# Grid Rush

A responsive, installable speed-clicking web app. Clear every tile as fast as you can, then challenge your own top three times. Runs locally and works offline after its first successful load.

## Run locally

Requires Node.js 20 or newer. No packages need to be installed.

```sh
npm start
```

Open **http://localhost:5173**. To use another port, run `PORT=8080 npm start`.

```sh
npm test
```

## Install as an app

1. Run `npm start` and open **http://localhost:5173** in Chrome, Edge, or Safari.
2. Select **Install app** below the game. A supporting browser shows its native installation prompt; other browsers show installation instructions.
3. On macOS Safari, use **File → Add to Dock**. On iPhone or iPad, use **Share → Add to Home Screen**.
4. Wait for **Ready to play offline** in the installation help before disconnecting. The app caches its game code, styles, fonts, and icons, so later offline launches and reloads work. Scores remain in localStorage.

The installed app has a device icon and opens in its own window. No hosting, account, or backend is needed. Keep the same localhost port to use the same installation and records. Clearing browser site data also clears the offline cache and records.

Installation controls vary by browser; see [MDN's installation guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) for details.

## Project structure

```text
index.html             Semantic page structure
styles.css             Responsive layout, tile states, and motion preferences
favicon.svg            Grid Rush mark
manifest.webmanifest   Standalone app metadata and icons
sw.js                  Versioned offline app cache
assets/fonts/          Bundled fonts and their open-source licenses
assets/icons/          App, maskable, and Apple touch icons
src/
  game.js              Idle → playing → completed state and accurate timing
  leaderboard.js       Storage validation, ranking, and persistence
  app.js               DOM rendering, input, animation, and result feedback
  pwa.js               Installation controls and offline setup
scripts/serve.js       Small local static development server
tests/                 Dependency-free Node test suite
```

## Gameplay and records

Choose a 3×3, 4×4, 5×5, or 6×6 grid, then press **Start Game**. Click or tap every tile in any order. Keyboard players can navigate with Tab or arrow keys and activate a tile with Enter or Space. Cleared tiles show a check mark and become disabled. Keyboard activation advances focus to the next remaining tile.

`GridGame` measures elapsed milliseconds with `performance.now()`. `requestAnimationFrame` updates the display; frame counts never determine the time. The last valid click captures the final elapsed time before rendering results. A `Set` prevents duplicate clicks. Restart resets the round to idle; **Play Again** starts a fresh round immediately.

The `grid-rush.records.v1` localStorage key holds separate arrays for each grid size. Each record has a full-precision millisecond `time` and an ISO `date`. Only the fastest three records are retained. Display values are rounded to two decimal seconds. Equal times retain their original order and do not qualify as a new personal best.

Stored JSON is validated, sorted, and capped when loaded. Invalid entries are discarded. If storage is blocked or full, the game continues with records kept in memory for the current visit, and the records panel explains the limitation. Records are specific to the current browser and origin. Fonts are bundled locally under their SIL Open Font Licenses; the application makes no external network requests.

## Verification

The automated suite covers unique clicks, exact timer capture, all four grid sizes, replay/reset, invalid inputs, independent top-three rankings, full precision, stable ties, persistence, malformed data, and storage failures. Browser verification is described in `VERIFICATION.md`.

`scripts/pwa-check.mjs` optionally verifies installability and offline games using an existing Playwright installation. To update a shipped app, change `CACHE_NAME` in `sw.js` whenever an app asset changes. New versions wait until existing app windows close, keeping active rounds uninterrupted.
