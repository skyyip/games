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

The **5 logic tests and original 18 browser checks also pass** after the web-app additions. The app remains local; no hosted deployment was created. Actual OS installation requires the player's choice in their browser and was not automated.

Run the optional PWA checks with the local server running:

```sh
node scripts/pwa-check.mjs
```

As with the gameplay browser checks, `GRID_RUSH_PLAYWRIGHT_MODULE` can point to an existing Playwright installation.
