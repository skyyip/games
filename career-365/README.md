# 365行，行行出狀元

A new independent, Traditional Chinese life/career simulation at `career-365/`, integrated with the existing Sky Playground static build. It remains unlisted on the landing-page cards, like the other newly developed standalone games; open its route directly. No account, paid API or server is required.

The paper-like cream/sage/coral interface uses locally drawn Q-style SVG characters, illustrated panels and speech bubbles. Every important career, financial and story decision records a dated frame. Recent panels appear on the dashboard; the full book is paginated without dropping older frames. There are no perpetual animation loops, remote character images or external AI calls.

## A playable life

- Draw a seeded resume with gender, starting age18–26, height, weight, blood type, zodiac, family, school, major, MBTI and IQ/EQ/PQ/JQ. Appearance and gender do not gate professions. The major grants a starting skill.
- Search **365 distinct named jobs** across **21 categories**, including chef, plumber, YouTuber, pet communicator, blockchain engineer, metaverse architect and AI prompt specialist. These are curated career names; category-based routines and shared events provide the initial career scenarios rather than365 bespoke story campaigns.
- Mentor study is slower, builds EQ/JQ/contacts, can uncover secrets and passes along contacts on graduation. Simulated AI study is faster and develops IQ, with reduced EQ and a hallucination branch. A $300 checked lesson avoids that branch. Learning is a game mechanic rather than an actual training service.
- Each month offers three actions. Study/work consume energy; rest and social time restore the player differently for I/E personalities. Social events also offer a personality-specific choice. PQ sets the energy cap; overtime and high pressure can cause illness and bills.
- Graduates work, negotiate pay and rise through eight levels toward CEO. JQ can redirect adverse workplace events into opportunities. Switching costs $3,000 and one action, preserves prior skills and enters a new apprenticeship. Plumber → YouTuber has an explicit cross-field bonus.
- Starting a business costs $40,000. Rent is $9,000/month, staff cost $6,500/month plus $3,000 recruiting fees. Staff have individual quirks and productivity; marketing builds customers. Closing or changing careers settles departure costs and ends recurring payroll.
- Bank/bonds, stock, ETF and crypto are entirely fictional. Bank/bonds accrue simulated monthly growth; risky assets respond to generated news and prices. IQ affects an imperfect forecast. Trades, repayment and research consume actions.
- Lottery, scratchcard, horse betting and a Macau-style table use virtual currency only. Lottery jackpots can trigger a12-month work-income penalty if the player chooses to coast. Losing the last funds or accumulating heavy debt triggers recovery/support choices. Cash does not go negative; unpaid obligations become debt with1.5% monthly game interest.
- One-year planning runs the same monthly rules, stopping at an unresolved story or retirement. Mentor lessons in plans are free; AI plans choose the $300 checked lesson when affordable.
- At65 the game retires the player once. Achievements and reflections combine actual career, finances, relationships and setbacks locally. **The retirement reflection is a compositional local narrator, not a live language-model response.**

All salary, economic and qualification values are fictional game balancing. No real trading, betting, payment, account login or contemporary-news API is connected.

## Saves and exports

The current life autosaves under `career-365.save.v1`. Invalid saves are rejected; failed/unavailable storage leaves the current visit playable and exposes a warning. JSON backups can be exported and imported with a replacement confirmation. The versioned save includes RNG state, market plan, pending decisions and every comic frame. Imports are size-limited and structurally validated; rendered names/text are escaped.

Download the complete book as a standalone offline HTML file with all frames, captions and a print/Save-PDF control. A900×1200 PNG captures up to six turning points. Active lives export a clearly labelled work-in-progress book; only retirement uses the final reflection. Downloads stay on the visitor's device.

Source service worker `career-365-app-v1` preloads the game and shared language/update/font modules. The production site builder supplies content-hashed assets and an update-aware offline worker. No existing game's cache or progress is cleared.

## Development

From repository root:

```
node --test --test-isolation=none career-365/tests/*.test.js
PORT=5260 node grid-rush/scripts/serve.js
CAREER_URL=http://localhost:5260/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/browser-check.mjs
PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs _site
node tools/check-seo.mjs _site /games/
```

The browser script covers phone/landscape/desktop layouts, a complete life through actual planner/choice controls, HTML/PNG/JSON downloads, invalid/valid backup import, denied storage and installed offline play. See [VERIFICATION.md](VERIFICATION.md).

## Follow-up scope

A live generative-AI reflection endpoint, per-job authored campaigns, cloud accounts, cross-device sync, cloud ranking and a landing-page card are not added by this initial local game. Existing GitHub Pages publication remains the repository's deployment workflow; the game is not separately registered with Sites hosting.
