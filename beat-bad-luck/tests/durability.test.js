import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,readProgress,collectIdle,idleRate,upgrade,DECOR_LIFETIME,decorDurability,repairCost,repairDecor,discardDecor} from '../src/progress.js';
const DAY=86400000,close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≈ ${b}`);
function furnished(id='neon',level=1){let state={...fresh(0),coins:100000};for(let i=0;i<level;i++)state=upgrade(state,id,0);return state;}
test('new decorations last thirty real days and age gently, online or offline',()=>{
 const state=furnished();assert.equal(DECOR_LIFETIME,30*DAY);assert.equal(decorDurability(state,'neon',0),100);close(decorDurability(state,'neon',DAY),96+2/3);close(decorDurability(state,'neon',7*DAY),76+2/3);assert.equal(decorDurability(state,'neon',15*DAY),50);assert.equal(decorDurability(state,'neon',30*DAY),0);assert.equal(decorDurability(state,'neon',40*DAY),0);assert.equal(decorDurability(state,'cat',0),0);assert.equal(state.decor.neon,1);
});
test('existing stalls start fresh at migration; subsequent saves do not reset ageing',()=>{
 const old={...fresh(0),coins:900,decor:{neon:4},owned:['flipflop','fortune-child'],equipped:'fortune-child'};delete old.decorExpires;
 const restored=readProgress(JSON.stringify(old),45*DAY);assert.equal(restored.decorExpires.neon,75*DAY);assert.equal(restored.decor.neon,4);assert.equal(restored.coins,900);assert.equal(restored.equipped,'fortune-child');assert.equal(decorDurability(restored,'neon',45*DAY),100);
 const later=readProgress(JSON.stringify(collectIdle(restored,46*DAY).state),46*DAY);assert.equal(later.decorExpires.neon,75*DAY);close(decorDurability(later,'neon',46*DAY),96+2/3);
 const bad=readProgress(JSON.stringify({...old,decorExpires:{neon:Infinity,cat:123}}),50*DAY);assert.equal(bad.decorExpires.neon,80*DAY);assert.equal(bad.decorExpires.cat,undefined);
});
test('offline payouts stop exactly at expiry, then remove the item once',()=>{
 const original=furnished();const state={...original,decorExpires:{neon:2*3600000}};
 const collected=collectIdle(state,8*3600000);assert.equal(collected.earned,4);assert.deepEqual(collected.lost,['neon']);assert.equal(collected.state.decor.neon,0);assert.equal(collected.state.decorExpires.neon,undefined);assert.equal(idleRate(collected.state),0);
 const again=collectIdle(collected.state,10*3600000);assert.equal(again.earned,0);assert.deepEqual(again.lost,[]);assert.equal(state.decor.neon,1);
});
test('repairs price proportional wear and level, require funds, restore thirty days and retain levels',()=>{
 const original=furnished('neon',3),state=collectIdle(original,15*DAY).state,cost=repairCost(state,'neon',15*DAY);assert.equal(cost,430);assert.ok(repairCost(original,'neon',27*DAY)>cost);
 assert.equal(repairDecor({...state,coins:cost-1},'neon',15*DAY),null);const repaired=repairDecor(state,'neon',15*DAY);assert.equal(repaired.coins,state.coins-cost);assert.equal(repaired.decor.neon,3);assert.equal(repaired.decorExpires.neon,45*DAY);assert.equal(decorDurability(repaired,'neon',15*DAY),100);assert.equal(repairCost(repaired,'neon',15*DAY),0);assert.equal(repairDecor(repaired,'neon',15*DAY),null);assert.equal(repairDecor(original,'neon',30*DAY),null);assert.equal(repairDecor(original,'fake',DAY),null);assert.equal(original.decorExpires.neon,30*DAY);
});
test('upgrades preserve remaining lifetime; expired items must be removed before replacement',()=>{
 const state=furnished(),upgraded=upgrade(state,'neon',10*DAY);assert.equal(upgraded.decor.neon,2);assert.equal(upgraded.decorExpires.neon,state.decorExpires.neon);close(decorDurability(upgraded,'neon',10*DAY),66+2/3);
 assert.equal(upgrade(state,'neon',31*DAY),null);const expired=collectIdle(state,31*DAY).state,replaced=upgrade(expired,'neon',31*DAY);assert.equal(replaced.decor.neon,1);assert.equal(replaced.decorExpires.neon,61*DAY);assert.equal(replaced.coins,expired.coins-1145);
});
test('discarding removes levels and durability without refund and prevents future income',()=>{
 const state=collectIdle(furnished('cat',4),DAY).state,discarded=discardDecor(state,'cat');assert.equal(discarded.coins,state.coins);assert.equal(discarded.decor.cat,0);assert.equal(discarded.decorExpires.cat,undefined);assert.equal(collectIdle(discarded,2*DAY).earned,0);assert.equal(discardDecor(discarded,'cat'),null);assert.equal(discardDecor(state,'fake'),null);assert.equal(upgrade(discarded,'cat',DAY).decor.cat,1);assert.equal(state.decor.cat,4);
});
test('items expire independently, capped payouts retain fractions, and backwards clocks cannot heal them',()=>{
 let state=furnished();state=upgrade(state,'radio',0);state.decorExpires={neon:2*3600000,radio:30*DAY};const expired=collectIdle(state,8*3600000);assert.equal(expired.earned,12);assert.equal(expired.state.decor.radio,1);assert.equal(expired.state.decor.neon,0);
 const later=collectIdle(furnished(),10*DAY).state;assert.equal(later.lastSeen,10*DAY);const backwards=collectIdle(readProgress(JSON.stringify(later),5*DAY),5*DAY);assert.equal(backwards.earned,0);assert.equal(backwards.state.lastSeen,10*DAY);close(decorDurability(backwards.state,'neon',5*DAY),decorDurability(later,'neon',10*DAY));
});
