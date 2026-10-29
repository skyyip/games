# Acceptance — Mop Mayhem: Feet Up!

Verified 2026-10-29. Automated browser checks use system Chromium and viewport / touch emulation; physical iPhone / Android thermal, speaker and speech-voice behaviour has not been measured.

## Responsive-control update (source cache v3)

Four current source-browser profiles (320 × 568 / 390 × 844 Chinese; 812 × 375 / 1280 × 900 English) pass. Checks additionally measure the actual rendered shoe pixels: lifting moves the shoe by more than 30 room units and releasing restores its height. Native simultaneous foot holds, reduced motion, visible table clearance and a quick released cleaning swipe are covered. Artifacts: `/tmp/mop-responsive-qa/`.

The extra simulation cases cover prompt final-target settlement after release, closer character following, pause/release cancellation, swept foot/dirt contact under speed boosts and equivalent arrival at 20/120Hz. Stationary mop farming, independent dodge inputs, cramps, NPC defences and original progression tests remain intact. The production build and all 21 built-page metadata checks pass.

## Logic

`node --test --test-isolation=none cha-chaan-mop/tests/*.test.js` — **29 passed**.

Covers the entire reachable clean floor, limited mop speed, perfect-poke timing, each NPC defence, shout cooldown, combo bounds, rage specials, soap guard break, independently held feet, three-second cramps and recovery, rain / lunch modifiers, wet-hit grace, sweep versus splash defences, bonus meals, a complete winning diner round, versus elimination / timeout, pause cleanup, bounded effects / audio, prevention of stationary-mop score farming, malformed storage, atomic cosmetic purchases, top-three partitions and isolated persistence.

`node --test grid-rush/tests/favourites.test.js` — **4 passed**.

## Native browser UI

`GRID_RUSH_PLAYWRIGHT_MODULE=/workspace/games-onboarding-tools/system-chromium.mjs MOP_URL=http://localhost:5261/cha-chaan-mop/ node cha-chaan-mop/scripts/browser-check.mjs`

Passed on the final production build:

- 320 × 568, Traditional Chinese.
- 390 × 844, Traditional Chinese.
- 812 × 375 landscape, English, reduced motion.
- 1280 × 900, English.

Every profile exercises all three modes, actual mop pointer movement / points, shared shout cooldown, both feet held with native multi-touch, release cleanup, eating, three-player simultaneous controls, control bounds / horizontal overflow, fixed-height warnings, pause clock freeze, resume, rule / wardrobe / record dialogs, focus return and Escape dismissal. No page errors.

Complete browser rounds verify timed settlement, saved scores / tips, three-hit defeat without a winning trophy, named surviving versus winners with trophy / confetti, and storage after reload. Screenshots: `/tmp/mop-final-qa/`.

## Production, persistence and discovery

`GRID_RUSH_PLAYWRIGHT_MODULE=/workspace/games-onboarding-tools/system-chromium.mjs node cha-chaan-mop/scripts/release-check.mjs`

Passed a complete diner victory using visible warnings, real keyboard foot holds and meal-button clicks, with full food / drink meters. The test uses a deterministic random sequence for repeatable attack selection and never directly modifies game state. A separately seeded wallet fixture verifies buying / equipping the neon mop through the UI, exact deduction, offline reload, owned equipment / scores retained and an unrelated storage key preserved. Production cache contains hashed JS, CSS and the new cover.

The root-page checks verify the new translated game card, loaded cover, favourite action, working link and inherited English preference; Bun Rush stays hidden. Screenshots: `/tmp/mop-release-qa/`.

Build command:

```sh
PLAYGROUND_BASE_PATH=/ BBL_ESBUILD_MODULE=/workspace/games-onboarding-tools/node_modules/esbuild/lib/main.js node tools/build-site.mjs /tmp/mop-site
```

Built **21 pages**, release **`fcc6b2a4d681d784`**, with hashed JS / CSS / images / fonts / worker assets. Existing unrelated duplicate translation-key warnings remain unchanged.

- `node tools/check-seo.mjs` — all 21 source pages passed.
- `node tools/check-seo.mjs /tmp/mop-site /` — all 21 production pages passed.
- `GRID_RUSH_PLAYWRIGHT_MODULE=/workspace/games-onboarding-tools/system-chromium.mjs node tools/check-gtm.mjs /tmp/mop-site` — all 21 pages passed, including the new game’s single `GTM-K72CNJRN` loader and no-JavaScript fallback.
- `git diff --check` — passed.

Source changes are limited to the new game, its landing card / translations, game catalog and generated root discovery metadata. Existing game mechanics and saved keys are unchanged. No commit or deployment was performed for this new game.
