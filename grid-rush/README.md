# Grid Rush

A responsive, installable speed-clicking web app. Clear every tile as fast as you can, then challenge your own top three times. Runs locally and works offline after its first successful load.

The repository's GitHub Pages workflow publishes the game at [skyyip.github.io/games/grid-rush/](https://skyyip.github.io/games/grid-rush/).

## Run locally

Requires Node.js 20 or newer. No packages need to be installed.

From the repository root:

```sh
cd grid-rush
npm start
```

Open **http://localhost:5173/grid-rush/**. The same server also serves the landing page and other games so the All games link works locally. To use another port, run `PORT=8080 npm start`.

```sh
npm test
```

## English and Traditional Chinese

Use **中 / EN** beside the landing-page logo and title to choose a language. The choice
applies to all five games, including instructions, controls, results and accessible
labels. Traditional Chinese is the default; a saved choice takes precedence. The browser remembers the preference under
`playground.language.v1`; if storage is blocked or full, internal links carry the
selection in `?lang=zh-Hant` or `?lang=en` instead. Player names, game symbols and
stored scores retain their original values.

Shared messages live in `src/translations.js`; `src/language.js` translates static
markup and newly rendered text without replacing controls or changing game state.
Keep player-name nodes excluded from translation. When adding messages, use named
placeholders for changing values and `name` / `names` for literal player text.
All four installable games cache both language files for offline play; bump their
cache versions when updating shared translations or language behavior.

With the server running, verify both languages, full game rounds, persistence and
offline launches using:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node scripts/language-check.mjs
```

## Install as an app

1. Run `npm start` and open **http://localhost:5173/grid-rush/** in Chrome, Edge, or Safari.
2. Select **Install app** below the game. A supporting browser shows its native installation prompt; other browsers show installation instructions.
3. On macOS Safari, use **File → Add to Dock**. On iPhone or iPad, use **Share → Add to Home Screen**.
4. Wait for **Ready to play offline** in the installation help before disconnecting. The app caches its game code, styles, fonts, and icons, so later offline launches and reloads work. Scores remain in localStorage.

The installed app has a device icon and opens in its own window. No hosting, account, or backend is needed. Keep the same localhost port to use the same installation and records. Clearing browser site data also clears the offline cache and records.

Installation controls vary by browser; see [MDN's installation guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) for details.

## Project structure

```text
index.html             Semantic page structure
styles.css             Responsive layout and tile states
playground-ui.css      Shared navigation, mobile refinements and reduced-motion feedback
playground.webmanifest Landing-page installation name and icon
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
  playground-ui.js     Shared spring interactions, navigation and optional haptics
  motion.js            Small deterministic spring, attraction and gesture helpers
  navigation.js        Early native page-transition promise and motion handling
  landing.js           Landing-page star controls and card reorder animations
  favourites.js        Favourite ordering and validated device storage
scripts/serve.js       Small local static development server
tests/                 Dependency-free Node test suite
```

## Gameplay and records

Choose a 3×3, 4×4, 5×5, or 6×6 grid, then press **Start Game**. Click or tap every tile in any order. Touch and pen input register on contact, without waiting for release. Scrolling and zoom gestures are suppressed only over the active board so rapid taps are not interrupted. Keyboard players can navigate with Tab or arrow keys and activate a tile with Enter or Space. Cleared tiles show a check mark and become disabled. Grid rows and columns keep their dimensions as tiles are cleared; feedback changes color and shows a check without moving or scaling tiles. Keyboard activation advances focus to the next remaining tile.

`GridGame` measures elapsed milliseconds with `performance.now()`. `requestAnimationFrame` updates the display; frame counts never determine the time. The last valid click captures the final elapsed time before rendering results. A `Set` prevents duplicate clicks. Restart resets the round to idle; **Play Again** starts a fresh round immediately.

The `grid-rush.records.v1` localStorage key holds separate arrays for each grid size. Each record has a full-precision millisecond `time` and an ISO `date`. Only the fastest three records are retained. Display values are rounded to two decimal seconds. Equal times retain their original order and do not qualify as a new personal best.

Stored JSON is validated, sorted, and capped when loaded. Invalid entries are discarded. If storage is blocked or full, the game continues with records kept in memory for the current visit, and the records panel explains the limitation. Records are specific to the current browser and origin. Fonts are bundled locally under their SIL Open Font Licenses. Online pages load Google Tag Manager container `GTM-TZ646NJ9`; gameplay and local records continue to work when analytics is unavailable.

## Verification

The automated suite covers unique clicks, exact timer capture, all four grid sizes, replay/reset, invalid inputs, independent top-three rankings, full precision, stable ties, persistence, malformed data, and storage failures. Browser verification is described in `VERIFICATION.md`.

`scripts/pwa-check.mjs` optionally verifies installability and offline games using an existing Playwright installation. To update a shipped app, change `CACHE_NAME` in `sw.js` whenever an app asset changes. New versions wait until existing app windows close, keeping active rounds uninterrupted.

`scripts/touch-check.mjs` verifies contact-time activation, duplicate suppression, stable grid geometry, simultaneous touches, and final-touch/replay handling. It uses the same optional Playwright setup as the other browser checks.

`scripts/ui-check.mjs` verifies the landing page and every game: mobile two-column cards, return navigation, supplied install icons, responsive layouts, wrong-input haptics and reduced-motion support. Run it with the optional Playwright module environment variable; `PLAYGROUND_URL` defaults to `http://localhost:5173/`.

When changing the shared `playground-ui.css` or `src/playground-ui.js`, bump the cache versions in every game that caches those assets so installed copies receive the new version. The home-screen artwork is supplied by the site owner.

## Shared interaction design

The landing page and all games use the existing [UI/UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)'s motion guidance without adding a runtime dependency. Controls use bounded magnetic attraction and spring press feedback. Landing cards have separate foreground, body and background movement, gentle scroll-centre emphasis, and a resisted desktop tug that deforms the visual surface before returning it to place. Their native link hit areas stay fixed; touch retains native page scrolling.

Grid and mode selections have a spring-driven outline that stretches between the current native radio choices. Tile labels and completion panels receive brief arrival feedback; grid cells, input handling and accurate game timers keep their existing behavior. Supported browsers expand a selected game card into the game panel during navigation, with normal links as the fallback.

Installation help supports dragging its header downward: short/cancelled drags return to place, while a longer drag or deliberate flick closes it. Close, Got it and Escape provide button/keyboard alternatives. Tap & Spill adds spring response to the water and tap lever, and one decorative droplet rebound on water/table contact; poured volume and turn rules stay authoritative.

Reduced-motion preferences disable decorative animation, including when changed during a visit. The shared spring scheduler runs only while something is moving. Both installed grid games cache `motion.js` for offline use.

`scripts/motion-check.mjs` checks card hit areas, drag recovery, parallax layers, selection alignment, mobile scrolling, sheet gestures and alternatives, live motion preferences, fixed game tiles, replay and Tap & Spill overflow. Use the existing optional Playwright module and `PLAYGROUND_URL` environment variables as above. It does not install packages.

## Landing-page favourites

Open the repository root (for example, **http://localhost:5173/**) for Sky’s Playground. Every card has an independent star button in its top-left corner. Starring a game fills the star and moves it to the start; the most recently starred game is first. Unstarring clears the star and moves that card to the end, preserving the other cards’ relative order.

The `playground.favourites.v1` localStorage key stores `{version:1, order:[gameIds], favourites:[gameIds]}`. Both the favourite state and full card order survive reloads. Reads remove unknown/duplicate IDs, add newly available games, and safely fall back on corrupt data. Blocked/full storage keeps the controls working for the current visit.

Stars are native buttons beside native game links, with constant game-specific accessible names, `aria-pressed`, hover/press/focus states and a polite status announcement. The card wrapper animates between grid positions while its existing parallax surface remains independent. Rapid changes cancel previous animations. Keyboard focus is retained and brought into view; reduced-motion preferences skip or cancel decorative effects.

Run `node --test tests/favourites.test.js` from this folder for the storage/order tests. With the local server running, browser verification uses the existing optional Playwright installation:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PLAYGROUND_URL=http://localhost:5173/ \
node scripts/favourites-check.mjs
```

## Shared victory presentation

All 17 games use `src/victory.js` (loaded by `src/playground-ui.js`) and `victory.css`. A result panel opts in with `data-victory` and has one `data-winner-name` label. Multiplayer apps populate that label using `textContent` with every winning name; solo games show the translated “You”. The maze’s failed result suppresses the winner treatment.

Showing a result adds the gold badge, decorative trophy and a 36-piece ribbon burst. Hiding the result cancels pending animation and removes particles. Reduced motion keeps the static badge and trophy. Mahjong delays the burst until its final tile reveal has settled. Every offline game caches the shared module and stylesheet.

Run `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node grid-rush/scripts/victory-check.mjs` from the repository root for presentation integration checks across all 17 games, including cleanup, literal names, reduced motion and maze loss suppression. The individual game browser checks exercise their actual round logic.
