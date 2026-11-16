# 香港百萬富翁

繁體中文香港文化每日問答遊戲，網址為 `/games/hong-kong-millionaire/`；首頁入口排在遊戲列表最後。

## 遊玩

- 香港時間零時更新，每日一局、15 題四選一；171 題分三個難度池，同日使用相同題組。
- 前 10 題限時 20 秒，其後 40 秒；提示、modal、重新整理及切換分頁不暫停倒數。
- 答錯保留第 5 題 $8,000／第 10 題 $60,000 保險線；割禾青及超時保留已累積獎金。所有獎金是虛擬港幣。
- 模糊、局部、鏡像、完整插畫及文字題，103 幅原創題圖與香港街頭漫畫封面。
- 50:50、預寫朋友提示及模擬觀眾各一次。提示不是即時 AI，觀眾比例不是玩家實際投票。
- 匿名只存本瀏覽器今日進度；開局前登入 Google／Email 可保存歷史、稱號、錯題、圖鑑與收藏，參與每日／月度／生涯榜。
- 每日榜依獎金、總作答時間、剩餘錦囊排序；成績分享不含題目、答案或 Email。另可明確選擇製作帶有題目的「考考朋友」圖片，預覽後才分享。

## 全新進度版本

目前只使用 `hk-2026-11-v4`；按擁有者要求，不延續舊版遊玩紀錄。Firebase 身份保留，進度、總獎金與排行榜從新集合開始。舊文件未刪除，本版不讀寫。

- 專案：`sky-playground-millionaire`，與其他遊戲獨立。
- 集合：`hkm_v4_players`、`hkm_v4_results`、`hkm_v4_rankings`、`hkm_v4_seasons`。
- Local Storage：`sky.hk-millionaire.today.v4`。
- 需先發布完整規則和三個新集合索引，再上傳建置網站，詳見 [FIREBASE.md](FIREBASE.md)。

同一瀏覽器切換帳戶時，各帳戶向雲端核對自己的每日進度；匿名局不會轉成帳戶排名局。開局未確認、答案提交或結算失敗時會保留核對入口。答案重送會檢查題號、開始時間及狀態，不會套到下一題；倒數不重置。

## 題庫與漫畫

新增 67 個香港主題已以 c01–c67 加入抽題、作答、回顧及圖鑑。原始題稿 82 筆去除 15 筆重複；完整題幹、四選一、答案、解說、改寫理由與來源見 [QUESTION-BANK-67.md](QUESTION-BANK-67.md)。另保留 14 題日常設計題 u01–u14 及原有 90 題。

難度池為 54／66／51 題，每池每日抽 5 題，抽題步長與池大小互質，全部題目可被抽到。不能可靠證實的絕對說法改為有條件描述或用途辨識。原創插畫並非實拍、古文字真跡或歷史摹本，資產說明見 [assets/ASSETS.md](assets/ASSETS.md)。

## 開發與建置

```sh
cd hong-kong-millionaire
npm ci
npm test
npm run rules:check
npm run review:check
npm run firebase:check
```

在儲存庫根目錄建置全站：

```sh
npm ci --prefix tools
BBL_ESBUILD_MODULE="$PWD/tools/node_modules/esbuild/lib/main.js" PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs /tmp/games-built
```

把建置結果內容上傳到 `public_html/games/`，包含 `.htaccess`。不能直接上傳包含裸 Firebase imports 的原始碼；不用上傳 `node_modules` 或 CLI 登入資料。

## 驗證與界線

實際 Firestore Emulator 驗證使用與正式程式共用的交易 payload；第一題、完整結算及越權反面案例已通過。詳見 [VERIFICATION.md](VERIFICATION.md)。逐題驗證採操作白名單，避免舊規則超出 Firestore 1,000 expressions 限制。

此架構使用 Spark 可用的 Auth 與 Firestore，不需 Cloud Functions。匿名每日限制依賴本機儲存，多裝置或多帳戶無法可靠辨識同一自然人；客戶端題庫可讀，倒數不保證杜絕查答案。伺服器答題驗證提供 2 秒網絡寬限，畫面仍按 20／40 秒結束。

Google 實際授權、正式規則與索引部署、實機跨裝置測試仍須在上線環境完成。
