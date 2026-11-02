import {WEAPONS,DECOR,FRIENDS,MAX_DECOR_LEVEL} from './catalog.js';
import {SKINS,SKIN_USES} from './skins.js';
import {MAX_WEAPON_USES,MAX_COUPONS} from './progress.js';
import {PATRONS,SECRET_WEAPONS,SECRET_DECOR} from './ritual-rewards.js';
import {STORIES} from './neighbourhood.js';
const weaponIds=new Set(WEAPONS.map(i=>i.id)),skinIds=new Set(SKINS.map(i=>i.id)),decorIds=new Set(DECOR.map(i=>i.id)),friendIds=new Set(FRIENDS.map(i=>i.id)),secretIds=new Set([...SECRET_WEAPONS,...SECRET_DECOR].map(i=>i.id));
const fail=()=>{throw new Error('backup-sanity');},object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const integer=(v,max=1e6,min=0)=>{if(!Number.isSafeInteger(v)||v<min||v>max)fail();};
const timestamp=v=>{if(!Number.isFinite(v)||v<0||v>8640000000000000)fail();};
function list(value,ids,max=ids.size){if(!Array.isArray(value)||value.length>max||new Set(value).size!==value.length||value.some(id=>!ids.has(id)))fail();}
// Validate before normalisation: readProgress must not silently clamp forged values.
// Limits come from the live catalog, including legacy stock/coupon allowances.
export function validateBackupProgress(p){
 if(!object(p)||p.version!==1||!object(p.decor))fail();
 for(const key of ['coins','merit','rituals'])integer(p[key]);timestamp(p.lastSeen);
 list(p.owned,weaponIds);if(p.equipped!==undefined&&!p.owned.includes(p.equipped))fail();
 if(p.ownedSkins!==undefined){list(p.ownedSkins,skinIds);if(p.selectedSkin!==undefined&&!p.ownedSkins.includes(p.selectedSkin))fail();}
 for(const [key,ids,owned,max]of [['weaponUses',weaponIds,p.owned,MAX_WEAPON_USES],['skinUses',skinIds,p.ownedSkins??['plain'],SKIN_USES]]){
  if(p[key]===undefined)continue;if(!object(p[key]))fail();for(const [id,uses]of Object.entries(p[key])){if(!ids.has(id)||!owned.includes(id))fail();integer(uses,max,1);}
 }
 for(const [id,level]of Object.entries(p.decor)){if(!decorIds.has(id))fail();integer(level,MAX_DECOR_LEVEL);}
 if(p.decorExpires!==undefined){if(!object(p.decorExpires))fail();for(const [id,at]of Object.entries(p.decorExpires)){if(!decorIds.has(id)||!p.decor[id])fail();timestamp(at);}}
 for(const [key,ids]of [['friends',friendIds],['discovered',secretIds],['favoriteWeapons',weaponIds],['favoriteSkins',skinIds],['altarMissing',decorIds]])if(p[key]!==undefined)list(p[key],ids);
 if(p.altarDecor!==undefined){list(p.altarDecor,decorIds,5);if(p.altarDecor.some(id=>!p.decor[id]))fail();}
 if(p.idleCarry!==undefined&&(!Number.isFinite(p.idleCarry)||p.idleCarry<0||p.idleCarry>=1))fail();
 if(p.coupons!==undefined){if(!Array.isArray(p.coupons)||p.coupons.length>MAX_COUPONS)fail();for(const c of p.coupons){const patron=PATRONS.find(i=>i.id===c?.patron);if(!patron||c.uses!==1||c.discount<=0||![patron.discount,patron.legacyDiscount].includes(c.discount))fail();}}
 if(p.records!==undefined){if(!Array.isArray(p.records)||p.records.length>3)fail();for(const r of p.records){if(!object(r)||!weaponIds.has(r.weapon))fail();integer(r.score);if(r.hits!==undefined)integer(r.hits);timestamp(r.date);}}
 if(p.neighbourhood!==undefined){const n=p.neighbourhood;if(!object(n))fail();if(n.totals!==undefined){if(!object(n.totals))fail();for(const total of Object.values(n.totals))integer(total);}
  if(n.chapters!==undefined){if(!object(n.chapters))fail();for(const [id,chapter]of Object.entries(n.chapters)){const story=STORIES.find(s=>s.id===id);if(!story)fail();integer(chapter,story.chapters.length);}}
  if(n.album!==undefined){if(!Array.isArray(n.album)||n.album.length>24)fail();for(const e of n.album){if(!object(e)||!weaponIds.has(e.weapon)||e.skin!==undefined&&!skinIds.has(e.skin))fail();integer(e.score);if(e.hits!==undefined)integer(e.hits);if(e.perfect!==undefined)integer(e.perfect);if(e.wear!==undefined&&(!Number.isFinite(e.wear)||e.wear<0||e.wear>1))fail();timestamp(e.at);}}
 }
 return true;
}
