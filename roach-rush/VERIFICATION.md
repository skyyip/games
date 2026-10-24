# Verification

Validated with Node.js 24, system Chromium and the existing optional Playwright installation. The game adds no runtime dependencies.

## Logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js just-a-sec/tests/*.test.js roach-rush/tests/*.test.js
```

**94 repository tests passed**, including seventeen new Roach Rush tests for:

- Both durations and the exact absolute deadline, with four initial ground spawns at the corner holes.
- Unique 1/2/3/4/5-point scoring; small flying roaches score three and large flyers score four.
- Big-roach identity and the 350/351ms double-tap boundary.
- Ground → flying → ground cycles and protected held-creature states.
- Continuous bounded spawning, no background catch-up burst and at most two mice.
- Shuffled four-hole mouse cycles.
- Faster mice, bounded movement, paused holds and failed drops.
- Reset clearing scores, pending taps and the population; late input rejection.
- Swipe-line crossing, near misses and stationary samples.
- Individual random ant arrivals capped at five, independent 4–12 second lifetimes, staggered departures, negative tap penalties and safe fast flicks.

## Browser

With a local server and an existing Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
ROACH_RUSH_URL=http://localhost:5173/roach-rush/ \
node roach-rush/scripts/browser-check.mjs
```

**11 game browser checks passed**:

- Full Traditional Chinese and English rounds, four walls, four holes and continuous spawns.
- Small taps, big-roach first-tap pause and expired double taps.
- Flying targets reject taps and accept a crossing swipe, with correct scores.
- Mouse charge rejects 499ms, accepts 500ms, rejects an outside drop and awards five only for a cage drop.
- Keyboard mouse pickup and cage activation, plus separate 1/2-minute deadlines and replay.
- Timeout while a mouse is held cancels it; a late cage drop adds no points.
- 320×568, 375×812, 812×375, 768×1024 and 1440×1100 layouts; visible cage, no horizontal overflow, repeated timeout/replay and play-view cleanup.
- Real Chromium touch events for a small-roach tap, mouse hold/drag/cage drop and flying-roach swipe.
- A complete offline round with local sprites, score, controls and results.
- No uncaught browser errors.

Shared UI passed **21 checks**, favourites **14**, and language integration **16**. Card-count assertions were updated for seven games. A favourite-focus assertion now allows one CSS pixel because native scroll offsets round fractional card positions; actual keyboard focus and visible controls remain required.

A standalone preview embeds scripts, styles, fonts and SVG art. In a sandbox without `allow-forms`, it starts and completes a Chinese round, scores ground/flying targets and a held mouse, times out and replays correctly. Mobile and landscape gameplay screenshots were visually reviewed.

Source review also corrected the previous draft timing-game service worker’s cache-prefix filter to match its own game, preventing it from deleting Line Up caches.

Analytics were stubbed during QA. Reduced-motion tests disable optional limb/wing and feedback effects; essential creature movement remains part of gameplay. Physical devices, other browser engines, screen readers and native installation were not directly exercised.

## Oversized guide sprites regression

The idle-page reproduction measured each guide SVG at 1440×1000px inside a 44×55px wrapper. The shared sprite class had applied absolute positioning to both room characters and the unpositioned guide artwork. Positioning is now scoped to direct sprite children of game buttons; guide art has its own positioned, bounded wrapper and clipped SVG viewport. Sprite markup also supplies intrinsic fallback dimensions. Guide SVGs now measure 44×55px on desktop and 35×48px on phones. The game checks passed with new idle/reset guide-size assertions, and the regenerated sandboxed preview passed its size and full-play checks.

## Mouse speed, wings and edge holes

Mouse speed was reduced from 0.43 to 0.32 room units per second, with gait adjusted proportionally. New geometry tests verify that edge-aligned spawns do not jump to the former wall margin and that drops clamp to the current room bounds. Browser checks require four unnumbered holes 2px from the floor edges, and initial creature centres must match the visible holes. A big flying roach is eliminated with a real swipe for exactly four points. Across three flap poses, both wing roots remain at their shoulder attachment points within 0.1px. Wing-pose illustrations and phone layouts were visually inspected.

## Ant friends

Six additional model tests cover individual random scheduling, independent lifetimes while held, one-point penalties below zero, one-time safe flick removal, slow-drag rejection, expired inputs, fresh-tail gesture timing and a maximum population of five ants. Random draws change both arrival intervals and lifetimes. Departure deadlines remain at least 750ms apart, and background return spawns at most one ant. An additional 250 seeded schedules verified finite 4–12 second lifetimes, separated departures and the five-ant cap. **Eight ant browser checks passed** for Chinese/English penalties, 34×40px artwork with a 44×52px target, negative final scores, slow dragging, safe flicks, one ant leaving while another stays, real phone touch, finite fling animation, Shift+Enter and staggered individual arrivals. A targeted record check verifies that a negative personal best survives reload and is replaced by a higher completed score. The regenerated sandboxed phone preview passed Chinese labels, penalties, safe flicks and the final summary checks.

## Cage door and capture feedback

**Four cage browser checks passed** with motion enabled. A charged mouse opens the door while still outside the scoring area. A successful drop scores five exactly once, keeps the door open while the cage expands above its original size, restores the cage and then closes the door. Dropping nearby outside the cage awards nothing and closes the door. Reset clears door and animation state. There were no uncaught browser errors.
