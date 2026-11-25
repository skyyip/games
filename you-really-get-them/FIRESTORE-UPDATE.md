# 帳戶SC錢包、合約及羈絆所需的Firestore更新

請先發布本版完整規則，再上傳網站。ZIP只包含網站檔案，不會自動發布Firebase規則。

1. 開啟 [完整 firestore.rules](https://github.com/skyyip/games/blob/work/you-really-get-them/firestore.rules)，複製整份內容。
2. Firebase Console選擇 **you-really-get-them** → **Firestore Database → Rules**。
3. 貼上完整內容並按 **Publish／發布**。
4. 上傳網站ZIP的內容（含`.htaccess`）到網站的`games/`目錄，所有裝置重新載入新版。
5. 登入後確認帳戶SC可同步；完成一局後重新整理，再以另一裝置登入同一帳戶核對餘額及收藏。

## 資料位置與舊SC政策

- 現行餘額、羈絆及合約：`users/{uid}/wallet/main`。
- 結算／抽卡流水：`users/{uid}/walletOps/{operationId}`。
- 對應戰績：`users/{uid}/runs/{operationId}`。
- 收藏仍在`users/{uid}.favoriteCards`，容量沿用200，已包含先前116張收藏所需的更新。
- **新雲端錢包從0開始。舊SC完整留在原本機存檔，不匯入、不合併訪客或其他裝置餘額。** 帳戶快取改用v2，原v1檔案保留。已擁有收藏可合併保存，不會把舊幣值當作新錢包餘額。

## 規則保護與操作方式

錢包只准帳戶本人讀取；建立時必須為0。之後每次加減幣都必須在同一交易內建立新流水，符合原有獎勵公式或100 SC抽卡／25 SC重複退款規則，並同時保存戰績或卡牌。流水不可修改或刪除；重試不再入帳。羈絆及印章只能隨合資格結算更新，不影響技能數值或SC。

訪客與匿名模式仍使用本機SC；登入帳戶SC未確認時暫停抽卡。離線結算保留待同步紀錄，連線後核對。同一帳戶的多裝置交易不採本機餘額覆蓋雲端。

本版仍使用Firebase Spark，**不需Cloud Functions、不需新增索引**。原有名稱修改間隔、個人資料限制、好友挑戰及排行榜規則保留。遊戲成績仍是瀏覽器自評，不是完整防作弊競技系統；抽卡的客戶端亂數機制也沒有改成可信任伺服器抽選。

## 本機驗證

備有`tests/wallet-rules.mjs`及`tests/firestore-rules.mjs`，只接受本機模擬器，使用`demo-`測試專案，不連正式資料庫。前者檢查0起點、跨帳戶／匿名拒絕、直接改幣拒絕、流水不可重寫、合約／羈絆條件、精確退款，以及實際並行結算和抽卡。後者驗證116／200張收藏與既有個人資料限制。

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8099 YRGT_RULES_TEST_PACKAGE_JSON=/path/to/package.json npm run test:wallet-rules
FIRESTORE_EMULATOR_HOST=127.0.0.1:8099 YRGT_RULES_TEST_PACKAGE_JSON=/path/to/package.json npm run test:rules
```

`YRGT_RULES_TEST_PACKAGE_JSON`指向已安裝`firebase`、`@firebase/rules-unit-testing`的專案package.json。瀏覽器流程使用SDK替身；正式iPhone、Google OAuth與正式Firebase權限須由部署後的實際帳戶驗收。本次沒有代為發布正式Firebase設定。
