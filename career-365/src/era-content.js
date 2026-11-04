// Dated real-world inspiration. All stages, prices and future outcomes below are fictional simulation content.
export const ERA_REFERENCE_DATE='2026-11-04';
export const ERA_PHASES=[{id:'emerging',name:'新芽',months:3,demand:.96},{id:'growth',name:'成長',months:6,demand:1.12},{id:'peak',name:'擁擠高峰',months:4,demand:1.04},{id:'cooling',name:'冷卻調整',months:5,demand:.88},{id:'normal',name:'日常化',months:6,demand:1}];
const sectors='food trades software hardware health support education visual media performance commerce finance science architecture transport nature animals service public sport newventures ai funeral forensics experience'.split(' ');
const topic=(id,name,emoji,categories,offset,npc,reference,headlines,stages)=>({id,name,emoji,categories,offset,npc,reference,headlines,stages});
// A stage contains a situation plus three meaningful responses. A fourth response always permits a free pause.
export const ERA_TOPICS=[
 topic('ai','AI成為職場同事','🤖',sectors,3,'小衡・流程夥伴',{title:'香港人才服務辦公室：2026創科人才方向',date:'2026-08-14',url:'https://www.hkengage.gov.hk/en/essentials/career-business/in-demand-innovation-technology-professions-on-the-hong-kong-talent-list'},['小型機構開始測試AI工具','企業尋找能把AI放進日常的人','供應商增加，展示效果與實際維護成本開始拉開','部分試行收縮，可靠交付成為競爭條件','AI成為工具之一，行業經驗仍然重要'],[
  ['多了一位AI同事，也多了一份責任','團隊希望你協助導入AI。老闆期待效率，使用者卻擔心錯誤、私隱和額外覆核。',['投資小型自動化試行，清楚界定人工接手','深化本業與覆核能力，守住服務品質','找跨專業夥伴共同設計流程']],
  ['展示成功，真實工作卻卡住','試行遇到例外輸入，資料來源和維護責任都需要重新釐清。',['補上測試與正式覆核，投入維護成本','縮小使用範圍，優先做好核心服務','和夥伴分擔查證及交接工作']],
  ['客人想買的，是結果還是AI標籤？','一份小委託要比較總成本、錯誤率和服務體驗。這次熱度不會代替驗收。',['接受有清楚邊界的交付，承擔成本與負荷','建立長期服務方法，暫不追逐這筆收入','與夥伴合作接案，分享收益與責任']],
 ]),
 topic('trust','深偽與數碼信任','🔎',['software','ai','finance','media','public','commerce','forensics','service','education'],4,'阿真・核驗夥伴',{title:'2026施政報告：AI應用與風險管理',date:'2026-09-16',url:'https://www.info.gov.hk/gia/general/202609/16/P2026091600264.htm'},['團隊開始討論合成影像及聲音','機構建立身分與文件核驗流程','急件增多，真假資訊的判斷也需要時間','核驗工具良莠不齊，單一工具不能保證真實','可靠聯絡渠道與正式流程成為日常'],[
  ['視像中的主管，要求立即改收款帳戶','畫面和聲音很熟悉，付款資料卻與原有紀錄不同。對方催促你保密處理。',['暫停變更，經獨立可靠渠道核實','按正式雙人覆核及付款流程處理','先保留原安排，請合適團隊接手']],
  ['客戶送來一份看似完美的證明','文件內容與其他資料對不上。單一偵測工具沒有給出肯定答案。',['核對來源及授權，保留證據與限制','只提供證據足夠部分的有限結論','與有權限的鑑證／核驗夥伴協作']],
  ['信任，是一種能交付的服務','機構希望整理核驗與教育材料，讓同事遇到急件時有可用的程序。',['在授權範圍接受流程整理委託','把經驗留作團隊常規，暫不接新案','與夥伴合辦教育分享，分擔收益']],
 ]),
 topic('compute','算力、資料中心與節能','⚡',['software','hardware','trades','architecture','ai','science','newventures'],0,'羅工・設備協作者',{title:'IMF：AI發展、投資風險與電力需求',date:'2026-10-15',url:'https://www.imf.org/en/blogs/articles/2026/10/15/the-world-cant-afford-to-get-ai-wrong'},['算力計畫帶來設備及基建討論','系統、維護和冷卻需求增加','容量、電費與人手互相擠壓','部分計畫調整，效率與現金流受考驗','維護、能耗與可靠性成為持續工作'],[
  ['高薪輪班邀請，鬧鐘也要跟著換','資料中心相關工作增加，合作方想找能處理設備、系統或交接的人。',['投入節能與維護專精，準備技術路線','維持原有工時，先累積可靠交接能力','與具資格夥伴組隊，分擔輪班負荷']],
  ['算力滿載，電費和溫度一起上升','團隊想擴大負載，但設備條件、冷卻和維護窗口都有限。',['在授權範圍分析負載與能耗，補做驗證','限制未確認負載，維持可靠運作','協調系統與合資格設備團隊共同覆核']],
  ['客戶問：速度、成本和可靠性怎樣取捨？','一個小型改善案需要可量度的驗收，不能只展示最高峰值。',['承接已具資格及授權的改善工作','整理維護標準，保留正常作息','與合資格夥伴合作，分享有限委託']],
 ]),
 topic('assets','數碼支付與資產合規','🏦',['finance','commerce','software','ai','public','forensics','newventures'],3,'何小姐・合規夥伴',{title:'金管局：提防冒稱與持牌穩定幣發行人有關的代幣',date:'2026-04-28',url:'https://www.hkma.gov.hk/eng/news-and-media/scam-alert/2026/04/20260428-5/'},['新支付產品引起關注','機構需要產品、風險及合規協作','宣傳增多，冒牌平台也混進資訊中','提款、費用與真正使用價值受到檢視','核實資格、權利和風險成為常規'],[
  ['「官方合作」的支付邀請','陌生平台說與持牌機構合作，希望你替它介紹客戶或處理資料。',['核對官方登記、實際產品與授權範圍','先研究產品權利與風險，不引介資金','請合資格合規夥伴一起覆核']],
  ['提款條款藏在宣傳之外','示範很順利，但贖回、費用與資料處理規則仍有缺口。',['整理條款及失敗情境，補上風險測試','暫停未確認部分，保留現有付款方式','與產品及合規團隊共同釐清限制']],
  ['合規教育，不是獲利保證','機構希望製作清楚的教育資料，分開技術功能、牌照範圍與投資風險。',['在資格與授權範圍承接資料工作','保留研究成果，暫不參與新產品','與合資格團隊共同交付教育材料']],
 ]),
 topic('ip','IP、收藏與直播消費','🎨',['visual','media','performance','commerce','finance','food','service','experience','newventures'],9,'小葵・授權夥伴',{title:'McKinsey：2026消費、健康與體驗趨勢',date:'2026-06-22',url:'https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights/state-of-consumer'},['小眾角色與收藏社群開始聚集','授權、內容與商品需求增加','限量、直播和跟風囤貨把價格推向擁擠區','庫存與成交量暴露熱度和現金的差別','穩定受眾、正品與清楚授權留下來'],[
  ['角色紅了，合作邀約也來了','有人想把你的作品或專業內容變成商品、直播或聯名。權利與成本尚未談清楚。',['先做小量試作與授權核對','保留創作節奏，不急著擴大產量','與製作及營運夥伴合作分攤成本']],
  ['限量預購遇上庫存和仿品','詢問很多，實際付款卻沒想像中快，市場還出現相似商品。',['核對權利、真偽及實際成交，調整數量','縮小供應，保留現金緩衝','與可靠通路合作，明確處理售後責任']],
  ['熱度退去，誰還願意回來？','一位合作方想做下一輪小案。可持續的價值和交付，比一時排隊更重要。',['接受有上限的聯名／鑑定資料委託','維持小量創作與收藏預算，不接加單','與夥伴共享渠道及收益']],
 ]),
 topic('events','演唱會與盛事體驗','🎤',['performance','media','commerce','service','food','transport','visual','sport','public'],9,'阿笙・活動統籌',{title:'香港政府：大型文化及體育設施供應',date:'2026-01-21',url:'https://www.info.gov.hk/gia/general/202601/21/P2026012100250.htm'},['活動計畫開始招募合作方','場地、旅宿及餐飲需求增加','尖峰檔期擠壓人手、交通及供應','檔期結束，取消與結帳責任需要處理','可靠製作與在地體驗成為長期服務'],[
  ['同一場盛事，不同職業的忙季','活動方希望你支援製作、供應或接待，時間與資源都需要確認。',['先核對容量、合約及備用方案','維持原有服務量，只接核心範圍','與跨職業夥伴共同安排分工']],
  ['人手、預訂與天氣同時變動','臨時改動影響活動、餐飲或接待，對方希望維持原來所有承諾。',['核對安全與可交付範圍，調整計畫','暫停未確認加項，保留退款及替代選項','與場地、供應及服務團隊共同協調']],
  ['活動結束，還有售後和下一場','主辦想再次合作，但你也要照顧團隊疲勞、成本與結帳。',['承接容量清楚的小型後續委託','保留恢復時間，整理本次經驗','與可靠夥伴分享下一次的工作']],
 ]),
 topic('silver','銀髮、健康與照顧','🌿',['health','support','education','architecture','visual','public','service','sport','finance','funeral'],5,'淑儀・社區協作者',{title:'香港政府：銀髮經濟高峰會發言',date:'2026-10-14',url:'https://www.info.gov.hk/gia/general/202610/14/P2026101400271p.htm'},['社區開始整理適老與照顧需要','產品、服務及照顧協作需求增加','服務增加，也需要品質與人手保障','部分方案調整，真正需要與支付能力受到檢視','可及設計、本人意願與持續陪伴成為日常'],[
  ['升職機會，遇上家人的照顧需要','你收到新的工作或社區邀請，同時需要安排重要的人的日常支援。',['投入適老／照顧協作學習，重整安排','保留陪伴時間，不增加承諾','與親友及合適專業共同分工']],
  ['方便，不一定等於本人想要','一個適老服務或產品看來很好，但使用者的意願與設計假設不同。',['邀本人參與，覆核可及性與限制','縮小安排，先處理明確需要','協調使用者、家人及合資格團隊']],
  ['退休之後，還可以分享甚麼？','社區希望你把專長變成教育、陪伴或活動，報酬與負荷都需說清楚。',['在授權範圍接受有限服務／教育委託','把時間留給家人與自己的興趣','和社區夥伴共同分享經驗']],
 ]),
 topic('pets','寵物與友善服務','🐾',['animals','food','service','funeral','visual','media','commerce','experience','architecture'],4,'阿牧・照護夥伴',{title:'香港管理專業協會：寵物經濟跨業交流',date:'2026-06-16',url:'https://www2.hkma.org.hk/general/pr-20260616b/?lang=en'},['寵物家庭開始尋找更多服務','照護、空間及跨業合作增加','熱門活動也帶來壓力、清潔與容量問題','服務品質及動物福祉受到檢視','個體需要、授權及可靠照護留下來'],[
  ['客人帶著毛孩，也帶著期待','有人想合作做寵物友善服務，場地條件、動物福祉與其他使用者需要都需考慮。',['核對許可與服務界線，先做小試行','保留現有服務，先了解個體需要','與獸醫／照護及場地夥伴協作']],
  ['活動很熱鬧，動物卻想離開','需求增加，但有動物出現壓力或不明不適，客人希望繼續原訂行程。',['停止有疑慮活動，安排適當專業評估','縮短服務，提供較低壓力替代安排','協調照護者、場地及合適專業']],
  ['一次活動，變成長期照護？','合作方想延續服務。你需要確認人手、清潔、個體紀錄及責任。',['接受職務及授權內的小型服務案','維持適當容量，保留照護時間','與合適夥伴共同承接及交接']],
 ]),
 topic('climate','極端天氣與生活成本','☀️',sectors,0,'阿禾・韌性夥伴',{title:'香港政府：加強工作暑熱警告系統',date:'2026-08-27',url:'https://www.news.gov.hk/eng/2026/08/20260827/20260827_140212_977.html?type=ticker',extra:{title:'IMF：2026年10月世界經濟展望',date:'2026-10-13',url:'https://www.imf.org/en/Publications/WEO/Issues/2026/10/13/world-economic-outlook-october-2026'}},['工作環境與供應風險開始被注意','團隊尋找排班、節能與供應調整','酷熱或成本壓力令容量與預算吃緊','支出需要重估，部分安排逐步恢復','預警、備案及現金緩衝成為日常'],[
  ['一張新的預警，改變一整天','天氣或供應條件改變，原定工作與家庭安排可能需要調整。',['投入風險盤點、現金緩衝與備案','縮小本月承諾，先照顧休息與必要支出','與團隊及家人共同協調替代安排']],
  ['價格上升，最便宜的方案反而更脆弱','一個供應來源不穩，團隊又面對工時與工作環境限制。',['核對總成本，建立合適的替代供應','減少非必要項目，守住必要服務','協調供應與合資格安全團隊']],
  ['復原需求，也需要可持續的負荷','有人希望你協助小型修復、節能或資料整理；不是所有緊急要求都能承接。',['依資格與安全範圍承接有限工作','先維持自身與家庭預算，不接加項','與具資格夥伴共享工作與責任']],
 ]),
];
export const eraTopic=id=>ERA_TOPICS.find(t=>t.id===id)??null;
const spec=(id,theme,name,skill,categories)=>({id,theme,name,skill,categories,fee:1200,lessonFee:350});
export const ERA_SPECIALTIES=[
 spec('small-business-ai','ai','小店AI營運','tech',['food','commerce','service','newventures','software','ai']),
 spec('ai-assurance','ai','AI驗收與人工覆核','analysis',['software','ai','health','education','finance','science','public']),
 spec('identity-verification','trust','數碼身分與資訊核驗','analysis',['software','forensics','finance','public','media','commerce','ai']),
 spec('efficient-datacenter','compute','資料中心節能協作','craft',['trades','hardware','architecture','software','ai']),
 spec('compute-operations','compute','算力與可靠性營運','tech',['software','hardware','ai','science']),
 spec('digital-compliance','assets','數碼支付與合規協作','analysis',['finance','commerce','software','ai','public']),
 spec('ip-licensing','ip','IP授權營運','art',['visual','media','performance','commerce','newventures']),
 spec('collectible-research','ip','收藏品與通路核實','analysis',['commerce','finance','experience','service']),
 spec('event-production','events','盛事製作與接待統籌','people',['performance','media','commerce','service','food','transport','sport']),
 spec('age-friendly-design','silver','適老設計與照顧協作','care',['health','support','architecture','visual','public','education','sport']),
 spec('pet-friendly-services','pets','寵物友善服務協作','care',['animals','food','service','funeral','experience','architecture']),
 spec('climate-resilience','climate','工作與供應韌性規劃','analysis',['nature','architecture','trades','transport','food','hardware','public']),
];
export const eraSpecialty=id=>ERA_SPECIALTIES.find(t=>t.id===id)??null;
export const ERA_ROUTE_NAMES=['投入新能力','深化原有專業','跨職業協作'];
