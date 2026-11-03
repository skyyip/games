# Verification · 2026-11-03

## Passed

- **31 Node tests** cover fragment uniqueness, six-night resource pressure and fourth-night food exhaustion, two-allocation limits, resource affordability, distinct dinner responsibility/portion/refusal consequences, a real mountain failure, freely switched/shared city actions, cross-character price/unrest backlash, exact costs, memory reconstruction/cancellation, one-time confessions, once-per-day/idempotent music rewards, low-trust failures, forced finale, a no-funds unplugged option and all eight ending predicates.
- An unmodified complete decision route reaches the parallel-time ending. Seeded replay produces identical fragments/events; other seeds produce different runs.
- Save tests cover autosave plus three independent slots, range/schema validation, corrupted/foreign files, storage denial and separately retained ending collections.
- Music tests cover untimed play without a frame loop, wrong/early taps, one resolution per note, long background pauses without timing drift, and a missed final take finishing exactly once.
- Browser acceptance completes the three chapters at **320×568 and 390×844 (Traditional Chinese), 844×390 landscape and 1280×900 (English)**. It uses actual on-page decisions, character switching, three-step dinner, fragment filters, memory ordering, rehearsal and final performance to reach the parallel ending. It also checks manual save/load, exported JSON validation, reload/continue and exact-value/effects settings.
- Browser checks exercise untimed composition, normal/slow rhythm setup, pause and page-hidden behavior. The final small-phone regression also checks that cancelling music setup preserves its daily use and tests the final food/water balance.
- A separate installed-worker check reloads offline and plays another snow decision. Root landing cards and collection schema do **not** expose this game.
- Shared production build and metadata/guide validation pass for **25 pages**. The build emits content-hashed assets and the existing Apache cache configuration. `git diff --check` passes.

## Scope and limitations

This is a complete local single-player interpretation, not a real multiplayer service or a licensed adaptation. Art, events, dialogue and synthesized notes are original. Psychological numbers are fictional story mechanics. No Firebase project, real account, copyrighted song recording or external generation service is needed.

Browser automation uses Chromium device emulation rather than physical Safari/iOS/Android hardware. It verifies the chosen states/routes and timing cases, not every possible narrative combination or measured real-device battery life. Audio is muted by default; automated tests primarily verify its lifecycle and the equivalent visual/untimed controls, not subjective listening quality.

Reproduce using the commands in README.md. Test screenshots and exported JSON were written to `/tmp/city-is-dying-browser/` during development; no deployment was performed during this verification.
