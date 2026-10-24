# 火柴人走獨木橋 · Little Balance

A solo balance game. Tilt a phone left or right to apply corrective force to a tiny stick figure carrying a balancing pole. The aim is to stay on the bridge for as long as possible. Falling ends the walk; the three longest completed walks are saved on the current device.

## Play and develop

No build or dependency installation is required. With Node.js 20 or later:

```sh
cd balance-bridge
npm start
npm test
```

Open `/balance-bridge/`. The landing page includes the ninth game and its favourite button. Traditional Chinese is the default, with English inherited from the landing page language choice.

Phone mode requests `DeviceOrientationEvent` access on the Start button gesture, then calibrates the comfortable holding position using the median of eight valid readings. Keep the screen facing up; the device need not be perfectly flat. A three-second countdown follows calibration. Small tilts against the walker's lean are more useful than large swings. The displayed level, body angle and pole move together. Nothing from the sensor is saved or transmitted.

Missing APIs, declined permission, no usable readings or an unresolved permission request offer touch controls. Touch mode provides a spring-return slider and press-and-hold left/right buttons. Left/Right or A/D also work; Space pauses and Escape returns to setup. Pointer cancellation, lost capture, blur and pause release held input. Mobile play uses a fixed viewport; setup restores page scrolling without negative offsets.

## Surprises

| Event | Severity | Duration |
| --- | --- | --- |
| A passing gust | 1 / 5 | 3 s |
| A bird's droppings | 2 / 5 | 3 s |
| Thorns underfoot | 3 / 5 | 4 s |
| The bridge shakes | 4 / 5 | 4 s |
| A flying roach lands on the head | 5 / 5 | 5 s |

The first surprise is a gentle wind. Later events are random, never repeat immediately, and start only after a recovery gap. Every event has a 1.6-second warning. Increasing severity adds stronger impulses and continuous disturbances, as well as more visible body trembling. Wind moves leaves, birds fly overhead and leave a small splat, thorns appear underfoot, the bridge shakes, and the little roach flies in and settles on the head. The event banner shows severity and remaining time.

## Simulation and records

The walker uses a fixed 120 Hz inverted-pendulum simulation with filtered user force, damping, walking sway and bounded random drift. Countersteering affects the actual simulation; the result is not a precomputed duration. Difficulty rises gradually. Crossing the fall angle freezes survival time immediately, followed by a cloud-side tumble before results appear. Records are written once after that animation. Abandoning a walk never saves a score.

Pause, tab hiding and lost focus freeze active time and events. Resume uses another countdown. Phone resume and rotation recalibrate the comfortable centre. Stopped sensor readings pause play instead of applying stale force. Frames delayed beyond 250 ms cannot add an unbounded duration; returning from the background requires explicit resume.

`balance-bridge.records.v1` stores up to three `{seconds, at, mode}` rows. Longer durations rank first, older equal durations first. Invalid storage is ignored. Unavailable or full storage retains records for this visit and explains the limitation in the records panel. Both control modes share the leaderboard, with their mode shown on each row.

Artwork is local SVG, with linked arm/pole movement, alternating bent legs, a nervous face near the limit, layered scenery and soft clouds. Reduced motion retains the essential body angle, feedback, elapsed time and event rules while removing decorative gait, trembling and scenery motion. The scoped service worker caches all game, language, font and icon files for offline play after an initial online visit.

See [VERIFICATION.md](./VERIFICATION.md) for checks and their limits.
