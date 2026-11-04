# Frogger Jump tasks

Updated: 2026-11-04

## Completed in this continuation

- [x] Replace the single pending-result slot with an account-scoped queue; accept legacy saves automatically.
- [x] Keep another account's pending score when switching accounts or settling a new score.
- [x] Share simultaneous retries for the same run and settle the current account's queue before replay.
- [x] Prevent a delayed settlement response from replacing another account's wallet in the UI.
- [x] Preserve results after temporary connection/authentication failures; discard only confirmed missing/replaced runs.
- [x] Show replay synchronization failures inside the open results dialog.
- [x] Update the offline cache to include the queue module.
- [x] Pass 49 logic tests, browser synchronization checks, and all five animal/shop regressions.
- [x] Build all 24 production pages and pass source/built metadata checks.
- [x] Pass production gameplay checks at 320×568 and 812×375, including hazards, pause/resume, replay, records, and idle rendering.

## Latest-main integration

- [x] Pull upstream `main` at `3e93afa`, resolve overlaps and preserve the local updates.
- [x] Retain platform bonus coins through queue save/reload and settlement.
- [x] Pass all 72 logic tests, browser sync regression, 25-page production build and built metadata checks.

## Compact controls, airborne fish and starmouse · 2026-11-03

- [x] Run charging at 30 fps while keeping flight at 60 fps and exact-clock power release.
- [x] Add bounded gameplay-pose and shared portrait caches.
- [x] Give names 10px separation from world ranks; shorten shop/rank actions and the skill control.
- [x] Return the skill button to the lower controls next to Hold.
- [x] Remove rain and rainbow artwork and animation; retain occasional static sunshine.
- [x] Add advance warning and a high fish leap between pads, swept midair collision and immediate capture.
- [x] Preserve fish warning/leap timing during pause and hidden-page pauses.
- [x] Set Fox to 960 and Capybara to 1,000 Frog Coins; preserve existing unlocks.
- [x] Add original Mochi starmouse at 1,080, with one-hop Star courage fish protection.
- [x] Match the eleven-animal price/species contract in Firestore rules and expand the emulator fixture.
- [x] Pass 81 logic checks, all eleven animal/skill/reward checks, and four-size fish/shield/shop/layout checks.
- [x] Pass the 25-page release build, source/built metadata checks and production performance budgets.
- [x] Pass final production gameplay at four sizes, with 22 seeded landings each, fish timing, hazards, pause/background recovery, replay and stored records.

## Complete weather removal · 2026-11-03

- [x] Remove all drizzle, sunshine and post-rain rainbow overlays, styles and lifecycle calls.
- [x] Delete the weather scheduler and its obsolete tests; remove the module from the offline preload list.
- [x] Bump the source worker to v25 and update documentation/browser assertions.
- [x] Pass all 77 remaining logic tests, 25-page build/metadata checks and a 90-second no-weather browser smoke check with pause/resume.

## Chiikawa-inspired comic friends · 2026-11-03

- [x] Add separate Chiikawa, Hachiware and Usagi catalog entries with recognizable round-ear, blue/white-cat and long-ear manga artwork.
- [x] Share cached portraits and animated charge/jump/landing poses across shop, player, skills and rankings.
- [x] Add Courage cheer (1,200), Friendship bridge (1,360) and Yaha bounce (1,520), preserving the prior animals and prices.
- [x] Extend exact-price/species/owned-collection Firestore rules to fourteen animals.
- [x] Pass 82 logic tests, all fourteen source animal/skill/coin flows and the 25-page production build/metadata checks.
- [x] Pass the three new animals in the production build and four-size shop/rank checks, including their leaderboard portraits.

## Player profile rows and island cast · 2026-11-04

- [x] Put the selected animal and player name on one identity row, with personal world rank in its own row below.
- [x] Preserve account/practice notes, wallet placement and long-name overflow handling.
- [x] Add Kurimanju, Rakko, Momonga, Shisa, Shimajiro, Mermaid, Hitoha and Futaba as eight selectable characters, with distinct portraits and skills.
- [x] Keep Hitoha and Futaba separate and distinguish them by one/two head leaves; use the Siren-inspired interpretation for Mermaid.
- [x] Share existing sprite/portrait caches, animation poses, skills/rewards, player/rank icons and wallet persistence.
- [x] Extend the catalog/price/rules/owned-collection contract to 22 characters and update purchase fixtures.
- [x] Pass 91 logic tests, all eight source character flows, four-size shop/rank checks and three-size signed-in profile/rank regressions.
- [x] Build the 25-page production release and pass source/built metadata checks.
- [x] Pass all eight new character flows in the production build and four-size production-markup profile/rank checks, including the new two-row layout.

## Remaining

- [ ] Run the expanded Firestore emulator security harness. Previous verification recorded an emulator download restriction; these tests are not certified as passing.
- [ ] Publish the updated 22-character Firestore rules and verify live purchases for the comic friends and the updated Fox/Capybara/Starmouse prices. Confirm Email/Password Auth and ranking index in the configured Firebase project.
- [ ] Verify real cloud registration, unique-name collisions, purchases, offline retry, and cross-device rankings against the configured backend.
- [ ] Test touch controls, background/resume, and installed/offline play on physical iOS and Android devices.
- [ ] Exercise simultaneous results in separate browser tabs; this continuation shares requests within one page and does not add cross-tab queue coordination.

See [VERIFICATION.md](VERIFICATION.md) for evidence and [FIREBASE.md](FIREBASE.md) for backend setup and emulator commands.

## Performance update — 2026-11-04

- [x] Independent static-water layer, stable special-pad bitmaps with live turtle positions.
- [x] Bounded LRU animal poses and reuse across same-DPR resizes.
- [x] Combined power-meter styles;128→96 charging HUD mutations per benchmark second.
- [x]96 engine/render tests,7 platform UI flows,4 viewports with73 hops each and production performance budgets.
