# Stone Skip · 打水漂

A solo river game with an adjustable release angle, phone-motion throws, swipe throws and keyboard charging. Traditional Chinese is the default, and the landing page’s 中 / EN choice carries into the game. Chinese distance labels use 米 (metres).

## Play

Choose a release angle of **5–100°** (default **5°**). Length, width, weight and spin are no longer options or scoring factors. Start a round to freeze the angle. Change stone returns to setup without saving an unfinished flight.

- **Phone motion:** choose Phone motion and start. On browsers requiring permission, the request runs directly from the button action. Keep still for calibration, then make one comfortable throwing motion while keeping hold of the phone. A validated motion launches the stone automatically. Retry or switch to a swipe if permission, hardware or embedded-browser policy prevents motion sensing.
- **Swipe:** start on the stone, swipe upward and release. Its recent speed supplies the 80% throw share. Taps, downward drags, stale releases and slow gestures leave the stone ready to retry.
- **Keyboard:** focus the stone, hold Space or Enter to charge, and release near a full meter. Escape, lost focus and cancelled pointers discard an unfinished input.

The river shows the initial flight, every water contact, shrinking skip arcs, a dotted trail, splashes, expanding ripples and the final sink. Results and records appear only after the animation finishes. Hiding the page pauses an active flight; abandoning it saves nothing. Phones use a fixed play view with accessible exit and replay controls. Reduced motion lowers the arcs and shortens the sequence while preserving the order of the flight and contacts.

## Scoring

This is a deterministic arcade estimate using the requested proportions; it is not a physical prediction of real stone trajectories. There is no random final-score bonus.

| Factor | Maximum points | Quality |
| --- | --- | --- |
| Release angle | 20 | Best at 20°; quality is `exp(-((angle - 20) / 26)^2)` |
| Player throw | 80 | For phone motion, the average of force, speed and swing-range qualities |

Total `S` is the unrounded sum of the two contributions, out of 100. Distance is `3 + 117 × (S / 100)^1.75`, rounded to 0.1 m. Bounces are `floor(1 + 27 × (S / 100)^2.2)`. The game spans 3–120 m and 1–28 contacts. Better throw quality at the same angle never reduces either result. The result disclosure shows the two weighted contributions and, for phone throws, the three measured components.

Phone throws use three equal shares within the 80-point throw contribution:

- **Force proxy:** peak median-filtered acceleration, `clamp((peak - 3) / 22)`.
- **Speed estimate:** peak short-window integrated velocity, `clamp(speed / 3.5)`.
- **Swing range:** spatial range during the capture, `clamp(range / 0.45)`.

Calibration requires at least four valid samples and 400ms at rest. Linear acceleration is preferred; a gravity-inclusive fallback subtracts a smoothed gravity baseline. A median filter rejects isolated spikes, and sustained acceleration of at least 5 m/s² begins a 450ms capture. Trapezoidal integration estimates velocity and travel range from real sample intervals up to 160ms; duplicate timestamps and longer gaps cannot invent travel. Samples are capped to bounded arcade ranges. These are short gesture estimates, not calibrated newton, speedometer or ruler measurements.

Force, speed and range contribute equally: `throwPower = (forceQuality + speedQuality + rangeQuality) / 3`. A longer movement can score better than a brief movement with the same peak acceleration. Result details show acceleration in m/s², speed in m/s, swing range in cm and each component's point contribution. An eight-second timeout offers retry or swipe. Listeners and timers are cleaned up on launch, cancellation, leaving the page and mode changes; pending permission responses cannot launch a cancelled round.

Swipe power uses the final 140ms of movement, at least 25px upward and 35px overall, with speed above 0.12px/ms. Strength is `clamp((speed - 0.1) / 2.3, 0, 1)`. Keyboard strength follows a 2.4-second triangular cycle. All input methods use the same scoring weights and identify their source in results and records.

## Records and offline use

Distance and bounce count each retain their **top three** on the current device in `stone-skip.records.v2`. The previous `stone-skip.records.v1` key remains untouched; new rules start a separate ranking. Phone records retain the three motion components and validate their combined power on reload. The saved set is the union of those lists, at most six distinct throws. Values are validated and recomputed from saved settings and strength on load; malformed or incompatible entries are ignored. Ties use score, then the older record. Blocked or full storage keeps this visit playable and displays a storage note.

All artwork is local Canvas or inline SVG. The scoped service worker caches the game, shared interface and language modules, fonts and supplied app icons. Updates wait for existing game windows to close. The Pages workflow includes `stone-skip/` both as a trigger and in the deployed artifact.

## Development

Node.js 20+; no dependency install or build step:

```sh
cd stone-skip
npm start
npm test
```

Open `/stone-skip/` on the shared server. For optional browser verification, provide an installed Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node stone-skip/scripts/browser-check.mjs
```

`src/game.js` contains scoring, input math, the flight plan and records. `src/motion.js` processes sensor samples without browser dependencies. `src/river.js` renders the local river scene; `src/app.js` owns browser input, permissions, animation completion and persistence. See [VERIFICATION.md](./VERIFICATION.md).

The throwing-mode selector uses its own native radio-card border instead of the shared moving outline, avoiding a second border offset by the fieldset legend. Its selected state, focus ring and dimensions remain consistent in both modes.
