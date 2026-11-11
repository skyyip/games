// Authored situations, not a live news feed. Sources checked 2026-11-06.
export const TOPIC_SOURCES={
 ai:['ILO：生成式AI與工作（2025研究，英文）','https://www.ilo.org/publications/generative-ai-and-jobs-2025-update'],
 skills:['世界經濟論壇：Future of Jobs 2025（英文）','https://www.weforum.org/publications/the-future-of-jobs-report-2025'],
 heat:['勞工處：預防工作時中暑','https://www.labour.gov.hk/tc/news/prevention_of_heat_stroke_at_work.htm'],
 privacy:['個人資料私隱專員公署','https://www.pcpd.org.hk/tc_chi/'],
 access:['數字政策辦公室：無障礙網頁','https://www.webforall.gov.hk/tc/'],
 labour:['勞工處：勞工法例','https://www.labour.gov.hk/tc/legislat/content2.htm']
};
const choice=(label,cost,energy,effects,result,followup)=>({label,cost,energy,effects,result,followup});
export const TOPICS=[
 {id:'ai-review',title:'AI寫得很流暢，證據卻不存在',source:'ai',groups:['software','commerce','finance','science','education','media','emerging'],context:'同事想把AI草稿直接當作交付物。你抽查時發現一個無法追溯的來源，主管卻說「客人四點要」。',choices:[
 choice('核實關鍵資料，先交有證據的部分',80,10,{iq:.6,jq:.7,stress:2},'你移除未核實內容，清楚列出待查項及覆核人；交付範圍縮小，沒有把流暢當成正確。','客人追問被刪去的結論。你拿出來源與版本紀錄，團隊同意把核實列進交付流程。'),
 choice('請同事交叉覆核，協商延後爭議部分',0,14,{eq:.6,jq:.5,contacts:1},'你把疑點與期限攤開，先取得對方同意；核實需要人手，不能保證原定時程。','同事用另一份原始資料找出矛盾，補交時把限制寫明。主管發現覆核也需要排進工時。')]},
 {id:'private-prompt',title:'「把客戶名單貼給AI就快多了」',source:'privacy',context:'同事建議用公開工具整理含姓名、電話及服務紀錄的文件。工具很方便，但沒有使用授權與資料處理安排。',choices:[
 choice('保留資料在核准系統，先做去識別化樣本',0,12,{jq:.7,iq:.4},'你先確認目的、必要欄位與核准工具；去掉姓名不等於已經無法識別，仍需檢查組合資料。','同事發現地址與少見職稱仍可識別客戶。你們減少欄位並取得核准後才測試。'),
 choice('暫用人工整理，請資料負責人確認方案',0,16,{eq:.4,jq:.6,stress:2},'你先維持原流程，列出工作量與疑問，請有權限的人決定；沒有把風險轉嫁給客戶。','負責人釐清了保存期限與存取權。人工處理較慢，但下一次有可用的核准流程。')]},
 {id:'scope-creep',title:'「只是加一點點，今天做完吧？」',source:'skills',context:'客戶在驗收前新增需求，同事已經排滿。原本的交付標準與這次要求不一致，誰都不想當壞人。',choices:[
 choice('拆成必需與可延後項目，重新確認範圍',0,10,{jq:.6,eq:.5,stress:-2},'你列出影響、責任人與兩個時程選項；保留安全及品質底線，把取捨交回有權決定的人。','客戶選擇先完成必要部分。下一階段仍有待辦，但驗收終於有共同標準。'),
 choice('找跨工種夥伴協作，先花時間完成交接',160,14,{eq:.7,contacts:2},'你付出協調成本，明確交代介面與驗收人。多一個人不會立即多一倍產能。','夥伴指出一個你沒想過的依賴。你們調整分工後交付，留下可重用的交接清單。')]},
 {id:'handover',title:'群組已讀，卻沒有人真正接到棒',source:'skills',context:'輪班或混合工作交接只剩一句「處理好了」。版本、客戶承諾和未完成事項散落在不同訊息。下一班正等著開始。',choices:[
 choice('重建交接單，標出版本、負責人及待辦',0,12,{jq:.7,iq:.4},'你先確認現在的真實狀態，再請接班者覆述下一步；文件需要更新，不能只寫一次。','接班者按清單發現一個未結案項目。問題被提早接住，交接成了雙向確認。'),
 choice('安排短會共同走一遍，當場記下異常',0,16,{eq:.7,contacts:1},'你尊重對方輪班與時差，先確認可用時間；會後仍留下可追溯文字，免得缺席者失去資訊。','一位沒參加會議的同事靠紀錄接手。團隊把短會留給異常，例行事項改用清楚文字。')]},
 {id:'reskill',title:'新工具來了，舊技能就沒用了嗎？',source:'skills',context:'公司想推新工具，培訓卻只給一段影片。資深同事擔心被取代，新人則不知道出了錯要找誰。',choices:[
 choice('挑低風險任務試點，記錄錯誤與工時',120,12,{iq:.7,jq:.4},'你用同一套驗收標準比較新舊方法，保留人工接手；研究提到的工作轉變不等於一定裁員。','試點顯示工具省了整理時間，覆核仍要專業。你的行業知識反而幫團隊分辨什麼可以自動化。'),
 choice('和資深同事配對學習，交換工具與現場經驗',0,14,{eq:.7,jq:.5,contacts:1},'你用真實小案例一起練習，承認雙方都有不懂的部分；培訓需要工時，不應全靠下班自學。','資深同事找到影片漏掉的例外，你補上操作示範。團隊開始願意提問，不再假裝全懂。')]},
 {id:'heat',title:'天氣警告響了，工期卻沒有變',source:'heat',groups:['trades','architecture','food','transport','agriculture','nature','sports','services'],context:'工作場所又熱又悶，有人開始頭暈。主管擔心延誤，但飲水、通風、休息及工作強度需要重新評估。',choices:[
 choice('先停止受影響工作，求助並啟動防暑安排',0,10,{jq:.8,stress:-3},'你安排同事到陰涼安全地方並按情況尋求醫療協助，通知負責人評估風險；不能用遊戲選項代替現場急救程序。','重新安排較涼時段及休息後，工期需要協商。提早說明安全限制，讓客戶知道延後的原因。'),
 choice('立即找現場負責人，調整工序與人手',160,12,{eq:.6,jq:.6},'你先讓不適同事離開高熱環境並求助，再依風險評估調整工作；不以輪替代替必要停工及醫療處理。','團隊補了通風與飲水安排，也檢查新人的工作強度。防暑不再只是一句「自己小心」。')]},
 {id:'access',title:'交付通過了，但有些人根本用不到',source:'access',groups:['software','visual','education','commerce','support','media'],context:'試用者說資訊只靠顏色、文字難讀，或操作必須精準點擊。原驗收清單沒有涵蓋這些使用情況。',choices:[
 choice('邀使用者測試，先修阻礙核心流程的問題',120,12,{eq:.6,iq:.4,jq:.5},'你把可觀察的障礙寫成測試條件，檢查文字、對比、替代操作與回饋；沒有替使用者猜答案。','使用者再次測試指出一個你忽略的狀態。修正成本增加，但核心流程終於能完成。'),
 choice('與同事逐項走查，訂下分階段改善計畫',0,16,{jq:.7,eq:.4},'你先處理會卡住人的部分，列出未完成事項、期限與覆核人；改善有進度，也有可追問的責任。','下一次需求評審直接帶入檢查清單。團隊發現一開始考慮可用性，比最後補救更省事。')]},
 {id:'short-staffed',title:'兩個人離職，工作卻一項都沒少',source:'labour',context:'公司縮編後，把空缺的工作直接分給你。新人沒有受訓，客戶仍期待原本的服務速度。',choices:[
 choice('記錄負荷與風險，和主管重新排序',0,12,{jq:.7,eq:.5,stress:-3},'你把所需工時、資格限制及服務風險具體列出，討論減量、補人或調整期限；不靠無限加班掩蓋缺口。','主管同意暫停低優先項目。不是每個客戶都滿意，但團隊終於有能履行的承諾。'),
 choice('先做關鍵交接與新人帶教，提出支援需求',80,16,{eq:.7,jq:.5,stress:2},'你把高風險工作留給有資格的人，花工時帶教；新同事不需要為沒受過的訓練背鍋。','新人能獨立處理一小段工序。你留下帶教紀錄，仍向公司追蹤未補上的人力缺口。')]}
];
export function topicFor(g){const pool=TOPICS.filter(t=>!t.groups||t.groups.includes(g.job?.category));return pool[(Math.floor(g.s.elapsed/2)+(g.s.history.length-1))%pool.length];}
