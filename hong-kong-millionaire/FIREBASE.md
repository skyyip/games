# Firebase設定與部署

本遊戲只使用 **sky-playground-millionaire**。公開Web App設定已放在 `src/firebase-settings.js`；API Key是Firebase瀏覽器公開設定，不是服務帳戶私鑰。不要把服務帳戶、OAuth密碼或CLI登入Token加入網站。

## 1. 建立資料庫

1. 到 https://console.firebase.google.com/project/sky-playground-millionaire/overview ，核對專案名稱。
2. Build → Firestore Database → Create database，選擇Standard／Native mode的預設 `(default)` 資料庫及合適地區。地區建立後不能直接更改。
3. 選Production mode；稍後部署本資料夾的完整規則，不要改為公開讀寫。
4. 無須手動建立集合、貼題目答案或匯入資料。首次登入建立私人玩家紀錄，完成挑戰才會建立公開榜單紀錄。

## 2. 開啟登入

1. Authentication → Get started → Sign-in method。
2. Enable **Google**，選擇支援電郵並Save。
3. Enable **Email/Password** 的Email/Password登入；不用開啟Email link。
4. Authentication → Settings → Authorized domains加入 `sky-playground.com`、`www.sky-playground.com`（如實際使用）；本機測試另加 `localhost` 與 `127.0.0.1`。保留本專案的 `sky-playground-millionaire.firebaseapp.com`。
5. Google登入預設使用Firebase的 `firebaseapp.com/__/auth/handler`。不要在GoDaddy仿造這個handler。iPhone主畫面模式會先準備登入，再要求玩家按第二個明確的開啟按鈕。

如對公開API Key設定HTTP referrer及API限制，須同時容許實際網站及本專案Firebase登入handler所需來源，並容許Firebase Authentication／Identity Toolkit、Secure Token及Firestore所需API。限制錯誤會令登入或讀寫失敗，不能只容許主頁的單一路徑。

## 3. 部署規則與三個索引

已安裝Firebase CLI時：

```sh
cd hong-kong-millionaire
npm ci
firebase login
firebase projects:list
npm run rules:check
npm run firebase:check
npm run firebase:deploy
```

未安裝CLI可先 `npm install -g firebase-tools`。部署輔助程式會固定指向 `sky-playground-millionaire`，只部署Firestore規則及索引，避免影響其他遊戲。

等效指令：

```sh
firebase deploy --project sky-playground-millionaire --only firestore:rules,firestore:indexes
```

- 規則：[firestore.rules](firestore.rules)。也可整份貼到Firestore → Rules → Publish，但索引仍需CLI或Console建立。
- 索引：[firestore.indexes.json](firestore.indexes.json)，共3個：每日 `hkm_results`、月榜 `hkm_seasons`、生涯 `hkm_rankings`。
- Firebase Console → Firestore → Indexes確認索引從Building變為Enabled後再測試榜單。
- Spark不需要升級Blaze；沒有Functions、排程或付費伺服器。仍受Spark的Auth／Firestore每日配額約束。

## 4. 上線檢查

1. 上傳**已建置網站**至 `/games/`，開啟 `/games/hong-kong-millionaire/`。
2. 開局前登入Google或建立Email帳戶，修改公開稱呼。
3. 開始挑戰，重新整理應續同一局；同帳戶另一裝置亦只可續局。
4. 完成後核對私人 `hkm_players/{uid}/runs/{香港日數}`、公開結果及兩個累積榜，總額只能加一次。
5. 登出不會補回今日次數。匿名局不會事後轉為排名局。Email、題目作答細節及收藏不放在公開榜單。

## 規則測試

```sh
npm test
npm run rules:check
firebase emulators:exec --project demo-hk-millionaire --only firestore "node scripts/firestore-check.mjs"
```

Emulator需Java及可下載的Firestore Emulator JAR。測試使用demo專案，不接觸正式資料。本次工作環境無可用Emulator JAR，因此未執行真實規則編譯、Google授權或正式雲端部署；部署後須完成上述檢查。

題庫修改後執行 `npm run rules:generate` 並同步發布網站與規則。不要在同日尚有玩家進行挑戰時改動題組、答案或 `BANK_VERSION`；先安排版本切換。
