import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,readProgress,collectIdle,idleRate,buyWeapon,consumeWeapon,upgrade as upgradeAtTime,reward} from '../src/progress.js';
const upgrade=(state,id)=>upgradeAtTime(state,id,0);
const result={score:600,hits:40,papers:2,qte:1,weapon:'flipflop',fed:true,blessed:true};
test('old decoration levels survive while higher upgrades add only 0.1 per hour',()=>{
 const old={...fresh(0),coins:10000,decor:{neon:1,cat:2,radio:0,incense:1}},restored=readProgress(JSON.stringify(old),0);assert.equal(idleRate(old),9.1);assert.equal(restored.decor.tiger,0);assert.equal(restored.decor.aquarium,0);
 let state=restored;for(const [id,rate,cost]of [['tiger',5,210],['aquarium',6,240]]){const before=state.coins,previousRate=idleRate(state);for(const level of [1,2,3,4,5]){state=upgrade(state,id);assert.equal(state.decor[id],level);assert.equal(idleRate(state),Math.round((previousRate+rate+(level-1)*.1)*10)/10);}assert.equal(before-state.coins,cost*15);assert.equal(upgrade(state,id),null);}
 assert.equal(state.coins,3250);assert.equal(idleRate(state),20.9);assert.equal(collectIdle(state,8*3600000).earned,167);assert.deepEqual(readProgress(JSON.stringify(state),0),state);
});
test('corrupt or unsupported saves fall back safely; malformed fields are clamped and unknown inventory rejected',()=>{for(const raw of ['no','null','{}','{"version":8}'])assert.deepEqual(readProgress(raw,10),fresh(10));const s=readProgress(JSON.stringify({version:1,coins:-100,merit:Infinity,owned:['fake','paper','paper'],equipped:'fake',decor:{cat:99},friends:['driver','fake','driver']}),10);assert.equal(s.coins,0);assert.equal(s.merit,0);assert.deepEqual(s.owned,['flipflop','paper']);assert.equal(s.equipped,'flipflop');assert.equal(s.decor.cat,5);assert.deepEqual(s.friends,['driver']);});
test('oil-money purchases respect merit gates, affordability and free re-equipping of owned kits',()=>{let s=fresh(0);assert.equal(buyWeapon(s,'paper'),null);s={...s,coins:100,merit:40};const bought=buyWeapon(s,'paper');assert.equal(bought.coins,55);assert.equal(bought.equipped,'paper');assert.deepEqual(bought.owned,['flipflop','paper']);const swapped=buyWeapon(bought,'flipflop');assert.equal(swapped.coins,55);assert.equal(swapped.equipped,'flipflop');assert.equal(buyWeapon(s,'fake'),null);assert.equal(s.coins,100);});
test('decor costs rise per level, cap at five, and income rises by tenths',()=>{let s={...fresh(0),coins:3000};for(const level of [1,2,3,4,5]){const before=s.coins;s=upgrade(s,'neon');assert.equal(s.decor.neon,level);assert.equal(before-s.coins,145*level);assert.equal(idleRate(s),2+(level-1)*.1);}assert.equal(upgrade(s,'neon'),null);assert.equal(upgrade(fresh(0),'cat'),null);assert.equal(upgrade(s,'fake'),null);});
test('idle earnings cap at eight hours, keep fractions, never pay twice and tolerate backwards clocks',()=>{const s={...fresh(0),decor:{neon:1,cat:0,radio:0,incense:0}};const half=collectIdle(s,900000);assert.equal(half.earned,0);assert.equal(half.state.idleCarry,.5);const hour=collectIdle(half.state,1800000);assert.equal(hour.earned,1);assert.equal(collectIdle(hour.state,1800000).earned,0);assert.equal(collectIdle(s,20*3600000).earned,16);const backward=collectIdle(hour.state,0);assert.equal(backward.earned,0);assert.equal(backward.state.lastSeen,1800000);});
test('completed rituals give one receipt, merit, positive income and no stored private worry text',()=>{const s=fresh(0),r=reward(s,{...result,worry:'private thought'},{id:'first',now:100,random:()=>.9});assert.equal(r.earned,40);assert.equal(r.merit,28);assert.equal(r.state.rituals,1);assert.equal(r.state.records[0].score,600);assert.ok(!JSON.stringify(r.state).includes('private thought'));assert.equal(reward(r.state,result,{id:'first'}),null);assert.equal(reward(s,{score:-1},{id:'bad'}),null);assert.equal(s.coins,0);});
test('friends never duplicate, affect future tips and all three stories can be collected',()=>{let s=fresh(0);for(let i=0;i<3;i++){const r=reward(s,result,{id:`ritual-${i}`,now:i,random:()=>0});assert.ok(r.friend);s=r.state;}assert.equal(new Set(s.friends).size,3);const r=reward(s,result,{id:'four',random:()=>0});assert.equal(r.friend,null);assert.equal(r.earned,46);assert.equal(r.state.friends.length,3);});
test('three highest records survive reload without storing extra fields',()=>{let s=fresh(0);for(const [i,score]of [40,100,10,80,60].entries())s=reward(s,{...result,score},{id:`r-${i}`,now:100+i,random:()=>.9}).state;assert.deepEqual(s.records.map(r=>r.score),[100,80,60]);assert.deepEqual(readProgress(JSON.stringify(s),200),s);});

test('a saved level-three stall can buy levels four and five without losing its old upgrades',()=>{let s=readProgress(JSON.stringify({...fresh(0),coins:2000,decor:{neon:3,cat:3,radio:3,incense:3}}),0);s=upgrade(s,'neon');assert.equal(s.decor.neon,4);assert.equal(s.coins,1420);s=upgrade(s,'neon');assert.equal(s.decor.neon,5);assert.equal(s.coins,695);assert.equal(upgrade(s,'neon'),null);assert.equal(s.decor.cat,3);assert.equal(readProgress(JSON.stringify(s),0).decor.neon,5);});

test('paid kits are spent once, repurchased at full price, and the free fallback always works',()=>{
 const initial={...fresh(0),coins:1000,merit:1000};const bought=buyWeapon(initial,'paper');const used=consumeWeapon(bought,'paper');
 assert.equal(used.coins,955);assert.deepEqual(used.owned,['flipflop']);assert.equal(used.equipped,'flipflop');assert.equal(consumeWeapon(used,'paper'),null);
 const restored=readProgress(JSON.stringify(used),0);assert.ok(!restored.owned.includes('paper'));const rebought=buyWeapon(restored,'paper');assert.equal(rebought.coins,910);assert.equal(rebought.equipped,'paper');
 assert.equal(consumeWeapon(used,'flipflop'),used);assert.equal(consumeWeapon(used,'unknown'),null);assert.ok(bought.owned.includes('paper'));
});
test('nine decorations earn one through nine in list order and migrate old saves safely',async()=>{
 const {DECOR}=await import('../src/catalog.js');assert.deepEqual(DECOR.map(d=>d.rate),[1,2,3,4,5,6,7,8,9]);assert.deepEqual(DECOR.slice(-2).map(d=>d.id),['money-tree','amethyst']);
 let state=readProgress(JSON.stringify({...fresh(0),coins:10000,decor:{cat:2}}),0);assert.equal(state.decor['money-tree'],0);assert.equal(state.decor.amethyst,0);assert.equal(state.decor.cat,2);
 for(const id of ['money-tree','amethyst'])for(let i=0;i<5;i++)state=upgrade(state,id);
 assert.equal(idleRate(state),21.9);assert.equal(state.coins,400);assert.deepEqual(readProgress(JSON.stringify(state),0),state);
 const max={...fresh(0),decor:Object.fromEntries(DECOR.map(d=>[d.id,5]))};assert.equal(idleRate(max),48.6);assert.equal(collectIdle(max,8*3600000).earned,388);
});

test('decoration base prices each add 100; fractional idle earnings accumulate without loss',async()=>{
 const {DECOR}=await import('../src/catalog.js');assert.deepEqual(DECOR.map(d=>d.cost),[190,145,155,165,210,240,270,300,340]);
 for(const level of [2,3,4,5]){const state={...fresh(0),decor:{neon:level}};assert.equal(idleRate(state),2+(level-1)*.1);let collected=collectIdle(state,3600000);assert.equal(collected.earned,2);assert.equal(collected.state.idleCarry,(level-1)/10);
 for(let hour=2;hour<=10;hour++)collected=collectIdle(collected.state,hour*3600000);
 assert.equal(collected.state.coins,20+level-1);assert.equal(collected.state.idleCarry,0);}
});

test('four new kits use the requested gates and prices, consume once, and survive save/reload',async()=>{
 const {WEAPONS,weaponScoreMultiplier}=await import('../src/catalog.js');
 for(const [id,merit,cost,multiplier]of [['iron-hammer',400,350,4.5],['triple-trio',800,600,7],['marksix-snowball',1000,1000,11],['rebirth-paper',2000,2000,21]]){
  const kit=WEAPONS.find(w=>w.id===id);assert.equal(kit.merit,merit);assert.equal(kit.cost,cost);assert.equal(weaponScoreMultiplier(id),multiplier);
  assert.equal(buyWeapon({...fresh(0),coins:cost,merit:merit-1},id),null);assert.equal(buyWeapon({...fresh(0),coins:cost-1,merit},id),null);
  const bought=buyWeapon({...fresh(0),coins:cost,merit},id);assert.equal(bought.coins,0);assert.equal(bought.merit,merit);assert.equal(readProgress(JSON.stringify(bought),0).equipped,id);
  const used=consumeWeapon(bought,id);assert.ok(!readProgress(JSON.stringify(used),0).owned.includes(id));assert.equal(used.equipped,'flipflop');assert.equal(buyWeapon(used,id),null);
  const rebought=buyWeapon({...used,coins:cost},id);assert.equal(rebought.coins,0);const received=reward(consumeWeapon(rebought,id),{...result,weapon:id},{id:`new-${id}`,now:10,random:()=>.9});assert.equal(readProgress(JSON.stringify(received.state),10).records[0].weapon,id);
 }
 const restored=readProgress(JSON.stringify({...fresh(0),owned:['flipflop','fortune-child'],equipped:'fortune-child'}),0);assert.equal(restored.equipped,'fortune-child');assert.equal(WEAPONS.find(w=>w.id===restored.equipped).name,'Fortune-turning child');
});
