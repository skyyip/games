import {fresh,readProgress,weaponUses,skinUses,MAX_WEAPON_USES,DECOR_LIFETIME,decorDurability,claimAvailableSets} from './progress.js';
import {WEAPONS,DECOR,MAX_DECOR_LEVEL} from './catalog.js';
import {SKINS,SKIN_USES} from './skins.js';
export const PLAYER_PREFIX='beat-bad-luck.players.v1',GIFT_LIMIT=10;
export const hkDay=timestamp=>Math.floor((timestamp+8*3600000)/86400000);
export function playerName(value){return [...String(value??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim()].slice(0,20).join('');}
export const scopeKey=uid=>uid?PLAYER_PREFIX+'.'+encodeURIComponent(uid):'beat-bad-luck.stall.v1';
export const GIFT_ITEMS=[...SKINS.filter(x=>!x.starter).map(x=>({...x,kind:'skin',token:'s_'+x.id})),...WEAPONS.filter(x=>!x.starter&&x.id!=='bare-hand').map(x=>({...x,kind:'weapon',token:'w_'+x.id})),...DECOR.map(x=>({...x,kind:'decor',token:'d_'+x.id}))];
export const giftItem=token=>GIFT_ITEMS.find(x=>x.token===token);
export function inventory(s){const result={};for(const item of GIFT_ITEMS){const n=item.kind==='skin'?skinUses(s,item.id):item.kind==='weapon'?weaponUses(s,item.id):s.decor[item.id]??0;if(n>0&&Number.isFinite(n))result[item.token]=n;}return result;}
export function packState(s){return JSON.stringify(readProgress(JSON.stringify(s)));}
export function unpackState(payload){if(typeof payload!=='string'||payload.length>750000)throw Error('invalid-save');let value;try{value=JSON.parse(payload);}catch{throw Error('invalid-save');}if(value?.version!==1)throw Error('invalid-save');return readProgress(payload);}
export function giftOptions(s,now=Date.now()){const inv=inventory(s);return GIFT_ITEMS.filter(i=>(inv[i.token]??0)>0&&(i.kind!=='decor'||decorDurability(s,i.id,now)>0)).map(i=>({...i,available:inv[i.token],amount:i.kind==='decor'?s.decor[i.id]:1}));}
export function takeGift(source,token,now=Date.now()){const item=giftItem(token);if(!item)throw Error('invalid-item');const s=readProgress(JSON.stringify(source),now),before=inventory(s)[token]??0;if(before<1)throw Error('item-unavailable');const amount=item.kind==='decor'?before:1;let lifeMs=0;
 if(item.kind==='skin'){s.skinUses[item.id]--;if(!s.skinUses[item.id]){s.ownedSkins=s.ownedSkins.filter(id=>id!==item.id);delete s.skinUses[item.id];if(s.selectedSkin===item.id)s.selectedSkin='plain';}}
 if(item.kind==='weapon'){s.weaponUses[item.id]--;if(!s.weaponUses[item.id]){s.owned=s.owned.filter(id=>id!==item.id);delete s.weaponUses[item.id];if(s.equipped===item.id)s.equipped='bare-hand';}}
 if(item.kind==='decor'){lifeMs=DECOR_LIFETIME;s.decor[item.id]=0;delete s.decorExpires[item.id];s.altarDecor=s.altarDecor.filter(id=>id!==item.id);s.neighbourhood.layout=s.neighbourhood.layout?.filter(id=>id!==item.id)??[];}
 return {state:readProgress(JSON.stringify(s),now),item:{token,kind:item.kind,itemId:item.id,amount,lifeMs}};
}
export function receiveGift(source,gift,now=Date.now()){const item=giftItem(gift.token);if(!item||item.kind!==gift.kind||item.id!==gift.itemId||!Number.isInteger(gift.amount)||gift.amount<1||gift.amount>(item.kind==='decor'?MAX_DECOR_LEVEL:1)||!Number.isInteger(gift.lifeMs)||gift.lifeMs<0||gift.lifeMs>DECOR_LIFETIME||item.kind==='decor'&&!gift.lifeMs||item.kind!=='decor'&&gift.lifeMs!==0)throw Error('invalid-item');const s=readProgress(JSON.stringify(source),now);
 if(item.kind==='weapon'){if(weaponUses(s,item.id)+gift.amount>MAX_WEAPON_USES)throw Error('inventory-full');const n=weaponUses(s,item.id);s.owned=[...new Set([...s.owned,item.id])];s.weaponUses[item.id]=n+gift.amount;}
 if(item.kind==='skin'){if(skinUses(s,item.id)+gift.amount>SKIN_USES)throw Error('inventory-full');const n=skinUses(s,item.id);s.ownedSkins=[...new Set([...s.ownedSkins,item.id])];s.skinUses[item.id]=n+gift.amount;}
 if(item.kind==='decor'){const old=s.decor[item.id]??0;if(old+gift.amount>MAX_DECOR_LEVEL)throw Error('inventory-full');s.decor[item.id]=old+gift.amount;s.decorExpires[item.id]=old?Math.min(s.decorExpires[item.id]??now+DECOR_LIFETIME,now+gift.lifeMs):now+gift.lifeMs;}
 return claimAvailableSets(readProgress(JSON.stringify(s),now),now).state;
}
