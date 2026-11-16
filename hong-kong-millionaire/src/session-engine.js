import {QUESTIONS} from './questions.js';
import {questionId,questionById,QUESTION_PLANS,BANK_VERSION,hkDay,dayEnd,hash,PRIZES} from './game.js';
export const ROOM_QUESTIONS=10,ROOM_INTERVAL=23000;
export const TOPICS=Object.freeze([{id:'all',name:'香港綜合'},{id:'sport',name:'體育專場'},{id:'places',name:'地理與景點'}]);
const topicMatch={all:()=>true,sport:q=>/體育|奧運|賽馬|劍擊|運動/.test(q.category),places:q=>/景點|郊遊|地質|水塘|地名|圍村|文物徑|地理|山|海岸|古蹟/.test(q.category)};
const gcd=(a,b)=>b?gcd(b,a%b):a;
export const ROOM_POOLS=Object.freeze(Object.fromEntries(TOPICS.map(t=>{const ids=QUESTIONS.filter(topicMatch[t.id]).map(q=>q.id);let stride=7;while(gcd(stride,ids.length)!==1)stride++;return [t.id,Object.freeze({ids:Object.freeze(ids),stride})];})));
export function sessionQid(run,index=run.index){
 if(run.kind==='room'&&run.topic==='all')return questionId(run.seed,index<3?index:index<7?index+2:index+3);
 if(run.kind==='room'){const pool=ROOM_POOLS[run.topic];if(!pool)throw Error('invalid-topic');return pool.ids[(run.seed*17+index*pool.stride)%pool.ids.length];}
 if(run.kind==='assisted'&&run.swapFor===index){const tier=Math.floor(index/5),pool=QUESTION_PLANS[BANK_VERSION][tier];return pool.ids[(run.day*pool.dayStep+(index%5+5)*pool.slotStep+tier*11)%pool.ids.length];}
 return questionId(run.kind==='assisted'?run.day:run.seed,index);
}
export const sessionQuestion=run=>questionById(sessionQid(run));
export const sessionLimit=run=>run.kind==='room'?20000:run.index>=10?40000:20000;
export const sessionRemaining=(run,now=Date.now())=>run.phase==='playing'?Math.max(0,Math.min(run.questionAt+sessionLimit(run),run.kind==='room'?Infinity:dayEnd(run.day))-now):0;
export const sessionTerminal=run=>run.phase==='reveal'&&(run.kind==='room'?run.index===run.count-1||run.outcome==='walk':run.outcome!=='correct'||run.correct===15);
export const sessionSpent=run=>run.timeMs+(run.answerAt===null?0:Math.max(0,Math.min(sessionLimit(run),run.answerAt-run.questionAt)));
export function newSession({id,uid,kind,seed,topic='all',room=''},now=Date.now(),roomStartedAt=null){
 if(!['weekend','assisted','room'].includes(kind)||!Number.isInteger(seed)||seed<0||seed>1000000000||!ROOM_POOLS[topic])throw Error('invalid-session');
 return {id,uid,kind,seed,topic,room,bankVersion:BANK_VERSION,day:hkDay(now),count:kind==='room'?ROOM_QUESTIONS:15,phase:'playing',index:0,correct:0,timeMs:0,startedAt:now,questionAt:kind==='room'?roomStartedAt:now,answerAt:null,endedAt:null,outcome:'',choice:-1,halfFor:-1,phoneFor:-1,audienceFor:-1,swapFor:-1,answers:{},seen:[],payout:0,credit:0,credited:false,reason:'',updatedAt:now};
}
export function sessionRemoved(run){if(run.halfFor!==run.index)return [];const q=sessionQuestion(run),wrong=[0,1,2,3].filter(i=>i!==q.answer),keep=wrong[hash(run.seed+q.id)%3];return wrong.filter(i=>i!==keep);}
export function sessionVotes(run){
 const q=sessionQuestion(run),removed=sessionRemoved(run),seed=hash(run.seed+q.id+'poll'),possible=[0,1,2,3].filter(i=>!removed.includes(i)),wrong=possible.filter(i=>i!==q.answer);
 const leader=seed%100<(q.tier===1?8:q.tier===2?28:48)?wrong[seed%wrong.length]:q.answer;
 const weights=[0,1,2,3].map(i=>removed.includes(i)?0:i===leader?61:10+(hash(seed+':'+i)%20)),total=weights.reduce((a,b)=>a+b),votes=weights.map(n=>Math.floor(n/total*100));
 let rest=100-votes.reduce((a,b)=>a+b);for(let i=0;rest;i=(i+1)%4)if(!removed.includes(i)){votes[i]++;rest--;}return votes;
}
export function sessionPresentation(run){const q=sessionQuestion(run),allowed=q.textOnly?['text']:(q.modes??['blurred','partial','mirrored','original','text']),mode=run.phase==='playing'?allowed[(run.seed+run.index*7)%allowed.length]:'original';return {mode,order:[0,1,2,3].map(i=>(i+run.seed+run.index)%4)};}
function reveal(run,choice,outcome,now){return {...run,phase:'reveal',choice,outcome,correct:run.correct+(outcome==='correct'?1:0),answerAt:now,updatedAt:now,seen:[...run.seen,sessionQid(run)],answers:{...run.answers,[run.index]:{qid:sessionQid(run),choice,outcome,startedAt:run.questionAt,answeredAt:now}}};}
export function sessionFinish(run,now=Date.now()){
 if(run.phase!=='reveal')throw Error('not-ready');
 const reason=run.kind==='room'&&run.index===run.count-1?'complete':run.correct===15?'complete':run.outcome==='correct'?(run.kind!=='room'&&run.day!==hkDay(now)?'timeout':'walk'):run.outcome;
 const payout=run.kind==='room'?0:reason==='wrong'?(run.correct>=10?60000:run.correct>=5?8000:0):run.correct?PRIZES[run.correct-1]:0;
 return {...run,phase:'finished',reason,payout,timeMs:sessionSpent(run),endedAt:now,updatedAt:now};
}
export function sessionAct(run,action,now=Date.now()){
 if(run.phase==='finished')throw Error('already-finished');
 if(run.phase==='playing'&&sessionRemaining(run,now)<=0)return reveal(run,-1,'timeout',now);
 if(run.kind!=='room'&&run.day!==hkDay(now))return sessionFinish(run,now);
 if(action.type==='answer'){
  if(run.phase!=='playing'||!Number.isInteger(action.choice)||action.choice<0||action.choice>3||sessionRemoved(run).includes(action.choice))throw Error('invalid-choice');
  return reveal(run,action.choice,action.choice===sessionQuestion(run).answer?'correct':'wrong',now);
 }
 if(action.type==='walk')return run.phase==='playing'?reveal(run,-1,'walk',now):sessionFinish(run,now);
 if(action.type==='timeout')throw Error('not-expired');
 if(action.type==='life'){const key={half:'halfFor',phone:'phoneFor',audience:'audienceFor'}[action.kind];if(run.phase!=='playing'||!key||run[key]!==-1)throw Error('life-used');return {...run,[key]:run.index,updatedAt:now};}
 if(action.type==='swap'){if(run.kind!=='assisted'||run.phase!=='playing'||run.swapFor!==-1||[run.halfFor,run.phoneFor,run.audienceFor].includes(run.index))throw Error('swap-unavailable');return {...run,swapFor:run.index,updatedAt:now};}
 if(action.type==='next'){
  if(run.phase!=='reveal'||sessionTerminal(run))throw Error('not-ready');
  const questionAt=run.kind==='room'?run.questionAt+ROOM_INTERVAL:now;if(now<questionAt)throw Error('room-wait');
  return {...run,phase:'playing',index:run.index+1,timeMs:sessionSpent(run),questionAt,answerAt:null,choice:-1,outcome:'',updatedAt:now};
 }
 if(action.type==='finish')return sessionFinish(run,now);
 throw Error('unknown-action');
}
export function roomWinner(room,sessions){return room.players.map((uid,order)=>({uid,order,run:sessions[uid]})).filter(p=>p.run?.phase==='finished').sort((a,b)=>b.run.correct-a.run.correct||a.run.timeMs-b.run.timeMs||a.order-b.order)[0]?.uid??'';}
