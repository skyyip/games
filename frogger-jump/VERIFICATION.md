# River friends / Firebase interface verification · 2026-11-02

## Player profile rows and island cast · 2026-11-04

- The player animal and name now share a single identity row. The world rank occupies its own row below the whole identity row, rather than sharing an icon spanning multiple lines. Account/practice notes stay separate; long names remain one line with their complete text retained in the DOM.
- Eight additions bring the roster to **22**: Kurimanju, Rakko, Momonga, Shisa, Shimajiro (味自慢大叔), Mermaid, Hitoha and Futaba. Hitoha/Futaba are separate one-/two-leaf grey islanders. Mermaid uses the black/white-head, red-tail Siren interpretation. Reference links are recorded in the README; the game renders its own Canvas art and fetches no source-site artwork.
- **91 logic tests pass**, including each new skill's hazard/target behavior, current-deadline preservation or rescue, a real Momonga fish-shield collision, Futaba's thorn skip, all eight exact-price purchase/reload/settlement flows and the 22-species Firestore contract.
- All eight source-browser character flows pass: shared icon/sprite, charge/jump/landing, one skill charge, exactly-once coin award and saved selection. Four-size shop/rank fixtures pass for 22 characters, exact purchases, all eight new leaderboard portraits, readable controls and no horizontal overflow. Shop artwork for all eight plus representative in-play poses were inspected.
- Source account/rank fixture passes at 320×568, 390×844 and 812×375, explicitly asserting aligned animal/name centres, a separate lower rank row, cached rank reads, best refresh, error/retry, logout and stale-account protection. The 320px signed-in profile screenshot was inspected.
- Source worker **v27** preloads the new island-art module. The **25-page production build** and source/built metadata checks pass. No weather module or animation is reintroduced.
- Final production validation passes all eight new character/skill/landing/reward flows plus purchase/reload persistence. The production-markup account/rank fixture passes at all four sizes, including 1280×900, with the identity-row and separate-rank-row assertions. Firebase is disabled or mocked in these fixtures.
- The Firestore collection/species/price contract supports all 22 characters; the complete-collection emulator fixture uses a catalog-derived test balance. No live cloud purchase, emulator certification or rules deployment is claimed. Updated rules must be published for cloud purchases.


## Chiikawa-inspired comic friends · 2026-11-03

- Added Chiikawa / 小可愛 (1,200 Frog Coins), Hachiware / 小八 (1,360) and Usagi / 烏薩奇 (1,520) as separate animals. The original round-eared hamster and existing cat/bunny remain available. Canvas artwork uses white round ears, a blue/white split cat face and cream long rabbit ears, with manga cheeks, expressions and shared animated limbs.
- **82 logic tests pass**, including Courage cheer's real airborne fish block and thorn-skip target, Friendship bridge clearing both upcoming pads while preserving a live current deadline, Usagi rescuing a timed current pad and widening the actual thorn-skip target, and exact-price purchase/reload/settlement for all three.
- All **fourteen** animals pass the source-browser sprite, skill, landing, exactly-once reward and purchase/reload regression. Shop artwork and charge/jump screenshots for the new three were visually inspected, including Usagi's ears and the head-level power meter. Source and built metadata checks and the **25-page production build** pass. Source worker is **v26**.
- The generated production build passes all three new animal/skill/landing/reward flows and shop persistence. The four-size shop/rank fixture passes at 320×568, 390×844, 812×375 and 1280×900, with exact purchases, readable dialogs, no horizontal overflow and an asserted leaderboard portrait for each new animal. Firebase is disabled/mocked in these fixtures.
- The Firestore species list, price map and owned-collection limit now support fourteen animals. The catalog/rules contract passes locally; no emulator certification, live cloud purchases or rule deployment is claimed. Publish the updated rules before releasing cloud purchases of the new three.


## Complete weather removal · 2026-11-03

- Removed all weather overlays, sunshine artwork/styles, application lifecycle calls, the weather module and its boundary timer. Source worker **v25** no longer preloads it.
- Removed four obsolete weather tests. All **77 remaining logic tests**, the 25-page production build, built metadata and whitespace checks pass.
- Chromium smoke check confirms no weather layers return after 90 simulated seconds of play and that pause/resume still works, with no runtime errors.


## Compact controls, airborne fish and original starmouse · 2026-11-03

- **81 Node tests pass.** Coverage includes the 1.2-second advance fish warning, midpoint/high arc, pre-landing collisions, delayed-frame swept collision, safe early/late crossing, standing-player safety, pause freezing, one-hop shield consumption, skill-based fish removal, eleven-animal wallet/rules consistency, cached pose reuse and cache bounds.
- Actual game/controller browser checks pass at **320×568, 390×844, 812×375 (reduced motion) and 1280×900**: no rain/rainbow layers, compact action heights, name/rank spacing, skill next to Hold, paused warning, fish in midair, immediate capture, and Mochi's shield followed by a scored landing. This isolated source harness injects only an instance hook; it disables Firebase and leaves the game input, timing, renderer and collision code intact. Screenshots of warning/leap/capture/shield, new character artwork and mobile controls were inspected.
- All **eleven** animals pass real-browser sprite, skill, landing, exactly-once reward and reload/purchase checks. Four-size shop/ranking checks verify the new exact prices, affordable/insufficient states, scrollable dialogs and no horizontal overflow. Rank fixtures are local.
- Matched source measurements use the same 390×844 static-route/one-second charge workload and fake clock as the baseline:

| Measurement | Before | After |
| --- | ---: | ---: |
| Charging draws / simulated second | 63 | 31 |
| Charging HUD attribute mutations | 252 | 124 |
| Charging gradient creations | 63 | 18 |
| Moving-idle gradient creations / second | 31 | 0 |
| Static idle and paused frame callbacks | 0 | 0 |

- The production budget check passes: 32 charging draws/second in that run, zero static-idle/paused callbacks, 31 moving-idle callbacks/second, approximately two million maximum Canvas backing pixels, and deferred Firestore loading (466,875 initial decoded script bytes; 1,032,070 after opening the board). These are simulated local Chromium workload measurements, not physical-device battery/FPS measurements. Charge power uses the current game clock even between painted frames.
- Gameplay caches hold at most 48 pose sprites per scene; shared portraits hold at most 48 species/size/display-scale variants. Source worker **v24** preloads the shared fish-path module. The **25-page build** and source/built metadata checks pass.
- Final production gameplay passes at all four sizes above: **22 seeded mixed-route landings per viewport**, safe timing around fish, small/sinking/thorn platforms, keyboard/touch, pause/resume and background recovery, immediate crocodile capture, replay, stored records and idle frame suspension.
- **Cloud release dependency:** publish the changed Firestore species/collection/price rules before cloud purchases use Fox 960, Capybara 1,000 and Starmouse 1,080. Existing owned animals remain owned. Local tests verify the catalog/rules contract; the expanded emulator harness and real cloud purchase flow are not certified by this update. No Firebase rules or production settings were deployed.


## Latest-main integration · 2026-11-03

- Fast-forwarded to upstream `3e93afa` and restored the local pending-result work, resolving overlaps in app startup, player state and the source worker.
- Preserved upstream authentication, world ranks, weather, shared animal icons and platform bonus rewards. Pending-result migration now retains and validates `bonusCoins` as well.
- All **72 Node tests**, the isolated Chromium sync regression, the **25-page production build** and built metadata validation pass after integration. Source worker is **v23**, retaining every upstream cached module plus `pending.js`.


## Pending-result reliability update · 2026-11-03

- **49 Node tests pass**, including seven new queue regressions: legacy-save migration, invalid/duplicate saves, concurrent retries, account isolation, retryable failures, permanent run failures, and results added during an in-flight settlement.
- `scripts/sync-check.mjs` passes in Chromium against source with the cloud module replaced at the network boundary. It verifies shared retries, account switching during settlement, persisted per-account queues, settlement before replay, and preservation of another account's result. It does not contact Firebase or certify live cloud behavior.
- Source browser checks pass for all five animals: skill consumption, jump/landing, exactly-once local rewards, exact-price purchases, insufficient funds, and selection persistence after reload.
- The 24-page production build passes, with source and built metadata checks passing. The build still reports pre-existing duplicate translation-key warnings in the shared translation file.
- Production gameplay passes at **320×568 Traditional Chinese** and **812×375 English/reduced motion**: 29 mixed-route landings per viewport, hazards, paused deadlines, splash/predator sequence, replay, saved records, and idle frame suspension.
- Source service-worker cache version is now v6 and includes `src/pending.js`. Cross-tab queue coordination and physical-device testing remain open in [TASKS.md](TASKS.md).

Reproduction additions (from the repository root, with Playwright configured):

```
node --test --test-isolation=none frogger-jump/tests/*.test.js
FROGGER_URL=http://localhost:5260/frogger-jump/ node frogger-jump/scripts/sync-check.mjs
```

## Passed

- **42 Node tests**: original jump/aim/pause/trap/record behavior, random wood/lily size variants, all five skills, safe charge cancellation, every-20-landings replenishment including a 1,000-use counter, normalized names, coin arithmetic, duplicate local settlement, exact-price animal purchase and wallet restoration.
- Production browser runs at **320×568**, **390×844**, **812×375** and **1280×900**, Traditional Chinese and English: required name entry, head-level tapered/color-changing meter with **no visible percentage**, 29 successful mixed-route hops, small/sinking/thorn/fish platforms, pause/background behavior, replay and saved records. Normal resting pads stop requesting animation frames.
- Explicit failure-stage assertions and screenshots confirm **splash before predator**, with the crocodile absent during the initial splash phase.
- All five animals tested individually in the browser: selected sprite, skill consumption, jump and landing on a lily, and exactly-once earned coins. A separate shop flow tests exact deductions, insufficient funds and selected-animal persistence after reload.
- Installed shared build reloads and plays offline; unavailable storage retains the current visit's record and produces a warning. The game stays hidden in landing cards and collection schema.
- Metadata/guide validation passes for all **24 pages**. Production build hashes scripts, CSS, fonts and images. `git diff --check` passes.

Reproduction commands (supply the environment's Playwright module with `GRID_RUSH_PLAYWRIGHT_MODULE` when needed):

```
node --test --test-isolation=none frogger-jump/tests/*.test.js
FROGGER_URL=http://localhost:5287/games/frogger-jump/ node frogger-jump/scripts/browser-check.mjs
FROGGER_URL=http://localhost:5287/games/frogger-jump/ node frogger-jump/scripts/platform-check.mjs
FROGGER_URL=http://localhost:5287/games/frogger-jump/ node frogger-jump/scripts/social-check.mjs
```

## Configuration activation · 2026-11-03

- Added the supplied web app settings and bumped the source service-worker version.
- Re-ran all **42** local logic tests, production build and 24-page built metadata checks successfully.
- Configured-UI browser smoke check passed: registration/sign-in forms, required input visibility, named local-practice fallback, game settlement and no runtime exceptions. No production account was created.
- Isolated guest/offline/storage regressions pass with an explicit null Firebase override, so those tests never accidentally write to the production project.
- Read-only probes for the Auth project configuration and public top-ten query were blocked by the execution environment's proxy: **Tunnel connection failed: 403 Forbidden**. This is not a Firebase response and does not prove the project settings are invalid. Live sign-in, rules/index status and remote ranking updates have not been confirmed.

## Firebase boundary — not a passed cloud deployment

The user supplied the public web configuration for **`sky-playground-3c5af` on 2026-11-03**. It is now configured in the client and enables the cloud sign-in/registration UI. The assistant has not created any production account, database or rule/index deployment. Whether the Email/Password provider, published rules and index are ready remains unverified from this environment. Local practice stays unranked with a separate wallet.

A **21-case security harness** is prepared for local Firebase emulators: atomic name reservation, case collisions, wallet privacy, unauthorized coin/animal changes, atomic run completion, duplicate payouts, other-user/forged scores, bounded public queries and exact-price purchases. It has **not passed or been certified**: downloading the required Firestore emulator JAR failed with **403 Domain forbidden** in this execution environment. It must be run after emulator access is available. See `FIREBASE.md` for activation and test commands.

The Firestore rules enforce ownership, transactional consistency, server-timestamp duration bounds and deterministic coin rewards; they do not perform trusted server-side replay of client physics. Browser tests use Chromium, not physical iOS/Android hardware.

## Seven-platform / Google UI update · 2026-11-03

- **49 local tests pass**, including sparse seven-kind generation over 20,000 platforms, one danger per visible trio, shared dynamic landing radii, turtle prediction/rider anchoring, paused duck sliding, 3.5-second ice and Penguin rescue, one-hop mushroom protection and bounded/idempotent centre coin rewards.
- Production gameplay checks pass at **320×568, 390×844, 812×375 and 1280×900**, in Chinese and English. Each profile completes **78 hops**, verifies mixed routes/hazards, mouse/keyboard/touch, pause, both predators, replay and records. Idle static scenes stop requesting animation frames.
- `scripts/new-pads-check.mjs` plays all **seven** variants through the real mobile UI, with screenshot inspection and exact bonus settlement. All five animals, skill use, shop deductions and reload persistence pass the existing social checks.
- Offline installed play, unavailable-storage fallback and hidden landing-page status pass.
- `scripts/google-ui-check.mjs` uses an explicitly **mocked Auth adapter**, with no production account access: popup cancellation recovery, first-login name reservation, returning wallet restoration, logout, small-phone/landscape forms and close-button visibility while scrolling.
- Production build and 24-page metadata checks pass. Source service worker is v6 and includes the new platform module.
- Google provider activation/authorized domains and publication of the updated bonus-aware Firestore rules are still Firebase Console tasks. **Live Google OAuth, cloud bonus acceptance and the expanded rules emulator suite have not been certified here.** The existing environment restriction on emulator downloads remains relevant. Rules preserve old zero-bonus receipts and now also bound integer platform bonuses to at most three per successful landing. The security harness adds excessive/fractional bonus rejection cases.

## Performance update · 2026-11-03

Compared the pre-optimization build (including the seven platforms/Google UI) against the optimized production build in the same Chromium environment. The rendering sample is a settled, wood-platform scene charged for one simulated second; the moving-idle sample includes a turtle.

| Measurement | Before | After |
| --- | ---: | ---: |
| Initial decoded JS, configured but signed out | 1,003,177 bytes | 440,119 bytes (−56.1%) |
| Gradient creations per rendered charging frame | 7 | 1 (−85.7%) |
| Moving-idle RAF callbacks per simulated second | 62 | 31 (−50%) |
| Moving-idle unchanged HUD attribute mutations | 105 | 0 |
| 1280×900 / DPR 3 Canvas backing pixels | 3,535,360 | 2,000,075 (−43.4%) |
| Static idle and paused animation callbacks | 0 | 0 |

After opening the leaderboard, script bytes rise from 440,119 to 1,005,314, confirming that Firestore is deferred rather than removed. Remote service requests are blocked in this measurement. Byte counts are decoded JavaScript, not gzip/Brotli transfer bytes. The fake-clock sample rendered 32 charging frames before versus 63 afterward; per-frame gradient counts distinguish cache savings from cadence changes. These are workload measurements, not real-device battery, thermal or FPS guarantees.

Validation passed: **54 Node tests**; unchanged-resize/pixel-budget/cache invalidation and three-sprite memory bounds; four browser viewports completing 78 mixed-route jumps each; seven real-UI platform/reward scenarios; five animal skill/shop flows; offline reload and unavailable-storage handling; mock Google Auth UI checks; production build and 24-page metadata validation. Native Google OAuth/production Firestore remain outside this local performance verification. Source service worker is v7.

## Password reset / Auth failure handling · 2026-11-03

- Added password-reset email requests in Chinese/English, native email validation without requiring a password, account-existence-neutral confirmation and a 60-second resend cooldown. Added a show/hide password button with bilingual accessible labels; closing the dialog or submitting/signing out conceals the value again.
- Preserved the exact Google disabled-provider error (`auth/operation-not-allowed`) and exposed safe error codes. User-provided error confirms the provider must be enabled in Firebase Console; no production project setting was changed here.
- Separated successful account authentication from failed cloud-profile loading, with retry and a guard against accidentally starting a guest run while a signed-in wallet is unavailable.
- Real cloud-adapter checks with a fake SDK pass for localized reset calls, non-disclosure of absent addresses, rate-limit forwarding, direct popup invocation, disabled-provider rejection and wallet-fetch failure/retry. No real email was sent.
- Auth UI checks pass at 320×568, 390×844 and 812×375 with mocked services; the 54 existing game/rendering tests pass. Source worker is v8.
## More river friends, golden Frog Coins and gentler landings · 2026-11-03

- Added Duckling (240), Tabby Cat (280), Panda (320), Fox (360) and Capybara (400), each with its own Canvas features and skill. Ten animals retain the existing shared charge, jump and landing animation. New friends restore from saved wallets and settle rewards normally.
- Replaced wallet/shop/result currency icons and the Canvas bonus popup with gold frog-face coins. Existing balances, purchase prices for old animals and reward calculations are preserved. Ranking artwork uses three metal cups and seven colored ribbons, with spoken rank labels; local top-three records use the same cups.
- Slight easing: normal radius 54 → 58; small radius 38–45 → 42–49; small candidate chance 12% → 9%; each base hazard candidate 6% → 5%; full charge 950 → 1,000ms. Existing trap timers, mixed I/Z paths, one-visible-danger limit and seven special pads remain.
- **59 Node checks pass**, including new skills, purchase/reload/settlement and the independently maintained Firestore species/price/collection-size contract. The emulator harness has expanded coverage for a full ten-animal collection, but the emulator suite was not executed and rules were not deployed here.
- Production Chromium: all ten animals complete a jump, use their skill and settle exactly once. All seven special pads, including centre coin bonuses, pass. Shop/rank fixtures pass at 320×568, 390×844, 812×375 and 1280×900 with no horizontal overflow or JavaScript errors; sample ranks are mocked and do not query/write production. Inspected screenshots of every new character, gold coin, ranking cups and head-level charge meters.
- Full gameplay regression passes on the same four viewports (56 seeded jumps each, thorn skips, fish pause/deadline, splash/predator, replay and persistent records). Repeated the small-phone flow and all animal/platform cases after the final charge-anchor/bonus-icon refinement.
- Performance budget checks pass: static idle and pause produce zero frame callbacks; moving idle uses 31 callbacks/second; charging uses one gradient per frame; large Canvas remains approximately two million backing pixels. No added perpetual animation or character-image downloads. These are local Chromium measurements, not physical-device thermal measurements.
- Source/build metadata checks pass for 25 pages, the production build passes, and source worker is v9 with the badge module preloaded. Game remains hidden on the landing page.
- **Cloud release dependency:** publish `frogger-jump/firestore.rules` to the configured Firebase project before players purchase/use new animals online. Live cloud purchase acceptance has not been verified; publishing the website does not publish these rules.
## Immediate crocodile and compact mobile layout · 2026-11-03

- Missed jumps now render a smaller, round comic crocodile with its mouth open on the first failed-landing frame. The selected animal drops into the mouth over 240ms, followed by a closing-jaw animation. Anglerfish traps retain their separate splash/bite sequence. Pause still uses the frozen game clock; no extra animation scheduler is added.
- Moved account/sign-in into the top-right header, arranged Animal Shop / World Top 10 in equal-width columns, removed the introductory slogan and kept the game title on one line. Updated Wallet / Sign in / World Rankings labels and the requested account/ranking descriptions.
- Result names stay on one line even at the supported maximum of 16 Chinese characters. Responsive text, trophy sizing and scoped confetti prevent horizontal overflow. Fixed a shared 25px brand rule that otherwise widened the 320px mobile layout and displaced the pause control.
- `scripts/compact-ui-check.mjs` passes at 320×568, 390×844, 812×375 and 1280×900. It checks actual viewport width (including mobile layout-viewport expansion), header entry placement, title/name line counts, action alignment, copy, and a crocodile paint before the old 420ms delay. Screenshots inspected in `/tmp/frogger-compact-ui/`.
- Full gameplay regression passes at the same four sizes: 56 seeded landings each, pause/resume, both predators, immediate crocodile capture, replay and saved records. All ten animal/skill/reward and shop persistence scenarios pass. Mock Auth UI regression passes at three phone/landscape sizes; no live sign-in or Firebase settings were changed.
- 59 Node tests, source/build metadata checks for 25 pages, release build and whitespace validation pass. Source worker is v10.
## Signed-in personal world rank · 2026-11-03

- Added personal ranking under the player name and in the world leaderboard dialog. Supports positions beyond ten, rank artwork, zero-score/unranked, loading and error/retry. Successful cloud result settlement invalidates the rank on a personal-best change; explicit leaderboard refresh updates it too. Ordinary renders/language changes reuse the one-minute cached result. No polling, animation loop or database write was added.
- Actual cloud adapter / fake SDK checks pass for first place, position 24, missing records, score/time/document-ID ties and rejected aggregate requests. Uses a server document snapshot and a single count query; does not download the full leaderboard.
- Real controller / mocked Auth+rank UI checks pass at 320×568, 390×844 and 812×375: login, rank outside top ten, modal summary, cache, personal best, trophy, retry, zero-score/no query, logout and stale response after account switching. Screenshots inspected in `/tmp/frogger-player-rank/`.
- Existing mocked Auth checks pass on three sizes and guest/mobile/crocodile checks on four sizes. All 59 Node checks, production build, 25-page metadata checks and whitespace checks pass. Source worker is v11.
- Rules now allow authenticated queries over public leaderboard rows for rank aggregation; anonymous queries remain capped at ten and private wallet/receipt restrictions are preserved. Security harness includes aggregate acceptance and anonymous rejection, but the emulator suite was not run. **Rules were not deployed and live production rank reads were not certified.** Publish the updated `firestore.rules` before release; no index definition change is required.
## Facebook / anonymous authentication · 2026-11-03

- Added Facebook and anonymous actions with bilingual labels, provider errors, anonymous nickname claim and session restoration. Anonymous profiles use the existing wallet/run/rank model; local practice stays unranked. Anonymous sessions can be upgraded with Google/Facebook popups or Email credentials while preserving UID and progress. Credential conflicts do not switch accounts, and anonymous sign-out asks for confirmation.
- Real cloud adapter / fake SDK checks pass: provider-not-ready, disabled Facebook/Anonymous, direct popup invocation, anonymous creation/reuse, social credential conflicts, same-UID Facebook/Email linking, unchanged wallet/animals, and protection against silently replacing an anonymous account with Email sign-in. Existing Google/reset adapter checks still pass. No production accounts, OAuth authorizations or emails were created.
- Real controller / mocked providers pass at 320×568, 390×844 and 812×375: failure/cancel recovery, duplicate nickname, anonymous claim/reload/world rank, linking to existing credentials, same-UID social/Email upgrades, anonymous logout cancel/confirm and readable scrollable controls. Fixed account-title/close-button overlap on the smallest phone. Screenshots inspected in `/tmp/frogger-providers-ui/`.
- Existing mocked Auth and rank UI checks pass on three sizes; guest/mobile gameplay checks pass on four. All 59 Node tests, production build, 25-page metadata and whitespace checks pass. Source worker is v12.
- **Live provider activation is pending:** enable Facebook and Anonymous in Firebase Authentication, configure the Meta app/redirect URI and ensure the website domain is authorized. No Firebase/Meta settings or rules were deployed here. The actual hosted Facebook/anonymous login has not been certified.
## Facebook sign-in removal · 2026-11-03

- Removed the Facebook login/link buttons, click handler, cloud adapter export, localized copy and styles. Current setup documentation now describes Google, Email and anonymous sign-in. Anonymous upgrades still preserve the UID through Google or Email. No accounts, wallets, scores or Firebase provider settings were deleted or changed.
- Updated existing provider fixtures to use Google and assert that the account dialog has no Facebook control or copy. Real adapter/fake SDK checks pass, as do Google/Email and anonymous claim/restore/link/logout UI checks at 320×568, 390×844 and 812×375. All 59 Node tests, release build, 25-page metadata and whitespace checks pass. Source worker is v13. Hosted Auth was not exercised.
## Failed-jump charging advice · 2026-11-03

- Added shared bilingual advice for the immediate fall message and result card: undershoot → longer charge; overshoot → shorter charge, with upward/downward arrows and a reminder to release during the rising phase. Thorn, fish and sinking failures keep cause-specific guidance. Replay/home clear the advice style; no polling or new animation is used.
- Production Chromium checks pass at 320×568 Chinese and 812×375 English for short, excessive and descending-cycle low-power holds (1ms, 950ms and 1,850ms). Immediate/result messages match, result panels do not overflow horizontally, and replay clears prior advice. Screenshots inspected in `/tmp/frogger-advice/`.
- All 59 Node tests, production build, 25-page metadata and whitespace checks pass. The preceding signed-in status copy removal remains included; actual personal rank, anonymous labels and local-practice labels are preserved. Source worker is v15.
## Comic action buttons and animal prices · 2026-11-03

- Redesigned Animal Shop and World Rankings as equal-width pastel comic buttons with rounded ink outlines, raised shadows and bounded hover/press feedback. Added static inline frog-shop and smiling-trophy SVGs, a short shop caption and a TOP 10 badge. Translation targets only label spans so changing language preserves the icons. No external image downloads or idle animation loops were added.
- Raised every paid animal price by 200 Frog Coins: Penguin 280, Bunny 320, Monkey 360, Otter 400, Duckling 440, Cat 480, Panda 520, Fox 560 and Capybara 600. The starter Frog remains free. Local/cloud purchases share the catalog; the Firestore exact-price map and existing purchase fixtures were updated. Existing ownership and balances are unchanged.
- Production browser checks pass for button icons surviving Chinese/English switching, readable labels, minimum 44px targets and correct shop/leaderboard dialogs at 320px, 390px and 1280px. Four-size mobile/landscape/desktop layout checks pass, as do four-size shop deductions/persistence checks. Screenshots inspected in `/tmp/frogger-comic-actions/`.
- All 59 Node tests, release build, 25-page metadata and whitespace checks pass. Source worker is v16. Publish the updated Firestore rules before releasing new cloud purchase prices; rules were not deployed and the emulator suite was not run here.
## Lake weather, docked skills and matching portraits · 2026-11-03

- Added occasional 5–7 second drizzle, rain-following rainbow and sunshine, plus occasional sun-only intervals. Weather uses its own crypto random source and one phase-boundary timer; it does not consume platform RNG or alter physics. Rain is a bounded CSS transform layer, with static sun/rainbow after brief opacity transitions. Pause/backgrounding freezes it; fall and home stop activity. Reduced motion disables moving drizzle.
- Docked the skill button at the lake's lower right with explicit layering above the jump input and below welcome/charge overlays. Local mobile checks verify its hit target, minimum 44px size, remaining uses and that tapping it never initiates a jump.
- Player, skill, leaderboard, anonymous-login and shop-mascot animal icons now share `animal-icons.js` and the shop's character renderer. Icons draw once per species change, at small bounded resolutions. Their metadata is separate from shop-card selectors. Existing balances, animals and skills are preserved.
- **64 Node tests pass**, including weather phase order, sun-only intervals, long pauses, replay cleanup and browser timer invocation. Production weather/skill checks pass at 320×568, 390×844, 812×375 and reduced-motion 390×844. All ten animal/skill/reward scenarios and four-size shop/rank fixtures pass. Rain, rainbow, sun and shared portrait screenshots inspected locally.
- Performance budgets remain satisfied: zero JavaScript animation callbacks in static clear idle and pause, 31 callbacks/second for moving-pad idle, one gradient per charging frame and under two million Canvas backing pixels. Weather phases add no JavaScript frame loop. These are Chromium workload checks, not physical battery measurements.
- Production build, 25-page metadata and whitespace checks pass. Source worker is v22 and preloads weather and portrait modules. Recent title/retry-label changes and the slightly faster turtle remain included; hosting/Firebase settings were not changed.

## Character update — 2026-11-04

Kurimanju now carries a handled amber beer mug with foam and glass highlights. Usagi is displayed as 兔兔. Rakko costs1,880 coins in the catalog and Firestore price map, with white fur, brown cap/forehead tufts, cross scar, white cape, collar clasp and sword/strap. A local Chromium render of all three characters was visually inspected. All93 Frogger tests pass, including exact catalog/Firestore price consistency, purchased-species persistence and cached scene/skill behavior. Source cache version is29. Cloud rules have been edited locally; they have not been published to Firebase. No push performed.

## Rendering cache and HUD update — 2026-11-04

Matched source benchmark:390×844, same browser/fake clock, one-second charging and settled turtle-idle workloads. The moving-pad fixture now derives the opening variant chance from the game's difficulty rules.

| Workload measurement | Before | After |
| --- | ---: | ---: |
| Charging rendered frames |32|32|
| Charging HUD attribute mutations |128|96|
| Charging drawImage calls |160|128|
| Turtle-idle rendered frames |31|31|
| Turtle-idle ellipse calls |372|0|
| Static idle / paused frames |0 / 0|0 / 0|

Static river geometry now sits on a separate non-interactive Canvas layer. Stable special-pad bitmaps follow live surface coordinates, while breathing/spinning surfaces, sinking pads and landing reactions remain dynamic. Animal poses use a48-entry LRU cache and survive same-DPR resize; different DPR invalidates them. Power colour/position styles share one update. Canvas pixel budgets and animation cadence remain bounded.

96 Frogger tests pass. All seven platform UI scenarios pass, including turtle drift, duck sliding, ice timing and flower/shell bonuses. Four viewports each complete73 mixed-route hops, covering input methods, hazards, pause, predators, replay and idle suspension. The rendered river/power-meter screenshot was visually inspected. Production performance-budget checks pass, with Firestore still loading on demand:478,762 decoded initial JS bytes versus1,043,957 after opening the leaderboard. Source startup module counts are not a validation of bundled Firebase behaviour. Operation-count savings are not a real-device FPS/battery guarantee. Source worker isv30. No push performed.


## Skill-use accumulation clarity — 2026-11-04

The existing per-run charge arithmetic already retained unused uses and added one at every20 successful landings. This update clarifies that behaviour rather than combining animals or stacking buff strength: a run starts at1, unused20/40/60-hop milestones give2/3/4, each activation subtracts1, and a new run starts at1. Milestone events now carry their score/balance and landing events include the earned-use marker, so the visible/announced “+1 / available total” is not overwritten by the same landing feedback. Activations report the remaining total; button title/accessible labels and bilingual rules explain accumulation. The button stays in its existing location. No wallet/profile/Firestore schema or rule changes.

**101 Frogger checks +152 Career365 regressions pass (253 total).** Five added tests cover all22 animals over80 landings, delayed event balances, repeated spending to zero and replenishment, unchanged one-hop protection strength, pause rejection and new-run reset. Source and built browser checks pass at320×568,390×844,812×375 and1280×900 (English via`?lang=en` at1280). Each viewport plays60 real hops, checks20/40/60 milestones, spends banked uses twice, pauses/resumes, spends to zero and begins a new run; no page errors or horizontal overflow. Virtual-clock resume advances a frame before checking enabled controls.

The26-page `/games/` build and source/built SEO checks pass; release **6d21b02698511813**. Source cache isv31; existing rounds retain the normal update lifecycle. No push or hosting deployment performed in this update. Reproduce with`scripts/skill-charges-check.mjs` and`FROGGER_URL` / `GRID_RUSH_PLAYWRIGHT_MODULE`;`FROGGER_VIEWPORT=1280` selects just the English desktop case.

## Dedicated Firebase configuration — 2026-11-04

Frogger retains its existing `sky-playground-3c5af` Web App configuration, wallet/player schema, animal prices and leaderboard rules. Career365's snapshot match was removed from this folder's rules; all unrelated paths now fall through to denial. Each game has its own CLI configuration and explicit-project deployment helper. The Frogger dry-run targets only this folder's rules/indexes and the existing project; no remote deployment was performed. Back up old Career365 cloud data before publishing these Frogger-only rules.

All101 Frogger tests and160 Career365 tests pass (261 total), including deployment target and cross-game configuration contracts. The26-page build and source/built SEO checks pass; release `bc06b13d49b68999`. Career365 isolation, legacy IndexedDB export, account and mocked cloud regressions pass at four viewports; its real bundled SDK/offline check uses an independent fixture with external services blocked. See `../career-365/VERIFICATION.md` for details. Emulator harnesses now include cross-game collection-denial cases, but emulator execution and live Firebase providers were not certified. The actual independent Career365 project configuration is still outstanding; different Web Apps in the original project are rejected. No push, provider changes or hosting deployment performed.

The user subsequently supplied Career365's independent `sky-playground-career-365` configuration, which is now installed in its own folder. Both deployment dry-runs resolve their different projects correctly. All261 Node checks pass again, and the26-page build/built SEO pass with release `cb0715e6d7e9a8e8`. Frogger's public configuration and player data are unchanged by that follow-up; no deployment or push performed. See Career365's latest verification entry for client SDK and setup boundaries.

## 2026-11-11 更新驗證

- `node --test --test-isolation=none frogger-jump/tests/*.test.js`：113項通過。包含30位動物、各系列價錢排序、裝備購買與舊存檔、兩格目標、有限修正、救援一次性、方向與慣性、真實腳位、烏龜+20%、花心3／貝殼5、路線獎勵及暫停。
- Chromium：八位新角色逐一驗證繪圖、技能、起跳、落地、結算與購買重載；320／390／812／1280寬度驗證系列篩選、購買動物與裝備、tooltip／詳情、空中暫停、跨兩格與控制項可操作。
- 既有browser-check：四種尺寸各73跳，驗證I／Z路線、小平台、限時／荊棘／燈籠魚、輸入、暫停時鐘、落水、重玩、紀錄及靜止停止繪圖。
- performance-check：靜止及暫停0繪圖；移動平台約31幀／秒，測試期間0HUD屬性變更；蓄力約32幀／秒，0漸層及橢圓重建、96次HUD變更。高DPR大畫布約140萬像素。此為受控瀏覽器測量，不保證所有裝置固定FPS。
- Auth／provider adapter：既有Google、Email、匿名登入、同UID綁定、錯誤處理與原錢包保留檢查通過。使用模擬SDK，沒有建立正式帳戶。
- 原始及建置SEO、網站建置及diff空白檢查通過。
- Firestore emulator JAR下載受環境網絡限制，未能執行規則模擬器驗證；測試腳本已補新裝備與跨UID檢查。正式規則尚未部署，正式兩裝置驗收尚未執行。

## 2026-11-14 落地接觸點、技能用量與動畫

- 120項Node測試通過。涵蓋30種動物的3次存量上限、花滿後再補充、所有通用技能每局一次、新局重置、橢圓接觸點、起落銜接、移動／下沉／蘑菇壓縮及縮放快取重用。
- `scripts/skill-charges-check.mjs` 驗證320×568、390×844、812×375、1280×900；動物技能1→2→3，滿額後維持3；消耗後可再補充。通用技能消耗後跨里程碑仍維持0。亦檢查按鈕垂直置中、說明靠右、提示文字不佔版面及重玩。
- 七種特殊平台的手機落地、反應、獎勵及暫停檢查通過。既有手機回歸完成73次I／Z跳躍，涵蓋小落點、沉木、荊棘、魚躍、輸入、暫停、落水及重玩。
- `scripts/grounding-check.mjs`：30種動物、3480個受控跳躍繪圖幀，動物向量圖重建0次；該次Chromium量測draw的P95約0.1ms、最大7.4ms。此為測試機繪圖工作量，並非實體手機FPS承諾。
- 既有效能檢查：靜止／暫停0幀；蓄力32幀／秒及移動平台31幀／秒，皆無漸層重建；每幀僅繪製接觸陰影。高DPR大畫布約140萬像素。
- source worker v33預先快取新增grounding模組；既有進行中的遊戲仍採關閉所有視窗後啟用更新。
- 本輪沒有Firebase資料格式、索引或規則改動；正式手機及遠端主機未在此環境驗收。
