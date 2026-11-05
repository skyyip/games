import {restoreVocation,vocationalMethods,vocationRecord,vocationEvidence,validVocationalTask} from './vocation.js';
import {restoreMind,mindMethods,mindWorkSupport,completeMind,mindMonth,mindRetirement} from './pq.js';
import {MONTHLY_CHOICES,claimMonthlyEvent,monthSnapshot} from './monthly-play.js';
import {businessPreview,settleBusiness,restoreBusiness} from './business.js';
import {restoreEra,eraMethods,settleEra,validEraEvent,eraMarketImpact,eraOperatingCost,eraWorkBonus} from './era.js';
import {restoreProfessional,professionalMethods} from './professional-practice.js';
import {validKnowledgeCase} from './professional-knowledge.js';
import {validOccupationEvent} from './occupation-events.js';
import {CAREER_ARCS} from './career-arcs.js';
import {initLife,restoreLife,lifeMethods,lifeCost,payWage,settleLife,entryPath,journal,progressGoal,GOALS} from './life-design.js';
import {weightedPick,queueFollowup,dueFollowup,recordDecision} from './context-events.js';
import {JOBS,MAJORS,EVENT_DECK} from './content.js';
import {ASSET_INFO,RISK_ASSETS,WORLD_EVENTS} from './economy.js';
import {LIFE_EVENTS,EXTRA_EFFECTS,eventEligible} from './life-events.js';
import {workProfile,makeWorkCase} from './work-experience.js';
export const SAVE_KEY='career-365.save.v1',VERSION=1,RETIRE_MONTH=65*12;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const money=n=>Math.round(clamp(n,-2e9,2e9)*100)/100;
const FAMILY=[['家徒四壁',1800,0],['勉強溫飽',8000,0],['街坊小康',30000,500],['中產家庭',80000,1000],['富裕家庭',250000,1800],['富可敵國',1800000,3000]];
const EDUCATION=['家裡蹲大學','中學畢業','職業訓練學院','社區學院','本地大學','常春藤名校'];
const MBTI=['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const NEWS=['機械狗成為咖啡師，科技股熱鬧起來','全球節能月，綠色企業受關注','航運停擺，企業成本上升','市場等待選舉結果，投資者觀望','研究室公布新電池，資金追逐新故事','監管加強，虛擬資產市場震盪','本月沒有大新聞，市場也有自己的脾氣'];
export const LIFE_MODES={sabbatical:'人生探索',travel:'環遊世界',overseas:'海外打工', 'early-retired':'財務自由生活'};
const STAT_KEYS=['iq','eq','pq','jq','health','stress','energy','contacts','reputation'];
export class LifeGame{
 constructor({seed=(Date.now()>>>0),name='未命名主角'}={}){
  this.s={version:VERSION,seed:seed>>>0,profile:null,stats:null,month:0,elapsed:0,status:'setup',career:null,route:'mentor',mastery:0,level:0,ap:MONTHLY_CHOICES,cash:0,debt:0,skills:{craft:0,tech:0,care:0,art:0,people:0,analysis:0},assets:{bank:0,bonds:0,stock:0,etf:0,crypto:0,property:0,cards:0,derivatives:0},prices:{stock:100,etf:100,crypto:100,property:100,cards:100,derivatives:100},marketPlan:null,news:'人生還未開場，市場先喝杯茶。',signal:null,history:[],panels:[],pending:null,business:null,habits:{exercise:50,diet:55,sleep:55},healthData:{illness:null,cases:0,bills:0},family:{status:0,affection:50,children:[]},risks:{dependence:0,legal:0,delay:0,captivity:0,scamLoss:0},world:null,monthWork:0,profession:{completed:0,passed:0,quality:0,counts:{},last:null},transfer:null,educationPlan:null,lifestyleMonths:{travel:0,overseas:0,'early-retired':0,sabbatical:0},salaryFactor:1,crossBonus:0,metrics:{earned:0,spent:0,gambles:0,gamblingNet:0,aiErrors:0,mentorSecrets:0,bankruptcies:0,switches:0,promotions:0,work:0,businessMonths:0},lastBankruptcy:-100,lastLedger:null,unmotivatedUntil:0,housing:'stable'};
  const age=this.int(18,26),family=this.pick([FAMILY[0],FAMILY[1],FAMILY[1],FAMILY[2],FAMILY[2],FAMILY[2],FAMILY[3],FAMILY[3],FAMILY[4],FAMILY[5]]),education=this.pick(EDUCATION.slice(0,age<21?4:age<22?5:6)),major=this.pick(MAJORS);
  const profile={name:String(name).trim().slice(0,20)||'未命名主角',portrait:(seed>>>0)%8,gender:this.pick(['女','男','非二元']),startAge:age,height:0,weight:0,blood:this.pick(['A','B','O','AB']),zodiac:this.pick(['白羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚']),family:family[0],support:family[2],education,major:major.name,mbti:this.pick(MBTI)};
  // Average several draws for adult proportions, then derive weight from height and BMI.
  const centre=profile.gender==='男'?174:profile.gender==='女'?162:168;
  profile.height=Math.round(centre+(this.roll()+this.roll()+this.roll()-1.5)*16);
  const bmi=19+(this.roll()+this.roll()+this.roll())/3*10;profile.weight=Math.round(bmi*(profile.height/100)**2*10)/10;
  const stats={iq:this.int(80,145),eq:this.int(30,90),pq:this.int(35,95),jq:this.int(25,85),health:100,stress:12,energy:0,contacts:0,reputation:0};
  Object.assign(this.s,{profile,stats,month:age*12,cash:family[1]});this.s.skills[major.skill]=this.int(8,18);stats.energy=this.energyMax;initLife(this);restoreMind(this.s);restoreProfessional(this.s);restoreEra(this.s);restoreVocation(this.s);this.s.marketPlan=this.makeMarket();
  this.record('origin','人生履歷卡',`${age} 歲，${profile.family}，${profile.education}的${profile.major}畢業生。這次，由你決定下一格。`);
 }
 roll(){let t=this.s.seed=(this.s.seed+0x6D2B79F5)>>>0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
 int(a,b){return a+Math.floor(this.roll()*(b-a+1));}pick(a){return a[this.int(0,a.length-1)];}
 get age(){return Math.floor(this.s.month/12);}get ageLabel(){return `${this.age} 歲 ${this.s.month%12} 個月`;}
 get job(){return JOBS.find(j=>j.id===this.s.career)??null;}
 get energyMax(){return Math.round(50+this.s.stats.health*.7);}
 get wealth(){return money(this.s.cash-this.s.debt+Object.keys(this.s.assets).reduce((n,k)=>n+this.assetValue(k),0));}
 get livingCost(){return lifeCost(this);}
 get jobsCatalog(){return JOBS;}
 get freedomTarget(){return (this.livingCost+this.s.family.children.filter(n=>n<216).length*3000+(this.s.life.insurance==='private'?500:0))*12*25;}
 get canWork(){return this.s.risks.captivity===0&&this.s.risks.delay===0&&['apprentice','employed','business','overseas'].includes(this.s.status);}
 get canStudy(){return this.s.risks.captivity===0&&this.s.risks.delay===0&&['apprentice','employed','business','student'].includes(this.s.status);}
 get apprenticeSalary(){return Math.round(Math.max(6000,(this.job?.salary??0)*.45));}
 get salary(){return Math.round((this.job?.salary??0)*(1+Math.max(0,this.s.level-1)*.12)*this.s.salaryFactor*(1+this.s.crossBonus));}
 assetValue(id){return ['bank','bonds'].includes(id)?this.s.assets[id]:this.s.assets[id]*(this.s.prices[id]??0);}
 get illnessRisk(){const h=this.s.habits;return clamp(.015+(300-h.exercise-h.diet-h.sleep)/2200+Math.max(0,this.age-35)*.0015+this.s.stats.stress*.00045+this.s.risks.dependence*.001,.015,.5);}
 get active(){return !['setup','retired'].includes(this.s.status)&&!this.s.pending;}
 can(cost=0,energy=0,cash=0){return this.active&&this.s.ap>=cost&&this.s.stats.energy>=energy&&this.s.cash>=cash;}
 record(scene,title,text){const s=this.s;s.panels.push({id:s.panels.length,age:Math.floor(s.month/12),month:s.month%12,scene,title,text,career:this.job?.name??'',cash:Math.round(s.cash),stress:Math.round(s.stats?.stress??0),portrait:s.profile.portrait,look:s.profile?.gender??'非二元',tone:this.int(0,3)});}
 pay(amount){amount=Math.max(0,amount);const paid=Math.min(this.s.cash,amount);this.s.cash=money(this.s.cash-paid);this.s.debt=money(this.s.debt+amount-paid);this.s.metrics.spent=money(this.s.metrics.spent+amount);if(this.s.life?.flow)this.s.life.flow.expenses=money(this.s.life.flow.expenses+amount);}
 earn(amount){amount=Math.max(0,amount);this.s.cash=money(this.s.cash+amount);this.s.metrics.earned=money(this.s.metrics.earned+amount);if(this.s.life?.flow)this.s.life.flow.income=money(this.s.life.flow.income+amount);}
 changeStats(effects){for(const [k,v]of Object.entries(effects)){if(!Number.isFinite(v))continue;if(k==='cash'){v>=0?this.earn(v):this.pay(-v);}else if(k==='mastery')this.s.mastery=clamp(this.s.mastery+v,0,100);else if(STAT_KEYS.includes(k))this.s.stats[k]=clamp(this.s.stats[k]+(k==='stress'&&v>0?v*(1-this.s.stats.pq/250):['iq','eq','pq','jq'].includes(k)&&v>0&&v<5?v*.22*Math.max(.12,1-this.s.stats[k]/(k==='iq'?180:110)):v),0,k==='iq'?170:k==='contacts'?999:k==='reputation'?10000:k==='energy'?this.energyMax:100);}this.s.stats.energy=Math.min(this.energyMax,this.s.stats.energy);}
 spend(energy=0){this.s.ap--;this.s.stats.energy=Math.max(0,this.s.stats.energy-energy);}
 dailyWork(day){const s=this.s,l=s.life;if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||l.dailyCases.lastDay===day||!['apprentice','employed','business'].includes(s.status)||!this.canWork||!this.can(1,10))return false;const p=this.workProfile,n=Math.floor(Date.parse(day)/86400000);if(!Number.isFinite(n))return false;const hasArc=p.cases.length>4&&makeWorkCase(this.job,0,()=>0).work.serial,index=hasArc?3+4*(n%(p.cases.length-3)):n%p.cases.length;this.spend(10);s.pending=makeWorkCase(this.job,index,(a,b)=>this.int(a,b));if(s.status==='apprentice'&&this.entryRequirement.regulated)s.pending.text='這是受督導練習，所有處理由合資格人員覆核。'+s.pending.text;s.pending.work.daily=true;s.pending.title='今日小委託｜'+s.pending.title;s.pending.text+=' 這是一項短練習，不另發整月薪酬；成果會收進成長紀錄。';l.dailyCases.lastDay=day;return true;}
 get workProfile(){return workProfile(this.job);}
 graduateCareer(){
  const s=this.s;if(vocationRecord(s)&&!s.life.entry.grandfathered&&!s.life.credentials[s.career]&&!vocationEvidence(s))return false;if(s.status!=='apprentice'||s.mastery<100||!s.life.entry.grandfathered&&(s.life.entry.months<entryPath(this.job).months||s.life.entry.practice<entryPath(this.job).practice||entryPath(this.job).regulated&&!s.life.entry.assessed))return false;s.status='employed';s.level=1;s.life.credentials[s.career]=true;if(s.route==='mentor')this.changeStats({contacts:5,eq:2,jq:2});
  this.record('graduate','今天，輪到你獨當一面',`你完成${this.job.name}學徒期。${s.route==='mentor'?'師傅交給你的不只有工具，還有客人的電話。':'知識跑得很快；下一課，是與真實的人一起工作。'}`);return true;
 }
 assignWork(){
  const s=this.s;if(!this.job||s.pending||!this.active)return false;
  const number=s.life.projectCounts[s.career]??0;s.pending=makeWorkCase(this.job,number,(a,b)=>this.int(a,b));if(s.status==='apprentice'&&this.entryRequirement.regulated)s.pending.text='你在受督導訓練中，處理均需合資格人員覆核，不能獨立執業。'+s.pending.text;if(s.pending.work.serial){const ar=s.life.arcs[s.career];s.pending.text+=` 目前合作信任 ${Math.round(ar?.trust??40)}/100${s.profession.last?.career===s.career?'；上次交付 '+s.profession.last.score+'/100，對方會按這段經驗與你合作。':'。'}`;}return true;
 }
 resolveWork(index){
  const s=this.s,e=s.pending,c=e?.choices[index];if(e?.id!=='work-case'||!e.work||!c||e.work.career!==s.career)return false;
  const approach=c.approach,skill=s.skills[this.job.skill],ability=approach==='talk'?s.stats.eq:s.stats.iq,pressure=e.work.pressure??'quality',l=s.life;
  const fit=approach==='check'?(pressure==='quality'?14:3):approach==='talk'?(pressure==='people'?16:2):(pressure==='deadline'?18:0),trust=approach==='talk'?l.npc.colleague*.12:0;
  const mindSupport=mindWorkSupport(s,approach);
  const score=Math.round(clamp(mindSupport+37+skill*.23+ability*.08+s.stats.jq*.06+fit+trust+eraWorkBonus(s)+((l.arcs[s.career]?.trust??40)-40)*.08+(this.roll()-.5)*30,0,100)),passed=score>=62;
  this.changeStats(c.effects);this.changeStats({reputation:passed?5:-2,mastery:s.status==='apprentice'?(passed?4:2):0,jq:passed?.3:.15,stress:passed?-2:5});s.skills[this.job.skill]=clamp(skill+(passed?1.2:.7)*Math.max(.12,1-skill/110),0,100);
  const adjustment=passed?Math.round(this.job.salary*(approach==='rush'?.004:.012)*this.eraDemand):-Math.round(this.job.salary*.006);
  if(adjustment>0)this.earn(adjustment);else this.pay(-adjustment);
  const feedback=(mindSupport?`你先用心聖五力整理思路，做法契合本次方向，評分支持 +${mindSupport.toFixed(1)}；專業與安全要求仍然適用。`:'')+(approach==='check'?'你投入成本與精力做深入覆核。':approach==='talk'?'你依靠同事協調與信任完成交接。':'你縮小承諾範圍，保留必要安全核對；這次收益較少。')+`關鍵仍是「${e.work.clue}」。${passed?'交付達到本次範圍要求。':'仍有待改善部分，已安排覆檢；失敗可以成為後續的學習。'}`;
  l.entry.practice++;progressGoal(this,'craft');l.npc[approach==='talk'?'colleague':'client']=clamp(l.npc[approach==='talk'?'colleague':'client']+(passed?3:-2),0,100);
  if(e.work.serial){const ar=l.arcs[s.career]??{stage:0,trust:40};ar.stage++;ar.trust=clamp(ar.trust+(passed?5:-3),0,100);l.arcs[s.career]=ar;if(ar.stage%3===0){queueFollowup(this,passed?'referral':'repair');journal(this,`「${e.work.serial.project}」完成一輪，${e.work.serial.npc}信任 ${Math.round(ar.trust)}/100。`);}}
  else if(!passed)queueFollowup(this,'repair');
  s.profession.completed++;if(passed)s.profession.passed++;s.profession.quality=score;if(e.work.daily)l.dailyCases.completed++;else {s.profession.counts[s.career]=(s.profession.counts[s.career]??0)+1;if(e.work.storyVersion===2||CAREER_ARCS[this.job.name])l.projectCounts[s.career]=(l.projectCounts[s.career]??0)+1;}
  s.profession.last={month:s.month,career:s.career,title:e.work.topic,approach,score,passed,feedback,adjustment};s.pending=null;this.graduateCareer();
  journal(this,`${this.job.name}｜${e.work.topic}：${score}/100；${feedback}`);
  this.record('work',`${this.job.name}｜${passed?'交付通過':'檢討與改善'}：${e.work.topic}`,`你選擇：${c.label}。${feedback} 本次交付 ${score}/100（62 分通過）；${adjustment>0?'交付獎金 $'+adjustment:'覆檢成本 $'+(-adjustment)}。`);completeMind(this,e,c);return true;
 }
 allocationPreview(entries,mode='amount'){
  const s=this.s,fail=error=>({ok:false,error});
  if(!entries||typeof entries!=='object'||Array.isArray(entries)||!['amount','weights'].includes(mode)||Object.entries(entries).some(([k,v])=>!Object.hasOwn(ASSET_INFO,k)||!Number.isFinite(v)))return fail('請填寫有效的資產與數字。');
  const ids=Object.keys(ASSET_INFO),budget=money(s.cash+ids.reduce((sum,id)=>sum+this.assetValue(id),0)),values={};
  if(mode==='weights'){
   if(ids.some(id=>(entries[id]??0)<0||(entries[id]??0)>100)||ids.reduce((sum,id)=>sum+(entries[id]??0),0)>100+1e-7)return fail('投資比例合計不可超過 100%，其餘會保留為現金。');
   for(const id of ids)values[id]=(entries[id]??0)===0?-this.assetValue(id):money(budget*(entries[id]??0)/100-this.assetValue(id));
   let funds=s.cash,demand=0;for(const id of ids){if(values[id]<0)funds+=(-values[id])*(1-ASSET_INFO[id].fee);else demand+=values[id];}
   if(demand>funds)for(const id of ids)if(values[id]>0)values[id]=Math.floor(values[id]*funds/demand*100)/100;
  }else for(const id of ids)values[id]=money(entries[id]??0);
  let available=s.cash,fees=0;const orders=[],holdings={...s.assets};
  for(const id of ids){const change=values[id];if(!change)continue;const info=ASSET_INFO[id],sell=change<0,value=Math.abs(change),price=['bank','bonds'].includes(id)?1:s.prices[id];
   if(sell&&value>this.assetValue(id)+.011)return fail(`${info.name}提取額超過目前持有價值。`);
   if(!sell&&value<info.minimum)return fail(`${info.name}每次投入最少 $${info.minimum.toLocaleString('en')}；可調整比例或金額。`);
   const fee=money(value*info.fee),units=(sell?Math.min(value,this.assetValue(id)):value-fee)/price;
   holdings[id]=sell&&value>=this.assetValue(id)?0:Math.max(0,holdings[id]+(sell?-units:units));available=money(available+(sell?value-fee:-value));fees=money(fees+fee);orders.push({id,sell,value,fee});
  }
  if(!orders.length)return fail('先為至少一種資產填入金額或不同的目標比例。');
  if(available<0)return fail('投入總額超過現金及本次提取所得，請保留足夠資金。');
  return {ok:true,orders,holdings,fees,cashAfter:Math.max(0,available),budget};
 }
 allocate(entries,mode='amount'){
  if(!this.can(1))return false;const preview=this.allocationPreview(entries,mode);if(!preview.ok)return false;
  this.spend();this.s.assets=preview.holdings;this.s.cash=preview.cashAfter;
  this.record('market','把資產，分成自己的節奏',preview.orders.map(o=>`${ASSET_INFO[o.id].name}${o.sell?'提取':'投入'} $${o.value.toLocaleString('en')}`).join('；')+`。交易成本合計 $${preview.fees.toLocaleString('en')}，留下現金 $${preview.cashAfter.toLocaleString('en')}。一次分配共用 1 行動。`);return true;
 }
 transferPreview(id){
  const job=JOBS.find(j=>j.id===id);if(!job)return null;const previous=this.job,same=previous?.skill===job.skill;
  const plumbing=previous?.name==='水電工'&&job.name==='YouTuber';
  return {related:!!same,bonus:Math.min(.5,this.s.history.length*.025+(plumbing?.25:same?.08:0)),mastery:Math.min(same?70:55,this.s.skills[job.skill]*(same?.65:.45)),contactsLoss:previous?Math.min(this.s.stats.contacts,same?1:4):0,reputationLoss:previous?Math.min(this.s.stats.reputation,same?8:20):0,stress:previous?(same?4:9):0,oldSalary:this.salary,newBase:job.salary};
 }
 habit(type){
  const s=this.s,cost=type==='diet'?180:0,energy=type==='exercise'?12:0;
  if(!Object.hasOwn(s.habits,type)||s.risks.captivity>0||!this.can(1,energy,cost))return false;
  this.spend(energy);this.pay(cost);s.habits[type]=clamp(s.habits[type]+20,0,100);
  this.changeStats(type==='exercise'?{health:3,pq:1,stress:-8}:type==='diet'?{health:3,pq:.5}:{energy:35,health:3,pq:1,stress:-10});
  this.record('health',{exercise:'把運動排進日常',diet:'好好吃飯，也是一項投資',sleep:'這次，準時關燈'}[type],{exercise:'你安排適量運動，建立可持續的習慣；長期有助降低遊戲中的患病風險。',diet:'你用 $180 安排均衡飲食，為日常增加蔬菜、適量蛋白質與規律用餐。',sleep:'你暫停熬夜，把規律作息排進行程。習慣需要持續，健康也不是一次選擇就永遠不變。'}[type]);return true;
 }
 treat(){
  const s=this.s;if(!this.can(1)||!s.healthData.illness)return false;this.spend();const bill=s.life.insurance==='private'?0:200;this.pay(bill);s.healthData.bills+=bill;s.healthData.illness.months=Math.max(0,s.healthData.illness.months-1);if(!s.healthData.illness.months)s.healthData.illness=null;this.changeStats({health:6,energy:15,stress:-5});this.record('medical','看診與休養',`你支付 $${bill} 模擬診療自付額並安排休養；較嚴重病況仍需要後續時間。這不是現實收費或療效保證。`);return true;
 }
 support(){
  const s=this.s;if(!this.can(1)||!s.risks.dependence&&!s.risks.captivity&&!s.risks.delay)return false;this.spend();
  if(s.risks.captivity){this.s.pending=structuredClone(LIFE_EVENTS.find(e=>e.id==='rescue'));return true;}
  this.pay(800);s.healthData.bills+=800;s.risks.dependence=Math.max(0,s.risks.dependence-15);s.risks.delay=Math.max(0,s.risks.delay-1);this.changeStats({health:6,pq:2,stress:-8});this.record('medical','求助，是重建生活的一步','你用 $800 接受模擬醫療／輔導支援，減少依賴與復原時間。');return true;
 }
 relationshipAction(type){
  const s=this.s;if(!this.can(1,8,200)||s.risks.captivity)return false;
  const id={date:'romance',marry:'marriage',child:'parenthood'}[type];
  if(type==='time'&&s.family.status>0){this.spend(8);this.pay(200);s.family.affection=clamp(s.family.affection+12,0,100);this.changeStats({stress:-8,eq:.5});this.record('relationship','把時間留給重要的人','你們聊近況、安排分工，也留了一點不談帳單的時間。');return true;}
  const event=LIFE_EVENTS.find(e=>e.id===id);if(!event||!eventEligible(event,s))return false;this.spend(8);this.pay(200);s.pending=structuredClone(event);return true;
 }
 applyLifeEffects(effects){
  const s=this.s,limitedScam=effects.scamLoss>0&&effects.cash<0;this.changeStats(limitedScam?{...effects,cash:0}:effects);if(limitedScam){const loss=Math.min(s.cash,-effects.cash,effects.scamLoss);this.pay(loss);s.risks.scamLoss=money(s.risks.scamLoss+loss);}
  for(const key of ['dependence','legal','delay','captivity'])if(effects[key]!==undefined)s.risks[key]=clamp(s.risks[key]+effects[key],0,key==='dependence'?100:key==='legal'?999:24);
  if(effects.affection!==undefined)s.family.affection=clamp(s.family.affection+effects.affection,0,100);
  if(effects.relationship!==undefined){s.family.status=clamp(Math.round(effects.relationship),0,2);if(s.family.status===0)s.family.affection=50;}
  if(effects.children>0&&s.family.children.length<4)s.family.children.push(0);
  if(effects.scamPercent){const loss=money(Math.min(s.cash,Math.min(30000,this.salary||12000)*clamp(effects.scamPercent,0,100)/100));this.pay(loss);s.risks.scamLoss=money(s.risks.scamLoss+loss);}
  if(effects.scamLoss&&!limitedScam)s.risks.scamLoss=money(s.risks.scamLoss+effects.scamLoss);
 }
 checkHealth(){
  const s=this.s,h=s.habits,hadIllness=!!s.healthData.illness;
  for(const key of Object.keys(h))h[key]=Math.max(0,h[key]-(s.life.routine[key]?2:key==='exercise'?4:3));
  const habitMean=(h.exercise+h.diet+h.sleep)/3;
  this.changeStats({health:habitMean>=65?1:habitMean<35?-4:habitMean<50?-1:0,energy:h.sleep>=65?10:h.sleep<25?-8:0});
  if(hadIllness){s.healthData.illness.months--;this.changeStats({health:-3,energy:-12});if(s.healthData.illness.months<=0){s.healthData.illness=null;this.record('medical','這次，身體慢慢恢復了','你完成休養。疾病復原後，依然可以繼續照顧運動、飲食與作息。');}}
  else if(s.stats.health<25||this.roll()<this.illnessRisk){
   const severe=s.stats.health<25||this.roll()<.12,name=severe?'需要住院休養的病況':this.pick(['呼吸道感染','腸胃不適','疲勞與失眠相關不適']),bill=s.life.insurance==='private'?(severe?500:0):(severe?2400:200);
   s.healthData.illness={name,months:severe?3:2};s.healthData.cases++;s.healthData.bills+=bill;this.pay(bill);this.changeStats({health:severe?-10:-6,energy:-20,stress:5});this.record('medical',name,`你支付 $${bill.toLocaleString('en')} 模擬醫療費；病況會降低工作收入至 65%，可安排看診與休養。規律習慣降低風險，但不保證完全不生病。`);
  }
  if(s.risks.dependence){this.pay(Math.round(s.risks.dependence*15));this.changeStats({health:-s.risks.dependence*.04,stress:s.risks.dependence*.05});}
 }
 triggerLifeEvent(id=null){
  const s=this.s;if(!this.active||s.life.extraEventMonth===s.elapsed)return false;
  const available=LIFE_EVENTS.filter(e=>eventEligible(e,s)&&(id||!(s.life.cooldowns[e.id]>s.elapsed))),e=id?available.find(e=>e.id===id):s.risks.captivity?available.find(e=>e.id==='rescue'):weightedPick(this,available);
  if(!e||!claimMonthlyEvent(s))return false;s.pending=structuredClone(e);return true;
 }
 enroll(){
  const s=this.s,initial=s.status==='setup';if(s.risks.captivity||s.risks.delay||s.pending||s.status==='retired'||s.status==='student'||!initial&&!this.can(1,0,6000)||initial&&s.cash<6000)return false;
  if(!initial)this.spend();this.pay(6000);if(s.business){this.pay(s.business.staff*1000);s.business=null;}
  s.status='student';s.educationPlan={remaining:12,credits:0};this.record('study','畢業之後，再讀一章','你選擇一年制進修：入學費 $6,000，每月學費 $1,800；至少完成 12 次課堂練習，修業滿一年後畢業，再選擇繼續進修或進入學徒階段。');return true;
 }
 quit(){
  const s=this.s;if(!['apprentice','employed','business','overseas'].includes(s.status)||!this.can(1))return false;
  this.spend();if(s.business){this.pay(s.business.staff*1000);s.business=null;}s.status='sabbatical';this.record('switch','辭職，為人生留一格空白','你離開目前的工作，保留技能和資產。接下來可以旅行、海外打工，或重新選擇職業；生活費仍會逐月計算。');return true;
 }
 changeLife(mode){
  const s=this.s;if(s.risks.captivity||s.risks.delay||!Object.hasOwn(LIFE_MODES,mode)||!this.can(1)||s.status==='student')return false;
  if(mode==='early-retired'&&(s.debt>0||this.wealth<this.freedomTarget))return false;
  const cost=mode==='travel'?5000:mode==='overseas'?8000:0;if(s.cash<cost||s.status===mode)return false;
  this.spend();this.pay(cost);if(s.business){this.pay(s.business.staff*1000);s.business=null;}s.status=mode;
  this.record('rest',LIFE_MODES[mode],mode==='travel'?'背起行囊，出發環遊世界。出發費 $5,000，每月旅費另加 $4,500。':mode==='overseas'?'啟程體驗異國生活，做當地短期工作。出發費 $8,000，每月住宿交通另加 $2,500；每次打工賺 $6,000。':mode==='early-retired'?'資產達到 25 年基本生活費且沒有債務，你選擇提早離開職場，做自己想做的事。仍需支付生活費，也可再度工作；人生在 65 歲才結算。':'先放慢腳步，為下一段人生留一點空間。');return true;
 }
 explore(){
  const s=this.s;if(s.risks.captivity||!Object.hasOwn(LIFE_MODES,s.status)||!this.can(1,8))return false;this.spend(8);
  const place=s.status==='travel'?this.pick(['京都小巷','冰島海岸','葡萄牙小鎮','紐西蘭步道']):s.status==='overseas'?this.pick(['異國市集','當地社區廚房','週末語言交換角']):this.pick(['社區畫室','海邊釣魚小屋','義工服務站','一直想學的音樂課']);
  progressGoal(this,'discovery');this.changeStats({pq:.4,eq:.2,stress:-12,contacts:1});this.record('rest','把時間，花在想做的事',`今天走進${place}。沒有升職通知，卻多了一段自己的故事。`);return true;
 }
 careerEligibility(id,route='mentor'){
  const s=this.s,initial=s.history.length===0&&['setup','graduate'].includes(s.status),cost=initial?0:3000,actions=initial?0:1,blockers=[];
  if(!JOBS.some(j=>j.id===id))blockers.push('job');
  if(!['mentor','ai'].includes(route))blockers.push('route');
  if(s.status==='retired')blockers.push('retired');
  if(s.pending)blockers.push('story');
  if(s.risks.captivity)blockers.push('captivity');
  if(s.risks.delay)blockers.push('recovery');
  if(!initial&&s.ap<actions)blockers.push('actions');
  if(s.cash<cost)blockers.push('cash');
  return {ok:blockers.length===0,initial,cost,actions,blockers};
 }
 chooseCareer(id,route='mentor'){
  const eligibility=this.careerEligibility(id,route);if(!eligibility.ok)return false;
  const job=JOBS.find(j=>j.id===id),s=this.s,{initial}=eligibility;
  const preview=this.transferPreview(id),previous=this.job;if(!initial){this.pay(3000);s.ap--;s.metrics.switches++;}
  if(s.business){this.pay(s.business.staff*1000);s.business=null;}
  const plumbing=previous?.name==='水電工'&&job.name==='YouTuber';s.crossBonus=preview.bonus;s.transfer=previous?{from:previous.name,to:job.name,related:preview.related,at:s.month}:null;if(previous)this.changeStats({contacts:-preview.contactsLoss,reputation:-preview.reputationLoss,stress:preview.stress});
  s.life.entry={career:id,months:0,practice:0,theory:0,assessed:false,nextAssessment:0,grandfathered:false};s.life.careerMonths=0;if(s.life.sideJob===id)s.life.sideJob=null;s.educationPlan=null;s.history.push({id,age:this.age,route});s.career=id;s.route=route;s.status='apprentice';s.mastery=preview.mastery;s.level=0;s.salaryFactor=1;if(s.life.credentials[id]){s.mastery=100;s.life.entry.grandfathered=true;this.graduateCareer();}
  this.record(initial?'start':'switch',initial?'第一份職業，第一格冒險':plumbing?'水管維修，也能拍出流量':'人生可以重新選科',`${previous?previous.name+' → ':''}${job.name}。${route==='mentor'?'拜師學藝，從掃地和買便當開始。':'打開 AI 模擬教室，先學會提問，也要學會驗證。'}${plumbing?'修水管的經驗變成搞笑維修頻道，跨界收入加成 25%。':''}${previous?`舊技能保留，重新由學徒收入起步；${preview.related?'相關專業能加快重新上手':'跨領域需要重新建立行業信任'}。人脈 -${preview.contactsLoss}、職場聲望 -${preview.reputationLoss}；新行業參考月薪 $${job.salary.toLocaleString('en')}。`:''}`);return true;
 }
 study(verify=false){
  const s=this.s;if(!this.canStudy||!this.can(1,14,verify?300:0))return false;this.spend(14);if(verify)this.pay(300);
  if(s.status==='student'){s.educationPlan.credits++;this.changeStats({iq:.5,jq:.5,pq:.5,stress:3});const skill=MAJORS.find(m=>m.name===s.profile.major)?.skill??'analysis';s.skills[skill]=clamp(s.skills[skill]+2,0,100);this.record('study','課堂之外，也認識自己','進修讓專業累積，也替未來多開一扇窗。完成課堂 '+s.educationPlan.credits+' / 12 次。');return true;}
  const gain=(s.route==='mentor'?11:22)+s.stats.iq*.07+(verify?2:0);s.skills[this.job.skill]=clamp(s.skills[this.job.skill]+gain*.12*Math.max(.12,1-s.skills[this.job.skill]/110),0,100);
  if(s.route==='mentor'){this.changeStats({eq:.3,jq:.35,contacts:.5,stress:3});s.life.npc.mentor=clamp(s.life.npc.mentor+.6,0,100);if(this.roll()<.09){s.metrics.mentorSecrets++;s.mastery=clamp(s.mastery+12,0,100);this.record('mentor','師傅沒有寫進課本的那一招','你留下來收拾工作間，師傅把壓箱底的手藝教給你。技能和人脈一起留下來。');}}
  else this.changeStats({iq:.2,stress:4,jq:verify?.3:0});
  if(s.status==='apprentice'){s.mastery=clamp(s.mastery+gain,0,100);if(!this.entryRequirement.regulated)s.life.entry.practice++;s.life.entry.theory=(s.life.entry.theory??0)+1;this.graduateCareer();}
  if(s.route==='ai'&&!verify&&this.roll()<.2*(1-s.stats.jq/200)&&claimMonthlyEvent(s)){s.metrics.aiErrors++;s.pending={id:'ai-hallucination',title:'AI 很有信心，但那一步錯了',text:`模擬教室的${this.job.name}答案看起來十分流暢。你在實作前，發現關鍵步驟對不上。`,scene:'ai',choices:[{label:'花 $800 請業內前輩覆核',effects:{cash:-800,jq:4,contacts:1,stress:-4}},{label:'承認失誤，重做基礎練習',effects:{mastery:-12,stress:8,jq:2}}]};}
  if(s.ap===2)this.record(s.route==='ai'?'ai':'mentor',verify?'先查證，才算學懂':s.route==='ai'?'今天的老師，是一個輸入框':'由小事學起',`${this.job.routine}。${verify?'你比對資料並做小型測試，這次沒有把流暢當成正確。':'專業能力慢慢增加，人生沒有白做的練習。'}`);return true;
 }
 work(overtime=false,assign=true){
  const s=this.s;if(!this.canWork||!this.can(1,overtime?0:18))return false;this.spend(overtime?40:18);s.metrics.work++;if(overtime)s.habits.sleep=Math.max(0,s.habits.sleep-12);
  if(s.status==='overseas'){this.earn(Math.round((overtime?8500:6000)*(s.healthData.illness?.65:1)*(s.world?.income??1)));this.changeStats({eq:1,jq:1,stress:overtime?15:5,health:overtime&&s.stats.energy===0?-18:0});this.record('work','在異國，也學會好好生活','你完成當地的一班短期工作，練習語言與新的工作文化。這一站是遊戲內的海外生活體驗。');return true;}
  const apprentice=s.status==='apprentice',wageFactor=s.life.schedule==='part'?.55:s.life.schedule==='freelance'?.65:1,base=wageFactor*(s.status==='business'?this.salary/3:overtime?(apprentice?this.apprenticeSalary:this.salary)*.25:s.monthWork?0:apprentice?this.apprenticeSalary:this.salary);
  const business=s.status==='business'?1.1+(s.business.customers*.025)+(s.business.team?.reduce((sum,e)=>sum+e.efficiency,0)??s.business.staff*.18):1;const income=Math.round(base*business*(overtime&&s.status==='business'?1.65:1)*(s.elapsed<s.unmotivatedUntil?.35:1)*(s.healthData.illness?.65:1)*(s.world?.income??1));if(['employed','apprentice'].includes(s.status)&&!overtime)s.monthWork++;if(s.status==='business'){s.business.service=Math.min(12,(s.business.service??0)+2);this.changeStats({reputation:2});}else if(['employed','apprentice'].includes(s.status))payWage(this,income,overtime?'extra':'regular');else this.earn(income);this.changeStats({stress:overtime?15:6,reputation:apprentice?2:6,jq:.35,pq:overtime?-1.5:0});s.skills[this.job.skill]=clamp(s.skills[this.job.skill]+1,0,100);
  if(overtime&&s.stats.energy===0){this.changeStats({health:-18,stress:12,pq:-2});this.pay(1800);s.healthData.bills+=1800;this.record('medical','身體按下了暫停鍵','加班把精力耗盡，診金 $1,800。今天的收入不是全部的代價；休息也算一種前進。');}
  if(s.metrics.work%6===1)this.record('work',apprentice?'受督導訓練與第一筆收入':'今天也有把事情做好',`${this.job.name}的一天：${this.job.routine}。${s.status==='business'?'本月訂單於月結統一收款；本次改善服務與留客':'本次稅前 $'+income.toLocaleString('en')+'；'}僱員收入預留強積金及薪俸稅，結算可查看明細。`);
  if(assign&&!s.pending&&!overtime&&(s.monthWork===1||s.status==='business'))this.assignWork();else if(!s.pending&&overtime&&this.roll()<.13)this.event();return true;
 }
 rest(social=false){const s=this.s;if(!this.can(1,social?8:0,social?120:0))return false;this.spend(social?8:0);const extrovert=s.profile.mbti[0]==='E';if(social){progressGoal(this,'connection');if(s.stats.contacts>15&&s.elapsed%6===0)queueFollowup(this,'community',3);this.pay(120);this.changeStats({contacts:3,eq:1.5,stress:extrovert?-22:-8,energy:8,pq:1});}else this.changeStats({health:s.habits.sleep>=50?1:0,stress:extrovert?-13:-23,energy:40,pq:.3});if(s.stats.stress<10&&s.elapsed%6===0)this.record('rest','人生不只有生產力',social?'你買了一輪飲料，聽見別人的故事。人脈不是名片，是下次還想再見。':'你關掉通知，給自己一個安靜的下午。沒有升職，但呼吸順了。');return true;}
 negotiate(){if(!this.canWork||!this.can(1,8)||this.s.status!=='employed')return false;this.spend(8);const success=this.roll()<.25+this.s.stats.eq/200+Math.min(.2,this.s.stats.reputation/500)+(this.eraDemand-1)*.3;if(success){this.s.salaryFactor=Math.min(2,this.s.salaryFactor+.08);this.changeStats({stress:-4,eq:1});}else this.changeStats({stress:7,jq:1});this.record('promotion',success?'這次，薪水跟上了努力':'主管說「下次一定」',success?'你帶著實績和清楚的提案談成加薪。單次工作收入增加。':'你沒有把承諾當成現金。先記下成果，再找下一個談判時機。');return true;}
 startBusiness(){const s=this.s;if(!this.canWork||!this.can(1,12,40000)||s.status!=='employed')return false;this.spend(12);this.pay(40000);s.status='business';s.business={staff:0,customers:8,team:[],retention:.95,service:0,months:0};this.record('business','招牌掛上去，你成了老闆',`你用 $40,000 開始${this.job.name}事業。每月店租 $9,000；每名員工月薪 $15,400（參考全職非技術職業工資中位數）。先顧現金流，再談夢想。`);return true;}
 businessAction(type){const s=this.s,cost=type==='hire'?3000:2000;if(!this.can(1,10,cost)||s.status!=='business'||!['hire','market'].includes(type)||type==='hire'&&s.business.staff>=8)return false;this.spend(10);this.pay(cost);if(type==='hire'){s.business.staff++;const person=this.pick([{trait:'默默修好所有東西',efficiency:.28},{trait:'先開會，再開會議的會議',efficiency:.1},{trait:'會替辦公室貓咪打卡',efficiency:.16},{trait:'細心核對每一張收據',efficiency:.22}]);(s.business.team??=[]).push({name:'夥伴 '+s.business.staff,...person});this.changeStats({eq:1,stress:4});}else{s.business.customers=Math.min(60,s.business.customers+3*(1-s.business.customers/75));this.changeStats({reputation:3,stress:3});}this.record('business',type==='hire'?'團隊，多了一個名字':'讓更多人知道你的招牌',type==='hire'?`招聘費 $3,000；${s.business.team.at(-1).name}的特色是「${s.business.team.at(-1).trait}」。接單效率加成 ${Math.round(s.business.team.at(-1).efficiency*100)}%，每月薪酬另計。`:'行銷費 $2,000，客源增加。熱度是一時，交付要靠每天。');return true;}
 closeBusiness(){const s=this.s;if(!this.can(1)||s.status!=='business')return false;this.spend();this.pay(s.business.staff*1000);s.business=null;s.status='employed';this.record('business','收起招牌，能力仍然在','你支付員工離職補貼，回到受僱工作。關店不是刪除人生，是保留下一次選擇。');return true;}
 makeMarket(){
  const news=this.int(0,NEWS.length-1),shock=[.04,.02,-.04,0,.05,-.03,0][news],world=(!this.s.world&&this.s.elapsed-(this.s.life?.lastWorld??-24)>=18&&this.roll()<.045)?this.pick(WORLD_EVENTS):null;
  const stock=clamp((this.roll()-.48)*.18+shock+(world?.stock??0),-.8,.5);
  return {news:world?.title??NEWS[news],world:world?structuredClone(world):null,stock,etf:(this.roll()-.46)*.08+shock*.4+(world?.etf??0),crypto:(this.roll()-.5)*.45+shock+(world?.crypto??0),property:(this.roll()-.48)*.025+(world?.property??0),cards:(this.roll()-.5)*.25+(world?.cards??0),derivatives:Math.max(-1,stock*3-.01)};
 }

 research(){if(!this.can(1,8))return false;this.spend(8);const correct=this.roll()<clamp(.35+this.s.stats.iq/240,.5,.93),up=this.s.marketPlan.stock+eraMarketImpact(this.s,'stock')>=0;this.s.signal={up:correct?up:!up,month:this.s.month};this.record('market','功課，不能保證答案',`你研讀模擬市場訊號：下月股票較可能${this.s.signal.up?'上升':'下跌'}。IQ 影響判讀準確度，訊號仍可能出錯。`);return true;}
 invest(id,amount,sell=false){const s=this.s;if(!Object.hasOwn(s.assets,id)||!Number.isFinite(amount)||amount<(sell?100:ASSET_INFO[id].minimum)||!this.can(1,0,sell?0:amount))return false;const value=sell?Math.min(amount,this.assetValue(id)):amount;if(value<.01)return false;this.spend();if(sell){s.assets[id]=Math.max(0,s.assets[id]-(['bank','bonds'].includes(id)?value:value/s.prices[id]));s.cash=money(s.cash+value*(1-ASSET_INFO[id].fee));}else{s.cash=money(s.cash-value);s.assets[id]+=['bank','bonds'].includes(id)?value*(1-ASSET_INFO[id].fee):value*(1-ASSET_INFO[id].fee)/s.prices[id];}this.record('market',sell?'把帳面數字變回現金':'第一桶金，換一種地方長大',`${sell?'賣出／提取':'投入'} ${ASSET_INFO[id].name} $${Math.round(value).toLocaleString('en')}。${['bank','bonds'].includes(id)?'固定回報只屬本局模擬。':'市場會波動，現金流仍要留給日常。'}${ASSET_INFO[id].fee?'每次交易扣 '+Math.round(ASSET_INFO[id].fee*100)+'% 成本。':''}`);return true;}
 gamble(type,stake){const s=this.s,allowed=['lottery','scratch','horse','casino'];if(!allowed.includes(type)||!Number.isFinite(stake))return false;const cost=type==='lottery'?20:type==='scratch'?50:Math.floor(stake);if(cost<20||!this.can(1,0,cost))return false;this.spend();s.cash=money(s.cash-cost);s.metrics.gambles++;const roll=this.roll();let payout=0;
  if(type==='lottery')payout=roll<1/1000000?5000000:roll<.0001?10000:roll<.02?100:0;
  if(type==='scratch')payout=roll<.0005?10000:roll<.012?1000:roll<.12?100:0;
  if(type==='horse')payout=roll<.22?cost*3:0;if(type==='casino')payout=roll<.48?cost*1.9:0;
  s.cash=money(s.cash+payout);s.metrics.gamblingNet=money(s.metrics.gamblingNet+payout-cost);this.changeStats({stress:payout>cost?-15:8});this.record('risk',payout>cost?'這一格，是運氣':'夢想收據，沒有兌現',`${{lottery:'六合彩',scratch:'刮刮樂',horse:'賭馬',casino:'澳門虛擬賭桌'}[type]}：花 $${cost.toLocaleString('en')}，收回 $${Math.round(payout).toLocaleString('en')}。這裡的一切都是遊戲金錢。`);
  if(payout>=2000000)s.pending={id:'windfall',title:'還想上班嗎？',text:'一筆巨款進帳。手機裡的鬧鐘，忽然顯得很吵。',scene:'risk',choices:[{label:'財務自由，但繼續保留生活節奏',effects:{jq:5,stress:-15}},{label:'先躺平一年再說（工作收入降至 35%）',effects:{iq:-3,eq:-3,pq:-3,jq:-3,stress:-25}}]};else if(this.wealth<100&&s.cash<100&&s.elapsed-s.lastBankruptcy>=24){s.metrics.bankruptcies++;s.lastBankruptcy=s.elapsed;s.housing='temporary';s.pending={id:'comeback',title:'輸光的是本金，不是下一章',text:'虛擬牌桌把生活費都帶走了。你需要先找個落腳處，再決定如何重新開始。',scene:'comeback',choices:[{label:'尋求社區支援，重建生活節奏',effects:{cash:3000,stress:-12,jq:2}},{label:'先做臨時工作，背水一戰',effects:{cash:1000,reputation:10,jq:4,stress:5}}]};}return true;
 }
 repay(amount){if(!Number.isFinite(amount)||amount<=0||!this.can(1)||this.s.debt<=0)return false;const n=Math.min(amount,this.s.cash,this.s.debt);if(!n)return false;this.spend();this.s.cash=money(this.s.cash-n);this.s.debt=money(this.s.debt-n);this.record('market','把壓力，還掉一小部分',`償還 $${Math.round(n).toLocaleString('en')} 債務。清零之前，每一步都有重量。`);return true;}
 event(){const s=this.s,workIds=['blame','layoff','credit'],businessIds=['supplier','inventory'];const list=EVENT_DECK.filter(e=>!(s.life.cooldowns[e.id]>s.elapsed)&&(!workIds.includes(e.id)||s.status==='employed')&&(!businessIds.includes(e.id)||s.status==='business'));let original=this.pick(list.length?list:EVENT_DECK.filter(e=>e.id==='community'));if(['blame','layoff','credit','supplier','inventory'].includes(original.id)&&this.roll()<s.stats.jq/150)original=EVENT_DECK.find(e=>e.id==='opportunity');s.pending=structuredClone(original);if(['crush','classgap','reunion'].includes(original.id)){const extrovert=s.profile.mbti[0]==='E';s.pending.choices.push({label:extrovert?'約一班朋友，把話題聊成下一次聚會':'改約安靜的一對一，好好聽對方說',effects:extrovert?{cash:-150,contacts:4,eq:.3,stress:-10}:{contacts:2,eq:.3,stress:-8}});}}
 resolve(index){if(this.s.pending?.id==='vocational-task')return this.resolveVocationalTask(index);if(this.s.pending?.id==='era-event')return this.resolveEra(index);if(this.s.pending?.id==='knowledge-case')return this.resolveKnowledge(index);if(this.s.pending?.id==='occupation-event')return this.resolveOccupationEvent(index);if(this.s.pending?.id==='work-case')return this.resolveWork(index);const s=this.s,e=s.pending,c=e?.choices[index];if(!c)return false;if(e.id==='windfall'&&index===1)s.unmotivatedUntil=s.elapsed+12;if(e.id==='layoff'&&index===1){s.status='apprentice';s.mastery=65;s.level=0;if(s.business){s.business=null;}}this.applyLifeEffects(c.effects);let outcome='';if(c.outcome&&this.roll()<c.outcome.chance){this.applyLifeEffects(c.outcome.effects);outcome=c.outcome.text;}recordDecision(this,e,c,index);s.pending=null;this.record(e.scene??'story',e.title,`${e.text} 你選擇：${c.label}。${outcome}`);completeMind(this,e,c);return true;}
 endMonth(){const s=this.s;if(!this.active)return false;const cashBefore=s.cash,mindSummary=mindMonth(s);const lifeLedger=settleLife(this),businessLedger=settleBusiness(this);
  if(s.world&&--s.world.months<=0)s.world=null;
  if(s.marketPlan.world){s.world=structuredClone(s.marketPlan.world);s.life.lastWorld=s.elapsed;this.record('world',s.world.title,'這是虛構世界事件。市場價格立即受衝擊；未來 '+s.world.months+' 個月收入、生活成本或租金亦會受影響。');}
  for(const id of RISK_ASSETS){const movement=s.marketPlan[id]<=-1?-1:s.marketPlan[id]+eraMarketImpact(s,id);if(movement<=-1){s.assets[id]=0;s.prices[id]=100;}else s.prices[id]=clamp(s.prices[id]*(1+movement),.01,1e7);}
  const rental=money(this.assetValue('property')*.0017*(s.world?.rent??1));this.earn(rental);
  s.assets.bank=money(s.assets.bank*1.002);s.assets.bonds=money(s.assets.bonds*1.003);s.news=s.marketPlan.news;s.marketPlan=this.makeMarket();s.signal=null;
  const living=Math.round(this.livingCost*(s.world?.living??1)),family=s.family.children.filter(age=>age<216).length*3000+(s.family.status===2?800:0),lifestyle=s.status==='travel'?4500:s.status==='overseas'?2500:0,education=s.status==='student'?1800:0,business=s.business?9000+s.business.staff*15400:0;this.earn(s.profile.support);this.pay(living+business+lifestyle+education+family);const eraOperating=eraOperatingCost(s);this.pay(eraOperating);s.debt=money(s.debt*1.015);if(s.cash>=this.livingCost*3)progressGoal(this,'freedom');
  this.changeStats({energy:20+s.stats.health*.2,stress:s.business?3:1,health:s.stats.stress>80?-5:0,pq:s.stats.stress>90?-1:0});
  this.checkHealth();for(const key of ['delay','captivity'])s.risks[key]=Math.max(0,s.risks[key]-1);
  const young=s.family.children.filter(age=>age<36).length;if(young){s.habits.sleep=Math.max(0,s.habits.sleep-young*2);this.changeStats({energy:-young*5,stress:young*2});}
  s.family.children=s.family.children.map(age=>age+1);if(s.family.status>0)s.family.affection=Math.max(0,s.family.affection-2);
  s.month=Math.min(RETIRE_MONTH,s.month+1);s.elapsed++;s.ap=MONTHLY_CHOICES;s.monthWork=0;settleEra(this,true);if(s.business)s.metrics.businessMonths++;
  if(s.housing==='temporary'&&s.cash>living*3&&s.debt<50000)s.housing='stable';
  if(Object.hasOwn(s.lifestyleMonths,s.status))s.lifestyleMonths[s.status]++;
  if(s.status==='student'){s.educationPlan.remaining=Math.max(0,s.educationPlan.remaining-1);if(!s.educationPlan.remaining&&s.educationPlan.credits>=12){s.status='graduate';s.educationPlan=null;this.record('graduate','畢業了，下一站由你選','完成進修課程。你可以繼續進修，也可以挑一份職業，進入學徒階段。');}}
  s.lastLedger={mind:mindSummary,pqChange:s.stats.pq-s.life.monthStart.pq,healthChange:s.stats.health-s.life.monthStart.health,stressChange:s.stats.stress-s.life.monthStart.stress,skillGains:Object.fromEntries(Object.entries(s.skills).map(([k,v])=>[k,v-s.life.monthStart.skills[k]])),...lifeLedger,businessLedger,eraIncome:s.era.monthIncome,totalIncome:s.life.flow.income,totalExpenses:s.life.flow.expenses,fixedIncome:money(s.life.flow.regular+s.profile.support+rental+(businessLedger?.sales??0)+s.era.monthIncome),extraIncome:money(Math.max(0,s.life.flow.income-s.life.flow.regular-s.profile.support-rental-(businessLedger?.sales??0)-s.era.monthIncome)),fixedExpenses:money(living+business+lifestyle+education+family+eraOperating+(businessLedger?.materials??0)+lifeLedger.routineCost+lifeLedger.insurance+s.life.mpf+s.life.tax+Math.round(s.risks.dependence*15)),eraOperating,selfIncome:s.life.selfIncome,gross:s.life.gross,mpf:s.life.mpf,tax:s.life.tax,pension:s.life.pension,living,business,lifestyle,education,family,rental,support:s.profile.support,cashChange:money(s.cash-cashBefore),debt:s.debt};s.life.monthStart=monthSnapshot(s);s.life.flow={income:0,expenses:0,regular:0,regularNet:0};s.life.gross=0;s.life.selfIncome=0;s.life.mpf=0;s.life.tax=0;
  if(s.month>=RETIRE_MONTH){s.status='retired';s.pending=null;this.record('retire','65 歲，這次真的下班了',this.retirement().quote);return true;}
  if(s.debt>100000&&this.wealth<0&&s.cash<living&&s.elapsed-s.lastBankruptcy>=24){s.metrics.bankruptcies++;s.lastBankruptcy=s.elapsed;s.housing='temporary';s.pending={id:'comeback',title:'戶口見底，人生未完',text:'債務和房租追上來了。這一格可以是谷底，也可以是下一章的起點。',scene:'comeback',choices:[{label:'找社區支援，先穩住生活',effects:{cash:5000,stress:-12,jq:2}},{label:'整理技能，背水一戰',effects:{reputation:15,jq:5,stress:5}}]};}
  else if(!dueFollowup(this)){if(this.triggerEraEvent()){}else if(['apprentice','employed','business'].includes(s.status)&&!s.risks.captivity&&!s.risks.delay&&this.roll()<.24)this.triggerOccupationEvent();else if(s.risks.captivity||this.roll()<.2)this.triggerLifeEvent();}
  if(s.elapsed%12===0)this.record('year',`${this.age} 歲，這年的你`,`${LIFE_MODES[s.status]??(s.status==='student'?'進修中':s.status==='graduate'?'畢業待選':this.job?.name??'人生探索')}，淨資產 $${Math.round(this.wealth).toLocaleString('en')}。${s.history.length>1?'轉過的彎，都成了下一段路的工具。':'生活沒有每天放煙花，但你仍在往前。'}`);return true;
 }
 plan(months=12,focus='balanced'){if(!this.active||!['balanced','earn','learn','wellbeing','habits','routine'].includes(focus))return 0;let passed=0;for(let i=0;i<clamp(Math.floor(months)||1,1,12)&&this.active;i++){
  if(this.needsVocationalAssessment())break;
  if(this.s.status==='apprentice'&&this.entryRequirement.regulated&&this.s.mastery>=100&&this.s.life.entry.months>=this.entryRequirement.months&&this.s.life.entry.practice>=this.entryRequirement.practice&&this.s.life.entry.nextAssessment<=this.s.elapsed&&this.s.ap>0){this.qualifyCareer();if(this.s.status==='employed')break;}
  if(focus==='habits')this.configureLife({routine:{exercise:true,diet:true,sleep:true}});
  const actions=this.s.risks.captivity?['support','rest','rest']:this.s.risks.delay?['support','rest','sleep']:focus==='routine'&&['employed','apprentice'].includes(this.s.status)?['hobby','rest','social']:focus==='habits'?['rest','social']:this.s.status==='student'?['study','rest','social']:Object.hasOwn(LIFE_MODES,this.s.status)?(this.s.status==='overseas'?['work','explore','rest']:['explore','rest','social']):this.s.status==='graduate'?['rest','social','rest']:this.s.status==='apprentice'?['study','work','rest']:focus==='earn'?['work','work','rest']:focus==='learn'?['study','work','rest']:focus==='wellbeing'?['rest','social','work']:['work','study','rest'];
  for(const action of actions.slice(0,MONTHLY_CHOICES)){if(!this.active||this.s.ap===0)break;if(action==='work'){if(vocationRecord(this.s)){if(!this.openVocationalTask())this.rest();}else if(!this.work())this.rest();}else if(action==='study'){if(!this.study(this.s.status!=='student'&&this.s.route==='ai'))this.rest();}else if(action==='support')this.support();else if(['exercise','diet','sleep'].includes(action))this.habit(action);else if(action==='hobby')this.meaningfulActivity();else if(action==='explore')this.explore();else this.rest(action==='social');}
  if(this.s.pending)break;while(this.s.ap>0&&this.active)this.rest();if(this.endMonth())passed++;if(this.s.status==='graduate')break;
 }return passed;}
 retirement(){const s=this.s,wealth=this.wealth+s.life.pension,titles=[];if(wealth>=10000000)titles.push('華爾街之狼');if(s.metrics.bankruptcies&&wealth>200000)titles.push('屢敗屢戰的破產總裁');if(s.metrics.switches>=3)titles.push('最強跨界斜槓王');if(s.stats.health>=80&&s.stats.stress<35)titles.push('看破紅塵的釣魚仙人');if(s.metrics.mentorSecrets>=3)titles.push('手藝有傳人的隱世高手');if(s.level===8)titles.push(s.life.track==='specialist'?'把專業做到極致':'帶領團隊的領航者');if(s.life.mind.practices>=12&&s.life.mind.responses>=6)titles.push('懂得停一停，再出發的人');if((s.life.socialClaims?.length??0)>=5)titles.push('跨人生的合作夥伴');if(s.era.metrics.completedCourses>=3)titles.push('跨時代學習者');if(s.era.metrics.finished>=3)titles.push('把熱潮走成經驗的人');if(s.life.hobbyProgress>=24)titles.push('把興趣活成日常的人');if(s.life.careMonths>=24)titles.push('把陪伴放進行程的人');if(s.life.goalProgress[s.life.goal]>=30)titles.push(GOALS[s.life.goal]+'的人生實踐者');if(!titles.length)titles.push(s.stats.contacts>60?'朋友比名片更多的人':'把平凡過成故事的人');
  const first=JOBS.find(j=>j.id===s.history[0]?.id)?.name??'生活',last=this.job?.name??'生活';const route=!s.history.length?'你沒有急著把自己交給一份工作，而是留時間給學習與生活。':s.history[0]?.route==='ai'?'你以為一個好 Prompt 能解決所有事，後來才學會核實答案，也學會聽人說話。':'你從幫師傅買便當開始，最後明白了手藝之外，還有人情。';
  return {titles,wealth:money(wealth),quote:`${s.profile.startAge} 歲時，你選了${first}。${route}${s.metrics.gamblingNet<0?`在運氣上花掉了 $${Math.round(-s.metrics.gamblingNet).toLocaleString('en')}，但人生沒有只剩輸贏。`:s.metrics.gamblingNet>0?'你曾贏過運氣，後來才知道守住節奏也需要本事。':''}${s.metrics.switches?`轉過 ${s.metrics.switches} 次行，你把舊技能帶進${last}的新故事。`:`你把${last}這條路，走成自己的樣子。`}${s.lifestyleMonths.travel?`你用 ${s.lifestyleMonths.travel} 個月看世界。`:''}${s.lifestyleMonths.overseas?`你在異國生活工作了 ${s.lifestyleMonths.overseas} 個月。`:''}${s.lifestyleMonths['early-retired']?`你把 ${s.lifestyleMonths['early-retired']} 個月留給財務自由後的興趣。`:''}${s.family.children.length?`你與 ${s.family.children.length} 個孩子留下共同的生活記憶。`:''}${s.family.status===2?'你也把一段婚姻走進了人生的下半場。':''}${s.healthData.cases?`你曾經歷 ${s.healthData.cases} 次病況，學會了健康需要持續照顧。`:''}${s.risks.scamLoss?`受騙失去的 $${Math.round(s.risks.scamLoss).toLocaleString('en')}，成了重新建立安全感的一課。`:''}${s.profession.completed?`你親手處理過 ${s.profession.completed} 個工作難題，${s.profession.passed} 次交付通過。`:''}${s.life.socialClaims?.length?`你亦把 ${s.life.socialClaims.length} 份玩家合作經驗寫進了這本人生。`:''}你選擇的目標是「${GOALS[s.life.goal]}」，累積 ${Math.round(s.life.goalProgress[s.life.goal])} 次相關投入。退休儲備另有 $${Math.round(s.life.pension).toLocaleString('en')}；興趣實踐 ${s.life.hobbyProgress} 次、陪伴 ${s.life.careMonths} 次。你完成 ${s.era.metrics.completedCourses} 項遊戲專精，走過 ${s.era.metrics.finished} 輪時代企劃，亦有 ${s.era.metrics.paused} 次選擇保留原有節奏。${mindRetirement(s)}65 歲了，存款不是唯一的成績；還肯照顧自己、還有人可以一起吃飯，也是狀元。`};}
 static restore(raw,{copy=true}={}){try{const s=typeof raw==='string'?JSON.parse(raw):copy?structuredClone(raw):raw;if(s?.version!==VERSION||!s.profile||!s.stats||!['setup','apprentice','employed','business','student','graduate',...Object.keys(LIFE_MODES),'retired'].includes(s.status)||!Number.isInteger(s.seed)||!Number.isInteger(s.month)||s.month<18*12||s.month>RETIRE_MONTH||!Number.isInteger(s.ap)||s.ap<0||s.ap>3||s.career!==null&&!JOBS.some(j=>j.id===s.career)||!Array.isArray(s.panels)||s.panels.length>8000||!Array.isArray(s.history)||s.history.length>2000||s.profile.name.length>20||!Number.isFinite(s.cash)||s.cash<0||!Number.isFinite(s.debt)||s.debt<0)return null;
  s.profile.portrait??=(s.panels[0]?.tone??0)%8;if(!Number.isInteger(s.profile.portrait)||s.profile.portrait<0||s.profile.portrait>7)return null;for(const p of s.panels){p.portrait??=s.profile.portrait;if(!Number.isInteger(p.portrait)||p.portrait<0||p.portrait>7)return null;}
  s.ap=Math.min(s.ap,MONTHLY_CHOICES);
  if(!migrateSystems(s)||!restoreLife(s)||!restoreMind(s)||!restoreProfessional(s)||!restoreEra(s)||!restoreBusiness(s)||!restoreVocation(s)||Object.keys(s.life.credentials).some(id=>!JOBS.some(j=>j.id===id))||Object.keys(s.life.arcs).some(id=>!JOBS.some(j=>j.id===id))||s.life.sideJob!==null&&!JOBS.some(j=>j.id===s.life.sideJob))return null;
  for(const key of STAT_KEYS){const max=key==='iq'?170:key==='contacts'?999:key==='reputation'?10000:key==='energy'?120:100;if(!Number.isFinite(s.stats[key])||s.stats[key]<0||s.stats[key]>max)return null;}
  if(!Number.isInteger(s.profile.startAge)||s.profile.startAge<18||s.profile.startAge>26||!MBTI.includes(s.profile.mbti)||!['mentor','ai'].includes(s.route)||!Number.isFinite(s.mastery)||s.mastery<0||s.mastery>100||!Number.isInteger(s.level)||s.level<0||s.level>8||!Number.isInteger(s.elapsed)||s.elapsed!==s.month-s.profile.startAge*12||s.status==='retired'&&s.month!==RETIRE_MONTH||s.month===RETIRE_MONTH&&s.status!=='retired')return null;
  for(const key of ['craft','tech','care','art','people','analysis'])if(!Number.isFinite(s.skills?.[key])||s.skills[key]<0||s.skills[key]>100)return null;
  if(typeof s.profile.name!=='string'||!Number.isFinite(s.salaryFactor)||s.salaryFactor<1||s.salaryFactor>2||!Number.isFinite(s.crossBonus)||s.crossBonus<0||s.crossBonus>.5||!Number.isInteger(s.unmotivatedUntil)||s.unmotivatedUntil<0||!['stable','temporary'].includes(s.housing))return null;
  if(s.panels.some((p,i)=>p.id!==i||typeof p.title!=='string'||typeof p.text!=='string'||p.title.length>300||p.text.length>3000||typeof p.scene!=='string'||!/^[-a-z]+$/.test(p.scene)||!Number.isInteger(p.age)||!Number.isInteger(p.month)||p.month<0||p.month>11))return null;
  if(Object.keys(s.assets).some(k=>!Object.hasOwn(ASSET_INFO,k)))return null;
  if(s.pending?.id==='work-case'&&s.pending.work){const e=s.pending,p=workProfile(JOBS.find(j=>j.id===e.work.career));if(p&&(p.cases[e.work.scenario]?.[0]!==e.work.topic||p.cases[e.work.scenario]?.[2]!==e.work.clue)){const i=p.cases.findIndex(c=>c[0]===e.work.topic&&c[2]===e.work.clue);if(i>=0)e.work.scenario=i;}}
  if(s.pending?.id==='work-case'&&s.pending.work?.pressure===undefined){const job=JOBS.find(j=>j.id===s.pending.work.career),p=workProfile(job),i=p?.cases.findIndex(c=>c[0]===s.pending.work.topic&&c[2]===s.pending.work.clue);if(i>=0){s.pending.work.scenario=i;s.pending.work.pressure='quality';s.pending.choices=makeWorkCase(job,i,()=>0,i).choices;}}
  if(s.pending&&((s.pending.id==='vocational-task'&&!validVocationalTask(s.pending,s))||(s.pending.id==='era-event'&&!validEraEvent(s.pending,s))||!validEvent(s.pending)||['work-case','knowledge-case','occupation-event'].includes(s.pending.id)&&(s.pending.work?.career??s.pending.knowledge?.career??s.pending.careerEvent?.career)!==s.career))return null;
  if(!s.metrics||Object.values(s.metrics).some(v=>!Number.isFinite(v)))return null;
  for(const key of Object.keys(ASSET_INFO))if(!Number.isFinite(s.assets?.[key])||s.assets[key]<0)return null;
  for(const key of RISK_ASSETS)if(!Number.isFinite(s.prices?.[key])||s.prices[key]<=0||!Number.isFinite(s.marketPlan?.[key]))return null;
  if(s.status==='business'&&(!Array.isArray(s.business?.team)||s.business.team.length!==s.business.staff||s.business.team.some(e=>typeof e.name!=='string'||typeof e.trait!=='string'||!Number.isFinite(e.efficiency)||e.efficiency<0||e.efficiency>1)))return null;
  if(['apprentice','employed','business'].includes(s.status)&&!s.career||s.status==='business'&&(!s.business||!Number.isInteger(s.business.staff)||s.business.staff<0||s.business.staff>8)||s.pending&&(!Array.isArray(s.pending.choices)||!s.pending.choices.length||s.pending.choices.length>4))return null;
  s.lifestyleMonths??={travel:0,overseas:0,'early-retired':0,sabbatical:0};
  for(const key of Object.keys(LIFE_MODES))if(!Number.isInteger(s.lifestyleMonths[key])||s.lifestyleMonths[key]<0||s.lifestyleMonths[key]>600)return null;
  s.educationPlan??=null;if(s.status==='student'&&(!s.educationPlan||!Number.isInteger(s.educationPlan.remaining)||s.educationPlan.remaining<0||s.educationPlan.remaining>12||!Number.isInteger(s.educationPlan.credits)||s.educationPlan.credits<0||s.educationPlan.credits>1800))return null;
  const game=Object.create(LifeGame.prototype);game.s=s;return game;
 }catch{return null;}}
}

Object.defineProperties(LifeGame.prototype,Object.getOwnPropertyDescriptors(lifeMethods));
Object.defineProperties(LifeGame.prototype,Object.getOwnPropertyDescriptors(mindMethods));
Object.defineProperties(LifeGame.prototype,Object.getOwnPropertyDescriptors(professionalMethods));
Object.defineProperties(LifeGame.prototype,Object.getOwnPropertyDescriptors(eraMethods));
Object.defineProperties(LifeGame.prototype,Object.getOwnPropertyDescriptors(vocationalMethods));

function validEffects(e){return e&&typeof e==='object'&&!Array.isArray(e)&&Object.entries(e).every(([k,v])=>['cash','mastery',...STAT_KEYS,...EXTRA_EFFECTS].includes(k)&&Number.isFinite(v)&&Math.abs(v)<=1e7);}
function validEvent(e){if(e.id==='knowledge-case'&&!validKnowledgeCase(e,JOBS.find(j=>j.id===e.knowledge?.career)))return false;if(e.id==='occupation-event'&&!validOccupationEvent(e,JOBS.find(j=>j.id===e.careerEvent?.career)))return false;if(e.id==='work-case'){const j=JOBS.find(j=>j.id===e.work?.career),p=workProfile(j);if(e.work?.storyVersion!==undefined&&e.work.storyVersion!==2)return false;if(e.work?.daily!==undefined&&typeof e.work.daily!=='boolean')return false;if(e.work?.pressure!==undefined&&!['quality','people','deadline'].includes(e.work.pressure))return false;if(e.work?.serial!==undefined&&(!e.work.serial||typeof e.work.serial.npc!=='string'||e.work.serial.npc.length>100||typeof e.work.serial.project!=='string'||e.work.serial.project.length>200||!Number.isInteger(e.work.serial.stage)||e.work.serial.stage<0||e.work.serial.stage>2||!Number.isInteger(e.work.serial.cycle)||e.work.serial.cycle<1||e.work.serial.cycle>4000))return false;if(!p||!Number.isInteger(e.work.scenario)||e.work.scenario<0||e.work.scenario>=p.cases.length||e.work.topic!==p.cases[e.work.scenario][0]||e.work.clue!==p.cases[e.work.scenario][2]||!Array.isArray(e.work.requirements)||JSON.stringify(e.work.requirements)!==JSON.stringify(p.requirements)||!Array.isArray(e.choices)||e.choices.length!==3||new Set(e.choices.map(c=>c.approach)).size!==3||e.choices.some(c=>!['check','talk','rush'].includes(c.approach)))return false;}return typeof e.id==='string'&&typeof e.title==='string'&&typeof e.text==='string'&&e.title.length<=300&&e.text.length<=3000&&(!e.scene||/^[-a-z]+$/.test(e.scene))&&Array.isArray(e.choices)&&e.choices.length>0&&e.choices.length<=4&&e.choices.every(c=>typeof c.label==='string'&&c.label.length<=500&&validEffects(c.effects)&&(!c.outcome||Number.isFinite(c.outcome.chance)&&c.outcome.chance>=0&&c.outcome.chance<=1&&typeof c.outcome.text==='string'&&c.outcome.text.length<=1000&&validEffects(c.outcome.effects)));}
function validWorld(w){return w===null||w&&WORLD_EVENTS.some(e=>e.id===w.id)&&typeof w.title==='string'&&w.title.length<=300&&Number.isInteger(w.months)&&w.months>0&&w.months<=12&&['living','income','rent'].every(k=>Number.isFinite(w[k])&&w[k]>=0&&w[k]<=2);}
function migrateSystems(s){
 try{
  s.habits??={exercise:50,diet:55,sleep:55};s.healthData??={illness:null,cases:0,bills:0};s.family??={status:0,affection:50,children:[]};s.risks??={dependence:0,legal:0,delay:0,captivity:0,scamLoss:0};s.world??=null;s.monthWork??=0;s.profession??={completed:0,passed:0,quality:0,counts:{},last:null};
  const profession=s.profession;if(!Number.isInteger(profession.completed)||profession.completed<0||profession.completed>4000||!Number.isInteger(profession.passed)||profession.passed<0||profession.passed>profession.completed||!Number.isFinite(profession.quality)||profession.quality<0||profession.quality>100||!profession.counts||Array.isArray(profession.counts)||Object.entries(profession.counts).some(([k,v])=>!JOBS.some(j=>j.id===k)||!Number.isInteger(v)||v<0||v>4000))return false;
  const last=profession.last;if(last&&(!JOBS.some(j=>j.id===last.career)||typeof last.title!=='string'||last.title.length>200||typeof last.feedback!=='string'||last.feedback.length>2000||!['check','talk','rush'].includes(last.approach)||typeof last.passed!=='boolean'||!Number.isFinite(last.score)||last.score<0||last.score>100||!Number.isFinite(last.adjustment)||Math.abs(last.adjustment)>100000))return false;
  s.transfer??=null;
  for(const k of ['property','cards','derivatives']){s.assets[k]??=0;s.prices[k]??=100;s.marketPlan[k]??=k==='derivatives'?Math.max(-1,s.marketPlan.stock*3-.01):0;}s.marketPlan.world??=null;
  if(!['exercise','diet','sleep'].every(k=>Number.isFinite(s.habits[k])&&s.habits[k]>=0&&s.habits[k]<=100))return false;
  if(!Number.isInteger(s.family.status)||s.family.status<0||s.family.status>2||!Number.isFinite(s.family.affection)||s.family.affection<0||s.family.affection>100||!Array.isArray(s.family.children)||s.family.children.length>4||s.family.children.some(n=>!Number.isInteger(n)||n<0||n>600))return false;
  for(const [key,max]of Object.entries({dependence:100,legal:999,delay:24,captivity:24,scamLoss:2e9}))if(!Number.isFinite(s.risks[key])||s.risks[key]<0||s.risks[key]>max||['legal','delay','captivity'].includes(key)&&!Number.isInteger(s.risks[key]))return false;
  if(!Number.isInteger(s.monthWork)||s.monthWork<0||s.monthWork>3||!validWorld(s.world)||!validWorld(s.marketPlan.world))return false;
  if(s.transfer&&(!['from','to'].every(k=>typeof s.transfer[k]==='string'&&s.transfer[k].length<100)||typeof s.transfer.related!=='boolean'||!Number.isInteger(s.transfer.at)))return false;
  if(!Number.isInteger(s.healthData.cases)||s.healthData.cases<0||s.healthData.cases>600||!Number.isFinite(s.healthData.bills)||s.healthData.bills<0)return false;
  const i=s.healthData.illness;if(i&&(!Number.isInteger(i.months)||i.months<1||i.months>12||typeof i.name!=='string'||i.name.length>100))return false;
  return true;
 }catch{return false;}
}
