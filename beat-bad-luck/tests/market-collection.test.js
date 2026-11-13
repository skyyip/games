import test from 'node:test';import assert from 'node:assert/strict';
import {MARKET_SKINS,MARKET_WEAPONS,MARKET_PATRONS,MARKET_SECRET_KITS,MARKET_SECRET_DECOR} from '../src/market-collection.js';
import {skinArt} from '../src/skins.js';import {weaponArt,decorArt} from '../src/art.js';import {patronArt} from '../src/celebration-art.js';
import {PATRONS,SECRET_WEAPONS,SECRET_DECOR} from '../src/ritual-rewards.js';
import {fresh,buySkin,buyWeapon,readProgress,skinUses,weaponUses} from '../src/progress.js';
import {inventory,takeGift,receiveGift} from '../src/player-state.js';
import {createBackup,parseBackup} from '../src/backup.js';
test('twenty-four new market collectibles have unique IDs and distinct local vector artwork',()=>{
 const all=[...MARKET_SKINS,...MARKET_WEAPONS,...MARKET_PATRONS.map(([id])=>({id})),...MARKET_SECRET_KITS.map(([id])=>({id})),...MARKET_SECRET_DECOR.map(([id])=>({id}))];assert.equal(all.length,24);assert.equal(new Set(all.map(x=>x.id)).size,24);
 const art=[...MARKET_SKINS.map(x=>skinArt(x.id)),...MARKET_WEAPONS.map(x=>weaponArt(x.id)),...MARKET_PATRONS.map(([id])=>patronArt(id)),...MARKET_SECRET_KITS.map(([id])=>weaponArt(id)),...MARKET_SECRET_DECOR.map(([id])=>decorArt(id))];assert.equal(new Set(art).size,24);for(const svg of art){assert.match(svg,/<svg/);assert.doesNotMatch(svg,/undefined|NaN|<script|<image/);}
 for(const [id] of MARKET_PATRONS){const p=PATRONS.find(p=>p.id===id);assert.ok(p.story&&p.storyEn&&p.weight>0);assert.match(patronArt(id),new RegExp(`data-patron="${id}"`));}
});
test('market papers and kits respect prices and merit gates, retain stock in saves and transfer real gifts',()=>{
 for(const item of [...MARKET_SKINS,...MARKET_WEAPONS]){const paper=MARKET_SKINS.includes(item),buy=paper?buySkin:buyWeapon,uses=paper?skinUses:weaponUses,token=(paper?'s_':'w_')+item.id;
  assert.equal(buy({...fresh(0),coins:item.cost-1,merit:item.merit},item.id),null);if(item.merit)assert.equal(buy({...fresh(0),coins:item.cost,merit:item.merit-1},item.id),null);
  const bought=buy({...fresh(0),coins:item.cost,merit:item.merit},item.id);assert.equal(bought.coins,0);const n=uses(bought,item.id);assert(n>0);assert.equal(uses(readProgress(JSON.stringify(bought),0),item.id),n);
  const transfer=takeGift(bought,token,0),recipient=receiveGift(fresh(0),transfer.item,0);assert.equal(inventory(transfer.state)[token]??0,n-1);assert.equal(inventory(recipient)[token],1);
 }
});
test('market secret props and patrons survive portable backups without changing legacy IDs',async()=>{
 const s=fresh(0);s.friends=MARKET_PATRONS.map(([id])=>id);for(const [id] of MARKET_SECRET_KITS){assert(SECRET_WEAPONS.some(x=>x.id===id));s.discovered.push(id);s.owned.push(id);s.weaponUses[id]=3;}for(const [id] of MARKET_SECRET_DECOR){assert(SECRET_DECOR.some(x=>x.id===id));s.discovered.push(id);s.decor[id]=2;}
 const copy=await parseBackup(await createBackup(s,0),0);assert.deepEqual(copy.discovered,s.discovered);assert.deepEqual(copy.friends,s.friends);assert.equal(copy.weaponUses[MARKET_SECRET_KITS[0][0]],3);assert.equal(copy.decor[MARKET_SECRET_DECOR[0][0]],2);
});
