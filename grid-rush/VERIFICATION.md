# Verification

Verified on October 20, 2026.

## Automated logic tests

`npm test` — **5 tests passed**, no failures. Tests were added incrementally before the corresponding implementation.

- Timer remains stopped in idle and freezes at the exact final valid click.
- Repeated or invalid tile clicks never increase progress.
- All four grid sizes complete correctly; resetting clears elapsed time, progress, and clicked tiles.
- Each size independently retains its fastest three results at full precision. Slower fourth-place results are discarded; ties preserve earlier placement.
- Records survive a storage round trip. Invalid JSON, malformed entries, blocked storage, quota failures, and invalid result inputs are handled.

All application and verification JavaScript also passed `node --check`.

## Browser checks

`scripts/browser-check.mjs` — **18 checks passed** in headless Google Chrome using the environment's existing Playwright installation. Playwright is optional QA tooling and is not required to run the game.

- Idle grid has nine disabled tiles and a stopped timer.
- Each of 3×3, 4×4, 5×5, and 6×6 supports start, unique clicks, full completion, exact stopped display, personal-best feedback, new-result highlighting, and reset.
- All four leaderboards persist independently after browser reload.
- Keyboard-only play supports arrow navigation and Enter/Space activation, focuses the next remaining tile, completes a round, focuses Play Again, and restarts correctly.
- Mid-round restart resets the board and stops the timer.
- At 320, 375, 600, 768, 1024, and 1440 px widths, the 6×6 board fits without horizontal overflow and all tiles remain square.
- Touch-emulated play at 320 and 375 px supports opening instructions, finishing a round, and replaying. Result content and both actions fit within the result panel.
- When access to localStorage throws a SecurityError, rounds still finish and session records remain available.
- Reduced-motion preferences disable animations. No uncaught browser errors occurred.
- Both bundled fonts load locally, and the application makes no external network requests.

Idle desktop, tablet/mobile boards, and completed mobile screenshots were rendered and visually reviewed. QA screenshots were written to `/tmp/grid-rush-qa`.

To repeat the optional browser checks, run the local server, then use an existing Playwright installation and Chrome:

```sh
node scripts/browser-check.mjs
```

If Playwright is installed outside this project, set `GRID_RUSH_PLAYWRIGHT_MODULE` to its absolute `index.mjs` path. `GRID_RUSH_URL` and `GRID_RUSH_SCREENSHOTS` optionally override the local URL and screenshot directory.

## Code review

Separate correctness and accessibility/maintainability reviews were performed against the requested behavior. Findings about text contrast and the hidden mobile instructions destination were corrected. Result-panel fit was verified in the browser. No unresolved correctness or accessibility blockers were identified in that review.

Verification used Chrome and emulated touch input. Physical touchscreen devices, other browser engines, and screen-reader software were not tested.

## Installable web app

The app was extended with a web app manifest, locally generated device icons, an installation action with an accessible help dialog, and a versioned service worker cache. The existing game and record-storage implementation are unchanged.

`scripts/pwa-check.mjs` — **9 additional browser checks passed**:

- Manifest is served with the correct content type and declares standalone display and 192/512 px icons.
- All app icons load at their declared dimensions.
- The service worker installs, caches the app, and controls the page.
- Chrome reports no installability errors in an isolated regular profile.
- Installation controls provide browser instructions when a native prompt is unavailable; Escape dismisses the help dialog.
- All four grid sizes can finish games after an offline reload, and records survive another offline reload.
- A new tab can launch the cached app with networking disabled.
- Installation promotion is hidden when standalone display mode is emulated.
- Offline game sessions produce no uncaught browser errors.

The **5 logic tests and original 18 browser checks also pass** after the web-app additions. Actual OS installation requires the player's choice in their browser and was not automated.

Run the optional PWA checks with the local server running:

```sh
node scripts/pwa-check.mjs
```

As with the gameplay browser checks, `GRID_RUSH_PLAYWRIGHT_MODULE` can point to an existing Playwright installation.

## Immediate touch and stable grids

The original regressions were reproduced before changes: touch did not count until release, and clearing a 6×6 tile changed a neighboring tile's height from 45.83 px to 44.33 px. A separate check also caught scaling during press feedback.

Touch and pen input now activate on pointer contact. Explicit equal-height grid rows prevent checkmark content from resizing cells, and tile feedback no longer transforms their geometry. Compatibility clicks from an already-counted gesture are suppressed, including a reproduced case where releasing the final finger accidentally clicked Play Again. The next deliberate gesture and keyboard input remain available immediately. The offline cache version was incremented for the updated assets.

`scripts/touch-check.mjs` — **17 regression checks passed**:

- Touch counts before the finger lifts and cannot count again on release or a compatibility click.
- A cleared 6×6 tile keeps every row and neighbor fixed, including during visual feedback.
- All four grids preserve every tile's position, width, and height while clearing each row at 320, 375, and 768 px widths.
- Two simultaneous fingers register two unique contacts.
- The final contact stops timing immediately; releasing that finger leaves results visible, and a new deliberate tap can replay.

The project now lives in `grid-rush/`. Run local commands from that directory. The GitHub Pages workflow was updated to publish that folder.

Final regression verification: **5 logic tests, 18 general browser checks, 9 web-app checks, and 17 touch checks**.

## Shared UI update — 2026-10-22

- Updated the landing page to Sky’s Playground with two mobile columns; supplied artwork is used for the favicon, touch icons and install manifests.
- Added one labelled, 44px-minimum All games control per game. Checked layouts at 320, 375, 430, 600, 768, 1024 and 1440px.
- Added press ripples, selection/check feedback, result reveals and reduced-motion fallbacks while preserving board dimensions and contact-time activation.
- Verified wrong-selection vibration calls with an emulated vibration API, and verified gameplay when that API is unavailable. Physical-device vibration remains browser/device dependent.
- Updated both service-worker cache versions and cached the shared styles/scripts; retained independent score keys and cache prefixes.
- Dev servers now serve the whole playground and block hidden files; README URLs and optional QA defaults match the game subpaths.
- Final regression results: **11 unit tests, 18 original-game browser checks, 19 ordered-game browser checks, 17 immediate-touch checks, 17 shared-UI checks and 18 PWA checks passed**. Six additional local-server route checks passed. Visual screenshots were captured after entrance animations completed.

## Spring interaction update — 2026-10-22

- Applied UI/UX Pro Max guidance across the landing page, both grid games and Tap & Spill. Added bounded magnetic controls, spring presses, resisted/deforming desktop card tugs, layered parallax, subtle scroll-centre focus, liquid radio highlights, native card-to-game transitions, and draggable install sheets with distance/flick thresholds. Tap & Spill uses spring water/lever visuals and one size-dependent droplet rebound on water/table contact.
- Native card hit areas and grid geometry stay fixed. Touch still registers on contact; mobile cards allow native vertical scrolling. Sheet drags have Close, Got it and Escape alternatives. Reduced-motion changes cancel active decorative motion and remove parallax, ripples, waves, particles and pulsing danger feedback while retaining the actual water level and warning state.
- **23 unit tests passed:** 5 original game/storage tests, 3 motion tests and 15 ordered game/storage/contrast tests. Motion tests cover bounded attraction, spring settling at 30/60/120 Hz, resistance and dismissal thresholds.
- **125 Chrome browser checks passed:** 12 new motion interactions, 17 shared UI, 18 original gameplay, 17 immediate-touch, 43 ordered gameplay and 18 installation/offline checks. Checks include rapid radio changes, card drag recovery without accidental navigation, real touch sheet cancellation/commit, stale flick rejection, short-phone dialogs, keyboard alternatives, live reduced-motion changes, Tap & Spill overflow/replay, all 28 ordered challenges, retained 3:1 colour-label contrast, persistent scores and fixed grids.
- Reviewed desktop/mobile landing pages, mobile grid setup, card tug and a short-screen install sheet. Screenshots are in `/tmp/playground-motion-qa`, `/tmp/skys-playground-qa` and the existing game QA folders. No uncaught browser errors remained in the completed runs; automated analytics requests are stubbed.
- Code review checked native input/focus behavior, interrupted animation cleanup, bounded surfaces, refresh-independent springs, sleeping animation scheduling, optional native navigation transitions and offline module paths. The shared feedback observer excludes high-frequency timer/HUD changes. No application dependencies were added, and game timing/rules and storage formats were preserved.
- Cache versions are `grid-rush-app-v5` and `grid-rush-in-order-app-v8`, both including the shared motion module. Existing installed windows must close before the new worker activates. Native card expansion is progressive enhancement; normal links work without it.
- PWA automation suppresses Chrome's native install prompt to exercise the help-dialog fallback consistently; CDP verifies actual manifest installability, and gameplay is then tested with the network disabled. Actual OS installation remains a manual browser choice.
- Verification used Chrome, including touch emulation. Physical devices, other browser engines and screen-reader software were not exercised.

## Selection border radius — 2026-10-22

The animated grid/mode selection outline now reads the original option's corner radius and compensates for its SVG scaling, keeping its stroke, corners and edges aligned during spring movement and after responsive resizing. **36 rendered geometry checks passed** across both grid games at 320, 375, 768 and 1440px, with no uncaught browser errors; desktop and mobile screenshots were visually reviewed. JavaScript syntax and diff whitespace checks passed. Cache versions are now `grid-rush-app-v6` and `grid-rush-in-order-app-v9`.
