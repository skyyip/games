# 打小人：獨立 Firebase 設定及部署

`src/firebase-settings.js` 已填入打小人獨立專案 **`beat-bad-luck`** 的公開 Web App 設定，Auth 網域為 `beat-bad-luck.firebaseapp.com`。登入、跨裝置保存、真人好友與互贈均使用此專案。本機遊玩仍可使用。專案擁有人已回報 Firebase 設定完成；以下保留設定及重新部署步驟。Agent 未代為部署，真實登入及社群完整流程仍待線上驗證。

## 1. 建立獨立專案

打小人專案已建立：[Firebase Console → beat-bad-luck](https://console.firebase.google.com/project/beat-bad-luck/overview)，保留 Spark 計劃即可。不要選青蛙的 `sky-playground-3c5af` 或 Career 365 的 `sky-playground-career-365`；程式亦會拒絕這兩個專案。

目前已套用所提供的 Web App 設定。日後如需更換專案，在「專案設定 → 一般 → 你的應用程式」取得公開的 `firebaseConfig`，修改本遊戲 `src/firebase-settings.js` 的 `projectConfig`：

```js
const projectConfig = {
  apiKey: "YOUR_PUBLIC_WEB_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_WEB_APP_ID"
};
```

以 Console 的真實數值取代全部佔位文字。不要提供服務帳戶私鑰、Google 密碼或 Admin SDK 憑證。設定只放在 `beat-bad-luck/`，不需要修改其他遊戲。

## 2. 啟用服務

1. 「Authentication → 登入方式」啟用 **Email/密碼、Google、匿名**；Google 須選專案支援 Email。
2. 「Authentication → 設定 → 授權網域」加入正式網站的主機名稱。本機測試需要時加入 `localhost`，不要填完整路徑。
3. 建立 **Cloud Firestore**，選正式模式及合適地區。

只使用 Authentication、Firestore 及靜態網頁，不使用 Cloud Functions；用量仍受 Spark 配額限制。Firebase 客戶端按需初始化，通知只在登入並顯示頁面時監聽。獨立 HTML 試玩檔維持純本機模式，不包含登入 SDK。

## 3. 安裝、檢查與部署

在 repository 根目錄執行（建議 Node.js 22 或以上；模擬器另需 Firebase CLI 支援的 Java）：

```sh
npm ci --prefix beat-bad-luck
npm install -g firebase-tools
firebase login
firebase projects:list
npm run firebase:check --prefix beat-bad-luck
npm run firebase:deploy --prefix beat-bad-luck
```

`firebase:check` 只顯示目標和指令；`firebase:deploy` 明確使用本遊戲設定裡的 projectId，僅部署 `firestore:rules,firestore:indexes`。設定缺漏、仍有佔位文字或指向上述其他遊戲時會停止。部署後等五個索引狀態變成 **Enabled**。

**世界排行榜更新需要重新部署規則及索引**，即使之前已完成 Firebase 設定。新增的 `bbl_scores` 索引：Query scope 選 **Collection**，欄位 `score` 選 **Descending**、`achievedAt` 選 **Ascending**。沒有這次新增規則會顯示權限錯誤；索引未完成會顯示建立中。物件組合獎勵包含在原有私有進度內，不需另開 Collection。

檔案：[`firebase.json`](./firebase.json)、[`firestore.rules`](./firestore.rules)、[`firestore.indexes.json`](./firestore.indexes.json)。沒有共用 `.firebaserc`，不會依賴 CLI 上次選過的專案。

填好 Web App 設定後須按網站既有流程重新建置及發布；規則部署不會發布網頁。

## 4. 本機驗證

```sh
npm test --prefix beat-bad-luck
firebase emulators:exec --only firestore --project demo-beat-bad-luck --config beat-bad-luck/firebase.json 'node beat-bad-luck/scripts/player-rules-check.mjs'
```

規則測試使用 `demo-beat-bad-luck` 及 `127.0.0.1:8087`，不接觸正式資料。**本輪49項真正 Firestore 模擬器安全測試全部通過**，涵蓋隨機代號碰撞重試／並行分配、私有存檔、匿名限制、好友清單及通知查詢、邀請／接受、實際扣庫存、原子領取／退回、每日送禮限制及排行榜。直接下載受限後，已從套件容器取出官方 v1.22.0 模擬器，SHA-256 與 Firebase CLI 官方中繼資料一致，再於本機執行。仍未驗證正式專案的真實 Google／Email 登入。

**好友操作出現「未獲允許」的修正：** 舊規則用 `request.auth.uid in [resource.data.from, resource.data.to]` 驗證好友清單，查詢引擎會回報欄位未定義並拒絕讀取。新版改為明確的 `resource.data.from == request.auth.uid || resource.data.to == request.auth.uid`；禮物清單也作相同修正。請將最新 `firestore.rules` 整份貼到 **beat-bad-luck → Firestore Database → Rules → 發布**，或用上面的 CLI 指令重新部署。網站 push 不會部署規則。本環境 `firebase login:list` 沒有已授權帳戶，未代為更新正式專案。

若舊版規則在 `day()` 出現 `Missing 'match' keyword before path` 或 `Unexpected '/86400000'`，請使用目前更新的規則檔。除法 `/` 必須與後面的數字留有空格，避免被 lexer 當成 `/86400000` 路徑 token。函式應為 `return int((request.time.toMillis() + 28800000) / 86400000);`；此修正保留香港午夜的每日送禮重設邏輯。

另有 `scripts/player-ui-check.mjs`（社群介面）、`scripts/player-local-check.mjs`（真實入口、名字保存、儲存被封鎖、純本機試玩檔）和 `scripts/burst-challenges-check.mjs`（完整儀式及三次必殺）。可設定 `GRID_RUSH_PLAYWRIGHT_MODULE`；玩家介面測試網址使用 `BBL_URL`，儀式測試使用 `BEAT_BAD_LUCK_URL`。試玩檔測試另指定 `BBL_PORTABLE_DIR`。

## 資料與遊戲邊界

| Collection | 內容及可見範圍 |
| --- | --- |
| `bbl_saves/{uid}` | 本人遊戲快照、庫存投影、修訂號及稱呼；只有本人可讀寫 |
| `bbl_cards/{uid}`、`bbl_handles/{handle}` | 主動建立的公開暱稱及唯一代號；已註冊玩家可按代號查找 |
| `bbl_friends/{from}__{to}` | 邀請與好友同意狀態；雙方可讀 |
| `bbl_gifts/{id}` | 物品、雙方名字、狀態與時間；雙方可讀 |
| `bbl_limits/{uid}` | 香港午夜重設的送禮計數；本人可讀，規則限制遞增 |
| `bbl_scores/{uid}` | 主動參加的玩家名字、最高單局得分、命中次數、法寶及時間；公眾可讀，每次最多50筆 |

排行榜每個 UID 只保留一筆最佳得分，同分以較早公開者優先；未進前50名時不會捏造世界名次。匿名玩家也可參加，綁定帳戶可保留跨裝置身分。參加後，這部裝置的新紀錄會在進度成功同步後更新；可退出並刪除公開成績，私人進度不受影響。排行榜是玩家端產生的休閒遊戲紀錄，安全規則限制擁有者、欄位、分數範圍及不可降分，並不驗證實際每一下打擊，沒有伺服器防作弊或真金獎品。

新名片的「玩家代號」由系統隨機產生，例如 `p_7km4tx9d2r`，建立後固定並可複製。既有代號保留，修改名字不換代號。`bbl_handles` 的交易式預留確保不會把同一代號分配給不同帳戶；碰撞會重試，不需玩家自行改名。現有規則已支援此格式，這次前端更新毋須新增規則或索引。

送禮每次最多一份：小人紙一次、法寶一次、小攤物件整件連同等級及剩餘耐用時間。保管期間物件耐用時間暫停；與同款合併使用較早到期日，超過持有上限會拒絕領取，可先使用庫存或婉拒。逾七日不能領取，寄件人可取回；取消／退回都不退每日次數。只有已註冊、互相同意的好友可互贈；匿名玩家需先綁定 Email 或 Google。

存檔按 UID 與 projectId 隔離。雲端使用修訂號交易避免舊裝置覆蓋新進度；發現衝突時先匯出本機備份，再載入雲端。已有雲端存檔不提供舊檔匯入或庫存相加。心塞自由文字不會上傳，公開名片不顯示 Email 或庫存。

這是可本機遊玩的休閒遊戲，正常存檔由玩家端產生；規則不能驗證每一下打擊或每次購買，也不能證明 JSON 快照與庫存投影一致。送禮交易、權限、狀態及每日次數有規則限制，但**不屬於伺服器權威防作弊經濟**，不適用現金交易或具價值物品。
