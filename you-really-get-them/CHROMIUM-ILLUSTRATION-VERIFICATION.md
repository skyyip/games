# Chromium 漫畫插圖回歸驗證

## 測試方式
- Chromium headless 真實瀏覽器執行。
- 手機視窗 390 × 844 CSS px、DPR 3、觸控模擬。
- 由 Chromium 載入遊戲 HTML/CSS 與實際 ES module 程式；由測試 harness 將本地資產映射為 data URL，因執行環境禁止 localhost 導覽。
- 五個陣營各完成 10 題，使用正確答案路徑完成整局。
- 測試事件包含刮除揭曉、快速連打、逃跑選項、按住確認、狗狗肉泥救援及貓掌保杯。
- Duo 解鎖狀態由測試 fixture 預置，不更動正式遊戲解鎖條件。

## 完整遊玩結果

| 陣營 | 題數 | HP | 正確率 | 結果 |
|---|---:|---:|---:|---|
| 她的心思 | 10/10 | 100 | 10/10 | 通過 |
| 他的心思 | 10/10 | 100 | 10/10 | 通過 |
| 狗狗心思 | 10/10 | 100 | 10/10 | 通過 |
| 貓主子心思 | 10/10 | 100 | 10/10 | 通過 |
| 雙人默契 | 10/10 | 100 | 10/10 | 通過 |

## 響應式檢查
首頁、答題及結果畫面均檢查以下寬度，未發現水平溢出：

320、360、375、390、414、768、1024、1280 CSS px。

## 結果海報
- Canvas：1080 × 1920。
- 手機預覽寬度：334 CSS px（390 px viewport）。
- 陣營插圖成功載入並繪製。
- 五個陣營均完成結果畫面。

## 程式檢查
- `npm test`：2 passed，0 failed。
- `node --check src/app.js`：通過。
- `node --check src/poster/poster.js`：通過。
- Chromium page errors：0。

## 限制
此測試是 Chromium 瀏覽器中的行動尺寸與觸控事件模擬，不是實體 iOS/Android 裝置測試。由於此執行環境封鎖 localhost 導覽，頁面以 set-content 與本地資產 data URL 映射方式載入；因此不代表部署伺服器、Service Worker、PWA 安裝、Safari/Firefox 或原生分享面板已完成驗證。
