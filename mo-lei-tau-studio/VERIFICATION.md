# Verification · 2026-11-02

## Automated domain/interface checks

`npm test --prefix mo-lei-tau-studio`: **26 passing tests**. Coverage includes all three film rosters, three unique free auditions, ownership and paid draws, 5/15/30-minute jobs with fixed potential-scaled rewards and one-time claims, timed training/cancellation, buying/equipping all three props, awakening, role locks, NPC labels, both funding/cast completion orders, all three film premieres, immutable costume snapshots, contribution limits, one-time 20% guest fees, crew restart, team chemistry, 3% mentor boundary, local applause cooldowns, luck-based casting calls, corrupt-save recovery and cloud refresh throttling.

## Production browser acceptance

Shared build served at `/games/mo-lei-tau-studio/` with Chromium/Playwright.

- **390 × 844** and **1280 × 900**: choose film, reveal all three free contracts, select actor, start and claim a job, complete both minigames with **12/12** hits, confirm all three prop purchases, unlock awakening, claim role, invite a cross-film guest, recruit all five local extras, contribute funding and view the premiere.
- Verify three event reports, PNG poster download, persisted balances and one-time rewards after reload, and local leaderboards.
- **320 × 568** and **812 × 375**, reduced motion: home layout fits, jobs remain usable, contract modal scrolls internally and closes normally.
- No horizontal page overflow, clipped actionable controls or runtime page exceptions in these cases.
- Landing cards and collection JSON-LD omit the game.
- Separate normal-time check verifies event-report animation, PNG export with the chosen movie background and Iansui font, and immediate cancellation when closing training.

The long-timer acceptance driver disables WAAPI inside the test context so its fake clock controls Framer Motion consistently. This is a test-only override; the application keeps native acceleration. PNG export resumes the normal browser clock before capture.

Commands (with the environment's Playwright module supplied as needed):

```
STUDIO_URL=http://localhost:5285/games/mo-lei-tau-studio/ \
  node mo-lei-tau-studio/scripts/browser-check.mjs
STUDIO_URL=http://localhost:5285/games/mo-lei-tau-studio/ \
  node mo-lei-tau-studio/scripts/platform-check.mjs
```

## Persistence, installation and update checks

- Worker script is scoped to **this game**, not the playground root.
- Installed shared build reloads and can start a job/train **offline**.
- Backgrounding training cancels without phantom rewards; jobs retain their end timestamp.
- Storage quota failure produces a visible warning and preserves the current visit's acquired item.
- New-version notice opens an explicit update prompt, can be deferred and never reloads automatically.
- Standalone Vite build contains a root-scoped installation manifest, hashed local 192/512 icons, `release.json` version detection and Apache cache policy.
- Actual browser PNG download inspected for correct movie color and embedded Chinese typography.

## Build/site checks

`npm run build --prefix mo-lei-tau-studio`: passed. React, Router, Zustand and Framer Motion main entry is approximately **471 kB / 155 kB gzip**; poster capture is a separate on-demand chunk. Firebase is not loaded in local mode.

`node tools/check-seo.mjs` and `node tools/check-seo.mjs /tmp/studio-release/games /games/`: passed for **24 pages**. `git diff --check`: passed. Existing translation duplicate-key build warnings predate this game.

## Boundaries

This is the explicitly requested **local mode plus cloud interface**. Firebase authentication, live crews, authoritative rewards, global votes and Firestore rules have not been deployed against a real project; rules are not claimed emulator-certified. No FTP credentials were installed and no production deployment, Git commit or push was performed. Local saves/clocks are intentionally not a competitive trust boundary. Automated browser checks use Chromium, not physical iOS/Android devices.
