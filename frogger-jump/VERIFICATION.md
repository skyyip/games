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

## Firebase boundary — not a passed cloud deployment

The user has **not created a Firebase project**. No production configuration, account, database, rule deployment or live leaderboard has been created. The UI shows this state and keeps local practice unranked, with a separate wallet. The client-side integration uses Firebase Auth/Firestore directly and lazy-loads the SDK only when configured.

A **21-case security harness** is prepared for local Firebase emulators: atomic name reservation, case collisions, wallet privacy, unauthorized coin/animal changes, atomic run completion, duplicate payouts, other-user/forged scores, bounded public queries and exact-price purchases. It has **not passed or been certified**: downloading the required Firestore emulator JAR failed with **403 Domain forbidden** in this execution environment. It must be run after emulator access is available. See `FIREBASE.md` for activation and test commands.

The Firestore rules enforce ownership, transactional consistency, server-timestamp duration bounds and deterministic coin rewards; they do not perform trusted server-side replay of client physics. Browser tests use Chromium, not physical iOS/Android hardware.
