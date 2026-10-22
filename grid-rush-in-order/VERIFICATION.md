# Verification — 2026-10-20

Verified with Node.js 24.19.0, Chrome and an existing Playwright installation. No application dependencies were added.

- **6 unit tests passed:** ordered numeric play, all 26 letters in each case mode, invalid/wrong/repeated inputs, all numeric grid sizes, reset and mode changes, final-click timing, independent record categories, top-three sorting/limits, precision, ties, malformed/unavailable storage and persistence.
- **19 browser checks passed:** all seven challenges, wrong/repeated clicks, running and stopped timers, reset/replay, locked setup during play, new-record highlighting, independent persisted scores, keyboard activation and arrow navigation past blank cells, responsive square cells at 320/375/600/768/1024/1440px, reduced motion, graceful storage denial and no uncaught JavaScript errors.
- **Touch verification:** Chrome's touch emulation confirmed progress advances at `touchStart`, before release; each cell retains its position and dimensions after every valid letter; the final contact stops timing and displays results; releasing that contact cannot accidentally start another round.
- **9 PWA checks passed:** manifest/icons, service worker control, isolated caches, no Chrome installability errors in a regular temporary profile, install instructions, every challenge playable after an offline reload, preserved offline records, fresh offline tab launch and hidden install promotion in standalone mode.
- **Visual review:** desktop number and mixed-case views, 320/375/768px layouts and mobile results were inspected through generated screenshots.
- **Code review:** checked state transitions, alphabet ordering regardless of case, unique symbol handling, fixed CSS Grid tracks, blank-cell keyboard handling, full-precision records, storage/cache isolation, focus management and local asset paths. Original game files were unchanged.

Touch tests are automated Chrome device emulation, not physical iOS/Android device testing. Keyboard navigation was exercised in Chrome; no screen-reader session was performed. Browser installation prompts vary by platform.

## Shared UI update — 2026-10-22

- Updated the landing page to Sky’s Playground with two mobile columns; supplied artwork is used for the favicon, touch icons and install manifests.
- Added one labelled, 44px-minimum All games control per game. Checked layouts at 320, 375, 430, 600, 768, 1024 and 1440px.
- Added press ripples, selection/check feedback, result reveals and reduced-motion fallbacks while preserving board dimensions and contact-time activation.
- Verified wrong-selection vibration calls with an emulated vibration API, and verified gameplay when that API is unavailable. Physical-device vibration remains browser/device dependent.
- Updated both service-worker cache versions and cached the shared styles/scripts; retained independent score keys and cache prefixes.
- Dev servers now serve the whole playground and block hidden files; README URLs and optional QA defaults match the game subpaths.
- Final regression results: **11 unit tests, 18 original-game browser checks, 19 ordered-game browser checks, 17 immediate-touch checks, 17 shared-UI checks and 18 PWA checks passed**. Six additional local-server route checks passed. Visual screenshots were captured after entrance animations completed.

## Ordered modes update — 2026-10-22

- **10 unit tests passed:** ascending/descending sequence validation, all 62 distinct alphanumeric symbols in `0–9, A, a, B, b … Z, z` order and its reverse, 8×8 resets, random colour-key generation, group selection in arbitrary tile order, duplicate rejection, precise final-input timing, storage validation, and new-category isolation with legacy-score preservation.
- **34 browser checks passed:** every one of the 20 challenge categories, locked setup controls during play, symbol/colour labels retained on disabled faded tiles with corner ticks, fixed cell geometry, results below the board, records across reload, keyboard input, touch input and unsupported storage.
- Checked the 26-letter, 62-symbol and colour boards at 320/375/600/768/1024/1440px. The 8×8 board fits without horizontal scrolling, with cells at least 24px wide at the smallest tested viewport.
- **9 PWA checks passed:** Chrome installability, all 20 challenge combinations playable after an offline reload, fresh offline tab launch, independent caches and persisted scores. The updated service worker reloads assets during installation to avoid stale HTTP-cache copies.
- Checked all eight palette backgrounds against white labels: each exceeds 4.5:1 contrast. Named colours and a numbered reference key accompany the swatches; current/cleared steps also have accessible status labels.
- Screenshots reviewed: mobile 8×8 layout, colour play with a cleared group, and the retained ticked board above completion results. Real-device vibration and screen-reader sessions were not performed; automated touch testing uses Chrome emulation.

## Shared number-and-letter order — 2026-10-22

- Replaced the 62-symbol challenge with 26 shared positions. Each position appears once, randomly as a number, lowercase letter or uppercase letter (`1 = A = a`, …, `26 = Z = z`). Both directions follow these positions; each round includes all three forms.
- **11 unit tests passed:** the exact `1 → b → 3 → 4 → e → F → 7` example and its reverse, wrong/repeated input rejection, 26-tile resets, mixed forms under extreme random draws, and separate new leaderboards that preserve earlier 62-symbol scores through saving/reloading. Existing numeric, alphabet, colour, timing and storage tests also pass.
- **34 browser checks passed:** all 20 current challenges, shared numeric/alphabet ranks, 26 interactive tiles plus ten blank cells, unchanged previewed forms on Start, fixed cell geometry, retained ticked labels, keyboard/touch input, responsive layouts at 320/375/600/768/1024/1440px, persisted records and no uncaught errors.
- **9 PWA checks passed:** installation, all 20 challenges after an offline reload, persisted offline scores, fresh offline launch and cache isolation. The service-worker cache version is v4.
- Reviewed the 320px mixed-symbol layout and the completed desktop board. All changes are confined to `grid-rush-in-order/`; no dependencies were added. Touch verification uses Chrome emulation, rather than a physical device.

## Colour contrast update — 2026-10-22

- Random colour rounds choose from three reviewed four-colour combinations, then shuffle the key. The eight-colour pool remains available across rounds; similar shades are kept apart. Gold and teal are lighter and use dark labels, with white labels on the other six colours.
- The requested label/background minimum is **3:1**. Active palette pairs measure 5.61–11.35:1. Cleared tiles retain their colour, labels and ticks at 75% opacity, giving at least 3.42:1 over the white board. The colour cue stays opaque during its movement animation; bright tiles, swatches and cues have visible borders, and keyboard focus uses the contrasting label colour.
- **13 unit tests passed:** includes independent sRGB luminance checks and a 0.18 minimum Oklab-distance guardrail between colours in generated rounds. The distance guardrail is a product choice, not a WCAG contrast ratio or a guarantee of colour-vision accessibility. Visible colour names continue to provide an alternative to hue.
- **34 browser checks passed:** includes rendered label/background contrast before and after clearing every colour-grid size, stable geometry, preserved labels, keyboard/touch play, responsive layouts and no uncaught errors. Reviewed desktop colour play and the 320px colour layout.
- **9 PWA checks passed:** installation and all 20 challenge categories offline, fresh offline launch, cache isolation and persisted records. Cache version is v5. No application dependencies or other games were changed.

## Signed number range — 2026-10-22

- Added **Number range**, sampling unique integers from −999 through 999 inclusive for 3×3, 4×4, 5×5 and 6×6 grids. Smallest-to-largest and largest-to-smallest use numeric comparison, including negative values and zero. Starting preserves the previewed set; replay/reset samples a fresh set.
- Added eight separate record categories, bringing the current challenge count to 28. Existing score keys, archived 62-symbol scores, the original number mode and Google Tag Manager snippets are preserved.
- **15 unit tests passed:** signed numeric order in both directions, zero, inclusive endpoints, uniqueness under repeated random draws, every grid size, timer/reset behaviour and independent top-three records, plus the existing game, colour-contrast and storage checks.
- **43 browser checks passed:** all 28 challenges, eight signed-number combinations, wrong/repeated clicks, retained labels/ticks, stopped timing, mouse/keyboard/touch play and persisted scores. Worst-case `−999` text fits every grid size at 320/375/600/768/1024/1440px without horizontal scrolling or changes to cell geometry.
- **9 PWA checks passed:** installation, all 28 challenges after an offline reload, fresh offline launch, cache isolation and persisted records. Cache version is v7. Automated sessions suppress analytics requests.
- Reviewed signed-number screenshots at 320px and 768px. Labels use a clear minus sign, accessible negative-number names and fonts that scale with board width. No dependencies or other game files were changed. Touch tests use Chrome emulation; a physical device and screen reader were not used.

## Shared spring interaction update — 2026-10-22

- Shared magnetic controls, spring selection outlines, label/result feedback, native card expansion and gesture-driven install sheets now apply to this game. Active cells retain fixed geometry and immediate touch activation. Reduced motion and native keyboard/button alternatives remain available.
- Re-ran **15 ordered unit tests, 43 ordered browser checks and 9 ordered PWA checks**, including every signed-number, letter, mixed-symbol and colour challenge. Cleared colour labels retain the requested 3:1 minimum contrast. The v8 service worker caches `../grid-rush/src/motion.js` alongside the shared UI module/styles.
- Full playground motion, touch, accessibility-related behavior and offline regression results are recorded in [the shared verification log](../grid-rush/VERIFICATION.md#spring-interaction-update--2026-10-22). No gameplay or record-format changes were needed.
