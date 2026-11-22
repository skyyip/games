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
