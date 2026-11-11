// Career-only orchestration; the copied core supplies validated skills and task systems.
import {LifeGame as Core,clamp,RETIRE_MONTH} from './legacy-core.js';
import {payWage} from './life-design.js';
import {TOPICS,topicFor} from './workplace-topics.js';
import {monthSnapshot} from './monthly-play.js';
export {SAVE_KEY,VERSION,RETIRE_MONTH,clamp,LIFE_MODES} from './legacy-core.js';
export class DreamCareerGame extends Core {
 constructor(options={}){super(options);this.s.dreamCareer={version:1,topicMonth:-1,topicHistory:[],followup:null,tactic:null};this.s.cash=18000;this.s.profile.support=0;this.s.panels=[];this.record('origin','一張工作證，無數種可能',`${this.s.profile.startAge}歲出發。從學徒的第一次實作，到能獨立解難；工作不是只有職稱和薪水。`);}
 get livingCost(){return Math.round(4000*1.02**Math.floor(this.s.elapsed/12));}
 get currentTopic(){return topicFor(this);}
 chooseCareer(id,route='mentor'){if(!super.chooseCareer(id,route))return false;this.enableVocationalCourse();this.s.dreamCareer.tactic=null;return true;}
 // A verified drill never creates an unrelated AI/life event.
 study(){return super.study(true);}
 rest(social=false){if(!this.can(1,0,social?120:0))return false;this.spend(0);if(social)this.pay(120);this.changeStats({energy:social?24:45,stress:social?-12:-20,pq:.4,...(social?{eq:.5,contacts:1}:{})});this.record(social?'mentor':'rest',social?'茶水間的五分鐘':'今天準時下班',social?'同事分享一次返工的經驗：先問清楚驗收要求，再承諾時程。':'暫停接新工單，整理工作邊界。休整恢復精力，並不抹掉未完成的技能要求。');return true;}
 chooseTactic(id){if(!this.can(0)||!['checklist','buddy','scope'].includes(id)||!this.job)return false;const d=this.s.dreamCareer;if(d.tactic?.month===this.s.month)return false;d.tactic={id,month:this.s.month};return true;}
 openStoryTask(...args){if(!super.openStoryTask(...args))return false;const m=this.s.pending.vocation,t=this.s.dreamCareer.tactic;
  if(t?.month===this.s.month&&!t.used){const n=this.s.life.vocation.jobs[this.s.career].narrative,previous=n?.spec;if(n&&t.id!=='scope'){n.spec=t.id==='checklist'?'craft':'people';if(t.id==='buddy')n.favor=Math.min(3,n.favor+1);super.interactStoryStation(t.id==='checklist'?'tool':'assist');n.spec=previous;}t.used=true;}return true;}
 resolve(index){const task=this.s.pending?.id==='vocational-task',ok=super.resolve(index);if(ok&&task){const t=this.s.dreamCareer.tactic;if(t?.month===this.s.month&&t.id==='scope'&&!t.settled){this.changeStats({energy:6});t.settled=true;this.record('work','把承諾縮到能負責的範圍','本月首次交付後保留6精力處理追問；原任務的必要核對、成本和評核不變。');}}return ok;}
 handleTopic(index){const d=this.s.dreamCareer,t=this.currentTopic,c=t?.choices[index];if(!this.job||!c||d.topicMonth===this.s.month||!this.can(1,c.energy,c.cost))return false;this.spend(c.energy);this.pay(c.cost);this.changeStats(c.effects);d.topicMonth=this.s.month;d.topicHistory.push({id:t.id,choice:index,month:this.s.month,career:this.s.career});d.topicHistory=d.topicHistory.slice(-80);d.followup={id:t.id,choice:index,due:this.s.month+1};this.record('work',t.title,`${this.job.name}：${c.label}。${c.result}`);return true;}
 endMonth(){const s=this.s;if(!this.active||!this.job)return false;const l=s.life,before=s.cash;
  if(s.monthWork===0)payWage(this,s.status==='apprentice'?this.apprenticeSalary:this.salary);
  this.pay(this.livingCost);l.entry.months++;l.careerMonths++;
  this.changeStats({energy:48,stress:-5,health:s.stats.stress>85?-2:1});this.graduateCareer();
  if(s.status==='employed'&&l.careerMonths%18===0&&s.level<8&&this.vocationalPromotionReady()){s.level++;s.metrics.promotions++;this.record('promotion','實績換來新的責任',`${this.job.name}晉升為${this.rankName}；參考月薪調整至$${this.salary}。帶人與覆核的要求也會提高。`);}
  s.lastLedger={totalIncome:l.flow.income,totalExpenses:l.flow.expenses,gross:l.gross,mpf:l.mpf,tax:l.tax,living:this.livingCost,cashChange:s.cash-before};l.flow={income:0,expenses:0,regular:0,regularNet:0};l.gross=0;l.selfIncome=0;l.mpf=0;l.tax=0;
  s.month=Math.min(RETIRE_MONTH,s.month+1);s.elapsed++;s.ap=2;s.monthWork=0;s.dreamCareer.tactic=null;
  const f=s.dreamCareer.followup;if(f&&f.due<=s.month){const t=TOPICS.find(t=>t.id===f.id);s.lastLedger.followup={title:t.title,text:t.choices[f.choice].followup};this.record('work','上次的決定，這次有回音',t.choices[f.choice].followup);s.dreamCareer.followup=null;}
  l.monthStart=monthSnapshot(s);
  if(s.month===RETIRE_MONTH){s.status='retired';s.pending=null;this.record('retire','65歲，最後一次打卡',this.retirement().quote);}return true;
 }
 plan(months=1){let n=0;for(let i=0;i<clamp(Math.floor(months)||1,1,12)&&this.active;i++){if(this.needsVocationalAssessment())break;while(this.s.ap>0&&this.active){if(this.s.ap===2&&!this.study())this.rest();else if(this.s.ap>0)this.rest();}if(this.endMonth())n++;if(this.s.status==='retired')break;}return n;}
 retirement(){const s=this.s,titles=[s.metrics.switches>=3?'跨界解難人':s.level>=5?'把手藝磨成專業':'一路學，一路成長'];if(s.profession.passed>=20)titles.push('可靠的交付夥伴');return {titles,wealth:this.wealth+s.life.pension,quote:`${s.profile.startAge}歲開始，你體驗了${new Set(s.history.map(h=>h.id)).size}種職業，親手處理${s.profession.completed}次職場難題，${s.profession.passed}次交付通過，轉職${s.metrics.switches}次。那些追問、返工和同事的提醒，都變成下次判斷的依據。65歲退休，留下的不只是職稱，還有知道自己能做甚麼、何時需要求助的能力。`};}
 // No routes from the original life simulator can be entered through this game.
 triggerLifeEvent(){return false;} triggerEraEvent(){return false;} gamble(){return false;} invest(){return false;} changeLifestyle(){return false;}
 static restore(raw,options={}){try{const value=typeof raw==='string'?JSON.parse(raw):raw,d=value?.dreamCareer;
  if(d?.version!==1||!Number.isInteger(d.topicMonth)||d.topicMonth< -1||d.topicMonth>value.month||!Array.isArray(d.topicHistory)||d.topicHistory.length>80||!['setup','apprentice','employed','retired'].includes(value.status))return null;
  const valid=(f)=>f&&TOPICS.some(t=>t.id===f.id&&Number.isInteger(f.choice)&&!!t.choices[f.choice]);if(d.topicHistory.some(f=>!valid(f)||!Number.isInteger(f.month)||f.month>value.month||!value.history.some(h=>h.id===f.career)))return null;
  if(d.followup!==null&&(!valid(d.followup)||!Number.isInteger(d.followup.due)||d.followup.due<value.month||d.followup.due>value.month+1))return null;
  if(d.tactic!==null&&(!d.tactic||!['checklist','buddy','scope'].includes(d.tactic.id)||d.tactic.month!==value.month||['used','settled'].some(k=>d.tactic[k]!==undefined&&typeof d.tactic[k]!=='boolean')))return null;
  if(value.pending&&value.pending.id!=='vocational-task')return null;
  const g=Core.restore(value,options);if(!g)return null;Object.setPrototypeOf(g,DreamCareerGame.prototype);return g;
 }catch{return null;}}
}
export {DreamCareerGame as LifeGame};
