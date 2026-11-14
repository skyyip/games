# Frogger Jump tasks

Updated: 2026-11-04

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

## Compact controls, airborne fish and starmouse · 2026-11-03

- [x] Run charging at 30 fps while keeping flight at 60 fps and exact-clock power release.
- [x] Add bounded gameplay-pose and shared portrait caches.
- [x] Give names 10px separation from world ranks; shorten shop/rank actions and the skill control.
- [x] Return the skill button to the lower controls next to Hold.
- [x] Remove rain and rainbow artwork and animation; retain occasional static sunshine.
- [x] Add advance warning and a high fish leap between pads, swept midair collision and immediate capture.
- [x] Preserve fish warning/leap timing during pause and hidden-page pauses.
- [x] Set Fox to 960 and Capybara to 1,000 Frog Coins; preserve existing unlocks.
- [x] Add original Mochi starmouse at 1,080, with one-hop Star courage fish protection.
- [x] Match the eleven-animal price/species contract in Firestore rules and expand the emulator fixture.
- [x] Pass 81 logic checks, all eleven animal/skill/reward checks, and four-size fish/shield/shop/layout checks.
- [x] Pass the 25-page release build, source/built metadata checks and production performance budgets.
- [x] Pass final production gameplay at four sizes, with 22 seeded landings each, fish timing, hazards, pause/background recovery, replay and stored records.

## Complete weather removal · 2026-11-03

- [x] Remove all drizzle, sunshine and post-rain rainbow overlays, styles and lifecycle calls.
- [x] Delete the weather scheduler and its obsolete tests; remove the module from the offline preload list.
- [x] Bump the source worker to v25 and update documentation/browser assertions.
- [x] Pass all 77 remaining logic tests, 25-page build/metadata checks and a 90-second no-weather browser smoke check with pause/resume.

## Chiikawa-inspired comic friends · 2026-11-03

- [x] Add separate Chiikawa, Hachiware and Usagi catalog entries with recognizable round-ear, blue/white-cat and long-ear manga artwork.
- [x] Share cached portraits and animated charge/jump/landing poses across shop, player, skills and rankings.
- [x] Add Courage cheer (1,200), Friendship bridge (1,360) and Yaha bounce (1,520), preserving the prior animals and prices.
- [x] Extend exact-price/species/owned-collection Firestore rules to fourteen animals.
- [x] Pass 82 logic tests, all fourteen source animal/skill/coin flows and the 25-page production build/metadata checks.
- [x] Pass the three new animals in the production build and four-size shop/rank checks, including their leaderboard portraits.

## Player profile rows and island cast · 2026-11-04

- [x] Put the selected animal and player name on one identity row, with personal world rank in its own row below.
- [x] Preserve account/practice notes, wallet placement and long-name overflow handling.
- [x] Add Kurimanju, Rakko, Momonga, Shisa, Shimajiro, Mermaid, Hitoha and Futaba as eight selectable characters, with distinct portraits and skills.
- [x] Keep Hitoha and Futaba separate and distinguish them by one/two head leaves; use the Siren-inspired interpretation for Mermaid.
- [x] Share existing sprite/portrait caches, animation poses, skills/rewards, player/rank icons and wallet persistence.
- [x] Extend the catalog/price/rules/owned-collection contract to 22 characters and update purchase fixtures.
- [x] Pass 91 logic tests, all eight source character flows, four-size shop/rank checks and three-size signed-in profile/rank regressions.
- [x] Build the 25-page production release and pass source/built metadata checks.
- [x] Pass all eight new character flows in the production build and four-size production-markup profile/rank checks, including the new two-row layout.

## Remaining

- [ ] Run the expanded Firestore emulator security harness. Previous verification recorded an emulator download restriction; these tests are not certified as passing.
- [ ] Publish the updated 22-character Firestore rules and verify live purchases for the comic friends and the updated Fox/Capybara/Starmouse prices. Confirm Email/Password Auth and ranking index in the configured Firebase project.
- [ ] Verify real cloud registration, unique-name collisions, purchases, offline retry, and cross-device rankings against the configured backend.
- [ ] Test touch controls, background/resume, and installed/offline play on physical iOS and Android devices.
- [ ] Exercise simultaneous results in separate browser tabs; this continuation shares requests within one page and does not add cross-tab queue coordination.

See [VERIFICATION.md](VERIFICATION.md) for evidence and [FIREBASE.md](FIREBASE.md) for backend setup and emulator commands.

## Performance update — 2026-11-04

- [x] Independent static-water layer, stable special-pad bitmaps with live turtle positions.
- [x] Bounded LRU animal poses and reuse across same-DPR resizes.
- [x] Combined power-meter styles;128→96 charging HUD mutations per benchmark second.
- [x]96 engine/render tests,7 platform UI flows,4 viewports with73 hops each and production performance budgets.


## 技能可用次數累積 — 2026-11-04

- [x] 明示同局開局1次、每20跳加1次、發動扣1次，未用次數可累積。
- [x] 里程碑顯示增加次數及當時總數，避免被落地提示覆蓋；發動後顯示剩餘數。
- [x] 按鈕title及讀屏標籤說明可用總數與累積／消耗規則。
- [x] 全22種動物80跳累積、事件餘額、連續使用、歸零／再獲得、暫停及新局重設的規則檢查。
- [x] 保留原有技能效果、初始次數、20跳門檻及跨局重設；不改Firestore規則。
- [x]101青蛙測試＋152行行出狀元回歸；來源與正式版四尺寸各60跳，含英文桌面流程。


## Firebase專案獨立 — 2026-11-04

- [x] 青蛙保留原sky-playground-3c5af設定；各自folder保存規則、索引、CLI設定及部署目標。
- [x] 移除Career365規則，青蛙預設拒絕其他遊戲路徑；現有玩家規則及錢包格式不變。
- [x] 發布前先備份舊Career365雲端資料的遷移指引；不自動刪除帳戶或文件。

## 2026-11-11 河岸收藏更新

- [x] 系列／價錢排序、已購篩選、8位新漫畫朋友與獨立技能。
- [x] 遊戲內技能tooltip與暫停詳情、guide accordion、葉子主標題。
- [x] 烏龜+20%、真實落腳位置、短／長落水方向與慣性。
- [x] 每次落地合計金額、花心3／貝殼5、里程碑另列。
- [x] 個別動物動作、預熱幀圖集、降低HUD更新與畫布預算。
- [x] 三種通用技能、三隻河中夥伴，局內次數與裝備限制。
- [x] 20跳後可選路線、蜻蜓／螢火蟲／郵差挑戰。
- [x] 帳戶收藏交易、即時同步、舊帳戶欄位相容、新Firestore規則與測試案例。
- [ ] 在可下載JAR的環境執行Firestore模擬器測試，再部署新版規則。
- [ ] 正式Firebase兩個裝置使用同一帳戶的驗收。

## 2026-11-14 落地、技能及流暢度

- [x] 腳掌與平台橢圓共用接觸點，修正邊緣落地、移動、下沉與蘑菇壓縮的站位。
- [x] 跳後文字改為讀屏通知，保留畫面上的青蛙幣回饋，避免提示文字擠壓湖面。
- [x] 動物技能內容垂直置中、技能說明靠右，說明框暫停時鐘。
- [x] 通用技能每局一次；動物技能每20跳補充一次，最多存3次；滿額提示及雙語說明一致。
- [x] 縮放時重用平台圖像，24格起跳姿勢預先快取，保留48張姿勢與3個平台的快取上限。
- [x] 邏輯、接觸點與快取回歸，手機／桌面操作及受控Canvas效能檢查。

## 移除系列分類與首頁入口

- [x] 移除動物系列選單及分類程式碼，30位動物合併按價格排序，保留只看已購買。
- [x] 首頁顯示Frogger Jump卡片，支援收藏及進入遊戲，更新網站目錄及結構化資料。
- [x] 120項測試、四種尺寸的首頁／商店操作、27頁建置與SEO檢查通過。


## 2026-11-14 花朵動物、支援選擇與平衡

- [x] 所有動物頭像按完整輪廓縮放，跨尺寸共用快取，消除耳朵／配件／花瓣裁切。
- [x] 小紅、小藍、小黃花朵造型，新增小黑／小粉／小白／小紫／小冰，保留舊ID與收藏。
- [x] 新增3項通用技能及3位河中夥伴，支援購買、裝備、存檔及一次性觸發。
- [x] 全部動物與通用技能組合檢查共用3／1／1用量、半徑上限、加闊不累加、技能不直接發分或金幣。
- [x] Firestore新增商品名單、正確扣款及收藏上限同步，補規則測試與部署說明。
- [ ] 登入Firebase帳戶後部署新版規則並驗收正式跨裝置購買。


## 2026-11-14 動物技能整合及勇者夥伴

- [x] 六項通用能力整合為動物技能定位，移除通用技能購買、裝備與遊戲按鈕。
- [x] 38位動物共用六種能力規格，每種定位前期600幣內可取得；同定位高價造型不加數值。
- [x] 每跳一次啟用、最多存3次，防止待命時重複扣次數；微調落地不給正中心獎勵。
- [x] 已購通用技能本機與雲端一次性原價退款；舊規則暫未更新時保留退款待同步並容許正常遊玩。
- [x] 加入曙光小勇者、磐石小矮人、和煦小牧師，完整頭像及跳躍快取。
- [x] 技能說明移到畫面右上角，調整手機控制區及長分數大小。
- [x] 160項邏輯檢查、六種定位的實際UI操作、81跳次數檢查、退款／登入adapter及頭像檢查。
- [ ] 登入Firebase帳戶後部署38位動物與退役退款規則，驗收正式雲端退款及跨裝置同步。
