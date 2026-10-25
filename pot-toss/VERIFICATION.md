# Verification

Validated with Node.js 24 and system Chromium using the workspace's optional Playwright installation. No runtime dependencies were added.

## Simulation and input

```sh
node --test pot-toss/tests/*.test.js
```

**18 game unit tests passed; 184 repository unit tests passed** with Pot Luck included. Coverage includes both durations, the exact deadline, twelve seconds at the centre, bounded slow movement, smooth waypoint turns, ballistic ascent/apex/descent, opening entry, rim/body bounces, 1/2-point scoring, the shuffled arrow bag, no duplicate scoring, cooldown, malformed/cancelled input and replay reset.

Moving-target tests aim at the exact future opening position, then verify a delayed display frame and many fine frames produce the same collision. Boundary tests distinguish an impact before the buzzer from an airborne arrow that would land after it. Gesture tests cover speed, lateral heading, equivalent viewport scales, taps, reverse/slow swipes, stale releases and invalid samples. Record tests cover separate 120/180-second top threes, valid zero scores, tied rounds, corruption and out-of-range dates.

## Browser

With the shared server running:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node pot-toss/scripts/browser-check.mjs
```

**14 game browser checks passed**:

- Chinese and English rounds score exactly one/two points for actual keyboard throws, with two arrows of each type in a four-shot bag. Scores appear after entry, not at release.
- Four repeated rounds retain the best three scores. Three-minute rounds stay active after two minutes and save in their own leaderboard. Both lists persist across reload.
- Mouse flicks, short/far feedback, Escape, pointer cancellation and abandonment obey the scoring rules.
- The target remains stationary before twelve seconds and then begins moving.
- Real Chromium touch flicks score at 320×568, 375×812, 812×375 and 768×1024. Round entry synchronously resizes the scene and positions the arrow before accepting input; gesture scaling uses the current court bounds. This fixes the initial stale arrow position in landscape.
- Both result actions fit inside the visible court and can be hit at their centres. Replay restores an enabled arrow and zero score; End round restores page scrolling.
- A late airborne arrow earns nothing after the buzzer.
- Blocked/full storage retains the completed score for the current visit and explains the limitation.
- Ordinary motion displays the arrow's arc before a hit, and a fully cached offline round can score and save records.
- No uncaught browser errors occurred.

Screenshots of the courtyard, phone gameplay and short/landscape results were visually reviewed. Projectile drawing is ordered by depth relative to the pot, so a foreground arrow remains visible in front of the vessel. Arrow length decreases continuously with depth. Optional confetti/rebound respects reduced motion, while the essential flight and target movement remain visible.

A standalone phone preview embeds every script, stylesheet, font and illustration. A dedicated check passed in an opaque `sandbox="allow-scripts"` iframe without forms or storage permission: default Chinese, a scored throw after its flight, separate completed 2/3-minute lists, visit-only records and visible replay controls.

Integration checks passed: **24 shared UI**, **14 favourites** and **16 touch/title** checks. All ten games and home links fit seven viewport widths. Double-tap zoom is prevented on the new game while intentional pinch zoom remains available. The Pages workflow includes the new directory and trigger, and existing scoped service worker versions were updated for the expanded shared dictionary.

Physical phones, other browser engines, screen readers and native installation were not directly exercised. Touch events were sent through Chromium's device protocol. Scores are local to the current browser and are not synced.

## Vertical motion and happy landings

A new model test verifies the stationary initial depth, smooth movement after 24 seconds and a successful shot aimed at the future moving depth. All fourteen game browser checks pass. A focused scene check confirms the target moves vertically in projection and captures the closed-eye smile after a real scored landing.

## Cute expressions and misses

All 14 browser checks passed again after the pastel glaze and face update. A focused renderer check used actual simulated short, far, left, right and rim impacts: all five produce blue tears; a scored hit smiles without tears; the face returns to idle after 1.5 seconds. Ready, hit and missed states were rendered side by side and visually inspected. Reduced motion displays static tears. The standalone preview was rebuilt.
