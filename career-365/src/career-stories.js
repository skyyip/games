import {expandedStoryProfile,expandedStation} from './expanded-stories.js';
// Versioned story content. Existing pending tasks keep their original flow.
import {WEEKLY_CASES} from './career-playbook.js';
const chapter=(title,text,plans)=>({title,text,plans});
export const CAREER_STORIES={
 '前端工程師':{mentor:'嘴硬心軟的阿晴',partner:'總忘記測鍵盤的小波',client:'把「小改」寫成三頁的陳小姐',specs:['互動與效能工具','需求與團隊協作'],chapters:[
 chapter('只加一個小表單','陳小姐說：「真的很小，今天就能上吧？」阿晴翻開表單：滑鼠能用，鍵盤找不到送出，錯誤也只有一片紅色。',['先補標籤、錯誤文字與鍵盤操作，再驗收主要流程','和客戶協商只上必要欄位，請小波一起測鍵盤','先保留舊表單，明列新表單的待修項目與日期']),
 chapter('需求偷偷長出第二頁','昨天談好三個欄位，今天多了會員、優惠碼和上傳。小波小聲問：「這也算一個表單？」客戶卻還期待原定日期。',['列出新增依賴及驗收範圍，分階段修正與交付','邀客戶一起排必要項，讓小波負責可驗證的部分','先交已驗證欄位，關閉未完成上傳並提供替代入口']),
 chapter('低速手機的沉默','演示機一秒打開，客戶手機卻一直等待；阿晴問：「你做的是網站，還是網絡耐心測驗？」圖片與等待狀態都要檢查。',['先量測首屏與錯誤流程，修正最影響完成率的部分','和設計同事協商暫緩動畫，先驗收低速主要流程','保留輕量版本，清楚標明尚未開放的功能']),
 chapter('回訪客戶的真心話','陳小姐帶著真實使用回饋回來。小波這次主動拿出鍵盤：「今天我先測！」你要交代改善、限制，以及下一個小目標。',['以實際任務完成紀錄驗收，留下可交接測試','邀客戶和小波共同回看，訂下一次可驗收改善','交付穩定核心流程，其餘列明時程與替代安排'])]},
 '後端工程師':{mentor:'說話很短、紀錄很長的老何',partner:'熱心但愛連按重試的阿米',client:'每天問一次能否自動出貨的營運姐',specs:['資料與可靠性工具','服務與團隊協作'],chapters:[
 chapter('三次通知，一次出貨','營運姐看著三張出貨單：「客人只買了一次。」付款服務會重送通知，阿米的程式卻每次都建立新任務。',['用事件識別、交易及持久化去重重建流程','先協調人工核對重複事件，與阿米補測重試','暫停自動出貨，保留已確認訂單的人工交接']),
 chapter('重試不是多按幾次','阿米說：「昨天學懂不重複了，今天只是逾時。」但外部服務可能已成功，你要處理狀態未知的訂單。',['先查事件狀態，再按冪等流程安全重試','和營運確認待查訂單，建立人工接手及更新時間','先隔離不確定訂單，完成已確認部分並通知客戶']),
 chapter('高峰來了，查詢也排隊','促銷開始，列表查一次、每筆再查一次。老何看著連線數說：「這不是團隊合作，是一百個查詢同時問路。」',['追蹤查詢並批次讀取，驗證分頁及權限','和營運協商流量與更新頻率，逐段驗收','先限制每頁數量，保留核心查詢並說明限制']),
 chapter('交接給明天的自己','營運姐說重複出貨停止了，阿米也寫下第一份失敗測試。你要交付的不只是「今天沒有報錯」。',['驗收重複、逾時及權限案例，留下追蹤與回退','帶阿米演練事件處理，與營運確認接手責任','先交付已驗證的交易範圍，保留未完成清單'])]},
 '全端工程師':{mentor:'總問兩邊有沒有談好的阿棠',partner:'前後端都想幫忙的小葉',client:'只看畫面卻很在意帳單的店長',specs:['契約與整合工具','跨團隊交付協作'],chapters:[
 chapter('一杯咖啡，兩種金額','前端送199代表元，後端卻收成199分。店長問：「畫面收的是咖啡錢，帳單怎麼像糖包錢？」',['統一金額單位與可信任來源，測完整付款流程','先停用錯誤付款，與兩端共同核對既有訂單','回退不相容版本，以明確轉換層逐步恢復']),
 chapter('舊頁面還沒有下班','新版刪了欄位，顧客手機仍留著舊頁。小葉說「重新整理就好」，阿棠問：「每位客人都會照做嗎？」',['先增加相容格式，再量測舊端使用並遷移','和兩端排定分階段交付，明示移除條件','先回退破壞性變更，保留舊端可用流程']),
 chapter('管理員的綠燈','演示帳戶全部成功，一般使用者卻不能上傳。店長說：「我的客人應該不用先升職當管理員吧？」',['以一般角色驗證前後端授權與失敗追蹤','邀小葉和客服一起測真實角色與補交流程','暫時關閉有問題上傳，保留下載與替代提交']),
 chapter('把兩邊接成一件事','店長不再問「前端好了嗎」，而是問「顧客能完成嗎」。小葉帶來整合紀錄，這次換你決定如何正式交接。',['沿資料流驗收金額、角色與失敗狀態，再交付','和各方演練客服接手與回退，清楚分配責任','交付穩定整合範圍，為未完成部分訂明安排'])]},
 '星級主廚':{mentor:'嘴上嫌慢、手上留位的周師傅',partner:'很熱心但常少寫一行的小圓',client:'總說「大家都一樣」的宴會客人',specs:['出餐與備料工具','團隊與客人協作'],chapters:[
 chapter('午市突然多六位','原訂12份，新加6份尚未確認過敏原。客人說「隨便都行」，周師傅說：「隨便不是食材標籤。」你要先安排批次。',['先完成已核實原訂餐點，新增部分確認後另批','和客人協商分批出餐，小圓負責核實新增需求','縮小本次交付範圍，明列暫不能供應的餐點']),
 chapter('加單和小圓的便條','原訂8份，又來4份待確認需求；小圓便條寫著「跟上次一樣」。周師傅把筆遞過來：「上次是誰的上次？」',['分清原訂與新增批次，核對需求後才備料','讓小圓重問客人，協商等待時間及可供選項','先交已核實批次，為其餘提供透明替代安排']),
 chapter('漂亮菜單與真實產能','原訂10份，新加5份未核實需求；照片拍得很好看，但廚房不會因為濾鏡多出一雙手。',['按已確認需求分批，保留待核實份量與紀錄','和前場協商接單上限，讓同事分工核對','先供應穩定菜單，暫停未能確認的追加部分']),
 chapter('熟客回來不是考試','原訂6份，又加3份待確認。小圓這次把需求寫得很完整，熟客說「上次處理得很安心」。師傅退後一步，讓你帶著團隊做。',['核實新需求並完成批次驗收，留下備料與交接','帶小圓一起確認客人期待與可交付範圍','交付已確認餐點，清楚說明其餘的供應安排'])]},
};
const frontendBoards=[
 [['Email有可見標籤','送出按鈕只有無說明圖示','錯誤只有紅色外框'],[1,2]],
 [['上傳失敗沒有文字提示','優惠碼有錯誤文字','必填狀態只用顏色表示'],[0,2]],
 [['等待時不保留輸入','錯誤有文字與欄位關聯','網絡失敗沒有重試入口'],[0,2]],
 [['送出結果有狀態文字','關閉彈窗後焦點消失','錯誤訊息沒有對應欄位'],[1,2]],
];
const backendBoards=[
 [['記錄已處理結果','核對事件ID及持久化去重','在交易內建立一次出貨'],[1,2,0]],
 [['以同一冪等識別安全重試','查詢原請求的最終狀態','記錄確認結果與後續'],[1,0,2]],
 [['觀察結果及回退門檻','量測查詢追蹤與計畫','批次讀取並測權限及分頁'],[1,2,0]],
 [['留下追蹤與交接','演練重複及逾時案例','覆核業務結果與權限'],[1,2,0]],
];
export const storyProfile=job=>CAREER_STORIES[job?.name]??expandedStoryProfile(job);
export const storyVersionFor=job=>CAREER_STORIES[job?.name]?1:expandedStoryProfile(job)?2:null;
export const hasStory=m=>m?.storyVersion===1||m?.storyVersion===2;
export function validNarrative(r){const n=r.narrative;return n===undefined||!!n&&n.version===1&&Number.isInteger(n.step)&&n.step>=0&&n.step<=4000&&[null,'craft','people'].includes(n.spec)&&Number.isInteger(n.favor)&&n.favor>=0&&n.favor<=3&&Number.isInteger(n.week)&&n.week>=-1&&n.week<=10000&&Array.isArray(n.trace)&&n.trace.length<=12&&n.trace.every(x=>x&&Number.isInteger(x.step)&&x.step>=0&&x.step<=4000&&['check','talk','rush'].includes(x.approach)&&typeof x.passed==='boolean');}
export function narrativeRecord(r){return r.narrative??=({version:1,step:0,spec:null,favor:0,week:-1,trace:[]});}
export const currentStoryWeek=()=>Math.floor((Date.now()+9*3600000+3*86400000)/604800000);
export function storyChapter(g,m){const profile=storyProfile(g.job);if(!profile||!hasStory(m))return null;const r=g.s.life.vocation.jobs[g.s.career],n=r.narrative,index=n.step%4,node=profile.chapters[index],last=n.trace.at(-1);return {...node,profile,index,step:n.step,cycle:Math.floor(n.step/4)+1,weekly:m.weekly!==undefined,previous:last?last.approach==='talk'?`${profile.partner}記得你上次一起商量，這次願意先幫你整理一部分。`:last.approach==='rush'?`${profile.client}記得上次的有限交付，今天先問尚未完成的部分。`:last.passed?`${profile.mentor}拿出上次留下的紀錄，讓你先獨立試。`:`${profile.partner}沒有把錯誤藏起來，今天帶著你留下的待辦一起補。`:'先和師傅看一遍現場，再自己動手。',humour:profile.humour?.[index]??[`${profile.mentor}：「『小改』的長度，通常和訊息的頁數成反比。」`,`${profile.partner}：「我準備好幫忙了，這次也帶了筆記！」`,`${profile.client}：「趕時間，也請告訴我哪些事情不能省。」`,`${profile.mentor}：「今天換你說明，我在旁邊。」`][index]};}
export function weeklyRow(g,week){const w=WEEKLY_CASES[week%WEEKLY_CASES.length],profile=storyProfile(g.job);return [`本週特別委託：${w[0]}`,`${profile?.client??'合作客戶'}帶來一件額外委託：${w[1]}`,w[3],...w[2]];}
export function storyStation(g,m=g.s.pending?.vocation){const chapter=storyChapter(g,m);if(!chapter)return null;const index=chapter.index,job=g.job.name;if(m.storyVersion===2)return expandedStation(g.job,index);if(job==='前端工程師'){const [labels,solution]=frontendBoards[index];return {type:'inspect',title:'找出兩個會阻礙完成任務的介面問題',labels,solution,hint:'從操作、錯誤文字與狀態回饋判斷；正常項目不用選。'};}if(job==='後端工程師'){const [labels,solution]=backendBoards[index];return {type:'order',title:'把三張處理卡排成可驗證的工作次序',labels,solution,hint:'先核實與量測，再執行變更，最後留下結果與交接。'};}if(job==='全端工程師'){const boards=[
 [['付款金額 amountMinor','送出者 role','建立時間 createdAt'],['以最小貨幣單位表示的整數','帶時區的時間字串','經伺服器驗證的授權角色'],[0,2,1],'199分與199元不同；畫面顯示的角色不能直接當成伺服器授權。'],
 [['舊端 name 欄位','新端 displayName 欄位','移除舊格式的條件'],['觀察舊端使用並完成遷移驗證','過渡期保留原欄位供舊端讀取','新增欄位並明確映射姓名語意'],[1,2,0],'先擴展相容格式，再依使用量與驗證逐步收斂。'],
 [['一般使用者上傳','管理員上傳','跨層錯誤追蹤'],['前端錯誤與後端請求對應追蹤編號','管理角色也要另測授權與失敗','依一般角色權限驗證，不借用管理員身分'],[2,1,0],'不同角色要各自驗證；錯誤紀錄需要跨前後端串連。'],
 [['訂單金額驗收','付款回報驗收','資料回退驗收'],['獨立驗證備份還原與遷移方案','單位明確，依伺服器規則核算','同一事件重送不重複建立業務效果'],[1,2,0],'一次完整驗收同時追蹤金額、事件重試及資料復原，不能只看畫面。']];const [labels,options,solution,hint]=boards[index];return {type:'match',title:'讓前後端說同一種資料語言',labels,options,solution,hint};}const original=[12,8,10,6][index],extra=[6,4,5,3][index];return {type:'allocate',title:'安排已核實與待確認的出餐批次',labels:['原訂、已核實批次','新增、尚未核實批次','暫留待確認份量'],total:original+extra,max:original+extra,solution:[original,0,extra],hint:`原訂${original}份已核實；新增${extra}份仍需確認需求，不可先承諾出餐。`};}
export function validStation(p){return p===undefined||!!p&&Array.isArray(p.picks)&&p.picks.length<=3&&new Set(p.picks).size===p.picks.length&&p.picks.every(n=>Number.isInteger(n)&&n>=0&&n<=2)&&Array.isArray(p.values)&&p.values.length===3&&p.values.every(n=>n===null||Number.isInteger(n)&&n>=0&&n<=100)&&typeof p.tool==='boolean'&&typeof p.assist==='boolean';}
export function stationResult(g){const x=storyStation(g),p=g.s.pending?.vocation?.station;if(!x||!p)return {done:false,correct:false};const done=['inspect','order'].includes(x.type)?p.picks.length===(x.type==='inspect'?2:3):p.values.every(n=>n!==null),correct=done&&(x.type==='inspect'?x.solution.every(n=>p.picks.includes(n)):x.type==='order'?x.solution.every((n,i)=>p.picks[i]===n):x.solution.every((n,i)=>p.values[i]===n));return {done,correct};}
export function completeNarrative(g,m,choice,passed){const r=g.s.life.vocation.jobs[g.s.career],n=narrativeRecord(r),profile=storyProfile(g.job);if(m.weekly!==undefined)n.week=m.weekly;if(!hasStory(m))return '';const chapter=storyChapter(g,m),used=m.station?.assist;n.favor=Math.max(0,Math.min(3,n.favor+(choice.approach==='talk'?1:0)-(used?1:0)));if(m.kind==='drill')return `${profile.mentor}和你整理補練結果，主線仍停在原處，等你準備好再繼續。`;if(m.weekly!==undefined)return `${profile.client}收下本週委託：${passed?'這次交付完成，主線故事仍在原處等你。':'先保留待辦，之後可繼續主線並安排補救。'}`;n.trace.push({step:n.step,approach:choice.approach,passed});n.trace=n.trace.slice(-12);n.step++;const line=passed?`${profile.partner}收下交接，${choice.approach==='talk'?'下次願意先幫你一把。':choice.approach==='rush'?'記下尚未交付的部分，之後會再追蹤。':`${profile.mentor}說：「這次可以放心多交一點給你。」`}`:`${profile.mentor}說：「這次先補救，故事還沒有結束。」${profile.partner}留下返工清單，下次接著處理。`;if(n.step%4===0){r.playbook??={learned:[],equipped:[],cases:[],works:[]};const title=`${g.job.name}・${chapter.cycle}季職場故事`,detail=`${profile.client}的回訪：${n.trace.slice(-4).map(x=>({check:'覆核',talk:'協商',rush:'有限交付'})[x.approach]).join(' → ')}。${line}`;r.playbook.works.push({title,detail,month:g.s.month});r.playbook.works=r.playbook.works.slice(-12);g.record('work',title,detail);}return line;}
export const storyMethods={
 chooseCareerSpecialization(spec){const r=this.s.life.vocation.jobs[this.s.career];if(!this.active||!storyProfile(this.job)||!r||r.workDone<2||!['craft','people'].includes(spec))return false;narrativeRecord(r).spec=spec;return true;},
 interactStoryStation(kind,value){const m=this.s.pending?.vocation;if(!hasStory(m))return false;const x=storyStation(this),r=this.s.life.vocation.jobs[this.s.career],n=r.narrative,p=m.station??{picks:[],values:[null,null,null],tool:false,assist:false};if(kind==='pick'){if(!['inspect','order'].includes(x.type)||!Number.isInteger(value)||value<0||value>2)return false;const i=p.picks.indexOf(value);if(x.type==='inspect'&&i>=0)p.picks.splice(i,1);else{if(i>=0||p.picks.length>=3)return false;p.picks.push(value);}}else if(kind==='value'){if(!['match','allocate'].includes(x.type)||!Array.isArray(value)||value.length!==2||!Number.isInteger(value[0])||value[0]<0||value[0]>2||value[1]!==null&&(!Number.isInteger(value[1])||value[1]<0||value[1]>(x.type==='match'?2:x.max)))return false;p.values[value[0]]=value[1];}else if(kind==='retry'){p.picks=[];p.values=[null,null,null];}else if(kind==='tool'){if(n.spec!=='craft'||p.tool)return false;p.tool=true;}else if(kind==='assist'){if(n.spec!=='people'||n.favor<1||p.assist)return false;p.assist=true;if(['inspect','order'].includes(x.type))p.picks=[x.solution[0]];else p.values[0]=x.solution[0];}else return false;m.station=p;return true;},
};
storyMethods.advanceOrdinaryMonths=function(months=3){if(![3,12].includes(months)||!this.active||this.s.risks.delay||this.s.risks.captivity||this.s.healthData.illness)return false;if(this.s.status==='apprentice')return this.canSummarizeTraining()?this.summarizeTraining(months):false;if(!['employed','business'].includes(this.s.status))return false;let advanced=0;while(advanced<months&&this.active&&!this.s.risks.delay&&!this.s.risks.captivity&&!this.s.healthData.illness){const before=this.s.elapsed;this.plan(1,'routine');advanced+=this.s.elapsed-before;if(this.s.pending||this.s.elapsed===before)break;}if(advanced)this.record('work','普通月份，也在生活',`逐月完成${advanced}個月的例行生活；薪金、生活費、健康與市場照常結算，重要故事與考核仍停下讓你決定。`);return advanced;};
