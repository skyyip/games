# Roach Rush · 小強別跑

A cute solo arcade game inside a fixed four-wall room. Choose **1 minute** or **2 minutes** and score before the deadline.

| Visitor | Action | Points |
| --- | --- | --- |
| Small ground roach | Tap once | 1 |
| Big ground roach | Tap the same roach twice within 350ms | 2 |
| Small flying roach | Swipe across it, at least 28px | 3 |
| Big flying roach | Swipe across it, at least 28px | 4 |
| Mouse | Hold still for 500ms, then drag into the upper cage | 5 |
| Ant friend | Accidental tap | −1 |
| Ant friend | Quick flick out, or wait for it to leave | 0 |

All creatures emerge from one of four unnumbered floor-corner holes. The holes sit 2px from the adjoining floor edges, and creature origins and movement bounds follow the actual responsive hole positions. Roaches always start on the ground and randomly take off, fly for a while and land again. Mice remain faster than ground roaches but now run about 25% slower than the original speed, appear periodically and use a shuffled four-hole cycle. Ant friends arrive individually from random holes: first after 12–18 seconds, then at independently random 2–8 second intervals. Each stays for a random 4–12 seconds, even if held or focused. Departure times are separated by at least 750ms so visitors do not leave together. Background return never produces a catch-up group. Creature populations are bounded at 24 roaches, two mice and five ants to keep the room playable on phones; new visitors resume as space opens.

## Development

Node.js 20 or newer, with no dependency installation or build step:

```sh
cd roach-rush
npm start
npm test
```

The shared server serves the full repository; open `/roach-rush/`. The landing page includes the seventh game and its favourite control. Traditional Chinese is the default, and the landing-page 中 / EN choice carries here.

## Interaction

The first tap briefly pauses a big ground roach, making the second tap reachable. A flying roach requires a swipe regardless of size; small flyers score three and big flyers score four. A swipe can catch several flying targets along its path; each counts once. Ground roaches cannot be eliminated by swiping.

Holding a mouse still fills a short charge ring. Dragging too soon cancels the attempt. Once charged, the mouse follows the pointer. Approaching the cage opens its hinged door before entering the scoring area; moving away closes it. Only release in the cage scores. A successful catch keeps the door open while the cage expands and rebounds to its original size over 450ms, then closes the door. Keyboard pickup also opens the door. A failed charged drop places the mouse back inside the floor; a cancelled pointer or Escape releases it without scoring. Tab hiding and lost window focus cancel active grabs and reset the cage. Reduced motion omits the decorative rebound.

Ant artwork is 34×40px, about 23% smaller, while the 44×52px touch target stays easy to grab. The guide and fling artwork use the same smaller size. Ant taps deduct a point even when the score is zero. Start a quick swipe on the ant to flick it out safely; ordinary slow dragging does not count. A successful flick tumbles it beyond the room edge and neither adds nor deducts points. Flicks require a 28px recent movement at 0.25px/ms or faster. A release after pausing is not a flick. Ant flick gestures do not hit flying roaches along the path. Results include ant mistakes and safe flick counts.

Keyboard alternatives: Tab focuses and pauses a creature. Enter taps a ground roach (twice for a big one) or hits a flying roach. On a mouse, hold Space for 0.5 seconds, release, then activate the focused cage with Enter or Space. On an ant, **Shift + Enter** flicks it safely; Enter alone is an accidental hit. Escape cancels.

On phones/touch devices, starting opens a fixed play view with the room, cage, HUD, score guide and End round control. Results and End round restore normal page scrolling. End round abandons the current score; timeout saves the final personal best separately for each duration. Replay starts a fresh population and zero score.

`performance.now()` controls the absolute deadline, spawning and state transitions. Scoring validates the deadline before any award; a mouse released after time expires cannot score. A timeout callback also ends the game while animation frames are suspended. Background return never spawns a catch-up swarm.

## Visuals and offline use

All cockroaches, mice and the cage use local inline SVG. Legs and tails move with a continuous gait; translucent wing shapes hinge at the shoulders with paired flapping and fine veins, avoiding detached oval shapes; heading changes ease into turns, ground creatures separate gently, and flight lift/wing opacity interpolate during takeoff and landing. Captures use small score puffs and a cage rebound, without gore. Reduced motion disables decorative effects and limb/wing motion while retaining the essential movement and gesture rules.

The scoped service worker caches game code, shared UI/language modules, local fonts and supplied cat icons. Bump its cache version when changing cached files. Updates wait until existing windows close. No runtime artwork server is needed. The existing site analytics integration follows the other games and is not required to play.

Personal bests use `roach-rush.best.v1` with validated integer values for 60- and 120-second modes. Negative completed scores are valid; missing records use null. Existing non-negative records remain compatible. Unavailable storage falls back to this visit. No account or gameplay backend is used.

```text
src/game.js                Pure simulation, spawning, state cycles and scoring
src/sprites.js             Cute SVG roaches, articulated mice and cage
src/app.js                 Input ownership, fixed play view, rendering and results
styles.css                 Room walls, floor, motion, feedback and responsive UI
tests/game.test.js        Dependency-free simulation and rule tests
scripts/browser-check.mjs  Bilingual mouse/touch/keyboard, replay and offline QA
scripts/ants-check.mjs     Ant penalties, lifetime, real touch flicks and animation QA
scripts/cage-check.mjs     Approach, door opening, capture rebound and cleanup QA
```

See [VERIFICATION.md](./VERIFICATION.md) for validation results.
