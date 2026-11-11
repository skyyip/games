// Adult, non-graphic fictional events. Probabilities and money are game balancing,
// not medical, legal or crime statistics. No actual services or transactions.
const c=(label,effects,outcome)=>({label,effects,...(outcome?{outcome}:{})});
export const LIFE_EVENTS=[
 {id:'phone-scam',group:'scam',title:'「警方」電話要求轉帳',scene:'risk',text:'來電者聲稱你牽涉案件，要求保密並把錢轉到「安全帳戶」。來電顯示可以偽冒。',choices:[c('掛線，經自己查找的官方渠道核實',{jq:2,stress:2}),c('相信來電，轉出所要求的一筆款項（最多一個月參考薪酬的六成）',{scamPercent:60,stress:25,pq:-4,delay:1})]},
 {id:'online-scam',group:'scam',title:'限時優惠，先付訂金？',scene:'risk',text:'網店售價低得驚人，對方要求離開平台付款，卻沒有可核實的商戶資料。',choices:[c('留在有保障的平台核實賣家',{jq:2}),c('為了搶購，先付 $4,000',{cash:-4000,scamLoss:4000,stress:12})]},
 {id:'dating-scam',group:'scam',title:'螢幕另一端的急事',scene:'relationship',text:'交友App認識的人從未見面，卻突然要求借錢救急，並說只有你能幫忙。',choices:[c('暫停匯款，找可信的人一起核實',{jq:2,contacts:1,stress:3}),c('相信這段關係，匯出緊急款項（最多一個月參考薪酬的三成）',{scamPercent:30,stress:20,pq:-3,delay:1})]},
 {id:'investment-scam',group:'scam',title:'保證高回報的投資群組',scene:'market',text:'群組曬出獲利截圖，要求把資金轉到陌生平台，聲稱穩賺且不能錯過。',choices:[c('核對監管登記與提款條款，拒絕不明平台',{jq:3,iq:1}),c('跟單，投入建議本金（最多一個月參考薪酬的一半）',{scamPercent:50,stress:25,delay:2})]},
 {id:'kk-recruitment',group:'scam',title:'海外高薪招聘：KK園式陷阱',scene:'risk',text:'陌生仲介承諾海外高薪，卻不提供可核實合約，並要求交出證件。這可能是以招聘為名的人口販運。',choices:[c('停止接洽，向可信官方渠道求證',{jq:3,stress:3}),c('未核實就隨仲介出發',{cash:-8000,scamLoss:8000,health:-20,stress:35,captivity:6,delay:6})]},
 {id:'rescue',group:'recovery',title:'被困之後，尋求支援',scene:'comeback',text:'你遭招聘詐騙而被困，無法正常工作或轉職。這不是受害者的錯。安全優先，官方及家人支援會讓復原有下一步。',choices:[c('在安全情況下聯絡領事／警方及家人',{captivity:-6,delay:-3,health:8,stress:-8}),c('透過可信救援管道尋求安置與協助',{captivity:-6,delay:-2,cash:-2000,health:12,stress:-12})]},
 {id:'adult-nightlife',group:'temptation',title:'成人夜生活的邀約',scene:'risk',text:'成年朋友邀你參與涉及性交易的夜生活。你要考慮金錢、當地法律、健康、界線，以及對伴侶的承諾。',choices:[c('婉拒，選擇普通聚會',{cash:-200,eq:1,stress:-4}),c('接受邀請（可能有健康與法律後果）',{cash:-2500,stress:-4,affection:-12},{chance:.35,text:'後續出現健康問題及法律諮詢開支，你暫停工作處理。',effects:{health:-15,cash:-5000,legal:1,delay:1,stress:18}})]},
 {id:'gambling-temptation',group:'temptation',title:'輸了想追，贏了想加碼',scene:'risk',text:'朋友說只差一把便能回本。你可以離開，也可以拿出一筆生活費繼續下注。',choices:[c('守住預算，離開賭桌',{jq:2,pq:1,stress:2}),c('拿 $5,000 再博一次',{cash:-5000,dependence:8,stress:12},{chance:.2,text:'這次碰巧贏了，但想再來一次的衝動也更強。',effects:{cash:10000,dependence:8,stress:-8}})]},
 {id:'drug-temptation',group:'temptation',title:'「試一次沒事」的說法',scene:'risk',text:'聚會中有人遞來來歷不明的毒品，說可以放鬆或提神。你可以拒絕，也可以冒健康、依賴及法律風險。',choices:[c('拒絕並離開，找可信朋友陪伴',{pq:2,jq:1,stress:-3}),c('選擇嘗試（會有健康、依賴與進度代價）',{health:-15,pq:-8,dependence:30,legal:1,cash:-1500,delay:1,stress:12},{chance:.35,text:'你出現急性不適，急症治療與後續支援需要時間和金錢。',effects:{health:-20,cash:-8000,delay:2,dependence:10}})]},
 {id:'recovery-support',group:'recovery',title:'重新找回選擇的空間',scene:'medical',text:'依賴正侵蝕健康、開支與工作。你可以尋求醫療、輔導及可信親友的支持；復原需要時間。',choices:[c('接受醫療與輔導支援',{cash:-1500,dependence:-25,health:10,pq:4,delay:1,stress:-8}),c('先找可信親友陪同求助',{dependence:-12,contacts:1,pq:2,stress:-5})]},
 {id:'romance',group:'family',title:'遇見一個想多聊一點的人',scene:'relationship',text:'你們相處自在，對方也願意認識你。要把這份好感留在朋友，還是慢慢建立一段感情？',choices:[c('雙方同意，開始認真交往',{relationship:1,affection:25,cash:-500,stress:-8,eq:2}),c('保持朋友，尊重彼此的步調',{contacts:2,stress:-3})]},
 {id:'marriage',group:'family',title:'一起生活，要怎樣安排？',scene:'relationship',text:'你們談到婚姻、財務、家務與未來。承諾可以有不同形式，婚禮規模也不等於感情深度。',choices:[c('商量分工與預算，簡單結婚',{relationship:2,affection:10,cash:-20000,stress:-4}),c('辦一場盛大婚禮',{relationship:2,affection:8,cash:-150000,stress:12}),c('繼續交往，暫不結婚',{affection:2,eq:1})]},
 {id:'parenthood',group:'family',title:'職涯要不要多一個小主角？',scene:'relationship',text:'你們討論生育或領養、照顧分工及長期預算。成為父母會帶來連結，也會需要時間、精力和金錢；不育兒同樣是一種職涯。',choices:[c('準備迎接孩子（生育或領養）',{children:1,cash:-20000,affection:5,stress:10,energy:-15}),c('先不育兒，把生活過穩',{affection:2,stress:-3})]},
 {id:'affair',group:'family',title:'承諾之外的心動',scene:'relationship',text:'你對另一個成年人心動。你可以守住界線、誠實處理現有關係，或選擇隱瞞而承受信任破裂的風險。',choices:[c('說清界線，與伴侶好好溝通',{affection:4,eq:2,stress:5}),c('先結束原有關係，再開始下一段',{relationship:0,affection:-30,cash:-5000,stress:15}),c('隱瞞伴侶，維持婚外／感情出軌',{affection:-15,cash:-2000,stress:12},{chance:.65,text:'隱瞞被發現，信任破裂，雙方分開並處理搬遷與法律安排。',effects:{relationship:0,affection:-50,cash:-15000,stress:25,delay:1}})]},
 {id:'family-tension',group:'family',title:'家務與時間，誰來承擔？',scene:'relationship',text:'工作、照顧與生活擠在一起。伴侶希望你一起重新安排分工。',choices:[c('排出共同時間並分擔照顧',{affection:8,energy:-10,stress:-5,eq:1}),c('付費請人協助，保留相處時間',{cash:-1800,affection:5,stress:-8}),c('迴避對話，把時間留給工作',{affection:-15,stress:10})]},
];
LIFE_EVENTS.push({id:'community-opportunity',group:'opportunity',title:'社區想借用你的專長',scene:'relationship',text:'朋友正在籌備活動，希望有人分享經驗。你可以按自己的負荷參與，也可以轉介別人。',choices:[c('帶一場小工作坊',{energy:-12,contacts:2,reputation:3,pq:.3}),c('轉介合適朋友，保留自己的時間',{contacts:1,stress:-3}),c('提供簡短資料，讓大家先開始',{energy:-4,jq:.2})]},{id:'scholarship-opportunity',group:'opportunity',title:'一個短期學習機會',scene:'study',text:'舊同學分享了課程資訊，有名額與時間限制，但不需要立刻放棄工作。',choices:[c('參加工作坊，投入學費與精神',{cash:-600,energy:-12,mastery:4,jq:.3}),c('先向學員了解內容，保持聯絡',{contacts:1,eq:.2}),c('這期先不參加，留時間休息',{stress:-4})]});
export const EXTRA_EFFECTS=['affection','relationship','children','dependence','legal','delay','captivity','scamPercent','scamLoss'];
export function eventEligible(e,s){
 if(e.group==='temptation'&&e.id==='gambling-temptation'&&!s.metrics.gambles&&s.stats.stress<50)return false;
 if(e.id==='rescue')return s.risks.captivity>0;
 if(s.risks.captivity>0)return false;
 if(e.id==='recovery-support')return s.risks.dependence>=15;
 if(e.id==='romance')return s.family.status===0;
 if(e.id==='marriage')return s.family.status===1&&s.family.affection>=45;
 if(e.id==='parenthood')return s.family.children.length<4;
 if(['affair','family-tension'].includes(e.id))return s.family.status>0;
 return true;
}
