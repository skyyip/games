import {QUESTIONS} from './questions.js';
export const BANK_VERSION='hk-2026-11-v1',DAY_MS=86400000,HK_OFFSET=28800000;
export const PRIZES=Object.freeze([1000,2000,3000,4000,8000,10000,20000,30000,40000,60000,80000,150000,250000,500000,1000000]);
export const TITLES=Object.freeze([{id:'ordinary',name:'運氣平平',min:0,note:'香港故事仲有好多，聽日再接再厲。'},{id:'neighbour',name:'街坊地保',min:8000,note:'街頭巷尾嘅香港常識，難唔到你。'},{id:'expert',name:'香港通',min:60000,note:'地理、節慶與文化，你都熟門熟路。'},{id:'peak',name:'太平山神',min:500000,note:'只差一步登頂，你已經站得好高。'},{id:'millionaire',name:'百萬富翁',min:1000000,note:'十五題全中，今晚香港由你話事！'}]);
export const MODES=Object.freeze(['blurred','partial','mirrored','original','text']);
export const MODE_NAMES=Object.freeze({blurred:'慢慢睇清',partial:'眼利局部',mirrored:'倒轉香港',original:'原圖考眼力',text:'地膽常識'});
const byId=new Map(QUESTIONS.map(q=>[q.id,q])),pools=[1,2,3].map(tier=>QUESTIONS.filter(q=>q.tier===tier));
export const hkDay=(now=Date.now())=>Math.floor((now+HK_OFFSET)/DAY_MS);
export const dayEnd=day=>(day+1)*DAY_MS-HK_OFFSET;
export const seasonForDay=day=>new Date(day*DAY_MS).toISOString().slice(0,7);
export const dayLabel=day=>new Intl.DateTimeFormat('zh-HK',{timeZone:'UTC',month:'long',day:'numeric'}).format(new Date(day*DAY_MS));
export const challengeNumber=day=>Math.max(1,day-hkDay(Date.UTC(2026,10,13,16))+1);
export function hash(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.codePointAt(0),16777619);return h>>>0;}
export function questionId(day,index){const tier=Math.floor(index/5),slot=(day*17+(index%5)*7+tier*11)%30;return pools[tier][slot].id;}
export const questionById=id=>byId.get(id);
export function questionFor(run){return byId.get(questionId(run.day,run.index));}
export function presentation(day,index){const q=byId.get(questionId(day,index)),mode=q.textOnly?'text':MODES[(day*13+index*7)%5],offset=(day+index)%4;return {mode,order:[0,1,2,3].map(i=>(i+offset)%4),partial:.05+(hash(q.id+day)%6)/100,vertical:hash(day+q.id)%2===0};}
export const limitMs=index=>index>=10?40000:20000;
export const earned=count=>count?PRIZES[count-1]:0;
export const insurance=count=>count>=10?60000:count>=5?8000:0;
export const titleFor=prize=>TITLES.filter(t=>prize>=t.min).at(-1);
export const titleIdsFor=prize=>TITLES.filter(t=>prize>=t.min).map(t=>t.id);
export function newRun(day=hkDay(),now=Date.now(),uid='guest'){return {version:1,bankVersion:BANK_VERSION,uid,day,season:seasonForDay(day),phase:'playing',index:0,correct:0,timeMs:0,startedAt:now,questionAt:now,answerAt:null,endedAt:null,updatedAt:now,outcome:'',choice:-1,halfFor:-1,phoneFor:-1,audienceFor:-1,audienceHadHalf:false,answers:{},seen:[],payout:0,reason:''};}
export const elapsedQuestion=run=>run.answerAt===null?0:Math.max(0,Math.min(limitMs(run.index),run.answerAt-run.questionAt));
export const spent=run=>run.timeMs+(run.phase==='reveal'?elapsedQuestion(run):0);
export const remaining=(run,now=Date.now())=>run.phase==='playing'?Math.max(0,Math.min(run.questionAt+limitMs(run.index),dayEnd(run.day))-now):0;
export const livesLeft=run=>[run.halfFor,run.phoneFor,run.audienceFor].filter(n=>n===-1).length;
export const terminal=run=>run.phase==='reveal'&&(run.outcome!=='correct'||run.correct===15);
export function removedOptions(run){if(run.halfFor!==run.index)return [];const q=questionFor(run),wrong=[0,1,2,3].filter(n=>n!==q.answer),keep=wrong[hash(run.day+q.id)%3];return wrong.filter(n=>n!==keep);}
export function audience(run){const q=questionFor(run),half=run.audienceHadHalf?removedOptions({...run,halfFor:run.index}):[],available=[0,1,2,3].filter(n=>!half.includes(n)),seed=hash(run.day+q.id+'audience'),misled=seed%100<(q.tier===1?8:q.tier===2?28:48),leader=misled?available.filter(n=>n!==q.answer)[seed%Math.max(1,available.length-1)]:q.answer,weights=[0,1,2,3].map(i=>half.includes(i)?0:i===leader?(q.tier===1?90:q.tier===2?58:39):12+(hash(seed+':'+i)%19)),total=weights.reduce((a,b)=>a+b,0),values=weights.map(n=>Math.floor(n/total*100));let rest=100-values.reduce((a,b)=>a+b,0);for(let i=0;rest;i=(i+1)%4)if(!half.includes(i)){values[i]++;rest--;}return values;}
function answered(run,choice,now,outcome){const q=questionFor(run);return {...run,phase:'reveal',correct:run.correct+(outcome==='correct'?1:0),answerAt:now,updatedAt:now,outcome,choice,seen:[...run.seen,q.id],answers:{...run.answers,[run.index]:{qid:q.id,choice,outcome,startedAt:run.questionAt,answeredAt:now}}};}
export function finish(run,now=Date.now(),reason=null){if(run.phase!=='reveal')throw Error('not-ready');const why=reason??(run.correct===15&&run.outcome==='correct'?'complete':run.outcome==='correct'?'walk':run.outcome);if(why==='complete'&&run.correct!==15)throw Error('not-complete');const payout=why==='wrong'?insurance(run.correct):earned(run.correct);return {...run,phase:'finished',timeMs:spent(run),payout,reason:why,endedAt:now,updatedAt:now};}
export function act(run,action,now=Date.now(),{autoFinish=true}={}){
 if(run.bankVersion!==BANK_VERSION)throw Error('bank-version');if(run.phase==='finished')throw Error('already-finished');
 if(run.day!==hkDay(now)){const expired=run.phase==='playing'?answered(run,-1,now,'timeout'):run;return autoFinish?finish(expired,now,expired.outcome==='wrong'?'wrong':expired.correct===15&&expired.outcome==='correct'?'complete':'timeout'):expired;}
 if(run.phase==='playing'&&remaining(run,now)<=0){const expired=answered(run,-1,now,'timeout');return autoFinish?finish(expired,now):expired;}
 if(action.type==='life'){if(run.phase!=='playing')throw Error('not-playing');const key={half:'halfFor',phone:'phoneFor',audience:'audienceFor'}[action.kind];if(!key||run[key]!==-1)throw Error('life-used');return {...run,[key]:run.index,...(action.kind==='audience'?{audienceHadHalf:run.halfFor===run.index}:{}),updatedAt:now};}
 if(action.type==='answer'){if(run.phase!=='playing'||!Number.isInteger(action.choice)||action.choice<0||action.choice>3||removedOptions(run).includes(action.choice))throw Error('invalid-choice');const next=answered(run,action.choice,now,action.choice===questionFor(run).answer?'correct':'wrong');return autoFinish&&terminal(next)?finish(next,now):next;}
 if(action.type==='walk'||action.type==='timeout'){if(action.type==='timeout'&&run.phase==='playing'&&remaining(run,now)>0)throw Error('not-expired');const next=run.phase==='playing'?answered(run,-1,now,action.type):run;return autoFinish?finish(next,now,action.type):next;}
 if(action.type==='next'){if(run.phase!=='reveal'||terminal(run))throw Error('not-ready');return {...run,phase:'playing',index:run.index+1,timeMs:spent(run),questionAt:now,answerAt:null,outcome:'',choice:-1,updatedAt:now};}
 if(action.type==='finish')return finish(run,now,action.reason);
 throw Error('unknown-action');
}
export function shareText(run,url){const line=Object.values(run.answers).map(a=>a.outcome==='correct'?'🟩':a.outcome==='wrong'?'🟥':a.outcome==='timeout'?'⏱️':'⬜').join(''),used=[run.halfFor>=0?'50:50':null,run.phoneFor>=0?'來電':null,run.audienceFor>=0?'觀眾':null].filter(Boolean),reason={wrong:'答錯退回保險線',walk:'割禾青',timeout:'時間到',complete:'十五題全中'}[run.reason];return `💰 香港百萬富翁 #Day${challengeNumber(run.day)}\n🏆 ${titleFor(run.payout).name}（$${run.payout.toLocaleString('en-HK')}）\n${line}\n${reason} · ${used.length?'錦囊：'+used.join('／'):'三個錦囊全部留低'}\n來挑戰你的香港知識：${url}`;}
export function nextProfile(profile,run){const seen=Object.values(run.answers).map(a=>a.qid),wrong=Object.values(run.answers).filter(a=>a.outcome!=='correct').map(a=>a.qid),bestPrize=Math.max(profile.bestPrize,run.payout);return {...profile,total:profile.total+run.payout,games:profile.games+1,bestPrize,titles:titleIdsFor(bestPrize),unlocked:[...new Set([...profile.unlocked,...seen])],wrong:[...new Set([...profile.wrong,...wrong])],activeDay:null,lastSettledDay:run.day};}
