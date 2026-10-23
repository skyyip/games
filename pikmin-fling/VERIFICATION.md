# Pikmin Fling verification

Verified with Node.js 24 and headless Chrome using the existing optional Playwright installation. No dependency was added.

## Core logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js
```

**45 tests passed**, including 15 Pikmin Fling tests covering:

- Fixed 30-character roster in both modes: 20 normal, 5 buds, 5 flowers.
- Start/reset lifecycle, duplicate/invalid input, unique arrivals and final-arrival time freezing at full precision.
- State-specific actions: upward fling, double tap, a full 1-second flower charge and homogeneous atomic chain throws. Flower chains also require 1 second; normal/bud chains retain 500ms.
- Challenge timing within 3–8 seconds, simultaneous state snapshots, 1–5 / 1–5 / 1–10 transition limits, available-count caps, protected interaction/flying states, no catch-up burst, reset and completion.
- Longer roaming routes within the larger field while held characters stay still; a clear six-second walk covers over 100px.
- Charge/chain thresholds, rejected premature movement, same-stage membership, duplicate membership, expired/different-target taps and final upward flick after fast sideways tracing. The first coalesced touch move after a long flower hold remains valid.
- Parabolic flight geometry.
- Separate mode rankings, fastest-three ordering/limits, full precision, ties and persistence.
- Corrupted, unavailable and full storage, preserving the old count-based records.

## Browser checks

Run the local server, then supply an existing Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PIKMIN_FLING_URL=http://localhost:5173/pikmin-fling/ \
node pikmin-fling/scripts/browser-check.mjs
```

**29 checks passed**:

- Idle timer and inactive board; all current artwork loads with the correct stage distribution.
- Native fence selection regression: a triple-click previously entered browser Range selection; it now stays unselected. The fence, delegated gesture container, SVG and artwork suppress selection/tap highlights; selection, drag and context-menu events are blocked only inside the fence.
- The cartoon plant sways slowly; its SVG mouth target moves with the plant and is used by automatic flights.
- Free walking, body bobbing and alternating footsteps after start in the larger garden.
- Real mouse actions for normal, bud and flower rules, including rejected taps, wrong directions, expired double taps, immediate/700ms flower flings rejected and 1-second flower flings accepted.
- Long-press same-stage chaining, incompatible-stage exclusion, visible chain lines and batch release by the final upward flick.
- Escape cancellation when focus is outside the garden, without a phantom launch on release.
- Final-arrival timing, completed records, replay and reset during flight.
- Independent normal/challenge records after reload and fastest-three limits after repeated rounds.
- Repeated challenge growth waves with deterministic time, simultaneous transitions, held-character protection and stopped updates after reset.
- Chrome touch input: cancellation, double-tap buds, charged flower fling, two simultaneous normal flings without page scroll, and a complete finger-drawn chain.
- Blank fence margins retain native finger scrolling without selecting the garden.
- Tap-plus-Feed-selected and keyboard alternatives for all stages.
- 320/375/430/600/768/1024/1440px layouts: no horizontal overflow, 44×58px character buttons and all roaming targets inside the fence. Measurements allow 0.01px for floating-point transform rounding.
- Reduced motion: stationary crowd, no body/footstep/plant-sway animation and in-place fading flights. Keyboard completion still works with localStorage blocked.
- Corrupt new storage recovers without deleting old records.
- New modes and all nine growth sprites work offline, including a fresh offline tab.
- All games navigation returns to the five-card landing page; no uncaught browser errors.

Analytics requests were stubbed during QA. Screenshots default to `/tmp/pikmin-fling-qa`; desktop/mobile gameplay, chaining, flight and completed results were visually inspected. Active gesture screenshots use viewport capture because full-page capture can resize the viewport and intentionally cancel the gesture.

The shared `grid-rush/scripts/ui-check.mjs` suite also passed **19 checks** across the landing page and all five games, including home navigation, supplied install icons, mobile two-column cards, touch feedback, reduced motion and no uncaught errors.

## Review

Review found an Escape handler scoped too narrowly to the garden. A failing browser regression reproduced the issue before the handler was moved to `window`; the complete suite then passed. The fence selection fix extends native-selection protection from individual buttons to their enclosing delegated gesture area, with a failing-then-passing browser regression and an offline-cache version bump. A final local review checked rule coverage, native controls, labels/focus, gesture cancellation, reduced motion, record validation and scoped service-worker updates.

Chrome touch emulation was tested. Physical phones, other browser engines, screen readers and native operating-system installation were not directly tested.
