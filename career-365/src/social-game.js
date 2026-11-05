import {SOCIAL_ROLES} from './social-content.js';
export function socialContext(game){const s=game.s;return {runId:s.life.socialRunId??null,name:s.profile.name,career:s.career,retired:s.status==='retired',npcSlots:s.business?.staff??0,skills:Object.entries(s.skills).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k)};}
export const COOP_LIMIT=3;
export const rewardDay=(now=Date.now())=>Math.floor((now+9*3600000)/86400000);
export function cooperationReward(r){return r?.kind==='review'?{eq:1,jq:2}:({craft:{iq:1,jq:2},tech:{iq:2,jq:1},care:{eq:2,pq:1},art:{iq:1,pq:2},people:{eq:2,jq:1},analysis:{iq:2,jq:1}})[r?.role]??null;}
export function cooperationBlock(game,r,uid){
 const s=game?.s;
 if(!s||!uid||r?.uid!==uid||r?.runId!==s.life.socialRunId)return '這份獎勵屬於另一位玩家或另一段人生；合作紀錄仍會保留。';
 if(!/^[A-Za-z0-9_-]{1,129}$/.test(r.id??'')||!['pending','granted'].includes(r.state)||!['delivery','review'].includes(r.kind)||!Object.hasOwn(SOCIAL_ROLES,r.role))return '這份合作紀錄沒有可領取的成長獎勵。';
 if(s.life.socialClaims?.includes(r.id))return '已加入這段人生。';
 if(s.status==='retired'||s.status==='setup')return '這段人生未開始或已退休，仍可查看合作紀錄。';
 if(s.pending)return '請先處理目前的故事，再領取合作成長。';
 if(s.life.cooperation?.month===s.elapsed&&s.life.cooperation.count>=COOP_LIMIT)return '本遊戲月已領取三次；下個遊戲月可繼續領取。';
 if((s.life.socialClaims?.length??0)>=2000)return '這段人生的合作成長紀錄已滿。';
 return '';
}
// Only a server-validated, privately fetched grant may enter the current life.
// The private save remains a client simulation, not a tamper-proof competitive ledger.
export function applySocialReceipt(game,r,uid){
 if(r?.state!=='granted'||cooperationBlock(game,r,uid))return false;
 const s=game.s,before={...s.stats},reward=cooperationReward(r);game.changeStats(reward);
 s.life.socialClaims??=[];s.life.socialClaims.push(r.id);
 if(s.life.cooperation?.month!==s.elapsed)s.life.cooperation={month:s.elapsed,count:0};s.life.cooperation.count++;
 const gains=Object.fromEntries(Object.keys(reward).map(k=>[k,Math.round((s.stats[k]-before[k])*10000)/10000]));
 const label=Object.entries(gains).map(([k,v])=>`${k.toUpperCase()} +${v.toFixed(2)}`).join('・');
 game.record('social',r.kind==='review'?'一起把交付做好':'與玩家完成一份合作',`${r.companyName}｜${r.title}。${r.kind==='review'?'你完成了回饋與驗收':'你的交付獲負責人確認'}。${label}。這是遊戲合作成長，並非專業資格。`);
 return gains;
}
