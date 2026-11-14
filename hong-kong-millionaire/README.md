# 香港百萬富翁

獨立的繁體中文香港文化每日問答遊戲。網站路徑為 `/games/hong-kong-millionaire/`，首頁入口排在遊戲列表最後。

## 遊玩

- 香港時間零時更新，每天一局、15題四選一，題庫90題，分三個難度，所有玩家同日挑戰相同題組。
- 前10題20秒，其後40秒。視窗、確認、重新整理與切換分頁都不會暫停時鐘。
- 答錯只保留第5題$8,000／第10題$60,000保險線；割禾青及超時保留當前已累積獎金。所有獎金是虛擬港幣。
- 模糊、局部、鏡像、完整插畫及文字題；22幅原創文化插畫，並非景點實拍或古文字真跡。
- 50:50、預寫朋友提示及模擬觀眾，每種一次。朋友並非即時生成AI，觀眾比例不是其他玩家的實際投票。
- 匿名只保留本瀏覽器今日進度及回顧；開局前登入Google／Email才會永久保存歷史、稱號、錯題、圖鑑與收藏，以及參與三種排行榜。
- 每日榜依獎金、總作答時間、剩餘錦囊排序；賽季為香港月份，總榜累積生涯虛擬獎金。分享不含題目、答案、Email。

## 開發與建置

```sh
cd hong-kong-millionaire
npm ci
npm test
npm run rules:check
npm run firebase:check
```

從網站根目錄使用現有建置工具，不可直接把含裸Firebase imports的原始碼上傳：

```sh
npm ci --prefix tools
BBL_ESBUILD_MODULE="$PWD/tools/node_modules/esbuild/lib/main.js" PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs /tmp/games-built
```

將建置結果內容上傳至網站的 `public_html/games/`，包含 `.htaccess`。原始碼、`node_modules`、Firebase CLI登入資料均不需上傳。

## 資料與界線

Firebase完全獨立於其他遊戲，專案為 `sky-playground-millionaire`，集合都以 `hkm_` 開頭。規則與索引、設定及部署指令均在本資料夾。使用Spark可用的Auth與Firestore，不需要Cloud Functions。

登入玩家的每日紀錄及結算由Firestore規則驗證逐題轉移、伺服器時間、保險線及榜單總額。匿名限制依賴本機儲存，清除資料或換裝置不能可靠辨識同一人；多個帳戶亦不能視為同一自然人。題庫與提示在客戶端可讀，倒數不保證杜絕查答案。伺服器驗證答題提供2秒網絡寬限，畫面仍按20／40秒結束。

題目有中文解說及官方來源入口；來源不是已即時查證的逐篇文章，需定期人工維護時效及文化準確度。題組按30天循環，擴題時請同步更新規則與版本，避免進行中的每日題組被改寫。

詳細設定見 [FIREBASE.md](FIREBASE.md)，驗證範圍見 [VERIFICATION.md](VERIFICATION.md)。
