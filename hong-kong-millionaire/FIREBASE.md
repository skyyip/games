# Firebase 設定與部署

## 891題與98張卡更新（2026-11-28）

**必須先Publish本版完整`firestore.rules`，再完整上傳同版網站。** 本版新增120題及14張卡，規則已同步891題、三個難度池284／386／221、98張卡（56普通／42閃卡）及七類各14張的完整收藏門檻。不可只修改題庫總數或拼貼舊規則片段。

普通抽20,000，602格（普通每款10格、閃卡每款1格），步長37；金蛋80,000，42款閃卡，步長5。兩種抽序都能到達全部對應卡。每日券折扣、30秒答題、15題每日挑戰、24小時非即時房間及登入限制保留，四個索引與Functions不變。

```sh
cd hong-kong-millionaire
npm run rules:check
firebase deploy --project sky-playground-millionaire --only firestore:rules
```

沿用`hk-2026-11`單一現行題庫；擴充會改變每日與對戰抽題對應，請選**沒有未完成挑戰或房間**的時段，同步規則與網站，避免舊前端配新抽題表。沒有代為部署正式Firebase。玩家文件、獎金、收藏、抽數及歷史收據不需遷移或清空。

稱號沿用「集齊該類全部卡片」政策，門檻隨目錄增加至14張。只持有原來12張而已套用的前綴，在載入錢包時會以零成本交易取消，並同步公開造型；不扣款、不移除卡片及其他造型，補齊後可重新套用。來源資料的`prefixRequired:false`是舊批次標記，不豁免完整收藏門檻。

以下為歷次部署記錄；本次數量及門檻以本節為準。

## 全套收藏前綴更新（2026-11-27）

**先發布本資料夾同版完整`firestore.rules`，再上傳網站。**七個分類的收集稱號全部改為需要集齊該分類全部12款（包括閃卡）；舊版只檢查首6款的規則不足以限制新版條件。

```bash
cd hong-kong-millionaire
firebase deploy --project sky-playground-millionaire --only firestore:rules
```

既有未集齊12款卻已使用前綴的帳戶，於新版載入錢包時，以零費用交易取消前綴並同步公開造型；卡片、造型、獎金與歷史收據保留。此操作使用既有錢包／公開造型／收據欄位，交易中重新核對最新卡冊，重複載入不會反覆取消或扣款。已集齊的前綴照常保留。尚未回到遊戲載入錢包的帳戶會在下次載入時更新；不需批次清空或遷移玩家資料。

公開造型寫入亦驗證全套卡片資格，防止繞過前端或只更新造型文件。四個索引及Functions不變，普通扭蛋20,000／閃卡金蛋80,000、771題、84卡及24小時非即時對戰維持原設定。卡片來源中的`prefixRequired:false`為舊擴充批次標記，已不影響新解鎖條件。

以下是先前部署記錄；前綴條件以本節為準。

## 普通文化扭蛋20,000更新（2026-11-27）

本次把普通文化扭蛋從10,000改為20,000，**必須先發布本資料夾同版完整`firestore.rules`，再上傳新版網站**。規則獨立驗證扣款，舊前端的10,000交易會遭拒；閃卡金蛋仍為80,000。現有錢包、收藏、票券及已完成收據保留，不需清空或遷移。

```bash
cd hong-kong-millionaire
firebase deploy --project sky-playground-millionaire --only firestore:rules
```

四個索引及Functions沒有變更。結算恢復、閃卡掃光及手機排版屬前端更新；本次沒有實作玩家卡片市集。

## 收藏及再挑戰券更新部署

本次變更了抽卡價格、卡冊、造型白名單、週末五次上限及每日再挑戰券。請**先發布本資料夾最新完整`firestore.rules`，再上傳新版網站**，否則新購買與開局會被舊規則拒絕。無新增索引；沿用`firestore.indexes.json`。

```bash
cd hong-kong-millionaire
firebase deploy --project sky-playground-millionaire --only firestore:rules
```

也可在專案`sky-playground-millionaire`的Firestore Database → Rules，貼上完整規則檔後Publish。現有錢包不須重建，新增的每日券欄位以缺省值讀取；已購買卡片及造型繼續保留。

本遊戲只使用 **sky-playground-millionaire**，與其他遊戲獨立。公開 Web App 設定在 `src/firebase-settings.js`；不要把服務帳戶私鑰、OAuth 密碼或 CLI token 放進網站。

## 單一題庫與固定資料集合

把本遊戲視為首次推出，直接使用目前完整的 771 題，包括 67 題香港漫畫篇、60題日常細節及兩份附件新增的60題街角觀察及本地特色60題，以及街坊地膽篇60題、社區文化篇60題及街坊日常篇60題及文化／地膽探索120題及街坊生活新章120題；唯一題庫標識為 `hk-2026-11`。

- 私人玩家：`hkm_players/{uid}`，每日題局放在其 `runs/{香港日數}`。
- 每日榜：`hkm_results`；生涯榜：`hkm_rankings`；月榜：`hkm_seasons`。
- 本機每日紀錄沿用 `sky.hk-millionaire.today.v1`；這是固定的儲存格式 key，不會按題庫更新另建資料分區。
- Google／Email 登入使用原本的 Firebase 專案。首次建立玩家及第一局時，按正常流程初始化進度。
- 以沒有既有玩家資料的新遊戲為前提，不提供多版本題庫、資料遷移或重置流程。程式不會自動刪除 Firestore 文件。
- 請發布本資料夾的完整規則。三個索引沿用原本 `hkm_` 集合的定義；已建立相同索引者無須新增另一套。

## 1. 確認資料庫及登入

1. 開啟 [Firebase 專案](https://console.firebase.google.com/project/sky-playground-millionaire/overview)，確認是 `sky-playground-millionaire`。
2. Firestore Database 使用預設 `(default)` Standard／Native mode 資料庫。已建立者不用重建；不需手動匯入題目或玩家。
3. Authentication → Sign-in method 啟用 Google 及 Email/Password；Google 需選擇支援電郵。
4. Authentication → Settings → Authorized domains 加入 `sky-playground.com`、實際使用的 `www.sky-playground.com`；本機測試另加 `localhost`、`127.0.0.1`。保留 `sky-playground-millionaire.firebaseapp.com`。
5. Google 登入沿用 Firebase 的 `firebaseapp.com/__/auth/handler`。iPhone 主畫面模式可能需要第二次明確點擊來開啟登入視窗。

如 API key 有 HTTP referrer／API 限制，須容許實際網站、Firebase 登入 handler，以及 Authentication／Identity Toolkit、Secure Token、Firestore 所需 API。Google 登入成功不代表 Firestore 已允許讀寫。

## 2. 發布規則及確認三個索引

在 GitHub 下載最新版原始碼後，於本資料夾執行：

```sh
cd hong-kong-millionaire
npm ci
# 尚未安裝 CLI 才需要：npm install -g firebase-tools
firebase login
firebase projects:list
npm run rules:check
npm run firebase:check
npm run firebase:deploy
```

最後一步等效於：

```sh
firebase deploy --project sky-playground-millionaire --only firestore:rules,firestore:indexes
```

部署輔助程式固定專案及部署範圍，不會部署其他遊戲或 Cloud Functions。Spark 可使用本版所需服務，仍受 Auth／Firestore 配額限制。

也可在 [Firestore Rules](https://console.firebase.google.com/project/sky-playground-millionaire/firestore/rules) 貼上完整 [firestore.rules](firestore.rules) 後 Publish；索引仍須用 CLI 或 Console 建立。三個索引定義見 [firestore.indexes.json](firestore.indexes.json)，collection group 分別為 `hkm_results`、`hkm_seasons`、`hkm_rankings`。等 Indexes 顯示 Enabled 再測試排行榜。

## 3. 再上傳網站

使用 `downloads/games-site` 分支的已建置檔案，將解壓後**內容**上傳到 `public_html/games/`，包含 `.htaccess`；不要再套一層儲存庫資料夾。

遊戲網址：https://sky-playground.com/games/hong-kong-millionaire/

1. 更新並重新載入遊戲，登入 Google，開始帳戶挑戰。
2. 第一題選答案並確認，應顯示作答結果，再進入下一題。
3. 重新整理應續同一局；同帳戶另一裝置亦只可續局。
4. 完成後檢查每日結果及兩個累積榜；同一局只結算一次。
5. A 登出後 B 可進行 B 的當日挑戰；切回 A 仍恢復 A 的進度。
6. 匿名遊玩已移除；舊本機匿名資料不載入或匯入帳戶。登出後不能開局。其他遊戲的資料不受影響。

## 已修復的第一題 permission-denied

真正 Firestore Emulator 已重現舊規則超出每次請求 **1,000 expressions** 的限制。新版移除多版本相容及整份狀態重複驗證，改用單一題庫、分難度題目／答案查表，以及每個操作各自的欄位變更白名單；仍驗證伺服器時間、逐題狀態、保險線、每日一次及原子結算。

[實際規則測試紀錄](https://github.com/skyyip/games/actions/workflows/millionaire-rules.yml) 已通過 93 項檢查，包括用正式程式的 `transitionPatch` 提交第一題、完整 15 題結算、答錯／退出／超時，以及拒絕偽造分數、時間、題號、他人資料讀取與重複結算。

```sh
npm test
npm run rules:check
firebase emulators:exec --project demo-hk-millionaire --only firestore "node scripts/firestore-check.mjs"
```

模擬器需要 Java 21 及可下載的 Firestore Emulator JAR。GitHub Actions 會在相關修改後自動執行。測試只使用 demo 專案，沒有部署正式 Firebase，也沒有執行真實 Google 帳戶授權；正式部署後仍須完成上述上線檢查。

## 登入限定測試

以未登入、已登入、重新整理及切換帳戶測試。未登入只能開啟登入／註冊視窗；舊本機匿名局不會載入，也不影響帳戶從雲端取得自己的每日機會。不要清除整個網域，以免影響其他遊戲。

日後修改題目、答案或抽題表時，須同步執行 `npm run rules:generate`、模擬器測試並發布規則及網站。


## 本地特色60題的發布次序（2026-11-26）

題庫擴充至651題，難度池為204／306／141。請先Publish本資料夾**完整** `firestore.rules`，再上傳新網站；抽題表、答案及圖鑑上限須一致，不能只改一個總數。仍使用原本的單一題庫與 `hkm_` 集合，四個索引不變。

只發布規則的指令：

```sh
cd hong-kong-millionaire
npm run rules:check
firebase deploy --project sky-playground-millionaire --only firestore:rules
```

本輪所有啟用模式作答30秒；房間揭曉2.5秒（每題節奏32.5秒），完整規則已同步更新；四個複合索引不變。新增題目的四選一、答案及來源見 [QUESTION-BANK-LOCAL-60.md](QUESTION-BANK-LOCAL-60.md)。

沿用單一題庫設定；更新會改變每日及對戰抽題表，應在沒有未完成挑戰／街坊房間時同步發布Rules與網站。舊前端與新Rules不可混用。此更新不刪除玩家文件、不重設獎金或收藏。

## 房間進場與時間校準

新版進場只寫入玩家自己的 session 與 wallet，開房費差額在答題畫面建立後另外領取，避免所有人開局時爭用房間文件。伺服器寫入時間與單調時鐘校準房間倒數；恢復對戰時只更新自己的 session.updatedAt，不能更改題目起始時間、分數或答案。房間日期固定跟隨伺服器開房時間，裝置時差不會改變房間日期。

權限錯誤會暫停自動操作；網絡錯誤以退避方式有限重試，並保留明確的重新連接按鈕。請發布本次完整 firestore.rules 後，再讓兩位玩家重新載入網站。索引仍為四個。

### 2026-11-22：30秒計時規則

本版將每日／週末／再挑戰／房間的答題期限改為30秒，房間10題總時長325秒，斷線寬限後355秒。先發布完整`firestore.rules`，再上傳同版網站；舊25秒網站不應與新規則混用。四個複合索引保持不變，無需新增索引。不要為更新計時清除玩家進度或放寬為公開寫入。

登入限定版同時拒絕 Firebase Anonymous Auth token 的個人及房間操作；Google／Email 註冊與現有帳戶仍可使用。第11–15題的141題壓軸池與Firestore抽題表須同步發布，索引及資產不重置。

## 2026-11-26：收藏及每日折扣規則

本版須發布完整`firestore.rules`：普通文化扭蛋10,000、42張卡、20款造型，以及每日再挑戰券5至9折。折扣由香港日期以共享整數算法決定；規則獨立以`request.time`日期計算應扣金額，不信任前端報價。既有收據不可改寫，重試同一收據不再次扣款；當日仍只可買及使用一次。舊前端固定100,000購票不可與本版規則混用。

新增卡冊是獨立系列，原有系列集齊條件保留；既有錢包、卡片、造型及排行榜不重設。刷新恢復造型及第1回改為香港時間2026-11-26只涉及前端顯示／載入，不改雲端日期鍵。四個索引不變，無須新增Functions。

## 2026-11-26：原有七類收藏與街坊日常60題

本輪題庫531題、三池164／266／101，卡片56張（七類各8張）。先部署同版完整`firestore.rules`，再上傳新網站；規則同步抽題／答案表、新卡名單、371格普通抽序及21款閃卡的金蛋抽序。普通抽10,000、金蛋80,000及再挑戰每日5至9折不變。

前綴仍要求每類原有首6張核心卡。擴充卡的來源資料標示`prefixRequired:false`，產生器不把它加入前綴門檻；它也不能替代缺少的核心卡。無須遷移錢包或增設文件欄位，不取消既有前綴、卡片、造型或餘額。四個索引及Functions保持不變。沿用單一題庫，請協調沒有未完成挑戰／房間時同步更新，避免舊前端與新表混用。

## 2026-11-26：文化120題、70張卡與新頭像框

本版須發布完整Rules：651題、三池204／306／141、70張卡、14框及24款總造型。普通抽448格（普通各10格、閃卡各1格），金蛋28款；新框價格也由規則驗證，不能以偽造收據少付。原有七類的六張核心卡前綴條件保留，新卡不能替代缺少的核心卡。

灰階、獎金高亮、折扣標籤及插畫更新屬前端；收藏／新題／新框仍須與同版完整規則同步。普通抽10,000、金蛋80,000、每日票券折扣及24小時房間機制保持。無須遷移或清空玩家文件；四個索引與Functions不變。請協調沒有未完成挑戰／房間時更新，避免單一題庫的新舊前端和Rules混用。

規則答案表另改用按難度分組的CSV字串，再按索引轉成整數，以避開擴充後的1,000 expressions上限。這只改規則內部表示，不改前端題目、正解、題序或存檔格式；請發布完整產生結果，不要混入舊陣列片段。

## 2026-11-27：新120題與84張漫畫卡

本版須先部署完整`firestore.rules`，再上傳同版網站：771題、難度池244／346／181、84張卡（49普通／35閃卡）。普通抽525格／步長37，金蛋35款／步長6；兩個循環均可到達所有對應卡。七類原有六張核心卡的稱號條件不變，所有新卡均非核心卡，不能代替缺少的核心卡。

原有題目／卡片ID、玩家餘額、抽數、收藏及已獲稱號保留，不要求遷移或清空文件。四個索引與Functions不變，登入限定、30秒題限、票券價格與24小時非即時對戰保持。題序與正解表屬單一現行題庫，請協調沒有未完成挑戰／房間時同步更新，不要混用舊前端與新規則。

```sh
firebase deploy --project sky-playground-millionaire --only firestore:rules
```
