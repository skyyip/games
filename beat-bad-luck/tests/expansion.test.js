import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS,DECOR,weaponScoreMultiplier,decorHourlyRate} from '../src/catalog.js';
import {fresh,readProgress,buyWeapon,consumeWeapon,reward,upgrade,collectIdle,repairDecor,repairCost,discardDecor,decorDurability,DECOR_LIFETIME} from '../src/progress.js';
const kits=WEAPONS.filter(w=>w.expanded),decor=DECOR.filter(d=>d.expanded),DAY=86400000;
test('all thirty new kits respect both gates, spend one use, repurchase and restore their records',()=>{
 assert.equal(kits.length,30);assert.equal(new Set(WEAPONS.map(w=>w.id)).size,WEAPONS.length);
 for(const kit of kits){
  const before={...fresh(0),coins:kit.cost,merit:kit.merit};
  assert.equal(buyWeapon({...before,coins:kit.cost-1},kit.id),null);
  if(kit.merit)assert.equal(buyWeapon({...before,merit:kit.merit-1},kit.id),null);
  const bought=buyWeapon(before,kit.id);assert.equal(bought.coins,0);assert.equal(bought.merit,kit.merit);
  assert.equal(readProgress(JSON.stringify(bought),0).equipped,kit.id);
  const used=consumeWeapon(bought,kit.id);assert.equal(used.equipped,'bare-hand');assert.ok(!used.owned.includes(kit.id));assert.equal(consumeWeapon(used,kit.id),null);
  const again=buyWeapon({...used,coins:kit.cost},kit.id);assert.equal(again.coins,0);
  const result={score:Math.round(600*weaponScoreMultiplier(kit.id)),hits:40,papers:2,qte:1,weapon:kit.id,fed:true,blessed:true};
  const completed=reward(used,result,{id:kit.id,now:1,random:()=>1});assert.equal(readProgress(JSON.stringify(completed.state),1).records[0].weapon,kit.id);
  assert.equal(before.coins,kit.cost);
 }
});
test('new props fill a coherent increasing bonus ladder without changing the three requested premium bonuses',()=>{
 const sorted=WEAPONS.filter(w=>!w.starter).sort((a,b)=>a.cost-b.cost);
 for(let i=1;i<sorted.length;i++){const a=sorted[i-1],b=sorted[i];if(a.cost===b.cost)assert.equal(weaponScoreMultiplier(a.id),weaponScoreMultiplier(b.id));else assert.ok(weaponScoreMultiplier(a.id)<weaponScoreMultiplier(b.id),`${a.id} → ${b.id}`);}
 assert.deepEqual(['triple-trio','marksix-snowball','rebirth-paper'].map(weaponScoreMultiplier),[10,15,28]);
});
test('eighteen new decorations migrate at zero while preserving existing money, inventory and ageing',()=>{
 assert.equal(decor.length,18);assert.equal(new Set(DECOR.map(d=>d.id)).size,DECOR.length);
 const old={version:1,coins:12345,merit:6000,owned:['marksix-snowball'],equipped:'marksix-snowball',decor:{cat:3},decorExpires:{cat:DECOR_LIFETIME},lastSeen:DAY};
 const migrated=readProgress(JSON.stringify(old),DAY);assert.equal(migrated.coins,12345);assert.equal(migrated.equipped,'marksix-snowball');assert.equal(migrated.decor.cat,3);assert.equal(migrated.decorExpires.cat,DECOR_LIFETIME);
 for(const piece of decor){assert.equal(migrated.decor[piece.id],0);assert.equal(migrated.decorExpires[piece.id],undefined);}
});
test('every new decoration earns fractions, expires exactly, repairs and discards independently',()=>{
 for(const piece of decor){
  const initial={...fresh(0),coins:1000000};assert.equal(upgrade({...initial,coins:piece.cost-1},piece.id,0),null);
  let state=initial;for(let level=1;level<=5;level++){const before=state.coins;state=upgrade(state,piece.id,0);assert.equal(before-state.coins,piece.cost*level);assert.equal(state.decor[piece.id],level);}
  assert.equal(upgrade(state,piece.id,0),null);assert.equal(state.decorExpires[piece.id],DECOR_LIFETIME);
  const hour=collectIdle(state,3600000);assert.equal(hour.earned,Math.floor(decorHourlyRate(piece,5)));assert.equal(hour.state.idleCarry,Math.round(decorHourlyRate(piece,5)%1*1e9)/1e9);
  const aged={...state,lastSeen:15*DAY};assert.equal(decorDurability(aged,piece.id,15*DAY),50);const cost=repairCost(aged,piece.id,15*DAY),fixed=repairDecor(aged,piece.id,15*DAY);assert.equal(fixed.coins,aged.coins-cost);assert.equal(fixed.decor[piece.id],5);assert.equal(fixed.decorExpires[piece.id],45*DAY);
  const expired=collectIdle({...state,lastSeen:DECOR_LIFETIME-3600000},DECOR_LIFETIME+3600000);assert.equal(expired.earned,Math.floor(decorHourlyRate(piece,5)));assert.deepEqual(expired.lost,[piece.id]);assert.equal(expired.state.decor[piece.id],0);
  const discarded=discardDecor(state,piece.id);assert.equal(discarded.coins,state.coins);assert.equal(discarded.decor[piece.id],0);assert.equal(discarded.decorExpires[piece.id],undefined);
 }
});
