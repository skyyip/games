# 365行，行行出狀元

A new independent, Traditional Chinese life/career simulation at `career-365/`, integrated with the existing Sky Playground static build. It remains unlisted on the landing-page cards, like the other newly developed standalone games; open its route directly. Local play requires no account or paid API. Optional Email, Google and anonymous Firebase sign-in identifies players.

The paper-like cream/sage/coral interface uses locally drawn Q-style SVG characters, illustrated panels and speech bubbles. Every important career, financial and story decision records a dated frame. Recent panels appear on the dashboard; the full book is paginated without dropping older frames. There are no perpetual animation loops, remote character images or external AI calls.

## 職業體驗主流程（最新版）

主畫面以目前身份、眼前任務與專業成長為主；「開始本章學徒任務／接一個職業任務」直接放在下一步目標旁。每月仍有兩次安排，也可選擇休息或其他人生。投資、社交、感情、生活與進修保留在次要入口，IQ／EQ／PQ／JQ詳細資料沿用履歷的收合說明。

1. 選擇職業與起步學習偏好。任務中可同時請教師傅、查看AI輔助教材，並非只能二選一；教材由遊戲內容提供，不連接外部AI服務。
2. 接任務後免費查看現場線索、帶教提示及相關觀念題。答錯可閱讀解析並訂正，沒有額外扣安排或即時刷取屬性獎勵。
3. 最後選擇具體處理方式才使用一次安排。工作基礎18精力；深入覆核另8精力及$180，協作另4精力，有限交付另$90；成本與取捨在選項旁列明。月薪沿用既有規則，不重複發放。未確認前可返回本月安排；另選的PQ整理仍按其明示成本結算。
4. 收到「哪一步、帶來影響、下次怎樣做」回饋，累積本職業四項能力、觀念與實作證據。需要補強可選一次安排的14精力弱項補練，做法成本另列；補練不算受督導實作，也不另發月薪。

星級主廚、水電工、AI代理工程師、YouTuber、護理師、殯儀統籌師、試吃員、神秘顧客各有五章帶教目標與專業能力：「跟著觀察 → 協助準備 → 受督導實作 → 檢討與補練 → 整合評核」。使用現有職業個案、工作連載及官方來源觀念題，讓不同階段有明確學習要求。其他職業提供領域課程；選職業時明示內容深度，不把405種職業全部稱為完整專屬劇情。

出師清單同時列出章節、能力與觀念、實作、訓練月數、熟練度，以及受規管職業的模擬資格程序。新流程的考核依已具備的證據，不再抽籤決定；認可訓練、受督導年期及資格界線仍保留，AI教材不授予牌照。工作階段逐步提高交付要求，合作信任與返工／轉介伏線會延續。升職所需的新實績取自當前職業，轉職保留原職業紀錄及已取得的遊戲資格。

完成五章及能力要求後，可以先預覽最多3／12個月例行訓練的收入、必要支出、現金與債務，再確認安排。它逐月完成受督導訓練與休息，照常結算市場、健康和生活費；遇故事、病況、出師或資格考核便停下；一般年度規劃也會在待確認考核前停下，不代答重要決定，也不使用每日跳月額度。所有人生路線仍到65歲總結。

私人存檔新增有上限的 `life.vocation.jobs` 與可續接的任務狀態；舊存檔只補空白容器，不改變資產、種子、技能及已取得資格。相容本機、JSON及既有私人雲端payload，沒有新Firestore集合、索引、Functions或規則部署要求。

## A playable life

- Draw a seeded resume with gender, starting age18–26, illustratively generated adult height clusters, height-correlated weight generated from BMI19–29, blood type, zodiac, family, school, major, MBTI and IQ/EQ/PQ/JQ. Appearance and gender do not gate professions. The major grants a starting skill.
- Search **405 distinct named jobs** across **25 categories**, including chef, plumber, YouTuber, pet communicator, blockchain engineer, metaverse architect and AI prompt specialist. These are curated career names; category-based routines and shared events provide the initial career scenarios rather than405 bespoke story campaigns.
- Mentor study is slower, builds EQ/JQ/contacts, can uncover secrets and passes along contacts on graduation. Simulated AI study is faster and develops IQ, without an automatic EQ penalty, and with a hallucination branch. A $300 checked lesson avoids that branch. Learning is a game mechanic rather than an actual training service.
- Each month offers two arrangements: a recommended focus and one free choice, in addition to regular employment and persistent habits. Study/work consume energy; rest and social time restore the player differently for I/E personalities. Social events also offer a personality-specific choice. PQ is an article-inspired, fictional Positive Intelligence Quotient (0–100%), complements IQ/EQ/JQ, buffers stress growth and develops through rest, exploration and optional reflection. It is not a player psychological assessment. Health sets the energy cap; overtime and high pressure can cause illness and bills.
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

Source service worker `career-365-app-v24` preloads the game and shared language/update/font modules. The production site builder supplies content-hashed assets and an update-aware offline worker. No existing game's cache or progress is cleared.

## Development

From repository root:

```
node --test --test-isolation=none career-365/tests/*.test.js
PORT=5260 node grid-rush/scripts/serve.js
CAREER_URL=http://localhost:5260/career-365/ GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright node career-365/scripts/browser-check.mjs
PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs _site
node tools/check-seo.mjs _site /games/
```

The current vocational browser check is `scripts/vocation-browser.mjs`. The broader browser scripts cover phone/landscape/desktop layouts, a complete life through actual planner/choice controls, HTML/PNG/JSON downloads, invalid/valid backup import, denied storage and installed offline play. See [VERIFICATION.md](VERIFICATION.md).

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

Private cloud snapshots use revision-checked Firestore transactions, optional gzip compression and strict load validation; local progress is preserved on errors. They are manually reconciled across devices. Deploy this game’s independent `career-365/firestore.rules` and Firebase project; see [FIREBASE.md](./FIREBASE.md). A14-case emulator security harness is prepared, not certified in this environment. [PLAYTEST.md](./PLAYTEST.md) provides the5–10-player human review protocol; automated checks cannot establish that the game is fun.

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


## Firebase 專案拆分

本遊戲現在只讀取本資料夾的`src/firebase-settings.js`、SDK入口、Firebase套件與`firestore.rules`；不再從青蛙遊戲取得設定或發布合併規則。已填入獨立專案`sky-playground-career-365`的公開設定；青蛙保留`sky-playground-3c5af`。正式登入／雲端仍須在新專案啟用Provider、設定授權網域及部署本資料夾的規則。本機遊玩與備份維持可用；相同projectId搭配另一個appId仍會被視為同一專案。登入標記、本機帳戶及回顧依新projectId隔離，舊資料提供明確匯出遷移，沒有刪除或自動搬移雲端資料。詳見 [FIREBASE.md](./FIREBASE.md)。


## 簡化後的每月玩法

每月先選一個重點，再作一次自由安排。推薦內容會跟隨工作、學生、旅行、海外打工或財務自由生活改變；也可在「其他人生選擇」改選活動，並不強迫每月工作。兩次安排完成後查看月結，不消耗每日12次跳月額度；未完成而略過其餘安排才使用額度。舊存檔保留資產、待決故事、職涯與漫畫，剩餘安排轉為最多兩次。

主畫面聚焦目前職業、故事、現金、健康和壓力。主角與完整履歷可展開IQ／EQ／PQ／JQ、專業技能及其成長說明。工作主要提供三個選擇，用短句說明取捨，完成後直接解釋交付結果；較早存檔或時代企劃的額外回應仍可展開，不刪除選項或改動既有選擇的索引。

月結集中顯示收入、開支、收支差額、健康／壓力與技能變化；例行薪金、持續習慣及生活費自動計算。詳細帳本、生活安排、進修、時代企劃、感情、創業、轉行與旅居均從同一入口開啟，原有資格與資金要求仍適用。自動突發故事每月最多一個，跨類型及重新登入共享限制；延後跟進保留在隊列。玩家主動參與時代企劃、職業練習或高風險活動所引發的必要結果另行處理。

投資可先選「現金為主／均衡配置／高波動配置」，只產生預覽，需確認才交易。三種預設以20–80%現金為目標，交易成本會令實際比例不同，市場風險仍存在；亦可展開手動金額／目標比例和全部八種資產。預設不會每月自動重配或收費，現有持倉會繼續保留。

職業選單先展示8種代表職業，可隨時查看或搜尋全部405種。人物信任、工作連載、延後委託、65歲結局及完整人生繪本均保留。


## 玩家社群與合作公司

「其他人生選擇」加入Spark相容的玩家社群，可建立動物名片、好友邀請、快捷訊息、公司招募／申請／推薦、合作條件協商、文字委託、負責人人工確認及退休交接。支援Email／Google帳戶，匿名可先綁定。只需要Authentication及Firestore，不需要Cloud Functions或Blaze；不設合作點或自動評分。新版委託完成後雙方各有私人合作紀錄，可在「合作紀錄」領取有限的IQ／EQ／PQ／JQ成長：每帳戶每日及每人生遊戲月各三次，綁定原人生、重載不重複；離職仍可查看。需先部署新版Firestore規則，沒有新增複合索引。詳見[SOCIAL.md](./SOCIAL.md)。

部署本遊戲的規則及三個Spark社交索引後，再發布網站。設定、權限、免費配額與驗收步驟見 [SOCIAL.md](./SOCIAL.md)。原有單人玩法及離線存檔保留。

## PQ：辨認反應、練習五力與選擇下一步

依玩家提供的[文章節錄](https://melodyliao.cc/215/eq%E4%B8%8D%E6%B5%81%E8%A1%8C%E4%BA%86%EF%BC%8Cpq%E6%89%8D%E6%98%AF%E4%BA%BA%E7%94%9F%E6%88%90%E5%8A%9F%E5%B9%B8%E7%A6%8F%E7%9A%84%E9%97%9C%E9%8D%B5)，把「批判＋九種心魔」轉為十種可自行留意的自動反應，並加入同理、探索、開創、領航、啟動五力。這些不是人格分類、診斷或道德分數，亦不由性別、MBTI決定；「受害者」模式以「陷入無力感」呈現，明確保留承認痛苦、求助及保護自己的選擇。

入口：「其他人生選擇 → PQ心智練習與心聖五力」。感官覺察可以由約10秒開始，一次安排代表本月留出練習時間。每個遊戲月可練習一次，消耗一次安排及6精力，基礎PQ成長2.2按現有小幅成長遞減計算，壓力下降6；不收費、不直接加薪，不增加專業技能或資格。五力與反應記錄由玩家自選，沒有真實倒數、每天100次或21天連續打卡門檻；漏練不扣分，也不清除過去經驗。

405種職業的工作情境及職場突發事件、部分家庭／人際故事會提供可收合的「先整理感受，再回應」。每月一次，消耗4精力、不另佔安排；準備後仍須選擇原有做法，完成有效決定後才記錄。職場中，同理對應協作、探索／開創對應覆核、啟動對應有限交付、領航依本次重點選擇做法；契合時可有1–3分支持，仍可能不通過。契合的回應另有小幅PQ成長與減壓；不契合時只有少量減壓，沒有額外PQ。職業原有費用、資格、安全與後續保留。家庭中，已同意的正向互動可獲最多1點親密度支持，拒絕交往及不婚不育仍是有效選項；不會自動建立或修復感情。

不在騙案、被困、成癮誘惑等危險情境提供「把傷害當成禮物」的按鈕。壓力仍透過既有系統影響健康，醫療與支援功能保留。PQ不是永遠樂觀或忽略風險，EQ也沒有被移除。原文所述研究數字未在此獨立核實，不套用37%銷量、延壽10年、3:1臨界點等固定倍率或保證；人生仍在65歲結算。

月結顯示實際PQ淨變化、練習及回應次數；每日成長回顧沿用既有PQ差額。最近12份練習紀錄保存在自己的本機／JSON／私人雲端人生中，退休總結會回顧常用五力；不公開到社交名片。舊存檔保留原有PQ及隨機種子，只補空白紀錄。無額外Firebase服務、資料集合或規則需求，仍適用Spark。

`src/pq.js`處理資料、遷移及遊戲規則，`src/pq-ui.js`處理說明與操作。`tests/pq.test.js`驗證成本、月限、儲存／恢復、職場支持、家庭同意、危險情境界線及65歲結局；`scripts/pq-browser.mjs`以真實本機人生流程驗證四尺寸及200%文字放大。測試不呼叫正式Firebase。

## 新手上路與勾選操作

首頁保留三步開局摘要，履歷與職業視窗保留具體操作提示。「玩法指引」入口統一放在頁尾，點擊後以modal顯示詳細內容；主畫面不再插入整張指引卡，側欄的「人生玩法筆記」也移入同一modal。開始、繼續或重新載入人生時不自動打開指引。

Modal依目前進度提供免費初次入行、進修、職業任務、故事選擇、剩餘安排、月結或退休提示。導向按鈕先關閉modal，再開啟相關視窗或將焦點帶到現有控制項；查看與關閉不修改存檔、不花資源。開局前亦可查看一般說明。支援Tab／Shift+Tab在modal內移動、Escape關閉及返回頁尾入口焦點，重開時從頂部閱讀。舊`guideDismissed`欄位保留相容，但不再用它自動顯示指引。每日成長回顧維持原有規則。

生活設定、社交名片、公司公開設定與招募工種的checkbox文字採獨立span，使用flex垂直置中；多行標籤同樣以整塊文字的中心對齊。沿用原生checkbox與label，點文字、空白鍵及FormData提交均保持原有行為；職業學習路線的radio也採一致對齊。主要字級13–16px、輔助文字最小約10px及兩欄性別／MBTI佈局保留。


## 轉職確認與返回安排

職業視窗會在確認按鈕旁顯示能否入行／轉職。首次入行仍然免費，不扣安排；轉職需現金 $3,000 及一次安排。安排用完、現金不足、正在復原或被困時會列出具體原因；現金不足會顯示差額。介面與真正執行轉職共用 `careerEligibility`，避免顯示與執行條件分離。

「前往月結，下月再轉職」只關閉視窗並帶到月結按鈕，不自動跳月或扣額度；復原時可返回休養與支援，其他情況可返回本月安排。正常月結、補足現金或完成復原後，重新開啟視窗便會按最新狀態啟用確認；同一段人生本次瀏覽保留未確認的職業選擇，毋須重新搜尋。失敗的確認不花費金錢或安排，已有技能、資格及轉職代價沿用既有規則。

延伸參考優先連到官方繁體中文版，沒有繁體時使用官方簡體內容；未確認有相應中文內容的來源保留原文並標示「英文」。薪酬報告、資格說明、職業教材及時代議題同步更新，模擬數值不變。


## 職業互動與漫畫頭像

職業任務加入可選的免費工作卡（排序／找缺口）、三種需求追問與師傅個性。咖啡師、水電工及AI代理工程師有專屬工作卡，其他職業有適用的交付流程練習；無倒數，可重試，答對只支持本次評核最多2分，不發即時屬性或薪金。既有章節、帶教信任、上次做法、返工／轉介後續與出師要求保留；介面顯示每階段累積的能力。

線索、師傅提示、AI教材、觀念解析、PQ整理與其他展開說明統一使用可關閉的彈窗。支援Escape、鍵盤焦點與重新查看；查看不扣安排，PQ整理仍明示4精力，確認職業做法才扣一次安排。延伸參考獨立成行，返回本月安排按鈕增加上方留白。

提供四十款受周星馳電影人物類型啟發的原創Q版漫畫頭像：廚神、密探、書生、功夫仔、片場追夢人、足球小將、捕快及發明家。新人生隨機抽取並保存，不依性別決定；履歷、角色卡、社交名片及人生繪本使用一致造型。舊存檔以原有造型索引遷移，不重新抽屬性。

合作委託可跨工種提出問題、退回補充、保留原交付內容並修訂，再由負責人確認與領取既有有限成長獎勵。有空再回覆，不設強制同時上線。

頭像第一批由8款擴充至20款，新增月光小行者、彩雲小仙子、烏龍小判官、機靈小寶、葫蘆小俠、幸運小高手、精武小拳手、破扇小濟公、七仔小萌友、飛刀小廚探、百變小機械及校園小臥底。新人生從目前全部40款抽取後保存；既有人生與漫畫格的頭像ID不變。社交名片同步支援40款，須先部署最新版Firestore規則以接受新增的頭像安全值；沒有新增索引或Blaze需求。

介面控制項更新：說明彈窗入口採用圓角卡片與「查看 ↗」提示，並標示dialog語意；統一按鈕、表單標籤與操作群組間距，主要點擊範圍至少44px。移除焦點outline，鍵盤操作保留底色／邊框顏色／連結底線提示。

第二批再新增12款：捲髮小房東、睡衣太極伯、拖鞋小宗師、禮帽小舞王、墨鏡小師爺、花傘小秋香、石榴小管家、花花小美人、玉笛小教主、碎念小唐僧、泡泡小人魚及饅頭小門將，合共32款。新款加入個別配飾、服裝、道具及可選表情；原有20款的ID和兩種情緒圖像保持不變。新社交造型comic-20至comic-31需部署最新版規則。

第三批再新增八款：金牌小狀師、護苗小園丁、整蠱小高手、桌球小神手、外賣小拳王、喇叭小導遊、書香小老師及紅纓小雙兒，合共40款。新人生會從40款抽取並保存，原有32款的圖像及ID不變。社交新款comic-32至comic-39需更新Firestore規則。
