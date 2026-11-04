import {claimMonthlyEvent} from './monthly-play.js';
import {JOBS} from './content.js';
import {CAREER_ARCS} from './career-arcs.js';
import {questionsFor,questionById,makeKnowledgeCase,KNOWLEDGE_SOURCES} from './professional-knowledge.js';
import {occupationEventsFor,occupationEventById,makeOccupationEvent} from './occupation-events.js';
import {journal,progressGoal} from './life-design.js';
import {queueFollowup} from './context-events.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function restoreProfessional(s){
 const l=s.life;if(l.queue.some(q=>(q.sourceCareer!==undefined||q.sourceEvent!==undefined)&&!occupationEventById(JOBS.find(j=>j.id===q.sourceCareer),q.sourceEvent)))return false;l.occupationReviews??=[];if(!Array.isArray(l.occupationReviews)||l.occupationReviews.length>12||l.occupationReviews.some(r=>!r||!occupationEventById(JOBS.find(j=>j.id===r.career),r.event)||!Number.isInteger(r.choice)||r.choice<0||r.choice>2||!Number.isInteger(r.month)||r.month<216||r.month>780))return false;l.projectCounts??=Object.fromEntries(Object.entries(s.profession.counts).filter(([id])=>CAREER_ARCS[JOBS.find(j=>j.id===id)?.name]));
 if(!l.projectCounts||Array.isArray(l.projectCounts)||Object.entries(l.projectCounts).some(([id,n])=>!JOBS.some(j=>j.id===id)||!Number.isInteger(n)||n<0||n>4000))return false;
 l.learning??={answered:0,correct:0,byJob:{},seen:[],reviews:[]};const k=l.learning,integer=(n,max=4000)=>Number.isInteger(n)&&n>=0&&n<=max;
 if(!k||!integer(k.answered)||!integer(k.correct,k.answered)||!k.byJob||Array.isArray(k.byJob)||Object.keys(k.byJob).length>JOBS.length||Object.entries(k.byJob).some(([id,v])=>!JOBS.some(j=>j.id===id)||!v||!integer(v.answered,k.answered)||!integer(v.correct,v.answered)))return false;
 if(Object.values(k.byJob).reduce((n,v)=>n+v.answered,0)!==k.answered||Object.values(k.byJob).reduce((n,v)=>n+v.correct,0)!==k.correct)return false;
 if(!Array.isArray(k.seen)||k.seen.length>512||new Set(k.seen).size!==k.seen.length||k.seen.some(id=>!questionById(id)))return false;
 if(!Array.isArray(k.reviews)||k.reviews.length>24||k.reviews.some(r=>{const job=JOBS.find(j=>j.id===r.career),q=questionById(r.question);return !job||!q||!questionsFor(job).some(item=>item.id===q.id)||!Number.isInteger(r.choice)||r.choice<0||r.choice>2||typeof r.correct!=='boolean'||r.correct!==(r.choice===q.answer)||!Number.isInteger(r.month)||r.month<216||r.month>780;}))return false;
 return true;
}
export const professionalMethods={
 get knowledgePool(){return questionsFor(this.job);},
 knowledgeQuiz(id=null){const s=this.s,k=s.life.learning;if(!this.job||s.risks.captivity||s.risks.delay||!this.can(1,10))return false;const pool=this.knowledgePool,unseen=pool.filter(q=>!k.seen.includes(q.id));const q=id?pool.find(q=>q.id===id):this.pick(unseen.length?unseen:pool.filter(q=>q.id!==k.reviews.at(-1)?.question));if(!q)return false;this.spend(10);s.pending=makeKnowledgeCase(this.job,q,(a,b)=>this.int(a,b));return true;},
 resolveKnowledge(index){const s=this.s,e=s.pending,q=questionById(e?.knowledge?.question),order=e?.knowledge?.order;if(e?.id!=='knowledge-case'||!q||e.knowledge.career!==s.career||!Number.isInteger(index)||index<0||index>=3||!Array.isArray(order)||!this.knowledgePool.some(item=>item.id===q.id))return false;const choice=order[index],correct=choice===q.answer,k=s.life.learning,skill=s.skills[this.job.skill];
  k.answered++;if(correct)k.correct++;const per=k.byJob[s.career]??{answered:0,correct:0};per.answered++;if(correct)per.correct++;k.byJob[s.career]=per;if(!k.seen.includes(q.id))k.seen.push(q.id);
  k.reviews.push({career:s.career,question:q.id,choice,correct,month:s.month});k.reviews=k.reviews.slice(-24);
  s.skills[this.job.skill]=clamp(skill+(correct?.8:.25)*Math.max(.12,1-skill/110),0,100);this.changeStats({jq:correct?.15:.05,mastery:s.status==='apprentice'?(correct?.7:.2):0,reputation:correct?1:0,stress:correct?-1:1});progressGoal(this,'craft',correct?1:.3);
  s.pending=null;const text=`你選擇「${q.options[choice]}」。${correct?'答對了。':'這次需要修正觀念。'}正確觀念：${q.options[q.answer]}。${q.explanation} 延伸閱讀：${KNOWLEDGE_SOURCES[q.source][0]}。本題是知識練習，不計作受督導實習或正式資格考核。`;
  journal(this,`${this.job.name}｜${q.prompt} ${correct?'答對':'答後訂正'}：${q.explanation}`);this.record('study',`${this.job.name}｜${correct?'常識累積':'訂正也是進步'}`,text);return true;
 },
 triggerOccupationEvent(id=null){const s=this.s;if(!this.job||!['apprentice','employed','business'].includes(s.status)||!this.active||s.risks.captivity||s.risks.delay||s.life.extraEventMonth===s.elapsed)return false;const available=occupationEventsFor(this.job).filter(e=>!(s.life.cooldowns[e.id]>s.elapsed));let item=id?available.find(e=>e.id===id):null;
  if(!id){const knowledge=s.life.learning.byJob[s.career],weights=available.map(e=>e.kind==='development'?1+(knowledge&&knowledge.correct/Math.max(1,knowledge.answered)<.6?2:0):e.kind==='disruption'?1+(s.stats.stress>65?1:0)+(s.world?2:0)+(s.status==='business'?1:0):1+Math.min(2,s.stats.reputation/100));let n=this.roll()*weights.reduce((a,b)=>a+b,0);item=available.find((e,i)=>(n-=weights[i])<=0)??available.at(-1);}
  if(!item||!claimMonthlyEvent(s))return false;s.pending=makeOccupationEvent(this.job,item);if(s.status==='apprentice'&&this.entryRequirement.regulated)s.pending.text='你仍在受督導訓練，所有工作須符合資格及授權界線。'+s.pending.text;return true;
 },
 resolveOccupationEvent(index){const s=this.s,e=s.pending,item=occupationEventById(this.job,e?.careerEvent?.event),c=item?.choices[index];if(e?.id!=='occupation-event'||!item||!c||e.careerEvent.career!==s.career)return false;this.changeStats(c.effects);const skill=s.skills[this.job.skill];s.skills[this.job.skill]=clamp(skill+c.skillGain*Math.max(.12,1-skill/110),0,100);const key=index===1?'colleague':'client';s.life.npc[key]=clamp(s.life.npc[key]+(index===2?0:2),0,100);s.life.cooldowns[item.id]=s.elapsed+(item.kind==='opportunity'?10:8);progressGoal(this,'craft',c.skillGain);
  let after='';if(item.kind==='opportunity'&&index<2){queueFollowup(this,'referral',3,{career:s.career,event:item.id});after='對方可能在3個月後再次聯絡，伏線已記下。';}else if(item.kind==='disruption'&&index===2){queueFollowup(this,'repair',2,{career:s.career,event:item.id});after='縮小範圍留下了後續待辦，約2個月後會跟進。';}
  s.life.occupationReviews.push({career:s.career,event:item.id,choice:index,month:s.month});s.life.occupationReviews=s.life.occupationReviews.slice(-12);s.pending=null;journal(this,`${this.job.name}｜${item.title}：${c.label}。${after}`);this.record('work',`${this.job.name}｜${item.title}`,`${item.text} 你選擇：${c.label}。${after} 專業成長、費用及精力已記入本局；這次不重複發整月薪酬。`);return true;
 },
};
