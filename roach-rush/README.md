# 殲滅小強，人人有責 · Roach Rush

A cute solo arcade game inside a fixed four-wall room. Choose **2 minutes** or **3 minutes** and score before the deadline.

| Visitor | Action | Points |
| --- | --- | --- |
| Small ground roach | Tap once | 1 |
| Big ground roach | Tap the same roach twice within 350ms | 2 |
| Small flying roach | Swipe across it, at least 28px | 3 |
| Big flying roach | Swipe across it, at least 28px | 4 |
| Mouse | Hold still for 500ms, then drag into the upper cage | 5 |
| Ant friend | Accidental tap | −3 |
| Ant friend | Quick flick out | 0 |
| Insect spray | Three area bursts per round, ground or flying roaches | 1 per roach |
| Ant friend in spray | Eliminated by the same gas burst | −3 per ant |
| Mouse trap | Three per round; each captures one mouse on contact | 5 per mouse |

All creatures emerge from one of four unnumbered floor-corner holes. The holes sit 2px from the adjoining floor edges, and creature origins and movement bounds follow the actual responsive hole positions. Roaches always start on the ground and randomly take off, fly for a while and land again. Mice remain faster than ground roaches but now run about 25% slower than the original speed, appear periodically and use a shuffled four-hole cycle. Ant friends arrive individually from random holes: first after 12–18 seconds, then at independently random 2–8 second intervals. Ants stay until explicitly tapped, sprayed or safely flicked out, or until the round resets; they do not fade or automatically disappear. Background return never produces a catch-up group. Creature populations are bounded at 24 roaches, four mice and five ants to keep the room playable on phones; new visitors resume as space opens.

## Development

Node.js 20 or newer, with no dependency installation or build step:

```sh
cd roach-rush
npm start
npm test
```

The shared server serves the full repository; open `/roach-rush/`. The landing page includes eight games and their favourite controls. Traditional Chinese is the default, and the landing-page 中 / EN choice carries here.

## Interaction

The first tap briefly pauses a big ground roach, making the second tap reachable. A flying roach requires a swipe regardless of size; small flyers score three and big flyers score four. A swipe can catch several flying targets along its path; each counts once. Ground roaches cannot be eliminated by swiping.

Holding a mouse still fills a short charge ring. Dragging too soon cancels the attempt. Once charged, the mouse follows the pointer. Approaching the cage opens its hinged door before entering the scoring area; moving away closes it. Only release in the cage scores. A successful catch keeps the door open while the cage expands and rebounds to its original size over 450ms, then closes the door. Keyboard pickup also opens the door. A failed charged drop places the mouse back inside the floor; a cancelled pointer or Escape releases it without scoring. Tab hiding and lost window focus cancel active grabs and reset the cage. Reduced motion omits the decorative rebound.

Ant artwork is 28×34px, smaller again, while the 44×52px touch target stays easy to grab. The guide and fling artwork use the same smaller size. Ant taps deduct three points even when the score is zero. Start a quick swipe on the ant to flick it out safely; ordinary slow dragging does not count. A successful flick tumbles it beyond the room edge and neither adds nor deducts points. Flicks require a 28px recent movement at 0.25px/ms or faster. A release after pausing is not a flick. Ant flick gestures do not hit flying roaches along the path. Results include ant mistakes and safe flick counts.

Each round supplies three insect-spray uses and three mouse traps. Drag it from the toolbar into the floor and release. A dashed circle previews the area and the current roach count. Ants in range add a coloured warning with their count and expected penalty. Gas expands, then applies one burst after 220ms: every ground or flying roach whose centre is inside the circle earns exactly one point, regardless of its normal value. Ants inside the same circle are also eliminated, deducting three points each. Roach gains and ant penalties combine into one net score, which may be negative. Previously eliminated ants do not count again; mice are unharmed. The radius is 28% of the smaller floor dimension, capped at 105px. An outside drop or cancelled drag does not consume a use; a valid empty spray does. Multiple fast releases retain independent gas bursts. The cloud fades after 1.1 seconds. Reset/replay clears all clouds and refills three uses; the absolute round deadline prevents late gas damage. Keyboard users activate either item with Enter, move its aiming marker with arrow keys, release with Enter or Space, and cancel with Escape.

Mouse traps stay at the dropped floor position. Only mice trigger them; roaches and ants are unaffected. A moving mouse crossing a trap is caught for five points, and both the mouse and the triggered trap disappear together. One trap can capture only one mouse. Held mice are excluded until released, avoiding a catch at their old floor position. Mouse movement is checked along the frame segment so fast crossings cannot pass through a trap. The consumed trap is not refunded; unused traps remain on the floor until triggered or the round resets.

Keyboard alternatives: Tab focuses and pauses a creature. Enter taps a ground roach (twice for a big one) or hits a flying roach. On a mouse, hold Space for 0.5 seconds, release, then activate the focused cage with Enter or Space. On an ant, **Shift + Enter** flicks it safely; Enter alone is an accidental hit. Escape cancels.

On phones/touch devices, starting opens a fixed play view with the room, cage, HUD, score guide and End round control. Results and End round restore normal page scrolling. End round abandons the current score; timeout saves the final personal best separately for each duration. Replay starts a fresh population and zero score.

`performance.now()` controls the absolute deadline, spawning and state transitions. Scoring validates the deadline before any award; a mouse released after time expires cannot score. A timeout callback also ends the game while animation frames are suspended. Background return never spawns a catch-up swarm.

## Visuals and offline use

All cockroaches, mice and the cage use local inline SVG. Legs and tails move with a continuous gait; translucent wing shapes hinge at the shoulders with paired flapping and fine veins, avoiding detached oval shapes; heading changes ease into turns, ground creatures separate gently, and flight lift/wing opacity interpolate during takeoff and landing. Captures use small score puffs and a cage rebound, without gore. Reduced motion disables decorative effects and limb/wing motion while retaining the essential movement and gesture rules.

The scoped service worker caches game code, shared UI/language modules, local fonts and supplied cat icons. Bump its cache version when changing cached files. Updates wait until existing windows close. No runtime artwork server is needed. The existing site analytics integration follows the other games and is not required to play.

The highest three completed scores are saved separately for 120- and 180-second rounds in `roach-rush.records.v3`. Each record contains an integer score and completion timestamp. Tied scores from separate rounds keep separate places; older ties sort first. The HUD continues to show the best score. Earlier `roach-rush.records.v2` scores and signed integer bests from `roach-rush.best.v1` migrate into version three. Existing two-minute results remain in the two-minute list; three-minute records start separately. Historical one-minute records are retained in storage as an archive and do not enter either current leaderboard. Negative scores remain valid. Blocked or full storage keeps records for this visit and shows a note. End round abandons a score; only timeout records a completed round.


```text
src/game.js                Pure simulation, spawning, state cycles and scoring
src/sprites.js             Cute SVG roaches, articulated mice and cage
src/app.js                 Input ownership, fixed play view, rendering and results
styles.css                 Room walls, floor, motion, feedback and responsive UI
tests/game.test.js        Dependency-free simulation and rule tests
scripts/browser-check.mjs  Bilingual mouse/touch/keyboard, replay and offline QA
scripts/ants-check.mjs     Ant penalties, persistence, real touch flicks and animation QA
scripts/cage-check.mjs     Approach, door opening, capture rebound and cleanup QA
scripts/spray-records-check.mjs  Drag/touch/keyboard spray, scoring and migrated top threes
scripts/spray-ant-check.mjs  Mixed-target net score, ant warning, touch and saved penalties
scripts/traps-check.mjs     Three-use inventories, independent gas bursts, trap catches and durations
scripts/population-check.mjs Four-mouse cap, simultaneous trap removal and replenishment
src/records.js             Validated top-three records and legacy migration
```

See [VERIFICATION.md](./VERIFICATION.md) for validation results.
