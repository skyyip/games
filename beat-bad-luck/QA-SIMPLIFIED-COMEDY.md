# Simplified comedy ritual acceptance · 2026-10-27

- `npm test`: **128 passed**, zero failures. Retired signature-recipe tests now exercise the unified system; economy, durability, gestures, save migration, privacy, backup and audio coverage remain.
- Full browser rituals: **320×568 Traditional Chinese**, **390×844 English**, **812×375 Traditional Chinese / reduced motion**, **1440×900 English**. Tested source and hashed production output.
- Real hits charge the 2/3/4 meter, launch two automatic shows, and spend inventory once. Early optional taps are harmless; a lit-window tap awards once. User pause and the cinematic retain time/combo. Bare hands, the 3000-tool comb, beauty mirror and fire wheels work through results and reload.
- Event appearance/completion keeps the paper target geometry unchanged. The event control stays still while its artwork moves. When explicitly enabled, exactly one random event appears; a patron cameo follows the first successful rescue when owned.
- All **nine** event controls tested with native taps or swipes. One action succeeds and rewards once. Repeated frames never repeat the award.
- One-tap tiger feeding works. A separate full ritual tests actual manual blood dipping and smearing, the optional multiplier-adjusted bonus, combined blessing and one sacred cast. Failed blocks automatically retry without a second click in the multi-viewport checks.
- The three-act papers, helmeted-cat chase and meatball enthronement were visually inspected. Beauty’s payoff smiles at its mirror; blades show three papers. Titles, captions and optional controls fit in portrait and landscape.
- The appeal story advances despite missed bonus goals. The first final chapter grants a visible clock-off seal with a thirty-day lifetime; reload preserves it. Unit tests reject duplicate receipts and replay gifts, verify shop unlocking, replacement and old-save migration, and whitelist forty ending IDs.
- Buying a new paper requires confirmation; cancellation leaves ownership unchanged. Confirmed paper use decrements once after a scored ritual.
- Production site builder publishes 20 pages with content hashes for JS/CSS/images/fonts. Existing unrelated shared translation duplicate-key warnings remain outside this change. Source offline cache is v68 and includes all new modules/styles.

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
