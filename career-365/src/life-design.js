import {monthSnapshot} from './monthly-play.js';
// Explicit simulation assumptions. These are not individual salary, medical-risk or licensing statistics.
export const HOMES={family:{name:'與家人／親友同住',rent:1500,deposit:0},shared:{name:'合租房間',rent:5000,deposit:10000},studio:{name:'獨立小單位',rent:11000,deposit:22000}};
export const GOALS={craft:'精進專業',connection:'陪伴與連結',freedom:'財務與時間自由',discovery:'探索世界',service:'回饋社區'};
export const QUALIFICATION_SOURCES=[
 ['香港醫務委員會：註冊與專科資格','https://www.mchk.org.hk/english/registration/'],
 ['香港護士管理局：註冊要求','https://www.nchk.org.hk/en/registration_and_enrolment/'],
 ['強積金管理局：供款','https://www.mpfa.org.hk/en/mpf-system/mandatory-contributions'],
 ['香港稅務局：稅率與免稅額','https://www.ird.gov.hk/eng/tax/ind_st.htm'],
];
export function entryPath(job){
 const name=job?.name??'';
 if(name==='法醫'||/醫師$|醫生$/.test(name))return {months:72,practice:24,label:'認可專業課程、考核及受督導實習',regulated:true};
 if(/航空機師/.test(name))return {months:24,practice:18,label:'認可飛行訓練、牌照考試及受督導飛行經驗',regulated:true};
 if(/護理師|護士|藥師|藥劑師|物理治療師|職能治療師|語言治療師|呼吸治療師|醫事檢驗師|醫事放射師|心理師|臨床心理|會計師|律師|^建築師$|社工|教師/.test(name))return {months:48,practice:18,label:'認可課程、註冊考核及受督導實習',regulated:true};
 if(/老師|工程師|會計師|法證|鑑證|法醫.+/.test(name))return {months:24,practice:12,label:'相關課程、實務訓練及職務考核',regulated:false};
 if(/水電|電工|焊接|機械|維修|星級主廚/.test(name))return {months:12,practice:6,label:'學徒訓練、實作與安全考核',regulated:false};
 return {months:3,practice:3,label:'入職訓練、作品／服務實作及評核',regulated:false};
}
export function lifeDefaults(s,legacy=false){return {version:1,guideDismissed:false,extraEventMonth:-1,monthStart:monthSnapshot(s),flow:{income:0,expenses:0,regular:0,regularNet:0},home:'family',insurance:'public',pension:0,gross:0,selfIncome:0,mpf:0,tax:0,goal:'craft',goalProgress:{craft:0,connection:0,freedom:0,discovery:0,service:0},routine:{exercise:false,diet:false,sleep:false},schedule:'full',sideJob:null,sideEarned:0,study:{active:false,months:0,credits:0},entry:{career:s.career,months:0,practice:0,theory:0,assessed:false,nextAssessment:0,grandfathered:legacy},track:'specialist',careerMonths:0,overseasMonths:0,hobby:'art',hobbyProgress:0,careMonths:0,friendship:0,npc:{mentor:45,colleague:45,client:40},arcs:{},credentials:legacy&&s.career&&['employed','business'].includes(s.status)?{[s.career]:true}:{},cooldowns:{},queue:[],journal:[],lastWorld:-24,returnVisits:[],lastReturnDay:null,lastWeekly:null,challenge:null,dailyCases:{lastDay:null,completed:0}};}
export function initLife(g){g.s.life=lifeDefaults(g.s);}
export function restoreLife(s){
 if(s.life===undefined){s.life=lifeDefaults(s,true);return true;}const l=s.life;
 if(!l||l.version!==1||!Object.hasOwn(HOMES,l.home)||!['public','private'].includes(l.insurance)||!Object.hasOwn(GOALS,l.goal)||!['full','part','freelance'].includes(l.schedule)||!['specialist','manager'].includes(l.track)||!['art','nature','music','volunteer'].includes(l.hobby))return false;
 if(l.guideDismissed===undefined)l.guideDismissed=false;if(typeof l.guideDismissed!=='boolean')return false;
 l.selfIncome??=0;l.flow??={income:l.gross+l.selfIncome,expenses:l.mpf+l.tax,regular:l.gross+l.selfIncome,regularNet:Math.max(0,l.gross+l.selfIncome-l.mpf-l.tax)};l.flow.regularNet??=Math.max(0,l.flow.regular-l.mpf-l.tax);if(!l.flow||!['income','expenses','regular','regularNet'].every(k=>Number.isFinite(l.flow[k])&&l.flow[k]>=0&&l.flow[k]<=Number.MAX_SAFE_INTEGER))return false;const finite=(x,a=0,b=2e9)=>Number.isFinite(x)&&x>=a&&x<=b;
 if(l.socialRunId!==undefined&&(typeof l.socialRunId!=='string'||!/^[A-Za-z0-9_-]{16,64}$/.test(l.socialRunId)))return false;
 if(l.socialClaims!==undefined&&(!Array.isArray(l.socialClaims)||l.socialClaims.length>1600||new Set(l.socialClaims).size!==l.socialClaims.length||l.socialClaims.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(id))))return false;
 l.extraEventMonth??=s.pending&&s.pending.id!=='work-case'?s.elapsed:-1;l.monthStart??=monthSnapshot(s);l.monthStart.pq??=s.stats.pq;
 if(!Number.isInteger(l.extraEventMonth)||l.extraEventMonth< -1||l.extraEventMonth>s.elapsed||!l.monthStart||!finite(l.monthStart.pq,0,100)||!finite(l.monthStart.health,0,100)||!finite(l.monthStart.stress,0,100)||!Object.keys(s.skills).every(k=>finite(l.monthStart.skills?.[k],0,100)))return false;
 for(const k of ['pension','gross','selfIncome','mpf','tax','sideEarned','hobbyProgress','careMonths','friendship','careerMonths','overseasMonths'])if(!finite(l[k]))return false;
 if(l.sideJob!==null&&typeof l.sideJob!=='string'||!l.routine||!['exercise','diet','sleep'].every(k=>typeof l.routine[k]==='boolean')||!l.study||typeof l.study.active!=='boolean'||!finite(l.study.months,0,600)||!finite(l.study.credits,0,1800))return false;
 if(l.entry){l.entry.theory??=0;l.entry.assessed??=false;l.entry.nextAssessment??=0;}if(!l.entry||typeof l.entry.assessed!=='boolean'||!Number.isInteger(l.entry.nextAssessment)||l.entry.nextAssessment<0||l.entry.nextAssessment>1000||typeof l.entry.grandfathered!=='boolean'||!finite(l.entry.months,0,600)||!finite(l.entry.theory,0,4000)||!finite(l.entry.practice,0,4000)||l.entry.career!==null&&typeof l.entry.career!=='string')return false;
 if(!Object.keys(GOALS).every(k=>finite(l.goalProgress?.[k],0,10000))||!['mentor','colleague','client'].every(k=>finite(l.npc?.[k],0,100)))return false;
 l.credentials??={};if(!l.credentials||Array.isArray(l.credentials)||Object.entries(l.credentials).some(([k,v])=>typeof k!=='string'||v!==true))return false;
 for(const key of ['arcs','cooldowns'])if(!l[key]||Array.isArray(l[key])||Object.keys(l[key]).length>500)return false;
 if(Object.values(l.arcs).some(a=>!a||!Number.isInteger(a.stage)||a.stage<0||a.stage>10000||!finite(a.trust,0,100)))return false;
 if(Object.values(l.cooldowns).some(n=>!Number.isInteger(n)||n<0||n>10000))return false;
 if(!Array.isArray(l.queue)||l.queue.length>50||l.queue.some(q=>!['referral','repair','community'].includes(q.id)||!Number.isInteger(q.due)||q.due<0))return false;
 if(!Array.isArray(l.journal)||l.journal.length>120||l.journal.some(j=>typeof j.text!=='string'||j.text.length>1500||!Number.isInteger(j.month)))return false;
 if(!Array.isArray(l.returnVisits)||l.returnVisits.length>30||l.returnVisits.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d))||l.lastReturnDay!==null&&typeof l.lastReturnDay!=='string'||l.lastWeekly!==null&&typeof l.lastWeekly!=='string'||!finite(l.lastWorld,-600,600))return false;
 l.dailyCases??={lastDay:null,completed:0};if(!l.dailyCases||!Number.isInteger(l.dailyCases.completed)||l.dailyCases.completed<0||l.dailyCases.completed>4000||l.dailyCases.lastDay!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(l.dailyCases.lastDay))return false;
 if(l.challenge!==null&&(!l.challenge||!['work','care','explore','service','budget'].includes(l.challenge.kind)||!Number.isInteger(l.challenge.start)||!finite(l.challenge.target,1,10)||!finite(l.challenge.progress,0,1000)||typeof l.challenge.done!=='boolean'))return false;
 return true;
}
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export function progressiveTax(annual){let income=Math.max(0,annual-132000),tax=0;for(const rate of [.02,.06,.1,.14,.17]){const band=rate===.17?income:Math.min(50000,income);tax+=band*rate;income-=band;}return Math.min(tax,annual*.15);}
export function payWage(g,amount,kind='regular'){
 const l=g.s.life,gross=Math.max(0,Math.round(amount));if(kind==='regular')l.flow.regular+=gross;
 if(l.schedule==='freelance'){if(kind==='regular')l.flow.regularNet+=gross;g.earn(gross);l.selfIncome+=gross;return {gross,mpf:0,tax:0,net:gross};}
 const before=l.gross,total=before+gross,oldEmployer=Math.min(1500,before*.05),employer=Math.min(1500,total*.05),mpfTotal=total<7100?0:Math.min(1500,total*.05),taxTotal=Math.round(progressiveTax((total-mpfTotal)*12)/12),mpf=mpfTotal-l.mpf,tax=taxTotal-l.tax;
 if(kind==='regular')l.flow.regularNet+=gross-mpf-tax;g.earn(gross);g.pay(Math.max(0,mpf+tax));l.pension+=mpf+employer-oldEmployer;l.gross=total;l.mpf=mpfTotal;l.tax=taxTotal;
 return {gross,mpf,tax,net:gross-mpf-tax};
}
export function lifeCost(g){return Math.round((4000+HOMES[g.s.life.home].rent)*(1.02**Math.floor(g.s.elapsed/12)));}
export function journal(g,text){const l=g.s.life;l.journal.push({month:g.s.month,text});l.journal=l.journal.slice(-120);}
export function progressGoal(g,key,n=1){g.s.life.goalProgress[key]=Math.min(10000,g.s.life.goalProgress[key]+n);const c=g.s.life.challenge;if(c&&!c.done&&({work:'craft',care:'connection',explore:'discovery',service:'service',budget:'freedom'}[c.kind]===key)){c.progress+=n;if(c.progress>=c.target){c.done=true;journal(g,'完成本週小目標：這段經歷已收進回顧。沒有連續登入獎勵或缺席懲罰。');}}}
export function settleLife(g){
 const s=g.s,l=s.life;
 if(l.entry.career!==s.career){l.entry={career:s.career,months:0,practice:0,theory:0,assessed:false,nextAssessment:0,grandfathered:l.entry.grandfathered};}
 if(s.career&&['apprentice','employed','business'].includes(s.status)){l.entry.months++;l.careerMonths++;}
 if(s.status==='overseas')l.overseasMonths++;
 let routineCost=0;
 for(const [key,on]of Object.entries(l.routine)){if(on){s.habits[key]=cap(s.habits[key]+5,0,100);routineCost+=key==='diet'?450:key==='exercise'?150:0;}}
 g.pay(routineCost+(l.insurance==='private'?500:0));
 if(['employed','apprentice'].includes(s.status)&&!s.monthWork&&!s.risks.delay&&!s.risks.captivity){
  const income=(s.status==='apprentice'?g.apprenticeSalary:g.salary)*(l.schedule==='part'?.55:l.schedule==='freelance'?.65:1)*(s.healthData.illness?.65:1)*(s.world?.income??1)*(s.elapsed<s.unmotivatedUntil?.35:1);
  payWage(g,income);g.changeStats({energy:l.schedule==='full'?-18:-10,stress:l.schedule==='full'?5:2});
  journal(g,`本月例行${l.schedule==='part'?'兼職':l.schedule==='freelance'?'自由接案':'工作'}收入 $${Math.round(income)}（稅前），已預留強積金與薪俸稅。`);
 }
 if(l.study.active){l.study.months++;g.pay(900);if(s.stats.energy>=8){g.changeStats({energy:-8,stress:2});l.study.credits++;}if(l.study.months>=12&&l.study.credits>=12){l.study.active=false;g.changeStats({jq:2});g.s.skills[g.job?.skill??'analysis']=cap(g.s.skills[g.job?.skill??'analysis']+5,0,100);journal(g,'完成一年兼讀進修：工作經驗與新技能一起留下來。');}}
 if(l.schedule==='full'&&l.study.active)g.changeStats({stress:3});
 g.graduateCareer();
 if(g.wealth>g.freedomTarget)progressGoal(g,'freedom');
 if(s.status==='employed'&&l.careerMonths>0&&l.careerMonths%18===0&&s.level<8&&s.profession.passed>=s.level*3){s.level++;s.metrics.promotions++;journal(g,`累積實績後晉升為${g.rankName}；月薪隨職級調整。`);g.record('promotion','新的責任，也有新的選擇',`${g.job.name}：${g.rankName}。專業路線與管理路線都可以走得長遠。`);}
 if(s.status==='early-retired'&&g.wealth<g.freedomTarget*.7)journal(g,'市場與生活開支改變了退休預算，可以減少開支、兼職或重新工作。');
 l.gross=Math.round(l.gross);l.mpf=Math.round(l.mpf);l.tax=Math.round(l.tax);
 return {routineCost,insurance:l.insurance==='private'?500:0};
}
export const lifeMethods={
 get entryRequirement(){return entryPath(this.job);},
 get rankName(){const names=this.s.life.track==='specialist'?['見習','初級','獨立執業／合資格人員','資深專員','專家','首席專家','行業導師','專業領航者','業界權威']:['見習','團隊成員','組長','主管','經理','部門主管','營運總監','事業負責人','行政領導'];return names[this.s.level];},
 setGoal(goal){if(!Object.hasOwn(GOALS,goal)||!this.active)return false;this.s.life.goal=goal;journal(this,`人生目標調整為「${GOALS[goal]}」，結局會回顧你的投入。`);return true;},
 configureLife({home,insurance,schedule,sideJob,study,track,hobby,routine}={}){
  const s=this.s,l=s.life;if(!this.active)return false;
  if(home!==undefined&&!Object.hasOwn(HOMES,home)||insurance!==undefined&&!['public','private'].includes(insurance)||schedule!==undefined&&!['full','part','freelance'].includes(schedule)||track!==undefined&&!['specialist','manager'].includes(track)||hobby!==undefined&&!['art','nature','music','volunteer'].includes(hobby))return false;
  if(sideJob!==undefined&&sideJob!==null&&(!this.jobsCatalog.some(j=>j.id===sideJob)||sideJob===s.career))return false;
  if(study===true&&s.status==='student')return false;
  if(study!==undefined&&typeof study!=='boolean'||routine!==undefined&&(!routine||Object.keys(routine).length!==3||!['exercise','diet','sleep'].every(k=>typeof routine[k]==='boolean')))return false;
  const cost=home&&home!==l.home?HOMES[home].deposit:0;if(s.cash<cost)return false;
  this.pay(cost);for(const [k,v]of Object.entries({home,insurance,schedule,sideJob,track,hobby,routine}))if(v!==undefined)l[k]=v;
  if(study!==undefined){if(study&&!l.study.active&&l.study.months>=12&&l.study.credits>=12){l.study.months=0;l.study.credits=0;}l.study.active=study;}
  journal(this,`更新生活安排：${HOMES[l.home].name}，${{full:'全職',part:'兼職',freelance:'自由接案'}[l.schedule]}${l.study.active?'＋兼讀進修':''}；每月預算 $${this.livingCost} 起。`);return true;
 },
 qualifyCareer(){const s=this.s,l=s.life,r=entryPath(this.job);if(s.status!=='apprentice'||!r.regulated||s.mastery<100||l.entry.months<r.months||l.entry.practice<r.practice||l.entry.nextAssessment>s.elapsed||!this.can(1,12))return false;this.spend(12);this.pay(1000);const passed=this.roll()<Math.min(.95,.55+s.skills[this.job.skill]*.003+s.stats.jq*.001-s.stats.stress*.001);l.entry.assessed=passed;l.entry.nextAssessment=s.elapsed+3;this.record('study',passed?'完成專業考核與資格程序':'考核之後，還有補強的空間',passed?'經過認可課程、實習及模擬考核，你完成這份職務的入職資格程序。這不是現實牌照。':'你收到督導的補強建議，可在3個月後再評核。模擬評核費 $1,000；原有訓練與實作不會清零。');this.graduateCareer();return true;},
 sideWork(){const s=this.s,l=s.life,job=this.jobsCatalog.find(j=>j.id===l.sideJob);if(!job||!this.can(1,20)||s.risks.captivity||s.risks.delay)return false;const req=entryPath(job);if(req.regulated&&!l.credentials[job.id]){journal(this,'這份副業涉及受規管職務，尚未取得對應資格，不能獨立接案。');return false;}this.spend(20);const amount=Math.round(job.salary*.12*(.5+s.skills[job.skill]/100));this.earn(amount);l.sideEarned+=amount;this.changeStats({stress:5});s.skills[job.skill]=cap(s.skills[job.skill]+.7,0,100);progressGoal(this,'craft');this.record('work','本業之外，另一種手感',`完成${job.name}副業委託，收入 $${amount}（模擬自僱收入，已扣預估成本）。副業也會消耗精力，沒有資格不能接受受規管工作。`);return true;},
 meaningfulActivity(kind='hobby'){const s=this.s,l=s.life;if(!['hobby','care','friend','volunteer'].includes(kind)||!this.can(1,8,kind==='hobby'?100:0)||s.risks.captivity)return false;this.spend(8);if(kind==='hobby'){this.pay(100);l.hobbyProgress++;progressGoal(this,l.hobby==='volunteer'?'service':'discovery');}else if(kind==='care'){l.careMonths++;this.changeStats({energy:-6});if(s.family.children.length||s.family.status)s.family.affection=cap(s.family.affection+8,0,100);progressGoal(this,'connection');}else if(kind==='friend'){l.friendship++;this.changeStats({contacts:1});progressGoal(this,'connection');}else{this.changeStats({reputation:2});progressGoal(this,'service');}
  this.changeStats({stress:-8,pq:.3});const texts={hobby:`持續練習${{art:'畫畫',nature:'自然觀察',music:'音樂',volunteer:'義工服務'}[l.hobby]}，累積第 ${l.hobbyProgress} 次作品／體驗。`,care:'你陪伴家人或重要的人，協調照顧需要。親友、同居與單身生活也各有連結。',friend:'老朋友帶來近況；你記得對方上次在煩惱甚麼，這次也有話可以慢慢聊。',volunteer:'你參與社區服務，了解別人的生活需要，也把自己的專業分給他人。'};this.record('rest','沒有薪水，仍然值得的一格',texts[kind]);return true;
 },
 returnVisit(day,week){const l=this.s.life;if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||typeof week!=='string'||l.lastReturnDay===day)return false;l.lastReturnDay=day;l.returnVisits.push(day);l.returnVisits=l.returnVisits.slice(-30);journal(this,`重新翻開人生：上次的${this.s.profession.last?.title??'選擇'}仍然留下影響，接下來可以照自己的節奏繼續。`);if(l.lastWeekly!==week){l.lastWeekly=week;const kind={connection:'care',discovery:'explore',service:'service',freedom:'budget',craft:'work'}[l.goal];l.challenge={kind,start:this.s.elapsed,target:3,progress:0,done:false};}return true;},
};
