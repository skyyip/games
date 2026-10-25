import {WEAPONS,DECOR,FRIENDS,MAX_DECOR_LEVEL} from './catalog.js';
const cap=(value,max=1000000)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
export const STORAGE_KEY='beat-bad-luck.stall.v1';
export function fresh(now=Date.now()){return {version:1,coins:0,merit:0,rituals:0,owned:['flipflop'],equipped:'flipflop',decor:Object.fromEntries(DECOR.map(d=>[d.id,0])),friends:[],records:[],lastSeen:now,idleCarry:0,lastReceipt:null};}
export function readProgress(raw,now=Date.now()){
  const state=fresh(now);try{const x=JSON.parse(raw);if(!x||x.version!==1)return state;
    state.coins=cap(x.coins);state.merit=cap(x.merit);state.rituals=cap(x.rituals);state.owned=[...new Set(['flipflop',...(Array.isArray(x.owned)?x.owned:[]).filter(id=>WEAPONS.some(w=>w.id===id))])];state.equipped=state.owned.includes(x.equipped)?x.equipped:'flipflop';
    for(const d of DECOR)state.decor[d.id]=cap(x.decor?.[d.id],MAX_DECOR_LEVEL);
    state.friends=[...new Set((Array.isArray(x.friends)?x.friends:[]).filter(id=>FRIENDS.some(f=>f.id===id)))];
    state.records=(Array.isArray(x.records)?x.records:[]).filter(r=>r&&Number.isFinite(r.score)&&r.score>=0&&Number.isFinite(r.date)&&WEAPONS.some(w=>w.id===r.weapon)).map(r=>({score:cap(r.score),date:cap(r.date,8640000000000000),weapon:r.weapon,hits:cap(r.hits)})).sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,3);
    state.lastSeen=Number.isFinite(x.lastSeen)?Math.max(0,x.lastSeen):now;state.idleCarry=Number.isFinite(x.idleCarry)?Math.max(0,Math.min(.999999,x.idleCarry)):0;state.lastReceipt=typeof x.lastReceipt==='string'?x.lastReceipt.slice(0,80):null;
  }catch{}return state;
}
export const idleRate=state=>DECOR.reduce((total,d)=>total+(state.decor[d.id]??0)*d.rate,0);
export function collectIdle(state,now=Date.now()){
  const elapsed=Math.max(0,Math.min(8*3600000,now-state.lastSeen));const total=elapsed/3600000*idleRate(state)+state.idleCarry,earned=Math.floor(total);
  return {state:{...state,coins:cap(state.coins+earned),lastSeen:Math.max(state.lastSeen,now),idleCarry:total-earned},earned};
}
export function buyWeapon(state,id){
  const weapon=WEAPONS.find(w=>w.id===id);if(!weapon)return null;
  if(state.owned.includes(id))return {...state,equipped:id};
  if(state.coins<weapon.cost||state.merit<weapon.merit)return null;
  return {...state,coins:state.coins-weapon.cost,owned:[...state.owned,id],equipped:id};
}
export function upgrade(state,id){const d=DECOR.find(d=>d.id===id);if(!d)return null;const level=state.decor[id]??0,cost=d.cost*(level+1);if(level>=MAX_DECOR_LEVEL||state.coins<cost)return null;return {...state,coins:state.coins-cost,decor:{...state.decor,[id]:level+1}};}
export function reward(state,result,{id,now=Date.now(),random=Math.random}={}){
  if(!id||state.lastReceipt===id||!result||!Number.isFinite(result.score)||result.score<0)return null;
  const earned=Math.round((20+Math.floor(result.score/60)+(result.fed?5:0)+(result.blessed?5:0))*(1+state.friends.length*.05));
  const merit=12+cap(result.papers)*6+cap(result.qte)*4;const available=FRIENDS.filter(f=>!state.friends.includes(f.id));let friend=null;
  if(available.length&&random()<.35)friend=available[Math.min(available.length-1,Math.floor(random()*available.length))];
  const records=[...state.records,{score:cap(result.score),hits:cap(result.hits),weapon:result.weapon,date:now}].sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,3);
  return {state:{...state,coins:cap(state.coins+earned),merit:cap(state.merit+merit),rituals:cap(state.rituals+1),friends:friend?[...state.friends,friend.id]:state.friends,records,lastReceipt:id},earned,merit,friend};
}
