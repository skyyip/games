# Line Up

A 2–6 player pass-and-play game in Sky’s Playground. Estimate a target percentage of a randomly shaped line. The smallest absolute error wins; equally close guesses share the win.

## Run locally

Requires Node.js 20 or newer. No dependency installation or build step is needed.

From the repository root:

```sh
cd line-up
npm start
```

Open **http://localhost:5173/line-up/**. The server also serves the landing page and other games. To change ports, use `PORT=8080 npm start`.

```sh
npm test
```

The GitHub Pages deployment includes this folder at [skyyip.github.io/games/line-up/](https://skyyip.github.io/games/line-up/).

## How to play

1. Choose 2–6 players and optionally edit their names.
2. Start a round. It generates a target from 1% to 100% and one of four shapes: straight, parabola, wavy, or a rounded bend with an angle. Everyone shares that target and line.
3. Pass the device to the named player and press **I’m ready**.
4. Drag a segment, or tap/click its two endpoints. A segment can start anywhere and run in either direction. Drag either marker to adjust it, or select **Start point** / **End point** before placing it. **Clear selection** starts the guess again.
5. Press **Lock my guess** and pass the device. Previous guesses are hidden. After the last player, results show each estimate and its error in percentage points.

Keyboard: activate an endpoint control with Enter or Space, then use the arrow keys to move by 1% of the path. Shift + arrow moves by 0.1%; Home/End reach the path’s ends. Tab moves on to the next control. Numeric positions and the guessed percentage are not displayed during a turn. Native range semantics provide an alternative to dragging for assistive technology.

## Structure and scoring

```text
index.html                 Semantic setup, handoff, selection and results panels
styles.css                 Responsive layout and line/endpoint states
src/geometry.js            Shape generation, arc lengths, point projection and subpaths
src/game.js                Round state, target, turn validation and ranking
src/app.js                 Pointer/keyboard interaction and safe DOM rendering
manifest.webmanifest       Standalone app name and supplied cat icons
sw.js                      Scoped offline app cache
tests/                     Dependency-free Node tests
scripts/browser-check.mjs   Optional browser, touch and offline verification
```

The state sequence is `setup → handoff → choosing → handoff … → results`. Another round creates a fresh target and path; changing players returns to setup. Duplicate or invalid submissions cannot consume a turn. A cancelled pointer gesture restores the previous selection.

Curves are sampled into an SVG polyline. Geometry sums the lengths of those exact rendered segments, projects pointer positions onto the closest segment, and stores each endpoint as a fraction of total arc length. The estimate is `abs(end − start) × 100`; error is `abs(estimate − target)`. It measures along the curve, including vertical sections. A uniformly scaled SVG keeps the same proportions across screen sizes. The highlighted selection is a real subpath between the endpoints, so stroke scaling cannot change its length.

Ranking uses full precision, with a `1e-9` percentage-point tolerance for floating-point equality; displayed results are rounded to two decimals. Rounds live only in memory. This game has no leaderboard, storage of player names, account, or backend. The existing site Google Tag Manager container is included; failed analytics requests do not affect play.

## Offline and home screen

After the first successful online load, wait for **Ready to play offline** in the footer. The service worker caches the game, shared UI code, local fonts, and supplied cat icons. In a supporting browser, use its installation or Add to Home Screen action. The manifest uses the game’s own scope and standalone display mode.

When changing cached assets, bump `CACHE_NAME` in `sw.js`. Updates wait until existing Line Up windows close to preserve active rounds. The cache only handles this game’s home navigation and explicit assets; it does not substitute Line Up for other games or the landing page.

See [VERIFICATION.md](./VERIFICATION.md) for checks and browser commands.
