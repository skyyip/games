# 365行，行行出狀元

A new independent, Traditional Chinese life/career simulation at `career-365/`, integrated with the existing Sky Playground static build. It remains unlisted on the landing-page cards, like the other newly developed standalone games; open its route directly. No account, paid API or server is required.

The paper-like cream/sage/coral interface uses locally drawn Q-style SVG characters, illustrated panels and speech bubbles. Every important career, financial and story decision records a dated frame. Recent panels appear on the dashboard; the full book is paginated without dropping older frames. There are no perpetual animation loops, remote character images or external AI calls.

## A playable life

- Draw a seeded resume with gender, starting age18–26, adult height clustered around gender-specific population centres, height-correlated weight generated from BMI19–29, blood type, zodiac, family, school, major, MBTI and IQ/EQ/PQ/JQ. Appearance and gender do not gate professions. The major grants a starting skill.
- Search **405 distinct named jobs** across **25 categories**, including chef, plumber, YouTuber, pet communicator, blockchain engineer, metaverse architect and AI prompt specialist. These are curated career names; category-based routines and shared events provide the initial career scenarios rather than405 bespoke story campaigns.
- Mentor study is slower, builds EQ/JQ/contacts, can uncover secrets and passes along contacts on graduation. Simulated AI study is faster and develops IQ, with reduced EQ and a hallucination branch. A $300 checked lesson avoids that branch. Learning is a game mechanic rather than an actual training service.
- Each month offers three actions. Study/work consume energy; rest and social time restore the player differently for I/E personalities. Social events also offer a personality-specific choice. PQ means Positive Intelligence Quotient (0–100% positive mental time), buffers stress growth and improves through rest/exploration. Health sets the energy cap; overtime and high pressure can cause illness and bills.
- After the opening graduation, choose an apprenticeship or a one-year further-education course ($6,000 admission, $1,800/month and at least12 study actions). Completing it returns to a graduate decision; annual plans stop there.
- Players can resign, preserving skills/assets and settling business staff costs. Choose world travel ($5,000 departure plus $4,500/month), overseas short-term work ($8,000 departure, $2,500/month plus living costs; $6,000/work action), or a sabbatical. Travel and interests generate comic panels and improve PQ. Debt-free wealth of25 years of basic living costs unlocks financial freedom; this remains a playable lifestyle until65, with ongoing expenses and the option to re-enter work. This threshold is a fictional game unlock, not a financial forecast.
- Graduates work, negotiate pay and rise through eight levels toward CEO. JQ can redirect adverse workplace events into opportunities. Switching costs $3,000 and one action, preserves prior skills and enters a new apprenticeship. Plumber → YouTuber has an explicit cross-field bonus.
- Starting a business costs $40,000. Rent is $9,000/month, staff cost $15,400/month plus $3,000 recruiting fees. Staff have individual quirks and productivity; marketing builds customers. Closing or changing careers settles departure costs and ends recurring payroll.
- Bank/bonds, stock, ETF and crypto are entirely fictional. Bank/bonds accrue simulated monthly growth; risky assets respond to generated news and prices. IQ affects an imperfect forecast. Trades, repayment and research consume actions.
- Lottery, scratchcard, horse betting and a Macau-style table use virtual currency only. Lottery jackpots can trigger a12-month work-income penalty if the player chooses to coast. Losing the last funds or accumulating heavy debt triggers recovery/support choices. Cash does not go negative; unpaid obligations become debt with1.5% monthly game interest.
- One-year planning runs the same monthly rules, stopping at an unresolved story or retirement. Mentor lessons in plans are free; AI plans choose the $300 checked lesson when affordable.
- At65 the game retires the player once. Achievements and reflections combine actual career, finances, relationships and setbacks locally. **The retirement reflection is a compositional local narrator, not a live language-model response.**

All salary, economic and qualification values are fictional game balancing. No real trading, betting, payment, account login or contemporary-news API is connected.

## Saves and exports

The current life autosaves under `career-365.save.v1`. Invalid saves are rejected; failed/unavailable storage leaves the current visit playable and exposes a warning. JSON backups can be exported and imported with a replacement confirmation. The versioned save includes RNG state, market plan, pending decisions and every comic frame. Imports are size-limited and structurally validated; rendered names/text are escaped.

Download the complete book as a standalone offline HTML file with all frames, captions and a print/Save-PDF control. A900×1200 PNG captures up to six turning points. Active lives export a clearly labelled work-in-progress book; only retirement uses the final reflection. Downloads stay on the visitor's device.

Source service worker `career-365-app-v6` preloads the game and shared language/update/font modules. The production site builder supplies content-hashed assets and an update-aware offline worker. No existing game's cache or progress is cleared.

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

## Daily life, risk and economic expansion

- Career changes show a preview before confirming: skills remain; relevant skills carry more apprenticeship mastery; cross-field experience earns a bounded bonus; industry contacts/reputation may decrease; promotion level and negotiated pay reset. Business staff departure costs still apply.
- Persistent exercise, diet and sleep scores decay monthly. Habit actions and overtime change these scores; age, stress, dependence and habits affect fictional monthly illness risk. Good habits reduce risk without preventing every illness. Illnesses incur bills, reduce income to65%, recover with time or treatment, and appear in the comic/ending. Unpaid fees follow the existing debt system.
- Adult nightlife/sex-transaction, gambling and drug temptations appear as non-graphic choice events. Risk choices may create spending, dependence, health problems, legal incidents and months of interrupted work/study. Medical/counselling support reduces dependency and recovery time.
- Phone, online-shopping, dating-app, investment and overseas recruitment/KK-style trafficking scams have different outcomes. Recruitment victimisation can interrupt work and career changes; explicit support/rescue choices allow recovery. Victims are not blamed. Monthly events also occur in travel and non-working lives. All event probabilities are fictional balancing values, not incidence statistics.
- Dating, marriage, planned parenthood (birth/adoption), shared time and infidelity decisions maintain relationship status and affection. Children age monthly; each child costs $3,000/month until18. Married household expenses add $800/month. Young children affect sleep/energy; separation does not erase children or support costs. Marriage/family are optional choices.
- Investments now include rental-property shares (minimum $10,000,3% trading costs,0.17% monthly net rent before crisis adjustments), a collectible-card basket including Pokémon cards (12% buying/selling friction), and a simplified three-times stock-market derivative (1% monthly decay, full principal loss possible, no extra margin liability). These are simulated baskets rather than actual properties/cards/contracts or market quotes.
- Fictional war, stock-crash and natural-disaster shocks affect multiple asset prices, while income/living-cost/rent effects persist for several months. No real-time geopolitical news is fetched.

### Salary reference snapshot

The game uses **HKD and Hong Kong**, with source metadata stored in `src/economy.js` and linked in the career picker. It does not claim405 verified individual role averages. Available industry arithmetic means are used for matching categories; otherwise a clearly marked occupational-group median is used as a proxy. New and self-employed professions remain group proxies. No source is described as a current live salary feed.

- C&SD [Quarterly Report of Wage and Payroll Statistics, December2025, Table2.4](https://www.censtatd.gov.hk/wbr/B1050009/B10500092025QQ04/att/en/B10500092025QQ04.pdf), published2026-03-27: selected employee industry means, whose coverage is supervisory level and below, not all professionals or every individual role.
- C&SD [2025 Annual Earnings and Hours Survey, Table3.1](https://www.censtatd.gov.hk/wbr/B1050014/B10500142025AN25/att/en/B10500142025AN25.pdf), published2026-03-23: full-time occupational-group **medians**, separately labelled from means.

Level1 starts at the role proxy; each later promotion adds12% of that base. Negotiated pay/cross-field bonuses apply separately. Apprentices receive45% of the reference, minimum $6,000. The first ordinary work action represents a month's commitment and pays the monthly amount once; extra ordinary work builds experience, while overtime pays25% extra. Illness and world shocks modify actual receipts. Progression, trainee amounts and costs are game rules rather than measured averages. Hired support staff use the $15,400 full-time elementary-occupation median as a reference.

Additional browser scenarios:

```
CAREER_URL=http://localhost:5260/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/life-systems-browser.mjs
```

## Work experience and free allocation

Every employed/apprentice first ordinary work action in a month opens a workplace problem; business deliveries also open problems. The next-month/year controls wait for the player's choice. The scenario shows a concrete brief, an observation clue and acceptance requirements; checking, coordinating and rushing produce different quality scores, skill/reputation gains, stress, bonuses or rework costs. Salary is paid once per month's ordinary work and is not paid again for follow-ups. Workplace learning can complete apprenticeship. A review remains on the job desk and in the exported comic.

All405 roles have a day plan, requirements and a rotating sequence of at least three problems. There are **75 category scenarios across25 industries**, plus **16 role-specific cases** for plumber, YouTuber, barista, chef, frontend engineer, pet communicator, AI prompt specialist and chicken-cutlet shop owner. Other roles use their industry's shared cases; this is not405 individually researched professional training courses. Exercises do not grant real licences or replace regulated training/supervision.

The action panel prioritises work, learning and recovery. Career/overtime and major lifestyle changes live in expandable groups; unavailable actions explain why. The work desk shows daily tasks, deliverables, case history and the previous review. Mobile actions use full-width rows with clear labels and costs.

Portfolio allocation accepts signed HKD amounts per asset (positive buy, negative withdraw), or target percentages across all eight assets. It previews all trades, friction and remaining cash before one atomic batch using **one action**. Sells can fund buys in the same batch. Weight plans reserve unassigned percentages as cash and scale buys if selling costs reduce funds. Minimum investments still apply; no asset is silently excluded when a plan is invalid. Individual asset information and shortcuts remain in an expandable section.

```
CAREER_URL=http://localhost:5260/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/work-allocation-browser.mjs
```

## Emerging and niche careers

The catalogue now contains405 unique jobs across25 categories, retaining all original365 job IDs and appending40 new jobs in separate namespaces:

- AI/intelligent applications:16 roles including AI agent engineer, RAG knowledge-base engineer, model evaluator, safety tester, data annotator, AI governance, synthetic data and compute operations.
- Funeral/end-of-life services:8 roles including funeral coordinator, restorative/cosmetic care roles, officiant, crematorium technician, ash-placement adviser and pet aftercare.
- Forensics:6 roles including forensic doctor, toxicology analyst, forensic science officer, digital analyst, anthropology and entomology research.
- Sensory/experience research:10 roles including food taster, mystery shopper, fragrance evaluator, bedding tester, game localisation, accessibility testing, theme-park/visitor experience, hospitality audit and user research.

Each category has three authored work problems. Eight additional named-role cases cover AI agents, RAG, model evaluation, annotation, funeral coordination, forensic medicine, food tasting and mystery shopping. They emphasise consent/authorisation, evidence, confidentiality, transparent limitations and concrete handovers without graphic material or real professional certification. Salary figures keep the existing explicit group-proxy labelling. Search also matches category names, so searching AI includes RAG roles.

## Daily month skipping

The month control distinguishes normal progression from skipping unused actions. With actions remaining, it skips one month and consumes one of12 daily uses; after all three actions are used it advances normally without a quota charge. Skips still settle expenses, markets, health, family and age. Pending choices must be resolved first. Annual plans complete remaining actions as rest rather than silently skipping unused actions.

The day resets at midnight Japan time (UTC+9), matching the session's client time zone. Quota storage (`career-365.month-skips.v1`) is independent of life saves, so reload, new life and JSON import do not replenish it. Same-origin tabs use Web Locks when available. Offline play works. With blocked storage the UI labels the session-only fallback; the limit is browser-local and does not claim server-enforced cross-device protection.
