# 你真的懂他／她／牠嗎？｜高血壓求生模擬器

繁體中文漫畫風格問答遊戲。使用原生 HTML、CSS 與 JavaScript ES Modules；未設定 Firebase 時仍可本機遊玩及離線使用。

## 本機開發

```bash
npm run serve
```

瀏覽器開啟 `http://localhost:4173`。執行測試：

```bash
npm test
```

## 遊戲內容

- 五個陣營：她的心思、他的心思、狗狗心思、貓主子心思、雙人互測。
- 一般場次每局12題、每題30秒、100 HP：3題經典求生、2題圖片情境、4題閱讀空氣、3題混合情境。保留連打、逃跑選項、按住確認及寵物救援，刮開怒氣黑霧已移除。
- 圖片情境題使用拍立得漫畫場景，提供可供朗讀及展開的文字描述；圖片載入失敗時自動展開。雙人互測5題中包含1題看圖選擇，沿用出題者先選、測試者後猜的玩法。
- 求生收藏冊有12張拍立得漫畫角色卡，沿用原卡片ID、稀有度、50 SC抽卡費及重複卡25 SC回收。
- 本機模式以 LocalStorage 保存紀錄；Service Worker 提供離線快取。
- 登入 Google 後可同步玩家資料、查閱個人歷史戰績、參與公開排行榜及建立非同步好友挑戰。
- 好友邀請有效期七天；雙方以相同陣營及題目順序完成挑戰。

## 心聲、現場線索及事故報告（2026-11-24）

- 一般場次每題作答或超時後，拍立得自動翻到背面，揭曉該場景的角色心聲；答錯反應按實際選項編寫，可翻回現場照片。揭曉期間暫停計時，按「下一題」繼續，最後一題或 HP 耗盡時改為查看事故報告。
- 八個一般場次圖片場景各有三個可點選的生活線索，共 24 個。線索是畫面觀察，不另加減分、不強制找齊；支援鍵盤、觸控及文字描述。原有每局 12 題、每題 30 秒、計分及收藏經濟沿用；雙人五題互測仍於最後才揭曉答案。
- 結算的「本日求生事故報告」按本局實際選擇產生稱號、主要事故及最佳操作，可展開翻查原題和選項，並收錄於 1080 × 1920 PNG 海報。超時會明確記錄未作答，沒有事故或達標操作時不虛構紀錄。支援原生檔案分享的瀏覽器可分享海報，其餘退回下載。
- 分享海報的角色圖像改用明確的資產引用，確保完整網站上傳版也能載入內容雜湊檔名。離線快取升至 v45，加入 `src/comedy.js`。本局口供只用於即時報告，沒有增加雲端寫入；Firestore 規則及索引無需更改。
- 驗證：`npm test` 36 項；`npm run test:comedy` 663 項瀏覽器檢查（原始版及完整上傳版）；`npm run test:pictures` 289 項，包含離線完整場次及 PNG 匯出；既有登入流程 37 項。瀏覽器指令需設定 `GRID_RUSH_PLAYWRIGHT_MODULE`；可用 `YRGT_TEST_URL` 指向上傳版預覽。檢查涵蓋 320／390／768／1280px、減少動態效果、揭曉暫停計時、實際選項口供、超時、圖片載入及分享 API 替身。瀏覽器為 Chromium，不代表實體 iOS 或系統分享面板已驗證。

## iOS Chrome 登入修正（2026-11-24）

- Google 登入及訪客升級均由按鈕直接開啟 Firebase 授權視窗，依照 [Firebase 官方建議](https://firebase.google.com/docs/auth/web/redirect-best-practices#option_2_switch_to_signinwithpopup) 避免跨網域轉址讀取第三方儲存的問題。視窗被封鎖時顯示錯誤並可重試，不會自動跳回轉址流程。
- 初始化使用 Firebase 本機儲存，若不支援則使用工作階段儲存，並先恢復登入狀態；玩家名稱及收藏於 Firestore 資料讀取成功後才同步。資料延遲或失敗不會將玩家顯示為未登入，亦不會因此寫入空白收藏。登出或切換帳戶後，過期的資料讀取結果不會套用。
- 離線快取更新為 v44；Firestore 規則及索引無需修改。
- `npm test`：31 項通過。設定已安裝的 Playwright 模組路徑後，執行 `GRID_RUSH_PLAYWRIGHT_MODULE=/path/to/playwright npm run test:auth`，驗證登入、重新整理、登出、重試、訪客綁定及雲端失敗，共 37 項檢查。測試使用 Chromium、iOS Chrome UA 及 Firebase SDK 測試替身，不代表真實 iOS 或正式 Google OAuth 已驗證。
- 部署後須以 iOS Chrome 一般分頁完成一次實際 Google 授權，確認顯示已登入、重新整理仍已登入，以及登出後重新整理仍為未登入。瀏覽器需允許第一方網站資料；封鎖彈出視窗時須先允許後重新按登入。

## Firebase Spark 設定

本專案使用 Firebase Web SDK CDN，無需安裝 Firebase npm 套件，也不部署 Cloud Functions。

1. Firebase Console 中確認專案 ID 為 `you-really-get-them`，並已建立 Web App。
2. `src/firebase/config.js` 已填入目前提供的 Web App 設定；若更換 Firebase 專案，請更新該檔。
3. Authentication → Sign-in method 啟用 Google 登入，並將正式網站網域加入 Authorized domains。
4. 建立 Cloud Firestore Database。
5. 在本資料夾安裝／登入 Firebase CLI，並選擇正確專案：

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules,firestore:indexes
   ```

GitHub Pages 只負責發布靜態遊戲檔案，不會自動部署 Firestore Rules 或 Indexes。更新這些 Firebase 設定時，需另行執行上方部署命令。

## Spark 方案與排行榜限制

- 此實作不使用 Cloud Functions、Cloud Run 或付費後端服務。
- Firestore Rules 限制玩家只能讀寫自己的個人資料和歷史紀錄，並限制排行榜文件的 UID、欄位、分數範圍及最佳成績遞增。
- 公開排行榜由登入玩家的瀏覽器提交，屬玩家自評資料，**不是防作弊競技排名**。使用者仍可修改前端或直接呼叫 Firestore，提交符合規則但非實際遊戲取得的成績。
- 若日後需要可信任的競技排名，必須加入可信任伺服器端計分流程；Firebase Spark 不支援部署 Cloud Functions。

## Firestore 資料結構

- `users/{uid}`：玩家名稱、頭像、求生幣、收藏卡及統計。
- `users/{uid}/runs/{runId}`：個人歷史戰績，介面顯示最近 30 筆。
- `leaderboard/{uid}`：公開排行榜摘要。
- `challenges/{challengeId}`：邀請者、受邀者、陣營、固定亂數種子及雙方結果。

舊版 LocalStorage 資料不會自動合併至 Google 帳號；登入後以雲端帳號資料為準。未設定 Firebase 或 Firebase 初始化失敗時，本機遊戲仍可遊玩，但雲端功能不可用。

## 注意

人物題目屬喜劇情境，不是心理學判斷；狗／貓題目只提供一般性行為知識，不可取代獸醫或合格動物行為專業意見。
