import {storyProfile,storyVersionFor,hasStory,storyChapter,storyStation,stationResult,validStation,validNarrative,narrativeRecord,currentStoryWeek,weeklyRow,completeNarrative,storyMethods} from './career-stories.js';
import {industryProfile,industryScenario,industryCaseRow,INDUSTRY_QUESTIONS} from './industry-scenarios.js';
import {validPlaybook,playbookMethods,specialtyEffects,finishEpisode} from './career-playbook.js';
import {validPlay,playMaterial,playResult} from './work-play.js';
import {mindWorkSupport,completeMind} from './pq.js';
import {queueFollowup} from './context-events.js';
import {JOBS} from './content.js';
import {entryPath,journal,progressGoal} from './life-design.js';
import {questionById} from './professional-knowledge.js';
import {TRAINING_STAGES,PRESSURES,vocationalCourse} from './vocation-content.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),integer=(n,max=4000)=>Number.isInteger(n)&&n>=0&&n<=max;
export function restoreVocation(s){
 if(s.life.vocation===undefined)s.life.vocation={version:1,jobs:{}};const v=s.life.vocation;
 if(!v||v.version!==1||!v.jobs||Array.isArray(v.jobs)||Object.keys(v.jobs).length>JOBS.length)return false;
 for(const [id,r]of Object.entries(v.jobs)){
  if(!r||!validNarrative(r)||!validPlaybook(r?.playbook))return false;
  if(!JOBS.some(j=>j.id===id)||!r||!integer(r.phase,5)||!integer(r.attempts)||!integer(r.workDone,r.attempts)||!integer(r.workPassed,r.workDone)||!integer(r.employeeDone,r.workDone)||!integer(r.employeePassed,r.employeeDone)||!integer(r.drills,r.attempts)||r.workDone+r.drills!==r.attempts||!Array.isArray(r.skills)||r.skills.length!==4||r.skills.some(n=>!integer(n,12))||!Array.isArray(r.concepts)||r.concepts.length!==4||r.concepts.some(b=>typeof b!=='boolean')||!Number.isFinite(r.trust)||r.trust<0||r.trust>100)return false;
  const l=r.last;if(l&&(!integer(l.month,780)||l.month<216||typeof l.passed!=='boolean'||!integer(l.skill,3)||!integer(l.score,100)||l.answer!==null&&!integer(l.answer,2)||!['check','talk','rush'].includes(l.approach)||!['title','problem','impact','next'].every(k=>typeof l[k]==='string'&&l[k].length<=800)||!questionById(l.question)))return false;
 }
 return !s.pending?.vocation||validVocationalTask(s.pending,s);
}
export function vocationRecord(s,id=s.career){return s.life.vocation?.jobs[id]??null;}
function ensure(g){const s=g.s;return s.life.vocation.jobs[s.career]??=({phase:0,attempts:0,workDone:0,workPassed:0,employeeDone:0,employeePassed:0,drills:0,skills:[0,0,0,0],concepts:[false,false,false,false],trust:40,last:null});}
export function vocationEvidence(s){const r=vocationRecord(s);return !!r&&r.phase===5&&r.skills.every(n=>n>=3)&&r.concepts.every(Boolean);}
export function vocationRequirements(g){
 const s=g.s,r=vocationRecord(s),req=entryPath(g.job);return [
  {label:'五個學徒章節',value:r?.phase??0,target:5,ok:(r?.phase??0)===5},
  {label:'四項專業能力與觀念',value:r?r.skills.filter((n,i)=>n>=3&&r.concepts[i]).length:0,target:4,ok:!!r&&r.skills.every((n,i)=>n>=3&&r.concepts[i])},
  {label:'實作經驗',value:s.life.entry.practice,target:req.practice,ok:s.life.entry.practice>=req.practice},
  {label:'訓練月數',value:s.life.entry.months,target:req.months,ok:s.life.entry.months>=req.months},
  {label:'整體熟練度',value:Math.floor(s.mastery),target:100,ok:s.mastery>=100},
  ...(req.regulated?[{label:'認可訓練後的模擬資格考核',value:s.life.entry.assessed?1:0,target:1,ok:s.life.entry.assessed}]:[]),
 ];
}
export function vocationBlocker(g,extraEnergy=0,kind=g.s.pending?.vocation?.kind??'work'){
 const s=g.s;if(!g.job||!['apprentice','employed','business'].includes(s.status))return '先選擇一份職業，才可開始職業任務。';
 if(s.risks.captivity)return '目前需要安全與救援支援，可先返回其他人生選擇尋求協助。';
 if(s.risks.delay)return `仍在復原，尚餘 ${s.risks.delay} 個月；可先休養或尋求支援。`;
 if(s.pending&&s.pending.id!=='vocational-task')return '先完成眼前故事，再接下一個任務。';
 if(s.ap<1)return '本月安排已用完，先查看月結，下個月再接任務。';
 const need=(kind==='drill'?14:18)+extraEnergy;
 return s.stats.energy<need?`這次處理需要 ${need} 精力，目前 ${Math.floor(s.stats.energy)}；可先返回休息，任務不會自動扣資源。`:'';
}
export function taskMaterial(g,event=g.s.pending){
 const m=event?.vocation;if(!m)return null;const s=g.s,r=vocationRecord(s),baseCourse=vocationalCourse(g.job),industry=m.scenarioPack===1?industryScenario(g.job,m.storyVersion===2?r.narrative.step%4:m.attempt):null,expanded=industry?industryProfile(g.job):null,course=expanded?{...baseCourse,skills:expanded.skills,questions:INDUSTRY_QUESTIONS.filter(q=>q.jobs.includes(g.job.name)),lessons:[`觀察${expanded.skills[0]}，先整理需求及限制。`,`協助準備${expanded.skills[1]}的證據與測試。`,`在督導下處理${expanded.skills[2]}，保留工作紀錄。`,`覆盤${expanded.skills[3]}，補上失敗與邊界案例。`,'整合交付、驗收、後續與回退安排。']}:baseCourse,apprentice=m.role==='apprentice',phase=apprentice?Math.min(r.phase,4):null;
 const skill=m.kind==='drill'?r.skills.indexOf(Math.min(...r.skills)):apprentice?phase%4:r.employeeDone%4;
 const chapter=storyChapter(g,m);
 const index=apprentice?[0,1,3,2,4][phase]%course.cases.length:r.employeeDone%course.cases.length,row=m.weekly!==undefined?weeklyRow(g,m.weekly):chapter?[chapter.title,chapter.text,chapter.text,...chapter.plans]:industry?industryCaseRow(industry):course.cases[index],pressure=PRESSURES[(r.attempts+(apprentice?phase:Math.max(0,s.level-1)))%3],question=course.questions[(industry?(m.storyVersion===2?r.narrative.step%4:m.attempt):skill)%course.questions.length];
 const rotation=(r.attempts+Array.from(g.job.id).reduce((n,c)=>n+c.charCodeAt(0),0))%3;
 const actions=[{approach:'check',label:row[3],cost:180,energy:8,tradeoff:'多投入覆核成本與精力，保留較完整的交付依據。'},
  {approach:'talk',label:row[4],cost:0,energy:4,tradeoff:'協調需求、責任及時程，仍須保留必要核對。'},
  {approach:'rush',label:m.storyVersion===2||industry?row[5]:course.project&&index<3?row[5]:'只交付已核實且獲授權的部分，明列限制並轉介其餘事項',cost:90,energy:0,tradeoff:'縮小本次交付範圍，獎金較少，留下明確後續事項。'}];
 for(const [actionIndex,c]of actions.entries()){if(industry)c.tradeoff=industry.feedback[actionIndex]+' '+c.tradeoff;const effect=m.flowVersion===1?{score:0,energy:0,cost:0}:specialtyEffects(r,m,c.approach,false);if(m.modeVersion===2&&m.kind==='work'&&r.last&&!r.last.passed){c.energy+=1;c.tradeoff+=' 上次仍有缺口，本次另用1精力補核實。';}else if(m.modeVersion===2&&m.kind==='work'&&r.last?.approach==='rush'){c.cost+=20;c.tradeoff+=' 上次有限交付，本次另用$20整理待交接事項。';}c.cost+=effect.cost;c.energy+=effect.energy;}
 const choices=actions.slice(rotation).concat(actions.slice(0,rotation)),qRotation=(r.attempts+1)%3,order=[0,1,2].slice(qRotation).concat([0,1,2].slice(0,qRotation));
 return {course,phase,skill,row,pressure,industry,chapter,question,order,choices,threshold:apprentice?[55,58,62,62,68][phase]:62+Math.min(8,Math.max(0,s.level-1)*2),stage:apprentice?TRAINING_STAGES[phase]:s.level>=4?'資深工作・跨方責任':s.level>=2?'工作階段・複雜交付':'工作階段・初次獨立交付'};
}
function makeTask(g,kind,expanded=true,flow=false,weekly=null,storyVersion=undefined){const s=g.s,r=vocationRecord(s),vocation={career:s.career,role:s.status==='apprentice'?'apprentice':'employee',kind,attempt:r.attempts,month:s.month,modeVersion:2,clue:false,mentor:false,ai:false,answer:null,revised:false},event={id:'vocational-task',scene:'work',title:'',text:'',vocation,choices:[]};if(flow){vocation.flowVersion=1;const version=storyVersion===undefined?storyVersionFor(g.job):storyVersion;if(version!==null)vocation.storyVersion=version;if(weekly!==null)vocation.weekly=weekly;}if(expanded&&industryProfile(g.job))vocation.scenarioPack=1;const material=taskMaterial(g,event);vocation.pressure=material.pressure.id;
 event.title=`${g.job.name}｜${kind==='drill'?'針對弱項補練':material.stage}：${material.row[0]}`;
 event.text=material.row[1];event.choices=material.choices.map(c=>({label:c.label,effects:{}}));return event;
}
export function validVocationalTask(e,s){
 try{const m=e.vocation,r=vocationRecord(s),job=JOBS.find(j=>j.id===s.career);if(!['apprentice','employed','business'].includes(s.status)||e.id!=='vocational-task'||!m||m.career!==s.career||!job||!r||!['apprentice','employee'].includes(m.role)||m.role!==(s.status==='apprentice'?'apprentice':'employee')||!['work','drill'].includes(m.kind)||m.attempt!==r.attempts||m.month!==s.month||!['clue','mentor','ai','revised'].every(k=>typeof m[k]==='boolean')||m.answer!==null&&!integer(m.answer,2)||m.revised&&m.answer===null)return false;
  if(m.flowVersion!==undefined&&m.flowVersion!==1||m.storyVersion!==undefined&&(m.storyVersion!==storyVersionFor(job)||m.flowVersion!==1||!storyProfile(job)||!r.narrative)||!validStation(m.station)||m.station!==undefined&&!hasStory(m)||m.weekly!==undefined&&(m.flowVersion!==1||!integer(m.weekly,10000)))return false;
  if(m.scenarioPack!==undefined&&(m.scenarioPack!==1||!industryProfile(job)))return false;
  if(m.modeVersion!==undefined&&m.modeVersion!==2)return false;
  if(m.play!==undefined&&!validPlay(m.play))return false;
  const expected=makeTask({s,job},m.kind,m.scenarioPack===1,m.flowVersion===1,m.weekly??null,m.storyVersion??null);return m.pressure===expected.vocation.pressure&& e.title===expected.title&&e.text===expected.text&&JSON.stringify(e.choices)===JSON.stringify(expected.choices);
 }catch{return false;}
}
export const vocationalMethods={
 ...playbookMethods,
 ...storyMethods,
 openStoryTask(kind='work',weekly=null){if(!['work','drill'].includes(kind)||this.s.pending||vocationBlocker(this,0,kind)||this.s.life.vocation.jobs[this.s.career]?.attempts>=4000)return false;ensure(this);const r=vocationRecord(this.s);if(weekly!==null&&(kind!=='work'||!integer(weekly,10000)||weekly!==currentStoryWeek()||r.narrative?.week===weekly))return false;narrativeRecord(r);this.s.pending=makeTask(this,kind,true,true,weekly);return true;},
 enableVocationalCourse(){if(!this.job||!['apprentice','employed','business'].includes(this.s.status)||vocationRecord(this.s))return false;ensure(this);return true;},
 openVocationalTask(kind='work'){
  if(!['work','drill'].includes(kind)||this.s.pending||vocationBlocker(this,0,kind)||this.s.life.vocation.jobs[this.s.career]?.attempts>=4000)return false;
  ensure(this);this.s.pending=makeTask(this,kind);return true;
 },
 interactVocationalTask(kind,value){const e=this.s.pending;if(e?.id!=='vocational-task'||!['pick','ask','retry'].includes(kind))return false;const t=taskMaterial(this),x=playMaterial(this,t),p=e.vocation.play??{version:1,picks:[],questions:[]};if(kind==='pick'){if(!integer(value,2)||p.picks.includes(value)||p.picks.length>=(x.mode==='order'?3:1))return false;p.picks.push(value);}else if(kind==='ask'){if(!x.questions.some(q=>q[0]===value)||p.questions.includes(value))return false;p.questions.push(value);}else{if(!p.picks.length)return false;p.picks=[];}e.vocation.play=p;return true;},
 inspectVocationalTask(kind){const e=this.s.pending;if(e?.id!=='vocational-task'||!['clue','mentor','ai'].includes(kind)||e.vocation[kind])return false;e.vocation[kind]=true;return true;},
 answerVocationalTask(index){const e=this.s.pending;if(e?.id!=='vocational-task'||e.vocation.answer!==null||!integer(index,2))return false;e.vocation.answer=index;return true;},
 reviewVocationalConcept(){const e=this.s.pending;if(e?.id!=='vocational-task'||e.vocation.answer===null||e.vocation.revised)return false;e.vocation.revised=true;return true;},
 cancelVocationalTask(){if(this.s.pending?.id!=='vocational-task')return false;this.s.life.mind.prepared=null;this.s.pending=null;return true;},
 resolveVocationalTask(index){
  const s=this.s,e=s.pending;if(e?.id!=='vocational-task'||!validVocationalTask(e,s)||!integer(index,2))return false;const t=taskMaterial(this),choice=t.choices[index],r=vocationRecord(s),m=e.vocation;if(vocationBlocker(this,choice.energy))return false;
  const quizRequired=m.flowVersion!==1||!r.concepts[t.skill]||m.role==='apprentice'&&t.phase===4,station=stationResult(this);if(hasStory(m)&&!station.done)return false;
  const correct=!quizRequired||m.revised||m.answer!==null&&t.order[m.answer]===t.question.answer,fit=m.flowVersion===1||choice.approach===t.pressure.fit,help=m.mentor||m.ai;
  const play=hasStory(m)?null:playResult(this,t),playSupport=m.flowVersion===1?0:play?.correct?2:0;
  const mindSupport=mindWorkSupport(s,choice.approach),score=Math.round(clamp((m.flowVersion===1?0:specialtyEffects(r,m,choice.approach,play?.correct).score)+playSupport+mindSupport+38+Math.min(20,r.skills[t.skill]*2)+(m.clue||m.flowVersion===1?8:0)+(help?8:0)+(correct?12:0)+(fit?15:4)+(r.trust-40)*.04,0,100)),passed=score>=t.threshold&&correct&&(m.clue||m.flowVersion===1)&&(!hasStory(m)||station.correct);
  s.pending=null;if(m.kind==='work'){if(!this.work(false,false)){s.pending=e;return false;}}else{this.spend(14);s.life.entry.theory++;s.mastery=clamp(s.mastery+8,0,100);}
  this.changeStats({energy:-choice.energy});this.pay(choice.cost);r.attempts++;if(m.kind==='drill')r.drills++;else{r.workDone++;if(passed)r.workPassed++;if(m.role==='employee'){r.employeeDone++;if(passed)r.employeePassed++;}s.life.entry.practice++;s.life.entry.theory++;s.profession.completed++;if(passed)s.profession.passed++;s.profession.counts[s.career]=(s.profession.counts[s.career]??0)+1;s.mastery=clamp(s.mastery+(passed?16:6),0,100);}
  r.skills[t.skill]=clamp(r.skills[t.skill]+(passed?2:1),0,12);if(passed)r.skills[(t.skill+1)%4]=clamp(r.skills[(t.skill+1)%4]+1,0,12);if(correct)r.concepts[t.skill]=true;
  if(passed&&m.kind==='work'&&s.status==='apprentice')r.phase=Math.min(5,r.phase+1);
  r.trust=clamp(r.trust+(passed?4:-2),0,100);this.changeStats({jq:passed?.3:.1,reputation:passed?4:-1,stress:passed?-2:3});s.skills[this.job.skill]=clamp(s.skills[this.job.skill]+(passed?1.4:.6)*Math.max(.12,1-s.skills[this.job.skill]/110),0,100);
  const adjustment=m.kind==='work'?(passed?Math.round(this.job.salary*(choice.approach==='rush'?.003:.008)):0):0;if(adjustment)this.earn(adjustment);
  const npcReply=m.flowVersion===1?completeNarrative(this,m,choice,passed):'';
  const problem=passed?'你保留了必要核對，並能說明這次選擇的依據。'+(mindSupport?`整理思路契合做法，評分支持 +${mindSupport.toFixed(1)}。`:''):hasStory(m)&&!station.correct?'實作還有缺口；已保留你的做法，下段故事會帶著返工清單繼續。':!m.clue&&m.flowVersion!==1?'尚未確認現場線索，處理依據不足。':!correct?'這次基礎觀念需要補強，先訂正再嘗試。':'做法與本次限制尚未充分配合，可請教師傅或補練相關能力。';
  const interaction=play?`${play.done?(play.correct?(m.flowVersion===1?'實作卡完成；':'實作卡完成，評分支持+2；'):'實作卡需補強，已提供正確依據；'):'保留尚未完成的實作練習；'}你追問了${play.asked}項需求。`:'';
  const impact=npcReply+interaction+(t.industry?'方案取捨：'+t.industry.feedback[['check','talk','rush'].indexOf(choice.approach)]:'')+(passed?`${choice.approach==='rush'?'本次範圍縮小，未完成部分需跟進。':'本次範圍完成，交接仍須留下紀錄。'}合作信任提高。`:'保留原有訓練與技能，本章尚未完成；已留下返工與覆核事項，沒有額外重扣一次安排。');
  const next=`${t.question.explanation} 下次重點：${t.row[2]}。${m.role==='apprentice'?'涉及資格或受規管工序，仍須由合資格人員覆核。':''}`;
  r.last={month:s.month,passed,skill:t.skill,title:e.title,problem,impact,next,approach:choice.approach,question:t.question.id,answer:m.answer===null?null:t.order[m.answer],score};
  if(m.kind==='work'){s.life.arcs[s.career]={stage:(s.life.arcs[s.career]?.stage??0)+1,trust:r.trust};s.life.projectCounts[s.career]=(s.life.projectCounts[s.career]??0)+1;if(!passed||choice.approach==='rush')queueFollowup(this,'repair',2);else if(r.employeePassed>0&&r.employeePassed%3===0)queueFollowup(this,'referral',3);s.profession.quality=score;s.profession.last={month:s.month,career:s.career,title:t.row[0],approach:choice.approach,score,passed,feedback:`${problem}${impact}${next}`,adjustment};}
  if(m.kind==='work'&&!hasStory(m))finishEpisode(this,t,choice,passed);
  progressGoal(this,'craft',passed?1:.3);journal(this,`${e.title}：${passed?'完成':'補練'}；${problem}${impact}`);this.record('work',passed?'把一項要求，做成自己的能力':'這次遇到困難，下一步仍然清楚',`${e.title}。你選擇：${choice.label}。${problem}${impact}${next} ${m.kind==='work'?'本次含一次工作安排，例行月薪不重複發放。':'補練不計受督導實作，不額外發整月薪酬。'}`);completeMind(this,e,{approach:choice.approach,effects:{}});this.graduateCareer();return true;
 },
 vocationalPromotionReady(){const r=vocationRecord(this.s);return !r||r.employeePassed>=this.s.level*3&&r.skills.every(n=>n>=Math.min(10,3+this.s.level));},
 needsVocationalAssessment(){return this.s.status==='apprentice'&&!!vocationRecord(this.s)&&entryPath(this.job).regulated&&!this.s.life.entry.assessed&&vocationRequirements(this).filter(x=>x.label!=='認可訓練後的模擬資格考核').every(x=>x.ok);},
 canSummarizeTraining(){return this.s.status==='apprentice'&&vocationEvidence(this.s)&&!this.s.pending&&!this.s.risks.delay&&!this.s.risks.captivity&&vocationRequirements(this).some(x=>!x.ok&&x.label!=='認可訓練後的模擬資格考核');},
 summarizeTraining(months=3){
  if(![3,12].includes(months)||!this.canSummarizeTraining())return false;let advanced=0;
  while(advanced<months&&this.s.status==='apprentice'&&!this.s.pending&&!this.s.risks.delay&&!this.s.risks.captivity){
   const s=this.s;if(s.ap>0&&s.stats.energy>=10){this.spend(10);s.life.entry.practice++;s.life.entry.theory++;s.mastery=clamp(s.mastery+5,0,100);this.changeStats({stress:2});}
   while(this.s.ap>0&&this.active)this.rest();if(!this.endMonth())break;advanced++;
   if(this.s.healthData.illness||vocationRequirements(this).filter(x=>x.label!=='認可訓練後的模擬資格考核').every(x=>x.ok))break;
  }
  if(advanced){journal(this,`完成 ${advanced} 個月例行受督導訓練摘要；收入、生活費、健康與市場逐月結算，遇故事或考核便停下。`);this.record('study','平淡的月份，也在累積',`你完成 ${advanced} 個月例行訓練與休息，沒有代答關鍵故事或資格考核。`);}return advanced||false;
 },
};

export function vocationalQuizRequired(g,t=taskMaterial(g)){const m=g.s.pending?.vocation,r=vocationRecord(g.s);return !!m&&(m.flowVersion!==1||!r.concepts[t.skill]||m.role==='apprentice'&&t.phase===4);}
