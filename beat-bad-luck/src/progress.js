import {WEAPONS,DECOR,FRIENDS,MAX_DECOR_LEVEL,decorHourlyRate} from './catalog.js';
const cap=(value,max=1000000)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
export const DECOR_LIFETIME=30*24*3600000;
const clock=(state,now)=>Math.max(state.lastSeen,now);
const expiry=(state,id,now)=>Number.isFinite(state.decorExpires?.[id])?state.decorExpires[id]:clock(state,now)+DECOR_LIFETIME;
export function decorDurability(state,id,now=Date.now()){return state.decor[id]>0?Math.max(0,Math.min(100,(expiry(state,id,now)-clock(state,now))/DECOR_LIFETIME*100)):0;}
export function repairCost(state,id,now=Date.now()){const item=DECOR.find(d=>d.id===id),health=decorDurability(state,id,now);return item&&health>0&&health<100?Math.max(1,Math.ceil(item.cost*state.decor[id]*.25*(1-health/100))):0;}
export const STORAGE_KEY='beat-bad-luck.stall.v1';
export function fresh(now=Date.now()){return {version:1,coins:0,merit:0,rituals:0,owned:['bare-hand'],equipped:'bare-hand',decor:Object.fromEntries(DECOR.map(d=>[d.id,0])),decorExpires:{},friends:[],records:[],lastSeen:now,idleCarry:0,lastReceipt:null};}
export function readProgress(raw,now=Date.now()){
  const state=fresh(now);try{const x=JSON.parse(raw);if(!x||x.version!==1)return state;
    state.coins=cap(x.coins);state.merit=cap(x.merit);state.rituals=cap(x.rituals);state.owned=[...new Set(['bare-hand',...(Array.isArray(x.owned)?x.owned:[]).filter(id=>WEAPONS.some(w=>w.id===id))])];state.equipped=state.owned.includes(x.equipped)?x.equipped:'bare-hand';
    state.lastSeen=Number.isFinite(x.lastSeen)?Math.max(0,x.lastSeen):now;
    for(const d of DECOR){state.decor[d.id]=cap(x.decor?.[d.id],MAX_DECOR_LEVEL);if(state.decor[d.id])state.decorExpires[d.id]=Number.isFinite(x.decorExpires?.[d.id])?Math.max(0,Math.min(Math.max(now,state.lastSeen)+DECOR_LIFETIME,x.decorExpires[d.id])):now+DECOR_LIFETIME;}
    state.friends=[...new Set((Array.isArray(x.friends)?x.friends:[]).filter(id=>FRIENDS.some(f=>f.id===id)))];
    state.records=(Array.isArray(x.records)?x.records:[]).filter(r=>r&&Number.isFinite(r.score)&&r.score>=0&&Number.isFinite(r.date)&&WEAPONS.some(w=>w.id===r.weapon)).map(r=>({score:cap(r.score),date:cap(r.date,8640000000000000),weapon:r.weapon,hits:cap(r.hits)})).sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,3);
    state.idleCarry=Number.isFinite(x.idleCarry)?Math.max(0,Math.min(.999999999,x.idleCarry)):0;state.lastReceipt=typeof x.lastReceipt==='string'?x.lastReceipt.slice(0,80):null;
  }catch{}return state;
}
export const idleRate=state=>Math.round(DECOR.reduce((total,d)=>total+decorHourlyRate(d,state.decor[d.id]??0),0)*10)/10;
export function collectIdle(state,now=Date.now()){
  const at=clock(state,now),end=Math.min(at,state.lastSeen+8*3600000),decor={...state.decor},decorExpires={...state.decorExpires},lost=[];let income=state.idleCarry;
  for(const item of DECOR){
    const level=decor[item.id]??0;if(!level){delete decorExpires[item.id];continue;}
    const expires=expiry(state,item.id,now);decorExpires[item.id]=expires;
    const active=Math.max(0,Math.min(end,expires)-state.lastSeen);income+=active/3600000*decorHourlyRate(item,level);
    if(expires<=at){decor[item.id]=0;delete decorExpires[item.id];lost.push(item.id);}
  }
  const total=Math.round(income*1e9)/1e9,earned=Math.floor(total);
  return {state:{...state,decor,decorExpires,coins:cap(state.coins+earned),lastSeen:at,idleCarry:Math.round((total-earned)*1e9)/1e9},earned,lost};
}
export function buyWeapon(state,id){
  const weapon=WEAPONS.find(w=>w.id===id);if(!weapon)return null;
  if(state.owned.includes(id))return {...state,equipped:id};
  if(state.coins<weapon.cost||state.merit<weapon.merit)return null;
  return {...state,coins:state.coins-weapon.cost,owned:[...state.owned,id],equipped:id};
}
// An unused kit can be equipped freely; its first whack spends the whole ritual use.
export function consumeWeapon(state,id){
  const weapon=WEAPONS.find(w=>w.id===id);if(!weapon||!state.owned.includes(id))return null;
  if(!weapon.cost)return state;
  return {...state,owned:state.owned.filter(owned=>owned!==id),equipped:state.equipped===id?'bare-hand':state.equipped};
}
export function upgrade(state,id,now=Date.now()){
 const d=DECOR.find(d=>d.id===id);if(!d)return null;const level=state.decor[id]??0,cost=d.cost*(level+1);
 if(level>=MAX_DECOR_LEVEL||state.coins<cost||(level&&decorDurability(state,id,now)<=0))return null;
 return {...state,coins:state.coins-cost,decor:{...state.decor,[id]:level+1},decorExpires:{...state.decorExpires,[id]:level?expiry(state,id,now):clock(state,now)+DECOR_LIFETIME}};
}
export function repairDecor(state,id,now=Date.now()){
 const cost=repairCost(state,id,now);if(!cost||state.coins<cost)return null;
 return {...state,coins:state.coins-cost,decorExpires:{...state.decorExpires,[id]:clock(state,now)+DECOR_LIFETIME}};
}
export function discardDecor(state,id){
 if(!DECOR.some(d=>d.id===id)||!state.decor[id])return null;
 const decorExpires={...state.decorExpires};delete decorExpires[id];return {...state,decor:{...state.decor,[id]:0},decorExpires};
}
export function reward(state,result,{id,now=Date.now(),random=Math.random}={}){
  if(!id||state.lastReceipt===id||!result||!Number.isFinite(result.score)||result.score<0)return null;
  const earned=Math.round((20+Math.floor(result.score/60)+(result.fed?5:0)+(result.blessed?5:0))*(1+state.friends.length*.05));
  const merit=12+cap(result.papers)*6+cap(result.qte)*4;const available=FRIENDS.filter(f=>!state.friends.includes(f.id));let friend=null;
  if(available.length&&random()<.35)friend=available[Math.min(available.length-1,Math.floor(random()*available.length))];
  const records=[...state.records,{score:cap(result.score),hits:cap(result.hits),weapon:result.weapon,date:now}].sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,3);
  return {state:{...state,coins:cap(state.coins+earned),merit:cap(state.merit+merit),rituals:cap(state.rituals+1),friends:friend?[...state.friends,friend.id]:state.friends,records,lastReceipt:id},earned,merit,friend};
}
