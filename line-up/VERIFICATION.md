# Line Up verification

Verified with Node.js 24 and headless Chrome using the repository’s existing optional Playwright installation. No runtime or test package was added.

## Core tests

From the repository root:

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js
```

**70 tests passed**, including 11 Line Up tests covering:

- Shared target/path, closest-guess ranking, hidden results before completion, and duplicate submission rejection.
- Inclusive 1%/100% targets, reversed segments, ties, replay/reset and six-player rounds.
- Invalid players and endpoints, blank-name fallback, literal text names and state transitions.
- Actual arc lengths and projection on vertical sections and all nineteen shapes, including closed perimeters.
- Bounds, uniform resizing, exact highlighted subpaths, both arcs across a closed join, and full-outline selection.
- Known square/rectangle perimeters and circle circumference, correct proportions, and varied irregular polygons.
- All nine new outlines preserve measured section lengths and complementary arcs across the closing join, including the concave heart, star and crescent.

## Browser checks

Use an existing Playwright installation; `GRID_RUSH_PLAYWRIGHT_MODULE` can point to its absolute module path. The script launches installed Chrome. Start the local server first.

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
LINE_UP_URL=http://localhost:5173/line-up/ \
node line-up/scripts/browser-check.mjs
```

**66 checks passed**:

- Complete rounds and replays for straight, parabolic, wavy, rounded-bend, circle, square, rectangle, triangle, oval, irregular, rhombus, trapezoid, parallelogram, pentagon, hexagon, octagon, heart, star and crescent paths. Same target/path for all players, private handoffs, and correct winners.
- Independent native SVG arc-length checks for selection highlights and the target reference.
- Mouse drag/two-click selection, touch drag/two-tap selection, cancelled gesture recovery, and locking only after release.
- Layouts at 320, 375, 600, 768, 1024 and 1440px: no horizontal overflow, 44px controls, stable endpoint positions and selection proportions.
- Six-player keyboard round at 320×568, reduced motion, safe player-name rendering and shared wins.
- Closed-circle touch selection and switching to the complementary arc across the join; the selected arc determines the score and resets at handoff.
- Closed shapes stay proportional with aligned endpoints and 44px controls at all six widths.
- 1% nearby touch endpoints, reversed full-line 100% selection, and whole closed outlines using buttons and keyboard.
- Clearing a whole-outline selection disables submission; reduced motion also works on a closed-shape result.
- Traditional Chinese names for all nine new shapes at 375px, no horizontal overflow, complementary-arc selection and handoff. Both the start marker and endpoint control preserve the literal **S** instead of translating it as seconds.
- Manifest and cat icons, a full offline crescent round, a fresh offline tab, return navigation and no uncaught page errors.

The standalone preview was also checked at 375×812 with default Traditional Chinese, all nineteen setup labels, a crescent round, literal S markers and a complete two-player result.

## Sandboxed preview start regression

An iframe with `sandbox="allow-scripts allow-same-origin"` reproduced the start failure: Chromium blocked native form submission, leaving setup visible and never firing the submit handler. The start button now invokes the game directly; Enter in a player-name field has an explicit handler that also respects IME composition.

`scripts/start-check.mjs` passed **8 checks** inside that sandbox: click, touch, keyboard activation of the button and Enter in a name field, in both Traditional Chinese and English. Complete two-player rounds and replay also passed, without blocked-form errors or uncaught exceptions. The regenerated standalone preview passed the same sandbox reproduction and its existing mobile multiplayer check.

Online analytics requests were stubbed during browser tests. Test randomness is controlled only in the browser harness, not in shipped game code. Screenshots are saved to `/tmp/line-up-qa` by default; mobile/desktop closed-outline selection and desktop results were visually reviewed.

These checks exercise Chrome’s emulated touch input and responsive layouts. Physical phones, other browser engines, screen readers and native operating-system installation were not tested.
