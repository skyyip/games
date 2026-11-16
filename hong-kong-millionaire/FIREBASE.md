# Firebase 設定與部署

本遊戲只使用 **sky-playground-millionaire**，與其他遊戲獨立。公開 Web App 設定在 `src/firebase-settings.js`；不要把服務帳戶私鑰、OAuth 密碼或 CLI token 放進網站。

## 單一題庫與固定資料集合

把本遊戲視為首次推出，直接使用目前完整的 291 題，包括 67 題香港漫畫篇、60題日常細節及兩份附件新增的60題街角觀察；唯一題庫標識為 `hk-2026-11`。

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
6. 匿名進度不轉成帳戶排名；登出不會補發當日匿名機會。其他遊戲的資料不受影響。

## 已修復的第一題 permission-denied

真正 Firestore Emulator 已重現舊規則超出每次請求 **1,000 expressions** 的限制。新版移除多版本相容及整份狀態重複驗證，改用單一題庫、分難度題目／答案查表，以及每個操作各自的欄位變更白名單；仍驗證伺服器時間、逐題狀態、保險線、每日一次及原子結算。

[實際規則測試紀錄](https://github.com/skyyip/games/actions/workflows/millionaire-rules.yml) 已通過 93 項檢查，包括用正式程式的 `transitionPatch` 提交第一題、完整 15 題結算、答錯／退出／超時，以及拒絕偽造分數、時間、題號、他人資料讀取與重複結算。

```sh
npm test
npm run rules:check
firebase emulators:exec --project demo-hk-millionaire --only firestore "node scripts/firestore-check.mjs"
```

模擬器需要 Java 21 及可下載的 Firestore Emulator JAR。GitHub Actions 會在相關修改後自動執行。測試只使用 demo 專案，沒有部署正式 Firebase，也沒有執行真實 Google 帳戶授權；正式部署後仍須完成上述上線檢查。

## 本機匿名測試

瀏覽器開發者工具 → Application → Local Storage，只刪除 `sky.hk-millionaire.today.v1` 再重新整理。這只重置本機測試資料，不會刪除或重置帳戶在 Firestore 的今日挑戰，也不會登出 Google。不要清除整個網域，以免影響其他遊戲。

日後修改題目、答案或抽題表時，須同步執行 `npm run rules:generate`、模擬器測試並發布規則及網站。


## 新增60題的發布次序

題庫擴充至291題，難度池為84／134／73。請先Publish本資料夾**完整** `firestore.rules`，再上傳新網站；抽題表、答案及圖鑑上限須一致，不能只改一個總數。仍使用原本的單一題庫與 `hkm_` 集合，三個索引不變。

只發布規則的指令：

```sh
cd hong-kong-millionaire
npm run rules:check
firebase deploy --project sky-playground-millionaire --only firestore:rules
```

本輪房間作答25秒、揭曉2.5秒（每題節奏27.5秒），完整規則已同步更新；四個複合索引不變。新增題目逐條修訂見 [QUESTION-BANK-STREET-60.md](QUESTION-BANK-STREET-60.md)。
