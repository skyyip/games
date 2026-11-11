# Your Dream Career Firebase設定

目前僅啟用本機遊玩與社群介面，未連接Firebase。這是使用者指定的第一階段，不影響完整單人職涯。

## 日後啟用

1. 建立新的Firebase專案，請勿使用 `sky-playground-career-365`（Career 365）或 `sky-playground-3c5af`（青蛙遊戲）。設定驗證會拒絕這兩個專案。
2. 註冊Web App，把公開firebaseConfig填入本資料夾 `src/firebase-settings.js` 的 `projectConfig`，取代 `null`。不需要服務帳戶、私鑰或Admin SDK。
3. Authentication啟用Email/Password、Google及Anonymous。Authorized domains加入正式網域及本機測試所用網域。跨裝置社群須Email／Google帳戶；匿名帳戶可先綁定。
4. 建立Cloud Firestore，選擇合適地區。部署本資料夾的規則及索引；不是複製原版規則至舊專案。
5. 安裝／登入Firebase CLI，先檢查目標再部署：

```sh
npm install -g firebase-tools
firebase login
npm run firebase:check --prefix your-dream-career
npm run firebase:deploy --prefix your-dream-career
```

部署腳本從本資料夾的公開設定讀取projectId，只部署 `firestore:rules,firestore:indexes`。設定為null或舊專案時會拒絕執行。沒有Functions，也不需要Blaze。等待索引建立完成後再測試查詢。

6. 重新建置網站並發布；先用兩個測試帳戶檢查建立名片、雙方接受好友、公司邀請／接受、發布／認領委託、提交／負責人確認、合作紀錄及屬性獎勵。私人存檔先檢查雲端版本再上傳／載入，不自動覆蓋另一裝置的進度。

## 隔離與規則

- Firebase app名稱：`your-dream-career`。
- 私人雲端集合：`dreamcareer_saves`。
- 社群集合：`dreamcareer_spark_*`，由本資料夾的規則、索引及客戶端交易共同使用。
- 規則：[firestore.rules](firestore.rules)。索引：[firestore.indexes.json](firestore.indexes.json)。設定：[src/firebase-settings.js](src/firebase-settings.js)。
- 每日合作成長及每遊戲月領取限額沿用Spark版本；委託由真人負責人確認，無自動客服或真人配對服務。
- 本機遊戲不是防作弊競賽；私人payload是玩家自己的模擬進度，不能當作可信的競技排行或貨幣帳本。

本次未部署Firebase。原版Career 365及青蛙遊戲的專案與規則不受影響。
