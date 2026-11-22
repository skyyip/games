import {act} from './game.js';
const numeric=value=>{const n=value?.toMillis?.()??value;return typeof n==='number'?Math.floor(n):n;};
export function normalizeRun(raw){if(!raw)return null;return {...raw,...Object.fromEntries(['startedAt','questionAt','answerAt','endedAt','updatedAt','deadlineAt'].map(k=>[k,numeric(raw[k])])),answers:Object.fromEntries(Object.entries(raw.answers??{}).map(([k,a])=>[k,{...a,startedAt:numeric(a.startedAt),answeredAt:numeric(a.answeredAt)}]))};}
// Shared by the production transaction and the real Rules Emulator tests.
export function transitionPatch(raw,action,now,serverTimestamp,expected=null){
 const old=normalizeRun(raw);
 if(old.phase==='finished'||expected&&(old.index!==expected.index||old.questionAt!==expected.questionAt||old.phase!==expected.phase))return null;
 const next=act(old,action,now,{autoFinish:false}),patch={updatedAt:serverTimestamp()};
 for(const key of ['phase','index','correct','timeMs','outcome','choice','halfFor','phoneFor','audienceFor','audienceHadHalf'])if(next[key]!==old[key])patch[key]=next[key];
 if(next.questionAt!==old.questionAt)patch.questionAt=serverTimestamp();
 if(next.answerAt!==old.answerAt){patch.answerAt=next.answerAt===null?null:serverTimestamp();if(next.answerAt!==null){patch.seen=next.seen;patch['answers.'+old.index]={...next.answers[old.index],startedAt:raw.questionAt,answeredAt:serverTimestamp()};}}
 return patch;
}
