# 《行行出狀元》獨立 Firebase 設定

本遊戲不再使用青蛙遊戲的 Firebase 專案或設定檔。所有 Firebase 設定、SDK 載入入口、依賴、規則、索引與部署／模擬器設定均在 `career-365/` 內。

已填入玩家提供的獨立Web App設定：專案`sky-playground-career-365`，Auth網域`sky-playground-career-365.firebaseapp.com`，Web App ID`1:818739784781:web:9a29d661e718a6fdf2c004`。青蛙繼續使用`sky-playground-3c5af`，兩者projectId不同。本機遊玩、IndexedDB、每日回顧及JSON備份維持可用；正式登入與私人雲端仍須完成下列Console設定及規則部署。

`projectId: sky-playground-3c5af`仍會被拒絕；不同appId不代表不同Firebase專案。如需停用雲端作本機測試，可將`projectConfig`設為`null`或使用`CAREER_FIREBASE_CONFIG=null`，不會退回青蛙專案。

## 建立自己的專案

1. 在 [Firebase Console](https://console.firebase.google.com/project/sky-playground-career-365/overview) 選擇`sky-playground-career-365`。本遊戲的公開設定已填入，無需重建專案或再新增Web App。
2. 如日後更換專案，在本資料夾的`src/firebase-settings.js`更新`projectConfig`並同步`.firebaserc`；格式見`src/firebase-settings.example.js`。至少需apiKey、authDomain、projectId及appId；不能填入Admin金鑰／密碼。
3. 在新專案 Authentication → Sign-in method 啟用Email/Password、Google及Anonymous；Google需設定專案支援Email。
4. Authentication → Settings → Authorized domains 加入實際網站網域，例如`sky-playground.com`；只在需要本機測試時加入`localhost`。
5. 在同一新專案建立預設Cloud Firestore資料庫，選正式模式。發布本資料夾的`firestore.rules`及`firestore.indexes.json`。不要使用青蛙遊戲的規則或部署設定。
6. 重建並發布網站。在遊戲登入後，存檔選單依次「檢查雲端」→「上傳目前人生」；換裝置登入同一新專案帳戶，再檢查並載入。

無需手動建立`career365_saves`或文件，首次上傳會建立。私人存檔按UID直接讀取不需複合索引；此資料夾另有三個玩家社交索引，供玩家／公司邀請及招募板查詢使用。登入不會自動覆蓋／上傳本機人生。

## 本資料夾的檔案與部署

| 檔案 | 用途 |
| --- | --- |
| `src/firebase-settings.js` | 本遊戲唯一的實際專案公開設定，支援獨立的`CAREER_FIREBASE_CONFIG`runtime override |
| `src/firebase-settings.example.js` | 不啟用的填寫範例 |
| `src/firebase-auth-sdk.js`、`src/firebase-firestore-sdk.js` | 本遊戲的lazy SDK入口，套件由本資料夾的package-lock安裝 |
| `firebase.json` | 本遊戲規則／索引及獨立模擬器連接埠 |
| `.firebaserc` | 本遊戲default為`sky-playground-career-365`；部署工具仍明確使用公開設定中的projectId |
| `firestore.rules` | 私人Career365快照及有明確權限的Spark社交；舊Functions集合與其他路徑預設拒絕 |
| `firestore.indexes.json` | 私人存檔及玩家社交各自所需索引（目前三個Spark社交複合索引） |

從儲存庫根目錄執行：

```bash
npm ci --prefix career-365
npm run firebase:check --prefix career-365
npm run firebase:deploy --prefix career-365
```

`firebase:check`只顯示部署目標，不連線或發佈；未設定／設定不完整時會拒絕繼續。`firebase:deploy`需要已安裝並登入的Firebase CLI，固定以本資料夾的firebase.json和設定中的projectId部署規則及索引，不依賴全域active project。以上是操作指引，本次程式修改沒有代為建立專案、開啟Provider或部署。

## 私人資料及跨裝置行為

- Firebase Auth使用命名app`career-365`，並檢查既有app的projectId；不重用另一專案的session。支援Email、Google及匿名登入，匿名可綁定Email／Google保留同一個新專案UID。
- `career365_saves/{uid}`只允許本人單筆讀取／刪除，不允許列出集合或存取他人資料。第一次revision=1，以後每次加1；updatedAt須為serverTimestamp。
- 快照只有version、revision、payload和updatedAt。payload是JSON或`gz:` gzip/base64，客戶端上限850KB，解壓上限4MiB，載入後仍驗證遊戲狀態。不寫入Email、密碼或Provider憑證。
- 雲端以版本交易防止不同裝置覆蓋新進度；離線不把舊快取當成最新雲端版本。這是私人模擬遊戲存檔，不是競賽分數權威。
- 本機帳戶、登入標記和每日回顧以Firebase projectId＋UID分開；訪客人生維持原key。Firebase兩個專案的登入帳戶、UID及雲端資料不會因Email相同而自動合併。

## 舊共用專案遷移

先保留舊資料，不刪除舊Firebase帳戶或文件。若可使用舊版本，先登入原Career365帳戶，將人生匯出JSON。拆分後，本機舊登入標記及舊UID存檔仍保留；帳戶視窗可按「匯出舊專案在此裝置的人生備份」，這只讀取本機資料，不連回青蛙專案，也不自動採納到新帳戶。

在新Career365專案登入／註冊後，明確匯入JSON，再檢查並上傳至新專案。舊雲端快照和Auth帳戶不會自動搬移，必須以備份或受控管理員遷移處理。青蛙資料夾的新規則不再包含career365_saves；**發布青蛙新規則前，先完成所需舊Career365雲端備份**。修改程式不會刪掉伺服器上的舊資料。

## 模擬器與驗證

本遊戲獨立使用Auth9099／Firestore8090，青蛙維持9098／8089，可分開測試：

```bash
firebase emulators:exec --project demo-career365 --only firestore \
  --config career-365/firebase.json \
  "npm run test:rules --prefix career-365"
```

模擬器安全測試涵蓋owner、他人／未登入、列舉、版本、時間戳、額外欄位、超大payload及青蛙路徑隔離。這些測試需要可用的Firestore emulator；沒有執行時不可宣稱已通過。一般Node與瀏覽器測試採用隔離fixture，不建立真實帳戶、不寄Email，也不證明新專案已建立或Provider已啟用。


## 玩家社交與合作公司後端

社交功能現已改為 **Spark相容**：只使用Authentication及Firestore，不需要Cloud Functions或Blaze。名片、好友、公司招募／申請／推薦、合作條件、文字委託、人工確認及交接均由直接Firestore交易及安全規則驗證；不設合作點；新版完成委託後可自願領取有限的IQ／EQ／PQ／JQ成長。合作紀錄及每日領取配額也由Firestore規則驗證，必須部署最新版`firestore.rules`。本次沒有新增複合索引，也不用啟用Blaze。詳見 [SOCIAL.md](./SOCIAL.md)。

`npm run social:check --prefix career-365`核對目標，`npm run social:deploy --prefix career-365`發布規則及三個新社交索引；沒有Functions部署。專案仍固定為`sky-playground-career-365`。先部署規則、等待索引可用，再發布靜態網站及用兩個註冊帳戶驗收。免費配額耗盡時社交暫停，本機人生仍可繼續。

頭像擴充至20款的版本需重新部署本資料夾的`firestore.rules`：名片avatar新增`comic-8`至`comic-19`安全值，原有八個值繼續支援。使用既有`npm run social:deploy --prefix career-365`指令；不用新增索引、Cloud Functions或升級Blaze。
