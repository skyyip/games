# Verification

Verified with Node.js 24, system Chromium and the existing optional Playwright installation. No game dependency was installed.

## Logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js just-a-sec/tests/*.test.js
```

**77 tests passed**, including seven new timing-game tests:

- All 20 integer targets, shared throughout a round.
- 2–6 player validation, blank-name fallback, literal names, length limits and reset.
- Matching input ownership, repeated presses/releases and duplicate scoring rejection.
- Press-to-release timing independent of readiness, whole-millisecond rounding and results hidden until reveal.
- Cancellation followed by a fresh attempt for the same player.
- Six-player progression, absolute-error ranking, stable ties and replay.
- Zero-duration guesses and long holds without an artificial cutoff.

## Browser

Start the local server and supply an existing Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
JUST_A_SEC_URL=http://localhost:5173/just-a-sec/ \
node just-a-sec/scripts/browser-check.mjs
```

**14 game browser checks passed**:

- Complete Chinese and English rounds, player controls, one shared target, matching results and ties.
- Times remain hidden while holding, at locked confirmation and during handoffs. No changing elapsed/progress text appears.
- Mouse capture accepts release outside the original circle; keyboard Space/Enter durations are measured correctly.
- Player names resembling UI text or HTML remain literal, including in the winner heading and ranking.
- All six players finish and receive the correct ranking.
- Escape, window blur and pointer cancellation discard unfinished input without consuming a turn; End round restores setup.
- Chinese layouts at 320, 375, 768 and 1440px, plus 812×375 landscape, fit without horizontal overflow. The complete hold target stays in the viewport when focused.
- Real Chrome touch input covers holding, movement, release and cancellation.
- Spring compression and circular confirmation animate with ordinary motion preferences; reduced-motion rounds remain fully usable.
- The sixth landing card can be favourited and opens the game.
- A complete round works offline with cached fonts, language, motion and game modules.
- No uncaught browser errors.

The shared UI suite passed **20 checks**, favourites passed **14**, and language integration passed **16**, including existing games and the six-card landing page. Known card-count assertions were updated for the added game; existing growth-stage count assertions were unchanged.

A standalone preview embeds all required scripts, fonts, styles and SVG artwork. Inside an iframe without `allow-forms`, it starts via its native button and completes a Chinese two-player round using keyboard holds. This avoids the earlier Line Up preview form-submission problem.

Desktop/mobile setup, timing and result screenshots were visually reviewed. Meaningful body-text contrast was checked against the paper and sage surfaces. Analytics were stubbed during tests. Physical phones, other browser engines, screen readers and native installation were not directly exercised.
