# Frogger Jump tasks

Updated: 2026-11-03

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

## Remaining

- [ ] Run the expanded Firestore emulator security harness. Previous verification recorded an emulator download restriction; these tests are not certified as passing.
- [ ] Confirm Email/Password Auth, Firestore rules, and ranking index in the configured Firebase project.
- [ ] Verify real cloud registration, unique-name collisions, purchases, offline retry, and cross-device rankings against the configured backend.
- [ ] Test touch controls, background/resume, and installed/offline play on physical iOS and Android devices.
- [ ] Exercise simultaneous results in separate browser tabs; this continuation shares requests within one page and does not add cross-tab queue coordination.

See [VERIFICATION.md](VERIFICATION.md) for evidence and [FIREBASE.md](FIREBASE.md) for backend setup and emulator commands.
