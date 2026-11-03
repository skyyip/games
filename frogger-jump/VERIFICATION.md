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
