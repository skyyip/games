import {SKINS,SKIN_USES} from './skins.js';
import {PATRONS,SECRET_WEAPONS,SECRET_DECOR,weightedPatron,patronBuffs,hkDay} from './ritual-rewards.js';
import {freshNeighbourhood,readNeighbourhood,finishNeighbourhood,STORIES,commissionPay,pruneAlbum} from './neighbourhood.js';
import {WEAPONS,DECOR,FRIENDS,MAX_DECOR_LEVEL,decorUpgradeBase,decorHourlyRate,weaponDurability} from './catalog.js';
const cap=(value,max=1000000)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
export const DECOR_LIFETIME=30*24*3600000;
export const MAX_IDLE_HOURS=18;
const clock=(state,now)=>Math.max(state.lastSeen,now);
const expiry=(state,id,now)=>Number.isFinite(state.decorExpires?.[id])?state.decorExpires[id]:clock(state,now)+DECOR_LIFETIME;
export function decorDurability(state,id,now=Date.now()){return state.decor[id]>0?Math.max(0,Math.min(100,(expiry(state,id,now)-clock(state,now))/DECOR_LIFETIME*100)):0;}
export function repairCost(state,id,now=Date.now()){const item=DECOR.find(d=>d.id===id),health=decorDurability(state,id,now);return item&&health>0&&health<100?Math.max(1,Math.ceil(item.cost*state.decor[id]*.25*(1-health/100))):0;}
export const STORAGE_KEY='beat-bad-luck.stall.v1';
export const WEAPON_USES=3,MAX_WEAPON_USES=999999;
export const weaponUses=(state,id)=>id==='bare-hand'?Infinity:state.owned.includes(id)?cap(state.weaponUses?.[id]??WEAPON_USES,MAX_WEAPON_USES):0;
export function weaponCondition(state,id){const remaining=weaponUses(state,id),capacity=weaponDurability(id);return {remaining,capacity,current:capacity===Infinity?Infinity:remaining>0&&capacity>0?(remaining-1)%capacity+1:0};}
export function fresh(now=Date.now()){return {version:1,ownedSkins:['plain'],skinUses:{},selectedSkin:'plain',coins:0,merit:0,rituals:0,owned:['bare-hand'],weaponUses:{},equipped:'bare-hand',decor:Object.fromEntries(DECOR.map(d=>[d.id,0])),decorExpires:{},friends:[],coupons:[],discovered:[],lastDaily:'',records:[],lastSeen:now,idleCarry:0,lastReceipt:null,neighbourhood:freshNeighbourhood()};}
export function readProgress(raw,now=Date.now()){
  const state=fresh(now);try{const x=JSON.parse(raw);if(!x||x.version!==1)return state;
    state.ownedSkins=[...new Set(['plain',...(Array.isArray(x.ownedSkins)?x.ownedSkins:[]).filter(id=>SKINS.some(s=>s.id===id))])];
    for(const id of state.ownedSkins.filter(id=>id!=='plain')){const value=x.skinUses?.[id];state.skinUses[id]=Number.isFinite(value)?cap(value,SKIN_USES):SKIN_USES;}
    state.ownedSkins=state.ownedSkins.filter(id=>id==='plain'||state.skinUses[id]>0);for(const id of Object.keys(state.skinUses))if(!state.ownedSkins.includes(id))delete state.skinUses[id];state.selectedSkin=state.ownedSkins.includes(x.selectedSkin)?x.selectedSkin:'plain';
    state.lastDaily=typeof x.lastDaily==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.lastDaily)?x.lastDaily:'';state.discovered=[...new Set((Array.isArray(x.discovered)?x.discovered:[]).filter(id=>[...SECRET_WEAPONS,...SECRET_DECOR].some(i=>i.id===id)))];state.coupons=(Array.isArray(x.coupons)?x.coupons:[]).filter(c=>PATRONS.some(f=>f.id===c.patron&&f.discount===c.discount)&&c.uses>0).slice(0,PATRONS.length).map(c=>({patron:c.patron,discount:c.discount,uses:1}));state.coins=cap(x.coins);state.merit=cap(x.merit);state.rituals=cap(x.rituals);state.owned=[...new Set(['bare-hand',...(Array.isArray(x.owned)?x.owned:[]).filter(id=>WEAPONS.some(w=>w.id===id))])];state.equipped=state.owned.includes(x.equipped)?x.equipped:'bare-hand';
    for(const id of state.owned.filter(id=>id!=='bare-hand')){const value=x.weaponUses?.[id];state.weaponUses[id]=Number.isFinite(value)?cap(value,MAX_WEAPON_USES):WEAPON_USES;}
    state.owned=state.owned.filter(id=>id==='bare-hand'||state.weaponUses[id]>0);for(const id of Object.keys(state.weaponUses))if(!state.owned.includes(id))delete state.weaponUses[id];if(!state.owned.includes(state.equipped))state.equipped='bare-hand';
    state.neighbourhood=readNeighbourhood(x.neighbourhood,{weapons:WEAPONS.map(w=>w.id),decor:DECOR.map(d=>d.id),owned:state.owned,rituals:state.rituals,now:Math.max(now,Number.isFinite(x.lastSeen)?x.lastSeen:now)});
    state.lastSeen=Number.isFinite(x.lastSeen)?Math.max(0,x.lastSeen):now;
    for(const d of DECOR){state.decor[d.id]=cap(x.decor?.[d.id],MAX_DECOR_LEVEL);if(state.decor[d.id])state.decorExpires[d.id]=Number.isFinite(x.decorExpires?.[d.id])?Math.max(0,Math.min(Math.max(now,state.lastSeen)+DECOR_LIFETIME,x.decorExpires[d.id])):now+DECOR_LIFETIME;}
    state.friends=[...new Set((Array.isArray(x.friends)?x.friends:[]).filter(id=>FRIENDS.some(f=>f.id===id)))];
    state.records=(Array.isArray(x.records)?x.records:[]).filter(r=>r&&Number.isFinite(r.score)&&r.score>=0&&Number.isFinite(r.date)&&WEAPONS.some(w=>w.id===r.weapon)).map(r=>({score:cap(r.score),date:cap(r.date,8640000000000000),weapon:r.weapon,hits:cap(r.hits)})).sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,3);
    state.idleCarry=Number.isFinite(x.idleCarry)?Math.max(0,Math.min(.999999999,x.idleCarry)):0;state.lastReceipt=typeof x.lastReceipt==='string'?x.lastReceipt.slice(0,80):null;
  }catch{}return state;
}
export const idleRate=state=>Math.round(DECOR.reduce((total,d)=>total+decorHourlyRate(d,state.decor[d.id]??0),0)*100)/100;
export function collectIdle(state,now=Date.now()){
  state={...state,neighbourhood:pruneAlbum(state.neighbourhood,Math.max(state.lastSeen,now))};
  const at=clock(state,now),end=Math.min(at,state.lastSeen+MAX_IDLE_HOURS*3600000),decor={...state.decor},decorExpires={...state.decorExpires},lost=[];let income=state.idleCarry;
  for(const item of DECOR){
    const level=decor[item.id]??0;if(!level){delete decorExpires[item.id];continue;}
    const expires=expiry(state,item.id,now);decorExpires[item.id]=expires;
    const active=Math.max(0,Math.min(end,expires)-state.lastSeen);income+=active/3600000*decorHourlyRate(item,level);
    if(expires<=at){decor[item.id]=0;delete decorExpires[item.id];lost.push(item.id);}
  }
  const total=Math.round(income*1e9)/1e9,earned=Math.floor(total);
  return {state:{...state,decor,decorExpires,coins:cap(state.coins+earned),lastSeen:at,idleCarry:Math.round((total-earned)*1e9)/1e9},earned,lost};
}
export function buyWeapon(state,id,{restock=false}={}){
  const weapon=WEAPONS.find(w=>w.id===id);if(!weapon)return null;
  if(state.owned.includes(id)&&(!restock||!weapon.cost))return {...state,equipped:id};
  if(weapon.hidden)return null;const paid=purchasePrice(state,weapon.cost);if(state.coins<paid||state.merit<weapon.merit)return null;
  const uses=weaponUses(state,id),durability=weaponDurability(id);if(uses>MAX_WEAPON_USES-durability)return null;
  return {...useCoupon(state),neighbourhood:id==='lassie'?{...state.neighbourhood,companions:['lassie']}:state.neighbourhood,coins:state.coins-paid,weaponUses:{...state.weaponUses,[id]:uses+durability},owned:[...new Set([...state.owned,id])],equipped:id};
}
// Call once per ritual, on its first successful hit. Bare hands never wear out.
export function consumeWeapon(state,id){
  const weapon=WEAPONS.find(w=>w.id===id);if(!weapon||!state.owned.includes(id))return null;
  if(!weapon.cost)return state;
  const remaining=weaponUses(state,id)-1,uses={...state.weaponUses};if(remaining)uses[id]=remaining;else delete uses[id];
  return {...state,weaponUses:uses,owned:remaining?state.owned:state.owned.filter(owned=>owned!==id),equipped:!remaining&&state.equipped===id?'bare-hand':state.equipped};
}
export const decorUnlocked=(state,item)=>!item.unlockStory||(state.neighbourhood?.chapters?.[item.unlockStory]??0)>=(STORIES.find(s=>s.id===item.unlockStory)?.chapters.length??Infinity);
export function upgrade(state,id,now=Date.now()){
 const d=DECOR.find(d=>d.id===id);if(!d)return null;if(d.hidden||!decorUnlocked(state,d))return null;const level=state.decor[id]??0,cost=purchasePrice(state,decorUpgradeBase(d,level+1));
 if(level>=MAX_DECOR_LEVEL||state.coins<cost||(level&&decorDurability(state,id,now)<=0))return null;
 return {...useCoupon(state),coins:state.coins-cost,decor:{...state.decor,[id]:level+1},decorExpires:{...state.decorExpires,[id]:level?expiry(state,id,now):clock(state,now)+DECOR_LIFETIME}};
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
  if(!id||(state.lastReceipt===id||state.neighbourhood?.album?.some(e=>e.id===id))||!result||!Number.isFinite(result.score)||result.score<0)return null;
  const buffs=patronBuffs(state),earned=Math.round((20+Math.floor(result.score/60)+(result.fed?5:0)+(result.blessed?5:0))*(1+buffs.oil));
  const merit=Math.round((12+cap(result.papers)*6+cap(result.qte)*4)*(1+buffs.merit));const available=FRIENDS.filter(f=>!state.friends.includes(f.id));let friend=null;
  if(available.length&&random()<.3)friend=weightedPatron(available,random);
  const records=[...state.records,{score:cap(result.score),hits:cap(result.hits),weapon:result.weapon,date:now}].sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,3);
  const journey=finishNeighbourhood(state.neighbourhood??freshNeighbourhood(),result,{id,now});
  const completion=journey.completed,chapter=completion?STORIES.find(s=>s.id===completion.story)?.chapters[completion.chapter-1]:null,story=completion?commissionPay(chapter,completion.finished,completion.replay,completion.bonusMet):{oil:0,merit:0};
  let next={...state,neighbourhood:journey.state,coins:cap(state.coins+earned+story.oil),merit:cap(state.merit+merit+story.merit),rituals:cap(state.rituals+1),friends:friend?[...state.friends,friend.id]:state.friends,coupons:friend?.discount?[...(state.coupons??[]),{patron:friend.id,discount:friend.discount,uses:1}]:state.coupons??[],records,lastReceipt:id};
  const gift=completion?.finished&&!completion.replay?STORIES.find(s=>s.id===completion.story)?.decorGift:null;if(gift&&!state.decor[gift])next={...next,decor:{...next.decor,[gift]:1},decorExpires:{...next.decorExpires,[gift]:now+DECOR_LIFETIME}};
  let secret=null;if(random()<.06){const pool=[...SECRET_WEAPONS,...SECRET_DECOR],unseen=pool.filter(i=>!(state.discovered??[]).includes(i.id)),choices=unseen.length?unseen:pool;secret=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];next={...next,discovered:[...new Set([...(state.discovered??[]),secret.id])]};if(SECRET_WEAPONS.includes(secret))next={...next,owned:[...new Set([...next.owned,secret.id])],weaponUses:{...next.weaponUses,[secret.id]:Math.min(MAX_WEAPON_USES,weaponUses(next,secret.id)+weaponDurability(secret.id))}};else next={...next,decor:{...next.decor,[secret.id]:Math.min(MAX_DECOR_LEVEL,(next.decor[secret.id]??0)+1)},decorExpires:{...next.decorExpires,[secret.id]:next.decorExpires[secret.id]??now+DECOR_LIFETIME}};}
  return {journey,gift,state:next,earned:earned+story.oil,merit:merit+story.merit,story,friend,secret,buffs};
}
export const purchasePrice=(state,base)=>Math.ceil(base*(1-patronBuffs(state).discount));
function useCoupon(state){const coupons=[...(state.coupons??[])],best=coupons.reduce((a,c)=>!a||c.discount>a.discount?c:a,null);return best?{...state,coupons:coupons.filter(c=>c!==best)}:state;}
export function dailyReward(state,now=Date.now()){const day=hkDay(now);return state.lastDaily>=day?null:{...state,coins:cap(state.coins+20),merit:cap(state.merit+30),lastDaily:day};}

export const skinUses=(state,id)=>id==='plain'?Infinity:state.ownedSkins.includes(id)?cap(state.skinUses?.[id]??SKIN_USES,SKIN_USES):0;
export function buySkin(state,id){const skin=SKINS.find(s=>s.id===id);if(!skin)return null;if(state.ownedSkins.includes(id))return {...state,selectedSkin:id};const cost=purchasePrice(state,skin.cost);if(state.coins<cost)return null;return {...useCoupon(state),coins:state.coins-cost,ownedSkins:[...state.ownedSkins,id],skinUses:{...state.skinUses,[id]:SKIN_USES},selectedSkin:id};}
export function consumeSkin(state,id){if(!SKINS.some(s=>s.id===id)||!state.ownedSkins.includes(id))return null;if(id==='plain')return state;const remaining=skinUses(state,id)-1,uses={...state.skinUses};if(remaining)uses[id]=remaining;else delete uses[id];return {...state,skinUses:uses,ownedSkins:remaining?state.ownedSkins:state.ownedSkins.filter(s=>s!==id),selectedSkin:!remaining&&state.selectedSkin===id?'plain':state.selectedSkin};}
