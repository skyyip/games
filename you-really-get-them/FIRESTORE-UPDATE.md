# 116張收藏所需的 Firestore 更新

本版將收藏同步容量由100提高至200，讓116張卡可完整保存。請先發布新規則，再上傳網站更新；否則超過100張的同步會被舊規則拒絕。網站ZIP不會自動發布Firebase設定。

1. 開啟 [本版 firestore.rules](https://github.com/skyyip/games/blob/work/you-really-get-them/firestore.rules)，使用檔案的完整內容。
2. 在 Firebase Console 選擇 **you-really-get-them** 專案，進入 **Firestore Database → Rules**。
3. 貼上完整規則並按 **Publish／發布**。
4. 上傳網站更新後，登入收藏超過100張的帳戶，確認重新整理仍可看到完整收藏。

規則只把 `favoriteCards.size() <= 100` 改成 `<= 200`；原有本人帳戶限制、欄位限制、名稱修改間隔和戰績規則保留。索引及Cloud Functions均無需更新。本次沒有代為部署正式Firebase。

## 驗證狀態

程式測試涵蓋116張保存與回讀、200張容量、非字串過濾，以及未登入／匿名帳戶不寫入。瀏覽器另使用Firebase SDK測試替身，確認116張完整恢復並於抽卡後送出完整清單。

實際Firestore規則執行測試尚未完成：目前環境阻擋官方模擬器下載，加入 `storage.googleapis.com` 的環境確認未完成，沒有更改網絡設定。SDK測試不等同Firestore規則驗收。

已備妥 `tests/firestore-rules.mjs`，涵蓋116張建立與回讀、100→116→200更新、201張／非清單拒絕、未登入／其他帳戶拒絕，以及不能藉此寫入求生幣。可在有官方Firestore Emulator及已安裝 `firebase`、`@firebase/rules-unit-testing` 的環境執行：

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 YRGT_RULES_TEST_PACKAGE_JSON=/path/to/package.json npm run test:rules
```

`YRGT_RULES_TEST_PACKAGE_JSON` 指向這兩個測試套件所在專案的package.json；若安裝於本遊戲目錄，可省略該變數。測試只接受本機模擬器，使用 `demo-yrgt-card-capacity` 測試專案，不連正式資料庫。
