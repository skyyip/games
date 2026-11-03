# River friends / Firebase interface verification · 2026-11-02

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
