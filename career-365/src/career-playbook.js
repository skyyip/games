// Bounded, optional additions to each profession; old lives and pending tasks remain valid.
export const SPECIALTIES=[
 {id:'review',name:'細心覆核',detail:'深入覆核多2分，但額外多2精力。',approach:'check',score:2,energy:2},
 {id:'negotiate',name:'協商高手',detail:'協調做法多2分；覆核做法多1精力，溝通仍須核對。',approach:'talk',score:2,energy:0},
 {id:'scope',name:'範圍管理',detail:'有限交付多2分；深入覆核成本多$30。',approach:'rush',score:2,energy:0},
 {id:'workflow',name:'流程改善',detail:'有完成實作卡時多1分；協調多1精力。',score:1,energy:0},
 {id:'mentor',name:'帶教筆記',detail:'有請教師傅時多1分；有限交付多1精力。',score:1,energy:0},
 {id:'research',name:'交叉查證',detail:'有讀教材和線索時多1分；深入覆核成本多$20。',score:1,energy:0},
];
export const WEEKLY_CASES=[
 ['加單前先談清楚','客人希望加做一批工作，原交付時間不變。你已確認增加的範圍。',['說明新增工時與成本，協商分批交付','只完成原範圍，書面列出新增項目另行確認','安排額外人手，先取得授權並確認費用'],'三個方案都可以合理；關鍵是先確認需求、授權及代價，不能默默把加班當成免費。'],
 ['AI成本上升','工具價格調整，原預算不足，還有未驗證的輸出。',['縮小試點範圍，保留人工核實','比較其他工具，重新做代表性測試','提出新預算，列明成本上限與人工接手'],'工具變動先影響成本與驗證；換工具不代表可以跳過查證。'],
 ['旅遊旺季','預訂增加，但同事人手不足。',['限制接單量並清楚公布等候時間','先訓練支援人員，再逐步增加預約','協商合作轉介，先取得顧客同意'],'營收機會也有產能限制；透明安排比過度承諾更持續。'],
 ['資料版本衝突','兩份交接表日期不同，重要內容互相矛盾。',['暫停有疑問部分，找負責人確認正式版本','先處理已核實的部分並列出待確認事項','協調交付時間，補齊版本及變更紀錄'],'需要查清來源與授權，不能靠檔名或個人直覺斷定正確版本。'],
 ['供應中斷','原料延誤，替代品規格不同。',['核對規格與風險，取得替代同意','延後受影響的部分，更新期限','轉介有合適資源的團隊，說清責任'],'替代材料需要核實適用性；不能用價格相近推定品質或安全相同。'],
 ['同事需要幫忙','新人做錯一項紀錄，願意一起修正。',['共同核對事實，按程序更正並記錄','先處理有風險的部分，再安排覆盤','請督導協助，讓新人說明尚未掌握的步驟'],'支持同事與保留真實紀錄可以同時做到，避免羞辱或掩蓋錯誤。'],
];
export const PROJECT_TEMPLATES=[
 ['期間限定咖啡店','分工：主廚擬菜單、設計師整理過敏原資訊、神秘顧客測試流程。交付：提出一段方案、已核實依據及一個交接問題。可非同步回覆；認領後無法繼續可請負責人取消再分配。'],
 ['AI客服小試點','分工：營運整理需求、AI工程師驗證失敗案例、客服檢查人工接手。交付：一份有限範圍試點方案，說明權限、成本與回退。各人先留下成果供下一位參考。'],
 ['社區友善服務日','分工：服務人員說明流程、設計師檢查資訊、神秘顧客提出可及性問題。交付：一項改善方案與核實紀錄。隊友不在時可先以NPC同事意見草擬，標明未經真人覆核。'],
];
export function validPlaybook(p){return p===undefined||!!p&&!Array.isArray(p)&&Array.isArray(p.learned)&&p.learned.length<=6&&new Set(p.learned).size===p.learned.length&&p.learned.every(x=>SPECIALTIES.some(s=>s.id===x))&&Array.isArray(p.equipped)&&p.equipped.length<=3&&new Set(p.equipped).size===p.equipped.length&&p.equipped.every(x=>p.learned.includes(x))&&Array.isArray(p.cases)&&p.cases.length<=6&&p.cases.every(x=>x&&typeof x==='object')&&new Set(p.cases.map(x=>x.id)).size===p.cases.length&&p.cases.every(x=>Number.isInteger(x.id)&&x.id>=0&&x.id<6&&Number.isInteger(x.answer)&&x.answer>=0&&x.answer<3)&&Array.isArray(p.works)&&p.works.length<=12&&(p.projects===undefined||Array.isArray(p.projects)&&p.projects.length<=3&&p.projects.every(x=>x&&Number.isInteger(x.id)&&x.id>=0&&x.id<3&&Array.isArray(x.steps)&&x.steps.length<=3&&x.steps.every(a=>Number.isInteger(a)&&a>=0&&a<3))&&new Set(p.projects.map(x=>x.id)).size===p.projects.length)&&p.works.every(x=>x&&Number.isInteger(x.month)&&x.month>=216&&x.month<=780&&typeof x.title==='string'&&x.title.length<=150&&typeof x.detail==='string'&&x.detail.length<=800);}
export const book=r=>r.playbook??=({learned:[],equipped:[],cases:[],works:[]});
export function offers(r){const p=r?.playbook;return SPECIALTIES.filter(x=>!p?.learned.includes(x.id)).slice(0,3);}
export function specialtyEffects(r,m,approach,played){const equipped=r?.playbook?.equipped??[];let score=0,energy=0,cost=0;for(const id of equipped){const x=SPECIALTIES.find(x=>x.id===id);if(x.approach===approach){score+=x.score;energy+=x.energy;}if(id==='negotiate'&&approach==='check')energy++;if(id==='scope'&&approach==='check')cost+=30;if(id==='workflow'){if(played)score++;if(approach==='talk')energy++;}if(id==='mentor'){if(m.mentor)score++;if(approach==='rush')energy++;}if(id==='research'){if(m.ai&&m.clue)score++;if(approach==='check')cost+=20;}}return {score,energy,cost};}
const conditions=[['客人重視透明預算','先列明必要與可選費用，不能把未知費用藏在交付後。'],['新人加入團隊','交接需要把已知、未知及覆核人說清楚。'],['供應或工具條件改變','重新核對適用性與成本，不能假設舊做法仍然適用。'],['對方希望提前交付','可協商縮小範圍、分批或轉介；不省略專業底線。']];
export function episode(g){const r=g.s.life.vocation.jobs[g.s.career],n=r?.workDone??0,hash=[...g.job.id].reduce((s,c)=>s+c.charCodeAt(0),0),condition=conditions[(Math.floor(n/3)+hash+(g.s.profile.portrait??0))%conditions.length];return {part:n%3,title:condition[0],detail:condition[1],stage:['了解現場與需求','試行與處理分歧','覆盤與後續交接'][n%3],previous:r?.last?`上次${r.last.approach==='rush'?'縮小範圍，這次先追蹤尚未交付事項':r.last.passed?'留下的依據可以作為本次起點，仍須核對變更':'仍有缺口，這次先補核實與協商'}。`:'先建立一份可交接的需求與限制紀錄。'};}
export function finishEpisode(g,t,choice,passed){const r=g.s.life.vocation.jobs[g.s.career];if(r.workDone%3)return;const p=book(r),title=`${g.job.name}・第${Math.ceil(r.workDone/3)}篇代表作`,detail=`${passed?'完成本次交付':'保留待改善事項'}；${t.course.skills[t.skill]}。${choice.tradeoff} 下篇會延續合作信任與跟進紀錄。`;p.works.push({title,detail,month:g.s.month});p.works=p.works.slice(-12);g.record('work','三段職場故事・'+title,detail);}
export const playbookMethods={
 learnSpecialty(id){const r=this.s.life.vocation.jobs[this.s.career];if(!this.active||this.s.pending||!r||Math.min(6,r.workPassed)<= (r.playbook?.learned.length??0)||!offers(r).some(x=>x.id===id))return false;const p=book(r);p.learned.push(id);if(p.equipped.length<3)p.equipped.push(id);return true;},
 toggleSpecialty(id){const r=this.s.life.vocation.jobs[this.s.career];if(!this.active||this.s.pending||!r?.playbook?.learned.includes(id))return false;const p=book(r),i=p.equipped.indexOf(id);if(i>=0)p.equipped.splice(i,1);else{if(p.equipped.length>=3)return false;p.equipped.push(id);}return true;},
 practiceWeeklyCase(id,answer){const r=this.s.life.vocation.jobs[this.s.career];if(!this.active||this.s.pending||!r||!Number.isInteger(id)||!WEEKLY_CASES[id]||!Number.isInteger(answer)||answer<0||answer>2)return false;const p=book(r),old=p.cases.find(x=>x.id===id);if(old)old.answer=answer;else p.cases.push({id,answer});return true;},
};
export const PROJECT_ROLES=[['主廚擬菜單','設計師整理過敏原資訊','神秘顧客測試交付流程'],['營運同事界定需求','AI工程師測試權限與回退','客服同事核對人工接手'],['服務同事整理動線','設計師檢查資訊','體驗同事檢查使用障礙']];
export const PROJECT_RESPONSES=['先核對這一段的依據及限制，留下交接紀錄','先問清對方的需要，協商範圍及下一步','只交付已核實的部分，明列其餘待確認事項'];
playbookMethods.practiceProject=function(id,answer){const r=this.s.life.vocation.jobs[this.s.career];if(!this.active||!r||!Number.isInteger(id)||!PROJECT_TEMPLATES[id]||!Number.isInteger(answer)||answer<0||answer>2)return false;const p=book(r);p.projects??=[];let project=p.projects.find(x=>x.id===id);if(!project){project={id,steps:[]};p.projects.push(project);}if(project.steps.length===3)project.steps=[];project.steps.push(answer);return true;};
export function readCareerCollection(store,key){try{const list=JSON.parse(store.read(key)??'[]');return Array.isArray(list)?[...new Set(list.filter(id=>JOBS_IDS.has(id)))].slice(-40):[];}catch{return [];}}
// IDs alone are sufficient for cosmetic discoveries; no names, wealth or private story data.
import {JOBS} from './content.js';const JOBS_IDS=new Set(JOBS.map(j=>j.id));
export function archiveCareerCollection(g,store,key){try{const ids=Object.entries(g.s.life.vocation.jobs).filter(([,r])=>r.playbook?.works.length).map(([id])=>id),next=[...new Set([...readCareerCollection(store,key),...ids])].slice(-40);store.write(key,JSON.stringify(next));}catch{/* Collection is optional; saved lives remain authoritative. */}}

export function careerCollection(g,store,key){return [...new Set([...readCareerCollection(store,key),...Object.entries(g?.s.life.vocation.jobs??{}).filter(([,r])=>r.playbook?.works.length).map(([id])=>id)])].slice(-40);}
