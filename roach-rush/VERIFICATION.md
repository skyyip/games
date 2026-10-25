# Verification

Validated with Node.js 24, system Chromium and the existing optional Playwright installation. The game adds no runtime dependencies.

## Logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js just-a-sec/tests/*.test.js roach-rush/tests/*.test.js stone-skip/tests/*.test.js
```

**184 repository tests passed**, including thirty-three Roach Rush tests for:

- Both durations and the exact absolute deadline, with four initial ground spawns at the corner holes.
- Unique 1/2/3/4/6-point scoring; small flying roaches score three and large flyers score four.
- Big-roach identity and the 350/351ms double-tap boundary.
- Ground → flying → ground cycles and protected held-creature states.
- Continuous bounded spawning, no background catch-up burst and at most four mice.
- Shuffled four-hole mouse cycles.
- Faster mice, bounded movement, paused holds and failed drops.
- Reset clearing scores, pending taps and the population; late input rejection.
- Swipe-line crossing, near misses and stationary samples.
- Individual random ant arrivals capped at five, persistent visitors without automatic departures, negative tap penalties and safe fast flicks.

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
- Keyboard mouse pickup and cage activation, plus separate 2/3-minute deadlines and replay.
- Timeout while a mouse is held cancels it; a late cage drop adds no points.
- 320×568, 375×812, 812×375, 768×1024 and 1440×1100 layouts; visible cage, no horizontal overflow, repeated timeout/replay and play-view cleanup.
- Real Chromium touch events for a small-roach tap, mouse hold/drag/cage drop and flying-roach swipe.
- A complete offline round with local sprites, score, controls and results.
- No uncaught browser errors.

Shared UI passed **22 checks**, favourites **14**, and language integration **16**. Card-count assertions were updated for eight games. A favourite-focus assertion now allows one CSS pixel because native scroll offsets round fractional card positions; actual keyboard focus and visible controls remain required.

A standalone preview embeds scripts, styles, fonts and SVG art. In a sandbox without `allow-forms`, it starts and completes a Chinese round, scores ground/flying targets and a held mouse, times out and replays correctly. Mobile and landscape gameplay screenshots were visually reviewed.

Source review also corrected the previous draft timing-game service worker’s cache-prefix filter to match its own game, preventing it from deleting Line Up caches.

Analytics were stubbed during QA. Reduced-motion tests disable optional limb/wing and feedback effects; essential creature movement remains part of gameplay. Physical devices, other browser engines, screen readers and native installation were not directly exercised.

## Oversized guide sprites regression

The idle-page reproduction measured each guide SVG at 1440×1000px inside a 44×55px wrapper. The shared sprite class had applied absolute positioning to both room characters and the unpositioned guide artwork. Positioning is now scoped to direct sprite children of game buttons; guide art has its own positioned, bounded wrapper and clipped SVG viewport. Sprite markup also supplies intrinsic fallback dimensions. Guide SVGs now measure 44×55px on desktop and 35×48px on phones. The game checks passed with new idle/reset guide-size assertions, and the regenerated sandboxed preview passed its size and full-play checks.

## Mouse speed, wings and edge holes

Mouse speed was reduced from 0.43 to 0.32 room units per second, with gait adjusted proportionally. New geometry tests verify that edge-aligned spawns do not jump to the former wall margin and that drops clamp to the current room bounds. Browser checks require four unnumbered holes 2px from the floor edges, and initial creature centres must match the visible holes. A big flying roach is eliminated with a real swipe for exactly four points. Across three flap poses, both wing roots remain at their shoulder attachment points within 0.1px. Wing-pose illustrations and phone layouts were visually inspected.

## Ant friends

Six ant model tests cover individual random scheduling, persistent ants while held, three-point penalties below zero, one-time safe flick removal, slow-drag rejection, late inputs, fresh-tail gesture timing and a maximum population of five ants. Random draws vary arrival intervals; background return spawns at most one ant. **Eight ant browser checks passed** for Chinese/English penalties, 28×34px artwork with a 44×52px target, negative final scores, slow dragging, safe flicks, real phone touch, finite fling animation and Shift+Enter. Long clock advances verify ants remain fully visible, including while held, and that the population stops at five until a visitor is removed. A targeted record check verifies that a negative personal best survives reload and is replaced by a higher completed score. The regenerated sandboxed phone previews verify Chinese labels, spray scoring, top-three records and refill after replay, with both persistent and unavailable storage.

## Cage door and capture feedback

**Four cage browser checks passed** with motion enabled. A charged mouse opens the door while still outside the scoring area. A successful drop scores five exactly once, keeps the door open while the cage expands above its original size, restores the cage and then closes the door. Dropping nearby outside the cage awards nothing and closes the door. Reset clears door and animation state. There were no uncaught browser errors.

## Spray, top-three records and name

**Nine spray/records browser checks passed** in Chinese and English, including real touch at 320px and 375px, keyboard aiming and cancellation, an outside drop preserving the can, delayed gas damage, exactly one point per roach, three uses per round, refill on replay, gas animation and no late scoring after the deadline. The title is 殲滅小強，人人有責 in Chinese. Separate top-three lists preserve legacy bests, keep valid negative scores, retain only the highest three completed rounds and survive reload. Five spray simulation tests cover area geometry, target types, delayed damage, three-use ownership, empty use, reset and deadline ordering. Three record tests cover ranking, migration and invalid storage. The ant suite passed with −3 penalties and negative results/records.


## Ants caught by spray

Four dedicated browser checks passed for English mouse drag, Chinese mouse drag, Chinese real phone touch and error-free execution. The aiming circle warns of ants and their −3 penalty before release. A sprayed ant disappears and subtracts exactly three points while in-range roaches still add one each. The net score, separate sprayed-ant summary and saved record agree; replay clears the warning and refills the can. Simulation tests additionally verify multiple ants can take a score below zero, mixed targets combine correctly, removed ants cannot be penalized twice, outside ants and mice survive, and the round deadline prevents late deductions. Existing nine spray/records checks also passed.


## Three-use tools, traps and 2/3-minute modes

Seven new simulation tests cover active durations, three independent overlapping spray bursts without duplicate points, both inventories resetting to three, mouse-only trap capture for exactly six points, simultaneous mouse/trap removal, swept-path collision, held mice, overlapping traps and deadline rejection. The existing record tests now verify version-three migration: two-minute records remain active, one-minute records remain archived, and three-minute scores are independent.

Seven additional browser checks passed using desktop mouse input and real phone touch. All three traps can be placed and each captures one mouse for six points; the mouse and triggered trap disappear together, and roaches survive. Three quick spray releases produce three independent clouds. Invalid drops and Escape preserve inventory. End round/replay clears traps and clouds and restores both counters to ×3. The three-minute mode stays active after two minutes and ends at its own deadline. The 11 core game browser checks, nine spray/records checks and four spray-ant checks also passed with the new durations, inventories and version-three storage.

## Four-mouse population and trap removal

Three focused browser checks passed on desktop and with real phone touch: scheduled spawns reach four mice but never a fifth; a trap removes itself and its captured mouse in the same frame for exactly six points; the freed population slot refills without exceeding four. Trap inventory remains consumed. Screenshots confirm the smaller ant artwork retains its larger touch target and the four-mouse room stays within the phone viewport.

## Six-point mice and phone toolbar

The model suite, three population checks, four cage checks and seven trap/inventory checks passed with six points for either capture method. Additional 375×812, 390×844 and 812×375 checks require both toolbar buttons to remain at least 58 CSS pixels above the viewport bottom; CSS adds the native bottom safe-area inset as well. The six-point quick guide is verified. Native iPhone system gestures were not directly exercised in Chromium.

## Mouse tail alignment

The tail now joins the centre rear of the body and swings around that same attachment point. Twelve rendered direction/gait poses and held-drag styling keep the root fixed; the pose sheet was visually inspected. All four cage browser checks passed again, covering hold/drag, successful six-point capture, a near miss and reset. Standalone Roach Rush previews were regenerated.
