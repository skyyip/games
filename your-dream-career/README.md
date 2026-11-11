# Your Dream Career · 我的夢想職涯

Career 365 的獨立分支，源碼放在本資料夾。專注體驗工作、受督導學徒訓練、技能成長、職涯發展、轉職與玩家合作。原版 `career-365/` 及青蛙遊戲的源碼、存檔與 Firebase 設定未改動。

路徑：`/games/your-dream-career/`。已登記到網站建置、SEO及部署流程；目前不在 landing page 卡片清單顯示。推送main後由GitHub Actions建置並部署。

## 遊玩流程

1. 為主角命名、領取工作證，搜尋405種職業／25個領域。先看具體能力、工作難題、訓練要求與薪酬參考，再免費確認首次入行。
2. 每月可免費選一張工具卡，也可直接繼續故事。核對清單展開實作參考；同事接力協助第一步；留點餘裕讓首次交付後保留6精力。
3. 排列工序、核對異常、分配數量或匹配資料；必要時請教師傅、讀教材及訂正專業觀念。查看不扣安排，確認交付才用一次安排及明示成本。失敗留下具體回饋與補救方向，技能不清空。
4. 每月兩次安排，可補練、休整、和同事交流、處理可選職場突發工單或轉職。能力循序成長，高數值的增幅會放慢。
5. 月結只結算職涯薪金、簡化MPF／稅款、基本開支與工作壓力。薪金每月最多一份。學徒須完成五階段能力證據、年期、實作及必要模擬考核才出師；升職需要本職業實績。
6. 轉職保留舊技能、作品與已取得的遊戲資格；重新建立新行業實績。花$3,000及一次安排，相關技能可帶來優勢，也會有聲望、人脈及收入的取捨。
7. 65歲固定退休，回顧解難、轉職與成長，下載完整HTML職涯漫畫（可列印PDF）或JSON備份。

一般月結不設每日限制。提早略過未用安排每天最多12次，UTC+9午夜重設；摘要訓練按月完成安排，不使用跳月額度。沒有每日登入懲罰、付費抽卡或外部AI呼叫。

## 新版範圍

已移除可遊玩的投資、賭博、戀愛、婚姻、生育、旅遊、財務自由及其他人生選擇。月結不呼叫原版的市場、家庭、生活事件或隨機疾病結算，單純隱藏選單以外也切斷了這些被動事件。

保留原版職業資料、專業觀念題、人物連載、四段故事循環、作品集、專精、學徒與工作成長，以及社群介面。四種職業有手寫四段主線，其餘職業使用相關領域及職務情境組成的版本化故事；不是405套完全獨立手寫劇本。角色頭像沿用本機原創漫畫SVG並存入進度。

新職場工單涵蓋AI資料驗證、資料私隱、臨時加需求、混合工作交接、再培訓、酷熱工作、無障礙及人力縮減。選擇後立即顯示結果，下月顯示後續，並留下漫畫。都是原創綜合案例，不是即時新聞。背景資料與熱門遊戲玩法靈感列於 [SOURCES.md](SOURCES.md) 及遊戲內參考彈窗。

薪金沿用香港行業／職業組別統計代理值，職業卡會明示並非個別職位的官方平均。學徒薪金、基本開支、訓練月數、MPF及稅款為遊戲簡化設定，不是聘用條件或現實執業資格。

## 本機啟動與檢查

在專案根目錄：

```sh
npm ci --prefix your-dream-career
npm ci --prefix tools
PLAYGROUND_BASE_PATH=/games/ node tools/build-site.mjs /tmp/dream-site
mkdir -p /tmp/dream-preview
ln -s /tmp/dream-site /tmp/dream-preview/games
python3 -m http.server 5431 --directory /tmp/dream-preview
```

開啟 `http://localhost:5431/games/your-dream-career/`。Firebase SDK使用npm套件，應經網站建置後預覽。

```sh
npm test --prefix your-dream-career
node tools/check-seo.mjs
node tools/check-seo.mjs /tmp/dream-site /games/
```

## 存檔與Firebase隔離

本機IndexedDB、localStorage、帳戶身分、成長回顧、跳月次數、分頁鎖及Service Worker快取均使用 `your-dream-career` 名稱空間。備份須有 `dreamCareer.version === 1`，不接收Career 365的存檔。

依使用者選擇，先完成本機與社群介面。`src/firebase-settings.js` 的 `projectConfig` 目前為 `null`，不會連上舊專案。之後需獨立Firebase專案才開放Email／Google／匿名登入、私人雲端及真人社群。詳見 [FIREBASE.md](FIREBASE.md)。

## 源碼結構

- `src/game.js`：新版職涯流程、月結、工具卡、突發工單、退休及新增存檔驗證。
- `src/legacy-core.js`：本資料夾內複製的底層狀態、技能、職涯與存檔驗證。為兼容職業模組保留原狀態欄位；新版不開放人生支線。
- `src/vocation*`、`src/career-stories*`、`src/story-domains.js`：職業課程、實作小遊戲與版本化故事。
- `src/workplace-topics.js`：原創職場議題、取捨及後續。
- `src/app.js`、`index.html`、`dream.css`：聚焦職涯的新介面。
- `src/social-*`、`firestore.rules`、`firestore.indexes.json`：Spark方案社群與隔離資料集合，不需要Cloud Functions。

UI保留原版紙張／柔和漫畫風格，閱讀內容主要13–16px；查看詳情使用modal，標題不取得焦點，沿用此專案既有的無focus外框設定。共用網站字型與圖示仍由鄰近遊戲的靜態資產提供，職業遊戲源碼無須匯入原版模組。
