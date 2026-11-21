# 你真的懂他／她／牠嗎？｜高血壓求生模擬器

一款繁體中文、單頁式、可離線遊玩的互動喜劇問答遊戲。使用原生 HTML/CSS/JavaScript ES Modules，無需建置流程或第三方套件。

## 開始遊玩

在此資料夾執行：

```bash
npm run serve
```

瀏覽器開啟 `http://localhost:4173`。也可用任何靜態網站主機部署；GitHub Pages 可直接發布此資料夾內容。

## 遊戲內容

- 五個陣營：她的心思、他的心思、狗狗心思、貓主子心思、雙人默契（完成三場後解鎖）。
- 每局十題、每題十秒、100 HP；答錯扣血、超時扣 40 HP。
- 特殊互動：刮除怒氣黑霧、三秒快速連打、逃跑選項、按住確認，以及狗狗肉泥／貓咪護杯事件。
- 豬隊友提示：每局最多兩次，每次消耗 5 HP。
- 求生幣、五張收藏卡、LocalStorage 本機保存。
- Canvas 1080×1920 戰績海報，支援 PNG 下載及支援檔案分享的瀏覽器分享。
- Web Audio API 音效、靜音、手機觸控、鍵盤可操作的基本支援、減少動態效果設定。
- Service Worker 離線快取。

## 檔案結構

```text
index.html
styles.css
manifest.webmanifest
sw.js
src/
  app.js
  questions.js
  audio.js
  storage.js
  poster/poster.js
tests/game.test.js
```

## 開發與測試

```bash
npm test
```

## 注意

遊戲中的人物題目是喜劇情境，不是心理學判斷。狗／貓題目僅提供一般性行為知識，不可取代獸醫或合格動物行為專業意見。遊戲資料保存在玩家目前瀏覽器的 LocalStorage；清除網站資料會清除收藏與紀錄。Google Fonts 只用於美術字型，離線時會使用系統字型替代。
