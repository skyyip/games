# Pikmin Fling verification

Verified on 2026-10-24 with Node.js 24, system Chromium and the existing optional Playwright installation. No runtime or test dependency was added to the game.

## Core logic

```sh
node --test grid-rush/tests/*.test.js grid-rush-in-order/tests/*.test.js line-up/tests/*.test.js pikmin-fling/tests/*.test.js
```

**69 repository tests passed**, including **29 Pikmin tests** covering:

- Thirty-character rosters with 20 leaves, five buds and five flowers; all seven types, including White.
- A 30,000ms deadline enforced before launches, growth and arrivals, including delayed background updates; unique 1/2/3-point scoring and early completion.
- Flower charging at the exact 599/600ms boundary, ordinary flings and double taps.
- Chains armed after 200ms, requiring both matching colour and growth stage; incompatible groups reject atomically.
- Coalesced touch input, fresh final flicks, duplicate membership rejection and expired gestures.
- Protected recurring growth waves, bounded walking, distance-based gait and paused characters.
- Separate rankings, validation and storage failures. v3 imports Normal/Challenge completion times from v2 while leaving old 20-second scores intact and separate from 30-second scores.

## Browser checks

Start the local server, then run each suite with an existing Playwright module:

```sh
GRID_RUSH_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PIKMIN_FLING_URL=http://localhost:5173/pikmin-fling/ \
node pikmin-fling/scripts/browser-check.mjs
```

The original-mode suite passed **38 checks**:

- Each of seven character types completes a round with matching SVG leaf/bud/flower representations and flight clones.
- Mouse, keyboard, touch, double tap, charged fling, same-stage chains, cancellation, multi-pointer input and Feed selected.
- Challenge waves, records, reset during flight, repeated rounds and final-arrival timing.
- Native selection protection, responsive layouts from 320 to 1440px, 44px targets, reduced motion and blocked/corrupt storage.
- All 21 SVG type/stage combinations render offline, including a fresh offline tab; navigation and no uncaught browser errors.

The screen-lock suite (`scripts/scroll-check.mjs`) passed **14 checks** for touch/wheel scrolling, rotation, full-viewport gardens at six portrait/landscape sizes, covered controls becoming inert, End round, completion and timeout restoring normal scrolling.

The timed-mode suite (`scripts/timed-check.mjs`) passed **14 checks** for 30-second countdowns, scoring, growth waves, unfinished-flight cancellation, replay/reset, early clears, persistent rankings, touch input, reduced motion and offline play. Its deadline test pauses the test clock so automation latency cannot consume the intended final 300ms window.

The shared language suite (`grid-rush/scripts/language-check.mjs`) passed **16 checks**, including completed Normal/timed Pikmin rounds in Traditional Chinese and English, dynamic scores, records and offline language modules.

The improvement suite (`scripts/improvements-check.mjs`) passed **7 checks**:

- White characters render; ground characters have opposing arm/leg swings; only pink characters hover and flap wings.
- Selected characters have no frame, non-flower selections have no charge ring, and different-colour characters cannot join a chain. Keyboard focus remains visible.
- Exact 599ms rejection and 600ms flower launch with the countdown ring retained.
- At 320×568, 375×812 and 812×375, three consecutive timeout/replay cycles and an early-clear/replay cycle preserve full viewport coverage and clear internal scroll positions.
- No uncaught errors across these actions.

Replay screenshots in `/tmp/pikmin-improvements-qa` were visually inspected in portrait and landscape. The reported half-white frame was not reproduced in the initial Chromium baseline. The fix removes negative fixed-body positioning, cancels pending result scrolling, clears internal offsets, blurs hidden result controls and clips internal field overflow. Regression checks cover the suspected replay/scroll path; physical-device confirmation remains useful.

## Standalone preview

The standalone `/workspace/games-preview/pikmin-fling.html` embeds local JavaScript, styles, fonts and icons. A browser check verified default Traditional Chinese instructions, white characters, timed play, early completion and Play again without uncaught errors. A mobile screenshot was visually inspected.

Analytics requests were stubbed during QA. Chrome touch emulation was tested; physical iOS/Android devices, other browser engines, screen readers and native installation were not directly tested.

## Corner icon visibility

Browser checks passed in Chinese and English at 1440×1100, 320×568, 375×812 and 812×375. Each checked all three modes: icons start hidden, keyboard/touch controls show and hide all 30 badges, reset preserves the current choice, reload returns to hidden, and flower hold rings remain visible. All controls fit the viewport with at least 44px height. The 14 screen-lock regressions and the regenerated standalone preview (including its toggle, completion and replay) also passed.
