// Occupational micro-interactions: no timer, resource charge or repeatable stat gift.
const activities={
 '咖啡師':[
 ['尖峰前的三張訂單','把工作卡按處理次序點選。',['先確認飲品、過敏原與替代需要','核對配方、器材與原料','製作後核對訂單再交付'],'客人說「跟上次一樣」，但今天改喝燕麥奶；先確認，少做一杯重來。'],
 ['新豆的試沖紀錄','找出應先處理的問題。',['新豆仍沿用舊參數，沒有試沖與紀錄','杯身圖案不夠可愛','音樂歌單還沒更新'],'客人想要「完全不苦、但很濃」：請他描述喜好，再說明可調整的範圍。']],
 '水電工':[
 ['現勘工作卡','這是流程練習，按順序安排；實際工序須由合資格人員督導。',['確認委託範圍、風險及所需資格','由合資格團隊依程序確認現場與證據','核對分項報價、變更同意及驗收安排'],'客人問能否「順手再做五件小事」；何師傅拿出清單：小事也需要範圍。'],
 ['報價單找漏項','點出最需要先釐清的一項。',['新增項目沒有授權、費用及工期確認','表格的線條太直','封面沒有放師傅的帥照'],'何師傅說：「我可以修水喉，不能修無限追加的預算。」']],
 'AI代理工程師':[
 ['沙盒試點工作卡','按次序安排試點，不會呼叫真實AI或上傳資料。',['確認需求、資料與工具權限','測試失敗、越權、成本及人工接手','覆核結果與回退方案後才試行'],'老闆說「只要加一點AI」；營運同事默默搬來三箱例外個案。'],
 ['測試報告找問題','點出上線前必須處理的問題。',['成功率只測理想輸入，沒有失敗與權限測試','代理的名字不夠有氣勢','簡報沒有使用漸層背景'],'代理自信地回答了不存在的公司規則；你決定先查來源，再談語氣。']],
};
export const MENTOR_STYLES=[{name:'嚴謹派',line:'先別急著答對，告訴我你的依據。'},{name:'嘴硬心軟派',line:'問清楚很好，少猜一次就少返工一次。'},{name:'示範派',line:'先看我怎樣拆問題，下一次換你帶著做。'}];
export function playMaterial(g,t){
 const attempt=g.s.pending.vocation.attempt,items=activities[g.job.name],row=items?.[attempt%items.length]??(attempt%2===0?['交付工作卡','按次序安排本次工作。',['先核對需求、同意及職務界線','在合適督導下比對資料與處理','留下覆核、限制及後續交接'],['health','funeral','forensics','support'].includes(g.job.category)?'交接表印了兩個「最新版」；同事請你先核對正式版本。':'客人說「很簡單」，同事笑著翻開了需求清單。']:['找出交接的缺口','點選最需要先處理的一項。',['交付尚未核實依據、授權及後續責任','封面沒有加上可愛貼紙','檔案名稱不夠有氣勢'],'同事送來一張寫著「只改一點點」的紙，背面還有一整頁。']);
 const mode=attempt%2===0?'order':'spot',rotation=(attempt+1)%3,order=[0,1,2].slice(rotation).concat([0,1,2].slice(0,rotation));
 return {title:row[0],instruction:row[1],cards:row[2],humour:row[3],mode,order,mentor:MENTOR_STYLES[Array.from(g.job.id).reduce((n,c)=>n+c.charCodeAt(0),0)%3],questions:[['need','你真正需要解決甚麼？',`先回到這次任務：${t.row[1]} ${t.row[2]}`],['scope','有哪些不能越過的界線？',`${t.course.skills.join('、')}。涉及資格、同意及授權的要求，不能用速度交換。`],['time','期限或預算可以怎樣商量？',`${t.pressure.detail} 可提出分批、縮小範圍或轉介，先確認對方接受的交付。`]]};
}
export function validPlay(p){return p&&p.version===1&&Array.isArray(p.picks)&&p.picks.length<=3&&p.picks.every(n=>Number.isInteger(n)&&n>=0&&n<3)&&new Set(p.picks).size===p.picks.length&&Array.isArray(p.questions)&&p.questions.length<=3&&p.questions.every(k=>['need','scope','time'].includes(k))&&new Set(p.questions).size===p.questions.length;}
export function playResult(g,t){const p=g.s.pending.vocation.play;if(!p)return null;const x=playMaterial(g,t),done=x.mode==='order'?p.picks.length===3:p.picks.length===1,correct=done&&(x.mode==='order'?p.picks.every((n,i)=>n===i):p.picks[0]===0);return {done,correct,asked:p.questions.length};}
