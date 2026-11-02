# 蓄力蛙：鱷口求生 · Frogger Jump 2.5D

An independent, bilingual, one-finger endless jumping game at `frogger-jump/`. It is deliberately absent from the landing-page cards and has `listed: false` in the shared game catalog. Open its URL directly. No account, server or paid API is needed.

Hold the river, lower control, left mouse button or Space/Enter. The power meter goes 0 → 100 → 0; release to jump. The frog automatically aims at the next stump. Power determines world-space distance, and landing tolerance uses the target's circular top radius. Successful hops count once, replace the oldest of three stumps and anchor the frog at the new top centre. A smooth following camera preserves the three-log view. Misses splash into the river and trigger a cartoon red crocodile before showing the score and best run.

- Jumps 0–10: full 48-unit tops, short gaps, mixed I/Z route runs, no sinking logs.
- Jumps 11–30: wider gaps, progressively smaller tops, 18% trap chance; consecutive traps are prevented.
- Jumps 31+: 28-unit tops, longer gaps, 36% trap chance and possible consecutive sinking logs.
- Dark logs start a 2.5-second active-time deadline on landing, not while previewed. Leave before the deadline, even if it expires during flight. Cancelling a hold does not reset it.
- Pause/hidden pages freeze jumps, charging, camera, crocodile and trap time. Pausing cancels a held input so returning never launches a stale jump. Pointer cancellation and secondary fingers cannot create extra jumps.

The best three positive runs are stored under `frogger-jump.records.v1`, separately from every other game. Invalid saves are ignored; unavailable browser storage falls back to this visit. A completed result is recorded only once. Sound is off initially, opt-in, synthesised locally and suspended after brief feedback. No microphone, motion or location permission is requested.

Canvas renders at up to 30 fps with device pixel ratio capped at two. Normal idle stumps, setup and results stop requesting frames. The scene has three logs, one frog, bounded ripples and one crocodile, with no external textures, filters or particle DOM. Reduced-motion mode suppresses decorative water drift and shaking while preserving essential jump timing. The local service worker preloads the game and shared UI; the site builder produces content-hashed assets, Apache cache rules and update-aware production workers.

Run `npm test` here or `node --test --test-isolation=none frogger-jump/tests/*.test.js` on Node 22+ when test subprocesses are restricted. Run the root static server with `PORT=5260 node grid-rush/scripts/serve.js` and open `/frogger-jump/`. Browser acceptance uses `scripts/browser-check.mjs`; `FROGGER_URL` selects a source or production preview and `GRID_RUSH_PLAYWRIGHT_MODULE` selects Playwright.
