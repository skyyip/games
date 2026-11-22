# Chromium 完整操作模擬與修復紀錄

## 測試環境
- Chromium headless，390 × 844 CSS px，DPR 3，啟用 mobile / touch emulation
- 使用正式遊戲 HTML、CSS、ES modules 與 Canvas；在瀏覽器內以真實 DOM 事件操作
- 另以 320、360、375、390、414、768、1024、1280 px 寬度檢查頁面水平溢出

## 完整遊戲流程
五個陣營各完成一局、每局 10 題，均以正確答案走到結果頁：

| 陣營 | 答對 | 結算 HP | 結果海報 |
|---|---:|---:|---|
| 她的心思 | 10 / 10 | 100 | PNG 產生成功 |
| 他的心思 | 10 / 10 | 100 | PNG 產生成功 |
| 狗狗心思 | 10 / 10 | 100 | PNG 產生成功 |
| 貓主子心思 | 10 / 10 | 100 | PNG 產生成功 |
| 雙人默契 | 10 / 10 | 100 | PNG 產生成功 |

狗狗與貓咪場次另外完成所有主要互動成功路徑：刮除揭曉、快速連打、逃跑選項 pointer event、肉泥救援／貓掌保杯、按住確認。結果 Canvas 為 1080 × 1920，`toBlob()` 可產生 `image/png`。各場次未記錄 page-level JavaScript exception。

## 導覽與版面
- 頁首品牌連結：遊戲中會先開啟放棄確認；確認後回首頁。結果／收藏等非遊戲畫面可直接回首頁。
- 玩法說明 Dialog 可開啟、關閉。
- 收藏頁可進入並返回首頁。
- 320–1280 px 的 8 個視窗寬度，`documentElement.scrollWidth` 與 viewport 寬度一致，未觀察到水平溢出。

## 本次修復
1. 頁首品牌連結原本只有 `href="#home"`，但首頁 section 隱藏時不會切換畫面。現在會依狀態導回首頁；遊戲中則沿用既有放棄確認流程，避免直接丟失進度。
2. 分享海報匯出時，原本未處理 `canvas.toBlob()` 回傳 `null` 的情況。現在與下載流程一致，會顯示匯出失敗提示並停止建立 File。

## 自動化檢查
- `npm test`：2 passed，0 failed
- `node --check src/app.js`：通過
- Chromium 導覽／Dialog smoke test：通過，0 page errors
- 五陣營完整 10 題流程：全部通過

## 驗證限制
這是 Chromium 瀏覽器執行與行動裝置尺寸模擬，不等於實體 iOS／Android 測試。測試以記憶體儲存替身隔離場次；未驗證實際瀏覽器 localStorage 跨重啟持久化、原生分享面板、真實裝置下載行為、Safari／Firefox、Service Worker 離線與 PWA 安裝。
