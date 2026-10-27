# Freestyle gesture scoring acceptance · 2026-10-28

- `npm test`: **127 passed**, zero failures. Every supported gesture scores immediately and between ambient beats. Base points are Pinch 50 > Circle 40 > Rub 30 > Swipe 20 > Tap 10, independent of timing and effort. Existing combo, worry, kit and paper modifiers remain. Optional on-beat recognition contributes to rhythm achievements without gating input or multiplying base points.
- Combo grace is **1,500 ms**, inclusive: the next scored gesture at 1,500 ms continues the chain; at 1,501 ms it starts a new chain. Only active play time counts. Unfinished charge resets after a longer gap, while earned points and an earned finisher stay available. At 99 hits launch remains disabled; at 100 it unlocks. Each ritual still allows one finisher and 68 active seconds.
- Four production full rituals passed at 320×568 Chinese, 390×844 English with optional events, 812×375 Chinese/reduced motion and 1440×900 English/reduced motion during the freestyle rollout. A final 320×568 run repeats all five native gestures, the 100-hit unlock, paused cinematic, 1.5-second combo expiry, all six steps, inventory consumption once, rewards and persisted reload after the timing adjustment.
- Required gesture/countdown UI is removed. A static, bilingual score guide replaces it; lower gesture hints remain read-only and keep their compact labels. Home, pause, finisher help and accessible instructions describe free choice and the 1.5-second combo rule. Screenshots were checked for overlap and horizontal overflow.
- Source offline cache is **v72**. Production build creates 20 pages with content hashes for JS/CSS/images/fonts. Canonical check: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright BEAT_BAD_LUCK_URL=http://localhost:5213/beat-bad-luck/ node scripts/freestyle-ritual-check.mjs`.

## Previous rhythm-guided implementation (historical; required cues removed)

Rhythm-guided ritual acceptance · 2026-10-27

- `npm test`: **127 passed**, zero failures. Replaced retired freestyle/two-finisher assertions with timing, instruction matching, duplicate prevention, combo reset and once-only unlock checks; economy, inventory, saves, privacy, audio and story coverage remain.
- Generated 68-second rounds use 108 BPM, preview the next gesture and reserve two beats for complex moves. Random-plan property checks verify all five gestures, nonoverlapping inclusive ±190 ms windows and enough cues to reach 100. All sixty kits exercise the real 100-cue path and their multiplier exactly once.
- Matching one cue scores once; wrong, early and missed cues cannot build charge. Misses reset unfinished progress. At 99 the finisher stays disabled; at 100 it unlocks and stays earned. The one allowed performance pauses cue/event/round clocks and retains the combo; the optional nice tap pays once.
- Hashed production full rituals pass at **320×568 Chinese**, **390×844 English with optional events**, **812×375 Chinese / reduced motion**, and **1440×900 English / reduced motion**. Real pointer gestures drive 100 cues; desktop uses the documented P key for pinch. Each run checks invalid-input inventory protection, the 99/100 boundary, one cinematic with user pause, all six steps, result rewards and reload.
- Pause action labels are **15px** (+25%); final auspicious-card body copy is **12.48px** (+20%). Search inputs fill the row beside the filter, stay at 16px and do not trigger focus zoom. The raised neighbour button overrides the last tab, selects Stories and aligns its chapter heading below the sticky navigation.
- Chinese step labels are **奉神** and **打杯**. Original smiling-stove, cheering-grain and green-horse-taxi vectors replace blessing emoji props. Portrait and landscape views were visually inspected; the landscape grid keeps every prop separate and the tiger face clear. Source cache is **v71**; all production JS/CSS/images/fonts are hashed.
- Canonical browser command: `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright BEAT_BAD_LUCK_URL=http://localhost:5210/beat-bad-luck/ node scripts/rhythm-ritual-check.mjs`. Historical browser scripts below exercise earlier mechanics.

## Previous freestyle implementation (historical; superseded scoring and two-finisher rules)

- `npm test`: **128 passed**, zero failures. Retired signature-recipe tests now exercise the unified system; economy, durability, gestures, save migration, privacy, backup and audio coverage remain.
- Full browser rituals: **320×568 Traditional Chinese**, **390×844 English**, **812×375 Traditional Chinese / reduced motion**, **1440×900 English**. Tested source and hashed production output.
- Real hits charge the 2/3/4 meter, launch two automatic shows, and spend inventory once. Early optional taps are harmless; a lit-window tap awards once. User pause and the cinematic retain time/combo. Bare hands, the 3000-tool comb, beauty mirror and fire wheels work through results and reload.
- Event appearance/completion keeps the paper target geometry unchanged. The event control stays still while its artwork moves. When explicitly enabled, exactly one random event appears; a patron cameo follows the first successful rescue when owned.
- All **nine** event controls tested with native taps or swipes. One action succeeds and rewards once. Repeated frames never repeat the award.
- One-tap tiger feeding works. A separate full ritual tests actual manual blood dipping and smearing, the optional multiplier-adjusted bonus, combined blessing and one sacred cast. Failed blocks automatically retry without a second click in the multi-viewport checks.
- The three-act papers, helmeted-cat chase and meatball enthronement were visually inspected. Beauty’s payoff smiles at its mirror; blades show three papers. Titles, captions and optional controls fit in portrait and landscape.
- The appeal story advances despite missed bonus goals. The first final chapter grants a visible clock-off seal with a thirty-day lifetime; reload preserves it. Unit tests reject duplicate receipts and replay gifts, verify shop unlocking, replacement and old-save migration, and whitelist forty ending IDs.
- Buying a new paper requires confirmation; cancellation leaves ownership unchanged. Confirmed paper use decrements once after a scored ritual.
- Production site builder publishes 20 pages with content hashes for JS/CSS/images/fonts. Existing unrelated shared translation duplicate-key warnings remain outside this change. Source offline cache is v70 and includes all new modules/styles.

Stall refresh: all decoration base costs decrease by 300; every paid paper multiplier increases by 0.3, while free plain paper remains ×1. New native touch/mouse and keyboard checks cover direct stall ordering, saved order/reload, price/coupon calculations, smaller art, stable detail typography, animated open/close/Escape and purchase hand-offs, highlighted titles/selection, intermediate wallet count values and all six requested chants through full rituals. The old layout tab migrates to Stories while decoration order is retained.

Hint-row follow-up: restored five read-only gesture labels below the paper. Four portrait/landscape/desktop layouts verify all five are visible on one row, tapping them awards no score or charge, and they stay clear of the arena and Master dialogue. The narrow finisher meter uses separate label/count lines to prevent vertical text.

Opt-in follow-up: random challenge events default off for fresh, legacy and malformed preferences. A native checkbox above Start remembers explicit choices. Full Chinese/English mobile rituals verify no event by default, story progression without challenges, one event after opt-in, persisted opt-out, and no carry-over between rituals. The game and personality models independently default off.

Duration follow-up: whacking now lasts exactly 68 active seconds. Late rhythm prompts fit before the deadline, with a final circle at 61 seconds and heavy prompt at 65 seconds. Pause and cinematic time remain excluded from the countdown.

Single-event follow-up: each ritual now schedules one random event at 18 active seconds. The former second event never appears, and its single-round title/story targets now require one rescue. Existing title IDs and earned progress are preserved.

Gesture follow-up: long-press/release no longer scores or charges, and its hint is removed. Both circle directions share one hint and the same rhythm prompts. Former hold weaknesses/prompts now use supported swipes/rubbing. Unit and native browser checks cover both changes.

Commands:

```sh
npm test
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-comedy-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-interactions-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/event-optin-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/gesture-hints-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/stall-refresh-check.mjs
```

Set `BEAT_BAD_LUCK_URL` for the production server. Browser checks use Chromium mobile emulation; physical iOS/Android hardware was not available. No preview export or deployment is part of this change.

Screen-comedy paper expansion: seven original vector costumes follow the fifteen existing paid looks (23 total including free plain paper). Verify all seven prices/final bonuses, affordability/coupon consumption, ten-use expiry/repurchase, save migration and actual hit scoring. Source-browser purchase checks pass at 320×568 Chinese, 390×844 English and 812×375 Chinese/reduced motion: cancellation does not spend, all seven purchases select/save correctly, card height stays fixed, selected names/bonuses/uses meet 4.5:1 contrast and valid SVG props react on a scored hit. Hashed production checks repeat purchases at 320×568 and 812×375; full 320 Chinese/Crow and 390 English/Aobai rituals cover both finishers, a stable opt-in event, blessing, results, inventory and reload. Artwork, battle layout and settled confirmation dialogs were visually inspected. The actor homage refers only to screen roles; two unverified real-person negative labels use original fictional replacements. Free plain paper remains ×1.

Selection/update/shortcut polish: 128 unit tests pass with every paid-paper bonus increased by exactly 0.2 and free plain paper retained at ×1. Hashed production browser checks at 320×568 Chinese, 390×844 English and 812×375 Chinese/reduced motion simulate the actual release-detection prompt and verify its 21.6px title, exactly one selected-card glint, changing stroke offsets, unchanged card geometry, pointer transparency, >=4.5:1 selected-copy contrast, purchase-preview bonuses and reloaded selection. The reduced-motion highlight stays static. Gold/mint shortcut buttons retain enlarged labels, original SVG icons, >=68px touch heights and working tab navigation. A complete 390px production ritual passes with the updated Aobai multiplier, both finishers, one optional event, final reward and saved durability. Prompt, shortcut and selected-card screenshots were visually inspected.

Stall control follow-up: production browser checks pass at 320×568 Chinese, 390×844 English and 812×375 Chinese/reduced motion. Explicit 22px level cells, centred 20px dialog close SVG and centred drag SVG are verified geometrically. The drag frame/icon are 40% smaller while the 32px touch target retains real native-touch rearranging and saved order. Decoration art is 15% smaller (scale 0.816). Upgrade prices have >=4.5:1 contrast on enabled gold and disabled muted backgrounds; insufficient-funds pricing remains opaque. Native detail open/close, upgrade-to-purchase hand-off and cancellation work. The mobile shelf and portrait/landscape dialog were visually inspected.

Intro and sticky tabs: 128 unit tests pass. Hashed production browser checks cover 320×568 Chinese/English, 390×844 Chinese/English, 812×375 Chinese/reduced motion and 1440×900 English/reduced motion. Both intro columns share all available width, titles stay on two lines and mobile duration spans the full row. Both real tab lists pin to the viewport, remain reachable and stay within their content sections without covering records. Every neighbourhood/collection tab, keyboard arrow navigation and the kit shortcut work; collection navigation returns to its natural section start while respecting the shared scroll padding. Filters remain static. Intro and sticky-row screenshots were visually inspected; no horizontal overflow or runtime errors occurred.
