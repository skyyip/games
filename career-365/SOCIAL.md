# 玩家社群與合作公司：Spark 版

入口：「其他人生選擇」→「玩家社群與合作公司」。此版本適用 Firebase **Spark**，只使用 Authentication、Cloud Firestore 及靜態網站，不需要 Cloud Functions、Cloud Scheduler 或 Blaze。

## 玩家可以做甚麼

- Email／Google 帳戶可建立動物名片、固定玩家代號、介紹及最多三項自述專長。匿名帳戶先綁定登入方式，原有人生保留。
- 決定是否公開名片、顯示職業、接受邀請及同意好友推薦。不公開現金、健康、IQ／EQ／PQ／JQ、Email、人生識別或私人劇情。未公開名片仍可由已接受的好友及目前公司夥伴查看；公開公司資料包含團隊UID。
- 好友邀請需本人接受。提供三種快捷訊息、移除好友、封鎖、解除封鎖及舉報。每對玩家的訊息只保留發訊者最近一則，至少相隔60秒；已結束好友關係需等24小時才能再次邀請。
- 建立一間合作公司，負責人之外最多八位真人夥伴。這是單人職業之外的合作，不強制轉職、不收費，也不調整單人NPC或薪金。
- 刊登六類工種、合作條件、公告，邀請或接受玩家申請。公司確認條件後，候選人仍須最後接受才能加入。候選人可提出新條件；好友推薦先由候選人同意，再由公司邀請。已處理公司邀請需等24小時才能重新提出。
- 負責人發布文字委託，夥伴認領、提交處理建議，由負責人人工確認或要求補充。完成紀錄不代表專業認證、伺服器評分或排名。
- 可離職、移除成員、提出交接及結束公司。接任者必須本人接受，原負責人才退出公司；不能單方面把管理權交給其他玩家。
- 換人生或65歲退休後，下次開啟社群會同步：夥伴離職，負責人的公司暫停，等待交接或結束。好友及原有紀錄保留。已離職夥伴未完成的委託由負責人手動取消；沒有資金被鎖住或到期扣款。公司結束後，其他夥伴在下次開啟社群時解除舊職位。

## 與先前 Functions 方案的差別

已移除合作點、首次點數、公司基金、報酬協商、預留款、支付、自動評分、自動退款、排程清理、自動聲望／資歷及定時後續委託。合作條件是純文字約定，不是金錢合約。

合作不增加單人人生的現金、技能、人脈、聲望、資格、每月安排或退休資產；沒有可領取的交付獎勵。舊存檔的歷史合作紀錄仍可讀取，但不能再新增本機獎勵。玩家自行提交的文字不被當成可信的成績。

舊 `career365_social_*`／`career365_cards` 等 Functions 集合保持禁止客戶端存取；新資料使用 `career365_spark_*` 集合，沒有自動搬移。此專案先前尚未成功部署 Functions。儲存庫已移除 Functions 原始碼、依賴和部署設定；若曾自行另外部署過舊 Functions，需由管理員在Console另行確認停用，這次靜態更新不會替你刪除雲端資源。

## 部署：只需要 Spark

唯一專案：`sky-playground-career-365`。青蛙專案不受影響。

1. [Firebase Console](https://console.firebase.google.com/project/sky-playground-career-365/overview)：確認已建立預設Firestore，並啟用Email／Password、Google登入及網站的Authorized domains。毋須升級Blaze或啟用Functions。
2. 在自己的電腦安裝Node.js22或以上，於儲存庫根目錄執行：

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
npm ci --prefix career-365
npm run social:check --prefix career-365
```

3. 檢查輸出專案為`sky-playground-career-365`，範圍只有`firestore:rules,firestore:indexes`，然後執行：

```bash
npm run social:deploy --prefix career-365
```

這個指令固定使用`career-365/firebase.json`及本遊戲設定的projectId。`firebase:deploy`亦部署同一組規則／索引。不能只部署索引：新的社交規則需要一起發布，否則操作會被拒絕。不要把社交集合改成公開讀寫，也不用執行`firebase init`覆寫設定。

4. 到[Firestore索引頁](https://console.firebase.google.com/project/sky-playground-career-365/firestore/indexes)等待三個複合索引可用：

| 集合 | 欄位 |
| --- | --- |
| `career365_spark_requests` | parties陣列包含、updatedAt降序 |
| `career365_spark_requests` | companyId升序、updatedAt降序 |
| `career365_spark_companies` | listed升序、status升序、updatedAt降序 |

5. 發布最新版靜態網站。使用兩個Email／Google帳戶驗收：名片、好友接受、公司邀請與條件協商、認領／提交／負責人確認、離職／交接、封鎖及舉報。驗證不會出現合作點，也不會增加單人人生屬性。

## 權限、用量與管理

規則以Firebase Auth UID判斷操作者；支援已綁定Email／Google、但登入token仍標為anonymous的帳戶。直接匿名或未登入無法使用社群。玩家不能任意修改他人名片、私人人生識別、公司職位或委託狀態。

好友的兩份對稱文件、加入公司時的邀請／名額／私人職位、公司交接均以原子交易及`getAfter`規則共同驗證，不能只改其中一份。只有負責人可以確認委託，亦不能把已完成委託改回進行中。規則拒絕額外的餘額、分數或獎勵欄位。私人雲端存檔規則維持原有版本檢查及本人權限。

畫面與Firestore SDK延後載入；只有開啟、手動重新整理或操作後才讀取，沒有背景輪詢。每次列表有規則與客戶端上限：公司30、委託30、公司邀請40、好友關係50、訊息30、封鎖100；顯示的是最近紀錄，不代表全帳戶總量。封鎖即使未列在最近100筆，規則仍會阻止直接互動。公共資料同樣需要註冊帳戶，私人名片不可列舉。

Spark仍有Firestore免費配額；本版本不保證無限用量。額度耗盡時社交暫停，本機人生與離線存檔可繼續。查詢上限及每對玩家冷卻不等於伺服器級全域限流。

舉報位於`career365_spark_reports`，只允許舉報者寫入及本人單筆查看，其他客戶端不能讀取或列舉。同一對玩家24小時內只記一次；由管理員使用Console人工處理，不會自動停權。介紹、公告及交付內容均按純文字轉義顯示。

## 本機驗證

```bash
npm ci --prefix career-365
firebase emulators:exec --project demo-career365 --only firestore \
  --config career-365/firebase.json \
  "npm run test:rules --prefix career-365 && npm run test:social:rules --prefix career-365"
```

`test:rules`保留原有私人存檔及舊Functions集合拒絕測試；`test:social:rules`使用真實Firebase客戶端和實際Spark adapter，驗證名片私隱、同意、條件協商、推薦、八人名額競爭、認領競爭、手動交付、禁止獎勵、退休／交接、封鎖／舉報及查詢上限。只連接本機8090的demo專案，不建立正式帳戶或發送正式訊息。

`scripts/social-browser.mjs`同樣需要本機Firestore模擬器，以實際Web SDK及安全規則執行四尺寸雙玩家流程；Auth是測試身份。`scripts/social-production-check.mjs`驗證打包版訪客社群畫面及安裝後離線本機遊玩，不呼叫正式Firebase。
