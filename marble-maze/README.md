# 波珠走迷宮 · Marble & Mist

Tilt a phone forward/backward/left/right to roll from the start to the finish. Five fixed mazes each have exactly three distinct start-to-finish routes. Each maze saves its three fastest successful completion times locally. Bomb losses and abandoned runs never enter the records.

Phone mode requests orientation and motion access in the original Start button gesture. Eight valid orientation readings calibrate a comfortable screen-up position, followed by a countdown. Orientation controls both axes, including landscape. Distinct acceleration bursts clear mist in pairs: two high readings confirm a burst, a quiet interval rearms detection, and two bursts must occur within 1.5 seconds. Each accepted burst adds a physical impulse in the measured direction; vertical shaking also produces an in-plane disturbance. Linear acceleration is preferred, with gravity-removed readings as a fallback.

Mist starts after 5–8 seconds, depending on the maze, then slowly thickens. A two-shake pair clears it and postpones the next cloud. The marble remains readable through the fog. Shaking before mist appears cannot postpone the first cloud. Touch/keyboard fallback offers the same two-press mechanic with the same inertia, not a free clear.

The finish warns for 1.6 seconds before a bomb appears. Each bomb chooses a complete legal route and slowly follows it in reverse toward the start; harder levels allow two simultaneous bombs. Swept relative-motion collision prevents a fast marble from passing through a bomb between frames. Bomb contact takes priority over reaching the finish in the same step. The explosion is a soft cartoon puff.

All movement uses fixed 120 Hz steps, inertia, damping, bounded diagonal control and circle-to-wall collisions. Every route has been completed with the actual physics in model tests. Pauses, hidden tabs, lost focus, stale orientation data and long interrupted frames freeze active time and hazards. Resume recalibrates phone input and uses a countdown. Records are saved only after a successful finish animation, once per run, under `marble-maze.records.v1`. Invalid records are ignored; unavailable storage retains visit-only results.

Keyboard: arrows or W/A/S/D roll, two separate Space presses shake, P pauses and Escape pauses or cancels preparation. Touch supports held direction buttons and a two-press shake button. Sensor access is optional in chat previews. Reduced motion removes decorative fog/ring/limb effects while retaining essential marble, bomb and fog state feedback.

The page defaults to Traditional Chinese and inherits the landing language choice. It has a favourite-enabled landing card, scoped offline caching, local Canvas/SVG artwork and local fonts. Run `npm start` and `npm test` inside this directory; no build or dependency installation is needed. Physical phone hardware and native iOS permission sheets were not directly exercised; sensor paths were tested with synthetic readings and touch through Chromium's device protocol.

Tilt acceleration is 50% stronger, with the existing fixed-step collision solver and damping retained. Raised wall gradients, marble shading and layered UI shadows add depth. Landscape results use a compact trophy layout so both actions stay reachable.
