# Line Up verification

Verified with Node.js 24 and headless Chrome using the repository’s existing optional Playwright installation. No runtime or test package was added.

## Core tests

From the repository root:

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js
```

**30 tests passed**, including 7 Line Up tests covering:

- Shared target/path, closest-guess ranking, hidden results before completion, and duplicate submission rejection.
- Inclusive 1%/100% targets, reversed segments, ties, replay/reset and six-player rounds.
- Invalid players and endpoints, blank-name fallback, literal text names and state transitions.
- Actual arc lengths and projection on vertical sections and all four shapes.
- Bounds, uniform resizing, and exact highlighted subpaths in both directions.

## Browser checks

Use an existing Playwright installation; `GRID_RUSH_PLAYWRIGHT_MODULE` can point to its absolute module path. The script launches installed Chrome. Start the local server first.

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
LINE_UP_URL=http://localhost:5173/line-up/ \
node line-up/scripts/browser-check.mjs
```

**23 checks passed**:

- Complete rounds and replays for straight, parabolic, wavy and rounded-bend paths. Same target/path for all players, private handoffs, and correct winners.
- Independent native SVG arc-length checks for selection highlights and the target reference.
- Mouse drag/two-click selection, touch drag/two-tap selection, cancelled gesture recovery, and locking only after release.
- Layouts at 320, 375, 600, 768, 1024 and 1440px: no horizontal overflow, 44px controls, stable endpoint positions and selection proportions.
- Six-player keyboard round at 320×568, reduced motion, safe player-name rendering and shared wins.
- 1% nearby touch endpoints and a reversed full-length 100% selection.
- Manifest and cat icons, a full offline round, a fresh offline tab, return navigation and no uncaught page errors.

The shared `grid-rush/scripts/ui-check.mjs` suite also passed **18 checks** across the landing page and all four games, including two-column mobile cards, navigation, responsive layouts, shared icons, touch feedback and reduced motion.

Online analytics requests were stubbed during browser tests. Test randomness is controlled only in the browser harness, not in shipped game code. Screenshots are saved to `/tmp/line-up-qa` by default; mobile selection and desktop results were visually reviewed.

These checks exercise Chrome’s emulated touch input and responsive layouts. Physical phones, other browser engines, screen readers and native operating-system installation were not tested.
