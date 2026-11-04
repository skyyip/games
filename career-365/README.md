# 365行，行行出狀元

A new independent, Traditional Chinese life/career simulation at `career-365/`, integrated with the existing Sky Playground static build. It remains unlisted on the landing-page cards, like the other newly developed standalone games; open its route directly. Local play requires no account or paid API. Optional Email, Google and anonymous Firebase sign-in identifies players.

The paper-like cream/sage/coral interface uses locally drawn Q-style SVG characters, illustrated panels and speech bubbles. Every important career, financial and story decision records a dated frame. Recent panels appear on the dashboard; the full book is paginated without dropping older frames. There are no perpetual animation loops, remote character images or external AI calls.

## A playable life

- Draw a seeded resume with gender, starting age18–26, illustratively generated adult height clusters, height-correlated weight generated from BMI19–29, blood type, zodiac, family, school, major, MBTI and IQ/EQ/PQ/JQ. Appearance and gender do not gate professions. The major grants a starting skill.
- Search **405 distinct named jobs** across **25 categories**, including chef, plumber, YouTuber, pet communicator, blockchain engineer, metaverse architect and AI prompt specialist. These are curated career names; category-based routines and shared events provide the initial career scenarios rather than405 bespoke story campaigns.
- Mentor study is slower, builds EQ/JQ/contacts, can uncover secrets and passes along contacts on graduation. Simulated AI study is faster and develops IQ, without an automatic EQ penalty, and with a hallucination branch. A $300 checked lesson avoids that branch. Learning is a game mechanic rather than an actual training service.
- Each month offers three focus actions in addition to regular employment and persistent habits. Study/work consume energy; rest and social time restore the player differently for I/E personalities. Social events also offer a personality-specific choice. PQ means Positive Intelligence Quotient (0–100% positive mental time), buffers stress growth and improves through rest/exploration. Health sets the energy cap; overtime and high pressure can cause illness and bills.
- After the opening graduation, choose an apprenticeship or a one-year further-education course ($6,000 admission, $1,800/month and at least12 study actions). Completing it returns to a graduate decision; annual plans stop there.
- Players can resign, preserving skills/assets and settling business staff costs. Choose world travel ($5,000 departure plus $4,500/month), overseas short-term work ($8,000 departure, $2,500/month plus living costs; $6,000/work action), or a sabbatical. Travel and interests generate comic panels and improve PQ. Debt-free wealth of25 years of basic living costs unlocks financial freedom; this remains a playable lifestyle until65, with ongoing expenses and the option to re-enter work. This threshold is a fictional game unlock, not a financial forecast.
- Graduates work, negotiate pay and rise through eight levels on separate specialist or management tracks. JQ can redirect adverse workplace events into opportunities. Switching costs $3,000 and one action, preserves prior skills and enters a new apprenticeship. Plumber → YouTuber has an explicit cross-field bonus.
- Starting a business costs $40,000. Rent is $9,000/month, staff cost $15,400/month plus $3,000 recruiting fees. Staff have individual quirks and productivity; marketing builds customers. Closing or changing careers settles departure costs and ends recurring payroll.
- Bank/bonds, stock, ETF and crypto are entirely fictional. Bank/bonds accrue simulated monthly growth; risky assets respond to generated news and prices. IQ affects an imperfect forecast. Trades, repayment and research consume actions.
- Lottery, scratchcard, horse betting and a Macau-style table use virtual currency only. Lottery jackpots can trigger a12-month work-income penalty if the player chooses to coast. Losing the last funds or accumulating heavy debt triggers recovery/support choices. Cash does not go negative; unpaid obligations become debt with1.5% monthly game interest.
- One-year planning runs the same monthly rules, stopping at an unresolved story or retirement. Mentor lessons in plans are free; AI plans choose the $300 checked lesson when affordable.
- At65 the game retires the player once. Achievements and reflections combine actual career, finances, relationships and setbacks locally. **The retirement reflection is a compositional local narrator, not a live language-model response.**

Salaries are dated official industry/occupational-group proxies, not individually measured role averages. Other economic and qualification values are explicitly simplified simulation assumptions. No real trading, betting, payment or contemporary-news API is connected. Optional Firebase Authentication is connected for player identity; progress is saved locally, with optional explicit private cloud upload/download after project rules are deployed.

## Saves and exports

The current life autosaves under `career-365.save.v1`. Invalid saves are rejected; failed/unavailable storage leaves the current visit playable and exposes a warning. JSON backups can be exported and imported with a replacement confirmation. The versioned save includes RNG state, market plan, pending decisions and every comic frame. Imports are size-limited and structurally validated; rendered names/text are escaped.

Download the complete book as a standalone offline HTML file with all frames, captions and a print/Save-PDF control. A900×1200 PNG captures up to six turning points. Active lives export a clearly labelled work-in-progress book; only retirement uses the final reflection. Downloads stay on the visitor's device.

Source service worker `career-365-app-v7` preloads the game and shared language/update/font modules. The production site builder supplies content-hashed assets and an update-aware offline worker. No existing game's cache or progress is cleared.

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

Optional Firebase accounts now identify players and keep separate local lives. JSON backups provide device transfer. Existing GitHub Pages publication remains the deployment workflow; the game is not separately registered with Sites hosting.

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

## Accounts and daily growth

See [FIREBASE.md](./FIREBASE.md) for Email/password, Google and anonymous sign-in, anonymous account linking, project/domain setup and the limits of live-provider verification. The SDK loads on opening accounts or restoring a prior identity. Each account uses an independent local life slot; returning to local play preserves the original guest life. A local life can be copied explicitly into an empty signed-in slot. Private cloud storage is available through the save dialog: inspect, upload or load a version explicitly; login alone does not overwrite either copy.

The daily modal displays the preceding recorded day's net gains in IQ/EQ/PQ/JQ, health, contacts, reputation and professional skills, with declines shown separately. First play establishes a baseline. A summary opens once per real day (UTC+9), waits for other dialogs, survives reload and never modifies attributes or grants rewards. New lives/account changes do not mix snapshots. Blocked storage uses the existing memory/backup fallback.

```
CAREER_URL=http://localhost:5273/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/account-growth-browser.mjs
CAREER_URL=http://localhost:5275/games/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/account-production-check.mjs
```

## Life design and replayability — 2026-11-04

The five-part review is implemented in [DESIGN.md](./DESIGN.md). Twelve professions retain dedicated three-chapter projects. The other393 roles now receive personalised shared projects from25 sector templates (75 additional scenes), interleaved with prior everyday cases, for226 authored workplace case entries overall (including24 additional representative-role problems). Recurring colleagues/clients retain trust and choices create delayed, foreshadowed referrals or follow-ups. All three approaches can succeed or need improvement depending on skill, task pressure and relationships, while keeping necessary safety/consent checks. Deep verification costs energy/cash, coordination uses social capability, and scoped delivery offers lower rewards.

Training now requires elapsed months, supervised practice and mastery; selected regulated professions also require a final simulated assessment with a three-month retake interval. AI cannot bypass the training route. Previously acquired credentials survive career changes. Legacy saves are migrated without revoking existing employment or mastery.

Monthly arrangements combine full/part-time employment or freelance retainers with a side career and part-time study. Housing, recurring exercise/diet/sleep, medical coverage, simplified2025/26 salary-tax reserves and MPF are visible. Ordinary rest restores energy; long-term habits still determine health. MPF is unavailable for early-retirement spending and is included in the final65-year result.

Quiet-month planning completes routine work and focus activities until an important work decision or story interrupts. Daily short occupational exercises cost an ordinary focus action, pay no duplicate monthly salary and do not skip chapters. Optional Monday-based weekly goals, continuing hobbies, friendship, caring and volunteering give returns beyond money. The decision journal remains available after a daily recap closes. No game time advances or absence penalty applies while away.

Event eligibility/weights follow occupation, assets, relationships, stress and previous choices, with8–18-month repeat cooldowns, delayed consequences and positive opportunities. Exposed scam losses cannot take an arbitrary fraction of a wealthy player's full cash or create fictitious borrowed scam payments. Fictional global shocks have warning and cooldown intervals. Every route ends at65; personal goals and non-work contributions affect the reflection.

Private cloud snapshots use revision-checked Firestore transactions, optional gzip compression and strict load validation; local progress is preserved on errors. They are manually reconciled across devices. Deploy the **combined** shared-project rules in `frogger-jump/firestore.rules`; see [FIREBASE.md](./FIREBASE.md). A14-case emulator security harness is prepared, not certified in this environment. [PLAYTEST.md](./PLAYTEST.md) provides the5–10-player human review protocol; automated checks cannot establish that the game is fun.

## Professional knowledge and occupation-wide stories

All405 jobs now receive a recurring three-chapter work project, trust and delayed follow-ups. Twelve named-role campaigns override the25 shared sector campaigns; a shared campaign inserts the selected job's routine and keeps its own per-job progress and trust. This is broad sector coverage, not405 independently authored campaigns. Existing ordinary cases remain reachable between chapters. Pending older cases are remapped by topic/clue, and prior non-campaign jobs begin at chapter1 rather than inheriting an unrelated old work count.

The knowledge bank contains **243 three-answer items**:150 foundational questions (six per sector),66 specialty items across33 role groups and27 dated era-topic questions. Every job has at least six eligible questions; additional items cover fields such as pharmacy, aviation, accounting, cybersecurity, databases, baking, rehabilitation, digital forensics and usability research. Questions shuffle answer positions and prioritise unseen material. Correctness follows the player's chosen answer, not a stat-based die roll. The explanation and correct concept appear after answering, with a further-reading reference; these are locally authored learning questions, not official certification exams.

Knowledge practice costs one monthly focus action and10 energy. It pays no monthly wage and does not count as supervised practice or fulfil a professional assessment. Correct answers and corrections give modest skill growth. Per-job answered/correct totals survive career changes; the latest24 reviews are available in the notebook, while full comic history retains earlier decisions.

**75 occupation events** (three per sector) cover professional development, disruptions and limited opportunities. Selection is restricted to the current working career and weights knowledge needs, stress, world conditions, business status and reputation. Eight/ten-month cooldowns prevent immediate repeats. Choices trade cash, energy, growth and relationships; accepted opportunities or unfinished scope can create delayed follow-ups. Follow-ups retain the originating profession and event after a career switch, and do not grant permission to perform unqualified work. The latest12 event reviews are preserved.

The work desk and career picker display learning coverage. The professional notebook shows corrections, reference links and the latest career event result, with keyboard focus moving to the result after answering. All content works locally/offline. See [PROFESSIONAL-CONTENT.md](./PROFESSIONAL-CONTENT.md) for sector coverage and reference entry points.

```
node --test --test-isolation=none career-365/tests/*.test.js frogger-jump/tests/*.test.js
CAREER_URL=http://localhost:5281/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/professional-practice-browser.mjs
CAREER_URL=http://localhost:5283/games/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/professional-practice-production.mjs
```


## 時代熱潮與新專精（2026-11-04）

新增時代小誌：九個主題按遊戲月份經過新芽、成長、擁擠高峰、冷卻和日常化。AI、深偽信任、算力能源、數碼支付、IP收藏、盛事旅遊、銀髮、寵物及氣候成本融入原有職業，各有三章故事與可免費拒絕的選擇；咖啡師另有AI無人咖啡街情節。可主動探索或關閉自動遇見，舊職故事與原職務一起保留。

12項新專精可與本業並行，相關／跨領域分別需至少3／6個月及3／6課，最多兩項，可暫停並跨轉職保留。完成不取代實習、授權或正式資格；有償委託只限合適且具資格的角色。熱度影響交付獎金、議薪機會與小幅虛構市場／創業成本，不自動提高薪酬代理值。

資料快照截至2026-11-04，介面列來源日期；2027年以後清楚標成虛構演化，離線不推進時鐘。27題主題常識加入原題庫，共243題。時代選擇收進本機／帳戶／私人雲端快照、漫畫與65歲結算。舊檔補預設值，沒有新的Firestore集合。詳見 [ERA.md](./ERA.md)。


## 整體檢視後的更新（2026-11-04）

- 人生改用 IndexedDB：漫畫逐格追加，狀態與版本原子保存；原有本機／帳戶 JSON 自動遷移，匯出和雲端快照仍是完整人生。localStorage 只留小型摘要與通知。瀏覽器不支援時退回原有保存方式並保留備份提示。
- 同一人生用跨分頁鎖及 IndexedDB 比較版本，舊分頁須明確載入最新進度，亦可先匯出目前版本。不把舊狀態覆蓋新進度；無 Web Locks 時仍由資料庫交易阻止兩筆相同版本同時提交。
- 介面保留既有節點、焦點、展開狀態及未變動的 SVG。漫畫與角色圖像快取；職業清單每頁30種，搜尋索引預先建立，仍可找到全部405份職業。每日成長沒有變化時不重複寫入。
- 受規管職業的理論／AI學習不再增加受督導實習。工作情境才累積相應實作；舊存檔已取得的實績和資格保留。理論練習另外顯示。
- 創業按需求及有限產能在月結收營業額，材料、店租、薪酬分列；主人解難增加留客，不重複派同一筆營業額。招聘增加產能，客源有上限／流失，行銷有遞減效果。全部是可比較的遊戲模型。
- 時代三條路線留下作品、固定服務關係或合作網絡；後續輪次承接過去，跨職保留。作品改善相關交付，夥伴改善成功機會，具資格及相關工作範圍的固定服務每月合計最多$480；不符合條件不派收入。退休仍可唯讀回顧。
- 學習中心比較一年制進修、保留本業兼讀、技能／受督導實作及12項專精，顯示費用、年期、成果與資格界線。每種原有入口仍可作快捷操作。
- 12種代表職業另加24個日常個案與官方閱讀入口，工作案例總數226。薪酬初級／第4級／第8級範圍明示為同一官方組別代理值套用遊戲職級，沒有冒稱新增個別職位薪酬調查。
- 預算顯示例行／額外流入、固定必要／其他支出，並提供最多12個月推算，65歲停止。首期扣除本月已入帳工資，防止重複計算；不假設升職、未知事件、投資增值或額外接案。原先存檔缺少的本月交易無法完整回溯，更新後開始累積完整月度分類。

詳細模型、遷移及驗收見 [REVIEW-UPDATE.md](./REVIEW-UPDATE.md)。
