# 蓄力連連跳 · Frogger Jump 2.5D

An independent, bilingual, one-finger endless jumping game at `frogger-jump/`. It is deliberately absent from the landing-page cards and has `listed: false` in the shared game catalog. Open its URL directly. No account, server or paid API is needed.

Hold the river, lower control, left mouse button or Space/Enter. The power meter floats above the frog’s head and blends green → yellow → red as power increases. It goes 0 → 100 → 0; release to jump. The frog automatically aims at the next stump. Power determines world-space distance, and landing tolerance uses the target's circular top radius. Successful hops count once, replace the oldest of three stumps and anchor the frog at the new top centre. A smooth following camera preserves the three-log view. The frog kicks off, tucks its hind legs, reaches forward before touchdown, then compresses and settles with a brief blink. Its landing gently nudges the log and sends two fading ripples across the water. These bounded effects stop after 650ms and are suppressed with reduced motion. Missed jumps drop the selected animal straight into a small, round comic red crocodile’s already-open mouth on the first failed-landing frame, with a brief water ripple before the score and best run appear.

- The first 20 landings use a gentler river: normal radius 62, gaps 144–196, 5% small pads (radius 46–53), and 2.5% each for sinking, thorns and fish. From landing 21 to 100, these gradually return to radius 58, gaps 152–208, 9% small pads (42–49), and 5% per hazard. Special pads gradually rise from 8% to 12%. Mixed I/Z routes and the one-visible-danger limit remain. Upcoming visible pads use their projected landing number; existing pads never resize when the score increases.
- Candidate hazard roll: 5% sinking, 5% thorns, 5% anglerfish lure. Additional hazards are suppressed while another remains in the three visible pads. Top-size variation is independent.
- Thorns redirect auto-aim to the third log. Clear the thorn in one jump; it counts once and replaces two preview logs. Adjacent thorn logs are prevented so a safe target is always visible and reachable within the 540-unit maximum.
- Anglerfish warn at the midpoint of the next gap for 1.2 seconds, leap to a height of 160 world units over 900ms, then submerge for 1.4 seconds before warning again. The shared 3D path detects contact during a jump, including delayed frames. Standing on a pad is safe. Cross before the leap or wait until the fish dives. Pause freezes both warning and leap timing.
- Dark logs start a 2.5-second active-time deadline on landing, not while previewed. Leave before the deadline, even if it expires during flight. Cancelling a hold does not reset it.
- Pause/hidden pages freeze jumps, charging, camera, crocodile and trap time. Pausing cancels a held input so returning never launches a stale jump. Pointer cancellation and secondary fingers cannot create extra jumps.

The best three positive runs are stored under `frogger-jump.records.v1`, separately from every other game. Invalid saves are ignored; unavailable browser storage falls back to this visit. A completed result is recorded only once. Sound is off initially, opt-in, synthesised locally and suspended after brief feedback. No microphone, motion or location permission is requested.

Canvas targets 60 fps during jumps and 30 while charging, watching moving pads or using reduced motion. Scheduling sleeps between frames instead of polling each display refresh. Device pixel ratio is capped at two and large backing stores stay near two million pixels. Normal idle stumps, setup and results stop requesting frames. The scene has three platforms, one selected animal, bounded ripples and one predator, with no external textures, filters or particle DOM. Water scenery is static and rasterized once per size. Stable wood/lily sprites are cached for the visible trio; moving pads, sinking warnings and landing reactions remain live. Font readiness, language, skill changes and resizes invalidate the appropriate artwork. Reduced-motion mode suppresses decorative shaking while preserving essential jump timing. The local service worker preloads the game and shared UI; the site builder produces content-hashed assets, Apache cache rules and update-aware production workers.

Run `npm test` here or `node --test --test-isolation=none frogger-jump/tests/*.test.js` on Node 22+ when test subprocesses are restricted. Run the root static server with `PORT=5260 node grid-rush/scripts/serve.js` and open `/frogger-jump/`. Browser acceptance uses `scripts/browser-check.mjs`; `FROGGER_URL` selects a source or production preview and `GRID_RUSH_PLAYWRIGHT_MODULE` selects Playwright.

## River friends update

Base platforms mix wood and water lilies (40% lily candidates), with 9% small-platform candidates. Seven special platforms can replace safe candidates, as described below. Both surface types have large and small variants. The meter above the animal has no visible percentage; its shape tapers from thin to thick while power changes green → yellow → red. Failed low-power hops finish in open water rather than falling through the starting log. Crocodile capture starts immediately on a missed landing; an airborne fish collision captures the selected animal immediately at the collision point.

Animal prices in **golden Frog Coins**: frog free, penguin 280, bunny 320, monkey 360, otter 400, duckling 440, tabby cat 480, panda 520, fox 960, capybara 1,000 Mochi starmouse 1,080, Chiikawa 1,200, Hachiware 1,360 and Usagi 1,520. Existing unlocks remain owned; no extra payment is requested for an already-owned friend. Existing wallet balances and rewards are unchanged; the currency now uses a small, static gold frog-face SVG in the wallet, shop and results. One skill use starts every run; every twentieth **successful landing** adds one more, with no low fixed cap. Clearing a thorn and skipping a platform still counts as one landing, not two. Skills work while standing/charging, cancel an unfinished charge safely, and cannot be spent in flight, on pause or after falling. Frog clears thorns or enlarges a pad; penguin stabilizes timed hazards underfoot/ahead; bunny provides a big landing cushion; monkey clears all next-pad hazards; otter drives away fish and enlarges the next pad. Duckling stabilizes its occupied timed pad and clears/widens the next thorn pad; Cat cushions the next landing and clears/widens thorns; Panda stabilizes timed hazards underfoot/ahead and widens the next pad; Fox clears next-pad hazards and cushions one hop; Capybara clears timed hazards/thorns underfoot and ahead. Mochi starmouse clears/widens the next pad and gives one fish collision shield for the next hop. The shield is used by the next hop whether or not a fish is encountered, and cannot carry into a later jump. Each skill remains available while standing or charging. The charge climbs to full in 1,000ms (previously 950ms), giving a slightly wider release-time window.

A completed run pays **1 + 2 × successful landings + 10 × floor(landings / 20)** coins. Results settle once per run. Leaving a live game earns no reward. Guest wallet key `frogger-jump.profile.v2` preserves name, animals, coins and best score separately from the old top-three records. Existing records remain available; no anonymous old score is silently uploaded to a named global account.

The UI includes Google and Firebase email/password sign-in, account creation, unique name reservation, a per-player wallet, cloud purchases, a top-ten leaderboard showing the winning animal, and a retryable pending-result queue. Cloud names accept 2–16 Chinese characters, Latin letters, digits, `_` and `-`; NFKC normalization and lowercase Latin keys prevent lookalike duplicates. Public ranks contain one personal best per UID, sorted by score descending and first achievement time ascending.

Pending cloud results are kept per account, including when another account plays on the same device. The original single-result save is read automatically. Concurrent retries for a run share one request; replay settles the signed-in account's pending results first. A delayed settlement cannot replace a different account's displayed wallet. See [TASKS.md](TASKS.md) for completed and remaining work. The isolated browser sync regression is `FROGGER_URL=http://localhost:5260/frogger-jump/ node scripts/sync-check.mjs` when run from this directory with Playwright configured as above; it replaces the cloud boundary and does not use production accounts.

**Firebase web configuration is supplied:** `src/firebase-settings.js` targets `sky-playground-3c5af` and enables the cloud UI. Email/Password Auth, the Firestore database, published rules and the ranking index must also be configured in Firebase Console. No production account or rule/index deployment was created by the assistant. Local practice remains unranked with a separate wallet. See [FIREBASE.md](FIREBASE.md).

## Seven new platforms

Safe-pad candidates have a 12% chance of becoming one of seven variants; wood and lilies remain dominant. At most one dangerous pad (including ice) is present in the three-pad view.

| Pad | Interaction |
| --- | --- |
| Blooming lotus | Top gradually opens/closes; centre landing adds 2 coins. |
| Turtle | Slow lateral swimming; auto-aim predicts its centre at touchdown. The rider follows the shell. |
| Mushroom | Landing squashes the cap; centre landing adds 12 units of tolerance to the next hop only. |
| Duck | Squeaks and gently carries the rider forward for 440ms; charge becomes available after settling. |
| Cracking ice | Three crack stages and a 3.5-second landing-triggered deadline; Penguin can reinforce it. |
| Turning leaf | Slowly rotating veins and a changing safe radius; wait for the wider surface. |
| Shy shell | Opens after landing; the centre awards 3 pearl coins; edge landings remain safe. |

Surface rendering, character anchoring and landing checks share `src/platforms.js`. Moving surfaces use the paused game clock. Bonus coins settle exactly once with the base reward; Firestore accepts only integer bonus amounts between zero and three times the successful-landing count. Publish the updated rules before enabling cloud bonus payouts. Old receipts without bonus fields still work.

Google sign-in uses Firebase Auth's popup flow and existing UID-owned wallets. New accounts must reserve a unique name before playing ranked games. Enable **Google** under Firebase Authentication's sign-in providers, select a support email and authorize the actual website domain; no Admin key is needed. See `FIREBASE.md`. Local practice and cloud wallets remain separate.

## Rendering and startup performance

- Static scenes and paused/backgrounded games stop the animation scheduler. Moving-pad waiting scenes use a timer-assisted 30 fps cadence; charging runs at 30 fps while flight retains 60 fps; release power uses the current game clock rather than the last painted frame.
- Repeated HUD values do not rewrite attributes. The head-level power bubble moves with a transform instead of layout-affecting top/left writes.
- Cached water and a maximum of three wood/lily sprites reduce repeated paths and gradient creation. Buffers reset only when size/resolution actually changes; the large-canvas resolution budget trades excess Retina pixels for lower rendering cost.
- Animal poses are quantized to 0.05 steps and cached in at most 48 bounded sprites per scene. Shared portraits cache up to 48 species/size/display-scale combinations. Resizing invalidates scene sprites.
- Cloud Auth restores on entry, while the larger Firestore module loads on the first actual cloud-data operation. Signed-in wallets still restore automatically; local practice does not need Firestore.
- `scripts/performance-check.mjs` measures Canvas operations, DOM mutations, frame callbacks, backing-store size and initial script bytes. Set `FROGGER_EXPECT_OPTIMIZED=1` to assert budgets; `FROGGER_PERF_REPORT` writes a JSON report. Its startup check blocks remote services and does not create accounts or send scores. See `VERIFICATION.md` for the before/after measurements and their limits.

## River friends and ranking badges

The top ten keep the existing Firebase ordering and one personal best per player. Ranks 1–3 have gold, silver and bronze cup SVGs; ranks 4–10 have individually colored numbered ribbons. Local top-three records use the same cups. Icons are static, and rank numbers have accessible labels. New animals use small Canvas paths with the existing jump/landing poses; the update adds no idle animation loops or image downloads.

**Publish the updated `firestore.rules` to `sky-playground-3c5af` before releasing the new cloud animal purchases.** The rules expand the allowed species, exact price map and maximum owned collection to twenty-two without altering existing wallets, names, scores, rewards or public ranking queries. A GitHub Pages deployment does not publish Firebase rules. Local purchases and skills work without this cloud step.

## Compact riverbank layout

The account/sign-in entry lives at the top right, beside the language controls; it becomes an icon-only control with an accessible label on narrow phones. Animal Shop and World Top 10 share an equal-width action row. The game title stays on one line and the old introductory slogan is removed. Result names also stay on one line, including the supported maximum of 16 Chinese characters; trophy sizing, responsive name text and contained confetti avoid horizontal overflow. Player-facing labels use Wallet, Sign in and World Rankings while retaining the separate practice/account balances.

Signed-in players see their own world rank below their name and in the leaderboard dialog, including ranks beyond the top ten. Zero-score players show “unranked.” The count uses the same score/time/document-ID ordering as the public leaderboard and refreshes after a new personal best or manual leaderboard refresh. Rank reads are cached briefly and never polled. Login/account changes discard obsolete responses, and a failed request offers retry without blocking play. Publishing the updated Firestore rules is required for the authenticated aggregate query; see `FIREBASE.md`.
## Google, email and anonymous sign-in

The account dialog supports Google, anonymous and Email/password sign-in. Anonymous play creates a persistent Firebase identity, reserves a nickname and participates in the normal wallet/world leaderboard. Anonymous players can link Google or Email while retaining the same UID, coins, animals and scores. Signing out of an unlinked anonymous account requires confirmation; switching to an existing separate account does not automatically merge progress. Unranked local practice remains separate. Enable the Google, Email/Password and Anonymous providers in Firebase Console before public use; see `FIREBASE.md`. Provider secrets belong only in the provider console.
Missed jumps now show the same directional coaching immediately in the play footer and in the result panel: hold a little longer for an undershoot, or release earlier for an overshoot. The text explicitly refers to the rising half of the ping-pong power bar. Thorns, sinking pads and fish retain obstacle-specific advice. Restarting clears the previous hint.
## Compact controls and matching animal portraits

All weather overlays are removed: no drizzle, sunshine or post-rain rainbow. The weather module and its timer are removed as well. The skill button is back beside the bottom hold-to-charge control with a 44px touch target. Shop/world-ranking actions are 52px on phones and 56px on larger screens. The selected animal and player name share one line. Personal world rank has its own full row underneath; long names remain on one line with an ellipsis without losing their full DOM text.

Player, skill, leaderboard, shop and sign-in portraits share the same cached drawing code. Mochi starmouse is an original cream-coloured round-eared animal with rosy cheeks, a mint pouch and a star. Its soft proportions and expressive face take inspiration from the cute small-animal style requested for this update.

Run `scripts/fish-ui-check.mjs` against the source server for warning/leap/collision/shield, weather removal and responsive-control checks. It injects a test-only game-instance hook into the served module and disables Firebase. `scripts/browser-check.mjs` also runs against a production build and now times hops around the fish. See [TASKS.md](TASKS.md) for the cloud-rule release dependency.

## Chiikawa-inspired comic friends

Three additional Canvas-drawn friends use the small round bodies, large expressive faces and pastel manga features of Chiikawa, Hachiware and Usagi as their visual references. They are separate catalog entries, so the existing hamster, cat and bunny unlocks remain available. All portraits, shop cards, rankings and game poses share the cached renderer.

| Friend | Frog Coins | Skill |
| --- | ---: | --- |
| 小可愛 / Chiikawa | 1,200 | Courage cheer: one-hop fish protection plus a soft landing and a slightly wider actual target, including thorn skips. |
| 小八 / Hachiware | 1,360 | Friendship bridge: clear hazards on both upcoming pads and widen the next; a timed pad underfoot still needs a prompt departure. |
| 兔兔 / Usagi | 1,520 | Yaha bounce: stabilize the timed pad underfoot, widen the actual target and cushion the next hop. |

The source worker is v26. The Firestore species list, exact-price map and maximum owned collection now support fourteen animals. Publish those rules before cloud purchases of the three new friends; local purchases work independently. Existing owned animals and wallet balances are preserved.

## Island friends and the two-row player profile

Eight additional selectable friends bring the catalog to **22**. The selected animal and name occupy the first player-summary row, while the world rank starts a separate row below the whole identity row. Local-practice/account notes remain separate, and the wallet stays alongside the summary.

| Friend | Frog Coins | Skill |
| --- | ---: | --- |
| 栗子頭 / Kurimanju | 1,600 | Chestnut comfort: stabilize underfoot, remove the target fish and widen the target. |
| 海獺師傅 / Rakko | 1,880 | Master wavecut: stabilize underfoot, clear both upcoming hazards and widen the next pad. |
| 飛鼠 / Momonga | 1,760 | Fluffy escort: stabilize underfoot, clear/widen the next thorn pad and shield one hop from fish. |
| 獅薩 / Shisa | 1,840 | Shisa ward: clear upcoming thorns, widen the target and cushion the next hop; timers keep running. |
| 味自慢大叔 / Shimajiro | 1,920 | Island rescue: clear hazards underfoot and on the next pad, then widen it substantially. |
| 美人魚 / Mermaid | 2,000 | Mermaid song: remove upcoming fish/thorns, widen the target and cushion the next hop. |
| 一葉 / Hitoha | 2,080 | Leaf path: clear/stabilize/widen the next pad, preserving the timer underfoot. |
| 二葉 / Futaba | 2,160 | Twin-leaf ward: stabilize the trio, widen the actual target and shield one hop; thorns remain. |

The mermaid artwork uses the black/white head and red-tail Siren interpretation; Hitoha and Futaba are separate faceless grey islanders with one and two leaves. Artwork references: [official character guide](https://www.chiikawaofficial.com/characters) and [official movie characters](https://chiikawa.toho-movie.jp/atm/characters.html). All game artwork is drawn locally with the shared cached animation poses; no reference-site images are downloaded by the game.

Source worker **v29** preloads the island-art module. Publish the updated **22-species** Firestore rules before cloud purchases. No existing animals, balances or achievements are migrated or removed.

Rakko now uses white fur, a warm-brown head cap with white forehead tufts, a cross-shaped scar, white cape, gold collar clasp and a sword. The reference is the [official character page](https://www.chiikawaofficial.com/characters/). Kurimanju carries a foamy amber beer mug. Usagi’s Traditional Chinese display name is 兔兔; persistent species IDs stay stable. Publish the updated Firestore price rule for new Rakko cloud purchases at1,880 coins.

## Rendering performance update

The static river artwork is displayed on a separate, non-interactive Canvas layer instead of copied onto the scene every frame. Stable special-pad sprites now share the pad cache; turtles are positioned from the live surface each frame, while breathing/spinning pads, sinking traps and landing reactions retain dynamic rendering. Frequently reused animal poses use bounded LRU caching, and same-DPR resizes retain their sprites. Power colour and meter positioning update together to reduce DOM mutations. The main Canvas pixel budget,30Hz charging/idle animation and60Hz jump cadence are retained. Source worker isv30.

In the matched390×844 one-second source workload, charging still rendered32 frames: HUD attribute mutations decreased128→96 and drawImage calls160→128. Settled turtle idle still rendered31 frames but issued0 ellipse calls instead of372. These are operation counts, not a measured guarantee of higher FPS or battery life on every device.


## 技能可用次數累積

動物技能次數在同一局累積：開局1次，每成功落地20次加1次，最多存3次，發動一次扣1次。若一直不用，20／40／60跳時分別有2／3／3次；滿額時不再增加。重新開始一局由1次起步，沒有跨局轉存。

20跳里程碑會報告新增次數或已存滿3次；按鈕、說明與讀屏文字使用相同規則。通用技能每局只可使用1次，不會在里程碑補充。護盾及軟綿保護的強度／消耗維持原有規則。Source worker v33；不改錢包、Firestore欄位或規則。

## 河岸收藏與跳躍更新（2026-11-11）

- 動物商店共30位角色，全部或系列內都按價錢升序；可按一般動物、Chiikawa靈感、芙莉蓮靈感、皮克敏靈感、混搭朋友分類，並只看已購買。
- 新增悠悠長耳法師、紫藤小法師、緋紅小戰士、紅／藍／黃花苗、兔兔花苗與長耳魔法水獺，使用本機原創可愛漫畫向量繪圖與各自技能。
- 河中夥伴為泡泡河馬、滑翔魔鬼魚、護航小鯊魚；每局只能裝備一隻、支援一次。河馬接住失足／下沉；魔鬼魚修正落腳範圍外18以內的近失誤；鯊魚在動物護盾用完後擋一次燈籠魚。牠們不永久移除河流危險。
- 通用技能永久購買、每局裝備一項：跨兩格、空中微調（跳前啟用，最多修正28）、緊急浮葉。每局只可使用一次，不會補充；動物專屬技能每20跳補充一次，最多存3次。
- 每次落地顯示本次合計：普通2幣、荷花花心3幣、貝殼正中心5幣；每20跳的額外10幣另列。結算仍為每局1幣＋每跳2幣＋里程碑＋有上限的落點額外獎勵，保持舊待同步紀錄相容。
- 保留真實落腳位置，不吸到平台中央；移動平台會帶著角色的相對位置移動。失敗時沿起跳方向落水，過頭距離與力度相符，短跳與長跳有不同慣性與翻倒動畫。幾乎未離開起點的失衡沿前緣落水，不橫向瞬移。
- 烏龜平台移動頻率由0.75增加至0.9（+20%），預瞄、繪圖與碰撞共用同一surface函數。
- 動物使用各自的起跳、擺動與落地參數；飛行、蓄力及落地的有限幀圖集於開局預熱。跳躍採requestAnimationFrame，HUD降至約30Hz；靜止與暫停時停止繪圖，畫布約140萬像素上限。
- 遊戲內ⓘ可查看動物、通用技能與夥伴說明，桌面支援hover／鍵盤，點擊開詳情會暫停所有遊戲時鐘，關閉再繼續。「跳得遠，不如跳得準」改為accordion，葉子移至主標題前。
- 20跳後出現蜻蜓、螢火蟲與郵差青蛙；可選較闊落點或小落點額外1幣的路線，郵差提供可選中心落地加1幣挑戰，單次額外獎勵仍最多3幣。前20跳難度安排保留。
- 已購角色、技能與夥伴使用同一UID的Firestore交易保存，頁面可見帳戶支援即時收藏更新。舊帳戶缺少裝備欄位時視為未購買，原有動物與餘額不重設。本機試玩錢包仍與登入帳戶分開。

需先部署本資料夾更新的 `firestore.rules`，再發布含新購買項目的前端。未部署時新系列／裝備購買會被拒絕，不會先行扣款。這次沒有自動部署正式Firebase規則。
