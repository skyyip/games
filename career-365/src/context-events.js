import {JOBS} from './content.js';
import {occupationEventById} from './occupation-events.js';
import {journal,progressGoal} from './life-design.js';
export const FOLLOWUPS={
 referral:{id:'follow-referral',title:'上次的客戶，介紹了一個新機會',scene:'work',text:'你留下的交接紀錄和溝通讓對方記得你。有人想委託一份有明確範圍的小項目。',choices:[{label:'接受授權範圍內的小委託／教育分享，投入精力',effects:{cash:1800,energy:-16,stress:5,reputation:2}},{label:'轉介可信夥伴，保留人脈與休息',effects:{contacts:2,stress:-3}},{label:'暫不接單，為主業留下時間',effects:{pq:.3,stress:-5}}]},
 repair:{id:'follow-repair',title:'交付之後，問題有了新進展',scene:'work',text:'上次有限範圍的交付留下了待辦。夥伴主動問你，要怎樣把後續做好？',choices:[{label:'覆檢並補做交接，付出時間',effects:{energy:-12,jq:.3,reputation:3}},{label:'協調合資格同事處理',effects:{cash:-600,contacts:1,stress:-3}},{label:'說明能力邊界，結清已完成部分',effects:{cash:-200,stress:-2}}]},
 community:{id:'follow-community',title:'朋友把你的專長介紹給社區',scene:'relationship',text:'過去的相處帶來一個分享專業的邀請。你可以按目前的負荷參與。',choices:[{label:'舉辦一場小分享，投入精力',effects:{energy:-12,contacts:2,reputation:3}},{label:'與朋友合辦，分擔成本',effects:{cash:-300,contacts:2,stress:-4}},{label:'先提供一份簡短資料，保留休息',effects:{energy:-3,jq:.2}}]},
};
export function eventWeight(e,s){let w=1;
 if(e.group==='scam')w=.7+(e.id==='investment-scam'&&Object.values(s.assets).some(n=>n>0)?2:0)+(e.id==='dating-scam'&&s.family.status===0?1:0)+(e.id==='kk-recruitment'&&['sabbatical','overseas','travel'].includes(s.status)?2:0);
 if(e.group==='temptation')w=.25+(s.stats.stress>65?1.5:0)+(e.id==='gambling-temptation'&&s.metrics.gambles?2:0);
 if(e.group==='family')w=2+(s.family.affection<40?1:0);
 if(e.group==='opportunity')w=2+s.stats.contacts/100;
 if(e.id==='recovery-support')w=8;
 return w;
}
export function weightedPick(g,list){if(!list.length)return null;const total=list.reduce((n,e)=>n+eventWeight(e,g.s),0);let n=g.roll()*total;for(const e of list){n-=eventWeight(e,g.s);if(n<=0)return e;}return list.at(-1);}
export function queueFollowup(g,id,delay=2,context=null){const l=g.s.life;if(l.queue.length<50&&!l.queue.some(q=>q.id===id)){l.queue.push({id,due:g.s.elapsed+delay,...(context?{sourceCareer:context.career,sourceEvent:context.event}:{})});journal(g,`伏線：${{referral:'客戶可能再聯絡你',repair:'交付還有一項後續待辦',community:'朋友正在籌備社區活動'}[id]}，約 ${delay} 個月後有消息。`);}}
export function dueFollowup(g){const l=g.s.life,i=l.queue.findIndex(q=>q.due<=g.s.elapsed);if(i<0)return false;const [next]=l.queue.splice(i,1);g.s.pending=structuredClone(FOLLOWUPS[next.id]);if(next.sourceCareer){const job=JOBS.find(j=>j.id===next.sourceCareer),event=occupationEventById(job,next.sourceEvent);if(job&&event){g.s.pending.title=job.name+'｜'+g.s.pending.title;g.s.pending.text=`「${event.title}」的後續消息。`+g.s.pending.text+'即使已轉職，仍需核對對應資格、授權與現有負荷；未具資格時只參與受督導或教育性範圍。';}}return true;}
export function recordDecision(g,e,c,index){const l=g.s.life;l.cooldowns[e.id]=g.s.elapsed+(/scam|temptation|affair/.test(e.id)?18:8);journal(g,`${e.title}：${c.label}。`);
 if(e.id==='romance'||e.group==='family'||e.scene==='relationship')progressGoal(g,'connection');
 if(e.id==='follow-community')progressGoal(g,'service');
 if(e.id==='follow-referral'&&index===0)progressGoal(g,'craft');
}
