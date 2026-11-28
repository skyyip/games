# 香港百萬富翁效能與首頁調整（2026-11-28）

首頁的常用介面字元改用原 Chiron 字體的輕量子集，其餘字元繼續使用完整原字型分區。42個新增 WOFF2 合共944,732 bytes，原始字型沒有刪除或改寫。產生時逐字驗證400／700字重的輪廓與字寬，保留完整變數字重範圍及授權／版權名稱；原OFL授權檔繼續隨網站提供。這是同一字型的子集，沒有更換中文字體設計。

收藏冊使用同一個 IntersectionObserver，提前160px恢復即將進入畫面的閃卡。畫面外的掃光與星芒暫停，捲入後繼續；每次重繪及關閉卡冊斷開舊觀察，沒有額外計時器。可見效果、詳情視窗、減少動態設定及卡片資料維持原流程。

另按新要求將#start、#lobby-arcade、#lobby-collection、.daily-ticket及#lobby-status在各響應斷點原大小上加15%；掛單卡片不再建立賣家名稱節點。這是介面調整，沒有刪除雲端賣家資料或改動成交記錄。

## 本機對照

Chromium、冷載入390×844／收藏冊390×900、4倍CPU降速，本機未壓縮HTTP、冷載入各3次、阻擋外部請求與Service Worker。收藏冊重繪量5次，閒置採樣1秒。完整原始值見[測量資料](performance-measurements.json)。

| 指標 | 更新前 | 更新後 |
| --- | ---: | ---: |
| 首頁同源資源body bytes | 5,016,751 | 3,247,653（減35.3%） |
| 首頁字型body bytes | 2,583,260 | 797,064（減69.1%） |
| 收藏冊運行中動畫 | 90 | 6 |
| 收藏冊每秒主執行緒工作 | 644.6ms | 266.5ms（減58.7%） |
| 收藏冊每秒style recalculation | 107.7ms | 14.8ms |
| 重繪至下一畫面中位數 | 268.9ms | 139.1ms |
| 冷載入DCL中位數 | 599.4ms | 635.6ms |
| 冷載入LCP中位數 | 392ms | 428ms |

本機首屏時間有波動，這組樣本沒有顯示穩定的DCL／LCP改善。可量得的收益是下載量、收藏冊運算與動畫數下降；上述毫秒值不代表真實手機／生產網絡的保證。題庫仍完整載入，原1,011題及遊戲邏輯沒有改變。原完整字型保留，所以網站成品增加約0.94MB，常用首頁實際下載字型減少。

## 再生及檢查

一般建置使用已提交的子集，不需要安裝Python字型工具。修改介面文字後可在開發環境執行：

```sh
python3 -m pip install 'fonttools[woff]'
python3 scripts/generate-ui-fonts.py
python3 scripts/generate-ui-fonts.py --check
```

`--check`僅需Python標準庫；核對輸入檔、原始字型、產生CSS與42個子集的SHA-256。[產生紀錄](performance-ui-fonts.json)保存來源與FontTools版本。原字型授權：[Chiron Hei HK](../assets/fonts/chiron-hei-hk/ChironHeiHK-OFL.txt)、[Chiron Sung HK](../assets/fonts/chiron-sung-hk/ChironSungHK-OFL.txt)。

本次不更動Firebase Rules、七個索引、抽卡8%循環、價格或玩家資產；正式Firebase及網站未代為部署。
