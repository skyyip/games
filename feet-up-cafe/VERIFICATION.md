# Feet Up Café acceptance

Verified 2026-10-29 in Chromium. Phone/tablet dimensions are emulated; physical-device touch latency and audio output are not measured.

- 517 repository tests pass, including 38 simulation/progression tests for the new game: original contact/timing/dodge/meal/stock invariants plus gold-guest timing and one-time bonus, expiry, pause, four distinct attack sources, precise-dodge eligibility, held-key repeat prevention, shield grant/consumption, optional goals and independent save keys.
- Four native-input profiles: 320×568 Chinese, 390×844 Chinese, 812×375 English/reduced motion, 1280×900 English. Checks cover two modes, three goals, touch target fit, actual shoe lift/lower pixels, multi-touch release, quick swipe cleaning, pause and focus, dialogs and uncaught errors.
- Dedicated native-input checks pass for a timed gold-guest catch, all four attack sources, the precise-dodge goal, a tea shield/save and preservation of the old game save.
- Complete browser rounds cover score settlement, three-hit defeat and independent records after reload.
- Production checks cover a full winning diner run using visible warnings and real keys/buttons, trophy/confetti, cosmetic purchase, retained wallet/equipment/records offline, and direct game navigation. The new café game and both older hidden game cards stay hidden on the landing page.
- Source and production metadata validation passes for all 22 pages. Scripts, CSS, cover artwork and fonts have content hashes.

Artifacts: `/tmp/feet-up-cafe-qa/`, `/tmp/feet-up-cafe-release-qa/`, `/tmp/feet-up-cafe-features/`.
