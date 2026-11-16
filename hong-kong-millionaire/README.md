# 香港百萬富翁

繁體中文香港文化每日問答遊戲，網址為 `/games/hong-kong-millionaire/`；首頁入口排在遊戲列表最後。

## 遊玩

- 香港時間零時更新，每日一局、15 題四選一；291 題分三個難度池，同日使用相同題組。
- 前 10 題限時 20 秒，其後 40 秒；提示、modal、重新整理及切換分頁不暫停倒數。
- 答錯保留第 5 題 $8,000／第 10 題 $60,000 保險線；割禾青及超時保留已累積獎金。所有獎金是虛擬港幣。
- 模糊、局部、鏡像、完整插畫及文字題，163 幅原創題圖與香港街頭漫畫封面。
- 50:50、預寫朋友提示及模擬觀眾各一次。提示不是即時 AI，觀眾比例不是玩家實際投票。
- 匿名只存本瀏覽器今日進度；開局前登入 Google／Email 可保存歷史、稱號、錯題、圖鑑與收藏，參與每日／月度／生涯榜。
- 每日榜依獎金、總作答時間、剩餘錦囊排序；成績分享不含題目、答案或 Email。另可明確選擇製作帶有題目的「考考朋友」圖片，預覽後才分享。

## 單一遊戲資料設定

以首次推出的新遊戲為前提，只使用目前完整題庫 `hk-2026-11`；沒有舊題庫相容、遷移或另開版本資料分區的流程。

- 專案：`sky-playground-millionaire`，與其他遊戲獨立。
- 集合沿用：`hkm_players`、`hkm_results`、`hkm_rankings`、`hkm_seasons`。
- Local Storage 沿用：`sky.hk-millionaire.today.v1`。
- 首次建立玩家及開始挑戰時，正常初始化紀錄；不會自動刪除現有 Firestore 文件。
- 上線先發布完整規則，再上傳網站。三個索引沿用原本定義，已建立相同索引者無須新增，詳見 [FIREBASE.md](FIREBASE.md)。

同一瀏覽器切換帳戶時，各帳戶向雲端核對自己的每日進度；匿名局不會轉成帳戶排名局。開局未確認、答案提交或結算失敗時會保留核對入口。答案重送會檢查題號、開始時間及狀態，不會套到下一題；倒數不重置。

## 題庫與漫畫

新增 67 個香港主題已以 c01–c67 加入抽題、作答、回顧及圖鑑。原始題稿 82 筆去除 15 筆重複；完整題幹、四選一、答案、解說、改寫理由與來源見 [QUESTION-BANK-67.md](QUESTION-BANK-67.md)。另有 14 題日常設計題 u01–u14、原有 90 題，以及本次附件全部 60 題日常細節 d01–d60。新60題的完整四選一、答案、修訂與來源見 [QUESTION-BANK-60.md](QUESTION-BANK-60.md)。

難度池為 73／92／66 題，每池每日抽 5 題，抽題步長與池大小互質，全部題目可被抽到。不能可靠證實的絕對說法改為有條件描述或用途辨識。原創插畫並非實拍、古文字真跡或歷史摹本，資產說明見 [assets/ASSETS.md](assets/ASSETS.md)。

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

作答期間限制選取／複製／剪下題目、選項及提示，並限制題圖的右鍵選單及拖放。帳戶輸入欄、賽後回顧與分享正常運作。這是減少直接複製搜尋的瀏覽器限制，不能阻止截圖、OCR、其他裝置查答案或開發者工具；計時、答案、每日次數與分數仍由既有 Firestore 規則驗證。

Google 實際授權、正式規則與索引部署、實機跨裝置測試仍須在上線環境完成。

## 街角觀察題庫與圖片模式

兩份附件45＋15題已整合，對照及修訂記錄見 [QUESTION-BANK-STREET-60.md](QUESTION-BANK-STREET-60.md)。只有有逐題視覺線索的題目使用模糊、局部或鏡像；局部框固定於來源圖片，不受畫面比例改變；鏡像題只左右反轉並提示還原字樣／方向。舊題未編寫視覺線索者保留原圖或文字。

房間每題作答25秒，揭曉2.5秒；共10題。全部玩家交卷可立即結算，斷線寬限結算門檻為開局305秒。

**上線前須同步發布最新 `firestore.rules`**，使題目ID／答案池與27.5秒房間節奏一致；`firestore.indexes.json`維持四個索引。兩邊玩家均重新載入同一版網站。
