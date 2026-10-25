# Flick Force · 斗指力

A solo, one-swipe distance game. Flick **up or down** on the runway, release while moving and watch the course coast to rest. Both directions use the same scoring. The final distance is shown in **game metres**, with the three longest completed flicks saved on this device.

## Run

From this directory, run `npm start`, then open `http://localhost:5173/flick-force/`. There are no runtime dependencies or build steps. Run `npm test` for the model/record tests. The root landing page includes the game, its favourite control and a local SVG illustration; the Pages workflow deploys this directory.

## Technique and scoring

The gesture uses Pointer Events and coalesced samples where available. Direction comes from net vertical travel. A valid swipe lasts 25–1500ms, moves at least 24px vertically, is predominantly vertical and has at least 72% net progress relative to its vertical path. A minimum release velocity rejects drags that stop before release. Taps, horizontal drags and repeated rubbing do not launch. Only one pointer or arrow-key gesture can control a round; a second finger cancels the touch gesture.

Measurements are relative to screen height so equivalent gestures produce comparable scores across screens:

- **Speed:** 65% release velocity over roughly 80ms, 20% peak smoothed velocity over roughly 60ms and 15% average velocity. It reaches its scoring ceiling at four screen heights per second.
- **Effort:** sustained swipe acceleration, normalised to 32 screen heights per second squared. Useful pressure samples from touch/pen hardware can refine the effort score (75% acceleration, 25% pressure). Missing, out-of-range or conventional constant 0.5 pressure values and saturated touch-only 1.0 readings do not pretend to measure physical force. The UI labels effort as an estimate or a pressure-assisted estimate.
- **Range:** net travel, reaching its scoring ceiling at 75% of screen height.

The launch strength is `speed^0.45 × effort^0.30 × range^0.25`, with each quality clamped to 0–1. Launch speed is `12 + 96 × strength` game m/s. Friction removes 14 game m/s each second. Analytic constant-deceleration motion gives `distance = v₀t − ½at²` and the final distance `v₀² / 2a`, up to about 416.57 game metres. Higher speed, effort or range increases distance until its corresponding ceiling. Metres represent the game course, not physical scrolling or a real-world finger-force measurement.

## Interaction

- **Touch:** swipe once on the runway and release. Native page scrolling and double-tap zoom are disabled on the gesture surface; the rest of the page remains scrollable and supports pinch zoom.
- **Mouse:** drag vertically and release; mouse pressure is ignored.
- The circular reset button cancels without a score. Arrow-key launching and keyboard-generated gestures have been removed; normal keyboard navigation of links/buttons remains native browser behaviour.
- **Replay:** use One more flick after the result. Input during coasting cannot add power or start another round.

The canvas shows live metres, repeating five-metre markers, grass/cloud parallax and a front-facing cream toy car aligned to the road, with a grey roof, pink cheeks, a forehead star and dotted side panels. The track follows the finger during preparation, then continues under its own momentum with gradual braking. During the glide, the car puts on a determined face and headband, with a toothy effort mouth, bouncing sweat, fluttering ribbon, rolling tyre treads, suspension bob and moving speed trails/dust. The road, cards and buttons use a pastel peach/mint toy-town palette. Pausing freezes the pose; reduced motion keeps the car and road static. Results and storage updates happen only after stopping. Reduced motion leaves the course and character static while distance still progresses. Rendering sleeps when the round is idle or complete; canvas resolution is capped at 2× device pixels.

Backgrounding or focus loss cancels an unfinished gesture, or pauses a coast. Resume resets the animation timestamp so hidden time cannot add distance or save a result. Resizing cancels an unfinished gesture and redraws a coast at the same physical progress. Pointer cancellation, lost capture and Escape are safe exits.

## Records, language and offline use

`flick-force.records.v1` stores `{version:1, records:[{distance,direction,date}]}`. Entries keep full-precision distances, sort longest first and retain only three. Stable ties preserve the earlier record. Reads reject invalid dates, directions, negative/out-of-range distances and malformed JSON. Denied/full storage falls back to in-memory rankings with a visible notice. Other games' records are untouched.

Traditional Chinese is the site default; the landing page language selection carries into the game, including dynamic prompts, results, controls and metadata. A language query also works when storage is unavailable.

The scoped service worker precaches local modules, fonts, shared language/UI and icons. After Ready to play offline appears, reloads and gameplay work without a network connection. Updates wait until existing game windows close. Bump `CACHE_NAME` when editing cached resources.

Optional browser checks:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright-module node scripts/browser-check.mjs
```

See [VERIFICATION.md](./VERIFICATION.md) for validation details.

The game and landing illustration share `src/car.js`. Run `npm run build:cover` after changing the character. The generated `assets/flick-car-cover.svg` is local and used by the landing card.

The smaller frontal car emits three staggered rear exhaust puffs while coasting. They expand and fade behind the vehicle, freeze on pause and disappear at rest or with reduced motion.

The speed/effort/range progress bars remain visible, while their numeric percentages are hidden. Distance and records retain their metre values.
