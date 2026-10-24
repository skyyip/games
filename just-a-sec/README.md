# Just a Sec · 時間感挑戰

A 2–6 player pass-and-play game about time perception. Every round draws one shared integer target from **1 to 20 seconds**. Hold the circular button to start timing and release to lock a guess. After all players finish, the smallest absolute error wins. Equal errors share the win.

## Local development

Node.js 20 or newer. No build step or dependency installation.

```sh
cd just-a-sec
npm start
npm test
```

The shared server serves the complete repository; open `/just-a-sec/`. The landing page includes the game and its favourite control. Traditional Chinese is the default; the landing-page 中 / EN switch applies here too.

## Play

1. Choose 2–6 players and optionally edit their names.
2. Start a round to draw one shared target.
3. Pass to the named player, then press **I’m ready**.
4. Press and hold the circle, then release when the target duration feels complete. Keyboard users can hold **Space** or **Enter** on the circle.
5. The guess locks immediately. Pass the device; results remain hidden until all players finish.
6. Reveal the ranking, replay with the same names and a new target, or change players.

Pointer capture accepts a release outside the circle. Escape, lost window focus, hiding the tab, a cancelled pointer or lost pointer capture discards the unfinished hold and lets the same player retry. End round returns to setup. An immediate release is a valid zero-duration guess; long holds are not cut off automatically.

`performance.now()` measures press-to-release time independently of visual animations. Results round to whole milliseconds, display three decimal places in seconds, and rank by absolute error from the common target. Guesses never update a running timer or progress display. Names and rounds live only in memory; there is no account or leaderboard.

## Structure

```text
index.html                Setup, handoff, hold, locked and results scenes
styles.css                Responsive sage/peach UI, circular reveals and stacked cards
src/game.js               Pure timing model, lifecycle, hidden results and rankings
src/app.js                Pointer/keyboard input, cancellation and DOM rendering
src/motion.js             Spring press, resistant stretch, parallax and liquid tracker
manifest.webmanifest      Standalone app metadata and shared cat icons
sw.js                     Scoped offline cache
tests/game.test.js        Dependency-free rules and timing regressions
scripts/browser-check.mjs  Browser, touch, bilingual, animation and offline checks
```

The scoped service worker caches local game code, shared language/UI modules, fonts and icons. Updates wait until existing game windows close. Bump the cache version when changing cached assets. Existing Google Tag Manager integration follows the other games; it is not required to play.

See [DESIGN.md](./DESIGN.md) for the interaction rationale and [VERIFICATION.md](./VERIFICATION.md) for validation.
