import {JOBS,MAJORS,EVENT_DECK} from './content.js';
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
  this.s={version:VERSION,seed:seed>>>0,profile:null,stats:null,month:0,elapsed:0,status:'setup',career:null,route:'mentor',mastery:0,level:0,ap:3,cash:0,debt:0,skills:{craft:0,tech:0,care:0,art:0,people:0,analysis:0},assets:{bank:0,bonds:0,stock:0,etf:0,crypto:0},prices:{stock:100,etf:100,crypto:100},marketPlan:null,news:'人生還未開場，市場先喝杯茶。',signal:null,history:[],panels:[],pending:null,business:null,educationPlan:null,lifestyleMonths:{travel:0,overseas:0,'early-retired':0,sabbatical:0},salaryFactor:1,crossBonus:0,metrics:{earned:0,spent:0,gambles:0,gamblingNet:0,aiErrors:0,mentorSecrets:0,bankruptcies:0,switches:0,promotions:0,work:0,businessMonths:0},lastBankruptcy:-100,lastLedger:null,unmotivatedUntil:0,housing:'stable'};
  const family=this.pick(FAMILY),education=this.pick(EDUCATION),major=this.pick(MAJORS),age=this.int(18,26);
  const profile={name:String(name).trim().slice(0,20)||'未命名主角',gender:this.pick(['女','男','非二元']),startAge:age,height:0,weight:0,blood:this.pick(['A','B','O','AB']),zodiac:this.pick(['白羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚']),family:family[0],support:family[2],education,major:major.name,mbti:this.pick(MBTI)};
  // Average several draws for adult proportions, then derive weight from height and BMI.
  const centre=profile.gender==='男'?174:profile.gender==='女'?162:168;
  profile.height=Math.round(centre+(this.roll()+this.roll()+this.roll()-1.5)*16);
  const bmi=19+(this.roll()+this.roll()+this.roll())/3*10;profile.weight=Math.round(bmi*(profile.height/100)**2*10)/10;
  const stats={iq:this.int(80,145),eq:this.int(30,90),pq:this.int(35,95),jq:this.int(25,85),health:100,stress:12,energy:0,contacts:0,reputation:0};
  Object.assign(this.s,{profile,stats,month:age*12,cash:family[1]});this.s.skills[major.skill]=this.int(8,18);stats.energy=this.energyMax;this.s.marketPlan=this.makeMarket();
  this.record('origin','人生履歷卡',`${age} 歲，${profile.family}，${profile.education}的${profile.major}畢業生。這次，由你決定下一格。`);
 }
 roll(){let t=this.s.seed=(this.s.seed+0x6D2B79F5)>>>0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
 int(a,b){return a+Math.floor(this.roll()*(b-a+1));}pick(a){return a[this.int(0,a.length-1)];}
 get age(){return Math.floor(this.s.month/12);}get ageLabel(){return `${this.age} 歲 ${this.s.month%12} 個月`;}
 get job(){return JOBS.find(j=>j.id===this.s.career)??null;}
 get energyMax(){return Math.round(50+this.s.stats.health*.7);}
 get wealth(){return money(this.s.cash-this.s.debt+Object.keys(this.s.assets).reduce((n,k)=>n+this.assetValue(k),0));}
 get livingCost(){return 2200+Math.floor(this.s.profile.startAge/2)*80;}
 get freedomTarget(){return this.livingCost*12*25;}
 get canWork(){return ['apprentice','employed','business','overseas'].includes(this.s.status);}
 get canStudy(){return ['apprentice','employed','business','student'].includes(this.s.status);}
 get salary(){return Math.round((this.job?.salary??0)*(1+this.s.level*.24)*this.s.salaryFactor*(1+this.s.crossBonus));}
 assetValue(id){return ['bank','bonds'].includes(id)?this.s.assets[id]:this.s.assets[id]*(this.s.prices[id]??0);}
 get active(){return !['setup','retired'].includes(this.s.status)&&!this.s.pending;}
 can(cost=0,energy=0,cash=0){return this.active&&this.s.ap>=cost&&this.s.stats.energy>=energy&&this.s.cash>=cash;}
 record(scene,title,text){const s=this.s;s.panels.push({id:s.panels.length,age:Math.floor(s.month/12),month:s.month%12,scene,title,text,career:this.job?.name??'',cash:Math.round(s.cash),stress:Math.round(s.stats?.stress??0),look:s.profile?.gender??'非二元',tone:this.int(0,3)});}
 pay(amount){amount=Math.max(0,amount);const paid=Math.min(this.s.cash,amount);this.s.cash=money(this.s.cash-paid);this.s.debt=money(this.s.debt+amount-paid);this.s.metrics.spent=money(this.s.metrics.spent+amount);}
 earn(amount){amount=Math.max(0,amount);this.s.cash=money(this.s.cash+amount);this.s.metrics.earned=money(this.s.metrics.earned+amount);}
 changeStats(effects){for(const [k,v]of Object.entries(effects)){if(!Number.isFinite(v))continue;if(k==='cash'){v>=0?this.earn(v):this.pay(-v);}else if(k==='mastery')this.s.mastery=clamp(this.s.mastery+v,0,100);else if(STAT_KEYS.includes(k))this.s.stats[k]=clamp(this.s.stats[k]+(k==='stress'&&v>0?v*(1-this.s.stats.pq/250):v),0,k==='iq'?170:k==='contacts'?999:k==='reputation'?10000:k==='energy'?this.energyMax:100);}this.s.stats.energy=Math.min(this.energyMax,this.s.stats.energy);}
 spend(energy=0){this.s.ap--;this.s.stats.energy=Math.max(0,this.s.stats.energy-energy);}
 enroll(){
  const s=this.s,initial=s.status==='setup';if(s.pending||s.status==='retired'||s.status==='student'||!initial&&!this.can(1,0,6000)||initial&&s.cash<6000)return false;
  if(!initial)this.spend();this.pay(6000);if(s.business){this.pay(s.business.staff*1000);s.business=null;}
  s.status='student';s.educationPlan={remaining:12,credits:0};this.record('study','畢業之後，再讀一章','你選擇一年制進修：入學費 $6,000，每月學費 $1,800；至少完成 12 次課堂練習，修業滿一年後畢業，再選擇繼續進修或進入學徒階段。');return true;
 }
 quit(){
  const s=this.s;if(!['apprentice','employed','business','overseas'].includes(s.status)||!this.can(1))return false;
  this.spend();if(s.business){this.pay(s.business.staff*1000);s.business=null;}s.status='sabbatical';this.record('switch','辭職，為人生留一格空白','你離開目前的工作，保留技能和資產。接下來可以旅行、海外打工，或重新選擇職業；生活費仍會逐月計算。');return true;
 }
 changeLife(mode){
  const s=this.s;if(!Object.hasOwn(LIFE_MODES,mode)||!this.can(1)||s.status==='student')return false;
  if(mode==='early-retired'&&(s.debt>0||this.wealth<this.freedomTarget))return false;
  const cost=mode==='travel'?5000:mode==='overseas'?8000:0;if(s.cash<cost||s.status===mode)return false;
  this.spend();this.pay(cost);if(s.business){this.pay(s.business.staff*1000);s.business=null;}s.status=mode;
  this.record('rest',LIFE_MODES[mode],mode==='travel'?'背起行囊，出發環遊世界。出發費 $5,000，每月旅費另加 $4,500。':mode==='overseas'?'啟程體驗異國生活，做當地短期工作。出發費 $8,000，每月住宿交通另加 $2,500；每次打工賺 $6,000。':mode==='early-retired'?'資產達到 25 年基本生活費且沒有債務，你選擇提早離開職場，做自己想做的事。仍需支付生活費，也可再度工作；人生在 65 歲才結算。':'先放慢腳步，為下一段人生留一點空間。');return true;
 }
 explore(){
  const s=this.s;if(!Object.hasOwn(LIFE_MODES,s.status)||!this.can(1,8))return false;this.spend(8);
  const place=s.status==='travel'?this.pick(['京都小巷','冰島海岸','葡萄牙小鎮','紐西蘭步道']):s.status==='overseas'?this.pick(['異國市集','當地社區廚房','週末語言交換角']):this.pick(['社區畫室','海邊釣魚小屋','義工服務站','一直想學的音樂課']);
  this.changeStats({pq:2,eq:1,stress:-12,contacts:1});this.record('rest','把時間，花在想做的事',`今天走進${place}。沒有升職通知，卻多了一段自己的故事。`);return true;
 }
 chooseCareer(id,route='mentor'){
  const job=JOBS.find(j=>j.id===id),s=this.s;if(!job||!['mentor','ai'].includes(route)||s.status==='retired'||s.pending)return false;
  const initial=s.history.length===0&&['setup','graduate'].includes(s.status);if(!initial&&!this.can(1,0,3000))return false;
  const previous=this.job;if(!initial){this.pay(3000);s.ap--;s.metrics.switches++;}
  if(s.business){this.pay(s.business.staff*1000);s.business=null;}
  const plumbing=previous?.name==='水電工'&&job.name==='YouTuber';s.crossBonus=Math.min(.5,s.history.length*.025+(plumbing?.25:0));
  s.educationPlan=null;s.history.push({id,age:this.age,route});s.career=id;s.route=route;s.status='apprentice';s.mastery=Math.min(55,s.skills[job.skill]*.45);s.level=0;s.salaryFactor=1;
  this.record(initial?'start':'switch',initial?'第一份職業，第一格冒險':plumbing?'水管維修，也能拍出流量':'人生可以重新選科',`${previous?previous.name+' → ':''}${job.name}。${route==='mentor'?'拜師學藝，從掃地和買便當開始。':'打開 AI 模擬教室，先學會提問，也要學會驗證。'}${plumbing?'修水管的經驗變成搞笑維修頻道，跨界收入加成 25%。':''}`);return true;
 }
 study(verify=false){
  const s=this.s;if(!this.canStudy||!this.can(1,14,verify?300:0))return false;this.spend(14);if(verify)this.pay(300);
  if(s.status==='student'){s.educationPlan.credits++;this.changeStats({iq:.5,jq:.5,pq:.5,stress:3});const skill=MAJORS.find(m=>m.name===s.profile.major)?.skill??'analysis';s.skills[skill]=clamp(s.skills[skill]+2,0,100);this.record('study','課堂之外，也認識自己','進修讓專業累積，也替未來多開一扇窗。完成課堂 '+s.educationPlan.credits+' / 12 次。');return true;}
  const gain=(s.route==='mentor'?11:22)+s.stats.iq*.07+(verify?2:0);s.skills[this.job.skill]=clamp(s.skills[this.job.skill]+gain*.35,0,100);
  if(s.route==='mentor'){this.changeStats({eq:1.5,jq:1.8,contacts:1,stress:3});if(this.roll()<.09){s.metrics.mentorSecrets++;s.mastery=clamp(s.mastery+12,0,100);this.record('mentor','師傅沒有寫進課本的那一招','你留下來收拾工作間，師傅把壓箱底的手藝教給你。技能和人脈一起留下來。');}}
  else this.changeStats({iq:.5,eq:-.4,stress:5,jq:verify?1.5:0});
  if(s.status==='apprentice'){s.mastery=clamp(s.mastery+gain,0,100);if(s.mastery>=100){s.status='employed';s.level=1;if(s.route==='mentor')this.changeStats({contacts:5,eq:2,jq:2});this.record('graduate','今天，輪到你獨當一面',`你完成${this.job.name}學徒期。${s.route==='mentor'?'師傅交給你的不只有工具，還有客人的電話。':'知識跑得很快；下一課，是與真實的人一起工作。'}`);}}
  if(s.route==='ai'&&!verify&&this.roll()<.2*(1-s.stats.jq/200)){s.metrics.aiErrors++;s.pending={id:'ai-hallucination',title:'AI 很有信心，但那一步錯了',text:`模擬教室的${this.job.name}答案看起來十分流暢。你在實作前，發現關鍵步驟對不上。`,scene:'ai',choices:[{label:'花 $800 請業內前輩覆核',effects:{cash:-800,jq:4,contacts:1,stress:-4}},{label:'承認失誤，重做基礎練習',effects:{mastery:-12,stress:8,jq:2}}]};}
  if(s.ap===2)this.record(s.route==='ai'?'ai':'mentor',verify?'先查證，才算學懂':s.route==='ai'?'今天的老師，是一個輸入框':'由小事學起',`${this.job.routine}。${verify?'你比對資料並做小型測試，這次沒有把流暢當成正確。':'專業能力慢慢增加，人生沒有白做的練習。'}`);return true;
 }
 work(overtime=false){
  const s=this.s;if(!this.canWork||!this.can(1,overtime?0:18))return false;this.spend(overtime?40:18);s.metrics.work++;
  if(s.status==='overseas'){this.earn(overtime?8500:6000);this.changeStats({eq:1,jq:1,stress:overtime?15:5,health:overtime&&s.stats.energy===0?-18:0});this.record('work','在異國，也學會好好生活','你完成當地的一班短期工作，練習語言與新的工作文化。這一站是遊戲內的海外生活體驗。');return true;}
  const apprentice=s.status==='apprentice',base=apprentice?(s.route==='mentor'?650:1100):this.salary/3;
  const business=s.status==='business'?1.1+(s.business.customers*.025)+(s.business.team?.reduce((sum,e)=>sum+e.efficiency,0)??s.business.staff*.18):1;const income=Math.round(base*business*(overtime?1.65:1)*(s.elapsed<s.unmotivatedUntil?.35:1));this.earn(income);this.changeStats({stress:overtime?15:6,reputation:apprentice?2:6,jq:.35,pq:overtime?-1.5:0});s.skills[this.job.skill]=clamp(s.skills[this.job.skill]+1,0,100);
  if(overtime&&s.stats.energy===0){this.changeStats({health:-18,stress:12,pq:-2});this.pay(1800);this.record('medical','身體按下了暫停鍵','加班把精力耗盡，診金 $1,800。今天的收入不是全部的代價；休息也算一種前進。');}
  if(!apprentice&&s.status!=='business'&&s.level<8&&s.stats.reputation>=s.level*s.level*45){s.level++;s.metrics.promotions++;this.record('promotion',s.level===8?'由學徒，走到 CEO':'升職通知，真的不是畫餅',`你成為${this.job.name}職涯的第 ${s.level} 級骨幹。每次工作的收入提升，壓力也有了新的名字。`);}
  else if(s.metrics.work%6===1)this.record('work',apprentice?'學徒的便當與第一筆收入':'今天也有把事情做好',`${this.job.name}的一天：${this.job.routine}。這次賺了 $${income.toLocaleString('en')}。`);
  if(!s.pending&&this.roll()<.13)this.event();return true;
 }
 rest(social=false){const s=this.s;if(!this.can(1,social?8:0,social?120:0))return false;this.spend(social?8:0);const extrovert=s.profile.mbti[0]==='E';if(social){this.pay(120);this.changeStats({contacts:3,eq:1.5,stress:extrovert?-22:-8,energy:8,pq:1});}else this.changeStats({health:8,stress:extrovert?-13:-23,energy:40,pq:1.5});if(s.stats.stress<10&&s.elapsed%6===0)this.record('rest','人生不只有生產力',social?'你買了一輪飲料，聽見別人的故事。人脈不是名片，是下次還想再見。':'你關掉通知，給自己一個安靜的下午。沒有升職，但呼吸順了。');return true;}
 negotiate(){if(!this.can(1,8)||this.s.status!=='employed')return false;this.spend(8);const success=this.roll()<.25+this.s.stats.eq/200+Math.min(.2,this.s.stats.reputation/500);if(success){this.s.salaryFactor=Math.min(2,this.s.salaryFactor+.08);this.changeStats({stress:-4,eq:1});}else this.changeStats({stress:7,jq:1});this.record('promotion',success?'這次，薪水跟上了努力':'主管說「下次一定」',success?'你帶著實績和清楚的提案談成加薪。單次工作收入增加。':'你沒有把承諾當成現金。先記下成果，再找下一個談判時機。');return true;}
 startBusiness(){const s=this.s;if(!this.can(1,12,40000)||s.status!=='employed')return false;this.spend(12);this.pay(40000);s.status='business';s.business={staff:0,customers:8,team:[]};this.record('business','招牌掛上去，你成了老闆',`你用 $40,000 開始${this.job.name}事業。每月店租 $9,000；每名員工月薪 $6,500。先顧現金流，再談夢想。`);return true;}
 businessAction(type){const s=this.s,cost=type==='hire'?3000:2000;if(!this.can(1,10,cost)||s.status!=='business'||!['hire','market'].includes(type)||type==='hire'&&s.business.staff>=8)return false;this.spend(10);this.pay(cost);if(type==='hire'){s.business.staff++;const person=this.pick([{trait:'默默修好所有東西',efficiency:.28},{trait:'先開會，再開會議的會議',efficiency:.1},{trait:'會替辦公室貓咪打卡',efficiency:.16},{trait:'細心核對每一張收據',efficiency:.22}]);(s.business.team??=[]).push({name:'夥伴 '+s.business.staff,...person});this.changeStats({eq:1,stress:4});}else{s.business.customers+=3;this.changeStats({reputation:3,stress:3});}this.record('business',type==='hire'?'團隊，多了一個名字':'讓更多人知道你的招牌',type==='hire'?`招聘費 $3,000；${s.business.team.at(-1).name}的特色是「${s.business.team.at(-1).trait}」。接單效率加成 ${Math.round(s.business.team.at(-1).efficiency*100)}%，每月薪酬另計。`:'行銷費 $2,000，客源增加。熱度是一時，交付要靠每天。');return true;}
 closeBusiness(){const s=this.s;if(!this.can(1)||s.status!=='business')return false;this.spend();this.pay(s.business.staff*1000);s.business=null;s.status='employed';this.record('business','收起招牌，能力仍然在','你支付員工離職補貼，回到受僱工作。關店不是刪除人生，是保留下一次選擇。');return true;}
 makeMarket(){const news=this.int(0,NEWS.length-1),shock=[.04,.02,-.04,0,.05,-.03,0][news];return {news:NEWS[news],stock:(this.roll()-.48)*.18+shock,etf:(this.roll()-.46)*.08+shock*.4,crypto:(this.roll()-.5)*.45+shock};}
 research(){if(!this.can(1,8))return false;this.spend(8);const correct=this.roll()<clamp(.35+this.s.stats.iq/240,.5,.93),up=this.s.marketPlan.stock>=0;this.s.signal={up:correct?up:!up,month:this.s.month};this.record('market','功課，不能保證答案',`你研讀模擬市場訊號：下月股票較可能${this.s.signal.up?'上升':'下跌'}。IQ 影響判讀準確度，訊號仍可能出錯。`);return true;}
 invest(id,amount,sell=false){const s=this.s;if(!Object.hasOwn(s.assets,id)||!Number.isFinite(amount)||amount<100||!this.can(1,0,sell?0:amount))return false;const value=sell?Math.min(amount,this.assetValue(id)):amount;if(value<.01)return false;this.spend();if(sell){s.assets[id]=Math.max(0,s.assets[id]-(['bank','bonds'].includes(id)?value:value/s.prices[id]));s.cash=money(s.cash+value);}else{s.cash=money(s.cash-value);s.assets[id]+=['bank','bonds'].includes(id)?value:value/s.prices[id];}this.record('market',sell?'把帳面數字變回現金':'第一桶金，換一種地方長大',`${sell?'賣出／提取':'投入'} ${id.toUpperCase()} $${Math.round(value).toLocaleString('en')}。${['bank','bonds'].includes(id)?'固定回報只屬本局模擬。':'市場會波動，現金流仍要留給日常。'}`);return true;}
 gamble(type,stake){const s=this.s,allowed=['lottery','scratch','horse','casino'];if(!allowed.includes(type)||!Number.isFinite(stake))return false;const cost=type==='lottery'?20:type==='scratch'?50:Math.floor(stake);if(cost<20||!this.can(1,0,cost))return false;this.spend();s.cash=money(s.cash-cost);s.metrics.gambles++;const roll=this.roll();let payout=0;
  if(type==='lottery')payout=roll<1/5000?5000000:roll<.03?100:0;
  if(type==='scratch')payout=roll<.0005?10000:roll<.012?1000:roll<.12?100:0;
  if(type==='horse')payout=roll<.22?cost*3:0;if(type==='casino')payout=roll<.48?cost*1.9:0;
  s.cash=money(s.cash+payout);s.metrics.gamblingNet=money(s.metrics.gamblingNet+payout-cost);this.changeStats({stress:payout>cost?-15:8});this.record('risk',payout>cost?'這一格，是運氣':'夢想收據，沒有兌現',`${{lottery:'六合彩',scratch:'刮刮樂',horse:'賭馬',casino:'澳門虛擬賭桌'}[type]}：花 $${cost.toLocaleString('en')}，收回 $${Math.round(payout).toLocaleString('en')}。這裡的一切都是遊戲金錢。`);
  if(payout>=2000000)s.pending={id:'windfall',title:'還想上班嗎？',text:'一筆巨款進帳。手機裡的鬧鐘，忽然顯得很吵。',scene:'risk',choices:[{label:'財務自由，但繼續保留生活節奏',effects:{jq:5,stress:-15}},{label:'先躺平一年再說（工作收入降至 35%）',effects:{iq:-3,eq:-3,pq:-3,jq:-3,stress:-25}}]};else if(this.wealth<100&&s.cash<100&&s.elapsed-s.lastBankruptcy>=24){s.metrics.bankruptcies++;s.lastBankruptcy=s.elapsed;s.housing='temporary';s.pending={id:'comeback',title:'輸光的是本金，不是下一章',text:'虛擬牌桌把生活費都帶走了。你需要先找個落腳處，再決定如何重新開始。',scene:'comeback',choices:[{label:'尋求社區支援，重建生活節奏',effects:{cash:3000,stress:-12,jq:2}},{label:'先做臨時工作，背水一戰',effects:{cash:1000,reputation:10,jq:4,stress:5}}]};}return true;
 }
 repay(amount){if(!Number.isFinite(amount)||amount<=0||!this.can(1)||this.s.debt<=0)return false;const n=Math.min(amount,this.s.cash,this.s.debt);if(!n)return false;this.spend();this.s.cash=money(this.s.cash-n);this.s.debt=money(this.s.debt-n);this.record('market','把壓力，還掉一小部分',`償還 $${Math.round(n).toLocaleString('en')} 債務。清零之前，每一步都有重量。`);return true;}
 event(){let original=this.pick(EVENT_DECK);if(original.id==='layoff'&&this.s.status!=='employed')original=EVENT_DECK.find(e=>e.id==='community');if(['blame','layoff','credit','supplier','inventory'].includes(original.id)&&this.roll()<this.s.stats.jq/150)original=EVENT_DECK.find(e=>e.id==='opportunity');this.s.pending=structuredClone(original);if(['crush','classgap','reunion'].includes(original.id)){const extrovert=this.s.profile.mbti[0]==='E';this.s.pending.choices.push({label:extrovert?'約一班朋友，把話題聊成下一次聚會':'改約安靜的一對一，好好聽對方說',effects:extrovert?{cash:-150,contacts:4,eq:2,stress:-10}:{contacts:2,eq:2,stress:-8}});}}
 resolve(index){const s=this.s,e=s.pending,c=e?.choices[index];if(!c)return false;if(e.id==='windfall'&&index===1)s.unmotivatedUntil=s.elapsed+12;if(e.id==='layoff'&&index===1){s.status='apprentice';s.mastery=65;s.level=0;if(s.business){s.business=null;}}this.changeStats(c.effects);s.pending=null;this.record(e.scene??'story',e.title,`${e.text} 你選擇：${c.label}。`);return true;}
 endMonth(){const s=this.s;if(!this.active)return false;const cashBefore=s.cash;
  for(const id of ['stock','etf','crypto'])s.prices[id]=clamp(s.prices[id]*(1+s.marketPlan[id]),.01,1e7);
  s.assets.bank=money(s.assets.bank*1.002);s.assets.bonds=money(s.assets.bonds*1.003);s.news=s.marketPlan.news;s.marketPlan=this.makeMarket();s.signal=null;
  const living=this.livingCost,lifestyle=s.status==='travel'?4500:s.status==='overseas'?2500:0,education=s.status==='student'?1800:0,business=s.business?9000+s.business.staff*6500:0;this.earn(s.profile.support);this.pay(living+business+lifestyle+education);s.debt=money(s.debt*1.015);
  this.changeStats({energy:20+s.stats.health*.2,stress:s.business?3:1,health:s.stats.stress>80?-8:2,pq:s.stats.stress>90?-1:0});
  if(s.stats.health<25){this.pay(6000);this.changeStats({health:30,energy:40,stress:-15,pq:-2});this.record('medical','先照顧這副身體','低健康讓你住院休養，醫療費 $6,000。沒有人能把生命當成無限加班券。');}
  s.month=Math.min(RETIRE_MONTH,s.month+1);s.elapsed++;s.ap=3;if(s.business)s.metrics.businessMonths++;
  if(s.housing==='temporary'&&s.cash>living*3&&s.debt<50000)s.housing='stable';
  if(Object.hasOwn(s.lifestyleMonths,s.status))s.lifestyleMonths[s.status]++;
  if(s.status==='student'){s.educationPlan.remaining=Math.max(0,s.educationPlan.remaining-1);if(!s.educationPlan.remaining&&s.educationPlan.credits>=12){s.status='graduate';s.educationPlan=null;this.record('graduate','畢業了，下一站由你選','完成進修課程。你可以繼續進修，也可以挑一份職業，進入學徒階段。');}}
  s.lastLedger={living,business,lifestyle,education,support:s.profile.support,cashChange:money(s.cash-cashBefore),debt:s.debt};
  if(s.month>=RETIRE_MONTH){s.status='retired';s.pending=null;this.record('retire','65 歲，這次真的下班了',this.retirement().quote);return true;}
  if(s.debt>100000&&this.wealth<0&&s.cash<living&&s.elapsed-s.lastBankruptcy>=24){s.metrics.bankruptcies++;s.lastBankruptcy=s.elapsed;s.housing='temporary';s.pending={id:'comeback',title:'戶口見底，人生未完',text:'債務和房租追上來了。這一格可以是谷底，也可以是下一章的起點。',scene:'comeback',choices:[{label:'找社區支援，先穩住生活',effects:{cash:5000,stress:-12,jq:2}},{label:'整理技能，背水一戰',effects:{reputation:15,jq:5,stress:5}}]};}
  else if(s.elapsed%12===0)this.record('year',`${this.age} 歲，這年的你`,`${LIFE_MODES[s.status]??(s.status==='student'?'進修中':s.status==='graduate'?'畢業待選':this.job?.name??'人生探索')}，淨資產 $${Math.round(this.wealth).toLocaleString('en')}。${s.history.length>1?'轉過的彎，都成了下一段路的工具。':'生活沒有每天放煙花，但你仍在往前。'}`);return true;
 }
 plan(months=12,focus='balanced'){if(!this.active||!['balanced','earn','learn','wellbeing'].includes(focus))return 0;let passed=0;for(let i=0;i<clamp(Math.floor(months)||1,1,12)&&this.active;i++){
  const actions=this.s.status==='student'?['study','rest','social']:Object.hasOwn(LIFE_MODES,this.s.status)?(this.s.status==='overseas'?['work','explore','rest']:['explore','rest','social']):this.s.status==='graduate'?['rest','social','rest']:this.s.status==='apprentice'?['study','work','rest']:focus==='earn'?['work','work','rest']:focus==='learn'?['study','work','rest']:focus==='wellbeing'?['rest','social','work']:['work','study','rest'];
  for(const action of actions){if(!this.active)break;if(action==='work'){if(!this.work())this.rest();}else if(action==='study'){if(!this.study(this.s.status!=='student'&&this.s.route==='ai'))this.rest();}else if(action==='explore')this.explore();else this.rest(action==='social');}
  if(this.s.pending)break;if(this.endMonth())passed++;if(this.s.status==='graduate')break;
 }return passed;}
 retirement(){const s=this.s,wealth=this.wealth,titles=[];if(wealth>=10000000)titles.push('華爾街之狼');if(s.metrics.bankruptcies&&wealth>200000)titles.push('屢敗屢戰的破產總裁');if(s.history.length>=4)titles.push('最強跨界斜槓王');if(s.stats.health>=80&&s.stats.stress<35)titles.push('看破紅塵的釣魚仙人');if(s.metrics.mentorSecrets>=3)titles.push('手藝有傳人的隱世高手');if(s.level===8)titles.push('由掃地做到 CEO');if(!titles.length)titles.push(s.stats.contacts>60?'朋友比名片更多的人':'把平凡過成故事的人');
  const first=JOBS.find(j=>j.id===s.history[0]?.id)?.name??'生活',last=this.job?.name??'生活';const route=!s.history.length?'你沒有急著把自己交給一份工作，而是留時間給學習與生活。':s.history[0]?.route==='ai'?'你以為一個好 Prompt 能解決所有事，後來才學會核實答案，也學會聽人說話。':'你從幫師傅買便當開始，最後明白了手藝之外，還有人情。';
  return {titles,wealth:money(wealth),quote:`${s.profile.startAge} 歲時，你選了${first}。${route}${s.metrics.gamblingNet<0?`在運氣上花掉了 $${Math.round(-s.metrics.gamblingNet).toLocaleString('en')}，但人生沒有只剩輸贏。`:s.metrics.gamblingNet>0?'你曾贏過運氣，後來才知道守住節奏也需要本事。':''}${s.metrics.switches?`轉過 ${s.metrics.switches} 次行，你把舊技能帶進${last}的新故事。`:`你把${last}這條路，走成自己的樣子。`}${s.lifestyleMonths.travel?`你用 ${s.lifestyleMonths.travel} 個月看世界。`:''}${s.lifestyleMonths.overseas?`你在異國生活工作了 ${s.lifestyleMonths.overseas} 個月。`:''}${s.lifestyleMonths['early-retired']?`你把 ${s.lifestyleMonths['early-retired']} 個月留給財務自由後的興趣。`:''}65 歲了，存款不是唯一的成績；還肯照顧自己、還有人可以一起吃飯，也是狀元。`};}
 static restore(raw){try{const s=typeof raw==='string'?JSON.parse(raw):structuredClone(raw);if(s?.version!==VERSION||!s.profile||!s.stats||!['setup','apprentice','employed','business','student','graduate',...Object.keys(LIFE_MODES),'retired'].includes(s.status)||!Number.isInteger(s.seed)||!Number.isInteger(s.month)||s.month<18*12||s.month>RETIRE_MONTH||!Number.isInteger(s.ap)||s.ap<0||s.ap>3||s.career!==null&&!JOBS.some(j=>j.id===s.career)||!Array.isArray(s.panels)||s.panels.length>8000||!Array.isArray(s.history)||s.history.length>2000||s.profile.name.length>20||!Number.isFinite(s.cash)||s.cash<0||!Number.isFinite(s.debt)||s.debt<0)return null;
  for(const key of STAT_KEYS){const max=key==='iq'?170:key==='contacts'?999:key==='reputation'?10000:key==='energy'?120:100;if(!Number.isFinite(s.stats[key])||s.stats[key]<0||s.stats[key]>max)return null;}
  if(!Number.isInteger(s.profile.startAge)||s.profile.startAge<18||s.profile.startAge>26||!MBTI.includes(s.profile.mbti)||!['mentor','ai'].includes(s.route)||!Number.isFinite(s.mastery)||s.mastery<0||s.mastery>100||!Number.isInteger(s.level)||s.level<0||s.level>8||!Number.isInteger(s.elapsed)||s.elapsed!==s.month-s.profile.startAge*12||s.status==='retired'&&s.month!==RETIRE_MONTH||s.month===RETIRE_MONTH&&s.status!=='retired')return null;
  for(const key of ['craft','tech','care','art','people','analysis'])if(!Number.isFinite(s.skills?.[key])||s.skills[key]<0||s.skills[key]>100)return null;
  if(typeof s.profile.name!=='string'||!Number.isFinite(s.salaryFactor)||s.salaryFactor<1||s.salaryFactor>2||!Number.isFinite(s.crossBonus)||s.crossBonus<0||s.crossBonus>.5||!Number.isInteger(s.unmotivatedUntil)||s.unmotivatedUntil<0||!['stable','temporary'].includes(s.housing))return null;
  if(s.panels.some((p,i)=>p.id!==i||typeof p.title!=='string'||typeof p.text!=='string'||p.title.length>300||p.text.length>3000||typeof p.scene!=='string'||!/^[-a-z]+$/.test(p.scene)||!Number.isInteger(p.age)||!Number.isInteger(p.month)||p.month<0||p.month>11))return null;
  if(Object.keys(s.assets).some(k=>!['bank','bonds','stock','etf','crypto'].includes(k)))return null;
  if(s.pending&&(typeof s.pending.title!=='string'||typeof s.pending.text!=='string'||s.pending.choices.some(c=>typeof c.label!=='string'||!c.effects||Object.entries(c.effects).some(([k,v])=>!['cash','mastery',...STAT_KEYS].includes(k)||!Number.isFinite(v)||Math.abs(v)>1e7))))return null;
  if(!s.metrics||Object.values(s.metrics).some(v=>!Number.isFinite(v)))return null;
  for(const key of ['bank','bonds','stock','etf','crypto'])if(!Number.isFinite(s.assets?.[key])||s.assets[key]<0)return null;
  for(const key of ['stock','etf','crypto'])if(!Number.isFinite(s.prices?.[key])||s.prices[key]<=0||!Number.isFinite(s.marketPlan?.[key]))return null;
  if(s.status==='business'&&(!Array.isArray(s.business?.team)||s.business.team.length!==s.business.staff||s.business.team.some(e=>typeof e.name!=='string'||typeof e.trait!=='string'||!Number.isFinite(e.efficiency)||e.efficiency<0||e.efficiency>1)))return null;
  if(['apprentice','employed','business'].includes(s.status)&&!s.career||s.status==='business'&&(!s.business||!Number.isInteger(s.business.staff)||s.business.staff<0||s.business.staff>8)||s.pending&&(!Array.isArray(s.pending.choices)||!s.pending.choices.length||s.pending.choices.length>4))return null;
  s.lifestyleMonths??={travel:0,overseas:0,'early-retired':0,sabbatical:0};
  for(const key of Object.keys(LIFE_MODES))if(!Number.isInteger(s.lifestyleMonths[key])||s.lifestyleMonths[key]<0||s.lifestyleMonths[key]>600)return null;
  s.educationPlan??=null;if(s.status==='student'&&(!s.educationPlan||!Number.isInteger(s.educationPlan.remaining)||s.educationPlan.remaining<0||s.educationPlan.remaining>12||!Number.isInteger(s.educationPlan.credits)||s.educationPlan.credits<0||s.educationPlan.credits>1800))return null;
  const game=Object.create(LifeGame.prototype);game.s=s;return game;
 }catch{return null;}}
}
