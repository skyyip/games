# Simplified comedy ritual acceptance · 2026-10-27

- `npm test`: **115 passed**, zero failures. Retired signature-recipe tests now exercise the unified system; economy, durability, gestures, save migration, privacy, backup and audio coverage remain.
- Full browser rituals: **320×568 Traditional Chinese**, **390×844 English**, **812×375 Traditional Chinese / reduced motion**, **1440×900 English**. Tested source and hashed production output.
- Real hits charge the 2/3/4 meter, launch two automatic shows, and spend inventory once. Early optional taps are harmless; a lit-window tap awards once. User pause and the cinematic retain time/combo. Bare hands, the 3000-tool comb, beauty mirror and fire wheels work through results and reload.
- Event appearance/completion keeps the paper target geometry unchanged. The event control stays still while its artwork moves. Exactly two events appear; a patron cameo follows the first successful rescue when owned.
- All **nine** event controls tested with native taps or swipes. One action succeeds and rewards once. Repeated frames never repeat the award.
- One-tap tiger feeding works. A separate full ritual tests actual manual blood dipping and smearing, the optional multiplier-adjusted bonus, combined blessing and one sacred cast. Failed blocks automatically retry without a second click in the multi-viewport checks.
- The three-act papers, helmeted-cat chase and meatball enthronement were visually inspected. Beauty’s payoff smiles at its mirror; blades show three papers. Titles, captions and optional controls fit in portrait and landscape.
- The appeal story advances despite missed bonus goals. The first final chapter grants a visible clock-off seal with a thirty-day lifetime; reload preserves it. Unit tests reject duplicate receipts and replay gifts, verify shop unlocking, replacement and old-save migration, and whitelist forty ending IDs.
- Buying a new paper requires confirmation; cancellation leaves ownership unchanged. Confirmed paper use decrements once after a scored ritual.
- Production site builder publishes 20 pages with content hashes for JS/CSS/images/fonts. Existing unrelated shared translation duplicate-key warnings remain outside this change. Source offline cache is v61 and includes all new modules/styles.

Gesture follow-up: long-press/release no longer scores or charges, and its hint is removed. Both circle directions share one hint and the same rhythm prompts. Former hold weaknesses/prompts now use supported swipes/rubbing. Unit and native browser checks cover both changes.

Commands:

```sh
npm test
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-comedy-check.mjs
GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/simple-interactions-check.mjs
```

Set `BEAT_BAD_LUCK_URL` for the production server. Browser checks use Chromium mobile emulation; physical iOS/Android hardware was not available. No preview export or deployment is part of this change.
