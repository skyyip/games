# Career365 verification

Verified:2026-11-04

## Passed

- **23 Node tests**:365 unique job names/IDs and all requested occupations;100 seeded resumes; selection/save restoration for all365 careers; mentor/AI differences; checked lessons and hallucination interruptions; action/energy limits; overtime injury; I/E recovery and social-choice differences; graduation; plumber→YouTuber synergy; business staffing/payroll/closure; asset conservation and monthly bank growth; zero-cash decision recovery; jackpot/coasting and loss/comeback; JQ opportunities; once-only retirement; import validation/escaping; staff productivity; and solvent-vs-insolvent debt treatment.
- Six complete seeded model lives reach65 and restore their final state/comic histories successfully.
- Source and production Chromium checks at **320×568,390×844,812×375 and1280×900** pass: cover, resume/name,365-job search, route selection, study/work, decisions, bank transaction, reload/continue, complete HTML book and valid PNG download. Cover/phone gameplay screenshots were visually inspected; a focus-restoration issue that exposed the skip link was corrected.
- A complete life played through the **real planner and story controls** retires at65 with306 comic panels. The downloaded HTML contains all306 articles, not only highlights. The production browser fixture uses ordinary persisted game data and does not expose a debug game object in product code.
- JSON backup export, rejection of malformed imports, confirmation and restoration of a valid backup pass. A denied-storage browser remains playable with a visible backup warning.
- Production installation, controlled offline reload and a saved offline work action pass.
- **26-page shared production build**, source/built metadata validation and whitespace checks pass. The new route remains unlisted in collection cards and preserves other games' saves/caches. Existing shared duplicate-translation-key build warnings remain unchanged.

## Boundaries

The UI is primarily Traditional Chinese, with an English static guide/metadata. The game uses simulated economics, AI learning and virtual gambling; no live investment, wager, payment, news, cloud account or generative-AI provider is connected. Retirement narration is explicitly local/compositional. All365 careers have distinct catalog entries; role routines are currently category-based with shared story events rather than365 unique campaigns.

Browser checks run in Chromium, including a reduced-motion landscape profile; they do not certify physical iOS/Android installations. No GitHub push or hosting deployment was performed for this new game in this task.

## Reproduce

```
node --test --test-isolation=none career-365/tests/*.test.js
PORT=5260 node grid-rush/scripts/serve.js
CAREER_URL=http://localhost:5260/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/browser-check.mjs
PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs _site
node tools/check-seo.mjs _site /games/
```
