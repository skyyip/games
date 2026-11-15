# 原創題圖

本資料夾 37 張 SVG 由 Sky Playground 的開發工作製作，使用程式繪製，沒有下載或拼貼第三方照片、節目畫面、官方徽號、人物肖像或書法作品。

題圖以柔和色彩和香港地標／文化物件的輪廓作辨識線索，適合模糊、局部、鏡像及完整插畫模式。它們是**原創插畫或教學示意**，不是實景照片或歷史文物的準確摹本：

- `harbour`、`tram`、`ferry`、`clock`、`peak`、`lion`：香港天際線、電車、小輪、鐘樓、山頂、獅子山的識別輪廓。
- `dragon`、`buns`、`lantern`：火龍、包山及燈籠的節慶插畫，並非活動紀錄照。
- `milk`：茶袋／棉布濾茶示意，不表示以真實絲襪製茶。
- `bun`：菠蘿包的格紋酥皮示意，沒有以實際菠蘿作食材的暗示。
- `geopark`、`trail`：六角柱岩景觀和無路線編號的標距柱教學插畫，不作導航或特定路段記錄。
- `sport`：帆船、劍擊和獎牌的複合運動題材。
- `temple`：中國寺廟庭院的概念插畫，不表示是某座廟宇的測繪或照片。
- `calligraphy`：抽象練筆示意，**不是曾灶財或其他書法家的作品**。
- `sun`、`moon`、`mountain`、`tree`、`river`：簡化象形教學圖，並非考古原件或特定年代字形的複製。
- `star`：洋紫荊靈感植物插畫，不是官方區旗圖案。
- `cover`：香港天際線與問號金幣的原創遊戲封面；沒有使用電視節目的標誌。

`generate_art.py` 及 `generate_urban_art.py` 可重現全部 SVG。每張題圖均使用 `800 × 500` viewBox，封面為 `1280 × 800`；XML 已通過解析檢查。

## 香港日常設計新增題圖

`generate_urban_art.py` 產生14張800×500原創示意圖：`tram-lifeguard`（歷史裝置位置）、`ferry-bench`（椅背與轉軸）、`steel-seats`、`bus-route-sheet`、`taxi-light`、`weep-holes`、`pawn-screen`、`escalator-brush`、`tong-lau-arcade`、`seawater-flushing`、`lamppost-number`、`scalloped-coins`、`yellow-box`、`red-market-bag`。原來23張由`generate_art.py`重建。

巴士路線和燈柱編號是虛構示例；硬幣只畫波浪輪廓、不含幣面及面額；電車不聲稱現役普遍保留裝置。不得把這些示意圖作導航、工程圖或實物細節考證。每題以`focus`指定局部焦點，`modes`限制適用的呈現方式；水資源數字題只用文字。分享圖使用插畫局部與四選一，不標正確答案。
