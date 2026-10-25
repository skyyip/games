# Verification

Validated using Node.js 24 and system Chromium through the repository's existing optional Playwright installation. No runtime dependencies were added.

## Simulation

```sh
node --test balance-bridge/tests/*.test.js
```

All **14 game model tests passed**. The complete repository unit suite passed **184 tests** with the new game included. Coverage includes:

- All five exact severity/duration pairs, warnings before impact, overlapping events with independent expiry and no duplicate active event.
- Correct left/right force, smooth release, identical fixed-step results at different display frame rates and finite bounded input.
- Real loss of balance, frozen survival time during a fall and one completion event.
- Two minutes of corrective input surviving repeated hazards, including levels four and five, without automatic stabilisation.
- Paused hazards and timers, safe resume, abandonment, reset and rejection of invalid or unbounded frame deltas.
- Portrait and both landscape tilt projections, missing values, eight valid calibration samples, median rejection of an outlier, dead zone, bounded correction and stale-data detection.
- Ranked top threes, tied durations, invalid storage and minute/second/hundredth formatting.

## Browser

Start the shared local server and point to an installed Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node balance-bridge/scripts/browser-check.mjs
```

**15 game browser checks passed**, exercising Chinese and English setup, countdown, actual falls, result timing, top-three persistence across replay/reload, directional keyboard controls, pause/resume, blur, abandoned scores and forty seconds of corrective play through hazards. Simulated phone orientation events verify permission requests, calibration, continuous directional input, recalibration, stale-reading pause and switching a paused walk to touch controls. Missing, declined, unresolved and silent sensor APIs each offer a playable fallback. Real Chromium touch events exercise steering at 320×568, 375×812, 812×375 and 768×1024, with repeated play-view cleanup. Blocked storage keeps visit-only results. A full offline round uses cached code, art, fonts and language modules. No uncaught browser errors occurred.

**Four focused layout checks passed** in `scripts/layout-check.mjs`. They verify that both pause actions and both result actions are inside the visible scene and can be hit at their centres, rather than merely possessing a layout box. Short phone results and pause views reclaim the controls' height, so actions remain visible without scrolling; replay restores the controls. Phone result and sensor screenshots were visually reviewed.

**Six scene checks passed** in `scripts/scene-check.mjs`. Each event enables its corresponding SVG effect, with linked arm and pole transforms. Screenshots of all five severity levels were inspected, including the bird's splat and winged roach on the head. Reduced motion preserves the gameplay angle and removes optional gait and scenery motion.

A standalone phone preview embeds every script, stylesheet, font and SVG. Its check passed in an opaque `sandbox="allow-scripts"` iframe with no forms permission or persistent storage: default Chinese, all five guide illustrations, a complete fall, visit-only records, fully visible replay and another fresh walk. Sensor access is optional in this environment; touch controls remain available.

Integration checks passed: **23 shared UI**, **14 favourites**, and **15 touch/title** checks. All nine landing cards and their navigation/installation assets fit seven viewport widths. The new game prevents double-tap zoom while preserving intentional pinch zoom. The Pages workflow includes its directory and change trigger. Existing games' service worker versions were bumped for the expanded shared dictionary.

Physical phone hardware, Safari's native permission sheet, other browser engines and assistive technology were not directly exercised. Sensor behaviour was verified with synthetic orientation events; real touch input was dispatched through Chromium's device protocol. Device records are local to the current browser and are not synced.

## Overlapping events and bamboo scene

The updated model suite and all fifteen gameplay browser checks passed. A focused rendering check displays wind, a bird splat and a head roach simultaneously, verifies the narrowed deck width and the shaded head, and captures the bamboo pole. The five original scene checks still pass.

- **Less frequent chains:** deterministic simulation checks cover the early-follow-up branch and a full minute of ordinary rolls without overlapping hazards. Independent expiry, three-event cap, warnings, pause and countersteering remain covered. Each event now has a 20% early-follow-up chance; other rolls wait for its duration plus a rest before the next warning.
