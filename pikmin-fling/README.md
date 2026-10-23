# Pikmin Fling

Fling every Pikmin out of a fenced garden and into a hungry plant. Choose 20, 30 or 40 randomly placed Pikmin from six types: red, yellow, blue, white, rock and winged. Each count has its own three fastest completion times.

Play at [skyyip.github.io/games/pikmin-fling/](https://skyyip.github.io/games/pikmin-fling/).

## Run locally

Requires Node.js 20 or newer. No dependencies or build step.

From the repository root:

```sh
cd pikmin-fling
npm start
```

Open **http://localhost:5173/pikmin-fling/**. The same server serves the landing page and other games. Use `PORT=8080 npm start` for another port.

```sh
npm test
```

## Play

Choose a count and press **Start game**. The timer starts immediately. Use a finger, mouse or pen to swipe a Pikmin upward, then release. Fast short flings and longer slow swipes both work; taps, sideways swipes and downward gestures do not throw. Throws aim automatically at the mouth. Multiple Pikmin can be in flight at the same time, including throws from simultaneous touches.

Each throw follows a parabolic flight. The plant opens before arrival, the Pikmin disappears at the mouth, and the plant recoils with a bite. Progress counts arrivals, not launches. The final arrival freezes the timer and saves the result. **Play again** immediately starts a fresh round; **Reset round** returns to a stopped clock and a fresh board without saving the interrupted game.

Alternatives to dragging:

- Tap/click to select a Pikmin, then press **Feed selected**.
- Keyboard: Tab to a Pikmin and press Enter, Space or Up Arrow to throw it. Focus advances to another remaining Pikmin.

Character hit areas stay at least 44×44px. Only character buttons suppress touch scrolling; the surrounding garden and page retain native scrolling. Reduced motion replaces travelling sprites with an in-place fade and disables decorative movement. Flight duration and scoring stay the same.

## Structure

```text
index.html                 Semantic controls, garden, plant/fence SVG and results
styles.css                 Responsive layout, character states and jaw feedback
src/game.js                Idle → playing → completed, unique arrivals and timing
src/interaction.js         Swipe classification, random roster and parabolic position
src/leaderboard.js         Validated browser storage and independent top-three ranking
src/app.js                 Pointer/keyboard input, animation and DOM rendering
assets/pikmin/             Six local transparent character images
assets/README.md           Artwork sources and credits
manifest.webmanifest       Standalone app name and shared cat icons
sw.js                      Scoped, versioned offline cache
tests/                     Dependency-free Node tests
scripts/browser-check.mjs   Optional Chrome, touch and offline checks
```

There are no backend services or gameplay dependencies. The plant and fence use the game’s own SVG markup. The downloaded Pikmin artwork is credited to Nintendo; see [asset sources](./assets/README.md). This is an unofficial fan game.

## Timing and records

`FlingGame` uses `performance.now()` for elapsed milliseconds. `requestAnimationFrame` refreshes the clock and interpolates each 480ms flight. Frame counts do not measure elapsed time. A Pikmin can move only from ready → flying → eaten, so repeated input cannot count it twice. Reset cancels pending gestures, animations and flights before replacing the board.

The `pikmin-fling.records.v1` localStorage key contains separate arrays for `20`, `30` and `40`. Each entry stores a full-precision millisecond `time` and ISO `date`. Reading validates entries, sorts ascending and keeps at most three. Saving a slower fourth result preserves the existing three. Equal times retain their original order and do not count as a new personal best. Times are rounded only for display.

Malformed JSON and records are discarded safely. If storage is unavailable or full, the game and in-memory records continue for the current visit, with a visible explanation. Records remain local to the browser/origin. Google Tag Manager uses the existing site container; analytics failure does not block play.

## Offline and installation

After one successful online load, wait for **Ready to play offline** in the footer. The service worker caches all six characters, game code, shared UI, local fonts and supplied cat icons. A supporting browser can install the game or add it to the home screen using its native action.

When editing a cached asset, bump `CACHE_NAME` in `sw.js`. Updates wait for existing game windows to close, preserving active rounds. Navigation caching is restricted to this game’s home page; it does not replace the landing page or another game.

See [VERIFICATION.md](./VERIFICATION.md) for test results and browser commands.
